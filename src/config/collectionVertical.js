/**
 * Parametres de les cinc colleccions per a la vista vertical.
 *
 * Aixo es el que abans estava repetit (i divergent) a les cinc pagines
 * `Collection*Page.jsx`: la identitat, les icones, les rutes de producte, els
 * colors de la graella, les frases del poster i les dades de SEO. El component
 * unic (`CollectionVerticalPage`) en llegeix tot el que canvia entre
 * colleccions.
 *
 * IMPORTANT: aixo NOMES te dades. Si una colleccio necessita una variant
 * estructural, va al component com una opcio mes, no com un `if` amagat aqui.
 *
 * Els camps `copyN` (storageKey, editableIdPrefix, presetVersion) NO son
 * cosmetics: son les claus amb que cada pagina recorda el seu estat (opacitat
 * de les capes, camps editables i versio del preset). Han de coincidir
 * exactament amb les que hi havia, o el constructor perd l'estat desat.
 */

/** El menu d'icones que surt a la franja blanca, igual a totes les colleccions. */
export const COLLECTIONS_MENU = [
  {
    id: 'first-contact',
    name: 'First Contact',
    href: '/first-contact',
    icon: '/custom_logos/collections/collection-first-contact-logo.webp',
  },
  {
    id: 'the-human-inside',
    name: 'The Human Inside',
    href: '/the-human-inside',
    icon: '/custom_logos/collections/collection-thin-logo.svg',
  },
  {
    id: 'austen',
    name: 'Austen',
    href: '/austen',
    icon: '/custom_logos/collections/collection-jean-austen-logo.svg',
  },
  {
    id: 'cube',
    name: 'Cube',
    href: '/cube',
    icon: '/custom_logos/collections/collection-cube-logo.svg',
  },
  {
    id: 'miscellania',
    name: 'Miscel·lània',
    href: '/miscellania',
    icon: '/custom_logos/collections/collection-miscellania-logo.svg',
  },
];

/** El fons comu de totes les fitxes de la graella (el degradat va a cada fitxa). */
export const COLLECTION_BG_SRC = '/placeholders/tots_els_fons/fons_colleccio/00-colleccio.webp';

/** La imatge de fons de la hero: avui un placeholder compartit per les cinc. */
export const HERO_BACKGROUND_SRC = '/placeholders/hero/placeholder-noia.jpg';

/** Alcada de la franja blanca de la hero. Igual a totes les colleccions. */
export const BAND_HEIGHT = 'clamp(120px, 26vh, 260px)';

/**
 * Desplaçament vertical de les TDP, nomes elles. Va amb `translate` (no
 * `transform`) perque la graella ja fa servir transform per centrar-se.
 * ERA 120: les primeres fitxes quedaven dins la zona de la hero. Ara és 0.
 */
export const TDP_MOVE_PX = 0;

/**
 * Separacio entre la hero i la primera fila de fitxes, per orientacio.
 * A la tauleta horitzontal NO s'hi aplica res: alla ja hi havia prou aire.
 * La tauleta horitzontal es mes curta, aixi que el valor ha de ser diferent
 * per donar la mateixa distancia.
 */
export const HERO_TDP_GAP_PX = '-41px';

/**
 * Aire entre el fons de la hero i la primera fila de fitxes.
 *
 * El numero efectiu surt d'aqui: el desplaçament de la graella es calcula
 * exactament per deixar aquesta distancia. Amb 24 px les fitxes quedaven
 * enganxades a la imatge en tauleta (i a 1024 calien 293 px de desplaçament per
 * arribar-hi); amb 150 respiren de sobres.
 */
