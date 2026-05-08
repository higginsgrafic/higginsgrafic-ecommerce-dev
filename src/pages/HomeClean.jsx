import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

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
    </>
  );
}

export default HomeClean;
