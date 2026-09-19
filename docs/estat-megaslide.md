# Estat del megaslide — testimoni per a la propera sessió

Data: 18 de setembre de 2026 (nit). Aquest document és un **testimoni**: explica
on és la feina, què funciona, què no s'ha de tocar i on s'ha de continuar.
Es pot esborrar quan s'hagi tancat el tema.

---

## 1. Com treballa l'amo (important)

- Tot en **català**: codi, comentaris, commits i conversa. **Les normes de
  llengua que manen són al punt 9.bis** (llegeix-lo abans d'escriure text
  d'interfície: botons en imperatiu singular, segona persona del singular, mai
  el pronom *tu*).
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
npx vitest run                    # proves d'unitat (462)
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

### El marge de 20 px, final (i el doble comptatge)

L'amo va veure a l'ull que la pestanya havia crescut més del compte: passava de
346 a 386 px, no a 366. **Els 20 px es comptaven dues vegades**: el marge
s'aplicava a l'alçada del panell I el desplaçament del contingut també feia 20.
Com que la mesura del contingut de la pàgina 1 es pren DESPRÉS del
desplaçament, el panell creixia 20 per la filera i 20 més pel marge.

Arreglat traient el marge de la fórmula de l'alçada. I el desplaçament s'ha
simplificat a **una sola regla**: el contingut (filera i franja, a les dues
pàgines) baixa 20 px a **tot l'escriptori**, i 0 a les tauletes i al mòbil.

| mida | panell | aire sota la franja | delta franges |
|---|---|---|---|
| 1280×768 | 354 | 30,3 | 0,3 |
| 1440×900 | 366 | 30,7 | 0,6 |
| 1920×1080 | 366 | 30,7 | 0,6 |
| tauletes | igual que sempre | igual | igual |

**Lliçó**: quan una mesura es pren *després* d'un desplaçament, el desplaçament
ja hi és a dins. Sumar-lo també a la fórmula el compta dues vegades.

**I una altra lliçó, d'aquesta tanda**: les mesures **relatives al panell** no
serveixen per comprovar si el contingut s'ha mogut, perquè el panell es mou amb
ell. Cal mesurar en **coordenades absolutes de finestra**. L'amo ho va veure
abans que jo.

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

---

## 9.bis. La llengua: quins documents manen

**Ordre de prioritat** (el mes nou mana). Si dos documents es contradiuen, guanya
el de data mes recent:

| data | document | que hi ha |
|---|---|---|
| **2026-09-15** | `docs/guia-pronoms-febles.md` | pronoms febles: formes, posicio, combinacio i errors frequents |
| **2026-09-13** | `docs/norma-linguistica-vigent.md` | **LA NORMA VIGENT**: tractament al client, botons, idioma, subjecte eliptic, llenguatge tecnic, convencio d'adreces |
| 2026-01-23 | `project-logs/LANGUAGE/ortografia-gramatica-catala.v1.2.yml` | memoria operativa d'ortografia i gramatica (IECC), per carregar al principi de sessio |
| 2026-01 | `project-logs/LANGUAGE/2026-01-*.md` | quatre registres de treball de llengua |

**Substitueixen** aquests dos, que es conserven nomes com a historial i **no
s'han d'aplicar**:
- `norma_tu_vos_catala.txt` i `ux_norma_ellipsis_imperatius.txt`: contenien
  regles d'us de «vos» i de botons en imperatiu plural que **no s'apliquen**.

**Els tres punts que mes es trenquen** (de `norma-linguistica-vigent.md`):
1. **Segona persona del SINGULAR**, i mai el pronom *tu* ni cap subjecte
   explicit: *«La teva comanda»* si, *«Tu tens 14 dies»* no.
2. **Botons en imperatiu SINGULAR**, mai infinitiu: *Desa* (no *Desar*),
   *Confirma* (no *Confirmar*), *Afegeix* (no *Afegir*).
3. **Nomes catala**, sense castellanismes ni els disfressats.

---

## 10. L'escala proporcional del megaslide (18/9, sessió llarga)

**La idea de l'amo**: 1920×1080 és la versió principal, i la resta de formats
n'han de ser una **adaptació escalada**. El mòbil es fa a part. Si el belt és
una proporció de la finestra, tot el que en depèn escala sol.

