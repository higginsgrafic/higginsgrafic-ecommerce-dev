/**
 * GEOMETRIA DECLARADA DEL MEGASLIDE
 * -----------------------------------------------------------------------------
 * Aquest modul es la font de veritat dels numeros de la composicio del
 * megaslide que NO cal mesurar: surten de la finestra i del disseny.
 *
 * PER QUE EXISTEIX
 *
 * La composicio es va calibrar a ma, a la pantalla, i cada numero va acabar amb
 * un bucle que el tornava a mesurar quan una altra peca es movia. D'aqui sortien
 * dotze valors calibrats, cinc bucles, temporitzadors de 180/250/340/400 ms i
 * resultats que depenien de l'ordre en que arribaven les mesures. Pero els
 * numeros de disseny JA SON els numeros mesurats: quan s'han substituit mesures
 * per declaracions, han coincidit al centesim (mesurat el 25-26/09/2026):
 *
 *   carril a 1920        1143 px  (declarat) = 1143 px (publicat pel header)
 *   x del carril a 1920   381 px  (declarat) =  381 px
 *   carril a 1512         898 px  (declarat) =  898 px
 *   x del carril a 1512   300 px  (declarat) =  300 px
 *   amplada de la filera
 *   de la franja         852,05 px (declarat) =  852 px (mesurat al DOM)
 *
 * El que encara es mesura (i per que) ho diu el PLA de neteja del calibratge:
 * les mides de la graella depenen de l'amplada del retall (que depen de les
 * columnes de la filera) i aixo encara no esta declarat. Aqui nome's hi ha el
 * que ja quadra, amb la seva prova, perque allo que es declara no es pot
 * desquadrar mai mes.
 */

import { carrilDeclarat, laneForViewport } from '../../utils/layoutModel';
import { MEGASLIDE_REFERENCIA_PX, escalaMegaslide } from '../../utils/layoutMetrics';
import { desplacamentFranjaEscriptori } from '../../utils/mesuraMegaslide';

/**
 * Les mides del fitxer de la franja (la matriu de samarretes).
 *
 * Son les MATEIXES que porten els atributs `width`/`height` de la imatge
 * (`MegaStripePanel` i `MegaStripePanelP1`): declarades a tot arreu, la filera
 * de la franja te amplada ABANS que la imatge arribi, i l'escala que la porta al
 * carril es pot calcular a la primera mesura. Sense elles la filera fa zero
 * d'amplada fins que la imatge es decodifica i la franja es pinta amb l'escala
 * de disseny (mesurat: 300 ms, i despres encongia).
 */
export const FRANJA_FITXER_AMPLADA = 2866;
export const FRANJA_FITXER_ALCADA = 307;
export const FRANJA_FITXER_ASPECTE = FRANJA_FITXER_AMPLADA / FRANJA_FITXER_ALCADA;

/**
 * El carril de la finestra: 3/5 de l'amplada de LAYOUT (sense la barra de
 * desplacament) i la seva x, que es el que publica el header com a
 * `--hg-mega-w` i `--hg-mega-x`.
 *
 * Es el que fa servir la mesura de la franja quan el header encara no ha
 * publicat les variables (el seu efecte corre DESPRES del de la franja). Amb el
 * valor declarat, l'escala de la franja no canvia quan les variables arriben.
 *
 * @param {number} ampleLayout amplada de layout en px (documentElement.clientWidth)
 * @param {number} alcadaLayout alcada de la finestra en px (window.innerHeight)
 *   La classe de dispositiu es decideix amb TOTES DUES: amb l'alcada a zero una
 *   finestra de 1512x900 es classificava com una altra cosa i el carril sortia
 *   d'una altra regla (mesurat: la franja es pintava amb l'escala de disseny i
 *   feia un salt de 178 px).
 * @returns {{carril:number, x:number, escala:number}|null}
 */
export function carrilDeFinestra(ampleLayout, alcadaLayout) {
  const carril = carrilDeclarat({ ample: ampleLayout, alt: alcadaLayout });
  if (!carril) return null;
  return {
    carril,
    x: Math.round((ampleLayout - carril) / 2),
    escala: carril / MEGASLIDE_REFERENCIA_PX,
  };
}

/**
 * L'amplada que fa la filera de cossos de la franja amb la seva alcada
 * declarada: alcada × el aspecte del fitxer.
 *
 * Es el que es mesurava al DOM (`el.offsetWidth`) i el que bloquejava l'escala
 * de la franja fins que la imatge era a memoria.
 *
 * @param {number} alcadaFila amplada declarada de la filera (carrilPx(stripePreviewHPx))
 * @returns {number} amplada en px
 */
export function ampladaFilaFranja(alcadaFila) {
  if (!Number.isFinite(alcadaFila) || alcadaFila <= 0) return 0;
  return alcadaFila * FRANJA_FITXER_ASPECTE;
}

/**
 * L'AMPLADA DELS DIBUIXOS DE LA FRANJA, DECLARADA (26/09/2026)
 * -----------------------------------------------------------------------------
 * Les 244 entrades de `STRIPE_DRAWING_CALIBRATIONS` (una per dibuix) no son 244
 * decisions: son una BASE i mitja dotzena d'excepcions. Mesurat sobre les 224
 * entrades de la franja (`scripts/_tmp-regla-dibuixos.mjs`, temporal):
 *
 *   - TOTS els fitxers de dibuix fan 256 px d'amplada; el que varia es l'alcada
 *     (24 … 615 px).
 *   - Multiplicant l'escala calibrada per l'amplada natural, l'amplada
 *     renderitzada de la gran majoria cau entre 74 i 88 unitats (mitjana 79,4).
 *   - Les desviacions son decisions de disseny: `nx-01` 56, els cubics 60-64 i
 *     `the-phoenix` 143.
 *
 * Unitats: les de la franja, que fa 2866 px en el seu fitxer i te 14 cossos de
 * 2740/14 = 195,7 unitats. O sigui que el dibuix fa el 41 % del cos.
 */
export const DIBUIXOS_FRANJA_AMPLADA_NATURAL = 256;
export const DIBUIXOS_FRANJA_AMPLADA = 80;
export const DIBUIXOS_FRANJA_FRACCIO_COS = DIBUIXOS_FRANJA_AMPLADA / (2740 / 14);
export const DIBUIXOS_FRANJA_DY = 28.75;
export const DIBUIXOS_FRANJA_DX = 0;

