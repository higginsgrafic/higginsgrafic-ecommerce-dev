import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';

export default function NikeTambePage() {
  const [bgMetrics, setBgMetrics] = useState(null);
  const [bgOn, setBgOn] = useState(true);
  const [respescaMinHeightPx, setRespescaMinHeightPx] = useState(null);
  const [carouselStartIndex, setCarouselStartIndex] = useState(3);
  const [carouselAnimate, setCarouselAnimate] = useState(true);
  const pageRef = useRef(null);
  const respescaRef = useRef(null);
  const dragRef = useRef({ active: false, pointerId: null, startX: 0, startY: 0, lastDx: 0, lastDy: 0, moved: false, consumed: false });
  const prefetchedImagesRef = useRef([]);
  const isCarouselAnimatingRef = useRef(false);
  const pendingNavDeltaRef = useRef(0);
  const lastNavIntentAtRef = useRef(0);
  const clearPendingTimeoutRef = useRef(null);

  useEffect(() => {
    let raf = null;
    let ro = null;

    const read = () => {
      const left = document.getElementById('dev-header-left');
      const user = document.getElementById('dev-header-user');
      const pageEl = pageRef.current;
      if (!left || !user) {
        setBgMetrics(null);
        return;
      }

      if (!pageEl) {
        setBgMetrics(null);
        return;
      }

      const leftRect = left.getBoundingClientRect();
      const userRect = user.getBoundingClientRect();
      const pageRect = pageEl.getBoundingClientRect();

      const pageWidth = Math.max(0, Math.round(pageRect.width));

      const width = Math.max(0, userRect.left - leftRect.right);
      const x = Math.max(0, leftRect.right - pageRect.left);

      const devLeftRaw = Math.max(0, leftRect.left - pageRect.left);
      const userRightRaw = Math.max(0, userRect.left - pageRect.left);

      const devLeft = Math.min(devLeftRaw, Math.max(0, pageWidth - cardBlockWidthPx));
      const userRight = Math.min(userRightRaw, pageWidth);

      setBgMetrics({ x, width, devLeft, userRight, pageWidth });
    };

    const scheduleRead = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(read);
    };

    scheduleRead();
    scheduleRead();
    setTimeout(scheduleRead, 50);
    setTimeout(scheduleRead, 250);

    window.addEventListener('resize', scheduleRead);

    try {
      ro = new ResizeObserver(scheduleRead);
      ro.observe(left);
      ro.observe(user);
      if (pageRef.current) ro.observe(pageRef.current);
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('resize', scheduleRead);
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    let raf = null;

    const measure = () => {
      const sectionEl = respescaRef.current;
      if (!sectionEl) {
        setRespescaMinHeightPx(null);
        return;
      }

      const sectionRect = sectionEl.getBoundingClientRect();
      const cards = sectionEl.querySelectorAll('[data-component="product-card"]');

      let maxBottom = 0;
      cards.forEach((el) => {
        const r = el.getBoundingClientRect();
        const bottom = r.bottom - sectionRect.top;
        if (Number.isFinite(bottom)) maxBottom = Math.max(maxBottom, bottom);
      });

      if (maxBottom <= 0) {
        setRespescaMinHeightPx(null);
        return;
      }

      const viewportMin = typeof window !== 'undefined' ? window.innerHeight : 0;
      const next = Math.ceil(Math.max(maxBottom, viewportMin));
      setRespescaMinHeightPx(next);
    };

    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();
    schedule();
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [bgMetrics]);

  useEffect(() => {
    const readBgOn = () => {
      try {
        const raw = window.localStorage.getItem('NIKE_TAMBE_BG_ON');
        if (raw === null) return true;
        return raw === '1';
      } catch {
        return true;
      }
    };

    const sync = () => {
      setBgOn(readBgOn());
    };

    sync();

    const onStorage = (e) => {
      if (!e || e.key !== 'NIKE_TAMBE_BG_ON') return;
      sync();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('nike-tambe-bg-toggle-changed', sync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('nike-tambe-bg-toggle-changed', sync);
    };
  }, []);

  const cardHref = '/nike-tambe';
  const imageAlt = 'Producte';
  const placeholderImages = [
    // Official selected list (14) from `public/placeholders/apparel/t-shirt/gildan_5000/colors.json`
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
    '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png'
  ];

  useEffect(() => {
    const imgs = [];

    const run = async () => {
      try {
        placeholderImages.forEach((src) => {
          const img = new Image();
          img.decoding = 'async';
          img.loading = 'eager';
          img.src = src;
          imgs.push(img);
        });

        prefetchedImagesRef.current = imgs;

        await Promise.allSettled(
          imgs.map(async (img) => {
            try {
              if (typeof img.decode === 'function') await img.decode();
            } catch {
              // ignore
            }
          })
        );
      } catch {
        // ignore
      }
    };

    run();
  }, []);

  const tileStyle = {
    width: '450px',
    height: '450px',
    backgroundColor: '#f5f5f5',
    position: 'relative',
    transform: 'scale(0.8822222222)',
    transformOrigin: 'bottom left',
    boxShadow: 'none'
  };

  const textBlockStyle = {
    width: '397px'
  };

  const cardBlockWidthPx = 397;
  const totalCards = placeholderImages.length;
  const cloneCount = 3;
  const safeCarouselStart = carouselStartIndex;
  const upperCarouselIndex = totalCards + cloneCount;
  const extendedCards = useMemo(() => {
    const base = Array.from({ length: totalCards }).map((_, idx) => ({ idx }));
    const head = base.slice(-cloneCount);
    const tail = base.slice(0, cloneCount);
    return [...head, ...base, ...tail];
  }, [totalCards]);
  const left1 = bgMetrics ? bgMetrics.devLeft : 0;
  const left3 = bgMetrics ? Math.max(0, bgMetrics.userRight - cardBlockWidthPx) : 0;
  const stepPx = bgMetrics ? ((left3 - left1) / 2) + 14.5 : (cardBlockWidthPx + 36 + 14.5);
  const viewportWidthPx = useMemo(() => {
    const w = (2 * stepPx) + cardBlockWidthPx;
    return Math.max(0, w);
  }, [stepPx, cardBlockWidthPx]);
  const arrowsLeftPx = useMemo(() => {
    const buttonsW = (44 * 2) + 10;
    const inset = 20;
    const tileRightEdge = (2 * stepPx) + cardBlockWidthPx;
    return Math.max(0, tileRightEdge - inset - buttonsW);
  }, [stepPx, cardBlockWidthPx]);
  const viewportHeightPx = useMemo(() => {
    const tileScaledPx = Math.round(450 * 0.8822222222);
    return 161 + tileScaledPx + 140;
  }, []);

  const goPrev = () => {
    if (isCarouselAnimatingRef.current && carouselAnimate) {
      pendingNavDeltaRef.current = Math.max(-2, Math.min(2, pendingNavDeltaRef.current - 1));
      lastNavIntentAtRef.current = Date.now();
      if (clearPendingTimeoutRef.current) clearTimeout(clearPendingTimeoutRef.current);
      clearPendingTimeoutRef.current = setTimeout(() => {
        const age = Date.now() - (lastNavIntentAtRef.current || 0);
        if (age >= 180) pendingNavDeltaRef.current = 0;
      }, 200);
      return;
    }
    isCarouselAnimatingRef.current = true;
    lastNavIntentAtRef.current = Date.now();
    if (carouselStartIndex <= 0) {
      snapWithoutAnimation(carouselStartIndex + totalCards);
      requestAnimationFrame(() => {
        setCarouselStartIndex((v) => v - 1);
      });
      return;
    }
    setCarouselStartIndex((v) => v - 1);
  };

  const goNext = () => {
    if (isCarouselAnimatingRef.current && carouselAnimate) {
      pendingNavDeltaRef.current = Math.max(-2, Math.min(2, pendingNavDeltaRef.current + 1));
      lastNavIntentAtRef.current = Date.now();
      if (clearPendingTimeoutRef.current) clearTimeout(clearPendingTimeoutRef.current);
      clearPendingTimeoutRef.current = setTimeout(() => {
        const age = Date.now() - (lastNavIntentAtRef.current || 0);
        if (age >= 180) pendingNavDeltaRef.current = 0;
      }, 200);
      return;
    }
    isCarouselAnimatingRef.current = true;
    lastNavIntentAtRef.current = Date.now();
    if (carouselStartIndex >= upperCarouselIndex) {
      snapWithoutAnimation(carouselStartIndex - totalCards);
      requestAnimationFrame(() => {
        setCarouselStartIndex((v) => v + 1);
      });
      return;
    }
    setCarouselStartIndex((v) => v + 1);
  };

  const settleQueuedNav = () => {
    isCarouselAnimatingRef.current = false;
    const queued = pendingNavDeltaRef.current;
    if (queued !== 0) {
      pendingNavDeltaRef.current = queued > 0 ? queued - 1 : queued + 1;
      requestAnimationFrame(() => {
        if (queued > 0) goNext();
        else goPrev();
      });
    }
  };

  const snapWithoutAnimation = (nextIndex) => {
    setCarouselAnimate(false);
    setCarouselStartIndex(nextIndex);
    pendingNavDeltaRef.current = 0;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCarouselAnimate(true);
        settleQueuedNav();
      });
    });
  };

  return (
    <div
      ref={pageRef}
      data-page="nike-tambe"
      className="min-h-screen bg-white"
      style={{
        backgroundImage: bgOn ? 'url(/tmp/tambe%204.png)' : 'none',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: bgMetrics ? `${bgMetrics.x - 38}px 100px` : 'center 100px',
        backgroundSize: bgMetrics ? `${Math.max(0, (bgMetrics.width * 1.0561925) - 1)}px auto` : '75% auto'
      }}
    >
      <SEO title="Nike: També et pot agradar" description="Rail/carrusel de recomanacions (demo)." />

      <div
        ref={respescaRef}
        className="relative min-h-screen"
        data-section="respesca"
        style={respescaMinHeightPx ? { minHeight: `${respescaMinHeightPx}px` } : undefined}
      >
        <div
          style={{
            position: 'absolute',
            top: '64px',
            left: `${(bgMetrics ? bgMetrics.devLeft : 0) - 3}px`,
            fontFamily: 'Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif',
            color: 'hsl(var(--foreground))'
          }}
          data-component="respesca-title"
        >
          <div style={{ fontSize: '32pt', lineHeight: 1.1, color: 'hsl(var(--foreground))' }}>també et pot interessar</div>
          <div
            style={{
              marginTop: '2px',
              fontSize: '13pt',
              fontWeight: 500,
              lineHeight: 1.2,
              color: 'hsl(var(--muted-foreground))',
              fontKerning: 'normal',
              letterSpacing: '0.08em'
            }}
          >
            COSES DIFERENTS
          </div>
        </div>

        <div className="w-full py-10" data-container="cards-row">
          <div style={{ position: 'relative', minHeight: `${viewportHeightPx}px` }}>
            <div
              style={{
                position: 'relative',
                marginLeft: `${left1}px`,
                width: `${viewportWidthPx}px`,
                overflow: 'hidden',
                touchAction: 'none',
                minHeight: `${viewportHeightPx}px`
              }}
              data-container="carousel-viewport"
              onPointerDown={(e) => {
                if (e.target && e.target.closest && e.target.closest('button')) return;
                const r = dragRef.current;
                r.active = true;
                r.pointerId = typeof e.pointerId === 'number' ? e.pointerId : null;
                r.startX = typeof e.clientX === 'number' ? e.clientX : 0;
                r.startY = typeof e.clientY === 'number' ? e.clientY : 0;
                r.lastDx = 0;
                r.lastDy = 0;
                r.moved = false;
                r.consumed = false;
                try {
                  if (typeof e.currentTarget?.setPointerCapture === 'function' && typeof e.pointerId === 'number') {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  }
                } catch {
                  // ignore
                }
              }}
              onPointerMove={(e) => {
                const r = dragRef.current;
                if (!r.active) return;
                const x = typeof e.clientX === 'number' ? e.clientX : r.startX;
                const y = typeof e.clientY === 'number' ? e.clientY : r.startY;
                const dx = x - r.startX;
                const dy = y - r.startY;
                r.lastDx = dx;
                r.lastDy = dy;
                if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
                  r.moved = true;
                  try {
                    e.preventDefault();
                  } catch {
                    // ignore
                  }
                }
              }}
              onPointerUp={() => {
                const r = dragRef.current;
                r.active = false;
                r.pointerId = null;
                const dx = r.lastDx;
                const dy = r.lastDy;
                if (!r.consumed && Math.abs(dx) >= 44 && Math.abs(dx) > Math.abs(dy)) {
                  r.consumed = true;
                  if (dx < 0) goNext();
                  else goPrev();
                }
                if (r.moved) {
                  setTimeout(() => {
                    dragRef.current.moved = false;
                  }, 0);
                }
              }}
              onPointerCancel={() => {
                dragRef.current.active = false;
                dragRef.current.pointerId = null;
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '28.5px',
                  left: `${arrowsLeftPx}px`,
                  display: 'flex',
                  gap: '10px',
                  zIndex: 3
                }}
              >
                <button
                  type="button"
                  aria-label="Anterior"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '9999px',
                    backgroundColor: 'hsl(var(--foreground))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'none'
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goPrev();
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ transform: 'translateX(-2px)' }}
                  >
                    <path d="M15 18L9 12L15 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <button
                  type="button"
                  aria-label="Següent"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '9999px',
                    backgroundColor: 'hsl(var(--foreground))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'none'
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goNext();
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ transform: 'translateX(2px)' }}
                  >
                    <path d="M9 6L15 12L9 18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div
                style={{
                  position: 'relative',
                  transform: `translateX(${-safeCarouselStart * stepPx}px)`,
                  transition: carouselAnimate ? 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
                  willChange: 'transform'
                }}
                data-container="carousel-track"
                onTransitionEnd={() => {
                  if (safeCarouselStart >= upperCarouselIndex) {
                    snapWithoutAnimation(safeCarouselStart - totalCards);
                    return;
                  }
                  if (safeCarouselStart < cloneCount) {
                    snapWithoutAnimation(safeCarouselStart + totalCards);
                    return;
                  }

                  settleQueuedNav();
                }}
              >
              {extendedCards.map((card, pos) => {
                const idx = card.idx;
                const leftPx = pos * stepPx;
                const img = placeholderImages[idx] || null;

                return (
                  <Link
                    key={`${pos}-${idx}`}
                    to={cardHref}
                    className="block"
                    data-component="product-card"
                    data-card-index={idx}
                    draggable={false}
                    onDragStart={(e) => {
                      e.preventDefault();
                    }}
                    onDragStartCapture={(e) => {
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      if (dragRef.current.moved) {
                        e.preventDefault();
                        e.stopPropagation();
                        dragRef.current.moved = false;
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: '161px',
                      left: `${leftPx}px`,
                      userSelect: 'none',
                      WebkitUserDrag: 'none'
                    }}
                  >
                    <div style={{ ...textBlockStyle, position: 'relative' }}>
                      <div className="overflow-hidden flex items-center justify-center" style={tileStyle} data-component="product-tile">
                        {img ? (
                          <img
                            src={img}
                            alt={imageAlt}
                            draggable={false}
                            onDragStart={(e) => {
                              e.preventDefault();
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              padding: '48px',
                              userSelect: 'none',
                              WebkitUserDrag: 'none'
                            }}
                            loading="eager"
                            decoding="async"
                          />
                        ) : null}
                      </div>

                      <div style={{ marginTop: '8px', fontFamily: 'Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif' }}>
                        <div>
                          <div style={{ position: 'relative', top: '3px', marginTop: '2px', fontSize: '10px', fontWeight: 500, lineHeight: 1.2, color: 'hsl(var(--muted-foreground))', fontKerning: 'normal', letterSpacing: '0.14em' }}>
                            THE HUMAN INSIDE
                          </div>
                          <div style={{ position: 'relative', top: '6px', fontSize: '14px', fontWeight: 500, lineHeight: 1.1, color: 'hsl(var(--foreground))' }}>
                            IRON KONG
                          </div>
                          <div style={{ position: 'relative', top: '7px', left: '-1px', marginTop: '6px', fontSize: '14px', fontWeight: 400, lineHeight: 1.1, color: 'hsl(var(--foreground))' }}>
                            19,99 €
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div data-section="footer">
        <Footer />
      </div>
    </div>
  );
}
