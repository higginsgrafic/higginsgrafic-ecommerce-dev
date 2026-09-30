// TEMPORAL (28/09/2026): per que triga a canviar de colleccio. Perfila la CPU
// amb el CDP mentre es clica una colleccio de la columna de la taula vertical.
// Us: node scripts/_tmp-perf-canvi.mjs [actiu]
import { chromium } from '@playwright/test';

const objectiu = process.argv[2] || 'miscellania';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const recursos = [];
p.on('request', (r) => recursos.push(r.url()));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const cdp = await ctx.newCDPSession(p);
await cdp.send('Profiler.enable');
await cdp.send('Profiler.setSamplingInterval', { interval: 200 });

const idx = await p.evaluate((key) => {
  const llista = [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')];
  return llista.findIndex((el) => el.textContent.trim().toLowerCase().startsWith(key.slice(0, 5).toLowerCase()));
}, objectiu);
if (idx < 0) { console.log('no trobo la colleccio', objectiu); await b.close(); process.exit(1); }

recursos.length = 0;
await cdp.send('Profiler.start');
const resultat = await p.evaluate(async (i) => {
  const caixa = document.querySelector('[data-colleccions-caixes="1"]');
  const boto = caixa.querySelectorAll('button')[i];
  const t0 = performance.now();
  boto.click();
  // Espera que la pastilla sigui al boto clicat i que s'hagi pintat.
  await new Promise((res) => {
    const mirar = () => {
      if (boto.getAttribute('aria-current') === 'true') res();
      else requestAnimationFrame(mirar);
    };
    mirar();
  });
  const tActiu = performance.now();
  await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  const tPintat = performance.now();
  return { tActiu: +(tActiu - t0).toFixed(1), tPintat: +(tPintat - t0).toFixed(1) };
}, idx);
const { profile } = await cdp.send('Profiler.stop');

// Temps propi per funcio, a partir de les mostres.
const perNode = new Map();
for (let i = 0; i < profile.samples.length; i += 1) {
  const id = profile.samples[i];
  perNode.set(id, (perNode.get(id) || 0) + (profile.timeDeltas[i] || 0));
}
const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
const perFuncio = new Map();
for (const [id, us] of perNode) {
  const n = nodes.get(id);
  if (!n) continue;
  const cf = n.callFrame;
  const nom = `${cf.functionName || '(anonim)'}  ${(cf.url || '').split('/').slice(-1)[0]}:${cf.lineNumber + 1}`;
  perFuncio.set(nom, (perFuncio.get(nom) || 0) + us);
}
const top = [...perFuncio.entries()].sort((a, c) => c[1] - a[1]).slice(0, 22);
const total = [...perFuncio.values()].reduce((a, c) => a + c, 0);

console.log(`\nclic a "${objectiu}"`);
console.log(`  pastilla activa al cap de: ${resultat.tActiu} ms`);
console.log(`  pintat estable al cap de:  ${resultat.tPintat} ms`);
console.log(`  perfils mostrejats: ${(total / 1000).toFixed(1)} ms de CPU`);
console.log(`  peticions durant el clic: ${recursos.length}`);
const urls = [...new Set(recursos)].slice(0, 8);
for (const u of urls) console.log(`    ${u.slice(0, 120)}`);

console.log('\n--- top 22 de temps propi ---');
for (const [nom, us] of top) {
  console.log(`  ${(us / 1000).toFixed(1).padStart(7)} ms  ${(100 * us / total).toFixed(1).padStart(4)} %  ${nom}`);
}

// Per fitxer, que es el que diu on mirar.
const perFitxer = new Map();
for (const [id, us] of perNode) {
  const n = nodes.get(id);
  if (!n || !n.callFrame.url) continue;
  const f = n.callFrame.url.split('/').slice(-1)[0].split('?')[0];
  perFitxer.set(f, (perFitxer.get(f) || 0) + us);
}
console.log('\n--- top 12 de fitxers ---');
for (const [f, us] of [...perFitxer.entries()].sort((a, c) => c[1] - a[1]).slice(0, 12)) {
  console.log(`  ${(us / 1000).toFixed(1).padStart(7)} ms  ${(100 * us / total).toFixed(1).padStart(4)} %  ${f}`);
}
await b.close();
