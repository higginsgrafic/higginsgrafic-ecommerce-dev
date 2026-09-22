import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DEV_LAYER_Z } from '@/components/dev/DevPortal';

// =============================================================================
//  Pauta 4 columnes — overlay reutilitzable
// =============================================================================
//
//  Renderitza la pauta de 4 columnes encaixada exactament dins del carril:
//    left  = --hg-tdp-xL
//    right = --hg-tdp-xR
//
//  Aquestes dues variables NO es calculen aqui: les declara
//  `src/foundation.css` a partir de `--contingut-max`, que es
//  `min(70.3125vw, 1350px)`. Abans les publicava aquest fitxer amb
//  `getSafeBelt()` i un `MutationObserver`, i el resultat era el mateix numero
//  (1350/1920 de la finestra) amb una mica mes de codi i una mica menys de
//  certesa.
//
//  La graella interna (4 cols × N files) ocupa el 100% de l'amplada del carril:
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

// El carril ja no es mesura des d'aquí. Es declara a `src/foundation.css`:
//   --contingut-max: min(70.3125vw, 1350px)
//   --hg-tdp-xL: calc((100vw - var(--contingut-max)) / 2)
//   --hg-tdp-xR: calc((100vw + var(--contingut-max)) / 2)
// Aquest fitxer només les llegeix, i per tant no cal cap efecte ni cap estat.

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
  innerRef, // Ref per exposar el contenidor del grid
}) {
  // Belt L/R: les variables declarades a `foundation.css`. Abans eren una
  // mesura feta des de JavaScript; ara són dues expressions del full d'estils.
  const beltLeft = 'var(--hg-tdp-xL)';
  const beltWidth = 'var(--contingut-max)';
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
        position: 'absolute',
        top: 0,
        left: beltLeft,
        width: beltWidth,
        paddingTop: topOffset,
        paddingBottom: bottomPadding,
        zIndex,
        pointerEvents: 'none',
        boxSizing: 'border-box',
        overflowX: 'visible',
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
        overflowX: 'visible',
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
    <div className={className} style={{ ...containerStyle, ...style }} data-pauta="4-cols" data-is-overlay={overlay ? "true" : undefined}>
      <div ref={innerRef} style={gridStyle} data-pauta-grid data-is-overlay-grid={overlay ? "true" : undefined}>
        {/* Números de fila (ara renderitzats directament dins de la graella principal per a un centrat vertical en Y perfecte) */}
        {tableEnabled
          ? pautaRows.map((rowNumber) => (
              <div
                key={`p4-row-${rowNumber}`}
                style={{
                  gridColumn: '1 / 2',
                  gridRow: `${rowNumber} / ${rowNumber + 1}`,
                  position: 'absolute',
                  left: `calc(100% + (${gutterX}) / 2 - 12px)`,
                  top: 0,
                  bottom: 0,
                  width: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(71, 80, 89, 0.58)',
                  fontFamily: 'Roboto Condensed, sans-serif',
                  fontSize: '10px',
                  lineHeight: 1,
                  pointerEvents: 'none',
                  zIndex: 4,
                  opacity: tableOpacity,
                }}
              >
                {rowNumber}
              </div>
            ))
          : null}

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
                  pointerEvents: 'none',
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
