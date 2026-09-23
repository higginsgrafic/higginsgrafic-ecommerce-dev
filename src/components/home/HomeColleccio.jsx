import { useState } from 'react';
import { Link } from 'react-router-dom';
import CollectionTableCard from '@/components/tdp/CollectionTableCard';
import {
  HOME_TITOL_TDP_MARGIN_PX,
  HOME_GALERIA_TOP_PX,
  HOME_COLLECCIO_MARGIN_PX,
} from '@/config/collectionVertical';
import { TITOL_CARDS_FACTOR } from '@/config/iniciNou';

/**
 * EL QUE LA PINDOLA BAIXA DE LA SEVA SECCIO, en unitats de disseny sobre el
 * carril de 1350.
 *
 * `PINDOLA_TOP` es el seu `top: calc(100% + 130px)` QUAN ES ABSOLUTA, que es com
 * la fa servir la pagina vella, i `PINDOLA_ALCADA_U` es la seva alcada mesurada
 * (39 unitats a 1920).
 *
 * LA PAGINA NOVA LA POSA AL FLUX (`pindolaAlFlux`), i aixo es el que estalvia
 * tota la comptabilitat: essent un element mes de la columna, el bloc la conte
 * per construccio, i el marge de la seccio passa a ser l'aire que es veu.
 */
const PINDOLA_TOP = 130;
const PINDOLA_ALCADA_U = 39;

/**
 * Una galeria de la pagina d'inici: el titol d'una colleccio i la seva fila de
 * fitxes amb la pindola «SI EN VOLS SABER» a sota.
 *
 * PER QUE EXISTEIX. Les cinc galeries de l'inici eren cinc blocs copiats
 * (107 linies x 4, i 148 el cinque) amb el mateix embolcall, el mateix bloc de
 * titol, els mateixos quatre `gridColumn` i la mateixa pindola. Nomes canviaven
 * el titol, el subtitol, la ruta, l'slug i el prefix dels textos editables. Amb
 * cinc copies, qualsevol arranjament s'havia de fer cinc cops i era facil
 * deixar-se'n una: va passar amb el bloc de la pindola i amb les mides de la
 * fitxa.
 *
 * ELS AIRES. Els governen tres numeros, i cada un viu en un sol lloc:
 *
 *   HOME_COLLECCIO_MARGIN_PX   el bloc de la galeria respecte l'anterior (220)
 *   HOME_TITOL_TDP_MARGIN_PX   el titol respecte la seva fila de fitxes (130)
 *   top: calc(100% + 130px)    la pindola respecte la caixa de la fitxa
 *
 * ELS DESPLACAMENTS DEL TITOL (`titleOffsetX/Y`, `numberOffsetX/Y`,
 * `subtitleOffsetX/Y`) son DISSENY, no pedacos: el numero de fons de cada
 * colleccio i el seu titol es mouen per composicio, i cada colleccio te el seu
 * dibuix. Son configuracio, i per aixo s'accepten com a prop i s'escriuen un
 * cop per galeria des de `Home.jsx`.
 *
 * EL QUE NO HI ES, I PER QUE. Els quatre marges `[129, 162, 104, 124]` que hi
 * havia eren calibratges a ma, un per galeria, sense cap motiu escrit; el seu
 * efecte era que la distancia entre blocs fos diferent a cada colleccio (319,
 * 352, 294 i 314 px). Ara hi ha un sol marge per a totes, i el seu valor esta
 * raonat a `collectionVertical.js`. Amb ell la pindola no toca el titol de la
 * colleccio seguent, que es el que passava amb els 190 px que el codi deia que
 * volia.
 */

// La fitxa de taula, NOMES la variant A (nom a dalt). La B (imatge a dalt) es
// va treure per decisio de l'amo: les dues variants donaven alcades de fitxa
// diferents i el ritme de les galeries no era estable.
const TableCardA = (props) => <CollectionTableCard {...props} />;

