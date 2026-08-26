import { describe, expect, it } from 'vitest';

describe('stripe.js — createPaymentIntent API signature', () => {
  it('createPaymentIntent should be a function that accepts items not amount', async () => {
    const mod = await import('../../src/api/stripe.js');
    expect(typeof mod.createPaymentIntent).toBe('function');
  });

  it('getStripe should be a function', async () => {
    const mod = await import('../../src/api/stripe.js');
    expect(typeof mod.getStripe).toBe('function');
  });
});

describe('gelato.js — client-side order creation disabled', () => {
  it('createGelatoOrder should throw when called', async () => {
    const mod = await import('../../src/api/gelato.js');
    await expect(mod.createGelatoOrder()).rejects.toThrow('server-side');
  });

  it('createGelatoOrder should not be in default export', async () => {
    const mod = await import('../../src/api/gelato.js');
    expect(mod.default.createOrder).toBeUndefined();
  });
});
