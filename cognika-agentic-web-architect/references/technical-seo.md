# Technical SEO reference

## Goal

Ensure important pages can be discovered, crawled, rendered, understood, indexed when appropriate, and represented accurately in search results.

## Audit checklist

- Confirm the canonical production hostname and preferred protocol.
- Inspect HTTP status codes, redirect chains, TLS validity, and mixed content.
- Inspect `robots.txt`, XML sitemap(s), canonical tags, meta robots, and `X-Robots-Tag`.
- Check whether important content is present in server-rendered HTML or reliably rendered by supported crawlers.
- Identify duplicate, thin, orphaned, blocked, redirected, and broken pages.
- Check internal links, navigation semantics, breadcrumbs, pagination, and URL consistency.
- Inspect page titles, meta descriptions, H1/H2 hierarchy, language attributes, and descriptive link text.
- Check image formats, dimensions, alt text, lazy loading, and discoverability.
- Check mobile usability, accessibility, and Core Web Vitals.
- Verify that sitemap URLs are canonical, indexable, and return successful responses.

## Implementation guidance

### Titles and descriptions
- Give each index-worthy page a distinct, descriptive title and useful meta description.
- Reflect the actual page topic and user intent.
- Avoid keyword stuffing, repeated boilerplate, and unsupported claims.
- Meta descriptions can influence snippets but are not a guaranteed ranking control.

### Canonicals and indexing
- Use absolute canonical URLs that point to the preferred version.
- Do not canonicalize materially different pages to a generic page.
- Use `noindex` only when exclusion is intentional; do not block a page in `robots.txt` if crawlers must read its `noindex` directive.
- Avoid conflicting canonical, redirect, sitemap, and internal-link signals.

### Robots and sitemap
- `robots.txt` controls crawling, not guaranteed indexing or access security.
- Keep private data private through authentication and authorization, not robots directives.
- Include only canonical, indexable URLs in XML sitemaps.
- Keep sitemap timestamps accurate; do not update `lastmod` without meaningful page changes.
- Submit sitemaps through supported search-engine webmaster tools when authorized.

### HTML and rendering
- Use semantic HTML landmarks and meaningful heading structure.
- Ensure important copy and links are available to crawlers without requiring fragile client-side interactions.
- Use real anchor elements for navigation.
- Provide descriptive text alternatives for meaningful images; decorative images should not create noisy alt text.

### Internationalization
- Set the correct `lang` attribute.
- If the site serves distinct language/region versions, implement valid reciprocal `hreflang` annotations and self-references.
- Do not add `hreflang` for translations that do not exist.

## Validation

Use current official search-engine documentation and available testing tools. Check representative page templates and important URLs, not just the homepage. Record exact URLs, status codes, and test evidence.
