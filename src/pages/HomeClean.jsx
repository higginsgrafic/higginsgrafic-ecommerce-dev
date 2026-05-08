import React from 'react';
import { Helmet } from 'react-helmet';

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
        <div className="mx-auto flex min-h-[calc(100vh-var(--appHeaderOffset,0px))] max-w-[1400px] flex-col justify-center px-4 py-20 sm:px-6 lg:px-10">
          <p className="font-roboto text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Inici
          </p>
          <h1 className="mt-6 max-w-4xl font-roboto text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            HIGGINS GRÀFIC
          </h1>
          <p className="mt-6 max-w-2xl font-roboto text-base leading-relaxed text-muted-foreground sm:text-lg">
            Samarretes gràfiques d'autor, roba unisex i col·leccions pròpies produïdes sota demanda.
          </p>
        </div>
      </section>
    </>
  );
}

export default HomeClean;
