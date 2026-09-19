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

0. **Fet**: els commits ja són a `origin/main` (27, fins a `f906099`), i l'amo
   ha demanat explícitament que es pugessin.
1. **Demà (llista de l'amo, 2026-09-19)**:
   1. **Pàgines 3 i 4** del megaslide (cistell i comandes): la feina que s'hi ha
      fet és la meitat (segueixen el carril i s'escalen amb ell), però han de
      rebre el mateix tracte que les pàgines 1 i 2: composició dins el carril,
      proporcions i alineació amb la fila 1.
   2. **Rebots en obrir la pestanya i amb el cadenat**: hi ha salts visuals quan
      s'obre la pestanya del megaslide i quan intervé el cadenat.
   3. **El cadenat, més gros.**
   4. **El cadenat ha de poder moure l'scroll** igual que l'scroll el mou a ell
      (interacció en dos sentits), a la **versió vertical**.
   I el que vagi sortint.
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

### La PDP: les columnes alineades amb les targetes (11) — FET

L'amo ho va veure: a la PDP, les 4 columnes agrupades 1+2+1 (especificacions |
imatge | informació, amb la imatge ocupant dues) han d'anar alineades amb les
targetes del rail "Altres històries". Al desktop (1920) i a la tauleta vertical
ja hi anaven; a la tauleta apaisada i als escriptoris estrets, no. A la vertical
el rail porta 3 targetes i les columnes s'agrupen 2+1 (dues de imatge, una
d'informació).

**Causa**: el PDP calculava l'ample de la seva graella pel seu compte, amb
`getSafeBelt()`, que cau al carril del megaslide (70,3 vw) quan les guies
`--belt2-*` no passen la seva validació; el rail, en canvi, fa servir la pauta
del lloc (`bgMetrics`, la franja del SiteFrame). A 1920 coincideixen (1350), però
a 1366 el rail va amb 1334 i el PDP amb 960, i a la tauleta apaisada amb 992 i
720: per això les columnes no queien sobre les targetes.

**Solució**: el PDP **mesura les targetes reals** del rail
(`[data-component="product-card"]`, les visibles) i en treu les amplades, la
separació i el marge esquerre. Així l'alineació és exacta per construcció, passi
el que passi amb el belt. Si encara no hi ha mesura (mòbil), es queda el càlcul
de sempre. A la tauleta apaisada, a més, les amplades i la separació es
divideixen per `tdpFitScale`, perquè després de l'escala tornin a coincidir amb
les targetes (l'origen de l'escala és el cantó de dalt a l'esquerra, així que el
marge no es divideix).

| vista | columnes del PDP | targetes del rail |
|---|---|---|
| 1920 | 313,5 · 637,4 · 1285,2 | t1 313,5 · t2 637,4 · t4 1285,2 |
| 1366 | 36,5 · 351,5 · 981,4 | t1 36,5 · t2 351,5 · t4 981,4 |
| 1024 tauleta apaisada | 36 · 270,6 · 739,8 | t1 36 · t2 270,6 · t4 739,8 |
| 768 tauleta vertical | 16 (2 columnes) · 510 | t1 16 (t1+t2) · t3 510 |

### La informació de les pàgines, dins el carril (12) — FET

El cistell, les comandes i el pagament també han d'encaixar dins el carril
central. Els tres venien d'un disseny de 1350 px i no en sabien res:

- **Pàgines 3 i 4 del megaslide** (cistell i comandes): l'escala era fixa
  (0,94; 0,92 a la tauleta apaisada). Ara és `scale(min(0,94, var(--hg-escala-mega,
  1)))`: a 1920 no es mou res i, per sota, el contingut s'encongeix amb el
  carril. Escales resultants: 0,94 a 1920, 0,750 a 1440, 0,667 a 1280 i 0,533 a
  1024; el cistell (1350 de disseny) fa doncs 1350 / 1013 / 900 / 720, exactament
  el carril.
- **Checkout**: la pàgina anava amb `--site-w` (el marc del lloc, 1350 a 1440)
  i `--site-xL`. Ara va amb `--hg-mega-w` i `--hg-mega-x`, les mateixes que la
  fila de la capçalera. Comprovat: la seva caixa és [285, 1635] a 1920 i
  [214, 1227] a 1440, és a dir el carril exacte, igual que la fila del header.

A tauleta no es mou res (allà `--hg-escala-mega` val 1 i el cistell té la seva
pròpia calibració).

### La informació de les pàgines de producte, dins el carril (13) — FET (PDP)

El rail "Altres històries" i, per tant, tota la informació de la PDP (les
columnes 1+2+1, que hi van enganxades) anaven amb el **marc del lloc** (belt2:
1350 px a 1440), no amb el carril central (1013). A 1440 les targetes anaven de
73 a 1346 i la informació quedava fora del carril.

- El rail viu ara **dins un contenidor que fa el carril** (`width:
  var(--hg-mega-w)`, centrat) i rep `beltWidthOverride` amb l'amplada del carril,
  així que les seves targetes es reparteixen dins seu.
- Amb `beltWidthOverride`, el marge esquerre del rail és el de disseny (20 px),
  perquè el contenidor ja és el carril.
- **Les tauletes NO es toquen**: l'override només s'aplica a l'escriptori. Sense
  aquesta exclusió, a la tauleta apaïsada el carril de 70,3 vw dona 720 px i les
  seves targetes queien de 230 a 166 px. Amb l'exclusió queden igual que abans
  (230 a l'apaïsada, 242 a la vertical).

| vista | carril | targetes del rail | informació (columnes) |
|---|---|---|---|
| 1920 | [285, 1635] | 313,5 → 1586 | 313,5 · 637,4 · 1285,2 |
| 1440 | [214, 1227] | 226 → 1182 | 226 · 470,7 · 960,1 |
| 1280 | [190, 1090] | 202,5 → 1049 | 202,5 · 415,5 · 841,4 |
| 1024 tauleta apaisada | — | 36 → 970 (230 px, intacte) | 36 · 270,6 · 739,8 |
| 768 tauleta vertical | — | 16 → 752 (242 px, intacte) | 16 · 510 |

Pendent: la **pàgina TDP** (`/constructor/tdp`), que també és de producte i té
els panells d'informació fora del carril (a 1440, [38,472] i [952,1387]), perquè
va amb `--belt2-*` i posicions absolutes de 1350.

### PDP: 20 px més avall a 1440 i breadcrumbs amb el logo (14) — FET

Dos retocs d'afinació de la PDP, tots dos a l'escriptori estret (fins a 1440):

- **Les targetes del rail i la tdp, 20 px més avall**: el rail passa de
  `translateY(-72px)` a `-52px` i la tdp de `margin-top: -32px` a `-12px`.
  Comprovat: la targeta passa de 143,4 a 163,4 i la tdp de 419,8 a 439,8, o
  sigui +20 exactes a les dues. A 1920 (146,5 / 505) i a les tauletes no es mou
  res.
- **Els breadcrumbs, alineats amb el logo del header**: anaven a `left: 36px`
  dins del contenidor de la pàgina (a 1920, 317,5 en comptes de 325). Ara viuen
  en un contenidor que fa el carril, centrat, amb el mateix coixí que la fila
  del header (`carrilPx(40)`) i compensant la meitat de la barra de
  desplaçament que publica `SiteFrame` (`--site-gutter-mig`): el contenidor de
  la pàgina està centrat a la FINESTRA i el carril a l'espai de maquetació.

| vista | logo del header | breadcrumbs | diferència |
|---|---|---|---|
| 1920 | 325 | 325 | 0 |
| 1440 | 244 | 243,5 | −0,5 |
| 1280 | — | (no es mostren: allà mana la tauleta) | — |

### La franja de la pàgina 2, a la mateixa alçada que la de la 1 (15) — FET

L'amo ho va veure a la tauleta apaïsada: la franja (stripe) de la pàgina 2 no
queia on la de la pàgina 1. Comparades: a 1024 la de la pàgina 1 era a 259 i la
de la 2 a 243,8 (15,2 px més amunt).

**Causa**: les dues franges decideixen si són «franja estreta» amb condicions
diferents. `MegaStripePanelP1` fa servir `>= 768 && <= 1366 && ample >= alt`
(inclou el 1024) i `MegaStripePanel` feia `> 1024 && <= 1366 && ample >= alt`
(excloïa el 1024). Quan la condició és certa, la fila no porta el
`translateY(-15px)`: una pàgina el baixava i l'altra no.

Ara les dues condicions són la mateixa. Comprovat (alçada de la franja):

| vista | pàgina 1 | pàgina 2 |
|---|---|---|
| 1920 | 313,8 | 313,8 |
| 1440 | 279 | 279 |
| 1024 tauleta apaïsada | 259 | **258,8** (abans 243,8) |
| 1366 | 259 | **258,8** |

La mesura ho tenia fitxat: `deltes.franjaP2menysP1` a la tauleta apaïsada passa
de −15,24 a −0,27.

### La incoherència d'escalat a 1280 (16) — FET

A 1280 la pàgina barrejava dues maquetacions, i l'amo ho va acabar de fixar:
**la mida ha de ser la mateixa amb tàctil i sense**. Res de decidir amb el touch.

**Causa**: la detecció de tauleta estava duplicada amb regles diferents:

- `useDeviceLayout` (App → header i megaslide): `isTouch && w >= 600 && h < w && h <= 1100`
  → **demana pantalla tàctil**.
- Les pàgines (PDP, Home, les cinc de col·lecció, `CistellComandaContent` i
  `CheckoutContent`): només mides (`w >= 768/1024 && w <= 1366 && h < w`) → a
  1280×800 sense touch es creien una tauleta.

I, a sobre, el **rail** de la PDP anava amb el marc del lloc (1248) mentre el
megaslide feia el carril (992): d'aquí les targetes de 290 px (1,39× el carril).

**Solució**:

1. Un sol criteri, exportat de `layoutMetrics` (`esTauletaApaisada`,
   `esTauletaVertical`) i **sense touch**, amb la mateixa regla a
   `useDeviceLayout` i a les nou peces que se la calculaven soles.
2. El rail de la PDP rep **el carril** (`--hg-mega-w`) com a amplada, no el marc
   del lloc. Amb això, a 1280 les seves targetes fan 230 px, exactament les
   mateixes que a la tauleta de 1024.
3. El **header s'escala** amb el carril: el logo (140×32 de disseny) i la mida
   del nav (11 px) van amb `carrilPx`, com la resta del megaslide.

| vista | carril | targeta | informació |
|---|---|---|---|
| 1920 | 1350 | 301 | alineada |
| 1440 | 1013 | 222 | alineada |
| **1280 sense touch** | **992** | **230** | **alineada** |
| **1280 amb touch** | **992** | **230** | **alineada** |
| 1024 tauleta | 992 | 230 | alineada |
| 768 tauleta | 992 | 242 | alineada |

Les dues files de 1280 són idèntiques, i les tauletes queden com estaven.

### La fila 1 del megaslide, entre el logo i la icona d'usuari (17) — FET

Amb la 1280 unificada (punt 16) la fila 1 del megaslide encara no encaixava
entre el logo i la icona d'usuari: a 1280 el logo era a 219 i la graella a 174.

**Causa**: el header i el megaslide anaven amb referències diferents:

- El `width` del header a l'apaisada era el **marc del lloc** (`--site-w`, 1248
  a 1280) i el megaslide el **carril** (992).
- I `--hg-mega-x` venia de `belt.left`, que a 1280 és el del marc del lloc (16),
  mentre que `--hg-mega-w` ja era el carril de 992 (centrat a 144).

**Solució**:

1. El header va amb el carril tambe a l'apaisada (`--hg-mega-w` i
   `--hg-mega-x`); només la vertical es queda el marc del lloc, perquè allà el
   carril (992) és més ample que la pantalla.
