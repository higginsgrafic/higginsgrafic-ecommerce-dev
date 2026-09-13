import { existsSync } from 'fs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from 'react';
import { render as renderReactEmail } from '@react-email/render';

import { sendOrderEmail } from '../../netlify/lib/email.js';
import { sendOrderEmail as sendOrderEmailAmbProteccio } from '../../netlify/lib/notify.js';

import { OrderConfirmedEmail, orderConfirmedMeta } from '../../netlify/emails/templates/OrderConfirmedEmail.jsx';
import { OrderInProductionEmail, orderInProductionMeta } from '../../netlify/emails/templates/OrderInProductionEmail.jsx';
import { OrderShippedEmail, orderShippedMeta } from '../../netlify/emails/templates/OrderShippedEmail.jsx';
import { OrderDeliveredEmail, orderDeliveredMeta } from '../../netlify/emails/templates/OrderDeliveredEmail.jsx';
import { OrderRefundedEmail, orderRefundedMeta } from '../../netlify/emails/templates/OrderRefundedEmail.jsx';
import { OrderFailedEmail, orderFailedMeta } from '../../netlify/emails/templates/OrderFailedEmail.jsx';
import { WelcomeEmail, welcomeMeta } from '../../netlify/emails/templates/WelcomeEmail.jsx';
import { PasswordResetEmail, passwordResetMeta } from '../../netlify/emails/templates/PasswordResetEmail.jsx';
import { ContactReceivedEmail, contactReceivedMeta } from '../../netlify/emails/templates/ContactReceivedEmail.jsx';

// Aquest test protegeix una cadena de fets que va estar TRENCADA en producció:
//
//  1. Les funcions de Netlify renderitzen els correus amb `renderToStaticMarkup`
//     de `react-dom/server`, NO amb `@react-email/render`.
//     Motiu: `@react-email/render` v2 no s'empaqueta bé a Netlify; faltava
//     `dist/node/index.cjs` i la funció SENCERA petava en arrencar (502).
//     El cas greu era el webhook de Stripe: es podia cobrar un client i no
//     confirmar mai la comanda.
//
//  2. `notify.js` ha d'importar `email.js` de manera ESTÀTICA. Amb un
//     `await import()` dinàmic, l'empaquetador de Netlify no incloïa el fitxer
//     dins del paquet de la funció i tots els correus fallaven en silenci.
//
//  3. El HTML resultant ha de ser el mateix que produïa el renderitzador
//     oficial (tret d'espais i comentaris de React), inclòs el doctype.

const ORDER = {
  order_number: 'HG-2026-0001',
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  first_name: 'Maria',
  last_name: 'Puig',
  email: 'maria@example.com',
  total: 49.9,
  subtotal: 44.95,
  shipping_cost: 4.95,
  status: 'confirmed',
  created_at: '2026-09-13T10:00:00.000Z',
  tracking_number: 'PQ123456789ES',
  tracking_url: 'https://tracking.example.com/PQ123456789ES',
  tracking_link: 'https://higginsgrafic.com/track?trackingToken=abc123',
  shipping_address: {
    street: 'Carrer Major 1',
    city: 'Barcelona',
    postal_code: '08001',
    country: 'ES',
  },
  items: [
    { name: 'Samarreta Higgins', variant: 'Negre / L', quantity: 2, price: 22.5 },
    { name: 'Poster A3', quantity: 1, price: 12.95 },
  ],
};

const USER = { first_name: 'Maria', email: 'maria@example.com' };
const DATA = { name: 'Maria', email: 'maria@example.com', message: 'Hola!' };

const TEMPLATES = [
  ['order_confirmed', OrderConfirmedEmail, orderConfirmedMeta, 'order', ORDER],
  ['order_in_production', OrderInProductionEmail, orderInProductionMeta, 'order', ORDER],
  ['order_shipped', OrderShippedEmail, orderShippedMeta, 'order', ORDER],
  ['order_delivered', OrderDeliveredEmail, orderDeliveredMeta, 'order', ORDER],
  ['order_refunded', OrderRefundedEmail, orderRefundedMeta, 'order', ORDER],
  ['order_failed', OrderFailedEmail, orderFailedMeta, 'order', ORDER],
  ['welcome', WelcomeEmail, welcomeMeta, 'user', USER],
  ['password_reset', PasswordResetEmail, passwordResetMeta, 'data', DATA],
  ['contact_received', ContactReceivedEmail, contactReceivedMeta, 'data', DATA],
];

