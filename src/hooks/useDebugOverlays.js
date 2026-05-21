import { useCallback, useEffect, useState } from 'react';

// Persistent UI flags that control developer debug overlays on the live site.
// Each flag defaults to ON to preserve previous behaviour for current users.

const KEY_DEBUGS = 'hg.debugOverlays.enabled';
const KEY_ACTIVE_WORK = 'hg.activeWorkOverlay.enabled';
const KEY_RULERS = 'hg.rulersOverlay.enabled';
const KEY_PDP_CONTROLS = 'hg.pdpControlsOverlay.enabled';
const EVT_PREFIX = 'hg:debug-overlays-changed';

function readBool(key, defaultValue) {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return defaultValue;
    return v === '1' || v === 'true';
  } catch {
    return defaultValue;
  }
}

function writeBool(key, value) {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new CustomEvent(`${EVT_PREFIX}:${key}`, { detail: value }));
  } catch {
    // ignore
  }
}

function useBoolFlag(key, defaultValue) {
  const [value, setValue] = useState(() => readBool(key, defaultValue));

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key) setValue(readBool(key, defaultValue));
    };
    const onCustom = (e) => {
      setValue(Boolean(e?.detail));
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(`${EVT_PREFIX}:${key}`, onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(`${EVT_PREFIX}:${key}`, onCustom);
    };
  }, [key, defaultValue]);

  const update = useCallback(
    (next) => {
      const v = typeof next === 'function' ? next(value) : Boolean(next);
      writeBool(key, v);
      setValue(v);
    },
    [key, value]
  );

  return [value, update];
}

export function useDebugOverlays() {
  const [debugsEnabled, setDebugsEnabled] = useBoolFlag(KEY_DEBUGS, true);
  const [activeWorkEnabled, setActiveWorkEnabled] = useBoolFlag(KEY_ACTIVE_WORK, true);
  const [rulersEnabled, setRulersEnabled] = useBoolFlag(KEY_RULERS, true);
  const [pdpControlsEnabled, setPdpControlsEnabled] = useBoolFlag(KEY_PDP_CONTROLS, true);
  return {
    debugsEnabled,
    setDebugsEnabled,
    activeWorkEnabled,
    setActiveWorkEnabled,
    rulersEnabled,
    setRulersEnabled,
    pdpControlsEnabled,
    setPdpControlsEnabled,
  };
}

export { KEY_DEBUGS, KEY_ACTIVE_WORK, KEY_RULERS, KEY_PDP_CONTROLS };
