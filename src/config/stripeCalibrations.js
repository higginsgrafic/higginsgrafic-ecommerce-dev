/**
 * EXCEPCIONS de les calibracions dels overlays de dibuixos sobre la franja.
 * -----------------------------------------------------------------------------
 * JA NO hi ha una entrada per dibuix. Mesurat el 26/09/2026: tots els fitxers
 * de dibuix fan 256 px d'amplada i l'escala calibrada posa una amplada
 * renderitzada d'unes 80 unitats (el 41 % del cos de la samarreta, 2740/14) a
 * 189 de les 224 entrades. O sigui que la regla es declara
 * (`escalaDibuixFranja`, a `geometriaMegaslide.js`) i aqui NOME'S hi queden:
 *
 *   - les EXCEPCIONS de disseny: els dibuixos que l'amo vol mes grans o mes
 *     petits (`nx-01` 56, `the-phoenix` 143, els cubics 60-64, els quotes
 *     d'AUSTEN 51-67...);
 *   - les PLAQUES DE COLOR de la samarreta (`*-frame-*`, `*-solid-*`,
 *     `*-gradient-*`), que porten scale 1 perque no son dibuixos sino el color
 *     del cos.
 *
 * El `localStorage` (clau `MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC`)
 * continua existint com a override per-navegador en mode dev, i te prioritat
 * sobre aquestes excepcions.
 *
 * Workflow per afegir-ne una:
 *   1. Recalibra al HUD i copia el valor de la consola:
 *      `JSON.parse(localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC'))`
 *   2. Afegeix NOME'S aquella entrada aqui.
 *   3. Commit. Si es una excepcio de mida, la prova
 *      `tests/unit/dibuixos-franja.test.js` t'ho recordara.
 */

