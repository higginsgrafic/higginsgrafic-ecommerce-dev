import React from 'react';

export function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="mb-2 flex items-center justify-between gap-3 text-[12px] text-neutral-800">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-orange-600"
      />
    </label>
  );
}

export function OpacitySlider({ label, value, onChange, disabled = false }) {
  return (
    <label className={`mb-2 block ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between text-[11px] text-neutral-700">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-900">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        className="w-full accent-orange-600"
      />
    </label>
  );
}

export function getPdpDesignPackage() {
  const data = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.startsWith('HG_EDITABLE_TEXT_BOX_V1:pdp-') || key.startsWith('hg.globalOverlays.'))) {
        data[key] = window.localStorage.getItem(key);
      }
    }
    const json = JSON.stringify(data);
    const base64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    return base64;
  } catch (e) {
    console.error('Error empaquetant disseny:', e);
    return null;
  }
}

export function applyPdpDesignPackage(base64) {
  if (!base64) return false;
  try {
    const json = decodeURIComponent(Array.prototype.map.call(atob(base64), (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const data = JSON.parse(json);
    let changed = false;
    for (const key in data) {
      if (key.startsWith('HG_EDITABLE_TEXT_BOX_V1:pdp-') || key.startsWith('hg.globalOverlays.')) {
        const current = window.localStorage.getItem(key);
        if (current !== data[key]) {
          window.localStorage.setItem(key, data[key]);
          changed = true;
        }
      }
    }
    return changed;
  } catch (e) {
    console.error('Error desempaquetant disseny:', e);
    return false;
  }
}
