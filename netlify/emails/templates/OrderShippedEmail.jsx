import { EmailLayout } from '../components/EmailLayout.jsx';

const BG_URL = '/placeholders/tots_els_fons/fons_correu/fons-correu-seguiment.png';

export function OrderShippedEmail({ order }) {
  const tracking = order.tracking_number || '';
  const clientName = order.first_name || '';
  const trackingUrl = order.tracking_url || 'https://www.correos.es/seguimiento';

  return (
    <EmailLayout bgUrl={BG_URL} clientName={clientName}>
      {/* Pill: tracking number */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(50% + 25px)',
          left: '16.66%',
          width: '66.68%',
          transform: 'translateY(-50%)',
          textAlign: 'center',
          fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
          fontSize: '24px',
          fontWeight: 500,
          letterSpacing: '2px',
          color: '#141414',
          textTransform: 'uppercase',
          zIndex: 3,
        }}
      >
        {tracking}
      </div>

      {/* Reminder */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(60.71% + 15px)',
          left: '16.66%',
          width: '66.68%',
          textAlign: 'left',
          fontFamily: 'Roboto,Helvetica,Arial,sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: '#141414',
          lineHeight: '1.6',
          zIndex: 3,
        }}
      >
        Recorda que el nombre de seguiment pot trigar fins a 48 hores a activar-se al sitema del transportista.
      </div>

      {/* Track link */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(75% + 15px)',
          left: 0,
          width: '100%',
          textAlign: 'center',
          fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
          fontSize: '16px',
          fontWeight: 400,
          color: '#141414',
          zIndex: 3,
        }}
      >
        <a
          href={trackingUrl}
          style={{
            color: '#141414',
            textDecoration: 'none',
            fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
            fontSize: '16px',
            fontWeight: 400,
          }}
        >
          Segueix el paquet <span style={{ display: 'inline-block', marginLeft: '20px' }}>&rsaquo;</span>
        </a>
      </div>
    </EmailLayout>
  );
}

export const orderShippedMeta = {
  subject: (order) => `Comanda enviada #${order.order_number || order.id || ''}`,
};
