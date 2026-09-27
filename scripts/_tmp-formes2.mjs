// TEMPORAL — no es coiteja. Les quatre formes, dibuixades a la mateixa escala.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1400, height: 420 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const codi = readFileSync('src/config/vectorFranja.js', 'utf8');
const treu = (nom) => { const i = codi.indexOf(`${nom} = '`); return codi.slice(i + nom.length + 4, codi.indexOf("';", i)); };
const dNouT2 = /<path[^>]*\sd="([^"]+)"/.exec(readFileSync('public/placeholders/cercador/clic-area-t2-t14-(5).svg', 'utf8').replace(/\n/g, ' '))[1];
const dNouT1 = /<path[^>]*\sd="([^"]+)"/.exec(readFileSync('public/placeholders/cercador/clic-area-t1-(5).svg', 'utf8').replace(/\n/g, ' '))[1];
const html = `
<style>html,body{margin:0;background:#fff;font:12px monospace}
.c{position:absolute;top:30px}
svg{display:block;width:300px;height:300px;border:1px solid #ddd}
</style>
<div class="c" style="left:10px">t2 nova (306x307)<svg viewBox="0 0 306 307"><path d="${dNouT2}" fill="#e11d48" opacity="0.85"/></svg></div>
<div class="c" style="left:330px">codi samarreta (306x307)<svg viewBox="0 0 306 307"><path d="${treu('VECTOR_FRANJA_SAMARRETA')}" fill="#2563eb" opacity="0.85"/></svg></div>
<div class="c" style="left:650px">t1 nova (242x307)<svg viewBox="0 0 242 307"><path d="${dNouT1}" fill="#e11d48" opacity="0.85"/></svg></div>
<div class="c" style="left:970px">codi impressio (242x307)<svg viewBox="0 0 242 307"><path d="${treu('VECTOR_FRANJA_IMPRESSIO')}" fill="#2563eb" opacity="0.85"/></svg></div>`;
await p.setContent(html);
await p.waitForTimeout(300);
await p.screenshot({ path: '_tmp-formes-comparacio.png', clip: { x: 0, y: 0, width: 1290, height: 340 } });
console.log('desat _tmp-formes-comparacio.png');
await ctx.close();
await b.close();
