import { EmailLayout } from '../components/EmailLayout.jsx';

const BG_URL = '/placeholders/tots_els_fons/fons_correu/fons-correu-simple.png';

export function OrderFailedEmail({ order }) {
  const clientName = order.first_name || '';

  return (
    <EmailLayout
      bgUrl={BG_URL}
      clientName={clientName}
      labelText="Pagament no processat"
      messageText={
        <>
          <span style={{ letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
            El pagament de la comanda no s'ha confirmat i, per tant,
          </span>
          <br />
          no hem pogut efectuar el càrrec. Si creus que és un
          <br />
          <span style={{ letterSpacing: '-0.35px', whiteSpace: 'nowrap' }}>
            error pots contactar amb nosaltres i mirarem d'ajudar-te.
          </span>
        </>
      }
    >
      {/* Contact column */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(50% + 95px)',
          left: '16.66%',
          width: '66.68%',
          transform: 'translateY(-50%)',
          textAlign: 'center',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <a
          href="mailto:hola@higginsgrafic.com"
          style={{
            fontFamily: 'Roboto,Helvetica,Arial,sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            color: '#141414',
            textDecoration: 'none',
            marginBottom: '4px',
          }}
        >
          hola@higginsgrafic.com
        </a>
        <a
          href="https://wa.me/34000000000?text=Hola%20Higgins%20GR%C3%80FIC%2C%20tinc%20una%20q%C3%BCesti%C3%B3%20sobre%20una%20comanda."
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '7px 20px',
            backgroundColor: '#25D366',
            borderRadius: '6px',
            color: '#FFFFFF',
            fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.5px',
            width: '140px',
            boxSizing: 'border-box',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
        <a
          href="https://t.me/higginsgrafic"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '7px 20px',
            backgroundColor: '#0088CC',
            borderRadius: '6px',
            color: '#FFFFFF',
            fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.5px',
            width: '140px',
            boxSizing: 'border-box',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.531 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Telegram
        </a>
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
          href="https://higginsgrafic.com"
          style={{
            color: '#141414',
            textDecoration: 'none',
            fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
            fontSize: '16px',
            fontWeight: 400,
          }}
        >
          Tornar a la botiga <span style={{ display: 'inline-block', marginLeft: '20px' }}>&rsaquo;</span>
        </a>
      </div>
    </EmailLayout>
  );
}

export const orderFailedMeta = {
  subject: (order) => `Pagament no processat #${order.order_number || order.id || ''}`,
};
