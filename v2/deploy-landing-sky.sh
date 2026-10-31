#!/bin/bash
# =============================================================================
# Landing flash / navigation cost / shared sky / wordmark flame release
# =============================================================================
# Uploads only the files this release changes, one at a time, so a failure can
# be pinpointed. Everything else — .htaccess, .user.ini, PHP auth, fonts,
# robots/sitemap/llms.txt, login.css and the existing logo-*.{avif,webp} — is
# left untouched.
#
# Back up the live versions first with the same list (see
# deploy-backups/release-<stamp>/); rollback is re-uploading those files.
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
  "assets/js/meteors.js"
  "assets/js/flame.js"
  "assets/img/back_ground-640.avif"
  "assets/img/back_ground-1000.avif"
  "assets/img/back_ground-640.webp"
  "assets/img/back_ground-1000.webp"
)

ok=0; fail=0
for f in "${FILES[@]}"; do
  if curl -sS --ftp-method nocwd --user "${U}:${P}" --max-time 120 \
          -T "${S}/${f}" "ftp://${HOST}/public_html/${f}"; then
    ok=$((ok+1)); printf '  ok    %-34s %s B\n' "$f" "$(wc -c < "${S}/${f}" | tr -d ' ')"
  else
    fail=$((fail+1)); printf '  FAIL  %s\n' "$f"
  fi
done
echo "  uploaded=${ok} failed=${fail}"
[ "$fail" -eq 0 ] || exit 1
