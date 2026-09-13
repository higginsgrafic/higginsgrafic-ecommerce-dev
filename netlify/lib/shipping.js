/**
 * Càlcul del cost d'enviament — costat servidor.
 *
 * ⚠️ AQUESTA TAULA HA DE SER IDÈNTICA A `src/hooks/useShippingCosts.js`.
 * El client mostra al comprador el transport calculat amb aquella taula; si
 * el servidor en fa servir una altra, el comprador veu un preu i se li'n
 * cobra un altre. El test `tests/unit/shipping-parity.test.js` falla si les
 * dues taules divergeixen.
 *
 * Fitxer amb prefix "_" perquè Netlify no el desplegui com a funció.
 *
 * Tarifes de Gelato (Gildan 64000, DTG, Economy):
 *   first           cost del primer producte de la comanda
 *   additional      cost de cada producte addicional
 *   free_threshold  import mínim per enviament gratuït (null = sense llindar)
 */

export const SHIPPING_RATES = {
  ES: { label: 'Espanya', first: 4.29, additional: 1.39, free_threshold: 50 },
  IT: { label: 'Itàlia', first: 4.29, additional: 1.39, free_threshold: 50 },
  FR: { label: 'França', first: 4.39, additional: 1.39, free_threshold: 50 },
  DE: { label: 'Alemanya', first: 4.19, additional: 1.29, free_threshold: 50 },
  IE: { label: 'Irlanda', first: 3.99, additional: 1.25, free_threshold: 50 },
  GB: { label: 'Regne Unit', first: 3.72, additional: 1.11, free_threshold: 50 },
  SE: { label: 'Suècia', first: 4.78, additional: 1.53, free_threshold: 50 },
  DK: { label: 'Dinamarca', first: 4.72, additional: 1.34, free_threshold: 50 },
  NO: { label: 'Noruega', first: 7.48, additional: 2.19, free_threshold: null },
  US: { label: 'Estats Units', first: 4.21, additional: 0.83, free_threshold: null },
  CA: { label: 'Canadà', first: 8.03, additional: 2.42, free_threshold: null },
  AU: { label: 'Austràlia', first: 7.65, additional: 2.31, free_threshold: null },
  NZ: { label: 'Nova Zelanda', first: 5.14, additional: 0.96, free_threshold: null },
  BR: { label: 'Brasil', first: 3.47, additional: 1.93, free_threshold: null },
  SG: { label: 'Singapur', first: 10.03, additional: 2.41, free_threshold: null },
  JP: { label: 'Japó', first: 9.45, additional: 2.26, free_threshold: null },
  EU: { label: 'Unió Europea', first: 3.99, additional: 1.25, free_threshold: 50 },
  IS: { label: 'Islàndia', first: 8.99, additional: 1.00, free_threshold: null },
  LI: { label: 'Liechtenstein', first: 8.99, additional: 1.00, free_threshold: null },
  CH: { label: 'Suïssa', first: 8.99, additional: 1.00, free_threshold: null },
  AD: { label: 'Andorra', first: 3.99, additional: 1.25, free_threshold: 50 },
};

const COUNTRY_NAME_MAP = {
  espanya: 'ES',
  es: 'ES',
  espana: 'ES',
  espanya_peninsula: 'ES',
  es_peninsula: 'ES',
  frança: 'FR',
  franca: 'FR',
  fr: 'FR',
  francia: 'FR',
  andorra: 'AD',
  ad: 'AD',
  italia: 'IT',
  it: 'IT',
  alemanya: 'DE',
  alemania: 'DE',
  de: 'DE',
  regne_unit: 'GB',
  reino_unido: 'GB',
  uk: 'GB',
  gb: 'GB',
  irlanda: 'IE',
  ie: 'IE',
  suecia: 'SE',
  suècia: 'SE',
  se: 'SE',
  dinamarca: 'DK',
  dk: 'DK',
  noruega: 'NO',
  no: 'NO',
  estats_units: 'US',
  estados_unidos: 'US',
  usa: 'US',
  us: 'US',
  canada: 'CA',
  canadà: 'CA',
  ca: 'CA',
  australia: 'AU',
  au: 'AU',
  nova_zelanda: 'NZ',
  nueva_zelanda: 'NZ',
  nz: 'NZ',
  brasil: 'BR',
  br: 'BR',
  singapur: 'SG',
  singapore: 'SG',
  sg: 'SG',
  japo: 'JP',
  japó: 'JP',
  japan: 'JP',
  jp: 'JP',
  islandia: 'IS',
  islàndia: 'IS',
  is: 'IS',
  liechtenstein: 'LI',
  li: 'LI',
  suissa: 'CH',
  suiza: 'CH',
  suiça: 'CH',
  ch: 'CH',
};

const EUROPE_GENERIC = ['EU', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'EE', 'FI', 'GR', 'HU', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI'];
const EFTA_CODES = ['IS', 'LI', 'CH'];

export function normalizeCountry(value) {
  if (!value) return 'ES';
  const key = String(value).toLowerCase().replace(/[\s\-_]/g, '_');
  if (COUNTRY_NAME_MAP[key]) return COUNTRY_NAME_MAP[key];
  const upper = String(value).toUpperCase();
  if (SHIPPING_RATES[upper]) return upper;
  if (EUROPE_GENERIC.includes(upper)) return 'EU';
  if (EFTA_CODES.includes(upper)) return upper;
  return 'ES';
}

/**
 * Cost d'enviament per a un país, una quantitat d'articles i un subtotal.
 * Replica exactament `calculate()` de src/hooks/useShippingCosts.js.
 *
 * @param {string} country     país (nom o codi; el formulari envia 'Espanya')
 * @param {number} quantity    nombre total d'articles
 * @param {number} subtotal    import dels articles (abans de transport)
 * @returns {number} cost d'enviament en euros, arrodonit a 2 decimals
 */
export function quoteShipping(country, quantity, subtotal) {
  const code = normalizeCountry(country);
  const rate = SHIPPING_RATES[code] || SHIPPING_RATES.EU || SHIPPING_RATES.ES;
  const amount = Number(subtotal) || 0;
  if (rate.free_threshold != null && amount >= rate.free_threshold) return 0;
  const qty = Math.max(1, Math.round(Number(quantity) || 1));
  return Math.round((rate.first + (qty - 1) * rate.additional) * 100) / 100;
}
