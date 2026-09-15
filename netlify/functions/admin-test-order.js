import { createClient } from '@supabase/supabase-js';
import { jsonResponse } from '../lib/cors.js';
import { verifyAdmin } from '../lib/auth.js';
import { sendOrderEmail } from '../lib/notify.js';
import { quoteShipping } from '../lib/shipping.js';
import { getSiteBase } from '../lib/site-url.js';
import { createInvoice } from './stripe-webhook.js';

/**
 * Genera una comanda de prova, amb la seva factura de prova.
 *
 * PER QUÈ EXISTEIX
 *
 * Per poder provar el circuit sencer —comanda, factura i correu— sense passar
 * per Stripe i sense gastar cap número de la sèrie fiscal. Vegeu
 * `docs/pla-mode-de-proves.md`.
 *
 * QUÈ GARANTEIX
 *
 *   * La comanda neix amb `is_test = true`, i per tant `createInvoice()` no
 *     crida mai `next_invoice_number()`.
 *   * La factura agafa un número `PROVA-AAAA-000000` del comptador de proves.
 *   * NO s'envia res a Gelato: aquí no s'hi crida mai. Una comanda de prova no
 *     ha de costar diners de debò.
 *   * El correu va a TEST_EMAIL, i si no està configurada no s'envia enlloc.
 *   * Només ho pot demanar un administrador.
 *
 * Els imports surten del catàleg de debò (el preu de la variant que es tria) i
 * del mateix `quoteShipping` que fa servir el checkout, perquè la prova passi
 * per les mateixes regles que una compra real. Si s'inventessin els imports, la
 * prova no provaria res: la validació d'imports de la base de dades ha de
 * quadrar amb xifres que siguin de debò.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IVA_RATE = 0.21;
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * L'adreça de proves, la mateixa que fa servir `netlify/lib/email.js` per
 * desviar-hi tots els avisos. Serveix per omplir el camp `email` de la
 * comanda, que a la base de dades no pot ser buit.
 */
