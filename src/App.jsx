import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useProductContext } from '@/contexts/ProductContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminTools } from '@/contexts/AdminToolsContext';
import { initAnalytics, trackPageView } from '@/utils/analytics';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import { useGlobalRedirect } from '@/hooks/useGlobalRedirect';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import SkipLink from '@/components/SkipLink';
import OffersHeader from '@/components/OffersHeader';
import AdminBanner from '@/components/AdminBanner';
import Header from '@/components/Header';
import AdidasInspiredHeader from '@/components/AdidasInspiredHeader';
import NikeInspiredHeader from '@/components/NikeInspiredHeader';
import DevHeader from '@/components/DevHeader';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import Checkout from '@/components/Checkout';
import SupabaseCollectionRoute from '@/pages/SupabaseCollectionRoute.jsx';
import DevGuidesOverlay from '@/components/DevGuidesOverlay.jsx';
import SlideShell from '@/components/SlideShell';
import useSlidesConfig from '@/hooks/useSlidesConfig';

const FulfillmentPage = lazy(() => import('@/pages/FulfillmentPage'));
const FulfillmentSettingsPage = lazy(() => import('@/pages/FulfillmentSettingsPage'));
const ProductDetailPageEnhanced = lazy(() => import('@/pages/ProductDetailPageEnhanced'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));

