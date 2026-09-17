import React, { useLayoutEffect, useRef, useState } from 'react';
import { CERCADOR_COLLECTIONS, CERCADOR_COLORS } from './CercadorTopBar.jsx';

/**
 * CercadorTextRow
 * -----------------------------------------------------------------------------
 * Fila central de text del cercador (pàgina 2 del megaslide). Són 8 columnes
 * de dissenys, agrupades per col·lecció. Cada grup mostra una línia connectora
 * vertical a l'esquerra; el primer grup d'una llista nova porta un bullet amb
 * un stub horitzontal, mentre que les continuacions d'una llista (col3 g1 i
 * col5) només tenen la línia.
 *
 * Mètriques calibrades del mockup fons-cercador.webp (amplada 4512px = 100cqw,
 * factor px -> cqw = 1/45.12). Text Roboto Condensed 10,5pt Light.
 */

// Posició x del connector de cada columna (cqw), mesurada al mockup.
const COL_X_ORIG = [0, 11.5632, 22.8659, 35.5921, 47.9655, 62.0658, 79.6462, 91.4758];
const COL_X = (() => {
  const first = COL_X_ORIG[7] * 0.12; // col 1 fixada
  const last = COL_X_ORIG[7];         // col 8 fixada
  const span = last - first;
  const split = 0.425; // cols 1-5 ocupen 42.5%, cols 5-8 ocupen 57.5%
  const step1 = (span * split) / 4;   // gap entre cols 1-5
  const step2 = (span * (1 - split)) / 3; // gap entre cols 5-8
  return [
    first,
    first + step1,
    first + step1 * 2,
    first + step1 * 3,
    first + step1 * 4,
    first + step1 * 4 + step2,
    first + step1 * 4 + step2 * 2,
    last,
  ];
})();

// Offsets manuals en px per a ajust fi de cada columna.
const COL_PX_OFFSET = [0, 3, 22, 37, 70, 22, 49, 0];

const TOP_CQW = 4.2;        // top de la primera línia
const LINE_H = 1.064;       // interlineat (48px)
const FONT = 0.871;         // 10,5pt
const GROUP_GAP = 1.064;    // separació entre grups (1 línia buida)
const LINE_THICK = 0.0665;  // gruix línia connectora (3px)
const BULLET_D = 0.288;     // diàmetre bullet (13px)
const BULLET_CX = 0.40;     // centre x del bullet des del connector (18px)
const TEXT_X = 0.886;       // inici del text des del connector (40px)
const INK = '#2B2B2B';
const INK_HOVER = INK;
const INK_SELECTED = '#000000';

// ============================================================
// ESCALA DE LA GRAELLA DE DIBUIXOS
// ============================================================
// La mida base (escala 1:1) del dibuix és 50 px, que és la mida natural del
// fitxer de dibuix (la que surt a /constructor/megaslide-icons).
//
// TOTS els percentatges es calculen SOBRE aquesta base 1:1 de 50 px:
//   100% = 50 px | 55% = 27,5 px | 45% = 22,5 px | 43% = 21,5 px
// ============================================================
const DIBUIX_BASE = 50;
const DIBUIX_GAP_V_BASE = 3;

// La graella de dibuixos fa 16 columnes × 4 files.
const GRAELLA_COLUMNES = 16;
const GRAELLA_FILES = 4;
// Amplada de referència de la graella: la que ocupaven les 12 primeres
// columnes a escala 1:1 (12 × 50 + 11 × 25 = 875 px), o sigui que l'últim
// dibuix de la fila (col·lumna 16) acaba on acabava Cylon '78 (col·lumna 12) a
// escala 1:1, just abans de les columnes de color.
const GRAELLA_AMPLADA = 875;
// Marge entre l'última fila de dibuixos i el capdamunt de la franja.
const GRAELLA_MARGE_FRANJA = 2;
// A tauleta (horitzontal i vertical, que han de ser la mateixa pagina), la
// graella de dibuixos va 20 px mes a l'esquerra (les columnes de color i la
// llista es queden al seu lloc).
const GRAELLA_ESQUERRA_LANDSCAPE = 20;
// Pas vertical de la graella de colors (la columna dels cercles): 25 px de
// cercle + 8 px de separació. La graella de dibuixos fa servir el mateix pas
// perquè cada fila de dibuixos quedi alineada amb la seva fila de colors.
const GRAELLA_PAS_COLORS = 33;

