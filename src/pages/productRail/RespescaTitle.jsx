import React from 'react';

export default function RespescaTitle({ leftPx = 0, title = 'també et pot interessar', subtitle = 'COSES DIFERENTS', style }) {
  const finalStyle = style || {
    position: 'absolute',
    top: '64px',
    left: `${leftPx - 3}px`,
  };

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
