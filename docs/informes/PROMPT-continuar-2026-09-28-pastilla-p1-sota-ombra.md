# PROMPT PER CONTINUAR — 28/09/2026 (la pastilla de la p1, sota l'ombra)

> **Per a un agent de codi que arriba nou.** No coneixes res d'aquest projecte:
> llegeix aquest document sencer abans de tocar cap fitxer. Hi ha l'encàrrec, les
> mides, la causa del problema i com es comprova.
>
> **L'arbre NO està net**: hi ha 1 fitxer modificat sense commitejar (una via
> morta, vegeu el punt 2) i **5 commits sense pujar**. Llegeix el punt 2 abans de
> res.

---

## 1. Com es treballa (acordat amb l'amo)

- El projecte és **higginsgrafic-ecommerce-dev** (React + Vite). El servidor de
  desenvolupament ja és engegat a **`http://127.0.0.1:3003`**: no es reinicia i
  **no se n'aixeca cap altre**.
- L'amo és **en Marc**, i treballa en **Firefox** en un iMac Intel. Les eines de
  mesura automàtica van amb **Chromium/Playwright**: el que jo mesuro i el que ell
  veu **pot diferir** (màscares SVG, `filter: blur`) i **ell és qui valida**.
- **Una cosa per commit.** Mentre s'itera un disseny, només el canvi i una
  passada ràpida d'errors de consola.
- **NO es llança la bateria ni es commiteja fins que en Marc diu que la
  modificació està acabada.** Això és una instrucció explícita seva: si no, no
  s'acaba mai. Quan digui «ja està», es llança TOTA la bateria (punt 9).
- La botiga **no està oberta al públic** encara, i **no està desplegada** des del
  16/09/2026 (vegeu el punt 2).

## 2. Estat exacte del repositori (28/09/2026, vespre)

- `HEAD` = **`11171d05`** (branca `main`), **5 commits sense pujar** respecte de
  `origin/main` (`bf3862c9`):

  | commit | què fa |
  |---|---|
  | `75d01a8f` | Els mockups, de Supabase Storage a local (545 MB → 36 MB) |
  | `daa97096` | Caché del catàleg: 3,02 MB per pàgina → un cop cada 5 minuts |
  | `d9b4cdcf` | La caché de les pujades, d'una hora a un any |
  | `16bbcfce` | La caché del catàleg, de 5 minuts a una hora |
  | `11171d05` | Informe de l'excés d'egress de Supabase i text del correu |

