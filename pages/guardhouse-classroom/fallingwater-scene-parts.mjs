// Pieces of the Fallingwater scene that do not depend on the renderer: device shapes and the places a visitor can stand.
import * as THREE from 'three';
import {point,deviceMesh as plain,pipe,mergeContext} from './farnsworth-scene-parts.mjs';
import {F1,F2,F3,T,DRIVE,MAIN} from './src/fallingwater-model.mjs';
import {groundAt,waterAt} from './fallingwater-land.mjs';

export {point,pipe,mergeContext};
const box=(group,size,color,position,{metalness=.3,roughness=.5}={})=>{
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,metalness,roughness}));
 mesh.position.set(...position);group.add(mesh);return mesh;
};

// Lamps sit in the ceiling and shine down; the heat pump stands on the drive behind the house. Every other device keeps the common shape.
export function deviceMesh(d){
 if(d.kind!=='light'&&d.kind!=='heatpump')return plain(d);
 const g=new THREE.Group(),[w,depth,h]=d.size??[.2,.2,.2];
 if(d.kind==='light'){
  box(g,[w,h,depth],0xd9c7a2,[0,0,0],{metalness:.05,roughness:.6});
  g.userData.indicator=box(g,[w-.05,.012,depth-.04],0xfff3db,[0,-h/2-.004,0],{metalness:0,roughness:.6});
  const glow=new THREE.PointLight(0xffdcae,0,9,1.7);glow.position.y=-.3;g.userData.glow=glow;g.add(glow);
 }else{
  box(g,[w,h,depth],0xd8dad6,[0,0,0],{metalness:.35,roughness:.45});box(g,[w+.3,.1,depth+.3],0x8f8c84,[0,-h/2-.05,0],{metalness:0,roughness:.95});
  const r=Math.min(w,h)*.36,rotor=new THREE.Group();rotor.position.set(0,0,-depth/2-.02);g.add(rotor);g.userData.rotor=rotor;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.02,6,40),new THREE.MeshStandardMaterial({color:0x4d5a60,metalness:.6,roughness:.4}));g.add(ring);ring.position.copy(rotor.position);
  for(let i=0;i<5;i++){const blade=box(rotor,[r*.94,.07,.012],0xc2ccce,[0,0,0],{metalness:.7,roughness:.3});blade.geometry.translate(r*.47,0,0);blade.rotation.z=i*2*Math.PI/5;}
  g.userData.indicator=box(g,[.06,.06,.02],0x66b78c,[w/2-.1,h/2-.1,-depth/2-.012],{metalness:0});
 }
 g.position.copy(point(d.pos));g.traverse(o=>{o.userData.deviceId=d.id;});return g;
}

// Walking: a zone is one level with rectangles to stand in, or open ground that follows the land and stops at deep water.
const GS=MAIN.y0+T,pad=(x0,y0,x1,y1,m=.22)=>[x0-m,y0-m,x1+m,y1+m];
const first={z:F1,eye:1.6,indoor:(x,y)=>x>.1&&x<11.5&&y>GS&&y<7.1,
 rects:[[.4,GS+.2,11.2,5.5],[11.1,-1.2,11.9,.8],[11.85,-4.25,16.2,2.2],[-.3,-.6,.5,1.2],[-6,-2.4,-.25,2],[11.1,5.5,12.4,6.3],[12.35,3.35,13.95,6.85]],
 blocks:[pad(7,-3.6,10.6,-2.6,.2),pad(.6,GS+.1,6.6,GS+.88,.12),pad(.2,GS+.9,.95,-2.7,.12),pad(4.4,4,7.7,5.7,.12),pad(2.4,-3.1,3.3,-2.2,.08),pad(4.4,-3.1,5.3,-2.2,.08),[-.5,3.5,3.2,5.6]]};
const dry=(x,y)=>groundAt(x,y)>waterAt(x,y)-.12;
export const zones={
 falls:{eye:1.6,indoor:false,level:groundAt,ok:dry,rects:[[-34,-52,14,-12.5]],blocks:[]},
 bridge:{z:DRIVE,eye:1.6,indoor:false,ok:(x,y)=>(x>18.7&&x<22.1&&y>-7.5&&y<1.1)||Math.abs(groundAt(x,y)-DRIVE)<.3,
  rects:[[18.8,-7.4,22,1.1],[17.2,-40,23.6,-7.4],[17.2,1.1,23.6,12.2],[-30,8.3,23.6,12.2]],blocks:[]},
 living:first,terrace:first,
 stream:{z:.2,eye:1.6,indoor:false,rects:[[6.05,-3.65,6.95,-2.55]],blocks:[]},
 master:{z:F2,eye:1.6,indoor:(x,y)=>y>1.2,
  rects:[[.4,-4.2,11.2,1],[1.95,-6.05,9.25,-4.1],[4.4,.9,6.2,1.5],[3.25,1.4,7.75,4.55],[9.4,.9,10.8,1.5],[8.65,1.4,11.3,4.55]],
  blocks:[pad(2.6,.2,3,1.2,.15),pad(8,.2,8.4,1.2,.15),pad(4.6,2.6,6.6,4.7,.12),pad(3.05,1.4,3.65,3.2,.12),pad(9.4,2.6,10.9,4.7,.12),pad(7.2,4.15,7.95,4.72,.1)]},
 roof:{z:F3,eye:1.6,indoor:(x,y)=>y>4.9,
  rects:[[.45,.45,7.95,4.7],[5.2,4.6,6.6,5.3],[3.25,5.1,9.5,5.85]],
  blocks:[pad(3.2,4.98,4.6,5.28,.1),pad(8.75,5.2,9.7,7.05,.1)]}
};
export const levelAt=(id,x,y)=>{const z=zones[id];return z.level?z.level(x,y):z.z;};
export const indoorAt=(id,x,y)=>{const i=zones[id]?.indoor;return typeof i==='function'?i(x,y):!!i;};
const inside=(r,x,y)=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3];
export function walkableAt(id,x,y){const zone=zones[id];return !!zone&&zone.rects.some(r=>inside(r,x,y))&&!zone.blocks.some(r=>inside(r,x,y))&&(!zone.ok||zone.ok(x,y));}
