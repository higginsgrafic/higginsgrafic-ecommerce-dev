# TESTIMONI DE LA SESSIÓ DEL 23/09/2026

**Projecte:** `higginsgrafic-ecommerce-dev`
**Últim commit:** `dd60633`
**Servidor de desenvolupament:** `http://127.0.0.1:3003` — **ja corria, no se n'ha aixecat cap altre**

---

## 1. Estat de sortida, verificat

| comprovació | resultat |
|---|---|
| `npx vitest run` | **474 proves, 39 fitxers, totes passen** |
| `npm run compara-vistes` | **OK** |
| `npx vite build` | **OK** |
| `npx eslint` als fitxers tocats | **7 problemes (1 error) abans i 7 després** — l'error és preexistent |
| `git status` | net, `origin/main` al dia |
| Scripts temporals | cap |

---

## 2. Què s'ha fet, amb la CAUSA de cada cosa

### 2.1 La belt jubilada (`fc264d8`)

**El carril de la pauta no era una mesura: era una regla de tres.**
`getSafeBelt()`, `useReactiveBelt`, un `MutationObserver`, una publicació primerenca i
un `useLayoutEffect` que esborrava les variables en desmuntar-se `TdpPage`. Tot plegat
calculava `1350 × (amplada / 1920)` amb sostre a 1350, que és `min(70.3125vw, 1350px)`.
Ara viu a `foundation.css` com a `--contingut-max`, amb `--hg-tdp-xL/xR` com els seus
dos extrems. **−137 / +58 línies.** Verificat: carril, hero, títol, graella i
`scrollWidth` idèntics a les cinc mides. Un sol número canvia: a 1440 el carril passa
de 1013 a 1012,5, perquè el JavaScript arrodonia a píxels sencers i després el CSS en
derivava els extrems.

### 2.2 El mapa dels calibratges (`275372e`, `52ff8af`, `b447b4c`, `25f37fa`)

