import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collectionGridImageFor, gridFinishFor, collectionGridHoverVariantsFor } from '@/lib/pdpMockup';
import { buildOtherCollectionsImages } from '@/components/home/homeDrawings';
import StoryPosterLink from '@/components/StoryPosterLink';

const TDP_DESCRIPTION = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna";

function MobileProductCard({ product, color, index, collectionSlug, collectionName }) {
  const imageSrc = collectionGridImageFor(collectionSlug, product.route, color, index);
  const finish = gridFinishFor(collectionSlug, color, index);
  const hoverImages = collectionGridHoverVariantsFor(collectionSlug, product.route, color, index);
  const href = `/${collectionSlug}/${product.route}?color=${color}&finish=${finish}`;

  return (
    <Link
      to={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: '#fbfcfd',
        borderRadius: '4px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      <img
        src={imageSrc}
        alt={`Samarreta ${color}`}
        style={{
          width: '100%',
          maxWidth: '280px',
          height: 'auto',
          objectFit: 'contain',
          marginBottom: '12px',
        }}
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
      <p style={{
        fontFamily: 'Roboto, sans-serif',
        fontSize: '13px',
        lineHeight: 1.4,
        color: 'rgba(71,80,89,0.7)',
        margin: '0 0 10px 0',
        textAlign: 'center',
        paddingLeft: '12px',
        paddingRight: '12px',
      }}>
        {TDP_DESCRIPTION}
      </p>
      <span style={{
        fontFamily: 'Oswald, sans-serif',
        fontWeight: 200,
        fontSize: '20px',
        color: '#475059',
      }}>
        15,50€
      </span>
    </Link>
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
  const otherImages = useMemo(
    () => buildOtherCollectionsImages(collectionSlug),
    [collectionSlug]
  );

  // Aplaana els colors en una sola llista
  const flatColors = colors.flat();
  const collectionName = collectionTitle.toUpperCase();

  return (
    <div
      className="bg-background"
      style={{
        '--hg-tdp-xL': '16px',
        '--hg-tdp-xR': 'calc(100vw - 16px)',
        paddingTop: '90px',
      }}
    >
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
        <span>{collectionTitle}</span>
      </div>

      {/* Títol de col·lecció */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.35em',
        paddingBottom: '48px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        {collectionIcon && (
          <img
            src={collectionIcon}
            alt=""
            style={{
              width: '28px',
              height: 'auto',
              objectFit: 'contain',
            }}
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

      {/* Llista de productes en 1 columna */}
      <div style={{
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        {products.map((product, idx) => (
          <MobileProductCard
            key={`${product.route}-${idx}`}
            product={product}
            color={flatColors[idx % flatColors.length]}
            index={idx}
            collectionSlug={collectionSlug}
            collectionName={collectionName}
          />
        ))}
      </div>

      {/* StoryPosterLink al final */}
      {posterLines && posterLines.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '40px',
          paddingBottom: '60px',
          paddingLeft: '16px',
          paddingRight: '16px',
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
            {posterLines.map((line, idx) => (
              <div key={idx}>{line.text}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
