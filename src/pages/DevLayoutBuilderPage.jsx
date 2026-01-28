import React, { useEffect, useMemo, useRef, useState } from 'react';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';

class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-[11px] text-muted-foreground">No es pot renderitzar.</div>;
    }
    return this.props.children;
  }
}

const STORAGE_KEY = 'devLayoutBuilder:v1';

export default function DevLayoutBuilderPage() {
  const [query, setQuery] = useState('');
  const [selectedWidthKey, setSelectedWidthKey] = useState('laptop');
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const queryRef = useRef(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.selectedPaths)) setSelectedPaths(parsed.selectedPaths.filter(Boolean));
        if (typeof parsed.selectedWidthKey === 'string') setSelectedWidthKey(parsed.selectedWidthKey);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedPaths, selectedWidthKey }));
    } catch {
    }
  }, [selectedPaths, selectedWidthKey]);

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

    return {
      total: items.length,
      items,
      byPath: new Map(items.map((it) => [it.path, it])),
    };
  }, []);

  const widths = useMemo(
    () => [
      { key: 'mobile', label: 'Mobile', width: 390 },
      { key: 'tablet', label: 'Tablet', width: 768 },
      { key: 'laptop', label: 'Laptop', width: 1366 },
      { key: 'desktop', label: 'Desktop', width: 1920 },
      { key: 'fluid', label: 'Fluid', width: null },
    ],
    []
  );

  const selectedWidth = useMemo(() => widths.find((w) => w.key === selectedWidthKey) || widths[2], [widths, selectedWidthKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = discoveredComponents.items;
    if (!q) return list;
    return list.filter((it) => {
      const hay = `${it.group}/${it.name} ${it.path}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, discoveredComponents.items]);

  const activeSelectedPath = selectedIndex >= 0 ? selectedPaths[selectedIndex] : '';

  const addComponent = (path) => {
    if (!path) return;
    setSelectedPaths((prev) => {
      const next = [...prev, path];
      setSelectedIndex(next.length - 1);
      return next;
    });
  };

  const removeSelected = () => {
    if (selectedIndex < 0) return;
    setSelectedPaths((prev) => {
      const next = prev.filter((_, i) => i !== selectedIndex);
      const nextIdx = Math.min(selectedIndex, next.length - 1);
      setSelectedIndex(nextIdx);
      return next;
    });
  };

  const moveSelected = (dir) => {
    if (selectedIndex < 0) return;
    setSelectedPaths((prev) => {
      const next = [...prev];
      const from = selectedIndex;
      const to = from + dir;
      if (to < 0 || to >= next.length) return prev;
      const tmp = next[from];
      next[from] = next[to];
      next[to] = tmp;
      setSelectedIndex(to);
      return next;
    });
  };

  const clearAll = () => {
    setSelectedPaths([]);
    setSelectedIndex(-1);
  };

  const focusSearch = () => {
    queryRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Layout builder" description="Maquetador ràpid (DEV)" />

      <div className="mx-auto max-w-[2200px] px-4 pt-6 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm font-semibold text-foreground">Maquetador</div>
          <div className="text-[11px] text-muted-foreground">Components: <span className="font-mono">{discoveredComponents.total}</span></div>
          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {widths.map((w) => {
              const active = w.key === selectedWidthKey;
              return (
                <button
                  key={w.key}
                  type="button"
                  onClick={() => setSelectedWidthKey(w.key)}
                  className={`px-2 py-1 text-[11px] font-semibold border-b ${active ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr_360px]">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-foreground/80">Components</div>
              <div className="flex-1" />
              <button
                type="button"
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                onClick={focusSearch}
              >
                Cercar
              </button>
            </div>

            <div className="mt-2">
              <input
                ref={queryRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtra..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-3 h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                {filtered.slice(0, 500).map((it) => (
                  <button
                    key={it.path}
                    type="button"
                    className="w-full text-left rounded-md border border-transparent hover:border-border hover:bg-muted/40 px-2 py-2"
                    onClick={() => addComponent(it.path)}
                    title={it.path}
                  >
                    <div className="text-xs font-semibold text-foreground/80 truncate">{it.group}/{it.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{it.path}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/30 p-3 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold text-foreground/80">Preview</div>
              <div className="text-[11px] text-muted-foreground">
                {selectedWidth?.width ? (
                  <span><span className="font-mono">{selectedWidth.width}</span>px</span>
                ) : (
                  <span>fluid</span>
                )}
              </div>
              <div className="flex-1" />
              <div className="text-[11px] text-muted-foreground">{selectedPaths.length} ítems</div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <div
                className="mx-auto bg-background border border-border rounded-md shadow-sm"
                style={{
                  width: selectedWidth?.width ? `${selectedWidth.width}px` : '100%',
                  minHeight: '70vh',
                }}
              >
                <div className="p-4 space-y-6">
                  {selectedPaths.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Afegiu components des de l’esquerra.</div>
                  ) : (
                    selectedPaths.map((p, idx) => {
                      const item = discoveredComponents.byPath.get(p);
                      const Comp = item?.Comp;
                      const active = idx === selectedIndex;
                      return (
                        <div
                          key={`${p}:${idx}`}
                          className={`rounded-md border ${active ? 'border-foreground' : 'border-border'} bg-background`}
                        >
                          <button
                            type="button"
                            className="w-full flex items-center justify-between gap-3 px-3 py-2 border-b border-border"
                            onClick={() => setSelectedIndex(idx)}
                            title={p}
                          >
                            <div className="min-w-0 text-left">
                              <div className="text-xs font-semibold text-foreground/80 truncate">{item ? `${item.group}/${item.name}` : p}</div>
                              <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{p}</div>
                            </div>
                            <div className="text-[11px] font-mono text-muted-foreground">{idx + 1}</div>
                          </button>
                          <div className="p-3">
                            {Comp ? (
                              <ComponentErrorBoundary>
                                <Comp />
                              </ComponentErrorBoundary>
                            ) : (
                              <div className="text-[11px] text-muted-foreground">Component no trobat.</div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-xs font-semibold text-foreground/80">Escena</div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Seleccioneu un bloc al preview per moure’l o eliminar-lo.
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <Button type="button" variant="outline" onClick={() => moveSelected(-1)} disabled={selectedIndex <= 0}>
                Puja
              </Button>
              <Button type="button" variant="outline" onClick={() => moveSelected(1)} disabled={selectedIndex < 0 || selectedIndex >= selectedPaths.length - 1}>
                Baixa
              </Button>
              <Button type="button" variant="destructive" onClick={removeSelected} disabled={selectedIndex < 0}>
                Elimina
              </Button>
              <div className="h-px bg-border my-2" />
              <Button type="button" variant="outline" onClick={clearAll} disabled={selectedPaths.length === 0}>
                Neteja-ho tot
              </Button>
            </div>

            {activeSelectedPath ? (
              <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
                <div className="text-[11px] font-semibold text-foreground/80">Seleccionat</div>
                <div className="mt-1 text-[11px] font-mono text-muted-foreground break-words">{activeSelectedPath}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
