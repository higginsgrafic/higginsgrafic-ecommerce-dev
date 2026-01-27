import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

import ProductGrid from '@/components/ProductGrid';
import { useProductContext } from '@/contexts/ProductContext';
import { useTexts } from '@/hooks/useTexts';
import Breadcrumbs from '@/components/Breadcrumbs';
import FullBleedUnderHeader from '@/components/FullBleedUnderHeader';

const UNAVAILABLE_PHRASES = [
  'Aquest producte està temporalment fora de servei.',
  'Ups. Aquí hi havia d’haver un producte.',
  'Això no hauria de passar. Ho estem revisant.',
  'Aquest disseny no està disponible ara mateix.',
  'No s’ha pogut carregar aquest producte.',
  'Ho sentim: aquest producte està momentàniament indisponible.',
  'Sembla que aquest producte ha desaparegut del radar.',
  'Aquest producte està prenent-se un descans.',
  'Aquest producte no es pot mostrar ara mateix.',
  'Hem trobat un petit problema amb aquest producte.',
  'Aquesta peça torna aviat (esperem).',
  'No podem mostrar aquest producte ara mateix.',
  'Aquest producte està en manteniment.',
  'Aquest producte no respon. Tornem-ho a provar més tard.',
  'Aquest producte s’ha quedat a mig camí.',
  'Aquest producte no està disponible temporalment.',
  'S’ha produït un problema mostrant aquest producte.',
  'Aquest producte ha entrat en una zona d’ombra.',
  'Aquest producte està fora de cobertura.',
  'Alguna cosa no ha anat bé amb aquest producte.',
  'No hem pogut recuperar aquest producte.',
  'Aquest producte no està accessible ara mateix.',
  'Aquest producte està fora de línia.',
  'Torna-ho a intentar en uns minuts.',
  'Si us plau, disculpa les molèsties.',
  'Això és temporal. Ja ho estem arreglant.',
  'Aquest producte s’ha perdut pel camí.',
  'No hem pogut sincronitzar aquest producte.',
  'Aquest producte no està disponible en aquest moment.',
  'Aquest producte està experimentant turbulències.'
];

