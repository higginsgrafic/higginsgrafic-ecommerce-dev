# INFORME — pagina 1 i canvis de la pagina 2 (26/09/2026, vespre)

**Estat:** tota la llista de treball del bucle feta i verificada amb la mesura a
la ma. Arbre net, bateria sencera OK i tot pujat (`main`).

**Commits d'aquesta sessio** (tots amb `git push`):

| commit | que |
|---|---|
| `82bc5fd` | La llista de treball del bucle (VOLTA 0) |
| `731cf3d` | A1 — la columna de colleccions de la p2 es un sol selector |
| `8801ef2` | A2 — el bloc de fletxes perd el fons i els chevrons es centren |
| `dc59f7d` | A3 — la maniga de la franja per sobre del selector, amb ombra |
| `07336f5` | Quadern al dia (A1-A3) |
| `adda4c6` | B2 — la composicio de la pagina 1 |
| `bd992cd` | B4 — els numeros de la p1, declarats amb prova |
| `95d4712` | Quadern al dia (B1-B5) |

---

## 1. La pagina 2 (A1, A2 i A3)

### A1 · La columna de colleccions es un sol selector

**Causa.** La branca de la columna de `CercadorColleccionsColumna` pintava nou
botons independents (radi 3, `rowGap` 3 px) i el fons gris nome's el portava la
fila activa: la pastilla era una fila de 24,9 px.

**Que s'ha fet.** Un sol contenidor gris (`#F1F3F5`, radi 3) que fa tota la
columna, nou franges clicables a dins (una per franja, totes amb
`data-colleccions-targeta` perque `compara-vistes` continuï mesurant del top del
selector al bottom de la franja) i el nom de la colleccio activa en una capa
centrada (`pointerEvents: none`; el clic el rep la franja de sota).

| què (1920x946) | abans | despres |
|---|---|---|
| columna | 120,2 x 248,4 a x1403,8 | igual (la caixa no es mou) |
| pastilla | 120,2 x **24,9** | 120,2 x **248,4** |
| nom actiu | dins la fila 1 (y105,4) | **centrat** a la columna (y229,6) |
| clics | 9 botons | 9 franges (franja 9 → MISCEL·LÀNIA, franja 3 → PEMBERLEY) |

**DECISIO:** no s'ha tocat la taula de `caixes` (la vista vertical). L'amo parla
de la captura d'escriptori, i alla la columna es la de la filera.

### A2 · El fons de les fletxes i el centratge dels chevrons

**Causa.** `FirstContactDibuix09Buttons` portava `bg-muted`
(`rgb(249,250,251)` mesurat) i pintava els chevrons a 1/3 i 2/3, que era el
centre de la primera i de l'ultima cel·la d'un selector de TRES caselles. Amb la
forma vertical actual (DUES meitats), allo els deixava desviats cap al mig.

| què (bloc de la p2, 59,5x119) | abans | despres |
|---|---|---|
| fons del bloc | `rgb(249,250,251)` | `rgba(0,0,0,0)` |
| chevron de dalt (cy) | 145,1 (meitat 135,2) | **135,2** (desviament 9,9 → 0) |
| chevron de baix (cy) | 184,8 (meitat 194,7) | **194,7** (desviament −9,9 → 0) |

Tambe s'ha tret el fons de `FletxesQuadratPagina1` (la peça nova de la p1, que el
duplicava). **DECISIO:** el canvi es fa al component COMPARTIT perque l'amo ho va
demanar sense distingir pagines i la posicio 1/3-2/3 tambe era dolenta a la p1.

### A3 · La maniga per sobre del selector, amb ombra

**Causa.** Amb la columna convertida en una pastilla de tota l'amplada, la seva
vora esquerra cau a x1404 i l'ultima columna amb tinta de la franja es a x1405:
la maniga hi quedava a sota (la filera del cercador viu a zIndex 3 i la capa de
la franja a zIndex 1).

| què (1920x946) | abans | despres |
|---|---|---|
| z de la capa de la franja | 1 | **4** |
| banda de l'ombra | no hi era | x1401,8 y105,4 **5x248,4** |
| costura (x1402..1403, y250) | 255,255,255 | **247 / 239** (degradat) |

---

## 2. La pagina 1 (B1 a B5)

