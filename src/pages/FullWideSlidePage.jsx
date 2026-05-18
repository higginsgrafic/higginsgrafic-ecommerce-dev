import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullWideSlideDemoHeader from '@/components/FullWideSlideDemoHeader';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import useComponentCatalogConfig from '@/hooks/useComponentCatalogConfig';
import { useProductContext } from '@/contexts/ProductContext';

export default function FullWideSlidePage({ pautaEnabled = false, tableEnabled = false }) {
  const { config: componentCatalogConfig, loading: componentCatalogLoading, error: componentCatalogError } = useComponentCatalogConfig();
  const navigate = useNavigate();
  const { getTotalItems } = useProductContext();
  const pageRef = useRef(null);
  const [pautaTopOffsetPx, setPautaTopOffsetPx] = useState(0);

  const fullWideSlide = componentCatalogConfig?.components?.fullWideSlide;
  const megaMenu = fullWideSlide?.megaMenu;
  const resolvedNavItems = Array.isArray(megaMenu?.navItems) && megaMenu.navItems.length > 0 ? megaMenu.navItems : undefined;
  const resolvedMegaConfig =
    megaMenu?.megaConfig && typeof megaMenu.megaConfig === 'object' && Object.keys(megaMenu.megaConfig).length > 0 ? megaMenu.megaConfig : undefined;

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevScrollbarGutter = document.documentElement.style.scrollbarGutter;
    const prevBodyScrollbarGutter = document.body.style.scrollbarGutter;

    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-fw-hide-scrollbars', '1');
    styleEl.textContent = `
html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
html, body { scrollbar-width: none; }
`;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.scrollbarGutter = 'auto';
    document.body.style.scrollbarGutter = 'auto';

    try {
      document.head.appendChild(styleEl);
    } catch {
      // ignore
    }

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.scrollbarGutter = prevScrollbarGutter;
      document.body.style.scrollbarGutter = prevBodyScrollbarGutter;

      try {
        styleEl.remove();
      } catch {
        // ignore
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const measure = () => {
      const pageEl = pageRef.current;
      const headerEl = pageEl?.querySelector?.('header');
      if (!pageEl || !headerEl) return;

      const pageRect = pageEl.getBoundingClientRect();
      const headerRect = headerEl.getBoundingClientRect();
      const nextTop = Math.max(0, Math.round((headerRect.bottom - pageRect.top) * 100) / 100);
      setPautaTopOffsetPx((prev) => (Math.abs(prev - nextTop) < 0.5 ? prev : nextTop));
    };

    measure();
    const t1 = window.setTimeout(measure, 50);
    const t2 = window.setTimeout(measure, 250);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
    const params = new URLSearchParams(window.location.search);
    if (!params.has('debugOverflow')) {
      try {
        const marked = Array.from(document.querySelectorAll('[data-debug-overflow]'));
        marked.forEach((el) => {
          try {
            el.removeAttribute('data-debug-overflow');
            if (el?.style) {
              el.style.outline = '';
              el.style.outlineOffset = '';
            }
          } catch {
            // ignore
          }
        });

        const nodes = Array.from(document.querySelectorAll('body *'));
        nodes.forEach((el) => {
          try {
            if (!el?.style) return;
            const o = (el.style.outline || '').toString();
            if (!o) return;
            if (o.includes('rgba(255,0,0,0.65)')) {
              el.style.outline = '';
              el.style.outlineOffset = '';
            }
          } catch {
            // ignore
          }
        });
      } catch {
        // ignore
      }
      return undefined;
    }

    const pick = (el) => {
      if (!el || el.nodeType !== 1) return null;
      const cs = window.getComputedStyle(el);
      const overflowY = cs.overflowY;
      const overflowX = cs.overflowX;
      const ch = el.clientHeight;
      const sh = el.scrollHeight;
      const cw = el.clientWidth;
      const sw = el.scrollWidth;
      const hasY = ch > 0 && sh - ch > 1 && overflowY !== 'visible';
      const hasX = cw > 0 && sw - cw > 1 && overflowX !== 'visible';
      if (!hasY && !hasX) return null;

      const rect = el.getBoundingClientRect();
      const tag = (el.tagName || '').toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const cls = typeof el.className === 'string' && el.className.trim() ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : '';

      return {
        el,
        tag,
        id,
        cls,
        overflowY,
        overflowX,
        clientH: ch,
        scrollH: sh,
        clientW: cw,
        scrollW: sw,
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        score: (sh - ch) * (hasY ? 1 : 0) + (sw - cw) * (hasX ? 0.25 : 0),
      };
    };

    const run = () => {
      try {
        try {
          const prev = Array.from(document.querySelectorAll('[data-debug-overflow]'));
          prev.forEach((el) => {
            try {
              el.removeAttribute('data-debug-overflow');
              if (el?.style) {
                el.style.outline = '';
                el.style.outlineOffset = '';
              }
            } catch {
              // ignore
            }
          });

          const nodes = Array.from(document.querySelectorAll('body *'));
          nodes.forEach((el) => {
            try {
              if (!el?.style) return;
              const o = (el.style.outline || '').toString();
              if (!o) return;
              if (o.includes('rgba(255,0,0,0.65)')) {
                el.style.outline = '';
                el.style.outlineOffset = '';
              }
            } catch {
              // ignore
            }
          });
        } catch {
          // ignore
        }

        const nodes = Array.from(document.querySelectorAll('body *'));
        const matches = nodes.map(pick).filter(Boolean);

        matches
          .sort((a, b) => b.score - a.score)
          .slice(0, 20)
          .forEach((m, idx) => {
            m.el.setAttribute('data-debug-overflow', `${idx + 1}`);
            m.el.style.outline = '2px solid rgba(255,0,0,0.65)';
            m.el.style.outlineOffset = '1px';
          });

        // eslint-disable-next-line no-console
        console.table(
          matches
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)
            .map((m) => ({
              node: `${m.tag}${m.id}${m.cls}`,
              overflowY: m.overflowY,
              overflowX: m.overflowX,
              clientH: m.clientH,
              scrollH: m.scrollH,
              deltaH: m.scrollH - m.clientH,
              clientW: m.clientW,
              scrollW: m.scrollW,
              deltaW: m.scrollW - m.clientW,
              top: m.top,
              left: m.left,
              h: m.height,
              w: m.width,
            }))
        );
      } catch {
        // ignore
      }
    };

    const t = window.setTimeout(run, 250);
    return () => window.clearTimeout(t);
  }, []);

  if (componentCatalogLoading && !componentCatalogConfig) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Carregant…</div>
      </div>
    );
  }

  if (!componentCatalogLoading && !componentCatalogConfig) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <div className="max-w-lg px-6 text-center">
          <div className="text-sm font-semibold text-foreground">{"No s'ha pogut carregar la config"}</div>
          <div className="mt-2 text-xs text-muted-foreground break-words">{componentCatalogError || 'Error carregant la config'}</div>
        </div>
      </div>
    );
  }

  if (fullWideSlide && fullWideSlide.enabled === false) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">FullWideSlide desactivat a la config.</div>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className="overflow-hidden bg-background"
      style={{
        paddingBottom: 'var(--megaStripeHudBottomHPx, 0px)',
        height: 'calc(100vh - var(--appHeaderOffset, 0px) - var(--megaStripeHudBottomHPx, 0px))',
      }}
    >
      <FullWideSlideDemoHeader
        cartItemCount={getTotalItems()}
        onCartClick={() => {
          navigate('/cart');
        }}
        onUserClick={() => {
          navigate('/profile');
        }}
        manualEnabledOverride={false}
        ignoreStripeDebugFromUrl
        navItems={resolvedNavItems}
        megaConfig={resolvedMegaConfig}
        showStripe={megaMenu?.showStripe !== false}
        showCatalogPanel={megaMenu?.showCatalogPanel !== false}
      />

      {/* Pauta de 4 columnes — overlay no-interactiu, alineat exacte a belt2.
          Visible quan TDP Pauta o TDP Taula estan actius. Serveix per
          validar que la pauta encaixa dins els límits del belt en una
          ruta on el belt2 ja és sòlid. */}
      {(pautaEnabled || tableEnabled) ? (
        <Pauta4ColsOverlay
          overlay
          pautaEnabled={pautaEnabled}
          tableEnabled={tableEnabled}
          topOffset={`${pautaTopOffsetPx}px`}
        />
      ) : null}
    </div>
  );
}
