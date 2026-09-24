# PROMPT PER CONTINUAR LA SESSIÓ

> Copia i enganxa això tal qual com a primer missatge de la sessió nova.
> **Data de redacció:** 24/09/2026 · **Últim commit:** `10669cd` · **Arbre net i pujat.**

---

Treballes al projecte **higginsgrafic-ecommerce-dev**
(`/Users/marc/EXTRA LOCAL/PROJECTES LOCAL/GRUP HIGGINS/GRÀFIC/BOTIGUES/ECOMMERCE/PROJECTE/ECOMMERCE-WEB/higginsgrafic-ecommerce-dev`).

## PRIMER DE TOT

Llegeix aquests documents i no facis res més fins a haver-los llegit:

1. **`docs/informes/TESTIMONI-2026-09-23.md`, secció 4** — «On NO s'ha de mirar per
   mesurar». Són set trampes que van costar hores. Val més que la resta del document.
2. **`docs/informes/INFORME-sessio-2026-09-23-vespre.md`** — la sessió anterior, amb la
   causa de cada cosa i cinc trampes més.
3. **`docs/informes/FORMATS-desplegament.md`** — els 46 formats que s'han de cobrir, què
   en fa el codi i els sis forats que es van tancar.
4. **`docs/informes/INFORME-formats-orientacions-breakpoints.md`** — els formats, les
   orientacions i els breakpoints, amb la matriu de dispositius del DevTools.
5. **`docs/informes/PLA-versio-tauleta-megaslide.md`** — **la feina oberta de l'amo.**
6. **`docs/informes/MAPA-calibratges.md`** i **`docs/constitucio.md`** (sobretot la
   regla 15: «Pedaços, si es poden evitar, no»).

## LA FEINA ONADA

**L'amo vol fer una versió TAUETA del megaslide** i no sap com enfocar-la. El pla és a
`PLA-versio-tauleta-megaslide.md`, i la conclusió és aquesta:

- El problema **no és cap breakpoint, és la DENSITAT**: a la tauleta vertical la pauta fa
  caselles de **57×93 px** i la taula vertical (5×3) en fa **137×137**. Amb el dit, 57 px
  no es pot encertar, i a sobre hi competeixen el selector, els dibuixos i la franja.
