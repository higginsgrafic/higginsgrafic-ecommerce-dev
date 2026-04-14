import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Menu, UserRound, X } from 'lucide-react';
import { useProductContext } from '@/contexts/ProductContext';
import { getGildan5000Catalog } from '../utils/placeholders.js';
import {
  AUSTEN_QUOTES_ASSETS,
  resolveAustenQuoteAssetId,
  resolveAustenQuoteThumbFromPath,
  resolveAustenQuoteOriginalFromPath,
} from '../utils/austenQuotesAssets.js';
import FullWideSlideDemoHumanInsideSlider from './FullWideSlideDemoHumanInsideSlider.jsx';
import { UserProfileTabs, UserProfileContent } from './UserProfileTabs.jsx';

function MegaStripeBleedGuard({ heightPx, debug, expandLeftPx = 0, expandRightPx = 0, children }) {
  const l = Math.max(0, Number(expandLeftPx) || 0);
  const r = Math.max(0, Number(expandRightPx) || 0);
  const sum = l + r;
  return (
    <div
      style={{
        height: heightPx,
        width: sum ? `calc(100% + ${sum}px)` : '100%',
        maxWidth: 'none',
        position: 'relative',
        left: l ? `-${l}px` : 0,
        overflowY: 'visible',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          overflowX: 'visible',
          overflowY: 'visible',
          backgroundColor: debug ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            overflow: 'visible',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

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
            isFirstContact={active === 'first_contact' || active === 'austen' || active === 'cube' || active === 'outcasted'}
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
                          const shouldApplyRules = active === 'first_contact' || active === 'the_human_inside' || active === 'cube' || active === 'outcasted' || isAustenKeepCalm || isAustenTileSwapBW;
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
                          const shouldApplyRules = active === 'first_contact' || active === 'the_human_inside' || active === 'cube' || active === 'outcasted' || isAustenKeepCalm || isAustenTileSwapBW;
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

const FIRST_CONTACT_MEDIA = {
  'NX-01': '/custom_logos/drawings/images_stripe/first_contact/black/nx-01-b-stripe.webp',
  'NCC-1701': '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-b-stripe.webp',
  'NCC-1701-D': '/custom_logos/drawings/images_stripe/first_contact/black/ncc-1701-d-b-stripe.webp',
  'Wormhole': '/custom_logos/drawings/images_stripe/first_contact/black/wormhole-b-stripe.webp',
  'Plasma Escape': '/custom_logos/drawings/images_stripe/first_contact/black/plasma-escape-b-stripe.webp',
  "Vulcan's End": '/custom_logos/drawings/images_stripe/first_contact/black/vulcans-end-b-stripe.webp',
  'The Phoenix': '/custom_logos/drawings/images_stripe/first_contact/black/the-phoenix-b-stripe.webp',
};

const CONTROL_TILE_BN = 'botonera-bn';
const CONTROL_TILE_ARROWS = 'botonera-fletxes';

const MEGA_PUBLIC_IDLE_MS = 60 * 60 * 1000;
const MEGA_PUBLIC_LAST_ACTIVITY_AT_KEY = 'HG_MEGA_PUBLIC_LAST_ACTIVITY_AT';
const MEGA_PUBLIC_SELECTOR_STATE_KEY = 'HG_MEGA_PUBLIC_SELECTOR_STATE';

function touchMegaPublicActivity() {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage?.setItem(MEGA_PUBLIC_LAST_ACTIVITY_AT_KEY, String(Date.now()));
    window.dispatchEvent(new Event('hg-mega-public-activity'));
  } catch {
    // ignore
  }
}

 function resetMegaPublicState() {
   try {
     if (typeof window === 'undefined') return;
     window.sessionStorage?.removeItem(MEGA_PUBLIC_LAST_ACTIVITY_AT_KEY);
     window.sessionStorage?.removeItem(MEGA_PUBLIC_SELECTOR_STATE_KEY);
     window.dispatchEvent(new Event('mega-tile-selector-changed'));
   } catch {
     // ignore
   }
 }

function readMegaPublicLastActivityAt() {
  try {
    if (typeof window === 'undefined') return 0;
    const raw = window.sessionStorage?.getItem(MEGA_PUBLIC_LAST_ACTIVITY_AT_KEY);
    const n = raw == null ? NaN : Number.parseInt(String(raw), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function readMegaPublicSelectorState() {
  try {
    if (typeof window === 'undefined') return {};
    const raw = window.sessionStorage?.getItem(MEGA_PUBLIC_SELECTOR_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeMegaPublicSelectorState(next) {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage?.setItem(MEGA_PUBLIC_SELECTOR_STATE_KEY, JSON.stringify(next || {}));
  } catch {
    // ignore
  }
}

function getMegaPublicSelectorFor(collectionId, keyset) {
  try {
    const cid = (collectionId || '').toString();
    if (!cid) return null;
    const ks = String(keyset || 'v1');
    const root = readMegaPublicSelectorState();
    const perCollection = root?.[cid];
    const perKeyset = perCollection?.[ks];
    if (!perKeyset || typeof perKeyset !== 'object') return null;
    
    // Verificar si ha expirat (15 minuts = 900000 ms)
    const timestamp = perKeyset.timestamp;
    if (timestamp && typeof timestamp === 'number') {
      const elapsed = Date.now() - timestamp;
      const FIFTEEN_MINUTES = 15 * 60 * 1000;
      if (elapsed > FIFTEEN_MINUTES) {
        // Ha expirat, retornar null per forçar reset a t1
        return null;
      }
    }
    
    return perKeyset;
  } catch {
    return null;
  }
}

function setMegaPublicSelectorFor(collectionId, keyset, value) {
  try {
    const cid = (collectionId || '').toString();
    if (!cid) return;
    const ks = String(keyset || 'v1');
    const root = readMegaPublicSelectorState();
    const baseRoot = root && typeof root === 'object' ? root : {};
    const baseCollection = baseRoot?.[cid] && typeof baseRoot[cid] === 'object' ? baseRoot[cid] : {};
    const baseKeyset = baseCollection?.[ks] && typeof baseCollection[ks] === 'object' ? baseCollection[ks] : {};
    const nextKeyset = { 
      ...baseKeyset, 
      ...(value && typeof value === 'object' ? value : {}),
      timestamp: Date.now() // Guardar timestamp per expiració de 15 minuts
    };
    const nextCollection = { ...baseCollection, [ks]: nextKeyset };
    const next = { ...baseRoot, [cid]: nextCollection };
    writeMegaPublicSelectorState(next);
  } catch {
    // ignore
  }
}

const FIRST_CONTACT_MEDIA_WHITE = {
  'NX-01': '/custom_logos/drawings/images_stripe/first_contact/white/nx-01-w-stripe.webp',
  'NCC-1701': '/custom_logos/drawings/images_stripe/first_contact/white/ncc-1701-w-stripe.webp',
  'NCC-1701-D': '/custom_logos/drawings/images_stripe/first_contact/white/ncc-1701-d-w-stripe.webp',
  'Wormhole': '/custom_logos/drawings/images_stripe/first_contact/white/wormhole-w-stripe.webp',
  'Plasma Escape': '/custom_logos/drawings/images_stripe/first_contact/white/plasma-escape-w-stripe.webp',
  "Vulcan's End": '/custom_logos/drawings/images_stripe/first_contact/white/vulcans-end-w-stripe.webp',
  'The Phoenix': '/custom_logos/drawings/images_stripe/first_contact/white/the-phoenix-w-stripe.webp',
};

const FIRST_CONTACT_MEDIA_COLOR = {
  'NX-01': '/custom_logos/drawings/images_stripe/first_contact/multi/nx-01-multi-light-stripe.webp',
  'NCC-1701': '/custom_logos/drawings/images_stripe/first_contact/multi/ncc-1701-multi-light-stripe.webp',
  'NCC-1701-D': '/custom_logos/drawings/images_stripe/first_contact/multi/ncc-1701-d-multi-light-stripe.webp',
  'Wormhole': '/custom_logos/drawings/images_stripe/first_contact/multi/wormhole-multi-light-stripe.webp',
  'Plasma Escape': '/custom_logos/drawings/images_stripe/first_contact/multi/plasma-escape-multi-light-stripe.webp',
  "Vulcan's End": '/custom_logos/drawings/images_stripe/first_contact/multi/vulcans-end-multi-light-stripe.webp',
  'The Phoenix': '/custom_logos/drawings/images_stripe/first_contact/multi/the phoenix-multi-light-stripe.webp',
};

const THE_HUMAN_INSIDE_MEDIA = {
  'R2-D2': '/custom_logos/drawings/images_grid/the_human_inside/black/r2-d2-b-grid.webp',
  'The Dalek': '/custom_logos/drawings/images_grid/the_human_inside/black/the-dalek-b-grid.webp',
  'C3P0': '/custom_logos/drawings/images_grid/the_human_inside/black/c3-p0-b-grid.webp',
  'Vader': '/custom_logos/drawings/images_grid/the_human_inside/black/vader-b-grid.webp',
  'Afrodita': '/custom_logos/drawings/images_grid/the_human_inside/black/afrodita-a-b-grid.webp',
  'Mazinger': '/custom_logos/drawings/images_grid/the_human_inside/black/mazinger-z-b-grid.webp',
  'Cylon 78': '/custom_logos/drawings/images_grid/the_human_inside/black/cylon-78-b-grid.webp',
  'Cylon 03': '/custom_logos/drawings/images_grid/the_human_inside/black/cylon-03-b-grid.webp',
  'Iron Man 68': '/custom_logos/drawings/images_grid/the_human_inside/black/iron-man-68-b-grid.webp',
  'Iron Man 08': '/custom_logos/drawings/images_grid/the_human_inside/black/iron-man-08-b-grid.webp',
  Cyberman: '/custom_logos/drawings/images_grid/the_human_inside/black/cyberman-b-grid.webp',
  Robocop: '/custom_logos/drawings/images_grid/the_human_inside/black/robocop-b-grid.webp',
  Terminator: '/custom_logos/drawings/images_grid/the_human_inside/black/terminator-b-grid.webp',
  Maschinenmensch: '/custom_logos/drawings/images_grid/the_human_inside/black/maschinenmensch-b-grid.webp',
  'Robby the Robot': '/custom_logos/drawings/images_grid/the_human_inside/black/robby-the-robot-b-grid.webp',
  'Robbie the Robot': '/custom_logos/drawings/images_grid/the_human_inside/black/robby-the-robot-b-grid.webp',
};

const THE_HUMAN_INSIDE_MEDIA_WHITE = {
  ...THE_HUMAN_INSIDE_MEDIA,
};

const CUBE_MEDIA = {
  'Iron Kong': '/custom_logos/drawings/images_stripe/cube/iron-cube-08-iron-kong-stripe.webp',
  'Iron Cube 68': '/custom_logos/drawings/images_stripe/cube/iron-cube-68-stripe.webp',
  RoboCube: '/custom_logos/drawings/images_stripe/cube/robocube-stripe.webp',
  'Cylon Cube': '/custom_logos/drawings/images_stripe/cube/cylon-cube-03-stripe.webp',
  'Cylon Cube 03': '/custom_logos/drawings/images_stripe/cube/cylon-cube-03-stripe.webp',
  MaschinenCube: '/custom_logos/drawings/images_stripe/cube/maschinencube-stripe.webp',
  'Mazinger C': '/custom_logos/drawings/images_stripe/cube/mazinger-c-stripe.webp',
  'Afrodita C': '/custom_logos/drawings/images_stripe/cube/afrodita-c-stripe.webp',
  'Cube 3 P0': '/custom_logos/drawings/images_stripe/cube/cube-3-p0-stripe.webp',
  '3cube p0': '/custom_logos/drawings/images_stripe/cube/cube-3-p0-stripe.webp',
  '3cube-p0': '/custom_logos/drawings/images_stripe/cube/cube-3-p0-stripe.webp',
  'Cyber Cube': '/custom_logos/drawings/images_stripe/cube/cyber-cube-stripe.webp',
  'Darth Cube': '/custom_logos/drawings/images_stripe/cube/darth-cube-stripe.webp',
};

function FirstContactStripeMockupPanel({ megaTileSize, selectedItem, variant, resolveSrc, OptimizedImg }) {
  if (!megaTileSize) return null;
  if (!selectedItem) return null;
  if (!resolveSrc) return null;
  if (!OptimizedImg) return null;

  const inkSrc = resolveSrc(selectedItem);
  if (!inkSrc) return null;

  const shirtSrc =
    variant === 'white'
      ? '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png'
      : '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png';

  const overlayClass =
    selectedItem === 'The Phoenix'
      ? 'scale-[0.43]'
      : selectedItem === 'NX-01'
        ? 'scale-[0.26]'
        : selectedItem === 'NCC-1701'
          ? 'scale-[0.41]'
          : selectedItem === 'NCC-1701-D'
            ? 'scale-[0.54]'
            : selectedItem === 'Wormhole'
              ? 'scale-[0.30]'
              : selectedItem === 'Plasma Escape'
                ? 'scale-[0.30]'
                : selectedItem === "Vulcan's End"
                  ? 'scale-[0.36]'
                  : 'scale-[0.34]';

  return (
    <div
      className="absolute top-0 z-[20]"
      style={{
        width: `${Math.round(megaTileSize * (4 / 3))}px`,
        height: `${megaTileSize}px`,
        right: 0,
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-md bg-muted">
        <div className="relative h-full w-full">
          <OptimizedImg src={shirtSrc} alt="" className="absolute inset-0 h-full w-full object-contain" />
          <OptimizedImg
            src={inkSrc}
            alt=""
            className={`absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-contain ${overlayClass}`}
          />
        </div>
      </div>
    </div>
  );
}

const OptimizedImg = React.forwardRef(function OptimizedImg({ src, alt, className, style, ...rest }, ref) {
  const normalizeSrc = (value) => {
    const s = (value || '').toString();
    if (!s) return '';
    if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s)) return s;
    return s.startsWith('/') ? s : `/${s}`;
  };

  const originalSrc = normalizeSrc(src);
  const webpSrc = originalSrc.replace(/\.(png|jpe?g)(?=([?#]|$))/i, '.webp');
  const [currentSrc, setCurrentSrc] = useState(webpSrc);
  const triedFallbackRef = useRef(false);

  useEffect(() => {
    triedFallbackRef.current = false;
    setCurrentSrc(webpSrc);
  }, [webpSrc]);

  return (
    <img
      ref={ref}
      src={currentSrc ? encodeURI(currentSrc) : undefined}
      alt={alt}
      className={className}
      style={style}
      loading={rest?.loading || 'lazy'}
      decoding="async"
      onError={() => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          const s = (currentSrc || originalSrc || src || '').toString();
          const shouldLog =
            s.includes('/custom_logos/drawings/images_grid/cube/')
            || s.includes('/custom_logos/drawings/images_originals/stripe/cube/')
            || s.includes('/custom_logos/drawings/images_grid/the_human_inside/')
            || s.includes('/custom_logos/drawings/images_originals/stripe/the_human_inside/')
            || s.includes('/custom_logos/drawings/images_grid/first_contact/')
            || s.includes('/custom_logos/drawings/images_originals/stripe/first_contact/')
            || s.includes('/custom_logos/drawings/images_grid/miscel');
          if (shouldLog) {
            // eslint-disable-next-line no-console
            console.error('[OptimizedImg] tile error loading', { src, currentSrc, originalSrc });
          }
        }
        if (triedFallbackRef.current) return;
        triedFallbackRef.current = true;
        if (currentSrc !== originalSrc) setCurrentSrc(originalSrc);
      }}
      {...rest}
    />
  );
});

function IconButton({ label, onClick, onDoubleClick, onMouseEnter, buttonRef, children }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      className="inline-flex h-9 w-9 items-end justify-center pb-[2px] rounded-md text-foreground hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:h-10 lg:w-10 lg:pb-[3px]"
    >
      {children}
    </button>
  );
}

function FirstContactDibuix00Buttons({ onWhite, onBlack, onMulti, showWhite = true, showBlack = true, showMulti = true }) {
  const buttons = [];
  if (showWhite) buttons.push({ key: 'white', label: 'Blanc', onClick: onWhite });
  if (showBlack) buttons.push({ key: 'black', label: 'Negre', onClick: onBlack });
  if (showMulti) buttons.push({ key: 'color', label: 'Color', onClick: onMulti });

  if (!buttons.length) return null;

  const heightPct = 100 / buttons.length;

  return (
    <div className="relative mt-2 aspect-square w-full" data-stripe-buttonbar="bn">
      <div className="absolute inset-0 overflow-hidden rounded-md bg-muted">
        {buttons.map((btn, i) => {
          const topPct = i * heightPct;
          const isFirst = i === 0;
          const className = btn.key === 'white'
            ? 'bg-foreground'
            : btn.key === 'black'
              ? 'bg-background'
              : 'bg-muted';
          const textClass = btn.key === 'white' ? 'text-whiteStrong' : 'text-foreground';

          return (
            <button
              key={btn.key}
              type="button"
              aria-label={btn.label}
              id={isFirst ? 'stripe-guide-left-anchor' : undefined}
              onClick={btn.onClick}
              className={`absolute left-0 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
              style={{ top: `${topPct}%`, height: `${heightPct}%` }}
            >
              <span className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-oswald text-[20px] font-normal uppercase ${textClass}`}
              >
                {btn.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FirstContactDibuix09Buttons({
  onPrev,
  onNext,
  tileSize,
  onPrevPointerDown,
  onPrevPointerUp,
  onNextPointerDown,
  onNextPointerUp,
}) {
  const hasPrevPointerHandlers = typeof onPrevPointerDown === 'function' || typeof onPrevPointerUp === 'function';
  const hasNextPointerHandlers = typeof onNextPointerDown === 'function' || typeof onNextPointerUp === 'function';

  return (
    <div className="relative mt-2 aspect-square w-full">
      <div className="absolute inset-0 overflow-hidden rounded-md bg-muted" id="stripe-guide-right-anchor">
        <button
          type="button"
          aria-label="Anterior"
          onClick={hasPrevPointerHandlers ? undefined : onPrev}
          onPointerDown={onPrevPointerDown}
          onPointerUp={onPrevPointerUp}
          onPointerCancel={onPrevPointerUp}
          onPointerLeave={onPrevPointerUp}
          className="absolute left-0 top-0 h-full w-1/2 bg-transparent hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft
            className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground/80"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          aria-label="Següent"
          id="stripe-guide-right-arrow"
          onClick={hasNextPointerHandlers ? undefined : onNext}
          onPointerDown={onNextPointerDown}
          onPointerUp={onNextPointerUp}
          onPointerCancel={onNextPointerUp}
          onPointerLeave={onNextPointerUp}
          className="absolute right-0 top-0 h-full w-1/2 bg-transparent hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight
            className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground/80"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}

function MegaColumn({
  title,
  items,
  row = false,
  megaTileSize,
  isFirstContact,
  isHumanInside,
  collectionId,
  firstContactVariant,
  humanInsideVariant,
  onFirstContactWhite,
  onFirstContactBlack,
  onFirstContactMulti,
  onHumanWhite,
  onHumanBlack,
  onHumanMulti,
  onHumanPrev,
  onHumanNext,
  onSelectItem,
  onTileSize,
  disableMulti = false,
  stripeVariantVisibility,
  megaTileSelectorParams,
  onStartSelectorDrag,
}) {
  const tileSizeRef = useRef(null);
  const [tileSize, setTileSize] = useState(null);
  const humanInsideEnabled = Boolean(isHumanInside);
  const effectiveTileSize = megaTileSize || tileSize;
  const selectorTilePitchPx = (Number(effectiveTileSize) || 120) + 12;
  const selectorSizePx = Math.round(Number(megaTileSelectorParams?.sizePx) || 200);
  const selectorStrokePx = Math.min(80, Math.max(0, Number(megaTileSelectorParams?.strokePx) || 0));
  const selectorRadiusPx = Math.round(Math.min(200, Math.max(0, Number(megaTileSelectorParams?.radiusPx) || 0)));
  const selectorExtendTopPx = Number.isFinite(Number(megaTileSelectorParams?.extendTopPx)) ? Number(megaTileSelectorParams?.extendTopPx) : 0;
  const selectorExtendRightPx = Number.isFinite(Number(megaTileSelectorParams?.extendRightPx)) ? Number(megaTileSelectorParams?.extendRightPx) : 0;
  const selectorExtendBottomPx = Number.isFinite(Number(megaTileSelectorParams?.extendBottomPx)) ? Number(megaTileSelectorParams?.extendBottomPx) : 0;
  const selectorExtendLeftPx = Number.isFinite(Number(megaTileSelectorParams?.extendLeftPx)) ? Number(megaTileSelectorParams?.extendLeftPx) : 0;
  const selectorStepX = Number.isFinite(Number(megaTileSelectorParams?.stepX)) ? Number(megaTileSelectorParams?.stepX) : 0;
  const selectorStepY = Number.isFinite(Number(megaTileSelectorParams?.stepY)) ? Number(megaTileSelectorParams?.stepY) : 0;
  const selectorDxPx = selectorStepX * selectorTilePitchPx;
  const selectorDyPx = selectorStepY * selectorTilePitchPx;
  const selectorTranslateX = selectorDxPx + (selectorExtendRightPx - selectorExtendLeftPx) / 2;
  const selectorTranslateY = selectorDyPx + (selectorExtendBottomPx - selectorExtendTopPx) / 2;
  const selectorWidthPx = Math.max(1, selectorSizePx + selectorExtendLeftPx + selectorExtendRightPx);
  const selectorHeightPx = Math.max(1, selectorSizePx + selectorExtendTopPx + selectorExtendBottomPx);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pageStart, setPageStart] = useState(0);

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const gridCalibEnabled = !!urlParams?.has('gridCalib');
  const GRID_SCALE_STORAGE_KEY = useMemo(
    () => `HG_GRID_SCALES_${(collectionId || '').toString()}`,
    [collectionId]
  );
  const GRID_OFFSET_STORAGE_KEY = useMemo(
    () => `HG_GRID_OFFSETS_${(collectionId || '').toString()}`,
    [collectionId]
  );

  const cubeAdjustable = useMemo(
    () => new Set(['MaschinenCube', 'Mazinger C', 'Afrodita C', 'Cube 3 P0', 'Cyber Cube', 'Darth Cube', '3cube p0', '3cube-p0']),
    []
  );
  const cubeLocked = useMemo(
    () => new Set(['Iron Kong', 'Iron Cube 68', 'RoboCube', 'Cylon Cube', 'Cylon Cube 03']),
    []
  );

  const gridCalibKeyFor = (it) => {
    if (!it || typeof it !== 'string') return it;
    if (collectionId !== 'cube') return it;

    const raw = it.trim();
    const file = raw.split('/').filter(Boolean).pop() || raw;
    const lower = file.toLowerCase();
    const map = {
      'iron-kong.webp': 'Iron Kong',
      'iron-cube.webp': 'Iron Cube 68',
      'robocube.webp': 'RoboCube',
      'cylon-cube.webp': 'Cylon Cube 03',
      'maschinencube.webp': 'MaschinenCube',
      'mazinger-c.webp': 'Mazinger C',
      'afrodita-c.webp': 'Afrodita C',
      '3cube-p0.webp': 'Cube 3 P0',
      'cybercube.webp': 'Cyber Cube',
      'darth-cube.webp': 'Darth Cube',
    };
    return map[lower] || it;
  };

  const [gridScales, setGridScales] = useState(() => {
    try {
      if (typeof window === 'undefined') return {};
      const raw = window.localStorage.getItem(`HG_GRID_SCALES_${(collectionId || '').toString()}`);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });

  const [gridOffsets, setGridOffsets] = useState(() => {
    try {
      if (typeof window === 'undefined') return {};
      const raw = window.localStorage.getItem(`HG_GRID_OFFSETS_${(collectionId || '').toString()}`);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(GRID_SCALE_STORAGE_KEY, JSON.stringify(gridScales || {}));
    } catch {
      // ignore
    }
  }, [GRID_SCALE_STORAGE_KEY, gridScales]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(GRID_OFFSET_STORAGE_KEY, JSON.stringify(gridOffsets || {}));
    } catch {
      // ignore
    }
  }, [GRID_OFFSET_STORAGE_KEY, gridOffsets]);

  useEffect(() => {
    if (!gridCalibEnabled) return undefined;
    if (collectionId !== 'cube') return undefined;

    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = typeof document !== 'undefined' ? document.activeElement : null;
      const tag = el && typeof el.tagName === 'string' ? el.tagName.toLowerCase() : '';
      const isTypingTarget =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (el && typeof el.isContentEditable === 'boolean' && el.isContentEditable);
      if (isTypingTarget) return;

      const it = selectedItem;
      if (!it || typeof it !== 'string') return;
      const calibKey = gridCalibKeyFor(it);
      if (cubeLocked.has(calibKey)) return;
      if (!cubeAdjustable.has(calibKey)) return;

      const isScaleKey = e.key === '+' || e.key === '-' || e.key === '=' || e.key === '_';
      const isArrowKey = e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown';
      if (!isScaleKey && !isArrowKey) return;
      e.preventDefault();

      if (isScaleKey) {
        const dir = (e.key === '-' || e.key === '_') ? -1 : 1;
        const delta = (e.shiftKey ? 0.05 : 0.02) * dir;

        setGridScales((prev) => {
          const base = prev && typeof prev === 'object' ? prev : {};
          const current = Number.parseFloat(base[calibKey] ?? '');
          const start = Number.isFinite(current) ? current : 0.6;
          const next = Math.max(0.2, Math.min(1.5, Number((start + delta).toFixed(3))));
          return { ...base, [calibKey]: next };
        });
        return;
      }

      const step = e.shiftKey ? 6 : 2;
      const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
      const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
      if (!dx && !dy) return;

      setGridOffsets((prev) => {
        const base = prev && typeof prev === 'object' ? prev : {};
        const cur = base[calibKey] && typeof base[calibKey] === 'object' ? base[calibKey] : {};
        const cx = Number.isFinite(Number(cur.x)) ? Number(cur.x) : 0;
        const cy = Number.isFinite(Number(cur.y)) ? Number(cur.y) : 0;
        const next = { x: cx + dx, y: cy + dy };
        return { ...base, [calibKey]: next };
      });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [collectionId, cubeAdjustable, cubeLocked, selectedItem, gridCalibEnabled]);

  const effectiveItems = useMemo(() => {
    const list = Array.isArray(items) ? items.slice() : [];
    if (collectionId !== 'outcasted') return list.filter(Boolean);
    const variant = isHumanInside ? humanInsideVariant : firstContactVariant;
    const filtered = list.filter((it) => {
      if (it === CONTROL_TILE_BN || it === CONTROL_TILE_ARROWS) return true;
      if (typeof it !== 'string') return false;
      if (!isPathItem(it)) return true;
      if (variant === 'white' && it.includes('/black/')) return false;
      if (variant === 'black' && it.includes('/white/')) return false;
      return true;
    });
    return filtered.filter(Boolean);
  }, [items, collectionId, isHumanInside, humanInsideVariant, firstContactVariant]);

  const drawableItems = useMemo(() => {
    const list = Array.isArray(effectiveItems) ? effectiveItems.filter(Boolean) : [];
    return list.filter((it) => it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS);
  }, [CONTROL_TILE_ARROWS, CONTROL_TILE_BN, effectiveItems]);

  useEffect(() => {
    setPageStart(0);
  }, [collectionId]);

  const rowItems = useMemo(() => {
    if (!row) return effectiveItems;
    const list = Array.isArray(effectiveItems) ? effectiveItems.filter(Boolean) : [];
    const hasBn = list.includes(CONTROL_TILE_BN);
    const hasArrows = list.includes(CONTROL_TILE_ARROWS);
    if (!hasBn || !hasArrows) return list.slice(0, 9);

    if (drawableItems.length <= 7) {
      const padCount = Math.max(0, 7 - drawableItems.length);
      const pads = Array.from({ length: padCount }, () => null);
      return [CONTROL_TILE_BN, ...drawableItems, ...pads, CONTROL_TILE_ARROWS].slice(0, 9);
    }

    const len = drawableItems.length;
    const start = ((pageStart % len) + len) % len;
    const windowed = [];
    for (let i = 0; i < 7; i += 1) {
      windowed.push(drawableItems[(start + i) % len]);
    }
    return [CONTROL_TILE_BN, ...windowed, CONTROL_TILE_ARROWS];
  }, [CONTROL_TILE_ARROWS, CONTROL_TILE_BN, drawableItems, effectiveItems, pageStart, row]);

  useLayoutEffect(() => {
    try {
      if (!row) return;
      if (!collectionId) return;
      if (!megaTileSelectorParams?.enabled) return;
      const keyset = String(megaTileSelectorParams?.keyset || 'v1');
      const existing = getMegaPublicSelectorFor(collectionId, keyset);
      const existingTarget = typeof existing?.target === 'string' ? existing.target.trim() : '';
      if (existingTarget) return;

      // Sempre usar t1 (índex 1) com a posició per defecte
      const candidate = rowItems?.[1] || rowItems?.[0] || null;
      if (typeof candidate !== 'string') return;
      setMegaPublicSelectorFor(collectionId, keyset, { target: candidate, stepX: 0, stepY: 0 });
      window.dispatchEvent(new Event('mega-tile-selector-changed'));
    } catch {
      // ignore
    }
  }, [collectionId, megaTileSelectorParams?.enabled, megaTileSelectorParams?.keyset, row, rowItems]);

  const selectorDragBounds = useMemo(() => {
    try {
      if (!row) return null;
      const targetRaw = String(megaTileSelectorParams?.target || '').trim().toLowerCase();
      if (!targetRaw) return null;
      const idx = rowItems.findIndex((it) => typeof it === 'string' && String(it || '').trim().toLowerCase() === targetRaw);
      if (idx < 0) return null;
      return { minStepX: 1 - idx, maxStepX: 7 - idx, lockStepY: true };
    } catch {
      return null;
    }
  }, [megaTileSelectorParams?.target, row, rowItems]);

  const selectorStepXForRender = selectorDragBounds
    ? Math.min(selectorDragBounds.maxStepX, Math.max(selectorDragBounds.minStepX, selectorStepX))
    : selectorStepX;
  const selectorStepYForRender = selectorDragBounds ? 0 : selectorStepY;
  const selectorTranslateXForRender = (selectorStepXForRender * selectorTilePitchPx) + (selectorExtendRightPx - selectorExtendLeftPx) / 2;
  const selectorTranslateYForRender = (selectorStepYForRender * selectorTilePitchPx) + (selectorExtendBottomPx - selectorExtendTopPx) / 2;

  useLayoutEffect(() => {
    if (!row) return;
    const el = tileSizeRef.current;
    if (!el) return;

    const recompute = () => {
      const w = el.clientWidth;
      if (!w) return;
      setTileSize(w);
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [row]);

  useEffect(() => {
    if (!row) return;
    if (!tileSize) return;
    if (!onTileSize) return;
    onTileSize(tileSize);
  }, [row, tileSize, onTileSize]);

  const baseItems = useMemo(() => {
    return rowItems.filter((it) => it && it !== CONTROL_TILE_BN && it !== CONTROL_TILE_ARROWS);
  }, [rowItems]);

  const preloadedThumbsRef = useRef(new Set());
  const preloadThumbSrc = (src) => {
    try {
      if (!src || typeof src !== 'string') return;
      const normalized = src.trim();
      if (!normalized) return;
      if (preloadedThumbsRef.current.has(normalized)) return;
      preloadedThumbsRef.current.add(normalized);
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = encodeURI(normalized);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const limit = collectionId === 'the_human_inside' ? 48 : 24;
    baseItems.slice(0, limit).forEach((it) => {
      const src = resolveGridThumbSrc(it, collectionId) || resolveSrc(it);
      preloadThumbSrc(src);
    });
  }, [baseItems, collectionId]);

  const outcastedStripeTiles = collectionId === 'outcasted' ? Math.max(0, Math.min(7, baseItems.length)) : 7;

  const thinSlideEnabled = isHumanInside && row && drawableItems.length > 7;
  const pagingEnabled = row && !thinSlideEnabled && drawableItems.length > 7;

  function isPathItem(it) {
    return typeof it === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(it);
  }

  function deriveVariantPath(p, variant) {
    if (typeof p !== 'string') return null;
    if (!isPathItem(p)) return null;
    let next = p;

    // Normalize legacy folder names to canonical ones.
    if (next.includes('/blanc/')) next = next.replace('/blanc/', '/white/');
    if (next.includes('/negre/')) next = next.replace('/negre/', '/black/');
    if (next.startsWith('blanc/')) next = `white/${next.slice('blanc/'.length)}`;
    if (next.startsWith('negre/')) next = `black/${next.slice('negre/'.length)}`;

    if (variant === 'color') return next;

    if (!variant || variant === 'black') {
      if (next.includes('/white/')) next = next.replace('/white/', '/black/');
      if (/-w\.(png|jpg|jpeg|webp)$/i.test(next)) next = next.replace(/-w\.(png|jpg|jpeg|webp)$/i, '-b.$1');
      return next;
    }
    if (next.includes('/black/')) next = next.replace('/black/', '/white/');
    if (/-b\.(png|jpg|jpeg|webp)$/i.test(next)) next = next.replace(/-b\.(png|jpg|jpeg|webp)$/i, '-w.$1');
    return next;
  }

  const labelForItem = (it) => {
    if (typeof it !== 'string') return '';
    if (!isPathItem(it)) return it;
    const seg = it.split('/').filter(Boolean);
    const base = seg.length ? seg[seg.length - 1] : it;
    const noExt = base.replace(/\.(png|jpg|jpeg|webp)$/i, '');
    const noSuffixes = noExt
      .replace(/-(grid|stripe)$/i, '')
      .replace(/-(b|w)$/i, '')
      .replace(/-(b|w)-(grid|stripe)$/i, '')
      .replace(/-(grid|stripe)-(b|w)$/i, '')
      .replace(/-(b|w)-stripe$/i, '')
      .replace(/-stripe-(b|w)$/i, '')
      .replace(/-(b|w)-grid$/i, '')
      .replace(/-grid-(b|w)$/i, '')
      .replace(/-+$/g, '');
    const baseLabel = noSuffixes.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    const titleCased = baseLabel
      .split(' ')
      .filter(Boolean)
      .map((w) => {
        const head = w.slice(0, 1);
        const tail = w.slice(1);
        return `${head.toUpperCase()}${tail}`;
      })
      .join(' ');
    if (collectionId === 'austen') {
      const lower = it.toLowerCase();
      if (lower.includes('/austen/keep_calm/') && titleCased === 'Keep Calm Multi Red') return 'Keep Calm Red';
      if (lower.includes('/austen/looking_for_my_darcy/')) {
        return titleCased.replace(/\bGradient\b/gi, '').replace(/\s+/g, ' ').trim();
      }
      if (lower.includes('/austen/quotes/')) {
        if (titleCased === 'Unsociable And Taciturn') return 'Unsociable';
        if (titleCased === 'Half Agony Half Hope') return 'Half Agony';
      }
    }
    return titleCased;
  };

  const labelForItemWhenSelected = (it) => {
    const full = labelForItem(it);
    if (!full) return full;
    const pp = full.match(/^Pride And Prejudice(?:\s+(\d+))?$/);
    if (pp) return `P&P ${pp[1] || '1'}`;
    const ss = full.match(/^Sense And Sensibility(?:\s+(\d+))?$/);
    if (ss) return `S&S ${ss[1] || '1'}`;
    return full;
  };

  const normalizeKey = (value) => {
    if (typeof value !== 'string') return '';
    return value
      .trim()
      .toLowerCase()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const resolveSrc = (it) => {
    if (!it) return null;

    if (typeof it === 'string') {
      const raw = it.trim();
      const fixedStripeFolder = raw.replace(
        '/custom_logos/drawings/images_stripe/stripe/',
        '/custom_logos/drawings/images_stripe/',
      );
      if (fixedStripeFolder !== raw && (fixedStripeFolder.startsWith('/custom_logos/') || fixedStripeFolder.includes('/custom_logos/'))) {
        const customIdx = fixedStripeFolder.indexOf('/custom_logos/');
        if (customIdx !== -1) return fixedStripeFolder.slice(customIdx);
      }
      const publicIdx = raw.indexOf('/public/');
      if (publicIdx !== -1) {
        const sub = raw.slice(publicIdx + '/public'.length);
        if (sub.startsWith('/custom_logos/') || sub.startsWith('/placeholders/') || sub.startsWith('/tmp/')) {
          return sub;
        }
      }
      const customIdx = raw.indexOf('/custom_logos/');
      if (customIdx !== -1) return raw.slice(customIdx);
      const placeholdersIdx = raw.indexOf('/placeholders/');
      if (placeholdersIdx !== -1) return raw.slice(placeholdersIdx);
      if (raw.startsWith('/custom_logos/') || raw.startsWith('/placeholders/') || raw.startsWith('/tmp/')) {
        return raw;
      }
    }

    const itKey = normalizeKey(it);
    const variant = isHumanInside ? humanInsideVariant : firstContactVariant;
    if (collectionId === 'cube') {
      return CUBE_MEDIA[itKey] || CUBE_MEDIA[it] || null;
    }
    if (isPathItem(it) && collectionId) {
      const vPath = deriveVariantPath(it, variant) || it;
      if (typeof vPath === 'string' && vPath.startsWith('/')) return ensureThumbSuffix(vPath, 'stripe');

      if (collectionId === 'outcasted') {
        const normalized = typeof vPath === 'string' ? vPath.replace(/^\/?(black|white)\//i, '') : vPath;
        if (variant === 'color') {
          return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/miscel·lania/multi/${normalized}`, 'stripe');
        }
        if (variant === 'white') {
          return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/miscel·lania/white/${normalized}`, 'stripe');
        }
        return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/miscel·lania/black/${normalized}`, 'stripe');
      }

      if (collectionId === 'the_human_inside') {
        const normalized = typeof vPath === 'string' ? vPath.replace(/^\/?(black|white)\//i, '') : vPath;
        const folder = variant === 'white' ? 'white' : 'black';
        return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/the_human_inside/${folder}/${normalized}`, 'stripe');
      }

      const out = `/custom_logos/drawings/images_stripe/${collectionId}/${vPath}`;
      return ensureThumbSuffix(out, 'stripe');
    }
    if (isHumanInside && (THE_HUMAN_INSIDE_MEDIA[itKey] || THE_HUMAN_INSIDE_MEDIA[it])) {
      return (humanInsideVariant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[itKey]
        || (humanInsideVariant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[it]
        || null;
    }
    if (FIRST_CONTACT_MEDIA[itKey] || FIRST_CONTACT_MEDIA[it] || FIRST_CONTACT_MEDIA_COLOR[itKey] || FIRST_CONTACT_MEDIA_COLOR[it]) {
      const base = FIRST_CONTACT_MEDIA[itKey] || FIRST_CONTACT_MEDIA[it] || null;
      const white = FIRST_CONTACT_MEDIA_WHITE[itKey] || FIRST_CONTACT_MEDIA_WHITE[it] || base;
      const color = FIRST_CONTACT_MEDIA_COLOR[itKey] || FIRST_CONTACT_MEDIA_COLOR[it] || base;
      return (firstContactVariant === 'white' ? white : firstContactVariant === 'color' ? color : base) || null;
    }
    return null;
  };

  const ensureThumbSuffix = (src, kind) => {
    if (!src || typeof src !== 'string') return src;
    const [base, q] = src.split('?');
    if (!base) return src;
    const m = base.match(/^(.*)\.(webp|png|jpe?g)$/i);
    if (!m) return src;
    const prefix = m[1].replace(/-(grid|stripe)$/i, '');
    const ext = m[2];
    const want = `-${kind}`;
    const outBase = prefix.toLowerCase().endsWith(want) ? `${prefix}.${ext}` : `${prefix}${want}.${ext}`;
    return q ? `${outBase}?${q}` : outBase;
  };

  const resolveGridThumbSrc = (it, collectionIdOverride) => {
    if (!it || typeof it !== 'string') return resolveSrc(it);
    const raw = it.trim();
    const inferred = (() => {
      const m = raw.match(/\/custom_logos\/drawings\/(?:images_grid|images_stripe|images_originals\/(?:grid|stripe))\/([^/]+)\//i);
      return m?.[1] || null;
    })();
    const cid = collectionIdOverride || collectionId || inferred;

    if (cid === 'first_contact' && !isPathItem(raw)) {
      const key = normalizeKey(raw);
      const fileByLabel = {
        'NX-01': 'nx-01',
        'NCC-1701': 'ncc-1701',
        'NCC-1701-D': 'ncc1701-d',
        Wormhole: 'wormhole',
        'Plasma Escape': 'plasma-escape',
        "Vulcan's End": 'vulcans-end',
        'The Phoenix': 'the-phoenix',
      };
      const base = fileByLabel[key] || fileByLabel[raw] || null;
      if (!base) return resolveSrc(it);

      const folder = 'black';
      const suffix = 'b';
      return ensureThumbSuffix(`/custom_logos/drawings/images_grid/first_contact/${folder}/${base}-${suffix}-grid.webp`, 'grid');
    }

    if (raw.startsWith('/custom_logos/drawings/images_grid/')) {
      if (cid === 'outcasted' && raw.startsWith('/custom_logos/drawings/images_grid/miscel·lania/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        const outcastedMap = {
          'dj-vader-grid.webp': 'dj-vader-b-grid.webp',
          'dj-vader.webp': 'dj-vader-b-grid.webp',
          'death-star2d2-grid.webp': 'death-star2d2-b-grid.webp',
          'death-star2d2.webp': 'death-star2d2-b-grid.webp',
          'pont-del-diable-grid.webp': 'pont-del-diable-b-grid.webp',
          'pont-del-diable.webp': 'pont-del-diable-b-grid.webp',
        };
        const mapped = outcastedMap[lower];
        if (mapped) return `/custom_logos/drawings/images_grid/miscel·lania/${mapped}`;
      }
      if (cid === 'austen' && raw.includes('/austen/quotes/')) {
        return resolveAustenQuoteThumbFromPath(raw, 'grid') || ensureThumbSuffix(raw, 'grid');
      }
      if (cid === 'austen' && raw.includes('/austen/keep_calm/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        if (
          lower === 'keep-calm-black.webp'
          || lower === 'keep-calm-black-grid.webp'
          || lower === 'keep-calm-b.webp'
          || lower === 'keep-calm-b-grid.webp'
        ) {
          return '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-b-grid.webp';
        }
        return ensureThumbSuffix(raw, 'grid');
      }
      if (cid === 'austen' && raw.includes('/austen/looking_for_my_darcy/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        const base = lower.replace(/\.(webp|png|jpe?g)$/i, '').replace(/-grid$/i, '');

        const mapped = (() => {
          if (base.endsWith('-dark-gradient') || base.endsWith('-dark')) {
            const c = base.replace(/-(dark-gradient|dark)$/i, '');
            return `${c}-dark-gradient-grid.webp`;
          }
          if (base.endsWith('-light-gradient') || base.endsWith('-light')) {
            const c = base.replace(/-(light-gradient|light)$/i, '');
            return `${c}-light-gradient-grid.webp`;
          }
          if (base.endsWith('-frame')) {
            const c = base.replace(/-frame$/i, '');
            return `${c}-frame-grid.webp`;
          }
          if (base.endsWith('-solid')) {
            const c = base.replace(/-solid$/i, '');
            return `${c}-solid-grid.webp`;
          }
          return file;
        })();

        return ensureThumbSuffix(`/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/${mapped}`, 'grid');
      }
      return ensureThumbSuffix(raw, 'grid');
    }

    if (
      raw.startsWith('/custom_logos/drawings/images_stripe/')
      || raw.startsWith('/custom_logos/drawings/images_originals/stripe/')
    ) {
      const file = raw.split('/').pop() || '';
      const baseFile = file.replace(/-stripe\.(webp|png|jpe?g)$/i, '.$1');

      if (cid === 'first_contact') {
        const map = {
          '1-nx-01-b.webp': 'nx-01.webp',
          '1-nx-01-w.webp': 'nx-01.webp',
          '2-ncc-1701-b.webp': 'ncc-1701.webp',
          '2-ncc-1701-w.webp': 'ncc-1701.webp',
          '3-ncc-1701-d-b.webp': 'ncc1701-d.webp',
          '3-ncc-1701-d-w.webp': 'ncc1701-d.webp',
          '4-wormhole-b.webp': 'wormhole.webp',
          '4-wormhole-w.webp': 'wormhole.webp',
          '5-plasma-escape-b.webp': 'plasma-escape.webp',
          '5-plasma-escape-w.webp': 'plasma-escape.webp',
          '6-vulcans-end-b.webp': 'vulcans-end.webp',
          '6-vulcans-end-w.webp': 'vulcans-end.webp',
          '7-the-phoenix-b.webp': 'the-phoenix.webp',
          '7-the-phoenix-w.webp': 'the-phoenix.webp',
        };
        const out = map[baseFile.toLowerCase()];
        if (out) return ensureThumbSuffix(`/custom_logos/drawings/images_grid/first_contact/${out}`, 'grid');
      }

      if (cid === 'the_human_inside') {
        return ensureThumbSuffix(`/custom_logos/drawings/images_grid/the_human_inside/${baseFile}`, 'grid');
      }

      if (cid === 'cube') {
        const map = {
          'iron-cube-68.webp': 'iron-cube.webp',
          'iron-cube-08-iron-kong.webp': 'iron-kong.webp',
          'cube-3-p0.webp': '3cube-p0.webp',
          'cyber-cube.webp': 'cybercube.webp',
          'cylon-cube-03.webp': 'cylon-cube.webp',
        };
        const out = map[baseFile.toLowerCase()] || baseFile;
        return ensureThumbSuffix(`/custom_logos/drawings/images_grid/cube/${out}`, 'grid');
      }

      if (cid === 'outcasted') {
        const lower = baseFile.toLowerCase();
        if (lower === 'dj-vader.webp') return '/custom_logos/drawings/images_grid/miscel·lania/dj-vader-b-grid.webp';
        if (lower === 'dj-vader-b.webp') return '/custom_logos/drawings/images_grid/miscel·lania/dj-vader-b-grid.webp';
        if (lower === 'death-star2d2.webp') return '/custom_logos/drawings/images_grid/miscel·lania/death-star2d2-b-grid.webp';
        if (lower === 'death-star2d2-b.webp') return '/custom_logos/drawings/images_grid/miscel·lania/death-star2d2-b-grid.webp';
        if (lower === 'pont-del-diable.webp') return '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable-b-grid.webp';
        if (lower === 'pont-del-diable-b.webp') return '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable-b-grid.webp';
        return ensureThumbSuffix(`/custom_logos/drawings/images_grid/miscel·lania/${baseFile.replace(/-b\.webp$/i, '-b-grid.webp')}`, 'grid');
      }

      if (cid === 'austen') {
        if (raw.includes('/austen/quotes/')) {
          return resolveAustenQuoteThumbFromPath(raw, 'grid') || null;
        }
        if (raw.includes('/austen/keep_calm/')) {
          const lower = baseFile.toLowerCase();
          if (lower === 'keep-calm-black.webp' || lower === 'keep-calm-b.webp') {
            return '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-b-grid.webp';
          }
          if (lower === 'keep-calm-w.webp') {
            return '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-multi-w-red-grid.webp';
          }
          if (lower.includes('keep-calm-multi-w-red')) {
            return '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-multi-w-red-grid.webp';
          }
          if (lower.includes('keep-calm-multi')) {
            return '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-multi-red-grid.webp';
          }
          return ensureThumbSuffix(`/custom_logos/drawings/images_grid/austen/keep_calm/${baseFile}`, 'grid');
        }
        if (raw.includes('/austen/looking_for_my_darcy/')) {
          return ensureThumbSuffix(`/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/${baseFile}`, 'grid');
        }
        if (raw.includes('/austen/pemberley_house/')) {
          return ensureThumbSuffix(`/custom_logos/drawings/images_grid/austen/pemberley_house/${baseFile}`, 'grid');
        }
        if (raw.includes('/austen/crosswords/')) {
          return ensureThumbSuffix(`/custom_logos/drawings/images_grid/austen/crosswords/${baseFile}`, 'grid');
        }
      }
    }

    if (
      raw.includes('/austen/quotes/')
      && (
        raw.startsWith('/placeholders/images_grid/')
        || raw.startsWith('/custom_logos/drawings/images_grid/')
        || raw.startsWith('/custom_logos/drawings/images_stripe/')
        || raw.startsWith('/custom_logos/drawings/images_originals/stripe/')
      )
    ) {
      return resolveAustenQuoteThumbFromPath(raw, 'grid') || resolveSrc(it);
    }
    if (raw.startsWith('placeholders/images_grid/')) {
      return ensureThumbSuffix(`/custom_logos/drawings/images_grid/${raw.replace(/^placeholders\/images_grid\//, '')}`, 'grid');
    }
    if (raw.startsWith('/placeholders/images_grid/')) {
      return ensureThumbSuffix(raw.replace(/^\/placeholders\/images_grid\//, '/custom_logos/drawings/images_grid/'), 'grid');
    }
    if (cid === 'cube' && isPathItem(raw) && !raw.startsWith('/')) {
      const map = {
        'iron-cube-68.webp': 'iron-cube.webp',
        'iron-cube-08-iron-kong.webp': 'iron-kong.webp',
        'cube-3-p0.webp': '3cube-p0.webp',
        cybercube: 'cyber-cube.webp',
        'cylon-cube.webp': 'cylon-cube-03.webp',
      };
      const file = map[raw.toLowerCase()] || raw;
      return ensureThumbSuffix(`/custom_logos/drawings/images_grid/cube/${file}`, 'grid');
    }
    const key = normalizeKey(it).toLowerCase();

    if (cid === 'first_contact') {
      const map = {
        'nx-01': 'nx-01.webp',
        'ncc-1701': 'ncc-1701.webp',
        'ncc-1701-d': 'ncc1701-d.webp',
        wormhole: 'wormhole.webp',
        'plasma escape': 'plasma-escape.webp',
        "vulcan's end": 'vulcans-end.webp',
        'the phoenix': 'the-phoenix.webp',
      };
      const file = map[key];
      return file ? ensureThumbSuffix(`/custom_logos/drawings/images_grid/first_contact/${file}`, 'grid') : resolveSrc(it);
    }

    if (cid === 'the_human_inside') {
      const baseByLabel = {
        'r2-d2': 'r2-d2',
        c3p0: 'c3-p0',
        vader: 'vader',
        afrodita: 'afrodita-a',
        mazinger: 'mazinger-z',
        'cylon 78': 'cylon-78',
        'cylon 03': 'cylon-03',
        'iron man 68': 'iron-man-68',
        'iron man 08': 'iron-man-08',
        cyberman: 'cyberman',
        'the dalek': 'the-dalek',
        robocop: 'robocop',
        terminator: 'terminator',
        maschinenmensch: 'maschinenmensch',
        'robby the robot': 'robby-the-robot',
        'robbie the robot': 'robby-the-robot',
      };
      const keySpaced = key.replace(/-/g, ' ');
      const base = baseByLabel[key] || baseByLabel[keySpaced];
      if (!base) return null;
      return ensureThumbSuffix(`/custom_logos/drawings/images_grid/the_human_inside/black/${base}-b-grid.webp`, 'grid');
    }

    if (cid === 'austen') {
      const id = resolveAustenQuoteAssetId(key);
      if (id && AUSTEN_QUOTES_ASSETS[id]?.grid) return AUSTEN_QUOTES_ASSETS[id].grid;
      if (typeof raw === 'string' && raw.includes('/austen/quotes/')) return AUSTEN_QUOTES_ASSETS.it_is_a_truth.grid;
      return null;
    }

    if (cid === 'cube') {
      const map = {
        'afrodita c': 'afrodita-c.webp',
        'mazinger c': 'mazinger-c.webp',
        'iron cube': 'iron-cube.webp',
        'iron cube 68': 'iron-cube.webp',
        'iron kong': 'iron-kong.webp',
        'iron cube 08 iron kong': 'iron-kong.webp',
        'cube 3 p0': '3cube-p0.webp',
        'darth cube': 'darth-cube.webp',
        maschinencube: 'maschinencube.webp',
        robocube: 'robocube.webp',
        cybercube: 'cybercube.webp',
        'cyber cube': 'cybercube.webp',
        'cylon cube': 'cylon-cube.webp',
        'cylon cube 03': 'cylon-cube.webp',
      };
      const file = map[key];
      const out = file ? ensureThumbSuffix(`/custom_logos/drawings/images_grid/cube/${file}`, 'grid') : null;
      if (import.meta.env.DEV && !out) {
        // eslint-disable-next-line no-console
        console.error('[CUBE grid thumb] unresolved', { it, key, raw });
      }
      return out;
    }

    if (cid === 'outcasted') {
      const s = it.toLowerCase();
      if (s.includes('dj-vader')) return '/custom_logos/drawings/images_grid/miscel·lania/dj-vader-b-grid.webp';
      if (s.includes('death-star2d2')) return '/custom_logos/drawings/images_grid/miscel·lania/death-star2d2-b-grid.webp';
      if (s.includes('pont-del-diable')) return '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable-b-grid.webp';
      return resolveSrc(it);
    }

    return resolveSrc(it);
  };

  const resolveStripeThumbSrc = (it) => {
    if (!it || typeof it !== 'string') return null;
    const raw = it.trim();

    // Never let STRIPE thumbnails come from GRID or ORIGINALS.
    if (raw.startsWith('/custom_logos/drawings/images_stripe/')) return ensureThumbSuffix(raw, 'stripe');

    if (raw.startsWith('/custom_logos/drawings/images_originals/stripe/')) {
      const lower = raw.toLowerCase();
      if (lower.includes('/austen/crosswords/')) {
        const file = (lower.split('/').pop() || '').replace(/\?.*$/, '');
        const m = file.match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d+)-stripe\.(webp|png)$/i);
        if (m) {
          const folder = m[1].replace(/-/g, '_');
          return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/austen/crosswords/${folder}/${m[1]}-${m[2]}.${m[3]}`, 'stripe');
        }
      }

      const mapped = raw.replace(
        '/custom_logos/drawings/images_originals/stripe/',
        '/custom_logos/drawings/images_stripe/',
      );
      return ensureThumbSuffix(mapped, 'stripe');
    }

    if (collectionId === 'austen') {
      const variant = firstContactVariant;
      const key = normalizeKey(it).toLowerCase();
      const id = resolveAustenQuoteAssetId(key);
      if (id) {
        const slug = String(id || '').replace(/_/g, '-');
        const whiteStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
        const multiStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
        const out = variant === 'color'
          ? `/custom_logos/drawings/images_stripe/austen/quotes/multi/${multiStem}-multi-light-stripe.webp`
          : variant === 'white'
            ? `/custom_logos/drawings/images_stripe/austen/quotes/white/${whiteStem}-w-stripe.webp`
            : `/custom_logos/drawings/images_stripe/austen/quotes/black/${slug}-b-stripe.webp`;
        return ensureThumbSuffix(out, 'stripe');
      }
      if (raw.includes('/austen/quotes/')) {
        try {
          const file = (raw.split('/').pop() || '').replace(/\?.*$/, '');
          const slug = file
            .toLowerCase()
            .replace(/-(b|w)-stripe(?=\.webp$)/i, '')
            .replace(/-b-grid(?=\.webp$)/i, '')
            .replace(/-grid(?=\.webp$)/i, '')
            .replace(/\.webp$/i, '');
          const whiteStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          const multiStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          const out = variant === 'color'
            ? `/custom_logos/drawings/images_stripe/austen/quotes/multi/${multiStem}-multi-light-stripe.webp`
            : variant === 'white'
              ? `/custom_logos/drawings/images_stripe/austen/quotes/white/${whiteStem}-w-stripe.webp`
              : `/custom_logos/drawings/images_stripe/austen/quotes/black/${slug}-b-stripe.webp`;
          return ensureThumbSuffix(out, 'stripe');
        } catch {
          return resolveAustenQuoteThumbFromPath(raw, 'stripe') || null;
        }
      }

      if (raw.includes('/austen/keep_calm/')) {
        try {
          const file = (raw.split('/').pop() || '').toString().trim().toLowerCase();
          const isKcb = file.includes('keep-calm-b') || file.includes('keep-calm-black');
          const isKcr = file.includes('keep-calm-multi-red') || file.includes('keep-calm-multi-w-red');

          // Keep Calm Black (KCB): color must be the multi-light/dark pair (NOT thru-red).
          if (isKcb) {
            const out = variant === 'color'
              ? '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-light-stripe.webp'
              : variant === 'white'
                ? '/custom_logos/drawings/images_stripe/austen/keep_calm/white/keep-calm-w-stripe.webp'
                : '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
            return ensureThumbSuffix(out, 'stripe');
          }

          // Keep Calm Red (KCR): white/black are the red-background variants.
          if (isKcr) {
            const out = variant === 'color'
              ? '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-thru-light-stripe.webp'
              : variant === 'white'
                ? '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-w-red-stripe.webp'
                : '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-thru-red-stripe.webp';
            return ensureThumbSuffix(out, 'stripe');
          }

          // Default fallback: keep previous behavior.
          const out = variant === 'color'
            ? '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-thru-red-stripe.webp'
            : variant === 'white'
              ? '/custom_logos/drawings/images_stripe/austen/keep_calm/white/keep-calm-w-stripe.webp'
              : '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
          return ensureThumbSuffix(out, 'stripe');
        } catch {
          const out = variant === 'color'
            ? '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-thru-red-stripe.webp'
            : variant === 'white'
              ? '/custom_logos/drawings/images_stripe/austen/keep_calm/white/keep-calm-w-stripe.webp'
              : '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
          return ensureThumbSuffix(out, 'stripe');
        }
      }

      if (raw.includes('/austen/pemberley_house/')) {
        const out = '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp';
        return ensureThumbSuffix(out, 'stripe');
      }

      if (raw.includes('/austen/crosswords/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        const m = lower.replace(/-grid(?=\.webp$)/i, '').match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d)(?:-stripe)?\.webp$/);
        if (m) {
          const book = m[1];
          const n = m[2];
          // Crosswords has NO color variant. Treat `color` as `white`.
          const out = variant === 'black'
            ? `/custom_logos/drawings/images_stripe/austen/crosswords/black/${book}-${n}-b-stripe.webp`
            : `/custom_logos/drawings/images_stripe/austen/crosswords/white/${book}-${n}-w-stripe.webp`;
          return ensureThumbSuffix(out, 'stripe');
        }
      }

      if (raw.includes('/austen/looking_for_my_darcy/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        if (lower.includes('dark-gradient')) return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/${file}`, 'stripe');
        if (lower.includes('light-gradient')) return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/light/${file}`, 'stripe');
        if (lower.includes('-frame')) return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/${file}`, 'stripe');
        if (lower.includes('-solid')) return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/solid/${file}`, 'stripe');
      }

      if (raw.includes('/austen/pemberley_house/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        if (lower === 'pemberley-house-b-grid.webp' || lower === 'pemberley-house-b.webp' || lower === 'pemberley-house-b-stripe.webp') {
          return '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp';
        }
        if (lower === 'pemberley-house-w-grid.webp' || lower === 'pemberley-house-w.webp' || lower === 'pemberley-house-w-stripe.webp') {
          return '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp';
        }
      }

      if (raw.includes('/austen/crosswords/')) {
        const file = raw.split('/').pop() || '';
        const lower = file.toLowerCase();
        const persuasion = lower.match(/^persuasion-(\d)(?:-grid)?\.webp$/);
        if (persuasion) return variant === 'black'
          ? `/custom_logos/drawings/images_stripe/austen/crosswords/black/persuasion-${persuasion[1]}-b-stripe.webp`
          : `/custom_logos/drawings/images_stripe/austen/crosswords/white/persuasion-${persuasion[1]}-w-stripe.webp`;
        const pride = lower.match(/^pride-and-prejudice-(\d)(?:-grid)?\.webp$/);
        if (pride) return variant === 'black'
          ? `/custom_logos/drawings/images_stripe/austen/crosswords/black/pride-and-prejudice-${pride[1]}-b-stripe.webp`
          : `/custom_logos/drawings/images_stripe/austen/crosswords/white/pride-and-prejudice-${pride[1]}-w-stripe.webp`;
        const sense = lower.match(/^sense-and-sensibility-(\d)(?:-grid)?\.webp$/);
        if (sense) return variant === 'black'
          ? `/custom_logos/drawings/images_stripe/austen/crosswords/black/sense-and-sensibility-${sense[1]}-b-stripe.webp`
          : `/custom_logos/drawings/images_stripe/austen/crosswords/white/sense-and-sensibility-${sense[1]}-w-stripe.webp`;
      }

      return null;
    }

    if (collectionId === 'cube') {
      const file = raw.split('/').pop() || '';
      const map = {
        'iron-kong.webp': 'iron-cube-08-iron-kong.webp',
        'iron-cube.webp': 'iron-cube-68.webp',
        '3cube-p0.webp': 'cube-3-p0.webp',
        cybercube: 'cyber-cube.webp',
        'cylon-cube.webp': 'cylon-cube-03.webp',
      };
      const master = map[file.toLowerCase()] || file;
      return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/cube/${master}`, 'stripe');
    }

    if (collectionId === 'outcasted') {
      const file = raw.split('/').pop() || '';
      const map = {
        'dj-vader.webp': 'dj-vader-b.webp',
        'death-star2d2.webp': 'death-star2d2-b.webp',
      };
      const master = map[file.toLowerCase()] || file;
      return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/miscel·lania/black/${master}`, 'stripe');
    }

    if (collectionId === 'the_human_inside') {
      const key = normalizeKey(it).toLowerCase();
      const keySpaced = key.replace(/-/g, ' ');
      const labelMap = {
        'r2-d2': 'r2-d2.webp',
        c3p0: 'c3-p0.webp',
        vader: 'vader.webp',
        afrodita: 'afrodita-a.webp',
        mazinger: 'mazinger-z.webp',
        'cylon 78': 'cylon-78.webp',
        'cylon 03': 'cylon-03.webp',
        'iron man 68': 'iron-man-68.webp',
        'iron man 08': 'iron-man-08.webp',
        cyberman: 'cyberman.webp',
        'the dalek': 'the-dalek.webp',
        robocop: 'robocop.webp',
        terminator: 'terminator.webp',
        maschinenmensch: 'maschinenmensch.webp',
        'robby the robot': 'robbie-the-robot.webp',
        'robbie the robot': 'robby-the-robot.webp',
      };

      const file = labelMap[key] || labelMap[keySpaced] || (raw.split('/').pop() || '');
      return ensureThumbSuffix(`/custom_logos/drawings/images_stripe/the_human_inside/black/${file}`, 'stripe');
    }

    if (collectionId === 'cube') {
      const key = normalizeKey(it).toLowerCase();
      const labelMap = {
        'iron kong': 'iron-cube-08-iron-kong.webp',
        'iron cube': 'iron-cube-68.webp',
        'iron cube 68': 'iron-cube-68.webp',
        robocube: 'robocube.webp',
        'cylon cube': 'cylon-cube-03.webp',
        'cylon cube 03': 'cylon-cube-03.webp',
        maschinencube: 'maschinencube.webp',
        'mazinger c': 'mazinger-c.webp',
        'afrodita c': 'afrodita-c.webp',
        'cube 3 p0': 'cube-3-p0.webp',
        '3cube p0': 'cube-3-p0.webp',
        '3cube-p0': 'cube-3-p0.webp',
        cybercube: 'cyber-cube.webp',
        'cyber cube': 'cyber-cube.webp',
        'darth cube': 'darth-cube.webp',
      };

      const file = raw.split('/').pop() || '';
      const fileMap = {
        'iron-kong.webp': 'iron-cube-08-iron-kong.webp',
        'iron-cube.webp': 'iron-cube-68.webp',
        '3cube-p0.webp': 'cube-3-p0.webp',
        cybercube: 'cyber-cube.webp',
        'cylon-cube.webp': 'cylon-cube-03.webp',
      };

      const master = labelMap[key] || fileMap[file.toLowerCase()] || file;
      return master ? ensureThumbSuffix(`/custom_logos/drawings/images_stripe/cube/${master}`, 'stripe') : null;
    }

    if (collectionId === 'first_contact') {
      const file = raw.split('/').pop() || '';
      const map = {
        'nx-01.webp': '1-nx-01-b.webp',
        'ncc-1701.webp': '2-ncc-1701-b.webp',
        'ncc1701-d.webp': '3-ncc-1701-d-b.webp',
        'wormhole.webp': '4-wormhole-b.webp',
        'plasma-escape.webp': '5-plasma-escape-b.webp',
        'vulcans-end.webp': '6-vulcans-end-b.webp',
        'the-phoenix.webp': '7-the-phoenix-b.webp',
      };
      const out = map[file.toLowerCase()];
      return out ? ensureThumbSuffix(`/custom_logos/drawings/images_stripe/first_contact/black/${out}`, 'stripe') : null;
    }

    return null;
  };

  const gridScaleFor = (it) => {
    if (!it || typeof it !== 'string') return 0.6;
    const k = gridCalibKeyFor(it);
    const v = Number.parseFloat(gridScales?.[k] ?? '');
    if (Number.isFinite(v)) return v;
    if (it === 'Mazinger') return 0.64;
    if (it === 'Maschinenmensch') return 0.65;
    return 0.6;
  };

  const gridOffsetFor = (it) => {
    if (!it || typeof it !== 'string') return { x: 0, y: 0 };
    const k = gridCalibKeyFor(it);
    const raw = gridOffsets?.[k];
    if (!raw || typeof raw !== 'object') return { x: 0, y: 0 };
    const x = Number.isFinite(Number(raw.x)) ? Number(raw.x) : 0;
    const y = Number.isFinite(Number(raw.y)) ? Number(raw.y) : 0;
    return { x, y };
  };

  return (
    <div className="min-w-0">
      {row ? (
        <div className="grid w-full grid-cols-9 gap-x-3">
          {rowItems.map((it, idx) => (
            <div
              key={`${it}-${idx}`}
              className="min-w-0 relative z-10"
              style={humanInsideEnabled && effectiveTileSize ? { width: `${effectiveTileSize}px` } : undefined}
            >
              {(() => {
                const isSelected = Boolean(
                  megaTileSelectorParams?.enabled
                  && typeof it === 'string'
                  && String(it || '').trim().toLowerCase() === String(megaTileSelectorParams?.target || '').trim().toLowerCase(),
                );
                const displayLabel = isSelected ? labelForItemWhenSelected(it) : labelForItem(it);

                return !it || it === CONTROL_TILE_ARROWS || it === CONTROL_TILE_BN ? (
                  <div className="h-4" />
                ) : (
                  <Link
                    to="#"
                    className={`relative z-[60] flex h-[20px] w-full items-center justify-center whitespace-nowrap rounded-none px-2 font-roboto-condensed leading-[20px] uppercase text-foreground hover:text-foreground ${
                      isSelected
                        ? 'text-[12.8px] font-normal tracking-[0.1em] bg-transparent'
                        : 'text-[11.2px] font-normal bg-muted'
                    }`}
                    style={{
                      color: isSelected
                        ? String(megaTileSelectorParams?.color || '').trim() || undefined
                        : undefined,
                    }}
                    data-mega-label="1"
                    data-mega-collection={collectionId}
                    data-mega-item={typeof it === 'string' ? it : ''}
                    onClick={(e) => {
                      if (typeof onSelectItem !== 'function') return;
                      e.preventDefault();
                      onSelectItem(it);
                    }}
                  >
                    {displayLabel}
                  </Link>
                );
              })()}

              {!it ? null : it === CONTROL_TILE_BN ? (
                <div className="relative z-40 mt-2">
                  {isFirstContact ? (
                    <FirstContactDibuix00Buttons
                      onWhite={onFirstContactWhite}
                      onBlack={onFirstContactBlack}
                      onMulti={onFirstContactMulti}
                      showWhite={stripeVariantVisibility?.white !== false}
                      showBlack={stripeVariantVisibility?.black !== false}
                      showMulti={stripeVariantVisibility?.color !== false}
                    />
                  ) : isHumanInside ? (
                    <FirstContactDibuix00Buttons
                      onWhite={onHumanWhite}
                      onBlack={onHumanBlack}
                      onMulti={onHumanMulti}
                      showWhite={stripeVariantVisibility?.white !== false}
                      showBlack={stripeVariantVisibility?.black !== false}
                      showMulti={stripeVariantVisibility?.color !== false}
                    />
                  ) : collectionId === 'austen' ? (
                    <FirstContactDibuix00Buttons
                      onWhite={onFirstContactWhite}
                      onBlack={onFirstContactBlack}
                      onMulti={onFirstContactMulti}
                      showWhite={stripeVariantVisibility?.white !== false}
                      showBlack={stripeVariantVisibility?.black !== false}
                      showMulti={stripeVariantVisibility?.color !== false}
                    />
                  ) : null}
                </div>
              ) : it === CONTROL_TILE_ARROWS ? (
                <div
                  className={`relative z-40 mt-2 ${thinSlideEnabled || pagingEnabled ? '' : 'opacity-30 pointer-events-none'}`}
                  aria-hidden={thinSlideEnabled || pagingEnabled ? undefined : true}
                >
                  <FirstContactDibuix09Buttons
                    tileSize={tileSize}
                    onPrev={() => {
                      touchMegaPublicActivity();
                      if (thinSlideEnabled) {
                        setPageStart((v) => v - 1);
                        if (onHumanPrev) return onHumanPrev();
                        return;
                      }
                      if (pagingEnabled) return setPageStart((v) => v - 1);
                      if (isHumanInside && !humanInsideEnabled && onHumanPrev) return onHumanPrev();
                    }}
                    onNext={() => {
                      touchMegaPublicActivity();
                      if (thinSlideEnabled) {
                        setPageStart((v) => v + 1);
                        if (onHumanNext) return onHumanNext();
                        return;
                      }
                      if (pagingEnabled) return setPageStart((v) => v + 1);
                      if (isHumanInside && !humanInsideEnabled && onHumanNext) return onHumanNext();
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className={`relative z-50 mt-2 aspect-square w-full ${typeof onSelectItem === 'function' ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}`}
                  data-mega-tile="1"
                  data-mega-collection={collectionId}
                  data-mega-item={typeof it === 'string' ? it : ''}
                  ref={idx === 1 ? tileSizeRef : undefined}
                  style={{
                    transform: `translate(${gridOffsetFor(it).x}px, ${gridOffsetFor(it).y}px)`,
                  }}
                  onClick={(e) => {
                    if (typeof onSelectItem !== 'function') return;
                    e.preventDefault();
                    if (import.meta.env.DEV && collectionId === 'cube') {
                      // eslint-disable-next-line no-console
                      console.error('[MEGA cube tile click]', {
                        it,
                        thumb: resolveGridThumbSrc(it, collectionId),
                      });
                    }
                    setSelectedItem(it);
                    onSelectItem(it);

                    try {
                      if (!row) return;
                      if (!megaTileSelectorParams?.enabled) return;
                      if (idx < 1 || idx > 7) return;
                      if (typeof window === 'undefined') return;
                      if (typeof it !== 'string') return;
                      const keyset = String(megaTileSelectorParams?.keyset || 'v1');
                      setMegaPublicSelectorFor(collectionId, keyset, { target: String(it), stepX: 0, stepY: 0 });
                      touchMegaPublicActivity();
                      window.dispatchEvent(new Event('mega-tile-selector-changed'));
                    } catch {
                      // ignore
                    }
                  }}
                  tabIndex={typeof onSelectItem === 'function' ? 0 : -1}
                  onKeyDown={(e) => {
                    if (typeof onSelectItem !== 'function') return;
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    setSelectedItem(it);
                    onSelectItem(it);

                    try {
                      if (!row) return;
                      if (!megaTileSelectorParams?.enabled) return;
                      if (idx < 1 || idx > 7) return;
                      if (typeof window === 'undefined') return;
                      if (typeof it !== 'string') return;
                      const keyset = String(megaTileSelectorParams?.keyset || 'v1');
                      setMegaPublicSelectorFor(collectionId, keyset, { target: String(it), stepX: 0, stepY: 0 });
                      touchMegaPublicActivity();
                      window.dispatchEvent(new Event('mega-tile-selector-changed'));
                    } catch {
                      // ignore
                    }
                  }}
                >
                  <div
                    className={`absolute inset-0 z-20 overflow-hidden rounded-md ${
                      collectionId === 'austen'
                      && typeof it === 'string'
                      && it.toLowerCase().includes('/austen/keep_calm/')
                      && (
                        it.toLowerCase().endsWith('keep-calm-black.webp')
                        || it.toLowerCase().endsWith('keep-calm-b.webp')
                        || it.toLowerCase().endsWith('keep-calm-b-grid.webp')
                      )
                        ? 'bg-white'
                        : collectionId === 'austen'
                          && typeof it === 'string'
                          && it.toLowerCase().includes('/austen/pemberley_house/')
                          ? 'bg-transparent'
                        : 'bg-transparent'
                    }`}
                  >
                    {(() => {
                      const thumbSrc = resolveGridThumbSrc(it, collectionId);
                      const useContain =
                        collectionId === 'austen'
                        && typeof it === 'string'
                        && (it.includes('/austen/quotes/') || it.includes('/austen/crosswords/'));
                      return thumbSrc ? (
                        <OptimizedImg
                          src={thumbSrc}
                          alt={labelForItem(it) || it}
                          className={useContain ? 'h-full w-full object-contain' : 'h-full w-full object-cover'}
                        />
                      ) : (
                        <div className="h-full w-full bg-black/5" />
                      );
                    })()}
                  </div>

                  {megaTileSelectorParams?.enabled
                    && typeof it === 'string'
                    && String(it || '').trim().toLowerCase() === String(megaTileSelectorParams?.target || '').trim().toLowerCase() ? (
                    String(megaTileSelectorParams?.keyset || 'v1') === 'v2' ? (
                      <>
                        <div
                          className="absolute left-1/2 top-1/2 z-10 bg-muted"
                          style={{
                            transform: `translate(calc(-50% + ${selectorTranslateXForRender}px), calc(-50% + ${selectorTranslateYForRender}px))`,
                            width: `${selectorWidthPx}px`,
                            height: `${selectorHeightPx}px`,
                            borderStyle: 'none',
                            borderWidth: '0px',
                            borderColor: 'transparent',
                            background: 'color-mix(in srgb, color-mix(in srgb, hsl(var(--muted)) 97%, rgb(59 130 246) 3%) 90%, white 10%)',
                            borderRadius: `${selectorRadiusPx}px`,
                            boxSizing: 'border-box',
                            pointerEvents: 'none',
                          }}
                          aria-hidden="true"
                        />
                        <div
                          className="absolute left-1/2 top-1/2 z-40"
                          style={{
                            transform: `translate(calc(-50% + ${selectorTranslateXForRender}px), calc(-50% + ${selectorTranslateYForRender}px))`,
                            width: `${selectorWidthPx}px`,
                            height: `${selectorHeightPx}px`,
                            borderStyle: 'none',
                            borderWidth: '0px',
                            borderColor: 'transparent',
                            background: 'transparent',
                            borderRadius: `${selectorRadiusPx}px`,
                            boxSizing: 'border-box',
                            cursor: 'grab',
                            pointerEvents: 'auto',
                          }}
                          aria-hidden="true"
                          data-circle-selector="1"
                          onPointerDown={(e) => {
                            if (typeof onStartSelectorDrag !== 'function') return;
                            e.preventDefault();
                            e.stopPropagation();
                            if (!selectorDragBounds) return;
                            onStartSelectorDrag(e, { ...megaTileSelectorParams, collectionId }, selectorDragBounds);
                          }}
                        />
                      </>
                    ) : (
                      <div
                        className="absolute left-1/2 top-1/2 z-40"
                        style={{
                          transform: `translate(calc(-50% + ${selectorTranslateXForRender}px), calc(-50% + ${selectorTranslateYForRender}px))`,
                          width: `${selectorWidthPx}px`,
                          height: `${selectorHeightPx}px`,
                          borderStyle: 'solid',
                          borderWidth: `${selectorStrokePx}px`,
                          borderColor: String(megaTileSelectorParams?.color || 'black'),
                          background: 'transparent',
                          borderRadius: `${selectorRadiusPx}px`,
                          boxSizing: 'border-box',
                          cursor: 'grab',
                          pointerEvents: 'auto',
                        }}
                        aria-hidden="true"
                        data-circle-selector="1"
                        onPointerDown={(e) => {
                          if (typeof onStartSelectorDrag !== 'function') return;
                          e.preventDefault();
                          e.stopPropagation();
                          if (!selectorDragBounds) return;
                          onStartSelectorDrag(e, { ...megaTileSelectorParams, collectionId }, selectorDragBounds);
                        }}
                      />
                    )
                  ) : null}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-2">
          {items.map((it) => (
            <Link key={it} to="#" className="text-sm text-muted-foreground hover:text-foreground whitespace-nowrap">
              {it}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FullWideSlideDemoHeader({
  cartItemCount,
  onCartClick,
  onUserClick,
  ignoreStripeDebugFromUrl = false,
  stripeItemLeftOffsetPxByIndex,
  redistributeStripeBetweenFirstAndLast = false,
  contained = false,
  portalContainer,
  manualEnabledOverride,
  initialActiveId,
  navItems,
  megaConfig,
  showStripe = true,
  showCatalogPanel = true,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { products: contextProducts } = useProductContext();
  const cartClickTimeoutRef = useRef(null);
  const accountClickTimeoutRef = useRef(null);
  const dblClickDelayMs = 0;
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estat per als productes del carrusel
  const [carouselProducts, setCarouselProducts] = useState([
    { img: 'color-card-white.webp', name: 'SENSE & SENSIBILITY', collection: 'austen', drawing: 'austen/crosswords/sense-and-sensibility-4-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
    { img: 'color-card-light-blue.webp', name: 'ROBBIE THE ROBOT', collection: 'the_human_inside', drawing: 'the_human_inside/black/robbie-the-robot-b-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
    { img: 'color-card-royal.webp', name: 'PRIDE & PREJUDICE', collection: 'austen', drawing: 'austen/crosswords/pride-and-prejudice-1-stripe.webp', price: '19,95€', qty: 1, size: 'M', isTemplate: true, disabled: false },
    { img: 'color-card-navy.webp', name: 'ROBOCUBE', collection: 'cube', drawing: 'cube/robocube-stripe.webp', price: '19,95€', qty: 2, size: 'XL', isTemplate: true, disabled: false },
    { img: 'color-card-purple.webp', name: 'PONT DEL DIABLE', collection: 'miscel·lania', drawing: 'miscel·lania/black/pont-del-diable-b-stripe.webp', price: '19,95€', qty: 1, size: 'S', isTemplate: true, disabled: false },
    { img: 'color-card-light pink.webp', name: 'NCC-1701-D', collection: 'first_contact', drawing: 'first_contact/black/ncc-1701-d-b-stripe.webp', price: '19,95€', qty: 1, size: 'M', isTemplate: true, disabled: false },
    { img: 'color-card-daisy.webp', name: 'MASCHINENMENSCH', collection: 'the_human_inside', drawing: 'the_human_inside/black/maschinenmensch-b-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
    { img: 'color-card-gold.webp', name: 'PERSUASION', collection: 'austen', drawing: 'austen/crosswords/persuasion-1-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
    { img: 'color-card-red.webp', name: 'CYBER CUBE', collection: 'cube', drawing: 'cube/cyber-cube-stripe.webp', price: '19,95€', qty: 3, size: 'M', isTemplate: true, disabled: false },
    { img: 'color-card-kiwi.webp', name: 'DJ VADER', collection: 'miscel·lania', drawing: 'miscel·lania/black/dj-vader-b-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
    { img: 'color-card-irish-green .webp', name: 'PLASMA ESCAPE', collection: 'first_contact', drawing: 'first_contact/black/plasma-escape-b-stripe.webp', price: '19,95€', qty: 1, size: 'XL', isTemplate: true, disabled: false },
    { img: 'color-card-military-green.webp', name: 'VADER', collection: 'the_human_inside', drawing: 'the_human_inside/black/vader-b-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
    { img: 'color-card-forest.webp', name: 'SENSE & SENSIBILITY', collection: 'austen', drawing: 'austen/crosswords/sense-and-sensibility-1-stripe.webp', price: '19,95€', qty: 1, size: 'M', isTemplate: true, disabled: false },
    { img: 'color-card-black.webp', name: 'MAZINGER C', collection: 'cube', drawing: 'cube/mazinger-c-stripe.webp', price: '19,95€', qty: 1, size: 'L', isTemplate: true, disabled: false },
  ]);

  // Funcions per modificar quantitat
  const updateQuantity = (index, delta) => {
    setCarouselProducts(prev => prev.map((p, i) => 
      i === index ? { ...p, qty: Math.max(1, p.qty + delta) } : p
    ));
  };

  // Funcions per modificar tallatge
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const updateSize = (index, delta) => {
    setCarouselProducts(prev => prev.map((p, i) => {
      if (i !== index) return p;
      const currentIdx = sizes.indexOf(p.size);
      const newIdx = Math.max(0, Math.min(sizes.length - 1, currentIdx + delta));
      return { ...p, size: sizes[newIdx] };
    }));
  };

  // Funció per desactivar producte (només desactivar, no reactivar)
  const disableProduct = (index) => {
    setCarouselProducts(prev => prev.map((p, i) => 
      i === index ? { ...p, disabled: true } : p
    ));
  };
  const searchResults = useMemo(() => {
    const products = Array.isArray(contextProducts) ? contextProducts : [];
    const q = (searchQuery || '').toString().trim().toLowerCase();

    const normalizeCollectionKey = (value) => {
      return (value || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/_/g, '-')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const allowedCollectionKeys = new Set(['the-human-inside', 'first-contact', 'austen', 'outcasted']);
    const collectionLabelByKey = {
      'the-human-inside': 'The Human Inside',
      'first-contact': 'First Contact',
      austen: 'Austen',
      outcasted: 'Miscel·lània',
    };

    const isCubeRelated = (p) => {
      const haystack = `${p?.collection || ''} ${p?.slug || ''} ${p?.name || ''} ${p?.description || ''}`.toLowerCase();
      return haystack.includes('cube');
    };

    const matches = (p) => {
      if (!p) return false;
      if (!q) return true;
      const haystack = `${p.slug || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
      return haystack.includes(q);
    };

    const toPriceLabel = (value) => {
      if (typeof value === 'number' && Number.isFinite(value)) return `${value.toFixed(2)} €`;
      if (typeof value === 'string' && value.trim()) return value.trim();
      return '—';
    };

    return products
      .filter((p) => allowedCollectionKeys.has(normalizeCollectionKey(p?.collection)))
      .filter((p) => !isCubeRelated(p))
      .filter((p) => matches(p))
      .slice(0, 160)
      .map((p) => {
        const id = p?.slug || p?.id;
        const slugOrId = p?.slug || p?.id;
        const collectionKey = normalizeCollectionKey(p?.collection);
        const collection = (collectionLabelByKey?.[collectionKey] || p?.collection || 'Catàleg').toString();
        const name = (p?.name || 'Producte').toString();
        const image = p?.image || p?.images?.[0] || null;
        return {
          id: id?.toString() || name,
          slugOrId,
          category: collection,
          title: name,
          price: toPriceLabel(p?.price),
          image,
        };
      });
  }, [contextProducts, searchQuery]);

  const searchAccent = '#ef4444';
  const searchTopLinks = useMemo(() => ['Novetats', 'Samarretes', 'Bosses', 'Promocions'], []);

  const searchSuggestions = useMemo(
    () => [
      'Samarreta Gildan 5000',
      'Dibuixos',
      'Logotips',
      'Bosses',
      'Papereria',
    ],
    []
  );
  const [searchGridScale, setSearchGridScale] = useState(1);
  const [searchCaretVisible, setSearchCaretVisible] = useState(true);
  const [megaPage, setMegaPage] = useState(1);
  const [megaFullScreen, setMegaFullScreen] = useState(false);
  const [acordioExpanded, setAcordioExpanded] = useState(false);
  const [acordioExpandedPage4, setAcordioExpandedPage4] = useState(false);
  const [activeUserTab, setActiveUserTab] = useState('1');
  const [firstContactSelectedItem, setFirstContactSelectedItem] = useState(null);
  const [humanInsideSelectedItem, setHumanInsideSelectedItem] = useState(null);
  const [selectedItemByCollection, setSelectedItemByCollection] = useState({});
  const [active, setActive] = useState(() => {
    try {
      const p = new URLSearchParams(location.search);
      const fromUrl = p.get('active') || p.get('collection') || '';
      const next = typeof fromUrl === 'string' ? fromUrl.trim() : '';
      const allowed = new Set(['first_contact', 'the_human_inside', 'austen', 'cube', 'outcasted']);
      if (next && allowed.has(next)) return next;

      if (contained) return initialActiveId || 'first_contact';
      if (typeof manualEnabledOverride === 'boolean') {
        return manualEnabledOverride ? (initialActiveId || 'first_contact') : null;
      }
      return window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1' ? 'first_contact' : null;
    } catch {
      if (contained) return initialActiveId || 'first_contact';
      if (typeof manualEnabledOverride === 'boolean') {
        return manualEnabledOverride ? (initialActiveId || 'first_contact') : null;
      }
      return null;
    }
  });

  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (!active) return;
      window.dispatchEvent(new Event('mega-tile-selector-changed'));
    } catch {
      // ignore
    }
  }, [active]);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return undefined;

      let t = null;
      const schedule = () => {
        if (t) window.clearTimeout(t);
        const last = readMegaPublicLastActivityAt();
        if (!last) return;
        const now = Date.now();
        const elapsed = now - last;
        if (elapsed >= MEGA_PUBLIC_IDLE_MS) {
          resetMegaPublicState();
          return;
        }
        const wait = Math.max(250, MEGA_PUBLIC_IDLE_MS - elapsed);
        t = window.setTimeout(() => {
          schedule();
        }, wait);
      };

      const onActivity = () => schedule();
      window.addEventListener('hg-mega-public-activity', onActivity);

      schedule();
      return () => {
        window.removeEventListener('hg-mega-public-activity', onActivity);
        if (t) window.clearTimeout(t);
      };
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const p = new URLSearchParams(location.search);
      const fromUrl = p.get('active') || p.get('collection') || '';
      const next = typeof fromUrl === 'string' ? fromUrl.trim() : '';
      const allowed = new Set(['first_contact', 'the_human_inside', 'austen', 'cube', 'outcasted']);
      if (next && allowed.has(next)) {
        setActive(next);
        touchMegaPublicActivity();
      }
    } catch {
      // ignore
    }
  }, [location.search]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && megaFullScreen) {
        setMegaFullScreen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [megaFullScreen]);

  const disableCatalogPanel =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('noCatalogPanel');
  const wsEnabled =
    typeof window !== 'undefined' && import.meta.env.DEV && new URLSearchParams(window.location.search).has('ws');
  const effectiveDisableCatalogPanel = disableCatalogPanel || showCatalogPanel === false;
  const gridCalibFromUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('gridCalib');

  const bleedGuardDebug = typeof window !== 'undefined'
    && import.meta.env.DEV
    && new URLSearchParams(window.location.search).has('bleedGuardDebug');

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const getTargetEl = () => {
      try {
        const main = document.querySelector('main#main-content');
        if (!main) return null;
        const exact = main.querySelector(
          ':scope > div:nth-child(1) > header:nth-of-type(1) > div:nth-child(1) > div:nth-child(1)'
        );
        if (exact) return exact;
        const el = (node, idx) => (node?.children && node.children[idx]) ? node.children[idx] : null;
        const div0 = el(main, 0);
        const header0 = div0 ? div0.querySelector('header') : null;
        if (!header0) return null;
        const border0 = el(header0, 0);
        const row0 = border0 ? el(border0, 0) : null;
        return row0 || null;
      } catch {
        return null;
      }
    };

    const read = () => {
      try {
        const megaEl = megaMenuRef.current;
        const targetEl = getTargetEl();
        if (!megaEl || !targetEl) return;
        const megaRect = megaEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const leftRaw = megaRect.left - targetRect.left;
        const rightRaw = targetRect.right - megaRect.right;
        const left = Math.max(0, Math.round(leftRaw * 100) / 100);
        const right = Math.max(0, Math.round(rightRaw * 100) / 100);
        setBleedGuardExpandPx((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));

        if (bleedGuardDebug) {
          const round2 = (v) => Math.round(v * 100) / 100;
          window.__HG_BLEED_GUARD_DEBUG__ = {
            left,
            right,
            leftRaw: round2(leftRaw),
            rightRaw: round2(rightRaw),
            megaRect: {
              left: round2(megaRect.left),
              right: round2(megaRect.right),
              width: round2(megaRect.width),
            },
            targetRect: {
              left: round2(targetRect.left),
              right: round2(targetRect.right),
              width: round2(targetRect.width),
            },
          };
        }
      } catch {
        // ignore
      }
    };

    read();
    window.addEventListener('resize', read);
    window.addEventListener('scroll', read, true);
    const t1 = window.setTimeout(read, 50);
    const t2 = window.setTimeout(read, 250);
    return () => {
      window.removeEventListener('resize', read);
      window.removeEventListener('scroll', read, true);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [active]);

  const overlaySrcFromUrl = useMemo(() => {
    try {
      if (typeof window === 'undefined') return null;
      const p = new URLSearchParams(location?.search || window.location.search);
      const raw = p.get('stripeOverlay');
      if (typeof raw !== 'string') return null;
      const v = raw
        .trim()
        .replace(/[\s,;]+$/g, '');
      return v ? v : null;
    } catch {
      return null;
    }
  }, [location?.search]);

  const overlayStorageKey = useMemo(() => {
    const k = (active || '').toString();
    return k ? `HG_STRIPE_OVERLAY_SRC_${k}` : 'HG_STRIPE_OVERLAY_SRC';
  }, [active]);

  const [stripeOverlayOverrideActive, setStripeOverlayOverrideActive] = useState(() => Boolean(overlaySrcFromUrl));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoManualEnabled, setDemoManualEnabled] = useState(() => {
    if (typeof manualEnabledOverride === 'boolean') return manualEnabledOverride;
    if (contained) return true;
    try {
      return window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1';
    } catch {
      return false;
    }
  });
  const readStripeVariantFromUrl = () => {
    try {
      const p = new URLSearchParams(location.search);
      const raw = (p.get('stripeVariant') || '').toString().trim().toLowerCase();
      if (raw === 'white' || raw === 'black' || raw === 'color') return raw;
      return '';
    } catch {
      return '';
    }
  };

  const [firstContactVariant, setFirstContactVariant] = useState(() => readStripeVariantFromUrl() || 'black');
  const [humanInsideVariant, setHumanInsideVariant] = useState(() => readStripeVariantFromUrl() || 'black');
  const [selectedColorSlug, setSelectedColorSlug] = useState('white');
  const [thinStartIndex, setThinStartIndex] = useState(0);
  const [gildan5000Catalog, setGildan5000Catalog] = useState(null);

  useEffect(() => {
    try {
      const v = readStripeVariantFromUrl();
      if (!v) return;
      setFirstContactVariant(v);
      setHumanInsideVariant(v);
    } catch {
      // ignore
    }
  }, [location.search]);

  const austenSelectedIsCrosswords = useMemo(() => {
    try {
      const key = selectedItemByCollection?.austen;
      if (typeof key !== 'string') return false;
      return key.toLowerCase().includes('/austen/crosswords/');
    } catch {
      return false;
    }
  }, [selectedItemByCollection]);

  const austenSelectedIsPemberley = useMemo(() => {
    try {
      const key = selectedItemByCollection?.austen;
      if (typeof key !== 'string') return false;
      return key.toLowerCase().includes('/austen/pemberley_house/');
    } catch {
      return false;
    }
  }, [selectedItemByCollection]);

  const austenSelectedDisableMulti = Boolean(austenSelectedIsCrosswords || austenSelectedIsPemberley);

  const stripeVariantVisibility = useMemo(() => {
    try {
      if (!active) return { white: true, black: true, color: true };
      if (active === 'first_contact') return { white: true, black: true, color: true };
      if (active === 'the_human_inside') return { white: true, black: true, color: true };
      if (active === 'outcasted') return { white: true, black: true, color: true };
      if (active === 'cube') return { white: false, black: false, color: true };

      if (active === 'austen') {
        const key = selectedItemByCollection?.austen;
        const s = typeof key === 'string' ? key.toLowerCase() : '';
        if (s.includes('/austen/crosswords/')) return { white: true, black: true, color: false };
        if (s.includes('/austen/pemberley_house/')) return { white: true, black: true, color: false };
        if (s.includes('/austen/looking_for_my_darcy/')) return { white: false, black: false, color: true };
        return { white: true, black: true, color: true };
      }

      return { white: true, black: true, color: true };
    } catch {
      return { white: true, black: true, color: true };
    }
  }, [active, selectedItemByCollection]);

  useEffect(() => {
    if (active !== 'austen') return;
    if (!austenSelectedDisableMulti) return;
    if (firstContactVariant !== 'color') return;
    setFirstContactVariant('white');
  }, [active, austenSelectedDisableMulti, firstContactVariant]);

  useEffect(() => {
    try {
      if (!active) return;
      if (active === 'the_human_inside') return;
      const allowed = stripeVariantVisibility || { white: true, black: true, color: true };
      const want = firstContactVariant;
      const ok = (want === 'white' && allowed.white) || (want === 'black' && allowed.black) || (want === 'color' && allowed.color);
      if (ok) return;
      if (allowed.white) setFirstContactVariant('white');
      else if (allowed.black) setFirstContactVariant('black');
      else if (allowed.color) setFirstContactVariant('color');
    } catch {
    }
  }, [active, stripeVariantVisibility, firstContactVariant]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    try {
      if (typeof window === 'undefined') return;
      const prev = window.__HG_OVERLAY_DEBUG__ || {};
      window.__HG_OVERLAY_DEBUG__ = {
        ...prev,
        active,
        firstContactVariant,
        humanInsideVariant,
      };
    } catch {
      // ignore
    }
  }, [active, firstContactVariant, humanInsideVariant]);

  const reorderAustenQuotes = (items) => {
    try {
      if (!Array.isArray(items) || items.length === 0) return items;
      const wantOrder = [
        'it-is-a-truth',
        'you-must-allow-me',
        'body-and-soul',
        'unsociable-and-taciturn',
        'half-agony-half-hope',
      ];
      const rankByNeedle = new Map(wantOrder.map((v, idx) => [v, idx]));
      const pickRank = (v) => {
        if (typeof v !== 'string') return null;
        const s = v.toLowerCase();
        if (!s.includes('/austen/quotes/')) return null;
        for (const [needle, idx] of rankByNeedle.entries()) {
          if (s.includes(needle)) return idx;
        }
        return null;
      };

      const quoteSlots = [];
      for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        const r = pickRank(it);
        if (r === null) continue;
        quoteSlots.push({ idx: i, it, r });
      }

      if (quoteSlots.length === 0) return items;

      const sortedQuotes = quoteSlots
        .slice()
        .sort((a, b) => {
          if (a.r !== b.r) return a.r - b.r;
          return a.idx - b.idx;
        })
        .map((e) => e.it);

      const out = items.slice();
      quoteSlots.forEach((slot, i) => {
        out[slot.idx] = sortedQuotes[i];
      });

      return out;
    } catch {
      return items;
    }
  };

  useEffect(() => {
    if (overlaySrcFromUrl) {
      setStripeOverlayOverrideActive(true);
      return;
    }
    setStripeOverlayOverrideActive(false);
  }, [overlaySrcFromUrl]);

  const [megaStripeRefEnabledLocal, setMegaStripeRefEnabledLocal] = useState(false);
  const [megaStripeRefSrcLocal, setMegaStripeRefSrcLocal] = useState('');
  const [megaStripeRef2EnabledLocal, setMegaStripeRef2EnabledLocal] = useState(false);
  const [megaStripeRef2SrcLocal, setMegaStripeRef2SrcLocal] = useState('');

  useEffect(() => {
    const readRef = () => {
      try {
        const en = window.localStorage.getItem('MEGA_STRIPE_REF_ENABLED') === '1';
        const src = String(window.localStorage.getItem('MEGA_STRIPE_REF_SRC') || '');
        setMegaStripeRefEnabledLocal(en);
        setMegaStripeRefSrcLocal(src);
      } catch {
        // ignore
      }
    };
    readRef();
    window.addEventListener('mega-stripe-ref-changed', readRef);
    return () => window.removeEventListener('mega-stripe-ref-changed', readRef);
  }, []);

  const tileSelectorDragRef = useRef({
    active: false,
    collectionId: '',
    startX: 0,
    startY: 0,
    startStepX: 0,
    startStepY: 0,
  });

  const onStartSelectorDrag = useCallback((e, selectorParams, bounds) => {
    try {
      if (!e) return;
      if (!bounds) return;
      const minStepX = Number.isFinite(Number(bounds?.minStepX)) ? Number(bounds.minStepX) : -99;
      const maxStepX = Number.isFinite(Number(bounds?.maxStepX)) ? Number(bounds.maxStepX) : 99;
      const lockStepY = Boolean(bounds?.lockStepY);
      tileSelectorDragRef.current.active = true;
      tileSelectorDragRef.current.collectionId = String(selectorParams?.collectionId || '');
      tileSelectorDragRef.current.keyset = String(selectorParams?.keyset || 'v1');
      tileSelectorDragRef.current.bounds = { minStepX, maxStepX, lockStepY };
      tileSelectorDragRef.current.startX = e.clientX;
      tileSelectorDragRef.current.startY = e.clientY;
      const rawStepX = Number.isFinite(Number(selectorParams?.stepX)) ? Number(selectorParams?.stepX) : 0;
      const rawStepY = Number.isFinite(Number(selectorParams?.stepY)) ? Number(selectorParams?.stepY) : 0;
      tileSelectorDragRef.current.startStepX = Math.min(maxStepX, Math.max(minStepX, rawStepX));
      tileSelectorDragRef.current.startStepY = lockStepY ? 0 : rawStepY;
      e.currentTarget?.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getPitchPx = () => {
      try {
        const gapPx = 12;
        const el = document.querySelector('[data-mega-tile="1"]');
        const w = el?.getBoundingClientRect?.().width;
        const baseTilePx = Number.isFinite(Number(w)) && Number(w) > 0 ? Number(w) : 120;
        return baseTilePx + gapPx;
      } catch {
        return 132;
      }
    };

    const onMove = (e) => {
      try {
        if (!tileSelectorDragRef.current?.active) return;
        const pitchPx = getPitchPx();
        if (!pitchPx) return;

        const collectionId = String(tileSelectorDragRef.current?.collectionId || '');
        const keyset = String(tileSelectorDragRef.current?.keyset || 'v1');
        if (!collectionId) return;

        const minStepX = Number.isFinite(Number(tileSelectorDragRef.current?.bounds?.minStepX))
          ? Number(tileSelectorDragRef.current.bounds.minStepX)
          : -99;
        const maxStepX = Number.isFinite(Number(tileSelectorDragRef.current?.bounds?.maxStepX))
          ? Number(tileSelectorDragRef.current.bounds.maxStepX)
          : 99;
        const lockStepY = Boolean(tileSelectorDragRef.current?.bounds?.lockStepY);

        const dx = e.clientX - tileSelectorDragRef.current.startX;
        const dy = e.clientY - tileSelectorDragRef.current.startY;
        const nextStepX = Math.round(tileSelectorDragRef.current.startStepX + dx / pitchPx);
        const nextStepY = Math.round(tileSelectorDragRef.current.startStepY + dy / pitchPx);
        const sx = Math.min(maxStepX, Math.max(minStepX, nextStepX));
        const sy = lockStepY ? 0 : Math.min(99, Math.max(-99, nextStepY));
        setMegaPublicSelectorFor(collectionId, keyset, { stepX: sx, stepY: sy });
        touchMegaPublicActivity();
        window.dispatchEvent(new Event('mega-tile-selector-changed'));
      } catch {
        // ignore
      }
    };

    const onUp = () => {
      try {
        if (!tileSelectorDragRef.current) return;
        tileSelectorDragRef.current.active = false;
      } catch {
        // ignore
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  useEffect(() => {
    const readRef2 = () => {
      try {
        const en = window.localStorage.getItem('MEGA_STRIPE_REF2_ENABLED') === '1';
        const src = String(window.localStorage.getItem('MEGA_STRIPE_REF2_SRC') || '');
        setMegaStripeRef2EnabledLocal(en);
        setMegaStripeRef2SrcLocal(src);
      } catch {
        // ignore
      }
    };
    readRef2();
    window.addEventListener('mega-stripe-ref2-changed', readRef2);
    return () => window.removeEventListener('mega-stripe-ref2-changed', readRef2);
  }, []);

  const [megaStripeSpriteEnabledLocal, setMegaStripeSpriteEnabledLocal] = useState(true);
  useEffect(() => {
    const readSpriteEnabled = () => {
      try {
        const raw = window.localStorage.getItem('MEGA_STRIPE_SPRITE_ENABLED');
        if (raw == null) {
          setMegaStripeSpriteEnabledLocal(true);
          return;
        }
        const v = String(raw).trim().toLowerCase();
        setMegaStripeSpriteEnabledLocal(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
      } catch {
        setMegaStripeSpriteEnabledLocal(true);
      }
    };
    readSpriteEnabled();
    window.addEventListener('mega-stripe-sprite-enabled-changed', readSpriteEnabled);
    return () => window.removeEventListener('mega-stripe-sprite-enabled-changed', readSpriteEnabled);
  }, []);

  const normalizeOverlaySrc = useCallback((value) => {
    let s = (value || '').toString().trim();
    if (!s) return null;
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")) || (s.startsWith('`') && s.endsWith('`'))) {
      s = s.slice(1, -1).trim();
    }
    if (!s) return null;
    if (/^(https?:)?\/\//i.test(s) || /^data:/i.test(s) || /^blob:/i.test(s)) return s;

    try {
      // Normalize pasted filesystem paths like:
      //   /.../higginsgrafic-ecommerce-dev/public/custom_logos/...
      // into:
      //   /custom_logos/...
      const idx = s.lastIndexOf('/public/custom_logos/');
      if (idx >= 0) {
        const suffix = s.slice(idx + '/public'.length);
        if (suffix.startsWith('/custom_logos/')) return suffix;
      }
      const idx2 = s.lastIndexOf('/custom_logos/');
      if (idx2 > 0 && !s.startsWith('/custom_logos/')) {
        const suffix = s.slice(idx2);
        if (suffix.startsWith('/custom_logos/')) return suffix;
      }
    } catch {
      // ignore
    }

    try {
      // Allow entering just the filename for Keep Calm stripe overlays.
      const file = (s.split('/').pop() || '').trim();
      const lower = file.toLowerCase();
      const isBare = (file === s && !s.startsWith('/')) || (s === `/${file}`);
      const hasNoFolders = (s === file) || (s === `/${file}`);
      if (isBare && hasNoFolders && /^keep-calm-.*-stripe\.webp$/i.test(file)) {
        const folder = lower.includes('-b-stripe')
          ? 'black'
          : lower.includes('-w-stripe')
            ? 'white'
            : (lower.includes('multi') || lower.includes('-multi-'))
              ? 'multi'
              : 'multi';
        return `/custom_logos/drawings/images_stripe/austen/keep_calm/${folder}/${file}`;
      }
    } catch {
      // ignore
    }

    const rooted = s.startsWith('/') ? s : `/${s}`;
    return rooted.replace(
      '/custom_logos/drawings/images_stripe/stripe/',
      '/custom_logos/drawings/images_stripe/',
    );
  }, []);

  const [megaShirtDrawingEnabledLocal, setMegaShirtDrawingEnabledLocal] = useState(() => {
    try {
      const parseBool = (raw, fallback = true) => {
        if (raw == null) return fallback;
        const v = String(raw).trim().toLowerCase();
        if (v === '') return fallback;
        return v === '1' || v === 'true' || v === 'on' || v === 'yes';
      };
      const rawNew = window.localStorage.getItem('HG_SHIRT_DRAWING_ENABLED');
      if (rawNew != null) return parseBool(rawNew, true);
      const rawOld = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_ENABLED');
      if (rawOld != null) return parseBool(rawOld, true);
      return true;
    } catch {
      return true;
    }
  });

  const [drawingOverlaySrcLocal, setDrawingOverlaySrcLocal] = useState(() => {
    try {
      const raw = String(window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC') || '').trim();
      if (!raw) return null;
      const normalized = normalizeOverlaySrc(raw) || raw;
      const lower = normalized.toLowerCase();
      const isUrl = /^(https?:)?\/\//i.test(normalized) || /^data:/i.test(normalized) || /^blob:/i.test(normalized);
      const isStripeSrc = lower.includes('/custom_logos/drawings/images_stripe/') || lower.includes('/custom_logos/drawings/images_originals/stripe/');
      return (isUrl || isStripeSrc) ? normalized : null;
    } catch {
      return null;
    }
  });

  const drawingOverlaySrcEffective = useMemo(() => {
    try {
      if (drawingOverlaySrcLocal) return drawingOverlaySrcLocal;
      if (!import.meta.env.DEV) return null;
      return '/custom_logos/drawings/images_stripe/first_contact/black/nx-01-b-stripe.webp';
    } catch {
      return drawingOverlaySrcLocal;
    }
  }, [drawingOverlaySrcLocal]);

  useEffect(() => {
    const sync = () => {
      try {
        const raw = String(window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC') || '').trim();
        if (!raw) {
          setDrawingOverlaySrcLocal(null);
          return;
        }
        const normalized = normalizeOverlaySrc(raw) || raw;
        const lower = normalized.toLowerCase();
        const isUrl = /^(https?:)?\/\//i.test(normalized) || /^data:/i.test(normalized) || /^blob:/i.test(normalized);
        const isStripeSrc = lower.includes('/custom_logos/drawings/images_stripe/') || lower.includes('/custom_logos/drawings/images_originals/stripe/');
        setDrawingOverlaySrcLocal((isUrl || isStripeSrc) ? normalized : null);
      } catch {
        setDrawingOverlaySrcLocal(null);
      }
    };
    sync();
    window.addEventListener('hg-drawing-overlay-changed', sync);
    return () => window.removeEventListener('hg-drawing-overlay-changed', sync);
  }, [normalizeOverlaySrc]);

  useEffect(() => {
    const sync = () => {
      try {
        const rawNew = window.localStorage.getItem('HG_SHIRT_DRAWING_ENABLED');
        if (rawNew != null) {
          const v = String(rawNew).trim().toLowerCase();
          setMegaShirtDrawingEnabledLocal(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
          return;
        }
        const rawOld = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_ENABLED');
        if (rawOld != null) {
          const v = String(rawOld).trim().toLowerCase();
          setMegaShirtDrawingEnabledLocal(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
          return;
        }
        setMegaShirtDrawingEnabledLocal(true);
      } catch {
        setMegaShirtDrawingEnabledLocal(true);
      }
    };
    sync();
    window.addEventListener('hg-shirt-drawing-enabled-changed', sync);
    window.addEventListener('hg-shirt-drawing-overlay-enabled-changed', sync);
    return () => {
      window.removeEventListener('hg-shirt-drawing-enabled-changed', sync);
      window.removeEventListener('hg-shirt-drawing-overlay-enabled-changed', sync);
    };
  }, []);

  const resolvedOverlaySrc = useMemo(() => {
    const normalizeKeyLocal = (value) => {
      if (typeof value !== 'string') return '';
      return value
        .trim()
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
        .replace(/\s+/g, ' ');
    };
    const isPathItem = (it) => typeof it === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(it);

    if (stripeOverlayOverrideActive && overlaySrcFromUrl) {
      return overlaySrcFromUrl;
    }

    if (active === 'first_contact' && firstContactSelectedItem) {
      if (firstContactVariant === 'white') {
        return FIRST_CONTACT_MEDIA_WHITE[firstContactSelectedItem]
          || FIRST_CONTACT_MEDIA[firstContactSelectedItem]
          || null;
      }
      if (firstContactVariant === 'color') {
        return FIRST_CONTACT_MEDIA_COLOR[firstContactSelectedItem]
          || FIRST_CONTACT_MEDIA[firstContactSelectedItem]
          || null;
      }
      return FIRST_CONTACT_MEDIA[firstContactSelectedItem] || null;
    }
    if (active === 'the_human_inside' && humanInsideSelectedItem) {
      const key = normalizeKeyLocal(humanInsideSelectedItem).toLowerCase();
      const mapBlack = {
        'r2-d2': 'r2-d2-b-stripe.webp',
        c3p0: 'c3-p0-b-stripe.webp',
        vader: 'vader-b-stripe.webp',
        afrodita: 'afrodita-a-b-stripe.webp',
        'afrodita-a': 'afrodita-a-b-stripe.webp',
        mazinger: 'mazinger-z-b-stripe.webp',
        'mazinger-z': 'mazinger-z-b-stripe.webp',
        'cylon 78': 'cylon-78-b-stripe.webp',
        'cylon 03': 'cylon-03-b-stripe.webp',
        'iron man 68': 'iron-man-68-b-stripe.webp',
        'iron man 08': 'iron-man-08-b-stripe.webp',
        cyberman: 'cyberman-b-stripe.webp',
        'the dalek': 'the-dalek-b-stripe.webp',
        robocop: 'robocop-b-stripe.webp',
        terminator: 'terminator-b-stripe.webp',
        maschinenmensch: 'maschinenmensch-b-stripe.webp',
        'robby the robot': 'robbie-the-robot-b-stripe.webp',
        'robbie the robot': 'robbie-the-robot-b-stripe.webp',
      };

      const mapWhite = {
        'r2-d2': 'r2-d2-w-stripe.webp',
        c3p0: 'c3-p0-w-stripe.webp',
        vader: 'vader-w-stripe.webp',
        afrodita: 'afrodita-a-w-stripe.webp',
        'afrodita-a': 'afrodita-a-w-stripe.webp',
        mazinger: 'mazinger-z-w-stripe.webp',
        'mazinger-z': 'mazinger-z-w-stripe.webp',
        'cylon 78': 'cylon-78-w-stripe.webp',
        'cylon 03': 'cylon-03-w-stripe.webp',
        'iron man 68': 'iron-man-68-w-stripe.webp',
        'iron man 08': 'iron-man-08-w-stripe.webp',
        cyberman: 'cyberman-w-stripe.webp',
        'the dalek': 'the-dalek-w-stripe.webp',
        robocop: 'robocop-w-stripe.webp',
        terminator: 'terminator-w-stripe.webp',
        maschinenmensch: 'maschinenmensch-w-stripe.webp',
        'robby the robot': 'robbie-the-robot-w-stripe.webp',
        'robbie the robot': 'robbie-the-robot-w-stripe.webp',
      };

      const mapColor = {
        'r2-d2': 'r2-d2-multi-light-stripe.webp',
        c3p0: 'c3-p0-multi-light-stripe.webp',
        vader: 'vader-multi-light-stripe.webp',
        afrodita: 'afrodita-a-multi-dark-stripe.webp',
        'afrodita-a': 'afrodita-a-multi-dark-stripe.webp',
        mazinger: 'mazinger-z-multi-light-stripe.webp',
        'mazinger-z': 'mazinger-z-multi-light-stripe.webp',
        'cylon 78': 'cylon-78-multi-light-stripe.webp',
        'cylon 03': 'cylon-03-multi-light-stripe.webp',
        'iron man 68': 'iron-man-68-multi-light-stripe.webp',
        'iron man 08': 'iron-man-08-multi-light-stripe.webp',
        cyberman: 'cyberman-multi-light-stripe.webp',
        'the dalek': 'the-dalek-multi-light-stripe.webp',
        robocop: 'robocop-multi-light-stripe.webp',
        terminator: 'terminator-multi-light-stripe.webp',
        maschinenmensch: 'maschinenmensch-multi-light-stripe.webp',
        'robby the robot': 'robbie-the-robot-multi-light-stripe.webp',
        'robbie the robot': 'robbie-the-robot-multi-light-stripe.webp',
      };

      const isWhite = humanInsideVariant === 'white';
      const isColor = humanInsideVariant === 'color';
      let file = (isColor ? mapColor : (isWhite ? mapWhite : mapBlack))[key] || null;
      if (!file) {
        const k = key;
        if ((k.includes('robbie') || k.includes('robby')) && k.includes('robot')) {
          file = isColor
            ? 'robbie-the-robot-multi-light-stripe.webp'
            : (isWhite ? 'robbie-the-robot-w-stripe.webp' : 'robbie-the-robot-b-stripe.webp');
        } else if (k.includes('cylon') && k.includes('78')) {
          file = isColor
            ? 'cylon-78-multi-light-stripe.webp'
            : (isWhite ? 'cylon-78-w-stripe.webp' : 'cylon-78-b-stripe.webp');
        } else if (k.includes('afrodita')) {
          file = isColor
            ? 'afrodita-a-multi-dark-stripe.webp'
            : (isWhite ? 'afrodita-a-w-stripe.webp' : 'afrodita-a-b-stripe.webp');
        } else if (k.includes('iron') && k.includes('man') && k.includes('68')) {
          file = isColor
            ? 'iron-man-68-multi-light-stripe.webp'
            : (isWhite ? 'iron-man-68-w-stripe.webp' : 'iron-man-68-b-stripe.webp');
        }
      }
      if (!file) return null;
      const folder = isColor ? 'multi' : (isWhite ? 'white' : 'black');
      return `/custom_logos/drawings/images_stripe/the_human_inside/${folder}/${file}`;
    }
    if (active && selectedItemByCollection?.[active]) {
      const key = selectedItemByCollection[active];

      if (active === 'cube' && typeof key === 'string' && !isPathItem(key)) {
        const k = normalizeKeyLocal(key).toLowerCase();
        const map = {
          'iron kong': 'iron-cube-08-iron-kong-stripe.webp',
          'iron cube': 'iron-cube-68-stripe.webp',
          'iron cube 68': 'iron-cube-68-stripe.webp',
          robocube: 'robocube-stripe.webp',
          'cylon cube': 'cylon-cube-03-stripe.webp',
          'cylon cube 03': 'cylon-cube-03-stripe.webp',
          maschinencube: 'maschinencube-stripe.webp',
          'mazinger c': 'mazinger-c-stripe.webp',
          'afrodita c': 'afrodita-c-stripe.webp',
          'cube 3 p0': 'cube-3-p0-stripe.webp',
          '3cube p0': 'cube-3-p0-stripe.webp',
          '3cube-p0': 'cube-3-p0-stripe.webp',
          'cyber cube': 'cyber-cube-stripe.webp',
          cybercube: 'cyber-cube-stripe.webp',
          'darth cube': 'darth-cube-stripe.webp',
        };
        const file = map[k] || null;
        const out = file ? `/custom_logos/drawings/images_stripe/cube/${file}` : null;
        if (import.meta.env.DEV && !out) {
          // eslint-disable-next-line no-console
          console.error('[CUBE stripe overlay] unresolved label', { key, normalized: k });
        }
        return out;
      }

      if (active === 'outcasted' && typeof key === 'string' && !isPathItem(key)) {
        const k = normalizeKeyLocal(key).toLowerCase();
        const out = (() => {
          if (firstContactVariant === 'color') {
            if (k === 'dj vader' || k === 'dj-vader') return '/custom_logos/drawings/images_stripe/miscel·lania/multi/dj-vader-multi-light-stripe.webp';
            if (k === 'deathstar2d2' || k === 'death star2d2' || k === 'death-star2d2') return '/custom_logos/drawings/images_stripe/miscel·lania/multi/death-star2d2-multi-light-stripe.webp';
            if (k === 'pont del diable' || k === 'pont-del-diable') return '/custom_logos/drawings/images_stripe/miscel·lania/multi/pont-del-diable-multi-light-stripe.webp';
          }

          if (firstContactVariant === 'white') {
            if (k === 'dj vader' || k === 'dj-vader') return '/custom_logos/drawings/images_stripe/miscel·lania/white/dj-vader-w-stripe.webp';
            if (k === 'deathstar2d2' || k === 'death star2d2' || k === 'death-star2d2') return '/custom_logos/drawings/images_stripe/miscel·lania/white/death-star2d2-w-stripe.webp';
            if (k === 'pont del diable' || k === 'pont-del-diable') return '/custom_logos/drawings/images_stripe/miscel·lania/white/pont-del-diable-w-stripe.webp';
          }

          if (k === 'dj vader' || k === 'dj-vader') return '/custom_logos/drawings/images_stripe/miscel·lania/black/dj-vader-b-stripe.webp';
          if (k === 'deathstar2d2' || k === 'death star2d2' || k === 'death-star2d2') return '/custom_logos/drawings/images_stripe/miscel·lania/black/death-star2d2-b-stripe.webp';
          if (k === 'pont del diable' || k === 'pont-del-diable') return '/custom_logos/drawings/images_stripe/miscel·lania/black/pont-del-diable-b-stripe.webp';
          return null;
        })();
        if (import.meta.env.DEV && !out) {
          // eslint-disable-next-line no-console
          console.error('[OUTCASTED stripe overlay] unresolved label', { key, normalized: k });
        }
        return out;
      }

      // Path-based collections (e.g. outcasted black/xxx.webp) can be resolved directly.
      if (isPathItem(key)) {
        const variant = firstContactVariant;
        if (
          active === 'austen'
          && typeof key === 'string'
          && key.startsWith('/custom_logos/drawings/images_grid/austen/quotes/')
        ) {
          const file = (key.split('/').pop() || '').replace(/\?.*$/, '');
          const slug = file
            .toLowerCase()
            .replace(/-(b|w)-stripe(?=\.webp$)/i, '')
            .replace(/-b-grid(?=\.webp$)/i, '')
            .replace(/-grid(?=\.webp$)/i, '')
            .replace(/\.webp$/i, '');
          const whiteStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          const multiStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          const resolved = variant === 'color'
            ? `/custom_logos/drawings/images_stripe/austen/quotes/multi/${multiStem}-multi-light-stripe.webp`
            : variant === 'white'
              ? `/custom_logos/drawings/images_stripe/austen/quotes/white/${whiteStem}-w-stripe.webp`
              : `/custom_logos/drawings/images_stripe/austen/quotes/black/${slug}-b-stripe.webp`;
          if (resolved) return resolved;

          // Fallback for the common `...-b-grid.webp` filenames.
          // Convert GRID quotes to the canonical STRIPE+BLACK folder.
          const [base, q] = key.split('?');
          const outBase = base
            .replace('/custom_logos/drawings/images_grid/austen/quotes/', '/custom_logos/drawings/images_stripe/austen/quotes/black/')
            .replace(/-grid(?=\.(webp|png|jpe?g)$)/i, '');
          const fallbackResolved = (() => {
            const m = outBase.match(/^(.*)\.(webp|png|jpe?g)$/i);
            if (!m) return outBase;
            const prefix = m[1].replace(/-(grid|stripe)$/i, '');
            const ext = m[2];
            return prefix.toLowerCase().endsWith('-stripe') ? `${prefix}.${ext}` : `${prefix}-stripe.${ext}`;
          })();
          return q ? `${fallbackResolved}?${q}` : fallbackResolved;
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/crosswords/')) {
          const file = (key.split('/').pop() || '').replace(/\?.*$/, '');
          const lower = file.toLowerCase();
          const m = lower.replace(/-grid(?=\.webp$)/i, '').match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d)\.webp$/);
          if (m) {
            const book = m[1];
            const n = m[2];
            // Crosswords has NO color variant. Treat `color` as `white`.
            if (variant === 'black') return `/custom_logos/drawings/images_stripe/austen/crosswords/black/${book}-${n}-b-stripe.webp`;
            return `/custom_logos/drawings/images_stripe/austen/crosswords/white/${book}-${n}-w-stripe.webp`;
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/pemberley_house/')) {
          return '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp';
        }
        if (active === 'cube' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/cube/')) {
          const file = key.split('/').pop() || '';
          const fileNormalized = file.replace(/-grid\.(webp|png|jpe?g)$/i, '.$1');
          const map = {
            'iron-kong.webp': 'iron-cube-08-iron-kong.webp',
            'iron-cube.webp': 'iron-cube-68.webp',
            'robocube.webp': 'robocube.webp',
            'cylon-cube.webp': 'cylon-cube-03.webp',
            'maschinencube.webp': 'maschinencube.webp',
            'mazinger-c.webp': 'mazinger-c.webp',
            'afrodita-c.webp': 'afrodita-c.webp',
            '3cube-p0.webp': 'cube-3-p0.webp',
            'cybercube.webp': 'cyber-cube.webp',
            'darth-cube.webp': 'darth-cube.webp',
          };
          const drawingFile = map[fileNormalized] || map[file];
          if (drawingFile) return `/custom_logos/drawings/images_stripe/cube/${drawingFile.replace(/\.(webp|png|jpe?g)$/i, '-stripe.$1')}`;
        }
        if (active === 'outcasted' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/miscel·lania/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          if (firstContactVariant === 'color') {
            if (lower.includes('dj-vader')) return '/custom_logos/drawings/images_stripe/miscel·lania/multi/dj-vader-multi-light-stripe.webp';
            if (lower.includes('death-star2d2')) return '/custom_logos/drawings/images_stripe/miscel·lania/multi/death-star2d2-multi-light-stripe.webp';
            if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
              return '/custom_logos/drawings/images_stripe/miscel·lania/multi/pont-del-diable-multi-light-stripe.webp';
            }
          }
          if (firstContactVariant === 'white') {
            if (lower.includes('dj-vader')) return '/custom_logos/drawings/images_stripe/miscel·lania/white/dj-vader-w-stripe.webp';
            if (lower.includes('death-star2d2')) return '/custom_logos/drawings/images_stripe/miscel·lania/white/death-star2d2-w-stripe.webp';
            if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
              return '/custom_logos/drawings/images_stripe/miscel·lania/white/pont-del-diable-w-stripe.webp';
            }
          }
          if (lower.includes('dj-vader')) return '/custom_logos/drawings/images_stripe/miscel·lania/black/dj-vader-b-stripe.webp';
          if (lower.includes('death-star2d2')) return '/custom_logos/drawings/images_stripe/miscel·lania/black/death-star2d2-b-stripe.webp';
          if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
            return '/custom_logos/drawings/images_stripe/miscel·lania/black/pont-del-diable-b-stripe.webp';
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/keep_calm/')) {
          try {
            const file = (key.split('/').pop() || '').toString().trim().toLowerCase();
            const isKcb = file.includes('keep-calm-b') || file.includes('keep-calm-black');
            const isKcr = file.includes('keep-calm-multi-red') || file.includes('keep-calm-multi-w-red');

            if (isKcb) {
              if (variant === 'color') {
                return '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-light-stripe.webp';
              }
              if (variant === 'white') {
                return '/custom_logos/drawings/images_stripe/austen/keep_calm/white/keep-calm-w-stripe.webp';
              }
              return '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
            }

            if (isKcr) {
              if (variant === 'color') {
                return '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-thru-light-stripe.webp';
              }
              if (variant === 'white') {
                return '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-w-red-stripe.webp';
              }
              if (variant === 'black') {
                return '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-thru-red-stripe.webp';
              }
              return '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-thru-light-stripe.webp';
            }
          } catch {
            // ignore
          }
          if (variant === 'white') {
            return '/custom_logos/drawings/images_stripe/austen/keep_calm/white/keep-calm-w-stripe.webp';
          }
          if (variant === 'black') {
            return '/custom_logos/drawings/images_stripe/austen/keep_calm/black/keep-calm-b-stripe.webp';
          }
          return '/custom_logos/drawings/images_stripe/austen/keep_calm/multi/keep-calm-multi-thru-red-stripe.webp';
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          const base = lower.replace(/\.(webp|png|jpe?g)$/i, '').replace(/-grid$/i, '');
          if (lower.includes('dark-gradient') || base.endsWith('-dark')) {
            const c = base.replace(/-dark-gradient$/i, '').replace(/-dark$/i, '');
            return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/dark/${c}-dark-gradient-stripe.webp`;
          }
          if (lower.includes('light-gradient') || base.endsWith('-light')) {
            const c = base.replace(/-light-gradient$/i, '').replace(/-light$/i, '');
            return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/light/${c}-light-gradient-stripe.webp`;
          }
          if (base.endsWith('-frame') || lower.includes('-frame')) {
            const c = base.replace(/-frame$/i, '');
            return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/frame/${c}-frame-stripe.webp`;
          }
          if (base.endsWith('-solid') || lower.includes('-solid')) {
            const c = base.replace(/-solid$/i, '');
            return `/custom_logos/drawings/images_stripe/austen/looking_for_my_darcy/solid/${c}-solid-stripe.webp`;
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_stripe/austen/crosswords/')) {
          const file = (key.split('/').pop() || '').replace(/\?.*$/, '');
          const m = file.match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d+)-stripe\.(webp|png)$/i);
          if (m) {
            const folder = m[1].replace(/-/g, '_');
            return `/custom_logos/drawings/images_stripe/austen/crosswords/${folder}/${m[1]}-${m[2]}.${m[3]}`;
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_originals/grid/austen/crosswords/')) {
          const file = (key.split('/').pop() || '').replace(/\?.*$/, '');
          const m = file.match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d+)-grid\.(webp|png)$/i);
          if (m) {
            return `/custom_logos/drawings/images_grid/austen/crosswords/${m[1]}-${m[2]}.${m[3]}`;
          }
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/crosswords/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          const persuasion = lower.match(/^persuasion-(\d)(?:-grid)?\.webp$/);
          if (persuasion) {
            const n = persuasion[1];
            if (variant === 'black') {
              return `/custom_logos/drawings/images_stripe/austen/crosswords/black/persuasion-${n}-b-stripe.webp`;
            }
            return `/custom_logos/drawings/images_stripe/austen/crosswords/white/persuasion-${n}-w-stripe.webp`;
          }
          const pride = lower.match(/^pride-and-prejudice-(\d)(?:-grid)?\.webp$/);
          if (pride) {
            const n = pride[1];
            if (variant === 'black') {
              return `/custom_logos/drawings/images_stripe/austen/crosswords/black/pride-and-prejudice-${n}-b-stripe.webp`;
            }
            return `/custom_logos/drawings/images_stripe/austen/crosswords/white/pride-and-prejudice-${n}-w-stripe.webp`;
          }
          const sense = lower.match(/^sense-and-sensibility-(\d)(?:-grid)?\.webp$/);
          if (sense) {
            const n = sense[1];
            if (variant === 'black') {
              return `/custom_logos/drawings/images_stripe/austen/crosswords/black/sense-and-sensibility-${n}-b-stripe.webp`;
            }
            return `/custom_logos/drawings/images_stripe/austen/crosswords/white/sense-and-sensibility-${n}-w-stripe.webp`;
          }
        }
        if (
          active === 'austen'
          && typeof key === 'string'
          && (
            key.startsWith('/custom_logos/drawings/images_grid/austen/quotes/')
            || key.startsWith('/custom_logos/drawings/images_stripe/austen/quotes/')
          )
        ) {
          return resolveAustenQuoteOriginalFromPath(key) || key;
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/pemberley_house/')) {
          if (variant === 'white') {
            return '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp';
          }
          return '/custom_logos/drawings/images_stripe/austen/pemberley_house/white/pemberley-house-w-stripe.webp';
        }
        if (active === 'austen' && typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/austen/crosswords/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          const m = lower.replace(/-grid(?=\.webp$)/i, '').match(/^(persuasion|pride-and-prejudice|sense-and-sensibility)-(\d)\.webp$/);
          if (m) {
            const book = m[1];
            const n = m[2];
            if (variant === 'black') {
              return `/custom_logos/drawings/images_stripe/austen/crosswords/black/${book}-${n}-b-stripe.webp`;
            }
            if (variant === 'black') return `/custom_logos/drawings/images_stripe/austen/crosswords/black/${book}-${n}-b-stripe.webp`;
            return `/custom_logos/drawings/images_stripe/austen/crosswords/white/${book}-${n}-w-stripe.webp`;
          }
        }
        if (
          typeof key === 'string'
          && (
            key.startsWith('/custom_logos/drawings/images_grid/austen/quotes/')
            || key.startsWith('/custom_logos/drawings/images_stripe/austen/quotes/')
          )
        ) {
          const file = (key.split('/').pop() || '').replace(/\?.*$/, '');
          const slug = file
            .toLowerCase()
            .replace(/-(b|w)-stripe(?=\.webp$)/i, '')
            .replace(/-b-grid(?=\.webp$)/i, '')
            .replace(/-grid(?=\.webp$)/i, '')
            .replace(/\.webp$/i, '');
          const whiteStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          const multiStem = slug === 'unsociable-and-taciturn' ? 'i-prefer-to-be' : slug;
          if (variant === 'color') return `/custom_logos/drawings/images_originals/stripe/austen/quotes/multi/${multiStem}-multi-light-stripe.webp`;
          if (variant === 'white') return `/custom_logos/drawings/images_originals/stripe/austen/quotes/white/${whiteStem}-w-stripe.webp`;
          return `/custom_logos/drawings/images_originals/stripe/austen/quotes/black/${slug}-b-stripe.webp`;
        }
        const k = typeof key === 'string' ? normalizeKeyLocal(key).toLowerCase() : '';
        const id = resolveAustenQuoteAssetId(k);
        if (id && AUSTEN_QUOTES_ASSETS[id]?.original) return AUSTEN_QUOTES_ASSETS[id].original;
        return AUSTEN_QUOTES_ASSETS.it_is_a_truth.original;
      }

      if (active === 'outcasted') {
        if (typeof key === 'string' && key.startsWith('/custom_logos/drawings/images_grid/miscel·lania/')) {
          const file = key.split('/').pop() || '';
          const lower = file.toLowerCase();
          if (firstContactVariant === 'color') {
            if (lower.includes('dj-vader')) return '/custom_logos/drawings/images_stripe/miscel·lania/multi/dj-vader-multi-light-stripe.webp';
            if (lower.includes('death-star2d2')) return '/custom_logos/drawings/images_stripe/miscel·lania/multi/death-star2d2-multi-light-stripe.webp';
            if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
              return '/custom_logos/drawings/images_stripe/miscel·lania/multi/pont-del-diable-multi-light-stripe.webp';
            }
          }
          if (firstContactVariant === 'white') {
            if (lower.includes('dj-vader')) return '/custom_logos/drawings/images_stripe/miscel·lania/white/dj-vader-w-stripe.webp';
            if (lower.includes('death-star2d2')) return '/custom_logos/drawings/images_stripe/miscel·lania/white/death-star2d2-w-stripe.webp';
            if (lower.includes('pont-del-diable') || lower.includes('pont_del_diable')) {
              return '/custom_logos/drawings/images_stripe/miscel·lania/white/pont-del-diable-w-stripe.webp';
            }
          }
          const map = {
            'dj-vader.webp': 'dj-vader-b-stripe.webp',
            'death-star2d2.webp': 'death-star2d2-b-stripe.webp',
            'pont-del-diable.webp': 'pont-del-diable-b-stripe.webp',
          };
          const drawingFile = map[file];
          if (drawingFile) return `/custom_logos/drawings/images_stripe/miscel·lania/black/${drawingFile}`;
        }
        return null;
      }

      if (FIRST_CONTACT_MEDIA[key]) {
        return firstContactVariant === 'white'
          ? (FIRST_CONTACT_MEDIA_WHITE[key] || FIRST_CONTACT_MEDIA[key] || null)
          : (FIRST_CONTACT_MEDIA[key] || null);
      }
    }
    return null;
  }, [
    active,
    overlaySrcFromUrl,
    firstContactSelectedItem,
    firstContactVariant,
    humanInsideSelectedItem,
    humanInsideVariant,
    selectedItemByCollection,
    stripeOverlayOverrideActive,
  ]);

  const resolvedOverlaySrcEncoded = useMemo(() => {
    try {
      if (!resolvedOverlaySrc || typeof resolvedOverlaySrc !== 'string') return '';
      const s = resolvedOverlaySrc.trim();
      if (!s) return '';
      return encodeURI(s);
    } catch {
      return resolvedOverlaySrc || '';
    }
  }, [resolvedOverlaySrc]);

  const [stripeOverlayLoadState, setStripeOverlayLoadState] = useState('idle');
  const [stripeOverlayIsStripeWide, setStripeOverlayIsStripeWide] = useState(false);
  const stripeOverlayDebug = (() => {
    try {
      const qs = (typeof window !== 'undefined') ? window.location?.search : '';
      const p = qs ? new URLSearchParams(qs) : null;
      const raw = p?.get?.('stripeOverlayDebug');
      if (raw == null && !p?.has?.('stripeOverlayDebug')) return false;
      const v = String(raw || '').trim().toLowerCase();
      if (v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes') return true;
      return false;
    } catch {
      return false;
    }
  })();

  const drawingOverlayDebug = (() => {
    try {
      const qs = (typeof window !== 'undefined') ? window.location?.search : '';
      const p = qs ? new URLSearchParams(qs) : null;
      const raw = p?.get?.('drawingOverlayDebug');
      if (raw == null && !p?.has?.('drawingOverlayDebug')) return false;
      const v = String(raw || '').trim().toLowerCase();
      if (v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes') return true;
      return false;
    } catch {
      return false;
    }
  })();

  const guessStripeWideFromSrc = useCallback((src) => {
    try {
      const s = String(src || '').toLowerCase();
      if (!s) return false;
      if (s.includes('/images_stripe/')) return true;
      if (/-stripe\.(png|webp|jpg|jpeg)(\?|#|$)/i.test(s)) return true;
      return false;
    } catch {
      return false;
    }
  }, []);

  const stripeOverlayIsStripeWideDerived = useMemo(
    () => guessStripeWideFromSrc(resolvedOverlaySrcEncoded || resolvedOverlaySrc),
    [guessStripeWideFromSrc, resolvedOverlaySrcEncoded, resolvedOverlaySrc]
  );
  const [stripeMaskTileRectsRawPct, setStripeMaskTileRectsRawPct] = useState(null);
  const [stripeMaskDebugRectsPct, setStripeMaskDebugRectsPct] = useState(null);

  const [tileGapPxLocal, setTileGapPxLocal] = useState(0);

  useEffect(() => {
    const sync = () => {
      try {
        const raw = window.localStorage.getItem('MEGA_STRIPE_TILE_GAP_PX');
        const n = raw == null ? 0 : Number.parseFloat(String(raw));
        setTileGapPxLocal(Number.isFinite(n) ? Math.min(200, Math.max(-200, n)) : 0);
      } catch {
        setTileGapPxLocal(0);
      }
    };
    sync();
    window.addEventListener('mega-stripe-tile-gap-changed', sync);
    return () => {
      window.removeEventListener('mega-stripe-tile-gap-changed', sync);
    };
  }, []);

  useEffect(() => {
    const wantMaskRects = stripeOverlayDebug || (megaShirtDrawingEnabledLocal && Boolean(drawingOverlaySrcEffective));
    if (!wantMaskRects) {
      setStripeMaskTileRectsRawPct(null);
      setStripeMaskDebugRectsPct(null);
      return;
    }

    let alive = true;

    const compute = async () => {
      let wrap;
      try {
        if (typeof document === 'undefined') return;
        const src = '/placeholders/t-shirt_buttons/v5/full-clic-area-5.svg';
        const viewW = 2866;
        const viewH = 307;
        const res = await fetch(src, { cache: 'force-cache' });
        const svgText = await res.text();
        if (!svgText) throw new Error('empty svg');

        wrap = document.createElement('div');
        wrap.style.position = 'fixed';
        wrap.style.left = '-99999px';
        wrap.style.top = '-99999px';
        wrap.style.width = `${viewW}px`;
        wrap.style.height = `${viewH}px`;
        wrap.style.opacity = '0';
        wrap.style.pointerEvents = 'none';
        wrap.style.overflow = 'hidden';
        wrap.innerHTML = svgText;

        const svg = wrap.querySelector('svg');
        if (!svg) throw new Error('no svg');
        svg.setAttribute('width', `${viewW}`);
        svg.setAttribute('height', `${viewH}`);
        svg.setAttribute('preserveAspectRatio', 'none');

        document.body.appendChild(wrap);

        const paths = Array.from(svg.querySelectorAll('path'));
        const best = paths
          .map((p) => ({ p, len: (p.getAttribute('d') || '').length }))
          .sort((a, b) => b.len - a.len)[0]?.p;

        if (!best) throw new Error('no path');
        const d = best.getAttribute('d') || '';
        const parent = best.parentNode;
        if (!parent) throw new Error('no parent');

        const parts = d.split(/(?=M)/g).map((s) => s.trim()).filter(Boolean);
        if (!parts.length) throw new Error('no parts');

        parent.removeChild(best);

        const nodes = parts.map((seg) => {
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          p.setAttribute('d', seg);
          p.setAttribute('fill', '#000');
          p.setAttribute('stroke', 'none');
          parent.appendChild(p);
          return p;
        });

        const svgRect = svg.getBoundingClientRect();
        if (!svgRect || !(svgRect.width > 0) || !(svgRect.height > 0)) throw new Error('bad svg rect');

        const bbs = nodes
          .map((p) => {
            try {
              const r = p.getBoundingClientRect();
              const leftPx = r.left - svgRect.left;
              const topPx = r.top - svgRect.top;
              const widthPx = r.width;
              const heightPx = r.height;
              if (!(widthPx > 0) || !(heightPx > 0)) return null;
              const area = widthPx * heightPx;
              return { leftPx, topPx, widthPx, heightPx, area };
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .filter((it) => it.widthPx > 3 && it.heightPx > 3);

        const top14 = bbs
          .sort((a, b) => (b.area - a.area))
          .slice(0, 14)
          .sort((a, b) => (a.leftPx - b.leftPx));

        const sortedRaw = top14.map((it) => {
          const left = (it.leftPx / svgRect.width) * 100;
          const top = (it.topPx / svgRect.height) * 100;
          const width = (it.widthPx / svgRect.width) * 100;
          const height = (it.heightPx / svgRect.height) * 100;
          return { left, top, width, height };
        });

        const ref = sortedRaw[0];
        const sorted = (ref && Number.isFinite(ref.width) && ref.width > 0)
          ? sortedRaw.map((r, idx) => {
            if (idx === 0) return r;
            const right = (r.left || 0) + (r.width || 0);
            const desiredWidth = ref.width;
            let nextLeft = right - desiredWidth;
            let nextWidth = desiredWidth;
            if (nextLeft < 0) {
              nextLeft = 0;
              nextWidth = Math.max(0, right);
            }
            return {
              ...r,
              left: nextLeft,
              width: nextWidth,
            };
          })
          : sortedRaw;

        if (!alive) return;
        if (sortedRaw.length === 14) {
          setStripeMaskTileRectsRawPct(sorted);
          setStripeMaskDebugRectsPct(stripeOverlayDebug ? sorted : null);
        } else {
          setStripeMaskTileRectsRawPct(null);
          setStripeMaskDebugRectsPct(null);
        }
      } catch {
        if (!alive) return;
        setStripeMaskTileRectsRawPct(null);
        setStripeMaskDebugRectsPct(null);
      } finally {
        if (wrap) {
          try {
            wrap.parentNode?.removeChild(wrap);
          } catch {
            // ignore
          }
        }
      }
    };

    compute();
    return () => {
      alive = false;
    };
  }, [stripeOverlayDebug, megaShirtDrawingEnabledLocal, drawingOverlaySrcEffective]);

  useEffect(() => {
    if (!resolvedOverlaySrc) {
      setStripeOverlayLoadState('no-src');
      setStripeOverlayIsStripeWide(false);
      return;
    }

    let alive = true;
    setStripeOverlayLoadState('loading');
    setStripeOverlayIsStripeWide(guessStripeWideFromSrc(resolvedOverlaySrcEncoded || resolvedOverlaySrc));
    try {
      const img = new Image();
      img.onload = () => {
        if (!alive) return;
        setStripeOverlayLoadState('ok');
        try {
          const w = Number(img.naturalWidth) || 0;
          const h = Number(img.naturalHeight) || 0;
          const ratio = h > 0 ? (w / h) : 0;
          if (ratio > 0) {
            setStripeOverlayIsStripeWide((ratio > 3) || guessStripeWideFromSrc(resolvedOverlaySrcEncoded || resolvedOverlaySrc));
          } else {
            setStripeOverlayIsStripeWide(guessStripeWideFromSrc(resolvedOverlaySrcEncoded || resolvedOverlaySrc));
          }
        } catch {
          setStripeOverlayIsStripeWide(false);
        }
      };
      img.onerror = () => { if (alive) setStripeOverlayLoadState('error'); };
      img.src = resolvedOverlaySrcEncoded || resolvedOverlaySrc;
    } catch {
      setStripeOverlayLoadState('error');
    }
    return () => { alive = false; };
  }, [resolvedOverlaySrc, resolvedOverlaySrcEncoded, guessStripeWideFromSrc]);

  const preloadedSrcRef = useRef(new Set());
  const preloadSrc = (src) => {
    try {
      if (!src || typeof src !== 'string') return;
      const normalized = src.trim();
      if (!normalized) return;
      if (preloadedSrcRef.current.has(normalized)) return;
      preloadedSrcRef.current.add(normalized);
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = encodeURI(normalized);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!resolvedOverlaySrc) return;

    preloadSrc(resolvedOverlaySrc);

    const s = resolvedOverlaySrc.toLowerCase();
    const isMulti = s.includes('/multi/') || s.includes('-multi-');
    if (!isMulti) return;

    // For multi overlays we sometimes swap light/dark per tile. Preload the sibling
    // to avoid visible pop-in when the variant is 'color'.
    if (s.includes('-multi-light-')) preloadSrc(resolvedOverlaySrc.replace(/-multi-light-/i, '-multi-dark-'));
    if (s.includes('-multi-dark-')) preloadSrc(resolvedOverlaySrc.replace(/-multi-dark-/i, '-multi-light-'));
  }, [resolvedOverlaySrc]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    try {
      if (typeof window === 'undefined') return;
      const prev = window.__HG_OVERLAY_DEBUG__ || {};
      const stripeWideEffective = Boolean(stripeOverlayIsStripeWideDerived || stripeOverlayIsStripeWide);
      window.__HG_OVERLAY_DEBUG__ = {
        ...prev,
        stripeOverlayDebug,
        showStripe: Boolean(showStripe),
        active: String(active || ''),
        resolvedOverlaySrc,
        stripeOverlayLoadState,
        stripeOverlayIsStripeWide: stripeWideEffective,
        stripeOverlayIsStripeWideDerived: Boolean(stripeOverlayIsStripeWideDerived),
        stripeOverlayIsStripeWideMeasured: Boolean(stripeOverlayIsStripeWide),
        stripeOverlayOverrideActive,
        overlaySrcFromUrl,
      };
    } catch {
      // ignore
    }
  }, [stripeOverlayDebug, showStripe, active, resolvedOverlaySrc, stripeOverlayLoadState, stripeOverlayIsStripeWide, stripeOverlayIsStripeWideDerived, stripeOverlayOverrideActive, overlaySrcFromUrl]);

  useEffect(() => {
    if (!resolvedOverlaySrc) return;
    try {
      const s = String(resolvedOverlaySrc || '').trim();
      const sLower = s.toLowerCase();
      const isStripeSrc = sLower.includes('/custom_logos/drawings/images_stripe/') || sLower.includes('/custom_logos/drawings/images_originals/stripe/');
      if (!isStripeSrc) return;
      window.localStorage.setItem('HG_DRAWING_OVERLAY_SRC', resolvedOverlaySrc);
      window.localStorage.setItem('HG_DRAWING_OVERLAY_COLLECTION', String(active || ''));
      window.dispatchEvent(new Event('hg-drawing-overlay-changed'));
      if (!stripeOverlayOverrideActive) {
        window.localStorage.setItem(overlayStorageKey, resolvedOverlaySrc);
      }
    } catch {
      // ignore
    }
  }, [overlayStorageKey, resolvedOverlaySrc, stripeOverlayOverrideActive]);
  const [megaTileSize, setMegaTileSize] = useState(null);
  const effectiveMegaTileSize = megaTileSize || 120;
  const [rootRemPx, setRootRemPx] = useState(16);
  const [megaTileSelectorParams, setMegaTileSelectorParams] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return {
          keyset: 'v1',
          enabled: true,
          target: 'NCC-1701-D',
          sizePx: 200,
          strokePx: 10,
          color: 'black',
          stepX: 0,
          stepY: 0,
          radiusPx: 8,
          extendTopPx: 30,
          extendRightPx: 0,
          extendBottomPx: 0,
          extendLeftPx: 0,
        };
      }

      const hasV2 = (() => {
        try {
          const a = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_ENABLED');
          const b = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_TARGET');
          const c = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_SIZE_PX');
          const d = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STROKE_PX');
          const e = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_COLOR');
          const f = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_X');
          const g = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_Y');
          return a != null || b != null || c != null || d != null || e != null || f != null || g != null;
        } catch {
          return false;
        }
      })();

      const readBool = (k, fallback) => {
        const raw = window.localStorage.getItem(k);
        if (raw == null) return fallback;
        const v = String(raw).trim().toLowerCase();
        if (v === '') return true;
        return v === '1' || v === 'true' || v === 'on' || v === 'yes';
      };

      const v1Enabled = readBool('MEGA_TILE_SELECTOR_ENABLED', true);
      const v2Enabled = readBool('MEGA_TILE_SELECTOR_V2_ENABLED', hasV2 ? false : true);
      const activeKeyset = v2Enabled ? 'v2' : (v1Enabled ? 'v1' : 'v2');
      const K = (suffix) => (activeKeyset === 'v2' ? `MEGA_TILE_SELECTOR_V2_${suffix}` : `MEGA_TILE_SELECTOR_${suffix}`);

      const readNum = (k, fallback) => {
        const raw = window.localStorage.getItem(k);
        const n = raw == null ? NaN : Number.parseFloat(String(raw));
        return Number.isFinite(n) ? n : fallback;
      };
      return {
        keyset: activeKeyset,
        enabled: readBool(K('ENABLED'), activeKeyset === 'v2' ? false : true),
        target: String(window.localStorage.getItem(K('TARGET')) || 'NCC-1701-D'),
        sizePx: Math.min(800, Math.max(20, readNum(K('SIZE_PX'), 200))),
        strokePx: Math.min(80, Math.max(0, readNum(K('STROKE_PX'), 10))),
        color: String(window.localStorage.getItem(K('COLOR')) || 'black'),
        stepX: Math.min(99, Math.max(-99, readNum(K('STEP_X'), 0))),
        stepY: Math.min(99, Math.max(-99, readNum(K('STEP_Y'), 0))),
        radiusPx: Math.min(200, Math.max(0, readNum(K('RADIUS_PX'), 8))),
        extendTopPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_TOP_PX'), 30))),
        extendRightPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_RIGHT_PX'), 0))),
        extendBottomPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_BOTTOM_PX'), 0))),
        extendLeftPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_LEFT_PX'), 0))),
      };
    } catch {
      return {
        keyset: 'v1',
        enabled: true,
        target: 'NCC-1701-D',
        sizePx: 200,
        strokePx: 10,
        color: 'black',
        stepX: 0,
        stepY: 0,
        radiusPx: 8,
        extendTopPx: 30,
        extendRightPx: 0,
        extendBottomPx: 0,
        extendLeftPx: 0,
      };
    }
  });
  const headerRef = useRef(null);
  const megaMenuRef = useRef(null);
  const [stripeRowPadPx, setStripeRowPadPx] = useState(32);
  const [stripeRowPadXPx, setStripeRowPadXPx] = useState({ left: 0, right: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const read = () => {
      try {
        const activeNow = String(activeRef.current || '');
        const hasV2 = (() => {
          try {
            const a = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_ENABLED');
            const b = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_TARGET');
            const c = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_SIZE_PX');
            const d = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STROKE_PX');
            const e = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_COLOR');
            const f = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_X');
            const g = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_Y');
            return a != null || b != null || c != null || d != null || e != null || f != null || g != null;
          } catch {
            return false;
          }
        })();

        const readBool = (k, fallback) => {
          const raw = window.localStorage.getItem(k);
          if (raw == null) return fallback;
          const v = String(raw).trim().toLowerCase();
          if (v === '') return true;
          return v === '1' || v === 'true' || v === 'on' || v === 'yes';
        };

        const v1Enabled = readBool('MEGA_TILE_SELECTOR_ENABLED', true);
        const v2Enabled = readBool('MEGA_TILE_SELECTOR_V2_ENABLED', hasV2 ? false : true);
        const activeKeyset = v2Enabled ? 'v2' : (v1Enabled ? 'v1' : 'v2');
        const K = (suffix) => (activeKeyset === 'v2' ? `MEGA_TILE_SELECTOR_V2_${suffix}` : `MEGA_TILE_SELECTOR_${suffix}`);

        const readNum = (k, fallback) => {
          const raw = window.localStorage.getItem(k);
          const n = raw == null ? NaN : Number.parseFloat(String(raw));
          return Number.isFinite(n) ? n : fallback;
        };
        setMegaTileSelectorParams({
          keyset: activeKeyset,
          enabled: readBool(K('ENABLED'), activeKeyset === 'v2' ? false : true),
          target: (() => {
            const publicState = getMegaPublicSelectorFor(activeNow, activeKeyset);
            const t = typeof publicState?.target === 'string' ? publicState.target.trim() : '';
            return t ? t : String(window.localStorage.getItem(K('TARGET')) || 'NCC-1701-D');
          })(),
          sizePx: Math.min(800, Math.max(20, readNum(K('SIZE_PX'), 200))),
          strokePx: Math.min(80, Math.max(0, readNum(K('STROKE_PX'), 10))),
          color: String(window.localStorage.getItem(K('COLOR')) || 'black'),
          stepX: (() => {
            const publicState = getMegaPublicSelectorFor(activeNow, activeKeyset);
            const v = Number(publicState?.stepX);
            if (Number.isFinite(v)) return Math.min(99, Math.max(-99, v));
            return Math.min(99, Math.max(-99, readNum(K('STEP_X'), 0)));
          })(),
          stepY: (() => {
            const publicState = getMegaPublicSelectorFor(activeNow, activeKeyset);
            const v = Number(publicState?.stepY);
            if (Number.isFinite(v)) return Math.min(99, Math.max(-99, v));
            return Math.min(99, Math.max(-99, readNum(K('STEP_Y'), 0)));
          })(),
          radiusPx: Math.min(200, Math.max(0, readNum(K('RADIUS_PX'), 8))),
          extendTopPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_TOP_PX'), 30))),
          extendRightPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_RIGHT_PX'), 0))),
          extendBottomPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_BOTTOM_PX'), 0))),
          extendLeftPx: Math.min(500, Math.max(-500, readNum(K('EXTEND_LEFT_PX'), 0))),
        });
      } catch {
        // ignore
      }
    };

    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (
        e.key === 'MEGA_TILE_SELECTOR_ENABLED'
        || e.key === 'MEGA_TILE_SELECTOR_TARGET'
        || e.key === 'MEGA_TILE_SELECTOR_SIZE_PX'
        || e.key === 'MEGA_TILE_SELECTOR_STROKE_PX'
        || e.key === 'MEGA_TILE_SELECTOR_COLOR'
        || e.key === 'MEGA_TILE_SELECTOR_STEP_X'
        || e.key === 'MEGA_TILE_SELECTOR_STEP_Y'
        || e.key === 'MEGA_TILE_SELECTOR_RADIUS_PX'
        || e.key === 'MEGA_TILE_SELECTOR_EXTEND_TOP_PX'
        || e.key === 'MEGA_TILE_SELECTOR_EXTEND_RIGHT_PX'
        || e.key === 'MEGA_TILE_SELECTOR_EXTEND_BOTTOM_PX'
        || e.key === 'MEGA_TILE_SELECTOR_EXTEND_LEFT_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_ENABLED'
        || e.key === 'MEGA_TILE_SELECTOR_V2_TARGET'
        || e.key === 'MEGA_TILE_SELECTOR_V2_SIZE_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_STROKE_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_COLOR'
        || e.key === 'MEGA_TILE_SELECTOR_V2_STEP_X'
        || e.key === 'MEGA_TILE_SELECTOR_V2_STEP_Y'
        || e.key === 'MEGA_TILE_SELECTOR_V2_RADIUS_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_EXTEND_TOP_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_EXTEND_RIGHT_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_EXTEND_BOTTOM_PX'
        || e.key === 'MEGA_TILE_SELECTOR_V2_EXTEND_LEFT_PX'
      ) {
        read();
      }
    };

    read();
    window.addEventListener('storage', onStorage);
    window.addEventListener('mega-tile-selector-changed', read);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('mega-tile-selector-changed', read);
    };
  }, []);

  const stripePreviewHPx = Math.round((effectiveMegaTileSize || 240) * 0.9);

  useLayoutEffect(() => {
    try {
      if (!active) return undefined;
      const el = megaMenuRef.current;
      if (!el || typeof window === 'undefined') return undefined;

      const update = () => {
        try {
          const cs = window.getComputedStyle(el);
          const pt = Number.parseFloat(cs?.paddingTop || '0');
          const pl = Number.parseFloat(cs?.paddingLeft || '0');
          const pr = Number.parseFloat(cs?.paddingRight || '0');
          if (Number.isFinite(pt) && pt >= 0) {
            setStripeRowPadPx((prev) => (prev === pt ? prev : pt));
          }
          if (Number.isFinite(pl) && pl >= 0 && Number.isFinite(pr) && pr >= 0) {
            setStripeRowPadXPx((prev) => {
              if (!prev) return { left: pl, right: pr };
              if (prev.left === pl && prev.right === pr) return prev;
              return { left: pl, right: pr };
            });
          }
        } catch {
          // ignore
        }
      };

      update();
      window.requestAnimationFrame(() => update());
      window.addEventListener('resize', update);
      return () => {
        window.removeEventListener('resize', update);
      };
    } catch {
      return undefined;
    }
  }, [active]);

  useLayoutEffect(() => {
    if (!active) return undefined;
    const el = megaMenuRef.current;
    if (!el) return undefined;

    const GAP_PX = 12; // gap-x-3
    const COLS = 9;

    let rafId = null;
    let retryCount = 0;
    const MAX_RETRIES = 24;
    let ro = null;

    const recompute = () => {
      const w = el.clientWidth;
      if (!w) {
        if (retryCount < MAX_RETRIES) {
          retryCount += 1;
          if (rafId != null) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(recompute);
        }
        return;
      }
      const cs = window.getComputedStyle(el);
      const pl = parseFloat(cs.paddingLeft || '0') || 0;
      const pr = parseFloat(cs.paddingRight || '0') || 0;
      const contentW = w - pl - pr;
      if (!contentW) return;
      const totalGaps = (COLS - 1) * GAP_PX;
      const colW = (contentW - totalGaps) / COLS;
      if (!Number.isFinite(colW) || colW <= 0) return;
      setMegaTileSize(colW);
    };

    recompute();
    rafId = requestAnimationFrame(recompute);
    window.addEventListener('resize', recompute);

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => recompute());
      try {
        ro.observe(el);
      } catch {
        ro = null;
      }
    }

    return () => {
      window.removeEventListener('resize', recompute);
      if (rafId != null) cancelAnimationFrame(rafId);
      try {
        ro?.disconnect?.();
      } catch {
        // ignore
      }
    };
  }, [active]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    try {
      if (typeof window === 'undefined') return;
      const prev = window.__HG_OVERLAY_DEBUG__ || {};
      window.__HG_OVERLAY_DEBUG__ = {
        ...prev,
        fullWideSlide: {
          ...(prev.fullWideSlide || {}),
          active,
          megaPage,
          megaTileSize,
        },
      };
    } catch {
      // ignore
    }
  }, [active, megaPage, megaTileSize]);
  const mobileHumanScrollRef = useRef(null);
  const logoMarkRef = useRef(null);
  const accountButtonRef = useRef(null);
  const searchHeaderRowRef = useRef(null);
  const searchGridRowRef = useRef(null);
  const searchGridScrollRef = useRef(null);
  const [megaInsetsPx, setMegaInsetsPx] = useState({ left: 0, right: 0 });
  const [bleedGuardExpandPx, setBleedGuardExpandPx] = useState({ left: 0, right: 0 });

  const ensureMegaOpen = () => {
    setActive((prev) => prev || 'first_contact');
  };


  const scrollSearchGridBy = (deltaPx) => {
    const el = searchGridScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: deltaPx, behavior: 'smooth' });
  };

  useLayoutEffect(() => {
    if (!active) return undefined;

    const containerEl = searchGridScrollRef.current;
    const rowEl = searchGridRowRef.current;
    if (!containerEl || !rowEl) return undefined;

    const measure = () => {
      const containerHeight = containerEl.clientHeight;
      const rowHeight = rowEl.offsetHeight;
      if (!containerHeight || !rowHeight) return;

      const nextScale = Math.max(0.5, Math.min(2.5, containerHeight / rowHeight));
      setSearchGridScale((prev) => (Math.abs(prev - nextScale) < 0.01 ? prev : nextScale));
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [active, megaPage, searchResults.length]);

  const isManualLockEnabled = () => {
    if (demoManualEnabled) return true;
    try {
      return window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1';
    } catch {
      return false;
    }
  };

  useLayoutEffect(() => {
    if (!active) return undefined;

    const logoEl = logoMarkRef.current;
    const accountEl = accountButtonRef.current;
    const megaEl = megaMenuRef.current;
    if (!logoEl || !accountEl || !megaEl) return undefined;

    const measure = () => {
      const megaRect = megaEl.getBoundingClientRect();
      const logoRect = logoEl.getBoundingClientRect();
      const accountRect = accountEl.getBoundingClientRect();

      const left = Math.max(0, Math.round(logoRect.right - megaRect.left));
      const right = Math.max(0, Math.round(megaRect.right - accountRect.left));

      setMegaInsetsPx((prev) => {
        if (prev.left === left && prev.right === right) return prev;
        return { left, right };
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(logoEl);
    ro.observe(accountEl);
    ro.observe(megaEl);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, [active]);

  useEffect(() => {
    if (!active || megaPage !== 2) return undefined;
    const id = window.setInterval(() => {
      setSearchCaretVisible((v) => !v);
    }, 520);
    return () => window.clearInterval(id);
  }, [active, megaPage]);

  const selectedColorHex = useMemo(
    () => ({
      white: '#ffffff',
      'light-blue': '#1f6feb',
      royal: '#2d6cff',
      purple: '#6b21a8',
      navy: '#1f2a44',
      daisy: '#facc15',
      gold: '#caa24d',
      'light-pink': '#f9a8d4',
      red: '#d11a2a',
      kiwi: '#84cc16',
      'irish-green': '#1f6f3a',
      'military-green': '#556b2f',
      'forest-green': '#0b3d2e',
      black: '#111111',
    }),
    []
  );

  const getSlugLuminance = useMemo(() => {
    const hexToRgb = (hex) => {
      if (!hex || typeof hex !== 'string') return null;
      const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
      if (!m) return null;
      const v = m[1];
      const r = Number.parseInt(v.slice(0, 2), 16);
      const g = Number.parseInt(v.slice(2, 4), 16);
      const b = Number.parseInt(v.slice(4, 6), 16);
      return { r, g, b };
    };

    const srgbToLinear = (c) => {
      const x = c / 255;
      return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    };

    return (slug) => {
      const hex = selectedColorHex?.[slug];
      const rgb = hexToRgb(hex);
      if (!rgb) return null;
      const r = srgbToLinear(rgb.r);
      const g = srgbToLinear(rgb.g);
      const b = srgbToLinear(rgb.b);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
  }, [selectedColorHex]);

  const colorLabelBySlug = useMemo(() => {
    const colors = Array.isArray(gildan5000Catalog?.colors) ? gildan5000Catalog.colors : [];
    const out = {};
    for (const c of colors) {
      if (!c?.slug) continue;
      out[c.slug] = c.label || c.slug;
    }
    return out;
  }, [gildan5000Catalog]);

  const selectedColorOrder = useMemo(
    () => [
      'white',
      'light-blue',
      'royal',
      'purple',
      'navy',
      'daisy',
      'gold',
      'light-pink',
      'red',
      'kiwi',
      'irish-green',
      'military-green',
      'forest-green',
      'black',
    ],
    []
  );

  const resolveStripeOverlaySrcForTile = useCallback(
    (src, idx) => {
      try {
        if (!src || typeof src !== 'string') return src;
        const lower = src.toLowerCase();
        const safeIdx = Number.isFinite(Number(idx)) ? Number(idx) : 0;
        const maxIdx = Array.isArray(selectedColorOrder) && selectedColorOrder.length > 0
          ? Math.max(0, selectedColorOrder.length - 1)
          : 13;
        const isFirst = safeIdx === 0;
        const isLast = safeIdx === maxIdx;

        const hasMultiLight = lower.includes('-multi-light-');
        const hasMultiDark = lower.includes('-multi-dark-');
        if (hasMultiLight || hasMultiDark) {
          if (isFirst) return hasMultiDark ? src : src.replace(/-multi-light-/i, '-multi-dark-');
          return hasMultiLight ? src : src.replace(/-multi-dark-/i, '-multi-light-');
        }

        const hasWhiteInk = /-w(?=[-.])/i.test(src) || lower.includes('/white/');
        const hasBlackInk = /-b(?=[-.])/i.test(src) || lower.includes('/black/');
        if (!hasWhiteInk && !hasBlackInk) return src;

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

        if (hasWhiteInk) {
          return isFirst ? toBlack(src) : src;
        }
        return isLast ? toWhite(src) : src;
      } catch {
        return src;
      }
    },
    [selectedColorOrder]
  );

  const colorButtonSrcBySlug = useMemo(
    () => ({
      white: '/placeholders/t-shirt_buttons/1.png',
      'light-pink': '/placeholders/t-shirt_buttons/selector-color-light-pink.png',
      'light-blue': '/placeholders/t-shirt_buttons/selector-color-light-blue.png',
      daisy: '/placeholders/t-shirt_buttons/selector-color-daisy.png',
      gold: '/placeholders/t-shirt_buttons/selector-color-gold.png',
      red: '/placeholders/t-shirt_buttons/selector-color-red.png',
      purple: '/placeholders/t-shirt_buttons/selector-color-purple.png',
      royal: '/placeholders/t-shirt_buttons/selector-color-blue-royal.png',
      navy: '/placeholders/t-shirt_buttons/selector-color-blue-navy.png',
      'military-green': '/placeholders/t-shirt_buttons/selector-color-military-green.png',
      'forest-green': '/placeholders/t-shirt_buttons/selector-color-forest-green.png',
      'irish-green': '/placeholders/t-shirt_buttons/selector-color-irish-green.png',
      kiwi: '/placeholders/t-shirt_buttons/selector-color-kiwi.png',
      black: '/placeholders/t-shirt_buttons/selector-color-black.png',
    }),
    []
  );

  const defaultNav = useMemo(
    () => [
      { id: 'first_contact', label: 'First Contact' },
      { id: 'the_human_inside', label: 'The Human Inside' },
      { id: 'austen', label: 'Austen' },
      { id: 'cube', label: 'Cube' },
      { id: 'outcasted', label: 'Miscel·lània' },
    ],
    []
  );

  const resolvedNav = useMemo(() => {
    const provided = Array.isArray(navItems) ? navItems : [];
    const byId = new Map();

    for (const item of provided) {
      if (!item?.id) continue;
      byId.set(item.id, item);
    }
    for (const item of defaultNav) {
      if (!item?.id) continue;
      if (!byId.has(item.id)) byId.set(item.id, item);
    }

    const out = [];
    if (byId.has('first_contact')) out.push(byId.get('first_contact'));

    for (const item of provided) {
      if (!item?.id) continue;
      if (item.id === 'first_contact') continue;
      if (byId.has(item.id)) out.push(byId.get(item.id));
    }
    for (const item of defaultNav) {
      if (!item?.id) continue;
      if (item.id === 'first_contact') continue;
      if (out.some((x) => x?.id === item.id)) continue;
      out.push(item);
    }

    return out;
  }, [defaultNav, navItems]);

  const allowStripeV4UrlParams = useMemo(() => {
    try {
      if (typeof window === 'undefined') return false;
      const p = new URLSearchParams(location?.search || window.location.search || '');
      const wantsStripeDebug = Boolean(
        p.has('debugStripeHit')
        || p.has('stripeCalib')
        || p.has('debugV4OverlayCalib')
        || Array.from(p.keys()).some((k) => (k || '').toString().startsWith('v4'))
      );
      if (!wantsStripeDebug) return false;

      if (import.meta.env.DEV) return true;
      const host = (window.location?.hostname || '').toLowerCase();
      return host === 'localhost' || host === '127.0.0.1';
    } catch {
      return false;
    }
  }, [location?.search]);

  const thinDrawings = useMemo(
    () => [
      'R2-D2',
      'C3P0',
      'Vader',
      'Afrodita',
      'Mazinger',
      'Cylon 78',
      'Cylon 03',
      'Iron Man 68',
      'Iron Man 08',
      'Cyberman',
      'The Dalek',
      'Maschinenmensch',
      'Robocop',
      'Terminator',
      'Robbie the Robot',
    ],
    []
  );

  const thinWindowItems = useMemo(() => {
    const list = Array.isArray(thinDrawings) ? thinDrawings : [];
    if (list.length === 0) return [];
    const start = ((thinStartIndex % list.length) + list.length) % list.length;
    const out = [];
    for (let i = 0; i < 7; i += 1) {
      out.push(list[(start + i) % list.length]);
    }
    return out;
  }, [thinDrawings, thinStartIndex]);

  const defaultMega = useMemo(
    () => ({
      first_contact: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            'NX-01',
            'NCC-1701',
            'NCC-1701-D',
            'Wormhole',
            'Plasma Escape',
            "Vulcan's End",
            'The Phoenix',
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
      the_human_inside: [
        {
          title: '',
          items: [CONTROL_TILE_BN, ...thinDrawings, CONTROL_TILE_ARROWS],
        },
      ],
      austen: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/blue-dark-gradient-grid.webp',
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/red-frame-grid.webp',
            '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/yellow-solid-grid.webp',
            '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-multi-red-grid.webp',
            '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-multi-w-red-grid.webp',
            '/custom_logos/drawings/images_grid/austen/keep_calm/keep-calm-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/pemberley_house/pemberley-house-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/quotes/it-is-a-truth-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/quotes/you-must-allow-me-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/quotes/body-and-soul-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/quotes/unsociable-and-taciturn-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/quotes/half-agony-half-hope-b-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/pride-and-prejudice-2-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/sense-and-sensibility-3-grid.webp',
            '/custom_logos/drawings/images_grid/austen/crosswords/persuasion-4-grid.webp',
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
      cube: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            'Iron Kong',
            'Iron Cube 68',
            'RoboCube',
            'Cylon Cube',
            'Cylon Cube 03',
            'MaschinenCube',
            'Mazinger C',
            'Afrodita C',
            'Cube 3 P0',
            'Cyber Cube',
            'Darth Cube',
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
      outcasted: [
        {
          title: '',
          items: [
            CONTROL_TILE_BN,
            '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable-b-grid.webp',
            '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable-b-grid.webp',
            '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable-b-grid.webp',
            '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable-b-grid.webp',
            '/custom_logos/drawings/images_grid/miscel·lania/pont-del-diable-b-grid.webp',
            CONTROL_TILE_ARROWS,
          ],
        },
      ],
    }),
    [thinWindowItems]
  );

  const resolvedMega = useMemo(() => {
    if (!megaConfig || typeof megaConfig !== 'object') return defaultMega;

    const out = { ...defaultMega };
    for (const [key, value] of Object.entries(megaConfig)) {
      if (!Array.isArray(value) || value.length === 0) continue;
      const hasAnyItems = value.some((col) => Array.isArray(col?.items) && col.items.length > 0);
      if (!hasAnyItems) continue;
      out[key] = value;
    }

    try {
      const pemb = '/custom_logos/drawings/images_grid/austen/pemberley_house/pemberley-house-b-grid.webp';
      const cols = out.austen;
      const hasPemb = Array.isArray(cols) && cols.some((col) => Array.isArray(col?.items) && col.items.some((it) => typeof it === 'string' && it.includes('/austen/pemberley_house/')));
      if (Array.isArray(cols) && cols.length > 0 && !hasPemb) {
        out.austen = cols.map((col) => {
          const items = Array.isArray(col?.items) ? col.items.slice() : [];
          if (items.includes(pemb)) return col;
          const bnIdx = items.indexOf(CONTROL_TILE_BN);
          const insertAt = bnIdx >= 0 ? bnIdx + 1 : 0;
          items.splice(insertAt, 0, pemb);
          return { ...col, items };
        });
      }
    } catch {
    }

    if (gridCalibFromUrl) {
      out.cube = defaultMega.cube;
    }
    return out;
  }, [defaultMega, gridCalibFromUrl, megaConfig]);

  useEffect(() => {
    if (!active) return;
    if (stripeOverlayOverrideActive) return;

    const pickFirstDrawingItem = (items) => {
      const list = Array.isArray(items) ? items : [];
      for (const it of list) {
        if (!it) continue;
        if (it === CONTROL_TILE_BN) continue;
        if (it === CONTROL_TILE_ARROWS) continue;
        return it;
      }
      return null;
    };

    const col = resolvedMega?.[active];
    const firstItems = Array.isArray(col) && col.length > 0 ? col[0]?.items : null;
    const fallbackItem = pickFirstDrawingItem(firstItems);
    if (!fallbackItem) return;

    if (active === 'first_contact') {
      if (firstContactSelectedItem) return;
      setFirstContactSelectedItem(fallbackItem);
      return;
    }

    if (active === 'the_human_inside') {
      if (humanInsideSelectedItem) return;
      setHumanInsideSelectedItem(fallbackItem);
      return;
    }

    if (active === 'cube' || active === 'outcasted') {
      if (selectedItemByCollection?.[active]) return;
      setSelectedItemByCollection((prev) => ({ ...prev, [active]: fallbackItem }));
    }

    if (active === 'austen') {
      if (selectedItemByCollection?.[active]) return;
      setSelectedItemByCollection((prev) => ({ ...prev, [active]: fallbackItem }));
    }
  }, [
    active,
    CONTROL_TILE_ARROWS,
    CONTROL_TILE_BN,
    firstContactSelectedItem,
    humanInsideSelectedItem,
    resolvedMega,
    selectedItemByCollection,
    stripeOverlayOverrideActive,
  ]);

  // Sincronitzar selectedItem amb el target del selector
  useEffect(() => {
    if (!active) return;
    if (!megaTileSelectorParams?.enabled) return;
    
    const target = megaTileSelectorParams?.target;
    if (!target || typeof target !== 'string') return;
    
    // Actualitzar el selectedItem segons la col·lecció activa
    if (active === 'first_contact') {
      if (firstContactSelectedItem !== target) {
        setFirstContactSelectedItem(target);
      }
    } else if (active === 'the_human_inside') {
      if (humanInsideSelectedItem !== target) {
        setHumanInsideSelectedItem(target);
      }
    } else {
      // Per altres col·leccions (cube, austen, outcasted)
      if (selectedItemByCollection?.[active] !== target) {
        setSelectedItemByCollection((prev) => ({ ...prev, [active]: target }));
      }
    }
  }, [
    active,
    megaTileSelectorParams?.target,
    megaTileSelectorParams?.enabled,
    firstContactSelectedItem,
    humanInsideSelectedItem,
    selectedItemByCollection,
    setFirstContactSelectedItem,
    setHumanInsideSelectedItem,
    setSelectedItemByCollection,
  ]);

  useEffect(() => {
    if (typeof manualEnabledOverride === 'boolean') return undefined;
    if (contained) return undefined;

    const readControls = () => {
      try {
        const enabled = window.localStorage.getItem('FULL_WIDE_SLIDE_DEMO_MANUAL') === '1';
        setDemoManualEnabled((prev) => (prev === enabled ? prev : enabled));
      } catch {
        setDemoManualEnabled((prev) => (prev === false ? prev : false));
      }
    };

    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === 'FULL_WIDE_SLIDE_DEMO_MANUAL' || e.key === 'FULL_WIDE_SLIDE_DEMO_PHASE') {
        readControls();
      }
    };

    const onLocalChange = () => {
      readControls();
    };

    readControls();
    window.addEventListener('storage', onStorage);
    window.addEventListener('full-wide-slide-demo-controls-changed', onLocalChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('full-wide-slide-demo-controls-changed', onLocalChange);
    };
  }, [contained, manualEnabledOverride]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (demoManualEnabled) return;
      setActive(null);
      setMobileOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [demoManualEnabled]);

  useEffect(() => {
    let mounted = true;
    getGildan5000Catalog().then((catalog) => {
      if (mounted) setGildan5000Catalog(catalog);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    if (gildan5000Catalog) return;
    let cancelled = false;
    getGildan5000Catalog()
      .then((data) => {
        if (cancelled) return;
        setGildan5000Catalog(data);
      })
      .catch(() => {
        if (cancelled) return;
        setGildan5000Catalog({ selected: [], selectedSlugs: new Set(), getPlaceholderSrc: () => null });
      });
    return () => {
      cancelled = true;
    };
  }, [active, gildan5000Catalog]);

  useEffect(() => {
    try {
      const p = new URLSearchParams(location.search);
      const fromUrl = p.get('active') || p.get('collection') || '';
      const next = typeof fromUrl === 'string' ? fromUrl.trim() : '';
      const allowed = new Set(['first_contact', 'the_human_inside', 'austen', 'cube', 'outcasted']);
      if (next && allowed.has(next)) {
        setActive(next);
        return;
      }
    } catch {
      // ignore
    }

    if (typeof manualEnabledOverride === 'boolean') {
      setActive(manualEnabledOverride ? (initialActiveId || 'first_contact') : null);
      return;
    }
    if (contained) {
      setActive(initialActiveId || 'first_contact');
      return;
    }
    setActive(demoManualEnabled ? 'first_contact' : null);
  }, [contained, demoManualEnabled, initialActiveId, manualEnabledOverride]);

  useEffect(() => {
    // keep: previously reset megaPage; mega is now single-page
  }, [active]);

  useEffect(() => {
    if (contained) return undefined;
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [contained, mobileOpen]);

  useEffect(() => {
    const recompute = () => {
      try {
        const px = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
        if (Number.isFinite(px) && px > 0) setRootRemPx(px);
      } catch {
        setRootRemPx(16);
      }
    };

    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, []);

  const canUseDom = typeof document !== 'undefined';

  const scrollMobileHumanByTiles = (dir) => {
    const el = mobileHumanScrollRef.current;
    if (!el) return;
    const step = 120 * 3 + 12 * 3;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <header
      ref={headerRef}
      className={`${contained ? 'relative' : 'fixed'} z-[10000] bg-background`}
      style={
        contained
          ? { top: 0,
                  marginTop: '-25px', left: 0, right: 0 }
          : {
 top: 'var(--appHeaderOffset, 0px)', left: 'var(--rulerInset, 0px)', right: 0 }
      }
    >
      <div className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted lg:hidden"
              aria-label={mobileOpen ? 'Tancar menú' : 'Obrir menú'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link to="/" className="relative z-10 pointer-events-auto flex items-center gap-2 font-black tracking-tight text-foreground">
              <span
                ref={logoMarkRef}
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
            </Link>
          </div>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-6">
            {resolvedNav.map((item) => {
              const open = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`inline-flex items-center gap-1 text-xs font-semibold tracking-[0.18em] uppercase ${open ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-expanded={open ? 'true' : 'false'}
                  onClick={() => {
                    setMegaPage(1);
                    setMegaFullScreen(false);
                    setActive((prev) => {
                      const next = prev === item.id ? null : item.id;
                      if (next) touchMegaPublicActivity();
                      return next;
                    });
                  }}
                >
                  {item.label}
                  <ChevronDown className={`h-4 w-4 ${open ? 'rotate-180' : ''}`} />
                </button>
              );
            })}
          </nav>

          <div
            className="ml-auto grid grid-cols-3 items-center"
            style={{ width: megaTileSize ? `${Math.round(megaTileSize)}px` : `${Math.round(effectiveMegaTileSize)}px` }}
            data-icons-wrap="true"
          >
            <div className="justify-self-start">
              <IconButton
                label="Search"
                onClick={() => {
                  // mega is single-page; keep icon but do not navigate to another slide
                  setMegaPage(2);
                  setMegaFullScreen(false);
                  if (!active) ensureMegaOpen();
                  touchMegaPublicActivity();
                }}
              >
                <svg className="h-[25px] w-[25px] text-foreground -translate-x-[1px] lg:h-[29px] lg:w-[29px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </IconButton>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (cartClickTimeoutRef.current) window.clearTimeout(cartClickTimeoutRef.current);
                cartClickTimeoutRef.current = window.setTimeout(() => {
                  cartClickTimeoutRef.current = null;
                  if (megaPage === 3 && active) {
                    // Si ja estem a la pàgina 3 i el mega-menu està obert
                    if (acordioExpanded) {
                      // Si l'acordió està obert, només el tanquem (mantenim mega-menu obert)
                      setAcordioExpanded(false);
                    } else {
                      // Si l'acordió està tancat, l'obrim
                      setAcordioExpanded(true);
                    }
                  } else {
                    // Si no estem a la pàgina 3, hi anem
                    setMegaPage(3);
                    setAcordioExpanded(false);
                    if (!active) ensureMegaOpen();
                  }
                  touchMegaPublicActivity();
                }, dblClickDelayMs);
              }}
              aria-label="Cart"
              className="relative inline-flex h-9 w-9 items-center justify-center justify-self-center rounded-md text-foreground hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:h-10 lg:w-10"
            >
              <span aria-hidden="true" className="relative block h-[27px] w-[27px] transition-all duration-200 lg:h-[31px] lg:w-[31px]">
                <span
                  className="absolute inset-0"
                  style={{
                    display: 'block',
                    backgroundColor: 'currentColor',
                    WebkitMaskImage: `url(${cartItemCount > 0 ? '/custom_logos/icons/cistell-ple-2.svg' : '/custom_logos/icons/cistell-buit.svg'})`,
                    maskImage: `url(${cartItemCount > 0 ? '/custom_logos/icons/cistell-ple-2.svg' : '/custom_logos/icons/cistell-buit.svg'})`,
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                  }}
                />
                {cartItemCount > 0 ? (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 text-whiteStrong text-[13.75px] font-bold lg:text-[16.25px]"
                    style={{ top: 'calc(60% - 0.5px)', transform: 'translate(-50%, -50%)', lineHeight: '1' }}
                  >
                    {cartItemCount}
                  </span>
                ) : null}
              </span>
            </button>
            <div className="justify-self-end">
              <IconButton
                label="Account"
                buttonRef={accountButtonRef}
                onClick={(e) => {
                  e.preventDefault();
                  if (accountClickTimeoutRef.current) window.clearTimeout(accountClickTimeoutRef.current);
                  accountClickTimeoutRef.current = window.setTimeout(() => {
                    accountClickTimeoutRef.current = null;
                    if (megaPage === 4 && active) {
                      // Si ja estem a la pàgina 4 i el mega-menu està obert
                      if (acordioExpandedPage4) {
                        // Si l'acordió està obert, només el tanquem (mantenim mega-menu obert)
                        setAcordioExpandedPage4(false);
                      } else {
                        // Si l'acordió està tancat, l'obrim
                        setAcordioExpandedPage4(true);
                      }
                    } else {
                      // Si no estem a la pàgina 4, hi anem
                      setMegaPage(4);
                      setAcordioExpandedPage4(false);
                      if (!active) ensureMegaOpen();
                    }
                    touchMegaPublicActivity();
                  }, dblClickDelayMs);
                }}
              >
                <UserRound className="h-[25px] w-[25px] text-foreground lg:h-[29px] lg:w-[29px]" strokeWidth={1.5} />
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {canUseDom && (!contained || portalContainer) &&
        ReactDOM.createPortal(
          active ? (
            <div
              className={`${contained ? 'absolute' : 'fixed'} inset-0 z-[9990] bg-foreground/25`}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (isManualLockEnabled()) return;
                setMegaPage(1);
                setActive(null);
                setMegaFullScreen(false);
              }}
            />
          ) : null,
          portalContainer || document.body
        )}

      <div
        className="relative"
        onMouseLeave={() => {
          if (isManualLockEnabled()) return;
          setMegaPage(1);
          setActive(null);
          setMegaFullScreen(false);
        }}
      >
        {active ? (
          <div 
            className="relative z-[10000] block border-b border-border bg-background" 
            style={{ 
              overflow: 'visible',
              ...(megaFullScreen ? {
                minHeight: '100vh',
              } : {})
            }}
          >
            <div
              ref={megaMenuRef}
              className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-8"
              style={{ 
                overflow: 'visible',
                ...(megaFullScreen ? {
                  minHeight: 'calc(100vh - 16px)',
                } : {})
              }}
            >
              <MegaStripeBleedGuard
                heightPx={effectiveMegaTileSize
                  ? `${Math.round(effectiveMegaTileSize * 2 + 37 + (() => {
                    try {
                      const qs = (typeof window !== 'undefined') ? window.location?.search : '';
                      const p = qs ? new URLSearchParams(qs) : null;
                      const bottomPad = stripeRowPadPx;
                      return Math.max(0, bottomPad);
                    } catch {
                      return 0;
                    }
                  })())}px`
                  : undefined}
                debug={false}
                expandLeftPx={bleedGuardExpandPx?.left || 0}
                expandRightPx={bleedGuardExpandPx?.right || 0}
              >
                <div style={{ 
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100vw',
                  height: '100%',
                  overflow: 'visible'
                }}>
                  <div
                    style={{
                      display: 'flex',
                      width: '400%',
                      height: '100%',
                      transform: `translateX(${megaPage === 2 ? '-25%' : megaPage === 3 ? '-50%' : megaPage === 4 ? '-75%' : '0'})`,
                      transition: 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)',
                    }}
                  >
                    <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
                      <div style={{ 
                        flex: '1 1 auto',
                      }} />
                      
                      <div style={{ flex: '0 0 auto', width: '1400px', maxWidth: '100%', position: 'relative', height: '100%', paddingLeft: '40px', paddingRight: '40px' }}>
                        <MegaStripePanel
                          active={active}
                          resolvedMega={resolvedMega}
                          showStripe={showStripe}
                          stripeRowPadPx={stripeRowPadPx}
                          stripeRowPadXPx={stripeRowPadXPx}
                          stripePreviewHPx={stripePreviewHPx}
                          stripeOverlayLoadState={stripeOverlayLoadState}
                          resolvedOverlaySrc={resolvedOverlaySrc}
                          stripeOverlayDebug={stripeOverlayDebug}
                          stripeMaskDebugRectsPct={stripeMaskDebugRectsPct}
                          megaStripeSpriteEnabledLocal={megaStripeSpriteEnabledLocal}
                          megaStripeRefEnabledLocal={megaStripeRefEnabledLocal}
                          megaStripeRefSrcLocal={megaStripeRefSrcLocal}
                          megaStripeRef2EnabledLocal={megaStripeRef2EnabledLocal}
                          megaStripeRef2SrcLocal={megaStripeRef2SrcLocal}
                          megaShirtDrawingEnabledLocal={megaShirtDrawingEnabledLocal}
                          drawingOverlaySrcEffective={drawingOverlaySrcEffective}
                          stripeMaskTileRectsRawPct={stripeMaskTileRectsRawPct}
                          drawingOverlayDebug={drawingOverlayDebug}
                          tileGapPxLocal={tileGapPxLocal}
                          humanInsideVariant={humanInsideVariant}
                          firstContactVariant={firstContactVariant}
                          reorderAustenQuotes={reorderAustenQuotes}
                          austenSelectedDisableMulti={austenSelectedDisableMulti}
                          stripeVariantVisibility={stripeVariantVisibility}
                          megaTileSelectorParams={megaTileSelectorParams}
                          onStartSelectorDrag={onStartSelectorDrag}
                          megaTileSize={megaTileSize}
                          setStripeOverlayOverrideActive={setStripeOverlayOverrideActive}
                          setFirstContactVariant={setFirstContactVariant}
                          setHumanInsideVariant={setHumanInsideVariant}
                          setThinStartIndex={setThinStartIndex}
                          setFirstContactSelectedItem={setFirstContactSelectedItem}
                          setHumanInsideSelectedItem={setHumanInsideSelectedItem}
                          setSelectedItemByCollection={setSelectedItemByCollection}
                          normalizeOverlaySrc={normalizeOverlaySrc}
                        />
                      </div>

                      <div style={{ 
                        flex: '1 1 auto',
                      }} />
                    </div>

                    <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
                      <div style={{ 
                        flex: '1 1 auto',
                      }} />

                      <div style={{ 
                        flex: '0 0 auto', 
                        width: '1400px', 
                        maxWidth: '100%', 
                        position: 'relative', 
                        height: '100%', 
                        paddingLeft: '40px', 
                        paddingRight: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                      }}>
                        <div style={{ 
                          width: '100%', 
                          height: '40px',
                          backgroundColor: '#B2B2B2',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '16px',
                          paddingRight: '16px',
                        }}>
                          <input
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              touchMegaPublicActivity();
                            }}
                            placeholder="Busca productes…"
                            className="w-full bg-transparent outline-none text-sm font-semibold text-white placeholder:text-white/70"
                            style={{ color: 'white' }}
                          />
                        </div>

                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: 'repeat(9, 1fr)',
                          gap: '16px',
                          flex: 1,
                        }}>
                          {[...Array(9)].map((_, i) => (
                            <div
                              key={i}
                              style={{
                                backgroundColor: '#B2B2B2',
                                transform: (i === 1 || i === 3 || i === 5 || i === 7) ? 'scale(0.9)' : 'none',
                                transformOrigin: 'top center',
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div style={{ 
                        flex: '1 1 auto',
                      }} />
                    </div>

                    <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
                      <div style={{ 
                        flex: '1 1 auto',
                      }} />

                      <div style={{ 
                        flex: '0 0 auto', 
                        width: '1400px', 
                        maxWidth: '100%', 
                        position: 'relative', 
                        height: '100%',
                        paddingLeft: '40px', 
                        paddingRight: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}>
                        <div 
                          onWheel={(e) => {
                            if (!acordioExpanded) {
                              e.preventDefault();
                              e.currentTarget.scrollLeft += e.deltaY;
                            }
                          }}
                          style={{
                          width: '100%',
                          height: '100%',
                          flexShrink: 0,
                          backgroundColor: 'transparent',
                          padding: 0,
                          margin: 0,
                          display: 'flex',
                          flexDirection: 'row',
                          gap: '3px',
                          overflowX: 'auto',
                          overflowY: 'hidden',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                        }}>
                          {/* Carrusel de productes del cistell */}
                          {carouselProducts.map((product, idx) => (
                            <div key={idx} style={{
                              position: 'relative',
                              flexShrink: 0,
                              overflow: 'visible',
                              height: '100%',
                              aspectRatio: '308 / 678',
                              fontSize: '1vh',
                            }}>
                              {/* Wrapper amb filtre per tot excepte botons */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                filter: product.disabled ? 'grayscale(100%)' : 'none',
                                opacity: product.disabled ? 0.5 : 1,
                                transition: 'filter 0.3s ease, opacity 0.3s ease',
                                pointerEvents: 'none',
                              }}>
                              {/* Capa 1: Color-card de fons */}
                              <img 
                                src={`/placeholders/color-cards/${product.img}`}
                                alt={`${product.name} - ${product.size}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'fill',
                                  display: 'block',
                                  opacity: 1,
                                }}
                              />
                              
                              {/* Capa 2: Imatge del producte centrada dins del rectangle verd */}
                              {product.isTemplate && (
                              <div style={{
                                position: 'absolute',
                                top: '8.222%',
                                left: '4.87%',
                                right: '4.87%',
                                bottom: '62.056%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                backgroundColor: 'transparent',
                                zIndex: 5,
                              }}>
                                <img
                                  src={`/custom_logos/drawings/images_stripe/${product.drawing}`}
                                  alt={product.name}
                                  style={{
                                    width: 'auto',
                                    height: 'auto',
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              </div>
                              )}

                              {/* Overlay: Graella de referència REIXA */}
                              {product.isTemplate && false && (
                              <img 
                                src="/placeholders/color-cards/tmp/REIXA.png"
                                alt="Graella de referència"
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'fill',
                                  pointerEvents: 'none',
                                  zIndex: 100,
                                }}
                              />
                              )}

                              {/* Capa 3: Nom del producte */}
                              {product.isTemplate && (
                              <div style={{
                                  position: 'absolute',
                                  bottom: 'calc(40.5% + 8px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontFamily: 'Oswald, sans-serif',
                                  fontSize: '11.4pt',
                                  fontWeight: 600,
                                  color: '#000000',
                                  letterSpacing: '0.0025em',
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap',
                                  zIndex: 10,
                              }}>
                                  {product.name}
                                </div>
                              )}

                              {/* Capa 4: Selector de quantitat */}
                              {product.isTemplate && (
                              <div className="quantity-row" style={{
                                  position: 'absolute',
                                  bottom: 'calc(37.5% - 8.5px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2.6%',
                                  zIndex: 10,
                                  pointerEvents: 'auto',
                              }}>
                                  <button className="qty-btn" onClick={() => updateQuantity(idx, -1)} style={{
                                    width: '20px',
                                    height: '20px',
                                    border: 'none',
                                    background: 'transparent',
                                    fontFamily: 'Avenir Next, sans-serif',
                                    fontSize: '15pt',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    color: '#000000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1,
                                    padding: 0,
                                    position: 'relative',
                                    left: '-8px',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                  }}>−</button>
                                  <div style={{
                                    fontFamily: 'Avenir Next Condensed, sans-serif',
                                    fontSize: '9.6pt',
                                    fontWeight: 400,
                                    fontStretch: 'condensed',
                                    color: '#000000',
                                    letterSpacing: '0.08em',
                                    textAlign: 'center',
                                    lineHeight: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    left: '-4px',
                                  }}>QUANTITAT</div>
                                  <div style={{
                                    fontFamily: 'Avenir Next Condensed, sans-serif',
                                    fontSize: '9.6pt',
                                    fontWeight: 600,
                                    fontStretch: 'condensed',
                                    color: '#000000',
                                    textAlign: 'center',
                                    lineHeight: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    left: '3.25px',
                                    minWidth: '12px',
                                  }}>{product.qty}</div>
                                  <button className="qty-btn" onClick={() => updateQuantity(idx, 1)} style={{
                                    width: '20px',
                                    height: '20px',
                                    border: 'none',
                                    background: 'transparent',
                                    fontFamily: 'Avenir Next, sans-serif',
                                    fontSize: '15pt',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    color: '#000000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1,
                                    padding: 0,
                                    position: 'relative',
                                    left: '8px',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                  }}>+</button>
                                </div>
                              )}

                              {/* Capa 5: Selector de tallatge */}
                              {product.isTemplate && (
                              <div className="size-row" style={{
                                  position: 'absolute',
                                  bottom: 'calc(31.6% - 8px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2.6%',
                                  zIndex: 10,
                                  pointerEvents: 'auto',
                              }}>
                                  <button className="size-btn" onClick={() => updateSize(idx, -1)} style={{
                                    width: '20px',
                                    height: '20px',
                                    border: 'none',
                                    background: 'transparent',
                                    fontFamily: 'Avenir Next, sans-serif',
                                    fontSize: '15pt',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    color: '#000000',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1,
                                    position: 'relative',
                                    left: '4px',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                  }}>−</button>
                                  <div style={{
                                    fontFamily: 'Roboto Condensed, sans-serif',
                                    fontSize: '9.6pt',
                                    fontWeight: 400,
                                    color: '#000000',
                                    letterSpacing: '0.04em',
                                    minWidth: '70px',
                                    textAlign: 'center',
                                    position: 'relative',
                                    left: '1px',
                                  }}>TALLATGE</div>
                                  <div style={{
                                    fontFamily: 'Roboto Condensed, sans-serif',
                                    fontSize: '9.6pt',
                                    fontWeight: 700,
                                    color: '#000000',
                                    minWidth: '18px',
                                    textAlign: 'center',
                                    position: 'relative',
                                    left: '-5px',
                                  }}>{product.size}</div>
                                  <button className="size-btn" onClick={() => updateSize(idx, 1)} style={{
                                    width: '20px',
                                    height: '20px',
                                    border: 'none',
                                    background: 'transparent',
                                    fontFamily: 'Avenir Next, sans-serif',
                                    fontSize: '15pt',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    color: '#000000',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1,
                                    position: 'relative',
                                    left: '-4px',
                                    opacity: 0,
                                    transition: 'opacity 0.2s ease',
                                  }}>+</button>
                                </div>
                              )}

                              {/* Capa 6: Preu */}
                              {product.isTemplate && (
                              <div style={{
                                  position: 'absolute',
                                  bottom: 'calc(18.9% - 14.5px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontFamily: 'Avenir Next Condensed, sans-serif',
                                  fontSize: '18pt',
                                  fontWeight: 600,
                                  fontStretch: 'condensed',
                                  color: '#000000',
                                  textAlign: 'center',
                                  zIndex: 10,
                              }}>
                                  {product.price}
                                </div>
                              )}
                              </div>

                              {/* Capa 7: Botons d'acció */}
                              {product.isTemplate && (
                              <div style={{
                                  position: 'absolute',
                                  bottom: 'calc(8.6% - 8px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  display: 'flex',
                                  gap: '13%',
                                  zIndex: 10,
                                  justifyContent: 'center',
                              }}>
                                  <button onClick={() => {
                                    if (megaPage === 3 && active) {
                                      setMegaFullScreen((prev) => !prev);
                                    } else {
                                      setMegaPage(3);
                                      if (!active) ensureMegaOpen();
                                    }
                                    touchMegaPublicActivity();
                                  }} style={{
                                    width: '24px',
                                    height: '24px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    padding: 0,
                                    position: 'relative',
                                    top: '-2px',
                                    left: product.disabled ? '0' : '-3px',
                                    transform: 'scale(0.855)',
                                  }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#272727" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                      <rect x="1" y="8" width="22" height="4" fill="#272727"/>
                                    </svg>
                                  </button>
                                  {!product.disabled && (
                                    <button onClick={() => disableProduct(idx)} style={{
                                      width: '24px',
                                      height: '24px',
                                      border: 'none',
                                      background: 'transparent',
                                      cursor: 'pointer',
                                      padding: 0,
                                      position: 'relative',
                                      top: '-2px',
                                      left: '3px',
                                    }}>
                                      <svg width="23.625" height="23.625" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="3">
                                        <path d="M18 6L6 18M6 6l12 12" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Contingut de l'acordió - Overlay absolut full-width */}
                        {acordioExpanded && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100vw',
                            minHeight: '100vh',
                            backgroundColor: 'white',
                            paddingTop: '40px',
                            paddingBottom: '40px',
                            zIndex: 10,
                          }}>
                            <div style={{
                              maxWidth: '1400px',
                              margin: '0 auto',
                              padding: '0 40px',
                            }}>
                              {/* Títol */}
                              <h2 style={{
                                fontFamily: 'Oswald, sans-serif',
                                fontSize: '48px',
                                fontWeight: 700,
                                color: '#1E62B8',
                                marginTop: '10px',
                                marginBottom: '40px',
                                textAlign: 'center',
                              }}>
                                RESUM DE LA COMANDA
                              </h2>

                              {/* Contingut de prova */}
                              <div style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '30px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                marginBottom: '20px',
                              }}>
                                <h3 style={{
                                  fontFamily: 'Oswald, sans-serif',
                                  fontSize: '24px',
                                  fontWeight: 600,
                                  color: '#333',
                                  marginBottom: '20px',
                                }}>
                                  Productes al cistell
                                </h3>
                                <p style={{
                                  fontFamily: 'system-ui, sans-serif',
                                  fontSize: '16px',
                                  color: '#666',
                                  lineHeight: '1.6',
                                }}>
                                  Aquí pots afegir el llistat de productes, totals, opcions de pagament, 
                                  formularis, botons d'acció, o qualsevol altre contingut que necessitis.
                                </p>
                              </div>

                              {/* Més contingut de prova */}
                              <div style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '30px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                marginBottom: '20px',
                              }}>
                                <h3 style={{
                                  fontFamily: 'Oswald, sans-serif',
                                  fontSize: '24px',
                                  fontWeight: 600,
                                  color: '#333',
                                  marginBottom: '20px',
                                }}>
                                  Total
                                </h3>
                                <p style={{
                                  fontFamily: 'Oswald, sans-serif',
                                  fontSize: '32px',
                                  fontWeight: 700,
                                  color: '#1E62B8',
                                }}>
                                  123,45 €
                                </p>
                              </div>

                              {/* Botó d'exemple */}
                              <button style={{
                                width: '100%',
                                padding: '20px',
                                backgroundColor: '#1E62B8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontFamily: 'Oswald, sans-serif',
                                fontSize: '20px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                              }}>
                                FINALITZAR COMANDA
                              </button>
                            </div>
                          </div>
                        )}

                        <style>{`
                          div::-webkit-scrollbar {
                            display: none;
                          }
                          .quantity-row:hover .qty-btn,
                          .size-row:hover .size-btn {
                            opacity: 1 !important;
                          }
                        `}</style>
                      </div>

                      <div style={{ 
                        flex: '1 1 auto',
                      }} />
                    </div>

                    <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
                      <div style={{ 
                        flex: '1 1 auto',
                      }} />

                      <div style={{ 
                        flex: '0 0 auto', 
                        width: '1400px', 
                        maxWidth: '100%', 
                        position: 'relative', 
                        height: '100%', 
                        paddingLeft: '40px', 
                        paddingRight: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}>
                        {/* ZONA 1: Slide - Resum del compte amb 4 columnes */}
                        <div style={{ 
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#ADD8E6',
                          flexShrink: 0,
                          padding: '0',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '2px',
                          alignItems: 'stretch',
                          border: '1px solid #999',
                        }}>
                          {/* Columna 1: Avatar i nom */}
                          <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                          }}>
                            <div style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: '50%',
                              backgroundColor: '#1E62B8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '32px',
                              fontWeight: 700,
                              color: 'white',
                              fontFamily: 'Oswald, sans-serif',
                            }}>
                              JG
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{
                                fontFamily: 'Roboto Condensed, sans-serif',
                                fontSize: '15pt',
                                fontWeight: 500,
                                color: '#000',
                                marginBottom: '4px',
                              }}>
                                Joan Garcia
                              </div>
                              <div style={{
                                fontFamily: 'Roboto Condensed, sans-serif',
                                fontSize: '12pt',
                                fontWeight: 300,
                                color: '#666',
                              }}>
                                joan.garcia@example.com
                              </div>
                            </div>
                          </div>

                          {/* Columna 2: Comandes */}
                          <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <div style={{
                              fontFamily: 'Roboto Condensed, sans-serif',
                              fontSize: '15pt',
                              fontWeight: 500,
                              color: '#1E62B8',
                              lineHeight: 1,
                              marginBottom: '8px',
                            }}>
                              12
                            </div>
                            <div style={{
                              fontFamily: 'Roboto Condensed, sans-serif',
                              fontSize: '12pt',
                              fontWeight: 300,
                              color: '#666',
                            }}>
                              Comandes
                            </div>
                          </div>

                          {/* Columna 3: Favorits */}
                          <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <div style={{
                              fontFamily: 'Roboto Condensed, sans-serif',
                              fontSize: '15pt',
                              fontWeight: 500,
                              color: '#1E62B8',
                              lineHeight: 1,
                              marginBottom: '8px',
                            }}>
                              3
                            </div>
                            <div style={{
                              fontFamily: 'Roboto Condensed, sans-serif',
                              fontSize: '12pt',
                              fontWeight: 300,
                              color: '#666',
                            }}>
                              Favorits
                            </div>
                          </div>

                          {/* Columna 4: Estat VIP i botó */}
                          <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '16px',
                          }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{
                                fontFamily: 'Roboto Condensed, sans-serif',
                                fontSize: '15pt',
                                fontWeight: 500,
                                color: '#1E62B8',
                                lineHeight: 1,
                                marginBottom: '8px',
                              }}>
                                VIP
                              </div>
                              <div style={{
                                fontFamily: 'Roboto Condensed, sans-serif',
                                fontSize: '12pt',
                                fontWeight: 300,
                                color: '#666',
                              }}>
                                Estat
                              </div>
                            </div>
                            <button
                              onClick={() => setAcordioExpandedPage4(true)}
                              style={{
                                width: '100%',
                                backgroundColor: '#000',
                                color: 'white',
                                fontFamily: 'Roboto Condensed, sans-serif',
                                fontSize: '12pt',
                                fontWeight: 400,
                                padding: '10px 16px',
                                borderRadius: '0',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#000'}
                            >
                              Editar
                            </button>
                          </div>
                        </div>

                        {/* Contingut de l'acordió - Overlay absolut full-width */}
                        {acordioExpandedPage4 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100vw',
                            minHeight: '100vh',
                            backgroundColor: 'white',
                            paddingTop: '66px',
                            paddingBottom: '0',
                            zIndex: 10,
                            overflowY: 'auto',
                          }}>
                            <div style={{
                              maxWidth: '1400px',
                              margin: '0 auto',
                              padding: '0 40px',
                              position: 'relative',
                              height: 'calc(100vh - 66px)',
                              display: 'flex',
                              flexDirection: 'column',
                            }}>

                              {/* Rectangle gris de fons */}
                              <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '40px',
                                right: '40px',
                                bottom: '33px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '0',
                                zIndex: 0,
                                pointerEvents: 'none',
                                display: 'none',
                              }} />

                              {/* Sistema de pestanyes */}
                              <UserProfileTabs onTabChange={setActiveUserTab} />

                              {/* Contingut de les pestanyes */}
                              <UserProfileContent activeTab={activeUserTab} />

                              {/* Preferències i botons d'acció */}
                              {false && <div style={{
                                marginBottom: '60px',
                                position: 'relative',
                                zIndex: 1,
                              }}>
                                <h3 style={{
                                  fontFamily: 'Oswald, sans-serif',
                                  fontSize: '24px',
                                  fontWeight: 600,
                                  color: '#1E62B8',
                                  marginBottom: '25px',
                                  textTransform: 'uppercase',
                                }}>
                                  Preferències
                                </h3>

                                {/* Checkbox newsletter */}
                                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <input
                                    type="checkbox"
                                    id="newsletter"
                                    defaultChecked
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      cursor: 'pointer',
                                      accentColor: '#1E62B8',
                                    }}
                                  />
                                  <label
                                    htmlFor="newsletter"
                                    style={{
                                      fontFamily: 'system-ui, sans-serif',
                                      fontSize: '16px',
                                      color: '#333',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Vull rebre notícies i ofertes per correu electrònic
                                  </label>
                                </div>

                                {/* Checkbox promocions */}
                                <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <input
                                    type="checkbox"
                                    id="promos"
                                    defaultChecked
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      cursor: 'pointer',
                                      accentColor: '#1E62B8',
                                    }}
                                  />
                                  <label
                                    htmlFor="promos"
                                    style={{
                                      fontFamily: 'system-ui, sans-serif',
                                      fontSize: '16px',
                                      color: '#333',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Accepto rebre promocions exclusives
                                  </label>
                                </div>

                                {/* Botons d'acció */}
                                <div style={{ display: 'flex', gap: '15px' }}>
                                  <button style={{
                                    flex: 1,
                                    backgroundColor: '#1E62B8',
                                    color: 'white',
                                    fontFamily: 'Oswald, sans-serif',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    padding: '16px 32px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    transition: 'background-color 0.2s',
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = '#154a8f'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = '#1E62B8'}
                                  >
                                    Guardar Canvis
                                  </button>
                                  <button style={{
                                    flex: 1,
                                    backgroundColor: 'transparent',
                                    color: '#1E62B8',
                                    fontFamily: 'Oswald, sans-serif',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    padding: '16px 32px',
                                    borderRadius: '8px',
                                    border: '2px solid #1E62B8',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#1E62B8';
                                    e.target.style.color = 'white';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = '#1E62B8';
                                  }}
                                  >
                                    Cancel·lar
                                  </button>
                                </div>
                              </div>}

                              {/* Espai buit al bottom */}
                              <div style={{ 
                                position: 'absolute',
                                bottom: '0',
                                left: '0',
                                right: '0',
                                height: '33px',
                                zIndex: 9999,
                                backgroundColor: 'red',
                                border: '5px solid yellow'
                              }} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ 
                        flex: '1 1 auto',
                      }} />
                    </div>
                  </div>
                </div>
              </MegaStripeBleedGuard>
            </div>
          </div>
        ) : null}
      </div>

      {mobileOpen ? (
        <div className="lg:hidden border-b border-border bg-background">
          <div className="px-4 py-4 grid gap-2">
            {resolvedNav.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex items-center justify-between rounded-xl px-3 py-3 text-left text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setActive((prev) => (prev === item.id ? null : item.id))}
              >
                {item.label}
                <ChevronDown className={`h-4 w-4 ${active === item.id ? 'rotate-180' : ''}`} />
              </button>
            ))}
          </div>

          {active ? (
            <div className="border-t border-border px-4 py-4">
              <div className="grid gap-4">
                {(resolvedMega[active] || []).map((col) => (
                  <div key={col.title} className="rounded-2xl bg-muted p-4">
                    <div
                      ref={
                        active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9 ? mobileHumanScrollRef : undefined
                      }
                      className={
                        active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9
                          ? 'relative mt-3 overflow-x-auto'
                          : 'mt-3 grid grid-cols-3 gap-3'
                      }
                    >
                      <div
                        className={active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9 ? 'grid gap-x-3' : ''}
                        style={
                          active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9
                            ? {
                                width: 'max-content',
                                gridAutoFlow: 'column',
                                gridAutoColumns: '120px',
                              }
                            : undefined
                        }
                      >
                        {(() => {
                          const isPath = (v) => typeof v === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(v);
                          const base = active === 'the_human_inside' ? col.items : col.items.slice(0, 9);
                          if (active !== 'outcasted') return base;
                          const variant = firstContactVariant;
                          return base.filter((it) => {
                            if (it === CONTROL_TILE_BN || it === CONTROL_TILE_ARROWS) return true;
                            if (!isPath(it)) return false;
                            if (it.startsWith('black/')) return variant !== 'white';
                            if (it.startsWith('white/')) return variant === 'white';
                            return true;
                          });
                        })().map((it, idx) => (
                          <div key={`${it}-${idx}`} className="min-w-0">
                            {!it || it === CONTROL_TILE_ARROWS || it === CONTROL_TILE_BN ? (
                              <div className="h-4" />
                            ) : active === 'outcasted' && typeof it === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(it) ? (
                              <div className="h-4" />
                            ) : (
                              <Link
                                to="#"
                                className="flex h-4 w-full items-center justify-center rounded-none bg-muted px-2 text-xs text-muted-foreground hover:text-foreground"
                              >
                                {it}
                              </Link>
                            )}

                            {FIRST_CONTACT_MEDIA[it] ? (
                              <div className="relative mt-2 aspect-square w-full overflow-hidden">
                                {idx >= 1 && idx <= 7 ? (
                                  <div
                                    className={`absolute inset-0 rounded-md ${
                                      firstContactVariant === 'white' ? 'bg-foreground' : 'bg-transparent'
                                    }`}
                                  />
                                ) : null}
                                <OptimizedImg
                                  src={resolveGridThumbSrc(it, active) || FIRST_CONTACT_MEDIA[it]}
                                  alt={it}
                                  className={
                                    it === 'The Phoenix'
                                      ? 'absolute left-1/2 top-1/2 h-[92%] w-[92%] -translate-x-1/2 -translate-y-1/2 object-contain'
                                      : 'absolute inset-0 h-full w-full object-contain'
                                  }
                                />

                                {idx >= 1 && idx <= 7 && firstContactVariant === 'white' && !(
                                  typeof resolveGridThumbSrc(it, active) === 'string'
                                  && resolveGridThumbSrc(it, active).includes('/custom_logos/drawings/images_grid/first_contact/white/')
                                ) ? (
                                  <OptimizedImg
                                    src={resolveGridThumbSrc(it, active) || FIRST_CONTACT_MEDIA_WHITE[it] || FIRST_CONTACT_MEDIA[it]}
                                    alt={it}
                                    className={`absolute inset-0 z-20 h-full w-full object-contain transition-opacity duration-300 ease-in-out ${
                                      firstContactVariant === 'white' ? 'opacity-100' : 'opacity-0'
                                    } ${
                                      it === 'Wormhole'
                                        ? 'scale-[0.54]'
                                        : it === 'Plasma Escape'
                                          ? 'scale-[0.54]'
                                          : it === "Vulcan's End"
                                            ? 'scale-[0.66]'
                                            : 'scale-[0.6]'
                                    }`}
                                  />
                                ) : null}
                              </div>
                            ) : active === 'outcasted' && typeof it === 'string' && /\.(png|jpg|jpeg|webp)$/i.test(it) ? (
                              <div className="relative mt-2 aspect-square w-full overflow-hidden">
                                <OptimizedImg
                                  src={resolveGridThumbSrc(it, active) || it}
                                  alt=""
                                  className="relative z-10 h-full w-full object-contain"
                                />
                              </div>
                            ) : THE_HUMAN_INSIDE_MEDIA[it] ? (
                              <div className="relative mt-2 aspect-square w-full overflow-hidden">
                                <OptimizedImg
                                  src={(humanInsideVariant === 'white' ? THE_HUMAN_INSIDE_MEDIA_WHITE : THE_HUMAN_INSIDE_MEDIA)[it]}
                                  alt={it}
                                  className={`relative z-10 h-full w-full object-contain ${it === 'Mazinger' ? 'scale-[0.64]' : it === 'Maschinenmensch' ? 'scale-[0.65]' : 'scale-[0.6]'}`}
                                />
                              </div>
                            ) : it === CONTROL_TILE_BN ? (
                              active === 'the_human_inside' ? (
                                <FirstContactDibuix00Buttons onWhite={() => { setStripeOverlayOverrideActive(false); setHumanInsideVariant('white'); }} onBlack={() => { setStripeOverlayOverrideActive(false); setHumanInsideVariant('black'); }} onMulti={() => { setStripeOverlayOverrideActive(false); setHumanInsideVariant('color'); }} />
                              ) : (
                                <FirstContactDibuix00Buttons
                                  onWhite={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('white'); }}
                                  onBlack={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('black'); }}
                                  onMulti={() => { setStripeOverlayOverrideActive(false); setFirstContactVariant('color'); }}
                                  showWhite={stripeVariantVisibility?.white !== false}
                                  showBlack={stripeVariantVisibility?.black !== false}
                                  showMulti={stripeVariantVisibility?.color !== false}
                                />
                              )
                            ) : it === CONTROL_TILE_ARROWS ? (
                              <FirstContactDibuix09Buttons
                                tileSize={120}
                                onPrev={active === 'the_human_inside' ? () => setThinStartIndex((v) => v - 1) : () => {}}
                                onNext={active === 'the_human_inside' ? () => setThinStartIndex((v) => v + 1) : () => {}}
                              />
                            ) : (
                              <div className="mt-2 aspect-square w-full rounded-md bg-muted" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {active === 'the_human_inside' && Array.isArray(col.items) && col.items.length > 9 ? (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          className="h-9 rounded-xl border border-border bg-background text-xs font-semibold tracking-[0.18em] uppercase text-foreground/80"
                          onClick={() => scrollMobileHumanByTiles(-1)}
                        >
                          Anterior
                        </button>
                        <button
                          type="button"
                          className="h-9 rounded-xl border border-border bg-background text-xs font-semibold tracking-[0.18em] uppercase text-foreground/80"
                          onClick={() => scrollMobileHumanByTiles(1)}
                        >
                          Següent
                        </button>
                      </div>
                    ) : null}

                    {active === 'outcasted' ? null : (
                      <div className="mt-4">
                        <div className="grid gap-2">
                          {(col.items || []).filter(Boolean).slice(0, 8).map((it) => (
                            <Link key={it} to="#" className="text-sm text-muted-foreground hover:text-foreground">
                              {it}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <div className="h-[1px] w-full bg-border" />
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-foreground"
                        >
                          <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
                          Catàleg
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-foreground"
                        >
                          <Layers className="h-4 w-4" strokeWidth={1.75} />
                          Col·lecció
                        </button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="h-[1px] w-full bg-border" />
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-foreground"
                        >
                          <motion.span layoutId={`stripe-${active}`} className="h-3 w-3 rounded-full bg-foreground" />
                          Color
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-foreground"
                        >
                          Detalls
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
