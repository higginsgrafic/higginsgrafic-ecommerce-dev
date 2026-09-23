# Informe: formats, orientacions i breakpoints (HIGGINS GRÀFIC)

**Data:** 2026-09-24 · **Abast:** `higginsgrafic-ecommerce-dev` · Tot el que hi
ha aquí és **mesurat al projecte**, no recomanat de manual. El que és una
recomanació va marcat com a tal.

---

## 1. Objectiu

Saber **quins formats hem de cobrir** perquè el desplegament no deixi cap
dispositiu a mitges, i **quines fronteres** (breakpoints) els assignen el seu
disseny. L'objectiu no és triar amplades boniques: és que cap aparell real quedi
en un forat entre dues regles.

Estat: **46 formats** inventariats i mesurats amb `scripts/mesura-formats.mjs`
(`node scripts/mesura-formats.mjs` amb el servidor al 3003). D'aquests, **6
queden avui sense cap manera d'obrir el cistell** i **17 no veuen la pàgina nova
perquè encara no tenen vista per sota de 768 px** (els 16 telèfons i les 6
tauletes de 533 a 744, menys els apaïsats de 832 en amunt).

## 2. Formats d'imatge i vídeo

### 2.1 Imatges: què hi ha de debò al repo

| format | fitxers a `public/` | ús |
|---|---|---|
| **WebP** | **2823** | El format de la casa. Producte, fons, franges, mockups. |
| **SVG** | 39 | Logotips, icones, màscares (`mask-image`). Escalen sense perdre res. |
| PNG | 9 | Residus (placeholders, captures). |
| MP4 | 1 | Vídeo (vegeu 2.2). |
| AVIF | 0 | **No se serveix.** Només apareix a la llista d'extensions permeses en pujar fitxers (`src/api/supabase-products.js`). |

A `src/` es referencien 1603 `.webp`, 121 `.svg`, 5 `.png`, 3 `.jpg`, 2 `.jpeg`.

**El pipeline de variants ja existeix.** `scripts/optimize-images.sh` accepta
`--widths=400,800,1200` (via `cwebp`) i hi ha **42 imatges amb les tres
variants** a disc (`-400w`, `-800w`, `-1200w`).

**I aquí està el forat:** al codi hi ha **0 `srcset` i 0 `<picture>`**. Les
variants existeixen i el navegador no en sap res: cada component referencia un
sol fitxer i totes les pantalles es baixen el mateix. Sí que s'usen
`loading="lazy"` (38), `decoding="async"` (41) i `fetchpriority` (2).

**Recomanació (és una recomanació):** les variants ja hi són, així que el pas
següent és declarar-les a les imatges que avui són `<img>` normals:

```html
<img
  src="/placeholders/tots_els_fons/fons-cistell-compra-800w.webp"
  srcset="/…/fons-cistell-compra-400w.webp 400w,
          /…/fons-cistell-compra-800w.webp 800w,
          /…/fons-cistell-compra-1200w.webp 1200w"
  sizes="(max-width: 767px) 100vw, (max-width: 1366px) 992px, 1350px"
  loading="lazy" decoding="async" alt="…" />
```

Els `sizes` han de seguir **el carril del projecte** (992 px a la banda de
768–1366, 70,3 vw per sobre, amb sostre de 1350), no els breakpoints genèrics:
si es declaren amplades que el layout no fa servir, el navegador tria una
variant que no toca. Els fons i les màscares del megaslide es posen amb
`mask-image`/`background`, i allà `srcset` no hi arriba: per a aquells, la
variant s'ha de triar pel carril.

### 2.2 Vídeo

N'hi ha **un**: `/video/ec-preview-video.mp4`, i només surt a les pàgines de
previsualització (`/ec-preview`, `/ec-preview-lite`). Una sola font, sense
`<source>` alternatiu ni WebM. A la botiga no hi ha vídeo.

Si el vídeo arriba a la botiga: **MP4 (H.264/AAC) + WebM (VP9/AV1)** com a dues
fonts, `preload="metadata"`, pòster en WebP i 720p/1080p com a màxim.

## 3. Part responsiva vs part per grups de display

### 3.1 La base d'aquest projecte no són media queries

A `src/*.css` hi ha **4 media queries en total** (una `max-width: 767px`, una
`768–1024 px portrait`, una `orientation: portrait` i una `min-width: 1280px`).
La resta del layout no ve de breakpoints sinó de **variables de CSS publicades
des de JavaScript**:

| variable | valor | qui la decideix |
|---|---|---|
| `--contingut-max` | `min(70.3125vw, 1350px)` | `foundation.css` (estàtica) |
| `--u` | `--contingut-max / 1350` | `foundation.css` |
| `--esp-1..4` | `--u × 8 / 16 / 40 / 120` | `foundation.css` |
| `--appHeaderOffset` | 80 / 123 px | `layoutModel` (JS) |
| `--hg-mega-w`, `--hg-mega-x` | carril del megaslide | `FullWideSlideHeader` (JS) |
| `--hg-band-w`, `--inici-nou-carril` | carril de la pàgina nova | `FullWideSlideHeader` (JS) |

