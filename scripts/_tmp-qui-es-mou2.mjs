// TEMPORAL — no es comiteja. Quina peça s'ha mogut?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(4500);
const d = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const q = (s) => v2.querySelector(s);
  const t = (el) => (el ? +el.getBoundingClientRect().top.toFixed(2) : null);
  const clip = q('[data-carrusel="1"]');
  const graella = clip.querySelector(':scope > div');
  const tira = graella.querySelector(':scope > div');
  const peces = [...tira.querySelectorAll('button')];
  return {
    v2: t(v2),
    panel: t(document.querySelector('[data-mega-panel-surface="1"]')),
    filera: t(q('[data-p2-cercador-row]')),
    contenidor: t(clip),
    retall: t(graella),
    tira: t(tira),
    filera0: t(peces[0]),
    filera1: t(peces[1]),
    selector: t(q('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
    selectorPastilla: t(q('[data-p2-color-selector] button[aria-label="Color"]')),
    franja: t(q('[data-stripe-visual-content="2"]')),
  };
});
for (const [k, v] of Object.entries(d)) console.log(`  ${k.padEnd(16)} ${v}`);
await b.close();
