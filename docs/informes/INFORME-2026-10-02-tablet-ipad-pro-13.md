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


## 3sexies. Totes les vistes, alineades amb el segon carril (03/10/2026)

En Marc: «Assegura't que totes les vistes estan ben alineades amb el segon carril».
Mesurat vista a vista contra les guies (`scripts/_tmp-alineacio-carril.mjs`), hi havia
dues coses fora de lloc de debò:

1. **Les tauletes apaïssades estretes (853, 934 i 981)** no agafaven el segon carril: el
   carril de la pàgina només s'aplicava a partir de 1050 i allà el megaslide anava amb el
   3/5, mentre que la seva composició ja era la del 1024. El bloc de la p1 hi sortia de
   167 a 940 en un carril de 40 a 813 (mesurat). Ara agafen el carril de la pàgina (773,
   854 i 901) i la composició s'hi escala (`beltFinal / 939,2`: 0,823, 0,909 i 0,959).
2. **La fila del header** es centrava amb l'amplada de maquetació (que reserva la barra de
   desplaçament) i sortia 7,4 px a l'esquerra de les guies i de la p2 a 1180, 1280, 1366 i
   1376. Ara es centra amb `window.innerWidth`, com les guies i com la p1/p2.

El que queda, i és el que ja es va acceptar l'01/10: **7,4-7,5 px** entre les peces
centrades a la finestra (les guies, el header, la p2) i les que centra el CSS (la hero i
les seccions de la pàgina nova, i el bloc de la p1). És mitja barra de desplaçament
(`(100vw - amplada de maquetació) / 2`) i per treure'l caldria tocar el contenidor del
carril a `foundation.css` (`.hg-marc__contingut` i `.hg-carril`), que és de tot el lloc.

I les desviacions que són de disseny: la graella de la p2 arrenca després del selector
(107 px), la columna de col·leccions acaba a la vora dreta del carril, i la cintura de la
franja queda a 5 px de la columna.

## 3septies. La columna de col·leccions a l'iPad Pro 13 apaïssat (03/10/2026)

Tres coses que va demanar l'amo, totes sobre la columna de col·leccions del model:

1. **L'ombra de la màniga, més fluixa**: «Rebaixa l'ombra de la màniga. Volem que hi
   sigui, no que cridi l'atenció». Al model passa d'alfa 0,45 a 0,25 (la casa que la
   pinta segueix amb 0,45).
2. **La pastilla de l'actiu, més alta sense tocar la columna**: «Pots fer la pastilla més
   alta sense modificar l'alçada de la columna?». L'alçada de la columna (221,7) no es
   toca i la pastilla fa tota l'alçada de la seva cel·la (inset vertical 0); la relació
   lateral és zero, la que va triar l'amo quan va dir «els mateixos offsets que el
   selector: inset vertical i 0 lateral».
3. **El clic als enllaços**: «Costa molt clicar els enllaços de Crosswords cap avall de la
   columna de col·lecció». La causa no era cap `z-index` de la columna sinó la **caixa**
   de la franja: la filera que arrossega la tira (`#stripe-guide-stripe-row`) demana el
   clic amb `pointerEvents: 'auto'` i la seva caixa fa 93..1164, mentre que el que pinta
   la franja (`data-stripe-visual-content`) va de 168 a 1090. Aquells 89 px de caixa
   buida queien damunt de la columna i li prenien el clic des de CROSSWORDS cap avall.

   Pujar la columna de `zIndex` no ho arregla (viu dins de l'embolcall de la filera, que
   és a `zIndex: 3`, i el seu `zIndex` hi queda tancat), i posar la filera per sobre de la
   franja **mou el dibuix** (19.081 px de diferència, amb la màniga passant per sota de la
   columna), que és el que l'amo va descartar: «No pots posar la màniga sota la columna,
   ho sento».

   La solució és de superfície de clic i no de pintat: al model la filera deixa de demanar
   el clic i el demana el dibuix de la franja, que és qui arriba fins on arriba la tira.
   Cap capa no es mou, la màniga que cau damunt de la columna (1075..1090) segueix sent
   seva, i la roda i l'arrossegament del pas continuen funcionant perquè els gestors són a
   la filera i l'esdeveniment hi puja.

