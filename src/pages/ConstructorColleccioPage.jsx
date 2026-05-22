import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import CollectionProductCard from '@/components/tdp/CollectionProductCard';
import CollectionProductCardV5 from '@/components/tdp/CollectionProductCardV5';
import CalibrationsHud from '@/components/dev/CalibrationsHud';

const COLLECTION_BG_SRC = '/tmp/PAGINES/PAGINES TIPUS/00 COLLECCIO.png';

const TDP_DESCRIPTION = [
  "Mereixedors són d'honor, glòria e de fama e contínua bona memòria los ",
  'hòmens virtuosos, e singularment aquells qui per la república lluitaren.',
].join('\n');

const tdpImage = (color) =>
  `/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_${color}_gpr-4-0_front.png`;

// 14 colors canònics (ordre extret de FullWideSlideDemoHeader.jsx).
// Repetits cíclicament fins a omplir les 16 cel·les del 4x4.
const TDP_GRID_COLORS = [
  ['white',        'light-blue',     'royal',         'purple'],
  ['navy',         'daisy',          'gold',          'light-pink'],
  ['red',          'kiwi',           'irish-green',   'military-green'],
  ['forest-green', 'black',          'white',         'light-blue'],
];
const OVERLAY_STATE_STORAGE_KEY = 'hg.constructorColleccio.overlayOpacity.v1';

const DEFAULT_OVERLAY_STATE = {
  pautaOpacity: 1,
  tableOpacity: 1,
  backgroundOpacity: 1,
};

function loadOverlayState() {
  try {
    const raw = window.localStorage.getItem(OVERLAY_STATE_STORAGE_KEY);
    if (!raw) return DEFAULT_OVERLAY_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_OVERLAY_STATE, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return DEFAULT_OVERLAY_STATE;
  }
}

