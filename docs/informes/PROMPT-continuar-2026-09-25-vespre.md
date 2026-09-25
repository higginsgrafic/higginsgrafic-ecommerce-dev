# PROMPT per continuar — el clic del megaslide i el botó d'enrere (25/09/2026, vespre)

Sessió llarga i amb marxa enrere. Aquest document diu **què està fet i verificat**,
**què està fet i NO verificat**, i **què queda obert**. Està escrit després
d'haver hagut de desfer feina meva, i per això és tan explícit sobre el que no
està provat.

---

## Estat de sortida

- **Últim commit:** `36745a5` · **arbre net** (només guions temporals sense
  comitejar) · branca `main`.
- **Pendent de pujar:** `36745a5`, `71c3d3a` i `defb17d` (3 commits). Els altres
  són a `origin/main`.

| comprovació | resultat |
|---|---|
| `npx vitest run` | **514 proves, 43 fitxers, totes passen** |
| `npx vite build` | **OK** |
| `npm run compara-vistes` | **OK** |
| `node scripts/mesura-formats.mjs` | **0 i 0** |
| `npx eslint` | línies base respectades: `FullWideSlideHeader` 27, `MegaStripePanel` 16, `CercadorTextRow` 6, `MegaslidePagina2` 7, `MegaMenuPanel` 2 |

---

## El que s'ha fet aquesta sessió, per ordre

| commit | què | verificat? |
|---|---|---|
| `f510ba0` | `pdpRoutes.js` (dibuix -> PDP) i la franja fa circular els 64 dibuixos | **sí** |
| `eec3a11` | el clic va a la PDP del registre (`/<colleccio>/<ruta>`), no a `/product/<slug>` | **sí** |
| `1162a5b` | la samarreta atenuada obre **el seu** producte | **sí** |
| `7f0cbef` | i l'activa i deixa la col·lecció centrada | **sí** |
| `defb17d` | la col·lecció torna de la URL amb `pageshow`; atenuats a 0,12 | **sí** (l'atenuació) |
| `71c3d3a` | la clau de la col·lecció amb guió a la URL; el gestor del clic ja no queda vell | **sí** |
| `36745a5` | treure el tancament del megaslide en clicar | **sí** |

### Les dues errades de debò d'aquesta sessió

1. **Les claus no quadraven.** A la URL s'hi escrivia `the-human-inside` i els
   lectors només acceptaven `the_human_inside` (guió baix). La col·lecció de la
   URL **no es reconeixia mai** i tot queia a FIRST CONTACT. Arreglat amb
   `clauColleccioDeUrl`.
2. **El gestor del clic de la franja es quedava vell.** L'efecte de
   `mega-stripe-full-hit-p2` (a `MegaStripePanel.jsx`) tenia una llista de
   dependències curta: hi faltaven `stripeStrip` i `onStripeStripSelect`, i
   treballava amb els valors de la primera passada, quan la tira encara no hi era.

### Els pedaços que es van haver de treure

No els repetiu:

- **Tancar el megaslide en navegar** (i navegar 300 ms més tard). No arreglava el
  bfcache i afegia una conducta que l'amo no vol: «Ara quan cliques, a més a més,
  es tanca el megaslide.»
- **Tornar a centrar la graella amb una segona passada mesurada.** Va deixar la
  graella a −1.840 px (fora de la finestra). Es va desfer.
- **Una clau de remuntatge del carrusel.** No va funcionar perquè el pare no
  canviava el senyal quan tocava.

---

## QUÈ QUEDA OBERT (el motiu de la sessió següent)

### 1. El botó d'enrere del navegador deixa el megaslide en un estat trencat

**Repro, amb xifres:** obrir el megaslide a FIRST CONTACT → clicar una samarreta
atenuada (p. ex. la casella 7, l'Afrodita de THE HUMAN INSIDE) → arriba a
`/the-human-inside/afrodita?color=white&variant=black` → **botó d'enrere del
navegador**:

```
panell: true          (el megaslide es queda OBERT)
franja: nx-01, ncc-1701...  (FIRST CONTACT)
graella: []           (CAP peça activa dins la finestra)
```

**Causa coneguda, mesurada:** el navegador restaura la pàgina del seu magatzem
(**bfcache**) amb l'estat de React d'abans de marxar i **sense tornar a muntar
res**. Comprovat amb una marca escrita a `window` abans d'anar-se'n: en tornar
hi era. Conseqüències:

- `location.search` és el mateix, i `useUrlActiveCollection` (que només mira quan
  canvia) no s'executa;
- el desplaçament del carrusel de la graella es restaura amb el valor vell, i si
  la col·lecció activa no ha canviat, el centratge **no s'executa** (només mira
  si la col·lecció ha canviat, a `CercadorTextRow`, efecte de la línia ~522);
- la graella queda a 2.360 px, fora de la finestra de 853,6 px.

**El que hi ha ara:** un lector de `pageshow`/`popstate` a `FullWideSlideHeader`
que torna a llegir la col·lecció de la URL. **No n'hi ha prou**: ho tapa a mitges.

**On mirar, per ordre:**

1. `src/components/fullwide/CercadorTextRow.jsx`, l'efecte de centratge (cap a la
   línia 522): avui només centra si la clau `activeCollection|activeSubcollection`
   ha canviat. **Proposta:** que torni a centrar quan el carrusel es munta o quan
   el megaslide passa de tancat a obert.
