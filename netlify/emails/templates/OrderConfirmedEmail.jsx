import { EmailLayout } from '../components/EmailLayout.jsx';
import { ItemsTable } from '../components/ItemsTable.jsx';
import { SummaryTable } from '../components/SummaryTable.jsx';

export function OrderConfirmedEmail({ order }) {
  const clientName = order.first_name || '';
  const items = parseItems(order);

  return (
    <EmailLayout
      clientName={clientName}
      labelText="DETALL DE LA COMANDA"
      messageText="La teva comanda ha estat confirmada. Ja s'està preparant tot perquè t'arribi ben aviat."
    >
      <ItemsTable items={items} />
      <SummaryTable order={order} />
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
  subject: (order) => `Comanda confirmada #${order.order_number || order.id || ''}`,
};

