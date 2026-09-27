# PROMPT — continuar (27/09/2026): **els rombes del vel** i **les fletxes de la p1**

Ets un agent que continua la feina al projecte **higginsgrafic-ecommerce-dev**
(React 19 + Vite). Aquest prompt es un **bucle**: no aturis fins que les **dues**
feines de sota estiguin **arreglades, mesurades, comitejades i pujades**.

**NO DEMANIS RES A NINGU.** L'amo no hi es: treballa sol, decideix tu i **deixa
escrit el que has decidit i per que**. Si dubtes entre dues interpretacions, tria
la que mes s'assembli a la pagina 2 (que es el punt estable), fes-la i anota la
decisio amb la paraula DECISIO.

El servidor del 3003 **ja corre** i es el de l'amo: no l'aturis ni n'aixeques cap
altre. Els guions de Playwright el fan servir.

---

## 0. L'ESTAT, EN UNA TAULA

Tot el que no son aquestes dues coses **esta fet, mesurat i pujat** (vegeu
`INFORME-26-09-2026-pagina1.md` i les voltes 0 a 13 del quadern):

| cosa | estat |
|---|---|
| pagina 2: selector de colleccions, fletxes, maniga, clics, rodeta | **fet** |
| pagina 1: composicio (graella de dues fileres + bloc de la dreta) | **fet** |
| estil dels selectors (radis 5,3/3, offset 5, text 13,5) | **fet** |
| cadenat, ancoratge, bateria | **fet** |
| **1. els rombes del vel** | **OBERT** (es veu a les dues pagines) |
| **2. les fletxes de la p1** | **OBERT** (n'hi ha dues parelles i les del bloc no fan res) |

Bateria de referencia: **581 proves (45 fitxers)**, `compara-vistes` **OK**,
`_tmp-ancoratge.mjs` **TOT AL SEU LLOC**.

---

## 1. Llegeix primer (en aquest ordre)

1. `docs/informes/COM-TREBALLO.md` — com es treballa amb aquest amo.
2. `docs/informes/PLA-neteja-calibratge-megaslide.md` — **les voltes 11, 12 i
   13** son aquestes dues feines: hi ha les mesures exactes i el que ja s'ha
   provat i desfet.
3. `docs/informes/INFORME-26-09-2026-pagina1.md` — l'estat de tot el demes.

---

# FEINA 1 — ELS ROMBES DEL VEL

**Que es veu:** quan una samarreta porta dibuix i el vel l'ha de cobrir, a les
cantonades de la samarreta **hi surt un rombe** (una taca amb aquesta forma on el
dibuix no queda cobert). Es veu als dos panells (p1 i p2).

**Es un problema de FORMA, no d'estil:** la mascara del vel i el retall dels
dibuixos no son la mateixa silueta; fins que no quadrin, el dibuix surt de la
samarreta per les cantonades.

## 1.1 El que ja se sap (no ho tornis a mesurar)

**Els fitxers que l'amo va passar JA SON al codi.** `clic-area-1.svg` es
`CLIC_AREA_ESTRETA` i `clic-area-2.svg` es `CLIC_AREA_AMPLA`, amb el cami i el
transform **identics**. **No hi perdis temps.**

**La troballa:** el projecte fa servir **dues siluetes diferents** de la mateixa
samarreta, dins la mateixa graella de 306x307, amb origen diferent:

| forma | caixa (x, y, ample, alt) | on es fa servir |
|---|---|---|
| `full-clic-area-5.svg`, casa 0 | 0, **0,8**, 305,6, 306 | **el vel** (la mascara) |
| `VECTOR_FRANJA_SAMARRETA` | 0, **14,2**, 303,2, 303,6 | **el retall dels dibuixos** |
| `clic-area-2.svg` (l'amo) | 0, **14,2**, 303,2, 303,6 | les arees de clic |

**La del vel esta 13,4 unitats (uns 4,8 px a 1920) mes amunt i es 2,4 unitats mes
ampla** que la del retall. Aquesta es la diferencia que deixa una franja del
dibuix fora de la samarreta.

**Els fitxers duplicats ja estan esborrats:** les originals que funcionen son
`public/placeholders/cercador/clic-area-1.svg` i `clic-area-2.svg`. Les copies
`clic-area-t1-(5).svg` i `clic-area-t2-t14-(5).svg` (que no funcionaven) **ja no
hi son**: no les busquis ni les tornis a desar.

**On viu cada cosa:**
- el vel: `generaVelDataUrl` i `useVelSamarretes` a
  `src/components/fullwide/MegaStripePanel.jsx` (~186 i ~357); el full de
  siluetes es `/placeholders/cercador/full-clic-area-5.svg` (catorze `path` amb
  `class="tshirt-outline"`), carregat per `siluetesSamarreta.js`;
- el retall dels dibuixos: `VECTOR_FRANJA_SAMARRETA_01` (coordenades 0-1) i
  `VECTOR_FRANJA_SAMARRETA`, a `src/config/vectorFranja.js`;
- les caixes del vel: `VEL_SAMARETA_CAIXA` i `VEL_SILUETA_CAIXES`, tambe a
  `vectorFranja.js`.

## 1.2 La recepta (en aquest ordre, comprovant a cada pas)

**La referencia bona es la IMATGE de la franja** (`full-color-stripe-5.webp`):
es qui te la tinta. Fins que no sàpigues quina de les dues siluetes esta
desplaçada respecte de la tinta, **no toquis res**: si desplaces la que no toca,
el rombe empitjora.

1. **Mesura la caixa de la TINTA d'una samarreta de la imatge.** El seu canal
   alfa es **pla** (comprovat: el detector per alfa dona la caixa sencera,
   306x307), o sigui que **s'ha de mesurar per LLUMINOSITAT**: la samarreta es
   blanca i el fons del panell es el color. Fes servir una finestra del panell i
   un llindar ajustat, i **comprova el resultat mirant una captura retallada de
   la cantonada** (no et refiis nome's del numero).
2. **Compara la caixa de la tinta amb les dues siluetes** i decideix quina esta
   desplaçada. Escriu les tres caixes al costat.
3. **Aplica el desplaçament NOME'S a la que toqui** (un sol numero), de manera
   que **cap peça es mogui de lloc**: el que ha de quadrar es la cobertura del
   dibuix, no la posicio de la samarreta.
4. **Comprova-ho** amb `_tmp-ancoratge.mjs` (**TOT AL SEU LLOC**), una captura
   retallada de la cantonada **abans i despres** amb el mateix `clip`, i la
   bateria sencera (seccio 3).
5. **Commit** i **`git push`**.

**Si el rombe no marxa amb la silueta, canvia de cami** (no insisteixis):
- el vel es genera amb la forma de la **casa 0** per a totes les cases
  (`generaVelDataUrl`): mesura el `getBBox()` de cada `tshirt-outline` del full i
  compara'l amb la casa que li toca;
- o be es el `maskSize: '103% 100%'` del panell.
Apunta el que trobis i passa al seguent cami.

---

# FEINA 2 — LES FLETXES DE LA P1

**Que passa:** a la pagina 1 hi ha **DUES parelles de fletxes** i **les que
funcionen no son les que toca**. Mesurat:

| fletxa | on | funciona? |
|---|---|---|
| `Anterior` / `Següent` | **dins el carrusel**, x1349 | **SI** (mouen la graella amb `setDesplacGest`) |
| `Anterior` / `Següent` | **al bloc de la dreta**, x1414 | **NO** (criden `passaPagina1`, que no mou res) |

Les del bloc son les de la composicio que ha demanat l'amo (a la vora dreta del
carril). Les del carrusel son les que queden del disseny vell.

## 2.1 El que ja s'ha provat i DESFET (no ho tornis a fer tal qual)

Es va provar d'amagar les del carrusel amb una prop `senseFletxes` (perque
nome's en quedessin les del bloc). **S'amagaven be** (el DOM passa de 4 fletxes a
2), pero **les del bloc seguien sense moure res**. La sonda diu per que:

- l'`onClick` del boto del bloc **si que corre** (`passaPagina1(1)` es crida, amb
  `total = 64`);
- `pageStart` es queda a **0**;
- el valor que arriba a la graella (`desplacamentPassos`) **si que canvia**
  (`passos: 1, base: 22,5` i tambe `passos: 0, base: 0` en instancies
  diferents), pero **la transformacio del carrusel no es mou mai de `-1018.5`**.

**Conclusio:** el muntatge de `desplacamentPassos` (estat derivat al cos del
render) **es baralla amb el centratge de la colleccio** de
`CercadorDibuixosGraella`: el centratge torna a escriure la base i deixa el
desplacament a zero. Tot aixo es **desfet**: no hi ha res a mig fer.

## 2.2 La recepta

1. **Decideix qui mana.** A la p2 les fletxes del carrusel governen la **franja**
   (per aixo hi ha `onCarouselStep`); a la p1 han de manar les del **bloc** i
   moure la **graella**. Es la mateixa peça amb dos amos diferents.
2. **Fes que el bloc faci servir el MATEIX mecanisme que les fletxes del
   carrusel** (`setDesplacGest`), en comptes de l'estat derivat al render. La
   manera mes neta es passar al carrusel una funcio de pas (com `onCarouselStep`)
   i que el bloc la cridi; aixi **no hi ha dos estats en paral·lel**.
3. **Amaga les fletxes del carrusel a la p1** (la prop `senseFletxes` ja
   funcionava: es pot reaprofitar).
4. **Comprova amb el ratoli de debò** que les fletxes del bloc mouen la graella
   (`_tmp-p1-pp2.mjs`), que el selector i la graella segueixen clicables
   (`_tmp-p1-clics.mjs`) i que l'ancoratge no s'ha mogut.
5. **Commit** i **`git push`**.

---

## 3. La bateria (abans de cada commit, cap de saltables)

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

## 4. Les coses que no es poden moure

- **La pagina 2 es el punt estable** (`26442f5`, `7e0a696`, `768fb0e`,
  `3885df4`). `compara-vistes` es qui ho vigila: si diu «NO QUADREN», ho has
  mogut sense voler.
- **La franja de les dues pagines ha de quedar a la mateixa alcada** (241,5 a
  1920). No la moguis per guanyar espai.
- **L'ancoratge** (les 9 peces de `_tmp-ancoratge.mjs`) es la referencia de tot:
  abans i despres de cada canvi.
- **`--hg-mega-w` i `--hg-mega-x`** les fan servir la capcalera, el megaslide i
  el rail de la PDP: abans de tocar-ne una, `grep` de qui la llegeix.
- **El servidor del 3003 no es toca mai.**
- **Una cosa per commit.** Si no es pot acabar: **es desfa** (`git checkout --
  fitxer`) i s'escriu amb les xifres on s'ha encallat.

---

## 5. Quan acabis

1. Escriu `docs/informes/INFORME-27-09-2026-rombes-i-fletxes.md` amb: estat, la
   causa exacta de cada cosa, les xifres abans/despres, **les trampes** (el que
   has provat i no ha sortit i per que) i el que queda obert.
2. Actualitza el quadern (voltes 11, 12 i 13) amb el resultat.
3. Comiteja i puja.
4. Digues a l'amo, en quatre linies: que ha de mirar (F5) i que li toca decidir.

**L'UNICA CONDICIO PER PARAR:** els rombes no surten **als dos panells** (p1 i p2
i tambe a les vistes de tauleta), **les fletxes del bloc de la p1 mouen la
graella**, la bateria passa amb l'arbre net i l'informe es pujat. Si no, **torna
a comencar el bucle**.

