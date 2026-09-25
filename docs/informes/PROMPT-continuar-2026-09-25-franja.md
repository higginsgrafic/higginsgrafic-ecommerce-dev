# PROMPT per continuar — la franja amb scroll (25/09/2026)

Bloc següent, decidit amb l'amo. **No començat**: aquesta sessió s'ha allargat
massa i la franja és la peça més delicada del megaslide; val més fer-ho d'una
tirada i amb la franja mesurada abans i després que deixar-la a mitges.

## Què ha de fer la franja (les respostes de l'amo)

1. **La tira, de totes les col·leccions seguides**, com la graella de dibuixos.
   La col·lecció activa a ple i la resta atenuada; les samarretes que avui es
   veuen atenuades (buides) han de portar **els dibuixos de la col·lecció
   següent**.
2. **El moviment**, com la graella: les peces passen **d'una en una**, en
   **scroll infinit** (quan arriben al final tornen a començar) i amb **scroll
   lliure amb la rodeta del ratolí**.
3. **El clic**: una icona atenuada (d'una altra col·lecció) activa **aquella
   col·lecció** — com a la graella — i la col·lecció queda **centrada a la
   finestra de la graella** (això ja està fet per a la graella, `52f223d`).
4. **P.S. de l'amo: «les samarretes no s'han de moure. Només els dibuixos.»**
   → La imatge de les 14 samarretes (el sprite) i **l'encaix de les cintures
   queden intactes**: no s'ha de tocar ni `useEscalaFranjaCarril` ni el
   calibratge. El que es mou és la **capa de dibuixos**.

## Què ja està fet i comitejat (no cal refer-ho)

| commit | què |
|---|---|
| `a531b49` | la franja encaixa per les cintures (vora esquerra del carril → dreta de les fletxes) i la pàgina 2 al seu lloc |
| `34c0646` + `7acd3b7` | la botonera de fletxes: dues fletxes, l'alçada del selector, i totes dues juntes al mig; la franja de les dues pàgines de la mateixa mida |
| `a8c94ca` | la graella: fletxes d'una en una, bucle infinit (dues còpies + residu modular) i rodeta (`passive: false`) |
| `52f223d` | la col·lecció clicada (enllaç o icona atenuada) queda centrada a la finestra de la graella |

Battery passada a tots: `npx vitest run` (514), `npx eslint` (línies base: vegeu
més avall), `npx vite build`, `npm run compara-vistes` (OK), `node
scripts/mesura-formats.mjs` (0 i 0).

## El pla, pas a pas

### 1. La tira de dibuixos, de totes les col·leccions seguides

`src/components/megaslide/MegaslidePagina2.jsx`:

- `drawable` (cap a la línia 313) avui és només la col·lecció activa
  (`resolvedMegaFiltered[active]`). Ha de passar a ser **la seqüència de totes**
  en l'ordre de col·lecció. La font de veritat de l'ordre ja existeix:
  `dibuixosGraella16x4()` (exportada per `CercadorTextRow.jsx`, i ja importada a
  `MegaslidePagina2.jsx`); retorna `{ label, collection, subcollection,
  stripeItem }[]`, exactament el joc que fa servir la graella.
- `stripeTileOverlaySrcs` (línia ~321) i `stripeTileItems` (línia ~332) han de
  fer la **tira sencera**, no 14 caselles.
- **Trampa trobada provant-ho** (25/09, 30 min): `resolveForItem` (dins
  `computeStripeTileOverlaySrcs`, `src/utils/resolveStripeTile.js`) resol el
  dibuix **amb el context de la col·lecció activa** (`active`,
  `displayedShirtColor`, `resolvedOverlaySrc`). Si se li passen ítems d'una
  altra col·lecció, torna `null` i la casella queda buida (mesurat: 7 dibuixos
  dels 14 que tocaven). Per tant, la tira s'ha de construir **col·lecció a
  col·lecció** (una crida per col·lecció amb el seu `active`/variant) i
  concatenar; no n'hi ha prou de passar una llista llarga.
- `emptyTileIndices` (línia ~351) deixa de tenir sentit: totes les caselles
  portaran dibuix.
- L'opacitat: la de la graella (0,24) per als dibuixos que no són de la
  col·lecció activa.

### 2. La capa de dibuixos que es mou

`src/components/fullwide/MegaStripePanel.jsx` (~1300 línies; el dibuix de cada
casella viu a partir de la línia 769 i té tres branques: escriptori, tauleta i
vertical). Cal:

- una capa pròpia per als dibuixos, amb la tira sencera, dins del mateix espai
  escalat que el sprite (perquè les coordenades de casella segueixin valent);
- el desplaçament (el mateix joc que la graella: dues còpies i residu modular);
- les fletxes (una peça per clic) i la rodeta;
- **l'escull real**: avui cada dibuix va retallat amb la màscara de la seva
  casella (`stripeMaskTileRectsRawPct`). Si els dibuixos llisquen, el retall ha
  de viatjar amb ells. Dues vies: (a) la màscara que acompanya cada dibuix, o
  (b) una capa pròpia escalada igual que el sprite (i aleshores el retall és el
  de la tira). Cal provar-les amb la franja mesurada.

### 3. El clic (i el 404)

**Fet (25/09):** el clic de la graella ja no se l'empassa el contenidor del
selector (`99e5e02`): el contenidor fa el doble d'ample que la pastilla i
trepitjava les primeres caselles. Comprovat clicant una icona atenuada de CUBE:
el clic arriba i no hi ha cap 404 en el navegador instrumentat (ni navegació ni
cap error HTTP).

**Fet (25/09, `44a…`):** el clic a una icona tambe crida la PDP. Els dos
gestors `onSelectGroup` de `MegaslidePagina2.jsx` (la filera i la taula) criden
`onShirtClick(collection, item, overlayHex)` — el mateix cami que el clic de la
samarreta de la franja. Provat: clicar NX-01 porta a
`/first-contact/nx-01?color=white&variant=black`, sense cap error HTTP.

**El 404, hipotesi forta:** `resolvePdpUrl(collection, item)` (`FullWideSlideHeader.jsx`)
construeix la URL amb la colleccio i l'item. Si la ruta d'aquella colleccio no
existeix a l'app, el `navigate` hi va i peta el 404 — i encaixa amb el que diu
l'amo: «el que dona 404 es la colleccio atenuada quan la cliques». Cal comprovar
quines rutes te el router (la de `first-contact/...` funciona) i si hi falten les
de les altres colleccions, o si cal no navegar quan la ruta no existeix.

**Pendent, dit per l'amo el 25/09:** «El que dona 404 és la col·lecció atenuada
quan la cliques per 1. Centrar la col·lecció, cosa que no passa i 2. Cridar la
PDP d'aquell producte, que tampoc passa.» Falta la URL del 404; el centratge ja
està fet a la graella (`52f223d`) i el clic de la icona ja selecciona l'ítem,
però **no crida cap PDP**: això és el que falta afegir al gestor
(`onSelectGroup`, `MegaslidePagina2.jsx`), probablement amb el mateix camí que fa
servir el clic de la samarreta de la franja (`onShirtClick`).

**Què demana l'amo (25/09):** «un dibuix atenuat activa la seva col·lecció (de
moment, no. 404). No només ha de centrar la col·lecció a la graella, també ha de
mostrar el producte que hagi estat clicat, actiu o no.»

