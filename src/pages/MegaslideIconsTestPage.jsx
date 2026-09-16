import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { collectionGridImageFor } from '@/lib/pdpMockup';

/**
 * PROVA: la graella de dibuixos de la pàgina 2 del megaslide, amb els dibuixos
 * en comptes dels noms.
 *
 * PER QUÈ ÉS UNA PÀGINA A PART
 *
 * L'amo vol veure com queda abans de canviar el megaslide de debò. Aquesta
 * pàgina és una còpia de la part de graella de la pàgina 2, sense tocar res
 * del megaslide: si no agrada, s'esborra i no ha passat res.
 *
 * D'ON SURT LA LLISTA DE DIBUIXOS
 *
 * El navegador no pot llistar carpetes, així que la llista viu a
 * `public/drawings.grid.json`, que es genera amb:
 *
 *     node scripts/genera-llista-dibuixos.mjs
 *
 * COM ES MIRA
 *
 *     http://localhost:3003/constructor/megaslide-icons
 */

// `carpeta` és el nom de la carpeta de dibuixos; `clau` és el nom que fa servir
// mockupPaths per trobar el mockup de la samarreta. No sempre coincideixen
// (first_contact / first-contact).
const COLLECCIONS = [
  { carpeta: 'first_contact', clau: 'first-contact', nom: 'First Contact' },
  { carpeta: 'the_human_inside', clau: 'the-human-inside', nom: 'The Human Inside' },
  { carpeta: 'austen', clau: 'austen-quotes', nom: 'Austen' },
  { carpeta: 'cube', clau: 'cube', nom: 'Cube' },
  { carpeta: 'miscellania', clau: 'miscellania', nom: 'Miscel·lània' },
];

const COLORS = [
  { id: 'white', nom: 'White', hex: '#ffffff' },
  { id: 'light-blue', nom: 'Light Blue', hex: '#A8C4DE' },
  { id: 'royal', nom: 'Royal', hex: '#1B4FA0' },
  { id: 'navy', nom: 'Navy', hex: '#1F2A44' },
  { id: 'purple', nom: 'Purple', hex: '#5B2A86' },
  { id: 'light-pink', nom: 'Light Pink', hex: '#F2C9D8' },
  { id: 'gold', nom: 'Gold', hex: '#F2C230' },
  { id: 'red', nom: 'Red', hex: '#D32029' },
  { id: 'kiwi', nom: 'Kiwi', hex: '#A8CE5A' },
  { id: 'irish-green', nom: 'Irish Green', hex: '#1E8A4C' },
  { id: 'forest-green', nom: 'Forest Green', hex: '#2C5A3A' },
  { id: 'black', nom: 'Black', hex: '#111111' },
];

/**
 * El nom del DISSENY, tal com surt al filename del mockup.
 * `nx-01-b-grid.webp` -> `nx-01`. És el que necessita `collectionGridImageFor`
 * per trobar la samarreta amb el dibuix posat.
 */
function dissenyDelDibuix(ruta) {
  const base = ruta.split('/').pop() || ruta;
  return base
    .replace(/\.(webp|png|jpg|jpeg)$/i, '')
    .replace(/-b-grid$/i, '').replace(/-w-grid$/i, '')
    .replace(/-grid$/i, '').replace(/-stripe$/i, '')
    .replace(/-b$/i, '').replace(/-w$/i, '');
}

/** Una etiqueta llegible per a la cel·la. */
function etiquetaDelDibuix(ruta) {
  return dissenyDelDibuix(ruta).replace(/[-_]+/g, ' ').toUpperCase();
}

/** El dibuix és d'impressió blanca? Ho diu la carpeta. */
function esDibuixBlanc(ruta) {
  return /\/white\//i.test(ruta);
}

