import { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import { useCollectionCardLayout } from '@/hooks/useCollectionCardLayout';
import { collectionGridImageFor, gridFinishFor, collectionGridHoverVariantsFor } from '@/lib/pdpMockup';
import CollectionTableCard from '@/components/tdp/CollectionTableCard';
import CollectionTdpCard from '@/components/tdp/CollectionTdpCard';
import TramFinal from '@/components/home/TramFinal';
import { buildOtherCollectionsImages } from '@/components/home/homeDrawings';
import Breadcrumbs from '@/components/Breadcrumbs';
import useIsMobile from '@/hooks/useIsMobile';
import CollectionMobile from '@/pages/CollectionMobile';
import { SELLING_PRICE_LABEL } from '@/config/pricing';
import { esTauletaApaisada } from '@/utils/layoutMetrics';
import { laneForViewport } from '@/utils/layoutModel';
import {
  getCollectionVerticalConfig,
  COLLECTIONS_MENU,
  COLLECTION_BG_SRC,
  HERO_BACKGROUND_SRC,
  BAND_HEIGHT,
  TDP_MOVE_PX,
  HERO_TDP_GAP_PX,
  HERO_TDP_GAP_TABLET_PX,
  HERO_TDP_GAP_LANDSCAPE_PX,
  HERO_TDP_SEPARACIO_PX,
  TDP_PITCH_FILES,
  TDP_SEPARACIO_FONS_PX,
  TDP_FONS_BLEED_PX,
  TDP_POSTER_SEPARACIO_PX,
} from '@/config/collectionVertical';
import { readOverlayState, writeOverlayState } from '@/utils/collectionOverlayState';

/**
 * La vista vertical d'una pagina de colleccio.
 *
 * Aixo es el que abans eren cinc fitxers de ~600 linies quasi identics
 * (`Collection{Austen,Cube,FirstContact,Miscellania,TheHumanInside}Page.jsx`).
 * Tot el que canviava entre ells es a `config/collectionVertical.js`; aqui
 * nomes hi ha el que es comu i les variants estructurals, sempre explicites.
 *
 * El que NO entra aqui:
 * - la vista mobil: es `CollectionMobile`, que ja era un unic component i que
 *   aquest fitxer fa servir tal qual quan la finestra es de mobil.
 * - cap mesura de layout: les posicions que no es poden calcular es publiquen
 *   com a variables CSS des d'aquest mateix `useLayoutEffect`, ABANS del
 *   pintat, i la resta es `calc()`. Res no s'ha de moure al muntar.
 */
function CollectionVerticalPage({ slug }) {
  const config = useMemo(() => getCollectionVerticalConfig(slug), [slug]);
  const {
    nom,
    nomMenu,
    collectionIcon,
    seoTitle,
    seoDescription,
    products,
    colors,
    posterLines,
    logoStyle,
    colorStrategy = 'graella',
    filesDeFitxes,
    gridRows = 90,
    gridAspect = { tablet: 9717, escriptori: 6708 },
    copy,
  } = config;

  const isMobile = useIsMobile();
  const [overlayState, setOverlayState] = useState(() => readOverlayState(copy));
  const [zeroLeftOffsetPx, setZeroLeftOffsetPx] = useState(0);
  // Alcada d'una fila de la graella de logotips: es proporcional a l'amplada
  // del carril (mesurat a 540, 720 i 900 px), aixi que es calcula en lloc de
  // mesurar-la. El `top` de la hero depen d'aquest numero: si es mesura, la
  // hero es mou quan la mesura s'assenta.
  // Del model unic, no de `getSafeBelt()`: aixo tanca el `dev != produccio`
  // que encara hi havia aqui (getSafeBelt prioritza les guies `--belt2-*`, que
  // nomes existeixen en desenvolupament).
  const [carrilAmple, setCarrilAmple] = useState(() => laneForViewport());
  const rowHeight = Math.max(1, carrilAmple * 0.0280625 - 2.875);
  // La franja blanca ha de tocar el separador del header. Abans es mesurava
  // cada mida (header.bottom - hero.top, alçada de la franja...) amb un
  // `setTimeout` de 300 ms, i els números arribaven DESPRES del pintat: la
  // franja saltava de lloc al muntar.
  //
  // Ara només es publica la posicio de la hero i la de la capçalera
  // (`--hg-hero-top` i `--hg-header-bottom`, al mateix `useLayoutEffect`, o
  // sigui ABANS del pintat). Amb aquests dos números, les tres mides són
  // `calc()` i les tres són exactes:
  //
  //   franja de dalt (pantalla) = --hg-header-bottom   (just al separador)
  //   franja de baix (pantalla) = fons de la finestra
  //   icones (pantalla)         = fons de la finestra - alçada/2
  //
  // Les icones conserven EXACTAMENT la posicio de pantalla que tenien, ara
  // escrita amb `calc()`, independentment de l'alçada real de les icones.
  //
  // Com que les franges viuen dins del contenidor de la hero, a cada expressio
  // s'hi resta la posicio de la hero. Les dues mesures son inevitables (la
  // posicio de la hero depen de la fila de la graella, i la de la capçalera
  // del nombre de files d'ofertes), pero es fan ABANS del pintat: no hi ha cap
  // segon estat i res no es mou.
  const heroRef = useRef(null);
  const heroBandTop = 'calc(var(--hg-header-bottom, 163px) - var(--hg-hero-top, 107px))';
  const heroBottomBandTop = `calc(100vh - ${BAND_HEIGHT} - var(--hg-hero-top, 107px))`;
  const heroIconsTop = `calc(100vh - (${BAND_HEIGHT}) / 2 - var(--hg-hero-top, 107px))`;
  // Quan la imatge (alçada de finestra) sobrepassa l'espai que la graella li
  // reserva, baixem el contingut el mateix tros perque no se solapi. No es pot
  // calcular: depen de l'alçada de la finestra i de la posicio natural de la
  // graella (files fixes amb pitch variable). Es mesura en un `useLayoutEffect`
  // (ABANS del pintat) i es publica com a variable CSS, aixi no cal ni cap
  // re-render ni cap bucle de punt fix ni cap `setTimeout`.
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(esTauletaApaisada());
  const [isPortraitTablet, setIsPortraitTablet] = useState(
    typeof window !== 'undefined'
      && window.innerWidth >= 768
      && window.innerWidth <= 1024
      && window.innerHeight > window.innerWidth
  );
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const { pautaOpacity, tableOpacity, backgroundOpacity } = overlayState;
  const otherImages = useMemo(() => buildOtherCollectionsImages(slug), [slug]);
  const getCardLayout = useCollectionCardLayout({ isPortraitTablet, isLandscapeTablet });

  // Geometria de les fitxes. La seva alcada NO es proporcional a l'alcada de
  // fila de la graella (240 px de fitxa en una fila de 19,09 px a 768), aixi
  // que no es pot posicionar per files: es calcula i es col·loca amb `top`.
  //
  // Les proporcions son mesurades a 768/1024/1280/1366/1440/1920:
  // alcada = carril x 0,4446 (tauleta) o x 0,308 (escriptori).
  // Entre files: 30 px de bleed de baix + 15 px d'aire + 30 px de bleed de dalt.
  const esTauleta = isPortraitTablet || isLandscapeTablet;
  const alcadaFitxa = Math.round(carrilAmple * (esTauleta ? 0.4446 : 0.308));
  const separacioFiles = TDP_SEPARACIO_FONS_PX + 2 * TDP_FONS_BLEED_PX; // 15 + 60
  const numColumnes = esTauleta ? 3 : 4;
  // El GUTTER horitzontal de la pauta: 22,5 px per columna (es el que separen
  // les columnes, i sense ell les fitxes quedaven enganxades lateralment).
  const gutterX = 22.5;
  const ampladaFitxa = Math.round((carrilAmple - (numColumnes - 1) * gutterX) / numColumnes);
  const pasColumna = ampladaFitxa + gutterX;
  const ampladaUtilitzada = ampladaFitxa * numColumnes + (numColumnes - 1) * gutterX;
  const margeEsquerre = Math.round((carrilAmple - ampladaUtilitzada) / 2);
  const alcadaFila = alcadaFitxa + separacioFiles;

  // Mides interiors de la fitxa, proporcionals a la SEVA amplada. Abans el
  // cistell era fix (34 px) i el preu depenia de la finestra
  // (`responsiveFont(24, 9)`), aixi que a 768 el cistell era mes ample que el
  // text del preu i el selector de talles quedava comprimit.
  const midesFitxa = {
    sizeSelectorWidth: `${Math.round(ampladaFitxa * 0.72)}px`,
    sizeSelectorHeight: `${Math.round(ampladaFitxa * 0.2)}px`,
    sizeFontPx: Math.round(ampladaFitxa * 0.07),
    textFontPx: Math.round(ampladaFitxa * 0.095),
    cartSizePx: Math.round(ampladaFitxa * 0.15),
    priceGap: `${Math.round(ampladaFitxa * 0.1)}px`,
  };

  // Desplaçament de la graella perque la primera fitxa quedi sota la hero.
  const [pushDownPx, setPushDownPx] = useState(0);
  // Marge del bloc final (el poster gran). El seu valor fix deixava el poster
  // DAMUNT de l'ultima fila de fitxes a unes mides i no a d'altres, perque tant
  // l'alcada del bloc com la posicio del poster dins seu depenen de l'amplada
  // del carril. Es calcula a partir de la posicio REAL del poster.
  const [margeTramFinal, setMargeTramFinal] = useState(0);



  useEffect(() => {
    writeOverlayState(copy, overlayState);
  }, [overlayState, copy]);

  // Alinea el breadcrumb amb el left del logo GRAFC del header: el seu
  // contenidor (la graella) comença mes a l'esquerra, i aquesta diferencia es
  // l'offset. A tauleta el clamp la deixa a 0; a escriptori val 38 / 47,5 px.
  //
  // El logo i la graella arriben amb el chunk de la capcalera, mes tard que el
  // primer pintat, aixi que no n'hi ha prou de mesurar un cop: un
  // MutationObserver espera que aparegui la graella. Quan apareix es mesura, i
  // el resize cobreix els canvis d'amplada.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let observer = null;
    const mesura = () => {
      const logo = document.querySelector('[data-brand-logo="1"]')
        || document.getElementById('stripe-guide-header-logo-anchor');
      const grid = document.querySelector('[data-pauta-grid]');
      if (!logo || !grid) return false;
      const offset = Math.max(0, logo.getBoundingClientRect().left - grid.getBoundingClientRect().left);
      setZeroLeftOffsetPx((prev) => (Math.abs(prev - offset) < 0.5 ? prev : offset));
      return true;
    };
    if (!mesura()) {
      observer = new MutationObserver(() => {
        if (mesura()) {
          observer.disconnect();
          observer = null;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    const onResize = () => { mesura(); };
    window.addEventListener('resize', onResize);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useLayoutEffect(() => {
    const mesura = () => {
      const hero = heroRef.current;
      if (!hero) return;
      // Publica la posicio de la hero i la de la capçalera ABANS del pintat.
      // La franja de dalt, la de baix i les icones en pengen amb `calc()`.
      const heroTop = Math.round(hero.getBoundingClientRect().top);
      document.documentElement.style.setProperty('--hg-hero-top', `${heroTop}px`);
      const cap = document.querySelector('header');
      if (cap) {
        const headerBottom = Math.round(cap.getBoundingClientRect().bottom);
        document.documentElement.style.setProperty('--hg-header-bottom', `${headerBottom}px`);
      }
      // La imatge acaba exactament on acaba la franja blanca de baix: baixem
      // la graella el que calgui perque la primera targeta quedi SEMPRE per
      // sota. Es calcula sobre la posicio BASE (la del primer intent, quan el
      // desplaçament encara es 0) perque aplicar-lo mou la fitxa exactament el
      // mateix: aixo el fa idempotent i no depen de quantes vegades es mesuri.
      const tdp0 = document.querySelector('[aria-label="TDP taula"]') || document.querySelector('[aria-label="TDP rectangle"]');
      if (tdp0) {
        const heroBottom = hero.getBoundingClientRect().bottom;
        setPushDownPx((prev) => {
          const base = tdp0.getBoundingClientRect().top - prev;
          const cal = Math.max(0, Math.round(heroBottom + HERO_TDP_SEPARACIO_PX - base));
          return Math.abs(cal - prev) < 1 ? prev : cal;
        });
      }
      // El marge del bloc final: el poster ha de quedar sempre a la MATEIXA
      // distancia del final de l'ultima fila de fitxes. Es calcula amb la
      // posicio real del poster i la posicio natural (sense marge) del bloc.
      const tram = document.querySelector('[data-tram-final="1"]');
      const poster = tram ? tram.querySelector('[data-poster-text="1"]') : null;
      if (tram && poster && tdp0) {
        const margeActual = parseFloat(getComputedStyle(tram).marginTop) || 0;
        const tramTop = tram.getBoundingClientRect().top;
        const posterTop = poster.getBoundingClientRect().top;
        const tramNatural = tramTop - margeActual;
        const ultimaFitxaBottom = tdp0.parentElement
          ? Math.max(...[...tdp0.parentElement.children]
            .filter((c) => c.getAttribute('aria-label') === 'TDP taula')
            .map((c) => c.getBoundingClientRect().bottom))
          : tdp0.getBoundingClientRect().bottom;
        const posterRelatiu = posterTop - tramTop;
        const cal = Math.round(ultimaFitxaBottom + TDP_POSTER_SEPARACIO_PX - posterRelatiu - tramNatural);
        setMargeTramFinal((prev) => (prev === cal ? prev : cal));
      }
    };
    mesura();
    // La graella de fitxes i la hero s'acaben d'assentar DESPRES del primer
    // mesurament (les fitxes i les seves imatges arriben mes tard): es torna a
    // mesurar passat el pic de carrega. Aquest es el `setTimeout` que ja hi
    // havia al codi original, i es el que fa convergir el calcul.
    const t = window.setTimeout(mesura, 300);
    // El carril nomes depen de l'amplada de la finestra: es recalcula en
    // resize perque `rowHeight` (i el `top` de la hero) no es quedin
    // congelats al valor del primer render.
    const sincronitzaCarril = () => {
      const nou = laneForViewport();
      setCarrilAmple((prev) => (Math.abs(prev - nou) < 0.5 ? prev : nou));
    };
    const onResize = () => {
      mesura();
      sincronitzaCarril();
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const colorAt = (rowIdx, colIdx) => {
    const idx = rowIdx * 4 + colIdx;
    if (colorStrategy === 'plana') {
      return colors.length ? colors[idx % colors.length] : undefined;
    }
    return colors[rowIdx] ? colors[rowIdx][colIdx] : undefined;
  };

  return (
    <section className="bg-background">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
      </Helmet>

      {isMobile ? (
        <CollectionMobile
          collectionSlug={slug}
          collectionTitle={nomMenu}
          collectionIcon={collectionIcon}
          products={products}
          colors={colors}
          posterLines={posterLines}
        />
      ) : (
        <>

      <Pauta4ColsOverlay
        pautaEnabled={false}
        tableEnabled={false}
        numCols={3}
        numRows={24}
        canvasAspect={[2642, 1780]}
        topOffset="76px"
        bottomPadding="0px"
      >
        {/* Breadcrumbs (fila 2 / 3) — ocults a tablets */}
        {!(isPortraitTablet || isLandscapeTablet) && (
        <div
          style={{
            gridColumn: '1 / 4',
            gridRow: '2 / 3',
            alignSelf: 'start',
            transform: 'translateY(-86px)',
            paddingLeft: `${zeroLeftOffsetPx}px`,
          }}
        >
          <Breadcrumbs items={[{ label: nomMenu }]} />
        </div>
        )}

        {/* Hero de la colleccio: 1) imatge de fons a pantalla completa,
            2) franja blanca al 50% enmig, 3) icona i nom de la colleccio
            sobre la franja. Les icones de colleccio van a sota. */}
        <div
          data-hero="1"
          ref={heroRef}
          style={{
            gridColumn: '1 / 4',
            gridRow: '3 / 25',
            position: 'relative',
            // Plena: de banda a banda del viewport i tota l'alcada de la
            // finestra menys el header, enganxada just a sota.
            top: `calc(-5px - ${rowHeight / 2}px - 144px)`,
            width: '100vw',
            marginLeft: 'calc(50% - 50vw)',
            // La imatge ha d'acabar exactament al fons de la finestra, que es
            // on acaba la franja blanca de baix. La hero NO comença al sostre
            // de la capcalera sino una mica mes avall (depen de la fila de la
            // graella), aixi que l'alcada ha de ser `100vh` menys la SEVA
            // posicio, no menys l'offset de la capcalera: amb l'offset, la
            // franja de baix sortia 49 px per fora de la caixa de la hero i la
            // imatge s'acabava abans que la franja.
            height: 'calc(100vh - var(--hg-hero-top, 107px))',
            zIndex: 1,
          }}
        >
          <img
            src={HERO_BACKGROUND_SRC}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              pointerEvents: 'none',
            }}
          />

          <div
            aria-hidden="true"
            data-hero-band="1"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              // Just sota el separador del header (calculat, vegeu més amunt).
              top: heroBandTop,
              height: BAND_HEIGHT,
              background: 'rgba(255, 255, 255, 0.5)',
              pointerEvents: 'none',
            }}
          />

          {/* Icona + nom, centrats sobre la franja */}
          <div
            aria-label="Títol col·lecció"
            style={{
              position: 'absolute',
              top: heroBandTop,
              left: 0,
              right: 0,
              height: BAND_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            <h1
              style={{
                margin: 0,
                fontFamily: 'Oswald, sans-serif',
                fontWeight: 300,
                fontSize: 'clamp(2.5rem, 8.5vw, 125px)',
                letterSpacing: '0.02em',
                lineHeight: 0.9,
                color: '#0b0d10',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35em',
                whiteSpace: 'nowrap',
              }}
            >
              <img
                src={collectionIcon}
                alt=""
                aria-hidden="true"
                loading="lazy"
                style={logoStyle || {
                  height: '0.75em',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'inline-block',
                  flexShrink: 0,
                  transform: 'translateY(5px)',
                }}
              />
              <span>{nom}</span>
            </h1>
          </div>

          {/* Franja blanca de baix (on abans hi havia el retall), amb la
              mateixa alcada que la de dalt i un 20% de transparencia. */}
          <div
            aria-hidden="true"
            data-hero-band-bottom="1"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: heroBottomBandTop,
              height: BAND_HEIGHT,
              background: 'rgba(255, 255, 255, 0.8)',
              pointerEvents: 'none',
            }}
          />

          {/* Icones de colleccio: mateixa posicio de pantalla que tenien
              (centrades on era la franja blanca de sota). */}
          <div
            style={{
              position: 'absolute',
              top: heroIconsTop,
              left: 0,
              right: 0,
              transform: 'translateY(-50%)',
              display: 'flex',
              // Alineades PEL TOP: la icona mes alta marca la linia de dalt.
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: '44px',
              zIndex: 20,
              pointerEvents: 'auto',
            }}
          >
            {COLLECTIONS_MENU.map((c) => {
              const isFirstContact = c.id === 'first-contact';
              return (
                <Link
                  key={c.id}
                  to={c.href}
                  title={c.name}
                  aria-label={c.name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    transition: 'transform 0.15s ease, opacity 0.15s ease',
                  }}
                  className="hover:scale-110 active:scale-95"
                >
                  <img
                    src={c.icon}
                    alt={c.name}
                    loading="lazy"
                    decoding="async"
                    style={{
                      // Un 25% mes grosses que abans (44 -> 55, 42.1 -> 52.6).
                      width: isFirstContact ? '52.6px' : 'auto',
                      height: isFirstContact ? 'auto' : '55px',
                      objectFit: 'contain',
                      display: 'block',
                      filter: 'brightness(0)',
                    }}
                  />
                </Link>
              );
            })}
          </div>

        </div>
      </Pauta4ColsOverlay>

      <Pauta4ColsOverlay
        pautaEnabled={false}
        tableEnabled={false}
        numCols={(isPortraitTablet || isLandscapeTablet) ? 3 : 4}
        numRows={gridRows}
        canvasAspect={[2642, (isPortraitTablet || isLandscapeTablet) ? gridAspect.tablet : gridAspect.escriptori]}
        topOffset="0px"
        bottomPadding="0px"
        style={{
          // Puja tot el contingut sota el hero 12 files de la taula (41 → 29).
          // Alçada d'1 fila = ampladaBelt × 6708/2642/90; 12 files ≈ 0.3385 × amplada.
          marginTop: `calc((var(--hg-tdp-xL, 0px) - var(--hg-tdp-xR, 0px)) * 0.3385${isLandscapeTablet ? ' - 30px' : ''}${isPortraitTablet ? ' - 120px' : ''} + ${pushDownPx}px${isLandscapeTablet ? ` + ${HERO_TDP_GAP_LANDSCAPE_PX}` : (isPortraitTablet ? ` + ${HERO_TDP_GAP_TABLET_PX}` : ` + ${HERO_TDP_GAP_PX}`)})`,
          // Desplaçament vertical NOMES de les TDP. Va amb `translate` (no
          // `transform`) perque la graella ja fa servir transform per centrar-se
          // i `translate` s'hi suma sense trepitjar-lo.
          translate: `0 ${-TDP_MOVE_PX}px`,
          // El bloc te marge negatiu i queda per sobre de la hero: si no fos
          // transparent als clics, s'empassaria els de les icones de colleccio.
          pointerEvents: 'none',
        }}
      >
        {/* El fons de la pagina es BLANC: el degradat va a cada fitxa. */}
        {Array.from({ length: filesDeFitxes }).flatMap((_, rowIdx) =>
          ((isPortraitTablet || isLandscapeTablet) ? [0, 1, 2] : [0, 1, 2, 3]).map((colIdx) => {
            const idx = rowIdx * 4 + colIdx;
            // Sense files incompletes: quan els productes s'acaben, la graella
            // continua repetint-los des del principi (index ciclic). La mida de
            // la graella es la que tenia cada pagina, no la que demanaria el
            // nombre de productes: canviar-la trauria fitxes.
            const producte = products[idx % products.length];
            const color = colorAt(rowIdx, colIdx);
            if (!color || !producte) return null;
            const col = colIdx + 1;
            const Card = CollectionTableCard;
            // Totes les fitxes son EXACTAMENT com la primera: nom a sobre la
            // samarreta i el fons sense girar. Fora, doncs, l'alternanca de
            // variants que hi havia (abans alternava en escacs per
            // `(rowIdx + colIdx) % 2`).
            const variantB = false;
            const gradientGirat = false;
            // Files de 11 espais + 2 de separacio: el gap entre files de fitxes
            // queda a la meitat.
            const rowOffset = 10 + rowIdx * TDP_PITCH_FILES;
            const cardGeometry = {
              top: rowIdx * alcadaFila,
              left: Math.round(margeEsquerre + colIdx * pasColumna),
              amplada: ampladaFitxa,
              alcada: alcadaFitxa,
            };
            const productName = producte.name;
            const { imageTranslateY, productNameTranslateY, descriptionTranslateY } = getCardLayout(colIdx);
            return (
              <CollectionTdpCard
                key={`tdp-card-r${rowIdx}-c${colIdx}`}
                Component={Card}
                cardGeometry={cardGeometry}
                {...midesFitxa}
                variantB={variantB}
                gradientGirat={gradientGirat}
                backgroundSrc={COLLECTION_BG_SRC}
                rowOffset={rowOffset}
                productName={productName}
                productNameLines={producte.nomLinies}
                description=""
                price={SELLING_PRICE_LABEL}
                imageSrc={collectionGridImageFor(producte.collection || slug, producte.route, color, idx)}
                hoverImages={collectionGridHoverVariantsFor(producte.collection || slug, producte.route, color, idx)}
                imageAlt={`Samarreta Gildan 64000 ${color}`}
                sizes={sizes}
                cartCount={0}
                onAddToCart={(size) => {
                  window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
                    detail: { source: 'collection-tdp-cta', firstPartOnly: true, item: { title: productName.toUpperCase(), collection: nom, collectionSlug: slug, productRoute: producte.route, qty: 1, size, price: SELLING_PRICE_LABEL, color, finish: gridFinishFor(producte.collection || slug, color, idx), drawing: '', disabled: false } },
                  }));
                }}
                editableIdPrefix={`constructor-colleccio-copy${copy}-tdp-col2`}
                presetVersion={`constructor-colleccio-copy${copy}-tdp-cart-34-v9`}
                collectionHref={`/${slug}/${producte.route}?color=${color}&finish=${gridFinishFor(producte.collection || slug, color, idx)}`}
                productNamePlain
                editable={false}
                imageTranslateY={imageTranslateY}
                productNameTranslateY={productNameTranslateY}
                descriptionTranslateY={descriptionTranslateY}
              />
            );
          })
        )}
      </Pauta4ColsOverlay>

      <TramFinal
        posterLines={posterLines}
        tambeImages={otherImages}
        // El marge es calcula per deixar sempre la mateixa distancia entre
        // l'ultima fila de fitxes i el poster (vegeu `margeTramFinal`), i el
        // primer bloc (poster + rail) es desplaça perque el rail quedi sempre
        // sota el TEXT del poster i no a sobre.
        marginTop={`${margeTramFinal}px`}
        visibleCards={(isPortraitTablet || isLandscapeTablet) ? 3 : 4}
      />
        </>
      )}
    </section>
  );
}

export default CollectionVerticalPage;
