# PROMPT PER CONTINUAR — 04/10/2026 · Els flaixos en refrescar

Ets un agent que continua la feina d'adaptació del megaslide i la hero de la pàgina
`/nova/inici` del projecte **higginsgrafic-ecommerce-dev**. Aquí tens tot el context
per no haver de descobrir res.

---

## 1. On es treballa

- Repo: `.../ECOMMERCE-WEB/higginsgrafic-ecommerce-dev` (branca `main`).
- Servidor de desenvolupament: **http://127.0.0.1:3003** (Vite, `npm run dev`). És
  l'únic que hi ha; no n'aixequis cap altre.
- Pàgina: **`/nova/inici`**. Amb `?carril=1` surten les guies verdes del carril.
- **Visor de formats**: `public/browser-overlay.html` (obrir-lo amb
  `?ruta=/nova/inici`; la ruta per defecte és `/`, que és la pàgina VELLA i no té
  res d'això). Té un mosaic amb una pestanya per format i un botó «Recarregar tot».
- Convencions de la casa: comentaris en català amb data i la cita literal de l'amo;
  `npx eslint` i `npx vite build` nets (hi ha 2 errors **preexistents**:
  `maskType` a `MegaStripePanel.jsx` i un `setState` dins d'un efecte a
  `MegaMenuPanel.jsx`); **mai** desplegar, sempre commit i push.
  `src/index.css` i els colors de producte no es toquen.
- Verificació de no-regressió: `node scripts/_tmp-ipad13-abans-despres.mjs` imprimeix
  una línia per vista (13 vistes) amb la geometria de cada peça; `diff` contra una
  passa anterior ha de moure **només** les línies que toca.

---

## 2. El que s'ha fet avui (tot commitejat i pujat)

1. **Dues versions del megaslide** (`src/utils/layoutModel.js`,
   `MEGASLIDE_VERSIONS`): el nom de cada versió és el seu carril.
   - `megaslide-1100`: carril **1100**, per a 1032 vertical, 1180 i 1200
     (`aireStripeColumna: 3.6`, `extraAireSota: 6`).
   - `ipad-pro-13`: carril **1200**, només per a 1376 (`aireStripeColumna: 3.7`,
     `extraAireSota: 26`).
   - `versioMegaslide()`, `paramsMegaslide()`, `carrilMegaslide()` substitueixen
     `esIPadPro13()` i `carrilIPadPro13()`. `esIPadPro13Estricte()` (1032 i 1376) és
     el **dispositiu**, i el fa servir la hero.
2. **L'aire de sota del megaslide 1100**: de 40 a **20 px** (a l'iPad Pro 13 es
   queden els 40).
3. **La hero, als 8/10**, a tots els formats **horitzontals** de 768 en amunt: 1/10
   d'aire, 8/10 de franges, 1/10 d'aire, comptat **des del bottom del megaslide**
   (la vora del panell; el cadenat no ocupa espai dins del carril).
4. **El marge invisible del mockup**: el dibuix de la samarreta no arriba a les
   vores del fitxer (800×800): 18 px per dalt (2,25 %) i 33 per baix (4,13 %). La
   capa es corregeix amb `scale(1,0682)` i `-2,4 %` de desplaçament, a les **dues**
   capes (samarreta i dibuix de la col·lecció), i la samarreta omple les franges.
5. **La icona de barrejar**, centrada entre la cintura de la samarreta (0,775 de
   l'amplada de la imatge) i el cadenat, calculat al navegador.
6. **El mapa de mides dels dibuixos de la hero** (`HERO_DIBUIX_MIDA`, a
   `src/config/iniciNou.js`): les claus de Quotes eren rutes velles
   (`austen/<fitxer>` en comptes de `austen/quotes/<tinta>/<fitxer>`) i cap dibuix
   de Quotes agafava la seva mida (queien al 30 % de defecte). S'han posat les rutes
   bones i s'han afegit els **vuit blancs** que tenien parella negra afinada. La
   cerca de `HeroInici` prova la ruta i, si no, el **nom del fitxer**.
   **No** es passa a l'altra tinta (es va provar i desescalava el NX-01 blanc).
7. **L'estimació de la línia del megaslide** (a `MarcInici`): la de la banda de
   tauleta era `289 px` clavats i els canvis d'avui la van deixar a 244 (1024, 1280,
   1366), 279 (1180, 1200) i 310 (1376). Ara és la recta
   `0,2529 × carril + 5,3` per a `ample <= 1376` (el model hi entra) i es manté
   `0,1775 × carril + 111,3` per a escriptori.
8. **Les mides de la hero, fixades al CSS**: `MarcInici` publica
   `--inici-hero-alcada` i `--inici-hero-aire` amb un `calc` (les mateixes rectes de
   dalt), o sigui que el **primer pintat ja és el bo** i la mida no depèn ni del
   megaslide ni d'un efecte. Abans hi havia un **flaix**: en refrescar es pintava amb
   la mida vella (456,8 a 1376; 178,9 a 1280×586) i tot seguit canviava.

