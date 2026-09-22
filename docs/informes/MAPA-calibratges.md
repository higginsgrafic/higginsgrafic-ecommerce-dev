# Mapa dels calibratges de geometria

> Document de treball. **No canvia cap píxel**: és l'inventari dels números que
> avui governen la geometria del lloc, amb el seu origen de disseny i el seu nom.
>
> Per què existeix: el 22/09/2026 es va descobrir que el carril de la pauta
> (`--hg-tdp-xL/xR`) no era una mesura sinó una regla de tres, i es va declarar
> (commit `fc264d8`). Aquest mapa fa el mateix treball previ per a la resta:
> **abans de migrar res, saber què vol dir cada número.**
>
> Regla que aplica: la 15 de `docs/constitucio.md` («pedaços, si es poden
> evitar, no»). Un número sense origen llegible és un pedaç encara que avui
> funcioni.

---

## 1. El llenç de disseny ja existeix, però no mana

La geometria del lloc està calibrada sobre un llenç que **ja està declarat al
codi**, només que no és qui decideix:

| paràmetre | valor | on es declara avui |
|---|---|---|
| amplada del llenç | **2642** | `Pauta4ColsOverlay` (`canvasAspect`) |
| alçada del llenç (col·lecció, escriptori) | **6708** | `CollectionVerticalPage` (per defecte) |
| alçada del llenç (col·lecció, tauleta) | **9717** | `gridAspect.tablet` |
| alçada del llenç (inici, taula superior) | **1780** | `Home.jsx` |
| alçada del llenç (inici, graella de fitxes) | **3950** | `Home.jsx` |
| **alçada del llenç (megaslide)** | **1780** | artboard de 800; vegeu §2.2 |
| files (col·lecció) | **90** | `gridRows` |
| files (banda del hero i megaslide) | **24** | `numRows` |
| columnes (col·lecció) | **4** | `numCols` |
| gap vertical de la graella | **3 px** | `gutterY` |

**Una fila del llenç** = `alçada / files`. I en píxels, `coeficient × carril`,
on el coeficient és `alçada / 2642 / files`:

| llenç | unitats per fila | coeficient | el codi diu |
|---|---|---|---|
| 6708 / 90 | 74,533 | 0,028211 | 0,0282194 (i el navegador **pinta** 0,028072) |
| 1780 / 24 | 74,167 | **0,02807217** | 0,0280625 |

El coeficient del megaslide és **el mateix número que jo havia mesurat com a
«pintat» al llenç de 90 files**. No és coincidència que embarollés: els dos
llenços fan 74,5 unitats per fila i jo estava comparant coses diferents. Vegeu §4.

> Aquests paràmetres ja tenen un lloc amb nom i proves:
> **`src/config/llencos.js`** i **`tests/unit/llencos.test.js`**. Vegeu §6.

---

## 2. El mapa

`estat` vol dir:
- **CLAR** — l'origen està provat (amb mesura o amb el codi al costat).
- **DERIVAT** — se'n coneix la fórmula però l'arrodoniment hi fa deriva.
- **PENDENT** — es reprodueix, però l'origen no és llegible. Cal mesurar-lo.

### 2.1 Proporcions del carril (escalen amb l'amplada)

