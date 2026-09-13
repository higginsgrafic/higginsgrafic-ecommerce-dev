/**
 * Enviament de correus, a prova de fallades.
 *
 * PER QUÈ EXISTEIX AIXÒ
 *
 * Enviar un correu no ha de poder impedir cobrar. Les funcions `orders`,
 * `stripe-webhook`, `send-message` i `gelato-webhook` fan la seva feina
 * principal (confirmar la comanda, enviar-la a Gelato, desar el missatge) i
 * el correu és un extra: si el correu falla, la feina principal s'ha de
 * completar igualment. Aquest embolcall garanteix que cap error de correu
 * faci caure la funció que el crida.
 *
 * HISTÒRIA (important, per no repetir l'error)
 *
 * 1. Al principi aquest mòdul feia `await import('./email.js')` per carregar
 *    el sistema de correu només quan calia. Semblava més segur, però
 *    l'empaquetador de Netlify NO inclou els fitxers que s'importen d'aquesta
 *    manera dins del paquet de la funció: `email.js` no arribava mai al
 *    servidor i tots els correus fallaven en silenci.
 *
 * 2. Ara la importació és estàtica (a dalt de tot) perquè l'empaquetador la
 *    vegi i inclogui el fitxer. El que protegeix la funció no és que la
 *    càrrega sigui tardana, sinó el try/catch de sota, que envolta TOTA
 *    l'operació d'enviar.
 *
 * 3. La causa original del 502 (el paquet `@react-email/render`) ja no hi és:
 *    `email.js` renderitza amb `react-dom/server`.
 */

import { sendOrderEmail as enviarCorreu } from './email.js';

/**
 * Envia un correu transaccional sense poder trencar la funció que el crida.
 *
 * @param {string} templateKey clau de la plantilla (p. ex. 'order_shipped')
 * @param {Object} payload     dades de la plantilla
 * @returns {Promise<Object>}  { id } si s'ha enviat, { error } si no
 */
export async function sendOrderEmail(templateKey, payload) {
  try {
    return await enviarCorreu(templateKey, payload);
  } catch (err) {
    // El correu ha fallat, però la comanda segueix el seu camí.
    console.error(
      `[_notify] No s'ha pogut enviar el correu "${templateKey}":`,
      err?.message || err
    );
    return { error: String(err?.message || err) };
  }
}

export default { sendOrderEmail };
