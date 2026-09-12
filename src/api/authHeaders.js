import { supabase } from '@/api/supabase-products';

/**
 * Capçaleres HTTP amb el token de sessió de Supabase.
 *
 * Els endpoints `/api/orders` exigeixen `Authorization: Bearer <token>`
 * (vegeu netlify/functions/_auth.js). Sense aquesta capçalera responen 401,
 * i com que els hooks silenciaven l'error, l'historial de comandes de
 * l'usuari sortia SEMPRE buit tot i tenir comandes.
 *
 * Si no hi ha sessió, es retornen les capçaleres sense token: la crida es fa
 * igualment i el servidor decidirà (per als convidats cal el trackingToken).
 *
 * @param {Object} extra capçaleres addicionals (p. ex. Content-Type)
 * @returns {Promise<Object>}
 */
export async function authHeaders(extra = {}) {
  const headers = { ...extra };
  try {
    const { data } = await supabase?.auth?.getSession?.() ?? {};
    const token = data?.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    // Sense sessió disponible: es fa la crida sense token.
  }
  return headers;
}

export default authHeaders;