/**
 * L'escala declarada per a un dibuix de la franja: la que fa que ocupi
 * `DIBUIXOS_FRANJA_AMPLADA` unitats, sigui quina sigui la mida del fitxer.
 *
 * Es el que substitueix el camp `scale` de cada entrada del mapa.
 *
 * @param {number} ampladaNatural amplada del fitxer del dibuix, en px
 * @returns {number} escala (1 quan no es pot calcular)
 */
export function escalaDibuixFranja(ampladaNatural) {
  if (!Number.isFinite(ampladaNatural) || ampladaNatural <= 0) return 1;
  return DIBUIXOS_FRANJA_AMPLADA / ampladaNatural;
}

/**
 * LA SILUETA NEGRA DE LA MASCARA DEL VEL, RETALLADA AL COS (26/09/2026)
 * -----------------------------------------------------------------------------
 * El vel de les samarretes que no son de la colleccio activa es pinta amb la
 * SILUETA SENCERA (la casa 0 del full: 305,56 x 306,03 unitats, manigues
 * incloses) escalada a la CASELLA de la seva casa (241,71 d'amplada a la
 * franja d'una filera). Com que la silueta es mes ampla que la casella, en
 * surt 31,93 unitats per cada costat.
 *
 * La MASCARA del vel (`hgVelSamarretaVisible`) pinta casa per casa, en ordre,
 * la silueta BLANCA si la casa demana vel i NEGRA si es activa: on mana una
 * samarreta activa, no hi ha vel (aixo evita que el vel taqui el tint d'una
 * samarreta de color, ho va veure l'amo: «el canto esquerre» de la primera
 * samarreta activa). Pero com que la silueta NEGRA d'una casa activa tambe
 * surt de la seva casella, la seva MANIGA cau a sobre del cos de la casa
 * velada del costat i li esborra el vel: queda un forat amb forma de rombe a
 * l'intersseccio de les dues siluetes.
 *
 * Mesurat amb la sonda del vel pintat de vermell i l'SVG aillat
 * (`_tmp-vel-aïlla.mjs`, temporal): la mascara, sola, deixava el vel tallat a
 * 23-47 px de cada costat de la casa activa (31,93 unitats = 23 px a 1920),
 * que son exactament les manigues de les cases del costat.
 *
 * La cura es retallar NOME'S les siluetes NEGRES de la mascara a la finestra
 * del COS de la seva casa: aixi la casa activa segueix protegint el seu propi
 * cos (que es on hi ha el tint) i la seva maniga ja no pot esborrar el vel de
 * la veina. El vel (les siluetes blanques) NO es retalla: ha de cobrir tota la
 * samarreta, manigues incloses, que es el que l'amo va demanar el 25/09.
 *
 * Comprovat amb `_tmp-vel-aïlla.mjs`: amb la mascara retallada el vel de les
 * catorze cases te una cobertura continua (0..850 i 1772..2864 amb la
 * MISCEL·LANIA activa) en comptes dels trams de 182 unitats amb forats de 16.
 *
 * D'on surten els numeros (tots dos del full de l'amo, `vectorFranja.js`):
 *   - la silueta sencera (la casa 0 del full): x de 0 a 305,56;
 *   - el cos (el cami de l'area d'impressio, `CLIC_AREA_ESTRETA`): x de 64,21 a
 *     245,38, o sigui 181,17 d'amplada i el centre a 154,79.
 */

/** L'amplada de la finestra del cos, en fraccio de l'amplada de la silueta sencera. */
export const VEL_AMPLADA_COS_FRACCIO = 181.17 / 305.56;

/**
 * La finestra (en el sistema de la silueta escalada) que limita el cos d'una
 * casa: el rectangle on la seva silueta NEGRA pot esborrar el vel.
 *
 * Centrada a la caixa de la silueta i amb la seva alcada: el cos i la
 * samarreta sencera tenen el mateix abast vertical (de 14,2 a 317,9 unitats).
 *
 * @param {{x:number,y:number,w:number,h:number}} caixa la caixa on s'ha escalat
 *   la silueta (la casella de la casa, en unitats de la imatge del vel)
 * @returns {{x:number,y:number,w:number,h:number}|null} la finestra, o null si
 *   la caixa no es valida
 */
export function finestraCosVel(caixa) {
  const x = Number(caixa?.x);
  const y = Number(caixa?.y);
  const w = Number(caixa?.w);
  const h = Number(caixa?.h);
  if (![x, y, w, h].every((v) => Number.isFinite(v)) || w <= 0 || h <= 0) return null;
  const ample = w * VEL_AMPLADA_COS_FRACCIO;
  return { x: x + (w - ample) / 2, y, w: ample, h };
}

/**
 * ELS AJUSTOS DE LA COMPOSICIO, DECLARATS (26/09/2026)
 * -----------------------------------------------------------------------------
 * Aquests numeros son de DISSENY: no es mesuren, es declaren. Vivien escampats
 * pels components (un `export` a la franja de la pagina 1 i un `-10` en línia a
 * la pagina 2). Son aqui perque tots els numeros de la composicio siguin al
 * mateix lloc i es puguin llegir junts.
 */

/** Els 10 px que la franja de la pagina 1 i la de la pagina 2 baixen a
 *  l'escriptori (abans `FRANJA_AJUST_PX` a MegaStripePanelP1). */
export const AJUST_FRANJA_ESCRIPTORI_PX = 10;

/** La tauleta apaissada tambe baixa 10 px, i en fa la compensacio propia: es
 *  el `-10` que hi havia en línia al `visualOffsetY` de la pagina 2. */
export const AJUST_FRANJA_TAULETA_APAISSADA_PX = -10;

/** Els 20 px de marge extra de la pestanya a l'escriptori ample (abans
 *  `MARGE_EXTRA_DESKTOP_PX` a MegaMenuPanel). */
export const MARGE_EXTRA_ESCRIPTORI_PX = 20;

