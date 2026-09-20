import React from 'react';

/**
 * GraellaFletxes — una graella de 5 columnes x 3 files de caselles.
 * -----------------------------------------------------------------------------
 * La mida de cada casella es la MATEIXA que la tile de les fletxes del rail:
 * `CarouselArrows` fa servir `rowHeight` (44 px a la PDP) d'amplada i d'alçada.
 *
 * @param {object} props
 * @param {number} [props.tilePx]  mida de la casella, en px (44, la de les fletxes)
 * @param {number} [props.columnes]
 * @param {number} [props.files]
 * @param {number} [props.gapPx]   separacio entre caselles, en px
 */
export default function GraellaFletxes({
  tilePx = 44,
  columnes = 5,
  files = 3,
  gapPx = 0,
  style,
}) {
  const total = columnes * files;
  return (
    <div
      data-graella-fletxes="1"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnes}, ${tilePx}px)`,
        gridTemplateRows: `repeat(${files}, ${tilePx}px)`,
        gap: `${gapPx}px`,
        width: 'fit-content',
        ...style,
      }}
    >
      {Array.from({ length: total }).map((_, idx) => (
        <div
          key={`casella-${idx}`}
          data-graella-casella={idx}
          style={{
            width: `${tilePx}px`,
            height: `${tilePx}px`,
            boxSizing: 'border-box',
            border: '1px solid #E6E8EC',
          }}
        />
      ))}
    </div>
  );
}

/** La mida de la tile de les fletxes a la PDP (el `rowHeight` de CarouselArrows). */
export const TILE_FLETXES_PX = 44;
