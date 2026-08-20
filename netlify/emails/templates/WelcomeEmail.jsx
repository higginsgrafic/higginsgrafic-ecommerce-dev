import { EmailLayout } from '../components/EmailLayout.jsx';

export function WelcomeEmail({ user = {} }) {
  const clientName = user.first_name || user.fullName || user.name || '';
  const email = user.email || '';
  const accountUrl = user.account_url || 'https://higginsgrafic.com';

  return (
    <EmailLayout
      statusText="Compte d'usuari"
      labelText="BENVINGUT A HIGGINS GRÀFIC"
      clientName={clientName}
      messageText="El teu compte s'ha creat correctament. Ara pots consultar l'estat de les teves comandes, gestionar les teves adreces d'enviament i gaudir de la botiga des del teu espai personal."
    >
      {/* Account Info Pill */}
      {email && (
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
                padding: '14px 20px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E4E9',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#141414',
                  margin: 0,
                }}
              >
                {email}
              </div>
            </td>
          </tr>
        </table>
      )}

      {/* Action Button */}
      <table
        role="presentation"
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        border="0"
        style={{ width: '100%', margin: '0 0 12px 0' }}
      >
        <tr>
          <td align="center">
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
                    backgroundColor: '#141414',
                    borderRadius: '6px',
                    padding: '12px 28px',
                  }}
                >
                  <a
                    href={accountUrl}
                    style={{
                      color: '#FFFFFF',
                      fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                      fontSize: '15px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-block',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Accedir al meu compte &rsaquo;
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

export const welcomeMeta = {
  subject: () => 'Benvingut a Higgins GRÀFIC',
};
