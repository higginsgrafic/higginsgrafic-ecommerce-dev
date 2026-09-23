import { useState, useLayoutEffect, useRef, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import TDP1 from '@/components/tdp/TDP1';
import TDP2 from '@/components/tdp/TDP2';
import CollectionTableCard from '@/components/tdp/CollectionTableCard';
import EditableTextBox from '@/components/dev/EditableTextBox';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import { buildHomeDrawingPlan, buildHeroStripePlan } from '@/components/home/homeDrawings';
import StoryPosterLink from '@/components/StoryPosterLink';
import useIsMobile from '@/hooks/useIsMobile';
import HomeMobile from '@/pages/HomeMobile';
import { SELLING_PRICE_LABEL } from '@/config/pricing';
import { HOME_TITOL_TDP_MARGIN_PX, HOME_GALERIA_TOP_PX, HOME_GALERIA_AIRE_SOTA_PX, HOME_COLLECCIO_MARGIN_PX, TDP_MIDES_INTERIOR, COLLECTION_BG_SRC } from '@/config/collectionVertical';
import { esTauletaApaisada } from '@/utils/layoutMetrics';
import { laneForViewport } from '@/utils/layoutModel';
import { tdpMidaFitxa } from '@/utils/tdpMida';

const HERO_SLIDES = [
  {
    id: 'first-contact',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_royal_gpr-4-0_front.webp',
    imageAlt: 'Samarreta de la col·lecció First Contact',
    kicker: 'First Contact',
    headline: 'Ciència-ficció per mirar cap a les estrelles.',
    primaryCta: { label: 'Compra', href: '/first-contact' },
    secondaryCta: { label: 'Descobreix', href: '/first-contact' },
  },
  {
    id: 'the-human-inside',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.webp',
    imageAlt: 'Samarreta de la col·lecció The Human Inside',
    kicker: 'The Human Inside',
    headline: 'Robots, identitat i preguntes incòmodes.',
    primaryCta: { label: 'Compra', href: '/thin' },
    secondaryCta: { label: 'Descobreix', href: '/thin' },
  },
  {
    id: 'austen',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_cardinal-red_gpr-4-0_front.webp',
    imageAlt: 'Samarreta de la col·lecció Austen',
    kicker: 'Austen',
    headline: 'Diguis el que diguis, fes-ho amb elegància.',
    primaryCta: { label: 'Compra', href: '/austen' },
    secondaryCta: { label: 'Descobreix', href: '/austen' },
  },
  {
    id: 'cube',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_purple_gpr-4-0_front.webp',
    imageAlt: 'Samarreta de la col·lecció Cube',
    kicker: 'Cube',
    headline: 'Tots som estranys a ulls nostres.',
    primaryCta: { label: 'Compra', href: '/cube' },
    secondaryCta: { label: 'Descobreix', href: '/cube' },
  },
  {
    id: 'miscellania',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_forest-green_gpr-4-0_front.webp',
    imageAlt: 'Samarreta de la col·lecció Miscel·lània',
    kicker: 'Miscel·lània',
    headline: 'Per a qui tria el seu propi camí.',
    primaryCta: { label: 'Compra', href: '/miscellania' },
    secondaryCta: { label: 'Descobreix', href: '/miscellania' },
  },
];

const COLLECTIONS_MENU = [
  {
    id: 'first-contact',
    name: 'First Contact',
    href: '/first-contact',
    icon: '/custom_logos/collections/collection-first-contact-logo.webp',
  },
  {
    id: 'the-human-inside',
    name: 'The Human Inside',
    href: '/the-human-inside',
    icon: '/custom_logos/collections/collection-thin-logo.svg',
  },
  {
    id: 'austen',
    name: 'Austen',
    href: '/austen',
    icon: '/custom_logos/collections/collection-jean-austen-logo.svg',
  },
  {
    id: 'cube',
    name: 'Cube',
    href: '/cube',
    icon: '/custom_logos/collections/collection-cube-logo.svg',
  },
  {
    id: 'miscellania',
    name: 'Miscel·lània',
    href: '/miscellania',
    icon: '/custom_logos/collections/collection-miscellania-logo.svg',
  },
];

function CollectionTitle({ index, kicker, title, subtitle, align = 'left', numberAlign, titleOffsetX = 0, titleOffsetY = 0, numberOffsetX = -20, numberOffsetY = 0, numberTopPercent = 50, subtitleOffsetX = 0, subtitleOffsetY = 0, titleTextAlign, collectionHref }) {
  const isRight = align === 'right';
  const resolvedNumberAlign = numberAlign || align;
  const isNumberRight = resolvedNumberAlign === 'right';
  const ghostStyle = {
    fontFamily: 'Oswald, sans-serif',
    fontSize: 'clamp(9rem, 30vw, 26rem)',
    top: `${numberTopPercent}%`,
    lineHeight: 1,
    ...(isNumberRight
      ? { right: `${-numberOffsetX}px`, transform: `translateY(calc(-50% + ${numberOffsetY}px))` }
      : { left: `${numberOffsetX}px`, transform: `translateY(calc(-50% + ${numberOffsetY}px))` }),
  };
  return (
    <div className={`relative mb-10 mt-[27px] lg:mb-14 w-full ${isRight ? 'text-right' : 'text-left'}`}>
      <div
        className="relative flex flex-col gap-3 w-full"
      >
        <h2
          className="relative font-light uppercase leading-[0.85] tracking-[-0.02em] text-foreground"
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: '4.4vw',
            width: '100%',
            textAlign: titleTextAlign || (isRight ? 'right' : 'left'),
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute hidden select-none font-light leading-none tracking-tighter text-foreground/[0.06] sm:block"
            style={ghostStyle}
          >
            {index}
          </span>
          {collectionHref ? (
            <Link to={collectionHref} style={{ textDecoration: 'none', color: 'inherit' }}>
              <span
                className="relative"
                style={
                  titleOffsetX || titleOffsetY
                    ? {
                        display: 'inline-block',
                        transform: `translate(${typeof titleOffsetX === 'string' ? titleOffsetX : `${titleOffsetX}px`}, ${typeof titleOffsetY === 'string' ? titleOffsetY : `${titleOffsetY}px`})`,
                      }
                    : undefined
                }
              >
                {title}
              </span>
            </Link>
          ) : (
            <span
              className="relative"
              style={
                titleOffsetX || titleOffsetY
                  ? {
                      display: 'inline-block',
                      transform: `translate(${typeof titleOffsetX === 'string' ? titleOffsetX : `${titleOffsetX}px`}, ${typeof titleOffsetY === 'string' ? titleOffsetY : `${titleOffsetY}px`})`,
                    }
                  : undefined
              }
            >
              {title}
            </span>
          )}
        </h2>

        {subtitle ? (
          <p
            className="font-roboto text-[1.125rem] text-muted-foreground uppercase"
            style={{
              letterSpacing: '0.1em',
              margin: 0,
              whiteSpace: 'nowrap',
              display: 'inline-block',
              width: '100%',
              textAlign: titleTextAlign || (isRight ? 'right' : 'left'),
            }}
          >
            <span
              className="relative"
              style={
                (titleOffsetX || titleOffsetY || subtitleOffsetX || subtitleOffsetY)
                  ? {
                      display: 'inline-block',
                      transform: `translate(
                        calc(${typeof titleOffsetX === 'string' ? titleOffsetX : `${titleOffsetX}px`} + ${typeof subtitleOffsetX === 'string' ? subtitleOffsetX : `${subtitleOffsetX}px`}),
                        calc(${typeof titleOffsetY === 'string' ? titleOffsetY : `${titleOffsetY}px`} + ${typeof subtitleOffsetY === 'string' ? subtitleOffsetY : `${subtitleOffsetY}px`})
                      )`,
                    }
                  : undefined
              }
            >
              {subtitle}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

const COLLECTION_NAMES = {
  'first-contact': 'FIRST CONTACT',
  'the-human-inside': 'THE HUMAN INSIDE',
  'austen': 'AUSTEN',
  'cube': 'CUBE',
  'miscellania': 'MISCEL·LÀNIA',
};

// Fitxa de taula: NOMES la variant A (nom a dalt). La B (imatge a dalt) s'ha
// tret per decisio de l'amo: les dues variants donaven alcades de fitxa
// diferents i el ritme de les galeries no era estable. Totes les pagines fan
// servir ara la del nom a dalt.
const TableCardA = (props) => <CollectionTableCard {...props} />;

function HomeTdpCard({ Component, slug, index, cardPropsFn, collectionHref, editableIdPrefix, gridColumn, style, portraitTablet = false, backgroundSrc, midesFitxa }) {
  const [size, setSize] = useState('M');
  const portraitAdjustment = portraitTablet
    ? Component === TDP2
      ? { imageTranslateY: 'calc(-44px + calc(calc(var(--hg-tdp-xR) - var(--hg-tdp-xL)) * 0.01410547))', descriptionLineHeight: 1.2 }
      : { descriptionTranslateY: 'calc(-5px - 10%)', descriptionLineHeight: 1.2 }
    : {};
  return (
    // El fons i les mides interiors van ABANS de `cardPropsFn` perque aquest
    // torna `{}` quan no te dades del producte (la ultima fitxa de cada
    // galeria): sense aixo, aquella fitxa quedava sense fons i amb les mides
    // per defecte del component.
    <Component
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

function Home() {
  const isMobile = useIsMobile();
  const pautaGridRef = useRef(null);
  const [rowHeight, setRowHeight] = useState(38);
  const [isPortraitTablet, setIsPortraitTablet] = useState(
    typeof window !== 'undefined'
      && window.innerWidth >= 768
      && window.innerWidth <= 1024
      && window.innerHeight > window.innerWidth
  );
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(esTauletaApaisada());
  const isTablet = isPortraitTablet || isLandscapeTablet;

  // La MATEIXA mida de fitxa que les pagines de colleccio: surt de
  // `tdpMidaFitxa`, que es l'unica font de veritat. El carril d'aqui fa el
  // mateix (540/720/1013), aixi que les fitxes queden identiques.
  const midaTdpHome = tdpMidaFitxa(
    laneForViewport(),
    typeof window !== 'undefined' ? window.innerWidth : 0,
    typeof window !== 'undefined' ? window.innerHeight : 0,
  );

  // Les mides INTERIORS de la fitxa, proporcionals a la seva amplada. Son les
  // MATEIXES que fa servir la pagina de colleccio (`CollectionVerticalPage`):
  // si no s'hi passen, la fitxa cau als valors per defecte (selector del 62 %
  // d'amplada i 34 px d'alcada FIXA, text de talla a 7 pt), i el mateix
  // component surt amb un selector la meitat de gran que a les colleccions:
  // 36,6 x 28 px a l'inici contra 45 x 58 a la colleccio, amb la mateixa caixa.
  const midesFitxaHome = {
    sizeSelectorWidth: `${Math.round(midaTdpHome.amplada * TDP_MIDES_INTERIOR.selectorAmplada)}px`,
    sizeSelectorHeight: `${Math.round(midaTdpHome.amplada * TDP_MIDES_INTERIOR.selectorAlcada)}px`,
    sizeFontPx: Math.round(midaTdpHome.amplada * TDP_MIDES_INTERIOR.selectorFont),
    textFontPx: Math.round(midaTdpHome.amplada * TDP_MIDES_INTERIOR.text),
    cartSizePx: Math.round(midaTdpHome.amplada * TDP_MIDES_INTERIOR.cistell),
    priceGap: `${Math.round(midaTdpHome.amplada * TDP_MIDES_INTERIOR.preuGap)}px`,
  };

// El nombre de columnes de la graella de fitxes, de la MATEIXA font que la
  // mida: `midaTdpHome.columnes` (3 a tauleta, tambe apaïsada; 4 a escriptori).
  // Abans la graella fixava 3 columnes sempre i a escriptori en sortien 3 en
  // comptes de 4.
  // `minmax(0, 1fr)` amb `gap`: les columnes son ELASTIQUES i es reparteixen
  // l'amplada del carril. Amb `calc(...)` fix les columnes s'eixamplaven quan
  // el contingut de la fitxa era mes ample que la columna.
  const tdpGridColumns = `repeat(${midaTdpHome.columnes}, minmax(0, 1fr))`;


  // Desplaçament de la hero de l'inici perque el seu fons quedi a 20 px del
  // fons de la finestra, NOMES a la vista vertical. Es mesura un cop, abans del
  // pintat (el `transform: scale()` impedeix calcular-ho amb `calc()`).
  const heroHomeRef = useRef(null);
  const [heroOffsetPx, setHeroOffsetPx] = useState(0);
  const heroMesuratRef = useRef(false);
  const heroIntentsRef = useRef(0);

  useLayoutEffect(() => {
    if (!isPortraitTablet) {
      heroMesuratRef.current = false;
      setHeroOffsetPx(0);
      return;
    }
    const el = heroHomeRef.current;
    if (!el || heroMesuratRef.current) return;
    // Correcció: es mesura on es i s'ajusta. Com que aplicar el desplaçament
    // en mou el resultat, es repeteix fins que queda al lloc (amb un limit de
    // passades per no poder entrar mai en bucle).
    const b = el.getBoundingClientRect();
    const desajust = Math.round((window.innerHeight - 20) - b.bottom);
    // Un numero absurd vol dir que la mesura no es de fiar: no s'aplica res.
    if (Math.abs(desajust) > 600) {
      heroMesuratRef.current = true;
      return;
    }
    if (Math.abs(desajust) <= 1 || heroIntentsRef.current >= 5) {
      heroMesuratRef.current = true;
      return;
    }
    heroIntentsRef.current += 1;
    setHeroOffsetPx((prev) => prev + desajust);
  }, [isPortraitTablet, heroOffsetPx]);

  // Pla de franges per l'hero: 5 colors + 5 dibuixos aleatoris
  // Només es regenera quan l'usuari clica el botó shuffle.
  // Es manté el pla anterior perquè les velles surtin mentre les noves entren.
  // L'apaisada amb finestra ampla (1280/1366) i la tauleta de 1024: l'amo hi
  // vol l'hero mes avall, amb valors propis.
  const esApaissadaAmpla = typeof window !== 'undefined'
    && isLandscapeTablet && window.innerWidth > 1024;
  // Escriptori estret (fins a 1440): l'amo hi vol l'hero 25 px mes avall.
  const esEscriptoriEstret = typeof window !== 'undefined'
    && !isPortraitTablet && !isLandscapeTablet
    && window.innerWidth > 0 && window.innerWidth <= 1440
    && window.innerWidth >= window.innerHeight;
  // La baixada de l'hero, en un sol numero: la fa servir l'hero I la resta de
  // la home (la seccio de sota), perque quan l'hero baixa la resta tambe ho ha
  // de fer.
  const baixadaHero = (esEscriptoriEstret ? 25 : 0)
    + (esApaissadaAmpla ? 70 : 0)
    + ((isLandscapeTablet && !esApaissadaAmpla) ? 125 : 0);
  const [heroPlans, setHeroPlans] = useState({ current: buildHeroStripePlan(), prev: null });
  const [heroCycle, setHeroCycle] = useState(0);

  const handleShuffle = () => {
    setHeroPlans(({ current }) => ({ current: buildHeroStripePlan(), prev: current }));
    setHeroCycle((c) => c + 1);
  };

  // Pla d'assignació dibuix + color de samarreta per a les targetes.
  // Es calcula un cop per muntatge (aleatori a cada càrrega).
  // Un producte per columna de la graella: 3 a tauleta i 4 a escriptori. Si
  // n'hi hagues menys, quedarien columnes buides (passava a 1440 i 1920).
  const drawingPlan = useMemo(
    () => buildHomeDrawingPlan({ perCollection: midaTdpHome.columnes }),
    [midaTdpHome.columnes],
  );
  const cardProps = (slug, index, size) => {
    const item = drawingPlan?.[slug]?.[index];
    if (!item) return {};
    const collectionName = COLLECTION_NAMES[slug] || slug.toUpperCase();
    return {
      productName: item.productName,
      imageSrc: item.mockupSrc,
      imageAlt: `Samarreta ${item.color}`,
      overlaySrc: item.overlaySrc,
      overlayAlt: item.overlayAlt,
      // Les mides interiors proporcionals, les mateixes que a les colleccions.
      ...midesFitxaHome,
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
                size: size,
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

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const measure = () => {
      setIsPortraitTablet(
        window.innerWidth >= 768
          && window.innerWidth <= 1024
          && window.innerHeight > window.innerWidth
      );
      setIsLandscapeTablet(esTauletaApaisada());
      const gridEl = pautaGridRef.current;
      if (!gridEl) return;
      const rect = gridEl.getBoundingClientRect();
      const numRows = 73; // Nombre de files per aquest segment (ha de coincidir amb la pauta numRows={73})
      const rowGap = 3; // gutterY per defecte de Pauta4ColsOverlay
      // Alçada EXACTA d'una fila (descomptant els gaps entre files), perquè
      // les fletxes quadrades càpiguen exactament dins d'una sola fila.
      const singleRowH = (rect.height - (numRows - 1) * rowGap) / numRows;
      setRowHeight((prev) => (Math.abs(prev - singleRowH) < 0.1 ? prev : singleRowH));
    };

    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 100);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, []);

  // A la vista vertical, tres fitxes per fila com a les pagines de colleccio.
  // El carril fa 736 px i, amb un gutter de 22,5, cada columna en fa 225,67.
  // A la vista vertical, la graella de fitxes es la del CARRIL, la mateixa que
  // fan servir les pagines de colleccio. Abans sobreescrivia `--hg-tdp-xL/xR`
  // amb valors propis (16 i 1178, que donen 736 px en comptes de 540) i per
  // aixo el nombre de columnes no sortia de la regla general.
  const portraitTabletTdpGridStyle = isPortraitTablet
    ? {
        width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
        gridTemplateColumns: tdpGridColumns,
      }
    : {};


  return (
    <>
      <Helmet>
        <title>HIGGINS GRÀFIC — Inici</title>
        <meta
          name="description"
          content="Samarretes gràfiques d'autor, roba unisex i col·leccions pròpies produïdes sota demanda."
        />
      </Helmet>

      {isMobile ? (
        <HomeMobile />
      ) : (
        <>
      <Pauta4ColsOverlay
        pautaEnabled={false}
        tableEnabled={false}
        numCols={3}
        numRows={24}
        canvasAspect={[2642, 1780]}
        topOffset={isTablet ? '38px' : '76px'}
        bottomPadding="0px"
      >
        {/* ==================================================================
            TAULA DE L'INICI (nomes a la vista vertical)
            Dues files: a dalt les icones de les colleccions, a baix la hero.
            Va del fons de la CAPÇALERA al fons de la PANTALLA, i per aixo
            l'alcada surt de `100vh` menys el desplaçament del header: no cal
            cap mesura ni cap numero calibrat.
            A la resta de mides les dues peces es queden a les seves cel·les.
            ================================================================== */}
        {isPortraitTablet && (
          <div
            aria-hidden="true"
            style={{
              gridColumn: '1 / 4',
              gridRow: '3 / 26',
              position: 'absolute',
              left: 0,
              right: 0,
              top: 'var(--hg-hero-top, 107px)',
              height: 'calc(100vh - var(--hg-hero-top, 107px))',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'none',
              zIndex: 4,
            }}
          >
            <div style={{ flex: '1 1 auto' }} />
            <div style={{ height: '20px', flex: '0 0 auto' }} />
          </div>
        )}

        {/* Icones de col·leccions on era el logo */}
        <div
          style={{
            gridColumn: '1 / 4',
            gridRow: '3 / 7',
            alignSelf: 'center',
            position: 'relative',
            zIndex: 10,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '44px',
            pointerEvents: 'auto',
            // Centrat entre la capcalera i l'hero (en y): els valors surten de
            // mesurar el centre d'Austen i el mig del buit a cada vista.
            transform: `translateY(${isPortraitTablet ? '89px' : (esApaissadaAmpla ? '66px' : (isLandscapeTablet ? '86px' : '9px'))})`,
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
                  alignItems: 'center',
                  justifyContent: 'center',
                  // El Phoenix (First Contact) es mes alt (99 px) que la resta
                  // (70,4) i quedava 18 px mes avall: s'alinea amb el grup
                  // d'Austen, que es la referencia de volum.
                  transform: 'translateY(-18px)',
                  transition: 'transform 0.15s ease',
                }}
                className="hover:scale-110 active:scale-95"
              >
                <img
                  src={c.icon}
                  alt={c.name}
                  style={{
                    width: isFirstContact ? '67.36px' : 'auto',
                    height: isFirstContact ? 'auto' : '70.4px',
                    objectFit: 'contain',
                    display: 'block',
                    filter: 'brightness(0)',
                  }}
                />
              </Link>
            );
          })}
        </div>

        {/* Hero — 5 franges horitzontals apilades (una per col·lecció) */}
        <div
          ref={heroHomeRef}
          style={{
            gridColumn: '1 / 4',
            gridRow: '10 / 25',
            position: 'relative',
            // A la VISTA VERTICAL la hero baixa el que calgui perque el seu
            // fons quedi a 20 px del fons de la finestra. Es calcula mesurant
            // on es (el `transform: scale()` fa que la caixa no coincideixi
            // amb el que es veu, aixi que no es pot fer amb `calc()`).
            top: `calc(-5px - ${rowHeight / 2}px${isLandscapeTablet ? ' - 50px' : ''} - 50px${isLandscapeTablet ? ' + 50px' : ''}${isLandscapeTablet ? ' + 25px' : ''} + ${baixadaHero}px + ${heroOffsetPx}px)`,
            width: 'calc(100% + 1px)',
            height: isPortraitTablet ? '430px' : 'calc(100% + 2px)',
            transform: 'scale(0.705)',
            transformOrigin: 'center center',
            zIndex: isPortraitTablet ? 5 : undefined,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            overflow: 'hidden',
            borderRadius: isTablet ? '12px' : '24px',
          }}
        >
          {/* Botó shuffle manual */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShuffle(); }}
            aria-label="Barreja samarretes i dibuixos"
            style={{
              position: 'absolute',
              top: '50%',
              right: '32px',
              animation: 'hg-shuffle-zoom 4s ease-in-out infinite',
              zIndex: 10,
              background: 'transparent',
              border: 'none',
              borderRadius: '12px',
              width: '72px',
              height: '72px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
            className="hover:bg-white transition-colors"
          >
            <Shuffle size={50} color="#475059" />
          </button>
          {heroPlans.current.map((s, i) => {
            const prev = heroPlans.prev ? heroPlans.prev[i] : null;
            const renderBand = (band, idx, animType, key) => band ? (
              <div
                key={key}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  // Sortida: delay = i * 0.6s. Entrada: delay = i * 0.6s + 3s
                  // (la nova entra només quan la vella ha desaparegut)
                  animation: heroPlans.prev
                    ? `${i % 2 === 0 ? `hg-hero-${animType}-even` : `hg-hero-${animType}-odd`} 0.2s ease-in-out ${i * 0.075 + (animType === 'enter' ? 0.1 : 0)}s both`
                    : 'none',
                }}
              >
                {/* Samarreta */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0, right: 0, top: 0,
                    height: '500%',
                    backgroundImage: `url(${band.mockupSrc})`,
                    backgroundSize: 'auto 100%',
                    backgroundPosition: 'center top',
                    backgroundRepeat: 'no-repeat',
                    transform: `translateY(-${idx * 20}%)`,
                    pointerEvents: 'none',
                  }}
                />
                {/* Dibuix */}
                {band.overlaySrc && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0, right: 0, top: 0,
                      height: '500%',
                      backgroundImage: `url(${band.overlaySrc})`,
                      backgroundSize: `auto ${(() => {
                        const id = band.overlayAlt;
                        const overrides = {
                          'first_contact/nx-01': 7,
                          'first_contact/ncc-1701': 7,
                          'first_contact/ncc-1701-d': 3.5,
                          'first_contact/the-phoenix': isTablet ? 42.35 : 46.585,
                          'austen/it-is-a-truth': isTablet ? 12.8 : 12.16,
                          'austen/half-agony-half-hope': isTablet ? 6 : 4.8,
                          'austen/unsociable-and-taciturn': isTablet ? 3 : 2.4,
                          'austen/i-admire-and-love-you': isTablet ? 6 : 12.16,
                          'austen/you-have-bewitched-me': isTablet ? 3 : 2.4,
                          'austen/you-must-allow-me': isTablet ? 12.8 : 12.16,
                          'austen/lfmd/blue-solid': 19,
                          'austen/lfmd/fuchsia-solid': 19,
                          'austen/lfmd/red-solid': 19,
                          'austen/lfmd/yellow-solid': 19,
                        };
                        return overrides[id] != null ? overrides[id] : 30;
                      })()}%`,
                      backgroundPosition: 'center 35%',
                      backgroundRepeat: 'no-repeat',
                      transform: `translateY(-${idx * 20}%)`,
                      pointerEvents: 'none',
                      opacity: 0.95,
                    }}
                  />
                )}
                {/* Títol */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    paddingLeft: '24px',
                    color: '#475059',
                  }}
                >
                  {band.collectionName && (() => {
                    const showAustenSplit = isPortraitTablet && (idx === 1 || idx === 2) && band.collectionSlug === 'austen' && band.drawingLabel;
                    if (showAustenSplit) {
                      return (
                        <div>
                          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: isTablet ? '13px' : '18px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0, opacity: 0.95 }}>
                            {`${band.collectionName}/`}
                          </p>
                          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: isTablet ? '11px' : '15px', fontWeight: 400, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '1px 0 0 0', opacity: 0.8 }}>
                            {band.drawingLabel}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: isTablet ? '13px' : '18px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0, opacity: 0.95 }}>
                        {(idx === 1 || idx === 2) && band.subName ? `${band.collectionName} / ${band.subName}` : band.collectionName}
                      </p>
                    );
                  })()}
                </div>
              </div>
            ) : null;

            return (
              <Link
                key={`${heroCycle}-${i}`}
                to={((i === 1 || i === 2) && s.productHref) ? s.productHref : s.collectionHref}
                style={{
                  flex: '1 1 0',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  background: '#FFFFFF',
                  textDecoration: 'none',
                }}
                className="group hover:opacity-90 transition-opacity"
              >
                {/* Capa anterior: surt per la part grisa */}
                {renderBand(prev, i, 'exit', `prev-${i}`)}
                {/* Capa actual: entra per la part blanca i es queda */}
                {renderBand(s, i, 'enter', `cur-${i}`)}
              </Link>
            );
          })}
        </div>
      </Pauta4ColsOverlay>

      {/* El bloc de colleccions. NO porta `transform: scale(0.94)`: encongia
          les fitxes un 6% i les feia diferents de les de les pagines de
          colleccio. Ara la mida surt de `tdpMidaFitxa`, que es l'unica font de
          veritat, i el bloc no ha d'encongir res. */}
      <section className="bg-background text-foreground" style={{ marginTop: `calc(${isPortraitTablet ? '435px' : (isLandscapeTablet ? '40px' : '100px')} + ${baixadaHero}px)` }}>
        <div className="mx-auto max-w-[1400px] px-4 pt-[60px] pb-[174px] sm:px-6 lg:px-10" style={isTablet ? { paddingTop: '30px' } : undefined}>
            <CollectionTitle
            index=""
            kicker="Col·lecció"
            title="First Contact"
            subtitle="LA CIÈNCIA FICCIÓ QUE MIRA ENDINS"
            align="center"
            titleTextAlign="center"
            numberAlign="left"
            titleOffsetX={0}
            titleOffsetY={5}
            numberOffsetX={-36}
            numberOffsetY={-4}
            subtitleOffsetX={0}
            subtitleOffsetY={0}
            collectionHref="/first-contact"
          />
          <div style={{ marginTop: isTablet ? `${HOME_TITOL_TDP_MARGIN_PX.tauleta}px` : `${HOME_TITOL_TDP_MARGIN_PX.escriptori}px` }}>
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
              {/* Columna 1: TDP2 */}
              <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="first-contact" index={0} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/first-contact" editableIdPrefix="home-row1-tdp-1" gridColumn="1 / 2" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />

              {/* Columna 2: TDP1 */}
              <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="first-contact" index={1} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/first-contact" editableIdPrefix="home-row1-tdp-2" gridColumn="2 / 3" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />

              {/* Columna 3: TDP2 (Amb imatge a dalt i bloc Nom/Descripció a dota) */}
              {midaTdpHome.columnes >= 3 && <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="first-contact" index={2} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/first-contact" editableIdPrefix="home-row1-tdp-3" gridColumn="3 / 4" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />}
              {/* Columna 4 (nomes a escriptori, on la graella en te 4) */}
              {midaTdpHome.columnes > 3 && <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="first-contact" index={3} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/first-contact" editableIdPrefix="home-row1-tdp-4" gridColumn="4 / 5" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />}

              {/* Indicador de més productes (Pill amb text sota el producte de la tercera columna) */}
              <Link
                to="/first-contact"
                style={{
                  position: 'absolute',
                  left: '50%',
                  // 25 px sota la caixa de la targeta, DECLARAT: el bloc de la
                  // galeria fa l'alcada de la fitxa, i per tant `100%` es el fons de
                  // la caixa. Abans aixo era una formula amb el -231 mes una mesura
                  // des de JavaScript.
                  top: 'calc(100% + 50px)',
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
                  transform: 'translateX(-50%)',
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
            </div>
          </div>

          {/* Col·lecció 02: The Human Inside (Distància de 5 files / 190px + 15px avall - 1 fila amunt) */}
          <div style={{ marginTop: `calc(${HOME_COLLECCIO_MARGIN_PX[0]}px + ${HOME_GALERIA_AIRE_SOTA_PX}px)` }}>
            <div
              style={{
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
              }}
            >
              <CollectionTitle
                index=""
                kicker="Col·lecció"
                title="THE HUMAN INSIDE"
                subtitle="EN EL TEU RACÓ MÉS PROFUND HI HA UN HEROI"
                align="center"
                numberAlign="right"
                titleTextAlign="center"
                titleOffsetY={-1}
                numberOffsetX={1} // Mogut 4px més a l'esquerra (abans 5)
                numberOffsetY={-4}
                subtitleOffsetX={0} // Centrat en X
                subtitleOffsetY={0} // Pujat 18px (abans 18)
                collectionHref="/the-human-inside"
              />
            </div>
            <div style={{ marginTop: isTablet ? `${HOME_TITOL_TDP_MARGIN_PX.tauleta}px` : `${HOME_TITOL_TDP_MARGIN_PX.escriptori}px` }}>
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
                {/* Columna 1: TDP1 */}
                <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="the-human-inside" index={0} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/the-human-inside" editableIdPrefix="home-row2-tdp-1" gridColumn="1 / 2" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />

                {/* Columna 2: TDP2 */}
                <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="the-human-inside" index={1} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/the-human-inside" editableIdPrefix="home-row2-tdp-2" gridColumn="2 / 3" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />

                {/* Columna 3: TDP1 */}
                {midaTdpHome.columnes >= 3 && <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="the-human-inside" index={2} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/the-human-inside" editableIdPrefix="home-row2-tdp-3" gridColumn="3 / 4" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />}
                {/* Columna 4 (nomes a escriptori, on la graella en te 4) */}
                {midaTdpHome.columnes > 3 && <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="the-human-inside" index={3} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/the-human-inside" editableIdPrefix="home-row2-tdp-4" gridColumn="4 / 5" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />}

              {/* Indicador de més productes (Pill amb text sota el producte de la tercera columna) */}
              <Link
                to="/the-human-inside"
                style={{
                  position: 'absolute',
                  left: '50%',
                  // 25 px sota la caixa de la targeta, DECLARAT: el bloc de la
                  // galeria fa l'alcada de la fitxa, i per tant `100%` es el fons de
                  // la caixa. Abans aixo era una formula amb el -231 mes una mesura
                  // des de JavaScript.
                  top: 'calc(100% + 50px)',
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
                  transform: 'translateX(-50%)',
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
              </div>
            </div>
          </div>

          {/* Col·lecció 03: Austen (Distància de 5 files / 190px) */}
          <div style={{ marginTop: `calc(${HOME_COLLECCIO_MARGIN_PX[1]}px + ${HOME_GALERIA_AIRE_SOTA_PX}px)` }}>
            <div
              style={{
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
              }}
            >
              <CollectionTitle
                index=""
                kicker="Col·lecció"
                title="Austen"
                subtitle="DIGUIS EL QUE DIGUIS, FES-HO AMB ELEGÀNCIA"
                align="center"
                numberAlign="left"
                titleTextAlign="center"
                titleOffsetX={0}
                titleOffsetY={-4}
                numberOffsetX={-22} // Mogut 14px a la dreta (abans -36)
                numberOffsetY={-17}
                subtitleOffsetY={0}
                collectionHref="/austen"
              />
            </div>
            <div style={{ marginTop: isTablet ? `${HOME_TITOL_TDP_MARGIN_PX.tauleta}px` : `${HOME_TITOL_TDP_MARGIN_PX.escriptori}px` }}>
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
                {/* Columna 1: TDP2 */}
                <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="austen" index={0} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/austen" editableIdPrefix="home-row3-tdp-1" gridColumn="1 / 2" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />

                {/* Columna 2: TDP1 */}
                <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="austen" index={1} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/austen" editableIdPrefix="home-row3-tdp-2" gridColumn="2 / 3" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />

                {/* Columna 3: TDP2 */}
                {midaTdpHome.columnes >= 3 && <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="austen" index={2} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/austen" editableIdPrefix="home-row3-tdp-3" gridColumn="3 / 4" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />}
                {/* Columna 4 (nomes a escriptori, on la graella en te 4) */}
                {midaTdpHome.columnes > 3 && <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="austen" index={3} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/austen" editableIdPrefix="home-row3-tdp-4" gridColumn="4 / 5" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />}

              {/* Indicador de més productes (Pill amb text sota el producte de la tercera columna) */}
              <Link
                to="/austen"
                style={{
                  position: 'absolute',
                  left: '50%',
                  // 25 px sota la caixa de la targeta, DECLARAT: el bloc de la
                  // galeria fa l'alcada de la fitxa, i per tant `100%` es el fons de
                  // la caixa. Abans aixo era una formula amb el -231 mes una mesura
                  // des de JavaScript.
                  top: 'calc(100% + 50px)',
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
                  transform: 'translateX(-50%)',
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
              </div>
            </div>
          </div>

          {/* Col·lecció 04: Cube (Distància de 5 files / 190px - 1 fila amunt) */}
          <div style={{ marginTop: `calc(${HOME_COLLECCIO_MARGIN_PX[2]}px + ${HOME_GALERIA_AIRE_SOTA_PX}px)` }}>
            <div
              style={{
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
              }}
            >
              <CollectionTitle
                index=""
                kicker="Col·lecció"
                title="Cube"
                subtitle="TOTS SOM ESTRANYS A ULLS NOSTRES"
                align="center"
                numberAlign="right"
                titleTextAlign="center"
                titleOffsetX={0}
                titleOffsetY={13}
                numberOffsetX={19} // Mogut 4px més a l'esquerra (abans 23)
                numberOffsetY={0}
                subtitleOffsetY={1}
                collectionHref="/cube"
              />
            </div>
            <div style={{ marginTop: isTablet ? `${HOME_TITOL_TDP_MARGIN_PX.tauleta}px` : `${HOME_TITOL_TDP_MARGIN_PX.escriptori}px` }}>
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
                {/* Columna 1: TDP1 */}
                <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="cube" index={0} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/cube" editableIdPrefix="home-row4-tdp-1" gridColumn="1 / 2" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />

                {/* Columna 2: TDP2 */}
                <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="cube" index={1} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/cube" editableIdPrefix="home-row4-tdp-2" gridColumn="2 / 3" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />

                {/* Columna 3: TDP1 */}
                {midaTdpHome.columnes >= 3 && <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="cube" index={2} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/cube" editableIdPrefix="home-row4-tdp-3" gridColumn="3 / 4" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />}
                {/* Columna 4 (nomes a escriptori, on la graella en te 4) */}
                {midaTdpHome.columnes > 3 && <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="cube" index={3} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/cube" editableIdPrefix="home-row4-tdp-4" gridColumn="4 / 5" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />}

              {/* Indicador de més productes (Pill amb text sota el producte de la tercera columna) */}
              <Link
                to="/cube"
                style={{
                  position: 'absolute',
                  left: '50%',
                  // 25 px sota la caixa de la targeta, DECLARAT: el bloc de la
                  // galeria fa l'alcada de la fitxa, i per tant `100%` es el fons de
                  // la caixa. Abans aixo era una formula amb el -231 mes una mesura
                  // des de JavaScript.
                  top: 'calc(100% + 50px)',
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
                  transform: 'translateX(-50%)',
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
              </div>
            </div>
          </div>

          {/* Col·lecció 05: MISC (Distància de 5 files / 190px - 1 fila amunt + 20px avall) */}
          <div style={{ marginTop: `calc(${HOME_COLLECCIO_MARGIN_PX[3]}px + ${HOME_GALERIA_AIRE_SOTA_PX}px)`, position: 'relative', zIndex: 30 }}>
            <div
              style={{
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
              }}
            >
              <CollectionTitle
                index=""
                kicker="Col·lecció"
                title="MISCEL·LÀNIA"
                subtitle="MÉS VAL SOL QUE MAL ACOMPANYAT"
                align="center"
                numberAlign="left"
                titleTextAlign="center"
                titleOffsetX={0}
                titleOffsetY={9}
                numberOffsetX={-22} // Mogut 14px a la dreta (abans -36)
                numberOffsetY={-4}
                subtitleOffsetY={1}
                collectionHref="/miscellania"
              />
            </div>
            <div style={{ marginTop: isTablet ? `${HOME_TITOL_TDP_MARGIN_PX.tauleta}px` : `${HOME_TITOL_TDP_MARGIN_PX.escriptori}px` }}>
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
                {/* Columna 1: TDP2 */}
                <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="miscellania" index={0} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/miscellania" editableIdPrefix="home-row5-tdp-1" gridColumn="1 / 2" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />

                {/* Columna 2: TDP1 */}
                <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="miscellania" index={1} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/miscellania" editableIdPrefix="home-row5-tdp-2" gridColumn="2 / 3" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />

                {/* Columna 3: TDP2 */}
                {midaTdpHome.columnes >= 3 && <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="miscellania" index={2} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/miscellania" editableIdPrefix="home-row5-tdp-3" gridColumn="3 / 4" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />}
                {/* Columna 4 (nomes a escriptori, on la graella en te 4) */}
                {midaTdpHome.columnes > 3 && <HomeTdpCard Component={TableCardA} backgroundSrc={COLLECTION_BG_SRC} midesFitxa={midesFitxaHome} slug="miscellania" index={3} cardPropsFn={cardProps} portraitTablet={isPortraitTablet} collectionHref="/miscellania" editableIdPrefix="home-row5-tdp-4" gridColumn="4 / 5" style={{ width: '100%', alignSelf: 'start', boxSizing: 'border-box' }} />}

              {/* Indicador de més productes (Pill amb text sota el producte de la tercera columna) */}
              <Link
                to="/miscellania"
                style={{
                  position: 'absolute',
                  left: '50%',
                  // 25 px sota la caixa de la targeta, DECLARAT: el bloc de la
                  // galeria fa l'alcada de la fitxa, i per tant `100%` es el fons de
                  // la caixa. Abans aixo era una formula amb el -231 mes una mesura
                  // des de JavaScript.
                  top: 'calc(100% + 50px)',
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
                  transform: 'translateX(-50%)',
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
              </div>
            </div>
          </div>

          {/* Bloc Copiat des de /pdp (fila 20 a 62) posicionat a la fila global 215 en endavant (Mogut 19 files amunt i 20px més amunt) */}
          <div style={{ marginTop: isPortraitTablet ? '-309px' : '-552px' }}>
            <Pauta4ColsOverlay
              pautaEnabled={false}
              tableEnabled={false}
              numCols={4}
              numRows={53}
              canvasAspect={[2642, 3950]}
              topOffset="0px"
              bottomPadding="0px"
              innerRef={pautaGridRef}
              style={{ position: 'relative' }}
            >
              {/* TEXT POSTER GRAN (Fila local 27 / 33 - correspon a global 227 / 233) */}
              <div
                style={{
                  gridColumn: '1 / 5',
                  gridRow: '27 / 33',
                  paddingTop: '50px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'auto',
                }}
              >
                <StoryPosterLink style={isPortraitTablet ? { fontSize: '54pt' } : undefined} />
              </div>
            </Pauta4ColsOverlay>
            {isPortraitTablet && <div style={{ height: '97px' }} />}
          </div>
        </div>
      </section>
        </>
      )}
    </>
  );
}

export default Home;