function adrecaProves() {
  return String(process.env.TEST_EMAIL || '').replace(/^["']|["']$/g, '').trim();
}

async function triaUnaVariants(supabase) {
  // Es prefereix una variant disponible i amb preu: una peça que es podria
  // vendre de debò.
  const { data, error } = await supabase
    .from('product_variants')
    .select('gelato_variant_id, sku, size, color, price, is_available, product_id')
    .eq('is_available', true)
    .gt('price', 0)
    .limit(50);

  if (error) return { error: error.message };
  const files = Array.isArray(data) ? data : [];
  if (!files.length) return { error: 'No hi ha cap variant disponible al catàleg' };

  // Es queda la que tingui preu i mida conegudes, perquè la factura de prova
  // surti amb conceptes que es puguin llegir.
  const triada = files.find((v) => v.gelato_variant_id && v.size) || files[0];

  const { data: product } = await supabase
    .from('products')
    .select('name, collection')
    .eq('id', triada.product_id)
    .maybeSingle();

  return {
    variant: triada,
    nom: product?.name || 'Samarreta',
    colleccio: product?.collection || null,
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(event, 204, null);
  if (event.httpMethod !== 'POST') return jsonResponse(event, 405, { error: 'Mètode no permès' });

  const { authorized, error: authError } = await verifyAdmin(event);
  if (!authorized) return jsonResponse(event, 401, { error: authError || 'No autoritzat' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return jsonResponse(event, 500, { error: 'Servei no disponible' });
  }

  let cos = {};
  try { cos = JSON.parse(event.body || '{}'); } catch { cos = {}; }
  const quantitat = Math.max(1, Math.min(10, Math.round(Number(cos.quantity) || 1)));
  const zona = String(cos.shippingZone || 'es_peninsula');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const triada = await triaUnaVariants(supabase);
    if (triada.error) return jsonResponse(event, 400, { error: triada.error });

    const { variant, nom, colleccio } = triada;
    const unitPrice = r2(variant.price);
    const subtotalPvp = r2(unitPrice * quantitat);
    const shippingPvp = r2(quoteShipping(zona, quantitat, subtotalPvp));

    // El preu de la botiga ja porta l'IVA i el transport a dins, i es desglossa
    // EXACTAMENT igual que a `create-payment-intent.js` (línies 245-248). Si
    // aquestes tres xifres no sumessin el total, el disparador de validació
    // d'imports de la base de dades aturaria la factura, que és precisament el
    // que ha de fer.
    const total = subtotalPvp;
    const baseShipping = r2(shippingPvp / (1 + IVA_RATE));
    const baseProducts = r2((total - shippingPvp) / (1 + IVA_RATE));
    const iva = r2(total - baseProducts - baseShipping);

    const items = [{
      gelatoVariantId: variant.gelato_variant_id,
      productName: nom,
      name: nom,
      description: 'Comanda de prova',
      collection: colleccio,
      size: variant.size || '',
      color: variant.color || '',
      quantity: quantitat,
      unitPrice,
      price: unitPrice,
      designFiles: [],
    }];

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        // `orders.email` és NOT NULL a la base de dades. S'hi posa l'adreça de
        // proves: és la mateixa a la qual aniran tots els avisos, i així la
        // comanda no queda amb un camp buit que trencaria la inserció.
        // (Això va fer fallar la primera versió d'aquest endpoint amb un
        // 500 «No s'ha pogut crear la comanda de prova» que no deia res.)
        email: adrecaProves() || 'prova@higginsgrafic.local',
        first_name: 'Comanda',
        last_name: 'de prova',
        address: 'Adreça de proves',
        city: 'Cardedeu',
        postal_code: '08440',
        country: 'Espanya',
        status: 'confirmada',
        items: JSON.stringify(items),
        subtotal: baseProducts,
        shipping_cost: baseShipping,
        iva,
        total,
        shipping_zone: zona,
        is_test: true,
      })
      .select()
      .single();

    if (orderError) {
      // Si la columna is_test encara no existeix, AQUESTA funció no ha de
      // crear res: sense la marca, la factura gastaria un número fiscal.
      const faltaMigracio = /is_test/i.test(orderError.message || '');
      console.error('[admin-test-order] No s\'ha pogut crear la comanda:', orderError.message);
      return jsonResponse(event, faltaMigracio ? 409 : 500, {
        error: faltaMigracio
          ? 'Falta executar la migració del mode de proves. No s\'ha creat res.'
          : 'No s\'ha pogut crear la comanda de prova',
      });
    }

    // El nom del client surt al capdamunt de la factura. Si no s'hi posa, la
    // factura de prova sortiria sense nom i no es podria llegir.
    order.customer_name = 'Comanda de prova';

    const factura = await createInvoice(supabase, order);
    if (!factura) {
      return jsonResponse(event, 502, {
        error: 'La comanda s\'ha creat, però no la factura de prova. Comprova que la migració del mode de proves estigui executada.',
        orderId: order.id,
      });
    }

    const siteUrl = String(process.env.SITE_URL || getSiteBase() || '').replace(/\/+$/, '');
    const enllac = factura.access_token ? `${siteUrl}/factura/${factura.access_token}` : null;

    // El correu surt amb `is_test`, i per tant `adrecaDestinataria` el desvia a
    // TEST_EMAIL. Si no n'hi ha, no s'envia a ningú: això és a posta.
    const correu = await sendOrderEmail('order_confirmed', {
      ...order,
      is_test: true,
      invoice: factura,
      invoice_link: enllac,
      email: null,
    });

    return jsonResponse(event, 201, {
      order: { id: order.id, total, is_test: true },
      invoice: { id: factura.id, number: factura.number, access_token: factura.access_token },
      invoiceLink: enllac,
      correuEnviat: !correu?.skipped && !correu?.error,
      correuMotiu: correu?.skipped ? 'TEST_EMAIL no configurada' : (correu?.error || null),
    });
  } catch (error) {
    console.error('[admin-test-order] Error:', error?.message);
    return jsonResponse(event, 500, { error: 'Error intern del servidor' });
  }
}
