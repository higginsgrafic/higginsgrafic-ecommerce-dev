import { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import { useCollectionCardLayout } from '@/hooks/useCollectionCardLayout';
import { collectionGridImageFor, gridFinishFor, collectionGridHoverVariantsFor } from '@/lib/pdpMockup';
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
// Rutes de les PDP de producte de CUBE, en ordre.
// S'assignen a les 16 cel·les de la graella de forma cíclica.
const COLLECTION_SLUG = 'cube';
const PRODUCTS = [
  { route: 'afrodita-c', name: 'AFRODITA-C' },
  { route: 'mazinger-c', name: 'MAZINGER-C' },
  { route: 'ironman-68', name: 'IRON CUBE 68' },
  { route: 'ironkong', name: 'IRON CUBE 08' },
  { route: 'robocube', name: 'ROBOCUBE' },
  { route: 'cylon-cube', name: 'CYLON CUBE' },
  { route: 'maschinencube', name: 'MASCHINENCUBE' },
  { route: 'darth-cube', name: 'DARTH CUBE' },
  { route: '3cube-p0', name: '3CUBE-P0' },
  { route: 'cybercube', name: 'CYBERCUBE' },
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


// Alcada de la franja blanca de la hero.
const BAND_HEIGHT = 'clamp(120px, 26vh, 260px)';

// Desplaçament vertical de les TDP, només elles.
//
// ERA 120 (i el bloc pujava amb `translate: 0 -120px`): les primeres fitxes
// quedaven dins la zona de la hero. Ara és 0.
const TDP_MOVE_PX = 0;

// Separació entre la hero i la primera fila de fitxes, per orientació.
// A la tauleta vertical les fitxes començaven enganxades a la vora de la hero.
// A la tauleta horitzontal NO s'hi aplica res: allà ja hi havia prou aire.
const HERO_TDP_GAP_PX = '-41px';
const HERO_TDP_GAP_TABLET_PX = '338px';
// La tauleta horitzontal es mes curta: la graella ja hi te menys recorregut,
// aixi que el valor ha de ser diferent per donar la mateixa distancia.
const HERO_TDP_GAP_LANDSCAPE_PX = '-240px';

// Imatge de fons de la hero (de moment un placeholder; un dia sera una animacio).
const HERO_BACKGROUND_SRC = '/placeholders/hero/placeholder-noia.jpg';

const OVERLAY_STATE_STORAGE_KEY = 'hg.constructorColleccioCopy5.overlayOpacity.v1';

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

function CollectionCubePage() {
  const isMobile = useIsMobile();
  const [overlayState, setOverlayState] = useState(loadOverlayState);
  const [zeroLeftOffsetPx, setZeroLeftOffsetPx] = useState(0);
  const [rowHeight, setRowHeight] = useState(38);
  // La franja blanca ha de tocar el separador del header sense quedar-s'hi a
  // sota. Com que la hero no comenca exactament al separador, mesurem on acaba
  // el header i on comenca la hero, i hi posem la franja just al mig.
  const heroRef = useRef(null);
  const bandRef = useRef(null);
  const [heroBandTopPx, setHeroBandTopPx] = useState(0);
  const [heroIconsTopPx, setHeroIconsTopPx] = useState(null);
  const [heroBottomBandTopPx, setHeroBottomBandTopPx] = useState(null);
  const [heroHeightPx, setHeroHeightPx] = useState(null);
  // Quan la imatge (alcada de finestra) sobrepassa l'espai que la graella li
  // reserva, baixem el contingut el mateix tros perque no se solapi.
  const [pushDownPx, setPushDownPx] = useState(0);
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(
    typeof window !== "undefined"
      && window.innerWidth >= 1024
      && window.innerWidth <= 1366
      && window.innerHeight < window.innerWidth
  );
  const [isPortraitTablet, setIsPortraitTablet] = useState(
    typeof window !== "undefined"
      && window.innerWidth >= 768
      && window.innerWidth <= 1024
      && window.innerHeight > window.innerWidth
  );
  const pautaGridRef = useRef(null);
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const { pautaOpacity, tableOpacity, backgroundOpacity } = overlayState;
  const otherImages = useMemo(() => buildOtherCollectionsImages('cube'), []);
  const getCardLayout = useCollectionCardLayout({ isPortraitTablet, isLandscapeTablet });

  useEffect(() => {
    try {
      window.localStorage.setItem(OVERLAY_STATE_STORAGE_KEY, JSON.stringify(overlayState));
    } catch {
      // ignore
    }
  }, [overlayState]);

  // Alinea el "00" amb el left del logo GRAFC del header.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let raf = 0;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      setIsLandscapeTablet(
        window.innerWidth >= 1024
          && window.innerWidth <= 1366
          && window.innerHeight < window.innerWidth
      );
      setIsPortraitTablet(
        window.innerWidth >= 768
          && window.innerWidth <= 1024
          && window.innerHeight > window.innerWidth
      );
      const logo = document.querySelector('[data-brand-logo="1"]')
        || document.getElementById('stripe-guide-header-logo-anchor');
      const grid = document.querySelector('[data-pauta-grid]');
      if (!logo || !grid) {
        raf = requestAnimationFrame(measure);
        return;
      }
      const logoRect = logo.getBoundingClientRect();
      const gridRect = grid.getBoundingClientRect();
      const offset = Math.max(0, logoRect.left - gridRect.left);
      setZeroLeftOffsetPx((prev) => (Math.abs(prev - offset) < 0.5 ? prev : offset));

      const numRows = 24;
      const rowGap = 3;
      const singleRowH = (gridRect.height - (numRows - 1) * rowGap) / numRows;
      setRowHeight((prev) => (Math.abs(prev - singleRowH) < 0.1 ? prev : singleRowH));
    };
    measure();
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, { passive: true });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize);
    };
  }, []);

  useLayoutEffect(() => {
    const mesura = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const cap = document.querySelector('header');
      const headerBottom = cap ? cap.getBoundingClientRect().bottom : 0;
      const heroTop = hero.getBoundingClientRect().top;
      setHeroBandTopPx(Math.max(0, Math.round(headerBottom - heroTop)));
      // Les icones es queden a la MATEIXA posicio de pantalla que tenien
      // (centrades on era la franja blanca de sota), encara que la imatge
      // torni a omplir tota l'alcada.
      const band = bandRef.current;
      const bandH = band ? band.getBoundingClientRect().height : 0;
      setHeroIconsTopPx(Math.round(window.innerHeight - bandH / 2 - heroTop));
      // Franja blanca de baix, on abans hi havia el retall.
      setHeroBottomBandTopPx(Math.round(window.innerHeight - bandH - heroTop));
      // La imatge acaba exactament on acaba la franja blanca de baix.
      setHeroHeightPx(Math.round(window.innerHeight - heroTop));
      // Baixem el contingut el que calgui perque la primera targeta quedi
      // SEMPRE per sota de la imatge. Ho calculem sobre la posicio "base"
      // (sense el desplaçament ja aplicat) per no entrar en bucle.
      const heroBottom = hero.getBoundingClientRect().bottom;
      const tdp0 = document.querySelector('[aria-label="TDP taula"]') || document.querySelector('[aria-label="TDP rectangle"]');
      if (tdp0) {
        const topActual = tdp0.getBoundingClientRect().top;
        setPushDownPx((prev) => {
          const base = topActual - prev;
          const cal = Math.max(0, Math.round(heroBottom + 24 - base));
          return Math.abs(cal - prev) < 1 ? prev : cal;
        });
      }
    };
    mesura();
    window.addEventListener('resize', mesura);
    const t = window.setTimeout(mesura, 300);
    return () => {
      window.removeEventListener('resize', mesura);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <section className="bg-background">
      <Helmet>
        <title>Cube · Constructor | Higgins Gràfic</title>
        <meta
          name="description"
          content="Plantilla de construcció de col·lecció amb header global, pauta de 4 columnes i footers globals."
        />
      </Helmet>

      {isMobile ? (
        <CollectionMobile
          collectionSlug="cube"
          collectionTitle="Cube"
          collectionIcon="/custom_logos/collections/collection-cube-logo.svg"
          products={PRODUCTS}
          colors={TDP_GRID_COLORS}
          posterLines={[{ text: 'CADA' }, { text: 'DIBUIX TÉ' }, { text: 'UNA MIRADA' }]}
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
          <Breadcrumbs items={[{ label: 'Cube' }]} />
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
            height: heroHeightPx != null ? `${heroHeightPx}px` : `calc(100vh - 62px)`,
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
            ref={bandRef}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              // Just sota el separador del header (mesurat).
              top: `${heroBandTopPx}px`,
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
              top: `${heroBandTopPx}px`,
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
                src="/custom_logos/collections/collection-cube-logo.svg"
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
              <span>CUBE</span>
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
              top: heroBottomBandTopPx != null ? `${heroBottomBandTopPx}px` : `calc(100vh - ${BAND_HEIGHT} - 62px)`,
              height: BAND_HEIGHT,
              background: 'rgba(255, 255, 255, 0.8)',
              pointerEvents: 'none',
            }}
          />

          {/* Icones de colleccio: FORA de la imatge, a la part blanca de sota */}
          <div
            style={{
              position: 'absolute',
              // Mateixa posicio de pantalla que abans (centrades on era la
              // franja blanca de sota).
              top: heroIconsTopPx != null ? `${heroIconsTopPx}px` : `calc(100vh - (${BAND_HEIGHT}) / 2)`,
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
          marginTop: `calc((var(--hg-tdp-xL, 0px) - var(--hg-tdp-xR, 0px)) * 0.3385 + ${pushDownPx}px${isLandscapeTablet ? ' - 30px' : ''}${isPortraitTablet ? ' - 120px' : ''}${isLandscapeTablet ? ` + ${HERO_TDP_GAP_LANDSCAPE_PX}` : (isPortraitTablet ? ` + ${HERO_TDP_GAP_TABLET_PX}` : ` + ${HERO_TDP_GAP_PX}`)})`,
          // Desplaçament vertical NOME S de les TDP. Va amb `translate` (no
          // `transform`) perque la graella ja fa servir transform per centrar-se
          // i `translate` s'hi suma sense trepitjar-lo.
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
            const col = colIdx + 1;
            // La fitxa de taula es unica, aixi que totes les targetes queden
            // iguals (abans s'alternaven la normal i la V5).
            const Card = CollectionTableCard;
            const variantB = (rowIdx + colIdx) % 2 === 1;
            // Files de 11 espais + 2 de separacio (abans n'hi havia 4): el gap
            // entre files de fitxes queda a la meitat.
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
                imageSrc={collectionGridImageFor('cube', productAt(rowIdx, colIdx).route, color, rowIdx * 4 + colIdx)}
                hoverImages={collectionGridHoverVariantsFor('cube', productAt(rowIdx, colIdx).route, color, rowIdx * 4 + colIdx)}
                imageAlt={`Samarreta Gildan 64000 ${color}`}
                sizes={sizes}
                cartCount={0}
                onAddToCart={(size) => {
                  window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
                    detail: { source: 'collection-tdp-cta', firstPartOnly: true, item: { title: productName.toUpperCase(), collection: 'CUBE', collectionSlug: 'cube', productRoute: productAt(rowIdx, colIdx).route, qty: 1, size, price: SELLING_PRICE_LABEL, color, finish: gridFinishFor('cube', color, rowIdx * 4 + colIdx), drawing: '', disabled: false } },
                  }));
                }}
                editableIdPrefix="constructor-colleccio-copy5-tdp-col2"
                presetVersion="constructor-colleccio-copy5-tdp-cart-34-v9"
                collectionHref={`${productHref(rowIdx, colIdx)}?color=${color}&finish=${gridFinishFor('cube', color, rowIdx * 4 + colIdx)}`}
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
        posterLines={[{ text: 'CADA' }, { text: 'DIBUIX TÉ' }, { text: 'UNA MIRADA' }]}
        tambeImages={otherImages}
        // El 75% de l'aire que hi havia entre l'ultima fitxa i la frase
        // "CADA DIBUIX TE UNA MIRADA" ja no hi es (abans -552 / -350).
        marginTop={isPortraitTablet ? '-1341px' : '-1543px'}
        visibleCards={(isPortraitTablet || isLandscapeTablet) ? 3 : 4}
      />
        </>
      )}
    </section>
  );
}

export default CollectionCubePage;
