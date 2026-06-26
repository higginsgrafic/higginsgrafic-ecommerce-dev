import React, { useEffect, useState, useMemo } from 'react';
import MegaColumn from './MegaColumn.jsx';
import ClicAreaOverlay from './ClicAreaOverlay.jsx';

function useEmptyShirtMask(emptyTileIndices, shirtColor) {
  const [dataUrl, setDataUrl] = useState(null);
  const emptyKey = Array.isArray(emptyTileIndices) ? emptyTileIndices.join(',') : '';
  useEffect(() => {
    let cancelled = false;
    fetch('/placeholders/cercador/full-clic-area-5.svg')
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        try {
          const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
          const emptySet = new Set(Array.isArray(emptyTileIndices) ? emptyTileIndices : []);
          const paths = doc.querySelectorAll('.tshirt-outline');
          const isWhite = !shirtColor || shirtColor === '#FFFFFF';
          const emptyOpacity = isWhite ? '0.3' : '0.1';
          paths.forEach((p, i) => {
            p.setAttribute('fill', 'white');
            p.setAttribute('fill-opacity', emptySet.has(i) ? emptyOpacity : '1');
            p.removeAttribute('stroke');
            p.removeAttribute('class');
          });
          const svgEl = doc.documentElement;
          const serialized = new XMLSerializer().serializeToString(svgEl);
          const encoded = encodeURIComponent(serialized);
          setDataUrl(`data:image/svg+xml,${encoded}`);
        } catch {
          setDataUrl(null);
        }
      })
      .catch(() => setDataUrl(null));
    return () => { cancelled = true; };
  }, [emptyKey, shirtColor]);
  return dataUrl;
}

