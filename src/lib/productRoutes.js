/**
 * productRoutes
 * -----------------------------------------------------------------------------
 * Llista canònica de totes les rutes de PDP de producte (sincronitzada amb les
 * rutes registrades a App.jsx). S'utilitza per a navegació aleatòria (p.ex. el
 * poster "CADA PERSONA TÉ UNA HISTÒRIA…").
 */

export const PRODUCT_PATHS = [
  // First Contact
  '/first-contact/nx-01',
  '/first-contact/ncc-1701',
  '/first-contact/ncc-1701-d',
  '/first-contact/wormhole',
  '/first-contact/plasma-escape',
  '/first-contact/vulcans-end',
  '/first-contact/the-phoenix',
  // The Human Inside
  '/the-human-inside/c3-p0',
  '/the-human-inside/r2-d2',
  '/the-human-inside/vader',
  '/the-human-inside/afrodita',
  '/the-human-inside/mazinger',
  '/the-human-inside/cylon-78',
  '/the-human-inside/cylon-03',
  '/the-human-inside/cyberman',
  '/the-human-inside/maschinenmensch',
  '/the-human-inside/robocop',
  '/the-human-inside/ironman-68',
  '/the-human-inside/ironman-08',
  '/the-human-inside/robbie-the-robot',
  '/the-human-inside/terminator',
  '/the-human-inside/the-dalek',
  // Cube
  '/cube/afrodita-c',
  '/cube/mazinger-c',
  '/cube/ironman-68',
  '/cube/ironkong',
  '/cube/robocube',
  '/cube/cylon-cube',
  '/cube/maschinencube',
  '/cube/darth-cube',
  '/cube/3cube-p0',
  '/cube/cybercube',
  // Miscel·lània
  '/miscellania/pont-del-diable',
  '/miscellania/dj-vader',
  '/miscellania/death-star2d2',
  '/miscellania/arthur-d-the-second',
  '/miscellania/r2d2-quote',
  // Austen
  '/austen/pemberley-house',
  '/austen/keep-calm',
  '/austen/quotes-half-agony-half-hope',
  '/austen/quotes-i-admire-and-love-you',
  '/austen/quotes-it-is-a-truth',
  '/austen/quotes-unsociable-and-taciturn',
  '/austen/quotes-you-have-bewitched-me',
  '/austen/persuasion-1',
  '/austen/persuasion-2',
  '/austen/persuasion-3',
  '/austen/persuasion-4',
  '/austen/pride-and-prejudice-1',
  '/austen/pride-and-prejudice-2',
  '/austen/pride-and-prejudice-3',
  '/austen/pride-and-prejudice-4',
  '/austen/sense-and-sensibility-1',
  '/austen/sense-and-sensibility-2',
  '/austen/sense-and-sensibility-3',
  '/austen/sense-and-sensibility-4',
  '/austen/looking-for-my-darcy-blue-solid',
  '/austen/looking-for-my-darcy-pink-solid',
  '/austen/looking-for-my-darcy-pink-yellow-frame',
  '/austen/looking-for-my-darcy-red-solid',
  '/austen/looking-for-my-darcy-red-yellow-frame',
  '/austen/looking-for-my-darcy-yellow-blue-frame',
  '/austen/looking-for-my-darcy-yellow-pink-frame',
  '/austen/looking-for-my-darcy-yellow-solid',
];

// 14 colors oficials Gildan 64000.
export const ALL_COLORS = [
  'white', 'light-blue', 'royal', 'navy', 'purple', 'light-pink', 'daisy',
  'gold', 'red', 'kiwi', 'irish-green', 'military-green', 'forest-green', 'black',
];

// Colors foscos (sincronitzat amb pdpMockup.js): sobre samarreta fosca el dibuix
// és BLANC; sobre samarreta clara el dibuix és NEGRE.
const DARK_COLORS = [
  'royal', 'purple', 'navy', 'red', 'irish-green', 'military-green', 'forest-green', 'black',
];
const LIGHT_COLORS = ALL_COLORS.filter((c) => !DARK_COLORS.includes(c));

// Productes amb dibuix multicolor ("color"): cube/* i austen looking-for-my-darcy.
const isMultiPath = (p) =>
  p.startsWith('/cube/') || p.startsWith('/austen/looking-for-my-darcy');

const MULTI_PATHS = PRODUCT_PATHS.filter(isMultiPath);
const MONO_PATHS = PRODUCT_PATHS.filter((p) => !isMultiPath(p)); // suporten negre i blanc

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickExcept = (arr, except) => {
  const pool = arr.filter((x) => x !== except);
  return pick(pool.length > 0 ? pool : arr);
};

// Memòria entre clics (persisteix mentre dura la sessió SPA).
let lastCategory = null; // 'negre' | 'blanc' | 'color'
let lastColor = null;

const CATEGORIES = ['negre', 'blanc', 'color'];

/**
 * Tria una pàgina de producte aleatòria amb un color de samarreta, garantint
 * que la categoria del dibuix (negre / blanc / color) sigui diferent de
 * l'anterior i que el color de samarreta tampoc es repeteixi.
 *  - 'color' → disseny multicolor (cube / looking-for-my-darcy).
 *  - 'negre' → dibuix negre sobre samarreta clara.
 *  - 'blanc' → dibuix blanc sobre samarreta fosca.
 * @returns {string} href tipus "/colleccio/route?color=xxx"
 */
export function getRandomProductHref(currentPath) {
  const category = pickExcept(CATEGORIES, lastCategory);

  const without = (arr) => {
    const pool = arr.filter((p) => p !== currentPath);
    return pool.length > 0 ? pool : arr;
  };

  let path;
  let color;
  let finish;
  if (category === 'color') {
    path = pick(without(MULTI_PATHS));
    color = pickExcept(ALL_COLORS, lastColor);
    finish = 'COLOR';
  } else if (category === 'negre') {
    path = pick(without(MONO_PATHS));
    color = pickExcept(LIGHT_COLORS, lastColor);
    finish = 'NEGRE';
  } else {
    path = pick(without(MONO_PATHS));
    color = pickExcept(DARK_COLORS, lastColor);
    finish = 'BLANC';
  }

  lastCategory = category;
  lastColor = color;
  return `${path}?color=${color}&finish=${finish}`;
}

/**
 * Retorna una ruta de producte aleatòria (sense color). Es manté per
 * compatibilitat.
 * @param {string} [excludePath]
 * @returns {string}
 */
export function getRandomProductPath(excludePath) {
  const pool = excludePath
    ? PRODUCT_PATHS.filter((p) => p !== excludePath)
    : PRODUCT_PATHS;
  const list = pool.length > 0 ? pool : PRODUCT_PATHS;
  return list[Math.floor(Math.random() * list.length)];
}
