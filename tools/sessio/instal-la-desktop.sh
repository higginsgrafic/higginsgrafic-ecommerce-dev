#!/bin/bash
# =============================================================================
# instal-la-desktop.sh — Crea (o treu) les icones de l'escriptori
# =============================================================================
#
# Escriu dos fitxers .command a l'escriptori que criden `sessio.sh`. Un
# .command és el mecanisme del macOS perquè un doble clic executi un guió al
# Terminal, i per això no cal cap aplicació ni cap instal·lació.
#
#   ./instal-la-desktop.sh                 instal·la a ~/Desktop
#   ./instal-la-desktop.sh /altre/cami     instal·la en una altra carpeta
#   ./instal-la-desktop.sh --desinstal-la  treu les icones
#
# Els fitxers generats són embolcalls prims: tota la lògica viu a sessio.sh,
# de manera que si el projecte canvia, només cal tornar a executar això.
# =============================================================================

set -u

SESSIO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SESSIO_DIR/../.." && pwd)"
GUIO="$SESSIO_DIR/sessio.sh"

NOM_ENGEGA="Higgins - Engega sessio.command"
NOM_ATURA="Higgins - Atura sessio.command"

DESTI="$HOME/Desktop"
DESINSTAL="0"

for arg in "$@"; do
  case "$arg" in
    --desinstal-la|--desinstal·la) DESINSTAL="1" ;;
    -h|--ajuda|--help)
      sed -n '5,15p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) DESTI="$arg" ;;
  esac
done

if [ "$DESINSTAL" = "1" ]; then
  for nom in "$NOM_ENGEGA" "$NOM_ATURA"; do
    if [ -e "$DESTI/$nom" ]; then
      rm -f "$DESTI/$nom" && echo "Tret: $DESTI/$nom"
    fi
  done
  exit 0
fi

if [ ! -x "$GUIO" ]; then
  echo "ERROR: no trobo el guió executable $GUIO" >&2
  exit 1
fi

if [ ! -d "$DESTI" ]; then
  echo "ERROR: la carpeta de destí no existeix: $DESTI" >&2
  exit 1
fi

escriu_embolcall() {  # $1 = nom del fitxer, $2... = arguments fixos
  local nom="$1"; shift
  local args=""
  local a
  for a in "$@"; do args="$args \"$a\""; done

  if ! cat > "$DESTI/$nom" <<TXT
#!/bin/bash
# Generat per tools/sessio/instal-la-desktop.sh el $(date '+%d/%m/%Y %H:%M').
# No cal editar-ho a mà: tota la lògica és a sessio.sh.
GUIO="$GUIO"

if [ ! -x "\$GUIO" ]; then
  echo "No trobo el guió de la sessió:"
  echo "  \$GUIO"
  echo "Si has mogut el projecte, torna a executar:"
  echo "  tools/sessio/instal-la-desktop.sh"
  printf 'Prem Enter per tancar… '
  read -r _
  exit 1
fi

exec "\$GUIO"$args "\$@"
TXT
  then
    echo "ERROR: no he pogut escriure $DESTI/$nom" >&2
    echo "       (cal permís d'escriptura a la carpeta de destí)" >&2
    return 1
  fi

  chmod 755 "$DESTI/$nom" || {
    echo "ERROR: no he pogut fer executable $DESTI/$nom" >&2
    return 1
  }
  echo "Creat: $DESTI/$nom"
}

escriu_embolcall "$NOM_ENGEGA" || exit 1
escriu_embolcall "$NOM_ATURA" --aturar || exit 1

echo
echo "Fet. Ara, a l'escriptori:"
echo "  «${NOM_ENGEGA}»  doble clic per reprendre la sessió (DSH + proves)."
echo "  «${NOM_ATURA}»         doble clic per aturar-ho tot."
echo
echo "Projecte: $PROJECT_DIR"
