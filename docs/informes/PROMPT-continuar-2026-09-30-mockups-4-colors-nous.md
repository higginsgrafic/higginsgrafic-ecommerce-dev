# Continuar: les stripes amb els colors nous (i la resta del canvi)

Data: 29/09/2026 · Branca: `main`

## FET (29/09/2026)

- **556 mockups** dels 4 colors nous (139 dissenys × 4), desats a l'arxiu
  `MOCKUPS 3/MOCKUPS/<col·lecció>/` i copiats a
  `public/placeholders/apparel/mockups/<col·lecció>/`. Guió:
  `scripts/munta-mockups-colors-nous.py` (2 minuts; `--prova` per veure què faria).
- **Les samarretes**: `public/placeholders/apparel/t-shirt/mockup-gildan/`, 14
  `mockup-gildan-t-shirt-<color>.webp` (800×800) + `colors.json` +
  `manifest.json`. Els 10 comuns copiats del G5000 i els 4 nous fets amb blanc
  del G5000 × el color mesurat a la G64000.
- **Un sol helper**, `tshirtSrc(color)` a `src/utils/placeholders.js`; 19 fitxers
  i 56 usos recablejats. Esborrades `t-shirt/gildan_5000/` i
  `t-shirt/gildan_64000l/`.
- **La norma de la inversió**, aplicada al guió dels mockups (punt 0).
- Res d'això no està commitejat.

## FET (29/09/2026, nit): el canvi de paleta sencer (punts 2, 3, 4 i 5)

Els punts 2, 3, 4 i 5 d'aquest full ja estan fets. La paleta canònica és única
(`SHIRT_COLORS` a `src/lib/mockupPaths.js`) i `TSHIRT_COLORS` de
`src/utils/placeholders.js` la reexporta: no hi ha dues llistes que es puguin
descoordinar.

- **Punt 2 (10 llistes)**: `mockupPaths.js`, `ProductDetailTemplate.jsx`,
  `PdpPage.jsx`, `PdpMobile.jsx`, `ConstructorPdpPreview.jsx` (+ noms),
  `pdpMockup.js` (`SHIRT_COLOR_ORDER`), `homeDrawings.js`,
  `collectionVertical.js` (graella 4×4 i `CANON_COLORS`),
  `ConstructorColleccioPage.jsx` (+ noms) i `productRoutes.js` (`ALL_COLORS`).
  Totes amb els 14 colors, en l'ordre bo (el de la tira de l'amo; vegeu el
  punt 2 de més avall, que l'ordre es va haver de corregir).
- **Punt 3 (pastilles)**: `CercadorTopBar.jsx` i `data/collections.js` amb els
  14 slugs i, per als 4 nous, l'hex i l'overlayHex **mesurats dels mockups**:
  `rs-sport-grey #8C8E90` / `#777879`, `ice-grey #CBC5BE` / `#ADA7A1`,
  `charcoal #4D5252` / `#414545`, `dark-chocolate #332A28` / `#2B2422`.
- **Punt 4 (foscos)**: els 6 llocs (`cartImage.js`, `drawingPaths.js`,
  `pdpMockup.js`, `productRoutes.js`, `CheckoutContent.jsx`, `homeDrawings.js`)
  amb 8 foscos: `royal, navy, red, irish-green, military-green, black,
  charcoal, dark-chocolate`. Fora purple, light-pink, kiwi i forest-green.
- **Punt 5**: el mapa d'equivalències de `placeholders.js` s'ha **quedat** (és
  la xarxa de seguretat per a dades velles i el comprova
  `scripts/_tmp-check-tshirt-src.mjs` amb 21 casos). `Home.jsx`,
  `HeroSlider.jsx`, `MegaHeroSlider.jsx`, `TambeRail.jsx` i
  `ConstructorColleccioPage.jsx` ja demanen colors nous; `ProductGallery.jsx`
  també (`Forest` → dark-chocolate, `Verd` → irish-green). `RuletaDemoPage.jsx`
  té la paleta nova, però **segueix sense botons** `selector-color-*` per als 4
  nous: el codi ja preveu el `src` buit i la ruleta no es trenca.
- **Comprovat**: `node scripts/_tmp-verifica-paleta-nova.mjs` (canònica, **les
  10 llistes i les 2 graelles en l'ordre bo**, 1946
  mockups demanats i 0 absents, 0 fitxers amb color vell, 14 pastilles als dos
  llocs), `scripts/_tmp-verifica-paleta-navegador.mjs` (5 pantalles sense cap
  404 ni cap imatge trencada), `_tmp-check-tshirt-src.mjs` (21/21 a 200),
  `_tmp-qui-rep-el-clic.mjs` (14/14) i `npx vite build` (cap error de mòdul).

Segueix pendent només el que ja estava pendent de l'altre full: **els mockups de
LFMD esmorteïts**.

## FET (29/09/2026, nit): les dues franges amb els colors nous

L'amo ha exportat les dues fileres i s'han instal·lades. Els originals els va
deixar a `public/placeholders/t-shirt_buttons/v6/`; com que la geometria és la
mateixa de sempre, **s'han desat sobre els camins que el codi ja demana**, sense
tocar ni una línia de codi:

| original (v6) | instal·lat a |
|---|---|
| `full-color-stripe-(6).webp` (2866×307) | `t-shirt_buttons/v5/full-color-stripe-5.webp` |
| `full-color-stripe-doble.webp` (1488×643) | `tablet vertical/full-color-stripe-doble.png` (convertit a PNG amb `sips`, perquè el codi demana `.png`) |

Comprovat abans d'instal·lar-les:

- **Mateixa mida i mateixa silueta.** La filera: 2866×307 i l'alfa difereix de la
  vella 1,23/255 de mitjana. La doble: 1488×643 i els 14 centres de massa de les
  samarretes cauen a menys de **2,5 px** dels de la blanca de referència. O sigui
  que les àrees de clic i les calibracions no es mouen.
- **Els 14 colors, en l'ordre nou**, a totes dues. La filera, mostrejant el pit
  (x = 204,7·(i+0,5), y = 0,62·307); la doble, per (fila, columna) amb 7 columnes
  i les files a 0,30 i 0,78 de l'alçada. Donen, en ordre:
  white, light-blue, royal, navy, irish-green, military-green, daisy, gold, red,
  dark-chocolate, ice-grey, rs-sport-grey, charcoal, black. Cap resta de purple,
  light-pink, kiwi ni forest-green.
- Al navegador: la filera es pinta a 790×85 (la proporció bona) i la doble es
  demana i carrega (200) a les vistes verticals, sense cap 404.
  `_tmp-qui-rep-el-clic.mjs` continua fent **14/14**.

Les dues blanques (`cercador/full-white-stripe.webp` i
`tablet vertical/full-white-stripe-doble.png`) NO s'han tocat: són l'estat buit.

## Com es van haver d'exportar (context)

**Què són**

| fitxer | mida | què és |
|---|---|---|
| `public/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp` | 2866×307 | les 14 samarretes en una filera (la franja de la p1) |
| `public/placeholders/tablet vertical/full-color-stripe-doble.png` | 1487×643 | les 14 en dues fileres de set (la p2) |
| `public/placeholders/cercador/full-white-stripe.webp` | 2866×307 | la versió blanca (estat buit/velat) |
| `public/placeholders/tablet vertical/full-white-stripe-doble.png` | 1488×643 | la blanca de la p2 |

**On es fan servir:** `FullWideSlideHeader.jsx:2868` i `:2954`,
`MegaStripePanel.jsx:1013`, `MegaStripePanelP1.jsx:1208`,
`MegaslidePagina2.jsx:1102`, `MegaMenuPanel.jsx:589`.

**L'ordre nou** (dictat per l'amo, llegit de la seva imatge):

```
white, light-blue, royal, navy, irish-green, military-green, daisy, gold,
red, dark-chocolate, ice-grey, rs-sport-grey, charcoal, black
```

