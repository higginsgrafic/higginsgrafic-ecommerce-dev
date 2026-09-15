import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { render as renderReactEmail } from '@react-email/render';
import { OrderConfirmedEmail } from '../../netlify/emails/templates/OrderConfirmedEmail.jsx';

// El client ha de poder obrir la factura des del correu de confirmació, sense
// entrar a cap compte. L'enllaç és el testimoni d'accés que va a la URL.
const COMANDA = {
  order_number: 'GRF-2026-000042',
  first_name: 'Joan',
  items: [{ name: 'The Phoenix', quantity: 1, price: 15.5 }],
  subtotal: 9.26,
  shipping_cost: 3.55,
  iva: 2.69,
  total: 15.5,
};

const render = (order) => renderReactEmail(createElement(OrderConfirmedEmail, { order }));

describe('Enllaç a la factura al correu', () => {
  it('surt quan la comanda té factura', async () => {
    const html = await render({ ...COMANDA, invoice_link: 'https://botiga.test/factura/3f2a91c4-5b6d-4e8a-9c1f-7d2b8e4a6f01' });
    expect(html).toContain('Veure la factura');
    expect(html).toContain('https://botiga.test/factura/3f2a91c4-5b6d-4e8a-9c1f-7d2b8e4a6f01');
  });

  it('no surt quan no hi ha factura', async () => {
    const html = await render(COMANDA);
    expect(html).not.toContain('Veure la factura');
  });

  it('rebutja un enllaç perillós', async () => {
    const html = await render({ ...COMANDA, invoice_link: 'javascript:alert(1)' });
    expect(html).not.toContain('javascript:alert');
    expect(html).not.toContain('Veure la factura');
  });

  it('rebutja un enllaç buit', async () => {
    const html = await render({ ...COMANDA, invoice_link: '' });
    expect(html).not.toContain('Veure la factura');
  });
});
