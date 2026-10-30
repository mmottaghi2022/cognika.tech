# Workflow: full website audit

## Inputs
- Target domain and preferred hostname.
- Repository/codebase access, if available.
- Environment (local, staging, production).
- User's goal and any restrictions.

## Procedure

1. Confirm scope and authorization. Identify production versus staging.
2. Inspect the repository structure, framework, build process, routing, rendering, and deployment model where access exists.
3. Inspect the live website: homepage, navigation, representative page templates, project/service pages, contact journey, and important assets.
4. Check HTTP/TLS, redirects, response codes, canonical URLs, robots directives, sitemap, and indexability.
5. Inspect titles, descriptions, headings, language, internal links, images, semantic HTML, and structured data.
6. Check rendering and whether important content is available to crawlers.
7. Assess mobile behavior, performance, and accessibility.
8. Review AI-search discoverability and crawler policies using current official documentation.
9. Assess agent readiness across readable, structured, queryable, and action-capable levels.
10. Record evidence, limitations, severity, confidence, effort, and recommended remediation.
11. Produce the audit report using `../templates/audit-report.md`.

## Completion criteria

- All important page types have been inspected.
- Findings include evidence and affected URLs/components.
- Unverified assumptions are labelled.
- No site changes have been made unless separately authorized.
