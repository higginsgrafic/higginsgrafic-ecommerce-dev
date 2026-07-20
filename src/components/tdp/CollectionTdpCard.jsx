import { useState } from 'react';

function CollectionTdpCard({ Component, onAddToCart, ...cardProps }) {
  const [size, setSize] = useState('M');
  return (
    <Component
      {...cardProps}
      selectedSize={size}
      onSizeChange={setSize}
      onAddToCart={() => onAddToCart?.(size)}
    />
  );
}

export default CollectionTdpCard;
