// Llista blanca de claus de localStorage que formen part del calibratge global
// del workspace. Una clau entra al snapshot si comença per algun d'aquests prefixos
// o si coincideix exactament amb una clau literal.
//
// Mantingues aquesta llista petita i intencionada. No incloguis aquí estats
// d'usuari final (sessió, carret, preferències UI temporals).

export const CALIBRATION_KEY_PREFIXES = [
  'HG_EDITABLE_TEXT_BOX_V1:',
  'hg.constructorColleccio.',
  'HG_DEV_BELT2_',
  'HG_BELT2_',
  'HG_BELT_',
  'MEGA_STRIPE_',
  'MEGA_TILE_SELECTOR_',
  'HG_SHIRT_DRAWING_',
  'HG_DRAWING_OVERLAY_',
  'p2_',
];

export const CALIBRATION_KEY_LITERALS = [
];

export function isCalibrationKey(key) {
  if (!key || typeof key !== 'string') return false;
  if (CALIBRATION_KEY_LITERALS.includes(key)) return true;
  return CALIBRATION_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function readCalibrationSnapshot() {
  if (typeof window === 'undefined') return {};

  const snapshot = {};
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!isCalibrationKey(key)) continue;
    try {
      snapshot[key] = window.localStorage.getItem(key);
    } catch {
      // ignore
    }
  }
  return snapshot;
}

export function applyCalibrationSnapshot(snapshot, { clearMissing = true } = {}) {
  if (typeof window === 'undefined' || !snapshot || typeof snapshot !== 'object') return;

  const incomingKeys = new Set(Object.keys(snapshot));

  if (clearMissing) {
    const toRemove = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!isCalibrationKey(key)) continue;
      if (!incomingKeys.has(key)) toRemove.push(key);
    }
    toRemove.forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    });
  }

  Object.entries(snapshot).forEach(([key, value]) => {
    if (!isCalibrationKey(key)) return;
    try {
      if (value == null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, String(value));
      }
    } catch {
      // ignore
    }
  });
}
