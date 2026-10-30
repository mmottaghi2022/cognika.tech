#!/bin/bash
# AI-discoverability release: upload exactly the 9 approved files.
# Strictly excluded: .htaccess, .user.ini, PHP auth, fonts, CSS, sitemap, DNS.
set -uo pipefail

HOST="5.9.176.204"
STAGE="$(cd "$(dirname "$0")/changes/public_html" && pwd)"
LOGIN="$(dirname "$0")/../SSH Key/login"
U="$(grep -i '^Username:' "$LOGIN" | sed 's/.*: *//' | tr -d '\r')"
P="$(grep -i '^Password:' "$LOGIN" | sed 's/.*: *//' | tr -d '\r')"

FILES=(
  "llms.txt"
  "robots.txt"
  "index.html"
  "about/index.html"
  "projects/index.html"
  "e-os/index.html"
  "pat-ia/index.html"
  "srm-p/index.html"
  "contact/index.html"
)

echo "=== uploading ${#FILES[@]} files ==="
ok=0; fail=0
for f in "${FILES[@]}"; do
  if curl -sS --ftp-method nocwd --user "${U}:${P}" --max-time 90 \
          -T "${STAGE}/${f}" "ftp://${HOST}/public_html/${f}"; then
    ok=$((ok+1)); printf '  ok    %-26s %s B\n' "$f" "$(wc -c < "${STAGE}/${f}" | tr -d ' ')"
  else
    fail=$((fail+1)); printf '  FAIL  %s\n' "$f"
  fi
done
echo "  uploaded=${ok} failed=${fail}"
[ "$fail" -eq 0 ] || exit 1
