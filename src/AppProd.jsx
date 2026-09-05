import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useProductContext } from '@/contexts/ProductContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import { useGlobalRedirect } from '@/hooks/useGlobalRedirect';
import useGlobalEffects from '@/hooks/useGlobalEffects';
import useComponentCatalogConfig from '@/hooks/useComponentCatalogConfig';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen, { DismissPreloaderOnMount } from '@/components/LoadingScreen';
import SkipLink from '@/components/SkipLink';
import OffersHeader from '@/components/OffersHeader';
import AdminBanner from '@/components/AdminBanner';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import SiteFrame from '@/components/layout/SiteFrame.jsx';
import AppRoutes from '@/routes/AppRoutes';
import { FullWideSlideHeader } from '@/routes/lazyPages';

function AppProd() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [isPortraitTablet, setIsPortraitTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth <= 1024 && window.innerHeight > window.innerWidth
  );
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(
    window.innerWidth >= 1024 && window.innerWidth <= 1366 && window.innerHeight < window.innerWidth
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, bypassUnderConstruction } = useAdmin();
  const { config: componentCatalogConfig } = useComponentCatalogConfig();
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

  const productContext = useProductContext();
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

  const { cartItems, getTotalItems, addToCart, updateQuantity, clearCart, loading, error, products } = safeProductContext;

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

  const isHomeRoute = location.pathname === '/';
  const isFullWideSlideRoute = location.pathname === '/full-wide-slide' || location.pathname === '/constructor/full-wide-slide';
  const isFullWideSlideDemoRoute = location.pathname === '/full-wide-slide-demo';
  const isDemoStyleLayoutRoute = isFullWideSlideDemoRoute || isFullWideSlideRoute;
  const isPreview = location.pathname === '/ec-preview' || location.pathname === '/ec-preview-lite';
  const isContactSheetRoute = location.pathname === '/dev/contact-sheet';
  const isEmbeddedPreview = isContactSheetRoute || (() => {
    try {
      return new URLSearchParams(location.search).get('embed') === 'contact-sheet';
    } catch {
      return false;
    }
  })();
  const isFullScreenRoute = location.pathname === '/ec-preview' || location.pathname === '/ec-preview-lite' || location.pathname === '/dev/contact-sheet' || location.pathname === '/dev/site-map' || isEmbeddedPreview;
  const isAdminRoute = ['/admin', '/index', '/promotions', '/ec-config', '/system-messages', '/fulfillment', '/fulfillment-settings', '/admin/media', '/admin-login', '/colleccio-settings', '/user-icon-picker', '/mockups', '/admin/gelato-sync', '/admin/gelato-blank', '/admin/products-overview', '/admin/draft', '/admin/draft/fulfillment-settings', '/admin/draft/mockup-settings', '/admin/draft/ruleta'].includes(location.pathname) || location.pathname.startsWith('/fulfillment/') || location.pathname.startsWith('/admin');
  const isHeroSettingsDevRoute = location.pathname === '/hero-settings';
  const isDevToolsRoute = location.pathname === '/dev-tools' || location.pathname.startsWith('/dev-tools/');
  const isDevComponentsRoute = location.pathname === '/dev-components' || location.pathname.startsWith('/proves/dev-components');
  const isComponentsCatalogTemplateRoute = location.pathname === '/plantilla-cataleg-components';
  const isDevLayoutRoute = isHeroSettingsDevRoute || isFullWideSlideDemoRoute || isDevToolsRoute || isComponentsCatalogTemplateRoute;
  const isDevHeaderRoute = location.pathname.startsWith('/proves') || isDevToolsRoute || isDevComponentsRoute || isComponentsCatalogTemplateRoute;
  const isAdminStudioRoute = location.pathname.startsWith('/admin');
  const isDevDemoRoute = isFullWideSlideDemoRoute || isFullWideSlideRoute;

  const offersHeaderVisible = !isAdminRoute && !isFullScreenRoute && !isDevLayoutRoute && !isHomeRoute && offersEnabled && !offersLoading;
  const adminBannerVisible = (isAdmin || isDevDemoRoute || isAdminRoute) && !isEmbeddedPreview;

  const baseHeaderHeight = isPortraitTablet ? 116 : (isLargeScreen ? 80 : (isMobile ? 80 : 64));
  const offersHeaderHeight = offersHeaderVisible ? 40 : 0;
  const adminBannerHeight = adminBannerVisible ? 40 : 0;
  const adminRouteDevHeaderHeight = (isAdminRoute && (isAdminStudioRoute)) ? baseHeaderHeight : 0;

  const adminRouteOffset = `${adminBannerHeight + adminRouteDevHeaderHeight}px`;
  const appHeaderOffset = `${baseHeaderHeight + offersHeaderHeight + adminBannerHeight}px`;
  const globalHeaderTopOffset = `${offersHeaderHeight + adminBannerHeight}px`;
  const demoHeaderOffset = `${adminBannerHeight}px`;

  useEffect(() => {
    try {
      if (isFullScreenRoute) return;
      const nextOffset = isAdminRoute ? adminRouteOffset : (isDemoStyleLayoutRoute ? demoHeaderOffset : appHeaderOffset);
      document.documentElement.style.setProperty('--appHeaderOffset', nextOffset);
      document.documentElement.style.setProperty('--globalHeaderTopOffset', globalHeaderTopOffset);
    } catch { /* ignore */ }
  }, [adminBannerHeight, adminRouteOffset, appHeaderOffset, demoHeaderOffset, globalHeaderTopOffset, isAdminRoute, isDemoStyleLayoutRoute, isFullScreenRoute]);

  const handleAddToCart = useCallback((product, size, quantity = 1) => addToCart(product, size, quantity), [addToCart]);
  const handleCartClick = useCallback(() => navigate('/cart'), [navigate]);
  const handleUserClick = useCallback(() => navigate('/profile'), [navigate]);
  const pageProps = useMemo(() => ({ onAddToCart: handleAddToCart, cartItems, onUpdateQuantity: updateQuantity }), [handleAddToCart, cartItems, updateQuantity]);

  const showProductsLoadingScreen = !!loading;
  const showProductsErrorScreen = !!(error && (!products || products.length === 0));

  return (
    <ErrorBoundary>
      <Helmet defaultTitle="GRAFC - Samarretes Premium | Col·leccions Exclusives" titleTemplate="%s | GRAFC" />

      {shouldRedirect && !isFullScreenRoute ? (
        <div className="w-full h-screen bg-black" />
      ) : !productContext ? (
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
            <h1 className="text-2xl font-bold mb-4">Error carregant productes</h1>
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
          {isNavigating && !isAdminRoute && !isFullScreenRoute && !shouldRedirect && <LoadingScreen />}

          {adminBannerVisible && <AdminBanner rulerInset={0} />}

          {!isFullScreenRoute && !isAdminRoute && !isDevLayoutRoute && offersHeaderVisible && (
            <OffersHeader adminBannerVisible={adminBannerVisible} />
          )}

          {/* Main Header — NO mostrar a pàgines full-screen ni admin ni dev tools */}
          {!isFullScreenRoute && !isAdminRoute && !isDemoStyleLayoutRoute && !isDevHeaderRoute && (
            isHomeRoute ? null : (
              <FullWideSlideHeader
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
            )
          )}

          <main
            id="main-content"
            className={`flex-grow ${isAdminRoute ? 'overflow-y-auto' : ''} ${!isFullScreenRoute ? 'transition-[padding-top] duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]' : ''}`}
            style={!isFullScreenRoute ? (
              isAdminRoute
                ? { paddingTop: adminRouteOffset, '--appHeaderOffset': adminRouteOffset }
                : { paddingTop: isDemoStyleLayoutRoute ? demoHeaderOffset : appHeaderOffset, '--appHeaderOffset': isDemoStyleLayoutRoute ? demoHeaderOffset : appHeaderOffset }
            ) : {}}
            tabIndex={-1}
          >
            <Suspense fallback={<LoadingScreen />}>
              <DismissPreloaderOnMount />
              <AppRoutes
                location={location}
                pageProps={pageProps}
                pautaEnabled={false}
                tableEnabled={false}
                clearCart={clearCart}
                demoHeaderOffset={demoHeaderOffset}
              />
            </Suspense>
          </main>

          {/* Footer — NO mostrar a pàgines full-screen ni admin */}
          {!isFullScreenRoute && !isAdminRoute && (
            isComponentsCatalogTemplateRoute ? (
              null
            ) : (
              !isDevLayoutRoute && (
                <div style={isHomeRoute ? { marginTop: '-832px', position: 'relative', zIndex: 50 } : (isPortraitTablet ? { marginTop: '236px' } : (isLandscapeTablet ? { marginTop: '120px' } : undefined))}>
                  <Footer />
                </div>
              )
            )
          )}

          <ScrollToTop />
          <SiteFrame />
        </>
      )}
    </ErrorBoundary>
  );
}

export default AppProd;