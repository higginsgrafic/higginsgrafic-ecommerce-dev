import { createClient } from '@supabase/supabase-js';
import { jsonResponse } from '../lib/cors.js';
import { verifyAdmin } from '../lib/auth.js';

/**
 * Llistat de factures per a l'administració.
 *
 * A diferència del llistat del client (que va directe a la base de dades i les
 * polítiques RLS ja filtren), aquí es veuen TOTES les factures, així que cal
 * comprovar que qui ho demana és administrador. Es fa al servidor, amb la clau
 * de servei, perquè la clau no surti mai del servidor.
 *
 * Paràmetres:
 *   year  2026            filtra per any d'emissió
 *   type  full|simplified filtra pel tipus de document
 *   q     text            cerca per número, client, CIF o número de comanda
 *
 * Retorna les factures i els totals del conjunt filtrat (per any i per
 * trimestre), que és el que fa falta per a les declaracions d'IVA.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MAX_FILES = 1000;

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * Neteja el text de cerca abans de passar-lo a la consulta.
 *
 * Els filtres de PostgREST es composen amb comes i parèntesis, així que un
 * text que els porti podria alterar la consulta. Ens hi quedem només amb
 * lletres, xifres, espais i els guions dels números de factura i de CIF.
 */
export function sanitizeSearch(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[^a-zA-Z0-9 \-_.@]/g, '').trim().slice(0, 60);
}

/** Comprova que l'any sigui un any de debò, per no injectar-lo a la consulta. */
export function parseYear(value) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n < 2000 || n > 2100) return null;
  return n;
}

export function parseType(value) {
  return value === 'full' || value === 'simplified' ? value : null;
}

/** Agrupa els imports per any i per trimestre. */
export function totalsByPeriod(invoices) {
  const perAny = {};
  const perTrimestre = {};
  for (const f of invoices) {
    const d = new Date(f.issued_at);
    if (Number.isNaN(d.getTime())) continue;
    const any = d.getFullYear();
    const trim = Math.floor(d.getMonth() / 3) + 1;
    const total = r2(f.total);
    const base = r2(r2(f.base_products) + r2(f.base_shipping));
    const iva = r2(f.iva);

    perAny[any] = perAny[any] || { year: any, count: 0, total: 0, base: 0, iva: 0 };
    perAny[any].count++;
    perAny[any].total = r2(perAny[any].total + total);
    perAny[any].base = r2(perAny[any].base + base);
    perAny[any].iva = r2(perAny[any].iva + iva);

    const clau = `${any}-T${trim}`;
    perTrimestre[clau] = perTrimestre[clau] || { period: clau, year: any, quarter: trim, count: 0, total: 0, base: 0, iva: 0 };
    perTrimestre[clau].count++;
    perTrimestre[clau].total = r2(perTrimestre[clau].total + total);
    perTrimestre[clau].base = r2(perTrimestre[clau].base + base);
    perTrimestre[clau].iva = r2(perTrimestre[clau].iva + iva);
  }
  return {
    perAny: Object.values(perAny).sort((a, b) => b.year - a.year),
    perTrimestre: Object.values(perTrimestre).sort((a, b) => b.period.localeCompare(a.period)),
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(event, 204, null);
  }

  const { authorized, error: authError } = await verifyAdmin(event);
  if (!authorized) {
    return jsonResponse(event, 401, { error: authError || 'No autoritzat' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[admin-invoices] Supabase no configurat');
    return jsonResponse(event, 500, { error: 'Servei no disponible' });
  }

  const params = event.queryStringParameters || {};
  const year = parseYear(params.year);
  const type = parseType(params.type);
  const search = sanitizeSearch(params.q);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let query = supabase
    .from('invoices')
    .select('number, invoice_type, issued_at, order_number, customer_name, customer_company, customer_tax_id, customer_email, base_products, base_shipping, iva, total, access_token')
    .order('issued_at', { ascending: false })
    .limit(MAX_FILES);

  if (year) {
    query = query.gte('issued_at', `${year}-01-01T00:00:00.000Z`).lt('issued_at', `${year + 1}-01-01T00:00:00.000Z`);
  }
  if (type) query = query.eq('invoice_type', type);
  if (search) {
    query = query.or(
      ['number', 'order_number', 'customer_name', 'customer_company', 'customer_tax_id', 'customer_email']
        .map((col) => `${col}.ilike.%${search}%`)
        .join(',')
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error('[admin-invoices] Error consultant les factures:', error.message);
    return jsonResponse(event, 500, { error: 'Error consultant les factures' });
  }

  const invoices = Array.isArray(data) ? data : [];
  const totals = totalsByPeriod(invoices);

  return jsonResponse(event, 200, {
    invoices,
    totals,
    count: invoices.length,
    // Si s'ha arribat al límit, els totals són dels primers trossos, no de tot.
    truncated: invoices.length >= MAX_FILES,
  });
}
