import { sendOrderEmail } from './_email.js';
import { checkRateLimit } from './_rate-limit.js';

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const { allowed } = await checkRateLimit(event, 'contact_form', {
    maxCount: 5,
    windowSeconds: 300,
  });
  if (!allowed) {
    return jsonResponse(429, { error: 'Massa missatges enviats. Torna-ho a provar més tard.' });
  }

  try {
    const { name, email, subject, message, orderNumber } = JSON.parse(event.body || '{}');

    if (!email || !message) {
      return jsonResponse(400, { error: 'Falten camps obligatoris (email, message)' });
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
            reply_to: email,
            subject: `Nou missatge de ${name || email}: ${subject || (orderNumber ? `Comanda #${orderNumber}` : '(sense assumpte)')}`,
            html: `
              <p><strong>Nom:</strong> ${name || '—'}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${orderNumber ? `<p><strong>Comanda:</strong> #${orderNumber}</p>` : ''}
              <p><strong>Assumpte:</strong> ${subject || '—'}</p>
              <hr>
              <p style="white-space: pre-wrap;">${message}</p>
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

    return jsonResponse(200, { ok: true, message: 'Missatge enviat correctament' });
  } catch (err) {
    console.error('[send-message] Error:', err);
    return jsonResponse(500, { error: 'Error intern del servidor' });
  }
}

