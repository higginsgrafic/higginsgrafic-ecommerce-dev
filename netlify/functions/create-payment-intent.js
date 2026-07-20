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
    const { amount, currency = 'eur' } = JSON.parse(event.body || '{}');

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return jsonResponse(400, { error: 'Amount ha de ser un nombre positiu (en cèntims)' });
    }

    if (!currency || typeof currency !== 'string') {
      return jsonResponse(400, { error: 'Currency és obligatori' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      automatic_payment_methods: { enabled: true },
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
