import { useLayoutEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { getSafeBelt } from '@/utils/layoutMetrics';

// =============================================================================
//  Pàgina de col·lecció — pauta de 4 columnes
// =============================================================================
//
//  Directrius constructives:
//    1. Les targetes es construeixen amb files senceres.
//    2. Una targeta comença al top de la primera fila i acaba al bottom de
//       l'última.
//    3. Cada targeta fa 15 files de llargada × 1 columna d'amplada.
//    4. La primera targeta comença a la fila 15.
//    5. Cada graella de targetes és 1 fila × 4 columnes (4 targetes en línia).
//    6. Cada graella està separada de la següent per 5 files senceres buides.
//
//  Rows que ocupen les graelles (CSS grid, indexat per línies):
//    Graella 1 → 15 / 30
//    Graella 2 → 35 / 50
//    Graella 3 → 55 / 70
//    Graella 4 → 75 / 90
//
// =============================================================================

const PAUTA_COLS = 4;

const TITLE_ROW_START = 1;
const TITLE_ROW_END = 15; // les files 1..14 són el títol (la 15 ja és la 1a targeta)

const CARD_HEIGHT_ROWS = 15;
const CARD_GAP_ROWS = 5;
const FIRST_CARD_ROW = 15;
const NUM_CARD_GRIDS = 4;

const LAST_CARD_ROW_END =
  FIRST_CARD_ROW + NUM_CARD_GRIDS * CARD_HEIGHT_ROWS + (NUM_CARD_GRIDS - 1) * CARD_GAP_ROWS;
const PAUTA_ROWS = LAST_CARD_ROW_END - 1; // l'última línia és exclusiva → 90

// Mateixos paràmetres que /constructor/tdp
const PAUTA_GUTTER_X = '22.5px';
const PAUTA_GUTTER_Y = '3px';
// Igual que TDP: la primera fila no és sencera (0.7fr); la resta són 1fr.
const PAUTA_FIRST_ROW_SCALE = 0.7;
const PAUTA_ROWS_TEMPLATE = `${PAUTA_FIRST_ROW_SCALE}fr repeat(${PAUTA_ROWS - 1}, 1fr)`;
// 3 gutters de 22.5 px entre 4 columnes = 67.5 px
const PAUTA_COLUMNS_TEMPLATE = 'repeat(4, minmax(0, calc((100% - 67.5px) / 4)))';

// Aspect ratio del canvas del mockup `00 COLLECCIO.png` (2642 × 6708).
// La graella se sincronitza a aquest ratio perquè cada fila tingui una
// alçada coherent — sense això les files col·lapsarien al mínim quan les
// targetes són buides i les proporcions es perdrien.
const CANVAS_ASPECT_W = 2642;
const CANVAS_ASPECT_H = 6708;

const TDP_PAGE_TOP_OFFSET = '33px';
const TDP_PAGE_LEFT_OFFSET = '0px';

// Genera les 16 targetes blanques seguint les directrius. Cada targeta es
// posiciona només per `gridRow` i `gridColumn` — el contingut intern es
// definirà més endavant.
function buildCards() {
  const cards = [];
  for (let g = 0; g < NUM_CARD_GRIDS; g += 1) {
    const rowStart = FIRST_CARD_ROW + g * (CARD_HEIGHT_ROWS + CARD_GAP_ROWS);
    const rowEnd = rowStart + CARD_HEIGHT_ROWS;
    for (let c = 1; c <= PAUTA_COLS; c += 1) {
      cards.push({
        id: `card-g${g + 1}-c${c}`,
        gridIndex: g + 1,
        col: c,
        rowStart,
        rowEnd,
        color: 'white',
      });
    }
  }
  return cards;
}

const CARDS = buildCards();

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    const belt = getSafeBelt({ maxContent: 1400, sideMargin: 76, minContent: 320 });
    document.documentElement.style.setProperty('--hg-tdp-xL', `${belt.left}px`);
    document.documentElement.style.setProperty('--hg-tdp-xR', `${belt.right}px`);
  } catch {
    // ignore: belt CSS vars are recomputed on mount
  }
}

