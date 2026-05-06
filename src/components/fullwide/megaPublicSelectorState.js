/**
 * megaPublicSelectorState
 * -----------------------------------------------------------------------------
 * Persistència en `sessionStorage` per al "selector públic" del mega-slide:
 * recorda quina pàgina/variant té oberta el visitant per col·lecció i keyset,
 * i una marca de "darrera activitat" per resetejar quan ha estat inactiu massa
 * estona.
 *
 * Tota l'API és segura en SSR (no fa res si `window` no existeix) i no llança
 * mai (try/catch a tot arreu).
 */

export const MEGA_PUBLIC_IDLE_MS = 60 * 60 * 1000; // 1h
export const MEGA_PUBLIC_LAST_ACTIVITY_AT_KEY = 'HG_MEGA_PUBLIC_LAST_ACTIVITY_AT';
export const MEGA_PUBLIC_SELECTOR_STATE_KEY = 'HG_MEGA_PUBLIC_SELECTOR_STATE';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export function touchMegaPublicActivity() {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage?.setItem(MEGA_PUBLIC_LAST_ACTIVITY_AT_KEY, String(Date.now()));
    window.dispatchEvent(new Event('hg-mega-public-activity'));
  } catch {
    // ignore
  }
}

export function resetMegaPublicState() {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage?.removeItem(MEGA_PUBLIC_LAST_ACTIVITY_AT_KEY);
    window.sessionStorage?.removeItem(MEGA_PUBLIC_SELECTOR_STATE_KEY);
    window.dispatchEvent(new Event('mega-tile-selector-changed'));
  } catch {
    // ignore
  }
}

export function readMegaPublicLastActivityAt() {
  try {
    if (typeof window === 'undefined') return 0;
    const raw = window.sessionStorage?.getItem(MEGA_PUBLIC_LAST_ACTIVITY_AT_KEY);
    const n = raw == null ? NaN : Number.parseInt(String(raw), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function readMegaPublicSelectorState() {
  try {
    if (typeof window === 'undefined') return {};
    const raw = window.sessionStorage?.getItem(MEGA_PUBLIC_SELECTOR_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeMegaPublicSelectorState(next) {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage?.setItem(MEGA_PUBLIC_SELECTOR_STATE_KEY, JSON.stringify(next || {}));
  } catch {
    // ignore
  }
}

export function getMegaPublicSelectorFor(collectionId, keyset) {
  try {
    const cid = (collectionId || '').toString();
    if (!cid) return null;
    const ks = String(keyset || 'v1');
    const root = readMegaPublicSelectorState();
    const perCollection = root?.[cid];
    const perKeyset = perCollection?.[ks];
    if (!perKeyset || typeof perKeyset !== 'object') return null;

    // Expiració per timestamp (15 min). Si caduca, retornem null per forçar
    // que el consumidor reinicialitzi a l'estat per defecte.
    const timestamp = perKeyset.timestamp;
    if (timestamp && typeof timestamp === 'number') {
      const elapsed = Date.now() - timestamp;
      if (elapsed > FIFTEEN_MINUTES_MS) {
        return null;
      }
    }

    return perKeyset;
  } catch {
    return null;
  }
}

export function setMegaPublicSelectorFor(collectionId, keyset, value) {
  try {
    const cid = (collectionId || '').toString();
    if (!cid) return;
    const ks = String(keyset || 'v1');
    const root = readMegaPublicSelectorState();
    const baseRoot = root && typeof root === 'object' ? root : {};
    const baseCollection = baseRoot?.[cid] && typeof baseRoot[cid] === 'object' ? baseRoot[cid] : {};
    const baseKeyset = baseCollection?.[ks] && typeof baseCollection[ks] === 'object' ? baseCollection[ks] : {};
    const nextKeyset = {
      ...baseKeyset,
      ...(value && typeof value === 'object' ? value : {}),
      timestamp: Date.now(),
    };
    const nextCollection = { ...baseCollection, [ks]: nextKeyset };
    const next = { ...baseRoot, [cid]: nextCollection };
    writeMegaPublicSelectorState(next);
  } catch {
    // ignore
  }
}
