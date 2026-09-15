import { createClient } from '@supabase/supabase-js';
import { jsonResponse } from '../lib/cors.js';
import { verifyAdmin } from '../lib/auth.js';
import { sendOrderEmail } from '../lib/notify.js';
import { getSiteBase } from '../lib/site-url.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return jsonResponse(event, 204, null);
  if (event.httpMethod !== 'POST') return jsonResponse(event, 405, { error: 'Mètode no permès' });
  const { authorized, error: authError } = await verifyAdmin(event);
  if (!authorized) return jsonResponse(event, 401, { error: authError || 'No autoritzat' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return jsonResponse(event, 500, { error: 'Servei no disponible' });

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return jsonResponse(event, 400, { error: 'Petició no vàlida' }); }
  if (body.action !== 'resend' || !UUID_RE.test(String(body.id || ''))) {
    return jsonResponse(event, 400, { error: 'Acció no vàlida' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: invoice, error } = await supabase.from('invoices').select('*').eq('id', body.id).maybeSingle();
  if (error || !invoice) return jsonResponse(event, 404, { error: 'Factura no trobada' });

  // Una factura de prova NO s'envia mai a un client. Aquest era el forat: aquí
  // s'agafava `customer_email` directament, així que un clic a «reenviar» en
  // una factura de prova hauria enviat al client de debò una factura que no és
  // cap document fiscal. El correu va a TEST_EMAIL (ho decideix
  // `adrecaDestinataria` amb la marca `is_test`), i si no n'hi ha, no s'envia.
  const esProva = invoice.is_test === true;
  if (!esProva && !invoice.customer_email) {
    return jsonResponse(event, 400, { error: 'La factura no té correu de client' });
  }

  const result = await sendOrderEmail('invoice_available', {
    ...invoice,
    // A les proves el destinatari surt de TEST_EMAIL, no del client.
    email: esProva ? null : invoice.customer_email,
    invoice_link: `${getSiteBase()}/factura/${invoice.access_token}`,
  });
  if (result.error) return jsonResponse(event, 502, { error: 'No s’ha pogut enviar el correu' });
  return jsonResponse(event, 200, {
    sent: true,
    messageId: result.id || null,
    skipped: Boolean(result.skipped),
    isTest: esProva,
  });
}
