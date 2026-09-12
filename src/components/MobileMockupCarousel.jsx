import { useRef } from 'react';

export function MobileMockupCarousel({ colors, selectedColor, onSelectColor }) {
  const scrollRef = useRef(null);

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        scrollBehavior: 'smooth',
        gap: '8px',
        padding: '0 16px',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {colors.map((c) => (
        <button
          key={c.slug}
          onClick={() => onSelectColor?.(c.slug)}
          aria-label={c.slug}
          style={{
            flex: '0 0 85%',
            height: '90%',
            scrollSnapAlign: 'center',
            border: 'none',
            padding: 0,
            background: 'transparent',
            cursor: 'pointer',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: selectedColor === c.slug
              ? '0 0 0 3px #1a1a1a, 0 4px 12px rgba(0,0,0,0.15)'
              : '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'box-shadow 200ms ease',
          }}
        >
          <img
            src={c.src}
            alt={`${c.slug}`}
            loading="lazy"
            draggable="false"
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        </button>
      ))}
    </div>
  );
}