// Desktop: dibuix de 30 px (60% de la base 1:1). La separació horitzontal és
// la que fa que les 16 columnes continuïn ocupant els 875 px de referència:
//   16 × 30 + 15 × 26,33 = 875 px
// Com que el dibuix és més petit, la separació entre dibuixos és més gran.
// La separació vertical no és fixa: CercadorTextRow la calcula segons l'espai
// que hi hagi fins a la franja de samarretes (DIBUIX_GAP_V és el valor de
// reserva quan encara no s'ha pogut mesurar).
const DIBUIX_PX = 30;
const DIBUIX_GAP_H = (GRAELLA_AMPLADA - GRAELLA_COLUMNES * DIBUIX_PX) / (GRAELLA_COLUMNES - 1);
const DIBUIX_GAP_V = DIBUIX_GAP_V_BASE * (DIBUIX_PX / DIBUIX_BASE);
// Tauleta (horitzontal i vertical, de moment iguals): 40% de la base 1:1.
const ESCALA_TAULETA = 0.98; // 2% mes petit (ho demana el disseny)
const DIBUIX_PX_LANDSCAPE = DIBUIX_BASE * 0.40 * ESCALA_TAULETA;
const DIBUIX_PX_PORTRAIT = DIBUIX_BASE * 0.40 * ESCALA_TAULETA;
// Tauleta horitzontal: la separacio horitzontal va un 10% mes estreta que la
// base de 20 px, perque la graella no arribi tan endins de la columna de color.
const DIBUIX_GAP_H_LANDSCAPE = 18 * ESCALA_TAULETA;
const DIBUIX_GAP_H_PORTRAIT = DIBUIX_GAP_H_LANDSCAPE; // 18: el vertical es la mateixa pagina

/** La mida de dibuix que toca per a aquesta pantalla. */
function midaDibuix(isPortraitTablet, isLandscapeTablet) {
  if (isPortraitTablet) return DIBUIX_PX_PORTRAIT;
  if (isLandscapeTablet) return DIBUIX_PX_LANDSCAPE;
  return DIBUIX_PX;
}

/** La separació horitzontal que toca per a aquesta pantalla. */
function gapHorizontal(isPortraitTablet, isLandscapeTablet) {
  if (isPortraitTablet) return DIBUIX_GAP_H_PORTRAIT;
  if (isLandscapeTablet) return DIBUIX_GAP_H_LANDSCAPE;
  return DIBUIX_GAP_H;
}

/** Pas vertical de la graella de colors (cercle + separació), per pantalla. */
// És el que ha de fer la graella de dibuixos perquè cada fila caigui a
// l'alçada de la seva fila de cercles: 20 px a vertical (16 + 4), 25 a
// horitzontal (19 + 6) i 33 a desktop (25 + 8).
/** Diametre del cercle de color. */
function colorMida(isPortraitTablet, isLandscapeTablet) {
  // Tauleta vertical i horitzontal: la mateixa mesura, perque son la mateixa
  // pagina; el vertical nomes s'hi desplaca.
  if (isPortraitTablet || isLandscapeTablet) return 19 * ESCALA_TAULETA;
  return 25;
}

/** Separacio entre cercles de color. */
function colorGap(isPortraitTablet, isLandscapeTablet) {
  if (isPortraitTablet || isLandscapeTablet) return 6 * ESCALA_TAULETA;
  return 8;
}

/** Pas vertical de la graella de colors (cercle + separacio). */
function colorPas(isPortraitTablet, isLandscapeTablet) {
  return colorMida(isPortraitTablet, isLandscapeTablet) + colorGap(isPortraitTablet, isLandscapeTablet);
}

/** La separació vertical que toca per a aquesta pantalla. */
function gapVertical(isPortraitTablet, isLandscapeTablet) {
  // A les tauletes, les files de dibuixos s'alineen amb les files de la graella
  // de colors: el pas vertical és el de la graella de colors (cercle més
  // separació) menys la mida del dibuix, de manera que cada fila de dibuixos
  // cau exactament a l'alçada de la seva fila de cercles. A desktop aquest pas
  // el calcula el calibratge dins del component (que pot reduir la graella).
  if (isPortraitTablet || isLandscapeTablet) {
    return Math.max(0, colorPas(isPortraitTablet, isLandscapeTablet) - midaDibuix(isPortraitTablet, isLandscapeTablet));
  }
  return DIBUIX_GAP_V;
}

