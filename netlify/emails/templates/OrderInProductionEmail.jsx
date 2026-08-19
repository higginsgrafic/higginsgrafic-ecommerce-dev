import { EmailLayout } from '../components/EmailLayout.jsx';

export function OrderInProductionEmail({ order }) {
  const clientName = order.first_name || '';
  const orderNumber = order.order_number || order.id || 'HG8M2K9PX4';

  return (
    <EmailLayout
      clientName={clientName}
      labelText="NOMBRE DE COMANDA"
      messageText="La teva comanda ja ha entrat a la línia de producció."
    >
      <table
        role="presentation"
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        border="0"
        style={{ width: '100%', margin: '0 0 24px 0' }}
      >
        <tr>
          <td
            align="center"
            style={{
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E4E9',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '2px',
                color: '#141414',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              #{orderNumber}
            </div>
          </td>
        </tr>
      </table>

      <div
        style={{
          fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
          fontSize: '14px',
          fontWeight: 400,
          color: '#141414',
          lineHeight: '1.6',
          textAlign: 'left',
        }}
      >
        Recorda que el temps estimat de producció és de 2 a 5 dies laborables.
      </div>
    </EmailLayout>
  );
}

export const orderInProductionMeta = {
  subject: (order) => `Comanda en producció #${order.order_number || order.id || ''}`,
};