**L'ordre vell** de la stripe: `white, light-blue, royal, navy, purple,
light-pink, daisy, gold, red, kiwi, irish-green, military-green, forest-green,
black`.

**PER QUÈ CALIA L'EXPORT (29/09/2026, vespre) — RESOLT:** no s'ha pogut
reproduir la geometria de la stripe per codi. S'ha provat de recompondre-la amb
les fotos de samarreta (les de 800 del joc vell i els renders de 3000 de
`EN BLANC/SAMARRETES/GILDAN 5000/TRIADES`) i la diferència mitjana es queda
sempre a **~13/255**, amb qualsevol escala, desplaçament i pas. També s'ha provat
el que semblava més net —tenyir la `full-white-stripe.webp` amb el color de cada
casella— i tampoc: el material de la blanca no és el mateix, i contra les
caselles que ja existeixen la diferència surt de **30 a 80/255**. O sigui que les
samarretes **no** estan col·locades ni a `2866/14` ni a un pas fix de ~197, i la
stripe **només és reproduïble tornant a exportar-la**.

Les dues ja s'han tornat a exportar i instal·lar (vegeu el «FET» de dalt). El
camí queda documentat per si mai s'ha de repetir: exportar les mostres noves des
del font i desar-les sobre els camins de sempre, verificant abans que la mida i
la silueta no s'han mogut.

**QUÈ CALDRIA SI TORNÉS A CALDRE**

1. Saber com es va fer: el fitxer font d'Il·lustrator (o SVG), o el guió que la
   va muntar.
2. Si és d'Il·lustrator: canviar-hi les 14 mostres de color i tornar a exportar.
3. Si s'ha de muntar per codi: definir la col·locació i, DESPRÉS, repassar les
   calibracions dels dibuixos (`stripeCalibrations*.js`) i les àrees de clic
   (`full-clic-area-5.svg`, `full-clic-area-vertical.svg`), que hi estan
   lligades.

**El guió mig fet:** `scripts/refa-stripes-colors-nous.py` tenyeix la stripe
vella per caselles. **NO el feu servir tal com està**: els talls de casella no
coincideixen amb les samarretes i deixa restes del color del veí (ja s'ha
comprovat i s'han esborrat els intents). Serveix de punt de partida.

**Els «vels» de la p2**: són les versions blanques de la taula de dalt. Com que
són blanques, amb els colors nous no haurien de canviar; confirmar-ho amb l'amo.

## La norma de la inversió (dictada per l'amo el 29/09/2026)

```
Blanc/Negre (tinta de línia)
    samarreta blanca  -> tinta NEGRA
    samarreta negra   -> tinta BLANCA
    la resta          -> el que correspongui segons el clic

Color (tinta multi)
    samarreta blanca  -> tinta DARK
    samarreta negra   -> tinta LIGHT
    la resta          -> tinta LIGHT
```

## La regla de la inversió — AMPLIADA (29/09/2026, nit)

**La regla s'aplica a tots els colors nous** (29/09/2026): `navy`, `dark-chocolate`
i `charcoal`, que són foscos, porten tinta blanca; `ice-grey` i `rs-sport-grey`,
que són clars, porten tinta negra. La tinta `multi` (COLOR) no s'inverteix mai.

```
samarreta white, ice-grey, rs-sport-grey           -> tinta NEGRA
samarreta black, navy, dark-chocolate, charcoal    -> tinta BLANCA
la resta                                          -> el que correspongui segons el clic
```

La regla estava **copiada a quatre fitxers**; ara viu en un sol lloc,
`invertLineInk()` i les llistes `INK_INVERTS_ON_LIGHT` / `INK_INVERTS_ON_DARK` a
`src/lib/mockupPaths.js`, i l'apliquen `cartImage.js`, `drawingPaths.js`,
`pdpMockup.js` i `CheckoutContent.jsx`.

També s'ha estès al que en depèn:

- `pdpMockup.js` — `productThumbnailFor()` (tinta d'una cel·la de graella) i
  `visibleFinishesFor()`: amb navy o dark-chocolate s'hi veuen **BLANC i NEGRE**
  (com amb blanc i negre), perquè tots dos acaben en tinta visible.
- `pdpMockup.js` — el carrusel de variants ara afegeix la **parella inversa**
  també per a navy i dark-chocolate (`w-navy` / `w-dark-chocolate` + `b-white`),
  igual que ja feia amb black.

Comprovat: `scripts/_tmp-inversio-navy.mjs` (21 casos d'acabat × color, tots amb
la tinta que toca), `_tmp-inversio-fitxers.mjs` i `_tmp-inversio-carousel.mjs`
(totes les imatges que en surten existeixen i fan 200), i les **644 variants
d'inversió** (b/w × white, ice-grey, rs-sport-grey, black, navy, dark-chocolate
charcoal a cada col·lecció) del comprovador de paleta, totes presents. Al navegador, `pdpMockup` ja serveix
`-w-navy` i `-w-dark-chocolate` on toca, sense cap 404.

**OJO, per si algun dia es revisa:** `charcoal` també és fosc, i avui **no**
s'inverteix (segueix la regla general: tinta negra, que es veu bé sobre
charcoal). Si l'amo volgués el mateix tractament per a charcoal, n'hi hauria
prou d'afegir-lo a `INK_INVERTS_ON_DARK` — i `b-charcoal`/`w-charcoal` ja hi són
tots dos.

## La inversió va per PARELLES (29/09/2026, nit)

L'amo ho va precisar: **la inversió funciona per parelles** (Blanc/Negre,
Dark/Light). Els 6 colors de les parelles i la tinta que els toca:

| parella | membre clar → tinta fosca | membre fosc → tinta clara |
|---|---|---|
| Blanc / Negre | `white` → `b-white` | `black` → `w-black` |
| Light Blue / Navy | `light-blue` → `b-light-blue` | `navy` → `w-navy` |
| Ice Grey / Dark Chocolate | `ice-grey` → `b-ice-grey` | `dark-chocolate` → `w-dark-chocolate` |

És el que ja fa `invertLineInk()` (el to de la samarreta decideix la tinta), o
sigui que **el codi no s'ha tocat**: la feina era deixar els 6 fitxers amb la
tinta que els toca.

**Els 2 que no hi eren** (`b-navy` i `b-ice-grey`, 46 dissenys × 2 = **92
fitxers**): portaven la impressió de l'altre membre de la parella. S'han
sobreescrit amb una **còpia exacta de `b-light-blue`**, que és el germà que ja
tenia la tinta fosca: el generador fa els quatre colors nous amb el mateix
dibuix per tinta, i entre `b-light-blue` i `b-navy` hi havia 0–4/255 de
diferència (soroll de recompressió). Els altres quatre ja eren correctes.

**Nota per a qui ho revisi:** el contrast tinta/samarreta **no es comprova en
lloc de res**. Hi ha combinacions que són poc vistoses **a posta** (ho ha dit
l'amo el 29/09/2026), o sigui que un contrast baix no és cap error. La prova del
verificador mira **només** que la tinta sigui la que toca pel nom.

**L'arxiu de 3000px** (`_ 97 MOCKUPS/MOCKUPS 3/MOCKUPS/`) té els mestres, i allà
`b-navy` i `b-ice-grey` encara són com eren. No s'hi ha tocat: són màsters de
producció, no còpies dels de 800.

## La regla de la inversió (context original)

```
Blanc/Negre (tinta de línia)
    samarreta blanca  -> tinta NEGRA
    samarreta negra   -> tinta BLANCA
    la resta          -> el que correspongui segons el clic

Color (tinta multi)
    samarreta blanca  -> tinta DARK
    samarreta negra   -> tinta LIGHT
    la resta          -> tinta LIGHT
