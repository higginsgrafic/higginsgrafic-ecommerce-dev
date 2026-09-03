import React, { useState, useEffect, useMemo, useCallback, useTransition, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProductContext } from '@/contexts/ProductContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import { useGlobalRedirect } from '@/hooks/useGlobalRedirect';
import useGlobalEffects from '@/hooks/useGlobalEffects';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen, { DismissPreloaderOnMount } from '@/components/LoadingScreen';
import SkipLink from '@/components/SkipLink';
import OffersHeader from '@/components/OffersHeader';
import AdminBanner from '@/components/AdminBanner';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import SiteFrame from '@/components/layout/SiteFrame.jsx';
import useComponentCatalogConfig from '@/hooks/useComponentCatalogConfig';
import AppRoutes from '@/routes/AppRoutes';
import * as P from '@/routes/lazyPages';

const DebugLayer = lazy(() => import('@/components/DebugLayer'));


function App() {
  const { config: componentCatalogConfig } = useComponentCatalogConfig();
  const [isNavigating, setIsNavigating] = useState(false);
  const [debugState, setDebugState] = useState({ rulerInset: 0, pautaEnabled: false, tableEnabled: false, layoutInspectorActive: false });
  const onDebugStateChange = useCallback((next) => setDebugState((prev) => {
    if (prev.rulerInset === next.rulerInset && prev.pautaEnabled === next.pautaEnabled && prev.tableEnabled === next.tableEnabled && prev.layoutInspectorActive === next.layoutInspectorActive) return prev;
    return next;
  }), []);

  const location = useLocation();
  const navigate = useNavigate();
  const [_, startTransition] = useTransition();
  const [deferredLocation, setDeferredLocation] = useState(location);

  useEffect(() => {
    startTransition(() => {
      setDeferredLocation(location);
    });
  }, [location, startTransition]);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [isPortraitTablet, setIsPortraitTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth <= 1024 && window.innerHeight > window.innerWidth
  );
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(
    window.innerWidth >= 1024 && window.innerWidth <= 1366 && window.innerHeight < window.innerWidth
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const update = () => {
      setIsPortraitTablet(
        window.innerWidth >= 768 && window.innerWidth <= 1024 && window.innerHeight > window.innerWidth
      );
      setIsLandscapeTablet(
        window.innerWidth >= 1024 && window.innerWidth <= 1366 && window.innerHeight < window.innerWidth
      );
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const fullWideSlideConfig = componentCatalogConfig?.components?.fullWideSlide;
  const fullWideMegaMenuConfig = fullWideSlideConfig?.megaMenu;
  const resolvedFullWideNavItems =
    Array.isArray(fullWideMegaMenuConfig?.navItems) && fullWideMegaMenuConfig.navItems.length > 0
      ? fullWideMegaMenuConfig.navItems
      : undefined;
  const resolvedFullWideMegaConfig =
    fullWideMegaMenuConfig?.megaConfig &&
    typeof fullWideMegaMenuConfig.megaConfig === 'object' &&
    Object.keys(fullWideMegaMenuConfig.megaConfig).length > 0
      ? fullWideMegaMenuConfig.megaConfig
      : undefined;
  const fullWideShowStripe = fullWideMegaMenuConfig?.showStripe !== false;
  const fullWideShowCatalogPanel = fullWideMegaMenuConfig?.showCatalogPanel !== false;


  const isFullWideSlideRoute = location.pathname === '/full-wide-slide' || location.pathname === '/constructor/full-wide-slide';
  const isFullWideSlideDemoRoute = location.pathname === '/full-wide-slide-demo';

  const productContext = useProductContext();
  const { isAdmin, bypassUnderConstruction } = useAdmin();
  const { enabled: offersEnabled, loading: offersLoading } = useOffersConfig();
  const { shouldRedirect, redirectUrl, loading: redirectLoading } = useGlobalRedirect(bypassUnderConstruction);

  useGlobalEffects({
    location,
    navigate,
    setIsNavigating,
    setIsLargeScreen,
    shouldRedirect,
    redirectUrl,
    redirectLoading,
    bypassUnderConstruction,
    isAdmin,
  });


  const safeProductContext =
    productContext ||
    ({
      cartItems: [],
      getTotalItems: () => 0,
      getTotalPrice: () => 0,
      addToCart: () => {},
      updateQuantity: () => {},
      removeFromCart: () => {},
      updateSize: () => {},
      clearCart: () => {},
      loading: false,
      error: null,
      products: [],
    });

  const { cartItems, getTotalItems, getTotalPrice, addToCart, updateQuantity, removeFromCart, updateSize, clearCart, loading, error, products } =
    safeProductContext;

  const isHomeRoute = location.pathname === '/';
  const isPreview = location.pathname === '/ec-preview' || location.pathname === '/ec-preview-lite';
  const isDemoStyleLayoutRoute = (isFullWideSlideDemoRoute || isFullWideSlideRoute);
  const isDevDemoRoute = isFullWideSlideDemoRoute || isFullWideSlideRoute;
  const isContactSheetRoute = location.pathname === '/dev/contact-sheet';
  const isEmbeddedPreview = isContactSheetRoute || (() => {
    try {
      return new URLSearchParams(location.search).get('embed') === 'contact-sheet';
    } catch {
      return false;
    }
  })();
  const { rulerInset, pautaEnabled, tableEnabled, layoutInspectorActive } = debugState;

  const showProductsLoadingScreen = !!loading;
  const showProductsErrorScreen = !!(error && (!products || products.length === 0));

  const handleAddToCart = useCallback((product, size, quantity = 1) => addToCart(product, size, quantity), [addToCart]);
  const handleCartClick = useCallback(() => navigate('/cart'), [navigate]);
  const handleUserClick = useCallback(() => navigate('/profile'), [navigate]);
  const pageProps = useMemo(() => ({ onAddToCart: handleAddToCart, cartItems, onUpdateQuantity: updateQuantity }), [handleAddToCart, cartItems, updateQuantity]);

  const isFullScreenRoute = location.pathname === '/ec-preview' || location.pathname === '/ec-preview-lite' || location.pathname === '/dev/contact-sheet' || location.pathname === '/dev/site-map' || isEmbeddedPreview;
  const isAdminRoute = ['/admin', '/index', '/promotions', '/ec-config', '/system-messages', '/fulfillment', '/fulfillment-settings', '/admin/media', '/admin-login', '/colleccio-settings', '/user-icon-picker', '/mockups', '/admin/gelato-sync', '/admin/gelato-blank', '/admin/products-overview', '/admin/draft', '/admin/draft/fulfillment-settings', '/admin/draft/mockup-settings', '/admin/draft/ruleta'].includes(location.pathname) || location.pathname.startsWith('/fulfillment/') || location.pathname.startsWith('/admin');
  const isHeroSettingsDevRoute = location.pathname === '/hero-settings';
  const isDevToolsRoute = location.pathname === '/dev-tools' || location.pathname.startsWith('/dev-tools/');
  const isDevComponentsRoute = location.pathname === '/dev-components' || location.pathname.startsWith('/proves/dev-components');
  const isComponentsCatalogTemplateRoute = location.pathname === '/plantilla-cataleg-components';

  const isDevLayoutRoute = isHeroSettingsDevRoute || isDevDemoRoute || isDevToolsRoute || isComponentsCatalogTemplateRoute;
  const isDevHeaderRoute = location.pathname.startsWith('/proves') || isDevToolsRoute || isDevComponentsRoute || isComponentsCatalogTemplateRoute;

  const isAdminStudioRoute = location.pathname.startsWith('/admin');
  const devHeaderVisible = !isFullScreenRoute && (isDevHeaderRoute || isAdminStudioRoute);

  const offersHeaderVisible = !isAdminRoute && !isFullScreenRoute && !isDevLayoutRoute && !isHomeRoute && offersEnabled && !offersLoading;

  const baseHeaderHeight = isPortraitTablet ? 80 : (isLargeScreen ? 80 : (isMobile ? 80 : 64));
  const heroSettingsDevHeaderHeight = isDevHeaderRoute ? baseHeaderHeight : 0;
  const offersHeaderHeight = offersHeaderVisible ? 40 : 0;
  const adminBannerVisible = (isAdmin || isDevDemoRoute || isAdminRoute) && !isEmbeddedPreview;
  const adminBannerHeight = adminBannerVisible ? 40 : 0;
  const offersHeaderTop = adminBannerVisible ? adminBannerHeight : 0;
  const adminRouteDevHeaderHeight = (isAdminRoute && devHeaderVisible) ? baseHeaderHeight : 0;

  const isPrivacyRoute = location.pathname === '/privacy';

  const adminRouteOffset = `${adminBannerHeight + adminRouteDevHeaderHeight + rulerInset}px`;
  const appHeaderOffset = `${(isDevHeaderRoute ? heroSettingsDevHeaderHeight : baseHeaderHeight) + offersHeaderHeight + adminBannerHeight + rulerInset}px`;
  const globalHeaderTopOffset = `${offersHeaderHeight + adminBannerHeight + rulerInset}px`;
  const demoHeaderOffset = `${adminBannerHeight + rulerInset}px`;

  useEffect(() => {
    try {
      if (isFullScreenRoute) return;
      const nextOffset = isAdminRoute ? adminRouteOffset : (isDemoStyleLayoutRoute ? demoHeaderOffset : appHeaderOffset);
      document.documentElement.style.setProperty('--appHeaderOffset', nextOffset);
      document.documentElement.style.setProperty('--globalHeaderTopOffset', globalHeaderTopOffset);
      document.documentElement.style.setProperty('--rulerInset', `${rulerInset}px`);
    } catch { /* ignore */ }
  }, [adminBannerHeight, adminRouteOffset, appHeaderOffset, baseHeaderHeight, demoHeaderOffset, globalHeaderTopOffset, isAdminRoute, isDemoStyleLayoutRoute, isFullScreenRoute, isLargeScreen, rulerInset]);

  return (
    <ErrorBoundary>
      {!productContext ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error: ProductContext no disponible</h1>
            <p>Si us plau, recarrega la pàgina.</p>
          </div>
        </div>
      ) : showProductsLoadingScreen ? (
        <LoadingScreen />
      ) : showProductsErrorScreen ? (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-black">Error carregant productes</h1>
            <p className="text-gray-600 mb-4">{error?.message || 'Si us plau, torna-ho a intentar.'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>
      ) : (
        <>
          <SkipLink />
          {isNavigating && !isAdminRoute && <LoadingScreen />}

          {adminBannerVisible && <AdminBanner rulerInset={rulerInset} />}

          {!isFullScreenRoute && !isAdminRoute && !isDevLayoutRoute && offersHeaderVisible && (
            <OffersHeader adminBannerVisible={adminBannerVisible} />
          )}

      {/* Main Header - NO mostrar a pàgines full-screen ni admin ni a dev tools */}
      {!isFullScreenRoute && !isAdminRoute && !isDemoStyleLayoutRoute && !isDevHeaderRoute && (
          <P.FullWideSlideHeader
            cartItemCount={getTotalItems()}
            onCartClick={handleCartClick}
            onUserClick={handleUserClick}
            manualEnabledOverride={false}
            ignoreStripeDebugFromUrl
            navItems={resolvedFullWideNavItems}
            megaConfig={resolvedFullWideMegaConfig}
            showStripe={fullWideShowStripe}
            showCatalogPanel={fullWideShowCatalogPanel}
            isPortraitTablet={isPortraitTablet}
            isLandscapeTablet={isLandscapeTablet}
          />
      )}

        <main
          id="main-content"
          className={`flex-grow ${isAdminRoute ? 'overflow-y-auto' : ''} ${!isFullScreenRoute ? 'transition-[padding-top] duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]' : ''} ${layoutInspectorActive ? 'debug-containers' : ''}`}
          style={!isFullScreenRoute ? (
            isAdminRoute
              ? { paddingTop: adminRouteOffset, paddingLeft: `${rulerInset}px`, '--appHeaderOffset': adminRouteOffset, '--rulerInset': `${rulerInset}px` }
              : { paddingTop: isDemoStyleLayoutRoute ? demoHeaderOffset : appHeaderOffset, paddingLeft: `${rulerInset}px`, '--appHeaderOffset': isDemoStyleLayoutRoute ? demoHeaderOffset : appHeaderOffset, '--rulerInset': `${rulerInset}px` }
          ) : {}}
          tabIndex={-1}
        >
          <Suspense fallback={<LoadingScreen />}>
            <DismissPreloaderOnMount />
            <AppRoutes
              location={deferredLocation}
              pageProps={pageProps}
              pautaEnabled={pautaEnabled}
              tableEnabled={tableEnabled}
              clearCart={clearCart}
              demoHeaderOffset={demoHeaderOffset}
            />
          </Suspense>
        </main>

        {/* Footer - NO mostrar a pàgines full-screen ni admin */}
        {!isFullScreenRoute && !isAdminRoute && (
          isComponentsCatalogTemplateRoute ? (
            null
          ) : (
            !isDevLayoutRoute && (
              <div style={isHomeRoute ? { marginTop: '-832px', position: 'relative', zIndex: 50 } : (isPortraitTablet ? { marginTop: '200px' } : undefined)}>
                <Footer />
              </div>
            )
          )
        )}

        <ScrollToTop />

        <SiteFrame />

        {(import.meta.env.DEV || isAdmin || isDevDemoRoute || isAdminRoute) && (
          <Suspense fallback={null}>
            <DebugLayer
              location={location}
              navigate={navigate}
              isAdmin={isAdmin}
              isPreview={isPreview}
              isDevDemoRoute={isDevDemoRoute}
              isFullWideSlideRoute={isFullWideSlideRoute}
              isFullWideSlideDemoRoute={isFullWideSlideDemoRoute}
              isFullScreenRoute={isFullScreenRoute}
              isEmbeddedPreview={isEmbeddedPreview}
              isHomeRoute={isHomeRoute}
              isDevHeaderRoute={isDevHeaderRoute}
              isDevLayoutRoute={isDevLayoutRoute}
              isAdminRoute={isAdminRoute}
              isPrivacyRoute={isPrivacyRoute}
              isComponentsCatalogTemplateRoute={isComponentsCatalogTemplateRoute}
              isContactSheetRoute={isContactSheetRoute}
              cartItemCount={getTotalItems()}
              onCartClick={handleCartClick}
              onUserClick={handleUserClick}
              onDebugStateChange={onDebugStateChange}
              appHeaderOffset={appHeaderOffset}
              demoHeaderOffset={demoHeaderOffset}
              baseHeaderHeight={baseHeaderHeight}
              adminBannerHeight={adminBannerHeight}
              offersHeaderHeight={offersHeaderHeight}
              isLargeScreen={isLargeScreen}
            />
          </Suspense>
        )}
        {/* GUIA VISUAL TEMPORAL: rectangle 360x800 centrat per a mòbil */}
        {isMobile && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            pointerEvents: 'none',
          }}>
            <div style={{
              width: '350px',
              height: '790px',
              border: '2px solid red',
              flexShrink: 0,
            }} />
          </div>
        )}
      </>
    )}
    </ErrorBoundary>
  );
}

export default App;
