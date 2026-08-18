import { render } from '@react-email/render';
import { createElement } from 'react';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { OrderConfirmedEmail } from '../netlify/emails/templates/OrderConfirmedEmail.jsx';
import { OrderInProductionEmail } from '../netlify/emails/templates/OrderInProductionEmail.jsx';
import { OrderShippedEmail } from '../netlify/emails/templates/OrderShippedEmail.jsx';
import { OrderFailedEmail } from '../netlify/emails/templates/OrderFailedEmail.jsx';

const mockOrder = {
  order_number: 'HG-2026-0042',
  email: 'client@example.com',
  first_name: 'Marc',
  items: [
    { name: 'First Contact', size: 'M', quantity: 1, price: 18.50 },
    { name: 'CUbe', size: 'L', quantity: 2, price: 18.50 },
  ],
  shipping_cost: 4.29,
  iva: 8.89,
  total: 55.50,
  tracking_number: 'RR123456789ES',
  tracking_carrier: 'Correos',
  tracking_url: 'https://www.correos.es/seguimiento',
};

const templates = [
  { name: 'Pagament confirmat', Component: OrderConfirmedEmail },
  { name: 'En producció', Component: OrderInProductionEmail },
  { name: 'Comanda enviada', Component: OrderShippedEmail },
  { name: 'Pagament no processat', Component: OrderFailedEmail },
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, 'email-previews-all.html');

const bodies = await Promise.all(
  templates.map(async ({ name, Component }) => {
    const html = await render(createElement(Component, { order: mockOrder }));
    return `<section style="margin-bottom:40px">
      <h2 style="font-family:Roboto,sans-serif;font-size:18px;color:#333;margin-bottom:12px">${name}</h2>
      <div style="border:1px solid #ddd;padding:16px;overflow:auto">${html}</div>
    </section>`;
  })
);

const page = `<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Preview plantilles correu — Higgins GRÀFIC</title>
  <style>body{margin:0;padding:32px;background:#F5F5F7;font-family:Roboto,sans-serif}</style>
</head>
<body>
  <h1 style="font-size:24px;color:#333;margin-bottom:24px">Plantilles de correu</h1>
  ${bodies.join('\n')}
</body>
</html>`;

writeFileSync(outPath, page);
console.log('Preview written to:', outPath);
