import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TDP1 from '@/components/tdp/TDP1';
import TDP2 from '@/components/tdp/TDP2';
import StoryPosterLink from '@/components/StoryPosterLink';
import { buildHomeDrawingPlan } from '@/components/home/homeDrawings';

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
      style={{ height: '100%', boxSizing: 'border-box' }}
      descriptionLineHeight={1.2}
    />
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
      {/* Logo centrat */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '100px',
        paddingBottom: '24px',
      }}>
        <img
          src="/custom_logos/brand/HIGGINS GRAFIC NEGRE.png"
          alt="HIGGINS GRÀFIC"
          style={{ width: '60%', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Icones de col·leccions en una fila */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '28px',
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
              className="opacity-40 hover:opacity-100 active:scale-95"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
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
                  width: isFirstContact ? '36px' : 'auto',
                  height: isFirstContact ? 'auto' : '40px',
                  objectFit: 'contain',
                  display: 'block',
                  filter: 'brightness(0)',
                }}
              />
            </Link>
          );
        })}
      </div>

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
                Component={colIdx % 2 === 0 ? TDP2 : TDP1}
                slug={col.slug}
                index={0}
                cardPropsFn={cardProps}
                collectionHref={col.href}
                editableIdPrefix={`home-mobile-${colIdx}-tdp-1`}
              />
              <MobileTdpCard
                Component={colIdx % 2 === 0 ? TDP1 : TDP2}
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
              marginTop: '20px',
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
    </div>
  );
}
