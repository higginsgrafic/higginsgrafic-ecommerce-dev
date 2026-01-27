import React, { useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import OverlayUnderHeader from '@/components/OverlayUnderHeader';
import FullBleedUnderHeader from '@/components/FullBleedUnderHeader';

class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-[11px] text-muted-foreground">
          No es pot renderitzar.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function DevComponentsCatalogPage() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('buttons');

  const discoveredComponents = useMemo(() => {
    const modules = import.meta.glob('../components/**/*.{js,jsx}', { eager: true });

    const items = Object.entries(modules)
      .map(([path, mod]) => {
        const Comp = mod?.default;
        if (!Comp) return null;

        const cleanPath = path.replace(/^\.\.\/components\//, '');
        const parts = cleanPath.split('/');
        const group = parts.length > 1 ? parts[0] : 'root';
        const file = parts[parts.length - 1] || '';
        const name = file.replace(/\.(jsx|js)$/, '');
        return { path: cleanPath, group, name, Comp };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.group !== b.group) return a.group.localeCompare(b.group);
        return a.name.localeCompare(b.name);
      });

    const grouped = new Map();
    for (const item of items) {
      if (!grouped.has(item.group)) grouped.set(item.group, []);
      grouped.get(item.group).push(item);
    }

    const groups = Array.from(grouped.entries()).map(([group, groupItems]) => ({ group, items: groupItems }));
    groups.sort((a, b) => {
      if (a.group === 'ui' && b.group !== 'ui') return -1;
      if (b.group === 'ui' && a.group !== 'ui') return 1;
      return a.group.localeCompare(b.group);
    });

    return {
      total: items.length,
      groups,
    };
  }, []);

  const sections = useMemo(
    () => [
      {
        id: 'ui',
        title: 'UI',
        render: () => {
          const uiGroup = discoveredComponents.groups.find((g) => g.group === 'ui');
          const uiItems = uiGroup?.items || [];

          return (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-mono">{uiItems.length}</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {uiItems.map((item) => (
                  <div key={item.path} className="rounded-md border border-border bg-background p-3">
                    <div className="text-xs font-semibold text-foreground/80 truncate">{item.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{item.path}</div>
                    <div className="mt-3 rounded border border-border bg-muted/60 p-2 overflow-hidden">
                      <ComponentErrorBoundary>
                        <item.Comp />
                      </ComponentErrorBoundary>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        id: 'all',
        title: 'Tots',
        render: () => (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-mono">{discoveredComponents.total}</span>
            </div>

            {discoveredComponents.groups.map((g) => (
              <div key={g.group} className="space-y-3">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">
                  {g.group}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {g.items.map((item) => (
                    <div key={item.path} className="rounded-md border border-border bg-background p-3">
                      <div className="text-xs font-semibold text-foreground/80 truncate">{item.name}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{item.path}</div>
                      <div className="mt-3 rounded border border-border bg-muted/60 p-2 overflow-hidden">
                        <ComponentErrorBoundary>
                          <item.Comp />
                        </ComponentErrorBoundary>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: 'buttons',
        title: 'Botons',
        render: () => (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button">Primari</Button>
              <Button type="button" variant="secondary">Secundari</Button>
              <Button type="button" variant="outline">Contorn</Button>
              <Button type="button" variant="ghost">Fantasma</Button>
              <Button type="button" disabled>Desactivat</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" size="sm">Petit</Button>
              <Button type="button">Normal</Button>
              <Button type="button" size="lg">Gran</Button>
              <Button type="button" size="icon" aria-label="Icona">
                <span aria-hidden="true" className="text-lg">+</span>
              </Button>
            </div>
          </div>
        ),
      },
      {
        id: 'branding',
        title: 'Marca',
        render: () => (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-md border border-border bg-background px-4 py-3">
              <div className="text-xs font-semibold text-muted-foreground">Logo</div>
              <span
                aria-hidden="true"
                data-brand-logo="1"
                className="h-8 w-[140px] block text-foreground"
                style={{
                  backgroundColor: 'currentColor',
                  WebkitMaskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                  maskImage: 'url(/custom_logos/brand/marca-grafic-logo.svg)',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'left center',
                  maskPosition: 'left center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Per reutilitzar aquest bloc, encapsuleu-lo en un component de marca (p. ex. <span className="font-mono">BrandLogo</span>).
            </div>
          </div>
        ),
      },
      {
        id: 'overlays',
        title: 'Overlays sota header',
        render: () => (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button type="button" onClick={() => setOverlayOpen(true)}>
                Obriu overlay
              </Button>
              <div className="text-sm text-muted-foreground">Ajustat a <span className="font-mono">--appHeaderOffset</span>.</div>
            </div>
            <OverlayUnderHeader open={overlayOpen} onClose={() => setOverlayOpen(false)}>
              <div className="p-4">
                <div className="text-sm font-semibold text-foreground">Overlay de prova</div>
                <div className="mt-2 text-sm text-muted-foreground">Cliqueu el fons o premeu ESC per tancar.</div>
                <div className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setOverlayOpen(false)}>
                    Tanqueu
                  </Button>
                </div>
              </div>
            </OverlayUnderHeader>
          </div>
        ),
      },
      {
        id: 'layout',
        title: 'Layout sota header (full bleed)',
        render: () => (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Aquest wrapper permet que una secció ocupi el top “real” de la pantalla, respectant l’alçada del header.
            </div>
            <FullBleedUnderHeader className="rounded-md border border-border bg-muted/60 p-4">
              <div className="text-sm font-semibold text-foreground">FullBleedUnderHeader</div>
              <div className="mt-1 text-sm text-muted-foreground">Contingut de prova.</div>
            </FullBleedUnderHeader>
          </div>
        ),
      },
    ],
    [discoveredComponents, overlayOpen]
  );

  return (
    <div className="h-[calc(100vh-var(--appHeaderOffset,0px))] bg-background overflow-x-auto">
      <SEO title="Catàleg de components" description="Catàleg visual de components" />

      <div className="min-w-[1400px] h-full">
        <div className="h-full grid grid-cols-[280px_minmax(0,1fr)_minmax(0,1fr)_360px]">
          <div className="border-r border-border bg-background overflow-y-auto">
            <div className="px-4 pt-5 pb-4 border-b border-border">
              <div className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">DEV</div>
              <div className="mt-2 text-lg font-bold text-foreground">Catàleg</div>
              <div className="mt-1 text-xs text-muted-foreground">Components</div>
            </div>

            <div className="px-3 py-3">
              <div className="text-[11px] font-semibold text-muted-foreground">Llista</div>
              <div className="mt-2 flex flex-col gap-1">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSectionId(s.id)}
                    className={`w-full rounded-md px-2 py-2 text-left ${activeSectionId === s.id ? 'bg-muted' : 'hover:bg-muted/60'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-10 rounded border border-border bg-muted/60" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground/80 truncate">{s.title}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{s.id}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-background overflow-y-auto">
            <div className="px-4 pt-5 pb-4 border-b border-border">
              <div className="text-[11px] font-semibold text-muted-foreground">Preview</div>
              <div className="mt-1 text-sm font-bold text-foreground">{sections.find((s) => s.id === activeSectionId)?.title}</div>
            </div>
            <div className="p-4">
              <div className="rounded-md border border-border bg-background p-4">
                {sections.find((s) => s.id === activeSectionId)?.render()}
              </div>
            </div>
          </div>

          <div className="bg-background overflow-y-auto border-l border-border">
            <div className="px-4 pt-5 pb-4 border-b border-border">
              <div className="text-[11px] font-semibold text-muted-foreground">Preview</div>
              <div className="mt-1 text-sm font-bold text-foreground">Estat</div>
            </div>
            <div className="p-4">
              <div className="rounded-md border border-border bg-background p-4">
                <div className="text-sm font-semibold text-foreground/80">Seleccionat</div>
                <div className="mt-1 text-xs text-muted-foreground">{activeSectionId}</div>
              </div>
            </div>
          </div>

          <div className="border-l border-border bg-background overflow-y-auto">
            <div className="px-4 pt-5 pb-4 border-b border-border">
              <div className="text-[11px] font-semibold text-muted-foreground">Inspector</div>
              <div className="mt-1 text-sm font-bold text-foreground">Propietats</div>
            </div>
            <div className="p-4 space-y-3">
              <div className="rounded-md border border-border bg-background p-4">
                <div className="text-sm font-semibold text-foreground/80">Component</div>
                <div className="mt-1 text-xs text-muted-foreground">{activeSectionId}</div>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <div className="text-sm font-semibold text-foreground/80">Accions</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => setOverlayOpen(true)}>Obriu overlay</Button>
                  <Button type="button" variant="outline" onClick={() => setOverlayOpen(false)}>Tanqueu overlay</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
