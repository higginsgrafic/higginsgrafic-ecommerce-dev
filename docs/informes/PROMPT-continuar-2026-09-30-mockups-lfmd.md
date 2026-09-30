# Continuar: els mockups de LFMD s'han d'actualitzar

Data: 30/09/2026 · Branca: `main`

## La feina pendent, en una frase

**Regenerar els 112 mockups de LOOKING FOR MY DARCY a partir dels dibuixos
actuals**, perquè els colors dels dibuixos es van canviar i els mockups no es
van actualitzar.

Ho ha confirmat l'amo (29/09/2026, matinada): «Vaig canviar els colors i no vaig
actualitzar els mockups».

## Per què es veu

A la PDP els dibuixos de LFMD surten esmorteïts (sobretot `blue-solid` i
`pink-solid`). **No els dessatura l'app**: la imatge gran de la PDP és el mockup
pre-composat (`tdpImageFor()` → `getMockupPath()`), i ni la imatge ni cap dels
seus avantpassats no tenen `filter`, `opacity`, `mix-blend-mode`,
`backdrop-filter` ni `background-image`. El que passa és que el mockup porta la
paleta vella.

Mesurat (píxel més saturat de la impressió):

| dibuix | color del dibuix | color al mockup |
|---|---|---|
| `blue-solid` | (0, 137, 255) | (122, 187, 238) |
| `pink-solid` | (255, 0, 193) | (238, 177, 202) |
| `red-solid` | (255, 0, 3) | (234, 56, 29) |
| `yellow-solid` | (255, 243, 0) | (243, 223, 9) |

Els marcs van més fins, però també: el text de `pink-yellow-frame` surt
(232, 117, 167) quan el dibuix és (252, 118, 211).

## Què hi ha, ja mesurat (no cal tornar-ho a buscar)

- **Carpeta dels mockups:** `public/placeholders/apparel/mockups/austen/cites/looking_for_my_darcy/`
  — 112 fitxers (`<prefix>-<design>-multi-<color>.webp`, 8 dissenys × 14 colors).
- **La samarreta del mockup és la mateixa foto que el placeholder buit:**
  `public/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_<color>_gpr-4-0_front.webp`
  (800×800, diferència mitjana ~1,7/255: només recompressió). Tots els mockups
  de la casa estan fets així.
- **On va la impressió:** el requadre és el mateix per a tots els colors d'un
  disseny. Mesurat comparant el mockup amb la samarreta buida (components de
  ≥ 20 px a la zona del pit), a 800×800:
  - **sòlids:** `(294, 204)` – `(500, 319)` → 207×116 px (aspecte 1,78; el dibuix fa 256×144, 1,78);
  - **marcs:** `(280, 191)` – `(514, 332)` → 235×142 px (aspecte 1,66; el dibuix fa 256×154, 1,66).
  O sigui: es retalla el dibuix per la seva caixa d'alfa, s'escala a aquesta
  mida i s'enganxa en aquesta posició.
- **Dibuix de cada mockup** (el que diu `FullWideSlideHeader` per a la ruta i
  `resolveStripeTile` per al fitxer; comprovar el color de la placa en generar):

  | design del mockup | dibuix (`.../color/...`) |
  |---|---|
  | `looking-for-my-darcy-blue-solid` | `solid/blue-solid-stripe.webp` |
  | `looking-for-my-darcy-pink-solid` | `solid/fuchsia-solid-stripe.webp` |
  | `looking-for-my-darcy-red-solid` | `solid/red-solid-stripe.webp` |
  | `looking-for-my-darcy-yellow-solid` | `solid/yellow-solid-stripe.webp` |
  | `looking-for-my-darcy-pink-yellow-frame` | `frame/yellow-pink-frame-stripe.webp` |
  | `looking-for-my-darcy-red-yellow-frame` | `frame/yellow-red-frame-stripe.webp` |
  | `looking-for-my-darcy-yellow-blue-frame` | `frame/blue-yellow-frame-stripe.webp` |
  | `looking-for-my-darcy-yellow-pink-frame` | `frame/fuchsia-yellow-frame-stripe.webp` |

## Dues decisions, abans de generar

1. **Els marcs, amb placa o sense?** El dibuix actual (`frame/*`) porta la placa
   (el fons groc/blau) i és el que es imprimeix; a la franja, en canvi, es va
   demanar veure'l sense. Cal decidir què ha de sortir a la PDP.
2. **Carpeta nova o sobreescriure?** Es pot escriure en una carpeta a part
   (mateixos noms de fitxer) i canviar només el `dir` de
   `COLLECTIONS['austen-looking-for-my-darcy']` a `src/lib/mockupPaths.js`
   (admet `prefix` per mantenir els noms), o sobreescriure els actuals.

## Altres coses

- **El guió que treu la placa de les `frame` està desfet** (29/09/2026, ho va
  demanar l'amo): el codi revertit, les carpetes `frame-sensefons/` esborrades i
  el guió esborrat. No hi ha cap commit, així que a l'historial no en queda
  rastre. Si es torna a voler, s'ha de refer.
- `npx vitest run` segueix **sense passar-se** (l'amo ho va aturar).
