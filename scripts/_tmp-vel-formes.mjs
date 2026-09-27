// TEMPORAL — no es coiteja. El vel amb la forma VELLA (traçada) i amb la NOVA
// (fitxers de l'amo), sobre la mateixa franja, per veure els rombes.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
const codi = readFileSync('src/config/vectorFranja.js', 'utf8');
const treu = (nom) => { const i = codi.indexOf(`${nom} = '`); return codi.slice(i + nom.length + 4, codi.indexOf("';", i)); };
const VELLA = treu('VECTOR_FRANJA_SAMARRETA');
const t1 = readFileSync('public/placeholders/cercador/clic-area-t1-(5).svg', 'utf8').replace(/\n/g, ' ');
const t2 = readFileSync('public/placeholders/cercador/clic-area-t2-t14-(5).svg', 'utf8').replace(/\n/g, ' ');
const NOVA_AMPLA = /<path[^>]*\sd="([^"]+)"/.exec(t1)[1];
const NOVA_ESTRETA = /<path[^>]*\sd="([^"]+)"/.exec(t2)[1];
// Les dues, escalades a la mateixa alçada útil (306) i pintades amb mitja
// opacitat: on no coincideixen, es veu mes fosc.
const html = `
<style>html,body{margin:0;background:#fff;font:12px monospace}</style>
<div style="position:absolute;left:20px;top:20px">VELLA (blau) + NOVA (vermell): el que no coincideix es veu mes fosc
<svg width="900" height="320" viewBox="0 0 306 307" style="border:1px solid #ccc">
  <path d="${VELLA}" fill="#2563eb" fill-opacity="0.5"/>
  <path d="${NOVA_AMPLA}" fill="#e11d48" fill-opacity="0.5"/>
</svg></div>
<div style="position:absolute;left:20px;top:380px">NOVA ampla sola<svg width="420" height="320" viewBox="0 0 306 307" style="border:1px solid #ccc"><path d="${NOVA_AMPLA}" fill="#e11d48"/></svg></div>
<div style="position:absolute;left:470px;top:380px">VELLA sola<svg width="420" height="320" viewBox="0 0 306 307" style="border:1px solid #ccc"><path d="${VELLA}" fill="#2563eb"/></svg></div>
<div style="position:absolute;left:920px;top:380px">NOVA estreta<svg width="420" height="320" viewBox="0 0 242 307" style="border:1px solid #ccc"><path d="${NOVA_ESTRETA}" fill="#e11d48"/></svg></div>`;
await p.setContent(html);
await p.waitForTimeout(300);
await p.screenshot({ path: '_tmp-vel-formes.png', clip: { x: 0, y: 0, width: 1200, height: 720 } });
console.log('desat _tmp-vel-formes.png');
console.log('caixes:', JSON.stringify(await p.evaluate(({ v, n }) => {
  const caixa = (d) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('width', '500'); s.setAttribute('height', '500'); s.style.position = 'absolute'; s.style.left = '-9999px'; const q = document.createElementNS('http://www.w3.org/2000/svg', 'path'); q.setAttribute('d', d); s.appendChild(q); document.body.appendChild(s); const bb = q.getBBox(); s.remove(); return [+bb.x.toFixed(1), +bb.y.toFixed(1), +bb.width.toFixed(1), +bb.height.toFixed(1)]; };
  return { vella: caixa(v), nova: caixa(n) };
}, { v: VELLA, n: NOVA_AMPLA })));
await ctx.close();
await b.close();
