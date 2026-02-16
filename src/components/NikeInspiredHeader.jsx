import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, animate, useMotionValue } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, UserRound, Menu, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import SearchDialog from '@/components/SearchDialog';
import { useTexts } from '@/hooks/useTexts';

function NikeInspiredHeader({
  cartItemCount,
  onCartClick,
  onUserClick,
  offersHeaderVisible = false,
  adminBannerVisible = false,
  guidesOffsetPx = 0,
}) {
  const MOTION_DURATION = 0;
  const MOTION_EASE = [0, 0, 1, 1];

  const location = useLocation();
  const navigate = useNavigate();
  const texts = useTexts();

  const isNikeDemoRoute = location.pathname === '/nike-hero-demo' || location.pathname === '/nike-tambe';
  const [demoManualEnabled, setDemoManualEnabled] = useState(false);
  const [demoPhaseOverride, setDemoPhaseOverride] = useState(null);

  const forceMegaMenuOpen = isNikeDemoRoute && demoManualEnabled;
  const forceMegaMenuOpenRef = useRef(false);

  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const cartClickTimeoutRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const headerRef = useRef(null);
  const headerBarRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const navRef = useRef(null);
  const megaTableRef = useRef(null);
  const [navActiveColumns, setNavActiveColumns] = useState(null);
  const navLinkRefs = useRef({});
  const [navRestColumns, setNavRestColumns] = useState(null);
  const [navExpandedGapPx, setNavExpandedGapPx] = useState(35);
  const theHumanInsideRef = useRef(null);
  const [uniformColumnWidth, setUniformColumnWidth] = useState(null);
  const [firstColumnWidth, setFirstColumnWidth] = useState(null);
  const [cubeColumnWidth, setCubeColumnWidth] = useState(null);
  const firstContactRef = useRef(null);
  const outcastedRef = useRef(null);
  const cubeMaschinenRef = useRef(null);
  const [navTitlesOffsetX, setNavTitlesOffsetX] = useState(0);
  const [alignmentReady, setAlignmentReady] = useState(false);
  const navX = useMotionValue(0);
  const megaX = useMotionValue(0);
  const [expansionPhase, setExpansionPhase] = useState('rest');
  const hasAlignedRef = useRef(false);
  const closeTimerRef = useRef(null);
  const restAlignTimeoutRef = useRef(null);
  const megaAlignAnimRef = useRef(null);
  const expandedGroupsResetTimerRef = useRef(null);
  const closeCollectionsRafRef = useRef(null);
  const openCollectionsTimerRef = useRef(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [isClosingCollections, setIsClosingCollections] = useState(false);
  const [collectionsVisible, setCollectionsVisible] = useState(false);
  const [navHoverBridgeTopPx, setNavHoverBridgeTopPx] = useState(null);
  const MEGA_MENU_BASE_FONT_PX = 10.666;
  const MEGA_MENU_REST_FONT_PX = 10.666;
  const [megaMenuFontPx, setMegaMenuFontPx] = useState(MEGA_MENU_REST_FONT_PX);
  const lastMegaFontPxRef = useRef(MEGA_MENU_REST_FONT_PX);

  const writeNikeControls = ({ enabled, phase }) => {
    try {
      window.localStorage.setItem('NIKE_DEMO_MANUAL', enabled ? '1' : '0');
      if (enabled) {
        window.localStorage.setItem('NIKE_DEMO_PHASE', phase);
      } else {
        window.localStorage.removeItem('NIKE_DEMO_PHASE');
      }
      window.dispatchEvent(new Event('nike-demo-controls'));
    } catch {
      // ignore
    }
  };

  const topOffset = adminBannerVisible && offersHeaderVisible
    ? '80px'
    : adminBannerVisible
      ? '40px'
      : offersHeaderVisible
        ? '40px'
        : '0px';

  const topOffsetWithGuides = `calc(${topOffset} + ${guidesOffsetPx}px)`;

  useEffect(() => {
    const measure = () => {
      const el = headerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setHeaderHeight(Math.max(0, Math.round(rect.height)));
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [topOffset]);

  const navLinks = useMemo(() => {
    return [
      { name: texts?.header?.navigation?.firstContact || 'First Contact', href: '/first-contact' },
      { name: texts?.header?.navigation?.proves || 'Proves', href: '/proves' },
      { name: texts?.header?.navigation?.theHumanInside || 'The Human Inside', href: '/the-human-inside' },
      { name: texts?.header?.navigation?.austen || 'Austen', href: '/austen' },
      { name: texts?.header?.navigation?.cube || 'Cube', href: '/cube' },
      { name: texts?.header?.navigation?.outcasted || 'Outcasted', href: '/outcasted' },
    ];
  }, [texts]);

  const desktopNavLinks = useMemo(() => {
    return navLinks.filter((l) => (l.href || '').toString() !== '/proves');
  }, [navLinks]);

  const maybeOpenCollectionsFromNavPointer = (clientX) => {
    if (!clientX) return;
    const firstEl = firstContactRef.current;
    const lastEl = outcastedRef.current;
    if (!firstEl || !lastEl) return;

    const firstRect = firstEl.getBoundingClientRect();
    const lastRect = lastEl.getBoundingClientRect();
    if (clientX >= firstRect.left && clientX <= lastRect.right) {
      openCollections();
    }
  };

  const megaMenuColumns = useMemo(() => {
    const slugFromHref = (href) => (href || '').toString().replace(/^\//, '').trim();
    const safeText = (value) => (value || '').toString().trim();
    const normalizeKey = (value) => safeText(value).toLowerCase();
    const slugifyLocal = (value) => {
      const raw = safeText(value).toLowerCase();
      if (!raw) return '';
      return raw
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, 'and')
        .replace(/[’']/g, '')
        .replace(/\s+/g, '-')
        .replace(/_+/g, '-')
        .replace(/[^a-z0-9.-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };
    const prefixSlug = (collectionKey, maybeSlug) => {
      const s = slugifyLocal(maybeSlug);
      if (!s) return null;
      const c = slugifyLocal(collectionKey);
      if (!c) return s;
      if (s.startsWith(`${c}-`)) return s;
      return `${c}-${s}`;
    };

    // EXACT table content. Do not derive text from any other source.
    const TABLE_CONTENT = {
      'first-contact': [
        'NX-01',
        'NCC-1701',
        'NCC-1701',
        'The Phoenix',
        'Wormhole',
        'Plasma Escape',
        "Vulcan’s End",
      ],
      'the-human-inside': [
        'C3 P0',
        'Vade',
        'Afrodita A',
        'Mazinger Z',
        'Cylon 78',
        'Cylon 03',
        'Iron Man 68',
        'Iron Man 08',
        'Cyberman',
        'MaschinenMensch',
        'Robocop',
        'Terminator',
        'Robbie The Robot',
      ],
      austen: [
        { label: 'Persuasion', items: ['Encreuat 1', 'Encreuat 2', 'Encreuat 3', 'Encreuat 4'] },
        { label: 'Pride & Prejudice', items: ['Encreuat 1', 'Encreuat 2', 'Encreuat 3', 'Encreuat 4'] },
        { label: 'Sense & Sensibility', items: ['Encreuat 1', 'Encreuat 2', 'Encreuat 3', 'Encreuat 4'] },
        { label: 'Quotes', items: ['It Is A Truth', 'You Must Allow Me', 'Unsociable And Taciturn', 'You Have Bewitched Me', 'Half Agony, Half Hope'] },
        'Looking For My Darcy',
        'Keep Calm',
        'Pemberly House',
      ],
      cube: [
        'Afrodita C',
        'Cube 3 P0',
        'Cyber Cube',
        'Cylon Cube 03',
        'Darth Cube',
        'Iron Cube 08',
        'Iron Cube 68',
        'MaschinenCube',
        'Mazinger C',
        'RoboCube',
      ],
      outcasted: [
        'Arthur D. The Second',
        'Death Star2D2',
        { label: 'Dalek', items: ['Conquer!', 'Destroy!'] },
        'Dj Vader',
      ],
    };

    const buildGroups = (collectionKey, rows) => {
      const base = Array.isArray(rows) ? rows : [];

      // IMPORTANT: preserve exact order of the table rows.
      // Each flat row becomes its own entry so duplicates and ordering are retained.
      const entries = [];

      for (let i = 0; i < base.length; i += 1) {
        const row = base[i];

        if (row && typeof row === 'object' && !Array.isArray(row)) {
          const groupLabel = safeText(row.label);
          const groupItems = (Array.isArray(row.items) ? row.items : []).map((label) => {
            const l = safeText(label);
            const slug = prefixSlug(collectionKey, `${slugifyLocal(groupLabel)}-${slugifyLocal(l)}`);
            return {
              key: slug,
              name: l,
              href: `/product/${encodeURIComponent(slug)}`,
            };
          }).filter((x) => x.key);

          entries.push({
            key: `${slugifyLocal(groupLabel) || 'group'}-${i}`,
            label: groupLabel,
            items: groupItems,
          });
          continue;
        }

        const label = safeText(row);
        const slug = prefixSlug(collectionKey, slugifyLocal(label));
        entries.push({
          key: `row-${i}-${slug || normalizeKey(label)}`,
          label: null,
          items: [{
            key: slug,
            name: label,
            href: `/product/${encodeURIComponent(slug)}`,
          }],
        });
      }

      return entries;
    };

    return desktopNavLinks.map((c) => {
      const collectionKey = slugifyLocal(slugFromHref(c.href));
      const rows = TABLE_CONTENT[collectionKey] || [];
      const groups = buildGroups(collectionKey, rows);

      return {
        collectionKey,
        collectionName: c.name,
        collectionHref: c.href,
        groups,
      };
    });
  }, [desktopNavLinks]);

  useEffect(() => {
    forceMegaMenuOpenRef.current = forceMegaMenuOpen;
  }, [forceMegaMenuOpen]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        if (forceMegaMenuOpenRef.current) return;
        setActiveMenu(null);
        setMobileOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (expandedGroupsResetTimerRef.current) {
      window.clearTimeout(expandedGroupsResetTimerRef.current);
      expandedGroupsResetTimerRef.current = null;
    }

    if (!activeMenu) {
      setExpandedGroups({});
    }

    return undefined;
  }, [activeMenu]);

  useEffect(() => {
    if (isNikeDemoRoute) {
      const readControls = () => {
        try {
          const enabled = window.localStorage.getItem('NIKE_DEMO_MANUAL') === '1';
          const phase = window.localStorage.getItem('NIKE_DEMO_PHASE');
          setDemoManualEnabled(enabled);
          setDemoPhaseOverride(phase === 'rest' || phase === 'expanded' ? phase : null);
        } catch {
          setDemoManualEnabled(false);
          setDemoPhaseOverride(null);
        }
      };

      readControls();
      const onCustom = () => readControls();
      const onStorage = (e) => {
        if (e?.key === 'NIKE_DEMO_MANUAL' || e?.key === 'NIKE_DEMO_PHASE') {
          readControls();
        }
      };

      window.addEventListener('nike-demo-controls-changed', onCustom);
      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener('nike-demo-controls-changed', onCustom);
        window.removeEventListener('storage', onStorage);
      };
    }

    return undefined;
  }, [isNikeDemoRoute]);

  useEffect(() => {
    if (demoManualEnabled && demoPhaseOverride) {
      openCollections();
      setExpansionPhase(demoPhaseOverride);
      return undefined;
    }

    if (activeMenu !== 'collections') {
      setExpansionPhase('rest');
      return undefined;
    }

    setExpansionPhase('rest');
    const raf = window.requestAnimationFrame(() => setExpansionPhase('expanded'));
    return () => window.cancelAnimationFrame(raf);
  }, [activeMenu, demoManualEnabled, demoPhaseOverride]);

  useEffect(() => {
    if (expansionPhase === 'expanded') {
      if (lastMegaFontPxRef.current !== MEGA_MENU_BASE_FONT_PX) {
        lastMegaFontPxRef.current = MEGA_MENU_BASE_FONT_PX;
        setMegaMenuFontPx(MEGA_MENU_BASE_FONT_PX);
      }
      return undefined;
    }
    if (lastMegaFontPxRef.current !== MEGA_MENU_REST_FONT_PX) {
      lastMegaFontPxRef.current = MEGA_MENU_REST_FONT_PX;
      setMegaMenuFontPx(MEGA_MENU_REST_FONT_PX);
    }
    return undefined;
  }, [activeMenu, collectionsVisible, expansionPhase]);

  useEffect(() => {
    if (!collectionsVisible) return undefined;
    if (activeMenu !== 'collections') return undefined;
    if (expansionPhase === 'expanded') return undefined;

    const collectionKeyFromHref = (href) => (href || '').toString().replace(/^\//, '').trim();

    const measure = () => {
      const widths = [];
      for (const link of desktopNavLinks) {
        const key = collectionKeyFromHref(link.href);
        const el = navLinkRefs.current[key];
        if (!el) return;
        const w = Math.max(0, Math.round(el.getBoundingClientRect().width));
        if (!w) return;
        widths.push(w);
      }
      if (widths.length !== desktopNavLinks.length) return;
      const template = widths.map((w) => `${w}px`).join(' ');
      setNavRestColumns((prev) => (prev === template ? prev : template));
    };

    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(measure);
    });
    window.addEventListener('resize', measure);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [activeMenu, collectionsVisible, expansionPhase, desktopNavLinks]);

  useEffect(() => {
    if (!(collectionsVisible && expansionPhase === 'expanded')) {
      setNavHoverBridgeTopPx(null);
      return undefined;
    }

    const measure = () => {
      const navEl = navRef.current;
      const barEl = headerBarRef.current;
      if (!navEl || !barEl) return;
      const navRect = navEl.getBoundingClientRect();
      const barRect = barEl.getBoundingClientRect();
      const top = Math.max(0, Math.round(navRect.bottom - barRect.top));
      setNavHoverBridgeTopPx((prev) => (prev === top ? prev : top));
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [collectionsVisible, expansionPhase]);

  useEffect(() => {
    if (!uniformColumnWidth) return;

    const GAP_FALLBACK = 35;
    const expandedWidth = uniformColumnWidth * 5 + GAP_FALLBACK * 4;

    const widths = [];
    for (const link of desktopNavLinks) {
      const key = (link.href || '').toString().replace(/^\//, '').trim();
      const el = navLinkRefs.current[key];
      if (!el) return;
      const w = Math.max(0, Math.round(el.getBoundingClientRect().width));
      if (!w) return;
      widths.push(w);
    }

    if (widths.length !== desktopNavLinks.length) return;
    const sum = widths.reduce((acc, w) => acc + w, 0);
    const remaining = expandedWidth - sum;
    const nextGap = Math.max(0, Math.floor(remaining / 4));

    setNavExpandedGapPx((prev) => (prev === nextGap ? prev : nextGap));
  }, [desktopNavLinks, uniformColumnWidth]);

  useEffect(() => {
    const targetX = (activeMenu === 'collections' && expansionPhase === 'expanded' && alignmentReady) ? navTitlesOffsetX : 0;
    const controls = animate(navX, targetX, { duration: MOTION_DURATION, ease: MOTION_EASE });
    return () => controls.stop();
  }, [activeMenu, expansionPhase, navTitlesOffsetX, alignmentReady, navX, MOTION_DURATION, MOTION_EASE]);

  useEffect(() => {
    if (!collectionsVisible) {
      if (megaAlignAnimRef.current) {
        megaAlignAnimRef.current.stop();
        megaAlignAnimRef.current = null;
      }
      if (restAlignTimeoutRef.current) {
        window.clearTimeout(restAlignTimeoutRef.current);
        restAlignTimeoutRef.current = null;
      }
      megaX.set(0);
      return undefined;
    }
    if (activeMenu !== 'collections') {
      if (megaAlignAnimRef.current) {
        megaAlignAnimRef.current.stop();
        megaAlignAnimRef.current = null;
      }
      if (restAlignTimeoutRef.current) {
        window.clearTimeout(restAlignTimeoutRef.current);
        restAlignTimeoutRef.current = null;
      }
      megaX.set(0);
      return undefined;
    }
    if (expansionPhase === 'expanded') {
      if (restAlignTimeoutRef.current) {
        window.clearTimeout(restAlignTimeoutRef.current);
        restAlignTimeoutRef.current = null;
      }
      if (megaAlignAnimRef.current) {
        megaAlignAnimRef.current.stop();
        megaAlignAnimRef.current = null;
      }
      const target = alignmentReady ? -navTitlesOffsetX : 0;
      megaAlignAnimRef.current = animate(megaX, target, { duration: MOTION_DURATION, ease: MOTION_EASE });
      return () => {
        if (megaAlignAnimRef.current) {
          megaAlignAnimRef.current.stop();
          megaAlignAnimRef.current = null;
        }
      };
    }

    if (restAlignTimeoutRef.current) {
      window.clearTimeout(restAlignTimeoutRef.current);
      restAlignTimeoutRef.current = null;
    }

    const alignOnce = () => {
      const navEl = navRef.current;
      const tableEl = megaTableRef.current;
      if (!navEl || !tableEl) return;

      const navRect = navEl.getBoundingClientRect();
      const tableRect = tableEl.getBoundingClientRect();

      const navCenter = navRect.left + navRect.width / 2;
      const tableCenter = tableRect.left + tableRect.width / 2;
      const delta = navCenter - tableCenter;
      if (Math.abs(delta) < 0.5) return;

      const current = megaX.get();
      const target = current + delta;
      if (megaAlignAnimRef.current) {
        megaAlignAnimRef.current.stop();
        megaAlignAnimRef.current = null;
      }
      megaAlignAnimRef.current = animate(megaX, target, { duration: MOTION_DURATION, ease: MOTION_EASE });
    };

    const scheduleAlign = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(alignOnce);
      });
    };

    restAlignTimeoutRef.current = window.setTimeout(() => {
      scheduleAlign();
    }, 0);

    const raf = window.requestAnimationFrame(() => {
      scheduleAlign();
    });
    window.addEventListener('resize', scheduleAlign);
    return () => {
      window.cancelAnimationFrame(raf);
      if (restAlignTimeoutRef.current) {
        window.clearTimeout(restAlignTimeoutRef.current);
        restAlignTimeoutRef.current = null;
      }
      if (megaAlignAnimRef.current) {
        megaAlignAnimRef.current.stop();
        megaAlignAnimRef.current = null;
      }
      window.removeEventListener('resize', scheduleAlign);
    };
  }, [activeMenu, collectionsVisible, expansionPhase, megaX, alignmentReady, navTitlesOffsetX]);

  useEffect(() => {
    if (activeMenu !== 'collections') return;
    navX.set(0);
    setNavTitlesOffsetX(0);
    setAlignmentReady(false);
    hasAlignedRef.current = false;
  }, [activeMenu, navX]);

  useEffect(() => {
    if (activeMenu !== 'collections') {
      setNavTitlesOffsetX(0);
      setAlignmentReady(false);
      return undefined;
    }

    const measure = () => {
      const el = theHumanInsideRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const w = Math.max(0, Math.round(rect.width));
      if (w > 0) {
        setUniformColumnWidth(w);
        setNavActiveColumns(`repeat(5, ${w}px)`);

        const firstEl = firstContactRef.current;
        if (firstEl) {
          const firstRect = firstEl.getBoundingClientRect();
          const firstW = Math.max(0, Math.round(firstRect.width));
          if (firstW > 0) {
            setFirstColumnWidth(firstW);
          }
        }

        const cubeEl = cubeMaschinenRef.current;
        if (cubeEl) {
          const cubeRect = cubeEl.getBoundingClientRect();
          const cubeW = Math.max(0, Math.round(cubeRect.width));
          if (cubeW > 0) {
            setCubeColumnWidth(cubeW + 5);
          }
        }

        try {
          const tableEl = megaTableRef.current;
          let tableStep;
          let tableColWidth;
          if (tableEl) {
            const cols = tableEl.querySelectorAll('[data-mega-col="true"]');
            if (cols && cols.length >= 2) {
              const r0 = cols[0].getBoundingClientRect();
              const r1 = cols[1].getBoundingClientRect();
              tableStep = Math.round(r1.left - r0.left);
              tableColWidth = Math.round(r0.width);
            }
          }
          window.__NIKE_HEADER_COLUMNS__ = {
            theHumanInsideWidth: w,
            firstContactWidth: firstEl ? Math.max(0, Math.round(firstEl.getBoundingClientRect().width)) : undefined,
            cubeMaschinenWidth: cubeEl ? Math.max(0, Math.round(cubeEl.getBoundingClientRect().width)) : undefined,
            gap: 35,
            step: w + 35,
            tableColWidth,
            tableStep,
          };
        } catch {
          // ignore
        }
      }
    };

    const raf = window.requestAnimationFrame(measure);

    window.addEventListener('resize', measure);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [activeMenu]);

  useEffect(() => {
    if (activeMenu !== 'collections') {
      setNavTitlesOffsetX(0);
      setAlignmentReady(false);
      hasAlignedRef.current = false;
      return undefined;
    }

    // Align once per open/expanded cycle (no continuous recalculation).
    const measureOnce = () => {
      if (hasAlignedRef.current) return;
      if (expansionPhase !== 'expanded') return;

      const navEl = navRef.current;
      const tableEl = megaTableRef.current;
      if (!navEl || !tableEl) return;

      const navRect = navEl.getBoundingClientRect();
      const tableRect = tableEl.getBoundingClientRect();

      const delta = Math.round(tableRect.left - navRect.left);

      hasAlignedRef.current = true;
      setNavTitlesOffsetX(delta);
      setAlignmentReady(true);
    };

    const raf1 = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(measureOnce);
    });
    const onResize = () => {
      hasAlignedRef.current = false;
      measureOnce();
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(raf1);
      window.removeEventListener('resize', onResize);
    };
  }, [activeMenu, expansionPhase, navX]);

  function closeAll() {
    setActiveMenu(null);
    setMobileOpen(false);
  }

  const closeCollections = () => {
    if (forceMegaMenuOpen) return;

    if (closeCollectionsRafRef.current) {
      window.cancelAnimationFrame(closeCollectionsRafRef.current);
      closeCollectionsRafRef.current = null;
    }
    if (openCollectionsTimerRef.current) {
      window.clearTimeout(openCollectionsTimerRef.current);
      openCollectionsTimerRef.current = null;
    }

    setIsClosingCollections(true);
    setOverlayVisible(false);

    setAlignmentReady(false);
    setNavTitlesOffsetX(0);
    setExpansionPhase('rest');

    setCollectionsVisible(false);
    closeCollectionsRafRef.current = null;
  };

  const openCollections = () => {
    if (closeCollectionsRafRef.current) {
      window.cancelAnimationFrame(closeCollectionsRafRef.current);
      closeCollectionsRafRef.current = null;
    }
    if (openCollectionsTimerRef.current) {
      window.clearTimeout(openCollectionsTimerRef.current);
      openCollectionsTimerRef.current = null;
    }
    setIsClosingCollections(false);
    setOverlayVisible(true);
    setCollectionsVisible(true);
    setActiveMenu('collections');

    setExpansionPhase('expanded');
    openCollectionsTimerRef.current = null;
  };

  useEffect(() => {
    if (!isNikeDemoRoute) return;
    if (!demoManualEnabled) return;
    openCollections();
  }, [demoManualEnabled, isNikeDemoRoute]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  const canUseDom = typeof document !== 'undefined';

  return (
    <motion.header
      ref={headerRef}
      className="fixed left-0 right-0 z-[10000]"
      initial={false}
      animate={{ top: topOffsetWithGuides }}
      transition={{ duration: MOTION_DURATION, ease: MOTION_EASE }}
      onMouseLeave={() => {
        closeCollections();
      }}
    >
      <div className="hidden lg:block bg-white border-b border-border">
        <div className="max-w-[1696px] mx-auto px-6 md:px-12 h-10 flex items-center gap-6 text-xs text-muted-foreground">
          {isNikeDemoRoute && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px]"
                disabled={!demoManualEnabled}
                onClick={() => {
                  const current = demoPhaseOverride === 'rest' || demoPhaseOverride === 'expanded' ? demoPhaseOverride : 'expanded';
                  const next = current === 'expanded' ? 'rest' : 'expanded';
                  writeNikeControls({ enabled: demoManualEnabled, phase: next });
                }}
              >
                {(demoPhaseOverride || 'expanded') === 'expanded' ? 'Rest' : 'Expand'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => {
                  const nextEnabled = !demoManualEnabled;
                  const phase = (demoPhaseOverride === 'rest' || demoPhaseOverride === 'expanded') ? demoPhaseOverride : 'expanded';
                  writeNikeControls({ enabled: nextEnabled, phase });
                }}
              >
                {demoManualEnabled ? 'Disable manual' : 'Enable manual'}
              </Button>
            </div>
          )}
          <Link to="/adidas-demo" className="hover:text-foreground transition-colors">Adidas</Link>
          <Link to="/nike-hero-demo" className="hover:text-foreground transition-colors">Nike Hero</Link>
          <Link to="/proves" className="hover:text-foreground transition-colors">Proves</Link>
          <Link to="/help" className="hover:text-foreground transition-colors">Ajuda</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contacte</Link>
          <button
            type="button"
            onClick={() => onUserClick?.()}
            className="hover:text-foreground transition-colors"
          >
            Compte
          </button>
        </div>
      </div>

      <div
        ref={headerBarRef}
        className={`relative bg-white ${activeMenu === 'collections' ? '' : 'border-b border-border'}`}
      >
        {collectionsVisible && expansionPhase === 'expanded' && navHoverBridgeTopPx != null && (
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 bottom-0 z-[9992]"
            style={{ top: `${navHoverBridgeTopPx}px` }}
            onMouseEnter={openCollections}
            onMouseMove={openCollections}
          />
        )}
        <div className="max-w-[1696px] mx-auto px-6 md:px-12">
          <div className="relative h-16 lg:h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-transparent"
                aria-label={mobileOpen ? 'Tancar menú' : 'Obrir menú'}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>

              <Link to="/" className="relative z-10 pointer-events-auto block transition-transform hover:scale-105 active:scale-95" title="GRÀFIC - Inici">
                <span
                  aria-hidden="true"
                  data-brand-logo="1"
                  className="h-8 lg:h-10 w-[140px] text-foreground"
                  style={{
                    display: 'block',
                    backgroundColor: 'currentColor',
                    WebkitMaskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                    maskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'left center',
                    maskPosition: 'left center',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain'
                  }}
                />
              </Link>
            </div>

            <div className="hidden lg:flex absolute inset-y-0 left-[-48px] right-[-48px] items-center">
              <motion.nav
                data-nike-nav="true"
                ref={navRef}
                className="w-full h-full grid grid-flow-col justify-items-stretch items-center"
                onMouseEnter={(e) => maybeOpenCollectionsFromNavPointer(e.clientX)}
                onMouseMove={(e) => maybeOpenCollectionsFromNavPointer(e.clientX)}
                style={
                  (activeMenu === 'collections' && expansionPhase === 'expanded')
                    ? (navActiveColumns
                      ? {
                          gridTemplateColumns: uniformColumnWidth
                            ? `${firstColumnWidth || uniformColumnWidth}px ${uniformColumnWidth}px ${uniformColumnWidth}px ${cubeColumnWidth || uniformColumnWidth}px ${uniformColumnWidth}px`
                            : 'repeat(5, max-content)',
                          columnGap: '35px',
                          justifyContent: 'start',
                          width: uniformColumnWidth
                            ? `${(firstColumnWidth || uniformColumnWidth) + uniformColumnWidth * 3 + (cubeColumnWidth || uniformColumnWidth) + 35 * 4}px`
                            : undefined,
                          x: 0,
                        }
                      : {
                          gridTemplateColumns: uniformColumnWidth
                            ? `${firstColumnWidth || uniformColumnWidth}px ${uniformColumnWidth}px ${uniformColumnWidth}px ${cubeColumnWidth || uniformColumnWidth}px ${uniformColumnWidth}px`
                            : 'repeat(5, max-content)',
                          columnGap: '35px',
                          justifyContent: 'start',
                          width: uniformColumnWidth
                            ? `${(firstColumnWidth || uniformColumnWidth) + uniformColumnWidth * 3 + (cubeColumnWidth || uniformColumnWidth) + 35 * 4}px`
                            : undefined,
                          x: 0,
                        })
                    : {
                        gridTemplateColumns: `repeat(${Math.max(1, desktopNavLinks.length)}, minmax(0, 1fr))`,
                        columnGap: '2rem',
                      }
                }
              >
                {desktopNavLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    layout={false}
                    className="justify-self-stretch flex items-center"
                  >
                    <Link
                      to={link.href}
                      ref={(el) => {
                        if (link.href === '/first-contact') firstContactRef.current = el;
                        if (link.href === '/the-human-inside') theHumanInsideRef.current = el;
                        if (link.href === '/outcasted') outcastedRef.current = el;
                        const key = (link.href || '').toString().replace(/^\//, '').trim();
                        if (key) navLinkRefs.current[key] = el;
                      }}
                      className="font-roboto text-sm font-normal text-gray-900 transition-all block w-full m-0 p-0 leading-none"
                      onMouseEnter={(e) => {
                        const color = document.documentElement.classList.contains('dark') ? '#ffffff' : 'hsl(var(--foreground))';
                        e.currentTarget.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`;
                        openCollections();
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textShadow = 'none';
                      }}
                      onFocus={openCollections}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
            </div>

            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchDialogOpen(true)}
                className="h-9 w-9 lg:h-10 lg:w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Obrir cerca"
              >
                <Search className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={1.5} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  if (cartClickTimeoutRef.current) window.clearTimeout(cartClickTimeoutRef.current);
                  cartClickTimeoutRef.current = window.setTimeout(() => {
                    cartClickTimeoutRef.current = null;
                    onCartClick?.();
                  }, 320);
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  if (cartClickTimeoutRef.current) window.clearTimeout(cartClickTimeoutRef.current);
                  cartClickTimeoutRef.current = null;
                  navigate('/cart');
                }}
                className="relative h-9 w-9 lg:h-10 lg:w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground"
                aria-label={cartItemCount > 0 ? 'Carro (amb productes)' : 'Carro'}
              >
                <span
                  aria-hidden="true"
                  className="h-[27px] w-[27px] lg:h-[31px] lg:w-[31px] transition-all duration-200"
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
                    maskSize: 'contain'
                  }}
                />
                {cartItemCount > 0 && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 text-white text-[13.75px] lg:text-[16.25px] font-bold"
                    style={{ top: 'calc(60% - 1px)', transform: 'translate(-50%, -50%)', lineHeight: '1' }}
                  >
                    {cartItemCount}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onUserClick}
                className="h-9 w-9 lg:h-10 lg:w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Obrir compte"
              >
                <UserRound className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>

        {/* Modal-like overlay: click outside closes */}
        {canUseDom && createPortal(
          <AnimatePresence>
            {overlayVisible && (
              <motion.div
                key="collections-overlay"
                className="fixed left-0 right-0 bottom-0 z-[9990] backdrop-blur-[2px]"
                style={{ top: `calc(${topOffset} + ${headerHeight}px)` }}
                initial={{ opacity: 0, backgroundColor: 'rgba(0,0,0,0)' }}
                animate={{
                  opacity: 1,
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  transition: {
                    opacity: { duration: MOTION_DURATION, ease: MOTION_EASE },
                    backgroundColor: { duration: MOTION_DURATION, ease: MOTION_EASE }
                  }
                }}
                exit={{
                  opacity: 0,
                  backgroundColor: 'rgba(0,0,0,0)',
                  transition: {
                    opacity: { duration: MOTION_DURATION, ease: MOTION_EASE },
                    backgroundColor: { duration: MOTION_DURATION, ease: MOTION_EASE }
                  }
                }}
                onClick={() => {
                  closeCollections();
                }}
              />
            )}
          </AnimatePresence>,
          document.body
        )}

        <AnimatePresence
          onExitComplete={() => {
            if (isClosingCollections) {
              setIsClosingCollections(false);
              setActiveMenu(null);
            }
          }}
        >
          {collectionsVisible && (
            <>
              <motion.div
                key="collections"
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                  transition: {
                    opacity: { duration: MOTION_DURATION, ease: MOTION_EASE },
                    height: { duration: MOTION_DURATION, ease: MOTION_EASE },
                  },
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: {
                    opacity: { duration: MOTION_DURATION, ease: MOTION_EASE },
                    height: { delay: 0, duration: MOTION_DURATION, ease: MOTION_EASE },
                  },
                }}
                className="relative z-[9991] hidden lg:block bg-white border-b border-border overflow-hidden"
                onMouseEnter={openCollections}
                onMouseLeave={() => {
                  closeCollections();
                }}
              >
                {/* Close icon option A: panel top-right */}
                <button
                  type="button"
                  aria-label="Tancar"
                  className="absolute right-3 top-2 z-10 text-muted-foreground hover:text-foreground focus:outline-none"
                  onClick={() => {
                    closeCollections();
                  }}
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>

                <div className="max-w-[1696px] mx-auto px-6 md:px-12 pt-0 pb-8">
                  <motion.div
                    data-nike-mega-grid="true"
                    ref={megaTableRef}
                    initial={false}
                    className="relative mx-auto grid grid-flow-col justify-items-stretch"
                    style={
                      uniformColumnWidth
                        ? ((expansionPhase === 'expanded')
                          ? {
                              width: `${(firstColumnWidth || uniformColumnWidth) + uniformColumnWidth * 3 + (cubeColumnWidth || uniformColumnWidth) + 35 * 4}px`,
                              gridTemplateColumns: `${firstColumnWidth || uniformColumnWidth}px ${uniformColumnWidth}px ${uniformColumnWidth}px ${cubeColumnWidth || uniformColumnWidth}px ${uniformColumnWidth}px`,
                              columnGap: '35px',
                              justifyContent: 'start',
                              fontSize: `${MEGA_MENU_BASE_FONT_PX}px`,
                              x: 0,
                            }
                          : {
                              width: `${uniformColumnWidth * 5 + 35 * 4}px`,
                              gridTemplateColumns: navRestColumns || 'repeat(5, max-content)',
                              columnGap: '2rem',
                              justifyContent: 'center',
                              fontSize: `${megaMenuFontPx}px`,
                              x: 0,
                            })
                        : { columnGap: '2rem', justifyContent: 'center', fontSize: `${megaMenuFontPx}px`, x: 0 }
                    }
                    onClick={(e) => e.stopPropagation()}
                  >
                    {megaMenuColumns.map((col) => (
                      <motion.div
                        key={col.collectionHref}
                        data-mega-col="true"
                        layout={false}
                        className="min-w-0 overflow-visible text-left"
                      >
                        <div className="grid gap-2 min-w-0 overflow-visible">
                          {(!col.groups || col.groups.length === 0) ? (
                            <div className="text-sm text-gray-500">Sense dissenys</div>
                          ) : (
                            col.groups.map((group) => {
                              const hasLabel = !!group.label;
                              const groupId = `${col.collectionKey}:${group.key}`;
                              const isOpen = !!expandedGroups[groupId];

                              if (!hasLabel) {
                                return (
                                  <React.Fragment key={groupId}>
                                    {group.items.map((p) => (
                                      <Link
                                        key={p.key}
                                        to={p.href}
                                        ref={(el) => {
                                          if (col.collectionKey === 'cube' && p.name === 'MaschinenCube') {
                                            cubeMaschinenRef.current = el;
                                          }
                                        }}
                                        className="font-roboto text-[inherit] font-normal text-gray-800 transition-all block w-full"
                                        onMouseEnter={(e) => {
                                          const color = document.documentElement.classList.contains('dark') ? '#ffffff' : '#141414';
                                          e.currentTarget.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`;
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.textShadow = 'none';
                                        }}
                                        onClick={() => {
                                          closeCollections();
                                        }}
                                      >
                                        {p.name}
                                      </Link>
                                    ))}
                                  </React.Fragment>
                                );
                              }

                              return (
                                <div key={groupId} className="grid gap-2">
                                  <button
                                    type="button"
                                    className="font-roboto text-[inherit] font-normal text-gray-900 transition-all inline-flex items-center justify-between w-full"
                                    onClick={() => {
                                      setExpandedGroups((prev) => ({
                                        ...prev,
                                        [groupId]: !prev[groupId],
                                      }));
                                    }}
                                    onMouseEnter={(e) => {
                                      const color = document.documentElement.classList.contains('dark') ? '#ffffff' : '#141414';
                                      e.currentTarget.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.textShadow = 'none';
                                    }}
                                    aria-expanded={isOpen ? 'true' : 'false'}
                                  >
                                    <span>{group.label}</span>
                                    <motion.span
                                      aria-hidden="true"
                                      className="ml-2 inline-block"
                                      initial={false}
                                      animate={{ rotate: isOpen ? 180 : 0 }}
                                      transition={{ duration: MOTION_DURATION, ease: MOTION_EASE }}
                                    >
                                      ▾
                                    </motion.span>
                                  </button>

                                  <AnimatePresence initial={false}>
                                    {isOpen && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: MOTION_DURATION, ease: MOTION_EASE }}
                                        className="grid gap-2 pl-3"
                                      >
                                        {group.items.map((p) => (
                                          <Link
                                            key={p.key}
                                            to={p.href}
                                            className="font-roboto text-[inherit] font-light text-muted-foreground transition-all block w-full"
                                            onMouseEnter={(e) => {
                                              const color = document.documentElement.classList.contains('dark') ? '#ffffff' : '#141414';
                                              e.currentTarget.style.textShadow = `0 0 0.55px ${color}, 0 0 0.55px ${color}`;
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.textShadow = 'none';
                                            }}
                                            onClick={() => {
                                              closeCollections();
                                            }}
                                          >
                                            {p.name}
                                          </Link>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: MOTION_DURATION, ease: MOTION_EASE }}
              className="lg:hidden border-t border-border bg-white"
            >
              <div className="px-4 py-4 grid gap-3">
                {navLinks.map((i) => (
                  <Link
                    key={i.name}
                    to={i.href}
                    className="py-2 text-sm text-foreground"
                    onClick={closeAll}
                  >
                    {i.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SearchDialog isOpen={isSearchDialogOpen} onClose={() => setIsSearchDialogOpen(false)} />
    </motion.header>
  );
}

export default NikeInspiredHeader;
