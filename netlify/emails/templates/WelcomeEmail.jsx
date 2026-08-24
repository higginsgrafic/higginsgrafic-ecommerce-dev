import { EmailLayout } from '../components/EmailLayout.jsx';
import { Img } from '@react-email/components';

const EXPLANATION_IMG = '/emails/assets/imatge-explicativa.png';

export function WelcomeEmail({ user = {} }) {
  const clientName = user.first_name || user.fullName || user.name || 'Maria';
  const shopUrl = user.account_url || 'https://higginsgrafic.com';

  return (
    <EmailLayout
      statusText="Compte de client"
      labelText="HOLA!"
      clientName={clientName}
      messageContent={
        <span>
          El teu compte s'ha creat correctament. Ara pots veure l'estat de les teves comandes, contactar amb nosaltres a través del formulari directe o gestionar la teva adreça d'enviament des de la pestanya COMPTE, a la dreta del menú principal.
        </span>
      }
      ctaText="Entra a la botiga >"
      ctaUrl={shopUrl}
    >
      <div style={{ textAlign: 'center', margin: '0 auto', width: '100%', maxWidth: '346.67px' }}>
        <Img
          src={EXPLANATION_IMG}
          alt="Menú Compte"
          width="346"
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '346.67px',
            height: 'auto',
            margin: '0 auto',
            border: 0,
          }}
        />
      </div>
    </EmailLayout>
  );
}

export const welcomeMeta = {
  subject: () => 'Compte de client — HOLA!',
};

