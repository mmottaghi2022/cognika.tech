#!/bin/bash
# =============================================================================
# Cognika v2 — production backup + deploy
# =============================================================================
# Deploys v2/changes/public_html/ to /home/cognikat/public_html over FTP.
#
# SAFETY ORDER (do not reorder):
#   1. BACKUP the live tree first. Abort if the backup fails or looks empty.
#   2. VERIFY the local tree is complete.
#   3. UPLOAD all 24 files.
#   4. VERIFY responses after upload.
#
# Usage:
#   FTP_USER=deploy FTP_PASS='...' ./deploy-v2.sh backup
#   FTP_USER=deploy FTP_PASS='...' ./deploy-v2.sh deploy
#   FTP_USER=deploy FTP_PASS='...' ./deploy-v2.sh verify
#
# Rollback: re-upload the backup, or delete public_html/.htaccess by FTP.
# =============================================================================
set -uo pipefail

HOST="5.9.176.204"
LOCAL="$(cd "$(dirname "$0")/changes/public_html" && pwd)"
BACKUP_DIR="$(dirname "$0")/deploy-backups"
STAMP="$(date +%Y%m%d-%H%M%S)"

: "${FTP_USER:?set FTP_USER}"
: "${FTP_PASS:?set FTP_PASS}"

FTP_URL="ftp://${HOST}/"

# The live webroot relative to the FTP account home. tools/repoint-deploy-ftp.sh
# binds the deploy account's homedir to /home/cognikat/public_html, so paths are
# relative to that and no public_html/ prefix is needed.
ftplist() {
  curl -sS --ftp-method nocwd --user "${FTP_USER}:${FTP_PASS}" \
       --max-time 30 "${FTP_URL}" 2>&1
}

case "${1:-}" in

  backup)
    mkdir -p "${BACKUP_DIR}/${STAMP}"
    echo "=== 1. listing live tree ==="
    ftplist | tee "${BACKUP_DIR}/${STAMP}/listing.txt" | head -30
    if ! grep -q 'index.html' "${BACKUP_DIR}/${STAMP}/listing.txt"; then
      echo "ABORT: live listing does not contain index.html. Refusing to continue."
      exit 1
    fi

    echo
    echo "=== 2. downloading every live file ==="
    ok=0; fail=0
    while IFS= read -r f; do
      [ -z "$f" ] && continue
      mkdir -p "${BACKUP_DIR}/${STAMP}/$(dirname "$f")"
      if curl -sS --ftp-method nocwd --user "${FTP_USER}:${FTP_PASS}" \
              --max-time 60 "${FTP_URL}${f}" -o "${BACKUP_DIR}/${STAMP}/${f}"; then
        ok=$((ok+1)); printf '  ok   %s\n' "$f"
      else
        fail=$((fail+1)); printf '  FAIL %s\n' "$f"
      fi
    done < <(ftplist | awk '{print $NF}' | grep -E '\\.(html|php|css|js|svg|png|webp|txt|xml|htaccess)$|^\\.htaccess$')
    echo "  downloaded=$ok failed=$fail"
    echo
    echo "  backup at: ${BACKUP_DIR}/${STAMP}"
    ;;

  deploy)
    echo "=== 3. enumerating local files ==="
    FILES=()
    while IFS= read -r f; do FILES+=("$f"); done < <(cd "$LOCAL" && find . -type f | sed 's|^\\./||' | sort)
    echo "  ${#FILES[@]} files to upload"
    printf '    %s\n' "${FILES[@]}"

    echo
    echo "=== 4. uploading ==="
    ok=0; fail=0
    for f in "${FILES[@]}"; do
      # Ensure the remote directory exists, then put the file.
      dir="$(dirname "$f")"
      if [ "$dir" != "." ]; then
        curl -sS --ftp-method nocwd --user "${FTP_USER}:${FTP_PASS}" \
             --max-time 20 "${FTP_URL}${dir}/" -Q "MKD ${dir}" >/dev/null 2>&1 || true
      fi
      if curl -sS --ftp-method nocwd --user "${FTP_USER}:${FTP_PASS}" \
              --max-time 60 -T "${LOCAL}/${f}" "${FTP_URL}${f}"; then
        ok=$((ok+1)); printf '  ok   %s\n' "$f"
      else
        fail=$((fail+1)); printf '  FAIL %s\n' "$f"
      fi
    done
    echo "  uploaded=$ok failed=$fail"
    [ "$fail" -eq 0 ] || { echo "WARNING: $fail uploads failed"; exit 1; }
    ;;

  verify)
    echo "=== 5. verifying production responses ==="
    for p in / /about/ /projects/ /e-os/ /pat-ia/ /srm-p/ /contact/ \
             /robots.txt /sitemap.xml /assets/css/pages.css /login.php; do
      printf '  %-22s ' "$p"
      curl -sS -o /dev/null -w '%{http_code} %{size_download}B\n' \
           --tlsv1.2 --tls-max 1.2 --max-time 20 "https://cognika.tech${p}" \
        || echo 'FAILED'
    done
    echo
    echo "  --- redirect checks ---"
    printf '  http apex     '; curl -sS -o /dev/null -w '%{http_code} -> %{redirect_url}\n' \
        --max-time 15 "http://cognika.tech/" || echo FAILED
    printf '  www           '; curl -sS -o /dev/null -w '%{http_code} -> %{redirect_url}\n' \
        --tlsv1.2 --tls-max 1.2 --max-time 15 "https://www.cognika.tech/" || echo FAILED
    ;;

  *)
    echo "usage: $0 {backup|deploy|verify}"
    exit 2
    ;;
esac
