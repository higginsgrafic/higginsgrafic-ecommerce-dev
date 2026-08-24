import { render } from '@react-email/render';
import { createElement, useState, useEffect } from 'react';
import { WelcomeEmail } from '../../netlify/emails/templates/WelcomeEmail.jsx';
import { OrderRefundedEmail } from '../../netlify/emails/templates/OrderRefundedEmail.jsx';
import { OrderFailedEmail } from '../../netlify/emails/templates/OrderFailedEmail.jsx';
import { ContactReceivedEmail } from '../../netlify/emails/templates/ContactReceivedEmail.jsx';
import { PasswordResetEmail } from '../../netlify/emails/templates/PasswordResetEmail.jsx';
import { OrderShippedEmail } from '../../netlify/emails/templates/OrderShippedEmail.jsx';
import { OrderDeliveredEmail } from '../../netlify/emails/templates/OrderDeliveredEmail.jsx';
import { OrderInProductionEmail } from '../../netlify/emails/templates/OrderInProductionEmail.jsx';
import { OrderConfirmedEmail } from '../../netlify/emails/templates/OrderConfirmedEmail.jsx';

function Grid24x28() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, 24).split('');
  const cols = Array.from({ length: 25 }, (_, i) => i);
  const rows = Array.from({ length: 29 }, (_, i) => i);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
      viewBox="0 0 24 28"
      preserveAspectRatio="none"
    >
      {/* Gradient Card Box (C, 6) to (V, 25): X from 2 to 22, Y from 5 to 25 */}
      <rect
        x="2"
        y="5"
        width="20"
        height="20"
        fill="none"
        stroke="#2563EB"
        strokeWidth="0.08"
      />

      {/* Content Box (E, 8) to (T, 24): X from 4 to 20, Y from 7 to 24 */}
      <rect
        x="4"
        y="7"
        width="16"
        height="17"
        fill="none"
        stroke="#EC4899"
        strokeWidth="0.08"
        strokeDasharray="0.3, 0.15"
      />

      {/* 24 Columns */}
      {cols.map((c) => (
        <line
          key={`col-${c}`}
          x1={c}
          y1="0"
          x2={c}
          y2="28"
          stroke={c === 0 || c === 24 || c === 2 || c === 22 ? '#2563EB' : 'rgba(37, 99, 235, 0.25)'}
          strokeWidth={c === 0 || c === 24 || c === 2 || c === 22 ? '0.07' : '0.025'}
        />
      ))}

      {/* 28 Rows */}
      {rows.map((r) => (
        <line
          key={`row-${r}`}
          x1="0"
          y1={r}
          x2="24"
          y2={r}
          stroke={r === 0 || r === 28 || r === 5 || r === 25 ? '#2563EB' : 'rgba(37, 99, 235, 0.25)'}
          strokeWidth={r === 0 || r === 28 || r === 5 || r === 25 ? '0.07' : '0.025'}
        />
      ))}

      {/* Column Letters (A-X) */}
      {letters.map((l, i) => (
        <text
          key={`col-lbl-${l}`}
          x={i + 0.5}
          y="0.7"
          fontSize="0.45"
          fill={i === 2 || i === 21 ? '#1D4ED8' : '#3B82F6'}
          fontWeight={i === 2 || i === 21 ? 'bold' : 'normal'}
          textAnchor="middle"
        >
          {l}
        </text>
      ))}

      {/* Row Numbers (1-28) */}
      {Array.from({ length: 28 }, (_, i) => i + 1).map((r) => (
        <text
          key={`row-lbl-${r}`}
          x="0.4"
          y={r - 0.3}
          fontSize="0.4"
          fill={r === 6 || r === 25 ? '#1D4ED8' : '#3B82F6'}
          fontWeight={r === 6 || r === 25 ? 'bold' : 'normal'}
          textAnchor="middle"
        >
          {r}
        </text>
      ))}
    </svg>
  );
}

const ALL_SAMPLE_ITEMS = [
  { name: 'The Phoenix', size: 'M', quantity: 1, price: 18.5 },
  { name: 'Maschinenmensch', size: 'L', quantity: 2, price: 18.75 },
  { name: 'First Contact', size: 'M', quantity: 1, price: 18.5 },
  { name: 'CUbe', size: 'L', quantity: 1, price: 18.5 },
  { name: 'Sense & Sensibility', size: 'S', quantity: 1, price: 22.0 },
  { name: 'Pemberley House', size: 'XL', quantity: 1, price: 19.5 },
  { name: 'Death Star 2D2', size: 'M', quantity: 1, price: 18.5 },
  { name: 'Pride & Prejudice', size: 'M', quantity: 1, price: 21.0 },
];

