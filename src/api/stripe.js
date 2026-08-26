/**
 * Servei d'integració amb Stripe
 * Documentació: https://stripe.com/docs/api
 */

import { loadStripe } from '@stripe/stripe-js';

// Carregar Stripe amb la clau pública de l'entorn
// Per defecte, usem una clau de test si no està configurada
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_DEMO_KEY';

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};

export const createPaymentIntent = async (items, shippingZone = 'es_peninsula', currency = 'eur', opts = {}) => {
  try {
    const response = await fetch('/.netlify/functions/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        shippingZone,
        currency,
        email: opts.email || undefined,
        userId: opts.userId || undefined,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Error creant Payment Intent');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
