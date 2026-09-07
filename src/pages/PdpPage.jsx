import React, { useState, useLayoutEffect, useRef, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import TambeRail from '@/pages/productRail/TambeRail';
import CarouselArrows from '@/pages/productRail/CarouselArrows';
import Breadcrumbs from '@/components/Breadcrumbs';
import { tdpImageFor, availableFinishesFor, defaultFinishFor } from '@/lib/pdpMockup';
import EditableTextBox from '@/components/dev/EditableTextBox';
import StoryPosterLink from '@/components/StoryPosterLink';
import { Flag } from './ShippingPage';
import { PDP_REGISTRY_BY_ROUTE } from '@/data/pdpRegistry';
import SEOProductSchema from '@/components/SEOProductSchema';
import { buildOtherCollectionsImages } from '@/components/home/homeDrawings';
import useIsMobile from '@/hooks/useIsMobile';
import PdpMobile from '@/pages/PdpMobile';
import PageBand from '@/components/layout/PageBand';

const PDP_PRESET_VERSION = 'pdp-layout-2026-06-06-1953';

const PDP_TITLE_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Oswald', fontSize: 24, fontWeight: 300, selectedFontWeight: 700,
  letterSpacing: 0.003, lineHeight: 1, textAlign: 'left', verticalAlign: 'bottom',
  color: '#475059', textTransform: 'uppercase',
};
const PDP_COLLECTION_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Roboto Condensed', fontSize: 16, fontWeight: 400, selectedFontWeight: 700,
  letterSpacing: 0.2, lineHeight: 1.2, textAlign: 'left', verticalAlign: 'top',
  color: 'rgba(71, 80, 89, 0.7)', textTransform: 'uppercase',
};
const PDP_DESCRIPTION_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Roboto', fontSize: 16, fontWeight: 300, selectedFontWeight: 700,
  letterSpacing: 0.03, lineHeight: 1.65, textAlign: 'left', verticalAlign: 'top',
  color: '#111827', textTransform: 'none',
};
const PDP_PRICE_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Oswald', fontSize: 24, fontWeight: 200, selectedFontWeight: 700,
  letterSpacing: 0, lineHeight: 1, textAlign: 'left', verticalAlign: 'center',
  color: '#475059', textTransform: 'none',
};
const PDP_CTA_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Oswald', fontSize: 12, fontWeight: 300, selectedFontWeight: 400,
  letterSpacing: 0.04, lineHeight: 1, textAlign: 'center', verticalAlign: 'center',
  color: '#475059', textTransform: 'uppercase',
};
const PDP_SIZE_SETTINGS = {
  x: 0, y: 0, fontFamily: 'Oswald', fontSize: 12, fontWeight: 300, selectedFontWeight: 400,
  letterSpacing: 0, lineHeight: 1, textAlign: 'center', verticalAlign: 'center',
  color: '#475059', textTransform: 'none',
};

const PRODUCT_DESCRIPTION = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna";

const OFFICIAL_COLORS = [
  'white', 'light-blue', 'royal', 'navy', 'purple', 'light-pink', 'daisy',
  'gold', 'red', 'kiwi', 'irish-green', 'military-green', 'forest-green', 'black',
];
const THUMB_COUNT = OFFICIAL_COLORS.length;

