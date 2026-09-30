# Prompt per continuar — Higgins GRÀFIC (megaslide p1/p2 i inici nou)

## Entorn

- Projecte: `ECOMMERCE-WEB/higginsgrafic-ecommerce-dev` (Vite + React 19 + Tailwind 3.4).
- Servidor de proves ja engegat: `http://127.0.0.1:3003` (job `bash-3`). No n'engeguis un altre que comparteixi `node_modules`.
- L'amo treballa en un **Mac**: les dreceres de teclat s'han de mirar amb `e.code`, no amb `e.key` (Opció+C dona `ç`).
- Convencions de casa: codi i comentaris en català, amb data i la cita textual de l'amo; `npx eslint` i `npx vite build` nets; `node scripts/verifica-tokens-color.mjs` OK; no tocar `src/index.css`, `src/config/`, ni els colors de producte; **commit i push sempre, desplegar mai**.
- Eines de mesura fetes servir (a `scripts/_tmp-*.mjs`, Playwright): `_tmp-bloc-p1.mjs` (bloc, fletxes, selector, franja de la p1 contra la de la p2), `_tmp-centrat-p2.mjs` (aires i gaps de la p2), `_tmp-hero-mides.mjs`, `_tmp-nav-mides.mjs`, `_tmp-doble-header.mjs`, `_tmp-err3.mjs` (errors de consola), `_tmp-guies2.mjs` (guies), `_tmp-franja-qui.mjs` (qui pinta la franja del bloc).

## Estat verificat (02/10/2026)

Composició estreta (1024-1366) i ampla (1440/1920):

| | 1024 | 1280 | 1366 | 1440 | 1920 |
|---|---|---|---|---|---|
| hero (ample) | 665,5 (abans de la reducció) | 569,3 | 608,3 | 641,3 | 857,3 |
| aire dalt/baix del bloc p2 | 15 / ~15 | 15 / 14,7 | 15 / 14,9 | 29,7 / 30,3 | 34,3 / 30,5 |
| stripe p1 = stripe p2 | 938,9 | 794 | 848,5 | 789,6 | 1055,1 |
| bloc p1 (quadrat) | 96,5 × 96,5 | 128,7 × 128,7 | 128,7 × 128,7 | 96,6 × 201,6 | 128,7 × 256,6 |

Fet i verificat en aquesta tongada:

- **Stripe de la p1 = la de la p2** (mida i posició) a totes les mides; a 1024, a més, estirada fins al carril de la pàgina (938,9) amb el factor ×1,4834.
- **Graella intercalada de la p1**: peces −25 % a 1024 (51 → 38 px), quadrat fletxes/selector −25 %.
- **Cadenat clicable**: `zIndex: 10002` a `FullWideSlideHeader.jsx` (abans 9999, per sota del panell `z-[10000]`, i a 1024 la franja de la p1 el tapava).
- **Hero −25 %** a totes les vistes (`HeroInici.jsx`); a 1024 es queda a 774,7 perquè allà el carril de la pàgina va créixer amb el canvi del header.
- **Header**: carril del header a 1024 = 939,2 (el mateix que el segon header), centrat a la finestra; els enllaços de la p1 tornen al header principal amb la mida de la desktop (12 px); doble header només a la vertical; `letter-spacing` dels noms de la hero a la meitat a 1024.
- **Segones guies verdes** per al carril de la pàgina a `CarrilGuidesOverlay.jsx` (`min(939.2px, 100vw - 80px)` centrat), amb el mateix commutador (`Alt+C` / `?carril=1`).
- **Megaslide escurçat 16 px** a la composició estreta (`PADDING_VERTICAL_PANELL_ESTRETA_PX = 80`, que a `alcadaPanellMegaslide` RESTA).
- **Servidor de proves**: 0 errors de consola a totes les vistes; `eslint` 0 errors; `vite build` OK.

## On s'ha quedat (el següent pas, només aquest)

A 1024, les fletxes i el selector **ja són dues peces independents** de 96,5 × 96,5, cadascuna amb la seva caixa (fons `paper-soft`, radi 5,3 i ombra), a la vora esquerra i a la dreta del carril de la pàgina (42 → 138,5 i 884,7 → 981,2). El desplaçament del bloc és absolut (`prevAjustRef`) perquè no derivi.

**Però es continua veient una franja comuna**, i el culpable ja està identificat amb `scripts/_tmp-franja-qui.mjs`: dins `[data-bloc-dreta-p1]`, el fill 0 és una capa de **939 px amb `backgroundColor: rgb(247,247,248)`** i, a sota, la capa de l'ombra de la màniga (939 px, `rgba(0,0,0,0.45)`).

Petició textual de l'amo: «Però ara hi ha les fletxes i els enllaços del selector dins de la mateixa franja i jo els vull separats.»

Què cal fer: a 1024, que aquella capa de 939 no pinti fons ni ombra (i que l'ombra de la màniga vagi amb la peça del selector, que és on toca), de manera que es vegin **dues peces separades** i cap franja comuna. Després, captura de comprovació a 1024 i confirmar que 1366/1440/1920 no s'han mogut.

## Pendents

- **Commit**: hi ha moltíssima feina sense commitar (la conversió de colors i tota la sessió). L'amo no ha contestat mai si el vol; la regla de casa és «commit i push sempre».
- El veri del cadenat a la pàgina 1 de 1024: resolt, però convé repassar-ho amb la pàgina 1 oberta (s'hi arriba clicant una col·lecció del header que no sigui l'activa, per exemple CUBE).
- `eslint` té errors **preexistents** a `FullWideSlideHeader.jsx` (línies ~447-815: `setState` dins d'efectes i una memoització) i un avís a `MegaMenuPanel.jsx`; no són d'aquesta feina.
