// Pieces of the Yumin scene that do not depend on the renderer: device shapes and the places a visitor can stand.
import * as THREE from 'three';
import {point,deviceMesh as plain,pipe,mergeContext} from './farnsworth-scene-parts.mjs';
import {yuminModel,B1} from './src/yumin-model.mjs';

export {point,pipe,mergeContext};
const box=(group,size,color,position,{metalness=.3,roughness=.5}={})=>{
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,metalness,roughness}));
 mesh.position.set(...position);group.add(mesh);return mesh;
};
const drum=(group,r,h,color,position,{metalness=.3,roughness=.5,turn=null}={})=>{
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),new THREE.MeshStandardMaterial({color,metalness,roughness}));
 if(turn)mesh.rotation[turn]=Math.PI/2;mesh.position.set(...position);group.add(mesh);return mesh;
};
const RED=0xc23a2b,STEEL=0xc9cfd1;

// A wall device is thin along the axis that points out of its wall; `out` returns that axis and the size across it.
const facing=([w,depth])=>w<depth?['x',depth]:['z',w];
const shapes={
 // Ceiling lamps shine down. Bars for the tall galleries, round downlights under the low ceilings.
 light(g,d,[w,depth,h]){
  const round=Math.abs(w-depth)<.02;
  if(round){drum(g,w/2,h,0xe9e7e0,[0,0,0],{metalness:.1,roughness:.5});g.userData.indicator=drum(g,w/2-.02,.012,0xfff3db,[0,-h/2-.004,0],{metalness:0,roughness:.6});}
  else{box(g,[w,h,depth],0x2f3336,[0,0,0],{metalness:.4,roughness:.5});g.userData.indicator=box(g,[w-.04,.012,depth-.03],0xfff3db,[0,-h/2-.004,0],{metalness:0,roughness:.6});}
  const glow=new THREE.PointLight(0xffe2b8,0,12,1.6);glow.position.y=-.35;g.userData.glow=glow;g.add(glow);
 },
 // Air handler: a long casing on a plinth with the fan showing at one end.
 ahu(g,d,[w,depth,h]){
  box(g,[w,h,depth],0xcfd4d2,[0,0,0],{metalness:.35,roughness:.45});box(g,[w+.2,.1,depth+.2],0x8f8c84,[0,-h/2-.05,0],{metalness:0,roughness:.95});
  for(const x of [-w/6,w/6])box(g,[.02,h-.1,depth+.01],0x9aa2a1,[x,0,0],{metalness:.4});
  drum(g,.28,.5,0xb8bfbd,[w/4,h/2+.25,0],{metalness:.5,roughness:.4});
  const r=Math.min(depth,h)*.3,rotor=new THREE.Group();rotor.position.set(-w/2-.02,0,0);rotor.rotation.y=Math.PI/2;g.add(rotor);g.userData.rotor=rotor;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.02,6,40),new THREE.MeshStandardMaterial({color:0x4d5a60,metalness:.6,roughness:.4}));ring.position.copy(rotor.position);ring.rotation.y=Math.PI/2;g.add(ring);
  for(let i=0;i<6;i++){const blade=box(rotor,[r*.94,.09,.012],0xc2ccce,[0,0,0],{metalness:.7,roughness:.3});blade.geometry.translate(r*.47,0,0);blade.rotation.z=i*Math.PI/3;}
  g.userData.indicator=box(g,[.02,.07,.07],0x66b78c,[-w/2-.012,h/2-.14,depth/2-.14],{metalness:0});
 },
 // Circulating pump for the water walls: motor, volute and two pipe stubs.
 pump(g,d,[w,depth,h]){
  box(g,[w,.08,depth],0x8f8c84,[0,-h/2+.04,0],{metalness:0,roughness:.95});
  drum(g,h*.3,w*.5,0x3f6f86,[-w*.2,-.02,0],{metalness:.4,roughness:.45,turn:'z'});drum(g,h*.36,w*.22,0x4d5a60,[w*.2,-.02,0],{metalness:.5,roughness:.4,turn:'z'});
  drum(g,.06,h*.5,STEEL,[w*.2,h*.25,0],{metalness:.7,roughness:.3});drum(g,.06,depth*.6,STEEL,[w*.36,-.02,depth*.2],{metalness:.7,roughness:.3,turn:'x'});
  const rotor=new THREE.Group();rotor.position.set(-w*.47,-.02,0);rotor.rotation.y=Math.PI/2;g.add(rotor);g.userData.rotor=rotor;
  for(let i=0;i<4;i++){const fin=box(rotor,[h*.22,.03,.01],0xd5dadb,[0,0,0],{metalness:.6});fin.geometry.translate(h*.11,0,0);fin.rotation.z=i*Math.PI/2;}
  g.userData.indicator=box(g,[.06,.03,.06],0x66b78c,[-w*.2,h*.3,0],{metalness:0});
 },
 receiver(g,d,[w,depth,h]){
  box(g,[w,h,depth],0xb8372a,[0,0,0],{metalness:.2,roughness:.5});const [axis,across]=facing([w,depth]);
  const face=axis==='x'?[.012,h*.3,across*.7]:[across*.7,h*.3,.012];
  g.userData.indicator=box(g,face,0xdfe6e4,axis==='x'?[w/2+.004,h*.18,0]:[0,h*.18,-depth/2-.004],{metalness:0,roughness:.3});
 },
 callpoint(g,d,[w,depth,h]){
  box(g,[w,h,depth],RED,[0,0,0],{metalness:.1});const [axis]=facing([w,depth]);
  g.userData.indicator=drum(g,.035,.014,0xf4f1e8,axis==='x'?[w/2,0,0]:[0,0,-depth/2],{metalness:0,turn:axis==='x'?'z':'x'});
 },
 bell(g,d,[w,depth,h]){
  const [axis]=facing([w,depth]),out=axis==='x'?[w/2,0,0]:[0,0,-depth/2];
  drum(g,h/2,Math.min(w,depth),RED,[0,0,0],{metalness:.5,roughness:.35,turn:axis==='x'?'z':'x'});
  g.userData.indicator=box(g,axis==='x'?[.02,.06,.1]:[.1,.06,.02],0xf6f3ea,[out[0],-h/2-.05,out[2]],{metalness:0,roughness:.3});
 },
 // Hydrant cabinet: a red box with a framed door, the hose reel showing as a ring.
 hydrant(g,d,[w,depth,h]){
  box(g,[w,h,depth],0xb8372a,[0,0,0],{metalness:.2,roughness:.5});box(g,[w-.08,h-.08,.012],0xcf4a3b,[0,0,-depth/2-.004],{metalness:.2});
  const reel=new THREE.Mesh(new THREE.TorusGeometry(w*.24,.03,8,28),new THREE.MeshStandardMaterial({color:0xf0e9da,roughness:.7}));reel.position.set(0,-h*.12,-depth/2-.02);g.add(reel);
  g.userData.indicator=box(g,[.07,.07,.02],0xff6b57,[0,h/2-.12,-depth/2-.014],{metalness:0});
 },
 exit(g,d,[w,depth,h]){
  box(g,[w,h,depth],0xf2f1ec,[0,0,0],{metalness:.1});const [axis,across]=facing([w,depth]);
  const face=axis==='x'?[depth,h-.04,across-.04]:[across-.04,h-.04,w];
  g.userData.indicator=box(g,face.map((v,i)=>i===(axis==='x'?0:2)?Math.min(w,depth)+.012:v),0x2fa56b,[0,0,0],{metalness:0,roughness:.4});
 },
 emergency(g,d,[w,depth,h]){
  box(g,[w,h,depth],0xf2f1ec,[0,0,0],{metalness:.1});const flat=h<.1,long=w>depth?'x':'z';
  for(const s of [-1,1]){const lens=drum(g,.035,.02,0xfff6dd,flat?[long==='x'?s*w*.28:0,-h/2-.008,long==='z'?s*depth*.28:0]:[long==='x'?s*w*.28:0,-h*.1,long==='x'?-depth/2-.008:s*depth*.28],{metalness:0,turn:flat?null:'x'});g.userData.indicator??=lens;}
 },
 sprinkler(g,d){
  drum(g,.018,.05,STEEL,[0,.01,0],{metalness:.8,roughness:.3});g.userData.indicator=drum(g,.04,.006,STEEL,[0,-.03,0],{metalness:.8,roughness:.3});
 }
};
export function deviceMesh(d){
 const shape=shapes[d.kind];if(!shape)return plain(d);
 const g=new THREE.Group();shape(g,d,d.size??[.2,.2,.2]);
 g.position.copy(point(d.pos));g.traverse(o=>{o.userData.deviceId=d.id;});return g;
}

