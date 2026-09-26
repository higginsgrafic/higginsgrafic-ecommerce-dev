# PROMPT per continuar — la pàgina 2 del megaslide i el contingut que arriba tard (26/09/2026)

Sessió llarga. Aquest document diu **què està fet i verificat**, **què està fet i
NO verificat** i **què queda obert**, amb la feina pendent ja localitzada. Està
escrit després d'haver hagut de desfer dues vegades el mateix canvi, i per això
és explícit sobre com s'ha de comprovar.

---

## Estat de sortida

- **Últim commit:** `7c54849` · **arbre net** (només guions temporals sense
  comitejar) · branca `main` · **tot pujat** a `origin/main`.
- **Servidor de desenvolupament al 3003: no s'ha de tocar** (l'amo recarrega
  amb F5). Els `scripts/_tmp-*.mjs` són temporals i **no es comitegen**.

| comprovació | resultat |
|---|---|
| `npx vitest run` | **525 proves, 45 fitxers, totes passen** |
| `npx vite build` | **OK** |
| `npm run compara-vistes` | **OK** |
| `node scripts/mesura-formats.mjs` | **0 i 0** |
| `npx eslint` | línies base respectades (`MegaStripePanel` 4/11, `MegaStripePanelP1` 3/1, `MegaslidePagina2` 0/7, `CercadorTextRow` 0/6, `MegaMenuPanel` 2/0, `FullWideSlideHeader` 15/12) |
| errors de consola a l'obertura | **0** |

---

## El que s'ha fet, per ordre

