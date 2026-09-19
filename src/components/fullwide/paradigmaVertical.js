/**
 * Geometria del PARADIGMA VERTICAL del megaslide.
 * -----------------------------------------------------------------------------
 * La vista vertical (768) no es un carrusel horitzontal miniaturitzat: es una
 * composicio propia dins del carril. Aquest modul es la font de veritat de les
 * seves proporcions, igual que `midesGraella.js` ho es de la graella de
 * dibuixos. Tot el que sigui un nombre de la composicio viu aqui, i per tant es
 * pot comprovar sense navegador.
 *
 * LA COMPOSICIO (seccions 29-32 del testimoni)
 *
 *   - La graella de dibuixos, amplada de carril i a dalt de tot. Les cinc
 *     colleccions hi munten una fila cadascuna; el component de la graella ja
 *     reparteix l'amplada en 16 columnes i fa les caselles quadrades.
 *   - A sota, tres columnes dins del mateix carril: la llista de colleccions,
 *     els botons d'accio amb la paleta de colors, i la franja de samarretes.
 *   - La franja son 14 samarretes partides en 2 files de 7, sense scroll i
 *     totes visibles (ho va confirmar l'amo).
 *
 * L'AMPLADA DEL CARRIL
 *
 * A la vertical l'amplada de referencia del megaslide es 992 px, pero 768 de
 * finestra no els hi donen: el carril visible es 768 - 2 x 40 = 688. La
 * composicio no ha de sortir de la pantalla (aixo es el que feia el belt), i
 * per tant el carril de la vertical es el mes petit dels dos.
 */

/**
 * Amplada de referencia del contingut de la tauleta (la de l'iPad de 1024
 * apaisada amb el coixi de disseny 40+40). Ha de coincidir amb la calibracio
 * de `FullWideSlideHeader` (`1024 * 0.995 - 80`).
 */
export const CARRIL_TAULETA_PX = 1024 * 0.995 - 80;

/** Coixi de disseny a cada banda del carril (els 40 px de la fila del header). */
export const COIXI_CARRIL_PX = 40;

/**
 * L'amplada del carril a la vertical: la referencia de tauleta, pero mai mes
 * ampla que la finestra menys els coixos.
 *
 * @param {number} ampleFinestra
 * @returns {number} px
 */
export function ampladaCarrilVertical(ampleFinestra) {
  const w = Number.isFinite(ampleFinestra) && ampleFinestra > 0 ? ampleFinestra : CARRIL_TAULETA_PX;
  return Math.max(0, Math.min(CARRIL_TAULETA_PX, w - 2 * COIXI_CARRIL_PX));
}

/**
 * Proporcions de les tres columnes de sota la graella.
 *
 * Son les de la maqueta de `/lab/vertical` (19 / 15 / 63), que es la que l'amo
 * ha validat.
 */
export const PROPORCIO_COLLECCIONS = 19;
export const PROPORCIO_BOTONS = 15;
export const PROPORCIO_FRANJA = 63;

/** Separacio entre les tres columnes, en px. */
export const GAP_COLUMNES_PX = 6;
/** Separacio entre la graella de dibuixos i les tres columnes, en px. */
export const GAP_GRAELLA_PX = 16;

/**
 * Amplada de cada una de les tres columnes de sota la graella, en px.
 *
 * Les proporcions es reparteixen l'amplada del carril DESCOMPTANT-hi les
 * separacions, que son mides fixes: si es repartissin l'amplada sencera, les
 * columnes juntes no hi cabrien.
 *
 * @param {number} carril amplada del carril, en px
 * @returns {{colleccions:number, botons:number, franja:number}}
 */
export function columnesVertical(carril) {
  const c = Math.max(0, Number(carril) || 0);
  const disponible = Math.max(0, c - 2 * GAP_COLUMNES_PX);
  const total = PROPORCIO_COLLECCIONS + PROPORCIO_BOTONS + PROPORCIO_FRANJA;
  return {
    colleccions: (disponible * PROPORCIO_COLLECCIONS) / total,
    botons: (disponible * PROPORCIO_BOTONS) / total,
    franja: (disponible * PROPORCIO_FRANJA) / total,
  };
}

