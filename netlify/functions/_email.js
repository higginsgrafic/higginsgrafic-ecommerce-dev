/**
 * Client Resend per emails transaccionals (Netlify Functions).
 * Fitxer amb prefix "_" perquè Netlify no el desi com a funció independent.
 *
 * Requereix:
 *   RESEND_API_KEY      — clau d'API de Resend (re_...)
 *   RESEND_FROM_EMAIL   — remitent verificat (comandes@higginsgrafic.com)
 */

const RESEND_API = 'https://api.resend.com/emails';

function getFrom() {
  return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
}

function formatPrice(n) {
  return `${(Number(n) || 0).toFixed(2).replace('.', ',')}€`;
}

function parseItems(order) {
  try {
    const raw = order.items;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') return JSON.parse(raw);
    return [];
  } catch {
    return [];
  }
}

function buildItemsHtml(items) {
  if (!items || items.length === 0) return '';
  const rows = items.map((item) => {
    const name = item.name || 'Producte';
    const size = item.size || '-';
    const qty = item.quantity || item.qty || 1;
    const price = formatPrice(item.price || 0);
    return `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #E6E8EC;font-family:Roboto,sans-serif;font-size:11pt;color:#667085">${name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E6E8EC;font-family:Roboto,sans-serif;font-size:11pt;color:#667085;text-align:center">${size}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E6E8EC;font-family:Roboto,sans-serif;font-size:11pt;color:#667085;text-align:center">${qty}</td>
      <td style="padding:8px 0;border-bottom:1px solid #E6E8EC;font-family:Roboto,sans-serif;font-size:11pt;color:#667085;text-align:right">${price}</td>
    </tr>`;
  }).join('');
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0">
    <thead>
      <tr style="border-bottom:1px solid #E6E8EC">
        <th style="padding:8px 0;font-family:Roboto,sans-serif;font-size:9pt;font-weight:400;color:#98A2B3;text-align:left">Producte</th>
        <th style="padding:8px 12px;font-family:Roboto,sans-serif;font-size:9pt;font-weight:400;color:#98A2B3;text-align:center">Talla</th>
        <th style="padding:8px 12px;font-family:Roboto,sans-serif;font-size:9pt;font-weight:400;color:#98A2B3;text-align:center">Qty</th>
        <th style="padding:8px 0;font-family:Roboto,sans-serif;font-size:9pt;font-weight:400;color:#98A2B3;text-align:right">Preu</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function buildSummaryHtml(order) {
  const subtotal = formatPrice(order.subtotal || 0);
  const shipping = formatPrice(order.shipping_cost || 0);
  const iva = formatPrice(order.iva || 0);
  const total = formatPrice(order.total || 0);
  return `<div style="margin-top:16px;padding-top:12px;border-top:1px solid #E6E8EC">
    <div style="display:flex;justify-content:space-between;font-family:Roboto,sans-serif;font-size:10pt;color:#667085;padding:2px 0"><span>Subtotal</span><span>${subtotal}</span></div>
    <div style="display:flex;justify-content:space-between;font-family:Roboto,sans-serif;font-size:10pt;color:#667085;padding:2px 0"><span>Ports</span><span>${shipping}</span></div>
    <div style="display:flex;justify-content:space-between;font-family:Roboto,sans-serif;font-size:10pt;color:#667085;padding:2px 0"><span>IVA 21%</span><span>${iva}</span></div>
    <div style="display:flex;justify-content:space-between;font-family:Oswald,sans-serif;font-size:13pt;font-weight:500;padding:8px 0 0;border-top:1px solid #E6E8EC;margin-top:4px"><span>Total</span><span>${total}</span></div>
  </div>`;
}

function buildBaseHtml(title, subtitle, bodyContent) {
  return `<!DOCTYPE html>
<html lang="ca">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F7">
  <div style="max-width:500px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;margin-bottom:32px">
      <h1 style="font-family:Roboto,sans-serif;font-size:20pt;font-weight:700;color:#141414;margin:0">${title}</h1>
      <p style="font-family:Roboto,sans-serif;font-size:11pt;color:#667085;margin:4px 0 0">${subtitle}</p>
    </div>
    <div style="background:#FFFFFF;border:1px solid #DFEBED;border-radius:8px;padding:24px">
      ${bodyContent}
    </div>
    <p style="text-align:center;font-family:Roboto,sans-serif;font-size:9pt;color:#98A2B3;margin-top:24px">
      Higgins GRÀFIC · Cardedeu, Barcelona<br>
      <a href="https://higginsgrafic.com" style="color:#98A2B3;text-decoration:none">higginsgrafic.com</a>
    </p>
  </div>
</body>
</html>`;
}

const TEMPLATES = {
  order_confirmed: (order) => {
    const items = parseItems(order);
    const orderNumber = order.order_number || order.id;
    const body = `
      <p style="font-family:Roboto,sans-serif;font-size:11pt;color:#141414;margin:0 0 16px">Hola ${order.first_name || ''},</p>
      <p style="font-family:Roboto,sans-serif;font-size:11pt;color:#667085;margin:0 0 16px">Hem rebut el teu pagament i la comanda <strong style="color:#141414">#${orderNumber}</strong> està confirmada. Ja estem preparant-la per a la producció.</p>
      ${buildItemsHtml(items)}
      ${buildSummaryHtml(order)}
      <p style="font-family:Roboto,sans-serif;font-size:10pt;color:#98A2B3;margin-top:24px">Rebràs més notificacions quan la comanda entri en producció i quan s'enviï.</p>
    `;
    return {
      subject: `Comanda confirmada #${orderNumber}`,
      html: buildBaseHtml('Pagament confirmat', `Comanda #${orderNumber}`, body),
    };
  },

  order_in_production: (order) => {
    const orderNumber = order.order_number || order.id;
    const body = `
      <p style="font-family:Roboto,sans-serif;font-size:11pt;color:#141414;margin:0 0 16px">Hola ${order.first_name || ''},</p>
      <p style="font-family:Roboto,sans-serif;font-size:11pt;color:#667085;margin:0 0 16px">La teva comanda <strong style="color:#141414">#${orderNumber}</strong> ha entrat en producció. Cada peça es fabrica sota demanda per evitar malbaratament. El temps estimat de producció és de 2 a 5 dies laborables.</p>
      <p style="font-family:Roboto,sans-serif;font-size:10pt;color:#98A2B3;margin-top:24px">T'avisarem quan la comanda s'enviï amb el número de seguiment.</p>
    `;
    return {
      subject: `Comanda en producció #${orderNumber}`,
      html: buildBaseHtml('En producció', `Comanda #${orderNumber}`, body),
    };
  },

  order_shipped: (order) => {
    const orderNumber = order.order_number || order.id;
    const tracking = order.tracking_number || '';
    const carrier = order.tracking_carrier || 'transportista';
    const trackingUrl = order.tracking_url || '';
    const trackingHtml = tracking
      ? `<p style="font-family:Roboto,sans-serif;font-size:11pt;color:#667085;margin:0 0 16px">Número de seguiment: <strong style="color:#141414">${tracking}</strong>${trackingUrl ? ` · <a href="${trackingUrl}" style="color:#141414">Segueix el paquet</a>` : ''}</p>`
      : '';
    const body = `
      <p style="font-family:Roboto,sans-serif;font-size:11pt;color:#141414;margin:0 0 16px">Hola ${order.first_name || ''},</p>
      <p style="font-family:Roboto,sans-serif;font-size:11pt;color:#667085;margin:0 0 16px">La teva comanda <strong style="color:#141414">#${orderNumber}</strong> ha estat enviada via ${carrier}.</p>
      ${trackingHtml}
      <p style="font-family:Roboto,sans-serif;font-size:10pt;color:#98A2B3;margin-top:24px">El número de seguiment pot trigar 24-48h a activar-se al sistema del transportista.</p>
    `;
    return {
      subject: `Comanda enviada #${orderNumber}`,
      html: buildBaseHtml('Comanda enviada', `Comanda #${orderNumber}`, body),
    };
  },

  order_failed: (order) => {
    const orderNumber = order.order_number || order.id;
    const body = `
      <p style="font-family:Roboto,sans-serif;font-size:11pt;color:#141414;margin:0 0 16px">Hola ${order.first_name || ''},</p>
      <p style="font-family:Roboto,sans-serif;font-size:11pt;color:#667085;margin:0 0 16px">El pagament de la comanda <strong style="color:#141414">#${orderNumber}</strong> no s'ha pogut processar. Cap càrrec s'ha efectuat.</p>
      <p style="font-family:Roboto,sans-serif;font-size:11pt;color:#667085;margin:0 0 16px">Pots tornar a intentar la compra a <a href="https://higginsgrafic.com" style="color:#141414">higginsgrafic.com</a>. Si creus que és un error, contacta'ns a <a href="mailto:higginsgrafic@gmail.com" style="color:#141414">higginsgrafic@gmail.com</a>.</p>
    `;
    return {
      subject: `Pagament no processat #${orderNumber}`,
      html: buildBaseHtml('Pagament no processat', `Comanda #${orderNumber}`, body),
    };
  },
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

  const { subject, html } = template(order);

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
