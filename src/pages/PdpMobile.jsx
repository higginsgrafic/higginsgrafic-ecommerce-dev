import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { tdpImageFor, availableFinishesFor, defaultFinishFor } from '@/lib/pdpMockup';
import { PDP_REGISTRY_BY_ROUTE } from '@/data/pdpRegistry';
import StoryPosterLink from '@/components/StoryPosterLink';
import { buildOtherCollectionsImages } from '@/components/home/homeDrawings';

const OFFICIAL_COLORS = [
  'white', 'light-blue', 'royal', 'navy', 'purple', 'light-pink', 'daisy',
  'gold', 'red', 'kiwi', 'irish-green', 'military-green', 'forest-green', 'black',
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const FINISHES = ['BLANC', 'COLOR', 'NEGRE'];

const PRODUCT_DESCRIPTION = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna";

export default function PdpMobile() {
  const location = useLocation();
  const registryKey = location.pathname.replace(/^\//, '');
  const product = PDP_REGISTRY_BY_ROUTE[registryKey];

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

  // Ref per scroll de miniatures
  const thumbsRef = useRef(null);

  // Scroll automàtic a la miniatura seleccionada
  useEffect(() => {
    if (!thumbsRef.current) return;
    const container = thumbsRef.current;
    const thumb = container.children[mainVariantIndex];
    if (thumb) {
      const containerWidth = container.offsetWidth;
      const thumbLeft = thumb.offsetLeft;
      const thumbWidth = thumb.offsetWidth;
      container.scrollTo({
        left: thumbLeft - (containerWidth - thumbWidth) / 2,
        behavior: 'smooth',
      });
    }
  }, [mainVariantIndex]);

  return (
    <div className="bg-background" style={{ paddingTop: '90px' }}>
      {/* Breadcrumbs */}
      <div style={{
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '8px',
        paddingBottom: '16px',
        fontFamily: 'Roboto Condensed, sans-serif',
        fontSize: '11px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(71,80,89,0.7)',
      }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Inici</Link>
        {' / '}
        <Link to={collectionHref} style={{ color: 'inherit', textDecoration: 'none' }}>{COLLECTION_NAME}</Link>
        {' / '}
        <span>{PRODUCT_NAME}</span>
      </div>

      {/* Imatge principal */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fbfcfd',
        margin: '0 16px',
        borderRadius: '4px',
        padding: '20px',
        position: 'relative',
        minHeight: '300px',
      }}>
        <img
          src={TDP_IMAGE(mainVariantColor, selectedFinish)}
          alt={`Producte ${mainVariantColor}`}
          draggable={false}
          style={{
            maxWidth: '100%',
            maxHeight: '350px',
            objectFit: 'contain',
            userSelect: 'none',
          }}
        />
        {/* Fletxes de navegació */}
        <button
          onClick={goPrevVariant}
          style={{
            position: 'absolute',
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid #e5e7eb',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Color anterior"
        >
          ‹
        </button>
        <button
          onClick={goNextVariant}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid #e5e7eb',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Color següent"
        >
          ›
        </button>
      </div>

      {/* Miniatures horitzontals scrollable - senars, amb selector concordança */}
      <div
        ref={thumbsRef}
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '12px 16px',
          scrollbarWidth: 'none',
          scrollSnapType: 'x mandatory',
        }}
        className="pdp-mobile-thumbs"
      >
        {OFFICIAL_COLORS.map((color, idx) => {
          const isSelected = idx === mainVariantIndex;
          return (
            <button
              key={color}
              onClick={() => setMainVariantIndex(idx)}
              style={{
                flexShrink: 0,
                width: '52px',
                height: '52px',
                border: isSelected ? '2px solid #0b0d10' : '1px solid #e5e7eb',
                borderRadius: '4px',
                backgroundColor: isSelected ? '#f3f4f6' : '#fbfcfd',
                cursor: 'pointer',
                padding: '2px',
                overflow: 'hidden',
                scrollSnapAlign: 'center',
                transition: 'border-color 150ms ease, background-color 150ms ease',
                boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
              aria-label={color}
              aria-current={isSelected}
            >
              <img
                src={TDP_IMAGE(color, selectedFinish)}
                alt={color}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Informació del producte a sota */}
      <div style={{
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '16px',
      }}>
        {/* Nom col·lecció */}
        <Link to={collectionHref} style={{
          fontFamily: 'Roboto Condensed, sans-serif',
          fontSize: '10px',
          fontWeight: 400,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(71,80,89,0.7)',
          textDecoration: 'none',
          display: 'block',
          marginBottom: '8px',
        }}>
          {COLLECTION_NAME}
        </Link>

        {/* Nom producte */}
        <h1 style={{
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 300,
          fontSize: '24px',
          textTransform: 'uppercase',
          letterSpacing: '0.003em',
          lineHeight: 1,
          color: '#475059',
          margin: '0 0 16px 0',
        }}>
          {PRODUCT_NAME}
        </h1>

        {/* Descripció */}
        <p style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: '14px',
          fontWeight: 300,
          lineHeight: 1.5,
          color: '#111827',
          margin: '0 0 16px 0',
        }}>
          {PRODUCT_DESCRIPTION}
        </p>

        {/* Preu */}
        <div style={{
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 200,
          fontSize: '24px',
          color: '#475059',
          marginBottom: '20px',
        }}>
          15,50€
        </div>

        {/* Selector de talles - segmented control com desktop */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontFamily: 'Roboto Condensed, sans-serif',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(71,80,89,0.7)',
            marginBottom: '8px',
          }}>
            Talla
          </div>
          <div style={{
            display: 'flex',
            backgroundColor: '#f3f4f6',
            padding: '2px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            width: '100%',
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
                    fontSize: '12px',
                    fontWeight: isSelected ? 400 : 300,
                    letterSpacing: '0em',
                    lineHeight: 1,
                    textTransform: 'none',
                    color: isSelected ? '#111827' : '#9ca3af',
                    backgroundColor: isSelected ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 0',
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector d'acabats - segmented control com desktop */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontFamily: 'Roboto Condensed, sans-serif',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(71,80,89,0.7)',
            marginBottom: '8px',
          }}>
            Acabat
          </div>
          <div style={{
            display: 'flex',
            backgroundColor: '#f3f4f6',
            padding: '2px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            width: '100%',
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
                    fontSize: '12px',
                    fontWeight: isActive ? 400 : 300,
                    letterSpacing: '0em',
                    lineHeight: 1,
                    textTransform: 'uppercase',
                    color: !isAvailable ? '#d1d5db' : (isActive ? '#111827' : '#9ca3af'),
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    opacity: isAvailable ? 1 : 0.45,
                    transition: 'all 150ms ease',
                    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 0',
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA Afageix al cistell - com desktop amb icona SVG */}
        <button
          type="button"
          aria-label="Afegeix al cistell"
          onClick={() => {
            try {
              window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
                detail: {
                  source: 'pdp-mobile-cta',
                  firstPartOnly: true,
                  item: {
                    title: PRODUCT_NAME.toUpperCase(),
                    collection: COLLECTION_NAME,
                    collectionSlug: COLLECTION_SLUG,
                    productRoute: PRODUCT_ROUTE,
                    qty: 1,
                    size: selectedSize,
                    price: '15,50€',
                    color: mainVariantColor,
                    finish: selectedFinish,
                    drawing: '',
                    disabled: false,
                  },
                },
              }));
            } catch {
              // ignore
            }
          }}
          className="bg-muted text-[#475059] transition-all duration-200 hover:bg-white hover:text-[#111827] hover:shadow-sm active:scale-95"
          style={{
            width: '100%',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '14px',
            cursor: 'pointer',
            fontFamily: 'Oswald, sans-serif',
            fontSize: '14px',
            fontWeight: 300,
            letterSpacing: '0.04em',
            lineHeight: 1,
            textTransform: 'uppercase',
            color: '#475059',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <svg
            width="18px"
            height="18px"
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
      </div>

      {/* StoryPosterLink al final */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '20px',
        paddingBottom: '120px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        <StoryPosterLink style={{ fontSize: '28pt' }} />
      </div>
    </div>
  );
}
