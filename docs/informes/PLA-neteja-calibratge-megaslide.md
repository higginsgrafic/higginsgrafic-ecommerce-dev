# LLISTA DE TREBALL DEL BUCLE (26/09/2026, vespre)

Aixo es el **quadern de la feina** del bucle de la pagina 1 i dels tres canvis de
la pagina 2. Cada volta: es llegeix l'estat, es mesura, es fa UNA cosa, es torna
a mesurar, es passa la bateria i es comiteja amb el `git push`. Si el context es
talla, aquesta llista es el que queda.

**Numeros de referencia fixos** (1920x946, carril 1143 px, x381..1524):
graella de la p2: peca 44,63 px, fila de dalt al centre 125,3, fila de baix al
centre 164,9; selector p1 quadrat 108x108; bloc de fletxes p1 109x109.

---

## A. Pagina 2 (tres canvis de l'amo, un per commit)

| # | pas | fitxer | abans | despres |
|---|---|---|---|---|
| A1 | **La columna de colleccions es UN SOL selector**: una pastilla que ocupa tota la columna, amb el nom actiu a dins. Nomes a la vista d'escriptori (`caixes`), i mirar que la de la filera (`linia`) no es desquadri | `src/components/fullwide/CercadorTextRow.jsx` (`CercadorColleccionsColumna`, branca `caixes`, linies 986-1046) i us a `src/components/megaslide/MegaslidePagina2.jsx:1055` | 9 botons; pastilla grisa `#F1F3F5` NOMES a la fila activa; radi 3; `8.5pt`; `rowGap: 3px` | pastilla UNICA que ocupa tota la columna i el nom actiu dins; els altres noms sense pastilla propia |
| A2 | **El fons de les fletxes desapareix i les fletxes es centren al seu quadrat**: treure `bg-muted` del bloc i posar cada chevron al centre de la meitat que li toca (ara `top-1/3` i `top-2/3`) | `src/components/fullwide/firstContactPanels.jsx` (`FirstContactDibuix09Buttons`), bloc `#stripe-guide-right-anchor` | bloc amb `bg-muted`; chevrons a `left-1/2 top-1/3` i `top-2/3` (descol·locats) | bloc sense fons; chevron de dalt al centre de la meitat de dalt i el de baix al de la meitat de baix. **Compte: el mateix component el fa servir la p1 a la malla vella** (si es toca, les dues pagines han de quedar be; si cal, peça nova com `BlocDretaPagina1.jsx`) |
| A3 | **La maniga de la franja surt per sobre del selector amb una ombra**: el selector nou de la columna trepitja la maniga de la stripe; la maniga ha de quedar per sobre i una ombra ha de separar | `CercadorTextRow.jsx` (`CercadorColleccionsColumna`, ordre de capes) i la franja (`src/components/fullwide/MegaStripePanel.jsx`) | la maniga queda sota el selector; sense ombra | maniga per sobre; ombra entre les dues peces |

**Nota:** A1 i A3 toquen el MATEIX component (la columna); es fan en dos commits:
primer la pastilla unica (A1), despres les capes i l'ombra (A3).

## B. Pagina 1 (la composicio, com la de la pagina 2)

L'amo mana (26/09, 22:30): selector a la franja i a la dreta del carril; graella a
l'esquerra del carril; fletxes a la dreta; graella allargada fins a les fletxes
amb gap 10 px; graella intercalada de dues fileres que ocupi tota l'alcada de les
fletxes. I: «la graella intercalada ja la tens feta, nome's l'has de duplicar»,
«les files han de ser identiques».

Peçes noves ja fetes i pujades (`82c81b3`): `BlocDretaPagina1.jsx`
(`SelectorQuadratPagina1`, `FletxesQuadratPagina1`) i
`GraellaDuesFileresPagina1.jsx` (adaptador de `CercadorDibuixosGraella` amb
`reservaDreta: 0`). **Falta MUNTAR-HO** a `MegaStripePanelP1.jsx`.

**Xifres que han de quedar** (1920x946, carril x381..1524, 1143 px):

| peça | valor |
|---|---|
| graella: esquerra | x381 (la vora del carril) |
| bloc de la dreta: vora dreta | x1524 (la vora del carril) |
| gap graella-fletxes | 10 px |
| les files | **identiques a la p2**: peca 44,63 px; fila de dalt al centre de la cel·la BLANC (p2: 125,3) i fila de baix al de la COLOR (p2: 164,9); diferencia 0,6 / 0,0 px |
| bloc de la dreta | selector quadrat a dalt i fletxes quadrades a sota, tots dos de la mateixa amplada |

**Xifres d'abans** (1920x946, `node scripts/_tmp-p1-composicio.mjs`):

    selector  pastilla 108x108 a x416   (dins la primera columna)
    graella   x415 y65 1074x123         (nou columnes)
    fletxes   bloc 109x109 a x1435..1544
    franja    x358 y233 1049x112

### Els tres camins, per ordre

- **(a) Adaptar la malla de `MegaColumn`.** PROVAT I ENCALLAT (26/09 vespre): el
  bloc de la dreta sortia a x1557 en comptes de x1524 i la graella tornava a
  x415. Desfet.
- **(b) Una filera nova de trinca** a `MegaStripePanelP1` que no faci servir
  `MegaColumn` en absolut. PROVAT I ENCALLAT: `carrilPx(110)` dins d'aquella
  filera tornava **1,89 px** (`--hg-mega-w` no resol en aquell node de l'arbre) i
  el carrusel es pintava amb amplada i alcada ZERO (`graella y84 1072x0`, bloc
  1,9x3,8).
- **(c) DUPLICAR LA PAGINA 2 SENCERA** i substituir-hi nome's el que interessi.
  **Es el cami que ha donat l'amo i el mes segur** (la composicio de la p2 ja te
  les files a les posicions bones).

