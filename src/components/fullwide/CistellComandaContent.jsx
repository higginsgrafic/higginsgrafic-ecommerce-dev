import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft, X, Trash2, Plus } from 'lucide-react';
import { useShippingCosts } from '@/hooks/useShippingCosts';
import { drawingStripePath } from '@/lib/drawingPaths';

function CistellComandaContent({ cartItems, setCartItems, onCloseMegaSlide, onFinalizeOrder }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Si l'usuari ja es troba a /checkout i obre el cistell del mega-slide,
  // el botó "FINALITZA LA COMANDA" no té sentit (ja hi és). En el seu lloc
  // mostrem una fletxa que tanca el mega-slide per tornar al checkout.
  const isOnCheckoutRoute = location?.pathname === '/checkout';
  const ROW_H = 23.867;        // alçada d'una fila de la pauta
  const GUTTER = 5.457;        // gutter horitzontal entre columnes
  const V_GUTTER = 2.037;      // gutter vertical entre files
  const TOP_OFFSET = 0; // al contenidor del carrusel la llista comença a dalt
  const COLS = 4;
  const ROWS = 21;
  const TABLE_WIDTH = 1350;
  const COL_WIDTH = (TABLE_WIDTH - GUTTER * (COLS - 1)) / COLS; // 322.875px

  // Pauta del CARRUSEL — VALORS MANUALS EDITABLES:
  //   SLOT_W   → amplada d'una targeta del carrusel (px)
  //   SLIDE_GAP→ separaci\u00f3 entre slots (px) — igual que el carrusel
  //   SLIDE_OFFSET_X → desplaçament horitzontal del grid del cistell respecte
  //     a la seva posici\u00f3 natural (per quadrar amb el carrusel). Pot ser
  //     positiu (cap a la dreta) o negatiu (cap a l'esquerra).
  const SLOT_W = 144 + 11;
  const SLIDE_GAP = 3;
  const SLIDE_OFFSET_X = 0;
  const SLIDE_SLOTS = 9; // 9 slots originals; en renderitzem SLIDE_SLOTS - 1 = 8.
  // Columnes: 2+2+2+(2 + porci\u00f3 visible del 9\u00e8 slot).
  const COL2 = SLOT_W * 2 + SLIDE_GAP;
  // Amplada del contenidor del cistell = TABLE_WIDTH (= viewport de la slide).
  const COL4_EXTRA = 0;
  const CART_VIEWPORT = TABLE_WIDTH + COL4_EXTRA;
  // Col 4 ocupa la resta del viewport (TABLE_WIDTH - 3 cols - 3 gaps).
  const COL3 = CART_VIEWPORT - 3 * COL2 - 3 * SLIDE_GAP;
  // Col 1 i Col 4 simètriques: 2*COL_OUTER + 2*COL2 + 3*SLIDE_GAP = CART_VIEWPORT
  const COL_OUTER = (CART_VIEWPORT - 2 * COL2 - 3 * SLIDE_GAP) / 2;

  const TSHIRT_BASE = '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_';
  const TSHIRT_SUFFIX = '_gpr-4-0_front.png';
  const tshirtSrc = (color) => `${TSHIRT_BASE}${color}${TSHIRT_SUFFIX}`;


  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const CART_ITEMS = cartItems;

  // Scroll vertical intern (sense barra) — patró del /checkout:
  // Scroll DISCRET per fila. Les imatges de fons es queden fixes a
  // rowIndex 0..N i només canvia el contingut (text, samarretes,
  // dibuixos) que hi apareix a sobre quan l'usuari fa scroll.
  const FIRST_VIEWPORT_ROW = 0;
  const LAST_VIEWPORT_ROW = 14;
  // Cada ítem ocupa 2 files de contingut (sense fila buida de separació).
  const ITEM_STRIDE = 2 * ROW_H - 4;
  const VISIBLE_HEIGHT = (LAST_VIEWPORT_ROW - FIRST_VIEWPORT_ROW) * ROW_H - V_GUTTER;
  const VISIBLE_ITEMS = Math.max(1, Math.floor((VISIBLE_HEIGHT + V_GUTTER) / ITEM_STRIDE));
  const [scrollRow, setScrollRow] = useState(0);
  const maxScrollRow = Math.max(0, CART_ITEMS.length - VISIBLE_ITEMS);
  const handleCartWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const direction = e.deltaY > 0 ? 1 : -1;
    setScrollRow(prev => Math.max(0, Math.min(maxScrollRow, prev + direction)));
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
  const META = { fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 400, color: '#7D8895' };
  const VAL  = { fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 500, color: '#475059' };

  const { zoneInfo } = useShippingCosts('es_peninsula');

  const isEmpty = CART_ITEMS.length === 0;

  return (
    <>
      {isEmpty ? (
        <div style={{
          position: 'absolute',
          top: `${TOP_OFFSET}px`,
          left: `calc(50% - ${TABLE_WIDTH / 2}px)`,
          width: `${TABLE_WIDTH + COL4_EXTRA}px`,
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
        onWheel={handleCartWheel}
        style={{
          position: 'absolute',
          top: `${TOP_OFFSET}px`,
          left: `calc(50% - ${TABLE_WIDTH / 2}px)`,
          width: `${TABLE_WIDTH + COL4_EXTRA}px`,
          height: `${VISIBLE_HEIGHT}px`,
          overflow: 'hidden',
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
        const colBg = { backgroundColor: 'transparent', height: '100%', boxSizing: 'border-box' };
        return (
        <div key={i} className="cart-row" style={{
          position: 'absolute',
          top: `${rowIndex * ITEM_STRIDE}px`,
          left: `${SLIDE_OFFSET_X}px`,
          width: `${TABLE_WIDTH + COL4_EXTRA}px`,
          height: `${2 * ROW_H - V_GUTTER - 2}px`,
          display: 'grid',
          gridTemplateColumns: `${COL_OUTER}px ${COL2}px ${COL2}px ${COL_OUTER}px`,
          columnGap: `${SLIDE_GAP}px`,
          alignItems: 'stretch',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${encodeURI('/placeholders/tots_els_fons/fons_acordio/fons-cistell-compra.png')}")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            backgroundSize: `${TABLE_WIDTH + COL4_EXTRA}px auto`,
            transform: rowIndex % 2 === 0 ? 'scaleX(-1)' : 'none',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: `${COL_OUTER}px ${COL2}px ${COL2}px ${COL_OUTER}px`,
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
          <div style={{ ...colBg, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, overflow: 'hidden', padding: '0 4px',  }}>
            <div style={{ ...HEAD, fontSize: '11.6424pt', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.title}
            </div>
            <div style={{ ...META, fontSize: '8.7318pt', fontWeight: 300, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.collection}
            </div>
          </div>

          {/* Col 3: QUANTITAT + TALLATGE (cadascun centrat amb el slot del carrusel del damunt) */}
          <div style={{ ...colBg, display: 'grid', gridTemplateColumns: `${SLOT_W}px ${SLOT_W}px`, gridTemplateRows: `${ROW_H - V_GUTTER}px ${ROW_H - V_GUTTER}px`, columnGap: `${SLIDE_GAP}px`, rowGap: `${V_GUTTER}px`, alignItems: 'center', justifyItems: 'center',  }}>
            <div style={{ gridRow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', transform: `translateY(${-0.5 * ROW_H}px)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', ...VAL, fontSize: '11.6424pt' }}>
                <button onClick={() => changeQty(i, -1)} onMouseEnter={(e) => { e.currentTarget.style.color = '#475059'; e.currentTarget.style.fontSize = '12pt'; e.currentTarget.style.transform = 'scale(1.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#C3C8CD'; e.currentTarget.style.fontSize = '8.7318pt'; e.currentTarget.style.transform = 'scale(1)'; }} style={{ width: `${(ROW_H - V_GUTTER) * 1.25}px`, height: `${(ROW_H - V_GUTTER) * 1.25}px`, border: '1px solid #C9D0D9', borderRadius: '50%', backgroundColor: 'transparent', color: '#C3C8CD', cursor: 'pointer', fontSize: '8.7318pt', lineHeight: 1, padding: 0, transition: 'color 0.15s ease, transform 0.15s ease, font-size 0.15s ease' }}>−</button>
                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
                <button onClick={() => changeQty(i, +1)} onMouseEnter={(e) => { e.currentTarget.style.color = '#475059'; e.currentTarget.style.fontSize = '12pt'; e.currentTarget.style.transform = 'scale(1.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#C3C8CD'; e.currentTarget.style.fontSize = '8.7318pt'; e.currentTarget.style.transform = 'scale(1)'; }} style={{ width: `${(ROW_H - V_GUTTER) * 1.25}px`, height: `${(ROW_H - V_GUTTER) * 1.25}px`, border: '1px solid #C9D0D9', borderRadius: '50%', backgroundColor: 'transparent', color: '#C3C8CD', cursor: 'pointer', fontSize: '8.7318pt', lineHeight: 1, padding: 0, transition: 'color 0.15s ease, transform 0.15s ease, font-size 0.15s ease' }}>+</button>
              </div>
            </div>
            <div style={{ gridRow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', transform: `translate(23px, ${-0.5 * ROW_H}px)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', ...VAL, fontSize: '11.6424pt' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 40px 40px 70px 70px', alignItems: 'center', columnGap: '8px' }}>
                <span style={{ ...HEAD, fontSize: '10.1871pt', fontWeight: 400, color: '#7D8895', marginRight: '24px', visibility: 'hidden', transform: `translateY(${ROW_H}px)` }}>TOT PLEGAT FA</span>
                <span />
                <button onClick={() => removeItem(i)} onMouseEnter={(e) => { e.currentTarget.style.color = '#475059'; e.currentTarget.querySelector('svg').setAttribute('width', '25.5'); e.currentTarget.querySelector('svg').setAttribute('height', '25.5'); }} onMouseLeave={(e) => { e.currentTarget.style.color = '#000'; e.currentTarget.querySelector('svg').setAttribute('width', '19.64655'); e.currentTarget.querySelector('svg').setAttribute('height', '19.64655'); }} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', color: '#000', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', justifySelf: 'center', transform: 'translate(-20px, 0.5px)', transition: 'color 0.15s ease' }}>
                  <Trash2 size={19.64655} strokeWidth={2.5} />
                </button>
                {(() => {
                  const unit = parseFloat(String(item.price).replace('€','').replace(/\s/g,'').replace(',','.'));
                  const total = Number.isNaN(unit) ? null : (unit * (item.qty || 1)).toFixed(2);
                  const [intPart, decPart] = total ? total.split('.') : ['', ''];
                  const priceStyle = { ...HEAD, fontSize: '14.553pt', fontWeight: 350, color: '#474F59', letterSpacing: '0.6px' };
                  const priceColumnOffsetX = '-36px';
                  if (!total) return <><span style={{ ...priceStyle, justifySelf: 'end' }}>{item.price}</span><span /></>;
                  return (
                    <>
                      <span style={{ ...priceStyle, justifySelf: 'end', whiteSpace: 'nowrap', transform: `translateX(${priceColumnOffsetX})` }}>{intPart},</span>
                      <span style={{ ...priceStyle, justifySelf: 'start', whiteSpace: 'nowrap', marginLeft: '-8px', transform: `translateX(${priceColumnOffsetX})` }}>{decPart}€</span>
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

      {/* Totals — SUBTOTAL / TRANSPORT / IVA / TOTAL, just a sobre de la botonera */}
      {(() => {
        const totalQty = CART_ITEMS.reduce((acc, it) => acc + (it.qty || 1), 0);
        const itemTotal = CART_ITEMS.reduce((acc, it) => {
          const unit = parseFloat(String(it.price).replace('€','').replace(/\s/g,'').replace(',','.'));
          if (Number.isNaN(unit)) return acc;
          return acc + unit * (it.qty || 1);
        }, 0);
        const transport = zoneInfo.cost;
        const grossTotal = itemTotal;
        const baseImponible = (grossTotal - transport) / 1.21;
        const iva = (grossTotal - transport) - baseImponible;
        const subtotal = baseImponible;
        const fmt = (n) => n.toFixed(2).replace('.', ',') + '€';
        // Només mostrem TOT PLEGAT FA. SUBTOTAL/TRANSPORT/IVA
        // s'han eliminat per alliberar 2 files que ara ocupa la
        // llista d'ítems del cistell.
        const rows = [
          { label: 'TOT PLEGAT FA', amount: fmt(grossTotal), strong: true  },
        ];
        // Mantenim els valors calculats per si calen més endavant
        // (lint-friendly: marquem-los com a usats).
        void subtotal; void transport; void iva;
        // Fila 19 de la pauta (1-indexada), contingut només a la col 4.
        const TOTALS_FIRST_ROW = 12;
        return (
          <>
            <div style={{
              position: 'absolute',
              bottom: `0px`,
              left: `calc(50% - ${TABLE_WIDTH / 2}px + ${SLIDE_OFFSET_X}px)`,
              width: `${TABLE_WIDTH + COL4_EXTRA}px`,
              height: `${rows.length * 2 * ROW_H - V_GUTTER - 3}px`,
              background: 'linear-gradient(90deg, transparent 0%, #F0F2F5 100%)',
              transform: 'none',
              pointerEvents: 'none',
              zIndex: 1,
            }} />
            {rows.map((r, k) => {
          const rowBottom = (rows.length - 1 - k) * ROW_H;
          const [intPart, decPart] = r.amount.replace('€','').split(',');
          const labelStyle = {
            fontFamily: 'Oswald, sans-serif',
            fontWeight: r.strong ? 200 : 300,
            fontSize: r.strong ? '14.553pt' : '13.0977pt',
            color: r.strong ? '#474F59' : '#99A3B5',
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            lineHeight: 1,
          };
          const amountStyle = {
            fontFamily: 'Oswald, sans-serif',
            fontWeight: r.strong ? 400 : 200,
            fontSize: r.strong ? '16.0083pt' : '13.0977pt',
            color: r.strong ? '#474F59' : '#99A3B5',
            letterSpacing: '0.6px',
            whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum" 1',
            lineHeight: 1,
            textDecoration: r.label === 'TRANSPORT' ? 'line-through' : 'none',
            textDecorationColor: r.label === 'TRANSPORT' ? '#475059' : undefined,
            textDecorationThickness: r.label === 'TRANSPORT' ? '1.5px' : undefined,
          };
          return (
            <div key={r.label} style={{
              position: 'absolute',
              bottom: `${rowBottom}px`,
              left: `calc(50% - ${TABLE_WIDTH / 2}px + ${SLIDE_OFFSET_X}px)`,
              width: `${TABLE_WIDTH + COL4_EXTRA}px`,
              height: `${2 * ROW_H - V_GUTTER}px`,
              display: 'grid',
              gridTemplateColumns: `${COL_OUTER}px ${COL2}px ${COL2}px ${COL_OUTER}px`,
              columnGap: `${SLIDE_GAP}px`,
              boxSizing: 'border-box',
              zIndex: 2,
            }}>
              <div />
              <div />
              <div style={{ display: 'grid', gridTemplateColumns: `${SLOT_W}px ${SLOT_W}px`, columnGap: `${SLIDE_GAP}px`, alignItems: 'center', justifyItems: 'center' }}>
                {/* L'indicador "N PRODUCTES" s'ha eliminat per
                    petició de l'usuari: la fila de TOT PLEGAT FA
                    queda sola al peu de la llista. */}
                <span />
                <span />
              </div>
              {/* Col 4: mateix patró que la fila de preu de l'ítem */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 40px 40px 70px 70px', alignItems: 'center', columnGap: '8px' }}>
                  <span style={{ position: 'relative', marginRight: '24px', transform: 'translateX(80px)' }}>
                    <span style={{ ...HEAD, fontSize: '10.1871pt', fontWeight: 400, color: '#7D8895', visibility: 'hidden' }}>TOT PLEGAT FA</span>
                    <span style={{ ...labelStyle, position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', textAlign: 'right', whiteSpace: 'nowrap' }}>{r.label}</span>
                  </span>
                  <span />
                  <span />
                  <span style={{ ...amountStyle, justifySelf: 'end', width: '70px', textAlign: 'right', transform: 'translateX(-36px)' }}>{intPart},</span>
                  <span style={{ ...amountStyle, justifySelf: 'start', width: '70px', marginLeft: '-8px', transform: 'translateX(-36px)' }}>{decPart}€</span>
                </div>
              </div>
            </div>
          );
            })}
          </>
        );
      })()}

      {/* Botonera central (REVERTEIX / CANCEL·LA / DESA) — alineada amb l'última fila de la taula */}
      <div style={{
        position: 'absolute',
        bottom: '3px',
        left: '50%',
        transform: 'translate(-50%, 2px)',
        width: `${TABLE_WIDTH}px`,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        columnGap: `${GUTTER}px`,
        zIndex: 4,
      }}>
        <div style={{
          gridColumn: '2 / span 2',
          height: `${2 * ROW_H - V_GUTTER - 5}px`,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: `${GUTTER}px`,
          justifyItems: 'center',
        }}>
          <button
            id="stripe-guide-finalize-order"
            onClick={isOnCheckoutRoute
              ? () => { if (typeof onCloseMegaSlide === 'function') onCloseMegaSlide(); }
              : handleFinalizeOrder}
            aria-label={isOnCheckoutRoute ? 'Torna al checkout' : 'Finalitza la comanda'}
            style={{
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 500,
              fontSize: '14.553pt',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              color: '#F4F6F8',
              backgroundColor: '#474F59',
              border: 'none',
              borderRadius: '3px',
              boxSizing: 'border-box',
              cursor: 'pointer',
              padding: 0,
              height: '100%',
              width: 'calc(100% - 40px)',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isOnCheckoutRoute
              ? <ArrowLeft size={14.553} strokeWidth={1.75} aria-hidden="true" />
              : 'FINALITZA LA COMANDA'}
          </button>
        </div>
      </div>
      </>
      )}
    </>
  );
}

export default CistellComandaContent;
