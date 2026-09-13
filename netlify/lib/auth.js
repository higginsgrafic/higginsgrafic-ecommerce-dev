import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

export async function verifyAdmin(event) {
  const supabase = getAdminClient();
  if (!supabase) return { authorized: false, error: 'Supabase no configurat' };

  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Token no proporcionat' };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return { authorized: false, error: 'Token buit' };

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { authorized: false, error: 'Token invàlid' };
    }

    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (staffError || !staff) {
      return { authorized: false, error: 'No és administrador' };
    }

    return { authorized: true, user, staff };
  } catch (err) {
    return { authorized: false, error: err.message };
  }
}

export async function verifyUser(event) {
  const supabase = getAdminClient();
  if (!supabase) return { user: null, error: 'Supabase no configurat' };

  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Token no proporcionat' };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return { user: null, error: 'Token buit' };

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { user: null, error: 'Token invàlid' };
    }
    return { user, error: null };
  } catch (err) {
    return { user: null, error: err.message };
  }
}
