import { EmailLayout } from '../components/EmailLayout.jsx';

export function OrderFailedEmail({ order }) {
  const clientName = order.first_name || '';

  return (
    <EmailLayout
      clientName={clientName}
      labelText="PAGAMENT NO PROCESSAT"
      messageText="El pagament de la comanda no s'ha confirmat i, per tant, no hem pogut efectuar el càrrec. Si creus que és un error pots contactar amb nosaltres i mirarem d'ajudar-te."
    >
      {/* Contact buttons and links */}
      <table
        role="presentation"
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        border="0"
        style={{ width: '100%', margin: '0 auto' }}
      >
        {/* Email contact */}
        <tr>
          <td align="center" style={{ padding: '8px 0 20px 0' }}>
            <a
              href="mailto:hola@higginsgrafic.com"
              style={{
                fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                fontSize: '15px',
                fontWeight: 500,
                color: '#141414',
                textDecoration: 'none',
              }}
            >
              hola@higginsgrafic.com
            </a>
          </td>
        </tr>

        {/* WhatsApp Button */}
        <tr>
          <td align="center" style={{ padding: '0 0 12px 0' }}>
            <table
              role="presentation"
              cellPadding="0"
              cellSpacing="0"
              border="0"
              style={{ margin: '0 auto' }}
            >
              <tr>
                <td
                  align="center"
                  style={{
                    backgroundColor: '#25D366',
                    borderRadius: '6px',
                    padding: '10px 32px',
                  }}
                >
                  <a
                    href="https://wa.me/34000000000?text=Hola%20Higgins%20GR%C3%80FIC%2C%20tinc%20una%20q%C3%BCesti%C3%B3%20sobre%20una%20comanda."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#FFFFFF',
                      fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-block',
                      letterSpacing: '0.5px',
                    }}
                  >
                    WhatsApp
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        {/* Telegram Button */}
        <tr>
          <td align="center" style={{ padding: '0 0 28px 0' }}>
            <table
              role="presentation"
              cellPadding="0"
              cellSpacing="0"
              border="0"
              style={{ margin: '0 auto' }}
            >
              <tr>
                <td
                  align="center"
                  style={{
                    backgroundColor: '#0088CC',
                    borderRadius: '6px',
                    padding: '10px 32px',
                  }}
                >
                  <a
                    href="https://t.me/higginsgrafic"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#FFFFFF',
                      fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-block',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Telegram
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        {/* Return to shop */}
        <tr>
          <td align="center" style={{ padding: '8px 0 0 0' }}>
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
              Tornar a la botiga &rsaquo;
            </a>
          </td>
        </tr>
      </table>
    </EmailLayout>
  );
}

export const orderFailedMeta = {
  subject: (order) => `Pagament no processat #${order.order_number || order.id || ''}`,
};

