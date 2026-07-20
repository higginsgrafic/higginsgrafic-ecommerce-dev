# Pla d'implementació per obrir la botiga

## Diagnosi inicial

| Bloc | Estat actual | Blocant? |
|---|---|---|
| Productes | `mockProducts.jsx` — 20 productes ficticis, preu 15.50€ | Sí |
| Pagament Stripe | `stripe.js` usa `pk_test_DEMO_KEY`. Falta `create-payment-intent.js`. `CheckoutPage.jsx` té camps fake (`cardNumber`, `cvv`) | Sí |
| Auth clients | Només `AdminContext` (admin). `ProtectedRoute.jsx` només comprova `isAdmin` | Sí |
| Flux comanda | `CheckoutPage.jsx` simula amb `setTimeout(2000)`, genera ID aleatori, no crida API | Sí |
| Col·leccions | 3 de 5 a `collections.js`. `miscellania` té `productSlugs: []` buit | No |
| Perfil usuari | `UserProfileTabs.jsx` — dades hardcoded (`Joan Garcia`, `joan.garcia@example.com`) | No |
| Enviament | `useShippingCosts.js` + `shipping-rates.js` — defaults funcionals (4.95€, gratuït >50€) | No |
| Legal | `TermsPage`, `PrivacyPage`, `ShippingPage`, `FAQPage` existeixen — cal revisar contingut | No |
| OrderTracking | `OrderTrackingPage.jsx` llegeix de `localStorage` — no usa Supabase | No |
| OrderConfirmation | `OrderConfirmationPage.jsx` — `orderData` hardcoded (items fake, adreça fake) | No |
| useOrders | `useOrders.js` — ja crida `/api/orders` real. `netlify/functions/orders.js` escriu a Supabase | Parcialment |

---

## Estructura de cada pas