| # | pas | fitxer | que s'hi fa |
|---|---|---|---|
| B1 | **Mesurar primer** (abans de tocar res del cami c) `MegaStripePanelP1` i `MegaslidePagina2`: que cal treure i que cal deixar, i **si `--hg-mega-w` resol** a cada node | `scripts/_tmp-p1-composicio.mjs`, `_tmp-franja-2p.mjs`, `_tmp-files-2p.mjs` | taula de mesures: `getComputedStyle(el).getPropertyValue('--hg-mega-w')`, `getBoundingClientRect()` de dos o tres ancestres i `transform` de cadascun |
| B2 | **Muntar el cami (c)**: copiar el bloc de `MegaslidePagina2` dins de `MegaStripePanelP1` (o extreure'l a una peça compartida) i canviar-hi NOME'S: el selector de l'esquerra (rectangle) → el quadrat de la dreta (`SelectorQuadratPagina1`); les fletxes de l'esquerra → el bloc quadrat (`FletxesQuadratPagina1`); fora les colleccions i la tira de colors; la franja de la p1 (que ja esta muntada) → la seva; la columna de l'esquerra (el selector) → la vora esquerra del carril, on hi va la graella | `src/components/fullwide/MegaStripePanelP1.jsx` (+ `BlocDretaPagina1.jsx`, `GraellaDuesFileresPagina1.jsx`) | graella a x381, bloc de la dreta amb vora dreta a x1524, gap 10 px, files identiques a la p2 |
| B3 | **Comprovar les files**: peça 44,63; centres 125,3 i 164,9 (0,6/0,0 px de diferencia amb les cel·les BLANC/COLOR) | `scripts/_tmp-files-2p.mjs`, `_tmp-relacio-files.mjs` | taula p1 vs p2 |
| B4 | **Numeros nous com a funcions pures** amb prova i la mesura abans/despres al comentari | `src/components/megaslide/geometriaMegaslide.js` + `tests/unit/geometria-megaslide.test.js` | — |
| B5 | **Comprovar que la pagina 2 no s'ha mogut** | `npm run compara-vistes`, `scripts/_tmp-franja-2p.mjs` | p2 intacta (`26442f5`, `7e0a696`, `768fb0e`, `3885df4`) |

**Regla de desempat:** si una mesura no dona el que toca, es mesura el
contenidor ABANS de culpar el calcul: `--hg-mega-w`, `getBoundingClientRect()`
dels ancestres i `transform`. La meitat dels errors d'aquesta feina han estat
variables de carril que no resolen on es creu.

**Si (c) tambe s'encalla:** es desfa tot (`git checkout --`), s'apunta aqui la
xifra exacta de l'encallament i es passa a l'informe. **La sessio no s'atura.**

## C. Tancament

| # | pas | fitxer |
|---|---|---|
| C1 | Bateria sencera amb l'arbre net | `npx vitest run`, `npx eslint <tocats>`, `npx vite build`, `npm run compara-vistes` (OK), `node scripts/mesura-formats.mjs` (0 i 0), `node scripts/_tmp-errors2.mjs` (cap error) |
| C2 | Informe final | `docs/informes/INFORME-26-09-2026-pagina1.md` |
| C3 | `git push` | — |

## Linies base d'`eslint` (26/09/2026)

`MegaStripePanel.jsx` 4/11 · `FullWideSlideHeader.jsx` 15/12 · `TambeRail.jsx`
5/2 · `PdpPage.jsx` 3/7 · `MegaStripePanelP1.jsx` 3/0 ·
`firstContactPanels.jsx` 0/0. **Els fitxers nous han de quedar nets.**

## Diari del bucle

### VOLTA 0 — Llista de treball (feta)

- Llegits `COM-TREBALLO.md`, el pla sencer i `PROMPT-bucle-26-09-2026.md`.
- Estat: arbre net (nome's `_tmp-*` i `.freebuff/`, que no es comitegen).
- Escrita aquesta llista amb les xifres d'abans i les que hi han d'anar.
- **DECISIO:** el cami de la pagina 1 sera el **(c)** (duplicar la pagina 2
  sencera). No es tornara a provar (a) ni (b): tots dos estan provats i
  encallats, amb la xifra exacta apuntada.
- **DECISIO:** ordre: primer la pagina 2 (A1, A2, A3, canvis petits i
  independents) i despres la pagina 1 (B1-B5), perque la p2 es el punt estable i
  cada canvi seu es pot verificar sol amb `compara-vistes`.

*(Les voltes seguents s'apunta aqui: que s'ha fet, la mesura abans/despres, la
bateria i el commit.)*

### VOLTA 1 — A1 (feta, `731cf3d`)

La columna de colleccions de la p2 es **un sol selector**.

| què | abans | despres |
|---|---|---|
| columna | 120,2 x 248,4 a x1403,8 | igual (la caixa no es mou) |
| pastilla | 120,2 x 24,9 (nome's la fila activa) | 120,2 x **248,4** (tota la columna) |
| nom actiu | dins la fila 1 (y105,4) | **centrat** a la columna (y229,6) |
| clics | 9 botons | 9 franges clicables (franja 9 -> MISCEL·LÀNIA, franja 3 -> PEMBERLEY) |

Bateria: 576 proves, eslint 0 errors i 6 avisos (els de HEAD), build OK,
`compara-vistes` OK (enllacs 0,01/0,32 a la vertical, 0/0 a 1440),
`mesura-formats` 0 i 0, `_tmp-errors2` cap error.

**DECISIO A1:** no es canvia la taula de `caixes` (la vista vertical): l'amo
parla de la captura d'escriptori, i alla la columna es la de la filera
(`CercadorColleccionsColumna` sense `caixes`). Es conserven les nou franges
clicables perque `compara-vistes.mjs` segueix mesurant la columna del top del
selector al bottom de la franja (les marques `data-colleccions-targeta`).

### VOLTA 2 — A2 (feta, `8801ef2`)

El bloc de fletxes perd el fons i els chevrons cauen al centre de la seva meitat.

| què (bloc de la p2, 59,5x119) | abans | despres |
|---|---|---|
| fons del bloc | `rgb(249,250,251)` | `rgba(0,0,0,0)` |
| chevron de dalt (cy) | 145,1 (meitat 135,2) | **135,2** (desviament 9,9 -> 0) |
| chevron de baix (cy) | 184,8 (meitat 194,7) | **194,7** (desviament -9,9 -> 0) |
| icona | 20x20 | 20x20 |

Tambe s'ha tret el fons de `FletxesQuadratPagina1` (la peça nova de la p1, que el
duplicava). Bateria: 576 proves, eslint 0 errors i 3 avisos a
`firstContactPanels.jsx` (els mateixos que a HEAD) i net a
`BlocDretaPagina1.jsx`, build OK, `compara-vistes` OK, `mesura-formats` 0 i 0,
`_tmp-errors2` cap error.

**DECISIO A2:** el canvi es fa al component COMPARTIT perque l'amo ha dit «el
fons de les fletxes desapareix» sense distingir pagines, i la posicio 1/3-2/3 ja
era incorrecta tambe a la p1 (alla el bloc es quadrat i 1/3 i 2/3 tambe queden
desviats 9 px cap al mig). La peça nova de la p1 s'hi ha quadrat.

### VOLTA 3 — A3 (feta, `dc59f7d`)

La maniga de la franja passa per sobre del selector i una ombra els separa.

| què (1920x946) | abans | despres |
|---|---|---|
| z de la capa de la franja | 1 | **4** |
| banda de l'ombra | no hi era | x1401,8 y105,4 **5x248,4** |
| costura (x1402..1403, y250) | 255,255,255 | **247 / 239** (degradat) |
| vora dreta del contingut de franja | 1406,8 | 1406,8 (no es mou) |
| esquerra de la columna | 1403,8 | 1403,8 (no es mou) |

Bateria: 576 proves, eslint 0 errors i 13 avisos (els de HEAD: 6 + 7), build OK,
`compara-vistes` OK, `mesura-formats` 0 i 0, `_tmp-errors2` cap error.

**Nota (trampa apuntada):** la capa de la franja fa TOT el carril (1143) i el
que es pinta (la tira) nome's 1048,8: la primera mesura de l'ombra va sortir a
x376 (la vora de la capa) i amb `top: 0` al capdamunt de la pagina. S'ha de
mesurar sobre `[data-stripe-visual-content="2"]` i sobre el top de la columna.

### VOLTA 4 — B1 (feta)

Mapa de les dues composicions, amb els numeros del prompt verificats a 1920x946
(carril 1143, x381..1524):

| què | pagina 1 (abans) | pagina 2 (referencia) |
|---|---|---|
| graella | x415,3 y84,1 1074,4x122,6 (malla de 9) | carrusel x450,4 y109,7 933,4x95,2 |
| selector | 109,4x109,4 a x415,3 | 59,5x119 a x381 (rectangle) |
| fletxes | bloc 109,5x109,5 a x1380,3 | 59,5x119 a x1324,3 |
| franja | x358 y251,5 1048,8x112,3 | x358 y241,5 1048,8x112,3 |

**`--hg-mega-w` SI QUE RESOL** a tots els nodes provats (html, panell, filera,
graella, carrusel, selector): 1143 px. Tambe `--hg-escala-mega` (0,99185). O
sigui que el 1,89 px de l'intent anterior NO era la variable: era el valor que
es passava a la graella (vegeu la volta seguent).

**Trampa de mesura apuntada:** la pagina 1 viu a `x = -1905` quan el megaslide es
a la 2 (la tira de pagines fa `translateX(-25%)` amb `width: 400%`). Totes les
`getBoundingClientRect` de la p1 surten desplaçades una amplada de maquetacio i
s'han de normalitzar sumant-hi el `-left` de la seva vista.

### VOLTA 5 — B2 (feta, `adda4c6`)

La composicio de la pagina 1 muntada amb el cami (c). La filera ja no fa servir
`MegaColumn` (nome's queda per a la vista vertical): `GraellaDuesFileresPagina1`
(a l'esquerra) i `BlocDretaPagina1` (a la dreta).

**La causa de l'encallament anterior, trobada:** a `GraellaDuesFileresPagina1`
`dibuixPx` era `carrilPx(45)`, que torna la CADENA `calc(45px *
var(--hg-escala-mega, 1))`. `CercadorDibuixosGraella` calcula el pas i l'alcada
amb aquest valor (`dibuixPx > 0`, `dibuixPx + gapH`), i amb una cadena `omple`
era cert: el carrusel naixia amb amplada i alcada ZERO (`carrusel 1025,5x0`), i
el retall i la tira tambe. **El que cal passar es un NUMERO.**

**Segona causa, tambe resolta:** `useEscalaFranjaCarril` triava la fletxa del
carrusel amb `document.querySelectorAll` sobre TOT el document. Amb el bloc de
fletxes nou, la pagina 1 tambe te `#stripe-guide-right-arrow` i quedava l'ultima
de la llista: la franja de la PAGINA 2 es pintava amb l'objectiu de la 1 (x
negativa) i la seva filera queia a x-59 amb 1006 px en comptes de 202..807 a
1024. Ara es tria la fletxa de la pagina VISIBLE (la que te la vista dins la
finestra) i `compara-vistes.mjs` fa el mateix per mesurar-la.

Xifres (1920x946):

| què | abans | despres | objectiu |
|---|---|---|---|
| graella esquerra | 415,3 | **381** | 381 (vora del carril) |
| bloc de la dreta vora dreta | 1489,7 | **1524** | 1524 (vora del carril) |
| gap graella-bloc | — | **10** | 10 |
| alcada de la filera | (una fila) | **110 + 110** | selector + fletxes |
| peca de la graella | (malla de 9) | **44,63** | 44,63 (com la p2) |
| franja (top) | 251,5 | **242,1** | 241,5 (p2) |

A 1440x800 i 2560x1306 l'esquema tambe quadra (gap de 7,5 i 13,3 px de disseny, i
la franja a 0,3 px de la de la p2).

Bateria: 576 proves, eslint 0 errors nous, build OK, `compara-vistes` OK,
`mesura-formats` 0 i 0, `_tmp-errors2` cap error.

### VOLTA 6 — B4 (feta, `bd992cd`)

Els numeros de la composicio, declarats a `geometriaMegaslide.js` amb cinc
proves noves (581 al total): `PAGINA1_COSTAT_PECA_PX` (45),
`PAGINA1_GAP_DRETA_PX` (10), `PAGINA1_MIDA_BLOC_DRETA_PX` (110),
`PAGINA1_ALCADA_FILERA_PX` (110), `PAGINA1_TOP_FILERA_PX` (13,8),
`PAGINA1_AJUST_FRANJA_PX` (112,8), i les funcions `pagina1BlocDretaPx`,
`pagina1AmpladaGraellaPx` i `pagina1AlcadaFileraPx`.

### VOLTA 7 — B3 i B5 (fetes)

- **B3:** les files de la p1 son les de la p2 perque **son la mateixa peça**
  (`CercadorDibuixosGraella` amb `carrilPx(45)`): mateixa mida (44,63 px a
  1920), mateix ziga-zaga i mateixa relacio amb el selector. El selector de la
  p1 es quadrat i cau centrat al mig de la filera de dalt i la de baix.
- **B5:** la pagina 2 no s'ha mogut: franja 241,5 / 353,8 i els centres de les
  files de dibuixos i de les cel·les del selector, els mateixos que a `HEAD`
  (`compara-vistes` OK amb les tolerancies de sempre).

**Decisio de muntatge (i el seu limit mesurat):** el bloc de la dreta fa
`110 + 110` d'alcada (selector quadrat a dalt i fletxes quadrades a sota) i
acaba a y317,9; la franja comenca a y241,5. Les caixes es trepitgen 76 px en
vertical, **pero nome's en la seva cantonada inferior esquerra**: la tira de
samarretes nome's arriba a x1406,8 i el bloc comenca a x1414 (la seva vora dreta
es la del carril), o sigui que el contingut del bloc queda lliure. Comprovat
amb `_tmp-b2-clic4.mjs`: el clic a la fletxa dreta mou el carrusel de la p1 un
pas (−22,5 px). Es la consequencia de les xifres que ha demanat l'amo (bloc
quadrat de 110+110 a la vora dreta i franja a l'alcada de la de la p2) i s'apunta
a l'informe.

### VOLTA 8 — C (feta)

- Informe: `docs/informes/INFORME-26-09-2026-pagina1.md`.
- Bateria final amb l'arbre net: 581 proves (45 fitxers), eslint amb els
  MATEIXOS comptes que a HEAD als vuit fitxers tocats (5 errors i 16 avisos),
  `vite build` OK, `compara-vistes` OK, `mesura-formats` 0 i 0 i
  `_tmp-errors2` cap error.
- **Condicio de parada del bucle complerta.**



---

# PLA — neteja de l'estructura de calibratge del megaslide

**Data:** 26/09/2026 · **Branca:** `main` · **Pendent de pujar:** 17 commits

L'amo ho va demanar així: «Et proposo que netegis l'estructura i les relacions
entre elles.» Aquest document és l'inventari del que hi ha, els problemes que
he mesurat aquesta nit (cada un amb el seu símptoma i la seva xifra) i l'ordre
amb què proposo arreglar-ho. **No és un canvi encara**: és el mapa.

---

## 1. Inventari: qui mesura què, i qui ho fa servir

Tots els valors calibrats del megaslide, amb el seu productor, la seva font, els
seus disparadors i els seus consumidors. Tots viuen al mateix arbre de
components i cap no té un propietari únic.

| valor | qui el mesura | d'on surt | quan es mesura | qui el consumeix |
|---|---|---|---|---|
| `midesGraella` (`dibuix`, `gapH`, `gapV`) | `CercadorTextRow` | amplada del retall + `top` de la franja | layout + `ResizeObserver` + repàs 400 ms | mida de les peces, `alcadaFila`, alçada del retall |
| `desnivellsLinies` (`primera`, `segona`) | `CercadorTextRow` | centres de les 2 files vs cel·les BLANC/COLOR | `rAF` + 250/400 ms | `top` de cada fila de dibuixos |
| `desnivellColors` | `CercadorTextRow` | centre de la tira de colors vs cel·la NEGRE | `rAF` + 250/400 ms | `marginTop` de la tira de colors |
| `margeBaixFletxes` | `CercadorTextRow` | baix del selector − baix del retall | `rAF` + 250/400 ms | `bottom` del bloc de fletxes |
| `margesEnllacos` (`dalt`, `baix`) | `CercadorTextRow` | `top` de la filera/selector, `bottom` franja/filera | layout + 250/400 ms + RO de la franja | marges de la columna de col·leccions |
| `desplac` | `CercadorDibuixosGraella` | centre del grup actiu vs finestra | muntatge + canvi de col·lecció | `translateX` de la tira de dibuixos |
| `topVisualAlignmentY` | `MegaslidePagina2` | selector de la pàgina 1 vs el de la 2 | layout + `rAF` + 180/340 ms | `top` de la filera **i** `translateY` del selector |
| `selectorCentratgeY` | `MegaslidePagina2` | centre de la filera vs centre del selector | igual (mateix efecte) | `translateY` del selector |
| `pageLift` | `MegaStripePanelP1` | selector vs capdamunt del panell | layout + RO del panell | lift de la pàgina 1 **i** `visualOffsetY` de la franja |
| `factorCarrilFranja` / `centre` | `useEscalaFranjaCarril` | amplada de la filera vs carril | layout + RO + `MutationObserver` de l'estil | `transform: scale()` de la franja |
| `stripeStripOffset` | `MegaslidePagina2` | fletxes/rodeta/arrossegament | interacció | quin dibuix surt a cada casa |
| `--hg-mega-w`, `--hg-mega-x` | `FullWideSlideHeader` | model de layout | efecte del header | carril de tot (header, pàgines, franja, rail de la PDP) |
| `--megaStripeScale`, `--megaStripeDx/Dy` | HUD de calibratge | desat al navegador | muntatge | escala i desplaçament de la franja |

### Com es relacionen (això és el que està embolicat)

```
                    --hg-mega-w / --hg-escala-mega
                              │
        ┌─────────────────────┼──────────────────────────┐
        ▼                     ▼                          ▼
  midesGraella ──► alcadaCarrusel ──► alçada de la filera ──► margesEnllacos
        │                     │                                   ▲
        ▼                     ▼                                   │
  desnivellsLinies      (baix del retall) ──► margeBaixFletxes     │
        │                                          ▲              │
        ▼                                          │              │
   posició de les files                        selector ◄── selectorCentratgeY
                                                     ▲              ▲
                                                     │              │
                                              topVisualAlignmentY ──┘
                                                     ▲
                                                     │
                                     pageLift ──► visualOffsetY ──► franja
                                                     ▲              ▲
                                                     │              │
                                        factorCarrilFranja ─────────┘
```

Cada fletxa és una mesura que depèn d'una altra, i tres d'elles les mesura el
**fill abans que el pare** hagi aplicat la seva.

---

## 2. Problemes mesurats aquesta nit (cada un amb la seva xifra)

1. **Els efectes de layout dels fills corren abans que els del pare.** La
   graella mesurava amb la filera sense alinear i la franja sense assentar:
   el retall naixia a **71,9 px** i passava a **95,2**; la segona filera de
   dibuixos saltava 11 px i la tira de colors 23 px.
2. **Els acumuladors amb `ref` escrita dins del bucle compten dues vegades la
   mateixa correcció** quan dos passos cauen a la mateixa tasca (els
   temporitzadors expiren junts amb el fil ocupat): el bucle de les files
   acabava **3 de 6 obertures en fred a 13,6 i 15,9 px** de les seves cel·les.
3. **Els temporitzadors són el mecanisme d'assentament** (180, 250, 340 i
   400 ms, un joc per bucle): les correccions arriben amb el panell ja obert
   (la tira de colors saltava 19 px a 1920 i 37 px a 1512; el bloc de fletxes,
   20–42 px).
