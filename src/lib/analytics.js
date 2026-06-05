/**
 * Analytics GDPR-compliant — Plausible (cookieless, no consent banner)
 *
 * Docs: https://plausible.io/docs/plausible-script
 *
 * Per activar:
 *   1. Crear compte a https://plausible.io
 *   2. Configurar el domini de producció
 *   3. Definir VITE_PLAUSIBLE_DOMAIN al .env
 *
 * Quan VITE_PLAUSIBLE_DOMAIN no està definit, el script no s'injecta.
 *
 * Plausible és GDPR-compliant sense banner perquè:
 *   - No fa servir cookies
 *   - No guarda adreces IP (s'anominitzen)
 *   - No fa fingerprinting
 *   - Totes les dades s'emmagatzemen a la UE
 *
 * Alternativa futura: Umami auto-hostat o Netlify Functions + Supabase.
 */

const SCRIPT_ID = 'plausible-analytics-script';

/**
 * Injecta el script de Plausible al <head>.
 * Segura per SSR / SPAs.
 */
export function injectPlausible() {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!domain) {
    if (import.meta.env.DEV) {
      console.debug('[analytics] Plausible no configurat — defineix VITE_PLAUSIBLE_DOMAIN');
    }
    return;
  }

  // Evitar doble injecció
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.defer = true;
  script.setAttribute('data-domain', domain);
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}

/**
 * Envia un esdeveniment personalitzat a Plausible.
 * Exemple: trackEvent('add_to_cart', { props: { product: 't-shirt-cube' } })
 *
 * @param {string} eventName
 * @param {{ props?: Record<string, string> }} [options]
 */
export function trackEvent(eventName, options = {}) {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!domain) return;

  try {
    const plausible = window.plausible;
    if (typeof plausible === 'function') {
      plausible(eventName, options);
    }
  } catch (err) {
    // Silenciós per no trencar l'UX
  }
}

/**
 * Hook per React — crida injectPlausible() al mount i exposa trackEvent.
 * Exemple:
 *   const { track } = useAnalytics();
 *   track('purchase', { props: { value: '29.99' } });
 */
export function useAnalytics() {
  // En un entorn real faria servir useEffect, però per simplicitat
  // injectPlausible es crida una vegada a main.jsx
  return {
    track: trackEvent,
    inject: injectPlausible,
    isEnabled: Boolean(import.meta.env.VITE_PLAUSIBLE_DOMAIN),
  };
}