```

La inversió **només salta amb `white` i `black` de nom**, no pel to: `light-blue`
i `light-pink`, que són ben clares, no inverteixen. Comprovat als mockups
actuals: `first-contact-nx-01-w-white.webp` porta la impressió **NEGRA** i
`-b-black` la porta **BLANCA**, i cap dels altres 12 colors inverteix.

És el que ja fan `resolveInk()` (`src/lib/cartImage.js`, `src/lib/pdpMockup.js`)
i el `multiTone` de `computeStripeTileOverlaySrcs()`. Per als 4 colors nous, per
tant: `-b-` → NEGRE, `-w-` → BLANC i `-multi-` → **multi-light** (cap dels quatre
es diu white ni black).

Ho aplica `scripts/munta-mockups-colors-nous.py`, que és el guió que munta els
mockups nous.

## Els mockups dels 4 colors nous — FET (139 dissenys × 4 = 556)

Els mockups viuen a `public/placeholders/apparel/mockups/` (1946 fitxers: 139
dissenys × 14 colors) i a l'arxiu `MOCKUPS 3/MOCKUPS/`. Els 4 colors nous ja hi
són tots.

Com es van fer, per si cal repetir-ho: la posició i la mida de la impressió es
dedueixen del mockup vell del mateix disseny (comparant-lo amb la samarreta
buida), es tria la referència que té una **forma** que lliga amb la del dibuix
(no només la que té més píxels), i el dibuix del volum es compon **escalat
uniformement i centrat**, que és el que evita les deformacions. Els dibuixos
grossos de CUBE (fins a 273 Mpx) es redueixen abans de carregar-los.

Els 7 avisos que queden són dissenys on el mockup vell està esmorteït (els marcs
de LFMD) o el dibuix de producció ha canviat, i la diferència és de 3-4/255.

Les carpetes:

```
cube · the_human_inside · first_contact · miscellania (5 dissenys a part)
austen/pemberley · austen/keep_calm · austen/cites/quotes
austen/crosswords/{persuasion,pride_and_prejudice,sense_and_sensibility}
austen/cites/looking_for_my_darcy
```

El nom és `<prefix>-<design>-<tinta>-<color>.webp` (tinta `b`/`w`/`multi`) i qui
els resol és `getMockupPath()` a `src/lib/mockupPaths.js`.

## 2. FET — Les llistes de paleta: 14 → 14 (10 comuns + 4 nous)

Als 10 llocs següents hi ha la llista de 14 colors escrita a mà. **Tots** han de
passar a l'ordre de la tira de colors de l'amo (29/09/2026, de la seva captura):

```
white, light-blue, royal, navy, irish-green, military-green, daisy, gold,
red, dark-chocolate, ice-grey, rs-sport-grey, charcoal, black
```

**Compte amb l'ordre:** `irish-green` i `military-green` van **abans** de `daisy`
i `gold`, i `black` **tanca** la filera. Aquest full deia abans un altre ordre
(el de `daisy, gold` davant, i `black` a la meitat) i el 29/09/2026 es va
escampar per error a totes les llistes — es va veure a la tira de colors de la
web i es va corregir. Ho caça `scripts/_tmp-verifica-paleta-nova.mjs`.

| fitxer | línies | què és |
|---|---|---|
| `src/lib/mockupPaths.js` | 26-34 | `SHIRT_COLORS` — **la canònica**; valida `getMockupPath` |
| `src/components/ProductDetailTemplate.jsx` | 43-44 | `OFFICIAL_COLORS` — el selector de la PDP |
| `src/pages/PdpPage.jsx` | 65-66 | la PDP antiga |
| `src/pages/PdpMobile.jsx` | 10-11 | la PDP mòbil |
| `src/pages/ConstructorPdpPreview.jsx` | 82-83 (+ noms 105-113) | la previsualització del constructor |
| `src/lib/pdpMockup.js` | 98-100 | `SHIRT_COLOR_ORDER` — l'ordre del carrusel |
| `src/components/home/homeDrawings.js` | 164-165 | els colors que surten a inici |
| `src/config/collectionVertical.js` | 269-272 i 289-292 | la graella 4×4 i la llista de la vertical |
| `src/pages/ConstructorColleccioPage.jsx` | 23-26 (+ noms 35-36) | la graella del constructor |
| `src/lib/productRoutes.js` | 83-84 | l'ordre de colors de les rutes |

## 3. FET — Les pastilles de color (slug + hex): 2 llocs

Aquí no n'hi ha prou de canviar slugs: cada color porta el seu `hex` i el seu
`overlayHex` (els colors de la pastilla i del vel).

| fitxer | línies |
|---|---|
| `src/components/fullwide/CercadorTopBar.jsx` | 43-51 |
| `src/data/collections.js` | 9-17 |

## 4. FET — Els conjunts de «color fosc»: 6 llocs

Serveixen per decidir si la tinta és blanca o negra. Cal **treure** purple,
light-pink, kiwi i forest-green i **decidir els 4 nous**: `charcoal` i
`dark-chocolate` són FOSCOS; `rs-sport-grey` i `ice-grey` són CLARS.

| fitxer | línia |
|---|---|
| `src/lib/cartImage.js` | 21 |
| `src/lib/drawingPaths.js` | 26 |
| `src/lib/pdpMockup.js` | 22 |
| `src/lib/productRoutes.js` | 90 |
| `src/components/fullwide/CheckoutContent.jsx` | 562 |
| `src/components/home/homeDrawings.js` | 170 |

## 5. FET — Quan la paleta ja estigui canviada

- `src/utils/placeholders.js` (comentari 19-21 i mapa 44-51): el mapa
  d'equivalències
  (`purple→navy`, `light-pink→ice-grey`, `kiwi→daisy`, `forest-green→irish-green`,
  `cardinal-red→red`) ja no caldrà. Mentre hi sigui, cap pantalla es trenca.
- `src/pages/Home.jsx` (22, 31, 40, 49, 58), `HeroSlider.jsx` (134),
  `MegaHeroSlider.jsx` (134), `ProductGallery.jsx` (121, 125) i
  `TambeRail.jsx` (8-21): ja passen pel helper, però alguns demanen colors vells
  i avui es pinten amb l'equivalent. S'hi poden posar els colors nous.
- `src/pages/RuletaDemoPage.jsx` (93-105): demana
  `/placeholders/t-shirt_buttons/selector-color-<color>.webp`, que **no
  existeixen** (ja passava abans). Si es vol fer servir, calen els 4 botons nous.

## 6. Assets amb els 14 colors VELLS que no fa servir ningú

No cal tocar-los perquè el codi no els demana, però hi són i algú els pot
confondre amb el joc bo:

- `public/placeholders/t-shirt_stripe/` — 14 `gildan-5000-t-shirt-<color>.webp`
- `public/placeholders/color-cards/` — 14 `color-card-<color>.webp` (+ `tmp/`)
- `/placeholders/t-shirt_buttons/selector-color-*` — **no existeix**, tot i que
  `RuletaDemoPage` els demana

## 6bis. FET (01/10/2026) — El «hsl()» que faltava: el separador del header

**La passa de conversió a tokens va deixar 158 usos PELATS** de
`var(--grey-*)` allà on cal un color. Els tokens són **tripletes crus**
(`--grey-line: 210 10% 92%`), pensats per anar dins d'`hsl(...)`. Un
`border-bottom-color: var(--grey-line)` és, doncs, **invàlid**: el navegador
descarta la declaració i la propietat cau al seu valor inicial
(`currentColor`) — o sigui, la tinta.

Símptomes que en venien (i que l'amo va veure):

- **El separador del header** es pintava amb la tinta (`rgb(76,84,93)`), no amb
  la línia: es veia una ratlla fosca sota la capçalera mentre el megaslide en
  tenia una de clara. Mesurat: header `1px solid rgb(76,84,93)`, megaslide
  `1px solid rgb(233,235,237)`.
- Tots els fons `var(--grey-paper)` sortien **transparents** (el megaslide
  inclòs), i les vores `var(--grey-line)`/`--grey-line-strong` també queien a
  `currentColor`: caixes i taules sense fons ni marc.

Arreglat amb un sol pas, a **38 fitxers** de `src/` (`.js`/`.jsx`): els 158
usos pelats passen a `hsl(var(--grey-*))`; `src/index.css` **no** es toca
(allà els `var(--grey-*)` són àlies de token, i hi han de ser pelats).

Comprovació (mesurada al navegador, 1440×900, `/?active=first_contact`):

| element | abans | després |
|---|---|---|
| vora del header (`[data-capcalera-fila="1"]` → pare) | `1px solid rgb(76, 84, 93)` | `1px solid rgb(233, 235, 237)` |
| vora del megaslide (`[data-mega-panel-surface="1"]`) | `1px solid rgb(233, 235, 237)` | `1px solid rgb(233, 235, 237)` |
| fons del megaslide | `rgba(0,0,0,0)` (trencat) | `rgb(255,255,255)` |

Les dues ratlles fan **1 px i la mateixa amplada** (1425 px a 1440 de viewport),
i per tant ja són la mateixa línia: la del megaslide és
`border-b border-border` → `hsl(var(--border))` → `hsl(var(--grey-line))`.

**Regla per a la resta de la conversió**: cap token cru (ni `--grey-*`, ni
`--white-strong`, ni els llegats `--border`/`--muted`/…) es pot fer servir mai
sense `hsl()`. Els àlies de `tailwind.config.js` ja hi porten l'`hsl()` posat.

## 6ter. FET (01/10/2026) — L'estona invisible del megaslide, sense espai buit

**Què va demanar l'amo**: «El megaslide, ara, baixa diferent. Primer apareix un
espai blanc i el cadenat i després fa l'efecte d'aparició, fade-in i el moviment
avall.» Va triar: **que no es vegi la pausa buida**.

**Comprovat abans de tocar res**: la seqüència era **idèntica** a la d'abans de
la sessió de colors (commit `eb96afca`), mesurada fotograma a fotograma amb el
mateix guió en un *worktree* temporal. La pausa invisible de 500 ms i el cadenat
que hi sortia ja hi eren. Allò que havia canviat era que, amb el fons del panell
altre cop vàlid, durant el fade s'hi torna a fondre un full blanc; en l'estat
trencat (el `hsl()` que faltava) el panell era transparent.

**Per què es veia l'espai blanc**: el panell es munta invisible (`opacity: 0`,
26 px més amunt) però **ja ocupa el seu lloc**, i aquell espai el pinta la
capçalera (`<header class="fixed … bg-background">`, que passa de 53 px a 432 px
a 1440×900). El cadenat viu en un portal ancorat a la vora del panell, i per
això sortia abans que el megaslide — just el que els comentaris del codi deien
que **no** havia de passar («comença amagat darrere el panell … quan el panell
ja s'ha desplegat»), cosa que fallava precisament perquè el panell és
transparent durant l'espera.

**Què s'ha fet** (2 fitxers):

- `src/components/fullwide/MegaMenuPanel.jsx`: l'estona invisible surt a
  `export const MEGA_PANEL_DELAY_MS = 500` i l'animació la llegeix d'aquí.
- `src/components/FullWideSlideHeader.jsx`: estat `panellComenca`, que s'encén
  `MEGA_PANEL_DELAY_MS` després de muntar-se el panell i s'apaga en
  desmuntar-se. Ment no s'encén, (a) la capçalera va amb `bg-transparent` —la
  fila del logo ja porta el seu propi fons— i per tant **es veu la composició
  que hi ha darrere**, i (b) el cadenat **no es munta**.

**Comprovat al navegador** (`node scripts/_tmp-mega-verifica.mjs`, i a mà a
1440×900, 1024×768 i 768×1024, més obrir/tancar/tornar a obrir):

| moment | capçalera | panell | cadenat |
|---|---|---|---|
| pausa (0-500 ms) | `transparent` | `opacity 0` | no muntat |
| aparició (500-840 ms) | `blanc` | `0 → 1` i baixa 26 px | `opacity 0 → 1` |
| obert | `blanc` | `1` | `1` |
| tancat | `blanc`, 53 px | no hi és | no hi és |

## 6quater. FET (01/10/2026) — Les subcol·leccions d'Austen a la franja

**Què va dir l'amo**: «Quan cliques a la graella intercalada, la col·lecció
activa no se centra a la franja. A més a més, falten imatges de Quotes.» I
després: «Són les subcol·leccions d'Austen.»

### (a) El centratge: el grup el mana la SUBCAPÇALERA, no la collecció

`buscaGrupActiuFranja` i `desplacamentGrupActiuFranja`
(`src/components/megaslide/geometriaMegaslide.js`) buscaven el grup NOMÉS per
collecció. Com que les cinc subcol·leccions d'AUSTEN comparteixen
`collection === 'austen'`, en activar-ne una el «grup» era tot AUSTEN (27
dibuixos, cases 22-48) i la franja s'hi centrava: les catorze cases queien fora
del tram de la subcol·lecció, i com que el vel sí que mira la subcol·lecció,
**totes catorze quedaven velades** i no s'hi veia cap dibuix de la colla
activa. Mesurat abans: `offset=29`, `inactius=[0..13]`.

Ara els dos helpers accepten `{ subcollections, sub }` (i la `sub` només filtra
quan la collecció activa és `austen`). A `MegaslidePagina2.jsx` s'hi passen els
tres llocs que compten el grup (desplaçament inicial, efecte de centratge i
ancoratge del dibuix clicat), i la subcol·lecció entra a la clau del grup perquè
canviar-ne una torni a centrar.

Mesurat després, clicant cada entrada de la dreta (1960×839; `casosActives` són
les catorze cases que queden sense vel):

| grup | offset | casos actives |
|---|---|---|
| PEMBERLEY | 16 | 1, a la casa 6 (centrat) |
| KEEP CALM | 17 | 1, a la casa 6 |
| QUOTES | 20 | 5: 4-8 |
| CROSSWORDS | 28 | 12: 1-12 |
| LOOKING FOR MY DARCY | 38 | 8: 3-10 |
| FIRST CONTACT | 61 | 7: 3-9 |
| THE HUMAN INSIDE | 8 | 14 |
| CUBE | 47 | 10: 2-11 |
| MISCEL·LÀNIA | 55 | 5: 4-8 |

Les quatre colleccions que no són AUSTEN no es mouen (sense `sub`, el camí és
exactament el d'abans). També funciona clicant el DIBUIX a la graella
intercalada: deixa la subcol·lecció activa i centra el seu tram.

**ON ES VA VEURE**: a la pantalla del CERCADOR (la pàgina 2 del megaslide, la
que s'obre amb la lupa —`aria-label="Cercador i catàleg"`). És la composició
amb el selector BLANC/COLOR/NEGRE a l'esquerra, la filera de colors, la
graella intercalada al mig, la llista de grups a la dreta (`CERCADOR_COLLECTIONS`
de `CercadorTopBar.jsx`, amb l'etiqueta curta «LOOKING FOR MY D») i la franja
sota. Reproductible amb `node scripts/_tmp-cercador.mjs`.

### (b) Les imatges que faltaven: dos fitxers retallats amb el nom vell

La graella demana la versió **retallada** de cada dibuix
(`CercadorTextRow.jsx`, `dibuixDelNom`: canvia `images_grid/` per
`images_grid_trim/`). La carpeta `images_grid_trim/austen/quotes/` encara tenia
els noms vells, i els dos que es van renombrar no hi eren:

| el codi demanava | a la carpeta hi havia |
|---|---|
| `i-admire-and-love-you-b-grid.webp` | `you-must-allow-me-b-grid.webp` |
| `you-have-bewitched-me-b-grid.webp` | `body-and-soul-b-grid.webp` |

Es va comprovar que són el mateix dibuix comparant la caixa del retall
(`canvas`, píxels amb alfa > 8) amb la de l'original: 268×135 i 315×72, iguals
que les dels fitxers vells. S'han **renombrat** (`git mv`, contingut intacte:
md5 `fc45dbe5…` i `8ae37b39…`). La carpeta retallada ja no té cap orfe.

Dos fitxers més tenien entrades mortes al mapa de mides de la portada
(`src/pages/Home.jsx`, `src/pages/HomeMobile.jsx`): la clau
`austen/you-must-allow-me` apuntava a un fitxer que ja no existeix (i el valor
era el mateix que el de `i-admire-and-love-you`, que ja hi és). Fora.

Comprovat amb un escombrat de les 5 colleccions i les 5 subcol·leccions
(`node scripts/_tmp-trim-trencades.mjs`): **0 dibuixos trencats**. Atenció: les
imatges que falten a `public/` NO donen 404 al servidor de desenvolupament
(Vite retorna `index.html` amb 200), així que el que mana és `naturalWidth === 0`
al navegador, no el codi de resposta.

## 6quinque. FET (01/10/2026) — L'alçada de les cinc cites a la franja

**Què va dir l'amo**: «Només falta pujar els dibuixos I ADMIRE AND LOVE YOU,
HALF AGONY HALF HOPE, UNSOCIABLE AND TACITURN, a la mateixa alçada que les
altres dues.» (A la stripe.) I, després del primer intent: «Ara són massa
amunt.»

**Causa**: de les cinc cites, només `it-is-a-truth` i `i-admire-and-love-you`
tenien entrada a `STRIPE_DRAWING_CALIBRATIONS` (`src/config/stripeCalibrations.js`).
Les altres tres queien al default de la casa (`STRIPE_DRAWING_OVERLAY_DEFAULTS`:
`dy 28.75`), i per això anaven 15 px mes avall.

**Què s'ha fet**: afegir-hi les sis entrades que faltaven (3 dibuixos ×
`black/` i `white/`, que són les dues variants que existeixen) amb el `dx` 0,5 i
l'escala 0,31 que ja s'aplicaven, i el `dy` a **17,25**.

**Per què 17,25 i no 13,75**: el primer intent va alinear la PART DE DALT del
dibuix amb la de les altres dues (dy 13,75, tops a 25-27 px sota la vora de la
franja), i per a una cita d'UNA línia això la deixa massa amunt: els altres dos
són blocs de 3 i 5 línies. El que quadra és el CENTRE del dibuix.

Mesurat al navegador (1960×839, cercador, QUOTES), en px sota la vora de la
franja:

| dibuix | abans | dy 13,75 | dy 17,25 (ara) |
|---|---|---|---|
| i-admire-and-love-you (referència) | 27-30 | 27-30 | 27-30 → centre 28,5 |
| you-have-bewitched-me | 41-43 | 27 | 30 → centre 30 |
| half-agony-half-hope | 41-44 | 25-28 | 28-32 → centre 30 |
| unsociable-and-taciturn | 42-43 | 26-27 | 30 → centre 30 |
| it-is-a-truth (referència) | 26-39 | 26-39 | 26-39 → centre 32,5 |

Els tres queden amb el centre a 30, exactament al mig de les dues referències
(28,5 i 32,5). Comprovat amb `node scripts/_tmp-stripe-cites-alcada.mjs` (mesura
els píxels foscos de cada casa de la franja) i amb el retall ampliat
(`scripts/_tmp-stripe-zoom.mjs`).

## 6sexies. FET (01/10/2026, matinada) — LA CONVERSIÓ DE COLORS, ACABADA

L'amo se'n va anar a dormir amb «continua amb la conversió de colors». Queda
feta: **0 hexes neutres** i **0 classes neutres** de Tailwind dins de l'abast.

### Què s'ha convertit

| tanda | què | substitucions |
|---|---|---|
| 1 | **vores** (border/outline/ring) | 83 |
| 2 | **fons** (background/gradient) | 133 |
| 3 | **text** (color/fill/stroke) | 505 |
| 4 | **classes de Tailwind** (bg-/text-/border-…) | 1.846 |

Total **2.567** substitucions. Totes a `hsl(var(--grey-*))` (mai un token cru:
ho vigila `scripts/verifica-tokens-color.mjs`).

### Com es decideix el token

El mateix per a un hex que per a una classe: es mira **la família** (què fa
aquell color) i després **el pas de llum més proper**.

- `border`/`outline`/`ring`/`divide`/`decoration` → `line`, `line-strong` (i
  `muted-2`/`ink-*` si el color és fosc).
- `background`/`gradient` → `paper`, `paper-soft`, `paper-tint` (i `ink-*` si
  és fosc). **No** s'hi fan servir els passos de vora.
- `color`/`fill`/`stroke`/`placeholder` → `ink*` i `muted*`. **No** s'hi fan
  servir els passos de vora ni `paper-soft`/`paper-tint`: un text no és una
  línia ni un paper. Els grisos clars de text (etiquetes desactivades) cauen a
  `muted` (74 %).

Així `text-gray-900` i `#111827` acaben tots dos a `ink-strong`, i
`bg-gray-50` i `bg-gray-100` tots dos a `paper-soft` (que és el que volia
l'amo: «n'hi ha de semblants que fan el mateix i es poden convertir en un de
sol»).

