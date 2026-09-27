# PROMPT — continuar: **ELS ROMBES DEL VEL** (27/09/2026)

Ets un agent que continua la feina al projecte **higginsgrafic-ecommerce-dev**
(React 19 + Vite). Aquest prompt es un **bucle**: no aturis fins que els rombes
del vel estiguin **arreglats, mesurats, comitejats i pujats**.

**NO DEMANIS RES A NINGU.** L'amo no hi es: treballa sol, decideix tu i **deixa
escrit el que has decidit i per que**. Si dubtes entre dues interpretacions, tria
la que mes s'assembli al que es veu a la pagina 2 (que es el punt estable), fes-la
i anota la decisio.

El servidor del 3003 **ja corre** i es el de l'amo: no l'aturis ni n'aixeques cap
altre. Els guions de Playwright el fan servir.

---

## 0. PER QUE AQUESTA FEINA ES LA PRIORITAT

La resta de la feina de la pagina 1 i de la pagina 2 **esta feta i verificada**
(vegeu `INFORME-26-09-2026-pagina1.md` i les voltes 0 a 11 del quadern). Tot el
que hi ha a la llista de sota funciona: els clics, la rodeta, els selectors, les
alineacions i les dues pagines quadrades.

**El que no esta be son els rombes del vel**: quan una samarreta porta dibuix i
el vel l'ha de cobrir, a les cantonades de la samarreta **hi surt un rombe** (una
taca amb forma de rombe on el dibuix no queda cobert). Ho ha vist l'amo, i es
**l'unic que queda obert** i el que mes es veu.

Es un problema **de forma, no d'estil**: la mascara del vel i el retall dels
dibuixos no son la mateixa silueta. Fins que no quadrin, el dibuix surt de la
samarreta per les cantonades.

---

## 1. Llegeix primer (en aquest ordre)

1. `docs/informes/COM-TREBALLO.md` — com es treballa amb aquest amo.
2. `docs/informes/PLA-neteja-calibratge-megaslide.md` — **la VOLTA 11** es
   aquesta feina: hi ha la mesura exacta de les dues siluetes i els tres passos
   per resoldre-ho.
3. `docs/informes/INFORME-26-09-2026-pagina1.md` — l'estat de tot el demes.

---

## 2. El que ja se sap (no ho tornis a mesurar)

**Els fitxers que l'amo va passar JA SON al codi.** `clic-area-1.svg` es
`CLIC_AREA_ESTRETA` i `clic-area-2.svg` es `CLIC_AREA_AMPLA`, amb el cami i el
transform **identics**. Canviar-los per aquests fitxers **no canvia res**: no hi
perdis temps.

**La troballa:** el projecte fa servir **dues siluetes diferents** de la mateixa
samarreta, dins la mateixa graella de 306x307:

