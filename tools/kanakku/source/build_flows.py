"""Build the offline screens page: tasks in order, dark by default, the bill itself kept light.

Usage: python3 -I build_flows.py <source_dir> <out_file>
"""
import html
import re
import sys
from pathlib import Path

src = Path(sys.argv[1])
out_file = Path(sys.argv[2])

USERS = [
    ("Billing user", "billing", [
        ("b-bill", "Make a bill and print it", [
            ("Main", "Tap the items the customer wants. Then tap View bill."),
            ("Bill", "Check the bill, choose Cash, UPI or Card, and tap Print. The share button sends the bill as a PDF. "
                     "The green WhatsApp button shows only when a phone number is typed."),
        ]),
        ("b-share", "Send the bill to the customer as a PDF", [
            ("Bill", "Tap the share button beside Print."),
            ("Share", "Change the message if you want, then tap Share and choose the app. The bill goes as a PDF with the message."),
        ]),
        ("b-find", "Find one of today's bills and print it again", [
            ("Main", "Tap Today's bills at the bottom."),
            ("Bills", "Find the bill and open it, then tap Print again or WhatsApp. "
                      "A billing user sees today's bills only, with three tabs at the bottom."),
        ]),
        ("b-printer", "The printer is not printing, or another person takes over", [
            ("Main", "Tap Me at the bottom."),
            ("Cashier", "Tap Connect again or Test print. Switch user asks for the other person's PIN."),
        ]),
        ("b-pc", "Make a bill on the PC", [
            ("Desktop", "Items are on the left and the bill stays open on the right, so one screen does both steps."),
        ]),
    ]),
    ("Admin", "admin", [
        ("a-item", "Add, change, hide or delete a menu item", [
            ("Admin", "Tap Menu items."),
            ("Items", "Tap + Add item, or Edit on a row. The switch hides an item without deleting it."),
            ("ItemEdit", "Fill in the details and tap Save. Delete is the red button at the bottom."),
        ]),
        ("a-staff", "Add a billing user and choose what they may do", [
            ("Admin", "Tap Staff."),
            ("Staff", "Tap + Add person. The lines below the list open when tapped, to allow or stop each action."),
        ]),
        ("a-bills", "Check or cancel any bill", [
            ("Admin", "Tap Bills at the bottom."),
            ("Bills", "Pick the date, find the bill and open it. Cancelling asks for a reason."),
        ]),
        ("a-day", "See today's sales and export the bills", [
            ("Admin", "Tap Today at the bottom."),
            ("Today", "See the total and how people paid. Export today's bills gives a file of them. Counting the cash is optional."),
        ]),
        ("a-printer", "Set up the printer or fix the print alignment", [
            ("Admin", "Tap Printer and bill design."),
            ("Printer", "Each line opens when tapped: Paper, How the bill is printed, Test prints and Preview. Then save."),
        ]),
        ("a-backup", "Back up, restore, or change where bills are kept", [
            ("Admin", "Tap Storage and backup."),
            ("Storage", "Each line opens when tapped: where bills are kept, Backup, Backup files and Restore."),
        ]),
    ]),
]

# ---- colours become variables, so one page can be dark or light ----
BG = {"#FFFFFF": "surface", "#F4F5F7": "ground", "#F3F4F6": "fill", "#F7F8FA": "fill2",
      "#ECEEF2": "fill3", "#E9EBEF": "fill3", "#1B1E24": "strong"}
TEXT = {"#1B1E24": "text", "#3C424D": "text2", "#5E6470": "muted", "#A12A14": "danger",
        "#8A2B0E": "danger2", "#A34A00": "warn", "#145C39": "ok"}
LINE = {"#DDE0E6": "line", "#E3E6EB": "line", "#E7E9EE": "line2", "#EEF0F3": "line2",
        "#C9CED6": "linebold", "#D5D9E0": "linebold"}
TINTS = ("#E6F3EC", "#E5EEFB", "#FFF1D6", "#FBE7E1", "#DDF1EF", "#EFE8FA")


