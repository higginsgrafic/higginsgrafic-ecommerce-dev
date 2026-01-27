import React from 'react';
import RulersGuidesOverlay from '@/components/RulersGuidesOverlay.jsx';

export default function DevGuidesOverlay({ guidesEnabled = true, onAutoEnable }) {
  return (
    <RulersGuidesOverlay
      guidesEnabled={guidesEnabled}
      onAutoEnable={onAutoEnable}
      storageKey="devGuidesV2"
      anchorElementId="main-content"
      headerOffsetCssVar="--appHeaderOffset"
      rulerSize={18}
      zIndex={35000}
    />
  );
}
