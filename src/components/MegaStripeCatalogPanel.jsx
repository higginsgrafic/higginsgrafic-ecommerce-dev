import React from 'react';

export default function MegaStripeCatalogPanel({
  megaTileSize,
  StripeButtonsComponent,
  stripeProps,
  CatalogPanelComponent,
  catalogPanelProps,
  marginTopPx = 13,
  extraHeightPx = 0,
  translateYPx = 0,
}) {
  if (!megaTileSize) return null;
  if (!StripeButtonsComponent && !CatalogPanelComponent) return null;

  return (
    <div
      className="relative overflow-visible"
      style={{
        marginTop: `${marginTopPx}px`,
        width: '100%',
        height: `${megaTileSize + (Number.isFinite(extraHeightPx) ? extraHeightPx : 0)}px`,
        transform: translateYPx ? `translateY(${translateYPx}px)` : undefined,
      }}
    >
      {StripeButtonsComponent ? <StripeButtonsComponent megaTileSize={megaTileSize} {...(stripeProps || {})} /> : null}
      {CatalogPanelComponent ? <CatalogPanelComponent megaTileSize={megaTileSize} {...(catalogPanelProps || {})} /> : null}
    </div>
  );
}
