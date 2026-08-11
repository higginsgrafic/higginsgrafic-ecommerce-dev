import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Persistent UI flags that control developer debug overlays on the live site.
const KEY_DEBUGS = 'hg.debugOverlays.enabled';
const KEY_ACTIVE_WORK = 'hg.activeWorkOverlay.enabled';
const KEY_RULERS = 'hg.rulersOverlay.enabled';
const KEY_PDP_CONTROLS = 'hg.pdpControlsOverlay.enabled';

// Global guidelines keys (Pauta + Taula)
const KEY_PAUTA = 'hg.globalOverlays.pautaEnabled';
const KEY_TABLE = 'hg.globalOverlays.tableEnabled';
const KEY_PAUTA_OPACITY = 'hg.globalOverlays.pautaOpacity';
const KEY_TABLE_OPACITY = 'hg.globalOverlays.tableOpacity';

const EVT_PREFIX = 'hg:debug-overlays-changed';

function getQueryParam(key) {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    if (key === KEY_DEBUGS) {
      if (params.has('debugs')) return params.get('debugs');
      if (params.has('debug')) return params.get('debug');
    }
    if (key === KEY_ACTIVE_WORK) {
      if (params.has('activework')) return params.get('activework');
    }
    if (key === KEY_RULERS) {
      if (params.has('rulers')) return params.get('rulers');
      if (params.has('ruler')) return params.get('ruler');
    }
    if (key === KEY_PDP_CONTROLS) {
      if (params.has('controls')) return params.get('controls');
      if (params.has('pdpcontrols')) return params.get('pdpcontrols');
    }
    if (key === KEY_PAUTA) {
      if (params.has('pauta')) return params.get('pauta');
    }
    if (key === KEY_TABLE) {
      if (params.has('table')) return params.get('table');
    }
    if (key === KEY_PAUTA_OPACITY) {
      if (params.has('pautaOpacity')) return params.get('pautaOpacity');
    }
    if (key === KEY_TABLE_OPACITY) {
      if (params.has('tableOpacity')) return params.get('tableOpacity');
    }
  } catch {
    // ignore
  }
  return null;
}

function parseQueryVal(val) {
  if (val === null) return null;
  const s = String(val).trim().toLowerCase();
  if (s === '1' || s === 'true' || s === 'on' || s === 'yes') return true;
  if (s === '0' || s === 'false' || s === 'off' || s === 'no') return false;
  return null;
}

function readValue(key, defaultValue, type = 'bool') {
  try {
    const qVal = getQueryParam(key);
    if (qVal !== null) {
      const parsed = type === 'bool' ? parseQueryVal(qVal) : (type === 'number' ? parseFloat(qVal) : qVal);
      if (parsed !== null && !isNaN(parsed)) {
        try {
          localStorage.setItem(key, String(parsed));
        } catch {
          // ignore
        }
        return parsed;
      }
    }

    const v = localStorage.getItem(key);
    if (v === null) return defaultValue;
    if (type === 'bool') return v === '1' || v === 'true';
    if (type === 'number') {
      const parsed = parseFloat(v);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return v;
  } catch {
    return defaultValue;
  }
}

function writeValue(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new CustomEvent(`${EVT_PREFIX}:${key}`, { detail: value }));
  } catch {
    // ignore
  }
}

function usePersistentFlag(key, defaultValue, type = 'bool') {
  const location = useLocation();
  const [value, setValue] = useState(() => readValue(key, defaultValue, type));

  useEffect(() => {
    const nextVal = readValue(key, defaultValue, type);
    if (nextVal !== value) {
      setValue(nextVal);
    }
  }, [location.search, key, defaultValue, value, type]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key) setValue(readValue(key, defaultValue, type));
    };
    const onCustom = (e) => {
      setValue(e?.detail);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(`${EVT_PREFIX}:${key}`, onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(`${EVT_PREFIX}:${key}`, onCustom);
    };
  }, [key, defaultValue, type]);

  const update = useCallback(
    (next) => {
      const v = typeof next === 'function' ? next(value) : next;
      writeValue(key, v);
      setValue(v);
    },
    [key, value]
  );

  return [value, update];
}

export function useDebugOverlays() {
  const [debugsEnabled, setDebugsEnabled] = usePersistentFlag(KEY_DEBUGS, true, 'bool');
  const [activeWorkEnabled, setActiveWorkEnabled] = usePersistentFlag(KEY_ACTIVE_WORK, false, 'bool');
  const [rulersEnabled, setRulersEnabled] = usePersistentFlag(KEY_RULERS, true, 'bool');
  const [pdpControlsEnabled, setPdpControlsEnabled] = usePersistentFlag(KEY_PDP_CONTROLS, true, 'bool');
  const [pautaEnabled, setPautaEnabled] = usePersistentFlag(KEY_PAUTA, true, 'bool');
  const [tableEnabled, setTableEnabled] = usePersistentFlag(KEY_TABLE, true, 'bool');
  const [pautaOpacity, setPautaOpacity] = usePersistentFlag(KEY_PAUTA_OPACITY, 1, 'number');
  const [tableOpacity, setTableOpacity] = usePersistentFlag(KEY_TABLE_OPACITY, 0.5, 'number');

  return {
    debugsEnabled,
    setDebugsEnabled,
    activeWorkEnabled,
    setActiveWorkEnabled,
    rulersEnabled,
    setRulersEnabled,
    pdpControlsEnabled,
    setPdpControlsEnabled,
    pautaEnabled,
    setPautaEnabled,
    tableEnabled,
    setTableEnabled,
    pautaOpacity,
    setPautaOpacity,
    tableOpacity,
    setTableOpacity,
  };
}

export {
  KEY_DEBUGS,
  KEY_ACTIVE_WORK,
  KEY_RULERS,
  KEY_PDP_CONTROLS,
  KEY_PAUTA,
  KEY_TABLE,
  KEY_PAUTA_OPACITY,
  KEY_TABLE_OPACITY,
};
