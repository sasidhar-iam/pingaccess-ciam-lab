// OAuth Groovy rule for an API resource AFTER configured access-token validation.
// This is a resource API check, not token-endpoint client authentication.
// Documentation baseline: PingAccess 9.1 matcher usage reference.
def methodName = exc?.request?.method?.methodName()
if (methodName == "GET") {
    hasScope("accounts:read")
} else {
    fail()
}
