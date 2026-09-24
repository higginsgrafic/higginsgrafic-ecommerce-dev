# L'estructura general de dispositiu — paper per decidir

**Data:** 2026-09-24 · **Estat:** proposta per decidir. **Cap línia de codi tocada.**
**Ve de:** `PLA-arquitectura-nova.md` (§2, §2bis i §2ter), `PLA-versio-tauleta-megaslide.md`,
`MAPA-caselles-tauleta.md` i `MAPA-calibratges.md`.

---

## 0. Què hi ha i què falta

**El que ja hi ha, i està bé:** el diagnòstic («són dos projectes en un»: el header és
una segona aplicació amb el seu llenç), la fonamenta de `foundation.css`
(`--contingut-max`, `--u`, `--esp-1..4`, `.hg-marc`, `.hg-seccio`), la unitat, i el
mapa de caselles de la tauleta.

**El que falta, i és el que aquest paper ordena.** Avui la disposició d'un aparell la
decideixen **quatre coses que no parlen entre elles**:

| # | la contradicció | on es veu |
|---|---|---|
| 1 | **dues fronteres de mòbil**: 600 a `layoutModel`/`useDeviceLayout`, 768 a `useIsMobile` i al `md:` | i una franja (600–767 en apaïsat) que **no té classe** |
| 2 | **dos regles**: `--contingut-max` (CSS, tot el lloc) i `--hg-mega-w` (JS, el megaslide) | el carril de la pàgina nova penja del segon |
| 3 | **dues escales escrites**: el pla deia `finestra/1920`; el que es va implementar és `carril/1350` | `PLA-arquitectura-nova.md` §2ter ja no és cert |
| 4 | **la densitat, resolta a mà peça per peça** (la pauta, la taula, la franja) | i per això 57 px i 137 px conviuen al mateix panell |

**L'estructura general són quatre peces**, i en aquest ordre: **una classificació**,
**una mesura**, **una densitat per classe** i **una escala**. Cada peça té un sol lloc
on viu.

---

## 1. Peça 1 — Una classificació: la matriu

### 1.1 La regla

Quatre línies, avaluades en ordre, que **parteixen totes les finestres possibles** en
quatre classes (ni forats ni solapaments):

```
mòbil             =  ample < 600   ||   (ample < 768 && alçada < ample)
tauleta vertical  =  alçada > ample  &&  ample ≤ 1024
tauleta apaïssada =  alçada < ample  &&  ample ≤ 1366  &&  alçada ≤ 1100
escriptori        =  la resta
```

La clau és la segona meitat de la primera línia: **un telèfon girat no es reconeix per
l'amplada, es reconeix perquè és més ample que alt i encara no arriba a 768**. És la
franja que avui no té classe.

### 1.2 La matriu

| amplada ↓ / alçada → | **alçada < amplada** (apaïsat) | **alçada > amplada** (vertical) |
|---|---|---|
| **< 600** | mòbil | mòbil |
| **600–767** | **mòbil** (el telèfon girat) | tauleta vertical |
| **768–1024** | tauleta apaïssada | tauleta vertical |
| **1025–1366** | tauleta apaïssada (si alçada ≤ 1100) | escriptori |
| **≥ 1367** | escriptori | escriptori |

Dues notes de la matriu: **l'alçada de 1100** només actua a la banda 1025–1366, i és el
que separa una tauleta apaïssada d'un monitor; i una finestra **exactament quadrada**
(que no es dona) cau a escriptori.

### 1.3 Els 48 formats, un per un

Mesurat amb les finestres reals dels 48 formats (`scripts/mesura-formats.mjs`), amb la
classe que els toca **avui** i amb la que els toca **amb la matriu**:

