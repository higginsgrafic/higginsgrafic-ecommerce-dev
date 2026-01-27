import React from 'react';

function SizeButton({ size, selected = false, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`transition-all duration-200 overflow-hidden relative group font-oswald font-medium
        flex items-center justify-center mx-auto
        ${selected ? 'bg-foreground text-whiteStrong shadow-lg hover:scale-110' : 'bg-transparent text-foreground hover:text-muted-foreground'}
        active:scale-95
        ${className}`}
      style={{
        width: '100%',
        aspectRatio: '13/6.75',
        fontSize: 'clamp(0.75rem, 3.2vw, 1.25rem)',
        borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)'
      }}
    >
      <span className="relative z-10">{size}</span>
    </button>
  );
}

export default SizeButton;
