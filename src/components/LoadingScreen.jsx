import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const SPINNER_KEY = 'HG_LOADING_SPINNER';

export const SPINNER_OPTIONS = [
  { id: 'circle', label: 'Cercle' },
  { id: 'hourglass', label: 'Rellotge de sorra' },
  { id: 'dots', label: 'Punts' },
  { id: 'bars', label: 'Barres' },
  { id: 'pulse', label: 'Pols' },
  { id: 'logo', label: 'Logo GRÀFIC' },
];

export const getSpinnerId = () => {
  try {
    return localStorage.getItem(SPINNER_KEY) || 'logo';
  } catch {
    return 'logo';
  }
};

export const setSpinnerId = (id) => {
  try {
    localStorage.setItem(SPINNER_KEY, id);
  } catch {
    // ignore
  }
};

const CircleSpinner = () => (
  <div className="relative">
    <div className="w-16 h-16 border-4 border-muted rounded-full"></div>
    <div className="w-16 h-16 border-4 border-foreground rounded-full border-t-transparent absolute top-0 left-0 animate-spin"></div>
  </div>
);

const HourglassSpinner = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <svg className="w-12 h-12 text-foreground animate-spin" style={{ animationDuration: '2s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h12M6 22h12M6 2v4l6 6-6 6v4M18 2v4l-6 6 6 6v4" />
    </svg>
  </div>
);

const DotsSpinner = () => (
  <div className="flex gap-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-4 h-4 bg-foreground rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.6s' }}
      />
    ))}
  </div>
);

const BarsSpinner = () => (
  <div className="flex gap-1.5 items-end h-16">
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="w-2.5 bg-foreground rounded-sm"
        style={{
          height: '100%',
          animation: `loadingbar 1s ease-in-out ${i * 0.1}s infinite`,
        }}
      />
    ))}
    <style>{`
      @keyframes loadingbar {
        0%, 100% { transform: scaleY(0.3); }
        50% { transform: scaleY(1); }
      }
    `}</style>
  </div>
);

const PulseSpinner = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <div className="absolute w-12 h-12 border-4 border-foreground rounded-full animate-ping opacity-30"></div>
    <div className="w-6 h-6 bg-foreground rounded-full"></div>
  </div>
);

