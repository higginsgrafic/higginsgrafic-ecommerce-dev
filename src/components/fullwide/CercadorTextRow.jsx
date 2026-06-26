import React from 'react';

/**
 * CercadorTextRow
 * -----------------------------------------------------------------------------
 * Fila central de text del cercador (pàgina 2 del megaslide). Són 8 columnes
 * de dissenys, agrupades per col·lecció. Cada grup mostra una línia connectora
 * vertical a l'esquerra; el primer grup d'una llista nova porta un bullet amb
 * un stub horitzontal, mentre que les continuacions d'una llista (col3 g1 i
 * col5) només tenen la línia.
 *
 * Mètriques calibrades del mockup fons-cercador.png (amplada 4512px = 100cqw,
 * factor px -> cqw = 1/45.12). Text Roboto Condensed 10,5pt Light.
 */

// Posició x del connector de cada columna (cqw), mesurada al mockup.
const COL_X = [0, 11.68, 23.09, 35.95, 48.45, 62.65, 80.45, 92.42];

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
  'Looking For My Darcy Pink Solid': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/fuchsia-solid-grid.webp',
  'Looking For My Darcy Red Solid': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/red-solid-grid.webp',
  'Looking For My Darcy Yellow Solid': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/yellow-solid-grid.webp',
  'Looking For My Darcy Yellow Blue Frame': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/blue-frame-grid.webp',
  'Looking For My Darcy Yellow Pink Frame': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/fuchsia-frame-grid.webp',
  'Looking For My Darcy Red Yellow Frame': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/red-frame-grid.webp',
  'Looking For My Darcy Yellow Frame': '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/yellow-frame-grid.webp',
  // CUBE
  'Afrodita-C': 'Afrodita C',
  '3cube-P0': 'Cube 3 P0',
  'Cyber Cube': 'Cyber Cube',
  "Cylon Cube '03": 'Cylon Cube 03',
  'Darth Cube': 'Darth Cube',
  "Iron Cube '08 (Iron Kong)": 'Iron Kong',
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

// 8 columnes -> grups -> ítems. bullet=true mostra bullet+stub al primer ítem.
// Cada grup té una clau de col·lecció per poder filtrar/marcar segons el botó actiu.
const COLUMNS = [
  // 1 · FIRST CONTACT
  [{ bullet: true, collection: 'first_contact', subcollection: null, items: ['NX-01', 'NCC-1701', 'NCC-1701-D', 'Wormhole', 'The Phoenix', 'Vulcans End', 'Plasma Escape'] }],
  // 2 · THE HUMAN INSIDE (personatges)
  [{ bullet: true, collection: 'the_human_inside', subcollection: null, items: ['Afrodita-A', 'C3-P0', 'Cyberman', "Cylon '03", "Cylon '78", "Iron Man '08", "Iron Man '68", 'Maschinenmensch', 'Mazinger-Z', 'R2-D2'] }],
  // 3 · THE HUMAN INSIDE (continuació) + AUSTEN (Pemberley + Keep Calm)
  [
    { bullet: false, collection: 'the_human_inside', subcollection: null, items: ['Robbie The Robot', 'Robocop', 'The Dalek', 'Vader'] },
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
  [{ bullet: true, collection: 'austen', subcollection: 'looking_for_my_darcy', items: ['Looking For My Darcy Blue Solid', 'Looking For My Darcy Pink Solid', 'Looking For My Darcy Red Solid', 'Looking For My Darcy Yellow Solid', 'Looking For My Darcy Yellow Blue Frame', 'Looking For My Darcy Yellow Pink Frame', 'Looking For My Darcy Red Yellow Frame', 'Looking For My Darcy Yellow Frame'] }],
  // 7 · CUBE
  [{ bullet: true, collection: 'cube', subcollection: null, items: ['Afrodita-C', '3cube-P0', 'Cyber Cube', "Cylon Cube '03", 'Darth Cube', "Iron Cube '08 (Iron Kong)", "Iron Cube '68", 'Maschinencube', 'Mazinger-C', 'Robocube'] }],
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

function CercadorTextRow({ activeCollection, activeSubcollection, selectedStripeItem, hoveredStripeItem, onSelectGroup, onHoverItem, onHoverLeave }) {
  return (
    <div style={{ position: 'absolute', top: '-5px', left: '-2px', bottom: 0, right: '18px', pointerEvents: 'none' }}>
      {COLUMNS.map((groups, col) => (
        <div
          key={col}
          style={{ position: 'absolute', top: `${TOP_CQW}cqw`, left: `${COL_X[col]}cqw` }}
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
