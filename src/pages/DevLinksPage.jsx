import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function DevLinksPage() {
  const location = useLocation();
  const [selectedByPath, setSelectedByPath] = useState({});
  const [copyStatus, setCopyStatus] = useState('idle');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('devLinks:selectedByPath');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') setSelectedByPath(parsed);
    } catch {
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('devLinks:selectedByPath', JSON.stringify(selectedByPath));
    } catch {
    }
  }, [selectedByPath]);

  const getTagsForPath = (path, groupTitle, manualTags = []) => {
    const tags = new Set(manualTags);
    const p = String(path || '');

    if (groupTitle === 'Demos') tags.add('DEMO');
    if (groupTitle === 'Admin') tags.add('ADMIN');
    if (groupTitle === 'Utility') tags.add('UTIL');

    if (p.includes('/tmp')) tags.add('TMP');
    if (p.includes('dev')) tags.add('DEV');
    if (p.startsWith('/admin')) tags.add('ADMIN');

    return Array.from(tags);
  };

  const badgeClassByTag = {
    ADMIN: 'border-orange-500/30 bg-orange-500/10 text-orange-800',
    DEMO: 'border-[#337AC6]/35 bg-[#337AC6]/10 text-[#0f172a]',
    DEV: 'border-violet-500/30 bg-violet-500/10 text-violet-800',
    TMP: 'border-amber-500/30 bg-amber-500/10 text-amber-800',
    UTIL: 'border-slate-500/25 bg-slate-500/10 text-slate-800',
    WIP: 'border-red-500/30 bg-red-500/10 text-red-800',
    LEGACY: 'border-border bg-muted text-muted-foreground',
  };

  const pickPrimaryTag = (tags) => {
    const order = ['ADMIN', 'DEMO', 'DEV', 'UTIL', 'WIP', 'TMP', 'LEGACY'];
    const set = new Set(Array.isArray(tags) ? tags : []);
    for (const t of order) {
      if (set.has(t)) return t;
    }
    return Array.isArray(tags) && tags.length ? tags[0] : '';
  };

  const getTagTextClass = (tag) => {
    const raw = badgeClassByTag[tag] || '';
    const cls = raw.split(' ').find((c) => c.startsWith('text-'));
    return cls || 'text-muted-foreground';
  };

  const groups = useMemo(
    () => [
      {
        title: 'Demos',
        items: [
          { path: '/adidas-demo', label: 'Adidas Demo' },
          { path: '/adidas-stripe-zoom-dev', label: 'Adidas Stripe Zoom Dev' },
          { path: '/nike-hero-demo', label: 'Nike Hero Demo' },
          { path: '/nike-tambe', label: 'Nike: També et pot agradar' },
        ],
      },
      {
        title: 'Admin',
        items: [
          { path: '/admin-login', label: 'Admin Login' },
          { path: '/admin', label: 'Admin Studio' },
          { path: '/admin/demos', label: 'Admin Demos' },
          { path: '/admin/index', label: 'Admin Index' },
          { path: '/admin/ec-config', label: 'Admin EC Config' },
          { path: '/admin/media', label: 'Admin Media' },
          { path: '/admin/visual-optimizer', label: 'Admin Visual Optimizer' },
          { path: '/admin/collections', label: 'Admin Collections' },
          { path: '/admin/mockups', label: 'Admin Mockups' },
          { path: '/admin/upload', label: 'Admin Upload' },
          { path: '/admin/gelato-sync', label: 'Admin Gelato Sync' },
          { path: '/admin/gelato-blank', label: 'Admin Gelato Blank Products' },
          { path: '/admin/gelato-templates', label: 'Admin Gelato Templates' },
          { path: '/admin/products-overview', label: 'Admin Products Overview' },
          { path: '/admin/hero', label: 'Admin Hero Settings' },
          { path: '/admin/apps', label: 'Admin Apps' },
          { path: '/admin/documentation', label: 'Admin Documentation' },
          { path: '/admin/fulfillment', label: 'Admin Fulfillment' },
          { path: '/admin/fulfillment-settings', label: 'Admin Fulfillment Settings' },
          { path: '/admin/system-messages', label: 'Admin System Messages' },
          { path: '/admin/promotions', label: 'Admin Promotions' },
        ],
      },
      {
        title: 'Utility',
        items: [
          { path: '/', label: 'Home' },
          { path: '/new', label: 'New' },
          { path: '/cart', label: 'Cart' },
          { path: '/checkout', label: 'Checkout' },
          { path: '/wishlist', label: 'Wishlist' },
          { path: '/profile', label: 'Profile' },
          { path: '/search', label: 'Search' },
          { path: '/layout-builder', label: 'Layout Builder' },
          { path: '/ec-preview-lite', label: 'EC Preview' },
          { path: '/user-icon-picker', label: 'User Icon Picker' },
          { path: '/documentation-files', label: 'Documentation Files' },
        ],
      },
    ],
    []
  );

  const allPaths = useMemo(() => groups.flatMap((g) => g.items.map((i) => i.path)), [groups]);
  const selectedPaths = useMemo(
    () => allPaths.filter((p) => selectedByPath[p]),
    [allPaths, selectedByPath]
  );

  const setAllSelected = (nextValue) => {
    setSelectedByPath(() => {
      const next = {};
      for (const p of allPaths) next[p] = nextValue;
      return next;
    });
  };

  const toggleSelected = (path) => {
    setSelectedByPath((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const copySelected = async () => {
    const text = selectedPaths.join('\n');
    if (!text) {
      setCopyStatus('empty');
      window.setTimeout(() => setCopyStatus('idle'), 900);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('ok');
      window.setTimeout(() => setCopyStatus('idle'), 900);
    } catch {
      setCopyStatus('err');
      window.setTimeout(() => setCopyStatus('idle'), 900);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-background">
      <SEO title="Dev links" description="Índex d'enllaços ràpids" />

      <div className="mx-auto w-full px-4 pt-[25px] pb-3">
        <div className="flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{selectedPaths.length}</span>/{allPaths.length}
              <span className="ml-1">seleccionats</span>
            </div>
            <button
              type="button"
              className="border-b border-transparent px-2 py-1 text-xs font-semibold text-foreground/80 hover:border-border"
              onClick={() => setAllSelected(true)}
            >
              Seleccioneu-ho tot
            </button>
            <button
              type="button"
              className="border-b border-transparent px-2 py-1 text-xs font-semibold text-foreground/80 hover:border-border"
              onClick={() => setAllSelected(false)}
            >
              Netegeu
            </button>
            <button
              type="button"
              className="border-b border-transparent px-2 py-1 text-xs font-semibold text-foreground hover:border-border"
              onClick={copySelected}
            >
              Copieu ítems
            </button>

            {copyStatus !== 'idle' && (
              <div className="text-xs font-semibold text-muted-foreground">
                {copyStatus === 'ok' && 'Copiat'}
                {copyStatus === 'empty' && 'No hi ha selecció'}
                {copyStatus === 'err' && 'Error copiant'}
              </div>
            )}
          </div>
        </div>

        <div className="mt-[25px] grid grid-cols-1 gap-6 md:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <div className="text-center">
                <div className="text-sm font-semibold text-foreground">
                  {group.title}
                  <span className="mx-2 text-muted-foreground/40">·</span>
                  <span className="text-[11px] font-semibold text-muted-foreground">{group.items.length}</span>
                </div>
              </div>

              <div className="mt-2 flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = location.pathname === item.path;
                  const tags = getTagsForPath(item.path, group.title, item.tags);
                  const selected = !!selectedByPath[item.path];
                  const primaryTag = pickPrimaryTag(tags);
                  return (
                    <div
                      key={item.path}
                      className={`grid items-center gap-x-3 gap-y-1 py-1 ${
                        active ? 'text-foreground' : 'text-foreground/75 hover:text-foreground'
                      }`}
                      style={{ gridTemplateColumns: 'minmax(160px,1fr) 56px 28px minmax(200px,1.2fr)' }}
                    >
                      <div className="min-w-0 text-right font-mono text-[11px] text-muted-foreground truncate" title={item.path}>
                        {item.path}
                      </div>

                      <div className={`justify-self-center text-center text-[10px] font-semibold ${getTagTextClass(primaryTag)}`}>
                        {primaryTag || ''}
                      </div>

                      <label
                        className="flex h-7 w-7 cursor-pointer items-center justify-center text-muted-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        aria-label={selected ? 'Desmarqueu' : 'Marqueu'}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSelected(item.path);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="h-4 w-4"
                        />
                      </label>

                      <Link to={item.path} className="min-w-0">
                        <div className="min-w-0 truncate text-sm font-medium">{item.label}</div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
