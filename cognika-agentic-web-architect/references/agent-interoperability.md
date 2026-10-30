# Agent interoperability reference

## Goal

Make public website information easy for authorized agents to discover and interpret, and expose actions only where there is a clear, safe use case.

## Levels of agent readiness

### Level 1 — Readable
- Semantic HTML.
- Clear navigation and page hierarchy.
- Descriptive links and stable URLs.
- Important content available without complex interaction.
- Accessible labels and controls.

### Level 2 — Structured
- Consistent organization and project entities.
- Appropriate JSON-LD.
- Stable identifiers and clear relationships.
- Optional well-maintained Markdown or machine-readable indexes.

### Level 3 — Queryable
- Documented read-only API for structured public information, if justified.
- OpenAPI specification for HTTP APIs.
- Clear schemas, pagination, filtering, versioning, and error responses.
- Rate limits and monitoring.

### Level 4 — Action-capable
- MCP server or other tool interface only when there is a real user need.
- Explicit authentication and authorization.
- Least-privilege scopes.
- Human confirmation for consequential actions.
- Audit logs, rate limits, abuse protection, and revocation.

Do not build an API or MCP server merely for a marketing claim. Start with read-only public information and validate demand.

## Candidate read-only tools

If the site's purpose supports them, consider:
- `get_company_profile`
- `list_projects`
- `get_project_details`
- `search_public_knowledge`
- `get_documentation`

Define exact inputs, outputs, error behavior, data provenance, and access rules before implementation.

## Avoid

- Public unauthenticated write operations.
- Exposing admin endpoints, filesystem access, environment variables, or internal databases.
- Treating a hidden URL as authentication.
- Unbounded search or scraping endpoints.
- Tools whose descriptions promise capabilities the backend does not implement.

## Agent-facing documentation

Document:
- What the agent can do.
- What data it can access.
- Authentication requirements.
- Rate limits.
- Data freshness and limitations.
- Examples and error responses.
- Human approval requirements for sensitive actions.
