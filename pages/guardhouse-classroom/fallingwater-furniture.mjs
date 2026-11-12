// Furniture drawn in the round: built-in walnut seats and shelves, cushions, low tables, beds and the red kettle by the hearth.
// Each piece is built facing +z around its own centre on the floor, then turned and moved to where the model puts it.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const WALNUT=0x6e4a2f,DARK=0x4a3120,PALE=0x8a6240,CREAM=0xdcd0b4,RUST=0xb4552e,GOLD=0xc79a3c,RED=0x8a2e1e,LINEN=0xeae4d6,WOOL=0x9a7a52,ENAMEL=0xe8e4d8,IRON=0x26221f,UP=new THREE.Vector3(0,1,0);
const flat=g=>{const n=g.index?g.toNonIndexed():g;if(n!==g)g.dispose();n.deleteAttribute('uv');return n;};
function paint(g,hex){
 const c=new THREE.Color(hex),n=g.attributes.position.count,a=new Float32Array(n*3);
 for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(a,3));return g;
}
const slab=(w,h,d,x,y,z,hex)=>paint(flat(new THREE.BoxGeometry(w,h,d).translate(x,y,z)),hex);
const pad=(w,h,d,x,y,z,hex,r=.03)=>paint(flat(new RoundedBoxGeometry(w,h,d,3,Math.min(r,h/2-.002,w/2-.002,d/2-.002)).translate(x,y,z)),hex);
const drum=(r,h,x,y,z,hex,top=r)=>paint(flat(new THREE.CylinderGeometry(top,r,h,18).translate(x,y,z)),hex);
// A round stick from point to point.
function stick(points,r,hex){
 const parts=[],p=points.map(q=>new THREE.Vector3(...q));
 for(let i=1;i<p.length;i++){
  const axis=p[i].clone().sub(p[i-1]),len=axis.length(),g=new THREE.CylinderGeometry(r,r,len,10);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP,axis.normalize()));g.translate(...p[i-1].clone().lerp(p[i],.5).toArray());parts.push(paint(flat(g),hex));
 }
 return parts;
}
// Pieces are written lying along x; one that is longer the other way is built the same and turned a quarter.
const long=(w,d,build)=>{const parts=build(Math.max(w,d),Math.min(w,d));if(d>w)for(const g of parts)g.rotateY(Math.PI/2);return parts;};
const count=(length,each)=>Math.max(1,Math.round(length/each));
// A row of books standing on a board, each a little different.
function books(x0,x1,y,z,depth,seed){
 const out=[],tones=[0x6b3b2a,0x39483f,0x8a6a3a,0x2f3540,0x9a8b6e,0x54301f,0x7b7361];let x=x0,k=seed;
 while(x<x1-.03){k=(k*16807+11)%2147483647;const t=.022+(k%100)/100*.03,h=.17+((k>>7)%100)/100*.09;if(x+t>x1)break;out.push(slab(t-.002,h,depth*(.78+((k>>3)%10)/60),x+t/2,y+h/2,z,tones[k%tones.length]));x+=t;if(k%13===0)x+=.07;}
 return out;
}

const table=(w,d,h,legs=true)=>long(w,d,(l,s)=>[slab(l,.045,s,0,h-.0225,0,WALNUT),slab(l-.12,.07,.022,0,h-.08,s/2-.07,DARK),slab(l-.12,.07,.022,0,h-.08,-s/2+.07,DARK),
 ...(legs?[-1,1].flatMap(x=>[-1,1].map(z=>slab(.055,h-.045,.055,x*(l/2-.07),(h-.045)/2,z*(s/2-.07),DARK))):[-1,1].map(x=>slab(.05,h-.045,s-.16,x*(l/2-.22),(h-.045)/2,0,DARK)))]);
