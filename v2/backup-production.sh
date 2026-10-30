#!/bin/bash
# Full production backup before the AI-discoverability release.
# Downloads every file currently live under public_html so the release can be
# rolled back file by file.
set -uo pipefail

HOST="5.9.176.204"
LOGIN="$(dirname "$0")/../SSH Key/login"
U="$(grep -i '^Username:' "$LOGIN" | sed 's/.*: *//' | tr -d '\r')"
P="$(grep -i '^Password:' "$LOGIN" | sed 's/.*: *//' | tr -d '\r')"
DEST="$(dirname "$0")/deploy-backups/release-$(date +%Y%m%d-%H%M%S)"

mkdir -p "$DEST"
echo "backup dir: $DEST"

fetch() {
  local rel="$1"
  mkdir -p "$DEST/$(dirname "$rel")"
  if curl -sS --ftp-method nocwd --user "${U}:${P}" --max-time 120 \
          "ftp://${HOST}/public_html/${rel}" -o "$DEST/${rel}"; then
    printf '  %-34s %s B\n' "$rel" "$(wc -c < "$DEST/${rel}" | tr -d ' ')"
  else
    printf '  FAIL %s\n' "$rel"
  fi
}

echo "=== root + directories ==="
for f in .htaccess .user.ini index.html login.php dashboard.php robots.txt sitemap.xml \
         llms.txt assets/css/styles.css assets/css/login.css assets/css/pages.css \
         assets/js/script.js assets/js/meteors.js assets/js/flame.js \
         assets/img/logo.png assets/img/favicon.svg assets/img/back_ground.webp \
         assets/fonts/manrope-var.woff2 assets/fonts/dm-mono-400.woff2 assets/fonts/dm-mono-500.woff2 \
         inc/.htaccess inc/auth.php inc/config.example.php; do
  fetch "$f" || true
done

for d in about projects e-os pat-ia srm-p contact; do
  fetch "$d/index.html" || true
done

echo
echo "=== integrity: critical files present ==="
for f in .htaccess .user.ini index.html login.php; do
  if [ -s "$DEST/$f" ]; then
    printf '  OK   %-14s %s\n' "$f" "$(shasum -a 256 "$DEST/$f" | cut -c1-16)"
  else
    printf '  MISSING %s  <-- ABORT\n' "$f"
  fi
done
echo
echo "file count: $(find "$DEST" -type f | wc -l | tr -d ' ')"
echo "$DEST" > /tmp/release-backup-dir.txt
