#!/bin/bash
# =============================================================================
# Persistent shell release
# =============================================================================
# Uploads only the files this release changes. Untouched: .htaccess, .user.ini,
# PHP auth, fonts, robots/sitemap/llms.txt, meteors.js, login.css, the
# back_ground-* images, and everything under inc/.
#
# Rollback: re-upload the files saved in deploy-backups/shell-<stamp>/.
# =============================================================================
set -uo pipefail

HOST="5.9.176.204"
S="$(cd "$(dirname "$0")/changes/public_html" && pwd)"
L="$(dirname "$0")/../SSH Key/login"
U="$(grep -i '^Username:' "$L" | sed 's/.*: *//' | tr -d '\r')"
P="$(grep -i '^Password:' "$L" | sed 's/.*: *//' | tr -d '\r')"

FILES=(
  "index.html"
  "about/index.html"
  "projects/index.html"
  "e-os/index.html"
  "pat-ia/index.html"
  "srm-p/index.html"
  "contact/index.html"
  "assets/css/styles.css"
  "assets/js/script.js"
  "assets/js/flame.js"
  "assets/js/shell.js"
)

ok=0; fail=0
for f in "${FILES[@]}"; do
  if curl -sS --ftp-method nocwd --user "${U}:${P}" --max-time 120 \
          -T "${S}/${f}" "ftp://${HOST}/public_html/${f}"; then
    ok=$((ok+1)); printf '  ok    %-32s %s B\n' "$f" "$(wc -c < "${S}/${f}" | tr -d ' ')"
  else
    fail=$((fail+1)); printf '  FAIL  %s\n' "$f"
  fi
done
echo "  uploaded=${ok} failed=${fail}"
[ "$fail" -eq 0 ] || exit 1
