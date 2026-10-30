"""Reliable cold-cache perf measurement. Fresh Chrome per URL, poll for readyState."""
import json
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request

import websocket

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT = 9226


def measure(url, width, height, mobile):
    profile = tempfile.mkdtemp(prefix="cfp-")
    args = [CHROME, "--headless=new", "--disable-gpu",
            f"--remote-debugging-port={PORT}", f"--user-data-dir={profile}",
            "--no-first-run", "--no-default-browser-check", "--disable-extensions",
            "--disable-background-networking", f"--window-size={width},{height}",
            "about:blank"]
    p = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        ws_url = None
        for _ in range(80):
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json", timeout=1) as r:
                    for t in json.load(r):
                        if t.get("type") == "page":
                            ws_url = t["webSocketDebuggerUrl"]
                            break
                if ws_url:
                    break
            except Exception:
                pass
            time.sleep(0.25)
        if not ws_url:
            return None

        ws = websocket.create_connection(ws_url, timeout=45)
        n = [0]

        def cmd(method, **params):
            n[0] += 1
            ws.send(json.dumps({"id": n[0], "method": method, "params": params}))
            end = time.time() + 40
            while time.time() < end:
                try:
                    m = json.loads(ws.recv())
                except Exception:
                    return {}
                if m.get("id") == n[0]:
                    return m.get("result", {})
            return {}

        def ev(expr):
            r = cmd("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True)
            return (r.get("result") or {}).get("value")

        cmd("Page.enable")
        cmd("Runtime.enable")
        cmd("Network.enable")
        cmd("Network.setCacheDisabled", cacheDisabled=True)
        if mobile:
            cmd("Emulation.setDeviceMetricsOverride", width=width, height=height,
                deviceScaleFactor=2, mobile=True)

        cmd("Page.navigate", url=url)
        for _ in range(60):
            time.sleep(0.5)
            if ev("document.readyState") == "complete":
                break
        time.sleep(2.5)
        ev("window.scrollTo(0, 400)")
        time.sleep(0.8)
        ev("window.scrollTo(0, 0)")
        time.sleep(0.5)

        data = ev("""JSON.stringify((() => {
          const nav = performance.getEntriesByType('navigation')[0] || {};
          const paint = {};
          for (const p of performance.getEntriesByType('paint')) paint[p.name] = Math.round(p.startTime);
          let lcp = null;
          try {
            const e = performance.getEntriesByType('largest-contentful-paint');
            if (e.length) lcp = Math.round(e[e.length-1].startTime);
          } catch (err) {}
          const all = performance.getEntriesByType('resource');
          const fonts = all.filter(r => /fonts\\.(googleapis|gstatic)|\\.woff2?|\\.ttf/.test(r.name))
                            .map(r => r.name.replace(/^https?:\\/\\//,'').split('?')[0]);
          return {
            ttfb: Math.round(nav.responseStart || 0),
            fcp: paint['first-contentful-paint'] || null,
            lcp: lcp,
            load: Math.round(nav.loadEventEnd || 0),
            requests: all.length,
            fontUrls: [...new Set(fonts)]
          };
        })())""")
        ws.close()
        return json.loads(data) if data else None
    finally:
        p.terminate()
        try:
            p.wait(timeout=5)
        except Exception:
            p.kill()
        shutil.rmtree(profile, ignore_errors=True)


CASES = [("https://cognika.tech/", 1440, 900, False),
         ("https://cognika.tech/about/", 1440, 900, False),
         ("https://cognika.tech/", 390, 844, True),
         ("https://cognika.tech/about/", 390, 844, True)]

label = sys.argv[1] if len(sys.argv) > 1 else "run"
out = []
for url, w, h, mob in CASES:
    best = None
    for _ in range(2):
        d = measure(url, w, h, mob)
        if d and d.get("fcp") and (best is None or d["fcp"] < best["fcp"]):
            best = d
    tag = f"{url.replace('https://cognika.tech', '') or '/'} @{w}x{h}"
    if best:
        gf = [f for f in best["fontUrls"] if "googleapis" in f or "gstatic" in f]
        lf = [f for f in best["fontUrls"] if "cognika.tech" in f]
        print(f"{tag:20} TTFB={best['ttfb']:>5}ms FCP={best['fcp']:>5}ms LCP={str(best['lcp']):>5} "
              f"load={best['load']:>5}ms reqs={best['requests']:>2} google={len(gf)} local={len(lf)}")
        out.append({"label": label, "page": tag, **best})
    else:
        print(f"{tag:20} FAILED")

with open(f"/tmp/perf-{label}.json", "w") as fh:
    json.dump(out, fh, indent=2)
print(f"\nsaved /tmp/perf-{label}.json")
