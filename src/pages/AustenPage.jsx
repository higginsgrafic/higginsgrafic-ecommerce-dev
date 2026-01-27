import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ProductGrid from '@/components/ProductGrid';
import { useProductContext } from '@/contexts/ProductContext';
import { useTexts } from '@/hooks/useTexts';
import Breadcrumbs from '@/components/Breadcrumbs';

function AustenPage({ onAddToCart, cartItems, onUpdateQuantity }) {
  const texts = useTexts();
  const { getRandomProductsByCollection } = useProductContext();
  const collectionProducts = getRandomProductsByCollection('austen', 4);

  return (
    <>
      <Helmet>
        <title>{texts.collections.austen.seo.title}</title>
        <meta name="description" content={texts.collections.austen.seo.description} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-br from-emerald-800 via-green-900 to-teal-900 text-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="mb-8">
              <Breadcrumbs
                items={[
                  { label: 'Austen' }
                ]}
                lightMode={true}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="font-oswald text-5xl lg:text-7xl font-bold uppercase mb-6">
                {texts.collections.austen.title}
              </h1>
              <p className="font-roboto text-lg lg:text-xl text-gray-200 italic">
                {texts.collections.austen.description}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose max-w-none mb-16"
          >
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="font-oswald text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#141414' }}>
                  La Col·lecció
                </h2>
                <p className="font-roboto text-base text-gray-700 leading-relaxed">
                  Austen és una declaració de força, intel·ligència i autonomia. Inspirada en l'esperit
                  rebel de Jane Austen i les seves protagonistes que desafiaven les convencions socials,
                  aquesta col·lecció celebra la veu femenina i la seva lluita per la igualtat i el reconeixement.
                </p>
              </div>
              <div>
                <h3 className="font-oswald text-2xl font-bold mb-4" style={{ color: '#141414' }}>
                  Inspiració
                </h3>
                <p className="font-roboto text-base text-gray-700 leading-relaxed">
                  Cada disseny està pensat per a qui rebutja ser reduït a estereotips i llocs comuns.
                  És per a qui defensa el dret a pensar, sentir i existir plenament, sense concessions ni
                  disculpes. Una col·lecció per a ànimes valentes i indòmites.
                </p>
              </div>
            </div>
          </motion.div>

          <ProductGrid
            products={collectionProducts}
            onAddToCart={onAddToCart}
            cartItems={cartItems}
            onUpdateQuantity={onUpdateQuantity}
          />
        </div>
      </div>
    </>
  );
}

export default AustenPage;
