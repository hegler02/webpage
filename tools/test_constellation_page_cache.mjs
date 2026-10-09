import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../pages/profile/constellation/constellation.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
const lifecycle=source.slice(source.indexOf("window.addEventListener('pagehide'"),source.indexOf('\ntry{\n  const response'));
function run(code){
 const handlers=new Map(),calls={pause:0,destroy:0,resume:0};
 const context=vm.createContext({window:{addEventListener:(name,fn)=>handlers.set(name,fn)},clearTimeout(){},calls});
 vm.runInContext(`let searchTimer,dead=false;let adapter={pause(){calls.pause++},destroy(){calls.destroy++},resume(){calls.resume++}};function reconcile(){if(!dead)adapter?.resume()}\n${code}`,context);
 for(let i=0;i<5;i++){
  handlers.get('pagehide')({persisted:true});
  assert.equal(calls.destroy,0,'cached navigation must preserve the rendered canvas');
  assert.equal(calls.pause,i+1,'cached renderer must stop');
  handlers.get('pageshow')({persisted:true});
  assert.equal(calls.resume,i+1,'restored renderer must resume');
 }
 handlers.get('pagehide')({persisted:false});
 assert.equal(calls.destroy,1,'discarded document must release renderer');
}
run(lifecycle);
const old="window.addEventListener('pagehide',()=>{clearTimeout(searchTimer);dead=true;adapter?.destroy();adapter=null;});\n"+lifecycle.slice(lifecycle.indexOf("window.addEventListener('pageshow'"));
assert.throws(()=>run(old),/cached navigation must preserve/);
console.log('PASS: 5 cache round trips preserve canvas, pause/resume, discard disposes; previous code fails');
