/**
 * Servei d'integració amb Stripe
 * Documentació: https://stripe.com/docs/api
 */

import { loadStripe } from '@stripe/stripe-js';
import { authHeaders } from '@/api/authHeaders';

/**
 * Estem fent una compra de prova?
 *
 * Ho decideix la pantalla d'eines de proves (`/admin/factures/proves`), que
 * desa aquesta marca al navegador. Quan és certa:
 *
 *   * la comanda neix amb `is_test = true`, i per tant el webhook NO gasta cap
 *     número de la sèrie fiscal: la factura serà `PROVA-`
 *   * tots els avisos de correu van a l'adreça de proves
 *   * res no s'envia a Gelato
 *
 * La marca viu al navegador i no a la base de dades a posta: si s'oblidés
 * encesa, el pitjor que pot passar és que una compra quedi marcada com a prova
 * — i el servidor ho atura, perquè només un administrador la pot demanar.
 */
export const CLAU_MODE_PROVES = 'hg-mode-proves';

export const modeProvesActiu = () => {
  try { return window.localStorage.getItem(CLAU_MODE_PROVES) === '1'; } catch { return false; }
};

export const activaModeProves = (actiu) => {
  try {
    if (actiu) window.localStorage.setItem(CLAU_MODE_PROVES, '1');
    else window.localStorage.removeItem(CLAU_MODE_PROVES);
  } catch { /* sense localStorage, la marca simplement no s'aplica */ }
};

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
    // En mode de proves la comanda s'ha de marcar com a tal, i el servidor
    // exigeix administrador per acceptar-la: per això s'hi envien les
    // capçaleres d'autenticació.
    const esProva = opts.isTest === true || modeProvesActiu();
    const headers = esProva
      ? await authHeaders({ 'Content-Type': 'application/json' })
      : { 'Content-Type': 'application/json' };

    const response = await fetch('/.netlify/functions/create-payment-intent', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        items,
        shippingZone,
        currency,
        email: opts.email || undefined,
        userId: opts.userId || undefined,
        shipping: opts.shipping || undefined,
        is_test: esProva || undefined,
        // Dades de facturació B2B (empresa i CIF). El formulari les demanava
        // i s'acabaven llençant, així que el comerciant no podia emetre
        // factura. El servidor les desa a les metadades del pagament.
        invoice: opts.invoice || undefined,
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