O sigui: **el carril de 1350 px és el regle del disseny**, i tot s'hi expressa
en proporció (`--u`). Això és el contrari de la guia genèrica de breakpoints, i
té una conseqüència important: **el text no pot baixar de mida indefinidament**
(hi ha un terra tipogràfic), però la geometria sí.

### 3.2 Els grups que hi ha avui (i que no coincideixen)

| llindar | on viu | per a què |
|---|---|---|
| 640 / 768 / 1024 / **1280** / 1400 | Tailwind (`2xl` canviat a 1400) | classes de component |
| **600** | `useDeviceLayout` i `layoutModel` | barra inferior de mòbil, alçada de capçalera |
| **768** | `useIsMobile` i el `md:` de Tailwind | **icones de la capçalera** i si la pàgina pinta contingut |
| 1100 | `ALCADA_TAULETA_APAISADA_MAX` | separa tauleta apaïsada de monitor |
| 1366 | `MIDA_TAULETA_APAISADA_MAX` | final de la banda de tauleta apaïsada |

**El problema és que n'hi ha dues de "mòbil": 600 i 768.** Entre 600 i 767 no és
ni una cosa ni l'altra: la barra inferior no s'hi munta (perquè `isMobile` és
fals) i les icones de la capçalera tampoc (perquè `md:` és fals). El resultat
mesurat són **6 formats sense cap accés al cistell**:

| format | aparell | offset reservat |
|---|---|---|
| 640×360 | Android 360 girat | **64** (el pedaç `ESTRETA`) |
| 667×375 | iPhone SE/8 girat | **64** |
| 613×981 | Huawei MatePad Pro 12,2" | 123 |
| 616×1024 | Galaxy Tab S9 Ultra | 123 |
| 640×1024 | Huawei MatePad Pro 13,2" | 123 |
| 744×1133 | **iPad mini 6** | 123 |

En apaïsat, a més, aquesta franja no cau en cap de les quatre categories i va a
petar a `ALCADA_CAPCALERA_ESTRETA = 64`: la capçalera fa 81 px i la pàgina en
reserva 64. La constant està documentada al codi com a «avui no es dona enlloc».
Sí que es dona.

### 3.3 El carril es congela entre 768 i 1366 (i té un penya-segat)

Mesurat:

| amplada | `--hg-mega-w` | carril de la pàgina nova | hero |
|---|---|---|---|
| 1023 | 992 | 933 | 933×314 |
| 1024 | 992 | 933 | 933×314 |
| 1025 | 992 | 933 | 933×314 |
| 1365 | 992 | 933 | 933×314 |
| **1366** | **992** | **933** | **933×314** |
| **1367** | **961** | **904** | **904×305** |
| 1440 | 1013 | 953 | 953×321 |
| 1920 | 1350 | 1270 | 1270×428 |

Dues coses:

1. **Entre 768 i 1366 el carril està congelat a 992 px** (i la pàgina nova a
   933). El disseny no s'adapta en tota aquesta banda: és el mateix a 768 que a
   1366. (Matís: per sota de ~1000 px d'amplada la hero encara no arriba als
   933, perquè no hi cap a la finestra: fa 753 a 768 i 885 a 900. El carril
   congelat es nota de ple a partir de 1000.)
2. **A 1367 el carril s'ESTRETA** (992 → 961) perquè passa a ser proporcional
   (70,3 vw). Un píxel més de pantalla dona un disseny **31 px més estret**. És
   el pitjor artefacte de les regles actuals: la finestra més gran de la banda
   té el disseny més ample, i ampliar-la l'empetiteix.

## 4. Orientacions

