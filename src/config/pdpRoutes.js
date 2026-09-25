/**
 * El mapa dibuix -> slug del cataleg.
 *
 * PER QUE EXISTEIX. El megaslide clica amb el NOM DEL DIBUIX («NX-01»), i la
 * PDP el que sap llegir es un producte de la taula `products`
 * (`getProductById`, que accepta id o slug). Entre els dos hi havia un forat:
 * la cadena dibuix -> `product_mockups.variant_id` -> `product_variants` ->
 * producte no es pot recorre (mesurat el 25/09/2026 amb el cataleg de
 * desenvolupament: de 152 files de `product_mockups`, **cap** te `variant_id`,
 * i de 4.116 variants, **cap** te el camp `design`). El que queda es el nom:
 * aquest mapa el lliga, un cop, a partir del cataleg de debò.
 *
 * D'ON SURT. Generat el 25/09/2026 creuant les dues taules, dins la propia
 * aplicacio (no a ma):
 *   - `dibuixosGraella16x4()` (`components/fullwide/CercadorTextRow.jsx`), que
 *     es la font de veritat dels noms i de l'ordre, amb els seus 64 dibuixos;
 *   - `productsService.getAllProducts()` (Supabase), amb els 64 productes
 *     actius i els seus slugs.
 * El nom de cada dibuix es normalitza (minuscules, sense accents, sense
 * puntuacio) i es compara amb el slug del producte de la SEVA colleccio, sense
 * el prefix de la colleccio. 49 dels 64 quadren aixi sols. Els 15 que no, son
 * els «noms del cataleg» de mes avall, tots ells mirats un a un.
 *
 * COM ES MANTE. Si el cataleg canvia un slug, l'entrada s'ha de canviar aqui.
 * El dia que `product_mockups.variant_id` estigui omplert, aquest mapa es pot
 * substituir per la cadena de debò i aquest fitxer s'esborra.
 *
 * Els noms del cataleg que no quadren sols (els 15):
 *   R2-D2               -> el cataleg l'escriu «r2d2», sense guio.
 *   Allow Me To Tell You / You Must Allow Me -> «you-have-bewitched-me» (cita).
 *   Body And Soul       -> «i-admire-and-love-you» (cita).
 *   Pride And Prejudice 1 -> «sense-and-sensibility-1-2»: al cataleg NO hi ha
 *                          cap producte de Pride And Prejudice 1; hi ha un
 *                          «Sense And Sensibility 1» duplicat. Pendent que
 *                          l'amo el crei; mentrestant el dibuix porta aqui.
 *   Looking For My Darcy Fuchsia Solid  -> «...-pink-solid» (fúcsia = rosa).
 *   Looking For My Darcy Yellow Blue Frame    -> «...-blue-frame».
 *   Looking For My Darcy Yellow Fuchsia Frame -> «...-yellow-pink-frame».
 *   Looking For My Darcy Yellow Frame   -> «...-frame» (el marc groc sense
 *                                          color de fons).
 *   Afrodita-C          -> «cube-afrodita»      (el cataleg no porta el sufix -C)
 *   Cyber Cube          -> «cube-cyberman»
 *   Cylon Cube '03      -> «cube-cylon-cube»
 *   Iron Cube '68       -> «cube-iron-cube»
 *   Maschinencube       -> «cube-maschinenmensch»
 *   Mazinger-C          -> «cube-mazinger»
 *   Robocube            -> «cube-iron-kong-2»
 */

