import RulersGuidesOverlay from '@/components/RulersGuidesOverlay.jsx';
import { DEV_LAYER_Z } from '@/components/dev/DevPortal';

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
      zIndex={Number.isFinite(zIndex) ? zIndex : DEV_LAYER_Z.rulers}
    />
  );
}
