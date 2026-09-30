import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 300)); });
p.on('pageerror', (e) => console.log('PAGEERROR', String(e.message).slice(0, 300)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(5000);
console.log('ok carregat');
await b.close();
