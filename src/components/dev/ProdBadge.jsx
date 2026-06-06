import React, { useState } from 'react';

const PORT = 3004;

function ProdBadge() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div
      onClick={() => setHidden(true)}
      title={`Entorn PROD — port ${PORT} (clic per amagar)`}
      style={{
        position: 'fixed',
        left: '10px',
        bottom: '10px',
        zIndex: 2147483646,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        borderRadius: '999px',
        backgroundColor: 'rgba(245, 245, 245, 0.96)',
        border: '1px solid rgba(180, 180, 180, 0.85)',
        color: '#333',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: '11px',
        lineHeight: 1,
        letterSpacing: '0.04em',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span style={{ fontWeight: 700, color: '#555' }}>PROD</span>
      <span style={{ opacity: 0.75 }}>:3004</span>
    </div>
  );
}

export default ProdBadge;