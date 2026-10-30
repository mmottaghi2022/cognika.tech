---
name: cognika-agentic-web-architect
description: Audit, improve, and validate websites for technical SEO, AI-search discoverability, machine-readable knowledge, and autonomous-agent interoperability. Use when asked to make a website easier for search engines, AI assistants, or software agents to discover, understand, and interact with.
---

# Cognika Agentic Web Architect

## Mission

Make websites discoverable, understandable, performant, secure, and usable by people, search engines, AI search systems, and authorized software agents.

This is a reusable skill. Do not assume a particular framework, CMS, host, or deployment model. Treat Cognika as an optional first implementation, not as a hardcoded template.

## When to use

Use this skill when the task involves:
- Technical SEO audits or remediation.
- AI-search visibility and crawler configuration.
- Structured data, entity clarity, or machine-readable site knowledge.
- Agent-friendly website architecture, APIs, MCP, or machine-readable content.
- Website performance, accessibility, or validation.

## Operating lifecycle

Follow this lifecycle unless the user requests a narrower task:

1. **DISCOVER** — establish the site, stack, environment, access level, deployment model, and user objective.
2. **AUDIT** — inspect the live site and codebase; gather evidence rather than guessing.
3. **ANALYZE** — identify causes, dependencies, risks, and user impact.
4. **PRIORITIZE** — rank findings by impact, confidence, effort, and risk.
5. **PLAN** — propose a sequenced implementation plan with acceptance criteria.
6. **IMPLEMENT** — make small, reversible, well-scoped changes.
7. **TEST** — validate behavior, SEO signals, accessibility, security, and regressions.
8. **REPORT** — document evidence, changes, results, unresolved issues, and rollback steps.

For an audit-only request, stop before implementation. For an implementation request, do not stop after the audit unless a required approval is missing.

## Mandatory operating rules

- Inspect the actual website and repository before recommending changes.
- Distinguish observed facts, hypotheses, and recommendations.
- Do not claim a crawler is blocked merely because one request failed. Check response status, headers, robots directives, firewall/CDN behavior, and user-agent-specific responses where possible.
- Verify current requirements against official documentation. Search-engine and AI-crawler policies change.
- Distinguish search/indexing crawlers, user-triggered retrieval crawlers, and model-training crawlers. Do not enable training crawlers by default.
- Do not claim that `llms.txt`, special AI markup, or any single file guarantees AI visibility. Treat optional conventions as experiments, not ranking requirements.
- Prefer useful, original, accessible HTML content over SEO gimmicks.
- Never invent company facts, project capabilities, customers, certifications, metrics, or product claims.
- Preserve the existing visual identity and user experience unless explicitly asked to redesign them.
- Do not expose secrets, credentials, private endpoints, or personal data in reports or public files.
- Back up important files before substantial edits. Keep changes reversible and explain rollback.
- Do not change DNS, nameservers, email records, production infrastructure, payment flows, authentication, or access controls without explicit approval.
- Do not deploy to production unless deployment is explicitly authorized.
- Avoid unnecessary dependencies and avoid creating public write-capable agent interfaces without explicit authorization.

## Workflow selection

Choose the relevant workflow:
- Full review: [workflows/website-audit.md](workflows/website-audit.md)
- SEO changes: [workflows/seo-optimization.md](workflows/seo-optimization.md)
- AI-search visibility: [workflows/ai-discoverability.md](workflows/ai-discoverability.md)
- Agent interoperability: [workflows/agent-readiness.md](workflows/agent-readiness.md)
- Final checks: [workflows/testing-and-validation.md](workflows/testing-and-validation.md)

## Technical references

Consult only the references relevant to the task:
- [Technical SEO](references/technical-seo.md)
- [AI search discoverability](references/ai-search-discoverability.md)
- [Structured data](references/structured-data.md)
- [Agent interoperability](references/agent-interoperability.md)
- [Web performance and accessibility](references/web-performance.md)
- [Web security](references/web-security.md)

## Site-specific configuration

If present, read [references/site-profile.md](references/site-profile.md). Treat it as project context, not as general policy. Confirm its facts against the current site or user-provided sources before publishing them.

## Prioritization

For each finding, record:
- Evidence and affected URL/component.
- User/search/agent impact.
- Severity and confidence.
- Recommended fix.
- Effort and implementation risk.
- Validation method.

Prioritize critical crawl/indexing failures, broken user journeys, security issues, and misleading public information before low-impact metadata refinements.

## Required deliverables

Use the templates:
- [Audit report](templates/audit-report.md)
- [Implementation report](templates/implementation-report.md)
- [Agent-readiness report](templates/agent-readiness-report.md)

Reports must separate:
1. Verified findings.
2. Changes actually made.
3. Tests actually run and their results.
4. Recommendations not yet implemented.
5. Approvals or access still required.

Never report a task as complete unless its acceptance criteria have been tested.