function HomeTdpCard({ slug, index, cardPropsFn, collectionHref, editableIdPrefix, gridColumn, style, portraitTablet = false, backgroundSrc, midesFitxa }) {
  const [size, setSize] = useState('M');
  const portraitAdjustment = portraitTablet
    ? {
        imageTranslateY: `calc(-44px + calc(calc(var(--hg-tdp-xR) - var(--hg-tdp-xL)) * 0.01410547))`,
        descriptionLineHeight: 1.2,
      }
    : {};
  return (
    // El fons i les mides interiors van ABANS de `cardPropsFn` perque aquest
    // torna `{}` quan no te dades del producte (la ultima fitxa de cada
    // galeria): sense aixo, aquella fitxa quedava sense fons i amb les mides
    // per defecte del component.
    <TableCardA
      backgroundSrc={backgroundSrc}
      {...midesFitxa}
      // El fons degradat s'INTERCALA amunt i avall: la fitxa senar el porta
      // girat verticalment (`scaleY(-1)` al fons). Com que l'index es la
      // columna dins la fila, la 1a i la 3a el porten d'una manera i la 2a i
      // la 4a de l'altra.
      gradientGirat={index % 2 === 1}
      gridColumn={gridColumn}
      editableIdPrefix={editableIdPrefix}
      {...cardPropsFn(slug, index, size)}
      collectionHref={collectionHref}
      selectedSize={size}
      onSizeChange={setSize}
      copyMode={true}
      style={style}
      {...portraitAdjustment}
    />
  );
}

/**
 * La pindola «SI EN VOLS SABER +» que porten totes les galeries.
 *
 * Va a `top: calc(100% + 130px)` de la graella, que es el fons de la CAIXA de
 * la fitxa. Han de ser 130 i no 100 perque el fons degradat SOBRESURT 30 px
 * per sota de la caixa: el buit VISIBLE fins a la pindola es de 100 px, iguals
 * a les cinc mides (TESTIMONI §4, trampa 1).
 */
function PindolaColleccio({ href, alFlux = false }) {
  return (
    <Link
      to={href}
      style={{
        // Amb la pindola al flux no hi ha `absolute`, ni `left`, ni `top`: es
        // un element mes de la columna, i el seu lloc el dona el pare.
        ...(alFlux
          ? { position: 'static' }
          : { position: 'absolute', left: '50%', top: `calc(100% + ${PINDOLA_TOP}px)`, transform: 'translateX(-50%)' }),
        height: 'auto',
        width: 'auto',
        borderRadius: '9999px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        zIndex: 20,
        transition: 'all 200ms ease',
        textDecoration: 'none',
      }}
      className="hover:shadow-md hover:border-neutral-400 active:scale-95 group"
      title="Veure tota la col·lecció"
    >
      <span
        style={{
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 300,
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#475059',
          lineHeight: 1,
        }}
        className="group-hover:text-neutral-900"
      >
        <span style={{ display: 'inline-block', transform: 'translateY(3px)' }}>SI EN VOLS SABER</span>{' '}
        <span style={{ display: 'inline-block', fontSize: '25px', fontWeight: 100, lineHeight: 1, verticalAlign: 'middle', transform: 'translateY(1px)' }}>+</span>
      </span>
    </Link>
  );
}

