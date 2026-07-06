import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Menu, UserRound, X, Check, Clock, Package, Truck, Search, AlertCircle, MoreHorizontal, Loader2, Eye, EyeOff, LayoutGrid, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProductContext } from '@/contexts/ProductContext';
import { getGildan5000Catalog } from '../utils/placeholders.js';
import {
  AUSTEN_QUOTES_ASSETS,
  resolveAustenQuoteAssetId,
  resolveAustenQuoteThumbFromPath,
  resolveAustenQuoteOriginalFromPath,
} from '../utils/austenQuotesAssets.js';
import FullWideSlideDemoHumanInsideSlider from './FullWideSlideDemoHumanInsideSlider.jsx';
import MegaHeroSlider from './MegaHeroSlider.jsx';
import { UserProfileTabs, UserProfileContent } from './UserProfileTabs.jsx';
import { getSafeBelt, clampNumber } from '@/utils/layoutMetrics';
import {
  FIRST_CONTACT_MEDIA,
  FIRST_CONTACT_MEDIA_WHITE,
  FIRST_CONTACT_MEDIA_COLOR,
  THE_HUMAN_INSIDE_MEDIA,
  THE_HUMAN_INSIDE_MEDIA_WHITE,
  CUBE_MEDIA,
} from './fullwide/megaSlideMedia.js';
import {
  MEGA_PUBLIC_LAST_ACTIVITY_AT_KEY,
  MEGA_PUBLIC_SELECTOR_STATE_KEY,
  touchMegaPublicActivity,
  readMegaPublicSelectorState,
  writeMegaPublicSelectorState,
  getMegaPublicSelectorFor,
  setMegaPublicSelectorFor,
} from './fullwide/megaPublicSelectorState.js';
import MegaStripeBleedGuard from './fullwide/MegaStripeBleedGuard.jsx';
import OptimizedImg from './fullwide/OptimizedImg.jsx';
import IconButton from './fullwide/MegaIconButton.jsx';
import usePersistentState from '@/hooks/usePersistentState';
import {
  FirstContactStripeMockupPanel,
  FirstContactDibuix00Buttons,
  FirstContactDibuix09Buttons,
} from './fullwide/firstContactPanels.jsx';
import MegaColumn, {
  CONTROL_TILE_BN,
  CONTROL_TILE_ARROWS,
} from './fullwide/MegaColumn.jsx';
import UserComandesContent from './fullwide/UserComandesContent.jsx';
import MegaStripePanel from './fullwide/MegaStripePanel.jsx';
import CercadorTopBar, { CERCADOR_COLORS } from './fullwide/CercadorTopBar.jsx';
import CercadorTextRow from './fullwide/CercadorTextRow.jsx';
import CistellComandaContent from './fullwide/CistellComandaContent.jsx';
import useMegaPublicIdleReset from '@/hooks/useMegaPublicIdleReset';
import useUrlActiveCollection from '@/hooks/useUrlActiveCollection';
import useMegaStripeDebugVars from '@/hooks/useMegaStripeDebugVars';
import useMegaTileSelectorDrag from '@/hooks/useMegaTileSelectorDrag';




// Plantilla independent de l'acordió del CISTELL — taula pròpia sobre la pauta


