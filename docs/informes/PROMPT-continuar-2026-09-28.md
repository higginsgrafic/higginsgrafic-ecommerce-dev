# PROMPT PER CONTINUAR — 28/09/2026 (megaslide: la graella de la p1 i la p2)

> Per a la propera sessió. Tot el d'aquest document està **commitejat i pujat**
> (`main` a `1304f8a`), l'arbre net, i la bateria sencera en verd.

## Com treballem (acordat amb en Marc el 28/09)

- **Una cosa per commit**, i **la bateria al final**: mentre s'itera un disseny,
  només canvis i una passada ràpida d'errors de consola; quan en Marc diu «ja
  està», es llancen TOTES les bateries.
- **Commit i push, sempre** (28/09/2026, ho va aclarir en Marc): es pot
  committejar i pujar en qualsevol moment, sense esperar el «ja està» ni la
  bateria. El que **no** es fa mai és desplegar (constitució, regla 1).
- La bateria completa, en aquest ordre:
  1. `npx vitest run` → **595 proves / 46 fitxers**
  2. `npx eslint <fitxers tocats>` → els comptes han de ser els de `HEAD`
     (baselines d'avui: `CercadorTextRow.jsx` **0/9**, `MegaStripePanelP1.jsx`
     **3/3**, `MegaStripePanel1.jsx` 4/10, `MegaslidePagina2.jsx` 0/7, els altres
     nets)
  3. `npx vite build`
  4. `npm run compara-vistes` → ha de dir **OK**
  5. `node scripts/mesura-formats.mjs` → **0 i 0**
  6. `node scripts/_tmp-errors2.mjs` → **cap error**
  7. `node scripts/_tmp-ancoratge.mjs` → **TOT AL SEU LLOC** (si el canvi mou
     peces de debò, s'actualitzen les referències del mateix script i s'explica
     al commit)
- El servidor de desenvolupament és a **`http://127.0.0.1:3003`** i **no es
  reinicia ni se n'aixeca cap altre**.
- En Marc és a **Firefox** en un iMac Intel; les eines de mesura van amb
  Chromium/Playwright. Les captures que faig són a `_tmp-*.png` (no es commitegen).

## L'ESTAT (1920 × 946, `_tmp-ancoratge.mjs`)

| peça | valor |
|---|---|
| carril | 381 .. 1524 |
| p1 graella (caixa) | **392,83 · 993,3 × 134** (la ratlla de 1 px + 10 px de coixí a l'esquerra) |
| p1 files de dibuixos | filera 1 **93 .. 144**, filera 2 **150 .. 201** (grup 93..201, centre **147** = casella COLOR) |
| p1 bloc de la dreta | 1395,3 · **128,7 × 256,6** (dues botoneres de 128,7 × 128,3: el selector a dalt i les fletxes a sota) |
| p1 franja | 357,9 · **226,6** (no es mou mai) |
| p2 selector / columna | 381 / 1395,3 · **88** dalt (aire de **30** des del header) |
| p2 graella | 450,4 · 83 · 939,4 × 95,2 |
| p2 dibuixos / gap | **42,39** / **54** (el mateix gap que la p1) |

Constants que governen la graella de la p1 (`GraellaDuesFileresPagina1.jsx`):
`COSTAT_PECA_PAGINA1_PX = 51,3` · `GAP_PECA_PAGINA1_PX = 54` ·
`GAP_FILES_PAGINA1_PX = 20` · `DESPLACAMENT_TOP_FILERA_PX = -16` (les files es
mouen, **no** el contenidor) · i a `CercadorTextRow.jsx`,
`DESPLACAMENT_FILES_P1_PX = -16`. L'alçada de la caixa és
`PAGINA1_ALCADA_FILERA_PX = 134` (`geometriaMegaslide.js`), i
`PAGINA1_AMPLADA_BLOC_DRETA_PX = 128,7`.

**Regla d'or apresa avui**: el centratge de les files es fa movent **les peces**.
Moure la **caixa** de la graella desquadra tres coses alhora: el clic de la p1
(la caixa n'és l'àncora), el bucle d'alineació de la p2 (li pren els 30 px d'aire)
i les caselles del vel de la franja de la p2.

## EL QUE FALTA (el que va quedar pendent)

### 1. El clic de la graella de la p1 (el més important)

En Marc: «Cap clic va al seu lloc. Quan cliques un dibuix d'Austen, activa totes
les col·leccions d'Austen.»

- **La subcol·lecció es descarta.** El clic crida
  `onSelectGroup(collection, subcollection, stripeItem)` i el receptor de la p1
  (`MegaStripePanelP1.jsx`, dins del `GraellaDuesFileresPagina1`) només fa servir
  `collection` i `stripeItem`. Austen té quatre subcol·leccions (PEMBERLEY HOUSE,
  KEEP CALM, QUOTES, CROSSWORDS) i a la p1 no hi ha cap estat equivalent al
  `austenSubcollection` de la p2, o sigui que queden totes engegades alhora.
  **Fer**: afegir l'estat de subcol·lecció a la p1 (com la p2), passar-lo a la
  graella (`activeSubcollection`) i desar-lo al clic.