`docs/informes/MAPA-calibratges.md`: l'inventari dels números que governen la
geometria, amb el seu origen de disseny. **El llenç de disseny ja existia al codi**
(2642 d'amplada, alçades 6708/9717/1780/3950/5217, 90/53/24 files, gap 3) però no era
qui manava. Els coeficients misteriosos són el llenç: `0.3385` = 12 files,
`0.01410547` = mitja fila, `0.84632` = 30 files.

I l'inventari del megaslide: **257 calibratges, dels quals 135 són «NO DEDUÏBLE»**.

### 2.3 El llenç declarat (`62ff34c`) i la primera substitució (`7650fca`)

`src/config/llencos.js` amb **12 proves** (`tests/unit/llencos.test.js`). Passa de 462 a
**474 proves**. La mesura que el justifica: **les tres graelles del lloc surten del seu
llenç de manera exacta** (0,028072 / 0,028209 / 0,028211, teòric = pintat a les tres).

La primera substitució: el `0.3385` de `CollectionVerticalPage` i
`ConstructorColleccioPage` es deriva de `LLENCOS.colleccio.coef`. **Mou 0,042 px com a
màxim**, mesurat a les cinc mides.

### 2.4 La pàgina d'inici

| commit | què | causa |
|---|---|---|
| `6a5992a` | les cinc col·leccions amb la **mateixa distància** títol→fitxes | la primera tenia `marginTop` 75 i les altres 150, i a sobre un `top` negatiu per col·lecció (`−13, 0, −22, −6, −13`) per compensar-ho |
| `2131ebb` | l'**interior de la fitxa** proporcionat | la col·lecció passava les mides interiors i l'inici no, i la fitxa queia als valors per defecte (selector del 62 % i alçada fixa de 34 px) |
| `7d29dc5` | només la variant amb el **nom a dalt** | decisió de l'amo; les dues variants feien altures diferents |
| `636bbb9` | el **fons degradat a totes** les fitxes | només el passava la col·lecció; i la última fitxa de cada galeria quedava sense fons i amb les mides per defecte perquè `cardProps` torna `{}` |
| `b7e00d0` | la píndola puja i les **col·leccions s'apropen** | l'aire de sota el recull el bloc, no la píndola |

### 2.5 La fitxa de producte (`255d545`)

**La causa del que l'amo veia («les fitxes són petites i el text desproporcionat»):**
els mockups són **quadrats** (800×800) i la fila de la imatge era **més baixa que
ampla**. Com que la imatge té `max-height: 100%`, quedava limitada per l'alçada i **no
arribava mai a l'amplada**: ocupava el 62 %.

Ara: la fila és **quadrada** (`aspect-ratio: 1/1`), la imatge ocupa el **94 %**, i la
fitxa treu l'alçada del contingut. I `TDP_MIDES_INTERIOR`, una constant compartida per
les dues pàgines, amb el selector de 64 a 39 px i el **cistell** a l'alçada del cos del
text del preu.

### 2.6 La píndola i els aires de l'inici (`22bcadc`, `d645953`, `0842d20`, `dd60633`)

**El `− 231` tret d'arrel.** L'alçada del bloc de cada galeria era
`carril × 0.84632 − 231`. A 1280 i 1024 el bloc era **més curt que la fitxa mateixa** i
la píndola hi quedava **a sobre** (28 i 58 px de xoc); a 1920 en sobraven 368 i quedava
massa lluny. Ara el bloc fa **l'alçada del contingut** i la píndola està **declarada**
(`top: calc(100% + 130px)`). **Fora tota la instrumentació**: `pillShiftPx`,
`galeriaShrinkPx`, `aireBaseRef`, el `useLayoutEffect` de mesura i la variable
`--hg-pill-shift`.

I els aires demanats per l'amo, **mesurats des del degradat**, que és el que es veu:

```
subtítol -> degradat   100 px
degradat -> píndola    100 px
píndola  -> títol      150 px
```

iguals a les cinc mides.

---

## 3. Els tres números que governen els aires de l'inici

Ara viuen en un sol lloc cadascun:

```
HOME_TITOL_TDP_MARGIN_PX = 130/130   -> 100 px del subtítol al degradat
top: calc(100% + 130px)              -> 100 px del degradat a la píndola
HOME_GALERIA_AIRE_SOTA_PX = 190      -> 150 px de la píndola al títol
```

I les dues constants que els acompanyen, amb el motiu escrit al codi:

- **`TDP_MIDES_INTERIOR`** — les sis proporcions interiors de la fitxa, compartides per
  l'inici i les col·leccions perquè no puguin divergir.
- **`HOME_COLLECCIO_MARGIN_PX = [129, 162, 104, 124]`** — els quatre marges calibrats a
  mà de les col·leccions 02 a 05, **pendents de substituir per un de sol** (vegeu §5).

---

## 4. On NO s'ha de mirar per mesurar (après a cops aquesta sessió)

Aquestes són les trampes que han costat hores avui. Valen per a la sessió següent:

1. **El degradat de la fitxa sobresurt 30 px** per dalt i per baix de la caixa. Mesurar
   des de la caixa dona 30 px de més. **Cal mesurar des del degradat.**
2. **El text pintat no comença al capdamunt de la seva caixa de línia.** El canvas diu
   24,5 px i el text pintat en fa 31: **cal mesurar el text pintat.**
3. **Els SVG porten marge mort a dins.** El cistell buit té el dibuix al 78 % de
   l'alçada del seu requadre (el ple, al 94 %) i el dibuix comença a y=12 del `viewBox`.
   **Cal mesurar el DIBUIX, no el requadre.**
4. **A `/cube` hi ha DUES graelles** (la del hero i la de la col·lecció). Mesurar-ne una
   de sola i concloure'n coses és un error que es va fer tres vegades.
5. **`cardProps` torna `{}`** quan no hi ha dades del producte (la última fitxa de cada
   galeria). Tot el que hi vagi a dins no arriba a aquella fitxa.
6. **Els fitxers es repeteixen cinc cops** (les galeries). Un buscar-i-substituir
   n'agafa una i deixa les altres quatre. **Cal comptar les ocurrències.**
7. **`position: absolute` dins un item de graella s'ancora al contenidor de la
   graella, no a la cel·la.**

---

## 5. El que queda, i per què no s'ha fet

### 5.1 Les proporcions (decisió de l'amo: «ja les arreglarem més endavant»)

**L'escala del disseny és `finestra / 1920`, sense terra:** 1,00 / 0,75 / 0,667 /
0,533 / 0,40. El carril ja l'escala exacta. **El que no escala:**

| peça | a 1920 | a 768 | hauria de ser |
|---|---|---|---|
| píndola | 39 px | **39 px** (no escala) | ~16 |
| fitxa | 320 × 505 | 259 × 418 | proporcionals |
| fitxa vs 1920 | 1,00 | **2,02** | 1,00 |
| els tres aires de §3 | 100/100/150 | **100/100/150** | 40/40/60 |

**I no n'hi ha prou d'escalar-ne un:** el degradat sobreeix 30 px fixos i el subtítol té
40 px propis. **Cal tot el tram alhora** o el resultat empitjora.

### 5.2 Les cinc seccions de l'inici (el següent pas acordat)

Els blocs 02 a 05 són **107 línies × 4** (el 05 en té 148) i gairebé tot és còpia: el
mateix embolcall, el mateix bloc de títol, els mateixos quatre `gridColumn`, la mateixa
píndola. **El que és diferent:** títol, subtítol, `href`, `slug`, `editableIdPrefix`, el
marge de dalt i els offsets del títol.

**Proposta:** una sola peça `HomeColleccio` amb el títol, el subtítol, la ruta, l'slug i
el número de fila. Els blocs passen a ~8 línies cadascun.

**Els calibratges a treure són els quatre marges (129, 162, 104, 124) i els pedaços que
el codi encara anomena** («+15 avall», «−1 fila amunt», «+20 avall»): el codi ja diu que
vol **190 px** (5 files del llenç: `5 × 74,53 × 0,51 = 190,0`). **Les distàncies no
s'esborren: s'unifiquen i s'escriuen una sola vegada.**

### 5.3 La resta del full de ruta

- **Fase 3-4:** una col·lecció i després les cinc. `CollectionVerticalPage` té **61
  posicions `top` en píxels fixos** i **10 marges negatius**: és el pou del pla.
- **Fase 5:** el constructor de col·lecció.
- **Fase 6:** la PDP.
- **Fase 7:** el header (3.196 línies, el megaslide a dins).
- **`TdpVariantsGallery`**: encara té el `− 231` i el patró vell (és la germana de la
  galeria de l'inici que s'ha arreglat avui).
- **El megaslide:** 135 calibratges «NO DEDUÏBLE» i 5 incoherències entre comentari i
  codi, inventariades a `MAPA-calibratges.md`.
