# Formats del desplegament

**Data:** 2026-09-24
**Com es mesura:** `node scripts/mesura-formats.mjs` (cal el servidor al 3003). El
script és la llista: si un format no hi és, no està cobert.

Aquest document existeix perquè el mateix aparell pot caure en forats segons com
es classifiqui. Aquí hi ha **quins formats hem de cobrir**, **què en fa avui el
codi** i **què hi falta**, tot mesurat, no deduït.

---

## 1. D'on surten els formats

Les amplades són **amplades CSS** (les que veu el navegador), no físiques: la
maquetació depèn de l'amplada CSS. Surten de la matriu de dispositius 2025
([2025 Responsive Device Matrix](https://siqilu.github.io/notes/device-matrix-2025/)),
que dona amplada CSS i DPR de cada aparell, i de les alcades típiques de
pantalla per a portàtils i escriptori.

L'alçada de **finestra** de cada format és la de la pantalla menys el que el
navegador s'hi menja (barra de finestres + barra d'adreces). Aquests són els
valors calibrats a `public/browser-overlay.html`: Chrome d'escriptori **134 px**,
Safari de tauleta apaïsada **78**, tauleta vertical **72**, mòbil vertical
**132** (88 a dalt + 44 a baix), mòbil apaïsat **50**, PWA **14**.

## 2. La llista

**46 formats.** Els que tenen el cistell en perill van marcats.

### Telèfons, vertical (9)

| amplada CSS | aparell | finestra |
|---|---|---|
| 360×640 | Galaxy S25/S24, Xiaomi (el més comú) | 360×508 |
| 375×667 | iPhone SE (2a/3a), iPhone 8 | 375×535 |
| 384×832 | Galaxy S23+/S24+/S25+ | 384×700 |
| 390×844 | iPhone 12/13/14 | 390×712 |
| 393×852 | iPhone 15/16 | 393×720 |
| 402×874 | iPhone 16 Pro/17 | 402×742 |
| 412×915 | Pixel 8/9/10 | 412×783 |
| 430×932 | iPhone 15 Plus/Pro Max | 430×800 |
| 440×956 | iPhone 16/17 Pro Max | 440×824 |

### Telèfons, apaïsat (7)

| amplada CSS | aparell | finestra | |
|---|---|---|---|
| 640×360 | Android 360 girat | 640×310 | **sense cistell** |
| 667×375 | iPhone SE/8 girat | 667×325 | **sense cistell** |
| 832×384 | Android 384 girat | 832×334 | |
| 844×390 | iPhone 12/13/14 girat | 844×340 | |
| 852×393 | iPhone 15/16 girat | 852×343 | |
| 915×412 | Pixel girat | 915×362 | |
| 932×430 | iPhone 15 Plus girat | 932×380 | |

### Tauletes, vertical (11)

| amplada CSS | aparell | finestra | |
|---|---|---|---|
| 533×853 | Galaxy Tab S9 | 533×781 | |
| 584×934 | Galaxy Tab S9+ | 584×862 | |
| 613×981 | Huawei MatePad Pro 12,2" | 613×909 | **sense cistell** |
| 616×1024 | Galaxy Tab S9 Ultra | 616×952 | **sense cistell** |
| 640×1024 | Huawei MatePad Pro 13,2" | 640×952 | **sense cistell** |
| 744×1133 | **iPad mini 6** | 744×1061 | **sense cistell** |
| 768×1024 | iPad 10,2" | 768×952 | |
| 820×1180 | iPad Air 11" | 820×1108 | |
| 834×1194 | iPad Pro 11" | 834×1122 | |
| 1024×1366 | iPad Air 13" | 1024×1294 | |
| 1032×1376 | iPad Pro 13" | 1032×1304 | |

### Tauletes, apaïsat (11)

853×533 · 934×584 · 981×613 · 1024×616 · 1024×640 · 1133×744 · 1024×768 ·
1180×820 · 1194×834 · 1366×1024 · 1376×1032. Totes amb el cistell a la
capçalera.

### Portàtils i escriptori (8)

1280×800 · 1366×768 · 1440×900 · 1512×982 · 1536×1024 · 1728×1117 ·
1920×1080 · 2560×1440. Tots amb el cistell a la capçalera.

## 3. Què en fa avui el codi

Mesurat format a format (finestra = pantalla menys el navegador):

| classe | offset | capçalera | 2a fila | cistell | pàgina nova |
|---|---|---|---|---|---|
| Telèfons vertical (360–440) | 80 | 81 | no | barra inferior ✓ | missatge de mòbil |
| Telèfons apaïsat 640–667 | **64** | 81 | no | **cap** ✗ | missatge de mòbil |
| Telèfons apaïsat 832–932 | 80 | 81 | no | capçalera ✓ | contingut |
| Tauletes vertical 533–584 | 80 | 81 | no | barra inferior ✓ | missatge de mòbil |
| Tauletes vertical 613–744 | 123 | 123 | sí | **cap** ✗ | missatge de mòbil |
| Tauletes vertical 768–1024 | 123 | 123 | sí | capçalera ✓ | contingut |
| Tauletes vertical 1032 | 80 | 81 | no | capçalera ✓ | contingut |
| Tauletes apaïsat (totes) | 80 | 81 | no | capçalera ✓ | contingut |
| Portàtils i escriptori | 80 | 81 | no | capçalera ✓ | contingut |

## 4. Els sis forats

En aquests sis formats **no hi ha cap manera d'obrir el cistell**: ni icona a la
capçalera ni pestanya a la barra inferior. Es pot afegir al cistell i no es pot
ni veure ni pagar.

| format | aparell | offset |
|---|---|---|
| 640×360 | Android 360 girat | **64** |
| 667×375 | iPhone SE/8 girat | **64** |
| 613×981 | Huawei MatePad Pro 12,2" | 123 |
| 616×1024 | Galaxy Tab S9 Ultra | 123 |
| 640×1024 | Huawei MatePad Pro 13,2" | 123 |
| 744×1133 | **iPad mini 6** | 123 |

La causa és que hi ha **dues fronteres de mòbil diferents** al mateix codi:

- `useDeviceLayout` (i `layoutModel`): mòbil és `< 600`. Decideix la capçalera i
  la barra inferior (`{isMobile && …}` a `App.jsx`).
- `useIsMobile` (les pàgines) i el `md:` de Tailwind: mòbil és `< 768`. Decideix
  les icones de la capçalera (`hidden md:flex`) i si la pàgina pinta contingut.

Entre 600 i 767 no és ni una cosa ni l'altra: la barra inferior no s'hi munta
(perquè `isMobile` és fals) i les icones tampoc (perquè `md:` és fals). En
apaïsat, a més, no cau en cap de les quatre categories i va a petar a la
constant `ESTRETA` = 64 px, que al codi està documentada com a «avui no es dona
enlloc». Sí que es dona: la capçalera fa 81 px i la pàgina en reserva 64.

## 5. La decisió

Es tracta de triar **una sola frontera de mòbil** i que valgui per a tot.

**Opció A — mòbil = `< 768`** (el que ja fan les pàgines i el `md:`).
`useDeviceLayout`: `isMobile = width < 768` i `isPortraitTablet = width >= 768`
(les dues, o 600–767 quedaria mòbil *i* tauleta alhora); `layoutModel`:
`MIDA_MOVIL = 768`.
Tanca els sis forats i el pedaç de 64 px, i deixa la pàgina nova i la capçalera
d'acord. Cost: l'iPad mini i els MatePad es queden amb la capçalera i la
navegació de mòbil (barra inferior) en comptes del disseny de tauleta.

**Opció B — mòbil = `< 600`, i el disseny de tauleta des de 600.**
Cal mostrar les icones de la capçalera des de 600 (canviar els `md:` dels
blocs afectats) i que la pàgina nova pinti contingut des de 600
(`useIsMobile = width < 600`). Llavors l'iPad mini i els MatePad tenen el
disseny de tauleta de debò. Cost: els telèfons en apaïsat de 640-667 també
reben el disseny de tauleta si no s'hi afegeix una excepció per alçada (són
finestres de 310-325 px d'alçada), i cal verificar el megaslide i la hero entre
600 i 767, on avui no s'ha provat mai res.

**Recomanació:** fer l'opció A ara (són dues línies i cap format es queda sense
cistell), i decidir l'opció B després, com una feina de disseny amb la seva
mesura. L'iPad mini en vertical amb la disposició de mòbil funciona; el que no
funciona avui és quedar-se al mig.

## 6. El que encara no està mesurat

- **La hero de la pàgina nova**, format a format, amb el megaslide obert. Mesurat
  als formats grossos, amb el megaslide obert: hi cap a 1920×946 (+2,5 px),
  1440×766 (+3,4), 768×952 (+30,1), 834×1122 (+79,2) i 1024×1294 (+74,2); **no**
  hi cap a 1024×690 (−31,4), 1280×666 (−135,8) i 1366×634 (−87,4).
- **La pàgina nova per sota de 768**: avui és el missatge «encara no té la vista
  mòbil». Si l'opció B tira endavant, ha de funcionar a 600-767.
- **La fila de col·leccions de la tauleta vertical** talla per sota de 698 px
  d'amplada (49 px per banda a 600), perquè va centrada dins un contenidor més
  estret que el contingut.
