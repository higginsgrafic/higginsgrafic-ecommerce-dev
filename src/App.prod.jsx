import React, { useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import * as Sentry from '@sentry/react';
import { useProductContext } from '@/contexts/ProductContext';
import { initAnalytics, trackPageView } from '@/utils/analytics';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import SkipLink from '@/components/SkipLink';
import OffersHeader from '@/components/OffersHeader';
import NikeInspiredHeader from '@/components/NikeInspiredHeader';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';

// ───────────────────────────────────────────────────────
// Pàgines de la botiga (lazy-loaded)
// ───────────────────────────────────────────────────────
const HomeClean = lazy(() => import('@/pages/HomeClean'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const OrderTrackingPage = lazy(() => import('@/pages/OrderTrackingPage'));
const OffersPage = lazy(() => import('@/pages/OffersPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const ShippingPage = lazy(() => import('@/pages/ShippingPage'));
const SizeGuidePage = lazy(() => import('@/pages/SizeGuidePage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const CreativeCommonsPage = lazy(() => import('@/pages/CreativeCommonsPage'));
const SupabaseCollectionRoute = lazy(() => import('@/pages/SupabaseCollectionRoute.jsx'));
const NewPage = lazy(() => import('@/pages/NewPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// ───────────────────────────────────────────────────────
// Animació de transició de pàgina
// ───────────────────────────────────────────────────────
const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const transitionConfig = { duration: 0.25, ease: 'easeInOut' };

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={transitionConfig}
    >
      {children}
    </motion.div>
  );
}

// ───────────────────────────────────────────────────────
// App de producció
// ───────────────────────────────────────────────────────
export default function App() {
  const location = useLocation();
  const { offersConfig } = useProductContext();

  // Analítiques
  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const headerWithOffers = useCallback(
    (offers) => {
      if (!offers || !offers.enabled) return null;
      return (
        <OffersHeader
          message={offers.message}
          linkUrl={offers.linkUrl}
          linkLabel={offers.linkLabel}
          variant={offers.variant || 'default'}
        />
      );
    },
    [],
  );

  return (
    <>
      <Helmet
        defaultTitle="Higgins Gràfic"
        titleTemplate="%s — Higgins Gràfic"
      >
        <html lang="ca" />
        <meta name="description" content="Botiga de roba i marxandatge amb dissenys originals d'Higgins Gràfic." />
      </Helmet>

      <SkipLink />
      <ScrollToTop />

      {headerWithOffers(offersConfig)}

      <NikeInspiredHeader />

      <Suspense fallback={<LoadingScreen />}>
        <Sentry.ErrorBoundary
          fallback={({ error, resetError }) => (
            <div style={{
              padding: '2rem',
              maxWidth: 600,
              margin: '4rem auto',
              textAlign: 'center',
              fontFamily: 'system-ui, sans-serif',
            }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Alguna cosa ha fallat</h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Disculpa les molèsties. Estem al cas de l'error i ho solucionarem aviat.
              </p>
              <button
                onClick={resetError}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: 8,
                  border: 'none',
                  background: '#1d4ed8',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                }}
              >
                Torna-ho a provar
              </button>
              {error && (
                <details style={{ marginTop: '2rem', textAlign: 'left', color: '#9ca3af', fontSize: '0.8rem' }}>
                  <summary>Detalls tècnics</summary>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
                </details>
              )}
            </div>
          )}
        >
          <ErrorBoundary>
            <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* ── Home ── */}
              <Route
                path="/"
                element={
                  <AnimatedPage>
                    <HomeClean />
                  </AnimatedPage>
                }
              />

              {/* ── Fitxa de producte ── */}
              <Route
                path="/product/:id"
                element={
                  <AnimatedPage>
                    <ProductDetailPage />
                  </AnimatedPage>
                }
              />

              {/* ── Checkout ── */}
              <Route
                path="/checkout"
                element={
                  <AnimatedPage>
                    <CheckoutPage
                      cartItems={[]}
                      pautaEnabled={false}
                      mockMode="single"
                    />
                  </AnimatedPage>
                }
              />

              {/* ── Confirmació comanda ── */}
              <Route
                path="/order-confirmation/:orderId"
                element={
                  <AnimatedPage>
                    <OrderConfirmationPage />
                  </AnimatedPage>
                }
              />

              {/* ── Seguiment comanda ── */}
              <Route
                path="/track"
                element={
                  <AnimatedPage>
                    <OrderTrackingPage />
                  </AnimatedPage>
                }
              />
              <Route path="/status" element={<Navigate to="/track" replace />} />

              {/* ── Ofertes ── */}
              <Route
                path="/offers"
                element={
                  <AnimatedPage>
                    <OffersPage />
                  </AnimatedPage>
                }
              />

              {/* ── Col·leccions reals (Supabase) ── */}
              <Route
                path="/collection/:slug"
                element={
                  <AnimatedPage>
                    <SupabaseCollectionRoute />
                  </AnimatedPage>
                }
              />

              {/* ── Novetats ── */}
              <Route
                path="/new"
                element={
                  <AnimatedPage>
                    <NewPage />
                  </AnimatedPage>
                }
              />

              {/* ── Pàgines de servei ── */}
              <Route
                path="/about"
                element={
                  <AnimatedPage>
                    <AboutPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/contact"
                element={
                  <AnimatedPage>
                    <ContactPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/faq"
                element={
                  <AnimatedPage>
                    <FAQPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/shipping"
                element={
                  <AnimatedPage>
                    <ShippingPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/sizing"
                element={
                  <AnimatedPage>
                    <SizeGuidePage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/privacy"
                element={
                  <AnimatedPage>
                    <PrivacyPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/terms"
                element={
                  <AnimatedPage>
                    <TermsPage />
                  </AnimatedPage>
                }
              />
              <Route
                path="/cc"
                element={
                  <AnimatedPage>
                    <CreativeCommonsPage />
                  </AnimatedPage>
                }
              />

              {/* ── 404 ── */}
              <Route
                path="*"
                element={
                  <AnimatedPage>
                    <NotFoundPage />
                  </AnimatedPage>
                }
              />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
        </Sentry.ErrorBoundary>
      </Suspense>

      <Footer />
    </>
  );
}