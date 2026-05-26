import React from 'react';

function ArrowButton({ ariaLabel, onClick, rowHeight = 44, children }) {
  const dynamicStyle = {
    width: `${rowHeight}px`,
    height: `${rowHeight}px`,
    borderRadius: '0',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'none',
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      style={dynamicStyle}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

export default function CarouselArrows({
  leftPx,
  rightPx,
  topPx,
  bottomPx,
  onPrev,
  onNext,
  prevLabel = 'Anterior',
  nextLabel = 'Següent',
  rowHeight, // Alçada estricta de la fila per dimensionar el botó
  vertical = false,
}) {
  const finalRowHeight = Number.isFinite(rowHeight) && rowHeight > 0 ? rowHeight : 44;

  // Escalem la mida de la icona de fletxa segons l'alçada del botó (aprox 40%)
  const svgSize = Math.max(12, Math.round(finalRowHeight * 0.41));

  const hasLeft = Number.isFinite(leftPx);
  const hasRight = Number.isFinite(rightPx);
  const hasBottom = Number.isFinite(bottomPx);
  const hasTop = Number.isFinite(topPx);
  const finalTopPx = hasTop || hasBottom ? topPx : 28.5;

  return (
    <div
      style={{
        position: 'absolute',
        ...(hasBottom ? { bottom: `${bottomPx}px` } : { top: `${finalTopPx}px` }),
        ...(hasRight ? { right: `${rightPx}px` } : { left: `${hasLeft ? leftPx : 0}px` }),
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        gap: '10px',
        zIndex: 3,
        ...(vertical ? { width: `${finalRowHeight}px` } : { height: `${finalRowHeight}px` }),
      }}
    >
      <ArrowButton ariaLabel={prevLabel} onClick={onPrev} rowHeight={finalRowHeight}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: vertical ? 'translateY(-1px)' : 'translateX(-1px)' }}
        >
          {vertical ? (
            <path d="M6 15L12 9L18 15" stroke="#475059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M15 18L9 12L15 6" stroke="#475059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </ArrowButton>
      <ArrowButton ariaLabel={nextLabel} onClick={onNext} rowHeight={finalRowHeight}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: vertical ? 'translateY(1px)' : 'translateX(1px)' }}
        >
          {vertical ? (
            <path d="M6 9L12 15L18 9" stroke="#475059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M9 6L15 12L9 18" stroke="#475059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </ArrowButton>
    </div>
  );
}