2. Quan el carril té amplada pròpia (tauleta: 992), la seva posició també:
   **centrat a l'espai de maquetació** (a 1280, 144 en comptes de 190; a 1366,
   187 en comptes de 203). A la vertical no s'hi toca.
3. El coixí del header passa a `carrilLane(40)` (el mateix 3% del carril que
   deixen les graelles del megaslide) en comptes de `carrilPx(40)`.

Resultat: el logo i la icona d'usuari cauen exactament sobre les vores de la
fila 1: a 1280, logo 173,4 i graella 173,8; a 1440, 244 i 244; a 1920, 325 i
325,5.

### La fila 1 fa l'amplada de la franja del header (18) — FET

La fila 1 (selector + graelles + columna de col·leccions) ha de fer exactament
l'amplada de la franja del header (del logo a la icona d'usuari) a totes les
vistes, i el 1280 i el 1024 la mateixa.

El coixí de la fila era `carrilPx(40)`: 40 px fixos a tauleta, que **no** són el
3% del carril (en són 29,4). El header ja anava amb `carrilLane(40)` (el 3%), i
per això la fila quedava 10,6 px curta a cada banda a 1024 i a 1280. Ara els dos
costats de la fila (l'esquerra del selector i el marge dret) van amb
`carrilLane(40)`, com el header.

| vista | franja del header | fila 1 |
|---|---|---|
| 1920 | 1270 | **1270** |
| 1440 | 953 | **953** |
| 1280 | 933,2 | **933,2** |
| 1024 tauleta | 933,2 | **933,2** |
| 768 vertical | 688 | 912 (la seva, sense tocar) |

El 1280 i el 1024 fan la mateixa amplada (933,2), i la vertical es queda com
estava.

### L'indicador de color, la meitat de gruix (19) — FET

La graella de colors marca el color triat amb un contorn (`outline`) de 2 px.
Ara en fa **1 px** (la meitat), amb el mateix `outlineOffset` de 3 px.

### La tdp, més avall a l'apaisada (20) — FET

A l'apaisada la tdp va més avall, amb dos valors: **+18 px** a la finestra ampla
(1280 i 1366) i **+68 px** a la tauleta de 1024. Com que el marge és NEGATIU,
baixar vol dir fer-lo menys negatiu (al revés —−57— el que fa és pujar-la, que
és l'error que vaig cometre primer).

Comprovat: 375,3 → **425,3** a 1280, 390,6 → **440,6** a 1366 i 329,9 → **429,9**
a la tauleta de 1024. A la vertical (514), a 1440 (439,8) i a 1920 (505) no es
mou res.

### Tauleta i 1280: dibuixos una mica més grossos i colors/llista 10 px a l'esquerra (21) — FET

Dos retocs a l'apaisada (1024, 1280 i 1366; la vertical, com sempre, a part):

- **Els dibuixos de la graella, una mica més grossos**: de `DIBUIX_BASE * 0,40`
  a `* 0,42` (19,89 → **20,89 px**, un 5% més). Es va provar amb 0,45 (22,38) i
  era massa. Les separacions es queden com estaven (18, un 10% menys que la base
  de 20), que amb 20,89 encara hi cap: el conjunt fa 603 px i la columna de la
  graella en fa 637 a la tauleta.
- **La columna de col·leccions i la graella de colors, 10 px a l'esquerra** a
  l'apaisada: el text i els cercles acaben 10 px abans que abans (la resta de la
  composició no es mou).

| vista | dibuix | gap | cercles (esquerra) | llista (dreta) |
|---|---|---|---|---|
| 1920 | 30 | 24,39 | 1341,9 | 1595 |
| 1280 | **20,89** | 17,91 | **903,7** (abans 913,7) | **1096,6** (abans 1106,6) |
| 1024 tauleta | **20,89** | 17,91 | **775,7** (abans 785,7) | **968,6** (abans 978,6) |
| 768 vertical | 20,89 | 17,91 | 759,1 | 952 |

Les dues tauletes segueixen donant les mateixes mides i alineacions (el
comparador ho comprova).

### La pàgina 2, idèntica a la vertical i a l'apaisada (22) — FET

L'amo ho va preguntar i tenia raó: la vertical ha de ser la mateixa pàgina que
l'apaisada, i la pàgina 2 no ho era. Comparades (posicions relatives al carril,
que fa 992 a totes dues):

