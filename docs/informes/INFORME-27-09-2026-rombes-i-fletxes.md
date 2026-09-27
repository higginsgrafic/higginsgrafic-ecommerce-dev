# INFORME — els rombes del vel i les fletxes de la p1 (27/09/2026)

**Estat:** les dues feines obertes, fetes, mesurades, comitejades i pujades
(`main`). Arbre net, bateria sencera OK i `_tmp-ancoratge.mjs` diu **TOT AL SEU
LLOC** abans i despres de cada canvi.

**Commits d'aquesta sessio** (tots amb `git push`):

| commit | què |
|---|---|
| `e2d30c3` | Els rombes del vel: el blanc es composava dos cops al solapament de les siluetes |
| `dc2973a` | Les fletxes de la p1: el bloc de la dreta mou la graella (i les del carrusel fora) |

---

## 1. FEINA 1 — Els rombes del vel

### 1.1 Què es veu, amb la xifra

A la franja, a la **cantonada de la samarreta** (l'espatlla, entre el coll i la
màniga) hi sortia un **rombe** més clar que la resta de la samarreta. La forma
del rombe és exactament la **intersecció de dues siluetes veïnes**.

Mesurat a 1920×946, captura a 3x de la franja, el píxel del solapament de les
cases 0 i 1 (el color de samarreta triat, el quart de la tira):

| què | abans | després |
|---|---|---|
| el rombe (solapament) | **215** | **155** |
| l'espatlla de la mateixa samarreta (fora del solapament) | 155 | 155 |
| el cos de la mateixa samarreta | 136 | 136 |
| amb la samarreta blanca: el rombe | 253 | **251** |
| amb la samarreta blanca: l'espatlla | 251 | 251 |

O sigui: amb la samarreta **blanca** el rombe feia **2 nivells** (gairebé
invisible) i amb un **color triat** en feia **60** (una taca blanca cantelluda).
`_tmp-cantonada-abans.png` i `_tmp-cantonada-despres.png` (el mateix clip, 4x)
ho ensenyen: el diamant hi és i després no hi és.

### 1.2 La causa exacta

**El blanc es composava dos cops.** El cos de cada casa fa **305,56 unitats** i
el pas entre cases només **196,9**: la màniga d'una casa arriba a la casa del
costat, amb **108,66 unitats** de solapament. El vel es pintava amb una
`fill-opacity` a **cada camí** (`generaVelDataUrl`), i — encara que la forma i la
posició fossin perfectes — a la zona de solapament el blanc s'aplicava dues
vegades: `0,6 + 0,6` sobre el que ja hi havia = **0,84** en comptes de `0,6`.
Sobre un color fosc, això són 60 nivells de diferència.

**No és cap desplaçament de cap silueta, i no és cap problema del `maskSize`.**

### 1.3 Les tres caixes de la tinta i les dues siluetes (el que demanava la recepta)

La tinta s'ha mesurat per **lluminositat** (el fons de la imatge de la franja és
blanc 255 i la samarreta blanca fa 246), amb una finestra de 306 unitats i el
llindar a 253, i s'ha comprovat mirant la captura retallada (`_tmp-tinta-a.png`,
`_tmp-tinta-gap.png`). Tot en unitats de la imatge (2866×307), dins la casella de
la casa 0 (0…305,56 × 0,8…306,83):

| forma | caixa (x, y, ample, alt) | on es fa servir |
|---|---|---|
| **la TINTA de la casa 0** (mesurada) | **1 … 305,6 · 0 … 307** | la imatge de la franja |
| el VEL (`VEL_SAMARETA_CAIXA` escalat a la casella) | 0 · 0,8 · 305,56 · 306,03 | la màscara del vel |
| el RETALL dels dibuixos (`VECTOR_FRANJA_SAMARRETA`) | 0 · **14,2** · 303,2 · 303,6 | el `clipPath` dels dibuixos |

**La silueta desplaçada és la del RETALL dels dibuixos, no la del vel**: està
13,4 unitats (4,8 px a 1920) mes avall i 2,4 unitats mes estreta que la tinta. El
vel, en canvi, cau sobre la tinta dins d'1 unitat.

