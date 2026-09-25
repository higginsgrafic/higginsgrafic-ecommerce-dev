/**
 * El mapa dibuix -> PDP.
 *
 * PER QUE EXISTEIX. El megaslide clica amb el NOM DEL DIBUIX («NX-01»), i la
 * PDP el que sap llegir es una RUTA del registre (`src/data/pdpRegistry.js`),
 * que es qui munta el router: `/<colleccio>/<ruta>` sobre `PdpPage`. Entre els
 * dos hi havia un forat: la cadena dibuix -> `product_mockups.variant_id` ->
 * `product_variants` -> producte no es pot recorre (mesurat el 25/09/2026 amb
 * el cataleg de desenvolupament: de 152 files de `product_mockups`, **cap** te
 * `variant_id`, i de 4.116 variants, **cap** te el camp `design`). El que queda
 * es el nom: aquest mapa el lliga, un cop, a partir del registre de debò.
 *
 * ATENCIO: NO es `/product/<slug>`. Aquella ruta existeix i tambe pinta un
 * producte, pero es un ALTRE component (`ProductDetailPage`), no la PDP del
 * registre. Posar-hi el clic portava la gent a una pagina que no es la
 * d'aquesta casa.
 *
 * D'ON SURT. Generat el 25/09/2026 creuant les dues taules, dins la propia
 * aplicacio (no a ma):
 *   - `dibuixosGraella16x4()` (`components/fullwide/CercadorTextRow.jsx`), que
 *     es la font de veritat dels noms i de l'ordre, amb els seus 64 dibuixos;
 *   - `PDP_REGISTRY` (`data/pdpRegistry.js`), amb els 64 productes i les seves
 *     rutes.
 * El nom de cada dibuix es normalitza (minuscules, sense accents, sense
 * puntuacio) i es compara amb la RUTA del producte de la SEVA colleccio. 55
 * dels 64 quadren aixi sols. Els 9 que no, son els «noms del registre» de mes
 * avall, tots ells mirats un a un.
 *
 * COM ES MANTE. Si el registre canvia una ruta, l'entrada s'ha de canviar aqui.
 * El dia que `product_mockups.variant_id` estigui omplert, aquest mapa es pot
 * substituir per la cadena de debò i aquest fitxer s'esborra.
 *
 * Els 9 noms que el registre escriu diferent:
 *   Iron Man '08 / '68   -> el registre no hi posa el guio: ironman-08 / ironman-68.
 *   Half Agony Half Hope -> quotes-half-agony-half-hope (les cites porten prefix).
 *   It Is A Truth        -> quotes-it-is-a-truth.
 *   I Prefer To Be       -> quotes-unsociable-and-taciturn (la cita es la
 *                           materia del dibuix; el registre nome's te aquesta).
 *   Cyber Cube           -> cube-cybercube.
 *   Iron Cube '08        -> cube-ironkong (es el que la propia graella enllaça).
 *   Iron Cube '68        -> cube-ironman-68.
 *   Looking For My Darcy Yellow Frame -> el registre NO te cap producte de marc
 *                           groc sol: nome's el «pink-yellow-frame». Pendent que
 *                           l'amo el crei; mentrestant el dibuix porta aqui.
 */