/**
 * EL COIXI DE DALT DEL PANELL, RETALLAT PER FER LLOC A LA TDP (28/09/2026)
 * -----------------------------------------------------------------------------
 * Ho va demanar l'amo: «Vull que li posis 30 px d'aire per sobre i per sota a
 * la p2. 30 px del top de la p2 al bottom del header i 30 px des del bottom de
 * la p2 al final del megaslide (l'hauràs de fer més baix)», i tot seguit va
 * recordar per què: la reorganitzacio de proporcions era per fer la stripe mes
 * petita i ALLIBERAR ESPAI per a la TDP i per a la hero.
 *
 * El coixi vertical del panell es el `py-8` (32 + 32) del contenidor
 * `mx-auto max-w-[1350px] ... py-8` de `MegaMenuPanel`, i el comparteixen les
 * DUES pagines. L'aire de dalt de la pagina 2 es aquest coixi mes el top propi
 * de la seva filera dins el contingut del panell (`--hg-cercador-bar-top` +
 * `topVisualAlignmentY` + 20), que a 1920x946 val 21,4 px (el retall comenca a
 * 106,4 px i el contingut del panell a 85: 106,4 - 85). Amb els 32 px del
 * `py-8`, l'aire era 53,4 px (106,4 menys el bottom del header, 53: el header
 * fa 52 px mes 1 px de vora); per deixar-lo a 30 cal 8,6 px (30 - 21,4).
 *
 * PER QUE NOMES ES POT FER AIXÍ (i no movent només la pagina 2):
 *
 *  - La filera de la pagina 2 NO te posicio propia: el bucle
 *    `alignTopRowToPage1` (a `MegaslidePagina2`) la posa cada cop perque el seu
 *    boto Color caigui exactament on cau el de la pagina 1. Qualsevol
 *    desplacament que nome's afectes la pagina 2 el desfaria el bucle en 180 ms
 *    (i el tornaria a desfer als 340 ms). Les dues fileres son la mateixa peça.
 *  - Per tant, l'unic que pot pujar el contingut de la pagina 2 es l'espai de
 *    sobre, que es compartit: els 23,4 px que es retallen aqui tambe pugen el
 *    contingut de la pagina 1.
 *
 * CONSEQÜENCIES MESURADES (1920x946):
 *
 *  - l'aire de dalt de la pagina 2 passa de 53,4 a 30,0 px  <- el que demanava
 *  - el de la pagina 1 passa de 44,9 a 21,5 px (la seva graella es mes alta
 *    —110 px— i el seu contingut comenca 8,5 px mes amunt que el retall de la
 *    pagina 2)
 *  - l'aire de baix NO es toca: el panell acaba `P1_STRIPE_BOTTOM_GAP` (30) px
 *    sota la tinta de les samarretes, i com que tot el contingut puja igual,
 *    el panell tambe acaba 23,4 px mes amunt (es a dir, el megaslide queda mes
 *    baix, que es el que demanava: de 386 a 362,6 px)
 *  - el megaslide fa 23,4 px menys: aquest es l'espai que queda lliure
 *
 * A les tauletes i al mobil NO s'aplica (alla el panell te les seves alcades
 * declarades, i a la vertical el `-32px` de `marginTop` cancel·la el coixi).
 */
export const PADDING_DALT_PANELL_ESCRIPTORI_PX = 8.6;

/** El coixi de baix del panell (la meitat baixa del `py-8`): no es toca. */
export const PADDING_BAIX_PANELL_PX = 32;

/** El coixi vertical del panell tal com era (i com es a tauletes i mobil). */
export const PADDING_VERTICAL_PANELL_PX = 64;

/** El coixi vertical del panell a l'escriptori, despres del retall. */
export const PADDING_VERTICAL_PANELL_ESCRIPTORI_PX =
  PADDING_DALT_PANELL_ESCRIPTORI_PX + PADDING_BAIX_PANELL_PX;

/**
 * EL PAGELIFT DE LA PÀGINA 1, DECLARAT (26/09/2026)
 * -----------------------------------------------------------------------------
 * La pàgina 1 es puja (`transform: translateY(-pageLift)`) perquè el seu bloc
 * (el selector i les files) quedi a la mateixa alçada que el de la pàgina 2. El
 * valor es convergia amb un bucle que mesurava el selector de la pàgina 1 i el
 * del panell (`deltaObjectiuPageLift`), però el punt fix és una resta:
 *
 *   pageLift = top natural del selector de la pàgina 1 - desplaçament
 *
 * `desplaçament` és 20 px a l'escriptori i 10 px a les tauletes
 * (`deltaObjectiuPageLift`).
 *
 * EL BLOQUEIG DE LA PÀGINA 1 AMB LA 2 (26/09/2026)
 * -----------------------------------------------------------------------------
 * L'amo va demanar que les files de la pàgina 1 caiguessin a les mateixes
 * posicions que les de la pàgina 2, i va triar que baixés TOT el bloc (selector
 * i files junts). Mesurat a 1920x946 abans del canvi:
 *
 *   selector p1    top  73,0   centre 127,7   | p2 top  86,8   centre 146,3
 *   retall dibuixos p1 top 73,0 (el botó)     | p2 top  81,8 (les dues files)
 *   franja         p1 top 232,9               | p2 top 222,9
 *
 * o sigui que el bloc de la pàgina 1 anava **18,6 px per sobre** del de la
 * pàgina 2 a totes les classes de dispositiu (el `desplaçament` de 20 ja hi
 * era). El top natural del selector dins el panell és el que es declara aqui:
 *
 *   TOP_SELECTOR = 39,52 - 18,6 = 20,92 px
 *
 * (els 39,52 eren els 32 px del `py-8` del panell més el `mt-2` del selector,
 * que el navegador hi deixa a 7,52; mesurat a 1920, 1440, 1512, 1680, 2000,
 * 2560, 1400, 1366x768, 1280x720, 1024x768 i 768x1024).
 *
 * A la vista vertical no s'hi aplica (el valor és 0).
 *
 * @param {object} o
 * @param {boolean} [o.isPortraitTablet]
 * @param {boolean} [o.isLandscapeTablet]
 * @returns {number} px
 */
export const AJUST_FILES_PAGINA1_PX = 18.6;
export const TOP_SELECTOR_PAGINA1_PX = 39.52;
/** El top natural del selector a l'escriptori, ja amb l'ajust de les files:
 *  `TOP_SELECTOR_PAGINA1_PX - AJUST_FILES_PAGINA1_PX` = 20,92 px. */
export const TOP_SELECTOR_ESCRIPTORI_PAGINA1_PX = TOP_SELECTOR_PAGINA1_PX - AJUST_FILES_PAGINA1_PX;

export function pageLiftPagina1({
  ample = 0, alt = 0, isPortraitTablet = false, isLandscapeTablet = false,
} = {}) {
  if (isPortraitTablet) return 0;
  const desplacament = isLandscapeTablet ? 10 : 20;
  // A l'escriptori el bloc de la pagina 1 va 18,6 px per sobre del de la
  // pagina 2 (mesurat a 1920, 1440 i 2560); a la banda estreta i a les
  // tauletes els dos blocs JA cauen al mateix lloc (mesurat a 1366x768 i
  // 1024x768: 118,9 contra 118,2 i 108,2 contra 108,0).
  const ajust = esEscriptoriPagina1({ ample, alt, isLandscapeTablet }) ? AJUST_FILES_PAGINA1_PX : 0;
  return Math.max(0, TOP_SELECTOR_PAGINA1_PX - ajust - desplacament);
}

