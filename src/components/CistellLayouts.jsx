// Tres propostes de layout per al cistell del mega menu
// Layout 1: Vertical compacte (actual)
// Layout 2: Dues columnes
// Layout 3: Amb scroll intern

export const CistellLayout1 = ({ onExpand }) => (
  <>
    {/* Llista de productes */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
      <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600, letterSpacing: '0.02em' }}>WORMHOLE</div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600 }}>19,95€</div>
        </div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.65)', lineHeight: 1.4 }}>Talla L · Qt. 1</div>
      </div>
      <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600, letterSpacing: '0.02em' }}>MASCHINENMENSCH</div>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600 }}>14,95€</div>
        </div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.65)', lineHeight: 1.4 }}>Talla M · Qt. 1</div>
      </div>
    </div>

    {/* Camp descompte */}
    <div style={{ marginBottom: 18, borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 3, padding: '8px 12px', background: '#fff' }}>
        <input type="text" placeholder="Codi descompte" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12, fontFamily: 'Roboto, sans-serif', background: 'transparent' }} />
        <button style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'rgba(0,0,0,0.5)', padding: 0 }}>→</button>
      </div>
    </div>

    {/* Desglossament de preus */}
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 500 }}>Subtotal</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 500 }}>31,57€</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.65)' }}>IVA (21%)</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.65)' }}>3,33€</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '2px solid #000' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>TOTAL</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700 }}>34,90€</div>
      </div>
    </div>

    {/* Botó CTA */}
    <button onClick={onExpand} style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '14px', fontSize: 14, fontFamily: 'Oswald, sans-serif', fontWeight: 700, cursor: 'pointer', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#1a1a1a'} onMouseOut={(e) => e.target.style.background = '#000'}>FINALITZA LA COMPRA</button>
  </>
);

export const CistellLayout2 = ({ onExpand }) => (
  <>
    {/* Layout en dues columnes */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px 24px', marginBottom: 20 }}>
      {/* Producte 1 */}
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600, letterSpacing: '0.02em' }}>WORMHOLE</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600, textAlign: 'right' }}>19,95€</div>
      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.65)', lineHeight: 1.4, paddingBottom: 12, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>L · Qt.1</div>
      <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(0,0,0,0.08)' }}></div>
      
      {/* Producte 2 */}
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600, letterSpacing: '0.02em' }}>MASCHINENMENSCH</div>
      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600, textAlign: 'right' }}>14,95€</div>
      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.65)', lineHeight: 1.4, paddingBottom: 12, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>M · Qt.1</div>
      <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(0,0,0,0.08)' }}></div>
    </div>

    {/* Camp descompte */}
    <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 3, padding: '8px 12px', background: '#fff' }}>
        <input type="text" placeholder="Codi descompte" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12, fontFamily: 'Roboto, sans-serif', background: 'transparent' }} />
        <button style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'rgba(0,0,0,0.5)', padding: 0 }}>→</button>
      </div>
    </div>

    {/* Desglossament en dues columnes */}
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 24px' }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 500 }}>Subtotal</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 500, textAlign: 'right' }}>31,57€</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.65)' }}>IVA (21%)</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.65)', textAlign: 'right' }}>3,33€</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', paddingTop: 10, borderTop: '2px solid #000' }}>TOTAL</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, textAlign: 'right', paddingTop: 10, borderTop: '2px solid #000' }}>34,90€</div>
      </div>
    </div>

    {/* Botó CTA */}
    <button onClick={onExpand} style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '14px', fontSize: 14, fontFamily: 'Oswald, sans-serif', fontWeight: 700, cursor: 'pointer', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#1a1a1a'} onMouseOut={(e) => e.target.style.background = '#000'}>FINALITZA LA COMPRA</button>
  </>
);

