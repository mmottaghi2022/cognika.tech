# AI search discoverability reference

## Goal

Make accurate, useful website information accessible to AI-powered search and answer systems without making unsupported promises about ranking or citation.

## Core principles

- Publish original, specific, well-organized information that directly answers real user questions.
- Make important information accessible in crawlable HTML.
- Use clear page titles, headings, descriptive internal links, and consistent organization/project naming.
- Explain what an organization does, whom it serves, what its products/projects do, and what evidence supports its claims.
- Keep facts consistent across the homepage, About page, project pages, metadata, and structured data.
- Include dates, version/status information, and authorship where useful and truthful.
- Avoid mass-produced low-value pages, keyword stuffing, fabricated FAQs, and synthetic testimonials.

## Crawler policy

Before changing crawler access:
1. Identify the crawler's operator and documented purpose from current official documentation.
2. Determine whether it is for search indexing, user-initiated retrieval, model training, or another purpose.
3. Check the site's robots rules, CDN/WAF rules, hosting restrictions, and server logs if available.
4. Decide with the site owner which access is desired.
5. Make only the narrowest approved change and test it.

Examples of crawler families that may need separate consideration include Googlebot, Bingbot, OAI-SearchBot, GPTBot, ClaudeBot, Claude-SearchBot, and PerplexityBot. Names, purposes, and policies can change; verify them at implementation time.

Do not assume allowing a training crawler is necessary for search visibility. Do not assume blocking a training crawler blocks search retrieval, or vice versa.

## Optional machine-readable content

- A concise `llms.txt` may be tested as a convenience index for systems that choose to use it. It is not a substitute for crawlable pages, sitemap, or sound SEO.
- A Markdown or text endpoint can help when it has a clear maintenance process and mirrors canonical content accurately.
- Do not publish duplicate or stale content endpoints.
- Keep any generated index aligned with the actual public pages.

## Measurement

AI visibility is difficult to measure consistently. Track:
- Whether key pages are crawlable by the intended systems.
- Whether organization and project facts are represented consistently.
- Referral traffic where identifiable.
- Search impressions/clicks and branded/non-branded query performance.
- Real examples of accurate or inaccurate AI descriptions/citations, with date and platform.

Do not promise inclusion, citations, or rankings.
