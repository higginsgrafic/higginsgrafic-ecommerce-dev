import { useEffect, useMemo, useState } from 'react';

export default function useStripeOverlayDebug(locationSearch) {
  const [snapshot, setSnapshot] = useState(null);

  const debugOn = useMemo(() => {
    try {
      const sp = new URLSearchParams(locationSearch || '');
      const cur = String(sp.get('stripeOverlayDebug') || '').trim().toLowerCase();
      return sp.has('stripeOverlayDebug') && (cur === '' || cur === '1' || cur === 'true' || cur === 'on' || cur === 'yes');
    } catch {
      return false;
    }
  }, [locationSearch]);

  useEffect(() => {
    let alive = true;
    let t = null;
    const tick = () => {
      try {
        if (!alive) return;
        const snap = window.__HG_OVERLAY_DEBUG__ || null;
        setSnapshot((prev) => {
          if (!snap) return prev;
          const next = {
            stripeOverlayDebug: Boolean(snap.stripeOverlayDebug),
            showStripe: Boolean(snap.showStripe),
            active: String(snap.active || ''),
            resolvedOverlaySrc: String(snap.resolvedOverlaySrc || ''),
            stripeOverlayLoadState: String(snap.stripeOverlayLoadState || ''),
            stripeOverlayIsStripeWide: Boolean(snap.stripeOverlayIsStripeWide),
            stripeOverlayIsStripeWideDerived: snap.stripeOverlayIsStripeWideDerived == null ? null : Boolean(snap.stripeOverlayIsStripeWideDerived),
            stripeOverlayIsStripeWideMeasured: snap.stripeOverlayIsStripeWideMeasured == null ? null : Boolean(snap.stripeOverlayIsStripeWideMeasured),
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
  }, [locationSearch]);

  return { snapshot, debugOn };
}
