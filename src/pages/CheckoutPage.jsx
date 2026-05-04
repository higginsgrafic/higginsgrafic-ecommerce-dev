import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import Breadcrumbs from '@/components/Breadcrumbs';
import { formatPrice } from '@/utils/formatters';
import { validateEmail, validateRequired, validatePostalCode, validateForm } from '@/utils/validation';
import { trackBeginCheckout, trackPurchase } from '@/utils/analytics';

const PAUTA_ROWS = 33;
const PAUTA_FIRST_ROW_SCALE = 0.7;
const PAUTA_FIRST_ROW_EXTRA_PX = 4;
const PAUTA_TOTAL_WEIGHT = PAUTA_FIRST_ROW_SCALE + (PAUTA_ROWS - 1);
const PAUTA_ROWS_TEMPLATE = `minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, ${PAUTA_FIRST_ROW_SCALE}fr) repeat(${PAUTA_ROWS - 1}, minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, 1fr))`;
const LEFT_ROW_GRADIENT_STYLE = {
  background: 'transparent',
};
const PAUTA_OTHER_ROW_PERCENT = (1 / PAUTA_TOTAL_WEIGHT) * 100;
const PAUTA_OTHER_ROW_COMP_PX = PAUTA_FIRST_ROW_EXTRA_PX / (PAUTA_ROWS - 1);
const PAUTA_FIRST_ROW_PERCENT = (PAUTA_FIRST_ROW_SCALE / PAUTA_TOTAL_WEIGHT) * 100;
const PAUTA_ROWS_TEMPLATE_2 = `minmax(0, calc(${PAUTA_FIRST_ROW_PERCENT}% + ${PAUTA_FIRST_ROW_EXTRA_PX}px)) repeat(${PAUTA_ROWS - 1}, minmax(0, calc(${PAUTA_OTHER_ROW_PERCENT}% - ${PAUTA_OTHER_ROW_COMP_PX}px)))`;
const CHECKOUT_PAGE_TOP_OFFSET = '33px';
const CHECKOUT_PAGE_LEFT_OFFSET = '0px';
const SHOW_V1_ORDERS_DETAILS = true;
const CHECKOUT_TABLE_HEADER_SHIFT_Y = -4;
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_CONFIGURED_NOT_CONNECTED';
const stripeConfigured = !!stripePublishableKey;
const stripeConnectionEnabled = false;

const inputCell = 'w-full h-full px-2 text-[12pt] border border-border rounded-sm bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-ring';
const titleCell = 'h-full w-full flex items-center text-[18pt] font-medium font-oswald uppercase tracking-[0.4px] text-foreground';

