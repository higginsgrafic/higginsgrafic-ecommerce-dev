import React, { useMemo, useState } from 'react';

import AdidasInspiredHeader from '@/components/AdidasInspiredHeader';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export default function AdidasPdpV2Page() {
  const [cartItems, setCartItems] = useState([]);

  const stripeItemLeftOffsetPxByIndex = useMemo(
    () => ({
      13: -12,
    }),
    []
  );

  const product = useMemo(
    () => ({
      id: 'demo-adidas-pdp-v2',
      slug: 'iron-kong-v2',
      name: 'IRON KONG',
      description:
        'PDP demo (v2). Objectiu: reciclar la targeta de producte (TDP) i provar una composició menys densa amb 2 columnes.',
      price: 19.99,
      image:
        '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png',
      images: [
        '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png',
      ],
      variants: [
        { id: 'v-xs', size: 'XS' },
        { id: 'v-s', size: 'S' },
        { id: 'v-m', size: 'M' },
        { id: 'v-l', size: 'L' },
        { id: 'v-xl', size: 'XL' },
      ],
    }),
    []
  );

  const onAddToCart = (p, _size, qty) => {
    const id = p?.id;
    if (!id) return;

    const delta = Math.max(1, Number(qty) || 1);

    setCartItems((items) => {
      const next = Array.isArray(items) ? [...items] : [];
      const idx = next.findIndex((it) => it?.id === id);
      if (idx === -1) {
        next.push({ id, quantity: delta });
        return next;
      }
      next[idx] = { ...next[idx], quantity: (next[idx]?.quantity || 0) + delta };
      return next;
    });
  };

  const cartItemCount = useMemo(() => {
    return (cartItems || []).reduce((sum, item) => sum + (item?.quantity || 0), 0);
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-white" data-page="adidas-pdp-v2">
      <AdidasInspiredHeader
        cartItemCount={cartItemCount}
        forceStripeDebugHit={false}
        ignoreStripeDebugFromUrl
        stripeItemLeftOffsetPxByIndex={stripeItemLeftOffsetPxByIndex}
        redistributeStripeBetweenFirstAndLast
      />

      <main className="pt-[calc(var(--appHeaderOffset,0px)+64px)] lg:pt-[calc(var(--appHeaderOffset,0px)+80px)]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="min-w-0">
              <ProductCard product={product} onAddToCart={onAddToCart} cartItems={cartItems} variant="expanded" />
            </div>

            <div className="min-w-0">
              <div className="w-full bg-black/[0.04]">
                <div className="aspect-square w-full">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div data-section="footer">
          <Footer />
        </div>
      </main>
    </div>
  );
}
