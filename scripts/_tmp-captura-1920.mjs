// TEMPORAL — no es comiteja. Una captura de 1920x1080 de la PAGINA 2 amb la
// finestra pixelada dibuixada a sobre: un quadrat d'un color fosc
// semitransparent per mesurar les peces a l'editor, amb la deformacio del
// monitor inclosa.
import { chromium } from '@playwright/test';
const AMPLE = 1920;
const ALT = 1080;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: AMPLE, height: ALT }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
// La malla de la finestra: moc les pagines per deixar la 2 al davant i, a sobre,
// els quadrats.
const info = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  let tira = v2.parentElement;
  while (tira && !(tira.style && tira.style.width === '400%')) tira = tira.parentElement;
  if (tira) { tira.style.transition = 'none'; tira.style.transform = 'translateX(-25%)'; }
  const capa = document.createElement('div');
  capa.id = 'hg-finestra';
  capa.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none';
  capa.innerHTML = `
    <div style="position:absolute;left:40px;top:40px;width:100px;height:100px;background:rgba(0,0,0,0.45)"></div>
    <div style="position:absolute;left:40px;top:146px;font:11px/1.2 monospace;color:#000">quadrat de 100x100 px (a 40,40)</div>
  `;
  document.body.appendChild(capa);
  const peces = {
    carril: (() => { const el = document.querySelector('[data-capcalera-fila="1"]'); const r = el.getBoundingClientRect(); return { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; })(),
    carrusel: (() => { const el = document.querySelector('[data-mega-page-viewport="2"] [data-carrusel="1"]'); const r = el.getBoundingClientRect(); return { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; })(),
    selector: (() => { const el = document.querySelector('[data-mega-page-viewport="2"] [data-p2-color-selector] [data-stripe-buttonbar="bn"]'); const r = el.getBoundingClientRect(); return { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; })(),
    columna: (() => { const el = document.querySelector('[data-mega-page-viewport="2"] [data-colleccions-targeta]').parentElement; const r = el.getBoundingClientRect(); return { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; })(),
    franja: (() => { const el = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-visual-content="2"]'); const r = el.getBoundingClientRect(); return { x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; })(),
  };
  return { finestra: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio }, peces };
});
await p.waitForTimeout(400);
await p.screenshot({ path: '_tmp-p2-1920x1080-finestra.png', clip: { x: 0, y: 0, width: AMPLE, height: ALT } });
console.log(JSON.stringify(info, null, 1));
console.log('desat _tmp-p2-1920x1080-finestra.png');
await ctx.close();
await b.close();
