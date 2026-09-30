import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { PAGES_MANIFEST, GROUPS, TAG_COLORS } from '@/dev/pagesManifest';

const VIEWPORT_W = 1280;
const VIEWPORT_H = 800;
// Hard cap on auto-measured iframe height. Pages whose body keeps growing
// (e.g. layouts with min-height:100vh that loop back into our measurement)
// stop here, so only those visualisations are clipped.
const MAX_AUTO_H = 6000;

function ThumbCard({ page, targetH, forcedScale, onContentHeight, forceLoad, viewMode, snapshot }) {
  const ref = useRef(null);
  const iframeRef = useRef(null);
  const roRef = useRef(null);
  const [seen, setSeen] = useState(false);
  const hasFixedHeight = typeof page.fixedHeight === 'number' && page.fixedHeight > 0;
  const useSnapshot = viewMode === 'snapshot' && !!snapshot;
  const [liveContentH, setLiveContentH] = useState(hasFixedHeight ? page.fixedHeight : VIEWPORT_H);
  const contentH = useSnapshot ? snapshot.height : liveContentH;
  const loaded = forceLoad || seen;

  // Report snapshot height up so the global scale takes it into account.
  useEffect(() => {
    if (useSnapshot && typeof onContentHeight === 'function') {
      onContentHeight(snapshot.height);
    }
  }, [useSnapshot, snapshot, onContentHeight]);

  useEffect(() => {
    if (forceLoad || seen || !ref.current) return undefined;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSeen(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [forceLoad, seen]);

  const measure = () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;
      const h = Math.max(
        doc.body?.scrollHeight || 0,
        doc.documentElement?.scrollHeight || 0,
      );
      if (h <= 0) return;
      const clamped = Math.min(MAX_AUTO_H, Math.max(VIEWPORT_H, h));
      // If we've hit the cap, stop observing further growth on this iframe
      // so we don't keep churning on a runaway page.
      if (h >= MAX_AUTO_H) {
        try { roRef.current?.disconnect(); } catch { /* ignore */ }
        roRef.current = null;
      }
      setLiveContentH(clamped);
      if (typeof onContentHeight === 'function') onContentHeight(clamped);
    } catch {
      // cross-origin or not ready
    }
  };

  const handleLoad = () => {
    if (hasFixedHeight) {
      if (typeof onContentHeight === 'function') onContentHeight(page.fixedHeight);
      return;
    }
    measure();
    // late re-measures for content that lays out after first paint
    setTimeout(measure, 300);
    setTimeout(measure, 1200);
    try {
      roRef.current?.disconnect();
      const body = iframeRef.current?.contentDocument?.body;
      if (body && typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => measure());
        ro.observe(body);
        roRef.current = ro;
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    return () => {
      try {
        roRef.current?.disconnect();
      } catch {
        // ignore
      }
    };
  }, []);

  const scale = forcedScale != null
    ? forcedScale
    : Math.min(1, Math.max(0.05, targetH / Math.max(contentH, 1)));
  const outerW = Math.round(VIEWPORT_W * scale);
  const outerH = Math.round(contentH * scale);
  const tagColor = TAG_COLORS[page.tag] || '#64748b';

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: '#ffffff',
        border: '1px solid hsl(var(--grey-line))',
        borderRadius: 10,
        padding: 10,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          width: outerW,
          height: outerH,
          overflow: 'hidden',
          position: 'relative',
          background: '#f8fafc',
          borderRadius: 6,
          border: '1px solid hsl(var(--grey-line))',
        }}
      >
        {loaded && useSnapshot ? (
          <img
            src={snapshot.src}
            alt={page.label}
            style={{
              width: snapshot.width,
              height: snapshot.height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              display: 'block',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        ) : loaded ? (
          <iframe
            ref={iframeRef}
            src={`${page.path}${page.path.includes('?') ? '&' : '?'}embed=contact-sheet`}
            title={page.label}
            onLoad={handleLoad}
            style={{
              width: VIEWPORT_W,
              height: contentH,
              border: 0,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              pointerEvents: 'none',
            }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontSize: 11,
              fontFamily: 'ui-monospace, Menlo, monospace',
            }}
          >
            …
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <span
          title={page.tag}
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: tagColor,
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {page.label}
          </div>
          <div
            style={{
              fontSize: 10,
              color: '#64748b',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'ui-monospace, Menlo, monospace',
            }}
          >
            {page.path}
          </div>
        </div>
        <a
          href={page.path}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 10,
            color: '#2563eb',
            textDecoration: 'none',
            border: '1px solid hsl(var(--grey-line-strong))',
            padding: '2px 6px',
            borderRadius: 4,
            flexShrink: 0,
          }}
        >
          obre
        </a>
      </div>
    </div>
  );
}