| commit | què | verificat? |
|---|---|---|
| `cfb635e` | la graella de la pàgina 2 neix a la mida bona (l'alineació de la filera és dependència de la seva mesura) | **sí** |
| `97a3656` | el selector també neix centrat (la mida de la graella arriba al bucle que el centra) | **sí** |
| `3e24b43` | el bucle de les dues files no compta dues vegades la correcció, i la finestra conté la fila de dalt sencera | **sí** |
| `aec0074` | la tira de colors i el bloc de fletxes també neixen a lloc | **sí** |
| `0ea261d` | el pas dels cercles es declara i la deducció d'alçada espera una mesura repetida | **sí** |
| `262f79b` | la imatge de la franja porta les seves mides i l'escala té el carril declarat | **sí** |
| `d17ff63` | els tres bucles de mesura de la filera són **una sola passada** | **sí** |
| `2f3ccea` | **geometria declarada**: `geometriaMegaslide.js` amb carril, x i amplada de la franja + proves | **sí** |
| `0990d91` | les **189 calibracions** de la banda surten del mapa (238 → **35**) i les serveix la regla | **sí** |
| `7b95414` | els ajustos de 10/20 px, declarats al mòdul | **sí** |
| `35f6e9d` | l'override del HUD només mana en desenvolupament | **sí** |

**Resultat:** la composició de la pàgina 2 té **un sol estat pintat** en obrir
(1920, 1512 DPR 2, 1440, 2560) i en carregar (1512, 1920); les files a 0,02 px
de les seves cel·les; 0,00 px de tinta tallada.

---

## El que queda obert (una sola cosa)

**El megaslide s'obre abans d'estar a punt**: els dibuixos surten com a text, la
franja buida, i es van omplint davant de l'amo. Mesurat en carregar amb
`?active=`:

```
t=1426  opacitat=0,00  imatges decodificades=  0/128
t=1664  opacitat=0,00  imatges decodificades=128/128
t=1770  opacitat=0,91  imatges decodificades=128/128
```

En una màquina ràpida l'animació d'obertura (340 ms) ho amaga; en la de l'amo, no.

### El que s'ha provat i **no** funciona (no ho repetiu)

1. **Amagar el contingut del panell** fins que les imatges hi siguin, amb estat
   de React: **peta en render** (l'error boundary el caça).
2. **El mateix, amb una classe al DOM** (sense estat): l'aplicació va bé i el
   contingut ja surt complet, però **trenca el clic d'obertura**; com que
   `compara-vistes` fa el clic amb un `.catch`, el megaslide no s'obre i el
   testimoni diu «no s'ha trobat la graella». Dues versions, totes dues
   revertides (`8339230`, `631d4ec`).
3. **Escalfar el panell** (muntar-lo amagat uns segons després de carregar,
   l'experiment `feat/mega-escalfament`): el flux de clic ja sortia complet sense
   això, el de càrrega no el toca, i introduïa un salt (la pàgina 1 s'assenta
   quan el panell passa d'anar fora del flux a anar-hi).

### El que s'ha de fer

**No obrir fins que hi sigui tot**, i per això cal **precarregar les imatges
abans de muntar el panell** (si es munta més tard, les imatges també es demanen
més tard i no s'hi guanya res):

- **Punt únic de pas:** l'estat `active` del header
  (`src/components/FullWideSlideHeader.jsx`). Tots els camins hi passen: la URL
  amb `?active=` (a l'inici, amb `pageshow` i amb `popstate`), el clic a la icona
  de cerca i els enllaços de col·lecció.
- **La llista d'imatges:** `computeStripeTileOverlaySrcs({ drawable, variant,
  active, displayedShirtColor, resolvedOverlaySrc, limit })`, a
  `src/utils/resolveStripeTile.js` — és pura i ja existeix.
- **El `drawable` de cada col·lecció:** `resolvedMegaFiltered[active]` →
  `cols[0].items` sense les peces de control. **Compte:** THE HUMAN INSIDE no
  surt d'aquí, surt de `thinDrawings` (`MegaslidePagina2.jsx`).
- **Topall de 400 ms** perquè cap xarxa lenta no bloquegi l'obertura.

### Com s'ha de verificar (les tres coses, sempre, en la mateixa passada)

1. **El comptador de contingut** (temporal, `scripts/_tmp-carrega-obert2.mjs`):
   al primer fotograma pintat, 0 textos i les imatges del retall decodificades.
2. **`npm run compara-vistes`**: és el que va descobrir que la porta trencava el
   clic.
3. **La prova d'errors de consola** (`scripts/_tmp-errors2.mjs`), i comprovar
   que el clic d'obertura funciona.

Una sola no basta: la primera deia que anava bé i la segona deia que no.

---

## Trampes apreses (no hi torneu a caure)

- **Els probes de posicions són cecs els primers ~400 ms** (el fil principal
  està muntant el panell). Per veure-hi: sonda DINS dels bucles, o mostreig
  després de pintar (`rAF` + `setTimeout 0`).
- **Mesurar posicions no és mesurar contingut.** El que l'amo veia era el
  contingut arribant, i cap probe de posicions ho deia.
- **`carrilDeclarat` decideix la classe de dispositiu amb amplada I alçada.**
  Passar-hi alçada zero canvia la regla (la franja es pintava amb l'escala de
  disseny).
- **No afegir hooks a `MegaMenuPanel` ni al header sense compte:** moure'n
  l'ordre fa petar el render.
- **`compara-vistes` mesura píxels:** qualsevol element amagat el pot fer
  fallar, i els `.catch(() => {})` dels estris amaguen el motiu.
- **Els bucles de calibratge han d'arrencar del valor PINTAT**, no d'una `ref`
  escrita dins del bucle: si dos passos cauen a la mateixa tasca, la correcció
  es compta dues vegades (mesurat: 3 de 6 obertures en fred amb les files 13,6
  i 15,9 px fora de lloc).

---

## Informes

- `docs/informes/INFORME-2026-09-25-graella-p2-mida-inicial.md` — tot el que
  s'ha arreglat, amb les xifres abans/després.
- `docs/informes/PLA-neteja-calibratge-megaslide.md` — els bucles de calibratge i
  la neteja (passos 1-5 fets), i el que queda per declarar (les mides de la
  graella, que depenen de l'amplada del retall de la filera).
- `docs/informes/COM-TREBALLO.md` — com treballa l'amo (sense comitejar).
