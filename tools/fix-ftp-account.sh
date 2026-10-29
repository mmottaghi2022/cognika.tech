#!/bin/bash
# Inspect / repair the deploy FTP account via the cPanel API (no root needed).
# Run on the server in cPanel Terminal as user cognikat.

echo "=== 1. Who am I ==="
whoami

echo
echo "=== 2. Existing FTP accounts (JSON) ==="
uapi --user=cognikat Ftp list_ftp 2>&1 | head -60

echo
echo "=== 3. The deploy entry, filtered ==="
uapi --user=cognikat Ftp list_ftp 2>&1 | grep -iE 'deploy|homedir|user' | head -30

echo
echo "=== 4. What actually exists on disk ==="
ls -la /home/cognikat/public_html/ | head -8
echo "--- any deploy-owned dirs in home? ---"
ls -la /home/cognikat/ | grep -i deploy || echo "none"

echo
echo "=== 5. Confirm the real webroot is intact ==="
ls -la /home/cognikat/public_html/login.php /home/cognikat/public_html/index.html 2>&1
