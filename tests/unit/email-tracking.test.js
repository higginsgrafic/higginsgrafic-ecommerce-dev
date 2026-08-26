import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import { render } from '@react-email/render';

vi.stubEnv('SITE_URL', 'https://test.higginsgrafic.com');

const { OrderConfirmedEmail, orderConfirmedMeta } =
  await import('../../netlify/emails/templates/OrderConfirmedEmail.jsx');

function renderEmail(orderData) {
  const element = createElement(OrderConfirmedEmail, { order: orderData });
  return render(element);
}

describe('OrderConfirmedEmail — tracking link', () => {
  it('includes tracking link button when tracking_link is present', async () => {
    const html = await renderEmail({
      order_number: 'HG-TEST-001',
      first_name: 'Test',
      email: 'test@test.com',
      items: '[]',
      tracking_link: 'https://test.higginsgrafic.com/comanda?trackingToken=abc123',
    });

    expect(html).toContain('https://test.higginsgrafic.com/comanda?trackingToken=abc123');
    expect(html).toContain('Segueix la teva comanda');
  });

  it('does not include tracking link when tracking_link is absent', async () => {
    const html = await renderEmail({
      order_number: 'HG-TEST-002',
      first_name: 'Test',
      email: 'test@test.com',
      items: '[]',
    });

    expect(html).not.toContain('trackingToken');
    expect(html).not.toContain('Segueix la teva comanda');
  });

  it('does not include tracking link when tracking_link is null', async () => {
    const html = await renderEmail({
      order_number: 'HG-TEST-003',
      first_name: 'Test',
      email: 'test@test.com',
      items: '[]',
      tracking_link: null,
    });

    expect(html).not.toContain('trackingToken');
    expect(html).not.toContain('Segueix la teva comanda');
  });

  it('subject includes order number', () => {
    const subject = orderConfirmedMeta.subject({ order_number: 'HG-123' });
    expect(subject).toContain('HG-123');
  });
});
