import React, { useLayoutEffect, useRef, useState } from 'react';
import { CERCADOR_COLLECTIONS, CERCADOR_COLORS } from './CercadorTopBar.jsx';
// La geometria de la graella viu a midesGraella.js perquè també la fa servir
// el mòdul de mesura única. Aquí només es consumeix.
import {
  GRAELLA_COLUMNES, GRAELLA_FILES, GRAELLA_ESQUERRA_LANDSCAPE,
  midaDibuix, gapHorizontal, gapVertical, colorMida, colorGap,
  midesGraellaCompacta,
  MARGE_ESQUERRA_DIBUIXOS_ESCRIPTORI_PX, MARGE_DRET_FILERA_ESCRIPTORI_PX,
} from './midesGraella.js';
import { carrilPct, carrilLane, carrilPx, readRootCssNumber } from '../../utils/layoutMetrics.js';

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
  items,
  dibuixPx,
  gapH,
  gapV,
  numColumns,
  activeCollection,
  activeSubcollection,
  onSelectGroup,
  onHoverItem,
  onHoverLeave,
  isPortraitTablet = false,
  isLandscapeTablet = false,
  fontBoost = 0,
}) {
  return (
    <div ref={graellaRef} style={{ display: 'grid', gridTemplateColumns: `repeat(${numColumns}, ${dibuixPx}px)`, gap: `${gapV}px ${gapH}px`, width: '100%', minWidth: 0 }}>
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
              <span style={{ color: '#2B2B2B', fontSize: (isPortraitTablet || isLandscapeTablet) ? `${8 + fontBoost}px` : carrilPx(11 + fontBoost), whiteSpace: 'nowrap' }}>
                {label.replace(/^Looking For My Darcy/, 'LFMD')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** La GRAELLA DE COLORS (4x4) de la pagina 2, amb la pastilla COLOR. */
export function CercadorColorsGrid({
  selectedColor,
  onSelectColor,
  cerclePx,
  colorGapPx,
  transform,
  marginTop,
  isPortraitTablet = false,
  isLandscapeTablet = false,
}) {
  return (
    <div data-p2-color-grid style={{
      display: 'grid',
      gridTemplateColumns: `repeat(4, ${cerclePx}px)`,
      gridAutoRows: `${cerclePx}px`,
      gap: `${colorGapPx}px`,
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
            onClick={() => onSelectColor?.(slug)}
            style={{
              width: `${cerclePx}px`,
              height: `${cerclePx}px`,
              padding: 0,
              borderRadius: '50%',
              border: selected ? '0.5px solid rgba(0,0,0,0.22)' : '0.5px solid rgba(0,0,0,0.22)',
              outline: selected ? '1px solid #111827' : 'none',
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
            fontSize: (isPortraitTablet || isLandscapeTablet) ? '8px' : carrilPx(11),
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
  );
}

/** La COLUMNA DE COLLECCIONS de la pagina 2. */
export function CercadorColleccionsColumna({
  activeKey,
  onSelect,
  alcadaFilaLlista,
  paddingLeft,
  transform,
  isPortraitTablet = false,
  isLandscapeTablet = false,
}) {
  return (
    <div style={{ width: '100%', transform, paddingLeft }}>
      {CERCADOR_COLLECTIONS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect?.(key)}
          className="font-roboto-condensed"
          style={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            height: (isPortraitTablet || isLandscapeTablet) ? '11px' : `${alcadaFilaLlista}px`,
            padding: 0,
            border: 0,
            background: 'transparent',
            color: '#2B2B2B',
            fontSize: (isPortraitTablet || isLandscapeTablet) ? '8px' : carrilPx(11),
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
  );
}

function CercadorTextRow({ activeCollection, activeSubcollection, selectedStripeItem, hoveredStripeItem, onSelectGroup, onHoverItem, onHoverLeave, compact = false, selectedColor = 'white', onSelectColor, onSelectCollection, isPortraitTablet = false, isLandscapeTablet = false, uniformColumns = false, fontBoost = 0, desplacamentVertical = 0, esquerra }) {
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
      const ampleAmple = el.clientWidth;
      const daltGraella = el.getBoundingClientRect().top;
      const pagina = el.closest('[data-mega-page-viewport="2"]') || document;
      const franja = pagina.querySelector('[data-stripe-visual-content="2"]');
      const sostre = franja ? franja.getBoundingClientRect().top : null;

      // El càlcul viu a midesGraella.js (funció pura, comprovable sense
      // navegador). Aquí només se li passen les mesures de la pantalla.
      const next = midesGraellaCompacta({
        ampleAmple, sostre, daltGraella, isPortraitTablet, isLandscapeTablet,
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
    const dibuixPx = midesGraella?.dibuix ?? midaDibuix(isPortraitTablet, isLandscapeTablet);
    // Els cercles de color es calibren amb el mateix factor que els dibuixos:
    // si la graella s'encongeix (mobil, desktop estret), els cercles
    // l'acompanyen i les files continuen caient les unes sobre les altres.
    const factorDibuix = (midesGraella && midesGraella.dibuix != null)
      ? midesGraella.dibuix / midaDibuix(isPortraitTablet, isLandscapeTablet)
      : 1;
    const cerclePx = colorMida(isPortraitTablet, isLandscapeTablet) * factorDibuix;
    const colorGapPx = colorGap(isPortraitTablet, isLandscapeTablet) * factorDibuix;
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
          right: carrilLane(MARGE_DRET_FILERA_ESCRIPTORI_PX),
          display: 'grid',
          // Les columnes i la separacio son mides del carril (78, 142 i 10 px
          // de 1350). Amb `carrilLane` (no `carrilPx`) tambe s'encongeixen a
          // tauleta: en `%` no hi valen perque el seu contenidor es la filera,
          // no el carril.
          // La columna de la llista no pot ser mes estreta que el seu contingut
          // (el nom mes llarg): si ho fos, el text s'endinsaria a la columna de
          // colors. Amb `min-content` creix a la mida del text i la seva dreta
          // queda clavada a la dreta de la filera (o sigui a la franja).
          gridTemplateColumns: `minmax(0, 1fr) ${carrilLane(78)} minmax(min-content, ${carrilLane(142)})`,
          // 10 px FIXES entre blocs (no escalats): es el que fa que totes les
          // mides quadrin, perque el que cedeix es el gap intern dels dibuixos.
          columnGap: '20px',
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
          activeCollection={activeCollection}
          activeSubcollection={activeSubcollection}
          onSelectGroup={onSelectGroup}
          onHoverItem={onHoverItem}
          onHoverLeave={onHoverLeave}
          isPortraitTablet={isPortraitTablet}
          isLandscapeTablet={isLandscapeTablet}
          fontBoost={fontBoost}
        />

        <CercadorColorsGrid
          selectedColor={selectedColor}
          onSelectColor={onSelectColor}
          cerclePx={cerclePx}
          colorGapPx={colorGapPx}
          // A l'apaisada la graella de colors va 10 px mes a l'esquerra (ho va
          // demanar l'amo, igual que la columna de colleccions).
          transform={uniformColumns ? 'translateX(85px)' : ((isPortraitTablet || isLandscapeTablet) ? 'translateX(-10px)' : undefined)}
          marginTop={uniformColumns ? '5px' : undefined}
          isPortraitTablet={isPortraitTablet}
          isLandscapeTablet={isLandscapeTablet}
        />

        {/* La columna s'ajusta al nom mes llarg (fit-content): aixi el nom
            mes llarg comença on començava i els curts s'hi enrasen per la
            dreta, sense que el conjunt es desplaci. */}
        {/* La llista s'enrasa a la DRETA de la seva columna: d'aquesta manera el
            text acaba sempre on acaba la columna, sense dependre de com de llarg
            sigui el nom mes llarg ni del cos de lletra. Abans la columna era
            `fit-content` i el conjunt es desplaçava 45 px, i per aixo el text
            acaba 12 px mes enlla de la franja. */}
        <CercadorColleccionsColumna
          activeKey={activeKey}
          onSelect={onSelectCollection}
          alcadaFilaLlista={alcadaFilaLlista}
          // A l'apaisada (1024 i 1280) la llista va 10 px mes a l'esquerra, ho
          // va demanar l'amo.
          transform={uniformColumns ? 'translateX(120px)' : ((isPortraitTablet || isLandscapeTablet) ? 'translateX(-10px)' : undefined)}
          // La graella de colors te la seva columna (78) i el seu contingut
          // (4 cercles i 3 separacions) en surt: aquest coixí es la part que
          // sobresurt, perque la llista no hi caigui a sobre.
          paddingLeft={`max(0px, calc(${4 * cerclePx + 3 * colorGapPx}px - ${carrilLane(78)}))`}
          isPortraitTablet={isPortraitTablet}
          isLandscapeTablet={isLandscapeTablet}
        />
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
