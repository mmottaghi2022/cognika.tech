#!/bin/bash
# =============================================================================
# Cognika v2 — deploy pages + assets ONLY (Option 3)
# =============================================================================
# Explicitly does NOT touch:
#   .htaccess                (production cache policy + cPanel PHP logging)
#   .user.ini                (cPanel PHP config)
#   py-test.cognika.tech/    (Python app docroot)
#   inc/                     (PHP auth: unchanged, byte-identical)
#   login.php, dashboard.php (unchanged)
#
# PATH NOTE: this is a Pure-FTPd account whose home is /home/cognikat, and -Q
# commands run relative to that home, NOT the URL path. An earlier version
# used -Q "MKD dir" and created six empty directories in the home folder
# instead of public_html. Directory creation is therefore left to
# --ftp-create-dirs, which resolves against the full target URL.
# =============================================================================
set -uo pipefail

HOST="5.9.176.204"
ROOT="$(cd "$(dirname "$0")/changes/public_html" && pwd)"
LOGIN="$(dirname "$0")/../SSH Key/login"
U="$(grep -i '^Username:' "$LOGIN" | sed 's/.*: *//' | tr -d '\r')"
P="$(grep -i '^Password:' "$LOGIN" | sed 's/.*: *//' | tr -d '\r')"

FILES=(
  "index.html"
  "robots.txt"
  "sitemap.xml"
  "about/index.html"
  "projects/index.html"
  "e-os/index.html"
  "pat-ia/index.html"
  "srm-p/index.html"
  "contact/index.html"
  "assets/css/pages.css"
  "assets/js/script.js"
)

echo "=== uploading ${#FILES[@]} files to public_html/ ==="
ok=0; fail=0
for f in "${FILES[@]}"; do
  if curl -sS --ftp-method nocwd --user "${U}:${P}" --max-time 90 \
          --ftp-create-dirs -T "${ROOT}/${f}" \
          "ftp://${HOST}/public_html/${f}"; then
    ok=$((ok+1)); printf '  ok    %-28s %s B\n' "$f" "$(wc -c < "${ROOT}/${f}" | tr -d ' ')"
  else
    fail=$((fail+1)); printf '  FAIL  %s\n' "$f"
  fi
done

echo "  uploaded=${ok} failed=${fail}"
[ "$fail" -eq 0 ] || exit 1
