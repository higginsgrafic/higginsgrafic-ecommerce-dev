import React from 'react';
import RulersGuidesOverlay from '@/components/RulersGuidesOverlay.jsx';

export default function DevGuidesOverlay({ guidesEnabled = true, onAutoEnable, guideColor, zIndex, rulerSize }) {
  return (
    <RulersGuidesOverlay
      guidesEnabled={guidesEnabled}
      onAutoEnable={onAutoEnable}
      guideColor={guideColor}
      storageKey="devGuidesV2"
      anchorElementId="main-content"
      headerOffsetCssVar="--appHeaderOffset"
      rulerSize={Number.isFinite(rulerSize) ? rulerSize : 18}
      zIndex={Number.isFinite(zIndex) ? zIndex : 35000}
    />
  );
}
