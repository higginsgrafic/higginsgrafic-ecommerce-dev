#!/usr/bin/env python3
"""
Connecta el selector d'acabat (BLANC/COLOR/NEGRE) amb la tinta del dibuix a
totes les PDP de producte:
  - import dels helpers availableFinishesFor / defaultFinishFor
  - TDP_IMAGE rep l'acabat: (color, finish)
  - acabats disponibles + acabat per defecte segons la col·lecció
  - selectedFinish inicial des de ?finish (o per defecte)
  - crides TDP_IMAGE(...) passen selectedFinish
  - botons d'acabat amb 3r estat: inactiu (disabled) per als no disponibles
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS = ROOT / "src" / "pages" / "products"

IMPORT_OLD = "import { tdpImageFor } from '@/lib/pdpMockup';"
IMPORT_NEW = "import { tdpImageFor, availableFinishesFor, defaultFinishFor } from '@/lib/pdpMockup';"

TDP_OLD_SLUG = "const TDP_IMAGE = (color) => tdpImageFor(COLLECTION_SLUG, PRODUCT_ROUTE, color);"
TDP_NEW_SLUG = "const TDP_IMAGE = (color, finish) => tdpImageFor(COLLECTION_SLUG, PRODUCT_ROUTE, color, finish);"
TDP_OLD_IMG = "const TDP_IMAGE = (color) => tdpImageFor(IMAGE_COLLECTION, PRODUCT_ROUTE, color);"
TDP_NEW_IMG = "const TDP_IMAGE = (color, finish) => tdpImageFor(IMAGE_COLLECTION, PRODUCT_ROUTE, color, finish);"

FINISHES_OLD = "const FINISHES = ['BLANC', 'COLOR', 'NEGRE'];"

STATE_OLD = "  const [selectedFinish, setSelectedFinish] = useState('COLOR');"
STATE_NEW = (
    "  const urlFinish = searchParams.get('finish');\n"
    "  const initialFinish = urlFinish && AVAILABLE_FINISHES.includes(urlFinish) ? urlFinish : DEFAULT_FINISH;\n"
    "  const [selectedFinish, setSelectedFinish] = useState(initialFinish);"
)

CALLS = [
    ("src={TDP_IMAGE(topColor)}", "src={TDP_IMAGE(topColor, selectedFinish)}"),
    ("src={TDP_IMAGE(color)}", "src={TDP_IMAGE(color, selectedFinish)}"),
    ("src={TDP_IMAGE(mainVariantColor)}", "src={TDP_IMAGE(mainVariantColor, selectedFinish)}"),
]

BUTTON_OLD = """            {['BLANC', 'COLOR', 'NEGRE'].map((opt) => {
              const isActive = selectedFinish === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedFinish(opt)}
                  style={{
                    flex: 1,
                    fontFamily: `${finishButtonTextSettings.fontFamily}, sans-serif`,
                    fontSize: `${finishButtonTextSettings.fontSize}pt`,
                    fontWeight: isActive ? finishButtonTextSettings.selectedFontWeight : finishButtonTextSettings.fontWeight,
                    letterSpacing: `${finishButtonTextSettings.letterSpacing}em`,
                    lineHeight: finishButtonTextSettings.lineHeight,
                    textTransform: finishButtonTextSettings.textTransform,
                    color: isActive ? '#111827' : '#9ca3af',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderRadius: 'clamp(2.11px, 0.6vw, 3.8px)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {opt}
                </button>
              );
            })}"""

BUTTON_NEW = """            {['BLANC', 'COLOR', 'NEGRE'].map((opt) => {
              const isAvailable = AVAILABLE_FINISHES.includes(opt);
              const isActive = isAvailable && selectedFinish === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={!isAvailable}
                  onClick={isAvailable ? () => setSelectedFinish(opt) : undefined}
                  style={{
                    flex: 1,
                    fontFamily: `${finishButtonTextSettings.fontFamily}, sans-serif`,
                    fontSize: `${finishButtonTextSettings.fontSize}pt`,
                    fontWeight: isActive ? finishButtonTextSettings.selectedFontWeight : finishButtonTextSettings.fontWeight,
                    letterSpacing: `${finishButtonTextSettings.letterSpacing}em`,
                    lineHeight: finishButtonTextSettings.lineHeight,
                    textTransform: finishButtonTextSettings.textTransform,
                    color: !isAvailable ? '#d1d5db' : (isActive ? '#111827' : '#9ca3af'),
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderRadius: 'clamp(2.11px, 0.6vw, 3.8px)',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    opacity: isAvailable ? 1 : 0.45,
                    transition: 'all 150ms ease',
                    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {opt}
                </button>
              );
            })}"""

report = {"ok": [], "fail": []}

for fp in sorted(PRODUCTS.glob("*.jsx")):
    text = fp.read_text(encoding="utf-8")
    orig = text
    problems = []

    # 1) import helpers
    if IMPORT_OLD in text:
        text = text.replace(IMPORT_OLD, IMPORT_NEW, 1)
    elif IMPORT_NEW not in text:
        problems.append("import")

    # 2) TDP_IMAGE signature + col·lecció d'imatge
    is_austen_img = "const IMAGE_COLLECTION = " in text
    coll_expr = "IMAGE_COLLECTION" if is_austen_img else "COLLECTION_SLUG"
    if TDP_OLD_IMG in text:
        text = text.replace(TDP_OLD_IMG, TDP_NEW_IMG, 1)
    elif TDP_OLD_SLUG in text:
        text = text.replace(TDP_OLD_SLUG, TDP_NEW_SLUG, 1)
    elif TDP_NEW_IMG not in text and TDP_NEW_SLUG not in text:
        problems.append("tdp_image_sig")

    # 3) acabats disponibles + per defecte (després de FINISHES)
    if FINISHES_OLD in text and "const AVAILABLE_FINISHES" not in text:
        inject = (
            FINISHES_OLD
            + f"\nconst AVAILABLE_FINISHES = availableFinishesFor({coll_expr});"
            + f"\nconst DEFAULT_FINISH = defaultFinishFor({coll_expr});"
        )
        text = text.replace(FINISHES_OLD, inject, 1)
    elif "const AVAILABLE_FINISHES" not in text:
        problems.append("finishes_const")

    # 4) estat inicial selectedFinish
    if STATE_OLD in text:
        text = text.replace(STATE_OLD, STATE_NEW, 1)
    elif "useState(initialFinish)" not in text:
        problems.append("state")

    # 5) crides TDP_IMAGE
    for old, new in CALLS:
        if old in text:
            text = text.replace(old, new)

    # 6) botons amb 3r estat
    if BUTTON_OLD in text:
        text = text.replace(BUTTON_OLD, BUTTON_NEW, 1)
    elif "disabled={!isAvailable}" not in text:
        problems.append("buttons")

    if problems:
        report["fail"].append(f"{fp.name}: {', '.join(problems)}")
    elif text != orig:
        fp.write_text(text, encoding="utf-8")
        report["ok"].append(fp.name)

print(f"OK: {len(report['ok'])}")
print(f"FAIL: {len(report['fail'])}")
for f in report["fail"]:
    print("  ", f)
