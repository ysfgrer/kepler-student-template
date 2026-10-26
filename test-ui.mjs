// Optional isolated test runner; user-provided local Playwright and Chrome paths.
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
import {setup} from './setup.mjs';import {build} from './build.mjs';import {start} from './server.mjs';
if(!process.env.PLAYWRIGHT_MODULE||!process.env.CHROME_PATH)throw Error('PLAYWRIGHT_MODULE ve CHROME_PATH gerekli');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE);
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-first-run','--disable-background-networking']});
try{for(const mode of ['empty','demo']){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'kepler-ui-'));let server;
 try{setup(root,mode);build(root);server=start(root,0);await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 const context=await browser.newContext({reducedMotion:'reduce'});await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});for(const route of ['home','tasks','calendar','assistant','announcements','courses','attendance','sources']){
 await page.goto(base+'/#/'+route);await page.waitForSelector('#routeOutlet');await page.waitForFunction(()=>window.keplerAttendanceOverview?.state==='ready'&&window.keplerReady===true);
 assert.equal(await page.locator('#routeOutlet>.route-page').count(),1);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+mode+route+width);
 assert(!(await page.locator('body').innerText()).includes('1970'),'Unknown timestamp rendered as epoch');
 }}
 await page.goto(base+'/#/assistant');await page.waitForFunction(()=>window.keplerReady);await page.locator('#assistantInput').fill('Not ortalamam kaç?');await page.locator('#assistantInput').press('Enter');await page.waitForFunction(()=>document.querySelector('#assistantAnswer')?.textContent.includes('doğrulayamıyorum'));
 if(mode==='demo'){
 await page.goto(base+'/#/courses/DEMO101/overview');await page.waitForSelector('#courseDetailTitle');assert.match(await page.locator('#courseDetailTitle').innerText(),/Örnek Ders/);

 await page.goto(base+'/#/tasks');await page.locator('[data-task="demo-task-1"]').first().click();await page.reload();await page.waitForFunction(()=>window.keplerAttendanceOverview?.state==='ready'&&window.keplerReady===true);await page.locator('[data-board-filter="all"]').click();assert(await page.locator('[data-task="demo-task-1"]').first().isChecked());
 await page.goto(base+'/#/attendance');await page.locator('#attendanceDate').fill('2020-01-01');await page.locator('#attendanceStatus').selectOption('half');await page.locator('#attendanceForm button').click();await page.waitForFunction(()=>document.querySelector('#attendanceMessage')?.textContent.includes('kaydedildi'));await page.reload();await page.waitForSelector('.attendance-row');assert.match(await page.locator('.attendance-row').innerText(),/Yarım/);
 }
 if(process.env.QA_SCREENSHOT_DIR){fs.mkdirSync(process.env.QA_SCREENSHOT_DIR,{recursive:true});await page.setViewportSize({width:1440,height:900});await page.goto(base+'/#/home');await page.waitForFunction(()=>window.keplerAttendanceOverview?.state==='ready'&&window.keplerReady===true);await page.screenshot({path:path.join(process.env.QA_SCREENSHOT_DIR,mode+'.png')});}assert.deepEqual(errors,[]);await context.close();console.log('UI passed '+mode+': 8 routes × 3 widths, no page errors/overflow');
 }finally{if(server)await new Promise(r=>server.close(r));fs.rmSync(root,{recursive:true,force:true});}
}}finally{await browser.close();}
