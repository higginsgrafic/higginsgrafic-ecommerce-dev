// @vitest-environment node
// (esbuild no pot funcionar dins de jsdom: necessita el TextEncoder real)
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { build } from 'esbuild';
import { createRequire } from 'module';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const require = createRequire(import.meta.url);

// Aquest test protegeix una cadena de fets que va estar TRENCADA en producció.
//
// Netlify empaqueta les funcions de servidor amb esbuild i, com que el
// projecte no té cap tsconfig amb `"jsx": "react-jsx"` a l'abast d'aquests
// fitxers, esbuild compila el JSX en mode CLÀSSIC: genera
// `React.createElement(...)` i espera trobar `React` a l'abast.
//
// Si un fitxer .jsx de netlify/emails no importa React, el paquet compila
// igualment i el correu peta en executar-se amb "React is not defined". Com
// que enviar un correu no pot aturar una comanda, l'error queda amagat al
// registre i el correu no s'envia MAI. Va passar exactament això.

const ARREL_CORREUS = 'netlify/emails';

function fitxersJsx(dir) {
  return readdirSync(dir).flatMap((entrada) => {
    const cami = join(dir, entrada);
    if (statSync(cami).isDirectory()) return fitxersJsx(cami);
    return cami.endsWith('.jsx') ? [cami] : [];
  });
}

describe('Empaquetat dels correus amb esbuild (JSX clàssic)', () => {
  it('tots els .jsx importen React explícitament', () => {
    const fitxers = fitxersJsx(ARREL_CORREUS);
    expect(fitxers.length).toBeGreaterThan(5);

    const senseReact = fitxers.filter(
      (f) => !/^import\s+React\s+from\s+'react';/m.test(readFileSync(f, 'utf8'))
    );
    expect(senseReact).toEqual([]);
  });

  it("el bundle compilat amb esbuild envia el correu amb el contingut correcte", async () => {
    const sortida = join(tmpdir(), `hg-correu-${Date.now()}.cjs`);

    // `jsx` no s'especifica a posta: és el valor per defecte d'esbuild, el
    // mateix que fa servir Netlify.
    await build({
      entryPoints: ['netlify/lib/email.js'],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      outfile: sortida,
      logLevel: 'silent',
    });

    let capturat = null;
    vi.stubGlobal('fetch', async (url, options) => {
      capturat = JSON.parse(options.body);
      return { ok: true, status: 200, json: async () => ({ id: 'prova' }), text: async () => '' };
    });
    process.env.RESEND_API_KEY = 're_prova';
    process.env.RESEND_FROM_EMAIL = 'comandes@higginsgrafic.com';

    try {
      const { sendOrderEmail } = require(sortida);
      const resultat = await sendOrderEmail('order_shipped', {
        email: 'client@example.com',
        first_name: 'Maria',
        order_number: 'HG-2026-0001',
        tracking_number: 'PQ123',
        tracking_url: 'https://example.com/track',
        items: [{ name: 'Samarreta', quantity: 1, price: 22.5 }],
      });

      expect(resultat).toEqual({ id: 'prova' });
      expect(capturat).not.toBeNull();
      expect(capturat.html.startsWith('<!DOCTYPE html')).toBe(true);
      expect(capturat.html).toContain('PQ123');
      expect(capturat.subject).toContain('HG-2026-0001');
    } finally {
      vi.unstubAllGlobals();
      delete process.env.RESEND_API_KEY;
      delete process.env.RESEND_FROM_EMAIL;
    }
  });
});
