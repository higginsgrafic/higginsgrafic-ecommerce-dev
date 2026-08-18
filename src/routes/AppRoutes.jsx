import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PDP_REGISTRY } from '@/data/pdpRegistry';
import SupabaseCollectionRoute from '@/pages/SupabaseCollectionRoute.jsx';
import ProtectedRoute from '@/components/ProtectedRoute';
import ClientProtectedRoute from '@/components/ClientProtectedRoute';
import * as P from './lazyPages';

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 },
};

function MotionDiv({ children }) {
  return <motion.div {...pageTransition}>{children}</motion.div>;
}

export default function AppRoutes({ location, pageProps, pautaEnabled, tableEnabled, clearCart, demoHeaderOffset }) {
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div {...pageTransition}>
            <div className="w-full max-w-none" style={{ '--appHeaderOffset': demoHeaderOffset }}>
              <P.FullWideSlideHeader
                cartItemCount={pageProps.cartItems?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0}
                onCartClick={pageProps.onCartClick}
                onUserClick={pageProps.onUserClick}
                manualEnabledOverride={false}
                ignoreStripeDebugFromUrl
              />
            </div>
            <P.Home />
          </motion.div>
        } />

        <Route path="/lab" element={<ProtectedRoute><P.LabHomePage /></ProtectedRoute>} />
        <Route path="/lab/demos" element={<ProtectedRoute><P.LabDemosPage /></ProtectedRoute>} />
        <Route path="/lab/wip" element={<ProtectedRoute><P.LabWipPage /></ProtectedRoute>} />

        <Route path="/first-contact" element={<MotionDiv><P.CollectionFirstContactPage pautaEnabled={false} tableEnabled={false} {...pageProps} /></MotionDiv>} />
        <Route path="/the-human-inside" element={<MotionDiv><P.CollectionTheHumanInsidePage pautaEnabled={false} tableEnabled={false} {...pageProps} /></MotionDiv>} />
        <Route path="/austen" element={<MotionDiv><P.CollectionAustenPage pautaEnabled={false} tableEnabled={false} {...pageProps} /></MotionDiv>} />
        <Route path="/cube" element={<MotionDiv><P.CollectionCubePage pautaEnabled={false} tableEnabled={false} {...pageProps} /></MotionDiv>} />
        <Route path="/miscellania" element={<MotionDiv><P.CollectionMiscellaniaPage pautaEnabled={false} tableEnabled={false} {...pageProps} /></MotionDiv>} />

        <Route path="/lab/proves" element={<MotionDiv><SupabaseCollectionRoute collectionKey="proves" {...pageProps} /></MotionDiv>} />
        <Route path="/proves" element={<ProtectedRoute><Navigate to="/lab/proves" replace /></ProtectedRoute>} />
        <Route path="/proves/dev-links" element={<ProtectedRoute><P.DevLinksPage /></ProtectedRoute>} />
        <Route path="/proves/dev-components" element={<ProtectedRoute><P.DevComponentsCatalogPage /></ProtectedRoute>} />
        <Route path="/proves/layout-builder" element={<ProtectedRoute><P.DevLayoutBuilderPage /></ProtectedRoute>} />

        <Route path="/proves/product/:id" element={<MotionDiv><P.ProductDetailPage {...pageProps} /></MotionDiv>} />
        <Route path="/product/:id" element={<MotionDiv><P.ProductDetailPage {...pageProps} /></MotionDiv>} />
        <Route path="/product-gelato/:id" element={<MotionDiv><P.ProductDetailPage {...pageProps} /></MotionDiv>} />

        <Route path="/full-wide-slide" element={<P.FullWideSlidePage pautaEnabled={false} tableEnabled={false} />} />
        <Route path="/constructor/full-wide-slide" element={<P.FullWideSlidePage pautaEnabled={false} tableEnabled={false} />} />
        <Route path="/plantilla-cataleg-components" element={<ProtectedRoute><P.PlantillaCatalegComponentsPage /></ProtectedRoute>} />

        <Route path="/checkout" element={<Navigate to="/" replace />} />
        <Route path="/order-confirmation/:orderId" element={<MotionDiv><P.OrderConfirmationPage /></MotionDiv>} />

        <Route path="/about" element={<P.AboutPage />} />
        <Route path="/contact" element={<P.ContactPage />} />
        <Route path="/faq" element={<P.FAQPage />} />
        <Route path="/shipping" element={<P.ShippingPage />} />
        <Route path="/sizing" element={<P.SizeGuidePage />} />
        <Route path="/privacy" element={<P.PrivacyPage />} />
        <Route path="/terms" element={<P.TermsPage />} />
        <Route path="/cc" element={<P.CreativeCommonsPage />} />
        <Route path="/legal" element={<P.LegalNoticePage />} />
        <Route path="/cookies" element={<P.CookiePolicyPage />} />
        <Route path="/offers" element={<P.OffersPage />} />

        <Route path="/constructor/tdp" element={<P.TdpPage pautaEnabled={false} tableEnabled={false} />} />
        <Route path="/tdp" element={<Navigate to="/constructor/tdp" replace />} />
        <Route path="/constructor/colleccio" element={<P.ConstructorColleccioPage pautaEnabled={false} tableEnabled={false} />} />
        <Route path="/constructor/pdp" element={<P.ConstructorPdpPage />} />

        {PDP_REGISTRY.map((p) => (
          <Route key={p.slug} path={`/${p.collectionSlug}/${p.route}`} element={<P.ProductDetailPageTemplate />} />
        ))}

        <Route path="/constructor/html-base" element={<P.HtmlBasePage pautaEnabled={false} tableEnabled={false} />} />

        <Route path="/dev/contact-sheet" element={<ProtectedRoute><P.ContactSheetPage /></ProtectedRoute>} />
        <Route path="/dev/site-map" element={<ProtectedRoute><P.SiteMapPage /></ProtectedRoute>} />
        <Route path="/dev-links" element={<ProtectedRoute><Navigate to="/proves/dev-links" replace /></ProtectedRoute>} />
        <Route path="/dev-components" element={<ProtectedRoute><Navigate to="/proves/dev-components" replace /></ProtectedRoute>} />
        <Route path="/layout-builder" element={<ProtectedRoute><Navigate to="/proves/layout-builder" replace /></ProtectedRoute>} />
        <Route path="/status" element={<Navigate to="/track" replace />} />
        <Route path="/track" element={<P.OrderTrackingPage />} />
        <Route path="/login" element={<P.LoginPage />} />
        <Route path="/register" element={<P.RegisterPage />} />
        <Route path="/perfil" element={<ClientProtectedRoute><P.ProfilePage /></ClientProtectedRoute>} />
        <Route path="/ruleta-demo" element={<Navigate to="/admin/draft/ruleta" replace />} />

        <Route path="/ec-preview" element={<motion.div {...fadeIn}><P.ECPreviewPage /></motion.div>} />
        <Route path="/ec-preview-lite" element={<motion.div {...fadeIn}><P.ECPreviewLitePage /></motion.div>} />

        <Route path="/admin-login" element={<P.AdminLoginPage />} />
        <Route path="/admin" element={<P.AdminStudioLayout />}>
          <Route index element={<P.AdminStudioHomePage />} />
          <Route path="controls" element={<P.AdminControlsPage />} />
          <Route path="plantilles" element={<P.AdminPlantillesPage />} />
          <Route path="wip" element={<P.AdminWipPage />} />
          <Route path="draft" element={<Navigate to="/admin/draft/ruleta" replace />} />
          <Route path="demos" element={<P.AdminDemosPage />} />
          <Route path="index" element={<P.IndexPage />} />
          <Route path="promotions" element={<P.PromotionsManagerPage />} />
          <Route path="ec-config" element={<P.ECConfigPage />} />
          <Route path="system-messages" element={<P.SystemMessagesPage />} />
          <Route path="media" element={<P.AdminMediaPage />} />
          <Route path="hero" element={<P.HeroSettingsPage />} />
          <Route path="collections" element={<P.ColleccioSettingsPage {...pageProps} />} />
          <Route path="mockups" element={<P.MockupsManagerPage />} />
          <Route path="upload" element={<P.AdminUploadPage />} />
          <Route path="fulfillment" element={<P.FulfillmentPage />} />
          <Route path="fulfillment-settings" element={<P.FulfillmentSettingsPage />} />
          <Route path="gelato-sync" element={<P.GelatoProductsManagerPage />} />
          <Route path="pricing" element={<P.PricingConfigPage />} />
          <Route path="gelato-blank" element={<P.GelatoBlankProductsPage />} />
          <Route path="gelato-templates" element={<P.GelatoTemplatesPage />} />
          <Route path="products-overview" element={<P.ProductsOverviewPage />} />
          <Route path="unitats" element={<P.UnitatsCanviPage />} />
          <Route path="draft/ruleta" element={<P.RuletaDemoPage />} />
        </Route>

        <Route path="/admin/studio" element={<P.AdminStudioHomePage />} />
        <Route path="/admin/studio/*" element={<Navigate to="/admin/studio" replace />} />
        <Route path="/index" element={<Navigate to="/admin/index" replace />} />
        <Route path="/promotions" element={<Navigate to="/admin/promotions" replace />} />
        <Route path="/ec-config" element={<Navigate to="/admin/ec-config" replace />} />
        <Route path="/system-messages" element={<Navigate to="/admin/system-messages" replace />} />
        <Route path="/hero-settings" element={<Navigate to="/admin/hero" replace />} />
        <Route path="/colleccio-settings" element={<Navigate to="/admin/collections" replace />} />
        <Route path="/mockups" element={<Navigate to="/admin/mockups" replace />} />
        <Route path="/fulfillment" element={<Navigate to="/admin/fulfillment" replace />} />
        <Route path="/fulfillment-settings" element={<Navigate to="/admin/fulfillment-settings" replace />} />

        <Route path="/fulfillment/:id" element={<MotionDiv><P.ProductDetailPageEnhanced /></MotionDiv>} />

        <Route path="/dev/email-preview" element={<P.EmailPreviewPage />} />

        <Route path="*" element={<P.NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}
