# TASQUES PENDENTS — Higgins Gràfic Ecommerce

## ✅ Completades

### Components de dev/debug
- `DevGuidesOverlay`, `Pauta4ColsOverlay`, `BeltReferenceOverlay` — revisats
- `CalibrationsHud.jsx` esborrat (0 imports)
- Tots protegits amb `import.meta.env.DEV` o `ProtectedRoute`

### Sitemap visual
- `pagesManifest.js` actualitzat amb col·leccions actives
- Redirects obsolets esborrats (`/the-human-inside → /thin`, `/wishlist → /`)
- Ruta `/new` esborrada

### Utils i config
- 6 fitxers morts esborrats: `dataSource.js`, `placement-profiles.json`, `calibrationKeys.js`, `decodeHtml.js`, `stripeUrlParams.js`, `placeholderText.js`

### Optimització de rendiment
- `manualChunks` afegit a `vite.config.js` — React, Supabase, Radix, Framer Motion en chunks separats
- Bundle principal reduït de 800 kB a 379 kB (-53%)
- `toast.jsx` + `toaster.jsx` esborrats (codi mort, eliminava chunk de 300 kB)
- `loading="lazy"` afegit a totes les `<img>` (100% cobert)
- Pendent: bundle analysis amb `rollup-plugin-visualizer`

---

## 🔴 Bloquejants — sense això no hi ha vendes

### 1. Separar cart de ProductContext
- `ProductContext.jsx` (700 línies) — cart i wishlist funcionen, però tot en un sol context
- Separar cart i wishlist en contexts propis facilita la tasca 2
- `AdminContext.jsx` (257 línies) — funcional, no cal tocar
- `useTexts.js` (27 línies, 13 usos) — funcional
- `useOffersConfig.js` (122 línies, 3 usos) — funcional
- `AdminToolsContext.jsx` (55 línies) — funcional
- `GridDebugContext.jsx` (118 línies) — funcional
- `ToastContext.jsx` (100 línies) — funcional, pendent adaptar estil (tasca 7)
- **Impacte**: Base de dades de tota la app. Facilita la tasca 2.

### 2. Cistell funcional (mockups → producció)
- `CistellLayouts.jsx` (221 línies) — 4 layouts, **tot hardcoded** (productes, preus, quantitats fixos)
- `ProductContext.jsx` ja té `addToCart`, `removeFromCart`, `updateQuantity`, `cartCount`, `cartTotal` — la lògica existeix
- `App.jsx` renderitza els 4 layouts amb un selector (botons Layout 1-4) — és un showcase, no un cistell real
- **Cal fer**:
  - Connectar `CistellLayouts` al `cartItems` del `ProductContext` (o nou `CartContext`)
  - Substituir productes hardcoded per `cartItems` dinàmics
  - Botons +/- funcionals (cridar `updateQuantity`)
  - Càlcul dinàmic de subtotal/IVA/total (ja existeix `cartTotal` al context)
  - Camp codi descompte connectat al sistema promocional (`useOffersConfig`)
  - Botó "Comanda" → navegar a `/checkout`
  - Triar 1 dels 4 layouts (o combinar-ne elements)
- **Impacte**: Sense això no hi ha vendes.

### 3. Flux de checkout complet
- `CheckoutPage.jsx` (513 línies) — formulari funcional però **sense Stripe**. Genera un `orderId` aleatori i navega a confirmació sense cobrar
- `PaymentForm.jsx` (162 línies) — **ja implementat** amb `@stripe/react-stripe-js` (`CardElement`, `useStripe`, `useElements`) però **no s'usa** al `CheckoutPage`
- `src/api/stripe.js` (45 línies) — `getStripe()` + `createPaymentIntent()` via Netlify Functions. També **no s'usa**
- `@stripe/react-stripe-js` i `@stripe/stripe-js` instal·lats al `package.json`
- `OrderConfirmationPage.jsx` (301 línies) — mostra comanda mock hardcoded
- `OrderTrackingPage.jsx` (374 línies) — busca a `localStorage`, no a Supabase
- **Cal fer**:
  - Integrar `PaymentForm` dins `CheckoutPage` (wrap amb `<Elements stripe={getStripe()}>`)
  - Crear Netlify Function `create-payment-intent` (o Supabase Edge Function)
  - Guardar comandes a Supabase després del pagament
  - Connectar `OrderConfirmationPage` a dades reals de la comanda
  - Connectar `OrderTrackingPage` a Supabase
  - Configurar `VITE_STRIPE_PUBLISHABLE_KEY` al `.env`
- **Impacte**: Tancar el cicle de compra.

---

## 🟡 Alts — experiència de compra

