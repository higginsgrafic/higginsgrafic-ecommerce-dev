import { carrilMegaslide, CARRIL_MEGASLIDE_939_PX } from '@/utils/layoutModel';
import { useEffect, useState } from 'react';
import DevPortal, { DEV_LAYER_Z } from '@/components/dev/DevPortal';

/**
 * CarrilGuidesOverlay
 * -----------------------------------------------------------------------------
 * Les DUES guies verticals del carril: les seves vores, a `--hg-mega-x` i
 * `--hg-mega-x + --hg-mega-w`.
 *
 * PER QUE ES UN COMPONENT A PART (24/09/2026). Aquestes dues linies vivien
 * dins de `BeltReferenceOverlay`, que s'encen amb el commutador "Belt 2" i que
 * tambe dibuixa les seves propies linies (les verdes del marc del lloc, la del
 * mig i dues d'horitzontals de calibratge desades). Qui volia comprovar si una
 * peca cau dins del carril havia d'encendre tot allo i, a mes, es trobava una
 * linia horitzontal a mitja pantalla que no te res a veure amb el carril.
 *
 * Ara les guies del carril tenen el seu propi commutador ("Carril", o
 * `?carril=1`) i surten soles: dues linies i prou.
 *
 * Es dibuixen amb `calc` sobre les variables publicades i no amb una mesura:
 * la capçalera va `fixed` amb `marginLeft: calc(var(--hg-mega-x) -
 * var(--rulerInset))` i el seu pare arrenca a `--rulerInset`, o sigui que la
 * seva vora esquerra cau exactament a `--hg-mega-x` en coordenades de finestra,
 * que son les mateixes que fa servir `position: fixed`.
 */
const COLOR_CARRIL = 'rgba(37, 99, 235, 0.85)';
// LES SEGONES GUIES: EL CARRIL DE LA PAGINA (02/10/2026). En Marc: «Necessito
// unes segones guies per al segon carril». El de la pagina es
// `min(939px, 100vw - 80px)` centrat (el del header, la hero i la taula de la
// p1); el del megaslide es el de les guies blaves. Van amb el mateix commutador.
const COLOR_CARRIL_PAGINA = 'rgba(22, 163, 74, 0.85)';
const AMPLE_CARRIL_PAGINA_BASE = `min(${CARRIL_MEGASLIDE_939_PX}px, calc(100vw - 80px))`;

