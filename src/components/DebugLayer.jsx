import { useEffect, useCallback, Suspense } from 'react';
import { installLayoutMetricsProbe } from '@/utils/layoutMetrics';
import { useDebugOverlays } from '@/hooks/useDebugOverlays';
import useMegaStripeDebugState from '@/hooks/useMegaStripeDebugState';
import useDebugToggles from '@/hooks/useDebugToggles';
import useExportModal from '@/hooks/useExportModal';
import useStripeOverlayDebug from '@/hooks/useStripeOverlayDebug';
import useLayoutInspector from '@/hooks/useLayoutInspector';
import { megaStripeRefPresets } from '@/data/megaStripeRefPresets';
import DevHeader from '@/components/DevHeader';
import DebugButtonsBar from '@/components/dev/DebugButtonsBar';
import PdpControlsPanel from '@/components/dev/PdpControlsPanel';
import * as P from '@/routes/lazyPages';

export default function DebugLayer({
  location,
  navigate,
  isAdmin,
  isPreview,
  isDevDemoRoute,
  isFullWideSlideRoute,
  isFullWideSlideDemoRoute,
  isFullScreenRoute,
  isEmbeddedPreview,
  isHomeRoute,
  isDevHeaderRoute,
  isDevLayoutRoute,
  isAdminRoute,
  isPrivacyRoute,
  isComponentsCatalogTemplateRoute,
  isContactSheetRoute,
  cartItemCount,
  onCartClick,
  onUserClick,
  onDebugStateChange,
  appHeaderOffset,
  demoHeaderOffset,
  baseHeaderHeight,
  adminBannerHeight,
  offersHeaderHeight,
  isLargeScreen,
}) {
  const beltEnabledFromUrl = (() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.has('belt') && sp.get('belt') !== '0';
    } catch {
      return false;
    }
  })();

  const megaStripeState = useMegaStripeDebugState({ beltEnabledFromUrl, locationPathname: location.pathname });
  const { layoutInspectorEnabled, setLayoutInspectorEnabled, guidesEnabled, setGuidesEnabled, copiedDesign, setCopiedDesign, belt2GuidesEnabled, setBelt2GuidesEnabled, megaAccordionLocked, setMegaAccordionLocked } = useDebugToggles({ locationSearch: location.search });
  const { debugsEnabled: debugOverlaysEnabled, rulersEnabled: rulersOverlayEnabled, pdpControlsEnabled, pautaEnabled, setPautaEnabled, tableEnabled, setTableEnabled, pautaOpacity, setPautaOpacity, tableOpacity, setTableOpacity } = useDebugOverlays();
  const { snapshot: stripeOverlayDebugSnapshot, debugOn: stripeOverlayDebugOn } = useStripeOverlayDebug(location.search);
  const { exportCopyStatus, setExportCopyStatus, exportTab, setExportTab, exportModalOpen, setExportModalOpen, exportModalTitle, setExportModalTitle, exportModalText, setExportModalText } = useExportModal();

  const debugOverlaysRoute = isAdmin || isDevDemoRoute || isFullWideSlideRoute || isPrivacyRoute;
  const rulersOverlayActive = rulersOverlayEnabled && debugOverlaysRoute && location.pathname !== '/ec-preview' && location.pathname !== '/ec-preview-lite' && !isEmbeddedPreview;
  const rulerInset = rulersOverlayActive ? 18 : 0;

  const layoutInspectorActive = debugOverlaysEnabled && !isEmbeddedPreview && (isAdmin || isDevDemoRoute) ? layoutInspectorEnabled : false;
  const layoutInspectorWrap = Boolean(layoutInspectorActive);

  const {
    selectedElement,
    selectedContainerToken,
    copyContainerStatus,
    selectionStatus,
    layoutInspectorPickEnabled,
    setLayoutInspectorPickEnabled,
    clicksEnabled,
    setClicksEnabled,
    clickMarks,
    setClickMarks,
    debugButtonsWrapRef,
    copySelectedContainer,
  } = useLayoutInspector({ layoutInspectorActive });

  useEffect(() => {
    const next = String(megaStripeState.megaStripeRefSrc || '');
    megaStripeState.setMegaStripeRef2Src((prev) => {
      const cur = String(prev || '');
      if (cur === next) return prev;
      return next;
    });
  }, [megaStripeState.megaStripeRefSrc]);

  useEffect(() => {
    try {
      if (isFullScreenRoute) return;
      installLayoutMetricsProbe();
    } catch { /* ignore */ }
  }, [isFullScreenRoute]);

  useEffect(() => {
    onDebugStateChange({
      rulerInset,
      pautaEnabled,
      tableEnabled,
      layoutInspectorActive,
    });
  }, [rulerInset, pautaEnabled, tableEnabled, layoutInspectorActive, onDebugStateChange]);

  const devHeaderVisible = !isFullScreenRoute && (location.pathname.startsWith('/proves') || isDevHeaderRoute || isAdminRoute || location.pathname.startsWith('/admin'));

  return (
    <>
      {import.meta.env.DEV && devHeaderVisible && (
        <DevHeader
          isPreview={isPreview}
          isAdmin={isAdmin}
          isDevDemoRoute={isDevDemoRoute}
          isFullWideSlideRoute={isFullWideSlideRoute}
          adminBannerHeight={adminBannerHeight}
          rulerInset={rulerInset}
          cartItemCount={cartItemCount}
          onCartClick={onCartClick}
          onUserClick={onUserClick}
        />
      )}

      <P.MegaStripeHud
        megaStripeState={megaStripeState}
        isFullWideSlideDemoRoute={isFullWideSlideDemoRoute}
        isFullWideSlideRoute={isFullWideSlideRoute}
        cistellExpanded={null}
        setCistellExpanded={() => {}}
        cistellLayout={1}
        setCistellLayout={() => {}}
        navigate={navigate}
        location={location}
        stripeOverlayDebugSnapshot={stripeOverlayDebugSnapshot}
        stripeOverlayDebugOn={stripeOverlayDebugOn}
        megaStripeRefPresets={megaStripeRefPresets}
        HUD_DEBUG_BOTTOM_RESERVE_PX={104}
        exportCopyStatus={exportCopyStatus}
        setExportCopyStatus={setExportCopyStatus}
        exportTab={exportTab}
        setExportTab={setExportTab}
        exportModalOpen={exportModalOpen}
        setExportModalOpen={setExportModalOpen}
        exportModalTitle={exportModalTitle}
        setExportModalTitle={setExportModalTitle}
        exportModalText={exportModalText}
        setExportModalText={setExportModalText}
        belt2GuidesEnabled={belt2GuidesEnabled}
        setBelt2GuidesEnabled={setBelt2GuidesEnabled}
        megaAccordionLocked={megaAccordionLocked}
        setMegaAccordionLocked={setMegaAccordionLocked}
        debugOverlaysEnabled={debugOverlaysEnabled}
        guidesEnabled={guidesEnabled}
        setGuidesEnabled={setGuidesEnabled}
        isAdmin={isAdmin}
        isDevDemoRoute={isDevDemoRoute}
        isEmbeddedPreview={isEmbeddedPreview}
        layoutInspectorActive={layoutInspectorActive}
        setLayoutInspectorEnabled={setLayoutInspectorEnabled}
      />

      {debugOverlaysEnabled && debugOverlaysRoute && location.pathname !== '/ec-preview' && location.pathname !== '/ec-preview-lite' && !isEmbeddedPreview ? (
        <DebugButtonsBar
          debugButtonsWrapRef={debugButtonsWrapRef}
          clicksEnabled={clicksEnabled}
          setClicksEnabled={setClicksEnabled}
          layoutInspectorActive={layoutInspectorActive}
          setLayoutInspectorEnabled={setLayoutInspectorEnabled}
          selectedContainerToken={selectedContainerToken}
          copyContainerStatus={copyContainerStatus}
          selectionStatus={selectionStatus}
          copySelectedContainer={copySelectedContainer}
          guidesEnabled={guidesEnabled}
          setGuidesEnabled={setGuidesEnabled}
          belt2GuidesEnabled={belt2GuidesEnabled}
          setBelt2GuidesEnabled={setBelt2GuidesEnabled}
          megaAccordionLocked={megaAccordionLocked}
          setMegaAccordionLocked={setMegaAccordionLocked}
        />
      ) : null}

      {import.meta.env.DEV && rulersOverlayActive && (
        <P.DevGuidesOverlay
          guidesEnabled={guidesEnabled}
          zIndex={1300000}
        />
      )}

      {import.meta.env.DEV && <P.BeltReferenceOverlay enabled={belt2GuidesEnabled} />}

      {import.meta.env.DEV && (pautaEnabled || tableEnabled) && (location.pathname !== '/checkout' || tableEnabled) && (
        <P.Pauta4ColsOverlay
          overlay
          pautaEnabled={pautaEnabled}
          tableEnabled={tableEnabled}
          pautaOpacity={pautaOpacity}
          tableOpacity={tableOpacity}
          gutterX="7.5px"
          topOffset={isFullScreenRoute ? '0px' : appHeaderOffset}
          numCols={(isHomeRoute || location.pathname === '/constructor/tdp' || location.pathname === '/tdp') ? 3 : 4}
          numRows={isHomeRoute ? 280 : (location.pathname.startsWith('/constructor/colleccio') ? 160 : (location.pathname.includes('pdp') ? 70 : 90))}
          canvasAspect={isHomeRoute ? [2642, 20869] : (location.pathname.startsWith('/constructor/colleccio') ? [2642, 11928] : (location.pathname.includes('pdp') ? [2642, 5217] : [2642, 6708]))}
        />
      )}

      {clicksEnabled && clickMarks.length > 0 && (
        <div
          className="fixed inset-0 z-[99998] pointer-events-none debug-exempt"
          data-dev-overlay="true"
        >
          {clickMarks.map((m) => (
            <div
              key={m.t}
              style={{
                position: 'absolute',
                left: m.x,
                top: m.y,
                width: 10,
                height: 10,
                borderRadius: 9999,
                background: 'rgba(0,0,0,0.65)',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      )}

      {pdpControlsEnabled && (
        <PdpControlsPanel
          pautaEnabled={pautaEnabled}
          setPautaEnabled={setPautaEnabled}
          pautaOpacity={pautaOpacity}
          setPautaOpacity={setPautaOpacity}
          tableEnabled={tableEnabled}
          setTableEnabled={setTableEnabled}
          tableOpacity={tableOpacity}
          setTableOpacity={setTableOpacity}
          isPdpConstructorRoute={location.pathname === '/constructor/pdp'}
          copiedDesign={copiedDesign}
          setCopiedDesign={setCopiedDesign}
        />
      )}
    </>
  );
}