### B1 · El mapa, amb la mesura a la ma

`--hg-mega-w` **SI QUE RESOL** a tots els nodes provats (html, panell, filera,
graella, carrusel, selector): 1143 px. Tambe `--hg-escala-mega` (0,99185). O
sigui que el 1,89 px de l'intent anterior no era la variable: era el valor que
es passava a la graella (vegeu B2).

**Trampa de mesura:** la pagina 1 viu a `x = -1905` quan el megaslide es a la 2
(la tira de pagines fa `translateX(-25%)` amb `width: 400%`). Totes les
`getBoundingClientRect` de la p1 surten desplaçades una amplada de maquetacio i
s'han de normalitzar.

### B2 · La composicio muntada (`adda4c6`)

La filera de la p1 ja no fa servir `MegaColumn` (nome's es queda per a la vista
vertical): `GraellaDuesFileresPagina1` a l'esquerra i `BlocDretaPagina1` a la
dreta.

**DUES CAUSES trobades (eren el que encallava):**

1. A `GraellaDuesFileresPagina1`, `dibuixPx` era `carrilPx(45)`, que torna la
   CADENA `calc(45px * var(--hg-escala-mega, 1))`. `CercadorDibuixosGraella`
   calcula el pas i l'alcada amb aquest valor (`dibuixPx > 0`,
   `dibuixPx + gapH`): amb una cadena, `omple` era cert i el carrusel naixia amb
   amplada i alcada ZERO (`carrusel 1025,5x0`). **Cal passar-hi un NUMERO.**
2. `useEscalaFranjaCarril` triava la fletxa del carrusel amb
   `document.querySelectorAll` sobre TOT el document. Amb el bloc de fletxes nou,
   la p1 tambe te `#stripe-guide-right-arrow`; la franja de la p2 es pintava amb
   l'objectiu de la 1 (x negativa) i la seva filera queia a x−59 amb 1006 px en
   comptes de 202..807 (mesurat a 1024). Ara es tria la fletxa de la pagina
   VISIBLE, i `compara-vistes.mjs` fa el mateix.

| què (1920x946) | abans | despres | objectiu |
|---|---|---|---|
| graella esquerra | 415,3 | **381** | 381 (vora del carril) |
| bloc de la dreta vora dreta | 1489,7 | **1524** | 1524 (vora del carril) |
| gap graella-bloc | — | **10** | 10 px |
| alcada de la filera | (una fila) | **110** (selector + fletxes) | dues files de 55 |
| peca de la graella | (malla de 9) | **44,63** | 44,63 (com la p2) |
| franja (top) | 251,5 | **242,1** | 241,5 (p2) |

A 1440x800 i 2560x1306 l'esquema tambe quadra (gap de 7,5 i 13,3 px de disseny, i
la franja a 0,3 px de la de la p2).

### B3 i B5 · Les files i la pagina 2

- Les files de la p1 son les de la p2 perque **son la mateixa peça**
  (`CercadorDibuixosGraella` amb la peça de 45 unitats): mateixa mida, mateix
  ziga-zaga i mateixa relacio amb el selector. El selector de la p1 es quadrat i
  cau centrat entre les dues files.
- La pagina 2 no s'ha mogut: franja 241,5 / 353,8 i els centres de les files de
  dibuixos i de les cel·les del selector, els mateixos que a `HEAD`.

### B4 · Els numeros, declarats (`bd992cd`)

A `geometriaMegaslide.js`, amb cinc proves noves (581 al total):
`PAGINA1_COSTAT_PECA_PX` (45), `PAGINA1_GAP_DRETA_PX` (10),
`PAGINA1_MIDA_BLOC_DRETA_PX` (110), `PAGINA1_ALCADA_FILERA_PX` (110),
`PAGINA1_TOP_FILERA_PX` (13,8), `PAGINA1_AJUST_FRANJA_PX` (112,8) i les funcions
`pagina1BlocDretaPx`, `pagina1AmpladaGraellaPx` i `pagina1AlcadaFileraPx`.
`MegaStripePanelP1` ja no te cap numero magic d'aquesta composicio.

---

## 3. Les trampes (el que s'ha provat i no ha sortit)

1. **`carrilPx` no es un numero.** Ja esta explicat a B2: es la causa principal.
   Qualsevol geometria que es calculi amb ell (sumes, comparacions) dona zero o
   NaN.
