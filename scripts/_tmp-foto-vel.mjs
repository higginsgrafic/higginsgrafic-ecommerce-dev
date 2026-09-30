// TEMPORAL (28/09/2026): captura la franja de la p2 (vista vertical) ampliada,
// per veure el dibuix de les samarretes velades respecte del vel.
// Us: node scripts/_tmp-foto-vel.mjs <etiqueta> [actiu] [ampliacio]
import { chromium } from '@playwright/test';

const etiqueta = process.argv[2] || 'ara';
const actiu = process.argv[3] || 'first_contact';
const escala = Number(process.argv[4] || 3);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: escala });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 100)); });
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${actiu}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

const n = await p.evaluate(() => document.querySelectorAll('[data-stripe-visual-content="2"]').length);
console.log(`panells de franja trobats: ${n}`);
// Els panells de franja no son "visibles" per Playwright (algun ancestre els
// amaga), aixi que es captura la taula vertical, que si que ho es.
const taula = await p.$('[data-taula-vertical="2"]');
if (!taula) {
  console.log('sense taula vertical');
} else {
  const caixa = await taula.boundingBox();
  const fitxer = `_tmp-vel-${etiqueta}-p2-taula.png`;
  await taula.screenshot({ path: fitxer });
  console.log(`desat ${fitxer} (${Math.round(caixa.width)}x${Math.round(caixa.height)} px)`);
}

// Qui té vel i on va el dibuix, casa per casa (vista vertical).
const info = await p.evaluate(() => {
  const capa = document.querySelector('[data-stripe-drawing-layer]');
  const panell = capa && capa.closest('[data-stripe-visual-content="2"]');
  if (!panell) return null;
  const zDe = (el) => (el ? getComputedStyle(el).zIndex : null);
  return {
    zCapaDibuixos: zDe(capa),
    fills: [...panell.children].map((f) => ({
      etiqueta: f.tagName.toLowerCase(),
      z: getComputedStyle(f).zIndex,
      pos: getComputedStyle(f).position,
      vel: f.tagName.toLowerCase() === 'img' && /data:image\/svg/.test(f.getAttribute('src') || ''),
    })),
  };
});
console.log(JSON.stringify(info, null, 1));
console.log('errors:', errors.length ? errors.join(' | ') : 'cap');
await b.close();
