# Remediació — Higgins Gràfic Ecommerce

**Data:** 2026-09-12
**Complementa:** `docs/diagnosi-seguretat-2026-09-12.md`

Registre de les correccions aplicades i, sobretot, de les **verificacions contra
la base de dades real** que van corregir conclusions de l'anàlisi estàtica.

> **Mètode:** cada canvi s'ha verificat amb `npx vitest run` (126 tests) i
> `npx vite build`. Les conclusions marcades com a verificades s'han comprovat
> consultant l'esquema i les dades reals del projecte Supabase (només lectura).

---

## 1. Correccions aplicades

| # | Correcció | Fitxers |
|---|---|---|
| 1 | **Adreça d'enviament**: no s'enviava mai al servidor, així que Gelato no podia fabricar la comanda | `CheckoutContent.jsx`, `api/stripe.js`, `create-payment-intent.js` |
| 2 | **Transport**: el servidor buscava la zona `'Espanya'` en una taula de claus `es_peninsula`, no coincidia mai i sempre cobrava 4,95 € plans mentre el client en mostrava un altre | `_shipping.js` (nou), `create-payment-intent.js`, `useShippingCosts.js`, `tests/unit/shipping-parity.test.js` |
| 3 | **Esclat en producció**: `useShippingCosts` llançava `TypeError` amb les tarifes indexades per zona de `/api/shipping-rates` | `useShippingCosts.js` |
| 4 | **Checkout bloquejat**: cap dels 12 punts d'addició al cistell posava `gelatoVariantId`; el servidor responia 400 sempre | `create-payment-intent.js`, `CheckoutContent.jsx` |
| 5 | **Slug de la sincronització**: treia el prefix `quotes-` que el registre de rutes conserva → 5 dissenys impossibles de comprar | `api/gelato-sync.js` |
| 6 | **Idempotència del webhook**: desava l'esdeveniment ABANS de retornar 500, així que el reintent de Stripe es descartava i la comanda no s'enviava mai a Gelato | `stripe-webhook.js` |
| 7 | **Items desats vs llegits**: es desaven `unitPrice`/`productName` i es llegien `price`/`name` → correus i confirmació amb 0,00 € | `create-payment-intent.js` |
| 8 | **`#` al número de comanda**: el trigger el genera amb `#`, que es converteix en fragment d'URL → 404 després de pagar | `CheckoutContent.jsx` |
| 9 | **Confirmació i seguiment inaccessibles**: es consultaven sense token i la consulta per número està restringida a administradors | `OrderConfirmationPage.jsx`, `CheckoutContent.jsx`, `OrderTrackingPage.jsx` |
| 10 | **Historial de comandes sempre buit**: les crides a `/api/orders` no portaven `Authorization` | `api/authHeaders.js` (nou), `useOrders.js`, `useProfile.js` |
| 11 | **Enllaç de seguiment 404**: apuntava a `/comanda`, ruta inexistent | `_token.js`, `OrderTrackingPage.jsx` |
| 12 | **Esclat de `PdpPage`**: hooks després d'un `return` anticipat → React desmuntava la pàgina en creuar els 768px | `PdpPage.jsx` (patró embolcall) |
| 13 | **Admin fail-open**: sense `VITE_ADMIN_EMAILS`, qualsevol usuari era admin al client | `AdminContext.jsx` |
| 14 | **Open redirect** a `/ec-preview-lite?redirect=` | `ECPreviewLitePage.jsx` |
| 15 | **RCE al servidor de dev**: `execSync` amb el paràmetre `message` de la URL | `vite.config.js` |
| 16 | **Relay de correu** al formulari de contacte: sense validar l'adreça ni sanejar capçaleres | `send-message.js` |
| 17 | **Inserció anònima** a `rate_limit_log` (permetia desactivar el rate limiting) | migració `20260912200000` |
| 18 | **Desar ofertes fallava sempre**: s'escrivien `discount_enabled`/`discount_rate`, columnes inexistents; `clickable` existia i no s'escrivia mai | `api/promotions.js` |
| 19 | **Preu global duplicat**: l'upsert amb `collection = NULL` no deduplicava i cada desat afegia una fila | `PricingConfigPage.jsx` |
| 20 | **Pèrdua de col·leccions**: s'esborraven les 6 files abans d'inserir-ne de noves | `ColleccioSettingsPage.jsx` |
| 21 | **Línies de cistell fusionades**: l'id no incloïa l'acabat → s'hauria fabricat l'acabat equivocat | `PdpMobile.jsx` |
| 22 | **Correcció de seguretat menor**: `window.open` sense `noopener`, contrasenya amb `Math.random`, JSON-LD sense escapar, codi postal que bloquejava França/Andorra, país de facturació fix `'ES'` | varis |

