import React, { useEffect, useMemo, useState } from 'react';
import MegaGridDibuixos from '../fullwide/MegaGridDibuixos.jsx';

/**
 * GraellaDibuixos16x4 — la GRAELLA DE DIBUIXOS 16x4 de la pagina 2 del
 * megaslide: els dibuixos de TOTES les colleccions, en 16 columnes i 4 files
 * (64 caselles). Es la mateixa graella que ja es veu a la pagina 2.
 *
 * Els dibuixos surten del manifest que publica el projecte
 * (`/drawings.grid.json`); si li arriben `items`, mana aquesta llista.
 */
export default function GraellaDibuixos16x4({ active, items = null }) {
  const [manifest, setManifest] = useState(null);
  useEffect(() => {
    let viu = true;
    fetch('/drawings.grid.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : {}))
      .then((m) => { if (viu) setManifest(m || {}); })
      .catch(() => { if (viu) setManifest({}); });
    return () => { viu = false; };
  }, []);
  const dibuixos = useMemo(() => {
    if (Array.isArray(items) && items.length) return items;
    const out = [];
    for (const llista of Object.values(manifest || {})) {
      for (const ruta of llista) if (typeof ruta === 'string' && ruta) out.push(ruta);
    }
    return out;
  }, [items, manifest]);
  return <MegaGridDibuixos active={active} className="w-full" items={dibuixos} />;
}
