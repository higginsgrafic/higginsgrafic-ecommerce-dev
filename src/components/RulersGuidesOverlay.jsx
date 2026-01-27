import React, { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_STORAGE_KEY = 'devGuidesV2';
const DEFAULT_RULER_SIZE = 18;
const HANDLE_THICKNESS = 12;
const HANDLE_SPAN = 48;
const RULER_MINOR_STEP = 10;
const RULER_MAJOR_STEP = 50;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function RulersGuidesOverlay({
  guidesEnabled = true,
  onAutoEnable,
  storageKey = DEFAULT_STORAGE_KEY,
  anchorElementId = 'main-content',
  headerOffsetCssVar = '--appHeaderOffset',
  rulerSize = DEFAULT_RULER_SIZE,
  zIndex = 35000,
}) {
  const [vGuides, setVGuides] = useState([]);
  const [hGuides, setHGuides] = useState([]);
  const draggingRef = useRef(null);
  const migratedRef = useRef(false);
  const [anchorRect, setAnchorRect] = useState({ left: 0, top: 0, width: 0, height: 0, padLeft: 0, padTop: 0 });
  const zoom = 1;

  const rulerLeft = Math.max(0, anchorRect.left);
  const rulerTop = Math.max(0, anchorRect.top);

  const interactionLeft = Math.max(0, anchorRect.left + (anchorRect.padLeft || 0));
  const interactionTop = Math.max(0, anchorRect.top + (anchorRect.padTop || 0));

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(anchorElementId);
      const rect = el?.getBoundingClientRect?.();
      if (!rect || !rect.width || !rect.height) {
        setAnchorRect((prev) => (prev.width || prev.height ? { left: 0, top: 0, width: 0, height: 0, padLeft: 0, padTop: 0 } : prev));
        return;
      }

      let padLeft = 0;
      let padTop = 0;
      try {
        const cs = window.getComputedStyle(el);
        padLeft = Math.round(parseFloat(cs.paddingLeft || '0') || 0);
        padTop = Math.round(parseFloat(cs.paddingTop || '0') || 0);

        const appHeaderOffsetRaw = (cs.getPropertyValue(headerOffsetCssVar) || '').trim();
        const appHeaderOffset = Math.round(parseFloat(appHeaderOffsetRaw || '0') || 0);
        if (Number.isFinite(appHeaderOffset) && appHeaderOffset > padTop) padTop = appHeaderOffset;
      } catch {
        // ignore
      }

      const next = {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        padLeft,
        padTop,
      };
      setAnchorRect((prev) => (
        prev.left === next.left &&
        prev.top === next.top &&
        prev.width === next.width &&
        prev.height === next.height &&
        prev.padLeft === next.padLeft &&
        prev.padTop === next.padTop
          ? prev
          : next
      ));
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorElementId, headerOffsetCssVar]);

  const toDocX = (clientX) => Math.round(clientX / zoom);
  const toDocY = (clientY) => Math.round(clientY / zoom);

  const onDragMove = (e) => {
    const drag = draggingRef.current;
    if (!drag) return;

    const maxW = (window.innerWidth || 0) / zoom;
    const maxH = (window.innerHeight || 0) / zoom;

    if (drag.kind === 'v') {
      const x = clamp(toDocX(e.clientX), 0, maxW);
      setVGuides((prev) => prev.map((vv, i) => (i === drag.idx ? x : vv)));
    } else {
      const y = clamp(toDocY(e.clientY), 0, maxH);
      setHGuides((prev) => prev.map((hh, i) => (i === drag.idx ? y : hh)));
    }
  };

  const endDrag = () => {
    draggingRef.current = null;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const vv = Array.isArray(parsed?.v) ? parsed.v : [];
      const hh = Array.isArray(parsed?.h) ? parsed.h : [];
      setVGuides(vv.filter((n) => Number.isFinite(n)));
      setHGuides(hh.filter((n) => Number.isFinite(n)));
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    if (migratedRef.current) return;
    if (!Number.isFinite(interactionTop) || !Number.isFinite(interactionLeft)) return;
    if (interactionTop <= 0 && interactionLeft <= 0) return;

    if (interactionTop > 0) {
      setHGuides((prev) => {
        if (!prev.length) return prev;
        const max = Math.max(...prev);
        if (!(max <= interactionTop + 2)) return prev;
        return prev.map((y) => y + interactionTop);
      });
    }

    if (interactionLeft > 0) {
      setVGuides((prev) => {
        if (!prev.length) return prev;
        const max = Math.max(...prev);
        if (!(max <= interactionLeft + 2)) return prev;
        return prev.map((x) => x + interactionLeft);
      });
    }

    migratedRef.current = true;
  }, [interactionLeft, interactionTop]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ v: vGuides, h: hGuides }));
    } catch {
      // ignore
    }
  }, [guidesEnabled, storageKey, vGuides, hGuides]);

  useEffect(() => {
    const onResize = () => {
      const maxW = (window.innerWidth || 0) / zoom;
      const maxH = (window.innerHeight || 0) / zoom;
      setVGuides((prev) => prev.map((x) => clamp(Math.round(x), 0, maxW)));
      setHGuides((prev) => prev.map((y) => clamp(Math.round(y), 0, maxH)));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [zoom]);

  const onRulerTopClick = (e) => {
    if (!guidesEnabled) onAutoEnable?.();
    if (e.clientX < interactionLeft) return;
    const maxW = (window.innerWidth || 0) / zoom;
    const x = clamp(toDocX(e.clientX), 0, maxW);
    setVGuides((prev) => [...prev, x]);
  };

  const onRulerLeftClick = (e) => {
    if (!guidesEnabled) onAutoEnable?.();
    if (e.clientY < interactionTop) return;
    const maxH = (window.innerHeight || 0) / zoom;
    const y = clamp(toDocY(e.clientY), 0, maxH);
    setHGuides((prev) => [...prev, y]);
  };

  const beginDrag = (kind, idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = { kind, idx };
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  };

  const removeGuide = (kind, idx) => {
    if (kind === 'v') setVGuides((prev) => prev.filter((_, i) => i !== idx));
    else setHGuides((prev) => prev.filter((_, i) => i !== idx));
  };

  const square = useMemo(() => {
    if (!guidesEnabled) return null;
    const xs = [...vGuides].filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
    const ys = [...hGuides].filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
    if (xs.length < 2 || ys.length < 2) return null;
    return {
      xL: Math.round(xs[0]),
      xR: Math.round(xs[xs.length - 1]),
      yT: Math.round(ys[0]),
      yB: Math.round(ys[ys.length - 1]),
    };
  }, [guidesEnabled, vGuides, hGuides]);

  const rulerTicks = useMemo(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 0;

    const docXMin = Math.floor((0 - anchorRect.left) / zoom / RULER_MINOR_STEP) * RULER_MINOR_STEP;
    const docXMax = Math.ceil((vw - anchorRect.left) / zoom / RULER_MINOR_STEP) * RULER_MINOR_STEP;

    const docYMin = Math.floor((0 - anchorRect.top) / zoom / RULER_MINOR_STEP) * RULER_MINOR_STEP;
    const docYMax = Math.ceil((vh - anchorRect.top) / zoom / RULER_MINOR_STEP) * RULER_MINOR_STEP;

    const xs = [];
    for (let d = docXMin; d <= docXMax; d += RULER_MINOR_STEP) {
      const sx = anchorRect.left + d * zoom;
      if (sx < -50 || sx > vw + 50) continue;
      const major = d % RULER_MAJOR_STEP === 0;
      xs.push({ d, sx, major });
    }

    const ys = [];
    for (let d = docYMin; d <= docYMax; d += RULER_MINOR_STEP) {
      const sy = anchorRect.top + d * zoom;
      if (sy < -50 || sy > vh + 50) continue;
      const major = d % RULER_MAJOR_STEP === 0;
      ys.push({ d, sy, major });
    }

    return { xs, ys, vw, vh };
  }, [anchorRect.left, anchorRect.top, zoom]);

  const copySquare = async () => {
    if (!square) return;
    const text = `xL=${square.xL} xR=${square.xR} yT=${square.yT} yB=${square.yB}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    try {
      window.__DEV_GUIDES_SQUARE__ = square;
      window.__DEV_GUIDES_COPY_COORDS__ = () => {
        copySquare();
      };
    } catch {
      // ignore
    }
  }, [square]);

  return (
    <div
      className="fixed inset-0 pointer-events-none debug-exempt"
      style={{ zIndex }}
      aria-hidden="true"
      data-dev-overlay="true"
    >
      <div
        className="fixed debug-exempt"
        style={{
          left: 0,
          top: 0,
          width: '100vw',
          height: `${rulerSize}px`,
          backgroundColor: '#337AC6',
          pointerEvents: 'none',
        }}
      >
        <svg className="block" width={rulerTicks.vw} height={rulerSize} style={{ pointerEvents: 'none' }}>
          {rulerTicks.xs.map((t) => (
            <g key={`x-${t.d}`}>
              <line
                x1={t.sx}
                x2={t.sx}
                y1={rulerSize}
                y2={t.major ? 2 : 10}
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={t.major ? 1.5 : 1}
              />
              {t.major ? (
                <text
                  x={t.sx + 2}
                  y={12}
                  fill="rgba(255,255,255,0.95)"
                  fontSize={10}
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                >
                  {t.d}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>

      <div
        className="fixed debug-exempt"
        style={{
          left: 0,
          top: 0,
          width: `${rulerSize}px`,
          height: '100vh',
          backgroundColor: '#337AC6',
          pointerEvents: 'none',
        }}
      >
        <svg className="block" width={rulerSize} height={rulerTicks.vh} style={{ pointerEvents: 'none' }}>
          {rulerTicks.ys.map((t) => (
            <g key={`y-${t.d}`}>
              <line
                y1={t.sy}
                y2={t.sy}
                x1={rulerSize}
                x2={t.major ? 2 : 10}
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={t.major ? 1.5 : 1}
              />
              {t.major ? (
                <text
                  x={2}
                  y={t.sy - 2}
                  fill="rgba(255,255,255,0.95)"
                  fontSize={10}
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                >
                  {t.d}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>

      <div
        className="fixed"
        style={{
          left: 0,
          top: 0,
          width: `${rulerSize}px`,
          height: `${rulerSize}px`,
          backgroundColor: '#337AC6',
          pointerEvents: 'none',
        }}
      />

      <div
        className="fixed debug-exempt"
        style={{
          left: 0,
          top: 0,
          width: '100vw',
          height: `${rulerSize}px`,
          background: 'transparent',
          pointerEvents: 'auto',
        }}
        data-dev-overlay-interactive="true"
        onClick={onRulerTopClick}
      />
      <div
        className="fixed debug-exempt"
        style={{
          left: 0,
          top: 0,
          width: `${rulerSize}px`,
          height: '100vh',
          background: 'transparent',
          pointerEvents: 'auto',
        }}
        data-dev-overlay-interactive="true"
        onClick={onRulerLeftClick}
      />

      {guidesEnabled ? vGuides.map((x, idx) => (
        <div
          key={`v-${idx}-${x}`}
          className="fixed debug-exempt"
          style={{ left: `${x * zoom}px`, top: 0, height: '100vh', width: '1px', background: 'rgba(255, 0, 0, 0.65)', pointerEvents: 'none' }}
        >
          <div
            className="debug-exempt"
            style={{
              position: 'absolute',
              top: 0,
              left: '-4px',
              width: '9px',
              height: '100vh',
              pointerEvents: 'auto',
              cursor: 'col-resize',
              background: 'transparent',
            }}
            data-dev-overlay-interactive="true"
            onPointerDown={(e) => beginDrag('v', idx, e)}
            onDoubleClick={() => removeGuide('v', idx)}
          />
          <div
            className="debug-exempt"
            style={{
              position: 'absolute',
              top: 0,
              left: `${-Math.floor(HANDLE_THICKNESS / 2)}px`,
              width: `${HANDLE_THICKNESS + 1}px`,
              height: `${rulerSize + HANDLE_SPAN}px`,
              pointerEvents: 'auto',
              cursor: 'col-resize',
            }}
            data-dev-overlay-interactive="true"
            onPointerDown={(e) => beginDrag('v', idx, e)}
            onDoubleClick={() => removeGuide('v', idx)}
          />
          <div
            className="debug-exempt"
            style={{
              position: 'absolute',
              top: `${rulerSize + 6}px`,
              left: '6px',
              background: 'rgba(0,0,0,0.75)',
              color: 'white',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>x={x}</span>
            <button
              type="button"
              className="debug-exempt"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'rgba(255,255,255,0.9)',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                pointerEvents: 'auto',
              }}
              data-dev-overlay-interactive="true"
              aria-label="Eliminar guia"
              title="Eliminar"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeGuide('v', idx);
              }}
            >
              ×
            </button>
          </div>
        </div>
      )) : null}

      {guidesEnabled ? hGuides.map((y, idx) => (
        <div
          key={`h-${idx}-${y}`}
          className="fixed debug-exempt"
          style={{ top: `${y * zoom}px`, left: 0, width: '100vw', height: '1px', background: 'rgba(0, 120, 255, 0.65)', pointerEvents: 'none' }}
        >
          <div
            className="debug-exempt"
            style={{
              position: 'absolute',
              left: 0,
              top: '-4px',
              width: '100vw',
              height: '9px',
              pointerEvents: 'auto',
              cursor: 'row-resize',
              background: 'transparent',
            }}
            data-dev-overlay-interactive="true"
            onPointerDown={(e) => beginDrag('h', idx, e)}
            onDoubleClick={() => removeGuide('h', idx)}
          />
          <div
            className="debug-exempt"
            style={{
              position: 'absolute',
              left: 0,
              top: `${-Math.floor(HANDLE_THICKNESS / 2)}px`,
              width: `${rulerSize + HANDLE_SPAN}px`,
              height: `${HANDLE_THICKNESS + 1}px`,
              pointerEvents: 'auto',
              cursor: 'row-resize',
            }}
            data-dev-overlay-interactive="true"
            onPointerDown={(e) => beginDrag('h', idx, e)}
            onDoubleClick={() => removeGuide('h', idx)}
          />
          <div
            className="debug-exempt"
            style={{
              position: 'absolute',
              left: `${rulerSize + 6}px`,
              top: '6px',
              background: 'rgba(0,0,0,0.75)',
              color: 'white',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>y={y}</span>
            <button
              type="button"
              className="debug-exempt"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'rgba(255,255,255,0.9)',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                pointerEvents: 'auto',
              }}
              data-dev-overlay-interactive="true"
              aria-label="Eliminar guia"
              title="Eliminar"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeGuide('h', idx);
              }}
            >
              ×
            </button>
          </div>
        </div>
      )) : null}
    </div>
  );
}
