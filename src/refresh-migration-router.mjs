import {createHmac} from 'node:crypto';

export function fingerprint(token,key){
  if(typeof token!=='string'||!token||token.length>8192||/[\r\n\0]/.test(token))throw new Error('invalid_token');
  if(!Buffer.isBuffer(key)||key.length<32)throw new Error('index_key_required');
  return createHmac('sha256',key).update(token,'utf8').digest('hex');
}
const reject=(reason,httpStatus=400)=>({action:'reject',reason,httpStatus});
const forward=target=>({action:'forward',target});

// Trusted in-process inputs only. No endpoint, authentication or token issuance is implemented.
// Index lookup is authoritative metadata; the selected AS must still validate the grant.
export async function routeTokenRequest({request,auth,registration,indexKey,lookup,consentActive,now}){
  if(request?.method!=='POST'||request.contentType!=='application/x-www-form-urlencoded')return reject('invalid_request');
  if(auth?.clientAuthenticated!==true||auth.senderConstraintVerified!==true||typeof auth.clientId!=='string'||!auth.clientId||typeof auth.senderKeyId!=='string'||!auth.senderKeyId)return reject('invalid_client',401);
  if(!registration||registration.clientId!==auth.clientId||registration.status!=='active')return reject('unauthorized_client',401);
  if(request.clientId!==auth.clientId)return reject('client_mismatch',401);
  if(!Number.isFinite(now))return reject('invalid_clock',503);
  if(!Array.isArray(registration.allowedGrantTypes)||!registration.allowedGrantTypes.includes(request.grantType))return reject('unsupported_grant');
  if(request.grantType==='authorization_code'){
    // Group PF validates the actual code, redirect URI, PKCE and new consent.
    return registration.newIssuanceEnabled===true?forward('GROUP_PF_TOKEN'):reject('new_issuance_disabled');
  }
  if(request.grantType!=='refresh_token')return reject('unsupported_grant');
  let digest;
  try{digest=fingerprint(request.refreshToken,indexKey);}catch{return reject('invalid_request');}
  let record;
  try{record=await lookup(digest);}catch{return reject('routing_dependency_unavailable',503);}
  if(!record)return reject('invalid_grant');
  if(record.status==='pending')return reject('migration_in_progress',503);
  if(record.status!=='active'||!Number.isFinite(record.expiresAt)||record.expiresAt<=now)return reject('invalid_grant');
  if(record.clientId!==auth.clientId||record.senderKeyId!==auth.senderKeyId)return reject('invalid_grant');
  if(typeof record.consentId!=='string'||!record.consentId)return reject('invalid_grant');
  const scopeList=x=>Array.isArray(x)&&x.every(s=>typeof s==='string'&&s.length>0&&!/\s/.test(s));
  if(!scopeList(record.scopes)||!scopeList(registration.allowedScopes))return reject('invalid_scope');
  const scopes=request.scopes===undefined?record.scopes:request.scopes;
  if(!scopeList(scopes)||scopes.some(s=>!record.scopes.includes(s)||!registration.allowedScopes.includes(s)))return reject('invalid_scope');
  try{if(await consentActive(record.consentId,auth.clientId)!==true)return reject('invalid_grant');}
  catch{return reject('consent_dependency_unavailable',503);}
  if(record.store==='directory')return forward('GROUP_PF_TOKEN');
  if(record.store==='legacy')return forward(registration.legacyExchangeEnabled===true?'LEGACY_EXCHANGE_ADAPTER':'LEGACY_TOKEN_SERVICE');
  return reject('unknown_store',503);
}
