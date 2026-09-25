# PROMPT PER CONTINUAR LA SESSIÓ

> Copia i enganxa això tal qual com a primer missatge de la sessió nova.
> **Data de redacció:** 25/09/2026 (vespre) · **Últim commit:** `76ec1d6` ·
> **Aquest prompt:** `76ec1d6` · **Arbre net i pujat.**

---

Treballes al projecte **higginsgrafic-ecommerce-dev**
(`/Users/marc/EXTRA LOCAL/PROJECTES LOCAL/GRUP HIGGINS/GRÀFIC/BOTIGUES/ECOMMERCE/PROJECTE/ECOMMERCE-WEB/higginsgrafic-ecommerce-dev`).

## PRIMER DE TOT

Llegeix això i no facis res més fins a haver-ho llegit:

1. **`docs/informes/PROMPT-continuar-2026-09-25-vespre.md`** — el bloc del vespre:
   què està fet i verificat, què està fet i **no** verificat, què queda obert i
   els pedaços que es van haver de treure. És el document de treball; aquest
   prompt només n'és l'entrada.
2. **`docs/constitucio.md`** — sobretot la regla 15 (cada número, amb un origen
   llegible; pedaços, si es poden evitar, no) i la 16 (cap barra de desplaçament
   a la interfície).
3. **`docs/informes/TESTIMONI-2026-09-23.md`, secció 4** — «On NO s'ha de mirar
   per mesurar».

## LA FEINA ONADA

### 1. El botó d'enrere del navegador deixa el megaslide trencat

**Aquesta és la feina.** Repro exacta: obrir el megaslide a FIRST CONTACT →
clicar una samarreta atenuada (la casella 7, l'Afrodita de THE HUMAN INSIDE) →
arriba a `/the-human-inside/afrodita` → **botó d'enrere del navegador**. Queda:

- el megaslide **obert**,
- la franja a FIRST CONTACT,
- la graella **buida** (cap peça activa dins la finestra; el desplaçament queda a
  2.360 px quan la finestra fa 853,6).

**Causa mesurada:** el navegador restaura la pàgina del **bfcache** amb l'estat de
React d'abans de marxar i sense tornar a muntar res. Ho vaig comprovar amb una
marca escrita a `window` abans d'anar-me'n: en tornar hi era. Per això
`useUrlActiveCollection` no s'executa (la URL no canvia) i el centratge de la
graella no es dispara (només mira si la col·lecció ha canviat).

**On mirar, per ordre:**

1. `src/components/fullwide/CercadorTextRow.jsx`, l'efecte de centratge (cap a la
   línia 522). Avui només centra si la clau `activeCollection|activeSubcollection`
   ha canviat.
2. `src/hooks/useUrlActiveCollection.js` i el lector de `pageshow`/`popstate` a
   `FullWideSlideHeader.jsx` (cap a la línia 414).
3. `src/components/fullwide/MegaMenuPanel.jsx`: per on fer arribar un senyal
   d'«acaba d'obrir» a la filera sense remuntar-la sencera.

**REGLA D'AQUESTA FEINA:** no hi posis cap pedaç sense una repro que el
justifiqui. La sessió passada es va empitjorar dos cops el que funcionava
(intents: tancar el megaslide en navegar; una segona passada de centratge
mesurada; una clau de remuntatge del carrusel). Tots tres es van desfer.

### 2. La PDP ha de mostrar el color i la variant del megaslide

El megaslide navega amb `?color=<slug>&variant=<white|black|color>`. Comprova que
`PdpPage` (`/<colleccio>/<ruta>`, la del registre) els llegeix i arrenca amb el
color i l'acabat triats. **No verificat.**

### 3. Falta el producte del marc groc de «Looking For My Darcy»

A `src/data/pdpRegistry.js` no hi ha cap producte de marc groc sol: hi ha
`looking-for-my-darcy-pink-yellow-frame`, i el dibuix «Looking For My Darcy
Yellow Frame» hi apunta. **És cosa de l'amo.**

