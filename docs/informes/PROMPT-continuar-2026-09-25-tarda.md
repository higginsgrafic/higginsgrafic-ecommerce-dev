# PROMPT PER CONTINUAR LA SESSIÓ

> Copia i enganxa això tal qual com a primer missatge de la sessió nova.
> **Data de redacció:** 25/09/2026 (tarda) · **Últim commit:** `a9d6696` ·
> **Arbre net i pujat.**

---

Treballes al projecte **higginsgrafic-ecommerce-dev**
(`/Users/marc/EXTRA LOCAL/PROJECTES LOCAL/GRUP HIGGINS/GRÀFIC/BOTIGUES/ECOMMERCE/PROJECTE/ECOMMERCE-WEB/higginsgrafic-ecommerce-dev`).

## PRIMER DE TOT

Llegeix això i no facis res més fins a haver-ho llegit:

1. **`docs/informes/INFORME-2026-09-25-megaslide-enrere-i-falsa-recarrrega.md`** —
   l'informe de la sessió: el botó d'enrere, la falsa recàrrega, el centratge de
   la franja, el vel de les samarretes, el Terminator, i les
   **trampes** (secció 7), que són errors meus i val la pena no repetir.
2. **`docs/constitucio.md`** — sobretot la regla 15 (cada número, amb un origen
   llegible; pedaços, si es poden evitar, no) i la 16 (cap barra de
   desplaçament).
3. **`docs/informes/TESTIMONI-2026-09-23.md`, secció 4** — «On NO s'ha de mirar
   per mesurar».

## LA FEINA ONADA (una sola cosa)

**Alinear la TDP de la PDP a les quatre columnes del rail, i deixar-ne el baix a
50 px del bottom del viewport.**

Ho va demanar l'amo així, en tres missatges que es completen:

> «Alinea la tdp de tres columnes a les tres targetes i a 50 px del bottom de la
> viewport.»
> «Són 4 columnes distribuïdes com a 1+[1+1]+1.»

O sigui: la graella de la PDP té **quatre columnes** (com el rail) i les seves
tres peces hi van repartides **1 + [1+1] + 1**:

| peça | columnes | amplada a 1920 |
|---|---|---|
| ESPECIFICACIONS | 1 | 269,3 |
| la TDP (imatge + miniatures) | 2 i 3 | **560,4** (2×269,3 + 22,2) |
| els detalls (nom, preu, talles) | 4 | 269,3 |

**El repartiment ja hi és fet**: els `gridColumn` del codi són `'1'`, `'2 / 4'` i
`'4'` (a `PdpPage.jsx`, cap a les línies 568, 641 i 768). **El que no quadra és
la MIDA ni la POSICIÓ del bloc.**

### Les xifres, mesurades a 1920 (no cal tornar-les a mesurar)

Amb el rail nou (ja pujat):

| | posició |
|---|---|
| **carril** | **381..1524** (1143) |
| targeta 1 | 381..650 |
| targeta 2 | 672..941 |
| targeta 3 | 964..1233 |
| targeta 4 | 1255..1524 |
| gap | **22,2** |
| viewport | 946 d'alçada |

I el bloc de la TDP, avui:

| | valor |
|---|---|
| amplada | **1078,7** (hauria de ser **1143**) |
| posició | **126..1204** (hauria de ser **381..1524**) |
| marge esquerre | **−167,743 px** |
| baix | **797** (149 px del bottom; hauria de ser **50**, o sigui baixar **99 px**) |

### El que s'ha provat i NO ha funcionat (no hi tornis igual)

Tots aquests intents es van desfer; el codi és com a `a9d6696`:

1. **`margin: 0 auto`** → el bloc es col·locava a 413..1492 (centrat, però el
   carril és a 381..1524 i el rail comença a 381).
2. **Plantilla de tres columnes** (`269,3 · 560,4 · 269,3`) → el bloc feia 874 en
   comptes de 1143, i començava a 428.
3. **`margin: 0 0 0 ${(carrilAmplePx - tdpCols...)/2}`** → a 294 en comptes de
   381.
4. **Amplada `4 × ample + 3 × buit` amb `repeat(4, 269,3px)`** → el bloc surt bé
   de mida (1143) però se'n va a 294: **el marge esquerre no el col·loca a 381**.

**La pista que faltava:** el marge esquerre del bloc (`railGeo.marge`) és
**−167,743** a 1920 i ve d'una referència que no és la del carril. **Abans de
tocar la mida, esbrina a què és relatiu el marge** (quin és el `offsetParent` del
bloc i on cau la caixa del pare). Això és el que vaig deixar a mig fer.

