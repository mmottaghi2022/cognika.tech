"""
Click "EXPLORE SECTION" on the landing page for each orbit node and confirm it
navigates to that section's page instead of opening a dialog.
"""
import json
import subprocess
import time
import urllib.request
import websocket

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT = 9223
BASE = "http://127.0.0.1:8901"

proc = subprocess.Popen(
    [CHROME, "--headless=new", "--disable-gpu", f"--remote-debugging-port={PORT}",
     "--user-data-dir=/tmp/cdp-explore", "--no-first-run", "--window-size=1440,900",
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

# label on the orbit node -> expected path after clicking EXPLORE SECTION
cases = [
    ("ABOUT",    "/about/"),
    ("e_OS",     "/e-os/"),
    ("pat_ia",   "/pat-ia/"),
    ("Srm_p",    "/srm-p/"),
    ("DOWNLOADS", "/projects/"),
    ("CONTACT",  "/contact/"),
]

print('=== EXPLORE SECTION -> page navigation ===')
ok = 0
for label, expected in cases:
    cmd("Page.navigate", url=BASE + "/")
    time.sleep(1.2)
    # Hover the node so its panel becomes the active one, then click Explore.
    hovered = ev("""(() => {
        const nodes = [...document.querySelectorAll('a.orbit-node')];
        const n = nodes.find(a => ((a.querySelector('.node-label')||{}).textContent||'').trim() === %s);
        if (!n) return 'NOT_FOUND';
        n.dispatchEvent(new MouseEvent('mouseenter', {bubbles:true}));
        return 'ok';
    })()""" % json.dumps(label))
    time.sleep(0.7)
    btn = ev("""(() => {
        const b = document.getElementById('hoverAction');
        if (!b) return 'NO_BUTTON';
        if (b.hidden) return 'HIDDEN';
        b.click();
        return 'clicked';
    })()""")
    time.sleep(1.6)
    landed = ev("location.pathname")
    dialog_open = ev("(document.querySelector('dialog#detailDialog')||{}).open || false")
    good = (landed == expected) and (dialog_open is False)
    ok += 1 if good else 0
    print(f"  {label:10} hover={hovered:9} button={btn:9} landed={str(landed):14} "
          f"dialog_open={dialog_open}  {'PASS' if good else 'FAIL'}")

print(f"\nRESULT: {ok}/{len(cases)} Explore buttons navigate to the correct page")
ws.close()
proc.terminate()
