import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PDP_REGISTRY } from '@/data/pdpRegistry';
import SupabaseCollectionRoute from '@/pages/SupabaseCollectionRoute.jsx';
import ProtectedRoute from '@/components/ProtectedRoute';
import ClientProtectedRoute from '@/components/ClientProtectedRoute';
import {
  Home,
  FullWideSlideHeader,
  CollectionFirstContactPage,
  CollectionTheHumanInsidePage,
  CollectionAustenPage,
  CollectionCubePage,
  CollectionMiscellaniaPage,
  ProductDetailPage,
  ProductDetailPageTemplate,
  ProductDetailPageEnhanced,
  OrderConfirmationPage,
  OrderTrackingPage,
  AboutPage,
  ContactPage,
  FAQPage,
  ShippingPage,
  SizeGuidePage,
  PrivacyPage,
  TermsPage,
  CreativeCommonsPage,
  LegalNoticePage,
  CookiePolicyPage,
  OffersPage,
  LoginPage,
  RegisterPage,
  ProfilePage,
  NotFoundPage,
  FullWideSlidePage,
  ConstructorColleccioPage,
  ConstructorPdpPage,
  HtmlBasePage,
  TdpPage,
  ECPreviewPage,
  ECPreviewLitePage,
  LabHomePage,
  LabDemosPage,
  LabWipPage,
  DevLinksPage,
  DevComponentsCatalogPage,
  DevLayoutBuilderPage,
  PlantillaCatalegComponentsPage,
  ContactSheetPage,
  SiteMapPage,
  AdminLoginPage,
  AdminStudioLayout,
  AdminStudioHomePage,
  AdminControlsPage,
  AdminPlantillesPage,
  AdminWipPage,
  AdminDemosPage,
  IndexPage,
  PromotionsManagerPage,
  ECConfigPage,
  SystemMessagesPage,
  AdminMediaPage,
  HeroSettingsPage,
  ColleccioSettingsPage,
  MockupsManagerPage,
  AdminUploadPage,
  FulfillmentPage,
  FulfillmentSettingsPage,
  GelatoProductsManagerPage,
  PricingConfigPage,
  GelatoBlankProductsPage,
  GelatoTemplatesPage,
  ProductsOverviewPage,
  UnitatsCanviPage,
  RuletaDemoPage,
  EmailPreviewPage,
  ResetPasswordPage,
} from './lazyPages';

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
              <FullWideSlideHeader
                cartItemCount={pageProps.cartItems?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0}
                onCartClick={pageProps.onCartClick}
                onUserClick={pageProps.onUserClick}
                manualEnabledOverride={false}
                ignoreStripeDebugFromUrl
              />
            </div>
            <Home />
          </motion.div>
        } />

        <Route path="/lab" element={<ProtectedRoute><LabHomePage /></ProtectedRoute>} />
        <Route path="/lab/demos" element={<ProtectedRoute><LabDemosPage /></ProtectedRoute>} />
        <Route path="/lab/wip" element={<ProtectedRoute><LabWipPage /></ProtectedRoute>} />

        <Route path="/first-contact" element={<MotionDiv><CollectionFirstContactPage pautaEnabled={false} tableEnabled={false} {...pageProps} /></MotionDiv>} />
        <Route path="/the-human-inside" element={<MotionDiv><CollectionTheHumanInsidePage pautaEnabled={false} tableEnabled={false} {...pageProps} /></MotionDiv>} />
        <Route path="/austen" element={<MotionDiv><CollectionAustenPage pautaEnabled={false} tableEnabled={false} {...pageProps} /></MotionDiv>} />
        <Route path="/cube" element={<MotionDiv><CollectionCubePage pautaEnabled={false} tableEnabled={false} {...pageProps} /></MotionDiv>} />
        <Route path="/miscellania" element={<MotionDiv><CollectionMiscellaniaPage pautaEnabled={false} tableEnabled={false} {...pageProps} /></MotionDiv>} />

        <Route path="/lab/proves" element={<MotionDiv><SupabaseCollectionRoute collectionKey="proves" {...pageProps} /></MotionDiv>} />
        <Route path="/proves" element={<ProtectedRoute><Navigate to="/lab/proves" replace /></ProtectedRoute>} />
        <Route path="/proves/dev-links" element={<ProtectedRoute><DevLinksPage /></ProtectedRoute>} />
        <Route path="/proves/dev-components" element={<ProtectedRoute><DevComponentsCatalogPage /></ProtectedRoute>} />
        <Route path="/proves/layout-builder" element={<ProtectedRoute><DevLayoutBuilderPage /></ProtectedRoute>} />

        <Route path="/proves/product/:id" element={<MotionDiv><ProductDetailPage {...pageProps} /></MotionDiv>} />
        <Route path="/product/:id" element={<MotionDiv><ProductDetailPage {...pageProps} /></MotionDiv>} />
        <Route path="/product-gelato/:id" element={<MotionDiv><ProductDetailPage {...pageProps} /></MotionDiv>} />

        <Route path="/full-wide-slide" element={<FullWideSlidePage pautaEnabled={false} tableEnabled={false} />} />
        <Route path="/constructor/full-wide-slide" element={<FullWideSlidePage pautaEnabled={false} tableEnabled={false} />} />
        <Route path="/plantilla-cataleg-components" element={<ProtectedRoute><PlantillaCatalegComponentsPage /></ProtectedRoute>} />

        <Route path="/checkout" element={<Navigate to="/" replace />} />
        <Route path="/order-confirmation/:orderId" element={<MotionDiv><OrderConfirmationPage /></MotionDiv>} />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/sizing" element={<SizeGuidePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cc" element={<CreativeCommonsPage />} />
        <Route path="/legal" element={<LegalNoticePage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
        <Route path="/offers" element={<OffersPage />} />

        <Route path="/constructor/tdp" element={<TdpPage pautaEnabled={false} tableEnabled={false} />} />
        <Route path="/tdp" element={<Navigate to="/constructor/tdp" replace />} />
        <Route path="/constructor/colleccio" element={<ConstructorColleccioPage pautaEnabled={false} tableEnabled={false} />} />
        <Route path="/constructor/pdp" element={<ConstructorPdpPage />} />

        {PDP_REGISTRY.map((p) => (
          <Route key={p.slug} path={`/${p.collectionSlug}/${p.route}`} element={<ProductDetailPageTemplate />} />
        ))}

        <Route path="/constructor/html-base" element={<HtmlBasePage pautaEnabled={false} tableEnabled={false} />} />

        <Route path="/dev/contact-sheet" element={<ProtectedRoute><ContactSheetPage /></ProtectedRoute>} />
        <Route path="/dev/site-map" element={<ProtectedRoute><SiteMapPage /></ProtectedRoute>} />
        <Route path="/dev-links" element={<ProtectedRoute><Navigate to="/proves/dev-links" replace /></ProtectedRoute>} />
        <Route path="/dev-components" element={<ProtectedRoute><Navigate to="/proves/dev-components" replace /></ProtectedRoute>} />
        <Route path="/layout-builder" element={<ProtectedRoute><Navigate to="/proves/layout-builder" replace /></ProtectedRoute>} />
        <Route path="/status" element={<Navigate to="/track" replace />} />
        <Route path="/track" element={<OrderTrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/perfil" element={<ClientProtectedRoute><ProfilePage /></ClientProtectedRoute>} />
        <Route path="/ruleta-demo" element={<Navigate to="/admin/draft/ruleta" replace />} />

        <Route path="/ec-preview" element={<motion.div {...fadeIn}><ECPreviewPage /></motion.div>} />
        <Route path="/ec-preview-lite" element={<motion.div {...fadeIn}><ECPreviewLitePage /></motion.div>} />

        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminStudioLayout />}>
          <Route index element={<AdminStudioHomePage />} />
          <Route path="controls" element={<AdminControlsPage />} />
          <Route path="plantilles" element={<AdminPlantillesPage />} />
          <Route path="wip" element={<AdminWipPage />} />
          <Route path="draft" element={<Navigate to="/admin/draft/ruleta" replace />} />
          <Route path="demos" element={<AdminDemosPage />} />
          <Route path="index" element={<IndexPage />} />
          <Route path="promotions" element={<PromotionsManagerPage />} />
          <Route path="ec-config" element={<ECConfigPage />} />
          <Route path="system-messages" element={<SystemMessagesPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="hero" element={<HeroSettingsPage />} />
          <Route path="collections" element={<ColleccioSettingsPage {...pageProps} />} />
          <Route path="mockups" element={<MockupsManagerPage />} />
          <Route path="upload" element={<AdminUploadPage />} />
          <Route path="fulfillment" element={<FulfillmentPage />} />
          <Route path="fulfillment-settings" element={<FulfillmentSettingsPage />} />
          <Route path="gelato-sync" element={<GelatoProductsManagerPage />} />
          <Route path="pricing" element={<PricingConfigPage />} />
          <Route path="gelato-blank" element={<GelatoBlankProductsPage />} />
          <Route path="gelato-templates" element={<GelatoTemplatesPage />} />
          <Route path="products-overview" element={<ProductsOverviewPage />} />
          <Route path="unitats" element={<UnitatsCanviPage />} />
          <Route path="draft/ruleta" element={<RuletaDemoPage />} />
        </Route>

        <Route path="/admin/studio" element={<AdminStudioHomePage />} />
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

        <Route path="/fulfillment/:id" element={<MotionDiv><ProductDetailPageEnhanced /></MotionDiv>} />

        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dev/email-preview" element={<EmailPreviewPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}
