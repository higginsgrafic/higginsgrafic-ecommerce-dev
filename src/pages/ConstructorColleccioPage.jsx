import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import HeroSlider from '@/components/HeroSlider';
import CollectionProductCard from '@/components/tdp/CollectionProductCard';
import CollectionProductCardV5 from '@/components/tdp/CollectionProductCardV5';
import CollectionTdpCard from '@/components/tdp/CollectionTdpCard';
import TramFinal from '@/components/home/TramFinal';

const COLLECTION_BG_SRC = '/tmp/PAGINES/PAGINES TIPUS/00 COLLECCIO.png';

const TDP_DESCRIPTION = [
  "Mereixedors són d'honor, glòria e de fama e contínua bona memòria los ",
  'hòmens virtuosos, e singularment aquells qui per la república lluitaren.',
].join('\n');

const tdpImage = (color) =>
  `/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_${color}_gpr-4-0_front.png`;

// 14 colors canònics (ordre extret de FullWideSlideHeader.jsx).
// Repetits cíclicament fins a omplir les 16 cel·les del 4x4.
const TDP_GRID_COLORS = [
  ['white',        'light-blue',     'royal',         'purple'],
  ['navy',         'daisy',          'gold',          'light-pink'],
  ['red',          'kiwi',           'irish-green',   'military-green'],
  ['forest-green', 'black',          'white',         'light-blue'],
];

function colorToProductName(color) {
  const map = {
    'white': 'White',
    'light-blue': 'Light Blue',
    'royal': 'Royal',
    'navy': 'Navy',
    'purple': 'Purple',
    'light-pink': 'Light Pink',
    'daisy': 'Daisy',
    'gold': 'Gold',
    'red': 'Red',
    'kiwi': 'Kiwi',
    'irish-green': 'Irish Green',
    'military-green': 'Military Green',
    'forest-green': 'Forest Green',
    'black': 'Black',
  };
  return map[color] || color;
}

const HERO_SLIDES = [
  {
    id: 'first-contact',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_royal_gpr-4-0_front.png',
    imageAlt: 'Samarreta de la col·lecció First Contact',
    kicker: 'First Contact',
    headline: 'Ciència-ficció per mirar cap a les estrelles.',
    primaryCta: { label: 'Compra', href: '/first-contact' },
    secondaryCta: { label: 'Descobreix', href: '/first-contact' },
  },
  {
    id: 'the-human-inside',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png',
    imageAlt: 'Samarreta de la col·lecció The Human Inside',
    kicker: 'The Human Inside',
    headline: 'Robots, identitat i preguntes incòmodes.',
    primaryCta: { label: 'Compra', href: '/thin' },
    secondaryCta: { label: 'Descobreix', href: '/thin' },
  },
  {
    id: 'miscellania',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_forest-green_gpr-4-0_front.png',
    imageAlt: 'Samarreta de la col·lecció Miscel·lània',
    kicker: 'Miscel·lània',
    headline: 'Per a qui tria el seu propi camí.',
    primaryCta: { label: 'Compra', href: '/miscellania' },
    secondaryCta: { label: 'Descobreix', href: '/miscellania' },
  },
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
  const [overlayState, setOverlayState] = useState(loadOverlayState);
  const [zeroLeftOffsetPx, setZeroLeftOffsetPx] = useState(0);
  const pautaGridRef = useRef(null);
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
        numCols={3}
        numRows={24}
        canvasAspect={[2642, 1780]}
        topOffset="76px"
        bottomPadding="0px"
      >
        <div
          aria-label="Títol col·lecció"
          style={{
            gridColumn: '1 / 4',
            gridRow: '1 / 7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 4,
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
              transform: 'translateY(calc(1% + 10px))',
            }}
          >
            COL·LECCIÓ
          </h1>
        </div>
        <div
          style={{
            gridColumn: '1 / 4',
            gridRow: '10 / 25',
            position: 'relative',
            top: '1px',
            width: 'calc(100% + 1px)',
            height: 'calc(100% + 2px)',
          }}
        >
          <HeroSlider
            slides={HERO_SLIDES}
            autoplay
            autoplayIntervalMs={8000}
            className="h-full"
            flush
          />
        </div>
      </Pauta4ColsOverlay>

      <Pauta4ColsOverlay
        pautaEnabled={false}
        tableEnabled={false}
        numRows={90}
        canvasAspect={[2642, 6708]}
        topOffset="0px"
        bottomPadding="0px"
        style={{
          // Puja tot el contingut sota el hero 12 files de la taula (41 → 29).
          // Alçada d'1 fila = ampladaBelt × 6708/2642/90; 12 files ≈ 0.3385 × amplada.
          marginTop: 'calc((var(--hg-tdp-xL, 0px) - var(--hg-tdp-xR, 0px)) * 0.3385)',
        }}
      >
        <img
          src={COLLECTION_BG_SRC}
          alt=""
          aria-hidden="true"
          draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
        {[0, 1, 2, 3].flatMap((rowIdx) =>
          [0, 1, 2, 3].map((colIdx) => {
            const color = TDP_GRID_COLORS[rowIdx][colIdx];
            if (!color) return null;
            const isV5 = (rowIdx + colIdx) % 2 === 1;
            const Card = isV5 ? CollectionProductCardV5 : CollectionProductCard;
            const col = colIdx + 1;
            const rowOffset = 10 + rowIdx * 20;
            const productName = colorToProductName(color);
            return (
              <CollectionTdpCard
                key={`tdp-card-r${rowIdx}-c${colIdx}`}
                Component={Card}
                gridColumn={`${col} / ${col + 1}`}
                rowOffset={rowOffset}
                productName={productName}
                description={TDP_DESCRIPTION}
                price="15,50€"
                imageSrc={tdpImage(color)}
                imageAlt={`Samarreta Gildan 5000 ${color}`}
                sizes={sizes}
                cartCount={0}
                onAddToCart={(size) => {
                  window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
                    detail: { source: 'collection-tdp-cta', firstPartOnly: true, item: { title: productName.toUpperCase(), collection: 'COL·LECCIÓ', qty: 1, size, price: '15,50€', color, drawing: '', disabled: false } },
                  }));
                }}
                editableIdPrefix="constructor-colleccio-tdp-col2"
                presetVersion="constructor-colleccio-tdp-cart-34-v9"
                collectionHref="/constructor/pdp"
                productNamePlain
                editable={false}
              />
            );
          })
        )}
      </Pauta4ColsOverlay>

      <TramFinal />
    </section>
  );
}

export default ConstructorColleccioPage;