2. `src/hooks/useUrlActiveCollection.js` i el `pageshow` de
   `FullWideSlideHeader.jsx`: decidir qui mana quan la pàgina es restaura.
3. `src/components/fullwide/MegaMenuPanel.jsx`: per on es pot fer arribar un
   senyal d'«acaba d'obrir» a la filera sense remuntar-la sencera.

**Regla per a la propera sessió:** no hi poseu cap pedaç més sense una repro que
el justifiqui. Dues vegades aquesta sessió es va empitjorar el que funcionava.

### 2. La PDP ha de mostrar el color i la variant del megaslide

El megaslide navega amb `?color=<slug>&variant=<white|black|color>`. Comprovar
que `PdpPage` (`/<colleccio>/<ruta>`) els llegeix i que arrenca amb el color i
l'acabat triats. **No verificat.**

### 3. Falta el producte del marc groc de «Looking For My Darcy»

Al registre (`src/data/pdpRegistry.js`) no hi ha cap producte de marc groc sol:
hi ha `looking-for-my-darcy-pink-yellow-frame`. El dibuix «Looking For My Darcy
Yellow Frame» hi apunta. **És cosa de l'amo.**

---

## Coses que la propera sessió ha de saber i no pot deduir del codi

1. **La franja NO pot lliscar de debò.** El dibuix de fons no es repeteix: el
   blanc coincideix al 49 % desplaçat 1/14, i el de colors al 0,75 %. Per això el
   que circula és la LLISTA (64 dibuixos) per les 14 cases fixes, i no els píxels.
2. **El pas entre cases de dibuix és constant**: 6,8691 / 6,8705 / 6,8706 % de
   l'amplada. És el que fa possible el bucle exacte.
3. **L'ordre de la tira:** primer la col·lecció activa, després les altres en
   l'ordre de la graella (`first_contact`, `the_human_inside`, `austen`, `cube`,
   `miscellania`). Per això, si cliques una d'atenuada, la primera que surt a mà
   és THE HUMAN INSIDE.
4. **Dues pàgines de producte hi conviuen:** `/<colleccio>/<ruta>` (`PdpPage`,
   la del registre) i `/product/<slug>` (`ProductDetailPage`). **La del megaslide
   és la primera.**
5. **La cadena dibuix -> mockup -> producte no es pot recórrer:** de 152 files de
   `product_mockups`, cap té `variant_id`, i de 4.116 variants, cap té `design`.
6. **Els guions temporals** (`scripts/_tmp-*.mjs`) són molts i no es comitegen.
   Els útils d'aquesta sessió: `_tmp-flux-amo.mjs` (el flux de l'amo),
   `_tmp-pdp-tots.mjs` (les 64 rutes), `_tmp-clic-activa.mjs`, `_tmp-periode-sprite.mjs`.

---

## Números de referència (1920×946)

- franja: **357,8 · 222,9 · 1049,1 × 112,4**; la imatge 357,8..1406,9
- finestra de la graella: **455,6..1309,2** (centre 882,4)
- selector B/C/N: 381..445,7 × 76,7..206,1
- graella: 64 peces · pas 69,83 · una peça per clic 34,91 · període 2234,5
- atenuació: **0,12** a la franja i a la graella (abans 0,24)
