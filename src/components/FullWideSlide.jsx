import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';

function normalizeText(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function groupFilter(groups, query) {
  const q = normalizeText(query).trim();
  if (!q) return groups;
  return groups
    .map((g) => {
      const items = (g.items || []).filter((it) => {
        const label = typeof it.label === 'string' ? it.label : '';
        const hay = normalizeText(`${label} ${it.path || ''}`);
        return hay.includes(q);
      });
      return { ...g, items };
    })
    .filter((g) => (g.items || []).length > 0);
}

function MenuSection({ title, items, onNavigate }) {
  const resolvedTitle = title && typeof title === 'object'
    ? title
    : { label: title, path: undefined };

  return (
    <div className="border-l border-border">
      <div className="pl-3 pr-4 text-xs font-semibold text-foreground uppercase tracking-wide">
        {resolvedTitle?.path ? (
          <Link to={resolvedTitle.path} onClick={onNavigate} className="hover:underline">
            {resolvedTitle.label}
          </Link>
        ) : (
          resolvedTitle.label
        )}
      </div>
      <div className="mt-2">
        {items.map((it) => (
          <Link
            key={it.path}
            to={it.path}
            title={it.path}
            onClick={onNavigate}
            className="flex items-start gap-3 pl-3 pr-4 py-2 text-sm font-light text-foreground hover:bg-muted/60"
          >
            <span className="min-w-0 flex-1 whitespace-normal break-words text-left">{it.label}</span>
            <span className="mt-0.5 text-xs text-muted-foreground">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function FullWideSlide({
  className = '',
  sections,
  triggerLabel = 'Obrir',
  openAriaLabel = 'Obrir',
  overlayAriaLabel = 'Tancar',
  title,
  subtitle,
  layout = 'full',
  defaultOpen = false,
  showTrigger = true,
  showSearch = true,
  searchPlaceholder = 'Cerca...',
  children,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const resolvedSections = useMemo(() => sections || [], [sections]);
  const filtered = useMemo(() => groupFilter(resolvedSections, query), [resolvedSections, query]);
  const hasHeader = Boolean(title) || Boolean(subtitle);
  const hasContent = Boolean(children) || filtered.length > 0;

  const isMega = layout === 'mega';
  const panelTop = isMega ? 'var(--appHeaderOffset, 0px)' : 'calc(var(--appHeaderOffset, 0px) + 24px)';
  const panelMaxHeight = isMega
    ? 'calc(100vh - var(--appHeaderOffset, 0px))'
    : 'calc(100vh - var(--appHeaderOffset, 0px) - 48px)';
  const panelClassName = isMega
    ? 'w-full border-b border-border bg-background shadow-none'
    : 'w-full rounded-lg border border-border bg-background shadow-xl';
  const contentClassName = isMega ? 'mx-auto max-w-[1400px] overflow-x-hidden px-4 sm:px-6 lg:px-10 py-8' : 'p-4';

  return (
    <div className={className}>
      {showTrigger ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            onClick={() => setOpen(true)}
            aria-label={openAriaLabel}
          >
            <Menu className="h-4 w-4" />
            {triggerLabel}
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[30000]">
          <button
            type="button"
            className={isMega ? 'absolute inset-0 bg-foreground/25' : 'absolute inset-0 bg-foreground/30'}
            onClick={close}
            aria-label={overlayAriaLabel}
          />

          <div className="absolute left-0 right-0" style={{ top: panelTop }}>
            <div className={`${panelClassName} overflow-y-auto`} style={{ maxHeight: panelMaxHeight }}>
              {hasHeader ? (
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  {title ? <div className="text-sm font-semibold text-foreground">{title}</div> : null}
                  {subtitle ? <div className="text-xs text-muted-foreground">{subtitle}</div> : null}
                </div>

                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
                  onClick={close}
                  aria-label="Tancar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-end border-b border-border px-4 py-3">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted"
                  onClick={close}
                  aria-label="Tancar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {showSearch && !children ? (
              <div className="px-4 py-3 border-b border-border">
                <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </label>
              </div>
            ) : null}

            <div className={contentClassName}>
              {children ? (
                children
              ) : hasContent ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((g) => (
                    <MenuSection key={g.title} title={g.title} items={g.items} onNavigate={close} />
                  ))}
                </div>
              ) : null}
            </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