const hashStringToInt = (str) => {
  const s = (str || '').toString();
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const pickUnavailablePhrase = (slug) => {
  const day = new Date().toISOString().slice(0, 10);
  const seed = hashStringToInt(`${(slug || '').toString()}|${day}`);
  const idx = UNAVAILABLE_PHRASES.length > 0 ? (seed % UNAVAILABLE_PHRASES.length) : 0;
  return UNAVAILABLE_PHRASES[idx] || 'Aquest producte no està disponible temporalment.';
};

function CollectionPage({ config, onAddToCart, cartItems, onUpdateQuantity }) {
  const texts = useTexts();
  const { getProductsByCollection } = useProductContext();

  const showConfigWarning = !!config?.showConfigWarning;
  const configWarningMessage = (config?.configWarningMessage || '').toString();
  const disableProductFallback = !!config?.disableProductFallback;

  const textsKey = config?.textsKey;
  const t = textsKey ? texts?.collections?.[textsKey] : null;

  const seoTitle = (t?.seo?.title || config?.seo?.title || config?.title || '').toString();
  const seoDescription = (t?.seo?.description || config?.seo?.description || '').toString();

  const title = (t?.title || config?.title || '').toString();
  const description = (t?.description || config?.description || '').toString();

  const collectionSlug = (config?.collectionSlug || '').toString();
  const productSlugs = Array.isArray(config?.productSlugs) ? config.productSlugs : [];

  const normalizeSlugKey = (value) => {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/_/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const stripCollectionPrefix = (slugValue) => {
    const s = normalizeSlugKey(slugValue);
    const c = normalizeSlugKey(collectionSlug);
    if (!s || !c) return s;
    return s.startsWith(`${c}-`) ? s.slice(c.length + 1) : s;
  };

  const products = useMemo(() => {
    const raw = collectionSlug ? getProductsByCollection(collectionSlug) : [];
    const bySlug = new Map();
    for (const p of (raw || []).filter(Boolean)) {
      const exact = (p?.slug || '').toString().trim();
      if (exact) bySlug.set(exact, p);

      const norm = normalizeSlugKey(exact);
      if (norm) bySlug.set(norm, p);

      const stripped = stripCollectionPrefix(exact);
      if (stripped) bySlug.set(stripped, p);
    }

    if (productSlugs.length === 0) {
      if (disableProductFallback) {
        if (import.meta?.env?.DEV) {
          console.warn(`[CollectionPage] productSlugs empty for ${collectionSlug} and product fallback disabled.`);
        }
        return [];
      }
      if (import.meta?.env?.DEV) {
        console.warn(`[CollectionPage] productSlugs empty for ${collectionSlug}. Falling back to getProductsByCollection().`);
      }
      return (raw || []).filter(Boolean);
    }

    const ordered = productSlugs
      .map((slug) => {
        const rawKey = (slug || '').toString().trim();
        const key = normalizeSlugKey(rawKey) || rawKey;
        const candidates = [
          rawKey,
          normalizeSlugKey(rawKey),
          stripCollectionPrefix(rawKey)
        ].filter(Boolean);

        const found = candidates.map((k) => bySlug.get(k)).find(Boolean);
        if (found) return found;

        return {
          id: `unavailable-${collectionSlug}-${key}`,
          slug: `unavailable-${key}`,
          name: 'No disponible',
          description: pickUnavailablePhrase(rawKey),
          image: '/placeholder-product.svg',
          collection: collectionSlug,
          __unavailable: true,
          __missingSlug: rawKey
        };
      });

    if (import.meta?.env?.DEV) {
      const missing = productSlugs
        .map((slug) => (slug || '').toString().trim())
        .filter((slug) => {
          if (!slug) return false;
          const candidates = [
            slug,
            normalizeSlugKey(slug),
            stripCollectionPrefix(slug)
          ].filter(Boolean);
          return !candidates.some((k) => bySlug.has(k));
        });
      if (missing.length > 0) {
        console.warn(`[CollectionPage] Missing products for ${collectionSlug}:`, missing);
      }
    }

    return ordered;
  }, [collectionSlug, disableProductFallback, getProductsByCollection, productSlugs]);

  const Wrapper = config?.useFullBleedUnderHeader ? FullBleedUnderHeader : 'div';
  const wrapperClassName = (config?.headerClassName || '').toString();

  const bodyText = (config?.bodyText || '').toString();
  const sections = Array.isArray(config?.sections) ? config.sections : [];

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        {seoDescription ? (
          <meta name="description" content={seoDescription} />
        ) : null}
      </Helmet>

      <div className="min-h-screen bg-white">
        <Wrapper className={wrapperClassName}>
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="mb-8">
              <Breadcrumbs
                items={[{ label: (config?.breadcrumbLabel || title || '').toString() }]}
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
                {title}
              </h1>
              <p className="font-roboto text-lg lg:text-xl text-gray-200 italic">
                {description}
              </p>
            </motion.div>
          </div>
        </Wrapper>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          {showConfigWarning ? (
            <div className="mb-10">
              <div className="border border-yellow-200 bg-yellow-50 text-yellow-900 rounded-md px-4 py-3">
                <p className="font-roboto text-sm leading-relaxed text-center">
                  {configWarningMessage || 'No s’ha pogut carregar alguns continguts. Torna-ho a provar més tard.'}
                </p>
              </div>
            </div>
          ) : null}

          {bodyText ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose max-w-none mb-16"
            >
              <div className="max-w-3xl mx-auto text-center">
                <p className="font-roboto text-base lg:text-lg text-gray-700 leading-relaxed">
                  {bodyText}
                </p>
              </div>
            </motion.div>
          ) : sections.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose max-w-none mb-16"
            >
              <div className="grid md:grid-cols-2 gap-12 mb-16">
                {sections.map((section, idx) => (
                  <div key={idx}>
                    {section?.title ? (
                      <h2
                        className="font-oswald text-3xl lg:text-4xl font-bold mb-4"
                        style={{ color: '#141414' }}
                      >
                        {(section.title || '').toString()}
                      </h2>
                    ) : null}
                    {section?.subtitle ? (
                      <h3
                        className="font-oswald text-2xl font-bold mb-4"
                        style={{ color: '#141414' }}
                      >
                        {(section.subtitle || '').toString()}
                      </h3>
                    ) : null}
                    {section?.text ? (
                      <p className="font-roboto text-base text-gray-700 leading-relaxed">
                        {(section.text || '').toString()}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}

          <ProductGrid
            products={products}
            onAddToCart={onAddToCart}
            cartItems={cartItems}
            onUpdateQuantity={onUpdateQuantity}
          />
        </div>
      </div>
    </>
  );
}

export default CollectionPage;
