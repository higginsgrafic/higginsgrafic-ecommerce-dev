import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import NikeHeroSlider from '@/components/NikeHeroSlider';
import TdpVariantsGallery from '@/components/tdp/TdpVariantsGallery';

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

function CollectionTitle({ index, kicker, title, subtitle, align = 'left', numberAlign, titleOffsetX = 0, titleOffsetY = 0, numberOffsetX = -20, numberOffsetY = 0, numberTopPercent = 50, subtitleOffsetX = 0, subtitleOffsetY = 0 }) {
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
    <div className={`relative mb-10 mt-[27px] lg:mb-14 ${isRight ? 'text-right' : 'text-left'}`}>
      <div
        className={`relative flex flex-col gap-3 ${
          isRight ? 'items-end' : 'items-start'
        }`}
      >
        <h2
          className="relative font-black uppercase leading-[0.85] tracking-[-0.02em] text-foreground"
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: 'clamp(4.572rem, 15.24vw, 13.208rem)',
            width: '100%',
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
                    transform: `translate(${titleOffsetX}px, ${titleOffsetY}px)`,
                  }
                : undefined
            }
          >
            {title}
          </span>
        </h2>

        {subtitle ? (
          <p
            className={`max-w-2xl font-roboto text-base leading-snug text-muted-foreground sm:text-lg ${
              isRight ? 'ml-auto text-right' : 'text-left'
            }`}
            style={{
              letterSpacing: '0.1em',
              ...(subtitleOffsetX || subtitleOffsetY
                ? { transform: `translate(${subtitleOffsetX}px, ${subtitleOffsetY}px)` }
                : {}),
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function HomeClean() {
  return (
    <>
      <Helmet>
        <title>HIGGINS GRÀFIC — Inici</title>
        <meta
          name="description"
          content="Samarretes gràfiques d'autor, roba unisex i col·leccions pròpies produïdes sota demanda."
        />
      </Helmet>

      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-[1400px] px-4 pb-12 pt-8 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
          <nav>
            <ol className="flex items-center space-x-2 font-roboto text-sm uppercase text-foreground">
              <li>
                <Link to="/" className="text-foreground transition-colors hover:text-muted-foreground">
                  Inici
                </Link>
              </li>
              <li className="text-muted-foreground">›</li>
              <li>
                <Link to="/first-contact" className="text-foreground transition-colors hover:text-muted-foreground">
                  Col·leccions
                </Link>
              </li>
              <li className="text-muted-foreground">›</li>
              <li className="font-medium text-foreground">
                POD
              </li>
            </ol>
          </nav>
          <h1 className="mt-6 max-w-4xl font-roboto text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            HIGGINS GRÀFIC
          </h1>
          <p className="mt-6 max-w-2xl font-roboto text-base leading-relaxed text-muted-foreground sm:text-lg">
            Samarretes gràfiques d'autor, roba unisex i col·leccions pròpies produïdes sota demanda.
          </p>
        </div>
      </section>

      <NikeHeroSlider
        slides={HERO_SLIDES}
        autoplay
        autoplayIntervalMs={8000}
      />

      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-[1400px] px-4 pt-[348px] pb-[174px] sm:px-6 lg:px-10">
          <CollectionTitle
            index="01"
            kicker="Col·lecció"
            title="First Contact"
            subtitle="CIÈNCIA FICCIÓ PER A MIRAR CAP A DINS"
            align="right"
            numberAlign="left"
            titleOffsetX={-2.5}
            titleOffsetY={9}
            numberOffsetX={-21}
            subtitleOffsetX={-25}
            subtitleOffsetY={9}
          />
          <div style={{ marginTop: '150px' }}>
            <TdpVariantsGallery
              variants={[
                { variant: 'v3', editableIdPrefix: 'home-row1-tdp-1' },
                { variant: 'v4', editableIdPrefix: 'home-row1-tdp-2' },
                { variant: 'v3', editableIdPrefix: 'home-row1-tdp-3' },
              ]}
              showLabels={false}
              copyMode
            />
          </div>
        </div>
      </section>

      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-[1400px] px-4 py-[174px] sm:px-6 lg:px-10">
          <CollectionTitle
            index="02"
            kicker="Col·lecció"
            title={(
              <span style={{ display: 'inline-block', textAlign: 'right' }}>
                <span style={{ display: 'block' }}>The Human</span>
                <span style={{ display: 'block', transform: 'translateX(-3.5px)' }}>
                  Insi<span style={{ display: 'inline-block', transform: 'translateX(-2px)' }}>d</span><span style={{ display: 'inline-block', transform: 'translateX(-3px)' }}>e</span>
                </span>
                <span
                  className="text-muted-foreground"
                  style={{
                    display: 'block',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '1.125rem',
                    fontWeight: 400,
                    lineHeight: 1.4,
                    letterSpacing: '0.215em',
                    marginTop: '0.75rem',
                    transform: 'translate(-3.5px, 9px)',
                  }}
                >
                  ROBOTS, IDENTITAT I PREGUNTES INCÒMODES
                </span>
              </span>
            )}
            subtitle={null}
            align="left"
            numberAlign="left"
            titleOffsetX={47.5}
            titleOffsetY={9}
            numberOffsetX={-21}
            numberOffsetY={-9}
            numberTopPercent={25}
          />
          <TdpVariantsGallery
            variants={[
              { variant: 'v4', editableIdPrefix: 'home-row2-tdp-1' },
              { variant: 'v3', editableIdPrefix: 'home-row2-tdp-2' },
              { variant: 'v4', editableIdPrefix: 'home-row2-tdp-3' },
            ]}
            showLabels={false}
            copyMode
          />
        </div>
      </section>

      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-[1400px] px-4 py-[174px] sm:px-6 lg:px-10">
          <CollectionTitle
            index="03"
            kicker="Col·lecció"
            title={(
              <span style={{ display: 'inline-block', textAlign: 'right' }}>
                <span style={{ display: 'block' }}>Austen</span>
                <span
                  className="text-muted-foreground"
                  style={{
                    display: 'block',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '1.125rem',
                    fontWeight: 400,
                    lineHeight: 1.4,
                    letterSpacing: '0.1em',
                    marginTop: '0.75rem',
                    transform: 'translate(-7px, 9px)',
                  }}
                >
                  CRÍTICA SOCIAL ENVOLACALLADA DE FINA IRONIA
                </span>
              </span>
            )}
            subtitle={null}
            align="left"
            numberAlign="left"
            titleOffsetX={35}
            titleOffsetY={9}
            numberOffsetX={-21}
            numberOffsetY={30}
            numberTopPercent={25}
          />
          <TdpVariantsGallery
            variants={[
              { variant: 'v3', editableIdPrefix: 'home-row3-tdp-1' },
              { variant: 'v4', editableIdPrefix: 'home-row3-tdp-2' },
              { variant: 'v3', editableIdPrefix: 'home-row3-tdp-3' },
            ]}
            showLabels={false}
            copyMode
          />
        </div>
      </section>

      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-[1400px] px-4 py-[174px] sm:px-6 lg:px-10">
          <CollectionTitle
            index="04"
            kicker="Col·lecció"
            title={(
              <span style={{ display: 'inline-block', textAlign: 'right' }}>
                <span style={{ display: 'block' }}>Cube</span>
                <span
                  className="text-muted-foreground"
                  style={{
                    display: 'block',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '1.125rem',
                    fontWeight: 400,
                    lineHeight: 1.4,
                    letterSpacing: '0.1em',
                    marginTop: '0.75rem',
                    transform: 'translateY(9px)',
                  }}
                >
                  UN PUNT DE VITA DIFERENT
                </span>
              </span>
            )}
            subtitle={null}
            align="left"
            numberAlign="left"
            titleOffsetX={65}
            titleOffsetY={9}
            numberOffsetX={-21}
            numberOffsetY={36}
            numberTopPercent={25}
          />
          <TdpVariantsGallery
            variants={[
              { variant: 'v4', editableIdPrefix: 'home-row4-tdp-1' },
              { variant: 'v3', editableIdPrefix: 'home-row4-tdp-2' },
              { variant: 'v4', editableIdPrefix: 'home-row4-tdp-3' },
            ]}
            showLabels={false}
            copyMode
          />
        </div>
      </section>

      <section className="bg-background text-foreground">
        <div className="mx-auto max-w-[1400px] px-4 py-[174px] sm:px-6 lg:px-10">
          <CollectionTitle
            index="05"
            kicker="Col·lecció"
            title={(
              <span style={{ display: 'inline-block', textAlign: 'right' }}>
                <span style={{ display: 'block', transform: 'translate(24px, -2px)' }}>Miscel·lània</span>
                <span
                  className="text-muted-foreground"
                  style={{
                    display: 'block',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '1.125rem',
                    fontWeight: 400,
                    lineHeight: 1.4,
                    letterSpacing: '0.11em',
                    marginTop: '0.75rem',
                    transform: 'translate(25px, 9px)',
                  }}
                >
                  NO HEM TRENCAT CAP MOTLLE, TAN SOLS ÉS QUE ENS HAN FET A MÀ
                </span>
              </span>
            )}
            subtitle={null}
            align="left"
            numberAlign="left"
            titleOffsetX={35}
            titleOffsetY={9}
            numberOffsetX={-21}
            numberOffsetY={31}
            numberTopPercent={25}
          />
          <TdpVariantsGallery
            variants={[
              { variant: 'v3', editableIdPrefix: 'home-row5-tdp-1' },
              { variant: 'v4', editableIdPrefix: 'home-row5-tdp-2' },
              { variant: 'v3', editableIdPrefix: 'home-row5-tdp-3' },
            ]}
            showLabels={false}
            copyMode
          />
        </div>
      </section>

    </>
  );
}

export default HomeClean;
