import { useEffect } from 'react';
import { installLayoutMetricsProbe } from '@/utils/layoutMetrics';

export default function useRouteLayout({
  location,
  isAdmin,
  isFullWideSlideRoute,
  isFullWideSlideDemoRoute,
  debugOverlaysEnabled,
  rulersOverlayEnabled,
  offersEnabled,
  offersLoading,
  isLargeScreen,
}) {
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

  const isFullScreenRoute = location.pathname === '/ec-preview' || location.pathname === '/ec-preview-lite' || location.pathname === '/dev/contact-sheet' || location.pathname === '/dev/site-map' || isEmbeddedPreview;
  const isAdminRoute = ['/admin', '/index', '/promotions', '/ec-config', '/system-messages', '/fulfillment', '/fulfillment-settings', '/admin/media', '/admin-login', '/colleccio-settings', '/user-icon-picker', '/mockups', '/admin/gelato-sync', '/admin/gelato-blank', '/admin/products-overview', '/admin/draft', '/admin/draft/fulfillment-settings', '/admin/draft/mockup-settings', '/admin/draft/ruleta'].includes(location.pathname) || location.pathname.startsWith('/fulfillment/') || location.pathname.startsWith('/admin');
  const isHeroSettingsDevRoute = location.pathname === '/hero-settings';
  const isDevToolsRoute = location.pathname === '/dev-tools' || location.pathname.startsWith('/dev-tools/');
  const isDevComponentsRoute = location.pathname === '/dev-components' || location.pathname.startsWith('/proves/dev-components');
  const isComponentsCatalogTemplateRoute = location.pathname === '/plantilla-cataleg-components';

  const isDevLayoutRoute = isHeroSettingsDevRoute || isDevDemoRoute || isDevToolsRoute || isComponentsCatalogTemplateRoute;
  const isDevHeaderRoute =
    location.pathname.startsWith('/proves') ||
    isDevToolsRoute ||
    isDevComponentsRoute ||
    isComponentsCatalogTemplateRoute;

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
          viewport: {
            innerWidth: round2(window.innerWidth),
            clientWidth: round2(document.documentElement.clientWidth),
            visualWidth: round2(window.visualViewport?.width ?? window.innerWidth),
            devicePixelRatio: round2(window.devicePixelRatio || 1),
            large1024: window.innerWidth >= 1024,
          },
          app: {
            isLargeScreen,
            baseHeaderHeight,
            adminBannerHeight,
            rulerInset,
            appHeaderOffset,
            demoHeaderOffset,
            globalHeaderTopOffset,
          },
          belt2: {
            xL: round2(xL),
            xR: round2(xR),
            width: round2(xR - xL),
          },
        };
        console.table(result.viewport);
        console.table(result.app);
        console.table(result.belt2);
        return result;
      };
    } catch {
      // ignore
    }
  }, [adminBannerHeight, adminRouteOffset, appHeaderOffset, baseHeaderHeight, demoHeaderOffset, globalHeaderTopOffset, isAdminRoute, isDemoStyleLayoutRoute, isFullScreenRoute, isLargeScreen, rulerInset]);

  return {
    isHomeRoute,
    isPreview,
    isDemoStyleLayoutRoute,
    isDevDemoRoute,
    isContactSheetRoute,
    isEmbeddedPreview,
    isFullScreenRoute,
    isAdminRoute,
    isHeroSettingsDevRoute,
    isDevToolsRoute,
    isDevComponentsRoute,
    isComponentsCatalogTemplateRoute,
    isDevLayoutRoute,
    isDevHeaderRoute,
    isAdminStudioRoute,
    devHeaderVisible,
    offersHeaderVisible,
    baseHeaderHeight,
    heroSettingsDevHeaderHeight,
    offersHeaderHeight,
    adminBannerVisible,
    adminBannerHeight,
    offersHeaderTop,
    adminRouteDevHeaderHeight,
    rulersOverlayActive,
    rulerInset,
    adminRouteOffset,
    appHeaderOffset,
    globalHeaderTopOffset,
    demoHeaderOffset,
  };
}
