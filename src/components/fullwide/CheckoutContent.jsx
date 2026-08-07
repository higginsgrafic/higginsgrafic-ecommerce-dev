import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { validateEmail, validateRequired, validatePostalCode, validateForm } from '@/utils/validation';
import { trackBeginCheckout, trackPurchase } from '@/utils/analytics';
import { useShippingCosts } from '@/hooks/useShippingCosts';
import { useOrders } from '@/hooks/useOrders';
import { createMockOrder, MOCK_CLIENT } from '@/lib/mockOrderStore';

function CheckoutContent({ cartItems, setCartItems, onCloseMegaSlide }) {
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;
  const [formData, setFormData] = useState({
    email: isDev ? MOCK_CLIENT.email : '',
    firstName: isDev ? MOCK_CLIENT.firstName : '',
    lastName: isDev ? MOCK_CLIENT.lastName : '',
    address: isDev ? MOCK_CLIENT.address : '',
    address2: '',
    city: isDev ? MOCK_CLIENT.city : '',
    postalCode: isDev ? MOCK_CLIENT.postalCode : '',
    country: isDev ? MOCK_CLIENT.country : 'Espanya',
    phone: isDev ? '600 123 456' : '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(isDev);

  const ROW_H = 32.8;
  const V_GUTTER = 2.8;
  const TOP_OFFSET = 1.5 * ROW_H;
  const TABLE_WIDTH = 675;
  const FORM_WIDTH = 384;

  const activeItems = useMemo(
    () => (cartItems || []).filter(it => !it.disabled),
    [cartItems]
  );

  const grossSum = activeItems.reduce((acc, it) => {
    const unit = parseFloat(String(it.price).replace('€', '').replace(/\s/g, '').replace(',', '.'));
    return Number.isNaN(unit) ? acc : acc + unit * (it.qty || 1);
  }, 0);
  const subtotal = grossSum / 1.21;
  const { getCost, zoneInfo } = useShippingCosts('es_peninsula');
  const shipping = getCost(grossSum / 1.21);
  const ivaAmount = grossSum - subtotal;
  const total = grossSum;

  const fmt = (n) => n.toFixed(2).replace('.', ',') + '€';
  const splitPrice = (n) => {
    const [intPart, decPart = '00'] = n.toFixed(2).split('.');
    return { intPart, decPart };
  };
  const subtotalParts = splitPrice(subtotal);
  const shippingParts = splitPrice(shipping === 0 ? zoneInfo.cost : shipping);
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
      let orderNumber = null;
      if (!import.meta.env.DEV) {
        const order = await createOrder({
          email: formData.email,
          items: activeItems,
          subtotal,
          shippingCost: shipping,
          iva: ivaAmount,
          total,
          shippingZone: 'es_peninsula',
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          address2: formData.address2,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        });
        orderNumber = order?.order_number || null;
      } else {
        const orderItems = activeItems.map((item, idx) => ({
          id: item.id || `item-${idx}`,
          name: item.title || item.name || 'Producte',
          size: item.size || 'L',
          quantity: item.qty || 1,
          price: parseFloat(String(item.price).replace('€', '').replace(/\s/g, '').replace(',', '.')) || 0,
          image: item.image || '/tshirt-white.jpg',
        }));
        const mockOrder = createMockOrder({
          items: orderItems,
          subtotal,
          shipping,
          iva: ivaAmount,
          total,
          formData,
        });
        orderNumber = mockOrder.order_number;
      }
      trackPurchase(orderNumber, activeItems, total, shipping, 0);
      if (setCartItems) setCartItems([]);
      setIsProcessing(false);
      navigate(`/order-confirmation/${orderNumber}`);
    } catch (err) {
      console.error('[checkout] Error creating order:', err);
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

      {/* Contenidor principal — dues columnes (estil Stripe Link) */}
      <div style={{
        position: 'absolute',
        top: `${TOP_OFFSET + 2 * ROW_H}px`,
        left: `calc(50% - ${TABLE_WIDTH / 2}px)`,
        width: `${TABLE_WIDTH}px`,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        columnGap: '45px',
        zIndex: 2,
        pointerEvents: 'auto',
      }}>

      {/* ═══ COLUMNA ESQUERRA: Dades d'enviament ═══ */}
      <div>

        {/* Dades d'enviament */}
        <div style={{ display: 'grid', rowGap: '12px' }}>
          <div style={{ fontSize: '12pt', fontWeight: 500, color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif' }}>Dades d'enviament</div>
          <div style={{ display: 'grid', rowGap: '8px' }}>
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
              <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>Adreça</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Carrer i número" style={inputStyle} />
              {formErrors.address && <div style={errorStyle}>{formErrors.address}</div>}
            </div>
            <div>
              <input type="text" name="address2" value={formData.address2} onChange={handleChange} placeholder="Pis, porta" style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '10px' }}>
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
            </div>
            <div>
              <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>País</label>
              <select name="country" value={formData.country} onChange={handleChange} style={inputStyle}>
                <option value="Espanya">Espanya</option>
                <option value="França">França</option>
                <option value="Andorra">Andorra</option>
              </select>
            </div>
            <div>
              <label style={{ ...LABEL, display: 'block', marginBottom: '3px' }}>Telèfon</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+34 600 123 456" style={inputStyle} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '9.5pt', lineHeight: 1.25, fontWeight: 300, color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif', marginTop: '4px' }}>
            <input type="checkbox" checked readOnly style={{ marginTop: '1px' }} />
            <span>Accepto els Termes del Servei, la Política de Privacitat i la Política d'ús acceptable.</span>
          </label>
        </div>
      </div>

      {/* ═══ COLUMNA DRETA: Targeta Link + Pagament ═══ */}
      <div>

        {/* Targeta Link */}
        <div style={{
          border: '1px solid #E6E8EC',
          borderRadius: '9px',
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderBottom: '1px solid #EEF0F3',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12pt', fontWeight: 600, fontFamily: 'Roboto Condensed, sans-serif', color: '#4A5057' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#00D66F', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '9pt', fontWeight: 700 }}>›</span>
              <span>link</span>
            </div>
            <span style={{ color: '#98A2B4', fontSize: '15pt', lineHeight: 1 }}>···</span>
          </div>
          <div style={{ padding: '14px 16px 12px', display: 'grid', rowGap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '74px 1fr', alignItems: 'center', columnGap: '12px', fontSize: '11pt', fontFamily: 'Roboto Condensed, sans-serif' }}>
              <span style={{ color: '#667085', fontWeight: 300 }}>Email</span>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@exemple.com" style={{ border: 'none', outline: 'none', background: 'transparent', color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '11pt', fontWeight: 400 }} />
            </div>
            {formErrors.email && <div style={{ ...errorStyle, paddingLeft: '86px' }}>{formErrors.email}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '74px 1fr', alignItems: 'center', columnGap: '12px', fontSize: '11pt', fontFamily: 'Roboto Condensed, sans-serif' }}>
              <span style={{ color: '#667085', fontWeight: 300 }}>Paga amb</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span style={{ width: '28px', height: '18px', borderRadius: '4px', background: '#111827', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontSize: '8pt', flexShrink: 0 }}>●●</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 400, color: '#4A5057' }}>Mastercard</span>
                <span style={{ color: '#98A2B4', fontWeight: 300, whiteSpace: 'nowrap' }}>•••• 1234</span>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10.5pt', fontWeight: 300, color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif' }}>
              <input type="checkbox" />
              <span>Si falla, utilitza Visa •••• 5678</span>
            </label>
          </div>
        </div>

        {/* Botó confirma */}
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          style={{
            width: '100%',
            height: '46px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: isProcessing ? '#8FE8B9' : '#00D66F',
            color: '#063B21',
            fontFamily: 'Roboto Condensed, sans-serif',
            fontSize: '12pt',
            fontWeight: 600,
            letterSpacing: '0.01em',
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.08)',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '14px',
          }}
        >
          {isProcessing ? 'Processant…' : (<><Check size={18} strokeWidth={2} /> Confirma la compra</>)}
        </button>

        {/* Text legal */}
        <div style={{ marginTop: '10px', textAlign: 'center', color: '#667085', fontSize: '9pt', fontWeight: 300, fontFamily: 'Roboto Condensed, sans-serif', lineHeight: 1.25 }}>
          En confirmar el pagament, autoritzes el càrrec d'aquest pagament i futurs pagaments segons els termes.
        </div>

        {/* Toggle continua com a hoste */}
        <button
          type="button"
          onClick={() => setPaymentDetailsOpen(open => !open)}
          style={{ width: '100%', border: 'none', background: 'transparent', color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10pt', fontWeight: 500, cursor: 'pointer', marginTop: '16px' }}
        >
          {paymentDetailsOpen ? 'Amaga les dades de pagament' : 'Continua com a hoste'}
        </button>

        {/* Dades de pagament desplegables */}
        {paymentDetailsOpen && (
          <div style={{ marginTop: '16px', display: 'grid', rowGap: '12px' }}>
            <div style={{ fontSize: '12pt', fontWeight: 500, color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif' }}>Dades de pagament</div>
            <div style={{ border: '1px solid #E6E8EC', borderRadius: '6px', background: '#FFFFFF', overflow: 'hidden' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #EEF0F3', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11pt', fontWeight: 500, fontFamily: 'Roboto Condensed, sans-serif', color: '#4A5057' }}>
                <span style={{ width: '13px', height: '10px', border: '1px solid #4A5057', borderRadius: '2px', display: 'inline-block' }} />
                <span>Targeta</span>
              </div>
              <div style={{ padding: '10px 12px', display: 'grid', rowGap: '8px' }}>
                <label style={{ display: 'grid', rowGap: '4px', fontSize: '10pt', fontWeight: 300, color: '#667085', fontFamily: 'Roboto Condensed, sans-serif' }}>
                  Informació de la targeta
                  <div style={{ border: '1px solid #D8DDE3', borderRadius: '4px', overflow: 'hidden', background: '#FFFFFF' }}>
                    <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="4242 4242 4242 4242" maxLength={19} style={{ width: '100%', height: '31px', border: 'none', borderBottom: '1px solid #E6E8EC', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', boxSizing: 'border-box' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                      <input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="MM / YY" maxLength={5} style={{ height: '31px', border: 'none', borderRight: '1px solid #E6E8EC', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', boxSizing: 'border-box' }} />
                      <input type="text" name="cvv" value={formData.cvv} onChange={handleChange} placeholder="CVC" maxLength={4} style={{ height: '31px', border: 'none', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </label>
                <label style={{ display: 'grid', rowGap: '4px', fontSize: '10pt', fontWeight: 300, color: '#667085', fontFamily: 'Roboto Condensed, sans-serif' }}>
                  Nom del titular
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nom tal com surt a la targeta" style={{ height: '32px', border: '1px solid #D8DDE3', borderRadius: '4px', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none' }} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '16px', textAlign: 'center', color: '#98A2B4', fontSize: '8.5pt', fontWeight: 300, fontFamily: 'Roboto Condensed, sans-serif' }}>
          Powered by Stripe&nbsp;&nbsp;|&nbsp;&nbsp;Termes&nbsp;&nbsp;Privacitat
        </div>
      </div>
      </div>

      {/* Totals — fila inferior */}
      {(() => {
        const PAYMENT_EXPAND_ROWS = paymentDetailsOpen ? 6 : 0;
        const TOTALS_ROW = 17 + PAYMENT_EXPAND_ROWS;
        const rows = [
          { label: 'Subtotal', amount: subtotalParts, strong: false },
          { label: 'Transport', amount: shippingParts, strong: false, strike: true },
          { label: 'IVA 21%', amount: ivaParts, strong: false },
          { label: 'Tot plegat fa', amount: totalParts, strong: true },
        ];
        return rows.map((r, k) => {
          const rowTop = TOP_OFFSET + (TOTALS_ROW - 1 + k) * ROW_H;
          const labelStyle = {
            fontFamily: 'Oswald, sans-serif',
            fontWeight: r.strong ? 200 : 300,
            fontSize: r.strong ? '24pt' : '18pt',
            color: r.strong ? '#474F59' : '#99A3B5',
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            lineHeight: 1,
          };
          const amountStyle = {
            fontFamily: 'Oswald, sans-serif',
            fontWeight: r.strong ? 300 : 300,
            fontSize: r.strong ? '24pt' : '18pt',
            color: r.strong ? '#474F59' : '#99A3B5',
            letterSpacing: '0.6px',
            whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            textDecoration: r.strike ? 'line-through' : 'none',
            textDecorationColor: r.strike ? '#000' : undefined,
            textDecorationThickness: r.strike ? '1px' : undefined,
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
              borderTop: r.strong ? '0.5px solid #000' : 'none',
              paddingTop: r.strong ? '10px' : '0',
            }}>
              <span style={labelStyle}>{r.label}</span>
              <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', marginRight: r.strong ? '0' : '12px' }}>
                <span style={{ ...amountStyle, width: '90px', textAlign: 'right', display: 'block' }}>{r.amount.intPart},</span>
                <span style={{ ...amountStyle, marginLeft: '-2px' }}>{r.amount.decPart}€</span>
              </span>
            </div>
          );
        });
      })()}
    </>
  );
}

export default CheckoutContent;
