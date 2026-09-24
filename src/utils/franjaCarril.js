import { FRACCIO_COSSOS_FRANJA, STRIPE_LAYOUT_DEFAULTS } from '../config/stripeCalibrations';

/**
 * L'escala amb que es va deixar calibrada la franja. El factor del carril es
 * calcula CONTRA aquest valor (es un multiplicador del calibratge, no una
 * escala absoluta), perque el calibratge i el retoc de l'HUD continuin manant.
 */
export const ESCALA_CALIBRADA_FRANJA = STRIPE_LAYOUT_DEFAULTS.stripe.scale;

/**
 * El factor que fa que la filera de cossos de la franja faci l'amplada del
 * carril.
 *
 * La franja es dibuixa amb `transform: scale(...)` sobre una filera que te la
 * mida de disseny (l'amplada de la seva imatge a l'alcada que li toca). El
 * factor surt de dividir el carril per l'amplada que hi ocupen els cossos de
 * les catorze samarretes (`FRACCIO_COSSOS_FRANJA`) i de desfer-hi el
 * calibratge.
 *
 * @param {number} carrilPx - amplada del carril (--hg-mega-w).
 * @param {number} ampleDibuixPx - amplada de la filera a mida de disseny.
 * @param {number} escalaCalibrada - calibratge de la franja (1.2125).
 * @returns {number} factor a multiplicar pel calibratge (1 si no es pot calcular).
 */
export function factorFranjaCarril(carrilPx, ampleDibuixPx, escalaCalibrada = ESCALA_CALIBRADA_FRANJA) {
  const carril = Number(carrilPx);
  const dibuix = Number(ampleDibuixPx);
  const calibrada = Number(escalaCalibrada);
  if (!(carril > 0) || !(dibuix > 0) || !(calibrada > 0)) return 1;
  return carril / FRACCIO_COSSOS_FRANJA / dibuix / calibrada;
}

/**
 * L'amplada que ocupen els cossos de les catorze samarretes en una franja
 * dibuixada de `ampleVisiblePx`. Serveix per comprovar la regla (ha de fer
 * l'amplada del carril).
 */
export function cossosFranja(ampleVisiblePx) {
  const ample = Number(ampleVisiblePx);
  return Number.isFinite(ample) ? ample * FRACCIO_COSSOS_FRANJA : 0;
}