| peça | vertical (abans) | horitzontal (abans) | ara les dues |
|---|---|---|---|
| selector | 40 → 128 | 29,4 → 115,9 | **29,4 → 117,4** |
| dibuixos | 148 → 739,1 | 135,9 → 749,7 | **137,4 → 749,7** |
| colors | 759,1 → 816,4 | 759,7 → 817 | **759,7 → 817** |
| col·leccions | 872,6 → 952 | 873,2 → 952,6 | **873,2 → 952,6** |

Tres causes:

1. El coixí del selector i el marge dret de la filera tenien una excepció per a
   la vertical (`carrilPx(40)` en comptes de `carrilLane(40)`): fora.
2. El **tile** de les tauletes sortia de l'amplada del panell mesurada (a la
   vertical en té 48 de coixí i a l'apaisada 80): ara les dues fan servir el
   coixí de disseny (40+40) sobre la referència de 1024, i el tile fa 93,7 a
   totes dues.
3. El desplaçament de −10 px de la graella de colors i de la columna de
   col·leccions només s'aplicava a l'apaisada: ara a les dues.

El comparador també ho veu: les tres tauletes (768, 1024 i 1366) donen ara
`samarretes 101,6` i `selector 0`.

### L'hero, més avall, i la resta de la home amb ell (23) — FET

