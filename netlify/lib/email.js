/**
 * Client Resend per emails transaccionals (Netlify Functions).
 * Fitxer amb prefix "_" perquè Netlify no el desi com a funció independent.
 *
 * Plantilles React Email a netlify/emails/templates/.
 * Requereix:
 *   RESEND_API_KEY      — clau d'API de Resend (re_...)
 *   RESEND_FROM_EMAIL   — remitent verificat (comandes@higginsgrafic.com)
 */

// NO es fa servir `@react-email/render` aquí.
//
// Per què: `@react-email/render` v2 té tres builds (browser / node / edge) i
// el seu build de node arrossega `prettier` i `html-to-text`. L'empaquetador
// de Netlify n'incloïa uns fitxers i no uns altres, i en arrencar la funció
// petava amb:
//   Cannot find module '/var/task/node_modules/@react-email/render/dist/node/index.cjs'
// Com que aquest fitxer s'importa a dalt de tot, la funció SENCERA no
// arrencava (502), inclòs el webhook de Stripe: es podia cobrar un client i
// no confirmar mai la comanda.
//
// `renderToStaticMarkup` de `react-dom/server` fa exactament la feina que
// necessitem (convertir components React en HTML) i ve amb React, que ja hi
// és. El resultat és el mateix HTML; només canvia que no s'embelleix amb
// prettier, cosa irrellevant per a un correu.
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { OrderConfirmedEmail, orderConfirmedMeta } from '../emails/templates/OrderConfirmedEmail.jsx';
import { OrderInProductionEmail, orderInProductionMeta } from '../emails/templates/OrderInProductionEmail.jsx';
import { OrderShippedEmail, orderShippedMeta } from '../emails/templates/OrderShippedEmail.jsx';
import { OrderDeliveredEmail, orderDeliveredMeta } from '../emails/templates/OrderDeliveredEmail.jsx';
import { OrderRefundedEmail, orderRefundedMeta } from '../emails/templates/OrderRefundedEmail.jsx';
import { OrderFailedEmail, orderFailedMeta } from '../emails/templates/OrderFailedEmail.jsx';
import { WelcomeEmail, welcomeMeta } from '../emails/templates/WelcomeEmail.jsx';
import { PasswordResetEmail, passwordResetMeta } from '../emails/templates/PasswordResetEmail.jsx';
import { ContactReceivedEmail, contactReceivedMeta } from '../emails/templates/ContactReceivedEmail.jsx';

const RESEND_API = 'https://api.resend.com/emails';

// `renderToStaticMarkup` no afegeix el doctype; `@react-email/render` sí que
// ho feia. Els clients de correu necessiten el doctype per no entrar en mode
// "quirks", així que l'afegim nosaltres. És exactament el mateix que posava
// el renderitzador anterior.
const DOCTYPE = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

function getFrom() {
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  return from.replace(/^["']|["']$/g, '').trim();
}

const TEMPLATES = {
  order_confirmed: { Component: OrderConfirmedEmail, meta: orderConfirmedMeta, propName: 'order' },
  order_in_production: { Component: OrderInProductionEmail, meta: orderInProductionMeta, propName: 'order' },
  order_shipped: { Component: OrderShippedEmail, meta: orderShippedMeta, propName: 'order' },
  order_delivered: { Component: OrderDeliveredEmail, meta: orderDeliveredMeta, propName: 'order' },
  order_refunded: { Component: OrderRefundedEmail, meta: orderRefundedMeta, propName: 'order' },
  order_failed: { Component: OrderFailedEmail, meta: orderFailedMeta, propName: 'order' },
  welcome: { Component: WelcomeEmail, meta: welcomeMeta, propName: 'user' },
  password_reset: { Component: PasswordResetEmail, meta: passwordResetMeta, propName: 'data' },
  contact_received: { Component: ContactReceivedEmail, meta: contactReceivedMeta, propName: 'data' },
};

/**
 * Adreça pública de la botiga.
 *
 * Els correus no tenen "pàgina actual": si una imatge hi va amb ruta relativa
 * (/emails/assets/logo.png), el client de correu no la pot trobar. Cal
 * convertir-la en adreça sencera, i per això cal saber en quin domini viu la
 * botiga.
 *
 * Ordre de preferència:
 *   1. SITE_URL / VITE_SITE_ORIGIN — per fixar-ho a mà si mai cal
 *   2. URL / DEPLOY_PRIME_URL      — les posa Netlify tot sol, i s'actualitzen
 *                                    soles quan canvia el domini principal
 *   3. dev.higginsgrafic.com       — últim recurs
 *
 * IMPORTANT: no hi posis higginsgrafic.com escrit a mà. Aquell domini, mentre
 * la botiga estigui en construcció, respon amb la pàgina d'avís en comptes de
 * la imatge, i el logo sortiria trencat al correu.
 */
function getSiteBase() {
  const candidats = [
    process.env.SITE_URL,
    process.env.VITE_SITE_ORIGIN,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
  ];
  for (const candidat of candidats) {
    const valor = (candidat || '').toString().trim();
    if (valor.startsWith('http')) return valor.replace(/\/$/, '');
  }
  return 'https://dev.higginsgrafic.com';
}

export async function sendOrderEmail(templateKey, payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[_email] RESEND_API_KEY no configurada — skip email');
    return { skipped: true };
  }

  const template = TEMPLATES[templateKey];
  if (!template) {
    console.error('[_email] Plantilla desconeguda:', templateKey);
    return { error: 'unknown_template' };
  }

  const to = payload.email || payload.to;
  if (!to) {
    console.warn('[_email] Destinatari sense email — skip');
    return { skipped: true };
  }

  const { Component, meta, propName } = template;
  const element = createElement(Component, { [propName]: payload });
  // Antigament: await render(element) de @react-email/render (vegeu la nota
  // de dalt). renderToStaticMarkup és síncron i retorna el mateix HTML.
  const rawHtml = DOCTYPE + renderToStaticMarkup(element);
  const base = getSiteBase();
  const html = rawHtml
    .replace(/src="\/([^"]+)"/g, `src="${base}/$1"`)
    .replace(/url\('\/([^']+)'\)/g, `url('${base}/$1')`);
  const subject = typeof meta.subject === 'function' ? meta.subject(payload) : meta.subject;

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFrom(),
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[_email] Resend error:', res.status, errText);
      return { error: errText };
    }

    const data = await res.json();
    // La base de les imatges s'imprimeix per poder detectar d'un cop d'ull, als
    // registres, si el logo del correu apunta on toca.
    console.log('[_email] Email enviat:', templateKey, '→', data.id, '| base imatges:', base);
    return { id: data.id };
  } catch (err) {
    console.error('[_email] Error enviant email:', err.message);
    return { error: err.message };
  }
}

