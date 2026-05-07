/**
 * Calibracions per defecte dels overlays de dibuixos sobre cada samarreta del
 * stripe del mega-slide.
 *
 * Aquest fitxer és la **font de veritat**. Els valors aquí s'apliquen a tots
 * els navegadors per defecte i garanteixen que un nou usuari (qualsevol
 * navegador, primera visita) vegi els dibuixos correctament posicionats.
 *
 * El `localStorage` (clau `MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC`)
 * continua existint com a override per-navegador en mode dev: si l'usuari
 * recalibra dins del HUD, es guarda al localStorage i té prioritat sobre el
 * default. Per "publicar" els canvis a la resta del món cal exportar-los i
 * actualitzar aquest fitxer.
 *
 * Workflow per actualitzar:
 *   1. A la consola del navegador on has calibrat:
 *      `JSON.parse(localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC'))`
 *   2. Copia el resultat aquí substituint `STRIPE_DRAWING_CALIBRATIONS`.
 *   3. Commit.
 */

export const STRIPE_DRAWING_CALIBRATIONS = {
  '/custom_logos/drawings/images_stripe/first_contact/black/nx-01-b-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-b-stripe.webp': { dx: 0.5, dy: 22.5, scale: 0.385 },
  '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-d-b-stripe.webp': { dx: 0.5, dy: 22.5, scale: 0.38 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/r2-d2-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/first_contact/black/wormhole-b-stripe.webp': { dx: 0.5, dy: 30, scale: 0.275 },
  '/custom_logos/drawings/images_stripe/first_contact/black/plasma-escape-b-stripe.webp': { dx: 0.5, dy: 29.25, scale: 0.285 },
  '/custom_logos/drawings/images_stripe/first_contact/black/vulcans-end-b-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/first_contact/black/the-phoenix-b-stripe.webp': { dx: 0.25, dy: 23, scale: 0.52 },
  '/custom_logos/drawings/images_stripe/cube/afrodita-c-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_grid/austen/crosswords/persuasion-1-grid.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/c3-p0-b-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/vader-b-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/afrodita-a-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/mazinger-z-b-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/cylon-78-b-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/cylon-03-b-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/miscel·lania/black/dj-vader-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/iron-man-68-b-stripe.webp': { dx: 0.5, dy: 27, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/iron-man-08-b-stripe.webp': { dx: 0, dy: 25, scale: 0.4 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/cyberman-b-stripe.webp': { dx: -0.25, dy: 24.5, scale: 0.4 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/the-dalek-b-stripe.webp': { dx: 0, dy: 24, scale: 0.43 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/maschinenmensch-b-stripe.webp': { dx: -0.5, dy: 25, scale: 0.39 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/robocop-b-stripe.webp': { dx: 0, dy: 25, scale: 0.39 },
  '/custom_logos/drawings/images_stripe/cube/iron-cube-08-iron-kong-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/cube/iron-cube-68-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/cube/robocube-stripe.webp': { dx: 0.75, dy: 32.5, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/cube/cylon-cube-03-stripe.webp': { dx: 0.75, dy: 29.5, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/cube/maschinencube-stripe.webp': { dx: 0.75, dy: 24.25, scale: 0.33 },
  '/custom_logos/drawings/images_stripe/cube/mazinger-c-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/cube/cube-3-p0-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/cube/cyber-cube-stripe.webp': { dx: 0.75, dy: 22.5, scale: 0.36 },
  '/custom_logos/drawings/images_stripe/cube/darth-cube-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/miscel·lania/black/death-star2d2-b-stripe.webp': { dx: 1, dy: 29.5, scale: 0.3 },
  '/custom_logos/drawings/images_stripe/miscel·lania/black/pont-del-diable-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/blue-dark-gradient-grid-dark-gradient-stripe.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/blue-frame-grid-frame-stripe.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/light/blue-light-gradient-grid-light-gradient-stripe.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/solid/blue-solid-grid-solid-stripe.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/fuchsia-dark-gradient-grid-dark-gradient-stripe.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/fuchsia-frame-grid-frame-stripe.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/fuchsia-frame-stripe.webp': { dx: 0.75, dy: 22.75, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/blue-frame-stripe.webp': { dx: 0.75, dy: 22.75, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/blue-dark-gradient-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/light/blue-light-gradient-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/solid/blue-solid-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-black-grid.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/fuchsia-dark-gradient-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/light/fuchsia-light-gradient-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-multi-red-grid.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-4-grid.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-3-grid.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-2-grid.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_stripe/austen/quotes/black/half-agony-half-hope-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/orange-frame-stripe.webp': { dx: 0.75, dy: 22.75, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/red-frame-stripe.webp': { dx: 0.75, dy: 22.75, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/yellow-frame-stripe.webp': { dx: 0.75, dy: 22.75, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/solid/fuchsia-solid-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/orange-dark-gradient-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/light/orange-light-gradient-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/solid/orange-solid-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/red-dark-gradient-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/light/red-light-gradient-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/solid/red-solid-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/yellow-dark-gradient-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/light/yellow-light-gradient-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/solid/yellow-solid-stripe.webp': { dx: 0.75, dy: 25.25, scale: 0.28 },
  '/custom_logos/drawings/images_stripe/austen/quotes/black/it-is-a-truth-b-stripe.webp': { dx: 3.75, dy: 23.5, scale: 0.23 },
  '/custom_logos/drawings/images_stripe/austen/quotes/black/you-must-allow-me-b-stripe.webp': { dx: 3.25, dy: 25.25, scale: 0.2 },
  '/custom_logos/drawings/images_stripe/austen/quotes/black/body-and-soul-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/quotes/black/unsociable-and-taciturn-b-stripe.webp': { dx: 3.75, dy: 16.75, scale: 0.34 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/persuasion-1-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/persuasion-2-stripe.webp': { dx: 2.5, dy: 20.25, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/pride-and-prejudice-2-stripe.webp': { dx: 2.5, dy: 20.25, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/pride-and-prejudice-1-stripe.webp': { dx: 2.5, dy: 20.25, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/persuasion-4-stripe.webp': { dx: 2.5, dy: 20.25, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/persuasion-3-stripe.webp': { dx: 2.5, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/pride-and-prejudice-3-stripe.webp': { dx: 2.5, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/pride-and-prejudice-4-stripe.webp': { dx: 2.5, dy: 20.25, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/sense-and-sensibility-1-stripe.webp': { dx: 2.5, dy: 20.25, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/sense-and-sensibility-2-stripe.webp': { dx: 2.5, dy: 20.25, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/sense-and-sensibility-4-stripe.webp': { dx: 2.5, dy: 20.25, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/sense-and-sensibility-3-stripe.webp': { dx: 2.5, dy: 20.25, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/white/keep-calm-w-stripe.webp': { dx: 1.25, dy: 28, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-red-stripe.webp': { dx: 1.25, dy: 28, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/miscel·lania/multi/dj-vader-multi-1-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/first_contact/white/nx-01-w-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/first_contact/white/ncc-1701-w-stripe.webp': { dx: 0.5, dy: 22.5, scale: 0.385 },
  '/custom_logos/drawings/images_stripe/first_contact/white/ncc-1701-d-w-stripe.webp': { dx: 0.5, dy: 22.5, scale: 0.38 },
  '/custom_logos/drawings/images_stripe/first_contact/white/wormhole-w-stripe.webp': { dx: 0.5, dy: 30, scale: 0.275 },
  '/custom_logos/drawings/images_stripe/first_contact/white/plasma-escape-w-stripe.webp': { dx: -0.25, dy: 30.25, scale: 0.3 },
  '/custom_logos/drawings/images_stripe/first_contact/white/vulcans-end-w-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/first_contact/white/the-phoenix-w-stripe.webp': { dx: 0.25, dy: 23, scale: 0.52 },
  '/custom_logos/drawings/images_stripe/first_contact/multi/ncc-1701-d-multi-light-stripe.webp': { dx: 0.5, dy: 22.5, scale: 0.38 },
  '/custom_logos/drawings/images_stripe/first_contact/multi/ncc-1701-multi-light-stripe.webp': { dx: 0.5, dy: 22.5, scale: 0.385 },
  '/custom_logos/drawings/images_stripe/first_contact/multi/nx-01-multi-light-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-dark-stripe.webp': { dx: 1.25, dy: 28, scale: 0.26 },
  '/custom_logos/drawings/images_originals/stripe/austen/keep_calm/multi/keep-calm-multi-dark-stripe.webp': { dx: 1, dy: 28.5, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/miscel·lania/multi/death-star2d2-multi-light-stripe.webp': { dx: 1, dy: 29.5, scale: 0.3 },
  '/custom_logos/drawings/images_stripe/miscel·lania/multi/pont-del-diable-multi-light-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_originals/stripe/austen/keep_calm/multi/keep-calm-multi-red-stripe.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_stripe/first_contact/multi/wormhole-multi-light-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/r2-d2-w-stripe.webp': { dx: 0.5, dy: 27.25, scale: 0.33 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/r2-d2-multi-light-stripe.webp': { dx: 0.5, dy: 27.25, scale: 0.33 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/c3-p0-multi-light-stripe.webp': { dx: 0.5, dy: 27.25, scale: 0.33 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/c3-p0-w-stripe.webp': { dx: 0.5, dy: 27.25, scale: 0.33 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/vader-multi-light-stripe.webp': { dx: 0.5, dy: 27.25, scale: 0.33 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/vader-w-stripe.webp': { dx: 0.5, dy: 27.25, scale: 0.33 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/afrodita-a-multi-dark-stripe.webp': { dx: 0.5, dy: 27.5, scale: 0.33 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/afrodita-a-w-stripe.webp': { dx: 0.5, dy: 27.5, scale: 0.33 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/mazinger-z-multi-light-stripe.webp': { dx: 0.5, dy: 30, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/mazinger-z-w-stripe.webp': { dx: 0.5, dy: 30, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/cylon-78-multi-light-stripe.webp': { dx: 0.75, dy: 22.5, scale: 0.36 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/cylon-78-w-stripe.webp': { dx: 0.75, dy: 22.5, scale: 0.36 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/cylon-03-multi-light-stripe.webp': { dx: 0.5, dy: 27.75, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/cylon-03-w-stripe.webp': { dx: 0.5, dy: 27.75, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/iron-man-68-multi-light-stripe.webp': { dx: 0.5, dy: 27, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/iron-man-68-w-stripe.webp': { dx: 0.5, dy: 27, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/iron-man-08-multi-light-stripe.webp': { dx: 0, dy: 25, scale: 0.4 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/iron-man-08-w-stripe.webp': { dx: 0, dy: 25, scale: 0.4 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/cyberman-multi-light-stripe.webp': { dx: -0.25, dy: 24.5, scale: 0.4 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/cyberman-w-stripe.webp': { dx: -0.25, dy: 24.5, scale: 0.4 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/the-dalek-multi-light-stripe.webp': { dx: 0, dy: 24, scale: 0.43 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/the-dalek-w-stripe.webp': { dx: 0, dy: 24, scale: 0.43 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/maschinenmensch-multi-light-stripe.webp': { dx: -0.5, dy: 25, scale: 0.39 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/maschinenmensch-w-stripe.webp': { dx: -0.5, dy: 25, scale: 0.39 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/robocop-multi-light-stripe.webp': { dx: 0, dy: 25, scale: 0.39 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/robocop-w-stripe.webp': { dx: 0, dy: 25, scale: 0.39 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/terminator-multi-light-stripe.webp': { dx: 0.25, dy: 27.5, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/terminator-b-stripe.webp': { dx: 0.25, dy: 27.5, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/terminator-w-stripe.webp': { dx: 0.25, dy: 27.5, scale: 0.32 },
  '/custom_logos/drawings/images_stripe/the_human_inside/multi/robbie-the-robot-multi-light-stripe.webp': { dx: 1, dy: 29, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/the_human_inside/black/robbie-the-robot-b-stripe.webp': { dx: 1, dy: 29, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/robbie-the-robot-w-stripe.webp': { dx: 1, dy: 29, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/first_contact/multi/vulcans-end-multi-light-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/first_contact/multi/the phoenix-multi-light-stripe.webp': { dx: 0.25, dy: 23, scale: 0.52 },
  '/custom_logos/drawings/images_stripe/first_contact/multi/plasma-escape-multi-light-stripe.webp': { dx: 0.5, dy: 28.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/miscel·lania/white/dj-vader-w-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/miscel·lania/white/death-star2d2-w-stripe.webp': { dx: 1, dy: 29.5, scale: 0.3 },
  '/custom_logos/drawings/images_stripe/miscel·lania/white/pont-del-diable-w-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/persuasion-1-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/quotes/multi/it-is-a-truth-multi-light-stripe.webp': { dx: 3.75, dy: 23.5, scale: 0.23 },
  '/custom_logos/drawings/images_stripe/austen/quotes/white/it-is-a-truth-w-stripe.webp': { dx: 3.75, dy: 23.5, scale: 0.23 },
  '/custom_logos/drawings/images_stripe/austen/quotes/multi/you-must-allow-me-multi-light-stripe.webp': { dx: 3.25, dy: 25.25, scale: 0.2 },
  '/custom_logos/drawings/images_stripe/austen/quotes/white/you-must-allow-me-w-stripe.webp': { dx: 3.25, dy: 25.25, scale: 0.2 },
  '/custom_logos/drawings/images_stripe/austen/quotes/multi/body-and-soul-multi-light-stripe.webp': { dx: 3.75, dy: 16.75, scale: 0.34 },
  '/custom_logos/drawings/images_stripe/austen/quotes/white/body-and-soul-w-stripe.webp': { dx: 3.75, dy: 16.75, scale: 0.34 },
  '/custom_logos/drawings/images_stripe/austen/quotes/multi/i-prefer-to-be-multi-light-stripe.webp': { dx: 3.75, dy: 16.75, scale: 0.34 },
  '/custom_logos/drawings/images_stripe/austen/quotes/white/unsociable-and-taciturn-w-stripe.webp': { dx: 3.75, dy: 16.75, scale: 0.34 },
  '/custom_logos/drawings/images_stripe/austen/quotes/white/half-agony-half-hope-w-stripe.webp': { dx: 3.75, dy: 19.75, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/quotes/multi/half-agony-half-hope-multi-light-stripe.webp': { dx: 3.75, dy: 19.75, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/persuasion-2-b-stripe.webp': { dx: 2.5, dy: 20.25, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/persuasion-3-b-stripe.webp': { dx: 2.5, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/persuasion-4-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/pride-and-prejudice-1-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/pride-and-prejudice-2-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/pride-and-prejudice-3-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/pride-and-prejudice-4-b-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/sense-and-sensibility-1-b-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/sense-and-sensibility-2-b-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/sense-and-sensibility-3-b-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/black/sense-and-sensibility-4-b-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '__HG_CANONICAL_STRIPE_DRAWING_OVERLAY__::austen::keep_calm': { dx: 1.25, dy: 28, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp': { dx: 1.25, dy: 28, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-thru-red-stripe.webp': { dx: 1.25, dy: 28, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-light-stripe.webp': { dx: 1.25, dy: 28, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-w-red-stripe.webp': { dx: 1.25, dy: 28, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-thru-light-stripe.webp': { dx: 1.25, dy: 28, scale: 0.26 },
  '/custom_logos/drawings/images_stripe/austen/quotes/white/i-prefer-to-be-w-stripe.webp': { dx: 3.75, dy: 16.75, scale: 0.34 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/persuasion-1-w-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_stripe/austen/pemberley_house/multi/pemberley-house-multi-light-stripe.webp': { dx: 4.5, dy: 21.5, scale: 0.33 },
  '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp': { dx: 4.5, dy: 21.5, scale: 0.33 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/sense-and-sensibility-4-w-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/persuasion-4-w-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/persuasion-3-w-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/persuasion-2-w-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/pride-and-prejudice-1-w-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/pride-and-prejudice-2-w-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/pride-and-prejudice-3-w-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/pride-and-prejudice-4-w-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/sense-and-sensibility-1-w-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/sense-and-sensibility-2-w-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/austen/crosswords/white/sense-and-sensibility-3-w-stripe.webp': { dx: 2.25, dy: 20.75, scale: 0.31 },
  '/custom_logos/drawings/images_stripe/the_human_inside/white/robby-the-robot-w-stripe.webp': { dx: 0, dy: 0, scale: 1 },
  '/custom_logos/drawings/images_stripe/miscel·lania/multi/dj-vader-multi-light-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_originals/stripe/austen/quotes/black/it-is-a-truth-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
  '/custom_logos/drawings/images_originals/stripe/austen/quotes/black/half-agony-half-hope-b-stripe.webp': { dx: 0.75, dy: 30, scale: 0.29 },
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
  stripe: { dx: 0, dy: 0, scale: 1.2125 },
  overlayScale: 0.97,
  ref2: { dx: 1018, dy: -3, scale: 1.075 },
  nudgeStep: 50,
  tileGapPx: 0,
};

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