/** `colleccio|dibuix` -> `/<colleccio>/<ruta>` de la PDP. */
export const PDP_ROUTES = {
  // FIRST_CONTACT
  'first_contact|NX-01': '/first-contact/nx-01',
  'first_contact|NCC-1701': '/first-contact/ncc-1701',
  'first_contact|NCC-1701-D': '/first-contact/ncc-1701-d',
  'first_contact|Wormhole': '/first-contact/wormhole',
  'first_contact|The Phoenix': '/first-contact/the-phoenix',
  'first_contact|Vulcans End': '/first-contact/vulcans-end',
  "first_contact|Vulcan's End": '/first-contact/vulcans-end',
  'first_contact|Plasma Escape': '/first-contact/plasma-escape',

  // THE_HUMAN_INSIDE
  'the_human_inside|Afrodita-A': '/the-human-inside/afrodita',
  'the_human_inside|Afrodita': '/the-human-inside/afrodita',
  'the_human_inside|C3-P0': '/the-human-inside/c3-p0',
  'the_human_inside|C3P0': '/the-human-inside/c3-p0',
  'the_human_inside|Cyberman': '/the-human-inside/cyberman',
  "the_human_inside|Cylon '03": '/the-human-inside/cylon-03',
  'the_human_inside|Cylon 03': '/the-human-inside/cylon-03',
  "the_human_inside|Cylon '78": '/the-human-inside/cylon-78',
  'the_human_inside|Cylon 78': '/the-human-inside/cylon-78',
  "the_human_inside|Iron Man '08": '/the-human-inside/ironman-08',
  'the_human_inside|Iron Man 08': '/the-human-inside/ironman-08',
  'the_human_inside|iron-man-08': '/the-human-inside/ironman-08',
  "the_human_inside|Iron Man '68": '/the-human-inside/ironman-68',
  'the_human_inside|Iron Man 68': '/the-human-inside/ironman-68',
  'the_human_inside|iron-man-68': '/the-human-inside/ironman-68',
  'the_human_inside|Maschinenmensch': '/the-human-inside/maschinenmensch',
  'the_human_inside|Mazinger-Z': '/the-human-inside/mazinger',
  'the_human_inside|Mazinger': '/the-human-inside/mazinger',
  'the_human_inside|R2-D2': '/the-human-inside/r2-d2',
  'the_human_inside|Robbie The Robot': '/the-human-inside/robbie-the-robot',
  'the_human_inside|Robbie the Robot': '/the-human-inside/robbie-the-robot',
  'the_human_inside|Robocop': '/the-human-inside/robocop',
  'the_human_inside|Terminator': '/the-human-inside/terminator',
  'the_human_inside|The Dalek': '/the-human-inside/the-dalek',
  'the_human_inside|Vader': '/the-human-inside/vader',

  // AUSTEN
  'austen|Pemberley House': '/austen/pemberley-house',
  'austen|pemberley-house': '/austen/pemberley-house',
  'austen|Keep Calm': '/austen/keep-calm',
  'austen|keep-calm': '/austen/keep-calm',
  'austen|Allow Me To Tell You': '/austen/quotes-you-have-bewitched-me',
  'austen|you-must-allow-me': '/austen/quotes-you-have-bewitched-me',
  'austen|Body And Soul': '/austen/quotes-i-admire-and-love-you',
  'austen|body-and-soul': '/austen/quotes-i-admire-and-love-you',
  'austen|Half Agony Half Hope': '/austen/quotes-half-agony-half-hope',
  'austen|half-agony-half-hope': '/austen/quotes-half-agony-half-hope',
  'austen|I Prefer To Be': '/austen/quotes-unsociable-and-taciturn',
  'austen|unsociable-and-taciturn': '/austen/quotes-unsociable-and-taciturn',
  'austen|i-prefer-to-be': '/austen/quotes-unsociable-and-taciturn',
  'austen|It Is A Truth': '/austen/quotes-it-is-a-truth',
  'austen|it-is-a-truth': '/austen/quotes-it-is-a-truth',
  'austen|Persuasion 1': '/austen/persuasion-1',
  'austen|persuasion-1': '/austen/persuasion-1',
  'austen|Persuasion 2': '/austen/persuasion-2',
  'austen|persuasion-2': '/austen/persuasion-2',
  'austen|Persuasion 3': '/austen/persuasion-3',
  'austen|persuasion-3': '/austen/persuasion-3',
  'austen|Persuasion 4': '/austen/persuasion-4',
  'austen|persuasion-4': '/austen/persuasion-4',
  'austen|Pride And Prejudice 1': '/austen/pride-and-prejudice-1',
  'austen|pride-and-prejudice-1': '/austen/pride-and-prejudice-1',
  'austen|Pride And Prejudice 2': '/austen/pride-and-prejudice-2',
  'austen|pride-and-prejudice-2': '/austen/pride-and-prejudice-2',
  'austen|Pride And Prejudice 3': '/austen/pride-and-prejudice-3',
  'austen|pride-and-prejudice-3': '/austen/pride-and-prejudice-3',
  'austen|Pride And Prejudice 4': '/austen/pride-and-prejudice-4',
  'austen|pride-and-prejudice-4': '/austen/pride-and-prejudice-4',
  'austen|Sense And Sensibility 1': '/austen/sense-and-sensibility-1',
  'austen|sense-and-sensibility-1': '/austen/sense-and-sensibility-1',
  'austen|Sense And Sensibility 2': '/austen/sense-and-sensibility-2',
  'austen|sense-and-sensibility-2': '/austen/sense-and-sensibility-2',
  'austen|Sense And Sensibility 3': '/austen/sense-and-sensibility-3',
  'austen|sense-and-sensibility-3': '/austen/sense-and-sensibility-3',
  'austen|Sense And Sensibility 4': '/austen/sense-and-sensibility-4',
  'austen|sense-and-sensibility-4': '/austen/sense-and-sensibility-4',
  'austen|Looking For My Darcy Blue Solid': '/austen/looking-for-my-darcy-blue-solid',
  'austen|blue-solid': '/austen/looking-for-my-darcy-blue-solid',
  'austen|Looking For My Darcy Fuchsia Solid': '/austen/looking-for-my-darcy-pink-solid',
  'austen|fuchsia-solid': '/austen/looking-for-my-darcy-pink-solid',
  'austen|Looking For My Darcy Red Solid': '/austen/looking-for-my-darcy-red-solid',
  'austen|red-solid': '/austen/looking-for-my-darcy-red-solid',
  'austen|Looking For My Darcy Yellow Solid': '/austen/looking-for-my-darcy-yellow-solid',
  'austen|yellow-solid': '/austen/looking-for-my-darcy-yellow-solid',
  'austen|Looking For My Darcy Yellow Blue Frame': '/austen/looking-for-my-darcy-yellow-blue-frame',
  'austen|blue-frame': '/austen/looking-for-my-darcy-yellow-blue-frame',
  'austen|Looking For My Darcy Yellow Fuchsia Frame': '/austen/looking-for-my-darcy-yellow-pink-frame',
  'austen|fuchsia-frame': '/austen/looking-for-my-darcy-yellow-pink-frame',
  'austen|Looking For My Darcy Red Yellow Frame': '/austen/looking-for-my-darcy-red-yellow-frame',
  'austen|red-frame': '/austen/looking-for-my-darcy-red-yellow-frame',
  'austen|Looking For My Darcy Yellow Frame': '/austen/looking-for-my-darcy-pink-yellow-frame',
  'austen|yellow-frame': '/austen/looking-for-my-darcy-pink-yellow-frame',

  // CUBE
  'cube|Afrodita-C': '/cube/afrodita-c',
  'cube|Afrodita C': '/cube/afrodita-c',
  'cube|3cube-P0': '/cube/3cube-p0',
  'cube|Cube 3 P0': '/cube/3cube-p0',
  'cube|Cyber Cube': '/cube/cybercube',
  'cube|cyber-cube': '/cube/cybercube',
  "cube|Cylon Cube '03": '/cube/cylon-cube',
  'cube|Cylon Cube 03': '/cube/cylon-cube',
  'cube|cylon-cube-03': '/cube/cylon-cube',
  'cube|Darth Cube': '/cube/darth-cube',
  "cube|Iron Cube '08": '/cube/ironkong',
  'cube|Iron Kong': '/cube/ironkong',
  'cube|iron-cube-08': '/cube/ironkong',
  "cube|Iron Cube '68": '/cube/ironman-68',
  'cube|Iron Cube 68': '/cube/ironman-68',
  'cube|iron-cube-68': '/cube/ironman-68',
  'cube|Maschinencube': '/cube/maschinencube',
  'cube|MaschinenCube': '/cube/maschinencube',
  'cube|Mazinger-C': '/cube/mazinger-c',
  'cube|Mazinger C': '/cube/mazinger-c',
  'cube|Robocube': '/cube/robocube',
  'cube|RoboCube': '/cube/robocube',

  // MISCELLANIA
  'miscellania|Arthur D The Second': '/miscellania/arthur-d-the-second',
  'miscellania|arthur-d-the-second': '/miscellania/arthur-d-the-second',
  'miscellania|Death staR2D2': '/miscellania/death-star2d2',
  'miscellania|death-star2d2': '/miscellania/death-star2d2',
  'miscellania|DJ Vader': '/miscellania/dj-vader',
  'miscellania|dj-vader': '/miscellania/dj-vader',
  'miscellania|Pont Del Diable': '/miscellania/pont-del-diable',
  'miscellania|pont-del-diable': '/miscellania/pont-del-diable',
  'miscellania|R2D2 Quote': '/miscellania/r2d2-quote',
  'miscellania|r2d2-quote': '/miscellania/r2d2-quote',
};

