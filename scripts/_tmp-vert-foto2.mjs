// TEMPORAL (28/09/2026): FOTO de la vista vertical (768x1024), p1 i p2, per
// comparar-la amb la referencia del 23/09.
// Us: node scripts/_tmp-vert-foto2.mjs <etiqueta> [actiu]
import { chromium } from '@playwright/test';

const etiqueta = process.argv[2] || 'ara';
// L'actiu, opcional (`... ancorada miscellania`): amb la primera colleccio la
// pastilla s'ancora a dalt; amb l'ultima, a baix.
const actiu = process.argv[3] || 'first_contact';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${actiu}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

await p.screenshot({ path: `_tmp-vert-${etiqueta}-p1-full.png`, fullPage: true });
console.log(`desat _tmp-vert-${etiqueta}-p1-full.png`);

for (const pag of [1, 2]) {
  for (const [nom, sel] of [
    ['taula', `[data-taula-vertical="${pag}"]`],
  ]) {
    const el = await p.$(sel);
    if (!el) { console.log(`sense ${sel}`); continue; }
    const fitxer = `_tmp-vert-${etiqueta}-p${pag}-${nom}.png`;
    await el.screenshot({ path: fitxer });
    console.log(`desat ${fitxer}`);
  }
}
console.log('errors:', errors.length ? errors.join(' | ') : 'cap');
await b.close();
