import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AdidasColorStripeButtons from '@/components/AdidasColorStripeButtons';

export default function AdidasStripeZoomDevPage() {
  const viewportRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, startTx: 0, startTy: 0 });
  const nudgeRef = useRef({ timer: null, ticks: 0, dx: 0, dy: 0, step: 2, running: false });

  const [scale, setScale] = useState(2.6);
  const [tx, setTx] = useState(-260);
  const [ty, setTy] = useState(-40);
  const [urlTick, setUrlTick] = useState(0);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState('2p1');
  const [sizeChainMode, setSizeChainMode] = useState('off');
  const [lockAspect, setLockAspect] = useState(true);

  const megaTileSize = 360;

  const selectedColorOrder = useMemo(() => ['white', 'kiwi'], []);

  const colorLabelBySlug = useMemo(
    () => ({
      white: 'White',
      kiwi: 'Kiwi',
    }),
    []
  );

  const colorButtonSrcBySlug = useMemo(
    () => ({
      white: '/placeholders/t-shirt_buttons/selector-color-white.png',
      kiwi: '/placeholders/t-shirt_buttons/selector-color-kiwi.png',
    }),
    []
  );

  const onSelect = useCallback(() => {}, []);

  const readIntParam = useCallback((key, fallback = 0) => {
    try {
      const url = new URL(window.location.href);
      const raw = url.searchParams.get(key);
      if (raw == null || raw === '') return fallback;
      const n = Number.parseInt(raw, 10);
      return Number.isFinite(n) ? n : fallback;
    } catch {
      return fallback;
    }
  }, [urlTick]);

  const readFloatParam = useCallback((key, fallback = 0) => {
    try {
      const url = new URL(window.location.href);
      const raw = url.searchParams.get(key);
      if (raw == null || raw === '') return fallback;
      const n = Number.parseFloat(raw);
      return Number.isFinite(n) ? n : fallback;
    } catch {
      return fallback;
    }
  }, [urlTick]);

  const bumpParam = useCallback((key, delta) => {
    try {
      const url = new URL(window.location.href);
      const currentRaw = url.searchParams.get(key);
      const current = currentRaw == null || currentRaw === '' ? 0 : Number.parseInt(currentRaw, 10);
      const next = (Number.isFinite(current) ? current : 0) + delta;
      if (next === 0) url.searchParams.delete(key);
      else url.searchParams.set(key, String(next));
      window.history.replaceState({}, '', url.toString());
      setUrlTick((v) => v + 1);
    } catch {
      // noop
    }
  }, []);

  const bumpFloatParam = useCallback((key, delta, precision = 2) => {
    try {
      const url = new URL(window.location.href);
      const currentRaw = url.searchParams.get(key);
      const current = currentRaw == null || currentRaw === '' ? 0 : Number.parseFloat(currentRaw);
      const next = (Number.isFinite(current) ? current : 0) + delta;
      if (next === 0) url.searchParams.delete(key);
      else url.searchParams.set(key, next.toFixed(precision));
      window.history.replaceState({}, '', url.toString());
      setUrlTick((v) => v + 1);
    } catch {
      // noop
    }
  }, []);

  const setIntParam = useCallback((key, nextValue) => {
    try {
      const url = new URL(window.location.href);
      if (nextValue == null || nextValue === '') url.searchParams.delete(key);
      else url.searchParams.set(key, String(nextValue));
      window.history.replaceState({}, '', url.toString());
      setUrlTick((v) => v + 1);
    } catch {
      // noop
    }
  }, []);

  const setFloatParam = useCallback((key, nextValue, precision = 2) => {
    try {
      const url = new URL(window.location.href);
      if (nextValue == null || nextValue === '') {
        url.searchParams.delete(key);
      } else {
        const n = Number.parseFloat(nextValue);
        if (!Number.isFinite(n)) return;
        url.searchParams.set(key, n.toFixed(precision));
      }
      window.history.replaceState({}, '', url.toString());
      setUrlTick((v) => v + 1);
    } catch {
      // noop
    }
  }, []);

  const panelOptions = useMemo(
    () => [
      ...Array.from({ length: 5 }).map((_, i) => ({ id: `1p${i + 1}`, label: `1p${i + 1} (white)` })),
      ...Array.from({ length: 7 }).map((_, i) => ({ id: `2p${i + 1}`, label: `2p${i + 1} (kiwi)` })),
    ],
    []
  );

  const selectedXKey = `${selectedPanel}x`;
  const selectedYKey = `${selectedPanel}y`;
  const selectedDegKey = `${selectedPanel}deg`;
  const selectedWKey = `${selectedPanel}w`;
  const selectedHKey = `${selectedPanel}h`;
  const selectedOnKey = `${selectedPanel}on`;

  const sizeChainPanels = useMemo(() => {
    if (sizeChainMode === 'kiwi') return Array.from({ length: 7 }).map((_, i) => `2p${i + 1}`);
    if (sizeChainMode === 'white') return Array.from({ length: 5 }).map((_, i) => `1p${i + 1}`);
    if (sizeChainMode === 'all') {
      return [
        ...Array.from({ length: 5 }).map((_, i) => `1p${i + 1}`),
        ...Array.from({ length: 7 }).map((_, i) => `2p${i + 1}`),
      ];
    }
    return [];
  }, [sizeChainMode]);

  const sizeWKeys = useMemo(() => {
    if (sizeChainPanels.length === 0) return [selectedWKey];
    return sizeChainPanels.map((p) => `${p}w`);
  }, [selectedWKey, sizeChainPanels]);

  const sizeHKeys = useMemo(() => {
    if (sizeChainPanels.length === 0) return [selectedHKey];
    return sizeChainPanels.map((p) => `${p}h`);
  }, [selectedHKey, sizeChainPanels]);

  const stopNudge = useCallback(() => {
    const t = nudgeRef.current.timer;
    if (t) window.clearInterval(t);
    nudgeRef.current = { timer: null, ticks: 0, dx: 0, dy: 0, step: 2, running: false };
  }, []);

  const startNudge = useCallback(
    (dx, dy) => {
      stopNudge();

      const apply = (mul) => {
        if (dx !== 0) bumpParam(selectedXKey, dx * mul);
        if (dy !== 0) bumpParam(selectedYKey, dy * mul);
      };

      nudgeRef.current = { timer: null, ticks: 0, dx, dy, step: 2, running: true };
      apply(1);

      const tick = () => {
        if (!nudgeRef.current.running) return;
        nudgeRef.current.ticks += 1;
        const k = nudgeRef.current.ticks;
        const mul = k > 35 ? 6 : k > 20 ? 4 : k > 10 ? 3 : 2;
        apply(mul);
      };

      nudgeRef.current.timer = window.setInterval(tick, 80);
    },
    [bumpParam, selectedXKey, selectedYKey, stopNudge]
  );

  const selectedX = readIntParam(selectedXKey, 0);
  const selectedY = readIntParam(selectedYKey, 0);
  const selectedDeg = readFloatParam(selectedDegKey, 0);
  const selectedW = readIntParam(selectedWKey, 0);
  const selectedH = readIntParam(selectedHKey, 0);
  const hasOnToggle = selectedPanel === '1p5';

  const panelIdBySizeKey = useCallback((key) => key.replace(/[wh]$/, ''), []);

  const getPanelAspect = useCallback(
    (panelId, nextW = null, nextH = null) => {
      const w = nextW != null ? nextW : readIntParam(`${panelId}w`, 0);
      const h = nextH != null ? nextH : readIntParam(`${panelId}h`, 0);
      if (w > 0 && h > 0) return h / w;
      return 1;
    },
    [readIntParam]
  );

  const setPanelWWithAspect = useCallback(
    (panelId, nextW) => {
      if (!lockAspect) return setIntParam(`${panelId}w`, nextW);
      const aspect = getPanelAspect(panelId, null, null);
      const nextH = Math.max(0, Math.round(nextW * aspect));
      setIntParam(`${panelId}w`, nextW);
      setIntParam(`${panelId}h`, nextH);
    },
    [getPanelAspect, lockAspect, setIntParam]
  );

  const setPanelHWithAspect = useCallback(
    (panelId, nextH) => {
      if (!lockAspect) return setIntParam(`${panelId}h`, nextH);
      const aspect = getPanelAspect(panelId, null, null);
      const nextW = aspect === 0 ? 0 : Math.max(0, Math.round(nextH / aspect));
      setIntParam(`${panelId}w`, nextW);
      setIntParam(`${panelId}h`, nextH);
    },
    [getPanelAspect, lockAspect, setIntParam]
  );

  const toggleParam = useCallback((key) => {
    try {
      const url = new URL(window.location.href);
      const currentRaw = url.searchParams.get(key);
      const current = currentRaw == null || currentRaw === '' ? 0 : Number.parseInt(currentRaw, 10);
      const next = current === 1 ? 0 : 1;
      if (next === 0) url.searchParams.delete(key);
      else url.searchParams.set(key, '1');
      window.history.replaceState({}, '', url.toString());
      setUrlTick((v) => v + 1);
    } catch {
      // noop
    }
  }, []);

  const clearParams = useCallback((keys) => {
    try {
      const url = new URL(window.location.href);
      for (const k of keys) url.searchParams.delete(k);
      window.history.replaceState({}, '', url.toString());
      setUrlTick((v) => v + 1);
    } catch {
      // noop
    }
  }, []);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const resetView = useCallback(() => {
    setScale(2.6);
    setTx(-260);
    setTy(-40);
  }, []);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY;
    const nextScale = clamp(delta > 0 ? scale * 0.92 : scale * 1.08, 0.6, 6);

    const worldX = (mouseX - tx) / scale;
    const worldY = (mouseY - ty) / scale;

    const nextTx = mouseX - worldX * nextScale;
    const nextTy = mouseY - worldY * nextScale;

    setScale(nextScale);
    setTx(nextTx);
    setTy(nextTy);
  }, [scale, tx, ty]);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, startTx: tx, startTy: ty };
  }, [tx, ty]);

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setTx(dragRef.current.startTx + dx);
    setTy(dragRef.current.startTy + dy);
  }, []);

  const stopDrag = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', stopDrag);
    return () => window.removeEventListener('mouseup', stopDrag);
  }, [stopDrag]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-[0.18em] text-black/50">DEV</div>
            <div className="mt-1 text-xl font-black tracking-tight text-black">Adidas Stripe Zoom</div>
            <div className="mt-1 text-sm text-black/60">
              Zoom amb la roda, pan arrossegant.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`h-10 rounded-full border px-4 text-sm font-semibold hover:bg-black/5 ${
                debugEnabled ? 'border-emerald-400/60 bg-emerald-50 text-emerald-900' : 'border-black/15 bg-white text-black/80'
              }`}
              onClick={() => setDebugEnabled((v) => !v)}
            >
              Debug {debugEnabled ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              className="h-10 rounded-full border border-black/15 bg-white px-4 text-sm font-semibold text-black/80 hover:bg-black/5"
              onClick={resetView}
            >
              Reset
            </button>
            <label className="flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-sm text-black/80">
              <span className="font-semibold">Zoom</span>
              <input
                type="range"
                min={0.6}
                max={6}
                step={0.05}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
              />
              <span className="w-14 text-right font-mono text-[12px]">{scale.toFixed(2)}x</span>
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div
            ref={viewportRef}
            className="relative h-[78vh] overflow-hidden rounded-3xl border border-black/10 bg-neutral-50"
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
          >
            <div
              className="absolute left-0 top-0"
              style={{
                transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                transformOrigin: '0 0',
                cursor: dragRef.current.active ? 'grabbing' : 'grab',
              }}
            >
              <div className="relative" style={{ width: `${Math.round(megaTileSize * (161 / 145)) * 2}px`, height: `${megaTileSize}px` }}>
                <AdidasColorStripeButtons
                  megaTileSize={megaTileSize}
                  forceDebugStripeHit={debugEnabled}
                  ignoreUrlDebugStripeHit
                  debugSelectedPanel={debugEnabled ? selectedPanel : ''}
                  selectedColorOrder={selectedColorOrder}
                  selectedColorSlug="kiwi"
                  onSelect={onSelect}
                  colorLabelBySlug={colorLabelBySlug}
                  colorButtonSrcBySlug={colorButtonSrcBySlug}
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-5">
            <div className="text-sm font-semibold text-black">Controls ràpids</div>
            <div className="mt-3 space-y-2 text-sm text-black/70">
              <div>
                <span className="font-semibold">Debug overlay:</span> <span className="font-mono">{debugEnabled ? 'ON' : 'OFF'}</span>
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Global (totes les peces)</span>
                  <button
                    type="button"
                    className="rounded-full border border-black/15 bg-white px-3 py-1 text-xs font-semibold text-black/80 hover:bg-black/5"
                    onClick={() => clearParams(['allx', 'ally'])}
                  >
                    Reset
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[12px]">allx</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="h-7 w-7 rounded-full border border-black/15 bg-white text-sm font-bold hover:bg-black/5" onClick={() => bumpParam('allx', -1)}>
                      -
                    </button>
                    <span className="w-10 text-center font-mono text-[12px]">{readIntParam('allx', 0)}</span>
                    <button type="button" className="h-7 w-7 rounded-full border border-black/15 bg-white text-sm font-bold hover:bg-black/5" onClick={() => bumpParam('allx', 1)}>
                      +
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[12px]">ally</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="h-7 w-7 rounded-full border border-black/15 bg-white text-sm font-bold hover:bg-black/5" onClick={() => bumpParam('ally', -1)}>
                      -
                    </button>
                    <span className="w-10 text-center font-mono text-[12px]">{readIntParam('ally', 0)}</span>
                    <button type="button" className="h-7 w-7 rounded-full border border-black/15 bg-white text-sm font-bold hover:bg-black/5" onClick={() => bumpParam('ally', 1)}>
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Panell</span>
                  <button
                    type="button"
                    className="rounded-full border border-black/15 bg-white px-3 py-1 text-xs font-semibold text-black/80 hover:bg-black/5"
                    onClick={() => clearParams([selectedXKey, selectedYKey, selectedDegKey, selectedWKey, selectedHKey, ...(hasOnToggle ? [selectedOnKey] : [])])}
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-2">
                  <select
                    className="h-10 w-full rounded-2xl border border-black/15 bg-white px-3 text-sm font-semibold text-black/80"
                    value={selectedPanel}
                    onChange={(e) => setSelectedPanel(e.target.value)}
                  >
                    {panelOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-2">
                  <div className="text-[11px] font-semibold text-black/55">Mida encadenada (w/h)</div>
                  <select
                    className="mt-1 h-9 w-full rounded-2xl border border-black/15 bg-white px-3 text-sm font-semibold text-black/80"
                    value={sizeChainMode}
                    onChange={(e) => setSizeChainMode(e.target.value)}
                  >
                    <option value="off">OFF (només panell seleccionat)</option>
                    <option value="kiwi">Kiwi (2p1..2p7)</option>
                    <option value="white">White (1p1..1p5)</option>
                    <option value="all">Tots (1p1..1p5 + 2p1..2p7)</option>
                  </select>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-black/55">Lock aspect-ratio</span>
                  <button
                    type="button"
                    className={`h-8 rounded-full border px-3 text-xs font-semibold hover:bg-black/5 ${
                      lockAspect ? 'border-emerald-400/60 bg-emerald-50 text-emerald-900' : 'border-black/15 bg-white text-black/80'
                    }`}
                    onClick={() => setLockAspect((v) => !v)}
                  >
                    {lockAspect ? 'ON' : 'OFF'}
                  </button>
                </div>

                {hasOnToggle ? (
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-[12px]">{selectedOnKey}</span>
                    <button
                      type="button"
                      className={`rounded-full border px-3 py-1 text-xs font-semibold hover:bg-black/5 ${readIntParam(selectedOnKey, 0) === 1 ? 'border-emerald-400/60 bg-emerald-50 text-emerald-900' : 'border-black/15 bg-white text-black/80'}`}
                      onClick={() => toggleParam(selectedOnKey)}
                    >
                      {readIntParam(selectedOnKey, 0) === 1 ? 'ON' : 'OFF'}
                    </button>
                  </div>
                ) : null}

                <div className="mt-3 rounded-2xl border border-black/10 bg-neutral-50 p-3">
                  <div className="text-xs font-semibold text-black/70">Comandaments</div>

                  <div className="mt-2 grid grid-cols-[110px_1fr] gap-3">
                    <div className="grid grid-cols-3 grid-rows-3 gap-1">
                      <div />
                      <button
                        type="button"
                        className="h-9 rounded-xl border border-black/15 bg-white text-sm font-semibold text-black/80 hover:bg-black/5"
                        onMouseDown={() => startNudge(0, -1)}
                        onMouseUp={stopNudge}
                        onMouseLeave={stopNudge}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          startNudge(0, -1);
                        }}
                        onTouchEnd={stopNudge}
                      >
                        ↑
                      </button>
                      <div />
                      <button
                        type="button"
                        className="h-9 rounded-xl border border-black/15 bg-white text-sm font-semibold text-black/80 hover:bg-black/5"
                        onMouseDown={() => startNudge(-1, 0)}
                        onMouseUp={stopNudge}
                        onMouseLeave={stopNudge}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          startNudge(-1, 0);
                        }}
                        onTouchEnd={stopNudge}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        className="h-9 rounded-xl border border-black/15 bg-white text-xs font-semibold text-black/70 hover:bg-black/5"
                        onClick={() => {
                          setIntParam(selectedXKey, 0);
                          setIntParam(selectedYKey, 0);
                        }}
                      >
                        0,0
                      </button>
                      <button
                        type="button"
                        className="h-9 rounded-xl border border-black/15 bg-white text-sm font-semibold text-black/80 hover:bg-black/5"
                        onMouseDown={() => startNudge(1, 0)}
                        onMouseUp={stopNudge}
                        onMouseLeave={stopNudge}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          startNudge(1, 0);
                        }}
                        onTouchEnd={stopNudge}
                      >
                        →
                      </button>
                      <div />
                      <button
                        type="button"
                        className="h-9 rounded-xl border border-black/15 bg-white text-sm font-semibold text-black/80 hover:bg-black/5"
                        onMouseDown={() => startNudge(0, 1)}
                        onMouseUp={stopNudge}
                        onMouseLeave={stopNudge}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          startNudge(0, 1);
                        }}
                        onTouchEnd={stopNudge}
                      >
                        ↓
                      </button>
                      <div />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" className="h-9 rounded-xl border border-black/15 bg-white text-sm font-semibold text-black/80 hover:bg-black/5" onClick={() => bumpFloatParam(selectedDegKey, -1, 2)}>
                        deg-1
                      </button>
                      <button type="button" className="h-9 rounded-xl border border-black/15 bg-white text-sm font-semibold text-black/80 hover:bg-black/5" onClick={() => bumpFloatParam(selectedDegKey, 1, 2)}>
                        deg+1
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="h-9 rounded-xl border border-black/15 bg-white text-sm font-semibold text-black/80 hover:bg-black/5"
                      onClick={() =>
                        sizeWKeys.forEach((k) => {
                          const panelId = panelIdBySizeKey(k);
                          const currentW = readIntParam(`${panelId}w`, 0);
                          const nextW = Math.max(0, currentW - 2);
                          setPanelWWithAspect(panelId, nextW);
                        })
                      }
                    >
                      w-2
                    </button>
                    <button
                      type="button"
                      className="h-9 rounded-xl border border-black/15 bg-white text-sm font-semibold text-black/80 hover:bg-black/5"
                      onClick={() =>
                        sizeWKeys.forEach((k) => {
                          const panelId = panelIdBySizeKey(k);
                          const currentW = readIntParam(`${panelId}w`, 0);
                          const nextW = Math.max(0, currentW + 2);
                          setPanelWWithAspect(panelId, nextW);
                        })
                      }
                    >
                      w+2
                    </button>
                    <button
                      type="button"
                      className="h-9 rounded-xl border border-black/15 bg-white text-sm font-semibold text-black/80 hover:bg-black/5"
                      onClick={() =>
                        sizeHKeys.forEach((k) => {
                          const panelId = panelIdBySizeKey(k);
                          const currentH = readIntParam(`${panelId}h`, 0);
                          const nextH = Math.max(0, currentH - 2);
                          setPanelHWithAspect(panelId, nextH);
                        })
                      }
                    >
                      h-2
                    </button>
                    <button
                      type="button"
                      className="h-9 rounded-xl border border-black/15 bg-white text-sm font-semibold text-black/80 hover:bg-black/5"
                      onClick={() =>
                        sizeHKeys.forEach((k) => {
                          const panelId = panelIdBySizeKey(k);
                          const currentH = readIntParam(`${panelId}h`, 0);
                          const nextH = Math.max(0, currentH + 2);
                          setPanelHWithAspect(panelId, nextH);
                        })
                      }
                    >
                      h+2
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-[56px_1fr] items-center gap-2">
                    <span className="text-xs font-semibold text-black/50">x</span>
                    <input
                      className="h-9 rounded-xl border border-black/15 bg-white px-3 font-mono text-sm"
                      inputMode="numeric"
                      value={String(selectedX)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '' || raw === '-') return setIntParam(selectedXKey, '');
                        const next = Number.parseInt(raw, 10);
                        if (!Number.isFinite(next)) return;
                        setIntParam(selectedXKey, next);
                      }}
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-[56px_1fr] items-center gap-2">
                    <span className="text-xs font-semibold text-black/50">y</span>
                    <input
                      className="h-9 rounded-xl border border-black/15 bg-white px-3 font-mono text-sm"
                      inputMode="numeric"
                      value={String(selectedY)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '' || raw === '-') return setIntParam(selectedYKey, '');
                        const next = Number.parseInt(raw, 10);
                        if (!Number.isFinite(next)) return;
                        setIntParam(selectedYKey, next);
                      }}
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-[56px_1fr] items-center gap-2">
                    <span className="text-xs font-semibold text-black/50">deg</span>
                    <input
                      className="h-9 rounded-xl border border-black/15 bg-white px-3 font-mono text-sm"
                      inputMode="decimal"
                      value={selectedDeg.toFixed(2)}
                      onChange={(e) => setFloatParam(selectedDegKey, e.target.value, 2)}
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-[56px_1fr] items-center gap-2">
                    <span className="text-xs font-semibold text-black/50">w</span>
                    <input
                      className="h-9 rounded-xl border border-black/15 bg-white px-3 font-mono text-sm"
                      inputMode="numeric"
                      value={String(selectedW)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '' || raw === '-') return sizeWKeys.forEach((k) => setIntParam(k, ''));
                        const next = Number.parseInt(raw, 10);
                        if (!Number.isFinite(next)) return;
                        sizeWKeys.forEach((k) => {
                          const panelId = panelIdBySizeKey(k);
                          setPanelWWithAspect(panelId, Math.max(0, next));
                        });
                      }}
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-[56px_1fr] items-center gap-2">
                    <span className="text-xs font-semibold text-black/50">h</span>
                    <input
                      className="h-9 rounded-xl border border-black/15 bg-white px-3 font-mono text-sm"
                      inputMode="numeric"
                      value={String(selectedH)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '' || raw === '-') return sizeHKeys.forEach((k) => setIntParam(k, ''));
                        const next = Number.parseInt(raw, 10);
                        if (!Number.isFinite(next)) return;
                        sizeHKeys.forEach((k) => {
                          const panelId = panelIdBySizeKey(k);
                          setPanelHWithAspect(panelId, Math.max(0, next));
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="mt-2 text-xs text-black/55">
                  Keys:
                  <div className="font-mono">{selectedXKey}, {selectedYKey}, {selectedDegKey}, {selectedWKey}, {selectedHKey}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-neutral-50 p-3 text-xs text-black/60">
              Nota: aquí només renderitzem <code className="font-mono">white</code> i <code className="font-mono">kiwi</code>
              perquè el kiwi quedi a <code className="font-mono">idx=1</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
