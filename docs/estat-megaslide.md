# Estat del megaslide — testimoni per a la propera sessió

Data: 18 de setembre de 2026 (nit). Aquest document és un **testimoni**: explica
on és la feina, què funciona, què no s'ha de tocar i on s'ha de continuar.
Es pot esborrar quan s'hagi tancat el tema.

---

## 1. Com treballa l'amo (important)

- Tot en **català**: codi, comentaris, commits i conversa.
- **No fer push** sense que ho demani. Els commits es fan locals i ell decideix
  quan pugen.
- **Abans de dir que una cosa està feta**: `npx vitest run` i `npm run build`.
- Cada canvi, **verificat amb captures seves o amb el comparador**; commits
  petits i reversibles.
- **Mai aturar el servidor sense avisar-lo abans.** La seva aplicació
  d'arrencada (a `tools/sessio/`) engega el build i el preview; si se li atura,
  es queda sense pestanya.

### Trampa que ja ens ha mossegat

**No fer mai** `lsof -ti :3003 | xargs kill`: `lsof -ti` llista també els
**clients** (el seu Firefox), i mata el navegador. Si mai cal aturar el
servidor, només el que escolta:

```bash
lsof -nP -iTCP:3003 -sTCP:LISTEN -t | xargs -r kill
```

I normalment **no cal aturar-lo**: el servidor del 3003 és el Vite de
desenvolupament, llegeix `src/` i amb HMR ja et mostra els canvis.

