import React, { useLayoutEffect, useRef, useState } from 'react';
import { CERCADOR_COLLECTIONS, CERCADOR_COLORS } from './CercadorTopBar.jsx';
// La geometria de la graella viu a midesGraella.js perquè també la fa servir
// el mòdul de mesura única. Aquí només es consumeix.
import {
  GRAELLA_COLUMNES, GRAELLA_FILES, GRAELLA_ESQUERRA_LANDSCAPE,
  midaDibuix, gapHorizontal, gapVertical, colorMida, colorGap,
  midesGraellaCompacta,
  MARGE_ESQUERRA_DIBUIXOS_ESCRIPTORI_PX,
} from './midesGraella.js';
import { carrilPct, carrilLane, carrilPx, readRootCssNumber } from '../../utils/layoutMetrics.js';
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
  isPortraitTablet = false,
  isLandscapeTablet = false,
  fontBoost = 0,
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
  const ampleTira = carrusel ? (items.length * pas) / 2 + pas : 0;
  const alcadaCarrusel = carrusel ? alcadaFila * 2 - gapV : 0;

  // EL CARRUSEL ES MOU ARROSSEGANT, I AL DESKTOP TAMBE AMB FLETXES.
  //
  // LES BARRES DE DESPLAÇAMENT ESTAN PROHIBIDES en aquest projecte (constitucio,
  // regla 16): o sigui que el contenidor va amb `overflow: hidden` i el
  // desplac,ament el governa aquest estat. El gest es d'ARROSSEGAR (pointer
  // events, que tambe son els del dit) i, al desktop, dos botons de fletxa
  // junts en un costat; a les tauletes no hi son (ho va dir l'amo).
  const [desplac, setDesplac] = useState(0);
  const [maxDesplac, setMaxDesplac] = useState(0);
  const arrossegant = useRef(null);
  const haArrossegat = useRef(false);
  const ambFletxes = carrusel && !isPortraitTablet && !isLandscapeTablet;
  const desplacEf = Math.max(0, Math.min(maxDesplac, desplac));
  const caixaCarrusel = () => graellaRef?.current || null;

  useLayoutEffect(() => {
    if (!carrusel) return undefined;
    const mesura = () => {
      const el = caixaCarrusel();
      if (!el) return;
      setMaxDesplac(Math.max(0, ampleTira - el.clientWidth));
    };
    mesura();
    window.addEventListener('resize', mesura);
    return () => window.removeEventListener('resize', mesura);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrusel, ampleTira]);

  const frena = (v) => Math.max(0, Math.min(maxDesplac, v));
  const unaPagina = () => Math.max(1, Math.round((caixaCarrusel()?.clientWidth || 0) * 0.8));

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
    setDesplac(frena(a.inici - dx));
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
          width: costat,
          height: costat,
          // Al carrusel cada peca es col·loca a mà: mig pas a la dreta de
          // l'anterior i, les senars, una fila mes avall.
          ...(carrusel ? {
            position: 'absolute',
            left: `${(i * pas) / 2}px`,
            top: `${(i % 2) * alcadaFila}px`,
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
    return (
      <div
        ref={graellaRef}
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
          transform: `translateX(${-desplacEf}px)`,
          willChange: 'transform',
        }}>
          {items.map(pintaItem)}
        </div>
        {ambFletxes ? (
          <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: carrilPx(56), zIndex: 5 }}>
            <FirstContactDibuix09Buttons
              onPrev={() => setDesplac((v) => frena(v - unaPagina()))}
              onNext={() => setDesplac((v) => frena(v + unaPagina()))}
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
            // Una mica mes petit a l'escriptori (11 px) i amb aire entre
            // linies: amb `lineHeight: 1` les linies quedaven juntes.
            fontSize: (isPortraitTablet || isLandscapeTablet) ? 'max(10px, 8px)' : `max(10px, ${carrilPx(11)})`,
            lineHeight: 1.5,
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
  caixes = false,
  linia = false,
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
            {label}
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
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          columnGap: carrilLane(18),
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
              fontSize: (isPortraitTablet || isLandscapeTablet) ? '11px' : `max(10px, ${carrilPx(11)})`,
              fontWeight: key === activeKey ? 700 : 300,
              lineHeight: 1.2,
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
            fontSize: (isPortraitTablet || isLandscapeTablet) ? 'max(10px, 8px)' : `max(10px, ${carrilPx(11)})`,
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

function CercadorTextRow({ activeCollection, activeSubcollection, selectedStripeItem, hoveredStripeItem, onSelectGroup, onHoverItem, onHoverLeave, compact = false, selectedColor = 'white', onSelectColor, onSelectCollection, isPortraitTablet = false, isLandscapeTablet = false, fontBoost = 0, desplacamentVertical = 0, esquerra }) {
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
    const dibuixBasePx = midesGraella?.dibuix ?? midaDibuix(isPortraitTablet, isLandscapeTablet);
    // LA PECA DEL CARRUSEL FA 1,5 COPS LA D'ABANS (24/09/2026).
    //
    // Es la mesura que surt de la regla de l'amo: les DUES files intercalades
    // noves ocupen el que abans ocupaven TRES files de la graella. Com que la
    // peca es quadrada, tambe es 1,5 cops mes ampla, i per aixo se'n veuen
    // menys i el conjunt es una tira que es desplac,a.
    const dibuixPx = dibuixBasePx * 1.5;
    // Els cercles de color es calibren amb el mateix factor que els dibuixos:
    // si la graella s'encongeix (mobil, desktop estret), els cercles
    // l'acompanyen i les files continuen caient les unes sobre les altres.
    //
    // AMB LA MIDA BASE, NO AMB LA DEL CARRUSEL: la graella de colors 4x4 es
    // queda com estava (l'amo ho va dir), i si el factor prengues la mida nova
    // els cercles creixerien un 50 % de regal.
    const factorDibuix = (midesGraella && midesGraella.dibuix != null)
      ? dibuixBasePx / midaDibuix(isPortraitTablet, isLandscapeTablet)
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
          gridTemplateColumns: 'minmax(0, 1fr) max-content',
          gridTemplateRows: 'auto auto',
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
          carrusel
          activeCollection={activeCollection}
          activeSubcollection={activeSubcollection}
          onSelectGroup={onSelectGroup}
          onHoverItem={onHoverItem}
          onHoverLeave={onHoverLeave}
          isPortraitTablet={isPortraitTablet}
          isLandscapeTablet={isLandscapeTablet}
          fontBoost={fontBoost}
        />

        {/* LA GRAELLA 4x4, A LA DRETA DEL CARRIL: columna 2, les dues files.
            Ja no porta cap desplac,ament: el seu lloc es la vora dreta. */}
        <div style={{ gridColumn: '2', gridRow: '1 / span 2', minWidth: 0 }}>
          <CercadorColorsGrid
            selectedColor={selectedColor}
            onSelectColor={onSelectColor}
            cerclePx={cerclePx}
            colorGapPx={colorGapPx}
            isPortraitTablet={isPortraitTablet}
            isLandscapeTablet={isLandscapeTablet}
          />
        </div>

        {/* LA LINIA DE COLLECCIONS, A SOTA DEL CARRUSEL (fila 2 de la primera
            columna): entre el selector i la graella 4x4. Ja no es una columna a
            la dreta de tot, i per aixo no porta ni transform ni el coixi que
            compensava la graella de colors. */}
        <div style={{ gridColumn: '1', gridRow: '2', minWidth: 0 }}>
          <CercadorColleccionsColumna
            linia
            activeKey={activeKey}
            onSelect={onSelectCollection}
            alcadaFilaLlista={alcadaFilaLlista}
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
