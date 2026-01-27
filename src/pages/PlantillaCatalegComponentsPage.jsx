import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FullWideSlideHeaderMegaMenuContained from '@/components/FullWideSlideHeaderMegaMenuContained';

export default function PlantillaCatalegComponentsPage() {
  const frameRef = useRef(null);
  const dockBarRef = useRef(null);
  const editorPanelScrollRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorError, setEditorError] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedText, setAdvancedText] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('');
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [newNavId, setNewNavId] = useState('');
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newItemText, setNewItemText] = useState('');

  const [config, setConfig] = useState(() => ({
    version: 1,
    components: {
      fullWideSlide: {
        enabled: true,
        iteration: 'v1',
        updatedAt: '',
        notes: '',
        megaMenu: {
          showStripe: true,
          showCatalogPanel: true,
          navItems: undefined,
          megaConfig: undefined,
        },
      },
    },
  }));

  const fullWideSlide = config?.components?.fullWideSlide;

  const resolvedNavItems =
    Array.isArray(fullWideSlide?.megaMenu?.navItems) && fullWideSlide.megaMenu.navItems.length > 0 ? fullWideSlide.megaMenu.navItems : undefined;
  const resolvedMegaConfig =
    fullWideSlide?.megaMenu?.megaConfig &&
    typeof fullWideSlide.megaMenu.megaConfig === 'object' &&
    Object.keys(fullWideSlide.megaMenu.megaConfig).length > 0
      ? fullWideSlide.megaMenu.megaConfig
      : undefined;

  const refresh = useCallback(async () => {
    setError('');
    setSaveMessage('');
    setLoading(true);
    try {
      const res = await fetch('/component-catalog.config.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`No s'ha pogut carregar la config (${res.status})`);
      const json = await res.json();
      setConfig(json);
    } catch (e) {
      setError(e?.message || 'Error carregant la config');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!editorOpen) return;
    setEditorError('');
    setAdvancedOpen(false);
    setAdvancedText('');

    const nav = Array.isArray(fullWideSlide?.megaMenu?.navItems) ? fullWideSlide.megaMenu.navItems : [];
    const firstNavId = nav[0]?.id || 'first_contact';
    setActiveSectionId((prev) => prev || firstNavId);
    setActiveColumnIndex(0);
  }, [editorOpen, fullWideSlide?.megaMenu?.navItems]);

  useEffect(() => {
    if (!editorOpen) return;
    const raf = window.requestAnimationFrame(() => {
      try {
        if (editorPanelScrollRef.current) editorPanelScrollRef.current.scrollTop = 0;
      } catch {
        // ignore
      }
    });
    return () => window.cancelAnimationFrame(raf);
  }, [editorOpen]);

  useEffect(() => {
    if (!advancedOpen) return;
    try {
      const payload = {
        navItems: Array.isArray(fullWideSlide?.megaMenu?.navItems) ? fullWideSlide.megaMenu.navItems : [],
        megaConfig:
          fullWideSlide?.megaMenu?.megaConfig && typeof fullWideSlide.megaMenu.megaConfig === 'object' ? fullWideSlide.megaMenu.megaConfig : {},
      };
      setAdvancedText(JSON.stringify(payload, null, 2));
    } catch {
      setAdvancedText('');
    }
  }, [advancedOpen, fullWideSlide?.megaMenu?.navItems, fullWideSlide?.megaMenu?.megaConfig]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateFullWideSlide = useCallback((patch) => {
    setConfig((prev) => {
      const megaMenuPatch = patch?.megaMenu;
      const restPatch = { ...(patch || {}) };
      delete restPatch.megaMenu;

      const next = {
        ...(prev || {}),
        version: prev?.version ?? 1,
        components: {
          ...(prev?.components || {}),
          fullWideSlide: {
            enabled: prev?.components?.fullWideSlide?.enabled ?? true,
            iteration: prev?.components?.fullWideSlide?.iteration ?? 'v1',
            updatedAt: prev?.components?.fullWideSlide?.updatedAt ?? '',
            notes: prev?.components?.fullWideSlide?.notes ?? '',
            megaMenu: {
              showStripe: prev?.components?.fullWideSlide?.megaMenu?.showStripe ?? true,
              showCatalogPanel: prev?.components?.fullWideSlide?.megaMenu?.showCatalogPanel ?? true,
              navItems: prev?.components?.fullWideSlide?.megaMenu?.navItems,
              megaConfig: prev?.components?.fullWideSlide?.megaMenu?.megaConfig,
              ...(prev?.components?.fullWideSlide?.megaMenu || {}),
              ...(megaMenuPatch || {}),
            },
            ...restPatch,
          },
        },
      };
      return next;
    });
  }, []);

  const navItems = useMemo(() => {
    const list = fullWideSlide?.megaMenu?.navItems;
    return Array.isArray(list) ? list : [];
  }, [fullWideSlide?.megaMenu?.navItems]);

  const megaConfig = useMemo(() => {
    const cfg = fullWideSlide?.megaMenu?.megaConfig;
    if (cfg && typeof cfg === 'object' && !Array.isArray(cfg)) return cfg;
    return {};
  }, [fullWideSlide?.megaMenu?.megaConfig]);

  const ensureSection = useCallback(
    (sectionId) => {
      const sid = sectionId || 'first_contact';
      const existing = megaConfig?.[sid];
      if (Array.isArray(existing) && existing.length > 0) return;

      updateFullWideSlide({
        megaMenu: {
          megaConfig: {
            ...(megaConfig || {}),
            [sid]: [{ title: '', items: [] }],
          },
        },
      });
    },
    [megaConfig, updateFullWideSlide]
  );

  useEffect(() => {
    if (!editorOpen) return;
    const sid = activeSectionId || navItems[0]?.id || 'first_contact';
    if (sid !== activeSectionId) setActiveSectionId(sid);
    ensureSection(sid);
  }, [activeSectionId, editorOpen, ensureSection, navItems]);

  const currentColumns = useMemo(() => {
    const sid = activeSectionId || navItems[0]?.id || 'first_contact';
    const cols = megaConfig?.[sid];
    return Array.isArray(cols) ? cols : [];
  }, [activeSectionId, megaConfig, navItems]);

  const currentColumn = useMemo(() => {
    const cols = currentColumns;
    const idx = Math.max(0, Math.min(activeColumnIndex, Math.max(0, cols.length - 1)));
    return cols[idx] || { title: '', items: [] };
  }, [activeColumnIndex, currentColumns]);

  useEffect(() => {
    if (!editorOpen) return;
    if (activeColumnIndex > 0 && activeColumnIndex >= currentColumns.length) {
      setActiveColumnIndex(Math.max(0, currentColumns.length - 1));
    }
  }, [activeColumnIndex, currentColumns.length, editorOpen]);

  const setNav = useCallback(
    (nextNav) => {
      updateFullWideSlide({ megaMenu: { navItems: nextNav } });
      setSaveMessage('Configuració aplicada (pendent de Save & Commit).');
    },
    [updateFullWideSlide]
  );

  const setMega = useCallback(
    (nextMega) => {
      updateFullWideSlide({ megaMenu: { megaConfig: nextMega } });
      setSaveMessage('Configuració aplicada (pendent de Save & Commit).');
    },
    [updateFullWideSlide]
  );

  const moveItem = useCallback(
    (arr, from, to) => {
      const next = [...arr];
      const clampedTo = Math.max(0, Math.min(to, next.length - 1));
      const [it] = next.splice(from, 1);
      next.splice(clampedTo, 0, it);
      return next;
    },
    []
  );

  const addNavItem = useCallback(() => {
    setEditorError('');
    const id = (newNavId || '').trim();
    const label = (newNavLabel || '').trim() || id;
    if (!id) {
      setEditorError('Cal un id per la pestanya');
      return;
    }
    if (navItems.some((n) => n?.id === id)) {
      setEditorError('Aquest id ja existeix');
      return;
    }
    const next = [...navItems, { id, label }];
    setNav(next);
    setNewNavId('');
    setNewNavLabel('');
    if (!activeSectionId) setActiveSectionId(id);
    ensureSection(id);
  }, [activeSectionId, ensureSection, navItems, newNavId, newNavLabel, setNav]);

  const removeNavItem = useCallback(
    (idx) => {
      const removed = navItems[idx];
      const next = navItems.filter((_, i) => i !== idx);
      setNav(next);
      if (removed?.id && removed.id === activeSectionId) {
        setActiveSectionId(next[0]?.id || '');
      }
    },
    [activeSectionId, navItems, setNav]
  );

  const updateNavItem = useCallback(
    (idx, patch) => {
      const prev = navItems[idx];
      const next = navItems.map((it, i) => (i === idx ? { ...(it || {}), ...(patch || {}) } : it));
      setNav(next);
      if (prev?.id && patch?.id && prev.id !== patch.id) {
        const fromId = prev.id;
        const toId = patch.id;
        const nextMega = { ...(megaConfig || {}) };
        if (nextMega[fromId] && !nextMega[toId]) {
          nextMega[toId] = nextMega[fromId];
          delete nextMega[fromId];
          setMega(nextMega);
        }
        if (activeSectionId === fromId) setActiveSectionId(toId);
      }
    },
    [activeSectionId, megaConfig, navItems, setMega, setNav]
  );

  const moveNavItem = useCallback(
    (idx, dir) => {
      const to = idx + dir;
      if (to < 0 || to >= navItems.length) return;
      setNav(moveItem(navItems, idx, to));
    },
    [moveItem, navItems, setNav]
  );

  const addColumn = useCallback(() => {
    const sid = activeSectionId || navItems[0]?.id || 'first_contact';
    const cols = Array.isArray(megaConfig?.[sid]) ? megaConfig[sid] : [];
    const nextCols = [...cols, { title: '', items: [] }];
    setMega({ ...(megaConfig || {}), [sid]: nextCols });
    setActiveColumnIndex(nextCols.length - 1);
  }, [activeSectionId, megaConfig, navItems, setMega]);

  const removeColumn = useCallback(() => {
    const sid = activeSectionId || navItems[0]?.id || 'first_contact';
    const cols = Array.isArray(megaConfig?.[sid]) ? megaConfig[sid] : [];
    if (cols.length <= 1) return;
    const nextCols = cols.filter((_, i) => i !== activeColumnIndex);
    setMega({ ...(megaConfig || {}), [sid]: nextCols });
    setActiveColumnIndex(Math.max(0, Math.min(activeColumnIndex, nextCols.length - 1)));
  }, [activeColumnIndex, activeSectionId, megaConfig, navItems, setMega]);

  const updateColumnTitle = useCallback(
    (value) => {
      const sid = activeSectionId || navItems[0]?.id || 'first_contact';
      const cols = Array.isArray(megaConfig?.[sid]) ? megaConfig[sid] : [];
      const nextCols = cols.map((c, i) => (i === activeColumnIndex ? { ...(c || {}), title: value } : c));
      setMega({ ...(megaConfig || {}), [sid]: nextCols });
    },
    [activeColumnIndex, activeSectionId, megaConfig, navItems, setMega]
  );

  const addItemToColumn = useCallback(
    (raw) => {
      const text = (raw || '').trim();
      if (!text) return;
      const sid = activeSectionId || navItems[0]?.id || 'first_contact';
      const cols = Array.isArray(megaConfig?.[sid]) ? megaConfig[sid] : [];
      const col = cols[activeColumnIndex] || { title: '', items: [] };
      const items = Array.isArray(col.items) ? col.items : [];
      const nextItems = [...items, text];
      const nextCols = cols.map((c, i) => (i === activeColumnIndex ? { ...(c || {}), items: nextItems } : c));
      setMega({ ...(megaConfig || {}), [sid]: nextCols });
      setNewItemText('');
    },
    [activeColumnIndex, activeSectionId, megaConfig, navItems, setMega]
  );

  const removeItemFromColumn = useCallback(
    (idx) => {
      const sid = activeSectionId || navItems[0]?.id || 'first_contact';
      const cols = Array.isArray(megaConfig?.[sid]) ? megaConfig[sid] : [];
      const col = cols[activeColumnIndex] || { title: '', items: [] };
      const items = Array.isArray(col.items) ? col.items : [];
      const nextItems = items.filter((_, i) => i !== idx);
      const nextCols = cols.map((c, i) => (i === activeColumnIndex ? { ...(c || {}), items: nextItems } : c));
      setMega({ ...(megaConfig || {}), [sid]: nextCols });
    },
    [activeColumnIndex, activeSectionId, megaConfig, navItems, setMega]
  );

  const updateItemInColumn = useCallback(
    (idx, value) => {
      const sid = activeSectionId || navItems[0]?.id || 'first_contact';
      const cols = Array.isArray(megaConfig?.[sid]) ? megaConfig[sid] : [];
      const col = cols[activeColumnIndex] || { title: '', items: [] };
      const items = Array.isArray(col.items) ? col.items : [];
      const nextItems = items.map((it, i) => (i === idx ? value : it));
      const nextCols = cols.map((c, i) => (i === activeColumnIndex ? { ...(c || {}), items: nextItems } : c));
      setMega({ ...(megaConfig || {}), [sid]: nextCols });
    },
    [activeColumnIndex, activeSectionId, megaConfig, navItems, setMega]
  );

  const moveItemInColumn = useCallback(
    (idx, dir) => {
      const sid = activeSectionId || navItems[0]?.id || 'first_contact';
      const cols = Array.isArray(megaConfig?.[sid]) ? megaConfig[sid] : [];
      const col = cols[activeColumnIndex] || { title: '', items: [] };
      const items = Array.isArray(col.items) ? col.items : [];
      const to = idx + dir;
      if (to < 0 || to >= items.length) return;
      const nextItems = moveItem(items, idx, to);
      const nextCols = cols.map((c, i) => (i === activeColumnIndex ? { ...(c || {}), items: nextItems } : c));
      setMega({ ...(megaConfig || {}), [sid]: nextCols });
    },
    [activeColumnIndex, activeSectionId, megaConfig, moveItem, navItems, setMega]
  );

  const canCommit = useMemo(() => {
    try {
      return import.meta.env.DEV;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const el = dockBarRef.current;
    if (!el) return undefined;

    const update = () => {
      try {
        const h = el.offsetHeight;
        if (!Number.isFinite(h) || h <= 0) return;
        document.documentElement.style.setProperty('--copyrightFooterHeight', `${Math.round(h)}px`);
      } catch {
        // ignore
      }
    };

    update();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    }

    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      try {
        ro?.disconnect?.();
      } catch {
        // ignore
      }
      try {
        document.documentElement.style.removeProperty('--copyrightFooterHeight');
      } catch {
        // ignore
      }
    };
  }, []);

  const saveAndCommit = useCallback(async () => {
    setError('');
    setSaveMessage('');
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const nextConfig = {
        ...(config || {}),
        version: config?.version ?? 1,
        components: {
          ...(config?.components || {}),
          fullWideSlide: {
            ...(config?.components?.fullWideSlide || {}),
            updatedAt: now,
          },
        },
      };

      const message = `chore(catalog): fullWideSlide ${nextConfig.components.fullWideSlide.enabled ? 'ON' : 'OFF'} ${nextConfig.components.fullWideSlide.iteration || ''}`.trim();

      const res = await fetch(`/${'__dev'}/component-catalog?commit=1&message=${encodeURIComponent(message)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextConfig),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Error guardant (${res.status})`);
      }

      setConfig(nextConfig);
      setSaveMessage('Guardat i commitejat.');
    } catch (e) {
      setError(e?.message || 'Error guardant');
    } finally {
      setSaving(false);
    }
  }, [config]);

  return (
    <div
      className="w-full overflow-hidden bg-background"
      style={{ height: 'calc(100vh - var(--appHeaderOffset, 0px) - var(--copyrightFooterHeight, 0px))' }}
    >
      <div className="h-full w-full p-[100px]">
        <div ref={frameRef} className="relative h-full w-full border-4 border-border bg-background overflow-hidden">
          {fullWideSlide?.enabled ? (
            <FullWideSlideHeaderMegaMenuContained
              portalContainer={frameRef.current}
              navItems={resolvedNavItems}
              megaConfig={resolvedMegaConfig}
              showStripe={fullWideSlide?.megaMenu?.showStripe !== false}
              showCatalogPanel={fullWideSlide?.megaMenu?.showCatalogPanel !== false}
            />
          ) : (
            <div className="h-full p-6">
              <div className="h-full rounded-md border border-border bg-muted/40 p-6">
                <div className="text-sm font-semibold text-foreground/80">Desactivat</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Aquest component està OFF segons el catàleg.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-[30000] border-t border-border bg-background">
        <div ref={dockBarRef} className="w-full px-4 sm:px-6 lg:px-10 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">FULLWIDESLIDE</div>

            <button
              type="button"
              onClick={() => updateFullWideSlide({ enabled: !fullWideSlide?.enabled })}
              className={`h-9 px-3 rounded-md border text-sm font-semibold ${fullWideSlide?.enabled ? 'bg-foreground text-background border-foreground' : 'bg-background text-foreground border-border'}`}
              disabled={loading || saving}
              title="Activa/desactiva el component (ON/OFF)"
            >
              {fullWideSlide?.enabled ? 'ON' : 'OFF'}
            </button>

            <input
              value={fullWideSlide?.iteration || ''}
              onChange={(e) => updateFullWideSlide({ iteration: e.target.value })}
              className="h-9 w-[100px] rounded-md border border-border bg-background px-2 text-sm"
              placeholder="v1"
              disabled={loading || saving}
              title="Iteració (etiqueta) del component"
            />

            <button
              type="button"
              onClick={refresh}
              disabled={loading || saving}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm hover:bg-muted/60 disabled:opacity-50"
              title="Recarrega la configuració del fitxer component-catalog.config.json"
            >
              Recarrega
            </button>

            <button
              type="button"
              onClick={saveAndCommit}
              disabled={!canCommit || loading || saving}
              className="h-9 rounded-md border border-border bg-muted px-3 text-sm font-semibold hover:bg-muted/70 disabled:opacity-50"
              title="Guarda la configuració i fa commit (només en DEV)"
            >
              {saving ? 'Guardant…' : 'Save & Commit'}
            </button>

            <button
              type="button"
              onClick={() => setEditorOpen((v) => !v)}
              disabled={loading || saving}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border bg-background text-lg hover:bg-muted/60 disabled:opacity-50"
              title={editorOpen ? 'Tanca l’editor' : 'Obre l’editor'}
            >
              {editorOpen ? '×' : '≡'}
            </button>
          </div>
        </div>
      </footer>

      {editorOpen ? (
        <div
          className="fixed right-4 z-[30001]"
          style={{ bottom: 'calc(var(--copyrightFooterHeight, 0px) + 16px)' }}
        >
          <div
            className="w-[min(560px,calc(100vw-32px))] overflow-hidden rounded-lg border border-border bg-background shadow-lg"
            style={{ maxHeight: 'calc(100vh - var(--appHeaderOffset, 0px) - var(--copyrightFooterHeight, 0px) - 32px)' }}
          >
            <div ref={editorPanelScrollRef} className="grid gap-3 overflow-y-auto p-3">
              <div className="sticky top-0 z-10 bg-background pb-3">
                <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateFullWideSlide({ megaMenu: { showStripe: !(fullWideSlide?.megaMenu?.showStripe !== false) } })}
                  disabled={loading || saving}
                  className={`h-9 rounded-md border px-3 text-sm font-semibold ${fullWideSlide?.megaMenu?.showStripe !== false ? 'bg-foreground text-background border-foreground' : 'bg-background text-foreground border-border'}`}
                  title="Mostra/amaga l’stripe de colors"
                >
                  Stripe
                </button>
                <button
                  type="button"
                  onClick={() => updateFullWideSlide({ megaMenu: { showCatalogPanel: !(fullWideSlide?.megaMenu?.showCatalogPanel !== false) } })}
                  disabled={loading || saving}
                  className={`h-9 rounded-md border px-3 text-sm font-semibold ${fullWideSlide?.megaMenu?.showCatalogPanel !== false ? 'bg-foreground text-background border-foreground' : 'bg-background text-foreground border-border'}`}
                  title="Mostra/amaga el panell de catàleg"
                >
                  Catàleg panel
                </button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-border bg-muted/20 p-2">
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">PREVIEW STRIPE</div>
                    {fullWideSlide?.megaMenu?.showStripe !== false ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Array.from({ length: 14 }).map((_, i) => (
                          <div key={`stripe-ph-${i}`} className="h-3 w-3 rounded-sm bg-muted" />
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 h-3 w-full rounded-sm bg-muted/40" />
                    )}
                  </div>

                  <div className="rounded-md border border-border bg-muted/20 p-2">
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">PREVIEW CATÀLEG</div>
                    {fullWideSlide?.megaMenu?.showCatalogPanel !== false ? (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <div className="h-8 rounded-md bg-muted" />
                        <div className="h-8 rounded-md bg-muted" />
                        <div className="h-8 rounded-md bg-muted" />
                      </div>
                    ) : (
                      <div className="mt-2 h-8 w-full rounded-md bg-muted/40" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="grid gap-2 rounded-md border border-border bg-background p-2">
                  <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">NAV</div>

                  {navItems.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground">Encara no hi ha pestanyes. Afegeix-ne una.</div>
                  ) : (
                    <div className="grid gap-2">
                      {navItems.map((it, idx) => (
                        <div key={`${it?.id || 'nav'}-${idx}`} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                          <input
                            value={it?.id || ''}
                            onChange={(e) => updateNavItem(idx, { id: e.target.value })}
                            className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                            placeholder="id"
                          />
                          <input
                            value={it?.label || ''}
                            onChange={(e) => updateNavItem(idx, { label: e.target.value })}
                            className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                            placeholder="label"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setActiveSectionId(it?.id || '')}
                              className={`h-9 px-2 rounded-md border text-sm ${activeSectionId === it?.id ? 'bg-foreground text-background border-foreground' : 'bg-background border-border'}`}
                              title="Edita aquesta secció del mega-menu"
                            >
                              Edita
                            </button>
                            <button
                              type="button"
                              onClick={() => moveNavItem(idx, -1)}
                              className="h-9 px-2 rounded-md border border-border bg-background text-sm"
                              title="Puja aquesta pestanya"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveNavItem(idx, 1)}
                              className="h-9 px-2 rounded-md border border-border bg-background text-sm"
                              title="Baixa aquesta pestanya"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeNavItem(idx)}
                              className="h-9 px-2 rounded-md border border-border bg-background text-sm"
                              title="Elimina aquesta pestanya"
                            >
                              X
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input
                      value={newNavId}
                      onChange={(e) => setNewNavId(e.target.value)}
                      className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                      placeholder="nou id"
                    />
                    <input
                      value={newNavLabel}
                      onChange={(e) => setNewNavLabel(e.target.value)}
                      className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                      placeholder="nou label"
                    />
                    <button
                      type="button"
                      onClick={addNavItem}
                      className="h-9 px-3 rounded-md border border-border bg-muted text-sm font-semibold hover:bg-muted/70"
                      title="Afegeix una pestanya nova"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 rounded-md border border-border bg-background p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">MEGA</div>
                    <button
                      type="button"
                      onClick={() => setAdvancedOpen((v) => !v)}
                      className="h-8 px-2 rounded-md border border-border bg-background text-xs hover:bg-muted/60"
                      title="Mostra opcions avançades (JSON)"
                    >
                      {advancedOpen ? 'Tanca avançat' : 'Avançat'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <div className="text-[11px] text-muted-foreground">Secció</div>
                      <select
                        value={activeSectionId || ''}
                        onChange={(e) => setActiveSectionId(e.target.value)}
                        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                      >
                        {(navItems.length ? navItems : [{ id: 'first_contact', label: 'First Contact' }]).map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.label || n.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-1">
                      <div className="text-[11px] text-muted-foreground">Columna</div>
                      <select
                        value={String(activeColumnIndex)}
                        onChange={(e) => setActiveColumnIndex(parseInt(e.target.value || '0', 10) || 0)}
                        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                      >
                        {currentColumns.map((c, i) => (
                          <option key={`${activeSectionId}-col-${i}`} value={String(i)}>
                            {`Col ${i + 1}${c?.title ? ` · ${c.title}` : ''}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addColumn}
                      className="h-9 px-3 rounded-md border border-border bg-muted text-sm font-semibold hover:bg-muted/70"
                      title="Afegeix una columna a la secció"
                    >
                      + Columna
                    </button>
                    <button
                      type="button"
                      onClick={removeColumn}
                      disabled={currentColumns.length <= 1}
                      className="h-9 px-3 rounded-md border border-border bg-background text-sm disabled:opacity-50"
                      title="Elimina la columna actual"
                    >
                      - Columna
                    </button>
                  </div>

                  <div className="grid gap-1">
                    <div className="text-[11px] text-muted-foreground">Títol columna</div>
                    <input
                      value={currentColumn?.title || ''}
                      onChange={(e) => updateColumnTitle(e.target.value)}
                      className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                      placeholder="(opcional)"
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="text-[11px] text-muted-foreground">Items</div>
                    <div className="grid gap-2">
                      {(Array.isArray(currentColumn?.items) ? currentColumn.items : []).map((it, idx) => (
                        <div key={`${activeSectionId}-${activeColumnIndex}-it-${idx}`} className="grid grid-cols-[1fr_auto] gap-2 items-center">
                          <input
                            value={it}
                            onChange={(e) => updateItemInColumn(idx, e.target.value)}
                            className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveItemInColumn(idx, -1)}
                              className="h-9 px-2 rounded-md border border-border bg-background text-sm"
                              title="Puja l’item"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItemInColumn(idx, 1)}
                              className="h-9 px-2 rounded-md border border-border bg-background text-sm"
                              title="Baixa l’item"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItemFromColumn(idx)}
                              className="h-9 px-2 rounded-md border border-border bg-background text-sm"
                              title="Elimina l’item"
                            >
                              X
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addItemToColumn('botonera-bn')}
                        className="h-9 px-3 rounded-md border border-border bg-background text-sm"
                        title="Afegeix el control BN (blanc/negre)"
                      >
                        + BN
                      </button>
                      <button
                        type="button"
                        onClick={() => addItemToColumn('botonera-fletxes')}
                        className="h-9 px-3 rounded-md border border-border bg-background text-sm"
                        title="Afegeix el control de fletxes"
                      >
                        + Fletxes
                      </button>
                      <input
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        className="h-9 flex-1 min-w-[160px] rounded-md border border-border bg-background px-2 text-sm"
                        placeholder="nou item (p. ex. NX-01)"
                      />
                      <button
                        type="button"
                        onClick={() => addItemToColumn(newItemText)}
                        className="h-9 px-3 rounded-md border border-border bg-muted text-sm font-semibold hover:bg-muted/70"
                        title="Afegeix un item a la columna"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {advancedOpen ? (
                    <div className="grid gap-2">
                      <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">AVANÇAT (JSON)</div>
                      <textarea
                        value={advancedText}
                        onChange={(e) => setAdvancedText(e.target.value)}
                        className="h-[220px] w-full resize-y rounded-md border border-border bg-background p-2 font-mono text-[11px] leading-4"
                        spellCheck={false}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditorError('');
                          try {
                            const parsed = JSON.parse(advancedText || '{}');
                            const parsedNav = parsed?.navItems;
                            const parsedMega = parsed?.megaConfig;
                            if (!Array.isArray(parsedNav)) throw new Error('navItems ha de ser un array');
                            if (!parsedMega || typeof parsedMega !== 'object' || Array.isArray(parsedMega)) throw new Error('megaConfig ha de ser un objecte');
                            updateFullWideSlide({ megaMenu: { navItems: parsedNav, megaConfig: parsedMega } });
                            setSaveMessage('Configuració aplicada (pendent de Save & Commit).');
                          } catch (e) {
                            setEditorError(e?.message || 'JSON invàlid');
                          }
                        }}
                        className="h-9 w-fit px-3 rounded-md border border-border bg-muted text-sm font-semibold hover:bg-muted/70"
                        title="Aplica el JSON avançat a la configuració"
                      >
                        Aplica JSON avançat
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground">Desa amb Save & Commit.</div>
              {!!editorError && <div className="text-[11px] text-destructive">{editorError}</div>}
              {!!error && <div className="text-[11px] text-destructive">{error}</div>}
              {!!saveMessage && <div className="text-[11px] text-foreground/80">{saveMessage}</div>}
              {loading && <div className="text-[11px] text-muted-foreground">Carregant config…</div>}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