Ara bé: el comparador **no reinicia** el servidor que troba viu (només n'engega
un si no n'hi ha cap, i llavors és un `vite preview` de `dist/`). Si les xifres
que dona no quadren amb el codi que acabes de canviar, mira primer si el 3003
és el servidor de sempre (dev) o un preview vell.

---

## 2. Ordres útils

```bash
npm run build                     # compila (i refà les miniatures dels dibuixos)
npx vite build                    # compila sense el prebuild de miniatures (més ràpid)
npm run rapid                     # build + preview al 3003 — NO mentre el 3003 estigui ocupat
node scripts/compara-vistes.mjs   # comparador de vistes (engega un preview només si el 3003 està apagat)
npx vitest run                    # proves d'unitat (439)
```

El **comparador** (`scripts/compara-vistes.mjs`) és la xarxa de seguretat: obre
les quatre mides del megaslide (768×1024 vertical, 1024×768 i 1366×768
horitzontals, 1440×900 desktop), mesura les xifres clau i **falla si les vistes
de tauleta se separen**. És el primer que s'ha de passar després de tocar res.
Contra el servidor de sempre no cal compilar: mesura `src/` amb HMR.

Estat del servidor: el **3003 no és un `preview`**. L'aplicació d'arrencada
(`tools/sessio/sessio.sh`) engega `npm run proves` = `netlify dev` al 8888, i
aquest arrenca la instància de **Vite de desenvolupament** al 3003 (proxy de
`/api` i `/.netlify/functions` cap al 8888). Per tant:

- El que veu l'amo surt de `src/`, amb **HMR**; el `dist/` no hi té res a veure.
- El seu entorn de desenvolupament és **Firefox**.
- El **comparador va amb Chromium** (Playwright) contra aquest mateix 3003, i
  per això tampoc no cal compilar per passar-lo.
- No engeguis `npm run rapid` ni un `vite preview` al 3003 mentre duri: xocarien
  amb el servidor que ja hi és.

---

## 3. Arquitectura rellevant

### Components principals

| Fitxer | Què fa |
|---|---|
| `src/components/FullWideSlideHeader.jsx` | Capçalera, botons, cadenat, mesura del belt i calibració de la pàgina 1 |
| `src/components/fullwide/MegaMenuPanel.jsx` | El panell que s'obre; conté les 4 pàgines i el tauler |
| `src/components/megaslide/MegaslidePagina2.jsx` | Pàgina 2 (el cercador), des del 17/9 un sol component per a desktop, horitzontal i vertical |
| `src/components/fullwide/CercadorTextRow.jsx` | La graella de 16×4 dibuixos, la columna de colors i la llista de col·leccions |
| `src/components/fullwide/MegaStripePanel.jsx` | La franja de samarretes (la fan servir les pàgines) |
| `src/components/fullwide/MegaStripePanelP1.jsx` | La franja de la pàgina 1 |
| `src/components/fullwide/MegaColumn.jsx` | **Les 8 columnes velles**; la pàgina 2 ja no les dibuixa (només en reserva el lloc), la pàgina 1 sí |
| `src/components/fullwide/firstContactPanels.jsx` | El selector Blanc/Color/Negre (`data-stripe-buttonbar="bn"`) |
| `src/hooks/useDeviceLayout.js` | Retorna `isMobile`, `isPortraitTablet`, `isLandscapeTablet`, `isDesktop`, `isTouch`, `viewportWidth/Height` |
| `src/hooks/useMegaslideCalibration.js` | Mesura el contenidor i en treu la mida de fitxa i de la franja |

### Números clau (no inventar-ne de nous)

| | Desktop | Tauleta horitzontal | Tauleta vertical |
|---|---|---|---|
| Belt (`--hg-mega-w`) | 1350 | 992 | 992 |
| Dibuix de la graella | 30 px | 19,89 | 19,89 |
| Cercle de color | 25 px | 18,89 | 18,89 |
| Franja de samarretes (alçada) | ~141,9 | ~100,4 (1024) / ~141,6 (1366) | ~101,6 |

- L'escala de tauleta surt d'**un sol número**: `ESCALA_TAULETA = 0,995` a
  `CercadorTextRow.jsx:95`, aparellada amb la calibració de la pàgina 1
  (`992 * 0,995` a `FullWideSlideHeader.jsx:2072` per al vertical, i
  `w * 0,995` a la línia 2073 per a l'apaisada).
- Llindar de **1382 px**: per sota, el belt s'encongeix perquè viu de
  `--belt2-xL/xR` i cau a `100vw - 32px` (`getSafeBelt`, `src/utils/layoutMetrics.js:191`);
  a partir de 1382 el belt torna a ser 1350. **No és** el llindar de
  `isDesktop`: `useDeviceLayout.js` dona `isDesktop` a partir de 1024 i
  tauleta (tàctil) per sobre de 600.
- Comprovat amb el comparador el 18/9 (Chromium): dibuix 30 / 19,89, cercle
  25 / 18,89, franja 141,9 (1440), 141,6 (1366), 100,4 (1024), 101,6 (768).
  Atenció: **la franja creix amb el viewport** a 1366 (mateixa alçada que
  desktop), mentre la resta de peces no; el comparador ho treu com a nota, no
  com a error.

### El mapa del DOM del megaslide (traçat el 18/9)

```
dibuixos de la graella:  button → … → div.mx-auto.max-w-[1350px]
                                       → div.relative.z-[10000]   ← superfície del panell

selector Blanc/Color/Negre:
  el visible (pàgina 2)   div[data-p2-color-selector] [position absolute, z=4]
  reserva de la graella   div.relative.z-10.grid.grid-cols-1 [visibility hidden]
                          → div [aspect-ratio 8.77/1]

cadenat:                  button → div [position fixed] → body [overflow hidden] → html
```

El DOM traçat el 18/9 deia que el `grid-cols-9` del `MegaColumn` anava de
`[1326, 2499]` a 1280. El que es va tornar a mesurar és `[45,9, 1219,1]`
(1173,1 px d'ample, amb el `scale(0.94)`), i la còpia del carrusel,
`[-1234,1, -60,9]`. Des del canvi del punt 6, a la pàgina 2 **no hi ha cap
`grid-cols-9`**.

Conseqüències:
- El selector i els dibuixos viuen **a la mateixa cadena**: si s'escala el
  megaslide, s'escalen tots dos.
- El **`body` té `overflow: hidden`**: tot el que surt de la pantalla es
  retalla, no es pot desplaçar.
- El **cadenat viu fora** de la composició (penja del `body`), per això sempre
  s'ha hagut de posicionar a part.

---

## 4. Què està fet i funciona

- **Fusió dels components de la pàgina 2**: `MegaslidePagina2Cercador` ja no
  existeix; les particularitats del vertical són branques `isPortraitTablet`.
  Verificat amb 44 mètriques idèntiques a les quatre mides.
- **Graella de dibuixos de la pàgina 2**: 16×4, amb la mida calibrada, files
  alineades amb les files de colors, i la llista de col·leccions repartida fins
  al bottom.
- **Selector Blanc/Color/Negre**: centrat verticalment amb la graella de colors
  (a totes les pantalles) i amb els noms en català.
- **Columna de col·leccions**: alineada a la dreta (amb amplada plena, si no
  l'alineació no es veu) i ajustada al nom més llarg (`fit-content`).
- **Home**: la hero i el menú d'icones, 25 px amunt al vertical i 50 px avall a
  l'horitzontal (respecte de l'original).
- **Cadenat**: surt de sota el panell amb una animació de 250 ms, sincronitzada
  amb l'acabament de la pàgina; al vertical fa el mateix (l'animació va en un
  contenidor exterior perquè el `transform` de dins és per arrossegar-lo). No
  surt a la pàgina del cistell. La seva posició se segueix a cada fotograma amb
  una alisada de 4 px per fotograma.
- **Comparador de vistes** i ordre `npm run compara-vistes`.
- **MegaColumn fora de la pàgina 2**: el `MegaStripePanel` ja no el dibuixa; el
  lloc que ocupava el reserva un fill amb `aspect-ratio` (vegeu punt 6).
- **Franja de la banda estreta**: el `translateY(-15px)` era el que partia la
  graella de colors en dues meitats a 1025-1366 px (vegeu punt 6.bis).
- **Franja ajustada a l'alçada**: en finestres curtes s'encongeix per no
  menjar-se el panell (vegeu punt 6.ter).
- **Filera de dalt quadrada amb la pàgina 1**: el selector i els cercles de la
  pàgina 2 queden a la mateixa alçada que els de la 1 a la banda estreta
  (vegeu punt 6.quater).
- **20 px més d'alçada de pestanya a l'escriptori**: les graelles s'havien
  menjat el coixí de sota les samarretes i la pestanya quedava justa
  (`MARGE_EXTRA_DESKTOP_PX` a `MegaMenuPanel.jsx`; només escriptori).

### Comprovat el 18/9 (abans de tancar el testimoni)

- `npx vitest run` → **439 proves passades** (37 fitxers).
- `npx vite build` → OK.
- `node scripts/compara-vistes.mjs` → **OK**, amb les mides del punt 3.
- Sondes a 1024/1280/1366/1440/1920 (Chromium, contra el 3003 viu, que és el
  Vite de desenvolupament sobre `src/`): cap selector dins de la finestra no
  surt per la dreta.
- Mesures A/B del canvi del punt 6: la franja es mou **menys de 0,6 px** a
  1280/1920/1024.

---

## 5. El que NO s'ha de tocar

- **Desktop**: funciona i és la referència. El belt fa 1350 px des de **1382**;
  per sota s'encongeix (`100vw - 32px`) i no s'ha de «corregir» (vegeu
  l'experiment fallit).
- **Tauleta horitzontal i vertical**: funcionen; el comparador dona OK. Les
  seves mides estan apuntades al punt 3.
- **La banda «estreta»** (768-1366 sense touch) existeix al codi i **es va
  intentar treure**: es va revertir perquè empitjorava el 1280.

### L'experiment que va fallar (18/9)

Es va intentar el que l'amo demanava: **veure el desktop amb una correcció
d'escala** al 1280. Es va provar de tres maneres i totes es van revertir:

1. Belt forçat a 1350 + `zoom` al tauler del megaslide.
2. `zoom` al `document.documentElement` per a tota la pàgina.
3. Les dues coses alhora.

**Per què va fallar**: el megaslide viu en contenidors `position: fixed` que
**no hereten l'escala del document**, i a més hi ha peces posicionades amb
coordenades fixes de la composició de 1350. El resultat era un megaslide mig
escalat: unes peces bé i unes altres fora de la pantalla.

**La conclusió** (que l'amo va proposar i és la bona): fer com a la **TDP**,
posar les peces dins d'una graella perquè **les seves posicions surtin de la
graella** i escalar sigui una sola operació.

---

## 6. El MegaColumn de la pàgina 2 — FET

**El problema**: la pàgina 2 encara passava pel **`MegaColumn`** (les 8 columnes
velles de text) dins del `MegaStripePanel`. Quan es va substituir per la graella
de dibuixos, la graella nova s'hi va posar però **la vella no es va treure**:
quedava dins del panell, invisible, ocupant lloc.

- On era: `src/components/fullwide/MegaStripePanel.jsx:163`. La pàgina 1
  (`MegaStripePanelP1.jsx:252`) té el seu propi `MegaColumn` i **no s'ha tocat**.
- La pàgina 2 el cridava amb `reserveGridSpace` (`MegaslidePagina2.jsx:471`).

**El que s'ha fet (18/9 a la nit)**: el `MegaStripePanel` ja **no importa ni
dibuixa** el `MegaColumn`. Com que la pàgina 2 és l'**únic** consumidor del
component, el camí del `MegaColumn` hi queda mort. L'espai de reserva es manté
amb un fill únic amb `aspect-ratio: 8.77 / 1` (`RESERVA_ASPECTE`), calibrat per
donar la mateixa alçada que el `MegaColumn` de debò.

**Per què `aspect-ratio` i no una alçada fixa**: la reserva **no** pot ser un
número. L'alçada del `MegaColumn` no escala igual a tot arreu (142 px a 1280,
142,5 a 1366, 144,1 a 1440, 113,6 a tauleta) perquè a desktop el belt s'encongeix
per sota de 1382. Un `aspect-ratio` sobre l'amplada del belt ho segueix sol.

**Verificació** (Chromium contra el 3003 viu, A/B amb el codi vell i el nou):

| | franja `top` vella → nova | desviació |
|---|---|---|
| 1280×800 | 272,48 → 272,78 | **+0,30 px** |
| 1920×1080 | 273,82 → 274,40 | **+0,58 px** |
| 1024×768 | 244,04 → 243,59 | **−0,45 px** |

- La graella de colors, el selector i les seves alçades no es mouen.
- `node scripts/compara-vistes.mjs` → **OK** (mateixes xifres que abans).
- `npx vitest run` → 439 proves; `npx vite build` → OK.
- A 1280 el contenidor de reserva medeix 133,76 px (abans 133,48) i té **1**
  fill; `grid-cols-9` dins de la pàgina 2: **0**.

**Atenció amb les captures**: el carrusel de la samarreta gran de sota canvia
d'estat segons el moment de la captura (dues execucions donen samarretes
diferents), i això contamina qualsevol comparació de píxels A/B. Per comparar
codi vell i nou, feu servir **mesures de geometria**, no imatges.

**Què s'ha mesurat de debò** (Chromium, contra el 3003 viu):

- El símptoma descrit («els selectors entren a la pantalla tallats a la
  dreta», x=1326 a 1280) **no s'ha pogut reproduir** a 1024, 1280, 1366, 1440
  ni 1920: cap selector dins de la finestra no passa de `window.innerWidth`.
  A 1280 hi havia **tres** còpies de `[data-stripe-buttonbar="bn"]`:
  - `x ∈ [35,5, 156,5]` — la de la pàgina 2 (`[data-p2-color-selector]`), visible;  - `x ∈ [45,9, 166,3]` — la del `MegaColumn` de la pàgina 2, `visibility: hidden`;
  - `x ∈ [-1234,1, -1113,7]` — una pàgina del carrusel muntada fora de pantalla.

  Amb el canvi fet, la del `MegaColumn` **ja no hi és** (`[data-stripe-buttonbar="bn"]`
  dins de la pàgina 2: només la visible).
- La sonda de sota **sola no val**: la còpia del carrusel té `right` negatiu i,
  amb `right > vw` sol, dona positiu fals. Cal filtrar per
  `visibility !== 'hidden'` **i** comprovar el costat esquerre.

```js
[...document.querySelectorAll('[data-stripe-buttonbar="bn"]')]
  .filter((e) => getComputedStyle(e).visibility !== 'hidden')
  .map((e) => e.getBoundingClientRect())
  .filter((r) => r.right > window.innerWidth && r.left > 0)
```

---

## 6.bis. La franja que partia la graella a la banda estreta — FET

**El símptoma** (el va veure l'amo a 1280×768): la graella de colors quedava
partida en dues meitats, amb els cercles a dalt i el COLOR/NEGRE dins de la
banda de samarretes, i tot arrambat a la franja.

**La causa**: el `transform: translateY(-15px)` de la franja, duplicat a
`MegaStripePanel.jsx` i `MegaStripePanelP1.jsx`. A la banda estreta el belt
s'ha encongit (1248 en comptes de 1350) i tot el bloc és més baix, però la
franja no; aquells 15 px deixaven el seu `top` **1,2 px per damunt** del
`bottom` de la graella de colors.

**La correcció**: el desplaçament passa a ser condicional:

```js
transform: (compactLandscape || esFranjaEstenya) ? 'none' : 'translateY(-15px)',
```

amb `esFranjaEstenya` = `innerWidth > 1024 && innerWidth <= 1366 && innerWidth >= innerHeight`.

**El llindar és 1025 i no 768 a posta**: 1024×768 també compleix «ample ≥ alt»
però és la tauleta apaisada, i la tauleta no s'ha de tocar. La primera versió
del predicat la incloïa i movia la franja 15 px a la tauleta; cal no repetir-ho.

**Verificació** (Chromium, A/B amb el codi vell i el nou; el Firefox de l'amo
dona les mateixes xifres que el Chromium, comprovat):

| mida | franjaTop | marge colors→franja | resultat |
|---|---|---|---|
| 768×1024 tauleta vertical | 292,8 | 15,0 | idèntic |
| 1024×768 tauleta apaisada | 243,4 | 14,6 | idèntic |
| 1280×800 | 272,8 → **287,8** | −1,2 → **+2,0** | arreglat |
| 1366×768 | 282,6 → **297,6** | −1,5 → **+1,0** | arreglat |
| 1381 / 1382 / 1440 / 1920 | 274,4 | 17,2 | idèntic |

- `npx vitest run` → 439 proves; `npx vite build` → OK;
  `node scripts/compara-vistes.mjs` → OK amb les mateixes xifres que abans.
- A la banda estreta els dibuixos surten una mica més grans (24,4 → 27,4 px a
  1280) perquè el recàlcul de l'escala aprofita l'espai alliberat.

**Atenció en mesurar**: el comparador prova el cas «1366» amb `hasTouch: true`,
que és **tauleta apaisada** (dibuix 19,89), no la banda estreta de desktop
(que fa 30). No són el mateix estat i no s'hi val comparar-los.

---

## 6.ter. La franja s'ajusta a l'alçada de la finestra — FET

**El símptoma** (overt, 18/9): «el header i el megaslide són de la mateixa mida
en un espai més petit». Amb una finestra de 706 px el panell feia 265 px (38%
de la finestra) i el que hi ha a sota ja no hi cabia.

**La causa**: tot el megaslide escala a partir de l'**amplada** (el belt de
1350) i **res no mirava l'alçada de la finestra**. La franja de samarretes, que
és la peça més alta, es quedava amb la mida de disseny dins d'un espai més
petit.

**La correcció** (`midesMegaslide.js`):

```js
factorAlcadaMegaslide(alcadaFinestra, esTauleta)  // 1 si tauleta; si no, clamp(alcada/800, 0.8, 1)
```

- S'aplica a l'**escala de la franja** i al seu **coixí de sota**, a les DUES
  pàgines amb el mateix valor.
- L'alçada del panell la segueix tota sola (surt del contingut de la pàgina 1) i
  també la reserva (`defaultBleedGuardHeight`), que es multiplica pel factor.
- **La detecció de tauleta es rep del dispositiu** (`isPortraitTablet ||
  isLandscapeTablet` de `useDeviceLayout`), NO s'inventa amb amplades i
  alçades: el primer intent la inferia i s'empassava el desktop (1280×800
  compleix `h ≤ 1100 && w > h`), i a més separava les dues tauletes.

**Mesures**:

| mida | franja | panell | panell / finestra |
|---|---|---|---|
| 1280×706 | 132,2 → **116,6** | 265 → **249** | 38% → **35%** |
| 1280×768 | 132,2 → **126,9** | 265 → **259** | 35% → **34%** |
| 1280×800 | 132,2 | 265 | 33% (igual) |
| 1366×768 | 141,9 → **136,2** | 284 → **278** | 37% → 36% |
| 1440×900 / 1920×1080 | 141,9 | 261 | igual |
| 1024×768 i 768×1024 tauleta | 100,4 / 101,6 | 205 / 227 | **identics** |

- `node scripts/compara-vistes.mjs` → OK amb les xifres originals;
  `npx vitest run` → 439 proves; `npx vite build` → OK.

---

## 6.quater. La filera de dalt, quadrada amb la pàgina 1 — FET

**El símptoma** (overt, 18/9): en canviar entre la pàgina 1 i la 2, el selector
Blanc/Color/Negre i els cercles de color no quedaven a la mateixa alçada.

**Les xifres** (1280×706, pàgina 1 vs pàgina 2):

| | pàgina 1 | pàgina 2 | diferència |
|---|---|---|---|
| selector (botó COLOR) | 171,1 | 209,1 | **+38,0 px** |
| selector a 1366×768 | 174,1 | 212,9 | +38,8 |
| selector a 1440×900 | 164,7 | 173,4 | +8,7 |

**La causa**: a la pàgina 1 la filera de dalt viu dins del `MegaColumn` i a la 2
en blocs absoluts propis, i el `top` de partida és 38 px més baix.

**El parany (important per al proper cop)**: la posició d'aquesta filera **no la
decideix cap `top`**, la decideixen dos bucles d'auto-calibratge:

1. `alignTopRowToPage1` (`MegaslidePagina2.jsx:208`) iguala el selector de la 2
   amb el de la 1.
2. `centraAmbLaGraellaDeColors` (línia 247) centra el selector amb la graella
   de colors.

El segon mana: el selector acaba clavat al centre de la graella de colors.
**Desplaçar el `top` del `CercadorTextRow` no serveix** — el primer bucle ho
compensa i la filera torna al mateix lloc (comprovat: el contenidor es movia de
132,8 a 170,8 i la graella no es movia de 172,8).

**La solució**: desplaçar **el contenidor de la graella de colors** (40 → 2 px
a la banda estreta). La graella puja, i el segon bucle hi centra el selector
tot sol. El contenidor viu a `CercadorTextRow` i es controla amb la prop
`desplacamentVertical`.

**Verificació**:

| mida | delta del selector | franja | panell |
|---|---|---|---|
| 1280×706 | **0,0 px** | 287,8 (=) | 249 (=) |
| 1280×800 | **0,0** | 287,8 (=) | 265 (=) |
| 1366×768 | **0,8** | 297,6 (=) | 278 (=) |
| 1440 / 1920 | 8,7 (igual que abans) | 274,4 | 261 |
| 1024×768 i 768×1024 tauleta | igual que abans | igual | igual |

- Comparador **OK**, 439 proves, build OK.
- **`isLandscapeTablet` s'ha d'excloure a posta**: 1024×768 també compleix
  «ample ≥ alt» i és tauleta; incloure-hi-la li baixava la filera 38 px (el
  comparador no ho caça perquè no mira aquesta alçada, però es veu a l'ull).

---

## 8. El sistema de mesura, unificat (18/9, sessió llarga)

**El problema de fons** (que va fer impossible el canvi de «baixa-ho 20 px»):
la posició de les peces del megaslide no la decidia cap estil, sinó **sis bucles
de retroalimentació** que es llegien i es reescrivien els uns als altres
(`pageLift`, `alignTopRowToPage1`, `centraAmbLaGraellaDeColors`, `midesGraella`,
`p1ContentBottomPx`, `guardHeightPx`). Cap peça tenia posició pròpia i el
resultat depenia de l'ordre i del moment en què arribaven les mesures. Tres
intents de tocar-ho van acabar pitjor que no tocar res.

**El que s'ha fet** (4 commits, cada un verificat):

| | què | on |
|---|---|---|
| Fase 0 | mòdul de mesura única + script de regressió + baseline de **833 xifres** | `src/utils/mesuraMegaslide.js`, `scripts/mesura-megaslide.mjs`, `tests/baseline-megaslide.json` |
| Fase 1.1 | el càlcul de la graella (43 línies) surt de l'efecte i és **funció pura** | `src/components/fullwide/midesGraella.js` |
| Fase 1.2 | els **dos bucles de la pàgina 2** (alineació + centratge) són **un sol efecte** | `MegaslidePagina2.jsx` |
| Fase 1.3 | objectiu del `pageLift` i **alçada del panell**, funcions pures | `mesuraMegaslide.js` |

**Ordres noves**:
```bash
npm run mesura:megaslide           # comprova les 833 xifres contra la baseline
npm run mesura:megaslide:captura   # desa la baseline
npm run mesura:megaslide:detall    # imprimeix totes les xifres
```

**Mètode que funciona** (i el que no): els bucles **no es poden traduir a una
fórmula d'una passada** — convergeixen per iteracions, i el seu resultat depèn
de l'ordre. Cal **traduir-los fidelment** (mateixes fórmules, mateix ordre,
mateix llindar de 0,5 px) i deixar que el detector digui si és equivalent. Els
dos intents de «fer-ho més net d'una passada» van donar desviacions de 10 a
100 px.

**El que queda bé**: tota la lògica de mesura viu ara en funcions pures amb
**15 proves d'unitat** que la fixen. Els components només mesuren el DOM i hi
criden.

**El que es queda expressament**: el valor d'alçada desat al `localStorage`
(`hg.megaPanelHeight.v1`). És un pegat per evitar el «rebot» en obrir (la mesura
del contingut va canviant: 476 → 456 → 417). Treure'l canviaria un pegat per un
salt visible, que és pitjor. Està documentat al codi.

### El senyal d'èxit, comprovat

Amb el sistema unificat, **els 20 px ja són un sol número**. Canviant l'objectiu
del `pageLift` de 10 a 30 a la banda estreta, totes les peces baixen exactament
20 px alhora i les relacions internes es conserven:

| | abans | objectiu +20 |
|---|---|---|
| selector p1 | 50,10 | 70,10 |
| selector p2 | 50,13 | 70,13 |
| graella de colors | 13,78 | 33,78 |
| franja p1 | 166,48 | 186,48 |
| franja p2 | 166,78 | 186,78 |
| panell | 314 | 334 |
| deltes | 0,04 / 0,30 / 0 | **iguals** |

**Però atenció**: aquesta palanca **també mou la tauleta apaisada** (1024×768
compleix «ample ≥ alt»), i allà la franja i el panell no quadren amb la resta.
Si es volen els 20 px, cal protegir la tauleta amb `esTauleta` (la detecció del
dispositiu) **i** passar la prop `isLandscapeTablet` a `MegaStripePanelP1`, que
avui no la rep. Aquella via es va provar i movia l'alçada del panell de la
tauleta; cal una altra via per a ella.

**Parany que el detector ha caigut sol**: fer servir `isLandscapeTablet` a
`MegaStripePanelP1` sense que la prop existeixi trenca l'aplicació sencera
(«isLandscapeTablet is not defined»). El detector ho va caçar de seguida perquè
la mesura sortia tota buida a 1920.

### Els 20 px, aplicats (i la tauleta estabilitzada)

Fet amb **un sol número** a `deltaObjectiuPageLift`, que ara distingeix tres
casos:

| cas | desplaçament |
|---|---|
| banda estreta de desktop | 10 + 20 de marge = **30 px** |
| les dues tauletes | **10 px** (com sempre) |
| resta de desktop | **0** |

`esTauleta` arriba del dispositiu via la prop `isLandscapeTablet`, que
`MegaStripePanelP1` no rebia (això era el que impedia protegir la tauleta).

Resultat a la banda estreta (1280×706): selector de les dues pàgines, graella
de colors i les dues franges baixen **exactament 20 px** alhora, i els deltes es
conserven. El panell passa de 314 a 334 px.

**La tauleta no es mou gens**: 768×1024 i 1024×768 donen les mateixes xifres
que abans del canvi (comprovat xifra a xifra contra la baseline anterior).

**Parany d'aquesta passa**: `esTauleta` no arribava a la funció pura perquè els
meus `git checkout` de proves la van deixar sense el paràmetre, i el cridador
sí que el passava. Símptoma: la tauleta es movia igual. Amb una **sonda
temporal** dins l'efecte (que ara ja no hi és) es va veure que la prop sí que
arribava i que el problema era la signatura de la funció. Conclusió: quan una
prop «no fa res», comprovar que la funció la rep abans de culpar el component.

---

## 9. Pendents

1. **Pujar els commits**: n'hi ha **23** de pendents (`git log --oneline origin/main..HEAD`),
   més aquest testimoni.
   Inclouen la feina bona del cercador, la home i l'escala de tauleta, més els
   reverts de l'escala de desktop. **Demanar-ho abans de fer-ho.**
2. **El mòbil**, que es farà a part (l'amo ho va dir així).
3. **El cistell i el checkout** tenen la seva pròpia detecció de tauleta per
   amplada (`CistellComandaContent.jsx`, `CheckoutContent.jsx`,
   `CheckoutPage.jsx`, `MegaMenuPanel.jsx`): es va decidir no tocar-ho encara.
4. **Deixalla petita**: després del punt 6, el `MegaslidePagina2` encara passa al
   `MegaStripePanel` una colla de props que només feia servir el `MegaColumn`
   (`resolvedMega`, `megaTileSelectorParams`, `onStartSelectorDrag`,
   `reorderAustenQuotes`, `austenSelectedDisableMulti`…). No fan cap mal, però
   es poden retallar quan es torni a la pàgina 2.
5. **El «sobredimensionat»**: el primer pas està fet (punt 6.ter: la franja
   s'ajusta a l'alçada). Si encara es veu gros, les palanques que queden són la
   mida de la graella (avui només depèn de l'amplada) i el nombre de files.
6. **Els 20 px de marge a la banda estreta** (el canvi que va obrir tota aquesta
   feina): amb el sistema ja unificat, ara hauria de ser factible. Cal mesurar
   quin efecte té sobre les dues files i la franja, i validar-ho amb l'amo.
