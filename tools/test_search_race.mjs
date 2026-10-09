import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const path=process.argv[2]||new URL('../pages/profile/constellation/constellation.js',import.meta.url);
const source=fs.readFileSync(path,'utf8');
function fixture(){
  const elements=new Map(),timers=new Map(),writes=[];let id=0;
  const $=key=>{if(!elements.has(key))elements.set(key,{value:'',addEventListener(type,fn){this[type]=fn;}});return elements.get(key);};
  const context=vm.createContext({$,dead:false,state:{query:'old',scope:'context',page:0},searchTimer:undefined,
    clearTimeout:key=>timers.delete(key),setTimeout:fn=>{timers.set(++id,fn);return id;},
    db:{toURL:s=>JSON.stringify(s),fromURL:()=>({query:'history',scope:'all',page:0})},location:{href:'local'},
    history:{pushState:(_,__,url)=>writes.push(url),replaceState:(_,__,url)=>writes.push(url)},
    window:{addEventListener(type,fn){this[type]=fn;}}});
  vm.runInContext("function render(){$('search').value=state.query;}",context);
  for(const line of source.split(/\r?\n/))if(line.startsWith('function setURL(')||line.startsWith("$('search').addEventListener")||line.startsWith("$('scope').addEventListener")||line.startsWith("window.addEventListener('popstate'"))vm.runInContext(line,context);
  return {$,context,writes,flush(){for(const [key,fn]of [...timers]){timers.delete(key);fn();}},timers};
}
for(const query of ['', 'new']){
  const f=fixture();f.$('search').value=query;f.$('search').input();f.$('scope').value='all';f.$('scope').change();
  assert.equal(f.$('search').value,query,'scope change must preserve current input');f.flush();assert.equal(f.context.state.query,query);assert.equal(f.writes.length,1,'no stale delayed write');
}
{
 const f=fixture();for(const q of ['a','ab','abc']){f.$('search').value=q;f.$('search').input();}
 assert.equal(f.writes.length,0);f.flush();assert.equal(f.writes.length,1);assert.equal(f.context.state.query,'abc');
}
{
 const f=fixture();f.$('search').value='pending';f.$('search').input();f.context.window.popstate();f.flush();assert.equal(f.$('search').value,'history');assert.equal(f.writes.length,0);
}
console.log('PASS: clear/type + immediate scope, rapid input coalescing, history cancels pending search. Actual handlers; bounded DOM/timer fixture.');
