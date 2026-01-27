import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GELATO_PRODUCTS_API = 'https://product.gelatoapis.com/v3';
const GELATO_ORDER_API = 'https://order.gelatoapis.com/v4';
const GELATO_ECOMMERCE_API = 'https://ecommerce.gelatoapis.com/v1';

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
    console.log('[gelato-proxy] Catalog ID:', catalogId);
    console.log('[gelato-proxy] Store ID:', storeId);

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
        gelatoUrl = `${GELATO_PRODUCTS_API}/products/${priceProductId}/prices`;
        break;
      case 'order':
        if (req.method === 'POST') {
          const orderData = await req.json();
          gelatoUrl = `${GELATO_ORDER_API}/orders`;
          gelatoOptions.method = 'POST';
          gelatoOptions.body = JSON.stringify(orderData);
        } else {
          const orderId = url.searchParams.get('orderId');
          gelatoUrl = `${GELATO_ORDER_API}/orders/${orderId}`;
        }
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
    console.log('[gelato-proxy] Response data keys:', Object.keys(data));

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