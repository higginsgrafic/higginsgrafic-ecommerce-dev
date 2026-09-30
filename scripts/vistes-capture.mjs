#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Captura de VISTES (01/10/2026)
 * ------------------------------
 * Captura una llista de vistes (una ruta i una mida de finestra cadascuna) amb
 * Chromium i desa un PNG per vista:
 *
 *   public/captures/<slug>-<ample>x<alt>-p<1|2>-vista.png    (nome's el que es veu)
 *   public/captures/<slug>-<ample>x<alt>-p<1|2>-pagina.png   (tota la tirada)
 *
 * LA PAGINA DEL MEGASLIDE (01/10/2026). Viu a `sessionStorage` (`HG_MEGA_PAGE`),
 * que es PER NAVEGADOR: la captura s'obre en un navegador nou i sempre hi
 * trobava la pagina 1 («no puc fer les captures de la p2: quan les faig, surt la
 * p1 igualment»). Per aixo cada vista pot portar `pagina` i s'hi escriu ABANS que
 * carregui la pagina, amb `addInitScript`.
 *
 * VISTA I PAGINA SON DUES COSES (01/10/2026, ho ha dit l'amo: «a la captura hem
 * de distingir entre vista i pàgina»): la VISTA es la finestra (1920x1080, el
 * que es veu sense desplaçar-se) i la PAGINA es tot el contingut (els 6900 px
 * de la home). Cada vista porta el seu `mode` ('vista' o 'pagina').
 *
 * Es el que fa servir el boto «captura» de `public/browser-overlay.html` (el
 * mosaic d'iframes), a traves de l'endpoint `POST /__dev/vistes-capture` del
 * servidor de desenvolupament.
 *
 * Usage:
 *   node scripts/vistes-capture.mjs --base-url=http://localhost:3003 \
 *     --vistes-base64=<JSON en base64>   # [{ nom, ample, alt, url }]
 *
 * Per que Chromium i no Firefox: amb Firefox el `goto` d'aquestes pagines es
 * queda encallat (mesurat: mes de 5 minuts sense acabar ni una captura). Amb
 * Chromium, una vista de 1920x1080 triga uns 5 s.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true])
);
const BASE_URL = String(args['base-url'] || 'http://localhost:3003').replace(/\/$/, '');
const OUT_DIR = resolve(ROOT, String(args.out || 'public/captures'));
const NOMES = args.only ? String(args.only).split(',').map((s) => s.trim()).filter(Boolean) : null;

let vistes = [];
try {
  vistes = JSON.parse(Buffer.from(String(args['vistes-base64'] || ''), 'base64').toString('utf8'));
} catch {
  vistes = [];
}
if (!Array.isArray(vistes) || !vistes.length) {
  console.error('Sense vistes. Cal --vistes-base64 amb [{ nom, ample, alt, url }]');
  process.exit(2);
}

const slug = (s) => String(s || 'vista')
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 48) || 'vista';

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const fetes = [];
let ok = 0;
let fail = 0;

for (const v of vistes) {
  const ample = Math.max(320, Math.round(Number(v.ample) || 1280));
  const alt = Math.max(400, Math.round(Number(v.alt) || 800));
  const url = String(v.url || '/');
  // VISTA (la finestra) o PAGINA (tota la tirada).
  const mode = String(v.mode || 'vista').toLowerCase() === 'pagina' ? 'pagina' : 'vista';
  // La pagina del megaslide (1..4).
  const pagina = Math.min(4, Math.max(1, Math.round(Number(v.pagina) || 1)));
  if (NOMES && !NOMES.includes(String(v.nom))) continue;
  const nom = `${slug(v.nom)}-${ample}x${alt}-p${pagina}-${mode}`;
  const context = await browser.newContext({ viewport: { width: ample, height: alt }, deviceScaleFactor: 1 });
  // La pagina del megaslide, escrita ABANS que l'app es munti (es el mateix
  // format que `usePersistentState`: { value, expiresAt }).
  await context.addInitScript((n) => {
    try {
      window.sessionStorage.setItem('HG_MEGA_PAGE', JSON.stringify({ value: n, expiresAt: Date.now() + 10 * 60 * 1000 }));
    } catch { /* ignore */ }
  }, pagina);
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    // El megaslide triga mig segon a apareixer i la franja a quadrar-se.
    await page.waitForTimeout(1400);
    // `fullPage` NOME'S a la pagina: la vista es la finestra, sense desplaçar-se.
    await page.screenshot({ path: resolve(OUT_DIR, `${nom}.png`), fullPage: mode === 'pagina' });
    const mida = await page.evaluate(() => [document.body.scrollWidth, document.body.scrollHeight]);
    fetes.push({ nom, url, ample, alt, mode, pagina, alcada: mida[1], alcadaCapturada: mode === 'pagina' ? mida[1] : alt, fitxer: `captures/${nom}.png` });
    console.log(`OK ${nom} ${ample}x${alt} [p${pagina} ${mode}] -> ${mode === 'pagina' ? mida[1] + ' px' : alt + ' px'} d'alcada`);
    ok += 1;
  } catch (err) {
    console.log(`FAIL ${nom}: ${String(err.message).slice(0, 120)}`);
    fail += 1;
  } finally {
    await context.close();
  }
}

await browser.close();
await writeFile(resolve(OUT_DIR, 'index.json'), JSON.stringify({ generat: new Date().toISOString(), vistes: fetes }, null, 1));
console.log(`\nFet. ${ok} capturades, ${fail} fallides. Sortida: ${OUT_DIR}`);
