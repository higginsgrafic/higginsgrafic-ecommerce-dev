import { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import { collectionGridImageFor, gridFinishFor, collectionGridHoverVariantsFor } from '@/lib/pdpMockup';
import HeroSlider from '@/components/HeroSlider';
import CollectionProductCard from '@/components/tdp/CollectionProductCard';
import CollectionProductCardV5 from '@/components/tdp/CollectionProductCardV5';
import CollectionTdpCard from '@/components/tdp/CollectionTdpCard';
import TramFinal from '@/components/home/TramFinal';
import { buildOtherCollectionsImages } from '@/components/home/homeDrawings';
import Breadcrumbs from '@/components/Breadcrumbs';

const COLLECTION_BG_SRC = '/tmp/PAGINES/PAGINES TIPUS/00 COLLECCIO.png';

const COLLECTIONS_MENU = [
  {
    id: 'first-contact',
    name: 'First Contact',
    href: '/first-contact',
    icon: '/custom_logos/collections/collection-first-contact-logo.svg',
  },
  {
    id: 'the-human-inside',
    name: 'The Human Inside',
    href: '/the-human-inside',
    icon: '/custom_logos/collections/collection-thin-logo.svg',
  },
  {
    id: 'austen',
    name: 'Austen',
    href: '/austen',
    icon: '/custom_logos/collections/collection-jean-austen-logo.svg',
  },
  {
    id: 'cube',
    name: 'Cube',
    href: '/cube',
    icon: '/custom_logos/collections/collection-cube-logo.svg',
  },
  {
    id: 'miscellania',
    name: 'Miscel·lània',
    href: '/miscellania',
    icon: '/custom_logos/collections/collection-miscellania-logo.svg',
  },
];

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

// Rutes de les PDP de producte de MISCEL·LÀNIA, en ordre.
// S'assignen a les 16 cel·les de la graella de forma cíclica.
const COLLECTION_SLUG = 'miscellania';
const PRODUCTS = [
  { route: 'pont-del-diable', name: 'PONT DEL DIABLE' },
  { route: 'dj-vader', name: 'DJ VADER' },
  { route: 'death-star2d2', name: 'DEATH STAR2D2' },
  { route: 'arthur-d-the-second', name: 'ARTHUR D THE SECOND' },
  { route: 'r2d2-quote', name: 'R2D2 QUOTE' },
];
const productAt = (rowIdx, colIdx) => PRODUCTS[(rowIdx * 4 + colIdx) % PRODUCTS.length];
const productHref = (rowIdx, colIdx) => `/${COLLECTION_SLUG}/${productAt(rowIdx, colIdx).route}`;

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

const OVERLAY_STATE_STORAGE_KEY = 'hg.constructorColleccioCopy6.overlayOpacity.v1';

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

function CollectionMiscellaniaPage() {
  const [overlayState, setOverlayState] = useState(loadOverlayState);
  const [zeroLeftOffsetPx, setZeroLeftOffsetPx] = useState(0);
  const [rowHeight, setRowHeight] = useState(38);
  const pautaGridRef = useRef(null);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const { pautaOpacity, tableOpacity, backgroundOpacity } = overlayState;
  const otherImages = useMemo(() => buildOtherCollectionsImages('miscellania'), []);

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

      const numRows = 24;
      const rowGap = 3;
      const singleRowH = (gridRect.height - (numRows - 1) * rowGap) / numRows;
      setRowHeight((prev) => (Math.abs(prev - singleRowH) < 0.1 ? prev : singleRowH));
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
        <title>Miscel·lània · Constructor | Higgins Gràfic</title>
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
        {/* Breadcrumbs (fila 2 / 3) */}
        <div
          style={{
            gridColumn: '1 / 4',
            gridRow: '2 / 3',
            alignSelf: 'start',
            transform: 'translateY(-86px)',
          }}
        >
          <Breadcrumbs items={[{ label: 'Miscel·lània' }]} />
        </div>

        {/* Títol col·lecció (fila 3 / 7) */}
        <div
          aria-label="Títol col·lecció"
          style={{
            gridColumn: '1 / 4',
            gridRow: '3 / 7',
            alignSelf: 'center',
            position: 'relative',
            zIndex: 10,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transform: 'translateY(-26px)',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 300,
              fontSize: 'clamp(2.5rem, 8.5vw, 125px)',
              letterSpacing: '0.02em',
              lineHeight: 0.9,
              color: '#0b0d10',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35em',
              whiteSpace: 'nowrap',
            }}
          >
            <img
              src="/custom_logos/collections/collection-miscellania-logo.svg"
              alt=""
              aria-hidden="true"
              loading="lazy"
              style={{
                height: '0.75em',
                width: 'auto',
                objectFit: 'contain',
                display: 'inline-block',
                flexShrink: 0,
                transform: 'translateY(5px)',
              }}
            />
            <span>MISCEL·LÀNIA</span>
          </h1>
        </div>

        {/* Menú de col·leccions centrat en Y entre títol i hero, alineat al top */}
        <div
          style={{
            gridColumn: '1 / 4',
            gridRow: '7 / 10',
            alignSelf: 'center',
            position: 'relative',
            zIndex: 10,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: '44px',
            pointerEvents: 'auto',
            transform: 'translateY(0px)',
          }}
        >
          {COLLECTIONS_MENU.map((c) => {
            const isFirstContact = c.id === 'first-contact';
            return (
              <Link
                key={c.id}
                to={c.href}
                title={c.name}
                aria-label={c.name}
                style={{
                  display: 'inline-flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  transition: 'transform 0.15s ease, opacity 0.15s ease',
                }}
                className="hover:scale-110 active:scale-95 opacity-40 hover:opacity-100"
              >
                <img
                  src={c.icon}
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: isFirstContact ? '42.1px' : 'auto',
                    height: isFirstContact ? 'auto' : '44px',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Link>
            );
          })}
        </div>
        <div
          style={{
            gridColumn: '1 / 4',
            gridRow: '10 / 25',
            position: 'relative',
            top: `calc(-5px - ${rowHeight / 2}px)`,
            width: 'calc(100% + 1px)',
            height: 'calc(100% + 2px)',
            transform: 'scale(0.94)',
            transformOrigin: 'center center',
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
          loading="lazy"
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
            const productName = productAt(rowIdx, colIdx).name;
            return (
              <CollectionTdpCard
                key={`tdp-card-r${rowIdx}-c${colIdx}`}
                Component={Card}
                gridColumn={`${col} / ${col + 1}`}
                rowOffset={rowOffset}
                productName={productName}
                description={TDP_DESCRIPTION}
                price="15,50€"
                imageSrc={collectionGridImageFor('miscellania', productAt(rowIdx, colIdx).route, color, rowIdx * 4 + colIdx)}
                hoverImages={collectionGridHoverVariantsFor('miscellania', productAt(rowIdx, colIdx).route, color, rowIdx * 4 + colIdx)}
                imageAlt={`Samarreta Gildan 5000 ${color}`}
                sizes={sizes}
                cartCount={0}
                onAddToCart={(size) => {
                  window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
                    detail: { source: 'collection-tdp-cta', firstPartOnly: true, item: { title: productName.toUpperCase(), collection: 'MISCEL·LÀNIA', collectionSlug: 'miscellania', productRoute: productAt(rowIdx, colIdx).route, qty: 1, size, price: '15,50€', color, finish: gridFinishFor('miscellania', color, rowIdx * 4 + colIdx), drawing: '', disabled: false } },
                  }));
                }}
                editableIdPrefix="constructor-colleccio-copy6-tdp-col2"
                presetVersion="constructor-colleccio-copy6-tdp-cart-34-v9"
                collectionHref={`${productHref(rowIdx, colIdx)}?color=${color}&finish=${gridFinishFor('miscellania', color, rowIdx * 4 + colIdx)}`}
                productNamePlain
                editable={false}
              />
            );
          })
        )}
      </Pauta4ColsOverlay>

      <TramFinal
        posterLines={[{ text: 'MÉS VAL SOL' }, { text: 'QUE MAL' }, { text: 'ACOMPANYAT' }]}
        tambeImages={otherImages}
      />
    </section>
  );
}

export default CollectionMiscellaniaPage;
