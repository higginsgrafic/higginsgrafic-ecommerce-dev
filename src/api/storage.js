import { supabase } from './supabase-products';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Invalid FileReader result'));
        return;
      }
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(file);
  });
};

const uploadViaEdgeFunction = async (file, filePath, options = {}) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }

  const functionUrl = `${supabaseUrl}/functions/v1/upload-media`;
  const base64 = await fileToBase64(file);
  const payload = {
    bucket: 'media',
    path: filePath,
    base64,
    contentType: file.type || 'application/octet-stream',
    upsert: options.upsert === true
  };

  let res;
  try {
    res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    const msg = e?.message || (typeof e === 'string' ? e : (typeof e?.toString === 'function' ? e.toString() : 'NetworkError'));
    throw new Error(`Network error calling edge function: ${functionUrl} | ${msg}`);
  }

  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const json = JSON.parse(text);
      msg = json?.message || json?.error || text;
    } catch {
      // ignore
    }
    throw new Error(msg || `Edge upload failed (HTTP ${res.status}) | ${functionUrl}`);
  }

  const json = await res.json();
  if (!json?.success || !json?.url) {
    throw new Error(json?.error || 'Edge upload failed');
  }

  return {
    success: true,
    url: json.url,
    path: filePath,
    data: json
  };
};

export const uploadFile = async (file, folder = '') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: filePath,
      fileName: fileName
    };
  } catch (error) {
    console.error('Error uploading file:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      toString: typeof error?.toString === 'function' ? error.toString() : String(error),
      raw: error
    });
    return {
      success: false,
      error: error?.message || (typeof error === 'string' ? error : (typeof error?.toString === 'function' ? error.toString() : 'Upload error'))
    };
  }
};

export const uploadFileToPath = async (file, filePath, options = {}) => {
  try {
    const normalizedPath = (filePath || '')
      .replace(/^\/+/, '')
      .replace(/\\/g, '/');

    if (!normalizedPath) {
      throw new Error('Missing filePath');
    }

    const shouldUseEdge = options.viaEdge !== false;
    if (shouldUseEdge) {
      return await uploadViaEdgeFunction(file, normalizedPath, options);
    }

    const { data, error } = await supabase.storage
      .from('media')
      .upload(normalizedPath, file, {
        cacheControl: '3600',
        upsert: options.upsert === true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(normalizedPath);

    return {
      success: true,
      url: publicUrl,
      path: normalizedPath,
      data
    };
  } catch (error) {
    console.error('Error uploading file:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      toString: typeof error?.toString === 'function' ? error.toString() : String(error),
      raw: error
    });

    const msg = error?.message || (typeof error === 'string' ? error : (typeof error?.toString === 'function' ? error.toString() : ''));
    const looksLikeRls = /row-level security|violates row-level security|status\s*code\s*:?\s*403|\b403\b/i.test(msg);
    if (looksLikeRls) {
      try {
        const normalizedPath = (filePath || '').replace(/^\/+/, '').replace(/\\/g, '/');
        return await uploadViaEdgeFunction(file, normalizedPath, { ...options, upsert: options.upsert === true });
      } catch (edgeErr) {
        return {
          success: false,
          error: edgeErr?.message || (typeof edgeErr === 'string' ? edgeErr : (typeof edgeErr?.toString === 'function' ? edgeErr.toString() : 'Edge upload failed'))
        };
      }
    }
    return {
      success: false,
      error: msg || 'Upload error'
    };
  }
};

export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('media')
      .remove([filePath]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getPublicUrl = (filePath) => {
  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const listFiles = async (folder = '') => {
  try {
    const { data, error } = await supabase.storage
      .from('media')
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;

    const filteredData = data.filter(file => file.name !== '.keep');

    return {
      success: true,
      files: filteredData
    };
  } catch (error) {
    console.error('Error listing files:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const createFolder = async (folderPath) => {
  try {
    const keepFilePath = `${folderPath}/.keep`;
    const keepFile = new File([''], '.keep', { type: 'text/plain' });

    const { error } = await supabase.storage
      .from('media')
      .upload(keepFilePath, keepFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error creating folder:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
