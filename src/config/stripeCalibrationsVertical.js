/**
 * Dibuixos de la franja a la VISTA VERTICAL (768): el dy propi de cada dibuix,
 * recalculat perque el CENTRE de la impressio caigui a la mateixa alcada que la
 * mitjana de THE HUMAN INSIDE, amb els dibuixos al 80% (ESCALA_DIBUIX_VERTICAL).
 *
 * El dy s'aplica SENCER (no es multiplica per l'amplada de cada casella): aixi
 * la mateixa alcada val per a totes les caselles i les dues fileres de la
 * franja queden alineades.
 *
 * Nomes s'aplica a la vista vertical. El calibratge compartit
 * (STRIPE_DRAWING_CALIBRATIONS) no es toca i la resta de vistes queden com eren.
 *
 * Si es canvia la mida (ESCALA_DIBUIX_VERTICAL) o una imatge, recalcular-ho.
 */
export const STRIPE_DRAWING_DY_VERTICAL = {
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/persuasion-1-b-stripe.webp': 28.67,
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/persuasion-2-b-stripe.webp': 28.65,
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/persuasion-3-b-stripe.webp': 28.65,
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/persuasion-4-b-stripe.webp': 28.65,
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/pride-and-prejudice-1-b-stripe.webp': 28.89,
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/pride-and-prejudice-2-b-stripe.webp': 28.88,
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/pride-and-prejudice-3-b-stripe.webp': 28.41,
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/pride-and-prejudice-4-b-stripe.webp': 28.98,
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/sense-and-sensibility-1-b-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/sense-and-sensibility-2-b-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/sense-and-sensibility-3-b-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/sense-and-sensibility-4-b-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/persuasion-1-w-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/persuasion-2-w-stripe.webp': 28.76,
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/persuasion-3-w-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/persuasion-4-w-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/pride-and-prejudice-1-w-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/pride-and-prejudice-2-w-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/pride-and-prejudice-3-w-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/pride-and-prejudice-4-w-stripe.webp': 28.98,
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/sense-and-sensibility-1-w-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/sense-and-sensibility-2-w-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/sense-and-sensibility-3-w-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/sense-and-sensibility-4-w-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp': 29.87,
  '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-dark-stripe.webp': 29.68,
  '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-light-stripe.webp': 29.68,
  '/custom_logos/drawings/images_stripe/austen/keep_calm/white/keep-calm-w-stripe.webp': 29.83,
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/blue-frame-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/fuchsia-frame-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/red-frame-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/yellow-frame-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/solid/blue-solid-stripe.webp': 28.7,
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/solid/fuchsia-solid-stripe.webp': 28.7,
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/solid/red-solid-stripe.webp': 28.7,
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/solid/yellow-solid-stripe.webp': 28.7,
  '/custom_logos/drawings/images_stripe/austen/pemberley_house/black/pemberley-house-b-stripe.webp': 29.51,
  '/custom_logos/drawings/images_stripe/austen/pemberley_house/color/pemberley-house-multi-light-stripe.webp': 29.57,
  '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp': 29.57,
  '/custom_logos/drawings/images_stripe/austen/quotes/black/body-and-soul-b-stripe.webp': 27.87,
  '/custom_logos/drawings/images_stripe/austen/quotes/black/half-agony-half-hope-b-stripe.webp': 28.4,
  '/custom_logos/drawings/images_stripe/austen/quotes/black/i-prefer-to-be-b-stripe.webp': 27.87,
  '/custom_logos/drawings/images_stripe/austen/quotes/black/it-is-a-truth-b-stripe.webp': 29.54,
  '/custom_logos/drawings/images_stripe/austen/quotes/black/unsociable-and-taciturn-b-stripe.webp': 27.87,
  '/custom_logos/drawings/images_stripe/austen/quotes/black/you-must-allow-me-b-stripe.webp': 29.98,
  '/custom_logos/drawings/images_stripe/austen/quotes/white/body-and-soul-w-stripe.webp': 28.03,
  '/custom_logos/drawings/images_stripe/austen/quotes/white/half-agony-half-hope-w-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/austen/quotes/white/i-prefer-to-be-w-stripe.webp': 28.03,
  '/custom_logos/drawings/images_stripe/austen/quotes/white/it-is-a-truth-w-stripe.webp': 29.61,
  '/custom_logos/drawings/images_stripe/austen/quotes/white/unsociable-and-taciturn-w-stripe.webp': 28.03,
  '/custom_logos/drawings/images_stripe/austen/quotes/white/you-must-allow-me-w-stripe.webp': 30.04,
  '/custom_logos/drawings/images_stripe/cube/afrodita-c-stripe.webp': 28.06,
  '/custom_logos/drawings/images_stripe/cube/cube-3-p0-stripe.webp': 28.9,
  '/custom_logos/drawings/images_stripe/cube/cyber-cube-stripe.webp': 28.17,
  '/custom_logos/drawings/images_stripe/cube/cylon-cube-03-stripe.webp': 29.52,
  '/custom_logos/drawings/images_stripe/cube/darth-cube-stripe.webp': 29.6,
  '/custom_logos/drawings/images_stripe/cube/iron-cube-08-iron-kong-stripe.webp': 29.6,
  '/custom_logos/drawings/images_stripe/cube/iron-cube-68-stripe.webp': 29.27,
  '/custom_logos/drawings/images_stripe/cube/maschinencube-stripe.webp': 28.79,
  '/custom_logos/drawings/images_stripe/cube/mazinger-c-stripe.webp': 26.70,
  '/custom_logos/drawings/images_stripe/cube/robocube-stripe.webp': 29.51,
  '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-b-stripe.webp': 28.27,
  '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-d-b-stripe.webp': 26.26,
  '/custom_logos/drawings/images_stripe/first_contact/black/nx-01-b-stripe.webp': 31.20,
  '/custom_logos/drawings/images_stripe/first_contact/black/plasma-escape-b-stripe.webp': 28.16,
  '/custom_logos/drawings/images_stripe/first_contact/black/the-phoenix-b-stripe.webp': 30.04,
  '/custom_logos/drawings/images_stripe/first_contact/black/vulcans-end-b-stripe.webp': 27.95,
  '/custom_logos/drawings/images_stripe/first_contact/black/wormhole-b-stripe.webp': 28.25,
  '/custom_logos/drawings/images_stripe/first_contact/color/ncc-1701-d-multi-dark-stripe.webp': 26.28,
  '/custom_logos/drawings/images_stripe/first_contact/color/ncc-1701-d-multi-light-stripe.webp': 26.28,
  '/custom_logos/drawings/images_stripe/first_contact/color/ncc-1701-multi-dark-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/first_contact/color/ncc-1701-multi-light-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/first_contact/color/nx-01-multi-dark-stripe.webp': 31.23,
  '/custom_logos/drawings/images_stripe/first_contact/color/nx-01-multi-light-stripe.webp': 31.23,
  '/custom_logos/drawings/images_stripe/first_contact/color/plasma-escape-multi-dark-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/first_contact/color/plasma-escape-multi-light-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/first_contact/color/the-phoenix-multi-dark-stripe.webp': 29.78,
  '/custom_logos/drawings/images_stripe/first_contact/color/the-phoenix-multi-light-stripe.webp': 29.86,
  '/custom_logos/drawings/images_stripe/first_contact/color/vulcans-end-multi-dark-stripe.webp': 28.03,
  '/custom_logos/drawings/images_stripe/first_contact/color/vulcans-end-multi-light-stripe.webp': 28.03,
  '/custom_logos/drawings/images_stripe/first_contact/color/wormhole-multi-dark-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/first_contact/color/wormhole-multi-light-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/first_contact/white/ncc-1701-d-w-stripe.webp': 26.28,
  '/custom_logos/drawings/images_stripe/first_contact/white/ncc-1701-w-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/first_contact/white/nx-01-w-stripe.webp': 31.23,
  '/custom_logos/drawings/images_stripe/first_contact/white/plasma-escape-w-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/first_contact/white/the-phoenix-w-stripe.webp': 29.88,
  '/custom_logos/drawings/images_stripe/first_contact/white/vulcans-end-w-stripe.webp': 27.91,
  '/custom_logos/drawings/images_stripe/first_contact/white/wormhole-w-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/miscellania/black/arthur-d-the-second-b-stripe.webp': 29.38,
  '/custom_logos/drawings/images_stripe/miscellania/black/death-star2d2-b-stripe.webp': 28.63,
  '/custom_logos/drawings/images_stripe/miscellania/black/dj-vader-b-stripe.webp': 28.69,
  '/custom_logos/drawings/images_stripe/miscellania/black/pont-del-diable-b-stripe.webp': 28.69,
  '/custom_logos/drawings/images_stripe/miscellania/black/r2d2-quote-b-stripe.webp': 28.68,
  '/custom_logos/drawings/images_stripe/miscellania/color/arthur-d-the-second-multi-dark-stripe.webp': 28.73,
  '/custom_logos/drawings/images_stripe/miscellania/color/arthur-d-the-second-multi-light-stripe.webp': 28.69,
  '/custom_logos/drawings/images_stripe/miscellania/color/death-star2d2-multi-dark-stripe.webp': 28.6,
  '/custom_logos/drawings/images_stripe/miscellania/color/death-star2d2-multi-light-stripe.webp': 28.6,
  '/custom_logos/drawings/images_stripe/miscellania/color/dj-vader-multi-dark-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/miscellania/color/dj-vader-multi-light-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/miscellania/color/pont-del-diable-multi-dark-stripe.webp': 28.5,
  '/custom_logos/drawings/images_stripe/miscellania/color/pont-del-diable-multi-light-stripe.webp': 28.5,
  '/custom_logos/drawings/images_stripe/miscellania/color/r2d2-quote-multi-dark-stripe.webp': 28.78,
  '/custom_logos/drawings/images_stripe/miscellania/color/r2d2-quote-multi-light-stripe.webp': 28.73,
  '/custom_logos/drawings/images_stripe/miscellania/white/arthur-d-the-second-w-stripe.webp': 28.69,
  '/custom_logos/drawings/images_stripe/miscellania/white/death-star2d2-w-stripe.webp': 28.6,
  '/custom_logos/drawings/images_stripe/miscellania/white/dj-vader-w-stripe.webp': 28.75,
  '/custom_logos/drawings/images_stripe/miscellania/white/pont-del-diable-w-stripe.webp': 28.79,
  '/custom_logos/drawings/images_stripe/miscellania/white/r2d2-quote-w-stripe.webp': 28.71,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/afrodita-a-b-stripe.webp': 28.64,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/c3-p0-b-stripe.webp': 28.53,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/cyberman-b-stripe.webp': 28.28,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/cylon-03-b-stripe.webp': 28.51,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/cylon-78-b-stripe.webp': 28.42,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/iron-man-08-b-stripe.webp': 28.33,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/iron-man-68-b-stripe.webp': 28.33,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/maschinenmensch-b-stripe.webp': 28.68,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/mazinger-z-b-stripe.webp': 28.51,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/r2-d2-b-stripe.webp': 28.68,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/robbie-the-robot-b-stripe.webp': 28.55,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/robocop-b-stripe.webp': 28.04,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/terminator-b-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/the-dalek-b-stripe.webp': 28.28,
  '/custom_logos/drawings/images_stripe/the_human_inside/black/vader-b-stripe.webp': 28.51,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/afrodita-a-multi-dark-stripe.webp': 27.98,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/afrodita-a-multi-light-stripe.webp': 27.9,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/c3-p0-multi-dark-stripe.webp': 28.17,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/c3-p0-multi-light-stripe.webp': 28.17,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/cyberman-multi-dark-stripe.webp': 28.29,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/cyberman-multi-light-stripe.webp': 28.29,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/cylon-03-multi-dark-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/cylon-03-multi-light-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/cylon-78-multi-dark-stripe.webp': 28.46,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/cylon-78-multi-light-stripe.webp': 28.46,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/iron-man-08-multi-dark-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/iron-man-08-multi-light-stripe.webp': 28.16,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/iron-man-68-multi-dark-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/iron-man-68-multi-light-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/maschinenmensch-multi-dark-stripe.webp': 28.68,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/maschinenmensch-multi-light-stripe.webp': 28.62,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/mazinger-z-multi-dark-stripe.webp': 28.46,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/mazinger-z-multi-light-stripe.webp': 28.46,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/r2-d2-multi-dark-stripe.webp': 28.09,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/r2-d2-multi-light-stripe.webp': 28.17,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/robbie-the-robot-multi-dark-stripe.webp': 28.46,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/robbie-the-robot-multi-light-stripe.webp': 28.46,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/robocop-multi-dark-stripe.webp': 28,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/robocop-multi-light-stripe.webp': 28.17,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/terminator-multi-dark-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/terminator-multi-light-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/the-dalek-multi-dark-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/the-dalek-multi-light-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/vader-multi-dark-stripe.webp': 28.17,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/vader-multi-light-stripe.webp': 28.17,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/afrodita-a-w-stripe.webp': 27.9,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/c3-p0-w-stripe.webp': 28.17,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/cyberman-w-stripe.webp': 28.29,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/cylon-03-w-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/cylon-78-w-stripe.webp': 28.46,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/iron-man-08-w-stripe.webp': 28.16,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/iron-man-68-w-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/maschinenmensch-w-stripe.webp': 28.6,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/mazinger-z-w-stripe.webp': 28.46,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/r2-d2-w-stripe.webp': 28.17,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/robbie-the-robot-w-stripe.webp': 28.46,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/robocop-w-stripe.webp': 28.17,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/terminator-w-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/the-dalek-w-stripe.webp': 28.31,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/vader-w-stripe.webp': 28.17,
};

