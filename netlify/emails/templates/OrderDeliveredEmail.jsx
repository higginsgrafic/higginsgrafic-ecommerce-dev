import { EmailLayout } from '../components/EmailLayout.jsx';

export function OrderDeliveredEmail({ order = {} }) {
  const clientName = order.first_name || '';
  const orderNumber = order.order_number || order.id || 'HG8M2K9PX4';

  return (
    <EmailLayout
      statusText="Actualització d'estat"
      labelText="COMANDA LLIURADA"
      clientName={clientName}
      messageText="El transportista ha confirmat que el teu paquet ha estat lliurat a l'adreça indicada. Esperem que en gaudeixis força i que et tornem a veure, ben aviat, a Higgins GRÀFIC. Gràcies per la compra!"
    >
      {/* Order Number Pill */}
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

      {/* Reminder 14 days */}
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
        Recorda que disposes de 14 dies naturals, des d'avui mateix, per exercir el teu dret de desistiment.
      </div>

      {/* Support link */}
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
          href="https://higginsgrafic.com/contact"
          style={{
            color: '#141414',
            textDecoration: 'none',
            fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
            fontSize: '15px',
            fontWeight: 500,
          }}
        >
          Tens cap dubte o consulta? Contacta'ns <span style={{ display: 'inline-block', marginLeft: '6px' }}>&rsaquo;</span>
        </a>
      </div>
    </EmailLayout>
  );
}

export const orderDeliveredMeta = {
  subject: (order) => `Comanda lliurada #${order.order_number || order.id || ''}`,
};
