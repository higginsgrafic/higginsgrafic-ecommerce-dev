import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Check, ArrowLeft } from 'lucide-react';
import { validateEmail, validateRequired, validatePostalCode, validateForm } from '@/utils/validation';
import { trackBeginCheckout, trackPurchase } from '@/utils/analytics';
import { useShippingCosts } from '@/hooks/useShippingCosts';
import { useOrders } from '@/hooks/useOrders';
import { createMockOrder, MOCK_CLIENT } from '@/lib/mockOrderStore';
import { useAuth } from '@/contexts/AuthContext';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import { getStripe } from '@/api/stripe';
import { createGelatoOrder } from '@/api/gelato';

function CheckoutContentInner({ cartItems, setCartItems, onCloseMegaSlide, onBackToCart }) {
  const stripe = useStripe();
  const elements = useElements();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDev = import.meta.env.DEV;
  const offersConfig = useOffersConfig();
  const discountEnabled = offersConfig.discountEnabled;
  const discountRate = offersConfig.discountRate / 100;
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
    company: '',
    taxId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(isDev && !user);
  const [needsInvoice, setNeedsInvoice] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const ROW_H = 32.8;
  const V_GUTTER = 2.8;
  const TOP_OFFSET = 1.5 * ROW_H;

  const activeItems = useMemo(
    () => (cartItems || []).filter(it => !it.disabled),
    [cartItems]
  );

  const grossSum = activeItems.reduce((acc, it) => {
    const unit = parseFloat(String(it.price).replace('€', '').replace(/\s/g, '').replace(',', '.'));
    return Number.isNaN(unit) ? acc : acc + unit * (it.qty || 1);
  }, 0);
  const preu = grossSum;
  const descompte = discountEnabled ? preu * discountRate : 0;
  const totalPlegat = preu - descompte;
  const ivaAmount = totalPlegat * 0.21;
  const { getCost, zoneInfo } = useShippingCosts('es_peninsula');
  const shipping = getCost(grossSum / 1.21);
  const total = totalPlegat;

  const fmt = (n) => n.toFixed(2).replace('.', ',') + '€';
  const splitPrice = (n) => {
    const [intPart, decPart = '00'] = n.toFixed(2).split('.');
    return { intPart, decPart };
  };
  const preuParts = splitPrice(preu);
  const descompteParts = splitPrice(descompte);
  const ivaParts = splitPrice(ivaAmount);
  const totalParts = splitPrice(totalPlegat);

  const HEAD = { fontFamily: 'Oswald, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#475059' };
  const LABEL = { fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 400, color: '#667085', fontSize: '10pt' };
  const INPUT = { fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 400, color: '#4A5057', fontSize: '10.5pt', outline: 'none' };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [paymentError, setPaymentError] = useState(null);

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
    if (!acceptTerms) {
      setPaymentError('Has d\'acceptar els termes per continuar');
      return;
    }
    if (needsInvoice && (!formData.company || !formData.taxId)) {
      setPaymentError('Si necessites factura, indica empresa i CIF');
      return;
    }
    setFormErrors({});
    setPaymentError(null);
    setIsProcessing(true);
    try {
      let orderNumber = null;

      if (isDev) {
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
          subtotal: preu,
          shipping,
          iva: ivaAmount,
          total: totalPlegat,
          formData,
        });
        orderNumber = mockOrder.order_number;
      } else {
        if (!stripe || !elements) {
          setPaymentError('Stripe no s\'ha carregat. Torna-ho a provar.');
          setIsProcessing(false);
          return;
        }

        const response = await fetch('/.netlify/functions/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(totalPlegat * 100),
            currency: 'eur',
          }),
        });

        if (!response.ok) {
          throw new Error('Error creant Payment Intent');
        }

        const { clientSecret, paymentIntentId } = await response.json();

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardNumberElement),
              billing_details: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                address: {
                  line1: formData.address,
                  city: formData.city,
                  postal_code: formData.postalCode,
                  country: 'ES',
                },
              },
            },
          }
        );

        if (stripeError) {
          setPaymentError(stripeError.message || 'Error processant el pagament');
          setIsProcessing(false);
          return;
        }

        const order = await createOrder({
          email: formData.email,
          userId: user?.id || null,
          items: activeItems.map((item, idx) => ({
            id: item.id || `item-${idx}`,
            name: item.title || item.name || 'Producte',
            size: item.size || 'L',
            quantity: item.qty || 1,
            price: parseFloat(String(item.price).replace('€', '').replace(/\s/g, '').replace(',', '.')) || 0,
            image: item.image || '/tshirt-white.jpg',
          })),
          subtotal: preu,
          shippingCost: shipping,
          iva: ivaAmount,
          total: totalPlegat,
          shippingZone: 'es_peninsula',
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          address2: formData.address2,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
          paymentIntentId,
          company: needsInvoice ? formData.company : null,
          taxId: needsInvoice ? formData.taxId : null,
        });
        orderNumber = order?.order_number || order?.id || paymentIntentId;

        try {
          const gelatoResult = await createGelatoOrder({
            id: orderNumber,
            items: activeItems.map((item) => ({
              gelatoProductId: item.gelatoProductId || item.id,
              gelatoVariantId: item.gelatoVariantId || null,
              quantity: item.qty || 1,
              designFiles: item.designFiles || [],
              designUrl: item.designUrl || null,
            })),
            shippingAddress: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              street: formData.address,
              city: formData.city,
              postalCode: formData.postalCode,
              country: formData.country || 'Espanya',
            },
            email: formData.email,
          });

          if (gelatoResult?.orderId && gelatoResult.orderId !== orderNumber) {
            await fetch('/api/orders', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderNumber, gelatoOrderId: gelatoResult.orderId }),
            }).catch(() => {});
          }
        } catch (gelatoErr) {
          console.error('[checkout] Gelato order creation failed:', gelatoErr);
        }
      }

      trackPurchase(orderNumber, activeItems, totalPlegat, shipping, 0);
      if (setCartItems) setCartItems([]);
      setIsProcessing(false);
      if (onCloseMegaSlide) onCloseMegaSlide();
      navigate(`/order-confirmation/${orderNumber}`);
    } catch (err) {
      console.error('[checkout] Error creating order:', err);
      setPaymentError('Error processant la comanda');
      setIsProcessing(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: '34px',
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
    <div style={{ width:'100%', height:'106.4%', display:'flex', flexDirection:'column', fontFamily:'Roboto Condensed, sans-serif', color:'#4A5057', overflow:'visible', padding:0, margin:0 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', columnGap:'24px', padding:0, margin:0, flexShrink:0, alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ ...HEAD, fontSize:'18pt', fontWeight:600 }}>CHECKOUT</span>
          <span style={{ fontSize:'12pt', fontWeight:500 }}>La teva comanda</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
          <span style={{ fontSize:'12pt', fontWeight:500 }}>Dades d'enviament</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
          <span style={{ fontSize:'12pt', fontWeight:500 }}>Dades de pagament</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
          {onBackToCart && <button type="button" onClick={onBackToCart} style={{ border:'none', background:'transparent', color:'#667085', fontSize:'10pt', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}><ArrowLeft size={14} strokeWidth={2} /> Tornar al cistell</button>}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', columnGap:'24px', flex:'1 1 auto', minHeight:0 }}>
        {/* COL 1: Cistell + Totals */}
        <div style={{ display:'flex', flexDirection:'column', minHeight:0 }}>
          <div style={{ flex:'1 1 auto', overflow:'visible', minHeight:0 }}>
            {activeItems.map((item, idx) => {
              const ip = parseFloat(String(item.price).replace('€','').replace(/\s/g,'').replace(',','.'))||0;
              const q = item.qty||1;
              return (
                <div key={`c-${item.id}-${idx}`} style={{ display:'grid', gridTemplateColumns:'48px 1fr auto', columnGap:'10px', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #EEF0F3' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'4px', background:'#F3F4F6', overflow:'hidden', flexShrink:0 }}>{item.image && <img src={item.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}</div>
                  <div style={{ overflow:'hidden' }}>
                    <div style={{ fontSize:'10.5pt', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title||item.name||'Producte'}</div>
                    <div style={{ fontSize:'9pt', color:'#667085' }}>Talla: {item.size||'-'} · Qty: {q}</div>
                  </div>
                  <div style={{ fontSize:'10.5pt', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' }}>{(ip*q).toFixed(2).replace('.',',')}€</div>
                </div>
              );
            })}
          </div>
          <div style={{ flexShrink:0, paddingTop:'12px', borderTop:'1px solid #E6E8EC', marginTop:'8px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10pt', color:'#667085', padding:'2px 0' }}><span>Subtotal</span><span style={{ fontVariantNumeric:'tabular-nums' }}>{preu.toFixed(2).replace('.',',')}€</span></div>
            {discountEnabled && <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10pt', color:'#667085', padding:'2px 0' }}><span>Descompte (-{offersConfig.discountRate}%)</span><span style={{ fontVariantNumeric:'tabular-nums' }}>-{descompte.toFixed(2).replace('.',',')}€</span></div>}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10pt', color:'#667085', padding:'2px 0' }}><span>Portes</span><span style={{ fontVariantNumeric:'tabular-nums' }}>{shipping.toFixed(2).replace('.',',')}€</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10pt', color:'#667085', padding:'2px 0' }}><span>IVA 21%</span><span style={{ fontVariantNumeric:'tabular-nums' }}>{ivaAmount.toFixed(2).replace('.',',')}€</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13pt', fontWeight:500, padding:'8px 0 0', borderTop:'1px solid #E6E8EC', marginTop:'4px' }}><span>Total</span><span style={{ fontVariantNumeric:'tabular-nums' }}>{totalPlegat.toFixed(2).replace('.',',')}€</span></div>
          </div>
        </div>
        {/* COL 2: Dades d'enviament */}
        <div style={{ display:'flex', flexDirection:'column', minHeight:0, overflow:'visible', justifyContent:'space-between' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', columnGap:'10px' }}>
            <div><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nom" style={inputStyle} />{formErrors.firstName && <div style={errorStyle}>{formErrors.firstName}</div>}</div>
            <div><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Cognoms" style={inputStyle} />{formErrors.lastName && <div style={errorStyle}>{formErrors.lastName}</div>}</div>
          </div>
          <div><input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Adreça (carrer i número)" style={inputStyle} />{formErrors.address && <div style={errorStyle}>{formErrors.address}</div>}</div>
          <div><input type="text" name="address2" value={formData.address2} onChange={handleChange} placeholder="Pis, porta" style={inputStyle} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', columnGap:'10px' }}>
            <div><input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Codi postal" maxLength={5} style={inputStyle} />{formErrors.postalCode && <div style={errorStyle}>{formErrors.postalCode}</div>}</div>
            <div><input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Ciutat" style={inputStyle} />{formErrors.city && <div style={errorStyle}>{formErrors.city}</div>}</div>
          </div>
          <div><input type="text" name="province" value={formData.province || ''} onChange={handleChange} placeholder="Província" style={inputStyle} /></div>
          <div><select name="country" value={formData.country} onChange={handleChange} style={inputStyle}><option value="" disabled>País</option><option value="Espanya">Espanya</option><option value="França">França</option><option value="Andorra">Andorra</option></select></div>
          <div><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" style={inputStyle} />{formErrors.email && <div style={errorStyle}>{formErrors.email}</div>}</div>
          <div><input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Telèfon" style={inputStyle} /></div>
        </div>

        {/* COL 3: Pagament + Factura */}
        <div style={{ display:'flex', flexDirection:'column', minHeight:0, overflow:'visible' }}>
          {/* Pagament */}
          <div style={{ display:'grid', rowGap:'8px' }}>
            <div style={{ border:'1px solid #E6E8EC', borderRadius:'6px', background:'#FFFFFF', overflow:'hidden' }}>
              <div style={{ padding:'10px 12px', borderBottom:'1px solid #EEF0F3', display:'flex', alignItems:'center', gap:'8px', fontSize:'11pt', fontWeight:500, color:'#4A5057' }}>
                <span style={{ width:'13px', height:'10px', border:'1px solid #4A5057', borderRadius:'2px', display:'inline-block' }} />
                <span>Targeta</span>
              </div>
              <div style={{ padding:'10px 12px', display:'grid', rowGap:'8px' }}>
                <div style={{ border:'1px solid #D8DDE3', borderRadius:'4px', overflow:'hidden', background:'#FFFFFF', padding:'10px 12px' }}>
                  <CardNumberElement options={{ style: { base: { color:'#4A5057', fontFamily:'Roboto Condensed, sans-serif', fontSize:'14px', '::placeholder': { color:'#98A2B4' } }, invalid: { color:'#ef4444' } } }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', columnGap:'8px' }}>
                  <div style={{ border:'1px solid #D8DDE3', borderRadius:'4px', overflow:'hidden', background:'#FFFFFF', padding:'10px 12px' }}>
                    <CardExpiryElement options={{ style: { base: { color:'#4A5057', fontFamily:'Roboto Condensed, sans-serif', fontSize:'14px', '::placeholder': { color:'#98A2B4' } }, invalid: { color:'#ef4444' } } }} />
                  </div>
                  <div style={{ border:'1px solid #D8DDE3', borderRadius:'4px', overflow:'hidden', background:'#FFFFFF', padding:'10px 12px' }}>
                    <CardCvcElement options={{ style: { base: { color:'#4A5057', fontFamily:'Roboto Condensed, sans-serif', fontSize:'14px', '::placeholder': { color:'#98A2B4' } }, invalid: { color:'#ef4444' } } }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Factura opcional */}
          <div style={{ display:'grid', rowGap:'8px', marginTop:'14px' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'10.5pt', fontWeight:300 }}>
              <input type="checkbox" checked={needsInvoice} onChange={(e) => setNeedsInvoice(e.target.checked)} />
              <span>Necessites factura?</span>
            </label>
            {needsInvoice && (
              <div style={{ border:'1px solid #D8DDE3', borderRadius:'4px', overflow:'hidden', background:'#FFFFFF' }}>
                <input type="text" name="company" placeholder="Nom de l'empresa" value={formData.company} onChange={handleChange} style={{ width:'100%', height:'31px', border:'none', borderBottom:'1px solid #E6E8EC', padding:'0 10px', fontFamily:'Roboto Condensed, sans-serif', fontSize:'10.5pt', color:'#4A5057', outline:'none', boxSizing:'border-box' }} />
                <input type="text" name="taxId" placeholder="CIF (ex: ESA12345672)" value={formData.taxId} onChange={handleChange} style={{ width:'100%', height:'31px', border:'none', padding:'0 10px', fontFamily:'Roboto Condensed, sans-serif', fontSize:'10.5pt', color:'#4A5057', outline:'none', boxSizing:'border-box' }} />
              </div>
            )}
          </div>
        </div>

        {/* COL 4: Termes + Botó */}
        <div style={{ display:'flex', flexDirection:'column', minHeight:0, overflow:'visible' }}>
          {/* Termes — centrats verticalment */}
          <div style={{ flex:'1 1 auto', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'35px' }}>
            <label style={{ display:'flex', alignItems:'flex-start', gap:'8px', fontSize:'9.5pt', lineHeight:1.25, fontWeight:300 }}>
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} style={{ marginTop:'1px' }} />
              <span>Accepto els <a href="/terms" style={{ color:'#4A5057', textDecoration:'underline' }}>Termes del Servei</a>, la <a href="/privacy" style={{ color:'#4A5057', textDecoration:'underline' }}>Política de Privacitat</a> i la <a href="/shipping" style={{ color:'#4A5057', textDecoration:'underline' }}>Política d'enviaments</a>.</span>
            </label>
          </div>
          {/* Botó confirma — al bottom */}
          <div style={{ flexShrink:0 }}>
            <button onClick={handleSubmit} disabled={isProcessing} style={{ width:'100%', height:'46px', border:'none', borderRadius:'5px', backgroundColor: isProcessing?'#8FE8B9':'#00D66F', color:'#063B21', fontFamily:'Roboto Condensed, sans-serif', fontSize:'12pt', fontWeight:600, boxShadow:'0 1px 2px rgba(16,24,40,0.08)', cursor: isProcessing?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              {isProcessing ? 'Processant…' : (<><Check size={18} strokeWidth={2} /> Confirma la compra</>)}
            </button>
            {paymentError && <div style={{ marginTop:'10px', color:'#D04B4B', fontSize:'10pt', textAlign:'center' }}>{paymentError}</div>}
            <div style={{ marginTop:'10px', textAlign:'center', color:'#98A2B4', fontSize:'8.5pt', fontWeight:300 }}>Powered by Stripe&nbsp;&nbsp;|&nbsp;&nbsp;Termes&nbsp;&nbsp;Privacitat</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CheckoutContent = (props) => {
  const stripePromise = useMemo(() => getStripe(), []);

  return (
    <Elements stripe={stripePromise}>
      <CheckoutContentInner {...props} />
    </Elements>
  );
};

export default CheckoutContent;
