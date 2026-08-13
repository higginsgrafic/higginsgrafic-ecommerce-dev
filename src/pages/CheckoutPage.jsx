import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import LlistaCheckout from '@/components/LlistaCheckout';
import { formatPrice } from '@/utils/formatters';
import { validateEmail, validateRequired, validatePostalCode, validateForm } from '@/utils/validation';
import { trackBeginCheckout, trackPurchase } from '@/utils/analytics';
import { useShippingCosts } from '@/hooks/useShippingCosts';
import { getStripe } from '@/api/stripe';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { createGelatoOrder } from '@/api/gelato';
import { createMockOrder, MOCK_CLIENT } from '@/lib/mockOrderStore';

const PAUTA_ROWS = 33;
const PAUTA_FIRST_ROW_SCALE = 0.7;
const PAUTA_FIRST_ROW_EXTRA_PX = 4;
const PAUTA_TOTAL_WEIGHT = PAUTA_FIRST_ROW_SCALE + (PAUTA_ROWS - 1);
const PAUTA_ROWS_TEMPLATE = `minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, ${PAUTA_FIRST_ROW_SCALE}fr) repeat(${PAUTA_ROWS - 1}, minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, 1fr))`;
const LEFT_ROW_GRADIENT_STYLE = {
  background: 'transparent',
};
const CHECKOUT_PAGE_TOP_OFFSET = '32px';
const CHECKOUT_PAGE_LEFT_OFFSET = '-17px';


