import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Check } from 'lucide-react';
import { validateEmail, validateRequired, validatePostalCode, validateForm } from '@/utils/validation';
import { trackBeginCheckout, trackPurchase } from '@/utils/analytics';
import { useShippingCosts, normalizeCountry } from '@/hooks/useShippingCosts';
import { createMockOrder } from '@/lib/mockOrderStore';
import { useAuth } from '@/contexts/AuthContext';
import { drawingStripePath } from '@/lib/drawingPaths';
import { getMockupPath, INK_BLACK, INK_WHITE, COLLECTIONS } from '@/lib/mockupPaths';
import { useOffersConfig } from '@/hooks/useOffersConfig';
import { getStripe, createPaymentIntent } from '@/api/stripe';
import { PDP_REGISTRY_BY_ROUTE } from '@/data/pdpRegistry';

function CheckoutContentInner({ cartItems, setCartItems, onCloseMegaSlide, isPortraitTablet = false }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;
  const offersConfig = useOffersConfig();
  const discountEnabled = offersConfig.discountEnabled;
  const discountRate = offersConfig.discountRate / 100;
  // Els camps comencen BUITS, tambe en desenvolupament: abans s'omplien amb
  // un client d'exemple i donava la sensacio que el formulari ja venia ple.
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    address2: '',
    city: '',
    postalCode: '',
    country: 'Espanya',
    phone: '',
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

  // Telèfon: menys de 768 px d'amplada. Necessita una disposició pròpia (una
  // sola columna): les tres columnes de la recepta d'escriptori no hi caben i
  // el formulari sortia tallat, amb el botó de pagar fora de la pantalla.
  const [isPhone, setIsPhone] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsLandscapeTablet(w >= 768 && w <= 1366 && w >= h);
      setIsPhone(w < 768);
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
  // Ho fan l'horitzontal i, des del 2026-09-05, també l'escriptori; el vertical
  // té el seu propi desplaçament (P_SHIFT_X). Va com a `transform` a la banda de
  // títols i a la graella del cos, o sigui que títols i columnes viatgen junts i
  // l'alineament en Y que ja està calibrat no en depèn.
  const SHIFT_X = '0px';
  const shiftColsX = undefined;

  // El títol penja del damunt de la franja, no del bloc centrat: l'altura de la
  // primera filera de producte del cistell és 2*23,867 - 2,037 - 2 = 43,70px,
  // així que el seu centre és a 21,85px. TITLE_Y és l'únic número a retocar.
  const TITLE_Y = 21.85;
  // A l'apaisada el titol queda una mica just i semblava tallat: hi baixa 2px.
  const L_TITLE_Y = TITLE_Y + 2;

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
  const TERMS_TOP = FIELD_EMAIL_TOP;

  // Aire entre la banda dels títols de columna (fa 29px) i la fila de contingut.
  // Únic número a retocar; no mou l'amplada de les columnes ni els seus junts.
  const TITLE_GAP = 10;

  // "Necessites factura?" pujat 11px sobre els 14px originals de creació (6 + 5).
  const INVOICE_TOP = 0;
  // "Nom d'empresa" + CIF: aire real entre la ratlla del xec i la seva capsa.
  // (Els 8px originals de la graella, menys 7 de pujada.)
  const INVOICE_FIELDS_GAP = 8;

  // Pujada del conjunt (banda dels títols + fila de contingut) sobre el centre.
  // El bloc es centra amb justify-content:center dins l'arrel, així que es
  // desplalla afegint padding-bottom a l'arrel: puja la meitat del valor.
  // El títol PAGAMENT no es mou perquè penja del cap de la franja (TITLE_Y).
  const CONJUNT_LIFT = 0;

  // ===== VERTICAL (2 columnes) =====
  // Números propis, als mateixos valors inicials que l'horitzontal perquè és la
  // mateixa recepta; d'aquí en endavant cada variant se'n retoca per separado.
  const P_FIELD_GAP = 5;
  const P_TITLE_GAP = 10;
  // El titol PAGAMENT de la vertical. Aquest es l'unic numero que el mou
  // (moure'l tambe a l'escriptori o a l'apaisada vol un valor propi).
  const P_TITLE_Y = 1.85;
  // El vertical encara no el pujem: es queda exactament al centre.
  const P_CONJUNT_LIFT = 0;
  // Aire entre la filera de dalt (comanda + enviament) i la de baix
  // (dades de pagament + acceptació i botó).
  const P_ROW_GAP = 14;
  // ===== VERTICAL: amplada =====
  // La vertical ja no té amplada pròpia: fa servir la mateixa franja que la
  // resta de versions, la que va del logo de la capçalera a la icona de
  // l'usuari (les mateixes pistes d'1fr i el mateix junt de 24px). Abans
  // s'encongia a un grup de 484px centrat a la pantalla, i per això el botó de
  // pagar quedava desalineat respecte del contingut.
  // Cap de l'acceptació de termes, mesurat des del cap de la seva cel·la. L'esquerra
  // no cal tocar-la: termes i botó són a la mateixa pista que la columna
  // d'enviament. El nivell, en canvi, ve d'aquí: 88 = títol "Dades de pagament"
  // (16px * 1,5) + 10 de joc + vora 1 + capçalera "Targeta" (10 + 22 + 10) + seva
  // vora 1 + padding 10 = el cap de la capsa del número de targeta. Aquest número
  // fa d'àncora vertical també per al botó (vegeu P_BUTTON_TOP).
  const P_TERMS_TOP = 0;
  // "Necessites factura?" també va a la cel·la dreta (la del Telèfon) i penja
  // ABSOLUT, com el botó: així es pot alinear amb el camp de Província de la
  // columna del costat (-117, o sigui 709 en pantalla) sense empenyir els
  // termes ni el botó, que es queden al capdamunt de la cel·la. Positiu = baixa
  // la factura. Únic número a retocar per al seu nivell.
  const P_INVOICE_TOP = -117;
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

  // ===== ESCRIPTORI =====
  // El cos de dades s'estirava per omplir la franja, i per això no hi havia res
  // a centrar: ara fa una alçada fixa — els 322px que mesurava amb la franja
  // tancada — i el conjunt (banda de títols + cos) penja centrat en Y, com a
  // l'horitzontal. Únic número a retocar si vol més o menys aire entre camps.
  const D_BODY_H = 322;
  // Palanca del conjunt centrat, com el CONJUNT_LIFT de les tauletes: va com a
  // padding-bottom de l'arrel i puja el bloc la meitat del valor. 0 = centrat.
  const D_CONJUNT_LIFT = 0;
  // El botó de confirmar era l'última peça de la columna i el peu «Powered by
  // Stripe | Termes | Privacitat» anava DINS del seu bloc, en flux: 10px de joc +
  // 17px de línia (8,5pt × 1,5) = 27px de capsa que empenyien el botó cap amunt.
  // Per això quedava 27px per sobre del fons del camp del Telèfon (25,4px en
  // pantalla, per l'escat 0,94). Ara el peu penja fora del flux, com a
  // l'horitzontal, i el botó toca el fons de la cel·la per construcció: les dues
  // columnes fan la mateixa alçada de fila, i el Telèfon és l'últim camp de
  // l'enviament. D_BUTTON_LIFT és l'únic número per afinar-ho (0 = clavats,
  // positiu = baixa el botó; el peu el segueix perquè penja d'ell).
  const D_BUTTON_LIFT = 0;
  // Termes clavats al cap del camp de l'Email. No és un número fix: els 8 blocs
  // de l'enviament fan 34px i es reparteixen amb `space-between` dins la fila,
  // i la fila fa el que deixa la franja (294px amb finestra ≥1440, 290 a 1366,
  // 276 a 1300). El cap del 7è bloc (Email) és a 6·34 + 6·(fila − 272)/7, i
  // això ho dona aquest `calc` amb `100%` = alçada de la fila → segueix la fila
  // quan la finestra canvia d'ample. D_TERMS_ADJ és l'únic número a retocar
  // (positiu = baixa els termes, negatiu = puja'ls). 0 = tall geomètric del cap
  // de l'Email; ara és a 5 (baixats 5px, 2026-09-05), que és just el desplaçament
  // que ell va validar a l'horitzontal (vegeu TERMS_TOP).
  const D_TERMS_ADJ = 0;
  const D_TERMS_TOP = `calc(${6 * 34}px + (100% - ${8 * 34}px) * 6 / 7 + ${D_TERMS_ADJ}px)`;
  // "Necessites factura?": va com a marge de dalt del seu bloc, o sigui que es
  // mesura des del peu de la capsa de targeta. 14px originals de creació pujats
  // 10 (2026-09-05). Únic número a retocar. Com que a l'escriptori els termes i
  // el botó ja pengen absoluts, moure-la no els mogui ni un píxel.
  const D_INVOICE_TOP = 0;
  // La capsa dels dos camps (empresa + CIF) seu, a la posició de creació, just
  // després dels 8px de joc (rowGap) que separen del retol "Necessites factura?":
  // cap de la capsa a 21 + 8 = 29px damunt del bloc. Aquest número la puja sobre
  // aquella posició i va com a marge de dalt NEGATIU, així que el retol no es mou
  // i les tauletes queden igual que estaven. Amb 10 el cap de la capsa va a 19px,
  // o sigui 1,5px per sota de les lletres del retol (la seva línia fa 21px i els
  // glifs ocupen de 3,5 a 17,5).
  const D_INVOICE_FIELDS_LIFT = 0;

  // ===== TAU LETA APAÏSADA (retocs propis) =====
  // Aquesta és l'ÚNICA versió on el repartiment vertical està retocat a mà.
  // L'escriptori, la tauleta vertical i els telèfons es queden amb els números
  // de creació i cap d'aquests retocs no els toca.
  //   · L_PRODUCTES_LIFT: el bloc de productes (llistat + subtotals) puja 25px.
  //   · L_COLUMNES_TOP: el formulari va amb 25px de marge en comptes dels 90 de
  //     creació, o sigui que puja 65px pel seu compte; amb els 25 que ja puja
  //     el llistat, queda 90px més amunt del que era a l'origen. Baixar-lo =
  //     apujar aquest número; apujar-lo = abaixar-lo.
  const L_PRODUCTES_LIFT = 25;
  const L_COLUMNES_TOP = 55;

  // Marge de creació de les dues columnes de dades (el que les separa del bloc
  // de productes). El fan servir l'escriptori i la tauleta vertical, tal qual.
  const COLUMNES_TOP = 90;

  // ===== CISTELL DEL CHECKOUT: FITXES EN CINTA =====
  // El cistell no és una llista vertical (que creixia cap avall i empenyia el
  // formulari) sinó una cinta de fitxes verticals (imatge a dalt, informació a
  // sota) que es desplaça de costat, amb la targeta dels totals clavada a la
  // dreta. Les fitxes estan ancorades a la dreta i creixen cap a l'esquerra, i
  // passen per sota la targeta dels totals.
  // Amb aquest mecanisme el cistell ocupa una sola franja d'alçada fixa, faci
  // els productes que faci, i el formulari de pagament no es mou mai de lloc.
  // L'aire de sota el bloc NO es toca: és on acaba el mega-slide quan s'obre el
  // cistell, i ha de quedar net.
  const FITXA_W = 118;     // amplada d'una fitxa (estreta: la fitxa es vertical)
  const GAP_FITXES = 10;   // separació entre fitxes
  const P_FITXA_H = 228;   // alcada de la fitxa a la vertical: la que hi ha entre la guia verda i la blava
  const TOTALS_W = 250;    // amplada de la targeta dels totals
  const TOTALS_GAP = 28;   // aire entre l'última fitxa i la targeta dels totals
  // La roda del ratolí també desplaça la cinta. Sense això, amb ratolí només es
  // pot moure amb Majúscules + roda, que gairebé ningú no endevina.
  const cintaRef = useRef(null);
  useEffect(() => {
    const el = cintaRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      // Només s'ho empassa si realment hi ha cinta per recórrer; si no, la
      // pàgina ha de poder desplaçar-se amb normalitat.
      if (el.scrollWidth <= el.clientWidth + 1) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!delta) return;
      const abans = el.scrollLeft;
      el.scrollLeft = abans + delta;
      if (el.scrollLeft !== abans) e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Valors derivats segons la variant que es renderitza: l'horitzontal dona
  // exactament els mateixos números que donava abans, l'escriptori res.
  const fieldGap = isPortraitTablet ? P_FIELD_GAP : FIELD_GAP;
  const titleGap = isLandscapeTablet ? TITLE_GAP : (isPortraitTablet ? P_TITLE_GAP : undefined);
  const titleY = isLandscapeTablet ? `${L_TITLE_Y}px` : (isPortraitTablet ? `${P_TITLE_Y}px` : `${TITLE_Y}px`);
  const liftPad = isLandscapeTablet
    ? `${CONJUNT_LIFT * 2}px`
    : (isPortraitTablet ? `${P_CONJUNT_LIFT * 2}px` : `${D_CONJUNT_LIFT * 2}px`);
  const bodyH = isLandscapeTablet ? `${FORMS_H}px` : (isPortraitTablet ? undefined : `${D_BODY_H}px`);
  // A la tauleta apaïsada, el llistat de productes puja 25px (entra dins l'aire
  // de la franja buida, que no pinta res) i les columnes de dades arrenquen amb
  // el marge curt. A la resta de mides, tot igual que sempre.
  const productesLift = isLandscapeTablet ? `-${L_PRODUCTES_LIFT}px` : undefined;
  const columnesTop = isPhone
    ? undefined
    : (isLandscapeTablet ? `${L_COLUMNES_TOP}px` : `${COLUMNES_TOP}px`);

  const ROW_H = 32.8;
  const V_GUTTER = 2.8;
  const TOP_OFFSET = 1.5 * ROW_H;

  const activeItems = useMemo(
    () => (cartItems || []).filter(it => !it.disabled),
    [cartItems]
  );

  // Les fitxes estan ancorades a la dreta: quan n'hi ha més de les que caben, la
  // cinta s'ha de veure pel final (l'últim producte tocant a la targeta dels
  // totals) i no per l'inici.
  useEffect(() => {
    const el = cintaRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [activeItems.length]);

  const grossSum = activeItems.reduce((acc, it) => {
    const unit = parseFloat(String(it.price).replace('€', '').replace(/\s/g, '').replace(',', '.'));
    return Number.isNaN(unit) ? acc : acc + unit * (it.qty || 1);
  }, 0);
  const preu = grossSum;
  const descompte = discountEnabled ? preu * discountRate : 0;
  const totalArticles = preu - descompte;
  const { getCost } = useShippingCosts(formData.country || 'ES');
  const totalQuantity = activeItems.reduce((acc, it) => acc + (it.qty || 1), 0);
  // El preu de la botiga porta el transport i l'IVA inclosos: el client paga
  // exactament el que ha vist a la botiga i el total no es toca mai.
  // Per poder ensenyar el desglossament, del total en traiem primer el
  // transport (el que costaria enviar-ho) i després l'IVA del que queda:
  //   subtotal = (total − transport) / 1,21
  //   iva      = total − transport − subtotal
  // Així les tres ratlles sumen exactament el total.
  const transport = getCost(formData.country || 'ES', totalQuantity, totalArticles);
  const shipping = 0;
  const totalFinal = totalArticles;
  const subtotalNet = Math.round(((totalFinal - transport) / 1.21) * 100) / 100;
  const ivaAmount = Math.round((totalFinal - transport - subtotalNet) * 100) / 100;
  const baseImponible = subtotalNet;
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
        { validate: validatePostalCode, message: 'Codi postal invàlid' }
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
      // El token de seguiment s'ha de declarar aquí FORA. Abans es declarava
      // dins del bloc de producció (const) i després es feia servir aquí, cosa
      // que llançava "ReferenceError: trackingToken is not defined" just
      // després de pagar. El resultat: el client pagava, la comanda es creava i
      // el correu s'enviava, però no s'arribava MAI a la pàgina de confirmació
      // i el client es quedava sense saber si havia comprat.
      let trackingToken = null;

      if (import.meta.env.DEV) {
        const orderItems = activeItems.map((item, idx) => ({
          id: item.id || `item-${idx}`,
          name: item.title || item.name || 'Producte',
          size: item.size || 'L',
          quantity: item.qty || 1,
          price: parseFloat(String(item.price).replace('€', '').replace(/\s/g, '').replace(',', '.')) || 0,
          image: item.image || '/tshirt-white.webp',
        }));
        const mockOrder = createMockOrder({
          items: orderItems,
          subtotal: subtotalNet,
          shipping: transport,
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
            // El cistell del mega-slide no guarda la variant de Gelato: treballa
            // amb la ruta del disseny, la talla i el color. Enviem el slug del
            // producte perquè el servidor pugui resoldre la variant contra la
            // base de dades (product_variants), que és on viu gelato_variant_id.
            //
            // Si l'article porta el slug propi (les fitxes de producte sí que
            // l'hi posen), es fa servir aquest; la llista PDP_REGISTRY_BY_ROUTE
            // només cobreix els dissenys del mega-slide.
            gelatoVariantId: item.gelatoVariantId || null,
            productSlug: item.productSlug || PDP_REGISTRY_BY_ROUTE[item.productRoute]?.slug || null,
            color: item.color || null,
            quantity: item.qty || 1,
            designFiles: item.designFiles || [],
            designUrl: item.designUrl || null,
            productName: item.title || item.name || 'Producte',
            size: item.size || 'L',
          })),
          formData.country || 'es_peninsula',
          'eur',
          {
            email: formData.email,
            userId: user?.id || undefined,
            // L'adreça d'enviament s'ha de desar al servidor: és la que es
            // tramet a Gelato per fabricar i enviar la comanda. Sense això,
            // la comanda es paga però no es pot produir.
            shipping: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              address: formData.address,
              address2: formData.address2,
              city: formData.city,
              postalCode: formData.postalCode,
              country: formData.country,
              phone: formData.phone,
            },
            // Dades de facturació: el formulari les demana quan el client
            // marca "Necessites factura?" i abans es perdien.
            invoice: {
              company: formData.company,
              taxId: formData.taxId,
            },
          }
        );

        const { clientSecret, paymentIntentId, orderNumber: serverOrderNumber, trackingToken: apiTrackingToken } = piResponse;
        trackingToken = apiTrackingToken || null;

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
                  // El país ha de ser el que ha triat el client, no 'ES' fix:
                  // Stripe fa servir aquesta dada per a la verificació d'adreça.
                  country: normalizeCountry(formData.country),
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
      // Codifiquem el número de comanda: el trigger de la base de dades el
      // genera amb '#' al davant ('#000…1'), i sense codificar el '#' es
      // converteix en fragment d'URL, la ruta /order-confirmation/:orderId ja
      // no casa i el client acaba en una pàgina de "no trobat" després de pagar.
      // Hi afegim el token de seguiment perquè el client (sobretot un convidat,
      // sense sessió) pugui carregar la seva comanda: la consulta per número
      // està restringida a administradors.
      const confirmationUrl = `/order-confirmation/${encodeURIComponent(orderNumber)}`
        + (trackingToken ? `?token=${encodeURIComponent(trackingToken)}` : '');
      navigate(confirmationUrl);
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
  const TSHIRT_SUFFIX = '_gpr-4-0_front.webp';
  // El cistell guarda el color amb el nom que es mostra ('Black', 'Light Pink'),
  // però els ajudants d'imatge l'esperen en format slug ('black', 'light-pink').
  // Sense aquesta conversió la imatge de la fitxa no es trobava i sortia trencada.
  const colorSlug = (c) => String(c || '').trim().toLowerCase().replace(/\s+/g, '-');
  const tshirtSrc = (color) => `${TSHIRT_BASE}${colorSlug(color)}${TSHIRT_SUFFIX}`;
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
    const color = colorSlug(item.color);
    const ink = resolveInk(item.collectionSlug, color, item.finish);
    return getMockupPath({ collection: item.collectionSlug, design, shirtColor: color, ink });
  };
  // La imatge de la fitxa del cistell: primer la foto real de la peça (només si
  // és un fitxer nostre; les de Gelato són URLs signades que caduquen i al cap
  // d'unes hores sortirien trencades), després el mockup del disseny i, si no,
  // una samarreta neutra en el color de la peça.
  // '/placeholder-product.svg' és un fitxer que no existeix i que alguns
  // productes porten com a imatge: també s'ha d'ignorar.
  const imatgeArticle = (item) => {
    const propia = item.image
      && String(item.image).startsWith('/')
      && item.image !== '/placeholder-product.svg'
      ? item.image
      : null;
    return propia || mockupSrc(item) || tshirtSrc(item.color);
  };

  // L'acceptació de termes i el botó de confirmar, definits aquí perquè les dues
  // tauletes els puguin col·locar en llocs diferents sense duplicar-ne el dibuix:
  // a l'horitzontal van dins la columna de la targeta, al vertical formen la
  // cel·la dreta, sota les dades d'enviament.
  //
  // Alineació amb el FONS del camp del correu (només a l'horitzontal): el botó
  // va clavat al final de la columna i el Telèfon acaba exactament al mateix
  // nivell, així que el fons del correu queda 41 px per sobre del final de la
  // columna (34 del Telèfon + 7 del junt). El botó n'ocupa els darrers 34, o
  // sigui que entre el fons dels termes i el cap del botó hi ha d'haver
  // exactament el mateix que separa dos camps: FIELD_GAP. Per això el número no
  // és fix sinó que surt de FIELD_GAP: si mai es canvia el junt, l'alineament
  // amb el correu es manté tot sol.
  const termsBlock = (
    <div style={{ marginTop: isPortraitTablet ? '18px' : undefined, marginBottom: isPortraitTablet ? undefined : `${FIELD_GAP}px` }}>
      <label style={{ display:'flex', alignItems:'flex-start', gap:'8px', fontSize:'9.5pt', lineHeight:1.25, fontWeight:300 }}>
        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} style={{ marginTop:'1px' }} />
        <span>Accepto els <a href="/terms" style={{ color:'#4A5057', textDecoration:'underline' }}>Termes del Servei</a>, la <a href="/privacy" style={{ color:'#4A5057', textDecoration:'underline' }}>Política de Privacitat</a> i la <a href="/shipping" style={{ color:'#4A5057', textDecoration:'underline' }}>Política d'enviaments</a>.</span>
      </label>
    </div>
  );

  const buttonBlock = (
    // `marginTop: auto` empeny el botó fins al final de la seva columna. Com que
    // les dues columnes tenen la mateixa alçada (la graella les estira), el botó
    // acaba exactament al mateix nivell que l'últim camp de l'enviament (el
    // Telèfon). Així no cal cap número calculat a mà: si demà canvia un camp,
    // l'alineació es manté tota sola. La línia "Powered by Stripe" va posicionada
    // absoluta i, per tant, queda fora del flux i no desplaça res.
    <div style={{ marginTop: 'auto' }}>
      <button onClick={handleSubmit} disabled={isProcessing} style={{ width:'100%', height: isPortraitTablet ? `${P_BUTTON_H}px` : (isNarrowForm ? '28px' : '34px'), border:'none', borderRadius:'4px', backgroundColor: isProcessing?'#8FE8B9':'#00D66F', color:'#063B21', fontFamily:'Roboto Condensed, sans-serif', fontSize:'10.5pt', fontWeight:600, boxShadow:'0 1px 2px rgba(16,24,40,0.08)', cursor: isProcessing?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
        {isProcessing ? 'Processant…' : (<><Check size={14} strokeWidth={2} /> Confirma la compra</>)}
      </button>
      <div style={{ position: isPortraitTablet ? undefined : 'absolute', top: isPortraitTablet ? undefined : '100%', left: 0, right: 0 }}>
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
    <div style={{ display:'grid', rowGap:'8px', marginTop: isPortraitTablet ? 0 : '16px', position: isPortraitTablet ? 'absolute' : undefined, top: isPortraitTablet ? `${P_INVOICE_TOP}px` : undefined, left: isPortraitTablet ? 0 : undefined, right: isPortraitTablet ? 0 : undefined }}>
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

  // ---------------------------------------------------------------------
  // TELÈFON
  //
  // Una sola columna, de dalt a baix i amb desplaçament vertical. Reaprofita
  // exactament la mateixa lògica de pagament (estat del formulari, validació i
  // handleSubmit): aquí només canvia com es dibuixa, no què fa.
  // ---------------------------------------------------------------------
  if (isPhone) {
    const camp = { width: '100%', height: '40px', border: '1px solid #D8DDE3', borderRadius: '6px', padding: '0 12px', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '11pt', color: '#4A5057', backgroundColor: '#FFFFFF', boxSizing: 'border-box', outline: 'none' };
    const bloc = { backgroundColor: '#FFFFFF', border: '1px solid #E6E8EC', borderRadius: '8px', padding: '16px', marginBottom: '14px' };
    const titol = { ...HEAD, fontSize: '13pt', marginBottom: '12px' };
    const etiqueta = { display: 'block', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '9.5pt', color: '#667085', marginBottom: '4px' };

    const estilTargeta = { style: { base: { color: '#4A5057', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '14px', '::placeholder': { color: '#98A2B4' } }, invalid: { color: '#ef4444' } } };
    const capsaTargeta = { border: '1px solid #D8DDE3', borderRadius: '6px', backgroundColor: '#FFFFFF', padding: '12px' };

    const campsEnviament = [
      ['firstName', 'Nom'], ['lastName', 'Cognoms'], ['address', 'Adreça (carrer i número)'],
      ['address2', 'Pis, porta'], ['postalCode', 'Codi postal'], ['city', 'Ciutat'], ['province', 'Província'],
    ];

    return (
      <div style={{ width: '100%', maxWidth: '560px', margin: '0 auto', fontFamily: 'Roboto Condensed, sans-serif', color: '#4A5057' }}>
        <h1 style={{ ...HEAD, fontSize: '20pt', margin: '0 0 18px' }}>Pagament</h1>

        <div style={bloc}>
          {/* Sense el retol "La teva comanda": el contingut ja es veu que és la
              comanda i la targeta no en necessita el títol (el bloc de dades
              d'enviament i el de pagament sí que en duen, perquè allà sí que
              cal saber què és cada cosa). */}
          {activeItems.map((it, i) => (
            <div key={it.id || i} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '6px 0', borderBottom: '1px solid #F0F2F6' }}>
              <span style={{ fontSize: '10.5pt' }}>
                {it.title || it.name}
                <span style={{ color: '#98A2B4' }}> · Talla {it.size} · {it.qty || 1} u.</span>
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>{it.price}</span>
            </div>
          ))}
          <div style={{ marginTop: '10px', fontSize: '10.5pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{fmt(subtotalNet)}</span></div>
            {descompte > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0A7A46' }}><span>Descompte</span><span>-{fmt(descompte)}</span></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Transport</span><span>{transport === 0 ? 'Gratuït' : fmt(transport)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>IVA 21%</span><span>{fmt(ivaAmount)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', ...HEAD, fontSize: '12pt', marginTop: '8px' }}><span>TOT PLEGAT FA</span><span>{fmt(totalFinal)}</span></div>
          </div>
        </div>

        <div style={bloc}>
          <div style={titol}>Dades d'enviament</div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {campsEnviament.map(([nom, textEtiqueta]) => (
              <div key={nom}>
                <label style={etiqueta} htmlFor={`m-${nom}`}>{textEtiqueta}</label>
                <input id={`m-${nom}`} type="text" name={nom} value={formData[nom] || ''} onChange={handleChange} style={camp} />
                {formErrors[nom] && <div style={errorStyle}>{formErrors[nom]}</div>}
              </div>
            ))}
            <div>
              <label style={etiqueta} htmlFor="m-country">País</label>
              <select id="m-country" name="country" value={formData.country || ''} onChange={handleChange} style={camp}>
                <option value="" disabled>País</option>
                <option value="Espanya">Espanya</option>
                <option value="França">França</option>
                <option value="Andorra">Andorra</option>
              </select>
            </div>
            <div>
              <label style={etiqueta} htmlFor="m-email">Correu electrònic</label>
              <input id="m-email" type="email" name="email" value={formData.email || ''} onChange={handleChange} style={camp} />
              {formErrors.email && <div style={errorStyle}>{formErrors.email}</div>}
            </div>
            <div>
              <label style={etiqueta} htmlFor="m-phone">Telèfon</label>
              <input id="m-phone" type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} style={camp} />
              {formErrors.phone && <div style={errorStyle}>{formErrors.phone}</div>}
            </div>
          </div>
        </div>

        <div style={bloc}>
          <div style={titol}>Dades de pagament</div>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={capsaTargeta}>
              <CardNumberElement options={estilTargeta} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={capsaTargeta}><CardExpiryElement options={estilTargeta} /></div>
              <div style={capsaTargeta}><CardCvcElement options={estilTargeta} /></div>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '14px', fontSize: '9.5pt', lineHeight: 1.3 }}>
            <input type="checkbox" checked={needsInvoice} onChange={(e) => setNeedsInvoice(e.target.checked)} style={{ marginTop: '2px' }} />
            <span>Necessites factura?</span>
          </label>
          {needsInvoice && (
            <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
              <input type="text" name="company" placeholder="Nom de l'empresa" value={formData.company || ''} onChange={handleChange} style={camp} />
              <input type="text" name="taxId" placeholder="CIF (ex: ESA12345672)" value={formData.taxId || ''} onChange={handleChange} style={camp} />
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '16px', fontSize: '9.5pt', lineHeight: 1.3 }}>
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} style={{ marginTop: '2px' }} />
            <span>
              Accepto els <a href="/terms" style={{ color: '#4A5057', textDecoration: 'underline' }}>Termes del Servei</a>, la{' '}
              <a href="/privacy" style={{ color: '#4A5057', textDecoration: 'underline' }}>Política de Privacitat</a> i la{' '}
              <a href="/shipping" style={{ color: '#4A5057', textDecoration: 'underline' }}>Política d'enviaments</a>.
            </span>
          </label>

          {paymentError && (
            <div style={{ marginTop: '12px', color: '#D04B4B', fontSize: '10pt', textAlign: 'center' }}>{paymentError}</div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            style={{ width: '100%', height: '48px', marginTop: '16px', border: 'none', borderRadius: '6px', backgroundColor: isProcessing ? '#8FE8B9' : '#00D66F', color: '#063B21', fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
          >
            {isProcessing ? 'Processant…' : 'Confirma la compra'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '9pt', color: '#98A2B4', marginBottom: '24px' }}>
          Pagament segur amb Stripe
        </p>
      </div>
    );
  }

  return (
    <div style={{ width:'100%', position:'relative', display:'flex', flexDirection:'column', justifyContent:'flex-start', fontFamily:'Roboto Condensed, sans-serif', color:'#4A5057', overflow:'visible', padding:0 }}>
      {/* AQUESTA DISPOSICIÓ ÉS LA MATEIXA DE SEMPRE, NOMÉS MOVIDA.
          El pagament viu en una pàgina pròpia que entra per sota del mega-slide.
          L'ordre nou és:
            1. El llistat de productes (la columna del cistell), ample i a sobre.
            2. A sota, les dues columnes de sempre: enviament | pagament.
          Els elements no s'han redibuixat: són els mateixos, amb els seus
          estils i les seves mides. Només ha canviat la fila on seuen. */}
      <span style={{ ...HEAD, fontSize:'18pt', fontWeight:600, position:'absolute', top:titleY, left: SHIFT_X, transform:'translateY(-50%)' }}>PAGAMENT</span>
      {/* La banda de dades comença sota el títol PAGAMENT (que va absolut), per
          no trepitjar-lo. */}
      {/* Aquí hi havia el títol "La teva comanda". S'ha tret perquè és
          redundant: la pàgina ja es diu PAGAMENT i el que ve a sota és,
          precisament, la comanda. La franja, però, es queda amb la mateixa
          alçada que tenia (els 24px de la línia del títol; 29 a les
          tauletes), de manera que tot el que hi ha a sota no es mou ni un
          píxel. Els 34px de dalt són els que aparten el contingut del títol
          PAGAMENT, que va posicionat absolut i no ocupa lloc. */}
      {/* A la vertical, 33px en comptes de 34: el bloc de productes ha de
          comencar exactament a la guia verda (el final de la tinta del titol
          mes 20px), i amb 34 hi queia 1px a sota. */}
      <div style={{ marginTop: isPortraitTablet ? '33px' : '34px', flexShrink:0, minHeight: isPortraitTablet ? 0 : (isTabletRecipe ? '29px' : '24px'), marginBottom: isPortraitTablet ? 0 : (isTabletRecipe ? `${titleGap}px` : undefined) }} />
      <div style={{ display:'grid', gridTemplateColumns: isPortraitTablet ? '1fr 1fr' : '1fr 1fr 1fr 1fr', columnGap:'24px', rowGap: isPortraitTablet ? `${P_ROW_GAP}px` : '18px', marginTop: productesLift, flex: '0 0 auto', minHeight:0, transform: shiftColsX }}>
        {/* COL 1: el cistell. Una cinta de fitxes que es desplaça de costat amb
            la targeta dels totals clavada a la dreta, per sobre de les fitxes
            (que hi passen per sota). Ocupa una franja d'alçada fixa: el
            formulari de pagament no es mou mai, faci els productes que faci. */}
        <div style={{ gridColumn:'1 / -1', position:'relative', display:'flex', minHeight:0 }}>
          {/* Cinta de fitxes. L'espaiador del davant empeny les fitxes cap a la
              dreta (quan n'hi ha poques) i s'arronsa a zero quan no hi caben:
              així sempre creixen cap a l'esquerra, des de la targeta dels
              totals. El coixí de la dreta fa l'amplada de la targeta més el
              marge, de manera que l'última fitxa sempre es pot treure de sota. */}
          <div ref={cintaRef} style={{ flex:'1 1 auto', minWidth:0, display:'flex', alignItems:'stretch', gap:`${GAP_FITXES}px`, overflowX:'auto', overflowY:'hidden', paddingRight:`${TOTALS_W + TOTALS_GAP}px`, scrollbarWidth:'thin' }}>
            <div style={{ flex:'1 1 auto', minWidth:0 }} />
            {activeItems.map((item, idx) => {
              const ip = parseFloat(String(item.price).replace('€','').replace(/\s/g,'').replace(',','.'))||0;
              const q = item.qty||1;
              return (
                <div key={`c-${item.id}-${idx}`} style={{ flex:'0 0 auto', width:`${FITXA_W}px`, height: isPortraitTablet ? `${P_FITXA_H}px` : undefined, boxSizing:'border-box', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', border:'1px solid #E6E8EC', borderRadius:'6px', background:'#FFFFFF', padding:'8px' }}>
                  <div style={{ width:'100%', height: isPortraitTablet ? undefined : '88px', flex: isPortraitTablet ? '1 1 auto' : '0 0 auto', minHeight:0, overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <img src={imatgeArticle(item)} alt="" loading="lazy" decoding="async" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                  </div>
                  <div style={{ width:'100%', fontSize:'9pt', lineHeight:1.2, textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title||item.name||'Producte'}</div>
                  <div style={{ fontSize:'8pt', lineHeight:1.2, color:'#667085', textAlign:'center' }}>Talla {item.size||'-'} · {q} u.</div>
                  <div style={{ fontSize:'10pt', lineHeight:1.2, fontVariantNumeric:'tabular-nums' }}>{(ip*q).toFixed(2).replace('.',',')}€</div>
                </div>
              );
            })}
          </div>
          {/* Targeta dels totals: opaca i amb una ombra cap a l'esquerra, perquè
              es vegi que les fitxes li passen per sota. */}
          <div style={{ position:'absolute', top:0, bottom:0, right:0, width:`${TOTALS_W}px`, boxSizing:'border-box', display:'flex', flexDirection:'column', fontFamily: isPortraitTablet ? 'Roboto, sans-serif' : undefined, justifyContent: isPortraitTablet ? 'flex-end' : 'space-between', gap: isPortraitTablet ? '2px' : undefined, padding:'10px 12px', background:'#FFFFFF', border:'1px solid #E6E8EC', borderRadius:'6px', boxShadow:'-12px 0 16px -12px rgba(16,24,40,0.20)' }}>
            {/* Els totals són una suma: cada concepte a la seva ratlla, el nom a
                l'esquerra i la xifra a la dreta, com una columna de números.
                El Subtotal és el preu de la peça sense transport i sense IVA;
                el transport i l'IVA són dins del preu, però es desglossen aquí
                perquè es vegi d'on surt el total. Les tres ratlles sumen
                exactament TOT PLEGAT FA. */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', fontSize: isPortraitTablet ? '11pt' : '9.5pt', lineHeight:1.2, color:'#667085' }}><span>Subtotal</span><span style={{ fontVariantNumeric:'tabular-nums' }}>{subtotalNet.toFixed(2).replace('.',',')}€</span></div>
            {discountEnabled && <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', fontSize: isPortraitTablet ? '11pt' : '9.5pt', lineHeight:1.2, color:'#667085' }}><span>Descompte (-{offersConfig.discountRate}%)</span><span style={{ fontVariantNumeric:'tabular-nums' }}>-{descompte.toFixed(2).replace('.',',')}€</span></div>}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', fontSize: isPortraitTablet ? '11pt' : '9.5pt', lineHeight:1.2, color:'#667085' }}><span>Transport</span><span style={{ fontVariantNumeric:'tabular-nums' }}>{transport === 0 ? 'Gratuït' : `${transport.toFixed(2).replace('.',',')}€`}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', fontSize: isPortraitTablet ? '11pt' : '9.5pt', lineHeight:1.2, color:'#667085' }}><span>IVA 21%</span><span style={{ fontVariantNumeric:'tabular-nums' }}>{ivaAmount.toFixed(2).replace('.',',')}€</span></div>
            {/* TOT PLEGAT FA es queda en Roboto Condensed encara que la resta
                de la targeta vagi en Roboto. */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', fontFamily:'Roboto Condensed, sans-serif', fontSize:'12.5pt', fontWeight:500, lineHeight:1.2, paddingTop:'6px', borderTop:'1px solid #E6E8EC' }}><span>TOT PLEGAT FA</span><span style={{ fontVariantNumeric:'tabular-nums' }}>{totalFinal.toFixed(2).replace('.',',')}€</span></div>
          </div>
        </div>
        {/* COL 2: Dades d'enviament. Baixa a la fila de sota i ocupa mitja
            amplada. El títol va DINS de la columna (primera peça): així sempre
            queda just a sobre de la seva columna, es mogui on es mogui. */}
        <div style={{ gridColumn: isPortraitTablet ? 'span 1' : 'span 2', marginTop: columnesTop, display:'flex', flexDirection:'column', minHeight:0, overflow:'visible', justifyContent: 'flex-start', gap: fieldGap }}>
          {/* 15px de marge + els 5px de junt de la columna = 20px fins al primer camp */}
          <div style={{ fontSize:'12pt', fontWeight:500, marginTop: isLandscapeTablet ? '10px' : undefined, marginBottom: isLandscapeTablet ? '5px' : '15px' }}>Dades d'enviament</div>
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
        {/* Mateix marge que la columna d'enviament: així el bloc de la targeta
            queda alineat pel capdamunt amb el camp del client. */}
        <div style={{ gridColumn: isPortraitTablet ? 'span 1' : 'span 2', marginTop: columnesTop, display:'flex', flexDirection:'column', minHeight:0, overflow:'visible', position: isPortraitTablet ? undefined : 'relative', gap: isNarrowForm ? '1px' : undefined }}>
          <div style={{ fontSize:'12pt', fontWeight:500, marginTop: isLandscapeTablet ? '10px' : undefined, marginBottom: isLandscapeTablet ? '10px' : '20px' }}>Dades de pagament</div>
          <div style={{ display:'flex', flexDirection:'column', flex:'1 1 auto', gap: isNarrowForm ? '1px' : undefined }}>
            {/* Pagament */}
            <div style={{ display:'grid', rowGap: '8px' }}>
              {/* El bloc de la targeta porta contorn propi: des que la pàgina és
                  blanca, sense la vora no es distingiria del fons. */}
              <div style={{ background:'#FFFFFF', border:'1px solid #D8DDE3', borderRadius:'6px', overflow:'hidden' }}>
                <div style={{ padding: isNarrowForm ? '6px 10px' : '10px 12px', display:'flex', alignItems:'center', gap:'8px', fontSize: isNarrowForm ? '9pt' : '11pt', fontWeight:500, color:'#4A5057' }}>
                  <span style={{ width:'13px', height:'10px', border:'1px solid #4A5057', borderRadius:'2px', display:'inline-block' }} />
                  <span>Targeta</span>
                </div>
                <div style={{ padding: '10px 12px', display:'grid', rowGap: '8px' }}>
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
          // Aquesta cel·la va a la SEGONA columna (la de pagament), o sigui que
          // els termes i el botó de pagar queden davall la targeta, amb el
          // mateix cap d'esquerra i la mateixa amplada que els camps.
          // El marge negatiu la puja fins al capdamunt del camp del telèfon
          // (874 -> 826): la fila comença just sota la columna d'enviament, i
          // el telèfon n'és l'últim camp.
          <div style={{ gridColumn:'2', marginTop: isPortraitTablet ? '-48px' : undefined, display:'flex', flexDirection:'column', minHeight:0, position:'relative' }}>
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
