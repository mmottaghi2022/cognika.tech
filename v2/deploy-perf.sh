#!/bin/bash
# Phase 1 performance release.
# Uploads only the files this release changes. .htaccess, .user.ini, login.php,
# dashboard.php, inc/ and the Python subdomain are NOT touched.
set -uo pipefail

HOST="5.9.176.204"
S="$(cd "$(dirname "$0")/changes/public_html" && pwd)"
L="$(dirname "$0")/../SSH Key/login"
U="$(grep -i '^Username:' "$L" | sed 's/.*: *//' | tr -d '\r')"
P="$(grep -i '^Password:' "$L" | sed 's/.*: *//' | tr -d '\r')"

FILES=(
  "index.html"
  "assets/css/styles.css"
  "assets/js/flame.js"
  "assets/js/meteors.js"
  "about/index.html"
  "projects/index.html"
  "e-os/index.html"
  "pat-ia/index.html"
  "srm-p/index.html"
  "contact/index.html"
  "assets/img/logo-230.avif"
  "assets/img/logo-230.webp"
  "assets/img/logo-460.avif"
  "assets/img/logo-460.webp"
  "assets/img/logo-900.avif"
  "assets/img/logo-900.webp"
  "assets/img/logo-1800.avif"
  "assets/img/logo-1800.webp"
)

ok=0; fail=0
for f in "${FILES[@]}"; do
  if curl -sS --ftp-method nocwd --user "${U}:${P}" --max-time 90 \
          -T "${S}/${f}" "ftp://${HOST}/public_html/${f}"; then
    ok=$((ok+1)); printf '  ok    %-28s %s B\n' "$f" "$(wc -c < "${S}/${f}" | tr -d ' ')"
  else
    fail=$((fail+1)); printf '  FAIL  %s\n' "$f"
  fi
done
echo "  uploaded=${ok} failed=${fail}"
[ "$fail" -eq 0 ] || exit 1
