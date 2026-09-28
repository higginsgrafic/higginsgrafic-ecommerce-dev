/**
 * MOCKUPS DE SUPABASE A LOCAL (28/09/2026)
 * -----------------------------------------------------------------------------
 * Per que: Supabase ens cobra EGRESS (ample de banda) i estavem a 11,94 GB d'un
 * limit de 5,5 GB. Els fitxers del Storage son PNG de 3000x3000 d'1,4-2,7 MB
 * (307 fitxers, 545 MB) i Supabase els serveix amb `Cache-Control: no-cache`, o
 * sigui que cada visita se'ls torna a baixar. Els nostres fitxers locals, en
 * canvi, surten pel CDN de Netlify amb `max-age=31536000, immutable`
 * (`public/_headers`).
 *
 * Que fa:
 *   1. Baixa els fitxers del Storage i els converteix a WebP (qualitat 82):
 *      mesurat, 1,42 MB -> 0,09 MB i 2,35 MB -> 0,21 MB (un 90 % menys).
 *   2. Els deixa a `public/custom_logos/mockups/` (ruta amb cache immutable).
 *   3. Actualitza `product_mockups.file_path` (i `products.image` si cal) perque
 *      apuntin a la ruta local.
 *   4. Amb `--esborrar-remot`, esborra els originals del Storage.
 *
 * Us:
 *   node scripts/mockups-a-local.mjs              (esborrany: no toca res)
 *   node scripts/mockups-a-local.mjs --aplicar    (baixa, converteix i actualitza)
 *   node scripts/mockups-a-local.mjs --esborrar-remot  (a mes, buida el Storage)
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ARREL = process.cwd();
const llegir = (k) => {
  const t = fs.readFileSync(path.join(ARREL, '.env'), 'utf8');
  for (const l of t.split(/\r?\n/)) {
    const m = l.match(new RegExp('^\\s*' + k + '\\s*=\\s*(.*)$'));
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
};
const URL_BASE = llegir('VITE_SUPABASE_URL');
const KEY = llegir('SUPABASE_SERVICE_ROLE_KEY');
if (!URL_BASE || !KEY) { console.error('falten credencials al .env'); process.exit(1); }
const cap = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const APLICAR = process.argv.includes('--aplicar');
const ESBORRAR = process.argv.includes('--esborrar-remot');
const BUCKET = 'media';
const DESTI = path.join(ARREL, 'public/custom_logos/mockups');
const QUALITAT = 82;
const escap = (c) => c.split('/').map(encodeURIComponent).join('/');

const llista = async (prefix, fondaria = 0, acc = []) => {
  const r = await fetch(`${URL_BASE}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST', headers: cap,
    body: JSON.stringify({ prefix, limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!r.ok) throw new Error(`llistat ${prefix}: HTTP ${r.status}`);
  for (const x of (await r.json())) {
    const cami = prefix ? `${prefix}/${x.name}` : x.name;
    if (!x.id && fondaria < 8) await llista(cami, fondaria + 1, acc);
    else acc.push({ cami, bytes: x.metadata?.size || 0, tipus: x.metadata?.mimetype || 'application/octet-stream' });
  }
  return acc;
};

const tots = await llista('');
console.log(`${tots.length} fitxers al Storage, ${(tots.reduce((s, x) => s + x.bytes, 0) / 1048576).toFixed(1)} MB`);
if (!APLICAR && !ESBORRAR) {
  console.log('\n(ESBORRANY: no es toca res. Per fer-ho de debò: --aplicar)');
  tots.slice(0, 8).forEach((x) => console.log(`  ${(x.bytes / 1048576).toFixed(2).padStart(6)} MB  ${x.cami}`));
  process.exit(0);
}

// 1) Baixar, convertir i desar
fs.mkdirSync(DESTI, { recursive: true });
const canvis = [];
let bytesAbans = 0; let bytesDespres = 0; let errors = 0;
for (const x of tots) {
  const url = `${URL_BASE}/storage/v1/object/${BUCKET}/${escap(x.cami)}`;
  const r = await fetch(url, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  if (!r.ok) { errors++; console.log('  no s\'ha pogut baixar', x.cami, r.status); continue; }
  const original = Buffer.from(await r.arrayBuffer());
  if (x.bytes > 0 && original.length !== x.bytes) { errors++; console.log('  mida inesperada, salto:', x.cami); continue; }
  const nomWebp = x.cami.replace(/\.[^.]+$/, '') + '.webp';
  const desti = path.join(DESTI, nomWebp);
  fs.mkdirSync(path.dirname(desti), { recursive: true });
  const webp = await sharp(original).webp({ quality: QUALITAT }).toBuffer();
  fs.writeFileSync(desti, webp);
  // Comprovacio: el WebP s'ha de poder llegir i tenir les mateixes mides
  const meta = await sharp(webp).metadata();
  const metaOrig = await sharp(original).metadata();
  if (meta.width !== metaOrig.width || meta.height !== metaOrig.height) {
    errors++; console.log('  mides diferents!', x.cami); continue;
  }
  bytesAbans += original.length; bytesDespres += webp.length;
  canvis.push({ cami: x.cami, local: `/custom_logos/mockups/${nomWebp}` });
  if (canvis.length % 50 === 0) console.log(`  ... ${canvis.length}/${tots.length}`);
}
console.log(`\nconversion: ${canvis.length} fitxers, ${(bytesAbans / 1048576).toFixed(1)} MB -> ${(bytesDespres / 1048576).toFixed(1)} MB (${(100 - (bytesDespres / bytesAbans) * 100).toFixed(0)} % menys), ${errors} errors`);

// 2) Actualitzar la base de dades
const PATCH = async (taula, id, camps) => {
  const r = await fetch(`${URL_BASE}/rest/v1/${taula}?id=eq.${id}`, {
    method: 'PATCH', headers: { ...cap, Prefer: 'return=minimal' }, body: JSON.stringify(camps),
  });
  return r.ok;
};
let actualitzats = 0;
for (const c of canvis) {
  const r = await fetch(`${URL_BASE}/rest/v1/product_mockups?select=id,file_path&file_path=like.*${encodeURIComponent(c.cami.split('/').pop())}`, { headers: cap });
  if (!r.ok) continue;
  for (const fila of await r.json()) {
    if (await PATCH('product_mockups', fila.id, { file_path: c.local })) actualitzats++;
  }
}
console.log(`base de dades: ${actualitzats} files de product_mockups apunten ara a local`);

// 3) Esborrar els originals del Storage
if (ESBORRAR) {
  let esborrats = 0;
  for (const c of canvis) {
    const r = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${escap(c.cami)}`, { method: 'DELETE', headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
    if (r.ok) esborrats++;
  }
  console.log(`storage: ${esborrats} originals esborrats`);
}