const CheckoutPageInner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: showError } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const [formData, setFormData] = useState({
    email: MOCK_CLIENT.email,
    firstName: MOCK_CLIENT.firstName,
    lastName: MOCK_CLIENT.lastName,
    address: MOCK_CLIENT.address,
    city: MOCK_CLIENT.city,
    postalCode: MOCK_CLIENT.postalCode,
    country: MOCK_CLIENT.country
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(import.meta.env.DEV);

  const isDev = import.meta.env.DEV;

  const checkoutCartItems = useMemo(() => {
    const stateItems = Array.isArray(location?.state?.cartItems) ? location.state.cartItems : [];
    return stateItems.length > 0 ? stateItems : (Array.isArray(cartItems) ? cartItems : []);
  }, [location?.state?.cartItems, cartItems]);

  const isMockCheckout = checkoutCartItems.length === 0 && !isDev;
  const mockImages = ['/tshirt-white.jpg', '/tshirt-red.jpg', '/tshirt-green.jpg', '/tshirt-blue.jpg'];
  const mockCheckoutItems = useMemo(() => ([
    { id: 'mock-1', name: 'Sense & Sensibility', size: 'L', quantity: 1, price: 15.5, image: mockImages[0] },
    { id: 'mock-2', name: 'Human Inside Tee', size: 'M', quantity: 1, price: 15.5, image: mockImages[1] },
    { id: 'mock-3', name: 'Austin Info Club', size: 'XL', quantity: 1, price: 15.5, image: mockImages[2] },
    { id: 'mock-4', name: 'First Contact', size: 'S', quantity: 2, price: 15.5, image: mockImages[3] },
    { id: 'mock-5', name: 'Cube Manifest', size: 'L', quantity: 1, price: 15.5, image: mockImages[0] },
    { id: 'mock-6', name: 'Misceŀlània 01', size: 'M', quantity: 1, price: 15.5, image: mockImages[1] },
    { id: 'mock-7', name: 'Graphic Basic', size: 'L', quantity: 3, price: 15.5, image: mockImages[2] },
    { id: 'mock-8', name: 'No Signal', size: 'XL', quantity: 1, price: 15.5, image: mockImages[3] },
    { id: 'mock-9', name: 'Soft Error', size: 'M', quantity: 1, price: 15.5, image: mockImages[0] },
    { id: 'mock-10', name: 'Local Ghost', size: 'S', quantity: 2, price: 15.5, image: mockImages[1] },
    { id: 'mock-11', name: 'Archive Mode', size: 'L', quantity: 1, price: 15.5, image: mockImages[2] },
    { id: 'mock-12', name: 'Under Construction', size: 'M', quantity: 1, price: 15.5, image: mockImages[3] },
    { id: 'mock-13', name: 'Pixel Picnic', size: 'XL', quantity: 1, price: 15.5, image: mockImages[0] },
    { id: 'mock-14', name: 'Botiga Oberta', size: 'L', quantity: 2, price: 15.5, image: mockImages[1] },
    { id: 'mock-15', name: 'The Human Inside', size: 'S', quantity: 1, price: 15.5, image: mockImages[2] },
    { id: 'mock-16', name: 'Checkout Club', size: 'M', quantity: 1, price: 15.5, image: mockImages[3] },
    { id: 'mock-17', name: 'Carrer Major', size: 'L', quantity: 1, price: 15.5, image: mockImages[0] },
    { id: 'mock-18', name: 'Final Boss Tee', size: 'XL', quantity: 2, price: 15.5, image: mockImages[1] },
    { id: 'mock-19', name: 'Blue Guide', size: 'M', quantity: 1, price: 15.5, image: mockImages[2] },
    { id: 'mock-20', name: 'Stripe Like', size: 'L', quantity: 1, price: 15.5, image: mockImages[3] },
    { id: 'mock-21', name: 'Scroll Test', size: 'S', quantity: 1, price: 15.5, image: mockImages[0] },
    { id: 'mock-22', name: 'Roboto Condensed', size: 'M', quantity: 2, price: 15.5, image: mockImages[1] },
    { id: 'mock-23', name: 'Belt Two', size: 'L', quantity: 1, price: 15.5, image: mockImages[2] },
    { id: 'mock-24', name: 'Tot Plegat', size: 'XL', quantity: 1, price: 15.5, image: mockImages[3] },
    { id: 'mock-25', name: 'Mazinger-C', size: 'L', quantity: 1, price: 15.5, image: mockImages[0] },
    { id: 'mock-26', name: 'Pixel Dust', size: 'M', quantity: 2, price: 15.5, image: mockImages[1] },
    { id: 'mock-27', name: 'Grid Lock', size: 'S', quantity: 1, price: 15.5, image: mockImages[2] },
    { id: 'mock-28', name: 'Final Cut', size: 'XL', quantity: 1, price: 15.5, image: mockImages[3] },
    { id: 'mock-29', name: 'Open Source', size: 'L', quantity: 1, price: 15.5, image: mockImages[0] },
    { id: 'mock-30', name: 'Dark Mode', size: 'M', quantity: 2, price: 15.5, image: mockImages[1] },
    { id: 'mock-31', name: 'Light Mode', size: 'S', quantity: 1, price: 15.5, image: mockImages[2] },
    { id: 'mock-32', name: 'Cache Clear', size: 'XL', quantity: 1, price: 15.5, image: mockImages[3] },
  ]), []);
  const checkoutRenderItems = useMemo(() => (
    checkoutCartItems.length > 0 ? checkoutCartItems : mockCheckoutItems
  ), [checkoutCartItems, mockCheckoutItems]);

  const { getCost, zoneInfo } = useShippingCosts();
  const subtotal = checkoutRenderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalQuantity = checkoutRenderItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const shipping = getCost(formData.country, totalQuantity, subtotal);
  const total = subtotal + shipping;
  const ivaAmount = subtotal * 0.21;
  const displayPrice = (value) => formatPrice(value).replace(/\u00a0/g, ' ').replace(/\s+/g, '').replace(/\s*€\s*$/, '€');
  const splitPriceParts = (value) => {
    const raw = formatPrice(value).replace(/\u00a0/g, ' ').replace(/\s*€\s*$/, '');
    const [intPart, decPart = '00'] = raw.split(',');
    return { intPart, decPart };
  };
  const alignedAmountStyle = { fontVariantNumeric: 'tabular-nums', gridTemplateColumns: '1fr auto', minWidth: '92px' };
  const subtotalParts = splitPriceParts(subtotal);
  const transportParts = splitPriceParts(shipping === 0 ? zoneInfo.cost : shipping);
  const ivaParts = splitPriceParts(ivaAmount);
  const totalParts = splitPriceParts(total);

  // Track begin checkout
  useEffect(() => {
    if (checkoutCartItems.length > 0) {
      trackBeginCheckout(checkoutCartItems, total);
    }
  }, [checkoutCartItems, total]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openFullWideCartSlide = () => {
    window.dispatchEvent(new CustomEvent('hg:open-full-wide-cart', {
      detail: { source: 'checkout-breadcrumb' }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulari
    const rules = {
      email: [
        { validate: validateRequired, message: 'El correu és obligatori' },
        { validate: validateEmail, message: 'Format de correu invàlid' }
      ],
      firstName: [
        { validate: validateRequired, message: 'El nom és obligatori' }
      ],
      lastName: [
        { validate: validateRequired, message: 'Els cognoms són obligatoris' }
      ],
      address: [
        { validate: validateRequired, message: "L'adreça és obligatòria" }
      ],
      city: [
        { validate: validateRequired, message: 'La ciutat és obligatòria' }
      ],
      postalCode: [
        { validate: validateRequired, message: 'El codi postal és obligatori' },
        { validate: validatePostalCode, message: 'Codi postal invàlid (format: 08001)' }
      ]
    };

    const errors = validateForm(formData, rules);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showError('Revisa els camps del formulari');
      return;
    }

    setFormErrors({});
    setIsProcessing(true);

    if (isDev) {
      try {
        const orderItems = checkoutRenderItems.map((item, idx) => ({
          id: item.id || `item-${idx}`,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
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

        trackPurchase(mockOrder.order_number, orderItems, total, shipping, 0);
        clearCart();
        setIsProcessing(false);
        success('Comanda confirmada');
        navigate(`/order-confirmation/${mockOrder.order_number}`);
        return;
      } catch (err) {
        console.error('[Checkout] Mock order error:', err);
        showError('Error creant comanda mock');
        setIsProcessing(false);
        return;
      }
    }

    try {
      const stripe = await getStripe();
      if (!stripe) {
        showError('No s\'ha pogut carregar Stripe');
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100),
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
            card: elements.getElement(CardElement),
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
        const errorMsg = stripeError.message || 'Error processant el pagament';
        showError(errorMsg);
        setIsProcessing(false);
        return;
      }

      let orderNumber = null;

      if (!isMockCheckout) {
        try {
          const order = await createOrder({
            email: formData.email,
            userId: user?.id || null,
            items: checkoutCartItems.map(item => ({
              id: item.id,
              name: item.name,
              size: item.size,
              quantity: item.quantity,
              price: item.price,
              image: item.image || item.imageUrl || null,
            })),
            subtotal,
            shippingCost: shipping,
            iva: ivaAmount,
            total,
            shippingZone: 'es_peninsula',
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            address2: formData.address2 || null,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country || 'Espanya',
            paymentIntentId,
          });
          orderNumber = order?.order_number || order?.id || paymentIntentId;

          try {
            const gelatoResult = await createGelatoOrder({
              id: orderNumber,
              items: checkoutCartItems.map(item => ({
                gelatoProductId: item.gelatoProductId || item.id,
                gelatoVariantId: item.gelatoVariantId || item.size,
                quantity: item.quantity,
                designFiles: item.designFiles || [],
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
            console.error('[Checkout] Gelato order creation failed:', gelatoErr);
          }
        } catch (orderErr) {
          console.error('[Checkout] Error creating order:', orderErr);
          orderNumber = paymentIntentId;
        }

        trackPurchase(orderNumber, checkoutCartItems, total, shipping, 0);
        clearCart();
      }

      setIsProcessing(false);
      const redirectId = orderNumber || paymentIntentId || 'GRF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      success('Comanda confirmada');
      navigate(`/order-confirmation/${redirectId}`);
    } catch (error) {
      setIsProcessing(false);
      showError('Error processant la comanda');
    }
  };

  return (
    <div className="relative pt-0 pb-0 checkout-text-only" style={{ backgroundColor: '#fff', minHeight: 'calc(var(--belt2-yB, 100vh) - var(--belt2-yT, 0px) + 192px)' }}>
      <Helmet>
        <title>Checkout | GRAFC</title>
        <meta name="description" content="Completa la teva comanda de manera segura." />
      </Helmet>

      {isMockCheckout && (
        <div className="flex flex-col items-center justify-center py-20 px-4" style={{ minHeight: '60vh' }}>
          <p className="font-oswald text-2xl font-bold uppercase mb-2" style={{ color: '#4A5057' }}>
            La cistella és buida
          </p>
          <p className="text-sm mb-6" style={{ color: '#667085' }}>
            Afegeix productes a la cistella per continuar amb la compra.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#141414', color: '#FFFFFF', border: 'none', borderRadius: '5px',
              padding: '12px 32px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Continua comprant
          </button>
        </div>
      )}

      {!isMockCheckout && (
      <>
      <LlistaCheckout items={checkoutRenderItems} onBreadcrumbClick={openFullWideCartSlide} country={formData.country} />

      <style>
          {`
            .checkout-text-only,
            .checkout-text-only * {
              color: inherit;
            }

            .checkout-text-only input,
            .checkout-text-only select,
            .checkout-text-only textarea {
              color: transparent !important;
              caret-color: transparent !important;
              background: transparent !important;
              border-color: transparent !important;
              box-shadow: none !important;
            }

            .checkout-text-only input::placeholder,
            .checkout-text-only textarea::placeholder {
              color: transparent !important;
            }

            .checkout-text-only button,
            .checkout-text-only [type='button'] {
              background: transparent !important;
              border-color: transparent !important;
              box-shadow: none !important;
            }

            .checkout-text-only * {
              box-shadow: none !important;
            }

            .checkout-text-only #stripe-guide-checkout-pay-desktop {
              background: #00D66F !important;
              border-color: transparent !important;
              box-shadow: 0 1px 2px rgba(16, 24, 40, 0.08) !important;
            }

            body:has(.checkout-text-only) {
              overflow: auto !important;
            }
          `}
        </style>
        {isDev && (
          <style>{`
            .checkout-text-only input,
            .checkout-text-only select,
            .checkout-text-only textarea {
              color: #4A5057 !important;
              caret-color: #4A5057 !important;
            }
            .checkout-text-only input::placeholder,
            .checkout-text-only textarea::placeholder {
              color: #98A2B4 !important;
            }
          `}</style>
        )}

      <div
        className="absolute z-[3]"
        style={{
          left: `calc(var(--belt2-xL, 0px) + ${CHECKOUT_PAGE_LEFT_OFFSET})`,
          top: CHECKOUT_PAGE_TOP_OFFSET,
          width: 'calc(var(--belt2-xR, 100vw) - var(--belt2-xL, 0px))',
          height: 'calc(var(--belt2-yB, 100vh) - var(--belt2-yT, 0px))',
          display: 'block',
          pointerEvents: 'none',
        }}
      >
        <div id="stripe-guide-checkout-layout-top-anchor" style={{ height: 0 }} />
        <div
          className="grid h-full"
          style={{
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: PAUTA_ROWS_TEMPLATE,
            columnGap: '45px',
            rowGap: '3px',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              gridColumn: '2 / 3',
              gridRow: '1 / 34',
              backgroundImage: 'url(/placeholders/tots_els_fons/fons_acordio/una-columnat.png)',
              backgroundRepeat: 'repeat-y',
              backgroundPosition: 'center top',
              backgroundSize: '100% auto',
              zIndex: -1,
            }}
          />
          <div
            id="stripe-guide-checkout-top-anchor"
            style={{ display: 'none', gridColumn: '1 / 2', gridRow: '3 / 4', color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif' }}
            className="h-full w-full flex items-center text-[18pt] font-semibold uppercase tracking-[0.02em]"
          >
            PRODUCTES
          </div>
          <div style={{ display: 'none', gridColumn: '1 / 2', gridRow: '4 / 5' }}>
            <div className="grid h-full items-center text-[11pt] leading-[1] border-b border-border" style={{ ...LEFT_ROW_GRADIENT_STYLE, color: '#4A5057', gridTemplateColumns: 'minmax(0, 1fr) 62px 62px 84px', columnGap: '8px', fontFamily: 'Roboto Condensed, sans-serif' }}>
              <span />
              <span className="text-right uppercase">Tallatge</span>
              <span className="text-right uppercase">Quantitat</span>
              <span className="text-right uppercase">Import</span>
            </div>
          </div>
          {checkoutRenderItems.slice(0, 22).map((item, idx) => {
            const linePriceParts = splitPriceParts(item.price * item.quantity);
            return (
              <div
                key={`charge-item-${item.id}-${item.size}-${idx}`}
                style={{ display: 'none', gridColumn: '1 / 2', gridRow: `${5 + idx} / ${6 + idx}` }}
              >
                <div className="grid h-full items-center text-[16pt] leading-[1.5] border-b border-border/40" style={{ ...LEFT_ROW_GRADIENT_STYLE, color: '#4A5057', gridTemplateColumns: 'minmax(0, 1fr) 62px 62px 84px', columnGap: '8px', fontFamily: 'Roboto Condensed, sans-serif' }}>
                  <span className="truncate">{item.name}</span>
                  <span className="text-right">{item.size}</span>
                  <span className="text-right">{item.quantity}</span>
                  <span className="grid justify-end font-medium" style={alignedAmountStyle}>
                    <span className="text-right">{linePriceParts.intPart},</span>
                    <span>{linePriceParts.decPart}€</span>
                  </span>
                </div>
              </div>
            );
          })}
          <div style={{ ...LEFT_ROW_GRADIENT_STYLE, display: 'none', gridColumn: '1 / 2', gridRow: '30 / 31' }} className="h-full w-full flex items-center justify-between text-[18pt] border-t border-border px-2">
            <span className="font-light uppercase tracking-[0.08em]" style={{ color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif' }}>Subtotal</span>
            <span className="grid items-center font-light" style={{ ...alignedAmountStyle, color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif' }}>
              <span className="text-right">{subtotalParts.intPart},</span>
              <span>{subtotalParts.decPart}€</span>
            </span>
          </div>
          <div style={{ ...LEFT_ROW_GRADIENT_STYLE, display: 'none', gridColumn: '1 / 2', gridRow: '31 / 32' }} className="h-full w-full flex items-center justify-between text-[18pt] px-2">
            <span className="font-light uppercase tracking-[0.08em]" style={{ color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif' }}>Transport</span>
            <span className={`grid items-center font-light ${shipping === 0 ? 'line-through opacity-70' : ''}`} style={{ ...alignedAmountStyle, color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif' }}>
              <span className="text-right">{transportParts.intPart},</span>
              <span>{transportParts.decPart}€</span>
            </span>
          </div>
          <div style={{ ...LEFT_ROW_GRADIENT_STYLE, display: 'none', gridColumn: '1 / 2', gridRow: '32 / 33' }} className="h-full w-full flex items-center justify-between text-[18pt] px-2">
            <span className="font-light uppercase tracking-[0.08em]" style={{ color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif' }}>IVA 21%</span>
            <span className="grid items-center font-light" style={{ ...alignedAmountStyle, color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif' }}>
              <span className="text-right">{ivaParts.intPart},</span>
              <span>{ivaParts.decPart}€</span>
            </span>
          </div>
          <div style={{ ...LEFT_ROW_GRADIENT_STYLE, display: 'none', gridColumn: '1 / 2', gridRow: '33 / 34', borderTop: '1px solid rgba(71, 80, 89, 0.18)' }} className="h-full w-full flex items-center justify-between px-2">
            <span className="text-[24pt] font-light uppercase tracking-[0.06em]" style={{ color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif' }}>Tot plegat fa</span>
            <span className="grid items-center text-[24pt] font-normal" style={{ ...alignedAmountStyle, color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif' }}>
              <span className="text-right">{totalParts.intPart},</span>
              <span>{totalParts.decPart}€</span>
            </span>
          </div>

          <div style={{ gridColumn: '2 / 3', gridRow: '3 / 31', display: 'flex', justifyContent: 'center', color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif', pointerEvents: 'auto' }}>
            <div style={{ width: 'min(100%, 384px)' }}>
              <div style={{ border: '1px solid #E6E8EC', borderRadius: '9px', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)', overflow: 'hidden' }}>
                <div style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid #EEF0F3' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12pt', fontWeight: 600 }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#00D66F', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '9pt', fontWeight: 700 }}>›</span>
                    <span>link</span>
                  </div>
                  <span style={{ color: '#98A2B4', fontSize: '15pt', lineHeight: 1 }}>···</span>
                </div>
                <div style={{ padding: '14px 16px 12px', display: 'grid', rowGap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '74px 1fr', alignItems: 'center', columnGap: '12px', fontSize: '11pt' }}>
                    <span style={{ color: '#667085', fontWeight: 300 }}>Email</span>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="higginsgrafic@gmail.com" style={{ border: 'none', outline: 'none', background: 'transparent', color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '11pt', fontWeight: 400 }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '74px 1fr', alignItems: 'center', columnGap: '12px', fontSize: '11pt' }}>
                    <span style={{ color: '#667085', fontWeight: 300 }}>Paga amb</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{ width: '28px', height: '18px', borderRadius: '4px', background: '#111827', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontSize: '8pt', flexShrink: 0 }}>●●</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 400 }}>Mastercard</span>
                      <span style={{ color: '#98A2B4', fontWeight: 300, whiteSpace: 'nowrap' }}>•••• 1234</span>
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10.5pt', fontWeight: 300, color: '#4A5057' }}>
                    <input type="checkbox" />
                    <span>Si falla, utilitza Visa •••• 1234</span>
                  </label>
                </div>
              </div>

              <div style={{ marginTop: paymentDetailsOpen ? '14px' : '18px', display: 'grid', rowGap: '8px' }}>
                <div style={{ fontSize: '12pt', fontWeight: 500, color: '#4A5057' }}>Altres dades</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10.5pt', fontWeight: 300 }}>
                  <input type="checkbox" checked readOnly />
                  <span>Necessites factura?</span>
                </label>
                <div style={{ display: 'grid', rowGap: '0' }}>
                  <label style={{ fontSize: '10pt', fontWeight: 300, color: '#667085', marginBottom: '5px' }}>Informació d'IVA</label>
                  <div style={{ border: '1px solid #D8DDE3', borderRadius: '4px', overflow: 'hidden', background: '#FFFFFF' }}>
                    <input type="text" name="company" placeholder="Nom de l'empresa" value={formData.company || ''} onChange={handleChange} style={{ width: '100%', height: '31px', border: 'none', borderBottom: '1px solid #E6E8EC', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', boxSizing: 'border-box' }} />
                    <select name="country" value={formData.country} onChange={handleChange} style={{ width: '100%', height: '31px', border: 'none', borderBottom: '1px solid #80C7F5', boxShadow: 'inset 0 0 0 1px #80C7F5', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}>
                    <option value="">🇪🇸 ES VAT</option>
                    <option value="Espanya">🇪🇸 ES VAT</option>
                    <option value="França">🇫🇷 FR VAT</option>
                    </select>
                    <input type="text" name="taxId" placeholder="ESA12345672" value={formData.taxId || ''} onChange={handleChange} style={{ width: '100%', height: '31px', border: 'none', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '9.5pt', lineHeight: 1.25, fontWeight: 300, color: '#4A5057', marginTop: '6px' }}>
                  <input type="checkbox" checked readOnly style={{ marginTop: '1px' }} />
                  <span>Accepto els Termes del Servei, la Política de Privacitat i la Política d'ús acceptable.</span>
                </label>
              </div>

              <div style={{ marginTop: '14px' }}>
                <button
                  id="stripe-guide-checkout-pay-desktop"
                  type="button"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  style={{ width: '100%', height: '46px', border: 'none', borderRadius: '5px', backgroundColor: isProcessing ? '#8FE8B9' : '#00D66F', backgroundImage: 'none', color: '#063B21', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 600, letterSpacing: '0.01em', boxShadow: '0 1px 2px rgba(16, 24, 40, 0.08)', cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                >
                  {isProcessing ? 'Processant…' : 'Confirma la compra'}
                </button>
              </div>

              <div style={{ marginTop: '10px', textAlign: 'center', color: '#667085', fontSize: '9pt', fontWeight: 300, lineHeight: 1.25 }}>
                En confirmar el pagament, autoritzes el càrrec d'aquest pagament i futurs pagaments segons els termes.
              </div>
              <button
                type="button"
                onClick={() => setPaymentDetailsOpen((open) => !open)}
                style={{ width: '100%', marginTop: '16px', border: 'none', background: 'transparent', color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10pt', fontWeight: 500 }}
              >
                {paymentDetailsOpen ? 'Amaga les dades de pagament' : 'Continua com a hoste'}
              </button>

              <div style={{ display: paymentDetailsOpen ? 'grid' : 'none', marginTop: '16px', rowGap: '12px' }}>
                <div style={{ fontSize: '12pt', fontWeight: 500, color: '#4A5057' }}>Dades de pagament</div>
                <div style={{ border: '1px solid #E6E8EC', borderRadius: '6px', background: '#FFFFFF', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid #EEF0F3', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11pt', fontWeight: 500 }}>
                    <span style={{ width: '13px', height: '10px', border: '1px solid #4A5057', borderRadius: '2px', display: 'inline-block' }} />
                    <span>Targeta</span>
                  </div>
                  <div style={{ padding: '10px 12px', display: 'grid', rowGap: '8px' }}>
                    <label style={{ display: 'grid', rowGap: '4px', fontSize: '10pt', fontWeight: 300, color: '#667085' }}>
                      Informació de la targeta
                      <div style={{ border: '1px solid #D8DDE3', borderRadius: '4px', overflow: 'hidden', background: '#FFFFFF', padding: '10px 12px' }}>
                        <CardElement options={{
                          style: {
                            base: {
                              color: '#4A5057',
                              fontFamily: 'Roboto Condensed, sans-serif',
                              fontSize: '14px',
                              '::placeholder': { color: '#98A2B4' },
                            },
                            invalid: { color: '#ef4444' },
                          },
                          hidePostalCode: true,
                        }} />
                      </div>
                    </label>
                    <label style={{ display: 'grid', rowGap: '4px', fontSize: '10pt', fontWeight: 300, color: '#667085' }}>
                      Nom del titular
                      <input type="text" name="firstName" placeholder="Nom tal com surt a la targeta" value={formData.firstName} onChange={handleChange} style={{ height: '32px', border: '1px solid #D8DDE3', borderRadius: '4px', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none' }} />
                    </label>
                    <label style={{ display: 'grid', rowGap: '4px', fontSize: '10pt', fontWeight: 300, color: '#667085' }}>
                      Adreça de facturació
                      <div style={{ border: '1px solid #D8DDE3', borderRadius: '4px', overflow: 'hidden', background: '#FFFFFF' }}>
                        <select name="country" value={formData.country} onChange={handleChange} style={{ width: '100%', height: '31px', border: 'none', borderBottom: '1px solid #E6E8EC', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}>
                          <option value="">Selecciona un país</option>
                          <option value="Espanya">Espanya</option>
                          <option value="França">França</option>
                          <option value="Alemanya">Alemanya</option>
                          <option value="Itàlia">Itàlia</option>
                          <option value="Regne Unit">Regne Unit</option>
                          <option value="Irlanda">Irlanda</option>
                          <option value="Suècia">Suècia</option>
                          <option value="Dinamarca">Dinamarca</option>
                          <option value="Noruega">Noruega</option>
                          <option value="Portugal">Portugal</option>
                          <option value="Bèlgica">Bèlgica</option>
                          <option value="Països Baixos">Països Baixos</option>
                          <option value="Àustria">Àustria</option>
                          <option value="Suïssa">Suïssa</option>
                          <option value="Islàndia">Islàndia</option>
                          <option value="Andorra">Andorra</option>
                          <option value="Estats Units">Estats Units</option>
                          <option value="Canadà">Canadà</option>
                          <option value="Austràlia">Austràlia</option>
                          <option value="Japó">Japó</option>
                        </select>
                        <input type="text" name="address" placeholder="Adreça línia 1" value={formData.address} onChange={handleChange} style={{ width: '100%', height: '31px', border: 'none', borderBottom: '1px solid #E6E8EC', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', boxSizing: 'border-box' }} />
                        <input type="text" name="address2" placeholder="Adreça línia 2" value={formData.address2 || ''} onChange={handleChange} style={{ width: '100%', height: '31px', border: 'none', borderBottom: '1px solid #E6E8EC', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', boxSizing: 'border-box' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <input type="text" name="postalCode" placeholder="Codi postal" value={formData.postalCode} onChange={handleChange} style={{ height: '31px', border: 'none', borderRight: '1px solid #E6E8EC', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', boxSizing: 'border-box' }} />
                          <input type="text" name="city" placeholder="Ciutat" value={formData.city} onChange={handleChange} style={{ height: '31px', border: 'none', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '16px', textAlign: 'center', color: '#98A2B4', fontSize: '8.5pt', fontWeight: 300 }}>
                Powered by stripe&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;Termes&nbsp;&nbsp;&nbsp;Privacitat
              </div>
            </div>
          </div>
          <input type="hidden" name="stripeConnectionEnabled" value="false" />
        </div>
        <div id="stripe-guide-checkout-layout-bottom-anchor" style={{ height: 0 }} />
      </div>
      </>
      )}
    </div>
  );
};

const CheckoutPage = () => {
  const stripePromise = useMemo(() => getStripe(), []);

  return (
    <Elements stripe={stripePromise}>
      <CheckoutPageInner />
    </Elements>
  );
};

export default CheckoutPage;
