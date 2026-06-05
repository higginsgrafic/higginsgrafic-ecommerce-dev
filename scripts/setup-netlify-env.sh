#!/bin/bash
# ============================================================
# Configuració de variables d'entorn a Netlify
# ============================================================
# 
# REQUISIT PREVI: Autenticar-se amb netlify-cli des del navegador
#   npx --yes netlify-cli login
#
# Si falla la instal·lacio global, pots usar sempre npx:
#   npx --yes netlify-cli <comanda>
#
# Per instal·lar globalment (requereix sudo):
#   sudo npm install -g netlify-cli
#
# Després de l'auth, vincular el projecte (si no està ja):
#   npx --yes netlify-cli link
#
# ============================================================

set -e

echo "📦 Configurant variables d'entorn de Netlify..."
echo ""

# === CRÍTIQUES (obligatòries) ===

echo "🔴 Variables CRÍTIQUES:"

netlify env:set VITE_GELATO_API_KEY "065e87f5-53b9-462c-9106-c184736ea1e9-bffd61f3-0cd2-485f-a1a3-0e16a0e44b88:c37a7a77-5f60-40db-b835-1e5260525cc7" --context production
echo "  ✅ VITE_GELATO_API_KEY"

netlify env:set VITE_GELATO_STORE_ID "3fc67d70-cfbc-4741-9474-f460f03bc8d1" --context production
echo "  ✅ VITE_GELATO_STORE_ID"

netlify env:set VITE_SUPABASE_URL "https://jnuuejlxuyqhhkfucuxg.supabase.co" --context production
echo "  ✅ VITE_SUPABASE_URL"

netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudXVlamx4dXlxaGhrZnVjdXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MTgwODgsImV4cCI6MjA4MTk5NDA4OH0.39ATMJ50D3Ll4t9eWd25kL77Aw7jA4zub714HnEmX7k" --context production
echo "  ✅ VITE_SUPABASE_ANON_KEY"

netlify env:set SUPABASE_SERVICE_ROLE_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudXVlamx4dXlxaGhrZnVjdXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQxODA4OCwiZXhwIjoyMDgxOTk0MDg4fQ.sQpODlILcyXgCyrFxmb1DwsAwqXa75nujjOzSrfQqgk" --context production
echo "  ✅ SUPABASE_SERVICE_ROLE_KEY"

netlify env:set VITE_ADMIN_EMAILS "higginsgrafic@gmail.com" --context production
echo "  ✅ VITE_ADMIN_EMAILS"

# === NO CRÍTIQUES (opcionals amb defaults) ===

echo ""
echo "🟢 Variables OPCIONALS:"

netlify env:set VITE_GELATO_SANDBOX "false" --context production
echo "  ✅ VITE_GELATO_SANDBOX"

netlify env:set VITE_USE_MOCK_DATA "false" --context production
echo "  ✅ VITE_USE_MOCK_DATA"

echo ""
echo "========================================"
echo "🎉 Configuració completada!"
echo "========================================"
echo ""
echo "Per verificar:"
echo "  npx --yes netlify-cli env:list"
echo ""
echo "Després, fer un deploy de producció:"
echo "  npx --yes netlify-cli deploy --build --prod"