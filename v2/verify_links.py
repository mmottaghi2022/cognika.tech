import os, re, sys

BASE = 'v2/changes/public_html'
pages = ['index.html', 'about/index.html', 'projects/index.html', 'e-os/index.html',
         'pat-ia/index.html', 'srm-p/index.html', 'contact/index.html']

print('=== LINK + CANONICAL INTEGRITY ===')
broken = 0
for p in pages:
    t = open(os.path.join(BASE, p), encoding='utf-8').read()
    for m in re.finditer(r'(?:href|src)="(/[^"#?]+)"', t):
        l = m.group(1)
        tgt = os.path.join(BASE, l.strip('/'), 'index.html') if l.endswith('/') else os.path.join(BASE, l.lstrip('/'))
        if not os.path.exists(tgt):
            print('  BROKEN', p, '->', l); broken += 1

print('  broken links:', broken)

print()
print('=== CANONICAL MATCHES ITS OWN PATH ===')
for p in pages:
    t = open(os.path.join(BASE, p), encoding='utf-8').read()
    can = re.search(r'<link rel="canonical" href="([^"]+)"', t)
    expect = 'https://cognika.tech/' + ('' if p == 'index.html' else p.replace('index.html', ''))
    got = can.group(1) if can else None
    print(('  OK   ' if got == expect else '  FAIL ') + f'{p:22} {got}')

print()
print('=== SITEMAP <-> FILES ===')
sm = open(os.path.join(BASE, 'sitemap.xml'), encoding='utf-8').read()
locs = re.findall(r'<loc>([^<]+)</loc>', sm)
for loc in locs:
    path = loc.replace('https://cognika.tech/', '').strip('/')
    tgt = os.path.join(BASE, path, 'index.html') if path else os.path.join(BASE, 'index.html')
    print(('  OK   ' if os.path.exists(tgt) else '  FAIL ') + loc)
