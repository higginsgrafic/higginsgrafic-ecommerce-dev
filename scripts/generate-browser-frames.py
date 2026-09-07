#!/usr/bin/env python3
"""
Genera PNGs dels navegadors (chrome/barres) per cada format.
Els PNGs tenen el navegador a la part superior i la resta transparent,
per poder-los posar com a overlay de referència sobre el disseny.
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'browser-frames')
os.makedirs(OUT_DIR, exist_ok=True)

# Colors
CHROME_BG = (232, 232, 232, 255)
TAB_BG = (212, 212, 212, 255)
TAB_ACTIVE = (255, 255, 255, 255)
TAB_INACTIVE = (184, 184, 184, 255)
URL_BG = (240, 240, 240, 255)
URL_BORDER = (221, 221, 221, 255)
BOOKMARK_BG = (245, 245, 245, 255)
BOTTOM_BG = (248, 248, 248, 255)
STATUS_BG = (245, 245, 245, 255)
TEXT_COLOR = (85, 85, 85, 255)
TEXT_LIGHT = (136, 136, 136, 255)
URL_FIELD_BG = (255, 255, 255, 255)
URL_FIELD_BORDER = (221, 221, 221, 255)
TRAFFIC_RED = (255, 95, 87, 255)
TRAFFIC_YELLOW = (254, 188, 46, 255)
TRAFFIC_GREEN = (40, 200, 64, 255)
NOTCH_BG = (24, 24, 24, 255)
SAFE_AREA = (255, 0, 128, 30)  # rosa semi-transparent per safe-area

def get_font(size):
    try:
        return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
    except:
        try:
            return ImageFont.truetype("/System/Library/Fonts/SFNSMono.ttf", size)
        except:
            return ImageFont.load_default()

def draw_traffic_lights(draw, x, y, r=5):
    """Dibuixa els botons de macOS (verd, groc, vermell)"""
    colors = [TRAFFIC_RED, TRAFFIC_YELLOW, TRAFFIC_GREEN]
    for i, c in enumerate(colors):
        cx = x + i * (r * 2 + 4)
        draw.ellipse([cx, y, cx + r * 2, y + r * 2], fill=c)

def draw_tab(draw, x, y, w, h, text, active=True, font=None):
    """Dibuixa una pestanya"""
    bg = TAB_ACTIVE if active else TAB_INACTIVE
    tc = TEXT_COLOR if active else TEXT_LIGHT
    # Pestanya amb cantonades arrodonides a dalt
    draw.rounded_rectangle([x, y, x + w, y + h], radius=6, corners=(True, True, False, False), fill=bg)
    if font and text:
        draw.text((x + 8, y + (h - font.size) // 2 - 1), text[:20], fill=tc, font=font)

def draw_url_bar(draw, x, y, w, h, url="higginsgrafic.com", font=None, show_nav=True):
    """Dibuixa la barra d'URL"""
    draw.rectangle([x, y, x + w, y + h], fill=URL_BG)
    draw.line([x, y + h, x + w, y + h], fill=URL_BORDER, width=1)

    fx = x + 8
    if show_nav:
        # Botó enrere
        draw.ellipse([fx, y + (h-14)//2, fx + 14, y + (h-14)//2 + 14], fill=(204, 204, 204, 255))
        draw.text((fx + 3, y + (h-14)//2 - 1), "<", fill=(102, 102, 102, 255), font=font)
        fx += 20
        # Botó endavant
        draw.ellipse([fx, y + (h-14)//2, fx + 14, y + (h-14)//2 + 14], fill=(204, 204, 204, 255))
        draw.text((fx + 3, y + (h-14)//2 - 1), ">", fill=(102, 102, 102, 255), font=font)
        fx += 20

    # Camp URL
    field_w = w - (fx - x) - 12
    draw.rounded_rectangle([fx, y + 4, fx + field_w, y + h - 4], radius=8, fill=URL_FIELD_BG, outline=URL_FIELD_BORDER, width=1)
    lock_x = fx + 8
    if font:
        draw.text((lock_x, y + (h - font.size) // 2 - 1), f"{url}", fill=TEXT_COLOR, font=font)

def draw_bookmarks_bar(draw, x, y, w, h, font=None):
    """Dibuixa la barra de marcadors"""
    draw.rectangle([x, y, x + w, y + h], fill=BOOKMARK_BG)
    draw.line([x, y + h, x + w, y + h], fill=URL_BORDER, width=1)
    if font:
        draw.text((x + 10, y + (h - font.size) // 2 - 1), "★ Favorits    GRÀFIC    Admin", fill=TEXT_LIGHT, font=font)

def draw_bottom_bar(draw, x, y, w, h, font=None):
    """Dibuixa la barra inferior del mòbil (Safari iOS)"""
    draw.rectangle([x, y, x + w, y + h], fill=BOTTOM_BG)
    draw.line([x, y, x + w, y], fill=URL_BORDER, width=1)
    if font:
        items = [("<", "Enrere"), ("^", "Comp."), ("+", "Pest.")]
        spacing = w // len(items)
        for i, (icon, label) in enumerate(items):
            cx = x + spacing * i + spacing // 2
            draw.text((cx - 4, y + 6), icon, fill=TEXT_COLOR, font=font)
            label_font = get_font(max(font.size - 1, 8))
            draw.text((cx - 14, y + h - label_font.size - 4), label, fill=TEXT_LIGHT, font=label_font)

def draw_status_bar(draw, x, y, w, h, font=None, label=""):
    """Dibuixa la barra d'estat superior del mòbil"""
    draw.rectangle([x, y, x + w, y + h], fill=STATUS_BG)
    if font and label:
        draw.text((x + 8, y + (h - font.size) // 2 - 1), label, fill=TEXT_COLOR, font=font)

def draw_notch(draw, x, y, w, h):
    """Dibuixa el notch/Dynamic Island"""
    draw.rounded_rectangle([x, y, x + w, y + h], radius=h//2, fill=NOTCH_BG)

def save_png(img, name):
    path = os.path.join(OUT_DIR, name)
    img.save(path, "PNG")
    print(f"  ✓ {name} ({img.width}×{img.height})")

# ═══════════════════════════════════════════════════════════════
# DESKTOP - Chrome (1920×1080)
# ═══════════════════════════════════════════════════════════════
def make_desktop_chrome():
    W, H = 1920, 1080
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    f = get_font(13)
    f_small = get_font(11)

    y = 0
    # Barra de títol macOS (30px)
    draw.rectangle([0, y, W, y + 30], fill=CHROME_BG)
    draw_traffic_lights(draw, 12, y + 10, r=6)
    draw.text((W // 2 - 40, y + 8), "Chrome", fill=TEXT_LIGHT, font=f_small)
    y += 30

    # Barra de pestanyes (36px)
    draw.rectangle([0, y, W, y + 36], fill=TAB_BG)
    draw_tab(draw, 6, y + 4, 200, 32, "GRÀFIC - Samarretes Premium", True, f_small)
    draw_tab(draw, 210, y + 4, 120, 32, "Gmail", False, f_small)
    draw_tab(draw, 336, y + 4, 100, 32, "Figma", False, f_small)
    y += 36

    # Barra d'URL (40px)
    draw_url_bar(draw, 0, y, W, 40, "higginsgrafic.com", f, show_nav=True)
    y += 40

    # Barra de marcadors (28px)
    draw_bookmarks_bar(draw, 0, y, W, 28, f_small)
    y += 28

    # Marca la zona del viewport
    # Línia vermella puntejada
    for px in range(0, W, 8):
        draw.point((px, y), fill=(255, 0, 0, 200))
        draw.point((px, y + 1), fill=(255, 0, 0, 200))

    save_png(img, "desktop-chrome.png")

# ═══════════════════════════════════════════════════════════════
# TABLET HORIZONTAL - Safari iOS (1024×768)
# ═══════════════════════════════════════════════════════════════
def make_tablet_landscape_safari():
    W, H = 1024, 768
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    f = get_font(11)
    f_small = get_font(9)

    y = 0
    # Status bar (20px)
    draw_status_bar(draw, 0, y, W, 20, f_small, "•    100%")
    y += 20

    # Barra de pestanyes (26px)
    draw.rectangle([0, y, W, y + 26], fill=TAB_BG)
    draw_tab(draw, 4, y + 3, 160, 23, "GRÀFIC", True, f_small)
    draw_tab(draw, 168, y + 3, 80, 23, "Gmail", False, f_small)
    y += 26

    # Barra d'URL (32px)
    draw_url_bar(draw, 0, y, W, 32, "higginsgrafic.com", f_small, show_nav=True)
    y += 32

    # Marca viewport
    for px in range(0, W, 8):
        draw.point((px, y), fill=(255, 0, 0, 200))
        draw.point((px, y + 1), fill=(255, 0, 0, 200))

    save_png(img, "tablet-landscape-safari.png")

# ═══════════════════════════════════════════════════════════════
# TABLET VERTICAL - Safari iOS (768×1024)
# ═══════════════════════════════════════════════════════════════
def make_tablet_portrait_safari():
    W, H = 768, 1024
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    f = get_font(11)
    f_small = get_font(9)

    y = 0
    # Status bar (20px)
    draw_status_bar(draw, 0, y, W, 20, f_small, "•    100%")
    y += 20

    # Barra de pestanyes (24px)
    draw.rectangle([0, y, W, y + 24], fill=TAB_BG)
    draw_tab(draw, 4, y + 3, 140, 21, "GRÀFIC", True, f_small)
    draw_tab(draw, 148, y + 3, 70, 21, "Gmail", False, f_small)
    y += 24

    # Barra d'URL (28px)
    draw_url_bar(draw, 0, y, W, 28, "higginsgrafic.com", f_small, show_nav=True)
    y += 28

    # Marca viewport
    for px in range(0, W, 8):
        draw.point((px, y), fill=(255, 0, 0, 200))
        draw.point((px, y + 1), fill=(255, 0, 0, 200))

    save_png(img, "tablet-portrait-safari.png")

# ═══════════════════════════════════════════════════════════════
# MÒBIL VERTICAL - Safari iOS (390×844)
# ═══════════════════════════════════════════════════════════════
def make_mobile_portrait_safari():
    W, H = 390, 844
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    f = get_font(10)
    f_small = get_font(9)
    f_tiny = get_font(10)

    y = 0
    # Status bar / notch (44px)
    draw.rectangle([0, y, W, y + 44], fill=STATUS_BG)
    # Notch/Dynamic Island
    draw_notch(draw, W // 2 - 50, y + 8, 100, 28)
    draw.text((8, y + 14), "9:41", fill=TEXT_COLOR, font=f_small)
    draw.text((W - 50, y + 14), "100%", fill=TEXT_COLOR, font=f_small)
    y += 44

    # Barra d'URL (44px)
    draw_url_bar(draw, 0, y, W, 44, "higginsgrafic.com", f_small, show_nav=True)
    y += 44

    # Marca viewport superior
    for px in range(0, W, 6):
        draw.point((px, y), fill=(255, 0, 0, 200))
        draw.point((px, y + 1), fill=(255, 0, 0, 200))

    # Barra inferior (44px) - la dibuixem al final
    bottom_y = H - 44
    draw_bottom_bar(draw, 0, bottom_y, W, 44, f_tiny)

    # Marca viewport inferior
    for px in range(0, W, 6):
        draw.point((px, bottom_y - 1), fill=(255, 0, 0, 200))
        draw.point((px, bottom_y), fill=(255, 0, 0, 200))

    save_png(img, "mobile-portrait-safari.png")

# ═══════════════════════════════════════════════════════════════
# MÒBIL HORIZONTAL - Safari iOS (844×390)
# ═══════════════════════════════════════════════════════════════
def make_mobile_landscape_safari():
    W, H = 844, 390
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    f = get_font(10)
    f_small = get_font(10)

    y = 0
    # Barra única compacta (50px) - status + URL combinades
    draw.rectangle([0, y, W, y + 50], fill=STATUS_BG)
    # Notch lateral (esquerra)
    draw.rounded_rectangle([0, y, 30, y + 50], radius=0, fill=NOTCH_BG)

    # URL field
    fx = 40
    draw.rounded_rectangle([fx, y + 8, W - 50, y + 42], radius=8, fill=URL_FIELD_BG, outline=URL_FIELD_BORDER, width=1)
    draw.text((fx + 8, y + 16), "higginsgrafic.com", fill=TEXT_COLOR, font=f_small)

    # Botó pestanyes
    draw.text((W - 35, y + 16), "□", fill=TEXT_COLOR, font=f)
    y += 50

    # Marca viewport
    for px in range(0, W, 6):
        draw.point((px, y), fill=(255, 0, 0, 200))
        draw.point((px, y + 1), fill=(255, 0, 0, 200))

    save_png(img, "mobile-landscape-safari.png")

# ═══════════════════════════════════════════════════════════════
# PWA STANDALONE - sense navegador (390×844)
# ═══════════════════════════════════════════════════════════════
def make_pwa_standalone():
    W, H = 390, 844
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    f_small = get_font(8)

    # Només la status bar del sistema (14px)
    draw.rectangle([0, 0, W, 14], fill=(24, 24, 24, 200))
    draw.text((8, 1), "9:41", fill=(255, 255, 255, 255), font=f_small)
    draw.text((W - 40, 1), "100%", fill=(255, 255, 255, 255), font=f_small)

    # Marca viewport
    for px in range(0, W, 6):
        draw.point((px, 14), fill=(0, 255, 0, 200))
        draw.point((px, 15), fill=(0, 255, 0, 200))

    save_png(img, "pwa-standalone.png")

# ═══════════════════════════════════════════════════════════════
# Genera tot
# ═══════════════════════════════════════════════════════════════
print("Generant PNGs dels navegadors...")
make_desktop_chrome()
make_tablet_landscape_safari()
make_tablet_portrait_safari()
make_mobile_portrait_safari()
make_mobile_landscape_safari()
make_pwa_standalone()
print(f"\n✓ Tot guardat a: {OUT_DIR}")
