# Checkout Security v1 — Design Document

> **Estat**: Implementat a `release/checkout-security-v1` (local only).  
> **No desplegat**: Cap migració aplicada, cap funció desplegada, cap secret rotat.  
> **Pendent**: Revisió i aprovació abans de qualsevol promoció.

---

## 1. Classificació de troballes (findings)

### 1.1. Confirmades des del codi local (no verificades com exposició pública)

| # | Troballa | Severitat | Fitxer | Descripció |
|---|----------|-----------|--------|------------|
| F1 | `create-payment-intent` accepta `amount` del client | Crítica | `netlify/functions/create-payment-intent.js:28` | El client envia l'import del pagament. Un usuari pot manipular l'import i pagar menys del preu real. |
| F2 | `VITE_GELATO_API_KEY` exposada al client | Alta | `src/api/gelato.js:10` | La clau API de Gelato estava disponible al bundle del navegador. |
| F3 | `createGelatoOrder` des del client | Crítica | `src/api/gelato.js:551` | El client podia crear comandes Gelato directament, sense pagament confirmat. |
| F4 | `gelato-proxy` permet `action=order` anònimament | Crítica | `supabase/functions/gelato-proxy/index.ts:67-77` | L'edge function permetia crear comandes Gelato sense autenticació. |
| F5 | `upload-media` sense autenticació | Crítica | `supabase/functions/upload-media/index.ts:10-107` | Qualsevol persona podia pujar fitxers al storage de Supabase sense auth. |
| F6 | `orders.js` POST sense auth | Alta | `netlify/functions/orders.js:99-165` | Creació de comandes sense verificació de pagament. |
| F7 | `orders.js` GET per email/orderNumber | Alta | `netlify/functions/orders.js:167-230` | Cerca de comandes per email o número sense autenticació — IDOR. |
| F8 | `orders.js` admin auth via email allowlist | Alta | `netlify/functions/orders.js:63-71` | Autorització admin basada en llista d'emails a env vars, no en taula `staff`. |
| F9 | `orders.js` dev bypass | Alta | `netlify/functions/orders.js:50-52` | `NODE_ENV=development` o `NETLIFY_DEV=true` salta l'autenticació. |
| F10 | RLS permissives a múltiples taules | Alta | Múltiples migracions | Polítiques que permeten insert/update/delete a qualsevol usuari autenticat o anònim. |
| F11 | `stripe-webhook` sense idempotència | Alta | `netlify/functions/stripe-webhook.js:104-173` | Retries de Stripe poden causar emails duplicats i fulfillment múltiple. |
| F12 | `shipping-rates` POST sense auth | Mitjana | `netlify/functions/shipping-rates.js:130-156` | Actualització de tarifes d'enviament sense autenticació. |
| F13 | `send-message` sense rate limiting | Baixa | `netlify/functions/send-message.js` | Formulari de contacte sense limitació de freqüència. |

### 1.2. Present al codi de producció però no verificat externament

> Aquestes troballes existeixen al codi del repositori de producció (`higginsgrafic-ecommerce-prod`),  
> però **no hem verificat externament** que estiguin exposades públicament.  
> El lloc públic està en "Under Construction → Etsy", per tant és possible que  
> les funcions Netlify no estiguin rebent tràfic real.

| # | Troballa | Notes |
|---|----------|-------|
| P1 | Les mateixes F1-F13 podrien estar presents al repo de producció | No hem comparat el codi de producció línia per línia. |
| P2 | Les Edge Functions podrien estar desplegades amb el codi antic | No hem verificat l'estat de desplegament de les Edge Functions. |
| P3 | Les migracions SQL podrien no estar aplicades al backend compartit | No hem verificat l'estat del schema al Dashboard de Supabase. |

### 1.3. No confirmades

> Cap troballa ha estat verificada com a exposició pública viva mitjançant proves externes.  
> Totes les troballes són inferències basades en la lectura del codi local.

---

## 2. Schema proposat

### 2.1. Taula `staff` (nova)

