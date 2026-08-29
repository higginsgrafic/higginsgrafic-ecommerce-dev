import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from './_rate-limit.js';
import { generateTrackingToken, hashToken, getTokenExpiry, buildTrackingLink } from './_token.js';
import { jsonResponse } from './_cors.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
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

  // Preus i transport són PVP (IVA 21% inclòs). No afegim IVA a sobre del total.
  const subtotalPvp = Math.round(subtotal * 100) / 100;
  const shippingPvp = Math.round(shippingCost * 100) / 100;
  const totalEur = Math.round((subtotalPvp + shippingPvp) * 100) / 100;
  const totalCents = Math.round(totalEur * 100);

  // Desglossament d'IVA 21% (base imposable + quota d'IVA)
  const baseImponible = Math.round((totalEur / 1.21) * 100) / 100;
  const iva = Math.round((totalEur - baseImponible) * 100) / 100;

  if (totalCents < 50 || totalCents > 500000) {
    return { error: 'Total fora del rang permès (0.50€ - 5000.00€)' };
  }

  return {
    subtotal: subtotalPvp,
    shippingCost: shippingPvp,
    baseImponible,
    iva,
    total: totalCents,
    totalEur,
    validatedItems,
  };
}

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(event, 200, {}, { methods: 'POST, OPTIONS' });
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(event, 405, { error: `Method ${event.httpMethod} not allowed` }, { methods: 'POST, OPTIONS' });
  }

  const { allowed } = await checkRateLimit(event, 'payment_intent', {
    maxCount: 10,
    windowSeconds: 60,
  });
  if (!allowed) {
    return jsonResponse(event, 429, { error: 'Massa sol·licituds. Torna-ho a provar en un moment.' });
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
      return jsonResponse(event, 400, { error: 'Falten items' });
    }

    const normCurrency = String(currency).toLowerCase().trim();
    if (normCurrency !== 'eur') {
      return jsonResponse(event, 400, { error: 'Moneda no suportada (només EUR)' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return jsonResponse(event, 500, { error: 'Supabase no configurat' });
    }

    const calc = await calculateServerSideTotal(supabase, items, shippingZone);
    if (calc.error) {
      return jsonResponse(event, 400, { error: calc.error });
    }

    const idempotencyKey = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const rawTrackingToken = generateTrackingToken();
    const trackingTokenHash = hashToken(rawTrackingToken);
    const trackingTokenExpiresAt = getTokenExpiry(parseInt(process.env.TRACKING_TOKEN_EXPIRY_DAYS || '90', 10));
    const trackingLink = buildTrackingLink(process.env.SITE_URL, rawTrackingToken);

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
        tracking_token_hash: trackingTokenHash,
        tracking_token_expires_at: trackingTokenExpiresAt,
      })
      .select()
      .single();

    if (orderError) {
      console.error('[create-payment-intent] Order creation error:', orderError.message);
      return jsonResponse(event, 500, { error: 'Error creant la comanda' });
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
        tracking_link: trackingLink,
        ...metadata,
      },
    });

    await supabase
      .from('orders')
      .update({ payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    return jsonResponse(event, 200, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
      orderNumber: order.order_number,
      trackingToken: rawTrackingToken,
      subtotal: calc.subtotal,
      shippingCost: calc.shippingCost,
      baseImponible: calc.baseImponible,
      iva: calc.iva,
      total: calc.total / 100,
      validatedItems: calc.validatedItems,
    });
  } catch (error) {
    console.error('[create-payment-intent] Error:', error);
    return jsonResponse(event, 500, { error: 'Error intern del servidor' });
  }
}
