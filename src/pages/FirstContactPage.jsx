import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ProductGrid from '@/components/ProductGrid';
import { useProductContext } from '@/contexts/ProductContext';
import { useTexts } from '@/hooks/useTexts';
import Breadcrumbs from '@/components/Breadcrumbs';
import FullBleedUnderHeader from '@/components/FullBleedUnderHeader';

function FirstContactPage({ onAddToCart, cartItems, onUpdateQuantity }) {
  const texts = useTexts();
  const { getProductsByCollection } = useProductContext();
  const collectionProductsRaw = getProductsByCollection('first-contact');
  const c2Slugs = [
    'first-contact-nx-01',
    'first-contact-ncc-1701',
    'first-contact-ncc-1701-d',
    'first-contact-wormhole',
    'first-contact-plasma-escape',
    'first-contact-vulcans-end',
    'first-contact-the-phoenix'
  ];

  const bySlug = new Map(
    (collectionProductsRaw || [])
      .filter(Boolean)
      .map((p) => [(p?.slug || '').toString().trim(), p])
  );

  const c2Products = c2Slugs
    .map((slug) => bySlug.get(slug))
    .filter(Boolean);

  const collectionProducts = c2Products.length > 0 ? c2Products : collectionProductsRaw;

  return (
    <>
      <Helmet>
        <title>{texts.collections.firstContact.seo.title}</title>
        <meta name="description" content={texts.collections.firstContact.seo.description} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <FullBleedUnderHeader className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="mb-8">
              <Breadcrumbs
                items={[
                  { label: 'First Contact' }
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
                {texts.collections.firstContact.title}
              </h1>
              <p className="font-roboto text-lg lg:text-xl text-gray-200 italic">
                {texts.collections.firstContact.description}
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
                  First Contact és una celebració de la curiositat humana i l'exploració de l'univers desconegut.
                  Aquesta col·lecció captura l'esperit d'aventura que ens impulsa a buscar noves fronteres,
                  a qüestionar el que sabem i a somiar amb el que encara està per descobrir.
                </p>
              </div>
              <div>
                <h3 className="font-oswald text-2xl font-bold mb-4" style={{ color: '#141414' }}>
                  Inspiració
                </h3>
                <p className="font-roboto text-base text-gray-700 leading-relaxed">
                  Inspirada en la ciència-ficció i els viatges espacials, cada disseny explora temes de
                  descobriment, contacte amb el desconegut i la recerca de respostes a les grans preguntes
                  de l'existència. És per a qui mira cap a les estrelles amb esperança.
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

export default FirstContactPage;
