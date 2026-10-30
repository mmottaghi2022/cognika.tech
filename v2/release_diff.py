"""Diff the local staging tree against live production to determine the exact
release payload. Read-only: downloads production copies into a temp dir."""
import hashlib
import os
import subprocess
import sys

HOST = "5.9.176.204"
LOGIN = "SSH Key/login"

U = subprocess.check_output(
    ["grep", "-i", "^Username:", LOGIN], text=True).split(":", 1)[1].strip()
P = subprocess.check_output(
    ["grep", "-i", "^Password:", LOGIN], text=True).split(":", 1)[1].strip()

STAGE = "v2/changes/public_html"
TMP = "/tmp/prod-current"
os.makedirs(TMP, exist_ok=True)


def remote_get(rel):
    dest = os.path.join(TMP, rel)
    os.makedirs(os.path.dirname(dest) or TMP, exist_ok=True)
    r = subprocess.run(
        ["curl", "-sS", "--ftp-method", "nocwd", "--user", f"{U}:{P}",
         "--max-time", "60", f"ftp://{HOST}/public_html/{rel}", "-o", dest],
        capture_output=True)
    return r.returncode == 0 and os.path.exists(dest)


def md5(p):
    return hashlib.md5(open(p, "rb").read()).hexdigest()


files = []
for root, _, names in os.walk(STAGE):
    for n in names:
        full = os.path.join(root, n)
        files.append(os.path.relpath(full, STAGE))
files.sort()

# Files excluded from this release by instruction.
EXCLUDE_EXACT = {".htaccess", ".user.ini", "login.php", "dashboard.php",
                 "inc/auth.php", "inc/config.example.php", "inc/.htaccess"}
# Font files and CSS are already deployed from the accepted font commit.
ALREADY_DEPLOYED_PREFIX = ("assets/fonts/",)

new, changed, same, excluded, missing_remote = [], [], [], [], []

for rel in files:
    if rel in EXCLUDE_EXACT or rel.startswith("inc/"):
        excluded.append(rel)
        continue
    local = os.path.join(STAGE, rel)
    if not remote_get(rel):
        missing_remote.append(rel)
        continue
    remote = os.path.join(TMP, rel)
    if md5(local) == md5(remote):
        same.append(rel)
    else:
        if rel.startswith(ALREADY_DEPLOYED_PREFIX):
            changed.append(rel)          # already live, just differing locally
        else:
            new.append(rel)

print("=== NEW (not on production) ===")
for f in new:
    print("   ", f)
print("=== CHANGED (differs from production) ===")
for f in changed:
    print("   ", f)
print("=== IDENTICAL (no upload needed) ===")
for f in same:
    print("   ", f)
print("=== EXCLUDED BY INSTRUCTION ===")
for f in excluded:
    print("   ", f)
print("=== MISSING ON PRODUCTION (would be new) ===")
for f in missing_remote:
    print("   ", f)