/** Files i columnes de la franja de samarretes. */
export const FRANJA_FILES = 2;
export const FRANJA_COLUMNES = 7;
export const FRANJA_TILES = FRANJA_FILES * FRANJA_COLUMNES;

/** Separacio entre les samarretes de la franja, en px. */
export const GAP_FRANJA_PX = 6;
/** Separacio entre les dues files de la franja, en px. */
export const GAP_FRANJA_VERTICAL_PX = 8;

/**
 * Mida de la casella de samarreta (quadrada) a la franja de 2 x 7.
 *
 * @param {number} ampleFranja amplada de la columna de la franja, en px
 * @returns {number} px
 */
export function casellaFranjaVertical(ampleFranja) {
  const f = Math.max(0, Number(ampleFranja) || 0);
  const disponible = f - (FRANJA_COLUMNES - 1) * GAP_FRANJA_PX;
  return Math.max(0, disponible / FRANJA_COLUMNES);
}

/**
 * Alçada de la franja de 2 x 7 (dues caselles quadrades i la separacio).
 *
 * @param {number} ampleFranja amplada de la columna de la franja, en px
 * @returns {number} px
 */
export function alcadaFranjaVertical(ampleFranja) {
  return FRANJA_FILES * casellaFranjaVertical(ampleFranja) + (FRANJA_FILES - 1) * GAP_FRANJA_VERTICAL_PX;
}

/** Files de la graella de dibuixos: una per colleccio. */
export const GRAELLA_FILES_VERTICAL = 5;
/** Columnes de la graella de dibuixos (les del component `MegaGridDibuixos`). */
export const GRAELLA_COLUMNES_VERTICAL = 16;
/** Separacio entre dibuixos, en px (la del component). */
export const GAP_GRAELLA_DIBUIXOS_PX = 6;

/**
 * Alçada d'una fila de la graella de dibuixos: es la casella quadrada mes la
 * separacio de sota. Es el que fa que les cinc files tinguin la mateixa alçada
 * a qualsevol amplada de carril.
 *
 * @param {number} carril amplada del carril, en px
 * @returns {number} px
 */
export function alcadaFilaGraella(carril) {
  const c = Math.max(0, Number(carril) || 0);
  if (c <= 0) return 0;
  const ampleDibuix = (c - (GRAELLA_COLUMNES_VERTICAL - 1) * GAP_GRAELLA_DIBUIXOS_PX) / GRAELLA_COLUMNES_VERTICAL;
  return Math.max(0, ampleDibuix) + GAP_GRAELLA_DIBUIXOS_PX;
}

/**
 * Alçada total de la graella de dibuixos de la composicio vertical.
 *
 * @param {number} carril amplada del carril, en px
 * @returns {number} px
 */
export function alcadaGraellaVertical(carril) {
  return GRAELLA_FILES_VERTICAL * alcadaFilaGraella(carril);
}

/**
 * L'objectiu del selector Blanc/Color/Negre.
 *
 * El component `FirstContactDibuix00Buttons` fa la botonera quadrada
 * (`aspect-square`) i reparteix l'alçada entre els botons. A la composicio
 * vertical es dona una alcada propia perque el bloc dels botons quedi al mateix
 * nivell que la llista de colleccions.
 *
 * @param {number} carril amplada del carril, en px
 * @returns {number} px
 */
export function alcadaSelectorVertical(carril) {
  const c = Math.max(0, Number(carril) || 0);
  // El selector va una mica mes estret que la seva columna, perque els noms
  // dels acabats (BLANC/COLOR/NEGRE) no hi toquin les vores.
  return Math.min(c * 0.34, 190);
}

/** Mides del carril de la vertical, a partir de l'amplada de la finestra. */
export function midesVertical(ampleFinestra) {
  const carril = ampladaCarrilVertical(ampleFinestra);
  return {
    carril,
    columnes: columnesVertical(carril),
    alcadaFilaGraella: alcadaFilaGraella(carril),
    alcadaGraella: alcadaGraellaVertical(carril),
    alcadaFranja: alcadaFranjaVertical(columnesVertical(carril).franja),
  };
}
