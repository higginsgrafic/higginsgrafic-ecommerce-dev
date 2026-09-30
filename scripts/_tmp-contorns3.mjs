// TEMPORAL — la columna de colleccions i el bloc de la p1: caixes tornades.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 140)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 60000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const s = (el) => { if (!el) return null; const cs = getComputedStyle(el); const x = el.getBoundingClientRect(); return { bg: cs.backgroundColor, vora: cs.borderTopWidth + ' ' + cs.borderTopColor, ombra: cs.boxShadow === 'none' ? 'none' : 'si', w: +x.width.toFixed(1), h: +x.height.toFixed(1) }; };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const enllacos = [...v2.querySelectorAll('[data-colleccions-targeta="1"]')];
  const columna = enllacos.length ? enllacos[0].parentElement : null;
  const blocP1 = v1.querySelector('[data-bloc-dreta-p1="1"]');
  const fillP1 = blocP1 ? [...blocP1.querySelectorAll('*')].find((e) => getComputedStyle(e).borderTopStyle !== 'none' || getComputedStyle(e).boxShadow !== 'none') : null;
  return { columna: s(columna), nEnllacos: enllacos.length, blocP1: s(blocP1), fillP1: s(fillP1) };
});
console.log(`${w}x${h}  columna`, JSON.stringify(r.columna), `(${r.nEnllacos} enllacos)`);
console.log(`   blocP1`, JSON.stringify(r.blocP1), ' fillP1', JSON.stringify(r.fillP1), ' errors=', errors.length);
await b.close();
