# Continuar: el que queda dels vels, els dibuixos i els clics

Data: 29/09/2026, matinada · Branca: `main` · Tot el que diu aquest document està desat i pujat.

## La feina pendent, en una frase

Fer el guió que treu la placa (el fons) de les versions `frame` de LFMD, i trobar qui dessatura els dibuixos de LFMD a la PDP.

## 1. El guió que treu la placa de les `frame`

Ho va demanar l'amo («Pots obviar el fons de les versions frame?») i va triar aquest camí: **treure la placa dels assets amb un guió**, no amb un filtre.

Per què no pot ser un filtre: les `frame` són el mateix text groc sobre una **placa plena**, i la placa NO sempre és del mateix color. Mesurat als fitxers (`images_stripe/austen/looking_for_my_darcy/color/frame/*.webp`):

| fitxer | placa (fons) | text |
|---|---|---|
| `blue-frame` | blava (32,128,224) | groga (224,224,0) |
| `fuchsia-frame` | fúcsia (224,0,160) | groga |
| `red-frame` | **groga** | vermella (224,0,0) |
| `yellow-frame` | groga | fúcsia (224,96,192) |

O sigui: el groc és el text en unes i la placa en unes altres → **cap clau de color les separa**. I el nom enganya: `red-frame` té la placa groga. Es va provar i va quedar la vermella opaca (ho va veure l'amo); el commit del filtre està revertit a `e744fa03`.

El que cal, doncs: un guió (PIL ja està disponible; és Python) que, per a cada imatge, trobi la **taca de color més gran** (la placa, sempre és la que ocupa més) i la faci transparent, deixant el marc i el text. Sortida: fitxers NOUS (per no destruir els originals) i el codi apuntant-hi.

Fitxers afectats:

- `public/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/*-stripe.webp` (8: blue, blue-yellow, fuchsia, fuchsia-yellow, red, yellow, yellow-pink, yellow-red)
- `public/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/frame/*-grid.webp` (i `images_grid_trim`)

Els dibuixos de LFMD es pinten amb `FILTRE_DIBUIX_DESACTIVAT_LFMD` (`brightness(0) invert(1) opacity(0.2)`): amb la placa ja fora de l'asset, aquell filtre deixarà només el marc i el text. El codi no s'hi ha de tocar.

## 2. Els dibuixos de LFMD dessaturats a la PDP

Ho ha vist l'amo: «Els dibuixos de LFMD es veuen dessaturats a la pdp quan s'activa» (primer va dir «a la stripe», i es va corregir: és a la PDP).

Comprovat fins ara:

- **L'asset està bé**: el mockup `public/placeholders/apparel/mockups/austen/cites/looking_for_my_darcy/austen-cites-looking-for-my-darcy-looking-for-my-darcy-red-solid-multi-irish-green.webp` té la impressió VERMELLA VIVA (mirat a mà).
- El meu codi no hi és: cap fitxer de `src/pages/` importa `DibuixFranja` ni els `FILTRE_DIBUIX_DESACTIVAT*` (comprovat amb grep).
- A la PDP surt pàl·lida, i **no s'ha trobat encara l'element que la hi pinta**: no és cap `<img>` de més de 300 px ni cap `background-image` amb `mockups`/`darcy` al camí.

Següent pas: buscar-ho per una altra via (una imatge composta, un canvas, o una ruta d'asset diferent). Cal saber de l'amo si passa amb totes les de LFMD o només amb les `frame`, i si canviant BLANC/COLOR/NEGRE al selector de la PDP canvia.

## Com es comprova

- `node scripts/_tmp-qui-rep-el-clic.mjs` — al centre de cada casella de la franja vertical, qui rep el clic. Ha de dir `path.tshirt-outline` i el camí DE LA SEVA CASA a les catorze.
- `node scripts/_tmp-clics-franja.mjs` — clica cases de la franja i diu quina col·lecció queda activa. La casa 7 (THE HUMAN INSIDE, velada) ha d'activar THE HUMAN INSIDE.
- `node scripts/_tmp-filtres.mjs` — roda la tira i llegeix els filtres de les catorze cases (quines combinacions de mena de dibuix i filtre hi ha).
- `node scripts/_tmp-vert-foto2.mjs <etiqueta> [actiu]` — captura la p1 i la p2 verticals i diu si hi ha errors de consola.
- `node scripts/_tmp-audit-clics.mjs [obert|tancat] [amplada] [alcada]` — auditoria de clics tapats.
- `node scripts/vector-clic-vertical.mjs` — regenera el full de clic vertical (si l'amo torna a canviar el vector de la franja).
- Bateria: `npx vitest run` (**NO s'ha passat encara**: l'amo ho va aturar i no ha dit que es pugui passar).

## El que s'ha après avui (per no repetir errors)

- **Els dibuixos velats es pinten amb un percentatge RELATIU al vel**, perquè el dibuix va PER DAMUNT del vel (això ho va demanar l'amo i està fet, `801d2f7a`):
  - variants negres: `FILTRE_DIBUIX_DESACTIVAT = 'opacity(0.1)'` = el color del vel un 10 % més fosc (0,9 × el vel);
  - LFMD: `FILTRE_DIBUIX_DESACTIVAT_LFMD = 'brightness(0) invert(1) opacity(0.2)'` = un 20 % més clar;
  - els altres que només existeixen en color (CUBE): `FILTRE_DIBUIX_DESACTIVAT_COLOR = 'grayscale(1) opacity(0.1)'`.
- `brightness(0)` **aplana** el dibuix (perd el detall). L'amo el va aturar de seguida.
- **Invertir no funciona** amb les variants negres: són IMATGES EN ESCALA DE GRISOS i invertir-les capgira els tons. Ho va dir l'amo: «El negre és en escala de grisos. No funcionarà».
- `mix-blend-mode: lighten` **no funciona** als dibuixos: la capa dels dibuixos té `z-index` i és un context apilat propi, o sigui que no té el vel al darrere per fondre-s'hi.
- **L'abast mana**: si l'amo diu «a LFMD», és NOMÉS a LFMD. Vaig generalitzar un filtre i em va aturar: «No t'he dit tots. [...] no facis cose que no t'he dit». Quan l'abast no sigui clar, preguntar-ho.
- **Les àrees de clic de la vertical**: el full de clic era el de l'apaïsada (catorze en una filera) i a la vertical (dues fileres de set) s'encongia tot en una filera. El remei NO és moure l'overlay: és **el full que toca** (`full-clic-area-vertical.svg`, fet amb `scripts/vector-clic-vertical.mjs` des del vector de la franja, amb `preserveAspectRatio="none"`). L'overlay s'ha de quedar dins la caixa del contingut (577×253), que és la que fa la mida de les catorze cases.
- **Per veure una samarreta NEGRA** cal la tinta en BLANC o COLOR: amb la tinta en NEGRE l'app inverteix el color de la samarreta (`displayedShirtColor`).
- Vite **recarrega la pàgina tot sol** en desar un commit, i la URL no portava la subcol·lecció d'austen (ja està arreglat: `?active=austen&sub=pemberley`, `1f6efe13`).

## Altres coses obertes (cap d'urgent)

- La p1 vertical té el mateix bloc de caselles (`MegaStripePanelP1.jsx`) i no s'hi ha aplicat l'obertura del 0,25 %.
- Cyberman «corre» en fer scroll (descrit per l'amo, no reproduït).
- Els `_tmp-*` (captures i guions de mesura) són sense seguir. Els guions que valen la pena es poden quedar; els PNG es poden esborrar.
- El cadenat i el selector de la columna ja no tenen el clic tapat (`1427f7d8`), però l'única cosa que queda tapada amb el megaslide obert és la pàgina del darrere, que és el correcte.

## Commits d'aquesta tanda

`330c93f1` clics de la franja vertical alineats · `e744fa03` fora la clau de color de les `frame` · `1a6ba384` LFMD al 20 % més clar · `9d4b2697` els 5 % només per a LFMD · `b6dd3e3d` el fons de les `frame` (revertit) · `801d2f7a` els dibuixos per davant del vel · `c74c3a0c` els vels com estaven · `471288f3` el vel per col·lecció (revertit) · `b2466535` els dibuixos un 10 % més foscos que el vel · `31cb8abf` el gris de desactivat per opacitat · `1427f7d8` el selector i el cadenat sense el clic tapat · `b9a98e42` la pastilla que ballava · `1f6efe13` la subcol·lecció a la URL · `4a82125f` una sola samarreta centrada · `3c6ca75a` la col·lecció a la primera filera.
