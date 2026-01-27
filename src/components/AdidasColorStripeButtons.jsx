import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function AdidasColorStripeButtons({
  megaTileSize,
  selectedColorOrder,
  selectedColorSlug,
  onSelect,
  colorLabelBySlug,
  colorButtonSrcBySlug,
  itemLeftOffsetPxByIndex,
  redistributeBetweenFirstAndLast = false,
  firstOffsetPx = -20,
  lastOffsetPx = 50,
  cropFirstRightPx = 20,
  compressFactor = 0.79,
  forceDebugStripeHit = false,
  ignoreUrlDebugStripeHit = false,
  debugSelectedPanel = '',
}) {
  const items = useMemo(() => (Array.isArray(selectedColorOrder) ? selectedColorOrder.slice(0, 14) : []), [selectedColorOrder]);

  const selectedTileRef = useRef(null);
  const [selectedTileSize, setSelectedTileSize] = useState({ w: 0, h: 0 });
  const dotCalibrationRef = useRef(null);

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const debugStripeHit = forceDebugStripeHit || (!ignoreUrlDebugStripeHit && !!urlParams?.has('debugStripeHit'));
  const stripeRecalibrate = !!urlParams?.has('stripeRecalibrate');

  const parseFloatParam = (key, fallback) => {
    const raw = urlParams?.get(key);
    if (raw == null || raw === '') return fallback;
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  const parseIntParam = (key, fallback) => {
    const raw = urlParams?.get(key);
    if (raw == null || raw === '') return fallback;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  const stripeDotXPx = parseFloatParam('stripeDotX', 52);
  const stripeDotYPx = parseFloatParam('stripeDotY', -6.5);

  useEffect(() => {
    if (!megaTileSize) return;
    if (items.length === 0) return;

    const el = selectedTileRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSelectedTileSize({ w: rect.width, h: rect.height });
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => ro.disconnect();
  }, [items.length, megaTileSize, selectedColorSlug]);

  useEffect(() => {
    if (!megaTileSize) return;
    if (items.length === 0) return;
    if (!selectedTileSize.w || !selectedTileSize.h) return;

    if (stripeRecalibrate || !dotCalibrationRef.current) {
      dotCalibrationRef.current = {
        rx: stripeDotXPx / selectedTileSize.w,
        ry: stripeDotYPx / selectedTileSize.h,
      };
    }
  }, [items.length, megaTileSize, selectedTileSize.w, selectedTileSize.h, stripeDotXPx, stripeDotYPx, stripeRecalibrate]);

  if (!megaTileSize) return null;
  if (items.length === 0) return null;

  const imageAspect = 161 / 145;
  const refMegaTileSize = 360;
  const refButtonW = Math.round(refMegaTileSize * imageAspect);
  const buttonW = Math.round(megaTileSize * imageAspect);
  const baseOverlap = Math.round(megaTileSize * 0.36);
  const baseStep = Math.max(0, buttonW - baseOverlap);
  const step = Math.round(baseStep * compressFactor);
  const stepEq = step + lastOffsetPx / 13;
  const hitW = Math.max(1, Math.round(stepEq));
  const cropRightPx = Math.max(0, Math.round(cropFirstRightPx));

  const rotatePoint = (x, y, rad) => {
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return { x: x * cos - y * sin, y: x * sin + y * cos };
  };

  const t2ScaleX = refButtonW === 0 ? 1 : buttonW / refButtonW;
  const t2ScaleY = refMegaTileSize === 0 ? 1 : megaTileSize / refMegaTileSize;

  const scaleT2X = (v) => Math.round(v * t2ScaleX);
  const scaleT2Y = (v) => Math.round(v * t2ScaleY);
  const defaultT2OffsetXPx = 2;

  const defaultT2Pieces = [
    { n: 1, x: scaleT2X(-114) + defaultT2OffsetXPx, y: scaleT2Y(6), deg: 25, w: scaleT2X(65), h: scaleT2Y(22) },
    { n: 2, x: scaleT2X(-96) + defaultT2OffsetXPx, y: scaleT2Y(16), deg: 0, w: scaleT2X(102), h: scaleT2Y(22) },
    { n: 3, x: scaleT2X(7) + defaultT2OffsetXPx, y: scaleT2Y(16), deg: 25, w: scaleT2X(94), h: scaleT2Y(80) },
    { n: 4, x: scaleT2X(93) + defaultT2OffsetXPx, y: scaleT2Y(56), deg: 40, w: scaleT2X(102), h: scaleT2Y(248) },
    { n: 5, x: scaleT2X(0) + defaultT2OffsetXPx, y: scaleT2Y(118), deg: 40, w: scaleT2X(32), h: scaleT2Y(140) },
    { n: 6, x: scaleT2X(-90) + defaultT2OffsetXPx, y: scaleT2Y(226), deg: 0, w: scaleT2X(174), h: scaleT2Y(134) },
    { n: 7, x: scaleT2X(-53) + defaultT2OffsetXPx, y: scaleT2Y(1), deg: 40, w: scaleT2X(124), h: scaleT2Y(54) },
  ];

  const rectVertex = (v, w, h) => {
    if (v === 2) return { x: w, y: 0 };
    if (v === 3) return { x: w, y: h };
    if (v === 4) return { x: 0, y: h };
    return { x: 0, y: 0 };
  };

  return (
    <div
      className="absolute left-0 top-0 z-[40]"
      style={{ height: `${megaTileSize}px`, pointerEvents: 'auto' }}
    >
      {items.map((slug, idx) => {
        const src = colorButtonSrcBySlug?.[slug];
        const lastIdx = Math.max(0, items.length - 1);
        const offsetThis = Number.isFinite(itemLeftOffsetPxByIndex?.[idx]) ? itemLeftOffsetPxByIndex[idx] : 0;
        const offsetFirst = Number.isFinite(itemLeftOffsetPxByIndex?.[0]) ? itemLeftOffsetPxByIndex[0] : 0;
        const offsetLast = Number.isFinite(itemLeftOffsetPxByIndex?.[lastIdx]) ? itemLeftOffsetPxByIndex[lastIdx] : 0;

        const baseLeft = firstOffsetPx + idx * stepEq;
        const left0 = firstOffsetPx + offsetFirst;
        const leftLast = firstOffsetPx + lastIdx * stepEq + offsetLast;

        const left = redistributeBetweenFirstAndLast && lastIdx > 0 && idx !== 0 && idx !== lastIdx
          ? left0 + (idx / lastIdx) * (leftLast - left0)
          : baseLeft + offsetThis;
        const firstClip = `inset(0 0 0 ${cropRightPx}px)`;
        const shouldClip = idx === 0 && cropRightPx > 0;
        const isSelected = selectedColorSlug === slug;
        const isFirst = idx === 0;
        const isLast = idx === items.length - 1;
        const thisHitW = isLast ? buttonW : hitW;

        const globalOffsetXPx = parseIntParam('allx', 0);
        const globalOffsetYPx = parseIntParam('ally', 0);

        const sectorBaseW = 323;
        const sectorBaseH = 290;
        const s1W = 207.42;
        const s1H = 248;
        const s1X = 0;
        const s1Y = sectorBaseH - s1H;
        const s1OffsetXPx = parseIntParam('s1p1x', 5);

        const sx = buttonW / sectorBaseW;
        const sy = megaTileSize / sectorBaseH;

        const s2W = 82.896;
        const s2H = 32.731;
        const s2X = s1X + (s1W - s2W) / 2;
        const s2Y = s1Y - s2H;

        const s34W = 79.353;
        const s34H = 64;
        const s34RotDeg = 24.56;

        const s234OffsetXPx = parseIntParam('s1p234x', -1);
        const s234OffsetYPx = parseIntParam('s1p234y', 0);

        const p1OffsetXPx = parseIntParam('1p1x', 0);
        const p1OffsetYPx = parseIntParam('1p1y', 0);
        const p1RotDeg = parseFloatParam('1p1deg', 0);
        const p1WPx = parseIntParam('1p1w', 0);
        const p1HPx = parseIntParam('1p1h', 0);

        const p2OffsetXPx = parseIntParam('1p2x', 0);
        const p2OffsetYPx = parseIntParam('1p2y', 0);
        const p2RotDeg = parseFloatParam('1p2deg', 0);
        const p2WPx = parseIntParam('1p2w', 0);
        const p2HPx = parseIntParam('1p2h', 0);

        const p3OffsetXPx = parseIntParam('1p3x', 0);
        const p3OffsetYPx = parseIntParam('1p3y', 0);
        const p3RotDeg = parseFloatParam('1p3deg', 0);
        const p3WPx = parseIntParam('1p3w', 0);
        const p3HPx = parseIntParam('1p3h', 0);

        const p4OffsetXPx = parseIntParam('1p4x', 0);
        const p4OffsetYPx = parseIntParam('1p4y', 0);
        const p4RotDeg = parseFloatParam('1p4deg', 0);
        const p4WPx = parseIntParam('1p4w', 0);
        const p4HPx = parseIntParam('1p4h', 0);

        const p5Enabled = parseIntParam('1p5on', 1) === 1;
        const p5W = 83;
        const p5H = 109;
        const p5RotDeg = parseFloatParam('1p5deg', 41.0);
        const p5OffsetXPx = parseIntParam('1p5x', 0);
        const p5OffsetYPx = parseIntParam('1p5y', 0);
        const p5WPxOverride = parseIntParam('1p5w', 0);
        const p5HPxOverride = parseIntParam('1p5h', 0);
        const p5FromVertex = parseIntParam('1p5from', 2);
        const p5ToVertex = parseIntParam('1p5to', 1);
        const p5SwapWH = parseIntParam('1p5swap', 0) === 1;

        const p2TLx = s2X * sx + s1OffsetXPx + s234OffsetXPx;
        const p2TLy = s2Y * sy + s234OffsetYPx;
        const p2TRx = (s2X + s2W) * sx + s1OffsetXPx + s234OffsetXPx;
        const p2TRy = s2Y * sy + s234OffsetYPx;

        const s34Wp = s34W * sx;
        const s34Hp = s34H * sy;

        const p5Wp = (p5SwapWH ? p5H : p5W) * sx;
        const p5Hp = (p5SwapWH ? p5W : p5H) * sy;

        const notchW = Math.max(8, Math.round(thisHitW * 0.28));
        const bodyW = Math.max(1, thisHitW - notchW);
        const bandTop = Math.round(megaTileSize * 0.06);
        const bandBottom = Math.round(megaTileSize * 0.92);
        const steps = 4;
        const stepW = Math.max(1, Math.round(notchW / steps));
        const sleeveH = Math.round(megaTileSize * 0.26);

        return (
          <div
            key={`${slug}-${idx}`}
            className="absolute top-0"
            data-stripe-tile
            data-slug={slug}
            ref={isSelected ? selectedTileRef : null}
            style={{
              width: `${buttonW}px`,
              height: `${megaTileSize}px`,
              left: `${left}px`,
              pointerEvents: 'none',
              zIndex: 100 - idx,
            }}
          >
            <div
              className="absolute inset-0 transition-shadow duration-150 ease-out"
              style={{ pointerEvents: 'none' }}
            >
              {isSelected ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute z-20 h-2 w-2 rounded-full bg-foreground"
                  data-stripe-dot
                  data-slug={slug}
                  style={{
                    left: `${((dotCalibrationRef.current?.rx ?? (stripeDotXPx / buttonW)) * (selectedTileSize.w || buttonW))}px`,
                    top: `${((dotCalibrationRef.current?.ry ?? (stripeDotYPx / megaTileSize)) * (selectedTileSize.h || megaTileSize))}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ) : null}
              {src ? (
                <span
                  className="absolute inset-0 overflow-visible"
                  style={shouldClip ? { clipPath: firstClip, WebkitClipPath: firstClip } : undefined}
                >
                  <img
                    src={src}
                    alt={slug}
                    className="pointer-events-none block h-full object-contain object-bottom"
                    style={{
                      width: `${buttonW}px`,
                    }}
                  />
                </span>
              ) : null}
            </div>

            {isFirst ? (
              <>
                <button
                  type="button"
                  onClick={() => onSelect?.(slug)}
                  aria-label={colorLabelBySlug?.[slug] || slug}
                  aria-pressed={isSelected}
                  className="absolute bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                  style={{
                    outline: debugStripeHit
                      ? debugSelectedPanel === '1p1'
                        ? '1px solid rgba(0,120,255,0.95)'
                        : '1px solid rgba(255,0,0,0.55)'
                      : undefined,
                    left: `${Math.round((s1X / sectorBaseW) * buttonW) + s1OffsetXPx + p1OffsetXPx + globalOffsetXPx}px`,
                    top: `${Math.round((s1Y / sectorBaseH) * megaTileSize) + p1OffsetYPx + globalOffsetYPx}px`,
                    width: `${Math.round(p1WPx > 0 ? p1WPx : (s1W / sectorBaseW) * buttonW)}px`,
                    height: `${Math.round(p1HPx > 0 ? p1HPx : (s1H / sectorBaseH) * megaTileSize)}px`,
                    transformOrigin: '0% 0%',
                    transform: `rotate(${p1RotDeg}deg)`,
                    backgroundColor: debugStripeHit ? 'rgba(255,0,0,0.18)' : 'transparent',
                    pointerEvents: 'auto',
                  }}
                />

                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => onSelect?.(slug)}
                  className="absolute bg-transparent"
                  style={{
                    outline: debugStripeHit
                      ? debugSelectedPanel === '1p2'
                        ? '1px solid rgba(0,120,255,0.95)'
                        : '1px solid rgba(0,128,255,0.55)'
                      : undefined,
                    left: `${Math.round((s2X / sectorBaseW) * buttonW) + s1OffsetXPx + s234OffsetXPx + p2OffsetXPx + globalOffsetXPx}px`,
                    top: `${Math.round((s2Y / sectorBaseH) * megaTileSize) + s234OffsetYPx + p2OffsetYPx + globalOffsetYPx}px`,
                    width: `${Math.round(p2WPx > 0 ? p2WPx : (s2W / sectorBaseW) * buttonW)}px`,
                    height: `${Math.round(p2HPx > 0 ? p2HPx : (s2H / sectorBaseH) * megaTileSize)}px`,
                    transformOrigin: '0% 0%',
                    transform: `rotate(${p2RotDeg}deg)`,
                    backgroundColor: debugStripeHit ? 'rgba(0,128,255,0.18)' : 'transparent',
                    pointerEvents: 'auto',
                  }}
                />

                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => onSelect?.(slug)}
                  className="absolute bg-transparent"
                  style={{
                    outline: debugStripeHit
                      ? debugSelectedPanel === '1p3'
                        ? '1px solid rgba(0,120,255,0.95)'
                        : '1px solid rgba(0,200,80,0.55)'
                      : undefined,
                    left: `${Math.round(p2TLx - s34Wp + p3OffsetXPx) + globalOffsetXPx}px`,
                    top: `${Math.round(p2TLy + p3OffsetYPx) + globalOffsetYPx}px`,
                    width: `${Math.round(p3WPx > 0 ? p3WPx : s34Wp)}px`,
                    height: `${Math.round(p3HPx > 0 ? p3HPx : s34Hp)}px`,
                    transformOrigin: '100% 0%',
                    transform: `rotate(${-(s34RotDeg) + p3RotDeg}deg)`,
                    backgroundColor: debugStripeHit ? 'rgba(0,200,80,0.18)' : 'transparent',
                    pointerEvents: 'auto',
                  }}
                />

                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => onSelect?.(slug)}
                  className="absolute bg-transparent"
                  style={{
                    outline: debugStripeHit
                      ? debugSelectedPanel === '1p4'
                        ? '1px solid rgba(0,120,255,0.95)'
                        : '1px solid rgba(255,200,0,0.55)'
                      : undefined,
                    left: `${Math.round(p2TRx + p4OffsetXPx) + globalOffsetXPx}px`,
                    top: `${Math.round(p2TRy + p4OffsetYPx) + globalOffsetYPx}px`,
                    width: `${Math.round(p4WPx > 0 ? p4WPx : s34Wp)}px`,
                    height: `${Math.round(p4HPx > 0 ? p4HPx : s34Hp)}px`,
                    transformOrigin: '0% 0%',
                    transform: `rotate(${s34RotDeg + p4RotDeg}deg)`,
                    backgroundColor: debugStripeHit ? 'rgba(255,200,0,0.18)' : 'transparent',
                    pointerEvents: 'auto',
                  }}
                />

                {p5Enabled ? (
                  (() => {
                    const s4Rad = (s34RotDeg * Math.PI) / 180;
                    const p5Rad = (p5RotDeg * Math.PI) / 180;

                    const p4OriginX = p2TRx + globalOffsetXPx;
                    const p4OriginY = p2TRy + globalOffsetYPx;

                    const p4V = rectVertex(p5FromVertex, s34Wp, s34Hp);
                    const p4VRot = rotatePoint(p4V.x, p4V.y, s4Rad);
                    const anchorX = p4OriginX + p4VRot.x;
                    const anchorY = p4OriginY + p4VRot.y;

                    const p5V = rectVertex(p5ToVertex, p5Wp, p5Hp);
                    const p5VRot = rotatePoint(p5V.x, p5V.y, p5Rad);

                    const p5Left = anchorX - p5VRot.x + p5OffsetXPx;
                    const p5Top = anchorY - p5VRot.y + p5OffsetYPx;

                    return (
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-hidden="true"
                        onClick={() => onSelect?.(slug)}
                        className="absolute bg-transparent"
                        style={{
                          left: `${p5Left}px`,
                          top: `${p5Top}px`,
                          width: `${p5WPxOverride > 0 ? p5WPxOverride : p5Wp}px`,
                          height: `${p5HPxOverride > 0 ? p5HPxOverride : p5Hp}px`,
                          transformOrigin: '0% 0%',
                          transform: `rotate(${p5RotDeg}deg)`,
                          backgroundColor: debugStripeHit ? 'rgba(180,0,255,0.18)' : 'transparent',
                          outline: debugStripeHit
                            ? debugSelectedPanel === '1p5'
                              ? '1px solid rgba(0,120,255,0.95)'
                              : '1px solid rgba(180,0,255,0.55)'
                            : undefined,
                          pointerEvents: 'auto',
                        }}
                      />
                    );
                  })()
                ) : null}
              </>
            ) : idx >= 1 ? (
              (() => {
                const t2BaseW = 323;
                const t2BaseH = 290;
                const overlapPx = Math.max(0, Math.round(buttonW - stepEq));
                const t2OriginX = overlapPx;
                const t2OriginY = 0;

                const stdW = 44;
                const stdH = 44;
                const stdWp = (stdW / t2BaseW) * buttonW;
                const stdHp = (stdH / t2BaseH) * megaTileSize;

                const pieces = Array.from({ length: 7 }).map((_, pIdx) => {
                  const n = pIdx + 1;
                  const d = defaultT2Pieces[pIdx];
                  return {
                    n,
                    x: parseIntParam(`2p${n}x`, d?.x ?? 0),
                    y: parseIntParam(`2p${n}y`, d?.y ?? 0),
                    deg: parseFloatParam(`2p${n}deg`, d?.deg ?? 0),
                    w: parseIntParam(`2p${n}w`, d?.w ?? 0),
                    h: parseIntParam(`2p${n}h`, d?.h ?? 0),
                  };
                });

                const debugColors = [
                  'rgba(255,0,255,0.18)',
                  'rgba(0,128,255,0.18)',
                  'rgba(0,200,80,0.18)',
                  'rgba(255,200,0,0.18)',
                  'rgba(180,0,255,0.18)',
                  'rgba(255,80,0,0.18)',
                  'rgba(0,0,0,0.14)',
                ];

                return (
                  <>
                    {pieces.map((p) => (
                      <button
                        key={`t2p-${idx}-${p.n}`}
                        type="button"
                        onClick={() => onSelect?.(slug)}
                        aria-label={colorLabelBySlug?.[slug] || slug}
                        aria-pressed={isSelected}
                        className="absolute bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                        style={{
                          left: `${Math.round(t2OriginX + t2OriginY * 0 + p.x) + globalOffsetXPx}px`,
                          top: `${Math.round(t2OriginY + p.y) + globalOffsetYPx}px`,
                          width: `${Math.round(p.w > 0 ? p.w : stdWp)}px`,
                          height: `${Math.round(p.h > 0 ? p.h : stdHp)}px`,
                          transformOrigin: '0% 0%',
                          transform: `rotate(${p.deg}deg)`,
                          backgroundColor: debugStripeHit ? debugColors[(p.n - 1) % debugColors.length] : 'transparent',
                          outline: debugStripeHit
                            ? debugSelectedPanel === `2p${p.n}`
                              ? '1px solid rgba(0,120,255,0.95)'
                              : '1px solid rgba(0,0,0,0.35)'
                            : undefined,
                          pointerEvents: 'auto',
                        }}
                      />
                    ))}
                  </>
                );
              })()
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onSelect?.(slug)}
                  aria-label={colorLabelBySlug?.[slug] || slug}
                  aria-pressed={isSelected}
                  className="absolute top-0 h-full bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                  style={{ left: `${globalOffsetXPx}px`, top: `${globalOffsetYPx}px`, width: `${bodyW}px`, height: '100%', pointerEvents: 'auto' }}
                />

                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => onSelect?.(slug)}
                  className="absolute bg-transparent"
                  style={{ left: `${bodyW + globalOffsetXPx}px`, top: `${globalOffsetYPx}px`, width: `${notchW}px`, height: `${sleeveH}px`, pointerEvents: 'auto' }}
                />

                {Array.from({ length: steps }).map((_, sIdx) => {
                  const x = bodyW + sIdx * stepW;
                  const inset = Math.round(((steps - 1 - sIdx) / steps) * (bandBottom - bandTop) * 0.42);
                  const top = bandTop + inset;
                  const bottom = bandBottom - inset;
                  const h = Math.max(1, bottom - top);
                  const w = sIdx === steps - 1 ? Math.max(1, thisHitW - x) : stepW;
                  if (w <= 0) return null;

                  return (
                    <button
                      key={`${slug}-${idx}-hit-${sIdx}`}
                      type="button"
                      tabIndex={-1}
                      aria-hidden="true"
                      onClick={() => onSelect?.(slug)}
                      className="absolute bg-transparent"
                      style={{ left: `${x + globalOffsetXPx}px`, top: `${top + globalOffsetYPx}px`, width: `${w}px`, height: `${h}px`, pointerEvents: 'auto' }}
                    />
                  );
                })}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
