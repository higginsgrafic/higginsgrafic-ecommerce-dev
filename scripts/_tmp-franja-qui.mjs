import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1024, height: 768 } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const bloc = v1.querySelector('[data-bloc-dreta-p1]');
  const out = [];
  const mira = (el, nom) => {
    const cs = getComputedStyle(el);
    if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.boxShadow !== 'none') {
      const q = el.getBoundingClientRect();
      out.push(`${nom} ${el.tagName.toLowerCase()} x${Math.round(q.width)} bg=${cs.backgroundColor} ombra=${cs.boxShadow !== 'none' ? 'si' : 'no'}`);
    }
  };
  mira(bloc, 'bloc');
  [...bloc.querySelectorAll('*')].forEach((el, i) => mira(el, `fill${i}`));
  // I tambe els germans del bloc dins la filera
  const fila = v1.querySelector('[data-filera-p1="1"]');
  if (fila) [...fila.children].forEach((el, i) => mira(el, `fila${i}`));
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
