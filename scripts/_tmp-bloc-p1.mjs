// TEMPORAL — el bloc de la dreta de la p1: fletxes i selector.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(8000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const m = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { x: +x.left.toFixed(1), fi: +x.right.toFixed(1), w: +x.width.toFixed(1), y: +x.top.toFixed(1), b: +(x.top + x.height).toFixed(1), h: +x.height.toFixed(1) }; };
  const v1x = v1.getBoundingClientRect().left;
  const bloc = v1.querySelector('[data-bloc-dreta-p1]');
  const fletxes = v1.querySelector('[data-fletxes-p1]');
  const sel = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
  const rel = (q) => (q ? { ...m(q), x: +(q.getBoundingClientRect().left - v1x).toFixed(1), fi: +(q.getBoundingClientRect().right - v1x).toFixed(1) } : null);
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const v2x = v2.getBoundingClientRect().left;
  const f2 = v2.querySelector('[data-stripe-visual-content="2"]');
  const rel2 = (q) => (q ? { x: +(q.getBoundingClientRect().left - v2x).toFixed(1), w: +q.getBoundingClientRect().width.toFixed(1), y: +q.getBoundingClientRect().top.toFixed(1), h: +q.getBoundingClientRect().height.toFixed(1) } : null);
  return { bloc: rel(bloc), fletxes: rel(fletxes), selector: rel(sel), franjaP1: rel(v1.querySelector('[data-stripe-visual-content="1"]')), franjaP2: rel2(f2) };
});
console.log(`${w}x${h}`);
for (const [k, v] of Object.entries(r)) console.log(`  ${k.padEnd(9)} ${JSON.stringify(v)}`);
const a = r.franjaP1; const c = r.franjaP2;
if (a && c) console.log(`  DIFF      x ${(c.x - a.x).toFixed(1)}  ample ${(c.w - a.w).toFixed(1)}  y ${(c.y - a.y).toFixed(1)}  alcada ${(c.h - a.h).toFixed(1)}`);
await b.close();