### Què NO s'ha tocat (i per què)

- **Colors de producte** (samarretes): `#607060`, `#8C8E90`, `#4D5252`,
  `#414545`, `#ADA7A1`, `#777879`, `#CBC5BE`, `#009C39`, `#4F6751`, `#2B2428`
  i tota la llista de `CERCADOR_COLORS`.
- **Les banderes** de `src/pages/ShippingPage.jsx`: els seus `fill="#..."` són
  dibuixos. Atenció: `#F1F2F1` hi surt 48 vegades i és el **blanc de la
  bandera**, no un fons.
- **Eines de mesura i pantalles de dev**: `src/dev/`, `src/pages/dev/`,
  `RulerTool`, `RulersGuidesOverlay`, `DebugButtonsBar`, `GridDebugContext`,
  `MarcNavegador`. Els seus colors fan una feina (regles, guies, contorns).
- **Accents** (blau, vermell, verd, ambre): 421 usos que són estats i marca,
  no la rampa de grisos. Queden com eren.
- `src/config/`, `src/index.css` (hi viu la rampa) i les dades de palette.

### Tres guardes que hi ha al conversor

1. Un hex dins d'una **comparació** no és un color:
   `const border = bg === '#ffffff' ? …` no s'ha de tocar.
2. Una línia amb **tres colors o més** és una paleta o un gradient de dades:
   convertir-ne només un la deixa coixa (va passar amb la llista `COLORS` de
   `VerticalParadigmaPreview.jsx`, i es va restaurar).