// Mapping: text label -> stripe item ID (per seleccionar el disseny a la franja)
const STRIPE_MAP = {
  // FIRST CONTACT
  'NX-01': 'NX-01',
  'NCC-1701': 'NCC-1701',
  'NCC-1701-D': 'NCC-1701-D',
  'Wormhole': 'Wormhole',
  'The Phoenix': 'The Phoenix',
  'Vulcans End': "Vulcan's End",
  'Plasma Escape': 'Plasma Escape',
  // THE HUMAN INSIDE
  'Afrodita-A': 'Afrodita',
  'C3-P0': 'C3P0',
  'Cyberman': 'Cyberman',
  "Cylon '03": 'Cylon 03',
  "Cylon '78": 'Cylon 78',
  "Iron Man '08": 'Iron Man 08',
  "Iron Man '68": 'Iron Man 68',
  'Maschinenmensch': 'Maschinenmensch',
  'Mazinger-Z': 'Mazinger',
  'R2-D2': 'R2-D2',
  'Robbie The Robot': 'Robbie the Robot',
  'Robocop': 'Robocop',
  'Terminator': 'Terminator',
  'The Dalek': 'The Dalek',
  'Vader': 'Vader',
  // AUSTEN - Pemberley
  'Pemberley House': '/custom_logos/drawings/images_grid/austen/pemberley_house/pemberley-house-b-grid.webp',
  // AUSTEN - Keep Calm
  'Keep Calm': '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-b-grid.webp',
  // AUSTEN - Quotes
  'Allow Me To Tell You': '/custom_logos/drawings/images_grid/austen/quotes/you-must-allow-me-b-grid.webp',
  'Body And Soul': '/custom_logos/drawings/images_grid/austen/quotes/body-and-soul-b-grid.webp',
  'Half Agony Half Hope': '/custom_logos/drawings/images_grid/austen/quotes/half-agony-half-hope-b-grid.webp',
  'I Prefer To Be': '/custom_logos/drawings/images_grid/austen/quotes/unsociable-and-taciturn-b-grid.webp',
  'It Is A Truth': '/custom_logos/drawings/images_grid/austen/quotes/it-is-a-truth-b-grid.webp',
  // AUSTEN - Persuasion
  'Persuasion 1': '/custom_logos/drawings/images_grid/austen/crosswords/persuasion-1-grid.webp',
  'Persuasion 2': '/custom_logos/drawings/images_grid/austen/crosswords/persuasion-2-grid.webp',
  'Persuasion 3': '/custom_logos/drawings/images_grid/austen/crosswords/persuasion-3-grid.webp',
  'Persuasion 4': '/custom_logos/drawings/images_grid/austen/crosswords/persuasion-4-grid.webp',
  // AUSTEN - Pride And Prejudice
  'Pride And Prejudice 1': '/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-1-grid.webp',
  'Pride And Prejudice 2': '/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-2-grid.webp',
  'Pride And Prejudice 3': '/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-3-grid.webp',
  'Pride And Prejudice 4': '/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-4-grid.webp',
  // AUSTEN - Sense And Sensibility
  'Sense And Sensibility 1': '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-1-grid.webp',
  'Sense And Sensibility 2': '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-2-grid.webp',
  'Sense And Sensibility 3': '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-3-grid.webp',
  'Sense And Sensibility 4': '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-4-grid.webp',
  // AUSTEN - Looking For My Darcy
  'Looking For My Darcy Blue Solid': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/blue-solid-grid.webp',
  'Looking For My Darcy Fuchsia Solid': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/fuchsia-solid-grid.webp',
  'Looking For My Darcy Red Solid': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/red-solid-grid.webp',
  'Looking For My Darcy Yellow Solid': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/yellow-solid-grid.webp',
  'Looking For My Darcy Yellow Blue Frame': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/blue-frame-grid.webp',
  'Looking For My Darcy Yellow Fuchsia Frame': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/fuchsia-frame-grid.webp',
  'Looking For My Darcy Red Yellow Frame': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/red-frame-grid.webp',
  'Looking For My Darcy Yellow Frame': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/yellow-frame-grid.webp',
  // CUBE
  'Afrodita-C': 'Afrodita C',
  '3cube-P0': 'Cube 3 P0',
  'Cyber Cube': 'Cyber Cube',
  "Cylon Cube '03": 'Cylon Cube 03',
  'Darth Cube': 'Darth Cube',
  "Iron Cube '08": 'Iron Kong',
  "Iron Cube '68": 'Iron Cube 68',
  'Maschinencube': 'MaschinenCube',
  'Mazinger-C': 'Mazinger C',
  'Robocube': 'RoboCube',
  // MISCEL·LÀNIA
  'Arthur D The Second': '/custom_logos/drawings/images_grid/miscellania/arthur-d-the-second-b-grid.webp',
  'Death staR2D2': '/custom_logos/drawings/images_grid/miscellania/death-star2d2-b-grid.webp',
  'DJ Vader': '/custom_logos/drawings/images_grid/miscellania/dj-vader-b-grid.webp',
  'Pont Del Diable': '/custom_logos/drawings/images_grid/miscellania/pont-del-diable-b-grid.webp',
  'R2D2 Quote': '/custom_logos/drawings/images_grid/miscellania/r2d2-quote-b-grid.webp',
};

