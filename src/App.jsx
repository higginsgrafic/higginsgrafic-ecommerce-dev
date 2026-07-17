import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProductContext } from '@/contexts/ProductContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminTools } from '@/contexts/AdminToolsContext';
import { installLayoutMetricsProbe } from '@/utils/layoutMetrics';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import { useGlobalRedirect } from '@/hooks/useGlobalRedirect';
import { useDebugOverlays } from '@/hooks/useDebugOverlays';
import useMegaStripeDebugState from '@/hooks/useMegaStripeDebugState';
import useDebugToggles from '@/hooks/useDebugToggles';
import useExportModal from '@/hooks/useExportModal';
import useContentLayout from '@/hooks/useContentLayout';
import useGlobalEffects from '@/hooks/useGlobalEffects';
import useStripeOverlayDebug from '@/hooks/useStripeOverlayDebug';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import SkipLink from '@/components/SkipLink';
import OffersHeader from '@/components/OffersHeader';
import AdminBanner from '@/components/AdminBanner';
import DevHeader from '@/components/DevHeader';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import SiteFrame from '@/components/layout/SiteFrame.jsx';
import useComponentCatalogConfig from '@/hooks/useComponentCatalogConfig';
import useLayoutInspector from '@/hooks/useLayoutInspector';
import { megaStripeRefPresets } from '@/data/megaStripeRefPresets';
import AppRoutes from '@/routes/AppRoutes';
import DebugButtonsBar from '@/components/dev/DebugButtonsBar';
import PdpControlsPanel from '@/components/dev/PdpControlsPanel';
import * as P from '@/routes/lazyPages';


