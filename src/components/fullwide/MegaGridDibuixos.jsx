import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/api/supabase-products';

/**
 * La graella de DIBUIXOS de la pagina 2 del megaslide.
 *
 * QUE ES
 *
 * Substitueix la fila de noms (NX-01, NCC-1701...) per una graella de dibuixos.
 * Ocupa el mateix espai: les mateixes 1269 px d'ample que tenien les 9 columnes
 * de text, pero repartits en 16 columnes.
 *
 * COM ESTA FETA
 *
 * Les mides son en `fr` (repartiment automatic de l'ample) i la casella es
 * quadrada (`aspect-square`). Aixo vol dir que s'adapta a l'amplada que li
 * doni el megaslide, sigui quina sigui, sense numeros fixos.
 *
 * ENCARA NO ESTA ACTIVADA
 *
 * S'activa amb l'interruptor de sota (o amb `?megaGrid=dibuixos` a l'adreca).
 * Mentre no s'activi, el megaslide es veu exactament com sempre.
 *
 * D'ON SURTEN ELS DIBUIXOS
 *
 * Dels PRODUCTES DEL CATALEG (la base de dades). L'aparellament entre el
 * producte i el fitxer del dibuix es fa pel nom, amb les excepcions que es
 * van comprovar a ma (vegeu `EXCEPCIONS`).
 */

const CARPETA = {
  'first-contact': 'first_contact',
  'the-human-inside': 'the_human_inside',
  austen: 'austen',
  cube: 'cube',
  miscellania: 'miscellania',
};

/**
 * El megaslide anomena les colleccions amb guio baix (`first_contact`) i el
 * cataleg amb guio (`first-contact`). Sense aquesta conversio el filtre no
 * trobava cap producte i la graella sortia buida.
 */
const COLLECCIO_AL_CATALEG = {
  first_contact: 'first-contact',
  the_human_inside: 'the-human-inside',
  austen: 'austen',
  cube: 'cube',
  miscellania: 'miscellania',
};

const ORDRE_COLLECCIONS = ['first-contact', 'the-human-inside', 'austen', 'cube', 'miscellania'];

const NOM_COLLECCIO = {
  'first-contact': 'First Contact',
  'the-human-inside': 'The Human Inside',
  austen: 'Austen',
  cube: 'Cube',
  miscellania: 'Miscel·lània',
};

// Productes el dibuix dels quals te un altre nom al fitxer. Comprovat a ma.
const EXCEPCIONS = {
  'cube-cyberman': 'cybercube',
  'cube-iron-kong-2': 'ironkong',
  'cube-maschinenmensch': 'maschinencube',
  'the-human-inside-robbie-the-robot': 'robbytherobot',
};

// Dibuixos que no son a la carpeta de la graella i s'han de buscar a part.
const DIBUIXOS_A_PART = {
  'austen-looking-for-my-darcy-pink-solid': '/custom_logos/drawings/images_originals/stripe/austen/looking_for_my_darcy/color/solid/fuchsia-solid-stripe.webp',
  'austen-looking-for-my-darcy-yellow-pink-frame': '/custom_logos/drawings/images_originals/stripe/austen/looking_for_my_darcy/color/frame/fuchsia-frame-stripe.webp',
  'austen-i-admire-and-love-you': '/custom_logos/drawings/images_originals/stripe/austen/quotes/black/i-admire-and-love-you-b-stripe.webp',
  'austen-you-have-bewitched-me': '/custom_logos/drawings/images_originals/stripe/austen/quotes/black/you-have-bewitched-me-b-stripe.webp',
};

/**
 * L'interruptor: graella de dibuixos o graella de noms.
 *
 * Es desa i s'exporta amb un esdeveniment, perque tots els components que el
 * fan servir canviin alhora, sense recarregar la pagina.
 */
const CLAU_LOCAL = 'hg-mega-grid-dibuixos';
const ESDEVENIMENT = 'hg-mega-grid-canviada';

/** Llegeix l'estat desat. Tambe es pot forçar amb l'adreca (`?megaGrid=`). */
export function graellaDeDibuixosActiva() {
  if (typeof window === 'undefined') return false;
  const param = new URLSearchParams(window.location.search).get('megaGrid');
  if (param === 'dibuixos') return true;
  if (param === 'noms') return false;
  return window.localStorage.getItem(CLAU_LOCAL) === '1';
}

