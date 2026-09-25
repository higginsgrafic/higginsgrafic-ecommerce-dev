# INFORME — el botó d'enrere, la falsa recàrrega i el centratge de la franja

**Data:** 25/09/2026 (matí) · **Sessió:** la del prompt de reinici del vespre
(`83cc0e3`) · **Branca:** `main` · **Pendent de pujar:** 3 commits

Aquest informe explica **tres problemes sencers**, amb la causa mesurada de
cadascun. Està escrit perquè el proper que hi entri no hagi de repetir cap de les
proves: cada afirmació que hi ha aquí té una mesura al darrere, i les que no la
tenen, ho diuen.

---

## 1. Estat de sortida

| comprovació | resultat |
|---|---|
| `npx vitest run` | **514 proves, 43 fitxers, totes passen** |
| `npx vite build` | **OK** |
| `npm run compara-vistes` | **OK** |
| `node scripts/mesura-formats.mjs` | **0 i 0** |
| `npx eslint` | línies base respectades a tots els fitxers tocats (vegeu §7) |
| errors de consola al megaslide | **0** |

| commit | què |
|---|---|
| `eb9c4ff` | la col·lecció activa també va a la URL, i el botó d'enrere ja no trenca el megaslide |
| `cf8fcd6` | el clic d'una col·lecció també centra la franja, i les samarretes inactives s'atenen |
| `c3b6f4d` | el «Carregant…» de les rutes ja no posa la pàgina en blanc |
| `9311bc5` | aquest informe |
| `f80707c` | la graella també queda centrada quan es remunta, no només quan canvia la clau |
| `d351393` | l'informe recull el centratge de la graella i la trampa del `find` |
| `b6a5fe4` | el vel també va amb el dibuix, no amb la casa |
| `20da21e` | el Terminator també surt a la franja de THE HUMAN INSIDE |

Cap `push` fet: ho ha de dir l'amo (regla de la casa).

---

## 2. El botó d'enrere deixava el megaslide trencat

### 2.1 La repro

Obrir el megaslide a FIRST CONTACT → clicar una samarreta atenuada (la casella 7,
l'Afrodita de THE HUMAN INSIDE) → arriba a
`/the-human-inside/afrodita?color=white&variant=black` → **botó d'enrere del
navegador**.

| què | valor mesurat abans de l'arreglament |
|---|---|
| panell | **obert** |
| franja | FIRST CONTACT |
| `translateX` de la graella | **−1934,53 px** |
| finestra de la graella | **853,59 px** |
| peces actives dins la finestra | **0** |

`−1934,53` és el residu de `−299,94` sobre un període de `2234,48`. O sigui: el
desplaçament era el d'una altra col·lecció.

### 2.2 La causa, amb la sonda posada al codi

Es va posar una sonda a l'efecte de centratge de `CercadorTextRow` que escrivia a
`window` cada passada, amb la clau que veia i la que hi havia abans. El resultat:

```
efecte  the_human_inside|  (anterior: first_contact|)  objectiu  +84,11
efecte  first_contact|     (anterior: the_human_inside|) objectiu −299,94
```

La segona passada **no l'havia de fer ningú**. Ve d'aquí:

1. La URL de `/nova/inici` portava **només** la col·lecció que hi havia en obrir
   el megaslide. El clic d'una icona atenuada (o d'una samarreta de la franja)
   canviava l'estat de React però **no la URL**.
2. En tornar, el navegador restaura la pàgina del **bfcache** amb l'estat de
   React intacte i sense tornar a muntar res. La marca que s'hi havia escrit
   abans de marxar hi era en tornar: **això està comprovat, no suposat**.
3. Com que en restaurar mana la URL, el lector de `pageshow` i el hook
   `useUrlActiveCollection` hi tornaven a llegir `?active=first_contact`, i
   canviaven la col·lecció activa de cop.
4. L'efecte de centratge de la graella hi queia darrere i tornava a centrar la
   graella amb la col·lecció equivocada.

`apuntaColleccio` ja existia des del 25/09, però **només la cridava
`ensureMegaOpen`**. L'estat i la URL són el mateix fet: si no s'apunten tots dos,
un dels dos menteix, i en restaurar mana la URL.

### 2.3 L'arranjament

Un sol efecte, al costat d'`apuntaColleccio`: s'hi apunta **sempre** que canvia
la col·lecció activa (i només a `/nova/inici`, i amb `replace`, com ja feia).
Amb això la restauració ja no té res a desfer.

