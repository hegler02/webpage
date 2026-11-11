// Pieces of the Salk scene that do not depend on the renderer: device shapes, the mesa and ocean, merged context and walking zones.
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {L,W,CLEAR,SLAB,TOWER,AXIS,MIRROR,trussX,towerX} from './src/salk-model.mjs';

export const point=([x,y,z])=>new THREE.Vector3(x,z,-y);
const box=(group,size,color,position,{metalness=.3,roughness=.5}={})=>{
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,metalness,roughness}));
 mesh.position.set(...position);group.add(mesh);return mesh;
};
const tints={panel:0x8f9aa0,switch:0xe8e4da,socket:0xe8e4da,fan:0x7f8b90,ahu:0x9aa5a8,receiver:0xb5433a,callpoint:0xc23b2e,bell:0xb5362b,hydrant:0xb5362b,exit:0x08734d,extinguisher:0xc1332a,sprinkler:0xc9ccc8,smoke:0xf4f1e8,light:0xdad6cc};

// One mesh group per device; `indicator` lights up when the device is on.
export function deviceMesh(d){
 const g=new THREE.Group(),[w,depth,h]=d.size??[.2,.2,.2],color=tints[d.kind]??0xa8babf;
 if(d.kind==='light'){
  box(g,[w,h,depth],0x8d949a,[0,0,0]);
  g.userData.indicator=box(g,[w-.06,.012,depth-.04],0xfff3db,[0,-h/2-.004,0],{metalness:0,roughness:.6});
  const glow=new THREE.PointLight(0xffedce,0,11,1.6);glow.position.y=-.35;g.userData.glow=glow;g.add(glow);
 }else if(d.kind==='smoke'||d.kind==='sprinkler'){
  const r=d.kind==='smoke'?.1:.035,mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.76,d.kind==='smoke'?.065:.09,24),new THREE.MeshStandardMaterial({color,roughness:.5,metalness:d.kind==='smoke'?.05:.7}));
  g.add(mesh);g.userData.indicator=mesh;
 }else if(d.kind==='extinguisher'){
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.42,20),new THREE.MeshStandardMaterial({color,roughness:.4,metalness:.3}));
  g.add(body);box(g,[.05,.07,.05],0x2b2f33,[0,.24,0]);g.userData.indicator=body;
 }else if(d.kind==='fan'||d.kind==='ahu'){
  box(g,[w,h,depth],color,[0,0,0],{metalness:.55,roughness:.42});
  const rotor=new THREE.Group();rotor.position.set(0,0,depth/2+.02);g.add(rotor);g.userData.rotor=rotor;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(Math.min(w,h)*.36,.02,6,40),new THREE.MeshStandardMaterial({color:0x4d5a60,metalness:.6,roughness:.4}));g.add(ring);ring.position.copy(rotor.position);
  for(let i=0;i<5;i++){const blade=box(rotor,[Math.min(w,h)*.34,.07,.012],0xc2ccce,[0,0,0],{metalness:.7,roughness:.3});blade.geometry.translate(Math.min(w,h)*.17,0,0);blade.rotation.z=i*2*Math.PI/5;}
  g.userData.indicator=box(g,[.06,.06,.02],0x66b78c,[w/2-.12,h/2-.12,depth/2+.012],{metalness:0});
 }else{
  const shell=box(g,[w,h,depth],color,[0,0,0],{metalness:d.kind==='panel'?.6:.25});
  if(d.kind==='panel'||d.kind==='receiver'){box(g,[w*.8,h*.72,.012],0xe0e8e7,[0,0,-depth/2-.004]);g.userData.indicator=box(g,[.04,.04,.015],0x66b78c,[w*.28,h*.3,-depth/2-.012],{metalness:0});}
  else g.userData.indicator=shell;
 }
 g.position.copy(point(d.pos));g.traverse(o=>{o.userData.deviceId=d.id;});return g;
}

export function pipe(points,material,radius){
 const path=new THREE.Group();
 for(let i=1;i<points.length;i++){
  const a=point(points[i-1]),b=point(points[i]),axis=b.clone().sub(a);
  if(axis.length()<.001)continue;
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,axis.length(),8),material);
  mesh.position.copy(a).lerp(b,.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axis.normalize());path.add(mesh);
 }return path;
}

// The south block and other context are drawn as a few merged meshes: they are seen, never selected.
export function mergeContext(base){
 const sets=new Map(),context=new THREE.Group();context.name='context';
 for(const mesh of [...base.children]){
  const d=mesh.userData;if(!d.context||!mesh.isMesh)continue;
  const glass=d.kind==='window-glass',key=(glass?'g':'s')+mesh.material.color.getHex();
  if(!sets.has(key))sets.set(key,{glass,color:mesh.material.color.getHex(),list:[]});
  sets.get(key).list.push(mesh.geometry);base.remove(mesh);mesh.material.dispose();
 }
 for(const set of sets.values()){
  const geometry=mergeGeometries(set.list.map(g=>{const n=g.index?g.toNonIndexed():g;for(const k of Object.keys(n.attributes))if(!['position','normal','uv'].includes(k))n.deleteAttribute(k);return n;}));
  for(const g of set.list)g.dispose();
  const material=new THREE.MeshStandardMaterial({color:set.color,roughness:set.glass?.08:.86,metalness:0,transparent:set.glass,opacity:set.glass?.44:1});
  const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=!set.glass;mesh.receiveShadow=true;mesh.userData={context:true,kind:set.glass?'window-glass':'context'};mesh.raycast=()=>{};context.add(mesh);
 }
 return context;
}