| on | avui s'escriu | què vol dir | estat |
|---|---|---|---|
| `CollectionVerticalPage:599` | `× 0.3385` | **≈ 12 files** del llenç | **DERIVAT** (+1,7 px a 1440) |
| `ConstructorColleccioPage:222` | `× 0.3385` | el mateix | DERIVAT |
| `Home.jsx:219`, `TDP1:99`, `TDP2:99` | `× 0.01410547` | **mitja fila** (`0,028219/2`) | CLAR |
| `TdpVariantsGallery:48`, `Home.jsx` (×4) | `× 0.84632` | **30 files** del llenç (`30 × 74,533 / 2642` = 0,846328) | **CLAR** |
| `TdpVariantsGallery:48`, `Home.jsx` (×4) | `− 231px` | **RESCAT** — vegeu §2.4 | **TREURE (fet a Home, `e0a2161`); queda `TdpVariantsGallery`** |
| `ProductDetailTemplate:151`, `ConstructorPdpPreview:210` | `× 5217/2642/70` | una fila d'un **altre** llenç (5217) | CLAR |
| `CollectionVerticalPage:83`, `FullWideSlideHeader:201` | `carril × 0.0280625 − 2.875` | una fila del llenç 1780/24, menys un ajust | **HIPÒTESI** (el gap és plausible, no provat) |
| `layoutMetrics:137` | `MEGASLIDE_REFERENCIA_PX = 1350` | l'amplada del carril a 1920 | CLAR |

**El coeficient de fila, per llenç** (mesurat al navegador a 1920, carril 1350):

| llenç | files | coef teòric | coef pintat | coincideixen |
|---|---|---|---|---|
| 1780 | 24 | 0,028072 | **0,028072** | **sí** |
| 3950 | 53 | 0,028209 | **0,028209** | **sí** |

O sigui que, a l'inici, **el llenç explica exactament el que es veu**. Això és la
bona notícia: el llenç no és una hipòtesi meva, és el que governa la pàgina. El
que **no** està provat és que el llenç de 90 files governi la col·lecció de la
mateixa manera: allà la mesura dona `0,028072`, que és el coeficient del llenç de
**24**, no el de 90. **Aquesta comparació queda pendent** (vegeu §4).

### 2.2 El megaslide té el SEU llenç: 2642 × 1780 (24 files)

El megaslide no comparteix el llenç de les col·leccions. El seu és **2642 × 1780**,
o sigui **24 files de 74,17 unitats** amb gap de 3 px.

**El que està comprovat (mesurat al navegador):** la graella de 24 files de
l'inici pinta files de **37,8971 px** amb carril de 1350, o sigui un coeficient
de **0,028072**, i la divisió del llenç prediu **0,028072**. **Coincideix.**

```js
// FullWideSlideHeader.jsx:201
megaHeroRowHeight = carrilAmple * 0.0280625 - 2.875
//                             \___________/   \___/
//        1780 / 2642 / 24 = 0.02807217        (24-1) * 3 / 24 = 2.875
```

**El que NO està comprovat:** que el `− 2,875` sigui la correcció del gap.
`(24−1) × 3 / 24 = 2,875` és aritmètica correcta i el número és idèntic, però
**dues expressions que donen el mateix número no proven que una expliqui
l'altra.** Aquesta associació és una **hipòtesi**, i queda marcada com a tal. El
que sí que és cert és que el valor escrit (`0,0280625`) es desvia **0,013 px**
del derivat (`0,02807217`).

> **Correcció del 23/09/2026.** En una versió anterior d'aquest mapa hi deia que
> `0,028072` era «el coeficient que el navegador pinta al llenç de 90 files», i
> que les tres xifres de §2.1 eren «germanes». **Les dues coses són falses:**
> 0,028072 és el coeficient del llenç de **24 files**, i les tres xifres eren de
> **llenços diferents**. El llenç de 53 files pinta **0,028209**, que sí que és
> el seu valor teòric. La conclusió de fons —els coeficients s'han de derivar—
> no canvia, però l'argument amb què la vaig defensar era incorrecte.

### 2.3 Altres llenços i referències del megaslide

| referència | valor | què és |
|---|---|---|
| `midesMegaslide.js:12` | `ALCADA_REFERENCIA = 800` | l'alçada de l'artboard del megaslide |
| `CercadorTextRow.jsx:23-24` | mockup **4512 px** = 100cqw, factor `1/45,12` | el llenç del cercador; d'aquí surten `LINE_H`, `LINE_THICK`, `BULLET_D`, `BULLET_CX`, `TEXT_X` |
| `layoutMetrics.js:137/212` | `1350` sobre `1920` | el carril del lloc |

