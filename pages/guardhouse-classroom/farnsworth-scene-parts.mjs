// Pieces of the Farnsworth scene that do not depend on the renderer: device shapes, route pipes, merged trim and walking zones.
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {L,W,FLOOR,PORCH,G,TZ,TERR,CORE,STAIR} from './src/farnsworth-model.mjs';

export const point=([x,y,z])=>new THREE.Vector3(x,z,-y);
const box=(group,size,color,position,{metalness=.3,roughness=.5}={})=>{
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,metalness,roughness}));
 mesh.position.set(...position);group.add(mesh);return mesh;
};
const tints={panel:0x9aa3a6,switch:0xf1eee6,socket:0xb9b2a0,cooktop:0x1b1c1e,heatpump:0xd8dad6,smoke:0xf4f1e8,heat:0xf4f1e8,extinguisher:0xc1332a};

// One mesh group per device; `indicator` lights up when the device is on.
export function deviceMesh(d){
 const g=new THREE.Group(),[w,depth,h]=d.size??[.2,.2,.2],color=tints[d.kind]??0xa8babf;
 if(d.kind==='light'){
  // An uplight lying on top of the core: the lamp faces the ceiling and the room is lit by what the plaster gives back.
  box(g,[w,h,depth],0xe9e7e0,[0,0,0],{metalness:.1,roughness:.4});
  g.userData.indicator=box(g,[w-.04,.012,depth-.03],0xfff3db,[0,h/2+.004,0],{metalness:0,roughness:.6});
  const glow=new THREE.PointLight(0xffe7c4,0,10,1.7);glow.position.y=.14;g.userData.glow=glow;g.add(glow);
 }else if(d.kind==='smoke'||d.kind==='heat'){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(w/2,w*.4,h,28),new THREE.MeshStandardMaterial({color,roughness:.5,metalness:.05}));
  g.add(mesh);if(d.kind==='heat')box(g,[.02,.02,.02],0xd9d4c6,[0,-h/2-.01,0],{metalness:.6});g.userData.indicator=mesh;
 }else if(d.kind==='extinguisher'){
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.42,20),new THREE.MeshStandardMaterial({color,roughness:.4,metalness:.3}));
  g.add(body);box(g,[.05,.07,.05],0x2b2f33,[0,.24,0]);g.userData.indicator=body;
 }else if(d.kind==='heatpump'){
  // Hung from the floor girders so that the river in flood passes underneath.
  box(g,[w,h,depth],color,[0,0,0],{metalness:.35,roughness:.45});box(g,[w+.16,.05,depth+.1],0xf2f1ec,[0,-h/2-.025,0],{metalness:0,roughness:.4});
  for(const x of [-1,1])for(const z of [-1,1])box(g,[.02,h+.42,.02],0xf2f1ec,[x*(w/2+.06),.16,z*(depth/2+.03)],{metalness:0,roughness:.4});
  const r=Math.min(w,h)*.36,rotor=new THREE.Group();rotor.position.set(0,0,depth/2+.02);g.add(rotor);g.userData.rotor=rotor;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.02,6,40),new THREE.MeshStandardMaterial({color:0x4d5a60,metalness:.6,roughness:.4}));g.add(ring);ring.position.copy(rotor.position);
  for(let i=0;i<5;i++){const blade=box(rotor,[r*.94,.07,.012],0xc2ccce,[0,0,0],{metalness:.7,roughness:.3});blade.geometry.translate(r*.47,0,0);blade.rotation.z=i*2*Math.PI/5;}
  g.userData.indicator=box(g,[.06,.06,.02],0x66b78c,[w/2-.1,h/2-.1,depth/2+.012],{metalness:0});
 }else if(d.kind==='cooktop'){
  box(g,[w,h,depth],color,[0,0,0],{metalness:.1,roughness:.12});
  const ringShape=new THREE.Mesh(new THREE.RingGeometry(.07,.1,32),new THREE.MeshStandardMaterial({color:0x3a3b3e,roughness:.4,metalness:0}));
  ringShape.rotation.x=-Math.PI/2;ringShape.position.set(-w*.22,h/2+.002,0);g.add(ringShape);g.userData.indicator=ringShape;
  const second=ringShape.clone();second.position.x=w*.22;g.add(second);
 }else{
  const shell=box(g,[w,h,depth],color,[0,0,0],{metalness:d.kind==='panel'||d.kind==='socket'?.6:.1,roughness:.4});
  if(d.kind==='panel'){box(g,[w*.8,h*.72,.012],0xe0e8e7,[0,0,-depth/2-.004]);g.userData.indicator=box(g,[.04,.04,.015],0x66b78c,[w*.28,h*.3,-depth/2-.012],{metalness:0});}
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

// Glazing rails and door frames are drawn as a few merged meshes: they are seen, never selected.
export function mergeContext(base){
 const sets=new Map(),context=new THREE.Group();context.name='context';
 for(const mesh of [...base.children]){
  const d=mesh.userData;if(!d.context||!mesh.isMesh)continue;
  const key=mesh.material.color.getHex();if(!sets.has(key))sets.set(key,[]);
  sets.get(key).push(mesh.geometry);base.remove(mesh);mesh.material.dispose();
 }
 for(const [color,list] of sets){
  const geometry=mergeGeometries(list.map(g=>{const n=g.index?g.toNonIndexed():g;for(const k of Object.keys(n.attributes))if(!['position','normal','uv'].includes(k))n.deleteAttribute(k);return n;}));
  for(const g of list)g.dispose();
  const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.38,metalness:0}));
  mesh.castShadow=mesh.receiveShadow=true;mesh.userData={context:true,kind:'frame'};mesh.raycast=()=>{};context.add(mesh);
 }
 return context;
}

// Walking: each zone is one level with rectangles a person can stand in. The veranda and the room are one floor joined by the door.
const E=L-G,N=W-G,pad=(x0,y0,x1,y1,m=.22)=>[x0-m,y0-m,x1+m,y1+m];
const house={z:FLOOR,eye:1.6,indoor:x=>x>PORCH,
 rects:[[.25,.25,PORCH-.3,W-.25],[PORCH-.35,3.75,PORCH+.35,5.5],[PORCH+.3,G+.3,E-.3,N-.3]],
 blocks:[pad(CORE.x0,CORE.y0,CORE.x1,CORE.y1),pad(19.5,.9,20.1,3.5),pad(19.05,4.3,21.1,5.8),pad(8.4,4.7,10.2,6.8,.1),pad(8.2,1.1,9.9,1.9),pad(15.3,1.05,17.25,2),pad(11.92,.87,13.68,1.63,.1),pad(12.3,2.15,13.3,3.15,.1)]};
export const zones={
 yard:{z:0,eye:1.6,indoor:false,rects:[[-70,-22,90,60]],blocks:[pad(TERR.x0,TERR.y0,TERR.x1,TERR.y1,.4),pad(0,0,L,W,.4),pad(STAIR.x0,-8.6,STAIR.x1,TERR.y0,.3)]},
 terrace:{z:TZ,eye:1.6,indoor:false,rects:[[TERR.x0+.25,TERR.y0+.25,TERR.x1-.25,TERR.y1-.25]],blocks:[]},
 porch:house,living:house,sleep:house
};
export const indoorAt=(id,x,y)=>{const i=zones[id]?.indoor;return typeof i==='function'?i(x,y):!!i;};
const inside=(r,x,y)=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3];
export function walkableAt(id,x,y){const zone=zones[id];return !!zone&&zone.rects.some(r=>inside(r,x,y))&&!zone.blocks.some(r=>inside(r,x,y));}
