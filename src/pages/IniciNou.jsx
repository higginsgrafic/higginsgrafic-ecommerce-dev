import { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { SECCIONS_INICI, COLLECCIONS_INICI, TITOL_MIDA_ESP4 } from '@/config/iniciNou';
import { TDP_MIDES_INTERIOR, COLLECTION_BG_SRC } from '@/config/collectionVertical';
import { buildHomeDrawingPlan } from '@/components/home/homeDrawings';
import HomeColleccio from '@/components/home/HomeColleccio';
import HeroInici from '@/components/home/HeroInici';
import useIsMobile from '@/hooks/useIsMobile';
import { SELLING_PRICE_LABEL } from '@/config/pricing';
import { laneForViewport } from '@/utils/layoutModel';
import { tdpMidaFitxa } from '@/utils/tdpMida';

/**
 * L'INICI NOU.
 *
 * Aquesta pagina es construeix AL COSTAT de l'actual (`/`), darrere la ruta
 * `/nova/inici`, tal com mana `docs/informes/PLA-arquitectura-nova.md` §6: la
 * pagina vella no es toca mentre es construeix la nova, i el canvi de ruta es
 * fa en un sol commit quan la nova compleix la seva porta de sortida.
 *
 * LES REGLES QUE COMPLEIX (§3 del pla):
 *   1. Una sola columna vertebral: les seccions van en flux i en ordre.
 *      No hi ha cap `position: absolute` ni cap `top`.
 *   2. L'alcada la mana el contingut. Les caixes de l'esquelet son NOMES per
 *      veure les seccions que encara no tenen contingut.
 *   3. Els aires es declaren amb l'escala de la fonamenta (`--esp-*`), no es
 *      mesuren ni s'escriuen en pixels.
 *
 * L'ESTRUCTURA DE CONTENIDORS. Dues amplades, i son les de la pagina vella:
 *   - EL CARRIL SENCER (`.hg-carril`, 1350 a 1920): la hero i les GALERIES.
 *     Les fitxes de l'inici fan la MATEIXA mida que les de les pagines de
 *     colleccio (mesurat: 320,6 x 504,6 contra 321 x 505 a 1920), i aixo nomes
 *     surt si la seva graella te el carril sencer.
 *   - EL CONTINGUT AMB MARGE (`.hg-marc__contingut`, 1270): els titols de
 *     colleccio, que fan 40 unitats mes estrets.
 *
 * ELS TITOLS DE COLLECCIO son l'UNIC component que la pagina nova agafa de la
 * vella (`CollectionTitol`), i es provisional: es un component de 140 linies que
 * decideix la seva propia tipografia per amplada de finestra (`fontSize:
 * 4.4vw`), i la pagina nova ha de tenir el seu. Es fa servir perque els titols
 * no son l'objectiu d'aquesta passa i perque, aixi, la galeria es pot comparar
 * amb la vella sense que dues coses canviin alhora.
 *
 * EL QUE ENCARA NO HI ES: el contingut de la hero (les diapositives), el
 * contingut de les galeries 2 a 5 i el poster. La capçalera i el peu depenen de
 * la fase 7 i del marc de pagina.
 */
function IniciNou() {
  const isMobile = useIsMobile();

  // Les mateixes mides de fitxa que les pagines de colleccio: `tdpMidaFitxa` es
  // l'unica font de veritat, i el carril d'aqui fa el mateix.
  const midaTdp = tdpMidaFitxa(
    laneForViewport(),
    typeof window !== 'undefined' ? window.innerWidth : 0,
    typeof window !== 'undefined' ? window.innerHeight : 0,
  );
  const midesFitxa = {
    sizeSelectorWidth: `${Math.round(midaTdp.amplada * TDP_MIDES_INTERIOR.selectorAmplada)}px`,
    sizeSelectorHeight: `${Math.round(midaTdp.amplada * TDP_MIDES_INTERIOR.selectorAlcada)}px`,
    sizeFontPx: Math.round(midaTdp.amplada * TDP_MIDES_INTERIOR.selectorFont),
    textFontPx: Math.round(midaTdp.amplada * TDP_MIDES_INTERIOR.text),
    cartSizePx: Math.round(midaTdp.amplada * TDP_MIDES_INTERIOR.cistell),
    priceGap: `${Math.round(midaTdp.amplada * TDP_MIDES_INTERIOR.preuGap)}px`,
  };
  // `minmax(0, 1fr)` amb `gap`: les columnes son ELASTIQUES i es reparteixen
  // l'amplada del carril.
  const tdpGridColumns = `repeat(${midaTdp.columnes}, minmax(0, 1fr))`;

  // El pla de dibuixos i colors, un cop per muntatge (aleatori a cada carrega).
  const drawingPlan = useMemo(
    () => buildHomeDrawingPlan({ perCollection: midaTdp.columnes }),
    [midaTdp.columnes],
  );

  const cardProps = (slug, index, size) => {
    const item = drawingPlan?.[slug]?.[index];
    if (!item) return {};
    const collectionName = COLLECCIONS_INICI.find((c) => c.slug === slug)?.name || slug.toUpperCase();
    return {
      productName: item.productName,
      imageSrc: item.mockupSrc,
      imageAlt: `Samarreta ${item.color}`,
      overlaySrc: item.overlaySrc,
      overlayAlt: item.overlayAlt,
      ...midesFitxa,
      ...(item.hoverImages ? { hoverImages: item.hoverImages } : {}),
      ...(item.productHref ? { productHref: item.productHref } : {}),
      ...(item.overlayScale != null ? { overlayScale: item.overlayScale } : {}),
      ...(item.overlayTranslateY != null ? { overlayTranslateY: item.overlayTranslateY } : {}),
      onAddToCart: () => {
        try {
          const href = item.productHref || '';
          const productRoute = href.split('?')[0].split('/')[2] || '';
          window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
            detail: {
              source: 'home-tdp-cta',
              firstPartOnly: true,
              item: {
                title: item.productName.toUpperCase(),
                collection: collectionName,
                collectionSlug: slug,
                productRoute,
                qty: 1,
                size,
                price: SELLING_PRICE_LABEL,
                color: item.color,
                drawing: '',
                disabled: false,
              },
            },
          }));
        } catch {
          // ignore
        }
      },
    };
  };

  // El titol d'una colleccio amb el seu numero de fons i els seus
  // desplaçaments, que son el dibuix propi de cada colleccio.
  const Titol = ({ title, subtitle, collectionHref, titleOffsetY = 0, numberAlign, numberOffsetX = -20 }) => {
    const numeroDreta = (numberAlign || 'center') === 'right';
    const desplacament = titleOffsetY ? { display: 'inline-block', transform: `translateY(${titleOffsetY}px)` } : undefined;
    return (
      <div className="relative mb-10 mt-[27px] lg:mb-14 w-full">
        <div className="relative flex flex-col gap-3 w-full">
          <h2
            className="relative font-light uppercase text-foreground"
            style={{
              fontFamily: 'Oswald, sans-serif',
              // LA CAIXA CONTE EL TEXT. Era `leading-[0.85]`, i amb aixo la
              // caixa feia 71,8 px i el text pintat 125: 27 unitats per dalt i
              // 26 per baix FORA de la seva caixa. Era el defecte d'origen de
              // tota la geometria de l'inici (ESPEC-inici-neteja.md §0).
              lineHeight: 'normal',
              // LES LLETRES. Era `tracking-[-0.02em]`, que son -1,69 px a 1920:
              // el titol estava COMPRIMIT un 22 %. S'ha tret la compressio i
              // s'hi ha afegit distancia; el valor te el seu nom aquí perque es
              // el parametre que regula com de separades van les lletres.
              letterSpacing: '0.5em',
              // La mida va sobre el CARRIL i no sobre la finestra: es el que fa
              // que el sobreeixit del text (27 unitats) sigui el mateix a totes
              // les mides, i que l'aire entre galeries sigui constant.
              fontSize: `calc(var(--esp-4) * ${(TITOL_MIDA_ESP4 * 11.25).toFixed(4)})`,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute hidden select-none font-light leading-none tracking-tighter text-foreground/[0.06] sm:block"
              style={{
                fontFamily: 'Oswald, sans-serif',
                fontSize: 'clamp(9rem, 30vw, 26rem)',
                top: '50%',
                lineHeight: 1,
                transform: 'translateY(-50%)',
                ...(numeroDreta ? { right: `${-numberOffsetX}px` } : { left: `${numberOffsetX}px` }),
              }}
            />
            <Link to={collectionHref} style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="relative" style={desplacament}>{title}</span>
            </Link>
          </h2>
          {subtitle ? (
            <p
              className="font-roboto text-[1.125rem] text-muted-foreground uppercase"
              style={{ letterSpacing: '0.1em', margin: 0, display: 'inline-block', width: '100%', textAlign: 'center' }}
            >
              <span className="relative" style={desplacament}>{subtitle}</span>
            </p>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>HIGGINS GRÀFIC — Inici (nou)</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {isMobile ? (
        <div className="hg-marc" style={{ padding: 'var(--esp-4)' }}>
          <p>Aquesta pàgina encara no té la vista mòbil: es construeix sobre l&apos;escriptori.</p>
        </div>
      ) : (
        <div className="hg-marc" data-inici-nou="1">
          {/* 01 · LA HERO, al carril sencer. El carril ha d'ENVOLTAR el bloc de
              la hero i no ser-ne el pare: el seu aire es un `paddingInline` en
              percentatge, i un percentatge de padding es mesura sobre
              l'amplada del PARE. Amb el carril de pare, el 70,5 % de 1350 dona
              952; amb la seccio de pare (tota la finestra) en donava 1.200. */}
          <div className="hg-carril">
            <section className="hg-seccio" data-seccio="hero" aria-label="Hero">
              <HeroInici />
            </section>
          </div>

          <div className="hg-marc__contingut">
            {/* 02 a 06 · LES CINC GALERIES. */}
            {COLLECCIONS_INICI.map((colleccio, index) => (
              <section
                key={colleccio.id}
                className="hg-seccio"
                data-seccio={colleccio.id}
                aria-label={colleccio.label}
                // L'AIRE ENTRE GALERIES. El marge de la seccio NO es l'aire
                // que es veu: la pindola es `absolute` i baixa 169 unitats del
                // seu bloc, i aixo ho compensa `reservaPindola`; i el TEXT del
                // titol comença 27 unitats abans de la seva caixa.
                //
                // L'AIRE DE SOBRE D'AQUESTA SECCIO.
                //
                // Les galeries 2 a 6 van separades pel doble de l'`--esp-4`, i
                // la 1 va a la MEITAT, perque l'amo la vol mes a prop de la
                // hero. Es el parametre que governa l'espai entre la hero i la
                // primera colleccio.
                //
                // MESURAT: 271,9 px a 1920 amb el marge sencer, i 136,0 amb
                // aquest, que es la meitat exacta. I ho es a les cinc mides
                // (279,9->106,0 / 282,5->96,0 / 286,8->80,0 / 291,0->64,0).
                //
                // El marge es `--esp-4 + 16px` i no `--esp-4 / 2` perque la
                // cadena te una part que no escala (la formula de sota).
                style={{
                  // L'AIRE DE SOBRE. La primera galeria va mes a prop de la
                  // hero que les altres entre elles: l'amo demana la meitat de
                  // l'espai perque la colleccio no quedi enganxada a la hero.
                  //
                  // MESURAT: amb el marge sencer l'aire es 271,9 px a 1920, i
                  // amb aquest es 135,9, que es la meitat. El marge es
                  // `--esp-4 + 16` i no `--esp-4 / 2` perque s'hi ha de sumar la
                  // part que no escala de la formula.
                  marginBlockStart: index === 0
                    ? 'calc(var(--esp-4) + 16px)'
                    : 'calc(2 * (var(--esp-4) + 151.9px - 0.0708 * 100vw))',
                }}
              >
                <HomeColleccio
                  Titol={Titol}
                  title={colleccio.title}
                  subtitle={colleccio.subtitle}
                  href={colleccio.href}
                  slug={colleccio.slug}
                  editableIdPrefix={`nova-${colleccio.id}`}
                  numberAlign={colleccio.numberAlign}
                  numberOffsetX={colleccio.numberOffsetX}
                  tdpGridColumns={tdpGridColumns}
                  columnes={midaTdp.columnes}
                  cardPropsFn={cardProps}
                  midesFitxa={midesFitxa}
                  backgroundSrc={COLLECTION_BG_SRC}
                  marginBlockStart="0px"
                  reservaPindola
                  titolAire="calc(2 * var(--esp-4))"
                  {...(index === COLLECCIONS_INICI.length - 1 ? { zIndex: 30 } : {})}
                />
              </section>
            ))}

            {/* 07 · EL POSTER (encara buit). */}
            {SECCIONS_INICI.filter((s) => s.id === 'poster').map((seccio) => (
              <section
                key={seccio.id}
                className="hg-seccio"
                data-seccio={seccio.id}
                aria-label={seccio.label}
                style={{ marginBlockStart: 'var(--esp-4)' }}
              >
                <div
                  data-esquelet="1"
                  style={{
                    minHeight: 'var(--esp-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed hsl(var(--border))',
                    color: 'hsl(var(--muted-foreground))',
                    fontFamily: 'Roboto Condensed, sans-serif',
                    fontSize: '0.875rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {seccio.label}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default IniciNou;