const WEST=-22,SEA=-100;
// Mesa top with openings for the two blocks, the cliff that falls to the west, and the Pacific.
export function buildLand(){
 const land=new THREE.Group();land.name='land';
 const shape=new THREE.Shape([[WEST,-520],[620,-520],[620,520],[WEST,520]].map(p=>new THREE.Vector2(...p)));
 for(const [x0,y0,x1,y1] of [[-9.5,-12.5,L+12.5,W+8],[-9.5,MIRROR-W-8,L+12.5,MIRROR+12.5],[-21.9,-39.2,L+2.9,-12.6]])shape.holes.push(new THREE.Path([[x0,y0],[x0,y1],[x1,y1],[x1,y0]].map(p=>new THREE.Vector2(...p))));
 const ground=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshStandardMaterial({color:0xa69c88,roughness:1}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.03;ground.receiveShadow=true;ground.raycast=()=>{};
 const slope=new THREE.BufferGeometry(),far=-240;
 slope.setAttribute('position',new THREE.Float32BufferAttribute([WEST,-.03,520, far,SEA,520, far,SEA,-520, WEST,-.03,520, far,SEA,-520, WEST,-.03,-520],3));slope.computeVertexNormals();
 const cliff=new THREE.Mesh(slope,new THREE.MeshStandardMaterial({color:0x6f6a55,roughness:1,side:THREE.DoubleSide}));cliff.receiveShadow=true;cliff.raycast=()=>{};cliff.userData.aoKeep=true;
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(36000,36000),new THREE.MeshStandardMaterial({color:0x2c5a70,roughness:.42,metalness:0}));
 sea.rotation.x=-Math.PI/2;sea.position.set(far-18000+60,SEA+.5,0);sea.raycast=()=>{};sea.userData.aoKeep=true;
 // What lies below the sunken courts where no paving is modelled.
 const under=new THREE.Mesh(new THREE.PlaneGeometry(L+40,W*2-MIRROR+20),new THREE.MeshStandardMaterial({color:0x8d8676,roughness:1}));
 under.rotation.x=-Math.PI/2;under.position.set(L/2-4,-6.6,-MIRROR/2);under.receiveShadow=true;under.raycast=()=>{};
 land.add(cliff,sea,under);
 return {land,ground,sea};
}

// Walking: each zone is one level with rectangles a person can stand in.
const span=(W-.44)/6,PIPE=CLEAR+SLAB;
const tower=i=>{const x=towerX(i);return [[x+.5,-12.6,x+3.6,-8.5],[x+.6,-8.6,x+8.2,-3.3],[x+3.1,-3.4,x+5.7,-1.4]];};
export const zones={
 court:{z:0,eye:1.6,indoor:false,rects:[[-21.4,-39.3,L+2.6,-12.5],[.3,-1.45,L-.3,-.25],...[0,1,2,3,4].flatMap(tower)],blocks:[[-21.2,AXIS-1.4,-14.8,AXIS+1.4],[69.8,AXIS-1.4,72.6,AXIS+1.4]]},
 lab:{z:0,eye:1.6,indoor:true,rects:[[.8,.6,L-.8,W-.6]],blocks:[[31.65,5.95,36.95,7.75],[31.65,12.05,36.95,13.85],[35.15,17.55,37.15,19]]},
 pipe:{z:PIPE,eye:1.45,indoor:true,rects:[[.8,.5,L-.8,W-.5]],blocks:[[32.8,8.9,35.8,10.9]],truss:true},
 portico:{z:6.1,eye:1.6,indoor:false,rects:[[towerX(2)+.6,-8.3,towerX(2)+8.2,-3.3],[towerX(2)+4.3,-9.6,towerX(2)+6.2,-8.3],[towerX(2)+3.1,-3.4,towerX(2)+5.7,-1.4],[.3,-1.45,L-.3,-.25]],blocks:[]}
};
const inside=(r,x,y)=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3];
export function walkableAt(id,x,y){
 const zone=zones[id];if(!zone||!zone.rects.some(r=>inside(r,x,y))||zone.blocks.some(r=>inside(r,x,y)))return false;
 if(!zone.truss)return true;
 // A Vierendeel truss is crossed only through one of its six openings.
 for(let i=0;i<13;i++){if(Math.abs(x-trussX(i))>.4)continue;const k=Math.floor((y-.22)/span),c=.22+span*(k+.5);return k>=0&&k<6&&Math.abs(y-c)<span/2-.45;}
 return true;
}
export {TOWER};
