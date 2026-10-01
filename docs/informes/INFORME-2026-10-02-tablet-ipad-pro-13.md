# Els formats de tauleta es veuen com a tauleta (iPad Pro 13)

**Data:** 2026-10-02 · **Estat:** fet i verificat.
**Ve de:** la pregunta de l'amo («Em pregunto si no es podrien veure els formats tablet
que tenim seleccionats com a tablet, no com a desktop petit») i de
`PLA-estructura-general-dispositius.md` §1.3 i §1.4.

---

## 1. Què passava

La llista de formats del desplegament (`scripts/mesura-formats.mjs`, 48 formats) en té
**22 de tauleta**. Mesurats un per un amb el model de producció
(`deviceLayoutFromViewport`), **18 ja sortien com a tauleta** i 4 no:

| format | finestra | classe (abans) | per què |
|---|---|---|---|
| Galaxy Tab S9 | 533×781 | mòbil | el llindar de mòbil és 600 |
| Galaxy Tab S9+ | 584×862 | mòbil | el llindar de mòbil és 600 |
| **iPad Pro 13** | 1032×1304 | **escriptori** | el màxim de tauleta vertical era 1024 |
| **iPad Pro 13 apaïssada** | 1376×954 | **escriptori** | el màxim de tauleta apaïssada era 1366 |

Els dos de l'iPad Pro 13 són el que l'amo veia com «un escriptori petit». Els dos Galaxy
Tab S9 no es veuen com a escriptori sinó com a mòbil, i són una altra decisió (§4).

## 2. El canvi (02/10/2026)

**Els límits, en un sol lloc.** Els números vivien a `layoutModel.js` i, **repetits**, a
`layoutMetrics.js` (`esTauletaApaisada`/`esTauletaVertical`, que són els que consulten el
header, el megaslide, el cistell i el checkout). Ara es declaren **només** a
`layoutMetrics.js` i `layoutModel` els importa:

```js
export const MIDA_MOVIL = 600;
export const MIDA_TAULETA_VERTICAL_MAX = 1032;   // era 1024
export const MIDA_TAULETA_APAISADA_MIN = 768;
export const MIDA_TAULETA_APAISADA_MAX = 1376;   // era 1366
export const ALCADA_TAULETA_APAISADA_MAX = 1100;
```

**Les bandes que repetien els números** passen a llegir-los (o a preguntar-ho al model):

| fitxer | què hi havia | què hi ha |
|---|---|---|
| `utils/layoutMetrics.js` | `768..1366` i `600..1024` a les dues funcions | els límits declarats |
| `utils/layoutModel.js` | els cinc límits declarats | els importa |
| `megaslide/geometriaMegaslide.js` | `esBandaEstretaFranja`: `768..1366` | `MIDA_TAULETA_APAISADA_MIN..MAX` |
| `megaslide/geometriaMegaslide.js` | `COMPOSICIO_ESTRETA_MAX_PX = 1366` | `MIDA_TAULETA_APAISADA_MAX` |
| `utils/mesuraMegaslide.js` | `bandaEstreta`: `768..1366` | els límits |
| `utils/tdpMida.js` | `> 1366` són 4 columnes | `> MIDA_TAULETA_APAISADA_MAX` |
| `hooks/useEscalaFranjaCarril.js` | `1024..1366` | `COMPOSICIO_ESTRETA_MIN/MAX_PX` |
| `FullWideSlideHeader.jsx` | `esBandaEstreta`: `768..1366` | els límits |
| `CercadorTextRow.jsx` | `esBandaEstreta`: `768..1366` | els límits |
| `MegaslidePagina2.jsx` | `esBandaEstreta`: `768..1366` | els límits |
| `CistellComandaContent.jsx` | `isTablet` i `isPortraitTablet` a mà | `esTauletaApaisada`/`esTauletaVertical` |
| `home/HeroInici.jsx` | `esTauleta` a mà; `esHeroSeccioAmpla` ≤ 1366; tracking ≤ 1024 | el model i els límits |

## 3. Verificació

**La classificació dels 48 formats** (mesurada amb el model de producció,
`scripts/_tmp-formats-tablet.mjs`): **només canvien de classe els dos iPad Pro 13.**

| | abans | ara |
|---|---|---|
| mòbil | 14 | 14 |
| tauleta vertical | 8 | **9** |
| tauleta apaïssada | 18 | **19** |
| escriptori | 8 | **6** |

Els 46 formats restants no es mouen: els portàtils 1280 i 1366 segueixen sent tauleta
apaïssada, el 1440 i els de més amunt segueixen sent escriptori, i els Galaxy Tab S9/S9+
segueixen sent mòbil.

**Els dos formats, a la pantalla** (`scripts/_tmp-ipad13.mjs`), comparats amb la tauleta
veïna de la mateixa orientació:

| | classe | offset | 2a fila | carril | franja de la p2 | desborda | errors |
|---|---|---|---|---|---|---|---|
| iPad Air 13 vertical (1024×1294) | tauleta vertical | 114 | sí | 992 | 377,244 (235×102) | no | 0 |
| **iPad Pro 13 vertical (1032×1304)** | tauleta vertical | 114 | sí | 992 | **377,244 (235×102)** | no | 0 |
| iPad Air 13 apaïssada (1366×946) | tauleta apaïssada | 52 | no | 811 | 251,219 (847×91) | no | 0 |
| **iPad Pro 13 apaïssada (1376×954)** | tauleta apaïssada | 52 | no | 817 | **253,219 (853×91)** | no | 0 |

O sigui: el 1032 es pinta **exactament com el 1024** (el carril de 992 no es mou i tot el
que hi ha a dins cau al mateix lloc) i el 1376 **exactament com el 1366**, amb el carril
proporcional 10 px més ample. Les captures són `_tmp-ipad13-1024x1294.png`,
`_tmp-ipad13-1032x1304.png`, `_tmp-ipad13-1366x946.png` i `_tmp-ipad13-1376x954.png`.

## 4. El que queda (i no s'ha tocat)

**Galaxy Tab S9 (533) i Galaxy Tab S9+ (584)**: avui són mòbil i, si fossin tauleta
vertical, la taula de caselles (992 px fixos) donaria un carril de 453 i una columna
d'uns 90 px (uns 70 amb els marges de la casella). **Cal refer la taula per a amplades
estretes**: és una decisió de disseny, no un límit. En Marc ho va deixar fora d'aquest
canvi.

I els quatre casos que `PLA-estructura-general-dispositius.md` §1.4 ja documenta com a
decisions (els portàtils 1280/1366, els sis telèfons girats) segueixen igual.
