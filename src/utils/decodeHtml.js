/**
 * Descodifica entitats HTML que WordPress retorna
 * Soluciona problemes amb accents, apòstrofs i altres caràcters especials catalans
 */
export const decodeHtml = (html) => {
  if (!html) return '';

  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

/**
 * Neteja text HTML que ve de WordPress
 * Elimina tags HTML i descodifica entitats
 */
export const cleanWordPressText = (text) => {
  if (!text) return '';

  // Primer descodifiquem entitats HTML
  const decoded = decodeHtml(text);

  // Després eliminem tags HTML si n'hi ha
  const withoutTags = decoded.replace(/<[^>]*>/g, '');

  return withoutTags;
};

export default decodeHtml;