// Lazy loading de pàgines per millorar performance (code splitting)
const Home = lazy(() => import('@/pages/Home'));
const NewPage = lazy(() => import('@/pages/NewPage'));
const OrderTrackingPage = lazy(() => import('@/pages/OrderTrackingPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const OffersPage = lazy(() => import('@/pages/OffersPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const ShippingPage = lazy(() => import('@/pages/ShippingPage'));
const SizeGuidePage = lazy(() => import('@/pages/SizeGuidePage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const CreativeCommonsPage = lazy(() => import('@/pages/CreativeCommonsPage'));

// Outcasted now uses the config-driven CollectionPage

const AdminStudioHomePage = lazy(() => import('@/pages/AdminStudioHomePage'));
const AdminDemosPage = lazy(() => import('@/pages/AdminDemosPage'));
const IndexPage = lazy(() => import('@/pages/IndexPage'));
const ECPreviewPage = lazy(() => import('@/pages/ECPreviewPage'));
const ECPreviewLitePage = lazy(() => import('@/pages/ECPreviewLitePage'));
const PromotionsManagerPage = lazy(() => import('@/pages/PromotionsManagerPage'));
const ECConfigPage = lazy(() => import('@/pages/ECConfigPage'));
const SystemMessagesPage = lazy(() => import('@/pages/SystemMessagesPage'));
const AdminMediaPage = lazy(() => import('@/pages/AdminMediaPage'));
const UserIconPicker = lazy(() => import('@/pages/UserIconPicker'));
const HeroSettingsPage = lazy(() => import('@/pages/HeroSettingsPage'));
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'));
const ColleccioSettingsPage = lazy(() => import('@/pages/ColleccioSettingsPage'));
const DocumentationFilesPage = lazy(() => import('@/pages/DocumentationFilesPage'));
const GelatoTemplatesPage = lazy(() => import('@/pages/GelatoTemplatesPage'));
const MockupsManagerPage = lazy(() => import('@/pages/MockupsManagerPage'));
const GelatoProductsManagerPage = lazy(() => import('@/pages/GelatoProductsManagerPage'));
const ProductsOverviewPage = lazy(() => import('@/pages/ProductsOverviewPage'));
const GelatoBlankProductsPage = lazy(() => import('@/pages/GelatoBlankProductsPage'));
const AdminUploadPage = lazy(() => import('@/pages/AdminUploadPage'));
const UnitatsCanviPage = lazy(() => import('@/pages/UnitatsCanviPage'));
const RuletaDemoPage = lazy(() => import('@/pages/RuletaDemoPage'));
const AdminControlsPage = lazy(() => import('@/pages/AdminControlsPage'));
const AdminStudioLayout = lazy(() => import('@/components/AdminStudioLayout'));
const FullWideSlidePage = lazy(() => import('@/pages/FullWideSlidePage'));
const PlantillaCatalegComponentsPage = lazy(() => import('@/pages/PlantillaCatalegComponentsPage'));

const NikeTambePage = lazy(() => import('@/pages/NikeTambePage.jsx'));
const AdidasDemoPage = lazy(() => import('@/pages/AdidasDemoPage'));
const AdidasPdpPage = lazy(() => import('@/pages/AdidasPdpPage.jsx'));
const AdidasPdpTdpPage = lazy(() => import('@/pages/AdidasPdpTdpPage.jsx'));
const DevLinksPage = lazy(() => import('@/pages/DevLinksPage'));
const DevComponentsCatalogPage = lazy(() => import('@/pages/DevComponentsCatalogPage'));
 const DevLayoutBuilderPage = lazy(() => import('@/pages/DevLayoutBuilderPage'));
const TheHumanInsidePage = lazy(() => import('@/pages/TheHumanInsidePage'));
const LabDemosPage = lazy(() => import('@/pages/LabDemosPage.jsx'));
const LabWipPage = lazy(() => import('@/pages/LabWipPage.jsx'));
const LabHomePage = lazy(() => import('@/pages/LabHomePage.jsx'));
const AdminWipPage = lazy(() => import('@/pages/AdminWipPage.jsx'));
const AdminPlantillesPage = lazy(() => import('@/pages/AdminPlantillesPage.jsx'));

// Pàgines administratives
const AppsPage = lazy(() => import('@/pages/AppsPage'));
const DocumentationPage = lazy(() => import('@/pages/DocumentationPage'));

const devHexToHslTriplet = (hex) => {
  const raw = (hex || '').toString().trim();
  const m = raw.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  const toFixedTrim = (value, digits) => {
    const s = Number(value).toFixed(digits);
    return s.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '');
  };

  const hDeg = delta === 0 ? 0 : h;
  const sPct = s * 100;
  const lPct = l * 100;

  return `${toFixedTrim(hDeg, 6)} ${toFixedTrim(sPct, 6)}% ${toFixedTrim(lPct, 6)}%`;
};

const applyDevThemeVarsFromStorage = () => {
  try {
    const savedStrong = window.localStorage.getItem('DEV_THEME_STRONG_HEX');
    const savedSoft = window.localStorage.getItem('DEV_THEME_SOFT_HEX');
    const savedRing = window.localStorage.getItem('DEV_THEME_RING_HEX');
    const savedAccent = window.localStorage.getItem('DEV_THEME_ACCENT_HEX');
    const savedRadiusPxRaw = window.localStorage.getItem('DEV_THEME_RADIUS_PX');
    const savedUiScalePctRaw = window.localStorage.getItem('DEV_UI_SCALE_PCT');
    const savedShadowHex = window.localStorage.getItem('DEV_UI_SHADOW_HEX');
    const savedShadowStrengthRaw = window.localStorage.getItem('DEV_UI_SHADOW_STRENGTH');
    const strongTriplet = devHexToHslTriplet(savedStrong);
    const softTriplet = devHexToHslTriplet(savedSoft);
    const ringTriplet = devHexToHslTriplet(savedRing);
    const accentTriplet = devHexToHslTriplet(savedAccent);
    if (strongTriplet) document.documentElement.style.setProperty('--foreground', strongTriplet);
    if (softTriplet) document.documentElement.style.setProperty('--muted-foreground', softTriplet);
    if (ringTriplet) document.documentElement.style.setProperty('--ring', ringTriplet);
    if (accentTriplet) document.documentElement.style.setProperty('--accent', accentTriplet);

    const radiusPx = savedRadiusPxRaw == null ? NaN : Number(savedRadiusPxRaw);
    if (Number.isFinite(radiusPx)) {
      const px = Math.max(0, Math.min(40, radiusPx));
      document.documentElement.style.setProperty('--radius', `${px / 16}rem`);
    }

    const uiScalePct = savedUiScalePctRaw == null ? NaN : Number(savedUiScalePctRaw);
    if (Number.isFinite(uiScalePct)) {
      const pct = Math.max(70, Math.min(130, uiScalePct));
      document.documentElement.style.fontSize = `${pct}%`;
    }

    const shadowTriplet = devHexToHslTriplet(savedShadowHex);
    if (shadowTriplet) document.documentElement.style.setProperty('--shadow-color', shadowTriplet);

    const shadowStrength = savedShadowStrengthRaw == null ? NaN : Number(savedShadowStrengthRaw);
    if (Number.isFinite(shadowStrength)) {
      const s = Math.max(0, Math.min(2, shadowStrength));
      document.documentElement.style.setProperty('--shadow-strength', String(s));
    }
  } catch {
    // ignore
  }
};

function App() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [slideOpen, setSlideOpen] = useState(false);
  const [slidePresetId, setSlidePresetId] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedContainerToken, setSelectedContainerToken] = useState('');
  const [copyContainerStatus, setCopyContainerStatus] = useState('idle');

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
  const [selectionStatus, setSelectionStatus] = useState('idle');
  const [layoutInspectorEnabled, setLayoutInspectorEnabled] = useState(false);
  const [guidesEnabled, setGuidesEnabled] = useState(false);
  const [clicksEnabled, setClicksEnabled] = useState(false);
  const [clickMarks, setClickMarks] = useState([]);
  const [nikeTambeBgOn, setNikeTambeBgOn] = useState(true);
  const debugButtonsWrapRef = useRef(null);
  const selectedElementNodeRef = useRef(null);
  const lastCopiedTokenRef = useRef('');
  const pickCycleRef = useRef({ x: null, y: null, idx: 0, sig: '' });
  const [contentContainerLeft, setContentContainerLeft] = useState(null);
  const [contentContainerRight, setContentContainerRight] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [layoutInspectorPickEnabled, setLayoutInspectorPickEnabled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { config: slidesConfig } = useSlidesConfig();

  const productContext = useProductContext();
  const { isAdmin, bypassUnderConstruction } = useAdmin();
  const { tools, toggleTool } = useAdminTools();
  const { enabled: offersEnabled, loading: offersLoading } = useOffersConfig();
  const { shouldRedirect, redirectUrl, loading: redirectLoading } = useGlobalRedirect(bypassUnderConstruction);

  useEffect(() => {
    applyDevThemeVarsFromStorage();
  }, []);

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

  useEffect(() => {
    try {
      localStorage.removeItem('layoutInspectorPickEnabled');
      localStorage.removeItem('adminTools');
      localStorage.removeItem('NIKE_DEMO_MANUAL');
      localStorage.removeItem('NIKE_DEMO_PHASE');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('DEV_CLICKS_ENABLED', clicksEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, [clicksEnabled]);

  useEffect(() => {
    if (!clicksEnabled) return;
    if (!layoutInspectorEnabled) return;

    const onPointerDown = (e) => {
      if (typeof e.clientX !== 'number' || typeof e.clientY !== 'number') return;
      const toolbar = debugButtonsWrapRef.current;
      if (toolbar && e.target && toolbar.contains(e.target)) return;

      setClickMarks((prev) => {
        const next = [...prev, { x: e.clientX, y: e.clientY, t: Date.now() }];
        return next.slice(-40);
      });
    };

    window.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
    return () => window.removeEventListener('pointerdown', onPointerDown, { capture: true });
  }, [clicksEnabled, layoutInspectorEnabled]);

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

  // ALL HOOKS MUST BE BEFORE ANY EARLY RETURNS
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

  // Inicialitzar analytics
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

  const isNikeDemoRoute = location.pathname === '/nike-tambe' || location.pathname.startsWith('/proves/demo-nike-tambe');
  const isNikeHeroDemoRoute = false;
  const isHomeRoute = location.pathname === '/';
  const isPreview = location.pathname === '/ec-preview' || location.pathname === '/ec-preview-lite';
  const isFullWideSlideRoute = location.pathname === '/full-wide-slide';
  const isAdidasDemoRoute =
    location.pathname === '/adidas-demo' ||
    location.pathname === '/adidas-demo-lite' ||
    location.pathname === '/adidas-pdp' ||
    location.pathname.startsWith('/adidas-pdp/') ||
    location.pathname.startsWith('/proves/demo-adidas');
  const isFullWideSlideDemoRoute = isFullWideSlideRoute;
  const isAdidasStyleLayoutRoute = isAdidasDemoRoute || isFullWideSlideDemoRoute;
  const isDevDemoRoute = isNikeDemoRoute || isAdidasDemoRoute || isFullWideSlideDemoRoute;
  const layoutInspectorActive = (isAdmin || isDevDemoRoute) && location.pathname !== '/ec-preview' && location.pathname !== '/ec-preview-lite' && layoutInspectorEnabled;

  useEffect(() => {
    if (layoutInspectorActive) return;
    setClicksEnabled(false);
    setClickMarks([]);
  }, [layoutInspectorActive]);

  useEffect(() => {
    try {
      document.body.classList.toggle('debug-containers', !!layoutInspectorActive);
      return () => {
        document.body.classList.remove('debug-containers');
      };
    } catch {
      return undefined;
    }
  }, [layoutInspectorActive]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('NIKE_TAMBE_BG_ON');
      if (raw === null) {
        setNikeTambeBgOn(true);
        return;
      }
      setNikeTambeBgOn(raw === '1');
    } catch {
      setNikeTambeBgOn(true);
    }
  }, []);

  const [nikeDemoManualEnabled, setNikeDemoManualEnabled] = useState(false);
  const [nikeDemoPhaseOverride, setNikeDemoPhaseOverride] = useState(null);
  const [fullWideSlideManualEnabled, setFullWideSlideManualEnabled] = useState(false);

  useEffect(() => {
    if (!isDevDemoRoute) {
      setNikeDemoManualEnabled(false);
      setNikeDemoPhaseOverride(null);
      return undefined;
    }

    const readControls = () => {
      try {
        const enabled = window.localStorage.getItem('NIKE_DEMO_MANUAL') === '1';
        const phase = window.localStorage.getItem('NIKE_DEMO_PHASE');
        setNikeDemoManualEnabled(enabled);
        setNikeDemoPhaseOverride(phase === 'rest' || phase === 'expanded' ? phase : null);
      } catch {
        setNikeDemoManualEnabled(false);
        setNikeDemoPhaseOverride(null);
      }
    };

    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === 'NIKE_DEMO_MANUAL' || e.key === 'NIKE_DEMO_PHASE') {
        readControls();
      }
    };

    readControls();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [isDevDemoRoute]);

  useEffect(() => {
    if (!(isFullWideSlideDemoRoute || isHomeRoute)) {
      setFullWideSlideManualEnabled(false);
      return undefined;
    }

    const readControls = () => {
      try {
        const enabled = window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1';
        setFullWideSlideManualEnabled(enabled);
      } catch {
        setFullWideSlideManualEnabled(false);
      }
    };

    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === 'FULL_WIDE_SLIDE_DEMO_MANUAL' || e.key === 'FULL_WIDE_SLIDE_DEMO_PHASE') {
        readControls();
      }
    };

    const onLocalChange = () => readControls();

    readControls();
    window.addEventListener('storage', onStorage);
    window.addEventListener('full-wide-slide-demo-controls-changed', onLocalChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('full-wide-slide-demo-controls-changed', onLocalChange);
    };
  }, [isFullWideSlideDemoRoute, isHomeRoute]);

  const writeNikeDemoControls = ({ enabled, phase }) => {
    try {
      window.localStorage.setItem('NIKE_DEMO_MANUAL', enabled ? '1' : '0');
      if (enabled) {
        window.localStorage.setItem('NIKE_DEMO_PHASE', phase);
      } else {
        window.localStorage.removeItem('NIKE_DEMO_PHASE');
      }
    } catch {
      // ignore
    }

    try {
      window.dispatchEvent(new Event('nike-demo-controls-changed'));
    } catch {
      // ignore
    }

    setNikeDemoManualEnabled(enabled);
    setNikeDemoPhaseOverride(phase === 'rest' || phase === 'expanded' ? phase : null);
  };

  const writeFullWideSlideDemoControls = ({ enabled }) => {
    try {
      window.localStorage.setItem('FULL_WIDE_SLIDE_DEMO_MANUAL', enabled ? '1' : '0');
    } catch {
      // ignore
    }

    try {
      window.dispatchEvent(new Event('full-wide-slide-demo-controls-changed'));
    } catch {
      // ignore
    }

    setFullWideSlideManualEnabled(enabled);
  };

  useEffect(() => {
    try {
      localStorage.setItem('layoutInspectorPickEnabled', JSON.stringify(layoutInspectorPickEnabled));
    } catch {
      // ignore
    }
  }, [layoutInspectorPickEnabled]);

  useEffect(() => {
    const update = () => {
      const candidates = Array.from(document.querySelectorAll('.mx-auto[class*="max-w-[1400px]"]'));
      const best = candidates
        .map((el) => ({ el, rect: el?.getBoundingClientRect?.() }))
        .filter((x) => x.rect && Number.isFinite(x.rect.left) && Number.isFinite(x.rect.width) && x.rect.width > 0)
        .sort((a, b) => b.rect.width - a.rect.width)[0];

      const rect = best?.rect;
      if (!rect || !Number.isFinite(rect.left) || rect.left <= 0) {
        setContentContainerLeft(null);
        setContentContainerRight(null);
        return;
      }
      setContentContainerLeft(rect.left);
      setContentContainerRight(rect.left + rect.width);
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [location.pathname]);

  // Handle layout inspector element click
  useEffect(() => {
    if (!layoutInspectorActive) {
      setSelectedElement(null);
      selectedElementNodeRef.current = null;
      setSelectedContainerToken('');
      setCopyContainerStatus('idle');
      setSelectionStatus('idle');
      lastCopiedTokenRef.current = '';
      return;
    }

    const isFixedElement = (el) => {
      if (!el || !(el instanceof Element)) return false;
      try {
        return window.getComputedStyle(el).position === 'fixed';
      } catch {
        return false;
      }
    };

    const isInLayoutInspectorRoot = (el) => {
      if (!el || !(el instanceof Element) || !el.closest) return false;
      return !!el.closest('[data-layout-inspector-root="true"]');
    };

    const isDevOverlay = (el) => !!(el && el instanceof Element && el.closest('[data-dev-overlay="true"]'));

    const pickElementInMain = (clientX, clientY) => {
      const main = document.getElementById('main-content');
      const overlayRoot = document.querySelector('[data-layout-inspector-root="true"]');
      if (!main && !overlayRoot) return null;
      if (!document.elementsFromPoint) return null;
      const stack = document.elementsFromPoint(clientX, clientY);
      const toolbar = debugButtonsWrapRef.current;

      const filtered = stack
        .filter((el) => el instanceof Element)
        .filter((el) => (main && main.contains(el)) || (overlayRoot && overlayRoot.contains(el)))
        .filter((el) => !isDevOverlay(el))
        .filter((el) => !(toolbar && toolbar.contains(el)))
        .filter((el) => !isFixedElement(el) || isInLayoutInspectorRoot(el))
        .filter((el) => {
          try {
            const cs = window.getComputedStyle(el);
            if (cs.pointerEvents === 'none') return false;
            if (cs.visibility === 'hidden') return false;
            if (cs.display === 'none') return false;
          } catch {
            // ignore
          }
          return true;
        });

      if (!filtered.length) return null;

      const signature = filtered
        .slice(0, 12)
        .map((el) => {
          const tag = (el.tagName || '').toLowerCase();
          const id = (el.getAttribute('id') || '').trim();
          const cls = (el.getAttribute('class') || '').toString();
          return `${tag}#${id}.${cls}`;
        })
        .join('|');

      const samePoint = pickCycleRef.current.x === clientX && pickCycleRef.current.y === clientY && pickCycleRef.current.sig === signature;
      const nextIdx = samePoint ? pickCycleRef.current.idx + 1 : 0;
      const idx = nextIdx % filtered.length;
      pickCycleRef.current = { x: clientX, y: clientY, idx, sig: signature };

      return filtered[idx];
    };

    const clearSelection = () => {
      const previousSelected = document.querySelector('.debug-selected');
      if (previousSelected) previousSelected.classList.remove('debug-selected');
      setSelectedElement(null);
      selectedElementNodeRef.current = null;
      setSelectedContainerToken('');
      setCopyContainerStatus('idle');
      setSelectionStatus('idle');
    };

    const onPointerDown = (e) => {
      if (!layoutInspectorActive) {
        return;
      }
      const toolbar = debugButtonsWrapRef.current;
      if (toolbar && toolbar.contains(e.target)) return;
      if (e.target && e.target.closest && e.target.closest('.debug-exempt,[data-debug-exempt="true"]')) return;
      if (isDevOverlay(e.target)) return;
      if (typeof e.clientX !== 'number' || typeof e.clientY !== 'number') return;
      const main = document.getElementById('main-content');
      const inMain = main && e.target instanceof Element && main.contains(e.target);
      const inOverlay = e.target instanceof Element && isInLayoutInspectorRoot(e.target);
      if (!(inMain || inOverlay)) return;
      const pickedFromPoint = pickElementInMain(e.clientX, e.clientY);
      const pickedFromTarget = (main && main.contains(e.target) && !isDevOverlay(e.target) && !isFixedElement(e.target)) ? e.target : null;
      const picked = pickedFromPoint || pickedFromTarget;
      if (!picked) {
        clearSelection();
        return;
      }

      const target = picked;
      const previousSelected = document.querySelector('.debug-selected');
      if (previousSelected) previousSelected.classList.remove('debug-selected');
      if (target.classList) target.classList.add('debug-selected');

      selectedElementNodeRef.current = target;
      const token = buildContainerToken(target);
      setSelectedContainerToken((prev) => {
        const isSame = prev && prev === token;
        setSelectionStatus(isSame ? 'selected_same' : 'selected_new');
        window.setTimeout(() => setSelectionStatus('idle'), 900);
        return token;
      });
      setCopyContainerStatus('ready');
    };

    const onClickCapture = (e) => {
      if (!layoutInspectorActive) return;
      const toolbar = debugButtonsWrapRef.current;
      if (toolbar && toolbar.contains(e.target)) return;
      if (e.target && e.target.closest && e.target.closest('.debug-exempt,[data-debug-exempt="true"]')) return;
      if (isDevOverlay(e.target)) return;
      const main = document.getElementById('main-content');
      const inMain = main && e.target instanceof Element && main.contains(e.target);
      const inOverlay = e.target instanceof Element && isInLayoutInspectorRoot(e.target);
      if (!(inMain || inOverlay)) return;

      // Blocatge per defecte: evita navegació i handlers de click quan el debug està actiu.
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    };

    window.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
    window.addEventListener('click', onClickCapture, { capture: true });

    return () => {
      window.removeEventListener('pointerdown', onPointerDown, { capture: true });
      window.removeEventListener('click', onClickCapture, { capture: true });
      const selected = document.querySelector('.debug-selected');
      if (selected) selected.classList.remove('debug-selected');
      selectedElementNodeRef.current = null;
    };
  }, [layoutInspectorActive, layoutInspectorPickEnabled]);

  const buildContainerToken = (el) => {
    if (!el || !(el instanceof Element)) return '';
    const tagNameRaw = (el.tagName || '').toLowerCase();
    const idRaw = (el.getAttribute('id') || '').trim();
    const classRaw = (el.getAttribute('class') || '').replace(/\bdebug-selected\b/g, '').trim();
    const classes = classRaw ? String(classRaw).split(/\s+/).filter(Boolean) : [];

    const isTailwindUtilityClass = (cls) => {
      if (!cls) return true;
      if (cls === 'debug-exempt' || cls === 'debug-selected') return true;
      if (cls.includes(':')) return true;
      if (/^(group|peer)$/.test(cls)) return true;
      if (/^(container)$/.test(cls)) return true;
      if (/^(sr-only|not-sr-only)$/.test(cls)) return true;
      if (/^(prose|dark|light)$/.test(cls)) return true;
      return /^(mx|my|mt|mr|mb|ml|m|px|py|pt|pr|pb|pl|p|w|min-w|max-w|h|min-h|max-h|text|font|leading|tracking|uppercase|lowercase|capitalize|bg|from|via|to|border|rounded|ring|shadow|opacity|flex|inline-flex|grid|block|inline-block|hidden|items|justify|content|self|place|gap|space|order|grow|shrink|basis|overflow|relative|absolute|fixed|sticky|top|left|right|bottom|inset|z|cursor|pointer-events|select|transition|duration|ease|delay|animate|transform|origin|scale|rotate|translate|skew|blur|drop-shadow|backdrop|object|aspect|whitespace|break|truncate|antialiased|subpixel-antialiased)(-|$)/.test(cls);
    };

    const pickHumanClass = () => {
      const candidate = classes.find((c) => !isTailwindUtilityClass(c));
      return candidate || '';
    };

    const hintClass = pickHumanClass();

    const getDataHint = (node) => {
      if (!node || !(node instanceof Element)) return '';
      const page = (node.getAttribute('data-page') || '').trim();
      if (page) return `[data-page=${page}]`;
      const section = (node.getAttribute('data-section') || '').trim();
      if (section) return `[data-section=${section}]`;
      const component = (node.getAttribute('data-component') || '').trim();
      if (component) return `[data-component=${component}]`;
      const container = (node.getAttribute('data-container') || '').trim();
      if (container) return `[data-container=${container}]`;
      return '';
    };

    const getAriaHint = (node) => {
      if (!node || !(node instanceof Element)) return '';
      const aria = (node.getAttribute('aria-label') || '').trim();
      if (aria) return `[aria-label="${aria}"]`;
      const role = (node.getAttribute('role') || '').trim();
      if (role && role !== 'presentation') return `[role=${role}]`;
      return '';
    };

    const getNodeLabel = (node) => {
      if (!node || !(node instanceof Element)) return '';
      const id = (node.getAttribute('id') || '').trim();
      if (id) return `#${id}`;
      const dataHint = getDataHint(node);
      if (dataHint) return dataHint;
      const ariaHint = getAriaHint(node);
      if (ariaHint) return ariaHint;
      const clsRaw = (node.getAttribute('class') || '').replace(/\bdebug-selected\b/g, '').trim();
      const cls = clsRaw ? String(clsRaw).split(/\s+/).filter(Boolean) : [];
      const humanCls = cls.find((c) => !isTailwindUtilityClass(c));
      if (humanCls) return `.${humanCls}`;
      return '';
    };

    const buildPath = () => {
      const parts = [];
      let cur = el;
      while (cur && cur instanceof Element && cur !== document.body) {
        const tag = (cur.tagName || '').toLowerCase();
        const parent = cur.parentElement;
        const idx = parent ? Math.max(0, Array.from(parent.children).indexOf(cur)) : 0;
        const label = getNodeLabel(cur);
        parts.unshift(label ? `${tag}${label}` : `${tag}[${idx}]`);
        if (cur.getAttribute('id')) break;
        if (cur.getAttribute('data-page')) break;
        if (cur.getAttribute('data-section')) break;
        if (cur.getAttribute('data-component')) break;
        if (cur.getAttribute('data-container')) break;
        cur = parent;
      }
      return parts.join('>');
    };

    const hint = idRaw
      ? `#${idRaw}`
      : getDataHint(el)
        ? getDataHint(el)
      : hintClass
        ? `.${hintClass}`
        : '';

    return `${buildPath()}${hint ? ` ${tagNameRaw}${hint}` : ''}`.trim();
  };

  const copySelectedContainer = async () => {
    if (!layoutInspectorActive) return;

    const mainContent = document.getElementById('main-content');
    const overlayRoot = document.querySelector('[data-layout-inspector-root="true"]');
    const node = selectedElementNodeRef.current;
    const nodeIsValid = !!(
      node &&
      node instanceof Element &&
      !node.closest('[data-dev-overlay="true"]') &&
      ((mainContent && mainContent.contains(node)) || (overlayRoot && overlayRoot.contains(node))) &&
      (window.getComputedStyle(node).position !== 'fixed' || (node.closest && node.closest('[data-layout-inspector-root="true"]')))
    );

    const tokenNow = nodeIsValid ? buildContainerToken(node) : '';
    if (!tokenNow) return;
    const text = tokenNow;
    if (text !== selectedContainerToken) {
      setSelectedContainerToken(text);
    }

    const fallbackCopy = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    };

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ok = fallbackCopy();
        if (!ok) throw new Error('copy_failed');
      }
      setCopyContainerStatus((prev) => {
        const isRepeat = lastCopiedTokenRef.current && lastCopiedTokenRef.current === text;
        return isRepeat ? 'copied_again' : 'copied';
      });
      lastCopiedTokenRef.current = text;
      window.setTimeout(() => setCopyContainerStatus('ready'), 1200);
    } catch {
      setCopyContainerStatus('ready');
    }
  };

  const showProductsLoadingScreen = !!loading;
  const showProductsErrorScreen = !!(error && (!products || products.length === 0));

  const cartPresetId = 'FastCartSlide';
  const viewPresetId = isFullWideSlideRoute ? 'FullWideViewSlide' : 'FastViewSlide';

  // Obrir cistell quan s'afegeix un producte
  const handleAddToCart = (product, size, quantity = 1, shouldOpenCart = true) => {
    addToCart(product, size, quantity);
    if (shouldOpenCart) {
      setSlidePresetId(cartPresetId);
      setSlideOpen(true);
    }
  };

  // Shared props for pages
  const pageProps = {
    onAddToCart: handleAddToCart,
    cartItems,
    onUpdateQuantity: updateQuantity
  };

  const isFullScreenRoute = location.pathname === '/ec-preview' || location.pathname === '/ec-preview-lite';
  const isAdminRoute = ['/admin', '/index', '/promotions', '/ec-config', '/system-messages', '/fulfillment', '/fulfillment-settings', '/admin/media', '/admin-login', '/colleccio-settings', '/user-icon-picker', '/mockups', '/admin/gelato-sync', '/admin/gelato-blank', '/admin/products-overview', '/admin/draft', '/admin/draft/fulfillment-settings', '/admin/draft/mockup-settings', '/admin/draft/ruleta'].includes(location.pathname) || location.pathname.startsWith('/fulfillment/') || location.pathname.startsWith('/admin');
  const isHeroSettingsDevRoute = location.pathname === '/hero-settings';
  const isDevLinksRoute = location.pathname === '/dev-links' || location.pathname.startsWith('/proves/dev-links');
  const isDevComponentsRoute = location.pathname === '/dev-components' || location.pathname.startsWith('/proves/dev-components');
  const isDevLayoutBuilderRoute = location.pathname === '/layout-builder' || location.pathname.startsWith('/proves/layout-builder');
  const isDevToolsRoute =
    isDevLinksRoute ||
    isDevComponentsRoute ||
    isDevLayoutBuilderRoute ||
    location.pathname === '/adidas-stripe-zoom-dev';
  const isComponentsCatalogTemplateRoute = location.pathname === '/plantilla-cataleg-components';

  // DEV layout routes: hide offers/footer, show AdminBanner, etc.
  const isDevLayoutRoute = isHeroSettingsDevRoute || isDevDemoRoute || isDevToolsRoute || isComponentsCatalogTemplateRoute;
  // DEV header routes: inject the global white DEV header with links.
  // EXCEPTIONS: header-demo pages keep their own headers, so don't override them.
  const isDevHeaderRoute =
    location.pathname.startsWith('/proves') ||
    isNikeDemoRoute ||
    isDevToolsRoute ||
    isDevComponentsRoute ||
    isComponentsCatalogTemplateRoute;

  const isAdminStudioRoute = location.pathname.startsWith('/admin');
  const devHeaderVisible = !isFullScreenRoute && (isDevHeaderRoute || isAdminStudioRoute);

  const offersHeaderVisible = !isAdminRoute && !isFullScreenRoute && !isDevLayoutRoute && !isHomeRoute && offersEnabled && !offersLoading;

  const baseHeaderHeight = isLargeScreen ? 80 : 64;
  const heroSettingsDevHeaderHeight = isDevHeaderRoute ? baseHeaderHeight : 0;
  const offersHeaderHeight = offersHeaderVisible ? 40 : 0;
  const adminBannerVisible = isAdmin || isDevDemoRoute || isAdminRoute;
  const adminBannerHeight = adminBannerVisible ? 40 : 0;
  const offersHeaderTop = adminBannerVisible ? adminBannerHeight : 0;
  const adminRouteDevHeaderHeight = (isAdminRoute && devHeaderVisible) ? baseHeaderHeight : 0;

  const rulersOverlayActive = (isAdmin || isDevDemoRoute || isFullWideSlideRoute) && location.pathname !== '/ec-preview' && location.pathname !== '/ec-preview-lite';
  const rulerInset = rulersOverlayActive ? 18 : 0;

  const adminRouteOffset = `${adminBannerHeight + adminRouteDevHeaderHeight + rulerInset}px`;
  const appHeaderOffset = `${(isDevHeaderRoute ? heroSettingsDevHeaderHeight : baseHeaderHeight) + offersHeaderHeight + adminBannerHeight + rulerInset}px`;
  const adidasHeaderOffset = `${adminBannerHeight + rulerInset}px`;

  useEffect(() => {
    try {
      if (isFullScreenRoute) return;
      const nextOffset = isAdminRoute ? adminRouteOffset : (isAdidasStyleLayoutRoute ? adidasHeaderOffset : appHeaderOffset);
      document.documentElement.style.setProperty('--appHeaderOffset', nextOffset);
      document.documentElement.style.setProperty('--rulerInset', `${rulerInset}px`);
    } catch {
      // ignore
    }
  }, [adminRouteOffset, adidasHeaderOffset, appHeaderOffset, isAdminRoute, isAdidasStyleLayoutRoute, isFullScreenRoute, rulerInset]);

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

      {devHeaderVisible && (
        <DevHeader
          isPreview={isPreview}
          isAdmin={isAdmin}
          isDevDemoRoute={isDevDemoRoute}
          isFullWideSlideRoute={isFullWideSlideRoute}
          isNikeDemoRoute={isNikeDemoRoute}
          isAdidasDemoRoute={isAdidasDemoRoute}
          adminBannerHeight={adminBannerHeight}
          rulerInset={rulerInset}
          cartItemCount={getTotalItems()}
          onCartClick={() => toggleSlidePreset(cartPresetId)}
          onUserClick={() => toggleSlidePreset(viewPresetId)}
        />
      )}

      {/* Main Header - NO mostrar a pàgines full-screen ni admin ni a dev tools */}
      {!isFullScreenRoute && !isAdminRoute && !isAdidasStyleLayoutRoute && !isDevHeaderRoute && (
        isHomeRoute ? null : isNikeDemoRoute ? (
          <NikeInspiredHeader
            cartItemCount={getTotalItems()}
            onCartClick={() => toggleSlidePreset(cartPresetId)}
            onUserClick={() => toggleSlidePreset(viewPresetId)}
            adminBannerVisible={adminBannerVisible}
            guidesOffsetPx={rulerInset}
            offersHeaderVisible={offersHeaderVisible}
            offersHeaderHeight={offersHeaderHeight}
            offersHeaderTop={offersHeaderTop}
            isSearchPage={location.pathname === '/search'}
          />
        ) : (
          <Header
            cartItemCount={getTotalItems()}
            onCartClick={() => toggleSlidePreset(cartPresetId)}
            onUserClick={() => toggleSlidePreset(viewPresetId)}
            adminBannerVisible={adminBannerVisible}
            rulerInset={rulerInset}
            offersHeaderVisible={offersHeaderVisible}
            offersHeaderHeight={offersHeaderHeight}
            offersHeaderTop={offersHeaderTop}
            isSearchPage={location.pathname === '/search'}
          />
        )
      )}

        <main
          id="main-content"
          className={`flex-grow ${isAdminRoute ? 'overflow-y-auto' : ''} ${!isFullScreenRoute ? 'transition-[padding-top] duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]' : ''} ${layoutInspectorActive ? 'debug-containers' : ''}`}
          style={!isFullScreenRoute ? (
            isAdminRoute
              ? { paddingTop: adminRouteOffset, paddingLeft: `${rulerInset}px`, '--appHeaderOffset': adminRouteOffset, '--rulerInset': `${rulerInset}px` }
              : {
                  paddingTop: isAdidasStyleLayoutRoute ? adidasHeaderOffset : appHeaderOffset,
                  paddingLeft: `${rulerInset}px`,
                  '--appHeaderOffset': isAdidasStyleLayoutRoute ? adidasHeaderOffset : appHeaderOffset,
                  '--rulerInset': `${rulerInset}px`,
                }
          ) : {}}
          tabIndex={-1}
        >
          <Suspense fallback={<LoadingScreen />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="w-full max-w-none" style={{ '--appHeaderOffset': adidasHeaderOffset }}>
                      <AdidasInspiredHeader
                        cartItemCount={getTotalItems()}
                        onCartClick={() => toggleSlidePreset(cartPresetId)}
                        onUserClick={() => toggleSlidePreset(viewPresetId)}
                      />
                    </div>
                    <Home {...pageProps} />
                  </motion.div>
                } />

                <Route path="/lab" element={<LabHomePage />} />
                <Route path="/lab/demos" element={<LabDemosPage />} />
                <Route path="/lab/wip" element={<LabWipPage />} />
                <Route path="/first-contact" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <SupabaseCollectionRoute collectionKey="first-contact" {...pageProps} />
                  </motion.div>
                } />

                <Route path="/the-human-inside" element={<Navigate to="/thin" replace />} />

                <Route path="/thin" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <TheHumanInsidePage {...pageProps} />
                  </motion.div>
                } />

                <Route path="/outcasted" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <SupabaseCollectionRoute collectionKey="outcasted" {...pageProps} />
                  </motion.div>
                } />

                <Route path="/lab/proves" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <SupabaseCollectionRoute collectionKey="proves" {...pageProps} />
                  </motion.div>
                } />

                <Route path="/proves" element={<Navigate to="/lab/proves" replace />} />

                <Route path="/proves/demo-adidas" element={<AdidasDemoPage />} />
                <Route path="/proves/demo-adidas-pdp" element={<AdidasPdpPage />} />
                <Route path="/proves/demo-adidas-pdp-tdp" element={<AdidasPdpTdpPage />} />
                <Route path="/proves/demo-nike-tambe" element={<NikeTambePage />} />
                <Route path="/proves/dev-links" element={<DevLinksPage />} />
                <Route path="/proves/dev-components" element={<DevComponentsCatalogPage />} />
                <Route path="/proves/layout-builder" element={<DevLayoutBuilderPage />} />

                <Route
                  path="/proves/product/:id"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ProductDetailPage {...pageProps} />
                    </motion.div>
                  }
                />

                {/* Product Detail Page */}
                <Route
                  path="/product/:id"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ProductDetailPage {...pageProps} />
                    </motion.div>
                  }
                />

                {/* Gelato Product Detail Page */}
                <Route
                  path="/product-gelato/:id"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ProductDetailPage {...pageProps} />
                    </motion.div>
                  }
                />

                {/* Search Page */}
                <Route
                  path="/search"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <SearchPage {...pageProps} />
                    </motion.div>
                  }
                />

                {/* Cart Page */}
                <Route
                  path="/cart"
                  element={
                    <CartPage
                      cartItems={cartItems}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  }
                />

                <Route path="/wishlist" element={<Navigate to="/" replace />} />
                <Route path="/profile" element={<ProfilePage />} />

                <Route path="/full-wide-slide" element={<FullWideSlidePage />} />

                <Route path="/plantilla-cataleg-components" element={<PlantillaCatalegComponentsPage />} />

                {/* Checkout Page */}
                <Route
                  path="/checkout"
                  element={
                    <CheckoutPage
                      cartItems={cartItems}
                      onClearCart={clearCart}
                    />
                  }
                />

                {/* Order Confirmation Page */}
                <Route
                  path="/order-confirmation/:orderId"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <OrderConfirmationPage />
                    </motion.div>
                  }
                />

                {/* Footer Service Pages - Només català */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/sizing" element={<SizeGuidePage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/cc" element={<CreativeCommonsPage />} />
                <Route path="/offers" element={<OffersPage />} />

                <Route path="/new" element={<NewPage />} />
                <Route path="/adidas-demo" element={<Navigate to="/proves/demo-adidas" replace />} />
                <Route path="/adidas-pdp" element={<Navigate to="/proves/demo-adidas-pdp" replace />} />
                <Route path="/adidas-pdp-tdp" element={<Navigate to="/proves/demo-adidas-pdp-tdp" replace />} />
                <Route path="/adidas-stripe-zoom-dev" element={<Navigate to="/lab/proves" replace />} />
                <Route path="/dev-links" element={<Navigate to="/proves/dev-links" replace />} />
                <Route path="/dev-components" element={<Navigate to="/proves/dev-components" replace />} />
                <Route path="/layout-builder" element={<Navigate to="/proves/layout-builder" replace />} />
                <Route path="/nike-tambe" element={<Navigate to="/proves/demo-nike-tambe" replace />} />
                <Route path="/status" element={<Navigate to="/track" replace />} />
                <Route path="/track" element={<OrderTrackingPage />} />

                <Route path="/ruleta-demo" element={<Navigate to="/admin/draft/ruleta" replace />} />

                {/* Full Screen Media Page */}
                <Route
                  path="/ec-preview"
                  element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <ECPreviewPage />
                    </motion.div>
                  }
                />

                <Route path="/ec-preview-lite" element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ECPreviewLitePage />
                  </motion.div>
                } />

                {/* TECHNICAL ROUTES - COMMENTED OUT FOR PRODUCTION */}

                {/* Admin Login - Login d'administrador */}
                <Route path="/admin-login" element={<AdminLoginPage />} />

                {/* Admin - Nested under AdminStudioLayout for persistent mega-menu */}
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
                  <Route path="gelato-blank" element={<GelatoBlankProductsPage />} />
                  <Route path="gelato-templates" element={<GelatoTemplatesPage />} />
                  <Route path="products-overview" element={<ProductsOverviewPage />} />
                  <Route path="unitats" element={<UnitatsCanviPage />} />
                  <Route path="draft/ruleta" element={<RuletaDemoPage />} />
                </Route>

                {/* Legacy admin routes -> redirects to /admin */}
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

                <Route path="/fulfillment/:id" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ProductDetailPageEnhanced />
                  </motion.div>
                } />

                {/* User Icon Picker - Temporal */}
                <Route path="/user-icon-picker" element={<UserIconPicker />} />

                {/* Documentation Files - Temporal */}
                <Route path="/documentation-files" element={<DocumentationFilesPage />} />

                {/* 404 Page - Must be last */}
                <Route path="*" element={<NotFoundPage />} />

              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>

        {/* Footer - NO mostrar a pàgines full-screen ni admin */}
        {!isFullScreenRoute && !isAdminRoute && (
          isComponentsCatalogTemplateRoute ? (
            null
          ) : (
            !isDevLayoutRoute && <Footer />
          )
        )}

        <ScrollToTop />

        <SlideShell
          open={slideOpen}
          presetId={slidePresetId}
          slidesConfig={slidesConfig}
          onClose={() => {
            setSlideOpen(false);
            setSlidePresetId('');
          }}
          cartItems={cartItems}
          totalPrice={getTotalPrice()}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onUpdateSize={updateSize}
          onViewCart={() => {
            navigate('/cart');
            setSlideOpen(false);
            setSlidePresetId('');
          }}
          onCheckout={() => {
            setIsCheckoutOpen(true);
            setSlideOpen(false);
            setSlidePresetId('');
          }}
          onClearCart={() => {
            clearCart();
          }}
          onLogout={() => {
            setSlideOpen(false);
            setSlidePresetId('');
          }}
        />

        <Checkout
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          totalPrice={getTotalPrice()}
          onComplete={() => {
            clearCart();
            setIsCheckoutOpen(false);
          }}
        />

        {/* Toggle button for Debug - Moved outside debug-containers */}
        {(isAdmin || isDevDemoRoute || isFullWideSlideRoute) && location.pathname !== '/ec-preview' && location.pathname !== '/ec-preview-lite' && (
          <>
            <div
              ref={debugButtonsWrapRef}
              className="flex items-center gap-2 relative debug-exempt"
              style={{ position: 'fixed', left: 71, bottom: 16, zIndex: 99999 }}
            >
              <button
                type="button"
                tabIndex={-1}
                aria-pressed={clicksEnabled ? 'true' : 'false'}
                aria-label="Clics"
                className={`absolute left-0 top-0 z-0 inline-flex h-12 items-center justify-end rounded-full pl-[60px] pr-4 text-[12px] font-semibold shadow-lg ${
                  !layoutInspectorActive
                    ? 'bg-[#EDEDED] text-black/70'
                    : clicksEnabled
                      ? 'bg-[#1E62B8] text-white'
                      : 'bg-[#BFD9F4] text-[#0f172a]'
                }`}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '24px 50%' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!layoutInspectorActive) return;
                  setClicksEnabled((v) => !v);
                }}
              >
                <span style={{ display: 'inline-block', transform: 'rotate(90deg)' }}>
                  {'Clics'}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setLayoutInspectorEnabled((v) => {
                    const next = !v;
                    if (!next) {
                      setClicksEnabled(false);
                      setClickMarks([]);
                    }
                    return next;
                  })
                }
                className="relative z-20 h-12 w-12 bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center debug-exempt"
                aria-label="Mostrar/Ocultar debug"
                style={{ boxShadow: '10px 2px 14px rgba(0,0,0,0.34)' }}
              >
                <svg
                  className="block w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>

              <div className="relative -ml-[56px]">
                <button
                  type="button"
                  className={`relative z-10 inline-flex h-12 items-center justify-end rounded-full pl-[60px] pr-4 text-[12px] font-semibold shadow-lg disabled:cursor-not-allowed debug-exempt ${
                    !layoutInspectorActive
                      ? 'bg-[#EDEDED] text-black/70'
                      : !selectedContainerToken
                        ? 'bg-[#CFE0D2] text-black/70'
                        : selectionStatus === 'selected_same'
                          ? 'bg-[#F97316] text-white hover:bg-[#EA580C] active:bg-[#C2410C]'
                          : 'bg-[#387D22] text-white hover:bg-[#2F6B1D] active:bg-[#275A18]'
                  }`}
                  disabled={!layoutInspectorActive || !selectedContainerToken}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copySelectedContainer();
                  }}
                  aria-label="Copiar selecció"
                  style={{ boxShadow: '-10px 8px 16px rgba(0,0,0,0.32)' }}
                >
                  {!layoutInspectorActive
                    ? 'Copy'
                    : !selectedContainerToken
                      ? 'Copy'
                      : copyContainerStatus === 'copied'
                        ? 'Copied'
                        : copyContainerStatus === 'copied_again'
                          ? 'Copied again'
                          : selectionStatus === 'selected_new'
                            ? 'Selected'
                            : selectionStatus === 'selected_same'
                              ? 'Same'
                              : 'Copy'}
                </button>
              </div>

              <button
                type="button"
                className={`relative z-10 h-12 rounded-full border px-4 text-[12px] font-semibold shadow-lg active:bg-black/10 debug-exempt ${
                  guidesEnabled
                    ? 'border-[#337AC6]/40 bg-[#337AC6]/10 text-[#0f172a] hover:bg-[#337AC6]/15'
                    : 'border-black/15 bg-white text-black/80 hover:bg-black/5'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setGuidesEnabled((v) => !v);
                }}
              >
                Guides
              </button>

              {isFullWideSlideDemoRoute || isHomeRoute ? (
                <button
                  type="button"
                  className="h-12 rounded-md border border-black/15 bg-white px-3 text-[11px] font-medium text-black/80 shadow-sm hover:bg-black/5"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const nextEnabled = !fullWideSlideManualEnabled;
                    writeFullWideSlideDemoControls({ enabled: nextEnabled });
                  }}
                >
                  Control manual: {fullWideSlideManualEnabled ? 'ON' : 'OFF'}
                </button>
              ) : null}

              {isNikeDemoRoute && (
                <button
                  type="button"
                  className={`h-12 rounded-md border px-4 text-[12px] font-semibold shadow-lg active:bg-black/10 debug-exempt ${
                    nikeTambeBgOn
                      ? 'border-black/15 bg-white text-black/80 hover:bg-black/5'
                      : 'border-black/15 bg-white text-black/80 hover:bg-black/5'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const next = !nikeTambeBgOn;
                    try {
                      window.localStorage.setItem('NIKE_TAMBE_BG_ON', next ? '1' : '0');
                    } catch {
                      // ignore
                    }
                    setNikeTambeBgOn(next);
                    try {
                      window.dispatchEvent(new Event('nike-tambe-bg-toggle-changed'));
                    } catch {
                      // ignore
                    }
                  }}
                >
                  BG {nikeTambeBgOn ? 'ON' : 'OFF'}
                </button>
              )}

              {isDevDemoRoute && (
                <div className="flex items-center gap-2">
                  {isNikeHeroDemoRoute && (
                    <button
                      type="button"
                      className="h-12 rounded-md border border-black/15 bg-white px-3 text-[11px] font-medium text-black/80 shadow-sm hover:bg-black/5 disabled:opacity-40"
                      disabled={!nikeDemoManualEnabled}
                      onClick={() => {
                        const current = (nikeDemoPhaseOverride === 'rest' || nikeDemoPhaseOverride === 'expanded') ? nikeDemoPhaseOverride : 'expanded';
                        const next = current === 'expanded' ? 'rest' : 'expanded';
                        writeNikeDemoControls({ enabled: nikeDemoManualEnabled, phase: next });
                      }}
                    >
                      {(nikeDemoPhaseOverride || 'expanded') === 'expanded' ? 'Repòs' : 'Expandir'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        {rulersOverlayActive && (
          <DevGuidesOverlay guidesEnabled={guidesEnabled} onAutoEnable={() => setGuidesEnabled(true)} />
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
      </>
    )}
    </ErrorBoundary>
  );
}

export default App;
