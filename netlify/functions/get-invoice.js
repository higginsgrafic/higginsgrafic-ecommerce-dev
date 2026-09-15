import { createClient } from '@supabase/supabase-js';
import { jsonResponse } from '../lib/cors.js';

/**
 * Retorna una factura a partir del seu testimoni d'accés.
 *
 * El client rep l'enllaç per correu i l'ha de poder obrir sense entrar a cap
 * compte. El testimoni és un UUID aleatori que va a la URL: qui el té, veu la
 * factura; qui no, no la troba. És el mateix sistema que fan servir Stripe o
 * Amazon amb els enllaços de les seves factures.
 *
 * Només es retorna el document, mai la llista de factures: això vol dir que no
 * es pot fer servir per esbrinar quantes n'hi ha ni de qui són.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** El testimoni ha de tenir forma d'UUID; qualsevol altra cosa es rebutja abans de tocar la base. */
export function isValidAccessToken(token) {
  return typeof token === 'string' && UUID_RE.test(token.trim());
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(event, 204, null);
  }

  const token = event.queryStringParameters?.token;
  if (!isValidAccessToken(token)) {
    return jsonResponse(event, 400, { error: 'Falten dades' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[get-invoice] Supabase no configurat');
    return jsonResponse(event, 500, { error: 'Servei no disponible' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('access_token', token.trim())
    .maybeSingle();

  if (error) {
    console.error('[get-invoice] Error consultant la factura:', error.message);
    return jsonResponse(event, 500, { error: 'Error consultant la factura' });
  }

  if (!data) {
    return jsonResponse(event, 404, { error: 'Factura no trobada' });
  }

  return jsonResponse(event, 200, { invoice: data });
}
