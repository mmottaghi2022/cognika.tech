# Structured data and knowledge representation

## Goal

Describe entities and page content consistently so supported systems can interpret them.

## General rules

- Use Schema.org vocabulary and JSON-LD where appropriate.
- Mark up only information visible to users and supported by reliable site content.
- Ensure structured data matches the page and does not contradict visible text.
- Use stable canonical URLs as entity identifiers where practical.
- Validate syntax and eligibility using current official testing tools.
- Structured data does not guarantee rich results or higher rankings.

## Candidate types

Choose types based on the real page:
- `Organization` for the organization.
- `WebSite` for the website.
- `WebPage` for ordinary pages.
- `AboutPage` for an About page.
- `ContactPage` for a contact page.
- `BreadcrumbList` when breadcrumbs are visible and accurate.
- `Article` or an appropriate subtype for genuine editorial content.
- `SoftwareApplication` only for an actual software application with supportable properties.
- `Product` only where the page genuinely describes a product and meets the applicable policies.

Do not add every type to every page. Avoid fake ratings, reviews, offers, prices, authors, dates, or certifications.

## Entity consistency

Create a small knowledge map of:
- Organization name and canonical URL.
- Official logo and contact channels.
- Genuine social profiles, if any.
- Projects/products and their canonical pages.
- Relationships between the organization and its projects.

Use `sameAs` only for authoritative profiles that represent the same entity. Do not use it for unrelated pages or speculative profiles.

## Validation

Check JSON syntax, schema vocabulary, required/recommended properties, and consistency with visible content. Record validation warnings and distinguish them from errors.