L'hero de la home (les 5 franges) va més avall, i **la resta de la home baixa
amb ell** (l'amo ho va veure: només baixava l'hero i la secció de sota es
quedava). El mateix número (`baixadaHero`) alimenta el `top` de l'hero i el
`marginTop` de la secció de les col·leccions.

| vista | baixada | hero (top) | resta (marginTop) |
|---|---|---|---|
| 1920 | 0 | 555,7 (igual) | 0 px (igual) |
| 1440 | +25 | **477,8** | **25 px** |
| 1366 | +70 | **477,6** | **10 px** (−60 + 70) |
| 1280 | +70 | **459,3** | **10 px** (−60 + 70) |
| 1024 tauleta | +125 | **459,4** | **65 px** (−60 + 125) |
| 768 vertical | 0 | 486,3 (igual) | 75 px (igual) |

El 1280 va 5 px més amunt que el 1366 (retoc de l'amo), i la vertical i el 1920
no s'hi toquen.

### El cadenat: més gros, seguiment i arrossegament (24) — FET i validat

Tres coses de la llista de l'amo:

- **Més gros**: el botó passa de 40 a **48 px** i la icona de 18 a 22. El
  cadenat viu en un portal `position: fixed` i fa 48×48 a totes les vistes.
- **El rebot en obrir la pestanya**: el cadenat va enganxat a la vora inferior
  del panell, i el panell fixa la seva alçada per estat i fa graons de fins a
  35 px mentre s'obre. El seguiment ja els suavitzava, però a 4 px per fotograma
  trigava ~150 ms a arribar-hi i es veia el llast. Ara el pas màxim és de 18 px
  i la correcció del 50% per fotograma: hi arriba en dos o tres fotogrames.
- **Arrossegar-lo ha de moure l'scroll**: el gest ja hi era, però escrivia el
  `scrollLeft` del viewport de la **pàgina 1** mentre que el progrés que mou el
  cadenat (`mega-portrait-scroll`) surt del viewport de la **pàgina 2**. Ara
  arrossega el mateix element que el mou a ell. Nomes a la vertical
  (`isPortraitTablet`), com abans.

**Validat per l'amo** (2026-09-19): els tres canvis són correctes. Eren coses de
mà, no de mesura, i per això es van demanar expressament.

### Les icones de col·lecció de la home, centrades en y (25) — FET

A la home, les icones de col·lecció (el bloc on era el logo) no estaven
centrades en el buit entre la capçalera i l'hero: el seu centre hi cau 35-62 px
per sobre, segons la vista. I la de First Contact —el Phoenix, 99 px d'alçada—
anava 18 px més avall que la resta (70,4), perquè el desplaçament de −18 px
s'aplicava a totes menys a ella.

Ara:

- El Phoenix també porta el −18 px, o sigui que **les cinc comparteixen centre**
  i la referència de volum és el grup de l'Austen (70,4), no el Phoenix.
- El bloc es desplaça el que cal perquè aquest centre caigui **al mig del buit
  entre la capçalera i l'hero**: `+9 px` a l'escriptori, `+66` a l'apaisada
  ampla (1280/1366), `+86` a la tauleta de 1024 i `+89` a la vertical (abans
  −26 / +24 / +24 / +84).

| vista | mig del buit | centre de les icones | diferència |
|---|---|---|---|
| 1920 | 338,3 | 337,6 | −0,7 |
| 1440 | 299,4 | 299,7 | +0,3 |
| 1280 | 290,2 | 290,0 | −0,2 |
| 1024 tauleta | 290,2 | 289,8 | −0,4 |
| 768 vertical | 324,6 | 324,6 | 0 |

### Pàgina 3 (el cistell): diagnòstic (26) — PENDENT

Reproduït amb un article al cistell (PDP → AFEGEIX AL CISTELL → icona del
cistell) i capturat a 1920, 1440, 1024 i 768 (vegeu
`docs/comparacio/cistell-1920.png` i `cistell-768t.png`).

El que es veu:

1. **La llista de productes desplaçada** — **FET**. La finestra de les files
   del cistell arrencava a `TOP_OFFSET - ROW_H - 20` a l'escriptori i a
   l'apaisada (per l'efecte d'entrada en fer scroll; la vertical ja feia servir
   `TOP_OFFSET`), i amb això la primera filera quedava **tallada pel sostre del
   panell**: mesurada, començava a 111,8 quan el panell comença a 121.

   Arreglat: totes les vistes arrenquen a `TOP_OFFSET`. La primera filera passa
   de 111,8 a **153** (el sostre del viewport de la pàgina 3), sencera i amb el
   seu dibuix. Captura: `docs/comparacio/cistell-llista-1920.png`.

