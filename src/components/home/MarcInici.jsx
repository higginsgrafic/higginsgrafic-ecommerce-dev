/**
 * EL MARC DE LA PAGINA D'INICI.
 *
 * NOMES es l'estructura: rep una llista de seccions i les munta en ordre de
 * document. Les dues primeres (les icones i la hero) es reparteixen L'ESPAI QUE
 * QUEDA DESPRES DEL MEGASLIDE amb tres aires iguals.
 *
 * ON CAU LA LINIA DEL MEGASLIDE. No on acaba la capçalera: a 1920 la capçalera
 * fa 120 px i el panell del megaslide n'acaba 497; a 1440, 426; a 1024 i 1280,
 * 392; a 768, 565. El megaslide publica aquesta vora com a `--hg-mega-bottom`,
 * i d'aqui surt `--inici-frontera` (vegeu `foundation.css`). Aquest marc no sap
 * res mes del megaslide.
 *
 * EL REPARTIMENT. De la linia al fons de la finestra hi ha d'haver, per aquest
 * ordre:
 *
 *   cadenat | aire | icones | aire | hero | aire
 *
 * El cadenat i les dues peces tenen mida propia i NO es toquen: la franja
 * d'icones es una alcada declarada, i la hero surt del seu aspecte amb
 * l'amplada del carril. El que es reparteix es nomes l'espai que sobra, i es
 * reparteix en tres aires iguals:
 *
 *   aire = (zona − resguard − icones − hero) / 3
 *
 * SI LA FINESTRA ES CURTA, l'aire queda a zero i prou: la pagina s'allarga i
 * s'ha de desplaçar. Es deliberat. Encongir la hero per encabir-hi tot faria
 * que la peça canviés de mida segons la pantalla, i allo que es vol es que
 * quedi com esta.
 *
 * PER QUE RES ES MOU EN OBRIR EL PANELL. L'aire surt de l'alcada de la zona, i
 * la zona surt de la linia del megaslide: com que la linia es publica sempre
 * amb el mateix valor, obrir i tancar el panell no canvia cap numero. Abans es
 * repartia contra `--appHeaderOffset`, i aleshores el cadenat queia damunt la
 * hero (48 px a 1920, 38 a 1440, 48 a 1280 i 1024, 43 a 768).
 *
 * PER QUE ES CALCULA AQUI I NO AMB `calc`. Una variable de CSS hereva el valor
 * que te ON S'HA DECLARAT: el `calc` no viatja, el que viatja es el resultat.
 * Declarat a `:root` es resolia amb la zona a `100vh` perque la xifra bona la
 * publica el marc mes avall, i el resultat baixava congelat. El que cal es
 * mesurar, i mesurar es cosa d'aquest component.
 */
import { useEffect, useRef, useState } from 'react';

/** El repartiment inicial, abans del primer mesurament. */
const REPARTIMENT_INICIAL = { aire: 0, alcada: null };

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
      const linia = (() => {
        cala.style.width = 'var(--hg-mega-bottom, 0px)';
        const publicada = parseFloat(getComputedStyle(cala).width) || 0;
        if (publicada > 0) return publicada;
        cala.style.width = 'var(--inici-nou-carril, 0px)';
        const carril = parseFloat(getComputedStyle(cala).width) || 0;
        cala.style.width = 'var(--appHeaderOffset, 0px)';
        const capcalera = parseFloat(getComputedStyle(cala).width) || 0;
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
      // ELS TRES BUITS, IGUALS.
      //
      // De dalt a baix: la capçalera, un buit, les icones (Austen), un altre
      // buit, la hero i un tercer buit. El que sobra de la finestra despres de
      // les tres peces es reparteix en els tres buits:
      //
      //   buit = (finestra − header − icones − hero) / 3
      //
      // i a 1920 dona (1080 − 121 − 70 − 426) / 3 = 154 px. Els comptes
      // quadren: 121 + 154 + 70 + 154 + 426 + 154 = 1079, tota la finestra.
      //
      // PER QUE ES LA FINESTRA I NO LA ZONA. La zona depen de la linia del
      // megaslide, i la linia canvia de lloc segons la mida; amb el repartiment
      // lligat a la zona, el bloc quedava col·locat de maneres diferents a cada
      // mida (mesurat: la hero passava del 73 % de la zona a 1920 al 95 % a
      // 1280). La finestra no depen de res.
      cala.style.width = 'var(--appHeaderOffset, 0px)';
      const capcalera = parseFloat(getComputedStyle(cala).width) || 0;
      // LES TRES DISTANCIES SON IGUALS: de la capçalera a les icones, de les
      // icones a la hero i de la hero al fons. El seu valor es:
      //
      //   buit = (finestra − header − icones − hero) / 3
      //
      // i a 1920 dona (1080 − 121 − 70 − 426) / 3 = 154 px, que es el que
      // mesura la referencia.
      //
      // ENTRE LES ICONES I LA HERO N'HI HA DOS, de buits: un que posa la cella
      // de les icones pel seu costat de baix i un que posa la de la hero pel
      // seu costat de dalt. Per aixo cada cella en posa la MEITAT.
      const buit = Math.max(0, (window.innerHeight - capcalera - icones - natural) / 3);
      const aire = buit / 2;
      const alcada = natural;
      // El numero que decideix si ja hi som: si no s'ha mogut, s'atura.
      const ara = `${Math.round(zonaAlcada * 4) / 4}|${Math.round(alcada * 4) / 4}|${Math.round(aire * 4) / 4}`;
      if (ara === anterior) return;
      anterior = ara;
        setRepartiment({ aire, alcada, finsLinia, linia });
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
          // L'alcada de la finestra es el MINIM; si les peces no hi caben, la
          // zona creix i la pagina s'allarga. La linia la publica el marc, que
          // es qui la sap mesurar.
          minHeight: `calc(100vh - ${repartiment.linia ?? 0}px)`,
          display: 'flex',
          flexDirection: 'column',
          // El repartiment, publicat com a variables de CSS. Els valors surten
          // de l'estat i per tant cap render de React se'ls pot emportar.
          '--inici-buit': `${repartiment.aire}px`,
          '--inici-dalt': `${(repartiment.finsLinia ?? 0)}px`,
          '--inici-frontera': `${repartiment.linia ?? 0}px`,
          ...(repartiment.alcada == null ? {} : { '--inici-hero-sostre': `${repartiment.alcada}px` }),
          // La flexio no ha de repartir l'espai que sobra: els aires son
          // `padding` de les celles i han de ser exactament el que s'ha
          // calculat.
          justifyContent: 'flex-start',
          gap: 0,
        }}
      >
        <div
          data-cella="1"
          data-cella-de={primera.id}
          style={{
            // Un buit a dalt (entre la capçalera i les icones) i un a baix.
            paddingBlock: 'var(--inici-buit, 0px)',
            display: 'flex',
            flexDirection: 'column',
            // ANCORADA A BAIX. Cada cella porta el seu aire a dalt i a baix, i
            // el contingut ha de quedar exactament entre els dos. Amb el
            // contingut centrat, si es mes baix que la cella (que es el cas de
            // la franja d'icones) el reparteix entre els dos aires i en dobla
            // un: mesurat, la franja pujava 101 px i la hero queia damunt del
            // panell del megaslide.
            justifyContent: 'flex-end',
          }}
        >
          {primera.node}
        </div>
        <div
          data-cella="2"
          data-cella-de={segona.id}
          style={{
            // Un buit a dalt (entre les icones i la hero) i un a baix (de la
            // hero al fons).
            paddingBlock: 'var(--inici-buit, 0px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
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
