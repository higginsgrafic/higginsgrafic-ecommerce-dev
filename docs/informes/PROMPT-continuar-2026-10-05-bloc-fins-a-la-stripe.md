# PROMPT per continuar — 05/10/2026 — el bloc fletxes+selector fins al bottom de la stripe

## Context de treball

- Projecte: `higginsgrafic-ecommerce-dev` (Vite + React 19 + Tailwind 3.4). El servidor de
  desenvolupament ja corre a `http://127.0.0.1:3003` — **no n'arrenquis cap altre**.
- Pagina nova: `/nova/inici`. Visor del mosaic: `public/browser-overlay.html`
  (`?ruta=/nova/inici`); `ct`/`cb` son el chrome simulat, o sigui que la finestra de debò
  es `h - ct - cb` (p. ex. 1280x720 amb `ct: 134` → **1280x586**).
- Protocol de la casa: `docs/informes/COM-TREBALLO.md`. Bateria abans de cada commit:
  `npx vitest run` (600 tests), `npx eslint <fitxers>`, `npx vite build`,
  `npm run compara-vistes` (falla igual abans i despres: 3 vistes amb «no s'ha trobat la
  graella»), `node scripts/mesura-formats.mjs` (ha de dir els dos «0 formats»).
- **Sempre commit + push** (missatges en catala, amb els numeros abans/despres). **Mai
  deploy.** No tocar `src/index.css` ni els colors de producte.
- Regles de l'amo que son a la memoria (`COM-TREBALLO.md`): **nombres enters** sempre que
  es pugui, i **els termes tecnics no es tradueixen** (stripe, hero, mockup, grid, desktop,
  tablet, selector, carril, graella, fletxes, fila...).

## Estat actual (arbre net, tot pujat a `a9fba291`)

Els portatils de **1200 a 1366** (1200x586, 1280x666 i 1366x634) son els que s'estan
treballant. Porten la variant **`megaslide-1000`** (carril 1000) i aquesta composicio:

| peça | mesura a 1280x666 (viewport) |
|---|---|
| carril (bloc `data-bloc-dreta-p1`) | 140,5 .. 1140,5 |
| graella (una sola fila) | 140,5 .. 1034 — arrenca a zero del carril |
| selector | arrenca a 1044 → **10 px de gap** |
| cossos de la stripe | mateix ample que la graella (objectiu = amplada de la graella) |
| bloc fletxes + selector | 97 d'alçada, de **91 a 187** (fletxes 48 a sobre, selector 48 a sota) |
| megaslide | 238 |
| hero | 220 (1200x586) · 276 (1280) · 250 (1366) |
| banda | `0,05 x carril + 199` per a aquests tres (delta −1) |

Com esta fet, als fitxers:

- `src/utils/layoutModel.js` — `megaslide-1000` a `MEGASLIDE_VERSIONS` i la tria per
  amplada a `versioMegaslide` (`w >= 1200 && w <= 1366` → `megaslide-1000`).
- `src/config/iniciNou.js` — `espaiMegaslideCss`: la recta propia dels 1200–1366
  (`0,05 x carril + 199`).
- `src/components/fullwide/GraellaDuesFileresPagina1.jsx` — prop `unaFila`: dibuixos un
  10% mes grossos, `gapV: 0`, `numColumns: items.length`, `filaUnica`, i `paddingLeft: 0`.
- `src/components/fullwide/CercadorTextRow.jsx` — `CercadorDibuixosGraella` amb
  `filaUnica`: totes les peces a la fila de dalt, a un pas sencer (`i * pas`), periode
  d'una fila i sense desnivells; `unPas = pas`.
- `src/components/fullwide/MegaStripePanelP1.jsx` — `esFilaUnicaP1`
  (`esEscriptoriP1 && 1200 <= window.innerWidth <= 1366`), `ampleGraellaP1`,
  `costatFilaUnicaPx`, la filera amb `alignItems: flex-start` a la fila unica, el
  desplacament `dx` de la graella, i el bloc amb les fletxes a sobre i el selector a sota
  (`flexDirection: column`).
- `src/hooks/useEscalaFranjaCarril.js` — parametre nou `ancoratEsquerra` (l'objectiu
  arrenca a la vora esquerra del carril, amb el mig marge finestra/maquetacio descomptat).

## La feina que queda (UNICA): el bottom del bloc = el bottom de la stripe

En Marc: «**Alinea el bloc fletxes + selector al bottom de la stripe**». Ara el bloc acaba
a 187 i la stripe molt mes avall. El que ha de passar: el bloc agafa **l'alcada de la
graella d'una fila + la stripe** (uns 170 px, amb les fletxes i el selector de ~85 cada
un), i el seu bottom cau exactament al bottom de la stripe.

**El cami bo, i el motiu:** no ancorem el bloc amb un `bottom` ni amb cap numero (es
descalibraria sol, perque l'aire de sota i l'alcada de la stripe son variables). El que
fem es **treure el bloc de dins de la filera** i muntar-lo com a germa del conjunt
[filera + stripe], dins d'un flex amb `alignItems: 'stretch'`: aixi agafa l'alcada exacta
del conjunt sense cap mesura.

Passos concrets dins `src/components/fullwide/MegaStripePanelP1.jsx`:

1. El bloc es `data-bloc-dreta-p1` (cap a la linia 1250) i viu DINS de la filera
   (`data-filera-p1`, cap a la linia 905). La stripe es cap a la linia 1479
   (`#stripe-guide-stripe-row-p1`, `height: carrilPx(stripePreviewHPx)`), i entre mig hi
   ha les capes de les ombres, la pastilla i les arees de clic.
2. Per a la fila unica (`esFilaUnicaP1`): extreure el bloc de la filera i muntar-lo, al
   mateix lloc de l'arbre on es pugui posar com a germa, dins un contenidor
   `display: flex; alignItems: 'stretch'` que contingui [filera + stripe] a l'esquerra i
   el bloc a la dreta (amplada `blocDretaPx`).
3. Dins del bloc, les dues peces a `flex: '1 1 50%'` (fletxes a dalt, selector a sota),
   sense alcades fixes.
4. **Nomes** a la fila unica: la resta de composicions (tauletes, i els escriptoris de
   1440, 1512, 1920 i 2560) es queden amb el bloc dins la filera, sense tocar-se.

### Verificacio

- `node .freebuff/_tmp-zero.mjs` — la graella, el bloc i la stripe en coordenades del
  viewport 1 (la graella ha d'arrencar a zero del carril i acabar 10 px abans del selector).
- `node .freebuff/_tmp-columna-alcada.mjs` — les alcades de totes les peces.
- `node .freebuff/_tmp-banda-laptops.mjs` — la banda contra la vora real del panell
  (`delta 0` es l'objectiu; descomptar els 72 px de la capcalera).
- `node scripts/_tmp-ipad13-abans-despres.mjs` — 13 vistes en una linia: nome s han de
  canviar les dels portatils (la linia del 1280 al guio).
- Si l'alcada del megaslide canvia, recalcular la recta de la banda dels 1200–1366 a
  `src/config/iniciNou.js` i deixar-la amb delta 0.

## Altres coses pendents (menors)

- La banda de la vertical va +3/+3/−1 px (768x952, 820x1108, 1032x1304) i la dels 1180 i
  1200 (tauletes) **+6 px**: es preexistent i no s'ha tocat mai.
- `npm run compara-vistes` falla a 1024, 1366 i 1440 («no s'ha trobat la graella»): tambe
  es preexistent (comprovat fent stash).
- El desplegament, si mai es fa, no es fa des d'aquesta sessio.
