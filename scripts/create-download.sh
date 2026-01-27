#!/bin/bash

# Script per generar un arxiu de descàrrega del projecte complet
# Inclou el fitxer .env amb les credencials de Supabase

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_DIR/public"
OUTPUT_ZIP="$OUTPUT_DIR/project-download.zip"
OUTPUT_TAR="$OUTPUT_DIR/project-download.tar.gz"

echo "🚀 Generant arxius de descàrrega del projecte..."
echo "📁 Directori del projecte: $PROJECT_DIR"

# Anar al directori pare del projecte
cd "$(dirname "$PROJECT_DIR")"

# Crear l'arxiu zip (més compatible amb Mac)
echo "�� Creant fitxer .zip..."
zip -r "$OUTPUT_ZIP" "$(basename "$PROJECT_DIR")" \
  -x "*/node_modules/*" \
  -x "*/.git/*" \
  -x "*/dist/*" \
  -x "*/public/project-download.tar.gz" \
  -x "*/public/project-download.zip" \
  -q

if [ $? -eq 0 ]; then
  ZIP_SIZE=$(du -h "$OUTPUT_ZIP" | cut -f1)
  echo "✅ Arxiu .zip generat correctament!"
  echo "📦 Ubicació: $OUTPUT_ZIP"
  echo "📏 Mida: $ZIP_SIZE"
else
  echo "❌ Error generant l'arxiu .zip"
  exit 1
fi

# Crear també l'arxiu tar.gz
echo ""
echo "📦 Creant fitxer .tar.gz..."
tar -czf "$OUTPUT_TAR" \
  --exclude="node_modules" \
  --exclude=".git" \
  --exclude="dist" \
  --exclude="public/project-download.tar.gz" \
  --exclude="public/project-download.zip" \
  "$(basename "$PROJECT_DIR")"

if [ $? -eq 0 ]; then
  TAR_SIZE=$(du -h "$OUTPUT_TAR" | cut -f1)
  echo "✅ Arxiu .tar.gz generat correctament!"
  echo "📦 Ubicació: $OUTPUT_TAR"
  echo "📏 Mida: $TAR_SIZE"
  echo ""
  echo "Els fitxers estaran disponibles a:"
  echo "  - /project-download.zip (recomanat per a Mac)"
  echo "  - /project-download.tar.gz"
else
  echo "❌ Error generant l'arxiu .tar.gz"
  exit 1
fi
