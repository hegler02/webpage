import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(process.argv[2]||new URL('../pages/profile/app.js',import.meta.url),'utf8').replaceAll('\r\n','\n');
const start=source.indexOf('(() => {\n  const player =');
const code=source.slice(start,source.indexOf('\n(() => {',start+8));
function fixture(){
 const handlers={},events=[],pending=[],classes=new Set();let closed=false;
 const audio={dataset:{},controls:false,pause(){},load(){},removeAttribute(){delete this.src;},play(){return new Promise((resolve,reject)=>pending.push({resolve,reject}));}};
 const close={addEventListener:(_,fn)=>handlers.close=fn};
 const title={replaceChildren(text){this.text=text;}};
 const player={querySelector:s=>({'audio':audio,'[data-player-title]':title,'[data-player-close]':close}[s]||null),classList:{add:s=>classes.add(s),remove:s=>classes.delete(s)},removeAttribute(){closed=false;},setAttribute(){closed=true;}};
 vm.runInNewContext(code,{document:{querySelector:()=>player,addEventListener:(_,fn)=>handlers.click=fn},ProfileBus:{emit:(_,value)=>events.push(value)}});
 return {audio,events,pending,title,close:()=>handlers.close(),isClosed:()=>closed,click:(name)=>handlers.click({target:{closest:s=>s==='[data-audio-src]'?{dataset:{audioSrc:name+'.mp3',title:name}}:null}})};
}
for(const reject of [false,true]){
 const f=fixture(),p=f.click('A');f.close();f.pending[0][reject?'reject':'resolve']();await p;
 assert.equal(f.events.length,0,'closed player must not emit late success');assert.equal(f.audio.controls,false);assert.equal(f.isClosed(),true);
}
for(const same of [false,true])for(const reject of [false,true]){
 const f=fixture(),a=f.click('A'),b=f.click(same?'A':'B');
 f.pending[1].resolve();await b;f.pending[0][reject?'reject':'resolve']();await a;
 assert.equal(f.events.length,1);assert.equal(f.events[0].title,same?'A':'B');assert.equal(f.audio.controls,false);
}
{
 const f=fixture(),p=f.click('A');f.pending[0].reject();await p;assert.equal(f.audio.controls,true);assert.equal(f.events.length,0);
 const next=f.click('A');f.pending[1].resolve();await next;assert.equal(f.events.length,1);
}
console.log('Media race PASS: 7 scenarios; close resolve/reject, track switch and repeated track stale resolve/reject, current rejection and retry. Controlled promises, not audio playback proof.');