3. Els fitxers de dades de producte i les eines de mesura queden fora.

### Com es comprova

`scripts/_tmp-tokens-captures.mjs <etiqueta>` fa 13 captures (portada,
col·lecció, dues PDP, checkout, legals, contacte, FAQ, ofertes, constructor i
les dues del megaslide) amb el `Math.random` fixat, i desa amb cada captura una
**empremta de la disposició** (hash de les mides i posicions de tots els
elements). `scripts/_tmp-tokens-diff.mjs <abans> <despres>` compara pixel a
pixel i diu, per pantalla, el % de píxels diferents, quants en són de forts i
si **la disposició** s'ha mogut.

Resultat de les quatre tandes: **la disposició no es mou enlloc** i els canvis
de píxels són sempre suaus (forts ≤ 0,34 %), que és exactament el que ha de
passar quan només es canvien colors. La banda del hero de la portada s'ignora a
la comparació perquè es **sorteja** a cada càrrega (el `Math.random` és
compartit i la posició de la seqüència depèn del temps).

### Detall que val la pena saber

- **MAI un token dins d'un SVG que s'entrega com a DATA-URI.** L'SVG del
  data-URI no hereta el CSS de la pàgina, així que `var(--grey-*)` **no hi
  existeix**: el `fill` queda invàlid i la màscara buida. Va passar el
  01/10/2026 i va fer **desaparèixer la franja de samarretes del megaslide**
  (l'amo ho va veure: «Ha desaparegut la stripe de la p2»). Els tres llocs eren
  generadors de màscares: `generaVelDataUrl()` de `MegaStripePanel.jsx`
  (`setAttribute('fill', …)`), i els dos generadors de la màscara de màniga
  (`data:image/svg+xml,${encodeURIComponent(svg)}`) de `CercadorTextRow.jsx` i
  `MegaStripePanelP1.jsx`. S'hi han tornat els colors **literals**
  (`#FFFFFF`/`#000000`), que és el que demana una màscara.
  - **A un SVG EN LÍNIA (JSX) sí que s'hi pot posar el token**: `var()` resol
    perquè l'element és dins la pàgina. Comprovat al navegador: un
    `fill="hsl(var(--grey-paper))"` en un `<rect>` en línia dona
    `rgb(255,255,255)`.
  - El conversor té una guarda per a això: no toca cap línia amb
    `setAttribute('fill'|'stroke', …)` ni cap color a menys de 400 caràcters
    d'un `data:image/svg+xml`.
- **Com es detecta**: la franja viva té ~32.700 píxels no blancs a la banda
  (x 267..1057, y 197..282 a 1440×900) i una llum mitjana de 243,35; quan
  desapareix, queden 1.099 i 254,52. `scripts/_tmp-tokens-banda.mjs` ho mesura i
  `scripts/_tmp-tokens-franja-bisect.mjs` ho compara amb totes les captures guardades,
  cosa que va permetre saber que el culpable era la tanda de **text**.
- `bg-gray-300` (i els seus germans de ~84 %) cauen a **`bg-muted-foreground`
  (74 %)**, perquè la rampa no té cap pas de fons a 84 % (`line-strong` és de
  vores). És el preu d'unificar; si l'amo ho vol més clar, el que cal és afegir
  un pas a la rampa, no un cas especial.
- L'empremta de disposició no serveix per a la portada ni per a la pantalla del
  megaslide amb la portada al darrere (hero sorteja).

## 6septies. FET (01/10/2026) — El salt de la hero en obrir el megaslide (inici nou)

**Què va dir l'amo**: «Quan clico el megaslide, la hero es recol·loca.»

**On era**: a la **home nova** (`/nova/inici`, `MarcInici.jsx`), no a la vella
(`/` no es mou gens: comprovat a 768, 1024, 1280, 1440 i 1920).

**Per què**: el repartiment de la pàgina reserva l'espai del megaslide a partir
de la seva vora (`--hg-mega-bottom`). Quan el panell encara no s'ha obert mai
(en carregar la pàgina), aquella variable no existeix i la vora s'**estima** amb
una fórmula que havia quedat **caducada**: a 1440 donava una vora a 447 px quan
el panell de debò n'acaba a 312. En obrir-lo arriba el valor de veritat i el
contingut salta: **99 px a 1920, 135 a 1440 i 1366, 174 a 1280, 282 a 1024**.
No té res a veure amb la conversió de colors.

**Què s'ha fet**: recalibrar l'estimació amb mesures de debò de cada mida
(`scripts/_tmp-inici-panell-mides.mjs`: obre el megaslide i llegeix
`--hg-mega-bottom`). L'alçada del panell té tres règims:

| règim | alçada del panell |
|---|---|
| vertical (alt > ample, ample < 1024) | 0,585 × carril |
| tauleta apaisada (ample ≤ 1366) | 289 px clavat |
| escriptori (ample > 1366) | 0,1775 × carril + 111,3 |

L'error màxim de l'estimació és de **8 px** (abans, 282). El salt en obrir el
megaslide, mesurat amb `scripts/_tmp-inici-salt.mjs`:

| mida | abans | ara |
|---|---|---|
| 1920×1080 | 99 px | −5 px |
| 1440×900 | 135 px | 2 px |
| 1440×766 | 135 px | 3 px |
| 1366×768 | 135 px | 0 px |
| 1280×720 | 174 px | 0 px |
| 1024×768 | 282 px | 0 px |
| 768×1024 | 53 px | 2 px |

**Si el megaslide canvia de mida**, aquests tres règims s'han de tornar a
mesurar: és el mateix pacte que ja tenia la fórmula vella (i per això va quedar
caducada).

## 6octies. FET (01/10/2026) — La franja de la tauleta trepitjava el selector

**Què va dir l'amo**: «De 1366 a 1024, la stripe es reconfigura i trepitja
coses.» Després de veure-ho: «Sí, escala-la a l'espai lliure.»

**Què passava**: a la banda de 1366 cap avall la franja canvia de configuració
(les peces es fan més grosses: la filera passa de 85 px a 1440 a 113 px a 1366 i
menys) i, escalada al **carril sencer**, arribava a x=822 mentre el bloc de la
dreta (el selector BLANC/COLOR/NEGRE, `[data-bloc-dreta-p1]`) comença a x=678:
**144 px de franja per sota del selector**.

**Per què**: `ampladaObjectiu()` (`src/hooks/useEscalaFranjaCarril.js`) agafa
l'amplada de la vora esquerra del carril fins a la **dreta del bloc de fletxes**
del carrusel; a les tauletes no hi ha fletxes i queia al `return carril`, o
sigui al carril SENCER — que alla tambe conte el bloc de la dreta.

**Què s'ha fet**: quan no hi ha fletxes, l'objectiu es la **vora esquerra del
bloc de la dreta** (on acaba la graella de dalt). Així la franja queda alineada
amb la graella i el selector queda lliure, amb el mateix marge que a
l'escriptori (alla la maniga hi passa per sobre a posta, amb ombra). Mesurat:

| mida | franja (abans) | franja (ara) | bloc dreta | trepitja abans | ara |
|---|---|---|---|---|---|
| 1366×768 | 251..1100 | 254..968 | 952..1081 | 148 px | 16 px |
| 1280×720 | 236..1029 | 239..898 | 883..1012 | 146 px | 15 px |
| 1150×800 | 211..924 | 214..792 | 779..908 | 145 px | 13 px |
| 1024×768 | 188..821 | 191..689 | 678..807 | 143 px | 11 px |
| 1440×900 | 267..1057 | 267..1057 | 1043..1140 | 14 px | 14 px |
| 1920×1080 | 358..1413 | 358..1413 | 1395..1524 | 18 px | 18 px |

L'escriptori no es toca: alla hi ha fletxes i el camí de dalt ja retorna abans.
L'escala es uniforme, així que la franja també s'ha fet més baixa (113 → 89 px a
1024) sense deformar cap dibuix.

**Comprovat que no venia de la recalibració de la vora** (6septies): amb la
fórmula vella i amb la nova, la franja amb el megaslide obert fa exactament el
mateix (`[188,198,821,113]` a 1024 i `[236,198,794,113]` a 1280).

### El forat del primer intent: el bloc de la DRETA era el de l'altra pàgina

El megaslide té **totes les pàgines al DOM** (desplaçades amb `translateX`), i
`ampladaObjectiu()` buscava el bloc de la dreta a **tot el document**: mentre es
mesurava la franja de la pàgina 1 s'agafava el bloc de la **pàgina 2** (o la
seva llista de col·leccions, que també hi és), i la franja de la 1 es quedava
ampla i passava per sota del selector. Ho va veure l'amo a les captures del
mosaic: «a totes aquestes vistes, la stripe s'ha mogut».

