/**
 * Forma única d'un article del cistell.
 *
 * PER QUÈ EXISTEIX
 *
 * La botiga tenia DOS cistells diferents i que no es parlaven:
 *
 *   - el de l'aplicació (CartContext), que omplia el botó "afegir al cistell"
 *     de les fitxes de producte, amb articles de forma { ...producte, size,
 *     quantity } i el preu com a número;
 *   - el del mega-slide, que s'omplia amb l'esdeveniment
 *     `hg:open-full-wide-cart` i feia servir { title, qty, price: '15,50€',
 *     color, finish, productRoute, ... }.
 *
 * Com que el carretó del mega-slide només llegia el seu, afegir un producte
 * des d'una fitxa donava un carretó buit: no es podia comprar. I aquesta
 * duplicació era la causa de fons de mig dia d'errors.
 *
 * Ara hi ha un sol cistell i tots dos camins hi entren passant per aquí, que
 * converteix qualsevol de les dues formes antigues en aquesta de comuna. Els
 * camps es conserven tots (no es llença res) perquè cada pantalla trobi el
 * que busca.
 */

/**
 * Converteix qualsevol article (de qualsevol de les dues formes antigues) en
 * un article de cistell complet i coherent.
 *
 * @param {Object} entrada  l'article tal com arriba
 * @param {Object} [extra]  dades que arriben per separat (p. ex. size, quantity)
 */
export function normalitzaArticle(entrada = {}, extra = {}) {
  const base = entrada && typeof entrada === 'object' ? entrada : {};

  const size = nomesText(extra.size ?? base.size);
  const color = nomesText(base.color ?? base.colour ?? base.selectedColor);
  const finish = nomesText(base.finish);
  const drawing = nomesText(base.drawing);

  const quantitat = Math.max(
    1,
    Math.round(Number(extra.quantity ?? base.qty ?? base.quantity ?? 1) || 1)
  );

  // El preu pot arribar com a número (13.5) o com a text de la botiga
  // ('13,50€'). Guardem les dues coses: el número per calcular i el text per
  // ensenyar, perquè cada pantalla fa servir el que li toca.
  const preuBrut = extra.unitPrice ?? base.unitPrice ?? base.price;
  const unitPrice = typeof preuBrut === 'number'
    ? preuBrut
    : (parseFloat(String(preuBrut ?? '').replace('€', '').replace(/\s/g, '').replace(',', '.')) || 0);

  const esTextDePreu = typeof preuBrut === 'string' && preuBrut.includes('€');
  const price = esTextDePreu ? preuBrut : `${unitPrice.toFixed(2).replace('.', ',')}€`;

  const title = nomesText(base.title) || nomesText(base.name) || 'Producte';

  // L'identificador de la línia ha de distingir cada configuració: la mateixa
  // samarreta en blanc i en negre són DUES línies, no una. Si no hi fos el
  // color, afegir la segona incrementaria la primera.
  const id = [
    nomesText(base.productRoute) || nomesText(base.productSlug) || nomesText(base.slug) || title,
    color,
    size,
    finish,
    drawing,
  ].filter(Boolean).join('|');

  return {
    // No llencem res del que ja portava: cada pantalla pot tenir els seus camps.
    ...base,

    // Taller de cistell
    id,
    title,
    name: nomesText(base.name) || title,
    size,
    qty: quantitat,
    quantity: quantitat,
    price,
    unitPrice,

    // Configuració de la peça (per fabricar-la)
    color: color || null,
    finish,
    drawing,
    gelatoVariantId: base.gelatoVariantId ?? null,
    productSlug: base.productSlug ?? base.slug ?? null,
    productRoute: nomesText(base.productRoute) || nomesText(base.slug),
    collection: nomesText(base.collection),
    collectionSlug: nomesText(base.collectionSlug) || nomesText(base.collection),
    designFiles: Array.isArray(base.designFiles) ? base.designFiles : [],
    designUrl: base.designUrl ?? null,

    disabled: base.disabled === true,
  };
}

/** Suma les quantitats de tot el cistell, ignorant les línies desactivades. */
export function comptaArticles(articles = []) {
  return articles
    .filter((it) => !it?.disabled)
    .reduce((total, it) => total + (Number(it.qty ?? it.quantity ?? 1) || 1), 0);
}

function nomesText(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}
