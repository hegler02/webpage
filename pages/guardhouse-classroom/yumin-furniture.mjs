// Furniture drawn in the round: white plinths carrying glass, the lamp room's glowing shades, wall cases, benches, counters and the lounge seats.
// Each piece is built facing +z around its own centre on the floor, then turned and moved to where the model puts it.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const WHITE=0xe9e6dd,SHADOW=0xbfbcb3,OAK=0x8a6a4a,DARK=0x4b3a2a,LEATHER=0x3b3531,SEAM=0x2a2623,STEEL=0x3a3f44,BRONZE=0x7a5a36,SCREEN=0x15181b,STONE=0x3f3f42,UP=new THREE.Vector3(0,1,0);
// Glass colours of the collection: amber, moss, rose, cobalt, cream and plum.
const GLASS=[0xc9822e,0x6f7f3a,0xb5566a,0x3a5f8a,0xe6d8b0,0x6a3d5c],SHADE=[0xe8a94a,0xd9703a,0xe6c36a,0xc9553a,0xe0b060,0xd98a4a];
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
// Pieces are written lying along x; one that is longer the other way is built the same and turned a quarter.
const long=(w,d,build)=>{const parts=build(Math.max(w,d),Math.min(w,d));if(d>w)for(const g of parts)g.rotateY(Math.PI/2);return parts;};
// Blown glass turned on a lathe: each outline is [radius, height] in parts of the vessel's width and height.
const outlines=[
 [[0,0],[.3,0],[.44,.22],[.38,.5],[.15,.72],[.11,.94],[.17,1]],
 [[0,0],[.26,0],[.5,.3],[.56,.62],[.42,.86],[.46,1]],
 [[0,0],[.3,0],[.46,.2],[.3,.46],[.37,.62],[.19,.86],[.24,1]],
 [[0,0],[.24,0],[.21,.5],[.29,.88],[.4,1]],
 [[0,0],[.34,0],[.5,.38],[.3,.7],[.2,.8],[.32,1]]];
const blown=(n,h,s,x,y,z,hex)=>paint(flat(new THREE.LatheGeometry(outlines[n%outlines.length].map(([r,t])=>new THREE.Vector2(r*s,t*h)),22).translate(x,y,z)),hex);
const dome=(r,squash,x,y,z,hex)=>{const g=new THREE.SphereGeometry(r,22,10,0,Math.PI*2,0,Math.PI/2);g.scale(1,squash,1);g.translate(x,y,z);return paint(flat(g),hex);};

// A plinth with a shadow gap at the floor and one glass piece on top.
const plinth=({w,d,h,n})=>[slab(w,h-.03,d,0,.03+(h-.03)/2,0,WHITE),slab(w-.06,.03,d-.06,0,.015,0,SHADOW),slab(w-.16,.012,d-.16,0,h+.006,0,SHADOW),blown(n,.28+(n*7%5)*.04,.36,0,h+.012,0,GLASS[(n*5+1)%GLASS.length])];
const bench=({w,d,h})=>long(w,d,(l,s)=>[slab(l,.07,s,0,h-.035,0,OAK),slab(l-.5,.05,.04,0,h-.1,0,DARK),...[-1,1].map(x=>slab(.05,h-.07,s-.08,x*(l/2-.3),(h-.07)/2,0,STEEL))]);
// A standing counter: timber front, dark worktop behind a raised ledge, and a screen for the person behind it.
const counter=({w,d,h})=>long(w,d,(l,s)=>[slab(l,h-.05,.06,0,(h-.05)/2,s/2-.03,OAK),slab(.06,h-.05,s,-l/2+.03,(h-.05)/2,0,OAK),slab(.06,h-.05,s,l/2-.03,(h-.05)/2,0,OAK),slab(l,.05,.3,0,h-.025,s/2-.15,OAK),
 slab(l-.12,.04,s-.3,0,h-.31,-.15,DARK),slab(l-.12,.03,.03,0,.08,s/2-.08,STEEL),slab(.42,.27,.02,l*.2,h-.13,-s*.1,SCREEN),slab(.06,.1,.04,l*.2,h-.26,-s*.1-.03,STEEL)]);
