/**
 * Webhook de Gelato — rep els avisos de canvi d'estat de les comandes.
 *
 * Gelato envia aquests avisos quan la comanda avança (en producció, enviada,
 * entregada...), i quan s'assigna un número de seguiment. Sense això, l'estat
 * de la comanda no s'actualitzava mai sol: només passava a "en_preparacio"
 * quan Gelato acceptava la comanda, i després es quedava aturat per sempre.
 *
 * Dades que envia Gelato. Els exemples de sota són els REALS, copiats de la
 * prova del panell de Gelato (els valors entre {{...}} els substitueix Gelato
 * en enviar-los de debò):
 *
 *   order_status_updated
 *     { event, orderId, orderReferenceId, fulfillmentStatus, items: [...] }
 *
 *   order_item_status_updated
 *     { event, id, itemReferenceId, orderReferenceId, orderId, storeId,
 *       fulfillmentCountry, fulfillmentStateProvince, fulfillmentFacilityId,
 *       status, comment, created }
 *
 *   order_item_tracking_code_updated
 *     { event, orderId, orderReferenceId, trackingCode, trackingUrl,
 *       shipmentMethodName, ... }
 *
 * `orderReferenceId` és el NOSTRE número de comanda (order_number), perquè és
 * el que li vam enviar nosaltres en crear-la (vegeu netlify/lib/gelato.js).
 *
 * ATENCIÓ: l'estat de la comanda arriba per DOS camins diferents —a
 * `fulfillmentStatus` (avis de comanda) o a `status` (avis d'article)— i els
 * dos s'han de gestionar. Vegeu-ho més avall.
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
 * Ajunta els números de seguiment que ja teníem amb els nous, sense repetir-ne
 * cap i separant-los amb " · ".
 *
 * Una comanda es pot dividir en diversos paquets i cada paquet té el seu
 * número. Com que la botiga només té una casella per al seguiment, els hi
 * posem tots: val més que el client vegi "code123 · code234" que no pas que es
 * pensi que només li arribarà un paquet.
 */