/**
 * Si el bloc de la pagina 1 s'ha de baixar per quadrar-lo amb el de la p2.
 *
 * Nomes a l'escriptori: la banda estreta (768-1366 apaisada) i les tauletes ja
 * hi cauen soles. La finestra de referencia es la d'`desplacTopSelector`
 * (768-1366 apaisada = banda estreta).
 */
export function esEscriptoriPagina1({ ample = 0, alt = 0, isLandscapeTablet = false } = {}) {
  const banda = Number.isFinite(ample) && Number.isFinite(alt)
    && ample >= 768 && ample <= 1366 && ample >= alt;
  return !isLandscapeTablet && !banda;
}

/**
 * L'AMPLADA DEL RETALL DE LA GRAELLA, DECLARADA (26/09/2026)
 * -----------------------------------------------------------------------------
 * El retall (la finestra del carrusel de dibuixos) era l'ULTIM input mesurat de
 * les mides de la graella: es llegia del DOM (`el.clientWidth`). La resta
 * (`midesGraellaCompacta`) ja son proporcions del carril. Aqui es declara.
 *
 * La filera de la pagina 2 (`CercadorTextRow`) es construeix aixi:
 *   - va enrasada a la DRETA del carril i arrenca on acaba el selector mes
 *     10 px: `carrilPx(midaSelector / 2 + 10)`. Amb el selector de 120, son
 *     `carrilPx(70)` = `70 x escala`;
 *   - te dues columnes separades per un `columnGap` de 20 px FIXES: la de la
 *     graella (`minmax(0, 1fr)`) i la de la dreta, que es del disseny
 *     (`carrilLane(142)` = 142/1350 del carril);
 *   - dins la columna de la graella, el retall deixa el bloc de fletxes
 *     (`carrilPx(60)`) mes `carrilPx(10)`, o sigui `70 x escala`.
 *
 * L'escala es la del megaslide (`--hg-escala-mega`): `laneForViewport` sobre la
 * referencia de 1350 (vegeu `FullWideSlideHeader`).
 *
 * Comprovat contra el `getBoundingClientRect()` del retall: 1920 -> 864
 * (mesurat 863,94), 1512 -> 674 (674,36), 1440 -> 641 (641,17) i
 * 2560 -> 1161 (1160,89).
 */
// LA COLUMNA DE LA DRETA (2a columna de la filera): el gap ENTRE la graella i
// la columna mes l'amplada de la columna. El que es veu a la captura de l'amo
// (26/09/2026) es una COLUMNA mes ampla amb la vora esquerra 10 px mes a
// l'esquerra, i el gap de 20 unitats.
export const GRAELLA_COLUMNA_DRETA_CARRIL_PX = 152;
// EL GAP ENTRE LA GRAELLA (LES FLETXES) I LA COLUMNA DE COLLECCIONS: 10 px
// (26/09/2026, ho va demanar l'amo: «Deixa 10 px de gap amb les fletxes»).
// L'amplada de la columna i el gap han de sumar 142 + 20 = 162 unitats: amb la
// columna a 152 el gap son 10 unitats, que a 1920 fan 10,0 px (la unitat real
// es `carril / 1350` = 1143/1350 = 0,8467). Aixi la vora dreta de la filera no
// es mou i el carrusel queda exactament igual d'ample que abans.
export const GRAELLA_GAP_COLUMNES_PX = 6.5;
export const GRAELLA_ESQUERRA_SELECTOR_CARRIL_PX = 70; // selector/2 (60) + 10
export const GRAELLA_DRETA_FLETXES_CARRIL_PX = 70; // fletxes (60) + 10
export const GRAELLA_BARRES_COLORS = 14;
export const GRAELLA_FILA_GAP_PX = 10;

/**
 * L'amplada de la columna de la graella (la que conte el retall dels dibuixos i
 * la tira de colors): la filera menys l'aresta del selector, el `columnGap` de
 * 20 px i la columna de la dreta (`carrilLane(142)`).
 *
 * El RETALL encara hi resta el bloc de fletxes (`70 x escala`) als escriptoris;
 * a les tauletes el `reservaDreta` es 0 i la tira fa tota la columna.
 */
export function ampladaColumnaGraella({ carril, midaSelector, escala }) {
  const e = Number.isFinite(escala) && escala > 0 ? escala : 1;
  const esquerra = (midaSelector / 2 + 10) * e;
  return carril
    - esquerra
    - GRAELLA_GAP_COLUMNES_PX
    - (carril * GRAELLA_COLUMNA_DRETA_CARRIL_PX) / MEGASLIDE_REFERENCIA_PX;
}

/**
 * L'amplada del retall de la graella a partir de la finestra.
 *
 * @param {number} ampleLayout amplada de layout en px (`getLayoutViewportWidth`, que
 *   es `document.body.clientWidth`: exclou la barra de desplac,ament)
 * @param {number} alcadaLayout alcada de la finestra en px (window.innerHeight)
 * @returns {number|null} amplada en px, o null si la classe te regle propi
 */
export function ampladaRetallGraella(ampleLayout, alcadaLayout) {
  const carril = carrilDeclarat({ ample: ampleLayout, alt: alcadaLayout });
  if (!carril) return null;
  const escala = escalaMegaslide(laneForViewport(ampleLayout));
  const columnaDreta = (carril * GRAELLA_COLUMNA_DRETA_CARRIL_PX) / MEGASLIDE_REFERENCIA_PX;
  return Math.round(
    carril
    - GRAELLA_ESQUERRA_SELECTOR_CARRIL_PX * escala
    - GRAELLA_GAP_COLUMNES_PX
    - columnaDreta
    - GRAELLA_DRETA_FLETXES_CARRIL_PX * escala
  );
}

/**
 * L'ALCADA DEL SELECTOR I DE LES SEVES TRES CEL·LES, DECLARADA (26/09/2026)
 * -----------------------------------------------------------------------------
 * El contenidor del selector fa `carrilPx(midaSelector)` = `midaSelector x
 * escala` (MegaslidePagina2), i les tres cel·les (BLANC, COLOR i NEGRE) fan la
 * mateixa alcada. El bucle de les dues files de dibuixos ho MESURAVA del DOM
 * (`selector.getBoundingClientRect().height`); aqui es declara.
 *
 * Comprovat: `120 x escala` dona 119,02 / 89,07 / 93,60 / 159,02 a 1920 / 1440
 * / 1512 / 2560, i el DOM mesura 119 / 89,06 / 93,59 / 159.
 */
