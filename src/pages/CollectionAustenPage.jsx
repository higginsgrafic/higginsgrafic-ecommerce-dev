import { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import { getSafeBelt } from '@/utils/layoutMetrics';
import { useCollectionCardLayout } from '@/hooks/useCollectionCardLayout';
import { collectionGridImageFor, gridFinishFor, collectionGridHoverVariantsFor } from '@/lib/pdpMockup';
import HeroSlider from '@/components/HeroSlider';
import CollectionProductCard from '@/components/tdp/CollectionProductCard';
import CollectionProductCardV5 from '@/components/tdp/CollectionProductCardV5';
import CollectionTableCard from '@/components/tdp/CollectionTableCard';
import CollectionTdpCard from '@/components/tdp/CollectionTdpCard';
import TramFinal from '@/components/home/TramFinal';
import { buildOtherCollectionsImages } from '@/components/home/homeDrawings';
import Breadcrumbs from '@/components/Breadcrumbs';
import useIsMobile from '@/hooks/useIsMobile';
import CollectionMobile from '@/pages/CollectionMobile';
import { SELLING_PRICE_LABEL } from '@/config/pricing';

// Alcada de la franja blanca de la hero.
const BAND_HEIGHT = 'clamp(120px, 26vh, 260px)';

const HERO_BACKGROUND_SRC = '/placeholders/hero/placeholder-noia.jpg';
const TDP_MOVE_PX = 120;

const COLLECTION_BG_SRC = '/placeholders/tots_els_fons/fons_colleccio/00-colleccio.webp';

const COLLECTIONS_MENU = [
  {
    id: 'first-contact',
    name: 'First Contact',
    href: '/first-contact',
    icon: '/custom_logos/collections/collection-first-contact-logo.webp',
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

const tdpImage = (color) =>
  `/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_${color}_gpr-4-0_front.webp`;

// 14 colors canònics (ordre extret de FullWideSlideHeader.jsx).
// S'assignen cíclicament a les cel·les de la graella.
const CANON_COLORS = [
  'white', 'light-blue', 'royal', 'purple',
  'navy', 'daisy', 'gold', 'light-pink',
  'red', 'kiwi', 'irish-green', 'military-green',
  'forest-green', 'black',
];

// Productes d'AUSTEN. Austen abasta 5 subcol·leccions del catàleg de mockups,
// per això cada item porta la seva pròpia clau `collection` (a diferència de
// les altres pàgines de col·lecció, que tenen un únic COLLECTION_SLUG).
const COLLECTION_SLUG = 'austen';
const PRODUCTS = [
  { collection: 'austen-keep-calm', route: 'keep-calm', name: 'KEEP CALM' },
  { collection: 'austen-pemberley', route: 'pemberley-house', name: 'PEMBERLEY HOUSE' },
  { collection: 'austen-quotes', route: 'quotes-half-agony-half-hope', name: 'HALF AGONY HALF HOPE' },
  { collection: 'austen-quotes', route: 'quotes-i-admire-and-love-you', name: 'I ADMIRE AND LOVE YOU' },
  { collection: 'austen-quotes', route: 'quotes-it-is-a-truth', name: 'IT IS A TRUTH' },
  { collection: 'austen-quotes', route: 'quotes-unsociable-and-taciturn', name: 'UNSOCIABLE AND TACITURN' },
  { collection: 'austen-quotes', route: 'quotes-you-have-bewitched-me', name: 'YOU HAVE BEWITCHED ME' },
  { collection: 'austen-crosswords', route: 'persuasion-1', name: 'PERSUASION 1' },
  { collection: 'austen-crosswords', route: 'persuasion-2', name: 'PERSUASION 2' },
  { collection: 'austen-crosswords', route: 'persuasion-3', name: 'PERSUASION 3' },
  { collection: 'austen-crosswords', route: 'persuasion-4', name: 'PERSUASION 4' },
  { collection: 'austen-crosswords', route: 'pride-and-prejudice-1', name: 'PRIDE & PREJUDICE 1' },
  { collection: 'austen-crosswords', route: 'pride-and-prejudice-2', name: 'PRIDE & PREJUDICE 2' },
  { collection: 'austen-crosswords', route: 'pride-and-prejudice-3', name: 'PRIDE & PREJUDICE 3' },
  { collection: 'austen-crosswords', route: 'pride-and-prejudice-4', name: 'PRIDE & PREJUDICE 4' },
  { collection: 'austen-crosswords', route: 'sense-and-sensibility-1', name: 'SENSE & SENSIBILITY 1' },
  { collection: 'austen-crosswords', route: 'sense-and-sensibility-2', name: 'SENSE & SENSIBILITY 2' },
  { collection: 'austen-crosswords', route: 'sense-and-sensibility-3', name: 'SENSE & SENSIBILITY 3' },
  { collection: 'austen-crosswords', route: 'sense-and-sensibility-4', name: 'SENSE & SENSIBILITY 4' },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-blue-solid', name: 'LOOKING FOR MY DARCY' },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-pink-solid', name: 'LOOKING FOR MY DARCY' },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-pink-yellow-frame', name: 'LOOKING FOR MY DARCY' },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-red-solid', name: 'LOOKING FOR MY DARCY' },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-red-yellow-frame', name: 'LOOKING FOR MY DARCY' },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-yellow-blue-frame', name: 'LOOKING FOR MY DARCY' },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-yellow-pink-frame', name: 'LOOKING FOR MY DARCY' },
  { collection: 'austen-looking-for-my-darcy', route: 'looking-for-my-darcy-yellow-solid', name: 'LOOKING FOR MY DARCY' },
];
const NUM_COLS = 4;
const NUM_ROWS = Math.ceil(PRODUCTS.length / NUM_COLS); // 7 files per a 27 productes
const productHref = (idx) => `/${COLLECTION_SLUG}/${PRODUCTS[idx].route}`;
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
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_royal_gpr-4-0_front.webp',
    imageAlt: 'Samarreta de la col·lecció First Contact',
    kicker: 'First Contact',
    headline: 'Ciència-ficció per mirar cap a les estrelles.',
    primaryCta: { label: 'Compra', href: '/first-contact' },
    secondaryCta: { label: 'Descobreix', href: '/first-contact' },
  },
  {
    id: 'the-human-inside',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.webp',
    imageAlt: 'Samarreta de la col·lecció The Human Inside',
    kicker: 'The Human Inside',
    headline: 'Robots, identitat i preguntes incòmodes.',
    primaryCta: { label: 'Compra', href: '/thin' },
    secondaryCta: { label: 'Descobreix', href: '/thin' },
  },
  {
    id: 'miscellania',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_forest-green_gpr-4-0_front.webp',
    imageAlt: 'Samarreta de la col·lecció Miscel·lània',
    kicker: 'Miscel·lània',
    headline: 'Per a qui tria el seu propi camí.',
    primaryCta: { label: 'Compra', href: '/miscellania' },
    secondaryCta: { label: 'Descobreix', href: '/miscellania' },
  },
];

