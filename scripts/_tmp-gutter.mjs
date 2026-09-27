// TEMPORAL — no es comiteja. Canvia l'amplada de layout en obrir el megaslide?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[2560, 1306], [1920, 946]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2500);
  const abans = await p.evaluate(() => ({
    client: document.documentElement.clientWidth,
    inner: window.innerWidth,
    carril: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(),
    teBarra: document.documentElement.scrollHeight > document.documentElement.clientHeight,
    gutter: getComputedStyle(document.documentElement).scrollbarGutter,
  }));
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(2500);
  const despres = await p.evaluate(() => ({
    client: document.documentElement.clientWidth,
    inner: window.innerWidth,
    carril: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(),
    teBarra: document.documentElement.scrollHeight > document.documentElement.clientHeight,
    gutter: getComputedStyle(document.documentElement).scrollbarGutter,
  }));
  console.log(`${w}x${h}`);
  console.log(`  tancat:  clientWidth=${abans.client} innerWidth=${abans.inner} carril=${abans.carril} barra=${abans.teBarra} gutter="${abans.gutter}"`);
  console.log(`  obert:   clientWidth=${despres.client} innerWidth=${despres.inner} carril=${despres.carril} barra=${despres.teBarra} gutter="${despres.gutter}"`);
  console.log(`  diferencia d'amplada de layout: ${despres.client - abans.client} px`);
  await ctx.close();
}
await b.close();
