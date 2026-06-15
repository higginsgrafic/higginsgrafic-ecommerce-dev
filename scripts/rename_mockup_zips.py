"""Extract and rename mockup webp files from ZIPs into a normalized parallel
structure under public/placeholders/apparel/mockups/_renamed/.

Conventions:
- Directory names: lowercase, spaces -> '_', '&' -> 'and', other non-alnum collapsed to '_'.
- File names: lowercase, spaces -> '-', '&' -> 'and', other non-alnum collapsed to '-'.
- Variant folders BLANC/NEGRE/COLOR/BLACK/WHITE are NOT preserved as directories;
  their info is encoded in the filename's variant token (b/w/multi).
- File pattern: <coll-segs>-<design-slug>-<variant>-<shirt-color>.webp
  where variant is derived from the zip filename suffix (-b/-w/-multi),
  falling back to the parent variant folder if absent.
- Shirt color is extracted from each inner ZIP folder name token gco_<color>_gpr.
"""

from __future__ import annotations

import re
import sys
import zipfile
from pathlib import Path

ROOT = Path("public/placeholders/apparel/mockups")
OUT = ROOT / "_renamed"

VARIANT_FOLDERS = {
    "BLANC": "w",
    "NEGRE": "b",
    "COLOR": "multi",
    "BLACK": "b",
    "WHITE": "w",
}


def _slug(s: str, sep: str) -> str:
    s = s.lower().replace("&", " and ")
    s = re.sub(r"[^a-z0-9]+", sep, s)
    return s.strip(sep)


def slug_dir(s: str) -> str:
    return _slug(s, "_")


def slug_file(s: str) -> str:
    return _slug(s, "-")


def parse_zip_stem(stem: str) -> tuple[str, str | None]:
    """Return (design_slug_for_filename, variant_or_None)."""
    s = stem.strip().rstrip("-").strip()
    low = s.lower()
    for suffix, v in (("-multi", "multi"), ("-b", "b"), ("-w", "w")):
        if low.endswith(suffix):
            return slug_file(s[: -len(suffix)]), v
    return slug_file(s), None


_GCO_RE = re.compile(r"_gco_([a-z0-9-]+)_gpr_", re.IGNORECASE)


def extract_color(path_in_zip: str) -> str | None:
    m = _GCO_RE.search(path_in_zip)
    return m.group(1).lower() if m else None


def find_zips(root: Path) -> list[Path]:
    out = []
    for p in root.rglob("*.zip"):
        if "_renamed" in p.parts:
            continue
        out.append(p)
    return out


_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.IGNORECASE,
)
_IMG_EXTS = (".webp", ".png", ".jpg", ".jpeg")


def find_design_dirs(root: Path) -> list[Path]:
    """Find loose, unzipped 'design folders': directories that directly contain
    one or more apparel_product_* color subfolders. Skips folders named like a
    bare UUID (ambiguous, no design name)."""
    out = []
    for p in root.rglob("apparel_product_*"):
        if "_renamed" in p.parts or not p.is_dir():
            continue
        parent = p.parent
        if _UUID_RE.match(parent.name):
            continue
        if parent not in out:
            out.append(parent)
    return out


