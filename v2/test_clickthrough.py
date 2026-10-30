"""
Click-through test: confirm the landing-page navigator nodes actually navigate
to the new pages, in a real browser with JavaScript enabled.
"""
import json
import subprocess
import time
import urllib.request
import websocket

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT = 9222
BASE = "http://127.0.0.1:8901"

proc = subprocess.Popen(
    [CHROME, "--headless=new", "--disable-gpu", f"--remote-debugging-port={PORT}",
     "--user-data-dir=/tmp/chrome-cdp-profile2", "--no-first-run", "--window-size=1440,900",
     "about:blank"],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
)

def ws_connect():
    for _ in range(60):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json", timeout=1) as r:
                for t in json.load(r):
                    if t.get("type") == "page":
                        return websocket.create_connection(t["webSocketDebuggerUrl"], timeout=10)
        except Exception:
            time.sleep(0.25)
    return None

ws = ws_connect()
if ws is None:
    print("CDP unavailable")
    proc.terminate()
    raise SystemExit(1)

_id = [0]

def cmd(method, **params):
    _id[0] += 1
    ws.send(json.dumps({"id": _id[0], "method": method, "params": params}))
    while True:
        msg = json.loads(ws.recv())
        if msg.get("id") == _id[0]:
            return msg.get("result", {})

def ev(expr):
    r = cmd("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True)
    return r.get("result", {}).get("value")

cmd("Page.enable")
cmd("Runtime.enable")

targets = [
    ("ABOUT",    "/about/"),
    ("e_OS",     "/e-os/"),
    ("pat_ia",   "/pat-ia/"),
    ("Srm_p",    "/srm-p/"),
    ("PROJECTS", "/projects/"),
    ("CONTACT",  "/contact/"),
]

print("=== NAVIGATOR CLICK-THROUGH (real browser, JS enabled) ===")
ok = 0
for label, expected in targets:
    cmd("Page.navigate", url=BASE + "/")
    time.sleep(1.3)
    clicked = ev("""(() => {
        const nodes = [...document.querySelectorAll('a.orbit-node')];
        const n = nodes.find(a => ((a.querySelector('.node-label')||{}).textContent||'').trim() === %s);
        if (!n) return 'NOT_FOUND';
        n.click();
        return n.getAttribute('href');
    })()""" % json.dumps(label))
    time.sleep(1.8)
    landed = ev("location.pathname")
    h1 = ev("((document.querySelector('h1')||{}).textContent||'').trim()")
    good = (landed == expected)
    ok += 1 if good else 0
    print(f"  {label:9} href={str(clicked):11} landed={str(landed):24} h1={str(h1)[:20]:22} {'PASS' if good else 'FAIL'}")

print(f"RESULT: {ok}/{len(targets)} navigator nodes navigated correctly")
ws.close()
proc.terminate()