const OVERLAY_STATE_STORAGE_KEY = 'hg.constructorColleccioCopy4.overlayOpacity.v1';

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

function CollectionAustenPage() {
  const isMobile = useIsMobile();
  const [overlayState, setOverlayState] = useState(loadOverlayState);
  const [zeroLeftOffsetPx, setZeroLeftOffsetPx] = useState(0);
  const [rowHeight, setRowHeight] = useState(38);

  // La franja blanca ha de tocar el separador del header sense quedar-s'hi a
  // sota. Com que la hero no comenca exactament al separador, mesurem on acaba
  // el header i on comenca la hero, i hi posem la franja just al mig.
  const heroRef = useRef(null);
  const bandRef = useRef(null);
  const [heroBandTopPx, setHeroBandTopPx] = useState(0);
  const [heroIconsTopPx, setHeroIconsTopPx] = useState(null);
  const [heroBottomBandTopPx, setHeroBottomBandTopPx] = useState(null);
  const [heroHeightPx, setHeroHeightPx] = useState(null);
  // Quan la imatge (alcada de finestra) sobrepassa l'espai que la graella li
  // reserva, baixem el contingut el mateix tros perque no se solapi.
  const [pushDownPx, setPushDownPx] = useState(0);
  // Austen te mes files de TDP que les altres colleccions, aixi que el poster
  // queda mes avall. Ajustem el marge perque l'aire de sobre sigui el mateix.
  const [posterExtraPx, setPosterExtraPx] = useState(0);
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(
    typeof window !== "undefined"
      && window.innerWidth >= 1024
      && window.innerWidth <= 1366
      && window.innerHeight < window.innerWidth
  );
  const [isPortraitTablet, setIsPortraitTablet] = useState(
    typeof window !== "undefined"
      && window.innerWidth >= 768
      && window.innerWidth <= 1024
      && window.innerHeight > window.innerWidth
  );
  const pautaGridRef = useRef(null);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const { pautaOpacity, tableOpacity, backgroundOpacity } = overlayState;
  const otherImages = useMemo(() => buildOtherCollectionsImages('austen'), []);
  const getCardLayout = useCollectionCardLayout({ isPortraitTablet, isLandscapeTablet });

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
      setIsLandscapeTablet(
        window.innerWidth >= 1024
          && window.innerWidth <= 1366
          && window.innerHeight < window.innerWidth
      );
      setIsPortraitTablet(
        window.innerWidth >= 768
          && window.innerWidth <= 1024
          && window.innerHeight > window.innerWidth
      );
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

  useLayoutEffect(() => {
    const mesura = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const cap = document.querySelector('header');
      const headerBottom = cap ? cap.getBoundingClientRect().bottom : 0;
      const heroTop = hero.getBoundingClientRect().top;
      setHeroBandTopPx(Math.max(0, Math.round(headerBottom - heroTop)));
      // Les icones es queden a la MATEIXA posicio de pantalla que tenien
      // (centrades on era la franja blanca de sota), encara que la imatge
      // torni a omplir tota l'alcada.
      const band = bandRef.current;
      const bandH = band ? band.getBoundingClientRect().height : 0;
      setHeroIconsTopPx(Math.round(window.innerHeight - bandH / 2 - heroTop));
      // Franja blanca de baix, on abans hi havia el retall.
      setHeroBottomBandTopPx(Math.round(window.innerHeight - bandH - heroTop));
      // La imatge acaba exactament on acaba la franja blanca de baix.
      setHeroHeightPx(Math.round(window.innerHeight - heroTop));
      // Baixem el contingut el que calgui perque la primera targeta quedi
      // SEMPRE per sota de la imatge. Ho calculem sobre la posicio "base"
      // (sense el desplaçament ja aplicat) per no entrar en bucle.
      // Correccio del poster d'Austen: proporcional a l'amplada de la graella.
      setPosterExtraPx(Math.round(getSafeBelt().width * 0.857));
      const heroBottom = hero.getBoundingClientRect().bottom;
      const tdp0 = document.querySelector('[aria-label="TDP taula"]') || document.querySelector('[aria-label="TDP rectangle"]');
      if (tdp0) {
        const topActual = tdp0.getBoundingClientRect().top;
        setPushDownPx((prev) => {
          const base = topActual - prev;
          const cal = Math.max(0, Math.round(heroBottom + 24 - base));
          return Math.abs(cal - prev) < 1 ? prev : cal;
        });
      }
    };
    mesura();
    window.addEventListener('resize', mesura);
    const t = window.setTimeout(mesura, 300);
    return () => {
      window.removeEventListener('resize', mesura);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <section className="bg-background">
      <Helmet>
        <title>Austen · Constructor | Higgins Gràfic</title>
        <meta
          name="description"
          content="Plantilla de construcció de col·lecció amb header global, pauta de 4 columnes i footers globals."
        />
      </Helmet>

      {isMobile ? (
        <CollectionMobile
          collectionSlug="austen"
          collectionTitle="Austen"
          collectionIcon="/custom_logos/collections/collection-jean-austen-logo.svg"
          products={PRODUCTS}
          colors={CANON_COLORS}
          posterLines={[{ text: 'CADA' }, { text: 'DIBUIX TÉ' }, { text: 'UNA MIRADA' }]}
        />
      ) : (
        <>

      <Pauta4ColsOverlay
        pautaEnabled={false}
        tableEnabled={false}
        numCols={3}
        numRows={24}
        canvasAspect={[2642, 1780]}
        topOffset="76px"
        bottomPadding="0px"
      >
        {/* Breadcrumbs (fila 2 / 3) — ocults a tablets */}
        {!(isPortraitTablet || isLandscapeTablet) && (
        <div
          style={{
            gridColumn: '1 / 4',
            gridRow: '2 / 3',
            alignSelf: 'start',
            transform: 'translateY(-86px)',
            paddingLeft: `${zeroLeftOffsetPx}px`,
          }}
        >
          <Breadcrumbs items={[{ label: 'Austen' }]} />
        </div>
        )}

        {/* Hero de la colleccio: 1) imatge de fons a pantalla completa
            (un dia sera una animacio), 2) franja blanca al 50% enmig,
            3) icona i nom de la colleccio sobre la franja. Les icones de
            colleccio van a sota. */}
        <div
          data-hero="1"
          ref={heroRef}
          style={{
            gridColumn: '1 / 4',
            gridRow: '3 / 25',
            position: 'relative',
            // Plena: de banda a banda del viewport i tota l'alcada de la
            // finestra menys el header, enganxada just a sota.
            top: `calc(-5px - ${rowHeight / 2}px - 144px)`,
            width: '100vw',
            marginLeft: 'calc(50% - 50vw)',
            // La imatge acaba just on acaba la franja blanca de baix.
            height: heroHeightPx != null ? `${heroHeightPx}px` : `calc(100vh - 62px)`,
            zIndex: 1,
          }}
        >
          <img
            src={HERO_BACKGROUND_SRC}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              pointerEvents: 'none',
            }}
          />

          <div
            aria-hidden="true"
            data-hero-band="1"
            ref={bandRef}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              // Just sota el separador del header (mesurat).
              top: `${heroBandTopPx}px`,
              height: BAND_HEIGHT,
              background: 'rgba(255, 255, 255, 0.5)',
              pointerEvents: 'none',
            }}
          />

          {/* Icona + nom, centrats sobre la franja */}
          <div
            aria-label="Títol col·lecció"
            style={{
              position: 'absolute',
              top: `${heroBandTopPx}px`,
              left: 0,
              right: 0,
              height: BAND_HEIGHT,
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
                  src="/custom_logos/collections/collection-jean-austen-logo.svg"
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
                <span>AUSTEN</span>
              </h1>
          </div>

          {/* Franja blanca de baix (on abans hi havia el retall), amb la
              mateixa alcada que la de dalt i un 20% de transparencia. */}
          <div
            aria-hidden="true"
            data-hero-band-bottom="1"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: heroBottomBandTopPx != null ? `${heroBottomBandTopPx}px` : `calc(100vh - ${BAND_HEIGHT} - 62px)`,
              height: BAND_HEIGHT,
              background: 'rgba(255, 255, 255, 0.8)',
              pointerEvents: 'none',
            }}
          />

          {/* Icones de colleccio: FORA de la imatge, a la part blanca de sota */}
          <div
            style={{
              position: 'absolute',
              // Mateixa posicio de pantalla que abans (centrades on era la
              // franja blanca de sota).
              top: heroIconsTopPx != null ? `${heroIconsTopPx}px` : `calc(100vh - (${BAND_HEIGHT}) / 2)`,
              left: 0,
              right: 0,
              transform: 'translateY(-50%)',
              display: 'flex',
              // Alineades PEL TOP: la icona mes alta marca la linia de dalt.
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: '44px',
              zIndex: 20,
              pointerEvents: 'auto',
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
                        className="hover:scale-110 active:scale-95"
                      >
                        <img
                          src={c.icon}
                          alt={c.name}
                          loading="lazy"
                          decoding="async"
                          style={{
                            // Un 25% mes grosses que abans (44 -> 55, 42.1 -> 52.6).
                            width: isFirstContact ? '52.6px' : 'auto',
                            height: isFirstContact ? 'auto' : '55px',
                            objectFit: 'contain',
                            display: 'block',
                            filter: 'brightness(0)',
                          }}
                        />
                      </Link>
                    );
                  })}
          </div>

        </div>
      </Pauta4ColsOverlay>


      <Pauta4ColsOverlay
        pautaEnabled={false}
        tableEnabled={false}
        numCols={(isPortraitTablet || isLandscapeTablet) ? 3 : 4}
        numRows={150}
        canvasAspect={[2642, (isPortraitTablet || isLandscapeTablet) ? 16195 : 11180]}
        topOffset="0px"
        bottomPadding="0px"
        style={{
          // Puja tot el contingut sota el hero 12 files de la taula (41 → 29).
          // Alçada d'1 fila = ampladaBelt × 6708/2642/90; 12 files ≈ 0.3385 × amplada.
          marginTop: `calc((var(--hg-tdp-xL, 0px) - var(--hg-tdp-xR, 0px)) * 0.3385${isLandscapeTablet ? ' - 30px' : ''}${isPortraitTablet ? ' - 120px' : ''} + ${pushDownPx}px)`,
          // Desplaçament vertical NOME S de les TDP.
          translate: `0 ${-TDP_MOVE_PX}px`,
          // El bloc te marge negatiu i queda per sobre de la hero: si no fos
          // transparent als clics, s'empassaria els de les icones de colleccio.
          pointerEvents: 'none',
        }}
      >
        {/* El fons de la pagina es BLANC: el degradat va a cada fitxa. */}
        {Array.from({ length: NUM_ROWS }).flatMap((_, rowIdx) =>
          ((isPortraitTablet || isLandscapeTablet) ? [0, 1, 2] : [0, 1, 2, 3]).map((colIdx) => {
            const idx = rowIdx * NUM_COLS + colIdx;
            // Sense files incompletes: la darrera fila es completa repetint
            // productes des del principi (índex cíclic sobre PRODUCTS).
            const pIdx = idx % PRODUCTS.length;
            const product = PRODUCTS[pIdx];
            const color = CANON_COLORS[idx % CANON_COLORS.length];
            const Card = CollectionTableCard;
            const variantB = (rowIdx + colIdx) % 2 === 1;
            const col = colIdx + 1;
            const rowOffset = 10 + rowIdx * 13;
            const { imageTranslateY, productNameTranslateY, descriptionTranslateY } = getCardLayout(colIdx);
            return (
              <CollectionTdpCard
                key={`tdp-card-r${rowIdx}-c${colIdx}`}
                Component={Card}
                gridColumn={`${col} / ${col + 1}`}
                gridRow={`${6 + rowOffset} / ${17 + rowOffset}`}
                variantB={variantB}
                backgroundSrc={COLLECTION_BG_SRC}
                rowOffset={rowOffset}
                productName={product.name}
                description=""
                price={SELLING_PRICE_LABEL}
                imageSrc={collectionGridImageFor(product.collection, product.route, color, idx)}
                hoverImages={collectionGridHoverVariantsFor(product.collection, product.route, color, idx)}
                imageAlt={`Samarreta Gildan 64000 ${color}`}
                sizes={sizes}
                cartCount={0}
                onAddToCart={(size) => {
                  window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
                    detail: { source: 'collection-tdp-cta', firstPartOnly: true, item: { title: product.name.toUpperCase(), collection: 'AUSTEN', collectionSlug: product.collection, productRoute: product.route, qty: 1, size, price: SELLING_PRICE_LABEL, color, finish: gridFinishFor(product.collection, color, idx), drawing: '', disabled: false } },
                  }));
                }}
                editableIdPrefix="constructor-colleccio-copy4-tdp-col2"
                presetVersion="constructor-colleccio-copy4-tdp-cart-34-v9"
                collectionHref={`${productHref(pIdx)}?color=${color}&finish=${gridFinishFor(product.collection, color, idx)}`}
                productNamePlain
                editable={false}
                imageTranslateY={imageTranslateY}
                productNameTranslateY={productNameTranslateY}
                descriptionTranslateY={descriptionTranslateY}
              />
            );
          })
        )}
      </Pauta4ColsOverlay>

      <TramFinal
        posterLines={[{ text: 'CADA' }, { text: 'DIBUIX TÉ' }, { text: 'UNA MIRADA' }]}
        tambeImages={otherImages}
        marginTop={isPortraitTablet ? `${-1341 - posterExtraPx}px` : `${-1543 - posterExtraPx}px`}
        visibleCards={(isPortraitTablet || isLandscapeTablet) ? 3 : 4}
      />
        </>
      )}
    </section>
  );
}

export default CollectionAustenPage;
