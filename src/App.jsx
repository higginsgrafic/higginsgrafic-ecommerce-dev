import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense, lazy, useLayoutEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
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
  const [stripeOverlayDebugSnapshot, setStripeOverlayDebugSnapshot] = useState(null);

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
  const [megaStripeBeltEnabled, setMegaStripeBeltEnabled] = useState(false);
  const [megaStripeOverlayMode, setMegaStripeOverlayMode] = useState('black');
  const [megaStripeOverlayDx, setMegaStripeOverlayDx] = useState(0);
  const [megaStripeOverlayDy, setMegaStripeOverlayDy] = useState(0);
  const [megaStripeOverlayScale, setMegaStripeOverlayScale] = useState(1);
  const [megaStripeScale, setMegaStripeScale] = useState(1.2125);
  const [megaStripeRefEnabled, setMegaStripeRefEnabled] = useState(false);
  const [megaStripeRefSrc, setMegaStripeRefSrc] = useState('');

  const megaStripeOverlayScaleInputFocusedRef = useRef(false);
  const [megaStripeOverlayScaleDraft, setMegaStripeOverlayScaleDraft] = useState(() => String(megaStripeOverlayScale));
  useEffect(() => {
    if (megaStripeOverlayScaleInputFocusedRef.current) return;
    setMegaStripeOverlayScaleDraft(String(megaStripeOverlayScale));
  }, [megaStripeOverlayScale]);
  const [megaStripeRefCollection, setMegaStripeRefCollection] = useState('first_contact');
  const [megaStripeRefDx, setMegaStripeRefDx] = useState(0);
  const [megaStripeRefDy, setMegaStripeRefDy] = useState(0);
  const [megaStripeRefScale, setMegaStripeRefScale] = useState(1);
  const [stripeEditTool, setStripeEditTool] = useState('ref');
  const [megaStripeNudgeStep, setMegaStripeNudgeStep] = useState(1);
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
  const [megaStripeTileGapPx, setMegaStripeTileGapPx] = useState(0);
  const megaStripeHudWrapRef = useRef(null);
  const megaStripeParamsGridRef = useRef(null);
  const megaStripeLastGoodHudTopPxRef = useRef(null);
  const [megaStripeHudSnapDyPx, setMegaStripeHudSnapDyPx] = useState(0);
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
      const rawBelt = window.localStorage.getItem('MEGA_STRIPE_BELT');
      const rawOverlayMode = window.localStorage.getItem('MEGA_STRIPE_OVERLAY_MODE');
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
      const rawNudge = window.localStorage.getItem('MEGA_STRIPE_NUDGE_STEP');
      const rawTileGap = window.localStorage.getItem('MEGA_STRIPE_TILE_GAP_PX');
      const dx = rawDx == null ? 0 : Number.parseFloat(String(rawDx));
      const dy = rawDy == null ? 0 : Number.parseFloat(String(rawDy));
      if (Number.isFinite(dx)) setMegaStripeDx(dx);
      if (Number.isFinite(dy)) setMegaStripeDy(dy);
      if (rawBelt != null) setMegaStripeBeltEnabled(rawBelt === '1');
      if (rawOverlayMode != null) {
        const v = String(rawOverlayMode);
        const allowed = new Set(['black', 'off']);
        if (allowed.has(v)) setMegaStripeOverlayMode(v);
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
        if (Number.isFinite(n) && n > 0) setMegaStripeOverlayScale(Math.min(5, Math.max(0.1, n)));
      }
      if (rawScale != null) {
        const n = Number.parseFloat(String(rawScale));
        if (Number.isFinite(n) && n > 0) setMegaStripeScale(Math.min(5, Math.max(0.1, n)));
      }
      if (rawRefEnabled != null) setMegaStripeRefEnabled(rawRefEnabled === '1');
      if (rawRefSrc != null) setMegaStripeRefSrc(String(rawRefSrc));
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
        if (Number.isFinite(n) && n > 0) setMegaStripeRefScale(Math.min(5, Math.max(0.1, n)));
      }
      if (rawNudge != null) {
        const n = Number.parseInt(String(rawNudge), 10);
        if (Number.isFinite(n) && n > 0) setMegaStripeNudgeStep(Math.min(50, Math.max(1, n)));
      }
      if (rawTileGap != null) {
        const n = Number.parseFloat(String(rawTileGap));
        if (Number.isFinite(n)) setMegaStripeTileGapPx(Math.min(200, Math.max(-200, n)));
      }
    } catch {
      // ignore
    }
  }, []);

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
      const clamped = Math.min(5, Math.max(0.1, v));
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
      const clamped = Math.min(5, Math.max(0.1, s));
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
      const v = Number.isFinite(megaStripeRefScale) ? megaStripeRefScale : 1;
      const clamped = Math.min(5, Math.max(0.1, v));
      document.documentElement.style.setProperty('--megaStripeRefScale', String(clamped));
      window.localStorage.setItem('MEGA_STRIPE_REF_SCALE', String(clamped));
      window.dispatchEvent(new Event('mega-stripe-ref-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRefScale]);

  useEffect(() => {
    try {
      const raw = Number.isFinite(megaStripeTileGapPx) ? megaStripeTileGapPx : 0;
      const v = Math.min(200, Math.max(-200, raw));
      document.documentElement.style.setProperty('--megaStripeTileGapPx', `${v}px`);
      window.localStorage.setItem('MEGA_STRIPE_TILE_GAP_PX', String(v));
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
      window.localStorage.setItem('MEGA_STRIPE_OVERLAY_MODE', String(megaStripeOverlayMode || 'black'));
      window.dispatchEvent(new Event('mega-stripe-overlay-mode-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeOverlayMode]);

  useEffect(() => {
    const v = String(megaStripeOverlayMode || 'off');
    if (v !== 'off') megaStripeLastNonOffOverlayModeRef.current = v;
  }, [megaStripeOverlayMode]);

  useEffect(() => {
    try {
      const v = String(megaStripeOverlayMode || 'off');
      if (v !== 'off') setStripeEditTool('overlay');
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
    const activeRoute = path === '/full-wide-slide';
    if (!activeRoute) return undefined;

    const shouldIgnoreEvent = (e) => {
      try {
        if (!e) return true;
        if (e.defaultPrevented) return true;
        const t = e.target;
        const tag = (t?.tagName || '').toString().toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
        if (t?.isContentEditable) return true;
        return false;
      } catch {
        return true;
      }
    };

    const onKeyDown = (e) => {
      if (shouldIgnoreEvent(e)) return;

      const k = (e.key || '').toString();
      const step = e.shiftKey ? 5 : 0.5;
      const tileStep = e.shiftKey ? 1 : 0.1;

      if (!e.altKey && !e.ctrlKey && !e.metaKey) {
        const kc = k.toLowerCase();
        if (kc === 'c') {
          e.preventDefault();
          if (stripeEditTool === 'overlay') {
            setMegaStripeOverlayDx(0);
            setMegaStripeOverlayDy(0);
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
          setMegaStripeOverlayMode((prev) => {
            const cur = String(prev || 'off');
            if (cur !== 'off') return cur;
            const last = String(megaStripeLastNonOffOverlayModeRef.current || 'black');
            return last === 'off' ? 'black' : last;
          });
          return;
        }
        if (kc === 'r') {
          e.preventDefault();
          setStripeEditTool('ref');
          return;
        }
        if (kc === 't') {
          e.preventDefault();
          setStripeEditTool((prev) => (String(prev || 'ref') === 'tile' ? 'ref' : 'tile'));
          return;
        }
      }

      if (k === 'ArrowLeft') {
        e.preventDefault();
        if (stripeEditTool === 'overlay') setMegaStripeOverlayDx((v) => (Number.isFinite(v) ? v - step : -step));
        else if (stripeEditTool === 'tile') setMegaStripeTileGapPx((v) => (Number.isFinite(v) ? Math.min(200, Math.max(-200, v - tileStep)) : -tileStep));
        else setMegaStripeRefDx((v) => (Number.isFinite(v) ? v - step : -step));
        return;
      }
      if (k === 'ArrowRight') {
        e.preventDefault();
        if (stripeEditTool === 'overlay') setMegaStripeOverlayDx((v) => (Number.isFinite(v) ? v + step : step));
        else if (stripeEditTool === 'tile') setMegaStripeTileGapPx((v) => (Number.isFinite(v) ? Math.min(200, Math.max(-200, v + tileStep)) : tileStep));
        else setMegaStripeRefDx((v) => (Number.isFinite(v) ? v + step : step));
        return;
      }
      if (k === 'ArrowUp') {
        e.preventDefault();
        if (stripeEditTool === 'overlay') setMegaStripeOverlayDy((v) => (Number.isFinite(v) ? v - step : -step));
        else if (stripeEditTool === 'tile') setMegaStripeTileGapPx((v) => (Number.isFinite(v) ? Math.min(200, Math.max(-200, v - tileStep)) : -tileStep));
        else setMegaStripeRefDy((v) => (Number.isFinite(v) ? v - step : -step));
        return;
      }
      if (k === 'ArrowDown') {
        e.preventDefault();
        if (stripeEditTool === 'overlay') setMegaStripeOverlayDy((v) => (Number.isFinite(v) ? v + step : step));
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
        e.preventDefault();
        const inc = e.shiftKey ? 0.05 : 0.005;
        if (stripeEditTool === 'ref') {
          setMegaStripeRefScale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = Math.min(5, Math.max(0.1, +(cur + inc).toFixed(4)));
            return next;
          });
          return;
        }
        if (stripeEditTool === 'overlay') {
          setMegaStripeOverlayScale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = Math.min(5, Math.max(0.1, +(cur + inc).toFixed(4)));
            return next;
          });
          return;
        }
        setMegaStripeScale((v) => {
          const cur = Number.isFinite(v) ? v : 1.2125;
          const next = Math.min(5, Math.max(0.1, +(cur + inc).toFixed(4)));
          return next;
        });
        return;
      }
      if (k === '-' || k === '_') {
        e.preventDefault();
        const dec = e.shiftKey ? 0.05 : 0.005;
        if (stripeEditTool === 'ref') {
          setMegaStripeRefScale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = Math.min(5, Math.max(0.1, +(cur - dec).toFixed(4)));
            return next;
          });
          return;
        }
        if (stripeEditTool === 'overlay') {
          setMegaStripeOverlayScale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = Math.min(5, Math.max(0.1, +(cur - dec).toFixed(4)));
            return next;
          });
          return;
        }
        setMegaStripeScale((v) => {
          const cur = Number.isFinite(v) ? v : 1.2125;
          const next = Math.min(5, Math.max(0.1, +(cur - dec).toFixed(4)));
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
    const [state, setState] = useState({ xL: null, xR: null, yT: null, yB: null });

    useLayoutEffect(() => {
      if (!enabled) return undefined;

      let raf = 0;
      let t1 = 0;
      let t2 = 0;
      let t3 = 0;

      const read = () => {
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
        const xR = resolveX(rightArrow, 'right');
        const yT = resolveY(stripeImg, 'top');
        const yB = resolveY(stripeImg, 'bottom');

        setState((prev) => (
          prev.xL === xL && prev.xR === xR && prev.yT === yT && prev.yB === yB
            ? prev
            : { xL, xR, yT, yB }
        ));
      };

      const tick = () => {
        read();
        raf = window.requestAnimationFrame(tick);
      };

      read();
      raf = window.requestAnimationFrame(tick);
      window.addEventListener('resize', read);
      window.addEventListener('scroll', read, true);

      t1 = window.setTimeout(read, 50);
      t2 = window.setTimeout(read, 250);
      t3 = window.setTimeout(read, 750);

      return () => {
        window.cancelAnimationFrame(raf);
        window.removeEventListener('resize', read);
        window.removeEventListener('scroll', read, true);
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
        {Number.isFinite(state.yT) ? (
          <div style={{ position: 'fixed', left: 0, top: state.yT, width: '100vw', height: 0, borderTop: `1px solid ${color}` }} />
        ) : null}
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
      if (e.target && e.target.closest && e.target.closest('[data-stripe-calib-hud="1"]')) return;
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
                  height: Math.max(160, Math.round(Number.isFinite(megaStripeHudOwnHPx) ? megaStripeHudOwnHPx : 360)),
                  maxHeight: '100vh',
                  paddingLeft: 16,
                  paddingRight: 16,
                  zIndex: 1000000,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  transform: (Number.isFinite(megaStripeHudSnapDyPx) && Math.abs(megaStripeHudSnapDyPx) > 0.001) ? `translateY(${megaStripeHudSnapDyPx}px)` : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  pointerEvents: 'none',
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
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    maxWidth: '100%',
                    pointerEvents: 'auto',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, minWidth: 0 }}>
                    <span>HUD v20260325</span>
                    <span style={{ opacity: 0.75, fontWeight: 600 }}>stripe</span>
                  </div>

                  {(() => {
                    const refSelected = stripeEditTool === 'ref';
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
                          style={{
                            ...btnBase,
                            ...(overlaySelected ? onStyle : offStyle),
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setStripeEditTool('overlay');
                            setMegaStripeOverlayMode((prev) => {
                              const cur = String(prev || 'off');
                              if (cur !== 'off') return cur;
                              const last = String(megaStripeLastNonOffOverlayModeRef.current || 'black');
                              return last === 'off' ? 'black' : last;
                            });
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
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                    overflow: 'auto',
                    pointerEvents: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 380px)',
                    gap: 10,
                    alignItems: 'stretch',
                    padding: 10,
                    flex: 1,
                    minHeight: 0,
                  }}
                >
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
                        {Array.from({ length: 19 }).map((_, j) => {
                          const y = (j / 18) * 100;
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
                        {Array.from({ length: 18 }).map((_, rIdx) => (
                          Array.from({ length: 6 }).map((__, cIdx) => {
                            const topPct = (rIdx / 18) * 100;
                            const leftPct = (cIdx / 6) * 100;
                            return (
                              <div
                                key={`hud-struct-cell-${rIdx + 1}-${cIdx + 1}`}
                                style={{
                                  position: 'absolute',
                                  top: `${topPct}%`,
                                  left: `${leftPct}%`,
                                  display: 'flex',
                                  alignItems: 'flex-start',
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
                          top: `${(14 / 18) * 100}%`,
                          left: '0%',
                          width: `${(1 / 6) * 100}%`,
                          height: `${(4 / 18) * 100}%`,
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
                          top: `${(17 / 18) * 100}%`,
                          left: `${(1 / 6) * 100}%`,
                          width: `${(3 / 6) * 100}%`,
                          height: `${(1 / 18) * 100}%`,
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
                          gridTemplateRows: 'repeat(18, minmax(0, 1fr))',
                          gap: 0,
                          minWidth: 0,
                          minHeight: 0,
                          zIndex: 1,
                        }}
                      >
                        <div style={{ gridRow: '1', gridColumn: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 15, fontWeight: 900, color: 'rgba(0,0,0,0.70)', overflow: 'hidden' }}>
                          PARAMS
                        </div>

                        <div style={{ gridRow: '1', gridColumn: '4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 15, fontWeight: 900, color: 'rgba(0,0,0,0.70)', overflow: 'hidden' }}>
                          OVERLAY
                        </div>

                        <div style={{ gridRow: '1', gridColumn: '5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 15, fontWeight: 900, color: 'rgba(0,0,0,0.70)', overflow: 'hidden' }}>
                          STRIPE
                        </div>

                        <div style={{ gridRow: '1', gridColumn: '6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 15, fontWeight: 900, color: 'rgba(0,0,0,0.70)', overflow: 'hidden' }}>
                          DEBUG
                        </div>

                        <div style={{ gridRow: '2', gridColumn: '5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.75)', lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, textAlign: 'left' }}>Ref</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minWidth: 0, flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMegaStripeRefEnabled((v) => !v);
                              }}
                              style={{ height: 20, display: 'flex', alignItems: 'center', padding: '0 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: megaStripeRefEnabled ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.35)', color: megaStripeRefEnabled ? 'rgba(37,99,235,0.95)' : 'rgba(0,0,0,0.70)', fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              {megaStripeRefEnabled ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        </div>

                        <div style={{ gridRow: '2', gridColumn: '4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.75)', lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, textAlign: 'left' }}>overlayMode</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minWidth: 0, flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                try {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMegaStripeOverlayMode((prev) => (String(prev || 'off') === 'off' ? 'black' : 'off'));
                                } catch {
                                  // ignore
                                }
                              }}
                              style={{ height: 20, display: 'flex', alignItems: 'center', padding: '0 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: String(megaStripeOverlayMode || 'off') === 'off' ? 'rgba(255,255,255,0.35)' : 'rgba(59,130,246,0.16)', color: String(megaStripeOverlayMode || 'off') === 'off' ? 'rgba(0,0,0,0.70)' : 'rgba(37,99,235,0.95)', fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap' }}
                            >
                              {String(megaStripeOverlayMode || 'off') === 'off' ? 'OFF' : 'ON'}
                            </button>
                          </div>
                        </div>

                        <div style={{ gridRow: '2', gridColumn: '6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden', height: 'var(--megaStripeHudCellHPx)' }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.75)', lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, textAlign: 'left' }}>stripeOverlayDebug</div>
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
                          const debugPairs = [
                            ['showStripe', snap ? String(Boolean(snap.showStripe)) : '—'],
                            ['active', snap ? String(snap.active || '') : '—'],
                            ['loadState', snap ? String(snap.stripeOverlayLoadState || '') : '—'],
                            ['stripeWide', snap ? String(Boolean(snap.stripeOverlayIsStripeWide)) : '—'],
                            ['resolvedOverlaySrc', snap ? (snap.resolvedOverlaySrc ? 'yes' : 'no') : '—'],
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

                        <div style={{ gridRow: '2', gridColumn: '1', display: 'grid', gridTemplateRows: '1fr 1fr', gridTemplateColumns: '60px 1fr', columnGap: 8, alignItems: 'center', padding: '2px 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ gridRow: '1 / span 2', gridColumn: '1', display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Sprite</div>
                          <div style={{ gridRow: '1', gridColumn: '2', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }} value={String(megaStripeDx)} onChange={(e) => { const v = e.target.value; if (v === '' || v === '-') { setMegaStripeDx(0); return; } const n = Number.parseFloat(v); if (Number.isFinite(n)) setMegaStripeDx(n); }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>s:</div>
                            <input style={{ width: 60, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }} value={String(megaStripeScale)} onChange={(e) => { const v = e.target.value; if (v === '' || v === '-') { setMegaStripeScale(1); return; } const n = Number.parseFloat(v); if (Number.isFinite(n) && n > 0) setMegaStripeScale(Math.min(5, Math.max(0.1, n))); }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                          </div>
                          <div style={{ gridRow: '2', gridColumn: '2', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }} value={String(megaStripeDy)} onChange={(e) => { const v = e.target.value; if (v === '' || v === '-') { setMegaStripeDy(0); return; } const n = Number.parseFloat(v); if (Number.isFinite(n)) setMegaStripeDy(n); }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                          </div>
                        </div>

                        <div style={{ gridRow: '3', gridColumn: '1', display: 'grid', gridTemplateRows: '1fr 1fr', gridTemplateColumns: '60px 1fr', columnGap: 8, alignItems: 'center', padding: '2px 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ gridRow: '1 / span 2', gridColumn: '1', display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Overlay</div>
                          <div style={{ gridRow: '1', gridColumn: '2', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }} value={String(megaStripeOverlayDx)} onChange={(e) => { const v = e.target.value; if (v === '' || v === '-') { setMegaStripeOverlayDx(0); return; } const n = Number.parseFloat(v); if (Number.isFinite(n)) setMegaStripeOverlayDx(n); }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>s:</div>
                            <input value={megaStripeOverlayScaleDraft} onFocus={() => { megaStripeOverlayScaleInputFocusedRef.current = true; setMegaStripeOverlayScaleDraft(String(megaStripeOverlayScale)); }} onBlur={() => { megaStripeOverlayScaleInputFocusedRef.current = false; const v = String(megaStripeOverlayScaleDraft || '').trim(); if (v === '' || v === '-') { setMegaStripeOverlayScaleDraft(String(megaStripeOverlayScale)); return; } const n = Number.parseFloat(v); if (Number.isFinite(n) && n > 0) { const clamped = Math.min(5, Math.max(0.1, n)); setMegaStripeOverlayScale(clamped); setMegaStripeOverlayScaleDraft(String(clamped)); return; } setMegaStripeOverlayScaleDraft(String(megaStripeOverlayScale)); }} onChange={(e) => { setMegaStripeOverlayScaleDraft(e.target.value); }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') { try { e.currentTarget.blur(); } catch { } } }} style={{ width: 60, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }} />
                          </div>
                          <div style={{ gridRow: '2', gridColumn: '2', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }} value={String(megaStripeOverlayDy)} onChange={(e) => { const v = e.target.value; if (v === '' || v === '-') { setMegaStripeOverlayDy(0); return; } const n = Number.parseFloat(v); if (Number.isFinite(n)) setMegaStripeOverlayDy(n); }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                          </div>
                        </div>

                        <div style={{ gridRow: '4', gridColumn: '1', display: 'grid', gridTemplateRows: '1fr 1fr', gridTemplateColumns: '60px 1fr', columnGap: 8, alignItems: 'center', padding: '2px 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ gridRow: '1 / span 2', gridColumn: '1', display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ref</div>
                          <div style={{ gridRow: '1', gridColumn: '2', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>x:</div>
                            <input style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }} value={String(megaStripeRefDx)} onChange={(e) => { const v = e.target.value; if (v === '' || v === '-') { setMegaStripeRefDx(0); return; } const n = Number.parseFloat(v); if (Number.isFinite(n)) setMegaStripeRefDx(n); }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>s:</div>
                            <input style={{ width: 60, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }} value={String(megaStripeRefScale)} onChange={(e) => { const v = e.target.value; if (v === '' || v === '-') { setMegaStripeRefScale(1); return; } const n = Number.parseFloat(v); if (Number.isFinite(n) && n > 0) setMegaStripeRefScale(Math.min(5, Math.max(0.1, n))); }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                          </div>
                          <div style={{ gridRow: '2', gridColumn: '2', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>y:</div>
                            <input style={{ width: 40, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none' }} value={String(megaStripeRefDy)} onChange={(e) => { const v = e.target.value; if (v === '' || v === '-') { setMegaStripeRefDy(0); return; } const n = Number.parseFloat(v); if (Number.isFinite(n)) setMegaStripeRefDy(n); }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                          </div>
                        </div>

                        <div style={{ gridRow: '5', gridColumn: '1', display: 'grid', gridTemplateRows: '1fr 1fr', gridTemplateColumns: '60px 1fr', columnGap: 8, alignItems: 'center', padding: '2px 6px', paddingLeft: 30, minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ gridRow: '1 / span 2', gridColumn: '1', display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.65)', lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Tile</div>
                          <div style={{ gridRow: '1', gridColumn: '2', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(0,0,0,0.60)' }}>g:</div>
                            <input value={String(megaStripeTileGapPx || 0)} onChange={(e) => { const v = e.target.value; if (v === '' || v === '-') { setMegaStripeTileGapPx(0); return; } const n = Number.parseFloat(v); if (Number.isFinite(n)) setMegaStripeTileGapPx(Math.min(200, Math.max(-200, n))); }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} style={{ width: 60, height: 14, padding: 0, border: 0, borderRadius: 0, background: 'transparent', fontSize: 11, fontWeight: 300, outline: 'none', minWidth: 0 }} />
                          </div>
                        </div>

                        <div style={{ gridRow: '2 / span 13', gridColumn: '2 / span 2', padding: 0, minWidth: 0, height: '100%', overflow: 'hidden' }}>
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

                        <div style={{ gridRow: '15 / span 4', gridColumn: '1 / span 1', display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gap: 6, padding: '6px 6px', background: 'transparent' }} />

                        {(() => {
                          try {
                            const sp = new URLSearchParams(location.search || '');
                            const ignored = new Set(['layout', 'guides', 'stripeOverlayDebug']);
                            const entries = Array.from(sp.entries())
                              .filter(([k]) => k && !ignored.has(String(k)))
                              .sort((a, b) => String(a[0]).localeCompare(String(b[0])));

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
                            const longEntries = longEntriesAll.filter(([k]) => !isDebugEntry(k)).slice(0, 3);

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
                                  const row = String(16 - idx);
                                  return (
                                    <div key={key} style={{ gridRow: row, gridColumn: '2 / span 5', display: 'flex', alignItems: 'center', gap: 8, padding: 0, minWidth: 0, height: 'var(--megaStripeHudCellHPx)', overflow: 'hidden', position: 'relative' }}>
                                      <div style={{ padding: '0 6px', paddingLeft: 30, fontSize: 13, fontWeight: 900, lineHeight: 'var(--megaStripeHudCellHPx)', color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flexShrink: 0 }} title={key}>
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

                                <div style={{ gridRow: '18', gridColumn: '2 / span 5', display: 'flex', alignItems: 'center', gap: 8, padding: 0, minWidth: 0, height: 'var(--megaStripeHudCellHPx)', overflow: 'hidden', position: 'relative' }}>
                                  <div style={{ padding: '0 6px', paddingLeft: 30, fontSize: 13, fontWeight: 900, lineHeight: 'var(--megaStripeHudCellHPx)', color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flexShrink: 0 }}>ref src</div>
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
                                    style={{ flex: 1, height: 'var(--megaStripeHudCellHPx)', lineHeight: 'var(--megaStripeHudCellHPx)', padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', fontSize: 13, fontWeight: 300, color: 'rgba(0,0,0,0.55)', outline: 'none', minWidth: 0 }}
                                  />
                                </div>
                              </>
                            );
                          } catch {
                            return (
                              <div style={{ gridRow: '18', gridColumn: '2 / span 3', display: 'flex', alignItems: 'center', gap: 8, padding: 0, minWidth: 0, height: 'var(--megaStripeHudCellHPx)', overflow: 'hidden', position: 'relative' }}>
                                <div style={{ padding: '0 6px', paddingLeft: 30, fontSize: 13, fontWeight: 900, lineHeight: 'var(--megaStripeHudCellHPx)', color: 'rgba(0,0,0,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flexShrink: 0 }}>ref src</div>
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
                                  style={{ flex: 1, height: 'var(--megaStripeHudCellHPx)', lineHeight: 'var(--megaStripeHudCellHPx)', padding: '0 6px', border: 0, borderRadius: 0, background: 'transparent', fontSize: 13, fontWeight: 300, color: 'rgba(0,0,0,0.55)', outline: 'none', minWidth: 0 }}
                                />
                              </div>
                            );
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
