import React from 'react';
import MegaColumn from './MegaColumn.jsx';

function MegaStripePanel({
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
}) {
  return (
    <div className="w-full shrink-0">
      <div className="relative z-10 grid grid-cols-1 gap-10">
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
            }}
          />
        ))}
      </div>

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
              {stripeOverlayLoadState !== 'ok' ? (
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
                    WebkitMaskImage: 'url(/placeholders/t-shirt_buttons/v5/full-clic-area-5.svg)',
                    maskImage: 'url(/placeholders/t-shirt_buttons/v5/full-clic-area-5.svg)',
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
                      src="/placeholders/t-shirt_buttons/v5/full-color-stripe-5.webp"
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
                          const base = (() => {
                            try {
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
                                if (isFirst) return toBlack(src);
                                if (isLast) return toWhite(src);
                                return src;
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
                                if (isFirst) {
                                  if (hasMultiDark) return src;
                                  if (hasMultiLight) return src.replace(/-multi-light-/i, '-multi-dark-');
                                  if (hasThruDark) return src;
                                  if (hasThruLight) return src.replace(/-multi-thru-light-/i, '-multi-thru-dark-');
                                  if (hasThruRed) return src;
                                  if (hasWRed) return src.replace(/-multi-w-red-/i, '-multi-thru-red-');
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
                                  return isFirst
                                    ? (hasThruRed ? src : src.replace(/-multi-w-red-/i, '-multi-thru-red-'))
                                    : (hasWRed ? src : src.replace(/-multi-thru-red-/i, '-multi-w-red-'));
                                }
                                return isFirst ? toBlack(src) : toWhite(src);
                              }
                              if (mode === 'black') {
                                return isLast ? toWhite(src) : toBlack(src);
                              }

                              return src;
                            } catch {
                              return src;
                            }
                          };

                          const picked = (() => {
                            try {
                              if (!base) return null;
                              const perTile = resolvePerTileAssetSrc(base);
                              const candidate = perTile || base;
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
                                    'translate(var(--megaStripeDrawingOverlayDx, var(--hgShirtOverlayDx, 0px)), var(--megaStripeDrawingOverlayDy, var(--hgShirtOverlayDy, 0px))) scale(var(--megaStripeDrawingOverlayScale, var(--hgShirtOverlayScale, 1)))',
                                  filter: (() => {
                                    const isPemberley = active === 'austen' && typeof resolvedOverlaySrc === 'string' && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc);
                                    const tileIsFirst = Number(idx) === 0;
                                    const tileIsLast = Number(idx) === 13;
                                    const invertPemb = isPemberley && ((mode === 'white' && tileIsFirst) || (mode === 'black' && !tileIsLast));
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
                                    if (!invertPemb) return baseFx;
                                    if (!baseFx || baseFx === 'none') return 'invert(1)';
                                    return `${baseFx} invert(1)`;
                                  })(),
                                }}
                                loading="eager"
                                decoding="async"
                              />
                            </div>
                          );
                        })
                        : Array.from({ length: 14 }).map((_, idx) => {
                          const base = (() => {
                            try {
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
                                if (isFirst) return toBlack(src);
                                if (isLast) return toWhite(src);
                                return src;
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
                                if (isFirst) {
                                  if (hasMultiDark) return src;
                                  if (hasMultiLight) return src.replace(/-multi-light-/i, '-multi-dark-');
                                  if (hasThruDark) return src;
                                  if (hasThruLight) return src.replace(/-multi-thru-light-/i, '-multi-thru-dark-');
                                  if (hasThruRed) return src;
                                  if (hasWRed) return src.replace(/-multi-w-red-/i, '-multi-thru-red-');
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
                                  return isFirst
                                    ? (hasThruRed ? src : src.replace(/-multi-w-red-/i, '-multi-thru-red-'))
                                    : (hasWRed ? src : src.replace(/-multi-thru-red-/i, '-multi-w-red-'));
                                }
                                return isFirst ? toBlack(src) : toWhite(src);
                              }
                              if (mode === 'black') {
                                return isLast ? toWhite(src) : toBlack(src);
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

                          const picked = (() => {
                            try {
                              if (!base) return null;
                              const candidate = perTileRaw || base;
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
                                    'translate(var(--megaStripeDrawingOverlayDx, var(--hgShirtOverlayDx, 0px)), var(--megaStripeDrawingOverlayDy, var(--hgShirtOverlayDy, 0px))) scale(var(--megaStripeDrawingOverlayScale, var(--hgShirtOverlayScale, 1)))',
                                  filter: (() => {
                                    const isPemberley = active === 'austen' && typeof resolvedOverlaySrc === 'string' && /\/austen\/pemberley_house\//i.test(resolvedOverlaySrc);
                                    const tileIsFirst = Number(idx) === 0;
                                    const tileIsLast = Number(idx) === 13;
                                    const invertPemb = isPemberley && ((mode === 'white' && tileIsFirst) || (mode === 'black' && !tileIsLast));
                                    const baseFx = isPemberley ? 'drop-shadow(0 0 0px rgba(0,0,0,0.85))' : 'none';
                                    if (!invertPemb) return baseFx;
                                    if (!baseFx || baseFx === 'none') return 'invert(1)';
                                    return `${baseFx} invert(1)`;
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
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MegaStripePanel;
