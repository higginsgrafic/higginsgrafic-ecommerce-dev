# PROMPT — bucle fins que la feina estigui resolta (26/09/2026, vespre)

Ets un agent que continua la feina d'un altre al projecte
**higginsgrafic-ecommerce-dev** (React 19 + Vite). Aquest prompt es un **bucle**:
no aturis fins que tot el que hi ha a baix estigui **fet, mesurat, comitejat i
pujat**, o fins que topis amb una decisio que nome's pugui prendre l'amo (llavors
pregunta i para nome's aquell punt, no la feina).

El servidor del 3003 **ja corre** i es el de l'amo: no l'aturis ni n'aixeques
cap altre. Els guions de Playwright el fan servir.

---

## 0. El bucle (aixo es el que has de fer, torn rere torn)

Cada volta:

1. **Llegeix l'estat**: `git log --oneline -6` i `git status --short`. Si hi ha
   coses sense comitejar que no siguin `_tmp-*`, decideix si son teves (acaba-les)
   o no (deixa-les).
2. **Mesura abans de tocar** amb un `scripts/_tmp-*.mjs` (els utils d'aquesta
   feina son al final). Apunta els numeros d'abans.
3. **Fes UNA cosa** de la llista de la seccio 2 (la primera que no estigui feta).
4. **Torna a mesurar** i compara amb els d'abans.
5. **Passa la bateria** (seccio 3). Si no passa, arregla-ho o desfes.
6. **Comiteja** nome's allo que estigui quadrat i verificat, amb el missatge en
   catala, la causa i les xifres abans/despres. **`git push`** (hi ha permis
   permanent).
7. **Torna al punt 1.** No demanis permis per continuar.

Si una cosa no es pot deixar quadrada i verificada: **es desfа** (`git checkout
-- fitxer`), s'escriu al pla **que s'ha trobat** (la mesura exacta i on es va
encallar), i es passa al seguent punt de la llista. **No es comiteja mai** un
canvi a mitges ni res que no hagis vist funcionar.

**Quan la llista sigui buida:** torna a llegir la seccio 2 i comprova que totes
les xifres son les que l'amo va demanar (les taules de la seccio 4). Si alguna no
hi es, torna-hi. Si tot hi es, escriu l'informe de sessio (seccio 5) i para.

---

## 1. Llegeix primer (en aquest ordre)

1. `docs/informes/COM-TREBALLO.md` — com es treballa amb aquest amo (to, bateria,
   el que l'empipa).
2. `docs/informes/PLA-neteja-calibratge-megaslide.md` — tot el context. Les
   seccions **10.1 a 10.5** son la feina oberta.
3. Aquest mateix document, sencer.

L'amo es **no tecnic** pero **sap el que veu**: si diu «aixo balla», te rao. Escriu
en catala, curt, amb taules de xifres, i digues sempre **que li toca a ell**
(un F5, mirar-ho, decidir).

---

## 2. La feina (en aquest ordre)

### 2.A · Pagina 2: tres canvis que l'amo ha demanat

Sobre la captura del 26/09 a les 22:16. S'han de fer **un per commit**.

1. **La columna de colleccions es un selector que ocupa tota la columna.** A la
   captura, la columna (FIRST CONTACT, THE HUMAN INSIDE, PEMBERLEY HOUSE, KEEP
   CALM, QUOTES, CROSSWORDS, LOOKING FOR MY D., CUBE, MISCEL·LÀNIA) te una
   pastilla grisa nome's a la fila activa. L'amo la vol com **un sol selector**
   (una pastilla que ocupa tota la columna, amb el nom actiu dins). Es a
   `CercadorColleccionsColumna` (`caixes`, la taula de la vista vertical, i
   `linia`, la filera) i a `CercadorTextRow.jsx`. **Pregunta-li nome's si dubtes
   de quina de les dues vistes vol dir**; mira la captura abans.
2. **El fons de les fletxes desapareix i les fletxes es centren en el seu
   quadrat.** El bloc de fletxes (`#stripe-guide-right-anchor`,
   `FirstContactDibuix09Buttons` a `firstContactPanels.jsx`) porta un
   `bg-muted` que s'ha de treure; i els dos chevrons han de quedar centrats dins
   de la meitat que els toca (ara van a `1/3` i `2/3` del bloc,
   `absolute left-1/2 top-1/3` i `top-2/3`, i l'amo els veu descol·locats).
   **Atencio**: el mateix component el fa servir la pagina 1 a la malla vella;
   si el toques, mira que les dues pagines quedin be (o fes una peca nova, com
   s'ha fet amb el selector: vegeu `BlocDretaPagina1.jsx`).
3. **La maniga de la franja ha de sortir per sobre del selector amb una
   ombra.** El selector nou de la columna trepitja la maniga de la stripe:
   l'amo vol que **la maniga quedi per sobre** del selector i que hi hagi una
   **ombra** que ho separi. Es a `CercadorColleccionsColumna` / `CercadorTextRow`
   (l'ordre de capes) i a la franja (`MegaStripePanel`, la imatge de la tira).

### 2.B · Pagina 1: la composicio, com la de la pagina 2

**Paraules de l'amo** (26/09, 22:30):
> 1. Passa el selector a la franja inferior i alinea'l a la dreta del carril.
> 2. Alinea la graella a l'esquerra del carril.
> 3. Alinea les fletxes (per cert, s'han fet minuscules) a la dreta del carril.
> 4. Allarga la graella fins a les fletxes (amb el seu corresponent gap, 10px).
> 5. Converteix la graella en una graella intercalada, de dues fileres, com la
>    de la pagina 2, pero que ocupi tota l'alçada de les fletxes.

I despres, perque l'agent anterior ho va complicar:
> «No has de convertir la graella de 9 en una altra graella. L'has de
> substituir. Si fa falta fes un selector nou.»
> «La graella intercalada ja la tens feta. Nome's l'has de duplicar.»
> «Si a la pagina 2 hi cap, tambe hi ha de cabre a la pagina 1, ja que les files
> han de ser identiques.»

**Peçes noves ja fetes i pujades** (`82c81b3`), d'us nome's de la p1:

- `src/components/fullwide/BlocDretaPagina1.jsx` →
  `SelectorQuadratPagina1` (el selector quadrat) i `FletxesQuadratPagina1` (el
  bloc de fletxes quadrat).
- `src/components/fullwide/GraellaDuesFileresPagina1.jsx` → l'adaptador que
  **duplica** `CercadorDibuixosGraella` (la graella de la p2) amb
  `reservaDreta: 0`.

**El que falta es MUNTAR-HO** a `MegaStripePanelP1.jsx`: substituir la malla de
nou columnes (`MegaColumn`, nome's per a la vista vertical) per la graella
duplicada a l'esquerra i el bloc de la dreta a la vora dreta del carril.

**On es va encallar l'intent anterior, i la pista bona** (al pla, seccio 10.5):
en muntar-ho, el carrusel es pintava amb **amplada i alçada ZERO**
(`graella y84 1072x0`, bloc de la dreta 1,9x3,8) perque **`carrilPx(110)` dins
d'aquella filera tornava 1,89 px**: la variable `--hg-mega-w` no resol en aquell
punt de l'arbre. **Abans de calcular-hi res, mesura `--hg-mega-w` en aquell
node** (`getComputedStyle(el).getPropertyValue('--hg-mega-w')`) i, si no hi es,
passa l'escala del carril com a prop (o fes servir les mateixes proporcions que
la p2, que alla si que resolen).

**Xifres que han de quedar** (1920x946, carril x381..1524, 1143 px):

| peça | valor |
|---|---|
| graella: esquerra | x381 (la vora del carril) |
| bloc de la dreta: vora dreta | x1524 (la vora del carril) |
| gap graella-fletxes | 10 px |
| **les files** | **identiques a la p2**: peça 44,63 px; fila de dalt al centre de la cel·la BLANC, fila de baix al de la COLOR (a la p2: 125,3 i 164,9, i 0,6/0,0 px de diferencia amb les cel·les) |
| bloc de la dreta | el selector quadrat a dalt i les fletxes quadrades a sota, tots dos de la mateixa amplada |

---

## 3. La bateria (abans de cada commit, i no se'n pot saltar cap)

```bash
npx vitest run                      # 576 proves (45 fitxers) al punt de partida
npx eslint <fitxers tocats>         # nome's els tocats; els comptes NO poden pujar
npx vite build
npm run compara-vistes              # HA DE DIR «OK»
node scripts/mesura-formats.mjs     # HA DE DIR «0 i 0»
node scripts/_tmp-errors2.mjs       # HA DE DIR «cap error»
```

Linies base d'`eslint` (26/09/2026): `MegaStripePanel.jsx` 4 errors/11 avisos,
`FullWideSlideHeader.jsx` 15/12, `TambeRail.jsx` 5/2, `PdpPage.jsx` 3/7,
`MegaStripePanelP1.jsx` 3/0, `firstContactPanels.jsx` 0/0. Els fitxers nous han
de quedar **nets**. Per comparar amb `HEAD`, `git stash` + eslint + `git stash
pop`.

**Cada numero nou** es declara a `src/components/megaslide/geometriaMegaslide.js`
com una **funcio pura**, documentada en catala, amb la prova a
`tests/unit/geometria-megaslide.test.js` i la mesura abans/despres al comentari.

**Els `scripts/_tmp-*.mjs` i els `_tmp-*.png` NO es comitegen mai.**

---

## 4. Les coses que no es poden moure

- **La pagina 2 es el punt estable `26442f5`** (i despres `7e0a696`, `768fb0e` i
  `3885df4`): si un canvi seu es desquadra, es torna enrere i es diu.
- **`--hg-mega-w` i `--hg-mega-x`** les fan servir la capcalera, el megaslide i
  el rail de la PDP: tocar-ne una mou les altres. Abans de tocar una mesura
  compartida, `grep` de qui mes la llegeix.
- **El servidor del 3003 no es toca mai.**
- **Una cosa per commit**, missatge en catala amb la causa i les xifres.
- Si una cosa no es pot acabar: **es desfa i es diu**, amb les xifres.

---

## 5. Quan acabis

Escriu `docs/informes/INFORME-26-09-2026-pagina1.md` amb: estat, que s'ha fet
amb la causa i les xifres de cada cosa, **les trampes** (el que has provat i no
ha sortit, i per que), el que queda obert, i els numeros de referencia. Comiteja'l
i puja'l. Despres digues a l'amo, en quatre linies: que ha de mirar (F5) i que li
toca decidir.

---

## 6. Els guions temporals utils (ja al disc, no es comitegen)

- `node scripts/_tmp-p1-composicio.mjs` — selector, graella, fletxes i franja de
  les dues pagines amb xifres.
- `node scripts/_tmp-franja-2p.mjs` — els centres de les peces/blocs de les dues
  pagines a 1920, 1440, 2560, 1366x768 i 1024x768 (es la xifra de referencia de
  l'alineacio).
- `node scripts/_tmp-files-2p.mjs` — cel·les del selector i files de dibuixos.
- `node scripts/_tmp-relacio-files.mjs` — la relacio files <-> selector de la p2.
- `node scripts/_tmp-selectors-2p.mjs` — la forma del selector de cada pagina.
- `node scripts/_tmp-p1-nou.mjs` — la graella nova i el bloc de la dreta de la p1
  (el que va sortir a zero).
- `node scripts/_tmp-errors2.mjs` — errors de consola (bateria).
- `node scripts/_tmp-vel-svg.mjs`, `_tmp-vel-aïlla.mjs`, `_tmp-vel-cobriment.mjs`
  — el vel i la seva mascara (ja resolt a `768fb0e`, per si es torna a tocar).
- `node scripts/_tmp-p2-retall.mjs miscellania` — captura de la franja de la p2 a
  3x, per mirar-la de prop.
- `node scripts/_tmp-retalla.mjs <png> <x> <y> <w> <h> <factor> <desti>` — retall
  i ampliacio d'una captura (per mirar el que veu l'amo).
