const ALLOWED_ORIGINS = [
  'https://higginsgrafic.com',
  'https://www.higginsgrafic.com',
];

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

function getOrigin(event) {
  return event.headers.origin || event.headers.Origin || '';
}

export function getAllowedOrigin(event) {
  const origin = getOrigin(event);
  if (!origin) return ALLOWED_ORIGINS[0];
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (process.env.CONTEXT !== 'production' && DEV_ORIGINS.includes(origin)) return origin;
  return null;
}

export function corsHeaders(event, extra = {}) {
  const origin = getAllowedOrigin(event);
  return {
    'Access-Control-Allow-Origin': origin || 'null',
    'Access-Control-Allow-Methods': extra.methods || 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': extra.headers || 'Content-Type, Authorization',
    ...(origin ? { 'Vary': 'Origin' } : {}),
  };
}

export function jsonResponse(event, statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(event, extraHeaders),
    },
    body: JSON.stringify(body),
  };
}