const TEMPLATE_CONFIGS = [
  { id: 'welcome', name: '1. Compte de client (HOLA!)', category: 'Usuaris', Component: WelcomeEmail, propKey: 'user', bgImage: null },
  { id: 'refunded', name: '2. Actualització d\'estat (COMANDA CANCEL·LADA)', category: 'Comandes', Component: OrderRefundedEmail, propKey: 'order', bgImage: '/emails/backgrounds/comanda-cancellada.png' },
  { id: 'failed', name: '3. Actualització d\'estat (PAGAMENT NO COMPLETAT)', category: 'Comandes', Component: OrderFailedEmail, propKey: 'order', bgImage: '/emails/backgrounds/pagament-no-completat.png' },
  { id: 'contact', name: '4. Atenció al client (MISSATGE REBUT)', category: 'Suport', Component: ContactReceivedEmail, propKey: 'data', bgImage: '/emails/backgrounds/missatge-rebut.png' },
  { id: 'reset', name: '5. Actualització d\'estat (RECUPERACIO DE CONTRASENYA)', category: 'Usuaris', Component: PasswordResetEmail, propKey: 'data', bgImage: '/emails/backgrounds/recuperacio-de-contrasenya.png' },
  { id: 'shipped', name: '6. Actualització d\'estat (CODI DE SEGUIMENT)', category: 'Comandes', Component: OrderShippedEmail, propKey: 'order', bgImage: '/emails/backgrounds/codi-de-seguiment.png' },
  { id: 'delivered', name: '7. Actualització d\'estat (COMANDA ENTREGADA!)', category: 'Comandes', Component: OrderDeliveredEmail, propKey: 'order', bgImage: '/emails/backgrounds/comanda-entregada.png' },
  { id: 'production', name: '8. Actualització d\'estat (NOMBRE DE COMANDA)', category: 'Comandes', Component: OrderInProductionEmail, propKey: 'order', bgImage: '/emails/backgrounds/nombre-de-comanda.png' },
  { id: 'confirmed', name: '9. Actualització d\'estat (GRÀCIES PER LA COMPRA!)', category: 'Comandes', Component: OrderConfirmedEmail, propKey: 'order', bgImage: '/emails/backgrounds/pagament-confirmat.png' },
];