**DECISIÓ:** no s'ha desplaçat cap silueta. Si s'hagués desplaçat el vel (que és
el que proposava la recepta), el vel hauria deixat de cobrir la tinta i el rombe
hauria empitjorat: la que està desplaçada és la del retall. I aquell retall **no
s'aplica enlloc a l'escriptori** (vegeu 1.5).

### 1.4 Què s'ha canviat

Totes les siluetes **del mateix gruix** van en **un sol grup amb `opacity`**
(opacitat de GRUP: el grup es composa sencer una vegada i el solapament de dins
no compta), en comptes d'una `fill-opacity` a cada camí. El `mask` de sempre va
al grup. Als quatre llocs on es pintaven siluetes:

| on | què |
|---|---|
| `generaVelDataUrl` (`MegaStripePanel.jsx`) | el vel de les inactives **i** la màscara de les buides de la vista apaïsada |
| `MegaStripePanel.jsx`, vista vertical | les dues llistes de `path` (buides i inactives) |
| `generaMascaraBuidesDataUrl` (`MegaStripePanelP1.jsx`) | la màscara del contenidor de la p1, per **tirades d'igual opacitat** per no canviar l'ordre de pintat |

El `mask` de la p2 (`idMascara`) no s'ha tocat: segueix dient, píxel a píxel,
quina samarreta es veu.

### 1.5 El que s'ha provat i NO ha sortit (les trampes)

1. **El `maskSize: '103% 100%'` del contenidor** (el segon camí de la recepta).
   Mesurat: treure la màscara del contenidor només canvia **1 px de les vores**
   (una franja de 1 px al llarg del contorn de cada samarreta, `_tmp-mascara-diff.png`);
   no fa cap rombe. **No s'ha tocat.**
2. **El retall dels dibuixos** (`VECTOR_FRANJA_SAMARRETA_01`). El `clipPath` que
   la capa de dibuixos referencia **no existeix a l'escriptori** (es declara
   només a la branca `isPortraitTablet`; comprovat: `existeix: false`). Tot i
   això, **els dibuixos no surten de la samarreta**: dels 56.586 píxels de tinta
   de dibuix de la franja de la p2, **22** cauen fora de la tinta de la
   samarreta (0,04 %, i son vores antialiased). A la p1, **0 de 835.191**. O
   sigui que afegir-hi el retall no arreglaria cap rombe i, com que està 13,4
   unitats avall, **tallaria** els dibuixos a les espatlles. **No s'ha afegit.**
3. **Agrupar amb `fill-opacity` al grup** en comptes d'`opacity`: **no funciona**.
   `fill-opacity` és una propietat **heretada** en SVG: posar-la al grup
   l'hereten els camins i cada camí es torna a composar sol. Amb `opacity`
   (opacitat de grup) sí que es composa una sola vegada. Comprovat amb les dues
   variants al navegador (253 → 254 amb `fill-opacity`; 253 → **251** amb
   `opacity`).
