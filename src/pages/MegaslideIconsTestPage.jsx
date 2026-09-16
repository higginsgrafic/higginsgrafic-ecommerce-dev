import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * PROVA: la graella de la pàgina 2 del megaslide, amb els DIBUIXOS en comptes
 * dels noms.
 *
 * QUÈ ÉS
 *
 * A la pàgina 2 del megaslide hi ha una graella amb el nom de cada dibuix
 * (NX-01, NCC-1701…). Aquesta pàgina és la mateixa graella, però amb el
 * dibuix a cada casella, i res més: ni samarretes ni noms.
 *
 * COM ESTÀ FETA
 *
 * Rodones de 50 px, en una graella de 4 columnes, amb el dibuix a dins a mida
 * completa. La rodona és del mateix diàmetre que el dibuix, com a la graella
 * de colors del megaslide.
 *
 * PER QUÈ ÉS UNA PÀGINA A PART
 *
 * Per veure-ho abans de canviar el megaslide de debò. No toca res.
 *
 *     http://localhost:3003/constructor/megaslide-icons
 *
 * D'ON SURT LA LLISTA DE DIBUIXOS
 *
 * El navegador no pot llistar carpetes: la llista viu a
 * `public/drawings.grid.json`, generada amb:
 *
 *     node scripts/genera-llista-dibuixos.mjs
 */

const MIDA = 50;                 // diàmetre de la rodona, en px
const COLUMNES = 4;              // la graella que ha demanat l'amo
const SEPARACIO = 10;            // separació entre rodones, en px
const CONTORN = '0.5px solid rgba(0,0,0,0.22)';

const COLLECCIONS = [
  { carpeta: 'first_contact', nom: 'First Contact' },
  { carpeta: 'the_human_inside', nom: 'The Human Inside' },
  { carpeta: 'austen', nom: 'Austen' },
  { carpeta: 'cube', nom: 'Cube' },
  { carpeta: 'miscellania', nom: 'Miscel·lània' },
];

/** El nom del disseny, tal com surt al filename (`nx-01-b-grid` → `nx-01`). */
function dissenyDelDibuix(ruta) {
  const base = ruta.split('/').pop() || ruta;
  return base
    .replace(/\.(webp|png|jpg|jpeg)$/i, '')
    .replace(/-b-grid$/i, '').replace(/-w-grid$/i, '')
    .replace(/-grid$/i, '').replace(/-stripe$/i, '')
    .replace(/-b$/i, '').replace(/-w$/i, '');
}

function etiquetaDelDibuix(ruta) {
  return dissenyDelDibuix(ruta).replace(/[-_]+/g, ' ').toUpperCase();
}

function esDibuixBlanc(ruta) {
  return /\/white\//i.test(ruta);
}

export default function MegaslideIconsTestPage() {
  const [manifest, setManifest] = useState(null);
  const [error, setError] = useState('');
  const [colleccio, setColleccio] = useState('first_contact');
  const [seleccionat, setSeleccionat] = useState(null);

  useEffect(() => {
    fetch('/drawings.grid.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setManifest)
      .catch((e) => setError(e.message));
  }, []);

  const dibuixos = useMemo(() => {
    const llista = manifest?.[colleccio] || [];
    // Un dibuix per disseny: les carpetes black/ i white/ dupliquen el mateix
    // dibuix en dos colors d'impressió.
    const perDisseny = new Map();
    for (const ruta of llista) {
      const disseny = dissenyDelDibuix(ruta);
      if (!perDisseny.has(disseny)) perDisseny.set(disseny, ruta);
    }
    return [...perDisseny.entries()].map(([disseny, ruta]) => ({
      disseny,
      nom: etiquetaDelDibuix(ruta),
      ruta,
      blanc: esDibuixBlanc(ruta),
    }));
  }, [manifest, colleccio]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          No s&apos;ha pogut carregar la llista de dibuixos ({error}).
          <div className="mt-2">Genera-la amb: <code>node scripts/genera-llista-dibuixos.mjs</code></div>
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
          <h1 className="font-oswald text-2xl uppercase tracking-[0.04em]">Dibuixos de la pàgina 2 (prova)</h1>
          <p className="mt-1 text-sm text-gray-500">
            La graella de la pàgina 2, amb els dibuixos en comptes dels noms. <strong>No toca el megaslide.</strong>
          </p>
        </div>
      </div>

      {/* Col·leccions */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {COLLECCIONS.map((c) => (
          <button
            key={c.carpeta}
            type="button"
            onClick={() => setColleccio(c.carpeta)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider ${colleccio === c.carpeta ? 'bg-gray-900 text-white' : 'border border-gray-200 bg-white hover:border-black'}`}
          >
            {c.nom}
          </button>
        ))}
      </div>

      {/* LA GRAELLA: 4 columnes de rodones de 50 px, amb el dibuix a dins */}
      <section className="border border-gray-200 bg-white p-6">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-oswald text-[10px] uppercase tracking-[0.16em] text-gray-400">
            Dibuixos · {COLLECCIONS.find((c) => c.carpeta === colleccio)?.nom}
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-gray-400">
            {dibuixos.length} dibuixos · {COLUMNES} columnes · rodones de {MIDA} px
          </span>
        </div>

        {!manifest && <div className="py-8 text-center text-sm text-gray-400">Carregant els dibuixos…</div>}

        {manifest && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLUMNES}, ${MIDA}px)`,
            gap: SEPARACIO,
            justifyContent: 'start',
          }}>
            {dibuixos.map((d) => {
              const actiu = seleccionat === d.disseny;
              return (
                <button
                  key={d.disseny}
                  type="button"
                  title={d.nom}
                  aria-label={d.nom}
                  onClick={() => setSeleccionat(actiu ? null : d.disseny)}
                  style={{
                    appearance: 'none',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    position: 'relative',
                    width: MIDA,
                    height: MIDA,
                    padding: 0,
                    display: 'block',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: MIDA,
                      height: MIDA,
                      borderRadius: '50%',
                      backgroundColor: '#E8EAED',
                      border: CONTORN,
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={d.ruta}
                      alt=""
                      loading="lazy"
                      style={{
                        width: MIDA,
                        height: MIDA,
                        objectFit: 'contain',
                        display: 'block',
                        // Els dibuixos d'impressió blanca, sobre fons clar, no
                        // es veurien: s'inverteixen.
                        filter: d.blanc ? 'invert(1)' : undefined,
                      }}
                    />
                  </span>

                  {actiu && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '1px solid #000000',
                        boxSizing: 'border-box',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Els noms, a part, per poder comprovar que cada dibuix és el que toca */}
      {manifest && (
        <section className="mt-6 border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-oswald text-[10px] uppercase tracking-[0.16em] text-gray-400">
            Noms, en el mateix ordre (per comprovar)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMNES}, ${MIDA}px)`, gap: SEPARACIO }}>
            {dibuixos.map((d) => (
              <span key={d.disseny} className="truncate text-center font-oswald text-[8px] uppercase tracking-[0.06em] text-gray-400" title={d.nom}>
                {d.nom}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
