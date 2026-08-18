import { render } from '@react-email/render';
import { createElement, useState, useEffect } from 'react';
import { OrderConfirmedEmail } from '../../netlify/emails/templates/OrderConfirmedEmail.jsx';
import { OrderInProductionEmail } from '../../netlify/emails/templates/OrderInProductionEmail.jsx';
import { OrderShippedEmail } from '../../netlify/emails/templates/OrderShippedEmail.jsx';
import { OrderFailedEmail } from '../../netlify/emails/templates/OrderFailedEmail.jsx';

const ALL_SAMPLE_ITEMS = [
  { name: 'First Contact', size: 'M', quantity: 1, price: 18.5 },
  { name: 'CUbe', size: 'L', quantity: 1, price: 18.5 },
  { name: 'Sense & Sensibility', size: 'S', quantity: 1, price: 22.0 },
  { name: 'Pemberley House', size: 'XL', quantity: 1, price: 19.5 },
  { name: 'Death Star 2D2', size: 'M', quantity: 1, price: 18.5 },
  { name: 'The Human Inside', size: 'L', quantity: 1, price: 24.0 },
  { name: 'Pride & Prejudice', size: 'M', quantity: 1, price: 21.0 },
  { name: 'Miscellània Poster', size: 'A3', quantity: 1, price: 15.0 },
];

const templates = [
  { name: 'Pagament confirmat', Component: OrderConfirmedEmail },
  { name: 'En producció', Component: OrderInProductionEmail },
  { name: 'Comanda enviada', Component: OrderShippedEmail },
  { name: 'Pagament no processat', Component: OrderFailedEmail },
];

export default function EmailPreviewPage() {
  const [itemCount, setItemCount] = useState(2);
  const [rendered, setRendered] = useState([]);

  useEffect(() => {
    async function doRender() {
      const currentItems = ALL_SAMPLE_ITEMS.slice(0, itemCount);
      const totalQty = currentItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
      const subtotal = currentItems.reduce((acc, it) => acc + it.price * (it.quantity || 1), 0);
      
      // Càlcul real de transport (Espanya: 4.29 primer + 1.39 addicionals, gratuït >= 50€)
      const shippingCost = subtotal >= 50 ? 0 : +(4.29 + (totalQty - 1) * 1.39).toFixed(2);
      const total = +(subtotal + shippingCost).toFixed(2);
      const iva = +(total * (0.21 / 1.21)).toFixed(2);

      const dynamicOrder = {
        order_number: 'HG8M2K9PX4',
        email: 'client@example.com',
        first_name: 'Marc',
        items: currentItems,
        shipping_cost: shippingCost,
        iva,
        total,
        tracking_number: 'RR123456789ES',
        tracking_carrier: 'Correos',
        tracking_url: 'https://www.correos.es/seguimiento',
      };

      const results = await Promise.all(
        templates.map(async ({ name, Component }) => {
          const html = await render(createElement(Component, { order: dynamicOrder }));
          return { name, html };
        })
      );
      setRendered(results);
    }
    doRender();
  }, [itemCount]);

  return (
    <div style={{ margin: 0, padding: '32px', background: '#F5F5F7', fontFamily: 'Roboto, sans-serif', minHeight: '100vh' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '24px', color: '#333', margin: 0 }}>Plantilles de correu</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Articles ({itemCount}):</span>
          {[1, 2, 4, 8].map((n) => (
            <button
              key={n}
              onClick={() => setItemCount(n)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                background: itemCount === n ? '#141414' : '#FFF',
                color: itemCount === n ? '#FFF' : '#141414',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      {rendered.length === 0 && <p style={{ textAlign: 'center' }}>Renderitzant...</p>}
      {rendered.map(({ name, html }) => (
        <section key={name} style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '18px', color: '#333', marginBottom: '12px', textAlign: 'center' }}>{name}</h2>
          <div
            style={{ width: '520px', maxWidth: '100%', margin: '0 auto', overflow: 'hidden' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>
      ))}
    </div>
  );
}
