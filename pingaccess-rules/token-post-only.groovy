// Regular Groovy rule: method restriction only, not authentication or migration.
// Bind to the intended token resource. Use a protocol-appropriate rejection handler.
def methodName = exc?.request?.method?.methodName()
if (methodName == "POST") {
    pass()
} else {
    fail()
}
