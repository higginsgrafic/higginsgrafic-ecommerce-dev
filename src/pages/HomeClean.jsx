import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const COLLECTIONS = [
  {
    title: 'First Contact',
    href: '/first-contact',
    description: 'Ciència-ficció, primer contacte i imaginari espacial.',
  },
  {
    title: 'The Human Inside',
    href: '/thin',
    description: 'Robots, humans artificials i preguntes sobre identitat.',
  },
  {
    title: 'Outcasted',
    href: '/outcasted',
    description: 'Personatges fora de lloc, cultura pop i resistència gràfica.',
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

      <section className="min-h-[calc(100vh-var(--appHeaderOffset,0px))] bg-background text-foreground">
        <div className="mx-auto grid min-h-[calc(100vh-var(--appHeaderOffset,0px))] max-w-[1400px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:px-10">
          <div>
            <p className="font-roboto text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Inici
            </p>
            <h1 className="mt-6 max-w-4xl font-roboto text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Samarretes gràfiques d'autor
            </h1>
            <p className="mt-6 max-w-2xl font-roboto text-base leading-relaxed text-muted-foreground sm:text-lg">
              HIGGINS GRÀFIC crea col·leccions pròpies de roba unisex, produïdes sota demanda amb proveïdors POD reals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/first-contact"
                className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 font-roboto text-sm font-semibold text-background transition-opacity hover:opacity-85"
              >
                Veure col·leccions
              </Link>
              <Link
                to="/sizing"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 font-roboto text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Guia de talles
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-muted">
            <div className="absolute inset-6 rounded-[1.5rem] border border-background/80 bg-background/40" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="font-roboto text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Col·leccions pròpies
              </p>
              <p className="mt-3 font-roboto text-3xl font-black tracking-tight text-foreground">
                Gràfica, roba i cultura visual.
              </p>
            </div>
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
                    Col·lecció
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
