/**
 * EL MARC DE LA PAGINA D'INICI.
 *
 * NOMES es l'estructura: rep una llista de seccions i les munta en ordre de
 * document. Les dues primeres (les icones i la hero) es reparteixen L'ESPAI QUE
 * QUEDA DESPRES DEL MEGASLIDE amb tres aires iguals.
 *
 * D'ON ARRENCA LA ZONA. No de la capçalera, del MEGASLIDE. El megaslide no
 * ocupa el que ocupa la capçalera: a 1920 la capçalera fa 120 px i el panell
 * n'acaba 497. La divisio es publica com a `--inici-frontera`, i aquest marc no
 * sap res mes del megaslide.
 *
 * EL REPARTIMENT. De la divisio del megaslide al fons de la finestra hi ha
 * d'haver, per aquest ordre:
 *
 *   cadenat | aire | icones | aire | hero | aire
 *
 * Els tres aires son el MATEIX numero, i la suma de tot plegat es la zona. Amb
 * allo que no pot canviar (el cadenat, les icones) i allo que si (la hero),
 * l'equacio te una solucio tancada:
 *
 *   hero = (zona − 3*resguard − icones) / 2      els tres aires son la meitat
 *
 * I si la hero hi cap amb el seu tamany natural, mana el natural i els aires
 * son mes grans.
 *
 * PER QUE L'AIRE TE UN MINIM. El cadenat ocupa 56 px just sota la divisio (es
 * a `--inici-resguard`, que es frontera + 56). Si l'aire fos mes petit que el
 * cadenat, el cadenat hi entraria i trepitjaria el que hi hagues a sota, que es
 * exactament el que passava. Per aixo l'aire te un minim, i qui cedeix es la
 * hero.
 *
 * PER QUE ES CALCULA AQUI I NO AMB `calc`. Una variable de CSS hereva el valor
 * que te ON S'HA DECLARAT: el `calc` no viatja, el que viatja es el resultat. Si
 * es declara a `:root` es resol alla, on `--inici-zona-alcada` encara val
 * `100vh`, i el resultat baixa congelat; declarat al marc passa el mateix. Ja
 * va passar: el topall de la hero es calculava amb una zona de 1080 quan la
 * zona en feia 583, i la hero se n'anava a 1296 px i desapareixia de la
 * pantalla.
 *
 * PER QUE LA HERO POT ENCONGIR-SE I LES ICONES NO. Les icones son una alcada
 * declarada. La hero surt del seu aspecte, i per tant pot encongir-se
 * mantenint-lo. Es l'unica peça que pot absorbir el que el megaslide es menja,
 * i el megaslide no ocupa el mateix a totes les pantalles: a 1920 deixa 583 px
 * i a 1280x720 nomeś 328.
 */
import { useEffect, useRef } from 'react';

/** El tros que ocupa el cadenat just sota la divisio del megaslide. */
const RESGUARD = 56;
/** Terra per a finestres impossibles: sense ell, la hero faria zero. */
const HERO_MINIM = 46;
function MarcInici({ seccions }) {
  const [primera, segona, ...resta] = seccions;
  const zonaRef = useRef(null);

  useEffect(() => {
    const zona = zonaRef.current;
    if (!zona) return undefined;
    const caixa = zona.querySelector('[data-hero-caixa="1"]');
    const franja = zona.querySelector('[data-icones-colleccions="1"]');
    if (!caixa || !franja) return undefined;

    let raf = 0;
    let anterior = null;

    const reparteix = () => {
      const z = zona.getBoundingClientRect().height;
      const icones = franja.getBoundingClientRect().height;
      // AL PRINCIPI LES PEÇES ENCARA NO TENEN MIDA. El megaslide s'obre amb una
      // animacio, i al primer fotograma la caixa val zero. Publicar-ho deixaria
      // el repartiment amb una hero de zero. Es torna a provar quan
      // `ResizeObserver` vegi les peces canviar de mida.
      if (z < 1 || icones < 1) return;
      // L'ALCADA NATURAL DE LA CAIXA: l'amplada passada per la seva proporcio,
      // menys les dues vores d'1 px que el `aspect-ratio` no compta. Es calcula
      // i no es mesura perque mesurar-la amb el topall posat dona l'alcada JA
      // ENCONGIDA, i aleshores la correccio es tornaria a alimentar.
      const ample = caixa.getBoundingClientRect().width;
      const parts = (getComputedStyle(caixa).aspectRatio || '').split('/');
      const r = parts.length === 2 ? parseFloat(parts[0]) / parseFloat(parts[1]) : 952 / 401;
      const natural = Number.isFinite(r) && r > 0 ? Math.max(1, ample / r - 2) : 0;
      // ELS AIRES. De la divisio del megaslide al fons de la finestra hi ha
      // d'haver, per aquest ordre:
      //
      //   cadenat | aire | icones | aire | hero | aire
      //
      // i la suma de tot plegat es la zona. Els tres aires son el MATEIX
      // numero, pero hi ha DUES celles: la de les icones en porta dos (un a
      // cada costat) i la de la hero un. Per aixo la primera porta dues
      // vegades l'aire i la segona una.
      //
      // L'aire no pot ser mes petit que el cadenat: si ho fos, el cadenat hi
      // entraria i trepitjaria el que hi hagues a sota, que es exactament el
      // que passava. D'aqui surt el sostre de la hero, que es l'unica peca que
      // pot encongir-se:
      //
      //   aire >= resguard   ->   hero <= zona - 3*resguard - icones
      //
      // Els tres resguards son el de sobre el primer aire, el del mig i el de
      // sota la hero.
      // Amb els tres aires iguals, l'equacio te una solucio tancada:
      //
      //   3*aire + icones + hero = zona - resguard
      //   aire = (zona - resguard - icones - hero) / 3
      //   ->  hero = (zona - 3*resguard - icones) / 2
      //
      // o sigui que la hero val la meitat del que queda despres del cadenat i
      // les icones, i els tres aires son la meitat de la hero. Quan aixo fa la
      // hero mes gran del que demana, mana el seu tamany natural.
      const sostre = Math.max(HERO_MINIM, (z - 3 * RESGUARD - icones) / 2);
      const hero = Math.min(natural, sostre);
      const aire = Math.max(RESGUARD, (z - RESGUARD - icones - hero) / 3);
      zona.style.setProperty('--inici-hero-sostre', `${hero}px`);
      // La cella de les icones porta l'aire a cada costat (dos), i la de la
      // hero nomes a dalt (un). Per aixo dues variables i no una.
      zona.style.setProperty('--inici-buit-doble', `${2 * aire}px`);
      zona.style.setProperty('--inici-buit', `${aire}px`);
      // El numero que decideix si ja hi som: si no s'ha mogut, s'atura.
      const ara = `${Math.round(z * 4) / 4}|${Math.round(hero * 4) / 4}`;
      if (ara === anterior) return;
      anterior = ara;
      raf = requestAnimationFrame(reparteix);
    };

    reparteix();

    const obs = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      anterior = null;
      raf = requestAnimationFrame(reparteix);
    });
    obs.observe(zona);
    obs.observe(caixa);
    obs.observe(franja);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={zonaRef}
        className="hg-taula-inici"
        data-taula-inici="1"
        style={{
          height: 'calc(100vh - var(--inici-frontera))',
          display: 'flex',
          flexDirection: 'column',
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
            paddingBlock: 'var(--inici-buit-doble, 0px)',
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
            paddingBlock: 'var(--inici-buit, 0px) 0',
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
