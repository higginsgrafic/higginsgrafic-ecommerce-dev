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
const REPARTIMENT_INICIAL = { blocMega: 0, blocPagina: 0, alcada: null };
/**
 * LES FILES DEL TROS DE DALT.
 *
 * Son les 28 que surten de traduir la pantalla a files de la graella del
 * megaslide, i la frontera entre les dues pagines cau a la 11:
 *
 *   FILES_MEGASLIDE   11   el megaslide desplegat
 *   FILES_PAGINA      17   la pagina de sota
 *   FILES_TOTAL       28
 */
const FILES_TOTAL = 28;
const FILES_MEGASLIDE = 11;
const FILES_PAGINA = FILES_TOTAL - FILES_MEGASLIDE;
/** El que penja el cadenat del megaslide sota la seva linia. */
const CADE_BAIXADA = 56;

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
      const linia = (() => {
        cala.style.width = 'var(--hg-mega-bottom, 0px)';
        const publicada = parseFloat(getComputedStyle(cala).width) || 0;
        if (publicada > 0) return publicada;
        cala.style.width = 'var(--inici-nou-carril, 0px)';
        const carril = parseFloat(getComputedStyle(cala).width) || 0;
        // L'alcada del panell segons el carril, amb els punts mesurats.
        let alcada;
        if (carril >= 1100) alcada = 0.45 * carril - 195;      // 1270 -> 376
        else if (carril >= 950) alcada = 1.7 * carril - 1145;  //  953 -> 305
        else if (carril >= 750) alcada = 271;                  //  933 -> 271
        else alcada = -2.4 * carril + 2202;                    //  688 -> 565
        return capcalera + Math.max(0, alcada);
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
      const fila = (window.innerHeight - capcalera) / FILES_TOTAL;
      // EL BLOC DEL MEGASLIDE NO POT SER MES PETIT QUE EL MEGASLIDE.
      //
      // Les 11 files son la mesura del megaslide, pero nomes coincideixen amb
      // el seu separador quan el seu alcada escala amb la finestra. A 1366 no:
      // el panell acaba a 392 i les 11 files cauen a 365, de manera que el
      // cadenat (392+56 = 448) quedava damunt la hero. El bloc, doncs, es el
      // mes gran de les dues coses, i tambe ha de deixar passar el cadenat.
      const blocMega = Math.max(FILES_MEGASLIDE * fila, linia + CADE_BAIXADA - capcalera);
      // LA PAGINA DE SOTA, la resta, pero amb l'alcada de la hero com a minim:
      // si la finestra es molt curta, la zona creix i la pagina s'allarga.
      const blocPagina = Math.max((window.innerHeight - capcalera) - blocMega, natural);
      const alcada = natural;
      // El numero que decideix si ja hi som: si no s'ha mogut, s'atura.
      const ara = `${Math.round(blocMega * 4) / 4}|${Math.round(blocPagina * 4) / 4}|${Math.round(alcada * 4) / 4}`;
      if (ara === anterior) return;
      anterior = ara;
        setRepartiment({ blocMega, blocPagina, alcada, finsLinia, linia });
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
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      obsArrel.disconnect();
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
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
