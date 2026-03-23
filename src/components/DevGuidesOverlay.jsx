import React from 'react';
import RulersGuidesOverlay from '@/components/RulersGuidesOverlay.jsx';

export default function DevGuidesOverlay({ guidesEnabled = true, onAutoEnable, guideColor }) {
  return (
    <RulersGuidesOverlay
      guidesEnabled={guidesEnabled}
      onAutoEnable={onAutoEnable}
      guideColor={guideColor}
      storageKey="devGuidesV2"
      anchorElementId="main-content"
      headerOffsetCssVar="--appHeaderOffset"
      rulerSize={18}
      zIndex={35000}
    />
  );
}
