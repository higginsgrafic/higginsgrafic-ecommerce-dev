import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: `Method ${event.httpMethod} not allowed` });
  }

  try {
    const { amount, currency = 'eur', metadata = {} } = JSON.parse(event.body || '{}');

    const numAmount = Math.round(Number(amount));
    if (isNaN(numAmount) || numAmount < 50 || numAmount > 500000) {
      return jsonResponse(400, { error: 'Import invàlid (ha de ser entre 0.50 € i 5000.00 €)' });
    }

    const normCurrency = String(currency).toLowerCase().trim();
    if (normCurrency !== 'eur') {
      return jsonResponse(400, { error: 'Moneda no suportada (només EUR)' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: numAmount,
      currency: normCurrency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        platform: 'higginsgrafic-web',
        ...metadata,
      },
    });

    return jsonResponse(200, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('[create-payment-intent] Error:', error);
    return jsonResponse(500, { error: error.message });
  }
}
