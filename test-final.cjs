const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 350, height: 790 } });
  await page.goto("http://127.0.0.1:3003/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(5000);
  
  const data = await page.evaluate(() => {
    const header = document.querySelector("header");
    const rect = header.getBoundingClientRect();
    
    // Find all logos
    const logos = [...header.querySelectorAll("[data-brand-logo='1']")];
    const logoInfo = logos.map(l => {
      const r = l.getBoundingClientRect();
      const s = getComputedStyle(l.closest("a"));
      return {
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        height: Math.round(r.height),
        centerX: Math.round(r.left + r.width / 2),
        display: s.display,
        visible: r.width > 0,
      };
    });
    
    // Check if cart/user/search buttons are visible in header bar (not in menu)
    const iconsWrap = header.querySelector("[data-icons-wrap='true']");
    const iconsVisible = iconsWrap ? getComputedStyle(iconsWrap).display !== 'none' : 'not found';
    
    return {
      headerHeight: Math.round(rect.height),
      vw: window.innerWidth,
      logos: logoInfo,
      iconsVisible,
    };
  });
  console.log(JSON.stringify(data, null, 2));
  
  // Now open hamburger and check contents
  await page.click('button[aria-label="Obrir menú"]');
  await page.waitForTimeout(1000);
  
  const menuData = await page.evaluate(() => {
    const menu = document.querySelector(".lg:hidden.border-b");
    if (!menu) return "no menu found";
    const buttons = [...menu.querySelectorAll("button")];
    return buttons.map(b => b.textContent.trim().substring(0, 30));
  });
  console.log("Menu buttons:", JSON.stringify(menuData));
  
  await b.close();
})();