4. **Declarat contra mesurat.** La finestra de la graella es declara i les
   files es mesuren: **0,89 px de tinta tallada** a la fila de dalt. El pas
   vertical alineat es declarava només quan hi havia franja mesurada.
5. **Una geometria que depèn d'un recurs que arriba tard.** La filera de la
   franja fa l'amplada de la seva imatge, i fins que la imatge no arriba
   l'amplada és **zero**: l'escala no es podia calcular i la franja es pintava
   **1,58 cops** massa gran fins als ~300 ms, i s'enduia el seu baix i el marge
   de la columna de col·leccions.
6. **Els probes de posicions són cecs els primers ~400 ms** (el fil principal
   està muntant el panell). Tot el que passa «al principi» s'ha de mesurar amb
   una sonda DINS dels bucles; si no, es veu un sol estat i sembla que no es
   mogui res.

---

## 3. Cap a on hauria d'anar

Cinc regles, i res més:

1. **Declarar primer.** Tot el que es pot derivar de la composició (carril,
   mides de cel·la, passos, mides d'actius) es declara i **no es mesura**; la
   mesura només confirma. El carril declarat ja s'usa a la PDP i a l'escala de
   la franja.
2. **Una sola passada de mesura**, en un sol lloc, després del layout del
   panell i **abans del primer pintat**: tots els valors derivats de la
   MATEIXA instantània del DOM. Avui cada valor té el seu effect i el seu joc
   de timers.
3. **Un propietari per valor.** Cap valor escrit per dos bucles; el consumidor
   no remesura el que ja sap un altre.
4. **Idempotència.** Els acumuladors parteixen sempre del valor **pintat**, no
   del que s'ha decidit (ja fet a dos dels bucles).
5. **Un sol mecanisme d'assentament.** Una passada a `rAF` (abans del primer
   pintat) i **una** confirmació als ~400 ms per a tots els valors, en comptes
   de quatre jocs de temporitzadors. I els recursos que defineixen geometria
   (imatges de la franja) han de tenir mida declarada o estar decodificats
   abans del primer pintat.