/**
 * El dibuix (fitxer de graella) de cada nom, per a la graella de dibuixos.
 *
 * A la graella de dibuixos, en comptes del NOM es mostra el DIBUIX. Cada nom
 * té un fitxer a `images_grid`; aquí s'hi lliga, mantenint el mateix ordre de
 * col·leccions que la taula de noms (vegeu COLUMNS).
 *
 * Les col·leccions AUSTEN i MISCEL·LÀNIA ja tenen el camí directe a STRIPE_MAP;
 * les altres tres s'hi afegeixen aquí, amb els seus fitxers de graella.
 */
const GRID_MAP = {
  // FIRST CONTACT (carpeta black)
  'NX-01': '/custom_logos/drawings/images_grid/first_contact/black/nx-01-b-grid.webp',
  'NCC-1701': '/custom_logos/drawings/images_grid/first_contact/black/ncc-1701-b-grid.webp',
  'NCC-1701-D': '/custom_logos/drawings/images_grid/first_contact/black/ncc1701-d-b-grid.webp',
  Wormhole: '/custom_logos/drawings/images_grid/first_contact/black/wormhole-b-grid.webp',
  'The Phoenix': '/custom_logos/drawings/images_grid/first_contact/black/the-phoenix-b-grid.webp',
  'Vulcans End': '/custom_logos/drawings/images_grid/first_contact/black/vulcans-end-b-grid.webp',
  'Plasma Escape': '/custom_logos/drawings/images_grid/first_contact/black/plasma-escape-b-grid.webp',
  // THE HUMAN INSIDE
  'Afrodita-A': '/custom_logos/drawings/images_grid/the_human_inside/afrodita-a-b-grid.webp',
  'C3-P0': '/custom_logos/drawings/images_grid/the_human_inside/c3-p0-b-grid.webp',
  Cyberman: '/custom_logos/drawings/images_grid/the_human_inside/cyberman-b-grid.webp',
  "Cylon '03": '/custom_logos/drawings/images_grid/the_human_inside/cylon-03-b-grid.webp',
  "Cylon '78": '/custom_logos/drawings/images_grid/the_human_inside/cylon-78-b-grid.webp',
  "Iron Man '08": '/custom_logos/drawings/images_grid/the_human_inside/iron-man-08-b-grid.webp',
  "Iron Man '68": '/custom_logos/drawings/images_grid/the_human_inside/iron-man-68-b-grid.webp',
  Maschinenmensch: '/custom_logos/drawings/images_grid/the_human_inside/maschinenmensch-b-grid.webp',
  'Mazinger-Z': '/custom_logos/drawings/images_grid/the_human_inside/mazinger-z-b-grid.webp',
  'R2-D2': '/custom_logos/drawings/images_grid/the_human_inside/r2-d2-b-grid.webp',
  'Robbie The Robot': '/custom_logos/drawings/images_grid/the_human_inside/robby-the-robot-b-grid.webp',
  Robocop: '/custom_logos/drawings/images_grid/the_human_inside/robocop-b-grid.webp',
  Terminator: '/custom_logos/drawings/images_grid/the_human_inside/terminator-b-grid.webp',
  'The Dalek': '/custom_logos/drawings/images_grid/the_human_inside/the-dalek-b-grid.webp',
  Vader: '/custom_logos/drawings/images_grid/the_human_inside/vader-b-grid.webp',
  // CUBE
  'Afrodita-C': '/custom_logos/drawings/images_grid/cube/afrodita-c-grid.webp',
  '3cube-P0': '/custom_logos/drawings/images_grid/cube/3cube-p0-grid.webp',
  'Cyber Cube': '/custom_logos/drawings/images_grid/cube/cybercube-grid.webp',
  "Cylon Cube '03": '/custom_logos/drawings/images_grid/cube/cylon-cube-grid.webp',
  'Darth Cube': '/custom_logos/drawings/images_grid/cube/darth-cube-grid.webp',
  "Iron Cube '08": '/custom_logos/drawings/images_grid/cube/iron-kong-grid.webp',
  "Iron Cube '68": '/custom_logos/drawings/images_grid/cube/iron-cube-grid.webp',
  Maschinencube: '/custom_logos/drawings/images_grid/cube/maschinencube-grid.webp',
  'Mazinger-C': '/custom_logos/drawings/images_grid/cube/mazinger-c-grid.webp',
  Robocube: '/custom_logos/drawings/images_grid/cube/robocube-grid.webp',
  // La resta (AUSTEN i MISCEL·LÀNIA) ve del STRIPE_MAP, que ja té el camí.
};

/** El dibuix d'un nom, sigui quin sigui el fitxer on visqui. */
function dibuixDelNom(label) {
  const ruta = GRID_MAP[label] || STRIPE_MAP[label] || null;
  if (!ruta) return null;
  // Es fa servir la versió retallada (sense marge transparent), perquè el que
  // faci 50 px sigui el dibuix i no el fitxer sencer. Les originals es mantenen
  // intactes per a la resta de llocs que en depenen.
  return ruta.replace('/custom_logos/drawings/images_grid/', '/custom_logos/drawings/images_grid_trim/');
}

