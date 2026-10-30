# Web security and safe operations

## Protect sensitive information

- Never print, commit, or publish secrets, tokens, private keys, passwords, session cookies, or private customer data.
- Do not place secrets in frontend code, public repositories, public API examples, or reports.
- If a secret is exposed, stop and advise rotation through the owner's approved process.

## Scope and authorization

- Confirm the authorized target domain, repository, and environment.
- Treat production and staging as separate environments.
- Do not probe systems outside the authorized scope.
- Do not perform destructive tests, load tests, exploit attempts, or intrusive scans without explicit authorization.

## Change safety

- Inspect version control status before editing.
- Create a backup or use a reversible commit/branch.
- Make small, reviewable changes.
- Avoid broad permission changes and unnecessary dependencies.
- Preserve existing authentication and access controls.
- Do not change DNS, nameservers, email, billing, or infrastructure settings without approval.
- Obtain approval before production deployment or changes with material security, legal, financial, or business impact.

## Reporting

Do not include secret values in reports. Describe the location and type of issue safely, and recommend remediation. Include rollback instructions for significant changes.