function HomeColleccio({
  Titol,
  title,
  subtitle,
  href,
  slug,
  editableIdPrefix,
  tdpGridColumns,
  cardPropsFn,
  midesFitxa,
  backgroundSrc,
  portraitTablet = false,
  portraitTabletTdpGridStyle = {},
  columnes = 4,
  zIndex,
  // L'aire de sobre del bloc. Per defecte, el de la pagina vella (un numero
  // declarat a `collectionVertical.js`); la pagina nova hi passa un `--esp-*`,
  // que es el seu sistema d'aires.
  marginBlockStart = `${HOME_COLLECCIO_MARGIN_PX}px`,
  // Quant s'ha de PUJAR el titol perque l'aire de sobre del bloc sigui el que es
  // veu, i no `aire − el que el titol te de propi`. El titol te 27 unitats de
  // marge propi i 3 mes del text; el seu `font-size` de 4,4vw es el pitjor
  // d'ells, perque ENGANYA: 4,4 % de la FINESTRA no es 4,4 % del CARRIL, i a
  // 768 la finestra i el carril no son proporcionals. Mesurat: 27 unitats a
  // 1920 i 41 a 768 (mes del DOBLE).
  //
  // Per aixo el marge de la seccio no pot governar l'aire de la pagina nova. El
  // titol es qui el governa, i el marge se'n DERIVA.
  titolAire = null,
  // LA PINDOLA, AL FLUX. Quan s'activa, la pindola deixa de ser `absolute` i
  // passa a ser el tercer element de la columna (titol, fitxes, pindola). Aixo
  // es el que fa que el bloc la contingui: sense reserva, sense voladis i sense
  // cap formula que ho compensi.
  //
  // La pagina vella NO l'activa: alla la pindola es `absolute` i el seu marge
  // de 220 px la compensa. Canviar-ho li mouria les colleccions.
  pindolaAlFlux = false,
  // EL TITOL, A L'INICI DEL SEU BLOC. El component del titol te un marge propi
  // (`mt-[27px]`) i la seva caixa s'hi afegeix, de manera que el TEXT arrenca
  // 76,8 unitats DESPRES de l'inici del bloc. Amb aixo, el marge de la seccio no
  // pot ser l'aire que es veu: sempre n'hi ha 151,9 de mes.
  //
  // Amb `titolAPrincipi`, el marge propi es neutralitza i el text arrenca a
  // l'inici. L'amo ho decideix per pagina: la vella no ho activa (te els seus
  // marges calibrats), la nova si.
  titolAPrincipi = false,
}) {
  // Les columnes 3 i 4 nomes existeixen si la graella en te tantes. La 1 i la 2
  // hi son sempre: a 768 la graella en te 2.
  const indexos = [0, 1, 2, 3].filter((i) => i < columnes);

  return (
    <div
      style={{
        marginBlockStart,
        // El bloc es el CONTAINING BLOCK de la pindola QUAN es absoluta (la
        // pagina vella). Amb la pindola al flux no cal, i per aixo s'activa
        // nomes quan toca.
        ...(pindolaAlFlux ? {} : { position: 'relative' }),
        ...(zIndex ? { zIndex } : {}),
      }}
    >
      <div style={{
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
        // El `mt-[27px]` del component del titol; a zero, el text arrenca a
        // l'inici del bloc.
        ...(titolAPrincipi ? { marginBlockStart: '0px' } : {}),
      }}>
        <Titol
          index=""
          kicker="Col·lecció"
          title={title}
          subtitle={subtitle}
          align="center"
          titleTextAlign="center"
          collectionHref={href}
        />
      </div>
      <div style={{
        // LA CAIXA DEL TITOL I LES FITXES. El marge es declara, i el valor de
        // la pagina nova es 76,8 unitats de disseny (0,64 de `--esp-4`) perque
        // la caixa del titol ja conte el text: vegeu `TITOL_CARDS_FACTOR`.
        //
        // La pagina vella en fa 130 i a mes neutralitza el `mt-[27px]` del
        // component del titol (que s'hi suma) restant-li el voladis de la
        // pindola. Tot aixo eren consequencies del desbordament.
        // El marge entre l'inici del bloc i les fitxes. `titolAire` es el que
        // fa la pagina nova; el valor fix es el de la vella.
        marginTop: titolAire
          ? `calc(${titolAire} * ${TITOL_CARDS_FACTOR.toFixed(4)})`
          : (portraitTablet ? `${HOME_TITOL_TDP_MARGIN_PX.tauleta}px` : `${HOME_TITOL_TDP_MARGIN_PX.escriptori}px`),
      }}>
        <div
          style={{
            position: 'relative',
            left: '50%',
            top: `${HOME_GALERIA_TOP_PX}px`,
            transform: 'translateX(-50%)',
            width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
            // L'alcada la mana el CONTINGUT (les fitxes). ERA la formula
            // `carril * 0.84632 - 231`, que no te res a veure amb la mida de
            // la fitxa: a 1280 i 1024 era MES CURTA que la fitxa i la pindola
            // hi quedava A SOBRE (28 i 58 px de xoc).
            height: 'auto',
            display: 'grid',
            gridTemplateColumns: tdpGridColumns,
            columnGap: '22.5px',
            ...portraitTabletTdpGridStyle,
          }}
        >
          {indexos.map((index) => (
            <HomeTdpCard
              key={index}
              slug={slug}
              index={index}
              cardPropsFn={cardPropsFn}
              midesFitxa={midesFitxa}
              backgroundSrc={backgroundSrc}
              portraitTablet={portraitTablet}
              collectionHref={href}
              editableIdPrefix={`${editableIdPrefix}-tdp-${index + 1}`}
              gridColumn={`${index + 1} / ${index + 2}`}
              style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }}
            />
          ))}
          {!pindolaAlFlux && <PindolaColleccio href={href} />}
        </div>
      </div>
      {pindolaAlFlux && (
        // EL TERCER ELEMENT DE LA COLUMNA. El seu aire es `--esp-4`, el mateix
        // token que governa la resta de la pagina, i no cal cap reserva ni cap
        // correccio: el bloc conte el que es veu.
        <div style={{ marginBlockStart: 'var(--esp-4)', display: 'flex', justifyContent: 'center' }}>
          <PindolaColleccio href={href} alFlux />
        </div>
      )}
    </div>
  );
}

export default HomeColleccio;
