import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function ThumbFramePage() {
  const location = useLocation();

  const [alpha, setAlpha] = React.useState(0.9);
  const [arcRadius, setArcRadius] = React.useState(420);
  const [arcStroke, setArcStroke] = React.useState(0);
  const [circleX, setCircleX] = React.useState(-110);
  const [circleY, setCircleY] = React.useState(210);

  const { width, height, fit } = useMemo(() => {
    const params = new URLSearchParams(location.search || '');
    const w = Number(params.get('w'));
    const h = Number(params.get('h'));
    const fitMode = params.get('fit') === '1' || params.get('fit') === 'true';

    return {
      width: Number.isFinite(w) && w > 0 ? Math.round(w) : 488,
      height: Number.isFinite(h) && h > 0 ? Math.round(h) : 1070,
      fit: fitMode
    };
  }, [location.search]);

  const scale = useMemo(() => {
    if (!fit) return 1;
    const maxW = Math.max(0, window.innerWidth - 48);
    const maxH = Math.max(0, window.innerHeight - 48);
    if (!maxW || !maxH) return 1;
    return Math.min(1, maxW / width, maxH / height);
  }, [fit, width, height]);

  return (
    <div className="min-h-screen bg-white">
      <SEO title="Thumb frame" description="Frame de mida fixa per reconstruir la thumb page" />

      <div className="min-h-screen w-full flex items-center justify-center p-6">
        <div
          className="relative"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'center',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.12)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.10)',
            }}
          />

          <div className="absolute inset-0 flex">
            <div className="relative flex-1 overflow-hidden" style={{ background: '#ff0000' }}>
              <div
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  width: `${arcRadius * 2}px`,
                  height: `${arcRadius * 2}px`,
                  transform: `translate(calc(-50% + ${circleX}px), calc(-50% + ${circleY}px))`,
                  borderRadius: '9999px',
                  background: '#55aa00',
                  opacity: alpha,
                  outline: arcStroke > 0 ? `${arcStroke}px solid rgba(0,0,0,0.12)` : 'none',
                }}
              />
            </div>

            <div
              className="shrink-0"
              style={{
                width: '176px',
                borderLeft: '1px solid rgba(0,0,0,0.10)',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <div className="px-3 pt-8 pb-3">
                <div className="text-[11px] font-semibold text-black/60">Thumb arc</div>
                <div className="mt-1 grid gap-3">
                  <label className="grid gap-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-black/60">
                      <span>α</span>
                      <span className="font-mono">{Math.round(alpha * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={alpha}
                      onChange={(e) => setAlpha(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </label>

                  <label className="grid gap-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-black/60">
                      <span>R</span>
                      <span className="font-mono">{arcRadius}</span>
                    </div>
                    <input
                      type="range"
                      min="120"
                      max="900"
                      step="1"
                      value={arcRadius}
                      onChange={(e) => setArcRadius(parseInt(e.target.value, 10))}
                      className="w-full"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="grid gap-1">
                      <div className="text-[11px] font-semibold text-black/60">x</div>
                      <input
                        className="h-8 rounded-md border border-black/15 bg-white px-2 font-mono text-[12px]"
                        inputMode="numeric"
                        value={String(circleX)}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === '' || raw === '-') return;
                          const next = Number.parseInt(raw, 10);
                          if (!Number.isFinite(next)) return;
                          setCircleX(next);
                        }}
                      />
                    </label>
                    <label className="grid gap-1">
                      <div className="text-[11px] font-semibold text-black/60">y</div>
                      <input
                        className="h-8 rounded-md border border-black/15 bg-white px-2 font-mono text-[12px]"
                        inputMode="numeric"
                        value={String(circleY)}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === '' || raw === '-') return;
                          const next = Number.parseInt(raw, 10);
                          if (!Number.isFinite(next)) return;
                          setCircleY(next);
                        }}
                      />
                    </label>
                  </div>

                  <label className="grid gap-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-black/60">
                      <span>Traç</span>
                      <span className="font-mono">{arcStroke}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="1"
                      value={arcStroke}
                      onChange={(e) => setArcStroke(parseInt(e.target.value, 10))}
                      className="w-full"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-3 py-2 text-[11px] text-black/55">
            <div className="font-mono">{width}×{height}</div>
            <div className="font-mono">/admin/draft/thumb</div>
          </div>
        </div>
      </div>
    </div>
  );
}
