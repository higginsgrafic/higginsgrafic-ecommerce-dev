import { EmailLayout } from '../components/EmailLayout.jsx';

export function OrderFailedEmail({ order = {} }) {
  const clientName = order.first_name || 'Maria';

  return (
    <EmailLayout
      statusText="Actualització d'estat"
      labelText="PAGAMENT NO COMPLETAT"
      clientName={clientName}
      messageContent={
        <span>
          El pagament de la comanda no s'ha confirmat i, per tant, no hem pogut efectuar el càrrec. Si creus que és un error pots contactar amb nosaltres i mirarem d'ajudar-te.
        </span>
      }
      ctaText="Torna a la botiga >"
      ctaUrl="https://higginsgrafic.com"
    >
      <div style={{ textAlign: 'center', margin: '18px 0 12px 0' }}>
        {/* Email link */}
        <div style={{ marginBottom: '16px' }}>
          <a
            href="mailto:hola@higginsgrafic.com"
            style={{
              fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
              fontSize: '10.05pt',
              fontWeight: 700,
              color: '#141414',
              textDecoration: 'none',
            }}
          >
            hola@higginsgrafic.com
          </a>
        </div>

        {/* WhatsApp Button */}
        <div style={{ marginBottom: '12px' }}>
          <a
            href="https://wa.me/34000000000?text=Hola%20Higgins%20GR%C3%80FIC%2C%20tinc%20una%20q%C3%BCesti%C3%B3%20sobre%20una%20comanda."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              width: '160px',
              backgroundColor: '#55C86A',
              color: '#FFFFFF',
              fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              padding: '10px 0',
              borderRadius: '6px',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            WhatsApp
          </a>
        </div>

        {/* Telegram Button */}
        <div>
          <a
            href="https://t.me/higginsgrafic"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              width: '160px',
              backgroundColor: '#2A82C9',
              color: '#FFFFFF',
              fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              padding: '10px 0',
              borderRadius: '6px',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Telegram
          </a>
        </div>
      </div>
    </EmailLayout>
  );
}

export const orderFailedMeta = {
  subject: (order) => `Pagament no processat #${order?.order_number || order?.id || ''}`,
};

