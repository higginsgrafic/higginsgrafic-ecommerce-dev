import React, { useEffect, useLayoutEffect, useState } from 'react';

/**
 * BeltReferenceOverlay
 * -----------------------------------------------------------------------------
 * Overlay de debug que mesura ancoratges DOM (header, cistell, checkout) i
 * publica al :root les CSS vars `--belt2-xL`, `--belt2-xR`, `--belt2-yT`,
 * `--belt2-yB`. Dibuixa cinc línies verdes de referència visual.
 *
 * IMPORTANT: les variables `--belt2-*` són per a debug i overlays. El layout
 * productiu del site NO ha de dependre directament d'elles. Per a layout
 * productiu, fer servir `@/utils/layoutMetrics` (`getSafeBelt`, etc.).
 *
 * Aquesta versió és l'extracció directa del component que estava inline a
 * App.jsx, sense canvis funcionals. La fase 2 del refactor anirà afegint
 * validació, reset cross-route, listeners explícits i probe de diagnòstic.
 */
export default function BeltReferenceOverlay({ enabled }) {
  const [state, setState] = useState(() => {
    try {
      const rawBelt2 = window.localStorage.getItem('HG_BELT2_GLOBAL_V1');
      const raw = window.localStorage.getItem('HG_BELT_GUIDES_GLOBAL_V1');
      const parsedBelt2 = rawBelt2 ? JSON.parse(rawBelt2) : null;
      if (!raw && !parsedBelt2) return { xL: null, xR: null, yT: null, yB: null, yCarouselTop: null, yFinalizeBottom: null, spriteXL: null, spriteXR: null };
      const parsed = raw ? JSON.parse(raw) : {};
      if (!parsed || typeof parsed !== 'object') return { xL: null, xR: null, yT: null, yB: null, yCarouselTop: null, yFinalizeBottom: null, spriteXL: null, spriteXR: null };
      const toFiniteOrNull = (v) => (Number.isFinite(v) ? v : null);
      return {
        xL: toFiniteOrNull(parsedBelt2?.xL ?? parsed.xL),
        xR: toFiniteOrNull(parsedBelt2?.xR ?? parsed.xR),
        yT: toFiniteOrNull(parsed.yT),
        yB: toFiniteOrNull(parsed.yB),
        yCarouselTop: toFiniteOrNull(parsedBelt2?.yCarouselTop ?? parsed.yCarouselTop),
        yFinalizeBottom: toFiniteOrNull(parsedBelt2?.yFinalizeBottom ?? parsed.yFinalizeBottom),
        spriteXL: toFiniteOrNull(parsed.spriteXL),
        spriteXR: toFiniteOrNull(parsed.spriteXR),
      };
    } catch {
      return { xL: null, xR: null, yT: null, yB: null, yCarouselTop: null, yFinalizeBottom: null, spriteXL: null, spriteXR: null };
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('HG_BELT_GUIDES_GLOBAL_V1', JSON.stringify(state));
      window.localStorage.setItem(
        'HG_BELT2_GLOBAL_V1',
        JSON.stringify({
          xL: state.xL,
          xR: state.xR,
          yCarouselTop: state.yCarouselTop,
          yFinalizeBottom: state.yFinalizeBottom,
        })
      );
    } catch {
      // ignore
    }
  }, [state.xL, state.xR, state.yT, state.yB, state.yCarouselTop, state.yFinalizeBottom, state.spriteXL, state.spriteXR]);

  useEffect(() => {
    try {
      const root = document.documentElement;
      const setOrClear = (key, value) => {
        if (Number.isFinite(value)) {
          root.style.setProperty(key, `${Math.round(value)}px`);
        } else {
          root.style.removeProperty(key);
        }
      };
      setOrClear('--belt2-xL', state.xL);
      setOrClear('--belt2-xR', state.xR);
      setOrClear('--belt2-yT', state.yCarouselTop);
      setOrClear('--belt2-yB', state.yFinalizeBottom);
    } catch {
      // ignore
    }
  }, [state.xL, state.xR, state.yCarouselTop, state.yFinalizeBottom]);

  useLayoutEffect(() => {
    if (!enabled) {
      return undefined;
    }

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
      const cartCardTopAnchor = document.getElementById('stripe-guide-cart-card-top-anchor');
      const finalizeOrderBtn = document.getElementById('stripe-guide-finalize-order');
      const cartViewportAnchor = document.getElementById('stripe-guide-cart-viewport-anchor');
      const headerLogoMarkAnchor = document.getElementById('stripe-guide-header-logo-mark-anchor');
      const headerLogoAnchor = document.getElementById('stripe-guide-header-logo-anchor');
      const userIconAnchor = document.getElementById('stripe-guide-user-icon-anchor');
      const checkoutTopAnchor = document.getElementById('stripe-guide-checkout-top-anchor');
      const checkoutPayDesktop = document.getElementById('stripe-guide-checkout-pay-desktop');
      const checkoutPayMobile = document.getElementById('stripe-guide-checkout-pay-mobile');
      const checkoutBottomAnchor = document.getElementById('stripe-guide-checkout-bottom-anchor');
      const checkoutInvoiceBottomAnchor = document.getElementById('stripe-guide-checkout-invoice-bottom-anchor');
      const belt2LeftOffsetPx = -2;

      const xLRaw = resolveX(headerLogoMarkAnchor, 'left') ?? resolveX(headerLogoAnchor, 'left') ?? resolveX(leftAnchor, 'left') ?? resolveX(cartViewportAnchor, 'left');
      const xL = Number.isFinite(xLRaw) ? Math.round(xLRaw + belt2LeftOffsetPx) : xLRaw;
      const spriteXL = resolveX(stripeImg, 'left');
      const spriteXR = resolveX(stripeImg, 'right');
      const xR = resolveX(userIconAnchor, 'right') ?? resolveX(rightArrow, 'right') ?? resolveX(cartViewportAnchor, 'right');
      const yCarouselTop = resolveY(cartCardTopAnchor, 'top');
      const yFinalizeBottom = resolveY(finalizeOrderBtn, 'bottom');
      const fullWideYTop = resolveY(cartCardTopAnchor, 'top') ?? resolveY(stripeImg, 'top');
      const checkoutYTop = resolveY(checkoutTopAnchor, 'top');
      const checkoutLayoutYTop = resolveY(document.getElementById('stripe-guide-checkout-layout-top-anchor'), 'top');
      const yT = Number.isFinite(fullWideYTop)
        ? fullWideYTop
        : (Number.isFinite(checkoutLayoutYTop) ? checkoutLayoutYTop : checkoutYTop);
      const yTWithOffset = Number.isFinite(yT) ? yT + 20 : yT;

      const fullWideYBottom = resolveY(finalizeOrderBtn, 'bottom') ?? resolveY(stripeImg, 'bottom');
      const checkoutYBottom =
        resolveY(checkoutPayDesktop, 'bottom') ??
        resolveY(checkoutPayMobile, 'bottom') ??
        resolveY(checkoutInvoiceBottomAnchor, 'bottom') ??
        resolveY(checkoutBottomAnchor, 'bottom');
      const checkoutLayoutYBottom = resolveY(document.getElementById('stripe-guide-checkout-layout-bottom-anchor'), 'bottom');
      const yB = Number.isFinite(fullWideYBottom)
        ? fullWideYBottom
        : (Number.isFinite(checkoutLayoutYBottom) ? checkoutLayoutYBottom : checkoutYBottom);

      setState((prev) => {
        const next = {
          xL: Number.isFinite(xL) ? xL : prev.xL,
          xR: Number.isFinite(xR) ? xR : prev.xR,
          yT: Number.isFinite(yTWithOffset) ? yTWithOffset : prev.yT,
          yB: Number.isFinite(yB) ? yB : prev.yB,
          yCarouselTop: Number.isFinite(yCarouselTop) ? yCarouselTop : prev.yCarouselTop,
          yFinalizeBottom: Number.isFinite(yFinalizeBottom) ? yFinalizeBottom : prev.yFinalizeBottom,
          spriteXL: Number.isFinite(spriteXL) ? spriteXL : prev.spriteXL,
          spriteXR: Number.isFinite(spriteXR) ? spriteXR : prev.spriteXR,
        };
        if (
          prev.xL === next.xL &&
          prev.xR === next.xR &&
          prev.yT === next.yT &&
          prev.yB === next.yB &&
          prev.yCarouselTop === next.yCarouselTop &&
          prev.yFinalizeBottom === next.yFinalizeBottom &&
          prev.spriteXL === next.spriteXL &&
          prev.spriteXR === next.spriteXR
        ) {
          return prev;
        }
        return next;
      });
    };

    // Mesurament inicial + reintents per als anchors que es renderitzen tard
    // (lazy chunks, fonts, imatges).
    read();
    const t1 = window.setTimeout(read, 50);
    const t2 = window.setTimeout(read, 250);
    const t3 = window.setTimeout(read, 750);

    // Re-mesura reactiva: en resize/scroll i quan canvia la mida d'algun
    // descendent del body. RequestAnimationFrame per evitar mesures
    // duplicades en el mateix frame.
    let raf = 0;
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(read);
    };

    const onScroll = () => schedule();
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });

    let ro = null;
    try {
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(schedule);
        ro.observe(document.body);
      }
    } catch {
      // ignore
    }

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', onScroll, { capture: true });
      if (ro) ro.disconnect();
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
      {Number.isFinite(state.xL) && Number.isFinite(state.xR) ? (
        <div style={{ position: 'fixed', left: Math.round((state.xL + state.xR) / 2), top: 0, height: '100vh', width: 0, borderLeft: `1px solid ${color}` }} />
      ) : null}
      {Number.isFinite(state.yCarouselTop) ? (
        <div style={{ position: 'fixed', left: 0, top: state.yCarouselTop, width: '100vw', height: 0, borderTop: `1px solid ${color}` }} />
      ) : null}
      {Number.isFinite(state.yFinalizeBottom) ? (
        <div style={{ position: 'fixed', left: 0, top: state.yFinalizeBottom, width: '100vw', height: 0, borderTop: `1px solid ${color}` }} />
      ) : null}
    </div>
  );
}
