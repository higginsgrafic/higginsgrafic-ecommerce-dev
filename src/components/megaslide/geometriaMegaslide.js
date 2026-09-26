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

import { carrilDeclarat } from '../../utils/layoutModel';
import { MEGASLIDE_REFERENCIA_PX } from '../../utils/layoutMetrics';

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