```sql
CREATE TABLE public.staff (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        text NOT NULL DEFAULT 'admin'
              CHECK (role IN ('admin', 'editor')),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
```

- `UNIQUE(user_id)`: un usuari només pot ser un membre de staff.
- `CHECK(role)`: només 'admin' o 'editor'.
- RLS: només `service_role` pot gestionar; un staff member pot llegir el seu propi registre.

### 2.2. Funció `is_admin()` (endurida)

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff
    WHERE staff.user_id = auth.uid()
      AND staff.role = 'admin'
      AND staff.is_active = true
  );
$$;
```

- `SECURITY DEFINER`: s'executa amb els privilegis del propietari.
- `SET search_path = public, pg_temp`: prevé search path injection.
- Referències fully-qualified (`public.staff`).

### 2.3. Columnes noves a `orders`

| Columna | Tipus | Descripció |
|---------|-------|------------|
| `idempotency_key` | text | Clau d'idempotència per deduplicar creació de comandes. UNIQUE. |
| `tracking_token` | text | Token d'alta entropia (32 bytes hex) per seguiment de convidats. Indexat. |
| `tracking_token_expires_at` | timestamptz | Caducitat del token de seguiment. |

### 2.4. Constraint `UNIQUE(payment_intent_id)`

Un PaymentIntent = una comanda. Previ a això, no hi havia constraint i es podien crear múltiples comandes pel mateix PI.

### 2.5. Taula `processed_stripe_events` (nova)

```sql
CREATE TABLE public.processed_stripe_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         text NOT NULL UNIQUE,
  event_type       text NOT NULL,
  payment_intent_id text,
  processed_at     timestamptz NOT NULL DEFAULT now(),
  result           jsonb,
  error            text
);
```

- `UNIQUE(event_id)`: prevé processament duplicat d'esdeveniments Stripe.
- RLS: només `service_role`.

### 2.6. Taula `order_events` (nova, audit trail)

```sql
CREATE TABLE public.order_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status text,
  new_status      text NOT NULL,
  event_type      text NOT NULL DEFAULT 'status_change',
  metadata        jsonb,
  created_by      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

- Trigger `AFTER UPDATE OF status ON orders` registra canvis d'estat.
- Usuaris poden llegir events de les seves pròpies comandes; `service_role` pot tot.

### 2.7. Taula `rate_limit_log` (nova)

```sql
CREATE TABLE public.rate_limit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket      text NOT NULL,
  identifier  text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  metadata    jsonb
);
```

- Funció `check_rate_limit(p_bucket, p_identifier, p_max_count, p_window_seconds)` retorna boolean.
- Buckets: `payment_intent` (10/min), `order_tracking` (20/min), `contact_form` (5/5min), `auth`, `upload`.

---

## 3. Model d'autorització

### 3.1. RLS (Supabase)

- **Lectura pública**: `products`, `product_variants`, `collections`, `shipping_config`, `hero_config` → `SELECT` per `anon, authenticated`.
- **Escriptura admin-gated**: Totes les operacions `INSERT/UPDATE/DELETE` requereixen `is_admin()`.
- **Orders**: `SELECT` per `user_id = auth.uid()` (usuari autenticat) o `service_role`. `INSERT/UPDATE` només `service_role`.
- **Messages**: `INSERT` per tothom (formulari de contacte), `SELECT/UPDATE/DELETE` només `service_role`.
- **Storage**: Lectura pública, escriptura només `is_admin()`.

### 3.2. Netlify Functions

- **Independents de RLS**: Usen `service_role` key, per tant bypass RLS.
- **Verificació pròpia**: `verifyAdmin(event)` → extreu Bearer token → `auth.getUser(token)` → lookup `staff` per `user_id` + `is_active`.
- **Sense email allowlist**: L'autoritat és la taula `staff`, no env vars.
- **Sense dev bypass**: Eliminat el `NODE_ENV=development` skip.

### 3.3. Edge Functions

