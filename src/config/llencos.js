/**
 * ============================================================================
 *  ELS LLENÇOS DE DISSENY
 * ============================================================================
 *
 *  Aquest fitxer no inventa res: posa nom al que ja existeix.
 *
 *  La geometria del lloc està calibrada sobre llenços que JA estaven declarats
 *  al codi, però escampats i sense ser qui mana. El resultat és que els
 *  coeficients que en surten s'han escrit a mà, amb vuit decimals, i que
 *  n'hi ha tres versions del mateix número ("la fila"):
 *
 *      llenç de 90 files:  74,5333 / 2642 = 0,02821095   <- la divisió exacta
 *      el codi n'escriu:                    0,0282194     <- arrodonit
 *      el navegador pinta:                  0,028072      <- el que es veu
 *
 *  Cap de les tres escriptures és la bona del tot. Per això els coeficients
 *  s'han de DERIVAR del llenç i no escriure's.
 *
 *  ─────────────────────────────────────────────────────────────────────────
 *  ATENCIÓ: aquest fitxer NO substitueix els números que hi ha al codi.
 *  A la primera passada només els dona nom i valor exacte, per tenir un lloc
 *  on mirar-los. Cada substitució es fa després, d'una en una, mesurant que
 *  no mogui cap píxel.
 *  ─────────────────────────────────────────────────────────────────────────
 *
 *  Origen de cada número: `docs/informes/MAPA-calibratges.md`.
 */

/** L'amplada de tots els llenços del lloc. Només canvia l'alçada. */
export const LLENC_AMPLADA = 2642;

/** El gap vertical de la graella, en píxels sobre el llenç. */
export const LLENC_GAP_Y = 3;

/**
 * Una fila del llenç, en unitats de llenç.
 * @param {number} alcada alçada del llenç
 * @param {number} files nombre de files
 */
export function filaEnUnitats(alcada, files) {
  return alcada / files;
}

/**
 * El coeficient que converteix amplada de carril (px) en alçada de fila (px).
 *
 *     fila_px = carril_px × filaAlcadaCoef(alcada, files)
 *
 * És `(alcada / files) / amplada`, i és el número que el codi ha escrit a mà
 * com a `0,0280625`, `0,0282194` o `0,3385 / 12`.
 */
export function filaAlcadaCoef(alcada, files) {
  return filaEnUnitats(alcada, files) / LLENC_AMPLADA;
}

/**
 * El que cal descomptar de cada fila perquè el gap no infli l'alçada.
 *
 * Amb `n` files hi ha `n − 1` gaps, i el que toca a cada fila és el gap
 * repartit entre totes:
 *
 *     24 files, gap 3  ->  (24 − 1) × 3 / 24 = 2,875
 *
 * Aquest és el famós `− 2,875` de `megaHeroRowHeight`: no és un calibratge,
 * és aritmètica del gap.
 */
export function filaGapCoef(files, gap = LLENC_GAP_Y) {
  return ((files - 1) * gap) / files;
}

/**
 * Els llenços del lloc, amb el nom del que governen.
 *
 * `alcada`     alçada del llenç
 * `files`      files de la graella
 * `columnes`   columnes de la graella
 * `coef`       coeficient de fila exacte, `(alcada/files)/2642`
 * `gapCorreccio` el que cal restar per fila pel gap
 * `coefEscrit` el número que el codi té escrit avui, per poder-lo comparar
 */
export const LLENCOS = {
  /** La pauta de les col·leccions a escriptori. */
  colleccio: {
    alcada: 6708,
    files: 90,
    columnes: 4,
    coef: filaAlcadaCoef(6708, 90),
    gapCorreccio: filaGapCoef(90),
    coefEscrit: 0.0282194,
  },
  /** La pauta de les col·leccions a tauleta. */
  colleccioTauleta: {
    alcada: 9717,
    files: 90,
    columnes: 4,
  },
  /** La banda del hero de l'inici i la taula superior. */
  hero: {
    alcada: 1780,
    files: 24,
    columnes: 3,
    coef: filaAlcadaCoef(1780, 24),
    gapCorreccio: filaGapCoef(24),
    coefEscrit: 0.0280625,
  },
  /** La graella de fitxes de l'inici. */
  iniciFitxes: {
    alcada: 3950,
    files: 53,
    columnes: 3,
  },
  /** La targeta de producte (PDP). */
  pdp: {
    alcada: 5217,
    files: 70,
    columnes: 3,
  },
};

/** L'artboard del megaslide, en píxels de disseny. */
export const MEGASLIDE_ALCADA_REFERENCIA = 800;

/** El mockup que fa de llenç al cercador del megaslide, en píxels. */
export const CERCADOR_MOCKUP_PX = 4512;

/**
 * Calibradors que ENCARA no tenen origen llegible.
 *
 * Són aquí perquè no es perdin i perquè quan es mesuri un d'ells es vegi que
 * estava comptat. `docs/informes/MAPA-calibratges.md` els marca com a PENDENT.
 */
export const CALIBRADORS_PENDENTS = {
  /** `0.84632 × carril − 231` a les galeries. El 231 no és cap fila. */
  galeriaDescomptePx: 231,
  /** L'alçada de la hero de l'inici a la vista vertical. */
  heroAlcadaVerticalPx: 430,
  /** L'alçada de la graella de fitxes de l'inici a la vista vertical. */
  iniciGraellaVerticalPx: 752,
};
