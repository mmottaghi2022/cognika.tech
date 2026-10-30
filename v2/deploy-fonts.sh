#!/bin/bash
# Deploy the self-hosted font change only.
# Does NOT touch .htaccess, .user.ini, inc/, py-test/, or any PHP auth file.
set -uo pipefail

HOST="5.9.176.204"
ROOT="$(cd "$(dirname "$0")/changes/public_html" && pwd)"
LOGIN="$(dirname "$0")/../SSH Key/login"
U="$(grep -i '^Username:' "$LOGIN" | sed 's/.*: *//' | tr -d '\r')"
P="$(grep -i '^Password:' "$LOGIN" | sed 's/.*: *//' | tr -d '\r')"

FILES=(
  "assets/fonts/manrope-var.woff2"
  "assets/fonts/dm-mono-400.woff2"
  "assets/fonts/dm-mono-500.woff2"
  "assets/css/styles.css"
  "assets/css/login.css"
  "index.html"
  "about/index.html"
  "projects/index.html"
  "e-os/index.html"
  "pat-ia/index.html"
  "srm-p/index.html"
  "contact/index.html"
)

echo "=== create fonts dir ==="
curl -sS -v --ftp-method nocwd --user "${U}:${P}" --max-time 20 \
     "ftp://${HOST}/public_html/" -Q "MKD public_html/assets/fonts" 2>&1 \
  | grep -oE '257 .*created|550 .*' | head -1

echo
echo "=== upload ${#FILES[@]} files ==="
ok=0; fail=0
for f in "${FILES[@]}"; do
  if curl -sS --ftp-method nocwd --user "${U}:${P}" --max-time 120 \
          -T "${ROOT}/${f}" "ftp://${HOST}/public_html/${f}"; then
    ok=$((ok+1)); printf '  ok    %-34s %s B\n' "$f" "$(wc -c < "${ROOT}/${f}" | tr -d ' ')"
  else
    fail=$((fail+1)); printf '  FAIL  %s\n' "$f"
  fi
done
echo "  uploaded=${ok} failed=${fail}"
[ "$fail" -eq 0 ] || exit 1

# login.php is a PHP file: back it up first, then upload.
echo
echo "=== login.php (backup then upload) ==="
BK="$(dirname "$0")/deploy-backups/login.php.pre-fonts"
curl -sS --ftp-method nocwd --user "${U}:${P}" --max-time 40 \
     "ftp://${HOST}/public_html/login.php" -o "$BK" \
  && echo "  backed up to $BK ($(wc -c < "$BK" | tr -d ' ') B)"
curl -sS --ftp-method nocwd --user "${U}:${P}" --max-time 60 \
     -T "${ROOT}/login.php" "ftp://${HOST}/public_html/login.php" \
  && echo "  login.php uploaded"
