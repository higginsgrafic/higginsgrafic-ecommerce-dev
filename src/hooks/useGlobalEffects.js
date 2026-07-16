import { useEffect } from 'react';
import { applyDevThemeVarsFromStorage } from '@/utils/devTheme';
import { initAnalytics, trackPageView } from '@/utils/analytics';

export default function useGlobalEffects({
  location,
  navigate,
  setIsNavigating,
  setIsLargeScreen,
  shouldRedirect,
  redirectUrl,
  redirectLoading,
  bypassUnderConstruction,
  isAdmin,
}) {
  // Apply dev theme vars from storage on mount
  useEffect(() => {
    applyDevThemeVarsFromStorage();
  }, []);

  // Set up __MEASURE_HEADERS__ debug utility on mount
  useEffect(() => {
    try {
      window.__MEASURE_HEADERS__ = () => {
        const main = document.querySelector('main#main-content');
        const results = {};

        const resolveByPath = (root, path) => {
          let node = root;
          for (const step of path) {
            if (!node) return null;
            node = node.children?.[step] || null;
          }
          return node;
        };

        const toRect = (el) => {
          const r = el?.getBoundingClientRect?.();
          if (!r) return null;
          return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
        };

        const selA = 'main#main-content>div[0]>header[0]>div[0]>div[0]';
        const selB = 'main#main-content>div[0]>header[0]>div[1]>div[0]';

        const elA = resolveByPath(main, [0, 0, 0, 0]);
        const elB = resolveByPath(main, [0, 0, 1, 0]);

        results[selA] = toRect(elA);
        results[selB] = toRect(elB);

        console.log(results);
        return results;
      };
    } catch {
      // ignore
    }
  }, []);

  // Sync global redirect state to window
  useEffect(() => {
    window.__GLOBAL_REDIRECT_STATE__ = {
      shouldRedirect,
      redirectUrl,
      redirectLoading,
      bypassUnderConstruction,
      isAdmin,
      path: location.pathname
    };
  }, [shouldRedirect, redirectUrl, redirectLoading, bypassUnderConstruction, isAdmin, location.pathname]);

  // Loading state on route change
  useEffect(() => {
    setIsNavigating(true);

    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [location.pathname]);

  // Initialize analytics
  useEffect(() => {
    initAnalytics();
  }, []);

  // Track page views
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  // Track viewport size for responsive padding
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle global redirect
  useEffect(() => {
    if (redirectLoading) return;

    const enableInDev = String(import.meta?.env?.VITE_ENABLE_GLOBAL_REDIRECT_IN_DEV || '').toLowerCase() === 'true';
    const hostname = (typeof window !== 'undefined' ? window.location?.hostname : '') || '';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';

    const adminRoutes = [
      '/admin',
      '/admin-login',
      '/user-icon-picker',
      // Legacy admin routes (redirected)
      '/index',
      '/promotions',
      '/ec-config',
      '/system-messages',
      '/colleccio-settings',
      '/mockups',
      '/fulfillment',
      '/fulfillment-settings'
    ];

    const isAdminRoute = adminRoutes.includes(location.pathname) ||
                         location.pathname.startsWith('/fulfillment/') ||
                         location.pathname.startsWith('/admin');
    const isECPreview = location.pathname === '/ec-preview';
    const isECPreviewLite = location.pathname === '/ec-preview-lite';

    // Never redirect directly to the external target from here.
    // We always route through /ec-preview so the under-construction page can control
    // UX (video/click) and apply any defensive measures.
    if ((import.meta?.env?.DEV || isLocalhost) && !enableInDev) {
      // In dev, keep global redirects disabled unless explicitly enabled.
      return;
    }

    // Si hem de redirigir i no estem en una ruta admin ni ja a ec-preview-lite
    if (shouldRedirect && !isAdminRoute && !isECPreview) {
      navigate('/ec-preview', { replace: true });
      return;
    }

    // Si NO hem de redirigir però estem a ec-preview-lite, sortim
    if (!shouldRedirect && (isECPreview || isECPreviewLite)) {
      navigate('/', { replace: true });
      return;
    }
  }, [shouldRedirect, redirectUrl, redirectLoading, location.pathname, navigate, bypassUnderConstruction]);
}