**El que hi havia**: tres fonts de mida que no parlaven entre elles.
- la graella de dibuixos mesurava l'amplada de la seva columna (s'adaptava);
- la franja de samarretes sortia de `megaTileSize` (no s'adaptava);
- el belt era `min(1350px, vw - 32px)`, amb un sostre fix.

**El que s'ha fet** (`6fc126f` i `3484719`):
- `escalaMegaslide(beltWidth)` i `getBeltWidth(vw)` a `layoutMetrics.js`: **una
  sola font**. El belt és el 70,3% de la finestra (1350 sobre 1920).
- `--hg-escala-mega` es publica des de `FullWideSlideHeader` (qui mesura el
  belt) i la franja el multiplica a la seva escala, a les DUES pàgines.
- `--page-band-belt-width` i el fallback de l'amplada dels panells ja no tenen
  el 1350 fix: son `70.3vw`.
- **La tauleta no s'escala mai** (té les seves alçades i el seu belt de 992). La
  decisió es pren amb `isPortraitTablet || isLandscapeTablet` (el dispositiu),
  **no amb l'amplada**: 1280×768 és desktop i també compleix «ample ≥ alt», i la
  primera versió de la condició li aplicava la branca de tauleta.

**Les proporcions, que és el que es volia**:

| vista | belt | franja alt | franja ÷ belt | dibuix |
|---|---|---|---|---|
| 1920×1080 | 1350 | 141,9 | **0,105** | 30 |
| 1440×864 | 1013 | 106,4 | **0,105** | 19,78 |
| 1280×768 | 900 | 84,6 | 0,094 | 16,14 |
| 1024×768 tauleta | 992 | 100,4 | 0,101 | 19,89 |

Les bandes de pàgina també escalen (related: 417 → 332 → 303; transition:
819 → 476 → 362).

### Els marges interns (10.1) — FET

**El símptoma**: a 1920 el bloc de dibuixos quedava amb 168 px de marge a
l'esquerra del belt i 288 a la dreta. No és que «no quadrés amb el belt»: eren
**dues** desalineacions que se sumaven.

1. **El bloc de dibuixos anava 52,5 px massa a l'esquerra.** La filera té, a la
   dreta dels dibuixos, la columna de colors i la llista de col·leccions, que
   fan 240 px (78 + 10 + 142 + 10). Amb el marge esquerre de 135 px (105 + els
   30 de `leftOffset`) el bloc mai no podia quedar centrat: la diferència era
   exactament 240 − 135 = 105 px. La regla és **marge esquerre + desbordament
   dret = 240**, i ara són 187,5 + 52,5 a
   `midesGraella.js` (`MARGE_ESQUERRA_DIBUIXOS_ESCRIPTORI_PX`,
   `DESBORDAMENT_DRET_DIBUIXOS_ESCRIPTORI_PX`), amb una prova d'unitat que ho
   fixa. El `leftOffset` de `CercadorTextRow` s'ha retirat (només el passava
   `MegaslidePagina2` amb un 30 constant).
2. **El belt del megaslide anava 7,5 px a l'esquerra del belt de la pàgina.**
   `scrollbar-gutter: stable` a `<html>` reserva l'amplada de la barra de
   desplaçament (15 px) encara que no n'hi hagi: el cos fa 1905 px i la
   finestra 1920. El marc del lloc (`SiteFrame`, `belt2`, `--site-xL`) es
   centra sobre la **finestra**; la capa del megaslide es penja d'un contenidor
   centrat al **cos** (`MegaStripeBleedGuard`, dins del `mx-auto max-w-[1350px]`)
   i queia mitja reserva a l'esquerra. `SiteFrame` publica ara
   `--site-gutter-mig` (mitja reserva) i la capa la suma:
   `left: calc(50% + var(--site-gutter-mig, 0px))`.

**Xifres** (Chromium, contra el 3003 viu; belt del megaslide = `--hg-mega-x`):

| vista | belt | dibuixos (abans) | marges ara | llista, més enllà del belt |
|---|---|---|---|---|
| 1920 | 1350 | [453, 1347] | **228 / 228** | 24 px (245 de la vora) |
| 1440 | 1013 | [371, 949] | **217,9 / 217,9** | 34 px |
| 1280 | 900 | [344,5, 815,5] | **214,5 / 214,5** | 38 px |
| tauletes | 992 | igual | igual | igual |

- **Cap mida no canvia**: dibuix 30 / 19,78 / 16,14; cap `top`, `bottom`,
  `height` ni `width` es mou. El diff de les 833 xifres és **només**
  horitzontal: +7,5 px a tot (la reserva) i +60 px (= 52,5 + 7,5) a la graella
  de dibuixos, els cercles i la llista. La baseline s'ha tornat a capturar.
