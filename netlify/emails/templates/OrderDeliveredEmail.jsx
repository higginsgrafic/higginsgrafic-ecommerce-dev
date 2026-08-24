import { EmailLayout } from '../components/EmailLayout.jsx';

export function OrderDeliveredEmail({ order = {} }) {
  const clientName = order.first_name || 'Maria';
  const orderNumber = order.order_number || order.id || 'HG3EVTEMDTUJ3U';

  return (
    <EmailLayout
      statusText="Actualització d'estat"
      labelText="COMANDA ENTREGADA!"
      clientName={clientName}
      messageContent={
        <span>
          El transportista ha confirmat que el teu paquet ha estat lliurat a l'adreça indicada. Esperem que en gaudeixis i que et tornem a veure ben aviat a Higgins GRÀFIC.
        </span>
      }
      ctaText="Si tens cap dubte o consulta, contacta'ns >"
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
        Recorda que disposes de fins a 14 dies naturals, des d'avui mateix, per a exercir el teu dret al desisitiment.
      </div>
    </EmailLayout>
  );
}

export const orderDeliveredMeta = {
  subject: (order) => `Comanda entregada #${order?.order_number || order?.id || ''}`,
};