---

## 4. Ordre proposat (cada pas amb la seva porta)

| # | pas | porta |
|---|---|---|
| 1 | **Fet** (`3e24b43`, `aec0074`, `0ea261d`): idempotència dels acumuladors i primera passada en `rAF` | les obertures donen un sol estat pintat |
| 2 | **Fet** (`262f79b`): mides dels actius per atribut i carril declarat a l'escala de la franja | la franja neix a la mida a les dues finestres |
| 3 | **Fet**: els tres bucles del **pare** (mides de la graella, marges de la columna, tira de colors) són una sola passada: un estat, una instantània, un `rAF`, una confirmació, un observador. Queden els **dos del fill** (les dues files i el bloc de fletxes) per al pas 4 | `compara-vistes` OK, 514 proves, un sol estat pintat a 4 finestres, 0,00 px de tinta |
| 4 | **Passar els dos bucles del fill a la mateixa passada**: `CercadorDibuixosGraella` deixa de mesurar (les dues files i el bloc de fletxes) i els valors li arriben per props; `MegaslidePagina2` reparteix la seva instantània | ídem + les 14 clics |
| 5 | **`pageLift` i l'escala de la franja**: declarar el que es pugui i deixar una sola mesura de confirmació | ídem + la franja a la vista vertical i apaïsada |
| 6 | **Esborrar els temporitzadors que quedin sense feina** i deixar documentat el sol repàs | bateria sencera |

Cada pas es fa amb la mesura al davant i es comiteja sol. Si un pas no millora
cap xifra, es descarta (com es va fer amb la convergència amb `flushSync`).

---

## 4 bis. Les mides manuals, i com treure-les (26/09/2026)

L'amo ho va dir: «Eliminar les mides manuals, també.» Inventari del que hi ha:

| què | quantes | on |
|---|---|---|
| desplaçament i escala de cada dibuix sobre la seva samarreta | **238 → 35 entrades** (fet el 26/09) | `STRIPE_DRAWING_CALIBRATIONS` (`stripeCalibrations.js`) |
| calibratge de la franja (dx, dy, escala) | 3 | `STRIPE_LAYOUT_DEFAULTS.stripe` |
| overlay de la samarreta (hero, fitxes) | 3 + 3 | `SHIRT_DRAWING_OVERLAY_DEFAULTS`, `STRIPE_DRAWING_OVERLAY_DEFAULTS` |
| passos de gap i marge de la vista vertical | 3 | `PASSOS_ESCALA_GAP_DIBUIX_VERTICAL`, `GAP_MOVIMENT_DIBUIX_VERTICAL` |
| ajustos als components | 1+ | `FRANJA_AJUST_PX`, marges de 10/20 px |
| valors desats al navegador (HUD) | ~30 claus | `useMegaStripeDebugState` → variables CSS |

### La prova que es poden declarar

Verificat avui contra les xifres mesurades a 1512×900 (DPR 2):

```
amplada de la filera de la franja, DECLARADA (altura × mides del fitxer): 852,05
amplada de la filera, MESURADA al DOM:                                    852
factor declarat (carril / amplada):                                       0,7580
factor que s'aplica de debò:                                              0,7929
```

Els dos darrers difereixen **només** pel calibratge manual desat al navegador
(`--megaStripeScale` = 1,159 en comptes del nominal 1,2125): 1,2125/1,159 =
1,046. O sigui que la geometria declarada ja quadra al centèsim i el que hi
sobra és el número calibrat a mà.

### Les substitucions concretes

1. **Les 244 entrades per dibuix → una regla**: el fitxer de la franja JA
   declara la seva graella de samarretes (`FRACCIO_COSSOS_FRANJA = 2740/2866` i
   `FRACCIO_MARGE_ESQUERRE_FRANJA = 65/2866`). La casa `i` de 14 comença a
   `marge + i × cos`, i el dibuix s'hi centra. És una funció de `i` i del carril,
   no 244 números.
2. ~~**L'escala de la franja → `carril / amplada declarada`**. Fora el factor
   manual.~~ **Fet a la pràctica, i no cal res**: mesurat el 26/09/2026 canviant
   `--megaStripeScale` a 0,9 (i al nominal):

   | valor de la variable | amplada de la franja | transform efectiva |
   |---|---|---|
   | el desat (1,2125) | 818,92 | 0,961333 |
   | el nominal (1,2125) | 818,92 | 0,961333 |
   | 0,9 | 818,92 | 0,961333 |

   El hook calcula el factor **contra** l'escala que la franja porta posada, o
   sigui que el producte és sempre `objectiu / amplada` i el valor manual es
   cancel·la exactament. La franja no en depèn. (Jo havia dit que hi havia un
   4,6 % de diferència: era una deducció meva, i la mesura la desmenteix.)
   La variable es queda perquè la vista vertical la fa servir per encongir la
   franja dues files (`1,17`), i allà el hook no hi actua.
3. **L'overlay de la samarreta → les mateixes fraccions del fitxer** (el pit de
   la samarreta és una zona coneguda de la imatge).
4. **Els ajustos de 10/20 px i `FRANJA_AJUST_PX` → a la taula declarada** de
   `geometriaMegaslide`, amb la prova unitària que els fixa.
5. **El HUD i les seves ~30 claus desades → fora del camí de la geometria**
   (pot quedar com a eina de diagnòstic, però que no publiqui variables que la
   composició consumeixi).

### Ordre

