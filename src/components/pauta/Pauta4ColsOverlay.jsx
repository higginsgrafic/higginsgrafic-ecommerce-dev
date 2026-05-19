import { useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DEV_LAYER_Z } from '@/components/dev/DevPortal';
import { getSafeBelt } from '@/utils/layoutMetrics';

// =============================================================================
//  Pauta 4 columnes — overlay reutilitzable
// =============================================================================
//
//  Renderitza la pauta de 4 columnes encaixada exactament dins de belt2:
//    left  = var(--belt2-xL)   (fallback: --hg-tdp-xL → safe-belt)
//    right = var(--belt2-xR)   (fallback: --hg-tdp-xR → safe-belt)
//
//  La graella interna (4 cols × N files) ocupa el 100% de l'amplada del belt:
//    cols = repeat(4, (100% - 3·gutterX) / 4)
//    files = primera fila = firstRowScale·fr; la resta 1fr.
//
//  El contenidor té `aspect-ratio: canvasW / canvasH` perquè cada fila tingui
//  alçada estable encara que els fills siguin buits.
//
//  Es pot usar com a OVERLAY pur (pointerEvents='none') o com a graella
//  productiva on s'hi posicionen targetes via `gridRow` / `gridColumn`.
//
// =============================================================================

const PAUTA4_DEFAULTS = {
  numCols: 4,
  numRows: 90,
  firstRowScale: 1,
  gutterX: '22.5px',
  gutterY: '3px',
  canvasAspect: [2642, 6708],
  topOffset: '33px',
  bottomPadding: '64px',
  leftOffset: '0px',
};

// Inicialitza les CSS vars `--hg-tdp-xL/xR` el més aviat possible perquè
// qualsevol consumidor (incloent aquest mateix overlay) pugui caure-hi si
// `--belt2-xL/xR` no estan publicades.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    const belt = getSafeBelt({ maxContent: 1400, sideMargin: 76, minContent: 320 });
    document.documentElement.style.setProperty('--hg-tdp-xL', `${belt.left}px`);
    document.documentElement.style.setProperty('--hg-tdp-xR', `${belt.right}px`);
  } catch {
    // ignore: les vars es recalculen al muntar el primer overlay.
  }
}

// Mesura reactiva del belt segur. La pauta NO depèn de cap CSS var de belt2;
// fa la seva pròpia mesura amb getSafeBelt() i la refresca al resize.
// Continua publicant `--hg-tdp-xL/xR` per compatibilitat amb consumidors externs.
function useReactiveBelt() {
  const compute = () => {
    if (typeof window === 'undefined') return { left: 0, right: 0 };
    return getSafeBelt({ maxContent: 1400, sideMargin: 76, minContent: 320 });
  };
  const [belt, setBelt] = useState(compute);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const root = document.documentElement;

    const apply = () => {
      const next = getSafeBelt({ maxContent: 1400, sideMargin: 76, minContent: 320 });
      root.style.setProperty('--hg-tdp-xL', `${next.left}px`);
      root.style.setProperty('--hg-tdp-xR', `${next.right}px`);
      setBelt((prev) => (prev.left === next.left && prev.right === next.right ? prev : next));
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
    };
  }, []);

  return belt;
}

/**
 * Pauta 4 columnes — encaix exacte dins belt2.
 *
 * Modes d'ús:
 *   - Overlay pur:           <Pauta4ColsOverlay overlay pautaEnabled tableEnabled />
 *   - Graella productiva:    <Pauta4ColsOverlay>{cards}</Pauta4ColsOverlay>
 *
 * Props clau:
 *   - overlay         Si true, es posiciona absolute sobre tota la pàgina i és
 *                     no-interactiu. Si false, viu en el flux i es centra.
 *   - pautaEnabled    Mostra els números 1..N al canal entre col 1 i col 2.
 *   - tableEnabled    Mostra una malla de cel·les (debug visual).
 *   - children        Contingut posicionat amb `gridRow` / `gridColumn`.
 */
