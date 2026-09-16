import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/api/supabase-products';

/**
 * PROVA: la graella de 4×16 amb els dibuixos dels 63 productes.
 *
 * QUÈ ÉS
 *
 * Una graella de 4 columnes per 16 files (64 caselles) amb el dibuix de cada
 * producte del catàleg, i res més: ni noms, ni samarretes, ni rodones. Les
 * caselles que no tenen dibuix queden amb un cercle gris, perquè es vegi que
 * hi falta.
 *
 * D'ON SURT LA LLISTA
 *
 * Dels PRODUCTES DEL CATALEG (la base de dades), que és la font de veritat:
 * són els 63 productes que es venen. Els dibuixos s'aparellen pel nom del
 * fitxer.
 *
 * PER QUÈ ÉS UNA PÀGINA A PART
 *
 * Per veure-ho abans de canviar el megaslide de debò. No toca res.
 *
 *     http://localhost:3003/constructor/megaslide-icons
 */

const COLUMNES = 16;
const FILES = 4;
const COSTAT = 50;      // costat de cada casella, en px
const SEPARACIO = 10;   // separació entre caselles, en px

const CARPETA = {
  'first-contact': 'first_contact',
  'the-human-inside': 'the_human_inside',
  austen: 'austen',
  cube: 'cube',
  miscellania: 'miscellania',
};

// Productes el dibuix dels quals té un altre nom al fitxer. Comprovat a mà.
const EXCEPCIONS = {
  'cube-cyberman': 'cybercube',
  'cube-iron-kong-2': 'ironkong',
  'cube-maschinenmensch': 'maschinencube',
  'the-human-inside-robbie-the-robot': 'robbytherobot',
};

/**
 * Clau per comparar noms de producte amb noms de fitxer.
 * `austen-looking-for-my-darcy-blue-solid` i `blue-solid-grid.webp` han de
 * donar la mateixa clau.
 */
function clau(valor) {
  return String(valor).toLowerCase()
    .replace(/\.(webp|png|jpg|jpeg)$/, '')
    .replace(/[-_]/g, '')
    .replace(/grid$|stripe$/, '')
    .replace(/^quotes/, '')
    .replace(/^lookingformydarcy/, '');
}

/** El dibuix que li toca a un producte, o null si no n'hi ha. */
function dibuixDelProducte(producte, index) {
  const carpeta = CARPETA[producte.collection];
  const candidats = index[carpeta] || [];
  const k = EXCEPCIONS[producte.slug] || clau(String(producte.slug).replace(/^(austen|first-contact|the-human-inside|cube|miscellania)-/, ''));
  const trobat = candidats.find((f) => f.k === k) || candidats.find((f) => f.k.includes(k) || k.includes(f.k));
  return trobat?.ruta || null;
}

export default function MegaslideIconsTestPage() {
  const [manifest, setManifest] = useState(null);
  const [productes, setProductes] = useState(null);
  const [error, setError] = useState('');
  const [seleccionat, setSeleccionat] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/drawings.grid.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))),
      supabase.from('products').select('name, slug, collection').order('collection').order('name'),
    ])
      .then(([m, res]) => {
        if (res.error) throw new Error(res.error.message);
        setManifest(m);
        setProductes(res.data || []);
      })
      .catch((e) => setError(e.message));
  }, []);

  // Index de dibuixos per col·lecció, amb la clau normalitzada.
  const index = useMemo(() => {
    const idx = {};
    for (const [carpeta, llista] of Object.entries(manifest || {})) {
      idx[carpeta] = llista
        // Els dibuixos d'impressió blanca són el mateix dibuix: no els volem
        // duplicats a la graella.
        .filter((r) => !/\/white\//i.test(r) && !/-w-grid|w-stripe/i.test(r))
        .map((ruta) => ({ ruta, k: clau(ruta.split('/').pop()) }));
    }
    return idx;
  }, [manifest]);

  const files = useMemo(() => {
    if (!productes) return [];
    return productes.map((p) => ({ ...p, dibuix: dibuixDelProducte(p, index) }));
  }, [productes, index]);

  const sense = files.filter((f) => !f.dibuix);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          No s&apos;ha pogut carregar la graella ({error}).
        </div>
      </div>
    );
  }

  const carregant = !manifest || !productes;

  return (
    <div className="mx-auto max-w-[1500px] p-6">
      {/* Capçalera */}
      <div className="mb-6">
        <Link to="/constructor/full-wide-slide" className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-gray-500 hover:text-black">
          <ArrowLeft className="h-3.5 w-3.5" /> Tornar al megaslide
        </Link>
        <h1 className="font-oswald text-2xl uppercase tracking-[0.04em]">Dibuixos · graella {COLUMNES}×{FILES} (prova)</h1>
        <p className="mt-1 text-sm text-gray-500">
          El dibuix de cada producte del catàleg. <strong>No toca el megaslide.</strong>
        </p>
      </div>

      <section className="border border-gray-200 bg-white p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-oswald text-[10px] uppercase tracking-[0.16em] text-gray-400">
            {carregant ? 'Carregant…' : `${files.length} productes · ${files.length - sense.length} amb dibuix · ${sense.length} sense`}
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-gray-400">
            caselles de {COSTAT} px · {COLUMNES} columnes × {FILES} files
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLUMNES}, ${COSTAT}px)`,
            gridTemplateRows: `repeat(${FILES}, ${COSTAT}px)`,
            gap: SEPARACIO,
            justifyContent: 'start',
          }}
        >
          {Array.from({ length: COLUMNES * FILES }).map((_, idx) => {
            const f = files[idx] || null;

            // Casella sense producte (o mentre carrega): buida.
            if (!f) return <span key={`buit-${idx}`} aria-hidden="true" />;

            // Producte sense dibuix: un cercle gris, perquè es vegi que falta.
            if (!f.dibuix) {
              return (
                <span
                  key={f.slug}
                  title={`${f.name} — sense dibuix`}
                  style={{
                    width: COSTAT,
                    height: COSTAT,
                    borderRadius: '50%',
                    backgroundColor: '#E8EAED',
                    border: '0.5px solid rgba(0,0,0,0.22)',
                    boxSizing: 'border-box',
                    display: 'block',
                  }}
                />
              );
            }

            const actiu = seleccionat === f.slug;
            return (
              <button
                key={f.slug}
                type="button"
                title={f.name}
                aria-label={f.name}
                onClick={() => setSeleccionat(actiu ? null : f.slug)}
                style={{
                  appearance: 'none',
                  // Sense `border`: el contorn se'n menja 1 px de cada costat i
                  // el dibuix quedaria de 48 px en comptes de 50. El senyal de
                  // seleccionat es fa amb `boxShadow`, que no ocupa espai.
                  border: 'none',
                  boxShadow: actiu ? 'inset 0 0 0 1px #000000' : undefined,
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  width: COSTAT,
                  height: COSTAT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <img
                  src={f.dibuix}
                  alt=""
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* La llista dels que falten, per buscar-los */}
      {!carregant && sense.length > 0 && (
        <section className="mt-6 border border-amber-300 bg-amber-50 p-6">
          <h2 className="mb-3 font-oswald text-[10px] uppercase tracking-[0.16em] text-amber-800">
            Sense dibuix ({sense.length}) — els cercles grisos de la graella
          </h2>
          <ul className="space-y-1 text-sm text-amber-900">
            {sense.map((f) => (
              <li key={f.slug} className="font-mono text-xs">
                {f.slug} <span className="text-amber-700">· {f.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
