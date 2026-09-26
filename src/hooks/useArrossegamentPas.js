/**
 * ARROSSEGAR AMB EL DIT, D'UN EN UN (26/09/2026)
 * -----------------------------------------------------------------------------
 * La tira de colors 14x1 i la franja de samarretes s'havien de poder moure amb
 * el dit, no nome's amb la rodeta (ho va demanar l'amo).
 *
 * Aquest ganxo converteix un arrossegament horitzontal en passos, amb la
 * mateixa unitat que la rodeta (un pas per cada `pxPerPas` de dit), i deixa
 * passar els TOCS: fins que el dit no ha viatjat `llindarTapPx`, el gest no es
 * nostre i el clic de sota es fa com sempre (una samarreta, una barra de color).
 *
 * Detalls que importen:
 *   - `touch-action: pan-y` a l'element deix que el navegador segueixi fent el
 *     desplaçament VERTICAL de la pagina i ens dona l'horitzontal.
 *   - El punter es captura nome's quan el gest ja es nostre (`setPointerCapture`),
 *     aixi no es perd si el dit surt de l'element.
 *   - El sentit es el d'un carrusel: arrossegar cap a l'esquerra avança.
 *
 * @param {object} ref referència a l'element que rep el gest
 * @param {object} o
 * @param {(passos:number)=>void} o.onPas què fer amb cada pas (+1 avança)
 * @param {boolean} [o.actiu=true] si el gest està actiu
 * @param {number} [o.pxPerPas=30] px de dit per pas
 * @param {number} [o.llindarTapPx=6] px a partir dels quals el gest és nostre
 */
import { useEffect } from 'react';

export default function useArrossegamentPas(ref, {
  onPas,
  actiu = true,
  pxPerPas = 30,
  llindarTapPx = 6,
} = {}) {
  useEffect(() => {
    const el = ref && ref.current;
    if (!el || !actiu || typeof onPas !== 'function') return undefined;

    let id = null;
    let ultimX = 0;
    let viatjat = 0;
    let acumulat = 0;
    let capturat = false;

    const baixar = (e) => {
      if (id !== null) return;
      id = e.pointerId;
      ultimX = e.clientX;
      viatjat = 0;
      acumulat = 0;
      capturat = false;
    };

    const moure = (e) => {
      if (id === null || e.pointerId !== id) return;
      const dx = e.clientX - ultimX;
      ultimX = e.clientX;
      viatjat += Math.abs(dx);
      if (!capturat) {
        if (viatjat <= llindarTapPx) return;
        capturat = true;
        try { el.setPointerCapture(e.pointerId); } catch { /* s'ignora */ }
      }
      acumulat += dx;
      while (Math.abs(acumulat) >= pxPerPas) {
        const avanca = acumulat < 0;
        acumulat += avanca ? pxPerPas : -pxPerPas;
        onPas(avanca ? 1 : -1);
      }
    };

    const aixecar = (e) => {
      if (id === null || (e && e.pointerId !== id)) return;
      if (capturat) {
        try { el.releasePointerCapture(id); } catch { /* s'ignora */ }
      }
      id = null;
      viatjat = 0;
      acumulat = 0;
      capturat = false;
    };

    el.addEventListener('pointerdown', baixar);
    el.addEventListener('pointermove', moure);
    el.addEventListener('pointerup', aixecar);
    el.addEventListener('pointercancel', aixecar);
    return () => {
      el.removeEventListener('pointerdown', baixar);
      el.removeEventListener('pointermove', moure);
      el.removeEventListener('pointerup', aixecar);
      el.removeEventListener('pointercancel', aixecar);
    };
  }, [ref, onPas, actiu, pxPerPas, llindarTapPx]);
}