const SPECS = [
  { label: 'Material', value: '100% cotó pentinat de 150 g/m²' },
  { label: 'Tall', value: 'Coll rodó' },
  { label: 'Procedència', value: <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Flag code="HN" size={16} /><Flag code="DO" size={16} /><Flag code="NI" size={16} /><Flag code="BD" size={16} /><Flag code="US" size={16} /></span> },
  { label: 'Estampació', value: 'Impressió DTF' },
  { label: 'Cura', value: 'Renta-la al revés i a 30°C' },
  { label: 'Garantia', value: 'Devolució 14 dies' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const FINISHES = ['BLANC', 'COLOR', 'NEGRE'];

function PdpPage() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const registryKey = location.pathname.replace(/^\//, '');
  const product = PDP_REGISTRY_BY_ROUTE[registryKey];

  if (!product) {
    return (
      <section className="bg-background">
        <Helmet>
          <title>Producte no trobat | Higgins Gràfic</title>
        </Helmet>
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <h1>Producte no trobat</h1>
          <p>No s'ha trobat cap producte per a la ruta <code>{registryKey}</code>.</p>
        </div>
      </section>
    );
  }

  if (isMobile) {
    return <PdpMobile />;
  }

  const PRODUCT_SLUG = product.slug;
  const PRODUCT_ROUTE = product.route;
  const PRODUCT_NAME = product.name;
  const COLLECTION_NAME = product.collectionName;
  const COLLECTION_SLUG = product.collectionSlug;
  const IMAGE_COLLECTION = product.imageCollection || product.collectionSlug;

  const TDP_IMAGE = (color, finish) => tdpImageFor(IMAGE_COLLECTION, PRODUCT_ROUTE, color, finish);
  const AVAILABLE_FINISHES = availableFinishesFor(IMAGE_COLLECTION);
  const DEFAULT_FINISH = defaultFinishFor(IMAGE_COLLECTION);
  const otherImages = useMemo(() => buildOtherCollectionsImages(COLLECTION_SLUG).map((img) => ({ ...img, price: null })), [COLLECTION_SLUG]);

  const searchParams = new URLSearchParams(location.search);
  const urlColor = searchParams.get('color');
  const initialIndex = urlColor ? OFFICIAL_COLORS.indexOf(urlColor) : 0;
  const effectiveInitialIndex = initialIndex >= 0 ? initialIndex : 0;
  const productName = PRODUCT_NAME;

  const VARIANT_TO_FINISH = { white: 'BLANC', black: 'NEGRE', color: 'COLOR' };
  const urlFinish = searchParams.get('finish');
  const urlVariant = searchParams.get('variant');
  const variantFinish = urlVariant && VARIANT_TO_FINISH[urlVariant];
  const resolvedFinish = (urlFinish && AVAILABLE_FINISHES.includes(urlFinish)) ? urlFinish
    : (variantFinish && AVAILABLE_FINISHES.includes(variantFinish)) ? variantFinish
    : DEFAULT_FINISH;
  const initialFinish = resolvedFinish;
  const [selectedFinish, setSelectedFinish] = useState(initialFinish);
  const [finishButtonTextSettings, setFinishButtonTextSettings] = useState(PDP_SIZE_SETTINGS);

  const [selectedSize, setSelectedSize] = useState('M');
  const [sizeButtonTextSettings, setSizeButtonTextSettings] = useState(PDP_SIZE_SETTINGS);
  const [ctaTextSettings, setCtaTextSettings] = useState(PDP_CTA_SETTINGS);
  const [mainVariantIndex, setMainVariantIndex] = useState(effectiveInitialIndex);
  const goPrevVariant = () => setMainVariantIndex((i) => (i - 1 + OFFICIAL_COLORS.length) % OFFICIAL_COLORS.length);
  const goNextVariant = () => setMainVariantIndex((i) => (i + 1) % OFFICIAL_COLORS.length);
  const mainVariantColor = OFFICIAL_COLORS[mainVariantIndex];

  const [isLayoutReady, setIsLayoutReady] = useState(true);
  const productRowRef = useRef(null);
  const [tdpAvailableHeight, setTdpAvailableHeight] = useState(null);
  const [beltWidth, setBeltWidth] = useState(null);
  const [isPortraitTablet, setIsPortraitTablet] = useState(
    typeof window !== 'undefined'
      && window.innerWidth >= 768
      && window.innerWidth <= 1024
      && window.innerHeight > window.innerWidth
  );
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(
    typeof window !== 'undefined'
      && window.innerWidth >= 768
      && window.innerWidth <= 1366
      && window.innerHeight >= 480
      && window.innerHeight < window.innerWidth
  );

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const measure = () => {
      const portraitTablet = window.innerWidth >= 768
        && window.innerWidth <= 1024
        && window.innerHeight > window.innerWidth;
      setIsPortraitTablet(portraitTablet);
      setIsLandscapeTablet(
        window.innerWidth >= 768
          && window.innerWidth <= 1366
          && window.innerHeight >= 480
          && window.innerHeight < window.innerWidth
      );
    };

    let settleTimer = 0;
    let settleFrame = 0;
    const handleResize = () => {
      setIsLayoutReady(false);
      measure();
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        measure();
        settleFrame = requestAnimationFrame(() => setIsLayoutReady(true));
      }, 120);
    };

    measure();
    window.addEventListener('resize', handleResize);
    const t = setTimeout(measure, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t);
      clearTimeout(settleTimer);
      cancelAnimationFrame(settleFrame);
    };
  }, []);

  // Llegeix belt2 (CSS vars) per alinear el grid del PDP amb el rail de targetes
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const readCss = (name) => {
      try {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        const n = parseFloat(raw);
        return Number.isFinite(n) ? n : null;
      } catch { return null; }
    };
    const measure = () => {
      const xL = readCss('--belt2-xL');
      const xR = readCss('--belt2-xR');
      if (Number.isFinite(xL) && Number.isFinite(xR) && xR > xL) {
        setBeltWidth(xR - xL);
      }
    };
    measure();
    const t = setTimeout(measure, 200);
    let mo = null;
    try {
      mo = new MutationObserver(measure);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    } catch { /* ignore */ }
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
      if (mo) mo.disconnect();
    };
  }, [isPortraitTablet]);

  useLayoutEffect(() => {
    if (!isLandscapeTablet || typeof window === 'undefined') {
      setTdpAvailableHeight(null);
      return undefined;
    }

    let frame = 0;
    let observedStripe = null;
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => schedule())
      : null;

    const measure = () => {
      const row = productRowRef.current;
      const stripe = document.querySelector('[data-stripe-bottom]');
      if (stripe !== observedStripe) {
        if (observedStripe) resizeObserver?.unobserve(observedStripe);
        observedStripe = stripe;
        if (observedStripe) resizeObserver?.observe(observedStripe);
      }
      if (!row || !stripe) {
        setTdpAvailableHeight(null);
        return;
      }
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
      const top = Math.max(row.getBoundingClientRect().top, stripe.getBoundingClientRect().bottom);
      const next = Math.max(80, Math.floor(viewportHeight - top - 8));
      setTdpAvailableHeight((previous) => previous === next ? previous : next);
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    schedule();
    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
    };
  }, [isLandscapeTablet]);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const urlColor = sp.get('color');
    const urlVariant = sp.get('variant');
    if (urlColor) {
      const idx = OFFICIAL_COLORS.indexOf(urlColor);
      if (idx >= 0) setMainVariantIndex(idx);
    }
    if (urlVariant) {
      const vf = VARIANT_TO_FINISH[urlVariant];
      if (vf && AVAILABLE_FINISHES.includes(vf)) setSelectedFinish(vf);
    }
  }, [location.search]);

  const isTablet = isPortraitTablet || isLandscapeTablet;

  // --- Estils per a tablet portrait ---
  const portraitBelt = isPortraitTablet && typeof window !== 'undefined'
    ? Math.min(1350, Math.max(320, window.innerHeight - 32))
    : null;
  const portraitHorizontalCardWidth = portraitBelt
    ? Math.round((portraitBelt - 67.5) / 4) * (0.94 / 0.846)
    : null;
  const portraitRailMaxWidth = portraitHorizontalCardWidth && typeof window !== 'undefined'
    ? (window.innerWidth - 32) / 0.846
    : null;
  const portraitRailGutterX = portraitHorizontalCardWidth && portraitRailMaxWidth
    ? Math.min(22.5, Math.max(0, (portraitRailMaxWidth - portraitHorizontalCardWidth * 3) / 2))
    : null;
  const portraitRailViewportWidth = portraitHorizontalCardWidth && portraitRailGutterX != null
    ? portraitHorizontalCardWidth * 3 + portraitRailGutterX * 2
    : null;

  // --- Ample del contenidor de 3 columnes ---
  const containerMaxWidth = isPortraitTablet && portraitBelt
    ? `${portraitBelt}px`
    : '1350px';

  // --- Grid 4 columnes (1+2+1) ---
  // Mateix grid que les 4 targetes d'Altres històries:
  //   col1 (specs) = targeta 1
  //   col2-3 (imatge+fons gris) = targetes 2+3 (span 2)
  //   col4 (info) = targeta 4
  // Tant portrait com landscape tablet fan servir la mateixa mida compacta
  const isCompactTablet = isLandscapeTablet || isPortraitTablet;
  const PAUTA_GUTTER_X = isPortraitTablet
    ? (portraitRailGutterX ?? 14)
    : (isLandscapeTablet ? 14 : 22.5);
  const colGap = `${PAUTA_GUTTER_X}px`;
  const tdpGridTemplate = `repeat(4, 1fr)`;
  const tdpBaseHeight = isCompactTablet ? 280 : 360;
  const tdpFitScale = isLandscapeTablet && Number.isFinite(tdpAvailableHeight)
    ? Math.min(1, tdpAvailableHeight / tdpBaseHeight)
    : 1;
  const tdpRenderedHeight = Math.round(tdpBaseHeight * tdpFitScale);
  const titleSettings = isCompactTablet ? { ...PDP_TITLE_SETTINGS, fontSize: 19, lineHeight: 0.95 } : PDP_TITLE_SETTINGS;
  const collectionSettings = isCompactTablet ? { ...PDP_COLLECTION_SETTINGS, fontSize: 14, lineHeight: 1 } : PDP_COLLECTION_SETTINGS;
  const descriptionSettings = isCompactTablet
    ? { ...PDP_DESCRIPTION_SETTINGS, fontSize: 12, lineHeight: 1.2, letterSpacing: 0.02 }
    : { ...PDP_DESCRIPTION_SETTINGS, lineHeight: PDP_DESCRIPTION_SETTINGS.lineHeight };
  const priceSettings = isCompactTablet ? { ...PDP_PRICE_SETTINGS, fontSize: 19 } : PDP_PRICE_SETTINGS;

  return (
    <section
      className="bg-background"
      style={{
        position: 'relative',
        visibility: isLayoutReady ? 'visible' : 'hidden',
      }}
    >
      <Helmet>
        <title>{`${PRODUCT_NAME} · ${COLLECTION_NAME} | Higgins Gràfic`}</title>
        <meta
          name="description"
          content={`${PRODUCT_NAME} — ${COLLECTION_NAME}. Pàgina de detall de producte.`}
        />
      </Helmet>
      <SEOProductSchema product={{ name: PRODUCT_NAME, description: `${PRODUCT_NAME} — ${COLLECTION_NAME}`, image: TDP_IMAGE(product.colors?.[0], DEFAULT_FINISH), slug: PRODUCT_SLUG, collection: COLLECTION_SLUG }} url={`/${PRODUCT_ROUTE}`} />

      <div
        style={{
          maxWidth: containerMaxWidth,
          margin: '0 auto',
          padding: '0 16px',
          position: 'relative',
        }}
      >
        {!isTablet && (
          <div style={{ position: 'absolute', top: 0, left: '16px', zIndex: 10 }}>
            <Breadcrumbs
              items={[
                { label: COLLECTION_NAME, link: `/${COLLECTION_SLUG}` },
                { label: productName },
              ]}
            />
          </div>
        )}

        <PageBand type="related" style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <div style={{ width: '100%', transform: 'translateY(-32px)' }}>
            <TambeRail
              images={otherImages}
              showTitle={false}
              showInternalArrows={false}
              visibleCards={isPortraitTablet ? 3 : 4}
              stabilizeInitialLayout={isPortraitTablet}
              stabilizedViewportScale={isPortraitTablet ? 0.846 : 1}
              stabilizedViewportWidth={portraitRailViewportWidth}
              stabilizedGutterX={isPortraitTablet ? portraitRailGutterX : PAUTA_GUTTER_X}
            />
          </div>
        </PageBand>

        <PageBand
          type="product"
          fluid
          style={{
            height: isLandscapeTablet && Number.isFinite(tdpAvailableHeight) ? `${tdpRenderedHeight}px` : undefined,
            overflow: isLandscapeTablet && Number.isFinite(tdpAvailableHeight) ? 'hidden' : undefined,
            marginTop: isPortraitTablet ? '48px' : '-32px',
            marginBottom: '32px',
          }}
        >
          <div
            ref={productRowRef}
            style={{
              display: 'grid',
              gridTemplateColumns: isPortraitTablet ? 'repeat(3, 1fr)' : tdpGridTemplate,
              gap: colGap,
              alignItems: 'stretch',
              width: tdpFitScale < 1 ? `${100 / tdpFitScale}%` : (isPortraitTablet && portraitRailViewportWidth ? `${portraitRailViewportWidth}px` : (beltWidth ? `${beltWidth}px` : '100%')),
              height: `${tdpBaseHeight}px`,
              margin: beltWidth ? '0 auto' : undefined,
              transform: tdpFitScale < 1 ? `scale(${tdpFitScale})` : undefined,
              transformOrigin: 'top left',
            }}
          >
          {/* ═══ Columna 1: ESPECIFICACIONS ═══ */}
          <div
            style={{
              gridColumn: '1',
              display: isPortraitTablet ? 'none' : 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            <h2
              style={{
                margin: 0,
                marginBottom: isCompactTablet ? '10px' : '20px',
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 300,
                fontSize: isCompactTablet ? '16pt' : '20pt',
                lineHeight: 1,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#475059',
                textAlign: 'right',
              }}
            >
              ESPECIFICACIONS
            </h2>
            <dl
              style={{
                margin: 0,
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                rowGap: isCompactTablet ? '4px' : '12px',
              }}
            >
              {SPECS.map(({ label, value }) => (
                <div
                  key={`spec-${label}`}
                  style={{
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    rowGap: 2,
                    fontFamily: 'Roboto Condensed, sans-serif',
                    fontWeight: 300,
                    fontSize: isCompactTablet ? '11pt' : '14pt',
                    lineHeight: isCompactTablet ? 1.05 : 1.2,
                    letterSpacing: '0.03em',
                    color: 'rgba(71, 80, 89, 0.7)',
                    textAlign: 'right',
                  }}
                >
                  <dt
                    style={{
                      fontFamily: 'Roboto Condensed, sans-serif',
                      fontSize: isCompactTablet ? 9 : 11,
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#111827',
                      lineHeight: 1.2,
                    }}
                  >
                    {label}
                  </dt>
                  <dd style={{ margin: 0 }}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ═══ Columna 2-3: imatge + thumbnails (span 2) ═══ */}
          <div
            style={{
              gridColumn: isPortraitTablet ? '1 / 3' : '2 / 4',
              display: 'flex',
              flexDirection: 'row',
              minWidth: 0,
              minHeight: isCompactTablet ? 0 : '360px',
              height: isCompactTablet ? '100%' : undefined,
            }}
          >
            {/* Imatge principal + miniatures dins del fons gris */}
            <div
              style={{
                position: 'relative',
                flex: '1 1 auto',
                minWidth: 0,
                minHeight: 0,
                background: '#fbfcfd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={TDP_IMAGE(mainVariantColor, selectedFinish)}
                alt={`Producte principal ${mainVariantColor}`}
                draggable={false}
                style={{
                  maxWidth: '60%',
                  maxHeight: isCompactTablet ? '240px' : '288px',
                  objectFit: 'contain',
                  userSelect: 'none',
                  transform: 'translateX(20px)',
                }}
              />
              <CarouselArrows
                rightPx={0}
                bottomPx={0}
                onPrev={goPrevVariant}
                onNext={goNextVariant}
                prevLabel="Variant anterior"
                nextLabel="Variant següent"
                rowHeight={44}
                vertical
              />

              {/* 5 miniatures dins del fons gris, alineades a l'esquerra */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isCompactTablet ? '4px' : '8px',
                  width: isCompactTablet ? '80px' : '120px',
                  flexShrink: 0,
                  justifyContent: 'center',
                  padding: isCompactTablet ? '4px' : '8px',
                  boxSizing: 'border-box',
                }}
              >
                {(() => {
                  const THUMB_VISIBLE = 5;
                  const N = OFFICIAL_COLORS.length;
                  const center = Math.floor(THUMB_VISIBLE / 2);
                  const wrap = (i) => ((i % N) + N) % N;
                  return Array.from({ length: THUMB_VISIBLE }).map((_, vIdx) => {
                    const idx = wrap(mainVariantIndex - center + vIdx);
                    const color = OFFICIAL_COLORS[idx];
                    const isActive = vIdx === center;
                    return (
                      <button
                        key={`thumb-slot-${vIdx}`}
                        type="button"
                        aria-label={`Variant ${color}`}
                        aria-pressed={isActive}
                        onClick={() => setMainVariantIndex(idx)}
                        style={{
                          position: 'relative',
                          flex: '1 1 0%',
                          minHeight: 0,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                      >
                        {isActive && (
                          <span
                            aria-hidden="true"
                            style={{
                              position: 'absolute',
                              left: '4px',
                              top: '4px',
                              bottom: '4px',
                              width: '3px',
                              background: '#0b0d10',
                            }}
                          />
                        )}
                        <img
                          src={TDP_IMAGE(color, selectedFinish)}
                          alt=""
                          aria-hidden="true"
                          draggable={false}
                          style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain',
                            userSelect: 'none',
                          }}
                        />
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* ═══ Columna 4: info producte ═══ */}
          <div
            style={{
              gridColumn: isPortraitTablet ? '3' : '4',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              height: '100%',
              position: 'relative',
              paddingRight: '30px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: isCompactTablet ? '6px' : '12px' }}>
            {/* Nom del producte */}
            <EditableTextBox
              id={`${PRODUCT_SLUG}-pdp-product-name`}
              initialText={productName}
              initialSettings={titleSettings}
              presetVersion={PDP_PRESET_VERSION}
              renderHandle={false}
              handleRight="-22px"
              style={{ width: '100%' }}
            />

            {/* Nom de la col·lecció */}
            <EditableTextBox
              id={`${PRODUCT_SLUG}-pdp-collection-name`}
              initialText={COLLECTION_NAME}
              initialSettings={collectionSettings}
              presetVersion={PDP_PRESET_VERSION}
              renderHandle={false}
              handleRight="-22px"
              style={{ width: '100%' }}
            />

            {/* Preu — sobre el selector de talles, mateixa alçada i gap */}
            <div
              style={{
                width: 'calc(100% - 30px)',
                height: '44px',
                boxSizing: 'border-box',
                position: 'absolute',
                bottom: '162px',
                left: '0',
                display: 'flex',
                alignItems: 'center',
              }}
            >
            <EditableTextBox
              id={`${PRODUCT_SLUG}-pdp-price`}
              initialText="15,50€"
              initialSettings={priceSettings}
              presetVersion={PDP_PRESET_VERSION}
              renderHandle={false}
              handleRight="-22px"
              style={{ width: '100%' }}
            />
            </div>

            {/* Selector de talles — sobre el selector de colors, mateixa alçada i gap */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f3f4f6',
                padding: '2px',
                borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
                border: '1px solid #e5e7eb',
                width: 'calc(100% - 30px)',
                height: '44px',
                boxSizing: 'border-box',
                position: 'absolute',
                bottom: '108px',
                left: '0',
              }}
            >
              {SIZES.map((size) => {
                const isSelected = size === selectedSize;
                return (
                  <button
                    key={`size-${size}`}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    style={{
                      flex: 1,
                      fontFamily: `${sizeButtonTextSettings.fontFamily}, sans-serif`,
                      fontSize: `${sizeButtonTextSettings.fontSize}pt`,
                      fontWeight: isSelected ? sizeButtonTextSettings.selectedFontWeight : sizeButtonTextSettings.fontWeight,
                      letterSpacing: `${sizeButtonTextSettings.letterSpacing}em`,
                      lineHeight: sizeButtonTextSettings.lineHeight,
                      textTransform: sizeButtonTextSettings.textTransform,
                      color: isSelected ? '#111827' : '#9ca3af',
                      backgroundColor: isSelected ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderRadius: 'clamp(2.11px, 0.6vw, 3.8px)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {/* Handle d'edició per als botons de talles */}
            <EditableTextBox
              id={`${PRODUCT_SLUG}-pdp-size-buttons`}
              initialText={SIZES.join(' ')}
              columns={SIZES}
              selectedColumn={selectedSize}
              onColumnSelect={setSelectedSize}
              renderText={false}
              renderHandle={false}
              onSettingsChange={setSizeButtonTextSettings}
              initialSettings={PDP_SIZE_SETTINGS}
              presetVersion={PDP_PRESET_VERSION}
              handleRight="-22px"
              style={{ width: 0, height: 0, alignSelf: 'flex-end' }}
            />
            </div>

            {/* Selector d'acabats — alineat amb la fletxa, bottom del fons gris */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f3f4f6',
                padding: '2px',
                borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
                border: '1px solid #e5e7eb',
                width: 'calc(100% - 30px)',
                height: '44px',
                boxSizing: 'border-box',
                position: 'absolute',
                bottom: '54px',
                left: '0',
              }}
            >
              {FINISHES.map((opt) => {
                const isAvailable = AVAILABLE_FINISHES.includes(opt);
                const isActive = isAvailable && selectedFinish === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={!isAvailable}
                    onClick={isAvailable ? () => setSelectedFinish(opt) : undefined}
                    style={{
                      flex: 1,
                      fontFamily: `${finishButtonTextSettings.fontFamily}, sans-serif`,
                      fontSize: `${finishButtonTextSettings.fontSize}pt`,
                      fontWeight: isActive ? finishButtonTextSettings.selectedFontWeight : finishButtonTextSettings.fontWeight,
                      letterSpacing: `${finishButtonTextSettings.letterSpacing}em`,
                      lineHeight: finishButtonTextSettings.lineHeight,
                      textTransform: finishButtonTextSettings.textTransform,
                      color: !isAvailable ? '#d1d5db' : (isActive ? '#111827' : '#9ca3af'),
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderRadius: 'clamp(2.11px, 0.6vw, 3.8px)',
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      opacity: isAvailable ? 1 : 0.45,
                      transition: 'all 150ms ease',
                      boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Handle d'edició per al selector d'acabats */}
            <EditableTextBox
              id={`${PRODUCT_SLUG}-pdp-finish-buttons`}
              initialText="BLANC COLOR NEGRE"
              columns={FINISHES}
              selectedColumn={selectedFinish}
              onColumnSelect={setSelectedFinish}
              renderText={false}
              renderHandle={false}
              onSettingsChange={setFinishButtonTextSettings}
              initialSettings={PDP_SIZE_SETTINGS}
              presetVersion={PDP_PRESET_VERSION}
              handleRight="-22px"
              style={{ width: 0, height: 0, alignSelf: 'flex-end' }}
            />

            {/* CTA */}
            <button
              type="button"
              aria-label="Afegeix al cistell"
              onClick={() => {
                try {
                  window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
                    detail: { source: 'product-pdp-cta', firstPartOnly: true, item: { title: productName.toUpperCase(), collection: COLLECTION_NAME, collectionSlug: IMAGE_COLLECTION, productRoute: PRODUCT_ROUTE, qty: 1, size: selectedSize, price: '15,50€', color: mainVariantColor, finish: selectedFinish, drawing: '', disabled: false } },
                  }));
                } catch {
                  // ignore
                }
              }}
              className="bg-muted text-[#475059] transition-all duration-200 hover:bg-white hover:text-[#111827] hover:shadow-sm active:scale-95"
              style={{
                width: 'calc(100% - 30px)',
                height: '44px',
                position: 'absolute',
                bottom: '0',
                left: '0',
                border: '1px solid #e5e7eb',
                borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
                padding: '0 16px',
                cursor: 'pointer',
                fontFamily: `${ctaTextSettings.fontFamily}, sans-serif`,
                fontSize: `${ctaTextSettings.fontSize}pt`,
                fontWeight: ctaTextSettings.fontWeight,
                letterSpacing: `${ctaTextSettings.letterSpacing}em`,
                lineHeight: ctaTextSettings.lineHeight,
                textTransform: ctaTextSettings.textTransform,
                color: ctaTextSettings.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <svg
                width="calc(1.2em - 1px)"
                height="calc(1.2em - 1px)"
                viewBox="0 0 70 69"
                style={{
                  fillRule: 'evenodd',
                  clipRule: 'evenodd',
                  strokeLinejoin: 'round',
                  strokeMiterlimit: 2,
                  display: 'block',
                  transform: 'translateY(-2px)',
                  fill: 'currentColor',
                }}
              >
                <rect id="v3-buit" x="0" y="0.852" width="70" height="68" style={{ fill: 'none' }} />
                <g clipPath="url(#_clip1_cta)">
                  <clipPath id="_clip1_cta">
                    <rect x="0" y="0.852" width="70" height="68" />
                  </clipPath>
                  <path d="M-0.004,16.609l70.007,0l-5.013,39.965c-1.062,8.376 -5.433,12.278 -13.816,12.278l-32.337,0c-8.384,0 -12.754,-3.902 -13.804,-12.278l-5.038,-39.965Zm64.335,5.034l-58.664,0l4.321,34.299c0.343,2.734 1.031,4.826 2.499,6.146l0.004,0.004c1.483,1.318 3.625,1.739 6.346,1.739l32.337,0c2.721,0 4.863,-0.422 6.342,-1.736c1.486,-1.322 2.164,-3.416 2.508,-6.154l4.308,-34.298Z" />
                  <path d="M24.674,26.676c0.512,5.307 4.943,9.468 10.338,9.468c5.384,0 9.814,-4.161 10.326,-9.468l-3.265,0c-0.496,3.493 -3.478,6.183 -7.06,6.183c-3.594,0 -6.577,-2.69 -7.073,-6.183l-3.265,0Z" />
                </g>
              </svg>
              AFEGEIX AL CISTELL
            </button>

            {/* Handle d'edició per al CTA */}
            <EditableTextBox
              id={`${PRODUCT_SLUG}-pdp-cta`}
              initialText="AFEGEIX AL CISTELL"
              initialSettings={PDP_CTA_SETTINGS}
              presetVersion={PDP_PRESET_VERSION}
              renderText={false}
              renderHandle={false}
              onSettingsChange={setCtaTextSettings}
              handleRight="-22px"
              style={{ width: 0, height: 0, alignSelf: 'flex-end' }}
            />
          </div>
          </div>
        </PageBand>

        <PageBand
          type="transition"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StoryPosterLink style={isPortraitTablet ? { marginLeft: '300px' } : undefined} />
        </PageBand>
      </div>
    </section>
  );
}

export default PdpPage;