- El conjunt de la filera (selector → llista) queda ara 25,5 px a la dreta del
  centre de la finestra: és el preu de centrar els dibuixos amb la llista a la
  seva dreta. El selector de la pàgina 2 es va quedar a 27 px del belt i els
  dibuixos a 228 (una separació de 70 px); a la pàgina 1 s'hi ha fet el mateix
  (punt 10.2).
- Les tauletes només es desplacen els 7,5 px de la reserva (a vertical, a més,
  recuperen els 7,5 px que quedaven tallats a l'esquerra); les seves mides i
  alineacions no es mouen, i el comparador segueix donant OK.

### La pàgina 1, proporcional (10.2) — FET

L'amo ho va demanar abans de continuar amb la pàgina 2: «has de fer la pàgina 1
ben feta a tots els formats». El que hi havia:

- La **graella de 9 columnes** (el MegaColumn de la pàgina 1) ja escalava: fa el
  94% del belt i el tile passava de 131 px (1920) a 84 (1280). Però la
  **separació de 12 px** entre columnes era fixa i es menjava el 4% del tile a
  1280 (84 en comptes de 87,3).
- La **franja de colors** (les samarretes) era el gros: feia el **98% del belt a
  1920 i només el 74% a 1280**, i a 1440-1366 la de la pàgina 1 era **més
  estreta que la de la pàgina 2** (820 contra 1017 px a 1280).
- El bloc de dibuixos de la pàgina 1 arrencava a 182,7 px del belt; el de la
  pàgina 2, a 228. En canviar de pàgina, el bloc saltava 45 px.

**Què s'ha fet**:

1. **La franja s'escala per la seva mida, no pel `transform`.** La filera de la
   franja té l'alçada de disseny (`stripePreviewHPx` = 117, el tile de 1350 per
   0,9) i el seu `transform` només hi aplica `megaStripeScale × fitAlcada`; la
   mida de DISSENY s'escala amb `cssEscalaMega` (`calc(px ×
   var(--hg-escala-mega))`, nou a `layoutMetrics.js`). Abans l'escala anava dins
   del `transform`: la franja es veia bé però la seva caixa de layout no
   s'encongia i el panell quedava 8-31 px massa alt.
   - `stripePreviewHPx` ja no surt de l'amplada del panell (que es queda a 1350
     fins que la finestra baixa de ~1430): a l'escriptori és sempre el valor de
     disseny. A tauleta es manté la calibració pròpia.
   - La filera de la pàgina 1 no s'ha d'encongir per encabir-se al contenidor
     (`flexShrink: 0`): era el que la deixava a 820 px a 1280 quan la de la
     pàgina 2 en feia 1017.
2. **La separació de les 9 columnes** és `calc(12px × escala)` (`GAP_X_PX`).
3. **El bloc de dibuixos cau on cau el de la pàgina 2**: la graella es
   desplaça 45,25 px (escalats) a la dreta. La botonera Blanc/Color/Negre, que
   viu dins la graella, es desfà aquell desplaçament i torna a 27 px del belt,
   com la de la pàgina 2 (abans quedava a 40,5 i 13,5 px a la dreta).
4. **La reserva de la pàgina 2** (el buit que substitueix el MegaColumn) passa
   de `aspect-ratio: 8,77` a una alçada calculada amb la fórmula del MegaColumn
   (`RESERVA_ALCADA`): el tile és `(belt − 8 separacions) / 9`, més el marge de
   dalt del botó (8 px) i el descendent de la seva línia (~5,96 px). Amb
   l'`aspect-ratio` fix, en escalar-se la separació la reserva quedava 4 px
   curta i les franges de les dues pàgines es desquadraven.

**Xifres** (Chromium contra el 3003 viu, tot en % del belt):

| vista | tile | franja ample | franja alt | delta franja p2−p1 |
|---|---|---|---|---|
| 1920 | 0,097 | 0,981 | 0,105 | **−0,06** |
| 1440 | 0,097 | 0,981 | 0,105 | **−0,06** |
| 1366 | 0,097 | 0,942 | 0,101 | **−0,06** |
| 1280×800 | 0,097 | 0,981 | 0,105 | **−0,05** |
| 1280×706 | 0,097 | 0,981 | 0,093 | **−0,05** |
| 1024 i 768 tauleta | 0,094 | 0,947 / 0,925 | 0,101 | −15,2 / −0,3 |

- La franja de 1366 i de 1280×706 queda curta perquè hi actua `fitAlcada` (la
  finestra fa 768 i 706 px): és l'ajust d'alçada volgut, no un desescalat.
- El delta franja p2−p1 passa de −0,7/+0,6 a **−0,06 a totes les mides**.
- El panell creix el que ha de créixer (la franja és més gran): 1280×800 passa
  de 277 a 287 px.
- **A 1920 només es mouen dues coses**: el bloc de dibuixos (+45,3 px, el que
  es volia) i el selector (−13,5 px, de 40,5 a 27 px del belt). La resta de les
  833 xifres no es mouen. **A tauleta, cap**: 0 xifres.
- Baseline tornada a capturar; comparador OK amb les xifres de sempre.

**El que encara no s'ha tocat de la pàgina 1** (ho ha dit l'amo: primer la 1,
després la 2):

- El **selector de la pàgina 2** no s'escala (a 1280 fa 121 px i el de la
  pàgina 1 en fa 87). No es pot escalar sense tocar el bucle
  `alignTopRowToPage1`: alinea el botó Color de les dues pàgines amb
  `topVisualAlignmentY`, que **també mou la filera de dibuixos de la pàgina 2**;
  en encongir-se el selector, la filera baixa 11 px i deixa de quadrar amb la de
  la pàgina 1. Cal separar les dues coses primer.
- Els **espais verticals** de la pàgina 1 (el `mt-2` de 8 px dels tiles, els
  -15/+20 px de la franja, `FRANJA_AJUST_PX`): són px fixos i, a 1280, deixen
  ~10 px més d'aire entre els dibuixos i la franja del que tocaria. No s'han
  escalat perquè el `FRANJA_AJUST_PX` i el `visualOffsetY` són compensacions
  entre les dues pàgines (tocar-los desquadra les franges) i el `mt-2` canvia
  l'alçada de la filera, que la reserva ha de seguir.
- Les **tipografies** (14 px del selector, 11 px de les llistes) no s'escalen.

**Paranys apresos (pàgina 1)**:

- `transform: translate(a) scale(s)`: el `translate` va **abans** del `scale`, o
  sigui en px del pare. Per això el desplaçament de 45,25 px no el multiplica el
  0,94 del contenidor, i en canvi el `marginTop` de 8 px dels tiles sí.
- Un **marge negatiu en una cel·la de graella l'engrandeix** (la cel·la del
  selector va passar de 131 a 189,7 px). Per desplaçar-la sense deformar-la,
  `transform`.
- La **reserva** de la pàgina 2 va dins del contenidor escalat al 0,94: la seva
  alçada s'ha d'expressar en px de layout (si s'hi posa l'alçada visible, queda
  0,94 vegades curta).
- El **descendent de la línia** del botó (`inline-block`) afegeix ~5,1 px
  d'alçada visible que no són ni el marge ni el tile: és el que feia que la
  reserva no quadrés.

### El carril (10.3) — FET a la pàgina 2

L'amo ho va dir així: «la meva intenció era que tot estigués en un carril central
amb uns marges als costats per poder-se adaptar als diferents formats». El carril
ja existia (el belt, 70,3vw, centrat), però **les peces no en sortien**: cada
posició era un px calibrat a 1920 i cada format portava el seu pedaç. Ara hi ha
dues funcions que ho expressen (`layoutMetrics.js`):

```js
carrilPct(px)  // per a propietats de layout quan el contenidor ja és el carril
carrilPx(px)   // per a la resta (transforms, marges, alçades): calc(px × escala)
```

`carrilPx` i `carrilPct` són la mateixa cosa dit de dues maneres (`px ×
belt/1350`), i a tauleta valen 1 perquè **el seu disseny és a part** (992 px
calibrats a mà: el seu tile fa 0,0943 del carril, no 0,097).

**Què s'ha passat al carril** (abans px de la finestra):

| peça | abans | ara |
|---|---|---|
| contenidor de la filera (p2) | 94% del belt | **100% del carril** |
| marge esquerre dels dibuixos | 187,5 px dins del 94% | **16,8889% del carril** (228) |
| desbordament dret | -52,5 px | **-0,8889%** (-12) |
| columnes (colors i llista) | 78 px / 142 px | `carrilPx` (5,78% / 10,52%) |
| separació de columnes | 10 px | `carrilPx` (0,74%) |
| selector B/N/C (p2): x i mida | 27 px i `megaTileSize` del panell | `carrilPx` (2% i 9,66%) |
| tile dels dos selectors | sortia de l'amplada del panell | `megaTileSize` de DISSENY (1350) |

**Resultat** (tot en % del carril, Chromium contra el 3003 viu):

| vista | tile p1 | selector p2 | graella de dibuixos p2 | dibuix p2 |
|---|---|---|---|---|
| 1920 | 0,097 | 0,0966 | 0,6622 | 30 |
| 1440 | 0,097 | 0,0966 | 0,6623 | **23** (abans 19,78) |
| 1366 | 0,097 | 0,0966 | 0,6623 | 22,3 |
| 1280 | 0,097 | 0,0966 | 0,6623 | **20,4** (abans 16,14) |

- **A 1920 i a tauleta no es mou res** (0 de les 833 xifres): 1920 és la
  referència i les tauletes tenen el seu disseny.
- El selector de la pàgina 2 s'encongeix amb el carril: a 1280 fa 87 px (abans
  121) i queda **2,7 px** del de la pàgina 1 (abans 23 px de diferència).
- El dibuix de la pàgina 2 ja fa el que toca a 1280 (20,4 en comptes de 16,14:
  el punt 10.3 que quedava pendent).
- El comparador fallava per **una dècima** en la comparació de files de dibuixos
  i de colors: ara aquella comprovació té tolerància de 0,5 px (les files surten
  de fórmules distintes i, en escalar-se, l'arrodoniment les separa dècimes).

### El header, al carril (10.4) — FET

El header era l'única peça que no hi era: la seva fila s'ancorava al **marc del
lloc** (`--site-w` = `min(1350, 100vw − 32)`) i no al carril (70,3vw). A 1440 el
marc feia 1350 px i el carril 1013 → el logo queia **128 px a l'esquerra** del
contingut del megaslide; a 1280, 1264 contra 900.

Ara la fila del header fa `width: var(--hg-mega-w)` i
`marginLeft: var(--hg-mega-x)`, i el seu coixí (40 px), la separació de la fila
(12 px) i la del nav (16 px) són mides del carril (`carrilPx`). A tauleta es
queda amb el marc del lloc: allà el carril fa 992 px, és més ample que la
pantalla i el header no s'hi pot desplaçar.

| vista | carril | fila del header (abans) | logo |
|---|---|---|---|
| 1920 | [285, 1635] | [285, 1635] (=) | 325 (=) |
| 1440 | [213,5, 1226,5] | [45, 1395] → **[214, 1227]** | 85 → **244** |
| 1366 | [203, 1163] | [16, 1350] → **[203, 1163]** | 56 → **231** |
| 1280 | [190, 1090] | [16, 1264] → **[190, 1090]** | 56 → **217** |
| 1024 i 768 tauleta | 992 / 992 | igual | igual |

Dos ajustos que calien perquè el text del nav (que **no** s'escala) hi cabés:

- El nav porta un `translateX(-5%)` d'ajust òptic. Dins el carril, a la banda
  estreta (768-1366) no hi té marge i el posava sota el logo (la «F» de FIRST
  CONTACT quedava tallada a 1280). Allà el desplaçament és `none`.
- El nav tenia `overflow-hidden`: a l'escriptori se li ha tret, perquè quan el
  contingut va 2 px just no es talli la primera lletra (no arriba a tocar ni el
  logo ni les icones, que tenen 5 px de coixí).

**Forat de les eines**: ni el mesurador (`npm run mesura:megaslide`, que només
mira peces del megaslide) ni el comparador miren el header. La comprovació
d'aquesta passa ha estat una sonda pròpia i captures a 1280 i 1440
(`docs/comparacio/megaslide-header-*.png`).

**Correcció (mateixa nit)**: el conjunt que s'ha de centrar dins el carril és
el de la pàgina 2 **sencer** (selector → llista de col·leccions), no els
dibuixos. Amb els dibuixos centrats (228/228), les 240 px de la columna de
colors i la llista empenyien tot el bloc cap a la dreta: la llista sortia del
carril (12 px la seva columna i 24 px el text) i la meitat esquerra quedava
buida. La filera ha tornat a la posició del disseny, expressada com a proporció
del carril: **13% a l'esquerra i 3% a la dreta**, o sigui el selector a 27 px i
la llista a ~28 px de l'altre extrem, tot dins el carril.

I a la **pàgina 1** s'ha tret el `translateX(45,25 px)` que quadrava la seva
graella amb la de la pàgina 2: movia tota la filera (dibuixos, colors i
col·leccions) cap a la dreta. Ara la graella fa el 94% del carril centrat i
prou; el bloc arrenca al 13% del carril, que és on arrenca també el de la
pàgina 2 (7 px de diferència, com al disseny). El selector de la pàgina 1 torna
a la seva columna (3% del carril), i el de la 2 es queda al 2%.

Conseqüència que queda apuntada: com que **el text no s'escala** (ho va triar
l'amo), a 1280 i 1366 la llista de col·leccions fa 17 i 11 px més que la seva
columna i el seu text surt una mica del carril. Per tancar-ho caldria donar a
aquella columna una amplada mínima (i llavors la graella de dibuixos s'encongiria
una mica en aquelles mides) o escalar el text.

### La filera de la pàgina 2, al carril també a tauleta (10.5) — FET

L'amo ho va veure: a la tauleta horitzontal la graella de la pàgina 1 «és una
mica més ampla». No ho era (fa el 94% del carril a tots els formats i les seves
columnes cauen al 13,5%-86,5% igual que a 1920): el que passava és que **la
filera de la pàgina 2 tenia el seu propi pedaç a tauleta** (les columnes
78/142/10 px no s'encongien amb el carril, i el contenidor era el 94%), de
manera que la seva graella de dibuixos feia el **57% del carril** en comptes del
66,2% i la llista acabava al 95,2% en comptes del 97,9%. Vist així, la graella
de la 1 «sobrava» 17 px per la dreta.

Ara la filera de la 2 surt del carril **també a tauleta**: `carrilLane(px)`
(`layoutMetrics.js`) és com `carrilPx` però sempre proporcional al carril
(`calc(var(--hg-mega-w) × px/1350)`), i el contenidor és el carril sencer a tots
els formats. Les mides que tenen calibració pròpia de tauleta (els dibuixos, el
selector, la franja) **no** es toquen: es continuen pintant amb `carrilPx`.

| pàgina 2, % del carril | 1920 | 1024/768 tauleta (abans) | tauleta ara |
|---|---|---|---|
| selector | 2% | 2,7% | **2%** |
| graella de dibuixos | 13% / 66,2% | 13,4% / 57,4% | **13% / 66,2%** |
| dibuix (mida) | 30 | 19,89 | 19,89 (=) |
| columna de colors | 79,2% | 75,8% | **79,2%** |
| llista, final | 97,9% | 95,2% | **97,8%** |

A l'escriptori no es mou res (allà `carrilLane` i `carrilPx` són la mateixa
cosa). Les dues orientacions de tauleta donen xifres idèntiques, el comparador
segueix OK amb les mateixes mides (dibuix 19,89, cercle 18,89) i la baseline s'ha
tornat a capturar.

### La franja central del header (10.6) — FET

L'amo la va definir: **la fila del selector, les graelles i la columna de
col·leccions han d'encaixar exactament entre el `left` del logo del header i el
`right` de la icona d'usuari**, a totes les vistes menys la vertical i el mòbil.
La franja és doncs el contingut de la fila del header: [325, 1595] a 1920, amb
el coixí de 40 px de disseny a cada banda.

- **El selector** arrenca amb el mateix coixí que la fila del header
  (`carrilPx(40)`): el `left` del logo i el del selector coincideixen a totes
  les mides (0 px de diferència).
- **La llista** s'enrasa a la dreta de la seva columna. Abans la columna era
  `fit-content` i el conjunt es desplaçava 45 px, i per això el text acabava
  12 px més enllà de la franja. Ara el text acaba exactament on acaba la
  columna, i la columna no s'encongeix més que el nom més llarg
  (`minmax(min-content, …)`: qui cedeix espai, si cal, és la graella de
  dibuixos).
- **El marge dret de la filera** és el mateix coixí (`carrilPx(40)`, no `%`: a
  tauleta 40 px són el 4% del carril i no el 3%, i amb `%` no quadrava).
- **El gap de la fila del header** baixa de 12 a 6 px de disseny: a 1280 el nav
  demanava 5,5 px més dels que li deixaven el logo i les icones, i la icona
  d'usuari queia 5,5 px més enllà de la franja. Com que el nav va centrat, el
  gap no es veu: només li canvia l'espai disponible.

| vista | franja del header | selector vs logo | llista vs icona |
|---|---|---|---|
| 1920 | [325, 1595] | 0 | 0 |
| 1440 | [244, 1197] | −0,5 | +0,5 |
| 1366 | [231,4, 1134,6] | 0 | 0 |
| 1280 | [216,7, 1063,3] | 0 | 0 |
| 1024 tauleta apaisada | [56, 968] | 0 | 0 |
| 768 tauleta vertical (exclosa) | [40, 728] | 0 | −224 |

Tambe s'ha **estabilitzat el bucle `centraAmbLaGraellaDeColors`** amb una segona
passada de repàs (600 ms): abans oscil·lava 1,8 px entre execucions i la mesura
fallava de manera intermitent; ara el selector queda clavat al centre de la
graella de colors (delta 0) sempre.

### Els gaps dels dibuixos cedeixen l'espai (10.7) — FET

A 1440 i 1280 la columna de col·leccions queia sobre la graella de colors. El que
ha de cedir és el dibuix, no la llista (ho va dir l'amo):

- **`midesGraellaCompacta`**: el dibuix té la mida de disseny escalada amb el
  carril (`base x escala`) i el que s'encongeix **primer** són les separacions;
  només si arriben a zero es redueix el dibuix. Abans es reduïen totes dues
  coses alhora, i per això a 1280 el dibuix queia a 19,67 en comptes de 20 i els
  gaps quedaven grans.
- **La llista** rep un coixí per l'esquerra igual al que la graella de colors
  sobreïx de la seva columna (més el desplaçament de +10 px de la banda estreta),
  de manera que el text no hi cau a sobre encara que la seva columna sigui justa
  la mida del text.

| vista | dibuix | gapH | solapament cercles → llista |
|---|---|---|---|
| 1920 | 30 | 26,33 | −10 |
| 1440 | 22,5 | 18,78 | −7,5 |
| 1366 | 21,33 | 16,91 | 0 |
| 1280 | 20 | 15,39 | 0 |
| tauleta | 19,89 | 17,91 | −7,4 |

(negatiu = els cercles acaben abans que comenci el text; a 1366/1280 es toquen)

A 1920 i a tauleta no es mou res: el dibuix i el gap de disseny (30 i 26,33) i
els de tauleta (19,89 i 17,91) queden igual. Les proves d'`midesGraellaCompacta`
s'han actualitzat a la regla nova (les separacions primer).

### Els textos del megaslide, al carril (10.8) — FET

Amb els gaps comprimits (10.7) els dibuixos quedaven més apretats del que toca.
L'amo va dir que també es podia ajustar la mida del text: ara els textos del
megaslide s'encongeixen amb el carril (`carrilPx`, o sigui `px x escala`):

- la **llista de col·leccions** i les **etiquetes dels dibuixos**: 11 px a 1920,
  8,25 a 1440, 7,33 a 1280;
- la **pastilla COLOR** (11 px) i els botons **Blanc/Color/Negre** (14 px).

A tauleta es queden a 8 px i 14 px (el seu disseny), i a 1920, igual.

**Resultat**: amb el text escalat, els gaps dels dibuixos ja no s'han d'apretar i
queden a la proporció del disseny a totes les mides:

| vista | text de la llista | dibuix | gapH (disseny: 26,33 x escala) | solapament |
|---|---|---|---|---|
| 1920 | 11 px | 30 | 26,33 | −10 |
| 1440 | 8,25 px | 22,5 | 19,75 (=) | −7,5 |
| 1366 | 7,82 px | 21,33 | 18,72 (=) | 0 |
| 1280 | 7,33 px | 20 | 17,55 (=) | 0 |
| tauleta | 8 px | 19,89 | 17,91 | −7,4 |

La regla de 10.7 (les separacions s'encongeixen abans que el dibuix) es queda com
a xarxa: només entra si, tot i escalar el text, l'espai no arriba.

### Els quatre blocs i els 20 px (10.9) — FET

L'amo ho va precisar: la composició són quatre blocs amb una separació fixa
entre cadascun:

`[selector b/c/n] 20 [graella de dibuixos] 20 [graella de colors] 20 [columna de col·leccions]`

Es va provar amb 10 i amb 20, i l'amo s'ha quedat amb **20** ("queda
collo..."). Amb 10, a 1920 el gap intern dels dibuixos quedava exactament al
disseny (26,33); amb 20, els 10 px extres surten d'aquí i baixa a 24,39
(−7,4%). És el preu, i està acceptat.

- El gap entre blocs és de **20 px fixes** (`columnGap: '20px'`, no escalat): és
  el que fa que totes les mides quadrin, perquè el que cedeix és el gap intern
  dels dibuixos.
- La filera arrenca on acaba el bloc del selector més 20 px (`esquerra` =
  `carrilPx(40) + carrilPx(bnSliderSize) + 20px`). A 1920 el dibuix passa de
  175,5 a 190,4 px.
- S'ha **tret el desplaçament de ±10 px de la graella de colors**
  (`translateX`): trencava precisament el gap del mig (quedava a 0 a
  l'escriptori i a 20 a la banda estreta).
- La columna de la llista porta un **coixí per l'esquerra** igual al que la
  graella de colors sobreïx de la seva columna, de manera que el text comença
  la mateixa separació (20 px) després de l'últim cercle.

| vista | selector→dibuixos | dibuixos→colors | colors→col·leccions | text vs cercles |
|---|---|---|---|---|
| 1920 | 20 | 20 | 20 | 20 |
| 1440 | 20 | 20 | 20 | 20 |
| 1366 | 20 | 20 | 20 | 20 |
| 1280 | 20 | 20 | 20 | 20 |
| tauleta (1024/768) | 20 | 20 | 20 | 20 |

Els gaps **interns** dels dibuixos: 24,39 px a 1920 (el disseny són 26,33) i
17,31 / 16,23 / 14,92 a 1440 / 1366 / 1280 (el proporcional seria 19,75 / 18,72
/ 17,55): és el que costen els 20 px fixes. El dibuix no es toca (30 / 22,5 /
21,33 / 20). A tauleta queden intactes (17,91 amb el dibuix a 19,89).

**El que NO s'ha passat al carril (i per què)**:

- **Els offsets verticals** (40, 20, 45, 5, 8, 10, 15 px) i el `top` del
  selector. S'hi va provar i es va revertir: el bucle `alignTopRowToPage1`
  alinea el botó Color de les dues pàgines amb `topVisualAlignmentY`, que
  **també mou la filera de dibuixos**; si el selector s'encongeix d'una manera i
  la filera d'una altra, la filera baixa 11 px i deixa de quadrar. Cal separar
  primer les dues coses (una variable per al selector i una per a la filera).
  Parany del camí: la condició de «banda estreta» dins `MegaslidePagina2`
  (`esBandaEstreta`) **exclou** la tauleta apaisada, però l'expressió original
  d'aquells `top` no ho feia; fer-les servir indistintament movia la tauleta
  5 px.
- Les **tipografies** (14 px del selector, 11 px de les llistes) no s'escalen
  (ho va triar l'amo: el text es queda a la seva mida).

**El que queda** (properes passes, ja més fines):
1. **El contingut que no passa per les bandes** encara té el 1350 literal:
   `CistellComandaContent` (`TABLE_WIDTH = 1350`), `UserComandesContent`
   (`width: '1350px'`, tres cops), `SiteFrame` (`SITE_FRAME_MAX_WIDTH = 1350`,
   que encara fa servir el checkout) i l'ancoratge del `CheckoutPage`.
2. **Els offsets verticals del carril** (vegeu més amunt): separar el bucle que
   alinea el selector del que col·loca la filera, i passar al carril el `top`
   del selector, el marge de dalt dels tiles (8 px) i els desplaçaments de la
   franja (-15/+20/10 px) amb el seu `FRANJA_AJUST_PX`. La franja ja
   s'encongeix amb el carril (punt 10.2); el que queda són les posicions
   verticals.

**Parany après**: els intents d'escalar amb un `transform: scale` a sobre del
belt escalat **empitjoren** (el contingut se'n va cap endins i els marges queden
irregulars). Cal escalar **les mides i les coordenades**, no pintar-les més
petites.

**Parany après (2)**: la capa del megaslide **no** té el panell com a
contenidor de posicionament, sinó el `MegaStripeBleedGuard` (que va dins del
`mx-auto max-w-[1350px] px-4 sm:px-6 lg:px-10`). Per això `left: 0` la deixava a
317,5 px a 1920 i va caldre la compensació de la reserva. La posició del
contenidor de debò es va veure amb una sonda que puja la cadena d'ancestres.

**Eines**: `npm run mesura:megaslide` (833 xifres de regressió a 7 mides),
`npm run compara-vistes`, 462 proves, `npx vite build`.
