import React from 'react';
import SizeButton from './SizeButton';

function SizeButtonGroup({
  sizes = ['S', 'M', 'L', 'XL'],
  selectedSize,
  onSizeChange,
  className = ''
}) {
  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${sizes.length}, 1fr)`,
        gap: 'clamp(0.25rem, 0.8vw, 0.5rem)'
      }}
    >
      {sizes.map((size) => (
        <SizeButton
          key={size}
          size={size}
          selected={selectedSize === size}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSizeChange(size);
          }}
        />
      ))}
    </div>
  );
}

export default SizeButtonGroup;