2. **La pagina 1 viu desplaçada.** Sense normalitzar el `left` de la vista, les
   mesures de la p1 son 1905 px a l'esquerra.
3. **L'ombra de la maniga (A3).** La capa de la franja fa TOT el carril (1143) i
   el que es pinta (la tira) nome's 1048,8: la primera mesura de l'ombra va
   sortir a x376 i amb `top: 0` al capdamunt de la pagina. S'ha de mesurar sobre
   `[data-stripe-visual-content="2"]` i sobre el top de la columna.
4. **`useEscalaFranjaCarril` i `compara-vistes` triaven la fletxa de la pagina
   equivocada.** Es el que feia que la bateria digues «LES VISTES NO QUADREN» amb
   la franja de la p2 a x−59. Arreglat als dos llocs.
5. **Els numeros del prompt i els d'ara.** El pla diu que les files de la p2 son
   a 125,3 i 164,9; la mesura d'ara en fa 131,8 i 171,4 (i la de les cel·les
   135,2/174,2/213,2). Es el MATEIX estat (ho confirma `compara-vistes`): el pla
   cita una mesura d'un moment anterior. La relacio entre les dues coses (0,6 i
   0,0 px) es la que s'ha respectat.

---

## 4. El que queda obert (nomes un punt, i es una consequencia de les xifres)

El bloc de la dreta fa **110 + 110** px d'alcada (selector quadrat a dalt,
fletxes quadrades a sota) i acaba a **y317,9**; la franja comença a **y241,5**.
Les dues caixes es trepitgen 76 px en vertical, nome's en la cantonada inferior
esquerra del bloc: la tira de samarretes arriba a x1406,8 i el bloc comença a
x1414, o sigui que **el contingut visible del bloc queda lliure** i els dos
chevrons es veuen i es poden clicar (comprovat: clic a la fletxa dreta mou el
carrusel un pas, −22,5 px).

Es la consequencia directa de les tres coses que demana l'amo alhora (bloc
quadrat de 110+110 a la vora dreta del carril, franja a l'alcada de la de la p2, i
les dues peces a la filera). **Nomes caldria tocar-ho si a l'amo li molesta
veure-hi res**: les sortides serien fer el bloc mes baix (perdria la forma
quadrada) o baixar la franja (les dues pagines no quadraríen).

---

## 5. Que li toca a l'amo

1. **F5** a l'overlay del 3003 i mirar la **pagina 2** (els tres canvis: el
   selector de la columna, les fletxes sense fons i la maniga amb l'ombra) i la
   **pagina 1** (la graella de dues fileres a l'esquerra i el selector i les
   fletxes quadrades a la dreta).
2. **Decidir** si el punt 4 (la cantonada de la franja i del bloc) li molesta.

---

## 6. Els numeros de referencia (1920x946, carril x381..1524)

| què | pagina 1 | pagina 2 |
|---|---|---|
| graella / carrusel | x381..1404, peça 44,63 | x450,4..1383,8, peça 44,63 |
| selector | 109,4x109,4 a x1414 (quadrat) | 59,5x119 a x381 (rectangle) |
| bloc de fletxes | 109,4x109,4 a x1414 (quadrades) | 59,5x119 a x1324,3 (apilades) |
| gap graella-bloc | 10 | — |
| franja | x358 y242,1 1048,8x112,3 | x358 y241,5 1048,8x112,3 |
| columna de colleccions | — | x1403,8 y105,4 120,2x248,4 |

**Bateria final** (arbre net): `npx vitest run` 581 proves (45 fitxers) OK,
`npx eslint` als vuit fitxers tocats **5 errors i 16 avisos, tots de la linia
base de `HEAD`** (MegaStripePanelP1 3/0, MegaMenuPanel 2/0, CercadorTextRow 0/6,
firstContactPanels 0/3, MegaslidePagina2 0/7; `GraellaDuesFileresPagina1.jsx`,
`BlocDretaPagina1.jsx` i `geometriaMegaslide.js` nets), `npx vite build` OK,
`npm run compara-vistes` OK, `node scripts/mesura-formats.mjs` 0 i 0,
`node scripts/_tmp-errors2.mjs` cap error.