### 2.4 El `− 231`: resolt, i amb una conclusió meva que era falsa

El `− 231` **no és cap fila ni cap sobrant**, i tampoc és el residu d'un valor fix
que calgui treure, com vaig escriure primer. La història i la conclusió bona són
a **§2.4 bis**. Aquest apartat es deixa perquè el rastre de com es va arribar a
la conclusió equivocada és part de la feina.

**El que sí que és cert, i està comprovat:**

| tros de la fórmula | valor a 1920 | què és |
|---|---|---|
| `carril × 0,84632` | 1142,5 | **30 files** del llenç (`30 × 74,533 / 2642 = 0,846328`) |
| `− 231` | 231 | un número pla: no és cap fila (6,07 a 1920, 11,37 a 1024) ni cap sobrant (510 a 1920, 97 a 1024) |
| `(carril − 45) / 3 × 1,3` | 565,5 | una columna de la graella, la imatge 1,3 cops més alta |
| `/2 − 14` | | **mig grup menys mig bloc de descripció, més 14 px** |

I va néixer amb la galeria: commit `9557360` (12/07/2026), dins de l'alçada del
grup, sense cap més context que el número. El candidat més versemblant és que
l'alçada del grup es calibrés a **1440** perquè la píndola caigués on tocava:
`1013 × 0,84632 − 231 = 626,3`, i a 1440 el grup mesura 625,9.

---

### 2.4 bis Què és el `− 231` de debò: no és un pedaç

**La conclusió anterior meva («s'ha de treure») era falsa.** Vaig suposar que la
píndola havia d'estar a una distància fixa de la caixa, i **no ho està**.

**Mesurat: l'aire entre la caixa de la targeta i la píndola no és constant.**

| mida | alçada de la caixa (targeta blanca) | píndola y | **aire caixa → píndola** |
|---|---|---|---|
| 1920 | 401 | 2178,8 | **312,5** |
| 1440 | 295 | 1742,6 | **202,6** |
| 1280 | 356 | 1470,8 | **69,6** |
| 1024 | 281 | 1279,8 | **29,4** |
| 768 | 324 | 1865,8 | **397,2** |

De 29 px a 397 px. Cap `gap` fix pot reproduir això, i per tant **passar a `flex`
amb `gap` no és una reparació: és un altre disseny.**

**I on és clavada, doncs?** La fórmula es llegeix així:

```
bottom = (alçada_del_grup − alçada_de_la_descripció) / 2 − 14
```

que vol dir: **el centre de la píndola cau al mig del bloc de descripció de la
columna, 14 px més avall.** Comprovat a 1920: el centre del bloc de descripció és
a 1825,2, i el de la píndola a 2198,3 = **401 × 1,5 + 14,3** (mig grup + 14).
A 1440 i a 1280 també surt «mig grup + 14»; a 1024 en surt 33. La regla és
doncs coherent: **la píndola va penjada del mig del bloc de descripció**, i això
és un disseny, no un pedaç.

**Llavors, què és el `− 231`?** És un número pla que va néixer amb la galeria
(commit `9557360`, 12/07/2026) dins de l'alçada del grup, i que **no es pot
descompondre**: no és cap fila (6,07 a 1920 i 11,37 a 1024), no és cap sobrant
(510 px a 1920 i 97 a 1024) i no és cap alçada de naturalesa. El candidat més
versemblant és que l'alçada del grup es va calibrar a 1440 per fer caure la
píndola on tocava: `1013 × 0,84632 − 231 = 626,3`, i a 1440 el grup mesura
625,9.

**La decisió presa (23/09/2026): opció 2, feta.** La píndola està ara a
**25 px de la caixa sempre** (`TDP_SEPARACIO_FONS_PX`, l'aire «entre fons» del
lloc), l'alçada del grup la mana el contingut, i el `− 231` ha desaparegut. A la
vista vertical també s'ha tret el `752px`, que era el mateix pedaç amb un altre
número. Commit `e0a2161`.

I **la pàgina es mou**, que és el preu de l'opció 2: el contingut de sota la
galeria puja 97 px a 1024, 175 a 1280, 331 a 1440, 511 a 1920 i 2.532 a 768. És
l'espai buit que la graella reservava i no feia servir (feia 911,5 px amb una
fitxa de 401 a 1920).

