import { EmailLayout } from '../components/EmailLayout.jsx';

export function OrderInProductionEmail({ order = {} }) {
  const clientName = order.first_name || 'Maria';
  const orderNumber = order.order_number || order.id || 'HG3EVTEMDTUJ3U';

  return (
    <EmailLayout
      statusText="Actualització d'estat"
      labelText="NOMBRE DE COMANDA"
      clientName={clientName}
      messageContent={
        <span>
          Acabem d'enviar la teva comanda a producció. Amb el <strong>nombre de comanda</strong> podràs estar al cas dels canvis d'estat i de la seva evolució.
        </span>
      }
      ctaText="Torna a la botiga >"
      ctaUrl="https://higginsgrafic.com"
    >
      {/* Order Number Box (E, 16) to (T, 19) */}
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
        #{orderNumber}
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
        Recorda que el temps estimat de producció és de 2 a 5 dies laborables.
      </div>
    </EmailLayout>
  );
}

export const orderInProductionMeta = {
  subject: (order) => `Comanda en producció #${order?.order_number || order?.id || ''}`,
};


