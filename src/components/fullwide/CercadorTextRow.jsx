import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CERCADOR_COLLECTIONS, CERCADOR_COLORS, etiquetaColleccio } from './CercadorTopBar.jsx';
// La geometria de la graella viu a midesGraella.js perquè també la fa servir
// el mòdul de mesura única. Aquí només es consumeix.
import {
  GRAELLA_COLUMNES, GRAELLA_ESQUERRA_LANDSCAPE,
  midaDibuix, gapHorizontal, gapVertical, colorGap,
  midesGraellaCompacta,
  MARGE_ESQUERRA_DIBUIXOS_ESCRIPTORI_PX,
} from './midesGraella.js';
import { carrilPct, carrilLane, carrilPx, readRootCssNumber } from '../../utils/layoutMetrics.js';
import { liniesDibuixos } from '../../utils/mesuraMegaslide.js';
import { GRAELLA_DIBUIXOS_ESCALA_VERTICAL } from '../../config/stripeCalibrationsVertical.js';
import { FirstContactDibuix09Buttons } from './firstContactPanels.jsx';

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
  // Els quatre marcs, amb el nom del COLOR DEL MARC (25/09/2026). Abans es
  // deien amb els dos colors i el groc al davant («Yellow Blue Frame»...), i
  // allo feia que el color principal no es llegís. El fitxer de la graella es
  // el mateix que abans.
  'Looking For My Darcy Blue Frame': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/blue-frame-grid.webp',
  'Looking For My Darcy Fuchsia Frame': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/fuchsia-frame-grid.webp',
  'Looking For My Darcy Red Frame': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/red-frame-grid.webp',
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
  //
  // L'ORDRE DE SEMPRE: els quatre solids i despres els quatre marcs
  // (25/09/2026, ho ha demanat l'amo: «Torna a deixar les imatges com estaven
  // ordenades abans»). Els noms dels marcs si que es queden amb el color sol
  // («Blue Frame»...), que es com es llegeixen be.
  [{ bullet: true, collection: 'austen', subcollection: 'looking_for_my_darcy', items: ['Looking For My Darcy Blue Solid', 'Looking For My Darcy Fuchsia Solid', 'Looking For My Darcy Red Solid', 'Looking For My Darcy Yellow Solid', 'Looking For My Darcy Blue Frame', 'Looking For My Darcy Fuchsia Frame', 'Looking For My Darcy Red Frame', 'Looking For My Darcy Yellow Frame'] }],
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
            {etiquetaColleccio(label)}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Els dibuixos de la graella 16x4, aplanats per colleccio (el MATEIX joc que fa
 * servir la pagina 2): el consumeix la taula de la vista vertical.
 */
export function dibuixosGraella16x4() {
  return COLUMNS.flatMap((groups) => groups.flatMap((group) => group.items.map((label) => ({
    label,
    collection: group.collection,
    subcollection: group.subcollection,
    stripeItem: STRIPE_MAP[label],
  }))));
}