const bench=({w,d})=>{
 const n=count(w,.78),each=w/n,out=[slab(w,.05,d,0,.215,0,WALNUT),slab(w,.19,.03,0,.12,d/2-.015,WALNUT),slab(w-.3,.12,d-.3,0,.06,-.08,DARK)];
 for(let i=0;i<n;i++){const x=-w/2+each*(i+.5);out.push(pad(each-.02,.13,d-.05,x,.305,.02,CREAM,.045),pad(each-.02,.3,.13,x,.52,-d/2+.085,CREAM,.05));}
 [[.18,RUST],[.52,GOLD],[.86,RUST]].slice(0,w>3?3:1).forEach(([t,hex],i)=>{const g=pad(.44,.4,.13,0,0,0,hex,.055);g.rotateX(-.42);g.rotateY((i-1)*.2);g.translate(-w/2+w*t,.56,-d/2+.3);out.push(g);});
 return out;
};
const pieces={
 bench,'bench-s':bench,'bench-w':bench,
 'dining-table':({w,d,h})=>[...table(w,d,h,false),drum(.11,.07,-w*.22,h+.035,0,RUST,.15),drum(.045,.2,w*.2,h+.1,.05,0x4d5b52,.03)],
 'kitchen-table':({w,d,h})=>table(w,d,h),
 // Three-legged chair with a narrow carved back, after the ones the family brought from Italy.
 'dining-chair':({w,d,h})=>[pad(w,.04,d-.04,0,.45,.02,WALNUT,.015),...stick([[-w*.38,0,d*.4],[-w*.3,.44,d*.3]],.02,DARK),...stick([[w*.38,0,d*.4],[w*.3,.44,d*.3]],.02,DARK),
  ...stick([[0,0,-d*.5],[0,.44,-d*.34]],.022,DARK),slab(.2,h-.44,.03,0,.44+(h-.44)/2,-d*.36,WALNUT),slab(.3,.1,.032,0,h-.05,-d*.36,WALNUT)],
 'coffee-table':({w,d,h})=>[slab(w,.05,d,0,h-.025,0,WALNUT),slab(w-.22,h-.05,d-.22,0,(h-.05)/2,0,DARK)],
 zabuton:({w,d,h,hex})=>[slab(w-.1,h*.42,d-.1,0,h*.21,0,DARK),pad(w,h*.58,d,0,h*.71,0,hex,.07)],
 shelf:({w,d,h})=>h<.12?[slab(w,h,d,0,h/2,0,WALNUT),drum(.07,.2,-w*.36,h+.1,0,0x8a6a4a,.05),drum(.1,.09,-w*.12,h+.045,0,RUST,.13),...books(w*.05,w*.42,h,0,d*.8,7),drum(.055,.26,w*.47,h+.13,0,0x39483f,.035)]
  :long(w,d,(l,s)=>{const rows=count(h,.36),gap=(h-.06)/rows,out=[slab(.03,h,s,-l/2+.015,h/2,0,WALNUT),slab(.03,h,s,l/2-.015,h/2,0,WALNUT),slab(l,.03,s,0,h-.015,0,WALNUT),slab(l-.06,h-.03,.015,0,(h-.03)/2,-s/2+.01,DARK)];
   for(let i=0;i<rows;i++){const y=.03+gap*i;out.push(slab(l-.06,.025,s-.02,0,y+.0125,0,WALNUT),...books(-l/2+.05,l/2-.05-(i%2)*.3,y+.025,.01,s*.8,13+i*29));}return out;}),
 // The cast-iron kettle swings over the fire on its own arm.
 kettle:({h})=>{const r=h*.46;return [paint(flat(new THREE.SphereGeometry(r,26,18).translate(0,r+.02,0)),RED),drum(r*.42,.04,0,2*r+.02,0,RED,r*.3),drum(.03,.05,0,2*r+.06,0,IRON),
  ...stick([[0,2*r+.06,0],[0,2*r+.3,0],[0,2*r+.3,-.34]],.018,IRON),...stick([[0,2*r+.3,-.34],[0,.1,-.34]],.022,IRON)];},
 'kitchen-cabinet':({w,d,h})=>{const n=count(w,.5),each=w/n,out=[slab(w,h-.14,d,0,.1+(h-.14)/2,0,ENAMEL),slab(w-.06,.1,d-.08,0,.05,-.02,IRON),slab(w+.02,.04,d+.02,0,h-.02,0,0x3b3a37)];
  for(let i=0;i<n;i++){const x=-w/2+each*(i+.5);out.push(pad(each-.03,h-.34,.018,x,.1+(h-.34)/2+.02,d/2+.008,0xf1eee4,.006),pad(each-.03,.13,.018,x,h-.13,d/2+.008,0xf1eee4,.006),slab(.1,.014,.02,x,h-.13,d/2+.026,IRON));}
  return out;},
 range:({w,d,h})=>long(w,d,(l,s)=>{const out=[pad(l,h-.04,s,0,(h-.04)/2+.01,0,ENAMEL,.02),slab(l+.01,.03,s+.01,0,h-.015,0,IRON),slab(l*.8,.02,.02,0,h-.2,s/2+.03,0xb8b4aa)];
  for(const x of [-1,1]){out.push(drum(.11,.012,x*l*.24,h+.006,0,0x3d3b38),pad(l*.42,h*.52,.02,x*l*.24,h*.36,s/2+.008,0xf2efe6,.01));}return out;}),
 bed:({w,d,h})=>{const n=w>1.4?2:1,out=[slab(w+.04,.2,d+.02,0,.12,0,WALNUT),slab(w+.04,.62,.04,0,.31,-d/2-.01,WALNUT),pad(w-.04,h-.2,d-.06,0,.22+(h-.2)/2,.01,LINEN,.05),pad(w,.05,d*.56,0,h+.035,d*.2,WOOL,.02),pad(w+.004,.052,.26,0,h+.036,-d*.06,CREAM,.02)];
  for(let i=0;i<n;i++)out.push(pad(w/n-.2,.12,.42,-w/2+w/n*(i+.5),h+.07,-d/2+.3,LINEN,.05));return out;},
 desk:({w,d,h})=>long(w,d,(l,s)=>[slab(l,.045,s,0,h-.0225,0,WALNUT),slab(.045,h-.045,s-.04,-l/2+.05,(h-.045)/2,0,DARK),slab(.42,.4,s-.06,l/2-.24,h-.245,0,WALNUT),slab(.36,.012,.02,l/2-.24,h-.16,s/2-.02,DARK),slab(.36,.012,.02,l/2-.24,h-.3,s/2-.02,DARK),
  ...books(-l*.3,-l*.3+.3,h,-s*.2,.16,5),drum(.07,.02,l*.1,h+.01,-s*.15,IRON),...stick([[l*.1,h,-s*.15],[l*.1,h+.3,-s*.15]],.008,IRON),drum(.09,.11,l*.1,h+.34,-s*.15,CREAM,.055)]),
 wardrobe:({w,d,h})=>{const n=count(w,.4),each=w/n,out=[slab(w,h,d-.02,0,h/2,-.01,WALNUT),slab(w+.03,.035,d+.02,0,h-.0175,0,DARK)];
  for(let i=0;i<n;i++){const x=-w/2+each*(i+.5);out.push(slab(each-.012,h-.1,.016,x,h/2-.01,d/2-.012,PALE),slab(.012,.16,.02,x+(i%2?-1:1)*(each/2-.04),h*.52,d/2,IRON));}return out;}
};
const kind=id=>pieces[id.replace(/-?\d+$/,'')]??pieces[id.split('-')[0]];

// Geometry for one furniture element, or null when the plain box of the model should stay.
export function furnish({id,face=-1,color},box){
 const make=kind(id);if(!make)return null;
 const size=box.getSize(new THREE.Vector3()),c=box.getCenter(new THREE.Vector3()),side=face===2,turn=face===1?Math.PI:side?Math.PI/2:0;
 const list=make({w:side?size.z:size.x,d:side?size.x:size.z,h:size.y,hex:new THREE.Color(color).getHex()});
 const g=mergeGeometries(list);list.forEach(p=>p.dispose());g.rotateY(turn);g.translate(c.x,box.min.y,c.z);return g;
}
