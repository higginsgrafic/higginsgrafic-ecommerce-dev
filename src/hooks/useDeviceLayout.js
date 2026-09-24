import { useState, useEffect } from 'react';
import { deviceLayoutFromViewport } from '@/utils/layoutModel';

/**
 * useDeviceLayout — el tipus de dispositiu, LLEGIT DEL MODEL UNIC.
 *
 * AQUEST HOOK JA NO DECIDEIX RES (24/09/2026). Decideix `layoutModel`, en un
 * sol lloc i amb una sola regla (la matriu d'amplada i alcada); aqui nome's
 * s'hi afegeix el touch, que es informatiu.
 *
 * PER QUE. Les regles estaven escrites DUES vegades —una en aquest hook i una
 * altra a `deviceLayoutFromViewport`— i dues copies de la mateixa regla son
 * dues regles: el dia que se n'actualitza una, l'altra queda enrere i la
 * mateixa finestra dona dues maquetacions segons qui pregunti. Ja va passar
 * amb l'alçada de la capçalera (`116` en un lloc i `123` en un altre).
 *
 * Criteri (nomes mides; el touch no hi entra):
 *   - isMobile:          width < 600, o be mes ample que alt i encara < 768.
 *   - isPortraitTablet:  height > width i width <= 1024.
 *   - isLandscapeTablet: height < width, width <= 1366 i height <= 1100.
 *   - isDesktop:         la resta.
 *
 * Retorna a més viewportWidth i viewportHeight per a càlculs fluids.
 */
export default function useDeviceLayout() {
  const compute = () => {
    const isTouch = typeof window === 'undefined'
      ? false
      : (typeof navigator !== 'undefined' &&
          typeof navigator.maxTouchPoints === 'number' &&
          navigator.maxTouchPoints > 0) ||
        'ontouchstart' in window;

    return {
      // L'AMPLADA DE LA CLASSIFICACIO ES LA DE LA FINESTRA, NO LA DE
      // MAQUETACIO. Els trencaments del CSS (`@media`) es miren amb la
      // finestra (inclouen la barra de desplacament): si aqui es fes servir
      // l'amplada de maquetacio (15 px menys), una finestra just a la vora
      // cauria en una classe diferent de la que aplica el CSS i es veuria un
      // layout que no toca. El carril, en canvi, si que va amb l'amplada de
      // maquetacio (vegeu getLayoutViewportWidth): allo es on es maqueta.
      ...deviceLayoutFromViewport(
        typeof window !== 'undefined' ? window.innerWidth || 0 : 0,
        typeof window !== 'undefined' ? window.innerHeight || 0 : 0,
      ),
      isTouch,
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
  }, []);

  return state;
}
