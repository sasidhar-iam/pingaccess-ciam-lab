# PingAccess CIAM Lab

Open Banking refresh-token migration and API access policies.

[![Verify examples](https://github.com/sasidhar-iam/pingaccess-ciam-lab/actions/workflows/test.yml/badge.svg)](https://github.com/sasidhar-iam/pingaccess-ciam-lab/actions/workflows/test.yml)
[MIT License](LICENSE) · [Report a problem](https://github.com/sasidhar-iam/pingaccess-ciam-lab/issues) · [Contribute](CONTRIBUTING.md)

## Practical scenarios

| Scenario | Start here |
| --- | --- |
| Keep an ADR token endpoint stable during grant-store migration | [Organic refresh-token migration](docs/open-banking-refresh-migration.md) |
| Choose legacy service, exchange adapter or Group PF | [Tested route-decision model](src/refresh-migration-router.mjs) |
| Restrict a protected API by method and scope | [PingAccess matcher snippets](pingaccess-rules/) |
| Test routing failures, consent withdrawal and client binding | [Routing tests](test/refresh-migration-router.test.mjs) |

The code uses synthetic data. Runnable local models, documented vendor commands and unfinished integrations are labelled separately.


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

## Open Banking organic migration example

Read the [refresh-token migration design](docs/open-banking-refresh-migration.md). It includes a tested server-side route-decision model for legacy and directory-backed grants, two PingAccess matcher snippets, binding checks, failure cases and migration recovery requirements. The model does not issue tokens or connect to a database.

## Related CIAM labs

- [PingAccess](https://github.com/sasidhar-iam/pingaccess-ciam-lab)
- [PingDirectory](https://github.com/sasidhar-iam/pingdirectory-ciam-lab)
- [PingFederate and cloud identity](https://github.com/sasidhar-iam/ping-identity-ciam-lab)
- [Banking IAM overview and release-impact guide](https://github.com/sasidhar-iam/banking-iam-repo)
