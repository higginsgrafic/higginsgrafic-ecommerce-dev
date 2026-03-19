import React, { useRef } from 'react';

export default function StripeCalibHud({
  beltGuideXPx,
  hudFixedPos,
  stripeCalibMode,
  stripeCalibEnabled,
  stripeFresh,
  stripeClampLevel,
  setStripeCalibHudArmed,
  stripeCalibHudCollapsed,
  setStripeCalibHudCollapsed,
  exportCalibrationConfig,
  resetOverlayCalibration,
  downloadCalibrationConfig,
  calibUploadInputRef,
  onUploadCalibrationFile,
  uploadCalibrationConfigPickFile,
  calibIoOpen,
  setCalibIoOpen,
  calibIoText,
  setCalibIoText,
  getAllCalibrationLocalStorage,
  viewCollectedCalibration,
  copyCollectedCalibration,
  clearCollectedCalibration,
  forceSeedCurrentFromCollectedAndReload,
  minimalCalibUrl,
  copyToClipboard,
  importCalibrationConfig,
  restoreCollectedCalibrationConfig,
  overlayCalibDesignKey,
  overlaySrc,
  effectiveItems,
  lastClickedSlug,
  stripeV4AllowUrlParams,
  stripeV4Sprite,
  stripeV4SpriteExtraBottomPx,
  stripeOverlayClip,
  stripeOverlayClipDebug,
  debugStripeHitEffective,
  debugStripeOverlaySlots,
  stripeV4Engine,
  stripeV4ClipDxPx,
  stripeV4ClipDyPx,
  stripeV4HitDxPx,
  stripeV4HitDyPx,
  v4UnionMaskDy,
  v4UnionMaskScaleX,
  v4UnionMaskScaleY,
  v4OverlayPitchXLive,
  v4OverlayWLive,
  v4OverlayX0Live,
  stripeV4Fit,
  v4OverlayTilesLoadInfo,
  debugStripeHit,
  v4TileOverlaySrcs,
  v4TileOverlayLoad,
  overlayCalibrationStorageKey,
  debugOverlayLocalStorageRaw,
  stripeOverlayX,
  stripeOverlayY,
  stripeOverlayScale,
  overlayCalibSource,
  overlayCalibKeyUsed,
  stripeV4HitAlignTopBBoxY,
  stripeV4HitAlignTopDy,
  stripeV4SvgW,
  stripeV4SvgH,
  stripeV4SpriteSrc,
  overlaySrcForRender,
  stripeRefMockupSrc,
  stripeRefTargetIndex,
  stripeRefTargetSlug,
  stripeRefX,
  stripeRefY,
  stripeRefScale,
  stripeRefTile1,
  stripeRef2X,
  stripeRef2Y,
  stripeRef2Scale,
  stripeV3,
  v3TileStepXLive,
  v3TileWLive,
  v3TileAnchorIndexLive,
  v3TileAnchorXLive,
  v3TileX0Live,
  calibQuickItemsGrouped,
  calibQuickGroup,
  setCalibQuickGroup,
  buildCalibHrefForQuickItem,
}) {
  const lastHudLeftPxRef = useRef(null);
  const applyUrlParam = (k, raw) => {
    try {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      if (raw === null || raw === undefined || raw === '') url.searchParams.delete(k);
      else url.searchParams.set(k, String(raw));
      window.history.replaceState(window.history.state, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      // ignore
    }
  };

  const applyUrlParamAndReload = (k, raw) => {
    try {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      if (raw === null || raw === undefined || raw === '') url.searchParams.delete(k);
      else url.searchParams.set(k, String(raw));
      window.location.assign(url.toString());
    } catch {
      // ignore
    }
  };

  const urlFlag = (k) => {
    try {
      if (typeof window === 'undefined') return false;
      const url = new URL(window.location.href);
      const raw = url.searchParams.get(k);
      if (raw === '1') return true;
      if (raw === '0') return false;
      return Boolean(raw);
    } catch {
      return false;
    }
  };

  const num = (v, fallback = 0) => {
    try {
      const n = typeof v === 'number' ? v : Number(v);
      return Number.isFinite(n) ? n : fallback;
    } catch {
      return fallback;
    }
  };
  const hudLeftPx = (() => {
    try {
      const hasGuides = beltGuideXPx
        && Number.isFinite(beltGuideXPx.left)
        && Number.isFinite(beltGuideXPx.right)
        && beltGuideXPx.right > beltGuideXPx.left;
      const mid = hasGuides ? ((beltGuideXPx.left + beltGuideXPx.right) / 2) : null;

      const prev = lastHudLeftPxRef.current;
      const nextRaw = Number.isFinite(mid) ? mid : (Number.isFinite(prev) ? prev : null);
      if (!Number.isFinite(nextRaw)) return null;

      const vw = (typeof window !== 'undefined' && Number.isFinite(window.innerWidth)) ? window.innerWidth : null;
      const hudW = Number.isFinite(vw) ? Math.min(920, vw * 0.98) : 920;
      const half = hudW / 2;
      const min = Number.isFinite(vw) ? (8 + half) : null;
      const max = Number.isFinite(vw) ? (vw - 8 - half) : null;
      const clamped = (Number.isFinite(min) && Number.isFinite(max) && max >= min)
        ? Math.max(min, Math.min(max, nextRaw))
        : nextRaw;

      const out = Math.round(clamped);
      lastHudLeftPxRef.current = out;
      return out;
    } catch {
      return lastHudLeftPxRef.current;
    }
  })();

  const hudTopPx = (() => {
    try {
      const t = hudFixedPos && Number.isFinite(hudFixedPos.top) ? hudFixedPos.top : null;
      if (!Number.isFinite(t)) return null;
      const vh = (typeof window !== 'undefined' && Number.isFinite(window.innerHeight)) ? window.innerHeight : null;
      if (!Number.isFinite(vh)) return Math.round(t);
      return Math.round(Math.max(8, Math.min(vh - 8, t)));
    } catch {
      return null;
    }
  })();

  const hudBottomGapPx = 72;

  const hudMaxH = (() => {
    try {
      if (Number.isFinite(hudTopPx)) {
        return `calc(100vh - ${hudTopPx}px - 8px)`;
      }
      return `calc(100vh - ${hudBottomGapPx}px - 16px)`;
    } catch {
      return `calc(100vh - ${hudBottomGapPx}px - 16px)`;
    }
  })();

  const splitUrlForHud = (href) => {
    try {
      if (!href) return { origin: '', pathname: '', base: '', params: [] };
      const u = new URL(href, (typeof window !== 'undefined' ? window.location?.origin : 'http://localhost'));
      const base = `${u.origin}${u.pathname}`;
      const params = Array.from(u.searchParams.entries());
      return { origin: u.origin, pathname: u.pathname, base, params };
    } catch {
      return { origin: '', pathname: '', base: String(href || ''), params: [] };
    }
  };

  return (
    <div
      className="pointer-events-auto fixed left-0 right-0 z-[40000] flex w-full max-w-none flex-col bg-red-600/90 p-2 text-white shadow-lg backdrop-blur"
      onMouseEnter={() => setStripeCalibHudArmed(true)}
      onMouseLeave={() => setStripeCalibHudArmed(false)}
      style={{
        fontSize: '9pt',
        overflow: 'hidden',
        top: Number.isFinite(hudTopPx) ? `${hudTopPx}px` : undefined,
        bottom: Number.isFinite(hudTopPx) ? undefined : `${hudBottomGapPx}px`,
        left: 0,
        right: 0,
        transform: undefined,
        height: hudMaxH,
        maxHeight: hudMaxH,
      }}
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-white/95">HUD</div>
            <div className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/95">mode:{stripeCalibMode}</div>
            <div className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/95">fresh:{String(stripeFresh)}</div>
            <div className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/95">clamp:{stripeClampLevel}</div>
          </div>

          <div className="flex items-center gap-1">
            {stripeV4Engine ? (
              <>
                <button
                  type="button"
                  className="pointer-events-auto rounded bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
                  onClick={() => {
                    const enabled = urlFlag('debugV4MaskOutlines');
                    applyUrlParamAndReload('debugV4MaskOutlines', enabled ? '' : '1');
                  }}
                >
                  guides:{urlFlag('debugV4MaskOutlines') ? 'on' : 'off'}
                </button>

                <button
                  type="button"
                  className="pointer-events-auto rounded bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
                  onClick={() => applyUrlParamAndReload('stripeCalibMode', 'tiles')}
                >
                  mode:tiles
                </button>
              </>
            ) : null}
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
              onClick={() => setStripeCalibHudCollapsed((v) => !v)}
            >
              {stripeCalibHudCollapsed ? 'expand' : 'collapse'}
            </button>
          </div>
        </div>

        <div className="mt-1 rounded-lg bg-white/10 px-2 py-1">
          <div className="grid grid-cols-1 gap-1 text-[10px] md:grid-cols-3">
            <div className="min-w-0 rounded bg-white/10 px-2 py-0.5">
              Key: <span className="font-mono">{overlayCalibDesignKey || (overlaySrc ? overlaySrc.split('/').pop() : 'none')}</span>
            </div>
            <div className="min-w-0 rounded bg-white/10 px-2 py-0.5">
              <div className="truncate font-mono">{overlaySrcForRender || overlaySrc || '—'}</div>
            </div>
            <div className="min-w-0 rounded bg-white/10 px-2 py-0.5">
              X/Y/S:{' '}
              <span className="font-mono">{Number.isFinite(stripeOverlayX) ? stripeOverlayX.toFixed(3) : '—'}</span>{' '}
              <span className="font-mono">{Number.isFinite(stripeOverlayY) ? stripeOverlayY.toFixed(3) : '—'}</span>{' '}
              <span className="font-mono">{Number.isFinite(stripeOverlayScale) ? stripeOverlayScale.toFixed(3) : '—'}</span>
            </div>
          </div>
        </div>

        {stripeCalibHudCollapsed ? null : (
          <div className="mt-1 flex-1 min-h-0 overflow-hidden">
            <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div className="px-1">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-white/90">Controls</div>
                <div className="mt-1 text-[10px]">
                  <div className="text-white/70">Keys</div>
                  <div className="mt-0.5 font-mono">Tab: <span className="font-sans text-white/95">Cycle</span></div>
                  <div className="font-mono">R: <span className="font-sans text-white/95">ref</span></div>
                  <div className="font-mono">O: <span className="font-sans text-white/95">overlay</span></div>
                  <div className="font-mono">2: <span className="font-sans text-white/95">ref 2</span></div>
                  <div className="font-mono">T: <span className="font-sans text-white/95">tile (pas)</span></div>

                  <div className="mt-2 text-white/70">Nudge Arrows</div>
                  <div className="mt-0.5 font-mono text-white/95">(Shift=10px)+/-</div>
                </div>
              </div>

              {stripeV4Engine ? (
                <div className="px-1 lg:col-span-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-white/90">V4 live</div>

                  <div className="mt-1 grid grid-cols-3 gap-x-2 gap-y-1">
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-white/75">CLIP</div>
                      <label className="mt-0.5 flex items-center gap-1.5">
                        <span className="w-5 text-[10px] font-semibold uppercase tracking-wide text-white/65">DX</span>
                        <input
                          type="number"
                          step={1}
                          value={num(stripeV4ClipDxPx, 0)}
                          className="w-16 rounded bg-white/10 px-2 py-1 font-mono text-[11px] text-white outline-none"
                          onChange={(e) => applyUrlParam('v4ClipDx', e.target.value)}
                        />
                      </label>
                      <label className="mt-0.5 flex items-center gap-1.5">
                        <span className="w-5 text-[10px] font-semibold uppercase tracking-wide text-white/65">DY</span>
                        <input
                          type="number"
                          step={1}
                          value={num(stripeV4ClipDyPx, 0)}
                          className="w-16 rounded bg-white/10 px-2 py-1 font-mono text-[11px] text-white outline-none"
                          onChange={(e) => applyUrlParam('v4ClipDy', e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-white/75">MASK</div>
                      <label className="mt-0.5 flex items-center gap-1.5">
                        <span className="w-5 text-[10px] font-semibold uppercase tracking-wide text-white/65">DX</span>
                        <input
                          type="number"
                          step={0.01}
                          value={num(v4UnionMaskScaleX, 1)}
                          className="w-16 rounded bg-white/10 px-2 py-1 font-mono text-[11px] text-white outline-none"
                          onChange={(e) => applyUrlParam('v4UnionMaskScaleX', e.target.value)}
                        />
                      </label>
                      <label className="mt-0.5 flex items-center gap-1.5">
                        <span className="w-5 text-[10px] font-semibold uppercase tracking-wide text-white/65">DY</span>
                        <input
                          type="number"
                          step={1}
                          value={num(v4UnionMaskDy, 0)}
                          className="w-16 rounded bg-white/10 px-2 py-1 font-mono text-[11px] text-white outline-none"
                          onChange={(e) => applyUrlParam('v4UnionMaskDy', e.target.value)}
                        />
                      </label>
                      <label className="mt-0.5 flex items-center gap-1.5">
                        <span className="w-5 text-[10px] font-semibold uppercase tracking-wide text-white/65">SY</span>
                        <input
                          type="number"
                          step={0.01}
                          value={num(v4UnionMaskScaleY, 1)}
                          className="w-16 rounded bg-white/10 px-2 py-1 font-mono text-[11px] text-white outline-none"
                          onChange={(e) => applyUrlParam('v4UnionMaskScaleY', e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-white/75">HIT</div>
                      <label className="mt-0.5 flex items-center gap-1.5">
                        <span className="w-5 text-[10px] font-semibold uppercase tracking-wide text-white/65">DX</span>
                        <input
                          type="number"
                          step={1}
                          value={num(stripeV4HitDxPx, 0)}
                          className="w-16 rounded bg-white/10 px-2 py-1 font-mono text-[11px] text-white outline-none"
                          onChange={(e) => applyUrlParam('v4HitDx', e.target.value)}
                        />
                      </label>
                      <label className="mt-0.5 flex items-center gap-1.5">
                        <span className="w-5 text-[10px] font-semibold uppercase tracking-wide text-white/65">DY</span>
                        <input
                          type="number"
                          step={1}
                          value={num(stripeV4HitDyPx, 0)}
                          className="w-16 rounded bg-white/10 px-2 py-1 font-mono text-[11px] text-white outline-none"
                          onChange={(e) => applyUrlParam('v4HitDy', e.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
                      onClick={() => {
                        applyUrlParam('v4ClipDx', '');
                        applyUrlParam('v4ClipDy', '');
                        applyUrlParam('v4UnionMaskScaleX', '');
                        applyUrlParam('v4UnionMaskScaleY', '');
                        applyUrlParam('v4UnionMaskDy', '');
                        applyUrlParam('v4HitDx', '');
                        applyUrlParam('v4HitDy', '');
                      }}
                    >
                      clear v4
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="px-1">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-white/90">IO</div>
                {(() => {
                  const href = minimalCalibUrl || (typeof window !== 'undefined' ? window.location?.href : '');
                  const parsed = splitUrlForHud(href);
                  return (
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <div className="pointer-events-none text-[10px] font-semibold uppercase tracking-wide text-white/70">Url</div>
                        <div className="min-w-0 flex-1 truncate font-mono text-[11px] text-white/95">{parsed.pathname || (parsed.base || href)}</div>
                        <button
                          type="button"
                          className="pointer-events-auto rounded bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
                          onClick={() => copyToClipboard(href)}
                        >
                          copy
                        </button>
                      </div>

                      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
                        <div className="min-w-0">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-white/70">Origin</div>
                          <a
                            className="block min-w-0 truncate font-mono text-[11px] text-white/95 underline"
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {parsed.origin || '—'}
                          </a>
                        </div>

                        <div className="min-w-0">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-white/70">Params</div>
                          {parsed.params.length ? (
                            <div
                              className="mt-0.5"
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(70px, 120px) 1fr',
                                gap: '1px 8px',
                                alignItems: 'baseline',
                              }}
                            >
                              {parsed.params.map(([k, v]) => (
                                <div key={`${k}=${v}`} className="contents">
                                  <div className="truncate font-mono text-[10px] text-white/70">{k}</div>
                                  <div className="min-w-0 truncate font-mono text-[10px] text-white/95">{String(v)}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-0.5 font-mono text-[10px] text-white/60">—</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {calibIoOpen ? (
                  <div className="mt-2">
                    <textarea
                      value={calibIoText}
                      onChange={(e) => setCalibIoText(e.target.value)}
                      rows={6}
                      className="w-full rounded bg-white/10 px-2 py-1 font-mono text-[11px] text-white outline-none"
                      placeholder="Paste calibration JSON here"
                    />
                  </div>
                ) : null}
              </div>

            </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
              onClick={() => exportCalibrationConfig()}
            >
              export
            </button>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
              onClick={() => resetOverlayCalibration()}
            >
              reset overlay
            </button>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
              onClick={() => downloadCalibrationConfig()}
            >
              download
            </button>
            <input
              ref={calibUploadInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={onUploadCalibrationFile}
            />
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
              onClick={() => uploadCalibrationConfigPickFile()}
            >
              upload
            </button>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
              onClick={() => setCalibIoOpen((v) => !v)}
            >
              import
            </button>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
              onClick={() => {
                try {
                  setCalibIoText(JSON.stringify({ v: 1, ts: new Date().toISOString(), items: getAllCalibrationLocalStorage() }, null, 2));
                  setCalibIoOpen(true);
                } catch {
                  // ignore
                }
              }}
            >
              view
            </button>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
              onClick={() => viewCollectedCalibration()}
            >
              collected view
            </button>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
              onClick={() => copyCollectedCalibration()}
            >
              collected copy
            </button>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
              onClick={() => clearCollectedCalibration()}
            >
              collected clear
            </button>
            <button
              type="button"
              className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
              onClick={() => forceSeedCurrentFromCollectedAndReload()}
            >
              seed current+reload
            </button>
          </div>

          <div
            className="mt-3 grid grid-cols-1 gap-3"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'start',
            }}
          >
            <div className="px-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/90">State</div>

              <div
                className="mt-2 text-[11px]"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '2px 12px',
                }}
              >
                <div><span className="text-white/70">Key:</span> <span className="font-mono">{overlayCalibDesignKey || (overlaySrc ? overlaySrc.split('/').pop() : 'none')}</span></div>
                <div><span className="text-white/70">Tiles:</span> <span className="font-mono">{Array.isArray(effectiveItems) ? effectiveItems.length : 0}</span></div>
                <div><span className="text-white/70">Mode:</span> <span className="font-mono">{stripeCalibMode}</span></div>
                <div><span className="text-white/70">Last:</span> <span className="font-mono">{lastClickedSlug || '—'}</span></div>
                <div><span className="text-white/70">allowUrl:</span> <span className="font-mono">{String(stripeV4AllowUrlParams)}</span></div>
                <div><span className="text-white/70">sprite:</span> <span className="font-mono">{String(stripeV4Sprite)}</span></div>
                <div><span className="text-white/70">v4SpriteExtraB:</span> <span className="font-mono">{stripeV4SpriteExtraBottomPx}</span></div>
                <div><span className="text-white/70">clip:</span> <span className="font-mono">{String(stripeOverlayClip)}</span></div>
                <div><span className="text-white/70">clipDbg:</span> <span className="font-mono">{String(stripeOverlayClipDebug)}</span></div>
                <div><span className="text-white/70">hitDbg:</span> <span className="font-mono">{String(debugStripeHitEffective)}</span></div>
                <div><span className="text-white/70">ovSlotsDbg:</span> <span className="font-mono">{String(debugStripeOverlaySlots)}</span></div>
                <div><span className="text-white/70">calib src:</span> <span className="font-mono">{overlayCalibSource || '—'}</span></div>
                <div><span className="text-white/70">calib keyUsed:</span> <span className="font-mono">{overlayCalibKeyUsed || '—'}</span></div>
                {stripeV4Engine ? (
                  <>
                    <div>
                      <span className="text-white/70">v4 tiles:</span>{' '}
                      <span className="font-mono">pitchX:{Number.isFinite(v4OverlayPitchXLive) ? v4OverlayPitchXLive.toFixed(3) : '—'}</span>{' '}
                      <span className="font-mono">w:{Number.isFinite(v4OverlayWLive) ? v4OverlayWLive.toFixed(3) : '—'}</span>{' '}
                      <span className="font-mono">x0:{Number.isFinite(v4OverlayX0Live) ? v4OverlayX0Live.toFixed(3) : '—'}</span>
                    </div>
                    <div>
                      <span className="text-white/70">v4 fit:</span>{' '}
                      <span className="font-mono">s:{(stripeV4Fit && Number.isFinite(stripeV4Fit.scale)) ? stripeV4Fit.scale.toFixed(4) : '—'}</span>{' '}
                      <span className="font-mono">tx:{(stripeV4Fit && Number.isFinite(stripeV4Fit.tx)) ? stripeV4Fit.tx.toFixed(2) : '—'}</span>{' '}
                      <span className="font-mono">ty:{(stripeV4Fit && Number.isFinite(stripeV4Fit.ty)) ? stripeV4Fit.ty.toFixed(2) : '—'}</span>{' '}
                      <span className="font-mono">anchors:{String(!!(beltGuideXPx && Number.isFinite(beltGuideXPx.left) && Number.isFinite(beltGuideXPx.right) && beltGuideXPx.right > beltGuideXPx.left))}</span>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <div className="px-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/90">Refs/Overlays</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {calibQuickItemsGrouped.map((g) => (
                  <button
                    key={g.group}
                    type="button"
                    className={
                      `pointer-events-auto rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wide `
                      + (g.group === calibQuickGroup
                        ? 'bg-white/30 text-white ring-1 ring-white/70 hover:bg-white/35'
                        : 'bg-white/10 text-white/85 hover:bg-white/20')
                    }
                    onClick={() => setCalibQuickGroup(g.group)}
                  >
                    {g.group}
                  </button>
                ))}
              </div>

              {(() => {
                const g = (calibQuickItemsGrouped || []).find((x) => x.group === calibQuickGroup) || calibQuickItemsGrouped?.[0] || null;
                if (!g) return null;
                return (
                  <div
                    className="mt-2"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    {g.items.map((it) => {
                      return (
                        <button
                          key={it.k}
                          type="button"
                          className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold text-white hover:bg-white/25"
                          onClick={(e) => {
                            try {
                              e.preventDefault();
                              if (typeof window === 'undefined') return;
                              if (window.localStorage && it?.refMockup) {
                                try { window.localStorage.setItem('HG_STRIPE_REF_MOCKUP_LAST', it.refMockup); } catch { /* ignore */ }
                              }
                              const u = new URL(window.location.href);
                              const p = u.searchParams;
                              p.set('stripeCalib', '1');
                              p.set('stripeCalibMode', 'overlay');
                              p.set('stripeRefTile1', '1');
                              p.set('stripeRefTargetIndex', '1');
                              if (it?.refMockup) p.set('stripeRefMockup', it.refMockup);
                              u.search = p.toString();
                              window.location.assign(u.toString());
                            } catch {
                              // ignore
                            }
                          }}
                        >
                          {it.label}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="px-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/90">Values</div>

              {overlayCalibrationStorageKey ? (
                <div className="mt-2 text-[11px]"><span className="text-white/70">Overlay calib key:</span> <span className="font-mono">{overlayCalibrationStorageKey}</span></div>
              ) : null}

              <div
                className="mt-2 text-[11px]"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '2px 12px',
                }}
              >
                {stripeRefMockupSrc ? (
                  <div>
                    <span className="text-white/70">Ref X/Y/S:</span>{' '}
                    <span className="font-mono">{Number.isFinite(stripeRefX) ? stripeRefX.toFixed(3) : '—'}</span>{' '}
                    <span className="font-mono">{Number.isFinite(stripeRefY) ? stripeRefY.toFixed(3) : '—'}</span>{' '}
                    <span className="font-mono">{Number.isFinite(stripeRefScale) ? stripeRefScale.toFixed(3) : '—'}</span>
                  </div>
                ) : null}
                {stripeRefMockupSrc && stripeCalibMode === 'ref2' ? (
                  <div>
                    <span className="text-white/70">Ref2 X/Y/S:</span>{' '}
                    <span className="font-mono">{Number.isFinite(stripeRef2X) ? stripeRef2X.toFixed(3) : '—'}</span>{' '}
                    <span className="font-mono">{Number.isFinite(stripeRef2Y) ? stripeRef2Y.toFixed(3) : '—'}</span>{' '}
                    <span className="font-mono">{Number.isFinite(stripeRef2Scale) ? stripeRef2Scale.toFixed(3) : '—'}</span>
                  </div>
                ) : null}
                <div>
                  <span className="text-white/70">Overlay X/Y/S:</span>{' '}
                  <span className="font-mono">{Number.isFinite(stripeOverlayX) ? stripeOverlayX.toFixed(3) : '—'}</span>{' '}
                  <span className="font-mono">{Number.isFinite(stripeOverlayY) ? stripeOverlayY.toFixed(3) : '—'}</span>{' '}
                  <span className="font-mono">{Number.isFinite(stripeOverlayScale) ? stripeOverlayScale.toFixed(3) : '—'}</span>
                </div>
                {stripeV4Engine ? (
                  <div>
                    <span className="text-white/70">V4 clip dx/dy:</span>{' '}
                    <span className="font-mono">{Number.isFinite(stripeV4ClipDxPx) ? stripeV4ClipDxPx.toFixed(2) : '—'}</span>{' '}
                    <span className="font-mono">{Number.isFinite(stripeV4ClipDyPx) ? stripeV4ClipDyPx.toFixed(2) : '—'}</span>
                  </div>
                ) : null}
                {(debugStripeHit || stripeCalibEnabled) ? (
                  <div>
                    <span className="text-white/70">V4 hit dy:</span>{' '}
                    <span className="font-mono">{Number.isFinite(stripeV4HitAlignTopDy) ? stripeV4HitAlignTopDy.toFixed(3) : '—'}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-white/70">Overlay render:</span>{' '}
                    <span className="font-mono">{overlaySrc ? (stripeOverlayClip ? 'svg-clip' : 'img') : 'none'}</span>
                  </div>
                )}
              </div>

              {stripeRefMockupSrc ? (
                <div className="mt-2 text-[11px]"><span className="text-white/70">Ref:</span> <span className="font-mono">{stripeRefMockupSrc.split('/').pop()}</span></div>
              ) : null}

              {overlaySrc ? (
                <div className="mt-2 flex items-center gap-2">
                  <div className="min-w-0 flex-1 truncate font-mono text-[11px]">
                    {overlaySrcForRender || overlaySrc}
                  </div>
                  <button
                    type="button"
                    className="pointer-events-auto rounded bg-white/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-white/25"
                    onClick={() => copyToClipboard(overlaySrcForRender || overlaySrc)}
                  >
                    copy
                  </button>
                </div>
              ) : null}

              {stripeV4Engine && v4OverlayTilesLoadInfo ? (
                <div className="mt-2 text-[11px]"><span className="text-white/70">V4 tiles source:</span> <span className="font-mono">{v4OverlayTilesLoadInfo.source || '—'}</span></div>
              ) : null}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