/** La GRAELLA DE DIBUIXOS 16x4 de la pagina 2 (una casella per dibuix). */
export function CercadorDibuixosGraella({
  graellaRef = null,
  tilesPercent = null,
  items,
  dibuixPx,
  gapH,
  gapV,
  numColumns,
  carrusel = false,
  activeCollection,
  activeSubcollection,
  onSelectGroup,
  onHoverItem,
  onHoverLeave,
  /** Un pas de la tira de la franja (vegeu `MegaslidePagina2`). Si arriba, les
   *  fletxes governen els dibuixos de la FRANJA en comptes del carrusel de la
   *  graella. */
  onCarouselStep,
  isPortraitTablet = false,
  isLandscapeTablet = false,
  fontBoost = 0,
  // L'amplada de la columna del selector Blanc/Color/Negre, en unitats del
  // carril: les fletxes del carrusel fan el mateix bloc que el selector.
  midaSelector = 56,
  // El marge dret que ha de deixar el retall dels dibuixos (les fletxes i el
  // seu coixi). El calcula la filera.
  reservaDreta = 0,
}) {
  // Amb `dibuixPx` les caselles tenen mida fixa (la filera de la pagina 2);
  // sense (`dibuixPx` nul) la graella S'EXPANDEIX per omplir tota la superficie
  // del seu contenidor: les columnes i les files es reparteixen l'espai i cada
  // dibuix s'hi ajusta sencer (`object-fit: contain`).
  const omple = !(dibuixPx > 0);
  const files = Math.max(1, Math.ceil((items?.length || 0) / (numColumns || 1)));
  const costat = omple ? '100%' : `${dibuixPx}px`;

  // EL CARRUSEL DE DUES FILES INTERCALADES (24/09/2026).
  //
  // L'amo el va dibuixar: dues files de peces grans i la de baix DESPLACADA
  // MITJA PECA (com una paret de mao), amb les peces consecutives en ziga-zaga
  // (1 a dalt, 2 a baix, 3 a dalt...). Les dues files ocupen el que abans
  // ocupaven TRES files, i per aixo la peca fa 1,5 cops la d'abans.
  //
  // La tira avança MIG PAS per peca (`i * pas / 2`), i aixo es el que les
  // intercala: la fila de baix cau just al mig de dues de la de dalt. La tira
  // fa `n * pas / 2 + pas`, o sigui que es mes llarga que el carril i el
  // carrusel te sentit.
  const pas = dibuixPx > 0 ? dibuixPx + gapH : 0;
  const alcadaFila = dibuixPx > 0 ? dibuixPx + gapV : 0;
  // EL BUCLE INFINIT (24/09/2026, ho va demanar l'amo): la tira es pinta DUES
  // vegades i el desplaçament es modular sobre el periode (una volta). Quan
  // s'arriba al final, el que es veu es la segona copia, que es exactament el
  // mateix; el residu torna a començar i no es nota el salt.
  const periode = carrusel ? (items.length * pas) / 2 : 0;
  const ampleTira = carrusel ? periode * 2 + pas : 0;
  // LA FINESTRA CONTÉ LES DUES FILES SENCERES (25/09/2026).
  //
  // Mesurat: la fila de dalt comença a 75,97 i el retall a 78,33, o sigui que
  // el dibuix hi quedava tallat 2,36 px per dalt (i les imatges tenen tinta a
  // la primera fila de pixels: es perdia de debò). Amb la finestra de
  // `alcadaFila * 2` hi caben les dues files i el seu buit, i la fila de dalt
  // no hi toca la vora.
  const alcadaCarrusel = carrusel ? alcadaFila * 2 : 0;
  // Una peça per clic de fletxa (mig pas: les peces van mig pas una de l'altra).
  const unPas = pas / 2;

  // EL CARRUSEL ES MOU ARROSSEGANT, I AL DESKTOP TAMBE AMB FLETXES.
  //
  // LES BARRES DE DESPLAÇAMENT ESTAN PROHIBIDES en aquest projecte (constitucio,
  // regla 16): o sigui que el contenidor va amb `overflow: hidden` i el
  // desplac,ament el governa aquest estat. El gest es d'ARROSSEGAR (pointer
  // events, que tambe son els del dit) i, al desktop, dos botons de fletxa
  // junts en un costat; a les tauletes no hi son (ho va dir l'amo).
  const [desplac, setDesplac] = useState(0);
  const arrossegant = useRef(null);
  const haArrossegat = useRef(false);
  const ambFletxes = carrusel && !isPortraitTablet && !isLandscapeTablet;

  // EL BAIX DEL BLOC DE FLETXES, MESURAT CONTRA EL DEL SELECTOR.
  //
  // El selector es col·loca amb les seves variables (`--hg-cercador-bar-top` i
  // el coixi de 40 de la composicio) i el bloc de fletxes va penjat del retall
  // dels dibuixos. La diferencia entre els dos baixos NO es constant: el
  // selector ha arribat a sortir 5 px mes amunt segons com queda la composicio,
  // i donar-la per sabuda deixava el bloc desalineat. Es mesura i s'aplica, amb
  // el valor de la formula com a punt de partida (aixi no hi ha salt).
  const [margeBaixFletxes, setMargeBaixFletxes] = useState(null);
  useLayoutEffect(() => {
    if (!ambFletxes) return undefined;
    const el = graellaRef.current;
    if (!el) return undefined;
    const pagina = el.closest('[data-mega-page-viewport="2"]') || document;
    const calcula = () => {
      const selector = pagina.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
      if (!selector) return;
      const marge = selector.getBoundingClientRect().bottom - el.getBoundingClientRect().bottom;
      setMargeBaixFletxes((previ) => (previ !== null && Math.abs(previ - marge) < 0.5 ? previ : marge));
    };
    // LA PRIMERA PASSADA VA EN UN rAF (25/09/2026). A l'efecte de layout aquest
    // fill corre ABANS que el bucle que centra el selector amb la filera, o
    // sigui que mesurava el selector 20-42 px mes amunt i el bloc de fletxes hi
    // queia a sobre; el repas de 250 ms ho desfeia i el bloc feia un salt de
    // 20,6 px (1920), 38,7 (1512), 42 (1440) i 8 (2560) amb el panell ja
    // obrint-se. El rAF arriba abans del primer pintat pero DESPRES dels efectes
    // de layout: la mesura ja es la bona i el bloc neix a lloc.
    const frame = requestAnimationFrame(calcula);
    // La composicio acaba d'encaixar despres del primer pintat (la fila es
    // mesura sola): es torna a mirar un parell de cops.
    const t1 = window.setTimeout(calcula, 250);
    // A 400 ms i no a 900: es just despres de l'animacio d'obertura (340 ms).
    // El repas tarda corregia despres que el panell sembles fet (25/09/2026).
    const t2 = window.setTimeout(calcula, 400);
    window.addEventListener('resize', calcula);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', calcula);
    };
  }, [ambFletxes, graellaRef]);

  // LES DUES LINIES DE DIBUIXOS, CADA UNA CENTRADA AMB LA SEVA CEL·LA.
  //
  // L'amo ho va demanar el 24/09/2026: «alinea la segona línia de la graella de
  // dibuixos al centre del selector» i, quan el selector es va moure per fer-ho,
  // «mou la fila, no el selector». Després, «alinea la graella 14x1 amb el nom
  // NEGRE del selector i la primera fila de la graella de dibuixos amb el nom
  // BLANC». El selector NO es toca: la seva referencia es el centre de la filera
  // (`MegaslidePagina2`), i el que pugen son les dues linies de dibuixos, els px
  // que els falten per caure sobre BLANC (la primera) i COLOR (la segona). Les
  // tres cel·les del selector fan la mateixa alcada, i per aixo el seu centre
  // surt de dividir-lo per tres.
  //
  // Es mesura i s'acumula (com el `pageLift` de la pàgina 1): la mesura es
  // absoluta i, un cop aplicada, el que queda es el residu. L'alçada del retall
  // NO en depèn (les peces van absolutes a dins), i per això el centre de la
  // filera no es mou i el bucle no balla.
  // LES DUES LINIES DE DIBUIXOS, CADA UNA CENTRADA AMB LA SEVA CEL·LA.
  //
  // Aixo es MESURA i s'acumula: la mesura fa que les dues linies caiguin sobre
  // la cel·la BLANC (la primera) i la COLOR (la segona) del selector, i es el
  // que fa que les vistes vertical i horitzontal quadrin entre elles (ho vigila
  // `compara-vistes`). No es pot declarar amb una constant: l'alçada de cel·la
  // del selector canvia amb la vista.
  const [desnivellsLinies, setDesnivellsLinies] = useState({ primera: 0, segona: 0 });
  // EL VALOR QUE EL DOM TÉ APLICAT, NO EL QUE S'HA DECIDIT (25/09/2026).
  //
  // La ref s'actualitza DESPRÉS de pintar. Abans s'escrivia dins del mateix
  // bucle, i això feia que dues passades que mesuraven el MATEIX DOM sumessin el
  // mateix delta dues vegades: els temporitzadors de 250 i 400 ms, quan el fil
  // principal va ocupat (obertura en fred), expiren junts i el navegador els
  // executa a la mateixa tasca, o sigui que la segona passada mesura abans que
  // React hagi pintat la primera. Mesurat: 3 de 6 obertures en fred acabaven amb
  // les dues files 13,6 i 15,9 px per sota de les seves cel·les (el bucle
  // arrencava de 0,9 i hi tornava a sumar el mateix −13,6).
  //
  // Partint del que està PINTAT, dues passades amb la mateixa mesura donen el
  // mateix objectiu i la correcció és idempotent.
  const desnivellsRef = useRef({ primera: 0, segona: 0 });
  useEffect(() => {
    desnivellsRef.current = desnivellsLinies;
  }, [desnivellsLinies]);
  // LA FINESTRA TAMBE COBRA EL DESNIVELL MESURAT (25/09/2026).
  //
  // Les dues files es col·loquen MESURADES (aquest bucle les centra a les
  // cel·les BLANC i COLOR del selector) i la finestra es DECLARA
  // (`alcadaFila * 2`). Quan la fila de dalt puja (`top: -primera`), el seu
  // capdamunt queda per sobre de la vora de la finestra i el retall
  // (`overflow: hidden`) se'n menja la primera fila de pixels: mesurat a 1920, la
  // fila puja 0,89 px i els dibuixos tenen tinta al primer pixel natural, o
  // sigui que es tallava tinta de debò.
  //
  // El que es fa es pujar la CAIXA del retall el que la fila s'ha enfilat i
  // baixar-ne el contingut el mateix (el marge de la tira): les peces no es mouen
  // gens, nome's la vora de dalt de la finestra.
  //
  // I s'hi afegeix la TOLERANCIA DEL BUCLE (0,5 px, la que el fa parar): el bucle
  // pot deixar la fila mig pixel mes amunt del seu punt fix, i amb la vora a ras
  // (`0,00 px`) un arrodoniment de pixel de pantalla encara podria pelar-ne un.
  const sobreixDalt = carrusel ? Math.max(0, desnivellsLinies.primera) + 0.5 : 0;
  useLayoutEffect(() => {
    if (!carrusel) return undefined;
    const el = graellaRef.current;
    if (!el) return undefined;
    const calcula = () => {
      const pagina = el.closest('[data-mega-page-viewport="2"]');
      const selector = pagina?.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
      const linies = liniesDibuixos(el.closest('[data-carrusel="1"]'));
      if (!selector || !linies || linies.length < 2) return;
      const s = selector.getBoundingClientRect();
      const cella = s.height / 3;
      const objectius = [s.top + cella / 2, s.top + cella * 1.5];
      const delta = [linies[0].centre - objectius[0], linies[1].centre - objectius[1]];
      if (Math.abs(delta[0]) < 0.5 && Math.abs(delta[1]) < 0.5) return;
      // L'objectiu es calcula des del valor PINTAT (`desnivellsRef`, que
      // s'actualitza despres de pintar): dues passades que mesuren el mateix DOM
      // donen el mateix objectiu, i no se suma dues vegades.
      const pintat = desnivellsRef.current;
      setDesnivellsLinies({
        primera: pintat.primera + delta[0],
        segona: pintat.segona + delta[1],
      });
    };
    // LA PRIMERA PASSADA VA EN UN rAF, NO A L'EFECTE DE LAYOUT (25/09/2026).
    //
    // Les dues files neixen a lloc i el que les acaba de quadrar és aquesta
    // primera passada. A l'efecte de layout la mesura era falsa: aquest efecte és
    // d'un fill i corre ABANS que el bucle que centra el selector amb la filera
    // (`selectorCentratgeY`), o sigui que el selector encara era 13,6 px més amunt
    // i el bucle hi aplicava una correcció de +14,5 px que després havia de desfer
    // (i que aixecava la fila de dalt 14,5 px, amb la tinta tallada, gairebé un
    // segon en una obertura en fred). El rAF arriba abans del primer pintat però
    // DESPRÉS dels efectes de layout: el selector ja hi és centrat, la mesura és
    // la bona, i el bucle neix quadrat sense cap salt als 250 ms.
    const frame = requestAnimationFrame(calcula);
    const t1 = window.setTimeout(calcula, 250);
    const t2 = window.setTimeout(calcula, 400);
    window.addEventListener('resize', calcula);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', calcula);
    };
  }, [carrusel, graellaRef]);

  // El desplaçament efectiu es el residu dins una volta: aixi la tira pot
  // avançar (o retrocedir) sense fi i sempre cau dins de les dues copies.
  const desplacEf = periode > 0 ? ((desplac % periode) + periode) % periode : 0;
  const caixaCarrusel = () => graellaRef?.current || null;

  // LA RODETA DEL RATOLI (24/09/2026, ho va demanar l'amo): scroll lliure. Va
  // amb `passive: false` perque ha de poder aturar el desplaçament vertical de
  // la pagina quan el punter es a sobre la tira.
  useLayoutEffect(() => {
    if (!carrusel) return undefined;
    const el = caixaCarrusel();
    if (!el) return undefined;
    const rodeta = (e) => {
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      setDesplac((v) => v + d);
    };
    el.addEventListener('wheel', rodeta, { passive: false });
    return () => el.removeEventListener('wheel', rodeta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrusel]);

  // LA COLLECCIO CLICADA, CENTRADA A LA FINESTRA (24/09/2026, ho va demanar
  // l'amo): tant si es clica un enllac de la columna de colleccions com una
  // icona atenuada d'una altra colleccio, el grup de dibuixos d'aquella
  // colleccio ha de quedar al mig de la finestra de la graella.
  //
  // I TAMBE QUAN LA GRAELLA ES MONTA (25/09/2026). Abans hi havia un guarda que
  // no deixava centrar al primer pintat («la graella arrenca on arrenca»), i amb
  // allo la graella i la franja no deien el mateix: el megaslide es remunta en
  // navegar (mesurat: `desmuntat` i `muntat/actiu` al mateix instant), i en
  // tornar la graella començava a la casa 0 mentre la franja ja anava centrada.
  // Mesurat a FIRST CONTACT: el grup actiu era a les peces 0..6 i la finestra
  // (455,6..1309,2) mirava un dibuix atenuat de THE HUMAN INSIDE.
  //
  // L'amo ho va demanar exactament aixi: «centrar la colleccio a la graella i a
  // la franja alhora». Per aixo el centratge va amb la clau de la colleccio i
  // tambe amb el muntatge, i mai amb un desplaçament manual.
  const clauColleccioRef = useRef(undefined);
  useLayoutEffect(() => {
    if (!carrusel || periode <= 0) return;
    const clau = `${activeCollection || ''}|${activeSubcollection || ''}`;
    const anterior = clauColleccioRef.current;
    clauColleccioRef.current = clau;
    if (anterior === clau) return;
    const centra = () => {
      const indexos = items
        .map((it, i) => (it.collection === activeCollection
          && (!activeSubcollection || it.subcollection === activeSubcollection) ? i : -1))
        .filter((i) => i >= 0);
      if (!indexos.length) return;
      const centre = ((indexos[0] + indexos[indexos.length - 1]) / 2) * unPas + dibuixPx / 2;
      const finestra = caixaCarrusel()?.clientWidth || 0;
      if (!finestra) return;
      const objectiu = centre - finestra / 2;
      // La volta mes curta: la mateixa posicio nome's que amb la volta que toca.
      setDesplac((v) => objectiu + Math.round((v - objectiu) / periode) * periode);
    };
    centra();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCollection, activeSubcollection, carrusel, periode, unPas, dibuixPx]);

  const onPointerDown = (e) => {
    if (!carrusel) return;
    // NO es captura el punter aqui. Capturar-lo en tocar fa que el CLIC
    // s'quedi al contenidor i la fletxa (o la peca) que hi ha sota no el rebi:
    // es va mesurar, i la fletxa no es movia. La captura comenc,a quan el gest
    // arrenca de debò, passats uns quants px.
    arrossegant.current = { x: e.clientX, inici: desplacEf, id: e.pointerId, el: e.currentTarget, capturat: false };
    haArrossegat.current = false;
  };
  const onPointerMove = (e) => {
    const a = arrossegant.current;
    if (!a) return;
    const dx = e.clientX - a.x;
    if (Math.abs(dx) > 4) {
      haArrossegat.current = true;
      if (!a.capturat) {
        try { a.el.setPointerCapture(a.id); } catch { /* ignore */ }
        a.capturat = true;
      }
    }
    setDesplac(a.inici - dx);
  };
  const onPointerUp = () => { arrossegant.current = null; };
  // Un arrossegament NO es un clic: si el dit o el ratoli s'ha mogut, la peça
  // que hi hagi sota no s'ha de triar.
  const onClickCapture = (e) => {
    if (!haArrossegat.current) return;
    haArrossegat.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const pintaItem = ({ label, collection, subcollection, stripeItem }, i) => {
    const dimmed = activeCollection && collection !== activeCollection
      ? true
      : activeCollection === 'austen' && collection === 'austen' && activeSubcollection && subcollection !== activeSubcollection;
    const dibuix = dibuixDelNom(label);
    // A la vista vertical, alguns dibuixos es pinten mes grans o mes petits
    // dins la seva casella (GRAELLA_DIBUIXOS_ESCALA_VERTICAL).
    const factorGraella = isPortraitTablet ? (GRAELLA_DIBUIXOS_ESCALA_VERTICAL[label] ?? 1) : 1;
    return (
      <button
        // La tira es pinta dues vegades (bucle infinit): la clau ha de ser
        // unica, i l'index ho es.
        key={`${i}-${label}`}
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
          width: costat,
          height: costat,
          // Al carrusel cada peca es col·loca a mà: mig pas a la dreta de
          // l'anterior i, les senars, una fila mes avall. Cada fila puja el que
          // li falta per caure sobre la seva cel·la del selector (BLANC la
          // primera, COLOR la segona), que es el que mesura la graella.
          ...(carrusel ? {
            position: 'absolute',
            left: `${(i * pas) / 2}px`,
            top: `${(i % 2) ? alcadaFila - desnivellsLinies.segona : -desnivellsLinies.primera}px`,
          } : null),
          // Amb `tilesPercent` la tile s'encongeix dins la seva casella
          // (el centre no es mou).
          ...(tilesPercent && omple
            ? { width: `${tilesPercent}%`, height: `${tilesPercent}%`, justifySelf: 'center', alignSelf: 'center' }
            : null),
          minWidth: 0,
          minHeight: 0,
          padding: 0,
          border: 0,
          background: 'transparent',
          // ELS DIBUIXOS QUE NO SON DE LA COLLECCIO ACTIVA (25/09/2026). Aqui hi
          // havia 0,24; ho va demanar l'amo: «I a la graella de dibuixos, també,
          // més atenuats.» Ara es 0,12, el mateix que la franja.
          opacity: dimmed ? 0.12 : 1,
          cursor: 'pointer',
        }}
      >
        {dibuix ? (
          <img
            src={dibuix}
            alt={label}
            loading="lazy"
            style={{
              // En manera d'omplir, el dibuix va un 20% mes petit que la
              // seva casella (la retícula queda igual), amb el factor propi
              // del dibuix si en te.
              height: omple ? `${80 * factorGraella}%` : costat,
              width: omple ? `${80 * factorGraella}%` : costat,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        ) : (
          <span style={{ color: '#2B2B2B', fontSize: (isPortraitTablet || isLandscapeTablet) ? `max(12px, ${8 + fontBoost}px)` : `max(12px, ${carrilPx(11 + fontBoost)})`, whiteSpace: 'nowrap' }}>
            {label.replace(/^Looking For My Darcy/, 'LFMD')}
          </span>
        )}
      </button>
    );
  };

  if (carrusel) {
    // ELS DIBUIXOS, ENTRE EL SELECTOR I LES FLETXES (24/09/2026).
    //
    // El carrusel tenia UNA caixa (`overflow: hidden`) amb les fletxes a dins,
    // a la dreta: els dibuixos hi passaven per sota i la seva amplada era la de
    // tota la columna. Ara hi ha dues capes: el retall dels dibuixos (amb
    // `ref`, que es qui es mesura per ajustar-los) i, a fora, la botonera, que
    // queda a la dreta del retall. El retall deixa l'ample de les fletxes mes
    // 10 px, o sigui que la graella viu exactament entre el selector i les
    // fletxes.
    return (
      <div
        data-carrusel="1"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        style={{
          position: 'relative',
          width: '100%',
          height: `${alcadaCarrusel}px`,
          minWidth: 0,
        }}
      >
        <div
          ref={graellaRef}
          style={{
            // LA CAIXA DEL RETALL, FORA DEL FLUX (25/09/2026).
            //
            // La finestra s'ha de poder pujar el que la fila de dalt s'enfila
            // (`sobreixDalt`) sense que es mogui res mes. Amb marges no es pot
            // fer: el marge de dalt del fill es col·lapsa amb el del pare i el
            // que acaba movent-se es la fila (mesurat: les peces baixaven 13 px
            // i la fila de baix quedava tallada). Fora del flux, en canvi, la
            // caixa del retall no participa en cap layout: el contenidor segueix
            // fent `alcadaCarrusel` d'alçada (i la filera del grid no es mou), i
            // aqui nome's puja la vora que retalla.
            position: 'absolute',
            top: sobreixDalt ? -sobreixDalt : 0,
            left: 0,
            right: 0,
            // `width: auto` (i no `100%`) perque el coixi de la dreta descompti
            // de l'amplada: amb `100%` la caixa es quedava sencera i el retall
            // no servia de res.
            width: 'auto',
            height: sobreixDalt ? `calc(100% + ${sobreixDalt}px)` : '100%',
            marginRight: reservaDreta,
            // SENSE BARRA DE DESPLAÇAMENT: el moviment el fa el gest (i les
            // fletxes al desktop). `pan-y` deixa el desplac,ament vertical de la
            // pagina al navegador i es queda l'horitzontal per al carrusel.
            overflow: 'hidden',
            touchAction: 'pan-y',
            cursor: 'grab',
            userSelect: 'none',
            minWidth: 0,
          }}
        >
          <div style={{
            position: 'relative',
            width: `${ampleTira}px`,
            height: '100%',
            // El contingut torna a baixar el que la caixa del retall ha pujat:
            // les peces queden exactament on eren.
            marginTop: sobreixDalt,
            transform: `translateX(${-desplacEf}px)`,
            willChange: 'transform',
          }}>
            {[...items, ...items].map(pintaItem)}
          </div>
        </div>
        {ambFletxes ? (
          // EL BLOC DE FLETXES, DE LA MIDA DEL SELECTOR (24/09/2026). El
          // selector Blanc/Color/Negre va neixer quadrat i el vam deixar a la
          // meitat: `carrilPx(midaSelector / 2)` d'amplada i
          // `carrilPx(midaSelector)` d'alçada (es `w-1/2` amb `aspect-[1/2]`).
          // El bloc de les dues fletxes fa exactament aixo, amb una fletxa a
          // dalt i l'altra a baix.
          // I EL SEU BAIX, AMB EL DEL SELECTOR (24/09/2026). El selector va a
          // `carrilLane(40)` per sota del final de la filera (es el coixi de 40
          // de la composicio, el mateix que porta el seu `top`): mesurat a
          // 1440, 1920 i 2560, la diferencia entre els dos baixos es
          // exactament aixo. Com que el bloc i el selector fan la mateixa
          // alcada, alinear-ne els baixos es alinear-ne els tops.
          <div style={{
            position: 'absolute',
            right: 0,
            bottom: margeBaixFletxes === null ? `calc(-1 * ${carrilLane(40)})` : `${-margeBaixFletxes}px`,
            // LA BOTONERA DE LES FLETXES: DUES FLETXES I L'ALCADA DEL SELECTOR
            // (24/09/2026, ho va demanar l'amo). Dues meitats (una fletxa a
            // dalt i l'altra a baix) i el bloc de la mida del selector, amb el
            // bottom quadrat amb el seu.
            width: carrilPx(midaSelector / 2),
            height: carrilPx(midaSelector),
            zIndex: 5,
          }}>
            <FirstContactDibuix09Buttons
              vertical
              onPrev={() => (onCarouselStep ? onCarouselStep(-1) : setDesplac((v) => v - unPas))}
              onNext={() => (onCarouselStep ? onCarouselStep(1) : setDesplac((v) => v + unPas))}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={graellaRef} style={{
      display: 'grid',
      gridTemplateColumns: omple ? `repeat(${numColumns}, 1fr)` : `repeat(${numColumns}, ${dibuixPx}px)`,
      gridTemplateRows: omple ? `repeat(${files}, 1fr)` : undefined,
      gap: `${gapV}px ${gapH}px`,
      width: '100%',
      height: omple ? '100%' : undefined,
      minWidth: 0,
    }}>
      {items.map(pintaItem)}
    </div>
  );
}

/**
 * La GRAELLA DE COLORS (14x1) de la pagina 2.
 *
 * ELS CERCLES SON RECTANGLES DE 7x2 (24/09/2026, ho va demanar l'amo): catorze
 * barres de 7 d'ample per 2 d'alcada que ocupen el MATEIX espai que la graella
 * de dibuixos, o sigui el retall del carrusel (`reservaDreta` es el marge que
 * deixa a la dreta el coixi de les fletxes, el mateix que fa servir el retall).
 * Cap mida no s'escriu a ma: el nombre de barres surt de la llista
 * (`CERCADOR_COLORS`), l'amplada de cada barra del contenidor (les catorze
 * columnes se'l reparteixen amb `1fr`) i l'alcada de la proporcio
 * (`aspect-ratio`). A 1920 cada barra fa 53,6 x 15,3 px.
 *
 * L'INDICADOR (l'anell de la mostra triada) es un `outline` amb 3 px de
 * desplacament, com abans.
 */
export function CercadorColorsGrid({
  selectedColor,
  onSelectColor,
  colorGapPx,
  transform,
  marginTop,
  reservaDreta = 0,
}) {
  // EL SELECTOR DE LA TIRA DE COLORS S'ARROSSEGA (24/09/2026, ho va demanar
  // l'amo): passar per sobre les barres, amb el dit o amb el ratoli, tria la
  // que hi ha sota. La tira no porta barra de desplac,ament (constitucio, regla
  // 16): el gest son pointer events, com al carrusel.
  const arrossegant = useRef(false);
  const gridRef = useRef(null);
  // LA RODETA SOBRE LA TIRA (24/09/2026, ho va demanar l'amo): mou la tria una
  // barra endavant o enrere, com el carrusel de dibuixos. Amb `passive: false`
  // perque tambe ha d'aturar el desplac,ament vertical de la pagina.
  //
  // EL SENTIT ES L'INVERS DEL CARRUSEL (24/09/2026, ho va demanar l'amo): rodeta
  // avall, barra enrere. El carrusel es mou amb la rodeta en el sentit natural
  // (avall = cap al final de la tira); aqui la tira es la paleta, i girar-la cap
  // enrere es el que demana el gest.
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return undefined;
    const rodeta = (e) => {
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      const i = CERCADOR_COLORS.findIndex((c) => c.slug === selectedColor);
      const j = Math.max(0, Math.min(CERCADOR_COLORS.length - 1, (i < 0 ? 0 : i) + (d > 0 ? -1 : 1)));
      const nou = CERCADOR_COLORS[j]?.slug;
      if (nou && nou !== selectedColor) onSelectColor?.(nou);
    };
    el.addEventListener('wheel', rodeta, { passive: false });
    return () => el.removeEventListener('wheel', rodeta);
  }, [selectedColor, onSelectColor]);
  const triaAmbElDit = (e) => {
    const sota = document.elementFromPoint(e.clientX, e.clientY);
    const barra = sota && sota.closest ? sota.closest('[data-color-barra]') : null;
    const slug = barra && barra.getAttribute('data-color-barra');
    if (slug && slug !== selectedColor) onSelectColor?.(slug);
  };
  return (
    <div
      ref={gridRef}
      data-p2-color-grid
      onPointerDown={(e) => {
        arrossegant.current = true;
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        triaAmbElDit(e);
      }}
      onPointerMove={(e) => { if (arrossegant.current) triaAmbElDit(e); }}
      onPointerUp={() => { arrossegant.current = false; }}
      onPointerCancel={() => { arrossegant.current = false; }}
      style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${CERCADOR_COLORS.length}, 1fr)`,
      alignItems: 'start',
      gap: `${colorGapPx}px`,
      // `width: auto` (i no `100%`) perque el coixi de la dreta descompti de
      // l'amplada: amb `100%` la linia es quedava sencera i la vora dreta no
      // encaixava amb la del retall dels dibuixos (es el mateix motiu que al
      // retall del carrusel).
      marginRight: reservaDreta || 0,
      transform,
      marginTop,
    }}>
      {CERCADOR_COLORS.map(({ slug, hex }) => {
        const selected = slug === selectedColor;
        return (
          <button
            key={slug}
            type="button"
            aria-label={slug}
            data-color-barra={slug}
            onClick={() => onSelectColor?.(slug)}
            style={{
              width: '100%',
              aspectRatio: '7 / 2',
              padding: 0,
              borderRadius: '1px',
              border: '0.5px solid rgba(0,0,0,0.22)',
              outline: selected ? '1px solid #111827' : 'none',
              outlineOffset: '3px',
              backgroundColor: hex,
              boxSizing: 'border-box',
              cursor: 'pointer',
            }}
          />
        );
      })}
    </div>
  );
}

/** La COLUMNA DE COLLECCIONS de la pagina 2. */
export function CercadorColleccionsColumna({
  activeKey,
  onSelect,
  paddingLeft,
  transform,
  isPortraitTablet = false,
  isLandscapeTablet = false,
  caixes = false,
  linia = false,
  // La columna va en una capa propia: no ha d'estirar la fila on viu (les nou
  // linies son mes altes que el carrusel). El seu top cau al top del selector i
  // el seu bottom al bottom de la slide (`margeDalt` i `margeBaix`, que calcula
  // la filera).
  absolut = false,
  // Els px que hi ha del top de la filera al top del selector (la columna hi
  // arrenca) i del bottom de la filera al bottom de la slide (hi acaba).
  margeDalt = 0,
  margeBaix = 0,
  // El marge dret que ha de deixar la linia per acabar on acaba la graella de
  // dibuixos (les fletxes i el seu coixi). El calcula la filera, que es qui sap
  // si hi ha fletxes.
  reservaDreta = 0,
}) {
  // Amb `caixes` (la taula de la vista vertical) cada nom va dins la seva caixa
  // grisa, enrasat a la dreta i repartides per tota l'alcada; sense, es la
  // llista de sempre de la filera de la pagina 2.
  if (caixes) {
    // Els noms de la taula: els temes d'Austen hi son amb el prefix AUSTEN/.
    const llista = [
      { key: 'first_contact', label: 'FIRST CONTACT' },
      { key: 'the_human_inside', label: 'THE HUMAN INSIDE' },
      { key: 'austen:pemberley', label: 'AUSTEN/PEMBERLEY' },
      { key: 'austen:keep_calm', label: 'AUSTEN/KEEP CALM' },
      { key: 'austen:quotes', label: 'AUSTEN/QUOTES' },
      { key: 'austen:crosswords', label: 'AUSTEN/CROSSWORDS' },
      { key: 'austen:looking_for_my_darcy', label: 'AUSTEN/LFMD' },
      { key: 'cube', label: 'CUBE' },
      { key: 'miscellania', label: 'MISCEL·LÀNIA' },
    ];
    return (
      <div
        data-colleccions-caixes="1"
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateRows: `repeat(${llista.length}, 1fr)`,
          rowGap: '3px',
          minHeight: 0,
        }}
      >
        {llista.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect?.(key)}
            className="font-roboto-condensed"
            aria-current={key === activeKey ? 'true' : undefined}
            style={{
              appearance: 'none',
              border: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: '100%',
              minHeight: 0,
              padding: '0 6px',
              borderRadius: '3px',
              // El SELECTOR es la pastilla de fons: nomes la porta la colleccio
              // activa. Cap negreta.
              backgroundColor: key === activeKey ? '#F1F3F5' : 'transparent',
              color: '#2B2B2B',
              fontFamily: 'inherit',
              fontSize: '8.5pt',
              fontWeight: 400,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
            }}
          >
            {etiquetaColleccio(label)}
          </button>
        ))}
      </div>
    );
  }
  // LA LINIA DE COLLECCIONS (24/09/2026, ho va demanar l'amo): els mateixos
  // enllacos que la columna, pero en una fila horitzontal, per anar a sota del
  // carrusel, entre el selector i la graella 4x4.
  if (linia) {
    return (
      <div
        data-colleccions-linia="1"
        style={{
          // `width: auto` (i no `100%`) perque el marge dret descompti: amb
          // `100%` la linia es quedava sencera i no acabava on acaba la graella.
          width: 'auto',
          // ELS ENLLACOS OCCUPEN EL MATEIX QUE LA GRAELLA DE DIBUIXOS
          // (24/09/2026, ho va demanar l'amo): el mateix marge dret que el
          // retall dels dibuixos (les fletxes i el seu coixi) i repartits
          // d'extrem a extrem (`space-between`), o sigui que la linia arrenca
          // on arrenca el carrusel i acaba on acaba.
          marginRight: reservaDreta || 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          // El gap es el MINIM: amb `space-between` el que sobra es reparteix
          // sol, i per aixo pugen tots. Amb `wrap` les vistes estretes (on els
          // enllacos no hi caben en una linia) no es tallen.
          // El gap MINIM: prou petit perque en cap vista forci un salt de
          // linia (a 1440 l'amplada es justa i amb un minim gran els enllacos
          // queien a sota). El que separa de debò es el `space-between`.
          columnGap: carrilLane(8),
          rowGap: '2px',
          flexWrap: 'wrap',
          minWidth: 0,
        }}
      >
        {CERCADOR_COLLECTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect?.(key)}
            className="font-roboto-condensed"
            style={{
              padding: 0,
              border: 0,
              background: 'transparent',
              color: '#2B2B2B',
              // Mes grossos que la columna (11 -> 13 unitats): omplen la
              // linia de la graella de dibuixos i es llegeixen millor. El terra
              // de 10 px es el de sempre: a les finestres estretes, on
              // l'amplada es justa, el que creix es la separacio, no la lletra.
              fontSize: (isPortraitTablet || isLandscapeTablet) ? '11px' : `max(10px, ${carrilPx(13)})`,
              fontWeight: key === activeKey ? 700 : 300,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {etiquetaColleccio(label)}
          </button>
        ))}
      </div>
    );
  }


  return (
    <div style={{
      width: '100%',
      transform,
      paddingLeft,
      // DEL TOP DEL SELECTOR AL BOTTOM DE LA SLIDE (24/09/2026, ho va demanar
      // l'amo): la llista s'estira entre les dues vores. Amb `top: 0` arrencava
      // amb el carrusel i acabava on acabava el seu contingut.
      // I ELS ENLLACOS SON TARGETES (mateix dia): una graella de nou caselles
      // iguals, amb la separacio de 3 px de la taula vertical, i cada enllac
      // dins la seva targeta.
      ...(absolut ? {
        position: 'absolute',
        left: 0,
        right: 0,
        top: -margeDalt,
        bottom: -margeBaix,
        display: 'grid',
        gridTemplateRows: `repeat(${CERCADOR_COLLECTIONS.length}, 1fr)`,
        rowGap: '3px',
      } : null),
    }}>
      {CERCADOR_COLLECTIONS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          // La marca que fa servir `scripts/compara-vistes.mjs` per mesurar la
          // columna (del top del selector al bottom de la franja).
          data-colleccions-targeta="1"
          onClick={() => onSelect?.(key)}
          className="font-roboto-condensed"
          style={{
            // LA TARGETA: la caixa grisa de la taula vertical (radi 3 i el
            // coixi de 6 px), amb el nom enrasat a la dreta i centrat a dalt i
            // a baix. El text no es pot escapar de la caixa.
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: '100%',
            minHeight: 0,
            boxSizing: 'border-box',
            padding: '0 6px',
            // EL FONS DE LA PASTILLA VA 20 px MES A LA DRETA (25/09/2026, ho va
            // demanar l'amo: «Retalla la pastilla grisa de la columna 10 px per
            // l'esquerra» i, tot seguit, «retalla 10 px més»).
            //
            // Es retalla NOME'S EL FONS: una vora esquerra transparent i
            // `background-clip: padding-box`, que fa que el color només es pinti
            // de la vora cap endins. La CAIXA no es toca, o sigui que ni el text
            // ni l'area de clic no es mouen ni s'encongeixen (amb un `marginLeft`
            // el text se n'anava i la zona de clic minvava).
            border: 0,
            borderLeft: key === activeKey ? '20px solid transparent' : 0,
            backgroundClip: key === activeKey ? 'padding-box' : undefined,
            borderRadius: '3px',
            // LA PASTILLA GRISA NOMES LA PORTA LA COLLECCIO ACTIVA
            // (25/09/2026, ho va demanar l'amo: «Treu les pastilles grises
            // excepte a la colleccio activa»). Abans la portaven totes nou, i
            // allo feia que la columna semblés una graella de caixes en comptes
            // d'una llista on se'n destaca una.
            backgroundColor: key === activeKey ? '#F1F3F5' : 'transparent',
            color: '#2B2B2B',
            overflow: 'hidden',
            fontSize: (isPortraitTablet || isLandscapeTablet) ? 'max(10px, 8px)' : `max(10px, ${carrilPx(11)})`,
            fontWeight: key === activeKey ? 700 : 300,
            lineHeight: 1.2,
            textAlign: 'right',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          {etiquetaColleccio(label)}
        </button>
      ))}
    </div>
  );
}

function CercadorTextRow({ activeCollection, activeSubcollection, selectedStripeItem, hoveredStripeItem, onSelectGroup, onHoverItem, onHoverLeave, onCarouselStep, compact = false, selectedColor = 'white', onSelectColor, onSelectCollection, isPortraitTablet = false, isLandscapeTablet = false, fontBoost = 0, desplacamentVertical = 0, esquerra, midaSelector = 56, alineacioY = 0, onMides = null }) {
  // Ajust de la graella compacta a l'espai disponible (només desktop: les
  // tauletes mantenen la mida fixa de moment). Mesurem l'amplada de la columna
  // i el capdamunt de la franja de samarretes, i guardem la mida de dibuix i
  // les separacions que fan que la graella hi càpiga.
  const graellaRef = useRef(null);
  const midesRef = useRef(null);
  const [midesGraella, setMidesGraella] = useState(null);
  // L'espai fins a la franja de la mesura anterior (vegeu `sostre`).
  const espaiAnteriorRef = useRef(null);

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
      const ampleAmple = el.clientWidth;
      const daltGraella = el.getBoundingClientRect().top;
      const pagina = el.closest('[data-mega-page-viewport="2"]') || document;
      const franja = pagina.querySelector('[data-stripe-visual-content="2"]');
      const sostre = franja ? franja.getBoundingClientRect().top : null;
      // L'ESPAI FINS A LA FRANJA NOME'S QUAN ES REPETEIX (25/09/2026).
      //
      // La franja triga uns quants fotogrames a assentar-se (la seva escala i la
      // seva alcada) i la filera tambe (el bucle del pare li aplica l'alineacio).
      // Amb una sola mesura, la deduccio d'alçada encongia la graella per un
      // espai que encara no era el de debò: mesurat a 1920, el retall passava de
      // 95,2 a 89,9 px i tornava, i aixo movia la segona filera de dibuixos i la
      // tira de colors. Amb la mesura repetida (dues passades amb el mateix
      // espai), la deduccio nome's s'aplica quan la geometria ja es la bona; i si
      // de debò no hi cap, s'aplica igualment (el repas de 400 ms ho garanteix).
      const espai = sostre != null && daltGraella != null ? sostre - daltGraella : null;
      const espaiConfirmat = espai != null
        && espaiAnteriorRef.current != null
        && Math.abs(espai - espaiAnteriorRef.current) < 0.5;
      espaiAnteriorRef.current = espai;

      // El càlcul viu a midesGraella.js (funció pura, comprovable sense
      // navegador). Aquí només se li passen les mesures de la pantalla.
      const next = midesGraellaCompacta({
        ampleAmple,
        // LA PRIMERA MESURA NO FA LA DEDUCCIO D'ALCADA (25/09/2026).
        //
        // En aquest instant la filera encara no te l'alineacio aplicada (aquest
        // efecte es d'un fill i corre abans que el bucle del pare) i la franja
        // encara s'esta assentant, o sigui que `sostre - daltGraella` es fals.
        // Amb aquell espai la branca d'alçada encongia el dibuix un 20 % i el
        // retall naixia a 71,9 px en comptes de 95,2: la segona filera de
        // dibuixos saltava 11 px i la tira de colors i la segona filera de la
        // filera, 23 px. Ho va veure l'amo.
        //
        // Les mides DECLARADES (amplada i pas dels cercles) ja son les
        // definitives, i la deduccio s'aplica a la passada seguent (el rAF de
        // sota), quan la geometria ja es la bona.
        sostre: espaiConfirmat ? sostre : null,
        daltGraella, isPortraitTablet, isLandscapeTablet,
        escala: readRootCssNumber('--hg-escala-mega', 1),
      });

      const previ = midesRef.current;
      const igual = previ
        && Math.abs(previ.dibuix - next.dibuix) < 0.01
        && Math.abs(previ.gapH - next.gapH) < 0.01
        && Math.abs(previ.gapV - next.gapV) < 0.01;
      if (!igual) {
        midesRef.current = next;
        setMidesGraella(next);
        // I s'ho diem a qui ens ha de quadrar amb nosaltres (25/09/2026): la
        // filera d'aquesta graella es la referencia amb que el selector
        // Blanc/Color/Negre es centra, i la seva alçada es la de la graella. Si
        // el pare no ho sap, centra el selector amb una alçada vella i l'ha de
        // corregir al cap de 180 ms (mesurat a 1920: 11,16 px de salt amb el
        // panell ja obrint-se). Amb l'avís, el bucle del pare torna a mesurar
        // dins el mateix commit, abans de pintar.
        onMides?.(next);
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
    // El repas que garanteix que la deduccio s'aplica: es just despres de
    // l'animacio d'obertura del panell (340 ms), quan la geometria ja no es mou.
    const repas = window.setTimeout(mesura, 400);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(repas);
      observer?.disconnect();
      window.removeEventListener('resize', mesura);
    };
    // `alineacioY` ES UNA DEPENDENCIA DE DEBÒ (25/09/2026).
    //
    // El bucle d'alineació de la pagina 2 (`alignTopRowToPage1`, a
    // MegaslidePagina2) mou aquesta filera amb `top`, i el desplaçament no es
    // conegut fins que el bucle ha mesurat: al muntatge val 0 i tot seguit passa
    // a -66,67 px (a 1920). Els efectes de layout dels fills van ABANS que els
    // del pare, o sigui que la graella mesurava amb la filera encara a baix: la
    // franja li quedava 47 px mes a prop, la branca d'alçada li encongia el
    // dibuix un 20 % i la graella naixia petita (mesurat: la cella 35,77 i el
    // retall 71,53) per corregir-se tot seguit (44,63 i 95,2). El
    // ResizeObserver no ho salvava perque moure amb `top` no canvia cap mida.
    //
    // Amb l'alineacio a les dependències, quan el pare aplica el desplaçament la
    // graella es torna a mesurar DINS el mateix commit (abans de pintar): el
    // primer fotograma ja surt a la mida bona i no hi ha salt.
  }, [compact, isPortraitTablet, isLandscapeTablet, alineacioY, onMides]);

  // LA COLUMNA DE COLLECCIONS, DEL TOP DEL SELECTOR AL BOTTOM DE LA STRIPE.
  //
  // L'amo ho va demanar el 24/09/2026 (primer va dir "el bottom de la slide" i
  // despres ho va corregir: "el bottom de la stripe"). La columna viu en una
  // capa propia dins la filera (les nou linies son mes altes que el carrusel), i
  // ha d'anar del top del selector Blanc/Color/Negre al bottom de la tinta de la
  // franja de samarretes. Cap de les dues distancies no es constant: es mesuren
  // i s'apliquen, i es tornen a mirar quan la composicio acaba d'encaixar.
  const [margesEnllacos, setMargesEnllacos] = useState({ dalt: 0, baix: 0 });
  useLayoutEffect(() => {
    if (!compact) return undefined;
    const el = graellaRef.current;
    if (!el) return undefined;
    const calcula = () => {
      const filera = el.closest('[data-p2-cercador-row]');
      const pagina = el.closest('[data-mega-page-viewport="2"]');
      const selector = pagina?.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
      const franja = pagina?.querySelector('[data-stripe-visual-content="2"]');
      if (!filera || !selector || !franja) return;
      const f = filera.getBoundingClientRect();
      const dalt = f.top - selector.getBoundingClientRect().top;
      const baix = franja.getBoundingClientRect().bottom - f.bottom;
      setMargesEnllacos((previ) => (
        Math.abs(previ.dalt - dalt) < 0.5 && Math.abs(previ.baix - baix) < 0.5
          ? previ
          : { dalt, baix }
      ));
    };
    calcula();
    const t1 = window.setTimeout(calcula, 250);
    // A 400 ms i no a 900: es just despres de l'animacio d'obertura (340 ms).
    // El repas tarda corregia despres que el panell sembles fet (25/09/2026).
    const t2 = window.setTimeout(calcula, 400);
    window.addEventListener('resize', calcula);
    // La franja s'ajusta al carril i la seva alçada acaba de quadrar després del
    // primer pintat: sense observar-la, la mesura es quedava curta.
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(calcula) : null;
    const franjaEl = el.closest('[data-mega-page-viewport="2"]')?.querySelector('[data-stripe-visual-content="2"]');
    if (franjaEl) observer?.observe(franjaEl);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', calcula);
      observer?.disconnect();
    };
  }, [compact, graellaRef]);

  // LA GRAELLA DE COLORS (14x1), CENTRADA AMB LA CEL·LA NEGRE DEL SELECTOR.
  //
  // L'amo ho va demanar el 24/09/2026, juntament amb la primera línia de
  // dibuixos: cada peça cau sobre la cel·la del selector que li toca (les
  // barres de color, sobre NEGRE). El selector no es mou: el que puja son les
  // barres, els px que els falten. Com la resta de mesures, s'acumula i es
  // torna a mirar quan la composicio acaba d'encaixar.
  const [desnivellColors, setDesnivellColors] = useState(0);
  // El valor PINTAT, no el que s'ha decidit (vegeu el bucle de les dues files):
  // s'actualitza DESPRES de pintar, i el bucle hi arrenca. Aixi dues passades
  // que mesuren el mateix DOM donen el mateix objectiu i no se suma dues
  // vegades.
  const desnivellColorsRef = useRef(0);
  useEffect(() => {
    desnivellColorsRef.current = desnivellColors;
  }, [desnivellColors]);
  useLayoutEffect(() => {
    if (!compact) return undefined;
    const el = graellaRef.current;
    if (!el) return undefined;
    const calcula = () => {
      const filera = el.closest('[data-p2-cercador-row]');
      const pagina = el.closest('[data-mega-page-viewport="2"]');
      const selector = pagina?.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
      const colors = filera?.querySelector('[data-p2-color-grid]');
      if (!selector || !colors) return;
      const s = selector.getBoundingClientRect();
      const c = colors.getBoundingClientRect();
      // NEGRE es la tercera cel·la de les tres iguals del selector.
      const objectiu = s.top + (s.height / 3) * 2.5;
      const delta = (c.top + c.height / 2) - objectiu;
      if (Math.abs(delta) < 0.5) return;
      setDesnivellColors(desnivellColorsRef.current + delta);
    };
    // LA PRIMERA PASSADA VA EN UN rAF (25/09/2026, ho va veure l'amo: «es mou la
    // tira de colors»). A l'efecte de layout aquest fill corre ABANS que el bucle
    // que centra el selector amb la filera, o sigui que l'objectiu encara era
    // 19 px mes amunt (1920) i la tira hi queia a sobre; el repas de 250 ms ho
    // desfeia i la tira feia un salt de 19 px (i de 37 px a 1512x900) amb el
    // panell ja obrint-se. El rAF arriba abans del primer pintat pero DESPRES
    // dels efectes de layout: la mesura ja es la bona i la tira neix a lloc.
    const frame = requestAnimationFrame(calcula);
    const t1 = window.setTimeout(calcula, 250);
    // A 400 ms i no a 900: es just despres de l'animacio d'obertura (340 ms).
    // El repas tarda corregia despres que el panell sembles fet (25/09/2026).
    const t2 = window.setTimeout(calcula, 400);
    window.addEventListener('resize', calcula);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', calcula);
    };
  }, [compact, graellaRef]);

  if (compact) {
    // Dins el carril, tot el que es pinta son proporcions seves; les tauletes
    // (un disseny a part) i la banda estreta tenen les seves excepcions.
    const esTauleta = isPortraitTablet || isLandscapeTablet;
    const esBandaEstreta = typeof window !== 'undefined' && !esTauleta
      && window.innerWidth >= 768 && window.innerWidth <= 1366
      && window.innerWidth >= window.innerHeight;
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
    const dibuixBasePx = midesGraella?.dibuix ?? midaDibuix(isPortraitTablet, isLandscapeTablet);
    // LA PECA DEL CARRUSEL FA 1,5 COPS LA D'ABANS (24/09/2026).
    //
    // Es la mesura que surt de la regla de l'amo: les DUES files intercalades
    // noves ocupen el que abans ocupaven TRES files de la graella. Com que la
    // peca es quadrada, tambe es 1,5 cops mes ampla, i per aixo se'n veuen
    // menys i el conjunt es una tira que es desplac,a.
    const dibuixPx = dibuixBasePx * 1.5;
    // La separacio entre barres de color es calibra amb el mateix factor que
    // els dibuixos: si la graella s'encongeix (mobil, desktop estret), les
    // barres l'acompanyen.
    //
    // AMB LA MIDA BASE, NO AMB LA DEL CARRUSEL: si el factor prengues la mida
    // nova, la separacio creixeria un 50 % de regal.
    const factorDibuix = (midesGraella && midesGraella.dibuix != null)
      ? dibuixBasePx / midaDibuix(isPortraitTablet, isLandscapeTablet)
      : 1;
    const colorGapPx = colorGap(isPortraitTablet, isLandscapeTablet) * factorDibuix;
    const gapH = midesGraella?.gapH ?? gapHorizontal(isPortraitTablet, isLandscapeTablet);
    const gapV = midesGraella?.gapV ?? gapVertical(isPortraitTablet, isLandscapeTablet);
    const activeKey = activeCollection === 'austen' ? `austen:${activeSubcollection || ''}` : activeCollection;
    // L'amplada de les fletxes mes el seu coixi: el marge dret que han de
    // deixar tant el retall dels dibuixos com la linia de colleccions, perque
    // tots dos acabin on comencen les fletxes. Es calcula UNA vegada aqui (les
    // fletxes son al desktop i a la tauleta apaisada, no a la vertical) i el
    // fan servir els dos.
    const reservaDreta = (!isPortraitTablet && !isLandscapeTablet)
      ? `calc(${carrilPx(midaSelector / 2)} + ${carrilPx(10)})`
      : 0;

    return (
      <div
        // La filera sencera (les dues files): es el bloc que flanquegen el
        // selector Blanc/Color/Negre i el bloc de fletxes, i el que es mesura
        // per centrar-los-hi (vegeu `MegaslidePagina2`).
        data-p2-cercador-row
        style={{
          position: 'absolute',
          // `desplacamentVertical` el fa servir la pàgina 2 per quadrar aquesta
          // filera amb la de la pàgina 1 a la banda estreta. El selector
          // Blanc/Color/Negre la segueix tot sol (es centra amb la graella de
          // colors), i la franja de samarretes no es mou perquè no en depèn.
          top: `${40 - desplacamentVertical}px`,
          // TOT el que hi ha dins el carril son proporcions SEVES (1350 px de
          // referencia, vegeu `carrilPct` i `carrilLane`): la posicio de la
          // filera, les seves columnes i les separacions. Aixi el mateix carril
          // serveix a tots els formats, tambe a les tauletes.
          // La filera arrenca on acaba el bloc del selector mes 10 px (vegeu
          // MegaSlidePagina2). Si no s'hi passa res, es queda a la posicio de
          // disseny (13% del carril).
          left: esquerra || carrilPct(MARGE_ESQUERRA_DIBUIXOS_ESCRIPTORI_PX),
          // El marge dret es el MATEIX 3% del carril que el coixi del header
          // (`carrilLane`, no `carrilPx`): a tauleta 40 px fixos no son el 3%
          // del carril (en son 29,4) i la fila 1 no encaixava amb la franja del
          // header. Amb `carrilLane` l'amplada es la mateixa a 1024 i a 1280.
          // LA GRAELLA 4x4 A LA VORA DRETA DEL CARRIL (24/09/2026, ho va demanar
          // l'amo). Abans el marge dret era el coixí de disseny (40/1350 del
          // carril); ara es 0, com el logo del header i com el selector, que va
          // a la vora esquerra.
          right: 0,
          display: 'grid',
          // Les columnes i la separacio son mides del carril (78, 142 i 10 px
          // de 1350). Amb `carrilLane` (no `carrilPx`) tambe s'encongeixen a
          // tauleta: en `%` no hi valen perque el seu contenidor es la filera,
          // no el carril.
          // La columna de la llista no pot ser mes estreta que el seu contingut
          // (el nom mes llarg): si ho fos, el text s'endinsaria a la columna de
          // colors. Amb `min-content` creix a la mida del text i la seva dreta
          // queda clavada a la dreta de la filera (o sigui a la franja).
          // DUES COLUMNES I DUES FILES (24/09/2026):
          //
          //   fila 1   [ carrusel .................... ] [ 4x4 ]
          //   fila 2   [ enllacos de colleccions ..... ] [  "  ]
          //
          // La 4x4 va a la DRETA (columna 2, les dues files) i els enllacos de
          // colleccions son una LINIA a sota del carrusel, entre el selector i la
          // 4x4. Abans eren una columna a la dreta de tot, i la 4x4 anava al mig.
          // LA COLUMNA DE LA DRETA ES LA MIDA DE LA GRAELLA 4x4.
          //
          // Abans era `carrilLane(78)` (66 px a 1920) i la graella 4x4 en
          // necessita 123 (quatre rodones de `cerclePx` i tres gaps): la
          // columna era 57 px mes estreta que el seu contingut, o sigui que les
          // dues ultimes columnes de colors queien FORA del carril. Amb
          // `max-content` la columna fa exactament el que ocupa la graella, i
          // com que la filera acaba a la vora dreta del carril, la graella
          // tambe: la seva vora dreta es la del carril.
          // LA COLUMNA DE LA DRETA ES LA DEL DISSENY (142 de 1350), no el que
          // ocupi el que hi hagi a dins. Es el que fa que res no es mogui: amb
          // `max-content`, canviar el contingut d'aquella columna (la graella de
          // colors abans, els enllacos ara) n'amplava o estrenyia l'amplada i,
          // amb ella, la del carrusel, la de les fletxes i la de la franja.
          gridTemplateColumns: `minmax(0, 1fr) ${carrilLane(142)}`,
          // LA FILA 2 ARRIBA AL BAIX DEL SELECTOR (24/09/2026, ho va demanar
          // l'amo). El baix del selector cau `carrilLane(40)` per sota del
          // baix de la graella de dibuixos (es el coixi de 40 de la
          // composicio; el mateix numero alinea el bloc de fletxes). Com que
          // la fila 2 va `rowGap` (10 px) sota la graella, la seva alçada es
          // `carrilLane(40) - 10px`, i els enllacos hi van enrasats a baix
          // (`alignSelf: 'end'`). Amb `minmax(..., auto)` la fila creix si els
          // enllacos hi van en dues linies (tauleta) en comptes de sortir-se'n.
          // ALCADA FIXA (24/09/2026). Amb `auto`, el que hi hagi a la fila 2
          // (la graella de colors) canviava l'alçada de tota la filera i, amb
          // ella, la mida dels dibuixos i el lloc de les fletxes i del selector.
          // Fixa, el que hi posem no mou res.
          gridTemplateRows: `auto calc(${carrilLane(40)} - 10px)`,
          // 10 px FIXES entre blocs (no escalats): es el que fa que totes les
          // mides quadrin, perque el que cedeix es el gap intern dels dibuixos.
          columnGap: '20px',
          rowGap: '10px',
          alignItems: 'start',
          pointerEvents: 'auto',
        }}
      >
        {/* Sense desplaçament propi de tauleta: la graella arrenca on arrenca a
            l'escriptori (13% del carril). */}
        <CercadorDibuixosGraella
          graellaRef={graellaRef}
          items={items}
          dibuixPx={dibuixPx}
          gapH={gapH}
          gapV={gapV}
          numColumns={numColumns}
          midaSelector={midaSelector}
          reservaDreta={reservaDreta}
          carrusel
          activeCollection={activeCollection}
          activeSubcollection={activeSubcollection}
          onSelectGroup={onSelectGroup}
          onHoverItem={onHoverItem}
          onHoverLeave={onHoverLeave}
          isPortraitTablet={isPortraitTablet}
          isLandscapeTablet={isLandscapeTablet}
          fontBoost={fontBoost}
          onCarouselStep={onCarouselStep}
        />

        {/* LA GRAELLA DE COLORS 14x1, AL LLOC ON ERA EL TEXT (24/09/2026, ho va
            demanar l'amo): fila 2 de la primera columna, entre el selector i les
            fletxes, com feia la linia d'enllacos. */}
        <div style={{ gridColumn: '1', gridRow: '2', minWidth: 0 }}>
          <CercadorColorsGrid
            selectedColor={selectedColor}
            onSelectColor={onSelectColor}
            colorGapPx={colorGapPx}
            reservaDreta={reservaDreta}
            marginTop={-desnivellColors}
          />
        </div>

        {/* ELS ENLLACOS DE COLLECCIONS, UNA COLUMNA A LA DRETA. Va en una capa
            propia (`position: absolute`) perque les nou linies son mes altes que
            el carrusel i, dins del flux, estirarien la fila 1 i farien marxar
            les fletxes i el selector. Fora del flux no estira res. */}
        {/* EL MARGES DE LA COLUMNA ES MESUREN DES D'AQUESTA CAPA: es qui la
            conté, i per aixo s'estira a les dues files (`alignSelf: stretch`).
            Amb la capa de 0 px d'alçada (el seu únic fill és absolut), el
            `bottom` de la columna es comptava des d'un zero i la llista no
            arribava mai al bottom de la slide. */}
        <div style={{ gridColumn: '2', gridRow: '1 / span 2', minWidth: 0, position: 'relative', alignSelf: 'stretch' }}>
          <CercadorColleccionsColumna
            absolut
            reservaDreta={reservaDreta}
            margeDalt={margesEnllacos.dalt}
            margeBaix={margesEnllacos.baix}
            activeKey={activeKey}
            onSelect={onSelectCollection}
            isPortraitTablet={isPortraitTablet}
            isLandscapeTablet={isLandscapeTablet}
          />
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