const CheckoutPage = ({ cartItems, onClearCart, pautaEnabled = true, mockMode = 'full' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(false);
  const [checkoutScrollRow, setCheckoutScrollRow] = useState(0);
  const checkoutPautaRef = useRef(null);
  const [checkoutPautaRowHeight, setCheckoutPautaRowHeight] = useState(null);

  const checkoutCartItems = useMemo(() => {
    const stateItems = Array.isArray(location?.state?.cartItems) ? location.state.cartItems : [];
    return stateItems.length > 0 ? stateItems : (Array.isArray(cartItems) ? cartItems : []);
  }, [location?.state?.cartItems, cartItems]);

  useEffect(() => {
    const updatePautaRowHeight = () => {
      const pautaEl = checkoutPautaRef.current;
      if (!pautaEl) return;
      const height = pautaEl.getBoundingClientRect().height;
      setCheckoutPautaRowHeight((height * PAUTA_OTHER_ROW_PERCENT) / 100 - PAUTA_OTHER_ROW_COMP_PX);
    };

    updatePautaRowHeight();
    window.addEventListener('resize', updatePautaRowHeight);
    return () => window.removeEventListener('resize', updatePautaRowHeight);
  }, []);

  const isMockCheckout = checkoutCartItems.length === 0;
  const mockCheckoutItems = useMemo(() => ([
    { id: 'mock-1', name: 'Sense & Sensibility', size: 'L', quantity: 1, price: 15.5 },
    { id: 'mock-2', name: 'Human Inside Tee', size: 'M', quantity: 1, price: 15.5 },
    { id: 'mock-3', name: 'Austin Info Club', size: 'XL', quantity: 1, price: 15.5 },
    { id: 'mock-4', name: 'First Contact', size: 'S', quantity: 2, price: 15.5 },
    { id: 'mock-5', name: 'Cube Manifest', size: 'L', quantity: 1, price: 15.5 },
    { id: 'mock-6', name: 'Misceŀlània 01', size: 'M', quantity: 1, price: 15.5 },
    { id: 'mock-7', name: 'Graphic Basic', size: 'L', quantity: 3, price: 15.5 },
    { id: 'mock-8', name: 'No Signal', size: 'XL', quantity: 1, price: 15.5 },
    { id: 'mock-9', name: 'Soft Error', size: 'M', quantity: 1, price: 15.5 },
    { id: 'mock-10', name: 'Local Ghost', size: 'S', quantity: 2, price: 15.5 },
    { id: 'mock-11', name: 'Archive Mode', size: 'L', quantity: 1, price: 15.5 },
    { id: 'mock-12', name: 'Under Construction', size: 'M', quantity: 1, price: 15.5 },
    { id: 'mock-13', name: 'Pixel Picnic', size: 'XL', quantity: 1, price: 15.5 },
    { id: 'mock-14', name: 'Botiga Oberta', size: 'L', quantity: 2, price: 15.5 },
    { id: 'mock-15', name: 'The Human Inside', size: 'S', quantity: 1, price: 15.5 },
    { id: 'mock-16', name: 'Checkout Club', size: 'M', quantity: 1, price: 15.5 },
    { id: 'mock-17', name: 'Carrer Major', size: 'L', quantity: 1, price: 15.5 },
    { id: 'mock-18', name: 'Final Boss Tee', size: 'XL', quantity: 2, price: 15.5 },
    { id: 'mock-19', name: 'Blue Guide', size: 'M', quantity: 1, price: 15.5 },
    { id: 'mock-20', name: 'Stripe Like', size: 'L', quantity: 1, price: 15.5 },
    { id: 'mock-21', name: 'Scroll Test', size: 'S', quantity: 1, price: 15.5 },
    { id: 'mock-22', name: 'Roboto Condensed', size: 'M', quantity: 2, price: 15.5 },
    { id: 'mock-23', name: 'Belt Two', size: 'L', quantity: 1, price: 15.5 },
    { id: 'mock-24', name: 'Tot Plegat', size: 'XL', quantity: 1, price: 15.5 },
  ]), []);
  const checkoutRenderItems = useMemo(() => {
    if (mockMode === 'single') {
      return [
        { ...mockCheckoutItems[0], id: 'mock-single-vader', name: 'VADER' },
        ...mockCheckoutItems.slice(1, 27),
      ];
    }
    return checkoutCartItems.length > 0
      ? checkoutCartItems
      : mockCheckoutItems;
  }, [checkoutCartItems, mockCheckoutItems, mockMode]);
  const variantNumbersByItemKey = useMemo(() => {
    const variantTitles = new Set(['SENSE & SENSIBILITY', 'PRIDE & PREJUDICE', 'PERSUASION']);
    return checkoutRenderItems.reduce((acc, item, index) => {
      const normalizedName = String(item.name || '').trim().toUpperCase();
      if (variantTitles.has(normalizedName)) {
        acc[`${item.id || normalizedName}-${index}`] = Math.floor(Math.random() * 4) + 1;
      }
      return acc;
    }, {});
  }, [checkoutRenderItems]);
  const getCheckoutProductDisplayName = (item, index) => {
    const variantNumber = variantNumbersByItemKey[`${item.id || String(item.name || '').trim().toUpperCase()}-${index}`];
    return variantNumber ? `${item.name} ${variantNumber}` : item.name;
  };

  const checkoutBillingItems = checkoutRenderItems.slice(0, 19);
  const subtotal = checkoutBillingItems.reduce((total, item) => total + (item.price * (isMockCheckout ? 1 : item.quantity)), 0);
  const shipping = subtotal > 50 ? 0 : 5.95;
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
  const transportParts = splitPriceParts(shipping === 0 ? 5.95 : shipping);
  const ivaParts = splitPriceParts(ivaAmount);
  const totalParts = splitPriceParts(total);
  const visibleCheckoutItems = SHOW_V1_ORDERS_DETAILS ? checkoutRenderItems : [];
  const checkoutLayoutItemCount = visibleCheckoutItems.length;
  const checkoutShortTotalsStartRow = 9;
  const checkoutLongTotalsStartRow = 18;
  const checkoutFirstOrderRow = 4;
  const checkoutFreeRowBeforeTotals = 1;
  const dynamicTotalsStartRow = Math.max(
    checkoutShortTotalsStartRow,
    checkoutFirstOrderRow + checkoutLayoutItemCount + checkoutFreeRowBeforeTotals
  );
  const totalsStartRow = mockMode === 'single'
    ? Math.min(
      checkoutLongTotalsStartRow,
      dynamicTotalsStartRow
    )
    : checkoutLongTotalsStartRow;
  const checkoutIsLongLayout = totalsStartRow === checkoutLongTotalsStartRow;
  const checkoutRowsWithBackground = Math.max(visibleCheckoutItems.length, totalsStartRow - 5);
  const totalsBackgroundRows = 4;
  const totalsBackgroundGutters = checkoutIsLongLayout ? 3 : 21 - totalsStartRow;
  const productNameBlockWidthPx = useMemo(() => {
    if (typeof document === 'undefined') {
      return 124;
    }
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      return 124;
    }
    context.font = '400 12pt "Roboto Condensed", sans-serif';
    return Math.ceil(Math.max(
      context.measureText('PRODUCTES').width,
      ...visibleCheckoutItems.map((item, index) => context.measureText(String(getCheckoutProductDisplayName(item, index) || '')).width)
    ));
  }, [visibleCheckoutItems]);
  const productNameBlockStyle = {
    display: 'block',
    width: `${productNameBlockWidthPx}px`,
    textAlign: 'left',
    whiteSpace: 'nowrap',
    transform: 'translateX(-50px)',
    lineHeight: 1,
  };
  const totalsTopRowOffset = totalsStartRow - 2;
  const totalsTop = `calc(${PAUTA_FIRST_ROW_PERCENT}% + ${PAUTA_FIRST_ROW_EXTRA_PX}px + ${totalsTopRowOffset} * (${PAUTA_OTHER_ROW_PERCENT}% - ${PAUTA_OTHER_ROW_COMP_PX}px) + ${totalsTopRowOffset} * 3px - 0.5 * (${PAUTA_OTHER_ROW_PERCENT}% - ${PAUTA_OTHER_ROW_COMP_PX}px + 3px) - 4px)`;
  const totalsBlockShiftY = 'translateY(-3px)';
  const orderTextShiftY = 'translateY(1px)';
  const checkoutOrderRowGapPx = 3;
  const checkoutOrderCellHeight = checkoutPautaRowHeight
    ? `${Math.max(0, checkoutPautaRowHeight - checkoutOrderRowGapPx)}px`
    : `calc(${PAUTA_OTHER_ROW_PERCENT}% - ${PAUTA_OTHER_ROW_COMP_PX}px - ${checkoutOrderRowGapPx}px)`;
  const checkoutOrderRowPitch = checkoutPautaRowHeight
    ? `${checkoutPautaRowHeight}px`
    : `calc(${PAUTA_OTHER_ROW_PERCENT}% - ${PAUTA_OTHER_ROW_COMP_PX}px)`;
  const checkoutVisibleOrderRows = checkoutLongTotalsStartRow - checkoutFirstOrderRow;
  const checkoutVisibleItems = visibleCheckoutItems.slice(
    checkoutScrollRow,
    checkoutScrollRow + checkoutVisibleOrderRows
  );
  const checkoutMaxScrollRow = Math.max(0, visibleCheckoutItems.length - checkoutVisibleOrderRows);
  const checkoutBlockBackgroundEndRow = paymentDetailsOpen
    ? PAUTA_ROWS + 1
    : totalsStartRow + totalsBackgroundRows;
  const checkoutGlobalBackgroundRows = Math.max(0, checkoutRowsWithBackground - 10);
  const handleCheckoutOrdersWheel = (event) => {
    if (!checkoutIsLongLayout) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    setCheckoutScrollRow((currentRow) => Math.min(
      checkoutMaxScrollRow,
      Math.max(0, currentRow + direction)
    ));
  };

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
      setFormErrors({});
      success('Compra efectuada, moltes gràcies.');
      return;
    }

    setFormErrors({});
    setIsProcessing(true);

    try {
      // Simulem una crida API
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsProcessing(false);

      // Generar ID de comanda
      const orderId = 'GRF-2024-' + Math.random().toString(36).substr(2, 9).toUpperCase();

      // Track purchase
      if (!isMockCheckout) {
        trackPurchase(orderId, checkoutCartItems, total, shipping, 0);
      }

      // Clear cart
      if (!isMockCheckout && onClearCart) {
        onClearCart();
      }

      // Redirigir a pàgina de confirmació
      success('Comanda confirmada');
      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      setIsProcessing(false);
      showError('Error processant la comanda');
    }
  };

  const disablePageContent = false;
  const textOnlyMode = true;
  const hideCheckoutText = false;

  if (disablePageContent) {
    return (
      <div className="relative min-h-screen bg-white">
        <Helmet>
          <title>Checkout | GRAFC</title>
          <meta name="description" content="Completa la teva comanda de manera segura." />
        </Helmet>
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: 'var(--belt2-xL, 0px)',
            top: 'var(--belt2-yT, 0px)',
            width: 'calc(var(--belt2-xR, 100vw) - var(--belt2-xL, 0px))',
            height: 'calc(var(--belt2-yB, 100vh) - var(--belt2-yT, 0px))',
            backgroundImage: 'url(/tmp/CHECKOUT-V1.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            backgroundSize: '100% 100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative pt-0 pb-0 ${textOnlyMode ? 'checkout-text-only' : ''}`} style={{ backgroundColor: '#fff', minHeight: 'calc(var(--belt2-yB, 100vh) - var(--belt2-yT, 0px) + 64px)' }}>
      <Helmet>
        <title>Checkout | GRAFC</title>
        <meta name="description" content="Completa la teva comanda de manera segura." />
      </Helmet>

      <div
        style={{
          position: 'absolute',
          left: `calc(var(--belt2-xL, 0px) + ${CHECKOUT_PAGE_LEFT_OFFSET})`,
          top: CHECKOUT_PAGE_TOP_OFFSET,
          width: 'calc(var(--belt2-xR, 100vw) - var(--belt2-xL, 0px))',
          zIndex: 5,
          pointerEvents: 'auto',
        }}
      >
        <Breadcrumbs items={[{ label: 'Cistell', onClick: openFullWideCartSlide }, { label: 'Checkout' }]} />
      </div>

      {textOnlyMode && (
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
      )}

      <div
        aria-hidden="true"
        style={{
          display: 'none',
          position: 'absolute',
          left: `calc(var(--belt2-xL, 0px) + ${CHECKOUT_PAGE_LEFT_OFFSET})`,
          top: CHECKOUT_PAGE_TOP_OFFSET,
          width: 'calc(var(--belt2-xR, 100vw) - var(--belt2-xL, 0px))',
          height: 'calc(var(--belt2-yB, 100vh) - var(--belt2-yT, 0px))',
          backgroundImage: 'url(/tmp/CHECKOUT-V1.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
          backgroundSize: '100% 100%',
          opacity: 0.4,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: CHECKOUT_PAGE_TOP_OFFSET,
          width: 'calc(var(--belt2-xR, 100vw) - var(--belt2-xL, 0px))',
          height: 'calc(var(--belt2-yB, 100vh) - var(--belt2-yT, 0px))',
          transform: `translateX(calc(-50% + ${CHECKOUT_PAGE_LEFT_OFFSET}))`,
          display: 'grid',
          position: 'absolute',
          gridTemplateColumns: 'calc((100% - 22.5px) / 2 + 11.25px) calc((100% - 22.5px) / 2 - 11.25px)',
          gridTemplateRows: PAUTA_ROWS_TEMPLATE,
          columnGap: '22.5px',
          rowGap: '3px',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 'calc(50% + 11.25px)',
            backgroundColor: '#fff',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
        <div
          ref={checkoutPautaRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'grid',
            gridTemplateColumns: 'calc(50% - 3.75px) repeat(3, minmax(0, 1fr))',
            gridTemplateRows: PAUTA_ROWS_TEMPLATE_2,
            columnGap: '7.5px',
            rowGap: '3px',
            width: 'calc(50% + 11.25px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'none',
              gridTemplateColumns: 'calc(50% - 3.75px) repeat(3, minmax(0, 1fr))',
              gridTemplateRows: PAUTA_ROWS_TEMPLATE_2,
              columnGap: '7.5px',
              rowGap: '3px',
              zIndex: 0,
            }}
          >
            {(pautaEnabled ? Array.from({ length: 33 }) : []).flatMap((_, rowIndex) => {
              const rowNumber = rowIndex + 1;
              if (rowNumber === 5) return [];
              if (rowNumber === 7) return [];
              if (rowNumber === 29) {
                return (
                  <div
                    key="empty-table-bg-cell-29-full"
                    style={{
                      gridColumn: '1 / 5',
                      gridRow: '29 / 30',
                      backgroundColor: 'rgba(0, 166, 81, 0.18)',
                      boxSizing: 'border-box',
                    }}
                  />
                );
              }
              if (rowNumber === 3) {
                return (
                  <div
                    key="empty-table-bg-cell-3-full"
                    style={{
                      gridColumn: '1 / 5',
                      gridRow: '3 / 4',
                      backgroundColor: 'rgba(0, 166, 81, 0.18)',
                      boxSizing: 'border-box',
                    }}
                  />
                );
              }
              return Array.from({ length: 4 }).map((__, colIndex) => (
                rowNumber >= 30 && (colIndex === 1 || colIndex === 2) ? null : (
                  <div
                    key={`empty-table-bg-cell-${rowNumber}-${colIndex + 1}`}
                    style={{
                      gridColumn: rowNumber >= 30 && colIndex === 0 ? '1 / 4' : `${colIndex + 1} / ${colIndex + 2}`,
                      gridRow: rowNumber === 4 ? '4 / 6' : rowNumber === 6 ? '6 / 8' : `${rowNumber} / ${rowNumber + 1}`,
                      backgroundColor: 'rgba(0, 166, 81, 0.18)',
                      boxSizing: 'border-box',
                    }}
                  />
                )
              ));
            })}
          </div>
          <div
            aria-hidden="true"
            style={{
              display: 'none',
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: '#00a651',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          {SHOW_V1_ORDERS_DETAILS && (
            <div
              style={{
                gridColumn: '1 / 5',
                gridRow: '3 / 4',
                width: 'calc(100% - 10.25px)',
                justifySelf: 'center',
                display: 'grid',
                gridTemplateColumns: 'calc(50% - 7.5px) repeat(3, minmax(0, 1fr))',
                columnGap: '15px',
                alignSelf: 'end',
                transform: 'translateY(-12px)',
                zIndex: 5,
              }}
            >
              {[
                ['PRODUCTES', 0],
                ['TALLA', 1],
                ['QUANTITAT', 2],
                ['IMPORT', 3],
              ].map(([label, index]) => (
                <div
                  key={`product-table-heading-fixed-${label}`}
                  style={{
                    gridColumn: `${index + 1} / ${index + 2}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: index === 0 ? 'flex-end' : 'center',
                    transform: label === 'IMPORT' ? 'translateX(3px)' : label === 'QUANTITAT' ? 'translateX(0px)' : label === 'TALLA' ? 'translateX(-8px)' : 'none',
                    color: '#495058',
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: label === 'TOT PLEGAT FA' ? '15pt' : '12pt',
                    fontWeight: 400,
                    lineHeight: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  {index === 0 ? (
                    <span style={productNameBlockStyle}>{label}</span>
                  ) : label}
                </div>
              ))}
            </div>
          )}
          {pautaEnabled && Array.from({ length: PAUTA_ROWS }).map((_, rowIndex) => (
            <div
              key={`checkout-row-debug-number-${rowIndex + 1}`}
              aria-hidden="true"
              style={{
                gridColumn: '1 / 5',
                gridRow: `${rowIndex + 1} / ${rowIndex + 2}`,
                justifySelf: 'center',
                alignSelf: 'center',
                transform: 'translateX(3.75px)',
                color: 'rgba(47, 97, 178, 0.65)',
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: '7pt',
                fontWeight: 400,
                lineHeight: 1,
                pointerEvents: 'none',
                zIndex: 6,
              }}
            >
              {rowIndex + 1}
            </div>
          ))}
          {Array.from({ length: checkoutGlobalBackgroundRows }).map((_, rowIndex) => (
            <div
              key={`product-table-global-row-bg-${rowIndex + 1}`}
              aria-hidden="true"
              style={{
                gridColumn: '1 / 5',
                gridRow: `${checkoutFirstOrderRow + rowIndex} / ${checkoutFirstOrderRow + rowIndex + 1}`,
                width: 'calc(100% - 10.25px)',
                justifySelf: 'center',
                overflow: 'hidden',
                transform: 'translateY(-5.5px)',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: 'url(/placeholders/fons_acordio/fons-una-fila.png)',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center center',
                  backgroundSize: '100% 100%',
                  transform: (rowIndex + 1) % 2 === 0 ? 'none' : 'scaleX(-1)',
                  opacity: 1,
                }}
              />
            </div>
          ))}
          <div
            onWheel={handleCheckoutOrdersWheel}
            style={{
              gridColumn: '1 / 5',
              gridRow: '4 / 18',
              width: 'calc(100% - 10.25px)',
              justifySelf: 'center',
              height: 'calc(100% + 2.5px)',
              position: 'relative',
              overflow: 'hidden',
              overscrollBehavior: 'contain',
              scrollbarWidth: 'none',
              pointerEvents: 'auto',
              zIndex: 2,
              transform: 'translateY(-5.5px)',
            }}
          >
            {checkoutVisibleItems.flatMap((item, rowIndex) => (
              [
                getCheckoutProductDisplayName(item, rowIndex),
                item.size || '—',
                String(item.quantity || 1),
                displayPrice((item.price || 0) * (item.quantity || 1)),
              ].map((label, index) => (
                  <div
                    key={`product-table-row-${rowIndex + 1}-${index}`}
                    style={{
                      gridColumn: `${index + 1} / ${index + 2}`,
                      position: 'absolute',
                      top: `calc(${rowIndex} * ${checkoutOrderRowPitch})`,
                      left: index === 0
                        ? '0'
                        : `calc(50% - 7.5px + ${index - 1} * ((50% - 7.5px) / 3 + 15px))`,
                      width: index === 0 ? 'calc(50% - 7.5px)' : 'calc((50% - 7.5px) / 3)',
                      display: 'flex',
                      height: '100%',
                      minHeight: checkoutOrderCellHeight,
                      maxHeight: checkoutOrderCellHeight,
                      boxSizing: 'border-box',
                      alignItems: 'center',
                      justifyContent: index === 0 ? 'flex-end' : index === 3 ? 'center' : 'center',
                      color: '#4A5057',
                      fontFamily: 'Roboto Condensed, sans-serif',
                      fontSize: '12pt',
                      fontWeight: index === 3 ? 300 : 400,
                      textTransform: 'uppercase',
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        display: index === 3 ? 'flex' : 'inline-block',
                        justifyContent: index === 3 ? 'center' : undefined,
                        transform: index === 2 ? `translateX(4px) ${orderTextShiftY}` : index === 3 ? `translateX(-8px) ${orderTextShiftY}` : orderTextShiftY,
                        width: index === 3 ? '100%' : undefined,
                      }}
                    >
                    {index === 3 ? (
                      <span
                        style={{
                          display: 'inline-grid',
                          gridTemplateColumns: 'auto auto auto',
                          justifyContent: 'center',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span>{label.replace('€', '').split(',')[0]}</span>
                        <span>,</span>
                        <span>{label.replace('€', '').split(',')[1]}€</span>
                      </span>
                    ) : index === 0 ? (
                      <span style={productNameBlockStyle}>{label}</span>
                    ) : label}
                    </span>
                  </div>
                ))
            ))}
          </div>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '50%',
              top: `calc(${PAUTA_FIRST_ROW_PERCENT}% + ${PAUTA_FIRST_ROW_EXTRA_PX}px + 2 * (${PAUTA_OTHER_ROW_PERCENT}% - ${PAUTA_OTHER_ROW_COMP_PX}px) + 2 * 3px - 14px)`,
              gridColumn: '1 / 5',
              width: 'calc(100% - 11.25px)',
              height: '2px',
              backgroundColor: '#DEDFE1',
              transform: 'translateX(-50%)',
              zIndex: 3,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              gridColumn: '1 / 5',
              gridRow: `${totalsStartRow} / ${totalsStartRow + 1}`,
              alignSelf: 'start',
              width: 'calc(100% - 11.25px)',
              justifySelf: 'center',
              height: '2px',
              backgroundColor: '#DEDFE1',
              transform: totalsBlockShiftY,
              zIndex: 3,
            }}
          />
          {SHOW_V1_ORDERS_DETAILS && (
          <div
            aria-hidden="true"
            style={{
              gridColumn: '1 / 5',
              gridRow: `${totalsStartRow} / ${totalsStartRow + totalsBackgroundRows}`,
              width: 'calc(100% - 11.25px)',
              justifySelf: 'center',
              height: '100%',
              overflow: 'hidden',
              transform: totalsBlockShiftY,
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/placeholders/fons_acordio/fons-una-fila.png)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: '100% 100%',
              }}
            />
          </div>
          )}
          {SHOW_V1_ORDERS_DETAILS && [
            ['SUBTOTAL', displayPrice(subtotal), false],
            ['TRANSPORT', displayPrice(5.95), true],
            ['IVA 21%', displayPrice(ivaAmount), false],
            ['TOT PLEGAT FA', displayPrice(total), false],
          ].flatMap(([label, amount, strikeAmount], index) => ([
            <div
              key={`totals-label-${index}`}
              style={{
                gridColumn: '2 / 4',
                gridRow: `${totalsStartRow + index} / ${totalsStartRow + 1 + index}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 'calc((100% - 7.5px) / 2 + 7.5px)',
                transform: `translateX(58px) ${totalsBlockShiftY}`,
                color: '#4A5057',
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: label === 'TOT PLEGAT FA' ? '15pt' : '12pt',
                fontWeight: label === 'TOT PLEGAT FA' ? 400 : 300,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                zIndex: 2,
              }}
            >
              {label}
            </div>,
            <div
              key={`totals-amount-${index}`}
              style={{
                gridColumn: '4 / 5',
                gridRow: `${totalsStartRow + index} / ${totalsStartRow + 1 + index}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                color: '#4A5057',
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: label === 'TOT PLEGAT FA' ? '15pt' : '12pt',
                fontWeight: label === 'TOT PLEGAT FA' ? 400 : 300,
                textTransform: 'uppercase',
                textDecoration: strikeAmount ? 'line-through' : 'none',
                transform: `${label === 'TOT PLEGAT FA' ? 'translateX(13px)' : 'translateX(15px)'} ${totalsBlockShiftY}`,
                zIndex: 2,
              }}
            >
              <span
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  width: '54px',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span style={{ textAlign: 'right' }}>{amount.replace('€', '').split(',')[0]}</span>
                <span>,</span>
                <span>{amount.replace('€', '').split(',')[1]}€</span>
              </span>
            </div>,
          ]))}
        </div>
        {(pautaEnabled ? Array.from({ length: PAUTA_ROWS * 2 }) : []).map((_, idx) => (
          <div
            key={`pauta-grid-${idx}`}
            style={{
              border: '1px solid rgba(31, 124, 255, 0.35)',
              backgroundColor: 'rgba(31, 124, 255, 0.06)',
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>

      <div
        className="absolute z-[3]"
        style={{
          left: '50%',
          top: CHECKOUT_PAGE_TOP_OFFSET,
          width: 'calc(var(--belt2-xR, 100vw) - var(--belt2-xL, 0px))',
          transform: `translateX(calc(-50% + ${CHECKOUT_PAGE_LEFT_OFFSET}))`,
          height: 'calc(var(--belt2-yB, 100vh) - var(--belt2-yT, 0px))',
          display: hideCheckoutText ? 'none' : 'block',
          pointerEvents: 'none',
        }}
      >
        <div id="stripe-guide-checkout-layout-top-anchor" style={{ height: 0 }} />
        <div
          className="grid h-full"
          style={{
            gridTemplateColumns: 'calc((100% - 22.5px) / 2 + 11.25px) calc((100% - 22.5px) / 2 - 11.25px)',
            gridTemplateRows: PAUTA_ROWS_TEMPLATE,
            columnGap: '22.5px',
            rowGap: '3px',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              gridColumn: '2 / 3',
              gridRow: `1 / ${checkoutBlockBackgroundEndRow}`,
              overflow: 'hidden',
              zIndex: -1,
            }}
          >
            <img
              src="/placeholders/fons_acordio/una-columna.png"
              alt=""
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'fill',
              }}
            />
          </div>
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
              <span className="text-right uppercase">Talla</span>
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

          <div style={{ gridColumn: '2 / 3', gridRow: '3 / 22', display: 'flex', justifyContent: 'center', color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif', pointerEvents: 'auto' }}>
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

              <div style={{ marginTop: '14px', display: 'grid', rowGap: '8px' }}>
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
                      <div style={{ border: '1px solid #D8DDE3', borderRadius: '4px', overflow: 'hidden', background: '#FFFFFF' }}>
                        <input type="text" name="cardNumber" placeholder="4242 4242 4242 4242" value={formData.cardNumber || ''} onChange={handleChange} maxLength={16} style={{ width: '100%', height: '31px', border: 'none', borderBottom: '1px solid #E6E8EC', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', boxSizing: 'border-box' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <input type="text" name="expiryDate" placeholder="MM / YY" value={formData.expiryDate || ''} onChange={handleChange} maxLength={5} style={{ height: '31px', border: 'none', borderRight: '1px solid #E6E8EC', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', boxSizing: 'border-box' }} />
                          <input type="text" name="cvv" placeholder="CVC" value={formData.cvv || ''} onChange={handleChange} maxLength={4} style={{ height: '31px', border: 'none', padding: '0 10px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '10.5pt', color: '#4A5057', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
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
                          <option value="">Espanya</option>
                          <option value="Espanya">Espanya</option>
                          <option value="França">França</option>
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
          <input type="hidden" name="stripeConnectionEnabled" value={String(stripeConnectionEnabled)} />
        </div>
        <div id="stripe-guide-checkout-layout-bottom-anchor" style={{ height: 0 }} />
      </div>
    </div>
  );
};

export default CheckoutPage;