---

## 2. Conclusions de l'anàlisi estàtica que eren INCORRECTES

Aquestes són les més valuoses de documentar: **si algú les "arregla", trenca una
cosa que funciona.**

### 2.1 Els camps d'adreça del perfil són correctes

L'anàlisi deia que `MegaslidePagina4.jsx` escrivia columnes inexistents
(`street`, `street_number`, `floor_door`, `province`) i proposava canviar-los a
`address`/`first_name`.

**L'esquema real:**
```
addresses: id, user_id, street, floor_door, city, postal_code,
           province, country, is_default, street_number
```

La UI **és correcta**. El que està desactualitzat és
`supabase/migrations/001_orders_schema.sql`, que descriu una taula diferent.

> ⚠️ **Risc obert:** les migracions del repositori NO reflecteixen la base de
> dades real. Aplicar-les en un entorn nou crearia taules amb columnes
> equivocades. Cal regenerar-les des de l'esquema real.

### 2.2 `ProductGrid` no és no-determinista

L'anàlisi deia que `Math.random()` durant el render feia canviar les imatges de
manera impredictible. En realitat el valor es desa a `sessionStorage`
(`miscellaniaGridSeed`), així que és **estable dins de cada sessió**: és una
rotació deliberada, no un bug.

### 2.3 El descompte és codi mort, no un bug

`discountEnabled`/`discountRate` no existeixen a `promotions_config`. Per tant
el descompte sempre val 0 i no hi ha cap diferència entre el que es mostra i el
que es cobra per aquest motiu. (El bug real era que **escrivint-los, fallava el
desat** — vegeu la correcció 18.)

### 2.4 El preu mostrat sí que coincideix amb el cobrat

El catàleg mostra `variant.price` quan existeix i només cau a `pricing_config`
si el preu de la variant és buit. El servidor cobra `product_variants.price`.
Per a les variants amb preu, els dos valors coincideixen.

---

## 3. Estat del catàleg (mesurat)

```
Dissenys al registre del mega-slide:              64
Amb fila a `products`:                            41  (64%)
Amb variants de Gelato reals:                     19  (30%)
+ recuperats pel fix del slug (correcció 5):      ~24  (37%)
```

**El codi del checkout ja funciona; les dades del catàleg estan incompletes.**
Cal executar la sincronització de Gelato perquè la resta de dissenys siguin
venables. Si després de sincronitzar encara en falten, és que Gelato no els té.

---

## 4. Pendents

| Prioritat | Tema | Nota |
|---|---|---|
| Alta | **Sincronitzar el catàleg amb Gelato** | No és codi; desbloqueja ~40 dissenys |
| Alta | **Cistell mòbil** | `CartContext` i l'estat de `FullWideSlideHeader` són dos cistells; `/cart` no existeix. Requereix decisió d'arquitectura |
| Mitjana | `HeroSettingsPage` i `SystemMessagesPage` | Desen configuració que ningú llegeix: l'admin edita i la botiga no canvia |
| Mitjana | Comandes duplicades en reintents de pagament | Cada intent crea una comanda nova |
| Mitjana | Dades de factura (`company`/`taxId`) | Es demanen i es descarten |
| Baixa | Hooks condicionals a `ProductInfo.jsx` | Latent; avui no s'activa |
| Baixa | Migracions desactualitzades | Vegeu 2.1 |
