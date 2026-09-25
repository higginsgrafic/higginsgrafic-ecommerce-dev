import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback, useTransition, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useProductContext } from '@/contexts/ProductContext';
import { computeLayoutModel, headerHeightFor } from '@/utils/layoutModel';
import { useAdmin } from '@/contexts/AdminContext';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import { useGlobalRedirect } from '@/hooks/useGlobalRedirect';
import useGlobalEffects from '@/hooks/useGlobalEffects';
import useDeviceLayout from '@/hooks/useDeviceLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen, { DismissPreloaderOnMount } from '@/components/LoadingScreen';
import SkipLink from '@/components/SkipLink';
import OffersHeader from '@/components/OffersHeader';
import AdminBanner from '@/components/AdminBanner';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import { COLLECTIONS_MENU } from '@/config/collectionVertical';
import SiteFrame from '@/components/layout/SiteFrame.jsx';
import useComponentCatalogConfig from '@/hooks/useComponentCatalogConfig';
import AppRoutes from '@/routes/AppRoutes';
import * as P from '@/routes/lazyPages';
import BottomTabBar from '@/components/BottomTabBar';
import CollectionIconsBar from '@/components/CollectionIconsBar';
import { MobileCercadorSheet } from '@/components/MobileCercadorSheet';

const DebugLayer = lazy(() => import('@/components/DebugLayer'));
const MarcNavegador = lazy(() => import('@/components/dev/MarcNavegador'));


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

  // ESCALFAR LES FONTS DEL MEGASLIDE A L'ARRENCADA.
  //
  // Les cares Roboto Condensed 300/700 i Roboto 300 nomes les fa servir el
  // contingut del megaslide: amb `display=swap` no es baixen fins que el
  // panell no pinta, i en obrir-se el text canviava de mida (mesurat el
  // 25/09/2026 a 1920: la filera del cercador anava de 105 a 126 px d'alcada
  // quan la cara arribava, i el reflow arrossegava la graella de dibuixos i
  // el calibratge: el fart de l'obertura). Pre-carregades aqui, a l'obertura
  // ja hi son i el contingut neix amb les mides bones.
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return undefined;
    const cares = [
      '300 16px "Roboto Condensed"',
      '700 16px "Roboto Condensed"',
      '300 16px "Roboto"',
    ];
    cares.forEach((cara) => { document.fonts.load(cara).catch(() => {}); });
    return undefined;
  }, []);
  const {
    isLargeScreen,
    isPortraitTablet,
    isLandscapeTablet,
    isMobile,
    viewportWidth,
    viewportHeight,
  } = useDeviceLayout();

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
  // L'inici NOU, que es construeix al costat (`PLA-arquitectura-nova.md` §6).
  // Te el seu propi aire de seccions, i el peu no hi pot portar els calibratges
  // de la pagina vella: alla son `-832px` a la ruta `/` i un numero per
  // dispositiu a la resta, i el resultat es que el peu toca o tapa el poster.
  const isNouIniciRoute = location.pathname === '/nova/inici';
  // Fulles de colleccio: son les que tenen el bloc final amb el rail estatic, i
  // on el peu s'ha de posar a la distancia del marge lateral.
  const isCollectionRoute = COLLECTIONS_MENU.some((c) => c.href === location.pathname || location.pathname.startsWith(`${c.href}/`));
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

  // Obrir el cistell: abans es navegava a '/cart', una ruta que NO existeix,
  // així que la pestanya "Cistell" del mòbil i la icona del cistell obrien una
  // pàgina de "no trobat". El cistell viu dins del mega-slide, que s'obre amb
  // aquest esdeveniment (és el mateix que fan servir tots els botons
  // "afegir al cistell").
  const handleCartClick = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
        detail: { source: 'app-cart-click' },
      }));
    } catch {
      // ignore
    }
  }, []);

  // La ruta real del perfil és '/perfil' (vegeu AppRoutes.jsx). Abans
  // s'apuntava a '/profile', que no existeix: la pestanya "Usuari" obria un 404.
  const handleUserClick = useCallback(() => navigate('/perfil'), [navigate]);
  const pageProps = useMemo(() => ({ onAddToCart: handleAddToCart, cartItems, onUpdateQuantity: updateQuantity }), [handleAddToCart, cartItems, updateQuantity]);

  // El pagament NO és pantalla completa: volem que la capçalera del mega-slide
  // segueixi visible (la botiga vol semblar una aplicació i el mega-slide n'és
  // el marc). La pàgina de pagament entra per sota seu.
  const isCheckoutRoute = location.pathname === '/checkout';
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

  // L'alcada base de capcalera surt del model unic (`utils/layoutModel`).
  // Nomes depen de les mides de la finestra, aixi que es pot calcular aqui
  // dalt; els offsets que hi sumen ofertes i banners es calculen mes avall,
  // quan ja se sap si es veuen.
  const baseHeaderHeight = headerHeightFor({
    isMobile, isPortraitTablet, isLargeScreen, isDesktop: isLargeScreen,
  });
  // La transicio del `padding-top` del <main> serveix per acompanyar els
  // canvis de capcalera (obrir el megaslide, banners). Al PRIMER pintat, pero,
  // el layout encara s'assenta i la transicio convertia aquell assentament en
  // un llimac de 350 ms: es veia moure tota la pagina. L'activem un cop
  // pintat, aixi el muntatge inicial es quiet i la resta segueix animant-se.
  const [transicionsLayoutActives, setTransicionsLayoutActives] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setTransicionsLayoutActives(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const heroSettingsDevHeaderHeight = isDevHeaderRoute ? baseHeaderHeight : 0;
  const offersHeaderHeight = offersHeaderVisible ? 40 : 0;
  // LA BARRA DE DESENVOLUPAMENT NO ENTRA A LES PAGINES DEL LLOC.
  //
  // Era la franja vermella de 40 px enganxada a dalt de tot. Com que nomes la
  // veu l'administrador — o sigui, nosaltres mentre mesurem —, la pagina no
  // s'estava mesurant mai a la seva alcada de veritat: a 1920 les divisions de
  // la inici donaven 11/28 amb la barra i 3/8 sense, i la hero hi perdia 40 px
  // de lloc. A produccio, un visitant no la te.
  //
  // Ara nomes surt a les pagines propies de l'aplicacio (administracio i
  // eines). A les pagines publiques no hi es. L'acces a /admin, que abans
  // donava aquesta barra, el porta la icona de la capçalera.
  const esPaginaDeLloc = !(isAdminRoute || isDevLayoutRoute || isDevHeaderRoute || isFullScreenRoute);
  const adminBannerVisible = !esPaginaDeLloc
    && (isAdmin || isAdminRoute || isDevDemoRoute)
    && !isEmbeddedPreview;
  const adminBannerHeight = adminBannerVisible ? 40 : 0;
  const offersHeaderTop = adminBannerVisible ? adminBannerHeight : 0;
  const adminRouteDevHeaderHeight = (isAdminRoute && devHeaderVisible) ? baseHeaderHeight : 0;

  const isPrivacyRoute = location.pathname === '/privacy';

  // Ara ja se sap tot el que influeix en els offsets (ofertes, banners, rulers).
  const layoutModel = useMemo(() => computeLayoutModel({
    deviceLayout: {
      isMobile, isPortraitTablet, isLandscapeTablet,
      isDesktop: isLargeScreen, isLargeScreen,
      viewportWidth, viewportHeight,
    },
    alcadaOfertesPx: offersHeaderHeight,
    alcadaBannerAdminPx: adminBannerHeight,
    rulerInsetPx: rulerInset,
  }), [isMobile, isPortraitTablet, isLandscapeTablet, isLargeScreen, viewportWidth, viewportHeight, offersHeaderHeight, adminBannerHeight, rulerInset]);

  const adminRouteOffset = `${adminBannerHeight + adminRouteDevHeaderHeight + rulerInset}px`;
  const appHeaderOffset = layoutModel.appHeaderOffset;
  const globalHeaderTopOffset = layoutModel.globalHeaderTopOffset;
  const demoHeaderOffset = `${adminBannerHeight + rulerInset}px`;

  // useLayoutEffect i no useEffect: aquestes variables son la base de tot el
  // layout (la capcalera, la hero i els paddings hi pengen). Publicant-les
  // DESPRES del pintat, la pagina es pintava amb el valor vell i es
  // recol-locava al segon pas, i es veia moure tot.
  useLayoutEffect(() => {
    try {
      if (isFullScreenRoute) return;
      const nextOffset = isAdminRoute ? adminRouteOffset : (isDemoStyleLayoutRoute ? demoHeaderOffset : appHeaderOffset);
      document.documentElement.style.setProperty('--appHeaderOffset', nextOffset);
      document.documentElement.style.setProperty('--globalHeaderTopOffset', globalHeaderTopOffset);
      document.documentElement.style.setProperty('--rulerInset', `${rulerInset}px`);
      // L'alcada de la FILA del logo: la fa servir l'overlay de l'administracio,
      // que va a la punta esquerra del header i s'ha de centrar amb la fila (no
      // amb el header sencer: a la vertical tambe conte el megaslide).
      document.documentElement.style.setProperty('--capcalera-fila', `${layoutModel.filaCapcaleraPx}px`);
    } catch { /* ignore */ }
  }, [adminBannerHeight, adminRouteOffset, appHeaderOffset, baseHeaderHeight, demoHeaderOffset, globalHeaderTopOffset, isAdminRoute, isDemoStyleLayoutRoute, isFullScreenRoute, isLargeScreen, layoutModel.filaCapcaleraPx, rulerInset]);

  return (
    <ErrorBoundary>
      {/* Títols per defecte del lloc. Provenen de l'antiga aplicació de
          producció (AppProd.jsx, ja eliminada): aquest fitxer no els tenia i,
          en unificar les dues aplicacions, s'haurien perdut (és el que veuen
          Google i les pestanyes del navegador). */}
      <Helmet defaultTitle="GRAFC - Samarretes Premium | Col·leccions Exclusives" titleTemplate="%s | GRAFC" />

      {/* NOTA: aqui hi havia la branca `shouldRedirect` (pantalla negra) que es
          va portar d'AppProd.jsx en unificar les dues aplicacions. S'ha tret
          perque bloquejava tambe el desenvolupament: l'aplicació original no
          la tenia a proposit. Si cal recuperar-la, ha de ser una decisió
          conscient i condicionada a l'entorn, no un port automatic. */}
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
          {/* EL CANVI DE RUTA TAMBé VA AMB LA PEÇA DE DINS (25/09/2026).
              Aquest overlay s'encenia 300 ms a cada canvi de ruta
              (`useGlobalEffects`), i amb la peça de la PDP trigant una mica mes
              que allo, la pantalla sencera es posava blanca i allo semblava una
              recarrega. Es la MATEIXA causa que el fallback del Suspense: es la
              mateixa peça i el mateix arranjament. */}
          {isNavigating && !isAdminRoute && !isFullScreenRoute && !shouldRedirect && <LoadingScreen variant="inpage" />}

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
            viewportWidth={viewportWidth}
            viewportHeight={viewportHeight}
          />
      )}

        <main
          id="main-content"
          className={`flex-grow ${isAdminRoute ? 'overflow-y-auto' : ''} ${(!isFullScreenRoute && transicionsLayoutActives) ? 'transition-[padding-top] duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]' : ''} ${layoutInspectorActive ? 'debug-containers' : ''}`}
          style={!isFullScreenRoute ? (
            isAdminRoute
              ? { paddingTop: adminRouteOffset, paddingLeft: `${rulerInset}px`, '--appHeaderOffset': adminRouteOffset, '--rulerInset': `${rulerInset}px` }
              : {
                paddingTop: isDemoStyleLayoutRoute ? demoHeaderOffset : appHeaderOffset,
                paddingLeft: `${rulerInset}px`,
                paddingBottom: isMobile && !isAdminRoute ? (isHomeRoute ? '152px' : '64px') : undefined,
                '--appHeaderOffset': isDemoStyleLayoutRoute ? demoHeaderOffset : appHeaderOffset,
                '--rulerInset': `${rulerInset}px`,
                // Les fulles de colleccio tenen un rail horitzontal mes ample
                // que la seva cel·la (el `TambeRail` de `TramFinal`): el seu
                // contingut ja es retalla dins seu, pero la seva CAIXA feia
                // desbordar la pagina (fins a 98 px a 1280 i 1440). Amb aixo la
                // pagina no es pot desplaçar lateralment i la capcalera fixa
                // deixa de quedar tallada a la dreta. `clip` i no `hidden`
                // perque no crea cap contenidor de desplaçament ni toca res
                // vertical.
                overflowX: 'clip',
              }
          ) : {}}
          tabIndex={-1}
        >
          <Suspense fallback={<LoadingScreen variant="inpage" />}>
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

        {/* Footer - NO mostrar a pàgines full-screen, ni a l'admin, ni mentre
            s'està pagant (aquí no volem convidar ningú a marxar) */}
        {!isFullScreenRoute && !isAdminRoute && !isCheckoutRoute && (
          isComponentsCatalogTemplateRoute ? (
            null
          ) : (
            !isDevLayoutRoute && (
              <div style={isNouIniciRoute
                // L'aire del peu, amb el MATEIX token que les seccions de la
                // pagina nova.
                ? { marginBlockStart: 'var(--esp-4)' }
                : isHomeRoute
                ? { marginTop: '-832px', position: 'relative', zIndex: 50 }
                : (isCollectionRoute
                  // A les fulles de colleccio el contingut acaba amb el rail i la
                  // pagina publica `--hg-marge-peu` (la distancia que falta perque
                  // el peu quedi a la mateixa distancia que el marge lateral).
                  ? { marginTop: 'var(--hg-marge-peu, 24px)' }
                  : (isPortraitTablet ? { marginTop: '236px' } : (isLandscapeTablet ? { marginTop: '120px' } : undefined)))}>
                <Footer />
              </div>
            )
          )
        )}

        {/* Mobile bottom tab bar + cercador sheet */}
        {isMobile && !isFullScreenRoute && !isAdminRoute && (
          <>
            <MobileCercadorSheet />
            {isHomeRoute && <CollectionIconsBar />}
            <BottomTabBar />
          </>
        )}

        <ScrollToTop />

        <SiteFrame />

        {(!isMobile && (import.meta.env.DEV || isAdmin || isDevDemoRoute || isAdminRoute)) && (
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

        {/* EL MARC DEL NAVEGADOR, si l'URL el demana (`?navegador=1`). Es una
            peça del DOM per poder-la seleccionar i ajustar des del DevTools. */}
        <Suspense fallback={null}>
          <MarcNavegador />
        </Suspense>
      </>
    )}
    </ErrorBoundary>
  );
}

export default App;