export function alcadaSelector(midaSelector, escala) {
  if (!Number.isFinite(midaSelector) || midaSelector <= 0) return 0;
  const e = Number.isFinite(escala) && escala > 0 ? escala : 1;
  return midaSelector * e;
}

/** La cella del selector (BLANC, COLOR o NEGRE): un terc de la pastilla. */
export function alcadaCellaSelector(midaSelector, escala) {
  return alcadaSelector(midaSelector, escala) / 3;
}

/**
 * EL DESPLAÇAMENT NET DE DISSENY DEL SELECTOR (`desplacTop`), DECLARAT
 * -----------------------------------------------------------------------------
 * Es el numero que lliga la filera i el selector: entra a `centratgeSelectorY`
 * i es, tambe, el `margeDalt` de la columna de colleccions (el top de la filera
 * menys el top de la pastilla). Es declara de la mateixa manera que ho fa
 * `MegaslidePagina2`:
 *
 *   desplacTop = top extra de la filera + top de la filera dins el contenidor
 *                - top del contenidor del selector - `mt-2` de la pastilla
 *
 * A l'escriptori val 12 (20 + 40 - 40 - 8); a la banda estreta, -6, i a la
 * tauleta apaissada, -8.
 *
 * @param {object} o
 * @param {number} o.ample amplada de la finestra (window.innerWidth)
 * @param {number} o.alt alcada de la finestra (window.innerHeight)
 * @param {boolean} [o.isLandscapeTablet]
 * @param {number} [o.mtPill=8] el `mt-2` de la pastilla dins l'embolcall
 * @returns {number} px
 */
/**
 * ELS DOS AJUSTOS DE LA COLUMNA DE COLLECCIONS (27/09/2026)
 * -----------------------------------------------------------------------------
 * La columna dels nou noms de colleccions ha d'anar **alineada pel top amb el
 * selector Blanc/Color/Negre** i **pel bottom amb la franja de samarretes**: ho
 * va demanar en Marc («la columna ha d'anar alineada pel top al selector b/c/n i
 * per sota al bottom de la stripe»).
 *
 * La geometria de la columna es declarada (`desplacTopSelector` menys el
 * `centratgeSelectorY`, i el sostre de la franja mes la seva alcada), pero la
 * mesura al navegador donava 2 px de mes a cada banda: la columna començava a
 * y109,9 (el selector, a y111,9) i acabava a y356,5 (la franja, a y354,5). Amb
 * aquests dos ajustos (el top es RESTA i el baix tambe) cau exactament:
 * y111,9 .. y354,5, o sigui **242,6 px** d'alcada en comptes de 246,6.
 *
 * Son DECLARATS i amb prova unitaria, com la resta d'aquesta feina.
 */
export const COLUMNA_TOP_AJUST_PX = 2;
export const COLUMNA_BAIX_AJUST_PX = 2;

export function desplacTopSelector({ ample, alt, isLandscapeTablet = false, mtPill = 8 }) {
  const banda = Number.isFinite(ample) && Number.isFinite(alt) && ample >= 768 && ample <= 1366 && ample >= alt;
  const esBandaEstreta = !isLandscapeTablet && banda;
  const topFileraDins = 40 - (esBandaEstreta ? 38 : 0);
  const extraTop = isLandscapeTablet ? 5 : (banda ? 45 : 20);
  const topSelector = 40 + (banda ? 5 : 0);
  return extraTop + topFileraDins - topSelector - mtPill;
}

/**
 * EL CENTRATGE DEL SELECTOR, DECLARAT (26/09/2026)
 * -----------------------------------------------------------------------------
 * El selector Blanc/Color/Negre s'havia de centrar amb la filera (la graella de
 * dibuixos mes la fila de colors) i aixo es feia amb un bucle que mesurava els
 * dos centres. Pero els dos costats depenen de les MATEIXES mides declarades, i
 * la formula es exacta:
 *
 *   centre de la filera = centre del selector
 *   -> `selectorCentratgeY = extra + (alcadaFilera - alcadaSelector) / 2`
 *
 * `extra` es el desplac,ament de disseny del contenidor de la filera (20 px a
 * l'escriptori; 45 a la banda estreta i 5 a la tauleta apaissada, vegeu
 * `MegaslidePagina2`), i `alcadaFilera` es:
 *
 *   alcadaCarrusel (les dues files de dibuixos) + carrilLane(40) (la fila de
 *   colors, que es `calc(carrilLane(40) - 10px)` mes el `rowGap` de 10)
 *
 * IMPORTANT: aquest valor NO depen de l'alineacio amb la pagina 1
 * (`topVisualAlignmentY`): les dues peces es mouen juntes, i per aixo el
 * centratge es pot declarar tot sol.
 *
 * Comprovat contra el DOM a 1920, 1440, 1512, 1680, 2000, 2560 i 1400: la
 * diferencia maxima es 0,035 px.
 */
export const GRAELLA_FILA_COLORS_CARRIL_PX = 40;

/** L'alçada de les dues files de dibuixos (el retall del carrusel). */
export function alcadaCarruselGraella(dibuix, gapV) {
  if (!Number.isFinite(dibuix) || dibuix <= 0) return 0;
  const g = Number.isFinite(gapV) && gapV > 0 ? gapV : 0;
  // La peca del carrusel fa 1,5 cops el dibuix.
  return 2 * (1.5 * dibuix + g);
}

/**
 * El desplac,ament vertical del selector perque quedi centrat amb la filera.
 *
 * @param {object} o
 * @param {number} o.midaSelector mida de disseny del selector (`bnSliderSize`)
 * @param {number} o.escala escala del megaslide (`--hg-escala-mega`)
 * @param {number} o.dibuix mida del dibuix de la graella (`midesGraella.dibuix`)
 * @param {number} o.gapV separacio vertical de la graella (`midesGraella.gapV`)
 * @param {number} o.carril amplada del carril (`--hg-mega-w`)
 * @param {number} [o.desplacTop=12] el desplac,ament NET de disseny: el `top`
 *   extra del contenidor de la filera, mes el `top` de la filera dins seu,
 *   menys el `top` del contenidor del selector i el `mt-2` de la pastilla.
 *   A l'escriptori: 20 + 40 - 40 - 8 = 12.
 * @returns {number} px
 */
