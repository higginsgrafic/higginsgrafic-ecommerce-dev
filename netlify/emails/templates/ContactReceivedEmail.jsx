import { EmailLayout } from '../components/EmailLayout.jsx';

export function ContactReceivedEmail({ data = {} }) {
  const clientName = data.first_name || data.name || '';
  const userMessage = data.message || '';

  return (
    <EmailLayout
      statusText="Atenció al client"
      labelText="MISSATGE REBUT"
      clientName={clientName}
      messageText="Hem rebut la teva consulta correctament. El nostre equip la revisarà i et respondrà al més aviat possible (habitualment en menys de 24 hores laborables)."
    >
      {/* Message Copy Box */}
      {userMessage && (
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
              style={{
                padding: '16px 20px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E4E9',
              }}
            >
              <div
                style={{
                  fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#666666',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Còpia del teu missatge:
              </div>
              <div
                style={{
                  fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#141414',
                  lineHeight: '1.5',
                  fontStyle: 'italic',
                }}
              >
                "{userMessage}"
              </div>
            </td>
          </tr>
        </table>
      )}

      {/* Direct Contact Buttons */}
      <table
        role="presentation"
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        border="0"
        style={{ width: '100%', margin: '0 auto' }}
      >
        <tr>
          <td align="center" style={{ padding: '0 0 10px 0' }}>
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
                    padding: '10px 28px',
                  }}
                >
                  <a
                    href="https://wa.me/34000000000?text=Hola%20Higgins%20GR%C3%80FIC%2C%20tinc%20una%20urg%C3%A8ncia%20sobre%20el%20meu%20missatge."
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
      </table>
    </EmailLayout>
  );
}

export const contactReceivedMeta = {
  subject: () => 'Hem rebut el teu missatge — Higgins GRÀFIC',
};
