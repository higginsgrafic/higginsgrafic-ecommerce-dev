import React, { useEffect, useState } from 'react';
import TaulaVertical, { TaulaVerticalP2 } from '@/components/megaslide/TaulaVertical.jsx';
import { ampladaCarril } from '@/components/megaslide/VerticalPieces.jsx';

/**
 * TaulaVerticalPage — les DUES taules de la vista vertical, aillades.
 * -----------------------------------------------------------------------------
 * Nomes per validar l'estructura: dibuixa la taula de la pagina 1 i la de la
 * pagina 2 amb les seves files, cel·les i etiquetes, dins del carril. Es a
 * `/lab/vertical-taula`.
 */
export default function TaulaVerticalPage() {
  const [carril, setCarril] = useState(() => (
    typeof window !== 'undefined' ? ampladaCarril(window.innerWidth) : 0
  ));
  useEffect(() => {
    const mesura = () => setCarril(ampladaCarril(window.innerWidth));
    mesura();
    window.addEventListener('resize', mesura);
    return () => window.removeEventListener('resize', mesura);
  }, []);

  const bloc = (titol, taula) => (
    <div style={{ marginBottom: '48px' }}>
      <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px', margin: '0 0 12px' }}>{titol}</h2>
      <div style={{ width: carril ? `${Math.round(carril)}px` : '100%', maxWidth: '100%', minHeight: '380px', display: 'flex' }}>
        {taula}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fff', padding: '120px 40px 60px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        {bloc('Taula · Pàgina 1', <TaulaVertical etiquetes />)}
        {bloc('Taula · Pàgina 2', <TaulaVerticalP2 etiquetes />)}
      </div>
    </div>
  );
}
