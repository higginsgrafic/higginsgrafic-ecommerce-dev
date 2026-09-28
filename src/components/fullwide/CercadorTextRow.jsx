import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CERCADOR_COLLECTIONS, CERCADOR_COLORS, etiquetaColleccio } from './CercadorTopBar.jsx';
// La geometria de la graella viu a midesGraella.js perquè també la fa servir
// el mòdul de mesura única. Aquí només es consumeix.
import {
  GRAELLA_COLUMNES, GRAELLA_ESQUERRA_LANDSCAPE,
  midaDibuix, gapHorizontal, gapVertical, colorGap,
  midesGraellaCompacta,
  MARGE_ESQUERRA_DIBUIXOS_ESCRIPTORI_PX,
} from './midesGraella.js';
// L'amplada del retall (l'últim input mesurat de la graella) viu amb la resta
// de geometria declarada del megaslide.
import { ampladaRetallGraella, ampladaColumnaGraella, desnivellsLiniesGraella, desnivellColorsGraella, margeBaixFletxesGraella, centratgeSelectorY, desplacTopSelector, topFranjaPagina2, GRAELLA_DRETA_FLETXES_CARRIL_PX, GRAELLA_COLUMNA_DRETA_CARRIL_PX, GRAELLA_GAP_COLUMNES_PX, COLUMNA_TOP_AJUST_PX, COLUMNA_BAIX_AJUST_PX, OMBRA_MANIGA_ALFA, OMBRA_MANIGA_BLUR_PX, OMBRA_MANIGA_OFFSET } from '../megaslide/geometriaMegaslide.js';
import { carrilPct, carrilLane, carrilPx, readRootCssNumber, getLayoutViewportWidth, MEGASLIDE_REFERENCIA_PX } from '../../utils/layoutMetrics.js';
import { GRAELLA_DIBUIXOS_ESCALA_VERTICAL } from '../../config/stripeCalibrationsVertical.js';
import { FirstContactDibuix09Buttons } from './firstContactPanels.jsx';
import { caminsSiluetes, precarregaSiluetesSamarreta } from './siluetesSamarreta.js';
import { ESTIL_CAIXA_BLOC } from './estilsBlocs.js';

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
    // El fitxer de graella que es veu al retall. El fa servir la porta
    // d'obertura del megaslide per precarregar-lo abans de muntar el panell.
    dibuix: dibuixDelNom(label),
  }))));
}