Cada substitució es fa **sola**, amb la mesura abans/després (`compara-vistes`,
els probes d'obertura i de càrrega, el comptador de textos/imatges) i amb el
vist-i-plau de l'amo sobre el resultat visual, perquè **treure un calibratge
canvia el que es veu avui** (en el cas de la franja, un 4,6 % de mida).

1. `geometriaMegaslide.js` amb els números declarats que ja quadren (carril, x,
   mides de la graella, amplada de la filera de la franja) + proves unitàries.
2. L'escala de la franja declarada (fora el factor manual).
3. ~~Les 244 entrades per dibuix → la regla de les fraccions.~~ **FET** (`0990d91`): 189 entrades de la banda fora del mapa, la regla declarada (`escalaDibuixFranja`, 80 unitats = 41 % del cos) i una prova que vigila que no hi tornin. Comprovat al navegador: `ncc-1701` 35,0 px (la regla) i `nx-01` 24,6 px (l'excepció, conservada).
4. Els ajustos de 10/20 px i `FRANJA_AJUST_PX`.
5. ~~El HUD fora del camí de la geometria.~~ **FET el 26/09** (la part que toca la composicio): l'override del HUD al `localStorage` (`MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC`) **nome's mana en desenvolupament**; en producció la composicio es sempre la del modul. El HUD es queda com a eina de taller.

## 5. Què NO es toca

- `--hg-mega-w` i `--hg-mega-x`: tocar-los desquadra la franja (mesurat).
- Les regles de la bateria (constitució).
- Els calibratges que l'amo ha validat (HUD, `stripeCalibrations`).
- El servidor de desenvolupament del port 3003.

## 6. La cadena vertical de la pàgina 2, mesurada (26/09/2026)

El que queda per declarar (les dues files, el centratge del selector, la tira de
colors, els marges i l'espai fins a la franja) depèn de la **mateixa referència
vertical**, i aquesta **creua les dues pàgines**. Mesurat relatiu al viewport de
la pàgina 2; l'alçada de la finestra no hi influeix (800, 946 i 1300 donen el
mateix):

| peça | 1920×946 | 1440×800 | 1512×900 | 2560×1306 | 1680×900 |
|---|---|---|---|---|---|
| contenidor de la filera (`top`) | −43,21 | −42,43 | −42,57 | −44,29 | −42,84 |
| filera (`data-p2-cercador-row`) | −3,20 | −2,42 | −2,56 | −4,28 | −2,83 |
| retall de la graella | −3,70 | −2,92 | −3,06 | −4,78 | −3,33 |
| contenidor del selector | 40,00 | 40,00 | 40,00 | 40,00 | 40,00 |
| pastilla del selector | 1,86 (119) | 1,34 (89,06) | 1,37 (93,59) | 2,44 (159) | 1,57 (104,06) |
| franja (`visual-content`) | 137,86 | 108,51 | 112,89 | 176,96 | 123,18 |
| **selector de la PÀGINA 1** | 56,78 | 47,58 | 48,96 | 69,04 | 52,18 |

D'on surt:

- El contenidor de la filera és `bar-top + topVisualAlignmentY + 20`; a 1920 val
  −43,21, o sigui **`topVisualAlignmentY` = −63,21**.
- La pastilla del selector cau **38,14 px** per sobre del seu contenidor (el
  `topVisualAlignmentY + selectorCentratgeY`); `selectorCentratgeY` = **17,03** a
  1920 (la diferència amb els 38,14 és el `mt-2` de 8 px de la pastilla).
- La referència de tot plegat és el **selector de la pàgina 1** (56,78), que
  `MegaslidePagina2` mesura i converteix en `topVisualAlignmentY` amb el bucle.
- I la franja depèn de `page1PageLift` i de `visualOffsetY`.

**El top de LAYOUT de la franja JA NO ES MESURA (26/09/2026).** No era una
alçada emergent del panell: és la reserva de la graella vella més el marge del
seu bloc. El que queda mesurat de la cadena vertical és **només la referència de
la pàgina 1 (`topVisualAlignmentY`)**, i de la franja se'n mesura només la seva
pròpia alçada (la tira escalada al carril: el que assegura el preescalfat abans
d'obrir el panell).

El sostre de la franja, declarat:

    top = 32 (el `py-8` del panell) + (carril − 8 × 12 × escala) / 9 + 13,96
          + translateY(−15 si no és banda estreta)
          + visualOffsetY

amb `alcadaReservaGraellaPanell`, `esBandaEstretaFranja` i
`visualOffsetYFranjaPagina2` a `geometriaMegaslide.js`. Comprovat contra el
`getBoundingClientRect()` de la franja a 1920, 2000, 1680, 1512, 1440, 1400,
2560, 1366×768, 1280×720, 1024×768 i 768×1024: 0,01 px als escriptoris i 0,3 px
a les tauletes.

Declarat fins ara (26/09/2026):

| valor | commit |
|---|---|
| l'amplada del retall de la graella | `5b51495` |
| l'alçada del selector i de les seves tres cel·les | `3c4a639` |
| el centratge del selector i `desplacTopSelector` | `bf5cb9d` |
| el desnivell de les dues files (`desnivellsLiniesGraella`) | `d476357` |
| la tira de colors (`desnivellColorsGraella`, `ampladaColumnaGraella`) | `2afe067` |
| el marge del bloc de fletxes (`margeBaixFletxesGraella`) | `ced00d6` |
| el `margeDalt` de la columna (`desplacTop − selectorCentratgeY`) | `0f153f1` |
| el `pageLift` de la pàgina 1 (`pageLiftPagina1`) | `f443066` |
| el coixi vertical del panell (`MARGE_DALT_BLOC_FRANJA_PX`) | aquest pas |
| el sostre de la franja (`topFranjaPagina2`, `alcadaReservaGraellaPanell`, `visualOffsetYFranjaPagina2`) | aquest pas |

Tots amb la prova unitària a `tests/unit/geometria-megaslide.test.js` i la
comprovació al navegador: el valor declarat coincideix amb el que s'aplicava,
amb diferències de 0,00-0,04 px (0,3 px a les tauletes, on l'escala del belt que
publica el CSS és 1 i la real és 0,998).

## 7. Què queda mesurat, amb xifres (26/09/2026)

Després dels passos 6 i 7 de la secció anterior, a la cadena vertical de la
pàgina 2 hi queden **dues mesures**, i cap de les dues és geometria de la
pàgina 2:

**1. `topVisualAlignmentY`: la referència de la pàgina 1.** És l'únic que el
bucle d'alineació segueix mesurant. El seu punt fix està comprovat i és exacte:

    top del selector de la pàgina 2 = top del selector de la pàgina 1
                                     + offset (10 a la banda estreta, 0 si no)
                                     + selectorCentratgeY (declarat)

Mesurat (el `selectorCentratgeY` aplicat, llegit del `translateY` de
l'embolcall del selector menys `topVisualAlignmentY`, contra el declarat):

| finestra | `selectorCentratgeY` aplicat = declarat |
|---|---|
| 1920×946 | 17,03 |
| 1440×800 | 15,76 |
| 1366×768 | −17,06 |
| 1280×720 | −17,83 |
| 1024×768 | −20,12 |
| 768×1024 | 5,62 |

(`midaSelector` és 120 als escriptoris i **112,8 a les tauletes**: la pastilla
també va escalada pel `scale(0,94)` del contenidor. Amb aquest valor, la
fórmula declarada dona exactament el número aplicat a totes sis finestres.)

El que falta per declarar `topVisualAlignmentY` és el **top del botó del
selector de la pàgina 1** (no el del seu contenidor, que ja és declarat):

- El contenidor del selector de la pàgina 1 cau a **39,52 px** del capdamunt
  del panell a TOTES les finestres: comprovat a 768×1024 (on `pageLift` = 0, i
  per tant es veu el valor natural): el contenidor hi és a 39,52 px =
  els 32 del `py-8` + els 8 del `mt-2` escalats pel `scale(0,94)` del
  contenidor de la graella (8 × 0,94 = 7,52).
- El botó («Color») cau **~1/3 de l'alçada de la pastilla** més avall del
  contenidor: 36,78 px amb una pastilla de 109,42 a 1920 (o sigui `h/3` + 0,31),
  27,58 de 81,84 a 1440, 25,20 de 74,67 a 1366×768 i 31,49 de 93,56 a
  768×1024 (i la pastilla és `aspect-[1/2] w-1/2`, o sigui geometria del
  MegaColumn de la pàgina 1: el que la secció 5 diu que no es toca).
- Amb això, `topVisualAlignmentY` val −63,21 / −62,43 / −64,29 / −62,57 /
  −62,84 / −62,37 a 1920×946 / 1440×800 / 2560×1306 / 1512×900 / 1680×900 /
  1400×900, −77,72 / −79,54 / −84,90 a 1366×768 / 1280×720 / 1024×768 i
  −46,91 a 768×1024.

**2. L'alçada de la franja.** El top de la franja és declarat (§6), però el seu
`bottom` no: la tira s'escala per encabir-se al carril
(`useEscalaFranjaCarril` mesura l'amplada natural de la filera) i aquesta
amplada depèn de les imatges. És exactament el que assegura el preescalfat
abans d'obrir el panell (les 128 imatges a memòria: mesurat amb
`scripts/_tmp-carrega-obert2.mjs`, opacitat 0 → 1 en una sola animació).
`margesEnllacos.baix` i `midesGraellaCompacta` (la deducció de l'alçada del
dibuix i de la seva separació, que depèn de `sostre − daltGraella`) en depenen
tots dos: el `sostre` ja és declarat, i `daltGraella` (el top del retall) penja
de `topVisualAlignmentY`, o sigui del punt 1.

La resta de mesures que queden al voltant del megaslide són fora de la cadena
vertical: `stripeRowPadXPx` (el coixi horitzontal del panell, que sí que és
responsiu: 40 px a l'escriptori i 24 a la tauleta vertical) i les mides
declarades que encara es confirmen al DOM amb un avís de desenvolupament
(`ampladaRetallGraella`).

## 8. Feina pendent (26/09/2026)

### 8.1 Arrossegar amb el dit la tira de colors i la franja — FET (`7e0a696`)

**Què demanava l'amo (26/09/2026):** «que tant la tira de colors 14x1 (selector
de colors) com la stripe es puguin moure amb el dit». Fet al commit `7e0a696`,
després de donar la pàgina 2 per bona:

- `src/hooks/useArrossegamentPas.js` (nou): un arrossegament horitzontal fa el
  mateix que la rodeta (un pas cada 30 px, cap a l'esquerra avança) i un toc
  segueix sent un clic (el punter només es captura passats 6 px).
- La franja (`MegaStripePanel`) i la tira de colors (`CercadorTextRow`) porten
  `touch-action: pan-y`: el gest horitzontal és nostre i el vertical segueix
  fent el desplaçament de la pàgina.
- Comprovat amb events de punter sintètics: 96 px de dit sobre la franja avancen
  la tira (la casa 0 passa de `dj-vader` a `nx-01`).

**Com està ara:**

- **La franja** (`MegaStripePanel`) només té la **rodeta**: el panell escolta
  `wheel` sobre la filera i en fa el pas (`onStripeStripWheel`, que ve de
  `MegaslidePagina2` i mou `stripeStripOffset`, el desplaçament de la tira de 64
  dibuixos). Amb el dit (touch) no fa res.
- **La tira de colors** (`CercadorColorsGrid`, dins `CercadorTextRow`) té la
  rodeta (`rodeta`, que passa a la barra del costat) i, a més, un **arrossegament
  que tria el color que hi ha sota el dit** (`onPointerDown/onPointerMove` →
  `triaAmbElDit`). O sigui que amb el dit canvia el color triat, però no
  «llisca» la tira.

**Què caldrà fer:** un gest d'arrossegar compartit (pointer events, que cobreixen
ratolí i touch) que faci el mateix que la rodeta: un pas per cada pas de dit, amb
un llindar per no confondre's amb un toc (que ha de seguir triant el color o el
dibuix) ni amb el desplaçament vertical de la pàgina; i, si l'amo vol que
«llisqui», el desplaçament continu de la tira de colors amb el dit. Caldrà
comprovar-ho amb `deviceScaleFactor` i `hasTouch` al Playwright (i amb
`_tmp-errors2.mjs`, que ja comprova que el clic segueix funcionant).

### 8.2 El que encara espera confirmació de l'amo

Els dos commits del vel (`3298b36`, el vel no taca mai una samarreta activa, i
`7c189ca`, el vel cau a sobre de les samarretes) van sortir de mesures, però
l'amo encara no els ha vist: si el vel continua fallant, cal saber **on** (quina
casa, quina vista) i **què** s'hi veu.

## 9. Punt de recuperacio: la pagina 2 es estable (26/09/2026)

L'amo ho va donar per bo («Punt de recuperació: Pàgina dos estable»). Aquest es
el punt on tornar si alguna cosa es desquadra:

- **`26442f5`** — la pagina 2 estable: el vel cau a sobre de les samarretes
  (`7c189ca`), no taca mai una samarreta activa (`3298b36`), la franja arrenca ja
  centrada i no gira en obrir (`e6c9806`), la porta d'obertura espera les
  imatges (`2c586cb`) i el megaslide es queda invisible fins que la composicio
  esta quadrada (`26442f5`).
- **`7e0a696`** — a sobre, el gest del dit (seccio 8.1). No toca cap geometria:
  nome's afegeix el gest i el `touch-action`.

Bateria del punt de recuperacio: 570 proves (45 fitxers), eslint amb els
mateixos comptes que la linia base a cada fitxer tocat, `vite build`,
`compara-vistes` OK, `mesura-formats` 0 i 0 i `_tmp-errors2` sense errors.

## 10. La composicio de la pagina 1, amb xifres (26/09/2026)

L'amo vol la pagina 1 com la pagina 2 (punt estable `26442f5`): el selector al
costat de la franja i quadrat, la graella enganxada a l'esquerra del carril i
estesa fins a les fletxes (amb el seu gap), les fletxes alineades amb el
selector, i la graella intercalada de dues fileres que ocupi tota l'alçada de
les fletxes.

Mesurat amb `scripts/_tmp-p1-composicio.mjs` (temporal) a 1920x946, carril
1143 px (x381..1524):

| peca | pagina 1 (ABANS) | pagina 2 (referencia) |
|---|---|---|
| selector | x416 y110 **53x36** (dins la primera columna de la graella) | x2287 y127 58x39 (a la vora esquerra del carril) |
| graella | x415 y65 **1074x123** (nou columnes) | x2355 y82 933x95 (dues fileres intercalades) |
| fletxes | x1435 y73 55x109 | x3229 y146 60x60 (una fletxa; el bloc en fa dues) |
| franja | x358 y233 1049x112 | x2263 y223 1049x112 |

D'on surt el que cal moure:

- la graella arrenca a **x415**, o sigui 34 px a la dreta de la vora del carril
  (x381): es el coixi de la capcalera (`carrilLane(40)`), i l'amo la vol
  enganxada a l'esquerra del carril;
- el selector es **la primera columna** de la malla de nou columnes
  (`[CONTROL_TILE_BN, ...dibuixos, ...coixins, CONTROL_TILE_ARROWS]`, a
  `MegaColumn`) i ha de sortir-ne cap a la franja;
- les fletxes son l'ultima columna de la mateixa malla, i per aixo la seva mida
  va lligada a la columna on cauen (55x109) en comptes de ser la del selector.

El primer pas sera treure el selector de la malla i declarar la resta de la
geometria (amplada de la graella, gap i alcada de les dues fileres) amb les
mesures de la pagina 2 com a referencia.

### 10.1 Les fletxes, amidades (26/09/2026)

Mesurat amb `scripts/_tmp-fletxes.mjs` (temporal) a 1920x946:

| | pagina 1 | pagina 2 |
|---|---|---|
| bloc de fletxes | 109x109 (quadrat) | 60x119 (1:2) |
| cada fletxa | 55x109 (les dues **de costat**) | 60x60 (les dues **de dalt a baix**) |
| la icona (svg) | 19x19 | 20x20 |

O sigui que les fletxes de la pagina 1 no son «minúscules» de mida: la icona fa
19 px contra 20 px de la pagina 2. El que passa es que el bloc de la pagina 1 es
**quadrat i les fletxes hi van de costat** (55 px d'ample cadascuna), i el de la
pagina 2 es **1:2 i les fletxes hi van apilades** (60 px d'ample cadascuna), que
es com es veuen mes grans.

Amb el selector ja quadrat (108x108, commit `97e2bd7`), el bloc de fletxes de la
pagina 1 (109x109) ja te la mateixa mida: el que queda del punt 3 es posar-lo on
toca (alineat amb el selector, a la vora dreta del carril) i, si l'amo ho vol,
apilar-hi les dues fletxes com a la pagina 2.

### 10.2 El lloc de la pagina 1, aclarit per l'amo (26/09/2026)

> «El selector i les fletxes han d'estar alineats a la dreta del carril.»

Correccio important del que jo havia suposat: a la pagina 2 el selector va a la
vora ESQUERRA del carril; a la pagina 1, l'amo el vol **a la dreta**, i les
fletxes tambe, alineades totes dues amb la vora dreta del carril (x1524 a
1920x946).

O sigui que la composicio de la pagina 1 queda:

    [ graella ............................................. ] [ selector ]
                                                              [ fletxes  ]
                        franja de samarretes (a sota, amplada del carril)

amb el selector i el bloc de fletxes a la dreta del carril i alineats entre
ells, i la graella estesa des de la vora esquerra del carril fins a ells (amb el
seu gap). El selector ja es quadrat (108x108, `97e2bd7`) i el bloc de fletxes
tambe (109x109), de manera que ja hi quadren.

### 10.3 Estat de la feina de la pagina 1 (26/09/2026, per continuar)

**Fet i pujat:**

- `97e2bd7` — el selector de la pagina 1 torna a ser quadrat (pastilla 108x108 a
  1920x946; abans 53x108).
- `6341498` — **les files de la pagina 1 cauen a les posicions de la pagina 2**
  (ho va demanar l'amo despres del rombe del vel). El bloc sencer de la pagina 1
  baixa 18,6 px a l'escriptori; a la banda estreta i a les tauletes ja hi cau
  sol. Vegeu la seccio 10.4.

**Objectiu d'aquesta feina (paraules de l'amo, seccio 10.2):** el selector i les
fletxes alineats a la **vora dreta del carril** (x1524 a 1920x946), la graella
estesa des de la vora esquerra (x381) fins a ells amb el seu gap, el selector al
costat de la franja inferior, i la graella convertida en **dues fileres
intercalades** (com la de la pagina 2) que ocupin tota l'alçada del bloc de
fletxes.

**Pendent (en ordre):**

1. Selector i bloc de fletxes a la vora dreta del carril, un a sota de l'altre;
   la graella de x381 fins a ells amb el gap de la pagina 2
   (`carrilPx(midaSelector/2)` + `carrilPx(10)`, vegeu `reservaDreta` a
   `CercadorTextRow.jsx`). El selector surt de la malla de nou columnes
   (`MegaColumn`, on es `CONTROL_TILE_BN`) i va al costat de la franja.
2. La graella de nou columnes passa a dues fileres intercalades com
   `CercadorDibuixosGraella` (pagina 2), ocupant tota l'alçada del bloc de
   fletxes.

**Xifres d'abans** (1920x946, carril 1143 px, x381..1524), amb
`node scripts/_tmp-p1-composicio.mjs`:

    selector  pastilla 108x108 a x416   (dins la primera columna)
    graella   x415 y65 1074x123         (nou columnes)
    fletxes   bloc 109x109 a x1435..1544
    franja    x358 y233 1049x112

**Criteris de verificacio:** el guio temporal de dalt per a les xifres, la
bateria sencera (`npx vitest run`, `npx eslint` als fitxers tocats,
`npx vite build`, `npm run compara-vistes` OK, `node scripts/mesura-formats.mjs`
0 i 0, `node scripts/_tmp-errors2.mjs` "cap error"), i la pagina 2 intacta
(punt de recuperacio `26442f5`).

### 10.4 El bloc de la pagina 1, quadrat amb el de la pagina 2 (26/09/2026)

Ho va demanar l'amo despres de veure el rombe del vel: «alinea les files de la
pagina 1 a les mateixes posicions que la pagina 2». Entre les opcions que li
vaig donar (amb xifres) va triar **baixar tot el bloc** (selector i files junts).

`6341498`. Mesurat a 1920x946:

| peça (centre) | abans | despres | pagina 2 |
|---|---|---|---|
| selector | 127,7 | **146,3** | 146,3 (p1 x416 · p2 x2287; la regla propia de la p2 hi afegeix 5 px) |
| primera fila de dibuixos | 127,7 | **146,3** | 146,3 |
| bloc de fletxes | 127,7 | **146,3** | 164,9 |
| franja (top) | 232,9 | 251,5 | 241,5 (els 10 px de sempre) |

Als escriptoris (1920, 1440 i 2560) el bloc de la p1 anava **18,6 px per
sobre**; a la banda estreta i a les tauletes ja hi cau sol (1366x768: 118,9
contra 118,2; 1024x768: 108,2 contra 108,0). Per aixo l'ajust nome's s'aplica a
l'escriptori: `AJUST_FILES_PAGINA1_PX` i `esEscriptoriPagina1`
(`geometriaMegaslide.js`, amb prova). El bloc el mou el `pageLift` de sempre,
que ara rep la finestra (`MegaStripePanelP1`).

La franja de la pagina 1 baixa amb el bloc, pero el panell tambe es fa 18,6 px
mes curt (la seva alcada surt del bottom de la franja), i per aixo la franja
torna a quedar on era: els dos sostres (232,9 i 222,9) no es mouen. Les proves
de `visualOffsetYFranjaPagina2` i `topFranjaPagina2` nome's canvien a
l'escriptori.


### 10.5 La graella de la pagina 1, com la de la 2 (26/09/2026, pas seguent)

**Fet i pujat:**

- `3885df4` — el selector de la pagina 1 es quadrat i el de la 2 rectangle. El
  bloc de BLANC/COLOR/NEGRE es compartit (`FirstContactDibuix00Buttons`) i el
  `97e2bd7` li havia canviat la forma a tot arreu; ara la tria qui el posa amb
  `format` (`quadrat` per defecte, `rectangle` a `MegaslidePagina2`).

**Mesurat a 1920x946** (amb `node scripts/_tmp-files-2p.mjs`, temporal):

| què (centre y) | pagina 1 | pagina 2 |
|---|---|---|
| fila de dibuixos de dalt | 146,3 (una sola fila) | **125,3** (peca 44,6) |
| fila de dibuixos de baix | — | **164,9** (peca 44,6) |
| cel·la BLANC | 110,5 | 125,9 |
| cel·la COLOR | 146,3 | 164,9 |
| cel·la NEGRE | 182,1 | 203,9 |

O sigui: la graella de la p1 ha de passar a **dues fileres intercalades amb la
peca de 44,6 px i els centres a 125,3 i 164,9**, i el selector de la p1 ja hi
cau (146,3).

**La recepta (una cosa per commit):**

1. **La graella de dues fileres.** Reutilitzar el que ja fa
   `CercadorDibuixosGraella` amb `carrusel` (la tira amb `left = i * pas / 2` i
   les peces senars una fila avall), pero amb la mida de la peca FIXA (44,6 a
   1920 = `carrilPx(45)`), no deduida de l'amplada del retall: a la p1 el
   carril es 1143 i a la p2 la columna es 933, i amb la mida deduida les peces
   de la p1 sortirien un 20 % mes grosses. El `top` de la finestra surt de
   `carrilLane(40)` + `alcadaCarrusel/2 - peca/2`.
2. **La graella de x381 fins al bloc de la dreta** (punt 1 de la seccio 10.3) i
   **el selector fora de la malla**: avui el selector es la primera columna
   (`CONTROL_TILE_BN`) i les fletxes l'ultima (`CONTROL_TILE_ARROWS`) de la
   malla de nou columnes (`MegaColumn`); han de sortir-ne i anar a la vora dreta
   del carril, un a sota de l'altre (seccio 10.2).
3. L'alcada de la graella ha de ser la del bloc de fletxes (punt 5 de la
   seccio 10.3), que amb el selector quadrat de 109,4 vol dir dues files de
   ~54,7; aixo i el punt 1 s'han de quadrar junts.

**Criteris:** el guio temporal de dalt per a les xifres i la bateria sencera
(seccio 10.3). La pagina 2 no s'hi ha de moure.

**Intent del 26/09/2026 al vespre (desfet, i per que).** Vaig provar de fer els
punts 1, 2 i 3 de cop: treure el selector i les fletxes de la malla (una prop
`selectorDreta` a `MegaColumn`, amb el bloc del selector i el de les fletxes com
a variables per pintar-los a la columna de la dreta) i moure la graella. La
peca de dalt es pot reaprofitar (les dues variables i la prop), pero el
POSICIONAMENT no va quadrar i ho vaig desfer (`git checkout`): el bloc de la
dreta sortia 33-49 px mes a la dreta del carril (x1557 en comptes de x1524) i la
graella tornava a x415 en comptes de x381.

El que hi ha darrere, mesurat, perque el seguent que ho provi no hi torni a
caure:

- **La graella va escalada al 94 % amb l'origen al centre** (`MegaStripePanelP1`,
  `scale(var(--hgGridFitScale))`): el contingut fa el carril (1143 unitats) i es
  pinta de x381 a x1455. El bloc de la dreta (103 px) **no hi cap** a x1524 si
  primer no s'estreny la graella: perque la seva vora dreta hi caigui, la malla
  ha d'acabar a `1455` i el bloc anar-hi a sobre, o be la malla ha de fer
  `carril - (bloc + gap)` amb l'origen a l'esquerra (i alla l'esquerra se'n va a
  x381 nome's si l'origen es `top left`).
- **`tileSizeRef`** (la mesura del tile) va lligada a la SEGONA cel·la de la
  malla (`ref={idx === 1 ? tileSizeRef : undefined}`): si el selector surt de la
  malla, la mesura del tile canvia de significat i totes les mides que en pengen
  (les fletxes, el selector, la reserva de la franja) es mouen.
- **Les fletxes** (`FirstContactDibuix09Buttons`) fan la mida de la seva columna
  (`aspect-square w-full`): per tenir-les quadrades (109x109) nome's cal que la
  columna faci 109, i aixo ho ha de decidir la filera, no la malla.

**Recepta que hi encaixa** (per al proper intent, i es pot fer per commit):

1. La filera es un contenidor `relative` que fa el carril dins la pantalla, amb
   `transform: scale(0.94)` i `transformOrigin: 'top left'` (perque l'esquerra
   caigui a x381). Dins seu: una malla de VUIT columnes de dibuixos que ocupa
   `carril - (MIDA_BLOC_DRETA + GAP)` i el bloc de la dreta a l'extrem.
2. Amb aixo el bloc de la dreta surt quadrat (109) i la seva vora dreta es la
   del carril; la graella arrenca a x381 i acaba on comença el bloc.
3. Les fletxes, dins del bloc, quadrades (109x109) i a sota del selector.

**Canvi de cami (26/09/2026, 22:30).** L'amo ho ha aclarit: «No has de convertir
la graella de 9 en una altra graella. L'has de substituir. Si fa falta fes un
selector nou» i «la graella intercalada ja la tens feta. Nome's l'has de
duplicar», i encara «si a la pagina 2 hi cap, tambe hi ha de cabre a la pagina
1, ja que les files han de ser identiques». O sigui: **les files de la p1 son
les de la p2, tal qual** (mateixa peca, 44,63 px, i mateixa relacio amb el
selector: la fila de dalt al centre de la cel·la BLANC i la de baix al de la
COLOR, mesurat a la p2: 0,6 i 0,0 px).

Peçes noves ja fetes i pujades (`82c81b3`), d'us nome's de la p1:

- `BlocDretaPagina1.jsx` — `SelectorQuadratPagina1` i `FletxesQuadratPagina1`.
- `GraellaDuesFileresPagina1.jsx` — l'adaptador que duplica
  `CercadorDibuixosGraella` (la de la p2) amb `reservaDreta: 0`.

**On es va encallar el muntatge (i la pista bona).** En posar-ho a
`MegaStripePanelP1` (una filera `flex` amb la graella a l'esquerra i el bloc a
la dreta, i `MegaColumn` nome's a la vista vertical), el carrusel es pinta amb
**amplada i alcada ZERO** (`graella y84 1072x0`, i el bloc de la dreta 1,9x3,8
px). La mesura dels estils ho diu: `carrilPx()` dins d'aquesta filera torna
**1,89 px** per `MIDA_BLOC_DRETA_PAGINA1_PX = 110`, o sigui que la variable
`--hg-mega-w` NO resol en aquest punt de l'arbre (el contenidor de la filera
porta `scale(var(--hgGridFitScale))` i les mides de la casa viuen a
`layoutMetrics`). **El proper intent ha de mesurar `--hg-mega-w` en aquest node
abans de calcular-hi res**, i si no hi es, passar l'escala del carril com a prop
(o fer servir les mateixes proporcions que la p2, que alla si que resolen).

#### 10.3.1 Recepta per fer-ho (pels llocs exactes)

1. **Treure el selector de la malla.** A `src/components/fullwide/MegaColumn.jsx`
   la filera es construeix amb `columnItems` / el `grid-cols-9` del JSX, i el
   selector hi entra com `CONTROL_TILE_BN` (la primera columna) i les fletxes com
   `CONTROL_TILE_ARROWS` (l'ultima). Cal deixar la malla nome's per als dibuixos
   i treure'n el selector.
2. **Posar el selector a la dreta del carril**, al costat de la franja. El lloc
   natural es `src/components/fullwide/MegaStripePanelP1.jsx` (que es qui te la
   franja i el bloc del panell de la pagina 1), dins el mateix contenidor de
   l'amplada del carril. La pastilla es `data-stripe-buttonbar="bn"` de
   `src/components/fullwide/firstContactPanels.jsx` (ja quadrada des de
   `97e2bd7`, 108x108 a 1920x946) i es qui rep els clics.
3. **Alinear-hi les fletxes**: el bloc de fletxes (`CONTROL_TILE_ARROWS`, que es
   pinta amb la botonera) ha de quedar sota el selector, amb la vora dreta a
   x1524 a 1920x946 i la mateixa amplada (109x109 ara).
4. **Estirar la graella**: de la vora esquerra del carril (x381) fins al bloc de
   la dreta, amb el gap de la pagina 2: `carrilPx(midaSelector/2) + carrilPx(10)`
   (vegeu `reservaDreta` a `src/components/fullwide/CercadorTextRow.jsx`).
5. **Dues fileres intercalades** (el pas seguent): la graella de nou columnes
   passa a la de `CercadorDibuixosGraella` de la pagina 2 — dues files de peces
   grans amb la de baix desplacada, la finestra `alcadaCarrusel` i el desnivell
   declarat a `desnivellsLiniesGraella`; l'alcada ha de ser la del bloc de
   fletxes.
6. **Numeros nous**: tots a `src/components/megaslide/geometriaMegaslide.js` com
   a funcions pures amb prova a `tests/unit/geometria-megaslide.test.js` i la
   mesura abans/despres al comentari, com la resta d'aquesta feina.

### VOLTA 9 — Les correccions de l'amo despres de veure-ho (feta, `11ba303`)

1. **La columna de colleccions, com la captura de les 22:16.** La primera
   versio d'A1 entenia «un sol selector» com una sola pastilla amb nome's el nom
   actiu; la captura diu que la llista sencera es veu i que l'actiu es destaca
   amb una caixa blanca. Ara es aixi, amb l'estil EXACTE del selector: radi
   exterior 11, caixa interior amb radi 6 (11 - 5 d'offset) i 5 px de coixi per
   cada costat, text `font-oswald` de 13,89 px (el mateix que BLANC/COLOR/NEGRE)
   enrasat a la dreta.
2. **Gap de 10 px amb les fletxes:** 20 -> 10 px. La columna passa de 120,2 a
   128,7 px i la seva vora esquerra de x1403,8 a x1395,3
   (`GRAELLA_COLUMNA_DRETA_CARRIL_PX` 142 -> 152, `GRAELLA_GAP_COLUMNES_PX`
   20 -> 6,5). El retall de la graella creix els mateixos px (933,4 -> 939,4) i
   les proves d'`ampladaRetallGraella` i `desnivellColorsGraella` s'han
   actualitzat amb les mides noves.
3. **La rodeta de la graella de la p1:** no funcionava perque
   `CercadorDibuixosGraella` enganxava el gest al `graellaRef` de la filera de
   la p2, i la graella de la p1 no en tenia cap. Ara se'n fa un de propi.
4. **El cadenat:** no apareixia mai als tres bucles de `FullWideSlideHeader` que
   pengen del panell, perque el panell es munta DESPRES del clic (precarrega
   d'imatges) i els bucles nome's depenien d'`active`. Ara el `ref` del panell
   es un callback que marca l'estat `panellMuntat`. Mesurat: surt als 507 ms.

Bateria: 581 proves (45 fitxers), eslint amb els comptes de HEAD,
`vite build` OK, `compara-vistes` OK, `mesura-formats` 0 i 0, `_tmp-errors2`
cap error.
