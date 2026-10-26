# PingAccess CIAM Lab

Access-policy examples and a starting point for PingAccess integration. The JavaScript and Groovy functions work on claims that a trusted gateway has already validated. They do not authenticate a caller or validate JWT signatures.

## Run

Requires Node.js 20 or later. From this folder:

```sh
npm test
```

With Groovy installed:

```sh
groovy -cp groovy groovy/AccessPolicyTest.groovy
```

## What is included

- Exact-scope and expiry checks with negative tests.
- An equivalent Groovy teaching example with its own checks.
- A vendor-neutral accounts-route processing contract.
- [Upgrade considerations](docs/UPGRADE-IMPACT.md).

`routes/accounts.design.json` is a design, not an importable PingAccess configuration. The JavaScript policy is a standalone teaching module, not a PingAccess plugin. No vendor SDK adapter is included.

## Next integration

Implement the version-specific SDK adapter, verify trusted claim mapping, test 401 versus 403 responses, and record the PingAccess/JVM/SDK versions. Test Groovy separately; the Node tests do not execute Groovy. Do not assume PingGateway/ForgeRock IG route formats work in PingAccess.

Use synthetic data. Read [Contributing](CONTRIBUTING.md), [Security](SECURITY.md), and the [MIT License](LICENSE).