- `gelato-proxy`: Accions d'escriptura (`stores`, `store-products`, `store-product`, `template`) requereixen Bearer JWT → `auth.getUser()` → `staff`. `action=order` → 403 (disabled).
- `upload-media`: Bearer JWT → `auth.getUser()` → `staff`. Whitelist MIME, mida, buckets.

---

## 4. Màquina d'estats de comandes

```
pendent → confirmada → en_preparacio → seguiment → en_repartiment → entregada
   ↓         ↓              ↓
cancel_lada  cancel_lada   aturada
```

| Estat | Qui pot transicionar | Trigger |
|-------|---------------------|---------|
| `pendent` | `create-payment-intent` (creació) | Inicial |
| `confirmada` | `stripe-webhook` (`payment_intent.succeeded`) | Pagament confirmat |
| `en_preparacio` | `stripe-webhook` (després de Gelato fulfillment) | Comanda Gelato creada |
| `seguiment` | Admin (PATCH orders) | Gelato envia tracking |
| `en_repartiment` | Admin (PATCH orders) | En repartiment |
| `entregada` | Admin (PATCH orders) | Lliurada |
| `cancel_lada` | `stripe-webhook` (`payment_intent.payment_failed`) o Admin | Pagament fallat o cancel·lada |
| `aturada` | Admin | Aturada manualment |

Tots els canvis d'estat es registren a `order_events` via trigger.

---

## 5. Relació Stripe PaymentIntent

1. `create-payment-intent` (Netlify) rep `items` + `shippingZone` del client.
2. Calcula preu server-side desde `product_variants.price` + `shipping_config`.
3. Crea `orders` row amb `status='pendent'`, `idempotency_key`, `total`.
4. Crea PaymentIntent a Stripe amb `metadata.order_id` i `metadata.idempotency_key`.
5. Actualitza `orders.payment_intent_id` amb el PI ID.
6. Retorna `clientSecret` al client.
7. `UNIQUE(payment_intent_id)` prevé múltiples comandes per un mateix PI.

---

## 6. Model d'idempotència de webhook

1. `stripe-webhook` rep event, verifica signature.
2. Comprova `processed_stripe_events` per `event_id`.
3. Si ja existeix → retorna 200 `{ duplicate: true }`, no processa.
4. Si no existeix → processa, registra a `processed_stripe_events` amb `result`.
5. Si el processament falla (Gelato error de xarxa) → retorna 500, Stripe reintenta.
6. En el reintento, l'event ja està registrat → skip.

---

## 7. Model de fulfillment Gelato

1. `stripe-webhook` (`payment_intent.succeeded`) → actualitza `orders.status='confirmada'`.
2. Crida `fulfillGelato(supabase, order)`:
   - Si `order.gelato_order_id` ja existeix → skip (idempotent).
   - Crida `createGelatoOrderServer(order)` via `_gelato.js` (server-side, usa `GELATO_API_KEY` del servidor).
   - Si èxit → actualitza `orders.gelato_order_id` + `status='en_preparacio'`, envia email.
   - Si error de dades (4xx) → skip (no reintentar).
   - Si error de xarxa (5xx) → retorna 'retry', webhook retorna 500, Stripe reintenta.
3. El client **mai** crea comandes Gelato. `createGelatoOrder()` al frontend → throw.

---

## 8. Model de seguiment de convidats

- Quan una comanda es crea (convidat, sense `user_id`), es genera un `tracking_token` (32 bytes hex, 64 chars).
- El token s'inclou a l'email de confirmació com a enllaç de seguiment.
- `tracking_token_expires_at` = 90 dies desde la creació.
- `orders.js` GET: accepta `?trackingToken=...`, verifica caducitat.
- **No** es permet cercar per `orderNumber` o `email` sense autenticació.
- Usuaris autenticats veuen les seves comandes via `user_id = auth.uid()`.

