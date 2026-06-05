# Configuració de Variables d'Entorn a Netlify

## Llista completa de variables

| Variable | Descripció | Obligatòria | On trobar-la |
|---|---|---|---|
| `VITE_GELATO_API_KEY` | API key de Gelato (Print on Demand) | ✅ Sí | [Gelato Dashboard → Settings → API Keys](https://app.gelato.com/) |
| `VITE_GELATO_SANDBOX` | Mode sandbox (`true`/`false`) | ❌ No (default: `false`) | — |
| `VITE_GELATO_STORE_ID` | ID de la botiga a Gelato | ✅ Sí | Gelato Dashboard → Stores |
| `VITE_SUPABASE_URL` | URL del projecte Supabase | ✅ Sí | [Supabase Dashboard → Settings → API](https://app.supabase.com/) |
| `VITE_SUPABASE_ANON_KEY` | Clau anònima de Supabase (client) | ✅ Sí | Supabase Dashboard → Settings → API → `anon public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clau de servei Supabase (servidor) | ✅ Sí (funcions Edge) | Supabase Dashboard → Settings → API → `service_role` (⚠️ secreta!) |
| `VITE_USE_MOCK_DATA` | Usar dades mock en lloc d'API reals | ❌ No (default: `false`) | — |
| `VITE_ADMIN_EMAILS` | Emails d'administrador (separats per comes) | ✅ Sí (accés admin) | — |

## Com configurar-les a Netlify

### Via Dashboard (UI)
1. Ves a [app.netlify.com](https://app.netlify.com) → selecciona el site
2. **Site settings → Environment variables**
3. Afegeix cada variable amb el seu valor
4. **Important**: Les variables amb prefix `VITE_` estan disponibles al client. Les variables **sense** prefix `VITE_` (com `SUPABASE_SERVICE_ROLE_KEY`) NO s'exposen al client.

### Via CLI (Netlify CLI)
```bash
# Per cada variable:
netlify env:set VITE_GELATO_API_KEY "valor_real" --context production
netlify env:set VITE_SUPABASE_URL "https://xxxxx.supabase.co" --context production

# Per variables secretes (sense VITE_):
netlify env:set SUPABASE_SERVICE_ROLE_KEY "valor_secret" --context production
```

### Via `netlify.toml` (només per a build)
```toml
[build.environment]
  VITE_GELATO_SANDBOX = "false"
  VITE_USE_MOCK_DATA = "false"
```

⚠️ **No posis secrets al `netlify.toml`** — usa el dashboard o CLI.

## Contextos
- **Production**: El site principal (`grafic.cat`)
- **Deploy Previews**: PRs i branques (hereda variables de production si no se sobreescriuen)
- **Branch deploys**: Desplegaments de branques específiques

## ✅ Estat actual (04/06/2026)
**Variables configurades automàticament als 2 sites de Netlify:**

| Site | URL | ID | Estat |
|---|---|---|---|
| Dev | `dev.higginsgrafic.com` | `f7ecc95e-f2a3-4fc3-846d-61402926d84c` | ✅ Configurat |
| Prod | `higginsgrafic.com` | `88eda5c0-e3b6-4a2f-b1a6-44834ffab053` | ✅ Configurat |

**Script d'automatització disponible:** `scripts/setup-netlify-env.sh`

## Verificació
Per verificar que les variables estan configurades correctament:
```bash
# Veure variables del site vinculat
npx netlify env:list

# Desplega i revisa els logs de build
npx netlify deploy --build --prod

# O revisa al dashboard: Site settings → Environment variables
