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
import { espaiMegaslideCss, AIRE_HERO_PX } from '@/config/iniciNou';

function MarcInici({ seccions }) {
  const [primera, segona, ...resta] = seccions;
  const ampleVista = typeof window !== 'undefined' ? window.innerWidth : 0;
  const altVista = typeof window !== 'undefined' ? window.innerHeight : 0;
  // LA BANDA DE LES ICONES FA EL QUE FA EL MEGASLIDE (vegeu
  // `espaiMegaslideCss`): aixi la hero arrenca exactament on acaba el panell,
  // sense buit ni tapa. Es declarat amb el carril, no mesurat.
  const espaiMegaslide = espaiMegaslideCss(ampleVista, altVista);
  // L'ESPAI DE LA HERO: del final de la banda de les icones (que es on acaba el
  // megaslide quan s'obre) fins al fons del viewport. Dins seu la hero va
  // CENTRADA, i si no hi cap s'encongeix proporcionalment (vegeu `HeroInici`).
  //
  // Es el que demanava l'amo el 04/10/2026: «la finalitat d'encabir la hero dins
  // d'una estructura autoregulable, com es una taula, era per garantir que la
  // hero sortis centrada a l'espai que queda entre el megaslide i el bottom del
  // viewport» i «no volem la sensacio de no tenir espai per posar les coses».
  const espaiHeroCss = `calc(100dvh - var(--appHeaderOffset, 0px) - ${espaiMegaslide})`;
  // EL QUE HI CAP A LA HERO: l'espai fins al fons del viewport menys l'aire de
  // cada banda. Nome's es un TOPALL: la hero fa la seva mida de disseny i, si no
  // hi cap (finestra curta), s'hi encongeix proporcionalment (ho fa `HeroInici`).
  const heroDisponibleCss = `calc(${espaiHeroCss} - ${AIRE_HERO_PX * 2}px)`;
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
          '--inici-espai-icones': espaiMegaslide,
          // L'AIRE DE LA HERO I EL QUE HI CAP: la hero fa la seva mida de
          // disseny i nome's s'encongeix si no hi cap.
          '--inici-hero-aire': `${AIRE_HERO_PX}px`,
          '--inici-hero-espai': heroDisponibleCss,
          // LA FRONTERA DE LA PAGINA: on s'acaben les icones i comença la hero.
          // Es una referencia propia de la pagina; no te res a veure amb la
          // linia del megaslide.
          '--inici-frontera': espaiMegaslide,
        }}
      >
        {/* L'ESPAI DE LES ICONES DE COLLECCIO: el seu, declarat. */}
        <div
          data-cella="1"
          data-cella-de={primera.id}
          style={{
            height: espaiMegaslide,
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {primera.node}
        </div>
        {/* LA HERO, AMB LA SEVA MIDA, JUST A SOTA LA BANDA.
            La cel·la s'ajusta a la hero (mes l'aire) i nome's arriba fins al fons
            del viewport si la hero es tan alta: aixi la pagina flueix i les
            galeries amb les TDP entren a la primera pantalla. */}
        <div
          data-cella="2"
          data-cella-de={segona.id}
          style={{
            flex: '0 0 auto',
            paddingBlock: `${AIRE_HERO_PX}px`,
            boxSizing: 'border-box',
            maxHeight: espaiHeroCss,
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
