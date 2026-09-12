import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import TDP1 from '@/components/tdp/TDP1';
import StoryPosterLink from '@/components/StoryPosterLink';
import { buildHomeDrawingPlan, buildHeroStripePlan } from '@/components/home/homeDrawings';
import MobileFooter from '@/components/MobileFooter';

const COLLECTIONS_MENU = [
  { id: 'first-contact', name: 'First Contact', href: '/first-contact', icon: '/custom_logos/collections/collection-first-contact-logo.svg' },
  { id: 'the-human-inside', name: 'The Human Inside', href: '/the-human-inside', icon: '/custom_logos/collections/collection-thin-logo.svg' },
  { id: 'austen', name: 'Austen', href: '/austen', icon: '/custom_logos/collections/collection-jean-austen-logo.svg' },
  { id: 'cube', name: 'Cube', href: '/cube', icon: '/custom_logos/collections/collection-cube-logo.svg' },
  { id: 'miscellania', name: 'Miscel·lània', href: '/miscellania', icon: '/custom_logos/collections/collection-miscellania-logo.svg' },
];

const COLLECTION_NAMES = {
  'first-contact': 'FIRST CONTACT',
  'the-human-inside': 'THE HUMAN INSIDE',
  'austen': 'AUSTEN',
  'cube': 'CUBE',
  'miscellania': 'MISCEL·LÀNIA',
};

const COLLECTIONS = [
  { slug: 'first-contact', title: 'First Contact', subtitle: 'LA CIÈNCIA FICCIÓ QUE MIRA ENDINS', href: '/first-contact' },
  { slug: 'the-human-inside', title: 'THE HUMAN INSIDE', subtitle: 'EN EL TEU RACÓ MÉS PROFUND HI HA UN HEROI', href: '/the-human-inside' },
  { slug: 'austen', title: 'Austen', subtitle: 'DIGUIS EL QUE DIGUIS, FES-HO AMB ELEGÀNCIA', href: '/austen' },
  { slug: 'cube', title: 'Cube', subtitle: 'TOTS SOM ESTRANYS A ULLS NOSTRES', href: '/cube' },
  { slug: 'miscellania', title: 'MISCEL·LÀNIA', subtitle: 'MÉS VAL SOL QUE MAL ACOMPANYAT', href: '/miscellania' },
];

function MobileTdpCard({ Component, slug, index, cardPropsFn, collectionHref, editableIdPrefix }) {
  const [size, setSize] = useState('M');
  return (
    <Component
      editableIdPrefix={editableIdPrefix}
      {...cardPropsFn(slug, index, size)}
      collectionHref={collectionHref}
      selectedSize={size}
      onSizeChange={setSize}
      copyMode={true}
      description=""
      style={{ height: '100%', boxSizing: 'border-box' }}
    />
  );
}

const HERO_OVERLAY_SIZE = {
  'first_contact/nx-01': 7,
  'first_contact/ncc-1701': 7,
  'first_contact/ncc-1701-d': 3.5,
  'first_contact/the-phoenix': 46.585,
  'austen/it-is-a-truth': 12.16,
  'austen/half-agony-half-hope': 4.8,
  'austen/unsociable-and-taciturn': 2.4,
  'austen/i-admire-and-love-you': 12.16,
  'austen/you-have-bewitched-me': 2.4,
  'austen/you-must-allow-me': 12.16,
  'austen/lfmd/blue-solid': 19,
  'austen/lfmd/fuchsia-solid': 19,
  'austen/lfmd/red-solid': 19,
  'austen/lfmd/yellow-solid': 19,
};