// 8 columnes -> grups -> ítems. bullet=true mostra bullet+stub al primer ítem.
// Cada grup té una clau de col·lecció per poder filtrar/marcar segons el botó actiu.
const COLUMNS = [
  // 1 · FIRST CONTACT
  [{ bullet: true, collection: 'first_contact', subcollection: null, items: ['NX-01', 'NCC-1701', 'NCC-1701-D', 'Wormhole', 'The Phoenix', 'Vulcans End', 'Plasma Escape'] }],
  // 2 · THE HUMAN INSIDE (personatges)
  [{ bullet: true, collection: 'the_human_inside', subcollection: null, items: ['Afrodita-A', 'C3-P0', 'Cyberman', "Cylon '03", "Cylon '78", "Iron Man '08", "Iron Man '68", 'Maschinenmensch', 'Mazinger-Z', 'R2-D2'] }],
  // 3 · THE HUMAN INSIDE (continuació) + AUSTEN (Pemberley + Keep Calm)
  [
    { bullet: false, collection: 'the_human_inside', subcollection: null, items: ['Robbie The Robot', 'Robocop', 'Terminator', 'The Dalek', 'Vader'] },
    { bullet: true, collection: 'austen', subcollection: 'pemberley', items: ['Pemberley House'] },
    { bullet: true, collection: 'austen', subcollection: 'keep_calm', items: ['Keep Calm'] },
  ],
  // 4 · AUSTEN (quotes + Persuasion)
  [
    { bullet: true, collection: 'austen', subcollection: 'quotes', items: ['Allow Me To Tell You', 'Body And Soul', 'Half Agony Half Hope', 'I Prefer To Be', 'It Is A Truth'] },
    { bullet: true, collection: 'austen', subcollection: 'crosswords', items: ['Persuasion 1', 'Persuasion 2', 'Persuasion 3', 'Persuasion 4'] },
  ],
  // 5 · AUSTEN (Pride And Prejudice + Sense And Sensibility)
  [{ bullet: false, collection: 'austen', subcollection: 'crosswords', items: ['Pride And Prejudice 1', 'Pride And Prejudice 2', 'Pride And Prejudice 3', 'Pride And Prejudice 4', 'Sense And Sensibility 1', 'Sense And Sensibility 2', 'Sense And Sensibility 3', 'Sense And Sensibility 4'] }],
  // 6 · AUSTEN (Looking For My Darcy)
  [{ bullet: true, collection: 'austen', subcollection: 'looking_for_my_darcy', items: ['Looking For My Darcy Blue Solid', 'Looking For My Darcy Fuchsia Solid', 'Looking For My Darcy Red Solid', 'Looking For My Darcy Yellow Solid', 'Looking For My Darcy Yellow Blue Frame', 'Looking For My Darcy Yellow Fuchsia Frame', 'Looking For My Darcy Red Yellow Frame', 'Looking For My Darcy Yellow Frame'] }],
  // 7 · CUBE
  [{ bullet: true, collection: 'cube', subcollection: null, items: ['Afrodita-C', '3cube-P0', 'Cyber Cube', "Cylon Cube '03", 'Darth Cube', "Iron Cube '08", "Iron Cube '68", 'Maschinencube', 'Mazinger-C', 'Robocube'] }],
  // 8 · MISCEL·LÀNIA
  [{ bullet: true, collection: 'miscellania', subcollection: null, items: ['Arthur D The Second', 'Death staR2D2', 'DJ Vader', 'Pont Del Diable', 'R2D2 Quote'] }],
];

