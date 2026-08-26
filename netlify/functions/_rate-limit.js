import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

function getClientIP(event) {
  return (
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    event.headers['x-real-ip'] ||
    event.headers['client-ip'] ||
    'unknown'
  );
}

export async function checkRateLimit(event, bucket, opts = {}) {
  const {
    maxCount = 10,
    windowSeconds = 60,
    identifier: customIdentifier,
  } = opts;

  const supabase = getClient();
  if (!supabase) {
    return { allowed: true, error: null };
  }

  const identifier = customIdentifier || getClientIP(event);

  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_bucket: bucket,
      p_identifier: identifier,
      p_max_count: maxCount,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.error('[_rate-limit] RPC error:', error.message);
      return { allowed: true, error: null };
    }

    await supabase.from('rate_limit_log').insert({
      bucket,
      identifier,
    });

    return { allowed: data === true, error: null };
  } catch (err) {
    console.error('[_rate-limit] Error:', err.message);
    return { allowed: true, error: null };
  }
}
