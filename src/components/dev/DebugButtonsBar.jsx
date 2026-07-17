import React from 'react';

export default function DebugButtonsBar({
  debugButtonsWrapRef,
  clicksEnabled,
  setClicksEnabled,
  layoutInspectorActive,
  setLayoutInspectorEnabled,
  selectedContainerToken,
  copyContainerStatus,
  selectionStatus,
  copySelectedContainer,
  guidesEnabled,
  setGuidesEnabled,
  belt2GuidesEnabled,
  setBelt2GuidesEnabled,
  megaAccordionLocked,
  setMegaAccordionLocked,
}) {
  return (
    <div
      ref={debugButtonsWrapRef}
      className="flex items-end gap-2 relative debug-exempt"
      style={{ position: 'fixed', left: 31, bottom: 16, zIndex: 1100000 }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-pressed={clicksEnabled ? 'true' : 'false'}
        aria-label="Clics"
        className={`absolute left-0 bottom-0 z-0 inline-flex h-12 items-center justify-end rounded-full pl-[60px] pr-4 text-[12px] font-semibold shadow-lg ${
          !layoutInspectorActive
            ? 'bg-[#EDEDED] text-black/70'
            : clicksEnabled
              ? 'bg-[#1E62B8] text-white'
              : 'bg-[#BFD9F4] text-[#0f172a]'
        }`}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '24px 50%' }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!layoutInspectorActive) return;
          setClicksEnabled((v) => !v);
        }}
      >
        <span style={{ display: 'inline-block', transform: 'rotate(90deg)' }}>
          {'Clics'}
        </span>
      </button>

      <button
        type="button"
        onClick={() =>
          setLayoutInspectorEnabled((v) => {
            const next = !v;
            if (!next) {
              setClicksEnabled(false);
            }
            return next;
          })
        }
        className="relative z-20 h-12 w-12 bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center debug-exempt"
        aria-label="Mostrar/Ocultar debug"
        style={{ boxShadow: '10px 2px 14px rgba(0,0,0,0.34)' }}
      >
        <svg className="block w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      <div className="relative -ml-[56px]">
        <button
          type="button"
          className={`relative z-10 inline-flex h-12 items-center justify-end rounded-full pl-[60px] pr-4 text-[12px] font-semibold shadow-lg disabled:cursor-not-allowed debug-exempt ${
            !layoutInspectorActive
              ? 'bg-[#EDEDED] text-black/70'
              : !selectedContainerToken
                ? 'bg-[#CFE0D2] text-black/70'
                : selectionStatus === 'selected_same'
                  ? 'bg-[#F97316] text-white hover:bg-[#EA580C] active:bg-[#C2410C]'
                  : 'bg-[#387D22] text-white hover:bg-[#2F6B1D] active:bg-[#275A18]'
          }`}
          disabled={!layoutInspectorActive || !selectedContainerToken}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            copySelectedContainer();
          }}
          aria-label="Copiar selecció"
          style={{ boxShadow: '-10px 8px 16px rgba(0,0,0,0.32)' }}
        >
          {!layoutInspectorActive
            ? 'Copy'
            : !selectedContainerToken
              ? 'Copy'
              : copyContainerStatus === 'copied'
                ? 'Copied'
                : copyContainerStatus === 'copied_again'
                  ? 'Copied again'
                  : selectionStatus === 'selected_new'
                    ? 'Selected'
                    : selectionStatus === 'selected_same'
                      ? 'Same'
                      : 'Copy'}
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-stretch gap-2 debug-exempt">
        <button
          type="button"
          className="h-12 rounded-full border border-black/15 bg-white px-4 text-[12px] font-semibold text-black/80 shadow-lg hover:bg-black/5 active:bg-black/10 debug-exempt"
          title="Esborra totes les guies"
          aria-label="Esborra totes les guies"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              window.__DEV_GUIDES_CLEAR__?.();
            } catch {}
            try { localStorage.removeItem('devGuidesV2'); } catch {}
          }}
        >
          Clear
        </button>
        <button
          type="button"
          className={`h-12 rounded-full border px-4 text-[12px] font-semibold shadow-lg active:bg-black/10 debug-exempt ${
            guidesEnabled
              ? 'border-[#337AC6]/40 bg-[#337AC6]/10 text-[#0f172a] hover:bg-[#337AC6]/15'
              : 'border-black/15 bg-white text-black/80 hover:bg-black/5'
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setGuidesEnabled((v) => !v);
          }}
        >
          Guides
        </button>
      </div>

      <button
        type="button"
        title="Activa/desactiva les guïes Belt 2"
        aria-label="Belt 2"
        aria-pressed={belt2GuidesEnabled ? 'true' : 'false'}
        className={`relative z-10 h-12 rounded-full border px-4 text-[12px] font-semibold shadow-lg active:bg-black/10 debug-exempt ${
          belt2GuidesEnabled
            ? 'border-[#10B981]/40 bg-[#10B981]/15 text-[#064E3B] hover:bg-[#10B981]/20'
            : 'border-black/15 bg-white text-black/80 hover:bg-black/5'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setBelt2GuidesEnabled((v) => !v);
        }}
      >
        Belt 2
      </button>

      <button
        type="button"
        title="Bloca/desbloca l'acordió del mega-slide"
        aria-label="Acordió"
        aria-pressed={megaAccordionLocked ? 'true' : 'false'}
        className={`relative z-10 h-12 rounded-full border px-4 text-[12px] font-semibold shadow-lg active:bg-black/10 debug-exempt ${
          megaAccordionLocked
            ? 'border-[#6366F1]/40 bg-[#6366F1]/15 text-[#312E81] hover:bg-[#6366F1]/20'
            : 'border-black/15 bg-white text-black/80 hover:bg-black/5'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMegaAccordionLocked((v) => !v);
        }}
      >
        Acordió
      </button>
    </div>
  );
}