- **«Cap clic va al seu lloc»**: cada casella passa `stripeItem: STRIPE_MAP[label]`
  (`CercadorTextRow.jsx`, línies ~344 i ~1735, amb el mapa cap a la ~70). Si un
  dibuix no té entrada al mapa, `stripeItem` és `undefined` i el clic no tria res.
  **Fer**: comprovar la cobertura de `STRIPE_MAP` dibuix per dibuix (les 64
  caselles de `dibuixosGraella16x4()`) i omplir les que faltin.

Comportament que es vol: el clic **tria el dibuix** (amb la seva col·lecció i
subcol·lecció, de manera que la graella i la franja l'ensenyin) i **no obre la
fitxa del producte**; la PDP s'obre des de les samarretes de la franja (com a la
p2). Estat actual del codi: ja no obre la PDP i ja torna a canviar la col·lecció,
però falta la subcol·lecció i el mapa.

### 2. La tauleta vertical

En Marc va veure canvis a la **tauleta vertical** i vam quedar de mirar-ho
després. Sospita: els canvis d'avui (`DIBUIX_PX` 30 → 28,5 i `DIBUIX_GAP_H` 36 a
`midesGraella.js`) són valors **base compartits**: `midaDibuix()` i
`gapHorizontal()` tenen branques per a `isPortraitTablet` i `isLandscapeTablet`,
però `DIBUIX_GAP_V` (el pas vertical) sí que es va quedar tocat, i el gap del
carrusel de la p2 a l'escriptori es força a 54 dins `CercadorTextRow.jsx`
(`(!isPortraitTablet && !isLandscapeTablet) ? 54 : ...`). **Fer**: passar
`npm run compara-vistes` i `mesura-formats` mirant les files de tauleta vertical
(768×1024) i apaisada (1024×768, 1366×768) i comparar amb `HEAD~` si cal.

### 3. Coses petites, quan hi hagi estona

- **La punta de la màniga** de la franja: el fitxer de la franja fa 2866 px i la
  tinta arriba a 2865, o sigui que es perden 1-2 px a la vora dreta. Cal un export
  una mica més ample de l'artista (afecta les dues pàgines).
- **Els 11 px de la cintura**: es va demanar «11 px entre la cintura de l'última
  samarreta i el costat del bloc» i després es va revertir; la caixa del bloc de
  la p1 queda a 128,7 px (lateral esquerre a 1395,3, com la columna de la p2). Si
  es vol el criteri dels 11 px, és `PAGINA1_AMPLADA_BLOC_DRETA_PX`.
- **Les guies**: apagar-les des de la URL (`?belt2=0`, `?carril=0`) ara es desa
  (`useDebugToggles`); les eines que les encenen no. A l'eina de formats
  (`public/browser-overlay.html`) les guies del carril s'encenen a propòsit.

## EINES ÚTILS (a `scripts/`, alguns són temporals i no es commitegen)

- `_tmp-ancoratge.mjs` (commitejat): les 9 peces clau de les dues pàgines contra
  les referències. És el primer que es passa abans i després de cada canvi.
- `_tmp-y.mjs` / `_tmp-color.mjs`: on cauen les dues fileres de la p1 i on és el
  centre de la casella COLOR.
- `_tmp-gap2.mjs`: mida del dibuix i gap de les graelles de la p1 i la p2.
- `_tmp-grid-shot.mjs` / `_tmp-b1-final.mjs`: captures de la graella i del bloc.
- `_tmp-err-ara.mjs`: obertura ràpida i errors de consola.
- `_tmp-vel-p2.mjs`: el vel de la franja de la p2 (imatge i màscares).
- `_tmp-blocs2.mjs` / `_tmp-piles.mjs`: caixes i apilats (z-index) dels blocs.

## ELS COMMITS D'AVUI (per si cal mirar enrere)

`f924805` (30 px d'aire a la p2) · `bf69506` (les velades en negre) · `9b852be`
(alinea la p1) · `dd3f1b4` (les fletxes de la graella) · `5d7059d` (el bloc de la
p1 com el de la p2) · `b014426` (fora el fons de les fletxes de la p2) · `246b1c0`
(l'ombra de la màniga) · `795a63f` (fins al bottom de la franja) · `6ae7a15` (dues
botoneres + el gap de la p2) · `9ccc23f`/`1a1329e`/`c62ff44`/`90a37af` (posició,
capes i `z-10` de la filera) · `827d15d` (la caixa per sota de la màniga) ·
`5e1fece` (graella a la mida del selector) · `88a802d` (files separades) ·
`b465921` (afinada: 51,3 / 54 / 20 / COLOR / ratlla) · `9fafb54` (les files a 93 i
150) · `14f5d6b`/`1304f8a` (el clic).
