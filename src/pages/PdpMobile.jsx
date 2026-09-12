import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { tdpImageFor, availableFinishesFor, defaultFinishFor } from '@/lib/pdpMockup';
import { PDP_REGISTRY_BY_ROUTE } from '@/data/pdpRegistry';
import StoryPosterLink from '@/components/StoryPosterLink';
import MobileFooter from '@/components/MobileFooter';
import { useCart } from '@/contexts/CartContext';

const OFFICIAL_COLORS = [
  'white', 'light-blue', 'royal', 'navy', 'purple', 'light-pink', 'daisy',
  'gold', 'red', 'kiwi', 'irish-green', 'military-green', 'forest-green', 'black',
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const FINISHES = ['BLANC', 'COLOR', 'NEGRE'];

const SPECS = [
  { label: 'Material', value: '100% cotó pentinat de 150 g/m²' },
  { label: 'Tall', value: 'Coll rodó' },
  { label: 'Estampació', value: 'Impressió DTF' },
  { label: 'Cura', value: 'Renta-la al revés i a 30°C' },
  { label: 'Garantia', value: 'Devolució 14 dies' },
];

export default function PdpPage() {
  const location = useLocation();
  const { addToCart } = useCart();
  const registryKey = location.pathname.replace(/^\//, '');
  const product = PDP_REGISTRY_BY_ROUTE[registryKey];

  if (!product) {
    return (
      <div style={{ padding: '90px 16px 60px', textAlign: 'center', color: '#475059' }}>
        Producte no trobat.
      </div>
    );
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

  const searchParams = new URLSearchParams(location.search);
  const urlColor = searchParams.get('color');
  const initialIndex = urlColor ? OFFICIAL_COLORS.indexOf(urlColor) : 0;
  const effectiveInitialIndex = initialIndex >= 0 ? initialIndex : 0;

  const VARIANT_TO_FINISH = { white: 'BLANC', black: 'NEGRE', color: 'COLOR' };
  const urlFinish = searchParams.get('finish');
  const urlVariant = searchParams.get('variant');
  const variantFinish = urlVariant && VARIANT_TO_FINISH[urlVariant];
  const resolvedFinish = (urlFinish && AVAILABLE_FINISHES.includes(urlFinish)) ? urlFinish
    : (variantFinish && AVAILABLE_FINISHES.includes(variantFinish)) ? variantFinish
    : DEFAULT_FINISH;

  const [selectedFinish, setSelectedFinish] = useState(resolvedFinish);
  const [selectedSize, setSelectedSize] = useState('M');
  const [mainVariantIndex, setMainVariantIndex] = useState(effectiveInitialIndex);
  const mainVariantColor = OFFICIAL_COLORS[mainVariantIndex];

  const goPrevVariant = () => setMainVariantIndex((i) => (i - 1 + OFFICIAL_COLORS.length) % OFFICIAL_COLORS.length);
  const goNextVariant = () => setMainVariantIndex((i) => (i + 1) % OFFICIAL_COLORS.length);

  const collectionHref = `/${COLLECTION_SLUG}`;

  const handleAddToCart = () => {
    addToCart({
      id: `${COLLECTION_SLUG}-${PRODUCT_ROUTE}-${mainVariantColor}`,
      name: PRODUCT_NAME,
      productRoute: PRODUCT_ROUTE,
      collection: COLLECTION_SLUG,
      color: mainVariantColor,
      finish: selectedFinish,
      image: TDP_IMAGE(mainVariantColor, selectedFinish),
      price: 15.5,
    }, selectedSize, 1);
  };

  // Miniatures visibles: 5, centrades a la seleccionada (com desktop)
  const THUMB_VISIBLE = 5;
  const N = OFFICIAL_COLORS.length;
  const center = Math.floor(THUMB_VISIBLE / 2);
  const wrap = (i) => ((i % N) + N) % N;

  return (
    <div className="bg-background" style={{ paddingTop: '60px' }}>
      {/* Columna única: imatge + info (columnes 2-3 i 4 de desktop fusionades) */}
      <div style={{ padding: '0 16px' }}>
        {/* Imatge amb fons gris + miniatures verticals a l'esquerra (com desktop) */}
        <div style={{
          position: 'relative',
          background: '#fbfcfd',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'row',
          minHeight: '360px',
          height: '360px',
          overflow: 'hidden',
        }}>
          {/* Miniatures verticals a l'esquerra (com desktop) */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '80px',
            flexShrink: 0,
            justifyContent: 'center',
            padding: '8px',
            boxSizing: 'border-box',
          }}>
            {Array.from({ length: THUMB_VISIBLE }).map((_, vIdx) => {
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
                        right: '4px',
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
            })}
          </div>

          {/* Imatge principal centrada (com desktop, desplaçada a la dreta) */}
          <img
            src={TDP_IMAGE(mainVariantColor, selectedFinish)}
            alt={`Producte principal ${mainVariantColor}`}
            draggable={false}
            style={{
              maxWidth: '60%',
              maxHeight: '288px',
              objectFit: 'contain',
              userSelect: 'none',
              transform: 'translateX(20px)',
              margin: 'auto',
            }}
          />

          {/* Nom + col·lecció centrats amb la 1a miniatura, preu centrat amb l'última */}
          <div style={{
            position: 'absolute',
            left: '64px',
            right: '24px',
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '8px',
            boxSizing: 'border-box',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            {/* Cel·la 1: nom + col·lecció centrats amb la 1a miniatura */}
            <div style={{
              flex: '1 1 0%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <h1 style={{
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 300,
                fontSize: '24px',
                textTransform: 'uppercase',
                letterSpacing: '0.003em',
                lineHeight: 1,
                color: '#475059',
                margin: '0 0 8px 0',
                textAlign: 'center',
              }}>
                {PRODUCT_NAME}
              </h1>
              <Link to={collectionHref} style={{
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: '10px',
                fontWeight: 400,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(71,80,89,0.7)',
                textDecoration: 'none',
                display: 'block',
                pointerEvents: 'auto',
                textAlign: 'center',
              }}>
                {COLLECTION_NAME}
              </Link>
            </div>
            {/* Cel·les 2-4: buides (same flex que les miniatures) */}
            <div style={{ flex: '1 1 0%', minHeight: 0 }} />
            <div style={{ flex: '1 1 0%', minHeight: 0 }} />
            <div style={{ flex: '1 1 0%', minHeight: 0 }} />
            {/* Cel·la 5: preu centrat amb l'última miniatura */}
            <div style={{
              flex: '1 1 0%',
              minHeight: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 200,
                fontSize: '24px',
                color: '#475059',
                lineHeight: 1,
                textAlign: 'center',
              }}>
                15,50€
              </div>
            </div>
          </div>

          {/* Fletxes de navegació vertical (com desktop CarouselArrows) */}
          <button
            onClick={goPrevVariant}
            style={{
              position: 'absolute',
              right: '8px',
              bottom: '72px',
              transform: 'none',
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              width: '54px',
              height: '54px',
              fontSize: '27px',
              lineHeight: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
            aria-label="Variant anterior"
          >
            <span style={{ display: 'inline-block', transform: 'translateY(-1px)' }}>‹</span>
          </button>
          <button
            onClick={goNextVariant}
            style={{
              position: 'absolute',
              right: '8px',
              bottom: '8px',
              transform: 'none',
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              width: '54px',
              height: '54px',
              fontSize: '27px',
              lineHeight: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
            aria-label="Variant següent"
          >
            <span style={{ display: 'inline-block', transform: 'translateY(-1px)' }}>›</span>
          </button>
        </div>

        {/* Info del producte a sota (selectors + CTA + specs) */}
        <div style={{
          paddingTop: '20px',
          paddingBottom: '24px',
        }}>
          {/* Selector de talles */}
          <div style={{ marginBottom: '10px', width: '75%', margin: '0 auto 10px auto' }}>
            <div style={{
              display: 'flex',
              backgroundColor: '#f3f4f6',
              padding: '2px',
              borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
              border: '1px solid #e5e7eb',
              width: '100%',
              height: '44px',
              boxSizing: 'border-box',
            }}>
              {SIZES.map((size) => {
                const isSelected = size === selectedSize;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    style={{
                      flex: 1,
                      fontFamily: 'Oswald, sans-serif',
                      fontSize: '12pt',
                      fontWeight: isSelected ? 400 : 300,
                      letterSpacing: '0em',
                      lineHeight: 1,
                      textTransform: 'none',
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
          </div>

          {/* Selector d'acabats */}
          <div style={{ width: '75%', margin: '0 auto 10px auto' }}>
            <div style={{
              display: 'flex',
              backgroundColor: '#f3f4f6',
              padding: '2px',
              borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
              border: '1px solid #e5e7eb',
              width: '100%',
              height: '44px',
              boxSizing: 'border-box',
            }}>
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
                      fontFamily: 'Oswald, sans-serif',
                      fontSize: '12pt',
                      fontWeight: isActive ? 400 : 300,
                      letterSpacing: '0em',
                      lineHeight: 1,
                      textTransform: 'uppercase',
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
          </div>

          {/* CTA Afegeix al cistell */}
          <button
            type="button"
            aria-label="Afegeix al cistell"
            onClick={handleAddToCart}
            className="bg-muted text-[#475059] transition-all duration-200 hover:bg-white hover:text-[#111827] hover:shadow-sm active:scale-95"
            style={{
              width: '75%',
              margin: '0 auto 24px auto',
              height: '44px',
              border: '1px solid #e5e7eb',
              borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
              padding: '0 16px',
              cursor: 'pointer',
              fontFamily: 'Oswald, sans-serif',
              fontSize: '12pt',
              fontWeight: 300,
              letterSpacing: '0.04em',
              lineHeight: 1,
              textTransform: 'uppercase',
              color: '#475059',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <svg
              width="21.875px"
              height="21.875px"
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
              <g clipPath="url(#_clip1_cta_mobile)">
                <clipPath id="_clip1_cta_mobile">
                  <rect x="0" y="0.852" width="70" height="68" />
                </clipPath>
                <path d="M-0.004,16.609l70.007,0l-5.013,39.965c-1.062,8.376 -5.433,12.278 -13.816,12.278l-32.337,0c-8.384,0 -12.754,-3.902 -13.804,-12.278l-5.038,-39.965Zm64.335,5.034l-58.664,0l4.321,34.299c0.343,2.734 1.031,4.826 2.499,6.146l0.004,0.004c1.483,1.318 3.625,1.739 6.346,1.739l32.337,0c2.721,0 4.863,-0.422 6.342,-1.736c1.486,-1.322 2.164,-3.416 2.508,-6.154l4.308,-34.298Z" />
                <path d="M24.674,26.676c0.512,5.307 4.943,9.468 10.338,9.468c5.384,0 9.814,-4.161 10.326,-9.468l-3.265,0c-0.496,3.493 -3.478,6.183 -7.06,6.183c-3.594,0 -6.577,-2.69 -7.073,-6.183l-3.265,0Z" />
              </g>
            </svg>
            AFEGEIX AL CISTELL
          </button>

          {/* Especificacions (columna 1 de desktop, a sota) */}
          <div style={{
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 300,
              fontSize: '16pt',
              lineHeight: 1,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#475059',
              textAlign: 'left',
            }}>
              ESPECIFICACIONS
            </h2>
            <dl style={{
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              rowGap: '12px',
            }}>
              {SPECS.map(({ label, value }) => (
                <div
                  key={`spec-${label}`}
                  style={{
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: 2,
                    fontFamily: 'Roboto Condensed, sans-serif',
                    fontWeight: 300,
                    fontSize: '14pt',
                    lineHeight: 1.2,
                    letterSpacing: '0.03em',
                    color: 'rgba(71, 80, 89, 0.7)',
                    textAlign: 'left',
                  }}
                >
                  <dt style={{
                    fontFamily: 'Roboto Condensed, sans-serif',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#111827',
                    lineHeight: 1.2,
                  }}>
                    {label}
                  </dt>
                  <dd style={{ margin: 0 }}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div style={{
        height: '1px',
        backgroundColor: '#e5e7eb',
        margin: '0 16px',
      }} />

      {/* StoryPosterLink al final */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '120px',
        paddingBottom: '120px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        <StoryPosterLink style={{ fontSize: '28pt' }} />
      </div>

      <MobileFooter />
    </div>
  );
}
