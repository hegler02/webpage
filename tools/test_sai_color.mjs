import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.SAI_PLAYWRIGHT_MODULE||'playwright');
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=process.argv[2];if(!base)throw Error('Usage: node tools/test_sai_color.mjs <preview URL>');
const out=process.env.SAI_EVIDENCE_DIR||path.join(os.tmpdir(),'sai-color-evidence');fs.mkdirSync(out,{recursive:true});
const before=execFileSync('git',['show','0398350:pages/sai/film.js'],{cwd:repo,encoding:'utf8',windowsHide:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});const results=[];
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:568},{width:568,height:320},{width:844,height:390}]){
  for(const version of ['before','after']){
   const page=await browser.newPage({viewport});
   if(version==='before')await page.route('**/film.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:before}));
   await page.goto(base);await page.waitForFunction(()=>window.__film?.ready);
   for(const t of [5,24,46,56,96,136]){
    await page.evaluate(t=>__film.seek(t),t);
    const stats=await page.evaluate(()=>{
     const s=document.querySelector('#stage canvas'),c=document.createElement('canvas');c.width=s.width;c.height=s.height;
     const ctx=c.getContext('2d');ctx.drawImage(s,0,0);const d=ctx.getImageData(0,0,c.width,c.height).data;
     let visible=0,white=0,saturation=0,coral=0,turquoise=0;
     for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2],hi=Math.max(r,g,b),lo=Math.min(r,g,b);if(hi>60){visible++;saturation+=(hi-lo)/hi;if(lo/hi>.82)white++;if(r>g*1.2&&r>b*1.2)coral++;if(g>r*1.2&&b>r*1.2)turquoise++;}}
     return {visible,whiteRatio:white/visible,saturation:saturation/visible,coral,turquoise};
    });
    results.push({viewport,version,t,...stats});
    if(version==='after'&&[56,96,136].includes(t))await page.screenshot({path:`${out}/color-${viewport.width}x${viewport.height}-${t}.png`});
   }
   await page.close();
  }
 }
 for(const after of results.filter(x=>x.version==='after')){
  const old=results.find(x=>x.version==='before'&&x.t===after.t&&x.viewport.width===after.viewport.width);
  if(after.t<=56&&JSON.stringify({...after,version:''})!==JSON.stringify({...old,version:''}))throw Error('Earlier scene changed '+JSON.stringify({old,after}));
  if(after.t===136&&(after.whiteRatio>.05||after.saturation<.45||after.coral<100||after.turquoise<100))throw Error('Taeguk color lost '+JSON.stringify(after));
  if(after.t===96&&after.saturation<old.saturation+.06)throw Error('Galaxy color did not improve '+JSON.stringify({old,after}));
 }
 fs.writeFileSync(`${out}/color-verification${base.startsWith('https')?'-live':''}.json`,JSON.stringify({base,status:'PASS',criteria:'Earlier scenes unchanged; taeguk white ratio <5%, mean saturation >0.45, both colors present; galaxy saturation improved',results},null,2),'utf8');
 console.log(JSON.stringify({status:'PASS',final:results.filter(x=>x.t===136),galaxy:results.filter(x=>x.t===96)}));
}finally{await browser.close();}
