import { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import { useCollectionCardLayout } from '@/hooks/useCollectionCardLayout';
import { collectionGridImageFor, gridFinishFor, collectionGridHoverVariantsFor } from '@/lib/pdpMockup';
import HeroSlider from '@/components/HeroSlider';
import CollectionProductCard from '@/components/tdp/CollectionProductCard';
import CollectionProductCardV5 from '@/components/tdp/CollectionProductCardV5';
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

// Alcada de la franja blanca de la hero.
const BAND_HEIGHT = 'clamp(120px, 26vh, 260px)';

const HERO_BACKGROUND_SRC = '/placeholders/hero/placeholder-noia.jpg';
const TDP_MOVE_PX = 0;

// Separació entre la hero i la primera fila de fitxes, per orientació.
// A la tauleta vertical les fitxes començaven enganxades a la vora de la hero.
// A la tauleta horitzontal NO s'hi aplica res: allà ja hi havia prou aire.
const HERO_TDP_GAP_PX = '-41px';
const HERO_TDP_GAP_TABLET_PX = '338px';
// La tauleta horitzontal es mes curta: la graella ja hi te menys recorregut,
// aixi que el valor ha de ser diferent per donar la mateixa distancia.
const HERO_TDP_GAP_LANDSCAPE_PX = '-240px';

const COLLECTION_BG_SRC = '/placeholders/tots_els_fons/fons_colleccio/00-colleccio.webp';

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

const tdpImage = (color) =>
  `/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_${color}_gpr-4-0_front.webp`;

// 14 colors canònics (ordre extret de FullWideSlideHeader.jsx).
// Repetits cíclicament fins a omplir les 16 cel·les del 4x4.
const TDP_GRID_COLORS = [
  ['white',        'light-blue',     'royal',         'purple'],
  ['navy',         'daisy',          'gold',          'light-pink'],
  ['red',          'kiwi',           'irish-green',   'military-green'],
  ['forest-green', 'black',          'white',         'light-blue'],
];

// Rutes de les PDP de producte de MISCEL·LÀNIA, en ordre.
// S'assignen a les 16 cel·les de la graella de forma cíclica.
const COLLECTION_SLUG = 'miscellania';
const PRODUCTS = [
  { route: 'pont-del-diable', name: 'PONT DEL DIABLE' },
  { route: 'dj-vader', name: 'DJ VADER' },
  { route: 'death-star2d2', name: 'DEATH STAR2D2' },
  { route: 'arthur-d-the-second', name: 'ARTHUR D THE SECOND' },
  { route: 'r2d2-quote', name: 'R2D2 QUOTE' },
];
const productAt = (rowIdx, colIdx) => PRODUCTS[(rowIdx * 4 + colIdx) % PRODUCTS.length];
const productHref = (rowIdx, colIdx) => `/${COLLECTION_SLUG}/${productAt(rowIdx, colIdx).route}`;

function colorToProductName(color) {
  const map = {
    'white': 'White',
    'light-blue': 'Light Blue',
    'royal': 'Royal',
    'navy': 'Navy',
    'purple': 'Purple',
    'light-pink': 'Light Pink',
    'daisy': 'Daisy',
    'gold': 'Gold',
    'red': 'Red',
    'kiwi': 'Kiwi',
    'irish-green': 'Irish Green',
    'military-green': 'Military Green',
    'forest-green': 'Forest Green',
    'black': 'Black',
  };
  return map[color] || color;
}
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
    id: 'miscellania',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_forest-green_gpr-4-0_front.webp',
    imageAlt: 'Samarreta de la col·lecció Miscel·lània',
    kicker: 'Miscel·lània',
    headline: 'Per a qui tria el seu propi camí.',
    primaryCta: { label: 'Compra', href: '/miscellania' },
    secondaryCta: { label: 'Descobreix', href: '/miscellania' },
  },
];

const OVERLAY_STATE_STORAGE_KEY = 'hg.constructorColleccioCopy6.overlayOpacity.v1';

const DEFAULT_OVERLAY_STATE = {
  pautaOpacity: 1,
  tableOpacity: 1,
  backgroundOpacity: 1,
};

function loadOverlayState() {
  try {
    const raw = window.localStorage.getItem(OVERLAY_STATE_STORAGE_KEY);
    if (!raw) return DEFAULT_OVERLAY_STATE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_OVERLAY_STATE, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return DEFAULT_OVERLAY_STATE;
  }
}

