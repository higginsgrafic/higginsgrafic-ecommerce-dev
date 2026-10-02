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
import { ESPAI_ICONES_PX, AIRE_HERO_PX } from '@/config/iniciNou';

function MarcInici({ seccions }) {
  const [primera, segona, ...resta] = seccions;
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
          '--inici-aire-hero': `${AIRE_HERO_PX}px`,
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
        {/* LA HERO, ENCAIXADA A SOTA, AMB LA SEVA MIDA. */}
        <div
          data-cella="2"
          data-cella-de={segona.id}
          style={{
            flex: '0 0 auto',
            paddingBlock: `${AIRE_HERO_PX}px`,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
