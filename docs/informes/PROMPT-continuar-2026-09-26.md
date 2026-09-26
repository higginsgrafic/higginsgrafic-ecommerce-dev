# PROMPT DE CONTINUACIÓ — 26/09/2026

**Per a la propera sessió.** Llegeix això i, si cal, els informes que s'hi
citen. Tot el que hi ha aquí està mesurat i comitejat.

---

## 1. Estat

- **Branca** `main`, arbre net, **34 commits sense pujar** (no s'ha de fer push
  sense que ho digui l'amo).
- Portes, totes en verd: `npx vitest run` **525 proves / 45 fitxers**,
  `npx vite build` OK, `npm run compara-vistes` OK,
  `node scripts/mesura-formats.mjs` **0 i 0**, eslint a les línies base.
- El servidor de desenvolupament és al **3003** i **no s'ha de tocar** (l'amo
  recarrega amb F5).
- Els scripts `scripts/_tmp-*.mjs` són temporals i **no es comitegen**.

### Informes de referència

- `docs/informes/INFORME-2026-09-25-graella-p2-mida-inicial.md` — tot el que
  s'ha arreglat de la pàgina 2, amb les xifres abans/després.
- `docs/informes/PLA-neteja-calibratge-megaslide.md` — l'inventari dels bucles
  de calibratge i la neteja (passos 1-5 **fets**).

---

## 2. Què està fet (i no s'ha de tornar a tocar)

1. **La geometria de la pàgina 2 neix a la mida bona**: la graella, el selector,
   la tira de colors, el bloc de fletxes, la franja i la columna de
   col·leccions tenen **un sol estat pintat** en obrir (1920, 1512 DPR 2, 1440,
   2560) i en carregar (1512, 1920).
2. **Els bucles**: els acumuladors parteixen del valor PINTAT (idempotents), la
   primera passada va en un `rAF` (abans del primer pintat, després dels efectes
   de layout) i els tres bucles de la filera són **una sola passada**
   (`d17ff63`).
3. **Geometria declarada** (`src/components/megaslide/geometriaMegaslide.js`):
   carril i x (`carrilDeFinestra`), mides del fitxer de la franja, amplada dels
   dibuixos (`escalaDibuixFranja`, 80 unitats = 41 % del cos), ajustos de 10/20
   px. Amb proves a `tests/unit/geometria-megaslide.test.js` i
   `tests/unit/dibuixos-franja.test.js`.
4. **Les calibracions manuals**: de **238 a 35 entrades**
   (`STRIPE_DRAWING_CALIBRATIONS`). Les que queden són les excepcions de disseny
   i les plaques de color. Una prova vigila que no hi torni cap entrada de la
   banda.
5. **El HUD** (calibratge) només mana en desenvolupament.

---

## 3. Què queda pendent (una sola cosa)

**El megaslide s'obre abans d'estar a punt**: els dibuixos surten com a text i
les samarretes buides, i es van omplint davant de l'amo.

Mesurat (flux de càrrega amb `?active=`):

```
t=1426  opacitat=0,00  imatges decodificades=  0/128
t=1664  opacitat=0,00  imatges decodificades=128/128
t=1770  opacitat=0,91  imatges decodificades=128/128
```

En una màquina ràpida l'animació d'obertura (340 ms) ho amaga; en la de l'amo,
no.

### Què NO funciona (ja provat i descartat, amb el motiu)

- **Amagar el contingut del panell** fins que les imatges hi siguin (amb estat
  de React o amb una classe al DOM): l'aplicació va bé i el contingut ja surt
  complet, però **trenca el clic d'obertura** i, per tant, `compara-vistes`
  (que fa el clic amb un `.catch` i després diu «no s'ha trobat la graella»).
  Dues versions, totes dues revertides.
- **Escalfar el panell** (muntar-lo amagat uns segons després de carregar,
  l'experiment `feat/mega-escalfament`): el flux de clic ja sortia complet sense
  això, el de càrrega no el toca, i introduïa un salt (la pàgina 1 s'assenta
  quan el panell passa d'anar fora del flux a anar-hi).

### Què s'ha de fer

**No obrir fins que hi sigui tot**, precarregant les imatges **abans** de
muntar el panell (si es munta més tard, les imatges també es demanen més tard i
no s'hi guanya res):

- **Punt únic de pas**: l'estat `active` del header
  (`src/components/FullWideSlideHeader.jsx`). Tots els camins hi passen: la URL
  amb `?active=`, el clic a la icona de cerca, un enllaç de col·lecció,
  `popstate` i `pageshow`.
- **La llista d'imatges**: `computeStripeTileOverlaySrcs({ drawable, variant,
  active, displayedShirtColor, resolvedOverlaySrc, limit })`
  (`src/utils/resolveStripeTile.js`) — és pura i ja existeix.
- **El `drawable` de cada col·lecció**: `resolvedMegaFiltered[active]` →
  `cols[0].items` sense les peces de control. **Compte**: THE HUMAN INSIDE no
  surt d'aquí, surt de `thinDrawings` (`MegaslidePagina2.jsx`).
- **Topall** de 400 ms perquè cap xarxa lenta no bloquegi l'obertura.

### Com s'ha de verificar (les tres coses, sempre)

1. **El comptador de contingut**: al primer fotograma pintat, 0 textos i les
   imatges del retall decodificades (l'hi ha a `scripts/_tmp-carrega-obert2.mjs`
   i `scripts/_tmp-escalf.mjs`, temporals).
2. **`npm run compara-vistes`**: és el que va descobrir que la porta trencava el
   clic.
3. **La prova d'errors de consola** (`scripts/_tmp-errors2.mjs`).

Una sola no basta: la primera deia que anava bé i la segona deia que no.

---

## 4. Trampes apreses aquesta nit (no tornar-hi a caure)

- **Els probes de posicions són cecs els primers ~400 ms** (el fil principal
  està muntant el panell): per veure-hi cal una sonda DINS dels bucles o
  mostrejar després de pintar (`rAF` + `setTimeout 0`).
- **Mesurar posicions no és mesurar contingut**: el que l'amo veia era el
  contingut arribant, i cap dels meus probes de posicions ho deia.
- **`carrilDeclarat` decideix la classe de dispositiu amb amplada I alçada**:
  passar-hi alçada zero canvia la regla.
- **No afegir hooks a `MegaMenuPanel` ni al header sense compte**: `useState` i
  `useEffect` nous van fer petar el render (l'error boundary el va caçar).
- **`compara-vistes` mesura píxels**: qualsevol element amagat el pot fer
  fallar, i les mesures `.catch(() => {})` amaguen per què.
