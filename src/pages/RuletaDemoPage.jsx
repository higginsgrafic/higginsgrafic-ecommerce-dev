import React, { useEffect, useMemo, useRef, useState } from 'react';
import SEO from '@/components/SEO';

export default function RuletaDemoPage() {
  const DEFAULTS = useMemo(
    () => ({
      orientation: 'portrait',
      calib: 0.68,
      viewLeft: 0.68,
      viewTop: 1,
      wheelRadius: 325,
      wheelAngle: 0,
      wheelCenterX: 0,
      wheelCenterY: 1035,
      wheelAutoSpin: false,
      wheelSpinSpeed: 0.35,
      wheelVisible: true,
      handX: -82,
      handY: 146,
      handAngle: 0.09,
      thumbArcAlpha: 0.88,
      thumbArcRadius: 504,
      thumbArcX: -330,
      thumbArcY: 286,
      selectedColorSlug: 'white',
    }),
    []
  );

  const UI_BLUE = '#2d6cff';
  const UI_YELLOW = '#ffd400';

  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const [visualVp, setVisualVp] = useState(() => {
    const vv = window.visualViewport;
    return vv ? { w: vv.width, h: vv.height, scale: vv.scale, offsetLeft: vv.offsetLeft, offsetTop: vv.offsetTop } : null;
  });

  const [orientation, setOrientation] = useState(DEFAULTS.orientation);
  const [calib, setCalib] = useState(DEFAULTS.calib);

  const [viewLeft, setViewLeft] = useState(DEFAULTS.viewLeft);
  const [viewTop, setViewTop] = useState(DEFAULTS.viewTop);

  const [wheelRadius, setWheelRadius] = useState(DEFAULTS.wheelRadius);
  const [wheelAngle, setWheelAngle] = useState(DEFAULTS.wheelAngle);
  const [wheelCenterX, setWheelCenterX] = useState(DEFAULTS.wheelCenterX);
  const [wheelCenterY, setWheelCenterY] = useState(DEFAULTS.wheelCenterY);
  const [wheelAutoSpin, setWheelAutoSpin] = useState(DEFAULTS.wheelAutoSpin);
  const [wheelSpinSpeed, setWheelSpinSpeed] = useState(DEFAULTS.wheelSpinSpeed);
  const [wheelVisible, setWheelVisible] = useState(DEFAULTS.wheelVisible);

  const [finalPngVersion, setFinalPngVersion] = useState(() => Date.now());

  const wheelStageRef = useRef(null);
  const dragRef = useRef({ active: false, pointerId: null, lastAngle: 0, moved: false });
  const [wheelDragging, setWheelDragging] = useState(false);

  const thumbDragRef = useRef({ active: false, pointerId: null, startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0, startRadius: 0 });
  const [thumbDragging, setThumbDragging] = useState(false);

  const [handX, setHandX] = useState(DEFAULTS.handX);
  const [handY, setHandY] = useState(DEFAULTS.handY);
  const [handAngle, setHandAngle] = useState(DEFAULTS.handAngle);

  const [thumbArcAlpha, setThumbArcAlpha] = useState(DEFAULTS.thumbArcAlpha);
  const [thumbArcRadius, setThumbArcRadius] = useState(DEFAULTS.thumbArcRadius);
  const [thumbArcX, setThumbArcX] = useState(DEFAULTS.thumbArcX);
  const [thumbArcY, setThumbArcY] = useState(DEFAULTS.thumbArcY);

  const selectedColorOrder = useMemo(
    () => [
      'white',
      'light-pink',
      'kiwi',
      'light-blue',
      'daisy',
      'gold',
      'irish-green',
      'royal',
      'red',
      'purple',
      'military-green',
      'forest-green',
      'navy',
      'black',
    ],
    []
  );

  const colorButtonSrcBySlug = useMemo(
    () => ({
      white: '/placeholders/t-shirt_buttons/selector-color-white.png',
      'light-pink': '/placeholders/t-shirt_buttons/selector-color-light-pink.png',
      'light-blue': '/placeholders/t-shirt_buttons/selector-color-light-blue.png',
      daisy: '/placeholders/t-shirt_buttons/selector-color-daisy.png',
      gold: '/placeholders/t-shirt_buttons/selector-color-gold.png',
      red: '/placeholders/t-shirt_buttons/selector-color-red.png',
      purple: '/placeholders/t-shirt_buttons/selector-color-purple.png',
      royal: '/placeholders/t-shirt_buttons/selector-color-blue-royal.png',
      navy: '/placeholders/t-shirt_buttons/selector-color-blue-navy.png',
      'military-green': '/placeholders/t-shirt_buttons/selector-color-military-green.png',
      'forest-green': '/placeholders/t-shirt_buttons/selector-color-forest-green.png',
      'irish-green': '/placeholders/t-shirt_buttons/selector-color-irish-green.png',
      kiwi: '/placeholders/t-shirt_buttons/selector-color-kiwi.png',
      black: '/placeholders/t-shirt_buttons/selector-color-black.png',
    }),
    []
  );

  const [selectedColorSlug, setSelectedColorSlug] = useState(DEFAULTS.selectedColorSlug);

  useEffect(() => {
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      const vv = window.visualViewport;
      setVisualVp(vv ? { w: vv.width, h: vv.height, scale: vv.scale, offsetLeft: vv.offsetLeft, offsetTop: vv.offsetTop } : null);
    };
    window.addEventListener('resize', onResize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);
    if (window.visualViewport) window.visualViewport.addEventListener('scroll', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', onResize);
      if (window.visualViewport) window.visualViewport.removeEventListener('scroll', onResize);
    };
  }, []);

  useEffect(() => {
    if (!wheelAutoSpin) return;
    let raf = 0;
    let last = performance.now();

    const tick = (t) => {
      const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
      last = t;
      setWheelAngle((a) => a + wheelSpinSpeed * dt);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [wheelAutoSpin, wheelSpinSpeed]);

  const getWheelCenterClient = () => {
    const el = wheelStageRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const viewTx = Math.round((viewLeft - 0.5) * 40);
    const viewTy = Math.round((viewTop - 0.5) * 40);
    const cx = r.left + r.width / 2 + wheelCenterX + viewTx;
    const cy = r.top + r.height / 2 + wheelCenterY + viewTy;
    return { cx, cy };
  };

  const pointAngle = (cx, cy, x, y) => Math.atan2(y - cy, x - cx);

  const startDrag = (e) => {
    if (e.button != null && e.button !== 0) return;
    const c = getWheelCenterClient();
    if (!c) return;
    const a = pointAngle(c.cx, c.cy, e.clientX, e.clientY);
    dragRef.current = { active: true, pointerId: e.pointerId, lastAngle: a, moved: false };
    setWheelDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const moveDrag = (e) => {
    if (!dragRef.current.active) return;
    if (dragRef.current.pointerId !== e.pointerId) return;
    const c = getWheelCenterClient();
    if (!c) return;
    const a = pointAngle(c.cx, c.cy, e.clientX, e.clientY);
    let da = a - dragRef.current.lastAngle;
    if (da > Math.PI) da -= Math.PI * 2;
    if (da < -Math.PI) da += Math.PI * 2;
    if (Math.abs(da) > 0.002) dragRef.current.moved = true;
    dragRef.current.lastAngle = a;
    setWheelAngle((prev) => prev + da);
  };

  const endDrag = (e) => {
    if (!dragRef.current.active) return;
    if (dragRef.current.pointerId !== e.pointerId) return;
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    setWheelDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const startThumbDrag = (e) => {
    if (e.button != null && e.button !== 0) return;
    thumbDragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: thumbArcX,
      startOffsetY: thumbArcY,
      startRadius: thumbArcRadius,
    };
    setThumbDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const moveThumbDrag = (e) => {
    if (!thumbDragRef.current.active) return;
    if (thumbDragRef.current.pointerId !== e.pointerId) return;
    const s = Math.max(0.0001, scale);
    const dx = (e.clientX - thumbDragRef.current.startX) / s;
    const dy = (e.clientY - thumbDragRef.current.startY) / s;
    if (e.shiftKey) {
      setThumbArcRadius((prev) => {
        const base = thumbDragRef.current.startRadius;
        const next = Math.round(base + dy);
        return clamp(next, 120, 900);
      });
      return;
    }
    setThumbArcX(Math.round(thumbDragRef.current.startOffsetX + dx));
    setThumbArcY(Math.round(thumbDragRef.current.startOffsetY + dy));
  };

  const endThumbDrag = (e) => {
    if (!thumbDragRef.current.active) return;
    if (thumbDragRef.current.pointerId !== e.pointerId) return;
    thumbDragRef.current.active = false;
    thumbDragRef.current.pointerId = null;
    setThumbDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const frame = useMemo(() => {
    return {
      width: 482,
      height: 1087,
    };
  }, []);

  const scale = useMemo(() => {
    const maxW = Math.max(0, viewport.w - 48 - 360);
    const maxH = Math.max(0, viewport.h - 48);
    if (!maxW || !maxH) return 1;
    return Math.min(1, maxW / frame.width, maxH / frame.height);
  }, [frame.height, frame.width, viewport.h, viewport.w]);

  const format = (n, digits = 2) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return '';
    return num.toFixed(digits);
  };

  const clamp = (n, min, max) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return min;
    return Math.max(min, Math.min(max, x));
  };

  const resetAll = () => {
    setOrientation(DEFAULTS.orientation);
    setCalib(DEFAULTS.calib);
    setViewLeft(DEFAULTS.viewLeft);
    setViewTop(DEFAULTS.viewTop);
    setWheelRadius(DEFAULTS.wheelRadius);
    setWheelAngle(DEFAULTS.wheelAngle);
    setWheelCenterX(DEFAULTS.wheelCenterX);
    setWheelCenterY(DEFAULTS.wheelCenterY);
    setWheelAutoSpin(DEFAULTS.wheelAutoSpin);
    setWheelSpinSpeed(DEFAULTS.wheelSpinSpeed);
    setWheelVisible(DEFAULTS.wheelVisible);
    setHandX(DEFAULTS.handX);
    setHandY(DEFAULTS.handY);
    setHandAngle(DEFAULTS.handAngle);
    setThumbArcAlpha(DEFAULTS.thumbArcAlpha);
    setThumbArcRadius(DEFAULTS.thumbArcRadius);
    setThumbArcX(DEFAULTS.thumbArcX);
    setThumbArcY(DEFAULTS.thumbArcY);
    setSelectedColorSlug(DEFAULTS.selectedColorSlug);
    setFinalPngVersion(Date.now());
  };

  const polar = (cx, cy, r, a) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  const arcPath = (cx, cy, rOuter, rInner, a0, a1) => {
    const p0 = polar(cx, cy, rOuter, a0);
    const p1 = polar(cx, cy, rOuter, a1);
    const p2 = polar(cx, cy, rInner, a1);
    const p3 = polar(cx, cy, rInner, a0);
    const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
    const sweep = 1;
    const sweepInner = 0;
    return `M ${p0.x} ${p0.y} A ${rOuter} ${rOuter} 0 ${large} ${sweep} ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${rInner} ${rInner} 0 ${large} ${sweepInner} ${p3.x} ${p3.y} Z`;
  };

  const stripeCircle = useMemo(() => {
    const megaTileSize = 160;
    const imageAspect = 161 / 145;
    const buttonW = Math.round(megaTileSize * imageAspect);
    const baseOverlap = Math.round(megaTileSize * 0.36);
    const baseStep = Math.max(0, buttonW - baseOverlap);
    const compressFactor = 0.79;
    const lastOffsetPx = 63;
    const step = Math.round(baseStep * compressFactor);
    const stepEq = step + lastOffsetPx / 13;
    const count = 84;
    const R = (count * stepEq) / (Math.PI * 2);
    const delta = (Math.PI * 2) / count;
    return {
      megaTileSize,
      buttonW,
      stepEq,
      R,
      count,
      delta,
    };
  }, []);

  const SliderRow = ({ label, value, min, max, step, onChange, digits = 2 }) => {
    return (
      <div className="grid gap-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-white/60">
          <span>{label}</span>
          <span className="font-mono text-white/70">{format(value, digits)}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
    );
  };

  const NumberRow = ({ label, value, onChange }) => {
    const inputRef = useRef(null);
    const [text, setText] = useState(String(value));

    useEffect(() => {
      const el = inputRef.current;
      const focused = !!el && document.activeElement === el;
      if (!focused) setText(String(value));
    }, [value]);

    const commit = () => {
      const raw = text.trim();
      if (raw === '' || raw === '-') {
        setText(String(value));
        return;
      }
      const next = Number.parseFloat(raw);
      if (!Number.isFinite(next)) {
        setText(String(value));
        return;
      }
      onChange(next);
    };

    return (
      <label className="grid gap-1">
        <div className="text-[11px] font-semibold text-white/60">{label}</div>
        <input
          ref={inputRef}
          className="h-8 rounded-md border border-white/15 bg-black/20 px-2 font-mono text-[12px] text-white/85"
          inputMode="numeric"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
              e.currentTarget.blur();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              setText(String(value));
              e.currentTarget.blur();
            }
          }}
        />
      </label>
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <SEO title="Ruleta (demo)" description="Demo ruleta circular (WIP)" />
      <div className="min-h-screen w-full grid" style={{ gridTemplateColumns: '1fr 360px' }}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="relative" style={{ width: `${frame.width}px`, height: `${frame.height}px`, transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'center' }}>
            <div className="absolute inset-0" style={{ background: '#ffffff', borderRadius: '18px', boxShadow: '0 30px 90px rgba(0,0,0,0.55)' }} />

            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '18px' }}>
              <img
                src="/tmp/moviment-polze.png"
                alt="Moviment del polze"
                className="absolute inset-0 h-full w-full"
                style={{ objectFit: 'none', objectPosition: 'center', pointerEvents: 'none' }}
              />

              <div
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  width: `${thumbArcRadius * 2}px`,
                  height: `${thumbArcRadius * 2}px`,
                  transform: `translate(calc(-50% + ${thumbArcX}px), calc(-50% + ${thumbArcY}px))`,
                  borderRadius: '9999px',
                  background: '#2d6cff',
                  opacity: 0.5 * clamp(thumbArcAlpha, 0, 1),
                  pointerEvents: 'auto',
                  cursor: thumbDragging ? 'grabbing' : 'grab',
                }}
                onPointerDown={startThumbDrag}
                onPointerMove={moveThumbDrag}
                onPointerUp={endThumbDrag}
                onPointerCancel={endThumbDrag}
              />

              {wheelVisible ? (
                <div
                  ref={wheelStageRef}
                  className="absolute inset-0"
                  style={{ transform: `translate(${Math.round((viewLeft - 0.5) * 40)}px, ${Math.round((viewTop - 0.5) * 40)}px)` }}
                  onPointerDown={startDrag}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                >
                  <div className="absolute inset-0" style={{ left: 0, top: 0 }}>
                    <div
                      className="absolute"
                      style={{
                        left: `calc(50% + ${wheelCenterX}px)`,
                        top: `calc(50% + ${wheelCenterY}px)`,
                        width: `${stripeCircle.R * 2}px`,
                        height: `${stripeCircle.R * 2}px`,
                        transform: `translate(-50%, -50%) rotate(${wheelAngle}rad)`,
                        transformOrigin: '50% 50%',
                      }}
                    >
                      {Array.from({ length: stripeCircle.count }).map((_, i) => {
                        const slug = selectedColorOrder[i % selectedColorOrder.length];
                        const src = colorButtonSrcBySlug?.[slug];
                        const theta = i * stripeCircle.delta;
                        const selected = selectedColorSlug === slug;
                        const outline = 'none';
                        const finalSrc = `/placeholders/t-shirt_buttons/final.png?v=${finalPngVersion}`;
                        const isFinalTile = i === 0;
                        const tileSrc = isFinalTile ? finalSrc : src;

                        return (
                          <button
                            key={`stripe-${i}-${slug}`}
                            type="button"
                            onClick={() => {
                              if (wheelDragging || dragRef.current.moved) return;
                              setSelectedColorSlug(slug);
                            }}
                            className="absolute"
                            style={{
                              left: '50%',
                              top: '50%',
                              width: `${stripeCircle.buttonW}px`,
                              height: `${stripeCircle.megaTileSize}px`,
                              transform: `translate(-50%, -50%) rotate(${theta}rad) translate(0, -${stripeCircle.R}px) rotate(${Math.PI / 2}rad)`,
                              transformOrigin: '50% 50%',
                              background: 'transparent',
                              padding: 0,
                              border: 'none',
                              cursor: wheelDragging ? 'grabbing' : 'pointer',
                              outline: 'none',
                              boxShadow: outline,
                              borderRadius: '0px',
                              zIndex: isFinalTile ? 20000 : 1000 + (stripeCircle.count - i),
                            }}
                            aria-pressed={selected}
                            aria-label={slug}
                          >
                            {tileSrc ? (
                              <img
                                src={tileSrc}
                                alt={slug}
                                className="block"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  objectPosition: 'center',
                                  borderRadius: '0px',
                                  pointerEvents: 'none',
                                  transform: 'rotate(-90deg)',
                                  transformOrigin: '50% 50%',
                                  filter: selected ? 'saturate(1.05) contrast(1.05)' : 'none',
                                }}
                              />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="min-h-screen border-l border-white/10 bg-[#101010] px-4 py-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold tracking-[0.22em] text-white/55">TOOLS</div>
            <button
              type="button"
              onClick={resetAll}
              className="h-8 rounded-md border border-white/15 bg-white/5 px-3 text-[12px] font-semibold text-white/80 hover:bg-white/10"
            >
              Reset
            </button>
          </div>

          <div className="mt-2">
            <button
              type="button"
              onClick={() => setFinalPngVersion(Date.now())}
              className="h-8 w-full rounded-md border border-white/15 bg-white/5 px-3 text-[12px] font-semibold text-white/80 hover:bg-white/10"
            >
              Reload final.png
            </button>
          </div>

          <div className="mt-4 grid gap-6">
            <section className="grid gap-3">
              <div className="text-[11px] font-semibold text-white/50">Orientation</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`h-9 flex-1 rounded-md border text-[12px] font-semibold ${orientation === 'portrait' ? 'border-white/20 bg-white/10 text-white' : 'border-white/10 bg-black/10 text-white/70'}`}
                  onClick={() => setOrientation('portrait')}
                >
                  Portrait
                </button>
                <button
                  type="button"
                  className={`h-9 flex-1 rounded-md border text-[12px] font-semibold ${orientation === 'landscape' ? 'border-white/20 bg-white/10 text-white' : 'border-white/10 bg-black/10 text-white/70'}`}
                  onClick={() => setOrientation('landscape')}
                >
                  Landscape
                </button>
              </div>
              <SliderRow label="calib" value={calib} min={0.4} max={1.2} step={0.01} onChange={setCalib} digits={2} />
            </section>

            <section className="grid gap-3">
              <div className="text-[11px] font-semibold text-white/50">VIEW</div>
              <SliderRow label="left" value={viewLeft} min={0} max={1} step={0.01} onChange={setViewLeft} digits={2} />
              <SliderRow label="top" value={viewTop} min={0} max={1} step={0.01} onChange={setViewTop} digits={2} />
            </section>

            <section className="grid gap-3">
              <div className="text-[11px] font-semibold text-white/50">WHEEL</div>
              <SliderRow label="radius" value={wheelRadius} min={120} max={520} step={1} onChange={setWheelRadius} digits={0} />
              <SliderRow label="angle" value={wheelAngle} min={-3.14} max={3.14} step={0.01} onChange={setWheelAngle} digits={2} />
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-[11px] font-semibold text-white/60">
                  <input
                    type="checkbox"
                    checked={wheelAutoSpin}
                    onChange={(e) => setWheelAutoSpin(e.target.checked)}
                  />
                  Auto spin
                </label>
                <span className="font-mono text-[11px] text-white/70">{format(wheelSpinSpeed, 2)} rad/s</span>
              </div>
              <input
                type="range"
                min={-2}
                max={2}
                step={0.01}
                value={wheelSpinSpeed}
                onChange={(e) => setWheelSpinSpeed(Number(e.target.value))}
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-2">
                <NumberRow label="centerX" value={wheelCenterX} onChange={(v) => setWheelCenterX(Math.round(v))} />
                <NumberRow label="centerY" value={wheelCenterY} onChange={(v) => setWheelCenterY(Math.round(v))} />
              </div>

              <button
                type="button"
                onClick={() => setWheelVisible((v) => !v)}
                className="h-9 rounded-md border border-white/10 bg-black/10 px-3 text-[12px] font-semibold text-white/80 hover:bg-white/10"
              >
                {wheelVisible ? 'Hide roulette' : 'Show roulette'}
              </button>
            </section>

            <section className="grid gap-3">
              <div className="text-[11px] font-semibold text-white/50">HAND</div>
              <div className="grid grid-cols-2 gap-2">
                <NumberRow label="x" value={handX} onChange={(v) => setHandX(Math.round(v))} />
                <NumberRow label="y" value={handY} onChange={(v) => setHandY(Math.round(v))} />
              </div>
              <SliderRow label="angle" value={handAngle} min={-3.14} max={3.14} step={0.01} onChange={setHandAngle} digits={2} />
            </section>

            <section className="grid gap-3">
              <div className="text-[11px] font-semibold text-white/50">THUMB ARC</div>
              <SliderRow label="alpha" value={thumbArcAlpha} min={0} max={1} step={0.01} onChange={setThumbArcAlpha} digits={2} />
              <SliderRow label="radius" value={thumbArcRadius} min={120} max={900} step={1} onChange={setThumbArcRadius} digits={0} />
              <div className="grid grid-cols-2 gap-2">
                <NumberRow label="x" value={thumbArcX} onChange={(v) => setThumbArcX(Math.round(v))} />
                <NumberRow label="y" value={thumbArcY} onChange={(v) => setThumbArcY(Math.round(v))} />
              </div>
              <NumberRow label="radius" value={thumbArcRadius} onChange={(v) => setThumbArcRadius(Math.round(v))} />
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
