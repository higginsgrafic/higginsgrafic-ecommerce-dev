import React from 'react';
import { Package, Search, UserRound, Check } from 'lucide-react';
import UserComandesContent from '@/components/fullwide/UserComandesContent';

const STATUS_DOT = {
  'PENDENT': '#9CA3AF',
  'CONFIRMADA': '#2F61B2',
  'EN PREPARACIÓ': '#7C3AED',
  'SEGUIMENT': '#0891B2',
  'EN REPARTIMENT': '#D97706',
  'ATURADA': '#DC2626',
  'CANCEL·LADA': '#991B1B',
  'ENTREGADA': '#16A34A',
};

const MOCK_ORDERS = [
  { num: '#00000000000000000000027', status: 'PENDENT', date: '12-07-26', active: true },
  { num: '#00000000000000000000026', status: 'EN PREPARACIÓ', date: '10-07-26', active: true },
  { num: '#00000000000000000000025', status: 'EN REPARTIMENT', date: '08-07-26', active: true },
  { num: '#00000000000000000000024', status: 'ENTREGADA', date: '03-07-26', active: false },
  { num: '#00000000000000000000023', status: 'ENTREGADA', date: '28-06-26', active: false },
  { num: '#00000000000000000000022', status: 'CANCEL·LADA', date: '25-06-26', active: false },
  { num: '#00000000000000000000021', status: 'ENTREGADA', date: '20-06-26', active: false },
  { num: '#00000000000000000000020', status: 'ENTREGADA', date: '15-06-26', active: false },
];

const MOCK_MESSAGES = [
  { from: 'Botiga Higgins', subject: 'La teva comanda #26 ja està en preparació', date: '10-07-26', unread: true },
  { from: 'Correos Express', subject: 'Seguiment #25 — En repartiment', date: '08-07-26', unread: true },
  { from: 'Botiga Higgins', subject: 'Confirmació de la comanda #27', date: '12-07-26', unread: true },
];

const MOCK_USER = {
  name: 'Martí Vidal i Castany',
  email: 'marti.vidal@higginsgrafic.cat',
  phone: '+34 678 452 193',
  company: 'Estudi Vidal S.L.',
  memberSince: 'Gener 2025',
  verified: true,
};

const MOCK_SECURITY = {
  cards: 2,
  cardsList: ['Visa •••• 4729', 'Mastercard •••• 8815'],
  twoFactor: true,
  lastPassword: 'fa 14 dies',
};

