#!/usr/bin/env python3
"""
Substitueix el bloc inline del poster "CADA PERSONA TÉ UNA HISTÒRIA…" per el
component <StoryPosterLink /> a totes les pàgines que el contenen, i afegeix
l'import corresponent.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

targets = [SRC / "pages" / "HomeClean.jsx", SRC / "pages" / "ConstructorPdpPage.jsx"]
targets += sorted((SRC / "pages" / "products").glob("*.jsx"))

BLOCK_RE = re.compile(
    r"<div\s+style=\{\{\s*textAlign: 'left',\s*fontFamily: 'Oswald, sans-serif',\s*"
    r"fontSize: '60pt',[\s\S]*?<div>UN DIBUIX</div>\s*</div>",
)

IMPORT_LINE = "import StoryPosterLink from '@/components/StoryPosterLink';"

changed = []
skipped = []
for fp in targets:
    text = fp.read_text(encoding="utf-8")
    if "UN DIBUIX" not in text:
        skipped.append(fp.name)
        continue
    new_text, n = BLOCK_RE.subn("<StoryPosterLink />", text)
    if n == 0:
        skipped.append(f"{fp.name} (no match)")
        continue
    # Afegir import si no hi és: després de l'última línia d'import del bloc inicial.
    if IMPORT_LINE not in new_text:
        lines = new_text.split("\n")
        last_import = 0
        for i, ln in enumerate(lines[:60]):
            if ln.startswith("import "):
                last_import = i
        lines.insert(last_import + 1, IMPORT_LINE)
        new_text = "\n".join(lines)
    fp.write_text(new_text, encoding="utf-8")
    changed.append(f"{fp.name} (x{n})")

print("CHANGED:")
for c in changed:
    print("  ", c)
print(f"\nTOTAL CHANGED: {len(changed)}")
print("SKIPPED:")
for s in skipped:
    print("  ", s)
