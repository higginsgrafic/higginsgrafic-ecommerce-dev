/**
 * EL MARC DE LA PAGINA D'INICI.
 *
 * NOMES es l'estructura: rep una llista de seccions i les munta en ordre de
 * document. La primera (les icones de colleccio) te el SEU espai i la segona (la
 * hero) s'encaixa a sota, amb la seva mida propia.
 *
 * LA BASE SIMPLE (04/10/2026). En Marc: «Li donem un espai a les icones de
 * colleccio i que la hero s'encaixi a sota i prou» i «tornar a la base mes
 * simple. Una pagina basica i senzilla».
 *
 * AQUEST MARC NO SAP RES DEL MEGASLIDE, I LA LINIA NO MANA ENLLOC.
 *
 * Abans, les dues cel·les es repartien el tros de dalt consultant la linia del
 * megaslide —`--hg-mega-bottom`, que el panell publica quan mesura el seu
 * contingut— o una estimacio seva feta amb el carril. Com que allo es movia (el
 * panell s'obre i es tanca, la seva mesura va canviant mentre carrega, i cada
 * pantalla te una alcada), tot el que en depenia es movia tambe. En Marc:
 * «Aquesta linia ha de ser, nome's, teorica i de referencia temporal. No pot
 * tenir cap influencia sobre cap geometria.»
 *
 * Ara cap costat no la llegeix:
 *
 *   - LES ICONES: un espai declarat, `ESPAI_ICONES_PX`, i prou.
 *   - LA HERO: la seva mida propia (la de la seva pagina: l'amplada del carril
 *     amb la seva proporcio, que es declara a `HeroInici.jsx`), amb l'aire
 *     `AIRE_HERO_PX` a cada banda.
 *
 * I res mes: ni alcades de finestra, ni divisions, ni proporcions, ni un bucle
 * que mesuri el DOM. Per aixo la pagina no es pot moure — no hi ha cap numero
 * que canvii quan el megaslide s'obre, es tanca o acaba de carregar.
 *
 * LA LINIA, SI ES VOL MIRAR. El megaslide continua publicant on acaba de debò a
 * `--hg-mega-bottom` (i `-ample` amb l'amplada amb que s'ha mesurat). Es una
 * referencia per mesurar i per diagnosticar: cap `calc` d'aquest projecte no la
 * fa servir, i els guions de mesura la llegeixen per comparar.
 */
import { ESPAI_ICONES_PX, FACTOR_HERO_ESPAI } from '@/config/iniciNou';

function MarcInici({ seccions }) {
  const [primera, segona, ...resta] = seccions;
  const ampleVista = typeof window !== 'undefined' ? window.innerWidth : 0;
  const altVista = typeof window !== 'undefined' ? window.innerHeight : 0;
  // L'ESPAI DE LA HERO: del final de la banda de les icones (que es on acaba el
  // megaslide quan s'obre) fins al fons del viewport. Dins seu la hero va
  // CENTRADA, i si no hi cap s'encongeix proporcionalment (vegeu `HeroInici`).
  //
  // Es el que demanava l'amo el 04/10/2026: «la finalitat d'encabir la hero dins
  // d'una estructura autoregulable, com es una taula, era per garantir que la
  // hero sortis centrada a l'espai que queda entre el megaslide i el bottom del
  // viewport» i «no volem la sensacio de no tenir espai per posar les coses».
  const espaiHeroCss = `calc(100dvh - var(--appHeaderOffset, 0px) - ${ESPAI_ICONES_PX}px)`;
  // LA MIDA DE LA HERO: l'espai per un factor, el mateix a totes les vistes. Amb
  // el factor a 1 va encaixada a zero (toca la banda i el fons) i el que en
  // sobra, quan se'n treu, es reparteix entre les dues bandes.
  const alcadaHeroCss = `calc(${espaiHeroCss} * ${FACTOR_HERO_ESPAI})`;
  // Nome's a l'horitzontal: a la vertical la hero te la seva propia mida.
  const esHoritzontal = ampleVista >= 768 && ampleVista >= altVista;
  return (
    <>
      <div
        className="hg-taula-inici"
        data-taula-inici="1"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: 0,
          // LES DUES XIFRES DE LA PAGINA, publicades com a variables perque les
          // pugui llegir qui les hagi de menester (i els guions de mesura).
          '--inici-espai-icones': `${ESPAI_ICONES_PX}px`,
          // LA MIDA DE LA HERO, publicada: es l'espai per el factor, i la fan
          // servir les peces de dins seu (el mockup, els dibuixos, el shuffle).
          ...(esHoritzontal ? { '--inici-hero-alcada': alcadaHeroCss } : null),
          // L'AIRE QUE EN SURT, tambe publicat (es el que reparteix el centratge).
          '--inici-hero-aire': `calc(${espaiHeroCss} * ${((1 - FACTOR_HERO_ESPAI) / 2).toFixed(4)})`,
          // LA FRONTERA DE LA PAGINA: on s'acaben les icones i comença la hero.
          // Es una referencia propia de la pagina; no te res a veure amb la
          // linia del megaslide.
          '--inici-frontera': `${ESPAI_ICONES_PX}px`,
        }}
      >
        {/* L'ESPAI DE LES ICONES DE COLLECCIO: el seu, declarat. */}
        <div
          data-cella="1"
          data-cella-de={primera.id}
          style={{
            height: `${ESPAI_ICONES_PX}px`,
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {primera.node}
        </div>
        {/* LA HERO, CENTRADA AL QUE QUEDA FINS AL FONS DE LA FINESTRA. */}
        <div
          data-cella="2"
          data-cella-de={segona.id}
          style={{
            height: espaiHeroCss,
            flex: '0 0 auto',
            boxSizing: 'border-box',
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
