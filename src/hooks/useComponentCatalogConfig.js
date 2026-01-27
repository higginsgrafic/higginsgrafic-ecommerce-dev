import { useCallback, useEffect, useState } from 'react';

export default function useComponentCatalogConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/component-catalog.config.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`No s'ha pogut carregar la config (${res.status})`);
      const json = await res.json();
      setConfig(json);
    } catch (e) {
      setError(e?.message || 'Error carregant la config');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { config, loading, error, refresh };
}