export const HERO_TDP_SEPARACIO_PX = 150;
/**
 * Separacio VERTICAL entre files de fitxes.
 *
 * El fons degradat de cada fitxa es un fill ABSOLUT que sobresurt 30 px a dalt i
 * 30 a baix (`CollectionTableCard`, esta fet a posta). La separacio entre dues
 * files, doncs, es:
 *
 *     30 px  (bleed de baix de la fitxa de dalt)
 *   + 25 px  (aire entre els dos fons)          <- el que es veu
 *   + 30 px  (bleed de dalt de la fitxa de baix)
 *   ------
 *     85 px  entre les caixes blanques
 *
 * El pitch de la graella hauria de ser l'alcada de la fitxa mes aquests 85 px.
 * Com que la fila de la graella NO es proporcional a l'alcada de la fitxa, el
 * pitch en px depen de l'amplada (14,1 files a 768 i 13,2 a 1920), i amb un
 * pitch fix de 15 files la separacio entre fons queda aixi:
 *
 *     ample   buit caixes   buit FONS
 *      768        91 px       31 px
 *     1024       121         61
 *     1280       150         90
 *     1440       117         57
 *     1920       155         95
 *
 * Amb 14 files el buit entre fons queia a 9 px a 768 (massa just); amb 15 es
 * queda entre 31 i 95 px. Clavar els 25 px exactes a totes les mides demanaria
 * deixar la graella de files i passar a un flex amb `gap`.
 */
export const TDP_PITCH_FILES = 15;
/** Aire entre els fons de dues files. Es el que es veu. */
export const TDP_SEPARACIO_FONS_PX = 15;
/** Quant sobresurt el fons degradat de la fitxa, a dalt i a baix. */
export const TDP_FONS_BLEED_PX = 30;

/**
 * Separacio entre l'ultima fila de fitxes i el text del poster del bloc final.
 * El marge del bloc es calcula per deixar exactament aquesta distancia.
 */
export const TDP_POSTER_SEPARACIO_PX = 90;
/**
 * `paddingTop` del bloc del poster (vegeu `TramFinal`): el seu text no arrenca
 * a dalt del bloc, i per calcular l'aire visible cal comptar-lo.
 */
export const TDP_POSTER_PADDING_TOP_PX = 50;

/**
 * Aire entre les targetes del rail i el peu de pagina.
 */
export const TDP_PEUSEPARACIO_PX = 24;

/**
 * Aire entre el titol d'una colleccio i la seva primera fila de fitxes, a la
 * pagina d'inici.
 *
 * ERA DUES COSES: les quatre ultimes colleccions feien servir 150 px
 * (75 a tauleta) i la PRIMERA en feia 75 (37 a tauleta). Com que la distancia
 * efectiva es `marge + 87 px` a escriptori i `marge + 38/39` a tauleta, la
 * primera colleccio quedava 88 px mes a prop de les seves fitxes que les
 * altres, i algu ho havia compensat amb un `top` negatiu propi de cada galeria
 * (-13, 0, -22, -6, -13), que desplaçava el dibuix en comptes d'ajustar el
 * marge. Un `top` per galeria es un pedaç: el que mana es el marge, i es un
 * de sol.
 */
export const HOME_TITOL_TDP_MARGIN_PX = { escriptori: 150, tauleta: 75 };

/**
 * Desplaçament propi de cada galeria de l'inici. JA NO SE N'HA DE FER SERVIR
 * CAP: existeix perque el marge era diferent a cada colleccio i algu ho
 * compensava movent el dibuix. Es deixa declarat a zero perque quedi escrit
 * que el numero que hi havia (-13, 0, -22, -6, -13) no era dissseny.
 */
export const HOME_GALERIA_TOP_PX = 0;

/**
 * Quina part de l'aire de sobre es conserva a la pindola «en vols saber mes?»
 * de la pagina d'inici.
 *
 * 0,5 vol dir que la pindola PUJA fins a deixar la meitat de l'aire que tenia
 * sobre la caixa de la targeta. L'aire depen del padding del bloc que conte la
 * pindola i canvia amb la mida, i per aixo es MESURA i no es calcula:
 * intentar-ho amb una formula donava 20 px d'error a 1920 i 189 a 768.
 */
export const HOME_PILL_AIRE_FACTOR = 0.5;