// Walking. Two zones lie one over the other: the ground level (gate, passage, deck and the first floor) and the way down (ramp ring and basement).
const pad=([x0,y0,x1,y1],m=.25)=>[x0-m,y0-m,x1+m,y1+m];
const furniture=yuminModel().elements.filter(e=>e.kind==='furniture').map(e=>{const xs=e.footprint.map(p=>p[0]),ys=e.footprint.map(p=>p[1]);return {low:e.base<-.5,rect:pad([Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)])};});
const C=14.4,R=17.4,slide=(a,b,t)=>a+(b-a)*Math.min(1,Math.max(0,t));
// Height of the ramp ring: the west side falls 2 m to the south, the south side 1.3 m to the east, the east side the last 1.3 m to the north.
export function ringAt(x,y){
 if(y>C)return x<-2.5?0:B1;
 if(x<-C)return y<-C?-2:slide(0,-2,(C-y)/(2*C));
 if(y<-C)return x>C?-3.3:slide(-2,-3.3,(x+C)/(2*C));
 if(x>C)return slide(-3.3,B1,(y+C)/(2*C));
 return B1;
}
const top={z:0,eye:1.6,indoor:(x,y)=>x<-2.5&&x>-14.2&&Math.abs(y)<14.2,
 rects:[[-3,-34.6,3,-18.95],[-1.3,-19,1.3,-17.3],[-2.1,-17.4,2.1,-14.3],[-1.45,-14.4,1.45,14.5],[-17.1,14.65,2.1,17.15],
  [-2.8,-1.1,-1.4,1.1],[-13.8,-2.25,-2.75,2.25],[-10.6,-3.1,-8.6,-2.2],[-13.8,-13.8,-3.05,-3.05],[-10.6,2.2,-8.6,3.1],[-13.8,3.05,-3.05,13.8]],
 blocks:[[-14,3.8,-10.95,9.5],...furniture.filter(f=>!f.low).map(f=>f.rect)]};
