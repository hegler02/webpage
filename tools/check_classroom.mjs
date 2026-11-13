#!/usr/bin/env node
// Walk every 공간과 전기 sample the way a student does and fail when one breaks.
//
//   PLAYWRIGHT_CORE=<path to playwright-core> node tools/check_classroom.mjs [--quick] [--base https://mirinaeman.com] [--only 4,9]
//
// For each sample of learning-shell.mjs it opens every menu and checks: no script error, no sideways scroll,
// the 3D view comes up when the menu has one, and the menus match the first sample of its kind.
// Without --quick it also presses the buttons of each menu and lists the ones after which nothing on screen changed.
// Failures stop a release; quiet buttons are listed for a person to look at. The full report goes to .qa/classroom-report.json.
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),CLASSROOM=path.join(ROOT,'pages/guardhouse-classroom');
const args=process.argv.slice(2),flag=n=>args.includes(n),value=n=>{const i=args.indexOf(n);return i<0?null:args[i+1];};
const quick=flag('--quick'),only=value('--only')?.split(',').map(Number),workers=Number(value('--workers')??2);
// Buttons that leave the lesson, reset it, or only save a file are not pressed.
const SKIP=/초기화|다시 열기|저장|내려받기|다운로드|인쇄|닫기|메뉴|샘플 \d|돌아가기/;
const PER_MENU=8,MENU_LIMIT=150000;
// A page that stops answering would hold the whole run; every menu gets a deadline instead.
const within=(promise,ms,what)=>Promise.race([promise,new Promise((_,no)=>setTimeout(()=>no(Error(what+' 응답 없음 ('+ms/1000+'초)')),ms))]);

