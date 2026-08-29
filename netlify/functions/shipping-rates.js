import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from './_auth.js';
import { checkRateLimit } from './_rate-limit.js';
import { jsonResponse } from './_cors.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CORREOS_API_URL = process.env.CORREOS_API_URL || 'https://api.correos.es';
const CORREOS_API_KEY = process.env.CORREOS_API_KEY;
const CORREOS_USER = process.env.CORREOS_USER;
const CORREOS_PASS = process.env.CORREOS_PASS;

const DEFAULT_COSTS = {
  es_peninsula: { cost: 4.95, free_threshold: 50.00 },
  es_canarias: { cost: 6.95, free_threshold: null },
  eu: { cost: 6.95, free_threshold: 50.00 },
  international: { cost: 12.95, free_threshold: null },
};

async function fetchCorreosRates() {
  if (!CORREOS_API_KEY && !CORREOS_USER) {
    console.log('[shipping-rates] No Correos credentials, returning defaults');
    return DEFAULT_COSTS;
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (CORREOS_API_KEY) headers['Authorization'] = `Bearer ${CORREOS_API_KEY}`;
    if (CORREOS_USER && CORREOS_PASS) {
      headers['Authorization'] = 'Basic ' + Buffer.from(`${CORREOS_USER}:${CORREOS_PASS}`).toString('base64');
    }

    const response = await fetch(`${CORREOS_API_URL}/tarifas`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Correos API returned ${response.status}`);
    }

    const data = await response.json();

    return {
      es_peninsula: {
        cost: parseFloat(data.es_peninsula ?? DEFAULT_COSTS.es_peninsula.cost),
        free_threshold: DEFAULT_COSTS.es_peninsula.free_threshold,
      },
      es_canarias: {
        cost: parseFloat(data.es_canarias ?? DEFAULT_COSTS.es_canarias.cost),
        free_threshold: DEFAULT_COSTS.es_canarias.free_threshold,
      },
      eu: {
        cost: parseFloat(data.eu ?? DEFAULT_COSTS.eu.cost),
        free_threshold: DEFAULT_COSTS.eu.free_threshold,
      },
      international: {
        cost: parseFloat(data.international ?? DEFAULT_COSTS.international.cost),
        free_threshold: DEFAULT_COSTS.international.free_threshold,
      },
    };
  } catch (err) {
    console.error('[shipping-rates] Correos API error:', err.message);
    return DEFAULT_COSTS;
  }
}

async function updateSupabase(supabase, rates) {
  for (const [zone, info] of Object.entries(rates)) {
    const { error } = await supabase
      .from('shipping_config')
      .upsert({
        zone,
        cost: info.cost,
        free_threshold: info.free_threshold,
      }, { onConflict: 'zone' });

    if (error) {
      console.error(`[shipping-rates] Error updating zone ${zone}:`, error.message);
    } else {
      console.log(`[shipping-rates] Updated ${zone}: ${info.cost}€`);
    }
  }
}

export async function handler(event, context) {
  const httpMethod = event.httpMethod;

  if (httpMethod === 'GET') {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return jsonResponse(event, 200, { rates: DEFAULT_COSTS, source: 'defaults' });
    }

    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      const { data, error } = await supabase
        .from('shipping_config')
        .select('zone, label, cost, free_threshold, updated_at');

      if (error) throw error;

      const rates = {};
      for (const row of data) {
        rates[row.zone] = {
          label: row.label,
          cost: parseFloat(row.cost),
          free_threshold: row.free_threshold ? parseFloat(row.free_threshold) : null,
          updated_at: row.updated_at,
        };
      }

      return jsonResponse(event, 200, { rates, source: 'supabase' });
    } catch (err) {
      console.error('[shipping-rates] GET error:', err);
      return jsonResponse(event, 200, { rates: DEFAULT_COSTS, source: 'fallback' });
    }
  }

  if (httpMethod === 'POST') {
    const { authorized, error: authError } = await verifyAdmin(event);
    if (!authorized) {
      return jsonResponse(event, 403, { error: authError || 'No autoritzat' });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return jsonResponse(event, 500, { error: 'Missing Supabase credentials' });
    }

    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      const rates = await fetchCorreosRates();
      await updateSupabase(supabase, rates);

      return jsonResponse(event, 200, { success: true, rates, source: 'correos' });
    } catch (err) {
      console.error('[shipping-rates] POST error:', err);
      return jsonResponse(event, 500, { error: 'Error intern del servidor' });
    }
  }

  return jsonResponse(event, 405, { error: 'Method not allowed' });
}
