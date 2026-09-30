// TEMPORAL (28/09/2026): els clics que estaven tapats ara arriben?
// El `click` de Playwright comprova que l'element rebi l'esdeveniment al seu
// punt: si estigues tapat, fallaria.
// Us: node scripts/_tmp-verifica-clics.mjs [obert|tancat] [amplada] [alcada]
import { chromium } from '@playwright/test';

const estat = process.argv[2] || 'obert';
const ample = Number(process.argv[3] || 768);
const alt = Number(process.argv[4] || 1024);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: ample, height: alt }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(estat === 'obert'
  ? 'http://127.0.0.1:3003/nova/inici?active=first_contact'
  : 'http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
if (estat === 'obert') {
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(9000);
}

const prova = async (nom, objectiu, comprova) => {
  try {
    await objectiu.click({ timeout: 6000 });
    await p.waitForTimeout(800);
    const r = comprova ? await p.evaluate(comprova) : 'ok';
    console.log(`  OK    ${nom}  ->  ${JSON.stringify(r)}`);
  } catch (e) {
    console.log(`  FALLA ${nom}  ->  ${String(e.message).split('\n').slice(3, 5).join(' ').slice(0, 200)}`);
  }
};

// Nomes els elements DINS la pantalla: al DOM hi ha mes d'una instancia de cada.
const dins = (sel) => p.evaluateHandle((s) => [...document.querySelectorAll(s)]
  .find((el) => { const r = el.getBoundingClientRect(); return r.width > 2 && r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; }), sel);

console.log(`### ${estat} · ${ample}x${alt} ###`);

await prova('selector BLANC', p.locator('[data-taula-vertical="2"] [data-taula-cela="1"] button[aria-label="Blanc"]'),
  () => {
    const bar = [...document.querySelectorAll('[data-stripe-buttonbar]')].find((x) => { const r = x.getBoundingClientRect(); return r.width > 5 && r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; });
    const pa = [...bar.querySelectorAll('span')].find((s) => getComputedStyle(s).position === 'absolute' && getComputedStyle(s).backgroundColor === 'rgb(255, 255, 255)');
    const rb = bar.getBoundingClientRect(); const rp = pa.getBoundingClientRect();
    const sel = [...bar.querySelectorAll('button')].filter((x) => getComputedStyle(x.querySelector('span')).fontWeight === '400').map((x) => x.getAttribute('aria-label'));
    return { pastillaPct: +(((rp.top - rb.top) / rb.height) * 100).toFixed(1), seleccionat: sel };
  });

await prova('cadenat', p.locator('button[aria-label="Bloca el megaslide"], button[aria-label="Desbloca el megaslide"]'),
  () => {
    const boto = document.querySelector('button[aria-label="Bloca el megaslide"], button[aria-label="Desbloca el megaslide"]');
    const vel = document.querySelector('div.z-\\[9989\\]');
    return { aria: boto && boto.getAttribute('aria-label'), velPe: vel ? getComputedStyle(vel).pointerEvents : null };
  });

// L'ultim: el dibuix de la franja obre el producte (navega).
await prova('dibuix de la franja', p.locator('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"] .clic-area-overlay .tshirt-outline').first,
  () => location.pathname + location.search);
await p.waitForTimeout(1500);
console.log(`        url final: ${await p.evaluate(() => location.pathname + location.search)}`);
await b.close();