Verificat a 1376 amb `deviceScaleFactor` 2: **9 enllaços x 5 punts = 45/45 clics**, la
roda i l'arrossegament (touch sintètic) fan el pas igual que abans, cap error de pàgina, i
la petjada de les 11 vistes (`scripts/_tmp-ipad13-abans-despres.mjs`) sense cap diferència.

## 3octies. L'estil de la columna de col·leccions, a tot el site (03/10/2026)

En Marc: «Per cert, agafo la teva oferta de fer extensiva la modificació de la columna de
col·leccions a la resta del site» i, en triar l'abast entre les quatre opcions, «Tota la
columna amb l'estil del model». Així que el que al model era seu ara val a tot el lloc:

- **Sense contorn i amb el radi del selector**: la vora d'1 px desapareix i el radi passa
  de 6 a 5,3 (l'amo havia demanat recuperar aquell contorn el 02/10 per al 1920 i el 1440;
  aquest canvi el retira).
- **Ombra suau** `0 1px 3px` alfa 0,12 tambe a la caixa (la pastilla ja la portava).
- **La pastilla toca les vores laterals**: el coixí lateral del contenidor (2 px) passa a 0.
- **L'ombra de la màniga, a 0,25** (`OMBRA_MANIGA_ALFA_COLUMNA`); el bloc de la dreta de la
  p1 es queda amb la de sempre (`OMBRA_MANIGA_ALFA`, 0,45).

**L'alçada de la columna no s'ha tocat.** Ho va demanar l'amo al model («Pots fer la
pastilla més alta sense modificar l'alçada de la columna?») i aquí es va comprovar el
mateix abans/després, posant els estils vells en línia: la columna fa el mateix a tot
arreu —251,41 a 1920, 198,16 a 1440, 213,39 a 1366, 213,42 a 1024 i 221,7 a 1376— i el
que canvia és la pastilla de dins de cada cel·la, que guanya els 2 px de la vora
(0,22 px per cel·la) i arriba a les vores laterals.

Verificat a 1920/1440/1376/1366/1280/1180/1024: vora 0, radi 5,3, ombra 0,12, coixí
2/0/0, ombra de màniga 0,25, i la petjada de les 11 vistes sense cap altra peça moguda.

**Queda pendent** (no tocat en aquest canvi): el clic als dos enllaços de baix de la
columna encara falla a 1024, 1180, 1280 i 1366, perquè l'arranjament de la superfície de
clic de la franja (`superficiesDeFranja` a `MegaStripePanel`) avui només val per al model.
És una línia (`esCarrilPagina1024` en comptes de `esCarrilPagina1024 && esIPadPro13()`) i
no mou cap píxel.

## 3nonies. El carril del model, a 1100 px (03/10/2026)

En Marc: «Vull ampliar el carril a 1100 px». Es el carril **propi** del model
(`CARRIL_IPAD_PRO_13_APAISSADA_PX`, `layoutModel`): el segon carril compartit de les
tauletes (939,2) no s'ha tocat.

- Carril **1100** i escala **1,1712** (`1100 / 939,2`). Amb 1376 de finestra queden 138 px
  per banda i la composició s'hi escala tota: el selector de la p2 fa 113 (era 103), la
  graella i les barres 841,4, la franja 1014,6 d'ample pintat, i el cadenat i les icones del
  header queden a ras de la vora dreta del carril (1237,5 de 1238).
- **Cap altra peça moguda a cap altra vista**: la petjada de les 11 vistes només canvia a la
  línia de l'iPad Pro 13 apaïssat.
- **Els aires que l'amo va fixar es mantenen**: 20 px de dalt a la p2, 20 px de gap entre el
  selector i la franja a la p1, i ~40,5 px per sota de les dues franges.
- **La cintura torna a 5,0 px de la columna.** Amb el carril més ample, la diferència entre
  carril i columna creix més que la constant i la cintura en quedava a 5,4:
  `AIRE_STRIPE_COLUMNA_PX` passa de 4 a **3,6** només al model (a la resta de la banda
  apaïssada segueix amb 4, i el seu carril és el de sempre).

Verificat: 9 enllaços de la columna × 5 punts = **45/45 clics**, cap error de pàgina i cap
desbordament horitzontal.

## 3decies. El megaslide del model, tambe a 1180x820 i 1200x800 (03/10/2026)

