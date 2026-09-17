#!/bin/bash
# =============================================================================
# sessio.sh — Un clic per reprendre la sessió de treball d'aquest projecte
# =============================================================================
#
# QUÈ FA
#
#   1. Servidor DeepSeek Harness (`dsh web`) al port 3080, engegat amb el cwd
#      d'aquest projecte. Això importa: el DSH indexa les converses per espai
#      de treball (~/.dsh/sessions/<clau del camí>/), i per tant engegar-lo des
#      d'aquí és el que fa que recuperis LES CONVERSES D'AQUEST PROJECTE.
#   2. Obre la GUI al navegador amb la URL autenticada.
#   3. Servidor de proves (`npm run proves` = netlify dev al 8888), que alhora
#      arrenca la instància de Vite del 3003.
#   4. Obre http://localhost:3003, que és on es treballa: Vite fa de proxy de
#      `/api` i `/.netlify/functions` cap al 8888 (vegeu vite.config.js).
#
# PER QUÈ EL TOKEN
#
#   `dsh web` no serveix res sense el token d'arrencada que imprimeix a la
#   sortida; és aleatori i viu NOMÉS a la memòria del procés. Per això desem la
#   URL amb token a .state/dsh.url: si el servidor ja és viu, la reobrim tal
#   qual, sense reiniciar-lo i sense perdre la conversa.
#
# ÚS
#
#   sessio.sh              engega-ho tot (o s'hi enganxa si ja està en marxa)
#   sessio.sh --estat      què hi ha en marxa ara mateix
#   sessio.sh --aturar     atura DSH, proves i Vite (demana confirmació)
#   sessio.sh --reinicia   atura-ho i torna-ho a engegar (token nou)
#   sessio.sh --simula     explica què faria, sense tocar res
#   sessio.sh --ajuda      aquest text
#
# Vegeu README.md per a la instal·lació de les icones de l'escriptori.
# =============================================================================

set -u
set -o pipefail

SESSIO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SESSIO_DIR/../.." && pwd)"

# --- Valors per defecte (es poden sobreescriure des de config.sh) -------------
DSH_PORT=3080
WEB_PORT=3003
PROVES_PORT=8888
WEB_HOST="localhost"
ESPERA_DSH=90          # segons que esperem la URL autenticada del DSH
ESPERA_WEB=150         # segons que esperem que el 3003 respongui

# shellcheck source=/dev/null
[ -f "$SESSIO_DIR/config.sh" ] && . "$SESSIO_DIR/config.sh"

# --- Assegurem que hi hagi node/npm al PATH -----------------------------------
# Una finestra oberta des del Finder no sempre hereta el PATH del terminal, i
# `npm run proves` necessita l'ordre `npm`. /etc/paths ja inclou /usr/local/bin,
# però ho comprovem igualment per si mai canvia la instal·lació de Node.
prepara_path() {
  local d
  for d in /usr/local/bin /opt/homebrew/bin "$HOME/.volta/bin" "$HOME/.bun/bin"; do
    [ -d "$d" ] || continue
    case ":$PATH:" in
      *":$d:"*) ;;
      *) PATH="$d:$PATH" ;;
    esac
  done
  # nvm deixa els binaris a ~/.nvm/versions/node/<versió>/bin
  if ! command -v npm >/dev/null 2>&1 && [ -d "$HOME/.nvm/versions/node" ]; then
    local n
    n="$(ls -td "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | head -1)"
    [ -n "$n" ] && PATH="$n:$PATH"
  fi
  export PATH
}
prepara_path

# --- Estat i registres (tot dins del projecte, mai fora) ----------------------
STATE_DIR="$SESSIO_DIR/.state"
LOG_DIR="$STATE_DIR/logs"
DSH_LOG="$LOG_DIR/dsh-web.log"
DSH_PID_FILE="$STATE_DIR/dsh.pid"
DSH_URL_FILE="$STATE_DIR/dsh.url"
DSH_BIN_FILE="$STATE_DIR/dsh.bin"

SIMULA=0

# --- Colors (només si escrivim en un terminal) -------------------------------
if [ -t 1 ]; then
  NEGRETA=$'\033[1m'; GRIS=$'\033[2m'; VERD=$'\033[32m'
  GROC=$'\033[33m'; VERMELL=$'\033[31m'; FI=$'\033[0m'
else
  NEGRETA=""; GRIS=""; VERD=""; GROC=""; VERMELL=""; FI=""
fi