export const STRIPE_DRAWING_CALIBRATIONS = {
  '/custom_logos/drawings/images_grid/austen/crosswords/persuasion-1-grid.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-2-grid.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-3-grid.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-4-grid.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-black-grid.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-multi-red-grid.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_originals/stripe/austen/keep_calm/color/keep-calm-multi-dark-stripe.webp': { dx: 1.0, dy: 28.5, scale: 0.26 },
  '/custom_logos/drawings/images_originals/stripe/austen/keep_calm/color/keep-calm-multi-red-stripe.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_originals/stripe/austen/quotes/black/half-agony-half-hope-b-stripe.webp': { dx: 3.75, dy: 19.75, scale: 0.313 },
  '/custom_logos/drawings/images_originals/stripe/austen/quotes/black/i-prefer-to-be-b-stripe.webp': { dx: 3.75, dy: 16.75, scale: 0.351 },
  '/custom_logos/drawings/images_originals/stripe/austen/quotes/black/it-is-a-truth-b-stripe.webp': { dx: 0.75, dy: 30.0, scale: 0.29 },
  '/custom_logos/drawings/images_originals/stripe/cube/afrodita-cut-c-stripe.webp': { dx: 0.75, dy: 22.5, scale: 0.345 },
  '/custom_logos/drawings/images_originals/stripe/cube/cyber-cube-cut-stripe.webp': { dx: 0.75, dy: 25.5, scale: 0.292 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp': { dx: 1.25, dy: 28.0, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-dark-stripe.webp': { dx: 1.25, dy: 28.0, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-light-stripe.webp': { dx: 1.25, dy: 28.0, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-red-stripe.webp': { dx: 1.25, dy: 28.0, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-thru-light-stripe.webp': { dx: 1.25, dy: 28.0, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-thru-red-stripe.webp': { dx: 1.25, dy: 28.0, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-w-red-stripe.webp': { dx: 1.25, dy: 28.0, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/white/keep-calm-w-stripe.webp': { dx: 1.25, dy: 28.0, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/blue-dark-gradient-grid-dark-gradient-stripe.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/fuchsia-dark-gradient-grid-dark-gradient-stripe.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/blue-frame-grid-frame-stripe.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/fuchsia-frame-grid-frame-stripe.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/light/blue-light-gradient-grid-light-gradient-stripe.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/solid/blue-solid-grid-solid-stripe.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '/custom_logos/drawings/images_stripe/austen/quotes/black/it-is-a-truth-b-stripe.webp': { dx: 3.75, dy: 23.5, scale: 0.23 },
  '/custom_logos/drawings/images_stripe/austen/quotes/black/you-must-allow-me-b-stripe.webp': { dx: 3.25, dy: 25.25, scale: 0.2 },
  '/custom_logos/drawings/images_stripe/austen/quotes/color/it-is-a-truth-multi-light-stripe.webp': { dx: 3.75, dy: 23.5, scale: 0.23 },
  '/custom_logos/drawings/images_stripe/austen/quotes/color/you-must-allow-me-multi-light-stripe.webp': { dx: 3.25, dy: 25.25, scale: 0.2 },
  '/custom_logos/drawings/images_stripe/austen/quotes/white/it-is-a-truth-w-stripe.webp': { dx: 3.75, dy: 23.5, scale: 0.23 },
  '/custom_logos/drawings/images_stripe/austen/quotes/white/you-must-allow-me-w-stripe.webp': { dx: 3.25, dy: 25.25, scale: 0.2 },
  '/custom_logos/drawings/images_stripe/cube/cylon-cube-03-stripe.webp': { dx: 0.75, dy: 29.5, scale: 0.251 },
  '/custom_logos/drawings/images_stripe/cube/darth-cube-stripe.webp': { dx: 0.75, dy: 30.0, scale: 0.235 },
  '/custom_logos/drawings/images_stripe/cube/iron-cube-08-iron-kong-stripe.webp': { dx: 0.75, dy: 30.0, scale: 0.235 },
  '/custom_logos/drawings/images_stripe/cube/iron-cube-68-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.251 },
  '/custom_logos/drawings/images_stripe/cube/mazinger-c-stripe.webp': { dx: 0.5, dy: 20.0, scale: 0.369 },
  '/custom_logos/drawings/images_stripe/cube/robocube-stripe.webp': { dx: 0.75, dy: 29.5, scale: 0.242 },
  '/custom_logos/drawings/images_stripe/first_contact/black/nx-01-b-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.22 },
  '/custom_logos/drawings/images_stripe/first_contact/black/the-phoenix-b-stripe.webp': { dx: 0.25, dy: 23.0, scale: 0.56 },
  '/custom_logos/drawings/images_stripe/first_contact/color/nx-01-multi-dark-stripe.webp': { dx: 0.75, dy: 30.0, scale: 0.22 },
  '/custom_logos/drawings/images_stripe/first_contact/color/nx-01-multi-light-stripe.webp': { dx: 0.75, dy: 30.0, scale: 0.22 },
  '/custom_logos/drawings/images_stripe/first_contact/color/the-phoenix-multi-dark-stripe.webp': { dx: 0.25, dy: 23.0, scale: 0.56 },
  '/custom_logos/drawings/images_stripe/first_contact/color/the-phoenix-multi-light-stripe.webp': { dx: 0.25, dy: 23.0, scale: 0.56 },
  '/custom_logos/drawings/images_stripe/first_contact/white/nx-01-w-stripe.webp': { dx: 0.75, dy: 30.0, scale: 0.22 },
  '/custom_logos/drawings/images_stripe/first_contact/white/the-phoenix-w-stripe.webp': { dx: 0.25, dy: 23.0, scale: 0.56 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/robby-the-robot-w-stripe.webp': { dx: 0.0, dy: 0.0, scale: 1.0 },
  '__HG_CANONICAL_STRIPE_DRAWING_OVERLAY__::austen::keep_calm': { dx: 1.25, dy: 28.0, scale: 0.26 },
};

/**
 * Defaults globals (HG_SHIRT_DRAWING_OVERLAY_*). S'apliquen quan no hi ha
 * entrada per-overlay al map. Calibrats a Firefox per a un dibuix
 * representatiu (NCC-1701).
 */
export const SHIRT_DRAWING_OVERLAY_DEFAULTS = { dx: 0.5, dy: 22.5, scale: 0.38 };

/**
 * Defaults del stripe-drawing global (MEGA_STRIPE_DRAWING_OVERLAY_*). Idem.
 */
export const STRIPE_DRAWING_OVERLAY_DEFAULTS = { dx: 0.5, dy: 28.75, scale: 0.31 };

/**
 * La CINTURA de les 14 samarretes de la franja, dins de la seva imatge:
 * la filera que ha de coincidir amb les vores del carril.
 *
 * Mesurat amb la tinta sobre `/placeholders/cercador/full-white-stripe.webp`
 * (2866x307). Les vores dels cossos son VERTICALS del 44% de l'alçada cap
 * avall: la filera del baix (y=246) dona 65..2804 i la de la cintura (y=150)
 * dona 64..2804, o sigui el mateix (2740 dels 2866). Per aixo cintura i baix
 * son la mateixa mesura, i la franja s'encaixa per les cintures de les
 * samarretes dels extrems: la cintura de la primera cau a la vora esquerra del
 * carril i la de l'ultima a la dreta.
 *
 * La filera mes ampla es la de les manigues (y~76), que hi arriba del 4 al
 * 2861: les manigues surten 59 px naturals (24,7 a 1920) mes enlla de la vora
 * del carril, que es el que es vol: travessen la frontera.
 *
 * Ho aplica `useEscalaFranjaCarril`.
 */
export const FRACCIO_COSSOS_FRANJA = 2740 / 2866;

/**
 * On comenca la cintura dins de la imatge: el primer cos arrenca al px 65 dels
 * 2866. Serveix per comprovar que la cintura esquerra cau on toca (a la vora
 * esquerra del carril). La dreta es `FRACCIO_COSSOS_FRANJA` mes aixo.
 */
export const FRACCIO_MARGE_ESQUERRE_FRANJA = 65 / 2866;

/**
 * Defaults globals del layout del stripe (mega-slide). Calibrats a Firefox.
 * Apliquen com a useState inicial; el localStorage continua sobreescrivint.
 *
 *   - stripe: posicionat global del stripe (--megaStripeDx/Dy/Scale)
 *   - overlayScale: escala global de l'overlay (--megaStripeOverlayScale)
 *   - ref2: 2a referència de calibratge (--megaStripeRef2Dx/Dy/Scale)
 *   - nudgeStep: pas de teclat al HUD
 *   - tileGapPx: gap entre tiles del stripe
 */
export const STRIPE_LAYOUT_DEFAULTS = {
  /**
   * `scale` continua essent el calibratge de la franja (la mida amb que es va
   * deixar a lloc) i el retoc fi de l'HUD. El que hi ha a mes és l'ajust al
   * carril: `useEscalaFranjaCarril` el multiplica per aquest valor, de manera
   * que, amb el calibratge intacte, la filera de cossos fa exactament
   * l'amplada del carril i les manigues hi surten a fora.
   */
  stripe: { dx: 0, dy: 0, scale: 1.2125 },
  overlayScale: 0.97,
  ref2: { dx: 1018, dy: -3, scale: 1.075 },
  nudgeStep: 50,
  tileGapPx: 0,
};

/**
 * El gap lateral entre els dibuixos de sobre les samarretes A LA VISTA VERTICAL:
 *
 *   - PASSOS_ESCALA_GAP_DIBUIX_VERTICAL: cada pas fa el dibuix mes gran el que
 *     cal perque el gap (la casella menys el dibuix) quedi 0,9^passos del que
 *     era. CONGELAT: a partir d'aqui les imatges no s'han de fer mes grans.
 *   - GAP_MOVIMENT_DIBUIX_VERTICAL: el gap que queda respecte del que hi hauria
 *     sense moure res, desplacant els dibuixos amb el primer de cada filera de 7
 *     fix. 0,9 = un 10% mes estret; 1,05 = un 5% mes ample. Es el numero a
 *     retocar si en cal mes o menys.
 *
 * A la resta de vistes no s'hi aplica res d'aixo.
 */
export const PASSOS_ESCALA_GAP_DIBUIX_VERTICAL = 2;

/**
 * Mida dels dibuixos de la franja A LA VISTA VERTICAL, respecte del seu
 * calibratge (1 = la mida del calibratge). L'amo els vol un 20% mes petits.
 * Tambe es la mida amb que s'ha calculat STRIPE_DRAWING_DY_VERTICAL.
 */
export const ESCALA_DIBUIX_VERTICAL = 0.8;
export const GAP_MOVIMENT_DIBUIX_VERTICAL = 0.8806;

/**
 * Resol la calibració per a un overlay key, prioritzant: localStorage map →
 * defaults del config → fallback {0,0,1}.
 *
 * @param {object|null} lsMap - mapa parsejat del localStorage (o null).
 * @param {string} canonicalKey - clau canònica (p.ex. `__HG_CANONICAL_..::col::sub`).
 * @param {string} key - clau bruta (path complet del dibuix).
 * @returns {{ dx:number, dy:number, scale:number }}
 */
export function resolveStripeDrawingCalibration(lsMap, canonicalKey, key) {
  const fromLs = lsMap && typeof lsMap === 'object'
    ? ((canonicalKey && lsMap[canonicalKey]) || lsMap[key])
    : null;
  if (fromLs && typeof fromLs === 'object') return fromLs;

  const fromDefaults = (canonicalKey && STRIPE_DRAWING_CALIBRATIONS[canonicalKey])
    || STRIPE_DRAWING_CALIBRATIONS[key];
  if (fromDefaults && typeof fromDefaults === 'object') return fromDefaults;

  return { dx: 0, dy: 0, scale: 1 };
}
