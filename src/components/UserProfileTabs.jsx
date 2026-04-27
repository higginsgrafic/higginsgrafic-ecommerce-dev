import { useState } from 'react';
import { Plus, X } from 'lucide-react';

// Component de formulari de contacte
const ContactForm = ({ inputStyle, labelStyle, fieldMargin, titleStyle }) => {
  const [formData, setFormData] = useState({
    name: '',
    orderNumber: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', orderNumber: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(''), 5000);
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} placeholder="Nom" />
          <input type="text" name="orderNumber" value={formData.orderNumber} onChange={handleChange} style={inputStyle} placeholder="Número de comanda (opcional)" />
        </div>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} placeholder="Email" />
        <select name="subject" value={formData.subject} onChange={handleChange} required style={inputStyle}>
          <option value="">Assumpte</option>
          <option value="order">Pregunta sobre comanda</option>
          <option value="product">Informació de producte</option>
          <option value="shipping">Enviament i lliurament</option>
          <option value="return">Devolució o canvi</option>
          <option value="other">Altres</option>
        </select>
        <textarea name="message" value={formData.message} onChange={handleChange} required rows="6" style={{ ...inputStyle, resize: 'none' }} placeholder="Missatge" />
        <button type="submit" disabled={status === 'sending'} style={{ padding: '8px 16px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 400, backgroundColor: '#000', color: 'white', border: 'none', cursor: status === 'sending' ? 'not-allowed' : 'pointer', opacity: status === 'sending' ? 0.6 : 1 }}>
          {status === 'sending' ? 'Enviant...' : 'Enviar Missatge'}
        </button>
        {status === 'success' && (
          <div style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', padding: '12px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', color: '#155724' }}>
            ✓ Missatge enviat correctament! Et respondrem en un màxim de 48 hores.
          </div>
        )}
      </form>
    </div>
  );
};

export function UserProfileTabs({ onTabChange }) {
  const [tabs, setTabs] = useState([
    { id: '1', name: 'Comandes' },
    { id: '2', name: 'Missatges' },
    { id: '3', name: 'Compte' },
    { id: '4', name: 'Seguretat' },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');

  const handleTabClick = (tabId) => {
    setActiveTabId(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div style={{
      position: 'relative',
      zIndex: 2,
      marginBottom: '6px',
      padding: '0',
    }}>
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
            onMouseEnter={(e) => {
              if (activeTabId !== tab.id) {
                e.target.style.color = '#1E62B8';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTabId !== tab.id) {
                e.target.style.color = '#666';
              }
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function UserProfileContent({ activeTab }) {
  const inputStyle = {
    width: '100%',
    padding: '6px 10px',
    fontFamily: 'Roboto Condensed, sans-serif',
    fontSize: '12pt',
    fontWeight: 300,
    border: '1px solid #ccc',
    borderRadius: '0',
    outline: 'none',
    backgroundColor: 'white',
  };

  const labelStyle = {
    fontFamily: 'Roboto Condensed, sans-serif',
    fontSize: '15pt',
    fontWeight: 400,
    color: '#000',
    display: 'block',
    marginBottom: '6px',
  };

  const titleStyle = {
    fontFamily: 'Roboto Condensed, sans-serif',
    fontSize: '15pt',
    fontWeight: 500,
    color: '#000',
    marginBottom: '4px',
    marginTop: '0',
    paddingTop: '0',
  };

  const fieldMargin = { marginBottom: '4px' };

  // Contingut per cada pestanya segons l'informe
  const renderContent = () => {
    switch (activeTab) {
      case '1': // Comandes
        return (
          <div style={{ padding: '40px' }}>
            <h3 style={titleStyle}>Llista de Comandes</h3>

            {/* Comanda exemple */}
            <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '20px', alignItems: 'center' }}>
                <div>
                  <div style={{ ...labelStyle, marginBottom: '4px' }}>Número</div>
                  <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300 }}>#12345</div>
                </div>
                <div>
                  <div style={{ ...labelStyle, marginBottom: '4px' }}>Data</div>
                  <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300 }}>15/03/2024</div>
                </div>
                <div>
                  <div style={{ ...labelStyle, marginBottom: '4px' }}>Estat</div>
                  <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, backgroundColor: '#d4edda', padding: '4px 8px', display: 'inline-block' }}>Lliurada</div>
                </div>
                <div>
                  <div style={{ ...labelStyle, marginBottom: '4px' }}>Total</div>
                  <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300 }}>45,90 €</div>
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

            <div style={{ marginTop: '30px' }}>
              <h3 style={titleStyle}>Estats possibles:</h3>
              <ul style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Pendent de pagament</li>
                <li>Pagament confirmat</li>
                <li>En preparació</li>
                <li>Enviada (amb seguiment)</li>
                <li>Lliurada</li>
                <li>Cancel·lada</li>
                <li>Retornada</li>
              </ul>
            </div>
          </div>
        );

      case '2': // Missatges
        return <ContactForm inputStyle={inputStyle} labelStyle={labelStyle} fieldMargin={fieldMargin} titleStyle={titleStyle} />;

      case '3': // Compte
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', padding: '40px' }}>
            {/* Columna 1: Dades Personals */}
            <div>
              <h3 style={titleStyle}>Dades Personals</h3>
              <div style={fieldMargin}>
                <label style={labelStyle}>Nom complet</label>
                <input type="text" defaultValue="Joan Garcia" style={inputStyle} />
              </div>
              <div style={fieldMargin}>
                <label style={labelStyle}>Email</label>
                <input type="email" defaultValue="joan.garcia@example.com" style={inputStyle} />
              </div>
              <div style={fieldMargin}>
                <label style={labelStyle}>Telèfon</label>
                <input type="tel" defaultValue="+34 600 123 456" style={inputStyle} />
              </div>
              <div style={fieldMargin}>
                <label style={labelStyle}>Empresa</label>
                <input type="text" placeholder="Opcional" style={inputStyle} />
              </div>
            </div>

            {/* Columna 2: Contrasenya */}
            <div>
              <h3 style={titleStyle}>Contrasenya</h3>
              <div style={fieldMargin}>
                <label style={labelStyle}>Actual</label>
                <input type="password" style={inputStyle} />
              </div>
              <div style={fieldMargin}>
                <label style={labelStyle}>Nova</label>
                <input type="password" style={inputStyle} />
              </div>
              <div style={fieldMargin}>
                <label style={labelStyle}>Confirmar</label>
                <input type="password" style={inputStyle} />
              </div>
              <button style={{ padding: '4px 12px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 400, backgroundColor: '#000', color: 'white', border: 'none', cursor: 'pointer', marginTop: '4px' }}>
                Canvia
              </button>
            </div>

            {/* Columna 3: Adreces */}
            <div>
              <h3 style={titleStyle}>Adreça Lliurament</h3>
              <div style={fieldMargin}>
                <label style={labelStyle}>Destinatari</label>
                <input type="text" defaultValue="Joan Garcia" style={inputStyle} />
              </div>
              <div style={fieldMargin}>
                <label style={labelStyle}>Carrer</label>
                <input type="text" defaultValue="Carrer Major, 123" style={inputStyle} />
              </div>
              <div style={fieldMargin}>
                <label style={labelStyle}>CP - Ciutat</label>
                <input type="text" defaultValue="08001 Barcelona" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                <input type="checkbox" id="defaultAddress" />
                <label htmlFor="defaultAddress" style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: 0, cursor: 'pointer' }}>Per defecte</label>
              </div>
              
              <h3 style={{ ...titleStyle, marginTop: '8px' }}>Facturació</h3>
              <div style={fieldMargin}>
                <label style={labelStyle}>NIF/CIF</label>
                <input type="text" placeholder="Obligatori" style={inputStyle} />
              </div>
            </div>

            {/* Columna 4: Pagament */}
            <div>
              <h3 style={titleStyle}>Targetes</h3>
              <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '6px', marginBottom: '4px' }}>
                <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: '2px' }}>
                  •••• 1234 - Visa 12/25
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input type="checkbox" id="defaultCard" defaultChecked />
                  <label htmlFor="defaultCard" style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: 0, cursor: 'pointer' }}>Per defecte</label>
                </div>
              </div>
              <button style={{ padding: '4px 12px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 400, backgroundColor: '#000', color: 'white', border: 'none', cursor: 'pointer' }}>Afegir targeta</button>
              
              <h3 style={{ ...titleStyle, marginTop: '8px' }}>Altres Mètodes</h3>
              <ul style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, lineHeight: 1.3, paddingLeft: '20px', margin: '0' }}>
                <li>Transferència</li>
                <li>Contra reemborsament</li>
                <li>Bizum</li>
                <li>PayPal</li>
              </ul>
            </div>
          </div>
        );

      case '4': // Seguretat
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', padding: '40px' }}>
            {/* Columna esquerra: 2FA i Sessions */}
            <div>
              <h3 style={titleStyle}>Autenticació de Dos Factors (2FA)</h3>

              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="checkbox" id="enable2FA" />
                <label htmlFor="enable2FA" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                  Activar 2FA
                </label>
              </div>

              <div style={fieldMargin}>
                <label style={labelStyle}>Mètode</label>
                <select style={inputStyle}>
                  <option>SMS al telèfon</option>
                  <option>App d'autenticació (Google Authenticator)</option>
                </select>
              </div>

              <div style={{ marginTop: '40px' }}>
                <h3 style={titleStyle}>Sessions Actives</h3>

                <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: '6px' }}>
                    <strong style={{ fontWeight: 500 }}>Chrome a macOS</strong>
                  </div>
                  <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: '6px' }}>
                    Barcelona, Espanya
                  </div>
                  <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: '4px' }}>
                    Última activitat: Ara mateix
                  </div>
                  <button style={{
                    padding: '6px 12px',
                    fontFamily: 'Roboto Condensed, sans-serif',
                    fontSize: '12pt',
                    fontWeight: 400,
                    backgroundColor: '#fff',
                    color: '#000',
                    border: '1px solid #000',
                    cursor: 'pointer',
                  }}>Tancar sessió</button>
                </div>
              </div>
            </div>

            {/* Columna dreta: Historial d'Activitat */}
            <div>
              <h3 style={titleStyle}>Historial d'Activitat</h3>

              <ul style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Canvis de contrasenya</li>
                <li>Adreces afegides/modificades</li>
                <li>Targetes afegides/eliminades</li>
                <li>Intents de login</li>
              </ul>

              <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '12px', marginTop: '20px' }}>
                <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: '6px' }}>
                  <strong style={{ fontWeight: 500 }}>14/04/2024 - 10:30</strong>
                </div>
                <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300 }}>
                  Login correcte des de Barcelona
                </div>
              </div>

              <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '12px', marginTop: '12px' }}>
                <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: '6px' }}>
                  <strong style={{ fontWeight: 500 }}>12/04/2024 - 15:20</strong>
                </div>
                <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300 }}>
                  Adreça modificada
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
}
