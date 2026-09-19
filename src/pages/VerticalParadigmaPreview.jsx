import React from 'react';
import MegaGridDibuixos from '@/components/fullwide/MegaGridDibuixos';

/**
 * Previsualitzacio del nou paradigma de la vista VERTICAL (768) del megaslide.
 *
 * Nomes es una maqueta per validar l'ESTRUCTURA abans de muntar-la dins del
 * megaslide: el contenidor fa l'amplada del carril i, a dins, hi ha la graella
 * de dibuixos a dalt i les tres columnes a sota. Les samarretes de la franja hi
 * son com a caselles buides, perque les autentiques depenen del belt, que es
 * precisament el que aquesta vista no ha de fer servir.
 *
 * Es a /lab/vertical.
 */

const COLLECCIONS = [
  'FIRST CONTACT', 'THE HUMAN INSIDE', 'AUSTEN/PEMBERLEY', 'AUSTEN/KEEP CALM',
  'AUSTEN/QUOTES', 'AUSTEN/CROSSWORDS', 'AUSTEN/LFMD', 'CUBE', 'MISCEL·LANIA',
];

const COLORS = [
  '#ffffff', '#a9c6de', '#1f7ad4', '#1e3358', '#5b2d9e', '#e2c7d8', '#f2c230',
  '#e8a020', '#d81f26', '#b7d3a3', '#1f9d55', '#7d8f7a', '#2e4a34', '#111111',
];

export default function VerticalParadigmaPreview() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingTop: '120px', paddingBottom: '60px' }}>
      <div
        style={{
          width: 'min(var(--hg-band-w, 100%), 100vw)',
          margin: '0 auto',
          fontFamily: 'Roboto Condensed, sans-serif',
          color: '#4A5057',
        }}
      >
        {/* FILA A — la graella de dibuixos, amplada de carril */}
        <MegaGridDibuixos active="first_contact" className="w-full" />

        {/* FILA B — tres columnes: colleccions · botons d'accio · franja 2x7 */}
        <div style={{ display: 'grid', gridTemplateColumns: '19fr 15fr 63fr', columnGap: '2%', marginTop: '16px', alignItems: 'start' }}>
          {/* Col 1: colleccions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {COLLECCIONS.map((c, i) => (
              <div key={c} style={{ padding: '4px 8px', fontSize: '10pt', textAlign: 'right', background: i === 0 ? '#F1F3F5' : 'transparent', borderRadius: '2px' }}>{c}</div>
            ))}
          </div>

          {/* Col 2: botons d'accio + paleta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['BLANC', 'COLOR', 'NEGRE'].map((f) => (
              <div key={f} style={{ padding: '4px 10px', fontSize: '10pt', textAlign: 'center', border: '1px solid #E6E8EC', borderRadius: '2px' }}>{f}</div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginTop: '6px' }}>
              {COLORS.map((c) => (
                <div key={c} style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '9999px', background: c, border: '1px solid #E6E8EC' }} />
              ))}
            </div>
            <div style={{ alignSelf: 'center', marginTop: '4px', padding: '2px 12px', fontSize: '9pt', border: '1px solid #E6E8EC', borderRadius: '9999px' }}>COLOR</div>
          </div>

          {/* Col 3: la franja, 2 files de 7 */}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '8px' }}>
            {[0, 1].map((fila) => (
              <div key={fila} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {Array.from({ length: 7 }).map((_, c) => (
                  <div key={c} style={{ aspectRatio: '1 / 1', background: '#F4F6F8', border: '1px solid #E6E8EC', borderRadius: '2px' }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