function ColleccioPage({ pautaEnabled = false, tableEnabled = false }) {
  const pautaRows = useMemo(
    () => Array.from({ length: PAUTA_ROWS }, (_, index) => index + 1),
    []
  );
  const pautaCells = useMemo(
    () => Array.from({ length: PAUTA_ROWS * PAUTA_COLS }, (_, index) => ({
      row: Math.floor(index / PAUTA_COLS) + 1,
      col: (index % PAUTA_COLS) + 1,
    })),
    []
  );

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const root = document.documentElement;

    const apply = () => {
      const belt = getSafeBelt({ maxContent: 1400, sideMargin: 76, minContent: 320 });
      root.style.setProperty('--hg-tdp-xL', `${belt.left}px`);
      root.style.setProperty('--hg-tdp-xR', `${belt.right}px`);
    };

    apply();
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
      root.style.removeProperty('--hg-tdp-xL');
      root.style.removeProperty('--hg-tdp-xR');
    };
  }, []);

  const beltContainerStyle = {
    position: 'relative',
    left: '50%',
    width: 'calc(var(--belt2-xR, var(--hg-tdp-xR, 100vw)) - var(--belt2-xL, var(--hg-tdp-xL, 0px)))',
    transform: `translateX(calc(-50% + ${TDP_PAGE_LEFT_OFFSET}))`,
    paddingTop: TDP_PAGE_TOP_OFFSET,
    paddingBottom: '64px',
  };

  const gridStyle = {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: PAUTA_COLUMNS_TEMPLATE,
    gridTemplateRows: PAUTA_ROWS_TEMPLATE,
    columnGap: PAUTA_GUTTER_X,
    rowGap: PAUTA_GUTTER_Y,
    // L'aspect ratio fixa l'alçada total a partir de l'amplada (mateix
    // canvas que el mockup `00 COLLECCIO.png`). Així cada fila té una alçada
    // estable proporcional al pauta-grid.
    aspectRatio: `${CANVAS_ASPECT_W} / ${CANVAS_ASPECT_H}`,
  };

  return (
    <main className="relative min-h-screen bg-background">
      <Helmet>
        <title>Col·lecció · Constructor | Higgins Gràfic</title>
        <meta name="description" content="Constructor de la pàgina de col·lecció (4 columnes)." />
      </Helmet>

      <div style={beltContainerStyle}>
        <div style={gridStyle}>
          {/* Pauta: enumeració de les 90 files al canal entre col 1 i col 2 */}
          {pautaEnabled ? (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 'calc((100% - 67.5px) / 4 + 11.25px - 12px)',
                top: 0,
                bottom: 0,
                width: '24px',
                display: 'grid',
                gridTemplateRows: PAUTA_ROWS_TEMPLATE,
                rowGap: PAUTA_GUTTER_Y,
                zIndex: 4,
                pointerEvents: 'none',
              }}
            >
              {pautaRows.map((rowNumber) => (
                <div
                  key={`colleccio-pauta-row-${rowNumber}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(71, 80, 89, 0.58)',
                    fontFamily: 'Roboto Condensed, sans-serif',
                    fontSize: '10px',
                    lineHeight: 1,
                  }}
                >
                  {rowNumber}
                </div>
              ))}
            </div>
          ) : null}

          {/* Taula de cel·les pauta×columna (debug) */}
          {tableEnabled
            ? pautaCells.map(({ row, col }) => (
                <div
                  key={`colleccio-cell-${row}-${col}`}
                  style={{
                    gridColumn: `${col} / ${col + 1}`,
                    gridRow: `${row} / ${row + 1}`,
                    border: '1px solid rgba(31, 124, 255, 0.18)',
                    backgroundColor: 'rgba(31, 124, 255, 0.03)',
                    boxSizing: 'border-box',
                    zIndex: 1,
                  }}
                />
              ))
            : null}

          {/* Bloc títol "00 COL·LECCIÓ" — files 1..14, totes 4 columnes */}
          <div
            style={{
              gridColumn: `1 / ${PAUTA_COLS + 1}`,
              gridRow: `${TITLE_ROW_START} / ${TITLE_ROW_END}`,
              position: 'relative',
              zIndex: 3,
            }}
          >
            {/* "00" decoratiu */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                top: '-12px',
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 700,
                fontSize: '180px',
                lineHeight: 0.85,
                color: 'rgba(180, 200, 220, 0.55)',
                letterSpacing: '-6px',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              00
            </span>
            <h1
              style={{
                position: 'relative',
                margin: 0,
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 800,
                fontSize: '110px',
                lineHeight: 1,
                letterSpacing: '-2px',
                color: '#0a0a0a',
                textTransform: 'uppercase',
                paddingLeft: '90px',
              }}
            >
              COL·LECCIÓ
            </h1>
          </div>

          {/* Targetes — 4 graelles × 4 targetes = 16 targetes blanques */}
          {CARDS.map((card) => (
            <div
              key={card.id}
              data-card-id={card.id}
              data-card-grid={card.gridIndex}
              style={{
                gridColumn: `${card.col} / ${card.col + 1}`,
                gridRow: `${card.rowStart} / ${card.rowEnd}`,
                backgroundColor: card.color,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxSizing: 'border-box',
                zIndex: 2,
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default ColleccioPage;