### 2.4 El resultat, mesurat

| què | abans | després |
|---|---|---|
| URL en tornar | `/nova/inici?active=first_contact` | `/nova/inici?active=the-human-inside` |
| franja | FIRST CONTACT | **THE HUMAN INSIDE** |
| `translateX` | −1934,53 | **−84,11** |
| peces a la finestra | 0 | **15** (Afrodita-A … Vader) |
| panell | obert | obert |
| marca de bfcache | hi era | **hi era** (no s'ha tapat el símptoma) |

### 2.5 Els pedaços que NO s'han de repetir

La sessió anterior en va desfer tres, i tots tres tornaven a aparèixer com a
temptació:

- **Tancar el megaslide en navegar** (i navegar 300 ms més tard). No arregla el
  bfcache i l'amo no ho volia.
- **Una segona passada de centratge mesurada.** Va deixar la graella a −1840 px.
- **Una clau de remuntatge del carrusel.** No funcionava perquè el pare no
  canviava el senyal quan tocava.

---

## 3. La «recàrrega» que no era una recàrrega

### 3.1 El símptoma

L'amo va dir: «Cada cop que clico una col·lecció es recarrega la pàgina.» I va
enviar un **vídeo** (39 s, 1920×946). Al fotograma de **8,5 s** hi surt la
pàgina sencera en blanc amb un «Carregant…» centrat.

### 3.2 El que NO és

| comprovació | resultat |
|---|---|
| esdeveniment `load` del document en clicar | **1 i 1: no n'hi ha cap de nou** |
| `pageshow` / `beforeunload` / `pagehide` | cap de nou |
| marca escrita a `window` abans de clicar | **hi és després** |
| el panell es remunta? | **no** (la marca al DOM hi és) |

O sigui: no és cap recàrrega. I el que és important: **la marca sobreviu**, que és
la prova que l'estat de React no s'ha perdut.

### 3.3 La reproducció forçada

Per veure-ho sense esperar que passi de casualitat, s'ha frenat **només** la peça
de la PDP (`PdpPage`) amb `page.route`, 2,5 s:

| mesura | resultat |
|---|---|
| el «Carregant…» surt | **sí, 2,7 s** (27 mostres de 100 ms) |
| marca a `window` durant el «Carregant…» | **hi és sempre** |
| `load` nou | **cap** |

### 3.4 La causa

`App.jsx` envoltava **totes** les rutes amb:

```jsx
<Suspense fallback={<LoadingScreen />}>
```

I `LoadingScreen` es pinta amb un **portal a `document.body`** amb
`position: fixed`, `100vw × 100vh` i `zIndex: 99999`. Quan una ruta triga un
instant a carregar —i la PDP va amb `lazy`—, el fallback del Suspense **cobreix
la pàgina sencera de blanc**. Allò és indistingible d'una recàrrega, i és
exactament el que es veu al vídeo.

### 3.5 L'arranjament

`LoadingScreen` accepta ara `variant`. Amb `variant="inpage"` es queda **dins del
seu contenidor**; sense variant (la càrrega de debò i el `isNavigating`) continua
sent l'overlay de sempre. El fallback de les rutes passa a ser:

```jsx
<Suspense fallback={<LoadingScreen variant="inpage" />}>
```

### 3.6 El resultat, mesurat

Durant el «Carregant…» forçat:

| què | valor |
|---|---|
| capçalera | **1905 × 376** (hi és) |
| megaslide | **muntat, 14 cases** (hi és) |
| el «Carregant…» | a sota, 83 × 17 px |

Ja no sembla una recàrrega.

---

## 4. El centratge de la franja I de la graella

### 4.0 La segona meitat del problema: la graella no centrava en remuntar-se

El centratge de la graella (`CercadorTextRow`) tenia un guarda que el saltava
**al primer pintat**: «la graella arrenca on arrenca». Amb la franja centrada i la
graella no, les dues peces no deien el mateix.

El megaslide **es remunta en navegar** (mesurat amb la sonda de vida:
`desmuntat` i `muntat/actiu` al mateix instant). El guarda, doncs, es menjava la
passada del retorn. Mesurat a FIRST CONTACT abans de l'arranjament:

| què | valor |
|---|---|
| peces actives de la graella | **0..6** |
| dibuix més proper al centre de la finestra | **Iron Man '08, atenuat (0,12)** |
| dibuix més proper al centre de la franja | casa 6, activa |

L'arranjament és treure el guarda del primer pintat: el centratge va amb la clau
de la col·lecció **i** amb el muntatge. Els desplaçaments manuals (rodeta,
fletxes) no el disparen mai, perquè la clau no canvia.

Mesurat després, passant per les cinc col·leccions i tornant:

| col·lecció | dibuix al mig de la graella | casa al mig de la franja |
|---|---|---|
| FIRST CONTACT | **NX-01** (1) | 6 (1) |
| THE HUMAN INSIDE | **Maschinenmensch** (1) | 6 (1) |
| CUBE | **Darth Cube** (1) | 6 (1) |
| MISCEL·LÀNIA | **DJ Vader** (1) | 6 (1) |
| FIRST CONTACT (2a volta) | **Wormhole** (1) | 6 (1) |

En tots cinc casos, el dibuix del mig és **actiu** a totes dues peces.

### 4.1 El que va demanar l'amo

> «Quan cliquis una col·lecció a la graella o a la stripe s'ha de centrar la
> col·lecció a dalt i a baix. A stripe i graella alhora.»

«A dalt i a baix» es va aclarir amb l'amo: vol dir **a la graella i a la franja
alhora**, i en **horitzontal**. I després: «centratge aproximat a la stripe, ja
que les caselles no es mouen» (les catorze cases de la franja són fixes).

### 4.2 La causa

La tira es construeix amb la col·lecció activa **al principi** (`tiraFranja`), i
les catorze cases començaven per la casa 0: la col·lecció nova sortia **enganxada
a l'esquerra**, mentre que la graella (a sota) quedava centrada a la finestra.

### 4.3 L'arranjament

Quan canvia el grup actiu, s'hi posa el desplaçament que centra el bloc a la casa
**6,5** (la meitat de catorze): `(quants − 1) / 2 − 6,5`. La tira és circular, i
es tria la volta més propera al desplaçament que ja hi hagi perquè no faci cap
salt (mateix criteri que el centratge de la graella). **El gest manual de l'amo
(rodeta, fletxes) no es trepitja mai**, perquè l'efecte només s'executa quan
canvia el grup.

### 4.4 El resultat, mesurat

Amb els comptes de debò de cada col·lecció:

| col·lecció | dibuixos | casos actives | centre |
|---|---|---|---|
| FIRST CONTACT | 7 | 3..9 | 6,5 ✔ |
| THE HUMAN INSIDE | 14 | 0..13 | 6,5 ✔ |
| CUBE | 10 | 2..11 | 6,5 ✔ |
| MISCEL·LÀNIA | 6 | 4..9 | 6,5 ✔ |

---

## 5. El vel de les samarretes inactives

### 5.1 El que va demanar l'amo

> «Les samarretes, quan no són actives, també s'han d'atenuar, no només el
> dibuix.»

### 5.2 Com s'atenuava abans (i per què no n'hi havia prou)

- **Franja** (`MegaStripePanel`, `data-stripe-tile`): s'atenuava **la capa del
  dibuix**, `opacity: 0.12`, quan la casa no era de la col·lecció activa.
- **Graella** (`CercadorTextRow.pintaItem`): `opacity: 0.12` sobre el botó
  sencer, que allà només conté el dibuix.
- La **samarreta** no es tocava: la franja horitzontal és **una sola imatge amb
  les catorze samarretes**, i el dibuix hi va a sobre, retallat. Per això les
  inactives només perdien el dibuix.

### 5.3 L'arranjament: el vel

El mecanisme ja existia per a les **samarretes buides**: el full
`/placeholders/cercador/full-clic-area-5.svg` porta **un `path` per samarreta**
(14 en total) amb la classe `tshirt-outline`. S'ha convertit en una eina
compartida, `useVelSamarretes(opacitats, key, color)`:

- els `paths` que no són al mapa **es treuen** (queden transparents),
- la resta es pinten de blanc amb l'opacitat demanada,
- el full es demana **una sola vegada per sessió** (abans es demanava un cop per
  màscara).

A l'apaisat, el vel és una imatge amb la silueta de les cases inactives, amb la
**mateixa caixa i el mateix aspecte que la imatge de la franja**, i va per sota
de la capa dels dibuixos (el dibuix, que també s'atenua, conserva el seu to). A
la vista vertical, el vel es posa per casella dins l'SVG, com les buides.

### 5.4 El resultat, mesurat

| què | valor |
|---|---|
| caixa del vel vs caixa de la franja | **358, 223, 1049 × 112** totes dues |
| `z-index` | 6 (per sobre de la imatge i el tint; per sota dels dibuixos) |
| opacitat | **0,6** (el mateix tractament que la samarreta buida blanca) |

### 5.5 El vel ha d'anar amb el DIBUIX, no amb la casa

El primer intent el vaig penjar de la **casa** (la posició 0..13 de la franja).
És un error, i l'amo el va veure de seguida:

> «El que sí que s'hauria de moure és el vel. Si no, les samarretes que eren
> actives, quan fas scroll, queden actives i les altres atenuades encara que
> vagin corrent els dibuixos.»

Les catorze cases són **fixes** i el que circula és la llista de dibuixos: cada
casa ensenya el dibuix que li toca segons `stripeStripOffset`. Amb el vel penjat
de la casa, en fer scroll quedava a les cases d'abans.

Ara el mapa de cases surt de la **mateixa rotació** que pinta les cases
(`stripeStripOffset` sobre `tiraFranja`), o sigui que el vel i el dibuix de cada
casa sempre són el mateix dibuix.

Mesurat, fent rodar la franja pas a pas: **les cases amb opacitat 1 més les
siluetes del vel sempre sumen 14.**

| estat | cases actives | siluetes al vel | suma |
|---|---|---|---|
| inici | 7 | 7 | 14 ✔ |
| scroll 1 | 7 | 7 | 14 ✔ |
| scroll 2 | 6 | 8 | 14 ✔ |
| scroll 3 | 4 | 10 | 14 ✔ |
| scroll 4 | 2 | 12 | 14 ✔ |
| scroll 5 | 0 | 14 | 14 ✔ |

---

## 6. El Terminator no sortia a la franja

### 6.1 El símptoma

> «A The Human Inside, Terminator, no apareix a la stripe.»

### 6.2 El que NO era

Es va descartar, una per una, totes les sospites raonables:

| sospita | comprovació |
|---|---|
| falta la imatge | hi és: `the_human_inside/black/terminator-b-stripe.webp`, 200, 15.708 bytes, webp |
| el navegador no la descodifica | **sí**: `256 × 236` |
| falta la clau al resolver | hi és: `terminator: 'terminator-b-stripe.webp'` |
| peta en pintar-se | **0 errors de consola** i l'arbre de la graella el té (202 × 186) |

### 6.3 La causa

**THE HUMAN INSIDE és l'única col·lecció que té els dibuixos escrits a mà**, a
`thinDrawings` (`FullWideSlideHeader.jsx`): catorze noms en una llista. La
graella els treu del registre (`dibuixosGraella16x4`) i el Terminator hi és; la
finestra fina i la **tira de la franja** llegeixen la llista a mà, i allà hi
faltava. Per això la franja ensenyava **catorze** dibuixos en comptes de quinze,
i el Terminator no hi sortia mai, ni fent scroll.

### 6.4 L'arranjament

Afegit a la llista, **entre Robocop i The Dalek**, que és l'ordre del registre —
no al final, que hauria canviat l'ordre de tota la tira.

Mesurat: fent rodar la franja, el Terminator hi apareix (al scroll 6 dels 21
estats mostrejats), i els dibuixos diferents vistos passen de **53 a 54**.

### 6.5 Nota per al proper

Aquesta és la **tercera vegada** en aquest projecte que una llista duplicada a mà
causa una peça que falta. La deute de debò és que `thinDrawings` surti del
registre, com la graella. No s'ha fet ara perquè toca l'ordre de la finestra fina
i de la tira sencera, i això és una decisió de l'amo.

---

## 7. Les trampes d'aquesta sessió (per no repetir-les)

Aquestes són les que m'han costat temps de debò, i totes són **errors meus**, no
del projecte:

1. **`stripeStrip` no és el que jo em pensava.** Són **les catorze cases** (una
   llista d'objectes `{src, item, collection, subcollection}`), no l'objecte amb
   `srcs`/`collections`. La llista sencera de dibuixos és **`tiraFranja`**. Vaig
   escriure `stripeStrip.srcs.length` i `stripeStrip.collections` i **vaig
   petar la pàgina**; l'amo va veure el missatge d'error al navegador. Arreglat
   i verificat amb zero errors de consola.
2. **Una mesura dolenta no és una mesura.** El meu guió deia que el vel no hi
   era i que el centratge no quadrava. Les dues coses eren **falses**: llegia una
   propietat que no existeix. Abans de concloure res, cal comprovar que el que es
   llegeix és el que es creu.
3. **Els comptes de la tira no són els de la graella.** THE HUMAN INSIDE té **14**
   dibuixos a la tira (i 15 a la graella) i CUBE en té **10** (i 9 a la graella),
   perquè la tira deixa fora els dibuixos que la seva col·lecció no sap resoldre.
   Els números bons surten de `tiraFranja`, no de comptar a ull.
4. **El vídeo val més que vint mostres.** La cronologia de `pageshow`/`popstate`
   i les mutacions del DOM no em van ensenyar el «Carregant…»; el fotograma de
   8,5 s, sí. I **la marca a `window`** és la que distingeix «recàrrega» de
   «pantalla de càrrega».
5. **Les sondes, al codi, i fora després.** Totes les mesures d'aquesta sessió
   s'han fet amb sondes escrites al codi i **tretes abans de comitejar** (ho
   confirma `grep`). Els guions temporals (`scripts/_tmp-*.mjs`) no es comitegen
   mai.
6. **`find` sobre el punt, no sobre el centre.** El meu guió deia que el dibuix
   del mig de la graella era `Wormhole` quan en realitat era `NX-01`. Buscava el
   **primer** element de la llista que contenia el punt del mig, i la tira està
   pintada **dues vegades** (el bucle infinit): el primer que hi queia era el de
   la segona còpia. Cal mesurar **quin centre és més a prop**, no quin conté el
   punt. És el mateix error de fons que el punt 2: una mesura dolenta que semblava
   bona.

---

## 8. Línies base d'`eslint` (per a la propera sessió)

| fitxer | errors | avisos |
|---|---|---|
| `FullWideSlideHeader.jsx` | 15 | 12 |
| `MegaStripePanel.jsx` | 4 | 11 |
| `MegaslidePagina2.jsx` | 0 | 7 |
| `CercadorTextRow.jsx` | 0 | 6 |
| `LoadingScreen.jsx` | 1 | 5 |
| `App.jsx` | 0 | 6 |

Els números del prompt de reinici (`FullWideSlideHeader` 27, `MegaStripePanel`
16...) comptaven **errors i avisos junts**; aquí van separats perquè és com surt
de `eslint`.

---

## 9. El que queda obert

1. **El producte del marc groc de «Looking For My Darcy».** Al registre
   (`src/data/pdpRegistry.js`) no hi ha cap producte de marc groc sol: hi ha
   `looking-for-my-darcy-pink-yellow-frame`, i el dibuix «Looking For My Darcy
   Yellow Frame» hi apunta. **És cosa de l'amo.**
2. **L'opacitat del vel (0,6).** És un número triat perquè és el mateix
   tractament que la samarreta buida blanca. Si l'amo el vol més fluix o més
   fort, és un sol número.
3. **El `LoadingScreen` de `isNavigating`** (`App.jsx:294`) continua sent
   l'overlay de pantalla sencera. No s'ha tocat perquè allà és una navegació
   declarada, no un Suspense que es dispara sol. Si l'amo el veu com una
   recàrrega, és el mateix arranjament.
4. **La PDP amb `?color=` i `?variant=`** (el punt 2 del prompt del vespre):
   **verificat en aquesta sessió**. `?color=red&variant=white` → vermell + BLANC;
   `?color=navy&variant=color` → navy + COLOR; `?variant=INVENTAT` i
   `?color=INVENTAT` cauen al valor per defecte sense error. Ja funcionava; ara
   està escrit.

---

## 10. Números de referència (1920×946)

- franja: **357,8 · 222,9 · 1049,1 × 112,4**; les catorze cases, 111,8 d'amplada
- finestra de la graella: **455,6..1309,2** (centre 882,4)
- selector B/C/N: 381..445,7 × 76,7..206,1
- graella: pas **34,90625** (mig pas), període **2234,477**
- atenuació: **0,12** a la franja i a la graella · vel de la samarreta **0,6**
- centre de la franja: casa **6,5** (la meitat de catorze)

---

*Cada número d'aquest informe té un origen: una mesura feta en aquesta sessió,
amb el guió o la sonda que el va produir. Els que no en tenien, no hi són.*
