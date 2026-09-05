import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Check } from 'lucide-react';
import { validateEmail, validateRequired, validatePostalCode, validateForm } from '@/utils/validation';
import { trackBeginCheckout, trackPurchase } from '@/utils/analytics';
import { useShippingCosts } from '@/hooks/useShippingCosts';
import { createMockOrder, MOCK_CLIENT } from '@/lib/mockOrderStore';
import { useAuth } from '@/contexts/AuthContext';
import { drawingStripePath } from '@/lib/drawingPaths';
import { getMockupPath, INK_BLACK, INK_WHITE, COLLECTIONS } from '@/lib/mockupPaths';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import { getStripe, createPaymentIntent } from '@/api/stripe';

function CheckoutContentInner({ cartItems, setCartItems, onCloseMegaSlide, isPortraitTablet = false }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const [isLandscapeTablet, setIsLandscapeTablet] = useState(
    typeof window !== 'undefined'
      && window.innerWidth >= 768
      && window.innerWidth <= 1366
      && window.innerWidth >= window.innerHeight
  );
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsLandscapeTablet(w >= 768 && w <= 1366 && w >= h);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // La recepta estreta (camps de 28px, lletra 9pt) ja no l'usa cap variant: el
  // vertical també usa les mides originals de creació (les d'escriptori).
  // Per tornar-hi, posar `= isPortraitTablet`.
  const isNarrowForm = false;

  // Les dues tauletes comparteixen la recepta (mides d'escriptori, bloc centrat
  // en Y i títol PAGAMENT clavat a la franja de dalt), però cada variant té els
  // seus números propis, perquè un retoc en una no mogui l'altra.
  const isTabletRecipe = isLandscapeTablet || isPortraitTablet;

  // La graella manté 4 pistes i la 4a queda buida a la dreta, així que les tres
  // columnes estan espremeutes cap a l'esquerra. Per centrar-les sense tocar-ne
  // l'amplada ni els junts, es desplaça el conjunt mig buit: (marc + 24) / 8.
  const SHIFT_X = 'calc((var(--hg-mega-w, min(1350px, calc(100vw - 32px))) + 24px) / 8)';
  const shiftColsX = isLandscapeTablet ? `translateX(${SHIFT_X})` : undefined;

  // El títol penja del damunt de la franja, no del bloc centrat: l'altura de la
  // primera filera de producte del cistell és 2*23,867 - 2,037 - 2 = 43,70px,
  // així que el seu centre és a 21,85px. TITLE_Y és l'únic número a retocar.
  const TITLE_Y = 21.85;

  // A l'horitzontal el formulari d'enviament s'obre amb gaps: FIELD_GAP és
  // l'únic número a retocar (7 junts entre els 8 blocs de camps).
  // 7px = la separació que realment dona l'escriptori, on els 8 blocs es
  // reparteixen amb space-between dins un cos de 322px: (322 - 8*34) / 7 = 7,16.
  const FIELD_GAP = 7;

  // Alçada real del bloc de camps de l'enviament: 8 camps de 34px + 7 junts.
  // Derivada, perquè si retoca FIELD_GAP l'alineament de baix la segueixi.
  const FIELD_STRIDE = 34 + FIELD_GAP;                 // 41px entre caps de camp
  const FORMS_H = 8 * 34 + 7 * FIELD_GAP;              // 321px
  // El setè bloc (Email) comença a 6·41 = 246px del cap de la columna.
  const FIELD_EMAIL_TOP = 6 * FIELD_STRIDE;
  // Termes: 5px per sota de la línia de l'Email (retoc visual seu).
  const TERMS_TOP = FIELD_EMAIL_TOP + 5;

  // Aire entre la banda dels títols de columna (fa 29px) i la fila de contingut.
  // Únic número a retocar; no mou l'amplada de les columnes ni els seus junts.
  const TITLE_GAP = 10;

  // "Necessites factura?" pujat 11px sobre els 14px originals de creació (6 + 5).
  const INVOICE_TOP = 14 - 11;
  // "Nom d'empresa" + CIF: aire real entre la ratlla del xec i la seva capsa.
  // (Els 8px originals de la graella, menys 7 de pujada.)
  const INVOICE_FIELDS_GAP = 1;

  // Pujada del conjunt (banda dels títols + fila de contingut) sobre el centre.
  // El bloc es centra amb justify-content:center dins l'arrel, així que es
  // desplalla afegint padding-bottom a l'arrel: puja la meitat del valor.
  // El títol PAGAMENT no es mou perquè penja del cap de la franja (TITLE_Y).
  const CONJUNT_LIFT = 50;

  // ===== VERTICAL (2 columnes) =====
  // Números propis, als mateixos valors inicials que l'horitzontal perquè és la
  // mateixa recepta; d'aquí en endavant cada variant se'n retoca per separado.
  const P_FIELD_GAP = 7;
  const P_TITLE_GAP = 10;
  const P_TITLE_Y = 21.85;
  // El vertical encara no el pujem: es queda exactament al centre.
  const P_CONJUNT_LIFT = 0;
  // Aire entre la filera de dalt (comanda + enviament) i la de baix
  // (dades de pagament + acceptació i botó).
  const P_ROW_GAP = 14;
  // ===== VERTICAL: amplada de columna =====
  // Pista = la mateixa que dona l'horitzontal a 1024x768: (992 - 3*24) / 4 = 230.
  // Únic número a retocar: l'amplada del grup i el seu desplaçament en deriven.
  // (L'horitzontal fa 269px a 1180 i 315,5px a 1366; 230px és el valor del seu
  // 1024x768, que és la tauleta de referència.)
  const P_COL_W = 230;
  const P_COL_GAP = 24;                       // els mateixos junts que a l'horitzontal
  const P_GROUP_PX = 2 * P_COL_W + P_COL_GAP; // 484px
  // La capsa del vertical fa min(1350, 100vh-32) = 992px dins una pantalla de
  // 768px i la capa interior s'escala a 0,94: el grup de 484px (abans en feia
  // 736, l'amplada del cinturó) es veu reduït a 455px en pantalla, o sigui que
  // hi cap de sobres i queden 156,5px d'aire a cada banda.
  const P_GROUP_W = `${P_GROUP_PX}px`;
  // I cal desplaçar-lo perquè quedi centrat a la pantalla: l'escat 0,94 deixa el
  // cap d'esquerra de la capa a (1 - 0,94)/2 * 992 = 0,03 * 992 = 29,76px de la
  // vora, i el grup es veu reduït per 0,94 (d'aquí el 0,94 i el 0,47 de la
  // fórmula). P_SHIFT_ADJ és el retoc manual en px, positiu cap a la dreta
  // (el desplaçament surt 134,85px a 768x1024; abans, 8,85px).
  const P_SHIFT_ADJ = 0;
  const P_SHIFT_X = `calc((50vw - 0.47 * ${P_GROUP_PX}px - 0.03 * min(1350px, 100vh - 32px)) / 0.94 + ${P_SHIFT_ADJ}px)`;
  // Cap de l'acceptació de termes, mesurat des del cap de la seva cel·la. L'esquerra
  // no cal tocar-la: termes i botó són a la mateixa pista que la columna
  // d'enviament. El nivell, en canvi, ve d'aquí: 88 = títol "Dades de pagament"
  // (16px * 1,5) + 10 de joc + vora 1 + capçalera "Targeta" (10 + 22 + 10) + seva
  // vora 1 + padding 10 = el cap de la capsa del número de targeta. Aquest número
  // fa d'àncora vertical també per al botó (vegeu P_BUTTON_TOP).
  const P_TERMS_TOP = 88;
  // "Necessites factura?" també va a la cel·la dreta (pista del Telèfon) i penja
  // ABSOLUT, com el botó: així no pot empènyer els termes cap avall. 0 el posava a
  // la mateixa línia que el retol "Dades de pagament"; demanar-lo de pujar 10px el
  // deixa a -10, o sigui DINS el joc de 14px (P_ROW_GAP) que separa les dues
  // fileres: només li queden 4px fins als camps d'enviament de sobre.
  // Positiu = baixa la factura. Únic número a retocar per al seu nivell.
  const P_INVOICE_TOP = -10;
  // Alçada d'UNA capsa de camp de targeta (número, caducitat i CVC en fan la
  // mateixa): vores 1+1 + padding 10+10 + l'interior que posa l'iframe de Stripe.
  // L'interior no ve del nostre codi, així que el 42 d'abans era ESTIMAT i el botó
  // sortia 3,2px massa baix i 3px massa alt. Ara són 39 MESURATS a la captura
  // (capsa real = 36,45px en pantalla / 0,94 = 38,78px de capsa). Si Stripe canvia
  // l'alçada del seu iframe, mou NOMÉS aquest número: cap i alçada del botó van
  // darrere, i segueixen quadrant amb el CVC.
  const P_CARD_FIELD_H = 39;
  // Cap del CVC = cap del número + la capsa del número + els 8px de joc interior
  // de la capsa de targeta (el `rowGap` de dins seu).
  // P_BUTTON_TOP_ADJ separa el NIVELL de l'ALÇADA: serveix per afinar el cap del
  // botó sense tocar-li l'alçada (positiu = baixa el botó).
  const P_BUTTON_TOP_ADJ = 0;
  const P_BUTTON_TOP = P_TERMS_TOP + P_CARD_FIELD_H + 8 + P_BUTTON_TOP_ADJ;
  const P_BUTTON_H = P_CARD_FIELD_H;
  // Desplaçament horitzontal manual del botó, en px de la capsa (positiu cap a la
  // dreta). Acumula 30 + 30 = 60px a l'esquerra i ara 60px a la dreta, o sigui 0:
  // el botó torna a la seva pista, exactament sota els termes i amplada de Telèfon.
  // En pantalla tot es veu reduït per l'escat 0,94: 60px de capsa = 56,4px reals.
  const P_BUTTON_SHIFT_X = 0;

  // Valors derivats segons la variant que es renderitza: l'horitzontal dona
  // exactament els mateixos números que donava abans, l'escriptori res.
  const fieldGap = isLandscapeTablet ? FIELD_GAP : (isPortraitTablet ? P_FIELD_GAP : undefined);
  const titleGap = isLandscapeTablet ? TITLE_GAP : (isPortraitTablet ? P_TITLE_GAP : undefined);
  const titleY = isLandscapeTablet ? `${TITLE_Y}px` : (isPortraitTablet ? `${P_TITLE_Y}px` : undefined);
  const liftPad = isLandscapeTablet
    ? `${CONJUNT_LIFT * 2}px`
    : (isPortraitTablet ? `${P_CONJUNT_LIFT * 2}px` : undefined);
  const groupW = isPortraitTablet ? P_GROUP_W : undefined;
  const groupX = isPortraitTablet ? P_SHIFT_X : undefined;

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
  const totalArticles = preu - descompte;
  const totalQuantity = activeItems.reduce((acc, it) => acc + (it.qty || 1), 0);
  const { getCost, zoneInfo } = useShippingCosts(formData.country || 'ES');
  const shipping = getCost(formData.country || 'ES', totalQuantity, totalArticles);
  const totalFinal = totalArticles + shipping;
  const baseImponible = totalFinal / 1.21;
  const ivaAmount = totalFinal - baseImponible;
  const total = totalFinal;

  const fmt = (n) => n.toFixed(2).replace('.', ',') + '€';
  const splitPrice = (n) => {
    const [intPart, decPart = '00'] = n.toFixed(2).split('.');
    return { intPart, decPart };
  };
  const preuParts = splitPrice(preu);
  const descompteParts = splitPrice(descompte);
  const ivaParts = splitPrice(ivaAmount);
  const totalParts = splitPrice(totalFinal);

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

      if (import.meta.env.DEV) {
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
          subtotal: totalArticles,
          shipping,
          iva: ivaAmount,
          total: totalFinal,
          formData,
        });
        orderNumber = mockOrder.order_number;
      } else {
        if (!stripe || !elements) {
          setPaymentError('Stripe no s\'ha carregat. Torna-ho a provar.');
          setIsProcessing(false);
          return;
        }

        const piResponse = await createPaymentIntent(
          activeItems.map((item, idx) => ({
            gelatoVariantId: item.gelatoVariantId || null,
            quantity: item.qty || 1,
            designFiles: item.designFiles || [],
            designUrl: item.designUrl || null,
            productName: item.title || item.name || 'Producte',
            size: item.size || 'L',
          })),
          formData.country || 'es_peninsula',
          'eur',
          { email: formData.email, userId: user?.id || undefined }
        );

        const { clientSecret, paymentIntentId, orderNumber: serverOrderNumber } = piResponse;

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

        orderNumber = serverOrderNumber || paymentIntentId;
      }

      trackPurchase(orderNumber, activeItems, totalFinal, shipping, 0);
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
    height: isNarrowForm ? '28px' : '34px',
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

  const TSHIRT_BASE = '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_';
  const TSHIRT_SUFFIX = '_gpr-4-0_front.png';
  const tshirtSrc = (color) => `${TSHIRT_BASE}${color}${TSHIRT_SUFFIX}`;
  const DARK_COLORS = new Set(['royal','purple','navy','red','irish-green','military-green','forest-green','black']);
  const FINISH_TO_INK = { BLANC: INK_WHITE, COLOR: 'multi', NEGRE: INK_BLACK };
  const resolveInk = (collectionSlug, shirtColor, finish) => {
    const inks = COLLECTIONS[collectionSlug]?.inks ?? [];
    const effFinish = finish && ['BLANC','COLOR','NEGRE'].includes(finish) ? finish : null;
    let ink = effFinish ? FINISH_TO_INK[effFinish] : (DARK_COLORS.has(shirtColor) ? INK_WHITE : INK_BLACK);
    if (ink === INK_WHITE && shirtColor === 'white') ink = INK_BLACK;
    else if (ink === INK_BLACK && shirtColor === 'black') ink = INK_WHITE;
    if (!inks.includes(ink)) ink = inks[0];
    return ink;
  };
  const mockupSrc = (item) => {
    if (!item.collectionSlug || !item.productRoute) return null;
    const design = item.productRoute;
    const ink = resolveInk(item.collectionSlug, item.color, item.finish);
    return getMockupPath({ collection: item.collectionSlug, design, shirtColor: item.color, ink });
  };

  // L'acceptació de termes i el botó de confirmar, definits aquí perquè les dues
  // tauletes els puguin col·locar en llocs diferents sense duplicar-ne el dibuix:
  // a l'horitzontal van dins la columna de la targeta, al vertical formen la
  // cel·la dreta, sota les dades d'enviament.
  const termsBlock = (
    <div style={isLandscapeTablet
      ? { position:'absolute', top:`${TERMS_TOP}px`, left:0, right:0 }
      : (isPortraitTablet
          ? { marginTop: `${P_TERMS_TOP}px` }
          : { marginTop: isNarrowForm ? '4px' : '14px' })}>
      <label style={{ display:'flex', alignItems:'flex-start', gap:'8px', fontSize:'9.5pt', lineHeight:1.25, fontWeight:300 }}>
        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} style={{ marginTop:'1px' }} />
        <span>Accepto els <a href="/terms" style={{ color:'#4A5057', textDecoration:'underline' }}>Termes del Servei</a>, la <a href="/privacy" style={{ color:'#4A5057', textDecoration:'underline' }}>Política de Privacitat</a> i la <a href="/shipping" style={{ color:'#4A5057', textDecoration:'underline' }}>Política d'enviaments</a>.</span>
      </label>
    </div>
  );

  const buttonBlock = (
    <div style={isPortraitTablet
      ? { position:'absolute', top:`${P_BUTTON_TOP}px`, left:`${P_BUTTON_SHIFT_X}px`, width:'100%' }
      : { flexShrink:0, marginTop:'auto', position: isLandscapeTablet ? 'relative' : undefined }}>
      <button onClick={handleSubmit} disabled={isProcessing} style={{ width:'100%', height: isPortraitTablet ? `${P_BUTTON_H}px` : (isNarrowForm ? '28px' : '34px'), border:'none', borderRadius:'4px', backgroundColor: isProcessing?'#8FE8B9':'#00D66F', color:'#063B21', fontFamily:'Roboto Condensed, sans-serif', fontSize:'10.5pt', fontWeight:600, boxShadow:'0 1px 2px rgba(16,24,40,0.08)', cursor: isProcessing?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
        {isProcessing ? 'Processant…' : (<><Check size={14} strokeWidth={2} /> Confirma la compra</>)}
      </button>
      <div style={{ position: isLandscapeTablet ? 'absolute' : undefined, top: isLandscapeTablet ? '100%' : undefined, left: 0, right: 0 }}>
        {paymentError && <div style={{ marginTop:'10px', color:'#D04B4B', fontSize:'10pt', textAlign:'center' }}>{paymentError}</div>}
        <div style={{ marginTop:'10px', textAlign:'center', color:'#98A2B4', fontSize:'8.5pt', fontWeight:300 }}>Powered by Stripe&nbsp;&nbsp;|&nbsp;&nbsp;Termes&nbsp;&nbsp;Privacitat</div>
      </div>
    </div>
  );

  // La factura opcional (retol + els dos camps que hi apareixen en marcar-la) surt
  // d'aquí pels mateixos motius que `termsBlock`: l'horitzontal la deixa dins la
  // columna de la targeta i el vertical la penja a la cel·la dreta, a la pista del
  // Telèfon i al nivell del retol "Dades de pagament" (P_INVOICE_TOP).
  const invoiceBlock = (
    <div style={isPortraitTablet
      ? { position:'absolute', top:`${P_INVOICE_TOP}px`, left:0, width:'100%', display:'grid', rowGap:'8px' }
      : { display:'grid', rowGap: isNarrowForm ? '2px' : (isLandscapeTablet ? `${INVOICE_FIELDS_GAP}px` : '8px'), marginTop: isNarrowForm ? '4px' : (isLandscapeTablet ? `${INVOICE_TOP}px` : '14px') }}>
      <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize: isNarrowForm ? '9pt' : '10.5pt', fontWeight:300 }}>
        <input type="checkbox" checked={needsInvoice} onChange={(e) => setNeedsInvoice(e.target.checked)} />
        <span>Necessites factura?</span>
      </label>
      {needsInvoice && (
        <div style={{ border:'1px solid #D8DDE3', borderRadius:'4px', overflow:'hidden', background:'#FFFFFF' }}>
          <input type="text" name="company" placeholder="Nom de l'empresa" value={formData.company} onChange={handleChange} style={{ width:'100%', height: isNarrowForm ? '26px' : '31px', border:'none', borderBottom:'1px solid #E6E8EC', padding:'0 10px', fontFamily:'Roboto Condensed, sans-serif', fontSize: isNarrowForm ? '9pt' : '10.5pt', color:'#4A5057', outline:'none', boxSizing:'border-box' }} />
          <input type="text" name="taxId" placeholder="CIF (ex: ESA12345672)" value={formData.taxId} onChange={handleChange} style={{ width:'100%', height: isNarrowForm ? '26px' : '31px', border:'none', padding:'0 10px', fontFamily:'Roboto Condensed, sans-serif', fontSize: isNarrowForm ? '9pt' : '10.5pt', color:'#4A5057', outline:'none', boxSizing:'border-box' }} />
        </div>
      )}
    </div>
  );

  return (
    <div style={{ width:'100%', height:'100%', position: isTabletRecipe ? 'relative' : undefined, display:'flex', flexDirection:'column', justifyContent: isTabletRecipe ? 'center' : undefined, fontFamily:'Roboto Condensed, sans-serif', color:'#4A5057', overflow:'visible', padding:0, paddingBottom: liftPad, margin:0 }}>
      {isTabletRecipe && (
        <span style={{ ...HEAD, fontSize:'18pt', fontWeight:600, position:'absolute', top:titleY, left: isPortraitTablet ? P_SHIFT_X : SHIFT_X, transform:'translateY(-50%)' }}>PAGAMENT</span>
      )}
      <div style={{ display:'grid', gridTemplateColumns: isPortraitTablet ? '1fr 1fr' : '1fr 1fr 1fr 1fr', columnGap:'24px', padding:0, width: groupW, marginLeft: groupX, marginBottom: isTabletRecipe ? `${titleGap}px` : undefined, flexShrink:0, minHeight: isTabletRecipe ? '29px' : undefined, alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent: isTabletRecipe ? 'flex-start' : 'space-between', transform: shiftColsX }}>
          {!isTabletRecipe && <span style={{ ...HEAD, fontSize:'18pt', fontWeight:600 }}>PAGAMENT</span>}
          <span style={{ fontSize:'12pt', fontWeight:500 }}>La teva comanda</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent: isTabletRecipe ? 'flex-start' : 'flex-end', transform: shiftColsX }}>
          <span style={{ fontSize:'12pt', fontWeight:500 }}>Dades d'enviament</span>
        </div>
        {!isPortraitTablet && (
          <div style={{ display:'flex', alignItems:'center', justifyContent: isTabletRecipe ? 'flex-start' : 'flex-end', transform: shiftColsX }}>
            <span style={{ fontSize:'12pt', fontWeight:500 }}>Dades de pagament</span>
          </div>
        )}
      </div>
      <div style={{ display:'grid', gridTemplateColumns: isPortraitTablet ? '1fr 1fr' : '1fr 1fr 1fr 1fr', columnGap:'24px', rowGap: isPortraitTablet ? `${P_ROW_GAP}px` : undefined, width: groupW, marginLeft: groupX, flex: isTabletRecipe ? '0 1 auto' : '1 1 auto', minHeight:0, transform: shiftColsX }}>
        {/* COL 1: Cistell + Totals */}
        <div style={{ display:'flex', flexDirection:'column', minHeight:0 }}>
          <div style={{ flex:'1 1 auto', overflowY:'auto', minHeight:0 }}>
            {activeItems.map((item, idx) => {
              const ip = parseFloat(String(item.price).replace('€','').replace(/\s/g,'').replace(',','.'))||0;
              const q = item.qty||1;
              return (
                <div key={`c-${item.id}-${idx}`} style={{ display:'grid', gridTemplateColumns:'48px 1fr auto', columnGap:'10px', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #EEF0F3' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'4px', background:'#F3F4F6', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {(() => {
                      const mockup = mockupSrc(item);
                      return mockup
                        ? <img src={mockup} alt="" loading="lazy" decoding="async" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                        : <img src={tshirtSrc(item.color)} alt="" loading="lazy" decoding="async" style={{ width:'85%', height:'85%', objectFit:'contain' }} />;
                    })()}
                  </div>
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
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10pt', color:'#667085', padding: isNarrowForm ? 0 : '2px 0', lineHeight: isNarrowForm ? 1.15 : undefined }}><span>Subtotal</span><span style={{ fontVariantNumeric:'tabular-nums' }}>{totalArticles.toFixed(2).replace('.',',')}€</span></div>
            {discountEnabled && <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10pt', color:'#667085', padding: isNarrowForm ? 0 : '2px 0', lineHeight: isNarrowForm ? 1.15 : undefined }}><span>Descompte (-{offersConfig.discountRate}%)</span><span style={{ fontVariantNumeric:'tabular-nums' }}>-{descompte.toFixed(2).replace('.',',')}€</span></div>}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10pt', color:'#667085', padding: isNarrowForm ? 0 : '2px 0', lineHeight: isNarrowForm ? 1.15 : undefined }}><span>Transport</span><span style={{ fontVariantNumeric:'tabular-nums' }}>{shipping === 0 ? 'Gratuït' : `${shipping.toFixed(2).replace('.',',')}€`}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10pt', color:'#667085', padding: isNarrowForm ? 0 : '2px 0', lineHeight: isNarrowForm ? 1.15 : undefined }}><span>IVA 21% (inclòs)</span><span style={{ fontVariantNumeric:'tabular-nums' }}>{ivaAmount.toFixed(2).replace('.',',')}€</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13pt', fontWeight:500, padding:'8px 0 0', borderTop:'1px solid #E6E8EC', marginTop:'4px' }}><span>Total</span><span style={{ fontVariantNumeric:'tabular-nums' }}>{totalFinal.toFixed(2).replace('.',',')}€</span></div>
          </div>
        </div>
        {/* COL 2: Dades d'enviament */}
        <div style={{ display:'flex', flexDirection:'column', minHeight:0, overflow:'visible', justifyContent: isTabletRecipe ? 'flex-start' : 'space-between', gap: fieldGap }}>
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

        {/* COL 3: Pagament + Factura. Al vertical és la cel·la esquerra de la
            segona filera (sota la comanda); termes + botó hi van al costat, en
            una cel·la pròpia, sota les dades d'enviament. */}
        <div style={{ display:'flex', flexDirection:'column', minHeight:0, overflow:'visible', position: isLandscapeTablet ? 'relative' : undefined, height: isLandscapeTablet ? `${FORMS_H}px` : undefined, gap: isNarrowForm ? '1px' : undefined }}>
          <div style={{ display:'flex', flexDirection:'column', gap: isNarrowForm ? '1px' : undefined }}>
            {/* Al vertical només hi ha dues columnes de títols, així que aquest
                penja del seu bloc, no de la banda de dalt. */}
            {isPortraitTablet && <span style={{ fontSize:'12pt', fontWeight:500, marginBottom:`${P_TITLE_GAP}px` }}>Dades de pagament</span>}
            {/* Pagament */}
            <div style={{ display:'grid', rowGap: isNarrowForm ? '2px' : '8px' }}>
              <div style={{ border:'1px solid #E6E8EC', borderRadius:'6px', background:'#FFFFFF', overflow:'hidden' }}>
                <div style={{ padding: isNarrowForm ? '6px 10px' : '10px 12px', borderBottom:'1px solid #EEF0F3', display:'flex', alignItems:'center', gap:'8px', fontSize: isNarrowForm ? '9pt' : '11pt', fontWeight:500, color:'#4A5057' }}>
                  <span style={{ width:'13px', height:'10px', border:'1px solid #4A5057', borderRadius:'2px', display:'inline-block' }} />
                  <span>Targeta</span>
                </div>
                <div style={{ padding: isNarrowForm ? '6px 10px' : '10px 12px', display:'grid', rowGap: isNarrowForm ? '2px' : '8px' }}>
                  <div style={{ border:'1px solid #D8DDE3', borderRadius:'4px', overflow:'hidden', background:'#FFFFFF', padding: isNarrowForm ? '6px 10px' : '10px 12px' }}>
                    <CardNumberElement options={{ style: { base: { color:'#4A5057', fontFamily:'Roboto Condensed, sans-serif', fontSize: isNarrowForm ? '11px' : '14px', '::placeholder': { color:'#98A2B4' } }, invalid: { color:'#ef4444' } } }} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', columnGap:'8px' }}>
                    <div style={{ border:'1px solid #D8DDE3', borderRadius:'4px', overflow:'hidden', background:'#FFFFFF', padding: isNarrowForm ? '6px 10px' : '10px 12px' }}>
                      <CardExpiryElement options={{ style: { base: { color:'#4A5057', fontFamily:'Roboto Condensed, sans-serif', fontSize: isNarrowForm ? '11px' : '14px', '::placeholder': { color:'#98A2B4' } }, invalid: { color:'#ef4444' } } }} />
                    </div>
                    <div style={{ border:'1px solid #D8DDE3', borderRadius:'4px', overflow:'hidden', background:'#FFFFFF', padding: isNarrowForm ? '6px 10px' : '10px 12px' }}>
                      <CardCvcElement options={{ style: { base: { color:'#4A5057', fontFamily:'Roboto Condensed, sans-serif', fontSize: isNarrowForm ? '11px' : '14px', '::placeholder': { color:'#98A2B4' } }, invalid: { color:'#ef4444' } } }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Factura opcional: al vertical marxa a la cel·la dreta (vegeu
                `invoiceBlock`), aquí es queda dins la columna de la targeta. */}
            {!isPortraitTablet && invoiceBlock}
          </div>
          {/* Termes + botó: a l'horitzontal van dins la mateixa columna que la
              targeta (termes penjats a TERMS_TOP, botó clavat al final). */}
          {!isPortraitTablet && (<>{termsBlock}{buttonBlock}</>)}
        </div>
        {/* Al vertical, en canvi, formen una cel·la pròpia de la graella. Seu a
            la PISTA 2, la mateixa on seu la columna d'enviament, així que el seu
            cap d'esquerra i la seva amplada coincideixen amb les del camp del
            Telèfon per construcció: no depèn de cap suma de pistes i junts. A
            dins hi ha tres peces i tres nivells independents: la factura penjada
            a P_INVOICE_TOP (el nivell del retol "Dades de pagament"), els termes
            en flux a P_TERMS_TOP i el botó penjat a P_BUTTON_TOP. Com que la
            factura i el botó penjen absoluts, no mouen els termes en absolut. */}
        {isPortraitTablet && (
          <div style={{ display:'flex', flexDirection:'column', minHeight:0, position:'relative' }}>
            {invoiceBlock}
            {termsBlock}
            {buttonBlock}
          </div>
        )}
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
