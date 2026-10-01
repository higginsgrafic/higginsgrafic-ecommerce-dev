/**
 * EL MARC DE LA PAGINA D'INICI.
 *
 * NOMES es l'estructura: rep una llista de seccions i les munta en ordre de
 * document. Les dues primeres (les icones i la hero) es reparteixen EL TROS DE
 * DALT en FILES de la graella.
 *
 * (Als identificadors del codi aquestes caixes es diuen `cella`, sense punt
 * volat, per comoditat; a la prosa son `cel·les`.)
 *
 * EL REPARTIMENT, EN 28 FILES. De la capçalera al fons de la finestra hi ha
 * d'haver, per aquest ordre:
 *
 *   megaslide 11 | buit 1 | icones 2 | buit 1 | hero 12 | buit 1  =  28 files
 *
 * La fila es `(finestra − capçalera) / 28`. NO es la fila de la graella del
 * megaslide (`laneForViewport() × 0,0280625 − 2,875`, que a 1920 fa 35,01),
 * perque aquella depen del CARRIL i la finestra no: amb la de la graella, a
 * 1440 el bloc no omplia la finestra. Amb la de la finestra els comptes tanquen
 * a totes les mides: a 1920 dona 34,29 px, i 11 files fan 377,1 quan el
 * megaslide mesura 376.
 *
 * LES DUES CEL·LES. La de les icones porta a dalt les 11 files del megaslide
 * mes el buit que les separa (12 en total) i res a baix; la de la hero porta una
 * fila a cada costat. El buit del mig el posen les DUES, i per aixo no es pot
 * posar el mateix valor a totes dues bandes de totes dues: el del mig sortiria
 * el doble (mesurat: 77/154/232 en comptes de 154/154/154).
 *
 * LA HERO OCUPA 12 FILES. El seu tamany natural en fa 12,23 a 1920 (428 px
 * contra 411), i el topall la hi deixa: es l'unica peça que cedeix, i ho fa
 * perque el repartiment tanqui amb files senceres.
 *
 * PER QUE ES CALCULA AQUI I NO AMB `calc`. Una variable de CSS hereva el valor
 * que te ON S'HA DECLARAT: el `calc` no viatja, el que viatja es el resultat.
 * Declarat a `:root` es resolia amb la zona a `100vh` perque la xifra bona la
 * publica el marc mes avall, i el resultat baixava congelat. I els valors han
 * d'anar a l'ESTAT i sortir pel `style`, no escriure's amb `setProperty`: React
 * reescriu l'atribut `style` sencer a cada render i els esborra.
 *
 * LA LINIA DEL MEGASLIDE. No on acaba la capçalera: a 1920 la capçalera fa
 * 120 px i el panell n'acaba 497; a 1440, 426; a 1024 i 1280, 392; a 768, 565.
 * El megaslide publica aquesta vora com a `--hg-mega-bottom`, i quan el panell
 * no es al DOM (es desmunta en tancar-se) s'estima amb el carril. Aquest marc no
 * sap res mes del megaslide.
 */
import { useEffect, useRef, useState } from 'react';

/** L'aire que ha de quedar sota la hero, fins al fons de la finestra (28/09/2026). */
const AIRE_BAIX_VIEWPORT_PX = 50;
/**
 * El mateix aire, a la banda dels portatils (1200-1366, que en la practica son
 * els 1280 i els 1366): 25 px (01/10/2026, ho ha demanat l'amo: «A 1280 i 1366,
 * passa-ho a 25 px»). Son les mides on l'espai es mes just.
 */
const AIRE_BAIX_VIEWPORT_ESTRET_PX = 25;