const down={eye:1.6,level:ringAt,indoor:(x,y)=>Math.abs(x)<14.2&&Math.abs(y)<14.2,
 ok:(x,y)=>Math.abs(x)>C||Math.abs(y)>C||Math.abs(x)<2.3||Math.abs(y)<2.3||Math.hypot(x,y)<5.8||Math.hypot(x,y)>6.55,
 rects:[[-17.15,-17.15,-14.65,17.15],[-17.15,-17.15,17.15,-14.65],[14.65,-17.15,17.15,17.15],[-2.25,14.65,17.15,17.15],[-17.15,14.65,-2.9,17.15],
  [-1.05,13.8,1.05,14.7],[-13.8,-2.25,13.8,2.25],[-2.25,-13.8,2.25,13.8],[-5.8,-5.8,5.8,5.8],
  [9.2,2.2,10.6,3.1],[3.05,3.05,13.8,13.8],[9.2,-3.1,10.6,-2.2],[3.05,-13.8,13.8,-3.05],[-10.6,2.2,-9.2,3.1],[-13.8,3.05,-8.6,13.8]],
 blocks:[[-14,3.8,-11,9.5],...furniture.filter(f=>f.low).map(f=>f.rect)]};
export const zones={gate:top,passage:top,deck:top,lamp:top,lounge:top,ramp:down,entry:down,room1:down,round:down};
export const levelAt=(id,x,y)=>{const z=zones[id];return z.level?z.level(x,y):z.z;};
export const indoorAt=(id,x,y)=>{const i=zones[id]?.indoor;return typeof i==='function'?i(x,y):!!i;};
const inside=(r,x,y)=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3];
export function walkableAt(id,x,y){const zone=zones[id];return !!zone&&zone.rects.some(r=>inside(r,x,y))&&!zone.blocks.some(r=>inside(r,x,y))&&(!zone.ok||zone.ok(x,y));}
