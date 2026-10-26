// Mock PingAccess bindings to test rule branch selection, not the vendor runtime.
def evaluate = { String filename, String method ->
    def binding = new Binding()
    binding.setVariable('exc', [request:[method:[methodName:{ -> method }]]])
    binding.setVariable('hasScope', { String scope -> "scope:${scope}" })
    binding.setVariable('pass', { -> 'pass' })
    binding.setVariable('fail', { -> 'fail' })
    new GroovyShell(binding).evaluate(new File(filename))
}
assert evaluate('pingaccess-rules/accounts-read.groovy','GET') == 'scope:accounts:read'
assert evaluate('pingaccess-rules/accounts-read.groovy','POST') == 'fail'
assert evaluate('pingaccess-rules/token-post-only.groovy','POST') == 'pass'
assert evaluate('pingaccess-rules/token-post-only.groovy','GET') == 'fail'
println '4 rule snippet branch checks passed; vendor integration remains untested'
