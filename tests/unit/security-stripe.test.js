/**
 * Seguretat adversarial — src/api/stripe.js (client)
 * -----------------------------------------------------------------------------
 * Verifica comportament, no tipus. L'objectiu és confirmar que el client no
 * permet manipulació de preus, no filtra claus secretes i no exposa PII als
 * logs.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Netegem la cache de mòduls perquè stripePromise es reinicia entre tests
let stripeModule;

describe('stripe.js — seguretat client', () => {
  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset();
    stripeModule = await import('../../src/api/stripe.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createPaymentIntent — no manipulació de preus', () => {
    it('no envia amount al body (pricing és server-side)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ clientSecret: 'pi_test', total: 15.5 }),
      });

      await stripeModule.createPaymentIntent(
        [{ gelatoVariantId: 'v1', quantity: 1 }],
        'es_peninsula',
        'eur',
        { email: 'test@test.com' }
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);

      // El client no ha d'enviar amount, price, total ni cap camp de preu
      expect(body).not.toHaveProperty('amount');
      expect(body).not.toHaveProperty('price');
      expect(body).not.toHaveProperty('total');
      expect(body).not.toHaveProperty('subtotal');
      expect(body).not.toHaveProperty('shippingCost');

      // Només envia items, shippingZone, currency, email, userId
      expect(body).toHaveProperty('items');
      expect(body).toHaveProperty('shippingZone', 'es_peninsula');
      expect(body).toHaveProperty('currency', 'eur');
    });

    it('ignora opts.amount encara que l\'atacant l\'injecti', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ clientSecret: 'pi_test', total: 15.5 }),
      });

      // Un atacant podria intentar injectar amount via opts
      await stripeModule.createPaymentIntent(
        [{ gelatoVariantId: 'v1', quantity: 1 }],
        'es_peninsula',
        'eur',
        { email: 'test@test.com', amount: 1, total: 1, price: 0.01 }
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).not.toHaveProperty('amount');
      expect(body).not.toHaveProperty('total');
      expect(body).not.toHaveProperty('price');
    });

    it('envia només els camps esperats (whitelist estricte)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ clientSecret: 'pi_test' }),
      });

      await stripeModule.createPaymentIntent(
        [{ gelatoVariantId: 'v1', quantity: 1 }],
        'es_peninsula',
        'eur',
        { email: 'test@test.com', userId: 'u1' }
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      const allowedKeys = ['items', 'shippingZone', 'currency', 'email', 'userId'];
      const actualKeys = Object.keys(body);

      // Cada clau del body ha de ser a la whitelist
      for (const key of actualKeys) {
        expect(allowedKeys).toContain(key);
      }
    });
  });

  describe('getStripe — clau publishable només', () => {
    it('usa pk_ (publishable), mai sk_ (secret)', async () => {
      // Verifica que el codi font no hardcodeja sk_
      const fs = await import('node:fs');
      const path = await import('node:path');
      const src = fs.readFileSync(
        path.resolve('src/api/stripe.js'),
        'utf8'
      );

      // No hi ha cap clau secreta hardcoded
      expect(src).not.toMatch(/sk_(live|test)_[a-zA-Z0-9]{20,}/);
      // Usa pk_ o variable d'entorn
      expect(src).toMatch(/pk_|VITE_STRIPE_PUBLISHABLE_KEY/);
    });
  });

  describe('gestió d\'errors — no fuga d\'informació', () => {
    it('no fa console.error amb dades sensibles (email/PII)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Error server' }),
      });

      await expect(
        stripeModule.createPaymentIntent(
          [{ gelatoVariantId: 'v1', quantity: 1 }],
          'es_peninsula',
          'eur',
          { email: 'sensitive@example.com' }
        )
      ).rejects.toThrow();

      // console.error es crida, però no ha de contenir l'email
      const calls = consoleSpy.mock.calls;
      const allArgs = calls.map(c => c.join(' ')).join(' ');
      expect(allArgs).not.toContain('sensitive@example.com');
    });

    it('propaga l\'error del server sense afegir informació local', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Rate limit excedit' }),
      });

      await expect(
        stripeModule.createPaymentIntent([{ gelatoVariantId: 'v1', quantity: 1 }])
      ).rejects.toThrow('Rate limit excedit');
    });
  });
});
