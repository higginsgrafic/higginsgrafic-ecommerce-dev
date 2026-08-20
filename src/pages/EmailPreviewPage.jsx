import { render } from '@react-email/render';
import { createElement, useState, useEffect } from 'react';
import { OrderConfirmedEmail } from '../../netlify/emails/templates/OrderConfirmedEmail.jsx';
import { OrderInProductionEmail } from '../../netlify/emails/templates/OrderInProductionEmail.jsx';
import { OrderShippedEmail } from '../../netlify/emails/templates/OrderShippedEmail.jsx';
import { OrderDeliveredEmail } from '../../netlify/emails/templates/OrderDeliveredEmail.jsx';
import { OrderRefundedEmail } from '../../netlify/emails/templates/OrderRefundedEmail.jsx';
import { OrderFailedEmail } from '../../netlify/emails/templates/OrderFailedEmail.jsx';
import { WelcomeEmail } from '../../netlify/emails/templates/WelcomeEmail.jsx';
import { PasswordResetEmail } from '../../netlify/emails/templates/PasswordResetEmail.jsx';
import { ContactReceivedEmail } from '../../netlify/emails/templates/ContactReceivedEmail.jsx';

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

const TEMPLATE_CONFIGS = [
  { id: 'confirmed', name: '1. Comanda confirmada', category: 'Comandes', Component: OrderConfirmedEmail, propKey: 'order' },
  { id: 'production', name: '2. Comanda en producció', category: 'Comandes', Component: OrderInProductionEmail, propKey: 'order' },
  { id: 'shipped', name: '3. Comanda enviada', category: 'Comandes', Component: OrderShippedEmail, propKey: 'order' },
  { id: 'delivered', name: '4. Comanda lliurada', category: 'Comandes', Component: OrderDeliveredEmail, propKey: 'order' },
  { id: 'refunded', name: '5. Reemborsament efectuat', category: 'Comandes', Component: OrderRefundedEmail, propKey: 'order' },
  { id: 'failed', name: '6. Pagament no processat', category: 'Comandes', Component: OrderFailedEmail, propKey: 'order' },
  { id: 'welcome', name: '7. Benvinguda (Compte)', category: 'Usuaris', Component: WelcomeEmail, propKey: 'user' },
  { id: 'reset', name: '8. Recuperar contrasenya', category: 'Usuaris', Component: PasswordResetEmail, propKey: 'data' },
  { id: 'contact', name: '9. Missatge rebut (Contacte)', category: 'Suport', Component: ContactReceivedEmail, propKey: 'data' },
];

export default function EmailPreviewPage() {
  const [itemCount, setItemCount] = useState(2);
  const [activeTab, setActiveTab] = useState('tots');
  const [rendered, setRendered] = useState([]);

  useEffect(() => {
    async function doRender() {
      const currentItems = ALL_SAMPLE_ITEMS.slice(0, itemCount);
      const totalQty = currentItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
      const subtotal = currentItems.reduce((acc, it) => acc + it.price * (it.quantity || 1), 0);
      
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
        refund_amount: total,
        tracking_number: 'RR123456789ES',
        tracking_carrier: 'Correos',
        tracking_url: 'https://www.correos.es/seguimiento',
      };

      const dynamicUser = {
        first_name: 'Marc',
        email: 'marc@example.com',
        account_url: 'https://higginsgrafic.com',
      };

      const dynamicPasswordReset = {
        first_name: 'Marc',
        email: 'marc@example.com',
        reset_url: 'https://higginsgrafic.com/reset-password?token=mock_token_123',
      };

      const dynamicContact = {
        first_name: 'Marc',
        email: 'marc@example.com',
        message: 'Hola, volia saber si teniu previst llançar la samarreta "First Contact" en talla XXL properament. Moltes gràcies!',
      };

      const payloadMap = {
        order: dynamicOrder,
        user: dynamicUser,
        data: dynamicPasswordReset,
      };

      const results = await Promise.all(
        TEMPLATE_CONFIGS.map(async ({ id, name, category, Component, propKey }) => {
          let payload = payloadMap[propKey] || dynamicOrder;
          if (id === 'contact') payload = dynamicContact;

          const html = await render(createElement(Component, { [propKey]: payload }));
          return { id, name, category, html };
        })
      );
      setRendered(results);
    }
    doRender();
  }, [itemCount]);

  const categories = ['tots', 'Comandes', 'Usuaris', 'Suport'];
  const filtered = activeTab === 'tots' ? rendered : rendered.filter((r) => r.category === activeTab);

  return (
    <div style={{ margin: 0, padding: '32px 16px', background: '#F5F5F7', fontFamily: "'Roboto', sans-serif", minHeight: '100vh' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', color: '#141414', margin: 0, fontWeight: 700 }}>
            Plantilles de correu ({rendered.length})
          </h1>

          {/* Item count switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>Articles:</span>
            {[1, 2, 4, 8].map((n) => (
              <button
                key={n}
                onClick={() => setItemCount(n)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  background: itemCount === n ? '#141414' : '#FFF',
                  color: itemCount === n ? '#FFF' : '#141414',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: activeTab === cat ? '#141414' : '#E2E4E9',
                backgroundColor: activeTab === cat ? '#141414' : '#FFFFFF',
                color: activeTab === cat ? '#FFFFFF' : '#666666',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {rendered.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>Renderitzant plantilles...</p>}

      {filtered.map(({ name, html }) => (
        <section key={name} style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '16px', color: '#141414', marginBottom: '14px', textAlign: 'center', fontWeight: 600 }}>
            {name}
          </h2>
          <div
            style={{ width: '520px', maxWidth: '100%', margin: '0 auto', overflow: 'hidden' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>
      ))}
    </div>
  );
}

