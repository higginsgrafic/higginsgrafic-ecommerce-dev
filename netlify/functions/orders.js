import { createClient } from '@supabase/supabase-js';

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

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, {});
  }

  const supabase = getSupabase();
  if (!supabase) {
    return jsonResponse(500, { error: 'Supabase no configurat' });
  }

  const method = event.httpMethod;

  // POST: Create a new order
  if (method === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const {
        email,
        items,
        subtotal,
        shippingCost,
        iva,
        total,
        shippingZone,
        firstName,
        lastName,
        address,
        address2,
        city,
        postalCode,
        country,
        phone,
        userId,
        paymentIntentId,
      } = body;

      if (!email || !items || !Array.isArray(items) || items.length === 0) {
        return jsonResponse(400, { error: 'Falten camps obligatoris (email, items)' });
      }

      const { data, error } = await supabase
        .from('orders')
        .insert({
          email,
          user_id: userId || null,
          status: 'pendent',
          items: JSON.stringify(items),
          subtotal: subtotal || 0,
          shipping_cost: shippingCost || 0,
          iva: iva || 0,
          total: total || 0,
          shipping_zone: shippingZone || 'es_peninsula',
          first_name: firstName || null,
          last_name: lastName || null,
          address: address || null,
          address2: address2 || null,
          city: city || null,
          postal_code: postalCode || null,
          country: country || 'Espanya',
          phone: phone || null,
          payment_intent_id: paymentIntentId || null,
        })
        .select()
        .single();

      if (error) {
        console.error('[orders] Error creating order:', error);
        return jsonResponse(500, { error: error.message });
      }

      return jsonResponse(200, { order: data });
    } catch (err) {
      console.error('[orders] POST error:', err);
      return jsonResponse(500, { error: err.message });
    }
  }

  // GET: List orders for a user (by email, userId, or single order by orderNumber)
  if (method === 'GET') {
    try {
      const params = event.queryStringParameters || {};
      const { email, userId, orderNumber } = params;

      if (orderNumber) {
        let query = supabase
          .from('orders')
          .select('*')
          .eq('order_number', orderNumber);

        if (email) {
          query = query.eq('email', email);
        }

        const { data, error } = await query.single();

        if (error) {
          console.error('[orders] Error fetching single order:', error);
          return jsonResponse(404, { error: 'Comanda no trobada' });
        }

        const formatted = {
          ...data,
          statusLabel: STATUS_LABELS[data.status] || data.status,
          items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
        };

        return jsonResponse(200, { order: formatted });
      }

      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (email) {
        query = query.eq('email', email);
      } else {
        return jsonResponse(400, { error: 'Cal proporcionar email, userId o orderNumber' });
      }

      const { data, error } = await query;

      if (error) {
        console.error('[orders] Error fetching orders:', error);
        return jsonResponse(500, { error: error.message });
      }

      const formatted = (data || []).map((o) => ({
        ...o,
        statusLabel: STATUS_LABELS[o.status] || o.status,
        items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
      }));

      return jsonResponse(200, { orders: formatted });
    } catch (err) {
      console.error('[orders] GET error:', err);
      return jsonResponse(500, { error: err.message });
    }
  }

  // PATCH: Update order status
  if (method === 'PATCH') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { orderNumber, status, gelatoOrderId } = body;

      if (!orderNumber) {
        return jsonResponse(400, { error: 'Falta orderNumber' });
      }

      const updateFields = {};
      if (status) {
        if (!VALID_STATUSES.includes(status)) {
          return jsonResponse(400, { error: `Status invàlid. Vàlids: ${VALID_STATUSES.join(', ')}` });
        }
        updateFields.status = status;
      }
      if (gelatoOrderId !== undefined) {
        updateFields.gelato_order_id = gelatoOrderId;
      }

      if (Object.keys(updateFields).length === 0) {
        return jsonResponse(400, { error: 'Cal proporcionar status o gelatoOrderId' });
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateFields)
        .eq('order_number', orderNumber)
        .select()
        .single();

      if (error) {
        console.error('[orders] Error updating order:', error);
        return jsonResponse(500, { error: error.message });
      }

      return jsonResponse(200, { order: data });
    } catch (err) {
      console.error('[orders] PATCH error:', err);
      return jsonResponse(500, { error: err.message });
    }
  }

  return jsonResponse(405, { error: `Method ${method} not allowed` });
}
