import { useState, useLayoutEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import NikeHeroSlider from '@/components/NikeHeroSlider';
import TDP1 from '@/components/tdp/TDP1';
import TDP2 from '@/components/tdp/TDP2';
import EditableTextBox from '@/components/dev/EditableTextBox';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import Breadcrumbs from '@/components/Breadcrumbs';
import TramFinal from '@/components/home/TramFinal';
import TambeRail from '@/pages/nikeTambe/TambeRail';
import CarouselArrows from '@/pages/nikeTambe/CarouselArrows';

const HERO_SLIDES = [
  {
    id: 'first-contact',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_royal_gpr-4-0_front.png',
    imageAlt: 'Samarreta de la col·lecció First Contact',
    kicker: 'First Contact',
    headline: 'Ciència-ficció per mirar cap a les estrelles.',
    primaryCta: { label: 'Compra', href: '/first-contact' },
    secondaryCta: { label: 'Descobreix', href: '/first-contact' },
  },
  {
    id: 'the-human-inside',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png',
    imageAlt: 'Samarreta de la col·lecció The Human Inside',
    kicker: 'The Human Inside',
    headline: 'Robots, identitat i preguntes incòmodes.',
    primaryCta: { label: 'Compra', href: '/thin' },
    secondaryCta: { label: 'Descobreix', href: '/thin' },
  },
  {
    id: 'miscellania',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_forest-green_gpr-4-0_front.png',
    imageAlt: 'Samarreta de la col·lecció Miscel·lània',
    kicker: 'Miscel·lània',
    headline: 'Per a qui tria el seu propi camí.',
    primaryCta: { label: 'Compra', href: '/miscellania' },
    secondaryCta: { label: 'Descobreix', href: '/miscellania' },
  },
];

function CollectionTitle({ index, kicker, title, subtitle, align = 'left', numberAlign, titleOffsetX = 0, titleOffsetY = 0, numberOffsetX = -20, numberOffsetY = 0, numberTopPercent = 50, subtitleOffsetX = 0, subtitleOffsetY = 0, titleTextAlign }) {
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
          className="relative font-black uppercase leading-[0.85] tracking-[-0.02em] text-foreground"
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: 'clamp(4.572rem, 15.24vw, 13.208rem)',
            width: '100%',
            textAlign: titleTextAlign || (isRight ? 'right' : 'left'),
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute hidden select-none font-black leading-none tracking-tighter text-foreground/[0.06] sm:block"
            style={ghostStyle}
          >
            {index}
          </span>
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

function HomeClean() {
  const [selectedSize, setSelectedSize] = useState('M');
  const pautaGridRef = useRef(null);
  const [rowHeight, setRowHeight] = useState(38);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const measure = () => {
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

  return (
    <>
      <Helmet>
        <title>HIGGINS GRÀFIC — Inici</title>
        <meta
          name="description"
          content="Samarretes gràfiques d'autor, roba unisex i col·leccions pròpies produïdes sota demanda."
        />
      </Helmet>

      <Pauta4ColsOverlay
        pautaEnabled={false}
        tableEnabled={false}
        numCols={3}
        numRows={24}
        canvasAspect={[2642, 1780]}
        topOffset="76px"
        bottomPadding="0px"
      >
        {/* Breadcrumbs (fila 2 / 3) */}
        <div
          style={{
            gridColumn: '1 / 4',
            gridRow: '2 / 3',
            alignSelf: 'start',
            transform: 'translateY(-86px)', // -10 original -76 per revertir el moviment del topOffset
          }}
        >
          <Breadcrumbs
            items={[
              { label: 'Col·leccions', link: '/first-contact' },
              { label: 'POD' },
            ]}
          />
        </div>

        {/* Títol HIGGINS GRÀFIC editable i centrat com a la captura (fila 3 / 8) */}
        <div
          style={{
            gridColumn: '1 / 4',
            gridRow: '3 / 8',
            alignSelf: 'center',
            position: 'relative',
            zIndex: 10,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            transform: 'translateY(-38px)', // Pujat 1 fila
          }}
        >
          <EditableTextBox
            id="home-store-name-v1"
            initialText="HIGGINS GRÀFIC"
            initialSettings={{
              x: 0,
              y: 0,
              fontFamily: 'Oswald',
              fontSize: 24, // pt
              fontWeight: 700,
              selectedFontWeight: 700,
              letterSpacing: 0.8, // em
              lineHeight: 1,
              textAlign: 'center',
              verticalAlign: 'center',
              color: '#000000',
              textTransform: 'uppercase',
            }}
            presetVersion="tdp-home-v4-clean"
            renderHandle={true}
            handleRight="-18px"
            style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
          />
        </div>

        {/* Hero Slider Carrussel (fila 10 / 25 — amplada total de col 1 a col 5) */}
        <div
          style={{
            gridColumn: '1 / 4',
            gridRow: '10 / 25',
            position: 'relative',
            top: '1px',
            width: 'calc(100% + 1px)',
            height: 'calc(100% + 2px)',
          }}
        >
          <NikeHeroSlider
            slides={HERO_SLIDES}
            autoplay
            autoplayIntervalMs={8000}
            className="h-full"
            flush
          />
        </div>
      </Pauta4ColsOverlay>

      <Pauta4ColsOverlay
        overlay
        pautaEnabled={false}
        tableEnabled={false}
        numCols={3}
        numRows={90}
        topOffset="var(--appHeaderOffset, 33px)"
        bottomPadding="0px"
      >
        <div
          style={{
            gridColumn: '3 / 4',
            gridRow: '37 / 38', // +2 files per acompanyar el contingut baixat (abans 35 / 36)
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Roboto, sans-serif',
            fontSize: '1.125rem',
            color: 'rgb(115, 115, 115)',
            letterSpacing: '0.1em',
            margin: 0,
            whiteSpace: 'nowrap',
          }}
        >
          LA CIÈNCIA FICCIÓ QUE MIRA ENDINS
        </div>
      </Pauta4ColsOverlay>

      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-[1400px] px-4 pt-[158px] pb-[174px] sm:px-6 lg:px-10">
          <CollectionTitle
            index="01"
            kicker="Col·lecció"
            title="First Contact"
            subtitle={null}
            align="right"
            numberAlign="left"
            titleOffsetX={13.5}
            titleOffsetY={9}
            numberOffsetX={-36}
            numberOffsetY={-4}
          />
          <div style={{ marginTop: '150px' }}>
            <div
              style={{
                position: 'relative',
                left: '50%',
                top: '-13px', // Mogut 1 fila cap amunt (abans 25px, reduït 38px)
                transform: 'translateX(-50%)',
                width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
                height: 'calc(calc(calc(var(--hg-tdp-xR) - var(--hg-tdp-xL)) * 0.84632) - 231px)',
                display: 'grid',
                gridTemplateColumns: `repeat(3, minmax(0, calc((100% - ${2 * 22.5}px) / 3)))`,
                columnGap: '22.5px',
              }}
            >
              {/* Columna 1: TDP2 */}
              <TDP2
                gridColumn="1 / 2"
                editableIdPrefix="home-row1-tdp-1"
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
                copyMode={true}
                style={{
                  height: '100%',
                  boxSizing: 'border-box',
                }}
              />

              {/* Columna 2: TDP1 */}
              <TDP1
                gridColumn="2 / 3"
                editableIdPrefix="home-row1-tdp-2"
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
                copyMode={true}
                style={{
                  height: '100%',
                  boxSizing: 'border-box',
                }}
              />

              {/* Columna 3: TDP2 (Amb imatge a dalt i bloc Nom/Descripció a dota) */}
              <TDP2
                gridColumn="3 / 4"
                editableIdPrefix="home-row1-tdp-3"
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
                copyMode={true}
                style={{
                  height: '100%',
                  boxSizing: 'border-box',
                }}
              />

              {/* Indicador de més productes (Cercle discret + sota el producte de la tercera columna) */}
              <Link
                to="/first-contact"
                style={{
                  position: 'absolute',
                  right: 'calc((100% - 2 * 22.5px) / 6 - 18px)',
                  bottom: '-54px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  zIndex: 20,
                  transition: 'all 200ms ease',
                  textDecoration: 'none',
                }}
                className="hover:scale-110 hover:shadow-md hover:border-neutral-400 active:scale-95 group"
                title="Veure tota la col·lecció"
              >
                <span 
                  style={{ 
                    fontFamily: 'Oswald, sans-serif',
                    fontWeight: 300,
                    fontSize: '18px',
                    color: '#475059',
                    lineHeight: 1,
                    transform: 'translateY(-1px)',
                  }}
                  className="group-hover:text-neutral-900"
                >
                  +
                </span>
              </Link>
            </div>
          </div>

          {/* Col·lecció 02: The Human Inside (Distància de 5 files / 190px + 15px avall - 1 fila amunt) */}
          <div style={{ marginTop: '167px' }}>
            <div
              style={{
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
              }}
            >
              <CollectionTitle
                index="02"
                kicker="Col·lecció"
                title={
                  <div className="flex flex-col items-end">
                    <span>THE HUMAN</span>
                    <span style={{ transform: 'translateX(-3px)' }}>INSID<span style={{ display: 'inline-block', transform: 'translateX(-4px)' }}>E</span></span>
                  </div>
                }
                subtitle="EN EL TEU RACÓ MÉS PROFUND HI HA UN HEROI"
                align="left"
                numberAlign="right"
                titleTextAlign="left"
                titleOffsetY={9}
                numberOffsetX={1} // Mogut 4px més a l'esquerra (abans 5)
                numberOffsetY={-4}
                subtitleOffsetX="calc((var(--hg-tdp-xR) - var(--hg-tdp-xL)) / 3 + 7.5px)" // Desplaçat de la col 1 a la col 2 (⅓) neutralitzant el titleOffsetX
                subtitleOffsetY={18} // Mogut 18px avall
              />
            </div>
            <div style={{ marginTop: '150px' }}>
              <div
                style={{
                  position: 'relative',
                  left: '50%',
                  top: '0px', // Mogut 1 fila cap amunt (abans 38px, reduït 38px)
                  transform: 'translateX(-50%)',
                  width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
                  height: 'calc(calc(calc(var(--hg-tdp-xR) - var(--hg-tdp-xL)) * 0.84632) - 231px)',
                  display: 'grid',
                  gridTemplateColumns: `repeat(3, minmax(0, calc((100% - ${2 * 22.5}px) / 3)))`,
                  columnGap: '22.5px',
                }}
              >
                {/* Columna 1: TDP1 */}
                <TDP1
                  gridColumn="1 / 2"
                  editableIdPrefix="home-row2-tdp-1"
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  copyMode={true}
                  style={{
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Columna 2: TDP2 */}
                <TDP2
                  gridColumn="2 / 3"
                  editableIdPrefix="home-row2-tdp-2"
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  copyMode={true}
                  style={{
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Columna 3: TDP1 */}
                <TDP1
                  gridColumn="3 / 4"
                  editableIdPrefix="home-row2-tdp-3"
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  copyMode={true}
                  style={{
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Indicador de més productes (Cercle discret + sota el producte de la tercera columna) */}
                <Link
                  to="/thin"
                  style={{
                    position: 'absolute',
                    right: 'calc((100% - 2 * 22.5px) / 6 - 18px)',
                    bottom: '-54px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    zIndex: 20,
                    transition: 'all 200ms ease',
                    textDecoration: 'none',
                  }}
                  className="hover:scale-110 hover:shadow-md hover:border-neutral-400 active:scale-95 group"
                  title="Veure tota la col·lecció"
                >
                  <span 
                    style={{ 
                      fontFamily: 'Oswald, sans-serif',
                      fontWeight: 300,
                      fontSize: '18px',
                      color: '#475059',
                      lineHeight: 1,
                      transform: 'translateY(-1px)',
                    }}
                    className="group-hover:text-neutral-900"
                  >
                    +
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Col·lecció 03: Austen (Distància de 5 files / 190px) */}
          <div style={{ marginTop: '190px' }}>
            <div
              style={{
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
              }}
            >
              <CollectionTitle
                index="03"
                kicker="Col·lecció"
                title="Austen"
                subtitle="DIGUIS EL QUE DIGUIS, FES-HO AMB ELEGÀNCIA"
                align="right"
                numberAlign="left"
                titleTextAlign="center"
                titleOffsetX="calc((var(--hg-tdp-xR) - var(--hg-tdp-xL)) / 6 + 3.75px)" // Centrat entre les columnes 2 i 3
                titleOffsetY={-4}
                numberOffsetX={-22} // Mogut 14px a la dreta (abans -36)
                numberOffsetY={-17}
                subtitleOffsetY={5}
              />
            </div>
            <div style={{ marginTop: '150px' }}>
              <div
                style={{
                  position: 'relative',
                  left: '50%',
                  top: '-22px', // Mogut 9px més cap amunt (abans -13px)
                  transform: 'translateX(-50%)',
                  width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
                  height: 'calc(calc(calc(var(--hg-tdp-xR) - var(--hg-tdp-xL)) * 0.84632) - 231px)',
                  display: 'grid',
                  gridTemplateColumns: `repeat(3, minmax(0, calc((100% - ${2 * 22.5}px) / 3)))`,
                  columnGap: '22.5px',
                }}
              >
                {/* Columna 1: TDP2 */}
                <TDP2
                  gridColumn="1 / 2"
                  editableIdPrefix="home-row3-tdp-1"
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  copyMode={true}
                  style={{
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Columna 2: TDP1 */}
                <TDP1
                  gridColumn="2 / 3"
                  editableIdPrefix="home-row3-tdp-2"
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  copyMode={true}
                  style={{
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Columna 3: TDP2 */}
                <TDP2
                  gridColumn="3 / 4"
                  editableIdPrefix="home-row3-tdp-3"
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  copyMode={true}
                  style={{
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Indicador de més productes (Cercle discret + sota el producte de la tercera columna) */}
                <Link
                  to="/austen"
                  style={{
                    position: 'absolute',
                    right: 'calc((100% - 2 * 22.5px) / 6 - 18px)',
                    bottom: '-54px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    zIndex: 20,
                    transition: 'all 200ms ease',
                    textDecoration: 'none',
                  }}
                  className="hover:scale-110 hover:shadow-md hover:border-neutral-400 active:scale-95 group"
                  title="Veure tota la col·lecció"
                >
                  <span 
                    style={{ 
                      fontFamily: 'Oswald, sans-serif',
                      fontWeight: 300,
                      fontSize: '18px',
                      color: '#475059',
                      lineHeight: 1,
                      transform: 'translateY(-1px)',
                    }}
                    className="group-hover:text-neutral-900"
                  >
                    +
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Col·lecció 04: Cube (Distància de 5 files / 190px - 1 fila amunt) */}
          <div style={{ marginTop: '152px' }}>
            <div
              style={{
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
              }}
            >
              <CollectionTitle
                index="04"
                kicker="Col·lecció"
                title="Cube"
                subtitle="TOTS SOM ESTRANYS A ULLS NOSTRES"
                align="left"
                numberAlign="right"
                titleTextAlign="center"
                titleOffsetX="calc((var(--hg-tdp-xR) - var(--hg-tdp-xL)) / -6 - 3.75px)" // Centrat entre les columnes 1 i 2
                titleOffsetY={13}
                numberOffsetX={19} // Mogut 4px més a l'esquerra (abans 23)
                numberOffsetY={0}
                subtitleOffsetY={6}
              />
            </div>
            <div style={{ marginTop: '150px' }}>
              <div
                style={{
                  position: 'relative',
                  left: '50%',
                  top: '-6px', // Mogut 1 fila cap amunt (abans 32px, reduït 38px)
                  transform: 'translateX(-50%)',
                  width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
                  height: 'calc(calc(calc(var(--hg-tdp-xR) - var(--hg-tdp-xL)) * 0.84632) - 231px)',
                  display: 'grid',
                  gridTemplateColumns: `repeat(3, minmax(0, calc((100% - ${2 * 22.5}px) / 3)))`,
                  columnGap: '22.5px',
                }}
              >
                {/* Columna 1: TDP1 */}
                <TDP1
                  gridColumn="1 / 2"
                  editableIdPrefix="home-row4-tdp-1"
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  copyMode={true}
                  style={{
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Columna 2: TDP2 */}
                <TDP2
                  gridColumn="2 / 3"
                  editableIdPrefix="home-row4-tdp-2"
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  copyMode={true}
                  style={{
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Columna 3: TDP1 */}
                <TDP1
                  gridColumn="3 / 4"
                  editableIdPrefix="home-row4-tdp-3"
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  copyMode={true}
                  style={{
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Indicador de més productes (Cercle discret + sota el producte de la tercera columna) */}
                <Link
                  to="/cube"
                  style={{
                    position: 'absolute',
                    right: 'calc((100% - 2 * 22.5px) / 6 - 18px)',
                    bottom: '-54px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    zIndex: 20,
                    transition: 'all 200ms ease',
                    textDecoration: 'none',
                  }}
                  className="hover:scale-110 hover:shadow-md hover:border-neutral-400 active:scale-95 group"
                  title="Veure tota la col·lecció"
                >
                  <span 
                    style={{ 
                      fontFamily: 'Oswald, sans-serif',
                      fontWeight: 300,
                      fontSize: '18px',
                      color: '#475059',
                      lineHeight: 1,
                      transform: 'translateY(-1px)',
                    }}
                    className="group-hover:text-neutral-900"
                  >
                    +
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Col·lecció 05: MISC (Distància de 5 files / 190px - 1 fila amunt + 20px avall) */}
          <div style={{ marginTop: '172px', position: 'relative', zIndex: 30 }}>
            <div
              style={{
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
              }}
            >
              <CollectionTitle
                index="05"
                kicker="Col·lecció"
                title="MISC"
                subtitle="MÉS VAL SOL QUE MAL ACOMPANYAT"
                align="right"
                numberAlign="left"
                titleTextAlign="center"
                titleOffsetX="calc((var(--hg-tdp-xR) - var(--hg-tdp-xL)) / 6 + 3.75px)" // Centrat entre les columnes 2 i 3
                titleOffsetY={9}
                numberOffsetX={-22} // Mogut 14px a la dreta (abans -36)
                numberOffsetY={-4}
                subtitleOffsetY={6}
              />
            </div>
            <div style={{ marginTop: '150px' }}>
              <div
                style={{
                  position: 'relative',
                  left: '50%',
                  top: '-13px', // Mogut 1 fila cap amunt (abans 25px, reduït 38px)
                  transform: 'translateX(-50%)',
                  width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
                  height: 'calc(calc(calc(var(--hg-tdp-xR) - var(--hg-tdp-xL)) * 0.84632) - 231px)',
                  display: 'grid',
                  gridTemplateColumns: `repeat(3, minmax(0, calc((100% - ${2 * 22.5}px) / 3)))`,
                  columnGap: '22.5px',
                }}
              >
                {/* Columna 1: TDP2 */}
                <TDP2
                  gridColumn="1 / 2"
                  editableIdPrefix="home-row5-tdp-1"
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  copyMode={true}
                  style={{
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Columna 2: TDP1 */}
                <TDP1
                  gridColumn="2 / 3"
                  editableIdPrefix="home-row5-tdp-2"
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  copyMode={true}
                  style={{
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Columna 3: TDP2 */}
                <TDP2
                  gridColumn="3 / 4"
                  editableIdPrefix="home-row5-tdp-3"
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  copyMode={true}
                  style={{
                    height: '100%',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Indicador de més productes (Cercle discret + sota el producte de la tercera columna) */}
                <Link
                  to="/miscellania"
                  style={{
                    position: 'absolute',
                    right: 'calc((100% - 2 * 22.5px) / 6 - 18px)',
                    bottom: '-54px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    zIndex: 20,
                    transition: 'all 200ms ease',
                    textDecoration: 'none',
                  }}
                  className="hover:scale-110 hover:shadow-md hover:border-neutral-400 active:scale-95 group"
                  title="Veure toda la col·lecció"
                >
                  <span 
                    style={{ 
                      fontFamily: 'Oswald, sans-serif',
                      fontWeight: 300,
                      fontSize: '18px',
                      color: '#475059',
                      lineHeight: 1,
                      transform: 'translateY(-1px)',
                    }}
                    className="group-hover:text-neutral-900"
                  >
                    +
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bloc Copiat des de /pdp (fila 20 a 62) posicionat a la fila global 215 en endavant (Mogut 19 files amunt i 20px més amunt) */}
          <div style={{ marginTop: '-552px' }}>
            <Pauta4ColsOverlay
              pautaEnabled={false}
              tableEnabled={false}
              numCols={4}
              numRows={73}
              canvasAspect={[2642, 5441]}
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
                <div
                  style={{
                    textAlign: 'left',
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: '60pt',
                    fontWeight: 300,
                    lineHeight: 1.1,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#111827',
                  }}
                >
                  <div>CADA</div>
                  <div>PERSONA TÉ</div>
                  <div>UNA HISTÒRIA,</div>
                  <div style={{ marginTop: '0.4em' }}>CADA</div>
                  <div>HISTÒRIA TÉ</div>
                  <div>UN DIBUIX</div>
                </div>
              </div>

              {/* Subtítol "ALTRES HISTÒRIES" (Fila local 45 / 46 - correspon a global 245 / 246) */}
              <div
                style={{
                  gridColumn: '1 / 3',
                  gridRow: '45 / 46',
                  alignSelf: 'center',
                  fontFamily: 'Roboto Condensed, sans-serif',
                  fontWeight: 400,
                  fontSize: '15pt',
                  lineHeight: 1.2,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(71, 80, 89, 0.7)',
                  textAlign: 'left',
                  pointerEvents: 'auto',
                  transform: 'translate(2px, 5px)', // Baixat 5px per alinear amb la fila (2px dreta)
                }}
              >
                ALTRES HISTÒRIES
              </div>

              {/* Fletxes També et pot interessar (Fila local 45 / 46 - correspon a global 245 / 246) */}
              <div
                style={{
                  gridColumn: '4 / 5',
                  gridRow: '45 / 46',
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  minHeight: 0,
                  pointerEvents: 'auto',
                  transform: 'translateY(6px)', // Baixat 6px (només vertical)
                }}
              >
                <CarouselArrows
                  rightPx={0}
                  centerVertically
                  onPrev={() => {
                    console.log('Dispatching tambe-rail:prev');
                    window.dispatchEvent(new CustomEvent('tambe-rail:prev'));
                  }}
                  onNext={() => {
                    console.log('Dispatching tambe-rail:next');
                    window.dispatchEvent(new CustomEvent('tambe-rail:next'));
                  }}
                  rowHeight={rowHeight}
                />
              </div>

              {/* També et pot interessar Rail (Fila local 43 / 60 - correspon a global 243 / 260) */}
              <div
                style={{
                  gridColumn: '1 / 5',
                  gridRow: '43 / 60',
                  alignSelf: 'start',
                  width: '100%',
                  marginTop: '-41px', // Mogut 2px amunt (abans -39px)
                  pointerEvents: 'auto',
                }}
              >
                <TambeRail cardHref="/constructor/pdp" title="cada dibuix té una història" showInternalArrows={false} showTitle={false} />
              </div>
            </Pauta4ColsOverlay>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomeClean;
