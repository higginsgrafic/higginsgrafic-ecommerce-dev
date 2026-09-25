# PROMPT PER CONTINUAR LA SESSIÓ

> Copia i enganxa això tal qual com a primer missatge de la sessió nova.
> **Data de redacció:** 25/09/2026 · **Últim commit de feina:** `8c08d74` ·
> **Aquest prompt:** `61c1b3b` · **Arbre net.**

---

Treballes al projecte **higginsgrafic-ecommerce-dev**
(`/Users/marc/EXTRA LOCAL/PROJECTES LOCAL/GRUP HIGGINS/GRÀFIC/BOTIGUES/ECOMMERCE/PROJECTE/ECOMMERCE-WEB/higginsgrafic-ecommerce-dev`).

## PRIMER DE TOT

Llegeix això i no facis res més fins a haver-ho llegit:

1. **`docs/informes/PROMPT-continuar-2026-09-25-franja.md`** — el bloc d'avui amb
   tot el detall: el pla, les mesures, les trampes trobades i els números. És el
   document de treball; aquest prompt només n'és l'entrada.
2. **`docs/constitucio.md`** — sobretot la regla 15 (cada número, amb un origen
   llegible; pedaços, si es poden evitar, no) i la 16 (cap barra de desplaçament
   a la interfície).
3. **`docs/informes/TESTIMONI-2026-09-23.md`, secció 4** — «On NO s'ha de mirar
   per mesurar».

## LA FEINA ONADA, PER ORDRE

### 1. Tancar el clic: el mapa dibuix → producte

El megaslide envia el **nom del dibuix** (`NX-01`) on la PDP espera un producte,
i per això surt «Producte no trobat». La ruta `/<col·lecció>/<producte>` ja hi és
(`18ce157`) i el 404 ja no surt. La cadena que falta és:

`design_name` → fila de **`product_mockups`** (`design_name`, `variant_id`) →
el producte de **`products`** que porta aquella variant → `/product/<slug>`
(`getProductById` de `ProductContext` ja accepta id o slug).

**Decisió presa amb l'amo: resoldre-ho ARA i prou** (no una cerca asíncrona a
cada clic). Passos:

1. Un guió **temporal** (no es comiteja) que obri la pàgina amb Playwright i,
   des de dins, importi els mòduls de l'app (`/src/api/mockups.js` i
   `/src/api/supabase-products.js`), creui les dues taules i tregui el mapa
   `col·lecció + dibuix → slug`.
2. **`src/config/pdpRoutes.js`** amb el mapa resultant, el comentari d'on surt i
   la data.
3. **`resolvePdpUrl`** (`FullWideSlideHeader.jsx`, cap a la línia 251) el
   consulta primer i cau als mapes de noms actuals si un dibuix no hi és.
4. Battery i commit.

### 2. El scroll dels dibuixos de la franja

**P.S. de l'amo: «les samarretes no s'han de moure. Només els dibuixos.»** O
sigui que la imatge de les 14 samarretes (el sprite) i **l'encaix de les
cintures queden intactes**: no es toca ni `useEscalaFranjaCarril` ni el
calibratge. El que es mou és la **capa de dibuixos**.

- La tira de dibuixos, de **totes les col·leccions seguides** (ja es construeix
  col·lecció a col·lecció des de `e9e0574`: `tiraFranja`, a `MegaslidePagina2`).
- El moviment, com la graella: **una peça per fletxa**, **volta infinita** (dues
  còpies + residu modular) i **rodeta** (`passive: false`).
- **L'escull:** avui cada dibuix va retallat amb la màscara de la seva casella
  (`stripeMaskTileRectsRawPct`); si llisquen, el retall ha de viatjar amb ells.
  Dues vies: la màscara que acompanya cada dibuix, o una capa pròpia escalada
  igual que el sprite.

### 3. L'atenuació dels dibuixos que no són de la col·lecció activa

A **0,24**, com a la graella (`pintaItem`). Ara surten a ple i es confonen amb
els actius.

### 4. Els dos bucles de mesura que fan ballar el contingut

En canviar de col·lecció (i en muntar-se), **tot el bloc del cercador** —selector,
filera i barres de color— baixa **6,7 px**; la franja i el panell no es mouen.
Mesurat: selector 76,7 → 83,3 · filera 78,3 → 85,0 · colors 176,9 → 183,5. La
causa és la mesura que alimenta `topVisualAlignmentY` (la hipòtesi de l'amo té
bona pinta: els dibuixos retallats en canvien l'alçada). La solució és **fixar**
les mides que no han de dependre de la col·lecció triada: l'alçada de la
previsualització de la franja i el `fit` de la graella.

## ELS NÚMEROS DE REFERÈNCIA (1920×946)

- carril 381..1524 · finestra de la graella 455,6..1309,2 (centre **882,4**)
- selector B/C/N 381..445,7 × **76,7..206,1**; caselles: BLANC 98,25 · COLOR
  141,35 · NEGRE 184,5
- bloc de fletxes 1319,1..1383,8 × **76,7..206,1**, amb les dues fletxes a 119,8
  i 162,9 (les vores de la casella COLOR)
- graella: 64 peces · pas 69,83 · **una peça per clic 34,91** · període 2234,5 ·
  tira 4539 px (dues còpies)
- barres de color: 14 de **53,6 × 15,3** (7,00:2), 455,6..1309,2, centre = NEGRE
- targetes de col·lecció: 9, del top del selector (76,7) al bottom de la franja
  (335,2)
- franja: cintures **381,6..1384,6** a les dues pàgines (carril esquerre → dreta
  de les fletxes)

## TRAMPES JA TROBADES (no hi tornis a caure)

- **Les fletxes de l'altra pàgina**: el megaslide té les pàgines desplaçades amb
  `translateX`; `ampladaObjectiu()` ha de descomptar el desplaçament de la pàgina
  de la fletxa, o la franja surt escalada 2,7 cops.
- **El contenidor del selector** fa el doble d'ample que la pastilla i
  intercepta els clics de les primeres caselles: el contenidor i el seu embolcall
  van amb `pointerEvents: none`, i la pastilla amb `auto` **dins del seu propi
  `style`** (un segon `style` a JSX no compta).
- **`computeStripeTileOverlaySrcs` resol amb el context de la col·lecció**: per
  fer la tira de totes, cal cridar-la **col·lecció a col·lecció**.
- **La màscara és per casella**, no de la silueta de la samarreta.
- **404 de client**: no dona cap error HTTP; si un estri diu que tot va bé,
  mira la pàgina, no la resposta.

## LES REGLES DE LA CASA

- **Battery abans de comitejar**: `npx vitest run` (514) · `npx eslint` sobre els
  fitxers tocats (línies base: `CercadorTextRow` 6 avisos, `MegaslidePagina2` 6,
  `MegaStripePanel` 16, `MegaStripePanelP1` 4, `MegaMenuPanel` 2 errors,
  `firstContactPanels` 2) · `npx vite build` · `npm run compara-vistes` (ha de
  dir **OK**; mesura `/nova/inici`) · `node scripts/mesura-formats.mjs` (ha de
  dir **0 i 0**).
- Els guions temporals (`scripts/_tmp-*.mjs`) **no es comitegen mai**.
- **Res de `push`** sense demanar-ho.
- El servidor de desenvolupament del **3003 no es toca mai** (l'amo hi té
  l'overlay obert; es recarrega amb F5, i amb el botó «Recarrega»).
- Es mesura **abans i després**, i cada número ha de tenir un origen llegible.
- Tot en **català**, i en el to de la casa: **ras i curt**.