- **1 fitxer modificat sense commitejar**: `src/components/fullwide/MegaStripePanelP1.jsx`
  (+14/−3). És **una via morta meva** d'ahir: eixamplar 22 px la capsa de l'ombra
  i compensar-ne la màscara (`maskPosition: 'calc(50% - 2.1%) 0'`). **S'ha de
  revertir** abans de començar:

  ```bash
  git checkout -- src/components/fullwide/MegaStripePanelP1.jsx
  ```

  **Per què és una via morta** (punt 3): l'ombra de la p1 i la de la p2 ja tenen
  **exactament la mateixa capsa i la mateixa màscara** (acaben totes dues a
  x≈1413,9 i la pastilla comença a x1400,3: la tinta de l'ombra ja hi arriba).
  El que falla **no és la geometria, és l'ordre de pintat**.

- Escombraries al directori de treball: **585 guions `scripts/_tmp-*.mjs`**
  (commitejats, vegeu el punt 6) i **333 captures `_tmp-*.png`/`.webp` no
  seguides** a l'arrel del projecte.

## 3. L'ENCÀRREC PRINCIPAL: a la p1, la pastilla blanca ha de quedar SOTA l'ombra

### Què demana en Marc (cites literals)

- «A la p2, la pastilla blanca passa per sota de l'ombra, **no només de la
  samarreta**. A la p1 has aconseguit posar la pastilla per sota de la
  samarreta, però **no per sota de l'ombra**.»
- «Et puc suggerir que **imitis el que has fet a la p2**?»
- El seu diagrama de 3 columnes: a la columna del mig (el que vol) **la pastilla
  blanca és a sota de l'ombra**, i **l'ombra és a sota de la samarreta**.

Ordre de capes que vol, de baix a dalt: **pastilla blanca → ombra de la màniga →
samarreta (la franja) → text/botons del selector**.

### Les capes, avui (mides a 1920×946)

**Pàgina 2 (la bona).** `src/components/fullwide/CercadorTextRow.jsx`:

- la columna de col·leccions és a `zIndex: 3`, amb `overflow: hidden`,
  `borderRadius: 6px`, fons `#F3F4F6` i coixí de 3 px (rect `[1395.3, 88, 128.7, 251.6]`);
- **dins de la columna, en aquest ordre**:
  1. `data-maniga-ombra="1"` (línia 1382): `position: absolute`, `zIndex: 0`,
     `filter: blur(4px)`, `transform: translate(1px, 3px)`, màscara
     `mascaraManiga` a `103% 100%` i posició `50% 0`, fons `rgba(0,0,0,0.45)`.
     El seu rectangle mesurat és `[358.8, 229.6, 1055.1, 113]`, és a dir
     `left: -1038.5px` respecte de la columna i acaba a **x1413,9**;
  2. els **tres botons** de col·lecció (`data-colleccions-targeta`, línia 1421):
     `position: static` (**no posicionats**) i fons transparent; el **botó actiu**
     porta `backgroundColor: '#FFFFFF'` + `border: 1px solid #D1D5DB` +
     `borderRadius: 3` + `boxShadow: 0 1px 3px rgba(0,0,0,0.12)`.
- la franja de la p2 va a `zIndex: 4` (per damunt de la columna, perquè la
  samarreta tapi l'ombra).

**Pàgina 1 (la dolenta).** `src/components/fullwide/MegaStripePanelP1.jsx`,
bloc de la dreta (`[1395.3, 83, 128.7, 256.6]`; quadrat de fletxes a dalt,
`[1395.3, 83, 128.7, 128.3]`, i selector a baix, `[1395.3, 211.3, 128.7, 128.3]`):

- **capa de la caixa** (línia 792): `position: absolute; inset: 0; zIndex: 0` →
  conté la caixa (`ESTIL_CAIXA_BLOC_ALCADA_AUTO`, `estilsBlocs.js`) **i l'ombra**
  `data-maniga-ombra-p1` (línia 802), amb els **mateixos** números que la p2
  (`OMBRA_MANIGA_ALFA = 0.45`, `OMBRA_MANIGA_BLUR_PX = 4`,
  `OMBRA_MANIGA_OFFSET = { x: 1, y: 3 }`, a
  `src/components/megaslide/geometriaMegaslide.js:917-919`);
- **capa dels botons** (línia 870): `position: absolute; inset: 0; zIndex: 6` →
  conté el selector i les fletxes, i **per tant la pastilla blanca**;
- la franja de la p1 va a `zIndex: 4`.

I la pastilla blanca, a `src/components/fullwide/BlocDretaPagina1.jsx` (línia
132), és un `<span aria-hidden>` amb `position: 'absolute'` i **`zIndex: 1`**,
dins del `SelectorQuadratPagina1` (que és dins de la capa de `zIndex: 6`).
El rectangle mesurat de la pastilla és `[1400.3, 301.8 → 1519, 334.5]`.

### LA CAUSA (aquí està tot)

És **l'ordre de pintat de CSS**, no la geometria:

- a la **p2** la pastilla és un element **`position: static`**: el seu fons es
  pinta a la fase 3 de l'ordre de pintat (descendents de bloc en el flux),
  **abans** que els elements posicionats amb `z-index: 0` (fase 6). L'ombra és
  `position: absolute; z-index: 0` → **l'ombra es pinta damunt de la pastilla**.
  Exactament el que en Marc veu i vol;
- a la **p1** la pastilla és `position: absolute` dins d'una capa amb
  **`zIndex: 6`**, i la capa de l'ombra és a `zIndex: 0` → **la pastilla es pinta
  damunt de l'ombra**. Per això no s'hi veu mai.

I les capes forçades (caixa a `zIndex: 0` i botons a `zIndex: 6`) existeixen per
un motiu que **no es pot trencar**: en Marc va dir «Alguna cosa captura els clics
del selector». La franja (zIndex 4) cobreix tot el bloc amb la seva capa, i com
que els seus fills (el vel a z10 i el dibuix a z12) apilen **dins** seu, guanyen
a qualsevol `zIndex` que es posi al bloc; per això els botons es van treure a una
capa pròpia a `zIndex: 6` (comentari a `MegaStripePanelP1.jsx:858-869`).
**Els clics han de continuar funcionant.**

### LA SOLUCIÓ RECOMANADA (mínima i fidel a la p2)

**Moure NOMÉS la pastilla blanca** (el `<span>` blanc, amb la seva vora i la seva
`boxShadow`) de la capa de `zIndex: 6` a la **capa de la caixa (`zIndex: 0`), i
posar-la-hi ABANS de l'ombra al DOM**. Dins d'una mateixa capa, amb els dos
elements posicionats i sense `z-index` propi (o tots dos a `0`), **guanya el que
va més tard al DOM**: l'ombra quedarà per damunt de la pastilla.

- Els **botons** (les tres zones clicables, transparents, amb el text) es queden
  a la capa de `zIndex: 6`: els clics i el text no es toquen, i el text queda per
  damunt de la franja, que és el que ja funciona avui.
- La pastilla, en canvi, passa a quedar **sota la franja** (zIndex 4), com a la
  p2: la màniga de l'última samarreta li taparà els ~13 px de l'esquerra
  (1400,3 → 1413) i l'ombra li enfosquirà la resta de la vora. **És el que vol.**
- La pastilla té una **transició** (`transition: 'top 200ms cubic-bezier(...)'`)
  perquè llisca entre BLANC/COLOR/NEGRE: s'ha de conservar on acabi vivint.

Com ho pot fer, sense duplicar geometria: extreure la pastilla de
`BlocDretaPagina1.jsx` a una peça pròpia (p. ex. `PastillaBlancaPagina1`, amb
`topPct`, `inset` i el `transition`) i muntar-la des de `MegaStripePanelP1.jsx`
dins de la capa de la caixa, just abans de `data-maniga-ombra-p1`, passant al
`SelectorQuadratPagina1` un prop perquè **no** la pinti. El `sliderInset` actual
és `5` i la pastilla ocupa la casella activa (`ORDRE = ['white','color','black']`,
`slotPct = 33,33 %`).

**Alternativa que NO s'ha de fer**: apujar l'ombra per damunt dels botons
(`zIndex` > 6). Pintaria l'ombra sobre la samarreta, que és el que la franja
amaga a posta.

### Com comprovar-ho (abans de dir res a en Marc)

1. Captura de la p1 a 1920×946 amb la pastilla **COLOR** activa i compara-la amb
   la de la p2 (mateixa y): la vora esquerra de la pastilla ha de tenir la
   **mateixa corba de grisos** a les dues (a les captures d'en Marc la vall de la
   p2 és ≈205-238 i la de la p1 era ≈140-148, el doble de fosca; i al fons del
   bloc, p2 ≈215-245 i p1 ≈137-168).
2. Comprova que els **tres botons** del selector i les **dues fletxes** segueixen
   responent al clic (sobretot amb el selector a la meitat de baix, que és on la
   franja se'ls menjava).
3. `node scripts/_tmp-ancoratge.mjs` → ha de dir **TOT AL SEU LLOC** (l'ordre de
   pintat no ha de moure ni un px de res).

## 4. Pendent 2: el contorn de la samarreta a la p1

En Marc, al mateix diagrama: «has tret tot el contorn de la samarreta i **només
ha de sortir la màniga**». Sospito que vol dir que sobre el bloc de la dreta de
la p1 no s'hi ha de veure el cos de l'última samarreta (el seu contorn), sinó
només el bec de la màniga. **No ho donis per fet: pregunta-ho abans de tocar-hi
res.** Coses que hi poden tenir a veure:

- la caixa del bloc porta una vora pintada (`boxShadow: '0 0 0 1px #D1D5DB, ...'`
  a `ESTIL_CAIXA_BLOC_ALCADA_AUTO`, `src/components/fullwide/estilsBlocs.js`);
- els `path` de les siluetes de la franja ja porten `stroke="none"`
  (`MegaStripePanelP1.jsx:1194`);
- la silueta 14 de `public/placeholders/t-shirt_buttons/v5/full-clic-area-5.svg`
  (viewBox `0 0 2866 307`) té el bbox `2623,6 → 2865,3`.

## 5. Pendent 3: el bec de la màniga de la franja

En Marc va dir «La imatge és completa. No hi falta cap part». Les mides, ja
preses, per si torna a sortir:

- `public/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp` i
  `full-white-stripe.webp` fan **2866×307**; la tinta comença a **x=63** i arriba
  a l'última columna (x=2865);
- el pas de les siluetes és de **201,82 px**; la franja a 1920 va de x357,9 a
  x1413 (escala 0,368) i la tinta de la darrera samarreta acaba a **x1412,96**;
- el perfil de la vora dreta és un **bec de màniga en diagonal** (x=2800: 283 px
  foscos; x=2815: 97; x=2830: 70; x=2845: 39; x=2860: 10);
- el patró **no és periòdic** (desplaçar la imatge 200-204 px dona una diferència
  mitjana de 190-200 contra 0 a desplaçament 0): **no es pot reconstruir res
  copiant una samarreta veïna**.

## 6. Pendent 4: netejar les escombraries

- **585** guions `scripts/_tmp-*.mjs` **commitejats** (cada un és una mesura d'un
  dia; n'hi ha de valuosos, com `_tmp-ancoratge.mjs`, `_tmp-errors2.mjs` i
  `_tmp-franja-mesura.mjs`, i molts de morts). Cal un criteri i **el vistiplau
  d'en Marc** abans d'esborrar-ne cap: proposa una llista.
- **333** captures `_tmp-*.png`/`.webp` **no seguides** a l'arrel: aquestes es
  poden esborrar sense por (no són al repo). **Atenció**: `scripts/_tmp-periode.mjs`
  és una eina de debò i ja es va sobreescriure un cop per accident; no esborris
  res de `scripts/` sense llegir-ho abans.

## 7. Pendent 5: pujar i desplegar (quan en Marc digui)

1. **Pujar els 5 commits** a `origin/main` (no estan pujats).
2. **Desplegar a Netlify**: `npx netlify deploy --prod` (desplegament manual;
   l'últim va ser el 16/09/2026). El CLI escriu a `~/Library/Preferences/netlify`,
   o sigui que **cal permís d'escriptura fora de l'espai de treball**.
3. **Desplegar `supabase/functions/upload-media`**: el codi ja porta
   `cacheControl: "31536000"`, però **no està desplegat** perquè falta un **token
   d'accés de Supabase** (ho ha de fer en Marc o donar-lo).
   *Nota*: la funció puja PNG sense convertir a WebP.
4. Opcional, si en Marc ho demana: apujar encara més la caché del catàleg o
   servir-lo com un JSON estàtic.

## 8. Supabase: què ja està fet (NO ho repetiu)

Projecte `jnuuejlxuyqhhkfucuxg`, org `higginsgrafic`, pla Free. Va arribar un
avís d'egress: **11,94 GB de 5,5 GB** en 3 dies.

- **Causa trobada**: cada càrrega de pàgina demanava
  `/rest/v1/products?...product_variants(*)` = **3,02 MB**; unes 125 càrregues al
  dia ≈ 380 MB/dia. Arreglat amb caché de client de 5 min → **1 hora**
  (`src/api/supabase-products.js`, `CACHE_PRODUCTES_MINUTS`).
- **Storage buidat**: bucket `media` de **545,5 MB → 0**. Els 307 PNG s'han
  convertit a WebP **en local** (36 MB a `public/custom_logos/mockups/`, que és
  al repo) amb `scripts/mockups-a-local.mjs`. Les 152 files de `product_mockups`
  apunten a fitxers locals que existeixen.
- **Etiqueta de col·lecció** `outcasted` renombrada a `miscellania` (55 files).
  Repartiment actual: `{"first-contact": 85, "miscellania": 55, "proves": 12}`.
  El slug de la botiga per a aquesta col·lecció és `first-contact` (amb guió) a
  `src/config/collectionVertical.js`: **no cal cap reanomenament**.
- **Caché de les pujades**: `src/api/storage.js` i la funció passen de `'3600'` a
  `'31536000'`. El bucket `media` ja es veia amb `Cache-Control: no-cache`.
- Informe i correu (ja enviats, sense captures):
  `docs/informes/INFORME-2026-09-28-supabase-egress.md` i
  `docs/informes/INFORME-2026-09-28-supabase-correu.md`.
- `public/_headers` i `netlify.toml` ja donen `max-age=31536000, immutable` a
  `/assets/*`, `/placeholders/*`, `/custom_logos/*`, `/product_episodes/*` i
  `/video/*`.

## 9. La bateria (NOMÉS quan en Marc digui «ja està»)

En aquest ordre, i tot ha de sortir bé:

1. `npx vitest run` → **595 proves / 46 fitxers**
2. `npx eslint <fitxers tocats>` → els comptes han de ser els de `HEAD`. Per
   tenir la referència exacta: `git stash` → `npx eslint <fitxer>` → `git stash pop`
   (apunts del 28/09: `CercadorTextRow.jsx` **0/9**, `MegaStripePanelP1.jsx` 3,
   `MegaStripePanel1.jsx` 4/10, `MegaslidePagina2.jsx` 0/7)
3. `npx vite build`
4. `npm run compara-vistes` → ha de dir **OK**
5. `node scripts/mesura-formats.mjs` → **0 i 0**
6. `node scripts/_tmp-errors2.mjs` → **cap error**
7. `node scripts/_tmp-ancoratge.mjs` → **TOT AL SEU LLOC** (10 peces a 1920×946).
   Si un canvi mou peces de debò, s'actualitzen les referències del mateix
   guió **i s'explica al missatge del commit**.

## 10. Fitxers i eines que et caldran

| fitxer | què hi ha |
|---|---|
| `src/components/fullwide/MegaStripePanelP1.jsx` | la franja i el bloc de la dreta de la **p1** (capa caixa a z0 amb l'ombra, capa botons a z6, scroll de la franja) |
| `src/components/fullwide/BlocDretaPagina1.jsx` | `SelectorQuadratPagina1` (les 3 caselles i **la pastilla blanca**) i `FletxesQuadratPagina1` |
| `src/components/fullwide/CercadorTextRow.jsx` | la graella/carrusel de la **p2** i la **columna de col·leccions amb l'ombra de referència** |
| `src/components/fullwide/estilsBlocs.js` | les caixes dels blocs (`ESTIL_CAIXA_BLOC`, `ESTIL_CAIXA_BLOC_ALCADA_AUTO`) |
| `src/components/megaslide/geometriaMegaslide.js` | `OMBRA_MANIGA_ALFA/BLUR_PX/OFFSET` (línies 917-919) i tota la geometria |
| `src/components/fullwide/MegaStripePanel.jsx` | la franja compartida amb la p2 |
| `scripts/_tmp-ancoratge.mjs` | les 10 mides de referència de les dues pàgines a 1920×946 |
| `scripts/_tmp-franja-mesura.mjs`, `scripts/_tmp-mesura-centratge-franja.mjs` | mesures de la franja |

**Regla d'or**: una cosa per commit, la bateria al final, i **no es commiteja ni
es desplega res fins que en Marc confirmi que la modificació està acabada**.
