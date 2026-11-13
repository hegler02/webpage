// Furniture drawn in the round: white plinths, lamp stands, wall cases, benches, counters and the lounge seats. The glass on them is made in yumin-glass.mjs.
// Each piece is built facing +z around its own centre on the floor, then turned and moved to where the model puts it.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const WHITE=0xe9e6dd,SHADOW=0xbfbcb3,OAK=0x8a6a4a,DARK=0x4b3a2a,LEATHER=0x3b3531,SEAM=0x2a2623,STEEL=0x3a3f44,SCREEN=0x15181b,STONE=0x3f3f42,UP=new THREE.Vector3(0,1,0);
const flat=g=>{const n=g.index?g.toNonIndexed():g;if(n!==g)g.dispose();n.deleteAttribute('uv');return n;};
function paint(g,hex){
 const c=new THREE.Color(hex),n=g.attributes.position.count,a=new Float32Array(n*3);
 for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(a,3));return g;
}
const slab=(w,h,d,x,y,z,hex)=>paint(flat(new THREE.BoxGeometry(w,h,d).translate(x,y,z)),hex);
const pad=(w,h,d,x,y,z,hex,r=.03)=>paint(flat(new RoundedBoxGeometry(w,h,d,3,Math.min(r,h/2-.002,w/2-.002,d/2-.002)).translate(x,y,z)),hex);
const drum=(r,h,x,y,z,hex,top=r)=>paint(flat(new THREE.CylinderGeometry(top,r,h,20).translate(x,y,z)),hex);
function stick(points,r,hex){
 const parts=[],p=points.map(q=>new THREE.Vector3(...q));
 for(let i=1;i<p.length;i++){
  const axis=p[i].clone().sub(p[i-1]),len=axis.length(),g=new THREE.CylinderGeometry(r,r,len,10);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP,axis.normalize()));g.translate(...p[i-1].clone().lerp(p[i],.5).toArray());parts.push(paint(flat(g),hex));
 }
 return parts;
}
// A backrest bent round the sitter: a shell of width w, height hb and thickness t whose top is at y and whose middle sits at z.
function backrest(w,hb,t,y,z){
 const R=w*1.1,half=Math.asin(w/2/R),shape=new THREE.Shape(),n=12;
 for(let i=0;i<=n;i++){const a=-half+2*half*i/n,px=R*Math.sin(a),pz=z+R*(1-Math.cos(a));i?shape.lineTo(px,pz):shape.moveTo(px,pz);}
 for(let i=n;i>=0;i--){const a=-half+2*half*i/n;shape.lineTo((R-t)*Math.sin(a),z+t+R*(1-Math.cos(a))-t*(1-Math.cos(a)));}
 const g=new THREE.ExtrudeGeometry(shape,{depth:hb,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:2,curveSegments:4});
 g.rotateX(Math.PI/2);g.translate(0,y,0);return paint(flat(g),OAK);
}
// Pieces are written lying along x; one that is longer the other way is built the same and turned a quarter.
const long=(w,d,build)=>{const parts=build(Math.max(w,d),Math.min(w,d));if(d>w)for(const g of parts)g.rotateY(Math.PI/2);return parts;};
// A plinth with a shadow gap at the floor and a felt pad on top.
const plinth=({w,d,h})=>[slab(w,h-.03,d,0,.03+(h-.03)/2,0,WHITE),slab(w-.06,.03,d-.06,0,.015,0,SHADOW),slab(w-.16,.012,d-.16,0,h+.006,0,SHADOW)];
const bench=({w,d,h})=>long(w,d,(l,s)=>[slab(l,.07,s,0,h-.035,0,OAK),slab(l-.5,.05,.04,0,h-.1,0,DARK),...[-1,1].map(x=>slab(.05,h-.07,s-.08,x*(l/2-.3),(h-.07)/2,0,STEEL))]);
// A standing counter: timber front, dark worktop behind a raised ledge, and a screen for the person behind it.
const counter=({w,d,h})=>long(w,d,(l,s)=>[slab(l,h-.05,.06,0,(h-.05)/2,s/2-.03,OAK),slab(.06,h-.05,s,-l/2+.03,(h-.05)/2,0,OAK),slab(.06,h-.05,s,l/2-.03,(h-.05)/2,0,OAK),slab(l,.05,.3,0,h-.025,s/2-.15,OAK),
 slab(l-.12,.04,s-.3,0,h-.31,-.15,DARK),slab(l-.12,.03,.03,0,.08,s/2-.08,STEEL),slab(.42,.27,.02,l*.2,h-.13,-s*.1,SCREEN),slab(.06,.1,.04,l*.2,h-.26,-s*.1-.03,STEEL)]);
