import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
// Execute the shipped app twice in a bounded DOM fixture. Browser layout is verified separately.
class El {
  constructor(){this.handlers={};this.attrs={};this.inert=false;this.classes=new Set();this.dataset={};this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),contains:x=>this.classes.has(x),toggle:(x,on)=>on?this.classes.add(x):this.classes.delete(x)};}
  addEventListener(k,f){(this.handlers[k]??=[]).push(f);}
  fire(k,e={}){for(const f of this.handlers[k]??[])f(e);}
  setAttribute(k,v){this.attrs[k]=v;}
  querySelector(){return null;}
  querySelectorAll(){return [];}
  focus(){doc.activeElement=this;}
  contains(e){return e===this;}
}
const button=new El(),drawer=new El(),main=new El(),footer=new El(),root=new El(),body=new El(),doc=new El(),win=new El(),wide=new El();
footer.inert=true;wide.matches=false;
const links=[new El(),new El()];drawer.querySelector=()=>links[0];drawer.querySelectorAll=()=>links;drawer.contains=e=>e===drawer||links.includes(e);
Object.assign(doc,{documentElement:root,body,querySelector:s=>({'[data-menu-toggle]':button,'[data-drawer]':drawer}[s]??null),querySelectorAll:s=>s==='main, body > footer'?[main,footer]:[]});
let requests=0;
const sandbox={window:win,document:doc,matchMedia:()=>wide,localStorage:{getItem:()=>null},location:{hash:''},addEventListener:win.addEventListener.bind(win),EventTarget,CustomEvent:class extends Event{constructor(n,o){super(n);this.detail=o?.detail;}},fetch:()=>{requests++;}};
const ctx=vm.createContext(sandbox);
// Browser globals alias window properties.
Object.defineProperty(sandbox,'ProfileBus',{get:()=>win.ProfileBus});
const code=fs.readFileSync(new URL('../pages/profile/app.js',import.meta.url),'utf8');
const mountedQuery=doc.querySelector;
doc.querySelector=()=>null;
vm.runInContext(code,ctx);vm.runInContext(code,ctx);
assert.equal(win.__profileAppInitialized,undefined);
assert.equal(win.handlers['navigation:ready'].length,1);
assert.equal(Object.values(doc.handlers).flat().length,0);
doc.querySelector=mountedQuery;
win.fire('navigation:ready');
assert.equal(win.__profileAppInitialized,true);
const count=Object.values(doc.handlers).flat().length;
vm.runInContext(code,ctx);assert.equal(Object.values(doc.handlers).flat().length,count);assert.equal(button.handlers.click.length,1);
assert.equal(drawer.inert,true);
for(let i=0;i<50;i++){
 button.fire('click');assert.equal(button.attrs['aria-expanded'],'true');assert.equal(main.inert,true);assert.equal(doc.activeElement,links[0]);
 doc.fire('keydown',{key:'Tab',shiftKey:true,preventDefault(){}});assert.equal(doc.activeElement,button);
 doc.fire('keydown',{key:'Tab',shiftKey:false,preventDefault(){}});assert.equal(doc.activeElement,links[0]);
 doc.fire('keydown',{key:'Escape',preventDefault(){}});assert.equal(main.inert,false);assert.equal(footer.inert,true);assert.equal(doc.activeElement,button);assert.equal(body.classes.has('drawer-open'),false);
}
button.fire('click');wide.matches=true;wide.fire('change');assert.equal(drawer.inert,false);assert.equal(main.inert,false);
wide.matches=false;wide.fire('change');button.fire('click');win.fire('pagehide');win.fire('pageshow');assert.equal(drawer.inert,true);assert.equal(main.inert,false);
assert.equal(requests,0);
wide.matches=true;wide.fire('change');links[0].focus();
wide.matches=false;wide.fire('change');assert.equal(doc.activeElement,button);
wide.matches=true;wide.fire('change');assert.equal(doc.activeElement,links[0]);
main.focus();wide.matches=false;wide.fire('change');assert.equal(doc.activeElement,main);
wide.matches=true;wide.fire('change');assert.equal(doc.activeElement,main);
console.log('Directional focus PASS: both breakpoint directions and outside focus preservation.');
console.log('Navigation lifecycle PASS: duplicate initialization, 50 cycles, focus wrap, preserved inert, breakpoint, page restore, zero fetch. DOM fixture only.');
