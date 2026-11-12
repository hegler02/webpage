// The flood plain of the Fox River: a mown meadow, the river to the south, and the trees the house was set among.
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {ripples,foliage,blades,bark,meadow,shade} from './farnsworth-textures.mjs';
import {L,W,TERR} from './src/farnsworth-model.mjs';

function random(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const HALF=600,WATER=-1.15,NEAR=38,MID=100,HOUSE=[12,2],UP=new THREE.Vector3(0,1,0),V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
export const northBank=x=>-27+2.2*Math.sin(x/31)+1.3*Math.sin(x/13+1);
const southBank=x=>-92+3*Math.sin(x/40+2),xs=Array.from({length:119},(_,i)=>-590+i*10);
const quiet=mesh=>{mesh.raycast=()=>{};mesh.userData.aoKeep=true;return mesh;};
const still=mesh=>{mesh.raycast=()=>{};return mesh;};

// A bank falls from the grass to below the water line.
function bank(top,toward){
 const pos=[],index=[];
 xs.forEach((x,i)=>{const y=top(x);pos.push(x,-.03,-y,x,WATER-.5,-(y+toward*4.5));if(i){const a=(i-1)*2;index.push(a,a+1,a+2,a+1,a+3,a+2);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(index);g.computeVertexNormals();return g;
}

// A strip between two lines on the ground whose colour fades across it from one alpha to the other.
export function fading(a,b,height,from,to=0){
 const pos=[],col=[],index=[];
 a.forEach(([x,y],i)=>{pos.push(x,height,-y,b[i][0],height,-b[i][1]);col.push(1,1,1,from,1,1,1,to);if(i){const k=(i-1)*2;index.push(k,k+1,k+2,k+1,k+3,k+2);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,4));g.setIndex(index);g.computeVertexNormals();
 const n=g.attributes.normal;let up=0;for(let i=0;i<n.count;i++)up+=n.getY(i);if(up<0)for(let i=0;i<index.length;i+=3)[index[i],index[i+1]]=[index[i+1],index[i]];g.setIndex(index);
 for(let i=0;i<n.count;i++)n.setXYZ(i,0,1,0);return g;
}

// A direction turned away from `d` by `tilt`, toward the compass angle `turn` around it.
function bend(d,tilt,turn){
 const u=V().crossVectors(d,Math.abs(d.y)<.95?UP:V(1,0,0)).normalize(),w=V().crossVectors(d,u);
 return d.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(u,Math.sin(tilt)*Math.cos(turn)).addScaledVector(w,Math.sin(tilt)*Math.sin(turn)).normalize();
}
// A tree grown limb by limb: the trunk forks, every limb forks again into thinner ones, and the leaves hang where the twigs end.
export function grow(H,spread,rand,depth){
 const limbs=[],tips=[];
 const limb=(from,dir,len,r,level)=>{
  // A limb is never straight: it sets off one way and turns a little halfway along.
  const mid=from.clone().addScaledVector(dir,len*.5),turned=level?bend(dir,.14+rand()*.16,rand()*6.2832):dir,to=mid.clone().addScaledVector(turned,len*.5);
  if(level)limbs.push([from,mid,r,r*.86,level],[mid,to,r*.86,r*.7,level]);else limbs.push([from,to,r,r*.7,level]);
  dir=turned;
  if(level>=2||level===depth)tips.push([to,level]);
  if(level===depth)return;
  const n=level?2+(rand()<.45):3+(rand()<.55),start=rand()*6.2832;
  for(let i=0;i<n;i++){
   const d=bend(dir,(level?.4:.66)*spread*(.7+rand()*.6),start+i*6.2832/n+rand()*.8);
   // Limbs keep reaching for the light instead of drooping.
   if(level){d.y+=.14;d.normalize();}
   limb(to,d,level?len*(.66+rand()*.14):H*.27*(.85+rand()*.3),r*.64,level+1);
  }
 };
 limb(V(),bend(UP,.02+rand()*.05,rand()*6.2832),H*(.2+rand()*.07),H*.019,0);
 return {limbs,tips};
}
// One limb as a tapered tube. The foot of the trunk flares into the ground.
export function tube([from,to,r0,r1,level]){
 const axis=to.clone().sub(from),len=axis.length(),sides=level?level>2?5:7:12,g=new THREE.CylinderGeometry(r1,r0,len,sides,level?1:5,true),p=g.attributes.position,uv=g.attributes.uv;
 if(!level)for(let i=0;i<p.count;i++){const t=p.getY(i)/len+.5,k=1+.7*Math.pow(1-t,5);p.setX(i,p.getX(i)*k);p.setZ(i,p.getZ(i)*k);}
 const round=Math.max(1,Math.round(6.2832*r0/.9));for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*round,uv.getY(i)*len/1.3);
 g.translate(0,len/2,0);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP,axis.normalize()));g.translate(from.x,from.y,from.z);return g;
}
// A soft dark mass inside the crown: what is seen between the leaves.
export function clump(c,r,squash,rand,tint,detail=2){
 const g=new THREE.IcosahedronGeometry(1,detail),p=g.attributes.position,n=g.attributes.normal,col=new Float32Array(p.count*3),a=rand()*6,b=rand()*6;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.22*Math.sin(x*3.1+a)*Math.sin(z*2.7+b)+.14*Math.sin(y*4.3+a);
  // The normals stay those of the ball, so the mass is shaded as one round thing with no facets.
  n.setXYZ(i,x,y,z);p.setXYZ(i,c.x+x*k*r,c.y+y*k*r*squash,c.z+z*k*r);const lit=.45+.55*Math.max(0,y);col[i*3]=tint[0]*lit;col[i*3+1]=tint[1]*lit;col[i*3+2]=tint[2]*lit;
 }
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.deleteAttribute('uv');return g;
}

// Cut-out cards gathered into one mesh. Both faces of a card are drawn with the normals it is given, so a whole crown shades as one soft volume instead of a pile of flat boards.
export function sheaf(){
 const pos=[],nor=[],uv=[],col=[],corners=[[-1,-1],[1,-1],[1,1],[-1,1]],faces=[[0,1,2,0,2,3],[0,2,1,0,3,2]];
 return {
  count:0,
  add(c,u,w,normal,tint){
   const q=corners.map(([a,b])=>V(c.x+u.x*a+w.x*b,c.y+u.y*a+w.y*b,c.z+u.z*a+w.z*b)),n=q.map(normal),t=q.map(tint);this.count++;
   for(const face of faces)for(const i of face){pos.push(q[i].x,q[i].y,q[i].z);nor.push(n[i].x,n[i].y,n[i].z);uv.push(corners[i][0]*.5+.5,corners[i][1]*.5+.5);col.push(...t[i]);}
  },
  geometry(){
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g;
  }
 };
}
export const anywhere=rand=>{const y=rand()*2-1,t=rand()*6.2832,r=Math.sqrt(1-y*y);return V(r*Math.cos(t),y,r*Math.sin(t));};
// Leaves hung round one point of a crown. They are lit as if they faced out of the crown and up, and are darker toward its heart and its underside.
export function leaves(out,at,size,n,crown,rand,tint){
 const normal=p=>p.clone().sub(crown.c).divide(crown.r).normalize().lerp(UP,.3).normalize();
 const shadeAt=p=>{const d=p.clone().sub(crown.c).divide(crown.r),k=Math.min(1,d.length()),lit=(.5+.5*k)*(.74+.26*Math.max(-1,Math.min(1,d.y*1.2)));return [tint[0]*lit,tint[1]*lit,tint[2]*lit];};
 for(let i=0;i<n;i++){
  const s=size*(.75+rand()*.5),c=at.clone().addScaledVector(anywhere(rand),s*.8),face=anywhere(rand);face.y=Math.abs(face.y)*.7+.25;face.normalize();
  const u=V().crossVectors(face,Math.abs(face.y)<.9?UP:V(1,0,0)).normalize(),w=V().crossVectors(face,u),turn=rand()*6.2832;
  out.add(c,u.clone().multiplyScalar(Math.cos(turn)*s).addScaledVector(w,Math.sin(turn)*s),w.clone().multiplyScalar(Math.cos(turn)*s).addScaledVector(u,-Math.sin(turn)*s),normal,shadeAt);
 }
}
export const greens=rand=>[.84+rand()*.3,.9+rand()*.2,.72+rand()*.38];

export function buildLand(renderer,tier='full'){
 const land=new THREE.Group(),site=new THREE.Group(),rand=random(71),full=tier==='full';land.name='land';site.name='site';
 const shape=new THREE.Shape([[-HALF,-HALF],[HALF,-HALF],[HALF,HALF],[-HALF,HALF]].map(p=>new THREE.Vector2(...p)));
 shape.holes.push(new THREE.Path([...xs.map(x=>new THREE.Vector2(x,northBank(x))),...[...xs].reverse().map(x=>new THREE.Vector2(x,southBank(x)))]));
 const turf=new THREE.ShapeGeometry(shape),uv=turf.attributes.uv;
 // The shared grass texture expects one UV unit to be 160 m.
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/160,uv.getY(i)/160);
 const ground=new THREE.Mesh(turf,new THREE.MeshStandardMaterial({color:0x7d8f58,roughness:1}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.03;ground.receiveShadow=true;ground.raycast=()=>{};
 const mud=new THREE.MeshStandardMaterial({color:0x5c6744,roughness:1,side:THREE.DoubleSide});
 for(const [top,toward] of [[northBank,-1],[southBank,1]]){const m=quiet(new THREE.Mesh(bank(top,toward),mud));m.receiveShadow=true;land.add(m);}
 const water=quiet(new THREE.Mesh(new THREE.PlaneGeometry(1180,80),new THREE.MeshStandardMaterial({color:0x2b3a32,roughness:.1,metalness:0,bumpMap:ripples(renderer,[1180,80]),bumpScale:.5,envMapIntensity:.6})));
 water.rotation.x=-Math.PI/2;water.position.set(0,WATER,59.5);water.receiveShadow=true;land.add(water);
 // What the trees of each bank lay on the water: a dark band that thins out toward midstream.
 const mirrored=new THREE.MeshStandardMaterial({color:0x17231a,vertexColors:true,transparent:true,depthWrite:false,roughness:.3,envMapIntensity:.2});
 for(const [top,toward,width,alpha] of [[northBank,-1,12,.6],[southBank,1,30,.85]])land.add(still(new THREE.Mesh(fading(xs.map(x=>[x,top(x)+toward*3]),xs.map(x=>[x,top(x)+toward*(3+width)]),WATER+.03,alpha),mirrored)));
 // Bare earth under the house and the terrace, where no grass gets the sun.
 const earth=new THREE.MeshStandardMaterial({color:0xa59c84,vertexColors:true,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
 for(const [x0,y0,x1,y1] of [[0,0,L,W],[TERR.x0,TERR.y0,TERR.x1,TERR.y1]]){
  const ring=(m,n=16)=>[...Array.from({length:n},(_,i)=>[x0-m+(x1-x0+2*m)*i/n,y0-m]),...Array.from({length:n},(_,i)=>[x1+m,y0-m+(y1-y0+2*m)*i/n]),...Array.from({length:n},(_,i)=>[x1+m-(x1-x0+2*m)*i/n,y1+m]),...Array.from({length:n+1},(_,i)=>[x0-m,y1+m-(y1-y0+2*m)*i/n])];
  for(const [a,b,from,to] of [[ring(-Math.min(x1-x0,y1-y0)/2),ring(-.6),1,1],[ring(-.6),ring(1.1),1,0]]){const m=still(new THREE.Mesh(fading(a,b,-.02,from,to),earth));m.receiveShadow=true;m.renderOrder=-.3;site.add(m);}
 }

 // Patches over the turf. The plane stops short of the river so that nothing hangs over the bank.
 const SIZE=300,south=-24,north=HOUSE[1]+SIZE/2,west=HOUSE[0]-SIZE/2,plane=new THREE.PlaneGeometry(SIZE,north-south),puv=plane.attributes.uv;
 for(let i=0;i<puv.count;i++)puv.setY(i,1-(1-puv.getY(i))*(north-south)/SIZE);
 const patches=still(new THREE.Mesh(plane,new THREE.MeshStandardMaterial({...meadow(renderer,{size:SIZE,lawn:[HOUSE[0]-west,north-HOUSE[1]+4,34,.62]}),transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})));
 patches.rotation.x=-Math.PI/2;patches.position.set(HOUSE[0],-.028,-(south+north)/2);patches.receiveShadow=true;patches.renderOrder=-.5;site.add(patches);

 // The great maple stood at the south edge of the terrace; others stand about the lawn, follow the bank and close the meadow on every side.
 const trees=[[11.8,-11.4,23,1.12],[-15,-21.5,18,1],[28,-21,19,1.05],[37,4.5,17,1],[-25,10.5,19,1.1],[-9,25,17,1],[31,24,18,1.05],[9,33,20,1],[21,38,17,.95],[-3,42,19,1.05],[46,21,17,1]];
 for(let x=-170;x<=190;x+=9+rand()*8)if(x<-12||x>10)trees.push([x,northBank(x)+2.5+rand()*4,13+rand()*7,.9+rand()*.25]);
 for(const side of [-1,1])for(let i=0;i<18;i++)trees.push([12+side*(46+rand()*52),-16+rand()*76,13+rand()*8,.9+rand()*.25]);
 // The woods behind: three loose rows on the north, east and west, and the far bank of the river.
 const row=(n,at)=>{for(let i=0;i<n;i++)trees.push([...at(i/(n-1)),14+rand()*10,1]);};
 const gap=full?1:1.5;
 for(let k=0;k<3;k++){
  row(Math.round(46/gap),t=>[-175+t*380+rand()*5,84+k*17+rand()*10]);
  row(Math.round(20/gap),t=>[122+k*15+rand()*9,-22+t*110+rand()*5]);
  row(Math.round(20/gap),t=>[-100-k*15-rand()*9,-22+t*110+rand()*5]);
 }
 for(let k=0;k<2;k++)row(Math.round(62/gap),t=>{const x=-240+t*480+rand()*4;return [x,southBank(x)-5-k*11-rand()*5];});

 const near={cards:sheaf(),limbs:[],lumps:[]},far={cards:sheaf(),limbs:[],lumps:[]},shadows=sheaf(),flat=()=>UP,black=()=>[1,1,1];
 trees.forEach(([x,y,H,spread])=>{
  const reach=Math.hypot(x-HOUSE[0],y-HOUSE[1]),close=reach<NEAR,set=close?near:far,tint=greens(rand),dark=tint.map((v,i)=>v*[.1,.16,.065][i]),o=V(x,0,-y);
  if(reach<MID){
   const {limbs,tips}=grow(H,spread,rand,close&&full?4:3),box=new THREE.Box3();
   for(const [p] of tips)box.expandByPoint(p);
   const crown={c:box.getCenter(V()).add(o),r:box.getSize(V()).multiplyScalar(.5).addScalar(H*.1)};crown.c.y-=crown.r.y*.25;
   for(const l of limbs){const g=tube(l);g.translate(o.x,0,o.z);set.limbs.push(g);}
   for(const [p,level] of tips){
    const at=p.clone().add(o);leaves(set.cards,at,H*(level===2?.105:.082)*(close?1:1.3),level===2||!close?5:4,crown,rand,tint);
    if(level===2&&!close)set.lumps.push(clump(at,H*(.042+rand()*.016),.72,rand,dark));
   }
  }else{
   // Beyond the lawn a tree is one mass with leaves pinned over it.
   const r=H*(.3+rand()*.08),c=V(o.x,H*.6,o.z),crown={c,r:V(r,H*.4,r)},trunk=new THREE.CylinderGeometry(H*.008,H*.013,H*.45,5,1,true);
   trunk.translate(o.x,H*.225,o.z);set.limbs.push(trunk);set.lumps.push(clump(c,r*.62,H*.3/(r*.62),rand,tint.map((v,i)=>v*[.1,.16,.065][i])));
   for(let i=0;i<(full?46:24);i++){const d=anywhere(rand);d.y=d.y*.75+.2;leaves(set.cards,V(c.x+d.x*r*.9,c.y+d.y*H*.36,c.z+d.z*r*.9),H*.155,1,crown,rand,tint);}
   // Undergrowth at the edge of the wood.
   if(rand()<.45){const s=2.4+rand()*2.4,b=V(o.x+(rand()-.5)*9,s*.5,o.z+3+rand()*5),bush={c:b,r:V(s,s*.7,s)};set.lumps.push(clump(b,s*.45,.62,rand,tint.map((v,i)=>v*[.09,.14,.06][i])));
    for(let i=0;i<(full?18:11);i++){const d=anywhere(rand);d.y=Math.abs(d.y)*.8+.1;leaves(set.cards,V(b.x+d.x*s*.8,b.y+d.y*s*.55,b.z+d.z*s*.8),s*.5,1,bush,rand,tint);}}
  }
  if(!close){const r=H*.4;shadows.add(V(o.x+r*.25,-.022,o.z-r*.15),V(r,0,0),V(0,0,-r),flat,black);}
 });
 const leafSheets=foliage(renderer),leafy=new THREE.MeshStandardMaterial({...leafSheets,alphaTest:.42,vertexColors:true,roughness:.86}),massy=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}),woody=new THREE.MeshStandardMaterial({...bark(renderer)});
 for(const [set,cast] of [[near,true],[far,false]]){
  const parts=[[set.cards.geometry(),leafy,true],...[[set.lumps,massy],[set.limbs,woody]].filter(([list])=>list.length).map(([list,material])=>[mergeGeometries(list),material,false])];
  for(const g of [...set.lumps,...set.limbs])g.dispose();
  // Far crowns keep more of each card: a hard cut thins them out as the texture shrinks with distance.
  if(!cast){parts[0][1]=leafy.clone();parts[0][1].alphaTest=.24;}
  for(const [geometry,material,cut] of parts){const mesh=still(new THREE.Mesh(geometry,material));mesh.castShadow=cast;mesh.receiveShadow=true;mesh.userData.aoSkip=cut;site.add(mesh);}
 }
 const shady=still(new THREE.Mesh(shadows.geometry(),new THREE.MeshBasicMaterial({color:0x1d2a16,alphaMap:shade(renderer),transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3})));
 shady.renderOrder=-.4;site.add(shady);

 // Long grass: along the river, round the feet of the trees and in drifts across the meadow. The mown lawn round the house stays clear.
 const tufts=sheaf(),mown=(x,y)=>x>TERR.x0-5&&x<L+5&&y>TERR.y0-6&&y<W+5,wild=()=>[.3+rand()*.2,.38+rand()*.2,.2+rand()*.16];
 const tuft=(x,y,h)=>{
  if(mown(x,y)||y<northBank(x)+.2)return;const t=rand()*3.14,w=h*(.5+rand()*.3),c=wild(),tint=()=>c;
  for(const a of [t,t+1.57])tufts.add(V(x,h/2-.04,-y),V(Math.cos(a)*w,0,Math.sin(a)*w),V(0,h/2,0),flat,tint);
 };
 for(let x=-150;x<=175;x+=.55+rand()*.7)if(Math.sin(x/4.3)+Math.sin(x/1.7+2)>-.9)tuft(x,northBank(x)+.3+rand()*rand()*4.5,.5+rand()*.75);
 trees.forEach(([x,y,H])=>{if(Math.hypot(x-HOUSE[0],y-HOUSE[1])<MID)for(let i=0;i<7;i++){const a=rand()*6.2832,r=H*(.035+rand()*.07);tuft(x+Math.cos(a)*r,y+Math.sin(a)*r,.3+rand()*.4);}});
 for(let k=0;k<(full?46:24);k++){
  const a=rand()*6.2832,r=24+rand()*82,cx=HOUSE[0]+Math.cos(a)*r,cy=HOUSE[1]+Math.sin(a)*r*.8+14,spread=2.5+rand()*5;
  for(let i=0;i<26;i++){const b=rand()*6.2832,q=spread*Math.sqrt(rand());tuft(cx+Math.cos(b)*q*1.6,cy+Math.sin(b)*q,.3+rand()*.5);}
 }
 const grass=still(new THREE.Mesh(tufts.geometry(),new THREE.MeshStandardMaterial({...blades(renderer),alphaTest:.4,vertexColors:true,roughness:1})));
 grass.receiveShadow=true;grass.userData.aoSkip=true;site.add(grass);
 return {land,ground,site};
}