/**
 * Dibuixos que a la vista vertical es pinten a una mida diferent de la resta:
 * el factor es multiplica per ESCALA_DIBUIX_VERTICAL (1 = la mida de tots).
 * Avui: l'NX-01 i The Phoenix un 25% mes petits, el NCC-1701-D un 25% mes
 * gros i el Keep Calm un 10% mes petit. Com que
 * l'escala es fa des del capdamunt del dibuix, canviar la mida tambe mou
 * el centre: el dy d'aquests dos ja ho compensa.
 */
export const STRIPE_DRAWING_ESCALA_VERTICAL = {
  // L'IRON MAN 08, UNA MIQUETA MES GRAN (28/09/2026, ho ha demanat l'amo).
  // Nome's la mida: el seu desplacament no es toca.
  '/custom_logos/drawings/images_stripe/the_human_inside/black/iron-man-08-b-stripe.webp': 1.1,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/iron-man-08-multi-dark-stripe.webp': 1.1,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/iron-man-08-multi-light-stripe.webp': 1.1,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/iron-man-08-w-stripe.webp': 1.1,
  // EL CYBERMAN, UN 10% MES GRAN (28/09/2026).
  '/custom_logos/drawings/images_stripe/the_human_inside/black/cyberman-b-stripe.webp': 1.1,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/cyberman-multi-dark-stripe.webp': 1.1,
  '/custom_logos/drawings/images_stripe/the_human_inside/color/cyberman-multi-light-stripe.webp': 1.1,
  '/custom_logos/drawings/images_stripe/the_human_inside/white/cyberman-w-stripe.webp': 1.1,
  // El Cybercube i el Mazinger-C (CUBE), un 10% mes grans.
  '/custom_logos/drawings/images_stripe/cube/cyber-cube-stripe.webp': 1.1,
  '/custom_logos/drawings/images_stripe/cube/cyber-cube-cut-stripe.webp': 1.1,
  '/custom_logos/drawings/images_stripe/cube/mazinger-c-stripe.webp': 1.1,
  // El Keep Calm, un 10% mes petit (la clau canonica cobreix totes les variants).
  '__HG_CANONICAL_STRIPE_DRAWING_OVERLAY__::austen::keep_calm': 0.9,
  '/custom_logos/drawings/images_stripe/first_contact/black/1-nx-01-b-stripe.webp': 0.75,
  '/custom_logos/drawings/images_stripe/first_contact/black/nx-01-b-stripe.webp': 0.75,
  '/custom_logos/drawings/images_stripe/first_contact/white/nx-01-w-stripe.webp': 0.75,
  '/custom_logos/drawings/images_stripe/first_contact/color/nx-01-multi-light-stripe.webp': 0.75,
  '/custom_logos/drawings/images_stripe/first_contact/color/nx-01-multi-dark-stripe.webp': 0.75,
  '/custom_logos/drawings/images_stripe/first_contact/black/3-ncc-1701-d-b-stripe.webp': 1.25,
  '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-d-b-stripe.webp': 1.25,
  '/custom_logos/drawings/images_stripe/first_contact/white/ncc-1701-d-w-stripe.webp': 1.25,
  '/custom_logos/drawings/images_stripe/first_contact/color/ncc-1701-d-multi-light-stripe.webp': 1.25,
  '/custom_logos/drawings/images_stripe/first_contact/color/ncc-1701-d-multi-dark-stripe.webp': 1.25,
  '/custom_logos/drawings/images_stripe/first_contact/black/7-the-phoenix-b-stripe.webp': 0.75,
  '/custom_logos/drawings/images_stripe/first_contact/black/the-phoenix-b-stripe.webp': 0.75,
  '/custom_logos/drawings/images_stripe/first_contact/white/the-phoenix-w-stripe.webp': 0.75,
  '/custom_logos/drawings/images_stripe/first_contact/color/the-phoenix-multi-light-stripe.webp': 0.75,
  '/custom_logos/drawings/images_stripe/first_contact/color/the-phoenix-multi-dark-stripe.webp': 0.75,
};

