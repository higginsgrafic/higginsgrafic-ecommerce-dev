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
 * Quantes fitxes per fila, segons l'AMPLE de la finestra.
 *
 * Es una regla d'AMPLE i prou: no depen del tipus de dispositiu. Aixo evita
 * que la mateixa amplada doni una distribucio diferent segons com es classifica
 * el dispositiu, que es el que passava abans.
 *
 *   1920, 1440 -> 4
 *   1280, 1024 -> 3   (1024 es la tauleta apaïsada)
 *          768 -> 2   (la tauleta que controlem, vertical)
 */
export function tdpColumnes(ampleFinestra) {
  if (ampleFinestra > 1366) return 4;
  if (ampleFinestra >= 1024) return 3;
  return 2;
}

/**
 * La mida d'una fitxa.
 *
 * @param {number} carrilAmple     amplada del carril, en px
 * @param {number} ampleFinestra   amplada de la finestra, en px
 * @param {number} alcadaFinestra  alcada de la finestra, en px
 * @returns {{amplada: number, alcada: number, columnes: number, gutter: number, pas: number}}
 */
export function tdpMidaFitxa(carrilAmple, ampleFinestra, alcadaFinestra = 0) {
  const columnes = tdpColumnes(ampleFinestra);
  const amplada = Math.round((carrilAmple - (columnes - 1) * TDP_GUTTER_X) / columnes);
  // L'alcada es proporcional a l'AMPLADA de la fitxa (5:4), que es com es veu
  // igual a totes les amplades. Abans es calculava del carril, i per aixo la
  // proporcio canviava entre mides.
  const alcada = Math.round(amplada * 1.25);
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