| format | finestra | avui | matriu |
|---|---|---|---|
| Android 16:9 360 | 360×508 | mòbil | mòbil |
| Android 20:9 360 | 360×648 | mòbil | mòbil |
| iPhone SE/8 | 375×535 | mòbil | mòbil |
| Android 384 | 384×700 | mòbil | mòbil |
| iPhone 12/13/14 | 390×712 | mòbil | mòbil |
| iPhone 15/16 | 393×720 | mòbil | mòbil |
| iPhone 16 Pro/17 | 402×742 | mòbil | mòbil |
| Pixel 8/9/10 | 412×783 | mòbil | mòbil |
| iPhone 15 Plus/PM | 430×800 | mòbil | mòbil |
| iPhone 16/17 PM | 440×824 | mòbil | mòbil |
| **Android 16:9 apaïsat** | **640×310** | **SENSE CLASSE** | **mòbil** |
| Android 20:9 apaïsat | 780×310 | tauleta apaïssada | tauleta apaïssada |
| **iPhone SE/8 apaïsat** | **667×325** | **SENSE CLASSE** | **mòbil** |
| Android 384 apaïsat | 832×334 | tauleta apaïssada | tauleta apaïssada |
| iPhone 12/13/14 apaïsat | 844×340 | tauleta apaïssada | tauleta apaïssada |
| iPhone 15/16 apaïsat | 852×343 | tauleta apaïssada | tauleta apaïssada |
| Pixel apaïsat | 915×362 | tauleta apaïssada | tauleta apaïssada |
| iPhone 15 Plus apaïsat | 932×380 | tauleta apaïssada | tauleta apaïssada |
| Galaxy Tab S9 | 533×781 | mòbil | mòbil |
| Galaxy Tab S9+ | 584×862 | mòbil | mòbil |
| MatePad 12.2 | 613×909 | tauleta vertical | tauleta vertical |
| Galaxy Tab S9 Ultra | 616×952 | tauleta vertical | tauleta vertical |
| MatePad 13.2 | 640×952 | tauleta vertical | tauleta vertical |
| iPad mini 6 | 744×1061 | tauleta vertical | tauleta vertical |
| iPad 10.2 | 768×952 | tauleta vertical | tauleta vertical |
| iPad Air 11 | 820×1108 | tauleta vertical | tauleta vertical |
| iPad Pro 11 | 834×1122 | tauleta vertical | tauleta vertical |
| iPad Air 13 | 1024×1294 | tauleta vertical | tauleta vertical |
| **iPad Pro 13** | **1032×1304** | **escriptori** | **escriptori** |
| Galaxy Tab S9 apaïssada | 853×455 | tauleta apaïssada | tauleta apaïssada |
| Galaxy Tab S9+ apaïssada | 934×506 | tauleta apaïssada | tauleta apaïssada |
| MatePad 12.2 apaïssada | 981×535 | tauleta apaïssada | tauleta apaïssada |
| Tab S9 Ultra apaïssada | 1024×538 | tauleta apaïssada | tauleta apaïssada |
| MatePad 13.2 apaïssada | 1024×562 | tauleta apaïssada | tauleta apaïssada |
| iPad mini apaïssada | 1133×666 | tauleta apaïssada | tauleta apaïssada |
| iPad 10.2 apaïssada | 1024×690 | tauleta apaïssada | tauleta apaïssada |
| iPad Air 11 apaïssada | 1180×742 | tauleta apaïssada | tauleta apaïssada |
| iPad Pro 11 apaïssada | 1194×756 | tauleta apaïssada | tauleta apaïssada |
| iPad Air 13 apaïssada | 1366×946 | tauleta apaïssada | tauleta apaïssada |
| iPad Pro 13 apaïssada | 1376×954 | escriptori | escriptori |
| Portàtil 1280 | 1280×666 | tauleta apaïssada | tauleta apaïssada |
| Portàtil 1366 | 1366×634 | tauleta apaïssada | tauleta apaïssada |
| Portàtil 1440 | 1440×766 | escriptori | escriptori |
| Portàtil 1512 | 1512×848 | escriptori | escriptori |
| Portàtil 1536 | 1536×890 | escriptori | escriptori |
| Portàtil 1728 | 1728×983 | escriptori | escriptori |
| Escriptori 1920 | 1920×946 | escriptori | escriptori |
| Escriptori 2560 | 2560×1306 | escriptori | escriptori |

**El resultat: 48 formats, 2 diferències.** Les dues són els formats que avui **no tenen
cap classe** (el forat de 600–767 en apaïsat), i la matriu els dona la que els toca: són
telèfons girats.

### 1.4 I les quatre cel·les que la matriu NO mou (i que són decisions)

