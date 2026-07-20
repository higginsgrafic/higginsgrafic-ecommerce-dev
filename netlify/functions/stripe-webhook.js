import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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
