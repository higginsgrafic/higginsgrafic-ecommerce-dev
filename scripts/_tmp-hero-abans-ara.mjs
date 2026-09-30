// TEMPORAL (28/09/2026): LA HERO A 50 px DEL FONS, ABANS I ARA.
//
// Captura la part de sota de la hero a 1920x946, amb una ratlla vermella al
// punt exacte que demana en Marc (946 − 50 = 896), i deixa les dues imatges de
// costat a `_tmp-hero-50px.png`:
//
//   ABANS · la cel·la centrava la hero (67,4 px d'aire a sota)
//   ARA   · la cel·la l'alinea al fons amb 50 px d'aire
//
// L'ABANS es reconstrueix nome's per a la captura, tornant a posar el centratge
// i traient l'aire: no toca cap fitxer.
//
// Us: node scripts/_tmp-hero-abans-ara.mjs
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const MIDA = { width: 1920, height: 946 };
const ZONA = { x: 0, y: 360, width: 1905, height: 586 };
const RATLLA_Y = 896 - ZONA.y; // 946 - 50

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: MIDA, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(7000);
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(800);

const mesura = () => p.evaluate(() => {
  const c = document.querySelector('[data-hero-caixa="1"]')?.getBoundingClientRect();
  return c ? { top: +c.top.toFixed(1), bottom: +c.bottom.toFixed(1), baix: +(window.innerHeight - c.bottom).toFixed(1) } : null;
});

const captura = async () => {
  const crua = await p.screenshot({ clip: ZONA });
  const ratlla = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ZONA.width}" height="2">`
    + `<rect width="${ZONA.width}" height="2" fill="#E11D48"/></svg>`,
  );
  return sharp(crua).composite([{ input: ratlla, left: 0, top: RATLLA_Y }]).png().toBuffer();
};

// ABANS (reconstruit nome's per a la captura).
await p.addStyleTag({ content: '[data-cella="2"] { justify-content: center !important; padding-block-end: 0 !important; }' });
await p.waitForTimeout(600);
const abans = await mesura();
const imgAbans = await captura();
console.log('ABANS  hero', JSON.stringify(abans));
await p.evaluate(() => { document.querySelectorAll('style').forEach((s) => { if (s.textContent.includes('padding-block-end: 0 !important')) s.remove(); }); });
await p.waitForTimeout(600);

const ara = await mesura();
const imgAra = await captura();
console.log('ARA    hero', JSON.stringify(ara));

// Les dues, de costat, amb la ratlla vermella a 50 px del fons.
const svgCapcalera = `<svg xmlns="http://www.w3.org/2000/svg" width="${ZONA.width * 2 + 20}" height="34">`
  + `<text x="${ZONA.width / 2}" y="23" font-family="Helvetica,Arial" font-size="19" font-weight="bold" text-anchor="middle" fill="#111">ABANS · 67,4 px</text>`
  + `<text x="${ZONA.width + 20 + ZONA.width / 2}" y="23" font-family="Helvetica,Arial" font-size="19" font-weight="bold" text-anchor="middle" fill="#111">ARA · 50 px</text>`
  + '</svg>';
const sortida = await sharp({
  create: { width: ZONA.width * 2 + 20, height: ZONA.height + 34, channels: 3, background: { r: 255, g: 255, b: 255 } },
})
  .composite([
    { input: Buffer.from(svgCapcalera), left: 0, top: 0 },
    { input: imgAbans, left: 0, top: 34 },
    { input: imgAra, left: ZONA.width + 20, top: 34 },
  ])
  .png()
  .toBuffer();
writeFileSync('_tmp-hero-50px.png', sortida);
console.log('desada _tmp-hero-50px.png  (la ratlla vermella es el punt de 50 px del fons)');

console.log('\n=== ERRORS DE CONSOLA ===');
console.log(errors.length ? errors.join('\n') : 'cap error');

await ctx.close();
await b.close();