/**
 * Correccions de la X (dx, en px del calibratge) NOMES a la vista vertical:
 * se sumen al dx compartit. El dx del calibratge compartit es va fer per a
 * altres vistes i, en alguns dibuixos, a la vertical els queda mes a la dreta
 * que als altres. El Pemberley House n'es el cas: el seu dx es 2,5 quan la
 * resta de dibuixos van d'1,25 a 3,75 (i els d'altres colleccions, 0,5).
 */
export const STRIPE_DRAWING_DX_VERTICAL = {
  // Els dibuixos de Quotes: porten un dx de 3,25-3,75 al calibratge compartit
  // (la resta de dibuixos van a 0,5-1,25) i a la vertical es veien tots desplacats
  // a la dreta. Aqui se'ls hi porta el dx al nivell de la resta (0,5).
  '/custom_logos/drawings/images_stripe/austen/quotes/black/body-and-soul-b-stripe.webp': -3.25,
  '/custom_logos/drawings/images_stripe/austen/quotes/black/half-agony-half-hope-b-stripe.webp': -3.25,
  '/custom_logos/drawings/images_stripe/austen/quotes/black/i-prefer-to-be-b-stripe.webp': -3.25,
  '/custom_logos/drawings/images_stripe/austen/quotes/black/it-is-a-truth-b-stripe.webp': -3.98,
  '/custom_logos/drawings/images_stripe/austen/quotes/black/unsociable-and-taciturn-b-stripe.webp': -3.25,
  '/custom_logos/drawings/images_stripe/austen/quotes/black/you-must-allow-me-b-stripe.webp': -3.48,
  '/custom_logos/drawings/images_stripe/austen/quotes/color/body-and-soul-multi-light-stripe.webp': -3.25,
  '/custom_logos/drawings/images_stripe/austen/quotes/color/half-agony-half-hope-multi-light-stripe.webp': -3.25,
  '/custom_logos/drawings/images_stripe/austen/quotes/color/i-prefer-to-be-multi-light-stripe.webp': -3.25,
  '/custom_logos/drawings/images_stripe/austen/quotes/color/it-is-a-truth-multi-light-stripe.webp': -3.98,
  '/custom_logos/drawings/images_stripe/austen/quotes/color/you-must-allow-me-multi-light-stripe.webp': -3.48,
  '/custom_logos/drawings/images_stripe/austen/quotes/white/body-and-soul-w-stripe.webp': -3.25,
  '/custom_logos/drawings/images_stripe/austen/quotes/white/half-agony-half-hope-w-stripe.webp': -3.25,
  '/custom_logos/drawings/images_stripe/austen/quotes/white/i-prefer-to-be-w-stripe.webp': -3.25,
  '/custom_logos/drawings/images_stripe/austen/quotes/white/it-is-a-truth-w-stripe.webp': -3.98,
  '/custom_logos/drawings/images_stripe/austen/quotes/white/unsociable-and-taciturn-w-stripe.webp': -3.25,
  '/custom_logos/drawings/images_stripe/austen/quotes/white/you-must-allow-me-w-stripe.webp': -3.48,
  '/custom_logos/drawings/images_stripe/austen/pemberley_house/black/pemberley-house-b-stripe.webp': -2,
  '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp': -2,
  '/custom_logos/drawings/images_stripe/austen/pemberley_house/color/pemberley-house-multi-light-stripe.webp': -2,
};

