import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullWideSlideDemoHeader from '@/components/FullWideSlideDemoHeader';
import useComponentCatalogConfig from '@/hooks/useComponentCatalogConfig';
import { useProductContext } from '@/contexts/ProductContext';

export default function FullWideSlidePage() {
  const { config: componentCatalogConfig, loading: componentCatalogLoading } = useComponentCatalogConfig();
  const navigate = useNavigate();
  const { getTotalItems } = useProductContext();

  const fullWideSlide = componentCatalogConfig?.components?.fullWideSlide;
  const megaMenu = fullWideSlide?.megaMenu;
  const resolvedNavItems = Array.isArray(megaMenu?.navItems) && megaMenu.navItems.length > 0 ? megaMenu.navItems : undefined;
  const resolvedMegaConfig =
    megaMenu?.megaConfig && typeof megaMenu.megaConfig === 'object' && Object.keys(megaMenu.megaConfig).length > 0 ? megaMenu.megaConfig : undefined;

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
    const params = new URLSearchParams(window.location.search);
    if (!params.has('debugOverflow')) return undefined;

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

  if (componentCatalogLoading && !componentCatalogConfig) return null;
  if (fullWideSlide && fullWideSlide.enabled === false) return null;

  return (
    <div className="h-[calc(100vh-var(--appHeaderOffset,0px))] overflow-hidden bg-background">
      <FullWideSlideDemoHeader
        cartItemCount={getTotalItems()}
        onCartClick={() => {
          navigate('/cart');
        }}
        onUserClick={() => {
          navigate('/profile');
        }}
        ignoreStripeDebugFromUrl
        navItems={resolvedNavItems}
        megaConfig={resolvedMegaConfig}
        showStripe={megaMenu?.showStripe !== false}
        showCatalogPanel={megaMenu?.showCatalogPanel !== false}
      />
    </div>
  );
}