diu()  { printf '%s%s%s\n' "$NEGRETA" "$*" "$FI"; }
info() { printf '   %s\n' "$*"; }
fet()  { printf '   %s%s%s\n' "$VERD" "$*" "$FI"; }
avis() { printf '%sAVÍS%s   %s\n' "$GROC" "$FI" "$*" >&2; }
err()  { printf '%sERROR%s  %s\n' "$VERMELL" "$FI" "$*" >&2; }

# =============================================================================
# Utilitats
# =============================================================================

# Hi ha algú escoltant en aquest port de loopback?
port_escolta() {
  (exec 3<>"/dev/tcp/127.0.0.1/$1") >/dev/null 2>&1
}

codi_http() {
  local codi
  codi="$(curl -s -m 3 -o /dev/null -w '%{http_code}' "$1" 2>/dev/null)"
  [ -n "$codi" ] || codi="000"
  printf '%s' "$codi"
}

pid_viu() {
  [ -n "${1:-}" ] || return 1
  kill -0 "$1" 2>/dev/null
}

# PID del procés que escolta un port (buit si no el podem esbrinar).
pid_del_port() {
  lsof -nP -tiTCP:"$1" -sTCP:LISTEN 2>/dev/null | head -1
}

# Espera que una URL respongui. $1 = URL, $2 = segons màxim.
espera_url() {
  local i=0 max="$2"
  while [ "$i" -lt "$max" ]; do
    if curl -s -m 2 -o /dev/null "$1" 2>/dev/null; then return 0; fi
    sleep 1
    i=$((i + 1))
  done
  return 1
}

obre() {
  if [ "$SIMULA" = "1" ]; then
    info "[simulació] obriria $1"
  else
    open "$1" >/dev/null 2>&1 || avis "No he pogut obrir el navegador amb «$1»."
  fi
}

capcalera() {
  printf '\n%s=== Sessió de treball · %s ===%s\n\n' \
    "$NEGRETA" "$(basename "$PROJECT_DIR")" "$FI"
}

# =============================================================================
# On és el programa dsh
# =============================================================================
#
# No hi ha cap `dsh` instal·lat globalment en aquesta màquina: l'ordre arriba
# de la memòria cau de npx. El guardem a .state/dsh.bin per no dependre del
# PATH (una finestra oberta des del Finder no hereta el PATH del terminal).

troba_dsh() {
  if [ -s "$DSH_BIN_FILE" ]; then
    local desat
    desat="$(cat "$DSH_BIN_FILE")"
    if [ -x "$desat" ]; then printf '%s' "$desat"; return 0; fi
  fi

  local trobat=""
  trobat="$(command -v dsh 2>/dev/null || true)"
  if [ -z "$trobat" ] || [ ! -x "$trobat" ]; then
    trobat="$(ls -t "$HOME"/.npm/_npx/*/node_modules/.bin/dsh 2>/dev/null | head -1)"
  fi

  if [ -n "$trobat" ] && [ -x "$trobat" ]; then
    if [ "$SIMULA" = "1" ]; then
      info "[simulació] no desaria $DSH_BIN_FILE"
    else
      printf '%s' "$trobat" > "$DSH_BIN_FILE"
    fi
    printf '%s' "$trobat"
    return 0
  fi

  return 1
}

# =============================================================================
# Servidor DeepSeek Harness
# =============================================================================

