// Real Three.js projection/lifecycle under a GPU-unavailable DOM fixture.
// This is not a hardware/WebGL rendering test.
import assert from 'node:assert/strict';
import {mount} from '../pages/profile/constellation/space-adapter.mjs';
const listeners=new Map();let queued=new Map(),next=1,observer,removed=0,reduce=false;
class Element{
 constructor(tag){this.tagName=tag;this.style={};this.attrs={};this.children=[];this.clientWidth=1000;this.clientHeight=570;this.innerHTML='';}
 setAttribute(k,v){this.attrs[k]=String(v);}append(e){this.children.push(e);}replaceChildren(){this.children=[];this.innerHTML='';}remove(){removed++;}
 addEventListener(name,fn){listeners.set(this.tagName+':'+name,fn);}removeEventListener(){}getContext(){return null;}setPointerCapture(){}
}
globalThis.document={createElementNS(ns,tag){return new Element(tag);}};
globalThis.getComputedStyle=()=>({getPropertyValue(k){return {'--work':'#98bbff','--thought':'#c0a5ef','--space-ease':'.11'}[k];}});
globalThis.matchMedia=()=>({get matches(){return reduce;},addEventListener(name,fn){listeners.set('motion',fn);}});
globalThis.ResizeObserver=class{constructor(fn){observer=fn;}observe(){}disconnect(){observer=null;}};
globalThis.devicePixelRatio=3;
globalThis.requestAnimationFrame=fn=>{const id=next++;queued.set(id,fn);return id;};globalThis.cancelAnimationFrame=id=>queued.delete(id);
const host=new Element('host'),labels={children:[new Element('button'),new Element('button')]},status={};
const originalError=console.error;console.error=()=>{};
const a=await mount(host,labels,status,{onFailure:()=>assert.fail('unexpected failure')});console.error=originalError;
const data={visible:[{id:'a',kind:'work'},{id:'b',kind:'concept'}],edges:[{source:'a',target:'b'}],selected:'a'};a.update(data);
function settle(){let frames=0;while(queued.size&&frames<150){const batch=[...queued.values()];queued.clear();batch.forEach(fn=>fn());frames++;}assert.equal(queued.size,0,'renderer must become idle');return frames;}
assert.ok(settle()<150);assert.match(host.children[0].innerHTML,/<path/);assert.match(labels.children[0].style.transform,/translate/);
const before=labels.children[0].style.transform;
listeners.get('svg:keydown')({key:'ArrowRight',preventDefault(){}});settle();assert.notEqual(labels.children[0].style.transform,before);
a.pause();a.reset();assert.equal(queued.size,0);a.resume();settle();
reduce=true;listeners.get('motion')();assert.equal(settle(),1,'reduced motion settles immediately');
host.clientWidth=375;observer();settle();assert.match(host.children[0].attrs.viewBox,/375/);
a.destroy();assert.equal(queued.size,0);assert.equal(observer,null);assert.equal(removed,1);
console.log('Constellation projection/lifecycle: PASS (SVG fallback, links, keyboard, idle, pause, reduced motion, resize, disposal)');