export default function MegaslideIconsTestPage() {
  const [manifest, setManifest] = useState(null);
  const [error, setError] = useState('');
  const [colleccio, setColleccio] = useState('first_contact');
  const [color, setColor] = useState('white');
  const [seleccionat, setSeleccionat] = useState(null);
  // Com es mostra cada cel·la: la samarreta muntada o el dibuix sol.
  const [mode, setMode] = useState('samarreta');

  useEffect(() => {
    fetch('/drawings.grid.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setManifest)
      .catch((e) => setError(e.message));
  }, []);

  const clauMockup = COLLECCIONS.find((c) => c.carpeta === colleccio)?.clau || colleccio;

  const dibuixos = useMemo(() => {
    const llista = manifest?.[colleccio] || [];
    // Un sol dibuix per disseny: les carpetes black/ i white/ dupliquen el
    // mateix dibuix en dos colors d'impressió.
    const perDisseny = new Map();
    for (const ruta of llista) {
      const disseny = dissenyDelDibuix(ruta);
      if (!perDisseny.has(disseny)) perDisseny.set(disseny, ruta);
    }
    return [...perDisseny.entries()].map(([disseny, ruta]) => ({ disseny, nom: etiquetaDelDibuix(ruta), ruta }));
  }, [manifest, colleccio]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          No s&apos;ha pogut carregar la llista de dibuixos ({error}).
          <div className="mt-2">
            Genera-la amb: <code>node scripts/genera-llista-dibuixos.mjs</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] p-6">
      {/* Capçalera */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/constructor/full-wide-slide" className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-gray-500 hover:text-black">
            <ArrowLeft className="h-3.5 w-3.5" /> Tornar al megaslide
          </Link>
          <h1 className="font-oswald text-2xl uppercase tracking-[0.04em]">Graella de dibuixos (prova)</h1>
          <p className="mt-1 text-sm text-gray-500">
            Còpia de la graella de la pàgina 2, amb els dibuixos en comptes dels noms. <strong>No toca el megaslide.</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('samarreta')}
            className={`px-4 py-2 text-xs uppercase tracking-wider ${mode === 'samarreta' ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white hover:border-black'}`}
          >
            Samarreta muntada
          </button>
          <button
            type="button"
            onClick={() => setMode('dibuix')}
            className={`px-4 py-2 text-xs uppercase tracking-wider ${mode === 'dibuix' ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white hover:border-black'}`}
          >
            Només el dibuix
          </button>
        </div>
      </div>

      {/* Col·leccions */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {COLLECCIONS.map((c) => (
          <button
            key={c.carpeta}
            type="button"
            onClick={() => setColleccio(c.carpeta)}
            className={`px-4 py-2 text-xs uppercase tracking-wider ${colleccio === c.carpeta ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white hover:border-black'}`}
          >
            {c.nom}
          </button>
        ))}
      </div>

      {/* Colors de samarreta */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-2 font-oswald text-[10px] uppercase tracking-[0.16em] text-gray-400">Color</span>
        {COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            title={c.nom}
            aria-label={c.nom}
            onClick={() => setColor(c.id)}
            className={`h-8 w-8 rounded-full border ${color === c.id ? 'ring-2 ring-gray-900 ring-offset-2' : 'border-gray-300'}`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
        <span className="ml-2 text-xs uppercase tracking-wider text-gray-500">
          {COLORS.find((c) => c.id === color)?.nom}
        </span>
      </div>

      {/* La graella de dibuixos */}
      {!manifest && <div className="py-10 text-center text-sm text-gray-400">Carregant els dibuixos…</div>}
      {manifest && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {dibuixos.map((d) => {
            const actiu = seleccionat === d.disseny;
            const imatge = mode === 'samarreta'
              ? collectionGridImageFor(clauMockup, d.disseny, color, 0)
              : d.ruta;
            return (
              <button
                key={d.disseny}
                type="button"
                onClick={() => setSeleccionat(d.disseny)}
                className={`group flex flex-col items-center gap-2 border bg-white p-3 transition-colors ${actiu ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-white">
                  <img
                    src={imatge}
                    alt={d.nom}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                    style={mode === 'dibuix' && esDibuixBlanc(d.ruta) ? { filter: 'invert(1)' } : undefined}
                  />
                </div>
                <span className={`w-full truncate text-center font-oswald text-[9px] uppercase tracking-[0.1em] ${actiu ? 'text-gray-900' : 'text-gray-400'}`}>
                  {d.nom}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {manifest && (
        <p className="mt-6 text-xs text-gray-400">
          {dibuixos.length} dibuixos a {COLLECCIONS.find((c) => c.carpeta === colleccio)?.nom}
          {seleccionat ? ` · seleccionat: ${seleccionat}` : ''}
        </p>
      )}
    </div>
  );
}
