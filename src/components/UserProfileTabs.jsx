import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Plus, X, Package } from 'lucide-react';

const STATUS_LABELS = {
  pending: 'Pendent de pagament',
  paid: 'Pagament confirmat',
  preparing: 'En preparació',
  shipped: 'Enviada',
  delivered: 'Lliurada',
  cancelled: 'Cancel·lada',
  returned: 'Retornada',
};

const STATUS_COLORS = {
  pending: '#fff3cd',
  paid: '#d1ecf1',
  preparing: '#d1ecf1',
  shipped: '#d4edda',
  delivered: '#d4edda',
  cancelled: '#f8d7da',
  returned: '#f8d7da',
};

function OrdersTab({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Package className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
        <p style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '14pt', color: '#666' }}>
          Encara no tens cap comanda
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px' }}>
      <h3 style={titleStyle}>Les teves comandes</h3>
      {orders.map((order) => (
        <div key={order.id} style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '20px', alignItems: 'center' }}>
            <div>
              <div style={{ ...labelStyle, marginBottom: '4px' }}>Número</div>
              <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300 }}>
                {order.order_number || `#${order.id.slice(-6)}`}
              </div>
            </div>
            <div>
              <div style={{ ...labelStyle, marginBottom: '4px' }}>Data</div>
              <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300 }}>
                {new Date(order.created_at).toLocaleDateString('ca-ES')}
              </div>
            </div>
            <div>
              <div style={{ ...labelStyle, marginBottom: '4px' }}>Estat</div>
              <div style={{
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: '12pt',
                fontWeight: 300,
                backgroundColor: STATUS_COLORS[order.status] || '#e9ecef',
                padding: '4px 8px',
                display: 'inline-block',
              }}>
                {STATUS_LABELS[order.status] || order.status}
              </div>
            </div>
            <div>
              <div style={{ ...labelStyle, marginBottom: '4px' }}>Total</div>
              <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300 }}>
                {parseFloat(order.total || 0).toFixed(2)} €
              </div>
            </div>
            <button style={{
              padding: '6px 12px',
              fontFamily: 'Roboto Condensed, sans-serif',
              fontSize: '12pt',
              fontWeight: 400,
              backgroundColor: '#000',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}>Veure detalls</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountTab({ profile, addresses, onUpdateProfile }) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    company: profile?.company || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onUpdateProfile(formData);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '40px' }}>
      <div>
        <h3 style={titleStyle}>Dades Personals</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={fieldMargin}>
            <label style={labelStyle}>Nom complet</label>
            <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} style={inputStyle} />
          </div>
          <div style={fieldMargin}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={formData.email} disabled style={{ ...inputStyle, opacity: 0.6 }} />
          </div>
          <div style={fieldMargin}>
            <label style={labelStyle}>Telèfon</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
          </div>
          <div style={fieldMargin}>
            <label style={labelStyle}>Empresa</label>
            <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Opcional" style={inputStyle} />
          </div>
          <button type="submit" disabled={saving} style={{ padding: '8px 16px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 400, backgroundColor: '#000', color: 'white', border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Desant...' : 'Desar canvis'}
          </button>
          {saved && (
            <div style={{ color: '#155724', fontSize: '12pt', fontFamily: 'Roboto Condensed, sans-serif' }}>✓ Canvis desats correctament</div>
          )}
        </form>
      </div>

      <div>
        <h3 style={titleStyle}>Adreces</h3>
        {addresses && addresses.length > 0 ? (
          addresses.map((addr) => (
            <div key={addr.id} style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '12px', marginBottom: '12px' }}>
              <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300 }}>
                <strong>{addr.recipient_name}</strong><br />
                {addr.street}<br />
                {addr.postal_code} {addr.city}<br />
                {addr.country}
              </div>
              {addr.is_default && (
                <span style={{ fontSize: '11pt', color: '#155724', fontFamily: 'Roboto Condensed, sans-serif' }}>✓ Adreça per defecte</span>
              )}
            </div>
          ))
        ) : (
          <p style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', color: '#666' }}>No tens adreces guardades</p>
        )}
      </div>
    </div>
  );
}

export function UserProfileTabs({ onTabChange }) {
  const { user } = useAuth();
  const { profile, addresses, orders, loading, updateProfile } = useProfile();

  const [tabs] = useState([
    { id: '1', name: 'Comandes' },
    { id: '2', name: 'Compte' },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');

  const handleTabClick = (tabId) => {
    setActiveTabId(tabId);
    onTabChange?.(tabId);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        <p style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', color: '#666', marginTop: '12px' }}>Carregant dades…</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0',
        padding: '0',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={{
              flex: '1',
              paddingTop: '0',
              paddingRight: '16px',
              paddingBottom: '0',
              paddingLeft: '16px',
              fontFamily: 'Oswald, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              border: 'none',
              borderBottom: activeTabId === tab.id ? '3px solid #1E62B8' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTabId === tab.id ? '#1E62B8' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px',
              lineHeight: '1',
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        {activeTabId === '1' && <OrdersTab orders={orders} />}
        {activeTabId === '2' && <AccountTab profile={profile} addresses={addresses} onUpdateProfile={updateProfile} />}
      </div>
    </div>
  );
}

export function UserProfileContent({ activeTab }) {
  return null;
}
