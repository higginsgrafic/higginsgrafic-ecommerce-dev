/**
 * Webhook de Gelato — rep els avisos de canvi d'estat de les comandes.
 *
 * Gelato envia aquests avisos quan la comanda avança (en producció, enviada,
 * entregada...), i quan s'assigna un número de seguiment. Sense això, l'estat
 * de la comanda no s'actualitzava mai sol: només passava a "en_preparacio"
 * quan Gelato acceptava la comanda, i després es quedava aturat per sempre.
 *
 * Dades que envia Gelato (verificat amb les proves del seu panell):
 *
 *   order_status_updated
 *     { event, orderId, orderReferenceId, fulfillmentStatus, items: [...] }
 *
 *   order_item_tracking_code_updated
 *     { event, orderId, orderReferenceId, trackingCode, trackingUrl,
 *       shipmentMethodName, ... }
 *
 * `orderReferenceId` és el NOSTRE número de comanda (order_number), perquè és
 * el que li vam enviar nosaltres en crear-la (vegeu netlify/lib/gelato.js).
 *
 * Configuració necessària a Netlify:
 *   GELATO_WEBHOOK_SECRET — secret compartit per verificar que l'avís ve de
 *                           Gelato. ÉS OBLIGATORI: sense això la funció
 *                           rebutja tots els avisos (500) i l'estat de les
 *                           comandes no s'actualitza. És el mal menor: val més
 *                           no actualitzar que acceptar avisos de qualsevol.
 */

import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';
import { sendOrderEmail } from '../lib/notify.js';
import { jsonResponse } from '../lib/cors.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = process.env.GELATO_WEBHOOK_SECRET;

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

/**
 * Estats de Gelato → estats de la nostra botiga.
 *
 * NOTA: els valors exactes que pot enviar Gelato no estan tots confirmats.
 * Els que no reconeguem NO canvien l'estat de la comanda: es registren a la
 * consola i prou. Val més quedar-se amb l'estat anterior que inventar-se'n un.
 */
const STATUS_MAP = {
  created: 'en_preparacio',
  passed: 'en_preparacio',
  in_production: 'en_preparacio',
  printed: 'en_preparacio',
  shipped: 'seguiment',
  delivered: 'entregada',
  canceled: 'cancel_lada',
  cancelled: 'cancel_lada',
  failed: 'aturada',
};

/**
 * Verifica que l'avís ve realment de Gelato.
 *
 * Accepta el secret de tres maneres, perquè no tots els panells el poden
 * enviar igual:
 *   - capçalera `x-gelato-secret`
 *   - capçalera `Authorization` (amb o sense la paraula "Bearer" al davant)
 *   - paràmetre `?secret=` a l'adreça
 *
 * FAIL CLOSED: si no hi ha secret configurat, NO s'accepta res.
 *
 * Abans, si faltava el secret, s'acceptaven tots els avisos "per no trencar
 * res". Era un forat: els números de comanda són curts i endevinables, així
 * que qualsevol persona podia enviar un avís fals i aconseguir que un client
 * rebés un correu autèntic de la botiga dient que la comanda s'ha enviat, amb
 * un enllaç de seguiment inventat per l'atacant. Un correu de la botiga amb un
 * enllaç fraudulent és una estafa perfecta.
 */
function verifyWebhook(event) {
  if (!WEBHOOK_SECRET) return false;

  const headers = event.headers || {};
  const enviat =
    headers['x-gelato-secret'] ||
    headers['X-Gelato-Secret'] ||
    headers['authorization'] ||
    headers['Authorization'] ||
    event.queryStringParameters?.secret ||
    '';

  const net = String(enviat).replace(/^Bearer\s+/i, '').trim();
  return comparacioSegura(net, WEBHOOK_SECRET);
}

/**
 * Compara dos textos sense filtrar informació pel temps que triga a respondre.
 * Amb una comparació normal, el programa surt al primer caràcter que no
 * coincideix: mesurant temps es pot anar endevinant el secret caràcter a
 * caràcter.
 */
