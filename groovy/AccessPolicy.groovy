/** Invoke only with claims supplied by a cryptographically validating gateway filter. */
class AccessPolicy {
 static boolean permits(Map claims, String requiredScope, long nowSeconds) {
  if (!claims || !(claims.sub instanceof String) || !claims.sub.trim()) return false
  if (!(claims.exp instanceof Number) || claims.exp <= nowSeconds) return false
  if (!(claims.scope instanceof String)) return false
  return claims.scope.tokenize(' ').contains(requiredScope)
 }
}
