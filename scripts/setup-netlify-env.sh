#!/bin/bash
# ============================================================
# Configuració de variables d'entorn a Netlify
# ============================================================
#
# AQUEST SCRIPT NO CONTÉ CAP SECRET.
# Llegeix els valors del fitxer .env local (que està al .gitignore)
# i els puja a Netlify. Així els secrets no arriben mai al repositori.
#
# HISTÒRIC: la versió anterior d'aquest script tenia les claus escrites
# en clar i es va versionar en un repositori públic. Es van haver de
# revocar totes (Supabase service_role, Supabase anon i Gelato) el
# 12/09/2026. No hi tornis a escriure claus.
#
# REQUISIT PREVI:
#   npx --yes netlify-cli login
#   npx --yes netlify-cli link
#
# ÚS:
#   bash scripts/setup-netlify-env.sh
#
# ============================================================

set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"
CONTEXT="${CONTEXT:-production}"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ No s'ha trobat el fitxer $ENV_FILE"
  echo "   Copia .env.example a .env i omple-hi els valors reals."
  exit 1
fi

# Variables que es pugen a Netlify.
# NOTA: VITE_GELATO_API_KEY ja NO s'hi inclou. Era una clau privada amb
# prefix VITE_, cosa que la incrustava al JavaScript del navegador.
# Cap fitxer del codi la fa servir: la clau de Gelato és només de servidor
# (GELATO_API_KEY).
VARS=(
  # Públiques (acaben al bundle del navegador — mai hi posis secrets)
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY
  VITE_STRIPE_PUBLISHABLE_KEY
  VITE_SENTRY_DSN
  VITE_ADMIN_EMAILS
  VITE_GELATO_STORE_ID
  VITE_GELATO_SANDBOX
  VITE_USE_MOCK_DATA
  # Privades (només servidor)
  SUPABASE_SERVICE_ROLE_KEY
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  GELATO_API_KEY
  GELATO_WEBHOOK_SECRET
  RESEND_API_KEY
  RESEND_FROM_EMAIL
  ADMIN_EMAIL
)

get_env_value() {
  grep -E "^${1}=" "$ENV_FILE" | head -1 | cut -d= -f2- \
    | sed -e 's/^["'\'']//' -e 's/["'\'']$//' -e 's/[[:space:]]*$//'
}

# Fer servir el netlify-cli instal·lat al projecte és molt més ràpid que
# cridar `npx` a cada variable (npx comprova el registre cada cop i triga
# uns 10 segons per crida: amb 15 variables, quasi tres minuts).
if [ -x "./node_modules/.bin/netlify" ]; then
  NETLIFY="./node_modules/.bin/netlify"
else
  NETLIFY="npx --yes netlify-cli"
fi

# Comprovació prèvia. Si no hi ha sessió de Netlify, el CLI obre un diàleg
# interactiu i l'script es quedaria parat sense dir res.
echo "🔎 Comprovant la sessió de Netlify..."
if ! $NETLIFY status > /tmp/netlify-status-out.txt 2>&1; then
  echo "❌ El CLI de Netlify no ha respost correctament:"
  tail -5 /tmp/netlify-status-out.txt | sed 's/^/     /'
  echo ""
  echo "   Solució: comprova que el projecte està enllaçat i que has iniciat sessió:"
  echo "     ./node_modules/.bin/netlify login"
  echo "     ./node_modules/.bin/netlify link"
  exit 1
fi

echo "📦 Pujant variables d'entorn a Netlify (context: $CONTEXT)"
echo "   Origen: $ENV_FILE"
echo ""

pujades=0
omeses=0
avisos=0

for name in "${VARS[@]}"; do
  value="$(get_env_value "$name" || true)"

  if [ -z "$value" ]; then
    echo "  ⚠️  $name — buit o absent, s'omet"
    omeses=$((omeses + 1))
    continue
  fi

  # Avisar si sembla una clau JWT legacy de Supabase (revocades el 12/09/2026)
  case "$value" in
    eyJ*)
      echo "  🛑 $name — sembla una clau JWT LEGACY (eyJ...)"
      echo "       Aquestes claus es van revocar el 12/09/2026 i ja no funcionen."
      echo "       Cal usar el format nou: sb_secret_... / sb_publishable_..."
      avisos=$((avisos + 1))
      continue
      ;;
  esac

  # --force és OBLIGATORI en aquest script.
  # Sense --force, el CLI detecta que la variable ja existeix a Netlify i
  # obre un diàleg interactiu ("Do you want to overwrite it? (y/N)").
  # Com que l'script s'executa en bucle, es quedava parat a la primera
  # variable que ja existia esperant una tecla. Amb --force no pregunta res.
  printf '  pujant %s... ' "$name"
  if $NETLIFY env:set "$name" "$value" --context "$CONTEXT" --force > /tmp/netlify-env-out.txt 2>&1; then
    echo "✅"
    pujades=$((pujades + 1))
  else
    echo "❌"
    echo "     $(tail -2 /tmp/netlify-env-out.txt | tr '\n' ' ')"
    avisos=$((avisos + 1))
  fi
done

echo ""
echo "========================================"
echo "  Pujades:   $pujades"
echo "  Omeses:    $omeses"
[ "$avisos" -gt 0 ] && echo "  Avortades: $avisos  (claus legacy detectades)"
echo "========================================"
echo ""
echo "Per verificar:"
echo "  npx --yes netlify-cli env:list --context $CONTEXT"
echo ""
echo "Després, desplegar:"
echo "  npx --yes netlify-cli deploy --build --prod"
