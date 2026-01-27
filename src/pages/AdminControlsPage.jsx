import React, { useMemo } from 'react';
import SEO from '@/components/SEO';
import FullWideSlide from '@/components/FullWideSlide';

export default function AdminControlsPage() {
  const title = useMemo(() => 'Controls globals', []);

  return (
    <>
      <SEO title={title} description="Controls globals de tema i aparença" />

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <FullWideSlide
          triggerLabel="FullWideSlide"
          openAriaLabel="Obrir FullWideSlide"
          overlayAriaLabel="Tancar FullWideSlide"
          title={title}
          subtitle="Exemple (placeholder)"
          showSearch={false}
          defaultOpen={true}
          layout="mega"
        >
          <div className="grid gap-6">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">Títol placeholder</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Text de mostra per validar composició, espai i jerarquia visual.
                </div>
              </div>
              <div className="shrink-0">
                <div className="h-8 w-28 rounded-md border border-border bg-muted" aria-hidden="true" />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="border-l border-border">
                <div className="pl-3 pr-4 text-xs font-semibold text-foreground uppercase tracking-wide">Secció</div>
                <div className="mt-2 grid">
                  {['Opció A', 'Opció B', 'Opció C'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="pl-3 pr-4 py-2 text-left text-sm font-light text-foreground hover:bg-muted/60"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-l border-border">
                <div className="pl-3 pr-4 text-xs font-semibold text-foreground uppercase tracking-wide">Secció</div>
                <div className="mt-2 grid">
                  {['Element 1', 'Element 2', 'Element 3'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="pl-3 pr-4 py-2 text-left text-sm font-light text-foreground hover:bg-muted/60"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-l border-border">
                <div className="pl-3 pr-4 text-xs font-semibold text-foreground uppercase tracking-wide">Secció</div>
                <div className="mt-2 grid">
                  {['Acció', 'Acció', 'Acció'].map((label, idx) => (
                    <button
                      key={`${label}-${idx}`}
                      type="button"
                      className="pl-3 pr-4 py-2 text-left text-sm font-light text-foreground hover:bg-muted/60"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="h-8 w-24 rounded-md border border-border bg-muted" aria-hidden="true" />
              <div className="h-8 w-24 rounded-md border border-border bg-muted" aria-hidden="true" />
              <div className="h-8 w-24 rounded-md border border-border bg-muted" aria-hidden="true" />
            </div>
          </div>
        </FullWideSlide>
      </div>
    </>
  );
}
