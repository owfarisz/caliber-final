import {chromium,webkit} from '@playwright/test';
import fs from 'node:fs/promises';
const base='https://owfarisz.github.io/caliber-final';
const out='../../prototype codex/browser/pages';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];const errors=[];
for(const width of [360,390,430,768,1440]){
 const page=await browser.newPage({viewport:{width,height:844},isMobile:width<700,hasTouch:width<700,deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(base+'/',{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:'Put the right parts in place'}).waitFor();
 const check=async view=>{const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);results.push({width,view,overflow});if(overflow)throw new Error(`Overflow ${width} ${view}`);};
 await check('inventory');await page.screenshot({path:`${out}/${width}-inventory.png`,fullPage:true});
 await page.getByLabel('Search materials').fill('DOES-NOT-EXIST');await page.getByText('No matching materials',{exact:true}).waitFor();await page.getByLabel('Search materials').fill('');
 await page.getByRole('button',{name:'Technician',exact:true}).click();
 await page.getByLabel('Operating hours numeric').fill('24');await page.getByRole('button',{name:'Run simulation',exact:true}).click();
 await check('technician');await page.screenshot({path:`${out}/${width}-technician.png`,fullPage:true});
 await page.getByRole('button',{name:'Review in Procurement',exact:true}).click();await page.getByRole('heading',{name:'Put the right parts in place'}).waitFor();
 await page.getByRole('button',{name:'Demand & evidence',exact:true}).click();await check('demand');
 await page.getByRole('button',{name:'Evidence and audit',exact:true}).click();await check('evidence');
 const audit=page.getByRole('link',{name:'Open full audit'});if(await audit.getAttribute('href')!='/caliber-final/audit-report.html')throw new Error('Invalid audit URL');
 await page.goto(base+'/audit-report.html',{waitUntil:'networkidle'});await check('audit');await page.screenshot({path:`${out}/${width}-audit.png`,fullPage:width!==1440});
 await page.close();
}
await browser.close();await fs.writeFile(out+'/results.json',JSON.stringify({at:new Date().toISOString(),url:base,results,errors},null,2));
if(errors.length)throw new Error(JSON.stringify(errors));console.log(JSON.stringify({passed:results.length,errors}));
