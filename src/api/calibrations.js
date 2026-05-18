import { supabase } from '@/api/supabase-products';

const TABLE = 'workspace_calibrations';

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase no configurat: falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
  }
  return supabase;
}

export async function fetchLatestCalibration() {
  try {
    const { data, error } = await requireSupabase()
      .from(TABLE)
      .select('version_id, data, label, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest calibration:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error in fetchLatestCalibration:', error);
    return null;
  }
}

export async function fetchCalibrationHistory(limit = 10) {
  try {
    const { data, error } = await requireSupabase()
      .from(TABLE)
      .select('version_id, label, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching calibration history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCalibrationHistory:', error);
    return [];
  }
}

export async function fetchCalibrationByVersion(versionId) {
  try {
    const { data, error } = await requireSupabase()
      .from(TABLE)
      .select('version_id, data, label, created_at')
      .eq('version_id', versionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching calibration by version:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error in fetchCalibrationByVersion:', error);
    return null;
  }
}

export async function publishCalibration(snapshot, label = 'manual') {
  try {
    const { data, error } = await requireSupabase()
      .from(TABLE)
      .insert([{ data: snapshot, label }])
      .select('version_id, label, created_at')
      .single();

    if (error) {
      console.error('Error publishing calibration:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in publishCalibration:', error);
    throw error;
  }
}