Ara es mira **primer dins de la pàgina de la franja que s'està mesurant**
(`filaEl.closest('[data-mega-page-viewport]')`) i, si no hi ha bloc, es cau al
comportament anterior. Mesurat a 1024×768 (`/nova/inici?active=first_contact`),
pàgina visible 1:

| | abans | ara |
|---|---|---|
| franja | 190..754 (564 px) | **191..689 (498 px)** |
| bloc dret | 678..807 | 678..807 |
| trepitja | **76 px** | **11 px** (la màniga) |

I la pàgina 2 (el cercador) queda igual de bé a totes les mides: trepitja 11 px
a 1024, 13 a 1200, 14 a 1280 i 15 a 1366 (la màniga, com a l'escriptori).

### I al CERCADOR (p2), que és on ho veia l'amo

El primer intent nome's cobria la p1 (`[data-bloc-dreta-p1]`). Al cercador el
bloc de la dreta és la **llista de colleccions**, que no porta aquell atribut: la
seva marca és `[data-colleccions-targeta="1"]` (la mateixa que fa servir
`scripts/compara-vistes.mjs`). Amb els dos selectors, la franja del cercador
també s'hi atura:

| mida | franja | columna | trepitja |
|---|---|---|---|
| 1024×768 | 190..753 | 742..804 | 11 px |
| 1150×800 | 213..847 | 834..905 | 13 px |
| 1280×720 | 237..944 | 930..1009 | 14 px |
| 1366×768 | 253..1008 | 993..1078 | 15 px |
| 1440×900 | 267..1057 | 1047..1137 | 10 px |
| 1920×1080 | 358..1413 | 1398..1521 | 15 px |

(Abans, a 1024, la franja arribava a 821 amb la columna a 742: **79 px**.)

### Els enllaços de les colleccions, tallats a la tauleta

**Què va dir l'amo**: «els enllaços de la p1 queden tallats a mesura que el
format es fa més petit.»

**Per què**: a les dues tauletes la mida de la lletra era **fixa de 13,5 px**
mentre que la columna sí que s'aprima amb el format (va de 62 px a 1024 a 85 a
1366). L'etiqueta més llarga («THE HUMAN INSIDE») fa 91 px a 13,5 px, o sigui
que a 1024 es veia 29 px tallada per l'esquerra (el text va enrasat a la dreta i
el que sobra marxa cap a l'esquerra). A l'escriptori no passava perquè allà la
mida ja era proporcional (`carrilPx`): 10 px a 1440 i 13,4 a 1920.

**Què s'ha fet**: a les tauletes la lletra és `clamp(8.5px, 0.85vw, 13.5px)`.
Mesurat (etiqueta més llarga / columna):

| mida | abans | ara |
|---|---|---|
| 1024×768 | 91/62 → tallada 29 px | 58/62 ✓ |
| 1150×800 | 91/71 → 20 px | 66/71 ✓ |
| 1280×720 | 91/79 → 12 px | 73/79 ✓ |
| 1366×768 | 91/85 → 6 px | 78/85 ✓ |
| 1440×900 | 67/90 ✓ | igual |
| 1920×1080 | 90/123 ✓ | igual |

## 6nonies. FET (01/10/2026) — Eines del contact sheet i el botó «Carril»

### El botó «Carril» no feia res

`DebugLayer.jsx` renderitzava `<DebugButtonsBar>` **sense passar-li**
`carrilGuidesEnabled` ni `setCarrilGuidesEnabled`: la barra les demanava i li
arribaven `undefined`, així que el clic petava amb «setCarrilGuidesEnabled is not
a function» i no passava res. Comprovat al navegador (`?debug=1`, clic al botó):
abans 0 guies i l'error a consola; ara `aria-pressed=true`, es desa a
`HG_CARRIL_GUIDES_ENABLED_V1` i surten les dues guies blaves (x=285 i x=1140 a
1440). Les guies són divs de 0 px amb `borderLeft: 1px solid` ✓.

### Dos botons nous a `/dev/contact-sheet`

1. **«Megaslide a totes»** (commutador): obre el megaslide a **totes les iframes
   alhora** fent servir el paràmetre `?active=first_contact` de la pròpia app
   (`useUrlActiveCollection`). Camí ràpid: `history.replaceState` +
   `PopStateEvent('popstate')` dins de cada iframe → **sense recarregar** ✓.
   Per tancar, treure el paràmetre no n'hi ha prou (l'estat de dins es queda
   encès): es clica la capa que l'atrapa (`z-[9989]`, la mateixa que tanca el
   megaslide quan es clica fora). Si la URL ja porta el paràmetre i el megaslide
   és tancat, es recarrega l'iframe. Comprovat amb un banc de proves mateix
   origen: obrir → panell ✓, tancar → sense panell ✓, tornar a obrir ✓.
2. **«Captura les N actives»**: captura les pantalles que es veuen **ara**
   (les filtrades). El navegador no pot rasteritzar el DOM d'un iframe, així que
   el botó demana al servidor de desenvolupament que executi el guió de sempre:
   `POST /__dev/contact-sheet-capture { paths }` → `node
   scripts/contact-sheet-capture.mjs --only=<rutes>` → i després es recarrega
   `contact-sheet/index.json` i es passa a la vista de snapshots. L'endpoint
   viu al `vite.config.js` (`contactSheetCaptureDevApi`, només `serve`).
   Comprovat: `curl` amb `["/austen"]` → `ok:true, ms:5050`, `austen.png`
   1272×6466 ✓.

### El motor de captura: per defecte CHROMIUM

El guió era **Firefox fix**, i amb Firefox aquestes pàgines **s'encallen**: el
`goto` no acaba mai (mesurat: més de 5 minuts sense ni una captura, amb el log
aturat a «Launching Firefox»). Amb Chromium la mateixa pàgina es captura en
**4,9 s** (llançament 0,65 s + xarxa en calma 3,5 s + captura 0,7 s). Ara el
motor és `--browser=chromium` (per defecte) i es pot tornar a demanar Firefox
amb `--browser=firefox`. Si el motor canvia, els snapshots canvien de píxels
(és un motor diferent): és el preu de que la captura funcioni.

## 6decies. FET (01/10/2026) — Les guies que es quedaven enceses, i el mosaic

### Les guies del carril es quedaven enceses per sempre

**Què va dir l'amo**: «Les guies queden connectades tota l'estona.»