/** Canvia l'estat i avisa tothom. No recarrega la pagina. */
export function activaGraellaDeDibuixos(activa) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CLAU_LOCAL, activa ? '1' : '0');
  window.dispatchEvent(new Event(ESDEVENIMENT));
}

/** Per escoltar els canvis des d'un component. */
export function escoltaGraellaDeDibuixos(quanCanvia) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(ESDEVENIMENT, quanCanvia);
  return () => window.removeEventListener(ESDEVENIMENT, quanCanvia);
}

/**
 * Clau per comparar noms de producte amb noms de fitxer.
 *
 * El sufix d'impressio (`-b`, `-w`) s'ha de treure ABANS de llevar els guions:
 * `nx-01-b-grid.webp` ha de donar `nx01`, no `nx01b`, perque el producte es
 * diu `first-contact-nx-01`.
 */
function clau(valor) {
  return String(valor).toLowerCase()
    .replace(/\.(webp|png|jpg|jpeg)$/, '')
    .replace(/-(b|w)-(grid|stripe)$/, '')
    .replace(/-(grid|stripe)$/, '')
    .replace(/^quotes-/, '')
    .replace(/^looking-for-my-darcy-/, '')
    .replace(/[-_]/g, '');
}

/** El dibuix que li toca a un producte, o null. */
function dibuixDelProducte(producte, index) {
  if (DIBUIXOS_A_PART[producte.slug]) return DIBUIXOS_A_PART[producte.slug];
  const carpeta = CARPETA[producte.collection];
  const candidats = index[carpeta] || [];
  const k = EXCEPCIONS[producte.slug]
    || clau(String(producte.slug).replace(/^(austen|first-contact|the-human-inside|cube|miscellania)-/, ''));
  const trobat = candidats.find((f) => f.k === k)
    || candidats.find((f) => f.k.includes(k) || k.includes(f.k));
  return trobat?.ruta || null;
}

/**
 * El dibuix d'un item de la llista del megaslide, buscant-lo directament al
 * manifest.
 *
 * `perClau` només té els dibuixos dels productes del catàleg, i n'hi ha que no
 * hi són (o que s'hi diuen d'una altra manera). Sense aquesta segona via, la
 * graella perdia items de la llista i les files quedaven curtes.
 */
function dibuixDeLlista(it, carpeta, index) {
  const k = clau(it);
  if (!k) return null;
  // Els noms de la llista porten espais, apostrofs i guions ("The Phoenix",
  // "Vulcan's End") i els fitxers tambe: per aparellar-los s'han de comparar
  // sense res que no sigui lletra o xifra.
  const pla = (v) => String(v).replace(/[^a-z0-9]/gi, '');
  const kp = pla(k);
  const candidats = index[carpeta] || [];
  const exacte = candidats.find((f) => f.k === k)
    || (kp ? candidats.find((f) => pla(f.k) === kp) : null);
  if (exacte) return exacte.ruta;
  return candidats.find((f) => f.k.includes(k) || k.includes(f.k))?.ruta || null;
}

/**
 * @param {object} props
 * @param {string} props.active    colleccio activa (clau del megaslide)
 * @param {string} [props.className]
 * @param {string[]} [props.items] llista d'items del megaslide (mana l'ordre)
 * @param {number} [props.cellPx]  mida de la casella en px. Si no s'hi passa,
 *   les 16 columnes es reparteixen l'ample del contenidor.
 * @param {boolean} [props.bloc16x4] pinta sempre les 64 caselles (16 columnes x
 *   4 files): les que no tenen dibuix hi son buides i el que no hi cap no es
 *   mostra. Es el que fa que la graella sigui un bloc de 16x4 i no una fila de
 *   llargada variable.
 */
/**
 * El dibuix d'un item buscant-lo a TOTES les carpetes del manifest.
 *
 * La graella de la vertical rep dibuixos de tot el cataleg, no nomes de la
 * colleccio activa: per aixo la segona via no es limita a la carpeta d'aquella
 * colleccio.
 */
function dibuixDeLlistaATothom(it, index) {
  if (typeof it !== 'string' || !it) return null;
  for (const carpeta of Object.keys(index || {})) {
    const ruta = dibuixDeLlista(it, carpeta, index);
    if (ruta) return ruta;
  }
  return null;
}

