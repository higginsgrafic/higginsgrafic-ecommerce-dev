import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export function UserProfileTabs({ onTabChange }) {
  const [tabs, setTabs] = useState([
    { id: '1', name: 'Informació' },
    { id: '2', name: 'Adreces' },
    { id: '3', name: 'Pagament' },
    { id: '4', name: 'Comandes' },
    { id: '5', name: 'Seguretat' },
    { id: '6', name: 'Preferències' },
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
      marginBottom: '30px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={{
              padding: '12px 24px',
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
    padding: '8px 12px',
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
    marginBottom: '20px',
    marginTop: '0',
  };

  const fieldMargin = { marginBottom: '18px' };

  // Contingut per cada pestanya segons l'informe
  const renderContent = () => {
    switch (activeTab) {
      case '1': // Informació
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Columna esquerra: Dades personals */}
            <div>
              <h3 style={titleStyle}>1.1. Dades Personals</h3>

              <div style={fieldMargin}>
                <label style={labelStyle}>Nom complet</label>
                <input
                  type="text"
                  defaultValue="Joan Garcia"
                  style={inputStyle}
                />
              </div>

              <div style={fieldMargin}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  defaultValue="joan.garcia@example.com"
                  style={inputStyle}
                />
              </div>

              <div style={fieldMargin}>
                <label style={labelStyle}>Telèfon</label>
                <input
                  type="tel"
                  defaultValue="+34 600 123 456"
                  style={inputStyle}
                />
              </div>

              <div style={fieldMargin}>
                <label style={labelStyle}>Empresa/Organització</label>
                <input
                  type="text"
                  placeholder="Opcional, per B2B"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Columna dreta: Contrasenya */}
            <div>
              <h3 style={titleStyle}>1.2. Contrasenya</h3>

              <div style={fieldMargin}>
                <label style={labelStyle}>Contrasenya actual</label>
                <input
                  type="password"
                  style={inputStyle}
                />
              </div>

              <div style={fieldMargin}>
                <label style={labelStyle}>Contrasenya nova</label>
                <input
                  type="password"
                  style={inputStyle}
                />
              </div>

              <div style={fieldMargin}>
                <label style={labelStyle}>Confirmar contrasenya</label>
                <input
                  type="password"
                  style={inputStyle}
                />
              </div>

              <button style={{
                padding: '10px 24px',
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: '12pt',
                fontWeight: 400,
                backgroundColor: '#000',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                marginTop: '10px',
              }}>
                Canvia contrasenya
              </button>

              <div style={{
                marginTop: '24px',
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: '12pt',
                fontWeight: 300,
                lineHeight: 1.6,
              }}>
                <strong style={{ fontWeight: 500 }}>Validacions:</strong>
                <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0' }}>
                  <li>Mínim 8 caràcters</li>
                  <li>Almenys 1 majúscula</li>
                  <li>Almenys 1 número</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case '2': // Adreces
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Columna esquerra: Adreça de Lliurament */}
            <div>
              <h3 style={titleStyle}>2.1. Adreça de Lliurament</h3>

              <div style={{ ...fieldMargin, marginBottom: '12px' }}>
                <label style={labelStyle}>Nom complet del destinatari</label>
                <input type="text" defaultValue="Joan Garcia" style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Carrer i número</label>
                  <input type="text" defaultValue="Carrer Major, 123" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Pis/Porta</label>
                  <input type="text" placeholder="Opcional" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Codi postal</label>
                  <input type="text" defaultValue="08001" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Ciutat</label>
                  <input type="text" defaultValue="Barcelona" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>Província/Estat</label>
                  <input type="text" defaultValue="Barcelona" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>País</label>
                  <select style={inputStyle}>
                    <option>Espanya</option>
                    <option>França</option>
                    <option>Portugal</option>
                  </select>
                </div>
              </div>

              <div style={{ ...fieldMargin, marginBottom: '12px' }}>
                <label style={labelStyle}>Telèfon de contacte</label>
                <input type="tel" defaultValue="+34 600 123 456" style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                <input type="checkbox" id="defaultAddress" />
                <label htmlFor="defaultAddress" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                  Desar com a adreça per defecte
                </label>
              </div>

              <button style={{
                padding: '8px 20px',
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: '12pt',
                fontWeight: 400,
                backgroundColor: '#000',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}>
                Afegir nova adreça
              </button>
            </div>

            {/* Columna dreta: Adreça de Facturació */}
            <div>
              <h3 style={titleStyle}>2.2. Adreça de Facturació</h3>

              <div style={{ marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="checkbox" id="sameAddress" defaultChecked />
                <label htmlFor="sameAddress" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                  Igual que l'adreça de lliurament
                </label>
              </div>

              <div style={{ ...fieldMargin, marginBottom: '12px' }}>
                <label style={labelStyle}>NIF/CIF</label>
                <input type="text" placeholder="Obligatori per factures" style={inputStyle} />
              </div>

              <div style={{ ...fieldMargin, marginBottom: '12px' }}>
                <label style={labelStyle}>Nom fiscal</label>
                <input type="text" placeholder="Si és diferent" style={inputStyle} />
              </div>
            </div>
          </div>
        );

      case '3': // Pagament
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Columna esquerra: Targetes */}
            <div>
              <h3 style={titleStyle}>3.1. Targetes</h3>

              <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '16px', marginBottom: '20px' }}>
                <div style={{ ...labelStyle, marginBottom: '10px' }}>Targeta guardada</div>
                <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: '8px' }}>
                  •••• •••• •••• 1234
                </div>
                <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: '8px' }}>
                  Visa - Caduca: 12/25
                </div>
                <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: '12px' }}>
                  Titular: Joan Garcia
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <input type="checkbox" id="defaultCard" defaultChecked />
                  <label htmlFor="defaultCard" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                    Targeta per defecte
                  </label>
                </div>
                <button style={{
                  padding: '8px 16px',
                  fontFamily: 'Roboto Condensed, sans-serif',
                  fontSize: '12pt',
                  fontWeight: 400,
                  backgroundColor: '#fff',
                  color: '#000',
                  border: '1px solid #000',
                  cursor: 'pointer',
                }}>Eliminar</button>
              </div>

              <button style={{
                padding: '10px 24px',
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: '12pt',
                fontWeight: 400,
                backgroundColor: '#000',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}>Afegir targeta</button>

              <div style={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                padding: '12px',
                marginTop: '20px',
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: '12pt',
                fontWeight: 300,
                lineHeight: 1.5,
              }}>
                <strong style={{ fontWeight: 500 }}>Seguretat:</strong><br />
                · CVV mai s'emmagatzema<br />
                · Dades encriptades<br />
                · Tokenització via passarel·la
              </div>
            </div>

            {/* Columna dreta: Altres Mètodes */}
            <div>
              <h3 style={titleStyle}>3.2. Altres Mètodes</h3>

              <ul style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Transferència bancària</li>
                <li>Contra reemborsament</li>
                <li>Bizum</li>
                <li>PayPal</li>
              </ul>
            </div>
          </div>
        );

      case '4': // Comandes
        return (
          <div>
            <h3 style={titleStyle}>4.1. Llista de Comandes</h3>

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
                  padding: '8px 16px',
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

      case '5': // Seguretat
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Columna esquerra: 2FA i Sessions */}
            <div>
              <h3 style={titleStyle}>5.1. Autenticació de Dos Factors (2FA)</h3>

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
                <h3 style={titleStyle}>5.2. Sessions Actives</h3>

                <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: '6px' }}>
                    <strong style={{ fontWeight: 500 }}>Chrome a macOS</strong>
                  </div>
                  <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: '6px' }}>
                    Barcelona, Espanya
                  </div>
                  <div style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, marginBottom: '8px' }}>
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
              <h3 style={titleStyle}>5.3. Historial d'Activitat</h3>

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

      case '6': // Preferències
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Columna esquerra: Notificacions */}
            <div>
              <h3 style={titleStyle}>6.1. Notificacions per Email</h3>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ ...labelStyle, marginBottom: '12px' }}>Transaccionals (sempre actives):</div>
                <ul style={{ fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 300, lineHeight: 1.8, paddingLeft: '20px' }}>
                  <li>Confirmació de comanda</li>
                  <li>Pagament confirmat</li>
                  <li>Comanda enviada (amb seguiment)</li>
                  <li>Comanda lliurada</li>
                </ul>
              </div>

              <div style={{ marginTop: '30px' }}>
                <div style={{ ...labelStyle, marginBottom: '12px' }}>Opcionals (configurables):</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="checkbox" id="promo" defaultChecked />
                    <label htmlFor="promo" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                      Promocions i ofertes
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="checkbox" id="cart" />
                    <label htmlFor="cart" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                      Recordatori de carret abandonat
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="checkbox" id="news" defaultChecked />
                    <label htmlFor="news" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                      Novetats i productes nous
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="checkbox" id="tips" />
                    <label htmlFor="tips" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                      Consells i recomanacions
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna dreta: Privacitat i GDPR */}
            <div>
              <h3 style={titleStyle}>6.2. Privacitat</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="checkbox" id="marketing" defaultChecked />
                  <label htmlFor="marketing" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                    Accepto rebre comunicacions comercials
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="checkbox" id="shipping" defaultChecked disabled />
                  <label htmlFor="shipping" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
                    Accepto compartir dades amb transportistes (obligatori)
                  </label>
                </div>
              </div>

              <h3 style={titleStyle}>6.3. Gestió de Dades (GDPR)</h3>

              <button style={{
                padding: '10px 24px',
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: '12pt',
                fontWeight: 400,
                backgroundColor: '#000',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '12px',
                width: '100%',
              }}>Descarregar les meves dades</button>

              <button style={{
                padding: '10px 24px',
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: '12pt',
                fontWeight: 400,
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
              }}>Eliminar el meu compte</button>

              <div style={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                padding: '12px',
                marginTop: '20px',
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: '12pt',
                fontWeight: 300,
                lineHeight: 1.5,
              }}>
                <strong style={{ fontWeight: 500 }}>Avís legal:</strong><br />
                Les comandes completades es conserven segons obligacions legals. Dades personals s'eliminen excepte les requerides per llei.
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'relative',
      zIndex: 1,
    }}>
      {renderContent()}
    </div>
  );
}