export default function MegaslidePagina4({
  orders,
  adminEmail,
  acordioExpandedPage4,
  accordionPautaScale,
}) {
  const displayOrders = orders.length > 0 ? orders : MOCK_ORDERS;
  const activeCount = displayOrders.filter(o => o.active).length;
  const deliveredCount = displayOrders.filter(o => o.status === 'ENTREGADA').length;
  const lastOrder = displayOrders[0];
  const unreadCount = MOCK_MESSAGES.filter(m => m.unread).length;

  const qvData = [
    {
      label: 'COMANDES',
      icon: Package,
      content: displayOrders.length > 0 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 300, fontSize: '28pt', color: '#2F3540', lineHeight: 1 }}>{displayOrders.length}</span>
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 300, fontSize: '9pt', color: '#2F3540', opacity: 0.6 }}>total</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 400, fontSize: '8.5pt', color: '#2F3540', opacity: 0.7 }}>{activeCount} actives</span>
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 400, fontSize: '8.5pt', color: '#2F3540', opacity: 0.5 }}>{deliveredCount} entregades</span>
          </div>
          {lastOrder && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: STATUS_DOT[lastOrder.status] || '#9CA3AF', flexShrink: 0 }} />
              <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 300, fontSize: '8pt', color: '#2F3540', opacity: 0.55, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {lastOrder.num} · {lastOrder.date}
              </span>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 200, fontSize: '14pt', color: '#2F3540', opacity: 0.5 }}>Cap comanda</span>
          <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 300, fontSize: '8.5pt', color: '#2F3540', opacity: 0.35 }}>encara no n'has fet cap</span>
        </div>
      ),
    },
    {
      label: 'MISSATGES',
      icon: Search,
      content: (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 300, fontSize: '28pt', color: '#2F3540', lineHeight: 1 }}>{MOCK_MESSAGES.length}</span>
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 300, fontSize: '9pt', color: '#2F3540', opacity: 0.6 }}>missatges</span>
          </div>
          <div style={{ marginTop: '6px' }}>
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 400, fontSize: '8.5pt', color: '#2F3540', opacity: 0.7 }}>{unreadCount} sense llegir</span>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2F61B2', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 300, fontSize: '8pt', color: '#2F3540', opacity: 0.55, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {MOCK_MESSAGES[0].from} · {MOCK_MESSAGES[0].date}
            </span>
          </div>
        </>
      ),
    },
    {
      label: 'COMPTE',
      icon: UserRound,
      content: adminEmail ? (
        <>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 300, fontSize: '16pt', color: '#2F3540', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {adminEmail.split('@')[0]}
          </div>
          <div style={{ marginTop: '6px' }}>
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 300, fontSize: '8.5pt', color: '#2F3540', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
              {adminEmail}
            </span>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 300, fontSize: '8pt', color: '#2F3540', opacity: 0.55 }}>Compte verificat</span>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 300, fontSize: '16pt', color: '#2F3540', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {MOCK_USER.name}
          </div>
          <div style={{ marginTop: '6px' }}>
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 300, fontSize: '8.5pt', color: '#2F3540', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
              {MOCK_USER.email}
            </span>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 300, fontSize: '8pt', color: '#2F3540', opacity: 0.55 }}>Membre des de {MOCK_USER.memberSince}</span>
          </div>
        </>
      ),
    },
    {
      label: 'SEGURETAT',
      icon: Check,
      content: (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 300, fontSize: '28pt', color: '#2F3540', lineHeight: 1 }}>{MOCK_SECURITY.cards}</span>
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 300, fontSize: '9pt', color: '#2F3540', opacity: 0.6 }}>targetes</span>
          </div>
          <div style={{ marginTop: '6px' }}>
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 400, fontSize: '8.5pt', color: '#2F3540', opacity: 0.6 }}>{MOCK_SECURITY.cardsList[0]}</span>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: MOCK_SECURITY.twoFactor ? '#16A34A' : '#D97706', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 300, fontSize: '8pt', color: '#2F3540', opacity: 0.55 }}>
              {MOCK_SECURITY.twoFactor ? 'Doble factor actiu' : 'Doble factor inactiu'}
            </span>
          </div>
        </>
      ),
    },
  ];

  return (
    <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
      <div style={{ flex: '1 1 auto' }} />

      <div style={{
        flex: '0 0 auto',
        width: 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))',
        maxWidth: 'none',
        position: 'relative',
        height: '100%',
        paddingLeft: '0px',
        paddingRight: '0px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Background PAUTA.jpg - darrere dels rectangles */}
        <div style={{
          display: 'none',
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100vw',
          height: '100%',
          backgroundImage: `url("/tmp/USER/MISSATGES%20(AMB).jpg?v=${Date.now()}")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'calc(50% - 8.5px) -596.5px',
          backgroundSize: '2038px 1527px',
          zIndex: 0,
          pointerEvents: 'none',
        }} />

        {/* ZONA 1: Slide - 4 rectangles individuals */}
        <div style={{
          width: '100%',
          height: '100%',
          flexShrink: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '7.5px',
          position: 'relative',
          zIndex: 1,
          transform: 'scale(0.94)',
          transformOrigin: 'top center',
        }}>
          {qvData.map(({ label, icon: Icon, content }) => (
            <div key={label} style={{
              backgroundColor: '#D4D7DC',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 18px',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}>
                <Icon size={18} strokeWidth={1.5} style={{ color: '#2F3540', opacity: 0.6 }} />
                <span style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 400,
                  fontSize: '15pt',
                  color: '#2F3540',
                  letterSpacing: '0.5px',
                }}>
                  {label}
                </span>
              </div>
              {content}
            </div>
          ))}
        </div>

        {/* Anchor invisible per a la guia belt2 (DEV) */}
        {!acordioExpandedPage4 && (
          <div
            aria-hidden="true"
            data-stripe-guide="accordion-pauta"
            style={{
              position: 'absolute',
              top: 'calc(100% + 1px)',
              left: 0,
              width: '1px',
              height: `${737.015 * accordionPautaScale}px`,
              pointerEvents: 'none',
              opacity: 0,
            }}
          />
        )}

        {/* Contingut de l'acordió - Overlay absolut full-width */}
        {acordioExpandedPage4 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            minHeight: '100vh',
            paddingTop: '40px',
            paddingBottom: '40px',
            zIndex: 10,
          }}>
            <div aria-hidden="true" style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100vw',
              height: '100%',
              minHeight: '100vh',
              backgroundColor: 'white',
              pointerEvents: 'none',
              zIndex: -1,
            }} />
            {/* Zona de la pauta — tot el contingut queda clippat als límits */}
            <div data-stripe-guide="accordion-pauta" style={{
              position: 'absolute',
              top: '1px',
              left: '50%',
              transform: `translateX(calc(-50% + 2px)) scale(${accordionPautaScale * 0.94})`,
              transformOrigin: 'top center',
              width: `calc(100% / (${accordionPautaScale} * 0.94) + 4px)`,
              height: '737.015px',
              overflow: 'hidden',
            }}>
              {/* Mockup JPG: ara es renderitza dins de UserComandesContent perquè depén de la pestanya activa */}
              <div style={{
                display: 'none',
                position: 'absolute',
                top: '-1px',
                left: '-280.5px',
                width: '100vw',
                height: '100vh',
                backgroundImage: `url("/tmp/USER/MISSATGES%20(AMB).jpg?v=${Date.now()}")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'calc(50% - 8.5px) -661.5px',
                backgroundSize: '2038px 1527px',
                pointerEvents: 'none',
              }} />

              {/* Contingut alineat amb la pauta */}
              <UserComandesContent userEmail={adminEmail} />

              {/* PAUTA-VERDA - Línies horitzontals (referència) */}
              {false && <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'url(/tmp/PAUTES/PAUTA-GENERAL.png)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 -1px',
                backgroundSize: '1350px 737.015px',
                opacity: 0.02,
                zIndex: 9999,
                pointerEvents: 'none',
              }} />}
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: '1 1 auto' }} />
    </div>
  );
}
