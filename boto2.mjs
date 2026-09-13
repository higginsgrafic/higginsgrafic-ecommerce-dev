import { chromium } from '@playwright/test';
const BASE='http://127.0.0.1:3003';
const item=(i)=>({id:'i'+i+'|Black|S',title:'Afrodita-A',name:'x',productSlug:'p',productRoute:'p',size:'S',color:'Black',qty:1,quantity:1,price:'15,50€',unitPrice:15.5});
const nav=await chromium.launch();
for (const [w,h] of [[1024,1366],[820,1180],[769,1024]]) {
  const page=await nav.newPage({viewport:{width:w,height:h}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message.slice(0,50)));
  await page.addInitScript((a)=>localStorage.setItem('cart',JSON.stringify(a)),[item(0),item(1)]);
  await page.goto(BASE+'/checkout',{waitUntil:'load',timeout:60000});
  await page.waitForTimeout(4500);
  const i=await page.evaluate(()=>{
    const R=(e)=>{const r=e.getBoundingClientRect();return {l:Math.round(r.left),r:Math.round(r.right),w:Math.round(r.width)};};
    const tel=document.querySelector('[name="phone"]');
    const boto=[...document.querySelectorAll('button')].find(x=>/Confirma la compra/i.test(x.innerText));
    const nom=document.querySelector('[name="firstName"]');
    return {tel:R(tel), boto:R(boto), nom:R(nom), campL:Math.round(nom.getBoundingClientRect().left)};
  });
  const ok = i.tel.l===i.boto.l && i.tel.r===i.boto.r;
  console.log(String(w+'x'+h).padEnd(10), 'telefon', i.tel.l+'->'+i.tel.r, '(ample '+i.tel.w+')', '| boto', i.boto.l+'->'+i.boto.r, '(ample '+i.boto.w+')', ok?'✅ ALINEAT':'❌');
  if(w===1024) await page.screenshot({path:'/tmp/boto-tel.png', clip:{x:20,y:860,width:700,height:130}});
  console.log('   errors:', errors.length?errors.join('//'):'cap');
  await page.close();
}
await nav.close();
