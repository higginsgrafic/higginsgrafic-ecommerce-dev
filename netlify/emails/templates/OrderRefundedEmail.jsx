import { EmailLayout } from '../components/EmailLayout.jsx';

function formatPrice(n) {
  return `${(Number(n) || 0).toFixed(2).replace('.', ',')} €`;
}

export function OrderRefundedEmail({ order = {} }) {
  const clientName = order.first_name || '';
  const orderNumber = order.order_number || order.id || 'HG8M2K9PX4';
  const refundAmount = formatPrice(order.refund_amount || order.total || 0);

  return (
    <EmailLayout
      statusText="Actualització d'estat"
      labelText="REEMBORSAMENT EFECTUAT"
      clientName={clientName}
      messageText="La teva comanda ha estat cancel·lada i hem processat el reemborsament íntegre de l'import a través del mateix mètode de pagament utilitzat."
    >
      {/* Refund Amount Pill */}
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
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.5px',
                color: '#666666',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              Comanda #{orderNumber}
            </div>
            <div
              style={{
                fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                fontSize: '26px',
                fontWeight: 700,
                letterSpacing: '1px',
                color: '#141414',
                margin: 0,
              }}
            >
              {refundAmount}
            </div>
          </td>
        </tr>
      </table>

      {/* Bank notice */}
      <div
        style={{
          fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
          fontSize: '14px',
          fontWeight: 400,
          color: '#141414',
          lineHeight: '1.6',
          textAlign: 'left',
          marginBottom: '28px',
        }}
      >
        El termini per veure reflectit l'abonament al teu compte o targeta sol ser d'entre 2 i 5 dies laborables segons la teva entitat bancària.
      </div>

      {/* Return to shop */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
          fontSize: '15px',
          fontWeight: 500,
          color: '#141414',
        }}
      >
        <a
          href="https://higginsgrafic.com"
          style={{
            color: '#141414',
            textDecoration: 'none',
            fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
            fontSize: '15px',
            fontWeight: 500,
          }}
        >
          Tornar a la botiga <span style={{ display: 'inline-block', marginLeft: '6px' }}>&rsaquo;</span>
        </a>
      </div>
    </EmailLayout>
  );
}

export const orderRefundedMeta = {
  subject: (order) => `Comanda cancel·lada i reemborsada #${order.order_number || order.id || ''}`,
};
