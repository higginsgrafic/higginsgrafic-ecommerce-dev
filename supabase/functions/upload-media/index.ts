import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, x-client-info, apikey, x-requested-with, accept, origin",
};

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_BUCKETS = new Set(["media", "project-downloads"]);

async function verifyAdmin(req: Request, supabaseUrl: string, serviceRoleKey: string): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return false;

  const { data: staff } = await supabaseAdmin
    .from('staff')
    .select('id, role, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  return !!staff;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("PROJECT_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL and/or SERVICE_ROLE_KEY");
    }

    // D0 containment: require admin authentication
    const isAdmin = await verifyAdmin(req, supabaseUrl, serviceRoleKey);
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "No autoritzat. Cal autenticació d'administrador." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const bucket = (body?.bucket || "media") as string;
    const path = (body?.path || "") as string;
    const base64 = (body?.base64 || "") as string;
    const contentType = (body?.contentType || "application/octet-stream") as string;
    const upsert = body?.upsert === true;

    if (!path) {
      return new Response(JSON.stringify({ error: "Missing path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!base64) {
      return new Response(JSON.stringify({ error: "Missing base64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ALLOWED_BUCKETS.has(bucket)) {
      return new Response(JSON.stringify({ error: `Bucket not allowed: ${bucket}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      return new Response(JSON.stringify({ error: `MIME type not allowed: ${contentType}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    if (bytes.length > MAX_FILE_SIZE_BYTES) {
      return new Response(JSON.stringify({ error: `File too large: ${bytes.length} bytes (max ${MAX_FILE_SIZE_BYTES})` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, bytes, {
        contentType,
        upsert,
        cacheControl: "3600",
      });

    if (uploadError) {
      const e = uploadError as any;
      return new Response(
        JSON.stringify({
          error: "Upload failed",
          message: e?.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

    return new Response(
      JSON.stringify({
        success: true,
        bucket,
        path,
        url: data.publicUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error?.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
