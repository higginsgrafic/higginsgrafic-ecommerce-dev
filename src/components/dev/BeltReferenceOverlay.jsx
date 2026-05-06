import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

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
 * Característiques:
 *  - Mesurament reactiu via resize/scroll listeners + ResizeObserver (sense
 *    polling actiu).
 *  - Reset automàtic de Y específiques de pàgina en canviar de ruta.
 *  - Validació de coherència abans de publicar (xR>xL, dins viewport, etc.).
 *    Si els valors són incoherents, retira les vars en lloc de publicar
 *    valors corruptes; en mode DEV emet console.warn.
 *  - Probe `window.__HG_BELT2_PROBE__()` per inspeccionar des de la consola.
 *  - Persistència mínima: només camps globals (X, sprite). Les Y mai es
 *    persisteixen perquè depenen de la pàgina visible.
 */
const STORAGE_KEY_V2 = 'HG_DEV_BELT2_STATE_V2';
// Keys legacy per migració (mai escrits per aquesta versió).
const LEGACY_KEY_GLOBAL = 'HG_BELT2_GLOBAL_V1';
const LEGACY_KEY_GUIDES = 'HG_BELT_GUIDES_GLOBAL_V1';

const EMPTY_STATE = {
  xL: null,
  xR: null,
  yT: null,
  yB: null,
  yCarouselTop: null,
  yFinalizeBottom: null,
  spriteXL: null,
  spriteXR: null,
};

const toFiniteOrNull = (v) => (Number.isFinite(v) ? v : null);

const loadInitialState = () => {
  if (typeof window === 'undefined') return { ...EMPTY_STATE };
  try {
    // Format V2 (només camps globals: X i sprite). Y mai persistides.
    const rawV2 = window.localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && typeof parsed === 'object') {
        return {
          ...EMPTY_STATE,
          xL: toFiniteOrNull(parsed.xL),
          xR: toFiniteOrNull(parsed.xR),
          spriteXL: toFiniteOrNull(parsed.spriteXL),
          spriteXR: toFiniteOrNull(parsed.spriteXR),
        };
      }
    }

    // Migració des dels keys legacy: només recuperem X i sprite.
    const rawLegacyGlobal = window.localStorage.getItem(LEGACY_KEY_GLOBAL);
    const rawLegacyGuides = window.localStorage.getItem(LEGACY_KEY_GUIDES);
    if (!rawLegacyGlobal && !rawLegacyGuides) return { ...EMPTY_STATE };
    const parsedGlobal = rawLegacyGlobal ? JSON.parse(rawLegacyGlobal) : null;
    const parsedGuides = rawLegacyGuides ? JSON.parse(rawLegacyGuides) : null;
    return {
      ...EMPTY_STATE,
      xL: toFiniteOrNull(parsedGlobal?.xL ?? parsedGuides?.xL),
      xR: toFiniteOrNull(parsedGlobal?.xR ?? parsedGuides?.xR),
      spriteXL: toFiniteOrNull(parsedGuides?.spriteXL),
      spriteXR: toFiniteOrNull(parsedGuides?.spriteXR),
    };
  } catch {
    return { ...EMPTY_STATE };
  }
};

