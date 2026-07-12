import React, { useRef } from 'react';
import FullWideSlideHeader from '@/components/FullWideSlideHeader';

export default function FullWideSlideHeaderMegaMenuContained({
  portalContainer,
  initialActiveId = 'first_contact',
  manualEnabledOverride = true,
  ignoreStripeDebugFromUrl = true,
  navItems,
  megaConfig,
  showStripe = true,
  showCatalogPanel = true,
}) {
  const localContainerRef = useRef(null);
  const effectivePortalContainer = portalContainer || localContainerRef.current;

  return (
    <div ref={portalContainer ? undefined : localContainerRef} className="relative h-full w-full overflow-hidden">
      <div
        className="h-full w-full overflow-hidden"
        style={{
          '--appHeaderOffset': '0px',
          '--copyrightFooterHeight': '0px',
        }}
      >
        <div className="h-full w-full overflow-y-auto">
          <FullWideSlideHeader
            contained
            portalContainer={effectivePortalContainer}
            manualEnabledOverride={manualEnabledOverride}
            initialActiveId={initialActiveId}
            ignoreStripeDebugFromUrl={ignoreStripeDebugFromUrl}
            navItems={navItems}
            megaConfig={megaConfig}
            showStripe={showStripe}
            showCatalogPanel={showCatalogPanel}
          />
        </div>
      </div>
    </div>
  );
}