export default function MegaGridDibuixos({ active, className, items: itemsDelMega }) {
  const [manifest, setManifest] = useState(null);
  const [productes, setProductes] = useState(null);

  useEffect(() => {
    let viu = true;
    Promise.all([
      fetch('/drawings.grid.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})),
      supabase.from('products').select('name, slug, collection').eq('is_active', true).order('name'),
    ])
      .then(([m, res]) => {
        if (!viu) return;
        setManifest(m || {});
        setProductes(res.data || []);
      })
      .catch(() => { if (viu) { setManifest({}); setProductes([]); } });
    return () => { viu = false; };
  }, []);

  const index = useMemo(() => {
    const idx = {};
    for (const [carpeta, llista] of Object.entries(manifest || {})) {
      idx[carpeta] = llista
        // Els dibuixos d'impressio blanca son el mateix dibuix: no els volem
        // duplicats a la graella.
        .filter((r) => !/\/white\//i.test(r) && !/-w-grid|w-stripe/i.test(r))
        .map((ruta) => ({ ruta, k: clau(ruta.split('/').pop()) }));
    }
    return idx;
  }, [manifest]);

  // Els dibuixos de la colleccio activa, amb el seu producte.
  const perClau = useMemo(() => {
    if (!productes) return new Map();
    const clauActiva = COLLECCIO_AL_CATALEG[active] || active;
    const mapa = new Map();
    for (const p of productes) {
      if (p.collection !== clauActiva) continue;
      const dibuix = dibuixDelProducte(p, index);
      if (!dibuix) continue;
      // La clau del fitxer, per aparellar-lo amb la llista del megaslide.
      mapa.set(clau(dibuix.split('/').pop()), { ...p, dibuix });
    }
    return mapa;
  }, [productes, index, active]);

  /**
   * L'ORDRE.
   *
   * Mana la llista d'items del megaslide (`itemsDelMega`), que és la que l'amo
   * veu a la graella de noms. Així els dibuixos surten exactament al mateix
   * lloc on hi havia cada nom, i no pas en ordre alfabètic com abans.
   *
   * Si un item no troba el seu dibuix, es descarta; i si un producte no és a
   * la llista, s'afegeix al final perquè no desaparegui mai.
   */
  const dibuixos = useMemo(() => {
    const ordenats = [];
    const usats = new Set();
    const carpeta = CARPETA[active] || COLLECCIO_AL_CATALEG[active] || active;
    for (const it of Array.isArray(itemsDelMega) ? itemsDelMega : []) {
      if (typeof it !== 'string') continue;
      if (it === 'botonera-bn' || it === 'botonera-fletxes') continue;
      const k = clau(it);
      const trobat = perClau.get(k) || [...perClau.entries()].find(([kk]) => kk.includes(k) || k.includes(kk))?.[1];
      if (trobat) {
        if (usats.has(trobat.dibuix)) continue;
        usats.add(trobat.dibuix);
        ordenats.push(trobat);
        continue;
      }
      const ruta = dibuixDeLlista(it, carpeta, index) || dibuixDeLlistaATothom(it, index);
      if (!ruta || usats.has(ruta)) continue;
      usats.add(ruta);
      ordenats.push({ slug: `__mega__${k || it}`, name: it, collection: active, dibuix: ruta });
    }
    // Els que no surten a la llista del megaslide, al final.
    for (const p of perClau.values()) {
      if (usats.has(p.dibuix)) continue;
      usats.add(p.dibuix);
      ordenats.push(p);
    }
    return ordenats;
  }, [itemsDelMega, perClau, active, index]);

  // Mentre no hi hagi dades, no pinto res: aixi no balla.
  if (!manifest || !productes || dibuixos.length === 0) return null;

  return (
    <div className={className}>
      <div
        style={{
          display: 'grid',
          // Les columnes es reparteixen l'ample que els doni el megaslide.
          gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
          gap: '6px',
          alignItems: 'center',
        }}
        aria-label={`Dibuixos de ${NOM_COLLECCIO[dibuixos[0]?.collection] || ''}`}
      >
        {dibuixos.map((p) => (
          <div
            key={p.slug}
            title={p.name}
            style={{
              aspectRatio: '1 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src={p.dibuix}
              alt=""
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Ordre de les colleccions, per si mes endavant es mostra mes d'una. */
export { ORDRE_COLLECCIONS };
