import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense, lazy, useLayoutEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { CistellLayout1, CistellLayout2, CistellLayout3, CistellLayout4 } from './components/CistellLayouts';
import { useProductContext } from '@/contexts/ProductContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminTools } from '@/contexts/AdminToolsContext';
import { initAnalytics, trackPageView } from '@/utils/analytics';
import { AUSTEN_QUOTES_ASSETS } from '@/utils/austenQuotesAssets';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import { useGlobalRedirect } from '@/hooks/useGlobalRedirect';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import SkipLink from '@/components/SkipLink';
import OffersHeader from '@/components/OffersHeader';
import AdminBanner from '@/components/AdminBanner';
import Header from '@/components/Header';
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
const AdminStudioLayout = lazy(() => import('@/components/AdminStudioLayout'));
const FullWideSlidePage = lazy(() => import('@/pages/FullWideSlidePage'));
const DocumentationFilesPage = lazy(() => import('@/pages/DocumentationFilesPage'));
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

const NikeTambePage = lazy(() => import('@/pages/NikeTambePage.jsx'));
const DevLinksPage = lazy(() => import('@/pages/DevLinksPage'));
const DevComponentsCatalogPage = lazy(() => import('@/pages/DevComponentsCatalogPage'));
const DevLayoutBuilderPage = lazy(() => import('@/pages/DevLayoutBuilderPage'));
const TheHumanInsidePage = lazy(() => import('@/pages/TheHumanInsidePage'));
const LabDemosPage = lazy(() => import('@/pages/LabDemosPage.jsx'));
const LabWipPage = lazy(() => import('@/pages/LabWipPage.jsx'));
const LabHomePage = lazy(() => import('@/pages/LabHomePage.jsx'));
const AdminWipPage = lazy(() => import('@/pages/AdminWipPage.jsx'));

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
  const [exportCopyStatus, setExportCopyStatus] = useState('idle');
  const [exportTab, setExportTab] = useState('all');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportModalTitle, setExportModalTitle] = useState('');
  const [exportModalText, setExportModalText] = useState('');
  const [stripeOverlayDebugSnapshot, setStripeOverlayDebugSnapshot] = useState(null);

  useEffect(() => {
    if (!exportModalOpen) return undefined;
    const onKeyDown = (e) => {
      try {
        if (!e) return;
        if (e.key === 'Escape') setExportModalOpen(false);
      } catch {
        // ignore
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [exportModalOpen]);

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
  const layoutInspectorEnabledFromUrl = (() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.has('layout') && sp.get('layout') !== '0';
    } catch {
      return false;
    }
  })();
  const [layoutInspectorEnabled, setLayoutInspectorEnabled] = useState(layoutInspectorEnabledFromUrl);
  const guidesEnabledFromUrl = (() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.has('guides') && sp.get('guides') !== '0';
    } catch {
      return false;
    }
  })();
  const [guidesEnabled, setGuidesEnabled] = useState(guidesEnabledFromUrl);
  const [megaStripeDx, setMegaStripeDx] = useState(0);
  const [megaStripeDy, setMegaStripeDy] = useState(0);
  const [megaStripeSpriteEnabled, setMegaStripeSpriteEnabled] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_STRIPE_SPRITE_ENABLED');
      if (raw == null) return true;
      const v = String(raw).trim().toLowerCase();
      if (v === '') return true;
      return v === '1' || v === 'true' || v === 'on' || v === 'yes';
    } catch {
      return true;
    }
  });
  const [megaStripeBeltEnabled, setMegaStripeBeltEnabled] = useState(false);
  const [megaStripeOverlayMode, setMegaStripeOverlayMode] = useState('off');
  const [megaShirtDrawingEnabled, setMegaShirtDrawingEnabled] = useState(() => {
    try {
      const parseBool = (raw, fallback = true) => {
        if (raw == null) return fallback;
        const v = String(raw).trim().toLowerCase();
        if (v === '') return fallback;
        return v === '1' || v === 'true' || v === 'on' || v === 'yes';
      };
      const rawNew = window.localStorage.getItem('HG_SHIRT_DRAWING_ENABLED');
      if (rawNew != null) return parseBool(rawNew, true);
      const rawOld = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_ENABLED');
      if (rawOld != null) return parseBool(rawOld, true);
      return true;
    } catch {
      return true;
    }
  });
  const [megaShirtDrawingOverlayDx, setMegaShirtDrawingOverlayDx] = useState(0);
  const [megaShirtDrawingOverlayDy, setMegaShirtDrawingOverlayDy] = useState(0);
  const [megaShirtDrawingOverlayScale, setMegaShirtDrawingOverlayScale] = useState(1);
  const [megaStripeDrawingOverlayDx, setMegaStripeDrawingOverlayDx] = useState(0);
  const [megaStripeDrawingOverlayDy, setMegaStripeDrawingOverlayDy] = useState(0);
  const [megaStripeDrawingOverlayScale, setMegaStripeDrawingOverlayScale] = useState(1);
  const [megaShirtDrawingOverlaySrc, setMegaShirtDrawingOverlaySrc] = useState(() => {
    try {
      return String(window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC') || '');
    } catch {
      return '';
    }
  });
  const [megaStripeOverlayDx, setMegaStripeOverlayDx] = useState(0);
  const [megaStripeOverlayDy, setMegaStripeOverlayDy] = useState(0);
  const [megaStripeOverlayScale, setMegaStripeOverlayScale] = useState(1);
  const [megaStripeScale, setMegaStripeScale] = useState(1.2125);
  const [megaStripeRefEnabled, setMegaStripeRefEnabled] = useState(false);
  const [megaStripeRefSrc, setMegaStripeRefSrc] = useState('');
  const [megaStripeRef2Enabled, setMegaStripeRef2Enabled] = useState(false);
  const [megaStripeRef2Src, setMegaStripeRef2Src] = useState('');

  const [megaStripeRefCollection, setMegaStripeRefCollection] = useState('first_contact');
  const [megaStripeRefDx, setMegaStripeRefDx] = useState(0);
  const [megaStripeRefDy, setMegaStripeRefDy] = useState(0);
  const [megaStripeRefScale, setMegaStripeRefScale] = useState(1);
  const [megaStripeRef2Dx, setMegaStripeRef2Dx] = useState(0);
  const [megaStripeRef2Dy, setMegaStripeRef2Dy] = useState(0);
  const [megaStripeRef2Scale, setMegaStripeRef2Scale] = useState(1);
  const [stripeEditTool, setStripeEditTool] = useState('ref');
  const [megaStripeNudgeStep, setMegaStripeNudgeStep] = useState(1);
  const [megaStripeTileGapPx, setMegaStripeTileGapPx] = useState(0);

  const [megaTileSelectorV1Enabled, setMegaTileSelectorV1Enabled] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_ENABLED');
      if (raw == null) return false;
      const v = String(raw).trim().toLowerCase();
      if (v === '') return true;
      return v === '1' || v === 'true' || v === 'on' || v === 'yes';
    } catch {
      return false;
    }
  });

  const [megaTileSelectorEnabled, setMegaTileSelectorEnabled] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_ENABLED');
      if (raw == null) return true;
      const v = String(raw).trim().toLowerCase();
      if (v === '') return true;
      return v === '1' || v === 'true' || v === 'on' || v === 'yes';
    } catch {
      return true;
    }
  });
  const [megaTileSelectorTarget, setMegaTileSelectorTarget] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_TARGET');
      return raw == null ? 'NCC-1701-D' : String(raw);
    } catch {
      return 'NCC-1701-D';
    }
  });
  const [megaTileSelectorSizePx, setMegaTileSelectorSizePx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_SIZE_PX');
      const n = raw == null ? 200 : Number.parseFloat(String(raw));
      return Number.isFinite(n) && n > 0 ? n : 200;
    } catch {
      return 200;
    }
  });
  const [megaTileSelectorStrokePx, setMegaTileSelectorStrokePx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STROKE_PX');
      const n = raw == null ? 10 : Number.parseFloat(String(raw));
      return Number.isFinite(n) && n >= 0 ? n : 10;
    } catch {
      return 10;
    }
  });
  const [megaTileSelectorColor, setMegaTileSelectorColor] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_COLOR');
      return raw == null ? 'black' : String(raw);
    } catch {
      return 'black';
    }
  });
  const [megaTileSelectorStepX, setMegaTileSelectorStepX] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_X');
      const n = raw == null ? 0 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(99, Math.max(-99, n)) : 0;
    } catch {
      return 0;
    }
  });
  const [megaTileSelectorStepY, setMegaTileSelectorStepY] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_Y');
      const n = raw == null ? 0 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(99, Math.max(-99, n)) : 0;
    } catch {
      return 0;
    }
  });
  const [megaTileSelectorRadiusPx, setMegaTileSelectorRadiusPx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_RADIUS_PX');
      const n = raw == null ? 8 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(200, Math.max(0, n)) : 8;
    } catch {
      return 8;
    }
  });
  const [megaTileSelectorExtendTopPx, setMegaTileSelectorExtendTopPx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_TOP_PX');
      const n = raw == null ? 30 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(500, Math.max(-500, n)) : 30;
    } catch {
      return 30;
    }
  });
  const [megaTileSelectorExtendRightPx, setMegaTileSelectorExtendRightPx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_RIGHT_PX');
      const n = raw == null ? 0 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(500, Math.max(-500, n)) : 0;
    } catch {
      return 0;
    }
  });
  const [megaTileSelectorExtendBottomPx, setMegaTileSelectorExtendBottomPx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_BOTTOM_PX');
      const n = raw == null ? 0 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(500, Math.max(-500, n)) : 0;
    } catch {
      return 0;
    }
  });
  const [megaTileSelectorExtendLeftPx, setMegaTileSelectorExtendLeftPx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_LEFT_PX');
      const n = raw == null ? 0 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(500, Math.max(-500, n)) : 0;
    } catch {
      return 0;
    }
  });

  const megaStripeOverlayScaleInputFocusedRef = useRef(false);
  const [megaStripeOverlayScaleDraft, setMegaStripeOverlayScaleDraft] = useState(() => String(megaStripeOverlayScale));
  useEffect(() => {
    if (megaStripeOverlayScaleInputFocusedRef.current) return;
    setMegaStripeOverlayScaleDraft(String(megaStripeOverlayScale));
  }, [megaStripeOverlayScale]);

  const SCALE_MIN = 0.1;
  const SCALE_MAX = 50;
  const clampScale = (n, fallback = 1) => {
    const v = Number.isFinite(n) ? n : Number.parseFloat(String(n));
    if (!Number.isFinite(v) || v <= 0) return fallback;
    return Math.min(SCALE_MAX, Math.max(SCALE_MIN, v));
  };

  const canonicalStripeDrawingOverlayKey = (rawSrc) => {
    try {
      const s = String(rawSrc || '').trim();
      if (!s) return '';
      const lower = s.toLowerCase();
      if (lower.includes('/custom_logos/drawings/images_stripe/austen/keep_calm/')) {
        return '__HG_CANONICAL_STRIPE_DRAWING_OVERLAY__::austen::keep_calm';
      }
      return s;
    } catch {
      try {
        return String(rawSrc || '').trim();
      } catch {
        return '';
      }
    }
  };

  const parseFinite = (raw) => {
    const n = Number.parseFloat(String(raw));
    return Number.isFinite(n) ? n : null;
  };

  const megaStripeDrawingOverlayDxInputFocusedRef = useRef(false);
  const [megaStripeDrawingOverlayDxDraft, setMegaStripeDrawingOverlayDxDraft] = useState(() => String(megaStripeDrawingOverlayDx));
  useEffect(() => {
    if (megaStripeDrawingOverlayDxInputFocusedRef.current) return;
    setMegaStripeDrawingOverlayDxDraft(String(megaStripeDrawingOverlayDx));
  }, [megaStripeDrawingOverlayDx]);

  const megaStripeDrawingOverlayDyInputFocusedRef = useRef(false);
  const [megaStripeDrawingOverlayDyDraft, setMegaStripeDrawingOverlayDyDraft] = useState(() => String(megaStripeDrawingOverlayDy));
  useEffect(() => {
    if (megaStripeDrawingOverlayDyInputFocusedRef.current) return;
    setMegaStripeDrawingOverlayDyDraft(String(megaStripeDrawingOverlayDy));
  }, [megaStripeDrawingOverlayDy]);

  const megaStripeDrawingOverlayScaleInputFocusedRef = useRef(false);
  const [megaStripeDrawingOverlayScaleDraft, setMegaStripeDrawingOverlayScaleDraft] = useState(() => String(megaStripeDrawingOverlayScale));
  useEffect(() => {
    if (megaStripeDrawingOverlayScaleInputFocusedRef.current) return;
    setMegaStripeDrawingOverlayScaleDraft(String(megaStripeDrawingOverlayScale));
  }, [megaStripeDrawingOverlayScale]);

  const megaStripeDxInputFocusedRef = useRef(false);
  const [megaStripeDxDraft, setMegaStripeDxDraft] = useState(() => String(megaStripeDx));
  useEffect(() => {
    if (megaStripeDxInputFocusedRef.current) return;
    setMegaStripeDxDraft(String(megaStripeDx));
  }, [megaStripeDx]);

  const megaStripeDyInputFocusedRef = useRef(false);
  const [megaStripeDyDraft, setMegaStripeDyDraft] = useState(() => String(megaStripeDy));
  useEffect(() => {
    if (megaStripeDyInputFocusedRef.current) return;
    setMegaStripeDyDraft(String(megaStripeDy));
  }, [megaStripeDy]);

  const megaStripeScaleInputFocusedRef = useRef(false);
  const [megaStripeScaleDraft, setMegaStripeScaleDraft] = useState(() => String(megaStripeScale));
  useEffect(() => {
    if (megaStripeScaleInputFocusedRef.current) return;
    setMegaStripeScaleDraft(String(megaStripeScale));
  }, [megaStripeScale]);

  const megaStripeRefDxInputFocusedRef = useRef(false);
  const [megaStripeRefDxDraft, setMegaStripeRefDxDraft] = useState(() => String(megaStripeRefDx));
  useEffect(() => {
    if (megaStripeRefDxInputFocusedRef.current) return;
    setMegaStripeRefDxDraft(String(megaStripeRefDx));
  }, [megaStripeRefDx]);

  const megaStripeRefDyInputFocusedRef = useRef(false);
  const [megaStripeRefDyDraft, setMegaStripeRefDyDraft] = useState(() => String(megaStripeRefDy));
  useEffect(() => {
    if (megaStripeRefDyInputFocusedRef.current) return;
    setMegaStripeRefDyDraft(String(megaStripeRefDy));
  }, [megaStripeRefDy]);

  const megaStripeRefScaleInputFocusedRef = useRef(false);
  const [megaStripeRefScaleDraft, setMegaStripeRefScaleDraft] = useState(() => String(megaStripeRefScale));
  useEffect(() => {
    if (megaStripeRefScaleInputFocusedRef.current) return;
    setMegaStripeRefScaleDraft(String(megaStripeRefScale));
  }, [megaStripeRefScale]);

  const megaStripeRef2DxInputFocusedRef = useRef(false);
  const [megaStripeRef2DxDraft, setMegaStripeRef2DxDraft] = useState(() => String(megaStripeRef2Dx));
  useEffect(() => {
    if (megaStripeRef2DxInputFocusedRef.current) return;
    setMegaStripeRef2DxDraft(String(megaStripeRef2Dx));
  }, [megaStripeRef2Dx]);

  const megaStripeRef2DyInputFocusedRef = useRef(false);
  const [megaStripeRef2DyDraft, setMegaStripeRef2DyDraft] = useState(() => String(megaStripeRef2Dy));
  useEffect(() => {
    if (megaStripeRef2DyInputFocusedRef.current) return;
    setMegaStripeRef2DyDraft(String(megaStripeRef2Dy));
  }, [megaStripeRef2Dy]);

  const megaStripeRef2ScaleInputFocusedRef = useRef(false);
  const [megaStripeRef2ScaleDraft, setMegaStripeRef2ScaleDraft] = useState(() => String(megaStripeRef2Scale));
  useEffect(() => {
    if (megaStripeRef2ScaleInputFocusedRef.current) return;
    setMegaStripeRef2ScaleDraft(String(megaStripeRef2Scale));
  }, [megaStripeRef2Scale]);

  const megaStripeTileGapPxInputFocusedRef = useRef(false);
  const [megaStripeTileGapPxDraft, setMegaStripeTileGapPxDraft] = useState(() => String(megaStripeTileGapPx || 0));
  useEffect(() => {
    if (megaStripeTileGapPxInputFocusedRef.current) return;
    setMegaStripeTileGapPxDraft(String(megaStripeTileGapPx || 0));
  }, [megaStripeTileGapPx]);

  const megaTileSelectorSizePxInputFocusedRef = useRef(false);
  const [megaTileSelectorSizePxDraft, setMegaTileSelectorSizePxDraft] = useState(() => String(megaTileSelectorSizePx || 0));
  useEffect(() => {
    if (megaTileSelectorSizePxInputFocusedRef.current) return;
    setMegaTileSelectorSizePxDraft(String(megaTileSelectorSizePx || 0));
  }, [megaTileSelectorSizePx]);

  const megaTileSelectorStrokePxInputFocusedRef = useRef(false);
  const [megaTileSelectorStrokePxDraft, setMegaTileSelectorStrokePxDraft] = useState(() => String(megaTileSelectorStrokePx || 0));
  useEffect(() => {
    if (megaTileSelectorStrokePxInputFocusedRef.current) return;
    setMegaTileSelectorStrokePxDraft(String(megaTileSelectorStrokePx || 0));
  }, [megaTileSelectorStrokePx]);

  const megaTileSelectorStepXInputFocusedRef = useRef(false);
  const [megaTileSelectorStepXDraft, setMegaTileSelectorStepXDraft] = useState(() => String(megaTileSelectorStepX || 0));
  useEffect(() => {
    if (megaTileSelectorStepXInputFocusedRef.current) return;
    setMegaTileSelectorStepXDraft(String(megaTileSelectorStepX || 0));
  }, [megaTileSelectorStepX]);

  const megaTileSelectorStepYInputFocusedRef = useRef(false);
  const [megaTileSelectorStepYDraft, setMegaTileSelectorStepYDraft] = useState(() => String(megaTileSelectorStepY || 0));
  useEffect(() => {
    if (megaTileSelectorStepYInputFocusedRef.current) return;
    setMegaTileSelectorStepYDraft(String(megaTileSelectorStepY || 0));
  }, [megaTileSelectorStepY]);

  const megaTileSelectorRadiusPxInputFocusedRef = useRef(false);
  const [megaTileSelectorRadiusPxDraft, setMegaTileSelectorRadiusPxDraft] = useState(() => String(megaTileSelectorRadiusPx || 0));
  useEffect(() => {
    if (megaTileSelectorRadiusPxInputFocusedRef.current) return;
    setMegaTileSelectorRadiusPxDraft(String(megaTileSelectorRadiusPx || 0));
  }, [megaTileSelectorRadiusPx]);

  const megaTileSelectorExtendTopPxInputFocusedRef = useRef(false);
  const [megaTileSelectorExtendTopPxDraft, setMegaTileSelectorExtendTopPxDraft] = useState(() => String(megaTileSelectorExtendTopPx || 0));
  useEffect(() => {
    if (megaTileSelectorExtendTopPxInputFocusedRef.current) return;
    setMegaTileSelectorExtendTopPxDraft(String(megaTileSelectorExtendTopPx || 0));
  }, [megaTileSelectorExtendTopPx]);

  const megaTileSelectorExtendRightPxInputFocusedRef = useRef(false);
  const [megaTileSelectorExtendRightPxDraft, setMegaTileSelectorExtendRightPxDraft] = useState(() => String(megaTileSelectorExtendRightPx || 0));
  useEffect(() => {
    if (megaTileSelectorExtendRightPxInputFocusedRef.current) return;
    setMegaTileSelectorExtendRightPxDraft(String(megaTileSelectorExtendRightPx || 0));
  }, [megaTileSelectorExtendRightPx]);

  const megaTileSelectorExtendBottomPxInputFocusedRef = useRef(false);
  const [megaTileSelectorExtendBottomPxDraft, setMegaTileSelectorExtendBottomPxDraft] = useState(() => String(megaTileSelectorExtendBottomPx || 0));
  useEffect(() => {
    if (megaTileSelectorExtendBottomPxInputFocusedRef.current) return;
    setMegaTileSelectorExtendBottomPxDraft(String(megaTileSelectorExtendBottomPx || 0));
  }, [megaTileSelectorExtendBottomPx]);

  const megaTileSelectorExtendLeftPxInputFocusedRef = useRef(false);
  const [megaTileSelectorExtendLeftPxDraft, setMegaTileSelectorExtendLeftPxDraft] = useState(() => String(megaTileSelectorExtendLeftPx || 0));
  useEffect(() => {
    if (megaTileSelectorExtendLeftPxInputFocusedRef.current) return;
    setMegaTileSelectorExtendLeftPxDraft(String(megaTileSelectorExtendLeftPx || 0));
  }, [megaTileSelectorExtendLeftPx]);
  const [megaStripeHudTopPx, setMegaStripeHudTopPx] = useState(null);
  const [megaStripeHudLockedTopPx, setMegaStripeHudLockedTopPx] = useState(() => {
    try {
      const raw = window?.localStorage?.getItem?.('MEGA_STRIPE_HUD_LOCKED_TOP');
      const n = raw == null ? NaN : Number.parseFloat(String(raw));
      return Number.isFinite(n) && n > 0 ? n : null;
    } catch {
      return null;
    }
  });
  const [megaStripeHudLockedHPx, setMegaStripeHudLockedHPx] = useState(null);
  const [megaStripeHudOwnHPx, setMegaStripeHudOwnHPx] = useState(() => {
    try {
      const raw = window?.localStorage?.getItem?.('MEGA_STRIPE_HUD_OWN_H');
      const n = raw == null ? NaN : Number.parseFloat(String(raw));
      return Number.isFinite(n) && n > 120 ? n : 360;
    } catch {
      return 360;
    }
  });
  const [megaStripeHudMaxRefPresets, setMegaStripeHudMaxRefPresets] = useState(12);
  const megaStripeHudWrapRef = useRef(null);
  const megaStripeParamsGridRef = useRef(null);
  const megaStripeLastGoodHudTopPxRef = useRef(null);
  const [megaStripeHudSnapDyPx, setMegaStripeHudSnapDyPx] = useState(0);
  const [hudCollapsed, setHudCollapsed] = useState(true);
  const [hudActiveTab, setHudActiveTab] = useState('stripe');
  const [cistellExpanded, setCistellExpanded] = useState(false);
  const [cistellLayout, setCistellLayout] = useState(1);
  const [clicksEnabled, setClicksEnabled] = useState(false);
  const [clickMarks, setClickMarks] = useState([]);
  const [nikeTambeBgOn, setNikeTambeBgOn] = useState(true);
  const megaStripeLastNonOffOverlayModeRef = useRef('black');
  const debugButtonsWrapRef = useRef(null);
  const selectedElementNodeRef = useRef(null);
  const lastCopiedTokenRef = useRef('');
  const pickCycleRef = useRef({ x: null, y: null, idx: 0, sig: '' });
  const [contentContainerLeft, setContentContainerLeft] = useState(null);
  const [contentContainerRight, setContentContainerRight] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const [layoutInspectorPickEnabled, setLayoutInspectorPickEnabled] = useState(false);

  const prevMegaStripeOverlayModeRef = useRef('off');

  const location = useLocation();
  const navigate = useNavigate();

  const isFullWideSlideRoute = location.pathname === '/full-wide-slide';
  const isFullWideSlideDemoRoute = location.pathname === '/full-wide-slide-demo';
  const HUD_DEBUG_BOTTOM_RESERVE_PX = 104;

  const stripeOverlayDebugOn = useMemo(() => {
    try {
      const sp = new URLSearchParams(location.search || '');
      const cur = String(sp.get('stripeOverlayDebug') || '').trim().toLowerCase();
      return sp.has('stripeOverlayDebug') && (cur === '' || cur === '1' || cur === 'true' || cur === 'on' || cur === 'yes');
    } catch {
      return false;
    }
  }, [location.search]);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search);

      if (sp.has('layout')) {
        setLayoutInspectorEnabled(sp.get('layout') !== '0');
      }

      if (sp.has('guides')) {
        setGuidesEnabled(sp.get('guides') !== '0');
      }
    } catch {
      // ignore
    }
  }, [location.search]);

  useEffect(() => {
    let alive = true;
    let t = null;
    const tick = () => {
      try {
        if (!alive) return;
        const snap = window.__HG_OVERLAY_DEBUG__ || null;
        setStripeOverlayDebugSnapshot((prev) => {
          if (!snap) return prev;
          const next = {
            stripeOverlayDebug: Boolean(snap.stripeOverlayDebug),
            showStripe: Boolean(snap.showStripe),
            active: String(snap.active || ''),
            resolvedOverlaySrc: String(snap.resolvedOverlaySrc || ''),
            stripeOverlayLoadState: String(snap.stripeOverlayLoadState || ''),
            stripeOverlayIsStripeWide: Boolean(snap.stripeOverlayIsStripeWide),
            stripeOverlayIsStripeWideDerived: snap.stripeOverlayIsStripeWideDerived == null ? null : Boolean(snap.stripeOverlayIsStripeWideDerived),
            stripeOverlayIsStripeWideMeasured: snap.stripeOverlayIsStripeWideMeasured == null ? null : Boolean(snap.stripeOverlayIsStripeWideMeasured),
          };
          const prevJson = prev ? JSON.stringify(prev) : '';
          const nextJson = JSON.stringify(next);
          return prevJson === nextJson ? prev : next;
        });
      } catch {
        // ignore
      }
    };

    tick();
    t = window.setInterval(tick, 250);
    return () => {
      alive = false;
      if (t) window.clearInterval(t);
    };
  }, [location.search]);

  useEffect(() => {
    try {
      const rawDx = window.localStorage.getItem('MEGA_STRIPE_DX');
      const rawDy = window.localStorage.getItem('MEGA_STRIPE_DY');
      const rawSpriteEnabled = window.localStorage.getItem('MEGA_STRIPE_SPRITE_ENABLED');
      const rawBelt = window.localStorage.getItem('MEGA_STRIPE_BELT');
      const rawOverlayMode = window.localStorage.getItem('MEGA_STRIPE_OVERLAY_MODE');
      const rawShirtDrawingEnabledNew = window.localStorage.getItem('HG_SHIRT_DRAWING_ENABLED');
      const rawShirtDrawingEnabledOld = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_ENABLED');
      const rawDrawingOverlaySrc = window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC');
      const rawShirtOverlayDx = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_DX');
      const rawShirtOverlayDy = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_DY');
      const rawShirtOverlayScale = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_SCALE');
      const rawStripeDrawingDx = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_DX');
      const rawStripeDrawingDy = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_DY');
      const rawStripeDrawingScale = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_SCALE');
      const rawStripeDrawingMap = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC');
      const rawOverlayDx = window.localStorage.getItem('MEGA_STRIPE_OVERLAY_DX');
      const rawOverlayDy = window.localStorage.getItem('MEGA_STRIPE_OVERLAY_DY');
      const rawOverlayScale = window.localStorage.getItem('MEGA_STRIPE_OVERLAY_SCALE');
      const rawScale = window.localStorage.getItem('MEGA_STRIPE_SCALE');
      const rawRefEnabled = window.localStorage.getItem('MEGA_STRIPE_REF_ENABLED');
      const rawRefSrc = window.localStorage.getItem('MEGA_STRIPE_REF_SRC');
      const rawRefCol = window.localStorage.getItem('MEGA_STRIPE_REF_COLLECTION');
      const rawRefDx = window.localStorage.getItem('MEGA_STRIPE_REF_DX');
      const rawRefDy = window.localStorage.getItem('MEGA_STRIPE_REF_DY');
      const rawRefScale = window.localStorage.getItem('MEGA_STRIPE_REF_SCALE');
      const rawRef2Enabled = window.localStorage.getItem('MEGA_STRIPE_REF2_ENABLED');
      const rawRef2Src = window.localStorage.getItem('MEGA_STRIPE_REF2_SRC');
      const rawRef2Dx = window.localStorage.getItem('MEGA_STRIPE_REF2_DX');
      const rawRef2Dy = window.localStorage.getItem('MEGA_STRIPE_REF2_DY');
      const rawRef2Scale = window.localStorage.getItem('MEGA_STRIPE_REF2_SCALE');
      const rawNudge = window.localStorage.getItem('MEGA_STRIPE_NUDGE_STEP');
      const rawTileGap = window.localStorage.getItem('MEGA_STRIPE_TILE_GAP_PX');
      const rawTileSelectorV1Enabled = window.localStorage.getItem('MEGA_TILE_SELECTOR_ENABLED');
      const rawTileSelectorEnabled = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_ENABLED');
      const rawTileSelectorTarget = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_TARGET');
      const rawTileSelectorSize = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_SIZE_PX');
      const rawTileSelectorStroke = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STROKE_PX');
      const rawTileSelectorColor = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_COLOR');
      const rawTileSelectorStepX = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_X');
      const rawTileSelectorStepY = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_Y');
      const rawTileSelectorRadius = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_RADIUS_PX');
      const rawTileSelectorExtTop = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_TOP_PX');
      const rawTileSelectorExtRight = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_RIGHT_PX');
      const rawTileSelectorExtBottom = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_BOTTOM_PX');
      const rawTileSelectorExtLeft = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_LEFT_PX');
      const dx = rawDx == null ? 0 : Number.parseFloat(String(rawDx));
      const dy = rawDy == null ? 0 : Number.parseFloat(String(rawDy));
      if (Number.isFinite(dx)) setMegaStripeDx(dx);
      if (Number.isFinite(dy)) setMegaStripeDy(dy);
      if (rawSpriteEnabled != null) {
        const v = String(rawSpriteEnabled).trim().toLowerCase();
        setMegaStripeSpriteEnabled(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
      }
      if (rawBelt != null) setMegaStripeBeltEnabled(rawBelt === '1');
      setMegaStripeOverlayMode('off');
      if (rawShirtDrawingEnabledNew != null) {
        const v = String(rawShirtDrawingEnabledNew).trim().toLowerCase();
        setMegaShirtDrawingEnabled(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
      } else if (rawShirtDrawingEnabledOld != null) {
        const v = String(rawShirtDrawingEnabledOld).trim().toLowerCase();
        setMegaShirtDrawingEnabled(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
      }
      if (rawShirtOverlayDx != null) {
        const n = Number.parseFloat(String(rawShirtOverlayDx));
        if (Number.isFinite(n)) setMegaShirtDrawingOverlayDx(n);
      }
      if (rawShirtOverlayDy != null) {
        const n = Number.parseFloat(String(rawShirtOverlayDy));
        if (Number.isFinite(n)) setMegaShirtDrawingOverlayDy(n);
      }
      if (rawShirtOverlayScale != null) {
        const n = Number.parseFloat(String(rawShirtOverlayScale));
        if (Number.isFinite(n) && n > 0) setMegaShirtDrawingOverlayScale(clampScale(n, 1));
      }

      const overlayKey = String(rawDrawingOverlaySrc || '').trim();
      const canonicalOverlayKey = canonicalStripeDrawingOverlayKey(overlayKey);
      let picked = null;
      try {
        const parsed = rawStripeDrawingMap ? JSON.parse(String(rawStripeDrawingMap)) : null;
        if (parsed && typeof parsed === 'object' && (canonicalOverlayKey || overlayKey)) {
          const v = (canonicalOverlayKey && parsed[canonicalOverlayKey]) || (overlayKey && parsed[overlayKey]);
          if (v && typeof v === 'object') picked = v;
        }
      } catch {
        picked = null;
      }

      const stripeDrawingDxFallbackRaw = picked?.dx ?? (rawStripeDrawingDx != null ? rawStripeDrawingDx : rawShirtOverlayDx);
      const stripeDrawingDyFallbackRaw = picked?.dy ?? (rawStripeDrawingDy != null ? rawStripeDrawingDy : rawShirtOverlayDy);
      const stripeDrawingScaleFallbackRaw = picked?.scale ?? (rawStripeDrawingScale != null ? rawStripeDrawingScale : rawShirtOverlayScale);

      if (stripeDrawingDxFallbackRaw != null) {
        const n = Number.parseFloat(String(stripeDrawingDxFallbackRaw));
        if (Number.isFinite(n)) setMegaStripeDrawingOverlayDx(n);
      }
      if (stripeDrawingDyFallbackRaw != null) {
        const n = Number.parseFloat(String(stripeDrawingDyFallbackRaw));
        if (Number.isFinite(n)) setMegaStripeDrawingOverlayDy(n);
      }
      if (stripeDrawingScaleFallbackRaw != null) {
        const n = Number.parseFloat(String(stripeDrawingScaleFallbackRaw));
        if (Number.isFinite(n) && n > 0) setMegaStripeDrawingOverlayScale(clampScale(n, 1));
      }

      if (rawOverlayDx != null) {
        const n = Number.parseFloat(String(rawOverlayDx));
        if (Number.isFinite(n)) setMegaStripeOverlayDx(n);
      }
      if (rawOverlayDy != null) {
        const n = Number.parseFloat(String(rawOverlayDy));
        if (Number.isFinite(n)) setMegaStripeOverlayDy(n);
      }
      if (rawOverlayScale != null) {
        const n = Number.parseFloat(String(rawOverlayScale));
        if (Number.isFinite(n) && n > 0) setMegaStripeOverlayScale(clampScale(n, 1));
      }
      if (rawScale != null) {
        const n = Number.parseFloat(String(rawScale));
        if (Number.isFinite(n) && n > 0) setMegaStripeScale(clampScale(n, 1.2125));
      }
      if (rawRefEnabled != null) setMegaStripeRefEnabled(rawRefEnabled === '1');
      if (rawRefSrc != null) setMegaStripeRefSrc(String(rawRefSrc));
      if (rawRef2Enabled != null) setMegaStripeRef2Enabled(rawRef2Enabled === '1');
      if (rawRef2Src != null) setMegaStripeRef2Src(String(rawRef2Src));
      if (rawRefCol != null) {
        const v = String(rawRefCol);
        const allowed = new Set(['first_contact', 'thin', 'austen', 'cube', 'miscel·lania', 'the_human_inside']);
        if (allowed.has(v)) {
          setMegaStripeRefCollection(v === 'the_human_inside' ? 'thin' : v);
        }
      }
      if (rawRefDx != null) {
        const n = Number.parseFloat(String(rawRefDx));
        if (Number.isFinite(n)) setMegaStripeRefDx(n);
      }
      if (rawRefDy != null) {
        const n = Number.parseFloat(String(rawRefDy));
        if (Number.isFinite(n)) setMegaStripeRefDy(n);
      }
      if (rawRefScale != null) {
        const n = Number.parseFloat(String(rawRefScale));
        if (Number.isFinite(n) && n > 0) setMegaStripeRefScale(clampScale(n, 1));
      }
      if (rawRef2Dx != null) {
        const n = Number.parseFloat(String(rawRef2Dx));
        if (Number.isFinite(n)) setMegaStripeRef2Dx(n);
      }
      if (rawRef2Dy != null) {
        const n = Number.parseFloat(String(rawRef2Dy));
        if (Number.isFinite(n)) setMegaStripeRef2Dy(n);
      }
      if (rawRef2Scale != null) {
        const n = Number.parseFloat(String(rawRef2Scale));
        if (Number.isFinite(n) && n > 0) setMegaStripeRef2Scale(clampScale(n, 1));
      }
      if (rawNudge != null) {
        const n = Number.parseInt(String(rawNudge), 10);
        if (Number.isFinite(n) && n > 0) setMegaStripeNudgeStep(Math.min(50, Math.max(1, n)));
      }
      if (rawTileGap != null) {
        const n = Number.parseFloat(String(rawTileGap));
        if (Number.isFinite(n)) setMegaStripeTileGapPx(Math.min(200, Math.max(-200, n)));
      }

      if (rawTileSelectorV1Enabled != null) {
        const v = String(rawTileSelectorV1Enabled).trim().toLowerCase();
        setMegaTileSelectorV1Enabled(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
      }

      if (rawTileSelectorEnabled != null) {
        const v = String(rawTileSelectorEnabled).trim().toLowerCase();
        setMegaTileSelectorEnabled(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
      }
      if (rawTileSelectorTarget != null) setMegaTileSelectorTarget(String(rawTileSelectorTarget));
      if (rawTileSelectorSize != null) {
        const n = Number.parseFloat(String(rawTileSelectorSize));
        if (Number.isFinite(n) && n > 0) setMegaTileSelectorSizePx(Math.min(800, Math.max(20, n)));
      }
      if (rawTileSelectorStroke != null) {
        const n = Number.parseFloat(String(rawTileSelectorStroke));
        if (Number.isFinite(n) && n >= 0) setMegaTileSelectorStrokePx(Math.min(80, Math.max(0, n)));
      }
      if (rawTileSelectorColor != null) setMegaTileSelectorColor(String(rawTileSelectorColor));
      if (rawTileSelectorStepX != null) {
        const n = Number.parseFloat(String(rawTileSelectorStepX));
        if (Number.isFinite(n)) setMegaTileSelectorStepX(Math.min(99, Math.max(-99, n)));
      }
      if (rawTileSelectorStepY != null) {
        const n = Number.parseFloat(String(rawTileSelectorStepY));
        if (Number.isFinite(n)) setMegaTileSelectorStepY(Math.min(99, Math.max(-99, n)));
      }
      if (rawTileSelectorRadius != null) {
        const n = Number.parseFloat(String(rawTileSelectorRadius));
        if (Number.isFinite(n)) setMegaTileSelectorRadiusPx(Math.min(200, Math.max(0, n)));
      }
      if (rawTileSelectorExtTop != null) {
        const n = Number.parseFloat(String(rawTileSelectorExtTop));
        if (Number.isFinite(n)) setMegaTileSelectorExtendTopPx(Math.min(500, Math.max(-500, n)));
      }
      if (rawTileSelectorExtRight != null) {
        const n = Number.parseFloat(String(rawTileSelectorExtRight));
        if (Number.isFinite(n)) setMegaTileSelectorExtendRightPx(Math.min(500, Math.max(-500, n)));
      }
      if (rawTileSelectorExtBottom != null) {
        const n = Number.parseFloat(String(rawTileSelectorExtBottom));
        if (Number.isFinite(n)) setMegaTileSelectorExtendBottomPx(Math.min(500, Math.max(-500, n)));
      }
      if (rawTileSelectorExtLeft != null) {
        const n = Number.parseFloat(String(rawTileSelectorExtLeft));
        if (Number.isFinite(n)) setMegaTileSelectorExtendLeftPx(Math.min(500, Math.max(-500, n)));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_ENABLED', megaTileSelectorEnabled ? '1' : '0');
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_TARGET', String(megaTileSelectorTarget || ''));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_SIZE_PX', String(Math.min(800, Math.max(20, Number(megaTileSelectorSizePx) || 200))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_STROKE_PX', String(Math.min(80, Math.max(0, Number(megaTileSelectorStrokePx) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_COLOR', String(megaTileSelectorColor || 'black'));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_STEP_X', String(Math.min(99, Math.max(-99, Number(megaTileSelectorStepX) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_STEP_Y', String(Math.min(99, Math.max(-99, Number(megaTileSelectorStepY) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_RADIUS_PX', String(Math.min(200, Math.max(0, Number(megaTileSelectorRadiusPx) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_EXTEND_TOP_PX', String(Math.min(500, Math.max(-500, Number(megaTileSelectorExtendTopPx) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_EXTEND_RIGHT_PX', String(Math.min(500, Math.max(-500, Number(megaTileSelectorExtendRightPx) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_EXTEND_BOTTOM_PX', String(Math.min(500, Math.max(-500, Number(megaTileSelectorExtendBottomPx) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_EXTEND_LEFT_PX', String(Math.min(500, Math.max(-500, Number(megaTileSelectorExtendLeftPx) || 0))));
      window.dispatchEvent(new Event('mega-tile-selector-changed'));
    } catch {
      // ignore
    }
  }, [megaTileSelectorColor, megaTileSelectorEnabled, megaTileSelectorExtendBottomPx, megaTileSelectorExtendLeftPx, megaTileSelectorExtendRightPx, megaTileSelectorExtendTopPx, megaTileSelectorRadiusPx, megaTileSelectorSizePx, megaTileSelectorStepX, megaTileSelectorStepY, megaTileSelectorStrokePx, megaTileSelectorTarget]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_TILE_SELECTOR_ENABLED', megaTileSelectorV1Enabled ? '1' : '0');
      window.dispatchEvent(new Event('mega-tile-selector-changed'));
    } catch {
      // ignore
    }
  }, [megaTileSelectorV1Enabled]);

  useEffect(() => {
    const path = (location?.pathname || '').toString();
    const activeRoute = path === '/full-wide-slide' || path === '/full-wide-slide-demo';
    if (!activeRoute) {
      window.localStorage.removeItem('MEGA_STRIPE_HUD_LOCKED_TOP');
      return;
    }
    if (Number.isFinite(megaStripeHudLockedTopPx) && megaStripeHudLockedTopPx > 0) {
      window.localStorage.setItem('MEGA_STRIPE_HUD_LOCKED_TOP', String(megaStripeHudLockedTopPx));
    }
  }, [location?.pathname, megaStripeHudLockedTopPx]);

  useEffect(() => {
    const path = (location?.pathname || '').toString();
    const activeRoute = path === '/full-wide-slide' || path === '/full-wide-slide-demo';
    if (!activeRoute) return;
    try {
      const flagKey = 'MEGA_STRIPE_HUD_OWN_H_DOUBLED_ONCE';
      const undoKey = 'MEGA_STRIPE_HUD_OWN_H_UNDO_DOUBLING_ONCE';
      const doubled = window.localStorage.getItem(flagKey) === '1';
      const undone = window.localStorage.getItem(undoKey) === '1';
      if (doubled && !undone) {
        const raw = window.localStorage.getItem('MEGA_STRIPE_HUD_OWN_H');
        const n = raw == null ? NaN : Number.parseFloat(String(raw));
        if (Number.isFinite(n) && n > 0) {
          const halved = Math.min(2000, Math.max(160, n / 2));
          window.localStorage.setItem('MEGA_STRIPE_HUD_OWN_H', String(halved));
          setMegaStripeHudOwnHPx(halved);
        }
        window.localStorage.setItem(undoKey, '1');
        window.localStorage.removeItem(flagKey);
      }
    } catch {
      // ignore
    }

    try {
      const tripledKey = 'MEGA_STRIPE_HUD_OWN_H_TRIPLED_ONCE';
      if (window.localStorage.getItem(tripledKey) !== '1') {
        const raw = window.localStorage.getItem('MEGA_STRIPE_HUD_OWN_H');
        const fromStorage = raw == null ? NaN : Number.parseFloat(String(raw));
        const base = Number.isFinite(fromStorage) && fromStorage > 0
          ? fromStorage
          : (Number.isFinite(megaStripeHudOwnHPx) && megaStripeHudOwnHPx > 0 ? megaStripeHudOwnHPx : 360);
        const next = Math.min(3000, Math.max(160, base * 3));
        window.localStorage.setItem('MEGA_STRIPE_HUD_OWN_H', String(next));
        window.localStorage.setItem(tripledKey, '1');
        setMegaStripeHudOwnHPx(next);
      }
    } catch {
      // ignore
    }

    try {
      const plus20Key = 'MEGA_STRIPE_HUD_OWN_H_PLUS20_ONCE';
      if (window.localStorage.getItem(plus20Key) !== '1') {
        const raw = window.localStorage.getItem('MEGA_STRIPE_HUD_OWN_H');
        const fromStorage = raw == null ? NaN : Number.parseFloat(String(raw));
        const base = Number.isFinite(fromStorage) && fromStorage > 0
          ? fromStorage
          : (Number.isFinite(megaStripeHudOwnHPx) && megaStripeHudOwnHPx > 0 ? megaStripeHudOwnHPx : 360);
        const next = Math.min(3000, Math.max(160, base * 1.2));
        window.localStorage.setItem('MEGA_STRIPE_HUD_OWN_H', String(next));
        window.localStorage.setItem(plus20Key, '1');
        setMegaStripeHudOwnHPx(next);
      }
    } catch {
      // ignore
    }

    try {
      if (Number.isFinite(megaStripeHudOwnHPx) && megaStripeHudOwnHPx > 0) {
        window.localStorage.setItem('MEGA_STRIPE_HUD_OWN_H', String(megaStripeHudOwnHPx));
      }
    } catch {
      // ignore
    }
  }, [location?.pathname, megaStripeHudOwnHPx]);

  useEffect(() => {
    try {
      const dx = Number.isFinite(megaStripeDx) ? megaStripeDx : 0;
      const dy = Number.isFinite(megaStripeDy) ? megaStripeDy : 0;
      document.documentElement.style.setProperty('--megaStripeDx', `${dx}px`);
      document.documentElement.style.setProperty('--megaStripeDy', `${dy}px`);
      window.localStorage.setItem('MEGA_STRIPE_DX', String(dx));
      window.localStorage.setItem('MEGA_STRIPE_DY', String(dy));
    } catch {
      // ignore
    }
  }, [megaStripeDx, megaStripeDy]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_STRIPE_SPRITE_ENABLED', megaStripeSpriteEnabled ? '1' : '0');
      window.dispatchEvent(new Event('mega-stripe-sprite-enabled-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeSpriteEnabled]);

  useEffect(() => {
    try {
      const dx = Number.isFinite(megaStripeOverlayDx) ? megaStripeOverlayDx : 0;
      const dy = Number.isFinite(megaStripeOverlayDy) ? megaStripeOverlayDy : 0;
      document.documentElement.style.setProperty('--megaStripeOverlayDx', `${dx}px`);
      document.documentElement.style.setProperty('--megaStripeOverlayDy', `${dy}px`);
      window.localStorage.setItem('MEGA_STRIPE_OVERLAY_DX', String(dx));
      window.localStorage.setItem('MEGA_STRIPE_OVERLAY_DY', String(dy));
      window.dispatchEvent(new Event('mega-stripe-overlay-mode-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeOverlayDx, megaStripeOverlayDy]);

  useEffect(() => {
    try {
      const v = Number.isFinite(megaStripeOverlayScale) ? megaStripeOverlayScale : 1;
      const clamped = clampScale(v, 1);
      document.documentElement.style.setProperty('--megaStripeOverlayScale', String(clamped));
      window.localStorage.setItem('MEGA_STRIPE_OVERLAY_SCALE', String(clamped));
      window.dispatchEvent(new Event('mega-stripe-overlay-mode-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeOverlayScale]);

  useEffect(() => {
    try {
      const s = Number.isFinite(megaStripeScale) ? megaStripeScale : 1.2125;
      const clamped = clampScale(s, 1.2125);
      document.documentElement.style.setProperty('--megaStripeScale', String(clamped));
      window.localStorage.setItem('MEGA_STRIPE_SCALE', String(clamped));
    } catch {
      // ignore
    }
  }, [megaStripeScale]);

  useEffect(() => {
    try {
      const dx = Number.isFinite(megaStripeRefDx) ? megaStripeRefDx : 0;
      const dy = Number.isFinite(megaStripeRefDy) ? megaStripeRefDy : 0;
      document.documentElement.style.setProperty('--megaStripeRefDx', `${dx}px`);
      document.documentElement.style.setProperty('--megaStripeRefDy', `${dy}px`);
      window.localStorage.setItem('MEGA_STRIPE_REF_DX', String(dx));
      window.localStorage.setItem('MEGA_STRIPE_REF_DY', String(dy));
      window.dispatchEvent(new Event('mega-stripe-ref-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRefDx, megaStripeRefDy]);

  useEffect(() => {
    try {
      const dx = Number.isFinite(megaStripeRef2Dx) ? megaStripeRef2Dx : 0;
      const dy = Number.isFinite(megaStripeRef2Dy) ? megaStripeRef2Dy : 0;
      document.documentElement.style.setProperty('--megaStripeRef2Dx', `${dx}px`);
      document.documentElement.style.setProperty('--megaStripeRef2Dy', `${dy}px`);
      window.localStorage.setItem('MEGA_STRIPE_REF2_DX', String(dx));
      window.localStorage.setItem('MEGA_STRIPE_REF2_DY', String(dy));
      window.dispatchEvent(new Event('mega-stripe-ref2-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRef2Dx, megaStripeRef2Dy]);

  useEffect(() => {
    try {
      const v = Number.isFinite(megaStripeRefScale) ? megaStripeRefScale : 1;
      const clamped = clampScale(v, 1);
      document.documentElement.style.setProperty('--megaStripeRefScale', String(clamped));
      window.localStorage.setItem('MEGA_STRIPE_REF_SCALE', String(clamped));
      window.dispatchEvent(new Event('mega-stripe-ref-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRefScale]);

  useEffect(() => {
    try {
      const v = Number.isFinite(megaStripeRef2Scale) ? megaStripeRef2Scale : 1;
      const clamped = clampScale(v, 1);
      document.documentElement.style.setProperty('--megaStripeRef2Scale', String(clamped));
      window.localStorage.setItem('MEGA_STRIPE_REF2_SCALE', String(clamped));
      window.dispatchEvent(new Event('mega-stripe-ref2-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRef2Scale]);

  useEffect(() => {
    try {
      const raw = Number.isFinite(megaStripeTileGapPx) ? megaStripeTileGapPx : 0;
      const v = Math.min(200, Math.max(-200, raw));
      document.documentElement.style.setProperty('--megaStripeTileGapPx', `${v}px`);
      window.localStorage.setItem('MEGA_STRIPE_TILE_GAP_PX', String(v));
      window.dispatchEvent(new Event('mega-stripe-tile-gap-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeTileGapPx]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_STRIPE_BELT', megaStripeBeltEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, [megaStripeBeltEnabled]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_STRIPE_OVERLAY_MODE', 'off');
      window.dispatchEvent(new Event('mega-stripe-overlay-mode-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeOverlayMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem('HG_SHIRT_DRAWING_ENABLED', megaShirtDrawingEnabled ? '1' : '0');
      window.dispatchEvent(new Event('hg-shirt-drawing-enabled-changed'));
    } catch {
      // ignore
    }
  }, [megaShirtDrawingEnabled]);

  useEffect(() => {
    const sync = () => {
      try {
        setMegaShirtDrawingOverlaySrc(String(window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC') || ''));
      } catch {
        setMegaShirtDrawingOverlaySrc('');
      }
    };
    sync();
    window.addEventListener('hg-drawing-overlay-changed', sync);
    return () => window.removeEventListener('hg-drawing-overlay-changed', sync);
  }, []);

  useEffect(() => {
    const path = (location?.pathname || '').toString();
    const activeRoute = path === '/full-wide-slide' || path === '/full-wide-slide-demo';
    if (!activeRoute) return;

    const overlayKey = String(megaShirtDrawingOverlaySrc || '').trim();
    if (!overlayKey) return;
    const canonicalOverlayKey = canonicalStripeDrawingOverlayKey(overlayKey);

    try {
      const rawStripeDrawingMap = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC');
      const parsed = rawStripeDrawingMap ? JSON.parse(String(rawStripeDrawingMap)) : null;
      const entry = parsed && typeof parsed === 'object'
        ? ((canonicalOverlayKey && parsed[canonicalOverlayKey]) || parsed[overlayKey])
        : null;
      if (entry && typeof entry === 'object') {
        const dx = Number.parseFloat(String(entry.dx));
        const dy = Number.parseFloat(String(entry.dy));
        const scale = Number.parseFloat(String(entry.scale));
        setMegaStripeDrawingOverlayDx(Number.isFinite(dx) ? dx : 0);
        setMegaStripeDrawingOverlayDy(Number.isFinite(dy) ? dy : 0);
        setMegaStripeDrawingOverlayScale(Number.isFinite(scale) && scale > 0 ? clampScale(scale, 1) : 1);
      } else {
        setMegaStripeDrawingOverlayDx(0);
        setMegaStripeDrawingOverlayDy(0);
        setMegaStripeDrawingOverlayScale(1);
      }
    } catch {
      setMegaStripeDrawingOverlayDx(0);
      setMegaStripeDrawingOverlayDy(0);
      setMegaStripeDrawingOverlayScale(1);
    }
  }, [location?.pathname, megaShirtDrawingOverlaySrc]);

  useEffect(() => {
    try {
      const dx = Number.isFinite(megaShirtDrawingOverlayDx) ? megaShirtDrawingOverlayDx : 0;
      const dy = Number.isFinite(megaShirtDrawingOverlayDy) ? megaShirtDrawingOverlayDy : 0;
      document.documentElement.style.setProperty('--hgShirtOverlayDx', `${dx}px`);
      document.documentElement.style.setProperty('--hgShirtOverlayDy', `${dy}px`);
      window.localStorage.setItem('HG_SHIRT_DRAWING_OVERLAY_DX', String(dx));
      window.localStorage.setItem('HG_SHIRT_DRAWING_OVERLAY_DY', String(dy));
      window.dispatchEvent(new Event('hg-shirt-drawing-overlay-transform-changed'));
    } catch {
      // ignore
    }
  }, [megaShirtDrawingOverlayDx, megaShirtDrawingOverlayDy]);

  useEffect(() => {
    try {
      const dx = Number.isFinite(megaStripeDrawingOverlayDx) ? megaStripeDrawingOverlayDx : 0;
      const dy = Number.isFinite(megaStripeDrawingOverlayDy) ? megaStripeDrawingOverlayDy : 0;
      document.documentElement.style.setProperty('--megaStripeDrawingOverlayDx', `${dx}px`);
      document.documentElement.style.setProperty('--megaStripeDrawingOverlayDy', `${dy}px`);
      window.localStorage.setItem('MEGA_STRIPE_DRAWING_OVERLAY_DX', String(dx));
      window.localStorage.setItem('MEGA_STRIPE_DRAWING_OVERLAY_DY', String(dy));

      const overlayKey = String(megaShirtDrawingOverlaySrc || '').trim();
      if (overlayKey) {
        const canonicalOverlayKey = canonicalStripeDrawingOverlayKey(overlayKey);
        const keyToWrite = canonicalOverlayKey || overlayKey;
        const rawStripeDrawingMap = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC');
        let parsed = null;
        try {
          parsed = rawStripeDrawingMap ? JSON.parse(String(rawStripeDrawingMap)) : null;
        } catch {
          parsed = null;
        }
        const out = parsed && typeof parsed === 'object' ? { ...parsed } : {};
        const prev = out[keyToWrite];
        const next = { ...(prev && typeof prev === 'object' ? prev : {}), dx, dy };
        out[keyToWrite] = next;
        if (canonicalOverlayKey && canonicalOverlayKey !== overlayKey) out[overlayKey] = next;
        window.localStorage.setItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC', JSON.stringify(out));
      }
    } catch {
      // ignore
    }
  }, [megaStripeDrawingOverlayDx, megaStripeDrawingOverlayDy, megaShirtDrawingOverlaySrc]);

  useEffect(() => {
    try {
      const v = Number.isFinite(megaShirtDrawingOverlayScale) ? megaShirtDrawingOverlayScale : 1;
      const clamped = clampScale(v, 1);
      document.documentElement.style.setProperty('--hgShirtOverlayScale', String(clamped));
      window.localStorage.setItem('HG_SHIRT_DRAWING_OVERLAY_SCALE', String(clamped));
      window.dispatchEvent(new Event('hg-shirt-drawing-overlay-transform-changed'));
    } catch {
      // ignore
    }
  }, [megaShirtDrawingOverlayScale]);

  useEffect(() => {
    try {
      const v = Number.isFinite(megaStripeDrawingOverlayScale) ? megaStripeDrawingOverlayScale : 1;
      const clamped = clampScale(v, 1);
      document.documentElement.style.setProperty('--megaStripeDrawingOverlayScale', String(clamped));
      window.localStorage.setItem('MEGA_STRIPE_DRAWING_OVERLAY_SCALE', String(clamped));

      const overlayKey = String(megaShirtDrawingOverlaySrc || '').trim();
      if (overlayKey) {
        const canonicalOverlayKey = canonicalStripeDrawingOverlayKey(overlayKey);
        const keyToWrite = canonicalOverlayKey || overlayKey;
        const rawStripeDrawingMap = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC');
        let parsed = null;
        try {
          parsed = rawStripeDrawingMap ? JSON.parse(String(rawStripeDrawingMap)) : null;
        } catch {
          parsed = null;
        }
        const out = parsed && typeof parsed === 'object' ? { ...parsed } : {};
        const prev = out[keyToWrite];
        const next = { ...(prev && typeof prev === 'object' ? prev : {}), scale: clamped };
        out[keyToWrite] = next;
        if (canonicalOverlayKey && canonicalOverlayKey !== overlayKey) out[overlayKey] = next;
        window.localStorage.setItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC', JSON.stringify(out));
      }
    } catch {
      // ignore
    }
  }, [megaStripeDrawingOverlayScale, megaShirtDrawingOverlaySrc]);

  useEffect(() => {
    const v = String(megaStripeOverlayMode || 'off');
    if (v !== 'off') megaStripeLastNonOffOverlayModeRef.current = v;
  }, [megaStripeOverlayMode]);

  useEffect(() => {
    try {
      const v = String(megaStripeOverlayMode || 'off');
      if (v !== 'off') {
        setStripeEditTool((prev) => (String(prev || 'ref') === 'ref' ? 'overlay' : prev));
      }
    } catch {
      // ignore
    }
  }, [megaStripeOverlayMode]);

  useEffect(() => {
    try {
      const prev = String(prevMegaStripeOverlayModeRef.current || 'off');
      const cur = String(megaStripeOverlayMode || 'off');
      prevMegaStripeOverlayModeRef.current = cur;
      if (prev === 'off' && cur !== 'off') {
        setMegaStripeOverlayDx(0);
        setMegaStripeOverlayDy(0);
      }
    } catch {
      // ignore
    }
  }, [megaStripeOverlayMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_STRIPE_REF_ENABLED', megaStripeRefEnabled ? '1' : '0');
      window.localStorage.setItem('MEGA_STRIPE_REF_SRC', String(megaStripeRefSrc || ''));
      window.localStorage.setItem('MEGA_STRIPE_REF_COLLECTION', String(megaStripeRefCollection || 'first_contact'));
      window.dispatchEvent(new Event('mega-stripe-ref-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRefCollection, megaStripeRefEnabled, megaStripeRefSrc]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_STRIPE_REF2_ENABLED', megaStripeRef2Enabled ? '1' : '0');
      window.localStorage.setItem('MEGA_STRIPE_REF2_SRC', String(megaStripeRef2Src || ''));
      window.dispatchEvent(new Event('mega-stripe-ref2-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRef2Enabled, megaStripeRef2Src]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_STRIPE_NUDGE_STEP', String(Math.min(50, Math.max(1, Math.round(megaStripeNudgeStep || 1)))));
    } catch {
      // ignore
    }
  }, [megaStripeNudgeStep]);

  useLayoutEffect(() => {
    const path = (location?.pathname || '').toString();
    const activeRoute = path === '/full-wide-slide' || path === '/full-wide-slide-demo';
    if (!activeRoute) {
      if (megaStripeHudLockedHPx != null) setMegaStripeHudLockedHPx(null);
      if (megaStripeHudLockedTopPx != null) setMegaStripeHudLockedTopPx(null);
      return;
    }
    if (megaStripeHudLockedHPx != null) return;
    const vh = (typeof window !== 'undefined' && Number.isFinite(window.innerHeight)) ? window.innerHeight : 0;
    if (!Number.isFinite(vh) || vh <= 0) return;
    const h = Math.max(0, Math.round(vh));
    if (h <= 0) return;
    setMegaStripeHudLockedHPx(h);
  }, [location?.pathname, megaStripeHudOwnHPx]);

  useLayoutEffect(() => {
    const path = (location?.pathname || '').toString();
    const activeRoute = path === '/full-wide-slide' || path === '/full-wide-slide-demo';
    if (!activeRoute) return undefined;

    let raf = null;
    const update = () => {
      try {
        const lastTop = megaStripeLastGoodHudTopPxRef.current;
        const effectiveTop = Number.isFinite(megaStripeHudLockedTopPx)
          ? megaStripeHudLockedTopPx
          : (Number.isFinite(megaStripeHudTopPx)
            ? megaStripeHudTopPx
            : (Number.isFinite(lastTop) ? lastTop : 0));
        const top = Number.isFinite(effectiveTop) ? effectiveTop : 0;
        const vh = (typeof window !== 'undefined' && Number.isFinite(window.innerHeight)) ? window.innerHeight : 0;
        const available = Math.max(0, vh - top - 80);

        // Heurística sense scroll: quants presets caben segons espai vertical.
        const estimatedHeaderAndInputsPx = 140;
        const estimatedRowPx = 30;
        const max = Math.max(4, Math.min(30, Math.floor((available - estimatedHeaderAndInputsPx) / estimatedRowPx)));
        setMegaStripeHudMaxRefPresets((prev) => (prev === max ? prev : max));
      } catch {
        // ignore
      }
    };

    const onResize = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        update();
      });
    };

    update();
    window.addEventListener('resize', onResize);
    return () => {
      if (raf != null) window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [location?.pathname, megaStripeHudTopPx, megaStripeHudLockedTopPx]);

  useLayoutEffect(() => {
    const path = (location?.pathname || '').toString();
    const activeRoute = path === '/full-wide-slide' || path === '/full-wide-slide-demo';
    if (!activeRoute) {
      try {
        document.documentElement.style.removeProperty('--megaStripeHudTopPx');
        document.documentElement.style.removeProperty('--megaStripeHudHPx');
        document.documentElement.style.removeProperty('--megaStripeHudBottomHPx');
      } catch {
        // ignore
      }
      return undefined;
    }

    const setVars = () => {
      try {
        const fallbackH = Number.isFinite(megaStripeHudOwnHPx) ? Math.max(0, Math.round(megaStripeHudOwnHPx)) : 0;
        if (fallbackH > 0) {
          document.documentElement.style.setProperty('--megaStripeHudBottomHPx', `${fallbackH}px`);
        }
        const el = megaStripeHudWrapRef.current;
        const rect = el?.getBoundingClientRect?.();
        const h = rect && Number.isFinite(rect.height) ? Math.max(0, Math.round(rect.height)) : 0;
        document.documentElement.style.setProperty('--megaStripeHudBottomHPx', `${h}px`);
      } catch {
        // ignore
      }
    };

    setVars();
    let raf = 0;
    const onResize = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(setVars);
    };
    window.addEventListener('resize', onResize);

    let ro = null;
    try {
      const el = megaStripeHudWrapRef.current;
      if (el && typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => {
          if (raf) window.cancelAnimationFrame(raf);
          raf = window.requestAnimationFrame(setVars);
        });
        ro.observe(el);
      }
    } catch {
      // ignore
    }

    return () => {
      try {
        if (raf) window.cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        if (ro) ro.disconnect();
      } catch {
        // ignore
      }
    };
  }, [location?.pathname, megaStripeHudTopPx, megaStripeHudLockedHPx, megaStripeHudLockedTopPx]);

  useLayoutEffect(() => {
    const path = (location?.pathname || '').toString();
    const activeRoute = path === '/full-wide-slide' || path === '/full-wide-slide-demo';
    if (!activeRoute) {
      setMegaStripeHudSnapDyPx(0);
      return undefined;
    }

    let raf = 0;
    const update = () => {
      try {
        const el = megaStripeHudWrapRef.current;
        const rect = el?.getBoundingClientRect?.();
        const top = rect && Number.isFinite(rect.top) ? rect.top : null;
        if (top == null) return;

        const dpr = (typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio)) ? window.devicePixelRatio : 1;
        const step = dpr > 1 ? (1 / dpr) : 1;
        const snappedTop = Math.round(top / step) * step;
        const delta = snappedTop - top;

        setMegaStripeHudSnapDyPx((prev) => {
          const a = Number.isFinite(prev) ? prev : 0;
          const b = Number.isFinite(delta) ? delta : 0;
          if (Math.abs(a - b) < 0.001) return prev;
          return b;
        });
      } catch {
        // ignore
      }
    };

    const schedule = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(update);
    };

    schedule();

    try {
      window.addEventListener('resize', schedule);
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('orientationchange', schedule);
    } catch {
      // ignore
    }

    return () => {
      try {
        if (raf) window.cancelAnimationFrame(raf);
        window.removeEventListener('resize', schedule);
        window.removeEventListener('scroll', schedule, { passive: true });
        window.removeEventListener('orientationchange', schedule);
      } catch {
        // ignore
      }
    };
  }, [location?.pathname, megaStripeHudOwnHPx]);

  useLayoutEffect(() => {
    const path = (location?.pathname || '').toString();
    const activeRoute = path === '/full-wide-slide' || path === '/full-wide-slide-demo';
    if (!activeRoute) return undefined;

    let raf = 0;
    const update = () => {
      try {
        const el = megaStripeParamsGridRef.current;
        const rect = el?.getBoundingClientRect?.();
        const h = rect && Number.isFinite(rect.height) ? rect.height : null;
        if (h == null || h <= 0) return;
        const cellH = h / 18;
        el.style.setProperty('--megaStripeHudCellHPx', `${cellH}px`);
      } catch {
        // ignore
      }
    };

    const schedule = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(update);
    };

    schedule();

    let ro = null;
    try {
      const el = megaStripeParamsGridRef.current;
      if (el && typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(schedule);
        ro.observe(el);
      }
    } catch {
      // ignore
    }

    try {
      window.addEventListener('resize', schedule);
    } catch {
      // ignore
    }

    return () => {
      try {
        if (raf) window.cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
        window.removeEventListener('resize', schedule);
      } catch {
        // ignore
      }
    };
  }, [location?.pathname]);

  useEffect(() => {
    const path = (location?.pathname || '').toString();
    const activeRoute = path === '/full-wide-slide' || path === '/full-wide-slide-demo';
    if (!activeRoute) return undefined;

    const shouldIgnoreEvent = (e) => {
      try {
        if (!e) return true;
        if (e.defaultPrevented) return true;
        const el = typeof document !== 'undefined' ? document.activeElement : null;
        const tag = (el?.tagName || '').toString().toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
        if (el?.isContentEditable) return true;
        return false;
      } catch {
        return true;
      }
    };

    const onKeyDown = (e) => {
      if (shouldIgnoreEvent(e)) return;

      const k = (e.key || '').toString();
      const step = e.shiftKey ? 5 : 0.5;
      const overlayStep = step * 0.5;
      const tileStep = (e.shiftKey ? 1 : 0.1) * 0.5;

      // Do not block browser zoom shortcuts (Cmd/Ctrl + +/-/0)
      if ((e.metaKey || e.ctrlKey) && (k === '+' || k === '=' || k === '-' || k === '_' || k === '0')) {
        return;
      }

      if (!e.altKey && !e.ctrlKey && !e.metaKey) {
        const kc = k.toLowerCase();
        if (kc === 'c') {
          e.preventDefault();
          if (stripeEditTool === 'overlay') {
            setMegaStripeDrawingOverlayDx(0);
            setMegaStripeDrawingOverlayDy(0);
            setMegaStripeDrawingOverlayScale(1);
          } else if (stripeEditTool === 'ref2') {
            setMegaStripeRef2Dx(0);
            setMegaStripeRef2Dy(0);
            setMegaStripeRef2Scale(1);
          } else if (stripeEditTool === 'tile') {
            setMegaStripeTileGapPx(0);
          } else {
            setMegaStripeRefDx(0);
            setMegaStripeRefDy(0);
          }
          return;
        }
        if (kc === 'o') {
          e.preventDefault();
          setStripeEditTool('overlay');
          return;
        }
        if (kc === 'r') {
          e.preventDefault();
          setStripeEditTool('ref');
          return;
        }
        if (kc === 't') {
          e.preventDefault();
          setStripeEditTool('tile');
          return;
        }
        if (kc === '2') {
          e.preventDefault();
          setMegaStripeRef2Enabled(true);
          setMegaStripeRef2Src((prev) => (String(prev || '').trim() ? prev : megaStripeRefSrc));
          setStripeEditTool('ref2');
          return;
        }
      }

      if (k === 'ArrowLeft') {
        e.preventDefault();
        if (stripeEditTool === 'ref2') setMegaStripeRef2Dx((v) => (Number.isFinite(v) ? v - step : -step));
        else if (stripeEditTool === 'overlay') setMegaStripeDrawingOverlayDx((v) => (Number.isFinite(v) ? v - overlayStep : -overlayStep));
        else if (stripeEditTool === 'tile') setMegaStripeTileGapPx((v) => (Number.isFinite(v) ? Math.min(200, Math.max(-200, v - tileStep)) : -tileStep));
        else setMegaStripeRefDx((v) => (Number.isFinite(v) ? v - step : -step));
        return;
      }
      if (k === 'ArrowRight') {
        e.preventDefault();
        if (stripeEditTool === 'ref2') setMegaStripeRef2Dx((v) => (Number.isFinite(v) ? v + step : step));
        else if (stripeEditTool === 'overlay') setMegaStripeDrawingOverlayDx((v) => (Number.isFinite(v) ? v + overlayStep : overlayStep));
        else if (stripeEditTool === 'tile') setMegaStripeTileGapPx((v) => (Number.isFinite(v) ? Math.min(200, Math.max(-200, v + tileStep)) : tileStep));
        else setMegaStripeRefDx((v) => (Number.isFinite(v) ? v + step : step));
        return;
      }
      if (k === 'ArrowUp') {
        e.preventDefault();
        if (stripeEditTool === 'ref2') setMegaStripeRef2Dy((v) => (Number.isFinite(v) ? v - step : -step));
        else if (stripeEditTool === 'overlay') setMegaStripeDrawingOverlayDy((v) => (Number.isFinite(v) ? v - overlayStep : -overlayStep));
        else if (stripeEditTool === 'tile') setMegaStripeTileGapPx((v) => (Number.isFinite(v) ? Math.min(200, Math.max(-200, v - tileStep)) : -tileStep));
        else setMegaStripeRefDy((v) => (Number.isFinite(v) ? v - step : -step));
        return;
      }
      if (k === 'ArrowDown') {
        e.preventDefault();
        if (stripeEditTool === 'ref2') setMegaStripeRef2Dy((v) => (Number.isFinite(v) ? v + step : step));
        else if (stripeEditTool === 'overlay') setMegaStripeDrawingOverlayDy((v) => (Number.isFinite(v) ? v + overlayStep : overlayStep));
        else if (stripeEditTool === 'tile') setMegaStripeTileGapPx((v) => (Number.isFinite(v) ? Math.min(200, Math.max(-200, v + tileStep)) : tileStep));
        else setMegaStripeRefDy((v) => (Number.isFinite(v) ? v + step : step));
        return;
      }

      // Keep old nudge step adjust but move to Alt +/-
      if (e.altKey && (k === '+' || k === '=')) {
        e.preventDefault();
        setMegaStripeNudgeStep((v) => {
          const n = Math.min(50, Math.max(1, Math.round(Number.isFinite(v) ? v : 1) + 1));
          return n;
        });
        return;
      }
      if (e.altKey && (k === '-' || k === '_')) {
        e.preventDefault();
        setMegaStripeNudgeStep((v) => {
          const n = Math.min(50, Math.max(1, Math.round(Number.isFinite(v) ? v : 1) - 1));
          return n;
        });
        return;
      }

      // Scale controls: + / - (no scrolls, no HUD sliders)
      if (k === '+' || k === '=') {
        if (stripeEditTool === 'tile') return;
        e.preventDefault();
        const inc = e.shiftKey ? 0.1 : 0.01;

        if (stripeEditTool === 'overlay') {
          setMegaStripeDrawingOverlayScale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = clampScale(+(cur + inc).toFixed(4), 1);
            return next;
          });
          return;
        }
        if (stripeEditTool === 'ref2') {
          setMegaStripeRef2Scale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = clampScale(+(cur + inc).toFixed(4), 1);
            return next;
          });
          return;
        }
        if (stripeEditTool === 'ref') {
          setMegaStripeRefScale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = clampScale(+(cur + inc).toFixed(4), 1);
            return next;
          });
          return;
        }
        setMegaStripeScale((v) => {
          const cur = Number.isFinite(v) ? v : 1.2125;
          const next = clampScale(+(cur + inc).toFixed(4), 1.2125);
          return next;
        });
        return;
      }
      if (k === '-' || k === '_') {
        if (stripeEditTool === 'tile') return;
        e.preventDefault();
        const dec = e.shiftKey ? 0.1 : 0.01;

        if (stripeEditTool === 'overlay') {
          setMegaStripeDrawingOverlayScale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = clampScale(+(cur - dec).toFixed(4), 1);
            return next;
          });
          return;
        }
        if (stripeEditTool === 'ref2') {
          setMegaStripeRef2Scale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = clampScale(+(cur - dec).toFixed(4), 1);
            return next;
          });
          return;
        }
        if (stripeEditTool === 'ref') {
          setMegaStripeRefScale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = clampScale(+(cur - dec).toFixed(4), 1);
            return next;
          });
          return;
        }
        setMegaStripeScale((v) => {
          const cur = Number.isFinite(v) ? v : 1.2125;
          const next = clampScale(+(cur - dec).toFixed(4), 1.2125);
          return next;
        });
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [location?.pathname, megaStripeNudgeStep, stripeEditTool]);

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
      { key: 'DJ Vader', src: '/tmp/CALIBRTGE/miscel·lania/outcasted-dj-vader-black-white.png' },
      { key: 'Deathstar2D2', src: '/tmp/CALIBRTGE/miscel·lania/outcasted-dead-star2d2-black-white.png' },
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
      'miscel·lania': miscellania,
      the_human_inside: theHumanInside,
    };
  }, []);

  const BeltReferenceOverlay = ({ enabled }) => {
    const [state, setState] = useState({ xL: null, xR: null, yT: null, yB: null, spriteXL: null, spriteXR: null });
    const capturedRef = useRef(false);

    useLayoutEffect(() => {
      if (!enabled) {
        capturedRef.current = false;
        return undefined;
      }

      let t1 = 0;
      let t2 = 0;
      let t3 = 0;

      const read = () => {
        if (capturedRef.current) return;

        const resolveX = (el, edge) => {
          const r = el?.getBoundingClientRect?.();
          if (!r) return null;
          const x = edge === 'right' ? r.right : r.left;
          return Number.isFinite(x) ? Math.round(x) : null;
        };
        const resolveY = (el, edge) => {
          const r = el?.getBoundingClientRect?.();
          if (!r) return null;
          const y = edge === 'bottom' ? r.bottom : r.top;
          return Number.isFinite(y) ? Math.round(y) : null;
        };

        const leftAnchor = document.getElementById('stripe-guide-left-anchor');
        const rightArrow = document.getElementById('stripe-guide-right-arrow');
        const stripeImg = document.querySelector('img[src="/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp"]');

        const xL = resolveX(leftAnchor, 'left');
        const spriteXL = resolveX(stripeImg, 'left');
        const spriteXR = resolveX(stripeImg, 'right');
        const xR = resolveX(rightArrow, 'right');
        const yT = resolveY(stripeImg, 'top');
        const yB = resolveY(stripeImg, 'bottom');

        if (Number.isFinite(xL) || Number.isFinite(xR) || Number.isFinite(yT) || Number.isFinite(yB) || Number.isFinite(spriteXL) || Number.isFinite(spriteXR)) {
          setState({ xL, xR, yT, yB, spriteXL, spriteXR });
          capturedRef.current = true;
        }
      };

      read();
      t1 = window.setTimeout(read, 50);
      t2 = window.setTimeout(read, 250);
      t3 = window.setTimeout(read, 750);

      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.clearTimeout(t3);
      };
    }, [enabled]);

    if (!enabled) return null;
    const color = 'rgba(22, 163, 74, 0.85)';

    return (
      <div className="fixed inset-0 pointer-events-none debug-exempt" style={{ zIndex: 36000 }} aria-hidden="true" data-dev-overlay="true">
        {Number.isFinite(state.xL) ? (
          <div style={{ position: 'fixed', left: state.xL, top: 0, height: '100vh', width: 0, borderLeft: `1px solid ${color}` }} />
        ) : null}
        {Number.isFinite(state.xR) ? (
          <div style={{ position: 'fixed', left: state.xR, top: 0, height: '100vh', width: 0, borderLeft: `1px solid ${color}` }} />
        ) : null}
        {Number.isFinite(state.spriteXL) ? (
          <div style={{ position: 'fixed', left: state.spriteXL, top: 0, height: '100vh', width: 0, borderLeft: `1px solid ${color}` }} />
        ) : null}
        {Number.isFinite(state.spriteXR) ? (
          <div style={{ position: 'fixed', left: state.spriteXR, top: 0, height: '100vh', width: 0, borderLeft: `1px solid ${color}` }} />
        ) : null}
        {Number.isFinite(state.yT) ? (
          <div style={{ position: 'fixed', left: 0, top: state.yT, width: '100vw', height: 0, borderTop: `1px solid ${color}` }} />
        ) : null}
        {Number.isFinite(state.yB) ? (
          <div style={{ position: 'fixed', left: 0, top: state.yB, width: '100vw', height: 0, borderTop: `1px solid ${color}` }} />
        ) : null}
        {/* Guia fixa verda a y=330 */}
        <div style={{ position: 'fixed', left: 0, top: 330, width: '100vw', height: 0, borderTop: `1px solid ${color}` }} />
      </div>
    );
  };

  const { config: slidesConfig } = useSlidesConfig();

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

  // Rodonetes desactivades
  useEffect(() => {
    // No mostrar rodonetes mai
    return;
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
  const isDemoStyleLayoutRoute = (isFullWideSlideDemoRoute || isFullWideSlideRoute);
  const isDevDemoRoute = isNikeDemoRoute || isFullWideSlideDemoRoute || isFullWideSlideRoute;
  const layoutInspectorActive = (isAdmin || isDevDemoRoute)
    ? layoutInspectorEnabled
    : false;
  const layoutInspectorWrap = Boolean(layoutInspectorActive);

  useEffect(() => {
    if (layoutInspectorActive) return;
    setClicksEnabled(false);
    setClickMarks([]);
  }, [layoutInspectorActive]);

  const normalizeMegaStripeRefSrc = useCallback((raw) => {
    try {
      const s0 = (raw == null) ? '' : String(raw);
      const s = s0.trim();
      if (!s) return '';
      if (/^https?:\/\//i.test(s)) return s;
      const idx = s.indexOf('/public/');
      if (idx >= 0) {
        const tail = s.slice(idx + '/public'.length);
        return tail.startsWith('/') ? tail : `/${tail}`;
      }
      if (s.startsWith('public/')) return `/${s.slice('public/'.length)}`;
      if (s.startsWith('/public/')) return s.slice('/public'.length);
      if (s.startsWith('./public/')) return `/${s.slice('./public/'.length)}`;
      if (s.startsWith('./')) return s.slice(1);
      const rawPath = (s.startsWith('/') ? s : `/${s}`);
      // Ensure filenames with spaces are valid in <img src> without forcing callers to pre-encode.
      return encodeURI(rawPath);
    } catch {
      return '';
    }
  }, []);

  useEffect(() => {
    const next = String(megaStripeRefSrc || '');
    setMegaStripeRef2Src((prev) => {
      const cur = String(prev || '');
      if (cur === next) return prev;
      return next;
    });
  }, [megaStripeRefSrc]);

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
  const isDevToolsRoute = location.pathname === '/dev-tools' || location.pathname.startsWith('/dev-tools/');
  const isDevComponentsRoute = location.pathname === '/dev-components' || location.pathname.startsWith('/proves/dev-components');
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
  const demoHeaderOffset = `${adminBannerHeight + rulerInset}px`;

  useEffect(() => {
    try {
      if (isFullScreenRoute) return;
      const nextOffset = isAdminRoute ? adminRouteOffset : (isDemoStyleLayoutRoute ? demoHeaderOffset : appHeaderOffset);
      document.documentElement.style.setProperty('--appHeaderOffset', nextOffset);
      document.documentElement.style.setProperty('--rulerInset', `${rulerInset}px`);
    } catch {
      // ignore
    }
  }, [adminRouteOffset, demoHeaderOffset, appHeaderOffset, isAdminRoute, isDemoStyleLayoutRoute, isFullScreenRoute, rulerInset]);

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
              adminBannerHeight={adminBannerHeight}
              rulerInset={rulerInset}
              cartItemCount={getTotalItems()}
              onCartClick={() => toggleSlidePreset(cartPresetId)}
              onUserClick={() => toggleSlidePreset(viewPresetId)}
            />
          )}

      {/* Main Header - NO mostrar a pàgines full-screen ni admin ni a dev tools */}
      {!isFullScreenRoute && !isAdminRoute && !isDemoStyleLayoutRoute && !isDevHeaderRoute && (
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

                <Route path="/wishlist" element={<Navigate to="/" replace />} />

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

        {rulersOverlayActive && (
          <DevGuidesOverlay
            guidesEnabled={guidesEnabled}
            zIndex={1300000}
          />
        )}

            {(isFullWideSlideDemoRoute || isFullWideSlideRoute) ? (
              <div
                ref={megaStripeHudWrapRef}
                className="debug-exempt"
                data-dev-overlay-hud="mega-stripe"
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: hudCollapsed ? 'auto' : Math.max(160, Math.round(Number.isFinite(megaStripeHudOwnHPx) ? megaStripeHudOwnHPx : 360)),
                  maxHeight: '100vh',
                  paddingLeft: 16,
                  paddingRight: 16,
                  zIndex: 1000000,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  transform: (Number.isFinite(megaStripeHudSnapDyPx) && Math.abs(megaStripeHudSnapDyPx) > 0.001) ? `translateY(${megaStripeHudSnapDyPx}px)` : undefined,
                  display: 'none',
                  flexDirection: 'column',
                  pointerEvents: 'none',
                  transition: 'height 300ms ease',
                  overflow: hudCollapsed ? 'hidden' : 'visible',
                }}
              >
                <div
                  style={{
                    background: '#b91c1c',
                    color: 'rgba(255,255,255,0.92)',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '2px solid #7f1d1d',
                    maxWidth: '100%',
                    pointerEvents: 'auto',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, minWidth: 0, overflow: 'hidden' }}>
                    <button type="button" onClick={() => setHudCollapsed(!hudCollapsed)} style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.25)', color: 'inherit', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }} title={hudCollapsed ? 'Desplegar HUD' : 'Plegar HUD'}>{hudCollapsed ? '↓' : '↑'}</button>
                    <span style={{ flexShrink: 0 }}>HUD</span>
                    {!hudCollapsed && (
                      <div style={{ display: 'flex', gap: 4, marginLeft: 10, overflow: 'hidden' }}>
                        {['Stripe', 'Cercador', 'Cistell', 'Usr'].map((tab) => (
                          <button key={tab} type="button" onClick={() => setHudActiveTab(tab.toLowerCase())} style={{ background: hudActiveTab === tab.toLowerCase() ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.20)', color: 'inherit', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: hudActiveTab === tab.toLowerCase() ? 800 : 600, cursor: 'pointer', opacity: hudActiveTab === tab.toLowerCase() ? 1 : 0.7, flexShrink: 0 }}>{tab}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  {(() => {
                    const refSelected = stripeEditTool === 'ref';
                    const ref2Selected = stripeEditTool === 'ref2';
                    const overlaySelected = stripeEditTool === 'overlay';
                    const tileSelected = stripeEditTool === 'tile';
                    const beltOn = Boolean(megaStripeBeltEnabled);
                    const onStyle = { fontWeight: 900, opacity: 0.98 };
                    const offStyle = { fontWeight: 300, opacity: 0.28 };
                    const btnBase = {
                      fontSize: 13,
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: 'rgba(0,0,0,0.20)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      color: 'inherit',
                      userSelect: 'none',
                      lineHeight: 1,
                    };
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', left: -20 }}>
                        <button
                          type="button"
                          style={{ ...btnBase, ...(refSelected ? onStyle : offStyle) }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setStripeEditTool('ref');
                          }}
                        >
                          REF
                        </button>
                        <button
                          type="button"
                          style={{ ...btnBase, ...(ref2Selected ? onStyle : offStyle) }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMegaStripeRef2Enabled(true);
                            setMegaStripeRef2Src((prev) => (String(prev || '').trim() ? prev : megaStripeRefSrc));
                            setStripeEditTool('ref2');
                          }}
                        >
                          REF2
                        </button>
                        <button
                          type="button"
                          style={{
                            ...btnBase,
                            ...(overlaySelected ? onStyle : offStyle),
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setStripeEditTool('overlay');
                          }}
                        >
                          OVERLAY
                        </button>
                        <button
                          type="button"
                          style={{ ...btnBase, ...(tileSelected ? onStyle : offStyle) }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setStripeEditTool('tile');
                          }}
                        >
                          TILE
                        </button>
                        <button
                          type="button"
                          style={{ ...btnBase, ...(beltOn ? onStyle : offStyle) }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setMegaStripeBeltEnabled((prev) => !prev);
                          }}
                        >
                          BELT
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.96)',
                    border: '1px solid rgba(0,0,0,0.10)',
                    borderTop: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    boxShadow: 'none',
                    overflow: 'auto',
                    pointerEvents: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 380px)',
                    gap: 10,
                    alignItems: 'stretch',
                    padding: 10,
                    flex: 1,
                    minHeight: 0,
                    position: 'relative',
                  }}
                >
                    {hudActiveTab === 'cistell' && !cistellExpanded && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.98)', display: 'flex', flexDirection: 'column', zIndex: 10, pointerEvents: 'auto', overflow: 'auto', padding: '20px 24px' }}>
                        <div style={{ fontFamily: 'Roboto, sans-serif', color: '#000', maxWidth: 480 }}>
                          {/* Selector de layout */}
                          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                            <button onClick={() => setCistellLayout(1)} style={{ padding: '4px 10px', fontSize: 10, fontFamily: 'Roboto, sans-serif', fontWeight: cistellLayout === 1 ? 700 : 400, background: cistellLayout === 1 ? '#000' : '#f0f0f0', color: cistellLayout === 1 ? '#fff' : '#666', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Layout 1</button>
                            <button onClick={() => setCistellLayout(2)} style={{ padding: '4px 10px', fontSize: 10, fontFamily: 'Roboto, sans-serif', fontWeight: cistellLayout === 2 ? 700 : 400, background: cistellLayout === 2 ? '#000' : '#f0f0f0', color: cistellLayout === 2 ? '#fff' : '#666', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Layout 2</button>
                            <button onClick={() => setCistellLayout(3)} style={{ padding: '4px 10px', fontSize: 10, fontFamily: 'Roboto, sans-serif', fontWeight: cistellLayout === 3 ? 700 : 400, background: cistellLayout === 3 ? '#000' : '#f0f0f0', color: cistellLayout === 3 ? '#fff' : '#666', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Layout 3</button>
                            <button onClick={() => setCistellLayout(4)} style={{ padding: '4px 10px', fontSize: 10, fontFamily: 'Roboto, sans-serif', fontWeight: cistellLayout === 4 ? 700 : 400, background: cistellLayout === 4 ? '#000' : '#f0f0f0', color: cistellLayout === 4 ? '#fff' : '#666', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Imatge</button>
                          </div>
                          
                          {/* Header compacte */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, borderBottom: '2px solid #000', paddingBottom: 8 }}>
                            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', margin: 0, lineHeight: 1.2 }}>CISTELL (2)</h2>
                            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>34,90€</div>
                          </div>
                          
                          {/* Renderitzar layout segons selecció */}
                          {cistellLayout === 1 && <CistellLayout1 onExpand={() => setCistellExpanded(true)} />}
                          {cistellLayout === 2 && <CistellLayout2 onExpand={() => setCistellExpanded(true)} />}
                          {cistellLayout === 3 && <CistellLayout3 onExpand={() => setCistellExpanded(true)} />}
                          {cistellLayout === 4 && <CistellLayout4 onExpand={() => setCistellExpanded(true)} />}
                        </div>
                      </div>
                    )}
                    {hudActiveTab === 'cistell' && cistellExpanded && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.96)', display: 'flex', flexDirection: 'column', zIndex: 10, pointerEvents: 'auto', overflow: 'auto', padding: 16 }}>
                        <div style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', color: '#000' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase', margin: 0 }}>LA MEVA COMANDA 🛒</h2>
                            <button onClick={() => setCistellExpanded(false)} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderRadius: 4 }}>← Tornar</button>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                            {/* Producte 1: WORMHOLE */}
                            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 12 }}>
                              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>WORMHOLE</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>QUANTITAT:</span> 1</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>TALLATGE:</span> L</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>IMPORT:</span> 15,76€</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>IVA 21%:</span> 4,19€</div>
                              <div style={{ fontSize: 12, fontWeight: 800 }}><span style={{ fontWeight: 800 }}>PVP:</span> 19,95€</div>
                            </div>

                            {/* Producte 2: MASCHINENMENSCH */}
                            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 12 }}>
                              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>MASCHINENMENSCH</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>QUANTITAT:</span> 1</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>TALLATGE:</span> M</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>IMPORT:</span> 11,81€</div>
                              <div style={{ fontSize: 12, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>IVA 21%:</span> 3,14€</div>
                              <div style={{ fontSize: 12, fontWeight: 800 }}><span style={{ fontWeight: 800 }}>PVP:</span> 14,95€</div>
                            </div>
                          </div>

                          {/* Total */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 16, borderTop: '2px solid #000', marginBottom: 20 }}>
                            <div style={{ fontSize: 18, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOT PLEGAT</div>
                            <div style={{ fontSize: 28, fontWeight: 900 }}>34,90€</div>
                          </div>

                          {/* Seccions expandides */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Dades d'usuari</div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Classe de gas</div>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                              <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }} />
                              <span>He vist i estic d'acord amb les condicions</span>
                            </label>

                            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 8 }}>Enviament i facturació</div>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                              <input type="checkbox" style={{ width: 16, height: 16 }} />
                              <span>És igual l'adreça de facturació que la de compra</span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                              <input type="checkbox" style={{ width: 16, height: 16 }} />
                              <span>Ja ho sé i no vull cobrar</span>
                            </label>

                            <div style={{ fontWeight: 600, marginTop: 8 }}>On vols que ho enviem?</div>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                              <input type="checkbox" defaultChecked style={{ width: 16, height: 16 }} />
                              <span>Adreça que em mostri en el moment de la compra</span>
                            </label>

                            <div style={{ fontWeight: 600, marginTop: 8 }}>On vols que les facturem?</div>

                            {/* Botó Pagament */}
                            <button style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '14px', fontSize: 16, fontWeight: 700, cursor: 'pointer', borderRadius: 4, marginTop: 16 }}>Pagament</button>

                            {/* Footer */}
                            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.6)', textAlign: 'center', lineHeight: 1.6, marginTop: 16 }}>
                              <div>Política de reemborsament | Política d'enviament</div>
                              <div>Política de privacitat | Termes del servei</div>
                              <div style={{ marginTop: 8 }}>Higgins Gràfic 2026</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {hudActiveTab !== 'stripe' && hudActiveTab !== 'cistell' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'auto' }}>
                        <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.5)' }}>
                          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, textTransform: 'capitalize' }}>{hudActiveTab}</div>
                          <div style={{ fontSize: 13 }}>Contingut de la pestanya {hudActiveTab}</div>
                        </div>
                      </div>
                    )}
                    <div
                      ref={megaStripeParamsGridRef}
                      style={{
                        minWidth: 0,
                        border: '1px solid rgba(0,0,0,0.45)',
                        backgroundColor: 'transparent',
                        padding: 8,
                        position: 'relative',
                        display: 'grid',
                        gridTemplateRows: 'auto auto auto auto',
                        gap: 6,
                      }}
                    >
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, shapeRendering: 'crispEdges' }}
                      >
                        {Array.from({ length: 7 }).map((_, i) => {
                          // Amaga separadors verticals interns de les cel·les ajuntades (17.2-17.6 i 18.2-18.6)
                          if (i >= 2 && i <= 5) return null;
                          const x = (i / 6) * 100;
                          return (
                            <line
                              key={`hud-grid-v-${i}`}
                              x1={x}
                              y1={0}
                              x2={x}
                              y2={100}
                              stroke="rgba(148,163,184,0.80)"
                              strokeWidth={0.5}
                              vectorEffect="non-scaling-stroke"
                            />
                          );
                        })}
                        {Array.from({ length: 21 }).map((_, j) => {
                          const y = (j / 20) * 100;
                          return (
                            <line
                              key={`hud-grid-h-${j}`}
                              x1={0}
                              y1={y}
                              x2={100}
                              y2={y}
                              stroke="rgba(148,163,184,0.80)"
                              strokeWidth={0.5}
                              vectorEffect="non-scaling-stroke"
                            />
                          );
                        })}
                      </svg>
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          pointerEvents: 'none',
                          zIndex: 30,
                        }}
                      >
                        {Array.from({ length: 20 }).map((_, rIdx) => (
                          Array.from({ length: 6 }).map((__, cIdx) => {
                            const topPct = (rIdx / 20) * 100;
                            const leftPct = (cIdx / 6) * 100;
                            return (
                              <div
                                key={`hud-struct-cell-${rIdx + 1}-${cIdx + 1}`}
                                style={{
                                  position: 'absolute',
                                  top: `${topPct}%`,
                                  left: `${leftPct}%`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-start',
                                  padding: '1px 3px',
                                  fontSize: 8,
                                  fontWeight: 900,
                                  color: 'rgba(2,6,23,0.28)',
                                  letterSpacing: -0.35,
                                  fontVariantNumeric: 'tabular-nums',
                                  userSelect: 'none',
                                }}
                              >
                                {`${rIdx + 1}.${cIdx + 1}`}
                              </div>
                            );
                          })
                        ))}
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          top: `${(16 / 20) * 100}%`,
                          left: '0%',
                          width: `${(1 / 6) * 100}%`,
                          height: `${(4 / 20) * 100}%`,
                          background: 'rgba(255,255,255,1)',
                          border: '0.5px solid rgba(148,163,184,0.80)',
                          boxSizing: 'border-box',
                          pointerEvents: 'none',
                          zIndex: -1,
                        }}
                      />

                      <div
                        style={{
                          position: 'absolute',
                          top: `${(19 / 20) * 100}%`,
                          left: `${(1 / 6) * 100}%`,
                          width: `${(3 / 6) * 100}%`,
                          height: `${(1 / 20) * 100}%`,
                          background: 'rgba(255,255,255,1)',
                          border: '0.5px solid rgba(148,163,184,0.80)',
                          boxSizing: 'border-box',
                          pointerEvents: 'none',
                          zIndex: -1,
                        }}
                      />

                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                          gridTemplateRows: 'repeat(20, minmax(0, 1fr))',
                          gap: 0,
                          minWidth: 0,
                          minHeight: 0,
                          zIndex: 1,
                        }}
                      >
                        {(() => {
                            const safeGetLs = (k) => {
                              try {
                                return String(window.localStorage.getItem(k) || '');
                              } catch {
                                return '';
                              }
                            };

                            const safeGetLsJson = (k) => {
                              try {
                                const raw = safeGetLs(k);
                                if (!raw) return null;
                                const parsed = JSON.parse(raw);
                                return parsed && typeof parsed === 'object' ? parsed : null;
                              } catch {
                                return null;
                              }
                            };

                            const readGridCalibFromLocalStorage = () => {
                              try {
                                const scalesByCollection = {};
                                const offsetsByCollection = {};
                                const ls = window.localStorage;
                                if (!ls) return { scalesByCollection, offsetsByCollection };

                                for (let i = 0; i < ls.length; i += 1) {
                                  const key = ls.key(i);
                                  if (!key) continue;
                                  if (key.startsWith('HG_GRID_SCALES_')) {
                                    const collection = key.slice('HG_GRID_SCALES_'.length);
                                    const parsed = safeGetLsJson(key);
                                    if (parsed) scalesByCollection[collection] = parsed;
                                  } else if (key.startsWith('HG_GRID_OFFSETS_')) {
                                    const collection = key.slice('HG_GRID_OFFSETS_'.length);
                                    const parsed = safeGetLsJson(key);
                                    if (parsed) offsetsByCollection[collection] = parsed;
                                  }
                                }

                                return { scalesByCollection, offsetsByCollection };
                              } catch {
                                return { scalesByCollection: {}, offsetsByCollection: {} };
                              }
                            };

                            const gridCalib = readGridCalibFromLocalStorage();

                            const payload = {
                              shortcuts: {
                                o: 'overlay (drawingOverlay)',
                                r: 'ref',
                                t: 'tile gap',
                                2: 'ref2',
                              },
                              overlay: {
                                enabled: Boolean(megaShirtDrawingEnabled),
                                dx: Number.isFinite(megaShirtDrawingOverlayDx) ? megaShirtDrawingOverlayDx : 0,
                                dy: Number.isFinite(megaShirtDrawingOverlayDy) ? megaShirtDrawingOverlayDy : 0,
                                scale: Number.isFinite(megaShirtDrawingOverlayScale) ? megaShirtDrawingOverlayScale : 1,
                                src: safeGetLs('HG_DRAWING_OVERLAY_SRC').trim(),
                              },
                              ref: {
                                enabled: Boolean(megaStripeRefEnabled),
                                collection: String(megaStripeRefCollection || ''),
                                src: String(megaStripeRefSrc || ''),
                                dx: Number.isFinite(megaStripeRefDx) ? megaStripeRefDx : 0,
                                dy: Number.isFinite(megaStripeRefDy) ? megaStripeRefDy : 0,
                                scale: Number.isFinite(megaStripeRefScale) ? megaStripeRefScale : 1,
                              },
                              tile: {
                                gapPx: Number.isFinite(megaStripeTileGapPx) ? megaStripeTileGapPx : 0,
                              },
                              ref2: {
                                enabled: Boolean(megaStripeRef2Enabled),
                                src: String(megaStripeRef2Src || ''),
                                dx: Number.isFinite(megaStripeRef2Dx) ? megaStripeRef2Dx : 0,
                                dy: Number.isFinite(megaStripeRef2Dy) ? megaStripeRef2Dy : 0,
                                scale: Number.isFinite(megaStripeRef2Scale) ? megaStripeRef2Scale : 1,
                              },
                              selector: {
                                enabled: Boolean(megaTileSelectorEnabled),
                                target: String(megaTileSelectorTarget || ''),
                                sizePx: Number.isFinite(megaTileSelectorSizePx) ? megaTileSelectorSizePx : 200,
                                strokePx: Number.isFinite(megaTileSelectorStrokePx) ? megaTileSelectorStrokePx : 10,
                                color: String(megaTileSelectorColor || 'black'),
                                stepX: Number.isFinite(megaTileSelectorStepX) ? megaTileSelectorStepX : 0,
                                stepY: Number.isFinite(megaTileSelectorStepY) ? megaTileSelectorStepY : 0,
                                radiusPx: Number.isFinite(megaTileSelectorRadiusPx) ? megaTileSelectorRadiusPx : 8,
                                extendTopPx: Number.isFinite(megaTileSelectorExtendTopPx) ? megaTileSelectorExtendTopPx : 0,
                                extendRightPx: Number.isFinite(megaTileSelectorExtendRightPx) ? megaTileSelectorExtendRightPx : 0,
                                extendBottomPx: Number.isFinite(megaTileSelectorExtendBottomPx) ? megaTileSelectorExtendBottomPx : 0,
                                extendLeftPx: Number.isFinite(megaTileSelectorExtendLeftPx) ? megaTileSelectorExtendLeftPx : 0,
                              },
                              gridCalib,
                              localStorageKeys: {
                                overlayEnabled: 'HG_SHIRT_DRAWING_ENABLED',
                                overlaySrc: 'HG_DRAWING_OVERLAY_SRC',
                                overlayDx: 'HG_SHIRT_DRAWING_OVERLAY_DX',
                                overlayDy: 'HG_SHIRT_DRAWING_OVERLAY_DY',
                                overlayScale: 'HG_SHIRT_DRAWING_OVERLAY_SCALE',
                                refEnabled: 'MEGA_STRIPE_REF_ENABLED',
                                refSrc: 'MEGA_STRIPE_REF_SRC',
                                refCollection: 'MEGA_STRIPE_REF_COLLECTION',
                                refDx: 'MEGA_STRIPE_REF_DX',
                                refDy: 'MEGA_STRIPE_REF_DY',
                                refScale: 'MEGA_STRIPE_REF_SCALE',
                                tileGapPx: 'MEGA_STRIPE_TILE_GAP_PX',
                                ref2Enabled: 'MEGA_STRIPE_REF2_ENABLED',
                                ref2Src: 'MEGA_STRIPE_REF2_SRC',
                                ref2Dx: 'MEGA_STRIPE_REF2_DX',
                                ref2Dy: 'MEGA_STRIPE_REF2_DY',
                                ref2Scale: 'MEGA_STRIPE_REF2_SCALE',
                                selectorEnabled: 'MEGA_TILE_SELECTOR_V2_ENABLED',
                                selectorTarget: 'MEGA_TILE_SELECTOR_V2_TARGET',
                                selectorSizePx: 'MEGA_TILE_SELECTOR_V2_SIZE_PX',
                                selectorStrokePx: 'MEGA_TILE_SELECTOR_V2_STROKE_PX',
                                selectorColor: 'MEGA_TILE_SELECTOR_V2_COLOR',
                                selectorStepX: 'MEGA_TILE_SELECTOR_V2_STEP_X',
                                selectorStepY: 'MEGA_TILE_SELECTOR_V2_STEP_Y',
                                selectorRadiusPx: 'MEGA_TILE_SELECTOR_V2_RADIUS_PX',
                                selectorExtendTopPx: 'MEGA_TILE_SELECTOR_V2_EXTEND_TOP_PX',
                                selectorExtendRightPx: 'MEGA_TILE_SELECTOR_V2_EXTEND_RIGHT_PX',
                                selectorExtendBottomPx: 'MEGA_TILE_SELECTOR_V2_EXTEND_BOTTOM_PX',
                                selectorExtendLeftPx: 'MEGA_TILE_SELECTOR_V2_EXTEND_LEFT_PX',
                                gridScalesPrefix: 'HG_GRID_SCALES_',
                                gridOffsetsPrefix: 'HG_GRID_OFFSETS_',
                              },
                            };

                            const doCopyText = async (value) => {
                              const text = String(value || '');
                              const fallbackCopy = () => {
                                try {
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
                                } catch {
                                  return false;
                                }
                              };
                              try {
                                if (navigator?.clipboard?.writeText) {
                                  await navigator.clipboard.writeText(text);
                                } else {
                                  const ok = fallbackCopy();
                                  if (!ok) throw new Error('copy_failed');
                                }
                                return true;
                              } catch {
                                return false;
                              }
                            };

                            const exportTabs = [
                              { id: 'all', label: 'ALL' },
                              { id: 'stripe', label: 'STRIPE' },
                              { id: 'overlay', label: 'OVERLAY' },
                              { id: 'selector', label: 'SELECTOR' },
                              { id: 'grid', label: 'GRID' },
                              { id: 'keys', label: 'KEYS' },
                            ];

                            const sectionsAll = [
                              { id: 'overlay', label: 'overlay', data: payload.overlay },
                              { id: 'ref', label: 'ref', data: payload.ref },
                              { id: 'ref2', label: 'ref2', data: payload.ref2 },
                              { id: 'tile', label: 'tile', data: payload.tile },
                              { id: 'selector', label: 'selector', data: payload.selector },
                              { id: 'gridCalib', label: 'gridCalib', data: payload.gridCalib },
                              { id: 'shortcuts', label: 'shortcuts', data: payload.shortcuts },
                              { id: 'localStorageKeys', label: 'localStorageKeys', data: payload.localStorageKeys },
                            ];

                            const sections = (() => {
                              const t = String(exportTab || 'all');
                              if (t === 'overlay') return sectionsAll.filter((s) => s.id === 'overlay');
                              if (t === 'selector') return sectionsAll.filter((s) => s.id === 'selector');
                              if (t === 'grid') return sectionsAll.filter((s) => s.id === 'gridCalib');
                              if (t === 'stripe') return sectionsAll.filter((s) => s.id === 'ref' || s.id === 'ref2' || s.id === 'tile');
                              if (t === 'keys') return sectionsAll.filter((s) => s.id === 'shortcuts' || s.id === 'localStorageKeys');
                              return sectionsAll;
                            })();

                            const tabPayload = (() => {
                              const t = String(exportTab || 'all');
                              if (t === 'overlay') return { overlay: payload.overlay };
                              if (t === 'selector') return { selector: payload.selector };
                              if (t === 'grid') return { gridCalib: payload.gridCalib };
                              if (t === 'stripe') return { ref: payload.ref, tile: payload.tile, ref2: payload.ref2 };
                              if (t === 'keys') return { shortcuts: payload.shortcuts, localStorageKeys: payload.localStorageKeys };
                              return payload;
                            })();

                            const tabText = JSON.stringify(tabPayload, null, 2);
                            const allText = JSON.stringify(payload, null, 2);

                            return (
                              <>
                                <div style={{ gridRow: '1', gridColumn: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 15, fontWeight: 900, color: 'rgba(0,0,0,0.70)', overflow: 'hidden' }}>
                                  EXPORT
                                </div>

                                <div style={{ gridRow: '2', gridColumn: '1', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 6, padding: '0 6px', overflow: 'hidden', minWidth: 0 }}>
                                  {exportTabs.map((t) => {
                                    const active = String(exportTab || 'all') === t.id;
                                    return (
                                      <button
                                        key={t.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setExportTab(t.id);
                                        }}
                                        style={{ height: 18, padding: '0 8px', borderRadius: 999, border: '1px solid rgba(0,0,0,0.15)', background: active ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: active ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap', flexShrink: 0 }}
                                      >
                                        {t.label}
                                      </button>
                                    );
                                  })}
                                </div>

                                <div style={{ gridRow: '3 / span 12', gridColumn: '1', width: '100%', height: '100%', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: 8, background: 'rgba(255,255,255,0.55)', minWidth: 0, overflow: 'auto' }}>
                                  {sections.map((s) => {
                                    const sectionText = JSON.stringify(s.data, null, 2);
                                    return (
                                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 6px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.25)', marginBottom: 6 }}>
                                        <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(2,6,23,0.70)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.label}>
                                          {s.label}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setExportModalTitle(String(s.label || ''));
                                              setExportModalText(sectionText);
                                              setExportModalOpen(true);
                                            }}
                                            style={{ height: 18, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.35)', color: 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}
                                          >
                                            VIEW
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setExportCopyStatus('copying');
                                              doCopyText(sectionText).then((ok) => {
                                                setExportCopyStatus(ok ? 'copied' : 'idle');
                                                window.setTimeout(() => setExportCopyStatus('idle'), 900);
                                              });
                                            }}
                                            style={{ height: 18, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: exportCopyStatus === 'copied' ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.35)', color: exportCopyStatus === 'copied' ? 'rgba(21,128,61,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap', transition: 'background 150ms ease, color 150ms ease' }}
                                          >
                                            {exportCopyStatus === 'copied' ? 'COPIED' : 'COPY'}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(2,6,23,0.55)', padding: '4px 6px', lineHeight: '12px' }}>
                                    {sections.length ? `${sections.length} sections` : '—'}
                                  </div>
                                </div>

                                <div style={{ gridRow: '15', gridColumn: '1', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 6px', minWidth: 0, overflow: 'hidden' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setExportModalTitle(`tab:${String(exportTab || 'all')}`);
                                        setExportModalText(tabText);
                                        setExportModalOpen(true);
                                      }}
                                      style={{ height: 18, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.35)', color: 'rgba(0,0,0,0.70)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}
                                    >
                                      VIEW TAB
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setExportCopyStatus('copying');
                                        doCopyText(tabText).then((ok) => {
                                          setExportCopyStatus(ok ? 'copied' : 'idle');
                                          window.setTimeout(() => setExportCopyStatus('idle'), 900);
                                        });
                                      }}
                                      style={{ height: 18, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: exportCopyStatus === 'copied' ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.35)', color: exportCopyStatus === 'copied' ? 'rgba(21,128,61,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap', transition: 'background 150ms ease, color 150ms ease' }}
                                    >
                                      {exportCopyStatus === 'copied' ? 'COPIED' : 'COPY TAB'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setExportCopyStatus('copying');
                                        doCopyText(allText).then((ok) => {
                                          setExportCopyStatus(ok ? 'copied' : 'idle');
                                          window.setTimeout(() => setExportCopyStatus('idle'), 900);
                                        });
                                      }}
                                      style={{ height: 18, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.35)', color: 'rgba(0,0,0,0.70)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}
                                    >
                                      COPY ALL
                                    </button>
                                  </div>
                                </div>

                                {exportModalOpen ? (
                                  <div
                                    style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(2,6,23,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}
                                    onClick={() => setExportModalOpen(false)}
                                    role="presentation"
                                  >
                                    <div
                                      style={{ width: 'min(980px, 96vw)', height: 'min(760px, 88vh)', background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(0,0,0,0.14)', borderRadius: 12, boxShadow: '0 30px 70px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                                      onClick={(e) => e.stopPropagation()}
                                      role="presentation"
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.10)' }}>
                                        <div style={{ fontSize: 12, fontWeight: 900, color: 'rgba(2,6,23,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                          {exportModalTitle || 'EXPORT'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setExportCopyStatus('copying');
                                              doCopyText(exportModalText).then((ok) => {
                                                setExportCopyStatus(ok ? 'copied' : 'idle');
                                                window.setTimeout(() => setExportCopyStatus('idle'), 900);
                                              });
                                            }}
                                            style={{ height: 22, padding: '0 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.14)', background: exportCopyStatus === 'copied' ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,1)', color: exportCopyStatus === 'copied' ? 'rgba(21,128,61,0.95)' : 'rgba(0,0,0,0.75)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}
                                          >
                                            {exportCopyStatus === 'copied' ? 'COPIED' : 'COPY'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setExportModalOpen(false);
                                            }}
                                            style={{ height: 22, padding: '0 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.14)', background: 'rgba(255,255,255,1)', color: 'rgba(0,0,0,0.75)', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap' }}
                                          >
                                            CLOSE
                                          </button>
                                        </div>
                                      </div>
                                      <textarea
                                        readOnly
                                        value={exportModalText}
                                        onClick={(e) => {
                                          try {
                                            e.stopPropagation();
                                            e.currentTarget.select?.();
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        style={{ flex: 1, width: '100%', height: '100%', resize: 'none', border: 0, borderRadius: 0, padding: 12, background: 'transparent', color: 'rgba(2,6,23,0.78)', fontSize: 11, fontWeight: 700, outline: 'none', lineHeight: '14px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                                      />
                                    </div>
                                  </div>
                                ) : null}
                              </>
                            );
                          })()}

                        <div style={{ gridRow: '1', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 15, fontWeight: 900, color: 'rgba(0,0,0,0.70)', overflow: 'hidden' }}>
                          OVERLAY
                        </div>

                        <div style={{ gridRow: '1', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 15, fontWeight: 900, color: 'rgba(0,0,0,0.70)', overflow: 'hidden' }}>
                          STRIPE
                        </div>

                        <div style={{ gridRow: '1', gridColumn: '6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 15, fontWeight: 900, color: 'rgba(0,0,0,0.70)', overflow: 'hidden' }}>
                          DEBUG
                        </div>

                        <div style={{ gridRow: '2', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.75)', lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, textAlign: 'left' }}>drawingOverlay</div>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input
                              type="text"
                              style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeDrawingOverlayDxDraft}
                              onFocus={() => { megaStripeDrawingOverlayDxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeDrawingOverlayDxInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeDrawingOverlayDxDraft);
                                if (n === null) {
                                  setMegaStripeDrawingOverlayDxDraft(String(megaStripeDrawingOverlayDx));
                                  return;
                                }
                                setMegaStripeDrawingOverlayDx(n);
                              }}
                              onChange={(e) => setMegaStripeDrawingOverlayDxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input
                              type="text"
                              style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeDrawingOverlayDyDraft}
                              onFocus={() => { megaStripeDrawingOverlayDyInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeDrawingOverlayDyInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeDrawingOverlayDyDraft);
                                if (n === null) {
                                  setMegaStripeDrawingOverlayDyDraft(String(megaStripeDrawingOverlayDy));
                                  return;
                                }
                                setMegaStripeDrawingOverlayDy(n);
                              }}
                              onChange={(e) => setMegaStripeDrawingOverlayDyDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>s:</div>
                            <input
                              type="text"
                              style={{ width: 56, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }}
                              value={megaStripeDrawingOverlayScaleDraft}
                              onFocus={() => { megaStripeDrawingOverlayScaleInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeDrawingOverlayScaleInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeDrawingOverlayScaleDraft);
                                if (n === null || n <= 0) {
                                  setMegaStripeDrawingOverlayScaleDraft(String(megaStripeDrawingOverlayScale));
                                  return;
                                }
                                setMegaStripeDrawingOverlayScale(clampScale(n, 1));
                              }}
                              onChange={(e) => setMegaStripeDrawingOverlayScaleDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                const fallbackCopy = (value) => {
                                  try {
                                    const ta = document.createElement('textarea');
                                    ta.value = String(value || '');
                                    ta.setAttribute('readonly', '');
                                    ta.style.position = 'fixed';
                                    ta.style.left = '-9999px';
                                    document.body.appendChild(ta);
                                    ta.select();
                                    const ok = document.execCommand('copy');
                                    document.body.removeChild(ta);
                                    return ok;
                                  } catch {
                                    return false;
                                  }
                                };
                                try {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const payload = JSON.stringify({
                                    dx: Number.isFinite(megaStripeDrawingOverlayDx) ? megaStripeDrawingOverlayDx : 0,
                                    dy: Number.isFinite(megaStripeDrawingOverlayDy) ? megaStripeDrawingOverlayDy : 0,
                                    scale: Number.isFinite(megaStripeDrawingOverlayScale) && megaStripeDrawingOverlayScale > 0 ? megaStripeDrawingOverlayScale : 1,
                                  });
                                  const run = async () => {
                                    try {
                                      if (navigator?.clipboard?.writeText) {
                                        await navigator.clipboard.writeText(payload);
                                        return true;
                                      }
                                      return fallbackCopy(payload);
                                    } catch {
                                      return fallbackCopy(payload);
                                    }
                                  };
                                  run();
                                } catch {
                                  // ignore
                                }
                              }}
                              style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.35)', color: 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              COPY
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                const apply = (next) => {
                                  try {
                                    const dx = Number.parseFloat(String(next?.dx));
                                    const dy = Number.parseFloat(String(next?.dy));
                                    const scale = Number.parseFloat(String(next?.scale));
                                    const dxOk = Number.isFinite(dx) ? dx : 0;
                                    const dyOk = Number.isFinite(dy) ? dy : 0;
                                    const scOk = Number.isFinite(scale) && scale > 0 ? clampScale(scale, 1) : 1;
                                    setMegaStripeDrawingOverlayDx(dxOk);
                                    setMegaStripeDrawingOverlayDy(dyOk);
                                    setMegaStripeDrawingOverlayScale(scOk);
                                    setMegaStripeDrawingOverlayDxDraft(String(dxOk));
                                    setMegaStripeDrawingOverlayDyDraft(String(dyOk));
                                    setMegaStripeDrawingOverlayScaleDraft(String(scOk));
                                  } catch {
                                    // ignore
                                  }
                                };
                                const parseText = (raw) => {
                                  try {
                                    const s = String(raw || '').trim();
                                    if (!s) return null;
                                    if (s.startsWith('{') || s.startsWith('[')) {
                                      const parsed = JSON.parse(s);
                                      if (Array.isArray(parsed)) {
                                        return { dx: parsed[0], dy: parsed[1], scale: parsed[2] };
                                      }
                                      if (parsed && typeof parsed === 'object') {
                                        return { dx: parsed.dx, dy: parsed.dy, scale: parsed.scale };
                                      }
                                    }
                                    const parts = s.split(/[,\s]+/g).filter(Boolean);
                                    if (parts.length >= 3) {
                                      return { dx: parts[0], dy: parts[1], scale: parts[2] };
                                    }
                                    return null;
                                  } catch {
                                    return null;
                                  }
                                };
                                try {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const run = async () => {
                                    let text = '';
                                    try {
                                      if (navigator?.clipboard?.readText) {
                                        text = await navigator.clipboard.readText();
                                      }
                                    } catch {
                                      text = '';
                                    }
                                    if (!text) {
                                      try {
                                        text = String(window.prompt('Paste drawingOverlay as JSON {dx,dy,scale} or "dx dy scale"', '') || '').trim();
                                      } catch {
                                        text = '';
                                      }
                                    }
                                    const parsed = parseText(text);
                                    if (parsed) apply(parsed);
                                  };
                                  run();
                                } catch {
                                  // ignore
                                }
                              }}
                              style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.35)', color: 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              PASTE
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                try {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMegaShirtDrawingEnabled((v) => !v);
                                } catch {
                                  // ignore
                                }
                              }}
                              style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaShirtDrawingEnabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaShirtDrawingEnabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              {megaShirtDrawingEnabled ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        </div>

                        <div style={{ gridRow: '20', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)', flexShrink: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>drawing src</div>
                          <input
                            value={megaShirtDrawingOverlaySrc}
                            placeholder="/custom_logos/..."
                            onChange={(e) => {
                              try {
                                const v = String(e.target.value || '');
                                const s = v.trim();
                                const normalized = (() => {
                                  try {
                                    const idx = s.lastIndexOf('/public/custom_logos/');
                                    if (idx >= 0) {
                                      const suffix = s.slice(idx + '/public'.length);
                                      if (suffix.startsWith('/custom_logos/')) return suffix;
                                    }
                                    const idx2 = s.lastIndexOf('/custom_logos/');
                                    if (idx2 > 0 && !s.startsWith('/custom_logos/')) {
                                      const suffix = s.slice(idx2);
                                      if (suffix.startsWith('/custom_logos/')) return suffix;
                                    }
                                    const file = (s.split('/').filter(Boolean).pop() || '').trim();
                                    const lower = file.toLowerCase();
                                    const isBare = s === file || s === `/${file}`;
                                    if (isBare && /^keep-calm-.*-stripe\.webp$/i.test(file)) {
                                      const folder = lower.includes('-b-stripe')
                                        ? 'black'
                                        : lower.includes('-w-stripe')
                                          ? 'white'
                                          : (lower.includes('multi') || lower.includes('-multi-'))
                                            ? 'multi'
                                            : 'multi';
                                      return `/custom_logos/drawings/images_stripe/austen/keep_calm/${folder}/${file}`;
                                    }
                                    return s;
                                  } catch {
                                    return s;
                                  }
                                })();
                                setMegaShirtDrawingOverlaySrc(normalized);
                                if (!normalized) return;
                                const sLower = normalized.toLowerCase();
                                const isStripeSrc = sLower.includes('/custom_logos/drawings/images_stripe/') || sLower.includes('/custom_logos/drawings/images_originals/stripe/');
                                if (!isStripeSrc) return;
                                window.localStorage.setItem('HG_DRAWING_OVERLAY_SRC', normalized);
                                window.dispatchEvent(new Event('hg-drawing-overlay-changed'));
                              } catch {
                                // ignore
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ flex: 1, height: 16, padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.60)', outline: 'none', minWidth: 0 }}
                          />
                        </div>

                        <div style={{ gridRow: '2', gridColumn: '6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.75)', lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, textAlign: 'left' }}>stripeOverlayDebug(URL)</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minWidth: 0, flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                try {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const sp = new URLSearchParams(location.search || '');
                                  const has = sp.has('stripeOverlayDebug');
                                  const cur = String(sp.get('stripeOverlayDebug') || '').trim().toLowerCase();
                                  const on = has && (cur === '' || cur === '1' || cur === 'true' || cur === 'on' || cur === 'yes');
                                  const next = new URLSearchParams(location.search || '');
                                  if (on) next.delete('stripeOverlayDebug');
                                  else next.set('stripeOverlayDebug', '1');
                                  const qs = next.toString();
                                  navigate(qs ? `${location.pathname}?${qs}` : location.pathname, { replace: true });
                                } catch {
                                }
                              }}
                              style={{ height: 20, display: 'flex', alignItems: 'center', padding: '0 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: (() => { const sp = new URLSearchParams(location.search || ''); const has = sp.has('stripeOverlayDebug'); const cur = String(sp.get('stripeOverlayDebug') || '').trim().toLowerCase(); return has && (cur === '' || cur === '1' || cur === 'true' || cur === 'on' || cur === 'yes') ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)'; })(), color: (() => { const sp = new URLSearchParams(location.search || ''); const has = sp.has('stripeOverlayDebug'); const cur = String(sp.get('stripeOverlayDebug') || '').trim().toLowerCase(); return has && (cur === '' || cur === '1' || cur === 'true' || cur === 'on' || cur === 'yes') ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)'; })(), fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              {(() => { const sp = new URLSearchParams(location.search || ''); const has = sp.has('stripeOverlayDebug'); const cur = String(sp.get('stripeOverlayDebug') || '').trim().toLowerCase(); const on = has && (cur === '' || cur === '1' || cur === 'true' || cur === 'on' || cur === 'yes'); return on ? 'ON' : 'OFF'; })()}
                            </button>
                          </div>
                        </div>

                        {(() => {
                          const snap = stripeOverlayDebugSnapshot;
                          const disabled = !stripeOverlayDebugOn;
                          const lsDrawingEnabledRaw = (() => {
                            try {
                              const rawNew = window.localStorage.getItem('HG_SHIRT_DRAWING_ENABLED');
                              if (rawNew != null) return rawNew;
                              const rawOld = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_ENABLED');
                              if (rawOld != null) return rawOld;
                              return '';
                            } catch {
                              return '';
                            }
                          })();
                          const lsDrawingEnabledOn = (() => {
                            try {
                              const s = (lsDrawingEnabledRaw == null) ? '' : String(lsDrawingEnabledRaw).trim().toLowerCase();
                              if (!s) return null;
                              return s === '1' || s === 'true' || s === 'on' || s === 'yes';
                            } catch {
                              return null;
                            }
                          })();
                          const formatActiveLabel = (value) => {
                            try {
                              const v = (value == null) ? '' : String(value);
                              const key = v.trim().toLowerCase();
                              if (!key) return '—';
                              if (key === 'outcasted') return 'Miscel·lània';
                              if (key === 'first_contact') return 'First Contact';
                              if (key === 'the_human_inside') return 'The Human Inside';
                              if (key === 'austen') return 'Austen';
                              if (key === 'cube') return 'Cube';
                              return v;
                            } catch {
                              return String(value || '—');
                            }
                          };
                          const debugPairs = [
                            ['stripeOverlayDebug', snap ? String(Boolean(snap.stripeOverlayDebug)) : '—'],
                            ['showStripe', snap ? String(Boolean(snap.showStripe)) : '—'],
                            ['active', snap ? formatActiveLabel(snap.active || '') : '—'],
                            ['loadState', snap ? String(snap.stripeOverlayLoadState || '') : '—'],
                            ['stripeWide', snap ? String(Boolean(snap.stripeOverlayIsStripeWide)) : '—'],
                            ['stripeWide(derived)', snap && snap.stripeOverlayIsStripeWideDerived !== null ? String(Boolean(snap.stripeOverlayIsStripeWideDerived)) : '—'],
                            ['stripeWide(measured)', snap && snap.stripeOverlayIsStripeWideMeasured !== null ? String(Boolean(snap.stripeOverlayIsStripeWideMeasured)) : '—'],
                            ['resolvedOverlaySrc', snap ? (snap.resolvedOverlaySrc ? 'yes' : 'no') : '—'],
                            ['HG_SHIRT_DRAWING', lsDrawingEnabledOn === null ? '—' : (lsDrawingEnabledOn ? 'ON' : 'OFF')],
                          ];

                          return (
                            <>
                              {debugPairs.map(([k, v], idx) => {
                                const row = String(3 + idx);
                                return (
                                  <div
                                    key={`stripeOverlayDebug-${k}`}
                                    style={{
                                      gridRow: row,
                                      gridColumn: '6',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: 6,
                                      padding: '0 6px',
                                      paddingLeft: 30,
                                      minWidth: 0,
                                      height: 'var(--megaStripeHudCellHPx)',
                                      overflow: 'hidden',
                                      opacity: disabled ? 0.35 : 1,
                                    }}
                                  >
                                    <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, lineHeight: '16px' }} title={String(k)}>
                                      {String(k)}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 300, color: 'rgba(0,0,0,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, textAlign: 'right', lineHeight: '16px' }} title={String(v)}>
                                      {String(v)}
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          );
                        })()}

                        <div style={{ gridRow: '2', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Sprite</div>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input
                              type="text"
                              style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeDxDraft}
                              onFocus={() => { megaStripeDxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeDxInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeDxDraft);
                                if (n === null) {
                                  setMegaStripeDxDraft(String(megaStripeDx));
                                  return;
                                }
                                setMegaStripeDx(n);
                              }}
                              onChange={(e) => setMegaStripeDxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input
                              type="text"
                              style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeDyDraft}
                              onFocus={() => { megaStripeDyInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeDyInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeDyDraft);
                                if (n === null) {
                                  setMegaStripeDyDraft(String(megaStripeDy));
                                  return;
                                }
                                setMegaStripeDy(n);
                              }}
                              onChange={(e) => setMegaStripeDyDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>s:</div>
                            <input
                              type="text"
                              style={{ width: 60, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }}
                              value={megaStripeScaleDraft}
                              onFocus={() => { megaStripeScaleInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeScaleInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeScaleDraft);
                                if (n === null || n <= 0) {
                                  setMegaStripeScaleDraft(String(megaStripeScale));
                                  return;
                                }
                                setMegaStripeScale(clampScale(n, 1.2125));
                              }}
                              onChange={(e) => setMegaStripeScaleDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMegaStripeSpriteEnabled((v) => !v);
                            }}
                            style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaStripeSpriteEnabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaStripeSpriteEnabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            {megaStripeSpriteEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        <div style={{ gridRow: '4', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>REF</div>
                            <select
                              value={String(megaStripeRefCollection || 'first_contact')}
                              onChange={(e) => {
                                try {
                                  const k = String(e.target.value || 'first_contact');
                                  setMegaStripeRefCollection(k);
                                  setMegaStripeRefEnabled((prev) => (prev ? prev : true));
                                  setMegaStripeRefSrc((prev) => {
                                    const cur = (prev == null) ? '' : String(prev);
                                    if (cur.trim()) return cur;
                                    const presets = megaStripeRefPresets?.[k] || [];
                                    const first = Array.isArray(presets) ? presets[0] : null;
                                    const src = first?.src ? normalizeMegaStripeRefSrc(first.src) : '';
                                    return src || cur;
                                  });
                                } catch {
                                  // ignore
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                              style={{ height: 18, flex: '0 0 auto', minWidth: 110, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 6, background: 'rgba(255,255,255,0.50)', fontSize: 10, fontWeight: 900, color: 'rgba(0,0,0,0.70)', padding: '0 6px', outline: 'none' }}
                            >
                              {['first_contact', 'thin', 'austen', 'cube', 'miscel·lania'].map((k) => (
                                <option key={k} value={k}>
                                  {k}
                                </option>
                              ))}
                            </select>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input
                              type="text"
                              style={{ width: 38, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeRefDxDraft}
                              onFocus={() => { megaStripeRefDxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeRefDxInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeRefDxDraft);
                                if (n === null) {
                                  setMegaStripeRefDxDraft(String(megaStripeRefDx));
                                  return;
                                }
                                setMegaStripeRefDx(n);
                              }}
                              onChange={(e) => setMegaStripeRefDxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input
                              type="text"
                              style={{ width: 38, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeRefDyDraft}
                              onFocus={() => { megaStripeRefDyInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeRefDyInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeRefDyDraft);
                                if (n === null) {
                                  setMegaStripeRefDyDraft(String(megaStripeRefDy));
                                  return;
                                }
                                setMegaStripeRefDy(n);
                              }}
                              onChange={(e) => setMegaStripeRefDyDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>s:</div>
                            <input
                              type="text"
                              style={{ width: 52, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }}
                              value={megaStripeRefScaleDraft}
                              onFocus={() => { megaStripeRefScaleInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeRefScaleInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeRefScaleDraft);
                                if (n === null || n <= 0) {
                                  setMegaStripeRefScaleDraft(String(megaStripeRefScale));
                                  return;
                                }
                                setMegaStripeRefScale(clampScale(n, 1));
                              }}
                              onChange={(e) => setMegaStripeRefScaleDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMegaStripeRefEnabled((v) => !v);
                            }}
                            style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaStripeRefEnabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaStripeRefEnabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            {megaStripeRefEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        <div style={{ gridRow: '5', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>REF2</div>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input
                              type="text"
                              style={{ width: 38, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeRef2DxDraft}
                              onFocus={() => { megaStripeRef2DxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeRef2DxInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeRef2DxDraft);
                                if (n === null) {
                                  setMegaStripeRef2DxDraft(String(megaStripeRef2Dx));
                                  return;
                                }
                                setMegaStripeRef2Dx(n);
                              }}
                              onChange={(e) => setMegaStripeRef2DxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input
                              type="text"
                              style={{ width: 38, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                              value={megaStripeRef2DyDraft}
                              onFocus={() => { megaStripeRef2DyInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeRef2DyInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeRef2DyDraft);
                                if (n === null) {
                                  setMegaStripeRef2DyDraft(String(megaStripeRef2Dy));
                                  return;
                                }
                                setMegaStripeRef2Dy(n);
                              }}
                              onChange={(e) => setMegaStripeRef2DyDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>s:</div>
                            <input
                              type="text"
                              style={{ width: 52, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }}
                              value={megaStripeRef2ScaleDraft}
                              onFocus={() => { megaStripeRef2ScaleInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeRef2ScaleInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeRef2ScaleDraft);
                                if (n === null || n <= 0) {
                                  setMegaStripeRef2ScaleDraft(String(megaStripeRef2Scale));
                                  return;
                                }
                                setMegaStripeRef2Scale(clampScale(n, 1));
                              }}
                              onChange={(e) => setMegaStripeRef2ScaleDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMegaStripeRef2Enabled((v) => !v);
                            }}
                            style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaStripeRef2Enabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaStripeRef2Enabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            {megaStripeRef2Enabled ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        <div style={{ gridRow: '15', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)', flexShrink: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>ref src</div>
                          <input
                            value={String(megaStripeRefSrc || '')}
                            placeholder="/tmp/... o https://..."
                            onChange={(e) => {
                              const v = e.target.value;
                              setMegaStripeRefEnabled(true);
                              setMegaStripeRefSrc(normalizeMegaStripeRefSrc(v));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ flex: 1, height: 16, padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.60)', outline: 'none', minWidth: 0 }}
                          />
                        </div>

                        <div style={{ gridRow: '16', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)', flexShrink: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>ref2 src</div>
                          <input
                            value={String(megaStripeRef2Src || '')}
                            placeholder="/tmp/... o https://..."
                            onChange={(e) => {
                              const v = e.target.value;
                              setMegaStripeRef2Enabled(true);
                              setMegaStripeRef2Src(normalizeMegaStripeRefSrc(v));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ flex: 1, height: 16, padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.60)', outline: 'none', minWidth: 0 }}
                          />
                        </div>

                        <div style={{ gridRow: '6', gridColumn: '4 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Tile</div>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>g:</div>
                            <input
                              type="text"
                              value={megaStripeTileGapPxDraft}
                              onFocus={() => { megaStripeTileGapPxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaStripeTileGapPxInputFocusedRef.current = false;
                                const n = parseFinite(megaStripeTileGapPxDraft);
                                if (n === null) {
                                  setMegaStripeTileGapPxDraft(String(megaStripeTileGapPx || 0));
                                  return;
                                }
                                setMegaStripeTileGapPx(Math.min(200, Math.max(-200, n)));
                              }}
                              onChange={(e) => setMegaStripeTileGapPxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 60, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }}
                            />
                          </div>
                          <div />
                        </div>

                        <div style={{ gridRow: '11', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)' }}>extend</div>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>t:</div>
                            <input
                              type="text"
                              value={megaTileSelectorExtendTopPxDraft}
                              onFocus={() => { megaTileSelectorExtendTopPxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorExtendTopPxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorExtendTopPxDraft);
                                if (n === null) {
                                  setMegaTileSelectorExtendTopPxDraft(String(megaTileSelectorExtendTopPx || 0));
                                  return;
                                }
                                setMegaTileSelectorExtendTopPx(Math.min(500, Math.max(-500, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorExtendTopPxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 46, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>r:</div>
                            <input
                              type="text"
                              value={megaTileSelectorExtendRightPxDraft}
                              onFocus={() => { megaTileSelectorExtendRightPxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorExtendRightPxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorExtendRightPxDraft);
                                if (n === null) {
                                  setMegaTileSelectorExtendRightPxDraft(String(megaTileSelectorExtendRightPx || 0));
                                  return;
                                }
                                setMegaTileSelectorExtendRightPx(Math.min(500, Math.max(-500, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorExtendRightPxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 46, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>b:</div>
                            <input
                              type="text"
                              value={megaTileSelectorExtendBottomPxDraft}
                              onFocus={() => { megaTileSelectorExtendBottomPxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorExtendBottomPxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorExtendBottomPxDraft);
                                if (n === null) {
                                  setMegaTileSelectorExtendBottomPxDraft(String(megaTileSelectorExtendBottomPx || 0));
                                  return;
                                }
                                setMegaTileSelectorExtendBottomPx(Math.min(500, Math.max(-500, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorExtendBottomPxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 46, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>l:</div>
                            <input
                              type="text"
                              value={megaTileSelectorExtendLeftPxDraft}
                              onFocus={() => { megaTileSelectorExtendLeftPxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorExtendLeftPxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorExtendLeftPxDraft);
                                if (n === null) {
                                  setMegaTileSelectorExtendLeftPxDraft(String(megaTileSelectorExtendLeftPx || 0));
                                  return;
                                }
                                setMegaTileSelectorExtendLeftPx(Math.min(500, Math.max(-500, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorExtendLeftPxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 46, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>px</div>
                          </div>
                          <div />
                        </div>

                        <div style={{ gridRow: '10', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)' }}>radius</div>
                            <input
                              type="text"
                              value={megaTileSelectorRadiusPxDraft}
                              onFocus={() => { megaTileSelectorRadiusPxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorRadiusPxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorRadiusPxDraft);
                                if (n === null) {
                                  setMegaTileSelectorRadiusPxDraft(String(megaTileSelectorRadiusPx || 0));
                                  return;
                                }
                                setMegaTileSelectorRadiusPx(Math.min(200, Math.max(0, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorRadiusPxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 70, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>px</div>
                          </div>
                          <div />
                        </div>

                        <div style={{ gridRow: '4', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>SELECTOR</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMegaTileSelectorV1Enabled((v) => !v);
                              }}
                              style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaTileSelectorV1Enabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaTileSelectorV1Enabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              v1
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMegaTileSelectorEnabled((v) => !v);
                              }}
                              style={{ height: 18, display: 'flex', alignItems: 'center', padding: '0 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaTileSelectorEnabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaTileSelectorEnabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              v2
                            </button>
                          </div>
                        </div>

                        <div style={{ gridRow: '5', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)', flexShrink: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>target</div>
                          <input
                            value={String(megaTileSelectorTarget || '')}
                            placeholder="NCC-1701-D"
                            onChange={(e) => setMegaTileSelectorTarget(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ flex: 1, height: 16, padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.60)', outline: 'none', minWidth: 0 }}
                          />
                        </div>

                        <div style={{ gridRow: '6', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)' }}>size</div>
                            <input
                              type="text"
                              value={megaTileSelectorSizePxDraft}
                              onFocus={() => { megaTileSelectorSizePxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorSizePxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorSizePxDraft);
                                if (n === null) {
                                  setMegaTileSelectorSizePxDraft(String(megaTileSelectorSizePx || 0));
                                  return;
                                }
                                setMegaTileSelectorSizePx(Math.min(800, Math.max(20, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorSizePxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                                if (e.key === 'Escape') {
                                  setMegaTileSelectorSizePxDraft(String(megaTileSelectorSizePx || 0));
                                  e.currentTarget.blur();
                                }
                              }}
                              style={{ width: 70, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>px</div>
                          </div>
                          <div />
                        </div>

                        <div style={{ gridRow: '7', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)' }}>stroke</div>
                            <input
                              type="text"
                              value={megaTileSelectorStrokePxDraft}
                              onFocus={() => { megaTileSelectorStrokePxInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorStrokePxInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorStrokePxDraft);
                                if (n === null) {
                                  setMegaTileSelectorStrokePxDraft(String(megaTileSelectorStrokePx || 0));
                                  return;
                                }
                                setMegaTileSelectorStrokePx(Math.min(80, Math.max(0, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorStrokePxDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                                if (e.key === 'Escape') {
                                  setMegaTileSelectorStrokePxDraft(String(megaTileSelectorStrokePx || 0));
                                  e.currentTarget.blur();
                                }
                              }}
                              style={{ width: 70, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>px</div>
                          </div>
                          <div />
                        </div>

                        <div style={{ gridRow: '8', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)', flexShrink: 0 }}>color</div>
                          <input
                            value={String(megaTileSelectorColor || '')}
                            placeholder="black"
                            onChange={(e) => setMegaTileSelectorColor(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            style={{ flex: 1, height: 16, padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.60)', outline: 'none', minWidth: 0 }}
                          />
                        </div>

                        <div style={{ gridRow: '9', gridColumn: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)', opacity: megaTileSelectorEnabled ? 1 : 0.35 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.70)' }}>grid</div>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input
                              type="text"
                              value={megaTileSelectorStepXDraft}
                              onFocus={() => { megaTileSelectorStepXInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorStepXInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorStepXDraft);
                                if (n === null) {
                                  setMegaTileSelectorStepXDraft(String(megaTileSelectorStepX || 0));
                                  return;
                                }
                                setMegaTileSelectorStepX(Math.min(99, Math.max(-99, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorStepXDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 46, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input
                              type="text"
                              value={megaTileSelectorStepYDraft}
                              onFocus={() => { megaTileSelectorStepYInputFocusedRef.current = true; }}
                              onBlur={() => {
                                megaTileSelectorStepYInputFocusedRef.current = false;
                                const n = parseFinite(megaTileSelectorStepYDraft);
                                if (n === null) {
                                  setMegaTileSelectorStepYDraft(String(megaTileSelectorStepY || 0));
                                  return;
                                }
                                setMegaTileSelectorStepY(Math.min(99, Math.max(-99, n)));
                              }}
                              onChange={(e) => setMegaTileSelectorStepYDraft(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') e.currentTarget.blur();
                              }}
                              style={{ width: 46, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }}
                            />
                          </div>
                          <div />
                        </div>

                        <div style={{ gridRow: '3 / span 15', gridColumn: '2 / span 2', padding: 0, minWidth: 0, height: '100%', overflow: 'hidden', display: 'none' }}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                              gridAutoRows: 'var(--megaStripeHudCellHPx)',
                              columnGap: 0,
                              rowGap: 0,
                              alignItems: 'center',
                              alignContent: 'start',
                              position: 'relative',
                              zIndex: 1,
                              minWidth: 0,
                            }}
                          >
                            {(() => {
                              try {
                                const sp = new URLSearchParams(location.search || '');
                                const ignored = new Set(['layout', 'guides', 'stripeOverlayDebug']);
                                const allEntries = Array.from(sp.entries())
                                  .filter(([k]) => k && !ignored.has(String(k)))
                                  .sort((a, b) => {
                                    const rank = (key) => {
                                      const s = String(key || '').toLowerCase();
                                      if (s.includes('stripe')) return 0;
                                      if (s.includes('overlay')) return 1;
                                      if (s.includes('ref')) return 2;
                                      if (s.includes('grid')) return 3;
                                      return 9;
                                    };
                                    const axisRank = (key) => {
                                      const s = String(key || '').toLowerCase();
                                      if (/(^|[-_])(dx|x)$/.test(s)) return 0;
                                      if (/(^|[-_])(dy|y)$/.test(s)) return 1;
                                      if (/(^|[-_])(scale|s)$/.test(s)) return 2;
                                      if (s.includes('dx') && !s.includes('dy')) return 0;
                                      if (s.includes('dy') && !s.includes('dx')) return 1;
                                      if (s.includes('scale')) return 2;
                                      return 9;
                                    };
                                    const baseKey = (key) => {
                                      const s = String(key || '').toLowerCase();
                                      return s
                                        .replace(/(^|[-_])(dx|dy|x|y|scale|s)$/i, '')
                                        .replace(/(dx|dy|scale)\b/gi, '')
                                        .replace(/\b(x|y|s)\b/gi, '')
                                        .replace(/[-_]+$/g, '')
                                        .trim();
                                    };
                                    const ra = rank(a[0]);
                                    const rb = rank(b[0]);
                                    if (ra !== rb) return ra - rb;

                                    const ba = baseKey(a[0]);
                                    const bb = baseKey(b[0]);
                                    if (ba !== bb) return ba.localeCompare(bb);

                                    const aa = axisRank(a[0]);
                                    const ab = axisRank(b[0]);
                                    if (aa !== ab) return aa - ab;

                                    return String(a[0]).localeCompare(String(b[0]));
                                  });

                                const isBoolLike = (v) => {
                                  const s = (v == null) ? '' : String(v).trim().toLowerCase();
                                  return s === '' || s === '0' || s === '1' || s === 'true' || s === 'false' || s === 'on' || s === 'off' || s === 'yes' || s === 'no';
                                };
                                const boolOn = (v) => {
                                  const s = (v == null) ? '' : String(v).trim().toLowerCase();
                                  if (s === '' || s === '1' || s === 'true' || s === 'on' || s === 'yes') return true;
                                  return false;
                                };

                                const isLongish = (key, val) => {
                                  try {
                                    const k = (key == null) ? '' : String(key);
                                    const v = (val == null) ? '' : String(val);
                                    if (v.length >= 34) return true;
                                    if (k.toLowerCase().includes('src')) return true;
                                    if (k.toLowerCase().includes('path')) return true;
                                    if (v.includes('/') || v.includes('http://') || v.includes('https://')) return true;
                                    return false;
                                  } catch {
                                    return false;
                                  }
                                };

                                const nonLongEntries = allEntries.filter(([k, v]) => !isLongish(k, v));
                                const boolEntries = [];
                                const valueEntries = [];
                                nonLongEntries.forEach(([k, v]) => {
                                  const key = String(k);
                                  const val = (v == null) ? '' : String(v);
                                  if (isBoolLike(val)) boolEntries.push([key, val]);
                                  else valueEntries.push([key, val]);
                                });

                                const valueSlots = [];
                                for (let col = 1; col <= 2; col += 1) {
                                  for (let row = 1; row <= 13; row += 2) {
                                    valueSlots.push({ col, row });
                                  }
                                }

                                const boolSlots = [];
                                for (let col = 2; col >= 1; col -= 1) {
                                  for (let row = 1; row <= 13; row += 1) {
                                    boolSlots.push({ col, row });
                                  }
                                }

                                const occupied = new Set();
                                const placements = [];

                                valueEntries.forEach(([key, val], idx) => {
                                  const slot = valueSlots[idx];
                                  if (!slot) return;
                                  occupied.add(`${slot.col}-${slot.row}`);
                                  occupied.add(`${slot.col}-${slot.row + 1}`);
                                  placements.push({ key, val, boolLike: false, col: slot.col, row: slot.row });
                                });

                                let boolCursor = 0;
                                boolEntries.forEach(([key, val]) => {
                                  while (boolCursor < boolSlots.length) {
                                    const slot = boolSlots[boolCursor];
                                    boolCursor += 1;
                                    if (occupied.has(`${slot.col}-${slot.row}`)) continue;
                                    occupied.add(`${slot.col}-${slot.row}`);
                                    placements.push({ key, val, boolLike: true, col: slot.col, row: slot.row });
                                    break;
                                  }
                                });

                                placements.sort((a, b) => {
                                  if (a.col !== b.col) return a.col - b.col;
                                  return a.row - b.row;
                                });

                                return placements.map(({ key, val, boolLike, col, row }) => {
                                  const keyStr = String(key);
                                  const valStr = (val == null) ? '' : String(val);
                                  const on = boolLike ? boolOn(valStr) : false;

                                  if (boolLike) {
                                    return (
                                      <div key={keyStr} style={{ gridColumn: String(col), gridRow: String(row), display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minWidth: 0, height: 'var(--megaStripeHudCellHPx)', padding: '0 6px', paddingLeft: 30 }}>
                                        <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }} title={keyStr}>
                                          {keyStr}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            try {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              const next = new URLSearchParams(location.search || '');
                                              if (on) next.set(keyStr, '0');
                                              else next.set(keyStr, '1');
                                              navigate(`${location.pathname}?${next.toString()}`, { replace: true });
                                            } catch {
                                              // ignore
                                            }
                                          }}
                                          style={{
                                            height: 16,
                                            padding: '0 6px',
                                            borderRadius: 4,
                                            border: '1px solid rgba(0,0,0,0.15)',
                                            background: on ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)',
                                            color: on ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)',
                                            fontSize: 10,
                                            fontWeight: 900,
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          {on ? 'ON' : 'OFF'}
                                        </button>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div key={keyStr} style={{ gridColumn: String(col), gridRow: String(row), gridRowEnd: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, minWidth: 0, height: '100%', padding: '4px 6px', paddingLeft: 30 }}>
                                      <div style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, lineHeight: '14px' }} title={keyStr}>
                                        {keyStr}
                                      </div>
                                      <input
                                        defaultValue={valStr}
                                        onClick={(e) => {
                                          try {
                                            e.stopPropagation();
                                            e.currentTarget.select?.();
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          e.stopPropagation();
                                          if (e.key === 'Enter') {
                                            try {
                                              e.currentTarget.blur();
                                            } catch {
                                              // ignore
                                            }
                                          }
                                        }}
                                        onBlur={(e) => {
                                          try {
                                            const nextVal = String(e.currentTarget.value ?? '').trim();
                                            const next = new URLSearchParams(location.search || '');
                                            if (!nextVal) next.delete(keyStr);
                                            else next.set(keyStr, nextVal);
                                            const qs = next.toString();
                                            navigate(qs ? `${location.pathname}?${qs}` : location.pathname, { replace: true });
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        style={{ height: 16, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 800, color: 'rgba(0,0,0,0.55)', outline: 'none', minWidth: 0 }}
                                      />
                                    </div>
                                  );
                                });
                              } catch {
                                return null;
                              }
                            })()}
                          </div>
                        </div>

                        {null}

                        {(() => {
                          try {
                            const sp = new URLSearchParams(location.search || '');
                            const ignored = new Set(['layout', 'guides', 'stripeOverlayDebug']);
                            const entries = Array.from(sp.entries())
                              .filter(([k]) => k && !ignored.has(String(k)))
                              .sort((a, b) => String(a[0]).localeCompare(String(b[0])));

                            const normalizeOverlaySrcLocal = (value) => {
                              try {
                                let s = (value || '').toString().trim();
                                if (!s) return '';
                                if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")) || (s.startsWith('`') && s.endsWith('`'))) {
                                  s = s.slice(1, -1).trim();
                                }
                                if (!s) return '';
                                if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s)) return s;
                                return s.startsWith('/') ? s : `/${s}`;
                              } catch {
                                return '';
                              }
                            };

                            const lsDrawingSrc = (() => {
                              try {
                                return String(window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC') || '').trim();
                              } catch {
                                return '';
                              }
                            })();
                            const lsLongEntries = [
                              ['HG_DRAWING_OVERLAY_SRC', lsDrawingSrc || '—'],
                              ['HG_DRAWING_OVERLAY_SRC(norm)', lsDrawingSrc ? normalizeOverlaySrcLocal(lsDrawingSrc) : '—'],
                            ];

                            const isLongish = (key, val) => {
                              try {
                                const k = (key == null) ? '' : String(key);
                                const v = (val == null) ? '' : String(val);
                                if (v.length >= 34) return true;
                                if (k.toLowerCase().includes('src')) return true;
                                if (k.toLowerCase().includes('path')) return true;
                                if (v.includes('/') || v.includes('http://') || v.includes('https://')) return true;
                                return false;
                              } catch {
                                return false;
                              }
                            };

                            const isDebugEntry = (key) => {
                              try {
                                return String(key || '').toLowerCase().includes('debug');
                              } catch {
                                return false;
                              }
                            };

                            const longEntriesAll = entries.filter(([k, v]) => isLongish(k, v));
                            const longDebugEntries = longEntriesAll.filter(([k]) => isDebugEntry(k)).slice(0, 3);
                            const longEntries = [
                              ...lsLongEntries,
                              ...longEntriesAll.filter(([k]) => !isDebugEntry(k) && !lsLongEntries.some(([lk]) => String(lk) === String(k))),
                            ].slice(0, 3);

                            const resolvedOverlaySrcValue = (() => {
                              try {
                                const v = stripeOverlayDebugSnapshot?.resolvedOverlaySrc;
                                if (!stripeOverlayDebugSnapshot) return '—';
                                return v == null ? '—' : String(v);
                              } catch {
                                return stripeOverlayDebugSnapshot ? '' : '—';
                              }
                            })();

                            return (
                              <>
                                <div style={{ gridRow: '17', gridColumn: '2 / span 5', display: 'flex', alignItems: 'center', gap: 8, padding: 0, minWidth: 0, height: 'var(--megaStripeHudCellHPx)', overflow: 'hidden', position: 'relative', opacity: stripeOverlayDebugOn ? 1 : 0.35 }}>
                                  <div style={{ padding: '0 6px', paddingLeft: 30, fontSize: 13, fontWeight: 900, lineHeight: 'var(--megaStripeHudCellHPx)', color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flexShrink: 0 }} title="resolvedOverlaySrc">
                                    resolvedOverlaySrc
                                  </div>
                                  <input
                                    value={resolvedOverlaySrcValue}
                                    readOnly
                                    placeholder="(enable stripeOverlayDebug=1)"
                                    onClick={(e) => {
                                      try {
                                        e.stopPropagation();
                                        e.currentTarget.select?.();
                                      } catch {
                                        // ignore
                                      }
                                    }}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    style={{ flex: 1, height: 'var(--megaStripeHudCellHPx)', lineHeight: 'var(--megaStripeHudCellHPx)', padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', fontSize: 13, fontWeight: 300, color: 'rgba(0,0,0,0.55)', outline: 'none', minWidth: 0 }}
                                  />
                                </div>

                                {longEntries.map(([k, v], idx) => {
                                  const key = String(k);
                                  const val = (v == null) ? '' : String(v);
                                  const row = (() => {
                                    if (key === 'HG_DRAWING_OVERLAY_SRC') return '19';
                                    if (key === 'HG_DRAWING_OVERLAY_SRC(norm)') return '18';
                                    return String(16 - idx);
                                  })();
                                  const isReadOnly = key === 'HG_DRAWING_OVERLAY_SRC' || key === 'HG_DRAWING_OVERLAY_SRC(norm)';
                                  return (
                                    <div key={key} style={{ gridRow: row, gridColumn: '2 / span 5', display: 'flex', alignItems: 'center', gap: 8, padding: 0, minWidth: 0, height: 'var(--megaStripeHudCellHPx)', overflow: 'hidden', position: 'relative' }}>
                                      <div style={{ padding: '0 6px', paddingLeft: 30, fontSize: 13, fontWeight: 900, lineHeight: 'var(--megaStripeHudCellHPx)', color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flexShrink: 0 }} title={key}>
                                        {key}
                                      </div>
                                      <input
                                        {...(isReadOnly ? { value: val, readOnly: true } : { defaultValue: val })}
                                        onClick={(e) => {
                                          try {
                                            e.stopPropagation();
                                            e.currentTarget.select?.();
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          e.stopPropagation();
                                          if (e.key === 'Enter') {
                                            try {
                                              e.currentTarget.blur();
                                            } catch {
                                              // ignore
                                            }
                                          }
                                        }}
                                        onBlur={(e) => {
                                          if (isReadOnly) return;
                                          try {
                                            const nextVal = String(e.currentTarget.value ?? '').trim();
                                            const next = new URLSearchParams(location.search || '');
                                            if (!nextVal) next.delete(key);
                                            else next.set(key, nextVal);
                                            const qs = next.toString();
                                            navigate(qs ? `${location.pathname}?${qs}` : location.pathname, { replace: true });
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        style={{ flex: 1, height: 'var(--megaStripeHudCellHPx)', lineHeight: 'var(--megaStripeHudCellHPx)', padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', fontSize: 13, fontWeight: 300, color: 'rgba(0,0,0,0.55)', outline: 'none', minWidth: 0 }}
                                      />
                                    </div>
                                  );
                                })}

                                {longDebugEntries.map(([k, v], idx) => {
                                  const key = String(k);
                                  const val = (v == null) ? '' : String(v);
                                  const row = String(17 - idx);
                                  return (
                                    <div key={`debug-${key}`} style={{ gridRow: row, gridColumn: '6', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, padding: '2px 6px', minWidth: 0, height: 'var(--megaStripeHudCellHPx)', overflow: 'hidden' }}>
                                      <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, lineHeight: '12px' }} title={key}>
                                        {key}
                                      </div>
                                      <input
                                        defaultValue={val}
                                        onClick={(e) => {
                                          try {
                                            e.stopPropagation();
                                            e.currentTarget.select?.();
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          e.stopPropagation();
                                          if (e.key === 'Enter') {
                                            try {
                                              e.currentTarget.blur();
                                            } catch {
                                              // ignore
                                            }
                                          }
                                        }}
                                        onBlur={(e) => {
                                          try {
                                            const nextVal = String(e.currentTarget.value ?? '').trim();
                                            const next = new URLSearchParams(location.search || '');
                                            if (!nextVal) next.delete(key);
                                            else next.set(key, nextVal);
                                            const qs = next.toString();
                                            navigate(qs ? `${location.pathname}?${qs}` : location.pathname, { replace: true });
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                        style={{ height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 13, fontWeight: 300, color: 'rgba(0,0,0,0.55)', outline: 'none', minWidth: 0, lineHeight: '14px' }}
                                      />
                                    </div>
                                  );
                                })}

                                {null}
                              </>
                            );
                          } catch {
                            return null;
                          }
                        })()}
                      </div>

                      <div style={{ height: `calc(${HUD_DEBUG_BOTTOM_RESERVE_PX}px + env(safe-area-inset-bottom, 0px))` }} />
                    </div>

                    <div style={{ minWidth: 0, border: '1px solid rgba(0,0,0,0.45)', background: 'rgba(239,68,68,0.06)', padding: 10, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.70)', marginBottom: 8 }}>ASSETS/REF</div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, marginBottom: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6 }}>
                          {['first_contact', 'thin', 'austen', 'cube', 'miscel·lania'].map((k) => {
                            const active = String(megaStripeRefCollection || 'first_contact') === k;
                            return (
                              <button
                                key={k}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMegaStripeRefCollection(k);
                                  setMegaStripeRefEnabled((prev) => (prev ? prev : true));
                                  setMegaStripeRefSrc((prev) => {
                                    const cur = (prev == null) ? '' : String(prev);
                                    if (cur.trim()) return cur;
                                    const presets = megaStripeRefPresets?.[k] || [];
                                    const first = Array.isArray(presets) ? presets[0] : null;
                                    const src = first?.src ? normalizeMegaStripeRefSrc(first.src) : '';
                                    return src || cur;
                                  });
                                }}
                                style={{
                                  height: 22,
                                  padding: '0 6px',
                                  borderRadius: 4,
                                  border: '1px solid rgba(0,0,0,0.15)',
                                  background: active ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.35)',
                                  color: 'rgba(0,0,0,0.80)',
                                  fontSize: 10,
                                  fontWeight: 900,
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {k.replace('_', ' ').toUpperCase()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                        {(() => {
                          const colKey = String(megaStripeRefCollection || 'first_contact');
                          const allPresets = (megaStripeRefPresets[colKey] || []);
                          const isAusten = colKey === 'austen';
                          const presets = isAusten ? allPresets : allPresets.slice(0, megaStripeHudMaxRefPresets);

                          const columns = 2;
                          const perCol = Math.ceil(presets.length / columns);
                          const cols = Array.from({ length: columns }, (_, i) => presets.slice(i * perCol, (i + 1) * perCol));

                          const presetBtnHeight = isAusten ? 18 : 22;
                          const presetBtnFontSize = isAusten ? 11 : 12;
                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 8 }}>
                              {cols.map((items, colIdx) => (
                                <div key={`col-${colIdx}`} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                                  {items.map((p) => (
                                    <button
                                      key={p.key}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setMegaStripeRefEnabled(true);
                                        setMegaStripeRefSrc(normalizeMegaStripeRefSrc(p.src));
                                      }}
                                      style={{
                                        height: presetBtnHeight,
                                        padding: '0 6px',
                                        borderRadius: 4,
                                        border: '1px solid rgba(0,0,0,0.10)',
                                        background: 'rgba(255,255,255,0.35)',
                                        color: megaStripeRefSrc === normalizeMegaStripeRefSrc(p.src) ? 'rgba(239,68,68,1)' : 'rgba(0,0,0,0.80)',
                                        fontSize: presetBtnFontSize,
                                        fontWeight: 900,
                                        textAlign: 'left',
                                      }}
                                    >
                                      {String(p.key || '').replace(/\s*BW\s*$/i, '')}
                                    </button>
                                  ))}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
                ) : null}

                {(isAdmin || isDevDemoRoute || isFullWideSlideRoute) && location.pathname !== '/ec-preview' && location.pathname !== '/ec-preview-lite' ? (
                  <div
                    ref={debugButtonsWrapRef}
                    className="flex items-center gap-2 relative debug-exempt"
                    style={{ position: 'fixed', left: 61, bottom: 16, zIndex: 1100000 }}
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
                  </div>
                ) : null}

            <BeltReferenceOverlay enabled={megaStripeBeltEnabled} />

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