---

## 6. Els guions utils (ja al disc, no es comitegen)

- `node scripts/_tmp-ancoratge.mjs` — les 9 peces clau de les dues pagines:
  **abans i despres de cada canvi**.
- `node scripts/_tmp-p1-pp2.mjs` — la p1: el clic a les fletxes del bloc i el que
  fa el carrusel.
- `node scripts/_tmp-p1-dues.mjs` — quantes fletxes i quants carrusels hi ha a la
  p1 i quins son visibles.
- `node scripts/_tmp-p1-clics.mjs` — els clics de la p1 amb el ratoli de debò.
- `node scripts/_tmp-p1-comportament.mjs` — clicar un dibuix de la graella de la
  p1: el carrusel s'ha de quedar quiet i la franja ha de canviar.
- `node scripts/_tmp-mapa-p2.mjs` — captura 1920x1080 de la p2 amb les peces
  etiquetades i les xifres.
- `node scripts/_tmp-captura-1920.mjs` — captura 1920x1080 amb el quadrat de
  100 px (per mesurar a l'editor vectorial de l'amo).
- `node scripts/_tmp-retalla.mjs <png> <x> <y> <w> <h> <factor> <desti>` — retall
  i ampliacio d'una captura (per mirar el rombe de prop).
- `node scripts/mesura-megaslide.mjs --detall` — el megaslide amb xifres.
- `node scripts/_tmp-errors2.mjs` — errors de consola (bateria).
