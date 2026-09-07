import { useState, useEffect } from 'react';
import { getLayoutViewportWidth, getLayoutViewportHeight } from '@/utils/layoutMetrics';

/**
 * useDeviceLayout — Detecció centralitzada i touch-aware del tipus de dispositiu.
 *
 * Aquest hook resol els problemes de la detecció anterior:
 *   1. El tall màgic a 1366px feia que tablets Android 16:10 (fins a 1600px)
 *      es classifiquessin com a desktop.
 *   2. Les mides hardcoded per 1024×768 no escalaven a altres viewports.
 *
 * Criteri de detecció:
 *   - isTouch:        navigator.maxTouchPoints > 0 (fallback ontouchstart).
 *   - isMobile:       width < 768.
 *   - isPortraitTablet: touch + 768 ≤ width ≤ 1024 + height > width.
 *   - isLandscapeTablet: touch + width ≥ 768 + height < width + height ≤ 1100.
 *                       (L'alçada ≤ 1100 separa tablet de monitor desktop.
 *                        No hi ha cap superior d'amplada: una tablet de 1600px
 *                        entra correctament.)
 *   - isDesktop:      !touch + width ≥ 1024,  O  touch + width > 1600 + height > 1100.
 *
 * Retorna a més viewportWidth i viewportHeight per a càlculs fluids.
 */
export default function useDeviceLayout() {
  const compute = () => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isPortraitTablet: false,
        isLandscapeTablet: false,
        isDesktop: true,
        isLargeScreen: true,
        isTouch: false,
        viewportWidth: 0,
        viewportHeight: 0,
      };
    }

    const isTouch =
      (typeof navigator !== 'undefined' &&
        typeof navigator.maxTouchPoints === 'number' &&
        navigator.maxTouchPoints > 0) ||
      'ontouchstart' in window;

    const vw = getLayoutViewportWidth() || window.innerWidth || 0;
    const vh = getLayoutViewportHeight() || window.innerHeight || 0;

    const isMobile = vw < 768;
    const isPortraitTablet =
      isTouch && vw >= 768 && vw <= 1024 && vh > vw;
    const isLandscapeTablet =
      isTouch && vw >= 768 && vh < vw && vh > 0 && vh <= 1100;
    const isDesktop =
      (!isTouch && vw >= 1024) || (isTouch && vw > 1600 && vh > 1100);

    // isLargeScreen manté compat amb consumers existents que l'usen com a "desktop".
    const isLargeScreen = isDesktop;

    return {
      isMobile,
      isPortraitTablet,
      isLandscapeTablet,
      isDesktop,
      isLargeScreen,
      isTouch,
      viewportWidth: vw,
      viewportHeight: vh,
    };
  };

  const [state, setState] = useState(compute);

  useEffect(() => {
    const update = () => setState(compute());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
