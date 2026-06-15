#!/usr/bin/env python3
"""
Genera pàgines PDP dedicades clonant la plantilla TheHumanInsideAfroditaPage.jsx.
Substitueix les 5 constants de producte, el nom de la funció, l'export i el
comentari de capçalera. Per a AUSTEN, separa la col·lecció d'imatge (subcol·lecció)
de la ruta ('austen').
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_DIR = ROOT / "src" / "pages" / "products"
TEMPLATE = PRODUCTS_DIR / "TheHumanInsideAfroditaPage.jsx"

# Manifest: (collection_slug, collection_name, route, name, image_collection|None, component)
# image_collection només per austen (subcol·lecció del catàleg de mockups).

def pascal(*parts):
    out = []
    for p in parts:
        for token in re.split(r"[-_/]", p):
            if not token:
                continue
            out.append(token[:1].upper() + token[1:].lower())
    return "".join(out)

def comp_name(collection_slug, route):
    return pascal(collection_slug, route) + "Page"

thin = [
    ("robbie-the-robot", "ROBBIE THE ROBOT"),
    ("terminator", "TERMINATOR"),
    ("the-dalek", "THE DALEK"),
]
misc = [
    ("arthur-d-the-second", "ARTHUR D THE SECOND"),
    ("r2d2-quote", "R2D2 QUOTE"),
]
# austen: (image_collection, route, name)
austen = [
    ("austen-pemberley", "pemberley-house", "PEMBERLEY HOUSE"),
    ("austen-keep-calm", "keep-calm", "KEEP CALM"),
    ("austen-quotes", "quotes-half-agony-half-hope", "HALF AGONY HALF HOPE"),
    ("austen-quotes", "quotes-i-admire-and-love-you", "I ADMIRE AND LOVE YOU"),
    ("austen-quotes", "quotes-it-is-a-truth", "IT IS A TRUTH"),
    ("austen-quotes", "quotes-unsociable-and-taciturn", "UNSOCIABLE AND TACITURN"),
    ("austen-quotes", "quotes-you-have-bewitched-me", "YOU HAVE BEWITCHED ME"),
    ("austen-crosswords", "persuasion-1", "PERSUASION 1"),
    ("austen-crosswords", "persuasion-2", "PERSUASION 2"),
    ("austen-crosswords", "persuasion-3", "PERSUASION 3"),
    ("austen-crosswords", "persuasion-4", "PERSUASION 4"),
    ("austen-crosswords", "pride-and-prejudice-1", "PRIDE & PREJUDICE 1"),
    ("austen-crosswords", "pride-and-prejudice-2", "PRIDE & PREJUDICE 2"),
    ("austen-crosswords", "pride-and-prejudice-3", "PRIDE & PREJUDICE 3"),
    ("austen-crosswords", "pride-and-prejudice-4", "PRIDE & PREJUDICE 4"),
    ("austen-crosswords", "sense-and-sensibility-1", "SENSE & SENSIBILITY 1"),
    ("austen-crosswords", "sense-and-sensibility-2", "SENSE & SENSIBILITY 2"),
    ("austen-crosswords", "sense-and-sensibility-3", "SENSE & SENSIBILITY 3"),
    ("austen-crosswords", "sense-and-sensibility-4", "SENSE & SENSIBILITY 4"),
    ("austen-looking-for-my-darcy", "looking-for-my-darcy-blue-solid", "LOOKING FOR MY DARCY"),
    ("austen-looking-for-my-darcy", "looking-for-my-darcy-pink-solid", "LOOKING FOR MY DARCY"),
    ("austen-looking-for-my-darcy", "looking-for-my-darcy-pink-yellow-frame", "LOOKING FOR MY DARCY"),
    ("austen-looking-for-my-darcy", "looking-for-my-darcy-red-solid", "LOOKING FOR MY DARCY"),
    ("austen-looking-for-my-darcy", "looking-for-my-darcy-red-yellow-frame", "LOOKING FOR MY DARCY"),
    ("austen-looking-for-my-darcy", "looking-for-my-darcy-yellow-blue-frame", "LOOKING FOR MY DARCY"),
    ("austen-looking-for-my-darcy", "looking-for-my-darcy-yellow-pink-frame", "LOOKING FOR MY DARCY"),
    ("austen-looking-for-my-darcy", "looking-for-my-darcy-yellow-solid", "LOOKING FOR MY DARCY"),
]

manifest = []
for route, name in thin:
    manifest.append(dict(cslug="the-human-inside", cname="THE HUMAN INSIDE",
                         route=route, name=name, img=None,
                         comp=comp_name("the-human-inside", route)))
for route, name in misc:
    manifest.append(dict(cslug="miscellania", cname="MISCEL·LÀNIA",
                         route=route, name=name, img=None,
                         comp=comp_name("miscellania", route)))
for img, route, name in austen:
    manifest.append(dict(cslug="austen", cname="AUSTEN",
                         route=route, name=name, img=img,
                         comp="Austen" + pascal(route) + "Page"))

template = TEMPLATE.read_text(encoding="utf-8")

TEMPLATE_CONST_BLOCK = (
    "const PRODUCT_SLUG = 'the-human-inside-afrodita';\n"
    "const PRODUCT_ROUTE = 'afrodita';\n"
    "const PRODUCT_NAME = \"AFRODITA\";\n"
    "const COLLECTION_NAME = \"THE HUMAN INSIDE\";\n"
    "const COLLECTION_SLUG = 'the-human-inside';\n"
)
TEMPLATE_TDP = "const TDP_IMAGE = (color) => tdpImageFor(COLLECTION_SLUG, PRODUCT_ROUTE, color);"
TEMPLATE_HEADER = "//  PDP de producte — THE HUMAN INSIDE · AFRODITA"
TEMPLATE_FN = "function TheHumanInsideAfroditaPage() {"
TEMPLATE_EXPORT = "export default TheHumanInsideAfroditaPage;"

routes_out = []
for m in manifest:
    text = template
    product_slug = f"{m['cslug']}-{m['route']}" if not m['img'] else f"austen-{m['route']}"
    const_block = (
        f"const PRODUCT_SLUG = '{product_slug}';\n"
        f"const PRODUCT_ROUTE = '{m['route']}';\n"
        f"const PRODUCT_NAME = \"{m['name']}\";\n"
        f"const COLLECTION_NAME = \"{m['cname']}\";\n"
        f"const COLLECTION_SLUG = '{m['cslug']}';\n"
    )
    if m['img']:
        const_block += f"const IMAGE_COLLECTION = '{m['img']}';\n"
        tdp = "const TDP_IMAGE = (color) => tdpImageFor(IMAGE_COLLECTION, PRODUCT_ROUTE, color);"
    else:
        tdp = TEMPLATE_TDP

    text = text.replace(TEMPLATE_CONST_BLOCK, const_block, 1)
    text = text.replace(TEMPLATE_TDP, tdp, 1)
    text = text.replace(TEMPLATE_HEADER, f"//  PDP de producte — {m['cname']} · {m['name']}", 1)
    text = text.replace(TEMPLATE_FN, f"function {m['comp']}() {{", 1)
    text = text.replace(TEMPLATE_EXPORT, f"export default {m['comp']};", 1)

    out_path = PRODUCTS_DIR / f"{m['comp']}.jsx"
    out_path.write_text(text, encoding="utf-8")
    routes_out.append((m['comp'], f"/{m['cslug']}/{m['route']}"))
    print(f"WROTE {out_path.name}")

print("\n--- IMPORTS ---")
for comp, _ in routes_out:
    print(f"const {comp} = lazy(() => import('@/pages/products/{comp}'));")
print("\n--- ROUTES ---")
for comp, path in routes_out:
    print(f'<Route path="{path}" element={{<{comp} />}} />')
print(f"\nTOTAL: {len(routes_out)} pàgines")
