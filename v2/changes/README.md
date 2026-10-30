# Proposed changes — staging area

Each subdirectory mirrors its destination under the live webroot
`/home/cognikat/public_html`.

```
v2/changes/
├── .htaccess                 → public_html/.htaccess        (NEW)
├── robots.txt                → public_html/robots.txt       (NEW)
├── sitemap.xml               → public_html/sitemap.xml      (NEW)
└── index.html                → public_html/index.html       (EDIT)
```

## Rules

1. Nothing here is live. Copying to the webroot is a deploy and needs approval.
2. Every file here must be **directly uploadable** — no templating, no build step.
3. Edits to `index.html` are shipped as a **full file**, not a patch, so the
   FTP upload is a single atomic replace and rollback is re-uploading the
   previous file.
4. Before upload, archive the current live file:
   ```
   cp public_html/index.html /tmp/index.html.$(date +%F-%H%M).bak
   ```
5. Verify against the **real LiteSpeed host**, not a local server, because
   `.htaccess` semantics differ between Apache, nginx, and LiteSpeed.