| forma | caixa (x, y, ample, alt) | on es fa servir |
|---|---|---|
| `full-clic-area-5.svg`, casa 0 | 0, **0,8**, 305,6, 306 | **el vel** (la mascara) |
| `VECTOR_FRANJA_SAMARRETA` | 0, **14,2**, 303,2, 303,6 | **el retall dels dibuixos** |
| `clic-area-2.svg` (l'amo) | 0, **14,2**, 303,2, 303,6 | les arees de clic |

**La del vel esta 13,4 unitats (uns 4,8 px a 1920) mes amunt i es 2,4 unitats mes
ampla** que la del retall. Aquesta diferencia es la que deixa una franja del
dibuix fora de la samarreta, i a les cantonades allo es el rombe.

**On viu cada cosa:**

- el vel: `generaVelDataUrl` i `useVelSamarretes` a
  `src/components/fullwide/MegaStripePanel.jsx` (~186 i ~357); el full de
  siluetes es `/placeholders/cercador/full-clic-area-5.svg` (catorze `path` amb
  `class="tshirt-outline"`, carregat per `siluetesSamarreta.js`);
- el retall dels dibuixos: `VECTOR_FRANJA_SAMARRETA_01` (coordenades 0-1) i
  `VECTOR_FRANJA_SAMARRETA` (coordenades de la caixa) a
  `src/config/vectorFranja.js`;
- les caixes del vel: `VEL_SAMARETA_CAIXA` i `VEL_SILUETA_CAIXES`, tambe a
  `vectorFranja.js`.

---

## 3. La recepta (en aquest ordre, i comprovant a cada pas)

**La referencia bona es la IMATGE de la franja** (`full-color-stripe-5.webp`):
es qui te la tinta. Fins que no sàpigues quina de les dues siluetes esta
desplaçada respecte de la tinta, **no toquis res**: si desplaces la que no toca,
el rombe empitjora.

1. **Mesura la caixa de la TINTA d'una samarreta de la imatge.** El seu canal
   alfa es **pla** (ho vaig comprovar: el detector per alfa dona la caixa
   sencera, 306x307), o sigui que **s'ha de mesurar per LLUMINOSITAT**: la
   samarreta es blanca i el fons del panell es el color de la samarreta. Utilitza
   una finestra del panell i un llindar ajustat, i comprova el resultat mirant
   una captura retallada de la cantonada (no et refiis nome's del numero).
2. **Compara la caixa de la tinta amb les dues siluetes** i decideix quina esta
   desplaçada. Escriu la decisio amb les tres caixes al costat.
3. **Aplica el desplaçament NOME'S a la que toqui** (un sol numero, a
   `vectorFranja.js` o a l'origen del `clipPath`), de manera que **cap peça es
   mogui de lloc**: el que ha de quadrar es la cobertura del dibuix, no la
   posicio de la samarreta.
4. **Comprova-ho** amb:
   - `node scripts/_tmp-ancoratge.mjs` → ha de dir **TOT AL SEU LLOC**;
   - una captura **retallada de la cantonada** del rombe, abans i despres, amb
     el mateix `clip` (guarda les dues: son la prova);
   - la bateria sencera (seccio 4).
5. **Commit** (un canvi, un commit, missatge en catala amb la causa i les xifres)
   i **`git push`**.

**Si el rombe no marxa amb la silueta, canvia de cami** (no insisteixis): la
causa pot ser que el vel es generi amb la forma de la **casa 0** per a totes les
cases (`generaVelDataUrl`) i les cases 1 a 13 tinguin una forma de coordenades
diferent. En aquest cas, mesura el `getBBox()` de cada `tshirt-outline` del full
i compara'l amb la casa que li toca. Tambe pot ser que el problema sigui el
`maskSize: '103% 100%'` del panell. Apunta el que trobis i passa al seguent cami.

---

## 4. La bateria (abans de cada commit, cap de saltables)

```bash
npx vitest run                      # 581 proves (45 fitxers) al punt de partida
npx eslint <fitxers tocats>         # nome's els tocats; els comptes NO poden pujar
npx vite build
npm run compara-vistes              # HA DE DIR «OK»
node scripts/mesura-formats.mjs     # HA DE DIR «0 i 0»
node scripts/_tmp-errors2.mjs       # HA DE DIR «cap error»
node scripts/_tmp-ancoratge.mjs     # HA DE DIR «TOT AL SEU LLOC»
```

**Linies base d'`eslint` (27/09/2026):** `MegaStripePanel.jsx` 4/11,
`FullWideSlideHeader.jsx` 15/12, `MegaStripePanelP1.jsx` 3/0, `MegaMenuPanel.jsx`
2/0, `CercadorTextRow.jsx` 0/6, `firstContactPanels.jsx` 0/3,
`MegaslidePagina2.jsx` 0/7. **Els fitxers nous, nets.**

**Els `scripts/_tmp-*.mjs` i els `_tmp-*.png` NO es comitegen mai.** L'unic que
es queda es `_tmp-ancoratge.mjs`, que ja esta comitejat.

---

## 5. Les coses que no es poden moure

- **La pagina 2 es el punt estable** (`26442f5`, `7e0a696`, `768fb0e`,
  `3885df4`). `npm run compara-vistes` es qui ho vigila: si diu «NO QUADREN», ho
  has mogut sense voler.
- **La franja de les dues pagines ha de quedar a la mateixa alcada** (241,5 a
  1920). No la moguis per guanyar espai.
- **`--hg-mega-w` i `--hg-mega-x`** les fan servir la capcalera, el megaslide i
  el rail de la PDP: abans de tocar-ne una, `grep` de qui la llegeix.
- **El servidor del 3003 no es toca mai.**
- **Una cosa per commit**, i si no es pot acabar: **es desfa** (`git checkout --
  fitxer`) i s'escriu amb les xifres on s'ha encallat.

---

## 5.bis. SEGONA FEINA OBERTA: les fletxes del bloc de la dreta de la P1

**Tambe s'ha d'arreglar.** El clic a les fletxes del bloc de la dreta de la
pagina 1 **hi arriba** (comprovat amb `elementFromPoint`) pero **el carrusel no
es mou**: la transformacio es queda a `-1018.5` i `desplacamentPassos` no canvia
mai de 0 (`_tmp-p1-sonda.mjs`). Ja passava a `HEAD`: no es cap regressio.

Per on seguir: `MegaStripePanelP1` te `passaPagina1` i el passa a
`FletxesQuadratPagina1` (`onPrev`/`onNext`). Mirar si l'`onClick` del boto hi
arriba i, si hi arriba, si `GraellaDuesFileresPagina1` rep el
`desplacamentPassos` nou. Comprovar-ho amb `_tmp-p1-fletxa2.mjs`.

**Tambe provat i DESFET:** pujar la capa de la franja de la p1 a `zIndex: 20`
amb `pointerEvents: 'none'` (el regim de la p2). No canviava **res de visible**:
la maniga de la p1 no arriba on es veu. No ho tornis a provar sense una captura
que ho justifiqui.

---

## 6. Quan acabis

1. Escriu `docs/informes/INFORME-27-09-2026-rombes-vel.md` amb: estat, la causa
   exacta, les xifres abans/despres, **les trampes** (el que has provat i no ha
   sortit i per que), i el que queda obert.
2. Actualitza la **VOLTA 11** del quadern amb el resultat.
3. Comiteja i puja.
4. Digues a l'amo, en quatre linies: que ha de mirar (F5) i que li toca decidir.

**L'UNICA CONDICIO PER PARAR:** els rombes no surten **als dos panells** (p1 i
p2, i tambe a les vistes de tauleta), **les fletxes de la p1 mouen la graella**,
la bateria passa amb l'arbre net i l'informe es pujat. Si no, **torna a comencar el bucle**.

---

## 7. Els guions utils (ja al disc)

- `node scripts/_tmp-ancoratge.mjs` — les 9 peces clau de les dues pagines:
  **abans i despres de cada canvi**.
- `node scripts/_tmp-mapa-p2.mjs` — captura 1920x1080 de la p2 amb les peces
  etiquetades i les xifres.
- `node scripts/_tmp-captura-1920.mjs` — captura 1920x1080 amb el quadrat de
  100 px (per mesurar a l'editor vectorial de l'amo).
- `node scripts/_tmp-formes-comparacio.png` / `scripts/_tmp-vel-formes.mjs` —
  compara les formes del codi amb les dels fitxers de l'amo.
- `node scripts/mesura-megaslide.mjs --detall` — el megaslide amb xifres.
- `node scripts/_tmp-errors2.mjs` — errors de consola (bateria).
- `node scripts/_tmp-retalla.mjs <png> <x> <y> <w> <h> <factor> <desti>` — retall
  i ampliacio d'una captura (per mirar el rombe de prop).
