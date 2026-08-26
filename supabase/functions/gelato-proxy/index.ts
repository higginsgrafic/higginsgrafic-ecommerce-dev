import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GELATO_PRODUCTS_API = 'https://product.gelatoapis.com/v3';
const GELATO_ORDER_API = 'https://order.gelatoapis.com/v4';
const GELATO_ECOMMERCE_API = 'https://ecommerce.gelatoapis.com/v1';

// Actions that require admin authentication
const ADMIN_ACTIONS = new Set(['order', 'stores', 'store-products', 'store-product', 'template']);

// Actions that are disabled entirely (D0 containment)
const DISABLED_ACTIONS = new Set(['order']);

async function verifyAdmin(req: Request): Promise<boolean> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("PROJECT_URL");
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) return false;

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
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get('GELATO_API_KEY');
    if (!apiKey) {
      throw new Error('GELATO_API_KEY no configurada');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'catalog';
    const catalogId = url.searchParams.get('catalogId');
    const storeId = url.searchParams.get('storeId') || Deno.env.get('GELATO_STORE_ID');
    const limit = url.searchParams.get('limit');
    const offset = url.searchParams.get('offset');

    console.log('[gelato-proxy] Action:', action);

    // D0 containment: disabled actions return safe error
    if (DISABLED_ACTIONS.has(action)) {
      return new Response(
        JSON.stringify({ error: 'Aquesta acció no està disponible. Contacta amb administració.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin-only actions require authentication
    if (ADMIN_ACTIONS.has(action)) {
      const isAdmin = await verifyAdmin(req);
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'No autoritzat' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    let gelatoUrl = '';
    let gelatoOptions: RequestInit = {
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    };

    switch (action) {
      case 'catalogs':
        gelatoUrl = `${GELATO_PRODUCTS_API}/catalogs`;
        break;
      case 'catalog':
        gelatoUrl = catalogId
          ? `${GELATO_PRODUCTS_API}/catalogs/${catalogId}/products`
          : `${GELATO_PRODUCTS_API}/products`;
        break;
      case 'product':
        const productId = url.searchParams.get('productId');
        gelatoUrl = `${GELATO_PRODUCTS_API}/products/${productId}`;
        break;
      case 'prices':
        const priceProductId = url.searchParams.get('productId');
        const currency = url.searchParams.get('currency') || 'EUR';
        const country = url.searchParams.get('country') || 'ES';
        gelatoUrl = `${GELATO_PRODUCTS_API}/products/${priceProductId}/prices?currency=${currency}&country=${country}`;
        break;
      case 'stores':
        gelatoUrl = `${GELATO_ECOMMERCE_API}/stores`;
        break;
      case 'store-products':
        if (!storeId) {
          throw new Error('Store ID requerit per obtenir productes');
        }
        gelatoUrl = `${GELATO_ECOMMERCE_API}/stores/${storeId}/products`;
        if (limit || offset) {
          const qs = new URLSearchParams();
          if (limit) qs.set('limit', limit);
          if (offset) qs.set('offset', offset);
          gelatoUrl = `${gelatoUrl}?${qs.toString()}`;
        }
        break;
      case 'store-product':
        if (!storeId) {
          throw new Error('Store ID requerit per obtenir producte');
        }
        const storeProductId = url.searchParams.get('productId');
        gelatoUrl = `${GELATO_ECOMMERCE_API}/stores/${storeId}/products/${storeProductId}`;
        break;
      case 'template':
        const templateId = url.searchParams.get('templateId');
        gelatoUrl = `${GELATO_ECOMMERCE_API}/templates/${templateId}`;
        break;
      default:
        throw new Error(`Acció desconeguda: ${action}`);
    }

    console.log('[gelato-proxy] Cridant Gelato:', gelatoUrl);

    const gelatoResponse = await fetch(gelatoUrl, gelatoOptions);
    
    console.log('[gelato-proxy] Gelato status:', gelatoResponse.status);

    if (!gelatoResponse.ok) {
      const errorText = await gelatoResponse.text();
      console.error('[gelato-proxy] Gelato error:', errorText);
      throw new Error(`Gelato API error: ${gelatoResponse.status} - ${errorText}`);
    }

    const data = await gelatoResponse.json();

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error: any) {
    console.error('[gelato-proxy] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message,
        details: String(error)
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});