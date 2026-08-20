import { EmailLayout } from '../components/EmailLayout.jsx';

export function PasswordResetEmail({ data = {} }) {
  const clientName = data.first_name || data.fullName || data.name || '';
  const resetUrl = data.reset_url || 'https://higginsgrafic.com/login';

  return (
    <EmailLayout
      statusText="Seguretat del compte"
      labelText="RECUPERACIÓ DE CONTRASENYA"
      clientName={clientName}
      messageText="Hem rebut una sol·licitud per canviar la contrasenya del teu compte. Clica el botó següent per definir-ne una de nova. Si no ho has demanat tu, pots ignorar aquest correu amb tranquil·litat."
    >
      {/* Action Button */}
      <table
        role="presentation"
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        border="0"
        style={{ width: '100%', margin: '0 0 24px 0' }}
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
                    href={resetUrl}
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
                    Restablir contrasenya &rsaquo;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      {/* Security notice */}
      <div
        style={{
          fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
          fontSize: '13px',
          fontWeight: 400,
          color: '#666666',
          lineHeight: '1.5',
          textAlign: 'center',
        }}
      >
        Aquest enllaç és d'un sol ús i caduca en 60 minuts per motius de seguretat.
      </div>
    </EmailLayout>
  );
}

export const passwordResetMeta = {
  subject: () => 'Restablir la contrasenya — Higgins GRÀFIC',
};
