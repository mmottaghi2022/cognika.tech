# Workflow: testing and validation

## Test categories

### Functional
- Navigation and important links.
- Forms and primary user journeys.
- Responsive layouts and browser console errors.
- Correct status codes and redirects.

### SEO
- Titles, descriptions, canonical URLs, robots directives.
- Sitemap validity and URL consistency.
- Structured data syntax and page-content consistency.
- Crawlable HTML for important content.

### AI discoverability
- Key facts are accessible and consistent.
- Crawler rules match the approved policy.
- Optional machine-readable indexes, if present, are accurate and maintained.

### Agent readiness
- Public documentation describes real capabilities.
- API schemas and examples match actual responses.
- Authentication and authorization behave as intended.
- No write action can occur without required authorization and confirmation.

### Performance and accessibility
- Record Core Web Vitals or lab measurements where available.
- Keyboard-test important journeys.
- Check labels, focus, contrast, and responsive reflow.

## Reporting rules

For every test, record:
- Date/time.
- URL or component.
- Tool/method.
- Expected result.
- Actual result.
- Pass/fail/blocked.
- Evidence or limitation.

Do not state that a test passed if it was not run. Do not equate a lab score with real-user performance.