Cada pas té: **Què** (acció), **Fitxers** (quins s'editen/cren), **Verificació** (com saber que està fet), **Depèn de** (passos previs).

---

## Fase 0 — Infraestructura

### Pas 0.1 — Verificar Supabase
- **Què**: Confirmar projecte actiu, taules i RLS
- **Fitxers**: Cap (verificació)
- **Verificació**:
  - `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` al `.env`
  - Taules `products`, `orders`, `profiles`, `addresses` existeixen al dashboard
  - `SUPABASE_SERVICE_ROLE_KEY` configurada a Netlify
  - RLS: lectura pública `products`, escriptura autenticada `orders`
- **Depèn de**: Res

### Pas 0.2 — Configurar Stripe
- **Què**: Obtenir claus Stripe i configurar-les
- **Fitxers**: `.env` (afegir `VITE_STRIPE_PUBLISHABLE_KEY`), Netlify (`STRIPE_SECRET_KEY`)
- **Verificació**: `pk_test_` al `.env`, `STRIPE_SECRET_KEY` a Netlify, build OK
- **Depèn de**: Res

### Pas 0.3 — Verificar Gelato
- **Què**: Confirmar credencials i productes
- **Fitxers**: Cap (verificació)
- **Verificació**: `VITE_GELATO_API_KEY` + `VITE_GELATO_STORE_ID` al `.env`, productes creats al dashboard, `syncGelatoStoreProducts()` retorna dades
- **Depèn de**: 0.1

---

## Fase 1 — Catàleg de productes reals

### Pas 1.1 — Completar col·leccions
- **Què**: Afegir `the-human-inside`, `austen`, `cube` a `collections.js`; omplir `productSlugs` de `miscellania`
- **Fitxers**: `src/config/collections.js` (editar)
- **Verificació**: Les 5 col·leccions tenen `breadcrumbLabel`, `headerClassName`, `productSlugs`. `getCollectionConfig('austen')` retorna objecte vàlid. Build OK.
- **Depèn de**: 0.1

### Pas 1.2 — Sincronitzar productes Gelato → Supabase
- **Què**: Executar sincronització per carregar productes reals
- **Fitxers**: Cap (acció d'execució via `/admin/gelato-sync`)
- **Verificació**: Taula `products` a Supabase té registres. Cada producte té nom, preu, imatge, variants, col·lecció, `isActive`. Si Gelato no té productes, carregar via `/admin/upload`.
- **Depèn de**: 0.3, 1.1

### Pas 1.3 — Verificar ProductContext amb dades reals
- **Què**: Confirmar que `loadProducts()` carrega des de Supabase+Gelato, no mocks
- **Fitxers**: `src/contexts/ProductContext.jsx` (revisar, possible ajust menor)
- **Verificació**: `VITE_USE_MOCK_DATA=false` al `.env`. Navegar a `/first-contact` → productes reals. Console sense warnings de fallback a mock. `window.__PRODUCTS__` conté productes amb `gelatoProductId`.
- **Depèn de**: 1.2

### Pas 1.4 — Actualitzar `productSlugs` a col·leccions
- **Què**: Un cop productes carregats a Supabase, extreure els slugs reals i actualitzar `productSlugs` de cada col·lecció a `collections.js`
- **Fitxers**: `src/config/collections.js` (editar)
- **Verificació**: Cada col·lecció mostra els productes correctes. Cap col·lecció buida.
- **Depèn de**: 1.2, 1.1

### Pas 1.5 — Aïllar mocks a dev
- **Què**: Marcar `mockProducts.jsx` com a fallback només per dev. Assegurar que `endpoints.js` no carrega mocks en producció.
- **Fitxers**: `src/data/mockProducts.jsx` (possible guard), `src/api/endpoints.js` (revisar `USE_MOCK`)
- **Verificació**: En build de producció, cap referència a mocks. En dev, mocks disponibles com a fallback.
- **Depèn de**: 1.3

---

## Fase 2 — Autenticació de clients

### Pas 2.1 — Crear AuthContext
- **Què**: Crear context d'autenticació de client separat d'AdminContext. Usar Supabase Auth (`signUp`, `signInWithPassword`, `signOut`, `onAuthStateChange`). Estat: `user`, `session`, `authReady`, `loading`.
- **Fitxers**: `src/contexts/AuthContext.jsx` (nou)
- **Verificació**: Importar `useAuth()` des de qualsevol component → retorna `{ user: null, authReady: false }` inicialment. Build OK.
- **Depèn de**: 0.1

### Pas 2.2 — Crear pàgina de registre
- **Què**: Formulari amb nom, email, contrasenya, confirmació. Validació bàsica. Després del registre, crear fila a `profiles` amb `user_id` i `name`.
- **Fitxers**: `src/pages/RegisterPage.jsx` (nou)
- **Verificació**: Registre amb email de prova → Supabase crea usuari. Taula `profiles` té nova fila. Build OK.
- **Depèn de**: 2.1

### Pas 2.3 — Crear pàgina de login
- **Què**: Formulari amb email i contrasenya. Link a registre i recuperació (`supabase.auth.resetPasswordForEmail`).
- **Fitxers**: `src/pages/LoginPage.jsx` (nou)
- **Verificació**: Login amb usuari de prova → `useAuth()` retorna `user` amb email. Redirect a `/` o pàgina origen.
- **Depèn de**: 2.1

### Pas 2.4 — Afegir rutes i ProtectedRoute de client
- **Què**: Afegir rutes `/login` i `/register` a `AppRoutes.jsx`. Crear `ClientRoute.jsx` (o ampliar `ProtectedRoute.jsx`) per protegir rutes de client (perfil, comandes, checkout). Si no autenticat → redirect a `/login`.
- **Fitxers**: `src/routes/AppRoutes.jsx` (editar), `src/components/ProtectedRoute.jsx` (editar o crear `ClientRoute.jsx`)
- **Verificació**: Navegar a `/perfil` sense sessió → redirect a `/login`. Navegar amb sessió → mostra pàgina.
- **Depèn de**: 2.2, 2.3

### Pas 2.5 — Connectar UserProfileTabs a dades reals
- **Què**: Substituir dades hardcoded (`Joan Garcia`) per dades de Supabase. Llegir/escriure taula `profiles` (dades personals), `addresses` (adreces), `orders` (comandes filtrat per `user_id`).
- **Fitxers**: `src/components/UserProfileTabs.jsx` (editar), possible `src/hooks/useProfile.js` (nou)
- **Verificació**: Perfil mostra email real de l'usuari autenticat. Editar nom → canvi persistent a Supabase. Pestanya comandes mostra comandes reals (o buit si no n'hi ha).
- **Depèn de**: 2.4

### Pas 2.6 — Integrar auth al mega-slide (pàgina 4)
- **Què**: Pàgina 4 (USUARI) del mega-slide: si no autenticat, mostrar formulari compacte de login. Si autenticat, mostrar perfil real.
- **Fitxers**: `src/components/FullWideSlideDemoHeader.jsx` (editar), `src/components/UserProfileTabs.jsx` (ja editat a 2.5)
- **Verificació**: Sense sessió, pàgina 4 mostra formulari. Amb sessió, mostra dades reals.
- **Depèn de**: 2.5

---

## Fase 3 — Pagament amb Stripe

### Pas 3.1 — Crear Netlify Function `create-payment-intent`
- **Què**: Funció serverless que rep `amount` i `currency`, crea Payment Intent amb Stripe, retorna `clientSecret`.
- **Fitxers**: `netlify/functions/create-payment-intent.js` (nou)
- **Verificació**: `curl -X POST /.netlify/functions/create-payment-intent -d '{"amount":2999,"currency":"eur"}'` retorna `{ clientSecret: "pi_test_..." }`. Errors validats (amount > 0, currency vàlida).
- **Depèn de**: 0.2

### Pas 3.2 — Instal·lar Stripe Elements
- **Què**: Instal·lar `@stripe/react-stripe-js` i `@stripe/stripe-js`. Crear wrapper `Elements` que carrega Stripe amb `VITE_STRIPE_PUBLISHABLE_KEY`.
- **Fitxers**: `package.json` (afegir deps), `src/components/StripeProvider.jsx` (nou)
- **Verificació**: `import { Elements } from '@stripe/react-stripe-js'` funciona. Build OK.
- **Depèn de**: 0.2

### Pas 3.3 — Substituir formulari dummy de CheckoutPage per Stripe Elements
- **Què**: El `CheckoutPage.jsx` actual té un formulari amb camps de targeta fake (`cardNumber`, `expiryDate`, `cvv`). Substituir per `PaymentElement` de Stripe. Mantenir l'estructura visual (pauta, grid) però canviar el contingut del formulari.
- **Fitxers**: `src/pages/CheckoutPage.jsx` (editar — substituir secció de payment details)
- **Verificació**: El formulari mostra Stripe Elements (input de targeta de Stripe). No hi ha camps `cardNumber`/`cvv` manuals. Build OK.
- **Depèn de**: 3.1, 3.2

### Pas 3.4 — Implementar flux de pagament real
- **Què**: Al clicar "Confirma la compra": (1) cridar `create-payment-intent` amb el total, (2) `stripe.confirmPayment()` amb el `clientSecret`, (3) redirect segons resultat.
- **Fitxers**: `src/pages/CheckoutPage.jsx` (editar `handleSubmit`)
- **Verificació**: Amb targeta de test `4242 4242 4242 4242` → pagament exitós. Amb `4000 0000 0000 0002` → error mostrat. Console mostra `paymentIntent.status: 'succeeded'`.
- **Depèn de**: 3.3

### Pas 3.5 — (Opcional) Webhook Stripe
- **Què**: Netlify Function que escolta `payment_intent.succeeded` i actualitza estat de comanda a Supabase.
- **Fitxers**: `netlify/functions/stripe-webhook.js` (nou)
- **Verificació**: Stripe test event → comanda a Supabase canvia a `confirmada`.
- **Depèn de**: 3.1, 4.2

---

## Fase 4 — Flux de comanda end-to-end

### Pas 4.1 — Connectar cistell al CheckoutPage
- **Què**: El `CheckoutPage.jsx` rep `cartItems={[]}` hardcoded a la ruta. Canviar per passar `cartItems` reals del `CartContext` via `location.state` o directament. Eliminar `mockCheckoutItems` (32 items fake).
- **Fitxers**: `src/routes/AppRoutes.jsx` (editar ruta `/checkout`), `src/pages/CheckoutPage.jsx` (editar — eliminar mocks)
- **Verificació**: Afegir producte al cistell → anar a `/checkout` → mostra producte real. Cistell buit → mostra missatge "cistell buit" o redirect.
- **Depèn de**: 1.3

### Pas 4.2 — Crear comanda a Supabase després del pagament
- **Què**: Després que Stripe confirma pagament (pas 3.4), cridar `useOrders().createOrder()` (que crida `/api/orders` → `netlify/functions/orders.js`) amb: `user_id`, `items`, `total`, `shipping_address`, `payment_intent_id`.
- **Fitxers**: `src/pages/CheckoutPage.jsx` (editar — afegir crida després de confirmPayment)
- **Verificació**: Pagament exitós → taula `orders` a Supabase té nova fila amb dades reals. `order_number` generat.
- **Depèn de**: 3.4, 2.4

### Pas 4.3 — Crear comanda a Gelato
- **Què**: Després de crear comanda a Supabase, cridar `gelatoAPI.createOrder()` amb els productes i adreça. Guardar `gelatoOrderId` a la comanda de Supabase.
- **Fitxers**: `src/pages/CheckoutPage.jsx` (editar — afegir crida Gelato), possible `src/api/gelato.js` (revisar `createOrder`)
- **Verificació**: Comanda a Supabase té `gelatoOrderId` emplenat. Dashboard Gelato mostra comanda.
- **Depèn de**: 4.2, 0.3

### Pas 4.4 — Netejar cistell i redirect a confirmació
- **Què**: Després de comanda creada: `clearCart()`, redirect a `/order-confirmation/:orderId` amb dades reals.
- **Fitxers**: `src/pages/CheckoutPage.jsx` (editar)
- **Verificació**: Cistell buit després de compra. URL canvia a `/order-confirmation/GRF-XXXX`.
- **Depèn de**: 4.2

### Pas 4.5 — OrderConfirmationPage amb dades reals
- **Què**: `OrderConfirmationPage.jsx` té `orderData` hardcoded (items fake, adreça fake). Substituir per lectura de Supabase via `orderId` de la URL.
- **Fitxers**: `src/pages/OrderConfirmationPage.jsx` (editar)
- **Verificació**: Pàgina mostra productes reals comprats, total real, adreça real.
- **Depèn de**: 4.2

### Pas 4.6 — OrderTrackingPage amb Supabase
- **Què**: `OrderTrackingPage.jsx` llegeix de `localStorage.getItem('orders')`. Canviar per crida a `/api/orders?email=...` (ja existeix a `useOrders.js`).
- **Fitxers**: `src/pages/OrderTrackingPage.jsx` (editar)
- **Verificació**: Buscar comanda existent → mostra estat real. Comanda no trobada → error.
- **Depèn de**: 4.2

---

## Fase 5 — Poliment i legal

### Pas 5.1 — Revisar continguts legals
- **Què**: Revisar i actualitzar contingut de les 4 pàgines legals amb text real (no placeholder).
- **Fitxers**: `src/pages/TermsPage.jsx`, `src/pages/PrivacyPage.jsx`, `src/pages/ShippingPage.jsx`, `src/pages/FAQPage.jsx`
- **Verificació**: Llegir cada pàgina — contingut coherent, en català, sense Lorem Ipsum.
- **Depèn de**: 4.6

### Pas 5.2 — Verificar SEO
- **Què**: Confirmar que `SEO.jsx` i `SEOProductSchema.jsx` funcionen amb productes reals. Sitemap dinàmic. `robots.txt` correcte.
- **Fitxers**: `src/components/SEO.jsx`, `src/components/SEOProductSchema.jsx`, `public/robots.txt`
- **Verificació**: View source d'una pàgina de producte → meta tags correctes. Google Rich Results Test passa.
- **Depèn de**: 1.3

### Pas 5.3 — Testing final end-to-end
- **Què**: Flux complet manual: registre → navegar → afegir al cistell → checkout → pagar (test) → confirmació. Flux admin: login → veure comandes.
- **Fitxers**: Cap (testing)
- **Verificació**: Tot el flux completa sense errors. Mobile responsive acceptable. Error boundary actiu.
- **Depèn de**: 4.6, 5.1

---

## Resum de passos i dependències

```
Fase 0:  0.1 ─┬─→ 0.3
         0.2 ─┘

Fase 1:  1.1 ──→ 1.2 ──→ 1.3 ──→ 1.5
                 1.2 ──→ 1.4

Fase 2:  2.1 ──→ 2.2 ──┐
         2.1 ──→ 2.3 ──┴→ 2.4 ──→ 2.5 ──→ 2.6

Fase 3:  3.1 ──→ 3.3 ──→ 3.4
         3.2 ──→ 3.3
         3.1 + 4.2 ──→ 3.5 (opcional)

Fase 4:  1.3 ──→ 4.1
         3.4 + 2.4 ──→ 4.2 ──→ 4.3
                              4.2 ──→ 4.4
                              4.2 ──→ 4.5
                              4.2 ──→ 4.6

Fase 5:  4.6 ──→ 5.1 ──→ 5.3
         1.3 ──→ 5.2
```

**Total**: 24 passos (21 obligatoris + 3 opcionals)

Fases 1, 2 i 3 es poden fer en paral·lel després de Fase 0.

---

## Criteris d'acceptació per obrir

- [ ] Productes reals visibles (mínim 1 per col·lecció)
- [ ] Registre i login de clients funcionen
- [ ] Pagament Stripe processat (test mode primer, live després)
- [ ] Comanda creada a Supabase i Gelato després del pagament
- [ ] Pàgina de confirmació mostra dades reals
- [ ] Perfil d'usuari mostra dades reals
- [ ] Pàgines legals amb contingut real
- [ ] Error boundary actiu
- [ ] Build de producció sense errors
