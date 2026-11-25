from pathlib import Path
from html import escape
import re
import textwrap

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/adaptive-ui/mockups"
OUT.mkdir(parents=True, exist_ok=True)

css = (ROOT / "frontend/src/app/styles/design-system.css").read_text()

def tokens(block):
    return dict(re.findall(r'--od-([\w-]+):\s*([^;]+);', block))

dark = tokens(re.search(r':root\s*\{([^}]+)\}', css).group(1))
light = {
    **dark,
    **tokens(re.search(r":root\[data-theme='light'\]\s*\{([^}]+)\}", css).group(1))
}

class SVG:
    def __init__(self, w, h, theme):
        self.w, self.h, self.t = w, h, theme
        self.items = []
        self.rect(0, 0, w, h, theme["bg"], r=0)

    def rect(self, x, y, w, h, fill, stroke="none", r=10, opacity=1):
        self.items.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" '
            f'rx="{r}" fill="{fill}" stroke="{stroke}" opacity="{opacity}"/>'
        )

    def text(self, x, y, value, size=16, color="text", weight=400, anchor="start"):
        self.items.append(
            f'<text x="{x}" y="{y}" font-family="Inter, Arial, sans-serif" '
            f'font-size="{size}" font-weight="{weight}" '
            f'fill="{self.t.get(color, color)}" text-anchor="{anchor}">'
            f'{escape(str(value))}</text>'
        )

    def paragraph(self, x, y, value, width, size=14, color="muted"):
        lines = textwrap.wrap(value, max(12, int(width / (size * .54))))
        for i, line in enumerate(lines):
            self.text(x, y + i * size * 1.7, line, size, color)
        return len(lines) * size * 1.7

    def panel(self, x, y, w, h, r=18):
        self.rect(x, y, w, h, self.t["surface"], self.t["border"], r)

    def button(self, x, y, w, label, state="default"):
        if state == "focus":
            self.rect(x-4, y-4, w+8, 52, "none", self.t["accent"], 12)
        start = len(self.items)
        self.rect(x, y, w, 44, self.t["surface"], self.t["control-border"])
        self.text(x+w/2, y+28, label, 14, "accent", 600, "middle")
        if state == "disabled":
            self.items[start:] = ['<g opacity=".55">'] + self.items[start:] + ['</g>']

    def field(self, x, y, w, label, value="", error=False):
        self.text(x, y, label, 14)
        self.rect(x, y+10, w, 44, self.t["surface"], self.t["control-border"])
        self.text(x+12, y+38, value, 14, "text")
        if error:
            self.text(x, y+74, "Enter a valid email address.", 13, "error")

    def icon(self, x, y, name, color="muted"):
        paths = {
            "Settings": "M2 5 H18 M7 2 V8 M2 15 H18 M13 12 V18",
            "Home": "M2 10 L10 3 L18 10 M4 9 V18 H16 V9 M8 18 V12 H12 V18",
            "Analysis": "M3 4 H17 V16 H3 Z M6 13 L10 8 L14 13",
            "Models": "M7 2 H13 M8 2 V8 L2 18 H18 L12 8 V2",
            "History": "M3 10 A7 7 0 1 0 5 5 M3 3 V8 H8 M10 6 V10 L14 12",
            "Account": "M10 3 A4 4 0 1 0 10 11 A4 4 0 1 0 10 3 M3 19 Q3 13 10 13 Q17 13 17 19"
        }
        self.items.append(
            f'<g transform="translate({x},{y})" fill="none" '
            f'stroke="{self.t[color]}" stroke-width="1.5" '
            f'stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="{paths[name]}"/></g>'
        )

    def nav(self, x, y, w, label, icon, active=False, compact=False):
        h = 48 if compact else 44
        if active:
            self.rect(x, y, w, h, self.t["accent"], r=10, opacity=.12)
        color = "accent" if active else "muted"
        if compact:
            self.icon(x+w/2-10, y+4, icon, color)
            self.text(x+w/2, y+38, label, 12, color, 400, "middle")
        else:
            self.icon(x+12, y+12, icon, color)
            self.text(x+40, y+27, label, 14, color)

    def save(self, filename):
        content = (
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'width="{self.w}" height="{self.h}" '
            f'viewBox="0 0 {self.w} {self.h}">'
            + "\n".join(self.items) + "</svg>"
        )
        (OUT / filename).write_text(content, encoding="utf-8")
        print("Created:", filename)

