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
| files (col·lecció) | **90** | `gridRows` |
| columnes (col·lecció) | **4** | `numCols` |
| gap vertical de la graella | **3 px** | `gutterY` |

**Una fila del llenç de col·lecció** = `6708 / 90` = **74,533 unitats**, i en
píxels, mesurat, `0,028072 × carril` (no `0,028219`, vegeu §4).

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
| `TdpVariantsGallery:48`, `Home.jsx` (×4) | `× 0.84632` | **30 files** del llenç | CLAR |
| `TdpVariantsGallery:48`, `Home.jsx` (×4) | `− 231px` | **?** — no és cap fila (6,07 files a 1920, 11,37 a 1024) | **PENDENT** |
| `ProductDetailTemplate:151`, `ConstructorPdpPreview:210` | `× 5217/2642/70` | una fila d'un **altre** llenç (5217) | CLAR |
| `CollectionVerticalPage:83` | `carril × 0.0280625 − 2.875` | una fila + un ajust | **PENDENT** (el `− 2,875`) |
| `layoutMetrics:137` | `MEGASLIDE_REFERENCIA_PX = 1350` | l'amplada del carril a 1920 | CLAR |

**El coeficient exacte de la fila** (comprovat): `74,5333 / 2642 = 0,02821095`.
És el número que hauria de sortir de l'expressió; el codi escriu `0,0282194`
(diferència 3·10⁻⁶) i el navegador **mesura** `0,028072`. Les tres xifres són
germanes i les tres són diferents: per això aquests coeficients s'han de
derivar del llenç i no escriure's.

### 2.2 Proporcions de la pròpia peça (ja són bones)

Aquests no cal tocar-los: es mesuren contra la peça, no contra la pantalla.

| on | valor | què vol dir | estat |
|---|---|---|---|
| `CollectionVerticalPage:158-163` | `× 0.72 / 0.2 / 0.07 / 0.095 / 0.15 / 0.1` | amplada del selector, alçada, font de talla, font de text, cistell, gap del preu — **tot sobre l'amplada de la fitxa** | CLAR |
| `tdpMida.js` | columnes per amplada, alçada 5:4 | la font única de la mida de la fitxa | CLAR |

### 2.3 Desplaçaments de rescat (no escalen, i són el que ha de marxar)

| on | valor | què compensa | estat |
|---|---|---|---|
| `Home.jsx:543` | `+ 305,95` (de JavaScript) | la posició de la hero, mesurada de la pantalla | **PENDENT** |
| `Home.jsx:317-319` | `baixadaHero`: `+25` / `+70` / `+125` | tres dispositius, tres números | rescat |
| `Home.jsx:493` | `translateY(89 / 66 / 86 / 9px)` | centrar les icones, un número per dispositiu | rescat |
| `Home.jsx:545` | `height: 430px` a vertical | la mida de la hero a tauleta, deslligada de l'escala | **PENDENT** |
| `Home.jsx:714` | `marginTop: 435 / 40 / 100px` | la secció de sota la hero, un número per dispositiu | rescat |
| `Home.jsx:417` | `height: 752px` | l'alçada de la graella a vertical | **PENDENT** |
| `collectionVertical.js:137-138` | `338px`, `−240px` | el gap hero→TDP a tauleta | rescat |
| `collectionVertical.js:75` | `−41px` | el mateix a escriptori | rescat |
| `collectionVertical.js:60` | `clamp(120px, 26vh, 260px)` | l'alçada de la franja | rescat |
| megaslide | terres de **10 px** i **12 px** | llegibilitat del text quan l'escala baixa | rescat |

### 2.4 Números que semblen calibradors i no ho són

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

## 4. Les tres coses que la mesura ha corregit

1. **`0,3385` és `12 files / 2642` = `0,338531`**, no `0,028219 × 12`. L'origen
   és correcte i llegible: **12 files del llenç**. La fila que el navegador
   **pinta** fa `0,028072 × carril`, o sigui 12 files reals són `0,336864`: el
   `0,3385` té una deriva de fins a **1,7 px** a 1440 (amb el signe que allunya
   les fitxes de la hero). La intenció és correcta; el número és aproximat, i
   la diferència entre els tres coeficients germans (`0,028211` teòric,
   `0,028072` pintat) és la que fa que cap d'ells es pugui escriure a mà.
2. **El `− 231` no és cap fila del llenç.** Ho vaig deduir malament el
   23/09/2026. Equival a 6,07 files a 1920 i 11,37 a 1024: no és proporcional a
   res. Queda **PENDENT** fins que es mesuri on va néixer.
3. **Els «terres» del megaslide no són calibratges sinó pedaços**, i la regla 15
   diu que s'han d'evitar quan la causa es pot tocar. La causa és que el text i
   les files es mesuren amb dos sistemes diferents.

---

## 5. Ordre de treball proposat

1. **Aquest mapa** (fet).
2. **Declarar els paràmetres del llenç en un sol lloc**, amb nom, i fer que les
   fórmules els llegeixin. Zero canvi de píxel; es verifica amb el comparador.
3. **Mesurar els PENDENT** (`− 231`, el `− 2,875` del `rowHeight`, el `430px` de
   la hero, el `752px` de la graella) i donar-los origen o jubilar-los.
4. **Separar `--escala` de `--escala-text`** a `foundation.css`, que és el que
   fa possible que la geometria escali sense arrossegar el text.
5. **Migrar l'inici**, amb la hero, i després una col·lecció.
