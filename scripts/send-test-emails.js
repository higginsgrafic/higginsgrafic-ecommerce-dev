import dotenv from 'dotenv';
dotenv.config();

import { sendOrderEmail } from '../netlify/functions/_email.js';

const RECIPIENT = 'higginsgrafic@gmail.com';

const SAMPLE_ITEMS = [
  { name: 'The Phoenix', size: 'M', quantity: 1, price: 18.5 },
  { name: 'Maschinenmensch', size: 'L', quantity: 2, price: 18.75 },
];

const TEMPLATE_PAYLOADS = [
  {
    key: 'welcome',
    name: '1. Welcome (HOLA!)',
    payload: {
      email: RECIPIENT,
      name: 'Marc Higgins',
      accountUrl: 'https://higginsgrafic.com/login',
      discountCode: 'BENVINGUT10',
    },
  },
  {
    key: 'order_refunded',
    name: "2. Order Refunded (COMANDA CANCEL·LADA)",
    payload: {
      email: RECIPIENT,
      orderNumber: 'HG-2026-0042',
      customerName: 'Marc Higgins',
      refundAmount: 56.00,
      originalTotal: 56.00,
      reason: 'Sol·licitud del client',
      items: SAMPLE_ITEMS,
    },
  },
  {
    key: 'order_failed',
    name: "3. Order Failed (PAGAMENT NO COMPLETAT)",
    payload: {
      email: RECIPIENT,
      orderNumber: 'HG-2026-0042',
      customerName: 'Marc Higgins',
      date: '25/08/2026',
      total: 56.00,
      retryUrl: 'https://higginsgrafic.com/cart',
      items: SAMPLE_ITEMS,
    },
  },
  {
    key: 'contact_received',
    name: '4. Contact Received (MISSATGE REBUT)',
    payload: {
      email: RECIPIENT,
      name: 'Marc Higgins',
      subject: 'Consulta sobre talla de samarreta',
      message: 'Hola equip de Gràfic! Voldria saber si les samarretes donen molta talla o si són ajustades. Gràcies!',
      receivedAt: '25/08/2026 00:45',
      ticketId: 'TCK-8821',
    },
  },
  {
    key: 'password_reset',
    name: '5. Password Reset (RECUPERACIÓ DE CONTRASENYA)',
    payload: {
      email: RECIPIENT,
      customerName: 'Marc Higgins',
      resetUrl: 'https://higginsgrafic.com/reset-password?token=demo-token-123456',
      expiresInHours: 24,
    },
  },
  {
    key: 'order_shipped',
    name: '6. Order Shipped (CODI DE SEGUIMENT)',
    payload: {
      email: RECIPIENT,
      orderNumber: 'HG-2026-0042',
      customerName: 'Marc Higgins',
      carrier: 'Correos Express',
      trackingNumber: 'CX-992834102-ES',
      trackingUrl: 'https://higginsgrafic.com/order-tracking?order=HG-2026-0042',
      estimatedDelivery: '28/08/2026',
      items: SAMPLE_ITEMS,
      shippingAddress: {
        street: 'Carrer Major 12, 1r 2a',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'Espanya',
      },
    },
  },
  {
    key: 'order_delivered',
    name: '7. Order Delivered (COMANDA ENTREGADA!)',
    payload: {
      email: RECIPIENT,
      orderNumber: 'HG-2026-0042',
      customerName: 'Marc Higgins',
      deliveryDate: '28/08/2026',
      items: SAMPLE_ITEMS,
      shippingAddress: {
        street: 'Carrer Major 12, 1r 2a',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'Espanya',
      },
    },
  },
  {
    key: 'order_in_production',
    name: '8. Order In Production (NOMBRE DE COMANDA)',
    payload: {
      email: RECIPIENT,
      orderNumber: 'HG-2026-0042',
      customerName: 'Marc Higgins',
      date: '25/08/2026',
      items: SAMPLE_ITEMS,
      subtotal: 56.00,
      shipping: 0.00,
      total: 56.00,
      estimatedDelivery: '28/08/2026 - 01/09/2026',
    },
  },
  {
    key: 'order_confirmed',
    name: '9. Order Confirmed (GRÀCIES PER LA COMPRA!)',
    payload: {
      email: RECIPIENT,
      orderNumber: 'HG-2026-0042',
      customerName: 'Marc Higgins',
      date: '25/08/2026',
      items: SAMPLE_ITEMS,
      subtotal: 56.00,
      shipping: 0.00,
      total: 56.00,
      shippingAddress: {
        street: 'Carrer Major 12, 1r 2a',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'Espanya',
      },
      trackingUrl: 'https://higginsgrafic.com/order-tracking?order=HG-2026-0042',
    },
  },
];

async function run() {
  console.log(`\n📨 Iniciant enviament de 9 correus de prova a: ${RECIPIENT}\n`);
  
  for (const t of TEMPLATE_PAYLOADS) {
    try {
      console.log(`Enviant [${t.name}]...`);
      const res = await sendOrderEmail(t.key, t.payload);
      if (res && res.id) {
        console.log(`  ✅ Enviat correctament (ID Resend: ${res.id})`);
      } else if (res && res.error) {
        console.error(`  ❌ Error: ${res.error}`);
      } else if (res && res.skipped) {
        console.warn(`  ⚠️ Omesa (skip)`);
      }
      // Petita pausa entre enviaments
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.error(`  ❌ Excepció:`, err.message);
    }
  }
  
  console.log('\n🏁 Procés completat!\n');
}

run();
