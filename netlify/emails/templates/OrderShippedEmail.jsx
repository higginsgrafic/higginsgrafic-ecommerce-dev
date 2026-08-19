import { EmailLayout } from '../components/EmailLayout.jsx';

export function OrderShippedEmail({ order }) {
  const tracking = order.tracking_number || '';
  const clientName = order.first_name || '';
  const trackingUrl = order.tracking_url || 'https://www.correos.es/seguimiento';

  return (
    <EmailLayout
      clientName={clientName}
      labelText="NOMBRE DE SEGUIMENT"
      messageText="La comanda que has demanat serà en repartiment ben aviat. Aquí tens el nombre de seguiment."
    >
      {/* Tracking Number Pill */}
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
              {tracking}
            </div>
          </td>
        </tr>
      </table>

      {/* Reminder */}
      <div
        style={{
          fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
          fontSize: '14px',
          fontWeight: 400,
          color: '#141414',
          lineHeight: '1.6',
          textAlign: 'left',
          marginBottom: '36px',
        }}
      >
        Recorda que el nombre de seguiment pot trigar fins a 48 hores a activar-se al sistema del transportista.
      </div>

      {/* Track link */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
          fontSize: '16px',
          fontWeight: 400,
          color: '#141414',
        }}
      >
        <a
          href={trackingUrl}
          style={{
            color: '#141414',
            textDecoration: 'none',
            fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          Segueix el paquet <span style={{ display: 'inline-block', marginLeft: '12px' }}>&rsaquo;</span>
        </a>
      </div>
    </EmailLayout>
  );
}

export const orderShippedMeta = {
  subject: (order) => `Comanda enviada #${order.order_number || order.id || ''}`,
};


