import { render } from '@react-email/render';
import { createElement } from 'react';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { WelcomeEmail } from '../netlify/emails/templates/WelcomeEmail.jsx';
import { OrderRefundedEmail } from '../netlify/emails/templates/OrderRefundedEmail.jsx';
import { OrderFailedEmail } from '../netlify/emails/templates/OrderFailedEmail.jsx';
import { ContactReceivedEmail } from '../netlify/emails/templates/ContactReceivedEmail.jsx';
import { PasswordResetEmail } from '../netlify/emails/templates/PasswordResetEmail.jsx';
import { OrderShippedEmail } from '../netlify/emails/templates/OrderShippedEmail.jsx';
import { OrderDeliveredEmail } from '../netlify/emails/templates/OrderDeliveredEmail.jsx';
import { OrderInProductionEmail } from '../netlify/emails/templates/OrderInProductionEmail.jsx';
import { OrderConfirmedEmail } from '../netlify/emails/templates/OrderConfirmedEmail.jsx';

const mockOrder = {
  order_number: 'HG3EVTEMDTUJ3U',
  email: 'client@example.com',
  first_name: 'Maria',
  items: [
    { name: 'The Phoenix', size: 'M', quantity: 1, price: 18.50 },
    { name: 'Maschinenmensch', size: 'L', quantity: 2, price: 18.75 },
  ],
  shipping_cost: 4.29,
  iva: 8.89,
  total: 55.50,
  refund_amount: 42.68,
  tracking_number: 'RR123456789ES',
  tracking_carrier: 'Correos',
  tracking_url: 'https://www.correos.es/seguimiento',
};

const mockUser = {
  first_name: 'Maria',
  email: 'maria@example.com',
  account_url: 'https://higginsgrafic.com',
};

const mockPasswordReset = {
  first_name: 'Maria',
  email: 'maria@example.com',
  reset_url: 'https://higginsgrafic.com/reset-password?token=mock_token_123',
};

const mockContact = {
  first_name: 'Maria',
  email: 'maria@example.com',
  message: 'Hola, volia saber si teniu previst llançar la samarreta "The Phoenix" en talla 3XL properament. Moltes gràcies!',
};

const templates = [
  { name: '1. Compte de client (HOLA!)', Component: WelcomeEmail, propKey: 'user', payload: mockUser },
  { name: '2. Actualització d\'estat (COMANDA CANCEL·LADA!)', Component: OrderRefundedEmail, propKey: 'order', payload: mockOrder },
  { name: '3. Actualització d\'estat (PAGAMENT NO COMPLETAT)', Component: OrderFailedEmail, propKey: 'order', payload: mockOrder },
  { name: '4. Atenció al client (MISSATGE REBUT)', Component: ContactReceivedEmail, propKey: 'data', payload: mockContact },
  { name: '5. Actualització d\'estat (RECUPERACIO DE CONTRASENYA)', Component: PasswordResetEmail, propKey: 'data', payload: mockPasswordReset },
  { name: '6. Actualització d\'estat (CODI DE SEGUIMENT)', Component: OrderShippedEmail, propKey: 'order', payload: mockOrder },
  { name: '7. Actualització d\'estat (COMANDA ENTREGADA!)', Component: OrderDeliveredEmail, propKey: 'order', payload: mockOrder },
  { name: '8. Actualització d\'estat (NOMBRE DE COMANDA)', Component: OrderInProductionEmail, propKey: 'order', payload: mockOrder },
  { name: '9. Actualització d\'estat (GRÀCIES PER LA COMPRA!)', Component: OrderConfirmedEmail, propKey: 'order', payload: mockOrder },
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '../public/dev/email-bg-preview.html');

const bodies = await Promise.all(
  templates.map(async ({ name, Component, propKey, payload }) => {
    const html = await render(createElement(Component, { [propKey]: payload }));
    return `<section style="margin-bottom:48px">
      <h2 style="font-family:Roboto,sans-serif;font-size:16px;color:#141414;margin-bottom:14px;text-align:center">${name}</h2>
      <div style="max-width:520px;margin:0 auto;overflow:hidden">${html}</div>
    </section>`;
  })
);

const page = `<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Preview plantilles correu — Higgins GRÀFIC</title>
  <style>body{margin:0;padding:32px 16px;background:#F5F5F7;font-family:Roboto,sans-serif}</style>
</head>
<body>
  <h1 style="font-size:24px;color:#141414;margin-bottom:24px;text-align:center">Plantilles de correu (9)</h1>
  ${bodies.join('\n')}
</body>
</html>`;

writeFileSync(outPath, page);
console.log('Preview written to:', outPath);
