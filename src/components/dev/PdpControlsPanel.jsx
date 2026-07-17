import React, { startTransition } from 'react';
import { ToggleRow, OpacitySlider, getPdpDesignPackage, applyPdpDesignPackage } from './DevControls';

export default function PdpControlsPanel({
  pautaEnabled,
  setPautaEnabled,
  pautaOpacity,
  setPautaOpacity,
  tableEnabled,
  setTableEnabled,
  tableOpacity,
  setTableOpacity,
  isPdpConstructorRoute,
  copiedDesign,
  setCopiedDesign,
}) {
  return (
    <div
      className="font-mono text-neutral-800 debug-exempt"
      style={{
        position: 'fixed',
        right: 16,
        top: 170,
        width: 260,
        zIndex: 100000,
        background: 'rgba(255,255,255,0.96)',
        border: '1px solid rgba(0,0,0,0.10)',
        borderRadius: 10,
        padding: 12,
        fontSize: 12,
        boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
      }}
    >
      <strong className="mb-2 block">Controls Guies</strong>
      <ToggleRow
        label="Pauta"
        checked={pautaEnabled}
        onChange={(v) => startTransition(() => setPautaEnabled(v))}
      />
      <OpacitySlider
        label="Opacitat pauta"
        value={pautaOpacity}
        onChange={(v) => setPautaOpacity(v)}
        disabled={!pautaEnabled}
      />
      <ToggleRow
        label="Taula + numeració"
        checked={tableEnabled}
        onChange={(v) => startTransition(() => setTableEnabled(v))}
      />
      <OpacitySlider
        label="Opacitat taula"
        value={tableOpacity}
        onChange={(v) => setTableOpacity(v)}
        disabled={!tableEnabled}
      />

      {isPdpConstructorRoute && (
        <div className="mt-4 border-t border-neutral-200 pt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              const pkg = getPdpDesignPackage();
              if (pkg) {
                navigator.clipboard.writeText(pkg)
                  .then(() => {
                    setCopiedDesign(true);
                    setTimeout(() => setCopiedDesign(false), 2000);
                  })
                  .catch((err) => console.error('Error copiant el disseny:', err));
              }
            }}
            className={`w-full py-2 px-3 rounded text-center text-[11px] font-semibold transition-all duration-200 ${
              copiedDesign
                ? 'bg-green-600 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm active:scale-[0.98]'
            }`}
          >
            {copiedDesign ? 'Codi copiat! 📋' : 'Copiar codi disseny'}
          </button>

          <button
            type="button"
            onClick={() => {
              const code = window.prompt("Enganxa el codi de disseny copiat d'un altre navegador:");
              if (code) {
                const applied = applyPdpDesignPackage(code.trim());
                if (applied) {
                  window.location.reload();
                } else {
                  window.alert("El codi és invàlid o no s'ha pogut importar.");
                }
              }
            }}
            className="w-full py-2 px-3 rounded text-center text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 shadow-sm active:scale-[0.98] transition-all duration-200"
          >
            Enganxar codi disseny
          </button>
        </div>
      )}
    </div>
  );
}
