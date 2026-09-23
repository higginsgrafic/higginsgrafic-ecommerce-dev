# INFORME DE LA SESSIÓ DEL 23/09/2026 (vespre)

**Projecte:** `higginsgrafic-ecommerce-dev`
**Ruta de treball:** `/nova/inici` (la pàgina nova, al costat de la vella `/`)
**Últim commit:** `efb0004` — pujat a `origin/main`
**Servidor:** `http://127.0.0.1:3003` — **ja corria, no se n'ha aixecat cap altre**

---

## 1. Estat de sortida, verificat

| comprovació | resultat |
|---|---|
| `npx vitest run` | **497 proves, 41 fitxers, totes passen** |
| `npm run compara-vistes` | **OK** (el megaslide no s'ha mogut) |
| `npx vite build` | **OK** |
| `npx eslint` als fitxers tocats | **0 errors** |
| La pàgina vella `/` | **6932 px**, exactament la xifra de referència |
| `git status` | net, `origin/main` al dia (`0 0`) |
| Scripts temporals | cap |

---

## 2. Abast de la sessió

**49 commits**, del 04:06 a les 21:44, en tres tongades (04:06–04:46, 15:00–18:31
i 18:54–21:44). El fil de fons és la columna vertebral del lloc: la pàgina
d'Inici, que ha de ser **lleugera i robusta**.

Es pot dividir en cinc trams:

| tram | hora | què hi ha |
|---|---|---|
| **A. Fonamenta i espaiat** | 04:06–16:28 | el carril, la unitat, l'aire, la hero amb la proporció de disseny |
| **B. L'esquelet de la pàgina nova** | 16:37–17:25 | la taula, el marc, les icones, el títol, les galeries |
| **C. L'espec i el carril** | 17:43–18:31 | les passes de l'espec, el carril de la capçalera, la tauleta |
| **D. La hero** | 18:54–19:12 | les franges, el rectangle, el boto, el 80 % |
| **E. La distribució vertical de dalt** | 20:06–21:44 | **el gruix de la feina d'aquesta sessió** |

---

## 3. Antecedents importants (el que cal saber abans de tocar res)

### 3.1 Dues pàgines d'inici, i no s'ha de confondre

| ruta | què és | marcador al DOM |
|---|---|---|
| `/` | la pàgina **vella**, en producció | cap |
| `/nova/inici` | la pàgina **nova**, en construcció | `data-inici-nou="1"` |

**Tota la feina d'aquesta sessió és a `/nova/inici`.** Mirar `/` i jutjar-hi res
no té cap sentit: no té ni el marc nou, ni les icones, ni la hero nova. Va
costar una estona llarga descobrir-ho.

### 3.2 El carril: n'hi ha DOS

| carril | valor | qui el publica |
|---|---|---|
| **global** `--contingut-max` | `min(70.3125vw, 1350px)` | `foundation.css` |
| **de la pàgina nova** `--inici-nou-carril` | `var(--hg-band-w, …)` | la capçalera: **el tram del logo a la icona d'usuari** |

Mesures del carril de la pàgina nova: **1270** a 1920, **953** a 1440, **933** a
1280 i 1024, **688** a 768.

**Els sostres no coincideixen i això ho explica tot.** El carril té un sostre de
1350 px i la finestra no: a 1024 i 1280 el carril ja està al màxim (933) mentre
la finestra segueix baixant (768 i 720). Per això la mateixa hero que a 1920
ocupa el 73 % de l'espai, a 1280 n'ocupa el 95 %.

### 3.3 El megaslide

- És la peça calibrada a 1920 que obre el panell de colleccions des de la
  capçalera. **No s'ha tocat mai**, i `compara-vistes` ho vigila.
- **El panell es desmunta del DOM quan és tancat.** Això vol dir que la seva
  vora no es pot mesurar quan està tancat, i que qualsevol cosa que hi pengi no
  pot dependre d'obrir-lo.
- Ocupa **molt més que la capçalera**: a 1920 la capçalera fa 121 px i el panell
  n'acaba **497**. A 1440, 426; a 1024 i 1280, 392; a 768, 565.
- Publica la seva geometria a `<html>`: `--hg-mega-w`, `--hg-mega-x`,
  `--hg-band-w`, `--hg-escala-mega`, i **`--hg-mega-bottom`** (aquesta última
  l'ha afegida aquesta sessió).
- El **cadenat** (el botó de bloqueig) penja de la vora del panell: ocupa **56
  px** just a sota la línia. És un estri del megaslide, no el megaslide.

### 3.4 La unitat i l'espaiat

- `--u = var(--contingut-max) / 1350`. A 1920 val 1 px.
- `--esp-1..4 = --u × 8/16/40/120`.
- **La geometria no té terra; el text sí.** `--u` no en té, i per això a 768 val
  0,4 i no 0,6667. Barrejar-ho va ser un dels errors de fons de la sessió.
- **No s'ha de tocar mai el `font-size` de l'arrel**: 315 fitxers fan servir
  `rem`.

### 3.5 Els paranys que ja estan documentats

A `docs/informes/TESTIMONI-2026-09-23.md` n'hi ha set de catalogats. Aquesta
sessió n'hi ha afegit cinc més (secció 6).

---

## 4. Tram E: la distribució vertical de dalt (la feina grossa)

### 4.1 El problema

La pàgina nova repartia el seu tros de dalt contra **`--appHeaderOffset`**, que
és l'alçada de la **capçalera**. Però el megaslide n'ocupa molta més:

| port | `--appHeaderOffset` | vora del panell | diferència |
|---|---|---|---|
| 1920×1080 | 120 | **497** | +377 |
| 1440×900 | 120 | **426** | +306 |
| 1280×720 | 104 | **392** | +288 |
| 1024×768 | 104 | **392** | +288 |
| 768×1024 | 156 | **565** | +409 |

> **Nota afegida després (barra de desenvolupament fora).** Aquests offsets
> comptaven la **barra de desenvolupament** de 40 px, que només veia
> l'administrador: la pàgina no s'estava mesurant mai a la seva alçada de
> veritat. Ja no surt a les pàgines del lloc, així que avui `--appHeaderOffset`
> val **80 px** a 1920, 1440, 1367 i a totes les mides de **tauleta apaisada**
> (1280, 1366, 1024), i **116 px** a la **tauleta vertical** (600–1024
> d'amplada, 768 i companyia), que és l'única que porta la capçalera de dues
> files. Els 104 i 156 de la taula també són vells: la capçalera de dues files
> va arribar a ser de les dues tauletes i s'ha tornat enrere. La vora del
> panell baixa els mateixos 40 px. La xifra que no canvia és la diferència:
> continua sent l'alçada del panell.

Conseqüències mesurades: **el cadenat trepitjava la hero a tots cinc ports** (48
px a 1920, 38 a 1440, 48 a 1280 i 1024, 43 a 768) i **la hero no es movia gens**
en obrir el panell (498 → 498).

### 4.2 La decisió: el megaslide publica on acaba

El bucle que ja li segueix la vora per posar-hi el cadenat ara escriu
**`--hg-mega-bottom`** amb la vora del panell. **No s'esborra en tancar**: com
que el panell es desmunta, si s'esborrés el contingut es mouria a cada obrir i
tancar. Es queda amb l'últim valor conegut.

Això no és lligar-se al megaslide: és l'única via perquè la pàgina sàpiga on és
la línia sense consultar-ne el component ni el DOM.

### 4.3 Els intents que NO funcionen (i per què)

Val la pena deixar-los escrits, perquè tots tres semblen raonables i tots tres
fallen:

**a) Fer-ho amb `calc` al CSS.** Una variable de CSS **hereta el valor que té ON
S'HA DECLARAT**: el `calc` no viatja, el que viatja és el resultat. Declarat a
`:root`, es resolia amb la zona a `100vh` perquè la xifra bona la publica el
marc més avall, i el resultat baixava **congelat**. Símptoma mesurat: el topall
de la hero es calculava amb una zona de 1080 quan la zona en feia 583, i la hero
se n'anava a **1296 px** i desapareixia de la pantalla.

**b) Escriure els valors amb `style.setProperty` des de l'efecte.** React
**reescriu l'atribut `style` sencer a cada render**, i el megaslide en provoca
molts. Les variables s'esborraven tot seguit. Mesurat: el `setProperty` s'hi
executava i l'atribut quedava net. **Els valors han de viure a l'estat.**

**c) Mesurar l'alçada de la hero amb el topall posat.** La caixa té
`aspect-ratio` **i** `max-height`, i el navegador en pren la més petita de les
dues alçades. Mesurar-la amb el topall dona l'alçada **ja encongida**, i el
càlcul es torna circular: la hero s'encongia pel sostre, el sostre es tornava a
calcular amb la hero encongida, i el resultat era una hero de 342 px on en
tocaven 190. La solució és **calcular** l'alçada natural (amplada ÷ proporció −
2 px de vores), no mesurar-la.

