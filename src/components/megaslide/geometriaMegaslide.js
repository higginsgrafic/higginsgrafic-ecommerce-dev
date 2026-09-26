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
export const GRAELLA_COLUMNA_DRETA_CARRIL_PX = 142;
export const GRAELLA_GAP_COLUMNES_PX = 20;
export const GRAELLA_ESQUERRA_SELECTOR_CARRIL_PX = 70; // selector/2 (60) + 10
export const GRAELLA_DRETA_FLETXES_CARRIL_PX = 70; // fletxes (60) + 10

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