---

### 2.6 Proporcions de la pròpia peça (ja són bones)

Aquests no cal tocar-los: es mesuren contra la peça, no contra la pantalla.

| on | valor | què vol dir | estat |
|---|---|---|---|
| `CollectionVerticalPage:158-163` | `× 0.72 / 0.2 / 0.07 / 0.095 / 0.15 / 0.1` | amplada del selector, alçada, font de talla, font de text, cistell, gap del preu — **tot sobre l'amplada de la fitxa** | CLAR |
| `tdpMida.js` | columnes per amplada, alçada 5:4 | la font única de la mida de la fitxa | CLAR |

### 2.7 Desplaçaments de rescat (no escalen, i són el que ha de marxar)

| on | valor | què compensa | estat |
|---|---|---|---|
| `Home.jsx:543` | `+ 305,95` (de JavaScript) | la posició de la hero, mesurada de la pantalla | **PENDENT** |
| `Home.jsx:317-319` | `baixadaHero`: `+25` / `+70` / `+125` | tres dispositius, tres números | rescat |
| `Home.jsx:493` | `translateY(89 / 66 / 86 / 9px)` | centrar les icones, un número per dispositiu | rescat |
| `Home.jsx:545` | `height: 430px` a vertical | la mida de la hero a tauleta, deslligada de l'escala | **PENDENT** |
| `Home.jsx:714` | `marginTop: 435 / 40 / 100px` | la secció de sota la hero, un número per dispositiu | rescat |
| `collectionVertical.js:137-138` | `338px`, `−240px` | el gap hero→TDP a tauleta | rescat |
| `collectionVertical.js:75` | `−41px` | el mateix a escriptori | rescat |
| `collectionVertical.js:60` | `clamp(120px, 26vh, 260px)` | l'alçada de la franja | rescat |
| megaslide | terres de **10 px** i **12 px** | llegibilitat del text quan l'escala baixa | rescat |

### 2.8 Números que semblen calibradors i no ho són

| on | valor | què és |
|---|---|---|
| `collectionVertical.js:115` | `TDP_PITCH_FILES = 15` | files de pitch, **documentat amb la taula de què passa amb 14 i amb 15** |
| `collectionVertical.js:117/119` | `15` i `30` | aire entre fons i bleed: **documentats al fitxer** |
| `collectionVertical.js:125/130/135` | `90`, `50`, `24` | aires del pòster i del peu, documentats |
| `collectionVertical.js:67` | `TDP_MOVE_PX = 0` | ja jubilat (era 120) |

---

## 3. Què passa si es desenrevessen

El valor **no canvia**: canvia la manera d'escriure'l.

```js
// AVUI
marginTop: `calc((var(--hg-tdp-xL) - var(--hg-tdp-xR)) * 0.3385 + ${pushDownPx}px)`

// DESENREVESSAT (mateix píxel)
// 12 files del llenç de 90: 12 * 6708 / 90 / 2642
marginTop: `calc((var(--hg-tdp-xL) - var(--hg-tdp-xR)) * ${12 * LLENC_ALCADA / LLENC_FILES / LLENC_AMPLADA} + ${pushDownPx}px)`
```

I el guany és que **canviar el ritme vertical del lloc passa a ser canviar un
número**, no vint: `LLENC_FILES`, `LLENC_ALCADA`, `LLENC_AMPLADA`.

---

## 4. Les quatre coses que la mesura ha corregit