export function centratgeSelectorY({ midaSelector, escala, dibuix, gapV, carril, desplacTop = 12 }) {
  const alcadaCarrusel = alcadaCarruselGraella(dibuix, gapV);
  const alcadaFilaColors = (carril * GRAELLA_FILA_COLORS_CARRIL_PX) / MEGASLIDE_REFERENCIA_PX;
  const alcadaSel = alcadaSelector(midaSelector, escala);
  return desplacTop + (alcadaCarrusel + alcadaFilaColors - alcadaSel) / 2;
}

/**
 * ELS DESNIVELLS DE LES DUES FILES DE DIBUIXOS, DECLARATS (26/09/2026)
 * -----------------------------------------------------------------------------
 * Les dues files de la graella es col·loquen amb `top: -primera` (la de dalt) i
 * `top: alcadaFila - segona` (la de baix), i aquests desnivells feien que cada
 * fila caigues al centre de la seva cella del selector (BLANC la primera, COLOR
 * la segona). Es MESURAVEN del DOM (`liniesDibuixos` mes el rect del selector) i
 * s'hi anava acumulant la diferencia. Pero tot son mides declarades:
 *
 *   primera = dibuixPx/2 - alcadaFilera/2 + alcadaSelector/3
 *   segona  = alcadaFila + dibuixPx/2 - alcadaFilera/2
 *
 * amb `dibuixPx = 1,5 x dibuix`, `alcadaFila = dibuixPx + gapV` i
 * `alcadaFilera = 2 x alcadaFila + carrilLane(40)` (la fila de colors).
 *
 * Comprovat contra el valor que aplicava el bucle a 1920, 1440, 1512, 1680,
 * 2000, 2560, 1400, 1366x768 i 1280x720: la diferencia maxima es 0,02 px.
 *
 * @returns {{primera:number, segona:number}}
 */
export function desnivellsLiniesGraella({ dibuix, gapV, carril, midaSelector, escala }) {
  const dibuixPx = 1.5 * dibuix;
  const alcadaFila = dibuixPx + gapV;
  const alcadaFilera = alcadaCarruselGraella(dibuix, gapV)
    + (carril * GRAELLA_FILA_COLORS_CARRIL_PX) / MEGASLIDE_REFERENCIA_PX;
  const alcadaSel = alcadaSelector(midaSelector, escala);
  return {
    primera: dibuixPx / 2 - alcadaFilera / 2 + alcadaSel / 3,
    segona: alcadaFila + dibuixPx / 2 - alcadaFilera / 2,
  };
}

/**
 * EL DESNIVELL DE LA TIRA DE COLORS, DECLARAT (26/09/2026)
 * -----------------------------------------------------------------------------
 * La tira de catorze barres de color s'havia de centrar amb la cella NEGRE del
 * selector (la tercera), i aixo es feia amb un bucle que mesurava el centre de
 * la tira i el de la cella. Pero tot son mides declarades:
 *
 *   desnivellColors = alcadaCarrusel + GAP(fila 2) + alcadaBarra/2
 *                     - alcadaFilera/2 - alcadaSelector/3
 *
 * (la cella NEGRE cau a `alcadaSelector x 2,5/3` del capdamunt de la pastilla,
 * i la pastilla esta centrada amb la filera). `alcadaBarra` surt de l'amplada
 * de la tira (l'amplada de la columna de la graella menys la reserva de les
 * fletxes), el `colorGapPx` i l'aspecte 7/2 de cada barra.
 *
 * Comprovat contra el `marginTop` que s'aplicava a 1920, 1440, 1512, 1680,
 * 2000, 2560, 1400, 1366x768, 1280x720, 1024x768 i 768x1024: la diferencia
 * maxima es 0,02 px.
 */
export function desnivellColorsGraella({
  ampleRetall, dibuix, gapV, carril, midaSelector, escala, colorGapPx, barres = GRAELLA_BARRES_COLORS,
}) {
  const alcadaCarrusel = alcadaCarruselGraella(dibuix, gapV);
  const alcadaFilera = alcadaCarrusel + (carril * GRAELLA_FILA_COLORS_CARRIL_PX) / MEGASLIDE_REFERENCIA_PX;
  const alcadaSel = alcadaSelector(midaSelector, escala);
  const ampladaBarra = (ampleRetall - (barres - 1) * colorGapPx) / barres;
  const alcadaBarra = (ampladaBarra * 2) / 7;
  return alcadaCarrusel + GRAELLA_FILA_GAP_PX + alcadaBarra / 2 - alcadaFilera / 2 - alcadaSel / 3;
}

/**
 * EL MARGE DE BAIX DEL BLOC DE FLETXES, DECLARAT (26/09/2026)
 * -----------------------------------------------------------------------------
 * El bloc de fletxes va penjat del retall dels dibuixos, i el seu marge de baix
 * era la diferencia entre el baix del selector i el baix del retall; es mesurava
 * perque «no es constant» (el selector arribava a sortir 5 px mes amunt). Pero
 * els dos baixos surten de les mateixes mides declarades:
 *
 *   margeBaixFletxes = alcadaFilera/2 + alcadaSelector/2 - alcadaCarrusel
 *
 * Comprovat contra el valor que s'aplicava a 1920, 1440, 1512, 1680, 2000,
 * 2560 i 1400: la diferencia maxima es 0,02 px. Nome's s'aplica als escriptoris
 * (a les tauletes no hi ha bloc de fletxes).
 */
export function margeBaixFletxesGraella({ dibuix, gapV, carril, midaSelector, escala }) {
  const alcadaCarrusel = alcadaCarruselGraella(dibuix, gapV);
  const alcadaFilera = alcadaCarrusel + (carril * GRAELLA_FILA_COLORS_CARRIL_PX) / MEGASLIDE_REFERENCIA_PX;
  return alcadaFilera / 2 + alcadaSelector(midaSelector, escala) / 2 - alcadaCarrusel;
}

/**
 * LA BANDA ESTRETA (768-1366 en horitzontal), DECLARADA (26/09/2026)
 * -----------------------------------------------------------------------------
 * Es la condicio que fa que la franja NO baixi els 15 px de disseny: en aquesta
 * banda el belt ja s'ha encongit i el desplaçament deixava el top de la franja
 * per damunt del bottom de la graella de colors (que quedava partida en dues
 * meitats). La portaven DuES copies (MegaStripePanel i MegaStripePanelP1) i
 * havien de coincidir: si una pagina la baixa i l'altra no, les dues franges es
 * desquadren.
 *
 * @param {object} o
 * @param {number} o.ample amplada de la finestra (window.innerWidth)
 * @param {number} o.alt alcada de la finestra (window.innerHeight)
 * @returns {boolean}
 */
