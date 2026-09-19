#!/usr/bin/env node
/**
 * Sonda de la vista VERTICAL del megaslide (pàgina 1).
 *
 * Mesura les peces de la composició vertical i les del belt, per comprovar que
 * el trasllat del paradigma (secció 32 del testimoni) no ha deixat res de
 * l'horitzontal a la vertical.
 *
 *   node scripts/sonda-vertical.mjs                       # 768 x 1024
 *   node scripts/sonda-vertical.mjs 1024 768
 *   node scripts/sonda-vertical.mjs 768 1024 --captura    # desa /tmp/vertical-<mida>.png
 *   node scripts/sonda-vertical.mjs 768 1024 --html       # bolca l'estructura de la pàgina 1
 *
 * Contra el servidor de sempre (3003, el Vite de desenvolupament) no cal
 * compilar.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.HG_URL || 'http://127.0.0.1:3003';
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const AMPLE = Number(args[0]) || 768;
const ALT = Number(args[1]) || 1024;
const CAPTURA = process.argv.includes('--captura');
const HTML = process.argv.includes('--html');

const sonda = () => {
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), bottom: Math.round(b.bottom) };
  };
  const q = (sel) => document.querySelector(sel);
  const panell = q('[data-mega-panel-surface="1"]');
  const guarda = q('[data-stripe-bottom]');
  const vista1 = q('[data-mega-page-viewport="1"]');
  const vertical = q('[data-vertical-composicio="1"]');
  const scroll = q('[data-vertical-scroll="1"]');
  const samarretes = vertical ? [...vertical.querySelectorAll('[data-vertical-samarreta]')] : [];
  const samarretesAmb = samarretes.filter((b) => b.querySelector('img'));
  const amagats = [];
  if (vista1) {
    for (const el of vista1.querySelectorAll('*')) {
      const cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') {
        amagats.push({ tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 50) });
      }
    }
  }
  return {
    finestra: { w: window.innerWidth, h: window.innerHeight },
    carrusel: (() => {
      const track = document.querySelector('[data-stripe-bottom] div[style*="width: 400%"]');
      return track ? track.style.transform : null;
    })(),
    puntVisible: (() => {
      const el = document.elementFromPoint(Math.round(window.innerWidth / 2), 200);
      return el ? `${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 30)}` : null;
    })(),
    panell: r(panell),
    guarda: r(guarda),
    vista1: vista1 ? { ...r(vista1), scrollW: vista1.scrollWidth, scrollH: vista1.scrollHeight, clientW: vista1.clientWidth, clientH: vista1.clientHeight, scrollY: Math.round(vista1.scrollTop) } : null,
    scrollVertical: r(scroll),
    vertical: r(vertical),
    graellaVertical: r(q('[data-vertical-graella="1"]')),
    colleccionsVertical: r(q('[data-vertical-colleccions="1"]')),
    botonsVertical: r(q('[data-vertical-botons="1"]')),
    franjaVertical: r(q('[data-vertical-franja="1"]')),
    franjaBeltP1: r(q('[data-stripe-visual-content="1"]')),
    graellaBeltP1: r(q('[data-mega-page-viewport="1"] .grid-cols-9')),
    samarretes: samarretes.length,
    samarretesAmbImatge: samarretesAmb.length,
    alcadaSamarreta: samarretes[0] ? Math.round(samarretes[0].getBoundingClientRect().height) : null,
    totalImatgesP1: document.querySelectorAll('[data-mega-page-viewport="1"] img').length,
    amagats: amagats.slice(0, 8),
  };
};

const navegador = await chromium.launch();
const ctx = await navegador.newContext({ viewport: { width: AMPLE, height: ALT }, hasTouch: true, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
await page.goto(`${BASE}/?active=first_contact`, { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(2500);
// El cercador obre la pagina 2 (el commutador tambe la tanca, aixi que un sol
// clic). Es fa servir el mateix selector que la resta d'scripts de mesura.
await page.click('button:has(svg.lucide-search)').catch(() => {});
await page.waitForSelector('[data-mega-panel-surface="1"]', { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(4000);

// El carrusel ha d'estar a la pàgina 2 (translateX(-25%)). Si no, s'espera.
const carruselAla2 = async () => page.evaluate(() => {
  const track = document.querySelector('[data-stripe-bottom] div[style*="width: 400%"]');
  return Boolean(track && /translateX\(-25%\)/.test(track.style.transform));
});
for (let i = 0; i < 10 && !(await carruselAla2()); i += 1) {
  await page.waitForTimeout(500);
}
const d = await page.evaluate(sonda);
d.errors = errors;
if (HTML) {
  d.html = await page.evaluate(() => {
    const el = document.querySelector('[data-mega-page-viewport="1"]');
    if (!el) return null;
    const neta = (node, fondaria = 0) => {
      if (fondaria > 6) return '';
      const b = node.getBoundingClientRect();
      const cs = window.getComputedStyle(node);
      const id = [node.tagName.toLowerCase(), (node.className || '').toString().split(' ').slice(0, 3).join('.')].filter(Boolean).join('.');
      let out = `${'  '.repeat(fondaria)}${id} [${Math.round(b.left)},${Math.round(b.top)} ${Math.round(b.width)}x${Math.round(b.height)}] disp=${cs.display} pos=${cs.position} ovf=${cs.overflow}\n`;
      for (const fill of node.children) out += neta(fill, fondaria + 1);
      return out;
    };
    return neta(el);
  });
}
if (CAPTURA) {
  const fitxer = `/tmp/vertical-${AMPLE}x${ALT}.png`;
  await page.screenshot({ path: fitxer });
  d.captura = fitxer;
}
console.log(JSON.stringify(d, null, 2));
await navegador.close();