export default function FullWideSlideDemoHeader({
  cartItemCount,
  onCartClick,
  onUserClick,
  ignoreStripeDebugFromUrl = false,
  stripeItemLeftOffsetPxByIndex,
  redistributeStripeBetweenFirstAndLast = false,
  contained = false,
  portalContainer,
  manualEnabledOverride,
  initialActiveId,
  navItems,
  megaConfig,
  showStripe = true,
  showCatalogPanel = true,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { products: contextProducts } = useProductContext();
  const cartClickTimeoutRef = useRef(null);
  const accountClickTimeoutRef = useRef(null);
  const dblClickDelayMs = 0;
  const [searchQuery, setSearchQuery] = useState('');

  
  // Estat per als productes del carrusel
  const [carouselProducts, setCarouselProducts] = useState([
    { img: 'color-card-white.webp', name: 'SENSE & SENSIBILITY', collection: 'austen', drawing: 'austen/crosswords/sense-and-sensibility-4-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
    { img: 'color-card-light-blue.webp', name: 'ROBBIE THE ROBOT', collection: 'the_human_inside', drawing: 'the_human_inside/black/robbie-the-robot-b-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
    { img: 'color-card-royal.webp', name: 'PRIDE & PREJUDICE', collection: 'austen', drawing: 'austen/crosswords/pride-and-prejudice-1-stripe.webp', price: '19,95€', qty: 1, size: 'M', isTemplate: true, disabled: false },
    { img: 'color-card-navy.webp', name: 'ROBOCUBE', collection: 'cube', drawing: 'cube/robocube-stripe.webp', price: '19,95€', qty: 2, size: 'XL', isTemplate: true, disabled: false },
    { img: 'color-card-purple.webp', name: 'PONT DEL DIABLE', collection: 'miscellania', drawing: 'miscellania/black/pont-del-diable-b-stripe.webp', price: '19,95€', qty: 1, size: 'S', isTemplate: true, disabled: false },
    { img: 'color-card-light pink.webp', name: 'NCC-1701-D', collection: 'first_contact', drawing: 'first_contact/black/ncc-1701-d-b-stripe.webp', price: '19,95€', qty: 1, size: 'M', isTemplate: true, disabled: false },
    { img: 'color-card-daisy.webp', name: 'MASCHINENMENSCH', collection: 'the_human_inside', drawing: 'the_human_inside/black/maschinenmensch-b-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
    { img: 'color-card-gold.webp', name: 'PERSUASION', collection: 'austen', drawing: 'austen/crosswords/persuasion-1-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
    { img: 'color-card-red.webp', name: 'CYBER CUBE', collection: 'cube', drawing: 'cube/cyber-cube-stripe.webp', price: '19,95€', qty: 3, size: 'M', isTemplate: true, disabled: false },
    { img: 'color-card-kiwi.webp', name: 'DJ VADER', collection: 'miscellania', drawing: 'miscellania/black/dj-vader-b-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
    { img: 'color-card-irish-green .webp', name: 'PLASMA ESCAPE', collection: 'first_contact', drawing: 'first_contact/black/plasma-escape-b-stripe.webp', price: '19,95€', qty: 1, size: 'XL', isTemplate: true, disabled: false },
    { img: 'color-card-military-green.webp', name: 'VADER', collection: 'the_human_inside', drawing: 'the_human_inside/black/vader-b-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
    { img: 'color-card-forest.webp', name: 'SENSE & SENSIBILITY', collection: 'austen', drawing: 'austen/crosswords/sense-and-sensibility-1-stripe.webp', price: '19,95€', qty: 1, size: 'M', isTemplate: true, disabled: false },
    { img: 'color-card-black.webp', name: 'MAZINGER C', collection: 'cube', drawing: 'cube/mazinger-c-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
  ]);

  // Funcions per modificar quantitat
  const updateQuantity = (index, delta) => {
    setCarouselProducts(prev => prev.map((p, i) => 
      i === index ? { ...p, qty: Math.max(1, p.qty + delta) } : p
    ));
  };

  // Funcions per modificar tallatge
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const updateSize = (index, delta) => {
    setCarouselProducts(prev => prev.map((p, i) => {
      if (i !== index) return p;
      const currentIdx = sizes.indexOf(p.size);
      const newIdx = Math.max(0, Math.min(sizes.length - 1, currentIdx + delta));
      return { ...p, size: sizes[newIdx] };
    }));
  };

  // Estat compartit del cistell (llista definitiva de compra)
  const [cartItems, setCartItems] = useState([
    { title: 'SENSE & SENSIBILITY', collection: 'AUSTEN', qty: 1, size: 'L', price: '19,95€', color: 'white', drawing: 'austen/crosswords/sense-and-sensibility-4-stripe.webp', disabled: false },
    { title: 'ROBBIE THE ROBOT', collection: 'THE HUMAN INSIDE', qty: 1, size: 'L', price: '19,95€', color: 'light-blue', drawing: 'the_human_inside/black/robbie-the-robot-b-stripe.webp', disabled: false },
    { title: 'PRIDE & PREJUDICE', collection: 'AUSTEN', qty: 1, size: 'M', price: '19,95€', color: 'royal', drawing: 'austen/crosswords/pride-and-prejudice-1-stripe.webp', disabled: false },
    { title: 'ROBOCUBE', collection: 'CUBE', qty: 2, size: 'XL', price: '19,95€', color: 'navy', drawing: 'cube/robocube-stripe.webp', disabled: false },
    { title: 'PONT DEL DIABLE', collection: 'MISCEL·LÀNIA', qty: 1, size: 'S', price: '19,95€', color: 'purple', drawing: 'miscellania/black/pont-del-diable-b-stripe.webp', disabled: false },
    { title: 'NCC-1701-D', collection: 'THE HUMAN INSIDE', qty: 1, size: 'M', price: '19,95€', color: 'light-pink', drawing: 'first_contact/black/ncc-1701-d-b-stripe.webp', disabled: false },
    { title: 'MASCHINENMENSCH', collection: 'THE HUMAN INSIDE', qty: 1, size: 'L', price: '19,95€', color: 'daisy', drawing: 'the_human_inside/black/maschinenmensch-b-stripe.webp', disabled: false },
    { title: 'PERSUASION', collection: 'AUSTEN', qty: 1, size: 'L', price: '19,95€', color: 'gold', drawing: 'austen/crosswords/persuasion-1-stripe.webp', disabled: false },
    { title: 'CYBERMAN', collection: 'THE HUMAN INSIDE', qty: 1, size: 'M', price: '19,95€', color: 'red', drawing: 'cube/cyber-cube-stripe.webp', disabled: false },
    { title: 'DJ VADER', collection: 'MISCEL·LÀNIA', qty: 1, size: 'L', price: '19,95€', color: 'kiwi', drawing: 'miscellania/black/dj-vader-b-stripe.webp', disabled: false },
    { title: 'PLASMA ESCAPE', collection: 'MISCEL·LÀNIA', qty: 1, size: 'M', price: '19,95€', color: 'irish-green', drawing: 'first_contact/black/plasma-escape-b-stripe.webp', disabled: false },
    { title: 'VADER', collection: 'MISCEL·LÀNIA', qty: 1, size: 'L', price: '19,95€', color: 'military-green', drawing: 'the_human_inside/black/vader-b-stripe.webp', disabled: false },
    { title: 'SENSE & SENSIBILITY', collection: 'AUSTEN', qty: 1, size: 'M', price: '19,95€', color: 'forest-green', drawing: 'austen/crosswords/sense-and-sensibility-1-stripe.webp', disabled: false },
    { title: 'MAZINGER-C', collection: 'THE HUMAN INSIDE', qty: 1, size: 'XL', price: '19,95€', color: 'black', drawing: 'cube/mazinger-c-stripe.webp', disabled: false },
  ]);

  // Normalitza el color (imatge `color-card-xxx.webp`) al format del cistell
  const colorFromImg = (img) => {
    const raw = String(img || '').replace('color-card-', '').replace('.webp', '').trim();
    const normalized = raw.replace(/\s+/g, '-');
    if (normalized === 'forest') return 'forest-green';
    return normalized;
  };
  const collectionToLabel = (c) => String(c || '').replace(/_/g, ' ').toUpperCase();
  const productToCartItem = (p) => ({
    title: p.name,
    collection: collectionToLabel(p.collection),
    qty: p.qty,
    size: p.size,
    price: p.price,
    color: colorFromImg(p.img),
    drawing: p.drawing,
    disabled: false,
  });

  // X del carrusel: 1r clic desactiva, 2n clic esborra definitivament
  const disableProduct = (index) => {
    setCarouselProducts(prev => {
      const target = prev[index];
      if (!target) return prev;
      if (!target.disabled) {
        return prev.map((p, i) => i === index ? { ...p, disabled: true } : p);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Targeta de crèdit del carrusel: mou el producte del carrusel a la llista definitiva
  const moveProductToCart = (index) => {
    setCarouselProducts(prev => {
      const p = prev[index];
      if (!p) return prev;
      setCartItems(ci => [...ci, productToCartItem(p)]);
      return prev.filter((_, i) => i !== index);
    });
  };
  const searchResults = useMemo(() => {
    const products = Array.isArray(contextProducts) ? contextProducts : [];
    const q = (searchQuery || '').toString().trim().toLowerCase();

    const normalizeCollectionKey = (value) => {
      return (value || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/_/g, '-')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const allowedCollectionKeys = new Set(['the-human-inside', 'first-contact', 'austen', 'miscellania']);
    const collectionLabelByKey = {
      'the-human-inside': 'The Human Inside',
      'first-contact': 'First Contact',
      austen: 'Austen',
      miscellania: 'Miscel·lània',
    };

    const isCubeRelated = (p) => {
      const haystack = `${p?.collection || ''} ${p?.slug || ''} ${p?.name || ''} ${p?.description || ''}`.toLowerCase();
      return haystack.includes('cube');
    };

    const matches = (p) => {
      if (!p) return false;
      if (!q) return true;
      const haystack = `${p.slug || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
      return haystack.includes(q);
    };

    const toPriceLabel = (value) => {
      if (typeof value === 'number' && Number.isFinite(value)) return `${value.toFixed(2)} €`;
      if (typeof value === 'string' && value.trim()) return value.trim();
      return '—';
    };

    return products
      .filter((p) => allowedCollectionKeys.has(normalizeCollectionKey(p?.collection)))
      .filter((p) => !isCubeRelated(p))
      .filter((p) => matches(p))
      .slice(0, 160)
      .map((p) => {
        const id = p?.slug || p?.id;
        const slugOrId = p?.slug || p?.id;
        const collectionKey = normalizeCollectionKey(p?.collection);
        const collection = (collectionLabelByKey?.[collectionKey] || p?.collection || 'Catàleg').toString();
        const name = (p?.name || 'Producte').toString();
        const image = p?.image || p?.images?.[0] || null;
        return {
          id: id?.toString() || name,
          slugOrId,
          category: collection,
          title: name,
          price: toPriceLabel(p?.price),
          image,
        };
      });
  }, [contextProducts, searchQuery]);

  const searchAccent = '#ef4444';
  const searchTopLinks = useMemo(() => ['Novetats', 'Samarretes', 'Bosses', 'Promocions'], []);

  const searchSuggestions = useMemo(
    () => [
      'Samarreta Gildan 5000',
      'Dibuixos',
      'Logotips',
      'Bosses',
      'Papereria',
    ],
    []
  );
  const [searchGridScale, setSearchGridScale] = useState(1);
  const [searchCaretVisible, setSearchCaretVisible] = useState(true);
  const [megaPage, setMegaPage] = usePersistentState('HG_MEGA_PAGE', 1);
  const [megaFullScreen, setMegaFullScreen] = useState(false);
  const [manualOverrideClosed, setManualOverrideClosed] = useState(false);
  // TTL de 30 minuts perquè l'estat de l'acordió es mantingui en
  // canviar entre pestanyes (cistell ↔ compte) i en obrir/tancar el
  // mega-slide. Després d'aquest temps, torna al valor inicial.
  const ACORDIO_TTL_MS = 30 * 60 * 1000;
  const [acordioExpanded, setAcordioExpanded] = usePersistentState('HG_ACORDIO_EXPANDED', false, ACORDIO_TTL_MS);
  const [acordioExpandedPage4, setAcordioExpandedPage4] = usePersistentState('HG_ACORDIO_EXPANDED_PAGE4', false, ACORDIO_TTL_MS);
  const [megaAccordionLocked, setMegaAccordionLocked] = useState(() => {
    try {
      return window.localStorage.getItem('HG_MEGA_ACCORDION_LOCKED_V1') === '1';
    } catch {
      return false;
    }
  });
  const [activeUserTab, setActiveUserTab] = usePersistentState('HG_ACTIVE_USER_TAB', '1');
  const [firstContactSelectedItem, setFirstContactSelectedItem] = useState(null);
  const [humanInsideSelectedItem, setHumanInsideSelectedItem] = useState(null);
  const [selectedItemByCollection, setSelectedItemByCollection] = useState({});
  const [cercadorSelectedColor, setCercadorSelectedColor] = useState('white');
  const [hoveredStripeItem, setHoveredStripeItem] = useState(null);
  const [hoveredStripeItemCollection, setHoveredStripeItemCollection] = useState(null);
  const [austenSubcollection, setAustenSubcollection] = useState(null);

  const resolvePdpUrl = useCallback((collection, item) => {
    if (typeof item !== 'string') return null;
    const s = item.toLowerCase().replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-').replace(/\s+/g, '-');

    if (collection === 'first_contact') {
      const map = {
        'nx-01': 'nx-01', 'ncc-1701': 'ncc-1701', 'ncc-1701-d': 'ncc-1701-d',
        'wormhole': 'wormhole', 'the phoenix': 'the-phoenix',
        "vulcan's end": 'vulcans-end', 'plasma escape': 'plasma-escape',
      };
      const slug = map[s] || s;
      return `/first-contact/${slug}`;
    }
    if (collection === 'the_human_inside') {
      const map = {
        'r2-d2': 'r2-d2', 'c3p0': 'c3-p0', 'c3-p0': 'c3-p0',
        'vader': 'vader', 'afrodita': 'afrodita', 'afrodita-a': 'afrodita',
        'mazinger': 'mazinger', 'mazinger-z': 'mazinger',
        'cylon 78': 'cylon-78', 'cylon 03': 'cylon-03',
        'iron man 68': 'ironman-68', 'iron man 08': 'ironman-08',
        'cyberman': 'cyberman', 'maschinenmensch': 'maschinenmensch',
        'robocop': 'robocop', 'the dalek': 'the-dalek',
        'robbie the robot': 'robbie-the-robot', 'robby the robot': 'robbie-the-robot',
        'terminator': 'terminator',
      };
      const slug = map[s] || s;
      return `/the-human-inside/${slug}`;
    }
    if (collection === 'cube') {
      const map = {
        'iron kong': 'ironkong', 'iron cube 68': 'ironman-68',
        'robocube': 'robocube', 'cylon cube 03': 'cylon-cube',
        'maschinencube': 'maschinencube', 'mazinger c': 'mazinger-c',
        'afrodita c': 'afrodita-c', 'cube 3 p0': '3cube-p0',
        'cyber cube': 'cybercube', 'darth cube': 'darth-cube',
      };
      const slug = map[s] || s;
      return `/cube/${slug}`;
    }
    if (collection === 'miscellania') {
      const map = {
        'dj vader': 'dj-vader', 'dj-vader': 'dj-vader',
        'death star2d2': 'death-star2d2', 'death-star2d2': 'death-star2d2',
        'pont del diable': 'pont-del-diable', 'pont-del-diable': 'pont-del-diable',
        'arthur d the second': 'arthur-d-the-second',
        'r2d2 quote': 'r2d2-quote',
      };
      const slug = map[s] || s;
      return `/miscellania/${slug}`;
    }
    if (collection === 'austen') {
      if (s.includes('/austen/pemberley_house/')) return '/austen/pemberley-house';
      if (s.includes('/austen/keep_calm/')) return '/austen/keep-calm';
      if (s.includes('/austen/quotes/')) {
        const slug = s.split('/austen/quotes/')[1].replace(/-b-grid\.webp$/, '').replace(/\.webp$/, '');
        const map = {
          'it-is-a-truth': 'quotes-it-is-a-truth',
          'you-must-allow-me': 'quotes-you-have-bewitched-me',
          'body-and-soul': 'quotes-i-admire-and-love-you',
          'unsociable-and-taciturn': 'quotes-unsociable-and-taciturn',
          'half-agony-half-hope': 'quotes-half-agony-half-hope',
        };
        return `/austen/${map[slug] || slug}`;
      }
      if (s.includes('/austen/crosswords/')) {
        const m = s.match(/(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d)/);
        if (m) return `/austen/${m[1]}-${m[2]}`;
      }
      if (s.includes('/austen/looking_for_my_darcy/')) {
        const m = s.match(/(blue|fuchsia|red|yellow)-(solid|frame)/);
        if (m) {
          const colorMap = { fuchsia: 'pink' };
          const c = colorMap[m[1]] || m[1];
          if (m[2] === 'solid') return `/austen/looking-for-my-darcy-${c}-solid`;
          if (m[2] === 'frame') {
            const frameMap = {
              'blue-frame': 'yellow-blue-frame',
              'fuchsia-frame': 'yellow-pink-frame',
              'red-frame': 'red-yellow-frame',
            };
            return `/austen/looking-for-my-darcy-${frameMap[`${m[1]}-frame`] || `${c}-frame`}`;
          }
        }
      }
    }
    return null;
  }, []);

  const [active, setActive] = useState(() => {
    try {
      const p = new URLSearchParams(location.search);
      const fromUrl = p.get('active') || p.get('collection') || '';
      const next = typeof fromUrl === 'string' ? fromUrl.trim() : '';
      const allowed = new Set(['first_contact', 'the_human_inside', 'austen', 'cube', 'miscellania']);
      if (next && allowed.has(next)) return next;

      if (contained) return initialActiveId || 'first_contact';
      if (typeof manualEnabledOverride === 'boolean') {
        return manualEnabledOverride ? (initialActiveId || 'first_contact') : null;
      }
      return window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1' ? 'first_contact' : null;
    } catch {
      if (contained) return initialActiveId || 'first_contact';
      if (typeof manualEnabledOverride === 'boolean') {
        return manualEnabledOverride ? (initialActiveId || 'first_contact') : null;
      }
      return null;
    }
  });

  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (active !== 'austen') setAustenSubcollection(null);
  }, [active]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (!active) return;
      window.dispatchEvent(new Event('mega-tile-selector-changed'));
    } catch {
      // ignore
    }
  }, [active]);

  useMegaPublicIdleReset();
  useUrlActiveCollection(location.search, setActive);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && megaFullScreen) {
        setMegaFullScreen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [megaFullScreen]);

  const disableCatalogPanel =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('noCatalogPanel');
  const wsEnabled =
    typeof window !== 'undefined' && import.meta.env.DEV && new URLSearchParams(window.location.search).has('ws');
  const effectiveDisableCatalogPanel = disableCatalogPanel || showCatalogPanel === false;
  const gridCalibFromUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('gridCalib');

  const bleedGuardDebug = typeof window !== 'undefined'
    && import.meta.env.DEV
    && new URLSearchParams(window.location.search).has('bleedGuardDebug');

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const getTargetEl = () => {
      try {
        const main = document.querySelector('main#main-content');
        if (!main) return null;
        const exact = main.querySelector(
          ':scope > div:nth-child(1) > header:nth-of-type(1) > div:nth-child(1) > div:nth-child(1)'
        );
        if (exact) return exact;
        const el = (node, idx) => (node?.children && node.children[idx]) ? node.children[idx] : null;
        const div0 = el(main, 0);
        const header0 = div0 ? div0.querySelector('header') : null;
        if (!header0) return null;
        const border0 = el(header0, 0);
        const row0 = border0 ? el(border0, 0) : null;
        return row0 || null;
      } catch {
        return null;
      }
    };

    const read = () => {
      try {
        const megaEl = megaMenuRef.current;
        const targetEl = getTargetEl();
        if (!megaEl || !targetEl) return;
        const megaRect = megaEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const leftRaw = megaRect.left - targetRect.left;
        const rightRaw = targetRect.right - megaRect.right;
        const left = Math.max(0, Math.round(leftRaw * 100) / 100);
        const right = Math.max(0, Math.round(rightRaw * 100) / 100);
        setBleedGuardExpandPx((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));

        if (bleedGuardDebug) {
          const round2 = (v) => Math.round(v * 100) / 100;
          window.__HG_BLEED_GUARD_DEBUG__ = {
            left,
            right,
            leftRaw: round2(leftRaw),
            rightRaw: round2(rightRaw),
            megaRect: {
              left: round2(megaRect.left),
              right: round2(megaRect.right),
              width: round2(megaRect.width),
            },
            targetRect: {
              left: round2(targetRect.left),
              right: round2(targetRect.right),
              width: round2(targetRect.width),
            },
          };
        }

        window.__MEASURE_MEGA_BELT2_V2__ = () => {
          const round2 = (v) => Math.round(v * 100) / 100;
          const rootStyle = window.getComputedStyle(document.documentElement);
          const xL = parseFloat(rootStyle.getPropertyValue('--belt2-xL'));
          const xR = parseFloat(rootStyle.getPropertyValue('--belt2-xR'));
          const track = [...document.querySelectorAll('div')]
            .map((el) => ({ el, rect: el.getBoundingClientRect() }))
            .filter(({ el, rect }) => el.style?.width === '400%' && rect.width > 0 && rect.height > 0)
            .sort((a, b) => b.rect.width - a.rect.width)[0]?.el || null;
          const activeSlide = track?.children?.[Math.max(0, Math.min(3, megaPage - 1))] || null;
          const activeContent = [...(activeSlide?.querySelectorAll?.('div') || [])]
            .find((el) => el.style?.width === '1400px' || el.style?.width?.includes?.('1400px')) || null;
          const visibleMega = track?.parentElement?.parentElement?.parentElement || megaEl;
          const toRect = (el) => {
            const r = el?.getBoundingClientRect?.();
            return r ? { left: round2(r.left), right: round2(r.right), width: round2(r.width) } : null;
          };
          const result = {
            viewport: { width: round2(window.innerWidth), visualWidth: round2(window.visualViewport?.width ?? window.innerWidth) },
            belt2: { xL: round2(xL), xR: round2(xR), width: round2(xR - xL) },
            track: toRect(track),
            mega: toRect(visibleMega),
            target: toRect(targetEl),
            activeSlide: toRect(activeSlide),
            activeContent: toRect(activeContent),
          };
          console.table(result);
          return result;
        };
      } catch {
        // ignore
      }
    };

    read();
    window.addEventListener('resize', read);
    window.addEventListener('scroll', read, true);
    const t1 = window.setTimeout(read, 50);
    const t2 = window.setTimeout(read, 250);
    return () => {
      window.removeEventListener('resize', read);
      window.removeEventListener('scroll', read, true);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [active]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const readLocked = () => {
      try {
        setMegaAccordionLocked(window.localStorage.getItem('HG_MEGA_ACCORDION_LOCKED_V1') === '1');
      } catch {
        setMegaAccordionLocked(false);
      }
    };
    const onLockChange = (event) => {
      const locked = event?.detail?.locked;
      if (typeof locked === 'boolean') {
        setMegaAccordionLocked(locked);
      } else {
        readLocked();
      }
    };
    readLocked();
    window.addEventListener('hg:mega-accordion-lock-change', onLockChange);
    window.addEventListener('storage', readLocked);
    return () => {
      window.removeEventListener('hg:mega-accordion-lock-change', onLockChange);
      window.removeEventListener('storage', readLocked);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    // Manté l'acordió obert si el lock està actiu, però NOMÉS quan la
    // pestanya retorna en primer pla (focus/pageshow/visibilitychange).
    // No s'executa en cada canvi de `megaPage` perquè trencaria la
    // seqüència de 3 clics del cistell/compte: el clic 1 posa
    // `acordioExpanded=false` i, si l'efecte es disparés en el mateix
    // render, el reobririria immediatament.
    const keepLockedAccordionOpen = () => {
      if (!megaAccordionLocked) return;
      if (megaPage === 3) {
        setAcordioExpanded(true);
      }
      if (megaPage === 4) {
        setAcordioExpandedPage4(true);
      }
    };
    window.addEventListener('focus', keepLockedAccordionOpen);
    window.addEventListener('pageshow', keepLockedAccordionOpen);
    window.addEventListener('visibilitychange', keepLockedAccordionOpen);
    return () => {
      window.removeEventListener('focus', keepLockedAccordionOpen);
      window.removeEventListener('pageshow', keepLockedAccordionOpen);
      window.removeEventListener('visibilitychange', keepLockedAccordionOpen);
    };
  }, [megaAccordionLocked, megaPage, setAcordioExpanded, setAcordioExpandedPage4]);

  const overlaySrcFromUrl = useMemo(() => {
    try {
      if (typeof window === 'undefined') return null;
      const p = new URLSearchParams(location?.search || window.location.search);
      const raw = p.get('stripeOverlay');
      if (typeof raw !== 'string') return null;
      const v = raw
        .trim()
        .replace(/[\s,;]+$/g, '');
      return v ? v : null;
    } catch {
      return null;
    }
  }, [location?.search]);

  const overlayStorageKey = useMemo(() => {
    const k = (active || '').toString();
    return k ? `HG_STRIPE_OVERLAY_SRC_${k}` : 'HG_STRIPE_OVERLAY_SRC';
  }, [active]);

  const [stripeOverlayOverrideActive, setStripeOverlayOverrideActive] = useState(() => Boolean(overlaySrcFromUrl));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoManualEnabled, setDemoManualEnabled] = useState(() => {
    if (typeof manualEnabledOverride === 'boolean') return manualEnabledOverride;
    if (contained) return true;
    try {
      return window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1';
    } catch {
      return false;
    }
  });
  const readStripeVariantFromUrl = () => {
    try {
      const p = new URLSearchParams(location.search);
      const raw = (p.get('stripeVariant') || '').toString().trim().toLowerCase();
      if (raw === 'white' || raw === 'black' || raw === 'color') return raw;
      return '';
    } catch {
      return '';
    }
  };

  const [firstContactVariant, setFirstContactVariant] = useState(() => readStripeVariantFromUrl() || 'black');
  const [humanInsideVariant, setHumanInsideVariant] = useState(() => readStripeVariantFromUrl() || 'black');

  // Color de samarreta realment mostrat: coincideix amb el selector excepte
  // quan la variant és BLANC sobre blanc o NEGRE sobre negre, llavors s'inverteix
  // perquè la tinta sigui visible. El selector no es mou.
  const displayedShirtColor = useMemo(() => {
    const variant = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
    if (variant === 'white' && cercadorSelectedColor === 'white') return 'black';
    if (variant === 'black' && cercadorSelectedColor === 'black') return 'white';
    return cercadorSelectedColor;
  }, [active, firstContactVariant, humanInsideVariant, cercadorSelectedColor]);

  const onShirtClick = useCallback((collection, item, color) => {
    const url = resolvePdpUrl(collection, item);
    if (url) {
      const matched = CERCADOR_COLORS.find((c) => c.hex === color);
      const colorSlug = matched?.slug || displayedShirtColor || 'white';
      const variant = collection === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
      navigate(`${url}?color=${colorSlug}&variant=${variant}`);
    }
  }, [navigate, resolvePdpUrl, displayedShirtColor, firstContactVariant, humanInsideVariant]);

  const [selectedColorSlug, setSelectedColorSlug] = useState('white');
  const [thinStartIndex, setThinStartIndex] = useState(0);
  const [gildan5000Catalog, setGildan5000Catalog] = useState(null);

  useEffect(() => {
    try {
      const v = readStripeVariantFromUrl();
      if (!v) return;
      setFirstContactVariant(v);
      setHumanInsideVariant(v);
    } catch {
      // ignore
    }
  }, [location.search]);

  const austenSelectedIsCrosswords = useMemo(() => {
    try {
      const key = selectedItemByCollection?.austen;
      if (typeof key !== 'string') return false;
      return key.toLowerCase().includes('/austen/crosswords/');
    } catch {
      return false;
    }
  }, [selectedItemByCollection]);

  const austenSelectedIsPemberley = useMemo(() => {
    try {
      const key = selectedItemByCollection?.austen;
      if (typeof key !== 'string') return false;
      return key.toLowerCase().includes('/austen/pemberley_house/');
    } catch {
      return false;
    }
  }, [selectedItemByCollection]);

  const austenSelectedDisableMulti = Boolean(austenSelectedIsCrosswords || austenSelectedIsPemberley);

  const stripeVariantVisibility = useMemo(() => {
    try {
      if (!active) return { white: true, black: true, color: true };
      if (active === 'first_contact') return { white: true, black: true, color: true };
      if (active === 'the_human_inside') return { white: true, black: true, color: true };
      if (active === 'miscellania') return { white: true, black: true, color: true };
      if (active === 'cube') return { white: false, black: false, color: true };

      if (active === 'austen') {
        const key = selectedItemByCollection?.austen;
        const s = typeof key === 'string' ? key.toLowerCase() : '';
        const sub = austenSubcollection || '';
        if (s.includes('/austen/crosswords/') || sub === 'crosswords') return { white: true, black: true, color: false };
        if (s.includes('/austen/quotes/') || sub === 'quotes') return { white: true, black: true, color: false };
        if (s.includes('/austen/looking_for_my_darcy/') || sub === 'looking_for_my_darcy') return { white: false, black: false, color: true };
        return { white: true, black: true, color: true };
      }

      return { white: true, black: true, color: true };
    } catch {
      return { white: true, black: true, color: true };
    }
  }, [active, selectedItemByCollection, austenSubcollection]);

  useEffect(() => {
    if (active !== 'austen') return;
    if (!austenSelectedDisableMulti) return;
    if (firstContactVariant !== 'color') return;
    setFirstContactVariant('white');
  }, [active, austenSelectedDisableMulti, firstContactVariant]);

  useEffect(() => {
    try {
      if (!active) return;
      if (active === 'the_human_inside') return;
      const allowed = stripeVariantVisibility || { white: true, black: true, color: true };
      const want = firstContactVariant;
      const ok = (want === 'white' && allowed.white) || (want === 'black' && allowed.black) || (want === 'color' && allowed.color);
      if (ok) return;
      if (allowed.white) setFirstContactVariant('white');
      else if (allowed.black) setFirstContactVariant('black');
      else if (allowed.color) setFirstContactVariant('color');
    } catch {
    }
  }, [active, stripeVariantVisibility, firstContactVariant]);


  useEffect(() => {
    if (!import.meta.env.DEV) return;
    try {
      if (typeof window === 'undefined') return;
      const prev = window.__HG_OVERLAY_DEBUG__ || {};
      window.__HG_OVERLAY_DEBUG__ = {
        ...prev,
        active,
        firstContactVariant,
        humanInsideVariant,
      };
    } catch {
      // ignore
    }
  }, [active, firstContactVariant, humanInsideVariant]);

  const reorderAustenQuotes = (items) => {
    try {
      if (!Array.isArray(items) || items.length === 0) return items;
      const wantOrder = [
        'it-is-a-truth',
        'you-must-allow-me',
        'body-and-soul',
        'unsociable-and-taciturn',
        'half-agony-half-hope',
      ];
      const rankByNeedle = new Map(wantOrder.map((v, idx) => [v, idx]));
      const pickRank = (v) => {
        if (typeof v !== 'string') return null;
        const s = v.toLowerCase();
        if (!s.includes('/austen/quotes/')) return null;
        for (const [needle, idx] of rankByNeedle.entries()) {
          if (s.includes(needle)) return idx;
        }
        return null;
      };

      const quoteSlots = [];
      for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        const r = pickRank(it);
        if (r === null) continue;
        quoteSlots.push({ idx: i, it, r });
      }

      if (quoteSlots.length === 0) return items;

      const sortedQuotes = quoteSlots
        .slice()
        .sort((a, b) => {
          if (a.r !== b.r) return a.r - b.r;
          return a.idx - b.idx;
        })
        .map((e) => e.it);

      const out = items.slice();
      quoteSlots.forEach((slot, i) => {
        out[slot.idx] = sortedQuotes[i];
      });

      return out;
    } catch {
      return items;
    }
  };

  useEffect(() => {
    if (overlaySrcFromUrl) {
      setStripeOverlayOverrideActive(true);
      return;
    }
    setStripeOverlayOverrideActive(false);
  }, [overlaySrcFromUrl]);

  const onStartSelectorDrag = useMegaTileSelectorDrag();

  const normalizeOverlaySrc = useCallback((value) => {
    let s = (value || '').toString().trim();
    if (!s) return null;
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")) || (s.startsWith('`') && s.endsWith('`'))) {
      s = s.slice(1, -1).trim();
    }
    if (!s) return null;
    if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s)) return s;

    try {
      // Normalize pasted filesystem paths like:
      //   /.../higginsgrafic-ecommerce-dev/public/custom_logos/...
      // into:
      //   /custom_logos/...
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
    } catch {
      // ignore
    }

    try {
      // Allow entering just the filename for Keep Calm stripe overlays.
      const file = (s.split('/').pop() || '').trim();
      const lower = file.toLowerCase();
      const isBare = (file === s && !s.startsWith('/')) || (s === `/${file}`);
      const hasNoFolders = (s === file) || (s === `/${file}`);
      if (isBare && hasNoFolders && /^keep-calm-.*-stripe\.webp$/i.test(file)) {
        const folder = lower.includes('-b-stripe')
          ? 'black'
          : lower.includes('-w-stripe')
            ? 'white'
            : (lower.includes('multi') || lower.includes('-multi-'))
              ? 'color'
              : 'color';
        return `/custom_logos/drawings/images_stripe/austen/keep_calm/${folder}/${file}`;
      }
    } catch {
      // ignore
    }

    const rooted = s.startsWith('/') ? s : `/${s}`;
    return rooted.replace(
      '/custom_logos/drawings/images_stripe/stripe/',
      '/custom_logos/drawings/images_stripe/',
    );
  }, []);

  const {
    megaStripeRefEnabledLocal,
    megaStripeRefSrcLocal,
    megaStripeRef2EnabledLocal,
    megaStripeRef2SrcLocal,
    megaStripeSpriteEnabledLocal,
    megaShirtDrawingEnabledLocal,
    drawingOverlaySrcLocal,
    drawingOverlaySrcEffective,
    tileGapPxLocal,
  } = useMegaStripeDebugVars(normalizeOverlaySrc);

  const resolvedOverlaySrc = useMemo(() => {
    const normalizeKeyLocal = (value) => {
      if (typeof value !== 'string') return '';
      return value
        .trim()
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
        .replace(/\s+/g, ' ');
    };
    const isPathItem = (it) => typeof it === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(it);

    // Hover preview: override selected item with hovered item when applicable
    const effFirstContact = (hoveredStripeItem && hoveredStripeItemCollection === 'first_contact')
      ? hoveredStripeItem : firstContactSelectedItem;
    const effHumanInside = (hoveredStripeItem && hoveredStripeItemCollection === 'the_human_inside')
      ? hoveredStripeItem : humanInsideSelectedItem;
    const effSelectedItemByCollection = (hoveredStripeItem && hoveredStripeItemCollection === active && active !== 'first_contact' && active !== 'the_human_inside')
      ? { ...selectedItemByCollection, [active]: hoveredStripeItem } : selectedItemByCollection;

    if (stripeOverlayOverrideActive && overlaySrcFromUrl) {
      return overlaySrcFromUrl;
    }

    if (active === 'first_contact' && effFirstContact) {
      if (firstContactVariant === 'white') {
        return FIRST_CONTACT_MEDIA_WHITE[effFirstContact]
          || FIRST_CONTACT_MEDIA[effFirstContact]
          || null;
      }
      if (firstContactVariant === 'color') {
        return FIRST_CONTACT_MEDIA_COLOR[effFirstContact]
          || FIRST_CONTACT_MEDIA[effFirstContact]
          || null;
      }
      return FIRST_CONTACT_MEDIA[effFirstContact] || null;
    }
    if (active === 'the_human_inside' && effHumanInside) {
      const key = normalizeKeyLocal(effHumanInside).toLowerCase();
      const mapBlack = {
        'r2-d2': 'r2-d2-b-stripe.webp',
        c3p0: 'c3-p0-b-stripe.webp',
        vader: 'vader-b-stripe.webp',
        afrodita: 'afrodita-a-b-stripe.webp',
        'afrodita-a': 'afrodita-a-b-stripe.webp',
        mazinger: 'mazinger-z-b-stripe.webp',
        'mazinger-z': 'mazinger-z-b-stripe.webp',
        'cylon 78': 'cylon-78-b-stripe.webp',
        'cylon 03': 'cylon-03-b-stripe.webp',
        'iron man 68': 'iron-man-68-b-stripe.webp',
        'iron man 08': 'iron-man-08-b-stripe.webp',
        cyberman: 'cyberman-b-stripe.webp',
        'the dalek': 'the-dalek-b-stripe.webp',
        robocop: 'robocop-b-stripe.webp',
        terminator: 'terminator-b-stripe.webp',
        maschinenmensch: 'maschinenmensch-b-stripe.webp',
        'robby the robot': 'robbie-the-robot-b-stripe.webp',
        'robbie the robot': 'robbie-the-robot-b-stripe.webp',
      };

      const mapWhite = {
        'r2-d2': 'r2-d2-w-stripe.webp',
        c3p0: 'c3-p0-w-stripe.webp',
        vader: 'vader-w-stripe.webp',
        afrodita: 'afrodita-a-w-stripe.webp',
        'afrodita-a': 'afrodita-a-w-stripe.webp',
        mazinger: 'mazinger-z-w-stripe.webp',
        'mazinger-z': 'mazinger-z-w-stripe.webp',
        'cylon 78': 'cylon-78-w-stripe.webp',
        'cylon 03': 'cylon-03-w-stripe.webp',
        'iron man 68': 'iron-man-68-w-stripe.webp',
        'iron man 08': 'iron-man-08-w-stripe.webp',
        cyberman: 'cyberman-w-stripe.webp',
        'the dalek': 'the-dalek-w-stripe.webp',
        robocop: 'robocop-w-stripe.webp',
        terminator: 'terminator-w-stripe.webp',
        maschinenmensch: 'maschinenmensch-w-stripe.webp',
        'robby the robot': 'robbie-the-robot-w-stripe.webp',
        'robbie the robot': 'robbie-the-robot-w-stripe.webp',
      };

      const mapColor = {
        'r2-d2': 'r2-d2-multi-light-stripe.webp',
        c3p0: 'c3-p0-multi-light-stripe.webp',
        vader: 'vader-multi-light-stripe.webp',
        afrodita: 'afrodita-a-multi-dark-stripe.webp',
        'afrodita-a': 'afrodita-a-multi-dark-stripe.webp',
        mazinger: 'mazinger-z-multi-light-stripe.webp',
        'mazinger-z': 'mazinger-z-multi-light-stripe.webp',
        'cylon 78': 'cylon-78-multi-light-stripe.webp',
        'cylon 03': 'cylon-03-multi-light-stripe.webp',
        'iron man 68': 'iron-man-68-multi-light-stripe.webp',
        'iron man 08': 'iron-man-08-multi-light-stripe.webp',
        cyberman: 'cyberman-multi-light-stripe.webp',
        'the dalek': 'the-dalek-multi-light-stripe.webp',
        robocop: 'robocop-multi-light-stripe.webp',
        terminator: 'terminator-multi-light-stripe.webp',
        maschinenmensch: 'maschinenmensch-multi-light-stripe.webp',
        'robby the robot': 'robbie-the-robot-multi-light-stripe.webp',
        'robbie the robot': 'robbie-the-robot-multi-light-stripe.webp',
      };

      const isWhite = humanInsideVariant === 'white';
      const isColor = humanInsideVariant === 'color';
      let file = (isColor ? mapColor : (isWhite ? mapWhite : mapBlack))[key] || null;
      if (!file) {
        const k = key;
        if ((k.includes('robbie') || k.includes('robby')) && k.includes('robot')) {
          file = isColor
            ? 'robbie-the-robot-multi-light-stripe.webp'
            : (isWhite ? 'robbie-the-robot-w-stripe.webp' : 'robbie-the-robot-b-stripe.webp');
        } else if (k.includes('cylon') && k.includes('78')) {
          file = isColor
            ? 'cylon-78-multi-light-stripe.webp'
            : (isWhite ? 'cylon-78-w-stripe.webp' : 'cylon-78-b-stripe.webp');
        } else if (k.includes('afrodita')) {
          file = isColor
            ? 'afrodita-a-multi-dark-stripe.webp'
            : (isWhite ? 'afrodita-a-w-stripe.webp' : 'afrodita-a-b-stripe.webp');
        } else if (k.includes('iron') && k.includes('man') && k.includes('68')) {
          file = isColor
            ? 'iron-man-68-multi-light-stripe.webp'
            : (isWhite ? 'iron-man-68-w-stripe.webp' : 'iron-man-68-b-stripe.webp');
        }
      }
      if (!file) return null;
      const folder = isColor ? 'color' : (isWhite ? 'white' : 'black');
      return `/custom_logos/drawings/images_stripe/the_human_inside/${folder}/${file}`;
    }
    if (active && effSelectedItemByCollection?.[active]) {
      const key = effSelectedItemByCollection[active];

      if (active === 'cube' && typeof key === 'string' && !isPathItem(key)) {
        const k = normalizeKeyLocal(key).toLowerCase();
        const map = {
          'iron kong': 'iron-cube-08-iron-kong-stripe.webp',
          'iron cube': 'iron-cube-68-stripe.webp',
          'iron cube 68': 'iron-cube-68-stripe.webp',
          robocube: 'robocube-stripe.webp',
          'cylon cube': 'cylon-cube-03-stripe.webp',
          'cylon cube 03': 'cylon-cube-03-stripe.webp',
          maschinencube: 'maschinencube-stripe.webp',
          'mazinger c': 'mazinger-c-stripe.webp',
          'afrodita c': 'afrodita-c-stripe.webp',
          'cube 3 p0': 'cube-3-p0-stripe.webp',
          '3cube p0': 'cube-3-p0-stripe.webp',
          '3cube-p0': 'cube-3-p0-stripe.webp',
          'cyber cube': 'cyber-cube-stripe.webp',
          cybercube: 'cyber-cube-stripe.webp',
          'darth cube': 'darth-cube-stripe.webp',
        };
        const file = map[k] || null;
        const out = file ? `/custom_logos/drawings/images_stripe/cube/${file}` : null;
        if (import.meta.env.DEV && !out) {
          // eslint-disable-next-line no-console
          console.error('[CUBE stripe overlay] unresolved label', { key, normalized: k });
        }
        return out;
      }

      if (active === 'miscellania' && typeof key === 'string' && !isPathItem(key)) {
        const k = normalizeKeyLocal(key).toLowerCase();
        const out = (() => {
          if (firstContactVariant === 'color') {
            if (k === 'dj vader' || k === 'dj-vader') return '/custom_logos/drawings/images_stripe/miscellania/color/dj-vader-multi-light-stripe.webp';
            if (k === 'deathstar2d2' || k === 'death star2d2' || k === 'death-star2d2') return '/custom_logos/drawings/images_stripe/miscellania/color/death-star2d2-multi-light-stripe.webp';
            if (k === 'pont del diable' || k === 'pont-del-diable') return '/custom_logos/drawings/images_stripe/miscellania/color/pont-del-diable-multi-light-stripe.webp';
          }

          if (firstContactVariant === 'white') {
            if (k === 'dj vader' || k === 'dj-vader') return '/custom_logos/drawings/images_stripe/miscellania/white/dj-vader-w-stripe.webp';
            if (k === 'deathstar2d2' || k === 'death star2d2' || k === 'death-star2d2') return '/custom_logos/drawings/images_stripe/miscellania/white/death-star2d2-w-stripe.webp';
            if (k === 'pont del diable' || k === 'pont-del-diable') return '/custom_logos/drawings/images_stripe/miscellania/white/pont-del-diable-w-stripe.webp';
          }

          if (k === 'dj vader' || k === 'dj-vader') return '/custom_logos/drawings/images_stripe/miscellania/black/dj-vader-b-stripe.webp';
          if (k === 'deathstar2d2' || k === 'death star2d2' || k === 'death-star2d2') return '/custom_logos/drawings/images_stripe/miscellania/black/death-star2d2-b-stripe.webp';
          if (k === 'pont del diable' || k === 'pont-del-diable') return '/custom_logos/drawings/images_stripe/miscellania/black/pont-del-diable-b-stripe.webp';
          return null;
        })();
        if (import.meta.env.DEV && !out) {
          // eslint-disable-next-line no-console
          console.error('[MISCELLANIA stripe overlay] unresolved label', { key, normalized: k });
        }
        return out;
      }

      // Path-based collections (e.g. miscellania black/xxx.webp) can be resolved directly.
      if (isPathItem(key)) {
        const variant = firstContactVariant;
        if (
          active === 'austen'
          && typeof key === 'string'
          && key.startsWith('/custom_logos/drawings/images_grid/austen/quotes/')
        ) {
          const file = (key.split('/').pop() || '').replace(/\?.*$/, '');
          const slug = file
            .toLowerCase()
            .replace(/-(b|w)-stripe(?=\.webp$)/i, '')
            .replace(/-b-grid(?=\.webp$)/i, '')
            .replace(/-grid(?=\.webp$)/i, '')
            .replace(/\.webp$/i, '');
          const whiteStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          const multiStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          const resolved = variant === 'color'
            ? `/custom_logos/drawings/images_stripe/austen/quotes/color/${multiStem}-multi-light-stripe.webp`
            : variant === 'white'
              ? `/custom_logos/drawings/images_stripe/austen/quotes/white/${whiteStem}-w-stripe.webp`
              : `/custom_logos/drawings/images_stripe/austen/quotes/black/${whiteStem}-b-stripe.webp`;
          if (resolved) return resolved;

          // Fallback for the common `...-b-grid.webp` filenames.
          // Convert GRID quotes to the canonical STRIPE+BLACK folder.
          const [base, q] = key.split('?');
          const outBase = base
            .replace('/custom_logos/drawings/images_grid/austen/quotes/', '/custom_logos/drawings/images_stripe/austen/quotes/black/')
            .replace(/-grid(?=\.(webp|png|jpe?g)$)/i, '');
          const fallbackResolved = (() => {
            const m = outBase.match(/^(.*)\.(webp|png|jpe?g)$/i);
            if (!m) return outBase;
            const prefix = m[1].replace(/-(grid|stripe)$/i, '');
            const ext = m[2];
            return prefix.toLowerCase().endsWith('-stripe') ? `${prefix}.${ext}` : `${prefix}-stripe.${ext}`;
          })();
          return q ? `${fallbackResolved}?${q}` : fallbackResolved;
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/crosswords/')) {
          const file = (key.split('/').pop() || '').replace(/\?.*$/, '');
          const lower = file.toLowerCase();
          const m = lower.replace(/-grid(?=\.webp$)/i, '').match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d)\.webp$/);
          if (m) {
            const book = m[1];
            const n = m[2];
            // Crosswords has NO color variant. Treat `color` as `white`.
            if (variant === 'black') return `/custom_logos/drawings/images_stripe/austen/crosswords/black/${book}-${n}-b-stripe.webp`;
            return `/custom_logos/drawings/images_stripe/austen/crosswords/white/${book}-${n}-w-stripe.webp`;
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/pemberley_house/')) {
          if (variant === 'color') return '/custom_logos/drawings/images_stripe/austen/pemberley_house/color/pemberley-house-multi-light-stripe.webp';
          if (variant === 'white') return '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp';
          return '/custom_logos/drawings/images_stripe/austen/pemberley_house/black/pemberley-house-b-stripe.webp';
        }
        if (active === 'cube' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/cube/')) {
          const file = key.split('/').pop() || '';
          const fileNormalized = file.replace(/-grid\.(webp|png|jpe?g)$/i, '.$1');
          const map = {
            'iron-kong.webp': 'iron-cube-08-iron-kong.webp',
            'iron-cube.webp': 'iron-cube-68.webp',
            'robocube.webp': 'robocube.webp',
            'cylon-cube.webp': 'cylon-cube-03.webp',
            'maschinencube.webp': 'maschinencube.webp',
            'mazinger-c.webp': 'mazinger-c.webp',
            'afrodita-c.webp': 'afrodita-c.webp',
            '3cube-p0.webp': 'cube-3-p0.webp',
            'cybercube.webp': 'cyber-cube.webp',
            'darth-cube.webp': 'darth-cube.webp',
          };
          const drawingFile = map[fileNormalized] || map[file];
          if (drawingFile) return `/custom_logos/drawings/images_stripe/cube/${drawingFile.replace(/\.(webp|png|jpe?g)$/i, '-stripe.$1')}`;
        }
        if (active === 'miscellania' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/miscellania/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          if (firstContactVariant === 'color') {
            if (lower.includes('dj-vader')) return '/custom_logos/drawings/images_stripe/miscellania/color/dj-vader-multi-light-stripe.webp';
            if (lower.includes('death-star2d2')) return '/custom_logos/drawings/images_stripe/miscellania/color/death-star2d2-multi-light-stripe.webp';
            if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
              return '/custom_logos/drawings/images_stripe/miscellania/color/pont-del-diable-multi-light-stripe.webp';
            }
          }
          if (firstContactVariant === 'white') {
            if (lower.includes('dj-vader')) return '/custom_logos/drawings/images_stripe/miscellania/white/dj-vader-w-stripe.webp';
            if (lower.includes('death-star2d2')) return '/custom_logos/drawings/images_stripe/miscellania/white/death-star2d2-w-stripe.webp';
            if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
              return '/custom_logos/drawings/images_stripe/miscellania/white/pont-del-diable-w-stripe.webp';
            }
          }
          if (lower.includes('dj-vader')) return '/custom_logos/drawings/images_stripe/miscellania/black/dj-vader-b-stripe.webp';
          if (lower.includes('death-star2d2')) return '/custom_logos/drawings/images_stripe/miscellania/black/death-star2d2-b-stripe.webp';
          if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
            return '/custom_logos/drawings/images_stripe/miscellania/black/pont-del-diable-b-stripe.webp';
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/keep_calm/')) {
          if (variant === 'color') {
            return '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-light-stripe.webp';
          }
          if (variant === 'white') {
            return '/custom_logos/drawings/images_stripe/austen/keep_calm/white/keep-calm-w-stripe.webp';
          }
          return '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          const base = lower.replace(/\.(webp|png|jpe?g)$/i, '').replace(/-grid$/i, '');
          if (base.endsWith('-frame') || lower.includes('-frame')) {
            const c = base.replace(/-frame$/i, '');
            return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/${c}-frame-stripe.webp`;
          }
          if (base.endsWith('-solid') || lower.includes('-solid')) {
            const c = base.replace(/-solid$/i, '');
            return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/solid/${c}-solid-stripe.webp`;
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_stripe/austen/crosswords/')) {
          const file = (key.split('/').pop() || '').replace(/\?.*$/, '');
          const m = file.match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d+)-stripe\.(webp|png)$/i);
          if (m) {
            const folder = m[1].replace(/-/g, '_');
            return `/custom_logos/drawings/images_stripe/austen/crosswords/${folder}/${m[1]}-${m[2]}.${m[3]}`;
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_originals/grid/austen/crosswords/')) {
          const file = (key.split('/').pop() || '').replace(/\?.*$/, '');
          const m = file.match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d+)-grid\.(webp|png)$/i);
          if (m) {
            return `/custom_logos/drawings/images_grid/austen/crosswords/${m[1]}-${m[2]}.${m[3]}`;
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/crosswords/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          const persuasion = lower.match(/^persuasion-(\d)(?:-grid)?\.webp$/);
          if (persuasion) {
            const n = persuasion[1];
            if (variant === 'black') {
              return `/custom_logos/drawings/images_stripe/austen/crosswords/black/persuasion-${n}-b-stripe.webp`;
            }
            return `/custom_logos/drawings/images_stripe/austen/crosswords/white/persuasion-${n}-w-stripe.webp`;
          }
          const pride = lower.match(/^pride-and-prejudice-(\d)(?:-grid)?\.webp$/);
          if (pride) {
            const n = pride[1];
            if (variant === 'black') {
              return `/custom_logos/drawings/images_stripe/austen/crosswords/black/pride-and-prejudice-${n}-b-stripe.webp`;
            }
            return `/custom_logos/drawings/images_stripe/austen/crosswords/white/pride-and-prejudice-${n}-w-stripe.webp`;
          }
          const sense = lower.match(/^sense-and-sensibility-(\d)(?:-grid)?\.webp$/);
          if (sense) {
            const n = sense[1];
            if (variant === 'black') {
              return `/custom_logos/drawings/images_stripe/austen/crosswords/black/sense-and-sensibility-${n}-b-stripe.webp`;
            }
            return `/custom_logos/drawings/images_stripe/austen/crosswords/white/sense-and-sensibility-${n}-w-stripe.webp`;
          }
        }
        if (
          active === 'austen'
          && typeof key === 'string'
          && (
            key.startsWith('/custom_logos/drawings/images_grid/austen/quotes/')
            || key.startsWith('/custom_logos/drawings/images_stripe/austen/quotes/')
          )
        ) {
          return resolveAustenQuoteOriginalFromPath(key) || key;
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/pemberley_house/')) {
          if (variant === 'color') return '/custom_logos/drawings/images_stripe/austen/pemberley_house/color/pemberley-house-multi-light-stripe.webp';
          if (variant === 'white') return '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp';
          return '/custom_logos/drawings/images_stripe/austen/pemberley_house/black/pemberley-house-b-stripe.webp';
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/crosswords/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          const m = lower.replace(/-grid(?=\.webp$)/i, '').match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d)\.webp$/);
          if (m) {
            const book = m[1];
            const n = m[2];
            if (variant === 'black') {
              return `/custom_logos/drawings/images_stripe/austen/crosswords/black/${book}-${n}-b-stripe.webp`;
            }
            if (variant === 'black') return `/custom_logos/drawings/images_stripe/austen/crosswords/black/${book}-${n}-b-stripe.webp`;
            return `/custom_logos/drawings/images_stripe/austen/crosswords/white/${book}-${n}-w-stripe.webp`;
          }
        }
        if (
          typeof key === 'string'
          && (
            key.startsWith('/custom_logos/drawings/images_grid/austen/quotes/')
            || key.startsWith('/custom_logos/drawings/images_stripe/austen/quotes/')
          )
        ) {
          const file = (key.split('/').pop() || '').replace(/\?.*$/, '');
          const slug = file
            .toLowerCase()
            .replace(/-(b|w)-stripe(?=\.webp$)/i, '')
            .replace(/-b-grid(?=\.webp$)/i, '')
            .replace(/-grid(?=\.webp$)/i, '')
            .replace(/\.webp$/i, '');
          const whiteStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          const multiStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          if (variant === 'color') return `/custom_logos/drawings/images_stripe/austen/quotes/color/${multiStem}-multi-light-stripe.webp`;
          if (variant === 'white') return `/custom_logos/drawings/images_stripe/austen/quotes/white/${whiteStem}-w-stripe.webp`;
          return `/custom_logos/drawings/images_stripe/austen/quotes/black/${whiteStem}-b-stripe.webp`;
        }
        const k = typeof key === 'string' ? normalizeKeyLocal(key).toLowerCase() : '';
        const id = resolveAustenQuoteAssetId(k);
        if (id && AUSTEN_QUOTES_ASSETS[id]?.original) return AUSTEN_QUOTES_ASSETS[id].original;
        return AUSTEN_QUOTES_ASSETS.it_is_a_truth.original;
      }

      if (active === 'miscellania') {
        if (typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/miscellania/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          if (firstContactVariant === 'color') {
            if (lower.includes('dj-vader')) return '/custom_logos/drawings/images_stripe/miscellania/color/dj-vader-multi-light-stripe.webp';
            if (lower.includes('death-star2d2')) return '/custom_logos/drawings/images_stripe/miscellania/color/death-star2d2-multi-light-stripe.webp';
            if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
              return '/custom_logos/drawings/images_stripe/miscellania/color/pont-del-diable-multi-light-stripe.webp';
            }
          }
          if (firstContactVariant === 'white') {
            if (lower.includes('dj-vader')) return '/custom_logos/drawings/images_stripe/miscellania/white/dj-vader-w-stripe.webp';
            if (lower.includes('death-star2d2')) return '/custom_logos/drawings/images_stripe/miscellania/white/death-star2d2-w-stripe.webp';
            if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
              return '/custom_logos/drawings/images_stripe/miscellania/white/pont-del-diable-w-stripe.webp';
            }
          }
          const map = {
            'dj-vader.webp': 'dj-vader-b-stripe.webp',
            'death-star2d2.webp': 'death-star2d2-b-stripe.webp',
            'pont-del-diable.webp': 'pont-del-diable-b-stripe.webp',
          };
          const drawingFile = map[file];
          if (drawingFile) return `/custom_logos/drawings/images_stripe/miscellania/black/${drawingFile}`;
        }
        return null;
      }

      if (FIRST_CONTACT_MEDIA[key]) {
        return firstContactVariant === 'white'
          ? (FIRST_CONTACT_MEDIA_WHITE[key] || FIRST_CONTACT_MEDIA[key] || null)
          : (FIRST_CONTACT_MEDIA[key] || null);
      }
    }
    return null;
  }, [
    active,
    overlaySrcFromUrl,
    firstContactSelectedItem,
    firstContactVariant,
    humanInsideSelectedItem,
    humanInsideVariant,
    selectedItemByCollection,
    stripeOverlayOverrideActive,
    hoveredStripeItem,
    hoveredStripeItemCollection,
  ]);

  const resolvedOverlaySrcEncoded = useMemo(() => {
    try {
      if (!resolvedOverlaySrc || typeof resolvedOverlaySrc !== 'string') return '';
      const s = resolvedOverlaySrc.trim();
      if (!s) return '';
      return encodeURI(s);
    } catch {
      return resolvedOverlaySrc || '';
    }
  }, [resolvedOverlaySrc]);

  const [stripeOverlayLoadState, setStripeOverlayLoadState] = useState('idle');
  const [stripeOverlayIsStripeWide, setStripeOverlayIsStripeWide] = useState(false);
  const stripeOverlayDebug = (() => {
    try {
      const qs = (typeof window !== 'undefined') ? window.location?.search : '';
      const p = qs ? new URLSearchParams(qs) : null;
      const raw = p?.get?.('stripeOverlayDebug');
      if (raw == null && !p?.has?.('stripeOverlayDebug')) return false;
      const v = String(raw || '').trim().toLowerCase();
      if (v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes') return true;
      return false;
    } catch {
      return false;
    }
  })();

  const drawingOverlayDebug = (() => {
    try {
      if (!import.meta.env.DEV) return false;
      const qs = (typeof window !== 'undefined') ? window.location?.search : '';
      const p = qs ? new URLSearchParams(qs) : null;
      const raw = p?.get?.('drawingOverlayDebug');
      if (raw == null && !p?.has?.('drawingOverlayDebug')) return false;
      const v = String(raw || '').trim().toLowerCase();
      if (v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes') return true;
      return false;
    } catch {
      return false;
    }
  })();

  const guessStripeWideFromSrc = useCallback((src) => {
    try {
      const s = String(src || '').toLowerCase();
      if (!s) return false;
      if (s.includes('/images_stripe/')) return true;
      if (/-stripe\.(png|webp|jpg|jpeg)(\?|#|$)/i.test(s)) return true;
      return false;
    } catch {
      return false;
    }
  }, []);

  const stripeOverlayIsStripeWideDerived = useMemo(
    () => guessStripeWideFromSrc(resolvedOverlaySrcEncoded || resolvedOverlaySrc),
    [guessStripeWideFromSrc, resolvedOverlaySrcEncoded, resolvedOverlaySrc]
  );
  const [stripeMaskTileRectsRawPct, setStripeMaskTileRectsRawPct] = useState(null);
  const [stripeMaskDebugRectsPct, setStripeMaskDebugRectsPct] = useState(null);

  useEffect(() => {
    const wantMaskRects = stripeOverlayDebug || (megaShirtDrawingEnabledLocal && Boolean(drawingOverlaySrcEffective));
    if (!wantMaskRects) {
      setStripeMaskTileRectsRawPct(null);
      setStripeMaskDebugRectsPct(null);
      return;
    }

    let alive = true;

    const compute = async () => {
      let wrap;
      try {
        if (typeof document === 'undefined') return;
        const src = '/placeholders/t-shirt_buttons/v5/full-clic-area-5.svg';
        const viewW = 2866;
        const viewH = 307;
        const res = await fetch(src, { cache: 'force-cache' });
        const svgText = await res.text();
        if (!svgText) throw new Error('empty svg');

        wrap = document.createElement('div');
        wrap.style.position = 'fixed';
        wrap.style.left = '-99999px';
        wrap.style.top = '-99999px';
        wrap.style.width = `${viewW}px`;
        wrap.style.height = `${viewH}px`;
        wrap.style.opacity = '0';
        wrap.style.pointerEvents = 'none';
        wrap.style.overflow = 'hidden';
        wrap.innerHTML = svgText;

        const svg = wrap.querySelector('svg');
        if (!svg) throw new Error('no svg');
        svg.setAttribute('width', `${viewW}`);
        svg.setAttribute('height', `${viewH}`);
        svg.setAttribute('preserveAspectRatio', 'none');

        document.body.appendChild(wrap);

        const paths = Array.from(svg.querySelectorAll('path'));
        const best = paths
          .map((p) => ({ p, len: (p.getAttribute('d') || '').length }))
          .sort((a, b) => b.len - a.len)[0]?.p;

        if (!best) throw new Error('no path');
        const d = best.getAttribute('d') || '';
        const parent = best.parentNode;
        if (!parent) throw new Error('no parent');

        const parts = d.split(/(?=M)/g).map((s) => s.trim()).filter(Boolean);
        if (!parts.length) throw new Error('no parts');

        parent.removeChild(best);

        const nodes = parts.map((seg) => {
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          p.setAttribute('d', seg);
          p.setAttribute('fill', '#000');
          p.setAttribute('stroke', 'none');
          parent.appendChild(p);
          return p;
        });

        const svgRect = svg.getBoundingClientRect();
        if (!svgRect || !(svgRect.width > 0) || !(svgRect.height > 0)) throw new Error('bad svg rect');

        const bbs = nodes
          .map((p) => {
            try {
              const r = p.getBoundingClientRect();
              const leftPx = r.left - svgRect.left;
              const topPx = r.top - svgRect.top;
              const widthPx = r.width;
              const heightPx = r.height;
              if (!(widthPx > 0) || !(heightPx > 0)) return null;
              const area = widthPx * heightPx;
              return { leftPx, topPx, widthPx, heightPx, area };
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .filter((it) => it.widthPx > 3 && it.heightPx > 3);

        const top14 = bbs
          .sort((a, b) => (b.area - a.area))
          .slice(0, 14)
          .sort((a, b) => (a.leftPx - b.leftPx));

        const sortedRaw = top14.map((it) => {
          const left = (it.leftPx / svgRect.width) * 100;
          const top = (it.topPx / svgRect.height) * 100;
          const width = (it.widthPx / svgRect.width) * 100;
          const height = (it.heightPx / svgRect.height) * 100;
          return { left, top, width, height };
        });

        const ref = sortedRaw[0];
        const sorted = (ref && Number.isFinite(ref.width) && ref.width > 0)
          ? sortedRaw.map((r, idx) => {
            if (idx === 0) return r;
            const right = (r.left || 0) + (r.width || 0);
            const desiredWidth = ref.width;
            let nextLeft = right - desiredWidth;
            let nextWidth = desiredWidth;
            if (nextLeft < 0) {
              nextLeft = 0;
              nextWidth = Math.max(0, right);
            }
            return {
              ...r,
              left: nextLeft,
              width: nextWidth,
            };
          })
          : sortedRaw;

        if (!alive) return;
        if (sortedRaw.length === 14) {
          setStripeMaskTileRectsRawPct(sorted);
          setStripeMaskDebugRectsPct(stripeOverlayDebug ? sorted : null);
        } else {
          setStripeMaskTileRectsRawPct(null);
          setStripeMaskDebugRectsPct(null);
        }
      } catch {
        if (!alive) return;
        setStripeMaskTileRectsRawPct(null);
        setStripeMaskDebugRectsPct(null);
      } finally {
        if (wrap) {
          try {
            wrap.parentNode?.removeChild(wrap);
          } catch {
            // ignore
          }
        }
      }
    };

    compute();
    return () => {
      alive = false;
    };
  }, [stripeOverlayDebug, megaShirtDrawingEnabledLocal, drawingOverlaySrcEffective]);

  useEffect(() => {
    if (!resolvedOverlaySrc) {
      setStripeOverlayLoadState('no-src');
      setStripeOverlayIsStripeWide(false);
      return;
    }

    let alive = true;
    setStripeOverlayLoadState('loading');
    setStripeOverlayIsStripeWide(guessStripeWideFromSrc(resolvedOverlaySrcEncoded || resolvedOverlaySrc));
    try {
      const img = new Image();
      img.onload = () => {
        if (!alive) return;
        setStripeOverlayLoadState('ok');
        try {
          const w = Number(img.naturalWidth) || 0;
          const h = Number(img.naturalHeight) || 0;
          const ratio = h > 0 ? (w / h) : 0;
          if (ratio > 0) {
            setStripeOverlayIsStripeWide((ratio > 3) || guessStripeWideFromSrc(resolvedOverlaySrcEncoded || resolvedOverlaySrc));
          } else {
            setStripeOverlayIsStripeWide(guessStripeWideFromSrc(resolvedOverlaySrcEncoded || resolvedOverlaySrc));
          }
        } catch {
          setStripeOverlayIsStripeWide(false);
        }
      };
      img.onerror = () => { if (alive) setStripeOverlayLoadState('error'); };
      img.src = resolvedOverlaySrcEncoded || resolvedOverlaySrc;
    } catch {
      setStripeOverlayLoadState('error');
    }
    return () => { alive = false; };
  }, [resolvedOverlaySrc, resolvedOverlaySrcEncoded, guessStripeWideFromSrc]);

  const preloadedSrcRef = useRef(new Set());
  const preloadSrc = (src) => {
    try {
      if (!src || typeof src !== 'string') return;
      const normalized = src.trim();
      if (!normalized) return;
      if (preloadedSrcRef.current.has(normalized)) return;
      preloadedSrcRef.current.add(normalized);
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = encodeURI(normalized);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!resolvedOverlaySrc) return;

    preloadSrc(resolvedOverlaySrc);

    const s = resolvedOverlaySrc.toLowerCase();
    const isMulti = s.includes('/color/') || s.includes('-multi-');
    if (!isMulti) return;

    // For multi overlays we sometimes swap light/dark per tile. Preload the sibling
    // to avoid visible pop-in when the variant is 'color'.
    if (s.includes('-multi-light-')) preloadSrc(resolvedOverlaySrc.replace(/-multi-light-/i, '-multi-dark-'));
    if (s.includes('-multi-dark-')) preloadSrc(resolvedOverlaySrc.replace(/-multi-dark-/i, '-multi-light-'));
  }, [resolvedOverlaySrc]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    try {
      if (typeof window === 'undefined') return;
      const prev = window.__HG_OVERLAY_DEBUG__ || {};
      const stripeWideEffective = Boolean(stripeOverlayIsStripeWideDerived || stripeOverlayIsStripeWide);
      window.__HG_OVERLAY_DEBUG__ = {
        ...prev,
        stripeOverlayDebug,
        showStripe: Boolean(showStripe),
        active: String(active || ''),
        resolvedOverlaySrc,
        stripeOverlayLoadState,
        stripeOverlayIsStripeWide: stripeWideEffective,
        stripeOverlayIsStripeWideDerived: Boolean(stripeOverlayIsStripeWideDerived),
        stripeOverlayIsStripeWideMeasured: Boolean(stripeOverlayIsStripeWide),
        stripeOverlayOverrideActive,
        overlaySrcFromUrl,
      };
    } catch {
      // ignore
    }
  }, [stripeOverlayDebug, showStripe, active, resolvedOverlaySrc, stripeOverlayLoadState, stripeOverlayIsStripeWide, stripeOverlayIsStripeWideDerived, stripeOverlayOverrideActive, overlaySrcFromUrl]);

  useEffect(() => {
    if (!resolvedOverlaySrc) return;
    try {
      const s = String(resolvedOverlaySrc || '').trim();
      const sLower = s.toLowerCase();
      const isStripeSrc = sLower.includes('/custom_logos/drawings/images_stripe/') || sLower.includes('/custom_logos/drawings/images_originals/stripe/');
      if (!isStripeSrc) return;
      window.localStorage.setItem('HG_DRAWING_OVERLAY_SRC', resolvedOverlaySrc);
      window.localStorage.setItem('HG_DRAWING_OVERLAY_COLLECTION', String(active || ''));
      window.dispatchEvent(new Event('hg-drawing-overlay-changed'));
      if (!stripeOverlayOverrideActive) {
        window.localStorage.setItem(overlayStorageKey, resolvedOverlaySrc);
      }
    } catch {
      // ignore
    }
  }, [overlayStorageKey, resolvedOverlaySrc, stripeOverlayOverrideActive]);
  const [megaTileSize, setMegaTileSize] = useState(null);
  const effectiveMegaTileSize = megaTileSize || 120;
  // Stub local per al menú mobile: la implementació real viu a `MegaColumn`
  // amb closures sobre el seu estat. Aquí sempre retornem null perquè els
  // callers facin servir el fallback `|| FIRST_CONTACT_MEDIA[it]`, que era
  // el comportament efectiu abans de modularitzar.
  const resolveGridThumbSrc = () => null;
  const [rootRemPx, setRootRemPx] = useState(16);
  const [megaTileSelectorParams, setMegaTileSelectorParams] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return {
          keyset: 'v1',
          enabled: true,
          target: 'NCC-1701-D',
          sizePx: 200,
          strokePx: 10,
          color: 'black',
          stepX: 0,
          stepY: 0,
          radiusPx: 8,
          extendTopPx: 30,
          extendRightPx: 0,
          extendBottomPx: 0,
          extendLeftPx: 0,
        };
      }

      const hasV2 = (() => {
        try {
          const a = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_ENABLED');
          const b = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_TARGET');
          const c = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_SIZE_PX');
          const d = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STROKE_PX');
          const e = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_COLOR');
          const f = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_X');
          const g = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_Y');
          return a != null || b != null || c != null || d != null || e != null || f != null || g != null;
        } catch {
          return false;
        }
      })();

      const readBool = (k, fallback) => {
        const raw = window.localStorage.getItem(k);
        if (raw == null) return fallback;
        const v = String(raw).trim().toLowerCase();
        if (v === '') return true;
        return v === '1' || v === 'true' || v === 'on' || v === 'yes';
      };

      const v1Enabled = readBool('MEGA_TILE_SELECTOR_ENABLED', true);
      const v2Enabled = readBool('MEGA_TILE_SELECTOR_V2_ENABLED', hasV2 ? false : true);
      const activeKeyset = v2Enabled ? 'v2' : (v1Enabled ? 'v1' : 'v2');
      const K = (suffix) => (activeKeyset === 'v2' ? `MEGA_TILE_SELECTOR_V2_${suffix}` : `MEGA_TILE_SELECTOR_${suffix}`);

      const readNum = (k, fallback) => {
        const raw = window.localStorage.getItem(k);
        const n = raw == null ? NaN : Number.parseFloat(String(raw));
        return Number.isFinite(n) ? n : fallback;
      };
      return {
        keyset: activeKeyset,
        enabled: readBool(K('ENABLED'), activeKeyset === 'v2' ? false : true),
        target: String(window.localStorage.getItem(K('TARGET')) || 'NCC-1701-D'),
        sizePx: Math.min(800, Math.max(20, readNum(K('SIZE_PX'), 200))),
        strokePx: Math.min(80, Math.max(0, readNum(K('STROKE_PX'), 10))),
        color: String(window.localStorage.getItem(K('COLOR')) || 'black'),
        stepX: Math.min(99, Math.max(-99, readNum(K('STEP_X'), 0))),
        stepY: Math.min(99, Math.max(-99, readNum(K('STEP_Y'), 0))),
        radiusPx: Math.min(200, Math.max(0, readNum(K('RADIUS_PX'), 8))),
        extendTopPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_TOP_PX'), 30))),
        extendRightPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_RIGHT_PX'), 0))),
        extendBottomPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_BOTTOM_PX'), 0))),
        extendLeftPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_LEFT_PX'), 0))),
      };
    } catch {
      return {
        keyset: 'v1',
        enabled: true,
        target: 'NCC-1701-D',
        sizePx: 200,
        strokePx: 10,
        color: 'black',
        stepX: 0,
        stepY: 0,
        radiusPx: 8,
        extendTopPx: 30,
        extendRightPx: 0,
        extendBottomPx: 0,
        extendLeftPx: 0,
      };
    }
  });
  const headerRef = useRef(null);
  const megaMenuRef = useRef(null);
  const [stripeRowPadPx, setStripeRowPadPx] = useState(32);
  const [stripeRowPadXPx, setStripeRowPadXPx] = useState({ left: 0, right: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const read = () => {
      try {
        const activeNow = String(activeRef.current || '');
        const hasV2 = (() => {
          try {
            const a = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_ENABLED');
            const b = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_TARGET');
            const c = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_SIZE_PX');
            const d = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STROKE_PX');
            const e = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_COLOR');
            const f = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_X');
            const g = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_Y');
            return a != null || b != null || c != null || d != null || e != null || f != null || g != null;
          } catch {
            return false;
          }
        })();

        const readBool = (k, fallback) => {
          const raw = window.localStorage.getItem(k);
          if (raw == null) return fallback;
          const v = String(raw).trim().toLowerCase();
          if (v === '') return true;
          return v === '1' || v === 'true' || v === 'on' || v === 'yes';
        };

        const v1Enabled = readBool('MEGA_TILE_SELECTOR_ENABLED', true);
        const v2Enabled = readBool('MEGA_TILE_SELECTOR_V2_ENABLED', hasV2 ? false : true);
        const activeKeyset = v2Enabled ? 'v2' : (v1Enabled ? 'v1' : 'v2');
        const K = (suffix) => (activeKeyset === 'v2' ? `MEGA_TILE_SELECTOR_V2_${suffix}` : `MEGA_TILE_SELECTOR_${suffix}`);

        const readNum = (k, fallback) => {
          const raw = window.localStorage.getItem(k);
          const n = raw == null ? NaN : Number.parseFloat(String(raw));
          return Number.isFinite(n) ? n : fallback;
        };
        setMegaTileSelectorParams({
          keyset: activeKeyset,
          enabled: readBool(K('ENABLED'), activeKeyset === 'v2' ? false : true),
          target: (() => {
            const publicState = getMegaPublicSelectorFor(activeNow, activeKeyset);
            const t = typeof publicState?.target === 'string' ? publicState.target.trim() : '';
            return t ? t : String(window.localStorage.getItem(K('TARGET')) || 'NCC-1701-D');
          })(),
          sizePx: Math.min(800, Math.max(20, readNum(K('SIZE_PX'), 200))),
          strokePx: Math.min(80, Math.max(0, readNum(K('STROKE_PX'), 10))),
          color: String(window.localStorage.getItem(K('COLOR')) || 'black'),
          stepX: (() => {
            const publicState = getMegaPublicSelectorFor(activeNow, activeKeyset);
            const v = Number(publicState?.stepX);
            if (Number.isFinite(v)) return Math.min(99, Math.max(-99, v));
            return Math.min(99, Math.max(-99, readNum(K('STEP_X'), 0)));
          })(),
          stepY: (() => {
            const publicState = getMegaPublicSelectorFor(activeNow, activeKeyset);
            const v = Number(publicState?.stepY);
            if (Number.isFinite(v)) return Math.min(99, Math.max(-99, v));
            return Math.min(99, Math.max(-99, readNum(K('STEP_Y'), 0)));
          })(),
          radiusPx: Math.min(200, Math.max(0, readNum(K('RADIUS_PX'), 8))),
          extendTopPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_TOP_PX'), 30))),
          extendRightPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_RIGHT_PX'), 0))),
          extendBottomPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_BOTTOM_PX'), 0))),
          extendLeftPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_LEFT_PX'), 0))),
        });
      } catch {
        // ignore
      }
    };

    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (
        e.key === 'MEGA_TILE_SELECTOR_ENABLED'
        || e.key === 'MEGA_TILE_SELECTOR_TARGET'
        || e.key === 'MEGA_TILE_SELECTOR_SIZE_PX'
        || e.key === 'MEGA_TILE_SELECTOR_STROKE_PX'
        || e.key === 'MEGA_TILE_SELECTOR_COLOR'
        || e.key === 'MEGA_TILE_SELECTOR_STEP_X'
        || e.key === 'MEGA_TILE_SELECTOR_STEP_Y'
        || e.key === 'MEGA_TILE_SELECTOR_RADIUS_PX'
        || e.key === 'MEGA_TILE_SELECTOR_EXTEND_TOP_PX'
        || e.key === 'MEGA_TILE_SELECTOR_EXTEND_RIGHT_PX'
        || e.key === 'MEGA_TILE_SELECTOR_EXTEND_BOTTOM_PX'
        || e.key === 'MEGA_TILE_SELECTOR_EXTEND_LEFT_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_ENABLED'
        || e.key === 'MEGA_TILE_SELECTOR_V2_TARGET'
        || e.key === 'MEGA_TILE_SELECTOR_V2_SIZE_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_STROKE_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_COLOR'
        || e.key === 'MEGA_TILE_SELECTOR_V2_STEP_X'
        || e.key === 'MEGA_TILE_SELECTOR_V2_STEP_Y'
        || e.key === 'MEGA_TILE_SELECTOR_V2_RADIUS_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_EXTEND_TOP_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_EXTEND_RIGHT_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_EXTEND_BOTTOM_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_EXTEND_LEFT_PX'
      ) {
        read();
      }
    };

    read();
    window.addEventListener('storage', onStorage);
    window.addEventListener('mega-tile-selector-changed', read);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('mega-tile-selector-changed', read);
    };
  }, []);

  const stripePreviewHPx = Math.round((effectiveMegaTileSize || 240) * 0.9);

  useLayoutEffect(() => {
    try {
      if (!active) return undefined;
      const el = megaMenuRef.current;
      if (!el || typeof window === 'undefined') return undefined;

      const update = () => {
        try {
          const cs = window.getComputedStyle(el);
          const pt = Number.parseFloat(cs?.paddingTop || '0');
          const pl = Number.parseFloat(cs?.paddingLeft || '0');
          const pr = Number.parseFloat(cs?.paddingRight || '0');
          if (Number.isFinite(pt) && pt >= 0) {
            setStripeRowPadPx((prev) => (prev === pt ? prev : pt));
          }
          if (Number.isFinite(pl) && pl >= 0 && Number.isFinite(pr) && pr >= 0) {
            setStripeRowPadXPx((prev) => {
              if (!prev) return { left: pl, right: pr };
              if (prev.left === pl && prev.right === pr) return prev;
              return { left: pl, right: pr };
            });
          }
        } catch {
          // ignore
        }
      };

      update();
      window.requestAnimationFrame(() => update());
      window.addEventListener('resize', update);
      return () => {
        window.removeEventListener('resize', update);
      };
    } catch {
      return undefined;
    }
  }, [active]);

  useLayoutEffect(() => {
    if (!active) return undefined;
    const el = megaMenuRef.current;
    if (!el) return undefined;

    const GAP_PX = 12; // gap-x-3
    const COLS = 9;

    let rafId = null;
    let retryCount = 0;
    const MAX_RETRIES = 24;
    let ro = null;

    const recompute = () => {
      const w = el.clientWidth;
      if (!w) {
        if (retryCount < MAX_RETRIES) {
          retryCount += 1;
          if (rafId != null) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(recompute);
        }
        return;
      }
      const cs = window.getComputedStyle(el);
      const pl = parseFloat(cs.paddingLeft || '0') || 0;
      const pr = parseFloat(cs.paddingRight || '0') || 0;
      const contentW = w - pl - pr;
      if (!contentW) return;
      const totalGaps = (COLS - 1) * GAP_PX;
      const colW = (contentW - totalGaps) / COLS;
      if (!Number.isFinite(colW) || colW <= 0) return;
      // Cap màxim per evitar sobreescalat a viewport amples / zoom alts
      // (1400px max-content design ⇒ tile ≈ 136px). Cap a 144px.
      const MAX_TILE_PX = 144;
      setMegaTileSize(Math.min(colW, MAX_TILE_PX));
    };

    recompute();
    rafId = requestAnimationFrame(recompute);
    window.addEventListener('resize', recompute);

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => recompute());
      try {
        ro.observe(el);
      } catch {
        ro = null;
      }
    }

    return () => {
      window.removeEventListener('resize', recompute);
      if (rafId != null) cancelAnimationFrame(rafId);
      try {
        ro?.disconnect?.();
      } catch {
        // ignore
      }
    };
  }, [active]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    try {
      if (typeof window === 'undefined') return;
      const prev = window.__HG_OVERLAY_DEBUG__ || {};
      window.__HG_OVERLAY_DEBUG__ = {
        ...prev,
        fullWideSlide: {
          ...(prev.fullWideSlide || {}),
          active,
          megaPage,
          megaTileSize,
        },
      };
    } catch {
      // ignore
    }
  }, [active, megaPage, megaTileSize]);
  const mobileHumanScrollRef = useRef(null);
  const logoMarkRef = useRef(null);
  const accountButtonRef = useRef(null);
  const searchHeaderRowRef = useRef(null);
  const searchGridRowRef = useRef(null);
  const searchGridScrollRef = useRef(null);
  const [megaInsetsPx, setMegaInsetsPx] = useState({ left: 0, right: 0 });
  const [bleedGuardExpandPx, setBleedGuardExpandPx] = useState({ left: 0, right: 0 });
  const [accordionPautaScale, setAccordionPautaScale] = useState(1);

  const ensureMegaOpen = () => {
    setManualOverrideClosed(false);
    setActive((prev) => prev || 'first_contact');
  };

  const closeMegaExplicitly = () => {
    setManualOverrideClosed(true);
    setMegaPage(1);
    setActive(null);
    setMegaFullScreen(false);
  };

  useEffect(() => {
    const openFullWideCart = () => {
      setMegaPage(3);
      setAcordioExpanded(true);
      setMegaFullScreen(false);
      ensureMegaOpen();
      touchMegaPublicActivity();
    };

    window.addEventListener('hg:open-full-wide-cart', openFullWideCart);
    return () => window.removeEventListener('hg:open-full-wide-cart', openFullWideCart);
  }, [setMegaPage, setAcordioExpanded]);


  const scrollSearchGridBy = (deltaPx) => {
    const el = searchGridScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: deltaPx, behavior: 'smooth' });
  };

  useLayoutEffect(() => {
    if (!active) return undefined;

    const containerEl = searchGridScrollRef.current;
    const rowEl = searchGridRowRef.current;
    if (!containerEl || !rowEl) return undefined;

    const measure = () => {
      const containerHeight = containerEl.clientHeight;
      const rowHeight = rowEl.offsetHeight;
      if (!containerHeight || !rowHeight) return;

      const nextScale = Math.max(0.5, Math.min(2.5, containerHeight / rowHeight));
      setSearchGridScale((prev) => (Math.abs(prev - nextScale) < 0.01 ? prev : nextScale));
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [active, megaPage, searchResults.length]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const measure = () => {
      // Font segura cross-browser (Chromium, WebKit, Firefox).
      // getSafeBelt valida belt2 i cau a un belt centrat si està contaminat.
      const belt = getSafeBelt({ maxContent: 1350, sideMargin: 16, minContent: 320 });
      const beltWidth = Math.max(0, belt.width);

      // Exposem el belt segur com a CSS vars perquè els panells del mega-slide
      // s'alineïn amb belt2 quan és vàlid, i caiguin a fallback si està contaminat.
      try {
        const root = document.documentElement;
        root.style.setProperty('--hg-mega-w', `${beltWidth}px`);
        root.style.setProperty('--hg-mega-x', `${belt.left}px`);
      } catch {
        // ignore
      }

      const nextScale = clampNumber(beltWidth / 1350, 0.5, 1, 1);
      setAccordionPautaScale((prev) => (Math.abs(prev - nextScale) < 0.005 ? prev : nextScale));
    };

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, []);

  const isManualLockEnabled = () => {
    if (typeof manualEnabledOverride === 'boolean') return manualEnabledOverride;
    if (demoManualEnabled) return true;
    try {
      return window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1';
    } catch {
      return false;
    }
  };

  useLayoutEffect(() => {
    if (!active) return undefined;

    const logoEl = logoMarkRef.current;
    const accountEl = accountButtonRef.current;
    const megaEl = megaMenuRef.current;
    if (!logoEl || !accountEl || !megaEl) return undefined;

    const measure = () => {
      const megaRect = megaEl.getBoundingClientRect();
      const logoRect = logoEl.getBoundingClientRect();
      const accountRect = accountEl.getBoundingClientRect();

      const left = Math.max(0, Math.round(logoRect.right - megaRect.left));
      const right = Math.max(0, Math.round(megaRect.right - accountRect.left));

      setMegaInsetsPx((prev) => {
        if (prev.left === left && prev.right === right) return prev;
        return { left, right };
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(logoEl);
    ro.observe(accountEl);
    ro.observe(megaEl);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, [active]);

  useEffect(() => {
    if (!active || megaPage !== 2) return undefined;
    const id = window.setInterval(() => {
      setSearchCaretVisible((v) => !v);
    }, 520);
    return () => window.clearInterval(id);
  }, [active, megaPage]);

  const selectedColorHex = useMemo(
    () => ({
      white: '#ffffff',
      'light-blue': '#1f6feb',
      royal: '#2d6cff',
      purple: '#6b21a8',
      navy: '#1f2a44',
      daisy: '#facc15',
      gold: '#caa24d',
      'light-pink': '#f9a8d4',
      red: '#d11a2a',
      kiwi: '#84cc16',
      'irish-green': '#1f6f3a',
      'military-green': '#556b2f',
      'forest-green': '#0b3d2e',
      black: '#111111',
    }),
    []
  );

  const getSlugLuminance = useMemo(() => {
    const hexToRgb = (hex) => {
      if (!hex || typeof hex !== 'string') return null;
      const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
      if (!m) return null;
      const v = m[1];
      const r = Number.parseInt(v.slice(0, 2), 16);
      const g = Number.parseInt(v.slice(2, 4), 16);
      const b = Number.parseInt(v.slice(4, 6), 16);
      return { r, g, b };
    };

    const srgbToLinear = (c) => {
      const x = c / 255;
      return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    };

    return (slug) => {
      const hex = selectedColorHex?.[slug];
      const rgb = hexToRgb(hex);
      if (!rgb) return null;
      const r = srgbToLinear(rgb.r);
      const g = srgbToLinear(rgb.g);
      const b = srgbToLinear(rgb.b);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
  }, [selectedColorHex]);

  const colorLabelBySlug = useMemo(() => {
    const colors = Array.isArray(gildan5000Catalog?.colors) ? gildan5000Catalog.colors : [];
    const out = {};
    for (const c of colors) {
      if (!c?.slug) continue;
      out[c.slug] = c.label || c.slug;
    }
    return out;
  }, [gildan5000Catalog]);

  const selectedColorOrder = useMemo(
    () => [
      'white',
      'light-blue',
      'royal',
      'purple',
      'navy',
      'daisy',
      'gold',
      'light-pink',
      'red',
      'kiwi',
      'irish-green',
      'military-green',
      'forest-green',
      'black',
    ],
    []
  );

  const resolveStripeOverlaySrcForTile = useCallback(
    (src, idx) => {
      try {
        if (!src || typeof src !== 'string') return src;
        const lower = src.toLowerCase();
        const safeIdx = Number.isFinite(Number(idx)) ? Number(idx) : 0;
        const maxIdx = Array.isArray(selectedColorOrder) && selectedColorOrder.length > 0
          ? Math.max(0, selectedColorOrder.length - 1)
          : 13;
        const isFirst = safeIdx === 0;
        const isLast = safeIdx === maxIdx;

        const hasMultiLight = lower.includes('-multi-light-');
        const hasMultiDark = lower.includes('-multi-dark-');
        if (hasMultiLight || hasMultiDark) {
          if (isFirst) return hasMultiDark ? src : src.replace(/-multi-light-/i, '-multi-dark-');
          return hasMultiLight ? src : src.replace(/-multi-dark-/i, '-multi-light-');
        }

        const hasWhiteInk = /-w(?=[-.])/i.test(src) || lower.includes('/white/');
        const hasBlackInk = /-b(?=[-.])/i.test(src) || lower.includes('/black/');
        if (!hasWhiteInk && !hasBlackInk) return src;

        const toBlack = (s) => {
          let out = s;
          out = out.replace(/\/white\//i, '/black/');
          out = out.replace(/-w(?=[-.])/i, '-b');
          return out;
        };
        const toWhite = (s) => {
          let out = s;
          out = out.replace(/\/black\//i, '/white/');
          out = out.replace(/-b(?=[-.])/i, '-w');
          return out;
        };

        if (hasWhiteInk) {
          return isFirst ? toBlack(src) : src;
        }
        return isLast ? toWhite(src) : src;
      } catch {
        return src;
      }
    },
    [selectedColorOrder]
  );

  const colorButtonSrcBySlug = useMemo(
    () => ({
      white: '/placeholders/t-shirt_buttons/1.png',
      'light-pink': '/placeholders/t-shirt_buttons/selector-color-light-pink.png',
      'light-blue': '/placeholders/t-shirt_buttons/selector-color-light-blue.png',
      daisy: '/placeholders/t-shirt_buttons/selector-color-daisy.png',
      gold: '/placeholders/t-shirt_buttons/selector-color-gold.png',
      red: '/placeholders/t-shirt_buttons/selector-color-red.png',
      purple: '/placeholders/t-shirt_buttons/selector-color-purple.png',
      royal: '/placeholders/t-shirt_buttons/selector-color-blue-royal.png',
      navy: '/placeholders/t-shirt_buttons/selector-color-blue-navy.png',
      'military-green': '/placeholders/t-shirt_buttons/selector-color-military-green.png',
      'forest-green': '/placeholders/t-shirt_buttons/selector-color-forest-green.png',
      'irish-green': '/placeholders/t-shirt_buttons/selector-color-irish-green.png',
      kiwi: '/placeholders/t-shirt_buttons/selector-color-kiwi.png',
      black: '/placeholders/t-shirt_buttons/selector-color-black.png',
    }),
    []
  );

  const defaultNav = useMemo(
    () => [
      { id: 'first_contact', label: 'First Contact' },
      { id: 'the_human_inside', label: 'The Human Inside' },
      { id: 'austen', label: 'Austen' },
      { id: 'cube', label: 'Cube' },
      { id: 'miscellania', label: 'Miscel·lània' },
    ],
    []
  );

  const resolvedNav = useMemo(() => {
    const provided = Array.isArray(navItems) ? navItems : [];
    const byId = new Map();

    for (const item of provided) {
      if (!item?.id) continue;
      byId.set(item.id, item);
    }
    for (const item of defaultNav) {
      if (!item?.id) continue;
      if (!byId.has(item.id)) byId.set(item.id, item);
    }

    const out = [];
    if (byId.has('first_contact')) out.push(byId.get('first_contact'));

    for (const item of provided) {
      if (!item?.id) continue;
      if (item.id === 'first_contact') continue;
      if (byId.has(item.id)) out.push(byId.get(item.id));
    }
    for (const item of defaultNav) {
      if (!item?.id) continue;
      if (item.id === 'first_contact') continue;
      if (out.some((x) => x?.id === item.id)) continue;
      out.push(item);
    }

    return out;
  }, [defaultNav, navItems]);

  const allowStripeV4UrlParams = useMemo(() => {
    try {
      if (typeof window === 'undefined') return false;
      const p = new URLSearchParams(location?.search || window.location.search || '');
      const wantsStripeDebug = Boolean(
        p.has('debugStripeHit')
        || p.has('stripeCalib')
        || p.has('debugV4OverlayCalib')
        || Array.from(p.keys()).some((k) => (k || '').toString().startsWith('v4'))
      );
      if (!wantsStripeDebug) return false;

      if (import.meta.env.DEV) return true;
      const host = (window.location?.hostname || '').toLowerCase();
      return host === 'localhost' || host === '127.0.0.1';
    } catch {
      return false;
    }
  }, [location?.search]);

  const thinDrawings = useMemo(
    () => [
      // Columna 2 (en ordre)
      'Afrodita',
      'C3P0',
      'Cyberman',
      'Cylon 03',
      'Cylon 78',
      'Iron Man 08',
      'Iron Man 68',
      'Maschinenmensch',
      'Mazinger',
      'R2-D2',
      // Columna 3 (en ordre)
      'Robbie the Robot',
      'Robocop',
      'The Dalek',
      'Vader',
    ],
    []
  );

  const thinWindowItems = useMemo(() => {
    const list = Array.isArray(thinDrawings) ? thinDrawings : [];
    if (list.length === 0) return [];
    const start = ((thinStartIndex % list.length) + list.length) % list.length;
    const out = [];
    for (let i = 0; i < 7; i += 1) {
      out.push(list[(start + i) % list.length]);
    }
    return out;
  }, [thinDrawings, thinStartIndex]);

  const defaultMega = useMemo(
    () => ({
      first_contact: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            'NX-01',
            'NCC-1701',
            'NCC-1701-D',
            'Wormhole',
            'The Phoenix',
            "Vulcan's End",
            'Plasma Escape',
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
      the_human_inside: [
        {
          title: '',
          items: [CONTROL_TILE_BN, ...thinWindowItems, CONTROL_TILE_ARROWS],
        },
      ],
      austen: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            '/custom_logos/drawings/images_grid/austen/pemberley_house/pemberley-house-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/quotes/you-must-allow-me-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/quotes/body-and-soul-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/quotes/half-agony-half-hope-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/quotes/unsociable-and-taciturn-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/quotes/it-is-a-truth-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/persuasion-1-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/persuasion-2-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/persuasion-3-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/persuasion-4-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-1-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-2-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-3-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-4-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-1-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-2-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-3-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-4-grid.webp',
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/blue-solid-grid.webp',
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/fuchsia-solid-grid.webp',
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/red-solid-grid.webp',
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/yellow-solid-grid.webp',
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/blue-frame-grid.webp',
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/fuchsia-frame-grid.webp',
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/red-frame-grid.webp',
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/yellow-frame-grid.webp',
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
      cube: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            'Afrodita C',
            'Cube 3 P0',
            'Cyber Cube',
            'Cylon Cube 03',
            'Darth Cube',
            'Iron Kong',
            'Iron Cube 68',
            'MaschinenCube',
            'Mazinger C',
            'RoboCube',
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
      miscellania: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            '/custom_logos/drawings/images_grid/miscellania/arthur-d-the-second-b-grid.webp',
            '/custom_logos/drawings/images_grid/miscellania/death-star2d2-b-grid.webp',
            '/custom_logos/drawings/images_grid/miscellania/dj-vader-b-grid.webp',
            '/custom_logos/drawings/images_grid/miscellania/pont-del-diable-b-grid.webp',
            '/custom_logos/drawings/images_grid/miscellania/r2d2-quote-b-grid.webp',
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
    }),
    [thinWindowItems]
  );

  const resolvedMega = useMemo(() => {
    if (!megaConfig || typeof megaConfig !== 'object') return defaultMega;

    const out = { ...defaultMega };
    for (const [key, value] of Object.entries(megaConfig)) {
      if (!Array.isArray(value) || value.length === 0) continue;
      const hasAnyItems = value.some((col) => Array.isArray(col?.items) && col.items.length > 0);
      if (!hasAnyItems) continue;
      out[key] = value;
    }

    try {
      const pemb = '/custom_logos/drawings/images_grid/austen/pemberley_house/pemberley-house-b-grid.webp';
      const cols = out.austen;
      const hasPemb = Array.isArray(cols) && cols.some((col) => Array.isArray(col?.items) && col.items.some((it) => typeof it === 'string' && it.includes('/austen/pemberley_house/')));
      if (Array.isArray(cols) && cols.length > 0 && !hasPemb) {
        out.austen = cols.map((col) => {
          const items = Array.isArray(col?.items) ? col.items.slice() : [];
          if (items.includes(pemb)) return col;
          const bnIdx = items.indexOf(CONTROL_TILE_BN);
          const insertAt = bnIdx >= 0 ? bnIdx + 1 : 0;
          items.splice(insertAt, 0, pemb);
          return { ...col, items };
        });
      }
    } catch {
    }

    // Garantir que the_human_inside sempre utilitza la finestra lliscant (thinWindowItems) per evitar desbordaments
    try {
      const cols = out.the_human_inside;
      if (Array.isArray(cols) && cols.length > 0) {
        out.the_human_inside = cols.map((col) => {
          return {
            ...col,
            items: [CONTROL_TILE_BN, ...thinWindowItems, CONTROL_TILE_ARROWS],
          };
        });
      }
    } catch {
    }

    if (gridCalibFromUrl) {
      out.cube = defaultMega.cube;
    }
    return out;
  }, [defaultMega, gridCalibFromUrl, megaConfig, thinWindowItems]);

  const AUSTEN_SUB_PREFIXES = useMemo(() => ({
    pemberley: ['/austen/pemberley_house/'],
    keep_calm: ['/austen/keep_calm/'],
    quotes: ['/austen/quotes/'],
    crosswords: ['/austen/crosswords/'],
    looking_for_my_darcy: ['/austen/looking_for_my_darcy/'],
  }), []);

  const resolvedMegaFiltered = useMemo(() => {
    if (active !== 'austen' || !austenSubcollection) return resolvedMega;
    const prefixes = AUSTEN_SUB_PREFIXES[austenSubcollection];
    if (!prefixes) return resolvedMega;
    return {
      ...resolvedMega,
      austen: resolvedMega.austen.map((col) => ({
        ...col,
        items: col.items.filter((it) => {
          if (typeof it !== 'string') return true;
          if (it === CONTROL_TILE_BN || it === CONTROL_TILE_ARROWS) return true;
          return prefixes.some((p) => it.includes(p));
        }),
      })),
    };
  }, [resolvedMega, active, austenSubcollection, AUSTEN_SUB_PREFIXES]);

  const stripeTileOverlaySrcs = useMemo(() => {
    const cols = resolvedMegaFiltered?.[active];
    if (!Array.isArray(cols) || cols.length === 0) return null;
    const items = cols[0]?.items || [];
    const drawable = active === 'the_human_inside'
      ? thinDrawings
      : items.filter((it) =>
          it && it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS
        );
    if (drawable.length === 0) return null;

    const variant = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
    // Versió multi (variant 'color'): només la samarreta blanca usa la Dark;
    // totes les altres usen la Light, independentment del color de samarreta.
    const multiTone = displayedShirtColor === 'white' ? 'dark' : 'light';
    const resolveForItem = (it) => {
      if (active === 'first_contact') {
        if (variant === 'white') return FIRST_CONTACT_MEDIA_WHITE[it] || FIRST_CONTACT_MEDIA[it] || null;
        if (variant === 'color') return FIRST_CONTACT_MEDIA_COLOR[it] || FIRST_CONTACT_MEDIA[it] || null;
        return FIRST_CONTACT_MEDIA[it] || null;
      }
      if (active === 'the_human_inside') {
        const k = String(it).trim().toLowerCase();
        const mapBlack = {
          'r2-d2': 'r2-d2-b-stripe.webp', c3p0: 'c3-p0-b-stripe.webp', 'c3-p0': 'c3-p0-b-stripe.webp',
          vader: 'vader-b-stripe.webp', afrodita: 'afrodita-a-b-stripe.webp', 'afrodita-a': 'afrodita-a-b-stripe.webp',
          mazinger: 'mazinger-z-b-stripe.webp', 'mazinger-z': 'mazinger-z-b-stripe.webp',
          'cylon 78': 'cylon-78-b-stripe.webp', 'cylon 03': 'cylon-03-b-stripe.webp',
          'iron man 68': 'iron-man-68-b-stripe.webp', 'iron man 08': 'iron-man-08-b-stripe.webp',
          cyberman: 'cyberman-b-stripe.webp', 'the dalek': 'the-dalek-b-stripe.webp',
          robocop: 'robocop-b-stripe.webp', terminator: 'terminator-b-stripe.webp',
          maschinenmensch: 'maschinenmensch-b-stripe.webp',
          'robby the robot': 'robbie-the-robot-b-stripe.webp', 'robbie the robot': 'robbie-the-robot-b-stripe.webp',
        };
        const file = mapBlack[k];
        if (!file) return null;
        if (variant === 'white') {
          const wf = file.replace(/-b-stripe\.webp$/, '-w-stripe.webp');
          return `/custom_logos/drawings/images_stripe/the_human_inside/white/${wf}`;
        }
        if (variant === 'color') {
          const cf = file.replace(/-b-stripe\.webp$/, '-multi-light-stripe.webp');
          return `/custom_logos/drawings/images_stripe/the_human_inside/color/${cf}`;
        }
        return `/custom_logos/drawings/images_stripe/the_human_inside/black/${file}`;
      }
      if (active === 'cube') {
        return CUBE_MEDIA[it] || null;
      }
      if (active === 'miscellania') {
        const lower = String(it).toLowerCase();
        if (lower.includes('arthur-d-the-second') || lower.includes('arthur d the second')) {
          if (variant === 'white') return '/custom_logos/drawings/images_stripe/miscellania/white/arthur-d-the-second-w-stripe.webp';
          if (variant === 'color') return '/custom_logos/drawings/images_stripe/miscellania/color/arthur-d-the-second-multi-light-stripe.webp';
          return '/custom_logos/drawings/images_stripe/miscellania/black/arthur-d-the-second-b-stripe.webp';
        }
        if (lower.includes('r2d2-quote') || lower.includes('r2d2 quote')) {
          if (variant === 'white') return '/custom_logos/drawings/images_stripe/miscellania/white/r2d2-quote-w-stripe.webp';
          if (variant === 'color') return '/custom_logos/drawings/images_stripe/miscellania/color/r2d2-quote-multi-light-stripe.webp';
          return '/custom_logos/drawings/images_stripe/miscellania/black/r2d2-quote-b-stripe.webp';
        }
        if (lower.includes('dj-vader')) {
          if (variant === 'white') return '/custom_logos/drawings/images_stripe/miscellania/white/dj-vader-w-stripe.webp';
          if (variant === 'color') return '/custom_logos/drawings/images_stripe/miscellania/color/dj-vader-multi-light-stripe.webp';
          return '/custom_logos/drawings/images_stripe/miscellania/black/dj-vader-b-stripe.webp';
        }
        if (lower.includes('death-star2d2')) {
          if (variant === 'white') return '/custom_logos/drawings/images_stripe/miscellania/white/death-star2d2-w-stripe.webp';
          if (variant === 'color') return '/custom_logos/drawings/images_stripe/miscellania/color/death-star2d2-multi-light-stripe.webp';
          return '/custom_logos/drawings/images_stripe/miscellania/black/death-star2d2-b-stripe.webp';
        }
        if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
          if (variant === 'white') return '/custom_logos/drawings/images_stripe/miscellania/white/pont-del-diable-w-stripe.webp';
          if (variant === 'color') return '/custom_logos/drawings/images_stripe/miscellania/color/pont-del-diable-multi-light-stripe.webp';
          return '/custom_logos/drawings/images_stripe/miscellania/black/pont-del-diable-b-stripe.webp';
        }
        return null;
      }
      if (active === 'austen') {
        const s = String(it);
        if (s.includes('/austen/pemberley_house/')) {
          if (variant === 'color') return '/custom_logos/drawings/images_stripe/austen/pemberley_house/color/pemberley-house-multi-light-stripe.webp';
          if (variant === 'white') return '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp';
          return '/custom_logos/drawings/images_stripe/austen/pemberley_house/black/pemberley-house-b-stripe.webp';
        }
        if (s.includes('/austen/keep_calm/')) {
          if (variant === 'color') {
            const isRed = displayedShirtColor === 'red';
            return isRed
              ? '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-light-stripe.webp'
              : '/custom_logos/drawings/images_stripe/austen/keep_calm/color/keep-calm-multi-dark-stripe.webp';
          }
          if (variant === 'white') return '/custom_logos/drawings/images_stripe/austen/keep_calm/white/keep-calm-w-stripe.webp';
          return '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
        }
        if (s.includes('/austen/quotes/')) {
          const file = s.split('/').pop() || '';
          const slug = file.toLowerCase().replace(/-b-grid(?=\.webp$)/i, '').replace(/-grid(?=\.webp$)/i, '').replace(/\.webp$/i, '');
          const whiteStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          if (variant === 'white') return `/custom_logos/drawings/images_stripe/austen/quotes/white/${whiteStem}-w-stripe.webp`;
          if (variant === 'color') return `/custom_logos/drawings/images_stripe/austen/quotes/color/${slug}-multi-light-stripe.webp`;
          return `/custom_logos/drawings/images_stripe/austen/quotes/black/${whiteStem}-b-stripe.webp`;
        }
        if (s.includes('/austen/crosswords/')) {
          const file = s.split('/').pop() || '';
          const m = file.toLowerCase().replace(/-grid(?=\.webp$)/i, '').match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d)\.webp$/);
          if (m) {
            const book = m[1]; const n = m[2];
            if (variant === 'white') return `/custom_logos/drawings/images_stripe/austen/crosswords/white/${book}-${n}-w-stripe.webp`;
            return `/custom_logos/drawings/images_stripe/austen/crosswords/black/${book}-${n}-b-stripe.webp`;
          }
        }
        if (s.includes('/austen/looking_for_my_darcy/')) {
          const file = s.split('/').pop() || '';
          const m = file.toLowerCase().match(/(blue|fuchsia|red|yellow)-(solid|frame)-grid\.webp$/);
          if (m) {
            const c = m[1];
            if (m[2] === 'solid') {
              return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/solid/${c}-solid-stripe.webp`;
            }
            if (m[2] === 'frame') {
              return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/color/frame/${c}-frame-stripe.webp`;
            }
          }
        }
      }
      return null;
    };

    // Dibuixos alineats a l'ESQUERRA; les caselles buides queden a la DRETA
    // (on les imatges base N.jpg mostren les N samarretes buides).
    const tileSrcs = [];
    for (let i = 0; i < 14; i++) {
      let src = i < drawable.length ? resolveForItem(drawable[i]) : null;
      if (src && variant === 'color' && multiTone === 'dark') {
        src = src.replace('-multi-light-stripe.webp', '-multi-dark-stripe.webp');
      }
      tileSrcs.push(src);
    }
    return tileSrcs;
  }, [resolvedMegaFiltered, active, firstContactVariant, humanInsideVariant, displayedShirtColor, thinDrawings]);

  // Identitat de l'ítem mostrat a cada tile de la franja (mateixa lògica
  // cíclica que stripeTileOverlaySrcs). Permet saber quina samarreta correspon
  // a cada fila de text.
  const stripeTileItems = useMemo(() => {
    const cols = resolvedMegaFiltered?.[active];
    if (!Array.isArray(cols) || cols.length === 0) return null;
    const items = cols[0]?.items || [];
    const drawable = active === 'the_human_inside'
      ? thinDrawings
      : items.filter((it) =>
          it && it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS
        );
    if (drawable.length === 0) return null;
    const arr = [];
    for (let i = 0; i < 14; i++) arr.push(i < drawable.length ? drawable[i] : null);
    return arr;
  }, [resolvedMegaFiltered, active, thinDrawings]);

  // Imatge base de la franja. Els estampats (-stripe.webp) són transparents i
  // necessiten una samarreta blanca a sota, així que la base ha de tenir
  // samarretes a TOTES les caselles. full-white-stripe (14 samarretes) ja
  // mostra samarretes blanques a les caselles buides.
  const stripeBaseImageSrc = '/placeholders/cercador/full-white-stripe.jpg';

  // Índexs de les samarretes sense dibuix (buides) que cal desactivar.
  const emptyTileIndices = useMemo(() => {
    if (!Array.isArray(stripeTileItems)) return [];
    const out = [];
    stripeTileItems.forEach((it, i) => {
      if (!it) out.push(i);
    });
    return out;
  }, [stripeTileItems]);

  // Imatge prerenderitzada de les samarretes buides esvaïdes (N = nombre de
  // caselles buides). Es superposa, alineada amb la stripe, per esvair només
  // les buides sense dibuixar rectangles CSS (que provocaven una franja recta).
  // Només hi ha fitxers per a aquests nombres de buides.
  const stripeEmptyMaskSrc = useMemo(() => {
    // Samarretes buides desactivades: no s'aplica cap mask d'esvaïment perquè
    // es vegin les imatges pujades sense cap superposició.
    return null;
  }, [emptyTileIndices]);

  // Índexs de les samarretes (0-based) que mostren l'ítem sobre el qual es fa
  // hover al text; es ressalten individualment a la franja.
  const clicAreaHighlightIndices = useMemo(() => {
    if (!hoveredStripeItem || !Array.isArray(stripeTileItems)) return [];
    // Si la franja repeteix un únic dibuix (p.ex. una subcol·lecció amb un sol
    // ítem com Pemberley), ressaltar-los tots alhora queda estrany; no ressaltem.
    const distinct = new Set(stripeTileItems.filter(Boolean));
    if (distinct.size <= 1) return [];
    const out = [];
    stripeTileItems.forEach((it, i) => {
      if (it === hoveredStripeItem) out.push(i);
    });
    return out;
  }, [hoveredStripeItem, stripeTileItems]);

  // Índexs on es mostra el cercle del coll: només les samarretes corresponents
  // a l'ítem en hover al text. (No s'usa la selecció de grup, que sempre apunta
  // al primer ítem i deixava el cercle enganxat a la primera samarreta.)
  const neckDotIndices = useMemo(() => {
    if (!Array.isArray(stripeTileItems)) return [];
    const out = [];
    stripeTileItems.forEach((it, i) => {
      if (it && it === hoveredStripeItem) out.push(i);
    });
    return out;
  }, [stripeTileItems, hoveredStripeItem]);

  useEffect(() => {
    if (!active) return;
    if (stripeOverlayOverrideActive) return;

    const pickFirstDrawingItem = (items) => {
      const list = Array.isArray(items) ? items : [];
      for (const it of list) {
        if (!it) continue;
        if (it === CONTROL_TILE_BN) continue;
        if (it === CONTROL_TILE_ARROWS) continue;
        return it;
      }
      return null;
    };

    const col = resolvedMega?.[active];
    const firstItems = Array.isArray(col) && col.length > 0 ? col[0]?.items : null;
    const fallbackItem = pickFirstDrawingItem(firstItems);
    if (!fallbackItem) return;

    if (active === 'first_contact') {
      // No autoseleccionar el primer ítem a First Contact: així NX-01 no surt
      // en negreta en carregar (la negreta només s'aplica en seleccionar/hover).
      return;
    }

    if (active === 'the_human_inside') {
      // No autoseleccionar el primer ítem a The Human Inside: així R2-D2 no surt
      // ressaltat en carregar (el ressaltat només s'aplica en seleccionar/hover).
      return;
    }

    // No autoseleccionar cap ítem per defecte (cube, miscellania, austen):
    // així cap dibuix surt ressaltat en carregar. La selecció només s'aplica
    // quan l'usuari fa clic a un ítem del cercador.
  }, [
    active,
    CONTROL_TILE_ARROWS,
    CONTROL_TILE_BN,
    firstContactSelectedItem,
    humanInsideSelectedItem,
    resolvedMega,
    selectedItemByCollection,
    stripeOverlayOverrideActive,
  ]);

  // Sincronitzar selectedItem amb el target del selector
  useEffect(() => {
    if (!active) return;
    if (!megaTileSelectorParams?.enabled) return;
    
    const target = megaTileSelectorParams?.target;
    if (!target || typeof target !== 'string') return;
    
    // Actualitzar el selectedItem segons la col·lecció activa
    if (active === 'first_contact') {
      // No sincronitzar el target del selector amb la selecció de First Contact:
      // així cap ítem (ni NX-01) surt ressaltat en carregar. La selecció només
      // s'aplica quan l'usuari fa clic a un ítem del cercador.
      return;
    } else if (active === 'the_human_inside') {
      // No sincronitzar el target del selector amb la selecció de The Human Inside:
      // així cap ítem (ni R2-D2) surt ressaltat en carregar. La selecció només
      // s'aplica quan l'usuari fa clic a un ítem del cercador.
      return;
    } else {
      // Per altres col·leccions (cube, austen, miscellania): no sincronitzar el
      // target del selector amb la selecció. Així cap ítem surt ressaltat en
      // carregar; la selecció només s'aplica quan l'usuari fa clic.
      return;
    }
  }, [
    active,
    megaTileSelectorParams?.target,
    megaTileSelectorParams?.enabled,
    firstContactSelectedItem,
    humanInsideSelectedItem,
    selectedItemByCollection,
    setFirstContactSelectedItem,
    setHumanInsideSelectedItem,
    setSelectedItemByCollection,
  ]);

  useEffect(() => {
    if (typeof manualEnabledOverride === 'boolean') return undefined;
    if (contained) return undefined;

    const readControls = () => {
      try {
        const enabled = window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1';
        setDemoManualEnabled((prev) => (prev === enabled ? prev : enabled));
      } catch {
        setDemoManualEnabled((prev) => (prev === false ? prev : false));
      }
    };

    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === 'FULL_WIDE_SLIDE_DEMO_MANUAL' || e.key === 'FULL_WIDE_SLIDE_DEMO_PHASE') {
        readControls();
      }
    };

    const onLocalChange = () => {
      readControls();
    };

    readControls();
    window.addEventListener('storage', onStorage);
    window.addEventListener('full-wide-slide-demo-controls-changed', onLocalChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('full-wide-slide-demo-controls-changed', onLocalChange);
    };
  }, [contained, manualEnabledOverride]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (demoManualEnabled) return;
      setActive(null);
      setMobileOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [demoManualEnabled]);

  useEffect(() => {
    let mounted = true;
    getGildan5000Catalog().then((catalog) => {
      if (mounted) setGildan5000Catalog(catalog);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    if (gildan5000Catalog) return;
    let cancelled = false;
    getGildan5000Catalog()
      .then((data) => {
        if (cancelled) return;
        setGildan5000Catalog(data);
      })
      .catch(() => {
        if (cancelled) return;
        setGildan5000Catalog({ selected: [], selectedSlugs: new Set(), getPlaceholderSrc: () => null });
      });
    return () => {
      cancelled = true;
    };
  }, [active, gildan5000Catalog]);

  useEffect(() => {
    try {
      const p = new URLSearchParams(location.search);
      const fromUrl = p.get('active') || p.get('collection') || '';
      const next = typeof fromUrl === 'string' ? fromUrl.trim() : '';
      const allowed = new Set(['first_contact', 'the_human_inside', 'austen', 'cube', 'miscellania']);
      if (next && allowed.has(next)) {
        setActive(next);
        return;
      }
    } catch {
      // ignore
    }

    if (typeof manualEnabledOverride === 'boolean') {
      if (manualOverrideClosed) {
        setActive(null);
        return;
      }
      // Només forcem l'obertura inicial quan l'override està actiu (true).
      // Quan és false i NO s'ha tancat explícitament, NO forcem setActive(null):
      // si ho féssim, el primer clic (que fa setManualOverrideClosed(false))
      // re-executaria aquest efecte i tancaria el menú a l'instant.
      // L'obertura/tancament l'han de controlar les interaccions de l'usuari.
      if (manualEnabledOverride) {
        setActive(initialActiveId || 'first_contact');
      }
      return;
    }
    if (contained) {
      setActive(initialActiveId || 'first_contact');
      return;
    }
    setActive(demoManualEnabled ? 'first_contact' : null);
  }, [contained, demoManualEnabled, initialActiveId, manualEnabledOverride, manualOverrideClosed]);

  useEffect(() => {
    // keep: previously reset megaPage; mega is now single-page
  }, [active]);

  useEffect(() => {
    if (contained) return undefined;
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [contained, mobileOpen]);

  useEffect(() => {
    const recompute = () => {
      try {
        const px = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
        if (Number.isFinite(px) && px > 0) setRootRemPx(px);
      } catch {
        setRootRemPx(16);
      }
    };

    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, []);

  const canUseDom = typeof document !== 'undefined';

  const scrollMobileHumanByTiles = (dir) => {
    const el = mobileHumanScrollRef.current;
    if (!el) return;
    const step = 120 * 3 + 12 * 3;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <header
      ref={headerRef}
      className={`${contained ? 'relative' : 'fixed'} z-[10000] bg-background`}
      onMouseLeave={(e) => {
        if (isManualLockEnabled()) return;
        if (megaAccordionLocked) return;
        const nextTarget = e?.relatedTarget;
        if (nextTarget instanceof Node && e.currentTarget.contains(nextTarget)) return;
        if (nextTarget instanceof Element && nextTarget.closest('.debug-exempt')) return;
        closeMegaExplicitly();
      }}
      style={
        contained
          ? { top: 0,
                  marginTop: '-25px', left: 0, right: 0 }
          : {
top: 'var(--globalHeaderTopOffset, 0px)', left: 'var(--rulerInset, 0px)', right: 0 }
      }
    >
      <div className="border-b border-border">
        <div
          className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-10"
          style={{
            // Ancorat exactament a SiteFrame (=belt2) per evitar discrepàncies
            // de centratge causades per scrollbar-gutter, rulerInset i el fet
            // que el `<header>` és `position: fixed` (`right: 0` viewport).
            width: 'var(--site-w, 100%)',
            marginLeft: 'calc(var(--site-xL, 0px) - var(--rulerInset, 0px))',
          }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted lg:hidden"
              aria-label={mobileOpen ? 'Tancar menú' : 'Obrir menú'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link id="stripe-guide-header-logo-anchor" to="/" className="relative z-10 pointer-events-auto flex items-center gap-2 font-black tracking-tight text-foreground">
              <span
                id="stripe-guide-header-logo-mark-anchor"
                ref={logoMarkRef}
                aria-hidden="true"
                data-brand-logo="1"
                className="h-8 w-[140px] block text-foreground"
                style={{
                  backgroundColor: 'currentColor',
                  WebkitMaskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                  maskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'left center',
                  maskPosition: 'left center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                }}
              />
            </Link>
          </div>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-6">
            {resolvedNav.map((item) => {
              // L'indicador d'obert (fletxa rotada + color) només s'ha
              // d'activar quan realment veiem la col·lecció (megaPage=1).
              // Si l'usuari canvia a cerca/cistell/compte (2/3/4), la
              // col·lecció deixa de ser "visible" tot i mantenir `active`.
              const open = active === item.id && megaPage === 1;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`inline-flex items-center gap-1 text-xs font-semibold tracking-[0.18em] uppercase ${open ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-expanded={open ? 'true' : 'false'}
                  onMouseEnter={() => {
                    if (!active) return;
                    // Si la col·lecció ja és l'activa PERÒ el mega està
                    // mostrant una altra pestanya (cerca/cistell/compte
                    // = megaPage 2/3/4), tornem a la pàgina 1 perquè el
                    // hover pugui "re-entrar" a la col·lecció. Sense
                    // això, l'usuari es queda atrapat: `active` indica
                    // que ja hi és, però visualment veu una altra
                    // pestanya i no pot tornar-hi.
                    if (active === item.id && megaPage === 1) return;
                    setMegaPage(1);
                    setMegaFullScreen(false);
                    setActive(item.id);
                    touchMegaPublicActivity();
                  }}
                  onClick={() => {
                    setManualOverrideClosed(false);
                    setMegaFullScreen(false);
                    // Toggle només si ja som a la col·lecció i a la
                    // pàgina 1. Si som a una altra pestanya (2/3/4),
                    // un click ha d'obrir la col·lecció (page 1) en
                    // comptes de tancar-la.
                    if (active === item.id && megaPage === 1) {
                      setActive(null);
                    } else {
                      setMegaPage(1);
                      setActive(item.id);
                      touchMegaPublicActivity();
                    }
                  }}
                >
                  {item.label}
                  <ChevronDown className={`h-4 w-4 ${open ? 'rotate-180' : ''}`} />
                </button>
              );
            })}
          </nav>

          <div
            className="ml-auto flex items-center"
            style={{ gap: '0px' }}
            data-icons-wrap="true"
          >
            <div>
              <IconButton
                label="Search"
                onClick={() => {
                  setManualOverrideClosed(false);
                  // Cerca: pestanya única (sense acordió secundari).
                  // Click toggle: si ja som a la pestanya de cerca, la
                  // tanca; si no, hi anem.
                  if (megaPage === 2 && active) {
                    setActive(null);
                  } else {
                    setMegaPage(2);
                    setMegaFullScreen(false);
                    if (!active) ensureMegaOpen();
                  }
                  touchMegaPublicActivity();
                }}
              >
                <svg className="h-[25px] w-[25px] text-foreground -translate-x-[1px] lg:h-[29px] lg:w-[29px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
              </IconButton>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (cartClickTimeoutRef.current) window.clearTimeout(cartClickTimeoutRef.current);
                cartClickTimeoutRef.current = window.setTimeout(() => {
                  cartClickTimeoutRef.current = null;
                  setManualOverrideClosed(false);
                  // Seqüència de 3 clics al cistell:
                  //  1r: obre la pestanya (acordió tancat)
                  //  2n: obre l'acordió
                  //  3r: tanca tot (acordió i pestanya)
                  if (megaPage === 3 && active) {
                    if (!acordioExpanded) {
                      setAcordioExpanded(true);
                    } else {
                      setAcordioExpanded(false);
                      setActive(null);
                    }
                  } else {
                    setMegaPage(3);
                    setAcordioExpanded(false);
                    if (!active) ensureMegaOpen();
                  }
                  touchMegaPublicActivity();
                }, dblClickDelayMs);
              }}
              aria-label="Cart"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:h-10 lg:w-10"
            >
              <span aria-hidden="true" className="relative block h-[27px] w-[27px] transition-all duration-200 lg:h-[31px] lg:w-[31px]">
                <span
                  className="absolute inset-0"
                  style={{
                    display: 'block',
                    backgroundColor: 'currentColor',
                    WebkitMaskImage: `url(${cartItemCount > 0 ? '/custom_logos/icons/cistell-ple-2.svg' : '/custom_logos/icons/cistell-buit.svg'})`,
                    maskImage: `url(${cartItemCount > 0 ? '/custom_logos/icons/cistell-ple-2.svg' : '/custom_logos/icons/cistell-buit.svg'})`,
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                  }}
                />
                {cartItemCount > 0 ? (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 text-whiteStrong text-[13.75px] font-bold lg:text-[16.25px]"
                    style={{ top: 'calc(60% - 0.5px)', transform: 'translate(-50%, -50%)', lineHeight: '1' }}
                  >
                    {cartItemCount}
                  </span>
                ) : null}
              </span>
            </button>
            <div>
              <IconButton
                id="stripe-guide-user-icon-anchor"
                label="Account"
                buttonRef={accountButtonRef}
                onClick={(e) => {
                  e.preventDefault();
                  if (accountClickTimeoutRef.current) window.clearTimeout(accountClickTimeoutRef.current);
                  accountClickTimeoutRef.current = window.setTimeout(() => {
                    accountClickTimeoutRef.current = null;
                    setManualOverrideClosed(false);
                    // Mateixa seqüència de 3 clics al compte d'usuari
                    // que al cistell.
                    if (megaPage === 4 && active) {
                      if (!acordioExpandedPage4) {
                        setAcordioExpandedPage4(true);
                      } else {
                        setAcordioExpandedPage4(false);
                        setActive(null);
                      }
                    } else {
                      setMegaPage(4);
                      setAcordioExpandedPage4(false);
                      if (!active) ensureMegaOpen();
                    }
                    touchMegaPublicActivity();
                  }, dblClickDelayMs);
                }}
              >
                <UserRound className="h-[25px] w-[25px] text-foreground lg:h-[29px] lg:w-[29px]" strokeWidth={1.5} />
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {canUseDom && (!contained || portalContainer) &&
        ReactDOM.createPortal(
          active ? (
            <>
              <div
                className={`${contained ? 'absolute' : 'fixed'} inset-0 z-[9990]`}
                style={{
                  background: 'linear-gradient(to bottom, hsl(var(--foreground) / 0.75), hsl(var(--foreground) / 0.55))',
                }}
                role="button"
                tabIndex={0}
                onClick={() => {
                  closeMegaExplicitly();
                }}
              />
              <div
                className={`${contained ? 'absolute' : 'fixed'} inset-0 z-[9991] pointer-events-none`}
              >
                <MegaHeroSlider
                  slides={[
                    { id: 'white-1' },
                    { id: 'white-2' },
                    { id: 'white-3' },
                  ]}
                  autoplay
                  autoplayIntervalMs={8000}
                />
              </div>
            </>
          ) : null,
          portalContainer || document.body
        )}

      <div
        className="relative"
      >
        {active ? (
          <div 
            className="relative z-[10000] block border-b border-border" 
            style={{ 
              overflow: 'visible',
              ...(megaFullScreen ? {
                minHeight: '100vh',
              } : {})
            }}
          >
            <div
              ref={megaMenuRef}
              className="mx-auto max-w-[1350px] px-4 sm:px-6 lg:px-10 py-8"
              style={{ 
                overflow: 'visible',
                ...(megaFullScreen ? {
                  minHeight: 'calc(100vh - 16px)',
                } : {})
              }}
            >
              <MegaStripeBleedGuard
                heightPx={effectiveMegaTileSize
                  ? `${Math.round(effectiveMegaTileSize * 2 + 37 + (() => {
                    try {
                      const qs = (typeof window !== 'undefined') ? window.location?.search : '';
                      const p = qs ? new URLSearchParams(qs) : null;
                      const bottomPad = stripeRowPadPx;
                      return Math.max(0, bottomPad);
                    } catch {
                      return 0;
                    }
                  })())}px`
                  : undefined}
                debug={false}
                expandLeftPx={bleedGuardExpandPx?.left || 0}
                expandRightPx={bleedGuardExpandPx?.right || 0}
              >
                <div style={{ 
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100vw',
                  height: '100%',
                  overflow: 'visible'
                }}>
                  <div
                    style={{
                      display: 'flex',
                      width: '400%',
                      height: '100%',
                      transform: `translateX(${megaPage === 2 ? '-25%' : megaPage === 3 ? '-50%' : megaPage === 4 ? '-75%' : '0'})`,
                      transition: 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)',
                    }}
                  >
                    <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
                      <div style={{ 
                        flex: '1 1 auto',
                      }} />
                      
                      <div style={{ flex: '0 0 auto', width: 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))', maxWidth: 'none', position: 'relative', height: '100%', paddingLeft: '0px', paddingRight: '0px' }}>
                        <MegaStripePanel
                          active={active}
                          resolvedMega={resolvedMegaFiltered}
                          showStripe={showStripe}
                          stripeRowPadPx={stripeRowPadPx}
                          stripeRowPadXPx={stripeRowPadXPx}
                          stripePreviewHPx={stripePreviewHPx}
                          stripeOverlayLoadState={stripeOverlayLoadState}
                          resolvedOverlaySrc={resolvedOverlaySrc}
                          stripeOverlayDebug={stripeOverlayDebug}
                          stripeMaskDebugRectsPct={stripeMaskDebugRectsPct}
                          megaStripeSpriteEnabledLocal={megaStripeSpriteEnabledLocal}
                          megaStripeRefEnabledLocal={megaStripeRefEnabledLocal}
                          megaStripeRefSrcLocal={megaStripeRefSrcLocal}
                          megaStripeRef2EnabledLocal={megaStripeRef2EnabledLocal}
                          megaStripeRef2SrcLocal={megaStripeRef2SrcLocal}
                          megaShirtDrawingEnabledLocal={megaShirtDrawingEnabledLocal}
                          drawingOverlaySrcEffective={drawingOverlaySrcEffective}
                          stripeMaskTileRectsRawPct={stripeMaskTileRectsRawPct}
                          drawingOverlayDebug={drawingOverlayDebug}
                          tileGapPxLocal={tileGapPxLocal}
                          humanInsideVariant={humanInsideVariant}
                          firstContactVariant={firstContactVariant}
                          reorderAustenQuotes={reorderAustenQuotes}
                          austenSelectedDisableMulti={austenSelectedDisableMulti}
                          stripeVariantVisibility={stripeVariantVisibility}
                          megaTileSelectorParams={megaTileSelectorParams}
                          onStartSelectorDrag={onStartSelectorDrag}
                          megaTileSize={megaTileSize}
                          setStripeOverlayOverrideActive={setStripeOverlayOverrideActive}
                          setFirstContactVariant={setFirstContactVariant}
                          setHumanInsideVariant={setHumanInsideVariant}
                          setThinStartIndex={setThinStartIndex}
                          setFirstContactSelectedItem={setFirstContactSelectedItem}
                          setHumanInsideSelectedItem={setHumanInsideSelectedItem}
                          setSelectedItemByCollection={setSelectedItemByCollection}
                          normalizeOverlaySrc={normalizeOverlaySrc}
                          shirtColor={CERCADOR_COLORS.find((c) => c.slug === displayedShirtColor)?.hex}
                          onShirtClick={onShirtClick}
                          stripeTileOverlaySrcs={stripeTileOverlaySrcs}
                          stripeTileItems={stripeTileItems}
                          neckDotIndices={neckDotIndices}
                          emptyTileIndices={emptyTileIndices}
                          stripeEmptyMaskSrc={stripeEmptyMaskSrc}
                        />
                      </div>

                      <div style={{ 
                        flex: '1 1 auto',
                      }} />
                    </div>

                    <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
                      <div style={{ 
                        flex: '1 1 auto',
                      }} />

                      <div style={{
                        flex: '0 0 auto',
                        width: 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))',
                        maxWidth: 'none',
                        position: 'relative',
                        height: '100%',
                        paddingLeft: '0px',
                        paddingRight: '0px',
                      }}>
                        {/* <img
                          src="/placeholders/cercador/fons-cercador.png"
                          alt=""
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: 'auto',
                            zIndex: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                            transform: 'scale(0.94)',
                            transformOrigin: 'top center',
                          }}
                        /> */}
                        <div style={{
                          position: 'absolute',
                          top: 'var(--hg-cercador-bar-top, 0px)',
                          left: '50%',
                          transform: 'translateX(-50%) scale(var(--hg-cercador-bar-scale, 1))',
                          transformOrigin: 'top center',
                          width: 'var(--hg-cercador-bar-width, 94%)',
                          zIndex: 2,
                        }}>
                          <CercadorTopBar
                            activeCollection={active}
                            activeSubcollection={austenSubcollection}
                            onSelectCollection={(key) => {
                              if (key.includes(':')) {
                                const [col, sub] = key.split(':');
                                setActive(col);
                                setAustenSubcollection(sub);
                              } else {
                                setActive(key);
                                setAustenSubcollection(null);
                              }
                            }}
                            selectedColor={cercadorSelectedColor}
                            onSelectColor={setCercadorSelectedColor}
                          />
                        </div>
                        <div style={{
                          position: 'absolute',
                          top: 'var(--hg-cercador-bar-top, 0px)',
                          left: '50%',
                          transform: 'translateX(-50%) scale(var(--hg-cercador-bar-scale, 1))',
                          transformOrigin: 'top center',
                          width: 'var(--hg-cercador-bar-width, 94%)',
                          zIndex: 2,
                          containerType: 'inline-size',
                        }}>
                          <CercadorTextRow
                            activeCollection={active}
                            activeSubcollection={austenSubcollection}
                            selectedStripeItem={
                              active === 'first_contact' ? firstContactSelectedItem
                              : active === 'the_human_inside' ? humanInsideSelectedItem
                              : (selectedItemByCollection?.[active] ?? null)
                            }
                            hoveredStripeItem={hoveredStripeItem}
                            onSelectGroup={(collection, subcollection, firstStripeItem) => {
                              if (collection !== active) setActive(collection);
                              if (collection === 'austen') {
                                setAustenSubcollection(subcollection);
                              } else {
                                setAustenSubcollection(null);
                              }
                              setStripeOverlayOverrideActive(false);
                              if (firstStripeItem) {
                                if (collection === 'first_contact') {
                                  setFirstContactSelectedItem(firstStripeItem);
                                } else if (collection === 'the_human_inside') {
                                  setHumanInsideSelectedItem(firstStripeItem);
                                } else {
                                  setSelectedItemByCollection((prev) => ({ ...prev, [collection]: firstStripeItem }));
                                }
                              }
                            }}
                            onHoverItem={(stripeItem, collection) => {
                              setHoveredStripeItem(stripeItem);
                              setHoveredStripeItemCollection(collection);
                            }}
                            onHoverLeave={() => {
                              setHoveredStripeItem(null);
                              setHoveredStripeItemCollection(null);
                            }}
                          />
                        </div>
                        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                        <MegaStripePanel
                          active={active}
                          reserveGridSpace
                          stripeImageSrc={stripeBaseImageSrc}
                          resolvedMega={resolvedMegaFiltered}
                          showStripe={showStripe}
                          stripeRowPadPx={stripeRowPadPx}
                          stripeRowPadXPx={stripeRowPadXPx}
                          stripePreviewHPx={stripePreviewHPx}
                          stripeOverlayLoadState={stripeOverlayLoadState}
                          resolvedOverlaySrc={resolvedOverlaySrc}
                          stripeOverlayDebug={stripeOverlayDebug}
                          stripeMaskDebugRectsPct={stripeMaskDebugRectsPct}
                          megaStripeSpriteEnabledLocal={megaStripeSpriteEnabledLocal}
                          megaStripeRefEnabledLocal={megaStripeRefEnabledLocal}
                          megaStripeRefSrcLocal={megaStripeRefSrcLocal}
                          megaStripeRef2EnabledLocal={megaStripeRef2EnabledLocal}
                          megaStripeRef2SrcLocal={megaStripeRef2SrcLocal}
                          megaShirtDrawingEnabledLocal={megaShirtDrawingEnabledLocal}
                          drawingOverlaySrcEffective={drawingOverlaySrcEffective}
                          stripeMaskTileRectsRawPct={stripeMaskTileRectsRawPct}
                          drawingOverlayDebug={drawingOverlayDebug}
                          tileGapPxLocal={tileGapPxLocal}
                          humanInsideVariant={humanInsideVariant}
                          firstContactVariant={firstContactVariant}
                          reorderAustenQuotes={reorderAustenQuotes}
                          austenSelectedDisableMulti={austenSelectedDisableMulti}
                          stripeVariantVisibility={stripeVariantVisibility}
                          megaTileSelectorParams={megaTileSelectorParams}
                          onStartSelectorDrag={onStartSelectorDrag}
                          megaTileSize={megaTileSize}
                          setStripeOverlayOverrideActive={setStripeOverlayOverrideActive}
                          setFirstContactVariant={setFirstContactVariant}
                          setHumanInsideVariant={setHumanInsideVariant}
                          setThinStartIndex={setThinStartIndex}
                          setFirstContactSelectedItem={setFirstContactSelectedItem}
                          setHumanInsideSelectedItem={setHumanInsideSelectedItem}
                          setSelectedItemByCollection={setSelectedItemByCollection}
                          normalizeOverlaySrc={normalizeOverlaySrc}
                          shirtColor={CERCADOR_COLORS.find((c) => c.slug === displayedShirtColor)?.hex}
                          onShirtClick={onShirtClick}
                          stripeTileOverlaySrcs={stripeTileOverlaySrcs}
                          stripeTileItems={stripeTileItems}
                          clicAreaHighlightIndices={clicAreaHighlightIndices}
                          neckDotIndices={neckDotIndices}
                          emptyTileIndices={emptyTileIndices}
                          stripeEmptyMaskSrc={stripeEmptyMaskSrc}
                        />
                        </div>
                        {active ? (
                          <div style={{
                            display: 'flex',
                            marginTop: '18px',
                            padding: '0 40px',
                            justifyContent: 'center',
                          }}>
                            <div style={{
                              display: 'flex',
                              backgroundColor: '#f3f4f6',
                              padding: '2px',
                              borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
                              border: '1px solid #e5e7eb',
                              width: '100%',
                              maxWidth: '202px',
                              boxSizing: 'border-box',
                            }}>
                              {['BLANC', 'COLOR', 'NEGRE'].map((opt) => {
                                const currentVariant = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
                                const variantKey = opt === 'BLANC' ? 'white' : opt === 'NEGRE' ? 'black' : 'color';
                                const isActive = currentVariant === variantKey;
                                // Deshabilitar: variants inexistents a la
                                // col·lecció/subcol·lecció activa.
                                const variantExists = stripeVariantVisibility?.[variantKey] !== false;
                                const isDisabled = !variantExists;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => {
                                      if (isDisabled) return;
                                      if (active === 'the_human_inside') {
                                        setHumanInsideVariant(variantKey);
                                      } else {
                                        setFirstContactVariant(variantKey);
                                      }
                                    }}
                                    style={{
                                      flex: 1,
                                      fontFamily: 'Oswald, sans-serif',
                                      fontSize: '8.1pt',
                                      fontWeight: isActive ? 400 : 300,
                                      letterSpacing: '0em',
                                      lineHeight: 1,
                                      textTransform: 'none',
                                      color: isDisabled ? '#d1d5db' : (isActive ? '#111827' : '#9ca3af'),
                                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                                      border: 'none',
                                      borderRadius: 'clamp(2.11px, 0.6vw, 3.8px)',
                                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                                      opacity: isDisabled ? 0.5 : 1,
                                      transition: 'all 150ms ease',
                                      boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '5px 0',
                                    }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div style={{ 
                        flex: '1 1 auto',
                      }} />
                    </div>

                    <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
                      <div style={{ 
                        flex: '1 1 auto',
                      }} />

                      <div style={{ 
                        flex: '0 0 auto', 
                        width: 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))', 
                        maxWidth: 'none', 
                        position: 'relative', 
                        height: '100%',
                        paddingLeft: '0px', 
                        paddingRight: '0px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}>
                        {/* Ombra esquerra del carrusel */}
                        <div aria-hidden="true" style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '2px',
                          height: '100%',
                          background: '#DEDFE1',
                          pointerEvents: 'none',
                          zIndex: 90,
                        }} />
                        {/* Ombra dreta del carrusel */}
                        <div aria-hidden="true" style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '2px',
                          height: '100%',
                          background: '#DEDFE1',
                          pointerEvents: 'none',
                          zIndex: 90,
                        }} />
                        <div 
                          id="stripe-guide-cart-viewport-anchor"
                          onWheel={(e) => {
                            e.preventDefault();
                            e.currentTarget.scrollLeft += e.deltaY;
                          }}
                          style={{
                          width: '100%',
                          height: '100%',
                          flexShrink: 0,
                          backgroundColor: 'transparent',
                          padding: 0,
                          margin: 0,
                          display: 'flex',
                          flexDirection: 'row',
                          gap: '3px',
                          overflowX: 'auto',
                          overflowY: 'hidden',
                          clipPath: 'inset(0)',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                        }}>
                          {/* Carrusel de productes del cistell */}
                          {carouselProducts.map((product, idx) => (
                            <div id={idx === 0 ? 'stripe-guide-cart-card-top-anchor' : undefined} key={idx} style={{
                              position: 'relative',
                              flexShrink: 0,
                              overflow: 'visible',
                              height: '100%',
                              aspectRatio: '308 / 678',
                              fontSize: '1vh',
                            }}>
                              {/* Wrapper amb filtre per tot excepte botons */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                filter: product.disabled ? 'grayscale(100%)' : 'none',
                                opacity: product.disabled ? 0.5 : 1,
                                transition: 'filter 0.3s ease, opacity 0.3s ease',
                                pointerEvents: 'none',
                              }}>
                              {/* Capa 1: Color-card de fons */}
                              <img 
                                src={`/placeholders/color-cards/${product.img}`}
                                alt={`${product.name} - ${product.size}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'fill',
                                  display: 'block',
                                  opacity: 1,
                                }}
                              />
                              
                              {/* Capa 2: Imatge del producte centrada dins del rectangle verd */}
                              {product.isTemplate && (
                              <div style={{
                                position: 'absolute',
                                top: '8.222%',
                                left: '4.87%',
                                right: '4.87%',
                                bottom: '62.056%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                backgroundColor: 'transparent',
                                zIndex: 5,
                              }}>
                                <img
                                  src={`/custom_logos/drawings/images_stripe/${product.drawing}`}
                                  alt={product.name}
                                  style={{
                                    width: 'auto',
                                    height: 'auto',
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    transform: product.name === 'NX-01' ? 'scale(0.466)' :
                                               product.name === 'NCC-1701' ? 'scale(0.75)' :
                                               'none',
                                  }}
                                />
                              </div>
                              )}

                              {/* Overlay: Graella de referència REIXA */}
                              {product.isTemplate && false && (
                              <img 
                                src="/placeholders/color-cards/tmp/REIXA.png"
                                alt="Graella de referència"
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'fill',
                                  pointerEvents: 'none',
                                  zIndex: 100,
                                }}
                              />
                              )}

                              {/* Capa 3: Nom del producte */}
                              {product.isTemplate && (
                              <div style={{
                                  position: 'absolute',
                                  bottom: 'calc(40.5% + 8px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontFamily: 'Oswald, sans-serif',
                                  fontSize: '11.4pt',
                                  fontWeight: 600,
                                  color: '#000000',
                                  letterSpacing: '0.0025em',
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap',
                                  zIndex: 10,
                              }}>
                                  {product.name}
                                </div>
                              )}

                              {/* Capa 4: Selector de quantitat */}
                              {product.isTemplate && (
                              <div className="quantity-row" style={{
                                  position: 'absolute',
                                  bottom: 'calc(37.5% - 8.5px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2.6%',
                                  zIndex: 10,
                                  pointerEvents: 'auto',
                              }}>
                                  <button className="qty-btn" onClick={() => updateQuantity(idx, -1)} style={{
                                    width: '20px',
                                    height: '20px',
                                    border: 'none',
                                    background: 'transparent',
                                    fontFamily: 'Avenir Next, sans-serif',
                                    fontSize: '15pt',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    color: '#000000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1,
                                    padding: 0,
                                    position: 'relative',
                                    left: '-8px',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                  }}>−</button>
                                  <div style={{
                                    fontFamily: 'Avenir Next Condensed, sans-serif',
                                    fontSize: '9.6pt',
                                    fontWeight: 400,
                                    fontStretch: 'condensed',
                                    color: '#000000',
                                    letterSpacing: '0.08em',
                                    textAlign: 'center',
                                    lineHeight: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    left: '-4px',
                                  }}>QUANTITAT</div>
                                  <div style={{
                                    fontFamily: 'Avenir Next Condensed, sans-serif',
                                    fontSize: '9.6pt',
                                    fontWeight: 600,
                                    fontStretch: 'condensed',
                                    color: '#000000',
                                    textAlign: 'center',
                                    lineHeight: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    left: '3.25px',
                                    minWidth: '12px',
                                  }}>{product.qty}</div>
                                  <button className="qty-btn" onClick={() => updateQuantity(idx, 1)} style={{
                                    width: '20px',
                                    height: '20px',
                                    border: 'none',
                                    background: 'transparent',
                                    fontFamily: 'Avenir Next, sans-serif',
                                    fontSize: '15pt',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    color: '#000000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1,
                                    padding: 0,
                                    position: 'relative',
                                    left: '8px',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                  }}>+</button>
                                </div>
                              )}

                              {/* Capa 5: Selector de tallatge */}
                              {product.isTemplate && (
                              <div className="size-row" style={{
                                  position: 'absolute',
                                  bottom: 'calc(31.6% - 8px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2.6%',
                                  zIndex: 10,
                                  pointerEvents: 'auto',
                              }}>
                                  <button className="size-btn" onClick={() => updateSize(idx, -1)} style={{
                                    width: '20px',
                                    height: '20px',
                                    border: 'none',
                                    background: 'transparent',
                                    fontFamily: 'Avenir Next, sans-serif',
                                    fontSize: '15pt',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    color: '#000000',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1,
                                    position: 'relative',
                                    left: '4px',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                  }}>−</button>
                                  <div style={{
                                    fontFamily: 'Roboto Condensed, sans-serif',
                                    fontSize: '9.6pt',
                                    fontWeight: 400,
                                    color: '#000000',
                                    letterSpacing: '0.04em',
                                    minWidth: '70px',
                                    textAlign: 'center',
                                    position: 'relative',
                                    left: '1px',
                                  }}>TALLATGE</div>
                                  <div style={{
                                    fontFamily: 'Roboto Condensed, sans-serif',
                                    fontSize: '9.6pt',
                                    fontWeight: 700,
                                    color: '#000000',
                                    minWidth: '18px',
                                    textAlign: 'center',
                                    position: 'relative',
                                    left: '-5px',
                                  }}>{product.size}</div>
                                  <button className="size-btn" onClick={() => updateSize(idx, 1)} style={{
                                    width: '20px',
                                    height: '20px',
                                    border: 'none',
                                    background: 'transparent',
                                    fontFamily: 'Avenir Next, sans-serif',
                                    fontSize: '15pt',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    color: '#000000',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1,
                                    position: 'relative',
                                    left: '-4px',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                  }}>+</button>
                                </div>
                              )}

                              {/* Capa 6: Preu */}
                              {product.isTemplate && (
                              <div style={{
                                  position: 'absolute',
                                  bottom: 'calc(18.9% - 14.5px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontFamily: 'Avenir Next Condensed, sans-serif',
                                  fontSize: '18pt',
                                  fontWeight: 600,
                                  fontStretch: 'condensed',
                                  color: '#000000',
                                  textAlign: 'center',
                                  zIndex: 10,
                              }}>
                                  {product.price}
                                </div>
                              )}
                              </div>

                              {/* Capa 7: Botons d'acció */}
                              {product.isTemplate && (
                              <div style={{
                                  position: 'absolute',
                                  bottom: 'calc(8.6% - 8px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  display: 'flex',
                                  gap: '13%',
                                  zIndex: 10,
                                  justifyContent: 'center',
                              }}>
                                  <button onClick={() => {
                                    if (!product.disabled) {
                                      moveProductToCart(idx);
                                    }
                                    if (megaPage === 3 && active) {
                                      if (!megaAccordionLocked && !acordioExpanded) setAcordioExpanded(true);
                                    } else {
                                      setMegaPage(3);
                                      if (!active) ensureMegaOpen();
                                    }
                                    touchMegaPublicActivity();
                                  }} style={{
                                    width: '24px',
                                    height: '24px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    padding: 0,
                                    position: 'relative',
                                    top: '-2px',
                                    left: '-3px',
                                    transform: 'scale(0.855)',
                                  }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#272727" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                      <rect x="1" y="8" width="22" height="4" fill="#272727"/>
                                    </svg>
                                  </button>
                                  <button onClick={() => disableProduct(idx)} style={{
                                    width: '24px',
                                    height: '24px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    padding: 0,
                                    position: 'relative',
                                    top: '-2px',
                                    left: '3px',
                                    pointerEvents: 'auto',
                                  }}>
                                    <svg width="23.625" height="23.625" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="3">
                                      <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/*
                          Anchor invisible per a la guia belt2 (DEV).
                          Sempre renderitzat quan la pestanya cistell és
                          activa, encara que `acordioExpanded` sigui
                          false (seqüència 3-clics). Si no fos sempre
                          present, la guia caigui al fallback
                          `yCarouselTop + 737*scale` que ignora l'alçada
                          del carrusel i queda ~775px més amunt.
                        */}
                        {!acordioExpanded && (
                          <div
                            aria-hidden="true"
                            data-stripe-guide="accordion-pauta"
                            style={{
                              position: 'absolute',
                              top: 'calc(100% + 1px)',
                              left: 0,
                              width: '1px',
                              height: `${737.015 * accordionPautaScale}px`,
                              pointerEvents: 'none',
                              opacity: 0,
                            }}
                          />
                        )}

                        {/* Contingut de l'acordió - Overlay absolut full-width */}
                        {acordioExpanded && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100%',
                            minHeight: '100vh',
                            paddingTop: '40px',
                            paddingBottom: '40px',
                            zIndex: 10,
                          }}>
                            <div aria-hidden="true" style={{
                              position: 'absolute',
                              top: 0,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '100vw',
                              height: '100%',
                              minHeight: '100vh',
                              backgroundColor: 'white',
                              pointerEvents: 'none',
                              zIndex: -1,
                            }} />
                            {/* Zona de la pauta — tot el contingut queda clippat als límits */}
                            <div data-stripe-guide="accordion-pauta" style={{
                              position: 'absolute',
                              top: '1px',
                              left: '50%',
                              transform: `translateX(-50%) scale(${accordionPautaScale})`,
                              transformOrigin: 'top center',
                              width: `calc(100% / ${accordionPautaScale})`,
                              height: '737.015px',
                              overflow: 'hidden',
                            }}>
                              {/* Contingut independent de CISTELL — buit amb pauta */}
                              <CistellComandaContent
                                cartItems={cartItems}
                                setCartItems={setCartItems}
                                onCloseMegaSlide={() => setActive(null)}
                              />
                            </div>
                          </div>
                        )}

                        <style>{`
                          div::-webkit-scrollbar {
                            display: none;
                          }
                          .quantity-row:hover .qty-btn,
                          .size-row:hover .size-btn {
                            opacity: 1 !important;
                          }
                        `}</style>
                      </div>

                      <div style={{ 
                        flex: '1 1 auto',
                      }} />
                    </div>

                    <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
                      <div style={{ 
                        flex: '1 1 auto',
                      }} />

                      <div style={{ 
                        flex: '0 0 auto', 
                        width: 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))', 
                        maxWidth: 'none', 
                        position: 'relative', 
                        height: '100%', 
                        paddingLeft: '0px', 
                        paddingRight: '0px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}>
                        {/* Background PAUTA.jpg - darrere dels rectangles */}
                        <div style={{
                          display: 'none',
                          position: 'absolute',
                          top: '0',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '100vw',
                          height: '100%',
                          backgroundImage: `url("/tmp/USER/MISSATGES%20(AMB).jpg?v=${Date.now()}")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'calc(50% - 8.5px) -596.5px',
                          backgroundSize: '2038px 1527px',
                          zIndex: 0,
                          pointerEvents: 'none',
                        }} />

                        {/* ZONA 1: Slide - 4 rectangles individuals */}
                        <div style={{
                          width: '100%',
                          height: '100%',
                          flexShrink: 0,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '7.5px',
                          position: 'relative',
                          zIndex: 1,
                          transform: 'translateX(-4px)',
                        }}>
                          {['COMANDES', 'MISSATGES', 'COMPTE', 'SEGURETAT'].map((label) => (
                            <div key={label} style={{
                              backgroundColor: '#D4D7DC',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'Oswald, sans-serif',
                              fontWeight: 400,
                              fontSize: '15pt',
                              color: '#fff',
                            }}>
                              {label}
                            </div>
                          ))}
                        </div>

                        {/* Anchor invisible per a la guia belt2 (DEV) — vegeu pàgina cistell. */}
                        {!acordioExpandedPage4 && (
                          <div
                            aria-hidden="true"
                            data-stripe-guide="accordion-pauta"
                            style={{
                              position: 'absolute',
                              top: 'calc(100% + 1px)',
                              left: 0,
                              width: '1px',
                              height: `${737.015 * accordionPautaScale}px`,
                              pointerEvents: 'none',
                              opacity: 0,
                            }}
                          />
                        )}

                        {/* Contingut de l'acordió - Overlay absolut full-width */}
                        {acordioExpandedPage4 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100%',
                            minHeight: '100vh',
                            paddingTop: '40px',
                            paddingBottom: '40px',
                            zIndex: 10,
                          }}>
                            <div aria-hidden="true" style={{
                              position: 'absolute',
                              top: 0,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '100vw',
                              height: '100%',
                              minHeight: '100vh',
                              backgroundColor: 'white',
                              pointerEvents: 'none',
                              zIndex: -1,
                            }} />
                            {/* Zona de la pauta — tot el contingut queda clippat als límits */}
                            <div data-stripe-guide="accordion-pauta" style={{
                              position: 'absolute',
                              top: '1px',
                              left: '50%',
                              transform: `translateX(calc(-50% - 2px)) scale(${accordionPautaScale})`,
                              transformOrigin: 'top center',
                              width: `calc(100% / ${accordionPautaScale} + 4px)`,
                              height: '737.015px',
                              overflow: 'hidden',
                            }}>
                              {/* Mockup JPG: ara es renderitza dins de UserComandesContent perquè depén de la pestanya activa */}
                              <div style={{
                                display: 'none',
                                position: 'absolute',
                                top: '-1px',
                                left: '-280.5px',
                                width: '100vw',
                                height: '100vh',
                                backgroundImage: `url("/tmp/USER/MISSATGES%20(AMB).jpg?v=${Date.now()}")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'calc(50% - 8.5px) -661.5px',
                                backgroundSize: '2038px 1527px',
                                pointerEvents: 'none',
                              }} />

                              {/* Contingut alineat amb la pauta */}
                              <UserComandesContent />

                              {/* PAUTA-VERDA - Línies horitzontals (referència) */}
                              {false && <div style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: 'url(/tmp/PAUTES/PAUTA-GENERAL.png)',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: '0 -1px',
                                backgroundSize: '1350px 737.015px',
                                opacity: 0.02,
                                zIndex: 9999,
                                pointerEvents: 'none',
                              }} />}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ 
                        flex: '1 1 auto',
                      }} />
                    </div>
                  </div>
                </div>
              </MegaStripeBleedGuard>
            </div>
          </div>
        ) : null}
      </div>

      {mobileOpen ? (
        <div className="lg:hidden border-b border-border bg-background">
          <div className="px-4 py-4 grid gap-2">
            {resolvedNav.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setActive((prev) => (prev === item.id ? null : item.id))}
              >
                {item.label}
                <ChevronDown className={`h-4 w-4 ${active === item.id ? 'rotate-180' : ''}`} />
              </button>
            ))}
          </div>

          {active ? (
            <div className="border-t border-border px-4 py-4">
              <div className="grid gap-4">
                {(resolvedMega[active] || []).map((col) => (
                  <div key={col.title} className="rounded-2xl bg-muted p-4">
                    <div
                      ref={
                        active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9 ? mobileHumanScrollRef : undefined
                      }
                      className={
                        active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9
                          ? 'relative mt-3 overflow-x-auto'
                          : 'mt-3 grid grid-cols-3 gap-3'
                      }
                    >
                      <div
                        className={active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9 ? 'grid gap-x-3' : ''}
                        style={
                          active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9
                            ? {
                                width: 'max-content',
                                gridAutoFlow: 'column',
                                gridAutoColumns: '120px',
                              }
                            : undefined
                        }
                      >
                        {(() => {
                          const isPath = (v) => typeof v === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(v);
                          const base = active === 'the_human_inside' ? col.items : col.items.slice(0, 9);
                          if (active !== 'miscellania') return base;
                          const variant = firstContactVariant;
                          return base.filter((it) => {
                            if (it === CONTROL_TILE_BN || it === CONTROL_TILE_ARROWS) return true;
                            if (!isPath(it)) return false;
                            if (it.startsWith('black/')) return variant !== 'white';
                            if (it.startsWith('white/')) return variant === 'white';
                            return true;
                          });
                        })().map((it, idx) => (
                          <div key={`${it}-${idx}`} className="min-w-0">
                            {!it || it === CONTROL_TILE_ARROWS || it === CONTROL_TILE_BN ? (
                              <div className="h-4" />
                            ) : active === 'miscellania' && typeof it === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(it) ? (
                              <div className="h-4" />
                            ) : (
                              <Link
                                to="#"
                                className="flex h-4 w-full items-center justify-center rounded-none bg-muted px-2 text-xs text-muted-foreground hover:text-foreground"
                              >
                                {it}
                              </Link>
                            )}

                            {FIRST_CONTACT_MEDIA[it] ? (
                              <div className="relative mt-2 aspect-square w-full overflow-hidden">
                                {idx >= 1 && idx <= 7 ? (
                                  <div
                                    className={`absolute inset-0 rounded-md ${
                                      firstContactVariant === 'white' ? 'bg-foreground' : 'bg-transparent'
                                    }`}
                                  />
                                ) : null}
                                <OptimizedImg
                                  src={resolveGridThumbSrc(it, active) || FIRST_CONTACT_MEDIA[it]}
                                  alt={it}
                                  className={
                                    it === 'The Phoenix'
                                      ? 'absolute left-1/2 top-1/2 h-[92%] w-[92%] -translate-x-1/2 -translate-y-1/2 object-contain'
                                      : 'absolute inset-0 h-full w-full object-contain'
                                  }
                                />

                                {idx >= 1 && idx <= 7 && firstContactVariant === 'white' && !(
                                  typeof resolveGridThumbSrc(it, active) === 'string'
                                  && resolveGridThumbSrc(it, active).includes('/custom_logos/drawings/images_grid/first_contact/white/')
                                ) ? (
                                  <OptimizedImg
                                    src={resolveGridThumbSrc(it, active) || FIRST_CONTACT_MEDIA_WHITE[it] || FIRST_CONTACT_MEDIA[it]}
                                    alt={it}
                                    className={`absolute inset-0 z-20 h-full w-full object-contain transition-opacity duration-300 ease-in-out ${
                                      firstContactVariant === 'white' ? 'opacity-100' : 'opacity-0'
                                    } ${
                                      it === 'Wormhole'
                                        ? 'scale-[0.54]'
                                        : it === 'Plasma Escape'
                                          ? 'scale-[0.54]'
                                          : it === "Vulcan's End"
                                            ? 'scale-[0.66]'
                                            : 'scale-[0.6]'
                                    }`}
                                  />
                                ) : null}
                              </div>
                            ) : active === 'miscellania' && typeof it === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(it) ? (
                              <div className="relative mt-2 aspect-square w-full overflow-hidden">
                                <OptimizedImg
                                  src={resolveGridThumbSrc(it, active) || it}
                                  alt=""
                                  className="relative z-10 h-full w-full object-contain"
                                />
                              </div>
                            ) : THE_HUMAN_INSIDE_MEDIA[it] ? (
                              <div className="relative mt-2 aspect-square w-full overflow-hidden">
                                <OptimizedImg
                                  src={(humanInsideVariant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[it]}
                                  alt={it}
                                  className={`relative z-10 h-full w-full object-contain ${it === 'Mazinger' ? 'scale-[0.64]' : it === 'Maschinenmensch' ? 'scale-[0.65]' : 'scale-[0.6]'}`}
                                />
                              </div>
                            ) : it === CONTROL_TILE_BN ? (
                              active === 'the_human_inside' ? (
                                <FirstContactDibuix00Buttons onWhite={() => { setStripeOverlayOverrideActive(false); setHumanInsideVariant('white'); }} onBlack={() => { setStripeOverlayOverrideActive(false); setHumanInsideVariant('black'); }} onMulti={() => { setStripeOverlayOverrideActive(false); setHumanInsideVariant('color'); }} />
                              ) : (
                                <FirstContactDibuix00Buttons
                                  onWhite={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('white'); }}
                                  onBlack={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('black'); }}
                                  onMulti={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('color'); }}
                                  showWhite={stripeVariantVisibility?.white !== false}
                                  showBlack={stripeVariantVisibility?.black !== false}
                                  showMulti={stripeVariantVisibility?.color !== false}
                                />
                              )
                            ) : it === CONTROL_TILE_ARROWS ? (
                              <FirstContactDibuix09Buttons
                                tileSize={120}
                                onPrev={active === 'the_human_inside' ? () => setThinStartIndex((v) => v - 1) : () => {}}
                                onNext={active === 'the_human_inside' ? () => setThinStartIndex((v) => v + 1) : () => {}}
                              />
                            ) : (
                              <div className="mt-2 aspect-square w-full rounded-md bg-muted" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9 ? (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className="h-9 rounded-xl border border-border bg-background text-xs font-semibold tracking-[0.18em] uppercase text-foreground/80"
                          onClick={() => scrollMobileHumanByTiles(-1)}
                        >
                          Anterior
                        </button>
                        <button
                          type="button"
                          className="h-9 rounded-xl border border-border bg-background text-xs font-semibold tracking-[0.18em] uppercase text-foreground/80"
                          onClick={() => scrollMobileHumanByTiles(1)}
                        >
                          Següent
                        </button>
                      </div>
                    ) : null}

                    {active === 'miscellania' ? null : (
                      <div className="mt-4">
                        <div className="grid gap-2">
                          {(col.items || []).filter(Boolean).slice(0, 8).map((it) => (
                            <Link key={it} to="#" className="text-sm text-muted-foreground hover:text-foreground">
                              {it}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <div className="h-[1px] w-full bg-border" />
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-foreground"
                        >
                          <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
                          Catàleg
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-foreground"
                        >
                          <Layers className="h-4 w-4" strokeWidth={1.75} />
                          Col·lecció
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="h-[1px] w-full bg-border" />
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-foreground"
                        >
                          <motion.span layoutId={`stripe-${active}`} className="h-3 w-3 rounded-full bg-foreground" />
                          Color
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-foreground"
                        >
                          Detalls
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