function MegaStripePanel({
  hideGrid,
  reserveGridSpace,
  stripeImageSrc,
  active,
  resolvedMega,
  showStripe,
  stripeRowPadPx,
  stripeRowPadXPx,
  stripePreviewHPx,
  stripeOverlayLoadState,
  resolvedOverlaySrc,
  stripeOverlayDebug,
  stripeMaskDebugRectsPct,
  megaStripeSpriteEnabledLocal,
  megaStripeRefEnabledLocal,
  megaStripeRefSrcLocal,
  megaStripeRef2EnabledLocal,
  megaStripeRef2SrcLocal,
  megaShirtDrawingEnabledLocal,
  drawingOverlaySrcEffective,
  stripeMaskTileRectsRawPct,
  drawingOverlayDebug,
  tileGapPxLocal,
  humanInsideVariant,
  firstContactVariant,
  reorderAustenQuotes,
  austenSelectedDisableMulti,
  stripeVariantVisibility,
  megaTileSelectorParams,
  onStartSelectorDrag,
  megaTileSize,
  setStripeOverlayOverrideActive,
  setFirstContactVariant,
  setHumanInsideVariant,
  setThinStartIndex,
  setFirstContactSelectedItem,
  setHumanInsideSelectedItem,
  setSelectedItemByCollection,
  normalizeOverlaySrc,
  shirtColor,
  onShirtClick,
  stripeTileOverlaySrcs,
  stripeTileItems,
  clicAreaHighlight,
  clicAreaHighlightIndices,
  neckDotIndices,
  emptyTileIndices,
  stripeEmptyMaskSrc,
}) {
  const emptyShirtMaskUrl = useEmptyShirtMask(emptyTileIndices, shirtColor);

  useEffect(() => {
    const handler = (ev) => {
      if (typeof onShirtClick !== 'function') return;
      if (!Array.isArray(stripeTileItems)) return;
      const x = ev.detail?.x;
      if (typeof x !== 'number') return;
      const tileIdx = Math.min(13, Math.max(0, Math.floor(x * 14)));
      const item = stripeTileItems[tileIdx];
      if (!item) return;
      onShirtClick(active, item, shirtColor);
    };
    window.addEventListener('mega-stripe-full-hit', handler);
    return () => window.removeEventListener('mega-stripe-full-hit', handler);
  }, [onShirtClick, stripeTileItems, active, shirtColor]);

  return (
    <div className="w-full shrink-0">
      {!hideGrid || reserveGridSpace ? (
        <div
          className="relative z-10 grid grid-cols-1 gap-10"
          style={{
            transform: 'scale(var(--hgGridFitScale, 0.94))',
            transformOrigin: 'top center',
            visibility: reserveGridSpace ? 'hidden' : undefined,
            pointerEvents: reserveGridSpace ? 'none' : undefined,
          }}
          aria-hidden={reserveGridSpace ? true : undefined}
        >
          {(resolvedMega[active] || []).map((col, idx) => (
            <MegaColumn
              key={`${active}-${idx}`}
              title={col.title}
              isFirstContact={active === 'first_contact' || active === 'austen' || active === 'cube' || active === 'miscellania'}
              isHumanInside={active === 'the_human_inside'}
              collectionId={active}
              disableMulti={active === 'austen' && austenSelectedDisableMulti}
              stripeVariantVisibility={stripeVariantVisibility}
              megaTileSelectorParams={megaTileSelectorParams}
              onStartSelectorDrag={onStartSelectorDrag}
              megaTileSize={megaTileSize}
              humanInsideVariant={humanInsideVariant}
              items={active === 'austen' ? reorderAustenQuotes(col.items) : col.items}
              row={true}
              firstContactVariant={firstContactVariant}
              onFirstContactWhite={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('white'); }}
              onFirstContactBlack={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('black'); }}
              onFirstContactMulti={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('color'); }}
              onHumanWhite={() => { setStripeOverlayOverrideActive(false); setHumanInsideVariant('white'); }}
              onHumanBlack={() => { setStripeOverlayOverrideActive(false); setHumanInsideVariant('black'); }}
              onHumanMulti={() => { setStripeOverlayOverrideActive(false); setHumanInsideVariant('color'); }}
              onHumanPrev={() => setThinStartIndex((v) => v - 1)}
              onHumanNext={() => setThinStartIndex((v) => v + 1)}
              onSelectItem={(it) => {
                setStripeOverlayOverrideActive(false);
                if (active === 'first_contact') setFirstContactSelectedItem(it);
                else if (active === 'the_human_inside') setHumanInsideSelectedItem(it);
                else setSelectedItemByCollection((prev) => ({ ...prev, [active]: it }));
                if (typeof onShirtClick === 'function') onShirtClick(active, it);
              }}
            />
          ))}
        </div>
      ) : null}

      {showStripe ? (
        <div
          className="relative z-0"
          style={{
            marginTop: `${stripeRowPadPx}px`,
            paddingBottom: `${stripeRowPadPx}px`,
            paddingLeft: `${stripeRowPadXPx?.left || 0}px`,
            paddingRight: `${stripeRowPadXPx?.right || 0}px`,
            transform: 'translateY(-10px)',
          }}
        >
          <div className="w-full flex justify-center bg-transparent">
            <div
              id="stripe-guide-stripe-row"
              className="relative inline-block"
              style={{
                height: `${stripePreviewHPx}px`,
                width: 'auto',
              }}
            >
              {stripeOverlayDebug && stripeOverlayLoadState !== 'ok' ? (
                <div
                  className="absolute left-2 top-2"
                  style={{
                    zIndex: 100,
                    pointerEvents: 'none',
                    fontSize: 11,
                    lineHeight: 1.2,
                    padding: '6px 8px',
                    borderRadius: 8,
                    background: 'rgba(255, 80, 80, 0.92)',
                    color: '#fff',
                    maxWidth: 420,
                    wordBreak: 'break-all',
                  }}
                >
                  {stripeOverlayLoadState === 'no-src'
                    ? 'overlay: no src'
                    : (stripeOverlayLoadState === 'loading'
                        ? 'overlay: loading...'
                        : `overlay: failed (${resolvedOverlaySrc || 'empty'})`)}
                </div>
              ) : null}

              <div
                className="relative"
                style={{
                  height: '100%',
                  width: 'fit-content',
                  display: 'inline-block',
                  transformOrigin: 'top center',
                  transform: 'translate(var(--megaStripeDx, 0px), var(--megaStripeDy, 0px)) scale(var(--megaStripeScale, 1.2125))',
                  isolation: 'isolate',
                }}
              >
                {stripeOverlayDebug ? (
                  <div
                    className="absolute inset-0 flex"
                    style={{
                      pointerEvents: 'none',
                      zIndex: 1000,
                      transformOrigin: 'top center',
                      transform: 'none',
                      background: 'transparent',
                    }}
                    aria-hidden="true"
                  >
                    {Array.isArray(stripeMaskDebugRectsPct) && stripeMaskDebugRectsPct.length === 14
                      ? stripeMaskDebugRectsPct.map((r, idx) => (
                        <div
                          key={`stripe-tile-debug-abs-${idx}`}
                          style={{
                            position: 'absolute',
                            left: `${r.left}%`,
                            top: `${r.top}%`,
                            width: `${r.width}%`,
                            height: `${r.height}%`,
                            boxSizing: 'border-box',
                            border: '2px solid rgba(0, 200, 255, 0.82)',
                            background: idx % 2 === 0 ? 'rgba(0, 200, 255, 0.18)' : 'rgba(0, 200, 255, 0.1)',
                            overflow: 'visible',
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: -16,
                              transform: 'translateX(-50%)',
                              zIndex: 2,
                              padding: '2px 6px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 900,
                              lineHeight: 1,
                              color: 'rgba(2,6,23,0.95)',
                              background: 'rgba(255, 255, 0, 0.94)',
                              boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
                              border: '1px solid rgba(0,0,0,0.25)',
                              userSelect: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {idx + 1}
                          </div>
                        </div>
                      ))
                      : Array.from({ length: 14 }).map((_, idx) => (
                        <div
                          key={`stripe-tile-debug-abs-fallback-${idx}`}
                          style={{
                            height: '100%',
                            flex: '1 1 0%',
                            boxSizing: 'border-box',
                            border: '2px solid rgba(0, 200, 255, 0.75)',
                            background: idx % 2 === 0 ? 'rgba(0, 200, 255, 0.22)' : 'rgba(0, 200, 255, 0.11)',
                          }}
                        />
                      ))}
                  </div>
                ) : null}

                <div
                  className="relative"
                  style={{
                    height: '100%',
                    width: 'fit-content',
                    display: 'inline-block',
                    position: 'relative',
                    zIndex: 1,
                    WebkitMaskImage: emptyShirtMaskUrl
                      ? `url("${emptyShirtMaskUrl}")`
                      : 'url(/placeholders/t-shirt_buttons/v5/full-clic-area-5.svg)',
                    maskImage: emptyShirtMaskUrl
                      ? `url("${emptyShirtMaskUrl}")`
                      : 'url(/placeholders/t-shirt_buttons/v5/full-clic-area-5.svg)',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskSize: '103% 100%',
                    maskSize: '103% 100%',
                    WebkitMaskPosition: '50% 0',
                    maskPosition: '50% 0',
                  }}
                >
                  {megaStripeSpriteEnabledLocal ? (
                    <img
                      src={stripeImageSrc || '/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp'}
                      alt=""
                      className="block"
                      style={{
                        height: '100%',
                        width: 'auto',
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}

                  {shirtColor && shirtColor !== '#FFFFFF' ? (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: shirtColor,
                        mixBlendMode: 'multiply',
                        pointerEvents: 'none',
                        zIndex: 5,
                      }}
                    />
                  ) : null}

                  {megaStripeRefEnabledLocal && megaStripeRefSrcLocal ? (
                    <img
                      src={megaStripeRefSrcLocal}
                      alt=""
                      className="block absolute inset-0"
                      style={{
                        pointerEvents: 'none',
                        zIndex: 6,
                        height: '100%',
                        width: 'auto',
                        transformOrigin: 'top center',
                        transform: 'translate(var(--megaStripeRefDx, 0px), var(--megaStripeRefDy, 0px)) scale(var(--megaStripeRefScale, 1))',
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}

                  {megaStripeRef2EnabledLocal && megaStripeRef2SrcLocal ? (
                    <img
                      src={megaStripeRef2SrcLocal}
                      alt=""
                      className="block absolute inset-0"
                      style={{
                        pointerEvents: 'none',
                        zIndex: 7,
                        height: '100%',
                        width: 'auto',
                        transformOrigin: 'top center',
                        transform: 'translate(var(--megaStripeRef2Dx, 0px), var(--megaStripeRef2Dy, 0px)) scale(var(--megaStripeRef2Scale, 1))',
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}

                  {/* Imatge prerenderitzada de les samarretes buides esvaïdes
                      (N.png, transparent), alineada amb la stripe. Esvaeix només
                      les buides; la zona dels dibuixos és transparent i no tapa
                      les samarretes de color. */}
                  {stripeEmptyMaskSrc ? (
                    <img
                      src={stripeEmptyMaskSrc}
                      alt=""
                      aria-hidden="true"
                      className="block absolute"
                      style={{
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: 'auto',
                        pointerEvents: 'none',
                        zIndex: 9,
                        opacity: 'var(--hgStripeEmptyMaskOpacity, 1)',
                      }}
                      loading="eager"
                      decoding="async"
                    />
                  ) : null}

                  {/* Capa de bloqueig de clics sobre les samarretes buides
                      (transparent; el fade visual ve de stripeEmptyMaskSrc). */}
                  {Array.isArray(emptyTileIndices) && emptyTileIndices.length > 0 ? (
                    <div className="absolute inset-0" aria-hidden="true" style={{ pointerEvents: 'none', zIndex: 10 }}>
                      {emptyTileIndices.map((idx) => {
                        const r = Array.isArray(stripeMaskTileRectsRawPct) && stripeMaskTileRectsRawPct.length === 14
                          ? stripeMaskTileRectsRawPct[idx]
                          : null;
                        const leftPct = r ? Number(r.left) || 0 : (idx / 14) * 100;
                        const widthPct = r ? Number(r.width) || 0 : (1 / 14) * 100;
                        const topPct = r ? Number(r.top) || 0 : 0;
                        const heightPct = r ? Number(r.height) || 100 : 100;
                        return (
                          <div
                            key={`disabled-tile-${idx}`}
                            onPointerDown={(ev) => { ev.stopPropagation(); }}
                            onClick={(ev) => { ev.stopPropagation(); }}
                            style={{
                              position: 'absolute',
                              top: `${topPct}%`,
                              height: `${heightPct}%`,
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                              background: 'var(--hgStripeDisabledFill, transparent)',
                              pointerEvents: 'auto',
                              cursor: 'default',
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : null}

                  {megaShirtDrawingEnabledLocal && drawingOverlaySrcEffective ? (
                    <div
                      className="absolute inset-0"
                      style={{
                        pointerEvents: 'none',
                        zIndex: 12,
                        transformOrigin: 'top center',
                        transform: 'none',
                        background: 'transparent',
                      }}
                    >
                      {Array.isArray(stripeMaskTileRectsRawPct) && stripeMaskTileRectsRawPct.length === 14
                        ? stripeMaskTileRectsRawPct.map((r, idx) => {
                          // Tile buit (samarreta sense dibuix): no renderitzem res
                          // (no repetim ni fem fallback al dibuix per defecte).
                          if (Array.isArray(stripeTileOverlaySrcs) && !stripeTileOverlaySrcs[idx]) {
                            return null;
                          }
                          const base = (() => {
                            try {
                              if (Array.isArray(stripeTileOverlaySrcs) && stripeTileOverlaySrcs[idx]) {
                                return normalizeOverlaySrc(stripeTileOverlaySrcs[idx]);
                              }
                              return normalizeOverlaySrc(drawingOverlaySrcEffective);
                            } catch {
                              return normalizeOverlaySrc(drawingOverlaySrcEffective);
                            }
                          })();

                          const resolvePerTileAssetSrc = (src) => {
                            try {
                              if (!src || typeof src !== 'string') return null;
                              const tpl = String(src || '').trim();
                              if (!tpl) return null;
                              const i1 = idx + 1;
                              const hasTpl = tpl.includes('{i}') || tpl.includes('{idx}') || tpl.includes('{n}');
                              if (hasTpl) {
                                return tpl
                                  .replace(/\{i\}/g, String(i1))
                                  .replace(/\{n\}/g, String(i1))
                                  .replace(/\{idx\}/g, String(idx));
                              }
                              return null;
                            } catch {
                              return null;
                            }
                          };

                          const isAustenKeepCalm = active === 'austen'
                            && typeof resolvedOverlaySrc === 'string'
                            && /\/austen\/keep_calm\//i.test(resolvedOverlaySrc);
                          const isAustenTileSwapBW = active === 'austen'
                            && typeof resolvedOverlaySrc === 'string'
                            && /\/austen\/(pemberley_house|crosswords|quotes)\//i.test(resolvedOverlaySrc);
                          const shouldApplyRules = active === 'first_contact' || active === 'the_human_inside' || active === 'cube' || active === 'miscellania' || isAustenKeepCalm || isAustenTileSwapBW;
                          const mode = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
                          const isAustenPemberley = active === 'austen'
                            && typeof resolvedOverlaySrc === 'string'
                            && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc);

                          const resolveDrawingOverlaySrcForTile = (src) => {
                            try {
                              if (!src || typeof src !== 'string') return src;
                              const safeIdx = Number.isFinite(Number(idx)) ? Number(idx) : 0;
                              const isFirst = safeIdx === 0;
                              const isLast = safeIdx === 13;

                              if (active === 'cube' && !isFirst) {
                                if (/\/cube\/afrodita-c-stripe\.webp$/i.test(src)) {
                                  return '/custom_logos/drawings/images_originals/stripe/cube/afrodita-cut-c-stripe.webp';
                                }
                                if (/\/cube\/cyber-cube-stripe\.webp$/i.test(src)) {
                                  return '/custom_logos/drawings/images_originals/stripe/cube/cyber-cube-cut-stripe.webp';
                                }
                              }

                              const toBlack = (s) => {
                                let out = s;
                                out = out.replace(/\/white\//i, '/black/');
                                out = out.replace(/-w(?=[-.])/i, '-b');
                                return out;
                              };
                              const toWhite = (s) => {
                                let out = s;
                                out = out.replace(/\/black\//i, '/white/');
                                out = out.replace(/-b(?=[-.])/i, '-w');
                                return out;
                              };

                              if (!shouldApplyRules) return src;

                              if ((active === 'the_human_inside' || isAustenTileSwapBW) && (mode === 'white' || mode === 'black') && !isAustenPemberley) {
                                return mode === 'white' ? toWhite(src) : toBlack(src);
                              }

                              if (mode === 'color') {
                                const hasMultiLight = src.toLowerCase().includes('-multi-light-');
                                const hasMultiDark = src.toLowerCase().includes('-multi-dark-');
                                const hasThruLight = src.toLowerCase().includes('-multi-thru-light-');
                                const hasThruDark = src.toLowerCase().includes('-multi-thru-dark-');
                                const hasThruRed = src.toLowerCase().includes('-multi-thru-red-');
                                const hasWRed = src.toLowerCase().includes('-multi-w-red-');
                                if (isAustenPemberley) {
                                  if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                  return src;
                                }
                                if (isAustenKeepCalm) {
                                  const isRedShirt = shirtColor === '#BD2739';
                                  if (isRedShirt) {
                                    if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                    return src;
                                  }
                                  if (hasMultiLight) return src.replace(/-multi-light-/i, '-multi-dark-');
                                  return src;
                                }
                                if (hasMultiLight) return src;
                                if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                if (hasThruLight) return src;
                                if (hasThruDark) return src.replace(/-multi-thru-dark-/i, '-multi-thru-light-');
                                if (hasWRed) return src;
                                if (hasThruRed) return src.replace(/-multi-thru-red-/i, '-multi-w-red-');
                                return src;
                              }

                              if (isAustenPemberley && (mode === 'white' || mode === 'black')) {
                                return src;
                              }

                              if (mode === 'white') {
                                const hasThruRed = src.toLowerCase().includes('-multi-thru-red-');
                                const hasWRed = src.toLowerCase().includes('-multi-w-red-');
                                if (hasThruRed || hasWRed) {
                                  return hasWRed ? src : src.replace(/-multi-thru-red-/i, '-multi-w-red-');
                                }
                                return toWhite(src);
                              }
                              if (mode === 'black') {
                                return toBlack(src);
                              }

                              return src;
                            } catch {
                              return src;
                            }
                          };

                          const hasPerTileSrc = Array.isArray(stripeTileOverlaySrcs) && !!stripeTileOverlaySrcs[idx];
                          const picked = (() => {
                            try {
                              if (!base) return null;
                              const perTile = resolvePerTileAssetSrc(base);
                              const candidate = perTile || base;
                              if (hasPerTileSrc) return candidate;
                              return resolveDrawingOverlaySrcForTile(candidate) || candidate;
                            } catch {
                              return base;
                            }
                          })();
                          const imgUrl = picked ? encodeURI(picked) : '';

                          const safeW = Number(r?.width) || 0;
                          const safeH = Number(r?.height) || 0;
                          const safeL = Number(r?.left) || 0;
                          const safeT = Number(r?.top) || 0;

                          return (
                            <div
                              key={`stripe-tile-drawing-${idx}-${imgUrl || ''}`}
                              style={{
                                position: 'absolute',
                                left: `${safeL}%`,
                                top: `${safeT}%`,
                                width: `${safeW}%`,
                                height: `${safeH}%`,
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                background: drawingOverlayDebug ? 'rgba(217,70,239,0.06)' : 'transparent',
                                border: drawingOverlayDebug ? '1px solid rgba(217,70,239,0.35)' : '0px solid transparent',
                                transform: tileGapPxLocal ? `translateX(${idx * tileGapPxLocal}px)` : 'none',
                              }}
                            >
                              {drawingOverlayDebug ? (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 4,
                                    left: 6,
                                    fontSize: 12,
                                    fontWeight: 900,
                                    color: 'rgba(88,28,135,0.92)',
                                    textShadow: '0 1px 1px rgba(255,255,255,0.85)',
                                    userSelect: 'none',
                                    zIndex: 13,
                                  }}
                                >
                                  {`D${idx + 1}`}
                                </div>
                              ) : null}

                              <img
                                src={imgUrl ? imgUrl : undefined}
                                alt=""
                                className="block absolute inset-0"
                                onError={(e) => {
                                  try {
                                    if (
                                      import.meta.env.DEV
                                      && active === 'austen'
                                      && typeof resolvedOverlaySrc === 'string'
                                      && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc)
                                    ) {
                                      // eslint-disable-next-line no-console
                                      console.error('[MEGA stripe tile img error]', { idx, src: imgUrl, resolvedOverlaySrc });
                                    }
                                    e.currentTarget.style.display = 'none';
                                  } catch {
                                  }
                                }}
                                style={{
                                  pointerEvents: 'none',
                                  height: '100%',
                                  width: '100%',
                                  objectFit: 'contain',
                                  opacity: 0.98,
                                  transformOrigin: 'top center',
                                  transform:
                                    'translate(var(--megaStripeDrawingOverlayDx, var(--hgShirtOverlayDx, 0px)), calc(var(--megaStripeDrawingOverlayDy, var(--hgShirtOverlayDy, 0px)) + var(--hgStripeDrawingExtraDy, -5px))) scale(calc(var(--megaStripeDrawingOverlayScale, var(--hgShirtOverlayScale, 1)) * var(--hgStripeDrawingExtraScale, 1)))',
                                  filter: (() => {
                                    const isPemberley = active === 'austen' && typeof resolvedOverlaySrc === 'string' && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc);
                                    const baseFx = drawingOverlayDebug
                                      ? 'drop-shadow(0 0 2px rgba(0,0,0,0.65))'
                                      : active === 'austen'
                                            && typeof resolvedOverlaySrc === 'string'
                                            && resolvedOverlaySrc.toLowerCase().includes('/austen/keep_calm/')
                                            && resolvedOverlaySrc.toLowerCase().endsWith('keep-calm-w-stripe.webp')
                                          ? 'drop-shadow(0 0 2px rgba(0,0,0,0.75))'
                                        : isPemberley
                                          ? 'drop-shadow(0 0 0px rgba(0,0,0,0.85))'
                                        : 'none';
                                    return baseFx;
                                  })(),
                                }}
                                loading="eager"
                                decoding="async"
                              />
                            </div>
                          );
                        })
                        : Array.from({ length: 14 }).map((_, idx) => {
                          // Tile buit (samarreta sense dibuix): no renderitzem res.
                          if (Array.isArray(stripeTileOverlaySrcs) && !stripeTileOverlaySrcs[idx]) {
                            return null;
                          }
                          const base = (() => {
                            try {
                              if (Array.isArray(stripeTileOverlaySrcs) && stripeTileOverlaySrcs[idx]) {
                                return normalizeOverlaySrc(stripeTileOverlaySrcs[idx]);
                              }
                              return normalizeOverlaySrc(drawingOverlaySrcEffective);
                            } catch {
                              return normalizeOverlaySrc(drawingOverlaySrcEffective);
                            }
                          })();

                          const resolvePerTileAssetSrc = (src) => {
                            try {
                              if (!src || typeof src !== 'string') return null;
                              const tpl = String(src || '').trim();
                              if (!tpl) return null;
                              const i1 = idx + 1;
                              const hasTpl = tpl.includes('{i}') || tpl.includes('{idx}') || tpl.includes('{n}');
                              if (hasTpl) {
                                return tpl
                                  .replace(/\{i\}/g, String(i1))
                                  .replace(/\{n\}/g, String(i1))
                                  .replace(/\{idx\}/g, String(idx));
                              }
                              return null;
                            } catch {
                              return null;
                            }
                          };
                          const isAustenKeepCalm = active === 'austen'
                            && typeof resolvedOverlaySrc === 'string'
                            && /\/austen\/keep_calm\//i.test(resolvedOverlaySrc);
                          const isAustenTileSwapBW = active === 'austen'
                            && typeof resolvedOverlaySrc === 'string'
                            && /\/austen\/(pemberley_house|crosswords|quotes)\//i.test(resolvedOverlaySrc);
                          const shouldApplyRules = active === 'first_contact' || active === 'the_human_inside' || active === 'cube' || active === 'miscellania' || isAustenKeepCalm || isAustenTileSwapBW;
                          const mode = active === 'the_human_inside' ? humanInsideVariant : firstContactVariant;
                          const isAustenPemberley = active === 'austen'
                            && typeof resolvedOverlaySrc === 'string'
                            && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc);

                          const resolveDrawingOverlaySrcForTile = (src) => {
                            try {
                              if (!src || typeof src !== 'string') return src;
                              const safeIdx = Number.isFinite(Number(idx)) ? Number(idx) : 0;
                              const isFirst = safeIdx === 0;
                              const isLast = safeIdx === 13;

                              if (active === 'cube' && !isFirst) {
                                if (/\/cube\/afrodita-c-stripe\.webp$/i.test(src)) {
                                  return '/custom_logos/drawings/images_originals/stripe/cube/afrodita-cut-c-stripe.webp';
                                }
                                if (/\/cube\/cyber-cube-stripe\.webp$/i.test(src)) {
                                  return '/custom_logos/drawings/images_originals/stripe/cube/cyber-cube-cut-stripe.webp';
                                }
                              }

                              const toBlack = (s) => {
                                let out = s;
                                out = out.replace(/\/white\//i, '/black/');
                                out = out.replace(/-w(?=[-.])/i, '-b');
                                return out;
                              };
                              const toWhite = (s) => {
                                let out = s;
                                out = out.replace(/\/black\//i, '/white/');
                                out = out.replace(/-b(?=[-.])/i, '-w');
                                return out;
                              };

                              if (!shouldApplyRules) return src;

                              if ((active === 'the_human_inside' || isAustenTileSwapBW) && (mode === 'white' || mode === 'black') && !isAustenPemberley) {
                                return mode === 'white' ? toWhite(src) : toBlack(src);
                              }

                              if (mode === 'color') {
                                const hasMultiLight = src.toLowerCase().includes('-multi-light-');
                                const hasMultiDark = src.toLowerCase().includes('-multi-dark-');
                                const hasThruLight = src.toLowerCase().includes('-multi-thru-light-');
                                const hasThruDark = src.toLowerCase().includes('-multi-thru-dark-');
                                const hasThruRed = src.toLowerCase().includes('-multi-thru-red-');
                                const hasWRed = src.toLowerCase().includes('-multi-w-red-');
                                if (isAustenPemberley) {
                                  if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                  return src;
                                }
                                if (isAustenKeepCalm) {
                                  const isRedShirt = shirtColor === '#BD2739';
                                  if (isRedShirt) {
                                    if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                    return src;
                                  }
                                  if (hasMultiLight) return src.replace(/-multi-light-/i, '-multi-dark-');
                                  return src;
                                }
                                if (hasMultiLight) return src;
                                if (hasMultiDark) return src.replace(/-multi-dark-/i, '-multi-light-');
                                if (hasThruLight) return src;
                                if (hasThruDark) return src.replace(/-multi-thru-dark-/i, '-multi-thru-light-');
                                if (hasWRed) return src;
                                if (hasThruRed) return src.replace(/-multi-thru-red-/i, '-multi-w-red-');
                                return src;
                              }

                              if (mode === 'white') {
                                const hasThruRed = src.toLowerCase().includes('-multi-thru-red-');
                                const hasWRed = src.toLowerCase().includes('-multi-w-red-');
                                if (hasThruRed || hasWRed) {
                                  return hasWRed ? src : src.replace(/-multi-thru-red-/i, '-multi-w-red-');
                                }
                                return toWhite(src);
                              }
                              if (mode === 'black') {
                                return toBlack(src);
                              }

                              return src;
                            } catch {
                              return src;
                            }
                          };

                          const perTileRaw = (() => {
                            try {
                              if (!base) return null;
                              return resolvePerTileAssetSrc(base);
                            } catch {
                              return null;
                            }
                          })();

                          const hasPerTileSrcFallback = Array.isArray(stripeTileOverlaySrcs) && !!stripeTileOverlaySrcs[idx];
                          const picked = (() => {
                            try {
                              if (!base) return null;
                              const candidate = perTileRaw || base;
                              if (hasPerTileSrcFallback) return candidate;
                              return resolveDrawingOverlaySrcForTile(candidate) || candidate;
                            } catch {
                              return base;
                            }
                          })();

                          const imgUrl = picked ? encodeURI(picked) : '';
                          return (
                            <div
                              key={`stripe-tile-drawing-fallback-${idx}-${imgUrl || ''}`}
                              style={{
                                position: 'absolute',
                                top: '0%',
                                height: '100%',
                                left: `${(idx / 14) * 100}%`,
                                width: `${(1 / 14) * 100}%`,
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                transform: tileGapPxLocal ? `translateX(${idx * tileGapPxLocal}px)` : 'none',
                              }}
                            >
                              <img
                                src={imgUrl ? imgUrl : undefined}
                                alt=""
                                className="block absolute inset-0"
                                onError={(e) => {
                                  try {
                                    e.currentTarget.style.display = 'none';
                                  } catch {
                                  }
                                }}
                                style={{
                                  pointerEvents: 'none',
                                  height: '100%',
                                  width: '100%',
                                  objectFit: 'contain',
                                  opacity: 0.98,
                                  transformOrigin: 'top center',
                                  transform:
                                    'translate(var(--megaStripeDrawingOverlayDx, var(--hgShirtOverlayDx, 0px)), calc(var(--megaStripeDrawingOverlayDy, var(--hgShirtOverlayDy, 0px)) + var(--hgStripeDrawingExtraDy, -5px))) scale(calc(var(--megaStripeDrawingOverlayScale, var(--hgShirtOverlayScale, 1)) * var(--hgStripeDrawingExtraScale, 1)))',
                                  filter: (() => {
                                    const isPemberley = active === 'austen' && typeof resolvedOverlaySrc === 'string' && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc);
                                    const baseFx = isPemberley ? 'drop-shadow(0 0 0px rgba(0,0,0,0.85))' : 'none';
                                    return baseFx;
                                  })(),
                                }}
                                loading="eager"
                                decoding="async"
                              />
                            </div>
                          );
                        })}
                    </div>
                  ) : null}

                  <div
                    className="absolute inset-0"
                    style={{
                      pointerEvents: 'auto',
                      background: 'transparent',
                      zIndex: 3,
                    }}
                    onPointerDown={(ev) => {
                      try {
                        const el = ev.currentTarget;
                        const r = el.getBoundingClientRect();
                        const x = (ev.clientX - r.left) / (r.width || 1);
                        const y = (ev.clientY - r.top) / (r.height || 1);
                        window.dispatchEvent(new CustomEvent('mega-stripe-full-hit', { detail: { x, y } }));
                      } catch {
                      }
                    }}
                  />
                </div>

                {/* Cercle fosc sobre el coll de cada samarreta, situat al gap
                    superior (fora de la imatge), alineat amb el centre de cada
                    casella. Configurable amb CSS vars: --hgStripeNeckDotSize,
                    --hgStripeNeckDotColor, --hgStripeNeckDotDy. */}
                <div className="absolute inset-0" aria-hidden="true" style={{ pointerEvents: 'none', zIndex: 40 }}>
                  {(Array.isArray(stripeMaskTileRectsRawPct) && stripeMaskTileRectsRawPct.length === 14
                    ? stripeMaskTileRectsRawPct.map((r, idx) => ({
                      idx,
                      cx: (Number(r?.left) || 0) + (Number(r?.width) || 0) / 2,
                    }))
                    : Array.from({ length: 14 }).map((_, idx) => ({
                      idx,
                      cx: ((idx + 0.5) / 14) * 100,
                    }))
                  ).filter(({ idx }) => Array.isArray(neckDotIndices) && neckDotIndices.includes(idx)).map(({ idx, cx }) => (
                    <span
                      key={`neck-dot-${idx}`}
                      style={{
                        position: 'absolute',
                        left: `${cx}%`,
                        top: 0,
                        width: 'var(--hgStripeNeckDotSize, 5.625px)',
                        height: 'var(--hgStripeNeckDotSize, 5.625px)',
                        borderRadius: '50%',
                        backgroundColor: 'var(--hgStripeNeckDotColor, #1a1a1a)',
                        transform: 'translate(-50%, calc(-100% + var(--hgStripeNeckDotDy, -2px)))',
                      }}
                    />
                  ))}
                </div>

                {/* Contorn de l'àrea de clic (samarretes), alineat amb la
                    màscara de la imatge (103% × 100%, centrat). Cada samarreta
                    es ressalta en passar-hi el ratolí; si `clicAreaHighlight`
                    (hover sobre el nom del dibuix) és cert, es ressalten totes. */}
                <ClicAreaOverlay
                  src="/placeholders/cercador/full-clic-area-5.svg"
                  highlightAll={!!clicAreaHighlight}
                  highlightIndices={clicAreaHighlightIndices}
                  tshirtColor={shirtColor}
                  disabledIndices={emptyTileIndices}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MegaStripePanel;
