import { describe, it, expect } from 'vitest';
import { normalitzaArticle, comptaArticles } from '../../src/lib/cartItems.js';

// La botiga tenia dos cistells amb dues formes d'article diferents i que no es
// parlaven. Aquest fitxer converteix qualsevol de les dues formes en una de
// sola. Aquestes proves fixen que totes dues hi caben i que no es confonen.

// Forma que arriba de les fitxes de producte (CartContext antic)
const ARTICLE_DE_FITXA = {
  id: 'a0654176-a563-4e89-935c-49317cf758a3',
  name: 'The Human Inside - Afrodita-A',
  slug: 'the-human-inside-afrodita-a',
  price: 15.5,
  color: 'Black',
  size: 'L',
  quantity: 2,
  gelatoVariantId: 'apparel_product_gca_t-shirt_gsc_crewneck_black_l',
};

// Forma que arriba del mega-slide
const ARTICLE_DE_MEGASLIDE = {
  title: 'THE HUMAN INSIDE - AFRODITA-A',
  collection: 'the_human_inside',
  productRoute: 'the-human-inside-afrodita-a',
  qty: 1,
  size: 'L',
  price: '15,50€',
  color: 'Black',
  finish: 'BLACK',
};

describe('cartItems — forma única de l\'article', () => {
  it('accepta un article de fitxa de producte', () => {
    const a = normalitzaArticle(ARTICLE_DE_FITXA);
    expect(a.title).toBe('The Human Inside - Afrodita-A');
    expect(a.qty).toBe(2);
    expect(a.quantity).toBe(2);
    expect(a.unitPrice).toBe(15.5);
    expect(a.price).toBe('15,50€');
    expect(a.size).toBe('L');
    expect(a.color).toBe('Black');
    expect(a.productSlug).toBe('the-human-inside-afrodita-a');
  });

  it('accepta un article del mega-slide', () => {
    const a = normalitzaArticle(ARTICLE_DE_MEGASLIDE);
    expect(a.title).toBe('THE HUMAN INSIDE - AFRODITA-A');
    expect(a.qty).toBe(1);
    expect(a.unitPrice).toBe(15.5);
    expect(a.price).toBe('15,50€');
    expect(a.finish).toBe('BLACK');
    expect(a.collection).toBe('the_human_inside');
  });

  it('la talla i la quantitat poden arribar a part', () => {
    const a = normalitzaArticle({ name: 'Poster' }, { size: 'M', quantity: 3 });
    expect(a.size).toBe('M');
    expect(a.qty).toBe(3);
  });

  it('dos colors del mateix producte són DUES línies, no una', () => {
    const blanc = normalitzaArticle({ ...ARTICLE_DE_FITXA, color: 'White' });
    const negre = normalitzaArticle({ ...ARTICLE_DE_FITXA, color: 'Black' });
    expect(blanc.id).not.toBe(negre.id);
  });

  it('dues talles del mateix producte són DUES línies', () => {
    const l = normalitzaArticle({ ...ARTICLE_DE_FITXA, size: 'L' });
    const m = normalitzaArticle({ ...ARTICLE_DE_FITXA, size: 'M' });
    expect(l.id).not.toBe(m.id);
  });

  it('el mateix producte amb la mateixa configuració té el MATEIX id (es fusiona)', () => {
    const un = normalitzaArticle(ARTICLE_DE_FITXA);
    const dos = normalitzaArticle({ ...ARTICLE_DE_FITXA, quantity: 1 });
    expect(un.id).toBe(dos.id);
  });

  it("no s'inventa preus: un preu desconegut queda a zero", () => {
    const a = normalitzaArticle({ name: 'Cosa' });
    expect(a.unitPrice).toBe(0);
    expect(a.price).toBe('0,00€');
  });

  it('converteix els articles desats per una versió anterior', () => {
    const vell = { id: 'x', name: 'Samarreta', size: 'S', quantity: 1, price: 12 };
    const a = normalitzaArticle(vell);
    expect(a.title).toBe('Samarreta');
    expect(a.qty).toBe(1);
    expect(a.price).toBe('12,00€');
    // I tornar-lo a passar no canvia res (és estable)
    expect(normalitzaArticle(a)).toEqual(a);
  });

  it('compta els articles ignorant les línies desactivades', () => {
    const items = [
      normalitzaArticle({ ...ARTICLE_DE_FITXA, quantity: 2 }),
      normalitzaArticle({ ...ARTICLE_DE_FITXA, color: 'White', quantity: 3 }),
      normalitzaArticle({ name: 'Fora de catàleg', quantity: 5, disabled: true }),
    ];
    expect(comptaArticles(items)).toBe(5);
  });
});