> **Nota**: La generació del tracking_token i l'email amb l'enllaç encara no estan implementats al webhook.  
> La infraestructura (columna, índex, funció `generate_tracking_token()`) està a la migració.  
> Falta: generar el token al crear la comanda i incloure'l a l'email. **Pendent d'implementar.**

---

## 9. Contenció D0 (local only, no desplegada)

| Exposició | Contenció | Estat |
|-----------|-----------|-------|
| Gelato order anònim | `action=order` → 403 a `gelato-proxy` | Implementat, no desplegat |
| Upload anònim | Auth admin obligatòria a `upload-media` | Implementat, no desplegat |
| Order lookup per email | `orders.js` GET requereix auth o tracking token | Implementat, no desplegat |

---

## 10. Pipeline de promoció

### Fitxers que es promocionen junts

| Categoria | Fitxers | Notes |
|-----------|---------|-------|
| Migracions SQL | `supabase/migrations/20260826100000_*.sql`, `20260826110000_*.sql` | Aplicar manualment al Dashboard |
| Edge Functions | `supabase/functions/gelato-proxy/index.ts`, `supabase/functions/upload-media/index.ts` | Desplegar via `supabase functions deploy` |
| Netlify Functions | `netlify/functions/_auth.js`, `_rate-limit.js`, `create-payment-intent.js`, `orders.js`, `stripe-webhook.js`, `shipping-rates.js`, `send-message.js` | Despleguen automàtic amb Netlify |
| Frontend | `src/api/stripe.js`, `src/api/gelato.js`, `src/components/fullwide/CheckoutContent.jsx` | Build Vite |
| Tests | `tests/unit/auth.test.js`, `rate-limit.test.js`, `security.test.js` | `npx vitest run` |

### Fitxers que NO es promocionen

- `tests/e2e/` — tests de desenvolupament
- `.env`, `.env.local`, `.env.production` — mai copiar secrets
- `docs/` — documentació interna
- Scripts de test email (`scripts/test-*.js`)

### Seqüència de desplegament (amb aprovació)

1. Aplicar migració 1 al Dashboard Supabase
2. Bootstrap admin: `INSERT INTO staff (user_id, email, role) VALUES ('...', 'marc@higginsgrafic.com', 'admin')`
3. Aplicar migració 2 al Dashboard Supabase
4. Desplegar Edge Functions: `supabase functions deploy gelato-proxy`, `supabase functions deploy upload-media`
5. Merge `release/checkout-security-v1` → `main` (desplega Netlify automàtic)
6. Eliminar `VITE_GELATO_API_KEY` de Netlify env vars
7. Verificar: `curl` als endpoints, comanda de test, webhook test

---

## 11. Tests pendents

### Implementats (15 tests, tots passen)

- `auth.test.js`: verifyAdmin (5), verifyUser (2)
- `rate-limit.test.js`: checkRateLimit (3)
- `security.test.js`: createPaymentIntent, getStripe, createGelatoOrder throw, default export (4)

### Pendents (requisit de l'usuari)

- [ ] Càlcul de preu i IVA (server-side pricing)
- [ ] Transicions d'estat de comandes
- [ ] Retries de Stripe webhook
- [ ] Prevenció de pagament duplicat
- [ ] Retries de fulfillment Gelato
- [ ] Accés no autoritzat a orders/catalog/storage
- [ ] Caducitat de tracking token de convidat
- [ ] Flux complet de checkout

---

## 12. Decisió Go/No-Go

### ⚠️ NO-GO per producció — pendent

**Raons:**
1. Falten tests crítics (preu, transicions, webhook retries, duplicats, fulfillment, tracking token, checkout complet).
2. La generació del tracking_token i el seu enviament per email no estan implementats al webhook.
3. Les migracions no estan aplicades (per disseny — cal aprovació).
4. No s'ha verificat l'estat del backend compartit al Dashboard.

**Llest per:**
- Revisió de codi a la branca `release/checkout-security-v1`.
- Aplicació de migracions en entorn de test (si es disposa d'un projecte Supabase de staging).
- Execució de tests ampliats (pendents d'implementar).