/** El repartiment inicial, abans del primer mesurament. */
const REPARTIMENT_INICIAL = { blocMega: 0, blocPagina: 0, alcada: null, alFons: false, baixAlViewport: false, aireBaix: AIRE_BAIX_VIEWPORT_PX };
/** El que penja el cadenat del megaslide sota la seva linia. */
const CADE_BAIXADA = 56;
/**
 * FINS ON ARRIBA EL CADENAT, des de la vora del panell (04/10/2026).
 *
 * `CADE_BAIXADA` es el desplacament del seu contenidor des de la linia; el que
 * ocupa de debò (la caixa del cadenat, amb la vora del panell pel mig) son 58 px.
 * Mesurat a 1920, 1440, 1366, 1280, 1200, 1024 i 1376: a tot arreu el cadenat
 * acaba 58 px sota la vora del panell.
 *
 * ES LA REFERENCIA DE L'ESPAI DE LA HERO: el megaslide acaba on acaba el cadenat,
 * i l'espai es compta DES D'ALLA (04/10/2026: «T'he dit que el cadenat ja no toca
 * la hero. Ho has de calcular des del bottom del megaslide»). Amb l'espai comptat
 * des del cadenat, la hero no hi pot tocar mai: el primer dese d'aire ja el deixa
 * a sota.
 */
const CADENAT_BAIX_PX = 58;
/** Files, com a molt i com a minim, quan es busquen les divisions. */
const FILES_MIN = 8;
const FILES_MAX = 32;
/** Error maxim, en px, que s'accepta en encaixar la linia en una fila. */
const ERROR_FILES_PX = 1;

/**
 * LES DIVISIONS DEL TROS DE DALT, CALCULADES.
 *
 * NO son un numero fix. La part que ocupa el megaslide depen de l'alcada de la
 * finestra, i l'alcada de la finestra no es la de la pantalla: la barra de
 * desenvolupament se'n menja 40 px, i cada navegador se'n menja els seus. Amb un
 * numero escrit a ma, doncs, el repartiment nomes es correcte en una finestra
 * concreta — la que es va fer servir per comptar-lo.
 *
 * Es busca la fraccio `k/N` mes propera a la del megaslide amb el N mes petit
 * que hi encaixi dins d'un px. A 1920 amb la barra dev dona 11/28; sense la
 * barra, 3/8; a 768x1024, 8/17.
 *
 * @returns {{k: number, N: number}} k files per al megaslide i N en total
 */
function divisionsDeLaLinia(linia, capcalera, finestra) {
  const zona = finestra - capcalera;
  if (zona <= 0) return { k: 1, N: 1 };
  const fraccio = Math.max(0, Math.min(1, (linia - capcalera) / zona));
  let millor = { k: Math.round(fraccio * FILES_MIN) || 1, N: FILES_MIN };
  let millorError = Infinity;
  for (let N = FILES_MIN; N <= FILES_MAX; N += 1) {
    const k = Math.round(fraccio * N);
    if (k < 1 || k >= N) continue;
    const error = Math.abs(k / N - fraccio) * zona;
    if (error < millorError) {
      millor = { k, N };
      millorError = error;
    }
    if (error <= ERROR_FILES_PX) break;
  }
  return millor;
}