async function playwright(){
 const where=process.env.PLAYWRIGHT_CORE;
 try{return where?createRequire(pathToFileURL(path.join(where,'package.json')))('./index.js'):await import('playwright-core');}
 catch{console.error('playwright-core를 찾지 못했습니다. PLAYWRIGHT_CORE에 경로를 주거나 npm i -g playwright-core 로 설치하세요.');process.exit(2);}
}
// The sample list has one home: the frozen array at the top of learning-shell.mjs.
async function sampleList(){
 const text=await readFile(path.join(CLASSROOM,'learning-shell.mjs'),'utf8');
 return [...text.matchAll(/\{id:(\d+),name:'([^']+)',path:'([^']+)'/g)].map(m=>({id:Number(m[1]),name:m[2],file:m[3]})).filter(s=>!only||only.includes(s.id));
}
// Building samples are compared with 경비실, the equipment samples with 컨베이어.
const family=s=>/conveyor|capsule/.test(s.file)?4:1;

function serve(){
 const port=4300+Math.floor(Math.random()*500),python=process.env.PYTHON??(process.platform==='win32'?'python':'python3');
 const child=spawn(python,['tools/serve_site.py',String(port)],{cwd:ROOT,stdio:'ignore'});
 return {child,base:'http://127.0.0.1:'+port};
}
async function waitFor(url){for(let i=0;i<60;i++){try{if((await fetch(url)).ok)return;}catch{}await new Promise(r=>setTimeout(r,500));}throw Error('local server did not start');}
// On the host, pages are served without .html and the first sample is the folder itself.
const address=(base,s,live)=>base+'/pages/guardhouse-classroom/'+(live?(s.file==='index.html'?'':s.file.replace(/\.html$/,'/')):s.file);

// What a student sees: the words on the page and a small picture of the 3D view.
async function look(p){
 const text=await p.evaluate(()=>document.querySelector('main')?.innerText??document.body.innerText);
 let picture='';const canvas=p.locator('canvas:visible').first();
 if(await canvas.count()){const box=await canvas.boundingBox().catch(()=>null);if(box&&box.width>40&&box.height>40)picture=createHash('md5').update(await p.screenshot({clip:box,scale:'css',timeout:60000,type:'jpeg',quality:40}).catch(()=>Buffer.alloc(0))).digest('hex');}
 return {text:createHash('md5').update(text).digest('hex'),picture,dialog:await p.locator('dialog[open]').count()};
}

async function checkSample(browser,s,base,live){
 const ctx=await browser.newContext({viewport:{width:1500,height:950},acceptDownloads:false}),p=await ctx.newPage();p.setDefaultTimeout(60000);
 const errors=[],result={id:s.id,name:s.name,menus:[],failures:[],quiet:[]};
 p.on('pageerror',e=>errors.push(e.message.slice(0,200)));
 p.on('console',m=>{if(m.type()==='error'&&!/favicon|net::ERR_ABORTED/.test(m.text()))errors.push(m.text().slice(0,200));});
 const url=address(base,s,live);
 await p.goto(url+'#home',{waitUntil:'load',timeout:90000});await p.waitForTimeout(2500);
 // Menus are the shell's menu buttons (named data-go, data-menu or data-page as the samples grew), plus the quantities menu that opens from its own button.
 const menus=await p.evaluate(()=>[...new Set([...document.querySelectorAll('header [data-go],header [data-menu],header [data-page],nav [data-go],nav [data-menu],nav [data-page]')].map(n=>n.dataset.go??n.dataset.menu??n.dataset.page).concat(document.querySelector('[data-quantity-menu]')?['quantities']:[]))]);
 result.menus=menus;
 if(!(await p.locator('[data-stuck-report]').count()))result.failures.push('막힌 곳 적기 버튼이 없습니다');
 for(const menu of menus){
 try{await within((async()=>{
  errors.length=0;
  // Menus are pressed as a student presses them; the address is only a fallback.
  const button=p.locator(`header [data-go="${menu}"],header [data-menu="${menu}"],header [data-page="${menu}"],nav [data-go="${menu}"],nav [data-menu="${menu}"],nav [data-page="${menu}"],[data-quantity-menu]`.split(',').filter(x=>menu==='quantities'?x.includes('quantity'):!x.includes('quantity')).join(',')).first();
  if(await button.isVisible().catch(()=>false))await button.click({timeout:40000}).catch(()=>p.goto(url+'#'+menu,{waitUntil:'load',timeout:90000}));
  else await p.goto(url+'#'+menu,{waitUntil:'load',timeout:90000});
  await p.waitForTimeout(6000);
  const state=await p.evaluate(()=>({over:document.documentElement.scrollWidth-innerWidth,failed:/3D를 준비하지 못했습니다/.test(document.body.innerText),busy:!!document.querySelector('[data-busy="true"]'),canvas:!!document.querySelector('canvas')}));
  if(state.over>1)result.failures.push(`${menu}: 화면이 옆으로 ${state.over}px 넘칩니다`);
  if(state.failed)result.failures.push(`${menu}: 3D를 열지 못했습니다`);
  if(!quick){
   // The buttons of the lesson, not the shell's navigation: pressed one by one, each from where the last one left the page.
   const handles=await p.locator('main button:visible:not([data-go]):not([disabled])').all();let pressed=0;
   for(const h of handles){
    if(pressed>=PER_MENU)break;const label=((await h.innerText().catch(()=>''))||(await h.getAttribute('aria-label').catch(()=>''))||'').replace(/\s+/g,' ').trim().slice(0,30);
    if(!label||SKIP.test(label)||!(await h.isVisible().catch(()=>false)))continue;
    const before=await look(p);let clicked=true;
    try{await h.click({timeout:40000});}catch{clicked=false;}
    if(!clicked)continue;pressed++;await p.waitForTimeout(1500);
    const after=await look(p);
    if(after.text===before.text&&after.picture===before.picture&&after.dialog===before.dialog)result.quiet.push(`${menu}: ${label}`);
    if(after.dialog)await p.keyboard.press('Escape');
    if(!p.url().includes('#'+menu)){await p.goto(url+'#'+menu,{waitUntil:'load',timeout:90000});await p.waitForTimeout(3000);}
   }
  }
  for(const e of new Set(errors))result.failures.push(`${menu}: 스크립트 오류 ${e}`);
  console.log(`  ${s.id} ${s.name} · ${menu}${state.canvas?' · 3D':''}`);
 })(),MENU_LIMIT,menu);}
  catch(e){result.failures.push(`${menu}: ${e.message.split('\n')[0]}`);if(/응답 없음|crash|closed/i.test(e.message))throw e;}
 }
 await ctx.close();return result;
}

const pw=await playwright(),samples=await sampleList();
let base=value('--base'),server=null;const live=!!base;
if(!base){server=serve();base=server.base;await waitFor(base+'/pages/guardhouse-classroom/');}
// Software 3D is heavy: each worker keeps its own browser, and a sample whose page crashed is tried once more in a fresh one.
const launch=()=>pw.chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[],queue=[...samples];
try{
 await Promise.all(Array.from({length:Math.min(workers,queue.length)},async()=>{
  let browser=await launch();
  for(let s;(s=queue.shift());){
   let r=null;
   for(let attempt=0;attempt<2&&!r;attempt++){
    try{r=await checkSample(browser,s,base,live);}
    catch(e){await browser.close().catch(()=>{});browser=await launch();if(attempt)r={id:s.id,name:s.name,menus:[],failures:['열지 못했습니다: '+e.message.split('\n')[0]],quiet:[]};}
   }
   results.push(r);
  }
  await browser.close();
 }));
}finally{server?.child.kill();}
results.sort((a,b)=>a.id-b.id);
// A sample may add menus, but must have every menu of the first sample of its kind.
for(const r of results){if(!r.menus.length)continue;const ref=results.find(x=>x.id===family(samples.find(s=>s.id===r.id)));if(ref&&ref!==r)for(const m of ref.menus)if(!r.menus.includes(m))r.failures.push(`메뉴 빠짐: ${m} (샘플 ${ref.id}에는 있음)`);}
await mkdir(path.join(ROOT,'.qa'),{recursive:true});
await writeFile(path.join(ROOT,'.qa/classroom-report.json'),JSON.stringify({base,quick,checked:new Date().toISOString(),results},null,1)+'\n');
let failed=0;
for(const r of results){
 console.log(`\n샘플 ${r.id} ${r.name}: 메뉴 ${r.menus.length}개, 실패 ${r.failures.length}, 조용한 버튼 ${r.quiet.length}`);
 for(const f of r.failures)console.log('  실패 '+f);for(const q of r.quiet)console.log('  확인 필요 '+q);failed+=r.failures.length;
}
console.log(failed?`\nClassroom check: FAIL (${failed})`:'\nClassroom check: PASS');
process.exit(failed?1:0);
