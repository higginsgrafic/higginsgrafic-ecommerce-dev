import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { collectionGridImageFor, gridFinishFor } from '@/lib/pdpMockup';
import MobileFooter from '@/components/MobileFooter';

const COLLECTIONS_MENU = [
  ['first-contact', 'First Contact', '/custom_logos/collections/collection-first-contact-logo.svg'],
  ['the-human-inside', 'The Human Inside', '/custom_logos/collections/collection-thin-logo.svg'],
  ['austen', 'Austen', '/custom_logos/collections/collection-jean-austen-logo.svg'],
  ['cube', 'Cube', '/custom_logos/collections/collection-cube-logo.svg'],
  ['miscellania', 'Miscel·lània', '/custom_logos/collections/collection-miscellania-logo.svg'],
];

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function MobileProductCard({ product, colors, index, collectionSlug }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const { cartItems, addToCart } = useCart();
  // Cada targeta té la seva pròpia seqüència barrejada i el seu propi ritme.
  const sequence = useMemo(() => shuffle(colors), [colors]);
  const [colorIndex, setColorIndex] = useState(() => Math.floor(Math.random() * colors.length));
  const intervalRef = useRef(null);

  useEffect(() => {
    // Retard inicial aleatori perquè no canviïn totes alhora.
    const startDelay = Math.random() * 2000;
    const startTimer = window.setTimeout(() => {
      // Període aleatori entre 1700 i 2300 ms per targeta.
      const period = 1700 + Math.random() * 600;
      intervalRef.current = window.setInterval(() => {
        setColorIndex((i) => (i + 1) % sequence.length);
      }, period);
    }, startDelay);
    return () => {
      window.clearTimeout(startTimer);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [sequence.length]);

  const color = sequence[colorIndex % sequence.length];
  const imageCollection = product.collection || collectionSlug;
  const imageSrc = collectionGridImageFor(imageCollection, product.route, color, index);
  const finish = gridFinishFor(imageCollection, color, index);
  const href = `/${collectionSlug}/${product.route}?color=${color}&finish=${finish}`;
  const cartCount = cartItems
    .filter((item) => item.productRoute === product.route)
    .reduce((total, item) => total + item.quantity, 0);
  const cartIcon = cartCount >= 2
    ? '/custom_logos/icons/v3-ple-2.svg'
    : cartCount === 1
      ? '/custom_logos/icons/v3-ple-1.svg'
      : '/custom_logos/icons/v3-buit.svg';

  const handleAddToCart = () => addToCart({
    id: `${collectionSlug}-${product.route}-${color}`,
    name: product.name,
    productRoute: product.route,
    collection: collectionSlug,
    color,
    finish,
    image: imageSrc,
    price: 15.5,
  }, selectedSize, 1);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: 'inherit',
      backgroundColor: '#fbfcfd',
      borderRadius: '4px',
      padding: '12px',
    }}>
      <Link to={href} style={{ display: 'block', width: '100%', textDecoration: 'none', color: 'inherit' }}>
        <img
          src={imageSrc}
          alt={`Samarreta ${color}`}
          style={{ width: '100%', maxWidth: '280px', height: 'auto', objectFit: 'contain', marginBottom: '12px' }}
        />
        <h3 style={{
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 300,
          fontSize: '18px',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          color: '#0b0d10',
          margin: '0 0 8px 0',
          textAlign: 'center',
        }}>
          {product.name}
        </h3>
      </Link>

      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '2px', marginTop: 'auto' }}>
        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setSelectedSize(size)}
            style={{
              minWidth: 0,
              height: '28px',
              padding: 0,
              border: 0,
              borderRadius: '3px',
              color: selectedSize === size ? '#fff' : '#475059',
              background: selectedSize === size ? '#475059' : '#eef0f2',
              fontFamily: 'Oswald, sans-serif',
              fontSize: size === 'XXL' ? '8px' : '10px',
              cursor: 'pointer',
            }}
          >
            {size}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '10px' }}>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 200, fontSize: '20px', color: '#475059', lineHeight: 1, display: 'inline-flex', alignItems: 'center', transform: 'translateY(3px)' }}>15,50€</span>
        <button type="button" onClick={handleAddToCart} aria-label="Afegeix al cistell" style={{ width: '30px', height: '30px', padding: 0, border: 0, background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={cartIcon} alt="" aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
        </button>
      </div>
    </div>
  );
}

export default function CollectionMobile({
  collectionSlug,
  collectionTitle,
  collectionIcon,
  products,
  colors,
  posterLines,
}) {
  const flatColors = useMemo(() => [...new Set(colors.flat())], [colors]);

  return (
    <div
      className="bg-background"
      style={{
        '--hg-tdp-xL': '16px',
        '--hg-tdp-xR': 'calc(100vw - 16px)',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '15.75px',
        padding: '60px 16px 40px',
      }}>
        {COLLECTIONS_MENU.map(([slug, name, icon]) => (
          <Link
            key={slug}
            to={`/${slug}`}
            title={name}
            aria-label={name}
            style={{ display: 'inline-flex', alignItems: 'flex-start', justifyContent: 'center', minWidth: '44px', minHeight: '44px' }}
          >
            <img
              src={icon}
              alt={name}
              style={{
                width: slug === 'first-contact' ? '49.5px' : 'auto',
                height: slug === 'first-contact' ? 'auto' : '55px',
                objectFit: 'contain',
                display: 'block',
                filter: 'brightness(0)',
              }}
            />
          </Link>
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '0.35em',
        paddingBottom: '48px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        {collectionIcon && (
          <img
            src={collectionIcon}
            alt=""
            style={{ width: '28px', height: 'auto', objectFit: 'contain' }}
          />
        )}
        <h1 style={{
          margin: 0,
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 300,
          fontSize: '32px',
          letterSpacing: '0.02em',
          lineHeight: 0.9,
          color: '#0b0d10',
          textTransform: 'uppercase',
        }}>
          {collectionTitle}
        </h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '12px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        {products.map((product, index) => (
          <MobileProductCard
            key={`${product.route}-${index}`}
            product={product}
            colors={flatColors}
            index={index}
            collectionSlug={collectionSlug}
          />
        ))}
        {products.length % 2 === 1 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fbfcfd',
            borderRadius: '4px',
            padding: '12px',
          }}>
            <img
              src="/custom_logos/brand/grup-higgins-logo-2.svg"
              alt="Higgins Gràfic"
              style={{ width: '80%', maxWidth: '220px', height: 'auto', objectFit: 'contain', opacity: 0.85 }}
            />
          </div>
        )}
      </div>

      {posterLines?.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '140px 16px 160px',
        }}>
          <div style={{
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 300,
            fontSize: '32pt',
            lineHeight: 1.1,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#111827',
            textAlign: 'center',
          }}>
            {posterLines.map((line, index) => <div key={index}>{line.text}</div>)}
          </div>
        </div>
      )}

      <MobileFooter />
    </div>
  );
}