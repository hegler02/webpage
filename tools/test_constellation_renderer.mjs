// Real Three.js projection/lifecycle under a GPU-unavailable DOM fixture.
// This is not a hardware/WebGL rendering test.
import assert from 'node:assert/strict';
import {mount} from '../pages/profile/constellation/space-adapter.mjs';
const listeners=new Map();let queued=new Map(),next=1,observer,removed=0,reduce=false,clock=1000;
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
function settle(){let frames=0;while(queued.size&&frames<150){const batch=[...queued.values()];queued.clear();clock+=1000/60;batch.forEach(fn=>fn(clock));frames++;}assert.equal(queued.size,0,'renderer must become idle');return frames;}
assert.ok(settle()<150);assert.match(host.children[0].innerHTML,/<path/);assert.match(labels.children[0].style.transform,/translate/);
const before=labels.children[0].style.transform;
listeners.get('svg:keydown')({key:'ArrowRight',preventDefault(){}});settle();assert.notEqual(labels.children[0].style.transform,before);
// Real input transitions: fast drag crosses the former yaw wall, release coasts,
// cancellation and reduced-motion stop the loop rather than leaving a perpetual RAF.
a.reset();settle();
const home=labels.children[0].style.transform;
listeners.get('svg:pointerdown')({pointerId:1,button:0,clientX:100,clientY:100,timeStamp:clock});
listeners.get('svg:pointermove')({pointerId:1,clientX:300,clientY:110,timeStamp:clock+50});
settle();const held=labels.children[0].style.transform;assert.notEqual(held,home);
listeners.get('svg:pointerup')({pointerId:1,timeStamp:clock});
const coastFrames=settle();assert.ok(coastFrames>1,'released quick drag must coast');
assert.notEqual(labels.children[0].style.transform,held,'release inertia must visibly advance');
a.reset();settle();
listeners.get('svg:pointerdown')({pointerId:2,button:0,clientX:100,clientY:100,timeStamp:clock});
listeners.get('svg:pointermove')({pointerId:2,clientX:900,clientY:100,timeStamp:clock+50});
settle();assert.notEqual(labels.children[0].style.transform,held,'yaw must not saturate at old 20-degree limit');
listeners.get('svg:pointercancel')();settle();
a.pause();a.reset();assert.equal(queued.size,0);a.resume();settle();
reduce=true;listeners.get('motion')();assert.equal(settle(),1,'reduced motion settles immediately');
const reducedPose=labels.children[0].style.transform;
listeners.get('svg:pointerdown')({pointerId:3,button:0,clientX:0,clientY:0,timeStamp:clock});
listeners.get('svg:pointermove')({pointerId:3,clientX:500,clientY:300,timeStamp:clock+50});
assert.equal(queued.size,0);assert.equal(labels.children[0].style.transform,reducedPose);
host.clientWidth=375;observer();settle();assert.match(host.children[0].attrs.viewBox,/375/);
a.destroy();assert.equal(queued.size,0);assert.equal(observer,null);assert.equal(removed,1);
console.log('Constellation projection/lifecycle: PASS (SVG fallback, links, keyboard, idle, pause, reduced motion, resize, disposal)');
