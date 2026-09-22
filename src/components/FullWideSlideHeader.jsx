import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogIn, Lock, Unlock, Search } from 'lucide-react';
import { useProductContext } from '@/contexts/ProductContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/hooks/useOrders';
import { getGildan64000Catalog } from '../utils/placeholders.js';
import { AUSTEN_QUOTES_ASSETS, resolveAustenQuoteAssetId, resolveAustenQuoteOriginalFromPath } from '../utils/austenQuotesAssets.js';
import { getSafeBelt, clampNumber, escalaMegaslide, MEGASLIDE_REFERENCIA_PX, carrilPx, carrilLane } from '@/utils/layoutMetrics';
import { laneForViewport } from '@/utils/layoutModel';
import {
  FIRST_CONTACT_MEDIA,
  FIRST_CONTACT_MEDIA_WHITE,
  FIRST_CONTACT_MEDIA_COLOR,
  THE_HUMAN_INSIDE_MEDIA,
  CUBE_MEDIA,
} from './fullwide/megaSlideMedia.js';
import { touchMegaPublicActivity, getMegaPublicSelectorFor, setMegaPublicSelectorFor } from './fullwide/megaPublicSelectorState.js';
import IconButton from './fullwide/MegaIconButton.jsx';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import RegisterOverlay from './fullwide/RegisterOverlay.jsx';
import usePersistentState from '@/hooks/usePersistentState';
import { CONTROL_TILE_BN, CONTROL_TILE_ARROWS } from './fullwide/MegaColumn.jsx';
import MegaMenuPanel from './fullwide/MegaMenuPanel.jsx';
import { CERCADOR_COLORS } from './fullwide/CercadorTopBar.jsx';
import useMegaPublicIdleReset from '@/hooks/useMegaPublicIdleReset';
import useUrlActiveCollection from '@/hooks/useUrlActiveCollection';
import useMegaStripeDebugVars from '@/hooks/useMegaStripeDebugVars';
import useMegaTileSelectorDrag from '@/hooks/useMegaTileSelectorDrag';


// Plantilla independent de l'acordió del CISTELL — taula pròpia sobre la pauta


