export function createUrlParamReaders(urlParams) {
  const get = (key) => {
    try {
      if (!urlParams || typeof urlParams.get !== 'function') return null;
      return urlParams.get(key);
    } catch {
      return null;
    }
  };

  const has = (key) => {
    try {
      if (!urlParams || typeof urlParams.has !== 'function') return false;
      return urlParams.has(key);
    } catch {
      return false;
    }
  };

  const parseFloatParam = (key, fallback) => {
    const raw = get(key);
    if (raw == null || raw === '') return fallback;
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  const parseIntParam = (key, fallback) => {
    const raw = get(key);
    if (raw == null || raw === '') return fallback;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  const parseStringParam = (key, fallback) => {
    const raw = get(key);
    if (typeof raw === 'string' && raw.length > 0) return raw;
    return fallback;
  };

  return {
    get,
    has,
    parseFloatParam,
    parseIntParam,
    parseStringParam,
  };
}
