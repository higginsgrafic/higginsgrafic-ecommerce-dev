import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '../lib/rate-limit.js';
import { generateTrackingToken, hashToken, getTokenExpiry, buildTrackingLink } from '../lib/token.js';
import { jsonResponse } from '../lib/cors.js';
import { quoteShipping } from '../lib/shipping.js';

// El client de Stripe es crea quan realment es necessita, no en carregar el
// fitxer. Si es creava a dalt de tot i faltava STRIPE_SECRET_KEY, la funció
// SENCERA no arrencava (502 ImportModuleError), cosa que va deixar el
// pagament inservible sense cap missatge clar.
let _stripe = null;

function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY no configurada');
    _stripe = new Stripe(key);
  }
  return _stripe;
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

/**
 * Neteja un camp de text provinent del client abans de desar-lo.
 * Retorna null si és buit, i retalla per evitar valors desmesurats.
 */
function cleanText(value, maxLen = 200) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, maxLen);
}

/**
 * Extreu i valida les dades d'enviament que arriben del checkout.
 * Són imprescindibles perquè Gelato pugui fabricar i enviar la comanda:
 * sense elles, el fulfillment falla i la comanda queda aturada.
 */
function parseShipping(shipping) {
  const s = shipping && typeof shipping === 'object' ? shipping : {};
  return {
    first_name: cleanText(s.firstName, 100),
    last_name: cleanText(s.lastName, 100),
    address: cleanText(s.address, 200),
    address2: cleanText(s.address2, 200),
    city: cleanText(s.city, 100),
    postal_code: cleanText(s.postalCode, 20),
    country: cleanText(s.country, 60) || 'Espanya',
    phone: cleanText(s.phone, 40),
  };
}

// El cistell del mega-slide no guarda el `gelatoVariantId`: treballa amb dades
// de disseny (ruta del producte, talla i color). Aquí es resolen les variants
// contra la base de dades, que és on viu l'identificador de Gelato.
//
// Els noms no coincideixen exactament entre les dues bandes:
//   talles: el formulari ofereix 'XXL', la BD fa servir '2XL'
//   colors: el formulari envia 'light-blue', la BD diu 'Light Blue'
// Per això es normalitzen abans de comparar.
const SIZE_ALIASES = { XXL: '2XL', XXXL: '3XL' };

/**
 * Noms de color que ensenya la botiga → noms que fa servir el catàleg.
 *
 * La fitxa de producte ensenya els colors en català perquè el client els
 * entengui ('Negre', 'Blanc', 'Vermell', 'Militar', 'Forest'), però el
 * catàleg els guarda amb el nom original de Gelato ('Black', 'White', 'Red',
 * 'Military Green', 'Forest Green').
 *
 * Sense aquesta correspondència passava el següent: el client triava 'Negre',
 * el servidor buscava una variant de color 'Negre', no en trobava cap i el
 * pagament fallava amb "No s'ha pogut identificar la variant de Gelato".
 * És a dir: no es podia comprar ni una samarreta negra ni una de blanca.
 *
 * Els altres colors del catàleg (Royal, Navy, Daisy, Gold, Purple, Light Blue,
 * Light Pink, Irish Green, kiwi) ja coincideixen i no necessiten res.
 */
const COLOR_ALIASES = {
  negre: 'black',
  blanc: 'white',
  vermell: 'red',
  militar: 'militarygreen',
  forest: 'forestgreen',
};

export function normalizeSize(value) {
  const v = String(value == null ? '' : value).trim().toUpperCase().replace(/\s+/g, '');
  return SIZE_ALIASES[v] || v;
}

export function normalizeColor(value) {
  const base = String(value == null ? '' : value).toLowerCase().replace(/[\s_-]+/g, '');
  return COLOR_ALIASES[base] || base;
}

/**
 * Construeix els índexs per resoldre la variant de Gelato de cada article.
 * Retorna { byGelatoId, bySlugKey }.
 */