1. **`0,3385` és `12 files / 2642` = `0,338531`**, no `0,028219 × 12`. L'origen
   és correcte i llegible: **12 files del llenç**. La fila que el navegador
   **pinta** fa `0,028072 × carril`, o sigui 12 files reals són `0,336864`: el
   `0,3385` té una deriva de fins a **1,7 px** a 1440 (amb el signe que allunya
   les fitxes de la hero). La intenció és correcta; el número és aproximat, i
   la diferència entre els tres coeficients germans (`0,028211` teòric,
   `0,028072` pintat) és la que fa que cap d'ells es pugui escriure a mà.
2. **El `− 2,875` SÍ que té origen, i és el gap.** `(24−1) × 3 / 24 = 2,875`. Ho
   vaig marcar com a pendent perquè no vaig veure que les 24 files fan 23 gaps.
   La fórmula és correcta.
3. **El `− 231` no és cap fila de cap llenç, i ara se sap què és:** el residu d'un
   valor **fix** anterior. El commit `de798da` (14/09/2026) va canviar
   `bottom: '-54px'` per una fórmula que havia de reproduir aquell 54 px, i el
   `− 231` és el que va caldre perquè quadrès. **No s'ha de desenrevessar: s'ha
   de treure**, perquè corregeix una alçada de contingut que no és constant
   (401 px a 1920, 295 a 1440, 356 a 1280, 281 a 1024). Vegeu §2.4.
4. **Els «terres» del megaslide no són calibratges sinó pedaços**, i la regla 15
   diu que s'han d'evitar quan la causa es pot tocar. La causa és que el text i
   les files es mesuren amb dos sistemes diferents. N'hi ha **set**, i són a
   `CercadorTextRow.jsx` (4), `FullWideSlideHeader.jsx` (1, el menú) i
   `firstContactPanels.jsx` (1, Blanc/Color/Negre).

---

## 5. L'inventari del megaslide (fet per subagent, verificat per mostreig)

Dins del megaslide hi ha **257 calibradors**, i la distribució diu molt:

| mena | quants |
|---|---|
| deduïbles del llenç | **26** |
| derivats d'altres constants | 63 |
| **NO DEDUÏBLE** | **135** |
| terres i topalls geomètrics | 16 |
| valors de dispositiu | 9 |
| terres de llegibilitat | **7** |
| mida natural d'un actiu | 1 |

**Més de la meitat no tenen origen llegible.** Això és la mesura del que el pla
anomenava «el megaslide està calibrat a un llenç de 1920»: no està calibrat, està
**ajustat a mà**, i per això no es pot tocar sense descalibrar-lo.

L'inventari complet (257 files, amb expressió, comentari literal i origen) és a
la resposta del subagent del 23/09/2026; aquí només hi ha el recompte i el que
cal per decidir. **No s'ha incorporat fila a fila a propòsit**: 135 files
«NO DEDUÏBLE» són un pou que no s'ha d'arrossegar com a document, sinó que cal
anar buidant quan es toqui cada peça.
### 5.1 incoherències entre el comentari i el codi

Val la pena tenir-les juntes, perquè totes cinc són el mateix símptoma: algú va
canviar el número i no el comentari (o al revés).

| on | el codi diu | el comentari diu |
|---|---|---|
| `CercadorTextRow.jsx:754` | `columnGap: '20px'` | «10 px FIXES» |
| `MegaslidePagina2.jsx:534` | `+ 20px` | «10 px a la dreta del selector» |
| `FullWideSlideHeader.jsx:1910` | `PAS_MAX_PX = 18` | «màxim 4 px per fotograma» |
| `TaulaVertical.jsx:17` vs `FullWideSlideHeader.jsx:2155` | carril de tauleta `938,88` | carril de tauleta `992` |
| `TaulaVertical.jsx:155` | `marginLeft: '-30px'` | «s'eixampla 20 px» |

---

## 6. El llenç declarat (passa 1 feta)

Els paràmetres del llenç ja tenen un lloc on viure: **`src/config/llencos.js`**,
amb les seves proves a **`tests/unit/llencos.test.js`** (12 proves).