La matriu no canvia cap altra classe, i això vol dir que **hereta quatre
classificacions discutides**. No les toco en aquest paper perquè cada una té un cost
mesurat i és una decisió de l'amo:

| cas | avui | què passaria si canviés |
|---|---|---|
| **1280×666 i 1366×634** (els dos portàtils més comuns) | tauleta apaïssada | Si fossin escriptori, el carril baixaria de 992 a 961/900 i la hero s'encongiria; **l'encaix no millora**: amb el megaslide obert la pàgina ja no hi cap (en falten 136 a 1280 i 87 a 1366) |
| **Galaxy Tab S9 i S9+** (533 i 584) | mòbil | Si fossin tauleta vertical, tindrien la capçalera de dues files i la taula de caselles; el carril seria de 533 − 80 = **453 px**, i la columna de la taula faria **90 px** (amb els marges de la casella, uns 70) |
| **iPad Pro 13 vertical** (1032) | escriptori | Si fos tauleta vertical, tindria la taula de caselles; el carril seria de 952 px i la columna de 190. A 1024, que és el cas mesurat, el carril és 939 i la casella 167,8 × 168,4 |
| **Els sis telèfons girats de 780 a 932** | tauleta apaïssada | Si fossin mòbil, caldria el **full de mòbil**, que avui no existeix; i amb 334–380 px d'alçada el megaslide no hi cap |

---

## 2. Peça 2 — Una mesura: el carril

### 2.1 Les dues regles que hi ha avui

