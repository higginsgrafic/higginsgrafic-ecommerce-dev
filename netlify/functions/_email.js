/**
 * Client Resend per emails transaccionals (Netlify Functions).
 * Fitxer amb prefix "_" perquè Netlify no el desi com a funció independent.
 *
 * Plantilles React Email a netlify/emails/templates/.
 * Requereix:
 *   RESEND_API_KEY      — clau d'API de Resend (re_...)
 *   RESEND_FROM_EMAIL   — remitent verificat (comandes@higginsgrafic.com)
 */

import { render } from '@react-email/render';
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
  const rawHtml = await render(element);
  const html = rawHtml
    .replace(/src="\/([^"]+)"/g, 'src="https://higginsgrafic.com/$1"')
    .replace(/url\('\/([^']+)'\)/g, "url('https://higginsgrafic.com/$1')");
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
    console.log('[_email] Email enviat:', templateKey, '→', data.id);
    return { id: data.id };
  } catch (err) {
    console.error('[_email] Error enviant email:', err.message);
    return { error: err.message };
  }
}