# Deixa el resultat a URL_DSH.
engega_dsh() {
  URL_DSH=""

  if port_escolta "$DSH_PORT"; then
    if [ -s "$DSH_PID_FILE" ] && pid_viu "$(cat "$DSH_PID_FILE")" && [ -s "$DSH_URL_FILE" ]; then
      URL_DSH="$(cat "$DSH_URL_FILE")"
      fet "Servidor DSH ja en marxa (gestionat per aquest guió, pid $(cat "$DSH_PID_FILE"))."
    else
      URL_DSH="http://127.0.0.1:$DSH_PORT/"
      fet "Servidor DSH ja en marxa (engegat fora d'aquest guió): reutilitzo la sessió del navegador."
      info "Si el navegador et diu «unauthorized», aquell servidor ve d'una altra arrencada:"
      info "tanca'l amb «sessio.sh --reinicia» i torna a clicar."
    fi
    obre "$URL_DSH"
    return 0
  fi

  local bin
  if ! bin="$(troba_dsh)"; then
    err "No trobo el programa «dsh». Comprova que @deepseek-ai/dsh és a la memòria cau de npx:"
    err "  npx @deepseek-ai/dsh web"
    return 1
  fi

  diu "Engego el servidor DeepSeek Harness al port ${DSH_PORT}…"
  info "Programa: $bin"
  info "Registre:  $DSH_LOG"

  if [ "$SIMULA" = "1" ]; then
    info "[simulació] (cd \"$PROJECT_DIR\" && $bin web --port $DSH_PORT --no-open)"
    URL_DSH="http://127.0.0.1:$DSH_PORT/?token=SIMULAT"
    info "[simulació] obriria $URL_DSH"
    return 0
  fi

  mkdir -p "$LOG_DIR"
  : > "$DSH_LOG"

  # El servidor ha de viure més que aquesta finestra: nohup + procés destacat.
  ( cd "$PROJECT_DIR" && nohup "$bin" web --port "$DSH_PORT" --no-open >>"$DSH_LOG" 2>&1 &
    echo $! > "$DSH_PID_FILE" )

  local i=0 url="" pid=""
  while [ "$i" -lt "$ESPERA_DSH" ]; do
    url="$(sed -n 's/^dsh web: \(http[^ ]*\).*/\1/p' "$DSH_LOG" 2>/dev/null | head -1)"
    [ -n "$url" ] && break
    pid="$(cat "$DSH_PID_FILE" 2>/dev/null || true)"
    if [ -n "$pid" ] && ! pid_viu "$pid"; then break; fi
    sleep 1
    i=$((i + 1))
  done

  if [ -n "$url" ]; then
    printf '%s' "$url" > "$DSH_URL_FILE"
    URL_DSH="$url"
    fet "Servidor DSH en marxa (pid $(cat "$DSH_PID_FILE" 2>/dev/null))."
    obre "$url"
  else
    err "El servidor DSH no ha arribat a anunciar la seva URL en $ESPERA_DSH segons."
    printf '\n%s--- últimes línies de %s ---%s\n' "$GRIS" "$DSH_LOG" "$FI"
    tail -n 20 "$DSH_LOG" 2>/dev/null
    printf '%s--- fi ---%s\n\n' "$GRIS" "$FI"
    avis "Provo d'obrir igualment http://127.0.0.1:$DSH_PORT/ (pot demanar el token)."
    obre "http://127.0.0.1:$DSH_PORT/"
    return 1
  fi

  return 0
}

# =============================================================================
# Servidor de proves (netlify dev → Vite)
# =============================================================================

# Retorna 0 si l'hem engegat nosaltres (i per tant aquesta finestra queda
# ocupada mostrant-ne els registres), 1 si ja hi era.
engega_proves() {
  if port_escolta "$PROVES_PORT"; then
    fet "El servidor de proves ja escolta al $PROVES_PORT."
    return 1
  fi

  if ! command -v npm >/dev/null 2>&1; then
    err "No trobo l'ordre «npm» al PATH. Node hauria de ser a /usr/local/bin."
    return 1
  fi

  if ! port_escolta "$WEB_PORT"; then
    info "El $WEB_PORT encara no respon: netlify dev arrencarà la instància de Vite pel seu compte."
  fi

  diu "Engego el servidor de proves: npm run proves ($PROVES_PORT → $WEB_PORT)…"
  info "Deixa aquesta finestra oberta mentre treballes; Ctrl-C atura el servidor de proves"
  info "(el servidor DSH continua en marxa)."
  printf '\n'

  if [ "$SIMULA" = "1" ]; then
    info "[simulació] (cd \"$PROJECT_DIR\" && npm run proves)"
    info "[simulació] quan el $WEB_PORT respongués, obriria http://$WEB_HOST:$WEB_PORT/"
    return 1
  fi

  # Obre la web tan bon punt Vite respongui. `trap '' INT` fa que aquesta
  # espera no mori amb el Ctrl-C que atura netlify dev.
  (
    trap '' INT
    if espera_url "http://127.0.0.1:$WEB_PORT/" "$ESPERA_WEB"; then
      open "http://$WEB_HOST:$WEB_PORT/" >/dev/null 2>&1
    fi
  ) &

  cd "$PROJECT_DIR" || return 1
  npm run proves
}

# =============================================================================
# Informació i manteniment
# =============================================================================

sessio_mes_recent() {
  local fitxer
  fitxer="$(ls -t "$HOME"/.dsh/sessions/*/*/session.v3.jsonl.zstd 2>/dev/null | head -1)"
  if [ -n "$fitxer" ]; then
    local id data
    id="$(basename "$(dirname "$fitxer")")"
    data="$(date -r "$fitxer" '+%d/%m/%Y %H:%M' 2>/dev/null)"
    info "Conversa DSH més recent: $id ($data)"
  fi
}

linia_port() {  # $1 = etiqueta, $2 = port
  local pid estat
  pid="$(pid_del_port "$2")"
  if [ -n "$pid" ]; then
    estat="${VERD}en marxa${FI} (pid $pid)"
  elif port_escolta "$2"; then
    estat="${VERD}en marxa${FI} (pid desconegut: el sistema no el deixa consultar)"
  else
    estat="${GRIS}aturat${FI}"
  fi
  printf '   %-22s port %-5s %s\n' "$1" "$2" "$estat"
}