function CollectionMiscellaniaPage() {
  const isMobile = useIsMobile();
  const [overlayState, setOverlayState] = useState(loadOverlayState);
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
  // Les icones conserven EXACTAMENT la posicio de pantalla que tenien (la
  // formula `innerHeight - alçada/2 - heroTop` d'abans, ara escrita amb
  // `calc()`), independentment de l'alçada real de les icones.
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
  // Quan la imatge (alcada de finestra) sobrepassa l'espai que la graella li
  // reserva, baixem el contingut el mateix tros perque no se solapi.
  // Quan la imatge (alçada de finestra) sobrepassa l'espai que la graella li
  // reserva, baixem el contingut el mateix tros perque no se solapi. No es pot
  // calcular: depen de l'alçada de la finestra i de la posicio natural de la
  // graella (files fixes amb pitch variable). Es mesura en un `useLayoutEffect`
  // (ABANS del pintat) i es publica com a variable CSS, aixi no cal ni cap
  // re-render ni cap bucle de punt fix ni cap `setTimeout`.
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(esTauletaApaisada());
  const [isPortraitTablet, setIsPortraitTablet] = useState(
    typeof window !== "undefined"
      && window.innerWidth >= 768
      && window.innerWidth <= 1024
      && window.innerHeight > window.innerWidth
  );
  const pautaGridRef = useRef(null);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const { pautaOpacity, tableOpacity, backgroundOpacity } = overlayState;
  const otherImages = useMemo(() => buildOtherCollectionsImages('miscellania'), []);
  const getCardLayout = useCollectionCardLayout({ isPortraitTablet, isLandscapeTablet });

  useEffect(() => {
    try {
      window.localStorage.setItem(OVERLAY_STATE_STORAGE_KEY, JSON.stringify(overlayState));
    } catch {
      // ignore
    }
  }, [overlayState]);

  // Alinea el breadcrumb amb el left del logo GRAFC del header: el seu
  // contenidor (la graella) comença mes a l'esquerra, i aquesta diferencia es
  // l'offset. A tauleta el clamp la deixa a 0; a escriptori val 38 / 47,5 px.
  //
  // El logo i la graella arriben amb el chunk de la capcalera, mes tard que el
  // primer pintat, aixi que no n'hi ha prou de mesurar un cop: un
  // MutationObserver espera que aparegui la graella (abans hi havia un bucle de
  // requestAnimationFrame que reintentava indefinidament). Quan apareix es
  // mesura, i el resize cobreix els canvis d'amplada.
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
      // La franja de dalt, la de baix i les icones en pengen amb `calc()`
      // (vegeu més amunt).
      const heroTop = Math.round(hero.getBoundingClientRect().top);
      document.documentElement.style.setProperty('--hg-hero-top', `${heroTop}px`);
      const cap = document.querySelector('header');
      if (cap) {
        const headerBottom = Math.round(cap.getBoundingClientRect().bottom);
        document.documentElement.style.setProperty('--hg-header-bottom', `${headerBottom}px`);
      }
      // La imatge acaba exactament on acaba la franja blanca de baix: baixem
      // la graella el que calgui perque la primera targeta quedi SEMPRE per
      // sota. El calcul és el MATEIX d'abans, pero sobre la posicio base del
      // primer intent (quan el desplaçament encara es 0), sense bucle de punt
      // fix: aplicar-lo canvia el top de la TDP exactament el mateix que el
      // desplaçament, aixi que el resultat no depen de quantes vegades es faci.
      const tdp0 = document.querySelector('[aria-label="TDP taula"]') || document.querySelector('[aria-label="TDP rectangle"]');
      if (tdp0) {
        const pushDown = Math.max(0, Math.round(hero.getBoundingClientRect().bottom + 24 - tdp0.getBoundingClientRect().top));
        document.documentElement.style.setProperty('--hg-push-down', `${pushDown}px`);
      }
    };
    mesura();
    // El carril nomes depen de l'amplada de la finestra: es recalcula en
    // resize perque `rowHeight` (i el `top` de la hero) no es quedin
    // congelats al valor del primer render. Abans d'A1 tambe es recalculava.
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
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="bg-background">
      <Helmet>
        <title>Miscel·lània · Constructor | Higgins Gràfic</title>
        <meta
          name="description"
          content="Plantilla de construcció de col·lecció amb header global, pauta de 4 columnes i footers globals."
        />
      </Helmet>

      {isMobile ? (
        <CollectionMobile
          collectionSlug="miscellania"
          collectionTitle="Miscel·lània"
          collectionIcon="/custom_logos/collections/collection-miscellania-logo.svg"
          products={PRODUCTS}
          colors={TDP_GRID_COLORS}
          posterLines={[{ text: 'MÉS VAL SOL' }, { text: 'QUE MAL' }, { text: 'ACOMPANYAT' }]}
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
          <Breadcrumbs items={[{ label: 'Miscel·lània' }]} />
        </div>
        )}

        {/* Hero de la colleccio: 1) imatge de fons a pantalla completa
            (un dia sera una animacio), 2) franja blanca al 50% enmig,
            3) icona i nom de la colleccio sobre la franja. Les icones de
            colleccio van a sota. */}
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
            // La imatge acaba just on acaba la franja blanca de baix.
            // Alcada CSS pura: del sostre de la capcalera al fons de la
            // finestra. Abans es mesurava amb JS (innerHeight - heroTop) i la
            // hero canviava de mida en dos o tres passos, i ho movia tot.
            height: 'calc(100vh - var(--appHeaderOffset, 62px))',
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
                  src="/custom_logos/collections/collection-miscellania-logo.svg"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  style={{
                    height: '0.75em',
                    width: 'auto',
                    objectFit: 'contain',
                    display: 'inline-block',
                    flexShrink: 0,
                    transform: 'translateY(5px)',
                  }}
                />
                <span>MISCEL·LÀNIA</span>
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
        numRows={90}
        canvasAspect={[2642, (isPortraitTablet || isLandscapeTablet) ? 9717 : 6708]}
        topOffset="0px"
        bottomPadding="0px"
        style={{
          // Puja tot el contingut sota el hero 12 files de la taula (41 → 29).
          // Alçada d'1 fila = ampladaBelt × 6708/2642/90; 12 files ≈ 0.3385 × amplada.
          marginTop: `calc((var(--hg-tdp-xL, 0px) - var(--hg-tdp-xR, 0px)) * 0.3385${isLandscapeTablet ? ' - 30px' : ''}${isPortraitTablet ? ' - 120px' : ''} + var(--hg-push-down, 0px)${isLandscapeTablet ? ` + ${HERO_TDP_GAP_LANDSCAPE_PX}` : (isPortraitTablet ? ` + ${HERO_TDP_GAP_TABLET_PX}` : ` + ${HERO_TDP_GAP_PX}`)})`,
          // Desplaçament vertical NOME S de les TDP.
          translate: `0 ${-TDP_MOVE_PX}px`,
          // El bloc te marge negatiu i queda per sobre de la hero: si no fos
          // transparent als clics, s'empassaria els de les icones de colleccio.
          pointerEvents: 'none',
        }}
      >
        {/* El fons de la pagina es BLANC: el degradat va a cada fitxa. */}
        {[0, 1, 2, 3].flatMap((rowIdx) =>
          ((isPortraitTablet || isLandscapeTablet) ? [0, 1, 2] : [0, 1, 2, 3]).map((colIdx) => {
            const color = TDP_GRID_COLORS[rowIdx][colIdx];
            if (!color) return null;
            const Card = CollectionTableCard;
            const variantB = (rowIdx + colIdx) % 2 === 1;
            const col = colIdx + 1;
            const rowOffset = 10 + rowIdx * 13;
            const productName = productAt(rowIdx, colIdx).name;
            const { imageTranslateY, productNameTranslateY, descriptionTranslateY } = getCardLayout(colIdx);
            return (
              <CollectionTdpCard
                key={`tdp-card-r${rowIdx}-c${colIdx}`}
                Component={Card}
                gridColumn={`${col} / ${col + 1}`}
                gridRow={`${6 + rowOffset} / ${17 + rowOffset}`}
                variantB={variantB}
                backgroundSrc={COLLECTION_BG_SRC}
                rowOffset={rowOffset}
                productName={productName}
                description=""
                price={SELLING_PRICE_LABEL}
                imageSrc={collectionGridImageFor('miscellania', productAt(rowIdx, colIdx).route, color, rowIdx * 4 + colIdx)}
                hoverImages={collectionGridHoverVariantsFor('miscellania', productAt(rowIdx, colIdx).route, color, rowIdx * 4 + colIdx)}
                imageAlt={`Samarreta Gildan 64000 ${color}`}
                sizes={sizes}
                cartCount={0}
                onAddToCart={(size) => {
                  window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
                    detail: { source: 'collection-tdp-cta', firstPartOnly: true, item: { title: productName.toUpperCase(), collection: 'MISCEL·LÀNIA', collectionSlug: 'miscellania', productRoute: productAt(rowIdx, colIdx).route, qty: 1, size, price: SELLING_PRICE_LABEL, color, finish: gridFinishFor('miscellania', color, rowIdx * 4 + colIdx), drawing: '', disabled: false } },
                  }));
                }}
                editableIdPrefix="constructor-colleccio-copy6-tdp-col2"
                presetVersion="constructor-colleccio-copy6-tdp-cart-34-v9"
                collectionHref={`${productHref(rowIdx, colIdx)}?color=${color}&finish=${gridFinishFor('miscellania', color, rowIdx * 4 + colIdx)}`}
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
        posterLines={[{ text: 'MÉS VAL SOL' }, { text: 'QUE MAL' }, { text: 'ACOMPANYAT' }]}
        tambeImages={otherImages}
        marginTop={isPortraitTablet ? '-1341px' : '-1543px'}
        visibleCards={(isPortraitTablet || isLandscapeTablet) ? 3 : 4}
      />
        </>
      )}
    </section>
  );
}

export default CollectionMiscellaniaPage;