## EL QUE JA ESTÀ FET I NO S'HA DE REFER

| commit | què |
|---|---|
| `f510ba0` | `src/config/pdpRoutes.js` (dibuix → PDP) i la franja fa circular els 64 dibuixos per les 14 cases fixes |
| `eec3a11` | el clic va a la PDP del **registre** (`/<colleccio>/<ruta>`), no a `/product/<slug>` |
| `1162a5b` | la samarreta atenuada obre **el seu** producte |
| `7f0cbef` | i l'activa, i deixa la col·lecció centrada a la graella |
| `defb17d` | la col·lecció torna de la URL amb `pageshow`; atenuació de la franja a 0,12 |
| `71c3d3a` | la clau de la col·lecció amb guió a la URL (`clauColleccioDeUrl`); el gestor del clic de la franja ja no queda vell |
| `36745a5` | treure el tancament del megaslide en clicar (l'amo no el volia) |

## TRAMPES JA TROBADES (no hi tornis a caure)

- **Dues pàgines de producte hi conviuen:** `/<colleccio>/<ruta>` (`PdpPage`, la
  del registre, **la del megaslide**) i `/product/<slug>` (`ProductDetailPage`).
- **La cadena dibuix → `product_mockups.variant_id` → producte NO es pot
  recórrer:** de 152 files de mockups, cap té `variant_id`; de 4.116 variants,
  cap té el camp `design`.
- **La franja no pot lliscar de debò:** el dibuix de fons no es repeteix (el
  blanc coincideix al 49 % desplaçat 1/14; el de colors, al 0,75 %). El que
  circula és la **llista**, no els píxels. El pas entre cases sí que és constant
  (6,8691 / 6,8705 / 6,8706 %).
- **L'ordre de la tira:** primer la col·lecció activa, després les altres en
  l'ordre de la graella (`first_contact`, `the_human_inside`, `austen`, `cube`,
  `miscellania`). Per això, si cliques una d'atenuada, la primera que surt a mà
  és THE HUMAN INSIDE.
- **Els guions temporals** (`scripts/_tmp-*.mjs`) no es comitegen mai. Els útils
  de la sessió passada: `_tmp-flux-amo.mjs` (el flux de l'amo),
  `_tmp-pdp-tots.mjs` (les 64 rutes), `_tmp-clic-activa.mjs`,
  `_tmp-periode-sprite.mjs`.

## ELS NÚMEROS DE REFERÈNCIA (1920×946)

- franja: **357,8 · 222,9 · 1049,1 × 112,4**; la imatge 357,8..1406,9
- finestra de la graella: **455,6..1309,2** (centre 882,4)
- selector B/C/N: 381..445,7 × 76,7..206,1
- graella: 64 peces · pas 69,83 · una peça per clic 34,91 · període 2234,5
- atenuació: **0,12** a la franja i a la graella

## LES REGLES DE LA CASA

- **Battery abans de comitejar**: `npx vitest run` (514) · `npx eslint` sobre els
  fitxers tocats (línies base: `FullWideSlideHeader` 27, `MegaStripePanel` 16,
  `CercadorTextRow` 6, `MegaslidePagina2` 7, `MegaMenuPanel` 2,
  `firstContactPanels` 4) · `npx vite build` · `npm run compara-vistes` (ha de
  dir **OK**) · `node scripts/mesura-formats.mjs` (ha de dir **0 i 0**).
- Els guions temporals (`scripts/_tmp-*.mjs`) **no es comitegen mai**.
- **Res de `push`** sense demanar-ho.
- El servidor de desenvolupament del **3003 no es toca mai** (l'amo hi té
  l'overlay obert; es recarrega amb F5).
- Es mesura **abans i després**, i cada número ha de tenir un origen llegible.
- Tot en **català**, i en el to de la casa: **ras i curt**.
