import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useShippingCosts } from '@/hooks/useShippingCosts';
import { drawingStripePath } from '@/lib/drawingPaths';
import { esTauletaApaisada , readRootCssNumber } from '@/utils/layoutMetrics';

function CistellComandaContent({ cartItems, setCartItems, onFinalizeOrder, onAmpleNatural }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Si l'usuari ja ha passat pel pagament (és a /checkout) i torna a obrir el
  // cistell del mega-slide, el botó "FINALITZA LA COMANDA" no hi pinta res: la
  // pàgina de pagament és al darrere i es veu tota l'estona. Per això el botó
  // només apareix quan NO som a /checkout.
  const isOnCheckoutRoute = location?.pathname === '/checkout';

  const [isTablet, setIsTablet] = useState(
    typeof window !== 'undefined'
      && window.innerWidth >= 768
      && window.innerWidth <= 1366
  );
  const [isPortraitTablet, setIsPortraitTablet] = useState(
    typeof window !== 'undefined'
      && window.innerWidth >= 768
      && window.innerWidth <= 1366
      && window.innerHeight > window.innerWidth
  );
  const [isLandscapeTablet, setIsLandscapeTablet] = useState(esTauletaApaisada());

  // Micro-retocs propis de la vertical (ancoratge a l'esquerra, junts i
  // compensacions de text). L'horitzontal en conserva els d'escriptori.
  const isNarrowCart = isPortraitTablet;

  const ROW_H = 23.867;        // alçada d'una fila de la pauta
  const [franjaPx, setFranjaPx] = useState(null);
  useEffect(() => {
    const read = () => {
      const v = readRootCssNumber('--hg-band-w', 0);
      setFranjaPx((prev) => (v > 0 && Math.abs((prev ?? 0) - v) > 0.5 ? v : prev));
    };
    read();
    const t1 = window.setTimeout(read, 300);
    const t2 = window.setTimeout(read, 900);
    window.addEventListener('resize', read);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', read);
    };
  }, []);
  const GUTTER = 5.457;        // gutter horitzontal entre columnes
  const V_GUTTER = 2.037;      // gutter vertical entre files
  const TOP_OFFSET = 0; // al contenidor del carrusel la llista comença a dalt
  // Marge entre el bloc del total (amb FINALITZA LA COMPRA) i el fons del
  // megaslide: el bloc hi va fix, no surant darrere de l'última fila.
  const OVERLAY_MARGE = 24;
  const ROWS = 21;
  const TABLE_WIDTH = 1350;

  // Pauta del CARRUSEL — VALORS MANUALS EDITABLES (un número per variant):
  //   SLOT_W   → amplada d'una targeta del carrusel (px)
  //   SLIDE_GAP→ separaci\u00f3 entre slots (px) — igual que el carrusel
  //   SLIDE_OFFSET_X → desplaçament horitzontal del grid del cistell respecte
  //     a la seva posici\u00f3 natural (per quadrar amb el carrusel). Pot ser
  //     positiu (cap a la dreta) o negatiu (cap a l'esquerra).
  // L'horitzontal fa ara l'estructura de la vertical: 4 columnes d'iguals, sense
  // columnes externes, i la fila tan ampla com el seu contingut — així deixa de
  // sobresortir del viewport. L'escriptori i la vertical conserven els números.
  const L_SLOT_W = 122; // ← amplada de slot de l'horitzontal
  const L_GAP = 2;      // ← separació entre slots de l'horitzontal
  const isCompactCart = isPortraitTablet || isLandscapeTablet;
  // A la vertical, els slots surten de la FRANJA central (la que publica el
  // header): aixi la filera fa exactament la franja sense escalar res, i les
  // alcades (ROW_H es fixa) no es toquen. 7 junts de 2 px i 8 slots (4
  // columnes de 2 slots).
  const SLOT_W = isPortraitTablet
    ? (franjaPx ? Math.max(80, (franjaPx / 0.94 - 7 * 2) / 8) : 80)
    : (isLandscapeTablet ? L_SLOT_W : 144 + 11);
  const SLIDE_GAP = isPortraitTablet ? 2 : (isLandscapeTablet ? L_GAP : 3);
  const SLIDE_OFFSET_X = 0;
  // Columnes: 2+2+2+(2 + porci\u00f3 visible del 9\u00e8 slot).
  const COL2 = SLOT_W * 2 + SLIDE_GAP;
  // Amplada del contenidor del cistell = TABLE_WIDTH (= viewport de la slide).
  const COL4_EXTRA = 0;
  const CART_VIEWPORT = TABLE_WIDTH + COL4_EXTRA;
  // Col 4 ocupa la resta del viewport (TABLE_WIDTH - 3 cols - 3 gaps).
  const COL3 = CART_VIEWPORT - 3 * COL2 - 3 * SLIDE_GAP;
  // Col 1 i Col 4 simètriques: 2*COL_OUTER + 2*COL2 + 3*SLIDE_GAP = CART_VIEWPORT
  const COL_OUTER = isCompactCart ? 0 : (CART_VIEWPORT - 2 * COL2 - 3 * SLIDE_GAP) / 2;
  // Amplada real d'una fila del cistell. A l'horitzontal ve donada pel seu
  // contingut (4 columnes + 3 junts) perquè no sobrepassi el viewport; a
  // l'escriptori i a la vertical segueix sent la taula de 1350px.
  const ROW_W = isCompactCart ? (4 * COL2 + 3 * SLIDE_GAP) : CART_VIEWPORT;

  // ---------------------------------------------------------------------------
  // TOTES les mides de la filera, en un sol lloc.
  //
  // L'estructura es la mateixa a les tres families (escriptori, apaisada i
  // vertical), pero la unitat no: a la vertical la tipografia es mes gran en
  // proporcio, i per aixo el disseny sencer no es pot escalar (els textos
  // caurien a 6 pt). Per consequencia, cada familia te el seu joc de numeros,
  // pero TOTS son aqui i en les mateixes unitats, en comptes d'escampats per
  // les fileres.
  // ---------------------------------------------------------------------------
  const MIDES = {
    // Desplac,ament horitzontal del bloc de la talla dins la seva casella.
    dxTalla: isPortraitTablet ? 62 : (isNarrowCart ? 50 : 23),
    // Desplac,ament del cubell d'esborrar (negatiu = cap a l'esquerra).
    dxCubell: isPortraitTablet ? -6 : (isNarrowCart ? -8 : -20),
    // Desplac,ament del preu dins de la seva casella.
    dxPreu: isPortraitTablet ? '0px' : (isNarrowCart ? '-12px' : '-36px'),
    // Graella interna de la columna del preu: etiqueta oculta, buit, cubell,
    // part entera i part decimal.
    gridPreu: isPortraitTablet ? '0px 40px 40px auto auto' : 'auto 40px 40px 70px 70px',
    // El marge de la part decimal ha de compensar el junt de caselles, si no
    // el preu es llegeix «15, 50€».
    margeDecimal: isPortraitTablet ? '-10px' : (isNarrowCart ? '-4px' : '-8px'),
    gapCellesPreu: isPortraitTablet ? '10px' : (isNarrowCart ? '4px' : '8px'),
    // Junts dins dels grups de la quantitat i de la talla.
    gapQty: isNarrowCart ? '6px' : '14px',
    gapTalla: isNarrowCart ? '4px' : '10px',
  };

  // La pagina 3 escala el cistell perque faci la franja central: li cal saber
  // quina es l'amplada natural del contingut.
  useEffect(() => {
    if (typeof onAmpleNatural === 'function') onAmpleNatural(ROW_W);
  }, [onAmpleNatural, ROW_W]);


  const TSHIRT_BASE = '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_';
  const TSHIRT_SUFFIX = '_gpr-4-0_front.webp';
  const tshirtSrc = (color) => `${TSHIRT_BASE}${color}${TSHIRT_SUFFIX}`;


  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const CART_ITEMS = cartItems;

  // Scroll vertical intern (sense barra) — patró del /checkout:
  // Scroll DISCRET per fila. Les imatges de fons es queden fixes a
  // rowIndex 0..N i només canvia el contingut (text, samarretes,
  // dibuixos) que hi apareix a sobre quan l'usuari fa scroll.
  const FIRST_VIEWPORT_ROW = 0;
  const LAST_VIEWPORT_ROW = isTablet ? 11 : 15;
  // Cada ítem ocupa 2 files de contingut (sense fila buida de separació).
  const ITEM_STRIDE = 2 * ROW_H - 4;
  const VISIBLE_HEIGHT = (LAST_VIEWPORT_ROW - FIRST_VIEWPORT_ROW) * ROW_H - V_GUTTER;
  const VISIBLE_ITEMS = Math.max(1, Math.floor((VISIBLE_HEIGHT + V_GUTTER) / ITEM_STRIDE)) - 1;
  const [scrollRow, setScrollRow] = useState(0);
  const maxScrollRow = Math.max(0, CART_ITEMS.length - VISIBLE_ITEMS);
  const cartViewportRef = useRef(null);
  const cartTouchRef = useRef(null);
  useEffect(() => {
    const viewport = cartViewportRef.current;
    if (!viewport) return undefined;
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      e.stopPropagation();
      const direction = e.deltaY > 0 ? 1 : -1;
      setScrollRow(prev => Math.max(0, Math.min(maxScrollRow, prev + direction)));
    };
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [maxScrollRow, CART_ITEMS.length]);
  const handleCartTouchStart = (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    cartTouchRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleCartTouchMove = (e) => {
    const start = cartTouchRef.current;
    const touch = e.touches[0];
    if (!start || !touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaY) <= Math.abs(deltaX) || Math.abs(deltaY) < ROW_H / 2) return;
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    const direction = deltaY < 0 ? 1 : -1;
    setScrollRow(prev => Math.max(0, Math.min(maxScrollRow, prev + direction)));
    cartTouchRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleCartTouchEnd = () => {
    cartTouchRef.current = null;
  };
  const changeQty = (idx, delta) => {
    setCartItems(prev => prev.map((it, j) => j === idx ? { ...it, qty: Math.max(1, it.qty + delta) } : it));
  };
  const changeSize = (idx, delta) => {
    setCartItems(prev => prev.map((it, j) => {
      if (j !== idx) return it;
      const i = SIZES.indexOf(it.size);
      const next = SIZES[Math.max(0, Math.min(SIZES.length - 1, (i < 0 ? 0 : i) + delta))];
      return { ...it, size: next };
    }));
  };
  const removeItem = (idx) => {
    setCartItems(prev => {
      const next = prev.filter((_, j) => j !== idx);
      const newMaxRow = Math.max(0, next.length - VISIBLE_ITEMS);
      setScrollRow(s => Math.min(s, newMaxRow));
      return next;
    });
  };
  const handleFinalizeOrder = () => {
    if (typeof onFinalizeOrder === 'function') {
      onFinalizeOrder();
      return;
    }
    const checkoutItems = CART_ITEMS
      .map((item, idx) => {
        const parsedPrice = parseFloat(String(item.price).replace('€', '').replace(/\s/g, '').replace(',', '.'));
        return {
          id: `${idx}-${String(item.title || 'item').toLowerCase().replace(/\s+/g, '-')}`,
          name: item.title || 'Producte',
          size: item.size || 'L',
          quantity: item.qty || 1,
          price: Number.isNaN(parsedPrice) ? 0 : parsedPrice,
          image: tshirtSrc(item.color || 'white'),
        };
      })
      .filter((item) => item.quantity > 0 && item.price >= 0);

    navigate('/checkout', {
      state: {
        cartItems: checkoutItems,
      },
    });
  };

  const HEAD = { fontFamily: 'Oswald, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#475059' };
  const VAL  = { fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 500, color: '#475059' };

  useShippingCosts('es_peninsula');

  const isEmpty = CART_ITEMS.length === 0;

  // L'ultima fila visible del cistell: el bloc flotant del total s'hi posa just
  // a sota. Abans es mesurava un boto invisible de la graella que cau una filera
  // sencera mes avall, i per aixo el total quedava 117px mes avall.
  const ultimaFilaRef = useRef(null);
  const [overlayTop, setOverlayTop] = useState(null);
  const [overlayLeft, setOverlayLeft] = useState(null);
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const portrait = w >= 768 && w <= 1366 && h > w;
      setIsTablet(w >= 768 && w <= 1366);
      setIsPortraitTablet(portrait);
      setIsLandscapeTablet(esTauletaApaisada({ ample: w, alt: h }));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    if (isEmpty) return;
    let raf = 0;
    const measure = () => {
      const btn = ultimaFilaRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      // El bloc del total + FINALITZA LA COMPRA no ha de surar seguint l'última
      // fila del cistell: va fix al fons de la pestanya, ancorat al fons del
      // megaslide (el bloc es col·loca per la seva vora inferior).
      const panell = document.querySelector('[data-mega-panel-surface="1"]');
      const nextY = Math.round(panell ? panell.getBoundingClientRect().bottom : r.bottom + 25);
      const nextX = Math.round(r.left + r.width / 2);
      setOverlayTop((prev) => (prev === nextY ? prev : nextY));
      setOverlayLeft((prev) => (prev === nextX ? prev : nextX));
      raf = requestAnimationFrame(measure);
    };
    raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [isTablet, isEmpty, CART_ITEMS.length]);

  return (
    <>
      {isEmpty ? (
        <div style={{
          position: 'absolute',
          top: `${TOP_OFFSET}px`,
          left: `calc(50% - ${ROW_W / 2}px)`,
          width: `${ROW_W}px`,
          height: `${VISIBLE_HEIGHT}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}>
          <div style={{
            fontFamily: 'Oswald, sans-serif',
            fontWeight: 200,
            fontSize: '18pt',
            color: '#C3C8CD',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}>
            EL CISTELL ÉS BUIT
          </div>
          <div style={{
            fontFamily: 'Roboto Condensed, sans-serif',
            fontWeight: 300,
            fontSize: '10pt',
            color: '#E0E3E8',
            marginTop: '12px',
            letterSpacing: '0.5px',
            textAlign: 'center',
          }}>
            Encara no hi ha cap producte
          </div>
        </div>
      ) : (
      <>
      {/* Finestra de scroll vertical de les línies del cistell (sense barra) */}
      <div
        ref={cartViewportRef}
        onTouchStart={handleCartTouchStart}
        onTouchMove={handleCartTouchMove}
        onTouchEnd={handleCartTouchEnd}
        onTouchCancel={handleCartTouchEnd}
        style={{
          position: 'absolute',
          // Totes les vistes comencen a dalt. Abans, l'escriptori i
          // l'apaisada arrencaven una filera i 20 px mes amunt (`- ROW_H -
          // 20`) per l'efecte d'entrada en fer scroll, i amb aixo la primera
          // filera quedava tallada pel sostre del panell: la llista semblava
          // desplaçada.
          top: `${TOP_OFFSET}px`,
          // Centrada, tambe a la vertical: abans hi arrencava a 0 i, amb el
          // contenidor mes ample que la pantalla, la filera i el bloc del total
          // queien a l'esquerra del centre.
          left: `calc(50% - ${ROW_W / 2}px)`,
          width: `${ROW_W}px`,
          height: `${VISIBLE_HEIGHT}px`,
          overflow: 'hidden',
          touchAction: 'pan-x',
          overscrollBehavior: 'contain',
          zIndex: 2,
        }}
      >
      <div style={{
        position: 'relative',
        width: '100%',
        height: `${VISIBLE_HEIGHT}px`,
      }}>
      {CART_ITEMS.slice(scrollRow, scrollRow + VISIBLE_ITEMS).map((item, rowIndex) => {
        // `i` és l'índex real dins de CART_ITEMS (per a les operacions
        // d'estat: changeQty/changeSize/removeItem). `rowIndex` és la
        // posició VISUAL fixa dins del viewport: així les imatges de
        // fons es queden ancorades a 0..N i només canvia el contingut
        // que apareix a sobre quan es fa scroll. Patró del /checkout.
        const i = scrollRow + rowIndex;
        const filesRenderitzades = Math.min(VISIBLE_ITEMS, CART_ITEMS.length - scrollRow);
        const esUltimaFila = rowIndex === filesRenderitzades - 1;
        const colBg = { backgroundColor: 'transparent', height: '100%', boxSizing: 'border-box' };
        return (
        <div key={i} ref={esUltimaFila ? ultimaFilaRef : undefined} className="cart-row" style={{
          position: 'absolute',
          top: `${rowIndex * ITEM_STRIDE}px`,
          left: `${SLIDE_OFFSET_X}px`,
          width: `${ROW_W}px`,
          height: `${2 * ROW_H - V_GUTTER - 2}px`,
          display: 'grid',
          gridTemplateColumns: isCompactCart ? `${COL2}px ${COL2}px ${COL2}px ${COL2}px` : `${COL_OUTER}px ${COL2}px ${COL2}px ${COL_OUTER}px`,
          columnGap: `${SLIDE_GAP}px`,
          alignItems: 'stretch',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${encodeURI('/placeholders/tots_els_fons/fons_acordio/fons-cistell-compra.webp')}")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            // La franja sempre es dibuixa a la seva amplada original de creació
            // (1350px): així els plecs de l'acordió no s'estiren i la fila
            // estreta de l'horitzontal només en retalla els extrems.
            backgroundSize: `${TABLE_WIDTH + COL4_EXTRA}px auto`,
            transform: rowIndex % 2 === 0 ? 'scaleX(-1)' : 'none',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: isCompactCart ? `${COL2}px ${COL2}px ${COL2}px ${COL2}px` : `${COL_OUTER}px ${COL2}px ${COL2}px ${COL_OUTER}px`,
            columnGap: `${SLIDE_GAP}px`,
            alignItems: 'stretch',
            width: '100%',
            height: '100%',
          }}>
          {/* Col 1: samarreta + dibuix (cadascú centrat amb el slot del carrusel del damunt) */}
          <div style={{ ...colBg, position: 'relative', padding: 0, minWidth: 0,  }}>
            <div style={{ display: 'grid', gridTemplateColumns: `${SLOT_W}px ${SLOT_W}px`, columnGap: `${SLIDE_GAP}px`, alignItems: 'center', justifyItems: 'center', height: '100%' }}>
              <div style={{
                alignSelf: 'start',
                width: `${SLOT_W}px`,
                height: `${2 * ROW_H - V_GUTTER}px`,
                backgroundColor: 'transparent',
                boxSizing: 'border-box',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src={tshirtSrc(item.color)}
                  alt={`${item.title} — ${item.color}`}
                  style={{ width: '75%', height: '75%', objectFit: 'contain', display: 'block', transform: 'translateY(1px)' }}
                />
              </div>
              <div style={{
                alignSelf: 'start',
                width: `${SLOT_W}px`,
                height: `${2 * ROW_H - V_GUTTER}px`,
                backgroundColor: 'transparent',
                boxSizing: 'border-box',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src={(item.collectionSlug && item.productRoute ? drawingStripePath(item.collectionSlug, item.productRoute, item.color, item.finish) : item.drawing) || ''}
                  alt={item.title}
                  style={{ width: ['NX-01','NCC-1701','NCC-1701-D'].includes(item.title) ? (item.title === 'NCC-1701-D' ? '27.225%' : '36.3%') : '72.6%', height: ['NX-01','NCC-1701','NCC-1701-D'].includes(item.title) ? (item.title === 'NCC-1701-D' ? '27.225%' : '36.3%') : '72.6%', objectFit: 'contain', display: 'block', transform: item.title === 'ROBBIE THE ROBOT' ? 'translateY(1px)' : undefined, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
                />
              </div>
            </div>
            <svg
              viewBox="0 0 24 24"
              width={(2 * ROW_H - V_GUTTER) * 0.421875}
              height={(2 * ROW_H - V_GUTTER) * 0.421875}
              style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 2 }}
              aria-hidden="true"
            >
              <line x1="12" y1="3" x2="12" y2="21" stroke="#7D8895" strokeWidth="1" strokeLinecap="butt" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="#7D8895" strokeWidth="1" strokeLinecap="butt" />
            </svg>
          </div>

          {/* Col 2: títol + col·lecció */}
          <div style={{ ...colBg, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, overflow: 'hidden', padding: isNarrowCart ? '0 0 0 4px' : '0 4px', marginRight: isNarrowCart ? '-40px' : undefined }}>
            <div style={{ ...HEAD, fontSize: '11.6424pt', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.title}
            </div>
          </div>

          {/* Col 3: QUANTITAT + TALLATGE (cadascun centrat amb el slot del carrusel del damunt) */}
          <div style={{ ...colBg, display: 'grid', gridTemplateColumns: `${SLOT_W}px ${SLOT_W}px`, gridTemplateRows: `${ROW_H - V_GUTTER}px ${ROW_H - V_GUTTER}px`, columnGap: `${SLIDE_GAP}px`, rowGap: `${V_GUTTER}px`, alignItems: 'center', justifyItems: 'center',  }}>
            <div style={{ gridRow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', transform: `translateY(${-0.5 * ROW_H}px)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: MIDES.gapQty, ...VAL, fontSize: '11.6424pt' }}>
                <button onClick={() => changeQty(i, -1)} onMouseEnter={(e) => { e.currentTarget.style.color = '#475059'; e.currentTarget.style.fontSize = '12pt'; e.currentTarget.style.transform = 'scale(1.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#C3C8CD'; e.currentTarget.style.fontSize = '8.7318pt'; e.currentTarget.style.transform = 'scale(1)'; }} style={{ width: `${(ROW_H - V_GUTTER) * 1.25}px`, height: `${(ROW_H - V_GUTTER) * 1.25}px`, border: '1px solid #C9D0D9', borderRadius: '50%', backgroundColor: 'transparent', color: '#C3C8CD', cursor: 'pointer', fontSize: '8.7318pt', lineHeight: 1, padding: 0, transition: 'color 0.15s ease, transform 0.15s ease, font-size 0.15s ease' }}>−</button>
                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
                <button onClick={() => changeQty(i, +1)} onMouseEnter={(e) => { e.currentTarget.style.color = '#475059'; e.currentTarget.style.fontSize = '12pt'; e.currentTarget.style.transform = 'scale(1.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#C3C8CD'; e.currentTarget.style.fontSize = '8.7318pt'; e.currentTarget.style.transform = 'scale(1)'; }} style={{ width: `${(ROW_H - V_GUTTER) * 1.25}px`, height: `${(ROW_H - V_GUTTER) * 1.25}px`, border: '1px solid #C9D0D9', borderRadius: '50%', backgroundColor: 'transparent', color: '#C3C8CD', cursor: 'pointer', fontSize: '8.7318pt', lineHeight: 1, padding: 0, transition: 'color 0.15s ease, transform 0.15s ease, font-size 0.15s ease' }}>+</button>
              </div>
            </div>
            <div style={{ gridRow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', // A la vertical, la talla tambe s'allunya de la quantitat.
              transform: `translate(${MIDES.dxTalla}px, ${-0.5 * ROW_H}px)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: MIDES.gapTalla, ...VAL, fontSize: '11.6424pt' }}>
                <button onClick={() => changeSize(i, -1)} onMouseEnter={(e) => { e.currentTarget.style.color = '#7D8895'; e.currentTarget.style.transform = 'scale(1.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#C3C8CD'; e.currentTarget.style.transform = 'scale(1)'; }} style={{ width: `${ROW_H - V_GUTTER}px`, height: `${ROW_H - V_GUTTER}px`, border: 'none', background: 'transparent', color: '#C3C8CD', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s ease, transform 0.15s ease' }}><ChevronDown size={19.64655} strokeWidth={2.5} /></button>
                <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 600 }}>{item.size}</span>
                <button onClick={() => changeSize(i, +1)} onMouseEnter={(e) => { e.currentTarget.style.color = '#7D8895'; e.currentTarget.style.transform = 'scale(1.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#C3C8CD'; e.currentTarget.style.transform = 'scale(1)'; }} style={{ width: `${ROW_H - V_GUTTER}px`, height: `${ROW_H - V_GUTTER}px`, border: 'none', background: 'transparent', color: '#C3C8CD', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s ease, transform 0.15s ease' }}><ChevronUp size={19.64655} strokeWidth={2.5} /></button>
              </div>
            </div>
          </div>

          {/* Col 4: fila 1 buida · fila 2 = "TOT PLEGAT FA" + X + preu (flush dret) */}
          <div style={{ ...colBg, display: 'grid', gridTemplateRows: `${ROW_H - V_GUTTER}px ${ROW_H - V_GUTTER}px`, rowGap: `${V_GUTTER}px`, padding: 0, justifyItems: 'end',  }}>
            <div />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${-0.5 * ROW_H}px)` }}>
              {/* A la vertical la columna es estreta (162 px): l'etiqueta
                  oculta no hi pot ocupar lloc i les caselles van justes, si no
                  el preu se'n va mes enlla de la filera i queda tallat. */}
              <div style={{ display: 'grid', gridTemplateColumns: MIDES.gridPreu, alignItems: 'center', columnGap: MIDES.gapCellesPreu }}>
                <span style={{ ...HEAD, fontSize: '10.1871pt', fontWeight: 400, color: '#7D8895', marginRight: isPortraitTablet ? 0 : (isNarrowCart ? '8px' : '24px'), visibility: 'hidden', transform: `translateY(${ROW_H}px)` }}>TOT PLEGAT FA</span>
                <span />
                <button onClick={() => removeItem(i)} onMouseEnter={(e) => { e.currentTarget.style.color = '#475059'; e.currentTarget.querySelector('svg').setAttribute('width', '25.5'); e.currentTarget.querySelector('svg').setAttribute('height', '25.5'); }} onMouseLeave={(e) => { e.currentTarget.style.color = '#000'; e.currentTarget.querySelector('svg').setAttribute('width', '19.64655'); e.currentTarget.querySelector('svg').setAttribute('height', '19.64655'); }} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', color: '#000', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', justifySelf: 'center', // A la vertical, el cubell tambe s'allunya una mica mes del preu.
                  transform: `translate(${MIDES.dxCubell}px, 0.5px)`, transition: 'color 0.15s ease' }}>
                  <Trash2 size={19.64655} strokeWidth={2.5} />
                </button>
                {(() => {
                  const unit = parseFloat(String(item.price).replace('€','').replace(/\s/g,'').replace(',','.'));
                  const total = Number.isNaN(unit) ? null : (unit * (item.qty || 1)).toFixed(2);
                  const [intPart, decPart] = total ? total.split('.') : ['', ''];
                  const priceStyle = { ...HEAD, fontSize: '14.553pt', fontWeight: 350, color: '#474F59', letterSpacing: '0.6px' };
                  // A la vertical, el preu no s'ha d'acostar a la paperera: la
                  // seva casella ja va a la dreta del tot. El -12px hi feia que
                  // el cubell d'esborrar toques el preu.
                  const priceColumnOffsetX = MIDES.dxPreu;
                  if (!total) return <><span style={{ ...priceStyle, justifySelf: 'end' }}>{item.price}</span><span /></>;
                  return (
                    <>
                      <span style={{ ...priceStyle, justifySelf: 'end', whiteSpace: 'nowrap', transform: `translateX(${priceColumnOffsetX})` }}>{intPart},</span>
                      <span style={{ ...priceStyle, justifySelf: 'start', whiteSpace: 'nowrap', marginLeft: MIDES.margeDecimal, transform: `translateX(${priceColumnOffsetX})` }}>{decPart}€</span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
        </div>
        );
      })}
      </div>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: '#E6E8EC',
        pointerEvents: 'none',
        zIndex: 3,
      }} />
      </div>

      {/* Taula del cistell — estructura de referència (sense color), sota les línies */}
      <div style={{
        position: 'absolute',
        top: `${TOP_OFFSET}px`,
        left: `calc(50% - ${TABLE_WIDTH / 2}px)`,
        width: `${TABLE_WIDTH + COL4_EXTRA}px`,
        zIndex: 0,
        display: 'none',
      }}>
        <table style={{
          tableLayout: 'fixed',
          borderCollapse: 'separate',
          borderSpacing: `${SLIDE_GAP}px ${V_GUTTER}px`,
          marginLeft: `-${SLIDE_GAP}px`,
          marginTop: `-${V_GUTTER}px`,
          width: `${3 * COL2 + COL3 + 5 * SLIDE_GAP}px`,
        }}>
          <colgroup>
            <col style={{ width: `${COL2}px` }} />
            <col style={{ width: `${COL2}px` }} />
            <col style={{ width: `${COL2}px` }} />
            <col style={{ width: `${COL3}px` }} />
          </colgroup>
          <tbody>
            {Array.from({ length: ROWS }).map((_, r) => (
              <tr key={r} style={{ height: `${ROW_H - V_GUTTER}px` }}>
                {Array.from({ length: 4 }).map((__, c) => (
                  <td key={c} style={{
                    height: `${ROW_H - V_GUTTER}px`,
                    padding: 0,
                    boxSizing: 'border-box',
                    backgroundColor: 'rgba(222, 223, 225, 0.35)',
                  }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DEBUG — rectangles a les columnes per les files 16-19 */}
      {(() => {
        const topY = TOP_OFFSET + (16 - 1) * ROW_H;
        const heightY = 4 * ROW_H - V_GUTTER;
        const colLefts = [
          0,
          COL2 + SLIDE_GAP,
          2 * (COL2 + SLIDE_GAP),
          3 * (COL2 + SLIDE_GAP),
        ];
        const colWidths = [COL2, COL2, COL2, COL3];
        return (
          <div style={{
            position: 'absolute',
            top: `${topY}px`,
            left: `calc(50% - ${TABLE_WIDTH / 2}px + ${SLIDE_OFFSET_X}px)`,
            width: `${TABLE_WIDTH + COL4_EXTRA}px`,
            height: `${heightY}px`,
            zIndex: 5,
            pointerEvents: 'none',
            display: 'none',
          }}>
            {colLefts.map((left, idx) => (
              <div key={idx} style={{
                position: 'absolute',
                left: `${left}px`,
                top: 0,
                width: `${colWidths[idx]}px`,
                height: '100%',
                border: '1px dashed #DEDFE1',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(222, 223, 225, 0.25)',
              }} />
            ))}
          </div>
        );
      })()}

      {/* Botonera central (REVERTEIX / CANCEL·LA / DESA) — alineada amb l'última fila de la taula */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '50%',
        transform: 'translate(-50%, 0px)',
        width: `${TABLE_WIDTH}px`,
        display: 'grid',
        visibility: 'hidden',
        gridTemplateColumns: 'repeat(4, 1fr)',
        columnGap: `${GUTTER}px`,
        zIndex: 4,
      }}>
        {!isEmpty && (() => {
          const itemTotal = CART_ITEMS.reduce((acc, it) => {
            const unit = parseFloat(String(it.price).replace('€','').replace(/\s/g,'').replace(',','.'));
            if (Number.isNaN(unit)) return acc;
            return acc + unit * (it.qty || 1);
          }, 0);
          const fmt = (n) => n.toFixed(2).replace('.', ',') + '€';
          const renderOverlay = (orientation) => {
            const isPortrait = orientation === 'portrait';
            return createPortal((
              <div style={{
                // Fins que no hi ha mesura, el bloc no es veu: si no, sortia a la
                // meitat de la pantalla i tot seguit saltava a lloc seu.
                visibility: overlayTop != null && overlayLeft != null ? 'visible' : 'hidden',
                position: 'fixed',
                // El bloc va fix al fons de la pestanya: la seva vora inferior
                // queda OVERLAY_MARGE px per sobre del fons del megaslide.
                top: overlayTop != null ? `${overlayTop - OVERLAY_MARGE}px` : '50%',
                // El bloc va centrat sobre l'ultima filera del cistell (i, amb
                // el contenidor dins la pantalla, sobre el centre d'aquesta).
                // Abans hi havia un `- 106` propi de la vertical que el
                // desplaçava.
                left: overlayLeft != null ? `${overlayLeft + 5}px` : 'calc(50vw + 5px)',
                transform: 'translate(-50%, -100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '6px 16px',
                backgroundColor: 'rgba(244, 246, 248, 0.95)',
                borderRadius: '6px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                zIndex: 10000,
                pointerEvents: 'auto',
                whiteSpace: 'nowrap',
              }}>
                <span style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 300,
                  fontSize: '11pt',
                  color: '#475059',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  Tot plegat fa
                </span>
                <span style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 500,
                  fontSize: '13pt',
                  color: '#111827',
                  whiteSpace: 'nowrap',
                }}>
                  {fmt(itemTotal)}
                </span>
                {/* El botó només hi és mentre no s'hagi passat pel pagament. Un
                    cop s'ha clicat (i per tant ja som a /checkout), desapareix:
                    la pàgina de pagament és al darrere del cistell i es veu
                    tota l'estona, així que la fletxa no hi porta enlloc. El
                    preu, en canvi, es queda: és l'únic lloc on el cistell diu
                    quant suma tot plegat. */}
                {!isOnCheckoutRoute && (
                  <button
                    onClick={handleFinalizeOrder}
                    aria-label="Finalitza la comanda"
                    style={{
                      fontFamily: 'Oswald, sans-serif',
                      fontWeight: 500,
                      fontSize: '11pt',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                      color: '#F4F6F8',
                      backgroundColor: '#474F59',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      padding: '6px 16px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    FINALITZA LA COMANDA
                  </button>
                )}
              </div>
            ), document.body);
          };
          return (
            <>
              {isPortraitTablet && renderOverlay('portrait')}
              {isLandscapeTablet && renderOverlay('landscape')}
              {!isTablet && renderOverlay('desktop')}
            </>
          );
        })()}
        <div style={{
          gridColumn: '2 / span 2',
          height: `${2 * ROW_H - V_GUTTER - 10}px`,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: `${GUTTER}px`,
          justifyItems: 'center',
        }}>
          {/* Aqui hi havia un boto invisible ("FINALITZA LA COMANDA") que
              nome s servia de marca de mesura per col·locar el bloc flotant del
              total. Ara el bloc es mesura des de l'ultima fila visible, aixi que
              el boto ja no cal. La cel·la es queda: forma part de la graella i
              treure-la canviaria l'alcada del panell. */}
        </div>
      </div>
      </>
      )}
    </>
  );
}

export default CistellComandaContent;