export default function EmailPreviewPage() {
  const [itemCount, setItemCount] = useState(2);
  const [activeTab, setActiveTab] = useState('tots');
  const [viewMode, setViewMode] = useState('html-only'); // 'overlay', 'side-by-side', 'html-only', 'bg-only'
  const [bgOpacity, setBgOpacity] = useState(0.5);
  const [redText, setRedText] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [rendered, setRendered] = useState([]);

  useEffect(() => {
    async function doRender() {
      const currentItems = ALL_SAMPLE_ITEMS.slice(0, itemCount);
      
      const dynamicOrder = {
        order_number: 'HG3EVTEMDTUJ3U',
        email: 'client@example.com',
        first_name: 'Maria',
        items: currentItems,
        shipping_cost: 4.29,
        iva: 8.89,
        total: 55.50,
        refund_amount: 42.68,
        tracking_number: 'RR123456789ES',
        tracking_carrier: 'Correos',
        tracking_url: 'https://www.correos.es/seguimiento',
      };

      const dynamicUser = {
        first_name: 'Maria',
        email: 'maria@example.com',
        account_url: 'https://higginsgrafic.com',
      };

      const dynamicPasswordReset = {
        first_name: 'Maria',
        email: 'maria@example.com',
        reset_url: 'https://higginsgrafic.com/reset-password?token=mock_token_123',
      };

      const dynamicContact = {
        first_name: 'Maria',
        email: 'maria@example.com',
        message: 'Hola, volia saber si teniu previst llançar la samarreta "The Phoenix" en talla 3XL properament. Moltes gràcies!',
      };

      const payloadMap = {
        order: dynamicOrder,
        user: dynamicUser,
        data: dynamicPasswordReset,
      };

      const results = await Promise.all(
        TEMPLATE_CONFIGS.map(async ({ id, name, category, Component, propKey, bgImage }) => {
          let payload = payloadMap[propKey] || dynamicOrder;
          if (id === 'contact') payload = dynamicContact;

          const html = await render(createElement(Component, { [propKey]: payload }));
          return { id, name, category, html, bgImage };
        })
      );
      setRendered(results);
    }
    doRender();
  }, [itemCount]);

  const categories = ['tots', 'Comandes', 'Usuaris', 'Suport'];
  const filtered = activeTab === 'tots' ? rendered : rendered.filter((r) => r.category === activeTab);

  return (
    <div style={{ margin: 0, padding: '32px 16px', background: '#EAEBEF', fontFamily: "'Roboto', sans-serif", minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', color: '#141414', margin: 0, fontWeight: 700 }}>
              Plantilles de correu ({rendered.length})
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
              Compara les plantilles HTML amb les imatges de fons originals
            </p>
          </div>

          {/* Controls Bar */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* View Mode Selector */}
            <div style={{ display: 'flex', background: '#FFFFFF', padding: '3px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
              {[
                { id: 'overlay', label: 'Fons superposat' },
                { id: 'side-by-side', label: 'Costat a costat' },
                { id: 'html-only', label: 'Només HTML' },
                { id: 'bg-only', label: 'Només Imatge' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: viewMode === mode.id ? '#141414' : 'transparent',
                    color: viewMode === mode.id ? '#FFFFFF' : '#4B5563',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Opacity slider for overlay mode */}
            {viewMode === 'overlay' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '6px 12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
                <span style={{ fontSize: '12px', color: '#4B5563', fontWeight: 500 }}>Fons:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={bgOpacity}
                  onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                  style={{ width: '80px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#141414', fontWeight: 600, width: '36px' }}>
                  {Math.round(bgOpacity * 100)}%
                </span>
              </div>
            )}

            {/* Red Text Toggle Button */}
            <button
              onClick={() => setRedText(!redText)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: redText ? '#DC2626' : '#D1D5DB',
                backgroundColor: redText ? '#FEE2E2' : '#FFFFFF',
                color: redText ? '#DC2626' : '#4B5563',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: redText ? '#DC2626' : '#9CA3AF',
                }}
              />
              Text vermell
            </button>

            {/* 24x28 Grid Overlay Toggle Button */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: showGrid ? '#2563EB' : '#D1D5DB',
                backgroundColor: showGrid ? '#DBEAFE' : '#FFFFFF',
                color: showGrid ? '#1D4ED8' : '#4B5563',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '2px',
                  border: '1px solid currentColor',
                }}
              />
              Malla 24×28
            </button>

            {/* Item count switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFFFFF', padding: '4px 8px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Articles:</span>
              {[1, 2, 4, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setItemCount(n)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: itemCount === n ? '#141414' : 'transparent',
                    color: itemCount === n ? '#FFF' : '#141414',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: activeTab === cat ? '#141414' : '#D1D5DB',
                backgroundColor: activeTab === cat ? '#141414' : '#FFFFFF',
                color: activeTab === cat ? '#FFFFFF' : '#4B5563',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {rendered.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>Renderitzant plantilles...</p>}

      {/* Global style override when redText is enabled */}
      {redText && (
        <style>{`
          .email-preview-container * {
            color: #DC2626 !important;
            border-color: #DC2626 !important;
          }
          .email-preview-container svg * {
            stroke: #DC2626 !important;
          }
          .email-preview-container svg text {
            fill: #DC2626 !important;
          }
        `}</style>
      )}

      {filtered.map(({ id, name, html, bgImage }) => {
        const renderGrid = showGrid;
        return (
          <section key={name} style={{ marginBottom: '56px' }}>
            <h2 style={{ fontSize: '16px', color: '#141414', marginBottom: '14px', textAlign: 'center', fontWeight: 600 }}>
              {name}
            </h2>

            {/* Render based on viewMode */}
            {viewMode === 'side-by-side' ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                {/* HTML Column */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#666', textAlign: 'center', marginBottom: '6px' }}>
                    Versió HTML
                  </div>
                  <div
                    className="email-preview-container"
                    style={{
                      position: 'relative',
                      width: '520px',
                      maxWidth: '100%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    {renderGrid && <Grid24x28 />}
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                  </div>
                </div>

                {/* Original Mockup Column */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#666', textAlign: 'center', marginBottom: '6px' }}>
                    Imatge Original
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      width: '520px',
                      maxWidth: '100%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    {renderGrid && <Grid24x28 />}
                    {bgImage ? (
                      <img
                        src={bgImage}
                        alt={name}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    ) : (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                        Sense imatge de referència
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : viewMode === 'bg-only' ? (
              <div
                style={{
                  position: 'relative',
                  width: '520px',
                  maxWidth: '100%',
                  margin: '0 auto',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {renderGrid && <Grid24x28 />}
                {bgImage ? (
                  <img
                    src={bgImage}
                    alt={name}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                    Sense imatge de referència
                  </div>
                )}
              </div>
            ) : (
              /* Overlay / HTML-only with background image underneath */
              <div
                style={{
                  position: 'relative',
                  width: '520px',
                  maxWidth: '100%',
                  margin: '0 auto',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {/* Grid 24x28 */}
                {renderGrid && <Grid24x28 />}

                {/* Background Reference Image */}
                {viewMode === 'overlay' && bgImage && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `url(${bgImage})`,
                      backgroundSize: '100% auto',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'top center',
                      opacity: bgOpacity,
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}
                  />
                )}

                {/* HTML Content */}
                <div
                  className="email-preview-container"
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    opacity: viewMode === 'overlay' && bgImage ? (1 - bgOpacity * 0.3) : 1,
                  }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

