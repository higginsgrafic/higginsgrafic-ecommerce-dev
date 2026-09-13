import { sendOrderEmail } from './_notify.js';
import { checkRateLimit } from './_rate-limit.js';
import { jsonResponse } from './_cors.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Validació bàsica de format d'adreça. Sense això, el formulari de contacte
// fa de relay: qualsevol pot fer que el servidor enviï correu a una adreça
// arbitrària des del domini de la botiga (spam i crema de reputació).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Els valors que acaben en capçaleres de correu (subject, reply_to) no poden
// contenir salts de línia: permetrien injectar capçaleres addicionals.
function cleanHeader(value, maxLen = 200) {
  return String(value == null ? '' : value)
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(event, 200, {}, { methods: 'POST, OPTIONS', headers: 'Content-Type' });
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(event, 405, { error: 'Method not allowed' }, { methods: 'POST, OPTIONS', headers: 'Content-Type' });
  }

  const { allowed } = await checkRateLimit(event, 'contact_form', {
    maxCount: 5,
    windowSeconds: 300,
  });
  if (!allowed) {
    return jsonResponse(event, 429, { error: 'Massa missatges enviats. Torna-ho a provar més tard.' }, { methods: 'POST, OPTIONS', headers: 'Content-Type' });
  }

  try {
    const { name, email, subject, message, orderNumber } = JSON.parse(event.body || '{}');

    if (!email || !message) {
      return jsonResponse(event, 400, { error: 'Falten camps obligatoris (email, message)' }, { methods: 'POST, OPTIONS', headers: 'Content-Type' });
    }

    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return jsonResponse(event, 400, { error: 'Adreça de correu no vàlida' }, { methods: 'POST, OPTIONS', headers: 'Content-Type' });
    }

    if (typeof message !== 'string' || message.length > 5000) {
      return jsonResponse(event, 400, { error: 'El missatge és massa llarg (màxim 5000 caràcters)' }, { methods: 'POST, OPTIONS', headers: 'Content-Type' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL || 'higginsgrafic@gmail.com';

    // Store message in Supabase if available
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            name: name || '',
            email,
            subject: subject || (orderNumber ? `Comanda #${orderNumber}` : ''),
            message,
            created_at: new Date().toISOString(),
          }),
        });
      } catch (dbErr) {
        console.error('[send-message] Supabase insert failed:', dbErr);
      }
    }

    // 1. Send notification to admin / store
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: adminEmail,
            reply_to: cleanHeader(email, 320),
            subject: `Nou missatge de ${cleanHeader(name, 80) || cleanHeader(email, 320)}: ${cleanHeader(subject, 120) || (orderNumber ? `Comanda #${cleanHeader(orderNumber, 40)}` : '(sense assumpte)')}`,
            html: `
              <p><strong>Nom:</strong> ${escapeHtml(name || '—')}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              ${orderNumber ? `<p><strong>Comanda:</strong> #${escapeHtml(orderNumber)}</p>` : ''}
              <p><strong>Assumpte:</strong> ${escapeHtml(subject || '—')}</p>
              <hr>
              <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
            `,
          }),
        });
      } catch (adminErr) {
        console.error('[send-message] Admin notification failed:', adminErr);
      }

      // 2. Send confirmation email to client with copy of message
      try {
        await sendOrderEmail('contact_received', {
          email,
          first_name: name || '',
          name: name || '',
          message,
        });
      } catch (clientErr) {
        console.error('[send-message] Client confirmation email failed:', clientErr);
      }
    }

    return jsonResponse(event, 200, { ok: true, message: 'Missatge enviat correctament' }, { methods: 'POST, OPTIONS', headers: 'Content-Type' });
  } catch (err) {
    console.error('[send-message] Error:', err);
    return jsonResponse(event, 500, { error: 'Error intern del servidor' }, { methods: 'POST, OPTIONS', headers: 'Content-Type' });
  }
}