def process() -> None:
    if not ROOT.exists():
        print(f"ERROR: missing {ROOT}", file=sys.stderr)
        sys.exit(1)

    zips = sorted(find_zips(ROOT))
    if not zips:
        print("No ZIPs found.")
        return

    OUT.mkdir(parents=True, exist_ok=True)

    total_files = 0
    skipped: list[tuple[str, str, str]] = []
    no_variant_zips: list[str] = []

    for z in zips:
        rel = z.relative_to(ROOT)
        parts = list(rel.parts[:-1])  # parent dirs within mockups

        # Strip trailing variant folder if present.
        variant_default: str | None = None
        if parts and parts[-1] in VARIANT_FOLDERS:
            variant_default = VARIANT_FOLDERS[parts[-1]]
            collection_levels = parts[:-1]
        else:
            collection_levels = parts

        design_slug, variant = parse_zip_stem(z.stem)
        if variant is None:
            if variant_default is None:
                no_variant_zips.append(str(rel))
                continue
            variant = variant_default

        coll_dir_parts = [slug_dir(p) for p in collection_levels]
        coll_file_parts = [slug_file(p) for p in collection_levels]

        out_dir = OUT.joinpath(*coll_dir_parts) if coll_dir_parts else OUT
        out_dir.mkdir(parents=True, exist_ok=True)

        try:
            with zipfile.ZipFile(z) as zf:
                for info in zf.infolist():
                    if info.is_dir():
                        continue
                    low = info.filename.lower()
                    ext = None
                    for e in (".webp", ".png", ".jpg", ".jpeg"):
                        if low.endswith(e):
                            ext = e
                            break
                    if ext is None:
                        continue
                    color = None
                    for seg in info.filename.split("/"):
                        c = extract_color(seg)
                        if c:
                            color = c
                            break
                    if not color:
                        skipped.append((str(rel), info.filename, "no-color"))
                        continue

                    name_parts = coll_file_parts + [design_slug, variant, color]
                    fname = "-".join(p for p in name_parts if p) + ext
                    out_path = out_dir / fname

                    with zf.open(info) as src, open(out_path, "wb") as dst:
                        dst.write(src.read())
                    total_files += 1
        except zipfile.BadZipFile as e:
            skipped.append((str(rel), "<zip>", f"bad-zip: {e}"))

    # --- Loose (unzipped) design directories, e.g. CUBE/ ---
    no_variant_dirs: list[str] = []
    for d in sorted(find_design_dirs(ROOT)):
        rel = d.relative_to(ROOT)
        parts = list(rel.parts[:-1])  # parent dirs above the design folder

        variant_default = None
        if parts and parts[-1] in VARIANT_FOLDERS:
            variant_default = VARIANT_FOLDERS[parts[-1]]
            collection_levels = parts[:-1]
        else:
            collection_levels = parts

        design_slug, variant = parse_zip_stem(d.name)
        if variant is None:
            if variant_default is None:
                no_variant_dirs.append(str(rel))
                continue
            variant = variant_default

        coll_dir_parts = [slug_dir(p) for p in collection_levels]
        coll_file_parts = [slug_file(p) for p in collection_levels]

        out_dir = OUT.joinpath(*coll_dir_parts) if coll_dir_parts else OUT
        out_dir.mkdir(parents=True, exist_ok=True)

        for img in sorted(d.rglob("*")):
            if not img.is_file():
                continue
            ext = None
            low = img.name.lower()
            for e in _IMG_EXTS:
                if low.endswith(e):
                    ext = e
                    break
            if ext is None:
                continue
            color = None
            for seg in img.relative_to(d).parts:
                c = extract_color(seg)
                if c:
                    color = c
                    break
            if not color:
                skipped.append((str(rel), str(img.relative_to(d)), "no-color"))
                continue

            name_parts = coll_file_parts + [design_slug, variant, color]
            fname = "-".join(p for p in name_parts if p) + ext
            with open(img, "rb") as src, open(out_dir / fname, "wb") as dst:
                dst.write(src.read())
            total_files += 1

    print(f"Wrote {total_files} files into {OUT}")
    if no_variant_dirs:
        print(f"\nSkipped {len(no_variant_dirs)} design dirs with no derivable variant:")
        for p in no_variant_dirs:
            print("  -", p)
    if no_variant_zips:
        print(f"\nSkipped {len(no_variant_zips)} zips with no derivable variant:")
        for p in no_variant_zips:
            print("  -", p)
    if skipped:
        print(f"\nSkipped {len(skipped)} entries inside zips:")
        for r, f, why in skipped[:30]:
            print(f"  - [{why}] {r} :: {f}")
        if len(skipped) > 30:
            print(f"  ... and {len(skipped) - 30} more")


if __name__ == "__main__":
    process()