export function esBandaEstretaFranja({ ample, alt } = {}) {
  return Number.isFinite(ample) && Number.isFinite(alt)
    && ample >= 768 && ample <= 1366 && ample >= alt;
}

/**
 * LA RESERVA DE LA GRAELLA VELLA I EL SOSTRE DE LA FRANJA, DECLARATS (26/09/2026)
 * -----------------------------------------------------------------------------
 * La franja de samarretes de la pagina 2 no te `top`: cau on cau perque al
 * damunt seu, dins el panell, hi ha la RESERVA de la graella de la pagina 1
 * (les nou columnes de text, que la pagina 2 ja no dibuixa pero ha de reservar
 * perque la franja no pugi) mes el marge del bloc de la franja. La reserva es
 * la formula del MegaColumn:
 *
 *   alcadaReserva = (carril - 8 separacions x escala) / 9 + 13,96
 *
 * on les 8 separacions son el `GAP_X_PX` del MegaColumn, el 9 son les columnes
 * i els 13,96 px son el marge de dalt del boto (8) mes el descendent de la seva
 * linia (~5,96), que NO s'escalen. El sostre de LAYOUT de la franja respecte al
 * viewport de la pagina 2 es, doncs:
 *
 *   top = 32 (el `py-8` del panell) + alcadaReserva
 *
 * i el sostre VISUAL hi afegeix els dos desplaçaments de disseny de la franja:
 * el `translateY(-15px)` del bloc (que a la banda estreta no s'aplica) i el
 * `visualOffsetY` que li passa la pagina 2 per quadrar-la amb la de la pagina 1.
 *
 * Comprovat contra el `getBoundingClientRect()` de la franja, restant els
 * transformats, a 1920, 2000, 1680, 1512, 1440, 1400, 2560, 1366x768,
 * 1280x720, 1024x768 i 768x1024: la diferencia maxima es 0,3 px (0,01 px als
 * escriptoris).
 */
export const MARGE_DALT_BLOC_FRANJA_PX = 32;
export const AJUST_BAIX_BLOC_FRANJA_PX = -15;
export const GRAELLA_RESERVA_SEPARACIONS = 8;
export const GRAELLA_RESERVA_SEPARACIO_PX = 12;
export const GRAELLA_RESERVA_TILES = 9;
export const GRAELLA_RESERVA_MARGE_PX = 13.96;

/** L'alçada de la reserva de la graella vella (la que fa de sostre de la franja). */
export function alcadaReservaGraellaPanell({ carril, escala = 1 } = {}) {
  const c = Number.isFinite(carril) && carril > 0 ? carril : MEGASLIDE_REFERENCIA_PX;
  const e = Number.isFinite(escala) && escala > 0 ? escala : 1;
  return (
    (c - GRAELLA_RESERVA_SEPARACIONS * GRAELLA_RESERVA_SEPARACIO_PX * e) / GRAELLA_RESERVA_TILES
    + GRAELLA_RESERVA_MARGE_PX
  );
}

/**
 * La mateixa reserva, com a `calc()` de CSS: la fa servir el panell, que
 * l'aplica com a `height` (les variables son les del carril, que el panell ja
 * publica).
 */
export function alcadaReservaGraellaPanellCss({
  carril = 'var(--hg-mega-w, 1350px)',
  escala = 'var(--hg-escala-mega, 1)',
} = {}) {
  const separacions = GRAELLA_RESERVA_SEPARACIONS * GRAELLA_RESERVA_SEPARACIO_PX;
  return `calc((${carril} - ${separacions}px * ${escala}) / ${GRAELLA_RESERVA_TILES} + ${GRAELLA_RESERVA_MARGE_PX}px)`;
}

/**
 * El `visualOffsetY` que la pagina 2 passa a la franja: el que la baixa (o la
 * puja) perque quedi a la mateixa alçada que la de la pagina 1. Es la
 * composicio que tenia en línia `MegaslidePagina2`, declarada perque tambe la
 * necessita el calcul del sostre de la franja.
 *
 * @param {object} o
 * @param {number} o.ample amplada de la finestra (window.innerWidth)
 * @param {number} o.alt alcada de la finestra (window.innerHeight)
 * @param {boolean} [o.isPortraitTablet]
 * @param {boolean} [o.isLandscapeTablet]
 * @returns {number} px
 */
export function visualOffsetYFranjaPagina2({
  ample, alt, isPortraitTablet = false, isLandscapeTablet = false,
} = {}) {
  const tauleta = isPortraitTablet || isLandscapeTablet;
  const pageLift = pageLiftPagina1({ isPortraitTablet, isLandscapeTablet });
  const desplacament = desplacamentFranjaEscriptori({ ample, alt, esTauleta: tauleta });
  return (
    -pageLift
    + (isLandscapeTablet ? AJUST_FRANJA_TAULETA_APAISSADA_PX : 0)
    - (tauleta ? 0 : AJUST_FRANJA_ESCRIPTORI_PX)
    + desplacament
  );
}

/**
 * El sostre de la franja de la pagina 2, en px des del capdamunt del viewport
 * de la pagina 2 (`[data-mega-page-viewport="2"]`).
 *
 * @param {object} o
 * @param {number} o.carril amplada del carril (`--hg-mega-w`)
 * @param {number} o.escala escala del megaslide (`--hg-escala-mega`)
 * @param {number} [o.ample] amplada de la finestra (window.innerWidth)
 * @param {number} [o.alt] alcada de la finestra (window.innerHeight)
 * @param {boolean} [o.isPortraitTablet]
 * @param {boolean} [o.isLandscapeTablet]
 * @returns {number} px
 */
export function topFranjaPagina2({
  carril, escala = 1, ample, alt, isPortraitTablet = false, isLandscapeTablet = false,
} = {}) {
  const ajustBloc = esBandaEstretaFranja({ ample, alt }) ? 0 : AJUST_BAIX_BLOC_FRANJA_PX;
  return (
    MARGE_DALT_BLOC_FRANJA_PX
    + alcadaReservaGraellaPanell({ carril, escala })
    + ajustBloc
    + visualOffsetYFranjaPagina2({ ample, alt, isPortraitTablet, isLandscapeTablet })
  );
}