const LogoSpinner = () => (
  <div className="relative flex flex-col items-center">
    <div className="flex items-center justify-center text-foreground" style={{ gap: '3px', height: '40px' }}>
      <svg viewBox="0 0 629 1188" style={{ height: '40px', width: '21.2px', fill: 'currentColor', opacity: 0, animation: 'hg-typewriter 2.2s ease-in-out 0s infinite' }}><path d="M495.962,1130.24C444.684,1166.617 382.016,1188 314.358,1188C141.051,1188 0.486,1047.702 0.229,874.467C-0.006,687.649 -0.06,500.678 0.067,313.861C0.233,140.472 140.898,0 314.359,0C487.82,-0 628.484,140.472 628.65,313.861C628.666,336.75 628.679,359.642 628.689,382.535L463.484,382.535L463.484,314.167C463.484,231.897 396.663,165.104 314.359,165.104C232.054,165.104 165.233,231.897 165.233,314.167C165.233,396.438 164.662,777.346 164.662,864.672C164.662,951.999 235.589,1022.896 322.952,1022.896C410.315,1022.896 481.242,952.026 481.242,864.672L481.188,792.091L422.198,792.091L422.198,632.409L628.689,632.409L628.689,1173.884L525.807,1173.884L495.962,1130.24Z"/></svg>
      <svg viewBox="0 0 589 1164" style={{ height: '40px', width: '20.2px', fill: 'currentColor', opacity: 0, animation: 'hg-typewriter 2.2s ease-in-out 0.14s infinite' }}><path d="M536.917,936.997L487.816,1163.796L441.675,1163.797L279.742,618.125L162.981,618.125L162.981,1163.794L0.65,1163.794L0.65,0.657L299.687,0.657C470.263,0.657 588.88,138.879 588.88,309.384L588.88,309.397C588.88,431.949 537.107,537.822 433.587,587.682L536.917,936.997ZM299.687,161.829L161.89,161.829L161.89,456.952L299.687,456.952C381.213,456.952 427.64,390.889 427.64,309.397L427.64,309.384C427.64,227.892 381.213,161.829 299.687,161.829Z"/></svg>
      <svg viewBox="0 0 491 1164" style={{ height: '40px', width: '16.9px', fill: 'currentColor', opacity: 0, animation: 'hg-typewriter 2.2s ease-in-out 0.28s infinite' }}><path d="M404.592,275.279L197.539,11.614L199.823,0.861L357.032,0.861L490.934,627.541L490.934,1163.794L444.793,1163.794L399.294,955.33L159.648,955.33L115.106,1163.794L68.965,1163.796L0.957,936.997L158.136,197.097L279.471,275.116L404.592,275.279ZM364.857,794.158L279.471,394.542L194.086,794.158L364.857,794.158Z"/></svg>
      <svg viewBox="0 0 384 1164" style={{ height: '40px', width: '13.2px', fill: 'currentColor', opacity: 0, animation: 'hg-typewriter 2.2s ease-in-out 0.42s infinite' }}><path d="M0.812,624.124L0.773,0.386L383.482,0.386L383.482,161.829L160.765,161.829L160.765,456.699L310.819,456.699L310.819,619.426L160.765,619.426L160.765,1163.825L114.624,1163.794L0.812,624.124Z"/></svg>
      <svg viewBox="0 0 627 1176" style={{ height: '40px', width: '21.3px', fill: 'currentColor', opacity: 0, animation: 'hg-typewriter 2.2s ease-in-out 0.56s infinite' }}><path d="M162.637,0.386L162.637,861.82C162.637,944.094 229.462,1010.89 311.772,1010.89C394.082,1010.89 460.908,944.094 460.908,861.82L460.908,793.45L626.123,793.45C626.113,816.344 626.1,839.237 626.084,862.127C625.918,1035.522 485.245,1176 311.772,1176C138.3,1176 0.487,1035.522 0.321,862.127L0.29,189.516L139.566,0.386L162.637,0.386ZM311.811,161.835L311.811,0.386C485.283,0.386 625.957,140.863 626.123,314.259L626.161,370.504L460.946,370.504L460.946,310.905C460.946,228.631 394.121,161.835 311.811,161.835Z"/></svg>
    </div>
  </div>
);

const SPINNERS = {
  circle: CircleSpinner,
  hourglass: HourglassSpinner,
  dots: DotsSpinner,
  bars: BarsSpinner,
  pulse: PulseSpinner,
  logo: LogoSpinner,
};

export const dismissAppPreloader = () => {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('app-preloader');
  if (el && !el.classList.contains('fade-out')) {
    el.classList.add('fade-out');
    setTimeout(() => {
      try { el.remove(); } catch {}
    }, 500);
  }
};

export const DismissPreloaderOnMount = () => {
  useEffect(() => {
    // Breu pausa de 120ms per permetre que la geometria del layout (SiteFrame, FullWideSlideHeader) s'estabilitzi completament
    const timer = setTimeout(() => {
      dismissAppPreloader();
    }, 120);
    return () => clearTimeout(timer);
  }, []);
  return null;
};

const LoadingScreen = ({ spinnerId: propSpinnerId }) => {
  // Evitar duplicar l'spinner si l'overlay HTML inicial encara està present
  if (typeof document !== 'undefined' && document.getElementById('app-preloader')) {
    return null;
  }

  const id = propSpinnerId || getSpinnerId();
  const Spinner = SPINNERS[id] || LogoSpinner;

  const content = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: '#ffffff',
        color: '#141414',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
        <p style={{ marginTop: '24px', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '14px', fontWeight: 500, color: '#141414', letterSpacing: '0.3px', lineHeight: 'normal' }}>
          Carregant...
        </p>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return ReactDOM.createPortal(content, document.body);
  }

  return content;
};

export default LoadingScreen;