function App() {
  const { config: componentCatalogConfig } = useComponentCatalogConfig();
  const [isNavigating, setIsNavigating] = useState(false);
  const { exportCopyStatus, setExportCopyStatus, exportTab, setExportTab, exportModalOpen, setExportModalOpen, exportModalTitle, setExportModalTitle, exportModalText, setExportModalText } = useExportModal();

  const toggleSlidePreset = (nextPresetId) => {
    if (!nextPresetId) return;
    if (slideOpen && slidePresetId === nextPresetId) {
      setSlideOpen(false);
      setSlidePresetId('');
      return;
    }

    setSlidePresetId(nextPresetId);
    setSlideOpen(true);
  };

  useEffect(() => {
    const onOpenSlidePreset = (event) => {
      const presetId = event?.detail?.presetId;
      if (!presetId || typeof presetId !== 'string') return;
      setSlidePresetId(presetId);
      setSlideOpen(true);
    };

    window.addEventListener('hg:open-slide-preset', onOpenSlidePreset);
    return () => window.removeEventListener('hg:open-slide-preset', onOpenSlidePreset);
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const { layoutInspectorEnabled, setLayoutInspectorEnabled, guidesEnabled, setGuidesEnabled, copiedDesign, setCopiedDesign, belt2GuidesEnabled, setBelt2GuidesEnabled, megaAccordionLocked, setMegaAccordionLocked } = useDebugToggles({ locationSearch: location.search });
  const beltEnabledFromUrl = (() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.has('belt') && sp.get('belt') !== '0';
    } catch {
      return false;
    }
  })();
  const megaStripeState = useMegaStripeDebugState({ beltEnabledFromUrl, locationPathname: location.pathname });
  const [cistellExpanded, setCistellExpanded] = useState(false);
  const [cistellLayout, setCistellLayout] = useState(1);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

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
  const HUD_DEBUG_BOTTOM_RESERVE_PX = 104;

  const { snapshot: stripeOverlayDebugSnapshot, debugOn: stripeOverlayDebugOn } = useStripeOverlayDebug(location.search);

  const productContext = useProductContext();
  const { isAdmin, bypassUnderConstruction } = useAdmin();
  const { tools, toggleTool } = useAdminTools();
  const {
    debugsEnabled: debugOverlaysEnabled,
    rulersEnabled: rulersOverlayEnabled,
    pdpControlsEnabled,
    pautaEnabled,
    setPautaEnabled,
    tableEnabled,
    setTableEnabled,
    pautaOpacity,
    setPautaOpacity,
    tableOpacity,
    setTableOpacity,
  } = useDebugOverlays();
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
  const layoutInspectorActive = debugOverlaysEnabled && !isEmbeddedPreview && (isAdmin || isDevDemoRoute)
    ? layoutInspectorEnabled
    : false;
  const layoutInspectorWrap = Boolean(layoutInspectorActive);

  const {
    selectedElement,
    selectedContainerToken,
    copyContainerStatus,
    selectionStatus,
    layoutInspectorPickEnabled,
    setLayoutInspectorPickEnabled,
    clicksEnabled,
    setClicksEnabled,
    clickMarks,
    setClickMarks,
    debugButtonsWrapRef,
    copySelectedContainer,
  } = useLayoutInspector({ layoutInspectorActive });

  useEffect(() => {
    const next = String(megaStripeState.megaStripeRefSrc || '');
    megaStripeState.setMegaStripeRef2Src((prev) => {
      const cur = String(prev || '');
      if (cur === next) return prev;
      return next;
    });
  }, [megaStripeState.megaStripeRefSrc]);

  const { fullWideSlideManualEnabled, writeFullWideSlideDemoControls, contentContainerLeft, contentContainerRight } = useContentLayout({ isFullWideSlideDemoRoute, isHomeRoute, locationPathname: location.pathname });

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

  const baseHeaderHeight = isLargeScreen ? 80 : 64;
  const heroSettingsDevHeaderHeight = isDevHeaderRoute ? baseHeaderHeight : 0;
  const offersHeaderHeight = offersHeaderVisible ? 40 : 0;
  const adminBannerVisible = (isAdmin || isDevDemoRoute || isAdminRoute) && !isEmbeddedPreview;
  const adminBannerHeight = adminBannerVisible ? 40 : 0;
  const offersHeaderTop = adminBannerVisible ? adminBannerHeight : 0;
  const adminRouteDevHeaderHeight = (isAdminRoute && devHeaderVisible) ? baseHeaderHeight : 0;

  const rulersOverlayActive = rulersOverlayEnabled && (isAdmin || isDevDemoRoute || isFullWideSlideRoute) && location.pathname !== '/ec-preview' && location.pathname !== '/ec-preview-lite' && !isEmbeddedPreview;
  const rulerInset = rulersOverlayActive ? 18 : 0;

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
      if (import.meta.env.DEV) installLayoutMetricsProbe();
      window.__HG_ZOOM_LAYOUT_PROBE__ = () => {
        const round2 = (v) => Math.round(v * 100) / 100;
        const rootStyle = window.getComputedStyle(document.documentElement);
        const xL = parseFloat(rootStyle.getPropertyValue('--belt2-xL'));
        const xR = parseFloat(rootStyle.getPropertyValue('--belt2-xR'));
        const result = {
          viewport: { innerWidth: round2(window.innerWidth), clientWidth: round2(document.documentElement.clientWidth), visualWidth: round2(window.visualViewport?.width ?? window.innerWidth), devicePixelRatio: round2(window.devicePixelRatio || 1), large1024: window.innerWidth >= 1024 },
          app: { isLargeScreen, baseHeaderHeight, adminBannerHeight, rulerInset, appHeaderOffset, demoHeaderOffset, globalHeaderTopOffset },
          belt2: { xL: round2(xL), xR: round2(xR), width: round2(xR - xL) },
        };
        console.table(result.viewport); console.table(result.app); console.table(result.belt2);
        return result;
      };
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

          {import.meta.env.DEV && devHeaderVisible && (
            <DevHeader
              isPreview={isPreview}
              isAdmin={isAdmin}
              isDevDemoRoute={isDevDemoRoute}
              isFullWideSlideRoute={isFullWideSlideRoute}
              adminBannerHeight={adminBannerHeight}
              rulerInset={rulerInset}
              cartItemCount={getTotalItems()}
              onCartClick={handleCartClick}
              onUserClick={handleUserClick}
            />
          )}

      {/* Main Header - NO mostrar a pàgines full-screen ni admin ni a dev tools */}
      {!isFullScreenRoute && !isAdminRoute && !isDemoStyleLayoutRoute && !isDevHeaderRoute && (
        isHomeRoute ? null : (
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
          />
        )
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
            <AppRoutes
              location={location}
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
              <div style={isHomeRoute ? { marginTop: '-532px', position: 'relative', zIndex: 50 } : undefined}>
                <Footer />
              </div>
            )
          )
        )}

        <ScrollToTop />

        {import.meta.env.DEV && rulersOverlayActive && (
          <P.DevGuidesOverlay
            guidesEnabled={guidesEnabled}
            zIndex={1300000}
          />
        )}

            <P.MegaStripeHud
              megaStripeState={megaStripeState}
              isFullWideSlideDemoRoute={isFullWideSlideDemoRoute}
              isFullWideSlideRoute={isFullWideSlideRoute}
              cistellExpanded={cistellExpanded}
              setCistellExpanded={setCistellExpanded}
              cistellLayout={cistellLayout}
              setCistellLayout={setCistellLayout}
              navigate={navigate}
              location={location}
              stripeOverlayDebugSnapshot={stripeOverlayDebugSnapshot}
              stripeOverlayDebugOn={stripeOverlayDebugOn}
              megaStripeRefPresets={megaStripeRefPresets}
              HUD_DEBUG_BOTTOM_RESERVE_PX={HUD_DEBUG_BOTTOM_RESERVE_PX}
              exportCopyStatus={exportCopyStatus}
              setExportCopyStatus={setExportCopyStatus}
              exportTab={exportTab}
              setExportTab={setExportTab}
              exportModalOpen={exportModalOpen}
              setExportModalOpen={setExportModalOpen}
              exportModalTitle={exportModalTitle}
              setExportModalTitle={setExportModalTitle}
              exportModalText={exportModalText}
              setExportModalText={setExportModalText}
              belt2GuidesEnabled={belt2GuidesEnabled}
              setBelt2GuidesEnabled={setBelt2GuidesEnabled}
              megaAccordionLocked={megaAccordionLocked}
              setMegaAccordionLocked={setMegaAccordionLocked}
              debugOverlaysEnabled={debugOverlaysEnabled}
              guidesEnabled={guidesEnabled}
              setGuidesEnabled={setGuidesEnabled}
              isAdmin={isAdmin}
              isDevDemoRoute={isDevDemoRoute}
              isEmbeddedPreview={isEmbeddedPreview}
              layoutInspectorActive={layoutInspectorActive}
              setLayoutInspectorEnabled={setLayoutInspectorEnabled}
            />

                {debugOverlaysEnabled && (isAdmin || isDevDemoRoute || isFullWideSlideRoute) && location.pathname !== '/ec-preview' && location.pathname !== '/ec-preview-lite' && !isEmbeddedPreview ? (
                  <DebugButtonsBar
                    debugButtonsWrapRef={debugButtonsWrapRef}
                    clicksEnabled={clicksEnabled}
                    setClicksEnabled={setClicksEnabled}
                    layoutInspectorActive={layoutInspectorActive}
                    setLayoutInspectorEnabled={setLayoutInspectorEnabled}
                    selectedContainerToken={selectedContainerToken}
                    copyContainerStatus={copyContainerStatus}
                    selectionStatus={selectionStatus}
                    copySelectedContainer={copySelectedContainer}
                    guidesEnabled={guidesEnabled}
                    setGuidesEnabled={setGuidesEnabled}
                    belt2GuidesEnabled={belt2GuidesEnabled}
                    setBelt2GuidesEnabled={setBelt2GuidesEnabled}
                    megaAccordionLocked={megaAccordionLocked}
                    setMegaAccordionLocked={setMegaAccordionLocked}
                  />
                ) : null}

            <SiteFrame />
            {import.meta.env.DEV && <P.BeltReferenceOverlay enabled={belt2GuidesEnabled} />}

            {import.meta.env.DEV && (pautaEnabled || tableEnabled) && (location.pathname !== '/checkout' || tableEnabled) && (
              <P.Pauta4ColsOverlay
                overlay
                pautaEnabled={pautaEnabled}
                tableEnabled={tableEnabled}
                pautaOpacity={pautaOpacity}
                tableOpacity={tableOpacity}
                gutterX="7.5px"
                topOffset={isFullScreenRoute ? '0px' : appHeaderOffset}
                numCols={(isHomeRoute || location.pathname === '/constructor/tdp' || location.pathname === '/tdp') ? 3 : 4}
                numRows={isHomeRoute ? 280 : (location.pathname.startsWith('/constructor/colleccio') ? 160 : (location.pathname.includes('pdp') ? 70 : 90))}
                canvasAspect={isHomeRoute ? [2642, 20869] : (location.pathname.startsWith('/constructor/colleccio') ? [2642, 11928] : (location.pathname.includes('pdp') ? [2642, 5217] : [2642, 6708]))}
              />
            )}

            {clicksEnabled && clickMarks.length > 0 && (
              <div
                className="fixed inset-0 z-[99998] pointer-events-none debug-exempt"
                data-dev-overlay="true"
              >
                {clickMarks.map((m) => (
                  <div
                    key={m.t}
                    style={{
                      position: 'absolute',
                      left: m.x,
                      top: m.y,
                      width: 10,
                      height: 10,
                      borderRadius: 9999,
                      background: 'rgba(0,0,0,0.65)',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </div>
            )}

            {pdpControlsEnabled && (
              <PdpControlsPanel
                pautaEnabled={pautaEnabled}
                setPautaEnabled={setPautaEnabled}
                pautaOpacity={pautaOpacity}
                setPautaOpacity={setPautaOpacity}
                tableEnabled={tableEnabled}
                setTableEnabled={setTableEnabled}
                tableOpacity={tableOpacity}
                setTableOpacity={setTableOpacity}
                isPdpConstructorRoute={location.pathname === '/constructor/pdp'}
                copiedDesign={copiedDesign}
                setCopiedDesign={setCopiedDesign}
              />
            )}
      </>
    )}
    </ErrorBoundary>
  );
}

export default App;