function MobileHero() {
  const [heroPlan, setHeroPlan] = useState(() => buildHeroStripePlan());
  const [heroCycle, setHeroCycle] = useState(0);
  const [zoomToggle, setZoomToggle] = useState(false);

  const handleShuffle = () => {
    setHeroPlan(buildHeroStripePlan());
    setHeroCycle((c) => c + 1);
    setZoomToggle((t) => !t);
  };

  const renderBand = (band, idx) => band ? (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        animation: `hg-hero-enter-${idx % 2 === 0 ? 'even' : 'odd'} 0.1s ease-in-out ${idx * 0.0375}s both`,
      }}
    >
      {/* Samarreta */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0, top: 0,
          height: '500%',
          backgroundImage: `url(${band.mockupSrc})`,
          backgroundSize: 'auto 100%',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(-${idx * 20}%)`,
          pointerEvents: 'none',
        }}
      />
      {/* Dibuix */}
      {band.overlaySrc && (
        <div
          style={{
            position: 'absolute',
            left: 0, right: 0, top: 0,
            height: '500%',
            backgroundImage: `url(${band.overlaySrc})`,
            backgroundSize: `auto ${HERO_OVERLAY_SIZE[band.overlayAlt] ?? 30}%`,
            backgroundPosition: 'center 35%',
            backgroundRepeat: 'no-repeat',
            transform: `translateY(-${idx * 20}%)`,
            pointerEvents: 'none',
            opacity: 0.95,
          }}
        />
      )}
      {/* Nom de col·lecció */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)',
          zIndex: 2,
          paddingLeft: '12px',
          color: '#475059',
        }}
      >
        <p style={{
          fontFamily: 'Oswald, sans-serif',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          margin: 0,
          opacity: 0.95,
        }}>
          {(idx === 1 || idx === 2) && band.subName ? `${band.collectionName} / ${band.subName}` : band.collectionName}
        </p>
      </div>
    </div>
  ) : null;

  return (
    <div style={{ paddingLeft: '16px', paddingRight: '16px', paddingBottom: '40px' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflow: 'hidden',
          borderRadius: '12px',
          height: 'min(84vw, 390px)',
          background: '#FFFFFF',
        }}
      >
        {heroPlan.map((s, i) => (
          <Link
            key={`${heroCycle}-${i}`}
            to={((i === 1 || i === 2) && s.productHref) ? s.productHref : s.collectionHref}
            style={{
              flex: '1 1 0',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              background: '#FFFFFF',
              textDecoration: 'none',
            }}
            className="active:opacity-90 transition-opacity"
          >
            {renderBand(s, i)}
          </Link>
        ))}
      </div>

      {/* Botó shuffle sota la hero */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <button
          onClick={handleShuffle}
          aria-label="Barreja samarretes i dibuixos"
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '9999px',
            width: '70px',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            animation: `${zoomToggle ? 'hg-shuffle-zoom-mobile-double' : 'hg-shuffle-zoom-mobile'} 4s ease-in-out infinite`,
          }}
          className="active:scale-95"
        >
          <Shuffle size={35} color="#475059" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export default function HomeMobile() {
  const drawingPlan = useMemo(() => buildHomeDrawingPlan({ perCollection: 2 }), []);

  const cardProps = (slug, index, size) => {
    const item = drawingPlan?.[slug]?.[index];
    if (!item) return {};
    const collectionName = COLLECTION_NAMES[slug] || slug.toUpperCase();
    return {
      productName: item.productName,
      imageSrc: item.mockupSrc,
      imageAlt: `Samarreta ${item.color}`,
      overlaySrc: item.overlaySrc,
      overlayAlt: item.overlayAlt,
      ...(item.hoverImages ? { hoverImages: item.hoverImages } : {}),
      ...(item.productHref ? { productHref: item.productHref } : {}),
      ...(item.overlayScale != null ? { overlayScale: item.overlayScale } : {}),
      ...(item.overlayTranslateY != null ? { overlayTranslateY: item.overlayTranslateY } : {}),
      onAddToCart: () => {
        try {
          const href = item.productHref || '';
          const productRoute = href.split('?')[0].split('/')[2] || '';
          window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
            detail: {
              source: 'home-tdp-cta',
              firstPartOnly: true,
              item: {
                title: item.productName.toUpperCase(),
                collection: collectionName,
                collectionSlug: slug,
                productRoute,
                qty: 1,
                size: size,
                price: '15,50€',
                color: item.color,
                drawing: '',
                disabled: false,
              },
            },
          }));
        } catch {
          // ignore
        }
      },
    };
  };

  // Cada targeta TDP té una alçada fixa per mòbil
  const CARD_HEIGHT = 520;
  const CARD_GAP = '12px';

  return (
    <div
      className="bg-background text-foreground"
      style={{
        '--hg-tdp-xL': '16px',
        '--hg-tdp-xR': 'calc(100vw - 16px)',
      }}
    >
      {/* Icones de col·leccions en una fila */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '15.75px',
        paddingTop: '60px',
        paddingBottom: '40px',
      }}>
        {COLLECTIONS_MENU.map((c) => {
          const isFirstContact = c.id === 'first-contact';
          return (
            <Link
              key={c.id}
              to={c.href}
              title={c.name}
              aria-label={c.name}
              className="hover:opacity-100 active:scale-95"
              style={{
                display: 'inline-flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                minWidth: '44px',
                minHeight: '44px',
                transition: 'transform 0.15s ease, opacity 0.15s ease',
              }}
            >
              <img
                src={c.icon}
                alt={c.name}
                style={{
                  width: isFirstContact ? '49.5px' : 'auto',
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

      <MobileHero />

      {/* Col·leccions amb 2 columnes de TDP */}
      {COLLECTIONS.map((col, colIdx) => (
        <div key={col.slug} style={{ paddingBottom: '40px' }}>
          {/* Títol de col·lecció */}
          <div style={{
            textAlign: 'center',
            paddingTop: colIdx === 0 ? '20px' : '40px',
            paddingBottom: '24px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}>
            <Link to={col.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h2 style={{
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 300,
                fontSize: '28px',
                lineHeight: 0.9,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: '#0b0d10',
                margin: 0,
              }}>
                {col.title}
              </h2>
            </Link>
            <p style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '10px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(71,80,89,0.7)',
              margin: '8px 0 0 0',
            }}>
              {col.subtitle}
            </p>
          </div>

          {/* Graella 2 columnes */}
          <div style={{
            paddingLeft: '16px',
            paddingRight: '16px',
            position: 'relative',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(2, minmax(0, 1fr))`,
              columnGap: CARD_GAP,
              height: `${CARD_HEIGHT}px`,
            }}>
              <MobileTdpCard
                Component={TDP1}
                slug={col.slug}
                index={0}
                cardPropsFn={cardProps}
                collectionHref={col.href}
                editableIdPrefix={`home-mobile-${colIdx}-tdp-1`}
              />
              <MobileTdpCard
                Component={TDP1}
                slug={col.slug}
                index={1}
                cardPropsFn={cardProps}
                collectionHref={col.href}
                editableIdPrefix={`home-mobile-${colIdx}-tdp-2`}
              />
            </div>

            {/* Pill "SI EN VOLS SABER +" */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: `${20 - (CARD_HEIGHT / 24) * 9}px`,
            }}>
              <Link
                to={col.href}
                style={{
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 200ms ease',
                }}
                className="hover:shadow-md hover:border-neutral-400 active:scale-95 group"
                title="Veure tota la col·lecció"
              >
                <span style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 300,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#475059',
                  lineHeight: 1,
                }}
                  className="group-hover:text-neutral-900"
                >
                  <span style={{ display: 'inline-block', transform: 'translateY(2px)' }}>SI EN VOLS SABER</span>{' '}
                  <span style={{ display: 'inline-block', fontSize: '20px', fontWeight: 100, lineHeight: 1, verticalAlign: 'middle' }}>+</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* StoryPosterLink al final */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '40px',
        paddingBottom: '120px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        <StoryPosterLink style={{ fontSize: '32pt' }} />
      </div>

      <MobileFooter />
    </div>
  );
}