export default function CarrilGuidesOverlay({ enabled, onToggle }) {
  // EL CARRIL DEL MODEL, SI EN TE (03/10/2026). L'iPad Pro 13 apaïssat te el
  // seu (1100 px, vegeu `layoutModel`): les segones guies l'han d'ensenyar, que
  // son les que fa servir l'amo per comprovar que tot hi cau.
  const carrilModel = carrilMegaslide();
  const ampleCarrilPagina = carrilModel != null ? `${carrilModel}px` : AMPLE_CARRIL_PAGINA_BASE;
  // EL COMMUTADOR, TAMBE AMB EL TECLAT (02/10/2026). La barra de botons nome s
  // surt a les rutes d'edicio, pero aquestes guies es poden encendre a qualsevol
  // pagina (`?carril=1`): si s'encenen en una pagina sense barra, no hi ha cap
  // boto per apagar-les. Ho ha vist l'amo («les guies de carril no se'n van»).
  // Amb Alt+C s'encenen i s'apaguen des de qualsevol lloc; el boto de la barra
  // (on hi es) fa el mateix.
  //
  // AMB `e.code`, NO AMB `e.key` (02/10/2026). A un Mac, Opcio+C no dona la
  // lletra `c`: dona `ç`. El commutador mirava `e.key`, o sigui que a un Mac no
  // s'encenia mai (i, com que no arribava al `preventDefault`, a mes s'escrivia
  // la `ç`). `e.code` es la tecla FISICA i val igual a tot arreu.
  useEffect(() => {
    if (!onToggle) return undefined;
    const onKey = (e) => {
      if (e.altKey && (e.code === 'KeyC' || e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onToggle]);

  // LA GUIA DE LA DRETA DE LES FLETXES (24/09/2026, ho va demanar l'amo).
  //
  // El bloc de fletxes del carrusel es l'ultima cosa que hi ha abans de la
  // graella 4x4, i la seva vora dreta no es cap de les dues guies del carril.
  // Es mesura del DOM (`#stripe-guide-right-arrow` es la fletxa de la dreta, i
  // omple l'ample del bloc) perque el seu lloc depen de la graella de colors,
  // que es de mida `max-content`.
  const [xFletxes, setXFletxes] = useState(null);
  useEffect(() => {
    if (!enabled) return undefined;
    const calcula = () => {
      // L'id `stripe-guide-right-arrow` el porta la fletxa DINS del component,
      // i el component s'usa en quatre llocs: cal la de la filera de la pagina
      // 2 i VISIBLE (les altres son d'altres composicions o amagades).
      const fletxes = [...document.querySelectorAll('[data-carrusel="1"] #stripe-guide-right-arrow')]
        .filter((el) => el.getBoundingClientRect().width > 0);
      const fletxa = fletxes[fletxes.length - 1];
      if (!fletxa) {
        setXFletxes(null);
        return;
      }
      const x = Math.round(fletxa.getBoundingClientRect().right);
      setXFletxes((previ) => (previ === x ? previ : x));
    };
    // El megaslide s'obre i es tanca: la fletxa no hi es sempre. S'escolta el
    // canvi de mida del cos I el DOM (l'obertura hi afegeix el panell), amb una
    // passada per `requestAnimationFrame` perque les animacions del megaslide no
    // facin mesurar-se a cada mutacio.
    let frame = 0;
    const programa = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(calcula);
    };
    calcula();
    const t1 = window.setTimeout(calcula, 300);
    const t2 = window.setTimeout(calcula, 900);
    const observador = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(programa) : null;
    if (observador) observador.observe(document.body);
    const observadorDom = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(programa)
      : null;
    if (observadorDom) observadorDom.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', programa);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', programa);
      if (observador) observador.disconnect();
      if (observadorDom) observadorDom.disconnect();
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <DevPortal
      zIndex={DEV_LAYER_Z.belt}
      pointerEvents="none"
      className="debug-exempt"
      aria-hidden="true"
      data-dev-overlay="true"
    >
      <div
        data-guia-carril="esq"
        style={{
          position: 'fixed',
          left: 'var(--hg-mega-x, 0px)',
          top: 0,
          height: '100vh',
          width: 0,
          borderLeft: `1px solid ${COLOR_CARRIL}`,
        }}
      />
      <div
        data-guia-carril="dret"
        style={{
          position: 'fixed',
          left: 'calc(var(--hg-mega-x, 0px) + var(--hg-mega-w, 0px))',
          top: 0,
          height: '100vh',
          width: 0,
          borderLeft: `1px solid ${COLOR_CARRIL}`,
        }}
      />
      <div
        data-guia-carril-pagina="esq"
        style={{
          position: 'fixed',
          left: `calc((100vw - ${ampleCarrilPagina}) / 2)`,
          top: 0,
          height: '100vh',
          width: 0,
          borderLeft: `1px solid ${COLOR_CARRIL_PAGINA}`,
        }}
      />
      <div
        data-guia-carril-pagina="dret"
        style={{
          position: 'fixed',
          left: `calc((100vw + ${ampleCarrilPagina}) / 2)`,
          top: 0,
          height: '100vh',
          width: 0,
          borderLeft: `1px solid ${COLOR_CARRIL_PAGINA}`,
        }}
      />
      {xFletxes !== null ? (
        <div
          data-guia-carril="fletxes"
          style={{
            position: 'fixed',
            left: xFletxes,
            top: 0,
            height: '100vh',
            width: 0,
            borderLeft: `1px solid ${COLOR_CARRIL}`,
          }}
        />
      ) : null}
    </DevPortal>
  );
}
