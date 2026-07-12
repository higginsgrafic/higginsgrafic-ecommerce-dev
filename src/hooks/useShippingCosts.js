import { useState, useEffect, useCallback } from 'react';

const DEFAULT_RATES = {
  es_peninsula: { label: 'Espanya (Península i Balears)', cost: 4.95, free_threshold: 50 },
  es_canarias: { label: 'Espanya (Canàries, Ceuta, Melilla)', cost: 6.95, free_threshold: null },
  eu: { label: 'Unió Europea', cost: 6.95, free_threshold: 50 },
  international: { label: 'Internacional', cost: 12.95, free_threshold: null },
};

let cachedRates = null;
let fetchPromise = null;

async function fetchShippingRates() {
  if (cachedRates) return cachedRates;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      if (import.meta.env.DEV) {
        cachedRates = DEFAULT_RATES;
        return cachedRates;
      }
      const res = await fetch('/api/shipping-rates');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cachedRates = data.rates || DEFAULT_RATES;
    } catch (err) {
      console.warn('[useShippingCosts] Falling back to defaults:', err.message);
      cachedRates = DEFAULT_RATES;
    }
    return cachedRates;
  })();

  return fetchPromise;
}

export function useShippingCosts(zone = 'es_peninsula') {
  const [rates, setRates] = useState(cachedRates || DEFAULT_RATES);
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

  const zoneInfo = rates[zone] || DEFAULT_RATES[zone] || { label: zone, cost: 0, free_threshold: null };
  const getCost = useCallback((subtotal) => {
    if (zoneInfo.free_threshold != null && subtotal >= zoneInfo.free_threshold) return 0;
    return zoneInfo.cost;
  }, [zoneInfo]);

  return { rates, zoneInfo, getCost, loading };
}

export { DEFAULT_RATES, fetchShippingRates };
