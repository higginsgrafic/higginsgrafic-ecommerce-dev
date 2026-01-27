export const SITE_ORIGIN = (() => {
  const envOrigin = (import.meta?.env?.VITE_SITE_ORIGIN || '').toString().trim();
  if (envOrigin) return envOrigin.replace(/\/$/, '');

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return String(window.location.origin).replace(/\/$/, '');
  }

  return 'http://localhost:3003';
})();

export function buildSiteUrl(path = '/') {
  const raw = (path == null ? '/' : String(path)).trim();
  if (!raw) return SITE_ORIGIN;
  if (/^https?:\/\//i.test(raw)) return raw;

  const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
  return `${SITE_ORIGIN}${normalizedPath}`;
}
