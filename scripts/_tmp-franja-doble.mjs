// TEMPORAL (29/09/2026): comprova al navegador la franja doble (vertical/p2).
// Us: node scripts/_tmp-franja-doble.mjs
import { chromium } from '@playwright/test';
const BASE = 'http://127.0.0.1:3003';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1024, height: 1366 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const fallades = [];
p.on('response', (r) => {
  const u = r.url();
  if (r.status() >= 400) fallades.push(`${r.status()} ${u.replace(BASE, '')}`);
  if (/doble/.test(u)) console.log(`  resposta ${r.status()} ${u.replace(BASE, '')}`);
});

const CASOS = [
  ['megaslide-vertical', '/nova/inici?active=austen&sub=looking_for_my_darcy'],
  ['menu-vertical', '/nova/inici?active=first_contact'],
];
for (const [nom, url] of CASOS) {
  await p.goto(BASE + url, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(6000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(12000);
  const r = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')].filter((i) => /doble/.test(i.getAttribute('src') || ''));
    return imgs.map((i) => {
      const q = i.getBoundingClientRect();
      return { src: i.getAttribute('src'), natural: `${i.naturalWidth}x${i.naturalHeight}`,
               pintada: `${Math.round(q.width)}x${Math.round(q.height)}`, x: Math.round(q.x),
               trencada: i.complete && i.naturalWidth === 0 };
    });
  });
  console.log(`${nom}: ${r.length} imatge(s) doble`);
  for (const x of r) console.log('   ', x.src.split('/').slice(-2).join('/'), x.natural, 'pintada', x.pintada, 'x=', x.x, 'trencada:', x.trencada);
  await p.screenshot({ path: `_tmp-franja-doble-${nom}.png` });
}
console.log('respostes >=400:', fallades.length ? [...new Set(fallades)].join('\n  ') : 'cap');
await b.close();