function ContactSheetPage() {
  const [targetH, setTargetH] = useState(1130);
  const [query, setQuery] = useState('');
  const [activeGroups, setActiveGroups] = useState(() => new Set(GROUPS));
  const [forceLoadAll, setForceLoadAll] = useState(false);
  const [refMeasure, setRefMeasure] = useState({ path: null, height: null });
  const [mode, setMode] = useState('continuous'); // 'continuous' | 'per-category'
  const [viewMode, setViewMode] = useState('live'); // 'snapshot' | 'live'
  const [snapshotIndex, setSnapshotIndex] = useState(null); // { generatedAt, pages: { path: { src, width, height } } }
  const [snapshotError, setSnapshotError] = useState(null);

  // ---- LES DUES EINES DEL CONTACT SHEET (01/10/2026) ----------------------
  //
  // 1) MEGASLIDE A TOTES: obre el megaslide a totes les iframes alhora, per
  //    revisar una cosa (un color, un espaiat) a totes les pantalles de cop.
  //    Fa servir el parametre `?active=` de la propia app (el que llegeix
  //    `useUrlActiveCollection`): es canvia la URL de cada iframe i se li
  //    dispareta un `popstate`, que es com React Router se n'enterа. Si la
  //    finestra no es pot tocar, es recarrega l'iframe amb el parametre.
  // 2) CAPTURA LES ACTIVES: demana al servidor de desenvolupament que executi
  //    el guio de sempre (`scripts/contact-sheet-capture.mjs`) nome's amb les
  //    pantalles que es veuen ara, i despres recarrega l'index de snapshots.
  const COLLECCIO_MEGASLIDE = 'first_contact';
  const [megaATotes, setMegaATotes] = useState(false);
  const [capturant, setCapturant] = useState(false);
  const [capturaMsg, setCapturaMsg] = useState(null);

  const canviaMegaslideIframes = useCallback((obrir) => {
    const marcs = [...document.querySelectorAll('iframe')];
    let fets = 0;
    for (const marc of marcs) {
      try {
        const win = marc.contentWindow;
        if (!win || !win.location) throw new Error('sense finestra');
        const u = new URL(win.location.href);
        if (obrir) {
          // OBRIR: n'hi ha prou amb la URL. `useUrlActiveCollection` escolta
          // `?active=` i encen el megaslide sense recarregar la pagina.
          //
          // Si el parametre JA hi es pero el megaslide pot estar tancat (s'ha
          // tancat amb un clic, i la URL s'hi queda), cal recarregar: un
          // `popstate` amb la mateixa URL no fa res.
          if (u.searchParams.get('active') === COLLECCIO_MEGASLIDE) {
            marc.setAttribute('src', `${u.pathname}${u.search}${u.hash}`);
          } else {
            u.searchParams.set('active', COLLECCIO_MEGASLIDE);
            const desti = `${u.pathname}${u.search}${u.hash}`;
            win.history.replaceState({}, '', desti);
            win.dispatchEvent(new win.PopStateEvent('popstate'));
          }
        } else {
          // TANCAR: treure el parametre NO el tanca (l'estic de dins es queda
          // encès), aixi que es clica la capa que l'atrapa —la mateixa que
          // tanca el megaslide quan es clica fora— i, si no hi es, es recarrega
          // l'iframe sense el parametre.
          const doc = win.document;
          const capa = [...doc.querySelectorAll('div')].find((el) => typeof el.className === 'string' && el.className.includes('z-[9989]'));
          if (capa) capa.click();
          else {
            u.searchParams.delete('active');
            marc.setAttribute('src', `${u.pathname}${u.search}${u.hash}`);
          }
        }
        fets += 1;
      } catch {
        try {
          const u = new URL(marc.getAttribute('src') || '/', window.location.origin);
          if (obrir) u.searchParams.set('active', COLLECCIO_MEGASLIDE);
          else u.searchParams.delete('active');
          marc.setAttribute('src', u.toString());
          fets += 1;
        } catch { /* ignore */ }
      }
    }
    setMegaATotes(obrir);
    return fets;
  }, []);


  useEffect(() => {
    let cancelled = false;
    fetch('/contact-sheet/index.json', { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        setSnapshotIndex(json);
        setSnapshotError(null);
        setViewMode('snapshot');
      })
      .catch((err) => {
        if (cancelled) return;
        setSnapshotIndex(null);
        setSnapshotError(err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PAGES_MANIFEST.filter((p) => {
      if (!activeGroups.has(p.group)) return false;
      if (!q) return true;
      return (
        p.label.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q) ||
        (p.tag || '').toLowerCase().includes(q)
      );
    });
  }, [query, activeGroups]);

  const byGroup = useMemo(() => {
    const map = new Map();
    for (const g of GROUPS) map.set(g, []);
    for (const p of filtered) {
      if (!map.has(p.group)) map.set(p.group, []);
      map.get(p.group).push(p);
    }
    return map;
  }, [filtered]);

  const capturaActives = useCallback(async () => {
    if (capturant) return;
    const paths = filtered.map((p) => p.path);
    if (!paths.length) return;
    setCapturant(true);
    setCapturaMsg(`Capturant ${paths.length} pantalles… (cada una triga uns 5 s)`);
    try {
      const r = await fetch('/__dev/contact-sheet-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths }),
      });
      const j = await r.json().catch(() => ({}));
      if (j.ok) {
        setCapturaMsg(`Fet: ${j.paths} pantalles en ${Math.round((j.ms || 0) / 1000)} s`);
        const idx = await fetch(`/contact-sheet/index.json?t=${Date.now()}`, { cache: 'no-store' })
          .then((x) => (x.ok ? x.json() : null))
          .catch(() => null);
        if (idx) { setSnapshotIndex(idx); setViewMode('snapshot'); }
      } else {
        setCapturaMsg(`Ha fallat: ${String(j.error || r.status).split('\n').slice(-1)[0].slice(0, 160)}`);
      }
    } catch (e) {
      setCapturaMsg(`Ha fallat: ${String(e?.message || e).slice(0, 160)}`);
    } finally {
      setCapturant(false);
    }
  }, [capturant, filtered]);

  // First filtered page (in the order rendered, group by group).
  const referencePath = useMemo(() => {
    for (const g of GROUPS) {
      const items = byGroup.get(g) || [];
      if (items.length > 0) return items[0].path;
    }
    return null;
  }, [byGroup]);

  const effectiveRefH = refMeasure.path === referencePath ? refMeasure.height : null;
  const globalScale = effectiveRefH
    ? Math.min(1, Math.max(0.05, targetH / Math.max(effectiveRefH, 1)))
    : null;

  const handleReferenceHeight = (h) => {
    setRefMeasure({ path: referencePath, height: h });
  };

  const toggleGroup = (g) => {
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const mainRef = useRef(null);
  const lastNavRef = useRef(0);

  const navigateBy = (dir) => {
    const el = mainRef.current;
    if (!el) return;
    const now = Date.now();
    if (now - lastNavRef.current < 500) return;
    lastNavRef.current = now;
    const w = el.clientWidth;
    const currentIndex = Math.round(el.scrollLeft / Math.max(w, 1));
    const nextIndex = Math.max(0, currentIndex + dir);
    el.scrollTo({ left: nextIndex * w, behavior: 'smooth' });
  };

  // Drag-to-scroll: pressing & dragging with the mouse moves the closest
  // scrollable ancestor of the press target. Interactive elements (links,
  // buttons, inputs) are exempt so they keep working as expected.
  useEffect(() => {
    let active = null;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let moved = false;

    const isScrollable = (el) => {
      const cs = getComputedStyle(el);
      const ox = cs.overflowX;
      const oy = cs.overflowY;
      if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth) return true;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) return true;
      return false;
    };
    const findScrollable = (el) => {
      let cur = el;
      while (cur && cur !== document.body) {
        if (isScrollable(cur)) return cur;
        cur = cur.parentElement;
      }
      return document.scrollingElement || document.documentElement;
    };

    const onDown = (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('a, button, input, select, textarea, label')) return;
      const sc = findScrollable(e.target);
      if (!sc) return;
      active = sc;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = sc.scrollLeft;
      startTop = sc.scrollTop;
      moved = false;
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };
    const onMove = (e) => {
      if (!active) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!moved && Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      if (moved) {
        active.scrollLeft = startLeft - dx;
        active.scrollTop = startTop - dy;
      }
    };
    const onUp = () => {
      if (!active) return;
      active = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    // Prevent click after a drag (so cards don't accidentally trigger child links).
    const onClickCapture = (e) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('click', onClickCapture, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  useEffect(() => {
    if (mode !== 'per-category') return undefined;
    const onWheel = (e) => {
      const el = mainRef.current;
      if (!el) return;
      // Only intercept for category navigation when Shift is held; otherwise
      // let the wheel do its default vertical scroll so tall pages can be
      // browsed normally.
      if (!e.shiftKey) return;
      const dom = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(dom) < 4) return;
      e.preventDefault();
      navigateBy(dom > 0 ? 1 : -1);
    };
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        navigateBy(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        navigateBy(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        mainRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        const el = mainRef.current;
        if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      }
    };
    const main = mainRef.current;
    if (main) main.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      if (main) main.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [mode]);

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', color: '#0f172a' }}>
      <Helmet>
        <title>Contact Sheet · Dev</title>
      </Helmet>

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14 }}>Contact Sheet</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          {filtered.length} / {PAGES_MANIFEST.length} pàgines
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nom, path o tag…"
          style={{
            flex: '1 1 220px',
            minWidth: 180,
            padding: '6px 10px',
            border: '1px solid hsl(var(--grey-line-strong))',
            borderRadius: 6,
            fontSize: 12,
          }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          Alçada
          <input
            type="range"
            min={200}
            max={1600}
            step={10}
            value={targetH}
            onChange={(e) => setTargetH(Number(e.target.value))}
          />
          <span style={{ width: 44, textAlign: 'right', fontFamily: 'ui-monospace, Menlo, monospace' }}>
            {targetH}px
          </span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <input
            type="checkbox"
            checked={forceLoadAll}
            onChange={(e) => setForceLoadAll(e.target.checked)}
          />
          Carrega-ho tot
        </label>

        <div style={{ display: 'flex', gap: 0, border: '1px solid hsl(var(--grey-line-strong))', borderRadius: 6, overflow: 'hidden' }}>
          {[
            { id: 'continuous', label: 'Seguides' },
            { id: 'per-category', label: 'Per categoria' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              style={{
                fontSize: 11,
                padding: '5px 10px',
                background: mode === m.id ? '#0f172a' : '#ffffff',
                color: mode === m.id ? '#ffffff' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div
          style={{ display: 'flex', gap: 0, border: '1px solid hsl(var(--grey-line-strong))', borderRadius: 6, overflow: 'hidden' }}
          title={
            snapshotIndex
              ? `Snapshots generats: ${new Date(snapshotIndex.generatedAt).toLocaleString()}`
              : snapshotError
                ? 'No hi ha snapshots. Executa: npm run contact-sheet:capture'
                : 'Carregant snapshots…'
          }
        >
          {[
            { id: 'snapshot', label: 'Snapshot' },
            { id: 'live', label: 'Live' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setViewMode(m.id)}
              disabled={m.id === 'snapshot' && !snapshotIndex}
              style={{
                fontSize: 11,
                padding: '5px 10px',
                background: viewMode === m.id ? '#0f172a' : '#ffffff',
                color: viewMode === m.id ? '#ffffff' : '#475569',
                border: 'none',
                cursor: m.id === 'snapshot' && !snapshotIndex ? 'not-allowed' : 'pointer',
                opacity: m.id === 'snapshot' && !snapshotIndex ? 0.4 : 1,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => canviaMegaslideIframes(!megaATotes)}
          title="Obre (o tanca) el megaslide a totes les pantalles que es veuen, alhora"
          style={{
            fontSize: 11,
            padding: '5px 10px',
            borderRadius: 6,
            border: '1px solid ' + (megaATotes ? '#2563EB' : 'hsl(var(--grey-line-strong))'),
            background: megaATotes ? '#2563EB' : '#ffffff',
            color: megaATotes ? '#ffffff' : '#475569',
            cursor: 'pointer',
          }}
        >
          {megaATotes ? 'Megaslide obert a totes' : 'Megaslide a totes'}
        </button>

        <button
          type="button"
          onClick={capturaActives}
          disabled={capturant}
          title="Captura (PNG) les pantalles que es veuen ara i les deixa al contact sheet"
          style={{
            fontSize: 11,
            padding: '5px 10px',
            borderRadius: 6,
            border: '1px solid hsl(var(--grey-line-strong))',
            background: capturant ? '#e2e8f0' : '#ffffff',
            color: '#475569',
            cursor: capturant ? 'wait' : 'pointer',
          }}
        >
          {capturant ? 'Capturant…' : `Captura les ${filtered.length} actives`}
        </button>

        {capturaMsg ? (
          <span style={{ fontSize: 11, color: '#475569' }}>{capturaMsg}</span>
        ) : null}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {GROUPS.map((g) => {
            const active = activeGroups.has(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGroup(g)}
                style={{
                  fontSize: 11,
                  padding: '4px 8px',
                  borderRadius: 999,
                  border: '1px solid ' + (active ? 'hsl(var(--grey-ink-strong))' : 'hsl(var(--grey-line-strong))'),
                  background: active ? '#0f172a' : '#ffffff',
                  color: active ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </header>

      <main
        ref={mainRef}
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: 28,
          overflowX: 'auto',
          scrollSnapType: mode === 'per-category' ? 'x mandatory' : 'none',
        }}
      >
        {GROUPS
          .map((g) => ({ g, items: byGroup.get(g) || [] }))
          .map(({ g, items }, visibleIdx) => (
            <section
              key={g}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: 12,
                flexShrink: 0,
                padding: '8px 12px',
                background: visibleIdx % 2 === 1 ? '#e2e8f0' : 'transparent',
                width: '100vw',
                maxWidth: '100vw',
                ...(mode === 'per-category'
                  ? { scrollSnapAlign: 'start', scrollSnapStop: 'always' }
                  : null),
              }}
            >
              <div
                style={{
                  width: 56,
                  flexShrink: 0,
                  position: 'relative',
                  alignSelf: 'stretch',
                }}
              >
                <h2
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    margin: 0,
                    fontSize: 39,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#475569',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {g} <span style={{ color: '#94a3b8', fontWeight: 500 }}>· {items.length}</span>
                </h2>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  gap: 14,
                  alignItems: 'flex-start',
                  flex: 1,
                  minWidth: 0,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  paddingBottom: 8,
                  cursor: 'grab',
                }}
              >
                {items.map((p) => (
                  <ThumbCard
                    key={p.path}
                    page={p}
                    targetH={targetH}
                    forcedScale={globalScale}
                    onContentHeight={p.path === referencePath ? handleReferenceHeight : undefined}
                    forceLoad={forceLoadAll}
                    viewMode={viewMode}
                    snapshot={snapshotIndex?.pages?.[p.path]}
                  />
                ))}
              </div>
            </section>
          ))}
      </main>
    </div>
  );
}

export default ContactSheetPage;
