// TEMPORAL (28/09/2026): quant triga i quant baixa cada canvi de colleccio.
// Us: node scripts/_tmp-perf-imatges.mjs [port]
import { chromium } from '@playwright/test';

const port = process.argv[2] || '3003';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

let comptant = false;
let peticions = 0;
let bytes = 0;
const vistes = new Map();
p.on('request', (r) => { if (comptant && r.url().includes('/custom_logos/')) peticions += 1; });
p.on('response', (r) => {
  if (!comptant || !r.url().includes('/custom_logos/')) return;
  const n = Number(r.headers()['content-length']) || 0;
  bytes += n;
  vistes.set(r.url().split('/').pop(), (vistes.get(r.url().split('/').pop()) || 0) + 1);
});

await p.goto(`http://127.0.0.1:${port}/nova/inici?active=first_contact`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const clica = (idx) => p.evaluate((i) => {
  document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[i].click();
}, idx);

// Temps fins que TOTES les imatges de la taula vertical estan carregades.
const esperaImatges = () => p.evaluate(async () => {
  const taula = document.querySelector('[data-taula-vertical="2"]') || document.body;
  const t0 = performance.now();
  for (let i = 0; i < 600; i += 1) {
    const imgs = [...taula.querySelectorAll('img')];
    const pendents = imgs.filter((im) => !(im.complete && im.naturalWidth > 0));
    if (!imgs.length || !pendents.length) return { ms: +(performance.now() - t0).toFixed(0), n: imgs.length, pendents: 0 };
    await new Promise((r) => requestAnimationFrame(r));
  }
  const imgs = [...taula.querySelectorAll('img')];
  return { ms: 10000, n: imgs.length, pendents: imgs.filter((im) => !(im.complete && im.naturalWidth > 0)).length };
});

const noms = await p.evaluate(() => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')].map((b) => b.textContent.trim()));
console.log(`port ${port}`);
console.log('  colleccio        peticions   transferit   imatges   tot carregat');
const ordre = ['miscellania', 'first_contact', 'miscellania', 'cube', 'miscellania'];
for (const nom of ordre) {
  const idx = noms.findIndex((n) => n.toLowerCase().startsWith(nom.slice(0, 5)));
  comptant = true; peticions = 0; bytes = 0;
  const t0 = Date.now();
  await clica(idx);
  const r = await esperaImatges();
  const total = Date.now() - t0;
  comptant = false;
  console.log(`  ${nom.padEnd(16)} ${String(peticions).padStart(6)}   ${(bytes / 1024).toFixed(0).padStart(7)} KB   ${String(r.n).padStart(5)}   ${String(total).padStart(6)} ms  (espera imatges ${r.ms} ms${r.pendents ? `, ${r.pendents} penjades` : ''})`);
}
await b.close();
