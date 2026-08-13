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

  try {
    const { name, email, subject, message } = JSON.parse(event.body || '{}');

    if (!email || !message) {
      return jsonResponse(400, { error: 'Falten camps obligatoris (email, message)' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_TO || 'hola@higginsgrafic.com';

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
            subject: subject || '',
            message,
            created_at: new Date().toISOString(),
          }),
        });
      } catch (dbErr) {
        console.error('[send-message] Supabase insert failed:', dbErr);
      }
    }

    // Send email notification via Resend (if RESEND_API_KEY is set)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Higgins GRÀFIC <noreply@higginsgrafic.com>',
            to: [adminEmail],
            reply_to: email,
            subject: `Nou missatge: ${subject || '(sense assumpte)'}`,
            html: `
              <p><strong>Nom:</strong> ${name || '—'}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Assumpte:</strong> ${subject || '—'}</p>
              <hr>
              <p style="white-space: pre-wrap;">${message}</p>
            `,
          }),
        });
        if (!emailRes.ok) {
          console.error('[send-message] Resend error:', await emailRes.text());
        }
      } catch (emailErr) {
        console.error('[send-message] Email send failed:', emailErr);
      }
    } else {
      console.log(`[send-message] New message from ${name || 'Unknown'} <${email}>: ${subject || '(no subject)'}`);
    }

    return jsonResponse(200, { ok: true, message: 'Missatge enviat correctament' });
  } catch (err) {
    console.error('[send-message] Error:', err);
    return jsonResponse(500, { error: 'Error intern del servidor' });
  }
}