**Per què**: a `useDebugToggles.js`, `carrilFromUrl` i `belt2FromUrl` eren `const`
**recalculats a cada render** llegint la URL viva. La guarda que impedeix desar
un encès que ve de la URL («nome's no es desa l'encendre des de la URL») es
doncs trencava tot seguit que l'app reescrivia la URL i perdia el paràmetre —i
l'app la reescriu, per exemple quan el megaslide hi posa `?active=`—: el valor
passava a `null`, la guarda no s'aplicava i s'hi desava `HG_CARRIL_GUIDES_
ENABLED_V1 = '1'`, o sigui que **les guies sortien a tot arreu i per sempre**,
també fora de l'eina de mesura.

**Què s'ha fet**: els dos valors es llegeixen **un sol cop**, amb `useState` en
muntar-se. Comprovat: amb `?carril=1` les guies es veuen (2) i `localStorage` es
queda a `null`; després de reescriure la URL perdent el paràmetre, també.

**Pendent a la teva màquina**: el navegador de l'amo ja té el `'1'` desat
d'abans. Amb el boto «Carril» (que ara funciona) s'apaguen i el valor passa a
`'0'`; si es vol net, `localStorage.removeItem('HG_CARRIL_GUIDES_ENABLED_V1')`.

### Els dos botons del mosaic (`public/browser-overlay.html`)

Aquest es **la pàgina que l'amo fa servir** (el mosaic d'iframes amb 8 mides),
no `/dev/contact-sheet`. S'hi han afegit tres eines a la barra:

1. **«megaslide a totes»**: posa `?active=first_contact` a la URL de **totes**
   les vistes i les recarrega, com fa el boto de les guies. Comprovat: abans
   `?carril=1` i 0 panells; després `?carril=1&active=first-contact` i **1
   panell a cada vista**; el segon clic les torna a deixar sense.
2. **«captura vistes»** i **«captura pàgines»** (01/10/2026): VISTA i PÀGINA són
   dues coses i l'amo les vol totes dues. La **vista** és la finestra (1920×1080,
   1440×900…: el que es veu sense desplaçar-se) i la **pàgina** és tota la tirada
   (els 6.900 px de la home). El nom del fitxer ho diu:
   `<vista>-<ample>x<alt>-vista.png` i `…-pagina.png`, a `public/captures/`.
   Comprovat amb els dos botons a la mateixa vista de 1440×900: `-vista.png` de
   77 kB contra `-pagina.png` de 455 kB ✓, 2 captures en 8 s cada tanda.

   **I la pàgina del megaslide també hi va** (01/10/2026): l'amo no podia capturar
   la p2 («quan les faig, surt la p1 igualment»), perquè la pàgina viu a
   `sessionStorage` i la captura s'obre en un **navegador nou**, que sempre hi
   troba la 1. Ara cada vista porta `pagina` (1..4, la que s'ha triat amb els
   botons P1/P2) i el guió l'hi escriu **abans** que l'app es munti
   (`addInitScript`). El nom del fitxer ho diu:
   `<vista>-<w>x<h>-p<1|2>-<vista|pagina>.png`. Comprovat: `…-p2-vista.png` surt
   amb el cercador (selector a l'esquerra, xips de color, graella i la llista de
   col·leccions) ✓.

3. **«P1» / «P2»** (01/10/2026): posen la **pàgina del megaslide** a totes les
   vistes. La pàgina viu a `sessionStorage` (`HG_MEGA_PAGE`, amb el format de
   `usePersistentState`: `{ value, expiresAt }`), que és **per finestra**: s'hi
   escriu des del pare (mateix origen) i es recarrega la vista amb el megaslide
   obert (`?active=`) perquè el llegeixi en muntar-se. Comprovat amb captures:
   P2 ensenya el cercador (graella, xips de color i la llista de col·leccions a
   la dreta) i P1 la pàgina de la franja (dibuixos, les 14 samarretes i el
   selector a la dreta).

**El Node dels endpoints** (01/10/2026): les dues captures es llançaven amb
`execFile('node', …)`, que busca `node` al PATH **del procés del servidor**. Si
el servidor s'ha arrencat des d'un llancador que no hi té el PATH del sistema,
l'execució falla amb «Node was not found» i el botó no fa res (ho va veure
l'amo). Ara es fa servir `process.execPath`, que és el binari de Node que ja
està corrent: sempre hi és i és el mateix. Comprovat amb els dos endpoints
(`/__dev/vistes-capture` i `/__dev/contact-sheet-capture`).

El boto de captura no pot funcionar des del navegador (el DOM d'un iframe no es
pot rasteritzar des de JS), així que crida un endpoint del servidor de
desenvolupament: `POST /__dev/vistes-capture { vistes: [{ nom, ample, alt, url
}] }` → `scripts/vistes-capture.mjs` (Chromium, un PNG per vista + `index.json`).
El guió de contact sheet també té el seu endpoint (`/__dev/contact-sheet-capture`)
i els dos botons de `/dev/contact-sheet`.

## 6duodecies. FET (01/10/2026) — La hero a 50 px del fons, a tot l'horitzontal

**Què va dir l'amo**: «Ja que tenim espai, aprofitem per maquetar bé la hero.
Deixa la hero a 50 px del límit del viewport, com la desktop.»