/**
 * Les mides interiors de la fitxa de taula, proporcionals a la SEVA amplada.
 *
 * Son aqui perque les fan servir DUES pagines (l'inici i les colleccions) i
 * abans estaven escrites a cadascuna: si una canvia i l'altra no, les fitxes
 * divergeixen tot i sortir del mateix component.
 *
 * `selectorAlcada` era 0,2 i `cistell` 0,15:
 *  - Amb la fila de la imatge quadrada la fitxa va creixer i el selector
 *    quedava massa alt (231 x 64 px a 1920, amb els botons mes alts que amples).
 *  - El cistell feia 48 px, el DOBLE del cos del text del preu. Mesurat amb les
 *    metriques de la font: els digits de «15,50€» fan 24,30 px d'alcada a 30 px
 *    de cos (la coma en baixa 3,48 mes, i no s'ha de comptar). Com que el text
 *    es el 9,5 % de l'amplada de la fitxa, el cistell ha de ser
 *    0,095 x (24,30/30) = 0,077, que son 24,7 px a 1920.
 */
export const TDP_MIDES_INTERIOR = {
  selectorAmplada: 0.72,
  selectorAlcada: 0.12,
  selectorFont: 0.07,
  text: 0.095,
  cistell: 0.077,
  preuGap: 0.1,
};

export const HERO_TDP_GAP_TABLET_PX = '338px';
export const HERO_TDP_GAP_LANDSCAPE_PX = '-240px';

// 14 colors canonics (ordre extret de FullWideSlideHeader.jsx).
// Repetits ciclicament fins a omplir les 16 cel·les del 4x4.
const TDP_GRID_COLORS = [
  ['white',        'light-blue',     'royal',         'purple'],
  ['navy',         'daisy',          'gold',          'light-pink'],
  ['red',          'kiwi',           'irish-green',   'military-green'],
  ['forest-green', 'black',          'white',         'light-blue'],
];

/**
 * Alguns fitxers de pagina feien servir els colors plans (una sola llista) i
 * indexaven amb `idx % length`; d'altres, la graella 4x4 per (fila, columna).
 * Dona resultats DIFERENTS a partir de la fila 4, aixi que es una decisio per
 * colleccio i no una unificacio.
 */
const TDP_GRID_COLORS_FLAT = TDP_GRID_COLORS.flat();

/**
 * Austen tenia la seva propia paleta: 14 colors plans, indexats amb
 * `idx % length`. Amb la graella 4x4 (nomes 4 files) les fitxes de la 5a fila
 * en endavant quedaven sense color i no es pintaven: 16 fitxes en comptes de 28.
 */
const CANON_COLORS = [
  'white', 'light-blue', 'royal', 'purple',
  'navy', 'daisy', 'gold', 'light-pink',
  'red', 'kiwi', 'irish-green', 'military-green',
  'forest-green', 'black',
];

/** Productes de Cube (s'assignen a les cel·les ciclicament). */
const CUBE_PRODUCTS = [
  { route: 'afrodita-c', name: 'AFRODITA-C' },
  { route: 'mazinger-c', name: 'MAZINGER-C' },
  { route: 'ironman-68', name: 'IRON CUBE 68' },
  { route: 'ironkong', name: 'IRON CUBE 08' },
  { route: 'robocube', name: 'ROBOCUBE' },
  { route: 'cylon-cube', name: 'CYLON CUBE' },
  { route: 'maschinencube', name: 'MASCHINENCUBE' },
  { route: 'darth-cube', name: 'DARTH CUBE' },
  { route: '3cube-p0', name: '3CUBE-P0' },
  { route: 'cybercube', name: 'CYBERCUBE' },
];