2. **Els dibuixos sortien com un nom** — **FET**. No era el fons (ho va
   corregir l'amo): quan la imatge no carrega, el navegador pinta l'`alt`, que és
   el nom del producte. I la causa era **de Cube**: el `STRIPE_DESIGN_MAP` de
   Cube ja porta el sufix als noms (`afrodita-c-stripe`, `cube-3-p0-stripe`…) i
   la branca de Cube de `drawingStripePath` n'hi afegia un altre, així que
   demanava `afrodita-c-stripe-stripe.webp`, que no existeix. Amb Miscel·lània
   no passava perquè el seu camí és el genèric.

   Arreglat a `src/lib/drawingPaths.js`: només s'hi afegeix `-stripe` si no hi
   és. Comprovat amb les deu rutes de Cube (totes resolen a un fitxer que
   existeix) i al navegador amb tres articles al cistell (AFRODITA-C, ROBOCUBE i
   3CUBE-P0): les tres imatges carreguen (256 px) i cap resposta ≥400. Captura:
   `docs/comparacio/cistell-cube.png`.

3. **A les tauletes, el megaslide a baix de tot** — **FET**. El mecanisme: quan
   el **cadenat** està actiu i la pestanya torna en primer pla (`focus`,
   `pageshow` o `visibilitychange`) amb el cistell obert i articles a dins,
   `FullWideSlideHeader` desplega l'acordió (`setAcordioExpanded(true)`). A
   tauleta, `MegaMenuPanel` hi responia amb
   `guardHeightPxDefault = 'calc(100vh - var(--globalHeaderTopOffset) - 112px)'`,
   i el panell se n'anava més enllà del peu de pantalla: **937 px en una pantalla
   de 1024** (vertical) i **681 en una de 768** (apaisada).

   Arreglat: l'acordió desplegat fa servir l'alçada de sempre
   (`bleedGuardHeight`). Ara el panell fa 321 px i acaba a 452 (vertical) i 442
   (apaisada), ben endins de la pantalla; el 1920 no es mou (366, com abans).
   Captura: `docs/comparacio/cistell-acordi-1024t.png`.

**Fets**: els tres punts de la llista (1, 2 i 3).

### Cistell a la vertical: la filera tallada per la dreta (27) — FET

A la vertical la filera de producte quedava tallada per la dreta. Mesurat: el
contenidor del cistell feia **540 px** (`min(100vh - 32px, 70.3vw)` hi dona
70,3 vw = 540) i la filera **1269** (els números d'escriptori, 1350 de disseny
amb l'escala 0,94): se n'anava 745 px enllà.

Arreglat:

- El contenidor de la pàgina 3 fa el **carril** (`--hg-mega-w`, 992) a totes
  les vistes, com la resta del megaslide.
- La filera de les **dues** tauletes fa l'amplada del seu contingut
  (`isCompactCart`, 4 columnes i 3 junts), com ja feia l'apaisada: a la vertical
  passa de 1269 a **615** i cau dins del viewport (30 → 645).
- La columna del preu (una graella interna de 5 caselles pensada per a
  l'escriptori: etiqueta oculta + paperera + preu) no hi cabia i el preu se
  n'anava fora: a la vertical l'etiqueta oculta ja no ocupa lloc i les caselles
  són les de la paperera i el preu. El preu passa de 677-706 a **605-633**,
  dins de la filera.

Captura: `docs/comparacio/cistell-vertical-768t.png`. El preu queda just a tocar
de la paperera: és un número de disseny i es pot separar quan calgui.

I el bloc del total + FINALITZA LA COMANDO no quedava centrat a la pantalla: es
col·loca amb `overlayLeft` (el centre de l'última filera) menys un `-106` propi
de la vertical, i a sobre la finestra de les files hi arrencava a `left: 0`. Amb
el contenidor dins la pantalla (`min(carril, 100vw)`) i la finestra centrada,
tot hi cau: el centre de la filera i el del bloc són 384 a la vertical, 512 a
l'apaisada i 960 a 1920 (el bloc, 5 px més enllà pel desplaçament de disseny).
Captura: `docs/comparacio/cistell-boto-768t.png`.

### El cistell i la franja central (28) — FET (i un deute pendent)

La llista de productes del cistell ha d'encaixar a la mateixa mesura que la fila
1: del `left` del logo al `right` de la icona d'usuari.

**La causa de fons era el publicador de la franja.** La primera versió buscava
`#stripe-guide-header-logo-anchor` a tot el document i trobava una còpia dins
del megaslide: a 768 publicava **1302 px** en una pantalla de 768, i el cistell
se n'anava a 1302. Ara: (1) es busca només dins del `header`; (2) es descarta
tota mesura que surti de la pantalla; (3) si no n'hi ha cap de bona, es calcula
(el carril menys els coixins de 40/1350 per banda; a la vertical, el marc del
lloc menys 48).

Amb la franja bona, la pàgina 3 fa el contenidor d'aquesta amplada i escala el
contingut per `franja / amplada natural` (mai cap amunt), i els slots de la
vertical surten de la franja. Resultat: la filera fa la franja exacta a
**1920 (1270), 1440 (953), 1280 (933), 1024 (933) i 768 (688)**, amb les
alçades de filera intactes.

**El deute que va assenyalar l'amo**: he estat afinant amb nombres individuals
per vista (el `-10`, el `62`, el `-6`, el `-12`…). Cal fer-ho **proporcional**.

**Pas 1 (fet)**: totes les mides de la filera són en un sol bloc, `MIDES`, al
capdamunt de `CistellComandaContent`: el desplaçament de la talla, el del cubell,
el del preu, la graella interna del preu, el marge de la part decimal, els junts
de caselles i els junts dels grups de quantitat i talla. Verificat que el canvi
**no mou res**: filera [325, 1595] a 1920, [243,5, 1196,5] a 1440, [45,5, 978,5] a
1024 i [40, 728] a 768, i les separacions idèntiques.

**Pas 2 (fet)**: totes les mides de `MIDES` surten d'**una sola unitat**, `U =
SLOT_W` (l'amplada d'un dels 8 slots de la filera), amb els multiplicadors de
l'escriptori (23/155, −20/155, −36/155, 40/155, 70/155, 14/155, 10/155…). Ja no
hi ha cap nombre per vista dins de `MIDES`; només canvia `U`.

L'alçada (`ROW_H`) i la tipografia (11,6 pt) NO en surten: són valors propis de
cada família. Escalar-ho tot donaria textos de ~6 pt a la vertical, i per això el
disseny sencer no es pot escalar.

Comprovat amb el cistell obert: la filera fa la franja (1270 / 953 / 933 / 933 /
688) i el preu cau dins de la seva columna a les cinc vistes.

**Conseqüència a la vertical**: els junts passen a ser proporcionals, i on abans
hi havia el valor retocat a mà (quantitat→talla 64,5) ara n'hi ha 15,1. És
l'esperat: la vertical és la propera a refer, i ara ja surt d'una sola unitat.

### Nou paradigma de la vista vertical (29) — EN CURS

L'amo ha definit com ha de ser la vertical (768). No és un retoc: és una
composició pròpia, no un carrusel horitzontal miniaturitzat.

1. **El header no es toca.**
2. **La graella de dibuixos ocupa tota l'amplada del carril** (de 40 a 728 a
   768). Deixa de ser una peça del carrusel i passa a ser la capçalera de la
   composició.
3. **A sota, tres columnes** dins del mateix carril:

   | columna | contingut | amplada aprox. |
   |---|---|---|
   | Col·leccions | la llista de botons (First Contact … Miscel·lània) | ~19% |
   | Botons d'acció | BLANC / COLOR / NEGRE i, a sota, la paleta amb la pastilla COLOR | ~15% |
   | Stripe | les samarretes, partides en **dues files de 7** | ~63% |

Amb scroll vertical. Les mides surten de la unitat, com al cistell després del
pas 2, en comptes de nombres per vista.

**On viu avui**: `MegaStripePanelP1.jsx` (pàgina 1) amb les peces
`MegaGridDibuixos.jsx` (graella), `MegaColumn.jsx` (col·leccions) i la franja de
samarretes; les mides compartides amb la pàgina 2 són a `midesMegaslide.js`.

**Pla**: (1) mesurar la composició actual a 768 com a referència; (2) portar el
contenidor de la pàgina 1 a l'amplada del carril a la vertical; (3) graella de
dibuixos a dalt i a tot l'ample; (4) les tres columnes a sota; (5) la stripe en
2×7; (6) verificar amb les mesures, el comparador, la mesura del megaslide, els
tests i el build a cada pas.

**Pas 1 (fet) — la referència, mesurada a 768**: la franja fa 688 i el carril
992; el panell fa [0, 131, 753, 292] o sigui que **avui és una banda de 292 px**
dalt de tot, amb la pàgina 1 a dins. Hi conviuen 94 imatges: 84 de la graella de
dibuixos i 9 de grans; les samarretes de la franja fan 94 px d'amplada i n'hi
caben 7 per fila. Captura: `docs/comparacio/vertical-abans-768t.png`.

Conseqüència per al pas 2: la composició nova (graella a dalt + tres columnes) no
hi cap en 292 px, així que la pàgina 1 de la vertical haurà de demanar **més
alçada** (com fa avui l'acordió del cistell, que desplega el panell).

**Pas 2 (en curs) — per què avui la vertical no és una composició sinó un
retall**: mesurat a 768, la fila de dibuixos viu dins d'un contenidor de **917 px
d'ample** dins d'un panell de 753. És el *belt* horitzontal (el carril de 992
escalat), és a dir que a la vertical el megaslide continua sent el carrusel
horitzontal, amb les peces sortint de la pantalla per la dreta i el panell
retallant-les. La captura de referència ho ensenya: es veuen els botons
BLANC/COLOR/NEGRE, la fila de dibuixos i la de samarretes, totes dues tallades.

Per tant el pas 2 no és ajustar amplades: és **deixar de fer servir el belt a la
vertical** i muntar-hi la composició estàtica dins del carril. L'estructura que
demana l'amo és la mateixa que ja existeix a la pàgina 2 de l'apaisada (graella
de dibuixos a dalt + col·leccions + colors + franja), i per això el camí més curt
és portar aquella composició a la vertical en comptes d'inventar-ne una.

**Per confirmar**: si la graella manté les 5 files de col·lecció o només la
seleccionada, i si la stripe fa scroll quan la col·lecció té més de 14
samarretes.

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
