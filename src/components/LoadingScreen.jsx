import React from 'react';

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
    return localStorage.getItem(SPINNER_KEY) || 'circle';
  } catch {
    return 'circle';
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

const LogoSpinner = () => {
  const letters = [
    { src: '/custom_logos/brand/G.svg', alt: 'G' },
    { src: '/custom_logos/brand/R.svg', alt: 'R' },
    { src: '/custom_logos/brand/A.svg', alt: 'À' },
    { src: '/custom_logos/brand/F.svg', alt: 'F' },
    { src: '/custom_logos/brand/IC.svg', alt: 'IC' },
  ];
  return (
    <div className="relative flex flex-col items-center">
      <div className="flex items-center" style={{ gap: '2px' }}>
        {letters.map((l, i) => (
          <img
            key={i}
            src={l.src}
            alt={l.alt}
            className="text-foreground"
            style={{
              height: '40px',
              width: 'auto',
              opacity: 0,
              animation: `hg-typewriter 1.8s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes hg-typewriter {
          0% { opacity: 0; }
          15% { opacity: 1; }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const SPINNERS = {
  circle: CircleSpinner,
  hourglass: HourglassSpinner,
  dots: DotsSpinner,
  bars: BarsSpinner,
  pulse: PulseSpinner,
  logo: LogoSpinner,
};

const LoadingScreen = ({ spinnerId: propSpinnerId }) => {
  const id = propSpinnerId || getSpinnerId();
  const Spinner = SPINNERS[id] || CircleSpinner;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        <div className="flex justify-center">
          <Spinner />
        </div>
        <p className="mt-6 text-foreground text-sm font-medium">
          Carregant...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
