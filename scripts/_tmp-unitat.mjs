#!/usr/bin/env node
/** TEMPORAL: el carril del lloc i el belt del header son proporcionals? */
import { chromium } from '@playwright/test';
const n = await chromium.launch();
console.log('  ample   belt   carril(lloç)   carril/belt   carril/belt x 1920/1350   escalaMega');
for (const [w, h] of [[768,1024],[1024,1366],[1280,800],[1366,768],[1440,900],[1920,1080]]) {
  const ctx = await n.newContext({ viewport: { width: w, height: h }, hasTouch: w <= 1366, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/austen', { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.scrollHeight > window.innerHeight * 2, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(1800);
  const r = await p.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const siteW = parseFloat(root.getPropertyValue('--site-w')) || null;
    const xL = parseFloat(root.getPropertyValue('--hg-tdp-xL'));
    const xR = parseFloat(root.getPropertyValue('--hg-tdp-xR'));
    const megaW = parseFloat(root.getPropertyValue('--hg-mega-w'));
    return { siteW, carril: (Number.isFinite(xL) && Number.isFinite(xR)) ? xR - xL : null, megaW, escala: root.getPropertyValue('--hg-escala-mega').trim() };
  });
  const belt = r.megaW || r.siteW;
  const ratio = r.carril && belt ? r.carril / belt : null;
  console.log(`${String(w).padStart(5)}  ${String(belt).padStart(5)}  ${String(r.carril).padStart(11)}  ${ratio != null ? ratio.toFixed(4).padStart(12) : '     -      '}  ${ratio != null ? (ratio * 1920 / 1350).toFixed(4).padStart(22) : ''}  ${r.escala}`);
  await ctx.close();
}
await n.close();