async function buildVariantIndex(supabase, items) {
  const directIds = [...new Set(items.map((i) => i.gelatoVariantId).filter(Boolean))];
  const slugs = [...new Set(items.map((i) => i.productSlug).filter(Boolean))];

  const byGelatoId = new Map();
  const bySlugKey = new Map();

  if (directIds.length > 0) {
    const { data, error } = await supabase
      .from('product_variants')
      .select('gelato_variant_id, price')
      .in('gelato_variant_id', directIds);
    if (error) return { error: 'No s\'han pogut obtenir els preus dels productes' };
    for (const v of data || []) {
      if (!v.gelato_variant_id) continue;
      byGelatoId.set(v.gelato_variant_id, {
        gelatoVariantId: v.gelato_variant_id,
        unitPrice: parseFloat(v.price) || 0,
      });
    }
  }

  if (slugs.length > 0) {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, slug')
      .in('slug', slugs);

    if (productsError) return { error: 'No s\'han pogut obtenir els preus dels productes' };

    const slugById = new Map((products || []).map((p) => [p.id, p.slug]));
    const productIds = [...slugById.keys()];

    if (productIds.length > 0) {
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('product_id, gelato_variant_id, size, color, price')
        .in('product_id', productIds);

      if (variantsError) return { error: 'No s\'han pogut obtenir els preus dels productes' };

      for (const v of variants || []) {
        const slug = slugById.get(v.product_id);
        if (!slug || !v.gelato_variant_id) continue;
        bySlugKey.set(`${slug}|${normalizeSize(v.size)}|${normalizeColor(v.color)}`, {
          gelatoVariantId: v.gelato_variant_id,
          unitPrice: parseFloat(v.price) || 0,
        });
      }
    }
  }

  return { byGelatoId, bySlugKey };
}