function MarcInici({ seccions }) {
  const [primera, segona, ...resta] = seccions;
  // LES MIDES DE LA HERO, FIXADES (04/10/2026). En Marc: «S'han de fixar les
  // mides»: la hero fa els 8/10 de l'espai de sota la linia del megaslide, amb
  // els DOS aires d'1/10, i aixo s'ha de saber ABANS del primer pintat.
  //
  // La linia surt de les MATEIXES rectes que l'estimacio (vegeu el bloc de
  // dalt): la del panell segons l'amplada, mes la capcalera. Es FIXA: no depen
  // de si el panell es obert ni de si la seva vora s'ha publicat.
  const ampleVista = typeof window !== 'undefined' ? window.innerWidth : 0;
  const altVista = typeof window !== 'undefined' ? window.innerHeight : 0;
  const esHoritzontal = ampleVista >= 768 && ampleVista >= altVista;
  const alcadaPanellCss = ampleVista <= 1376
    ? 'calc(0.2529 * var(--inici-nou-carril, 0px) + 5.3px)'
    : 'calc(0.1775 * var(--inici-nou-carril, 0px) + 111.3px)';
  const espaiHeroCss = `calc(100dvh - var(--appHeaderOffset, 0px) - ${alcadaPanellCss})`;
  const varsHero = esHoritzontal
    ? {
      '--inici-hero-aire': `calc(${espaiHeroCss} / 10)`,
      '--inici-hero-alcada': `calc(${espaiHeroCss} * 8 / 10)`,
    }
    : null;
  const zonaRef = useRef(null);
  // EL REPARTIMENT VIU A L'ESTAT, NO AL DOM.
  //
  // Es va provar d'escriure'l amb `style.setProperty` des de l'efecte, i no
  // serveix: React reescriu l'atribut `style` sencer a cada render, i el
  // megaslide en provoca molts. Les variables s'esborraven tot seguit i el
  // repartiment no arribava mai a aplicar-se (mesurat: el `setProperty` hi era
  // i l'atribut quedava net). Amb l'estat, el valor entra pel `style` de React
  // i cap render no se'l pot emportar.
  const [repartiment, setRepartiment] = useState(REPARTIMENT_INICIAL);

  useEffect(() => {
    const zona = zonaRef.current;
    if (!zona) return undefined;
    const caixa = zona.querySelector('[data-hero-caixa="1"]');
    const franja = zona.querySelector('[data-icones-colleccions="1"]');
    if (!caixa || !franja) return undefined;

    // Una cala per llegir la frontera: es una variable de CSS, i el seu valor
    // resolt nomes es pot obtenir amb un element de prova.
    const cala = document.createElement('div');
    cala.style.cssText = 'position:absolute;visibility:hidden;height:0;width:1px';
    zona.appendChild(cala);

    let raf = 0;
    let anterior = null;

    const reparteix = () => {
      // ON CAU LA LINIA DEL MEGASLIDE.
      //
      // PRIMER, LA VORA DEL PANELL. El megaslide la publica com a
      // `--hg-mega-bottom` mentre el panell es obert (a 1920, 497; a 1440, 426;
      // a 1024 i 1280, 392; a 768, 565). Es la xifra bona.
      //
      // DESPRES, LA RESERVA. El panell es desmunta del DOM quan esta tancat i
      // aleshores la seva vora no existeix enlloc. Com que el contingut no es
      // pot moure a cada obrir i tancar, quan no hi es s'estima amb el carril,
      // que es l'unic que sempre hi es: el tram del logo a la icona d'usuari de
      // la capçalera, que ella publica com a `--inici-nou-carril` (1270 a 1920,
      // 953 a 1440, 933 a 1280 i 1024, 688 a 768).
      // L'ALCADA DE LA CAPÇALERA, que tambe fa falta per a la fila.
      cala.style.width = 'var(--appHeaderOffset, 0px)';
      const capcalera = parseFloat(getComputedStyle(cala).width) || 0;
      // LA VERTICAL (768x1024 i semblants): mana el centratge de sempre i no
      // s'hi aplica res del que ve tot seguit.
      const esVertical = window.innerHeight > window.innerWidth && window.innerWidth < 1024;
      const linia = (() => {
        cala.style.width = 'var(--hg-mega-bottom, 0px)';
        const publicada = parseFloat(getComputedStyle(cala).width) || 0;
        // Nomes val si es de la mida d'ara: el panell es desmunta en canviar de
        // mida i la variable es queda amb el valor de la mida anterior.
        cala.style.width = 'var(--hg-mega-bottom-ample, 0px)';
        const amplePublicada = parseFloat(getComputedStyle(cala).width) || 0;
        const fresca = publicada > 0 && Math.abs(amplePublicada - window.innerWidth) < 2;
        if (fresca) return publicada;
        cala.style.width = 'var(--inici-nou-carril, 0px)';
        const carril = parseFloat(getComputedStyle(cala).width) || 0;
        // ON CAU LA LINIA, QUAN EL MEGASLIDE ENCARA NO HA PUBLICAT RES.
        //
        // Aixo nome's passa en CARREGAR la pagina (la variable es queda amb
        // l'ultim valor conegut quan el panell es tanca). Si l'estimacio no
        // encerta l'alcada del panell, en obrir el megaslide la franja
        // publicada arriba i el contingut ES MOU: ho va veure l'amo
        // (01/10/2026, «Quan clico el megaslide, la hero es recol·loca»),
        // perque la formula vella donava 447 px a 1440 quan el panell en fa
        // 260 —feia 137 px de salt.
        //
        // RECALIBRAT amb `scripts/_tmp-frontera2.mjs`, que obre el megaslide a
        // cada mida i llegeix `--hg-mega-bottom` de debo. L'alcada del panell
        // (sense la capcalera) te tres regims:
        //
        //   vertical (alt > ample, ample < 1024)   0,585 x carril
        //   tauleta apaisada (ample <= 1376)       0,2529 x carril + 5,3
        //   escriptori (ample > 1376)              0,1775 x carril + 111,3
        //
        // LA TAUleta S'HA RECALIBRAT (04/10/2026). En Marc: «Quan el megaslide es
        // tanca, la hero es mou. No s'ha de moure. Tambe, quan clico el logo per
        // tornar a Inici, les hero es tornen petites». Les dues coses eren aixo:
        // l'estimacio era de 289 px clavat, i els canvis del dia —el carril propi
        // del model (1100 i 1200) i l'aire de sota del megaslide 1100 a 20 px— van
        // deixar el panell a 244 (a 1024, 1280 i 1366), 279 (a 1180 i 1200) i 310
        // (a 1376). O sigui que en CARREGAR (sense vora publicada, que es quan
        // s'estima) la linia quedava 45 px massa avall, i la hero 36 px massa
        // curta: en obrir el megaslide creixia. Amb la recta que passa pels tres
        // punts mesurats, l'error queda dins dels 6 px i la hero ja no es mou.
        //
        // I EL MODEL ENTRA A LA BRANCA DE TAUleta (ample <= 1376 i no <= 1366):
        // a 1376 fa 1205 de carril i el panell en fa 310, que es el que dona
        // aquesta recta; amb la formula d'escriptori en donava 325 (15 px de mes).
        //
        // Comprovat: 1546 px de carril -> 386 estimat / 382 real; 855 -> 263 /
        // 260; 688 (vertical) -> 402 / 402.
        //
        // ES LA LINIA, NO L'ALCADA DEL PANELL: a la linia hi sumem la capcalera.
        const ample = window.innerWidth;
        const alt = window.innerHeight;
        const alcadaPanellEstimada = esVertical
          ? 0.585 * carril
          : (ample <= 1376 ? 0.2529 * carril + 5.3 : 0.1775 * carril + 111.3);
        const liniaEstimada = capcalera + alcadaPanellEstimada;
        return Math.max(capcalera, liniaEstimada);
      })();
      // L'ALCADA DE LA ZONA: la finestra menys la linia del megaslide.
      const zonaAlcada = window.innerHeight - linia;
      const icones = franja.getBoundingClientRect().height;
      // Al primer fotograma les peces encara no tenen mida. Es torna a provar
      // quan `ResizeObserver` les vegi canviar.
      if (zonaAlcada < 1 || icones < 1) return;
      // L'ALCADA NATURAL de la caixa: l'amplada passada per la seva proporcio,
      // menys les dues vores d'1 px que el `aspect-ratio` no compta. Es calcula
      // i no es mesura: amb el topall posat, la mesura donaria l'alcada ja
      // encongida i la correccio es tornaria a alimentar.
      const ample = caixa.getBoundingClientRect().width;
      const parts = (getComputedStyle(caixa).aspectRatio || '').split('/');
      const r = parts.length === 2 ? parseFloat(parts[0]) / parseFloat(parts[1]) : 952 / 401;
      const natural = Number.isFinite(r) && r > 0 ? Math.max(1, ample / r - 2) : 0;
      // ON CAU LA LINIA, DINS LA ZONA. La zona comença a dalt de tot del
      // contingut, i la linia del megaslide cau a dins seu (a 497 px a 1920).
      // Tot el que hi hagi per sobre de la linia queda sota el panell, i per
      // tant el primer que s'hi ha de posar es aquest tros.
      const zonaRect = zona.getBoundingClientRect();
      const finsLinia = Math.max(0, linia - zonaRect.top);
      // DUES PAGINES, UNA SOLA MESURA.
      //
      // La graella de files serveix per mesurar alhora el megaslide i la
      // pagina: el tros de dalt sencer son 28 files, i la frontera entre les
      // dues coses cau exactament a la fila 11.
      //
      //   files 0..10   (11)  el megaslide desplegat
      //   files 11..27  (17)  la pagina de sota
      //
      // I aixo dona el marc de referencia per col·locar-hi les peces: les
      // ICONES es centren dins de les 11 files del megaslide, i la HERO dins de
      // les 17 de sota. Cap de les dues no s'ha d'encongir: la hero, al seu
      // tamany natural, cap dins de les 17 files a totes cinc mides.
      //
      // LA FILA es `(finestra − capçalera) / 28`. A 1920 dona 34,29 px, i 11
      // files cauen a 497,1 quan el separador del megaslide es a 497: la
      // frontera del model i la del megaslide coincideixen.
      // LES DIVISIONS, de la geometria d'ara: depenen de l'alcada de la finestra
      // (barra dev i navegador inclosos).
      const { k: megaFiles, N: total } = divisionsDeLaLinia(linia, capcalera, window.innerHeight);
      const fila = (window.innerHeight - capcalera) / total;
      // EL BLOC DEL MEGASLIDE ES LA SEVA AREA: les 11 files, i com a minim la
      // seva vora de veritat. Les 11 files nomes coincideixen amb el separador
      // quan la seva alcada escala amb la finestra; a 1024 i 1366 el panell
      // acaba una mica mes avall, i el bloc l'ha de cobrir.
      const blocMega = Math.max(megaFiles * fila, linia - capcalera);
      // LA PAGINA DE SOTA es la resta. El CADENAT, pero, penja 56 px dins seu i
      // per tant no es pot fer servir per centrar-hi la hero: el seu bloc es el
      // que queda DESPRES del cadenat.
      const disponible = Math.max(0, (window.innerHeight - capcalera) - blocMega);
      // L'AMPLE DE LA FINESTRA, que decideix dues coses: si el baix de la hero ha
      // de caure a 50 px del fons de la finestra (l'escriptori) i si toca
      // enganxar-la al fons (els dos portatils).
      const ampleFinestra = window.innerWidth;
      // EL BAIX DE LA HERO, A 50 px DEL FONS DE LA FINESTRA (28/09/2026).
      //
      // En Marc: «La pdp està situada a 50 px del bottom del viewport, si no
      // recordo malament. Posa la hero a la mateixa posició». Es el MATEIX
      // criteri que el bloc de la PDP a l'escriptori ample: alla, a 1920x946, el
      // bloc acaba a 896 (946 − 50). Aqui qui deixa aquell aire es la cel·la de
      // la pagina, i la hero s'hi alinea al fons.
      //
      // A TOT L'HORITZONTAL, SENSE CONDICIONS (01/10/2026). Ho ha demanat
      // l'amo: «Ja que tenim espai, aprofitem per maquetar be la hero. Deixa la
      // hero a 50 px del limit del viewport, com la desktop», i tot seguit, amb
      // la finestra curta (1280x586, 1366x600): «A 1280 i 1366 no ha pujat».
      //
      // La guarda que hi havia (`disponible >= CADE_BAIXADA + natural + 50`)
      // demanava lloc per al cadenat, la hero SENcera i els 50 px, i amb una
      // finestra curta no es complia mai: la hero quedava enganxada al fons
      // (0 px). Ara l'aire s'aplica sempre a l'horitzontal; si la hero no hi cap
      // sencera, es la unica peca que cedeix (el seu `aspect-ratio` la fa mes
      // baixa), que es el pacte que ja te el repartiment.
      //
      // LA CEL·LA NO CREIX PER AIXO: `blocPagina` es queda com era, perque fer
      // créixer la cel·la 50 px va arribar a treure la taula per sota de la
      // finestra (mesurat al mosaic a 1440x766: la hero acabava 23,2 px per
      // sota del fons).
      const baixAlViewport = !esVertical;
      // LA MIDA DE LA CEL·LA NO CANVIA MAI PER AQUEST AIRE (28/09/2026).
      //
      // El primer intent va ser afegir l'aire a aquest minim, i era un error: quan
      // la finestra es curta (o quan el megaslide encara no ha publicat la seva
      // vora i la linia s'estima llarga) la cel·la creixia 50 px de mes i la
      // taula s'escolava per sota del viewport —mesurat al mosaic a 1440x766: la
      // hero acabava 23,2 px per sota del fons—. L'aire, doncs, surt de DINS de
      // la cel·la (el coixi de sota), i nome's s'hi aplica si hi cap de sobres.
      // Si no hi cap, tot queda exactament com estava.
      const ambCadenat = CADE_BAIXADA + natural;
      const encaixa = ambCadenat <= disponible;
      // A LES DUES MIDES DE PORTATIL (1280 i 1366) la hero s'ALINEA AL FONS DEL
      // VIEWPORT, tant si hi cap com si no:
      //
      //   - si hi cap (finestra alta), baixa fins al fons en comptes de quedar
      //     centrada amb aire a sota;
      //   - si no hi cap (finestra amb navegador), la cel·la es queda el que
      //     queda de finestra i la hero hi acaba igualment, i el que sobra
      //     marxa cap a dalt.
      //
      // A la resta de formats no es toca res.
      //
      // LA FRANJA, I NO DUES XIFRES EXACTES. Amb `=== 1366` allo no s'aplicava
      // gairebe mai: en un Mac les finestres per defecte fan 1512, 1728 o 1440,
      // i amb el DevTools acoblat al costat o amb la barra de desplaçament el
      // viewport no fa la xifra rodona ni de bon tros. Amb la franja 1200-1366
      // NOMES hi entren els 1280 i els 1366 (i el que hi ha entremig, que es el
      // marge que cal perque en un Mac la finestra no cau mai exactament en
      // aquelles dues xifres). En queden fora la tauleta de 1200 i la de 1024,
      // que no es toquen, i l'escriptori de 1440 en amunt.
      const alFons = ampleFinestra >= 1280 && ampleFinestra <= 1366;
      const blocPagina = alFons ? disponible : Math.max(disponible, ambCadenat);
      const alcada = natural;
      // L'AIRE DE SOTA, PER BANDA (01/10/2026).
      //
      //   1366   25 px   (ho va demanar l'amo: «A 1280 i 1366, passa-ho a 25 px»)
      //   1280    0 px   («Baixa 1280 fins on era al principi»: enganxada al
      //                   fons del viewport, que es com estava abans)
      //   resta  50 px   (l'aire de l'escriptori)
      //
      // El tall entre 1280 i 1366 el fem a 1320: la banda dels portatils es
      // 1280-1366 i en un Mac la finestra no cau mai exactament en aquestes dues
      // xifres, aixi que el que mana es de quin costat cau.
      const aireBaix = alFons
        ? (ampleFinestra <= 1320 ? 0 : AIRE_BAIX_VIEWPORT_ESTRET_PX)
        : AIRE_BAIX_VIEWPORT_PX;
      // El numero que decideix si ja hi som: si no s'ha mogut, s'atura.
      // LES MIDES DE LA HERO NO ES CALCULEN AQUI (04/10/2026). En Marc: «S'han
      // de fixar les mides»: la hero no pot dependre de si el megaslide es obert
      // o no, ni d'un efecte que arriba DESPRES del primer pintat (era el flaix
      // del refresc: es pintava amb la mida vella —456,8 a 1376 i 178,9 a
      // 1280x586— i tot seguit canviava). Ara surten d'un `calc` amb les
      // MATEIXES rectes que l'estimacio de la linia, o sigui que el primer
      // pintat ja es el bo i la mida no es mou mai. Vegeu `varsHero` al render.
      const ara = `${Math.round(blocMega * 4) / 4}|${Math.round(blocPagina * 4) / 4}|${Math.round(alcada * 4) / 4}|${alFons ? 1 : 0}|${baixAlViewport ? 1 : 0}|${aireBaix}`;
      if (ara === anterior) return;
      anterior = ara;
        setRepartiment({ blocMega, blocPagina, alcada, finsLinia, linia, alFons, baixAlViewport, aireBaix });
      raf = requestAnimationFrame(reparteix);
    };

    const programa = () => {
      cancelAnimationFrame(raf);
      anterior = null;
      raf = requestAnimationFrame(reparteix);
    };

    reparteix();

    const obs = new ResizeObserver(programa);
    obs.observe(zona);
    obs.observe(caixa);
    obs.observe(franja);
    // LA LINIA DEL MEGASLIDE TAMBE CANVIA LA ZONA, i no sempre pel mateix cami:
    // el panell s'obre i es tanca, i la seva vora es publica a l'atribut `style`
    // de l'arrel. Sense aixo, l'aire es calculava amb la linia de la capçalera i
    // la hero quedava sota el panell.
    const obsArrel = new MutationObserver(programa);
    obsArrel.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    // LA FINESTRA TAMBÉ, I NOMES PER L'ALCADA. El repartiment depen de
    // `window.innerHeight`, i si nomeś canvia l'alcada no es mou res de dins
    // de la zona: ni la hero, ni les icones, ni la vora del megaslide (que
    // depen del carril). El `ResizeObserver`, doncs, no es desperta i el
    // repartiment es quedava amb les xifres de la mida anterior.
    window.addEventListener('resize', programa);
    window.addEventListener('orientationchange', programa);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      obsArrel.disconnect();
      window.removeEventListener('resize', programa);
      window.removeEventListener('orientationchange', programa);
      cala.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={zonaRef}
        className="hg-taula-inici"
        data-taula-inici="1"
        style={{
          // LES DUES PAGINES, UNA SOBRE L'ALTRA: les 11 files del megaslide i
          // les 17 de la pagina. Les alcades surten de l'estat i per tant cap
          // render de React no se les pot emportar.
          height: `${(repartiment.blocMega ?? 0) + (repartiment.blocPagina ?? 0)}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: 0,
          // Les dues xifres, tambe com a variables de CSS, perque el topall de
          // la caixa de la hero les pugui llegir.
          ...varsHero,
          '--inici-bloc-mega': `${repartiment.blocMega ?? 0}px`,
          '--inici-bloc-pagina': `${repartiment.blocPagina ?? 0}px`,
          '--inici-frontera': `${repartiment.linia ?? 0}px`,
        }}
      >
        {/* LES 11 FILES DEL MEGASLIDE, AMB LES ICONES AL CENTRE. */}
        <div
          data-cella="1"
          data-cella-de={primera.id}
          style={{
            height: 'var(--inici-bloc-mega, 0px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {primera.node}
        </div>
        {/* LES 17 FILES DE LA PAGINA, AMB LA HERO AL CENTRE. */}
        <div
          data-cella="2"
          data-cella-de={segona.id}
          style={{
            height: 'var(--inici-bloc-pagina, 0px)',
            // El cadenat del megaslide penja 56 px dins d'aquest bloc: la hero
            // es centra en el que queda DESPRES seu, no en el bloc sencer.
            //
            // AL 1200x720 (04/10/2026) els dos aires son els seus desens i la
            // hero fa els 8/10: mana aixo i no el centratge de sempre.
            paddingBlockStart: esHoritzontal ? 'var(--inici-hero-aire, 0px)' : `${CADE_BAIXADA}px`,
            ...(esHoritzontal ? { paddingBlockEnd: 'var(--inici-hero-aire, 0px)' } : null),
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // A 1366 i 1280, alineada al fons del viewport; a l'escriptori, al
            // fons pero amb els 50 px d'aire de sota; a la resta, centrada. Als
            // horitzontals mana el repartiment en desens.
            justifyContent: esHoritzontal
              ? 'flex-start'
              : ((repartiment.alFons || repartiment.baixAlViewport) ? 'flex-end' : 'center'),
            // L'AIRE DE SOTA LA HERO (28/09/2026): nome's a l'escriptori, i es
            // el que fa que el seu baix caigui a 50 px del fons de la finestra,
            // com el bloc de la PDP. Amb `border-box` l'aire surt de l'alcada de
            // la cel·la, o sigui que la hero no es mou de mida.
            ...(repartiment.baixAlViewport ? { paddingBlockEnd: `${repartiment.aireBaix ?? AIRE_BAIX_VIEWPORT_PX}px` } : null),
          }}
        >
          {segona.node}
        </div>
      </div>

      {/* LA RESTA, EN FLUX. */}
      {resta.map((seccio) => (
        <div key={seccio.id} data-seguent={seccio.id}>
          {seccio.node}
        </div>
      ))}
    </>
  );
}

export default MarcInici;
