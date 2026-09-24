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

### 2.3 La decisió

**Una sola font o dues?** Una sola vol dir que `--hg-mega-w` surti del mateix lloc que
`--contingut-max`; el preu és que **mou el megaslide sencer** (i `compara-vistes` és la
xarxa). Dues vol dir escriure la diferència (el sostre de 1350 i el topall `w − 32`) al
costat de cada regla, i acceptar que el carril de la pàgina nova tingui congelat i
penya-segat.

---

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
| **2** | **La classificació, una sola** (una funció a `layoutModel`; les altres la llegeixen) | `mesura-formats.mjs` diu **0 formats sense classe** i la resta de xifres no es mouen |
| **3** | **El regle únic** (§2.3) | `compara-vistes` OK amb les mateixes xifres; el carril, amb la diferència escrita |
| **4** | **El full de mòbil** | la pàgina nova funciona per sota de 768 i als sis telèfons girats |
| **5** | **La densitat, peça per peça** (començant per la taula de la tauleta vertical) | el mapa de caselles, casella per casella |
| **6** | **L'escala separada** (`--escala` / `--escala-text`) | les cinc mides, mateixes xifres |

Cada pas **no es comença** sense la porta de l'anterior. I cap pas canvia dues coses
alhora: si una mesura es mou, s'atura i s'explica per què.

---

## 6. El que queda per decidir (per a l'amo)

1. **La matriu** (§1.1): s'accepta tal com està, o es mou alguna de les quatre cel·les
   de §1.4?
2. **El regle** (§2.3): una sola font (mou el megaslide) o dues amb la diferència
   escrita?
3. **El full de mòbil**: es fa abans o després de la densitat de la tauleta?
4. **La tauleta apaïssada**: es queda amb la pauta o li toca la taula quan hi ha alçada?
5. **Els dos portàtils** (1280 i 1366): es queden com a tauleta apaïssada?

---

## 7. Com s'ha mesurat i què no s'ha tocat

- **La matriu** (§1.3): aritmètica sobre les 48 finestres de `scripts/mesura-formats.mjs`,
  amb les regles d'avui copiades de `layoutModel.js` i de `useDeviceLayout.js`. Amb un
  guió temporal que **no es commita**.
- **El carril** (§2.2): les xifres són les mesurades al 3003 el 24/09 (1920 → 1270,
  1440 → 953, 1024–1366 → 933, 853 → 772, 768 → 688), amb la mesura del tram
  logo→icones al costat de la fórmula.
- **Cap fitxer de `src/` tocat.** No hi ha res a compilar ni cap prova que en pugui
  canviar el resultat, i per tant no s'ha passat la bateria.