En Marc: «Aplica el megaslide de l'iPad Pro 13 a 1180x820 i 1200x800». Les dues vistes entren a
`esIPadPro13` (`layoutModel`) per la seva **mida** (amplada i alçada,
`MEGASLIDE_MODEL_VISTES`), no només per l'amplada: la vista de **1180x742** (iPad Air 11
apaïssat) ha de seguir sent la de sempre, i només la de 820 porta el megaslide del model.

Mesurat, i idèntic al model de 1376:

| | 1180x820 | 1200x800 |
|---|---|---|
| carril / escala | 1100 px / 1,1712 | 1100 px / 1,1712 |
| aire per banda | 40 px | 50 px |
| panell | 53..351 | 53..351 |
| aire de dalt de la p2 | 20 | 20 |
| gap selector→franja (p1) | 20 | 20 |
| sota les franges (p1 / p2) | 40,6 / 40,4 | 40,6 / 40,4 |
| selector de la p2 | 113 | 113 |
| cintura→columna | 5,0 | 5,0 |
| cadenat | 359..409 | 359..409 |
| icona de la dreta del header | 1139,5 de 1140 | 1149,5 de 1150 |

Verificat a les dues: 9 enllaços × 5 punts = **45/45 clics**, cap error de pàgina i cap
desbordament horitzontal. I **cap altra vista s'ha mogut**: la petjada de les 11 de sempre és
exactament la mateixa (les dues noves s'han afegit a
`scripts/_tmp-ipad13-abans-despres.mjs`, que ara en mesura 13).

## 3quaterdecies. El model, per amplada (correcció) i al visor (03/10/2026)

