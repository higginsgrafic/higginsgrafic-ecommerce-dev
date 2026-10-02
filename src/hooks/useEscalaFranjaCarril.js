import { useLayoutEffect, useState } from 'react';
import { factorFranjaCarril, ESCALA_CALIBRADA_FRANJA } from '../utils/franjaCarril';
import { FRACCIO_COSSOS_FRANJA, FRACCIO_MARGE_ESQUERRE_FRANJA } from '../config/stripeCalibrations';
import { carrilDeFinestra, COMPOSICIO_ESTRETA_MIN_PX, COMPOSICIO_ESTRETA_MAX_PX } from '../components/megaslide/geometriaMegaslide';
import { getLayoutViewportWidth } from '../utils/layoutMetrics';

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
 * @param {number} [ampleCarrilPaginaPx=0] - l'amplada que han de fer els COSSOS
 *   (les cintures) de les catorze samarretes quan qui la crida vol el CARRIL DE
 *   LA PAGINA i no el del megaslide (a 1024, la pagina 1: vegeu-ho dins de
 *   `mesura`). 0 vol dir «el de sempre».
 * @returns {number} factor que multiplica el calibratge (1 quan no s'hi aplica).
 */
/**
 * L'amplada que ha de fer la filera de cossos: de la VORA ESQUERRA DEL CARRIL a
 * la DRETA DEL BLOC DE FLETXES. Quan no hi ha fletxes (tauletes) es el carril
 * sencer, que es com estava.
 *
 * @returns {number} amplada en px (0 si no es pot mesurar).
 */
function ampladaObjectiu(filaEl = null) {
  if (typeof document === 'undefined') return 0;
  const estil = getComputedStyle(document.documentElement);
  // EL CARRIL DECLARAT, MENTRE EL HEADER NO HA PUBLICAT LES VARS (25/09/2026).
  //
  // `--hg-mega-w` i `--hg-mega-x` les publica un efecte del header, que corre
  // DESPRES d'aquest: la primera mesura de la franja no trobava ni el carril ni
  // la seva x, tornava 0 i l'escala no es tornava a mirar fins que arribava una
  // mutacio d'estil (mesurat: 225-320 ms). Fins llavors la franja es pintava amb
  // l'escala de disseny (1,58 cops massa gran, mesurat) i feia un salt amb el
  // panell ja obrint-se. El valor declarat es EXACTAMENT el que publicara el
  // header (3/5 de la finestra de layout, i la x centrada), o sigui que la
  // franja neix a la mida bona i la mesura de debò nome's confirma el mateix.
  // El carril declarat (3/5 de la finestra de layout i la seva x) es el mateix
  // que publicara el header: el calcul viu a `geometriaMegaslide.js`, amb la
  // seva prova unitaria contra les xifres mesurades.
  const declarat = carrilDeFinestra(getLayoutViewportWidth(), typeof window !== 'undefined' ? window.innerHeight || 0 : 0);
  let carril = Number.parseFloat(estil.getPropertyValue('--hg-mega-w'));
  let xCarril = Number.parseFloat(estil.getPropertyValue('--hg-mega-x'));
  if ((!Number.isFinite(carril) || carril <= 0) && declarat) carril = declarat.carril;
  if (!Number.isFinite(xCarril) && declarat) xCarril = declarat.x;
  // LES FLETXES DEL CARRUSEL S'HAN DE LLEGIR DE LA PAGINA VISIBLE
  // (26/09/2026). El megaslide te totes les pagines al DOM i mes d'una te
  // carrusel amb fletxes: `document.querySelectorAll` en trobava de la pagina 1
  // i de la 2, i la "darrera" podia ser la de la 1. Com que la pagina 1 viu
  // desplaçada una amplada de maquetacio (a 1024, x-1009), el seu `right` es
  // negatiu i l'objectiu de la franja sortia -1008: la franja de la pagina 2 es
  // pintava a x-59 amb 1006 px d'amplada en comptes de 202..807 (mesurat).
  //
  // La fletxa de la pagina VISIBLE es la que te la seva vista a la finestra (el
  // `left` de la vista entre 0 i l'amplada). L'amplada de la finestra tambe
  // inclou les fletxes ocultes (`getBoundingClientRect` dona mides amb
  // `visibility: hidden`), o sigui que nome's el desplaçament les distingeix.
  const ampladaVista = typeof window !== 'undefined' ? window.innerWidth : 0;
  const fletxes = [...document.querySelectorAll('[data-carrusel="1"] #stripe-guide-right-arrow')]
    .filter((el) => el.getBoundingClientRect().width > 0)
    .filter((el) => {
      const vista = el.closest('[data-mega-page-viewport]');
      if (!vista || !ampladaVista) return true;
      const x = vista.getBoundingClientRect().left;
      return x > -1 && x < ampladaVista;
    });
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
  // SENSE FLETXES (LES DUES TAULETES): FINS A LA VORA DEL BLOC DE LA DRETA.
  //
  // A la tauleta el carrusel no porta fletxes i l'objectiu era el CARRIL SENCER,
  // pero alla el carril tambe conte el bloc de la dreta (el selector
  // BLANC/COLOR/NEGRE): la franja s'hi escalava de ple i li passava per sota les
  // ultimes samarretes (01/10/2026, «de 1366 a 1024, la stripe es reconfigura i
  // trepitja coses»). Mesurat a 1024: el bloc de la dreta va de 678 a 807 i la
  // franja arribava a 822. L'objectiu bo es la GRAELLA de dalt, que acaba on
  // arrenca el bloc (`[data-graella-files-*]`): la franja queda alineada amb la
  // graella i el selector queda lliure.
  //
  // A l'escriptori no s'hi arriba mai: alla hi ha fletxes i el cami de dalt ja
  // ha tornat.
  // A la pagina 2 (el cercador) el bloc de la dreta es la LLISTA DE
  // COLLECCIONS, que no porta `data-bloc-dreta`: la marca que hi ha a cada
  // enllac es `data-colleccions-targeta` (la mateixa que fa servir
  // `scripts/compara-vistes.mjs`), i la seva vora esquerra es la de la columna.
  // EL BLOC DE LA DRETA, DE LA MATEIXA PAGINA (01/10/2026).
  //
  // El megaslide te TOTES les pagines al DOM (desplacades amb `translateX`), i
  // aixo va fer caure el primer intent: buscant el bloc a tot el document,
  // s'agafava el de la pagina 2 mentre s'estava mesurant la franja de la 1, i
  // la franja de la 1 es quedava ample i passava per sota del selector. Ara es
  // mira primer DINS de la pagina de la franja que s'esta mesurant.
  const mateixaPagina = filaEl && typeof filaEl.closest === 'function'
    ? filaEl.closest('[data-mega-page-viewport]')
    : null;
  const selectorBloc = '[data-bloc-dreta-p1="1"], [data-bloc-dreta-p2="1"], [data-colleccions-targeta="1"]';
  if (mateixaPagina && Number.isFinite(xCarril)) {
    // A LA COMPOSICIO ESTRETA LA FRANJA FA EL CARRIL SENCER (02/10/2026). En
    // Marc: «La stripe de la p1 ha de ser de la mateixa mida i posicio que la de
    // la p2» i, quan la de la p1 encara es quedava curta, «No es com la p2». A
    // 1024-1366 el bloc de la dreta (el selector i les fletxes) es DINS del carril
    // i la franja hi passa per sota, com a la p2: l'objectiu no pot ser la seva
    // vora esquerra (682 px a 1366 en comptes dels 811 del carril), que es el que
    // deixava la franja de la p1 un 16% mes curta que la de la p2.
    const estreta = typeof window !== 'undefined'
      && window.innerWidth >= COMPOSICIO_ESTRETA_MIN_PX && window.innerWidth <= COMPOSICIO_ESTRETA_MAX_PX
      && window.innerWidth >= window.innerHeight;
    if (estreta) return Number.isFinite(carril) && carril > 0 ? carril : 0;
    const bloc = mateixaPagina.querySelector(selectorBloc);
    if (bloc) {
      const r = bloc.getBoundingClientRect();
      const v = mateixaPagina.getBoundingClientRect();
      const esquerra = r.left - v.left;
      if (r.width > 0 && esquerra - xCarril > 0) return esquerra - xCarril;
    }
    // SI LA PAGINA NO TE BLOC DE LA DRETA, LA FRANJA FA EL CARRIL SENCER
    // (02/10/2026). I no es mira cap ALTRA pagina: mentre el panell s'obre, la
    // pagina 1 encara es dins la finestra i el seu bloc donava un objectiu mes
    // estret (682 px a 1366x768 en comptes dels 811 del carril), que es quedava
    // congelat perque la mesura nome s es repeteix amb un canvi de mida. La
    // franja de la p2 es queda curta i no encaixa per les cintures.
    //
    // Passa des del 02/10/2026, que la columna de colleccions de la p2 es una
    // franja sota les barres de color i ja no n'hi ha cap a la dreta.
    return Number.isFinite(carril) && carril > 0 ? carril : 0;
  }
  const blocsDreta = [...document.querySelectorAll(selectorBloc)]
    .filter((el) => el.getBoundingClientRect().width > 0)
    .filter((el) => {
      const vista = el.closest('[data-mega-page-viewport]');
      if (!vista || !ampladaVista) return true;
      const x = vista.getBoundingClientRect().left;
      return x > -1 && x < ampladaVista;
    });
  const blocDreta = blocsDreta[blocsDreta.length - 1];
  if (blocDreta && Number.isFinite(xCarril)) {
    const pagina = blocDreta.closest('[data-mega-page-viewport]');
    const desplac = pagina ? pagina.getBoundingClientRect().left : 0;
    const esquerra = blocDreta.getBoundingClientRect().left - desplac;
    if (esquerra - xCarril > 0) return esquerra - xCarril;
  }
  return Number.isFinite(carril) && carril > 0 ? carril : 0;
}

/**
 * La x del carril del megaslide, en px de finestra: la variable que publica el
 * header i, si encara no hi es, la declarada (`carrilDeFinestra`, la MATEIXA que
 * el header publicara).
 *
 * Serveix per centrar una cosa al CARRIL DE LA PAGINA (02/10/2026): la filera de
 * la franja viu DINS del carril del megaslide, o sigui que el seu `left` es
 * mesura des d'alla i, per posar-la al centre de la finestra (que es on es
 * centra el carril de la pagina), s'ha de descomptar aquesta x.
 *
 * @returns {number} x en px (0 si no s'ha pogut llegir).
 */
function xCarrilMegaslide() {
  if (typeof document === 'undefined') return 0;
  const estil = getComputedStyle(document.documentElement);
  const publicada = Number.parseFloat(estil.getPropertyValue('--hg-mega-x'));
  if (Number.isFinite(publicada)) return publicada;
  const declarat = carrilDeFinestra(getLayoutViewportWidth(), typeof window !== 'undefined' ? window.innerHeight || 0 : 0);
  return declarat ? declarat.x : 0;
}

export default function useEscalaFranjaCarril(filaRef, actiu, ampleCarrilPaginaPx = 0, centreAlContenidor = false, ancoratEsquerra = false) {
  const [estat, setEstat] = useState({ factor: 1, centre: 0 });

  useLayoutEffect(() => {
    if (!actiu) return undefined;
    const el = filaRef.current;
    if (!el) return undefined;

    const mesura = () => {
      const ampleDibuix = el.offsetWidth;
      const estil = getComputedStyle(document.documentElement);
      // EL CARRIL DE LA PAGINA, QUAN QUI CRIDA LA SAP (02/10/2026).
      //
      // En Marc: «Acaba d'alinear la stripe p1 a la mida del segon carril» i,
      // en veure que la imatge hi queia pero les samarretes no, «Alinea la
      // stripe per les cintures de les samarretes!».
      //
      // L'objectiu d'aquest ganxo son els COSSOS (les cintures): el factor de
      // `factorFranjaCarril` fa que els cossos de les catorze samarretes facin
      // l'amplada que se li passa. A 1024, doncs, s'hi passa l'amplada del
      // CARRIL DE LA PAGINA (`min(939.2px, 100vw - 80px)`: el del header, la
      // hero i les segones guies verdes) i la cintura de la primera i de
      // l'ultima samarreta cauen a les seves vorades. La IMATGE queda MES AMPLA
      // que el carril (la part que hi sobra son les manigues, que hi surten com
      // a la resta de composicions). Sense aquest parametre tot queda com
      // estava (la pagina 2 tambe fa servir aquest ganxo i ha de seguir fent el
      // carril del megaslide amb les cintures).
      const objectiu = ampleCarrilPaginaPx > 0 ? ampleCarrilPaginaPx : ampladaObjectiu(el);
      if (!ampleDibuix || !objectiu) return;
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
      //
      // Amb el carril de la pagina mana la FINESTRA: el seu carril va centrat a
      // `100vw` (com el header, la hero i les segones guies) i no a l'amplada de
      // maquetacio del cos, que reserva la barra i queda uns px a l'esquerra.
      // I la IMATGE no va centrada al carril: va desplaçada el que hi ha de la
      // seva vora esquerra a la primera CINTURA (FRACCIO_MARGE_ESQUERRE_FRANJA),
      // que es la que ha de caure a la vora del carril. El `left` de la filera
      // es mesura des de la vora esquerra del carril del megaslide: es
      // descompta.
      const ampleImatge = ampleCarrilPaginaPx / FRACCIO_COSSOS_FRANJA;
      // ANCORAT A L'ESQUERRA (05/10/2026). En Marc: «Redueix la stripe, per la
      // dreta, blocant l'esquerra, fins que coincideixi amb la dreta de la
      // graella». Amb `ancoratEsquerra` l'objectiu no es centra a la finestra:
      // arrenca a la vora esquerra del CARRIL (la mateixa que la graella), i la
      // dreta cau on li toca per la seva amplada.
      // I LA MITAD DE LA DIFERENCIA ENTRE LA FINESTRA I LA MAQUETACIO: el
      // carril es mesura amb `window.innerWidth` i l'element viu a l'amplada de
      // maquetacio (que reserva la barra); sense aixo l'objectiu cau 8 px a
      // l'esquerra de la graella (mesurat a 1280).
      const carrilEsq = ancoratEsquerra
        ? xCarrilMegaslide() + (window.innerWidth - getLayoutViewportWidth()) / 2
        : (window.innerWidth - ampleCarrilPaginaPx) / 2;
      // DOS CASOS, I PER QUE (02/10/2026):
      //
      //   - LA PAGINA 1 (`centreAlContenidor` fals): la filera viu DINS del carril
      //     del megaslide (605 a 1024) i la franja ha de caure al carril de la
      //     pagina, que es mes ample: el `left` es mesura des de la vora esquerra
      //     del carril del megaslide i s'ha de descomptar (`xCarrilMegaslide`).
      //   - LA PAGINA 2 (`centreAlContenidor` cert): alla el mateix contenidor de
      //     la pagina JA fa el carril de la pagina, o sigui que l'embolcall de la
      //     filera arrenca a la vora del carril i el centre bo es la meitat del
      //     propi objectiu.
      const centre = ampleCarrilPaginaPx > 0
        ? (centreAlContenidor
          ? objectiu / 2
          : carrilEsq - (FRACCIO_MARGE_ESQUERRE_FRANJA * ampleImatge) + (ampleImatge / 2) - xCarrilMegaslide())
        : objectiu / 2;
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
  }, [filaRef, actiu, ampleCarrilPaginaPx, centreAlContenidor, ancoratEsquerra]);

  // Quan no s'hi aplica (la vista vertical), no es toca res: es fa aqui i no
  // dins de l'efecte, que no ha de cridar `setState`.
  return actiu ? estat : { factor: 1, centre: null };
}