def map_decl(prop, value):
    table = BG if prop == "background" else TEXT if prop == "color" else LINE
    return re.sub(r"#[0-9A-Fa-f]{6}\b", lambda m: f"var(--{table[m.group(0)]})" if m.group(0) in table else m.group(0), value)


def map_style(m):
    style = m.group(1)
    if any(f"background: {t}" in style for t in TINTS) or "border-radius: 50%; background: #FFFFFF" in style:
        return m.group(0)
    out = []
    for decl in style.split(";"):
        if ":" in decl:
            prop, value = decl.split(":", 1)
            p = prop.strip()
            if p in ("background", "color") or p.startswith("border") and "radius" not in p:
                value = map_decl("line" if p.startswith("border") else p, value)
            decl = prop + ":" + value
        out.append(decl)
    return 'style="' + ";".join(out) + '"'


# the parts that are the bill itself stay light, like paper
PAPER = [
    '<pre style="',
]
PC_LINES = '<div style="display: flex; flex-direction: column">\n<div style="display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #EEF0F3; font-size: 14px"><span style="font-weight: 600">Tea</span>'

first_instance = {}
for _, _, flows in USERS:
    for fid, _, steps in flows:
        for stem, _ in steps:
            first_instance.setdefault(stem, f"{fid}-{stem}")


def screen_markup(stem, fid, flow_stems):
    text = (src / f"{stem}.dc.html").read_text(encoding="utf-8")
    body = re.search(r"<x-dc>(.*)</x-dc>", text, re.S).group(1)
    body = re.sub(r"<helmet>.*?</helmet>", "", body, flags=re.S)
    body = body.replace("{{accent}}", "var(--accent)")
    if "{{" in body:
        raise SystemExit(f"unreplaced hole in {stem}")
    for marker in PAPER:
        body = body.replace(marker, marker.replace("<div ", '<div class="paper" ', 1).replace("<pre ", '<pre class="paper" ', 1))
    body = re.sub(r'style="([^"]*)"', map_style, body)
    body = body.replace('stroke="#1B1E24"', 'style="stroke:var(--text)"').replace('stroke="#5E6470"', 'style="stroke:var(--muted)"')
    inst = f"{fid}-{stem}"

    def screen_link(m):
        target = m.group(1)
        if target in flow_stems:
            return f'href="#{fid}-{target}"'
        return f'href="#{first_instance.get(target, inst)}"'

    body = re.sub(r'href="([A-Za-z]+)\.dc\.html"', screen_link, body)
    body = re.sub(r'\bid="([^"]+)"', lambda m: f'id="{inst}--{m.group(1)}"', body)
    body = re.sub(r'\bfor="([^"]+)"', lambda m: f'for="{inst}--{m.group(1)}"', body)
    body = re.sub(r'aria-labelledby="([^"]+)"', lambda m: f'aria-labelledby="{inst}--{m.group(1)}"', body)
    body = re.sub(r'href="#(fav|hot|snacks|cold|bakery|sweets|save)"', lambda m: f'href="#{inst}--{m.group(1)}"', body)
    return body.strip()


ARROW = ('<div class="arrow" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" '
         'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'
         '<path d="M4 12h15M13 6l6 6-6 6"></path></svg></div>')

parts, nav = [], []
count = 0
for user, ukey, flows in USERS:
    parts.append(f'<h2 class="user" id="{ukey}">{html.escape(user)}</h2>')
    nav.append(f'<div class="navgroup"><a class="navuser" href="#{ukey}">{html.escape(user)}</a>')
    for fid, title, steps in flows:
        nav.append(f'<a href="#{fid}">{html.escape(title)}</a>')
        stems = [s for s, _ in steps]
        wide = stems == ["Desktop"]
        parts.append(f'<section class="flow" id="{fid}">\n<h3 class="flowtitle">{html.escape(title)}</h3>\n<div class="steps">')
        for i, (stem, what) in enumerate(steps, 1):
            if i > 1:
                parts.append(ARROW)
            cls = "step wide" if wide else "step"
            label = f"Step {i}" if len(steps) > 1 else "One screen"
            parts.append(
                f'<div class="{cls}" id="{fid}-{stem}">\n'
                f'<p class="cap"><span class="num">{label}</span> {html.escape(what)}</p>\n'
                f'<div class="screen">\n{screen_markup(stem, fid, stems)}\n</div>\n</div>'
            )
            count += 1
        parts.append("</div>\n</section>")
    nav.append("</div>")