/** Productes de First Contact (s'assignen a les cel·les ciclicament). */
const FIRST_CONTACT_PRODUCTS = [
  { route: 'nx-01', name: 'NX-01' },
  { route: 'ncc-1701', name: 'NCC-1701' },
  { route: 'ncc-1701-d', name: 'NCC-1701-D' },
  { route: 'wormhole', name: 'WORMHOLE' },
  { route: 'plasma-escape', name: 'PLASMA ESCAPE' },
  { route: 'vulcans-end', name: 'VULCANS END' },
  { route: 'the-phoenix', name: 'THE PHOENIX' },
];

/** Productes de Miscel·lània (s'assignen a les cel·les ciclicament). */
const MISCELLANIA_PRODUCTS = [
  { route: 'pont-del-diable', name: 'PONT DEL DIABLE' },
  { route: 'dj-vader', name: 'DJ VADER' },
  { route: 'death-star2d2', name: 'DEATH STAR2D2' },
  { route: 'arthur-d-the-second', name: 'ARTHUR D THE SECOND' },
  { route: 'r2d2-quote', name: 'R2D2 QUOTE' },
];

/** Productes de The Human Inside (s'assignen a les cel·les ciclicament). */
const THE_HUMAN_INSIDE_PRODUCTS = [
  { route: 'c3-p0', name: 'C3-P0' },
  { route: 'r2-d2', name: 'R2-D2' },
  { route: 'vader', name: 'VADER' },
  { route: 'afrodita', name: 'AFRODITA' },
  { route: 'mazinger', name: 'MAZINGER' },
  { route: 'cylon-78', name: 'CYLON-78' },
  { route: 'cylon-03', name: 'CYLON-03' },
  { route: 'cyberman', name: 'CYBERMAN' },
  { route: 'maschinenmensch', name: 'MASCHINENMENSCH' },
  { route: 'robocop', name: 'ROBOCOP' },
  { route: 'ironman-68', name: 'IRONMAN-68' },
  { route: 'ironman-08', name: 'IRONMAN-08' },
  { route: 'robbie-the-robot', name: 'ROBBIE THE ROBOT' },
  { route: 'terminator', name: 'TERMINATOR' },
  { route: 'the-dalek', name: 'THE DALEK' },
];