- La proposta: una **taula de caselles grans amb UNA decisió per casella** (la retícula
  5×3 que ja existeix a `TaulaVertical.jsx`), i **res de posar-hi les peces de l'escriptori
  a dins** (una graella dins d'una graella és el que la fa densa).
- **El primer pas és de paper:** un mapa de 15 caselles per a cada pàgina (col·leccions,
  cerca, cistell, compte) amb una etiqueta a cada casella. Sense codi.

## L'ESTAT MESURAT (24/09/2026)

### La capçalera i el carril

| | valor | nota |
|---|---|---|
| `--appHeaderOffset` | **80** a escriptori, mòbil i tauleta **apaïsada**; **123** a la tauleta **vertical** | 123 = 61 + 62 (les dues files); la seva capçalera fa 123 de veritat |
| `--hg-mega-w` (carril) | **992** congelat de 768 a 1366; `70.3vw` de 1367 en amunt (sostre 1350) | a l'apaisada amb la finestra < 992 es limita a la finestra − 32 |
| `--site-w` | el marc del lloc a la vertical (768 → 736) | la capçalera de la vertical va amb aquest, no amb el carril |
| el cadenat | penja **56 px** (`CADE_BAIXADA`) sota la vora del panell | |
| la barra dev | **fora de les pàgines del lloc**; només a admin i eines | l'accés a `/admin` és una icona dins la capçalera, a l'esquerra del logo |

### La pàgina nova (`/nova/inici`)

- El repartiment de dalt es calcula a `src/components/home/MarcInici.jsx`: `blocMega` (les
  files del megaslide) + `blocPagina` (la resta), amb `divisionsDeLaLinia()`.
  A 1920 dona **11/28** amb la barra dev i **3/8** sense; a 768 vertical, **8/17**.
- **La hero** (`src/components/home/HeroInici.jsx`): alçades naturals **428** (1920),
  **321** (1440), **314** (1024/1280/1366) i **311** (768).
- **On acaba el seu fons** (estat d'ara): **al fons del viewport** a 1280 i 1366
  (condició: `1280 <= innerWidth <= 1366`, i és l'únic que s'hi toca); **per sota** a 1024
  (74 px), 1440 (36) i 1920 (34); i 10 px abans del fons a 768.
- **El preu, acceptat per l'amo:** a 1280/1366 amb finestra baixa (586/634) el cap de la
  hero queda darrere la vora del megaslide i el cadenat flota damunt seu.

### Les DUES fronteres de mòbil (i el que s'hi va fer)

- `useDeviceLayout` i `layoutModel` diuen mòbil = **< 600** (barra inferior, alçada de
  capçalera). `useIsMobile` i el `md:` de Tailwind diuen **< 768** (icones de la capçalera,
  i si la pàgina pinta contingut).
- Entre 600 i 767 no era ni una cosa ni l'altra: **sis formats sense cap manera d'obrir el
  cistell** (Galaxy S9/S9+ i S10/S10+ girats, iPhone SE girat, Galaxy Tab S9 i iPad Mini 6).
- **Arreglat sense moure cap frontera** (opció C): les tres classes `min-[600px]:` del
  `FullWideSlideHeader` (el logo i les icones surten des de 600) i la reserva de la franja
  sense classificar a 80 px (abans 64, la constant `ALCADA_CAPCALERA_ESTRETA`, eliminada).
  `mesura-formats.mjs` ara diu **0 formats sense cistell**.

## LES EINES (i com es fan servir)

- **`node scripts/mesura-formats.mjs`** — els 48 formats, un per un: alçada de capçalera,
  segona fila, icones, cistell, barra inferior i si la pàgina nova hi pinta. **Ha de dir
  sempre `SENSE CAP MANERA D'OBRIR EL CISTELL (0 formats)`.**
- **`npm run compara-vistes`** — vigila el megaslide (vertical 768 vs apaïsat 1024 vs 1366
  vs escriptori 1440). Ha de dir **OK amb les mateixes xifres** (dibuix 20,89, gap 17,91,
  cercle 18,89, samarretes 101,6 a les tauletes).
- **`public/browser-overlay.html`** — l'eina de formats: una **pestanya principal** amb el
  mosaic de les pantalles obertes, **una pestanya per format** (allà només hi ha el seu
  format), acordió per triar formats, **filtre verticals/horitzontals**, zoom i ajust
  (ample/alt/totes iguals), sostre de vistes vives, i els marcs que **es queden muntats**.
  Cada etiqueta diu **l'amplada que veu la pàgina de dins** i **l'hora de càrrega**.
- **`docs/finestra-navegador.html`** — una finestra de treball de debò amb iframe
  (`?ruta=`, `?barra=`).

## LES TRAMPES QUE JA ENS HAN COSTAT (no repetir-les)

1. **Els marcs vells de l'overlay.** Es queden muntats a posta, i per tant **no agafen sols
   el codi nou**: si l'amo diu «no s'ha mogut res», el primer sospitós és això. Es prem
   **Recarregar tot** (o F5 a l'overlay). L'etiqueta diu l'hora per saber-ho.
2. **Un mòdul que no compila.** Un `const` duplicat dins la mateixa funció va fer que Vite
   retornés **500** per `MarcInici.jsx`: la pàgina no renderitzava i jo mesurava una altra
   cosa. Abans de creure's una mesura, comprovar que el mòdul és viu:
   `curl -s -o /dev/null -w '%{http_code}' 'http://127.0.0.1:3003/src/components/home/MarcInici.jsx'`
   ha de donar **200**.
3. **Les xifres exactes d'amplada no existeixen en un Mac.** Les finestres fan 1512, 1728
   o 1440; amb el DevTools acoblat o la barra de desplaçament, mai no cau la xifra rodona.
   Per això les condicions per amplada es fan amb **franges**.
4. **Un element flex s'arronsa sol** quan no hi cap, i això canvia la mida de la hero. Si
   la mides abans i després, comprova l'alçada, no només el `top`.
5. **El carril no pot ser més ample que la finestra.** A 768-932 apaïsat el carril de 992
   forçat feia que les icones de la capçalera caiguessin **fora de la pantalla**.
6. **`calc` amb variables de CSS no viatja**: el que s'hereta és el resultat, no el càlcul.
   El layout d'aquesta pàgina es calcula a JS i es publica per l'estat de React.
7. **`style.setProperty` des de JS el pinta React a sobre.** Les xifres han de viure a
   l'estat i sortir per l'atribut `style`.

## LA BATERIA, SEMPRE

```
npx vitest run            # 497 proves
npx eslint <fitxers tocats>   # 15 errors preexistents a FullWideSlideHeader.jsx; NO n'hi pot haver de nous
npx vite build
npm run compara-vistes    # OK amb les mateixes xifres
node scripts/mesura-formats.mjs   # 0 formats sense cistell
```

El servidor del **3003 ja està engegat** (vite dev): no n'engeguis cap altre.

## COM TREBALLA L'AMO

- Tot en **català**; els identificadors amb `cella` (sense punt volat) i la prosa amb
  `cel·la`.
- **Una instrucció alhora.** Quan diu «només això», és només allò: si s'amplia l'abast, es
  queixa (i amb raó).
- Vol **causes**, no pedaços, i **mesures abans i després**. Els commits expliquen la causa.
- Els guions temporals van a `scripts/_tmp-*.mjs` i **no es commiten mai**.
- Verifica a les cinc mides de sempre: 1920×1080, 1440×900, 1280×720, 1024×768 i 768×1024.

## ALTRES COSES OBERTES

- **La pàgina nova no té vista mòbil**: per sota de 768 mostra un missatge.
- **El menú de col·leccions de la tauleta vertical talla** per sota de 698 px d'amplada.
- **Els formats apaïsats de 640 a 767** obren el megaslide on no hi cap (panell de 95-108 px
  i una graella de colors de 26 px). Ni la pauta ni la taula de la tauleta hi caben: el
  candidat és el **full de mòbil**, com fa el mateix telèfon en vertical. Sense decidir.
- **1280/1366**: la guia diu escriptori i el projecte els tracta de tauleta apaïsada; el
  carril fa un salt a 1367 (992 → 961). Sense decidir.
- **`srcset`/`sizes`**: les variants existeixen (42 imatges amb `-400w`/`-800w`/`-1200w`) i
  al codi hi ha **0 `srcset` i 0 `<picture>`**.
- **La migració de la capçalera (fase 7)** no està feta, i el peu encara té una excepció a
  `App.jsx`.

## ELS ÚLTIMS COMMITS

`10669cd` La franja és 1280-1366 · `8d4a263` la franja i l'amplada a l'etiqueta ·
`dbf8cbb` l'hora de càrrega · `b8ff632` «Recarregar tot» · `2a774bd` i `ec4bea2` la hero al
fons · `856946c` el carril de l'apaisada · `ba9849b` la llista de formats no s'amaga ·
`c219e3e` i `9eb8de0` l'overlay refet.
