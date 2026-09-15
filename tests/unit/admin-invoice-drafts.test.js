import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
vi.mock('../../netlify/lib/auth.js', () => ({ verifyAdmin: async () => ({ authorized: true }) }));

const { normalizeDraft } = await import('../../netlify/functions/admin-invoice-drafts.js');

const base = {
  invoice_type: 'simplified',
  document_kind: 'invoice',
  customer_name: 'Maria Puig',
  shipping_total: 4.29,
  items: [{ name: 'Samarreta', quantity: 2, product_price: 15.5 }],
};

describe('Esborranys de factura', () => {
  it('calcula la base, l’IVA i el total al servidor', () => {
    const draft = normalizeDraft(base);
    expect(draft.total).toBe(35.29);
    expect(draft.base_products).toBe(25.62);
    expect(draft.base_shipping).toBe(3.55);
    expect(draft.iva).toBe(6.12);
    expect(draft.items[0].product_price).toBe(15.5);
  });

  it('permet desar una factura ordinària incompleta com a esborrany', () => {
    expect(normalizeDraft({ ...base, invoice_type: 'full' }).invoice_type).toBe('full');
  });

  it('una factura nova no accepta imports negatius', () => {
    expect(() => normalizeDraft({ ...base, items: [{ name: 'Error', quantity: 1, product_price: -10 }] })).toThrow(/negatius/);
  });

  it('normalitza una rectificativa amb imports negatius', () => {
    const draft = normalizeDraft({
      ...base,
      document_kind: 'rectification',
      rectifies_invoice_id: '11111111-1111-4111-8111-111111111111',
      correction_reason: 'Devolució',
      items: [{ name: 'Devolució', quantity: 1, product_price: -15.5 }],
      shipping_total: 0,
    });
    expect(draft.total).toBe(-15.5);
    expect(draft.document_kind).toBe('rectification');
  });
});
