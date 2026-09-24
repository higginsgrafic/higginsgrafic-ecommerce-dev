import { useLayoutEffect, useState } from 'react';
import { factorFranjaCarril } from '../utils/franjaCarril';

/**
 * useEscalaFranjaCarril — el factor que fa que la filera de cossos de la franja
 * de samarretes faci exactament l'amplada del carril.
 *
 * El calcul es a `factorFranjaCarril`; aqui nome's es mesura quan fa la filera
 * i quant fa el carril, i es torna a mesurar quan canvia qualsevol de les dues
 * coses:
 *
 *   - canvia la mida de l'element (la seva alcada penja del carril);
 *   - canvia la variable del carril sense que l'element es mogui (a la franja
 *     estreta l'alcada es fixa).
 *
 * A la vista vertical la franja no va dins d'un carril (hi viu dins d'una
 * filera escalada, amb el seu propi calibratge), i per aixo `actiu` hi arriba
 * fals: llavors el factor es 1 i la franja queda com estava.
 *
 * @param {object} filaRef - ref de la filera (l'inline-block que conte la imatge).
 * @param {boolean} actiu - si la franja s'ha d'ajustar al carril.
 * @returns {number} factor que multiplica el calibratge (1 quan no s'hi aplica).
 */
export default function useEscalaFranjaCarril(filaRef, actiu) {
  const [factor, setFactor] = useState(1);

  useLayoutEffect(() => {
    if (!actiu) {
      setFactor(1);
      return undefined;
    }
    const el = filaRef.current;
    if (!el) return undefined;

    const mesura = () => {
      const ampleDibuix = el.offsetWidth;
      if (!ampleDibuix) return;
      const carril = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'),
      );
      const nou = factorFranjaCarril(carril, ampleDibuix);
      // Sense el marge, cada mesura tornaria a pintar i el ResizeObserver no
      // pararia.
      setFactor((actual) => (Math.abs(actual - nou) < 0.0005 ? actual : nou));
    };

    // La primera mesura no espera cap frame: useLayoutEffect ja es abans del
    // pintat, i la franja no s'ha de veure un instant a la mida de disseny.
    mesura();

    let observador = null;
    if (typeof ResizeObserver !== 'undefined') {
      observador = new ResizeObserver(mesura);
      observador.observe(el);
    }
    const observadorEstil = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(mesura)
      : null;
    if (observadorEstil) {
      observadorEstil.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    }
    window.addEventListener('resize', mesura);

    return () => {
      if (observador) observador.disconnect();
      if (observadorEstil) observadorEstil.disconnect();
      window.removeEventListener('resize', mesura);
    };
  }, [filaRef, actiu]);

  return factor;
}
