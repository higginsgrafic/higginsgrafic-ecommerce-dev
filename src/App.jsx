import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense, lazy, useLayoutEffect, startTransition } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { CistellLayout1, CistellLayout2, CistellLayout3, CistellLayout4 } from './components/CistellLayouts';
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
import { normalizeMegaStripeRefSrc } from '@/utils/megaStripeCalibration';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import SkipLink from '@/components/SkipLink';
import OffersHeader from '@/components/OffersHeader';
import AdminBanner from '@/components/AdminBanner';
import MainHeader from '@/components/MainHeader';
import DevHeader from '@/components/DevHeader';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Footer from '@/components/Footer';
import SupabaseCollectionRoute from '@/pages/SupabaseCollectionRoute.jsx';
import SiteFrame from '@/components/layout/SiteFrame.jsx';
import useComponentCatalogConfig from '@/hooks/useComponentCatalogConfig';

const FulfillmentPage = lazy(() => import('@/pages/FulfillmentPage'));
const FulfillmentSettingsPage = lazy(() => import('@/pages/FulfillmentSettingsPage'));
const ProductDetailPageEnhanced = lazy(() => import('@/pages/ProductDetailPageEnhanced'));

// Lazy loading de pàgines per millorar performance (code splitting)
const Home = lazy(() => import('@/pages/Home'));
const OrderTrackingPage = lazy(() => import('@/pages/OrderTrackingPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const OffersPage = lazy(() => import('@/pages/OffersPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const ShippingPage = lazy(() => import('@/pages/ShippingPage'));
const SizeGuidePage = lazy(() => import('@/pages/SizeGuidePage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const CreativeCommonsPage = lazy(() => import('@/pages/CreativeCommonsPage'));
const TdpPage = lazy(() => import('@/pages/TdpPage'));

// Miscel·lània now uses the config-driven CollectionPage

const AdminStudioHomePage = lazy(() => import('@/pages/AdminStudioHomePage'));
const AdminDemosPage = lazy(() => import('@/pages/AdminDemosPage'));
const IndexPage = lazy(() => import('@/pages/IndexPage'));
const ECPreviewPage = lazy(() => import('@/pages/ECPreviewPage'));
const ECPreviewLitePage = lazy(() => import('@/pages/ECPreviewLitePage'));
const PromotionsManagerPage = lazy(() => import('@/pages/PromotionsManagerPage'));
const ECConfigPage = lazy(() => import('@/pages/ECConfigPage'));
const SystemMessagesPage = lazy(() => import('@/pages/SystemMessagesPage'));
const AdminMediaPage = lazy(() => import('@/pages/AdminMediaPage'));
const HeroSettingsPage = lazy(() => import('@/pages/HeroSettingsPage'));
const AdminStudioLayout = lazy(() => import('@/components/AdminStudioLayout'));
const FullWideSlidePage = lazy(() => import('@/pages/FullWideSlidePage'));
const GelatoBlankProductsPage = lazy(() => import('@/pages/GelatoBlankProductsPage'));
const AdminUploadPage = lazy(() => import('@/pages/AdminUploadPage'));
const UnitatsCanviPage = lazy(() => import('@/pages/UnitatsCanviPage'));
const RuletaDemoPage = lazy(() => import('@/pages/RuletaDemoPage'));
const AdminControlsPage = lazy(() => import('@/pages/AdminControlsPage'));
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'));
const ColleccioSettingsPage = lazy(() => import('@/pages/ColleccioSettingsPage'));
const GelatoTemplatesPage = lazy(() => import('@/pages/GelatoTemplatesPage'));
const MockupsManagerPage = lazy(() => import('@/pages/MockupsManagerPage'));
const GelatoProductsManagerPage = lazy(() => import('@/pages/GelatoProductsManagerPage'));
const ProductsOverviewPage = lazy(() => import('@/pages/ProductsOverviewPage'));
const AdminPlantillesPage = lazy(() => import('@/pages/AdminPlantillesPage.jsx'));
const PlantillaCatalegComponentsPage = lazy(() => import('@/pages/PlantillaCatalegComponentsPage'));

const DevLinksPage = lazy(() => import('@/pages/DevLinksPage'));
const ContactSheetPage = lazy(() => import('@/pages/dev/ContactSheetPage'));
const SiteMapPage = lazy(() => import('@/pages/dev/SiteMapPage'));
const ConstructorColleccioPage = lazy(() => import('@/pages/ConstructorColleccioPage'));
const CollectionFirstContactPage = lazy(() => import('@/pages/CollectionFirstContactPage'));
const CollectionTheHumanInsidePage = lazy(() => import('@/pages/CollectionTheHumanInsidePage'));
const CollectionAustenPage = lazy(() => import('@/pages/CollectionAustenPage'));
const CollectionCubePage = lazy(() => import('@/pages/CollectionCubePage'));
const CollectionMiscellaniaPage = lazy(() => import('@/pages/CollectionMiscellaniaPage'));
const ConstructorPdpPage = lazy(() => import('@/pages/ConstructorPdpPage'));
const ProductDetailPageTemplate = lazy(() => import('@/pages/ProductDetailPageTemplate'));
import { PDP_REGISTRY } from '@/data/pdpRegistry';
const HtmlBasePage = lazy(() => import('@/pages/HtmlBasePage'));
const DevComponentsCatalogPage = lazy(() => import('@/pages/DevComponentsCatalogPage'));
const DevLayoutBuilderPage = lazy(() => import('@/pages/DevLayoutBuilderPage'));
const LabDemosPage = lazy(() => import('@/pages/LabDemosPage.jsx'));
const LabWipPage = lazy(() => import('@/pages/LabWipPage.jsx'));
const LabHomePage = lazy(() => import('@/pages/LabHomePage.jsx'));
const AdminWipPage = lazy(() => import('@/pages/AdminWipPage.jsx'));

// Overlays i components condicionals (només en DEV o mode demo)
const FullWideSlideHeader = lazy(() => import('@/components/FullWideSlideHeader'));
const DevGuidesOverlay = lazy(() => import('@/components/DevGuidesOverlay.jsx'));
const BeltReferenceOverlay = lazy(() => import('@/components/dev/BeltReferenceOverlay.jsx'));
const Pauta4ColsOverlay = lazy(() => import('@/components/pauta/Pauta4ColsOverlay'));
const MegaStripeHud = lazy(() => import('@/components/MegaStripeHud'));


function App() {
  const { config: componentCatalogConfig } = useComponentCatalogConfig();
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedContainerToken, setSelectedContainerToken] = useState('');
  const [copyContainerStatus, setCopyContainerStatus] = useState('idle');
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
  const [selectionStatus, setSelectionStatus] = useState('idle');
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
  const [clicksEnabled, setClicksEnabled] = useState(false);
  const [clickMarks, setClickMarks] = useState([]);
  const debugButtonsWrapRef = useRef(null);
  const selectedElementNodeRef = useRef(null);
  const lastCopiedTokenRef = useRef('');
  const pickCycleRef = useRef({ x: null, y: null, idx: 0, sig: '' });
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [layoutInspectorPickEnabled, setLayoutInspectorPickEnabled] = useState(false);

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

  const megaStripeRefPresets = useMemo(() => {
    const firstContact = [
      { key: 'NX-01', src: '/tmp/CALIBRTGE/first_contact/first-contact-nx-01-black-white.png' },
      { key: 'NCC-1701', src: '/tmp/CALIBRTGE/first_contact/first-contact-ncc-1701-black-white.png' },
      { key: 'NCC-1701-D', src: '/tmp/CALIBRTGE/first_contact/first-contact-ncc-1701-d-black-white.png' },
      { key: 'Wormhole', src: '/tmp/CALIBRTGE/first_contact/first-contact-wormhole-black-white.png' },
      { key: 'Plasma escape', src: '/tmp/CALIBRTGE/first_contact/first-contact-plasma-escape-black-white.png' },
      { key: "Vulcan's end", src: '/tmp/CALIBRTGE/first_contact/first-contact-vulcans-end-black-white.png' },
      { key: 'The Phoenix', src: '/tmp/CALIBRTGE/first_contact/first-contact-the-phoenix-black-white.png' },
    ];

    const austen = [
      { key: 'P&P 1', src: '/tmp/CALIBRTGE/austen/crosswords/pride_and_prejudice/1.png' },
      { key: 'P&P 3', src: '/tmp/CALIBRTGE/austen/crosswords/pride_and_prejudice/3.png' },
      { key: 'P&P 5', src: '/tmp/CALIBRTGE/austen/crosswords/pride_and_prejudice/5.png' },
      { key: 'P&P 7', src: '/tmp/CALIBRTGE/austen/crosswords/pride_and_prejudice/7.png' },

      { key: 'Persuasion 1', src: '/tmp/CALIBRTGE/austen/crosswords/persuasion/1.jpg' },
      { key: 'Persuasion 3', src: '/tmp/CALIBRTGE/austen/crosswords/persuasion/3.jpg' },
      { key: 'Persuasion 5', src: '/tmp/CALIBRTGE/austen/crosswords/persuasion/5.jpg' },
      { key: 'Persuasion 7', src: '/tmp/CALIBRTGE/austen/crosswords/persuasion/7.jpg' },

      { key: 'S&S 1', src: '/tmp/CALIBRTGE/austen/crosswords/sense_and_sensibility/sense-and-sensibility-1.jpg' },
      { key: 'S&S 3', src: '/tmp/CALIBRTGE/austen/crosswords/sense_and_sensibility/sense-and-sensibility-3.jpg' },
      { key: 'S&S 5', src: '/tmp/CALIBRTGE/austen/crosswords/sense_and_sensibility/sense-and-sensibility-5.jpg' },
      { key: 'S&S 7', src: '/tmp/CALIBRTGE/austen/crosswords/sense_and_sensibility/sense-and-sensibility-7.jpg' },

      { key: 'Quote 1', src: '/tmp/CALIBRTGE/austen/quotes/1.jpg' },
      { key: 'Quote 2', src: '/tmp/CALIBRTGE/austen/quotes/2.jpg' },
      { key: 'Quote 3', src: '/tmp/CALIBRTGE/austen/quotes/3.jpg' },
      { key: 'Quote 4', src: '/tmp/CALIBRTGE/austen/quotes/4.jpg' },
      { key: 'Quote 5', src: '/tmp/CALIBRTGE/austen/quotes/5.jpg' },

      { key: 'Keep calm (black)', src: '/tmp/CALIBRTGE/austen/keep_calm/keep-calm-black.webp' },
      { key: 'Keep calm (red)', src: '/tmp/CALIBRTGE/austen/keep_calm/keep-calm-multi-red.webp' },

      { key: 'Darcy 16', src: '/tmp/CALIBRTGE/austen/looking_for_my_darcy/LOOKING FOR MY DARCY 16.jpeg' },
      { key: 'Darcy 17', src: '/tmp/CALIBRTGE/austen/looking_for_my_darcy/LOOKING FOR MY DARCY 17.jpeg' },
      { key: 'Darcy 18', src: '/tmp/CALIBRTGE/austen/looking_for_my_darcy/LOOKING FOR MY DARCY 18.jpeg' },
      { key: 'Darcy 19', src: '/tmp/CALIBRTGE/austen/looking_for_my_darcy/LOOKING FOR MY DARCY 19.jpeg' },

      { key: 'Pemberley', src: '/tmp/CALIBRTGE/austen/pemberley_house/permberley-black.jpg' },
    ];

    const cube = [
      { key: 'Iron Kong', src: '/tmp/CALIBRTGE/cube/iron-kong.png' },
      { key: 'Iron Cube', src: '/tmp/CALIBRTGE/cube/iron-cube.png' },
      { key: 'RoboCube', src: '/tmp/CALIBRTGE/cube/robocube.png' },
      { key: 'Cylon Cube', src: '/tmp/CALIBRTGE/cube/cylon-cube.png' },
      { key: 'MaschinenCube', src: '/tmp/CALIBRTGE/cube/maschinenCube.png' },
      { key: 'Mazinger C', src: '/tmp/CALIBRTGE/cube/mazinger-c.png' },
      { key: 'Afrodita C', src: '/tmp/CALIBRTGE/cube/afrodita-c.png' },
      { key: '3cube-p0', src: '/tmp/CALIBRTGE/cube/3cube-p0.png' },
      { key: 'Cyber Cube', src: '/tmp/CALIBRTGE/cube/cyber-cube.png' },
      { key: 'Darth Cube', src: '/tmp/CALIBRTGE/cube/darth-cube.png' },
    ];

    const miscellania = [
      { key: 'DJ Vader', src: '/tmp/CALIBRTGE/miscellania/miscellania-dj-vader-black-white.png' },
      { key: 'Deathstar2D2', src: '/tmp/CALIBRTGE/miscellania/miscellania-dead-star2d2-black-white.png' },
    ];

    const theHumanInside = [
      { key: 'Terminator', src: '/tmp/CALIBRTGE/the_human_inside/terminator.png' },
      { key: 'Robocop', src: '/tmp/CALIBRTGE/the_human_inside/robocop.png' },
      { key: 'Robby the robot', src: '/tmp/CALIBRTGE/the_human_inside/robby-the-robot.png' },
      { key: 'C3P0', src: '/tmp/CALIBRTGE/the_human_inside/c3p0.png' },
      { key: 'Darth Vader', src: '/tmp/CALIBRTGE/the_human_inside/darth-vader.png' },
      { key: 'Cylon 03', src: '/tmp/CALIBRTGE/the_human_inside/cylon-03.png' },
      { key: 'Cylon 78', src: '/tmp/CALIBRTGE/the_human_inside/cylon-78.png' },
      { key: 'Cyber-man', src: '/tmp/CALIBRTGE/the_human_inside/cyber-man.png' },
      { key: 'Maschinenmensch', src: '/tmp/CALIBRTGE/the_human_inside/maschinenmensch.png' },
      { key: 'Mazinger Z', src: '/tmp/CALIBRTGE/the_human_inside/mazinger-z.png' },
      { key: 'Afrodita A', src: '/tmp/CALIBRTGE/the_human_inside/afrodita-a.png' },
      { key: 'Iron Man 08', src: '/tmp/CALIBRTGE/the_human_inside/iron-man-08.png' },
      { key: 'Iron Man 68', src: '/tmp/CALIBRTGE/the_human_inside/iron-man-68.png' },
    ];

    return {
      first_contact: [...firstContact],
      thin: theHumanInside,
      austen,
      cube,
      'miscellania': miscellania,
      the_human_inside: theHumanInside,
    };
  }, []);


  const floatingDebugBtnOnStyle = useMemo(() => ({ fontWeight: 900, opacity: 0.98 }), []);
  const floatingDebugBtnOffStyle = useMemo(() => ({ fontWeight: 300, opacity: 0.28 }), []);
  const floatingDebugBtnBase = useMemo(
    () => ({
      fontSize: 13,
      fontWeight: 800,
      padding: '4px 10px',
      borderRadius: 8,
      border: '1px solid rgba(0,0,0,0.10)',
      background: 'rgba(255,255,255,0.92)',
      color: 'rgba(0,0,0,0.80)',
      cursor: 'pointer',
      userSelect: 'none',
    }),
    []
  );

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


  useEffect(() => {
    try {
      localStorage.removeItem('layoutInspectorPickEnabled');
      localStorage.removeItem('adminTools');
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

  // Rodonetes desactivades
  useEffect(() => {
    // No mostrar rodonetes mai
    return;
  }, [clicksEnabled, layoutInspectorEnabled]);


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

  useEffect(() => {
    if (layoutInspectorActive) return;
    setClicksEnabled(false);
    setClickMarks([]);
  }, [layoutInspectorActive]);

  useEffect(() => {
    const next = String(megaStripeState.megaStripeRefSrc || '');
    megaStripeState.setMegaStripeRef2Src((prev) => {
      const cur = String(prev || '');
      if (cur === next) return prev;
      return next;
    });
  }, [megaStripeState.megaStripeRefSrc]);

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

  const { fullWideSlideManualEnabled, writeFullWideSlideDemoControls, contentContainerLeft, contentContainerRight } = useContentLayout({ isFullWideSlideDemoRoute, isHomeRoute, locationPathname: location.pathname });

  useEffect(() => {
    try {
      localStorage.setItem('layoutInspectorPickEnabled', JSON.stringify(layoutInspectorPickEnabled));
    } catch {
      // ignore
    }
  }, [layoutInspectorPickEnabled]);


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
      
      // Només selecciona elements si clicksEnabled està desactivat
      if (clicksEnabled) return;
      
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
      if (e.target && e.target.closest && e.target.closest('[data-stripe-calib-hud="1"]')) return;
      const main = document.getElementById('main-content');
      const inMain = main && e.target instanceof Element && main.contains(e.target);
      const inOverlay = e.target instanceof Element && isInLayoutInspectorRoot(e.target);
      if (!(inMain || inOverlay)) return;

      // Blocatge només si clicksEnabled està desactivat
      if (!clicksEnabled) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      }
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
  }, [layoutInspectorActive, layoutInspectorPickEnabled, clicksEnabled]);

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

  const handleAddToCart = useCallback((product, size, quantity = 1, shouldOpenCart = true) => {
    addToCart(product, size, quantity);
  }, [addToCart]);

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const handleUserClick = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const pageProps = useMemo(() => ({
    onAddToCart: handleAddToCart,
    cartItems,
    onUpdateQuantity: updateQuantity
  }), [handleAddToCart, cartItems, updateQuantity]);

  const isFullScreenRoute = location.pathname === '/ec-preview' || location.pathname === '/ec-preview-lite' || location.pathname === '/dev/contact-sheet' || location.pathname === '/dev/site-map' || isEmbeddedPreview;
  const isAdminRoute = ['/admin', '/index', '/promotions', '/ec-config', '/system-messages', '/fulfillment', '/fulfillment-settings', '/admin/media', '/admin-login', '/colleccio-settings', '/user-icon-picker', '/mockups', '/admin/gelato-sync', '/admin/gelato-blank', '/admin/products-overview', '/admin/draft', '/admin/draft/fulfillment-settings', '/admin/draft/mockup-settings', '/admin/draft/ruleta'].includes(location.pathname) || location.pathname.startsWith('/fulfillment/') || location.pathname.startsWith('/admin');
  const isHeroSettingsDevRoute = location.pathname === '/hero-settings';
  const isDevToolsRoute = location.pathname === '/dev-tools' || location.pathname.startsWith('/dev-tools/');
  const isDevComponentsRoute = location.pathname === '/dev-components' || location.pathname.startsWith('/proves/dev-components');
  const isComponentsCatalogTemplateRoute = location.pathname === '/plantilla-cataleg-components';

  // DEV layout routes: hide offers/footer, show AdminBanner, etc.
  const isDevLayoutRoute = isHeroSettingsDevRoute || isDevDemoRoute || isDevToolsRoute || isComponentsCatalogTemplateRoute;
  // DEV header routes: inject the global white DEV header with links.
  // EXCEPTIONS: header-demo pages keep their own headers, so don't override them.
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
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="w-full max-w-none" style={{ '--appHeaderOffset': demoHeaderOffset }}>
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
                      />
                    </div>
                    <Home />
                  </motion.div>
                } />

                <Route path="/lab" element={<ProtectedRoute><LabHomePage /></ProtectedRoute>} />
                <Route path="/lab/demos" element={<ProtectedRoute><LabDemosPage /></ProtectedRoute>} />
                <Route path="/lab/wip" element={<ProtectedRoute><LabWipPage /></ProtectedRoute>} />
                <Route path="/first-contact" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <CollectionFirstContactPage pautaEnabled={false} tableEnabled={false} {...pageProps} />
                  </motion.div>
                } />

                <Route path="/the-human-inside" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <CollectionTheHumanInsidePage pautaEnabled={false} tableEnabled={false} {...pageProps} />
                  </motion.div>
                } />

                <Route path="/austen" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <CollectionAustenPage pautaEnabled={false} tableEnabled={false} {...pageProps} />
                  </motion.div>
                } />

                <Route path="/cube" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <CollectionCubePage pautaEnabled={false} tableEnabled={false} {...pageProps} />
                  </motion.div>
                } />

                <Route path="/miscellania" element={
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <CollectionMiscellaniaPage pautaEnabled={false} tableEnabled={false} {...pageProps} />
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

                <Route path="/proves" element={<ProtectedRoute><Navigate to="/lab/proves" replace /></ProtectedRoute>} />

                <Route path="/proves/dev-links" element={<ProtectedRoute><DevLinksPage /></ProtectedRoute>} />
                <Route path="/proves/dev-components" element={<ProtectedRoute><DevComponentsCatalogPage /></ProtectedRoute>} />
                <Route path="/proves/layout-builder" element={<ProtectedRoute><DevLayoutBuilderPage /></ProtectedRoute>} />

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

                <Route
                  path="/full-wide-slide"
                  element={<FullWideSlidePage pautaEnabled={false} tableEnabled={false} />}
                />
                <Route
                  path="/constructor/full-wide-slide"
                  element={<FullWideSlidePage pautaEnabled={false} tableEnabled={false} />}
                />

                <Route path="/plantilla-cataleg-components" element={<ProtectedRoute><PlantillaCatalegComponentsPage /></ProtectedRoute>} />

                {/* Checkout Page */}
                <Route
                  path="/checkout"
                  element={
                    <CheckoutPage
                      cartItems={[]}
                      onClearCart={clearCart}
                      pautaEnabled={pautaEnabled}
                      mockMode="single"
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
                <Route
                  path="/constructor/tdp"
                  element={<TdpPage pautaEnabled={false} tableEnabled={false} />}
                />
                <Route path="/tdp" element={<Navigate to="/constructor/tdp" replace />} />
                <Route
                  path="/constructor/colleccio"
                  element={<ConstructorColleccioPage pautaEnabled={false} tableEnabled={false} />}
                />
                <Route path="/constructor/pdp" element={<ConstructorPdpPage />} />
                {/* ─── PDP de producte (per col·lecció/slug) ─── */}
                {PDP_REGISTRY.map((p) => (
                  <Route key={p.slug} path={`/${p.collectionSlug}/${p.route}`} element={<ProductDetailPageTemplate />} />
                ))}
                <Route
                  path="/constructor/html-base"
                  element={<HtmlBasePage pautaEnabled={false} tableEnabled={false} />}
                />

                <Route path="/dev/contact-sheet" element={<ProtectedRoute><ContactSheetPage /></ProtectedRoute>} />
                <Route path="/dev/site-map" element={<ProtectedRoute><SiteMapPage /></ProtectedRoute>} />
                <Route path="/dev-links" element={<ProtectedRoute><Navigate to="/proves/dev-links" replace /></ProtectedRoute>} />
                <Route path="/dev-components" element={<ProtectedRoute><Navigate to="/proves/dev-components" replace /></ProtectedRoute>} />
                <Route path="/layout-builder" element={<ProtectedRoute><Navigate to="/proves/layout-builder" replace /></ProtectedRoute>} />
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
            !isDevLayoutRoute && (
              <div style={isHomeRoute ? { marginTop: '-532px', position: 'relative', zIndex: 50 } : undefined}>
                <Footer />
              </div>
            )
          )
        )}

        <ScrollToTop />

        {import.meta.env.DEV && rulersOverlayActive && (
          <DevGuidesOverlay
            guidesEnabled={guidesEnabled}
            zIndex={1300000}
          />
        )}

            <MegaStripeHud
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
                  <div
                    ref={debugButtonsWrapRef}
                    className="flex items-end gap-2 relative debug-exempt"
                    style={{ position: 'fixed', left: 31, bottom: 16, zIndex: 1100000 }}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-pressed={clicksEnabled ? 'true' : 'false'}
                      aria-label="Clics"
                      className={`absolute left-0 bottom-0 z-0 inline-flex h-12 items-center justify-end rounded-full pl-[60px] pr-4 text-[12px] font-semibold shadow-lg ${
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
                      <svg className="block w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                    <div className="relative z-10 flex flex-col items-stretch gap-2 debug-exempt">
                      <button
                        type="button"
                        className="h-12 rounded-full border border-black/15 bg-white px-4 text-[12px] font-semibold text-black/80 shadow-lg hover:bg-black/5 active:bg-black/10 debug-exempt"
                        title="Esborra totes les guies"
                        aria-label="Esborra totes les guies"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            window.__DEV_GUIDES_CLEAR__?.();
                          } catch {}
                          try { localStorage.removeItem('devGuidesV2'); } catch {}
                        }}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        className={`h-12 rounded-full border px-4 text-[12px] font-semibold shadow-lg active:bg-black/10 debug-exempt ${
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
                    </div>


                    <button
                      type="button"
                      title="Activa/desactiva les guïes Belt 2"
                      aria-label="Belt 2"
                      aria-pressed={belt2GuidesEnabled ? 'true' : 'false'}
                      className={`relative z-10 h-12 rounded-full border px-4 text-[12px] font-semibold shadow-lg active:bg-black/10 debug-exempt ${
                        belt2GuidesEnabled
                          ? 'border-[#10B981]/40 bg-[#10B981]/15 text-[#064E3B] hover:bg-[#10B981]/20'
                          : 'border-black/15 bg-white text-black/80 hover:bg-black/5'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setBelt2GuidesEnabled((v) => !v);
                      }}
                    >
                      Belt 2
                    </button>

                    <button
                      type="button"
                      title="Bloca/desbloca l'acordió del mega-slide"
                      aria-label="Acordió"
                      aria-pressed={megaAccordionLocked ? 'true' : 'false'}
                      className={`relative z-10 h-12 rounded-full border px-4 text-[12px] font-semibold shadow-lg active:bg-black/10 debug-exempt ${
                        megaAccordionLocked
                          ? 'border-[#6366F1]/40 bg-[#6366F1]/15 text-[#312E81] hover:bg-[#6366F1]/20'
                          : 'border-black/15 bg-white text-black/80 hover:bg-black/5'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMegaAccordionLocked((v) => !v);
                      }}
                    >
                      Acordió
                    </button>
                  </div>
                ) : null}

            <SiteFrame />
            {import.meta.env.DEV && <BeltReferenceOverlay enabled={belt2GuidesEnabled} />}

            {import.meta.env.DEV && (pautaEnabled || tableEnabled) && (location.pathname !== '/checkout' || tableEnabled) && (
              <Pauta4ColsOverlay
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
              <div
                className="font-mono text-neutral-800 debug-exempt"
                style={{
                  position: 'fixed',
                  right: 16,
                  top: 170,
                  width: 260,
                  zIndex: 100000,
                  background: 'rgba(255,255,255,0.96)',
                  border: '1px solid rgba(0,0,0,0.10)',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 12,
                  boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
                }}
              >
                <strong className="mb-2 block">Controls Guies</strong>
                <ToggleRow
                  label="Pauta"
                  checked={pautaEnabled}
                  onChange={(v) => startTransition(() => setPautaEnabled(v))}
                />
                <OpacitySlider
                  label="Opacitat pauta"
                  value={pautaOpacity}
                  onChange={(v) => setPautaOpacity(v)}
                  disabled={!pautaEnabled}
                />
                <ToggleRow
                  label="Taula + numeració"
                  checked={tableEnabled}
                  onChange={(v) => startTransition(() => setTableEnabled(v))}
                />
                <OpacitySlider
                  label="Opacitat taula"
                  value={tableOpacity}
                  onChange={(v) => setTableOpacity(v)}
                  disabled={!tableEnabled}
                />
                
                {location.pathname === '/constructor/pdp' && (
                  <div className="mt-4 border-t border-neutral-200 pt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const pkg = getPdpDesignPackage();
                        if (pkg) {
                          navigator.clipboard.writeText(pkg)
                            .then(() => {
                              setCopiedDesign(true);
                              setTimeout(() => setCopiedDesign(false), 2000);
                            })
                            .catch((err) => console.error('Error copiant el disseny:', err));
                        }
                      }}
                      className={`w-full py-2 px-3 rounded text-center text-[11px] font-semibold transition-all duration-200 ${
                        copiedDesign 
                          ? 'bg-green-600 text-white' 
                          : 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm active:scale-[0.98]'
                      }`}
                    >
                      {copiedDesign ? 'Codi copiat! 📋' : 'Copiar codi disseny'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const code = window.prompt("Enganxa el codi de disseny copiat d'un altre navegador:");
                        if (code) {
                          const applied = applyPdpDesignPackage(code.trim());
                          if (applied) {
                            window.location.reload();
                          } else {
                            window.alert("El codi és invàlid o no s'ha pogut importar.");
                          }
                        }
                      }}
                      className="w-full py-2 px-3 rounded text-center text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 shadow-sm active:scale-[0.98] transition-all duration-200"
                    >
                      Enganxar codi disseny
                    </button>
                  </div>
                )}
              </div>
            )}
      </>
    )}
    </ErrorBoundary>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="mb-2 flex items-center justify-between gap-3 text-[12px] text-neutral-800">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-orange-600"
      />
    </label>
  );
}