/** Productes de Austen (s'assignen a les cel·les ciclicament). */
const AUSTEN_PRODUCTS = [
  { collection: 'austen-keep-calm', route: 'keep-calm', name: 'KEEP CALM' },
  { collection: 'austen-pemberley', route: 'pemberley-house', name: 'PEMBERLEY HOUSE' },
  { collection: 'austen-quotes', route: 'quotes-half-agony-half-hope', name: 'HALF AGONY HALF HOPE', nomLinies: ['HALF AGONY', 'HALF HOPE'] },
  { collection: 'austen-quotes', route: 'quotes-i-admire-and-love-you', name: 'I ADMIRE AND LOVE YOU' },
  { collection: 'austen-quotes', route: 'quotes-it-is-a-truth', name: 'IT IS A TRUTH' },
  { collection: 'austen-quotes', route: 'quotes-unsociable-and-taciturn', name: 'UNSOCIABLE AND TACITURN', nomLinies: ['UNSOCIABLE', 'AND TACITURN'] },
  { collection: 'austen-quotes', route: 'quotes-you-have-bewitched-me', name: 'YOU HAVE BEWITCHED ME', nomLinies: ['YOU HAVE', 'BEWITCHED ME'] },
  { collection: 'austen-crosswords', route: 'persuasion-1', name: 'PERSUASION 1' },
  { collection: 'austen-crosswords', route: 'persuasion-2', name: 'PERSUASION 2' },
  { collection: 'austen-crosswords', route: 'persuasion-3', name: 'PERSUASION 3' },
  { collection: 'austen-crosswords', route: 'persuasion-4', name: 'PERSUASION 4' },
  { collection: 'austen-crosswords', route: 'pride-and-prejudice-1', name: 'PRIDE & PREJUDICE 1' },
  { collection: 'austen-crosswords', route: 'pride-and-prejudice-2', name: 'PRIDE & PREJUDICE 2' },
  { collection: 'austen-crosswords', route: 'pride-and-prejudice-3', name: 'PRIDE & PREJUDICE 3' },
  { collection: 'austen-crosswords', route: 'pride-and-prejudice-4', name: 'PRIDE & PREJUDICE 4' },
  { collection: 'austen-crosswords', route: 'sense-and-sensibility-1', name: 'SENSE & SENSIBILITY 1' },
  { collection: 'austen-crosswords', route: 'sense-and-sensibility-2', name: 'SENSE & SENSIBILITY 2' },
  { collection: 'austen-crosswords', route: 'sense-and-sensibility-3', name: 'SENSE & SENSIBILITY 3' },
  { collection: 'austen-crosswords', route: 'sense-and-sensibility-4', name: 'SENSE & SENSIBILITY 4' },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-blue-solid', name: 'LOOKING FOR MY DARCY', nomLinies: ['LOOKING FOR', 'MY DARCY'] },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-pink-solid', name: 'LOOKING FOR MY DARCY', nomLinies: ['LOOKING FOR', 'MY DARCY'] },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-pink-yellow-frame', name: 'LOOKING FOR MY DARCY', nomLinies: ['LOOKING FOR', 'MY DARCY'] },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-red-solid', name: 'LOOKING FOR MY DARCY', nomLinies: ['LOOKING FOR', 'MY DARCY'] },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-red-yellow-frame', name: 'LOOKING FOR MY DARCY', nomLinies: ['LOOKING FOR', 'MY DARCY'] },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-yellow-blue-frame', name: 'LOOKING FOR MY DARCY', nomLinies: ['LOOKING FOR', 'MY DARCY'] },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-yellow-pink-frame', name: 'LOOKING FOR MY DARCY', nomLinies: ['LOOKING FOR', 'MY DARCY'] },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-yellow-solid', name: 'LOOKING FOR MY DARCY', nomLinies: ['LOOKING FOR', 'MY DARCY'] },
];

/**
 * La configuracio de cada colleccio. Els camps que no hi son prenen el valor
 * generic del component.
 *
 * - `logoStyle`: la First Contact fa servir l'amplada en `em` i un `translateY`
 *   amb `calc()`; les altres, alcada en `em` i un desplaçament pla.
 * - `colorStrategy`: `'graella'` (4x4 per fila i columna) o `'plana'`
 *   (`idx % length` sobre la llista plana). Fa resultats diferents.
 * - `gridRows` / `gridAspect`: quantes files te la pauta gran i la seva
 *   proporcio. Austen en te mes perque te mes productes.
 * - `filesDeFitxes`: quantes files de fitxes pinta la graella. NO es dedueix
 *   del nombre de productes (Cube en te 10 i en pintava 16, repetint-los): es
 *   el que tenia cada pagina, i canviar-lo trauria o afegiria fitxes.
 * - `copy`: el numero de copia de la pagina. Determina les claus d'estat.
 */
