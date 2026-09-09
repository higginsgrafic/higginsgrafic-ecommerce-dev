import React, { useEffect, useState } from 'react';

export default function LogoLeftGuide() {
  const [left, setLeft] = useState(null);

  useEffect(() => {
    const update = () => {
      const logo = document.querySelector('[data-brand-logo="1"]');
      if (logo) {
        const r = logo.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setLeft(Math.round(r.left));
        }
      }
    };
    update();
    const interval = setInterval(update, 500);
    window.addEventListener('resize', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (left == null) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: 0,
        width: '1px',
        height: '100vh',
        backgroundColor: 'red',
        zIndex: 2147483647,
        pointerEvents: 'none',
      }}
    />
  );
}
