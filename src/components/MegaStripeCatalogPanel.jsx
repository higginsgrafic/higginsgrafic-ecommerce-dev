import React from 'react';

export default function MegaStripeCatalogPanel({
  megaTileSize,
  StripeButtonsComponent,
  stripeProps,
  CatalogPanelComponent,
  catalogPanelProps,
  marginTopPx = 13,
}) {
  if (!megaTileSize) return null;
  if (!StripeButtonsComponent && !CatalogPanelComponent) return null;

  return (
    <div
      className="relative"
      style={{
        marginTop: `${marginTopPx}px`,
        width: '100%',
        height: `${megaTileSize}px`,
      }}
    >
      {StripeButtonsComponent ? <StripeButtonsComponent megaTileSize={megaTileSize} {...(stripeProps || {})} /> : null}
      {CatalogPanelComponent ? <CatalogPanelComponent megaTileSize={megaTileSize} {...(catalogPanelProps || {})} /> : null}
    </div>
  );
}
