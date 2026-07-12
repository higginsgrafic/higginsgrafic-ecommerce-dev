import { useState, useEffect } from 'react';
import { translations } from '@/i18n/index.js';

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
        setTexts(parsed);
      } catch (e) {
        console.error('Error loading saved texts:', e);
      }
    }
  }, []);

  return texts;
};

export default useTexts;