Aquesta primera passa **no mou cap píxel**: el mòdul no substitueix cap número
del codi, només els dona nom i valor derivat, i deixa els valors escrits al
costat per poder-los comparar. Cada substitució es farà després, d'una en una,
mesurant que no mogui res.

### El que el llenç explica, mesurat

A 1920 amb carril de 1350, les tres graelles del lloc:

| graella | llenç | files | coef teòric | coef **pintat** | |
|---|---|---|---|---|---|
| hero de l'inici | 2642 × 1780 | 24 | 0,028072 | **0,028072** | ✓ |
| graella de fitxes de l'inici | 2642 × 3950 | 53 | 0,028209 | **0,028209** | ✓ |
| pauta de la col·lecció | 2642 × 6708 | 90 | 0,028211 | **0,028211** | ✓ |

**El llenç governa les tres graelles de manera exacta.** No és una hipòtesi: és
la divisió `alçada / files / 2642` comparada amb el que el navegador pinta, i
coincideix fins al sisè decimal a les tres.

I a la col·lecció, la fila de 90 files pinta **38,085 px** mentre la de 24 en
pinta **37,897**: la diferència no és un calibratge, és que el llenç de la
col·lecció és més alt.

### Una confusió que val la pena deixar escrita

A `/cube` hi ha **dues graelles** (la del hero i la de la col·lecció). Quan vaig
mesurar-ne una de sola vaig agafar la del hero i vaig concloure que la fila de la
col·lecció feia `0,028072`. **Era la del hero.** La de la col·lecció fa
`0,028211`, que és el seu valor teòric.

És la tercera vegada en dos dies que una mesura meva ha resultat ser d'una altra
cosa. El patró és sempre el mateix: **un selector que sembla únic i no ho és.**
Per això quan es mesura una geometria cal dir *quina* peça és, no només on és.

---

## 7. Ordre de treball proposat

1. **Aquest mapa** — fet.
2. **Declarar els paràmetres del llenç en un sol lloc** — el mòdul existeix
   (`src/config/llencos.js`) amb 12 proves, i la **primera substitució ja està
   feta** (`7650fca`): el `0,3385` de `CollectionVerticalPage` i
   `ConstructorColleccioPage` es deriva de `LLENCOS.colleccio.coef`.
   **Mou 0,042 px com a màxim** (submil·lèsim), mesurat a les cinc mides.
   Falta la resta de números escrits.
3. **La píndola de la galeria** — decidit i fet a l'inici (`e0a2161`): 25 px de
   la caixa i alçada pel contingut. **Falta el mateix a `TdpVariantsGallery`**,
   que encara té la fórmula amb el `− 231`.
4. **Mesurar els PENDENT** que queden: el `430px` de la hero i els 135 del
   megaslide. (El `752px` s'ha jubilat amb la píndola.)
5. **Separar `--escala` de `--escala-text`** a `foundation.css`, que és el que
   fa possible que la geometria escali sense arrossegar el text.
6. **Migrar l'inici**, amb la hero, i després una col·lecció.

### La regla per a la passa 2 (substitucions)

Cada substitució es fa així, i si no es pot fer així **no es fa**:

1. Es canvia **un** número d'**un** lloc.
2. Es mesura la peça afectada a les cinc mides, abans i després.
3. Si cap número no es mou, se segueix. Si es mou, **s'atura i s'explica per
   què**, no s'ajusta el número nou perquè quadri.

I el punt més important, amb una esmena: **no es canvia un valor aproximat per
l'exacte sense dir quants píxels mou.** A la primera substitució (`7650fca`) es
va canviar el `0,3385` pel derivat i va moure **0,042 px com a màxim**: es va
fer perquè l'objectiu de la passa és que el número tingui origen, i es va
reportar el número. El que no es pot fer és canviar-lo i dir que «no ha mogut
res», perquè sí que mou.
