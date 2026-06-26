/**
 * megaSlideMedia
 * -----------------------------------------------------------------------------
 * Mapatge col·lecció → asset de stripe/grid utilitzat pel mega-slide.
 *
 * Cada constant és un diccionari `nom de l'item → ruta pública` ordenat per
 * col·lecció (`first_contact`, `the_human_inside`, `cube`) i variant
 * cromàtica (negre, blanc, multicolor). Conté només dades; no dependència
 * amb React. Es pot importar lliurement des de qualsevol component.
 */

export const FIRST_CONTACT_MEDIA = {
  'NX-01': '/custom_logos/drawings/images_stripe/first_contact/black/nx-01-b-stripe.webp',
  'NCC-1701': '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-b-stripe.webp',
  'NCC-1701-D': '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-d-b-stripe.webp',
  'Wormhole': '/custom_logos/drawings/images_stripe/first_contact/black/wormhole-b-stripe.webp',
  'Plasma Escape': '/custom_logos/drawings/images_stripe/first_contact/black/plasma-escape-b-stripe.webp',
  "Vulcan's End": '/custom_logos/drawings/images_stripe/first_contact/black/vulcans-end-b-stripe.webp',
  'The Phoenix': '/custom_logos/drawings/images_stripe/first_contact/black/the-phoenix-b-stripe.webp',
};

export const FIRST_CONTACT_MEDIA_WHITE = {
  'NX-01': '/custom_logos/drawings/images_stripe/first_contact/white/nx-01-w-stripe.webp',
  'NCC-1701': '/custom_logos/drawings/images_stripe/first_contact/white/ncc-1701-w-stripe.webp',
  'NCC-1701-D': '/custom_logos/drawings/images_stripe/first_contact/white/ncc-1701-d-w-stripe.webp',
  'Wormhole': '/custom_logos/drawings/images_stripe/first_contact/white/wormhole-w-stripe.webp',
  'Plasma Escape': '/custom_logos/drawings/images_stripe/first_contact/white/plasma-escape-w-stripe.webp',
  "Vulcan's End": '/custom_logos/drawings/images_stripe/first_contact/white/vulcans-end-w-stripe.webp',
  'The Phoenix': '/custom_logos/drawings/images_stripe/first_contact/white/the-phoenix-w-stripe.webp',
};

export const FIRST_CONTACT_MEDIA_COLOR = {
  'NX-01': '/custom_logos/drawings/images_stripe/first_contact/color/nx-01-multi-light-stripe.webp',
  'NCC-1701': '/custom_logos/drawings/images_stripe/first_contact/color/ncc-1701-multi-light-stripe.webp',
  'NCC-1701-D': '/custom_logos/drawings/images_stripe/first_contact/color/ncc-1701-d-multi-light-stripe.webp',
  'Wormhole': '/custom_logos/drawings/images_stripe/first_contact/color/wormhole-multi-light-stripe.webp',
  'Plasma Escape': '/custom_logos/drawings/images_stripe/first_contact/color/plasma-escape-multi-light-stripe.webp',
  "Vulcan's End": '/custom_logos/drawings/images_stripe/first_contact/color/vulcans-end-multi-light-stripe.webp',
  'The Phoenix': '/custom_logos/drawings/images_stripe/first_contact/color/the-phoenix-multi-light-stripe.webp',
};

export const THE_HUMAN_INSIDE_MEDIA = {
  'R2-D2': '/custom_logos/drawings/images_grid/the_human_inside/black/r2-d2-b-grid.webp',
  'The Dalek': '/custom_logos/drawings/images_grid/the_human_inside/black/the-dalek-b-grid.webp',
  'C3P0': '/custom_logos/drawings/images_grid/the_human_inside/black/c3-p0-b-grid.webp',
  'Vader': '/custom_logos/drawings/images_grid/the_human_inside/black/vader-b-grid.webp',
  'Afrodita': '/custom_logos/drawings/images_grid/the_human_inside/black/afrodita-a-b-grid.webp',
  'Mazinger': '/custom_logos/drawings/images_grid/the_human_inside/black/mazinger-z-b-grid.webp',
  'Cylon 78': '/custom_logos/drawings/images_grid/the_human_inside/black/cylon-78-b-grid.webp',
  'Cylon 03': '/custom_logos/drawings/images_grid/the_human_inside/black/cylon-03-b-grid.webp',
  'Iron Man 68': '/custom_logos/drawings/images_grid/the_human_inside/black/iron-man-68-b-grid.webp',
  'Iron Man 08': '/custom_logos/drawings/images_grid/the_human_inside/black/iron-man-08-b-grid.webp',
  Cyberman: '/custom_logos/drawings/images_grid/the_human_inside/black/cyberman-b-grid.webp',
  Robocop: '/custom_logos/drawings/images_grid/the_human_inside/black/robocop-b-grid.webp',
  Terminator: '/custom_logos/drawings/images_grid/the_human_inside/black/terminator-b-grid.webp',
  Maschinenmensch: '/custom_logos/drawings/images_grid/the_human_inside/black/maschinenmensch-b-grid.webp',
  'Robby the Robot': '/custom_logos/drawings/images_grid/the_human_inside/black/robby-the-robot-b-grid.webp',
  'Robbie the Robot': '/custom_logos/drawings/images_grid/the_human_inside/black/robby-the-robot-b-grid.webp',
};

export const THE_HUMAN_INSIDE_MEDIA_WHITE = {
  ...THE_HUMAN_INSIDE_MEDIA,
};

export const CUBE_MEDIA = {
  'Iron Kong': '/custom_logos/drawings/images_stripe/cube/iron-cube-08-iron-kong-stripe.webp',
  'Iron Cube 68': '/custom_logos/drawings/images_stripe/cube/iron-cube-68-stripe.webp',
  RoboCube: '/custom_logos/drawings/images_stripe/cube/robocube-stripe.webp',
  'Cylon Cube': '/custom_logos/drawings/images_stripe/cube/cylon-cube-03-stripe.webp',
  'Cylon Cube 03': '/custom_logos/drawings/images_stripe/cube/cylon-cube-03-stripe.webp',
  MaschinenCube: '/custom_logos/drawings/images_stripe/cube/maschinencube-stripe.webp',
  'Mazinger C': '/custom_logos/drawings/images_stripe/cube/mazinger-c-stripe.webp',
  'Afrodita C': '/custom_logos/drawings/images_stripe/cube/afrodita-c-stripe.webp',
  'Cube 3 P0': '/custom_logos/drawings/images_stripe/cube/cube-3-p0-stripe.webp',
  '3cube p0': '/custom_logos/drawings/images_stripe/cube/cube-3-p0-stripe.webp',
  '3cube-p0': '/custom_logos/drawings/images_stripe/cube/cube-3-p0-stripe.webp',
  'Cyber Cube': '/custom_logos/drawings/images_stripe/cube/cyber-cube-stripe.webp',
  'Darth Cube': '/custom_logos/drawings/images_stripe/cube/darth-cube-stripe.webp',
};
