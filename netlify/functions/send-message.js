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

    // Send email notification via Netlify's email integration (if configured)
    // or just log it for now
    console.log(`[send-message] New message from ${name || 'Unknown'} <${email}>: ${subject || '(no subject)'}`);

    return jsonResponse(200, { ok: true, message: 'Missatge enviat correctament' });
  } catch (err) {
    console.error('[send-message] Error:', err);
    return jsonResponse(500, { error: 'Error intern del servidor' });
  }
}