LIGHT = ("--surface:#FFFFFF;--ground:#F4F5F7;--fill:#F3F4F6;--fill2:#F7F8FA;--fill3:#ECEEF2;--strong:#1B1E24;"
         "--text:#1B1E24;--text2:#3C424D;--muted:#5E6470;--line:#DDE0E6;--line2:#EEF0F3;--linebold:#C9CED6;"
         "--danger:#A12A14;--danger2:#8A2B0E;--warn:#A34A00;--ok:#145C39;--link:#174A96")
DARK = ("--surface:#1E2229;--ground:#121419;--fill:#2A2F39;--fill2:#181B21;--fill3:#303641;--strong:#3B414D;"
        "--text:#F2F4F7;--text2:#C9CED6;--muted:#9DA4B0;--line:#3A404B;--line2:#2C313A;--linebold:#4A515E;"
        "--danger:#FF8E7A;--danger2:#FF9A82;--warn:#FFB26B;--ok:#6FDCA3;--link:#8CB8FF")

page = f"""<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Shop Billing App: Screens by Task</title>
<style>
:root{{--accent:#FF6B00;{LIGHT};--page:#DFE2E8;--box:#EEF0F4;--pagetext:#1B1E24;--pagemuted:#3C424D}}
html[data-theme="dark"]{{{DARK};--page:#0B0C0F;--box:#15171C;--pagetext:#F2F4F7;--pagemuted:#B4BAC5}}
html .screen .paper{{{LIGHT}}}
html{{scroll-behavior:smooth}}
body{{margin:0;background:var(--page);color:var(--pagetext);font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}}
button{{font-family:inherit;cursor:pointer}}
input,textarea{{font-family:inherit}}
.screen input,.screen textarea{{background:var(--surface);color:var(--text)}}
.screen input::placeholder{{color:var(--muted)}}
.vh{{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}}
.screen a{{color:var(--link)}}
.paper{{background:var(--surface);color:var(--text)}}
.paperpad{{padding:2px 12px;border-radius:12px}}
summary{{list-style:none}}summary::-webkit-details-marker{{display:none}}
.chev{{flex-shrink:0;transition:transform .15s}}details[open]>summary .chev{{transform:rotate(90deg)}}
.screen svg[role="img"]{{background:#FFFFFF;border-radius:3px}}
.top{{background:#1B1E24;color:#FFFFFF;padding:14px 16px 16px}}
.toprow{{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px}}
.top h1{{margin:0;font-size:18px;font-weight:800}}
.top p{{margin:4px 0 0;font-size:13px;color:#C9D3E0}}
.tools{{display:flex;flex-wrap:wrap;align-items:center;gap:8px 18px;margin-left:auto;font-size:12px}}
.swatches{{display:flex;align-items:center;gap:8px}}
.swatches button{{width:26px;height:26px;border-radius:50%;border:2px solid #FFFFFF;padding:0}}
.swatches input{{width:34px;height:28px;padding:0;border:0;background:transparent}}
.theme{{display:flex;border:1.5px solid #FFFFFF;border-radius:999px;overflow:hidden}}
.theme button{{height:30px;padding:0 14px;border:0;background:transparent;color:#FFFFFF;font-size:12px;font-weight:700}}
.theme button[aria-pressed="true"]{{background:#FFFFFF;color:#1B1E24}}
.navs{{display:flex;flex-wrap:wrap;gap:14px 40px;margin-top:14px}}
.navgroup{{display:flex;flex-direction:column;gap:6px;font-size:13px}}
.navgroup a{{color:#C9D3E0;text-decoration:none}}
.navgroup a:hover{{color:#FFFFFF}}
.navgroup .navuser{{color:#FFFFFF;font-weight:800;font-size:14px}}
.user{{margin:34px 16px 4px;font-size:26px;font-weight:800;scroll-margin-top:12px}}
.flow{{margin:14px 16px 0;padding:18px 18px 22px;background:var(--box);border-radius:20px;scroll-margin-top:12px}}
.flowtitle{{margin:0 0 14px;font-size:18px;font-weight:800}}
.steps{{display:flex;flex-wrap:wrap;align-items:flex-start;gap:18px}}
.step{{width:390px;max-width:100%;scroll-margin-top:12px}}
.step.wide{{width:100%;max-width:1280px}}
.cap{{margin:0 0 10px;min-height:54px;font-size:13px;line-height:1.4;color:var(--pagemuted)}}
.num{{display:inline-block;margin-right:6px;padding:2px 9px;border-radius:999px;background:var(--accent);color:#FFFFFF;font-size:12px;font-weight:800}}
.screen{{border-radius:22px;overflow:hidden;box-shadow:0 6px 22px rgba(0,0,0,.35);background:var(--surface);max-width:100%;outline:1px solid var(--line2)}}
.arrow{{align-self:center;color:var(--pagemuted);padding-top:54px}}
.note{{margin:24px 16px 40px;font-size:12px;color:var(--pagemuted)}}
</style>
</head>
<body>
<header class="top">
<div class="toprow">
<h1>Shop Billing App: Screens by Task</h1>
<div class="tools">
<div class="theme" role="group" aria-label="Look">
<button data-t="dark" aria-pressed="true">Dark</button><button data-t="light" aria-pressed="false">Light</button>
</div>
<div class="swatches"><span>Colour</span>
<button aria-label="Bright orange" style="background:#FF6B00" data-c="#FF6B00"></button>
<button aria-label="Bright red" style="background:#E23744" data-c="#E23744"></button>
<button aria-label="Bright pink" style="background:#E91E8C" data-c="#E91E8C"></button>
<button aria-label="Bright green" style="background:#00A651" data-c="#00A651"></button>
<button aria-label="Bright blue" style="background:#1677FF" data-c="#1677FF"></button>
<button aria-label="Bright purple" style="background:#7C3AED" data-c="#7C3AED"></button>
<button aria-label="Dark green" style="background:#1F7A4D" data-c="#1F7A4D"></button>
<label class="vh" for="pick">Any colour</label><input id="pick" type="color" value="#FF6B00">
</div>
</div>
</div>
<p>Each box below is one task. Read the screens left to right: that is the order the person taps through them. The app is dark by default. Only the printed bill and the PDF are white.</p>
<nav class="navs" aria-label="Tasks">{''.join(nav)}</nav>
</header>
{chr(10).join(parts)}
<p class="note">Sample names and numbers. This file works with no internet. A screen can appear in more than one task.</p>
<script>
(function(){{
var root=document.documentElement,pick=document.getElementById('pick');
function set(c){{root.style.setProperty('--accent',c);pick.value=c;try{{localStorage.setItem('accent',c)}}catch(e){{}}}}
document.querySelectorAll('.swatches button').forEach(function(b){{b.addEventListener('click',function(){{set(b.dataset.c)}})}});
pick.addEventListener('input',function(){{set(pick.value)}});
function theme(t){{root.setAttribute('data-theme',t);document.querySelectorAll('.theme button').forEach(function(b){{b.setAttribute('aria-pressed',String(b.dataset.t===t))}});try{{localStorage.setItem('theme',t)}}catch(e){{}}}}
document.querySelectorAll('.theme button').forEach(function(b){{b.addEventListener('click',function(){{theme(b.dataset.t)}})}});
try{{var s=localStorage.getItem('accent');if(s)set(s);var t=localStorage.getItem('theme');if(t)theme(t)}}catch(e){{}}
}})();
</script>
</body>
</html>
"""
out_file.write_text(page, encoding="utf-8")
print("screens placed:", count, "bytes:", len(page.encode("utf-8")))
