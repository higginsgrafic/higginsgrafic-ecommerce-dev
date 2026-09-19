import { useState, useEffect } from 'react';

/**
 * useDeviceLayout — Detecció centralitzada i touch-aware del tipus de dispositiu.
 *
 * Aquest hook resol els problemes de la detecció anterior:
 *   1. El tall màgic a 1366px feia que tablets Android 16:10 (fins a 1600px)
 *      es classifiquessin com a desktop.
 *   2. Les mides hardcoded per 1024×768 no escalaven a altres viewports.
 *
 * Criteri de detecció (NOMES MIDES: el touch no hi entra, perque la mateixa
 * finestra ha de donar sempre la mateixa maquetacio):
 *   - isTouch:        navigator.maxTouchPoints > 0 (fallback ontouchstart). Nomes informatiu.
 *   - isMobile:       width < 600.
 *   - isPortraitTablet: 600 ≤ width ≤ 1024 + height > width.
 *   - isLandscapeTablet: 768 ≤ width ≤ 1366 + height < width + height ≤ 1100.
 *                       (L'alçada ≤ 1100 separa tablet de monitor desktop.)
 *   - isDesktop:      !tablet + width ≥ 1024.
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

    const vw = window.innerWidth || 0;
    const vh = window.innerHeight || 0;

    const isMobile = vw < 600;
    // Mateixes regles que les pagines (vegeu `esTauletaApaisada` a
    // layoutMetrics): NOMES mides, sense touch. Si el touch hi entra, la
    // mateixa finestra dona dues maquetacions diferents.
    const isPortraitTablet =
      vw >= 600 && vw <= 1024 && vh > vw;
    const isLandscapeTablet =
      vw >= 768 && vw <= 1366 && vh < vw && vh > 0 && vh <= 1100;
    const isDesktop =
      (!isPortraitTablet && !isLandscapeTablet && vw >= 1024);

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
