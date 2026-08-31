/**
 * Seguretat adversarial — src/api/gelato.js (client)
 * -----------------------------------------------------------------------------
 * Verifica que el client no permet creació de comandes, no exposa claus
 * secretes i no té fuites al bundle.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

let gelatoModule;

describe('gelato.js — seguretat client', () => {
  beforeEach(async () => {
    vi.resetModules();
    gelatoModule = await import('../../src/api/gelato.js');
  });

  describe('createGelatoOrder — creació deshabilitada client-side', () => {
    it('llança error server-side sempre, independentment dels arguments', async () => {
      // Sense arguments
      await expect(gelatoModule.createGelatoOrder()).rejects.toThrow('server-side');

      // Amb arguments (un atacant podria intentar passar-hi dades)
      await expect(
        gelatoModule.createGelatoOrder({ items: [], email: 'attacker@evil.com' })
      ).rejects.toThrow('server-side');

      // Amb arguments complexos
      await expect(
        gelatoModule.createGelatoOrder({ orderId: 'fake', amount: 0 })
      ).rejects.toThrow('server-side');
    });

    it('l\'error esmenta explícitament server-side', async () => {
      await expect(gelatoModule.createGelatoOrder()).rejects.toThrow(/server-side/);
    });
  });

  describe('default export — no exposa createOrder', () => {
    it('default export no té createOrder', () => {
      expect(gelatoModule.default.createOrder).toBeUndefined();
    });

    it('default export no té createGelatoOrder', () => {
      // createGelatoOrder és un export nomat, però no ha d'estar al default
      expect(gelatoModule.default.createGelatoOrder).toBeUndefined();
    });

    it('default export només exposa funcions read-only', () => {
      const allowed = ['syncCatalog', 'syncStoreProducts', 'getOrderStatus', 'mapProduct', 'mapVariant'];
      const actual = Object.keys(gelatoModule.default);

      // Cada clau del default ha de ser a la whitelist
      for (const key of actual) {
        expect(allowed).toContain(key);
      }
    });
  });

  describe('claus secretes — no al codi font', () => {
    it('no hi ha GELATO_API_KEY hardcoded al source', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const src = fs.readFileSync(
        path.resolve('src/api/gelato.js'),
        'utf8'
      );

      // No hi ha clau API hardcoded
      expect(src).not.toMatch(/GELATO_API_KEY\s*=\s*['"][a-zA-Z0-9]{20,}['"]/);
      // El comentari confirma que s'ha eliminat
      expect(src).toMatch(/GELATO_API_KEY removed|server-side only/i);
    });

    it('gelatoClient no té cap propietat apiKey o authorization amb secret', () => {
      // gelatoClient és exportat — verifiquem que no té claus secretes
      const client = gelatoModule.gelatoClient;
      expect(client).toBeDefined();

      // No ha de tenir cap camp que contingui una clau API secreta de Gelato.
      // El client usa supabaseAnonKey (pública) per la edge function, no
      // GELATO_API_KEY. Verifiquem camps específics, no substring genèric.
      expect(client).not.toHaveProperty('apiKey');
      expect(client).not.toHaveProperty('gelatoApiKey');
      expect(client.headers).not.toHaveProperty('X-API-KEY');

      // L'Authorization header usa Supabase anon key (pública), no Gelato
      if (client.headers?.Authorization) {
        expect(client.headers.Authorization).not.toMatch(/gelato/i);
      }
    });
  });
});