// Treu els espais en blanc entre etiquetes i els comentaris de React: l'únic
// que canvia entre els dos renderitzadors és el format (prettier embelleix;
// renderToStaticMarkup no) i els marcadors de comentari `<!--$-->` que afegeix
// el renderitzador de streaming de React. Res d'això no afecta el correu.
function normalize(html) {
  return String(html)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

let enviats = [];

beforeEach(() => {
  enviats = [];
  process.env.RESEND_API_KEY = 're_test_key';
  process.env.RESEND_FROM_EMAIL = 'comandes@higginsgrafic.com';
  // Base fixa perquè la prova sigui determinista: en producció això ho omple
  // Netlify tot sol (vegeu getSiteBase() a netlify/lib/email.js).
  process.env.SITE_URL = 'https://exemple.test';
  vi.stubGlobal('fetch', async (url, options) => {
    enviats.push({ url, body: JSON.parse(options.body) });
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: 'correu-de-prova' }),
      text: async () => '',
    };
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM_EMAIL;
  delete process.env.SITE_URL;
});

describe('Correus transaccionals', () => {
  for (const [key, Component, meta, propName, payload] of TEMPLATES) {
    describe(key, () => {
      it("s'envia a Resend amb html i assumpte", async () => {
        const resultat = await sendOrderEmail(key, payload);

        expect(resultat).toEqual({ id: 'correu-de-prova' });
        expect(enviats).toHaveLength(1);
        expect(enviats[0].url).toBe('https://api.resend.com/emails');
        expect(enviats[0].body.to).toBe(payload.email);

        const html = enviats[0].body.html;
        expect(html.startsWith('<!DOCTYPE html')).toBe(true);
        expect(html).toContain('<html');
        expect(html).toContain('higginsgrafic.com');

        const subject = typeof meta.subject === 'function' ? meta.subject(payload) : meta.subject;
        expect(typeof subject).toBe('string');
        expect(subject.length).toBeGreaterThan(0);
        expect(enviats[0].body.subject).toBe(subject);
      });

      it('el HTML és equivalent al del renderitzador oficial', async () => {
        await sendOrderEmail(key, payload);
        // Les rutes relatives (/emails/assets/...) s'han convertit en adreces
        // absolutes; per comparar amb el renderitzador oficial les traiem.
        const nostre = enviats[0].body.html.split('https://exemple.test').join('');
        const oficial = await renderReactEmail(createElement(Component, { [propName]: payload }));

        expect(normalize(nostre)).toBe(normalize(oficial));
      });
    });
  }

  // Aquesta prova existeix per un error real: el logo dels correus apuntava a
  // un fitxer de GitHub que no existia i no es veia mai. Ara comprovem que
  // cada imatge del correu correspon a un fitxer que existeix de debò.
  it("totes les imatges dels correus existeixen a public/", async () => {
    const vistes = new Set();

    for (const [key, , , , payload] of TEMPLATES) {
      enviats = [];
      await sendOrderEmail(key, payload);

      const urls = [...enviats[0].body.html.matchAll(/src="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
      for (const url of urls) {
        expect(url.startsWith('https://exemple.test/'), `imatge fora de la botiga: ${url}`).toBe(true);
        const ruta = `public${url.slice('https://exemple.test'.length)}`;
        expect(existsSync(ruta), `la imatge ${ruta} (al correu "${key}") no existeix`).toBe(true);
        vistes.add(ruta);
      }
    }

    // Si això fallés voldria dir que cap correu porta imatges, i la prova no
    // estaria comprovant res.
    expect(vistes.size).toBeGreaterThan(0);
  });

  it('cap correu no penja imatges de GitHub', async () => {
    for (const [key, , , , payload] of TEMPLATES) {
      enviats = [];
      await sendOrderEmail(key, payload);
      expect(enviats[0].body.html, `el correu "${key}" encara apunta a GitHub`).not.toContain(
        'raw.githubusercontent.com'
      );
    }
  });

  it('notify.js també envia (importació estàtica)', async () => {
    const resultat = await sendOrderEmailAmbProteccio('order_confirmed', ORDER);
    expect(resultat).toEqual({ id: 'correu-de-prova' });
    expect(enviats).toHaveLength(1);
  });

  it('sense RESEND_API_KEY no envia res i no peta', async () => {
    delete process.env.RESEND_API_KEY;
    const resultat = await sendOrderEmail('order_confirmed', ORDER);
    expect(resultat).toEqual({ skipped: true });
    expect(enviats).toHaveLength(0);
  });

  it('una plantilla desconeguda retorna error i no envia res', async () => {
    const resultat = await sendOrderEmail('no_existeix', ORDER);
    expect(resultat).toEqual({ error: 'unknown_template' });
    expect(enviats).toHaveLength(0);
  });

  it('un destinatari buit no envia res', async () => {
    const resultat = await sendOrderEmail('order_confirmed', { ...ORDER, email: undefined });
    expect(resultat).toEqual({ skipped: true });
    expect(enviats).toHaveLength(0);
  });

  it('si Resend falla, notify.js ho encapsula i no llança', async () => {
    vi.stubGlobal('fetch', async () => ({
      ok: false,
      status: 422,
      json: async () => ({}),
      text: async () => 'destinatari invàlid',
    }));

    const resultat = await sendOrderEmailAmbProteccio('order_confirmed', ORDER);
    expect(resultat).toHaveProperty('error');
  });
});