4. **Els rombes a la p1.** La p1 **no té vel de silueta per casa**: el seu únic
   vel és la màscara del contenidor, i allà **totes catorze siluetes van a
   opacitat 1** (mesurat: `fill-opacity="1"` × 14), o sigui que no pot comptar
   doble. Comprovat amb el ratolí i amb el color triat: la p1 no canvia gens
   (0 píxels de diferència entre les captures d'abans i de després del canvi).
   El rombe que l'amo hi veu és el mateix efecte de la p2 (el seu panell), o bé
   el rombe blanc que **ja és a la imatge** (el buit en V entre dues mànigues
   veïnes, que hi és a la tinta original).

### 1.6 Les vistes de tauleta

| vista | vel | després del canvi |
|---|---|---|
| escriptori 1920 | imatge del vel: **1 grup amb `opacity`**, 0 `fill-opacity` | rombe fora (215→155) |
| tauleta vertical 768×1024 | imatge del vel: **1 grup amb `opacity`** | igual |
| tauleta apaïsada 1024×768 | imatge del vel: **1 grup amb `opacity`** | igual |
| p1 (les tres) | màscara del contenidor: **1 grup amb `opacity`** | sense canvi visible (ja era uniforme) |

*(A la vista vertical el vel de les inactives va amb les àrees de clic de cada
casella, que també es trepitgen: el canvi hi és aplicat i pel mateix motiu.)*

---

## 2. FEINA 2 — Les fletxes de la p1

### 2.1 La causa

El bloc de la dreta portava un **comptador de passos propi al pare**
(`pageStart` → `desplacamentPassos`) i la graella el muntava al **cos del
render**: cada cop que canviava, allò esborrava la base del carrusel i la
compensava al gest perquè la posició no fes cap salt. O sigui que **el pas es
cancel·lava a si mateix**: la transformació del carrusel es quedava sempre a
−1018,5 (el pare arribava a veure `passos: 1, base: 22,5`).

No era cap regressió: era una peça que **no s'havia acabat de connectar mai**.

### 2.2 Què s'ha fet (un sol mecanisme, un sol estat)

- `CercadorDibuixosGraella` **publica la seva funció de pas** (`onStepper`, amb
  `useCallback` sobre `setDesplacGest`: el mateix que les fletxes del carrusel i
  la rodeta). Fora el `desplacamentPassos` i el seu muntatge al render.
- `GraellaDuesFileresPagina1` la passa i **amaga les fletxes del carrusel**
  (`senseFletxes`), que eren les del disseny vell.
- `MegaStripePanelP1` desa la funció (`setStepperP1`) i **el bloc la crida**:
  `onPrev`/`onNext` → `stepperP1?.(−1|1)`.

### 2.3 Xifres (1920×946)

| què | abans | després |
|---|---|---|
| fletxes a la p1 | **4** (2 a x1349 + 2 a x1414) | **2**, totes a **x1414** (el bloc) |
| clic a la fletxa dreta | −1018,5 → **−1018,5** (no es mou) | −1018,5 → **−1041,0** → **−1163,5** (22,5 per clic = `unPas`) |
| rodeta (120) sobre la graella | −1018,5 → −1138,5 | **igual** (continua funcionant) |
| clic a un dibuix | canvia la col·lecció i el centratge mou el carrusel | **igual** (−1018,5 → −298,5) |
| p2: fletxa del carrusel | mou la **franja** (dj-vader → pont-del-diable) | **igual** |

---

## 3. El que queda obert

1. **El rombe de la imatge.** El buit en V entre les mànigues de dues
   samarretes veïnes **és a la tinta original** (`full-color-stripe-5.webp`,
   `full-white-stripe.webp`). Amb la samarreta blanca no es veu; amb un color
   triat es veu com un rombe blanc. Si l'amo el vol fora, és feina d'imatge (o
   de retallar la tinta amb la silueta), no del vel.
2. **El retall dels dibuixos no existeix a l'escriptori** (el `clipPath` es
   declara només a la branca vertical). No fa cap mal mesurable (22 píxels de
   56.586) i el camí que hi ha està desplaçat 13,4 unitats, o sigui que
   **aplicar-lo tal com és tallaria els dibuixos**. Si algun dia es vol, primer
   s'ha de refer el camí en el sistema de coordenades de la casella.
3. **La p1 no té vel de les samarretes que no són de la col·lecció activa**
   (el panell P1 no implementa `indicesSamarretesInactives`). A la p1 tots els
   dibuixos es veuen plens. No és cap rombe, però és una diferència amb la p2
   que l'amo pot voler.

---

## 4. Els números de referència (1920×946, carril x381..1524)

| què | p1 | p2 |
|---|---|---|
| graella / carrusel | x381..1404, peça 44,63 | x450,4..1383,8, peça 44,63 |
| selector | 109,4×109,4 a x1414 | 59,5×119 a x381 |
| bloc de fletxes | 109,4×109,4 a x1414 (**les úniques**) | 59,5×119 a x1324,3 |
| franja | x358 y242,1 1048,8×112,3 | x358 y241,5 1048,8×112,3 |

