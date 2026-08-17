import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createGelatoOrderServer } from './_gelato.js';
import { sendOrderEmail } from './_email.js';

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

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    },
    body: JSON.stringify(body),
  };
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
    return jsonResponse(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: `Method ${event.httpMethod} not allowed` });
  }

  const sig = event.headers['stripe-signature'];
  if (!sig || !WEBHOOK_SECRET) {
    return jsonResponse(400, { error: 'Falta Stripe-Signature o webhook secret' });
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
    return jsonResponse(400, { error: `Webhook signature verification failed: ${err.message}` });
  }

  try {
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = stripeEvent.data.object;
        console.log('[stripe-webhook] Payment succeeded:', paymentIntent.id);

        const supabase = getSupabase();
        if (supabase) {
          const { data, error } = await supabase
            .from('orders')
            .update({ status: 'confirmada' })
            .eq('payment_intent_id', paymentIntent.id)
            .select()
            .single();

          if (error) {
            console.error('[stripe-webhook] Error updating order:', error.message);
          } else if (data) {
            console.log('[stripe-webhook] Order updated to confirmada:', data.order_number || data.id);
            await sendOrderEmail('order_confirmed', data);
            const result = await fulfillGelato(supabase, data);
            if (result === 'retry') {
              return jsonResponse(500, { error: 'Gelato fulfillment pendent de reintent' });
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

        const supabaseFail = getSupabase();
        if (supabaseFail) {
          const { error: failError } = await supabaseFail
            .from('orders')
            .update({ status: 'cancel_lada' })
            .eq('payment_intent_id', paymentIntent.id);

          if (failError) {
            console.error('[stripe-webhook] Error updating failed order:', failError.message);
          } else {
            console.log('[stripe-webhook] Order marked as cancel_lada for PI:', paymentIntent.id);
          const { data: failData } = await supabaseFail
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

    return jsonResponse(200, { received: true });
  } catch (error) {
    console.error('[stripe-webhook] Error processing event:', error);
    return jsonResponse(500, { error: error.message });
  }
}
