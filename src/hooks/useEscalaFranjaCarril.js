import { useLayoutEffect, useState } from 'react';
import { factorFranjaCarril, ESCALA_CALIBRADA_FRANJA } from '../utils/franjaCarril';

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
/**
 * L'amplada que ha de fer la filera de cossos: de la VORA ESQUERRA DEL CARRIL a
 * la DRETA DEL BLOC DE FLETXES. Quan no hi ha fletxes (tauletes) es el carril
 * sencer, que es com estava.
 *
 * @returns {number} amplada en px (0 si no es pot mesurar).
 */
function ampladaObjectiu() {
  if (typeof document === 'undefined') return 0;
  const carril = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'),
  );
  const xCarril = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-x'),
  );
  const fletxes = [...document.querySelectorAll('[data-carrusel="1"] #stripe-guide-right-arrow')]
    .filter((el) => el.getBoundingClientRect().width > 0);
  const fletxa = fletxes[fletxes.length - 1];
  if (fletxa && Number.isFinite(xCarril)) {
    // LA FLETXA, DINS LA SEVA PAGINA. El megaslide te totes les pagines al DOM,
    // desplacades amb `translateX`: quan se'n veu una altra, la `right` de les
    // fletxes del carrusel va desplaçada amb la pagina (1905 px) i l'objectiu
    // sortia 2,7 cops mes gran (mesurat: la franja feia 3042 px en comptes de
    // 1049). Descomptant-hi el desplaçament de la pagina, la franja de la
    // pagina 1 i la de la pagina 2 surten de la MATEIXA mida, que es el que es
    // vol (24/09/2026, ho va demanar l'amo).
    const pagina = fletxa.closest('[data-mega-page-viewport]');
    const desplac = pagina ? pagina.getBoundingClientRect().left : 0;
    const dreta = fletxa.getBoundingClientRect().right - desplac;
    if (dreta - xCarril > 0) return dreta - xCarril;
  }
  return Number.isFinite(carril) && carril > 0 ? carril : 0;
}

export default function useEscalaFranjaCarril(filaRef, actiu) {
  const [estat, setEstat] = useState({ factor: 1, centre: 0 });

  useLayoutEffect(() => {
    if (!actiu) return undefined;
    const el = filaRef.current;
    if (!el) return undefined;

    const mesura = () => {
      const ampleDibuix = el.offsetWidth;
      if (!ampleDibuix) return;
      const estil = getComputedStyle(document.documentElement);
      const objectiu = ampladaObjectiu();
      if (!objectiu) return;
      // L'ESCALA CALIBRADA, LLEGIDA DEL DOM I NO LA NOMINAL.
      //
      // El factor es calcula contra l'escala que la franja porta posada
      // (`--megaStripeScale`, que surt del calibratge de l'HUD i es desa al
      // navegador). Si es dividis sempre pel valor nominal (1,2125) i el
      // navegador en tingués un altre de desat, el resultat quedaria multiplicat
      // per la diferència: amb un 0,97 desat, la franja sortia un 20% més
      // estreta del carril (cintures a 495,9..1410,4 en comptes de
      // 381,7..1524,9) i cap arranjament no es veia. La regla es que la franja
      // faci el carril: el calibratge desat no hi pot manar.
      const escalaViva = Number.parseFloat(estil.getPropertyValue('--megaStripeScale'));
      const escala = Number.isFinite(escalaViva) && escalaViva > 0 ? escalaViva : ESCALA_CALIBRADA_FRANJA;
      const nou = factorFranjaCarril(objectiu, ampleDibuix, escala);
      // El centre de la filera: a mig cami entre la vora esquerra del carril i
      // la dreta de les fletxes, que es on ha de caure el centre del dibuix.
      const centre = objectiu / 2;
      // Sense el marge, cada mesura tornaria a pintar i el ResizeObserver no
      // pararia.
      setEstat((actual) => (
        Math.abs(actual.factor - nou) < 0.0005 && Math.abs(actual.centre - centre) < 0.5
          ? actual
          : { factor: nou, centre }
      ));
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

  // Quan no s'hi aplica (la vista vertical), no es toca res: es fa aqui i no
  // dins de l'efecte, que no ha de cridar `setState`.
  return actiu ? estat : { factor: 1, centre: null };
}