També es va intentar repartir amb la zona mesurada del DOM, i el bucle **es va
desbocar** (l'aire se'n va anar a disset milions de píxels): l'aire depenia de
l'alçada de la zona i l'alçada de la zona de l'aire.

### 4.4 La solució final: el tros de dalt, en 28 FILES

El repartiment continu (un `calc` sobre la finestra) donava un buit de 154 px a
1920, però no encaixava amb la resta del lloc, que està fet a base de **graelles
de files**. La solució és quanticar-lo: el tros de dalt són **files senceres**,
les mateixes que fa servir el megaslide.

```
megaslide 11 | buit 1 | icones 2 | buit 1 | hero 12 | buit 1  =  28 files
```

**LA FILA** és `(finestra − capçalera) / 28`. **No** és la fila de la graella del
megaslide (`laneForViewport() × 0,0280625 − 2,875`, que a 1920 fa 35,01), perquè
aquella depèn del **carril** i la finestra no: amb la de la graella, a 1440 el
bloc no omplia la finestra. Amb la de la finestra, els comptes tanquen a totes
les mides:

| port | fila | 11 files (= megaslide) | 2 files (= icones) | 28 files (= finestra−header) |
|---|---|---|---|---|
| 1920×1080 | 34,3 | **377** (mesurat 376) | 69 (mesurat 70,4) | **960** (960) |
| 1440×900 | 27,9 | **306** (mesurat 305) | 56 (mesurat 52,8) | **780** (780) |
| 1024×768 | 23,7 | 261 | 47 | **664** (664) |
| 1280×720 | 22,0 | 242 | 44 | **616** (616) |
| 768×1024 | 31,0 | 341 | 62 | **868** (868) |