function OpacitySlider({ label, value, onChange, disabled = false }) {
  return (
    <label className={`mb-2 block ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between text-[11px] text-neutral-700">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-900">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="w-full accent-orange-600"
      />
    </label>
  );
}

function getPdpDesignPackage() {
  const data = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.startsWith('HG_EDITABLE_TEXT_BOX_V1:pdp-') || key.startsWith('hg.globalOverlays.'))) {
        data[key] = window.localStorage.getItem(key);
      }
    }
    const json = JSON.stringify(data);
    const base64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    return base64;
  } catch (e) {
    console.error('Error empaquetant disseny:', e);
    return null;
  }
}

function applyPdpDesignPackage(base64) {
  if (!base64) return false;
  try {
    const json = decodeURIComponent(Array.prototype.map.call(atob(base64), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const data = JSON.parse(json);
    let changed = false;
    for (const key in data) {
      if (key.startsWith('HG_EDITABLE_TEXT_BOX_V1:pdp-') || key.startsWith('hg.globalOverlays.')) {
        const current = window.localStorage.getItem(key);
        if (current !== data[key]) {
          window.localStorage.setItem(key, data[key]);
          changed = true;
        }
      }
    }
    return changed;
  } catch (e) {
    console.error('Error desempaquetant disseny:', e);
    return false;
  }
}

export default App;
