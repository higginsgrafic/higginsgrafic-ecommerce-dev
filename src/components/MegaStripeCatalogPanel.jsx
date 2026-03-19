import React from 'react';

export default function MegaStripeCatalogPanel({
  megaTileSize,
  StripeButtonsComponent,
  stripeProps,
  stripeKey,
  CatalogPanelComponent,
  catalogPanelProps,
  catalogKey,
  marginTopPx = 13,
  paddingBottomPx,
  bleedLeftPx = 0,
  bleedRightPx = 0,
  extraHeightPx = 0,
  translateYPx = 0,
}) {
  if (!megaTileSize) return null;
  if (!StripeButtonsComponent && !CatalogPanelComponent) return null;

  const effectivePaddingBottomPx = Number.isFinite(paddingBottomPx) ? paddingBottomPx : marginTopPx;
  const panelMinHeightPx = CatalogPanelComponent
    ? (megaTileSize + (Number.isFinite(extraHeightPx) ? extraHeightPx : 0))
    : null;
  const bleedL = Number.isFinite(bleedLeftPx) ? bleedLeftPx : 0;
  const bleedR = Number.isFinite(bleedRightPx) ? bleedRightPx : 0;
  const bleedW = bleedL || bleedR;

  return (
    <div
      data-mega-stripe-catalog-panel="true"
      className="relative overflow-visible"
      style={{
        marginTop: `${marginTopPx}px`,
        width: bleedW ? `calc(100% + ${bleedL + bleedR}px)` : '100%',
        marginLeft: bleedW ? `${-bleedL}px` : undefined,
        minHeight: panelMinHeightPx != null ? `${panelMinHeightPx}px` : undefined,
        transform: translateYPx ? `translateY(${translateYPx}px)` : undefined,
      }}
    >
      {StripeButtonsComponent ? (
        <div
          data-mega-stripe-padding-wrap="true"
          className="relative z-0"
          style={{ paddingBottom: `${effectivePaddingBottomPx}px` }}
        >
          <StripeButtonsComponent key={stripeKey || undefined} megaTileSize={megaTileSize} {...(stripeProps || {})} />
        </div>
      ) : null}
      {CatalogPanelComponent ? (
        <div className="relative z-10">
          <CatalogPanelComponent key={catalogKey || undefined} megaTileSize={megaTileSize} {...(catalogPanelProps || {})} />
        </div>
      ) : null}
    </div>
  );
}