**LA HERO OCUPA 12 FILES**, i el topall la hi deixa: el seu tamany natural en fa
12,23 a 1920 (428 px contra 411). És l'única peça que cedeix, i ho fa perquè el
repartiment tanqui amb files senceres.

**COM ES REPARTEIXEN LES FILES ENTRE LES DUES CELLES.** La cel·la de les icones
porta a dalt **12 files** (les 11 del megaslide més el buit que les separa) i res
a baix; la de la hero porta **una fila** a cada costat.

La primera versió d'aquest repartiment posava el mateix valor a totes dues
bandes de totes dues cel·les, i el buit del mig sortia **el doble** que els altres
(mesurat a 1920: 77/154/232 en comptes de 154/154/154), perquè el buit del mig
el posen les DUES cel·les.

### 4.5 El que encara no quadra: el cadenat

El cadenat del megaslide **trepitja la part de dalt de la hero**. Amb el model de
files, el cadenat ocupa les files 11-12 i la hero comença a la 15, o sigui que se
solapen uns **50 px** a 1920.

No és un error del repartiment: és que la fórmula no sap res del cadenat, que és
un estri del megaslide i no del marc. Perquè no el trepitgés caldria reservar-li
una fila més, i aleshores el model passaria de 28 files a 29 i la pàgina
s'allargaria.

**Decisió pendent per a la sessió següent.**

---

## 5. Els altres trams, amb la causa de cada cosa

### 5.1 Fonamenta (tram A)

- **Els multiplicadors de l'espaiat estaven invertits** (`0,5/1/2,5/7,5` en
  comptes de `8/16/40/120`) i la geometria tenia el terra del text. Corregit:
  `--u` sense terra, `--escala` amb el terra.
- **La unitat passa a sortir del CARRIL** i no de la finestra: `--u =
  --contingut-max / 1350`. Abans, a tauleta, el carril s'eixamplava i la unitat
  no, i el títol es quedava igual mentre la hero creixia.
- **El carril de la pàgina nova passa a ser el tram del logo a la icona
  d'usuari** (1270 a 1920), publicat per la capçalera com a `--hg-band-w`.
  **Scopat amb `[data-inici-nou="1"]`**: canviar `--contingut-max` globalment
  va trencar la pàgina vella dues vegades (la segona se'n va emportar el carril
  sencer: alçada de 6932 a 6778, fitxes de 321×505 a 301×485).

### 5.2 L'esquelet (tram B)

- **El marc de la pàgina** (`MarcInici`) és una peça pròpia, amb una **taula
  invisible de dues files** per a les icones i la hero.
- **La píndola de les galeries va al flux**, no `absolute`: com que era
  `absolute`, s'ancorava a la graella i la reserva no cancel·lava mai.
- **La franja d'icones i Austen al centre de la cel·la**: la franja té l'alçada
  d'Austen (70,4) i les altres icones s'hi alineen pel cap; First Contact
  (98,9) hi sobresurt per baix.
- **MISCEL·LÀNIA tenia una quarta fitxa buida**: el catàleg només tenia tres
  dibuixos. Afegits `arthur-d-the-second` i `r2d2-quote`.
- **El títol**: la caixa ha de contenir el text. Amb `line-height: 0.85`
  desbordava 27 px; amb `normal`, no.

