import { EmailLayout } from '../components/EmailLayout.jsx';

export function ContactReceivedEmail({ data = {} }) {
  const clientName = data.first_name || data.name || 'Maria';
  const userMessage =
    data.message ||
    'Hola, volia saber si teniu previst llançar la samarreta "The Phoenix" en talla 3XL properament. Moltes gràcies!';

  return (
    <EmailLayout
      statusText="Atenció al client"
      labelText="MISSATGE REBUT"
      clientName={clientName}
      messageContent={
        <span>
          Hem rebut la teva consulta correctament. El nostre equip la revisarà i et respondrà al més aviat possible (dins les properes 48 hores).
        </span>
      }
      ctaText="Torna a la botiga >"
      ctaUrl="https://higginsgrafic.com"
    >
      {/* User Message Box (E, 16) to (T, 22) */}
      <div
        style={{
          margin: '0 auto 16px auto',
          width: '100%',
          maxWidth: '346.67px',
          height: '182px',
          boxSizing: 'border-box',
          border: '1px solid #141414',
          borderRadius: '10px',
          backgroundColor: 'transparent',
          padding: '20px 20px',
          fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
          fontSize: '10.05pt',
          fontWeight: 400,
          color: '#141414',
          lineHeight: '1.35',
          textAlign: 'left',
          overflow: 'auto',
        }}
      >
        {userMessage}
      </div>
    </EmailLayout>
  );
}

export const contactReceivedMeta = {
  subject: () => 'Missatge rebut — Atenció al client',
};
