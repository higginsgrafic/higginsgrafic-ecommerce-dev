import { EmailLayout } from '../components/EmailLayout.jsx';
import { ItemsTable } from '../components/ItemsTable.jsx';
import { SummaryTable } from '../components/SummaryTable.jsx';
import { Link } from '@react-email/components';

export function OrderConfirmedEmail({ order = {} }) {
  const clientName = order.first_name || 'Maria';
  const items = parseItems(order);
  const trackingLink = order.tracking_link || null;

  return (
    <EmailLayout
      statusText="Actualització d'estat"
      labelText="GRÀCIES PER LA COMPRA!"
      clientName={clientName}
      messageContent={
        <span>
          Aquí tens el resum de la teva comanda. Aviat rebràs el nombre de comanda per a poder seguir l'evolució més còmodament.
        </span>
      }
      showCta={false}
    >
      <div style={{ marginTop: '-15px' }}>
        <ItemsTable items={items} />
        <SummaryTable order={order} />
        {trackingLink && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link
              href={trackingLink}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#141414',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                fontSize: '11pt',
                fontWeight: 500,
                borderRadius: '6px',
              }}
            >
              Segueix la teva comanda →
            </Link>
          </div>
        )}
      </div>
    </EmailLayout>
  );
}

function parseItems(order) {
  try {
    const raw = order.items;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') return JSON.parse(raw);
    return [];
  } catch {
    return [];
  }
}

export const orderConfirmedMeta = {
  subject: (order) => `Gràcies per la compra #${order?.order_number || order?.id || ''}`,
};