**En Marc no hi veia cap canvi**: «No veig cap canvi a 1180x820 ni a 1200x800». I tenia raó, i la
causa és la diferència entre la **finestra** i el **viewport**: una finestra de 1180x820 dona un
viewport de ~1180x742 (el navegador se'n menja ~78 px, exactament com al model: 1032 → 954) i la
de 1200x800, ~1200x722. La primera versió lligava la vista a la **parella exacta** (amplada i
alçada), o sigui que només entrava amb la finestra de DevTools i no amb una finestra de debò ni
amb el visor.

Ara **mana l'amplada** (`MEGASLIDE_MODEL_AMPLADES = [1180, 1200]`, com les del model) i tant la
finestra com el viewport exacte hi entren igual. L'iPad Air 11 apaïssat també fa 1180x820 de
pantalla, o sigui que també porta el megaslide del model: és la mateixa amplada i la mateixa
classe de tauleta.

Verificat a **1180x820, 1180x780, 1180x742, 1200x820, 1200x800 i 1200x742**: carril 1100, escala
1,1712, aires 20/20 i 40,5, columna amb la cintura a 5,0 px i 9/9 clics. La resta de vistes de la
petjada, sense cap canvi (l'única línia que es mou és la de 1180x742, que és precisament el cas de
la finestra).

I **els formats nous són al visor** («Posa'm els formats a l'editor iframe. Bé, és un visor més
que un editor»): `Model 1180×780` i `Model 1200×820` a `FORMATS` de
`public/browser-overlay.html`, al grup *Tauleta apaïssada* i amb el mateix `ct` que els veïns
(78), o sigui que la finestra que ensenyen és **1180x702** i **1200x742** (totes dues amb el
megaslide del model).

## 3quindecies. La mida de la hero: -25 % a tot arreu, +50 % a l'iPad Pro 13 (04/10/2026)

En Marc: «Ara, redueix la hero un 25 % a totes excepte a l'iPad Pro 13 que l'augmentaràs un
50 %». El que es mou és l'**alçada**, no l'amplada: l'amplada fa el carril des del canvi del
02/10 («Eixampla totes les hero fins al carril. Excepte la 1024») i allò no es toca. El factor va
a l'alçada de la fórmula curta de 1280/1366/1376 i a l'`aspect-ratio` de la resta; com que les
franges i les samarretes es pinten amb `auto 100 %` de l'alçada de la franja, s'hi escalen soles.

| vista | abans | després |
|---|---|---|
| 1920 | 1148 × 483,5 | 1148 × 362,7 |
| 1440 | 860 × 362,2 | 860 × 271,7 |
| 1366 i 1280 | 944 × 238,6 | 944 × 178,9 |
| 1200 i 1180×820 | 1105 × 465,4 | 1105 × 349,1 |
| 1024 | 944 × 397,6 | 944 × 298,2 |
| **iPad Pro 13 apaïssat (1376)** | 1105 × 279,3 | **1105 × 418,9** |
| **iPad Pro 13 vertical (1032)** | 944 × 426,4 | **944 × 639,6** |

L'iPad Pro 13 és el **dispositiu**, no les quatre amplades del model: 1180 i 1200 porten el
megaslide del model però no són l'iPad Pro 13, i van amb el 25 % de menys com tothom. Per
distingir-ho, `layoutModel` té `esIPadPro13Estricte` (1032 i 1376), que és el que fa servir la
hero.

## 3sedecies. Les dues versions del megaslide (04/10/2026)

En Marc: «La versió iPad Pro 13 actual es quedarà als altres grups. Cal canviar-li el nom, és
clar. En farem una altra per a la mida de l'iPad Pro 13, 1376»; en triar-ne el nom i l'abast,
«megaslide 1100» i «Només 1376»; i «Ara vull que portis el megaslide de l'iPad Pro 13 fins a
1200. Només l'iPad Pro 13».

A `layoutModel` hi ha ara **`MEGASLIDE_VERSIONS`**, i el nom de cada versió és el seu carril:

| versió | carril | amplades | aire de la cintura |
|---|---|---|---|
| `megaslide-1100` | 1100 | 1032 (vertical), 1180, 1200 | 3,6 |
| `ipad-pro-13` | **1200** | **1376** | 3,7 |

Les dues són **còpies** —només es diferencien en el carril i en l'aire de la cintura— i a partir
d'aquí es poden divergir sense tocar-se. `versioMegaslide()`, `paramsMegaslide()` i
`carrilMegaslide()` substitueixen `esIPadPro13()` i `carrilIPadPro13()`, i els sis components que
els feien servir ara llegeixen la versió. `esIPadPro13Estricte()` es queda per al **dispositiu**
(la hero, que hi va un 50 % més alta).

**La cintura torna a 5,0 a les dues versions**: l'aire és de cada versió (`aireStripeColumna`),
3,6 amb el carril de 1100 i 3,7 amb el de 1200 (amb 3,6 quedava a 4,9).

Mesurat a 1376 amb la versió nova: carril **1200** (88 px per banda), escala **1,2777**, panell
53..362, cadenat 369,5..420, cintura a 5,0 px de la columna, **45/45 clics**, cap error de pàgina
i cap desbordament. I la resta no es mou: 1180, 1200 i 1032 segueixen amb el megaslide 1100
(carril 1100), i la petjada de les 13 vistes només canvia a la línia de l'iPad Pro 13 apaïssat.

**Una conseqüència**: la hero de l'iPad Pro 13 comparteix el carril de la pàgina i creix amb
ell —1105 → 1205 d'ample i 418,9 → 456,8 d'alçada—. Si es vol que la hero es quedi a 1105, cal
deslligar-la del carril.

## 3septendecies. La hero, als 8/10, nome s a 1200x720 (04/10/2026)

En Marc: «Per tal de dimensionar correctament la hero a cada format podríem dividir l'espai
disponible, un cop obert el megaslide, en 6 parts i que les franges de la samarreta ocupin els 4/6
centrals. Així, la hero es proporcionarà de forma natural i l'espai a sobre i a sota serà
simètric»; en concretar-ho, «des del panell»; i, en veure-ho amb 4/6, «Massa petit. Prova amb
6/8», «Aplica els 6/8» i «prova amb 8/10».

**El primer intent es va aplicar a tot arreu i era un error**: «T'he dit que ho apliquessis a
1200x720. Enlloc més» (la regla dels 6/8 i els 8/10 s'havia estès a tots els formats i es va
revertir). El que hi ha ara és el repartiment en **desens** —1/10 d'aire, **8/10 de franges** i
1/10 d'aire— **només al format 1200x720**; a la resta, `MarcInici` i `HeroInici` es queden
exactament com eren (el repartiment de 28 files, els aires de 50 px de l'escriptori i 25/0 px
dels dos portàtils, i el topall de la caixa).

El format s'identifica per l'amplada (1200) i l'alçada: la **finestra** de 1200x720 dona ~586 px
de viewport (el navegador se'n menja ~134) i el **viewport exacte** en fa 720, i tots dos hi
entren (570..726). En queden fora el Galaxy Tab S9+ (1200x800, viewport 722) i el Model 1200x820
(viewport 742).

**El cadenat penja 58 px dins d'aquest espai**: si el desè és més curt que això (amb la finestra
de 586 fa 25), els **dos** aires s'allarguen fins als 60 px (58 del cadenat més 2) i la hero
cedeix la diferència, o sigui que els aires són **simètrics sempre**. Amb els 6/8 pelats el
cadenat queia 1,2 px **dins** de la hero (mesurat).

| vista | alçada de la hero (aspecte) | aire dalt / baix |
|---|---|---|
| **1200×720** (viewport exacte) | **269** (4,1) | **60 / 60** |
| **1200×720** (finestra: 586 de viewport) | **135** (8,2) | **60,7 / 59,3** |
| 1200×800 i 1200×742 (no és el format) | 349,1 (3,2) | com sempre |
| 1920×1080 | 362,7 (3,2) | 50 px de sota (com sempre) |
| 1440×900 | 271,7 (3,2) | 50 px de sota |
| 1366×946 i 1280×666 | 178,9 (5,3) | 25 / 0 px de sota |
| 1024×690 | 298,2 (3,2) | 50 px de sota |
| 1376×954 | 456,8 (2,6) | 50 px de sota |
| 1032×1304 | 639,6 (1,5) | com sempre |

## 3duodevicies. El marge invisible de la samarreta de la hero (04/10/2026)

En Marc: «la samarreta no està posada com a mi m'agradaria. A la primera franja hi ha aire per
sobre de la imatge i a la cinquena n'hi ha per sota. La samarreta hauria d'omplir les franges
completament, si no, tinc una mesura que he de tenir en compte, però que no veig».

**La mesura que no es veu és el marge transparent del mockup**: el dibuix de la samarreta no
arriba a les vores del fitxer (800×800). Mesurat amb l'alfa de les imatges que fa servir el pla
(`mockup-gildan-t-shirt-*.webp`, que comparteixen plantilla): **18 px per dalt (2,25 %)** i
**33 px per baix (4,13 %)**. L'ice-grey en fa 20 i 36, o sigui que entre colors hi ha ±0,25 %,
menys d'1 px quan la franja en fa 90.

**La correcció**: la capa de cada franja s'escala perquè el *dibuix* ompli la capa
(`1 / (1 − 0,0225 − 0,0413) = 1,0682`) i es puja el seu marge de dalt, ja escalat
(`0,0225 × 1,0682 = 2,40 %`). Va a les **dues** capes —la samarreta i el dibuix de la
col·lecció— perquè el dibuix no es mogui del pit: com que la transformació és la mateixa, la
relació entre les dues es conserva.

Mesurat al DOM: `matrix(1.06815, 0, 0, 1.06815, 0, -378.09)` a la cinquena franja
(−(4 × 20 %) − 2,40 % de 458,8 = −378,07). Amb això el dibuix arriba a la vora de dalt i a la de
baix: l'aire de la primera i de la cinquena franja és zero.

**Si algun dia canvien els mockups** (altres colors, una altra plantilla), el marge s'ha de
tornar a mesurar: n'hi ha prou de carregar la imatge en un canvas i buscar la primera i l'última
fila amb alfa.

## 3terdecies. Els 8/10, a tots els horitzontals (04/10/2026)

En Marc: «Per què tinc la sensació que no a tot arreu hi ha aplicada la norma del 8/10?» i, quan
se li va preguntar l'abast, «A tots els formats horitzontals, vols dir, oi?». Sí: la hero es
reparteix en **desens** (1/10 d'aire, 8/10 de franges, 1/10 d'aire) a **tots els formats
horitzontals de 768 en amunt** —que és on hi ha megaslide, com diu `esMobilAqui`—. Els
**verticals** es queden com estaven (la seva proporció i els aires de 50/25/0 px).

Això substitueix el gate que hi havia (només els portàtils de 1200 i 1280 amb alçada 586 o 720),
que venia del «T'he dit que ho apliquessis a 1200x720. Enlloc més».

| vista | hero (aspecte) | aire dalt / baix |
|---|---|---|
| 1920×1080 | 568,8 (2,0) | 71 / 71,1 |
| 1440×900 | 471,2 (1,8) | 58,8 / 58,9 |
| 1366×946 | 520 (1,8) | 65 / 65 |
| 1280×666 | 296 (3,2) | 38,6 / 35,4 |
| 1200×800 | 375,2 (2,9) | 48,4 / 45,4 |
| 1180×820 | 391,2 (2,8) | 49,2 / 48,7 |
| 1024×690 | 315,2 (3,0) | 39,4 / 39,4 |
| 1376×954 | 473,6 (2,5) | 59,3 / 59,2 |
| 844×390 (mòbil girat) | 122,4 | 15,3 / 15,3 |
| 1032×1304 i 768×952 (verticals) | 639,6 i 234,8 | com sempre |

## 3quaterdecies. La icona de barrejar, entre la cintura i el cadenat (04/10/2026)

En Marc: «Centra la icona shuffle entre la cintura de la imatge de la samarreta i el cadenat. En
X». Es calcula i no s'escriu, perquè l'amplada de la imatge de la samarreta depèn de l'alçada de
la hero (el mockup és quadrat i es pinta amb `auto 100 %` de la capa, que fa l'alçada del
rectangle més els 2 px del darrer gap) i el cadenat es mou amb la disposició.

- **La cintura, dins de la imatge: 0,775 de l'amplada.** Mesurat amb l'alfa, per franges: la 1
  (espatlles) 0,911; la 2 (manigues) 0,959; la 3 0,834; la 4 0,774; la 5 (baix) 0,779.
- El botó va al **punt mig** entre aquesta vora i la vora esquerra del cadenat, que es llegeix del
  DOM (`img[src*="cadenat"]`). Es recalcula amb un `ResizeObserver` de la caixa i amb el `resize`
  de la finestra.

| vista | centre del botó | punt mig real |
|---|---|---|
| 1376×954 | 1026 | 1026,4 |
| 1920×1080 | 1298,5 | 1298,1 |
| 1280×666 | 887,5 | 887 |
| 1024×690 | 765,5 | 765,6 |

## 3quindecies. Quotes a la hero: la mida del dibuix i la clau duplicada (04/10/2026)

En Marc: «Quotes i First Contact han tornat a petar», concretat amb «a la hero: les franges
d'aquestes col·leccions surten malament».

**La causa**: `HERO_DIBUIX_MIDA` (la mida afinada de cada dibuix de la hero) té les claus amb les
rutes **velles**. Diu `austen/it-is-a-truth-b-stripe.webp` quan el fitxer és a
`austen/quotes/black/it-is-a-truth-b-stripe.webp`: els dibuixos es van reorganitzar en carpetes de
col·lecció i de tinta i el mapa no s'hi va actualitzar. Amb la cerca exacta, **cap dibuix de
Quotes** agafava la seva mida i queien tots al 30 % de defecte, en comptes de 12,16 / 4,8 / 2,4.

**La solució** (a `HeroInici`): es prova la ruta sencera, després el **nom del fitxer** i, si
només hi és l'altra tinta, la **germana**. La mida només depèn del dibuix i no de la tinta: al
mapa, `the-phoenix` té les dues entrades i són idèntiques (46,585 i 42,35). El nom és únic perquè
porta la tinta (`-b-` / `-w-`). Verificat: els vuit dibuixos de Quotes del pla (les dues tintes)
ara prenen la mida del mapa.

**La clau duplicada, fora** («Neteja-ho ara»): `austen/i-admire-and-love-you-b-stripe.webp` hi era
dues vegades, amb `tauleta: 6` i amb `tauleta: 12,8`. En JavaScript guanyava la segona, o sigui
que el comportament no canvia; i 12,8 és també el que té la seva bessona `it-is-a-truth`, que fa
el mateix 12,16 a escriptori. El mapa queda amb 14 entrades i cap duplicada.

**Pendent** (no tocat): els altres dibuixos de First Contact (`vulcans-end`, `plasma-escape`,
`dj-vader`, `r2d2-quote`, `pont-del-diable`…) no són al mapa i van amb el 30 % de defecte. Si
algun surt malament, cal la seva mida.

## 4. El que queda (i no s'ha tocat)

**Galaxy Tab S9 (533) i Galaxy Tab S9+ (584)**: avui són mòbil i, si fossin tauleta
vertical, la taula de caselles (992 px fixos) donaria un carril de 453 i una columna
d'uns 90 px (uns 70 amb els marges de la casella). **Cal refer la taula per a amplades
estretes**: és una decisió de disseny, no un límit. En Marc ho va deixar fora d'aquest
canvi.

I els quatre casos que `PLA-estructura-general-dispositius.md` §1.4 ja documenta com a
decisions (els portàtils 1280/1366, els sis telèfons girats) segueixen igual.
