/**
 * Enviament de correus, a prova de fallades.
 *
 * PER QUÈ EXISTEIX AIXÒ
 *
 * Les funcions `orders`, `stripe-webhook`, `send-message` i `gelato-webhook`
 * importaven `_email.js` a dalt de tot del fitxer. I `_email.js` carrega
 * `@react-email/render`, que en producció Netlify no aconsegueix empaquetar.
 *
 * Resultat: la funció SENCERA no arrencava — ni tan sols la part que no té res
 * a veure amb correus. El cas més greu era `stripe-webhook`: la funció que rep
 * l'avís de pagament de Stripe i envia la comanda a Gelato retornava 502.
 * És a dir: un client podia pagar i la comanda no es confirmava mai.
 *
 * Enviar un correu no ha de poder impedir cobrar. Aquest mòdul carrega el
 * sistema de correu NOMÉS quan realment s'ha d'enviar un correu, i si falla
 * ho registra i retorna un error, sense aturar la feina principal.
 */

let modulCorreu = null;

/**
 * Envia un correu transaccional sense poder trencar la funció que el crida.
 *
 * @param {string} templateKey clau de la plantilla (p. ex. 'order_shipped')
 * @param {Object} payload     dades de la plantilla
 * @returns {Promise<Object>}  { id } si s'ha enviat, { error } si no
 */
export async function sendOrderEmail(templateKey, payload) {
  try {
    if (!modulCorreu) {
      modulCorreu = await import('./_email.js');
    }
    return await modulCorreu.sendOrderEmail(templateKey, payload);
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
