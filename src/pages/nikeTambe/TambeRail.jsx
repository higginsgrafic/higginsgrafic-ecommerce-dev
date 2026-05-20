import React, { useEffect, useMemo, useRef, useState } from 'react';
import RespescaTitle from '@/pages/nikeTambe/RespescaTitle';
import CarouselArrows from '@/pages/nikeTambe/CarouselArrows';
import ProductCard from '@/pages/nikeTambe/ProductCard';

const DEFAULT_IMAGES = [
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_daisy_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_forest-green_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_gold_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_irish-green_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_kiwi_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_light-blue_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_light-pink_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_military-green_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_navy_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_purple_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_red_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_royal_gpr-4-0_front.png',
  '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png',
];

const TILE_STYLE = { width: '450px', height: '450px', backgroundColor: '#f5f5f5', position: 'relative', transform: 'scale(0.8822222222)', transformOrigin: 'bottom left', boxShadow: 'none' };
const TEXT_BLOCK_STYLE = { width: '397px' };
const CARD_W = 397;
const CLONE_COUNT = 3;

const parseBool = (raw, fb = true) => {
  if (raw == null) return fb;
  const v = String(raw).trim().toLowerCase();
  if (v === '') return fb;
  return v === '1' || v === 'true' || v === 'on' || v === 'yes';
};

const readDrawingOverlaySrc = () => {
  try {
    const direct = String(window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC') || '').trim();
    if (direct) return direct;
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith('HG_STRIPE_OVERLAY_SRC_')) keys.push(k);
    }
    keys.sort();
    for (const k of keys) {
      const v = String(window.localStorage.getItem(k) || '').trim();
      if (v) return v;
    }
    return null;
  } catch {
    return null;
  }
};

