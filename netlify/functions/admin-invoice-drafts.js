import { createClient } from '@supabase/supabase-js';
import { jsonResponse } from '../lib/cors.js';
import { verifyAdmin } from '../lib/auth.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IVA_RATE = 0.21;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const r2 = (value) => Math.round((Number(value) || 0) * 100) / 100;
const text = (value, max = 200) => String(value ?? '').trim().slice(0, max) || null;

export function normalizeDraft(input = {}) {
  const documentKind = input.document_kind === 'rectification' ? 'rectification' : 'invoice';
  const invoiceType = input.invoice_type === 'full' ? 'full' : 'simplified';
  const rectifiesInvoiceId = UUID_RE.test(String(input.rectifies_invoice_id || ''))
    ? String(input.rectifies_invoice_id)
    : null;
  const items = (Array.isArray(input.items) ? input.items : []).slice(0, 100).map((item) => ({
    name: text(item.name, 300),
    description: text(item.description, 500),
    quantity: Math.min(999, Math.max(1, Math.trunc(Number(item.quantity) || 1))),
    product_price: r2(item.product_price ?? item.price),
  })).filter((item) => item.name && Number.isFinite(item.product_price));
  const shippingTotal = r2(input.shipping_total);
  const productsTotal = r2(items.reduce((sum, item) => sum + item.product_price * item.quantity, 0));
  const total = r2(productsTotal + shippingTotal);
  const baseProducts = r2(productsTotal / (1 + IVA_RATE));
  const baseShipping = r2(shippingTotal / (1 + IVA_RATE));
  const iva = r2(total - baseProducts - baseShipping);

  if (documentKind === 'invoice' && (items.some((item) => item.product_price < 0) || shippingTotal < 0)) {
    throw new Error('Una factura nova no pot tenir imports negatius');
  }

  return {
    invoice_type: invoiceType,
    document_kind: documentKind,
    rectifies_invoice_id: rectifiesInvoiceId,
    correction_reason: documentKind === 'rectification' ? text(input.correction_reason, 500) : null,
    order_number: text(input.order_number, 80),
    customer_name: text(input.customer_name, 200),
    customer_email: text(input.customer_email, 254),
    customer_tax_id: text(input.customer_tax_id, 40),
    customer_company: text(input.customer_company, 200),
    customer_address: text(input.customer_address, 300),
    customer_address2: text(input.customer_address2, 300),
    customer_city: text(input.customer_city, 150),
    customer_postal_code: text(input.customer_postal_code, 30),
    customer_country: text(input.customer_country, 100),
    base_products: baseProducts,
    base_shipping: baseShipping,
    shipping_total: shippingTotal,
    iva,
    total,
    items,
    // La marca de prova ve SEMPRE del cos de la petició, mai es dedueix del
    // contingut: si es deduís, un esborrany amb el correu «de prova» d'algú
    // podria acabar sense número fiscal. I l'endpoint comprova abans que qui
    // ho demana és administrador.
    is_test: input.is_test === true,
    updated_at: new Date().toISOString(),
  };
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || '{}');
  } catch {
    return null;
  }
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(event, 204, null, { methods: 'GET, POST, PATCH, DELETE, OPTIONS' });
  }
  const { authorized, error: authError } = await verifyAdmin(event);
  if (!authorized) return jsonResponse(event, 401, { error: authError || 'No autoritzat' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return jsonResponse(event, 500, { error: 'Servei no disponible' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const id = event.queryStringParameters?.id;
  // Mode de proves: la pantalla de proves demana els seus esborranys i la de
  // debò els seus. El filtre és explícit en tots dos sentits, i per defecte es
  // treballa en mode de debò: mai es barregen.
  const modeProves = event.queryStringParameters?.mode === 'test';

  if (event.httpMethod === 'GET') {
    let query = supabase.from('invoice_drafts').select('*').order('updated_at', { ascending: false });
    if (id) query = query.eq('id', id).maybeSingle();
    // Els esborranys antics (anteriors a la columna) compten com de debò.
    else query = (modeProves ? query.eq('is_test', true) : query.or('is_test.eq.false,is_test.is.null')).eq('status', 'draft').limit(500);
    const { data, error } = await query;
    if (error) return jsonResponse(event, 500, { error: 'No s’han pogut carregar els esborranys' });
    return jsonResponse(event, 200, id ? { draft: data } : { drafts: data || [], testMode: modeProves });
  }

  const body = parseBody(event);
  if (!body) return jsonResponse(event, 400, { error: 'Cos de la petició no vàlid' });

  /**
   * Comprova que un esborrany sigui del tipus que la pantalla espera.
   *
   * Les pantalles ja estan separades, i la base de dades impedeix emetre una
   * factura de debò des d'un esborrany de prova (`invoice_drafts_coherencia`).
   * Però si l'endpoint de debò rep un esborrany de prova, l'error que surt és el
   * del motor, que no explica res. Aquí es digue qui és i on ha d'anar.
   *
   * Retorna una resposta si hi ha error, o null si tot està bé.
   */
  const comprovaMode = async (draftId) => {
    const { data, error } = await supabase
      .from('invoice_drafts')
      .select('id, is_test, status')
      .eq('id', draftId)
      .maybeSingle();
    if (error) return jsonResponse(event, 500, { error: 'No s’ha pogut comprovar l’esborrany' });
    if (!data) return jsonResponse(event, 404, { error: 'Esborrany no trobat' });
    const esDeProva = data.is_test === true;
    if (esDeProva !== modeProves) {
      return jsonResponse(event, 409, {
        error: esDeProva
          ? 'Aquest esborrany és una prova: s’ha d’emetre des de la pantalla de proves.'
          : 'Aquest esborrany és una factura de debò: s’ha d’emetre des de la pantalla de factures.',
      });
    }
    return null;
  };

  if (event.httpMethod === 'POST' && body.action === 'issue') {
    if (!UUID_RE.test(String(body.id || ''))) return jsonResponse(event, 400, { error: 'Esborrany no vàlid' });
    const errorMode = await comprovaMode(body.id);
    if (errorMode) return errorMode;
    const { data, error } = await supabase.rpc('issue_invoice_draft', { p_draft_id: body.id });
    if (error) return jsonResponse(event, 400, { error: error.message || 'No s’ha pogut emetre la factura' });
    return jsonResponse(event, 200, { invoice: data });
  }

  if (event.httpMethod === 'POST') {
    try {
      const payload = normalizeDraft(body);
      const { data, error } = await supabase.from('invoice_drafts').insert(payload).select().single();
      if (error) return jsonResponse(event, 500, { error: 'No s’ha pogut crear l’esborrany' });
      return jsonResponse(event, 201, { draft: data });
    } catch (error) {
      return jsonResponse(event, 400, { error: error.message });
    }
  }

  if (event.httpMethod === 'PATCH') {
    if (!UUID_RE.test(String(id || ''))) return jsonResponse(event, 400, { error: 'Esborrany no vàlid' });
    // Un esborrany només s'edita des de la seva pantalla. Si no, es podria
    // canviar una prova des de la pantalla de debò i no veure-ho mai.
    const errorMode = await comprovaMode(id);
    if (errorMode) return errorMode;
    try {
      const payload = normalizeDraft(body);
      // Un esborrany de prova no es pot convertir en un de debò editant-lo, ni
      // al revés: la marca no es toca des d'aquí. Es conserva la que ja tenia.
      delete payload.is_test;
      const { data, error } = await supabase.from('invoice_drafts').update(payload).eq('id', id).eq('status', 'draft').select().maybeSingle();
      if (error || !data) return jsonResponse(event, 404, { error: 'Esborrany no trobat o ja emès' });
      return jsonResponse(event, 200, { draft: data });
    } catch (error) {
      return jsonResponse(event, 400, { error: error.message });
    }
  }

  if (event.httpMethod === 'DELETE') {
    if (!UUID_RE.test(String(id || ''))) return jsonResponse(event, 400, { error: 'Esborrany no vàlid' });
    const errorMode = await comprovaMode(id);
    if (errorMode) return errorMode;
    const { data, error } = await supabase.from('invoice_drafts').delete().eq('id', id).eq('status', 'draft').select('id').maybeSingle();
    if (error || !data) return jsonResponse(event, 404, { error: 'Esborrany no trobat o ja emès' });
    return jsonResponse(event, 200, { deleted: true });
  }

  return jsonResponse(event, 405, { error: 'Mètode no permès' }, { methods: 'GET, POST, PATCH, DELETE, OPTIONS' });
}
