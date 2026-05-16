import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { getSafeBelt } from '@/utils/layoutMetrics';

const PAUTA_SRC = '/tmp/PAUTES/PAUTA-4-COLUMNES.png';
const MOCKUP_SRC = '/tmp/PAGINES/PAGINES TIPUS/00 COLLECCIO.png';
const POSITION_SRC = '/tmp/PAGINES/PAGINES TIPUS/00 POSICIO COLLECCIO.png';

// Dimensions reals dels assets (per calcular l'aspect ratio).
// Els mockups comparteixen la mateixa amplada que la pauta (2642 px),
// així que estan pre-alineats horitzontalment al mateix canvas.
const PAUTA_W = 2642;
const PAUTA_H = 8417;
const MOCKUP_W = 2642;
const MOCKUP_H = 6708;

// Mateixos paràmetres que /constructor/tdp (TdpPage):
//   getSafeBelt({ maxContent: 1400, sideMargin: 76, minContent: 320 })
//   TDP_PAGE_TOP_OFFSET = '33px'
const BELT_OPTS = { maxContent: 1400, sideMargin: 76, minContent: 320 };
const PAGE_TOP_OFFSET_PX = 33;

// Bump the version when the schema changes so old saved state is discarded.
const LS_KEY = 'hg.devPautaCollectionAlign.v3';

const DEFAULT_STATE = {
  // Opacitats individuals per a comparar visualment.
  pautaOpacity: 1,
  mockupOpacity: 1,
  positionOpacity: 0.5,
  positionVisible: false,
};

function loadState() {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function PautaCollectionAlignPage() {
  const [state, setState] = useState(loadState);
  const [beltWidth, setBeltWidth] = useState(() => {
    if (typeof window === 'undefined') return BELT_OPTS.maxContent;
    try {
      const belt = getSafeBelt(BELT_OPTS);
      return Math.max(BELT_OPTS.minContent, belt.right - belt.left);
    } catch {
      return BELT_OPTS.maxContent;
    }
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Manté el belt sincronitzat com fa /constructor/tdp (mateixos paràmetres).
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const root = document.documentElement;

    const apply = () => {
      const belt = getSafeBelt(BELT_OPTS);
      root.style.setProperty('--hg-tdp-xL', `${belt.left}px`);
      root.style.setProperty('--hg-tdp-xR', `${belt.right}px`);
      setBeltWidth(Math.max(BELT_OPTS.minContent, belt.right - belt.left));
    };

    apply();

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
      root.style.removeProperty('--hg-tdp-xL');
      root.style.removeProperty('--hg-tdp-xR');
    };
  }, []);

  const update = useCallback((patch) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  // Mides calculades a partir del belt actual conservant l'aspect ratio real.
  // Tots els assets comparteixen el canvas (2642 px d'amplada) i estan
  // pre-alineats horitzontalment, així que els fixem a width = belt.
  const pautaHeight = useMemo(() => (beltWidth * PAUTA_H) / PAUTA_W, [beltWidth]);
  const mockupHeight = useMemo(() => (beltWidth * MOCKUP_H) / MOCKUP_W, [beltWidth]);

  const beltContainerStyle = {
    position: 'relative',
    left: '50%',
    width: 'calc(var(--belt2-xR, var(--hg-tdp-xR, 100vw)) - var(--belt2-xL, var(--hg-tdp-xL, 0px)))',
    transform: 'translateX(-50%)',
    paddingTop: `${PAGE_TOP_OFFSET_PX}px`,
    paddingBottom: '64px',
  };

  return (
    <>
      <Helmet>
        <title>Dev · Pauta + 00 Col·lecció</title>
      </Helmet>

      <main className="relative min-h-screen bg-background">
        <div style={beltContainerStyle}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: `${pautaHeight}px`,
              overflow: 'visible',
            }}
          >
            <img
              src={PAUTA_SRC}
              alt="Pauta 4 columnes"
              draggable={false}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${pautaHeight}px`,
                opacity: state.pautaOpacity,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
            <img
              src={MOCKUP_SRC}
              alt="00 Col·lecció (mockup)"
              draggable={false}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${mockupHeight}px`,
                opacity: state.mockupOpacity,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
            {state.positionVisible ? (
              <img
                src={POSITION_SRC}
                alt="00 Posició Col·lecció (referència)"
                draggable={false}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${mockupHeight}px`,
                  opacity: state.positionOpacity,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  mixBlendMode: 'multiply',
                }}
              />
            ) : null}
          </div>
        </div>

        {/* Controls de calibratge — flotants i no afecten el layout */}
        <div
          style={{
            position: 'fixed',
            right: 16,
            top: 120,
            width: 260,
            zIndex: 60,
            background: 'rgba(255,255,255,0.96)',
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 10,
            padding: 12,
            fontSize: 12,
            boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
          }}
          className="font-mono text-neutral-800"
        >
          <div className="flex items-center justify-between mb-2">
            <strong>Calibratge mockup</strong>
            <button
              type="button"
              onClick={reset}
              className="text-[10px] uppercase tracking-wide px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200"
            >
              Reset
            </button>
          </div>

          <Slider
            label="Opacitat pauta"
            min={0}
            max={1}
            step={0.05}
            value={state.pautaOpacity}
            onChange={(v) => update({ pautaOpacity: v })}
            format={(v) => v.toFixed(2)}
          />
          <Slider
            label="Opacitat mockup"
            min={0}
            max={1}
            step={0.05}
            value={state.mockupOpacity}
            onChange={(v) => update({ mockupOpacity: v })}
            format={(v) => v.toFixed(2)}
          />

          <label className="flex items-center gap-2 mb-1 text-[11px] text-neutral-700">
            <input
              type="checkbox"
              checked={state.positionVisible}
              onChange={(e) => update({ positionVisible: e.target.checked })}
            />
            <span>Capa POSICIÓ (referència)</span>
          </label>
          <Slider
            label="Opacitat posició"
            min={0}
            max={1}
            step={0.05}
            value={state.positionOpacity}
            onChange={(v) => update({ positionOpacity: v })}
            format={(v) => v.toFixed(2)}
          />

          <div className="mt-2 text-[10px] text-neutral-500 leading-snug">
            Belt: {Math.round(beltWidth)} px (TDP-like, top {PAGE_TOP_OFFSET_PX} px).<br />
            Pauta: {PAUTA_W}×{PAUTA_H} · Mockup: {MOCKUP_W}×{MOCKUP_H}.<br />
            Mockup escalat a {Math.round(beltWidth)}×{Math.round(mockupHeight)} px (100% pauta).
          </div>
        </div>
      </main>
    </>
  );
}

function Slider({ label, min, max, step, value, onChange, format }) {
  return (
    <label className="block mb-2">
      <div className="flex items-center justify-between text-[11px] text-neutral-700">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-900">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-orange-600"
      />
    </label>
  );
}