function Group({ group, isFirst, dimmed, clickable, selectedStripeItem, hoveredStripeItem, onSelectGroup, onHoverItem, onHoverLeave }) {
  const { bullet, items, collection, subcollection } = group;
  const n = items.length;
  const firstStripeItem = STRIPE_MAP[items[0]];
  const canClick = clickable && onSelectGroup;
  const canHover = !dimmed;
  return (
    <div
      onClick={canClick ? () => onSelectGroup(collection, subcollection, firstStripeItem) : undefined}
      style={{
        position: 'relative',
        marginTop: isFirst ? 0 : `${GROUP_GAP}cqw`,
        opacity: dimmed ? 0.2 : 1,
        transition: 'opacity 0.3s ease',
        cursor: canClick ? 'pointer' : 'default',
        pointerEvents: canClick ? 'auto' : 'none',
      }}
    >
      {/* Línia connectora vertical (del centre de la 1a línia al de l'última) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: `${LINE_H / 2}cqw`,
          width: `${LINE_THICK}cqw`,
          height: `${(n - 1) * LINE_H}cqw`,
          backgroundColor: INK,
        }}
      />
      {bullet ? (
        <>
          {/* Stub horitzontal connector -> bullet */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              top: `${LINE_H / 2 - LINE_THICK / 2}cqw`,
              width: `${BULLET_CX}cqw`,
              height: `${LINE_THICK}cqw`,
              backgroundColor: INK,
            }}
          />
          {/* Bullet */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `${BULLET_CX - BULLET_D / 2}cqw`,
              top: `${LINE_H / 2 - BULLET_D / 2}cqw`,
              width: `${BULLET_D}cqw`,
              height: `${BULLET_D}cqw`,
              borderRadius: '50%',
              backgroundColor: INK,
            }}
          />
        </>
      ) : null}
      {/* Línies de text */}
      {items.map((label, i) => {
        const stripeItem = STRIPE_MAP[label];
        const isHovered = stripeItem && hoveredStripeItem && stripeItem === hoveredStripeItem;
        const hasMapping = !!stripeItem;
        return (
          <div
            key={i}
            className="font-roboto-condensed"
            onMouseEnter={hasMapping && canHover && onHoverItem ? () => onHoverItem(stripeItem, collection) : undefined}
            onMouseLeave={hasMapping && canHover && onHoverLeave ? onHoverLeave : undefined}
            style={{
              height: `${LINE_H}cqw`,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: `${TEXT_X}cqw`,
              fontSize: `${FONT}cqw`,
              fontWeight: isHovered ? 700 : 300,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              color: isHovered ? INK_HOVER : INK,
              pointerEvents: hasMapping && canHover ? 'auto' : 'none',
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

function CercadorTextRow({ activeCollection, activeSubcollection, selectedStripeItem, hoveredStripeItem, onSelectGroup, onHoverItem, onHoverLeave, compact = false, selectedColor = 'white', onSelectColor, onSelectCollection, isPortraitTablet = false, isLandscapeTablet = false, leftOffset = 0, uniformColumns = false, fontBoost = 0 }) {
  // Ajust de la graella compacta a l'espai disponible (només desktop: les
  // tauletes mantenen la mida fixa de moment). Mesurem l'amplada de la columna
  // i el capdamunt de la franja de samarretes, i guardem la mida de dibuix i
  // les separacions que fan que la graella hi càpiga.
  const graellaRef = useRef(null);
  const midesRef = useRef(null);
  const [midesGraella, setMidesGraella] = useState(null);

  useLayoutEffect(() => {
    if (!compact || isPortraitTablet || isLandscapeTablet) {
      if (midesRef.current !== null) {
        midesRef.current = null;
        setMidesGraella(null);
      }
      return undefined;
    }

    const el = graellaRef.current;
    if (!el) return undefined;

    let frame = 0;
    const aplicar = () => {
      const ample = el.clientWidth;
      const dalt = el.getBoundingClientRect().top;
      const pagina = el.closest('[data-mega-page-viewport="2"]') || document;
      const franja = pagina.querySelector('[data-stripe-visual-content="2"]');
      const sostre = franja ? franja.getBoundingClientRect().top : null;

      const base = midaDibuix(isPortraitTablet, isLandscapeTablet);
      const gapHBase = gapHorizontal(isPortraitTablet, isLandscapeTablet);
      const gapVBase = gapVertical(isPortraitTablet, isLandscapeTablet);
      const ampleBase = GRAELLA_COLUMNES * base + (GRAELLA_COLUMNES - 1) * gapHBase;

      // 1) Amplada: si la columna és més estreta que la graella de referència,
      //    reduïm tot proporcionalment.
      const factorAmple = ample > 0 && ampleBase > 0 ? Math.min(1, ample / ampleBase) : 1;
      let dibuix = base * factorAmple;
      let gapH = gapHBase * factorAmple;
      let gapV = gapVBase * factorAmple;

      // 2) Alçada: les files de dibuixos han de quedar alineades amb les files
      //    de la graella de colors (mateix pas vertical). Si amb aquest pas la
      //    graella no hi cap fins a la franja de samarretes, es redueix la
      //    separació vertical i, si encara no hi cap, el dibuix (mantenint la
      //    proporció amb la separació horitzontal).
      if (sostre != null) {
        const altDisp = sostre - dalt - GRAELLA_MARGE_FRANJA;
        if (altDisp > 0) {
          gapV = Math.max(0, GRAELLA_PAS_COLORS - dibuix);
          const altNecessaria = GRAELLA_FILES * dibuix + (GRAELLA_FILES - 1) * gapV;
          if (altNecessaria > altDisp) {
            const altDibuixos = GRAELLA_FILES * dibuix;
            if (altDibuixos > altDisp) {
              const factorAlt = altDisp / altDibuixos;
              dibuix *= factorAlt;
              gapH *= factorAlt;
              gapV = 0;
            } else {
              gapV = (altDisp - altDibuixos) / (GRAELLA_FILES - 1);
            }
          }
        }
      }

      const next = { dibuix, gapH, gapV };
      const previ = midesRef.current;
      const igual = previ
        && Math.abs(previ.dibuix - next.dibuix) < 0.01
        && Math.abs(previ.gapH - next.gapH) < 0.01
        && Math.abs(previ.gapV - next.gapV) < 0.01;
      if (!igual) {
        midesRef.current = next;
        setMidesGraella(next);
      }
    };
    const mesura = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(aplicar);
    };

    // La primera mesura és immediata (useLayoutEffect encara és abans de
    // pintar): així la graella neix ja a la mida bona i no fa cap salt.
    aplicar();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mesura) : null;
    observer?.observe(el);
    const pagina = el.closest('[data-mega-page-viewport="2"]');
    if (pagina) observer?.observe(pagina);
    window.addEventListener('resize', mesura);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', mesura);
    };
  }, [compact, isPortraitTablet, isLandscapeTablet]);

  if (compact) {
    // La graella de dibuixos és de 16 columnes × 4 files (64 dibuixos). Els
    // dibuixos s'aplanen per ordre de col·lecció i es reparteixen en files de
    // 16, de manera que la col·lecció sempre queda seguida.
    const items = COLUMNS.flatMap((groups) => groups.flatMap((group) => group.items.map((label) => ({
      label,
      collection: group.collection,
      subcollection: group.subcollection,
      stripeItem: STRIPE_MAP[label],
    }))));
    const numColumns = GRAELLA_COLUMNES;
    // Mides efectives: les mesurades perquè la graella capigui a l'espai
    // disponible (només desktop) o les base de la pantalla.
    const dibuixPx = midesGraella?.dibuix ?? midaDibuix(isPortraitTablet, isLandscapeTablet);
    const gapH = midesGraella?.gapH ?? gapHorizontal(isPortraitTablet, isLandscapeTablet);
    const gapV = midesGraella?.gapV ?? gapVertical(isPortraitTablet, isLandscapeTablet);
    // La columna de col·leccions (la de la dreta de la graella de colors)
    // reparteix les seves línies al llarg de tota l'alçada de la graella, de
    // manera que acaba exactament al mateix bottom que els dibuixos.
    const alcadaGraella = GRAELLA_FILES * dibuixPx + (GRAELLA_FILES - 1) * gapV;
    const alcadaFilaLlista = alcadaGraella / (CERCADOR_COLLECTIONS.length || 1);
    const activeKey = activeCollection === 'austen' ? `austen:${activeSubcollection || ''}` : activeCollection;

    return (
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: `calc(${isPortraitTablet ? '93px' : (isLandscapeTablet ? '93px' : '105px')} + ${leftOffset}px)`,
          right: '0px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 78px 142px',
          columnGap: '10px',
          alignItems: 'start',
          pointerEvents: 'auto',
        }}
      >
        <div ref={graellaRef} style={{ display: 'grid', gridTemplateColumns: `repeat(${numColumns}, ${dibuixPx}px)`, gap: `${gapV}px ${gapH}px`, width: '100%', minWidth: 0, marginLeft: (isLandscapeTablet || isPortraitTablet) ? -GRAELLA_ESQUERRA_LANDSCAPE : 0 }}>
          {items.map(({ label, collection, subcollection, stripeItem }) => {
            const dimmed = activeCollection && collection !== activeCollection
              ? true
              : activeCollection === 'austen' && collection === 'austen' && activeSubcollection && subcollection !== activeSubcollection;
            const dibuix = dibuixDelNom(label);
            return (
              <button
                key={label}
                type="button"
                title={label}
                aria-label={label}
                onClick={() => onSelectGroup?.(collection, subcollection, stripeItem)}
                onMouseEnter={() => stripeItem && onHoverItem?.(stripeItem, collection)}
                onMouseLeave={onHoverLeave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: `${dibuixPx}px`,
                  height: `${dibuixPx}px`,
                  padding: 0,
                  border: 0,
                  background: 'transparent',
                  opacity: dimmed ? 0.24 : 1,
                  cursor: 'pointer',
                }}
              >
                {dibuix ? (
                  <img
                    src={dibuix}
                    alt={label}
                    loading="lazy"
                    style={{
                      height: `${dibuixPx}px`,
                      width: `${dibuixPx}px`,
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                ) : (
                  <span style={{ color: '#2B2B2B', fontSize: `${((isPortraitTablet || isLandscapeTablet) ? 8 : 11) + fontBoost}px`, whiteSpace: 'nowrap' }}>
                    {label.replace(/^Looking For My Darcy/, 'LFMD')}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div data-p2-color-grid style={{ display: 'grid', gridTemplateColumns: `repeat(4, ${colorMida(isPortraitTablet, isLandscapeTablet)}px)`, gridAutoRows: `${colorMida(isPortraitTablet, isLandscapeTablet)}px`, gap: `${colorGap(isPortraitTablet, isLandscapeTablet)}px`, transform: uniformColumns ? 'translateX(85px)' : ((isLandscapeTablet || isPortraitTablet) ? 'translateX(20px)' : ((typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth <= 1366 && window.innerWidth >= window.innerHeight) ? 'translateX(10px)' : 'translateX(-10px)')), marginTop: uniformColumns ? '5px' : undefined }}>
          {CERCADOR_COLORS.map(({ slug, hex }) => {
            const selected = slug === selectedColor;
            return (
              <button
                key={slug}
                type="button"
                aria-label={slug}
                onClick={() => onSelectColor?.(slug)}
                style={{
                  width: `${colorMida(isPortraitTablet, isLandscapeTablet)}px`,
                  height: `${colorMida(isPortraitTablet, isLandscapeTablet)}px`,
                  padding: 0,
                  borderRadius: '50%',
                  border: selected ? '0.5px solid rgba(0,0,0,0.22)' : '0.5px solid rgba(0,0,0,0.22)',
                  outline: selected ? '2px solid #111827' : 'none',
                  outlineOffset: '3px',
                  backgroundColor: hex,
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              />
            );
          })}
          <div
            style={{
              gridColumn: 'span 2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: isPortraitTablet ? '18px' : (isLandscapeTablet ? '21px' : '28px'),
              padding: isPortraitTablet ? '0 5px' : (isLandscapeTablet ? '0 6px' : '0 8px'),
              borderRadius: isPortraitTablet ? '9px' : (isLandscapeTablet ? '10.5px' : '14px'),
              backgroundColor: '#FFFFFF',
              border: '0.5px solid rgba(0,0,0,0.22)',
              boxSizing: 'border-box',
            }}
          >
            <span
              className="font-oswald"
              style={{
                fontWeight: 700,
                fontSize: (isPortraitTablet || isLandscapeTablet) ? '8px' : '11px',
                lineHeight: 1,
                letterSpacing: '0.04em',
                color: '#2B2B2B',
                whiteSpace: 'nowrap',
              }}
            >
              COLOR
            </span>
          </div>
        </div>

        {/* La columna s'ajusta al nom mes llarg (fit-content): aixi el nom
            mes llarg comença on començava i els curts s'hi enrasen per la
            dreta, sense que el conjunt es desplaci. */}
        <div style={{ width: 'fit-content', transform: uniformColumns ? 'translateX(120px)' : 'translateX(45px)' }}>
          {CERCADOR_COLLECTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onSelectCollection?.(key)}
              className="font-roboto-condensed"
              style={{
                display: 'block',
                // Els botons, per defecte, s'ajusten al text: sense amplada
                // plena, l'alineacio (esquerra o dreta) no es pot veure.
                width: '100%',
                boxSizing: 'border-box',
                height: (isPortraitTablet || isLandscapeTablet) ? '11px' : `${alcadaFilaLlista}px`,
                padding: 0,
                border: 0,
                background: 'transparent',
                color: '#2B2B2B',
                fontSize: (isPortraitTablet || isLandscapeTablet) ? '8px' : '11px',
                fontWeight: key === activeKey ? 700 : 300,
                lineHeight: (isPortraitTablet || isLandscapeTablet) ? '11px' : `${alcadaFilaLlista}px`,
                textAlign: 'right',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', top: '-5px', left: '5px', bottom: 0, right: '18px', pointerEvents: 'none' }}>
      {COLUMNS.map((groups, col) => (
        <div
          key={col}
          style={{ position: 'absolute', top: `${TOP_CQW}cqw`, left: `calc(${COL_X[col]}cqw + ${COL_PX_OFFSET[col] || 0}px)` }}
        >
          {groups.map((group, gi) => {
            const isDimmed = activeCollection && group.collection !== activeCollection
              ? true
              : activeCollection === 'austen' && group.collection === 'austen' && activeSubcollection && group.subcollection !== activeSubcollection;
            // Qualsevol grup és clicable: fer clic al text d'una col·lecció
            // l'activa (recíproc amb el botó de col·lecció), encara que n'hi
            // hagi una altra d'activa.
            const isClickable = true;
            return (
              <Group
                key={gi}
                group={group}
                isFirst={gi === 0}
                dimmed={isDimmed}
                clickable={isClickable}
                selectedStripeItem={selectedStripeItem}
                hoveredStripeItem={hoveredStripeItem}
                onSelectGroup={onSelectGroup}
                onHoverItem={onHoverItem}
                onHoverLeave={onHoverLeave}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default CercadorTextRow;
