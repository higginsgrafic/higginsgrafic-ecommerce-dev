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

## 4. El que queda (i no s'ha tocat)

**Galaxy Tab S9 (533) i Galaxy Tab S9+ (584)**: avui són mòbil i, si fossin tauleta
vertical, la taula de caselles (992 px fixos) donaria un carril de 453 i una columna
d'uns 90 px (uns 70 amb els marges de la casella). **Cal refer la taula per a amplades
estretes**: és una decisió de disseny, no un límit. En Marc ho va deixar fora d'aquest
canvi.

I els quatre casos que `PLA-estructura-general-dispositius.md` §1.4 ja documenta com a
decisions (els portàtils 1280/1366, els sis telèfons girats) segueixen igual.
