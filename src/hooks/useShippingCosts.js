import { useState, useEffect, useCallback, useMemo } from 'react';

// Tarifes d'enviament de Gelato (Gildan 64000, DTG, Economy).
// first    = cost del primer producte de la comanda
// additional = cost de cada producte addicional de la mateixa comanda
// free_threshold = import mínim per enviament gratuït (null = sense llindar)

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
  // Zona genèrica Europe (UE sense tarifa pròpia)
  EU: { label: 'Unió Europea', first: 3.99, additional: 1.25, free_threshold: 50 },
  // EFTA (Islàndia, Liechtenstein, Suïssa)
  IS: { label: 'Islàndia', first: 8.99, additional: 1.00, free_threshold: null },
  LI: { label: 'Liechtenstein', first: 8.99, additional: 1.00, free_threshold: null },
  CH: { label: 'Suïssa', first: 8.99, additional: 1.00, free_threshold: null },
  // Andorra i altres europeus no UE/EFTA -> fem servir tarifa Europe
  AD: { label: 'Andorra', first: 3.99, additional: 1.25, free_threshold: 50 },
};

// Aliasos compatibles amb els valors del formulari (noms en català o codis antics)
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

// Mapa de codis ISO a zona Gelato (o codi directe si té tarifa pròpia)
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
  return 'ES'; // fallback Espanya
}

// Afegeix cost = first (compatibilitat amb components antics)
function buildRate(rate) {
  return { ...rate, cost: rate.first };
}

let cachedRates = null;
let fetchPromise = null;

async function fetchShippingRates() {
  if (cachedRates) return cachedRates;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      if (import.meta.env.DEV) {
        cachedRates = SHIPPING_RATES;
        return cachedRates;
      }
      const res = await fetch('/api/shipping-rates');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cachedRates = data.rates || SHIPPING_RATES;
    } catch (err) {
      console.warn('[useShippingCosts] Falling back to defaults:', err.message);
      cachedRates = SHIPPING_RATES;
    }
    return cachedRates;
  })();

  return fetchPromise;
}

export function useShippingCosts(defaultCountry = 'ES') {
  const [rates, setRates] = useState(cachedRates || SHIPPING_RATES);
  const [loading, setLoading] = useState(!cachedRates);

  useEffect(() => {
    let active = true;
    fetchShippingRates().then((r) => {
      if (active) {
        setRates(r);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const defaultCode = useMemo(() => normalizeCountry(defaultCountry), [defaultCountry]);

  const resolveRate = useCallback((country) => {
    const code = normalizeCountry(country) || defaultCode;
    return rates[code] || rates['EU'] || rates['ES'];
  }, [rates, defaultCode]);

  const getZoneInfo = useCallback((country) => {
    return buildRate(resolveRate(country));
  }, [resolveRate]);

  const calculate = useCallback((country, quantity, subtotal) => {
    const rate = resolveRate(country);
    if (rate.free_threshold != null && subtotal >= rate.free_threshold) return 0;
    const qty = Math.max(1, Math.round(quantity || 1));
    return rate.first + (qty - 1) * rate.additional;
  }, [resolveRate]);

  // API compatible amb els consumidors antics:
  // getCost(subtotal) -> calcula pel país per defecte, quantitat 1
  // getCost(country, quantity, subtotal) -> nou càlcul per país i quantitat
  const getCost = useCallback((...args) => {
    if (args.length === 1 && typeof args[0] === 'number') {
      return calculate(defaultCode, 1, args[0]);
    }
    if (args.length === 3) {
      return calculate(args[0], args[1], args[2]);
    }
    // fallback
    return calculate(defaultCode, 1, args[0]);
  }, [calculate, defaultCode]);

  const zoneInfo = useMemo(() => buildRate(rates[defaultCode] || rates['EU'] || rates['ES']), [rates, defaultCode]);

  return { rates, zoneInfo, getCost, getZoneInfo, loading };
}

