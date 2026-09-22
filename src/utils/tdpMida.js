/**
 * LA MIDA DE LES FITXES DE PRODUCTE (TDP)
 * =============================================================================
 *
 * Una sola font de veritat per a la mida d'una fitxa, perque la facin servir
 * totes les pagines. Abans cada pagina la calculava pel seu compte (la de
 * colleccio amb geometria calculada i la d'inici amb un `aspect-ratio`), i per
 * aixo les fitxes de l'inici sortien el doble de grans que les de colleccio.
 *
 * La formula surt de mesurar el lloc:
 *
 *     alcada = carril x 0,4446   (tauleta)
 *     alcada = carril x 0,308    (escriptori)
 *
 * L'amplada surt de repartir el carril entre les columnes, descomptant el
 * gutter de la pauta (22,5 px per columna).
 *
 * Aquest modul es PURO: no llegeix el DOM ni cap variable CSS. Qui el fa
 * servir hi passa l'amplada del carril i si es tauleta.
 */

/** El gutter horitzontal de la pauta: el que separa dues columnes. */
export const TDP_GUTTER_X = 22.5;

/**
 * Quantes columnes de fitxes hi ha segons el dispositiu.
 * @param {boolean} esTauleta
 */
export function tdpColumnes(esTauleta) {
  return esTauleta ? 3 : 4;
}

/**
 * La mida d'una fitxa.
 *
 * @param {number} carrilAmple  amplada del carril, en px
 * @param {boolean} esTauleta
 * @returns {{amplada: number, alcada: number, columnes: number, gutter: number, pas: number}}
 */
export function tdpMidaFitxa(carrilAmple, esTauleta) {
  const columnes = tdpColumnes(esTauleta);
  const amplada = Math.round((carrilAmple - (columnes - 1) * TDP_GUTTER_X) / columnes);
  const alcada = Math.round(carrilAmple * (esTauleta ? 0.4446 : 0.308));
  return {
    amplada,
    alcada,
    columnes,
    gutter: TDP_GUTTER_X,
    /** La distancia entre l'esquerra d'una fitxa i la de la seguent. */
    pas: amplada + TDP_GUTTER_X,
  };
}

/**
 * El marge esquerre perque el conjunt de fitxes quedi centrat dins el carril.
 */
export function tdpMargeEsquerre(carrilAmple, mida) {
  const utilitzat = mida.amplada * mida.columnes + (mida.columnes - 1) * mida.gutter;
  return Math.round((carrilAmple - utilitzat) / 2);
}
