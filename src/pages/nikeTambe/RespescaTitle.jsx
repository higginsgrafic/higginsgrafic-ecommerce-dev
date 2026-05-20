import React from 'react';

export default function RespescaTitle({ leftPx = 0, title = 'també et pot interessar', subtitle = 'COSES DIFERENTS' }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '64px',
        left: `${leftPx - 3}px`,
        fontFamily: 'Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif',
        color: 'hsl(var(--foreground))',
      }}
      data-component="respesca-title"
    >
      <div style={{ fontSize: '32pt', lineHeight: 1.1, color: 'hsl(var(--muted-foreground))' }}>{title}</div>
      <div
        style={{
          marginTop: '2px',
          fontSize: '13pt',
          fontWeight: 500,
          lineHeight: 1.2,
          color: 'hsl(var(--foreground))',
          fontKerning: 'normal',
          letterSpacing: '0.08em',
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}
