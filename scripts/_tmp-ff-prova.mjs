import { firefox } from '@playwright/test';
console.log('engegant firefox...');
const b = await firefox.launch({ timeout: 60000 });
console.log('firefox engegat:', b.version());
const p = await (await b.newContext()).newPage();
await p.goto('about:blank');
console.log('navegacio ok');
await b.close();
console.log('fi');
