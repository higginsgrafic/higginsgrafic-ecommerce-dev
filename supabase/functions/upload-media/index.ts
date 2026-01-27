import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, x-client-info, apikey, x-requested-with, accept, origin",
};

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
    // Supabase Dashboard reserves some env var prefixes (like SUPABASE_*).
    // Prefer custom names for secrets, but keep compatibility if SUPABASE_URL is
    // available by default in the Edge Runtime.
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("PROJECT_URL");
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing PROJECT_URL and/or SERVICE_ROLE_KEY");
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

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

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
          details: uploadError,
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
        details: String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