/**
 * Mides dels dibuixos A LA GRAELLA (les caselles on es trien), nomes a la vista
 * vertical: el factor es multiplica pel 80% de sempre (el dibuix dins la seva
 * casella). 1 = com tots; 0,8 = un 20% mes petit; 1,2 = un 20% mes gran.
 */
export const GRAELLA_DIBUIXOS_ESCALA_VERTICAL = {
  'NX-01': 0.72,
  'NCC-1701-D': 1.2,
  'The Phoenix': 1.2,
};

/**
 * Intensitat del vel de les samarretes SENSE DIBUIX a la franja de la pagina 2
 * (nomes vista vertical). Es l'alfa del vel blanc que les cobreix: 0 = la
 * samarreta surt sencera, 1 = queda blanca del tot. Amb valors baixos la
 * samarreta conserva el seu color esmorteit.
 */
export const VEL_SAMARRETA_BUIDA_ALFA = 0.85;

/**
 * Opacitat del vel quan la samarreta es blanca. Amb el blanc sobre blanc la
 * samarreta desapareixia, aixi que hi va mes fluix.
 */
export const VEL_SAMARRETA_BUIDA_ALFA_BLANCA = 0.6;

/**
 * ELS DIBUIXOS DE LES SAMARRETES ATENUADES, UN 10 % MES FOSCOS QUE EL VEL
 * (28/09/2026).
 *
 * Ho ha demanat l'amo: «Fes els dibuixos del mateix color que el vel, pero un 10%
 * mes fosc».
 *
 * SURT EXACTE, I PER QUe: el dibuix va PER DAMUNT del vel, o sigui que el que te
 * al darrere es el color del vel (la samarreta esblanqueida). Pintar-hi el dibuix
 * nome's amb un 10 % de negre el deixa a `0,9 x color del vel`, que es
 * literalment «el mateix color, un 10 % mes fosc»: les parts d'ink del dibuix
 * (que son negre) hi cauen just, i els tons intermedis es queden a un 10 % d'allo
 * que son, que es el que fa que el dibuix segueixi tenint el seu detall.
 *
 * I val per a qualsevol samarreta, perque qui mana es el vel: sobre samarreta
 * blanca el vel queda blanc i el dibuix surt a #E5E5E5; sobre negra el vel queda
 * #999999 i el dibuix a #8A8A8A.
 *
 * (Els dos intents d'abans no valien: `brightness(0)` aplanava el dibuix, i
 * invertir-lo no funciona perque les variants negres son IMATGES EN ESCALA DE
 * GRISOS i invertir-les capgira els tons. Ho va veure l'amo: «El negre es en
 * escala de grisos. No funcionara».)
 */
