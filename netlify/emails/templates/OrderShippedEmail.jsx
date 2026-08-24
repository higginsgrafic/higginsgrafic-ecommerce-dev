import { EmailLayout } from '../components/EmailLayout.jsx';

export function OrderShippedEmail({ order = {} }) {
  const clientName = order.first_name || 'Maria';
  const trackingNumber = order.tracking_number || 'RR123456789ES';

  return (
    <EmailLayout
      statusText="Actualització d'estat"
      labelText="CODI DE SEGUIMENT"
      clientName={clientName}
      messageContent={
        <span>
          El transportista ja té la teva comanda i en pocs dies la tindràs a l'adreça indicada. Amb <strong>aquest codi</strong> podràs seguir-ne el recorregut des del web de paqueteria.
        </span>
      }
      ctaText="Torna a la botiga >"
      ctaUrl="https://higginsgrafic.com"
    >
      {/* Tracking Box (E, 16) to (T, 19) */}
      <div
        style={{
          margin: '0 auto 16px auto',
          width: '100%',
          maxWidth: '346.67px',
          height: '104px',
          boxSizing: 'border-box',
          border: '1px solid #141414',
          borderRadius: '10px',
          backgroundColor: 'transparent',
          textAlign: 'center',
          lineHeight: '102px',
          fontFamily: "'Roboto Condensed', 'Roboto', monospace, sans-serif",
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '2px',
          color: '#141414',
          textTransform: 'uppercase',
        }}
      >
        {trackingNumber}
      </div>

      {/* Subtext */}
      <div
        style={{
          paddingTop: '15px',
          fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
          fontSize: '10.05pt',
          fontWeight: 400,
          color: '#141414',
          lineHeight: '1.28',
          textAlign: 'left',
        }}
      >
        Recorda que el nombre de seguiment pot trigar fins a 48 hores a activar-se al sistema del transportista.
      </div>
    </EmailLayout>
  );
}

export const orderShippedMeta = {
  subject: (order) => `Codi de seguiment #${order?.order_number || order?.id || ''}`,
};


