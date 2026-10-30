# Workflow: agent readiness

## Procedure

1. Identify the actual agent use cases and users. Do not invent a need for an API.
2. Evaluate Level 1 readable and Level 2 structured readiness first.
3. Map public entities, canonical URLs, project relationships, and documentation.
4. Identify whether a read-only API would materially improve a real workflow.
5. If justified, design an OpenAPI contract with schemas, pagination, errors, versioning, and rate limits.
6. Consider MCP only when tool invocation provides value beyond ordinary pages or APIs.
7. Keep privileged actions separate; define authentication, authorization, audit, approval, and revocation.
8. Build a threat model before exposing any endpoint.
9. Test with representative agent tasks and record whether answers/actions are grounded in current site data.

## Completion criteria

- Agent capabilities and limitations are explicit.
- Read-only and write-capable operations are separated.
- No sensitive information or unsafe actions are exposed.
- Documentation matches actual implementation.
