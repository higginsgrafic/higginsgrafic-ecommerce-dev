import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { typography, getTypographyClasses } from '@/config/typography';
import { useGridDebug } from '@/contexts/GridDebugContext';

const useResponsiveFontSize = (config) => {
  const [fontSize, setFontSize] = useState(config.fontSize?.mobile || config.fontSize?.base || '14px');

  useEffect(() => {
    const updateFontSize = () => {
      const width = window.innerWidth;
      if (width >= 1024 && config.fontSize?.desktop) {
        setFontSize(config.fontSize.desktop);
      } else {
        // Manté la mida mobile fins a 1024px per evitar salts
        setFontSize(config.fontSize?.mobile || config.fontSize?.base || '14px');
      }
    };

    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, [config]);

  return fontSize;
};

function ProductGrid({
  title,
  description,
  products,
  onAddToCart,
  cartItems,
  onUpdateQuantity,
  collectionPath,
  backgroundColor
}) {
  const { getDebugStyle, isSectionEnabled } = useGridDebug();
  const gridTitleFontSize = useResponsiveFontSize(typography.productGrid.title);
  const gridDescriptionFontSize = useResponsiveFontSize(typography.productGrid.description);
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const safeProducts = Array.isArray(products)
    ? products
        .filter(Boolean)
        .filter(p => p?.id || p?.slug || p?.gelatoProductId)
    : [];

  const displayProducts = useMemo(() => {
    const outcasted = safeProducts.filter((p) => (p?.collection || '').toString().toLowerCase() === 'outcasted');
    if (outcasted.length === 0) return safeProducts;

    const normalize = (v) => (v || '').toString().trim().toLowerCase();
    const inferOutcastedColorFromImageUrl = (url) => {
      const key = normalize(url);
      if (!key) return null;

      const tokens = [
        'militar', 'military', 'army', 'olive', 'khaki',
        'negre', 'black', 'negro',
        'blanc', 'white', 'blanco',
        'vermell', 'red', 'rojo',
        'blau', 'blue', 'azul', 'navy',
        'verd', 'green', 'forest', 'royal'
      ];

      let lastHit = null;
      let lastIndex = -1;
      for (const t of tokens) {
        const idx = key.lastIndexOf(t);
        if (idx > lastIndex) {
          lastIndex = idx;
          lastHit = t;
        }
      }
      if (!lastHit) return null;

      if (['militar', 'military', 'army', 'olive', 'khaki', 'verd', 'green', 'forest'].includes(lastHit)) return 'militar';
      if (['negre', 'black', 'negro'].includes(lastHit)) return 'black';
      if (['blanc', 'white', 'blanco'].includes(lastHit)) return 'white';
      if (['vermell', 'red', 'rojo'].includes(lastHit)) return 'red';
      if (['blau', 'blue', 'azul', 'navy', 'royal'].includes(lastHit)) return 'blue';
      return null;
    };

    const mulberry32 = (a) => {
      return () => {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };

    const getSeed = () => {
      try {
        const key = 'outcastedGridSeed';
        const existing = window.sessionStorage.getItem(key);
        if (existing) return Number(existing) || 1;
        const next = Math.floor(Math.random() * 2147483647) + 1;
        window.sessionStorage.setItem(key, String(next));
        return next;
      } catch {
        return 1;
      }
    };

    const rng = mulberry32(getSeed());
    const randPick = (arr) => {
      const a = Array.isArray(arr) ? arr : [];
      if (a.length === 0) return null;
      const idx = Math.floor(rng() * a.length);
      return a[idx] || a[0] || null;
    };

    const usedColors = new Set();
    const mapped = safeProducts.map((p) => {
      if ((p?.collection || '').toString().toLowerCase() !== 'outcasted') return p;

      const imgs = (Array.isArray(p?.images) ? p.images : []).filter((u) => typeof u === 'string' && u.length > 0);
      if (imgs.length === 0) return p;

      const byColor = new Map();
      for (const u of imgs) {
        const c = inferOutcastedColorFromImageUrl(u) || 'other';
        const list = byColor.get(c) || [];
        list.push(u);
        byColor.set(c, list);
      }

      const availableColors = Array.from(byColor.keys());
      const unusedColors = availableColors.filter((c) => !usedColors.has(c));
      const chosenColor = randPick(unusedColors.length > 0 ? unusedColors : availableColors) || availableColors[0];
      usedColors.add(chosenColor);

      const chosenImage = randPick(byColor.get(chosenColor)) || imgs[0];
      return {
        ...p,
        image: chosenImage
      };
    });

    return mapped;
  }, [safeProducts]);

  return (
    <section
      style={isSectionEnabled('layout') ? getDebugStyle('layout', 'main') : {}}
    >
      {/* Fons blanc que inclou títol, descripció i productes */}
      <div className="bg-background w-full">
        {/* Títol i descripció dins del fons gris - padding 75% del desktop */}
        <div className="max-w-7xl mx-auto px-3 lg:px-8 pt-16 lg:pt-20">
          <div className="text-center mb-9 lg:mb-12 px-1 lg:px-4">
            {collectionPath ? (
              <Link to={collectionPath} className="inline-block group">
                <h2 className={`${getTypographyClasses(typography.productGrid.title)} mb-2 sm:mb-2 md:mb-2 lg:mb-4 uppercase group-hover:opacity-80 transition-opacity text-foreground`} style={{ fontSize: gridTitleFontSize }}>
                  {title}
                </h2>
              </Link>
            ) : (
              <h2 className={`${getTypographyClasses(typography.productGrid.title)} mb-2 sm:mb-2 md:mb-2 lg:mb-4 uppercase text-foreground`} style={{ fontSize: gridTitleFontSize }}>
                {title}
              </h2>
            )}
            {/*
               Description adjustments:
               1. Single line, no wrap - FORCED
               2. Responsive sizes
               3. Centered
            */}
            <div className="w-full px-4">
              <p className={`${getTypographyClasses(typography.productGrid.description)} text-center overflow-hidden text-muted-foreground`} style={{
                opacity: 0.7,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'block',
                width: '100%',
                fontSize: gridDescriptionFontSize
              }}>
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Grid de productes - Responsive millorat amb més breakpoints */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-16 lg:pb-20">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 lg:gap-x-6 lg:gap-y-10"
          >
            {displayProducts.map((product, index) => (
              <motion.div key={product.id || product.slug || String(product.gelatoProductId)} variants={item} className="h-full">
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  cartItems={cartItems}
                  onUpdateQuantity={onUpdateQuantity}
                  listName={title}
                  position={index}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
export default ProductGrid;