**Què ja fa el codi:** el gestor de la icona (`onSelectGroup`, a
`MegaslidePagina2.jsx` cap a la línia 607) ja fa les tres coses: canvia la
col·lecció activa, canvia la subcol·lecció d'austen i **selecciona l'ítem
clicat** (`setFirstContactSelectedItem` / `setHumanInsideSelectedItem` /
`setSelectedItemByCollection`). Per tant el 404 **no surt d'aquí**: cal trobar
d'on surt (ruta de producte? navegació de la capçalera?) amb la URL del 404.

**Trampa trobada provant-ho:** el contenidor del selector B/C/N
(`div[data-p2-color-selector]`) **intercepta els clics** de la part esquerra del
carrusel (Playwright: «`<div>` from `<div data-p2-color-selector="true">`
subtree intercepts pointer events»). O sigui que les primeres caselles de la
graella poden no ser clicables; cal comprovar-ho i, si és així, deixar passar el
punter fora de la pastilla del selector.

Amb el punt 1 de la graella (`52f223d`) la graella es centrarà tota sola.

## Números de referència (1920×946, mesurats avui)

- carril: 381..1524; finestra de la graella: 455,6..1309,2 (centre 882,4)
- selector B/C/N: 381..445,7 × 76,7..206,1; caselles: BLANC 98,25, COLOR 141,35,
  NEGRE 184,5
- bloc de fletxes: 1319,1..1383,8 × 76,7..206,1; fletxes a 119,8 i 162,9
- graella: 64 peces; pas 69,83; mig pas (una peça per clic) 34,91; període
  2234,5; tira 4539 px amb les dues còpies
- barres de color: 14, 53,6 × 15,3 (7,00:2), 455,6..1309,2, centre = NEGRE
- enllaços: 9 targetes, del top del selector (76,7) al bottom de la franja
  (335,2)
- franja: cintures 381,6..1384,6 (carril esquerre → dreta de les fletxes) a les
  dues pàgines, amb el calibratge desat descomptat

## Regles de la casa que no es toquen

- La battery abans de comitejar (les línies base de lint: `CercadorTextRow` 6
  avisos, `MegaslidePagina2` 6, `MegaStripePanel` 16, `MegaStripePanelP1` 4,
  `MegaMenuPanel` 2 errors, `firstContactPanels` 2).
- Els guions temporals (`scripts/_tmp-*.mjs`) no es comitegen mai.
- `compara-vistes` i `mesura-formats` han de dir OK / 0 i 0.
- Res de `push` sense demanar-ho; `compara-vistes` mesura `/nova/inici` (la ruta
  que mira l'amo).
- Es mesura abans i després, i cada número ha de tenir un origen llegible.
