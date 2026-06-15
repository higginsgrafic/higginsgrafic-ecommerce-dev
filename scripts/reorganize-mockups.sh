#!/bin/bash
# Script per reanomenar i reorganitzar mockups de col·leccions
# Format: <col·lecció>-<subcategories>-<nom-producte>-<color>.ext

set -uo pipefail

BASE_DIR="public/placeholders/apparel/mockups/MOCKUPS"
OUTPUT_DIR="public/placeholders/apparel/mockups/renamed"
DRY_RUN="${DRY_RUN:-false}"

mkdir -p "$OUTPUT_DIR"

log() {
    echo "[$(date '+%H:%M:%S')] $*"
}

# Funció per "slugificar" noms
slugify() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[&]+/and/g; s/[^a-z0-9]/-/g; s/-+/-/g; s/^-//; s/-$//'
}

# Funció per traduir noms de color a anglès
map_color() {
    local dirname
    dirname=$(echo "$1" | tr '[:upper:]' '[:lower:]')
    case "$dirname" in
        blanc|white)     echo "white" ;;
        negre|black)     echo "black" ;;
        color|multi)     echo "multi" ;;
        *)               echo "" ;;
    esac
}

# Extreure color del nom de subcarpeta Gelato (gco_xxx)
extract_gelato_color() {
    local dirname="$1"
    echo "$dirname" | grep -oE 'gco_[^_]+' | sed 's/gco_//' | head -1
}

renamed_count=0

# =============================================
# PROCESSAR FITXERS .ZIP
# =============================================
log "Processant fitxers .ZIP..."

while IFS= read -r -d '' file; do
    # Obtenir el camí relatiu des de BASE_DIR
    rel_path="${file#$BASE_DIR/}"
    
    # Obtenir el directori i el nom del fitxer
    dir_part=$(dirname "$rel_path")
    filename=$(basename "$file")
    name_no_ext="${filename%.zip}"
    
    # Separar el path en components (evitant problemes amb espais)
    # Obtenir col·lecció (primer component)
    collection=$(echo "$dir_part" | cut -d'/' -f1)
    collection_slug=$(slugify "$collection")
    
    # Obtenir la resta de components (subcategories + possible color)
    rest=$(echo "$dir_part" | cut -d'/' -f2-)
    
    # Recórrer subdirectoris per trobar color i subcategories
    color=""
    subcats=""
    
    if [ -n "$rest" ] && [ "$rest" != "$dir_part" ]; then
        # Separar per /
        old_IFS="$IFS"
        IFS='/'
        first=true
        for part in $rest; do
            mapped=$(map_color "$part")
            if [ -n "$mapped" ]; then
                color="$mapped"
            else
                part_slug=$(slugify "$part")
                if [ "$first" = true ]; then
                    subcats="$part_slug"
                    first=false
                else
                    subcats="${subcats}-${part_slug}"
                fi
            fi
        done
        IFS="$old_IFS"
    fi
    
    # Si no s'ha detectat color, intentar extreure'l del nom del fitxer
    if [ -z "$color" ]; then
        if echo "$name_no_ext" | grep -qiE '\-w$'; then
            color="white"
        elif echo "$name_no_ext" | grep -qiE '\-b$'; then
            color="black"
        elif echo "$name_no_ext" | grep -qiE '\-multi$|multi$'; then
            color="multi"
        else
            color="unknown"
        fi
    fi
    
    # Netejar el nom base (treure sufixos de color)
    clean_name=$(echo "$name_no_ext" | sed -E 's/-w$//; s/-b$//; s/-multi-?$//; s/ multi$//')
    clean_name=$(slugify "$clean_name")
    # Netejar guions múltiples al clean_name també
    clean_name=$(echo "$clean_name" | sed -E 's/-+/-/g')
    
    # Si les subcategories són idèntiques al nom net, evitar duplicació
    if [ -n "$subcats" ]; then
        if [ "$subcats" = "$clean_name" ]; then
            # subcats i clean_name idèntics -> no duplicar
            new_name="${collection_slug}-${subcats}-${color}.zip"
        else
            # Comprovar si el nom net comença per l'última subcategoria
            last_subcat=$(echo "$subcats" | sed 's/.*-//')
            if echo "$clean_name" | grep -q "^${last_subcat}-"; then
                shorter_name=$(echo "$clean_name" | sed "s/^${last_subcat}-//")
                new_name="${collection_slug}-${subcats}-${shorter_name}-${color}.zip"
            else
                new_name="${collection_slug}-${subcats}-${clean_name}-${color}.zip"
            fi
        fi
    else
        new_name="${collection_slug}-${clean_name}-${color}.zip"
    fi
    
    # Netejar guions múltiples
    new_name=$(echo "$new_name" | sed -E 's/-+/-/g')
    
    dest="$OUTPUT_DIR/$new_name"
    
    if [ "$DRY_RUN" = "true" ]; then
        log "DRY-RUN: $rel_path -> $new_name"
    else
        cp "$file" "$dest"
        log "OK: $new_name"
    fi
    
    renamed_count=$((renamed_count + 1))
done < <(find "$BASE_DIR" -not -path "*/CUBE/*" -name "*.zip" -type f -print0)

# =============================================
# PROCESSAR FITXERS .WEBP DE CUBE
# =============================================
log "Processant fitxers CUBE (.webp)..."

while IFS= read -r -d '' file; do
    rel_path="${file#$BASE_DIR/CUBE/}"
    
    # Primer component: disseny
    design=$(echo "$rel_path" | cut -d'/' -f1)
    design_slug=$(slugify "$design")
    
    # Segon component: subcarpeta Gelato amb color
    gelato_dir=$(echo "$rel_path" | cut -d'/' -f2)
    
    # Tercer component: nom del fitxer .webp
    webp_name=$(echo "$rel_path" | cut -d'/' -f3)
    
    # Extreure color del directori Gelato
    color=$(extract_gelato_color "$gelato_dir")
    [ -z "$color" ] && color="unknown"
    
    # Extreure extensió
    ext="${webp_name##*.}"
    
    new_name="cube-${design_slug}-${color}.${ext}"
    new_name=$(echo "$new_name" | sed -E 's/-+/-/g')
    
    dest="$OUTPUT_DIR/$new_name"
    
    if [ "$DRY_RUN" = "true" ]; then
        log "DRY-RUN: CUBE/$rel_path -> $new_name"
    else
        cp "$file" "$dest"
        log "OK: $new_name"
    fi
    
    renamed_count=$((renamed_count + 1))
done < <(find "$BASE_DIR/CUBE" -name "*.webp" -type f -print0)

log "===== RESUM ====="
log "Total processats: $renamed_count fitxers copiats a $OUTPUT_DIR"
log "Executa amb DRY_RUN=true per veure què es faria sense copiar."
log "Quan estiguis satisfet, pots moure $OUTPUT_DIR a la ubicació final."