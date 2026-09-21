# Prompt de resum per continuar (vista vertical 768 + checkout/PDP)

Copia-ho al començament d'una sessió nova.

## Regles de l'amo (no negociables)

- Tot **en català**: codi, comentaris, commits i conversa.
- **No fer push.**
- **No aturar ni reiniciar el servidor del 3003** (és el Vite de desenvolupament que ve l'amo, amb HMR). Si cal servir una altra cosa, `vite preview` en un altre port i aturar-lo en acabar. Mai `lsof -ti :3003 | xargs kill`.
- Abans de dir que una cosa està feta: `npx vitest run` i `npx vite build`, i comprovar-ho al navegador (Playwright) si és visual.
- **Fer exactament el que demana**: no suposar, no inferir, no aprofitar per arreglar res més. Si una instrucció és impossible o ambigua, preguntar.
- Una instrucció a la vegada; l'amo itera mirant la pantalla.
- Els scripts de prova temporals van a `scripts/_tmp-*.mjs` i **s'esborren** en acabar; les captures a `docs/comparacio/` (ignorat pel git).

Projecte: `higginsgrafic-ecommerce-dev` (React 18 + Vite + Tailwind + vitest + Playwright).
Repositori: `/Users/marc/EXTRA LOCAL/PROJECTES LOCAL/GRUP HIGGINS/GRÀFIC/BOTIGUES/ECOMMERCE/PROJECTE/ECOMMERCE-WEB/higginsgrafic-ecommerce-dev`
Servidor: **http://127.0.0.1:3003** (també respon a `http://localhost:3003`).

Eines de regressió de l'amo: `npm run mesura:megaslide` (833 xifres; al 768 n'hi ha 18 que es mouen des dels canvis de la vertical, cap altra mida no s'ha de moure) i `npm run compara-vistes` (ha de donar OK).

## Estat actual

`HEAD` = `d21d904`. 462 proves OK, build OK, comparador OK.

**Pendent al disc, sense cometre** (no són canvis meus): `public/placeholders/tablet vertical/stripe-curta-7+7.png` (modificat i ja no s'usa) i les dues còpies `.png` que va penjar l'amo (`full-color-stripe-doble.png`, `full-white-stripe-doble.png`).

### La franja de la vista vertical (768)

- **Ja no és una imatge fixa**: hi ha el panell de debò (`MegaStripePanelP1` a la pàgina 1 i `MegaStripePanel` a la 2), com a segona instància dins la casella de la taula, amb les props compartides a `propsFranjaP1` / `propsFranjaP2`.
- **Imatge**: la de color (`full-color-stripe-doble.webp`, 1487×695) a la pàgina 1 i la blanca (`full-white-stripe-doble.webp`, 1487×694) a la 2. Són les que va donar l'amo i tenen les samarretes senceres.
- **Mides a 768**: p1 457,8 × 214 amb el top a 316,3 (alineat amb el top del selector); p2 459,3 × 214,4. Escales: 2,177 (p1, `translateY(119,95px)`) i 2,098 (p2, amb el seu desplaçament). Si es canvia la imatge, **cal recalcular-les**.
- `hideGrid` als dos panells (la graella de dibuixos de la vertical és a la seva casella de la taula, no dins la franja).
- `senseMascaraSamarreta` als dos (la màscara de contorn del panell és d'una filera i tallava la segona).
- **El tint de les samarretes** (la capa `multiply` de `shirtColor`) es retalla amb la mateixa imatge de la stripe (`mask-image: url(<stripe>)`), perquè el canal alfa és el contorn de les samarretes: així el color només tenyeix les samarretes i no el rectangle de fons.
- Les 14 posicions dels dibuixos (`stripeMaskTileRectsRawPct`) es reparteixen en **dues fileres de 7** a la vertical (`rectsMascara`), i la vora de cada filera (la samarreta sencera) es calcula per filera (`safeIdx % 7`).

### Els mecanismes (verificats al navegador a 768)

- **Els clics hi arriben**: el contingut de l'horitzontal queda `visibility: hidden` **i** `pointer-events: none` a la vertical (MegaMenuPanel i MegaslidePagina2), i la casella de la graella (1-5) de les dues taules va amb `z-index: 20`. Sense això, l'overlay de clic de l'horitzontal i l'embolcall del panell s'empassaven els tocs.
- **Les fletxes passen fulls de dibuixos**: la graella de la pàgina 1 ensenya 7 dibuixos per pàgina (`paginaGraella`).
- **El tap en un dibuix tria la col·lecció** i fixa el dibuix a la franja (a les dues graelles).
- **Col·leccions i colors canvien el que es veu** (verificat: CUBE canvia els dibuixos; el blau tenyeix les samarretes).
- El selector Blanc/Color/Negre va cablejat a les variants.

### La pàgina 2 deixa de retallar

El contenidor de la pàgina 2 del carril portava `overflow: hidden` a la vertical i tallava l'anell del color triat. Ara és `visible` (`d21d904`). **Conseqüència**: qualsevol cosa de la pàgina 2 que surti de la seva caixa ara es veu.

## El que queda per fer

### 1. Baixar la PDP 125 px, només a 768 (en curs)

L'amo ho ha demanat així: «Baixa la tdp, 125 px» i «Només a la 768». La **tdp** és el bloc de la PDP: les **tres columnes** amb la samarreta groga gran al mig (miniatures, samarreta, informació).

On és:
- `src/pages/ProductDetailPage.jsx` línia **1126**: el bloc `data-pdp-desktop="1"` amb `hidden lg:block` — a 768 **no es veu** (el punt de tall `lg` és 1024).
- Per tant a 768 mana **l'altra branca**, la del segon `<ProductGallery>` cap a la línia **1200**. És allà on va el desplaçament.
- **No** s'ha de moure l'embolcall de la pàgina (`min-h-screen bg-white` amb `transform: scale(0.94)`), perquè també baixaria la navegació de molles.

### 2. Comprovar que el clic d'una samarreta porta a la PDP

El cablejat hi és (les instàncies de la vertical reben el mateix `onShirtClick` que la filera) i el bloqueig que ho impedia ja no hi és, però **no està verificat**.

## Com arribar al checkout i a la PDP (per provar)

- PDP d'un producte: `http://localhost:3003/austen/pride-and-prejudice-3?color=daisy` (també serveix `first-contact/nx-01`).
- Checkout: **no s'hi va directament per URL si el cistell és buit** (redirigeix a `/`). Cal: obrir la PDP → clicar **AFEGEIX AL CISTELL** → anar a `/checkout`. La ruta existeix (`src/routes/AppRoutes.jsx` línia 148).
- Al checkout, la targeta de producte (la samarreta + títol + talla + preu) és el que l'amo en diu «la tdp» en aquest context.

## Verificació, sempre

```
npx vitest run                 # 462 proves, 38 fitxers
npx vite build
npm run compara-vistes         # ha de donar OK
npm run mesura:megaslide       # només les 18 xifres del 768
```

I una comprovació al navegador a 768 (`hasTouch: true`), mirant el DOM i fent una captura a `docs/comparacio/`.