/** `colleccio|dibuix` -> slug del cataleg. */
export const PDP_ROUTES = {
  // FIRST CONTACT
  'first_contact|NX-01': 'first-contact-nx-01',
  'first_contact|NCC-1701': 'first-contact-ncc-1701',
  'first_contact|NCC-1701-D': 'first-contact-ncc-1701-d',
  'first_contact|Wormhole': 'first-contact-wormhole',
  'first_contact|The Phoenix': 'first-contact-the-phoenix',
  'first_contact|Vulcans End': 'first-contact-vulcan-s-end',
  "first_contact|Vulcan's End": 'first-contact-vulcan-s-end',
  'first_contact|Plasma Escape': 'first-contact-plasma-escape',

  // THE HUMAN INSIDE
  'the_human_inside|Afrodita-A': 'the-human-inside-afrodita-a',
  'the_human_inside|Afrodita': 'the-human-inside-afrodita-a',
  'the_human_inside|C3-P0': 'the-human-inside-c3p0',
  'the_human_inside|C3P0': 'the-human-inside-c3p0',
  'the_human_inside|Cyberman': 'the-human-inside-cyberman',
  "the_human_inside|Cylon '03": 'the-human-inside-cylon-03',
  'the_human_inside|Cylon 03': 'the-human-inside-cylon-03',
  "the_human_inside|Cylon '78": 'the-human-inside-cylon-78',
  'the_human_inside|Cylon 78': 'the-human-inside-cylon-78',
  "the_human_inside|Iron Man '08": 'the-human-inside-iron-man-08',
  'the_human_inside|Iron Man 08': 'the-human-inside-iron-man-08',
  "the_human_inside|Iron Man '68": 'the-human-inside-iron-man-68',
  'the_human_inside|Iron Man 68': 'the-human-inside-iron-man-68',
  'the_human_inside|Maschinenmensch': 'the-human-inside-maschinenmensch',
  'the_human_inside|Mazinger-Z': 'the-human-inside-mazinger-z',
  'the_human_inside|Mazinger': 'the-human-inside-mazinger-z',
  'the_human_inside|R2-D2': 'the-human-inside-r2d2',
  'the_human_inside|Robbie The Robot': 'the-human-inside-robbie-the-robot',
  'the_human_inside|Robbie the Robot': 'the-human-inside-robbie-the-robot',
  'the_human_inside|Robocop': 'the-human-inside-robocop',
  'the_human_inside|Terminator': 'the-human-inside-terminator',
  'the_human_inside|The Dalek': 'the-human-inside-the-dalek',
  'the_human_inside|Vader': 'the-human-inside-vader',

  // AUSTEN
  'austen|Pemberley House': 'austen-pemberley-house',
  'austen|pemberley-house': 'austen-pemberley-house',
  'austen|Keep Calm': 'austen-keep-calm',
  'austen|keep-calm': 'austen-keep-calm',
  'austen|Allow Me To Tell You': 'austen-you-have-bewitched-me',
  'austen|you-must-allow-me': 'austen-you-have-bewitched-me',
  'austen|Body And Soul': 'austen-i-admire-and-love-you',
  'austen|body-and-soul': 'austen-i-admire-and-love-you',
  'austen|Half Agony Half Hope': 'austen-half-agony-half-hope',
  'austen|half-agony-half-hope': 'austen-half-agony-half-hope',
  'austen|I Prefer To Be': 'austen-unsociable-and-taciturn',
  'austen|unsociable-and-taciturn': 'austen-unsociable-and-taciturn',
  'austen|It Is A Truth': 'austen-it-is-a-truth',
  'austen|it-is-a-truth': 'austen-it-is-a-truth',
  'austen|Persuasion 1': 'austen-persuasion-1',
  'austen|persuasion-1': 'austen-persuasion-1',
  'austen|Persuasion 2': 'austen-persuasion-2',
  'austen|persuasion-2': 'austen-persuasion-2',
  'austen|Persuasion 3': 'austen-persuasion-3',
  'austen|persuasion-3': 'austen-persuasion-3',
  'austen|Persuasion 4': 'austen-persuasion-4',
  'austen|persuasion-4': 'austen-persuasion-4',
  'austen|Pride And Prejudice 1': 'austen-sense-and-sensibility-1-2',
  'austen|pride-and-prejudice-1': 'austen-sense-and-sensibility-1-2',
  'austen|Pride And Prejudice 2': 'austen-pride-and-prejudice-2',
  'austen|pride-and-prejudice-2': 'austen-pride-and-prejudice-2',
  'austen|Pride And Prejudice 3': 'austen-pride-and-prejudice-3',
  'austen|pride-and-prejudice-3': 'austen-pride-and-prejudice-3',
  'austen|Pride And Prejudice 4': 'austen-pride-and-prejudice-4',
  'austen|pride-and-prejudice-4': 'austen-pride-and-prejudice-4',
  'austen|Sense And Sensibility 1': 'austen-sense-and-sensibility-1',
  'austen|sense-and-sensibility-1': 'austen-sense-and-sensibility-1',
  'austen|Sense And Sensibility 2': 'austen-sense-and-sensibility-2',
  'austen|sense-and-sensibility-2': 'austen-sense-and-sensibility-2',
  'austen|Sense And Sensibility 3': 'austen-sense-and-sensibility-3',
  'austen|sense-and-sensibility-3': 'austen-sense-and-sensibility-3',
  'austen|Sense And Sensibility 4': 'austen-sense-and-sensibility-4',
  'austen|sense-and-sensibility-4': 'austen-sense-and-sensibility-4',
  'austen|Looking For My Darcy Blue Solid': 'austen-looking-for-my-darcy-blue-solid',
  'austen|blue-solid': 'austen-looking-for-my-darcy-blue-solid',
  'austen|Looking For My Darcy Fuchsia Solid': 'austen-looking-for-my-darcy-pink-solid',
  'austen|fuchsia-solid': 'austen-looking-for-my-darcy-pink-solid',
  'austen|Looking For My Darcy Red Solid': 'austen-looking-for-my-darcy-red-solid',
  'austen|red-solid': 'austen-looking-for-my-darcy-red-solid',
  'austen|Looking For My Darcy Yellow Solid': 'austen-looking-for-my-darcy-yellow-solid',
  'austen|yellow-solid': 'austen-looking-for-my-darcy-yellow-solid',
  'austen|Looking For My Darcy Yellow Blue Frame': 'austen-looking-for-my-darcy-blue-frame',
  'austen|blue-frame': 'austen-looking-for-my-darcy-blue-frame',
  'austen|Looking For My Darcy Yellow Fuchsia Frame': 'austen-looking-for-my-darcy-yellow-pink-frame',
  'austen|fuchsia-frame': 'austen-looking-for-my-darcy-yellow-pink-frame',
  'austen|Looking For My Darcy Red Yellow Frame': 'austen-looking-for-my-darcy-red-yellow-frame',
  'austen|red-frame': 'austen-looking-for-my-darcy-red-yellow-frame',
  'austen|Looking For My Darcy Yellow Frame': 'austen-looking-for-my-darcy-frame',
  'austen|yellow-frame': 'austen-looking-for-my-darcy-frame',

  // CUBE
  'cube|Afrodita-C': 'cube-afrodita',
  'cube|Afrodita C': 'cube-afrodita',
  'cube|3cube-P0': 'cube-3cube-p0',
  'cube|Cube 3 P0': 'cube-3cube-p0',
  'cube|Cyber Cube': 'cube-cyberman',
  "cube|Cylon Cube '03": 'cube-cylon-cube',
  'cube|Cylon Cube 03': 'cube-cylon-cube',
  'cube|Darth Cube': 'cube-darth-cube',
  "cube|Iron Cube '08": 'cube-iron-kong',
  'cube|Iron Kong': 'cube-iron-kong',
  "cube|Iron Cube '68": 'cube-iron-cube',
  'cube|Iron Cube 68': 'cube-iron-cube',
  'cube|Maschinencube': 'cube-maschinenmensch',
  'cube|MaschinenCube': 'cube-maschinenmensch',
  'cube|Mazinger-C': 'cube-mazinger',
  'cube|Mazinger C': 'cube-mazinger',
  'cube|Robocube': 'cube-iron-kong-2',
  'cube|RoboCube': 'cube-iron-kong-2',

  // MISCEL·LÀNIA
  'miscellania|Arthur D The Second': 'miscellania-arthur-d-the-second',
  'miscellania|arthur-d-the-second': 'miscellania-arthur-d-the-second',
  'miscellania|Death staR2D2': 'miscellania-death-star2d2',
  'miscellania|death-star2d2': 'miscellania-death-star2d2',
  'miscellania|DJ Vader': 'miscellania-dj-vader',
  'miscellania|dj-vader': 'miscellania-dj-vader',
  'miscellania|Pont Del Diable': 'miscellania-pont-del-diable',
  'miscellania|pont-del-diable': 'miscellania-pont-del-diable',
  'miscellania|R2D2 Quote': 'miscellania-r2d2-quote',
  'miscellania|r2d2-quote': 'miscellania-r2d2-quote',
};

