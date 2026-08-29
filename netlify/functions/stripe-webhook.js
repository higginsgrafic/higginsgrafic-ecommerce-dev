import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createGelatoOrderServer } from './_gelato.js';
import { sendOrderEmail } from './_email.js';
import { buildTrackingLink } from './_token.js';
import { jsonResponse } from './_cors.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

/**
 * Creació de la comanda a Gelato a partir de la fila d'orders.
 * Idempotent: si ja hi ha gelato_order_id, no fa res.
 * Retorna 'retry' si cal que Stripe reenviï l'esdeveniment, 'ok' o 'skip' altrament.
 */
async function fulfillGelato(supabase, order) {
  if (order.gelato_order_id) {
    console.log('[stripe-webhook] Comanda ja enviada a Gelato:', order.gelato_order_id, '— skip');
    return 'ok';
  }

  try {
    const gelato = await createGelatoOrderServer(order);
    if (gelato.orderId) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ gelato_order_id: gelato.orderId, status: 'en_preparacio' })
        .eq('id', order.id);
      if (updateError) {
        console.error('[stripe-webhook] Error desant gelato_order_id:', updateError.message);
        return 'retry';
      }
      console.log('[stripe-webhook] Comanda creada a Gelato:', gelato.orderId);
      await sendOrderEmail('order_in_production', order);
    }
    return 'ok';
  } catch (err) {
    if (err.code === 'NO_API_KEY') {
      console.warn('[stripe-webhook] GELATO_API_KEY no configurada — fulfillment manual:', err.message);
      return 'skip';
    }
    if (err.code === 'NO_VALID_ITEMS' || err.code === 'GELATO_DATA_ERROR') {
      // Error de dades: reintentar no ho solucionarà. La comanda queda 'confirmada'
      // sense gelato_order_id → cal gestió manual (visible a l'admin).
      console.error('[stripe-webhook] Gelato rebutja la comanda (manual):', err.message);
      return 'skip';
    }
    // Error de xarxa/Gelato caigut: respondre 500 perquè Stripe reintenti
    console.error('[stripe-webhook] Error creant comanda Gelato (es reintentarà):', err.message);
    return 'retry';
  }
}

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(event, 200, {}, { methods: 'POST, OPTIONS', headers: 'Content-Type, Stripe-Signature' });
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(event, 405, { error: `Method ${event.httpMethod} not allowed` }, { methods: 'POST, OPTIONS', headers: 'Content-Type, Stripe-Signature' });
  }

  const sig = event.headers['stripe-signature'];
  if (!sig || !WEBHOOK_SECRET) {
    return jsonResponse(event, 400, { error: 'Falta Stripe-Signature o webhook secret' }, { methods: 'POST, OPTIONS', headers: 'Content-Type, Stripe-Signature' });
  }

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err.message);
    return jsonResponse(event, 400, { error: 'Webhook signature verification failed' }, { methods: 'POST, OPTIONS', headers: 'Content-Type, Stripe-Signature' });
  }

  const supabase = getSupabase();

  // Idempotency: check if this event has already been processed
  if (supabase) {
    const { data: existingEvent } = await supabase
      .from('processed_stripe_events')
      .select('id, result')
      .eq('event_id', stripeEvent.id)
      .single();

    if (existingEvent) {
      console.log('[stripe-webhook] Event already processed:', stripeEvent.id, '— skip');
      return jsonResponse(event, 200, { received: true, duplicate: true }, { methods: 'POST, OPTIONS', headers: 'Content-Type, Stripe-Signature' });
    }
  }

  try {
    let processResult = { ok: true };

    switch (stripeEvent.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = stripeEvent.data.object;
        console.log('[stripe-webhook] Payment succeeded:', paymentIntent.id);

        if (supabase) {
          const { data, error } = await supabase
            .from('orders')
            .update({ status: 'confirmada' })
            .eq('payment_intent_id', paymentIntent.id)
            .select()
            .single();

          if (error) {
            console.error('[stripe-webhook] Error updating order:', error.message);
            processResult = { ok: false, error: error.message };
          } else if (data) {
            console.log('[stripe-webhook] Order updated to confirmada:', data.order_number || data.id);
            const enrichedData = {
              ...data,
              tracking_link: paymentIntent.metadata?.tracking_link || null,
            };
            await sendOrderEmail('order_confirmed', enrichedData);
            const result = await fulfillGelato(supabase, enrichedData);
            if (result === 'retry') {
              processResult = { ok: false, error: 'Gelato fulfillment pendent de reintent' };
            }
          } else {
            console.log('[stripe-webhook] No order found with payment_intent_id:', paymentIntent.id);
          }
        } else {
          console.warn('[stripe-webhook] Supabase not configured, skipping order update');
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = stripeEvent.data.object;
        console.log('[stripe-webhook] Payment failed:', paymentIntent.id);

        if (supabase) {
          const { error: failError } = await supabase
            .from('orders')
            .update({ status: 'cancel_lada' })
            .eq('payment_intent_id', paymentIntent.id);

          if (failError) {
            console.error('[stripe-webhook] Error updating failed order:', failError.message);
          } else {
            console.log('[stripe-webhook] Order marked as cancel_lada for PI:', paymentIntent.id);
          const { data: failData } = await supabase
            .from('orders')
            .select()
            .eq('payment_intent_id', paymentIntent.id)
            .single();
          if (failData) {
            await sendOrderEmail('order_failed', failData);
          }
          }
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = stripeEvent.data.object;
        console.log('[stripe-webhook] Payment canceled:', paymentIntent.id);
        break;
      }

      default:
        console.log('[stripe-webhook] Unhandled event type:', stripeEvent.type);
    }

    // Record the processed event for idempotency
    if (supabase) {
      await supabase
        .from('processed_stripe_events')
        .insert({
          event_id: stripeEvent.id,
          event_type: stripeEvent.type,
          payment_intent_id: stripeEvent.data?.object?.id || null,
          result: processResult,
        });
    }

    if (!processResult.ok) {
      return jsonResponse(event, 500, { error: 'Error processant l\'esdeveniment' }, { methods: 'POST, OPTIONS', headers: 'Content-Type, Stripe-Signature' });
    }

    return jsonResponse(event, 200, { received: true }, { methods: 'POST, OPTIONS', headers: 'Content-Type, Stripe-Signature' });
  } catch (error) {
    console.error('[stripe-webhook] Error processing event:', error);
    return jsonResponse(event, 500, { error: 'Error intern del servidor' }, { methods: 'POST, OPTIONS', headers: 'Content-Type, Stripe-Signature' });
  }
}
