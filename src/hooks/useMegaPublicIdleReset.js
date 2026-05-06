import { useEffect } from 'react';
import {
  MEGA_PUBLIC_IDLE_MS,
  readMegaPublicLastActivityAt,
  resetMegaPublicState,
} from '@/components/fullwide/megaPublicSelectorState.js';

/**
 * Schedules a reset of the mega public selector state when the user has been
 * idle for `MEGA_PUBLIC_IDLE_MS`. Re-arms whenever a `hg-mega-public-activity`
 * event fires.
 */
export default function useMegaPublicIdleReset() {
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return undefined;

      let t = null;
      const schedule = () => {
        if (t) window.clearTimeout(t);
        const last = readMegaPublicLastActivityAt();
        if (!last) return;
        const now = Date.now();
        const elapsed = now - last;
        if (elapsed >= MEGA_PUBLIC_IDLE_MS) {
          resetMegaPublicState();
          return;
        }
        const wait = Math.max(250, MEGA_PUBLIC_IDLE_MS - elapsed);
        t = window.setTimeout(() => {
          schedule();
        }, wait);
      };

      const onActivity = () => schedule();
      window.addEventListener('hg-mega-public-activity', onActivity);

      schedule();
      return () => {
        window.removeEventListener('hg-mega-public-activity', onActivity);
        if (t) window.clearTimeout(t);
      };
    } catch {
      return undefined;
    }
  }, []);
}
