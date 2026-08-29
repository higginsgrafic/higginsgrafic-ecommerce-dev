/**
 * sanitizeHtml — sanitització bàsica per a contingut HTML extern.
 *
 * Elimina tags <script>, <iframe>, <object>, <embed>, on* attributes,
 * javascript: URLs i expressions CSS perilloses.
 *
 * No és tan robust com DOMPurify, però suficient per contingut
 * semi-confiable (APIs de tercers com Gelato, emails renderitzats).
 * Per a contingut totalment no confiable, considerar afegir DOMPurify.
 */

const DANGEROUS_TAGS = /<(script|iframe|object|embed|link|meta|base|form)\b[^>]*>[\s\S]*?<\/\1>/gi;
const DANGEROUS_TAGS_SELF_CLOSING = /<(script|iframe|object|embed|link|meta|base|form)\b[^>]*\/?>/gi;
const ON_ATTRS = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URLS = /(href|src|action|formaction)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi;
const DATA_URLS = /(href|src)\s*=\s*("data:text\/html[^"]*"|'data:text\/html[^']*')/gi;
const CSS_EXPRESSION = /expression\s*\(/gi;

export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(DANGEROUS_TAGS, '')
    .replace(DANGEROUS_TAGS_SELF_CLOSING, '')
    .replace(ON_ATTRS, '')
    .replace(JS_URLS, '')
    .replace(DATA_URLS, '')
    .replace(CSS_EXPRESSION, '');
}
