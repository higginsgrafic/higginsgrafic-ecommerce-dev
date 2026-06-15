import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useProductContext } from '@/contexts/ProductContext';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import SkipLink from '@/components/SkipLink';
import OffersHeader from '@/components/OffersHeader';
import MainHeader from '@/components/MainHeader';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';

// PROD pages — lazy loaded
const HomeClean = lazy(() => import('@/pages/HomeClean'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const ShippingPage = lazy(() => import('@/pages/ShippingPage'));
const SizeGuidePage = lazy(() => import('@/pages/SizeGuidePage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const CreativeCommonsPage = lazy(() => import('@/pages/CreativeCommonsPage'));
const OffersPage = lazy(() => import('@/pages/OffersPage'));
const OrderTrackingPage = lazy(() => import('@/pages/OrderTrackingPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const TheHumanInsidePage = lazy(() => import('@/pages/TheHumanInsidePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

function AppProd() {
  const location = useLocation();
  const { offers } = useOffersConfig();
  const { isProductReady } = useProductContext();

  const showOffersHeader = offers && Array.isArray(offers) && offers.length > 0;

  return (
    <ErrorBoundary>
      <Helmet defaultTitle="GRAFC - Samarretes Premium | Col·leccions Exclusives" titleTemplate="%s | GRAFC" />

      <SkipLink />
      <ScrollToTop />

      {showOffersHeader && <OffersHeader offers={offers} />}

      <MainHeader />

      <main id="main-content">
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingScreen />}>
            {isProductReady ? (
              <Routes location={location} key={location.pathname}>
                {/* Home (Inici) */}
                <Route
                  path="/"
                  element={
                    <motion.div
                      key="home"
                      {...pageTransition}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <HomeClean />
                    </motion.div>
                  }
                />

                {/* Checkout & compra */}
                <Route
                  path="/checkout"
                  element={
                    <motion.div
                      key="checkout"
                      {...pageTransition}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <CheckoutPage />
                    </motion.div>
                  }
                />
                <Route
                  path="/order-confirmation/:orderId"
                  element={
                    <motion.div
                      key="order-confirmation"
                      {...pageTransition}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <OrderConfirmationPage />
                    </motion.div>
                  }
                />
                <Route
                  path="/track"
                  element={
                    <motion.div
                      key="track"
                      {...pageTransition}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <OrderTrackingPage />
                    </motion.div>
                  }
                />

                {/* Ofertes */}
                <Route
                  path="/offers"
                  element={
                    <motion.div
                      key="offers"
                      {...pageTransition}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <OffersPage />
                    </motion.div>
                  }
                />

                {/* Footer Service Pages — Només català */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/sizing" element={<SizeGuidePage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cc" element={<CreativeCommonsPage />} />

                {/* Col·leccions */}
                <Route
                  path="/the-human-inside"
                  element={
                    <motion.div
                      key="the-human-inside"
                      {...pageTransition}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <TheHumanInsidePage />
                    </motion.div>
                  }
                />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            ) : (
              <LoadingScreen />
            )}
          </Suspense>
        </AnimatePresence>
      </main>

      <Footer />
    </ErrorBoundary>
  );
}

export default AppProd;