"""
Local auth verification against PHP's built-in server (PHP 8.5.12).
Runs the real login.php / dashboard.php flow on the staged v2 tree.

This is a LOCAL PHP test. It is NOT a LiteSpeed test and it does not replace one.
"""
import http.cookiejar
import re
import urllib.parse
import urllib.request

BASE = 'http://127.0.0.1:8900'

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def get(path, data=None):
    url = BASE + path
    body = urllib.parse.urlencode(data).encode() if data else None
    req = urllib.request.Request(url, data=body)
    try:
        r = opener.open(req, timeout=10)
        return r.status, r.read().decode('utf-8', 'replace'), r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace'), url

print('=== 1. login.php renders (HTTP 200 + form) ===')
code, html, _ = get('/login.php')
csrf = re.search(r'name="csrf"\s+value="([^"]+)"', html)
print(f'  status={code}  csrf_present={bool(csrf)}  title={re.search(r"<title>([^<]*)", html).group(1)}')

print()
print('=== 2. dashboard.php without session (expect redirect -> login) ===')
code, _, url = get('/dashboard.php')
print(f'  status={code}  final={url}')

print()
print('=== 3. Wrong password must NOT authenticate ===')
code, html, _ = get('/login.php')
csrf_v = re.search(r'name="csrf"\s+value="([^"]+)"', html).group(1)
code, html, url = get('/login.php', {'username': 'testuser', 'password': 'wrong-password', 'csrf': csrf_v})
denied = 'login.php' in url
print(f'  status={code}  still_on_login={denied}')

print()
print('=== 4. Correct password authenticates ===')
code, html, _ = get('/login.php')
csrf_v = re.search(r'name="csrf"\s+value="([^"]+)"', html).group(1)
code, html, url = get('/login.php', {'username': 'testuser', 'password': 'LocalTestPass123!', 'csrf': csrf_v})
print(f'  status={code}  landed_on={url}')

print()
print('=== 5. dashboard.php WITH session ===')
code, html, url = get('/dashboard.php')
title = re.search(r'<title>([^<]*)', html)
print(f'  status={code}  final={url}  title={title.group(1) if title else None}')
print(f'  shows_user={("Local Test User" in html) or ("testuser" in html)}')

print()
print('=== 6. no raw PHP source leaked in any response ===')
leaks = 0
for p in ['/login.php', '/dashboard.php', '/']:
    _, h, _ = get(p)
    if '<?php' in h:
        leaks += 1
print(f'  responses_leaking_php_source={leaks}')