const pieces={
 plinth,'plinth-ne':plinth,'plinth-se':plinth,'plinth-round':plinth,
 // The round room's centre: a basalt block carrying the largest piece.
 showpiece:({w,d,h})=>[slab(w,.5,d,0,.27,0,STONE),slab(w-.08,.02,d-.08,0,.01,0,SEAM),slab(w-.3,.02,d-.3,0,.53,0,WHITE),blown(1,h-.1,.7,0,.54,0,GLASS[0]),blown(3,.34,.3,-.3,.54,.3,GLASS[3])],
 // Plinth for a lamp; the glowing glass itself is drawn by glow() below.
 lampstand:({w,d,h})=>[slab(w,h-.03,d,0,.03+(h-.03)/2,0,WHITE),slab(w-.06,.03,d-.06,0,.015,0,SHADOW),drum(.085,.02,0,h+.01,0,BRONZE),...stick([[0,h+.2,0],[0,h+.33,0]],.012,BRONZE)],
 // Wall case opening toward the room: base cupboard, lit recess and a row of small glass.
 case:({w,d,h})=>long(w,d,(l,s)=>{const out=[slab(l,.75,s,0,.375,0,WHITE),slab(l-.04,.03,s-.04,0,.015,0,SHADOW),slab(l,h-.75,.05,0,.75+(h-.75)/2,-s/2+.025,WHITE),slab(l,.1,s,0,h-.05,0,WHITE),slab(.05,h-.85,s,-l/2+.025,.75+(h-.85)/2,0,WHITE),slab(.05,h-.85,s,l/2-.025,.75+(h-.85)/2,0,WHITE),slab(l-.1,.015,s-.14,0,1.32,-.04,SHADOW)];
  for(let i=0;i<5;i++){const x=-l/2+l*(i+.5)/5;out.push(blown(i+2,.2+(i%3)*.05,.26,x,.75,.02,GLASS[(i*2+1)%GLASS.length]),blown(i,.16+(i%2)*.05,.2,x+.12,1.335,-.04,GLASS[(i*3+2)%GLASS.length]));}return out;}),
 bench,desk:counter,
 'desk-staff':({w,d,h})=>long(w,d,(l,s)=>[slab(l,.03,s,0,h-.015,0,OAK),...[-1,1].map(x=>slab(.04,h-.03,s-.1,x*(l/2-.06),(h-.03)/2,0,STEEL)),slab(l-.16,.3,.02,0,h-.2,-s/2+.08,STEEL),slab(.5,.3,.02,0,h+.25,-s*.2,SCREEN),slab(.05,.1,.05,0,h+.05,-s*.2-.02,STEEL),slab(.2,.012,.14,0,h+.006,-s*.2,STEEL),slab(.4,.015,.14,0,h+.008,s*.1,SCREEN)]),
 table:({w,d,h})=>[pad(w,.035,d,0,h-.0175,0,OAK,.012),drum(.035,h-.06,0,(h-.06)/2+.025,0,STEEL),drum(.24,.025,0,.0125,0,STEEL),drum(.06,.12,0,h+.06,w*.12,GLASS[4],.045)],
 chair:({w,d,h})=>[pad(w-.04,.07,d-.06,0,.44,.01,LEATHER,.03),pad(w-.06,h-.5,.06,0,.5+(h-.5)/2,-d/2+.05,LEATHER,.028),...[-1,1].flatMap(x=>[...stick([[x*(w/2-.05),0,d/2-.06],[x*(w/2-.05),.41,d/2-.06]],.012,STEEL),...stick([[x*(w/2-.05),0,-d/2+.05],[x*(w/2-.05),h-.08,-d/2+.05]],.012,STEEL)])],
 sofa:({w,d,h})=>{const out=[slab(w,.16,d,0,.2,0,SEAM),pad(w,h-.28,.2,0,.28+(h-.28)/2,-d/2+.1,LEATHER,.06),...[-1,1].map(x=>pad(.16,.34,d,x*(w/2-.08),.45,0,LEATHER,.05)),...[-1,1].flatMap(x=>[-1,1].map(z=>slab(.04,.12,.04,x*(w/2-.1),.06,z*(d/2-.08),STEEL)))];
  for(let i=0;i<3;i++)out.push(pad((w-.34)/3-.02,.16,d-.24,-w/2+.17+(w-.34)*(i+.5)/3,.36,.1,LEATHER,.05));return out;}
};
// Glowing parts, kept apart so the view can give them a lit material: a glass foot and a domed shade over each lamp stand.
const lit={lampstand:({h,n})=>[blown(n+1,.2,.2,0,h+.02,0,SHADE[n%SHADE.length]),dome(.17+(n%3)*.015,.72,0,h+.3,0,SHADE[(n+2)%SHADE.length])]};
const stem=id=>id.replace(/-?\d+$/,'');
const kind=(set,id)=>set[stem(id)]??set[id.split('-')[0]];
// Which way a piece looks: the lounge sofa faces the glass to the north, chairs face their table, wall cases face west into the room.
const turned=({id,face})=>id==='sofa'?Math.PI:id.startsWith('chair')?face===1?Math.PI/2:-Math.PI/2:id.startsWith('case')?Math.PI:0;
function build(set,item,box){
 const make=kind(set,item.id);if(!make)return null;
 const size=box.getSize(new THREE.Vector3()),c=box.getCenter(new THREE.Vector3()),turn=turned(item),side=Math.abs(Math.sin(turn))>.5;
 const list=make({w:side?size.z:size.x,d:side?size.x:size.z,h:size.y,n:Number(item.id.match(/\d+$/)?.[0]??0)});
 const g=mergeGeometries(list);list.forEach(p=>p.dispose());g.rotateY(turn);g.translate(c.x,box.min.y,c.z);return g;
}

// Geometry for one furniture element, or null when the plain box of the model should stay.
export const furnish=(item,box)=>build(pieces,item,box);
// Geometry of the parts of it that shine, or null.
export const glow=(item,box)=>build(lit,item,box);