function comparacioSegura(a, b) {
  const un = Buffer.from(String(a ?? ''));
  const altre = Buffer.from(String(b ?? ''));
  if (un.length !== altre.length) return false;
  return timingSafeEqual(un, altre);
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(event, 200, {}, { methods: 'POST, OPTIONS' });
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(event, 405, { error: 'Mètode no permès' }, { methods: 'POST, OPTIONS' });
  }

  if (!WEBHOOK_SECRET) {
    console.error('[gelato-webhook] GELATO_WEBHOOK_SECRET no configurat: avís REBUTJAT');
    return jsonResponse(event, 500, { error: 'Webhook no configurat' });
  }

  if (!verifyWebhook(event)) {
    console.error('[gelato-webhook] Avís rebut sense credencial vàlida');
    return jsonResponse(event, 401, { error: 'No autoritzat' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return jsonResponse(event, 500, { error: 'Supabase no configurat' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(event, 400, { error: 'Cos de la petició no vàlid' });
  }

  const tipus = payload.event || '';
  const referencia = payload.orderReferenceId || null;
  const gelatoId = payload.orderId || null;

  if (!referencia && !gelatoId) {
    return jsonResponse(event, 400, { error: 'Falta la referència de la comanda' });
  }

  console.log('[gelato-webhook] Avís:', tipus, '| comanda:', referencia || gelatoId);

  try {
    // Busquem la comanda pel nostre número; si no, pel de Gelato.
    let consulta = supabase.from('orders').select('*');
    consulta = referencia
      ? consulta.eq('order_number', referencia)
      : consulta.eq('gelato_order_id', gelatoId);

    let { data: order, error: readError } = await consulta.maybeSingle();

    if (readError || !order) {
      // Segona via: potser la referència no és el nostre número.
      if (gelatoId) {
        const segona = await supabase
          .from('orders')
          .select('*')
          .eq('gelato_order_id', gelatoId)
          .maybeSingle();
        order = segona.data;
        readError = segona.error;
      }
    }

    if (readError || !order) {
      console.error('[gelato-webhook] Comanda no trobada:', referencia || gelatoId);
      // Retornem 200 perquè Gelato no reintenti indefinidament un avís
      // que no podrem resoldre: queda registrat per revisar-ho a mà.
      return jsonResponse(event, 200, { received: true, order: 'not_found' });
    }

    // --- Número de seguiment ---
    if (tipus === 'order_item_tracking_code_updated') {
      const canvis = {};
      if (payload.trackingCode) canvis.tracking_number = payload.trackingCode;
      if (payload.trackingUrl) canvis.tracking_url = payload.trackingUrl;
      if (payload.shipmentMethodName) canvis.tracking_carrier = payload.shipmentMethodName;

      if (Object.keys(canvis).length > 0) {
        const { error } = await supabase.from('orders').update(canvis).eq('id', order.id);
        if (error) {
          console.error('[gelato-webhook] Error desant el seguiment:', error.message);
          return jsonResponse(event, 500, { error: 'Error desant el seguiment' });
        }
        console.log('[gelato-webhook] Seguiment desat:', canvis.tracking_number);
      }

      return jsonResponse(event, 200, { received: true, updated: 'tracking' });
    }

    // --- Canvi d'estat de la comanda ---
    if (tipus === 'order_status_updated') {
      const gelatoStatus = String(payload.fulfillmentStatus || '').toLowerCase();
      const nouEstat = STATUS_MAP[gelatoStatus];

      if (!nouEstat) {
        console.warn('[gelato-webhook] Estat de Gelato no reconegut:', gelatoStatus, '— no es canvia res');
        return jsonResponse(event, 200, { received: true, ignored: gelatoStatus });
      }

      const canvis = {};

      // No fem retrocedir una comanda ja entregada o cancel·lada.
      const finals = ['entregada', 'cancel_lada'];
      if (!finals.includes(order.status)) {
        canvis.status = nouEstat;
      }

      // Aprofitem per desar el seguiment si ve dins dels items.
      const primer = payload.items?.[0]?.fulfillments?.[0];
      if (primer) {
        if (primer.trackingCode) canvis.tracking_number = primer.trackingCode;
        if (primer.trackingUrl) canvis.tracking_url = primer.trackingUrl;
        if (primer.shipmentMethodName) canvis.tracking_carrier = primer.shipmentMethodName;
      }

      if (Object.keys(canvis).length === 0) {
        return jsonResponse(event, 200, { received: true, unchanged: true });
      }

      const { error } = await supabase.from('orders').update(canvis).eq('id', order.id);
      if (error) {
        console.error('[gelato-webhook] Error actualitzant l\'estat:', error.message);
        return jsonResponse(event, 500, { error: 'Error actualitzant l\'estat' });
      }

      console.log('[gelato-webhook] Estat actualitzat:', order.status, '→', canvis.status || order.status);

      // Correu d'enviament: només quan la comanda passa a "seguiment" i no
      // s'havia enviat abans. Abans això depenia d'un canvi manual que ningú
      // no feia, així que el correu no s'enviava mai.
      const esNouEnviament = canvis.status === 'seguiment' && order.status !== 'seguiment';
      if (esNouEnviament) {
        try {
          await sendOrderEmail('order_shipped', { ...order, ...canvis });
        } catch (err) {
          console.error('[gelato-webhook] Error enviant el correu d\'enviament:', err.message);
        }
      }

      return jsonResponse(event, 200, { received: true, status: canvis.status || order.status });
    }

    // Altres avisos (catàleg de productes, etc.): s'accepten i s'ignoren.
    console.log('[gelato-webhook] Avís no gestionat:', tipus);
    return jsonResponse(event, 200, { received: true, ignored: tipus });
  } catch (error) {
    console.error('[gelato-webhook] Error inesperat:', error);
    return jsonResponse(event, 500, { error: 'Error intern del servidor' });
  }
}