function FullWideSlideHeader({
  contained = false,
  portalContainer,
  manualEnabledOverride,
  initialActiveId,
  navItems,
  megaConfig,
  showStripe = true,
  isPortraitTablet = false,
  isLandscapeTablet = false,
}) {
  // Les dues tauletes son el mateix disseny a part (vegeu el punt 10 del
  // testimoni): el carril de 1350 no s'hi aplica.
  const esTauleta = isPortraitTablet || isLandscapeTablet;
  // La banda estreta del megaslide (768-1366 sense tauleta): la mateixa
  // definicio que a MegaslidePagina2.
  const esBandaEstreta = typeof window !== 'undefined'
    && !isLandscapeTablet
    && window.innerWidth >= 768 && window.innerWidth <= 1366
    && window.innerWidth >= window.innerHeight;
  const location = useLocation();
  const navigate = useNavigate();
  const { products: contextProducts } = useProductContext();
  const { adminEmail } = useAdmin();
  const { orders } = useOrders(adminEmail);
  const cartClickTimeoutRef = useRef(null);
  const accountClickTimeoutRef = useRef(null);
  // Marques de temps de l'últim clic sobre cada icona de la capçalera. Serveixen
  // per ignorar el segon clic d'un clic ràpid doble: sense això, l'acció
  // s'executa dues vegades seguides (obre i tanca el mega-slide de cop) i la
  // pàgina sembla que reboti enrere.
  const cartLastClickRef = useRef(0);
  const searchLastClickRef = useRef(0);
  const accountLastClickRef = useRef(0);
  const collectionLastClickRefs = useRef(new Map());
  /**
   * Retorna true si el clic s'ha d'ignorar.
   *
   * PER QUE NO ES POT MIRAR NOMES EL TEMPS
   *
   * Abans es descartava qualsevol clic que arribes menys de 350 ms despres de
   * l'anterior. L'obertura i el tancament del calaix duren 320 ms cada un, i
   * qui clica al seu ritme natural cau dins d'aquella finestra sovint: el clic
   * s'ignorava en silenci i la pestanya semblava que s'obris i es tanques
   * tota sola.
   *
   * QUAN S'HA D'IGNORAR
   *
   * Nomes mentre l'accio anterior ENCARA S'ESTA FENT (l'animacio del calaix).
   * Passat aquest temps, el clic sempre val: si ja s'ha acabat d'obrir, el
   * proxim clic ha de poder tancar.
   *
   * El primer clic tambe passa sempre, pero aquest no fa res mes que apuntar
   * l'hora: l'accio la fa qui crida la funcio.
   */
  const clicRepetit = (ref, duracioAccioMs = 350) => {
    // `Date.now()` directament fa que el lint digui que la funcio no es pura,
    // pero aixo nomes s'executa en clicar, no en pintar.
    // eslint-disable-next-line react-hooks/purity
    const ara = Date.now();
    // El primer clic no te hora: passa sempre.
    if (!ref.current) {
      ref.current = ara;
      return false;
    }
    // Encara s'esta fent l'accio anterior: aixo si que es un doble clic.
    if (ara - ref.current < duracioAccioMs) return true;
    ref.current = ara;
    return false;
  };
  const clicColleccioRepetit = (collectionId) => {
    if (!collectionLastClickRefs.current.has(collectionId)) {
      collectionLastClickRefs.current.set(collectionId, { current: 0 });
    }
    return clicRepetit(collectionLastClickRefs.current.get(collectionId), 620);
  };
  const dblClickDelayMs = 0;
  const [searchQuery, ] = useState('');


  // El cistell és ÚNIC per a tota la botiga i viu a CartContext. Abans aquest
  // component en tenia un de propi, i per això afegir un producte des d'una
  // fitxa omplia un cistell que aquí no es veia (el carretó sortia buit).
  const { cartItems, setCartItems, addToCart, getTotalItems } = useCart();

  const localCartItemCount = getTotalItems();

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


  const [, setSearchGridScale] = useState(1);
  const [, setSearchCaretVisible] = useState(true);
  const [megaPage, setMegaPage] = usePersistentState('HG_MEGA_PAGE', 1);
  const [megaFullScreen, setMegaFullScreen] = useState(false);
  // Alcada d'una fila de la graella de la hero del megaslide. Es CALCULA a
  // partir de l'amplada del carril (la graella te `aspect-ratio`, aixi que la
  // fila n'es proporcional): la formula dona el valor pintat amb una desviacio
  // maxima de 0,013 px a 768/1024/1280/1366/1440/1920. Abans es mesurava del
  // DOM amb un `setTimeout`, i per tant arribava DESPRES del pintat.
  const carrilAmple = laneForViewport();
  const megaHeroRowHeight = carrilAmple * 0.0280625 - 2.875;
  const megaHeroGridRef = useRef(null);
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
        'wormhole': 'wormhole', 'the-phoenix': 'the-phoenix',
        "vulcan's-end": 'vulcans-end', 'vulcans-end': 'vulcans-end',
        'plasma-escape': 'plasma-escape',
      };
      const slug = map[s] || s;
      return `/first-contact/${slug}`;
    }
    if (collection === 'the_human_inside') {
      const map = {
        'r2-d2': 'r2-d2', 'c3p0': 'c3-p0', 'c3-p0': 'c3-p0',
        'vader': 'vader', 'afrodita': 'afrodita', 'afrodita-a': 'afrodita',
        'mazinger': 'mazinger', 'mazinger-z': 'mazinger',
        'cylon-78': 'cylon-78', 'cylon-03': 'cylon-03',
        'iron-man-68': 'ironman-68', 'iron-man-08': 'ironman-08',
        'cyberman': 'cyberman', 'maschinenmensch': 'maschinenmensch',
        'robocop': 'robocop', 'the-dalek': 'the-dalek',
        'robbie-the-robot': 'robbie-the-robot', 'robby-the-robot': 'robbie-the-robot',
        'terminator': 'terminator',
      };
      const slug = map[s] || s;
      return `/the-human-inside/${slug}`;
    }
    if (collection === 'cube') {
      const map = {
        'iron-kong': 'ironkong', 'iron-cube-68': 'ironman-68',
        'robocube': 'robocube', 'cylon-cube-03': 'cylon-cube',
        'maschinencube': 'maschinencube', 'mazinger-c': 'mazinger-c',
        'afrodita-c': 'afrodita-c', 'cube-3-p0': '3cube-p0',
        'cyber-cube': 'cybercube', 'darth-cube': 'darth-cube',
      };
      const slug = map[s] || s;
      return `/cube/${slug}`;
    }
    if (collection === 'miscellania') {
      let name = s;
      if (s.includes('/miscellania/')) {
        name = s.split('/miscellania/')[1].replace(/-b-grid\.webp$/, '').replace(/\.webp$/, '');
      }
      const map = {
        'dj-vader': 'dj-vader',
        'death-star2d2': 'death-star2d2',
        'pont-del-diable': 'pont-del-diable',
        'arthur-d-the-second': 'arthur-d-the-second',
        'r2d2-quote': 'r2d2-quote',
      };
      const slug = map[name] || name;
      return `/miscellania/${slug}`;
    }
    if (collection === 'austen') {
      if (s.includes('/austen/pemberley_house/')) return '/austen/pemberley-house';
      if (s.includes('/austen/keep_calm/')) return '/austen/keep-calm';
      if (s.includes('/austen/quotes/')) {
        const slug = s.split('/austen/quotes/')[1].replace(/-b-grid\.webp$/, '').replace(/\.webp$/, '');
        const map = {
          'it-is-a-truth': 'quotes-it-is-a-truth',
          'you-must-allow-me': 'quotes-i-admire-and-love-you',
          'body-and-soul': 'quotes-you-have-bewitched-me',
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
              'yellow-frame': 'pink-yellow-frame',
            };
            return `/austen/looking-for-my-darcy-${frameMap[`${m[1]}-frame`] || `${c}-frame`}`;
          }
        }
      }
    }
    return null;
  }, []);

  const [showRegisterOverlay, setShowRegisterOverlay] = useState(false);
  const [megaLocked, setMegaLocked] = useState(false);
  const [lockBtnTop, setLockBtnTop] = useState(null);
  // Contenidor del cadenat: la seva posicio s'hi escriu directament a cada
  // fotograma, sense passar per l'estat de React (que feia saltets).
  const lockWrapRef = useRef(null);
  // El cadenat no queda encavalcat al separador: en surt de sota i queda
  // 8 px per sota de la linia del megaslide.
  const CADE_BAIXADA_PX = 8;
  const { user } = useAuth();
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

  const gridCalibFromUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('gridCalib');

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
      if (megaPage === 3 && localCartItemCount > 0) {
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
  const prevVariantRef = useRef(firstContactVariant);

  // Pàgina 2: estat de variant independent per desacoplar de la pàgina 1
  const [firstContactVariantP2, setFirstContactVariantP2] = useState(() => readStripeVariantFromUrl() || 'black');
  const [humanInsideVariantP2, setHumanInsideVariantP2] = useState(() => readStripeVariantFromUrl() || 'black');
  const prevVariantP2Ref = useRef(firstContactVariantP2);
  const [cercadorSelectedColorP2, setCercadorSelectedColorP2] = useState('white');

  // Color de samarreta realment mostrat: coincideix amb el selector excepte
  // quan la variant és BLANC sobre blanc o NEGRE sobre negre, llavors s'inverteix
  // perquè la tinta sigui visible. El selector no es mou.
  const displayedShirtColor = useMemo(() => {
    if (active === 'cube') return cercadorSelectedColor;
    if (active === 'austen' && austenSubcollection === 'looking_for_my_darcy') return cercadorSelectedColor;
    const variant = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
    if (variant === 'white' && cercadorSelectedColor === 'white') return 'black';
    if (variant === 'black' && cercadorSelectedColor === 'black') return 'white';
    return cercadorSelectedColor;
  }, [active, firstContactVariant, humanInsideVariant, cercadorSelectedColor]);

  // Pàgina 2: displayedShirtColor propi amb les variants P2 i color P2
  const displayedShirtColorP2 = useMemo(() => {
    if (active === 'cube') return cercadorSelectedColorP2;
    if (active === 'austen' && austenSubcollection === 'looking_for_my_darcy') return cercadorSelectedColorP2;
    const variant = active === 'the_human_inside' ? humanInsideVariantP2 : firstContactVariantP2;
    if (variant === 'white' && cercadorSelectedColorP2 === 'white') return 'black';
    if (variant === 'black' && cercadorSelectedColorP2 === 'black') return 'white';
    return cercadorSelectedColorP2;
  }, [active, firstContactVariantP2, humanInsideVariantP2, cercadorSelectedColorP2]);

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

  const onShirtClick = useCallback((collection, item, color) => {
    const url = resolvePdpUrl(collection, item);
    const selectedVariant = collection === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
    if (url) {
      const matched = CERCADOR_COLORS.find((c) => c.overlayHex === color);
      const colorSlug = matched?.slug || displayedShirtColor || 'white';
      navigate(`${url}?color=${colorSlug}&variant=${selectedVariant}`);
    }
  }, [navigate, resolvePdpUrl, displayedShirtColor, firstContactVariant, humanInsideVariant]);

  // Pàgina 2: onShirtClick propi amb variants P2
  const onShirtClickP2 = useCallback((collection, item, color) => {
    const url = resolvePdpUrl(collection, item);
    if (url) {
      const matched = CERCADOR_COLORS.find((c) => c.overlayHex === color);
      const colorSlug = matched?.slug || displayedShirtColorP2 || 'white';
      const selectedVariant = collection === 'the_human_inside' ? humanInsideVariantP2 : firstContactVariantP2;
      navigate(`${url}?color=${colorSlug}&variant=${selectedVariant}`);
    }
  }, [navigate, resolvePdpUrl, displayedShirtColorP2, firstContactVariantP2, humanInsideVariantP2]);

  const [thinStartIndex, setThinStartIndex] = useState(0);
  const [gildan64000Catalog, setGildan64000Catalog] = useState(null);

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
      if (active === 'cube') return;
      if (active === 'austen' && austenSubcollection === 'looking_for_my_darcy') return;
      const allowed = stripeVariantVisibility || { white: true, black: true, color: true };
      const want = firstContactVariant;
      const ok = (want === 'white' && allowed.white) || (want === 'black' && allowed.black) || (want === 'color' && allowed.color);
      if (ok) return;
      if (allowed.white) setFirstContactVariant('white');
      else if (allowed.black) setFirstContactVariant('black');
      else if (allowed.color) setFirstContactVariant('color');
    } catch {
      /* s'ignora a posta */
    }
  }, [active, stripeVariantVisibility, firstContactVariant, austenSubcollection]);

  // Preservar variant en entrar/sortir de col·leccions només-color (Cube, Looking For My Darcy)
  const isColorOnly = active === 'cube' || (active === 'austen' && austenSubcollection === 'looking_for_my_darcy');
  const wasColorOnlyRef = useRef(false);
  useEffect(() => {
    if (isColorOnly) {
      if (firstContactVariant !== 'color') {
        prevVariantRef.current = firstContactVariant;
        setFirstContactVariant('color');
      }
      wasColorOnlyRef.current = true;
    } else {
      if (wasColorOnlyRef.current && firstContactVariant === 'color' && prevVariantRef.current && prevVariantRef.current !== 'color') {
        const allowed = stripeVariantVisibility || { white: true, black: true, color: true };
        const want = prevVariantRef.current;
        const ok = (want === 'white' && allowed.white) || (want === 'black' && allowed.black) || (want === 'color' && allowed.color);
        if (ok) setFirstContactVariant(want);
      }
      wasColorOnlyRef.current = false;
    }
  }, [isColorOnly, firstContactVariant, stripeVariantVisibility]);

  // Pàgina 2: mateixa preservació
  const isColorOnlyP2 = active === 'cube' || (active === 'austen' && austenSubcollection === 'looking_for_my_darcy');
  const wasColorOnlyP2Ref = useRef(false);
  useEffect(() => {
    if (isColorOnlyP2) {
      if (firstContactVariantP2 !== 'color') {
        prevVariantP2Ref.current = firstContactVariantP2;
        setFirstContactVariantP2('color');
      }
      wasColorOnlyP2Ref.current = true;
    } else {
      if (wasColorOnlyP2Ref.current && firstContactVariantP2 === 'color' && prevVariantP2Ref.current && prevVariantP2Ref.current !== 'color') {
        const allowed = stripeVariantVisibility || { white: true, black: true, color: true };
        const want = prevVariantP2Ref.current;
        const ok = (want === 'white' && allowed.white) || (want === 'black' && allowed.black) || (want === 'color' && allowed.color);
        if (ok) setFirstContactVariantP2(want);
      }
      wasColorOnlyP2Ref.current = false;
    }
  }, [isColorOnlyP2, firstContactVariantP2, stripeVariantVisibility]);

  // Pàgina 2: si austen deshabilita color (Crosswords, Pemberley, Quotes), forçar white
  useEffect(() => {
    if (active !== 'austen') return;
    if (!austenSelectedDisableMulti) return;
    if (firstContactVariantP2 !== 'color') return;
    setFirstContactVariantP2('white');
  }, [active, austenSelectedDisableMulti, firstContactVariantP2]);

  // Pàgina 2: validar variant contra stripeVariantVisibility
  useEffect(() => {
    try {
      if (!active) return;
      if (active === 'the_human_inside') return;
      if (active === 'cube') return;
      if (active === 'austen' && austenSubcollection === 'looking_for_my_darcy') return;
      const allowed = stripeVariantVisibility || { white: true, black: true, color: true };
      const want = firstContactVariantP2;
      const ok = (want === 'white' && allowed.white) || (want === 'black' && allowed.black) || (want === 'color' && allowed.color);
      if (ok) return;
      if (allowed.white) setFirstContactVariantP2('white');
      else if (allowed.black) setFirstContactVariantP2('black');
      else if (allowed.color) setFirstContactVariantP2('color');
    } catch {
      /* s'ignora a posta */
    }
  }, [active, stripeVariantVisibility, firstContactVariantP2, austenSubcollection]);


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
    drawingOverlaySrcEffective,
    tileGapPxLocal,
  } = useMegaStripeDebugVars(normalizeOverlaySrc, 'p1');

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
            if (k === 'arthur d the second' || k === 'arthur-d-the-second') return '/custom_logos/drawings/images_stripe/miscellania/color/arthur-d-the-second-multi-light-stripe.webp';
            if (k === 'r2d2 quote' || k === 'r2d2-quote') return '/custom_logos/drawings/images_stripe/miscellania/color/r2d2-quote-multi-light-stripe.webp';
          }

          if (firstContactVariant === 'white') {
            if (k === 'dj vader' || k === 'dj-vader') return '/custom_logos/drawings/images_stripe/miscellania/white/dj-vader-w-stripe.webp';
            if (k === 'deathstar2d2' || k === 'death star2d2' || k === 'death-star2d2') return '/custom_logos/drawings/images_stripe/miscellania/white/death-star2d2-w-stripe.webp';
            if (k === 'pont del diable' || k === 'pont-del-diable') return '/custom_logos/drawings/images_stripe/miscellania/white/pont-del-diable-w-stripe.webp';
            if (k === 'arthur d the second' || k === 'arthur-d-the-second') return '/custom_logos/drawings/images_stripe/miscellania/white/arthur-d-the-second-w-stripe.webp';
            if (k === 'r2d2 quote' || k === 'r2d2-quote') return '/custom_logos/drawings/images_stripe/miscellania/white/r2d2-quote-w-stripe.webp';
          }

          if (k === 'dj vader' || k === 'dj-vader') return '/custom_logos/drawings/images_stripe/miscellania/black/dj-vader-b-stripe.webp';
          if (k === 'deathstar2d2' || k === 'death star2d2' || k === 'death-star2d2') return '/custom_logos/drawings/images_stripe/miscellania/black/death-star2d2-b-stripe.webp';
          if (k === 'pont del diable' || k === 'pont-del-diable') return '/custom_logos/drawings/images_stripe/miscellania/black/pont-del-diable-b-stripe.webp';
          if (k === 'arthur d the second' || k === 'arthur-d-the-second') return '/custom_logos/drawings/images_stripe/miscellania/black/arthur-d-the-second-b-stripe.webp';
          if (k === 'r2d2 quote' || k === 'r2d2-quote') return '/custom_logos/drawings/images_stripe/miscellania/black/r2d2-quote-b-stripe.webp';
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
            if (lower.includes('arthur-d-the-second')) return '/custom_logos/drawings/images_stripe/miscellania/color/arthur-d-the-second-multi-light-stripe.webp';
            if (lower.includes('r2d2-quote')) return '/custom_logos/drawings/images_stripe/miscellania/color/r2d2-quote-multi-light-stripe.webp';
          }
          if (firstContactVariant === 'white') {
            if (lower.includes('dj-vader')) return '/custom_logos/drawings/images_stripe/miscellania/white/dj-vader-w-stripe.webp';
            if (lower.includes('death-star2d2')) return '/custom_logos/drawings/images_stripe/miscellania/white/death-star2d2-w-stripe.webp';
            if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
              return '/custom_logos/drawings/images_stripe/miscellania/white/pont-del-diable-w-stripe.webp';
            }
            if (lower.includes('arthur-d-the-second')) return '/custom_logos/drawings/images_stripe/miscellania/white/arthur-d-the-second-w-stripe.webp';
            if (lower.includes('r2d2-quote')) return '/custom_logos/drawings/images_stripe/miscellania/white/r2d2-quote-w-stripe.webp';
          }
          if (lower.includes('dj-vader')) return '/custom_logos/drawings/images_stripe/miscellania/black/dj-vader-b-stripe.webp';
          if (lower.includes('death-star2d2')) return '/custom_logos/drawings/images_stripe/miscellania/black/death-star2d2-b-stripe.webp';
          if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
            return '/custom_logos/drawings/images_stripe/miscellania/black/pont-del-diable-b-stripe.webp';
          }
          if (lower.includes('arthur-d-the-second')) return '/custom_logos/drawings/images_stripe/miscellania/black/arthur-d-the-second-b-stripe.webp';
          if (lower.includes('r2d2-quote')) return '/custom_logos/drawings/images_stripe/miscellania/black/r2d2-quote-b-stripe.webp';
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
    if (active !== 'cube') return;
    const unique = new Set(Object.values(CUBE_MEDIA));
    for (const src of unique) {
      if (src) preloadSrc(src);
    }
  }, [active]);

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

      const P1 = 'p1_';
      const readKeyP1 = (key) => {
        try {
          const v = window.localStorage.getItem(`${P1}${key}`);
          if (v != null) return v;
          return window.localStorage.getItem(key);
        } catch {
          return null;
        }
      };
      const hasV2 = (() => {
        try {
          const a = readKeyP1('MEGA_TILE_SELECTOR_V2_ENABLED');
          const b = readKeyP1('MEGA_TILE_SELECTOR_V2_TARGET');
          const c = readKeyP1('MEGA_TILE_SELECTOR_V2_SIZE_PX');
          const d = readKeyP1('MEGA_TILE_SELECTOR_V2_STROKE_PX');
          const e = readKeyP1('MEGA_TILE_SELECTOR_V2_COLOR');
          const f = readKeyP1('MEGA_TILE_SELECTOR_V2_STEP_X');
          const g = readKeyP1('MEGA_TILE_SELECTOR_V2_STEP_Y');
          return a != null || b != null || c != null || d != null || e != null || f != null || g != null;
        } catch {
          return false;
        }
      })();

      const readBool = (key, fallback) => {
        const raw = readKeyP1(key);
        if (raw == null) return fallback;
        const v = String(raw).trim().toLowerCase();
        if (v === '') return true;
        return v === '1' || v === 'true' || v === 'on' || v === 'yes';
      };

      const v1Enabled = readBool('MEGA_TILE_SELECTOR_ENABLED', true);
      const v2Enabled = readBool('MEGA_TILE_SELECTOR_V2_ENABLED', hasV2 ? false : true);
      const activeKeyset = v2Enabled ? 'v2' : (v1Enabled ? 'v1' : 'v2');
      const K = (suffix) => (activeKeyset === 'v2' ? `MEGA_TILE_SELECTOR_V2_${suffix}` : `MEGA_TILE_SELECTOR_${suffix}`);

      const readNum = (key, fallback) => {
        const raw = readKeyP1(key);
        const n = raw == null ? NaN : Number.parseFloat(String(raw));
        return Number.isFinite(n) ? n : fallback;
      };
      return {
        keyset: activeKeyset,
        enabled: readBool(K('ENABLED'), activeKeyset === 'v2' ? false : true),
        target: String(readKeyP1(K('TARGET')) || 'NCC-1701-D'),
        sizePx: Math.min(800, Math.max(20, readNum(K('SIZE_PX'), 200))),
        strokePx: Math.min(80, Math.max(0, readNum(K('STROKE_PX'), 10))),
        color: String(readKeyP1(K('COLOR')) || 'black'),
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

    const P1 = 'p1_';
    const readKeyP1 = (key) => {
      try {
        const v = window.localStorage.getItem(`${P1}${key}`);
        if (v != null) return v;
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    };
    const read = () => {
      try {
        const activeNow = String(activeRef.current || '');
        const hasV2 = (() => {
          try {
            const a = readKeyP1('MEGA_TILE_SELECTOR_V2_ENABLED');
            const b = readKeyP1('MEGA_TILE_SELECTOR_V2_TARGET');
            const c = readKeyP1('MEGA_TILE_SELECTOR_V2_SIZE_PX');
            const d = readKeyP1('MEGA_TILE_SELECTOR_V2_STROKE_PX');
            const e = readKeyP1('MEGA_TILE_SELECTOR_V2_COLOR');
            const f = readKeyP1('MEGA_TILE_SELECTOR_V2_STEP_X');
            const g = readKeyP1('MEGA_TILE_SELECTOR_V2_STEP_Y');
            return a != null || b != null || c != null || d != null || e != null || f != null || g != null;
          } catch {
            return false;
          }
        })();

        const readBool = (key, fallback) => {
          const raw = readKeyP1(key);
          if (raw == null) return fallback;
          const v = String(raw).trim().toLowerCase();
          if (v === '') return true;
          return v === '1' || v === 'true' || v === 'on' || v === 'yes';
        };

        const v1Enabled = readBool('MEGA_TILE_SELECTOR_ENABLED', true);
        const v2Enabled = readBool('MEGA_TILE_SELECTOR_V2_ENABLED', hasV2 ? false : true);
        const activeKeyset = v2Enabled ? 'v2' : (v1Enabled ? 'v1' : 'v2');
        const K = (suffix) => (activeKeyset === 'v2' ? `MEGA_TILE_SELECTOR_V2_${suffix}` : `MEGA_TILE_SELECTOR_${suffix}`);

        const readNum = (key, fallback) => {
          const raw = readKeyP1(key);
          const n = raw == null ? NaN : Number.parseFloat(String(raw));
          return Number.isFinite(n) ? n : fallback;
        };
        setMegaTileSelectorParams({
          keyset: activeKeyset,
          enabled: readBool(K('ENABLED'), activeKeyset === 'v2' ? false : true),
          target: (() => {
            const publicState = getMegaPublicSelectorFor(activeNow, activeKeyset);
            const t = typeof publicState?.target === 'string' ? publicState.target.trim() : '';
            return t ? t : String(readKeyP1(K('TARGET')) || 'NCC-1701-D');
          })(),
          sizePx: Math.min(800, Math.max(20, readNum(K('SIZE_PX'), 200))),
          strokePx: Math.min(80, Math.max(0, readNum(K('STROKE_PX'), 10))),
          color: String(readKeyP1(K('COLOR')) || 'black'),
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
      const bareKey = e.key.startsWith('p1_') ? e.key.slice(3) : e.key;
      if (
        bareKey === 'MEGA_TILE_SELECTOR_ENABLED'
        || bareKey === 'MEGA_TILE_SELECTOR_TARGET'
        || bareKey === 'MEGA_TILE_SELECTOR_SIZE_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_STROKE_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_COLOR'
        || bareKey === 'MEGA_TILE_SELECTOR_STEP_X'
        || bareKey === 'MEGA_TILE_SELECTOR_STEP_Y'
        || bareKey === 'MEGA_TILE_SELECTOR_RADIUS_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_EXTEND_TOP_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_EXTEND_RIGHT_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_EXTEND_BOTTOM_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_EXTEND_LEFT_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_V2_ENABLED'
        || bareKey === 'MEGA_TILE_SELECTOR_V2_TARGET'
        || bareKey === 'MEGA_TILE_SELECTOR_V2_SIZE_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_V2_STROKE_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_V2_COLOR'
        || bareKey === 'MEGA_TILE_SELECTOR_V2_STEP_X'
        || bareKey === 'MEGA_TILE_SELECTOR_V2_STEP_Y'
        || bareKey === 'MEGA_TILE_SELECTOR_V2_RADIUS_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_V2_EXTEND_TOP_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_V2_EXTEND_RIGHT_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_V2_EXTEND_BOTTOM_PX'
        || bareKey === 'MEGA_TILE_SELECTOR_V2_EXTEND_LEFT_PX'
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

  // Alcada de la filera de la franja (les samarretes): 0,9 vegades el tile. El
  // tile ja és una mida de DISSENY del carril (vegeu `contentW` més amunt), així
  // que la franja s'encongeix amb el carril on es pinta (`carrilPx` a
  // MegaStripePanel i MegaStripePanelP1) i no abans.
  const stripePreviewHPx = Math.round((effectiveMegaTileSize || 240) * 0.9);

  // AQUESTA MESURA ES QUEDA, i es fa abans del pintat.
  //
  // El pla la proposava convertir al model, pero el valor es el `padding` del
  // panell del megaslide, que depen de les seves classes responsives: mesurat a
  // 768/1024/1280/1366/1440/1920 dona 32/32/38/38/32/32, o sigui que no es cap
  // funcio neta de l'amplada. Com que depen del contingut real, es queda
  // mesurat amb `useLayoutEffect` (ABANS del pintat), que es exactament el que
  // demanava la revisio externa per a les mesures de classe (b).
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

    let raf = 0;
    // El cadenat va enganxat al cantell del panell, pero amb una mica d'alisada:
    // el panell tambe fixa la seva alcada per estat i mentre encaixa fa graons
    // (fins a 35 px d'un fotograma a l'altre). Aqui llegim la vora a cada
    // fotograma i ens hi acostem com a maxim 4 px per fotograma, aixi els
    // graons es converteixen en un lliccament i no en saltets.
    const PAS_MAX_PX = 18;
    let pintat = null;
    const seguiment = () => {
      try {
        const surface = document.querySelector('[data-mega-panel-surface="1"]');
        const wrap = lockWrapRef.current;
        if (surface) {
          const rect = surface.getBoundingClientRect();
          // La linia es la vora inferior (border-b): en descomptem mig gruix.
          const gruixVora = parseFloat(getComputedStyle(surface).borderBottomWidth) || 0;
          const objectiu = rect.bottom - gruixVora / 2 + CADE_BAIXADA_PX;
          if (pintat == null) {
            pintat = objectiu;
          } else {
            const delta = objectiu - pintat;
            pintat += Math.abs(delta) <= 0.05
              ? delta
              : Math.max(-PAS_MAX_PX, Math.min(PAS_MAX_PX, delta * 0.5));
          }
          // El contenidor nomes hi es quan el cadenat ja s'ha muntat: fins
          // llavors nomes cal desar la mesura perque es munti.
          if (wrap) wrap.style.top = `${pintat}px`;
          setLockBtnTop((prev) => (prev == null ? objectiu - CADE_BAIXADA_PX : prev));
        }
      } catch { /* ignore */ }
      raf = requestAnimationFrame(seguiment);
    };
    raf = requestAnimationFrame(seguiment);
    return () => cancelAnimationFrame(raf);
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
      // El vertical es la mateixa pagina que l'apaisada d'un iPad (1024): el
      // contingut te 992 px d'amplada i el que no hi cap s'hi arriba
      // desplacant. D'aquesta amplada en surten les mides del selector i de la
      // franja, aixi que ha de coincidir amb la de l'apaisada.
      // A tauleta, el contingut va un 0,5% mes petit (ho demana el disseny);
      // desktop es queda igual.
      // A l'escriptori el tile surt del CARRIL (1350 px de referencia), no de
      // l'amplada del panell: el panell es queda a 1350 fins que la finestra
      // baixa de ~1430, i si el tile en sortis, a 1280 faria 121 px (com si el
      // carril fes 1350) i ni la franja ni el selector del megaslide
      // s'encongirien amb el carril. A tauleta es manté la seva calibració.
      // A l'apaisada la calibracio es la de la tauleta de 1024, tambe si la
      // finestra es mes ampla: si el tile sortis de `w`, a 1280 en faria 122 i
      // la franja 131 px d'alcada (enorme) mentre les graelles del megaslide
      // fan el carril de 992 (tile 93,6). Amb `Math.min(w, 1024)` la tauleta no
      // es toca i el 1280 fa exactament la seva mida.
      // Les DUES tauletes fan servir la mateixa amplada de contingut: la d'un
      // iPad de 1024 en apaisada amb el coixí de disseny (40+40), no el que es
      // mesura a cada orientacio (a la vertical el panell en te 48 i el tile en
      // sortia 97,2 en comptes de 93,7). La vertical es la mateixa pagina que
      // l'apaisada i, si no, el selector i la franja no coincidien.
      const contentW = (isPortraitTablet || isLandscapeTablet)
        ? 1024 * 0.995 - 80
        : MEGASLIDE_REFERENCIA_PX - pl - pr;
      if (!contentW) return;
      const totalGaps = (COLS - 1) * GAP_PX;
      const colW = (contentW - totalGaps) / COLS;
      if (!Number.isFinite(colW) || colW <= 0) return;
      // Cap màxim per evitar sobreescalat a viewport amples / zoom alts
      // (1400px max-content design ⇒ tile ≈ 136px). Cap a 144px.
      const MAX_TILE_PX = 144;
      const computedTile = Math.min(colW, MAX_TILE_PX);
      setMegaTileSize(computedTile);
      // En portrait tablet, el mega-slide usa scroll horitzontal amb el
      // contingut a escala landscape. El grid ha de mantenir l'escala 0.94.
      document.documentElement.style.setProperty('--hgGridFitScale', '0.94');
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
  }, [active, isPortraitTablet]);

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
  const logoMarkRef = useRef(null);
  const accountButtonRef = useRef(null);
  const searchGridRowRef = useRef(null);
  const searchGridScrollRef = useRef(null);
  // Expansio del "bleed guard" de la franja: es el PADDING horitzontal del seu
  // pare (24 px a 768 i menys, 40 px a partir d'aqui). Son dos valors i tots dos
  // es coneixen per la mida de la finestra, aixi que no cal mesurar-los:
  // mesurat a 768/1024/1280/1366/1440/1920 dona 24/40/40/40/40/40 i amb el
  // valor bo el guard acaba exactament al marc del pare.
  //
  // Abans es calculava comparant el marc del megaslide amb el de la capcalera,
  // amb resize, scroll i dos setTimeouts; el resultat arribava despres del
  // pintat i obligava a un estat que provocava re-renders del header.
  const ampladaFinestra = typeof window !== 'undefined' ? window.innerWidth : 0;
  const expansioBleed = ampladaFinestra > 768 ? 40 : 24;
  const bleedGuardExpandPx = { left: expansioBleed, right: expansioBleed };
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

  // El cadenat només té sentit amb el panell obert: quan es tanca (logo, nav,
  // canvi de ruta...) la propera obertura ha d'arrencar desbloquejada.
  useEffect(() => {
    if (!active) setMegaLocked(false);
  }, [active]);

  useEffect(() => {
    const openFullWideCart = (e) => {
      const { item } = (e && e.detail) || {};
      if (item) {
        // La fusió de línies iguals (mateix producte, talla, color i acabat) la
        // fa el cistell únic. Abans es comparava per títol i color, i dos
        // productes amb el mateix títol s'ajuntaven en una sola línia.
        addToCart(item);
        return;
      }
      setMegaPage(3);
      setAcordioExpanded(false);
      setMegaFullScreen(false);
      ensureMegaOpen();
      touchMegaPublicActivity();
    };

    window.addEventListener('hg:open-full-wide-cart', openFullWideCart);
    return () => window.removeEventListener('hg:open-full-wide-cart', openFullWideCart);
  }, [setMegaPage, setAcordioExpanded]);

  useEffect(() => {
    const openUserTab = (e) => {
      (e && e.detail) || {};
      setMegaPage(4);
      setAcordioExpandedPage4(true);
      setManualOverrideClosed(false);
      ensureMegaOpen();
      touchMegaPublicActivity();
    };
    window.addEventListener('hg:open-user-tab', openUserTab);
    return () => window.removeEventListener('hg:open-user-tab', openUserTab);
  }, [setMegaPage, setAcordioExpandedPage4]);



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
        // La tauleta te les seves alcades calibrades i el seu belt de 992: no
        // s'escala mai. L'escriptori (inclosa la banda estreta) si.
        const beltFinal = (isPortraitTablet || isLandscapeTablet) ? 992 : beltWidth;
        root.style.setProperty('--hg-mega-w', `${beltFinal}px`);
        // Quan el carril te una amplada propia (tauleta: 992) la seva posicio
        // tambe: CENTRAT a l'espai de maquetacio. El `belt.left` es el del marc
        // del lloc (a 1280, 16) i amb 992 el carril no hi queia: la fila 1 del
        // megaslide anava a 174 i el logo del header a 219.
        const vpLayout = Math.max(0, (document.documentElement.clientWidth || window.innerWidth || 0));
        const xFinal = (beltFinal !== beltWidth && !isPortraitTablet)
          ? Math.max(0, Math.round((vpLayout - beltFinal) / 2))
          : belt.left;
        root.style.setProperty('--hg-mega-x', `${xFinal}px`);
        // La FRANJA central: del left del logo al right de la icona d'usuari.
        // Es la mesura que han de fer servir les peces que hi han d'encaixar
        // (la fila 1 del megaslide i el cistell).
        //
        // COMPTE: mesurar-la del DOM es fragil. La primera versio buscava
        // `#stripe-guide-header-logo-anchor` a tot el document i trobava una
        // copia dins del megaslide: a 768 publicava 1302 px i el cistell se
        // n'anava a 1302 en una pantalla de 768. Ara: (1) es busca NOMES dins
        // del `header`; (2) es descarta qualsevol mesura que surti de la
        // pantalla; (3) si no n'hi ha cap de bona, es calcula: la fila del
        // header fa el carril menys els seus coixins (40/1350 per banda), i a
        // la vertical fa el marc del lloc menys els coixins de 24.
        try {
          let franja = 0;
          const headerEl = document.querySelector('header');
          const logoEl = headerEl ? headerEl.querySelector('#stripe-guide-header-logo-anchor') : null;
          const fila = logoEl ? logoEl.closest('div.flex.h-20') : null;
          const fills = fila ? [...fila.children].filter((c) => c.getBoundingClientRect().width > 0) : [];
          const iconesEl = fills.length ? fills[fills.length - 1] : null;
          if (logoEl && iconesEl) {
            const l = logoEl.getBoundingClientRect();
            const r = iconesEl.getBoundingClientRect();
            const mesura = r.right - l.left;
            // Ha de cabre a la pantalla i comenc,ar-hi a dins.
            if (l.left >= -1 && r.right <= vpLayout + 1 && mesura > 0 && mesura <= vpLayout) franja = mesura;
          }
          if (!franja) {
            if (isPortraitTablet) {
              const siteW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-w')) || 0;
              franja = Math.max(0, (siteW > 0 ? siteW : Math.min(736, vpLayout)) - 48);
            } else {
              franja = beltFinal * (1 - 80 / 1350);
            }
          }
          if (franja > 0) root.style.setProperty('--hg-band-w', `${Math.round(franja)}px`);
        } catch { /* ignore */ }
        // L'UNICA font de l'escala del megaslide. La fan servir la franja i,
        // mes endavant, les coordenades del panell. La graella de dibuixos ja
        // s'hi adapta sola (mesura l'amplada de la seva columna).
        root.style.setProperty('--hg-escala-mega', String((isPortraitTablet || isLandscapeTablet) ? 1 : escalaMegaslide(beltWidth)));
      } catch {
        // ignore
      }

      const nextScale = clampNumber(beltWidth / 1350, 0.5, 1, 1);
      setAccordionPautaScale((prev) => (Math.abs(prev - nextScale) < 0.005 ? prev : nextScale));
    };

    measure();
    // Re-mesura després del següent paint i també després de 200ms
    // per assegurar que --belt2-xL/xR s'han actualitzat al DOM
    const rafId = requestAnimationFrame(measure);
    const timeoutId = window.setTimeout(measure, 200);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [isPortraitTablet, isLandscapeTablet]);

  const isManualLockEnabled = () => {
    if (typeof manualEnabledOverride === 'boolean') return manualEnabledOverride;
    if (demoManualEnabled) return true;
    try {
      return window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1';
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!active || megaPage !== 2) return undefined;
    const id = window.setInterval(() => {
      setSearchCaretVisible((v) => !v);
    }, 520);
    return () => window.clearInterval(id);
  }, [active, megaPage]);







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
      /* s'ignora a posta */
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
      /* s'ignora a posta */
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

  // Imatge base de la franja per a la pàgina 2.
  const stripeBaseImageSrc = '/placeholders/cercador/full-white-stripe.webp?v=2866';

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
      setFirstContactSelectedItem(fallbackItem);
      const keyset = String(megaTileSelectorParams?.keyset || 'v1');
      setMegaPublicSelectorFor(active, keyset, { target: fallbackItem, stepX: 0, stepY: 0 });
      window.dispatchEvent(new Event('mega-tile-selector-changed'));
      return;
    }

    if (active === 'the_human_inside') {
      setHumanInsideSelectedItem(fallbackItem);
      const keyset = String(megaTileSelectorParams?.keyset || 'v1');
      setMegaPublicSelectorFor(active, keyset, { target: fallbackItem, stepX: 0, stepY: 0 });
      window.dispatchEvent(new Event('mega-tile-selector-changed'));
      return;
    }

    setSelectedItemByCollection((prev) => ({ ...prev, [active]: fallbackItem }));

    const keyset = String(megaTileSelectorParams?.keyset || 'v1');
    setMegaPublicSelectorFor(active, keyset, { target: fallbackItem, stepX: 0, stepY: 0 });
    window.dispatchEvent(new Event('mega-tile-selector-changed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

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
      if (megaLocked) return;
      setActive(null);
      // NOTA: aquí hi havia `setMobileOpen(false)`, però aquest estat no
      // existeix enlloc del fitxer (és una resta d'una refactorització).
      // La crida llançava "ReferenceError: setMobileOpen is not defined"
      // cada cop que es premia Escape.
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [demoManualEnabled, megaLocked]);

  useEffect(() => {
    let mounted = true;
    getGildan64000Catalog().then((catalog) => {
      if (mounted) setGildan64000Catalog(catalog);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    if (gildan64000Catalog) return;
    let cancelled = false;
    getGildan64000Catalog()
      .then((data) => {
        if (cancelled) return;
        setGildan64000Catalog(data);
      })
      .catch(() => {
        if (cancelled) return;
        setGildan64000Catalog({ selected: [], selectedSlugs: new Set(), getPlaceholderSrc: () => null });
      });
    return () => {
      cancelled = true;
    };
  }, [active, gildan64000Catalog]);

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
    if (!active) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [contained, active]);

  const canUseDom = typeof document !== 'undefined';


  return (
    <header
      ref={headerRef}
      className={`${contained ? 'relative' : 'fixed'} z-[10000] ${isLandscapeTablet && active ? 'bg-transparent' : 'bg-background'}`}
      onMouseLeave={(e) => {
        if (isManualLockEnabled()) return;
        if (megaAccordionLocked) return;
        if (megaLocked) return;
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

      {/* La linia de sota la capcalera: a la vertical ve del nav que hi ha a
          sota, pero a l'escriptori i a l'apaisada el nav va dins la barra i el
          border-b era transparent, aixi que no es veia. Li posem el mateix
          color que fa servir la vertical (#E6E8EC). */}
      {/* A la vertical el megaslide viu DINS d'aquest header i, com que va
          despres al DOM, es pintava per damunt de la barra i es menjava els
          clics de la lupa. La barra va un punt per sobre. */}
      <div
        className={`${isPortraitTablet ? '' : 'border-b'} relative bg-background`}
        style={{ zIndex: isPortraitTablet ? 10001 : undefined, ...(isPortraitTablet ? {} : { borderBottomColor: '#E6E8EC' }) }}
      >
        <div
          className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-10"
          style={{
            // A la vertical el separador ha de quedar AL MIG de l'espai que
            // ocupen les dues capçaleres (123 px): 61 px a dalt i 62 a baix.
            // El contingut es centra dins el seu tros amb `items-center`.
            height: isPortraitTablet ? '61px' : undefined,
            // La capçalera viu al MATEIX carril que el megaslide i les bandes
            // (70,3vw, centrat): a 1440 el marc del lloc feia 1350 px i el
            // carril 1013, i el logo quedava 128 px a l'esquerra del contingut
            // del megaslide.
            //
            // Nomes a la VERTICAL es queda el marc del lloc (`--site-w`): alla
            // el carril fa 992 px i es mes ample que la pantalla, i la
            // capcalera no s'hi pot desplacar. A l'escriptori I a l'apaisada
            // va amb el carril: a 1280 el marc del lloc fa 1248 i el carril
            // 992, i el logo (i la fila 1 del megaslide) no encaixaven.
            width: isPortraitTablet ? 'var(--site-w, 100%)' : 'var(--hg-mega-w, 70.3vw)',
            marginLeft: isPortraitTablet
              ? 'calc(var(--site-xL, 0px) - var(--rulerInset, 0px))'
              : 'calc(var(--hg-mega-x, 0px) - var(--rulerInset, 0px))',
            // El coixí i la separació de la fila tambe son mides del carril
            // (40 i 12 px de 1350): amb el coixí fix, a 1280 el nav no hi
            // cabia dins el carril (li faltaven 31 px) i s'amagava sota el
            // logo. Amb `carrilLane` el coixí es el MATEIX 3% del carril que
            // deixen les graelles del megaslide, aixi la fila 1 hi encaixa
            // exactament. A la vertical es queden les classes.
            paddingLeft: isPortraitTablet ? undefined : carrilLane(40),
            paddingRight: isPortraitTablet ? undefined : carrilLane(40),
            // El gap es tambe una mida del carril, i es el que fa que el nav hi
            // cabi: a 1280 el seu contingut demanava 5,5 px mes del que li
            // deixaven logo i icones, i la icona d'usuari queia 5,5 px mes
            // enlla de la franja. Com que el nav va centrat, el gap no es veu:
            // nomes li canvia l'espai disponible.
            columnGap: esTauleta ? undefined : carrilPx(6),
          }}
        >
          <div className="flex items-center gap-2 lg:gap-2">
            {/* Logo a l'esquerra (desktop + tablet vertical) */}
            <Link id="stripe-guide-header-logo-anchor" to="/" aria-label="Higgins GRÀFIC - Pàgina d'inici" onClick={() => { if (active) closeMegaExplicitly(); }} className="relative z-10 pointer-events-auto hidden md:flex items-center gap-2 font-black tracking-tight text-foreground">
              <span
                id="stripe-guide-header-logo-mark-anchor"
                ref={logoMarkRef}
                aria-hidden="true"
                data-brand-logo="1"
                className="block text-foreground"
                style={{
                  width: carrilPx(140),
                  height: carrilPx(32),
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

          {/* Mòbil: logo centrat en X respecte al viewport */}
          <Link
            to="/"
            aria-label="Higgins GRÀFIC - Pàgina d'inici"
            onClick={() => { if (active) closeMegaExplicitly(); }}
            className="md:hidden absolute z-10 pointer-events-auto flex items-center gap-2 font-black tracking-tight text-foreground"
            style={{
              left: '50vw',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span
              aria-hidden="true"
              data-brand-logo="1"
              className="h-10 w-[140px] block text-foreground"
              style={{
                backgroundColor: 'currentColor',
                WebkitMaskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                maskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
              }}
            />
          </Link>

          <nav className={`hidden md:flex flex-1 items-center justify-center gap-1 lg:gap-4 flex-nowrap ${esTauleta ? 'overflow-hidden' : ''} ${isPortraitTablet ? 'md:hidden' : ''}`} style={(isPortraitTablet || isLandscapeTablet) ? { gap: isLandscapeTablet ? '1rem' : '0.25rem', minWidth: 0, justifyContent: 'flex-start', marginLeft: isPortraitTablet ? '-60px' : undefined } : {
              // El -5% és un ajust òptic del nav (el desplaça cap a l'esquerra).
              // Dins el carril, a la banda estreta (768-1366) el nav no té marge
              // per a aquest desplaçament: el seu contingut ja hi va just i el
              // -5% el posava sota el logo (la «F» de FIRST CONTACT quedava
              // tallada a 1280).
              transform: esBandaEstreta ? 'none' : 'translateX(-5%)',
              columnGap: carrilPx(16),
            }}>
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
                  className={`inline-flex items-center gap-1 whitespace-nowrap font-semibold tracking-[0.04em] lg:tracking-[0.18em] uppercase ${open ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  // A l'escriptori la mida del nav tambe va amb el carril (com
                  // la resta del megaslide); a tauleta, la seva.
                  style={(isPortraitTablet || isLandscapeTablet) ? { letterSpacing: '0.04em', fontSize: isPortraitTablet ? '11.5px' : '12px', whiteSpace: 'nowrap' } : { whiteSpace: 'nowrap', fontSize: carrilPx(11) }}
                  aria-expanded={open ? 'true' : 'false'}
                  onClick={() => {
                    if (clicColleccioRepetit(item.id)) return;
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
                  <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
              );
            })}
          </nav>

          <div
            className="ml-auto hidden md:flex items-center"
            style={{ gap: '0px' }}
            data-icons-wrap="true"
          >
            <div>
              <Tooltip>
              <TooltipTrigger asChild>
              <IconButton
                label="Cercador i catàleg"
                onClick={() => {
                  // Un clic ràpid doble obriria i tancaria el mega-slide de cop.
                  // 620 ms: el calaix triga 320 ms a obrir-se o tancar-se, i
                  // mentre es mou un segon clic el faria rebotar.
                  if (clicRepetit(searchLastClickRef, 620)) return;
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
                <Search className="h-[25px] w-[25px] text-foreground -translate-x-[1px] lg:h-[29px] lg:w-[29px]" strokeWidth={2.5} />
              </IconButton>
              </TooltipTrigger>
              <TooltipContent>Cercador</TooltipContent>
              </Tooltip>
            </div>
            <Tooltip>
            <TooltipTrigger asChild>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                // Un clic ràpid doble obriria i tancaria el mega-slide de cop.
                if (clicRepetit(cartLastClickRef)) return;
                if (cartClickTimeoutRef.current) window.clearTimeout(cartClickTimeoutRef.current);
                cartClickTimeoutRef.current = window.setTimeout(() => {
                  cartClickTimeoutRef.current = null;
                  setManualOverrideClosed(false);
                  if (megaPage === 3 && active) {
                    // La icona del cistell, quan el cistell ja és obert, el
                    // TANCA. Abans, si hi havia articles, només obria i
                    // tancava l'acordió de la tauleta vertical: a l'escriptori
                    // no feia res (no es podia tancar amb la icona) i a la
                    // vertical feia créixer el panell fins a baix de tot, que
                    // no és el que s'espera d'un clic sobre la icona.
                    setAcordioExpanded(false);
                    setActive(null);
                  } else {
                    setMegaPage(3);
                    setAcordioExpanded(false);
                    if (!active) ensureMegaOpen();
                  }
                  touchMegaPublicActivity();
                }, dblClickDelayMs);
              }}
              aria-label={localCartItemCount > 0 ? `Cistell de la compra, ${localCartItemCount} ${localCartItemCount === 1 ? 'article' : 'articles'}` : 'Cistell de la compra buit'}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:h-10 lg:w-10"
              style={{ marginLeft: '1px' }}
            >
              <span aria-hidden="true" className="relative block h-[27px] w-[27px] transition-all duration-200 lg:h-[31px] lg:w-[31px]">
                <span
                  className="absolute inset-0"
                  style={{
                    display: 'block',
                    backgroundColor: 'currentColor',
                    WebkitMaskImage: `url(${localCartItemCount > 0 ? '/custom_logos/icons/cistell-ple-2.svg' : '/custom_logos/icons/cistell-buit.svg'})`,
                    maskImage: `url(${localCartItemCount > 0 ? '/custom_logos/icons/cistell-ple-2.svg' : '/custom_logos/icons/cistell-buit.svg'})`,
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                  }}
                />
                {localCartItemCount > 0 && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 text-whiteStrong text-[13.75px] font-bold lg:text-[16.25px]"
                    style={{ top: 'calc(60% - 0.5px)', transform: 'translate(-50%, -50%)', lineHeight: '1' }}
                  >
                    {localCartItemCount}
                  </span>
                )}
              </span>
            </button>
            </TooltipTrigger>
            <TooltipContent>Cistell</TooltipContent>
            </Tooltip>
            <div>
              <Tooltip>
              <TooltipTrigger asChild>
              <IconButton
                id="stripe-guide-user-icon-anchor"
                label={user ? "Compte d'usuari" : "Iniciar sessió"}
                buttonRef={accountButtonRef}
                onClick={(e) => {
                  e.preventDefault();
                  // Un clic ràpid doble obriria i tancaria el mega-slide de cop.
                  if (clicRepetit(accountLastClickRef)) return;
                  if (accountClickTimeoutRef.current) window.clearTimeout(accountClickTimeoutRef.current);
                  accountClickTimeoutRef.current = window.setTimeout(() => {
                    accountClickTimeoutRef.current = null;
                    setManualOverrideClosed(false);
                    if (megaPage === 4 && active && user) {
                      setActive(null);
                    } else if (megaPage === 4 && active && !user) {
                      setShowRegisterOverlay(true);
                    } else {
                      setMegaPage(4);
                      setAcordioExpandedPage4(false);
                      if (!active) ensureMegaOpen();
                      if (!user) setShowRegisterOverlay(true);
                    }
                    touchMegaPublicActivity();
                  }, dblClickDelayMs);
                }}
              >
                {user
                  ? <User className="h-[25px] w-[25px] text-foreground lg:h-[29px] lg:w-[29px]" strokeWidth={2.5} />
                  : <LogIn className="h-[25px] w-[25px] text-foreground lg:h-[29px] lg:w-[29px]" strokeWidth={2} />
                }
              </IconButton>
              </TooltipTrigger>
              <TooltipContent>Compte</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Segon header per portrait tablet — enllaços de col·leccions */}
      {isPortraitTablet && (
        <div
          className="bg-background flex items-center"
          style={{
            position: 'relative',
            zIndex: 10001,
            // Aquest segon header només surt a la tauleta vertical: es queda
            // amb el marc del lloc (vegeu el primer).
            width: 'var(--site-w, 100%)',
            marginLeft: 'calc(var(--site-xL, 0px) - var(--rulerInset, 0px))',
            borderTop: '1px solid #E6E8EC',
            // Els 62 px que queden dels 123, amb el contingut centrat.
            height: '62px',
          }}
        >
          {/* Sense desplaçament propi: el `nav` es centra dins la seva fila
              amb el `flex items-center` del contenidor. Abans portava
              `marginTop: 10px` i `translateY(4px)`, que eren per a l'alçada
              antiga de la fila (43 px); ara la fila fa 62 px i el contingut
              s'hi centra, aixi que aquests 14 px el descol·locaven. */}
          <nav className="flex items-center justify-center gap-6 px-10 py-2 flex-nowrap overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {resolvedNav.map((item) => {
              const open = active === item.id && megaPage === 1;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`inline-flex items-center gap-1 text-xs font-semibold tracking-[0.18em] uppercase whitespace-nowrap ${open ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-expanded={open ? 'true' : 'false'}
                  onClick={() => {
                    if (clicColleccioRepetit(item.id)) return;
                    setManualOverrideClosed(false);
                    setMegaFullScreen(false);
                    if (active === item.id && megaPage === 1) {
                      setActive(null);
                    } else {
                      setActive(item.id);
                      setMegaPage(1);
                      if (!active) ensureMegaOpen();
                    }
                    touchMegaPublicActivity();
                  }}
                >
                  {item.label}
                  <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
              );
            })}
          </nav>
        </div>
      )}
      {canUseDom && (!contained || portalContainer) &&
        ReactDOM.createPortal(
          active ? (
            <div
                className={`${contained ? 'absolute' : 'fixed'} inset-0 z-[9989]`}
                style={{
                  cursor: 'pointer',
                  pointerEvents: megaLocked ? 'none' : 'auto',
                }}
                onClick={() => { if (!megaLocked) setActive(null); }}
              />
          ) : null,
          portalContainer || document.body
        )}

      {/* El cadenat no es munta fins que no hi ha la primera mesura: així no
          apareix a la posició de reserva (a dalt de tot). I a la pàgina del
          cistell (3) no hi surt: allà no cal bloquejar el megaslide. */}
      {canUseDom && active && megaPage !== 3 && lockBtnTop != null && ReactDOM.createPortal(
        <div
          ref={lockWrapRef}
          style={{
            position: 'fixed',
            left: '50%',
            // El cadenat surt de sota el panell (vegeu mega-cadenat-surt) i
            // queda just a sota del separador.
            top: `${lockBtnTop + CADE_BAIXADA_PX}px`,
            // La sortida dura el mateix que l'ultim tram del panell i comença de
            // seguida, aixi el cadenat i la pestanya hi arriben alhora.
            animation: 'mega-cadenat-surt 250ms cubic-bezier(0.22, 1, 0.36, 1) 0ms both',
            // Per sota del panell (z-[10000]) perque el cadenat en surti de sota.
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <button
            onClick={() => setMegaLocked((v) => !v)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background shadow-lg transition-colors hover:bg-muted"
            style={{
              transition: 'background-color 150ms',
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
            title={megaLocked ? 'Desbloca el megaslide' : 'Bloca el megaslide'}
            aria-label={megaLocked ? 'Desbloca el megaslide' : 'Bloca el megaslide'}
          >
            {megaLocked ? <Lock size={22} /> : <Unlock size={22} />}
          </button>
        </div>,
        document.body
      )}

      <MegaMenuPanel
        active={active}
        megaPage={megaPage}
        megaFullScreen={megaFullScreen}
        megaMenuRef={megaMenuRef}
        effectiveMegaTileSize={effectiveMegaTileSize}
        stripeRowPadPx={stripeRowPadPx}
        bleedGuardExpandPx={bleedGuardExpandPx}
        showStripe={showStripe}
        resolvedMega={resolvedMega}
        stripeRowPadXPx={stripeRowPadXPx}
        stripePreviewHPx={stripePreviewHPx}
        stripeOverlayLoadState={stripeOverlayLoadState}
        resolvedOverlaySrc={resolvedOverlaySrc}
        stripeOverlayDebug={stripeOverlayDebug}
        stripeMaskDebugRectsPct={stripeMaskDebugRectsPct}
        stripeMaskTileRectsRawPct={stripeMaskTileRectsRawPct}
        megaStripeSpriteEnabledLocal={megaStripeSpriteEnabledLocal}
        megaStripeRefEnabledLocal={megaStripeRefEnabledLocal}
        megaStripeRefSrcLocal={megaStripeRefSrcLocal}
        megaStripeRef2EnabledLocal={megaStripeRef2EnabledLocal}
        megaStripeRef2SrcLocal={megaStripeRef2SrcLocal}
        megaShirtDrawingEnabledLocal={megaShirtDrawingEnabledLocal}
        drawingOverlaySrcEffective={drawingOverlaySrcEffective}
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
        setActive={setActive}
        austenSubcollection={austenSubcollection}
        setAustenSubcollection={setAustenSubcollection}
        cercadorSelectedColor={cercadorSelectedColor}
        setCercadorSelectedColor={setCercadorSelectedColor}
        firstContactSelectedItem={firstContactSelectedItem}
        humanInsideSelectedItem={humanInsideSelectedItem}
        selectedItemByCollection={selectedItemByCollection}
        hoveredStripeItem={hoveredStripeItem}
        setHoveredStripeItem={setHoveredStripeItem}
        hoveredStripeItemCollection={hoveredStripeItemCollection}
        setHoveredStripeItemCollection={setHoveredStripeItemCollection}
        megaHeroGridRef={megaHeroGridRef}
        megaHeroRowHeight={megaHeroRowHeight}
        stripeBaseImageSrc={stripeBaseImageSrc}
        resolvedMegaFiltered={resolvedMegaFiltered}
        humanInsideVariantP2={humanInsideVariantP2}
        firstContactVariantP2={firstContactVariantP2}
        setFirstContactVariantP2={setFirstContactVariantP2}
        setHumanInsideVariantP2={setHumanInsideVariantP2}
        displayedShirtColorP2={displayedShirtColorP2}
        onShirtClick={onShirtClick}
        onShirtClickP2={onShirtClickP2}
        cercadorSelectedColorP2={cercadorSelectedColorP2}
        setCercadorSelectedColorP2={setCercadorSelectedColorP2}
        thinDrawings={thinDrawings}
        cartItems={cartItems}
        setCartItems={setCartItems}
        localCartItemCount={localCartItemCount}
        megaAccordionLocked={megaAccordionLocked}
        acordioExpanded={acordioExpanded}
        setAcordioExpanded={setAcordioExpanded}
        touchMegaPublicActivity={touchMegaPublicActivity}
        accordionPautaScale={accordionPautaScale}
        orders={orders}
        adminEmail={adminEmail}
        acordioExpandedPage4={acordioExpandedPage4}
        setAcordioExpandedPage4={setAcordioExpandedPage4}
        isPortraitTablet={isPortraitTablet}
        isLandscapeTablet={isLandscapeTablet}
      />

      {canUseDom && showRegisterOverlay &&
        ReactDOM.createPortal(
          <RegisterOverlay onClose={() => setShowRegisterOverlay(false)} />,
          document.body
        )}

    </header>
  );
}

export default memo(FullWideSlideHeader);
