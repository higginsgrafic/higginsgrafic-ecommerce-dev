/**
 * Sentry — monitoring d'errors en producció
 *
 * Només s'inicialitza si la variable d'entorn VITE_SENTRY_DSN
 * està configurada. En local/desenvolupament, no fa res.
 */

import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    // Sense DSN configurat → no inicialitzem (entorn local)
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'production',
    release: import.meta.env.VITE_APP_VERSION || import.meta.env.COMMIT_REF || 'unknown',

    // Només capturem errors en producció per no inundar durant el dev
    enabled: import.meta.env.PROD,

    // Traces: captura de rendiment de rutes i operacions
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,

    // Replay de sessió (només si s'habilita explícitament)
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 0.5,

    // Integracions automàtiques de React
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: true,
        maskAllInputs: true,
      }),
    ],

    // Ignorem errors que no són crítics o són soroll
    ignoreErrors: [
      // Errors de xarxa/pagament irrellevants
      'Network request failed',
      'Payment Request error',
      'Stripe checkout error',
      // Errades de scripts de tercers
      /^Script error\.?$/,
      // Errades de Chrome extensions
      /chrome-extension:\/\//i,
      'ResizeObserver loop limit exceeded',
    ],

    // No enviem dades sensibles
    beforeSend(event) {
      // Eliminem possibles dades sensibles dels errors
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      return event;
    },
  });

  console.log('🐞 Sentry inicialitzat');
}

export { Sentry };
export default initSentry;