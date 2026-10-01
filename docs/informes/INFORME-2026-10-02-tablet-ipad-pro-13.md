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

## 3bis. El segon carril a la tauleta apaïssada (02/10/2026, el mateix dia)

Mirant l'iPad Pro 13 apaïssat a l'overlay, en Marc va preguntar: «I no se li pot fer un
segon carril a aquest, també?». Se li va dir que la diferència era la mateixa a 1280 i
1366 (el carril de la pàgina està topat a 939,2 per a tots tres) i va triar **tota la
banda de tauleta apaïssada**, amb **la composició que ja hi havia escalada al carril nou**.

| vista | carril del megaslide (abans) | ara | carril de la pàgina | escala |
|---|---|---|---|---|
| iPad 10.2 apaïssat (1024×690) | 605 (i la composició ja hi era) | **939,2** (local) | 939,2 | 1 |
| Portàtil 1280 (1280×666) | 759 | **939** | 939,2 | 1,2372 |
| iPad Air 13 apaïssat (1366×946) | 811 | **939** | 939,2 | 1,1578 |
| iPad Pro 13 apaïssat (1376×954) | 817 | **939** | 939,2 | 1,1493 |

El carril surt de `FullWideSlideHeader.jsx` (`--hg-mega-w` era el 3/5 declarat) i l'escala
de `--hg-escala-mega`: a la tauleta valia 1 (el seu disseny no s'escalava mai) i ara, en
aquesta banda, és la proporció entre els dos carrils, perquè les peces de disseny no
canviïn de proporció dins del seu carril. **La banda del 1024 (1000-1050) no s'hi toca**:
allà el segon carril ja hi és des de l'01/10 i la seva composició té els números calibrats
amb l'escala 1.

Mesurat amb `scripts/_tmp-segon-carril-fotos.mjs` (la p2) i `scripts/_tmp-segon-carril-p1.mjs`
(la p1, amb les peces relatives a la seva pàgina, que viu desplaçada):

- **Tot cau dins el carril.** El bloc de la dreta de la p1, a 973..1102 amb el carril a
  163..1102 (1280), 1016..1145 amb 206..1145 (1366) i 1021..1150 amb 211..1150 (1376).
  La graella de la p1, a 173..963, 216..1006 i 221..1011.
- **La franja** de la p2 fa 980 px (141..1123, 184..1164 i 190..1170) amb les cintures a
  les vores del carril — la mateixa mida que a 1024, que és el que vol dir «el mateix
  carril per a tothom».
- **L'hero** també passa al carril (939) i el header i el cadenat segueixen les seves vores.
- Cap desbordament i cap error de consola a 1280, 1366 ni 1376 (i el 1024, mesurat abans i
  després, dona exactament els mateixos números: panell 243, selector 42..139, graella
  149..866 i franja 23..893).

Captures: `_tmp-segon-carril-1280-p1.png`, `_tmp-segon-carril-1366-p1.png`,
`_tmp-segon-carril-1376-p1.png`, `_tmp-segon-carril-1280-p2.png`,
`_tmp-segon-carril-1366-p2.png` i `_tmp-segon-carril-1376-p2.png`.


## 3ter. A les tauletes no hi van fletxes (02/10/2026)

En Marc: «A les tablets no hi van fletxes». Era la mateixa regla que ja havia fet treure
les de 1024 («un dispositiu tàctil no necessita fletxes... Esborra les fletxes»), però
estava escrita només per a la banda del 1024 (1000-1050) i només en una de les tres
peces que munten fletxes:

| on | què passava | ara |
|---|---|---|
| `MegaStripePanelP1` (el quadrat de fletxes de la p1, `data-fletxes-p1`) | només se saltava a 1024: a 1280, 1366 i 1376 s'hi muntava | no es munta a cap tablet (la classe la diu el model) i el selector ocupa el quadrat sencer |
| `MegaColumn` (la casella de fletxes del mosaic, `CONTROL_TILE_ARROWS`) | s'hi muntava sempre, també a les verticals | no s'hi munta (es deixa el lloc, perquè el mosaic no es mogui) |
| `MegaMenuPanel` (la composició de la tauleta vertical) | s'hi muntava sempre | la casella queda buida |

Mesurat (`scripts/_tmp-fletxes-tablet.mjs`), comptant botons visibles amb `aria-label`
«Anterior»/«Següent» i el quadrat `data-fletxes-p1`:

| vista | abans | ara |
|---|---|---|
| 768×952 (vertical) | 4 + 0 | **0** |
| 1032×1304 (vertical) | 4 + 0 | **0** |
| 1024×690 | 0 + 0 | 0 |
| 1180×742, 1280×666, 1366×946, 1376×954 | 0 + 1 | **0 + 0** |
| 1440×900 i 1920×1080 (escriptori) | 4 + 1 | **4 + 1** (es queden) |

Cap error de consola a cap de les nou mides i `vite build` correcte.


## 3quater. La composició del 1024, a totes les tauletes (02/10/2026)

Després del segon carril, en Marc va veure la p2 tallada i sense la columna de
col·leccions, i ho va tancar: «S'ha d'aplicar la 1024 a totes les tablets. Demà farem les
adaptacions per models».

Fet a l'**apaïssada** (era el que es podia fer sense tocar cap tauler): els tres predicats
que obrien la composició del 1024 (`esCarrilPagina1024` a `MegaslidePagina2`,
`esAjust1024P1` a `MegaStripePanelP1` i `esColumna1024` a `CercadorTextRow`) ja no miren
la finestra 1000-1050 sinó la classe del model (`isLandscapeTablet`), i l'escala de la
tauleta torna a ser 1 perquè la composició del 1024 porta els seus números de disseny i el
carril de la pàgina.

Mesurat: la composició surt **idèntica a la del 1024, centrada al carril** —
`selector 42/120/170/213/218` i `graella 149/227/277/320/325` amb el carril a
`605/939` segons la mida, o sigui el mateix desplaçament relatiu (171 px) a 1024, 1180,
1280, 1366 i 1376 — amb la **columna de col·leccions dins la finestra a totes**
(9/9 enllaços), sense fletxes, i el 1024 i els escriptoris (1440, 1920) exactament com
estaven.

**Pendent (demà, per models): la tauleta VERTICAL.** El seu tauler fa 992 i es pinta a
amplada fixa, o sigui que no segueix ni el carril ni l'escala: a un iPad de 768 la
columna de col·leccions de la p2 cau a x914 en una finestra de 753. Cal adaptar el tauler
(millor per model, com ha dit l'amo) abans de canviar-li el carril; el que s'hi va provar
(min(992, vp−32) i escala proporcional) no hi fa res perquè la taula no en depèn.


## 3quinquies. La stripe de la p2, a 5 px de la columna (03/10/2026)

En Marc: «La stripe de la p2 ha d'acabar a 10 px de la columna de col·leccions», precisat
amb «Per la cintura» i, en veure-ho, «Posa'l a 5 px».

L'objectiu del `useEscalaFranjaCarril` de la p2 (`MegaStripePanel`) són els COSSOS de la
franja, o sigui les cintures, i la columna fa `GRAELLA_COLUMNA_DRETA_CARRIL_PX` de 1350.
Al carril de la pàgina, doncs, l'objectiu es queda en `carril x (1 - 152/1350) - 4`, i la
cintura acaba 5 px a l'esquerra de la columna. La constant és 4 i no 5 perquè la franja de
la tauleta va un 0,2% més petita (`scale(0.998)` a `MegaslidePagina2`), que en aquest
carril fa ~1 px: amb 5, la cintura en quedava a 6 (mesurat).

Mesurat (cintura de la franja contra la caixa de la columna, que és la seva vora
esquerra): 870,9 vs 875,9 a 1024; 1045,9 vs 1050,9 a 1366; 1050,9 vs 1055,9 a 1376 —
**5,0 px** a totes tres. El primer enllaç va 3 px endins de la columna (878,9 a 1024), o
sigui que la distància al text és de 8.

I també s'ha estès a la resta de la banda apaïssada la mateixa definició de
`esCarrilPagina1024` que faltava en aquest fitxer (era l'últim lloc que encara mirava la
finestra 1000-1050): sense això l'objectiu de la franja era el carril sencer i la cintura
passava per sota de la columna.

**NOTA (pendent de decisió):** a l'escriptori (1440 i 1920) la p2 té una altra composició
i allà la cintura acaba a 6-7 px del primer enllaç del mosaic de col·leccions. No s'hi ha
tocat.

## 4. El que queda (i no s'ha tocat)

**Galaxy Tab S9 (533) i Galaxy Tab S9+ (584)**: avui són mòbil i, si fossin tauleta
vertical, la taula de caselles (992 px fixos) donaria un carril de 453 i una columna
d'uns 90 px (uns 70 amb els marges de la casella). **Cal refer la taula per a amplades
estretes**: és una decisió de disseny, no un límit. En Marc ho va deixar fora d'aquest
canvi.

I els quatre casos que `PLA-estructura-general-dispositius.md` §1.4 ja documenta com a
decisions (els portàtils 1280/1366, els sis telèfons girats) segueixen igual.
