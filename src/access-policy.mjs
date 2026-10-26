// Claims must already have passed cryptographic validation in a trusted gateway.
export function decide(claims, requiredScope, nowSeconds) {
  if (!Number.isFinite(nowSeconds)) return {allowed:false,reason:'invalid_clock'};
  if (!claims || typeof claims.sub !== 'string' || !claims.sub.trim() ||
      !Number.isFinite(claims.exp) || claims.exp <= nowSeconds) {
    return {allowed:false,reason:'invalid_claims'};
  }
  if (typeof requiredScope !== 'string' || !requiredScope || /\s/.test(requiredScope)) {
    return {allowed:false,reason:'invalid_policy'};
  }
  const scopes = typeof claims.scope === 'string' ? claims.scope.split(' ').filter(Boolean) : [];
  return scopes.includes(requiredScope) ? {allowed:true,reason:'permitted'} : {allowed:false,reason:'insufficient_scope'};
}
