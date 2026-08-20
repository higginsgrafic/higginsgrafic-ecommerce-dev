import { EmailLayout } from '../components/EmailLayout.jsx';

export function WelcomeEmail({ user = {} }) {
  const clientName = user.first_name || user.fullName || user.name || '';
  const accountUrl = user.account_url || 'https://higginsgrafic.com';

  return (
    <EmailLayout
      statusText="Compte de client"
      labelText="BENVINGUT A HIGGINS GRÀFIC"
      clientName={clientName}
      messageText="El teu compte s'ha creat correctament. Ara pots veure l'estat de les teves comandes, gestionar la teva adreça d'enviament, contactar amb nosaltres a través del formulari directe i gaudir de la botiga des del teu espai personal."
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
        }}
      >
        <a
          href={accountUrl}
          style={{
            color: '#141414',
            textDecoration: 'none',
            fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          Accedeix al compte <span style={{ display: 'inline-block', marginLeft: '12px' }}>&rsaquo;</span>
        </a>
      </div>
    </EmailLayout>
  );
}

export const welcomeMeta = {
  subject: () => 'Benvingut a Higgins GRÀFIC',
};

