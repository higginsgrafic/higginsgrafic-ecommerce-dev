import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const bloc = v1.querySelector('[data-bloc-dreta-p1]');
  const capa = bloc.children[0];
  const botons = bloc.children[1];
  const past = bloc.querySelector('[data-pastilla-p1]');
  const peces = [...botons.children];
  const info = (el, nom) => {
    const cs = getComputedStyle(el);
    return `${nom} z=${cs.zIndex} pos=${cs.position} bg=${cs.backgroundColor} ov=${cs.overflow}`;
  };
  const q = past.getBoundingClientRect();
  const c = [q.left + q.width / 2, q.top + q.height / 2];
  return {
    capa: info(capa, 'capaCaixa'),
    botons: info(botons, 'capaBotons'),
    pastilla: info(past, 'pastilla'),
    peces: peces.map((e, i) => info(e, `peca${i}`)),
    puntPastilla: c.map((n) => Math.round(n)),
    sotaElPunt: document.elementsFromPoint(c[0], c[1]).slice(0, 8).map((e) => `${e.tagName.toLowerCase()}${e.dataset && e.dataset.pastillaP1 ? '[pastilla]' : ''} z=${getComputedStyle(e).zIndex} bg=${getComputedStyle(e).backgroundColor}`),
  };
});
console.log(JSON.stringify(r, null, 1));
const peca = await p.locator('[data-mega-page-viewport="1"] [data-bloc-dreta-p1]').boundingBox();
if (peca) {
  await p.screenshot({
    path: '_tmp-zoom-selector-1024.png',
    clip: { x: peca.x + peca.width - 110, y: peca.y - 10, width: 110, height: peca.height + 20 },
  });
}
await ctx.close();
await b.close();