export default function Pauta4ColsOverlay({
  overlay = false,
  pautaEnabled = false,
  tableEnabled = false,
  numCols = PAUTA4_DEFAULTS.numCols,
  numRows = PAUTA4_DEFAULTS.numRows,
  firstRowScale = PAUTA4_DEFAULTS.firstRowScale,
  gutterX = PAUTA4_DEFAULTS.gutterX,
  gutterY = PAUTA4_DEFAULTS.gutterY,
  canvasAspect = PAUTA4_DEFAULTS.canvasAspect,
  topOffset = PAUTA4_DEFAULTS.topOffset,
  bottomPadding = PAUTA4_DEFAULTS.bottomPadding,
  leftOffset = PAUTA4_DEFAULTS.leftOffset,
  zIndex = overlay ? DEV_LAYER_Z.pauta : undefined,
  pautaOpacity = 1,
  tableOpacity = 1,
  className,
  style,
  children,
}) {
  const belt = useReactiveBelt();

  // 3 gutters entre 4 cols. Si numCols canvia, recalculem.
  const gutterCount = numCols - 1;
  const totalGutterCalc = `calc(${gutterCount} * ${gutterX})`;
  const columnsTemplate = `repeat(${numCols}, minmax(0, calc((100% - ${totalGutterCalc}) / ${numCols})))`;
  // Files estrictament proporcionals al canvas. `minmax(0, 1fr)` elimina el
  // mínim implícit `auto` de `1fr` que permetria al contingut expandir un
  // row track i, en conseqüència, deformar la pauta segons el contingut de
  // cada pàgina. La pauta és una plantilla universal: files i columnes
  // tenen sempre les mateixes proporcions, independentment del contingut.
  const rowsTemplate = `minmax(0, ${firstRowScale}fr) repeat(${numRows - 1}, minmax(0, 1fr))`;

  const pautaRows = useMemo(
    () => Array.from({ length: numRows }, (_, index) => index + 1),
    [numRows]
  );
  const pautaCells = useMemo(() => {
    if (!tableEnabled) return [];
    return Array.from({ length: numRows * numCols }, (_, index) => ({
      row: Math.floor(index / numCols) + 1,
      col: (index % numCols) + 1,
    }));
  }, [numCols, numRows, tableEnabled]);

  // Belt L/R: mesura pròpia (independent de belt2). Belt2 segueix existint com a
  // overlay de debug, però no influeix en aquesta pauta.
  const beltLeft = `${belt.left}px`;
  const beltWidth = `${Math.max(0, belt.right - belt.left)}px`;

  // Posicionament:
  //   - overlay  → ancorat al viewport (fixed + left/width), independent del
  //                flux i dels possibles stacking/containing blocks del pare.
  //   - flux     → centratge dur (50% + translateX(-50%)) com a TdpPage. Fix
  //                respecte el centre del pare; si el pare és viewport-wide
  //                queda centrat al viewport. És més robust que `marginLeft`
  //                quan el pare té offsets/padding.
  // `overflowX: 'clip'` al wrapper extern impedeix qualsevol desbordament
  // horitzontal lateral (la garantia que abans donava `overflow: hidden` al
  // grid intern), però NO retalla verticalment: el contingut que sobresurt
  // d'una cel·la pot mostrar-se sense afectar la pauta.
  const containerStyle = overlay
    ? {
        position: 'fixed',
        top: 0,
        left: beltLeft,
        width: beltWidth,
        paddingTop: topOffset,
        paddingBottom: bottomPadding,
        zIndex,
        pointerEvents: 'none',
        boxSizing: 'border-box',
        overflowX: 'clip',
      }
    : {
        position: 'relative',
        left: '50%',
        width: beltWidth,
        transform: `translateX(calc(-50% + ${leftOffset}))`,
        paddingTop: topOffset,
        paddingBottom: bottomPadding,
        boxSizing: 'border-box',
        zIndex,
        overflowX: 'clip',
      };

  const gridStyle = {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: columnsTemplate,
    gridTemplateRows: rowsTemplate,
    columnGap: gutterX,
    rowGap: gutterY,
    aspectRatio: `${canvasAspect[0]} / ${canvasAspect[1]}`,
    width: '100%',
    boxSizing: 'border-box',
    // El contingut que excedeixi la mida d'una cel·la pot sobresortir
    // visualment sense afectar la pauta (que té files estrictes via
    // `minmax(0, 1fr)`). Evitem `overflow: hidden` perquè retallaria
    // contingut que sobresurt verticalment. Per al desbordament horitzontal
    // (lateral fora del belt), apliquem `overflow-x: clip` al wrapper extern.
    overflow: 'visible',
  };

  // Posició dels números: al centre del primer canal entre col 1 i col 2.
  // canal-x = col1_width + gutterX/2, on col1_width = (100% - 3·gutterX)/4.
  // Centrem una caixa de 24px amb -12px.
  const numbersLeft = `calc((100% - ${totalGutterCalc}) / ${numCols} + (${gutterX}) / 2 - 12px)`;

  const markup = (
    <div className={className} style={{ ...containerStyle, ...style }} data-pauta="4-cols">
      <div style={gridStyle} data-pauta-grid>
        {tableEnabled ? (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: numbersLeft,
              top: 0,
              bottom: 0,
              width: '24px',
              display: 'grid',
              gridTemplateRows: rowsTemplate,
              rowGap: gutterY,
              opacity: tableOpacity,
              zIndex: 4,
              pointerEvents: 'none',
            }}
          >
            {pautaRows.map((rowNumber) => (
              <div
                key={`p4-row-${rowNumber}`}
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

        {tableEnabled
          ? pautaCells.map(({ row, col }) => (
              <div
                key={`p4-cell-${row}-${col}`}
                style={{
                  gridColumn: `${col} / ${col + 1}`,
                  gridRow: `${row} / ${row + 1}`,
                  border: '1px solid rgba(31, 124, 255, 0.18)',
                  backgroundColor: 'rgba(31, 124, 255, 0.03)',
                  boxSizing: 'border-box',
                  opacity: tableOpacity,
                  zIndex: 1,
                }}
              />
            ))
          : null}

        {children}
      </div>
    </div>
  );

  if (overlay && typeof document !== 'undefined') {
    return createPortal(markup, document.body);
  }

  return markup;
}