export const CistellLayout4 = ({ onExpand }) => (
  <>
    {/* Layout basat en la imatge de referència */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Productes amb miniatura */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Producte 1: WORMHOLE */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 16, paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ width: 80, height: 80, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #000' }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em' }}>cSuNtAcT</div>
            </div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>WORMHOLE</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: 'Roboto, sans-serif' }}>
              <div><span style={{ fontWeight: 600 }}>QUANTITAT</span> 1</div>
              <div><span style={{ fontWeight: 600 }}>TALLATGE</span> L</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button style={{ width: 24, height: 24, border: '1px solid #000', background: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <button style={{ width: 24, height: 24, border: '1px solid #000', background: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700 }}>19,95€</div>
            </div>
          </div>
        </div>

        {/* Producte 2: MASCHINENMENSCH */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 16, paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ width: 80, height: 80, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #000' }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 400, fontStyle: 'italic' }}>The human Inside</div>
            </div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>MASCHINENMENSCH</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: 'Roboto, sans-serif' }}>
              <div><span style={{ fontWeight: 600 }}>QUANTITAT</span> 1</div>
              <div><span style={{ fontWeight: 600 }}>MIDA</span> M</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button style={{ width: 24, height: 24, border: '1px solid #000', background: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <button style={{ width: 24, height: 24, border: '1px solid #000', background: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700 }}>14,95€</div>
            </div>
          </div>
        </div>
      </div>

      {/* Camp descompte */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(0,0,0,0.2)', borderRadius: 2, padding: '10px 12px', background: '#fff' }}>
          <input type="text" placeholder="Targeta regal o codi descompte" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontFamily: 'Roboto, sans-serif', background: 'transparent' }} />
          <button style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#000', padding: 0 }}>→</button>
        </div>
      </div>

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '2px solid #000' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>TOT PLEGAT FA</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 28, fontWeight: 700 }}>34,90€</div>
      </div>

      {/* Botó CTA */}
      <button onClick={onExpand} style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '16px', fontSize: 16, fontFamily: 'Oswald, sans-serif', fontWeight: 400, cursor: 'pointer', borderRadius: 2, textTransform: 'capitalize', letterSpacing: '0.02em', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#1a1a1a'} onMouseOut={(e) => e.target.style.background = '#000'}>Comanda</button>
    </div>
  </>
);

export const CistellLayout3 = ({ onExpand }) => (
  <>
    {/* Llista de productes amb scroll */}
    <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 16, paddingRight: 8 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600, letterSpacing: '0.02em' }}>WORMHOLE</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600 }}>19,95€</div>
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.65)', lineHeight: 1.4 }}>Talla L · Qt. 1</div>
        </div>
        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600, letterSpacing: '0.02em' }}>MASCHINENMENSCH</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, fontWeight: 600 }}>14,95€</div>
          </div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'rgba(0,0,0,0.65)', lineHeight: 1.4 }}>Talla M · Qt. 1</div>
        </div>
      </div>
    </div>

    {/* Camp descompte */}
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 3, padding: '8px 12px', background: '#fff' }}>
        <input type="text" placeholder="Codi descompte" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12, fontFamily: 'Roboto, sans-serif', background: 'transparent' }} />
        <button style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'rgba(0,0,0,0.5)', padding: 0 }}>→</button>
      </div>
    </div>

    {/* Desglossament compacte */}
    <div style={{ marginBottom: 14, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}>Subtotal</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}>31,57€</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11 }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', color: 'rgba(0,0,0,0.65)' }}>IVA (21%)</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', color: 'rgba(0,0,0,0.65)' }}>3,33€</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '2px solid #000' }}>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>TOTAL</div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, fontWeight: 700 }}>34,90€</div>
      </div>
    </div>

    {/* Botó CTA */}
    <button onClick={onExpand} style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '14px', fontSize: 14, fontFamily: 'Oswald, sans-serif', fontWeight: 700, cursor: 'pointer', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#1a1a1a'} onMouseOut={(e) => e.target.style.background = '#000'}>FINALITZA LA COMPRA</button>
  </>
);
