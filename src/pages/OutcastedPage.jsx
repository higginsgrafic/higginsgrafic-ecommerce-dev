import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ProductGrid from '@/components/ProductGrid';
import { useProductContext } from '@/contexts/ProductContext';
import { useTexts } from '@/hooks/useTexts';
import Breadcrumbs from '@/components/Breadcrumbs';
import FullBleedUnderHeader from '@/components/FullBleedUnderHeader';

function OutcastedPage({ onAddToCart, cartItems, onUpdateQuantity }) {
  const texts = useTexts();
  const { getProductsByCollection } = useProductContext();
  const collectionProducts = getProductsByCollection('outcasted');

  return (
    <>
      <Helmet>
        <title>{texts.collections.outcasted.seo.title}</title>
        <meta name="description" content={texts.collections.outcasted.seo.description} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <FullBleedUnderHeader className="bg-gradient-to-br from-gray-900 via-stone-900 to-neutral-900 text-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="mb-8">
              <Breadcrumbs
                items={[
                  { label: 'Outcasted' }
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
                {texts.collections.outcasted.title}
              </h1>
              <p className="font-roboto text-lg lg:text-xl text-gray-200 italic">
                {texts.collections.outcasted.description}
              </p>
            </motion.div>
          </div>
        </FullBleedUnderHeader>

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
                  Outcasted celebra la individualitat i l'autonomia. Per a qui no necessita l'aprovació
                  dels altres per sentir-se complet. Aquesta col·lecció és un homenatge a qui tria el
                  seu propi camí, encara que això signifiqui caminar sol.
                </p>
              </div>
              <div>
                <h3 className="font-oswald text-2xl font-bold mb-4" style={{ color: '#141414' }}>
                  Inspiració
                </h3>
                <p className="font-roboto text-base text-gray-700 leading-relaxed">
                  Inspirada en els que desafien les normes i rebutgen el conformisme, cada peça és una
                  declaració d'independència. És per a qui entén que la solitud pot ser una forma de
                  llibertat, no un càstig. Per a esperits lliures i independents.
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

export default OutcastedPage;