const CONFIGURACIONS = {
  'cube': {
    filesDeFitxes: 4,
    slug: 'cube',
    nom: 'CUBE',
    nomMenu: 'Cube',
    collectionIcon: '/custom_logos/collections/collection-cube-logo.svg',
    seoTitle: 'Cube · Constructor | Higgins Gràfic',
    seoDescription: 'Plantilla de construcció de col·lecció amb header global, pauta de 4 columnes i footers globals.',
    products: CUBE_PRODUCTS,
    colors: TDP_GRID_COLORS,
    posterLines: [{ text: 'CADA' }, { text: 'DIBUIX TÉ' }, { text: 'UNA MIRADA' }],
    copy: 5,
  },
  'first-contact': {
    filesDeFitxes: 4,
    slug: 'first-contact',
    nom: 'FIRST CONTACT',
    nomMenu: 'First Contact',
    collectionIcon: '/custom_logos/collections/collection-first-contact-logo.webp',
    seoTitle: 'FIRST CONTACT',
    seoDescription: 'Plantilla de construcció de col·lecció amb header global, pauta de 4 columnes i footers globals.',
    products: FIRST_CONTACT_PRODUCTS,
    colors: TDP_GRID_COLORS,
    posterLines: [{ text: 'CADA' }, { text: 'PERSONA TÉ' }, { text: 'UNA HISTÒRIA' }],
    copy: 2,
    // La First Contact tenia el logo amb amplada en `em` i el desplaçament
    // amb `calc()`; les altres, alcada en `em` i desplaçament pla.
    logoStyle: {
      width: '0.718em',
      height: 'auto',
      objectFit: 'contain',
      display: 'inline-block',
      flexShrink: 0,
      transform: 'translateY(calc(0.152em + 5px))',
    },
  },
  'miscellania': {
    filesDeFitxes: 4,
    slug: 'miscellania',
    nom: 'MISCEL·LÀNIA',
    nomMenu: 'Miscel·lània',
    collectionIcon: '/custom_logos/collections/collection-miscellania-logo.svg',
    seoTitle: 'Miscel·lània · Constructor | Higgins Gràfic',
    seoDescription: 'Plantilla de construcció de col·lecció amb header global, pauta de 4 columnes i footers globals.',
    products: MISCELLANIA_PRODUCTS,
    colors: TDP_GRID_COLORS,
    posterLines: [{ text: 'MÉS VAL SOL' }, { text: 'QUE MAL' }, { text: 'ACOMPANYAT' }],
    copy: 6,
  },
  'the-human-inside': {
    filesDeFitxes: 4,
    slug: 'the-human-inside',
    nom: 'THE HUMAN INSIDE',
    nomMenu: 'The Human Inside',
    collectionIcon: '/custom_logos/collections/collection-thin-logo.svg',
    seoTitle: 'The Human Inside · Constructor | Higgins Gràfic',
    seoDescription: 'Plantilla de construcció de col·lecció amb header global, pauta de 4 columnes i footers globals.',
    products: THE_HUMAN_INSIDE_PRODUCTS,
    colors: TDP_GRID_COLORS_FLAT,
    posterLines: [{ text: 'CADA' }, { text: 'HISTÒRIA TÉ' }, { text: 'UN DIBUIX' }],
    copy: 3,
    // Els colors es calculen sobre la llista plana, no sobre la graella 4x4.
    colorStrategy: 'plana',
  },
  'austen': {
    filesDeFitxes: 7,
    slug: 'austen',
    nom: 'AUSTEN',
    nomMenu: 'Austen',
    collectionIcon: '/custom_logos/collections/collection-jean-austen-logo.svg',
    seoTitle: 'Austen · Constructor | Higgins Gràfic',
    seoDescription: 'Plantilla de construcció de col·lecció amb header global, pauta de 4 columnes i footers globals.',
    products: AUSTEN_PRODUCTS,
    colors: CANON_COLORS,
    // Els colors surten de la seva llista plana de 14, no de la graella 4x4:
    // amb la graella, la 5a fila de fitxes quedava sense color i no es pintava
    // (16 fitxes en comptes de 28).
    colorStrategy: 'plana',
    posterLines: [{ text: 'CADA' }, { text: 'DIBUIX TÉ' }, { text: 'UNA MIRADA' }],
    copy: 4,
    gridRows: 150,
    gridAspect: { tablet: 16195, escriptori: 11180 },
    // Un producte per cel·la, amb el seu propi prefix de col·leccio (el fan
    // servir els mockups i el `finish`), i la darrera fila es completa
    // repetint productes des del principi.
    perProductCollection: true,
  },
};

/**
 * Configuracio d'una colleccio pel seu slug.
 * Llança si no existeix: es una errada de programacio, no un cas a cobrir.
 */
export function getCollectionVerticalConfig(slug) {
  const config = CONFIGURACIONS[slug];
  if (!config) throw new Error(`Colleccio desconeguda: ${slug}`);
  return config;
}
