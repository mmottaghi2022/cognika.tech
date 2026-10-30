# Web performance and accessibility

## Performance

Measure before optimizing. Use representative mobile and desktop pages.

Review:
- Largest Contentful Paint (LCP).
- Interaction to Next Paint (INP).
- Cumulative Layout Shift (CLS).
- Server response time and caching.
- JavaScript payload and render-blocking resources.
- Font loading and layout stability.
- Image sizing, modern formats, compression, and responsive sources.
- Third-party scripts and their impact.

Prefer targeted improvements over speculative rewrites. Use real-user data when available and lab data for diagnosis. Record the tool, date, URL, device profile, and result.

## Accessibility

Check:
- Keyboard navigation and visible focus.
- Semantic landmarks and heading order.
- Form labels, instructions, and error messages.
- Accessible names for controls.
- Sufficient contrast.
- Meaningful image alternatives.
- Reduced-motion support where animation is present.
- Responsive zoom and reflow.
- Avoidance of interaction that depends only on hover.

Use automated checks as a starting point; manually test important journeys. Do not claim full accessibility conformance from an automated scan alone.
