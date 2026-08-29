import React, { useEffect, useRef, useState } from 'react';

function invertHex(hex) {
  const h = String(hex || '#FFFFFF').replace('#', '');
  if (h.length < 6) return '#000000';
  const r = 255 - parseInt(h.substring(0, 2), 16);
  const g = 255 - parseInt(h.substring(2, 4), 16);
  const b = 255 - parseInt(h.substring(4, 6), 16);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function ClicAreaOverlayP1({ src, highlightAll, highlightIndices, tshirtColor, disabledIndices }) {
  const [markup, setMarkup] = useState('');
  const containerRef = useRef(null);
  const fallbackRef = useRef(null);
  const outlineColor = invertHex(tshirtColor);

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((r) => r.text())
      .then((t) => {
        if (!cancelled) setMarkup(t);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  const indicesKey = Array.isArray(highlightIndices) ? highlightIndices.join(',') : '';
  const disabledKey = Array.isArray(disabledIndices) ? disabledIndices.join(',') : '';
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const set = new Set(Array.isArray(highlightIndices) ? highlightIndices : []);
    const disabledSet = new Set(Array.isArray(disabledIndices) ? disabledIndices : []);
    const paths = root.querySelectorAll('.tshirt-outline');
    paths.forEach((p, i) => {
      if (set.has(i)) p.classList.add('is-highlighted');
      else p.classList.remove('is-highlighted');
      if (disabledSet.has(i)) p.classList.add('is-disabled');
      else p.classList.remove('is-disabled');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markup, indicesKey, disabledKey]);

  const handlePointerDown = (ev) => {
    try {
      const el = containerRef.current || fallbackRef.current;
      const r = el?.getBoundingClientRect();
      if (!r) return;
      const x = (ev.clientX - r.left) / (r.width || 1);
      const y = (ev.clientY - r.top) / (r.height || 1);
      window.dispatchEvent(new CustomEvent('mega-stripe-full-hit-p1', { detail: { x, y } }));
    } catch {
      // ignore
    }
  };

  return (
    <>
      <style>{`
        .clic-area-overlay-p1 { position: absolute; top: 0; left: 50%; transform: translateX(calc(-50% - 0.25px)) scaleX(var(--hg-clic-scale-x, 0.979)) scaleY(var(--hg-clic-scale-y, 1.02)); transform-origin: center center; height: 100%; width: 103%; z-index: 30; pointer-events: none; }
        .clic-area-overlay-p1 svg { display: block; width: 100%; height: 100%; }
        .clic-area-overlay-p1 .tshirt-outline { opacity: 0; pointer-events: all; cursor: pointer; stroke: var(--hg-outline-color, #000000) !important; }
        .clic-area-overlay-p1 .tshirt-outline.is-disabled { pointer-events: none; cursor: default; opacity: 0; stroke: none !important; fill: none !important; }
        .clic-area-fallback-p1 { position: absolute; inset: 0; pointer-events: all; cursor: pointer; z-index: 29; background: transparent; }
      `}</style>
      {markup ? null : (
        <div
          ref={fallbackRef}
          className="clic-area-fallback-p1"
          onPointerDown={handlePointerDown}
        />
      )}
      <div
        ref={containerRef}
        className={`clic-area-overlay-p1${highlightAll ? ' highlight-all' : ''}`}
        style={{ '--hg-outline-color': outlineColor }}
        aria-hidden="true"
        onPointerDown={handlePointerDown}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </>
  );
}

export default ClicAreaOverlayP1;