**Què s'ha fet**: a `MarcInici.jsx`, la regla de l'aire de sota (`baixAlViewport`,
`AIRE_BAIX_VIEWPORT_PX = 50`) només s'aplicava a **més de 1366 px**; a 1280 i
1366 la hero anava enganxada al fons (0 px) i a la tauleta quedava centrada. Ara
s'aplica a **tot l'horitzontal**, amb la mateixa guarda de sempre (si no hi caben
els 50 px, no s'hi aplica res). La **vertical** (768×1024) no es toca: allà mana
el centratge.

Per fer-ho, `esVertical` (que ja es calculava dins de l'estimació de la vora) ha
pujat a l'abast de tota la funció — i **atenció a l'ordre**: posar-lo després de
la IIFE que el fa servir va petar la pàgina amb un `ReferenceError` (és el mateix
parany que vaig caure amb `filtered` al contact sheet).

**I DESPRÉS, SENSE CONDICIONS** (01/10/2026, segona volta). Amb la finestra curta
(1280×586, 1366×600 —com les del mosaic, que perden l'alçada del marc del
navegador—) la guarda `disponible >= CADE_BAIXADA + natural + 50` no es complia
mai i la hero quedava enganxada al fons: «A 1280 i 1366 no ha pujat». Ara
`baixAlViewport = !esVertical` i prou: l'aire s'aplica sempre a l'horitzontal, i
si la hero no hi cap sencera és la única peça que cedeix (el seu `aspect-ratio`).
**La cel·la no creix per això** (`blocPagina` es queda com era): fer créixer la
cel·la 50 px va arribar a treure la taula per sota de la finestra.

Comprovat que la hero **no xoca amb la filera d'icones** (mesurat: icones
177-216 i hero a partir de 277 en una finestra de 1280×586) ni amb res més, i
vist en captura.

Mesurat (aire entre el baix de la hero i el fons de la finestra):

| mida | abans | ara |
|---|---|---|
| 1024×768 | centrada | **50 px** |
| 1150×800 | centrada | **50 px** |
| 1200×800 | centrada | **50 px** |
| 1280×720 | 0 px (enganxada) | **50 px** |
| 1366×768 | 0 px (enganxada) | **50 px** |
| 1440×900 | 50 px | 50 px (igual) |
| 1920×1080 | 50 px | 50 px (igual) |
| 768×1024 (vertical) | 69 px (centrada) | 69 px (igual) |

I amb finestra curta (que és on no pujava): 1280×586 → 50 px (abans 0), 1366×600
→ 50 px (abans 0), 1024×600 → 50 px (abans 0), sense cap xoc.

**I A LA BANDA DELS PORTÀTILS, 25 px** (01/10/2026, tercera volta): «A 1280 i
1366, passa-ho a 25 px». És la banda que el codi ja agrupava
(`alFons = ampleFinestra >= 1280 && <= 1366`), o sigui els 1280 i els 1366
exactament, que són les mides on l'espai és més just. Nova constant
`AIRE_BAIX_VIEWPORT_ESTRET_PX = 25` i l'aire va a l'estat del repartiment
(`aireBaix`), perquè canviar de banda el repinti. Mesurat:

| mida | aire |
|---|---|
| 1024×768, 1150×800, 1200×800 | 50 px |
| **1280×586, 1280×720, 1366×600, 1366×768** | **25 px** |
| 1440×900, 1920×1080 | 50 px |
| 768×1024 (vertical) | 69 px (centrada, igual) |

**Tercer `ReferenceError` de la nit** (i el tercer del mateix tipus): vaig posar
les constants noves després de `REPARTIMENT_INICIAL`, que ja les fa servir. Sempre
és el mateix: **mirar l'ordre de declaració després de cada edició**, i comprovar
la pàgina amb la consola abans de dir que està fet.

## 6undecies. PENDENT (decidit per l'amo 01/10/2026) — Dues composicions a l'horitzontal

**La decisió**: «Farem dues composicions diferents entre 1920/1440 i la resta a
la versió horitzontal.» O sigui: el megaslide horitzontal tindrà **una
composició per a 1440/1920** (l'actual) i **una altra per a la resta**
(≤1366: 1366, 1280, 1200, 1180, 1150, 1024…). La vertical (768) ja té la seva i
no s'hi toca.

**Per què**: a la banda de ≤1366 la composició de la **p2** queda 50-80 px més
amunt i més petita que la de la **p1**, i com que el panell té l'alçada de la p1
(a posta, perquè canviar de pàgina no mogui el layout), hi sobra una franja
buida amb la pestanya i el cadenat penjant. Mesurat amb el megaslide obert
(`scripts/_tmp-p2-buit.mjs`, esborrat: torna a mesurar-se amb el mateix criteri):

| mida | p1 graella/franja/fi | p2 graella/franja/fi | buit p1 | buit p2 |
|---|---|---|---|---|
| 1024×768 | 179 / 287 / 287 | 129 / 208 / 208 | 30 px | **109 px** |
| 1200×800 | 181 / 290 / 290 | 131 / 231 / 231 | 31 px | **90 px** |
| 1440×900 | 164 / 281 / 281 | 143 / 282 / 282 | 31 px | 30 px ✓ |

**Punts del codi que fan la composició** (tots ja tenen branques per banda):

- `src/components/fullwide/midesGraella.js`: `midaDibuix(isPortraitTablet,
  isLandscapeTablet)` i `gapVertical(...)` — la mida de les peces de la graella.
- `src/components/megaslide/geometriaMegaslide.js`: `visualOffsetYFranjaPagina2(
  { ample, alt, isPortraitTablet, isLandscapeTablet })`, amb
  `AJUST_FRANJA_TAULETA_APAISSADA_PX`, i `pageLiftPagina1(...)`.
- `src/components/megaslide/MegaslidePagina2.jsx`: `esBandaEstreta`,
  `topGraellaColors`, `bnSliderSize`, `mesuraGraellaP2`, `page1PageLift`.
- `src/components/fullwide/MegaMenuPanel.jsx`: `guardHeightPx`
  (`alcadaGuard(p1ContentBottomPx)`, `matchesPage1Height`) — **l'alçada del
  panell surt de la p1 i s'aplica a totes les pàgines**, i és el que s'ha de
  mantenir (canviar de pàgina no ha de moure el layout).

**Criteri d'acceptació** (mesurable, sense mirar-ho a ull):

1. A 1024, 1200, 1280 i 1366, el buit de sota el contingut de la **p2** ha de
   ser el mateix que el de la **p1** (~30 px: el marge de disseny
   `P1_STRIPE_BOTTOM_GAP`).
2. La graella i la franja de les dues pàgines han de quedar a la mateixa alçada
   (les dues franges quadrades, com mana el comentari de
   `visualOffsetYFranjaPagina2`).
3. 1440 i 1920 **no s'han de moure gens**.
4. La franja no ha de tornar a passar per sota del selector ni de la llista de
   col·leccions (això ja està arreglat: vegeu 6octies).

## 7. El que NO s'ha de tocar

- **La franja del megaslide**: la samarreta no és cap d'aquestes imatges, sinó
  una base blanca pintada amb CSS (`mixBlendMode: 'multiply'` +
  `backgroundColor: shirtColor`, a `MegaStripePanel.jsx`). Els seus colors surten
  de la seva pròpia llista (la de `CercadorTopBar.jsx`), i per tant es canvia
  amb el punt 3 i prou.
- `src/pages/FulfillmentSettingsPage.jsx` (120, 133): el `gildan_5000` d'aquí és
  un **productUid** del catàleg, no una imatge.
- `dist-prod/`: sortida de build, es regenera.

### La imatge de la hero de les col·leccions és un PLACEHOLDER VOLGUT

`src/config/collectionVertical.js`:

```js
/** La imatge de fons de la hero: avui un placeholder compartit per les cinc. */
export const HERO_BACKGROUND_SRC = '/placeholders/hero/placeholder-noia.jpg';
```

És la foto d'estoc rosa («trendsetter mockups») que surt a la capçalera de
**les cinc col·leccions** (`CollectionVerticalPage.jsx`, línia 438). Ho ha dit
l'amo (01/10/2026): «És un placeholder per a recordar-me que s'ha d'actualitzar
a imatges per cada col·lecció.» **No és cap error i no s'ha de treure ni
substituir per una altra cosa** sense que ho digui ell. El dia que hi hagi les
imatges, el canvi és convertir aquesta constant en un mapa per col·lecció
(`{ austen: '...', first_contact: '...' }`) i llegir-lo amb el `slug` que
`CollectionVerticalPage` ja té.

## 8. Com es comprova

**NO engegar mai un SEGON servidor de Vite que comparteixi `node_modules`** (ni
un *worktree* amb `node_modules` enllaçat, com es va fer el 01/10/2026 per
comparar el megaslide amb l'estat anterior). Els dos processos comparteixen
`node_modules/.vite/deps`, i el que arrenca despres reescriu els chunks
optimitzats amb noms nous: el servidor de l'amo es queda amb el graf vell a la
memoria i serveix una MESCLA. Simptoma exacte: `deps/react.js` importa un chunk
de React i `deps/@stripe_react-stripe-js.js` un altre → **dues copies de React**
→ «Invalid hook call» i, dins d'`<Elements>` d'Stripe, `Cannot read properties
of null (reading 'useMemo')`: **el checkout peta** amb la pantalla «Alguna cosa
no va alhora». Arreglat reiniciant el servidor i esborrant `node_modules/.vite`
(els chunks vells tambe es serveixen des de la memoria del proces, aixi que un
refresc del navegador NO ho arregla). Comprovat: `scripts/_tmp-checkout-prova.mjs`
(afegeix un article al cistell i obre `/checkout`; ha de donar 0 errors i
pintar els camps de targeta d'Stripe).

```bash
node scripts/_tmp-tokens-inventari.mjs               # que queda per convertir (hexes o --classes)
node scripts/_tmp-tokens-converteix.mjs              # dry run de la conversio d'hexes (--familia=fons|vores|text --aplica)
node scripts/_tmp-tokens-classes.mjs                 # dry run de les classes de Tailwind (--aplica)
node scripts/_tmp-tokens-captures.mjs <etiqueta>     # 13 captures + empremta de disposicio
node scripts/_tmp-tokens-diff.mjs <abans> <despres>  # pixel a pixel + si la disposicio s'ha mogut
node scripts/_tmp-tokens-banda.mjs                    # llum de la banda de la franja (si desapareix, salta)
node scripts/_tmp-tokens-franja-bisect.mjs            # en quina tanda va desapareixer (compara captures guardades)
node scripts/verifica-tokens-color.mjs               # CAP token cru sense hsl() (01/10/2026: n'hi havia 158)
node scripts/_tmp-separador-header.mjs             # el separador del header i el del megaslide, mesurats
node scripts/_tmp-verifica-paleta-nova.mjs         # llista canònica, 1946 mockups, pastilles, foscos i 368 variants d'inversió
node scripts/_tmp-verifica-paleta-navegador.mjs    # 5 pantalles: cap 404 i cap imatge trencada
node scripts/_tmp-inversio-navy.mjs                # la regla de la inversió: 21 casos (navy i dark-chocolate com el negre)
node scripts/_tmp-inversio-fitxers.mjs             # les imatges que en surten existeixen (200)
node scripts/_tmp-inversio-carousel.mjs            # el carrusel hi porta la parella inversa
node scripts/_tmp-franja-nova.mjs                  # la franja nova es pinta i no dona 404
node scripts/_tmp-franja-doble.mjs                 # la doble es demana a les vistes verticals
node scripts/_tmp-verifica-mockup-gildan.mjs       # cap 404 i tot ve de mockup-gildan/
node scripts/_tmp-check-tshirt-src.mjs             # els 21 casos del helper, tots 200
node scripts/_tmp-qui-rep-el-clic.mjs              # la franja: 14/14
npx vite build --outDir /tmp/_paleta              # cap error de mòdul; esborrar-ho després
npx vitest run                                     # NOMÉS si l'amo diu que es pot
```

Els colors de la franja es comproven mostrejant el pit de cada casella. A la
filera (`full-color-stripe-5.webp`, 2866×307): una casella cada 204,7 px a
l'alçada 0,62·307. A la doble (`full-color-stripe-doble.png`, 1488×643): 7
columnes (una cada 212,6 px) i les dues files a 0,30 i 0,78 de l'alçada, i es
llegeixen en ordre (fila de dalt 1-7, fila de baix 8-14). L'ordre bo és el de la
llista canònica.

I sense pressa, l'altre full pendent del mateix dia:
`PROMPT-continuar-2026-09-30-mockups-lfmd.md` (els mockups de LFMD esmorteïts).
