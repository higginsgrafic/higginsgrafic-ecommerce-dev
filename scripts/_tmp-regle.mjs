// TEMPORAL — no es comiteja. Una captura NOMES amb quadrats de mida exacta (px
// CSS) per calibrar el coeficient entre l'editor de l'amo (Affinity 144 dpi) i
// el navegador. El fons es blanc i les mides son exactes (dpr = 1).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const amplada = 720;
const alcada = 820;
const ctx = await b.newContext({ viewport: { width: amplada, height: alcada }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;background:#fff}
  .s{position:absolute;background:#000}
  .e{position:absolute;font:12px/1.2 monospace;color:#000}
  .r{position:absolute;background:#e11d48}
</style></head><body>
  <div class="s" style="left:30px;top:80px;width:50px;height:50px"></div>
  <div class="e" style="left:30px;top:136px">50 x 50 px</div>
  <div class="s" style="left:120px;top:80px;width:100px;height:100px"></div>
  <div class="e" style="left:120px;top:186px">100 x 100 px</div>
  <div class="s" style="left:260px;top:80px;width:200px;height:200px"></div>
  <div class="e" style="left:260px;top:286px">200 x 200 px</div>
  <div class="s" style="left:30px;top:360px;width:400px;height:400px"></div>
  <div class="e" style="left:30px;top:766px">400 x 400 px</div>
  <div class="r" style="left:30px;top:640px;width:100px;height:8px"></div>
  <div class="e" style="left:140px;top:638px">aquesta marca fa 100 px d'ample (de 30 a 130)</div>
  <div class="e" style="left:30px;top:30px">CARRIL DE CALIBRATGE - ${amplada} x ${alcada} px CSS, 1 px de pantalla = 1 px de la imatge</div>
</body></html>`);
await p.waitForTimeout(300);
await p.screenshot({ path: '_tmp-regle.png', clip: { x: 0, y: 0, width: amplada, height: alcada } });
console.log(`desat _tmp-regle.png (${amplada}x${alcada} px CSS, 1:1)`);
await ctx.close();
await b.close();