| | `--contingut-max` (tot el lloc) | `--hg-mega-w` (el megaslide) |
|---|---|---|
| on viu | `foundation.css` (CSS) | `FullWideSlideHeader.jsx` (JS, `getSafeBelt()`) |
| fórmula | `min(70,3125vw, 1350px)` | `min(w × 1350/1920, w − 32)` |
| sostre de 1350 | **sí** | **no** (a 2560 fa 1800) |
| topall per finestra | no | **sí** (`w − 32`, a l'apaïssada estreta) |
| tauletes | no en sap | 992 fix a la vertical; `min(992, w − 32)` a l'apaïssada |

I el carril de la pàgina nova (`--inici-nou-carril`) **penja del segon**: la seva
cadena és `--inici-nou-carril → --hg-band-w → --hg-mega-w → getSafeBelt()`. Per això
arrossega el **congelat** de 1024 a 1366 i el **penya-segat** de 1367: no són seus.

### 2.2 El carril per classe (mesurat)

| classe | carril | capçalera |
|---|---|---|
| escriptori | `min(70,3vw, 1350)` | 80 |
| tauleta apaïssada | `min(992, w − 32)` | 80 |
| tauleta vertical | `min(1350, w − 32) − 48` (el marc del lloc) | 123 |
| mòbil | `w − 32` | 80 + barra inferior |

### 2.3 La decisió, presa

**Un sol carril** (l'amo, 24/09): la belt desapareix com a mecanisme i tothom
—el lloc, la capçalera, la pàgina nova i el megaslide— llegeix el mateix
carril. El preu és que **mou el megaslide sencer**, i per tant es fa per passos,
amb `compara-vistes` i la base de les 833 xifres al davant.

### 2.4 L'objectiu, dit per l'amo (24/09/2026)

> «El que seria ideal és que el carril fos el mateix per a tothom. També pel
> megaslide.»

Aquesta frase és la peça 2 sencera, i val la pena escriure què implica, perquè
avui no és així (§2.1, §2.2). El carril ha de ser **una sola regla** i tothom
l'ha de llegir: el lloc, la capçalera, la pàgina nova **i el megaslide**. La
belt ha de desaparèixer com a mecanisme (la mesura del DOM, les guies
`--belt2-*`, els topalls, les tres branques de dispositiu).

I el que **no** canvia és la densitat: el que és diferent a cada classe no és el
regle, és **què s'hi dibuixa** (peça 3). La prova és el megaslide de la tauleta:
avui les seves peces estan **clavades** (`--hg-escala-mega` val 1 allà) i el seu
text té terres de 10 i 12 px **perquè** s'intenta encabir la composició de
l'escriptori en un carril més estret. Amb un carril de 3/5, a 768 el megaslide
escalaria al 34 % i el seu text faria 3-4 px: il·legible. Allà el que toca no és
la composició encongida sinó **una altra composició** — la taula de caselles
grans de `MAPA-caselles-tauleta.md`, on el text és llegible perquè les caselles
són grans. I al mòbil, el full.

O sigui: **una mesura, tres densitats.** El carril és el mateix; el que canvia
és com s'hi reparteixen les decisions.

### 2.5 El primer tros de la belt, tret (24/09/2026): el regle ja no ve de les guies

La capçalera demanava el carril amb `getSafeBelt()`, que **prioritza les guies
`--belt2-xL/xR`** quan són vàlides. Aquestes guies les publica
`BeltReferenceOverlay`, que només viu en desenvolupament i ho fa **més tard** que
la mesura de la capçalera. Mesurat a 2560×1306:

| moment | `--hg-mega-w` | carril de la pàgina nova | font |
|---|---|---|---|
| 1,0 s | **1800** | 1693 | la fórmula pura (2560 × 1350/1920) |
| 1,5 s i en endavant | **1350** | 1270 | les guies de debug (`--belt2-xL` = 605) |

O sigui: **el regle del lloc canviava sol** mig segon després de carregar, i el
carril de la pàgina nova queia un 25 %. A 1920 no es veia perquè les dues xifres
hi coincideixen (1350). Ara la capçalera fa servir `laneForViewport()`, que és la
mateixa fórmula sense guies: a 1440 i 1920 dona exactament el mateix, i per sobre
el que la producció ja feia.

**I una segona cosa que el canvi ha destapat:** a la tauleta vertical (768×1024)
el tauler del megaslide fa **992 px** i la seva posició es calculava amb el carril
de l'escriptori (**540**), o sigui `x = 114`: el tauler quedava 114 px endinsat i
en perdia 114 per la dreta. El comentari del codi diu «CENTRAT» i no ho feia. Ara
`x = 0`, que és el centre del tauler que de debò es publica (992 en una finestra
de 768 no hi cap centrat, i el que toca és arrencar a la vora). **És l'única xifra
que es mou de les 834** que mesura `mesura-megaslide` a les seves 7 vistes, i
s'ha comprovat invertint la comparació: capturada la base amb el canvi posat, el
codi de sempre se'n desvia exactament en aquesta.

### 2.6 El carril declarat, fet (24/09/2026): un sol número per a tothom

L'amo va triar **3/5** (1/5 de marge per banda). Implementat com una sola
declaració: la capçalera publica **`--carril`** i tot el que era un regle propi el
llegeix.

| qui | abans | ara |
|---|---|---|
| el carril del lloc (`--contingut-max`) | `min(70,3125vw, 1350px)` | **`var(--carril, …)`** |
| el marc del lloc (`--site-w`) | `min(1350, w − 32)` | **el carril** |
| el megaslide (`--hg-mega-w`) | la belt (`getSafeBelt`) | **el carril** |
| la fila de la capçalera | la belt | **el carril** |
| la franja (logo→icones) | mesurada del DOM | **mesurada, i ara fa el carril − 40/1350 per banda** |
| la pàgina nova | la franja | igual (la franja ja segueix el carril) |

**Mesurat — i això és el «mateix carril per a tothom» de debò:** a 1024, 1366 i
1920 el carril, el carril del lloc, el marc, el megaslide i la fila de la
capçalera fan **614, 820 i 1152 px**, tots cinc el mateix número. La hero fa
462×195, 617×260 i 867×365.

**I l'objectiu de l'amo, gairebé complert:** amb el megaslide obert, les hero hi
caben a totes les mides **menys a les quatre tauletes apaïssades més curtes**.
Mesurat (finestra, amb el megaslide obert):

| finestra | dispositiu | abans | amb 3/5 |
|---|---|---|---|
| 1024×690 | iPad 10.2 apaïssat | NO (−31,4) | **SI** (+120,6 d'aire) |
| 1280×586 | portàtil 1280×720 | NO | **SI** (+15,4) |
| 1366×634 | portàtil 1366×768 | NO (−87,4) | **SI** (+41,2) |
| 1024×562 | MatePad 13.2 apaïssat | — | **SI** (+0,6) |
| 1133×666 | iPad mini apaïssat | — | **SI** (+38,1) |
| 981×535 | MatePad 12.2 apaïssat | — | **NO** (−14,2) |
| 1024×538 | Tab S9 Ultra apaïssat | NO (−183,4) | **NO** (−21,8) |
| 934×506 | Tab S9+ apaïssat | — | **NO** (−30,8) |
| 853×455 | Tab S9 apaïssat | NO (−266) | **NO** (−61,4) |

O sigui: **l'objectiu es compleix a les tres que es van estudiar** (1024×690,
1280×586 i 1366×634) i a les dues següents, però **no a les quatre més curtes**
(finestres de 455 a 538 px d'alçada), on el fons de la hero queda sota la
plegada. Allà el que no hi cap és el **conjunt**: el megaslide (218-229 px) + el
cadenat (56) + una hero de 162-195 px en una finestra de 455-538. No és un
problema de fracció —amb 4/6 empitjora— sinó de **densitat** (peça 3): en una
finestra curta el megaslide ha de ser una composició més baixa, o la hero una
franja.

**L'alternativa 4/6, mesurada i descartada** (24/09): el carril a 2/3 deixa el
megaslide gairebé sense estirar (a 1920 el panell fa 368 dels 376 px d'abans, un
98 %, en comptes del 94 % del 3/5), però **perd la hero a 1280×586** (el cap
queda 20,3 px darrere el panell), deixa 1366×634 amb 2,2 px de marge i empitjora
les quatre curtes. Es queda a 3/5.

**Qui NO rep el carril declarat, i per què està escrit al codi:** la **tauleta
vertical** (el seu tauler fa 992 px, més ample que la finestra de 768: és un
disseny a part) i el **mòbil** (que va gairebé a tota l'amplada). Canviar-los-el
demana refer-ne la densitat (peça 3), i per això `carrilDeclarat()` torna `null`
i tot queda com estava.

**Verificat:** 505 proves (dues de noves per al carril i una d'actualitzada, que
fixava el regle vell), `vite build` net, eslint **idèntic a l'original** (26
problemes: 15 errors i 11 warnings a la capçalera) i **`compara-vistes` OK amb les
mateixes xifres** (a tauleta les peces continuen clavades, i per això les seves
mides no es mouen).

**El que queda d'aquesta peça:** (1) les peces del megaslide segueixen **clavades**
a la tauleta (`--hg-escala-mega` = 1) i els terres de 10 i 12 px hi són; (2) la
taula de la tauleta vertical i el full de mòbil, que són la densitat; (3) el text
de les col·leccions va en `rem` i amb el carril més estret s'ha de mirar; (4) la
base de `mesura:megaslide` s'ha de tornar a capturar.

---

| classe | disposició |
|---|---|
## 3. Peça 3 — Una densitat per classe

| classe | disposició |
|---|---|
| escriptori | **la pauta** (la composició de sempre) |
| tauleta vertical | **la taula de caselles** (la retícula 5×3; el mapa és a `MAPA-caselles-tauleta.md`) |
| tauleta apaïssada | la pauta amb el carril limitat (el que ja fa); **a decidir** si la taula, quan hi ha alçada |
| mòbil (vertical i apaïsat) | **el full de mòbil** — per construir |

I la regla que fa possible la densitat, que és la del mapa de caselles: **una decisió
per casella, i cap casella no conté una graella** (ni un desplaçament intern). Si una
casella demana una graella, la retícula no és la bona per a aquella pàgina.

**El que falta construir és el full de mòbil**, i és el que obre la porta a classificar
com a mòbil els sis telèfons girats (§1.4): avui la pàgina nova, per sota de 768, diu
que no té vista mòbil.

---

## 4. Peça 4 — Una escala

- **La geometria no té terra; el text sí.** `--u = --contingut-max / 1350`, sense terra
  (a 768 val 0,4, no 0,6667); el terra és del text.
- **Separar `--escala` de `--escala-text`** a `foundation.css` és el que fa possible que
  la geometria escali sense arrossegar la tipografia (és el punt 5 de
  `MAPA-calibratges.md`, encara pendent).
- I la regla 15 de la constitució: **cap número sense origen llegible**. Els tres que
  governen els aires de l'inici ja viuen en un sol lloc cadascun
  (`HOME_TITOL_TDP_MARGIN_PX`, `top: calc(100% + 130px)`, `HOME_GALERIA_AIRE_SOTA_PX`).

---

## 5. L'ordre de treball, amb portes de sortida

| pas | què | porta de sortida |
|---|---|---|
| **1** | **Aquest paper** | aprovat per l'amo |
| **2** | **La classificació, una sola** — **FETA** (24/09): la matriu viu a `deviceLayoutFromViewport` i el hook la llegeix (les regles duplicades s'han tret) | **6 proves noves**, 503 proves, `compara-vistes` OK; mesurat al navegador: només els 2 formats que no tenien classe es mouen |
| **3** | **El regle únic** (§2.3) — **COMENÇAT** (24/09): la capçalera ja no llegeix les guies de debug (§2.5) | la resta: `--hg-mega-w` llegint el carril declarat, i les peces del megaslide sense claus ni terres |
| **4** | **El full de mòbil** | la pàgina nova funciona per sota de 768 i als sis telèfons girats |
| **5** | **La densitat, peça per peça** (començant per la taula de la tauleta vertical) | el mapa de caselles, casella per casella |
| **6** | **L'escala separada** (`--escala` / `--escala-text`) | les cinc mides, mateixes xifres |

Cada pas **no es comença** sense la porta de l'anterior. I cap pas canvia dues coses
alhora: si una mesura es mou, s'atura i s'explica per què.

---

## 6. El que queda per decidir (per a l'amo)

1. **Les quatre cel·les de §1.4** (els portàtils 1280/1366, el Tab S9, l'iPad Pro 13
   vertical i els sis telèfons girats). La matriu ja està implementada amb les classes
   d'avui; moure una cel·la és una línia, però canvia la disposició d'aquells formats.
2. **El full de mòbil**: es fa abans o després de la densitat de la tauleta?
3. **La tauleta apaïssada**: es queda amb la pauta o li toca la taula quan hi ha alçada?
4. **El carril**: quina fracció mana (3/5 segons la proposta de l'amo) i si el marc del
   lloc i la fila de la capçalera la segueixen.

---

## 7. Com s'ha mesurat i què no s'ha tocat

- **La matriu** (§1.3): aritmètica sobre les 48 finestres de `scripts/mesura-formats.mjs`,
  amb les regles d'avui copiades de `layoutModel.js` i de `useDeviceLayout.js`. Amb un
  guió temporal que **no es commita**.
- **La classificació, després d'implementar-la** (24/09): mesurat al navegador a 640×310,
  667×325 (els dos que guanyen classe) i als veïns 780×310, 832×334, 600×900, 768×400,
  599×900 i 1024×538. **Només es mouen els dos**: guanyen la barra inferior i **conserven
  el cistell a la capçalera** (2 accessos). La resta, xifra a xifra igual: offset, alçada
  de capçalera, icones i cistell.
- **El carril** (§2.2): les xifres són les mesurades al 3003 el 24/09 (1920 → 1270,
  1440 → 953, 1024–1366 → 933, 853 → 772, 768 → 688), amb la mesura del tram
  logo→icones al costat de la fórmula.
- **La primera substitució del regle** (§2.5), amb la bateria sencera: 503 proves,
  `vite build` net, eslint **26 problemes (15 errors, 11 warnings)** a la capçalera
  —exactament els mateixos que el fitxer original, comprovat— i `compara-vistes`
  **OK amb les mateixes xifres** (dibuix 20,89, gap 17,91, cercle 18,89, franja 101,6
  a les tauletes; 22,5 a 1440). Del guardià de 834 xifres, **es mou una**: la
  posició del tauler a la vertical (§2.5), explicada i mesurada a part.
- **Una base caducada, per no confondre**: `npm run mesura:megaslide` canta **271 de 833
  xifres** mogudes, i totes són estructurals (el panell de 292 a 434 px, offsets de −40 px
  per la barra de desenvolupament). La base és del **18/09**, d'abans de les taules de la
  tauleta: no és d'aquests canvis, i s'haurà de tornar a capturar quan es tanqui el carril.

