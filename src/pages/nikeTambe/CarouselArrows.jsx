import React from 'react';

const buttonStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '0',
  backgroundColor: '#e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'none',
};

function ArrowButton({ ariaLabel, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      style={buttonStyle}
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

export default function CarouselArrows({ leftPx, topPx = 28.5, onPrev, onNext, prevLabel = 'Anterior', nextLabel = 'Següent' }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: `${topPx}px`,
        left: `${leftPx}px`,
        display: 'flex',
        gap: '10px',
        zIndex: 3,
      }}
    >
      <ArrowButton ariaLabel={prevLabel} onClick={onPrev}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: 'translateX(-1px)' }}
        >
          <path d="M15 18L9 12L15 6" stroke="#475059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ArrowButton>
      <ArrowButton ariaLabel={nextLabel} onClick={onNext}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: 'translateX(1px)' }}
        >
          <path d="M9 6L15 12L9 18" stroke="#475059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ArrowButton>
    </div>
  );
}
