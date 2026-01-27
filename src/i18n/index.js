import { ca } from './ca';

export const translations = {
  ca,
};

export const useTranslation = () => {
  const t = (key, replacements = {}) => {
    const keys = key.split('.');
    let value = translations.ca; // Sempre català

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (!value) {
      console.warn(`Translation value not found: ${key}`);
      return key;
    }

    let result = value;
    Object.keys(replacements).forEach((replaceKey) => {
      result = result.replace(`{${replaceKey}}`, replacements[replaceKey]);
    });

    return result;
  };

  return { t };
};

export default translations;