mostra_estat() {
  capcalera
  info "Projecte: $PROJECT_DIR"
  printf '\n'
  linia_port "DeepSeek Harness" "$DSH_PORT"
  linia_port "Vite (web)" "$WEB_PORT"
  linia_port "netlify dev (proves)" "$PROVES_PORT"
  printf '\n'
  if [ -s "$DSH_URL_FILE" ]; then
    info "URL autenticada desada: $(cat "$DSH_URL_FILE")"
  else
    info "Encara no hi ha cap URL autenticada desada."
  fi
  sessio_mes_recent
  printf '\n'
}

atura_tot() {
  local sense_confirmacio=0
  [ "${1:-}" = "--sense-confirmacio" ] && sense_confirmacio=1

  capcalera
  local ports="$DSH_PORT:DSH $WEB_PORT:Vite $PROVES_PORT:netlify-dev"
  local trobats=""
  local entrada port etiqueta pid

  for entrada in $ports; do
    port="${entrada%%:*}"
    etiqueta="${entrada#*:}"
    pid="$(pid_del_port "$port")"
    [ -z "$pid" ] && continue
    trobats="$trobats $pid"
    info "Aturaré $etiqueta (port $port, pid $pid)"
  done

  if [ -z "$trobats" ]; then
    fet "No hi ha res en marxa en aquests ports."
    return 0
  fi

  if [ "$sense_confirmacio" = "0" ]; then
    printf '\n'
    printf '   Segur que ho aturo tot? [s/N] '
    local resposta=""
    read -r resposta
    case "$resposta" in
      s|S|si|sí|SI|SÍ) ;;
      *) info "No he aturat res."; return 0 ;;
    esac
  fi

  local p
  for p in $trobats; do
    if [ "$SIMULA" = "1" ]; then
      info "[simulació] kill $p"
    else
      kill "$p" 2>/dev/null
    fi
  done

  if [ "$SIMULA" = "1" ]; then
    info "[simulació] no esborro els fitxers d'estat"
    return 0
  fi

  sleep 2
  for p in $trobats; do
    if pid_viu "$p"; then
      avis "El pid $p no ha parat: l'obligo."
      kill -9 "$p" 2>/dev/null
    fi
  done

  rm -f "$DSH_PID_FILE" "$DSH_URL_FILE"
  fet "Tot aturat."
}

resum() {
  printf '\n'
  diu "Tot a punt:"
  info "DSH (GUI de l'agent)   http://127.0.0.1:$DSH_PORT/"
  info "Web en mode de proves  http://$WEB_HOST:$WEB_PORT/"
  printf '\n'
}

mostra_ajuda() {
  cat <<'TXT'

sessio.sh — Un clic per reprendre la sessió de treball d'aquest projecte.

  sessio.sh              engega-ho tot (o s'hi enganxa si ja està en marxa)
  sessio.sh --estat      què hi ha en marxa ara mateix
  sessio.sh --aturar     atura DSH, proves i Vite (demana confirmació)
  sessio.sh --reinicia   atura-ho i torna-ho a engegar (token nou)
  sessio.sh --simula     explica què faria, sense tocar res
  sessio.sh --ajuda      aquest text

Ports: DSH 3080 · Vite/web 3003 · netlify dev (proves) 8888.
Estat i registres: tools/sessio/.state/
TXT
}

engega_sessio() {
  capcalera
  mkdir -p "$LOG_DIR"
  info "Projecte: $PROJECT_DIR"
  sessio_mes_recent
  printf '\n'

  engega_dsh || avis "Continuo amb el servidor de proves, tot i que el DSH no ha arrencat bé."

  if engega_proves; then
    : # netlify dev s'ha quedat en primer pla en aquesta finestra
  else
    if [ "$SIMULA" = "0" ] && port_escolta "$WEB_PORT"; then
      obre "http://$WEB_HOST:$WEB_PORT/"
    fi
    resum
  fi
}

case "${1:-}" in
  --estat)           mostra_estat ;;
  --aturar)          atura_tot ;;
  --reinicia)        atura_tot --sense-confirmacio; engega_sessio ;;
  --simula)          SIMULA=1; engega_sessio ;;
  -h|--ajuda|--help) mostra_ajuda ;;
  "")                engega_sessio ;;
  *)                 err "Opció desconeguda: $1"; printf '\n'; mostra_ajuda; exit 2 ;;
esac
