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

/** El repartiment inicial, abans del primer mesurament. */
const REPARTIMENT_INICIAL = { blocMega: 0, blocPagina: 0, alcadaHero: 0, aireHero: 0 };
/** El que penja el cadenat del megaslide sota la seva linia. */
const CADE_BAIXADA = 56;
/**
 * FINS ON ARRIBA EL CADENAT, des de la vora del panell (04/10/2026).
 *
 * `CADE_BAIXADA` es el desplacament del seu contenidor des de la linia; el que
 * ocupa de debò (la caixa del cadenat, amb la vora del panell pel mig) son 58 px
 * i es el numero que ha de respectar l'aire de la hero. Mesurat a 1920, 1440,
 * 1366, 1280, 1200, 1024 i 1376: a tot arreu el cadenat acaba 58 px sota la vora
 * del panell. Amb 2 px de marge, 60.
 */
const CADENAT_BAIX_PX = 60;
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
        //   tauleta apaisada (ample <= 1366)       289 px clavat
        //   escriptori (ample > 1366)              0,1775 x carril + 111,3
        //
        // Comprovat: 1546 px de carril -> 386 estimat / 382 real; 855 -> 263 /
        // 260; 688 (vertical) -> 402 / 402. Error maxim, 8 px (abans, 282).
        //
        // ES LA LINIA, NO L'ALCADA DEL PANELL: a la linia hi sumem la capcalera.
        const ample = window.innerWidth;
        const alt = window.innerHeight;
        const alcadaPanellEstimada = esVertical
          ? 0.585 * carril
          : (ample <= 1366 ? 289 : 0.1775 * carril + 111.3);
        const liniaEstimada = capcalera + alcadaPanellEstimada;
        return Math.max(capcalera, liniaEstimada);
      })();
      // L'ALCADA DE LA ZONA: la finestra menys la linia del megaslide.
      const zonaAlcada = window.innerHeight - linia;
      const icones = franja.getBoundingClientRect().height;
      // Al primer fotograma les peces encara no tenen mida. Es torna a provar
      // quan `ResizeObserver` les vegi canviar.
      if (zonaAlcada < 1 || icones < 1) return;
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
      // L'ALCADA DE LA HERO I ELS SEUS AIRES (04/10/2026).
      //
      // En Marc: «Per tal de dimensionar correctament la hero a cada format
      // podríem dividir l'espai disponible, un cop obert el megaslide, en 6
      // parts i que les franges de la samarreta ocupin els 4/6 centrals. Així,
      // la hero es proporcionarà de forma natural i l'espai a sobre i a sota
      // serà simètric» i, en concretar-ho, «des del panell» i «que es
      // redimensioni amb els 4/6».
      //
      // O sigui: l'espai de sota la vora del panell es reparteix en DESENS, 1/10
      // d'aire, 8/10 de franges i 1/10 d'aire. Quan el megaslide es obert mana
      // aquest repartiment i no la proporcio de disseny (952/401): la cel·la
      // publica l'alcada de la hero com a `--inici-hero-alcada` i la caixa la
      // llegeix. Sense megaslide (els mobils) la variable no hi es i la caixa
      // torna a la seva proporcio.
      //
      // EL REPARTIMENT, A MA (04/10/2026). Es va muntar amb els 4/6
      // centrals que va proposar l'amo i, en veure-ho, «Massa petit. Prova amb
      // 6/8» i tot seguit, amb mes espai, «prova amb 8/10»: la hero s'emporta el 80 %
      // de l'espai i els aires queden a 1/10 (amb 6/8 era el 75 % i 1/8).
      //
      // EL CADENAT PENJA 58 px DINS D'AQUEST ESPAI, i a sota seu hi ha d'anar la
      // hero: si el primer dese es mes curt que aixo (a 1280x720, que fa 586 de
      // viewport, el dese en fa 29), els DOS aires s'allarguen fins als 60 px
      // (58 del cadenat mes 2 d'aire) i la hero cedeix el que calgui. Amb l'aire
      // gran el repartiment queda exactament als 8/10; amb l'aire petit, els 8/10
      // es queden curts pero SIMETRICS.
      //
      // A 1280x720 la guarda amb els 8/10 pelats deixava el cadenat 1,2 px DINS de
      // la hero (mesurat): per allo l'alcada es `disponible − 2 x aire` i no
      // `8/10 x disponible`.
      //
      // Aixo substitueix els aires de 50 px (escriptori) i 25/0 px (els dos
      // portatils) del 28/09 i l'01/10, i tambe el topall: la hero ja no es
      // mesura amb la seva proporcio sino que fa els 8/10 que toquen.
      const disponibleHero = Math.max(0, window.innerHeight - linia);
      const aireHero = Math.max(CADENAT_BAIX_PX, disponibleHero / 10);
      // AMB L'AIRE GRAN, AIXO ES EXACTAMENT 8/10 DEL DISPONIBLE (1/10 + 8/10 +
      // 1/10 = 1). Amb l'aire forcada pels 60 px del cadenat, la hero cedeix la
      // diferencia i els dos aires queden iguals.
      const alcadaHero = Math.max(0, disponibleHero - 2 * aireHero);
      // LA CEL·LA DE LA PAGINA ES TOT L'ESPAI DE SOTA EL PANELL: els dos
      // desens d'aire i els vuit de franges hi cauen a dins exactes.
      const blocPagina = disponibleHero;
      const ara = `${Math.round(blocMega * 4) / 4}|${Math.round(blocPagina * 4) / 4}|${Math.round(alcadaHero * 4) / 4}|${Math.round(aireHero * 4) / 4}`;
      if (ara === anterior) return;
      anterior = ara;
      setRepartiment({ blocMega, blocPagina, alcadaHero, aireHero, finsLinia, linia });
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
            // ELS DOS DESENS D'AIRE (04/10/2026): el de dalt es menja el
            // cadenat si el desè no hi arriba (vegeu el repartiment).
            paddingBlockStart: `${repartiment.aireHero ?? 0}px`,
            paddingBlockEnd: `${repartiment.aireHero ?? 0}px`,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            // L'ALCADA DE LA HERO, publicada perque la caixa la llegeixi.
            '--inici-hero-alcada': `${repartiment.alcadaHero ?? 0}px`,
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
