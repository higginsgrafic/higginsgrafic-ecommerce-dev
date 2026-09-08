#!/bin/bash
# Optimitza imatges: PNG/JPG → WebP (max 800px), WebP existents > 800px redimensionats
set -euo pipefail

PUBLIC_DIR="$(cd "$(dirname "$0")" && pwd)/public"
MAX_SIZE=800
QUALITY=85

echo "=== Optimitzant imatges a WebP (max ${MAX_SIZE}px, qualitat ${QUALITY}) ==="

# Comptadors
PNG_COUNT=0
JPG_COUNT=0
WEBP_RESIZED=0
SKIPPED=0
ERRORS=0

# 1. Convertir PNG → WebP
echo ""
echo "=== Convertint PNG → WebP ==="
while IFS= read -r -d '' f; do
  webp_path="${f%.png}.webp"
  # Redimensiona i converteix
  if magick "$f" -resize "${MAX_SIZE}x${MAX_SIZE}>" "$webp_path" 2>/dev/null; then
    rm "$f"
    PNG_COUNT=$((PNG_COUNT + 1))
    if [ $((PNG_COUNT % 50)) -eq 0 ]; then
      echo "  ... $PNG_COUNT PNG convertits"
    fi
  else
    echo "  ERROR: $f"
    ERRORS=$((ERRORS + 1))
  fi
done < <(find "$PUBLIC_DIR" -name "*.png" -type f -print0)

# 2. Convertir JPG/JPEG → WebP
echo ""
echo "=== Convertint JPG → WebP ==="
while IFS= read -r -d '' f; do
  webp_path="${f%.jpg}.webp"
  if [ "${f##*.}" = "jpeg" ]; then
    webp_path="${f%.jpeg}.webp"
  fi
  if magick "$f" -resize "${MAX_SIZE}x${MAX_SIZE}>" "$webp_path" 2>/dev/null; then
    rm "$f"
    JPG_COUNT=$((JPG_COUNT + 1))
  else
    echo "  ERROR: $f"
    ERRORS=$((ERRORS + 1))
  fi
done < <(find "$PUBLIC_DIR" \( -name "*.jpg" -o -name "*.jpeg" \) -type f -print0)

# 3. Redimensionar WebP existents > 800px
echo ""
echo "=== Redimensionant WebP > ${MAX_SIZE}px ==="
while IFS= read -r -d '' f; do
  # Obtenir dimensions
  dims=$(sips -g pixelWidth -g pixelHeight "$f" 2>/dev/null)
  w=$(echo "$dims" | grep pixelWidth | awk '{print $2}')
  h=$(echo "$dims" | grep pixelHeight | awk '{print $2}')
  if [ -z "$w" ] || [ -z "$h" ]; then
    SKIPPED=$((SKIPPED + 1))
    continue
  fi
  if [ "$w" -gt "$MAX_SIZE" ] || [ "$h" -gt "$MAX_SIZE" ]; then
    # Redimensionar in-place
    tmp="${f}.tmp.webp"
    if magick "$f" -resize "${MAX_SIZE}x${MAX_SIZE}>" "$tmp" 2>/dev/null; then
      mv "$tmp" "$f"
      WEBP_RESIZED=$((WEBP_RESIZED + 1))
      if [ $((WEBP_RESIZED % 50)) -eq 0 ]; then
        echo "  ... $WEBP_RESIZED WebP redimensionats"
      fi
    else
      rm -f "$tmp"
      echo "  ERROR: $f"
      ERRORS=$((ERRORS + 1))
    fi
  fi
done < <(find "$PUBLIC_DIR" -name "*.webp" -type f -print0)

echo ""
echo "=== Resultats ==="
echo "  PNG convertits:    $PNG_COUNT"
echo "  JPG convertits:    $JPG_COUNT"
echo "  WebP redimensionats: $WEBP_RESIZED"
echo "  Skipped:           $SKIPPED"
echo "  Errors:            $ERRORS"
echo ""
echo "=== Mida total WebP després ==="
find "$PUBLIC_DIR" -name "*.webp" -exec du -ck {} + 2>/dev/null | tail -1
