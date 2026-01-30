import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CartIcon from './ui/CartIcon';
import SizeButtonGroup from './ui/SizeButtonGroup';
import SizeButton from './ui/SizeButton';
import { useGridDebug } from '@/contexts/GridDebugContext';
import { formatPrice } from '@/utils/formatters';

function ProductCard({ product, onAddToCart, cartItems = [], variant = 'default' }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const { getDebugStyle, isSectionEnabled } = useGridDebug();
  if (!product) return null;

  const priceLabel = (() => {
    const price = product?.price;
    const formatted = formatPrice(price);
    if (formatted !== '—') return formatted;
    if (typeof price === 'string') return price.trim() ? price : '—';
    return formatted;
  })();

  const productId = product?.id;
  const productSlugOrId = product?.slug || productId || product?.gelatoProductId;
  const productUrl = productSlugOrId ? `/product/${productSlugOrId}` : '/';
  const productName = product?.name || 'Producte';

  const descriptionText = typeof product?.description === 'string'
    ? product.description.replace(/<[^>]*>/g, '').trim()
    : '';

  const variantImage = product?.variants?.find(v => v?.image)?.image;
  const cardImage = product.image || product.images?.[0] || variantImage || '/placeholder-product.svg';

  const availableSizes = (() => {
    const canonicalOrder = ['S', 'M', 'L', 'XL'];

    const sortSizes = (sizes) => {
      const uniq = [...new Set((sizes || []).filter(Boolean))];
      return uniq.sort((a, b) => {
        const aa = (a || '').toString().toUpperCase().trim();
        const bb = (b || '').toString().toUpperCase().trim();

        const ia = canonicalOrder.indexOf(aa);
        const ib = canonicalOrder.indexOf(bb);
        const ra = ia === -1 ? 999 : ia;
        const rb = ib === -1 ? 999 : ib;
        if (ra !== rb) return ra - rb;

        if (aa === 'UNI' && bb !== 'UNI') return 1;
        if (bb === 'UNI' && aa !== 'UNI') return -1;
        return aa.localeCompare(bb);
      });
    };

    const sizes = (product?.variants || [])
      .map(v => v?.size)
      .filter(Boolean);

    const ordered = sortSizes(sizes);
    return ordered.length > 0 ? ordered : canonicalOrder;
  })();

  const showSizeButtons = availableSizes.length > 1 || (availableSizes[0] && availableSizes[0] !== 'UNI');

  // Calcular quantitat total d'aquest producte al cistell
  const productQuantityInCart = cartItems
    .filter(item => item.id === productId)
    .reduce((total, item) => total + item.quantity, 0);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, selectedSize, 1);
    }
  };

  // Estils segons variant
  const variantStyles = {
    default: {
      padding: 'clamp(0.75rem, 2vw, 1rem)',
      cardShadow: '4px 4px 12px rgba(0, 0, 0, 0.12)',
      imageShadow: '4px 4px 8px rgba(0, 0, 0, 0.1)',
      titleSize: 'clamp(1.125rem, 2.4vw, 1.5rem)',
      descSize: 'clamp(1rem, 2vw, 1.25rem)',
      gap: 'clamp(0.75rem, 1.6vw, 1rem)',
      marginBottom: 'clamp(1rem, 2.4vw, 1.5rem)',
      showDescription: true,
      showSizes: true
    },
    compact: {
      padding: 'clamp(0.5rem, 2vw, 0.75rem)',
      cardShadow: '3px 3px 8px rgba(0, 0, 0, 0.1)',
      imageShadow: '2px 2px 6px rgba(0, 0, 0, 0.08)',
      titleSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
      descSize: 'clamp(0.75rem, 2vw, 1rem)',
      gap: 'clamp(0.5rem, 1.5vw, 0.75rem)',
      marginBottom: 'clamp(0.75rem, 2.5vw, 1rem)',
      showDescription: false,
      showSizes: false
    },
    expanded: {
      padding: 'clamp(1rem, 3vw, 1.5rem)',
      cardShadow: '6px 6px 16px rgba(0, 0, 0, 0.15)',
      imageShadow: '5px 5px 12px rgba(0, 0, 0, 0.12)',
      titleSize: 'clamp(1.25rem, 4vw, 1.875rem)',
      descSize: 'clamp(1.125rem, 3vw, 1.5rem)',
      gap: 'clamp(1rem, 3vw, 1.5rem)',
      marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
      showDescription: true,
      showSizes: true
    },
    featured: {
      padding: 'clamp(1rem, 3vw, 1.5rem)',
      cardShadow: '8px 8px 24px rgba(0, 0, 0, 0.18)',
      imageShadow: '6px 6px 16px rgba(0, 0, 0, 0.15)',
      titleSize: 'clamp(1.25rem, 4vw, 1.875rem)',
      descSize: 'clamp(1.125rem, 3vw, 1.5rem)',
      gap: 'clamp(1.25rem, 3.5vw, 1.5rem)',
      marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
      showDescription: true,
      showSizes: true,
      gradient: true
    }
  };

  const styles = variantStyles[variant] || variantStyles.default;

  // Variant horizontal - layout diferent
  if (variant === 'horizontal') {
    return (
      <div
        className="flex flex-row w-full p-3 rounded-sm transition-all duration-300 gap-4 bg-background"
      >
        <Link to={productUrl} aria-label={productName} className="absolute inset-0 z-10" />
        {/* Imatge petita a l'esquerra */}
        <Link to={productUrl} className="relative z-20 flex-shrink-0">
          <div
            className="w-20 h-20 md:w-24 md:h-24 bg-background overflow-hidden rounded-sm"
            style={{
              boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.08)'
            }}
          >
            <img
              src={cardImage}
              alt={productName}
              className="w-full h-full object-contain transition-transform hover:scale-105 duration-300"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Link>

        {/* Contingut a la dreta */}
        <div className="relative z-20 flex-1 flex flex-col justify-between gap-2">
          {/* Títol centrat */}
          <div className="text-center">
            <Link to={productUrl} className="block">
              <h3 className="font-oswald font-medium uppercase hover:opacity-70 transition-opacity text-foreground leading-tight tracking-tight text-base md:text-lg">
                {productName}
              </h3>
            </Link>
          </div>

          {/* Preu, talles i cistell en línia */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div style={{ marginLeft: '-20px' }}>
              <span className="font-oswald font-medium text-foreground" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.40625rem)', whiteSpace: 'nowrap' }}>
                {priceLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 max-w-[180px]">
                <SizeButtonGroup
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  sizes={['S', 'M', 'L', 'XL']}
                />
              </div>
              <CartIcon count={productQuantityInCart} onClick={handleAddToCart} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variants vertical (default, compact, expanded, featured)
  return (
    <div
      className="flex flex-col w-full rounded-sm transition-all duration-300 relative bg-background"
      style={{ padding: styles.padding }}
    >
      <Link to={productUrl} aria-label={productName} className="absolute inset-0 z-10" />
      {/* Imatge amb ombra a 45º només en hover */}
      <Link to={productUrl} className="relative z-20 block group" style={{ marginBottom: styles.marginBottom }}>
        <div
          className="aspect-square bg-background overflow-hidden rounded-sm transition-shadow duration-300"
          style={{
            boxShadow: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = styles.imageShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <img
            src={cardImage}
            alt={productName}
            className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-300"
            loading="lazy"
            decoding="async"
          />
        </div>
      </Link>

      {/* Contingut */}
      <div className="relative z-20 flex flex-col text-center" style={{ gap: styles.gap }}>
        {/* Nom del producte - OSWALD Responsive CENTRAT - 1 LÍNIA FIXA */}
        <Link to={productUrl} className="block">
          <h3
            className="font-oswald font-medium uppercase hover:opacity-70 transition-opacity text-foreground leading-tight tracking-tight"
            style={{
              fontSize: styles.titleSize,
              transform: 'translateY(-10px)',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* GRID: Cistell + Botons (estructura simple i ajustable) */}
        {styles.showSizes && showSizeButtons ? (
          <div
            className="grid grid-rows-2"
            style={{
              gap: 'clamp(0.25rem, 0.8vw, 0.5rem)',
              marginLeft: 'calc(-1 * clamp(0.75rem, 2vw, 1rem))',
              marginRight: 'calc(-1 * clamp(0.75rem, 2vw, 1rem))',
              ...(isSectionEnabled('productCard') ? getDebugStyle('productCard', 'main') : {})
            }}
          >
            {/* FILA 1: Preu i Cistell - Grid 3 columnes */}
            <div
              className="grid items-center"
              style={{
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 'clamp(0.25rem, 0.8vw, 0.5rem)',
                ...(isSectionEnabled('productCard') ? getDebugStyle('productCard', 'row1') : {})
              }}
            >
              <div className="flex justify-center" style={{ marginLeft: '-5px' }}>
                <span className="font-oswald font-medium text-foreground" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.40625rem)', whiteSpace: 'nowrap' }}>
                  {priceLabel}
                </span>
              </div>
              <div></div>
              <div className="flex justify-center" style={{ marginLeft: '21px', transform: 'translateY(-2px)' }}>
                <CartIcon count={productQuantityInCart} onClick={handleAddToCart} />
              </div>
            </div>

            {/* FILA 2: Grid de botons de talla */}
            <div
              className="grid grid-cols-4"
              style={{
                gap: 'clamp(0.25rem, 0.8vw, 0.5rem)',
                ...(isSectionEnabled('productCard') ? getDebugStyle('productCard', 'row2') : {})
              }}
            >
              {availableSizes.slice(0, 4).map((size) => (
                <SizeButton
                  key={size}
                  size={size}
                  selected={selectedSize === size}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-oswald font-medium text-foreground" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.40625rem)', whiteSpace: 'nowrap' }}>
              {priceLabel}
            </span>
            <CartIcon count={productQuantityInCart} onClick={handleAddToCart} />
          </div>
        )}

        {/* Descripció del producte - ROBOTO LIGHT - 3 LÍNIES FIXES - ALINEADA A L'ESQUERRA */}
        {styles.showDescription && (
          <div style={{ minHeight: 'clamp(4.5rem, 9vw, 5.25rem)' }}>
            <p
              className="font-roboto font-light text-muted-foreground leading-snug text-left"
              style={{
                fontSize: styles.descSize,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {descriptionText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
