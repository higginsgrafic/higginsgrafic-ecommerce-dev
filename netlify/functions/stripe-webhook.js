import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createGelatoOrderServer } from '../lib/gelato.js';
import { sendOrderEmail } from '../lib/notify.js';
import { buildTrackingLink } from '../lib/token.js';
import { jsonResponse } from '../lib/cors.js';

// El client de Stripe es crea quan realment es necessita, no en carregar el
// fitxer. Si es creava a dalt de tot i faltava STRIPE_SECRET_KEY, la funció
// SENCERA no arrencava (502 ImportModuleError) i no podia ni tan sols
// retornar un error entenedor: Stripe reenviava l'avís una i una altra vegada
// i la comanda no es confirmava mai.
let _stripe = null;

function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY no configurada');
    _stripe = new Stripe(key);
  }
  return _stripe;
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Estem en mode de proves de Stripe?
 *
 * Les claus de prova comencen per `sk_test_` i les de debò per `sk_live_`.
 *
 * PER QUÈ IMPORTA: si s'envia una comanda de prova a Gelato, es crea una
 * comanda de producció REAL i costa diners de debò (Gelato imprimeix i envia
 * el producte). Passa molt fàcilment: es fa una compra de prova amb una
 * targeta de prova, Stripe considera el pagament correcte, dispara aquest
 * webhook i la comanda acaba a la impremta.
 *
 * Per això, amb claus de proves no s'hi envia res. Quan es canviïn les claus
 * per les de producció, el bloqueig desapareix tot sol: no hi ha cap
 * interruptor que algú pugui oblidar-se de canviar.
 */
const MODE_PROVES_STRIPE = String(process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test_');

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
/**
 * Crea la factura de la comanda, amb el seu número correlatiu.
 *
 * Desa una COPIA del que surt al document (client, línies i imports): si demà
 * canvia l'adreça del client o el preu d'un producte, la factura d'avui
 * continua dient el mateix. El número ve de `next_invoice_number()`, que és
 * correlatiu i no repeteix mai.
 *
 * Retorna null si no s'ha pogut crear (i la venda continua endavant igualment:
 * una factura es pot refer, una venda perduda no).
 */
export async function createInvoice(supabase, order) {
  try {
    // Si la taula encara no existeix (migració pendent), no cremem cap número.
    const { error: taulaError } = await supabase.from('invoices').select('id').limit(1);
    if (taulaError) {
      console.warn('[stripe-webhook] La taula de factures encara no existeix; no es genera factura.');
      return null;
    }

    const { data: number, error: numError } = await supabase.rpc('next_invoice_number');
    if (numError || !number) {
      console.warn('[stripe-webhook] No s\'ha pogut obtenir el número de factura:', numError?.message);
      return null;
    }

    let items = order.items;
    if (typeof items === 'string') {
      try { items = JSON.parse(items); } catch { items = []; }
    }
    if (!Array.isArray(items)) items = [];

    const total = Number(order.total) || 0;
    const iva = Number(order.iva) || 0;
    const baseShipping = Number(order.shipping_cost) || 0;
    const baseProducts = order.subtotal != null
      ? Number(order.subtotal)
      : Math.round((total - iva - baseShipping) * 100) / 100;

    const nom = [order.first_name, order.last_name].filter(Boolean).join(' ').trim();

    const { data: invoice, error: insError } = await supabase
      .from('invoices')
      .insert({
        number,
        invoice_type: order.invoice_tax_id ? 'full' : 'simplified',
        order_id: order.id,
        order_number: order.order_number || null,
        user_id: order.user_id || null,
        customer_name: nom || null,
        customer_email: order.email || null,
        customer_tax_id: order.invoice_tax_id || null,
        customer_company: order.invoice_company || null,
        customer_address: order.address || null,
        customer_address2: order.address2 || null,
        customer_city: order.city || null,
        customer_postal_code: order.postal_code || null,
        customer_country: order.country || null,
        base_products: baseProducts,
        base_shipping: baseShipping,
        iva,
        total,
        items,
      })
      .select()
      .single();

    if (insError) {
      console.warn('[stripe-webhook] Error desant la factura:', insError.message);
      return null;
    }

    console.log('[stripe-webhook] Factura creada:', number);
    return invoice;
  } catch (err) {
    console.warn('[stripe-webhook] Error creant la factura:', err?.message);
    return null;
  }
}

async function fulfillGelato(supabase, order) {
  if (MODE_PROVES_STRIPE) {
    console.warn(
      '[stripe-webhook] MODE DE PROVES (clau sk_test_): la comanda NO s\'envia a Gelato. ' +
      'Enviar-la crearia una comanda de producció real i costaria diners.'
    );
    return 'skip';
  }

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

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[stripe-webhook] STRIPE_SECRET_KEY no configurada — no es pot verificar la signatura');
    return jsonResponse(event, 500, { error: 'Passarel·la de pagament no configurada' }, { methods: 'POST, OPTIONS', headers: 'Content-Type, Stripe-Signature' });
  }

  let stripeEvent;

  try {
    stripeEvent = getStripe().webhooks.constructEvent(
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
    // maybeSingle(): la primera vegada no hi ha cap fila i això és normal, no
    // un error. Amb single() Supabase peta i el codi depenia d'ignorar
    // l'error per funcionar.
    const { data: existingEvent } = await supabase
      .from('processed_stripe_events')
      .select('id, result')
      .eq('event_id', stripeEvent.id)
      .maybeSingle();

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
          // maybeSingle(): si no hi ha cap comanda amb aquest pagament, no és
          // cap error, simplement no n'hi ha. Amb single() Supabase peta amb
          // "Cannot coerce the result to a single JSON object", la funció
          // responia 500 i Stripe tornava a enviar l'avís una i una altra
          // vegada durant dies, sense poder-lo resoldre mai.
          const { data, error } = await supabase
            .from('orders')
            .update({ status: 'confirmada' })
            .eq('payment_intent_id', paymentIntent.id)
            .select()
            .maybeSingle();

          if (error) {
            console.error('[stripe-webhook] Error updating order:', error.message);
            processResult = { ok: false, error: error.message };
          } else if (data) {
            console.log('[stripe-webhook] Order updated to confirmada:', data.order_number || data.id);
            const factura = await createInvoice(supabase, data);
            const siteUrl = String(process.env.SITE_URL || '').replace(/\/+$/, '');
            const enrichedData = {
              ...data,
              tracking_link: paymentIntent.metadata?.tracking_link || null,
              invoice: factura || null,
              // Enllac public de la factura. Nome s si hi ha testimoni d'acces:
              // sense ell l'enllac no portaria enlloc.
              invoice_link: factura?.access_token ? `${siteUrl}/factura/${factura.access_token}` : null,
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
            // maybeSingle() pel mateix motiu que més amunt: potser no hi ha
            // cap comanda amb aquest pagament, i això no és cap error.
            const { data: failData } = await supabase
              .from('orders')
              .select()
              .eq('payment_intent_id', paymentIntent.id)
              .maybeSingle();
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

    // Registrem l'esdeveniment com a processat NOMÉS si ha anat bé.
    //
    // BUG CORREGIT: abans s'inseria sempre, també quan tot seguit es retornava
    // un 500 per demanar a Stripe que reintentés. Com que la comprovació
    // d'idempotència del principi busca per event_id, el reintent es detectava
    // com a duplicat i se saltava: una comanda que fallava per xarxa en el
    // fulfillment a Gelato no s'hi tornava a enviar mai de forma automàtica.
    if (supabase && processResult.ok) {
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