### 5.3 La hero (tram D)

- **Les franges són cinc, iguals** (`flex: 1 1 0`), i la samarreta es pinta com
  una imatge de fons que fa el **500 %** de l'alçada de la franja, desplaçada el
  20 % que li toca. Sense màscara: la forma surt de la unió de les porcions.
  Copiat de la pàgina vella, que és el que calia fer des del principi.
- **La hero té el SEU mapa de mides del dibuix** (`HERO_DIBUIX_MIDA`), i no
  l'`overlayScale` de la fitxa: són dos sistemes diferents. La clau del mapa és
  el final de la ruta de la imatge.
- **El boto de barrejar va dins de la caixa**: `.hg-hero-caixa` era `static` i
  l'`absolute` del botó agafava el `main`, o sigui que anava a mig pàgina.
- **La hero fa el 80 % del carril.** El percentatge va al bloc i no a la caixa,
  perquè el `padding` d'un percentatge es mesura sobre l'amplada del pare.
- **`compara-vistes` va salvaguardar el megaslide** en tots aquests canvis.

### 5.4 La troballa del final: el topall trencava la hero

El rectangle de la hero tenia un topall (`--inici-hero-sostre`) que l'encongia
per sota de la seva mida natural, i **trencava la relació amb les franges**: la
franja deixava de ser 1/5 del rectangle i la capa de la samarreta no arribava a
la seva alçada.

Tret el topall, i amb la capa a `calc(500% + els gaps)` (les franges tenen 2 px
de separació, i sense comptar-los la capa quedava curta), **la capa i el
rectangle fan exactament el mateix** a totes cinc mides.

---

## 6. Paranys nous, per a la sessió següent

1. **`/nova/inici` no és `/`.** Abans de jutjar res, comprovar el marcador
   `data-inici-nou="1"`.
2. **React esborra el que s'escriu amb `setProperty`.** Els valors calculats han
   d'anar a l'estat i sortir pel `style` del JSX.
3. **Les variables de CSS no viatgen.** Un `calc` declarat amunt es resol amb
   els valors d'amunt i baixa congelat. Si el càlcul depèn de xifres que
   publiquen components, s'ha de fer a JavaScript.
4. **El panell del megaslide no és al DOM quan és tancat.** Res no pot dependre
   de mesurar-lo en aquell estat.
5. **Els paràmetres d'un mateix càlcul es poden contradir.** El `buit` del
   megaslide sortia d'una zona i la resta es calculava amb una altra, i per això
   el resultat no quadrava mai.

---

## 7. Estat final, mesurat

Amb el megaslide **obert**, a les cinc mides. El model: `megaslide 11 | buit 1 |
icones 2 | buit 1 | hero 12 | buit 1 = 28 files`.

| port | fila | megaslide (11 files) | icones | hero (12 files) | suma | finestra−header |
|---|---|---|---|---|---|---|
| 768×1024 | 31,0 | 341 | 28,2 | 246,6 | 709 | 868 |
| 1024×768 | 23,7 | 261 | 37,5 | 284,6 | 658 | 664 |
| 1280×720 | 22,0 | 242 | 46,9 | 264,0 | 619 | 616 |
| 1440×900 | 27,9 | 306 | 52,8 | 319,1 | 764 | 780 |
| 1920×1080 | 34,3 | 377 | 70,4 | 411,4 | 958 | 960 |

- A 1920 i 1440 les **11 files coincideixen amb el megaslide mesurat** (377
  contra 376, i 306 contra 305).
- **Les icones queden visibles just sota el separador** i la hero a sota seu, a
  totes cinc mides.
- **La hero cap dins la finestra** a tots cinc ports.
- **La capa de la samarreta fa exactament l'alçada del rectangle** a tots cinc.
- El cadenat trepitja la hero a tots cinc (secció 4.5).

## 8. Pendent

1. **El cadenat del megaslide trepitja la hero** uns 50 px a 1920. Caldria
   reservar-li una fila més (29 en comptes de 28): secció 4.5.
2. **La hero ocupa 12 files**, i a 1920 el seu tamany natural en fa 12,23: el
   topall la deixa 17 px més curta. És l'única peça que cedeix perquè el
   repartiment tanqui.
3. **La capçalera no s'ha migrat** (fase 7, 3196 línies). El peu encara té una
   excepció a `App.jsx`.
4. **Les transicions entre plans de la hero** (les animacions `hg-hero-enter/exit`
   de la pàgina vella) encara no hi són.
5. **La vista mòbil** de la pàgina nova no existeix: `/nova/inici` diu que es
   construeix sobre l'escriptori.
