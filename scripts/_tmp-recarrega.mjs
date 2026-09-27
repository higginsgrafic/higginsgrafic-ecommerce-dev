// TEMPORAL — no es comiteja. Clicar una colleccio recarrega la pagina? Es
// compten les carregues de document (load) i les navegacions, i es mira si el
// panell es remunta.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

await p.addInitScript(() => {
  window.__c = { loads: 0, dom: 0, pageshow: 0, navigacions: 0, marques: [] };
  window.addEventListener('load', () => { window.__c.loads += 1; });
  window.addEventListener('DOMContentLoaded', () => { window.__c.dom += 1; });
  window.addEventListener('pageshow', (e) => { window.__c.pageshow += 1; window.__c.marques.push('pageshow persisted=' + e.persisted); });
  window.addEventListener('beforeunload', () => { window.__c.marques.push('beforeunload'); });
  window.addEventListener('pagehide', (e) => { window.__c.marques.push('pagehide persisted=' + e.persisted); });
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);

const abans = await p.evaluate(() => JSON.parse(JSON.stringify(window.__c)));
console.log('abans :', JSON.stringify(abans));

const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => /CUBE/i.test(x.textContent || '')) || null);
const bb = await card.asElement().boundingBox();
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await p.waitForTimeout(1500);

const mig = await p.evaluate(() => JSON.parse(JSON.stringify(window.__c)));
console.log('despres:', JSON.stringify(mig));
console.log('han canviat les carregues?', mig.loads !== abans.loads ? 'SI, RECARREGA' : 'no');
console.log('marques:', JSON.stringify(mig.marques.slice(abans.marques.length)));
console.log('url:', p.url());
await b.close();
