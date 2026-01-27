import React from 'react';
import { Link } from 'react-router-dom';

function LabDemosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">LAB</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Demos</h1>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
              Demos i eines de desenvolupament. Proves (col·lecció LAB) segueix a{' '}
              <Link to="/lab/proves" className="font-semibold text-foreground/80 underline underline-offset-4 hover:text-foreground">
                /lab/proves
              </Link>
              .
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/lab/proves"
              className="h-10 shrink-0 rounded-full border border-border bg-background px-4 text-xs font-semibold tracking-[0.18em] uppercase text-foreground/70 hover:bg-muted"
            >
              LAB Proves
            </Link>
            <Link
              to="/lab/proves"
              className="h-10 shrink-0 rounded-full border border-border bg-background px-4 text-xs font-semibold tracking-[0.18em] uppercase text-foreground/70 hover:bg-muted"
            >
              Anar a col·lecció
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="text-[12px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">Demos</h2>
            <div className="mt-4 grid gap-3">
              <Link to="/proves/demo-adidas" className="rounded-xl border border-border p-4 hover:bg-muted/60">
                <div className="text-sm font-semibold text-foreground">Adidas demo</div>
                <div className="mt-1 text-xs text-muted-foreground">/proves/demo-adidas</div>
              </Link>
              <Link to="/proves/demo-adidas-pdp" className="rounded-xl border border-border p-4 hover:bg-muted/60">
                <div className="text-sm font-semibold text-foreground">Adidas PDP demo</div>
                <div className="mt-1 text-xs text-muted-foreground">/proves/demo-adidas-pdp</div>
              </Link>
              <Link to="/proves/demo-nike-tambe" className="rounded-xl border border-border p-4 hover:bg-muted/60">
                <div className="text-sm font-semibold text-foreground">Nike també</div>
                <div className="mt-1 text-xs text-muted-foreground">/proves/demo-nike-tambe</div>
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-[12px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">Dev</h2>
            <div className="mt-4 grid gap-3">
              <Link to="/proves/dev-links" className="rounded-xl border border-border p-4 hover:bg-muted/60">
                <div className="text-sm font-semibold text-foreground">Dev links</div>
                <div className="mt-1 text-xs text-muted-foreground">/proves/dev-links</div>
              </Link>
              <Link to="/proves/dev-adidas-stripe-zoom" className="rounded-xl border border-border p-4 hover:bg-muted/60">
                <div className="text-sm font-semibold text-foreground">Adidas stripe zoom dev</div>
                <div className="mt-1 text-xs text-muted-foreground">/proves/dev-adidas-stripe-zoom</div>
              </Link>
            </div>

            <div className="mt-10 rounded-xl border border-border bg-muted/60 p-4 text-sm text-muted-foreground">
              Per WIP, fes servir{' '}
              <Link to="/lab/wip" className="font-semibold text-foreground/80 underline underline-offset-4 hover:text-foreground">
                /lab/wip
              </Link>
              .
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default LabDemosPage;
