# INFORME — la pàgina 2 del megaslide neix a la mida bona (graella i selector)

**Data:** 25/09/2026 (nit) · **Branca:** `main` · **Commits:** `cfb635e`, `97a3656`, `3e24b43`

Cinquena i sisena iteració del bucle d'estabilització de la pàgina 2. Són **dos
problemes**, tots dos de la mateixa família (una mesura que arriba tard a qui
l'ha de fer servir), amb la causa mesurada de cadascun.

---

## 1. Estat de sortida (mesurat després dels dos commits)

| comprovació | resultat |
|---|---|
| `npx vitest run` | **514 proves, 43 fitxers, totes passen** |
| `npx vite build` | **OK** |
| `npm run compara-vistes` | **OK** («vertical i horitzontal donen les mateixes mides i alineacions») |
| `node scripts/mesura-formats.mjs` | **0 i 0** |
| `npx eslint` (fitxers tocats) | **0 errors, 13 avisos: els mateixos que a `HEAD`** |
| errors de consola a l'obertura | **0** |
| clics de les 14 samarretes de la franja | **10/10 casos comparables correctes** (les 4 excepcions són les del registre de rutes: `3cube-p0`, `iron-kong`, `ironman-68` i el `nx-01` de color) |
| botó d'enrere després d'una PDP | franja oberta, 14 cases, `?active=first-contact`, 0 errors |
| canvi de col·lecció amb el megaslide obert | res no es mou (selector 36,63 / retall 95,2 / cella 44,6333 abans i després) |
| redimensionar amb el megaslide obert | la geometria s'assenta de seguida i no deriva (1700×900: 32,45 / 84,27 / 39,5 als 1,5 s i als 2,1 s) |

Cap `push` fet: ho ha de dir l'amo (regla de la casa).

---

## 2. Problema 1 — la graella naixia un 20 % petita

Obrint el megaslide des de zero (1920×946):

| moment | retall de la graella | cella |
|---|---|---|
| primer fotograma pintat | 71,53 px | 35,7656 px |
| ~100 ms després | 95,2 px | 44,6333 px |

### La causa

La sonda dins de `CercadorTextRow` (temporal, retirada) va donar les entrades
exactes de les dues mesures:

```
t= 2898  ample=864  dalt=119,00  sostre=216,38  -> dibuix=23,8438  gapV=0
t= 3005  ample=854  dalt= 52,33  sostre=196,86  -> dibuix=29,7556  gapV=2,9756
```

`midesGraellaCompacta` rep `sostre − daltGraella − 2` com a espai disponible:
**97,38 px** a la primera i **144,53 px** a la segona. Amb 97,38 px les quatre
files no hi caben i la branca d'alçada encongeix el dibuix
(`97,38 / 119,02 = 0,8013`).

Per què la primera mesura veu 47 px menys d'espai: el bucle d'alineació de la
pàgina 2 (`alignTopRowToPage1`) mou la filera del cercador amb `top`, i **al
muntatge encara val 0** (a 1920 el valor bo és −66,67). Els efectes de *layout*
dels fills van **abans** que els del pare, o sigui que la graella mesurava amb la
filera encara a baix. El `ResizeObserver` no ho salvava perquè **moure amb `top`
no canvia cap mida** (només les mides disparen el RO).

### La correcció (`cfb635e`)

El desplaçament d'alineació passa a ser una **dependència de la mesura** de la
graella (`CercadorTextRow`), i `MegaslidePagina2` li passa
(`alineacioY={topVisualAlignmentY}`). Quan el pare aplica el desplaçament, la
graella es torna a mesurar **dins el mateix commit**, abans de pintar.

Mides **distintes pintades** del primer fotograma al definitiu, obrint des de
zero:

| finestra | abans | després |
|---|---|---|
| 1920×946 | 2 (71,53 → 95,2) | **1** (95,2) |
| 1680×900 | 2 (60,52 → 83,27) | **1** (83,27) |
| 1440×800 | 2 (49,52 → 71,25) | **1** (71,25) |
| 1366×768 | 1 | **1** |
| 1280×720 | 1 | **1** |
| 2560×1306 | 2 (100,86 → 127,2) | **1** (127,2) |

---

## 3. Problema 2 — el selector s'ajustava 11 px amb el panell ja obrint-se

Amb la graella ja ben mesurada, la pastilla Blanc/Color/Negre encara es movia
després del primer fotograma pintat: a 1920, 47,8 → 36,63 px; a 1440, 38,72 →
27,49; a 1366, 29,8 → 8,54 (21,26 px). El moment del salt era la passada de
180 ms del bucle, amb el panell ja mig obert (opacitat alta).

### La causa (dues coses, totes dues mesurades)

1. **La mida de la graella no arribava al bucle que centra el selector.** El
   centratge depèn de l'alçada de la filera, i l'alçada de la filera és la de la
   graella. La passada del bucle llegia el DOM d'abans que la mida nova de la
   graella hi fos, i centrava amb l'alçada vella. Traça del bucle a 1920
   (alcada de la filera a cada passada): **127,45 → 105,39 → 123,45 → 129,06**;
   les dues primeres són la mida de reserva i la transitòria.
2. **La fórmula del centratge sumava el desplaçament d'alineació pendent només
   al selector** (`s.top + deltaAlign`), quan `topVisualAlignmentY` mou **totes
   dues** peces (el contenidor de la filera i el selector). El que es compara és
   la distància entre els dos centres, o sigui que el desplaçament pendent no hi
   ha de sortir. Amb ell a dins, el centratge arrossegava l'error de l'alineació
   i calien passades de més: a 1366×768 la passada de 180 ms encara corregia
   **21,27 px**, que eren exactament l'alineació que acabava d'aplicar la passada
   anterior.

### La correcció (`97a3656`)

- `CercadorTextRow` avisa el pare de cada canvi de mida de la graella
  (`onMides`), i `MegaslidePagina2` el té com a dependència del bucle: la passada
  nova ja mesura el DOM amb la mida bona.
- El centratge passa a ser `centreFilera − centreSelector` (sense el terme
  pendent).

Mesurat obrint des de zero (composicions distintes pintades, filera + selector +
franja):

| finestra | abans | després |
|---|---|---|
| 1920×946 | 2 (selector 47,8 → 36,63) | **1** (36,63) |
| 1440×800 | 2 (38,72 → 27,49) | **1** (27,49) |
| 1366×768 | 2 (29,8 → 8,54) | **1** (8,53) |
| 1280×720 | 1 (ja era estable) | **1** |
| 1024×768 (tauleta) | 1 (ja era estable) | **1** |
| 768×1024 (tauleta) | 1 (ja era estable) | **1** |

Els repassos de 180 i 340 ms es queden com són, però **ara mesuren 0** (ja no hi
ha res a corregir): són la xarxa de seguretat si una font o una imatge arriben
tard.

---

## 4. Els passos verticals, mesurats (l'amo va preguntar per què «no poden coincidir»)

La frase «el pas de fila de la graella (47,59) i el de la cel·la del selector
(43,13) no poden coincidir» era **dolenta**. Les xifres de debò, mesurades a
1920×946 i a 1440×800:

| què | 1920×946 | 1440×800 |
|---|---|---|
| cel·la del selector Blanc/Color/Negre (`alçada / 3`) | 43,13 | 32,27 |
| separació **pintada** entre les dues files de dibuixos | 43,12 | 32,27 |
| `alcadaFila` **declarada** (peça 1,5× + `gapV`) = meitat del retall | 47,60 | 35,63 |
| retall (la finestra) | 95,20 | 71,25 |
| desviament de cada fila respecte de la seva cel·la | 0,01 i 0,01 px | 0,00 i 0,00 px |

O sigui:

1. **La separació de debò entre les dues files és exactament el pas de la cel·la
   del selector** (43,12 contra 43,13 a 1920; 32,27 contra 32,27 a 1440), i cada
   fila queda centrada a la seva cel·la amb 0,01 px de marge. Allà no hi ha res a
   decidir: qui ho decideix és el bucle mesurat (`desnivellsLinies`), que centra
   cada fila a la cel·la BLANC i a la COLOR.
2. **`alcadaFila` (47,60) és un número que no fa servir ningú.** Va néixer com
   «dibuix de la graella + separació de la graella» (29,76 + 2,98 = 32,73... i la
   peça del carrusel fa 1,5 cops: 44,63 + 2,98 = 47,60). Avui només serveix per
   dimensionar la finestra: `2 × 47,60 = 95,20`. La diferència de 4,48 px és
   això, declarat contra pintat, **no** dues mides que es contradiguin.

### El que sí que és real (i que aquesta mesura va destapar)

Com que la finestra es declara (95,20) i les files es col·loquen mesurades, la
vora de dalt de la finestra pot quedar per sota del capdamunt de la fila de
dalt. Mesurat amb la tinta de cada fitxer (quin píxel natural té tinta a dalt i a
baix):

| | fila de dalt | fila de baix |
|---|---|---|
| **abans** (`e37c6ff`) | 25,66 → 70,28 (sobrava espai) | 68,80 → **113,42** dins una finestra de 95,2 → **5 px de tinta tallats a baix** |
| **ara** | 0,50 → 45,13 (dins, amb 0,5 px de marge) | 43,63 → 88,25 (dins, amb 8,3 px de marge) |

És a dir: la correcció del §2 no només va fer néixer la graella a la mida bona,
sinó que va **treure un tall de 5 px de tinta a la fila de baix** que no estava
mesurat (el bucle de centratge arrossegava les dues files cap avall perquè
mesurava amb l'alçada de graella equivocada).

## 4 bis. El bucle de les dues files comptava la mateixa correcció dues vegades (25/09/2026, nit)

Perseguint aquell 0,89 px va sortir un peix molt més gros: **3 de 6 obertures en
fred acabaven amb les dues files 13,6 i 15,9 px per sota de les seves cel·les**
(mesurat a 1920, amb context nou a cada obertura; les bones donaven 0,01 px).

### La causa, mesurada

El bucle de `desnivellsLinies` sumava el delta al `ref`, i el `ref` s'escrivia
**dins del mateix bucle**. Quan el fil principal va ocupat (obertura en fred), els
temporitzadors de 250 i 400 ms expiren junts i el navegador els executa a la
**mateixa tasca**: la segona passada mesura abans que React hagi pintat la
primera, troba el mateix delta i el torna a sumar. Traça de dues obertures (el
`ref` i el valor pintat a cada passada):

```
(bona)  t=1619 ref=0,00/0,00   t=2091 ref=14,50/21,30   t=2214 -> 0,90/5,37   (0,01 px de desviament)
(dolenta) t=1917 ref=0,00/0,00  t=2819 ref=14,50/21,30  t=2823 ref=14,50/21,30 -> -12,70/-10,55
```

Els dos passos de la dolenta són a 4 ms l'un de l'altre: són els dos
temporitzadors a la mateixa tasca.

### La correcció (`3e24b43`)

1. El `ref` passa a ser **el valor pintat** (s'actualitza després de pintar, amb
   un `useEffect`), i l'objectiu es calcula des d'ell: dues passades amb la
   mateixa mesura donen el mateix objectiu i la correcció és **idempotent**.
2. La primera passada va en un **`rAF`** i no a l'efecte de layout: aquell efecte
   és d'un fill i corre **abans** que el bucle que centra el selector amb la
   filera, o sigui que mesurava amb el selector 13,6 px més amunt i hi aplicava
   una correcció de +14,5 px que després havia de desfer (i que aixecava la fila
   de dalt 14,5 px, amb la tinta tallada, gairebé un segon en una obertura en
   fred). El `rAF` arriba abans del primer pintat però **després** dels efectes
   de layout.
3. La **caixa del retall** conté la fila de dalt sencera: puja el que la fila
   s'enfila (`primera`) més la tolerància del bucle (0,5 px) i la tira baixa el
   mateix, de manera que les peces no es mouen gens. La caixa va **fora del
   flux**: amb marges, el marge de dalt del fill es col·lapsa amb el del pare i
   les peces baixaven 13 px amb la fila de baix tallada (mesurat).

### Com queda, mesurat

| comprovació | abans | ara |
|---|---|---|
| obertures en fred amb les files desalineades (>1 px) | **3 de 6** | **0 de 6** |
| desviament de cada fila respecte de la seva cel·la, al primer fotograma pintat (8 finestres: 1920, 1680, 1440, 1366, 1280, 2560, 1024×768, 768×1024) | — | **0,00 a 0,02 px, i un sol estat pintat** |
| tinta tallada a la fila de dalt (1920) | 0,89 px (i 14,5 px transitòriament) | **0,00 px, amb 0,5 px de marge** |
| tinta tallada a la fila de baix | 5 px (abans del §2) | **0,00 px, amb 8,3 px de marge** |
| canvi de col·lecció amb el megaslide obert | — | res no es mou |
| `compara-vistes`, `vitest` (514), `vite build`, `mesura-formats` (0 i 0) | — | **tot OK** |

- **El bucle de centratge continua sent un bucle** (dues fórmules que es miren
  l'una a l'altra, amb repassos a 180 i 340 ms). S'ha provat de substituir-lo per
  una convergència síncrona dins del primer `rAF` (`flushSync`) i **s'ha
  descartat**: l'aplicació fa servir transicions de ruta (`startTransition` a
  `App.jsx`), i `flushSync` llança si React està renderitzant en aquell moment.
  El que s'ha fet és treure-li feina (ara convergeix a les passades de layout) i
  deixar els repassos com a xarxa.
- **La fórmula del centratge ja s'havia provat abans** de tenir l'avís de la
  mida, i tot sola **no** arreglava res: canviava el signe del salt (24,81 →
  36,63 en comptes de 47,8 → 36,63). Les dues peces han d'anar juntes.

---

## 5. Com es torna a comprovar

```
node scripts/_tmp-obrir-zero2.mjs      # mides pintades del primer fotograma al definitiu (6 finestres)
node scripts/_tmp-estabilitat-p2.mjs   # posicions relatives de filera, selector i franja
node scripts/_tmp-canvis-p2.mjs        # canvi de colleccio, redimensionar i tauletes
node scripts/_tmp-retall-illes.mjs     # on cauen les dues files dins del retall i quina tinta es talla
node scripts/_tmp-naixement-p2.mjs     # el primer fotograma PINTAT ja te les files a lloc? (8 finestres)
node scripts/_tmp-bimodal.mjs          # 6 obertures en fred: el bucle cau sempre al mateix lloc?
```

Els tres són temporals i **no es comitegen**.