**Bateria final (arbre net):** `npx vitest run` **581 proves (45 fitxers)** OK,
`npx eslint` als fitxers tocats amb els comptes de `HEAD` (comprovat amb
`git stash`: `MegaStripePanel.jsx` 4/11, `MegaStripePanelP1.jsx` 3/0,
`CercadorTextRow.jsx` 0/9 —la taula del prompt deia 0/6 i la línia base real
d'avui és 0/9—, `GraellaDuesFileresPagina1.jsx` net), `npx vite build` OK,
`npm run compara-vistes` **OK**, `node scripts/mesura-formats.mjs` **0 i 0**,
`node scripts/_tmp-errors2.mjs` **cap error**, `node scripts/_tmp-ancoratge.mjs`
**TOT AL SEU LLOC**.

---

## 5. Què li toca a l'amo

1. **F5** a l'overlay del 3003 i mirar la **p2**: triar un **color** de samarreta
   i mirar l'espatlla d'una samarreta velada (les que no són de la col·lecció
   activa). El rombe hi era i ja no hi és.
2. Mirar la **p1**: ara hi ha **dues** fletxes (les del bloc, a la vora dreta) i
   mouen la graella; la rodeta i els clics segueixen igual.
3. **Decidir** si el punt 1 del que queda obert (el buit en V que és a la
   imatge de la franja, entre dues mànigues veïnes) li molesta: això és feina
   d'imatge.
4. Comprovat que **el full nou del 19:30 ja funciona** (les seves `id="_1".."_14"`
   sense `class="tshirt-outline"`): el vel i les àrees de clic el llegeixen
   igual.

---

## 6. Segona tongada (27/09/2026, vespre): encara hi havia rombes

L'amo ho va dir mirant la franja de la p2 amb **CUBE** actiu i el color
**light-blue**: «Encara queden rombes». I tenia rao: el canvi de la secció 1
n'havia tret un (el blanc composat dos cops) pero en quedava un altre.

### 6.1 La causa que quedava: la silueta escalada a la casella

El vel feia servir **només el camí de la casa 0** (la samarreta sencera) i
l'**escalava a la casella** de cada casa (`rectsMascara`). Pero el full de
siluetes ja porta les catorze siluetes al seu lloc, i no són totes iguals:

| casa | forma | amplada | fitxer de l'amo |
|---|---|---|---|
| 0 | la samarreta sencera (dues manigues) | 305,56 | `clic-area-1.svg` |
| 1 a 13 | la forma estreta (cos + maniga dreta) | 241,71 | `clic-area-2-14.svg` |

La casella fa **305,56** unitats amb un pas de **196,9**: la silueta de la casa 0
escalada a la casella de la casa *i* queia **63,9 unitats a l'esquerra** de la
silueta de debò. Allà el vel cobria el **cos de la casa velada del costat** i,
com que la màscara hi pintava la silueta **negra** de la casa activa (també
escalada a la casella), hi deixava el **rombe sense vel**. El retall al cos
(`finestraCosVel`) era el pedaç que el tapava a mitges.

**Mesurat** (1920×946, CUBE + light-blue, captura a 3x, la filera de les
espatlles, en unitats de la imatge): al rombe el vel **no hi era** (189 i 187 de
lluminositat, com sense vel) mentre que a la resta de la samarreta velada hi era
(**228**). Després del canvi: **228 a tot arreu** de les cases velades.

### 6.2 Què s'ha fet

A la franja **apaïsada** (una filera) es fan servir les catorze siluetes **tal
com són al full**: cap escalat, cap casella i cap retall al cos. Cada silueta és
la tinta que es veu de la seva casa. El camí de la casa 0 escalat a la casella es
queda **només a la vista vertical**, on la imatge és de dues fileres i les
caselles són una graella de 7×2.

**Prova automàtica** (`scripts/_tmp-vel-check.mjs`, temporal): amb el full com a
referència de la tinta de cada casa i el vel pintat sobre negre, es mira casa per
casa quanta de la **seva** silueta (aïllada) queda coberta pel vel.

| col·lecció activa | cases velades cobertes | cases actives tacades |
|---|---|---|
| `first_contact` | 0,1,2,10-13 → **100 %** | 3-9 → **0 %** |
| `cube` | 0,1,12,13 → **100 %** | 2-11 → **0 %** |
| `miscellania` | 0-3,9-13 → **100 %** | 4-8 → **0 %** |
| `the_human_inside` | (cap) | 0-13 → **0 %** |
| `austen` | (cap) | 0-13 → **0 %** |

Cap excepció a les cinc col·leccions: **el vel cobreix exactament les cases que
toquen i cap altra**.

### 6.3 El full nou de l'amo, i per què els `clic-area` no ocupen la mateixa zona

L'amo va desar el full nou (`full-clic-area-5.svg`, 19:30) amb els camins
`id="_1".."_14"` i `affinity:id="1".."14"`, `style="fill:rgb(0,145,255)"` i
**sense** `class="tshirt-outline"`. Comprovat que la geometria és la mateixa que
la del full anterior (97-99 % de la tinta de cada casa dins de la seva silueta i
99,3-99,9 % de la silueta sobre la seva tinta).

**Els `clic-area-1.svg` i `clic-area-2-14.svg` no ocupen la mateixa zona perquè
cada fitxer porta el SEU `viewBox`**: el primer `0 0 306 307` i el segon
`0 0 242 307`, i tots dos es pinten amb `width="100%" height="100%"`. O sigui que
cada un s'escala a la seva caixa i la forma estreta sembla més gran i desplaçada
del que és. La referència de debò és **el full** (`full-clic-area-5.svg`,
`viewBox 0 0 2866 307`, la mateixa mida que la imatge de la franja): allà les
dues formes hi són a mida i a lloc, i és el que fa servir el codi.

Sense la classe, el full nou deixava **el vel sense siluetes** (`vels []` a la
sonda) i les **àrees de clic es pintaven de blau** (`rgb(0,145,255)`) damunt de
tota la franja. Arreglat tolerant les dues maneres de dir-ho:
`caminsSiluetes()` (`siluetesSamarreta.js`), la classe que s'hi afegeix a les
àrees de clic si el full no la porta (14 clics correctes de 14) i la mida del
`viewBox` als atributs del `data:` URL del vel.

### 6.4 La p1, decidit per l'amo

> «La p1 no té vel, ja que quan cliques un dibuix s'omplen totes les samarretes
> amb aquella imatge. No queden samarretes buides a les quals aplicar cap vel.»

**DECISIÓ (de l'amo):** la p1 **no** ha de tenir el vel de les col·leccions
inactives. Queda tancat el punt 3 del «que queda obert» de la primera tongada.

### 6.5 El que queda obert (actualitzat)

1. **El buit en V entre dues mànigues veïnes és a la imatge** (la tinta
   original). Amb la samarreta blanca no es veu; amb un color triat es veu com un
   rombe blanc. Si l'amo el vol fora, és feina d'imatge.
2. El retall dels dibuixos (`VECTOR_FRANJA_SAMARRETA_01`) segueix sense existir a
   l'escriptori; no fa cap mal mesurable (22 píxels de 56.586).

### 6.6 Les xifres de la segona tongada

| què | abans | després |
|---|---|---|
| el rombe (CUBE + light-blue, espatlla, 3x) | **189/187** (sense vel) contra 228 a la resta | **228** a tot arreu |
| el rombe (1920, color triat, píxel del solapament) | 215 contra 136 al cos | **155** = el cos |
| el rombe (1920, samarreta blanca) | 253 contra 251 | 251 |
| la franja de blau (`rgb(0,145,255)`) damunt de tot | tota la franja | **cap** |
| els 14 clics de la franja | 14/14 | **14/14** |
| les fletxes de la p1 | 4 (2 inútils) | **2**, mouen la graella |

**Bateria de la segona tongada:** 581 proves (45 fitxers), eslint amb els
comptes de `HEAD`, `vite build` OK, `compara-vistes` OK, `mesura-formats` 0 i 0,
`_tmp-errors2` cap error, `_tmp-ancoratge` TOT AL SEU LLOC, `_tmp-21` i la vista
vertical (768×1024 i 1024×768) comprovades amb captura.

**Commits:** `722d62e` (els fulls nous de l'amo) i `9b51f31` (el vel amb la
silueta de cada casa).
