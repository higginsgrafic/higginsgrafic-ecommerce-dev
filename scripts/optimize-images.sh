#!/bin/bash
# optimize-images.sh — Convertir imatges PNG/JPG a WebP i generar variants responsive
# Ús: ./scripts/optimize-images.sh [directori] [--quality=80] [--widths=400,800,1200]
# Requereix: cwebp (brew install webp), ImageMagick (brew install imagemagick)

set -euo pipefail

DIR="${1:-public/custom_logos}"
QUALITY="${2:-80}"
WIDTHS="${3:-400,800,1200}"

# Parsejant --quality=XX
if [[ "$QUALITY" == --quality=* ]]; then
  QUALITY="${QUALITY#--quality=}"
fi

# Parsejant --widths=XX,YY,ZZ
if [[ "$WIDTHS" == --widths=* ]]; then
  WIDTHS="${WIDTHS#--widths=}"
fi

IFS=',' read -ra WIDTH_ARRAY <<< "$WIDTHS"

echo "🔍 Directori: $DIR"
echo "📐 Qualitat WebP: $QUALITY"
echo "📏 Amples responsive: ${WIDTH_ARRAY[*]}"
echo ""

# Verificar eines
if ! command -v cwebp &> /dev/null; then
  echo "❌ cwebp no trobat. Instal·la'l amb: brew install webp"
  exit 1
fi

if ! command -v convert &> /dev/null; then
  echo "❌ ImageMagick no trobat. Instal·la'l amb: brew install imagemagick"
  exit 1
fi

# Comptadors
converted=0
skipped=0
errors=0
saved_bytes=0

# Processar imatges recursivament
process_image() {
  local file="$1"
  local ext="${file##*.}"
  ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

  # Només PNG i JPG
  if [[ "$ext" != "png" && "$ext" != "jpg" && "$ext" != "jpeg" ]]; then
    return
  fi

  # Si ja existeix el WebP, saltar
  local webp="${file%.*}.webp"
  if [[ -f "$webp" ]] && [[ "$webp" -nt "$file" ]]; then
    echo "⏭️  (existent) $file → $webp"
    skipped=$((skipped + 1))
    return
  fi

  local dir=$(dirname "$file")
  local name=$(basename "$file" ".$ext")

  # Convertir a WebP (mida original)
  echo "🔄 $file → $webp"
  if cwebp -q "$QUALITY" -quiet "$file" -o "$webp" 2>/dev/null; then
    local orig_size=$(stat -f%z "$file" 2>/dev/null || echo 0)
    local webp_size=$(stat -f%z "$webp" 2>/dev/null || echo 0)
    saved_bytes=$((saved_bytes + orig_size - webp_size))
    converted=$((converted + 1))

    # Generar variants responsive
    for width in "${WIDTH_ARRAY[@]}"; do
      local responsive="${dir}/${name}-${width}w.webp"
      if [[ ! -f "$responsive" ]] || [[ "$file" -nt "$responsive" ]]; then
        convert "$file" -resize "${width}x" -quality "$QUALITY" "$responsive" 2>/dev/null && \
          echo "   📐 Variant ${width}w: $responsive" || true
      fi
    done
  else
    echo "❌ Error convertint $file"
    errors=$((errors + 1))
  fi
}

export -f process_image

# Buscar imatges recursivament
echo "🔎 Buscant imatges a $DIR..."
while IFS= read -r -d '' file; do
  process_image "$file"
done < <(find "$DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -print0 2>/dev/null || true)

echo ""
echo "=========================================="
echo "📊 RESUM"
echo "=========================================="
echo "🔄 Convertides: $converted"
echo "⏭️  Saltades (ja existien): $skipped"
echo "❌ Errors: $errors"
if [[ $saved_bytes -gt 0 ]]; then
  saved_mb=$(echo "scale=2; $saved_bytes / 1048576" | bc)
  echo "💾 Estalvi: ${saved_mb} MB"
fi
echo "=========================================="