/**
 * EL CENTRATGE DE LA FRANJA, DECLARAT (26/09/2026)
 * -----------------------------------------------------------------------------
 * La tira de dibuixos (64) circula per les catorze cases fixes amb
 * `stripeStripOffset`, i quan canvia la colleccio activa se li dona el valor que
 * CENTRA el seu grup. Aixo es feia nome's amb un efecte, i a l'obertura de la
 * pagina 2 el desplacament encara valia 0: la franja naixia amb el grup a
 * l'esquerra i, mig segon despres, GIRAVA tres cases (mesurat: 0 -> -3 amb
 * FIRST CONTACT), amb la creueta de 160 ms dels dibuixos. Ho va veure l'amo
 * («els dibuixos de la stripe es mouen») en onze fotogrames.
 *
 * La formula ja hi era a l'efecte; aqui es declara perque el valor INICIAL
 * tambe es pugui calcular (i no calgui cap gir):
 *
 *   centre del grup = (quants - 1) / 2     (la casa del mig del grup)
 *   mig de la franja = (cases - 1) / 2     (6,5 amb catorze cases)
 *   objectiu = centre del grup - mig de la franja
 *
 * i, com que la tira es circular, es tria la volta mes propera al desplacament
 * que ja hi hagi (perque no faci cap salt).
 */

/** Les cases de la franja (una filera). */
export const FRANJA_CASES = 14;

/** Quants dibuixos te el grup de la colleccio activa (son al principi de la tira). */
export function quantsGrupActiuFranja({ collections, active } = {}) {
  if (!Array.isArray(collections) || !active) return 0;
  let quants = 0;
  for (const c of collections) {
    if (c !== active) break;
    quants += 1;
  }
  return quants;
}

/**
 * El desplacament de la tira que centra el grup actiu, arrodonit a una casa.
 *
 * @param {object} o
 * @param {number} o.quants dibuixos del grup actiu
 * @param {number} o.n llargada de la tira (64)
 * @param {number} [o.actual=0] desplacament que ja hi ha (per triar la volta)
 * @param {number} [o.cases=14] cases de la franja
 * @returns {number} el desplacament, arrodonit
 */
export function desplacamentCentratgeFranja({ quants, n, actual = 0, cases = FRANJA_CASES } = {}) {
  if (!Number.isFinite(quants) || quants <= 0) return Math.round(actual) || 0;
  if (!Number.isFinite(n) || n <= 0) return Math.round(actual) || 0;
  const objectiuBase = (quants - 1) / 2 - (cases - 1) / 2;
  const objectiu = objectiuBase + Math.round((actual - objectiuBase) / n) * n;
  return Math.round(objectiu);
}

/**
 * LA COMPOSICIO DE LA PAGINA 1, DECLARADA (26/09/2026)
 * -----------------------------------------------------------------------------
 * L'amo la va demanar amb totes les xifres: el selector (quadrat) a la vora
 * DRETA del carril, la graella de dues fileres a l'ESQUERRA estirada fins a ell
 * amb un gap de 10 px, i la graella i el bloc de la dreta de la mateixa alcada
 * perque la filera de dalt caigui al centre de la cel·la BLANC i la de baix al
 * de la COLOR (com a la pagina 2).
 *
 *   [ graella ............................. ] 10 [ selector ]
 *                                                 [ fletxes  ]
 *   [ franja de samarretes (amplada del carril) ]
 *
 * Tots els numeros son unitats de 1350 (la referencia del carril), com la resta
 * de la casa.
 *
 * ABANS (mesurat a 1920x946 amb `_tmp-p1-composicio.mjs`): la graella era una
 * malla de nou columnes de x415,3 a x1489,7 amb una sola filera de dibuixos, i
 * el selector (109,4) i les fletxes (109,5) eren la primera i l'ultima columna
 * d'aquella malla.
 *
 * DESPRES (mesurat amb `_tmp-b2-final.mjs`): la graella arrenca a x381 (la vora
 * del carril), el bloc de la dreta acaba a x1524 (l'altra vora) amb 10 px de
 * gap, i les peces fan 44,63 px, com les de la pagina 2.
 */

/** El costat de la peca de la graella, en unitats (45 = 44,63 px a 1920). Es
 *  el MATEIX que el de la pagina 2: les files han de ser identiques. */
export const PAGINA1_COSTAT_PECA_PX = 45;

/** El gap entre peces dins d'una filera (la pagina 2 tambe va a 0). */
export const PAGINA1_GAP_PECA_PX = 0;

/** El gap entre la graella i el bloc de la dreta (10 px de disseny). */
export const PAGINA1_GAP_DRETA_PX = 10;

/** El costat del selector i del bloc de fletxes de la dreta. */
export const PAGINA1_MIDA_BLOC_DRETA_PX = 110;

/**
 * L'alcada de la filera: la del bloc de la dreta (selector de 110 + fletxes de
 * 110, apilats). Amb DUES fileres de dibuixos de 55 unitats, la de dalt cau al
 * centre de la cel·la BLANC i la de baix al de la COLOR.
 */
export const PAGINA1_ALCADA_FILERA_PX = 110;

/** El top de la filera dins el panell, en unitats (mesurat: 13,8 unitats a
 *  1920 posen la filera de dalt al centre de la cel·la BLANC). */
export const PAGINA1_TOP_FILERA_PX = 13.8;

/** El descompte que s'aplica al coixi de la franja perque caigui a la mateixa
 *  alcada que la de la pagina 2 (mesurat a 1920: 112,8 unitats). */
export const PAGINA1_AJUST_FRANJA_PX = 112.8;

/**
 * L'amplada del bloc de la dreta, en px reals, a partir de l'escala del carril.
 *
 * @param {number} escala l'escala del carril (`--hg-escala-mega`)
 * @returns {number} px
 */
export function pagina1BlocDretaPx(escala = 1) {
  const e = Number.isFinite(escala) && escala > 0 ? escala : 1;
  return PAGINA1_MIDA_BLOC_DRETA_PX * e;
}

/**
 * L'amplada de la finestra del carrusel de la graella de la pagina 1: el carril
 * menys el bloc de la dreta i el seu gap.
 *
 * @param {number} carril l'amplada del carril, en px
 * @param {number} escala l'escala del carril
 * @returns {number} px (0 si el carril no val)
 */
export function pagina1AmpladaGraellaPx(carril, escala = 1) {
  const c = Number(carril);
  if (!Number.isFinite(c) || c <= 0) return 0;
  const e = Number.isFinite(escala) && escala > 0 ? escala : 1;
  return c - (PAGINA1_MIDA_BLOC_DRETA_PX + PAGINA1_GAP_DRETA_PX) * e;
}

/**
 * L'alcada de la filera de la pagina 1, en px reals.
 *
 * @param {number} escala l'escala del carril
 * @returns {number} px
 */
export function pagina1AlcadaFileraPx(escala = 1) {
  const e = Number.isFinite(escala) && escala > 0 ? escala : 1;
  return PAGINA1_ALCADA_FILERA_PX * e;
}