actions = [
    ("01", "Satellite Analysis",
     "Upload multispectral satellite imagery and explore marine debris detection.",
     "Start analysis"),
    ("02", "ML Experiments",
     "Explore model performance and compare RGB and multispectral approaches.",
     "Explore experiments"),
    ("03", "Analysis History",
     "Access previously submitted satellite images and analysis results.",
     "View history")
]

navigation = [
    ("Dashboard", "Home"),
    ("Satellite Analysis", "Analysis"),
    ("ML Experiments", "Models"),
    ("Analysis History", "History"),
    ("Account", "Account")
]

def dashboard(device, w, viewport_h, cols, theme, theme_name):
    # Mobile mockup includes the complete scrollable page.
    h = max(viewport_h, 1280 if device == "mobile" else viewport_h)
    s = SVG(w, h, theme)
    m = 16
    aw = w - 2*m
    desktop = device == "desktop"
    mobile = device == "mobile"

    top = min(64, max(16, w*.04))
    brand = min(88, max(32, w*.06))

    s.text(m, top+12, "SATELLITE INTELLIGENCE PLATFORM", 11, "accent", 700)
    s.text(m, top+brand+24, "Ocean Detective", brand, "text", 700)
    end = s.paragraph(
        m, top+brand+50,
        "Detection and analysis of marine debris using Sentinel-2 satellite imagery.",
        aw, 16
    )

    y = top+brand+50+end+12
    s.panel(m, y, aw, 46, 16)
    s.icon(m+16, y+13, "Settings")
    s.text(m+46, y+29, "Display settings", 16)
    y += 70

    if desktop:
        s.panel(m, y, 230, 310)
        s.text(m+28, y+35, "WORKSPACE", 11, "accent", 700)
        for i, (full, short) in enumerate(navigation):
            s.nav(m+16, y+52+i*48, 198, full, short, i==0)
        x = m+254
        cw = aw-254
    else:
        s.panel(m, y, aw, 120)
        nw = (aw-24)/3
        for i, (_, short) in enumerate(navigation):
            s.nav(m+8+(i%3)*(nw+4), y+8+(i//3)*52,
                  nw, short, short, i==0, True)
        y += 136
        x, cw = m, aw

    s.text(x, y+12, "PLATFORM OVERVIEW", 12, "accent", 700)
    s.text(x, y+55, "Dashboard", 28 if not desktop else 42, "text", 700)
    end = s.paragraph(
        x, y+83,
        "A research-oriented platform for marine debris detection and multispectral satellite image analysis.",
        min(cw,680), 16
    )
    y += 83+end+12

    gap = 16
    cardw = (cw-gap*(cols-1))/cols
    cardh = 172 if mobile else 196
    pad = 16 if not desktop else 24

    for i, (number, title, desc, label) in enumerate(actions):
        xx = x+(i%cols)*(cardw+gap)
        yy = y+(i//cols)*(cardh+gap)
        s.panel(xx, yy, cardw, cardh)
        s.text(xx+pad, yy+30, number, 13, "accent", 600)
        s.text(xx+pad, yy+59, title, 20, "text", 700)
        s.paragraph(xx+pad, yy+85, desc, cardw-2*pad, 14)
        s.text(xx+pad, yy+cardh-18, label+" →", 14, "accent", 600)

    y += ((len(actions)+cols-1)//cols)*(cardh+gap)+8

    about_h = 330 if mobile else 190
    s.panel(x, y, cw, about_h)
    s.text(x+pad, y+30, "ABOUT THE PROJECT", 12, "accent", 700)
    s.text(x+pad, y+60, "Marine Debris Detection", 20, "text", 700)
    end = s.paragraph(
        x+pad, y+86,
        "Ocean Detective is designed to support marine pollution monitoring through the analysis of multispectral Sentinel-2 satellite imagery and machine learning techniques.",
        cw-2*pad, 14
    )

    tx, ty = x+pad, y+86+end+8
    for tag in ["Sentinel-2", "MARIDA", "Multispectral Imagery",
                "Machine Learning", "Semantic Segmentation"]:
        tw = len(tag)*6.5+24
        if tx+tw > x+cw-pad:
            tx, ty = x+pad, ty+34
        s.rect(tx, ty, tw, 28, theme["accent"], r=14, opacity=.08)
        s.text(tx+12, ty+18, tag, 12, "accent")
        tx += tw+8

    s.h = max(h, int(y+about_h+24), int(ty+52))
    # Expand background to the complete page height.
    s.items[0] = re.sub(r'height="[^"]+"', f'height="{s.h}"', s.items[0], count=1)
    s.save(f"{device}-{theme_name}.svg")

for name, theme in [("light", light), ("dark", dark)]:
    dashboard("desktop", 1440, 900, 3, theme, name)
    dashboard("tablet", 768, 1024, 2, theme, name)
    dashboard("mobile", 390, 844, 1, theme, name)

# Component library: both themes on one board.
kit = SVG(1440, 1340, light)

for i, (name, theme) in enumerate([("LIGHT", light), ("DARK", dark)]):
    s = SVG(700, 1340, theme)

    s.text(28, 42, "OCEAN DETECTIVE", 13, "accent", 700)
    s.text(28, 84, name+" — UI Kit", 32, "text", 700)

    s.text(28, 126, "01 / COLOR TOKENS", 13, "accent", 700)

    keys = ["bg", "surface", "text", "muted", "accent",
            "border", "control-border", "success", "error"]

    for j, key in enumerate(keys):
        x = 28+(j%3)*218
        y = 144+(j//3)*76
        s.rect(x, y, 48, 48, theme[key], theme["border"], 8)
        s.text(x+58, y+18, key, 13, "text", 600)
        s.text(x+58, y+38, theme[key].upper(), 12, "muted")

    s.text(28, 394, "02 / TYPOGRAPHY", 13, "accent", 700)
    s.text(28, 445, "Ocean Detective", 42, "text", 700)
    s.text(28, 483, "Dashboard", 28, "text", 700)
    s.text(28, 515, "Satellite Analysis", 20, "text", 700)
    s.text(28, 542, "Body text / 16 px", 16)
    s.text(28, 566, "Secondary text / 14 px", 14, "muted")

    s.text(28, 608, "03 / BUTTON STATES", 13, "accent", 700)

    for j, state in enumerate(["default", "focus", "disabled"]):
        x = 28+j*218
        s.text(x, 634, state.title(), 13, "muted")
        s.button(x, 646, 196, "Run Analysis", state)

    s.text(28, 736, "04 / FORM CONTROLS", 13, "accent", 700)
    s.field(28, 764, 310, "Email")
    s.field(362, 764, 310, "Email", "invalid-email", True)

    s.rect(28, 866, 20, 20, theme["surface"], theme["control-border"], 3)
    s.text(58, 881, "Confirm band order", 14)
    s.rect(362, 866, 20, 20, theme["accent"], r=3)
    s.text(372, 881, "✓", 16, "bg", 700, "middle")
    s.text(392, 881, "Confirmed", 14)

    s.text(28, 932, "05 / NAVIGATION", 13, "accent", 700)
    s.panel(28, 950, 644, 66)

    for j, (_, short) in enumerate(navigation):
        s.nav(36+j*126, 958, 122, short, short, j==0, True)

    s.text(28, 1060, "06 / CONTENT & FEEDBACK", 13, "accent", 700)

    s.panel(28, 1078, 310, 156)
    s.text(44, 1106, "01", 13, "accent", 600)
    s.text(44, 1134, "Satellite Analysis", 20, "text", 700)
    s.paragraph(44, 1160, "Upload multispectral satellite imagery.", 278)
    s.text(44, 1212, "Start analysis →", 14, "accent", 600)

    s.panel(362, 1078, 310, 156)
    s.text(378, 1110, "Upload status", 18, "text", 700)
    s.text(378, 1144, "Image validated and saved.", 14, "success")
    s.text(378, 1178, "File size must not exceed 25 MiB.", 13, "error")

    s.text(28, 1280, "Touch target: 44 px  ·  Panel radius: 16 px", 14, "muted")
    s.text(28, 1306, "Spacing: 16 px  ·  Checkbox: 20 × 20 px", 14, "muted")

    kit.items.append(f'<g transform="translate({i*720},0)">')
    kit.items.extend(s.items)
    kit.items.append('</g>')

kit.save("ui-kit.svg")

print("All mockups generated successfully.")
