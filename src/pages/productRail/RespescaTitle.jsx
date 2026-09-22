import React from 'react';

export default function RespescaTitle({ leftPx = 0, title = 'també et pot interessar', subtitle = 'COSES PECULIARS', style , enFlux = false }) {
  // En mode estatic el titol va en el flux (a sobre de les targetes, com a part
  // del bloc), no absolut amb el desplaçament del carrousel.
  const finalStyle = style || (enFlux
    // El titol va alineat a l'ESQUERRA de les targetes: el seu bloc comença on
    // comença la primera targeta (el contenidor del rail, que ja va centrat).
    ? { position: 'relative', textAlign: 'left', boxSizing: 'border-box', paddingLeft: `${leftPx}px` }
    : {
      position: 'absolute',
      top: '64px',
      left: `${leftPx - 3}px`,
    });

  return (
    <div
      style={{
        fontFamily: 'Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif',
        color: 'hsl(var(--foreground))',
        ...finalStyle,
      }}
      data-component="respesca-title"
    >
      <div
        style={{
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 300,
          fontSize: '20pt',
          lineHeight: 1,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: '#475059',
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: '2px',
          fontFamily: 'Roboto Condensed, sans-serif',
          fontWeight: 400,
          fontSize: '11px',
          lineHeight: 1.2,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(71, 80, 89, 0.7)',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}
