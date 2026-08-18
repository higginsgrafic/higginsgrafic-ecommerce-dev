import { EmailLayout } from '../components/EmailLayout.jsx';

const BG_URL = '/placeholders/tots_els_fons/fons_correu/fons-correu-comanda.png';

export function OrderInProductionEmail({ order }) {
  const clientName = order.first_name || '';
  const orderNumber = order.order_number || order.id || 'HG8M2K9PX4';

  return (
    <EmailLayout
      bgUrl={BG_URL}
      clientName={clientName}
      labelText="Nombre de comanda"
      messageText="La teva comanda ja ha entrat a la línia de producció."
    >
      {/* Reminder */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(60.71% + 30px)',
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
        Recorda que el temps estimat de producció és de 2 a 5 dies laborables.
      </div>

      {/* Pill: order number */}
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
        #{orderNumber}
      </div>
    </EmailLayout>
  );
}

export const orderInProductionMeta = {
  subject: (order) => `Comanda en producció #${order.order_number || order.id || ''}`,
};