export const FILTRE_DIBUIX_DESACTIVAT = 'opacity(0.1)';

/**
 * ELS DIBUIXOS DE LOOKING FOR MY DARCY, UN 5 % MES CLARS QUE EL VEL (28/09/2026).
 *
 * Ho ha demanat l'amo, NOME'S per a LFMD: «LFMD, en lloc d'un 10% mes fosc,
 * hauria de ser un 5% mes clar» i, mes tard, «fes els dibuixos un 20% mes clars»
 * (confirmat que nome's son els de LFMD).
 *
 * Son els dibuixos que nome's existeixen en color i que, per tant, no poden
 * entrar al calcul del 10 % de negre dels altres (vegeu
 * `srcDibuixVelatEnNegre`). Com que han de quedar MES CLARS que el vel i no mes
 * foscos, se'ls pinta de BLANC: `brightness(0)` els deixa plans (l'alfa es
 * conserva, o sigui que la forma no es toca) i `invert(1)` els posa blancs, i amb
 * un 20 % d'opacitat el resultat es `color del vel + 20 % cap al blanc`.
 */
export const FILTRE_DIBUIX_DESACTIVAT_LFMD = 'brightness(0) invert(1) opacity(0.2)';

/**
 * LES VERSIONS `frame` DE LFMD, SENSE EL SEU FONS (28/09/2026).
 *
 * Ho ha demanat l'amo: «Pots obviar el fons de les versions frame?».
 *
 * Les versions `frame` de LOOKING FOR MY DARCY no son nome's el text: son el
 * mateix text groc sobre una PLACA BLAVA plena (`blue-frame-stripe.webp`). Amb el
 * filtre pla de `FILTRE_DIBUIX_DESACTIVAT_LFMD`, la placa sencera es tornava
 * blanca, o sigui que el que es veia era el fons.
 *
 * El fons s'ha de treure DE LA IMATGE, i aixo ho fa el filtre SVG
 * `hgTreuFonsMarcLfmd` (vegeu `MegaStripePanel`): la seva `feColorMatrix` calcula
 * l'alfa com `vermell - blau`, o sigui que el groc del marc i del text (R=240,
 * B=0) es queda sencer i la placa blava (R=48, B=240) queda amb alfa negativa,
 * que es zero. I de passada el pinta de blanc, que es el que ha de ser.
 *
 * (`mix-blend-mode: lighten` tambe ho hauria fet, pero NO funciona aqui: la capa
 * dels dibuixos te `z-index` i es un context apilat propi, o sigui que el dibuix
 * no te el vel al darrere per fondre-s'hi.)
 */
export const FILTRE_ID_MARC_LFMD = 'hgTreuFonsMarcLfmd';
export const FILTRE_DIBUIX_DESACTIVAT_LFMD_MARC = `url(#${FILTRE_ID_MARC_LFMD}) opacity(0.2)`;
/**
 * El filtre dels altres dibuixos que nome's existeixen en color (els de CUBE, que
 * tambe van sense variant negra): se'ls treu el color i se'ls rebaixa igual que
 * als altres, que allo ja estava demanat i NO es toca.
 */
export const FILTRE_DIBUIX_DESACTIVAT_COLOR = 'grayscale(1) opacity(0.1)';

/**
 * CAP DIBUIX PORTA MIRALL, MAI, si no es demana de forma expressa.
 *
 * Gairebe tots els dibuixos trenquen la simetria a posta, i a mes la lectura
 * occidental es sempre d'esquerra a dreta: un mirall deixa els textos i els
 * logos del revés. El mirall de la segona filera s'aplica a les siluetes de
 * les samarretes (el vel), que no son dibuixos.
 */
