import React, { useState, useEffect } from 'react';
import { useGridDebug } from '@/contexts/GridDebugContext';
import { useProductContext } from '@/contexts/ProductContext';
import { supabase } from '@/api/supabase-products';
import ProductGrid from '@/components/ProductGrid';

function DockSection({ collectionSlug, onAddToCart, cartItems, onUpdateQuantity }) {
  const { getRandomProductsByCollection, getProductsByCollection } = useProductContext();
  const { getDebugStyle, isSectionEnabled } = useGridDebug();
  const [collection, setCollection] = useState(null);

  const isFirstContact = (collectionSlug || '').toString().trim().toLowerCase() === 'first-contact';
  const c2Slugs = [
    'first-contact-nx-01',
    'first-contact-ncc-1701',
    'first-contact-ncc-1701-d',
    'first-contact-wormhole',
    'first-contact-plasma-escape',
    'first-contact-vulcans-end',
    'first-contact-the-phoenix'
  ];

  const products = (() => {
    if (!isFirstContact) return getRandomProductsByCollection(collectionSlug, 4);
    const all = getProductsByCollection('first-contact');
    const bySlug = new Map(
      (Array.isArray(all) ? all : [])
        .filter(Boolean)
        .map((p) => [(p?.slug || '').toString().trim(), p])
    );
    const ordered = c2Slugs.map((s) => bySlug.get(s)).filter(Boolean);
    return ordered.slice(0, 4);
  })();
  const safeProducts = Array.isArray(products)
    ? products
        .filter(Boolean)
        .filter(p => p?.id || p?.slug || p?.gelatoProductId)
    : [];

  useEffect(() => {
    const loadCollection = async () => {
      try {
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .eq('slug', collectionSlug)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        setCollection(data);
      } catch (error) {
        console.error('Error loading collection:', error);
      }
    };

    if (collectionSlug) {
      loadCollection();
    }
  }, [collectionSlug]);

  if (!safeProducts || safeProducts.length === 0 || !collection) {
    return null;
  }

  return (
    <ProductGrid
      title={collection.name ? collection.name.toUpperCase() : ''}
      description={collection.description}
      products={safeProducts}
      onAddToCart={onAddToCart}
      cartItems={cartItems}
      onUpdateQuantity={onUpdateQuantity}
      collectionPath={collection.path}
    />
  );
}

export default DockSection;
