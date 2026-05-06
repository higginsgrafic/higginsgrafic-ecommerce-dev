import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

function CistellComandaContent({ cartItems, setCartItems }) {
  const navigate = useNavigate();
  const ROW_H = 32.8;          // alçada d'una fila de la pauta
  const GUTTER = 7.5;          // gutter horitzontal entre columnes
  const V_GUTTER = 2.8;        // gutter vertical entre files
  const TOP_OFFSET = 1.5 * ROW_H; // la taula comença a la 2a fila + mitja fila d'ajust
  const COLS = 4;
  const ROWS = 21;
  const TABLE_WIDTH = 1365.46;
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

  const TSHIRT_BASE = '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_';
  const TSHIRT_SUFFIX = '_gpr-4-0_front.png';
  const tshirtSrc = (color) => `${TSHIRT_BASE}${color}${TSHIRT_SUFFIX}`;

  const DRAWING_BASE = '/custom_logos/drawings/images_stripe/';

  const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const CART_ITEMS = cartItems;

  // Scroll vertical intern (sense barra)
  // El viewport comença a la fila `FIRST_VIEWPORT_ROW` (= TOP_OFFSET/ROW_H)
  // i acaba a la fila `LAST_VIEWPORT_ROW` de la pauta.
  const FIRST_VIEWPORT_ROW = 1.5;
  const LAST_VIEWPORT_ROW = 15.5;
  // Cada ítem ocupa 2 files de contingut (sense fila buida de separació).
  const ITEM_STRIDE = 2 * ROW_H;
  const VISIBLE_HEIGHT = (LAST_VIEWPORT_ROW - FIRST_VIEWPORT_ROW) * ROW_H - V_GUTTER;
  const CONTENT_HEIGHT = CART_ITEMS.length * ITEM_STRIDE - V_GUTTER;
  const MAX_SCROLL = Math.max(0, CONTENT_HEIGHT - VISIBLE_HEIGHT);
  const [scrollY, setScrollY] = useState(0);
  const handleCartWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setScrollY(prev => Math.max(0, Math.min(MAX_SCROLL, prev + e.deltaY)));
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
      const target = prev[idx];
      if (!target) return prev;
      // 1r clic: desactiva (grayscale). 2n clic: esborra definitivament.
      if (!target.disabled) {
        return prev.map((it, j) => j === idx ? { ...it, disabled: true } : it);
      }
      const next = prev.filter((_, j) => j !== idx);
      const newContent = next.length * ITEM_STRIDE - V_GUTTER;
      const newMax = Math.max(0, newContent - VISIBLE_HEIGHT);
      setScrollY(s => Math.min(s, newMax));
      return next;
    });
  };
  const handleFinalizeOrder = () => {
    const checkoutItems = CART_ITEMS
      .filter((item) => !item.disabled)
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

  return (
    <>
      {/* PAUTA-VERDA — referència (amagada) */}
      {false && <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/tmp/PAUTES/PAUTA-GENERAL.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 -1px',
        backgroundSize: '1365.46px 737.015px',
        opacity: 0.03,
        zIndex: 1,
        pointerEvents: 'none',
      }} />}

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
        height: `${CONTENT_HEIGHT}px`,
        transform: `translateY(${-scrollY}px)`,
        transition: 'transform 0.08s linear',
      }}>
      {CART_ITEMS.map((item, i) => {
        const colBg = { backgroundColor: 'transparent', height: '100%', boxSizing: 'border-box' };
        return (
        <div key={i} style={{
          position: 'absolute',
          top: `${i * ITEM_STRIDE}px`,
          left: `${SLIDE_OFFSET_X}px`,
          width: `${TABLE_WIDTH + COL4_EXTRA}px`,
          height: `${2 * ROW_H - V_GUTTER}px`,
          display: 'grid',
          gridTemplateColumns: `${COL2}px ${COL2}px ${COL2}px ${COL3}px`,
          columnGap: `${SLIDE_GAP}px`,
          alignItems: 'stretch',
          overflow: 'hidden',
          filter: item.disabled ? 'grayscale(100%)' : 'none',
          opacity: item.disabled ? 0.5 : 1,
          transition: 'filter 0.3s ease, opacity 0.3s ease',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${encodeURI('/placeholders/fons_acordio/fons-cistell-compra.png')}")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            backgroundSize: `${TABLE_WIDTH + COL4_EXTRA}px auto`,
            transform: i % 2 === 0 ? 'scaleX(-1)' : 'none',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: `${COL2}px ${COL2}px ${COL2}px ${COL3}px`,
            columnGap: `${SLIDE_GAP}px`,
            alignItems: 'stretch',
            width: '100%',
            height: '100%',
          }}>
          {/* Col 1: samarreta + dibuix (cadascú centrat amb el slot del carrusel del damunt) */}
          <div style={{ ...colBg, position: 'relative', display: 'grid', gridTemplateColumns: `${SLOT_W}px ${SLOT_W}px`, columnGap: `${SLIDE_GAP}px`, alignItems: 'center', justifyItems: 'center', padding: 0, minWidth: 0, overflow: 'hidden' }}>
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
                src={`${DRAWING_BASE}${item.drawing}`}
                alt={item.title}
                style={{ width: item.title === 'NCC-1701-D' ? '54.45%' : '72.6%', height: item.title === 'NCC-1701-D' ? '54.45%' : '72.6%', objectFit: 'contain', display: 'block', transform: item.title === 'ROBBIE THE ROBOT' ? 'translateY(1px)' : undefined }}
              />
            </div>
            <svg
              viewBox="0 0 24 24"
              width={(2 * ROW_H - V_GUTTER) * 0.5625}
              height={(2 * ROW_H - V_GUTTER) * 0.5625}
              style={{ position: 'absolute', left: '50%', top: `${(2 * ROW_H - V_GUTTER) / 2}px`, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}
              aria-hidden="true"
            >
              <line x1="12" y1="3" x2="12" y2="21" stroke="#7D8895" strokeWidth="1" strokeLinecap="butt" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="#7D8895" strokeWidth="1" strokeLinecap="butt" />
            </svg>
          </div>

          {/* Col 2: títol + col·lecció */}
          <div style={{ ...colBg, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, overflow: 'hidden', padding: '0 4px' }}>
            <div style={{ ...HEAD, fontSize: '16pt', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.title}
            </div>
            <div style={{ ...META, fontSize: '12pt', fontWeight: 300, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.collection}
            </div>
          </div>

          {/* Col 3: QUANTITAT + TALLATGE (cadascun centrat amb el slot del carrusel del damunt) */}
          <div style={{ ...colBg, display: 'grid', gridTemplateColumns: `${SLOT_W}px ${SLOT_W}px`, gridTemplateRows: `${ROW_H - V_GUTTER}px ${ROW_H - V_GUTTER}px`, columnGap: `${SLIDE_GAP}px`, rowGap: `${V_GUTTER}px`, alignItems: 'center', justifyItems: 'center' }}>
            <div style={{ gridRow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', transform: `translateY(${-0.5 * ROW_H}px)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', ...VAL, fontSize: '16pt' }}>
                <button onClick={() => changeQty(i, -1)} style={{ width: `${ROW_H - V_GUTTER}px`, height: `${ROW_H - V_GUTTER}px`, border: '1px solid #C9D0D9', backgroundColor: 'transparent', color: '#475059', cursor: 'pointer', fontSize: '12pt', lineHeight: 1, padding: 0 }}>−</button>
                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
                <button onClick={() => changeQty(i, +1)} style={{ width: `${ROW_H - V_GUTTER}px`, height: `${ROW_H - V_GUTTER}px`, border: '1px solid #C9D0D9', backgroundColor: 'transparent', color: '#475059', cursor: 'pointer', fontSize: '12pt', lineHeight: 1, padding: 0 }}>+</button>
              </div>
            </div>
            <div style={{ gridRow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', transform: `translateY(${-0.5 * ROW_H}px)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', ...VAL, fontSize: '16pt' }}>
                <button onClick={() => changeSize(i, -1)} style={{ width: `${ROW_H - V_GUTTER}px`, height: `${ROW_H - V_GUTTER}px`, border: 'none', background: 'transparent', color: '#7D8895', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={ROW_H - V_GUTTER} strokeWidth={1} /></button>
                <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 600 }}>{item.size}</span>
                <button onClick={() => changeSize(i, +1)} style={{ width: `${ROW_H - V_GUTTER}px`, height: `${ROW_H - V_GUTTER}px`, border: 'none', background: 'transparent', color: '#7D8895', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={ROW_H - V_GUTTER} strokeWidth={1} /></button>
              </div>
            </div>
          </div>

          {/* Col 4: fila 1 buida · fila 2 = "TOT PLEGAT FA" + X + preu (flush dret) */}
          <div style={{ ...colBg, display: 'grid', gridTemplateRows: `${ROW_H - V_GUTTER}px ${ROW_H - V_GUTTER}px`, rowGap: `${V_GUTTER}px`, padding: 0 }}>
            <div />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${-0.5 * ROW_H}px)` }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 40px 70px 70px', alignItems: 'center', columnGap: '8px' }}>
                <span style={{ ...HEAD, fontSize: '14pt', fontWeight: 400, color: '#7D8895', marginRight: '24px', visibility: 'hidden', transform: `translateY(${ROW_H}px)` }}>TOT PLEGAT FA</span>
                <button onClick={() => removeItem(i)} onMouseEnter={(e) => { e.currentTarget.style.color = '#D04B4B'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#C3C8CD'; }} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', color: '#C3C8CD', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', justifySelf: 'center', transform: 'translate(-15px, 0.5px)', transition: 'color 0.15s ease' }}>
                  <X size={36} strokeWidth={2} />
                </button>
                {(() => {
                  const unit = parseFloat(String(item.price).replace('€','').replace(/\s/g,'').replace(',','.'));
                  const total = Number.isNaN(unit) ? null : (unit * (item.qty || 1)).toFixed(2);
                  const [intPart, decPart] = total ? total.split('.') : ['', ''];
                  const priceStyle = { ...HEAD, fontSize: '20pt', fontWeight: 350, color: '#474F59', letterSpacing: '0.6px' };
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
        background: 'rgba(71, 80, 89, 0.18)',
        pointerEvents: 'none',
        zIndex: 3,
      }} />
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '1px',
        background: 'rgba(71, 80, 89, 0.18)',
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
                    backgroundColor: 'rgba(208, 75, 75, 0.08)',
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
                border: '1px dashed #D04B4B',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(208, 75, 75, 0.06)',
              }} />
            ))}
          </div>
        );
      })()}

      {/* Totals — SUBTOTAL / TRANSPORT / IVA / TOTAL, just a sobre de la botonera */}
      {(() => {
        const activeItems = CART_ITEMS.filter(it => !it.disabled);
        const totalQty = activeItems.reduce((acc, it) => acc + (it.qty || 1), 0);
        const subtotal = activeItems.reduce((acc, it) => {
          const unit = parseFloat(String(it.price).replace('€','').replace(/\s/g,'').replace(',','.'));
          if (Number.isNaN(unit)) return acc;
          return acc + unit * (it.qty || 1);
        }, 0);
        const transport = 4.95;
        const grossTotal = subtotal;
        const iva = subtotal * 0.21;
        const fmt = (n) => n.toFixed(2).replace('.', ',') + '€';
        const rows = [
          { label: 'SUBTOTAL',      amount: fmt(subtotal),   strong: false },
          { label: 'TRANSPORT',     amount: fmt(transport),  strong: false },
          { label: 'IVA 21%',       amount: fmt(iva),        strong: false },
          { label: 'TOT PLEGAT FA', amount: fmt(grossTotal), strong: true  },
        ];
        // Files 16-19 de la pauta (1-indexades), contingut només a la col 4.
        const TOTALS_FIRST_ROW = 16;
        return (
          <>
            <div style={{
              position: 'absolute',
              top: `${TOP_OFFSET + (TOTALS_FIRST_ROW - 1) * ROW_H}px`,
              left: `calc(50% - ${TABLE_WIDTH / 2}px + ${SLIDE_OFFSET_X}px)`,
              width: `${TABLE_WIDTH + COL4_EXTRA}px`,
              height: `${rows.length * ROW_H - V_GUTTER}px`,
              backgroundImage: `url("${encodeURI('/placeholders/fons_acordio/fons-cistell-compra.png')}")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center top',
              backgroundSize: `${TABLE_WIDTH}px 100%`,
              transform: 'none',
              pointerEvents: 'none',
              zIndex: 1,
            }} />
            {rows.map((r, k) => {
          const rowTop = TOP_OFFSET + (TOTALS_FIRST_ROW - 1 + k) * ROW_H;
          const [intPart, decPart] = r.amount.replace('€','').split(',');
          const labelStyle = {
            fontFamily: 'Oswald, sans-serif',
            fontWeight: r.strong ? 200 : 300,
            fontSize: r.strong ? '20pt' : '18pt',
            color: r.strong ? '#474F59' : '#99A3B5',
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            lineHeight: 1,
          };
          const amountStyle = {
            fontFamily: 'Oswald, sans-serif',
            fontWeight: r.strong ? 400 : 200,
            fontSize: r.strong ? '22pt' : '18pt',
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
              top: `${rowTop}px`,
              left: `calc(50% - ${TABLE_WIDTH / 2}px + ${SLIDE_OFFSET_X}px)`,
              width: `${TABLE_WIDTH + COL4_EXTRA}px`,
              height: `${ROW_H - V_GUTTER}px`,
              display: 'grid',
              gridTemplateColumns: `${COL2}px ${COL2}px ${COL2}px ${COL3}px`,
              columnGap: `${SLIDE_GAP}px`,
              boxSizing: 'border-box',
              zIndex: 2,
            }}>
              <div />
              <div />
              <div style={{ display: 'grid', gridTemplateColumns: `${SLOT_W}px ${SLOT_W}px`, columnGap: `${SLIDE_GAP}px`, alignItems: 'center', justifyItems: 'center' }}>
                {k === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '100%', transform: `translateY(${1.5 * ROW_H}px)` }}>
                    <span style={{ ...VAL, fontSize: '16pt', fontWeight: 600, color: '#475059', minWidth: '20px', textAlign: 'center', lineHeight: 1 }}>{totalQty}</span>
                    <span style={{ ...HEAD, fontSize: '14pt', fontWeight: 300, color: '#99A3B5', lineHeight: 1 }}>PRODUCTES</span>
                  </div>
                )}
                <span />
              </div>
              {/* Col 4: mateix patró que la fila de preu de l'ítem */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 40px 70px 70px', alignItems: 'center', columnGap: '8px' }}>
                  <span style={{ position: 'relative', marginRight: '24px' }}>
                    <span style={{ ...HEAD, fontSize: '14pt', fontWeight: 400, color: '#7D8895', visibility: 'hidden' }}>TOT PLEGAT FA</span>
                    <span style={{ ...labelStyle, position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', textAlign: 'right', whiteSpace: 'nowrap' }}>{r.label}</span>
                  </span>
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
        top: `${TOP_OFFSET + (ROWS - 1) * ROW_H}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${TABLE_WIDTH}px`,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        columnGap: `${GUTTER}px`,
        zIndex: 4,
      }}>
        <div style={{
          gridColumn: '2 / span 2',
          height: `${ROW_H - V_GUTTER}px`,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: `${GUTTER}px`,
        }}>
          {['FINALITZA LA COMANDA'].map((label) => (
            <button id="stripe-guide-finalize-order" key={label} onClick={handleFinalizeOrder} style={{
              fontFamily: 'Roboto Condensed, sans-serif',
              fontWeight: 500,
              fontSize: '11pt',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#98A2B4',
              backgroundColor: '#F4F6F8',
              border: 'none',
              borderRadius: '3px',
              boxSizing: 'border-box',
              cursor: 'pointer',
              padding: 0,
              height: '100%',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default CistellComandaContent;
