import React, { useMemo } from 'react';

export default function StripeV4OverlayTileDebug({
  debugV4OverlayDebug,
  stripeV4HitTilePathDs,
  idx,
  xImg,
  wImg,
  stripeV4SvgH,
  debugOrangeRectDy,
  debugBluePathDy,
  debugV4OverlayOutlineDy,
  debugV4OverlayOutlineSy,
  debugV4OverlayOutlineDx,
  applyTransforms,
  transforms,
  applyAlign,
  stripeV4HitAlignTopDy,
  unionAdjustTf,
  debugSpriteDx,
  debugSpriteDy,
  debugV4OverlayDebugDx,
}) {
  const debugOverlay = useMemo(() => {
    try {
      if (!debugV4OverlayDebug) return null;
      const tileD = Array.isArray(stripeV4HitTilePathDs) ? stripeV4HitTilePathDs[idx] : null;
      if (!tileD) return null;

      const orangeDy = (Number.isFinite(debugOrangeRectDy) && debugOrangeRectDy !== 0)
        ? debugOrangeRectDy
        : 0;

      const blueDy = (Number.isFinite(debugBluePathDy) && debugBluePathDy !== 0)
        ? debugBluePathDy
        : 0;

      const imgRect = (
        <rect
          x={xImg}
          y={orangeDy}
          width={wImg}
          height={stripeV4SvgH}
          fill="none"
          stroke="rgba(245, 158, 11, 0.95)"
          strokeWidth={0.1875}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
      );

      const tilePathBase = (
        <path
          d={tileD}
          fill="none"
          stroke="rgba(34, 211, 238, 0.95)"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
      );

      const tilePath = blueDy
        ? <g transform={`translate(0 ${blueDy})`}>{tilePathBase}</g>
        : tilePathBase;

      const tilePathDebug = (() => {
        const dy = (Number.isFinite(debugV4OverlayOutlineDy) && debugV4OverlayOutlineDy !== 0)
          ? debugV4OverlayOutlineDy
          : 0;
        const sy = (Number.isFinite(debugV4OverlayOutlineSy) && debugV4OverlayOutlineSy > 0 && debugV4OverlayOutlineSy !== 1)
          ? debugV4OverlayOutlineSy
          : 1;
        const dx = (Number.isFinite(debugV4OverlayOutlineDx) && debugV4OverlayOutlineDx !== 0)
          ? debugV4OverlayOutlineDx
          : 0;

        if (!dx && !dy && sy === 1) return tilePath;

        const scaled = (sy !== 1)
          ? <g transform={`scale(1 ${sy})`}>{tilePath}</g>
          : tilePath;

        const movedY = dy
          ? <g transform={`translate(0 ${dy})`}>{scaled}</g>
          : scaled;

        const movedXY = dx
          ? <g transform={`translate(${dx} 0)`}>{movedY}</g>
          : movedY;

        return movedXY;
      })();

      const wrappedDebug = applyTransforms
        ? transforms.reduce(
          (child, t, i) => <g key={`v4-overlay-debug-${idx}-t-${i}`} transform={t}>{child}</g>,
          <g>{imgRect}{tilePathDebug}</g>,
        )
        : <g>{imgRect}{tilePathDebug}</g>;

      const alignedDebug = (applyAlign && stripeV4HitAlignTopDy)
        ? <g transform={`translate(0 ${stripeV4HitAlignTopDy})`}>{wrappedDebug}</g>
        : wrappedDebug;

      const adjustedDebug = unionAdjustTf
        ? <g transform={unionAdjustTf}>{alignedDebug}</g>
        : alignedDebug;

      const spriteAlignedDebug = (debugSpriteDx || debugSpriteDy)
        ? <g transform={`translate(${debugSpriteDx || 0} ${debugSpriteDy || 0})`}>{adjustedDebug}</g>
        : adjustedDebug;

      const shiftedDebug = (Number.isFinite(debugV4OverlayDebugDx) && debugV4OverlayDebugDx !== 0)
        ? <g transform={`translate(${debugV4OverlayDebugDx} 0)`}>{spriteAlignedDebug}</g>
        : spriteAlignedDebug;

      return shiftedDebug;
    } catch {
      return null;
    }
  }, [
    applyAlign,
    applyTransforms,
    debugBluePathDy,
    debugOrangeRectDy,
    debugV4OverlayDebug,
    debugV4OverlayDebugDx,
    debugV4OverlayOutlineDx,
    debugV4OverlayOutlineDy,
    debugV4OverlayOutlineSy,
    debugSpriteDx,
    debugSpriteDy,
    idx,
    stripeV4HitAlignTopDy,
    stripeV4HitTilePathDs,
    stripeV4SvgH,
    transforms,
    unionAdjustTf,
    wImg,
    xImg,
  ]);

  return debugOverlay;
}
