import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from './_rate-limit.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(body),
  };
}

async function calculateServerSideTotal(supabase, items, shippingZone) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { error: 'Items no vàlids' };
  }

  const variantIds = items.map((i) => i.gelatoVariantId).filter(Boolean);
  if (variantIds.length === 0) {
    return { error: 'Falta gelatoVariantId als items' };
  }

  const { data: variants, error: vError } = await supabase
    .from('product_variants')
    .select('id, gelato_variant_id, price')
    .in('gelato_variant_id', variantIds);

  if (vError || !variants) {
    return { error: 'No s\'han pogut obtenir els preus dels productes' };
  }

  const priceMap = new Map();
  for (const v of variants) {
    priceMap.set(v.gelato_variant_id, parseFloat(v.price) || 0);
  }

  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const unitPrice = priceMap.get(item.gelatoVariantId);
    if (unitPrice === undefined) {
      return { error: `Variant no trobada: ${item.gelatoVariantId}` };
    }
    const qty = Math.max(1, Math.min(100, Math.round(Number(item.quantity || item.qty || 1))));
    subtotal += unitPrice * qty;
    validatedItems.push({
      gelatoVariantId: item.gelatoVariantId,
      quantity: qty,
      unitPrice,
      designFiles: item.designFiles || [],
      designUrl: item.designUrl || null,
      productName: item.productName || '',
      size: item.size || '',
    });
  }

  let shippingCost = 0;
  const { data: shippingConfig } = await supabase
    .from('shipping_config')
    .select('cost, free_threshold')
    .eq('zone', shippingZone || 'es_peninsula')
    .single();

  if (shippingConfig) {
    const threshold = shippingConfig.free_threshold ? parseFloat(shippingConfig.free_threshold) : null;
    if (threshold && subtotal >= threshold) {
      shippingCost = 0;
    } else {
      shippingCost = parseFloat(shippingConfig.cost) || 0;
    }
  } else {
    shippingCost = 4.95;
  }

  const iva = Math.round(subtotal * 0.21 * 100) / 100;
  const total = Math.round((subtotal + shippingCost + iva) * 100);

  if (total < 50 || total > 500000) {
    return { error: 'Total fora del rang permès (0.50€ - 5000.00€)' };
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shippingCost: Math.round(shippingCost * 100) / 100,
    iva,
    total,
    validatedItems,
  };
}

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: `Method ${event.httpMethod} not allowed` });
  }

  const { allowed } = await checkRateLimit(event, 'payment_intent', {
    maxCount: 10,
    windowSeconds: 60,
  });
  if (!allowed) {
    return jsonResponse(429, { error: 'Massa sol·licituds. Torna-ho a provar en un moment.' });
  }

  try {
    const {
      items,
      shippingZone = 'es_peninsula',
      currency = 'eur',
      email,
      userId,
      metadata = {},
    } = JSON.parse(event.body || '{}');

    if (!items || !Array.isArray(items) || items.length === 0) {
      return jsonResponse(400, { error: 'Falten items' });
    }

    const normCurrency = String(currency).toLowerCase().trim();
    if (normCurrency !== 'eur') {
      return jsonResponse(400, { error: 'Moneda no suportada (només EUR)' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return jsonResponse(500, { error: 'Supabase no configurat' });
    }

    const calc = await calculateServerSideTotal(supabase, items, shippingZone);
    if (calc.error) {
      return jsonResponse(400, { error: calc.error });
    }

    const idempotencyKey = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const crypto = await import('node:crypto');
    const trackingToken = crypto.randomBytes(32).toString('hex');
    const trackingTokenExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        email: email || null,
        user_id: userId || null,
        status: 'pendent',
        items: JSON.stringify(calc.validatedItems),
        subtotal: calc.subtotal,
        shipping_cost: calc.shippingCost,
        iva: calc.iva,
        total: calc.total / 100,
        shipping_zone: shippingZone,
        idempotency_key: idempotencyKey,
        tracking_token: trackingToken,
        tracking_token_expires_at: trackingTokenExpiresAt,
      })
      .select()
      .single();

    if (orderError) {
      console.error('[create-payment-intent] Order creation error:', orderError.message);
      return jsonResponse(500, { error: 'Error creant la comanda' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: calc.total,
      currency: normCurrency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        platform: 'higginsgrafic-web',
        order_id: order.id,
        order_number: order.order_number || '',
        idempotency_key: idempotencyKey,
        ...metadata,
      },
    });

    await supabase
      .from('orders')
      .update({ payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    return jsonResponse(200, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
      orderNumber: order.order_number,
      trackingToken: trackingToken,
      subtotal: calc.subtotal,
      shippingCost: calc.shippingCost,
      iva: calc.iva,
      total: calc.total / 100,
      validatedItems: calc.validatedItems,
    });
  } catch (error) {
    console.error('[create-payment-intent] Error:', error);
    return jsonResponse(500, { error: error.message });
  }
}