Últims commits: `abbf90b8` (les mides fixades), `e5e6b7bf` (informe),
`0fb83467`/`9878d79f` (l'estimació), `9fe3851a`/`05966216` (els blancs del mapa),
`3c71bf73`/`faec820c` (Quotes i la tinta germana), `2623cac9`, `e4f2df04`,
`00fbe808`, `4ea052d4`, `71eff2a7`, `936ddaec`, `42a41965`, `97467594`.

---

## 3. La feina que toca ARA: els flaixos en refrescar

L'amo ha enviat una **gravació de pantalla** (`Gravació de pantalla 2026-10-01 a les
21.28.57.mov`, 21,45 s, 4096×2271) on es veu el **visor amb el mosaic de 12
formats** i pregunta: «Mira, quan refresco, què passa. Això és perquè l'iframe té
retard o perquè carrega així de malament?».

**La resposta ja la sabem i és la meitat de la feina feta**: no és l'iframe. És que
la pàgina es pinta **en dues passades**: primer amb els valors estimats (o amb el
`fallback` del CSS) i, quan l'efecte de mesura arriba, es corregeix. La hero ja no
ho fa (punt 8 de dalt), però **la resta de peces sí**:

- el **repartiment de les cel·les** de `MarcInici` (`blocMega`, `blocPagina`), que
  depèn de la vora publicada `--hg-mega-bottom` i del seu efecte;
- les peces del megaslide que es mesuren després de muntar-se (la franja, el
  selector, la columna);
- la posició de la hero en els **verticals** (a 1032×1304 es mou 57 px en obrir el
  megaslide, perquè l'estimació del vertical, `0,585 × carril`, va curta: el valor
  real és `0,620 × carril`).

**Què cal fer**, per ordre:

1. **Reproduir-ho**: obrir `http://127.0.0.1:3003/nova/inici?carril=1` i, amb
   Playwright, mesurar la geometria de cada peça en una **línia de temps**
   (700 ms, 1,2 s, 2 s, 3 s, 5 s, 8 s) amb el megaslide tancat i amb
   `?active=first_contact` (que l'obre sol). Els valors que canvien entre el
   primer i l'últim mostreig són el flaix.
2. **Passar al CSS tot el que es pugui**, com s'ha fet amb la hero: si una mida es
   pot escriure amb un `calc` de variables que ja existeixen
   (`--inici-nou-carril`, `--appHeaderOffset`, `100dvh`, `--hg-mega-w`), el primer
   pintat ja serà bo i no caldrà cap efecte.
3. **El vertical**: recalibrar `0,585 × carril` amb el valor real (a 1032, 0,620) i
   tornar a mesurar.
4. **Comprovar que no es mou res**: la mateixa alçada de hero i la mateixa posició
   als quatre estats (càrrega neta, obert, tancat i refresc), i `diff` de la petjada
   de 13 vistes sense canvis inesperats.
5. Commit i push, i actualitzar
   `docs/informes/INFORME-2026-10-02-tablet-ipad-pro-13.md` (hi ha les seccions
   §3bis a §3septendecies amb tota la història i les mides).

---

## 4. Pendents que ja estaven anotats

- **Dibuixos sense mida al mapa**: els altres 37 blancs i molts de First Contact
  (`vulcans-end`, `plasma-escape`, `dj-vader`, `r2d2-quote`, `pont-del-diable`…)
  van amb el 30 % de defecte. Si l'amo en veu algun de malament, cal la seva mida.
- **La cintura de la franja a 5 px de la columna**: es manté amb
  `aireStripeColumna` de cada versió (3,6 i 3,7).
- **El clic als enllaços de la columna** de col·leccions: la superfície de clic de
  la franja (`superficiesDeFranja` a `MegaStripePanel`) només val per al model; als
  altres formats (1024, 1180, 1280, 1366) els dos enllaços de baix encara no reben
  el clic. És una línia (`esCarrilPagina1024` en comptes de
  `esCarrilPagina1024 && paramsMegaslide() != null`) i no mou cap píxel.
- **El vertical de l'iPad Pro 13 (1032×1304)**: les adaptacions no s'han començat;
  només hi arriba el que és comú.
- Els scripts `scripts/_tmp-*.mjs` i el pla `docs/informes/PLA-*.md` són l'eina de
  mesura; es poden fer servir i ampliar.

---

## 5. Com mesurar (receptes que ja funcionen)

- **Línia de temps d'una peça**:
  `await p.goto(...); await p.waitForTimeout(t); await p.evaluate(() => document.querySelector('[data-hero-caixa="1"]').getBoundingClientRect().height)`.
- **La vora del panell**: `getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-bottom')` (buida si el panell encara no l'ha publicada).
- **El carril**: `--hg-mega-w` (el del megaslide) i `--inici-nou-carril` (el de la pàgina).
- **Les mides del mapa**: `import('/src/config/iniciNou.js')` i `HERO_DIBUIX_MIDA`.
- **Els marges d'una imatge**: carregar-la en un `canvas` i buscar la primera i
  l'última fila amb alfa.
- **El visor**: `page.goto('http://127.0.0.1:3003/browser-overlay.html?ruta=/nova/inici')`;
  els iframes són a mida real (el zoom és un `transform`, no una mida falsa).
