import { useState, useEffect } from 'react';
import { translations } from '@/i18n/index.js';

const deepMerge = (base, override) => {
  if (!override || typeof override !== 'object') return base;
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      typeof base?.[key] === 'object' && base[key] !== null && !Array.isArray(base[key]) &&
      typeof override[key] === 'object' && override[key] !== null && !Array.isArray(override[key])
    ) {
      result[key] = deepMerge(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
};

/**
 * Hook per accedir als textos de l'aplicació
 * Retorna l'objecte de traduccions en català
 * Carrega des de localStorage si hi ha canvis guardats
 */
export const useTexts = () => {
  const [texts, setTexts] = useState(translations.ca);

  useEffect(() => {
    const saved = localStorage.getItem('siteTexts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTexts(deepMerge(translations.ca, parsed));
      } catch (e) {
        console.error('Error loading saved texts:', e);
      }
    }
  }, []);

  return texts;
};

export default useTexts;