### 4. Pàgines de producte (ProductDetailPage)
- `ProductDetailPage.jsx` (1349 línies) — **molt funcional**:
  - Galeria d'imatges amb `galleryImageIndex` ✅
  - Selector de talla (`selectedSize`) i color (`selectedColor`) ✅
  - `addToCart` connectat al `ProductContext` ✅
  - `toggleWishlist` connectat ✅
  - Variants (`validVariants`) amb disponibilitat ✅
  - Preus per variant ✅
- **Pendent**:
  - Revisar SEO per producte (Helmet/JSON-LD)
  - Verificar descomptes i promocions
  - Revisar 1349 línies — possiblement refactoritzable
- **Impacte**: És on l'usuari decideix comprar.

### 5. SEO i analítica
- Dos sistemes d'analytics convivint: `lib/analytics.js` (Plausible, GDPR-compliant) i `utils/analytics.js` (GA4 + Meta Pixel) — decidir quin s'usa
- Revisar metadades SEO (React Helmet) a totes les pàgines actives
- Verificar JSON-LD schemas (product, collection, organization)
- Sitemap XML i robots.txt
- **Impacte**: SEO, compliance, analítica de conversió.

---

## 🟢 Mitjans — mantenibilitat

### 6. Adaptar Toast a l'estil de la botiga
- `ToastContext.jsx` — els avisos actuals usen colors genèrics (verd/blau/vermell estàndard)
- Adaptar tipografia (Oswald/Roboto), paleta de marca i estil visual de Higgins Gràfic
- **Impacte**: Consistència visual.

### 7. Refactor pàgines de col·lecció
- 7 fitxers, 2378 línies totals:
  - `CollectionFirstContactPage.jsx` (344), `CollectionAustenPage.jsx` (371), `CollectionTheHumanInsidePage.jsx` (361), `CollectionCubePage.jsx` (348), `CollectionMiscellaniaPage.jsx` (342)
  - `CollectionPage.jsx` (285) — component genèric
  - `ConstructorColleccioPage.jsx` (327) — versió dev
- **Moltíssima duplicació**: els 5 fitxers de col·lecció comparteixen imports, constants (`COLLECTION_BG_SRC`, `TDP_DESCRIPTION`, `tdpImage`, `CANON_COLORS`) i estructura — només canvien els productes i algunes dades
- **Cal fer**: Refactor cap a un component únic parametritzable (passar productes, títol, descripció com a props)
- **Impacte**: Mantenibilitat, reducció de codi ~70%.

### 8. Accessibilitat
- `SkipLink` verificat — present a `App.jsx`
- `aria-label`: 119 fitxers l'usen (base bona)
- `aria-hidden`: 101 fitxers (icones decoratives correctes)
- Totes les `<img>` tenen `alt` — ok
- **Problema principal**: 59 `<input>` sense `label` ni `aria-label` ni `id` (de 62 totals)
  - `CheckoutPage.jsx` (15), `UserProfileTabs.jsx` (14), `Checkout.jsx` (8), `CistellLayouts.jsx` (4)
  - Cal afegir `aria-label` o `<label>` associat a cada input
- 709 botons de 710 sense `aria-label` (la majoria tenen text visible, però els d'icona necessiten `aria-label`)
- `useFocusTrap` implementat i en ús — ok per modals
- **Impacte**: Compliance i UX.

---

## 🔵 Baixos — polish

### 9. Simplificar App.jsx (6000+ línies)
- Separar rutes en fitxer apart (`routes.jsx` o similar)
- Agrupar rutes per zona (col·leccions, comerç, admin, dev)
- Reduir lògica inline (animacions motion.div repetides)
- Avaluar si `App.jsx` i `AppProd.jsx` es poden unificar amb un flag d'entorn
- **Impacte**: Mantenibilitat, llegibilitat.

### 10. Simplificacions pendents generals
- `ConstructorColleccioPage.jsx` + `ConstructorPdpPage.jsx` — pàgines dev de maquetació, avaluar si es poden unificar o simplificar
- Components fullwide/megaslide — molts estils inline, avaluar migració a Tailwind
- `EditableTextBox.jsx` (543 línies, 68 imports) — revisar si tots els usos són necessaris
- **Impacte**: Mantenibilitat global.

### 11. MegaslidePagina2 — deute tècnic
- `MegaslidePagina2.jsx` — 55 props, component de presentació que només distribueix
- Estils inline en lloc de classes CSS/Tailwind
- `MegaHeroSlider` amb slides hardcoded (`white-1`, `white-2`, `white-3`) — mock data
- `Pauta4ColsOverlay` usat com a wrapper de layout amb `pautaEnabled={false}` — deliberat, es manté (mesura de columnes/cel·les, activable per calibrar)
- Considerar reduir props agrupant-los en un objecte de configuració
- **Impacte**: Mantenibilitat.