const INDEX = new Map(Object.entries(PDP_ROUTES));

const normalitza = (s) => String(s)
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[·’'`´]/g, '-')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

/**
 * L'URL de la PDP d'un dibuix del megaslide, o `null` si no hi es.
 *
 * La clau es busca amb el nom tal com ve (la graella passa l'etiqueta, la
 * franja el nom del dibuix) i tambe normalitzat i en minuscules, perque les
 * dues fonts no sempre coincideixen en accents ni en puntuacio.
 *
 * @param {string} collection - colleccio del megaslide ('first_contact', ...)
 * @param {string} item - nom del dibuix ('NX-01', 'Afrodita-C', ...)
 * @returns {string|null} `/<colleccio>/<ruta>`, o `null`
 */
export function findPdpUrl(collection, item) {
  if (typeof collection !== 'string' || typeof item !== 'string' || !item) return null;
  // Els dibuixos d'austen i miscellania son una ruta de fitxer: nome's en vol
  // el nom del fitxer.
  const net = item.split('/').pop().replace(/-b-grid|-grid|\.webp$/gi, '');
  const exacte = `${collection}|${net}`;
  if (INDEX.has(exacte)) return INDEX.get(exacte);
  const clau = normalitza(net);
  for (const [k, v] of INDEX) {
    const [coll, nom] = k.split('|');
    if (coll !== collection) continue;
    if (normalitza(nom) === clau) return v;
  }
  return null;
}
