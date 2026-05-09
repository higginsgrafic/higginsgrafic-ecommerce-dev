import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import NikeHeroSlider from '@/components/NikeHeroSlider';

const COLLECTIONS = [
  {
    title: 'First Contact',
    href: '/first-contact',
    eyebrow: 'Ciència-ficció',
    description: 'Una celebració de la curiositat humana, l’exploració i les grans preguntes que miren cap a les estrelles.',
  },
  {
    title: 'The Human Inside',
    href: '/thin',
    eyebrow: 'Identitat artificial',
    description: 'Robots, humans artificials i personatges que posen en dubte on comença i on acaba allò humà.',
  },
  {
    title: 'Outcasted',
    href: '/outcasted',
    eyebrow: 'Independència',
    description: 'Un homenatge a qui tria el seu propi camí, encara que això signifiqui caminar fora del centre.',
  },
];

const SERVICE_LINKS = [
  {
    title: 'Producció sota demanda',
    description: 'Cada peça es produeix quan es compra, amb proveïdors POD reals.',
    href: '/shipping',
  },
  {
    title: 'Roba unisex',
    description: 'Una guia de talles clara per triar la peça sense complicacions.',
    href: '/sizing',
  },
  {
    title: 'Seguiment de comanda',
    description: 'Consulta l’estat de la compra i el recorregut de l’enviament.',
    href: '/track',
  },
];

const HOME_VALUES = [
  'Col·leccions pròpies',
  'Roba unisex',
  'Producció sota demanda',
  'Seguiment de comanda',
];

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
    id: 'outcasted',
    imageSrc: '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_forest-green_gpr-4-0_front.png',
    imageAlt: 'Samarreta de la col·lecció Outcasted',
    kicker: 'Outcasted',
    headline: 'Per a qui tria el seu propi camí.',
    primaryCta: { label: 'Compra', href: '/outcasted' },
    secondaryCta: { label: 'Descobreix', href: '/outcasted' },
  },
];

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
          <p className="font-roboto text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Inici / Col·leccions pròpies / POD
          </p>
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

      <section className="border-t border-border bg-background text-foreground">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
          <div className="flex flex-wrap gap-2">
            {HOME_VALUES.map((value) => (
              <span
                key={value}
                className="rounded-full border border-border px-3 py-1 font-roboto text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background text-foreground">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="max-w-2xl">
            <p className="font-roboto text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Col·leccions
            </p>
            <h2 className="mt-4 font-roboto text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Tres portes d'entrada al catàleg
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {COLLECTIONS.map((collection) => (
              <Link
                key={collection.href}
                to={collection.href}
                className="group flex min-h-56 flex-col justify-between rounded-[1.5rem] border border-border bg-muted/40 p-6 transition-colors hover:bg-muted"
              >
                <div>
                  <p className="font-roboto text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {collection.eyebrow}
                  </p>
                  <h3 className="mt-4 font-roboto text-2xl font-black tracking-tight text-foreground">
                    {collection.title}
                  </h3>
                  <p className="mt-4 font-roboto text-sm leading-relaxed text-muted-foreground">
                    {collection.description}
                  </p>
                </div>
                <span className="mt-8 font-roboto text-sm font-semibold text-foreground underline-offset-4 group-hover:underline">
                  Entrar
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background text-foreground">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <p className="font-roboto text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Servei
              </p>
              <h2 className="mt-4 font-roboto text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Compra directa, producció responsable i informació clara.
              </h2>
            </div>

            <div className="grid gap-4">
              {SERVICE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group rounded-[1.25rem] border border-border bg-muted/30 p-5 transition-colors hover:bg-muted"
                >
                  <h3 className="font-roboto text-lg font-black tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-roboto text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-flex font-roboto text-sm font-semibold text-foreground underline-offset-4 group-hover:underline">
                    Saber-ne més
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomeClean;
