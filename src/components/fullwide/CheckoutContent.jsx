import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, X, Check } from 'lucide-react';
import { validateEmail, validateRequired, validatePostalCode, validateForm } from '@/utils/validation';
import { trackBeginCheckout, trackPurchase } from '@/utils/analytics';

function CheckoutContent({ cartItems, setCartItems, onCloseMegaSlide }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Espanya',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const ROW_H = 32.8;
  const GUTTER = 7.5;
  const V_GUTTER = 2.8;
  const TOP_OFFSET = 1.5 * ROW_H;
  const TABLE_WIDTH = 675;
  const COLS = 4;
  const COL_WIDTH = (TABLE_WIDTH - GUTTER * (COLS - 1)) / COLS; // meitat d'amplada

  const activeItems = useMemo(
    () => (cartItems || []).filter(it => !it.disabled),
    [cartItems]
  );

  const subtotal = activeItems.reduce((acc, it) => {
    const unit = parseFloat(String(it.price).replace('€', '').replace(/\s/g, '').replace(',', '.'));
    return Number.isNaN(unit) ? acc : acc + unit * (it.qty || 1);
  }, 0);
  const shipping = subtotal > 50 ? 0 : 4.95;
  const total = subtotal + shipping;
  const ivaAmount = subtotal * 0.21;

  const fmt = (n) => n.toFixed(2).replace('.', ',') + '€';
  const splitPrice = (n) => {
    const [intPart, decPart = '00'] = n.toFixed(2).split('.');
    return { intPart, decPart };
  };
  const subtotalParts = splitPrice(subtotal);
  const shippingParts = splitPrice(shipping);
  const ivaParts = splitPrice(ivaAmount);
  const totalParts = splitPrice(total);

  const HEAD = { fontFamily: 'Oswald, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#475059' };
  const LABEL = { fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 400, color: '#667085', fontSize: '10pt' };
  const INPUT = { fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 400, color: '#4A5057', fontSize: '10.5pt', outline: 'none' };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rules = {
      email: [
        { validate: validateRequired, message: 'El correu és obligatori' },
        { validate: validateEmail, message: 'Format de correu invàlid' }
      ],
      firstName: [{ validate: validateRequired, message: 'El nom és obligatori' }],
      lastName: [{ validate: validateRequired, message: 'Els cognoms són obligatoris' }],
      address: [{ validate: validateRequired, message: "L'adreça és obligatòria" }],
      city: [{ validate: validateRequired, message: 'La ciutat és obligatòria' }],
      postalCode: [
        { validate: validateRequired, message: 'El codi postal és obligatori' },
        { validate: validatePostalCode, message: 'Codi postal invàlid (format: 08001)' }
      ],
    };
    const errors = validateForm(formData, rules);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const orderId = 'GRF-2024-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      trackPurchase(orderId, activeItems, total, shipping, 0);
      if (setCartItems) setCartItems([]);
      setIsProcessing(false);
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      setIsProcessing(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: '31px',
    border: '1px solid #D8DDE3',
    borderRadius: '4px',
    padding: '0 10px',
    boxSizing: 'border-box',
    ...INPUT,
  };

  const errorStyle = {
    color: '#D04B4B',
    fontSize: '9pt',
    fontFamily: 'Roboto Condensed, sans-serif',
    marginTop: '2px',
  };

  return (
    <>
      {/* Títol CHECKOUT */}
      <div style={{
        position: 'absolute',
        top: `${TOP_OFFSET}px`,
        left: `calc(50% - ${TABLE_WIDTH / 2}px)`,
        width: `${TABLE_WIDTH}px`,
        height: `${ROW_H - V_GUTTER}px`,
        display: 'flex',
        alignItems: 'center',
        zIndex: 2,
      }}>
        <span style={{ ...HEAD, fontSize: '18pt', fontWeight: 600 }}>CHECKOUT</span>
      </div>

      {/* Formulari — columna esquerra (dades enviament) */}
      <div style={{
        position: 'absolute',
        top: `${TOP_OFFSET + 2 * ROW_H}px`,
        left: `calc(50% - ${TABLE_WIDTH / 2}px)`,
        width: `${COL_WIDTH * 2 + GUTTER}px`,
        zIndex: 2,
        pointerEvents: 'auto',
      }}>
        <div style={{ ...HEAD, fontSize: '12pt', marginBottom: '12px' }}>DADES D'ENVIAMENT</div>
        <div style={{ display: 'grid', rowGap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '10px' }}>
            <div>
              <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>Nom</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nom" style={inputStyle} />
              {formErrors.firstName && <div style={errorStyle}>{formErrors.firstName}</div>}
            </div>
            <div>
              <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>Cognoms</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Cognoms" style={inputStyle} />
              {formErrors.lastName && <div style={errorStyle}>{formErrors.lastName}</div>}
            </div>
          </div>
          <div>
            <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@exemple.com" style={inputStyle} />
            {formErrors.email && <div style={errorStyle}>{formErrors.email}</div>}
          </div>
          <div>
            <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>Adreça</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Carrer, número, pis" style={inputStyle} />
            {formErrors.address && <div style={errorStyle}>{formErrors.address}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: '10px' }}>
            <div>
              <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>Codi postal</label>
              <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="08001" maxLength={5} style={inputStyle} />
              {formErrors.postalCode && <div style={errorStyle}>{formErrors.postalCode}</div>}
            </div>
            <div>
              <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>Ciutat</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Barcelona" style={inputStyle} />
              {formErrors.city && <div style={errorStyle}>{formErrors.city}</div>}
            </div>
            <div>
              <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>País</label>
              <select name="country" value={formData.country} onChange={handleChange} style={inputStyle}>
                <option value="Espanya">Espanya</option>
                <option value="França">França</option>
                <option value="Andorra">Andorra</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Formulari — columna dreta (pagament) */}
      <div style={{
        position: 'absolute',
        top: `${TOP_OFFSET + 2 * ROW_H}px`,
        left: `calc(50% - ${TABLE_WIDTH / 2}px + ${COL_WIDTH * 2 + GUTTER * 2}px)`,
        width: `${COL_WIDTH * 2 + GUTTER}px`,
        zIndex: 2,
        pointerEvents: 'auto',
      }}>
        <div style={{ ...HEAD, fontSize: '12pt', marginBottom: '12px' }}>PAGAMENT</div>
        <div style={{
          border: '1px solid #E6E8EC',
          borderRadius: '6px',
          background: '#FFFFFF',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 12px',
            borderBottom: '1px solid #EEF0F3',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11pt',
            fontWeight: 500,
            color: '#4A5057',
            fontFamily: 'Roboto Condensed, sans-serif',
          }}>
            <span style={{ width: '13px', height: '10px', border: '1px solid #4A5057', borderRadius: '2px', display: 'inline-block' }} />
            <span>Targeta</span>
          </div>
          <div style={{ padding: '10px 12px', display: 'grid', rowGap: '8px' }}>
            <div>
              <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>Número de targeta</label>
              <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="4242 4242 4242 4242" maxLength={19} style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '10px' }}>
              <div>
                <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>Caducitat</label>
                <input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="MM / YY" maxLength={5} style={inputStyle} />
              </div>
              <div>
                <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>CVC</label>
                <input type="text" name="cvv" value={formData.cvv} onChange={handleChange} placeholder="123" maxLength={4} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '10px', fontSize: '9pt', color: '#667085', fontFamily: 'Roboto Condensed, sans-serif', lineHeight: 1.3 }}>
          Pagament segur encriptat. Les teves dades no es guarden.
        </div>
      </div>

      {/* Totals — fila inferior */}
      {(() => {
        const TOTALS_ROW = 16;
        const rows = [
          { label: 'Subtotal', amount: fmt(subtotal), strong: false },
          { label: 'Transport', amount: fmt(shipping), strong: false, strike: shipping === 0 },
          { label: 'IVA 21%', amount: fmt(ivaAmount), strong: false },
          { label: 'Tot plegat fa', amount: fmt(total), strong: true },
        ];
        return rows.map((r, k) => {
          const rowTop = TOP_OFFSET + (TOTALS_ROW - 1 + k) * ROW_H;
          const parts = splitPrice(r.strike ? 0 : (r.label === 'Subtotal' ? subtotal : r.label === 'Transport' ? shipping : r.label === 'IVA 21%' ? ivaAmount : total));
          const amountValue = r.strike ? splitPrice(0) : parts;
          const labelStyle = {
            fontFamily: 'Oswald, sans-serif',
            fontWeight: r.strong ? 400 : 300,
            fontSize: r.strong ? '20pt' : '14pt',
            color: r.strong ? '#474F59' : '#99A3B5',
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            lineHeight: 1,
            textDecoration: r.strike ? 'line-through' : 'none',
          };
          const amountStyle = {
            fontFamily: 'Oswald, sans-serif',
            fontWeight: r.strong ? 500 : 300,
            fontSize: r.strong ? '22pt' : '14pt',
            color: r.strong ? '#474F59' : '#99A3B5',
            letterSpacing: '0.6px',
            whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            textDecoration: r.strike ? 'line-through' : 'none',
          };
          return (
            <div key={r.label} style={{
              position: 'absolute',
              top: `${rowTop}px`,
              left: `calc(50% - ${TABLE_WIDTH / 2}px)`,
              width: `${TABLE_WIDTH}px`,
              height: `${ROW_H - V_GUTTER}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              boxSizing: 'border-box',
              zIndex: 2,
              borderTop: r.strong ? '1px solid rgba(71, 80, 89, 0.18)' : 'none',
            }}>
              <span style={labelStyle}>{r.label}</span>
              <span style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={{ ...amountStyle, textAlign: 'right' }}>{amountValue.intPart},</span>
                <span style={{ ...amountStyle, marginLeft: '-2px' }}>{amountValue.decPart}€</span>
              </span>
            </div>
          );
        });
      })()}

      {/* Botó confirma */}
      <div style={{
        position: 'absolute',
        top: `${TOP_OFFSET + 20 * ROW_H}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${TABLE_WIDTH}px`,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 4,
        pointerEvents: 'auto',
      }}>
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          style={{
            width: 'min(100%, 384px)',
            height: '46px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: isProcessing ? '#8FE8B9' : '#00D66F',
            color: '#063B21',
            fontFamily: 'Roboto Condensed, sans-serif',
            fontSize: '12pt',
            fontWeight: 600,
            letterSpacing: '0.01em',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isProcessing ? 'Processant…' : (<><Check size={18} strokeWidth={2} /> Confirma la compra</>)}
        </button>
      </div>

      {/* Powered by */}
      <div style={{
        position: 'absolute',
        top: `${TOP_OFFSET + 21 * ROW_H}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${TABLE_WIDTH}px`,
        textAlign: 'center',
        color: '#98A2B4',
        fontSize: '8.5pt',
        fontFamily: 'Roboto Condensed, sans-serif',
        fontWeight: 300,
        zIndex: 2,
      }}>
        Powered by Stripe&nbsp;&nbsp;|&nbsp;&nbsp;Termes&nbsp;&nbsp;Privacitat
      </div>
    </>
  );
}

export default CheckoutContent;
