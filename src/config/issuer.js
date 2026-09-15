/**
 * Dades fiscals de qui emet la factura.
 *
 * Són les mateixes que surten al model de factura (`docs/model-factura.html`).
 * Si algun dia canvien (adreça, correu, NIF), es canvia NOMÉS aquí i queden
 * actualitzades alhora a la factura i a la web.
 */
export const ISSUER = {
  name: 'Marc Freixas Casanovas',
  tradeName: 'Higgins GRÀFIC',
  taxId: '52161740V',
  address: 'Carrer Convent, 11',
  postalCode: '08440',
  city: 'Cardedeu',
  province: 'Barcelona',
  country: 'Espanya',
  email: 'higginsgrafic@gmail.com',
  website: 'higginsgrafic.com',
};

/** Adreça completa en una línia, per als peus de document. */
export function issuerLine() {
  const i = ISSUER;
  return `${i.name} (${i.tradeName}) · NIF ${i.taxId} · ${i.address} · ${i.postalCode} ${i.city} (${i.province}) · ${i.website}`;
}
