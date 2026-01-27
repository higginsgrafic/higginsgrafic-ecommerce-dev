import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ProductGrid from '@/components/ProductGrid';
import { useProductContext } from '@/contexts/ProductContext';
import { useTexts } from '@/hooks/useTexts';
import Breadcrumbs from '@/components/Breadcrumbs';

function TheHumanInsidePage({ onAddToCart, cartItems, onUpdateQuantity }) {
  const texts = useTexts();
  const { getRandomProductsByCollection } = useProductContext();
  const collectionProducts = getRandomProductsByCollection('the-human-inside', 4);

  return (
    <>
      <Helmet>
        <title>{texts.collections.theHumanInside.seo.title}</title>
        <meta name="description" content={texts.collections.theHumanInside.seo.description} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="mb-8">
              <Breadcrumbs
                items={[
                  { label: 'The Human Inside' }
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
                {texts.collections.theHumanInside.title}
              </h1>
              <p className="font-roboto text-lg lg:text-xl text-gray-200 italic">
                {texts.collections.theHumanInside.description}
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
                  The Human Inside explora la dualitat de l'ésser humà: la lluita entre la llum i la foscor,
                  entre el coratge i la por. En els moments més difícils, descobrim qui som realment.
                  Aquesta col·lecció és un homenatge a la resiliència i la força interior.
                </p>
              </div>
              <div>
                <h3 className="font-oswald text-2xl font-bold mb-4" style={{ color: '#141414' }}>
                  Inspiració
                </h3>
                <p className="font-roboto text-base text-gray-700 leading-relaxed">
                  Inspirada en el viatge de l'heroi i la transformació personal, cada peça representa
                  el despertar del potencial que portem a dins. És per a qui no té por d'enfrontar-se
                  a les seves pròpies ombres per trobar la llum.
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

export default TheHumanInsidePage;
