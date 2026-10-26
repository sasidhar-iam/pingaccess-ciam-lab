import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fingerprint,routeTokenRequest} from '../src/refresh-migration-router.mjs';
const key=Buffer.alloc(32,7); // Synthetic test-only index key, never a deployment secret.
function sample(store='legacy'){
 const token='synthetic-refresh-token';
 return {request:{method:'POST',contentType:'application/x-www-form-urlencoded',clientId:'adr-001',grantType:'refresh_token',refreshToken:token},
 auth:{clientAuthenticated:true,senderConstraintVerified:true,clientId:'adr-001',senderKeyId:'cert-key-001'},
 registration:{clientId:'adr-001',status:'active',allowedGrantTypes:['authorization_code','refresh_token'],allowedScopes:['accounts:read'],newIssuanceEnabled:true,legacyExchangeEnabled:false},
 record:{store,status:'active',clientId:'adr-001',senderKeyId:'cert-key-001',expiresAt:2000,consentId:'consent-001',scopes:['accounts:read']},indexKey:key,now:1000,
 consentActive:async()=>true,lookup:async digest=>{assert.equal(digest,fingerprint(token,key));return null;}};
}
async function run(x){return routeTokenRequest({...x,lookup:async digest=>{assert.equal(digest,fingerprint(x.request.refreshToken,key));return x.record;}});}
test('legacy refresh stays on legacy service until enabled',async()=>assert.equal((await run(sample())).target,'LEGACY_TOKEN_SERVICE'));
test('eligible legacy refresh uses exchange adapter',async()=>{const x=sample();x.registration.legacyExchangeEnabled=true;assert.equal((await run(x)).target,'LEGACY_EXCHANGE_ADAPTER');});
test('directory refresh uses group PF',async()=>assert.equal((await run(sample('directory'))).target,'GROUP_PF_TOKEN'));
test('new authorization code uses group PF without a token-index lookup',async()=>{const x=sample();x.request.grantType='authorization_code';x.lookup=async()=>{throw Error('must not lookup');};assert.equal((await routeTokenRequest(x)).target,'GROUP_PF_TOKEN');});
test('spoofed client id rejected',async()=>{const x=sample();x.request.clientId='other';assert.equal((await run(x)).reason,'client_mismatch');});
test('failed client authentication or sender proof rejects',async()=>{for(const field of ['clientAuthenticated','senderConstraintVerified']){const x=sample();x.auth[field]=false;assert.equal((await run(x)).httpStatus,401);}});
test('token belongs to another client or sender',async()=>{for(const field of ['clientId','senderKeyId']){const x=sample();x.record[field]='other';assert.equal((await run(x)).reason,'invalid_grant');}});
test('revoked and expired tokens rejected',async()=>{const x=sample();x.record.status='revoked';assert.equal((await run(x)).reason,'invalid_grant');x.record.status='active';x.record.expiresAt=x.now;assert.equal((await run(x)).reason,'invalid_grant');});
test('revoked consent rejects',async()=>{const x=sample();x.consentActive=async()=>false;assert.equal((await run(x)).reason,'invalid_grant');});
test('scope escalation rejects',async()=>{const x=sample();x.request.scopes=['payments:write'];assert.equal((await run(x)).reason,'invalid_scope');});
test('unknown token does not probe another backend',async()=>{const x=sample();assert.equal((await routeTokenRequest(x)).reason,'invalid_grant');});
test('index outage does not fall back',async()=>{const x=sample();x.lookup=async()=>{throw Error('outage');};assert.equal((await routeTokenRequest(x)).httpStatus,503);});
test('pending migration does not issue a second token',async()=>{const x=sample();x.record.status='pending';assert.equal((await run(x)).reason,'migration_in_progress');});
test('consent outage fails closed',async()=>{const x=sample();x.consentActive=async()=>{throw Error('outage');};assert.equal((await run(x)).httpStatus,503);});
test('raw token is absent from routing output',async()=>{const x=sample();assert(!JSON.stringify(await run(x)).includes(x.request.refreshToken));});
test('wrong method or media type rejected',async()=>{const x=sample();x.request.method='GET';assert.equal((await run(x)).reason,'invalid_request');});
test('fingerprint uses exact opaque token and keyed digest',()=>{assert.equal(fingerprint('token',key).length,64);assert.notEqual(fingerprint('token',key),fingerprint('Token',key));assert.throws(()=>fingerprint('x',Buffer.alloc(5)));});
