#!/bin/bash
# Point the `deploy` FTP account at the real webroot via the cPanel API.
#
# The cPanel UI's "Directory" field kept creating a NEW empty folder. The API
# takes `homedir` as a literal absolute path, so it binds to the existing
# webroot instead of inventing one.
#
# Run on the server in cPanel Terminal, as user cognikat.
# Edit NEWPASS below before running.
set -u

ACCOUNT_USER="deploy"
DOMAIN="cognika.tech"
WEBROOT="/home/cognikat/public_html"
NEWPASS='CHANGE-ME-BEFORE-RUNNING'

echo "=== sanity: webroot must exist and contain the site ==="
if [ ! -f "$WEBROOT/index.html" ]; then
  echo "ABORT: $WEBROOT/index.html not found. Wrong path — stopping."
  exit 1
fi
ls -la "$WEBROOT" | head -5

echo
echo "=== 1. remove the broken account ==="
uapi --user=cognikat Ftp delete_ftp user="${ACCOUNT_USER}@${DOMAIN}" destroy=0 2>&1 | head -20

echo
echo "=== 2. re-create it bound to the absolute webroot ==="
uapi --user=cognikat Ftp add_ftp \
  user="$ACCOUNT_USER" \
  pass="$NEWPASS" \
  homedir="$WEBROOT" \
  quota=0 \
  domain="$DOMAIN" 2>&1 | head -20

echo
echo "=== 3. read back what cPanel recorded ==="
uapi --user=cognikat Ftp list_ftp 2>&1 | grep -iE 'deploy|homedir' | head -10

echo
echo "=== 4. done — tell the agent to retest ==="
