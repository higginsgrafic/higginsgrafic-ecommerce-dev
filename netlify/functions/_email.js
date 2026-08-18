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
import { OrderFailedEmail, orderFailedMeta } from '../emails/templates/OrderFailedEmail.jsx';

const RESEND_API = 'https://api.resend.com/emails';

function getFrom() {
  return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
}

const TEMPLATES = {
  order_confirmed: { Component: OrderConfirmedEmail, meta: orderConfirmedMeta },
  order_in_production: { Component: OrderInProductionEmail, meta: orderInProductionMeta },
  order_shipped: { Component: OrderShippedEmail, meta: orderShippedMeta },
  order_failed: { Component: OrderFailedEmail, meta: orderFailedMeta },
};

export async function sendOrderEmail(templateKey, order) {
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

  const to = order.email;
  if (!to) {
    console.warn('[_email] Ordre sense email — skip');
    return { skipped: true };
  }

  const { Component, meta } = template;
  const element = createElement(Component, { order });
  const html = await render(element);
  const subject = meta.subject(order);

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