export default function TambeRail({
  images = DEFAULT_IMAGES,
  cardHref = '/nike-tambe',
  title = 'també et pot interessar',
  subtitle = 'COSES DIFERENTS',
  initialIndex = 3,
  visibleCards = 4,
}) {
  const [shirtDrawingEnabled, setShirtDrawingEnabled] = useState(() => {
    try {
      const a = window.localStorage.getItem('HG_SHIRT_DRAWING_ENABLED');
      if (a != null) return parseBool(a, true);
      const b = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_ENABLED');
      if (b != null) return parseBool(b, true);
      return true;
    } catch { return true; }
  });
  const [drawingOverlaySrc, setDrawingOverlaySrc] = useState(() => readDrawingOverlaySrc());

  useEffect(() => {
    const sync = () => {
      try { setDrawingOverlaySrc(readDrawingOverlaySrc()); } catch { setDrawingOverlaySrc(null); }
    };
    window.addEventListener('hg-drawing-overlay-changed', sync);
    return () => window.removeEventListener('hg-drawing-overlay-changed', sync);
  }, []);

  useEffect(() => {
    const sync = () => {
      try {
        const a = window.localStorage.getItem('HG_SHIRT_DRAWING_ENABLED');
        if (a != null) { setShirtDrawingEnabled(parseBool(a, true)); return; }
        const b = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_ENABLED');
        if (b != null) { setShirtDrawingEnabled(parseBool(b, true)); return; }
        setShirtDrawingEnabled(true);
      } catch { setShirtDrawingEnabled(true); }
    };
    window.addEventListener('hg-shirt-drawing-enabled-changed', sync);
    window.addEventListener('hg-shirt-drawing-overlay-enabled-changed', sync);
    return () => {
      window.removeEventListener('hg-shirt-drawing-enabled-changed', sync);
      window.removeEventListener('hg-shirt-drawing-overlay-enabled-changed', sync);
    };
  }, []);

  const [bgMetrics, setBgMetrics] = useState(null);
  const [respescaMinHeightPx, setRespescaMinHeightPx] = useState(null);
  const [carouselStartIndex, setCarouselStartIndex] = useState(initialIndex);
  const [carouselAnimate, setCarouselAnimate] = useState(true);
  const containerRef = useRef(null);
  const respescaRef = useRef(null);
  const dragRef = useRef({ active: false, pointerId: null, startX: 0, startY: 0, lastDx: 0, lastDy: 0, moved: false, consumed: false });
  const isAnimRef = useRef(false);
  const pendingRef = useRef(0);
  const lastIntentRef = useRef(0);
  const clearPendingRef = useRef(null);

  useEffect(() => {
    let raf = null;
    let ro = null;
    let mo = null;
    const readCssNumber = (name) => {
      try {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        if (!raw) return null;
        const n = parseFloat(raw);
        return Number.isFinite(n) ? n : null;
      } catch { return null; }
    };
    const read = () => {
      const pageEl = containerRef.current;
      if (!pageEl) { setBgMetrics(null); return; }
      const pr = pageEl.getBoundingClientRect();
      const pageWidth = Math.max(0, Math.round(pr.width));

      // 1) Prioritzem belt2 (CSS vars `--belt2-xL/xR`, coords de viewport).
      const beltXL = readCssNumber('--belt2-xL');
      const beltXR = readCssNumber('--belt2-xR');
      const beltOk = Number.isFinite(beltXL) && Number.isFinite(beltXR) && beltXR > beltXL;

      if (beltOk) {
        const devLeftRaw = Math.max(0, beltXL - pr.left);
        const userRightRaw = Math.max(0, beltXR - pr.left);
        const devLeft = Math.min(devLeftRaw, Math.max(0, pageWidth - CARD_W));
        const userRight = Math.min(userRightRaw, pageWidth);
        const width = Math.max(0, beltXR - beltXL);
        setBgMetrics({ x: devLeft, width, devLeft, userRight, pageWidth });
        return;
      }

      // 2) Fallback: ancoratges del header (compatibilitat amb pàgines sense belt2).
      const left = document.getElementById('dev-header-left');
      const user = document.getElementById('dev-header-user');
      if (!left || !user) { setBgMetrics(null); return; }
      const lr = left.getBoundingClientRect();
      const ur = user.getBoundingClientRect();
      const x = Math.max(0, lr.right - pr.left);
      const width = Math.max(0, ur.left - lr.right);
      const devLeftRaw = Math.max(0, lr.left - pr.left);
      const userRightRaw = Math.max(0, ur.left - pr.left);
      const devLeft = Math.min(devLeftRaw, Math.max(0, pageWidth - CARD_W));
      const userRight = Math.min(userRightRaw, pageWidth);
      setBgMetrics({ x, width, devLeft, userRight, pageWidth });
    };
    const schedule = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(read); };
    schedule(); setTimeout(schedule, 50); setTimeout(schedule, 250);
    window.addEventListener('resize', schedule);
    try {
      ro = new ResizeObserver(schedule);
      const left = document.getElementById('dev-header-left');
      const user = document.getElementById('dev-header-user');
      if (left) ro.observe(left);
      if (user) ro.observe(user);
      if (containerRef.current) ro.observe(containerRef.current);
    } catch { /* ignore */ }
    // Observa canvis a les CSS vars `--belt2-xL/xR` al :root (publish dinàmic
    // des de BeltReferenceOverlay) per a recomputar l'ancoratge.
    try {
      mo = new MutationObserver(schedule);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    } catch { /* ignore */ }
    return () => {
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (mo) mo.disconnect();
    };
  }, []);

  useEffect(() => {
    let raf = null;
    const measure = () => {
      const sectionEl = respescaRef.current;
      if (!sectionEl) { setRespescaMinHeightPx(null); return; }
      const sr = sectionEl.getBoundingClientRect();
      const cards = sectionEl.querySelectorAll('[data-component="product-card"]');
      let maxBottom = 0;
      cards.forEach((el) => {
        const r = el.getBoundingClientRect();
        const bottom = r.bottom - sr.top;
        if (Number.isFinite(bottom)) maxBottom = Math.max(maxBottom, bottom);
      });
      if (maxBottom <= 0) { setRespescaMinHeightPx(null); return; }
      setRespescaMinHeightPx(Math.ceil(maxBottom));
    };
    const schedule = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    schedule();
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [bgMetrics]);

  useEffect(() => {
    const imgs = [];
    images.forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = src;
      imgs.push(img);
    });
    Promise.allSettled(imgs.map(async (img) => {
      try { if (typeof img.decode === 'function') await img.decode(); } catch { /* ignore */ }
    }));
  }, [images]);

  const totalCards = images.length;
  const upper = totalCards + CLONE_COUNT;
  const safeStart = carouselStartIndex;

  const extendedCards = useMemo(() => {
    const base = Array.from({ length: totalCards }).map((_, idx) => ({ idx }));
    return [...base.slice(-CLONE_COUNT), ...base, ...base.slice(0, CLONE_COUNT)];
  }, [totalCards]);

  const left1 = bgMetrics ? bgMetrics.devLeft : 0;
  const beltWidth = bgMetrics ? bgMetrics.width : CARD_W * visibleCards;
  // Card width = 1 columna de la pauta amb gutter `PAUTA_GUTTER_X` entre cols.
  //   cardW = (belt2Width - (visibleCards - 1) * gutterX) / visibleCards
  //   stepPx = cardW + gutterX
  const PAUTA_GUTTER_X = 22.5;
  const cardW = Math.max(80, (beltWidth - (visibleCards - 1) * PAUTA_GUTTER_X) / visibleCards);
  const stepPx = cardW + PAUTA_GUTTER_X;
  const viewportWidthPx = useMemo(() => Math.max(0, beltWidth), [beltWidth]);
  const arrowsLeftPx = useMemo(() => {
    const buttonsW = (44 * 2) + 10;
    const inset = 20;
    return Math.max(0, viewportWidthPx - inset - buttonsW);
  }, [viewportWidthPx]);
  const cardImgTopPx = 161;
  const cardTextBlockHeightPx = 140;
  const viewportHeightPx = useMemo(() => cardImgTopPx + Math.round(cardW) + cardTextBlockHeightPx, [cardW]);
  const dynamicTileStyle = useMemo(() => ({
    width: `${Math.round(cardW)}px`,
    height: `${Math.round(cardW)}px`,
    backgroundColor: '#f5f5f5',
    position: 'relative',
    boxShadow: 'none',
  }), [cardW]);
  const dynamicTextBlockStyle = useMemo(() => ({ width: `${Math.round(cardW)}px` }), [cardW]);

  const settleQueuedNav = () => {
    isAnimRef.current = false;
    const q = pendingRef.current;
    if (q !== 0) {
      pendingRef.current = q > 0 ? q - 1 : q + 1;
      requestAnimationFrame(() => { if (q > 0) goNext(); else goPrev(); });
    }
  };

  const snapWithoutAnimation = (nextIndex) => {
    setCarouselAnimate(false);
    setCarouselStartIndex(nextIndex);
    pendingRef.current = 0;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCarouselAnimate(true);
        settleQueuedNav();
      });
    });
  };

  const goPrev = () => {
    if (isAnimRef.current && carouselAnimate) {
      pendingRef.current = Math.max(-2, Math.min(2, pendingRef.current - 1));
      lastIntentRef.current = Date.now();
      if (clearPendingRef.current) clearTimeout(clearPendingRef.current);
      clearPendingRef.current = setTimeout(() => {
        if (Date.now() - (lastIntentRef.current || 0) >= 180) pendingRef.current = 0;
      }, 200);
      return;
    }
    isAnimRef.current = true;
    lastIntentRef.current = Date.now();
    if (carouselStartIndex <= 0) {
      snapWithoutAnimation(carouselStartIndex + totalCards);
      requestAnimationFrame(() => setCarouselStartIndex((v) => v - 1));
      return;
    }
    setCarouselStartIndex((v) => v - 1);
  };

  const goNext = () => {
    if (isAnimRef.current && carouselAnimate) {
      pendingRef.current = Math.max(-2, Math.min(2, pendingRef.current + 1));
      lastIntentRef.current = Date.now();
      if (clearPendingRef.current) clearTimeout(clearPendingRef.current);
      clearPendingRef.current = setTimeout(() => {
        if (Date.now() - (lastIntentRef.current || 0) >= 180) pendingRef.current = 0;
      }, 200);
      return;
    }
    isAnimRef.current = true;
    lastIntentRef.current = Date.now();
    if (carouselStartIndex >= upper) {
      snapWithoutAnimation(carouselStartIndex - totalCards);
      requestAnimationFrame(() => setCarouselStartIndex((v) => v + 1));
      return;
    }
    setCarouselStartIndex((v) => v + 1);
  };

  return (
    <div ref={containerRef} data-component="tambe-rail" style={{ position: 'relative', width: '100%' }}>
      <div
        ref={respescaRef}
        className="relative"
        data-section="respesca"
        style={respescaMinHeightPx ? { minHeight: `${respescaMinHeightPx}px` } : undefined}
      >
        <RespescaTitle leftPx={left1} title={title} subtitle={subtitle} />

        <div className="w-full py-10" data-container="cards-row">
          <div style={{ position: 'relative', minHeight: `${viewportHeightPx}px` }}>
            <div
              style={{
                position: 'relative',
                marginLeft: `${left1}px`,
                width: `${viewportWidthPx}px`,
                overflow: 'hidden',
                touchAction: 'none',
                minHeight: `${viewportHeightPx}px`,
              }}
              data-container="carousel-viewport"
              onPointerDown={(e) => {
                if (e.target && e.target.closest && e.target.closest('button')) return;
                const r = dragRef.current;
                r.active = true;
                r.pointerId = typeof e.pointerId === 'number' ? e.pointerId : null;
                r.startX = typeof e.clientX === 'number' ? e.clientX : 0;
                r.startY = typeof e.clientY === 'number' ? e.clientY : 0;
                r.lastDx = 0; r.lastDy = 0; r.moved = false; r.consumed = false;
                try {
                  if (typeof e.currentTarget?.setPointerCapture === 'function' && typeof e.pointerId === 'number') {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  }
                } catch { /* ignore */ }
              }}
              onPointerMove={(e) => {
                const r = dragRef.current;
                if (!r.active) return;
                const x = typeof e.clientX === 'number' ? e.clientX : r.startX;
                const y = typeof e.clientY === 'number' ? e.clientY : r.startY;
                const dx = x - r.startX;
                const dy = y - r.startY;
                r.lastDx = dx; r.lastDy = dy;
                if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
                  r.moved = true;
                  try { e.preventDefault(); } catch { /* ignore */ }
                }
              }}
              onPointerUp={() => {
                const r = dragRef.current;
                r.active = false; r.pointerId = null;
                const dx = r.lastDx; const dy = r.lastDy;
                if (!r.consumed && Math.abs(dx) >= 44 && Math.abs(dx) > Math.abs(dy)) {
                  r.consumed = true;
                  if (dx < 0) goNext(); else goPrev();
                }
                if (r.moved) setTimeout(() => { dragRef.current.moved = false; }, 0);
              }}
              onPointerCancel={() => { dragRef.current.active = false; dragRef.current.pointerId = null; }}
            >
              <CarouselArrows leftPx={arrowsLeftPx} onPrev={goPrev} onNext={goNext} />

              <div
                style={{
                  position: 'relative',
                  transform: `translateX(${-safeStart * stepPx}px)`,
                  transition: carouselAnimate ? 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
                  willChange: 'transform',
                }}
                data-container="carousel-track"
                onTransitionEnd={() => {
                  if (safeStart >= upper) { snapWithoutAnimation(safeStart - totalCards); return; }
                  if (safeStart < CLONE_COUNT) { snapWithoutAnimation(safeStart + totalCards); return; }
                  settleQueuedNav();
                }}
              >
                {extendedCards.map((card, pos) => {
                  const idx = card.idx;
                  const leftPx = pos * stepPx;
                  const img = images[idx] || null;
                  return (
                    <ProductCard
                      key={`${pos}-${idx}`}
                      positionKey={`${pos}-${idx}`}
                      href={cardHref}
                      imageSrc={img}
                      leftPx={leftPx}
                      tileStyle={dynamicTileStyle}
                      textBlockStyle={dynamicTextBlockStyle}
                      overlaySrc={drawingOverlaySrc}
                      overlayEnabled={shirtDrawingEnabled}
                      cardIndex={idx}
                      onNavigateBlocked={() => {
                        if (dragRef.current.moved) {
                          dragRef.current.moved = false;
                          return true;
                        }
                        return false;
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
