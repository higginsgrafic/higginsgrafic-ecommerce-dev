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

// Funció per crear un Payment Intent
export const createPaymentIntent = async (amount, currency = 'eur') => {
  try {
    const response = await fetch('/.netlify/functions/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convertir a cèntims
        currency,
      }),
    });

    if (!response.ok) {
      throw new Error('Error creant Payment Intent');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