**REGLA D'AQUESTA FEINA:** `PdpPage.jsx`, el rail (`TambeRail.jsx`) i el
megaslide **comparteixen `--hg-mega-w` i `--hg-mega-x`**. Tocar-ne un mou els
altres, i la franja del megaslide es desquadra (ja va passar: 7,5 px). Per això
**`npm run compara-vistes` s'ha de passar a cada pas**; és el que vigila la
franja.

## EL QUE JA ESTÀ FET I NO S'HA DE REFER (tota la sessió, pujat)

| commit | què |
|---|---|
| `eb9c4ff` | la col·lecció activa també va a la URL; el botó d'enrere ja no trenca el megaslide |
| `cf8fcd6` | el clic d'una col·lecció centra la franja; les samarretes inactives s'atenen (vel) |
| `c3b6f4d` | el «Carregant…» de les rutes ja no posa la pàgina en blanc |
| `f80707c` | la graella també queda centrada quan es remunta |
| `b6a5fe4` | el vel va amb el dibuix, no amb la casa |
| `20da21e` | el Terminator surt a la franja de THE HUMAN INSIDE |
| `c6e2ad4` | la llista dels dibuixos surt del registre, no d'una llista a mà |
| `c9d04a6` | els marcs de LFMD es pintaven 3 cops més grossos: faltava el calibratge |
| `d7b0af6` | la franja agrupada (4 sòlids + 4 marcs) i fora el puntet del coll |
| `b247dbc` | la pastilla grisa només la porta la col·lecció activa |
| `13da2a5` | la pastilla de l'activa, retallada 20 px per l'esquerra |
| `b2bc111` | el selector mostra **desactivades** les opcions que la col·lecció no té |
| `a9d6696` | els enllaços (engrunes) alineats amb el logo; **el rail omple el carril** |

### Les mides del rail, que són la referència

- **El rail**: 4 targetes de **269,3** amb el gap de **22,2** → **1143**, que és
  exactament el carril. El seu visor va de **381 a 1524**.
- Es fa amb el prop nou **`ompleCarril`** de `TambeRail.jsx` (sense el monyó del
  94 % de la pauta del lloc) i amb el marge intern del rail a 0.
- **Les engrunes**: `INICI` a **381** (idèntic al logo) i a **59** en Y, que és
  centrat entre el bottom del header (53) i el top de les targetes (95).

## TRAMPES JA TROBADES (no hi tornis a caure)

1. **El carril no està desviat pel scroll.** Jo ho vaig creure i vaig tocar
   `--hg-mega-x`; la franja es va desquadrar 7,5 px i `compara-vistes` ho va
   caçar. El carril es centra bé a l'espai de maquetació: **no el toquis**.
2. **El rail té 4 targetes visibles** dins del carril (i la resta fora). Les
   posicions de les targetes estan desplaçades pel carrusel: no et refiïs de
   comptar-les «a ull».
3. **Els enllaços i el rail comparteixen carril**: el canvi dels enllaços
   (`a9d6696`) va tocar el `paddingLeft` de 40 px i el `top`, i cap dels dos
   afecta la franja.
4. **Els guions temporals** (`scripts/_tmp-*.mjs`) no es comitegen mai. Els
   útils d'aquesta sessió: `_tmp-final-pdp.mjs` (carril, rail i bloc),
   `_tmp-compte-targetes.mjs` (quantes targetes cauen dins el carril),
   `_tmp-engrunes2.mjs` (els enllaços contra el logo), `_tmp-template.mjs` (la
   plantilla i l'amplada del bloc).

## LES REGLES DE LA CASA

- **Battery abans de comitejar**: `npx vitest run` (514) · `npx eslint` sobre els
  fitxers tocats (línies base: PdpPage 3 errors i 7 avisos, TambeRail 5 errors i
  2 avisos, FullWideSlideHeader 15/12, MegaStripePanel 4/11, CercadorTextRow 6
  avisos, firstContactPanels 3 avisos) · `npx vite build` · **`npm run
  compara-vistes`** (ha de dir **OK**) · `node scripts/mesura-formats.mjs` (ha de
  dir **0 i 0**).
- **Els guions temporals no es comitegen mai.**
- **Res de `push`** sense demanar-ho.
- El servidor del **3003 no es toca mai** (es recarrega amb F5).
- Es mesura **abans i després**, i cada número ha d'haver tingut un origen
  llegible.
- Tot en **català**, i en el to de la casa: **ras i curt**.
