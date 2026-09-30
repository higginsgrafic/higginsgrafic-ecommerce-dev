/**
 * Mides compartides del megaslide.
 * -----------------------------------------------------------------------------
 * Aquí hi ha els números que han de coincidir a les DUES pàgines del panell
 * (MegaStripePanel = pàgina 2, MegaStripePanelP1 = pàgina 1). Si una pàgina els
 * fa servir i l'altra no, les seves franges de samarretes es desquadren.
 */

/**
 * Alçada de referència de la finestra: la que pren el disseny del megaslide.
 */
export const ALCADA_REFERENCIA = 800;

/**
 * Factor d'alçada del megaslide (1 = cap ajust).
 *
 * Tot el megaslide escala a partir de l'amplada (el belt de 1350) i res no
 * mira l'alçada de la finestra. El resultat és que en una finestra curta
 * (706-800 px) la franja de samarretes es queda amb la seva mida de disseny
 * dins d'un espai més petit: el panell se'n menja el 40% i el que hi ha a
 * sota ja no hi cap. Aquest factor fa que la franja —la peça més alta del
 * conjunt— s'hi ajusti.
 *
 * Només baixa, i com a molt fins a 0,8 (una finestra de 640 px o menys).
 *
 * A TAU LETA (les dues orientacions) ha de valer 1: la vertical 768×1024 i
 * l'apaisada 1024×768 són la mateixa pàgina i han de donar la mateixa franja;
 * un factor que depèn de l'alçada les separaria i el comparador ho caça.
 * Per això la detecció de tauleta NO es fa aquí: es rep del dispositiu
 * (`useDeviceLayout`), que és l'única font fiable.
 *
 * @param {number} alcadaFinestra
 * @param {boolean} esTauleta
 */
export function factorAlcadaMegaslide(alcadaFinestra, esTauleta) {
  if (esTauleta) return 1;
  if (!Number.isFinite(alcadaFinestra) || alcadaFinestra <= 0) return 1;
  return Math.max(0.8, Math.min(1, alcadaFinestra / ALCADA_REFERENCIA));
}