const INDEX = new Map(Object.entries(PDP_ROUTES));

/**
 * El slug del cataleg d'un dibuix del megaslide, o `null` si no hi es.
 *
 * La clau es busca amb el nom tal com ve (la graella passa l'etiqueta, la
 * franja el nom del dibuix) i tambe normalitzat i en minuscules, perque les
 * dues fonts no sempre coincideixen en accents ni en puntuacio.
 *
 * @param {string} collection - colleccio del megaslide ('first_contact', ...)
 * @param {string} item - nom del dibuix ('NX-01', 'Afrodita-C', ...)
 * @returns {string|null} slug del cataleg (per a `/product/<slug>`)
 */
export function findPdpSlug(collection, item) {
  if (typeof collection !== 'string' || typeof item !== 'string' || !item) return null;
  // Els dibuixos d'austen i miscellania son una ruta de fitxer: nome's en vol
  // el nom del fitxer.
  const net = item.split('/').pop().replace(/-b-grid|-grid|\.webp$/gi, '');
  const exacte = `${collection}|${net}`;
  if (INDEX.has(exacte)) return INDEX.get(exacte);
  const clau = net
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[·’'`´]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  for (const [k, v] of INDEX) {
    const [coll, nom] = k.split('|');
    if (coll !== collection) continue;
    const clauK = nom
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[·’'`´]/g, '-')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (clauK === clau) return v;
  }
  return null;
}
