import { EmailLayout } from '../components/EmailLayout.jsx';

export function PasswordResetEmail({ data = {} }) {
  const clientName = data.first_name || data.fullName || data.name || 'Maria';
  const resetUrl = data.reset_url || 'https://higginsgrafic.com/reset-password';

  return (
    <EmailLayout
      statusText="Actualització d'estat"
      labelText="RECUPERACIO DE CONTRASENYA"
      clientName={clientName}
      messageContent={
        <span>
          Hem rebut una sol·licitud per canviar la contrasenya del teu compte. Clica l'enllaç de sota si vols establir-ne una de nova.
          <br />
          <br />
          <span style={{ display: 'block', marginTop: '-4px' }}>Si no l'has demanada tu pots ignorar aquest correu.</span>
        </span>
      }
      ctaText="Torna a la botiga >"
      ctaUrl="https://higginsgrafic.com"
    >
      {/* Reset password button box (E, 16) to (T, 19) */}
      <div style={{ margin: '0 auto 16px auto', width: '100%', maxWidth: '346.67px', textAlign: 'center' }}>
        <a
          href={resetUrl}
          style={{
            display: 'block',
            width: '100%',
            height: '104px',
            boxSizing: 'border-box',
            border: '1px solid #141414',
            borderRadius: '10px',
            backgroundColor: 'transparent',
            lineHeight: '102px',
            textDecoration: 'none',
            fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
            fontSize: '15px',
            fontWeight: 700,
            color: '#141414',
            textAlign: 'center',
          }}
        >
          Regenera la contrasenya &gt;
        </a>
      </div>

      {/* Security note */}
      <div
        style={{
          paddingTop: '9px',
          fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
          fontSize: '10.05pt',
          fontWeight: 400,
          color: '#141414',
          lineHeight: '1.28',
          textAlign: 'center',
        }}
      >
        Per motius de seguretat ,aquest enllaç és d'un sol ús i{' '}
        <strong>caducarà d'aquí a 30 minuts.</strong>
      </div>
    </EmailLayout>
  );
}

export const passwordResetMeta = {
  subject: () => 'Recuperació de contrasenya — Higgins GRÀFIC',
};