const pieces={
 plinth,'plinth-ne':plinth,'plinth-se':plinth,'plinth-round':plinth,
 // The round room's centre: a basalt block for the largest piece.
 showpiece:({w,d})=>[slab(w,.5,d,0,.27,0,STONE),slab(w-.08,.02,d-.08,0,.01,0,SEAM),slab(w-.3,.02,d-.3,0,.53,0,WHITE)],
 // Plinth for a lamp.
 lampstand:({w,d,h})=>[slab(w,h-.03,d,0,.03+(h-.03)/2,0,WHITE),slab(w-.06,.03,d-.06,0,.015,0,SHADOW)],
 // Wall case opening toward the room: base cupboard, lit recess and a shelf.
 case:({w,d,h})=>long(w,d,(l,s)=>[slab(l,.75,s,0,.375,0,WHITE),slab(l-.04,.03,s-.04,0,.015,0,SHADOW),slab(l,h-.75,.05,0,.75+(h-.75)/2,-s/2+.025,WHITE),slab(l,.1,s,0,h-.05,0,WHITE),slab(.05,h-.85,s,-l/2+.025,.75+(h-.85)/2,0,WHITE),slab(.05,h-.85,s,l/2-.025,.75+(h-.85)/2,0,WHITE),slab(l-.1,.015,s-.14,0,1.32,-.04,SHADOW)]),
 bench,desk:counter,
 'desk-staff':({w,d,h})=>long(w,d,(l,s)=>[slab(l,.03,s,0,h-.015,0,OAK),...[-1,1].map(x=>slab(.04,h-.03,s-.1,x*(l/2-.06),(h-.03)/2,0,STEEL)),slab(l-.16,.3,.02,0,h-.2,-s/2+.08,STEEL),slab(.5,.3,.02,0,h+.25,-s*.2,SCREEN),slab(.05,.1,.05,0,h+.05,-s*.2-.02,STEEL),slab(.2,.012,.14,0,h+.006,-s*.2,STEEL),slab(.4,.015,.14,0,h+.008,s*.1,SCREEN)]),
 // Café table: a round oak top on a steel column and foot.
 table:({w,h})=>[paint(flat(new THREE.CylinderGeometry(w/2,w/2-.01,.035,48).translate(0,h-.0175,0)),OAK),drum(.035,h-.06,0,(h-.06)/2+.025,0,STEEL),drum(.24,.025,0,.0125,0,STEEL,.2)],
 // Café chair facing +z: oak seat with a leather pad, a backrest bent round the sitter, legs splayed a little.
 chair:({w,d,h})=>{const lx=w/2-.05,front=d/2-.06,rear=-d/2+.06;return [pad(w-.04,.05,d-.06,0,.425,.01,OAK,.02),pad(w-.1,.04,d-.12,0,.47,.02,LEATHER,.018),backrest(w-.02,.24,.022,h,rear-.01),
  ...[-1,1].flatMap(x=>[...stick([[x*(lx+.02),0,front+.02],[x*lx,.4,front]],.014,OAK),...stick([[x*(lx+.02),0,rear-.03],[x*lx,.4,rear],[x*(lx-.01),h-.02,rear-.015]],.014,OAK)]),...stick([[-lx,.2,front],[lx,.2,front]],.009,OAK)];},
 sofa:({w,d,h})=>{const out=[slab(w,.16,d,0,.2,0,SEAM),pad(w,h-.28,.2,0,.28+(h-.28)/2,-d/2+.1,LEATHER,.06),...[-1,1].map(x=>pad(.16,.34,d,x*(w/2-.08),.45,0,LEATHER,.05)),...[-1,1].flatMap(x=>[-1,1].map(z=>slab(.04,.12,.04,x*(w/2-.1),.06,z*(d/2-.08),STEEL)))];
  for(let i=0;i<3;i++)out.push(pad((w-.34)/3-.02,.16,d-.24,-w/2+.17+(w-.34)*(i+.5)/3,.36,.1,LEATHER,.05));return out;}
};
const stem=id=>id.replace(/-?\d+$/,'');
const kind=(set,id)=>set[stem(id)]??set[id.split('-')[0]];
// Which way a piece looks: the lounge sofa faces the glass to the north, chairs face their table, wall cases face west into the room.
const turned=({id,face})=>id==='sofa'?Math.PI:id.startsWith('chair')?face===1?Math.PI/2:-Math.PI/2:id.startsWith('case')?Math.PI:0;
// The frame a piece is built in: its kind, number and size facing +z, and the turn and floor point that set it in the room.
export function frameOf(item,box){
 const size=box.getSize(new THREE.Vector3()),c=box.getCenter(new THREE.Vector3()),turn=turned(item),side=Math.abs(Math.sin(turn))>.5,make=kind(pieces,item.id);
 return {kind:make&&Object.keys(pieces).find(k=>pieces[k]===make&&!k.includes('-'))||stem(item.id),n:Number(item.id.match(/\d+$/)?.[0]??0),w:side?size.z:size.x,d:side?size.x:size.z,h:size.y,turn,x:c.x,y:box.min.y,z:c.z};
}
// Geometry for one furniture element, or null when the plain box of the model should stay.
export function furnish(item,box){
 const make=kind(pieces,item.id);if(!make)return null;
 const f=frameOf(item,box),list=make(f),g=mergeGeometries(list);list.forEach(p=>p.dispose());g.rotateY(f.turn);g.translate(f.x,f.y,f.z);return g;
}