async function calculateServerSideTotal(supabase, items, shippingZone) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { error: 'Items no vàlids' };
  }

  const { byGelatoId, bySlugKey, error: variantError } = await buildVariantIndex(supabase, items);
  if (variantError) {
    return { error: variantError };
  }

  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    // 1) Si el client ja envia l'identificador de Gelato, es fa servir.
    let resolved = item.gelatoVariantId ? byGelatoId.get(item.gelatoVariantId) : null;

    // 2) Si no, es resol per producte + talla + color.
    if (!resolved && item.productSlug) {
      resolved = bySlugKey.get(
        `${item.productSlug}|${normalizeSize(item.size)}|${normalizeColor(item.color)}`
      );
    }

    if (!resolved) {
      const ref = item.productSlug || item.gelatoVariantId || 'desconeguda';
      return {
        error: `No s'ha pogut identificar la variant de Gelato (${ref}, talla ${item.size || '?'}, color ${item.color || '?'})`,
      };
    }

    const unitPrice = resolved.unitPrice;
    const qty = Math.max(1, Math.min(100, Math.round(Number(item.quantity || item.qty || 1))));
    subtotal += unitPrice * qty;
    validatedItems.push({
      gelatoVariantId: resolved.gelatoVariantId,
      quantity: qty,
      unitPrice,
      designFiles: item.designFiles || [],
      designUrl: item.designUrl || null,
      productName: item.productName || '',
      size: item.size || '',
      // Àlies per compatibilitat: els consumidors dels items desats (correu
      // d'ItemsTable, OrderConfirmationLayout, OrderTrackingPage) llegeixen
      // `name` i `price`, no `productName`/`unitPrice`. Sense això, els
      // correus i la confirmació mostraven "Producte" i 0,00 €.
      name: item.productName || '',
      price: unitPrice,
    });
  }

  // El transport s'ha de calcular EXACTAMENT igual que al client
  // (src/hooks/useShippingCosts.js). Abans es consultava `shipping_config`
  // per zona, però el formulari envia el nom del país ('Espanya'), que no
  // coincideix amb cap clau de zona: la consulta no retornava res i sempre
  // s'aplicava el preu de fallback. El comprador veia un import i se li'n
  // cobrava un altre.
  const totalQuantity = validatedItems.reduce((n, item) => n + item.quantity, 0);
  const shippingCost = quoteShipping(shippingZone, totalQuantity, subtotal);

  // El transport va INCLÒS dins del preu de la botiga: no s'afegeix mai al
  // total. Es continua cotitzant perquè forma part del desglossament (és una de
  // les ratlles que veu el client al checkout).
  // Preus i transport són PVP (IVA 21% inclòs). No afegim IVA a sobre del total.
  const subtotalPvp = Math.round(subtotal * 100) / 100;
  const shippingPvp = Math.round(shippingCost * 100) / 100;
  const totalEur = Math.round(subtotalPvp * 100) / 100;
  const totalCents = Math.round(totalEur * 100);

  // Desglossament EXACTAMENT igual que al client (CheckoutContent).
  //
  // El preu de la botiga porta l'IVA inclòs, TAMBÉ el de l'enviament. Perquè
  // la ratlla d'IVA inclogui l'IVA de tot (producte + enviament) i les tres
  // xifres sumin el total, el transport es desglossa sense IVA:
  //   base      = (total − transport) / 1,21
  //   transport = transport / 1,21
  //   iva       = total − base − transport
  // El que es cobra no canvia mai: continua sent el total.
  const IVA_RATE = 0.21;
  const shippingNet = Math.round((shippingPvp / (1 + IVA_RATE)) * 100) / 100;
  const baseImponible = Math.round(((totalEur - shippingPvp) / (1 + IVA_RATE)) * 100) / 100;
  const iva = Math.round((totalEur - baseImponible - shippingNet) * 100) / 100;

  if (totalCents < 50 || totalCents > 500000) {
    return { error: 'Total fora del rang permès (0.50€ - 5000.00€)' };
  }

  return {
    // El que es desa a la comanda: les tres parts sumen el total.
    subtotal: baseImponible,        // sense transport i sense IVA
    shippingCost: shippingNet,      // el transport sense IVA (aixi el desglossament suma)
    shippingPvp,                    // el transport amb IVA, tal com el veu el client
    subtotalPvp,                    // la suma dels preus de la botiga
    shippingQuoted: shippingNet,
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
      shipping = {},
      invoice = {},
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

    // Dades de facturació (empresa i CIF), si el client ha demanat factura.
    // També van a les metadades de Stripe, però el generador de factures
    // llegeix aquesta taula: amb això sap si el títol ha de dir "FACTURA" o
    // "FACTURA SIMPLIFICADA" i quin CIF hi ha de sortir.
    const cifFactura = cleanText(invoice?.taxId, 40);
    const dadesFactura = {
      invoice_company: cleanText(invoice?.company, 150) || null,
      invoice_tax_id: cifFactura || null,
      // Tipus de document, explicit: amb CIF es factura normal; sense, la
      // simplificada que toca a tota venda. Aixi el generador no ho ha de deduir.
      invoice_type: cifFactura ? 'full' : 'simplified',
    };

    const dadesComanda = {
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
      ...dadesFactura,
      ...parseShipping(shipping),
    };

    // Si la migració de les columnes de factura encara no s'ha executat, la
    // inserció fallaria i el client no podria pagar. En aquest cas es repeteix
    // sense aquestes dues dades: es perd el CIF, però la venda no es trenca.
    let { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(dadesComanda)
      .select()
      .single();

    if (orderError && /invoice_company|invoice_tax_id|invoice_type/i.test(orderError.message || '')) {
      console.warn('[create-payment-intent] Les columnes de factura encara no existeixen; es desa la comanda sense empresa ni CIF.');
      const senseFactura = { ...dadesComanda };
      delete senseFactura.invoice_company;
      delete senseFactura.invoice_tax_id;
      delete senseFactura.invoice_type;
      ({ data: order, error: orderError } = await supabase
        .from('orders')
        .insert(senseFactura)
        .select()
        .single());
    }

    if (orderError) {
      console.error('[create-payment-intent] Order creation error:', orderError.message);
      return jsonResponse(event, 500, { error: 'Error creant la comanda' });
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: calc.total,
      currency: normCurrency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        platform: 'higginsgrafic-web',
        order_id: order.id,
        order_number: order.order_number || '',
        idempotency_key: idempotencyKey,
        tracking_link: trackingLink,
        // Dades de facturació B2B: el checkout les demanava (empresa i CIF) i
        // s'acabaven llençant, així que el comerciant no podia emetre factura.
        // Ara també es desen a la comanda (`invoice_company` i `invoice_tax_id`);
        // aquí es dupliquen perquè es vegin al panell de Stripe.
        ...(cleanText(invoice?.company, 150) ? { invoice_company: cleanText(invoice.company, 150) } : {}),
        ...(cleanText(invoice?.taxId, 40) ? { invoice_tax_id: cleanText(invoice.taxId, 40) } : {}),
        ...metadata,
      },
    });

    // El vincle comanda ↔ PaymentIntent és imprescindible: el webhook de
    // Stripe busca la comanda per `payment_intent_id`. Si aquest update falla
    // i no es comprova, el client paga, Stripe confirma, el webhook no troba
    // cap fila i la comanda queda 'pendent' per sempre sense fabricar-se.
    // Val més aturar el pagament aquí que cobrar sense poder servir.
    const { error: linkError } = await supabase
      .from('orders')
      .update({ payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    if (linkError) {
      console.error('[create-payment-intent] No s\'ha pogut vincular el PaymentIntent a la comanda:', linkError.message);
      return jsonResponse(event, 500, { error: 'Error preparant el pagament. Torna-ho a provar.' });
    }

    return jsonResponse(event, 200, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
      orderNumber: order.order_number,
      trackingToken: rawTrackingToken,
      subtotal: calc.subtotal,
      subtotalPvp: calc.subtotalPvp,
      shippingCost: calc.shippingCost,
      shippingPvp: calc.shippingPvp,
      shippingQuoted: calc.shippingQuoted,
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
