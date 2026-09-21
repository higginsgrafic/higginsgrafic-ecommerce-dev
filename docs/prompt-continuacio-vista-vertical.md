# Prompt per continuar: la vista vertical del megaslide (768)

Copia-ho tal qual al començament d'una sessió nova.

---

## Context

Projecte: `higginsgrafic-ecommerce-dev` (React 18 + Vite + Tailwind, Playwright per a comprovacions, vitest).
Repositori: `/Users/marc/EXTRA LOCAL/PROJECTES LOCAL/GRUP HIGGINS/GRÀFIC/BOTIGUES/ECOMMERCE/PROJECTE/ECOMMERCE-WEB/higginsgrafic-ecommerce-dev`
Servidor de desenvolupament: **http://127.0.0.1:3003** (ja corriendo; és el que veu l'amo, amb HMR).

### Regles de l'amo (no negociables)

- Tot **en català**: codi, comentaris, missatges de commit i conversa.
- **No fer push.**
- **No aturar ni reiniciar el servidor del 3003.** Si cal servir una altra cosa, fer-ho en un altre port amb un `vite preview` i aturar-lo en acabar. Mai `lsof -ti :3003 | xargs kill`.
- Abans de dir que una cosa està feta: `npx vitest run` i `npx vite build`, i comprovar-ho al navegador (Playwright) si és visual.
- **Fer exactament el que demana**: no suposar, no inferir, no aprofitar per arreglar res més. Si una instrucció és impossible o ambigua, preguntar.
- Una instrucció a la vegada; l'amo itera mirant la pantalla.
- Els scripts de comprovació temporals van a `scripts/_tmp-*.mjs` i **s'esborren** en acabar. Les captures van a `docs/comparacio/` (ignorat pel git).

### Eines de regressió de l'amo

- `npm run mesura:megaslide` (= `node scripts/mesura-megaslide.mjs`): 833 xifres, 7 mides de pantalla. Als 768 hi ha **15 xifres** que es mouen des que vam canviar l'alçada de la pestanya; la resta no s'ha de moure mai.
- `npm run compara-vistes` (= `node scripts/compara-vistes.mjs`): comprova que la vertical i l'horitzontal donen les mateixes mides i alineacions.

## On és el codi

| fitxer | què hi ha |
|---|---|
| `src/components/megaslide/TaulaVertical.jsx` | Les dues taules de la vista vertical: `TaulaVerticalP1` i `TaulaVerticalP2` (caselles amb `data-taula-cela`), `CapaTaulaVertical` (capa absoluta sobre el contingut de la pàgina) i `ampladaCarril` / `alturaTaulaVertical`. |
| `src/components/fullwide/MegaMenuPanel.jsx` | Pàgina 1 de la vista ampla. Hi ha la instància real de `MegaStripePanelP1` (cap a la línia 353-357) i les peces que es munten a la taula vertical de la pàgina 1. |
| `src/components/megaslide/MegaslidePagina2.jsx` | Pàgina 2 de la vista ampla. Hi ha la instància real de `MegaStripePanel` i les peces de la taula vertical de la pàgina 2. |
| `src/components/fullwide/MegaStripePanelP1.jsx` | La franja de debò de la pàgina 1 (1.094 línies). |
| `src/components/fullwide/MegaStripePanel.jsx` | La franja de debò de la pàgina 2. |
| `src/components/fullwide/CercadorTextRow.jsx` | La filera de la pàgina 2 de l'horitzontal. D'aquí surten les peces que fa servir la taula vertical: `CercadorDibuixosGraella`, `CercadorColorsGrid`, `CercadorColleccionsColumna` i `dibuixosGraella16x4()`. La filera horitzontal fa servir les mateixes peces: **no es pot canviar el que es veu a l'horitzontal**. |
| `src/components/fullwide/CercadorTopBar.jsx` | La barra del cercador; exporta `CERCADOR_COLLECTIONS`, `CERCADOR_COLORS`, `CercadorColleccions` i `CercadorColors`. |

## Estat actual (HEAD = `212ac42`, sense fer push)

A 768 (vertical), mesurat al DOM:

- **Taula de la pàgina 2**: 40, 178, **688 × 354,2** (sense contorns). Caselles: `1-5` graella (688 × 118,1), `6-11` col·leccions (40 → 167,6), `7` selector (167,6 → 285,2), `12` graella de colors (167,6 → 285,2), `8-10+13-15` franja (285,2 → 728).
- **Taula de la pàgina 1**: 40, 178, **688 × 354,2** (sense contorns). Caselles: `1-5` graella (688 × 118,1), `6` selector i `11` buida (40 → 157,6), `7-9+12-14` franja (157,6 → 610,4), `10` fletxes i `15` buida (610,4 → 728).
- **Peces**: graella de dibuixos de la p1 amb les tiles al 85% de la casella (82,3 × 98,6, centres quiets); selector 96,8 × 96,8; fletxes 81,7 × 89,7 alineades verticalment amb el selector (centres a 360,7 i 360,8) i amb el seu top a −7,6 px; franja de la p1: encara la **imatge fixa** `public/placeholders/tablet vertical/stripe-curta-7+7.png` (458,8 × 213,9, centrada i al bottom).
- **La pestanya del megaslide**: `alturaTaulaVertical(768) = 412,8 − 58,95 = 354` aproximadament; la superfície queda a 131 → 550 (419 d'alçada).

**Pendent al disc, sense cometre**: `public/placeholders/tablet vertical/stripe-curta-7+7.png` està modificat (216.530 bytes al disc en comptes de 215.711 del darrer commit). **No és canvi meu**; no l'he comès.

## La feina a fer

L'amo ho va resumir així: «A les pàgines hi falten els mecanismes. Han de funcionar de la mateixa manera que les seves homònimes dels altres formats.» I després: «Dues fileres. Les dues pàgines.»

### 1. Franja de dues fileres (el cor)

La franja de debò **ja està muntada** a la vista vertical, però:

- la **tapa la imatge fixa** que pinta `CapaTaulaVertical`, i
- està a la mida de l'horitzontal, no encaixada a la casella.

Mesures fetes: `MegaStripePanelP1` a x 37,3, y 293,6, **917,5 × 98,3**; `MegaStripePanel` a x 785, y 293,2, 948,9 × 101,6. La casella de la franja de la p1 fa 452,8 × 236,1 (alta) i el panell és molt ample i baix.

La imatge fixa és **dues fileres de 7 samarretes**. Cal:

1. Una prop nova al panell (per exemple `files`), **per defecte 1**, perquè l'horitzontal no canviï gens.
2. Amb `files = 2`: les 14 màscares repartides en **dues fileres de 7** (les 0-6 a dalt, les 7-13 a baix), com la imatge.
3. La **samarreta sencera duplicada** al final de cada filera. Al panell, la lògica d'extrem és a `MegaStripePanelP1.jsx` cap a les línies 657-659:
   ```
   const isFirst = safeIdx === 0;
   const isLast  = safeIdx === 13;
   ```
   Amb dues fileres ha de passar a ser per filera (`isLast = idx % 7 === 6`), de manera que hi hagi una samarreta sencera a la posició 6 i una altra a la 13. **No cal cap dibuix nou**: les 14 màscares són dades (`stripeMaskTileRectsRawPct`, amb la comprovació `length === 14` a les línies 567 i 606-616) i l'overlay es pinta a sobre.
4. **Encaixar** el panell a la casella de la franja de les dues taules (escalat a l'amplada de la casella i centrat; el bloc és alt i el panell baix, per això les dues fileres).
5. **Treure la imatge fixa** de les dues taules.

### 2. Mecanismes (l'amo ja els va triar)

- **Les fletxes passen dibuixos**: avui només criden `touchMegaPublicActivity`; han de paginar la franja com a l'horitzontal.
- **Col·leccions i colors canvien el que es veu**: el clic ja està cablejat a l'estat (`setActive`, `setCercadorSelectedColor`), però com que la franja era una imatge fixa no es veia enlloc; amb el panell de debò s'hi ha de reflectir.
- **Els dibuixos es trien amb el tap, no amb hover**: l'amo ho va dir explícitament («en un aparell tàctil, no hi ha hover»). No fer servir `onMouseEnter` a la vista vertical.
- **No hi ha cap camp de text al cercador**: la pàgina 2 es diu «cercador» perquè és la pàgina de cerca, però mai no s'hi ha pogut escriure. No inventar-ne cap.

### Coses que ja estan fetes i no s'han de tocar

- Les peces de la pàgina 2 (graella 16×4 de 64 dibuixos, col·leccions amb la pastilla com a selector, graella de colors 4×4, selector i franja) i les de la pàgina 1.
- La manera d'omplir de `CercadorDibuixosGraella` i la prop `tilesPercent`, que fan servir les taules verticals i que la filera horitzontal no toca.
- El fet que la taula de la pàgina 1 i la de la 2 facin la mateixa alçada (688 × 354,2) i que la pestanya del megaslide creixi amb la taula (`alturaTaulaVertical`).

## Verificació (sempre, abans de dir que està fet)

```
npx vitest run                 # 462 proves, 38 fitxers
npx vite build                 # ha de compilar
npm run compara-vistes         # vertical i horitzontal, mateixes mides
npm run mesura:megaslide       # només s'han de moure les 15 xifres del 768
```

I una comprovació al navegador amb Playwright a 768 (`hasTouch: true`), mirant l'estat real del DOM i una captura a `docs/comparacio/`.
