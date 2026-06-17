"""One-off import for the PONT DEL DIABLE mockups.

Source: three zips (b.zip / w.zip / multi.zip) located INSIDE the target dir,
each with 14 color subfolders named ..._gco_<color>_gpr_..., containing
new_flatlay_front.webp.
Target: public/.../miscellania/pont_del_diable/
        miscellania-pont-del-diable-pont-del-diable-<ink>-<color>.webp
"""

from __future__ import annotations

import os
import re
import zipfile

DST = (
    "/Users/marc/EXTRA LOCAL/PROJECTES LOCAL/GRUP HIGGINS/GRÀFIC/BOTIGUES/ECOMMERCE/"
    "PROJECTE/ECOMMERCE-WEB/higginsgrafic-ecommerce-dev/public/placeholders/apparel/"
    "mockups/miscellania/pont_del_diable"
)

PREFIX = "miscellania-pont-del-diable-pont-del-diable"

GCO = re.compile(r"_gco_([a-z0-9-]+)_gpr_", re.IGNORECASE)
INKS = {"b.zip": "b", "w.zip": "w", "multi.zip": "multi"}

SHIRT_COLORS = {
    "white", "light-blue", "royal", "purple", "navy", "daisy", "gold",
    "light-pink", "red", "kiwi", "irish-green", "military-green",
    "forest-green", "black",
}


def main() -> None:
    os.makedirs(DST, exist_ok=True)

    # Remove existing pont-del-diable mockups (if any) before importing.
    removed = 0
    for f in os.listdir(DST):
        if f.startswith(PREFIX + "-") and f.endswith(".webp"):
            os.remove(os.path.join(DST, f))
            removed += 1
    print(f"Removed {removed} existing files")

    written = 0
    for zname, ink in INKS.items():
        zp = os.path.join(DST, zname)
        if not os.path.exists(zp):
            print(f"MISSING ZIP: {zp}")
            continue
        with zipfile.ZipFile(zp) as zf:
            for info in zf.infolist():
                if info.is_dir():
                    continue
                if not info.filename.lower().endswith(".webp"):
                    continue
                color = None
                for seg in info.filename.split("/"):
                    m = GCO.search(seg)
                    if m:
                        color = m.group(1).lower()
                        break
                if not color:
                    print(f"NO COLOR: {zname} :: {info.filename}")
                    continue
                if color not in SHIRT_COLORS:
                    print(f"UNKNOWN COLOR '{color}': {zname} :: {info.filename}")
                    continue
                out = os.path.join(DST, f"{PREFIX}-{ink}-{color}.webp")
                with zf.open(info) as src, open(out, "wb") as dst:
                    dst.write(src.read())
                written += 1

    print(f"Wrote {written} files into {DST}")


if __name__ == "__main__":
    main()
