import { EmailLayout } from '../components/EmailLayout.jsx';

export function PasswordResetEmail({ data = {} }) {
  const clientName = data.first_name || data.fullName || data.name || '';
  const resetUrl = data.reset_url || 'https://higginsgrafic.com/login';

  return (
    <EmailLayout
      statusText="Seguretat del compte"
      labelText="RECUPERACIÓ DE CONTRASENYA"
      clientName={clientName}
      messageText="Hem rebut una sol·licitud per canviar la contrasenya del teu compte. Clica l'enllaç següent per definir-ne una de nova. Si no ho has demanat tu, pots ignorar aquest correu amb tranquil·litat."
    >
      {/* Action link */}
      <div
        style={{
          textAlign: 'center',
          fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
          fontSize: '16px',
          fontWeight: 400,
          color: '#141414',
          marginTop: '12px',
          marginBottom: '28px',
        }}
      >
        <a
          href={resetUrl}
          style={{
            color: '#141414',
            textDecoration: 'none',
            fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          Restableix la contrasenya <span style={{ display: 'inline-block', marginLeft: '12px' }}>&rsaquo;</span>
        </a>
      </div>

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
        Aquest enllaç és d'un sol ús i caducarà d'aquí a 60 minuts per motius de seguretat.
      </div>
    </EmailLayout>
  );
}

export const passwordResetMeta = {
  subject: () => 'Restablir la contrasenya — Higgins GRÀFIC',
};

