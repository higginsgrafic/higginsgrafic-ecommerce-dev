/**
 * Client Gelato per ús server-side (Netlify Functions).
 * Crida directament a l'API de Gelato amb la clau del servidor,
 * sense passar per l'edge function gelato-proxy (que és pel frontend).
 *
 * Fitxer amb prefix "_" perquè Netlify no el desi com a funció independent.
 */

const GELATO_ORDER_API = 'https://order.gelatoapis.com/v4';

// Noms de país habituals del formulari → codi ISO 3166-1 alpha-2
const COUNTRY_ISO = {
  espanya: 'ES',
  españa: 'ES',
  spain: 'ES',
  catalunya: 'ES',
  france: 'FR',
  frança: 'FR',
  portugal: 'PT',
  andorra: 'AD',
  italia: 'IT',
  itàlia: 'IT',
  germany: 'DE',
  alemanya: 'DE',
  'regne unit': 'GB',
  'united kingdom': 'GB',
  uk: 'GB',
  ireland: 'IE',
  irlanda: 'IE',
  netherlands: 'NL',
  'paisos baixos': 'NL',
  belgica: 'BE',
  belgium: 'BE',
  luxembourg: 'LU',
  'estats units': 'US',
  'united states': 'US',
};

function toIsoCountry(country) {
  if (!country) return 'ES';
  const raw = String(country).trim();
  if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  return COUNTRY_ISO[raw.toLowerCase()] || 'ES';
}

function parseItems(order) {
  const raw = order.items;
  if (!raw) return [];
  const items = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return Array.isArray(items) ? items : [];
}

/**
 * Construeix el payload de comanda Gelato a partir d'una fila de la taula orders.
 * Els items han d'incloure `gelatoVariantId` (productUid de Gelato) i opcionalment
 * `designFiles` (array) o `designUrl` (string) amb el disseny a imprimir.
 */
export function buildGelatoOrderPayload(order) {
  const items = parseItems(order);

  const validItems = items.filter(
    (item) => item.gelatoVariantId && String(item.gelatoVariantId).startsWith('apparel_')
  );

  if (validItems.length === 0) {
    const err = new Error('ITEMS_SENSE_VARIANT_GELATO');
    err.code = 'NO_VALID_ITEMS';
    err.itemCount = items.length;
    throw err;
  }

  return {
    orderReferenceId: order.order_number || order.id,
    currency: 'EUR',
    items: validItems.map((item, idx) => {
      const files = (item.designFiles || [])
        .map((f) => ({ type: 'default', url: typeof f === 'string' ? f : f.url }))
        .filter((f) => f.url);
      if (files.length === 0 && item.designUrl) {
        files.push({ type: 'default', url: item.designUrl });
      }
      return {
        itemReferenceId: `item-${idx + 1}`,
        productUid: item.gelatoVariantId,
        variantUid: item.gelatoVariantId,
        quantity: item.quantity || item.qty || 1,
        files,
      };
    }),
    shippingAddress: {
      firstName: order.first_name || '',
      lastName: order.last_name || '',
      addressLine1: [order.address, order.address2].filter(Boolean).join(', '),
      city: order.city || '',
      postCode: order.postal_code || '',
      country: toIsoCountry(order.country),
      email: order.email,
      phone: order.phone || undefined,
    },
  };
}

/**
 * Crea la comanda a Gelato. Retorna { orderId, status }.
 * Llança Error amb code='NO_VALID_ITEMS' si les dades de la comanda no
 * permeten fulfill-la (no s'ha de reintentar), o un error genèric si la
 * crida a Gelato falla (SÍ que s'ha de reintentar).
 */
export async function createGelatoOrderServer(order) {
  const apiKey = process.env.GELATO_API_KEY;
  if (!apiKey) {
    const err = new Error('GELATO_API_KEY no configurada');
    err.code = 'NO_API_KEY';
    throw err;
  }

  const payload = buildGelatoOrderPayload(order);

  const response = await fetch(`${GELATO_ORDER_API}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(
      `Gelato ${response.status}: ${JSON.stringify(body).slice(0, 500)}`
    );
    // 4xx = error de dades, no reintentar; 5xx = error de Gelato, reintentar
    err.code = response.status >= 500 ? 'GELATO_SERVER_ERROR' : 'GELATO_DATA_ERROR';
    throw err;
  }

  return {
    orderId: body.id || body.orderId || null,
    status: body.status || 'created',
  };
}
