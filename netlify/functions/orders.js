import { createClient } from '@supabase/supabase-js';
import { sendOrderEmail } from './_email.js';
import { verifyAdmin, verifyUser } from './_auth.js';
import { checkRateLimit } from './_rate-limit.js';
import { hashToken, isTokenExpired } from './_token.js';
import { jsonResponse } from './_cors.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

const VALID_STATUSES = [
  'pendent',
  'confirmada',
  'en_preparacio',
  'seguiment',
  'en_repartiment',
  'aturada',
  'cancel_lada',
  'entregada',
];

const STATUS_LABELS = {
  'pendent': 'PENDENT',
  'confirmada': 'CONFIRMADA',
  'en_preparacio': 'EN PREPARACIÓ',
  'seguiment': 'SEGUIMENT',
  'en_repartiment': 'EN REPARTIMENT',
  'aturada': 'ATURADA',
  'cancel_lada': 'CANCEL·LADA',
  'entregada': 'ENTREGADA',
};


export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(event, 200, {});
  }

  const supabase = getSupabase();
  if (!supabase) {
    return jsonResponse(event, 500, { error: 'Supabase no configurat' });
  }

  const method = event.httpMethod;

  // POST: Disabled — orders are created by create-payment-intent function only
  if (method === 'POST') {
    return jsonResponse(event, 403, { error: 'La creació de comandes es fa via create-payment-intent' });
  }

  // GET: Retrieve orders
  // Authenticated users: by user_id (from JWT)
  // Guest tracking: by trackingToken (high-entropy, expiring)
  // Admin: can query by email or orderNumber with Bearer token
  if (method === 'GET') {
    const { allowed: rlAllowed } = await checkRateLimit(event, 'order_tracking', {
      maxCount: 20,
      windowSeconds: 60,
    });
    if (!rlAllowed) {
      return jsonResponse(event, 429, { error: 'Massa sol·licituds. Torna-ho a provar en un moment.' });
    }

    try {
      const params = event.queryStringParameters || {};
      const { trackingToken, orderNumber, email } = params;

      // Guest tracking via high-entropy token (stored as hash)
      if (trackingToken) {
        const tokenHash = hashToken(trackingToken);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('tracking_token_hash', tokenHash)
          .single();

        if (error || !data) {
          return jsonResponse(event, 404, { error: 'Comanda no trobada' });
        }

        if (isTokenExpired(data.tracking_token_expires_at)) {
          return jsonResponse(event, 403, { error: 'Token de seguiment caducat' });
        }

        const formatted = {
          ...data,
          statusLabel: STATUS_LABELS[data.status] || data.status,
          items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
        };

        return jsonResponse(event, 200, { order: formatted });
      }

      // Authenticated user: list own orders
      const { user, error: userError } = await verifyUser(event);
      if (user) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[orders] Error fetching user orders:', error);
          return jsonResponse(event, 500, { error: 'Error intern del servidor' });
        }

        const formatted = (data || []).map((o) => ({
          ...o,
          statusLabel: STATUS_LABELS[o.status] || o.status,
          items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
        }));

        return jsonResponse(event, 200, { orders: formatted });
      }

      // Admin: can query by email or orderNumber
      const { authorized: isAdmin } = await verifyAdmin(event);
      if (isAdmin) {
        if (orderNumber) {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('order_number', orderNumber)
            .single();

          if (error) {
            return jsonResponse(event, 404, { error: 'Comanda no trobada' });
          }

          const formatted = {
            ...data,
            statusLabel: STATUS_LABELS[data.status] || data.status,
            items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
          };

          return jsonResponse(event, 200, { order: formatted });
        }

        if (email) {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('[orders] Admin email query error:', error);
            return jsonResponse(event, 500, { error: 'Error intern del servidor' });
          }

          const formatted = (data || []).map((o) => ({
            ...o,
            statusLabel: STATUS_LABELS[o.status] || o.status,
            items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
          }));

          return jsonResponse(event, 200, { orders: formatted });
        }

        return jsonResponse(event, 400, { error: 'Cal proporcionar email, orderNumber o trackingToken' });
      }

      return jsonResponse(event, 401, { error: 'Cal autenticació o token de seguiment' });
    } catch (err) {
      console.error('[orders] GET error:', err);
      return jsonResponse(event, 500, { error: 'Error intern del servidor' });
    }
  }

  // PATCH: Update order status (Admin only — via _auth.js staff table lookup)
  if (method === 'PATCH') {
    try {
      const { authorized, error: authError } = await verifyAdmin(event);
      if (!authorized) {
        return jsonResponse(event, 403, { error: authError || 'No autoritzat per modificar comandes' });
      }

      const body = JSON.parse(event.body || '{}');
      const {
        orderNumber,
        status,
        gelatoOrderId,
        trackingNumber,
        trackingCarrier,
        trackingUrl,
      } = body;

      if (!orderNumber) {
        return jsonResponse(event, 400, { error: 'Falta orderNumber' });
      }

      const updateFields = {};
      if (status) {
        if (!VALID_STATUSES.includes(status)) {
          return jsonResponse(event, 400, { error: `Status invàlid. Vàlids: ${VALID_STATUSES.join(', ')}` });
        }
        updateFields.status = status;
      }
      if (gelatoOrderId !== undefined) {
        updateFields.gelato_order_id = gelatoOrderId;
      }
      if (trackingNumber !== undefined) {
        updateFields.tracking_number = trackingNumber;
      }
      if (trackingCarrier !== undefined) {
        updateFields.tracking_carrier = trackingCarrier;
      }
      if (trackingUrl !== undefined) {
        updateFields.tracking_url = trackingUrl;
      }

      if (Object.keys(updateFields).length === 0) {
        return jsonResponse(event, 400, { error: 'Cal proporcionar status, gelatoOrderId o camps de tracking' });
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateFields)
        .eq('order_number', orderNumber)
        .select()
        .single();

      if (error) {
        console.error('[orders] Error updating order:', error);
        return jsonResponse(event, 500, { error: 'Error intern del servidor' });
      }

      // Enviar correus transaccionals segons l'estat actualitzat
      if (data) {
        if (status === 'seguiment' || status === 'en_repartiment' || trackingNumber) {
          await sendOrderEmail('order_shipped', data);
        } else if (status === 'en_preparacio') {
          await sendOrderEmail('order_in_production', data);
        }
      }

      return jsonResponse(event, 200, { order: data });
    } catch (err) {
      console.error('[orders] PATCH error:', err);
      return jsonResponse(event, 500, { error: 'Error intern del servidor' });
    }
  }

  return jsonResponse(event, 405, { error: `Method ${method} not allowed` });
}