function ConstructorColleccioPage() {
  const [selectedSize, setSelectedSize] = useState('M');
  const [overlayState, setOverlayState] = useState(loadOverlayState);
  const [zeroLeftOffsetPx, setZeroLeftOffsetPx] = useState(0);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const { pautaOpacity, tableOpacity, backgroundOpacity } = overlayState;

  useEffect(() => {
    try {
      window.localStorage.setItem(OVERLAY_STATE_STORAGE_KEY, JSON.stringify(overlayState));
    } catch {
      // ignore
    }
  }, [overlayState]);

  // Alinea el "00" amb el left del logo GRAFC del header.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let raf = 0;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const logo = document.querySelector('[data-brand-logo="1"]')
        || document.getElementById('stripe-guide-header-logo-anchor');
      const grid = document.querySelector('[data-pauta-grid]');
      if (!logo || !grid) {
        raf = requestAnimationFrame(measure);
        return;
      }
      const logoRect = logo.getBoundingClientRect();
      const gridRect = grid.getBoundingClientRect();
      const offset = Math.max(0, logoRect.left - gridRect.left);
      setZeroLeftOffsetPx((prev) => (Math.abs(prev - offset) < 0.5 ? prev : offset));
    };
    measure();
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, { passive: true });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize);
    };
  }, []);

  return (
    <section className="bg-background">
      <Helmet>
        <title>Col·lecció · Constructor | Higgins Gràfic</title>
        <meta
          name="description"
          content="Plantilla de construcció de col·lecció amb header global, pauta de 4 columnes i footers globals."
        />
      </Helmet>

      <Pauta4ColsOverlay
        pautaEnabled={false}
        tableEnabled={false}
        topOffset="0px"
        bottomPadding="0px"
      >
        <img
          src={COLLECTION_BG_SRC}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            opacity: backgroundOpacity,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            gridColumn: '1 / 5',
            gridRow: '1 / 16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: `${zeroLeftOffsetPx + 7}px`,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(140px, 22vw, 420px)',
              lineHeight: 0.85,
              color: 'rgba(180, 188, 196, 0.55)',
              letterSpacing: '-0.04em',
              marginLeft: '-0.07em',
              transform: 'translateY(-4%)',
            }}
          >
            00
          </span>
        </div>
        <div
          aria-label="Títol col·lecció"
          style={{
            gridColumn: '1 / 5',
            gridRow: '1 / 16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(64px, 12vw, 200px)',
              letterSpacing: '-0.01em',
              lineHeight: 0.85,
              color: '#0b0d10',
              textTransform: 'uppercase',
              // -4% per igualar la compensació del 00; +X% addicional per
              // contrarestar la massa visual de l'accent (que puja el centre
              // de massa percebut). Resultat net ~+1%, push down lleuger.
              transform: 'translateY(calc(1% - 5px))',
            }}
          >
            COL·LECCIÓ
          </h1>
        </div>
        {[0, 1, 2, 3].flatMap((rowIdx) =>
          [0, 1, 2, 3].map((colIdx) => {
            const color = TDP_GRID_COLORS[rowIdx][colIdx];
            if (!color) return null;
            const isV5 = (rowIdx + colIdx) % 2 === 1;
            const Card = isV5 ? CollectionProductCardV5 : CollectionProductCard;
            const col = colIdx + 1;
            const rowOffset = 10 + rowIdx * 20;
            return (
              <Card
                key={`tdp-card-r${rowIdx}-c${colIdx}`}
                gridColumn={`${col} / ${col + 1}`}
                rowOffset={rowOffset}
                productName="NOM DE PRODUCTE"
                description={TDP_DESCRIPTION}
                price="15,50€"
                imageSrc={tdpImage(color)}
                imageAlt={`Samarreta Gildan 5000 ${color}`}
                sizes={sizes}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
                cartCount={0}
                onAddToCart={() => {}}
                editableIdPrefix="constructor-colleccio-tdp-col2"
                presetVersion="constructor-colleccio-tdp-cart-34-v8"
              />
            );
          })
        )}
      </Pauta4ColsOverlay>
      <CollectionOutroSection />
      <div
        className="font-mono text-neutral-800"
        style={{
          position: 'fixed',
          right: 16,
          top: 170,
          width: 260,
          zIndex: 100000,
          background: 'rgba(255,255,255,0.96)',
          border: '1px solid rgba(0,0,0,0.10)',
          borderRadius: 10,
          padding: 12,
          fontSize: 12,
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
        }}
      >
        <strong className="mb-2 block">Controls col·lecció</strong>
        <OpacitySlider label="Opacitat pauta" value={pautaOpacity} onChange={(value) => setOverlayState((prev) => ({ ...prev, pautaOpacity: value }))} />
        <OpacitySlider label="Opacitat taula" value={tableOpacity} onChange={(value) => setOverlayState((prev) => ({ ...prev, tableOpacity: value }))} />
        <OpacitySlider label="Opacitat BG" value={backgroundOpacity} onChange={(value) => setOverlayState((prev) => ({ ...prev, backgroundOpacity: value }))} />
      </div>
      <CalibrationsHud />
    </section>
  );
}

// =============================================================================
//  Outro: editorial + tagline (entre TDPs i footer)
// =============================================================================
function CollectionOutroSection() {
  const editorialImage = tdpImage('black');

  return (
    <section
      aria-label="Tancament de col·lecció"
      className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10"
      style={{
        // Aire entre TDPs i editorial = ½ alçada de la imatge (21:9 → 21.4% width).
        paddingTop: '21%',
        paddingBottom: 0,
      }}
    >
      {/* Franja editorial full-width dins el belt */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '21 / 9',
          backgroundColor: '#f4f4f1',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={editorialImage}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            maxHeight: '85%',
            width: 'auto',
            objectFit: 'contain',
            transform: 'translateY(2%)',
            userSelect: 'none',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '6%',
            bottom: '8%',
            fontFamily: 'Roboto Condensed, sans-serif',
            fontSize: 12,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(11, 13, 16, 0.6)',
          }}
        >
          Lookbook · Tardor 2025
        </span>
      </div>

      {/* Tagline tipogràfica, centrada amb molt aire */}
      <div
        style={{
          paddingTop: '14%',
          paddingBottom: '14%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(144px, 22vw, 352px)',
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#0b0d10',
            maxWidth: '18ch',
            // Compensació de centratge òptic: les majúscules d'Oswald viuen a la
            // meitat superior del line-box → cal empènyer-les avall.
            transform: 'translateY(3%)',
          }}
        >
          Roba que parla
        </p>
      </div>
    </section>
  );
}

function OpacitySlider({ label, value, onChange }) {
  return (
    <label className="mb-2 block">
      <div className="flex items-center justify-between text-[11px] text-neutral-700">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-900">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="w-full accent-orange-600"
      />
    </label>
  );
}

export default ConstructorColleccioPage;