/** La GRAELLA DE DIBUIXOS 16x4 de la pagina 2 (una casella per dibuix). */
export function CercadorDibuixosGraella({
  // EL REF DE LA CAIXA QUE ES MOU (EL RETALL DEL CARRUSEL). Qui el posa el pot
  // passar per mesurar-la de fora (la filera de la pagina 2 ho fa); si no
  // arriba, la graella se'n fa un de propi, perque el gest i la rodeta hi han
  // d'anar enganxats igualment (26/09/2026: a la pagina 1 la graella no en tenia
  // cap i per aixo la rodeta no hi feia res).
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
  /** LA FUNCIO DE PAS, CAP A FORA (27/09/2026). La pagina 1 te les fletxes FORA
   *  d'aquesta graella (al bloc de la dreta) i han de fer el MATEIX que les
   *  fletxes del carrusel: moure la tira amb `setDesplacGest`. Qui posa la
   *  graella passa un `setState` i aqui s'hi publica la funcio de pas, de
   *  manera que nome's hi ha UN mecanisme i un sol estat (el de dins). */
  onStepper = null,
  /** Amaga el bloc de fletxes de dins del carrusel (la pagina 1 en te un de
   *  propi al bloc de la dreta; les del carrusel son les del disseny vell). */
  senseFletxes = false,
  /** L'alcada de la finestra del carrusel, en px. Si arriba, mana sobre el
   *  calcul de les dues files: es el cas de la pagina 1, on la graella ha de
   *  fer exactament l'alcada del bloc de la dreta (selector + fletxes). */
  alcadaCarruselPx = null,
  isPortraitTablet = false,
  isLandscapeTablet = false,
  fontBoost = 0,
  /** SENSE ATENUACIO (28/09/2026). A la graella de la p1 els dibuixos de les
   *  colleccions que no son l'activa NO s'atenuen (ho va demanar en Marc: «Treu
   *  el vel de la p1»): es veuen tots al 100 %. A la p2 es queda el 0,12. */
  senseAtenuacio = false,
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
  const alcadaCarrusel = carrusel
    ? (Number.isFinite(alcadaCarruselPx) && alcadaCarruselPx > 0 ? alcadaCarruselPx : alcadaFila * 2)
    : 0;
  // Una peça per clic de fletxa (mig pas: les peces van mig pas una de l'altra).
  const unPas = pas / 2;

  // EL CARRUSEL ES MOU ARROSSEGANT, I AL DESKTOP TAMBE AMB FLETXES.
  //
  // LES BARRES DE DESPLAÇAMENT ESTAN PROHIBIDES en aquest projecte (constitucio,
  // regla 16): o sigui que el contenidor va amb `overflow: hidden` i el
  // desplac,ament el governa aquest estat. El gest es d'ARROSSEGAR (pointer
  // events, que tambe son els del dit) i, al desktop, dos botons de fletxa
  // junts en un costat; a les tauletes no hi son (ho va dir l'amo).
  // EL DESPLAÇAMENT, EN DUES PARTS: LA BASE I EL GEST (26/09/2026, pagina 1).
  //
  // La base la governa qui mana del carrusel: la colleccio activa, que el centra
  // (vegeu mes avall). El GEST (arrossegar, rodeta, les fletxes de la pagina 2 i
  // les del bloc de la dreta de la pagina 1) suma el seu propi desplaçament a
  // sobre. Aixi les dues coses no es trepitgen i no cal posar la base a cap
  // efecte (que era el que provocava un `setState` dins d'un efecte).
  //
  // EL BLOC DE FLETXES DE LA PAGINA 1 TAMBE ESCRIVIA AQUI, I ERA EL PROBLEMA
  // (27/09/2026). Tenia un comptador de passos propi al pare
  // (`desplacamentPassos`) que es muntava al cos del render: cada cop que
  // canviava, allo esborrava la base i la compensava al gest perque la posicio
  // no fes cap salt, o sigui que el pas del bloc es cancel·lava a si mateix
  // (mesurat: la transformacio del carrusel no es movia mai de −1018,5, i el
  // pare arribava a veure `passos: 1, base: 22,5`). Ara el bloc crida la funcio
  // de pas de la graella (`stepperRef`, el mateix `setDesplacGest` que les
  // fletxes del carrusel) i nome's hi ha un estat.
  const [desplacBase, setDesplacBase] = useState(0);
  const [desplacGest, setDesplacGest] = useState(0);
  const arrossegant = useRef(null);
  const haArrossegat = useRef(false);
  const ambFletxes = carrusel && !isPortraitTablet && !isLandscapeTablet && !senseFletxes;
  // LA FUNCIO DE PAS, PUBLICADA (27/09/2026). Les fletxes del bloc de la dreta
  // de la pagina 1 son FORA d'aquesta graella: en comptes de portar un estat
  // propi, en reben aquesta i criden el MATEIX `setDesplacGest` que les fletxes
  // del carrusel. `unPas` es mig periode d'una peca (la unitat del gest i de la
  // rodeta).
  const stepper = useCallback((direccio) => {
    const d = Number(direccio) || 0;
    if (!d) return;
    setDesplacGest((v) => v + d * unPas);
  }, [unPas]);
  useEffect(() => {
    // Amb `() => stepper` i no `stepper`: un `setState` amb una funcio la
    // tracta com un actualitzador i la cridaria. Aixi el que es desa es la
    // funcio, i com que la referencia nome's canvia quan canvia `unPas`, React
    // no torna a renderitzar.
    if (typeof onStepper === 'function') onStepper(() => stepper);
  }, [onStepper, stepper]);
  // La caixa que es mou: el ref que arriba de fora (la filera) o el nostre.
  const refInterna = useRef(null);
  const refCarrusel = graellaRef || refInterna;
  const caixaCarrusel = () => refCarrusel?.current || null;

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
    // EL MARGE, DECLARAT (26/09/2026). Abans es mesurava la diferencia entre el
    // baix del selector i el baix del retall; ara surt de
    // `margeBaixFletxesGraella`. Es queden el rAF i els repassos de 250/400 ms
    // perque tambe refresquen el valor quan canvia la finestra (les variables
    // del carril no provoquen cap re-render).
    const calcula = () => {
      const d = margeBaixFletxesGraella({
        dibuix: dibuixPx / 1.5,
        gapV,
        carril: readRootCssNumber('--hg-mega-w', MEGASLIDE_REFERENCIA_PX),
        midaSelector,
        escala: readRootCssNumber('--hg-escala-mega', 1),
      });
      setMargeBaixFletxes((previ) => (previ !== null && Math.abs(previ - d) < 0.01 ? previ : d));
    };
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
  }, [ambFletxes, refCarrusel, dibuixPx, gapV, midaSelector]);

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
  // El desnivell fa que les dues linies caiguin sobre la cel·la BLANC (la
  // primera) i la COLOR (la segona) del selector, i es el que fa que les vistes
  // vertical i horitzontal quadrin entre elles (ho vigila `compara-vistes`).
  // Es DECLARA (`desnivellsLiniesGraella`): els dos costats son mides del
  // carril i del selector, i el bucle que les mesurava va desaparèixer el
  // 26/09/2026.
  const [desnivellsLinies, setDesnivellsLinies] = useState({ primera: 0, segona: 0 });
  // LA FINESTRA TAMBE COBRA EL DESNIVELL (25/09/2026).
  //
  // Les dues files es col·loquen amb el desnivell DECLARAT
  // (`desnivellsLiniesGraella`, que les centra a les cel·les BLANC i COLOR del
  // selector) i la finestra es DECLARA (`alcadaFila * 2`). Quan la fila de dalt
  // puja (`top: -primera`), el seu capdamunt queda per sobre de la vora de la
  // finestra i el retall (`overflow: hidden`) se'n menja la primera fila de
  // pixels: mesurat a 1920, la fila puja 0,89 px i els dibuixos tenen tinta al
  // primer pixel natural, o sigui que es tallava tinta de debò.
  //
  // El que es fa es pujar la CAIXA del retall el que la fila s'ha enfilat i
  // baixar-ne el contingut el mateix (el marge de la tira): les peces no es mouen
  // gens, nome's la vora de dalt de la finestra.
  //
  // I s'hi afegeix la TOLERANCIA (0,5 px): el desnivell pot deixar la fila mig
  // pixel mes amunt del seu punt fix, i amb la vora a ras (`0,00 px`) un
  // arrodoniment de pixel de pantalla encara podria pelar-ne un.
  const sobreixDalt = carrusel ? Math.max(0, desnivellsLinies.primera) + 0.5 : 0;
  useLayoutEffect(() => {
    if (!carrusel) return undefined;
    // EL DESNIVELL DE LES DUES FILES, DECLARAT (26/09/2026). Abans es mesuraven
    // els centres de les files i els de les cel·les BLANC i COLOR del selector i
    // s'anaven igualant (amb `liniesDibuixos`); ara surt de
    // `desnivellsLiniesGraella`. Es queden el rAF i els repassos de 250/400 ms
    // perque tambe refresquen el valor quan canvia la finestra (les variables
    // del carril no provoquen cap re-render).
    const calcula = () => {
      const d = desnivellsLiniesGraella({
        dibuix: dibuixPx / 1.5,
        gapV,
        carril: readRootCssNumber('--hg-mega-w', MEGASLIDE_REFERENCIA_PX),
        midaSelector,
        escala: readRootCssNumber('--hg-escala-mega', 1),
      });
      setDesnivellsLinies((previ) => (
        Math.abs(previ.primera - d.primera) < 0.01 && Math.abs(previ.segona - d.segona) < 0.01
          ? previ
          : d
      ));
    };
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
  }, [carrusel, refCarrusel, dibuixPx, gapV, midaSelector]);

  // El desplaçament efectiu es el residu dins una volta: aixi la tira pot
  // avançar (o retrocedir) sense fi i sempre cau dins de les dues copies.
  const desplac = desplacBase + desplacGest;
  const desplacEf = periode > 0 ? ((desplac % periode) + periode) % periode : 0;


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
      setDesplacGest((v) => v + d);
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
  //
  // EL CENTRATGE, EN UNA FUNCIO A PART (28/09/2026). En Marc: «Quan cliques un
  // dibuix la colleccio s'ha de centrar independentment dels clics que hi hagi
  // hagut». L'efecte nome's salta quan canvia la CLAU de la colleccio, i clicar
  // un dibuix de la colleccio que ja es activa no la canvia: per aixo el clic
  // tambe crida `centraColleccio`.
  //
  // EL GEST COMPTA, I ES BUIDA (era el que feia el salt). La posicio de la tira
  // es `translateX(-(base + gest))`. Amb les fletxes, el gest acumula posicions
  // (una per clic); si en triar un dibuix es recalcula NOME'S la base, el gest
  // que hi havia es queda alla i la tira salta el que s'havia clicat (mesurat a
  // la p2: dos clics i un dibuix feien un salt de 440 px, vuit posicions). Amb el
  // gest dins la formula i el gest a zero, el `-gest` es cancel·la i la tira cau
  // exactament al centre de la finestra.
  const centraColleccio = () => {
    if (!carrusel || !(periode > 0)) return;
    const indexos = items
      .map((it, i) => (it.collection === activeCollection
        && (!activeSubcollection || it.subcollection === activeSubcollection) ? i : -1))
      .filter((i) => i >= 0);
    if (!indexos.length) return;
    const centre = ((indexos[0] + indexos[indexos.length - 1]) / 2) * unPas + dibuixPx / 2;
    const finestra = refCarrusel?.current?.clientWidth || 0;
    if (!finestra) return;
    setDesplacBase(centre + desplacGest - finestra / 2);
  };
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
      setDesplacBase(centre + desplacGest - finestra / 2);
    };
    centra();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCollection, activeSubcollection, carrusel, periode, unPas, dibuixPx]);

  // EL DESPLAÇAMENT DEL CARRUSEL, GOVERNAT DE FORA (26/09/2026, pagina 1).
  //
  // A la pagina 1 les fletxes no viuen dins d'aquesta graella: son al bloc de la
  // dreta (`BlocDretaPagina1`), a l'altra banda de la filera. El pare porta el
  // comptador de passos i aqui se sincronitza el desplaçament amb ell. Cada pas
  // es `unPas` (mig periode d'una peça), la mateixa unitat que el gest i les
  // fletxes de la pagina 2.
  //
  // Nomes quan canvia el nombre de passos: el gest i la rodeta segueixen manant
  // i no es trepitgen.
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
    setDesplacGest(a.inici - dx - desplacBase);
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
    // SENSE ATENUACIO A LA P1 (28/09/2026): alla `dimmed` no s'aplica mai.
    const dimmed = !senseAtenuacio && (activeCollection && collection !== activeCollection
      ? true
      : activeCollection === 'austen' && collection === 'austen' && activeSubcollection && subcollection !== activeSubcollection);
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
        onClick={() => {
          // EN TRIAR UN DIBUIX, LA COLLECCIO TORNA AL CENTRE I LES FLETXES A
          // ZERO (28/09/2026). En Marc: «Quan cliques un dibuix la colleccio
          // s'ha de centrar independentment dels clics que hi hagi hagut». El
          // `setDesplacGest(0)` es tambe el que fa que el `-gest` de la formula
          // es cancel·li (vegeu `centraColleccio`).
          setDesplacGest(0);
          centraColleccio();
          onSelectGroup?.(collection, subcollection, stripeItem);
        }}
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
            // LA SEGONA FILERA, `gapV` MES AVALL (28/09/2026). En Marc: «Es mouen
            // totes dues juntes. Has de separar-les»: en mode carrusel les peces
            // son ABSOLUTES i el `gap` de la graella no hi fa res, o sigui que la
            // separacio entre les dues fileres s'ha d'aplicar aqui. Amb `gapV` la
            // filera 1 no es mou i la 2 baixa.
            position: 'absolute',
            left: `${(i * pas) / 2}px`,
            top: `${(i % 2)
              // NOME'S LA GRAELLA DE LA P1 SEPARA LES FILES AMB `gapV` (28/09/2026).
              // La seva graella va `senseFletxes` (les fletxes son al bloc de la
              // dreta); a la p2 el `gapV` es el pas vertical de la seva propia
              // composicio i sumar-l'hi movia la segona filera (i amb ella el
              // centratge del selector i les caselles del vel: «els dibuixos es
              // veuen per sobre el vel»).
              //
              // A LA VERTICAL, SENSE DESNIVELL (28/09/2026). Els `desnivellsLinies`
              // son el escalonat de les dues linies de la composicio horitzontal
              // (15,4 px a 768): alla la fila 2 baixa `alcadaFila − segona`, i a la
              // vertical aixo deixava el pas entre files en 18,7 px en lloc de
              // 34,1 — o sigui que la fila de dalt no podia quadrar amb el boto
              // BLANC. A la vertical les dues files van a pas de peça, que es el
              // que fa que coincideixin amb BLANC i COLOR del selector.
              ? alcadaFila - (isPortraitTablet ? 0 : desnivellsLinies.segona) + (senseFletxes ? gapV + DESPLACAMENT_FILES_P1_PX : 0)
              : -(isPortraitTablet ? 0 : desnivellsLinies.primera) + (senseFletxes ? DESPLACAMENT_FILES_P1_PX : 0)}px`,
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
            // EAGER, NO LAZY (26/09/2026). El megaslide ja no es munta fins que
            // aquests dibuixos son a la memoria (vegeu la porta d'obertura de
            // `FullWideSlideHeader`). Amb `lazy`, el navegador encara esperava
            // el seu propi fotograma per aplicar-los i el primer pintat del
            // panell en podia tenir uns quants sense imatge; amb `eager`, la
            // imatge de la memoria s'aplica de seguida. Com que el panell
            // nome's es munta amb el megaslide obert, aixo no demana cap
            // imatge de mes.
            loading="eager"
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
          ref={refCarrusel}
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
            // SENSE FONS (28/09/2026): en Marc va demanar la caixa el mateix
            // dia («un bloc com el de la columna del selector de la p1, a la p2,
            // amb l'ombra i tot») i tot seguit la va retirar: «Treu el fons de
            // les fletxes de la p2». Les fletxes van soles, com el bloc de
            // fletxes de la pagina 1.
          }}>
            <FirstContactDibuix09Buttons
              vertical
              // LA DIRECCIO DE LES FLETXES DE LA GRAELLA, INVERTIDA (28/09/2026).
              //
              // En Marc: «Inverteix la direcció del moviment de les fletxes a la
              // graella [...] era a la graella intercalada». El desplaçament del
              // carrusel es pinta amb `translateX(-desplacEf)`, o sigui que
              // SUMAR a `desplacGest` mou les peces cap a l'ESQUERRA: la fletxa
              // de dalt (‹, «Anterior») avança la graella i la de baix recula,
              // que es la direcció que volia. Abans era al revés (restar amb
              // «Anterior»), i cap a la pàgina 2 aquesta botonera a mes ni tan
              // sol movia la graella: `MegaslidePagina2` hi passava
              // `onCarouselStep` i movia la stripe.
              onPrev={() => (onCarouselStep ? onCarouselStep(-1) : setDesplacGest((v) => v + unPas))}
              onNext={() => (onCarouselStep ? onCarouselStep(1) : setDesplacGest((v) => v - unPas))}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={refCarrusel} style={{
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
      // SCROLL INFINIT (27/09/2026, ho ha demanat en Marc): la tira no s'acaba
      // mai. Abans, arribat a l'ultim color, la rodeta ja no feia res (el index
      // s'hi quedava clavat); ara dona la volta: despres de l'ultim ve el
      // primer, i abans del primer, l'ultim.
      const n = CERCADOR_COLORS.length;
      const i = CERCADOR_COLORS.findIndex((c) => c.slug === selectedColor);
      const j = ((((i < 0 ? 0 : i) + (d > 0 ? -1 : 1)) % n) + n) % n;
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
      // AMB EL DIT TAMBÉ ES POT MOURE (26/09/2026): el gest horitzontal es
      // nostre (la barra que hi ha sota el dit es tria) i el vertical segueix
      // fent el desplacament de la pagina. Sense aixo, al mobil i a la tauleta
      // el navegador s'enduia el gest i la tira no es movia.
      touchAction: 'pan-y',
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
  // L'OMBRA DE LA MANIGA (27/09/2026): la caixa del contingut de la franja
  // dins d'aquesta columna (les distancies i la mida). La pinta la columna, que
  // te `overflow: hidden` i radi: l'ombra queda dins del selector i SOTA la
  // imatge de la franja (aquesta columna es a `zIndex: 3` i la franja a 4).
  ombraManiga = null,
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
  // LA SILUETA DE LA MANIGA (27/09/2026). L'ombra que la maniga fa sobre
  // aquesta columna ha de resseguir el SEU contorn, i el contorn es la silueta
  // de l'ultima casa del full (`caminsSiluetes`, la catorzena): la columna
  // nome's la trepitja ella.
  const [mascaraManiga, setMascaraManiga] = useState(null);
  // Nome's la PRESENCIA de l'ombra mana: `ombraManiga` es un objecte nou a cada
  // mesura, i posar-lo a les dependencies faria regenerar la mascara a cada
  // repàs (i el `setState` tornaria a mesurar).
  const teOmbraManiga = ombraManiga !== null;
  useEffect(() => {
    if (!teOmbraManiga) return undefined;
    let viu = true;
    precarregaSiluetesSamarreta()
      .then((text) => {
        if (!viu || !text) return;
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const camins = caminsSiluetes(doc);
        const ultima = camins[13];
        if (!ultima) return;
        const vb = (doc.documentElement.getAttribute('viewBox') || '0 0 2866 307').trim().split(/[\s,]+/);
        const w = Number(vb[2]) || 2866;
        const h = Number(vb[3]) || 307;
        const tr = ultima.getAttribute('transform') || '';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
          + `<path d="${ultima.getAttribute('d')}"${tr ? ` transform="${tr}"` : ''} fill="#FFFFFF"/></svg>`;
        setMascaraManiga(`data:image/svg+xml,${encodeURIComponent(svg)}`);
      })
      .catch(() => {});
    return () => { viu = false; };
  }, [teOmbraManiga]);

  // Amb `caixes` (la taula de la vista vertical) cada nom va dins la seva caixa
  // grisa, enrasat a la dreta i repartides per tota l'alcada; sense, es la
  // llista de sempre de la filera de la pagina 2.
  if (caixes) {
    // ELS MATEIXOS NOMS QUE LA COLUMNA DE LA P2 HORITZONTAL (28/09/2026, ho ha
    // demanat l'amo): la seva mateixa llista (`CERCADOR_COLLECTIONS`), amb les
    // seves claus i les seves etiquetes. Abans aquesta branca portava una llista
    // escrita a ma i els noms no coincidien.
    const llista = CERCADOR_COLLECTIONS;
    return (
      <div
        data-colleccions-caixes="1"
        style={{
          // LA CAIXA DEL SELECTOR (28/09/2026, ho va demanar l'amo): la mateixa
          // que el bloc BLANC/COLOR/NEGRE (`ESTIL_CAIXA_BLOC`), amb el seu fons i
          // el seu contorn. Els marges propis de la graella hi van al damunt.
          ...ESTIL_CAIXA_BLOC,
          width: '100%',
          height: '100%',
          display: 'grid',
          // LES PROPORCIONS DE LA COLUMNA DE LA P2 HORITZONTAL (28/09/2026, ho
          // ha demanat l'amo): cada caixa fa 22,59 px d'alcada i les nou es
          // reparteixen la columna. Alla la columna fa 128 x 247 amb caixes de
          // 122 x 22,59; aqui l'amplada la mana la casella i l'alcada es la
          // mateixa.
          gridTemplateRows: `repeat(${llista.length}, 22.59px)`,
          alignContent: 'space-between',
          minHeight: 0,
        }}
      >
        {llista.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect?.(key)}
            className="font-oswald"
            aria-current={key === activeKey ? 'true' : undefined}
            style={{
              appearance: 'none',
              boxSizing: 'border-box',
              // LA PASTILLA BLANCA DE LA COLUMNA DE LA P2 HORITZONTAL
              // (28/09/2026, ho ha demanat l'amo): fons blanc, vora #D1D5DB i
              // ombra, i nome's a la colleccio activa. Abans l'activa es marcava
              // amb un gris de fons.
              border: key === activeKey ? '1px solid #D1D5DB' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: '100%',
              minHeight: 0,
              padding: '0 6px',
              borderRadius: '3px',
              // El SELECTOR es la pastilla de fons: nomes la porta la colleccio
              // activa. Cap negreta.
              backgroundColor: key === activeKey ? '#FFFFFF' : 'transparent',
              boxShadow: key === activeKey ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              // LA FONT, AMB EL CRITERI DE LA COLUMNA DE LA P2 HORITZONTAL
              // (28/09/2026, ho ha demanat l'amo): Oswald, 13,5 px, l'activa en
              // regular (400) i la resta en Extra Light (200), en majuscules.
              color: key === activeKey ? '#1A1A1A' : '#6B7280',
              fontFamily: 'inherit',
              fontSize: (isPortraitTablet || isLandscapeTablet) ? 'max(10px, 13.5px)' : `max(10px, ${carrilPx(13.5)})`,
              fontWeight: key === activeKey ? 400 : 200,
              textTransform: 'uppercase',
              lineHeight: 1,
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


  // LA COLUMNA DE COLLECCIONS DE LA PAGINA 2, COM EL SELECTOR
  // (26/09/2026, ho ha dit l'amo: «Has de fer servir el mateix estil, exacte,
  // que el selector» i «El text de la columna, de la mateixa mida»).
  //
  // La referencia es el selector BLANC/COLOR/NEGRE (`FirstContactDibuix00Buttons`
  // / `SelectorQuadratPagina1`), amb les seves xifres EXACTES:
  //
  //   - contenidor: `1px solid #D1D5DB`, radi 6, fons `#F3F4F6`;
  //   - la caixa de l'actiu: fons `#FFFFFF`, `1px solid #D1D5DB`, radi 4 i
  //     `box-shadow: 0 1px 3px rgba(0,0,0,0.12)`, amb 3 px de coixi lateral
  //     (`sliderInset`);
  //   - el text: `font-oswald`, `max(10px, carrilPx(14))`, majuscules, i el
  //     color de l'actiu `#1A1A1A` (els altres, `#6B7280`).
  //
  // Amb nou noms en comptes de tres, les franges son nou i es reparteixen tota
  // l'alcada (`flex: 1`), totes amb `data-colleccions-targeta` perque
  // `scripts/compara-vistes.mjs` segueixi mesurant la columna del top del
  // selector al bottom de la franja (la primera franja dona el top i l'ultima el
  // bottom).
  //
  // Aixo substitueix la primera versio del canvi (`731cf3d` i `adda4c6`), que
  // va interpretar «un sol selector» com una sola pastilla amb nome's el nom
  // actiu centrat: la captura de l'amo diu que la llista sencera es veu i que
  // l'actiu es destaca amb la caixa del selector.
  // ELS COIXOS DE LA COLUMNA, amb les xifres de l'amo: la caixa blanca ha de
  // fer 122 x 22,59 px i la columna 128 x 247. Amb 1 px de vora a la columna,
  // el coixi lateral es 5,5 px i el vertical 2,8 px (247 - 2 = 245; 245 - 9 x
  // 22,59 = 3,7; 3,7 / 2 = 1,85... i amb el vertical que dona 22,59 a cada
  // franja). El `coixInset` es queda per al coixi del text.
  // ELS COIXOS DE LA COLUMNA (26/09/2026, xifres de l'amo):
  //   columna 128 x 247; caixa blanca 122 x 22,59.
  //   amplada: 128,7 - 2 de vora - 2 x 3,35 = 122,0
  //   alcada:  (247 - 2 - 2 x 2,8) / 9 - 2 x 2,8 = 22,6
  const COIX_LATERAL_PX = 2;
  const COIX_VERTICAL_PX = 2;
  // L'alcada de la caixa blanca (22,59 px a 1920: la xifra que ha mesurat
  // l'amo). La franja en fa 27 i el coixi vertical se'n menja 6.
  const ALCADA_CAIXA_PX = 22.59;
  // L'alcada de la caixa COMPTA la vora d'1 px interior: `border-box`.
  const BORA_CAIXA_PX = 1;
  const COIX_COLUMNA_PX = COIX_LATERAL_PX;
  const coixInset = COIX_LATERAL_PX;
  const midaText = (isPortraitTablet || isLandscapeTablet)
    ? 'max(10px, 13.5px)'
    : `max(10px, ${carrilPx(13.5)})`;
  return (
    <div
      style={{
        width: '100%',
        transform,
        paddingLeft,
        // DEL TOP DEL SELECTOR AL BOTTOM DE LA SLIDE (24/09/2026, ho va demanar
        // l'amo): la llista s'estira entre les dues vores. Amb `top: 0` arrencava
        // amb el carrusel i acabava on acabava el seu contingut.
        ...(absolut ? {
          position: 'absolute',
          left: 0,
          right: 0,
          // EL COIXI DE LA CAIXA NO HA DE FER CREIXER LA COLUMNA (26/09/2026):
          // les marques de `compara-vistes` (del top del selector al bottom de
          // la franja) les han de donar les VORES de la columna, i amb 5 px de
          // coixi a dalt i a baix la columna creixia 12 px i se'n sortia (la
          // primera caia 6,01 px del top del selector i l'ultima -5,79 del
          // bottom de la franja). El coixi es descompta de l'ancoratge.
          top: -margeDalt - COIX_COLUMNA_PX,
          bottom: -margeBaix - COIX_COLUMNA_PX,
        } : null),
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        // EL CONTENIDOR, AMB LES XIFRES MESURADES PER L'AMO (26/09/2026):
        // radi exterior 6 px, caixa de 128 x 247 px i caixa blanca de 122 x
        // 22,59. Amb 1 px de vora i 5,5 px de coixi lateral, la caixa blanca fa
        // exactament 122,2 px d'ample (128 - 2 - 11).
        border: '1px solid #D1D5DB',
        borderRadius: '6px',
        backgroundColor: '#F3F4F6',
        // EL COIXI DE LA COLUMNA (26/09/2026), amb les xifres de l'amo:
        // l'offset entre la caixa blanca i la columna es de 3 px, i el contorn
        // de les dues caixes es d'1 px interior (`border`).
        //   amplada de la caixa = 128,7 - 2 (vora) - 2 x 2,35 = 122,0
        //   alcada de la caixa  = franja - 2 x 3
        padding: `${COIX_VERTICAL_PX}px ${COIX_LATERAL_PX}px`,
        overflow: 'hidden',
      }}
    >
      {/* L'OMBRA DE LA MANIGA, DINS DEL SELECTOR I SOTA LA IMATGE (27/09/2026).
          Es una copia DIFOSA de la silueta de la maniga (`mascaraManiga`), amb
          la MATEIXA mida i posicio que la mascara del contingut de la franja
          (103 % x 100 %, centrada a dalt): el nucli queda sota la samarreta i el
          que en surt es nome's la difusio. El `drop-shadow` no serveix perque
          tambe pinta la silueta original, i a la costura s'hi veia una línia
          negra. El retall el fa la propia columna (`overflow: hidden` i radi 6)
          i la capa de la franja (zIndex 4) la tapa: la columna es a zIndex 3. */}
      {ombraManiga && mascaraManiga ? (
        <div
          aria-hidden="true"
          data-maniga-ombra="1"
          style={{
            position: 'absolute',
            left: `${ombraManiga.left}px`,
            top: `${ombraManiga.top}px`,
            width: `${ombraManiga.width}px`,
            height: `${ombraManiga.height}px`,
            pointerEvents: 'none',
            zIndex: 0,
            // ELS NUMEROS SON DECLARATS (28/09/2026): els MATEIXOS que el bloc
            // de la dreta de la p1 (`OMBRA_MANIGA_*`, geometriaMegaslide.js).
            // Abans estaven escrits a ma als dos llocs.
            filter: `blur(${OMBRA_MANIGA_BLUR_PX}px)`,
            transform: `translate(${OMBRA_MANIGA_OFFSET.x}px, ${OMBRA_MANIGA_OFFSET.y}px)`,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: `rgba(0, 0, 0, ${OMBRA_MANIGA_ALFA})`,
              WebkitMaskImage: `url("${mascaraManiga}")`,
              maskImage: `url("${mascaraManiga}")`,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskSize: '103% 100%',
              maskSize: '103% 100%',
              WebkitMaskPosition: '50% 0',
              maskPosition: '50% 0',
            }}
          />
        </div>
      ) : null}
      {CERCADOR_COLLECTIONS.map(({ key, label }) => {
        const activa = key === activeKey;
        return (
          <button
            key={key}
            type="button"
            // La marca que fa servir `scripts/compara-vistes.mjs` per mesurar la
            // columna (del top del selector al bottom de la franja).
            data-colleccions-targeta="1"
            onClick={() => onSelect?.(key)}
            aria-current={activa ? 'true' : undefined}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              // Cada franja es clicable i es reparteix l'alcada de la columna,
              // com les tres caselles del selector (BLANC/COLOR/NEGRE). El
              // `minHeight: 0` es imprescindible: sense, el text marca l'alcada
              // minima de la seva franja i la caixa no pot ser mes baixa que el
              // text (amb 9 noms, la caixa sortia de 26 px en comptes de 22,59).
              // LES NOU FRANGES OMPLEN TOTA LA COLUMNA (26/09/2026, ho ha
              // demanat l'amo: «el text de les colleccions han d'ocupar tota la
              // columna»). Sense `maxHeight`: amb un topall, les nou franges
              // s'aplegaven a dalt i deixaven 50 px buits a baix (mesurat a
              // 768x1024: l'ultima caixa acabava 50 px abans que la franja).
              flex: '1 1 0%',
              minHeight: 0,
              boxSizing: 'border-box',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              // EL TEXT, ENRASAT A LA DRETA (26/09/2026, ho ha dit l'amo:
              // «Linea el text a la dreta»), com la columna de sempre.
              justifyContent: 'flex-end',
              width: '100%',
              // EL TEXT, COMPENSAT (26/09/2026, ho ha demanat l'amo: «Compensa
              // l'offset i el contorn interior del text de les colleccions»):
              // la caixa ha entrat 2 px per l'offset i n'ha guanyat 1 del
              // contorn interior, o sigui que el text va 3 px mes a l'esquerra
              // del que anava. Amb 4 px de coixi dret, el text queda 5 px a
              // dins de la caixa i el radi de la dreta es veu sencer.
              padding: '0 4px 0 6px',
              // LA CAIXA DE L'ACTIU, EXACTAMENT LA DEL SELECTOR: fons blanc,
              // CONTORN D'1 PX interior (ho ha dit l'amo: «els contorns, tant de
              // la caixa com del selector blanc, son 1 px interior»), radi 3 i
              // l'ombra de la casa.
              backgroundColor: activa ? '#FFFFFF' : 'transparent',
              border: activa ? '1px solid #D1D5DB' : '1px solid transparent',
              borderRadius: '3px',
              ...(activa ? { boxShadow: '0 1px 3px rgba(0,0,0,0.12)' } : null),
              // LA CAIXA DE L'ACTIU: el coixi el fa el CONTENIDOR (5,5 px
              // lateral i 2,8 px vertical), o sigui que la caixa fa 122,2 x
              // 22,6 px, que son les xifres que ha mesurat l'amo. Sense
              // `margin`: amb marge, l'amplada no quadra amb la de la columna.
              margin: 0,
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <span
              className="font-oswald"
              style={{
                // LA MIDA I ELS PESOS DE L'AMO: 13,5 px, l'activa en regular
                // (400) i la resta en Extra Light (200).
                fontSize: midaText,
                fontWeight: activa ? 400 : 200,
                textTransform: 'uppercase',
                color: activa ? '#1A1A1A' : '#6B7280',
                pointerEvents: 'none',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                transition: 'color 200ms ease',
              }}
            >
              {etiquetaColleccio(label)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// EL DESPLACAMENT DE LES DUES FILERES DE LA GRAELLA DE LA P1 (28/09/2026). El
// centratge les mou, i ho ha de fer MOVENT LES PECES, no el contenidor: la caixa
// de la graella ancorra el clic de la p1 i el bucle d'alineacio de la p2, i
// moure-la ho desquadrava tot (el clic obria un altre dibuix i la p2 pujava
// 16,7 px). El signe es NEGATIU perque la caixa, sense el marge, ja cau 16 px
// mes avall: amb -16 les files tornen a 93 i 150 (el centre del conjunt, 147, es
// el de la casella COLOR) i la segona filera no toca la franja.
const DESPLACAMENT_FILES_P1_PX = -16;

function CercadorTextRow({ activeCollection, activeSubcollection, selectedStripeItem, hoveredStripeItem, onSelectGroup, onHoverItem, onHoverLeave, onCarouselStep, compact = false, selectedColor = 'white', onSelectColor, onSelectCollection, isPortraitTablet = false, isLandscapeTablet = false, fontBoost = 0, desplacamentVertical = 0, esquerra, midaSelector = 56, alineacioY = 0, onMides = null, ombraManiga = null }) {
  // UNA SOLA PASSADA PER A TOT EL QUE ES MESURA DE LA FILERA (26/09/2026).
  //
  // Abans aixo eren TRES bucles independents en aquest mateix component (les
  // mides de la graella, els marges de la columna de colleccions i la tira de
  // colors), cada un amb el seu efecte, el seu joc de temporitzadors (250 i
  // 400 ms) i els seus observadors. Els tres llegeixen el MATEIX DOM i el
  // MATEIX selector, o sigui que es poden calcular d'una sola instantania; i
  // com que es disposen junts, no pot passar que un valori amb la geometria
  // d'abans que l'altre l'hagi moguda. Ho demana el PLA de neteja del
  // calibratge del megaslide.
  //
  // Les regles:
  //   - la mesura del muntatge es sincrona (abans de pintar) perque la graella
  //     neixi a la mida bona, i hi ha una confirmacio en rAF i una als 400 ms
  //     (just despres de l'animacio d'obertura), quan la geometria ja no es mou;
  //   - l'acumulador de la tira de colors parteix del valor PINTAT, no del que
  //     s'ha decidit: la correccio es idempotent;
  //   - un sol ResizeObserver i un sol listener de `resize`.
  const graellaRef = useRef(null);
  const [mesures, setMesures] = useState({
    midesGraella: null,
    margesEnllacos: { dalt: 0, baix: 0 },
    desnivellColors: 0,
  });
  // El valor PINTAT (s'actualitza DESPRES de pintar): els acumuladors hi
  // arrenquen i la correccio es idempotent encara que dos passos caiguin a la
  // mateixa tasca (vegeu el bucle de les dues files, 25/09/2026).
  const mesuresRef = useRef(mesures);
  useEffect(() => {
    mesuresRef.current = mesures;
  }, [mesures]);
  // L'espai fins a la franja de la mesura anterior (vegeu `sostre`).
  const espaiAnteriorRef = useRef(null);

  useLayoutEffect(() => {
    if (!compact) return undefined;
    const el = graellaRef.current;
    if (!el) return undefined;

    const pagina = el.closest('[data-mega-page-viewport="2"]');
    const franja = pagina?.querySelector('[data-stripe-visual-content="2"]');

    let frame = 0;
    const aplicar = () => {
      const pintat = mesuresRef.current;
      const filera = el.closest('[data-p2-cercador-row]');
      const nou = { ...pintat };
      let canvia = false;

      // 1) LES MIDES DE LA GRAELLA (nomes a l'escriptori: les tauletes tenen la
      //    seva mida fixa). El calcul viu a midesGraella.js, que es una funcio
      //    pura i comprovable sense navegador.
      if (isPortraitTablet || isLandscapeTablet) {
        if (pintat.midesGraella !== null) {
          nou.midesGraella = null;
          canvia = true;
        }
      } else {
        // L'AMPLADA DEL RETALL, DECLARADA (26/09/2026).
        //
        // Era l'ULTIM input mesurat de les mides de la graella (`el.clientWidth`):
        // la resta ja son proporcions del carril. Ara surt de la finestra
        // (`ampladaRetallGraella`) i el DOM nome's la confirma, amb un avis que
        // nome's passa en desenvolupament.
        const ampleDeclarat = ampladaRetallGraella(
          getLayoutViewportWidth(),
          window.innerHeight,
        );
        const ampleAmple = ampleDeclarat != null ? ampleDeclarat : el.clientWidth;
        if (import.meta.env.DEV && ampleDeclarat != null && Math.abs(ampleDeclarat - el.clientWidth) > 0.5) {
          console.warn('[megaslide] el retall declarat no quadra amb el DOM', {
            declarat: ampleDeclarat,
            dom: el.clientWidth,
          });
        }
        const daltGraella = el.getBoundingClientRect().top;
        // EL SOSTRE DE LA FRANJA ES DECLARAT (26/09/2026). Era l'unic input
        // d'aquesta deduccio que depenia de si la imatge de la franja ja era a
        // memoria (la seva alçada i la seva escala s'assenten uns quants
        // fotogrames): ara surt de `topFranjaPagina2`, que nome's depen de la
        // finestra. `daltGraella` (el top del retall) encara es mesura perque
        // penja de l'alineacio amb la pagina 1.
        const sostre = franja
          ? pagina.getBoundingClientRect().top + topFranjaPagina2({
            carril: readRootCssNumber('--hg-mega-w', MEGASLIDE_REFERENCIA_PX),
            escala: readRootCssNumber('--hg-escala-mega', 1),
            ample: typeof window !== 'undefined' ? window.innerWidth : 0,
            alt: typeof window !== 'undefined' ? window.innerHeight : 0,
            isPortraitTablet,
            isLandscapeTablet,
          })
          : null;
        // L'ESPAI FINS A LA FRANJA NOME'S QUAN ES REPETEIX (25/09/2026).
        //
        // La franja triga uns quants fotogrames a assentar-se (la seva escala i
        // la seva alcada) i la filera tambe (el bucle del pare li aplica
        // l'alineacio). Amb una sola mesura, la deduccio d'alçada encongia la
        // graella per un espai que encara no era el de debò: mesurat a 1920, el
        // retall passava de 95,2 a 89,9 px i tornava, i aixo movia la segona
        // filera de dibuixos i la tira de colors. Amb la mesura repetida (dues
        // passades amb el mateix espai), la deduccio nome's s'aplica quan la
        // geometria ja es la bona; i si de debò no hi cap, s'aplica igualment
        // (el repas de 400 ms ho garanteix).
        const espai = sostre != null && daltGraella != null ? sostre - daltGraella : null;
        const espaiConfirmat = espai != null
          && espaiAnteriorRef.current != null
          && Math.abs(espai - espaiAnteriorRef.current) < 0.5;
        espaiAnteriorRef.current = espai;
        const next = midesGraellaCompacta({
          ampleAmple,
          // LA PRIMERA MESURA NO FA LA DEDUCCIO D'ALCADA (25/09/2026): en aquest
          // instant la filera encara no te l'alineacio aplicada i la franja
          // encara s'esta assentant, o sigui que `sostre - daltGraella` es fals.
          // Les mides DECLARADES (amplada i pas dels cercles) ja son les
          // definitives, i la deduccio s'aplica a la passada seguent.
          sostre: espaiConfirmat ? sostre : null,
          daltGraella, isPortraitTablet, isLandscapeTablet,
          escala: readRootCssNumber('--hg-escala-mega', 1),
        });
        const previ = pintat.midesGraella;
        const igual = previ
          && Math.abs(previ.dibuix - next.dibuix) < 0.01
          && Math.abs(previ.gapH - next.gapH) < 0.01
          && Math.abs(previ.gapV - next.gapV) < 0.01;
        if (!igual) {
          nou.midesGraella = next;
          canvia = true;
          // I s'ho diem a qui ens ha de quadrar amb nosaltres (25/09/2026): la
          // filera d'aquesta graella es la referencia amb que el selector
          // Blanc/Color/Negre es centra, i la seva alçada es la de la graella.
          // Amb l'avis, el bucle del pare torna a mesurar dins el mateix commit.
          onMides?.(next);
        }
      }

      // Valors efectius de la graella i del carril: els fan servir els blocs 2 i 3.
      const carrilEf = readRootCssNumber('--hg-mega-w', MEGASLIDE_REFERENCIA_PX);
      const escalaEf = readRootCssNumber('--hg-escala-mega', 1);
      const dibuixEf = nou.midesGraella?.dibuix ?? pintat.midesGraella?.dibuix ?? midaDibuix(isPortraitTablet, isLandscapeTablet);
      const gapVEf = nou.midesGraella?.gapV ?? pintat.midesGraella?.gapV ?? gapVertical(isPortraitTablet, isLandscapeTablet);
      const desplacTopEf = desplacTopSelector({
        ample: typeof window !== 'undefined' ? window.innerWidth : 0,
        alt: typeof window !== 'undefined' ? window.innerHeight : 0,
        isLandscapeTablet,
      });

      // 2) LA TIRA DE COLORS (14x1), CENTRADA AMB LA CEL·LA NEGRE DEL SELECTOR.
      //    L'amo ho va demanar el 24/09/2026: cada peca cau sobre la cel·la del
      //    selector que li toca. El selector no es mou: el que puja son les
      //    barres, els px que els falten.
      //
      //    DECLARAT (26/09/2026): abans es mesurava el centre de la tira i el de
      //    la cel·la NEGRE i s'anaven igualant. Ara surt de
      //    `desnivellColorsGraella`, amb les mides del carril i del selector.
      {
        // La separacio entre barres va amb el mateix factor que el dibuix (vegeu
        // el render): amb la mida base, no amb la del carrusel.
        const factorDibuixEf = (nou.midesGraella && nou.midesGraella.dibuix != null)
          ? dibuixEf / midaDibuix(isPortraitTablet, isLandscapeTablet)
          : 1;
        const colorGapEf = colorGap(isPortraitTablet, isLandscapeTablet) * factorDibuixEf;
        // L'amplada de la tira es la de la columna de la graella menys la
        // reserva de les fletxes (que nome's hi es a l'escriptori).
        const reservaFletxes = (!isPortraitTablet && !isLandscapeTablet)
          ? GRAELLA_DRETA_FLETXES_CARRIL_PX * escalaEf
          : 0;
        const ampleRetallColors = ampladaColumnaGraella({
          carril: carrilEf, midaSelector, escala: escalaEf,
        }) - reservaFletxes;
        const declarat = desnivellColorsGraella({
          ampleRetall: ampleRetallColors,
          dibuix: dibuixEf,
          gapV: gapVEf,
          carril: carrilEf,
          midaSelector,
          escala: escalaEf,
          colorGapPx: colorGapEf,
        });
        if (Math.abs(declarat - pintat.desnivellColors) >= 0.01) {
          nou.desnivellColors = declarat;
          canvia = true;
        }
      }

      // 3) ELS MARGES DE LA COLUMNA DE COLLECCIONS. L'amo ho va demanar el
      //    24/09/2026 («el bottom de la stripe»): la columna va del top del
      //    selector al bottom de la tinta de la franja de samarretes.
      if (filera && franja) {
        const f = filera.getBoundingClientRect();
        // EL MARGEDALT ES DECLARA (26/09/2026): es el `desplacTop` menys el
        // centratge del selector; abans es mesurava el top del selector.
        const scyEf = centratgeSelectorY({
          midaSelector, escala: escalaEf, dibuix: dibuixEf, gapV: gapVEf, carril: carrilEf, desplacTop: desplacTopEf,
        });
        // ELS DOS AJUSTOS DECLARATS (27/09/2026): la columna, alineada pel top
        // amb el selector B/C/N i pel bottom amb la franja. Vegeu
        // `COLUMNA_TOP_AJUST_PX`.
        const dalt = desplacTopEf - scyEf - COLUMNA_TOP_AJUST_PX;
        // EL SOSTRE DE LA FRANJA TAMBE ES DECLARAT (26/09/2026): el seu top ja
        // no es llegeix del DOM (`topFranjaPagina2`: el coixi del panell mes la
        // reserva de la graella vella mes els desplaçaments de disseny). De la
        // franja nome's es mesura la SEVA alcada, que es la de la tira escalada
        // al carril: aixo es el que el preescalfat assegura abans d'obrir el
        // panell (vegeu `FullWideSlideHeader`).
        const topDeclarat = topFranjaPagina2({
          carril: carrilEf,
          escala: escalaEf,
          ample: typeof window !== 'undefined' ? window.innerWidth : 0,
          alt: typeof window !== 'undefined' ? window.innerHeight : 0,
          isPortraitTablet,
          isLandscapeTablet,
        });
        const baix = (pagina.getBoundingClientRect().top + topDeclarat + franja.getBoundingClientRect().height) - f.bottom - COLUMNA_BAIX_AJUST_PX;
        if (Math.abs(pintat.margesEnllacos.dalt - dalt) >= 0.01
          || Math.abs(pintat.margesEnllacos.baix - baix) >= 0.5) {
          nou.margesEnllacos = { dalt, baix };
          canvia = true;
        }
      }

      if (canvia) setMesures(nou);
    };
    const mesura = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(aplicar);
    };

    // La primera mesura es sincrona (useLayoutEffect encara es abans de pintar):
    // aixi la graella neix a la mida bona i el pare rep l'avis dins el mateix
    // commit. La confirmacio va en rAF (abans del primer pintat, despres dels
    // efectes de layout) i als 400 ms.
    aplicar();
    mesura();
    const repas = window.setTimeout(mesura, 400);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mesura) : null;
    observer?.observe(el);
    if (pagina) observer?.observe(pagina);
    if (franja) observer?.observe(franja);
    window.addEventListener('resize', mesura);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(repas);
      observer?.disconnect();
      window.removeEventListener('resize', mesura);
    };
    // `alineacioY` ES UNA DEPENDENCIA DE DEBÒ (25/09/2026): el bucle del pare
    // mou aquesta filera amb `top` i els efectes de layout dels fills van ABANS
    // que els del pare, o sigui que la primera mesura el veu a baix. Quan el
    // pare aplica el desplaçament, aquesta passada es torna a fer DINS el mateix
    // commit (abans de pintar) i el primer fotograma ja surt bé.
  }, [compact, isPortraitTablet, isLandscapeTablet, alineacioY, midaSelector, onMides]);


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
    const dibuixBasePx = mesures.midesGraella?.dibuix ?? midaDibuix(isPortraitTablet, isLandscapeTablet);
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
    const factorDibuix = (mesures.midesGraella && mesures.midesGraella.dibuix != null)
      ? dibuixBasePx / midaDibuix(isPortraitTablet, isLandscapeTablet)
      : 1;
    const colorGapPx = colorGap(isPortraitTablet, isLandscapeTablet) * factorDibuix;
    // EL MATEIX GAP QUE LA P1, A L'ESCRIPTORI (28/09/2026). En Marc: «Fes la p2
    // amb el mateix gap que la p1» (54 px). Aqui el gap de la p2 ve d'una MESURA
    // (`mesures.midesGraella.gapH`), i per aixo canviar la constant no feia res:
    // a l'escriptori es fixa a 54 i a les tauletes (vertical i apaissada) es
    // respecta el que hi ha.
    const gapH = (!isPortraitTablet && !isLandscapeTablet)
      ? 54
      : (mesures.midesGraella?.gapH ?? gapHorizontal(isPortraitTablet, isLandscapeTablet));
    const gapV = mesures.midesGraella?.gapV ?? gapVertical(isPortraitTablet, isLandscapeTablet);
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
          gridTemplateColumns: `minmax(0, 1fr) ${carrilLane(GRAELLA_COLUMNA_DRETA_CARRIL_PX)}`,
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
          // EL GAP ENTRE LA GRAELLA I LA COLUMNA, DE 10 px (26/09/2026, ho va
          // demanar l'amo: «Deixa 10 px de gap amb les fletxes»). Es una mida
          // del carril (`GRAELLA_GAP_COLUMNES_PX`): amb `carrilLane` tambe
          // s'encongeix a tauleta. Abans eren 20 px fixos.
          columnGap: carrilLane(GRAELLA_GAP_COLUMNES_PX),
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
            marginTop={-mesures.desnivellColors}
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
            margeDalt={mesures.margesEnllacos.dalt}
            margeBaix={mesures.margesEnllacos.baix}
            activeKey={activeKey}
            onSelect={onSelectCollection}
            isPortraitTablet={isPortraitTablet}
            isLandscapeTablet={isLandscapeTablet}
            ombraManiga={ombraManiga}
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