function ajuntaCodisSeguiment(actual, nous) {
  const codis = String(actual || '')
    .split('·')
    .map((codi) => codi.trim())
    .filter(Boolean);

  for (const codi of nous) {
    const net = String(codi || '').trim();
    if (net && !codis.includes(net)) codis.push(net);
  }

  return codis.length > 0 ? codis.join(' · ') : null;
}

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

    // --- Recollim què ens diu aquest avís ---
    const canvis = {};

    // Número de seguiment. Pot arribar de dues maneres:
    //   - sol, a l'avís de codi de seguiment (order_item_tracking_code_updated)
    //   - dins d'un avís d'estat, a items[].fulfillments[]
    //
    // ATENCIÓ: una comanda es pot dividir en DOS o més paquets, i llavors hi ha
    // un número de seguiment per paquet. Abans només se'n desava un i la resta
    // es perdien: el client veia un sol número quan en tenia dos. Ara
    // s'acumulen tots (vegeu ajuntaCodisSeguiment).
    const codisSeguiment = [];
    let urlSeguiment = null;
    let transportista = null;

    if (payload.trackingCode) codisSeguiment.push(payload.trackingCode);
    if (payload.trackingUrl) urlSeguiment = payload.trackingUrl;
    if (payload.shipmentMethodName) transportista = payload.shipmentMethodName;

    for (const item of Array.isArray(payload.items) ? payload.items : []) {
      for (const enviament of Array.isArray(item?.fulfillments) ? item.fulfillments : []) {
        if (enviament?.trackingCode) codisSeguiment.push(enviament.trackingCode);
        if (!urlSeguiment && enviament?.trackingUrl) urlSeguiment = enviament.trackingUrl;
        if (!transportista && enviament?.shipmentMethodName) transportista = enviament.shipmentMethodName;
      }
    }

    const codisUnits = ajuntaCodisSeguiment(order.tracking_number, codisSeguiment);
    if (codisUnits && codisUnits !== order.tracking_number) canvis.tracking_number = codisUnits;
    if (urlSeguiment && urlSeguiment !== order.tracking_url) canvis.tracking_url = urlSeguiment;
    if (transportista && transportista !== order.tracking_carrier) canvis.tracking_carrier = transportista;

    // Estat de la comanda. Gelato el envia de DUES maneres diferents:
    //
    //   order_status_updated      → l'estat ve al camp `fulfillmentStatus`
    //                               (estat de tota la comanda)
    //   order_item_status_updated → l'estat ve al camp `status`
    //                               (estat article a article)
    //
    // Tots dos ens serveixen igual, perquè la botiga té un sol estat per
    // comanda. Aquesta segona forma es va descobrir provant el webhook des del
    // panell de Gelato: si no es gestionava, l'estat no s'actualitzava mai.
    const esCanviDEstat =
      tipus === 'order_status_updated' || tipus === 'order_item_status_updated';

    if (esCanviDEstat) {
      const estatGelato = String(payload.fulfillmentStatus || payload.status || '').toLowerCase();
      const nouEstat = STATUS_MAP[estatGelato];

      if (!nouEstat) {
        // No inventem res: si no reconeixem l'estat, es queda com estava.
        console.warn('[gelato-webhook] Estat de Gelato no reconegut:', estatGelato);
        if (Object.keys(canvis).length === 0) {
          return jsonResponse(event, 200, { received: true, ignored: estatGelato });
        }
      } else {
        // No fem retrocedir una comanda ja entregada o cancel·lada.
        const finals = ['entregada', 'cancel_lada'];
        if (!finals.includes(order.status)) {
          canvis.status = nouEstat;
        }
      }
    }

    // Si l'avís no ens aporta res nou, no toquem la base de dades.
    if (Object.keys(canvis).length === 0) {
      if (!esCanviDEstat) {
        console.log('[gelato-webhook] Avís no gestionat:', tipus);
      }
      return jsonResponse(event, 200, { received: true, unchanged: true });
    }

    const { error } = await supabase.from('orders').update(canvis).eq('id', order.id);
    if (error) {
      console.error('[gelato-webhook] Error actualitzant la comanda:', error.message);
      return jsonResponse(event, 500, { error: 'Error actualitzant la comanda' });
    }

    console.log(
      '[gelato-webhook] Comanda actualitzada:',
      referencia || gelatoId,
      '| estat:',
      order.status,
      '→',
      canvis.status || order.status,
      canvis.tracking_number ? `| seguiment: ${canvis.tracking_number}` : ''
    );

    // --- Correu d'enviament ---
    //
    // S'envia quan la comanda consta com a enviada I tenim número de
    // seguiment. Calen les dues coses: un correu dient "s'ha enviat" sense el
    // número de seguiment no serveix de res.
    //
    // Gelato envia l'estat i el número en avisos SEPARATS i no sempre en el
    // mateix ordre, així que no ens fixem en quin avís ha arribat, sinó en el
    // resultat: si abans no teníem les dues coses i ara sí, s'envia.
    // D'aquesta manera s'envia exactament una vegada.
    const estatFinal = canvis.status || order.status;
    const teSeguiment = canvis.tracking_number || order.tracking_number;
    const jaAvisat = order.status === 'seguiment' && Boolean(order.tracking_number);

    if (estatFinal === 'seguiment' && teSeguiment && !jaAvisat) {
      try {
        await sendOrderEmail('order_shipped', { ...order, ...canvis });
      } catch (err) {
        console.error('[gelato-webhook] Error enviant el correu d\'enviament:', err.message);
      }
    }

    return jsonResponse(event, 200, {
      received: true,
      status: estatFinal,
      tracking: teSeguiment || null,
    });
  } catch (error) {
    console.error('[gelato-webhook] Error inesperat:', error);
    return jsonResponse(event, 500, { error: 'Error intern del servidor' });
  }
}