export default function BeltReferenceOverlay({ enabled }) {
  const location = useLocation();
  const [state, setState] = useState(loadInitialState);

  // Persistència: només camps globals (X i sprite). Les Y depenen de la
  // pàgina i no s'han de persistir mai (en sessions futures donarien
  // valors caducs a altres rutes).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY_V2,
        JSON.stringify({
          xL: state.xL,
          xR: state.xR,
          spriteXL: state.spriteXL,
          spriteXR: state.spriteXR,
        })
      );
    } catch {
      // ignore
    }
  }, [state.xL, state.xR, state.spriteXL, state.spriteXR]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const root = document.documentElement;
      const vw = window.innerWidth || document.documentElement.clientWidth || 0;

      const publish = (key, value) => {
        root.style.setProperty(key, `${Math.round(value)}px`);
      };
      const clear = (key) => {
        root.style.removeProperty(key);
      };

      // Validació de coherència X (xL, xR): han de ser un parell vàlid abans
      // de publicar. Si no, retirem ambdós perquè els consumidors caiguin al
      // seu fallback en lloc de llegir valors corruptes.
      const xL = state.xL;
      const xR = state.xR;
      const xValid =
        Number.isFinite(xL) &&
        Number.isFinite(xR) &&
        xL >= 0 &&
        xR > xL &&
        xR - xL >= 320 &&
        xR - xL <= 1500 &&
        xR <= vw + 8; // tolerància scrollbar / arrodoniments

      if (xValid) {
        publish('--belt2-xL', xL);
        publish('--belt2-xR', xR);
      } else {
        clear('--belt2-xL');
        clear('--belt2-xR');
        if (
          import.meta.env?.DEV &&
          (Number.isFinite(xL) || Number.isFinite(xR))
        ) {
          // eslint-disable-next-line no-console
          console.warn('[BeltReferenceOverlay] X bounds invalid, not publishing.', {
            xL,
            xR,
            vw,
          });
        }
      }

      // Validació de coherència Y (yCarouselTop, yFinalizeBottom).
      const yT = state.yCarouselTop;
      const yB = state.yFinalizeBottom;
      const yValid =
        Number.isFinite(yT) &&
        Number.isFinite(yB) &&
        yB > yT &&
        yB - yT >= 50;

      if (yValid) {
        publish('--belt2-yT', yT);
        publish('--belt2-yB', yB);
      } else {
        clear('--belt2-yT');
        clear('--belt2-yB');
        if (
          import.meta.env?.DEV &&
          (Number.isFinite(yT) || Number.isFinite(yB))
        ) {
          // eslint-disable-next-line no-console
          console.warn('[BeltReferenceOverlay] Y bounds invalid, not publishing.', {
            yT,
            yB,
          });
        }
      }
    } catch {
      // ignore
    }
  }, [state.xL, state.xR, state.yCarouselTop, state.yFinalizeBottom]);

  // Reset Y específiques de pàgina en canviar de ruta.
  // Les Y `yCarouselTop` (top del card del cistell) i `yFinalizeBottom` (botó
  // "Finalitza la comanda") són mesurades dins del mega-slide. Si l'usuari
  // surt del mega-slide, aquests anchors desapareixen i el `setState((prev)
  // => ...)` mantenia el valor antic, contaminant altres rutes (p.ex. el
  // checkout llegia uns valors que no eren seus).
  // Les X (xL/xR) provenen del header i del user icon, presents a totes les
  // rutes; per això no s'esborren aquí.
  useEffect(() => {
    setState((prev) => {
      const cleared = {
        ...prev,
        yT: null,
        yB: null,
        yCarouselTop: null,
        yFinalizeBottom: null,
      };
      if (
        prev.yT === cleared.yT &&
        prev.yB === cleared.yB &&
        prev.yCarouselTop === cleared.yCarouselTop &&
        prev.yFinalizeBottom === cleared.yFinalizeBottom
      ) {
        return prev;
      }
      return cleared;
    });

    try {
      const root = document.documentElement;
      root.style.removeProperty('--belt2-yT');
      root.style.removeProperty('--belt2-yB');
    } catch {
      // ignore
    }
  }, [location.pathname]);

  // Probe de diagnòstic: exposa l'estat actual i els valors publicats al
  // :root via `window.__HG_BELT2_PROBE__()`. Útil per inspeccionar des de
  // la consola sense React DevTools.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const ANCHOR_IDS = [
      'stripe-guide-left-anchor',
      'stripe-guide-right-arrow',
      'stripe-guide-header-logo-mark-anchor',
      'stripe-guide-header-logo-anchor',
      'stripe-guide-user-icon-anchor',
      'stripe-guide-cart-viewport-anchor',
      'stripe-guide-cart-card-top-anchor',
      'stripe-guide-finalize-order',
      'stripe-guide-checkout-top-anchor',
      'stripe-guide-checkout-bottom-anchor',
      'stripe-guide-checkout-layout-top-anchor',
      'stripe-guide-checkout-layout-bottom-anchor',
      'stripe-guide-checkout-pay-desktop',
      'stripe-guide-checkout-pay-mobile',
      'stripe-guide-checkout-invoice-bottom-anchor',
    ];

    window.__HG_BELT2_PROBE__ = () => {
      const cs = getComputedStyle(document.documentElement);
      const published = {
        '--belt2-xL': cs.getPropertyValue('--belt2-xL').trim(),
        '--belt2-xR': cs.getPropertyValue('--belt2-xR').trim(),
        '--belt2-yT': cs.getPropertyValue('--belt2-yT').trim(),
        '--belt2-yB': cs.getPropertyValue('--belt2-yB').trim(),
      };
      const anchors = {};
      for (const id of ANCHOR_IDS) {
        const el = document.getElementById(id);
        anchors[id] = el ? 'present' : 'missing';
      }
      return {
        enabled,
        pathname: location.pathname,
        state: { ...state },
        published,
        anchors,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };
    };

    return () => {
      try {
        delete window.__HG_BELT2_PROBE__;
      } catch {
        // ignore
      }
    };
  }, [enabled, state, location.pathname]);

  // Quan les guies belt2 es desactiven, neteja totes les CSS vars perquè cap
  // consumidor (overlays, layouts) llegeixi valors caducs.
  useEffect(() => {
    if (enabled) return undefined;
    try {
      const root = document.documentElement;
      root.style.removeProperty('--belt2-xL');
      root.style.removeProperty('--belt2-xR');
      root.style.removeProperty('--belt2-yT');
      root.style.removeProperty('--belt2-yB');
    } catch {
      // ignore
    }
    return undefined;
  }, [enabled]);

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