El projecte **no fa servir `orientation:`** per decidir res del layout (només hi
ha una media query d'orientació, a `foundation.css`). Decideix per **mides**:

| regla | condició | disseny | formats reals que hi cauen |
|---|---|---|---|
| mòbil | w < 600 | capçalera 80 + barra inferior | telèfons 360–440 vertical |
| tauleta vertical | 600 ≤ w ≤ 1024 i h > w | **capçalera de dues files (123)** | tauletes 613–1024 vertical |
| tauleta apaïsada | 768 ≤ w ≤ 1366, h < w, h ≤ 1100 | capçalera 80, carril 992 | telèfons 832–932 girats, tauletes apaïsades, **portàtils 1280 i 1366** |
| escriptori | la resta amb w ≥ 1024 | capçalera 80, carril 70,3 vw | 1440, 1512, 1536, 1728, 1920, 2560 |

Amplades CSS reals (matriu de dispositius 2025):

- **Telèfons vertical:** 360, 375, 384, 390, 393, 402, 412, 430, 440. Cap arriba
  a 600. Girats: 640–956 d'amplada, 310–430 d'alçada.
- **Tauletes vertical:** 533, 584, 613, 616, 640, **744 (iPad mini)**, 768, 820,
  834, 1024, 1032. Girats: 744–1376 d'amplada.
- **Portàtils i escriptori:** sempre apaïsats.

**El que això vol dir:**

- **En vertical, 600–767 no és cap telèfon**: és la franja de l'iPad mini (744) i
  dels MatePad (613, 640) i Tab S9 Ultra (616). No és inventada.
- **En apaïsat, 600–767 sí que és un telèfon**: l'iPhone SE/8 girat fa 667×375 i
  l'Android 360 girat 640×360. I són justament els dos que perden el cistell.
- Les tauletes de 533 i 584 (Tab S9, Tab S9+) cauen a **mòbil**: funcionalment
  bé (tenen barra inferior), però reben el disseny de telèfon.

## 5. Els 1280 px: la guia diu escriptori, el projecte diu tauleta apaïsada

La guia general (i Material Design, i els frameworks) tracten **1280 px com
l'entrada d'escriptori**. Aquest projecte, no: la regla de tauleta apaïsada
arriba fins a 1366 px, així que **1280×720 i 1280×800 es tracten com a tauleta
apaïsada** (i 1366×768 també). El tall de 1366 es va triar per no deixar fora
tauletes Android 16:10, i s'hi han colat els dos portàtils més comuns del món.

Conseqüències mesurades:

| | 1280×720 (finestra 586) | 1366×768 (finestra 634) | 1440×900 (finestra 766) | 1920×1080 (finestra 946) |
|---|---|---|---|---|
| classificació | tauleta apaïsada | tauleta apaïsada | escriptori | escriptori |
| carril | 992 (congelat) | 992 (congelat) | 1013 | 1350 |
| hero | 933×314 | 933×314 | 953×321 | 1270×428 |
| hi cap? (megaslide obert) | **no, 136 px per sota** | **no, 87 px per sota** | sí, +3,4 px | sí, +2,5 px |

O sigui: **la guia diu que 1280 és escriptori, i el projecte li dona el disseny
més ample de tots els portàtils** — i tot i així no hi cap. Passar 1280 a
escriptori **no arregla l'encaix**: el carril baixaria de 992 a 900 i la hero
s'encongiria uns 29 px dels 136 que sobren. L'encaix a 1280×720 és un problema
de disseny (capçalera + panell + hero + cadenat en 586 px), no de breakpoint.

I té un cost afegit: la banda `esBandaEstreta` (768–1366) existeix precisament
perquè el nav d'escriptori no hi cap — amb el desplaçament `-5%` i el `gap`
d'escriptori, la «F» de FIRST CONTACT quedava sota el logo a 1280. Fer 1280
escriptori vol dir tornar a mesurar el nav amb un carril de 900 px.

## 6. La llista de formats a cobrir (46)

- **Telèfons vertical (9):** 360×640, 375×667, 384×832, 390×844, 393×852,
  402×874, 412×915, 430×932, 440×956.
- **Telèfons apaïsat (7):** 640×360, 667×375, 832×384, 844×390, 852×393,
  915×412, 932×430.
- **Tauletes vertical (11):** 533×853, 584×934, 613×981, 616×1024, 640×1024,
  744×1133, 768×1024, 820×1180, 834×1194, 1024×1366, 1032×1376.
- **Tauletes apaïsades (11):** 853×533, 934×584, 981×613, 1024×616, 1024×640,
  1133×744, 1024×768, 1180×820, 1194×834, 1366×1024, 1376×1032.
- **Portàtils i escriptori (8):** 1280×800, 1366×768, 1440×900, 1512×982,
  1536×1024, 1728×1117, 1920×1080, 2560×1440.

L'alçada de finestra de cada un és la de la pantalla menys el navegador
(134 px Chrome d'escriptori, 78/72 Safari de tauleta, 132 mòbil vertical, 50
apaïsat), que és el que decideix si el contingut hi cap.

## 7. Decisions obertes

1. **Unificar la frontera de mòbil** (600 vs 768). Tanca els 6 forats i el
   pedaç de 64 px. Dues opcions: baixar-la a 768 (ràpid, l'iPad mini queda amb
   navegació de mòbil però funciona) o pujar el disseny de tauleta a 600 (cal
   mostrar les icones des de 600 i verificar el megaslide entre 600 i 767, on no
   s'ha provat mai res).
2. **Declarar `srcset`/`sizes`** a les imatges: les variants ja existeixen.
3. **1280 i 1366**: decidir si són escriptori (i mesurar-ne el nav) o es
   queden com a tauleta apaïsada.
4. **L'encaix de la hero** als formats apaïsats de portàtil (1024×690, 1280×666,
   1366×634): no hi cap amb el megaslide obert. Demana decisió de disseny.
5. **La pàgina nova per sota de 768**: avui diu «encara no té la vista mòbil».
6. **El menú de col·leccions de la tauleta vertical** talla per sota de 698 px
   d'amplada (49 px per banda a 600): va centrat dins un contenidor més estret
   que el contingut.
