import { EmailLayout } from '../components/EmailLayout.jsx';

function formatPrice(n) {
  return `${(Number(n) || 0).toFixed(2).replace('.', ',')} €`;
}

export function OrderRefundedEmail({ order = {} }) {
  const clientName = order.first_name || 'Maria';
  const orderNumber = order.order_number || order.id || 'HG3V8TM4RF';
  const refundAmount = formatPrice(order.refund_amount || order.total || 42.68);

  return (
    <EmailLayout
      statusText="Actualització d'estat"
      labelText="COMANDA CANCEL·LADA"
      clientName={clientName}
      messageContent={
        <span>
          La comanda <strong>#{orderNumber}</strong> ha quedat cancel·lada. Hem iniciat el tràmit de reemborsament del mateix import que es va abonar, al mateix mètode de pagament de la transacció de compra.
        </span>
      }
      ctaText="Torna a la botiga >"
      ctaUrl="https://higginsgrafic.com"
    >
      {/* Box with Order number on top border and refund price inside (E, 16) to (T, 19) */}
      <div
        style={{
          position: 'relative',
          margin: '0 auto 16px auto',
          width: '100%',
          maxWidth: '346.67px',
          height: '104px',
          boxSizing: 'border-box',
          border: '1px solid #141414',
          borderRadius: '10px',
          textAlign: 'center',
          backgroundColor: 'transparent',
        }}
      >
        {/* Badge in top line */}
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#EEF0F4',
            padding: '0 8px',
            fontFamily: "'Roboto Condensed', 'Roboto', monospace, sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            color: '#666666',
          }}
        >
          #{orderNumber}
        </div>

        {/* Large Amount */}
        <div
          style={{
            fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
            fontSize: '24px',
            fontWeight: 700,
            color: '#141414',
            lineHeight: '102px',
          }}
        >
          {refundAmount}
        </div>
      </div>

      {/* Subtext */}
      <div
        style={{
          marginTop: '18px',
          fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
          fontSize: '10.05pt',
          fontWeight: 400,
          color: '#141414',
          lineHeight: '1.28',
          textAlign: 'left',
        }}
      >
        El termini per a veure reflectit l'abonament de l'import al teu compte sol trigar de 2 a 5 dies laborables.
      </div>
    </EmailLayout>
  );
}

export const orderRefundedMeta = {
  subject: (order) => `Comanda cancel·lada #${order.order_number || order.id || ''}`,
};
