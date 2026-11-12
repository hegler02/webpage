// Bear Run for the Fallingwater sample: a gorge heightfield, rock ledges, two falls with their pools, and the forest.
// Model axes: x east, y north, z up from the stream above the falls. Everything here is a reconstruction, not a survey.
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {grow,tube,clump,sheaf,leaves,anywhere,greens} from './farnsworth-land.mjs';
import {random,ripples,foliage,bark,blades} from './farnsworth-textures.mjs';
import {ledge,litter,cascade,foam,haze} from './fallingwater-textures.mjs';

const UP=new THREE.Vector3(0,1,0),V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),HOUSE=[5,1],NEAR=30,MID=52,FAR=270;
const quiet=mesh=>{mesh.raycast=()=>{};mesh.userData.aoKeep=true;return mesh;},still=mesh=>{mesh.raycast=()=>{};return mesh;};
const step=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t;

// The stream's centre line with half widths: in from the east, under the house, then off to the south-west.
const CHANNEL=[[340,80,4],[220,60,3.5],[160,30,3.5],[110,35,3.5],[70,10,3.5],[40,2,3.5],[22,-3.3,3.6],[10,-3.4,3.4],[2.8,-3.4,5.5],[-1.4,-10.2,7],[-5.6,-17,5.5],[-12,-28,6],[-24,-46,5.5],[-45,-75,5],[-80,-120,4],[-70,-180,4],[-120,-260,4],[-150,-345,4]];
// Both falls drop over parallel ledges. CREST starts the first lip, U runs along it and N points downstream.
export const CREST=[-3,.2],U=[.85,-.527],N=[-.527,-.85],LIP=13.65,SECOND=16,LEVELS=[0,-6.1,-8.5];
const along=(x,y)=>(x-CREST[0])*U[0]+(y-CREST[1])*U[1],down=(x,y)=>(x-CREST[0])*N[0]+(y-CREST[1])*N[1],lip=(s,b)=>[CREST[0]+U[0]*s+N[0]*b,CREST[1]+U[1]*s+N[1]*b];
export const waterAt=(x,y)=>{const d=down(x,y);return d<0?LEVELS[0]:d<SECOND?LEVELS[1]:LEVELS[2];};

// Signed distance to the water's edge (negative in the stream) and the bank: 1 on the house side, -1 across the water.
export function stream(x,y){
 let best=Infinity,side=1;
 for(let i=0;i<CHANNEL.length-1;i++){
  const [ax,ay,aw]=CHANNEL[i],[bx,by,bw]=CHANNEL[i+1],dx=bx-ax,dy=by-ay,t=Math.min(1,Math.max(0,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy))),px=x-ax-dx*t,py=y-ay-dy*t,q=Math.hypot(px,py)-(aw+(bw-aw)*t);
  if(q<best){best=q;side=dx*py-dy*px<0?1:-1;}
 }
 // Away from the house the banks wander, as a stream cuts them; by the bolsters, the falls and the bridge they stay as measured.
 const far=Math.max(step(24,38,x),1-step(-52,-36,y));
 return [far?best+far*(noise(x/15+3,y/15)*1.7+noise(x/4.6,y/4.6+7)*.7):best,side];
}
const hash=(i,j)=>{let h=Math.imul(i,374761393)+Math.imul(j,668265263)|0;h=Math.imul(h^h>>>13,1274126177);return ((h^h>>>16)>>>0)/4294967296;};
const noise=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,a=u*u*(3-2*u),b=v*v*(3-2*v);return mix(mix(hash(i,j),hash(i+1,j),a),mix(hash(i,j+1),hash(i+1,j+1),a),b)*2-1;};
const rough=(x,y)=>noise(x/19,y/19)*.6+noise(x/7.3+9,y/7.3)*.28+noise(x/2.3,y/2.3+5)*.12;

// Where the rock shelf under the house climbs from the water to the drive: [x, start y, end y].
const RAMP=[[-12,-.2,2.5],[-1,0,2.6],[0,5.6,7.3],[11.6,5.6,7.3],[12.4,.8,2.8],[16.5,.6,2.6],[18.5,-.3,.85],[40,-.3,.9]];
function rampAt(x){
 if(x<=RAMP[0][0])return RAMP[0];
 for(let i=1;i<RAMP.length;i++)if(x<=RAMP[i][0]){const a=RAMP[i-1],b=RAMP[i],t=(x-a[0])/(b[0]-a[0]);return [x,mix(a[1],b[1],t),mix(a[2],b[2],t)];}
 return RAMP.at(-1);
}
const DRIVE=2.55;
// How much of a spot is made ground: the shelf with the drive behind the house, and the road over the bridge.
const shelf=(x,y)=>{const south=-4+8.5*(1-step(-16,-5,x));return step(-46,-36,x)*(1-step(24,30,x))*step(south,south+2.5,y)*(1-step(12.6,14.6,y));};
const road=(x,y)=>step(16.2,18.4,x)*(1-step(22.4,24.6,x))*step(-70,-45,y)*(1-step(-7.4,-6.4,y));
// The rock terrace across the water where visitors stand for the well-known view: [x, y, level, radius].
export const VIEW=[-1.5,-27.5,-5.4,2.6];
function hillAt(x,y,q,side){
 const d=down(x,y),e=Math.max(0,q),low=mix(mix(1,LEVELS[1]+1.5,step(-.6,3.4,d)),LEVELS[2]+1.3,step(SECOND-1,SECOND+3.5,d)),top=mix(low,1,step(12,48,e));
 let h=top+2.2*step(0,5,e)+55*(1-Math.exp(-Math.max(0,e-4)/110)),calm=0;
 if(side>0){const [,y0,y1]=rampAt(x),w=shelf(x,y);h=mix(h,.25+(DRIVE-.25)*step(y0,y1,y),w);calm=w;}
 const r=road(x,y);if(r>0){h=mix(h,DRIVE+.05*Math.max(0,-7.6-y),r);calm=Math.max(calm,r);}
 const v=1-step(VIEW[3],VIEW[3]+2.4,Math.hypot(x-VIEW[0],y-VIEW[1]));if(v>0){h=mix(h,VIEW[2],v);calm=Math.max(calm,v);}
 return h+rough(x,y)*(.25+Math.min(2.2,e*.06))*(1-.93*calm);
}
export function groundAt(x,y){
 const [q,side]=stream(x,y),d=down(x,y),bed=mix(mix(-.45,-6.9,step(-.1,.7,d)),-9.3,step(SECOND-.1,SECOND+.7,d))+noise(x/1.7,y/1.7)*.1;
 const wide=mix(1,2,step(2,12,d));return mix(bed,hillAt(x,y,q,side),step(-.6*wide,1.2*wide,q));
}

// Grid lines: fine around the house, widening toward the rim.
function lines(centre,fine,inner,outer){
 const out=[0];let s=fine,v=0;
 while(v<outer){v+=s;out.push(v);if(v>inner)s*=1.18;}
 return [...out.slice(1).reverse().map(v=>centre-v),...out.map(v=>centre+v)];
}
async function terrain(fine,pause){
 const xs=lines(3,fine,45,320),ys=lines(-8,fine,45,320),nx=xs.length,ny=ys.length,pos=new Float32Array(nx*ny*3),uv=new Float32Array(nx*ny*2),col=new Float32Array(nx*ny*3),index=[];
 for(let j=0;j<ny;j++){await pause();for(let i=0;i<nx;i++){const k=j*nx+i,x=xs[i],y=ys[j];pos.set([x,groundAt(x,y),-y],k*3);uv.set([x,y],k*2);}}
 for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;index.push(a,b,d,a,d,c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();
 const nor=g.attributes.normal;
 for(let j=0;j<ny;j++){await pause();for(let i=0;i<nx;i++){
  const k=j*nx+i,x=xs[i],y=ys[j],h=pos[k*3+1],[q]=stream(x,y),steep=1-step(.72,.92,nor.getY(k)),rocky=Math.max(steep,1-step(.4,3.2,q)),made=Math.max(shelf(x,y)*step(7,7.6,y)*(1-step(12.2,12.8,y)),road(x,y),step(16.4,18.2,x)*(1-step(22.6,24.4,x))*step(.2,1,y)*(1-step(12.2,12.8,y)));
  const wet=1-step(-.05,.35,h-waterAt(x,y)),t=1+noise(x/3.1,y/3.1)*.12;
  let c=[mix(1,1.12,rocky)*t,mix(1,1.1,rocky)*t,mix(1,1.45,rocky)*t];
  c=c.map((v,m)=>mix(v,[1.62,1.52,1.62][m],made));c=c.map((v,m)=>mix(v,[.42,.46,.5][m],wet));col.set(c,k*3);
 }}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));return g;
}

// Loose geometry for every rock: flat faces, UVs in metres so the bedding in the texture stays level.
const heap=()=>({p:[],n:[],u:[],c:[]});
const tri=(out,a,b,c,n,ua,ub,uc,ca,cb=ca,cc=ca)=>{out.p.push(...a,...b,...c);out.n.push(...n,...n,...n);out.u.push(...ua,...ub,...uc);out.c.push(...ca,...cb,...cc);};
// One bed of rock: a level top worn round at the edge, and a face that leans back under it so the bed above casts a shadow line.
// pts run counter-clockwise in plan.
function plate(out,pts,top,bottom,rand,mossy){
 const n=pts.length,cx=pts.reduce((s,p)=>s+p[0],0)/n,cy=pts.reduce((s,p)=>s+p[1],0)/n,wet=top<waterAt(cx,cy)+.3,k=(wet?.58:1)*(.84+rand()*.26),moss=wet?0:mossy?.3+rand()*.7:rand()*rand()*.5;
 const size=Math.max(...pts.map(p=>Math.hypot(p[0]-cx,p[1]-cy))),worn=Math.min(.17,(top-bottom)*.4),f1=Math.min(.45,worn/size),f2=Math.min(.45,(.03+rand()*.15)/size),o=rand()*9;
 const lid=[mix(1,.6,moss)*k,mix(1,.8,moss)*k,mix(1,.46,moss)*k],rim=[mix(1,.8,moss)*k,mix(1,.9,moss)*k,mix(1,.74,moss)*k],edge=[k,k,k*1.02],foot=[k*.6,k*.6,k*.64];
 const P=(p,z,f=0)=>[p[0]+(cx-p[0])*f,z,-(p[1]+(cy-p[1])*f)],uvTop=p=>[p[0]*.8+p[1]*.3+o,o+(p[1]*.8-p[0]*.3)*.1];
 let run=o;
 for(let i=0;i<n;i++){
  const a=pts[i],b=pts[(i+1)%n],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<1e-3)continue;
  const nx=(b[1]-a[1])/len,ny=-(b[0]-a[0])/len,z1=top-worn,u0=run,u1=run+len;
  tri(out,P([cx,cy],top),P(a,top,f1),P(b,top,f1),[0,1,0],uvTop([cx,cy]),uvTop(a),uvTop(b),lid);
  tri(out,P(a,top,f1),P(b,z1),P(b,top,f1),[nx*.7,.714,-ny*.7],[u0,top+.1],[u1,z1],[u1,top+.1],rim,edge,rim);
  tri(out,P(a,top,f1),P(a,z1),P(b,z1),[nx*.7,.714,-ny*.7],[u0,top+.1],[u0,z1],[u1,z1],rim,edge,edge);
  tri(out,P(a,z1),P(b,bottom,f2),P(b,z1),[nx,0,-ny],[u0,z1],[u1,bottom],[u1,z1],edge,foot,edge);
  tri(out,P(a,z1),P(a,bottom,f2),P(b,bottom,f2),[nx,0,-ny],[u0,z1],[u0,bottom],[u1,bottom],edge,foot,foot);
  run+=len;
 }
}
// A broken outline for one bed: lobed like a worn boulder, with one or two straight sides where a joint split it.
function outline(long,short,rand){
 const n=13+Math.floor(rand()*5),ring=[],p1=rand()*6.2832,p2=rand()*6.2832,cut=.5+rand()*.6,back=.55+rand()*.6;
 for(let i=0;i<n;i++){const a=(i+rand()*.4)/n*6.2832,r=.88+.15*Math.sin(a*2+p1)+.09*Math.sin(a*3+p2)+rand()*.1;ring.push([Math.min(cut,Math.cos(a)*r)*long,Math.max(-back,Math.sin(a)*r)*short]);}
 return ring;
}
// A stack of beds stepping down a slope, each a little different from the one above.
function stack(out,cx,cy,long,short,turn,top,rand,deep=16){
 const ring=outline(long,short,rand),co=Math.cos(turn),si=Math.sin(turn);
 const place=(ox,oy,scale,wear=0)=>{const p1=rand()*6.2832,p2=rand()*6.2832,n=ring.length;return ring.map(([a,b],i)=>{const t=i/n*6.2832,f=scale*(1+wear*(.6*Math.sin(t*2+p1)+.4*Math.sin(t*5+p2)));return [cx+ox+(a*co-b*si)*f,cy+oy+(a*si+b*co)*f];});};
 const bottom=Math.min(...place(0,0,1).map(p=>groundAt(p[0],p[1])))-.3;
 let z=top,k=0,ox=0,oy=0,scale=1;
 while(z>bottom&&k<deep){
  const thick=Math.min(z-bottom+.05,rand()<.3?.12+rand()*.2:.4+rand()*1.1);plate(out,place(ox,oy,scale,.13),z,z-thick,rand,k===0);
  z-=thick;k++;scale=Math.min(1.35,Math.max(.72,scale*(.86+rand()*.32)));ox+=(rand()-.5)*long*.34;oy+=(rand()-.5)*short*.34;
 }
}
// A water-worn boulder: a dented ball with flat facets.
function boulder(out,c,r,squash,rand){
 const g=new THREE.IcosahedronGeometry(1,2),p=g.attributes.position,ph=[rand()*6,rand()*6,rand()*6],turn=rand()*6.2832,co=Math.cos(turn),si=Math.sin(turn),wide=.8+rand()*.45,wet=c.y-r*squash*.3<waterAt(c.x,-c.z)+.25,k=(wet?.62:1)*(.84+rand()*.24),moss=wet?0:rand()*rand(),v=[];
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),f=1+.2*Math.sin(x*3.1+ph[0])*Math.sin(y*2.7+ph[1])+.14*Math.sin(z*4.3+ph[2])+.06*Math.sin((x+y+z)*7+ph[0]),a=x*f*r,b=z*f*r*wide;
  v.push([c.x+a*co-b*si,c.y+y*f*r*squash,c.z+a*si+b*co]);
 }
 g.dispose();
 for(let i=0;i<v.length;i+=3){
  const [a,b,d]=[v[i],v[i+1],v[i+2]],n=V(b[0]-a[0],b[1]-a[1],b[2]-a[2]).cross(V(d[0]-a[0],d[1]-a[1],d[2]-a[2])).normalize(),up=Math.max(0,n.y)*moss,col=[mix(1,.7,up)*k,mix(1,.84,up)*k,mix(1,.52,up)*k],uv=q=>[(q[0]+q[2])*.6,q[1]];
  tri(out,a,b,d,[n.x,n.y,n.z],uv(a),uv(b),uv(d),col);
 }
}
// The rock face behind a fall: stepped beds across the whole lip, kept behind the falling water.
function face(out,b0,level,height,rand){
 for(let z=level-.07;z>level-height-.9;){
  const thick=.45+rand()*.5;
  for(let s=-2;s<LIP+2;){const len=1.6+rand()*2.6,reach=(level-z)*.07+rand()*.32;plate(out,[lip(s,b0-1.8),lip(s,b0+reach),lip(s+len,b0+reach),lip(s+len,b0-1.8)],z,z-thick,rand,false);s+=len;}
  z-=thick;
 }
}
const solid=out=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(out.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(out.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(out.u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(out.c,3));return g;};

// A sheet of falling water between s0 and s1 on a lip: it gathers green over the edge, turns white as it drops along a thrown curve,
// and thins to nothing at both sides.
function curtain(b0,s0,s1,level,drop,throwOut,rand,shift=0,wide=3.2){
 const cols=Math.max(4,Math.round((s1-s0)/.3)),rows=[[-.9,0],[-.25,0]],pos=[],uv=[],col=[],index=[];
 for(let j=0;j<=12;j++){const t=j/12;rows.push([throwOut*t+shift*t,-drop*t*t]);}
 const R=rows.length;
 for(let i=0;i<=cols;i++){
  const s=mix(s0,s1,i/cols),wob=noise(s*1.9+level,drop)*.09,side=i===0||i===cols?0:i===1||i===cols-1?.7:1;let len=0;
  rows.forEach(([b,z],j)=>{
   if(j)len+=Math.hypot(b-rows[j-1][0],z-rows[j-1][1]);
   const [x,y]=lip(s,b0+b+(j>1?wob*(1+j*.12):0)),green=j<2?1:j===2?.5:0;
   pos.push(x,level+.02+z+(j===R-1?-.05:0),-y);uv.push(s/wide,len/5.5);
   col.push(mix(1,.72,green),mix(1,.86,green),mix(1,.8,green),side*(j===0?0:j===1?.5:j===2?.82:j===R-1?.7:1));
  });
 }
 for(let i=0;i<cols;i++)for(let j=0;j<R-1;j++){const a=i*R+j,b=a+R;index.push(a,a+1,b+1,a,b+1,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(col,4));g.setIndex(index);g.computeVertexNormals();return g;
}
// Spray standing at the foot of a fall: an upright sheet across the lip direction.
function cloud(s0,s1,b,z,height){
 const g=new THREE.BufferGeometry(),[a,c]=[lip(s0,b),lip(s1,b)];
 g.setAttribute('position',new THREE.Float32BufferAttribute([a[0],z,-a[1],c[0],z,-c[1],c[0],z+height,-c[1],a[0],z+height,-a[1]],3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return g;
}
// A level patch at a water level, laid out in lip coordinates: s along the lip, b downstream of it.
function patch(s0,s1,b0,b1,z){
 const g=new THREE.BufferGeometry(),c=[[s0,b0],[s0,b1],[s1,b1],[s1,b0]].map(([s,b])=>lip(s,b));
 g.setAttribute('position',new THREE.Float32BufferAttribute(c.flatMap(([x,y])=>[x,z,-y]),3));g.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0],3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,0,1,1,1,1,0],2));g.setIndex([0,1,2,0,2,3]);return g;
}
const reach=(x,y)=>Math.hypot(x-HOUSE[0],y-HOUSE[1]);
// Distance to the line from the classic viewpoint below the falls up to the house, which is kept clear of trunks.
const sight=(x,y)=>{const a=VIEW,b=[4,-4],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.min(1,Math.max(0,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t);};
const built=(x,y)=>(x>-9&&x<19.5&&y>-8.5&&y<14.2)||(y>6.6&&y<13.4&&x>-42&&x<25)||(x>15.6&&x<25&&y>-52&&y<16);

// pause is asked between pieces of work and hands the thread back to the page when a slice has run long enough.
export async function buildLand(renderer,tier='full',pause=()=>{}){
 const land=new THREE.Group(),site=new THREE.Group(),rand=random(137),full=tier==='full';land.name='land';site.name='site';
 // Far below the valley, so the shared ground fade never shows through the forest floor.
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(4000,4000),new THREE.MeshStandardMaterial({color:0x4d5a36,roughness:1}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-40;ground.raycast=()=>{};
 const floor=still(new THREE.Mesh(await terrain(full?.6:1,pause),new THREE.MeshStandardMaterial({...litter(renderer),vertexColors:true})));
 floor.receiveShadow=true;floor.castShadow=true;floor.name='forest floor';land.add(floor);

 // Water: three level sheets, one for each reach. The valley sides hide them everywhere but in the stream.
 await pause();
 const rip=ripples(renderer,[60,60]),flowing=[];
 for(const [b0,b1,z,tint] of [[-460,0,LEVELS[0],0x2f3d33],[0,SECOND,LEVELS[1],0x2a3b33],[SECOND,470,LEVELS[2],0x2b3a32]]){
  const bump=rip.clone();bump.repeat.set(560/7,(b1-b0)/7);flowing.push([bump,0,.012]);
  const sheet=quiet(new THREE.Mesh(patch(-280,280,b0,b1,z),new THREE.MeshStandardMaterial({color:tint,roughness:.09,metalness:0,bumpMap:bump,bumpScale:.45,envMapIntensity:.5})));
  sheet.receiveShadow=true;land.add(sheet);
 }

 // Rock: ledges wherever the ground is steep or meets the water, the two fall faces, and boulders in the stream.
 await pause();
 const rock=heap();
 face(rock,0,LEVELS[0],-LEVELS[1],rand);face(rock,SECOND,LEVELS[1],LEVELS[1]-LEVELS[2],rand);
 // Where the lip stands dry between the sheets of water: a low hump of one or two beds, not a pillar.
 const gaps=[[0,[[-.8,1],[5.6,6.1],[9.8,10.2],[12.8,14.2]]],[SECOND,[[.4,2],[6.4,7],[11.6,13]]]],turnU=Math.atan2(U[1],U[0]);
 gaps.forEach(([b0,list],f)=>list.forEach(([s0,s1])=>{const [x,y]=lip((s0+s1)/2,b0-.35);stack(rock,x,y,(s1-s0)*.55+.3,.8+rand()*.3,turnU,LEVELS[f]+.14+rand()*.22,rand,2);}));
 for(let gx=-48;gx<58;gx+=2.2){await pause();for(let gy=-58;gy<42;gy+=2.2){
  const x=gx+rand()*2.2,y=gy+rand()*2.2,[q]=stream(x,y),d=down(x,y),s=along(x,y);
  if((x>-4.4&&x<15.2&&y>.8&&y<7.9)||(y>7.1&&y<12.75&&x>-42&&x<24.6)||road(x,y)>.2||(x>17.6&&x<23.2&&y>.4&&y<13))continue;
  if(q<.9&&s>-2.5&&s<LIP+2.5&&((d>-1.4&&d<2.4)||(d>SECOND-1.4&&d<SECOND+2.4)))continue;
  const h=groundAt(x,y),sx=(groundAt(x+.8,y)-groundAt(x-.8,y))/1.6,sy=(groundAt(x,y+.8)-groundAt(x,y-.8))/1.6,slope=Math.hypot(sx,sy);
  if(q<-1.2&&slope<.6)continue;
  if(!(slope>.6?rand()<.88:q>-.4&&q<2.8?rand()<.36:rand()<.03))continue;
  const long=1.4+rand()*1.5;stack(rock,x,y,long,long*(.5+rand()*.3),slope>.15?Math.atan2(sy,sx)+1.5708:rand()*3.14,h+.12+rand()*.4,rand);
 }}
 await pause();
 const drop=(x,y,r,squash=.6+rand()*.25,sink=.45)=>boulder(rock,V(x,groundAt(x,y)+r*squash*(1-sink*2)+r*squash*sink,-y),r,squash,rand);
 for(let i=0;i<(full?70:40);i++){const t=rand(),k=6+Math.floor(rand()*2),a=CHANNEL[k],b=CHANNEL[k+1]??a,x=mix(a[0],b[0],t)+(rand()-.5)*6.4,y=mix(a[1],b[1],t)+(rand()-.5)*6.4;if(stream(x,y)[0]<-.2&&down(x,y)<-1.5)drop(x,y,.25+rand()*rand()*1.1);}
 await pause();
 for(let i=0;i<(full?90:50);i++){const t=rand(),k=8+Math.floor(rand()*4),a=CHANNEL[k],b=CHANNEL[k+1],x=mix(a[0],b[0],t)+(rand()-.5)*13,y=mix(a[1],b[1],t)+(rand()-.5)*13,d=down(x,y),q=stream(x,y)[0];if(q<.3&&q>-6.5&&(d>2.6&&d<SECOND-1.6||d>SECOND+2.2)&&(q>-2.2||rand()<.3))drop(x,y,.4+rand()*rand()*1.7);}
 await pause();
 const stone=still(new THREE.Mesh(solid(rock),new THREE.MeshStandardMaterial({...ledge(renderer),vertexColors:true})));
 stone.castShadow=stone.receiveShadow=true;stone.name='rock ledges';land.add(stone);

 // The falls: two layers of sliding white water on each lip, with foam where they land.
 await pause();
 const white=cascade(renderer),froth=foam(renderer),falls=new THREE.Group();falls.name='falls';
 const pour=(speed,opacity)=>{
  const map=white.map.clone(),alphaMap=white.alphaMap.clone();flowing.push([map,speed,0],[alphaMap,speed,0]);
  return new THREE.MeshStandardMaterial({color:0xffffff,map,alphaMap,vertexColors:true,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide,roughness:.55,emissive:0xcfdcdf,emissiveIntensity:.3});
 };
 const mist=new THREE.MeshStandardMaterial({color:0xffffff,alphaMap:haze(renderer),transparent:true,opacity:.26,depthWrite:false,side:THREE.DoubleSide,roughness:1,emissive:0xcfdcdf,emissiveIntensity:.2});
 const veil=[pour(.55,1),pour(.8,.75)],spray=new THREE.MeshStandardMaterial({color:0xffffff,alphaMap:froth,transparent:true,opacity:.8,depthWrite:false,roughness:.7,emissive:0xcfdcdf,emissiveIntensity:.25});
 for(const [b0,f,throwOut,list] of [[0,0,1.25,[[1,5.6],[6.1,9.8],[10.2,12.8]]],[SECOND,1,.8,[[2,6.4],[7,11.6]]]]){
  const drop=LEVELS[f]-LEVELS[f+1];
  for(const [s0,s1] of list){
   veil.forEach((m,i)=>{const sheet=quiet(new THREE.Mesh(curtain(b0,s0+i*.25,s1-i*.3,LEVELS[f],drop,throwOut,rand,i*.22,i?2.3:3.2),m));sheet.renderOrder=2+i;falls.add(sheet);});
   const pool=quiet(new THREE.Mesh(patch(s0-1,s1+1,b0+throwOut-1.3,b0+throwOut+2.6,LEVELS[f+1]+.04),spray));pool.renderOrder=1;falls.add(pool);
   [.3,1.1].forEach((off,i)=>{const fog=quiet(new THREE.Mesh(cloud(s0-.7,s1+.7,b0+throwOut+off,LEVELS[f+1]-.15,Math.min(2.4,drop*.42)*(1-i*.25)),mist));fog.renderOrder=4+i;falls.add(fog);});
  }
 }
 land.add(falls);
 await pause();

 // Forest: full trees near the house, lighter ones on the valley sides, laurel on the banks and ferns on the floor.
 const open=(x,y)=>Math.hypot(x-VIEW[0],y-VIEW[1]),spots=[],plant=(x,y,gap,H,spread)=>{if(stream(x,y)[0]<1.8||built(x,y)||sight(x,y)<5||open(x,y)<8)return;for(const s of spots)if(Math.hypot(s[0]-x,s[1]-y)<gap)return;spots.push([x,y,H,spread]);};
 for(let i=0;i<900;i++){const a=rand()*6.2832,r=Math.sqrt(mix(64,MID*MID,rand()));plant(HOUSE[0]+Math.cos(a)*r,HOUSE[1]+Math.sin(a)*r,r<NEAR?6.6:7.6,16+rand()*10,.72+rand()*.3);}
 const grown=spots.length;
 await pause();
 for(let i=0;i<5000&&spots.length-grown<(full?520:280);i++){const a=rand()*6.2832,r=Math.sqrt(mix(MID*MID,FAR*FAR,rand()));plant(HOUSE[0]+Math.cos(a)*r,HOUSE[1]+Math.sin(a)*r,10+r*.03,18+rand()*11,1);}
 const near={cards:sheaf(),limbs:[],lumps:[]},far={cards:sheaf(),limbs:[],lumps:[]},flat=()=>UP,dim=[.1,.16,.065];
 for(const [x,y,H,spread] of spots){
  await pause();
  const away=reach(x,y),close=away<NEAR,set=close?near:far,tint=greens(rand).map((v,i)=>v*[.92,.96,.9][i]),dark=tint.map((v,i)=>v*dim[i]),o=V(x,groundAt(x,y)-.25,-y);
  if(away<MID){
   const {limbs,tips}=grow(H,spread,rand,close&&full&&away<20?4:3),box=new THREE.Box3();
   for(const [p] of tips)box.expandByPoint(p);
   const crown={c:box.getCenter(V()).add(o),r:box.getSize(V()).multiplyScalar(.5).addScalar(H*.1)};crown.c.y-=crown.r.y*.25;
   for(const l of limbs){const g=tube(l);g.translate(o.x,o.y,o.z);set.limbs.push(g);}
   for(const [p,level] of tips){
    const at=p.clone().add(o);leaves(set.cards,at,H*(level===2?.105:.082)*(close?1:1.3),level===2||!close?5:4,crown,rand,tint);
    if(level===2&&!close)set.lumps.push(clump(at,H*(.042+rand()*.016),.72,rand,dark));
   }
  }else{
   const r=H*(.3+rand()*.08),c=V(o.x,o.y+H*.6,o.z),crown={c,r:V(r,H*.4,r)},trunk=new THREE.CylinderGeometry(H*.008,H*.013,H*.45,5,1,true);
   trunk.translate(o.x,o.y+H*.225,o.z);set.limbs.push(trunk);set.lumps.push(clump(c,r*.62,H*.3/(r*.62),rand,dark));
   for(let i=0;i<(full?(away<150?34:18):14);i++){const d=anywhere(rand);d.y=d.y*.75+.2;leaves(set.cards,V(c.x+d.x*r*.9,c.y+d.y*H*.36,c.z+d.z*r*.9),H*.155,1,crown,rand,tint);}
  }
 }
 // Mountain laurel and rhododendron: low dark mounds along the banks and under the trees.
 for(let i=0,n=0;i<1400&&n<(full?130:70);i++){
  await pause();
  const a=rand()*6.2832,r=8+rand()*38,x=HOUSE[0]+Math.cos(a)*r,y=HOUSE[1]+Math.sin(a)*r-4,[q]=stream(x,y);
  if(q<1.2||built(x,y)||sight(x,y)<4.5||open(x,y)<7||(q>9&&rand()<.6))continue;n++;
  const size=.7+rand()*.9,c=V(x,groundAt(x,y)+size*.5,-y),tint=[.62+rand()*.2,.78+rand()*.16,.5+rand()*.2],crown={c,r:V(size*1.3,size,size*1.3)};
  far.lumps.push(clump(c,size*.85,.7,rand,tint.map((v,k)=>v*dim[k])));
  for(let k=0;k<16;k++){const d=anywhere(rand);d.y=Math.abs(d.y)*.8+.1;leaves(far.cards,V(c.x+d.x*size*1.05,c.y+d.y*size*.8,c.z+d.z*size*1.05),size*.62,1,crown,rand,tint);}
 }
 await pause();
 const leafSheets=foliage(renderer),leafy=new THREE.MeshStandardMaterial({...leafSheets,alphaTest:.42,vertexColors:true,roughness:.86}),massy=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}),woody=new THREE.MeshStandardMaterial({...bark(renderer)});
 for(const [set,cast] of [[near,true],[far,false]]){
  await pause();const parts=[[set.cards.geometry(),leafy,true]];
  for(const [list,material] of [[set.lumps,massy],[set.limbs,woody]])if(list.length){await pause();parts.push([mergeGeometries(list),material,false]);}
  for(const g of [...set.lumps,...set.limbs])g.dispose();
  if(!cast){parts[0][1]=leafy.clone();parts[0][1].alphaTest=.24;}
  for(const [geometry,material,cut] of parts){const mesh=still(new THREE.Mesh(geometry,material));mesh.castShadow=cast;mesh.receiveShadow=true;mesh.userData.aoSkip=cut;site.add(mesh);}
 }
 const tufts=sheaf();
 for(let i=0,n=0;i<9000&&n<(full?1500:700);i++){
  if(!(i&127))await pause();
  const a=rand()*6.2832,r=5+Math.sqrt(rand())*36,x=HOUSE[0]+Math.cos(a)*r,y=HOUSE[1]+Math.sin(a)*r-3,[q]=stream(x,y);
  if(q<.9||open(x,y)<3.2||(x>-4.4&&x<15.2&&y>-5&&y<7.9)||(y>7.1&&y<12.75&&x>-42&&x<24.6)||road(x,y)>.2||(x>17.6&&x<23.2&&y>.4&&y<13))continue;n++;
  const h=.35+rand()*.5,w=h*(.7+rand()*.4),t=rand()*3.14,g=groundAt(x,y),tint=()=>[.34+rand()*.2,.5+rand()*.2,.2+rand()*.14];
  for(const b of [t,t+1.57])tufts.add(V(x,g+h/2-.05,-y),V(Math.cos(b)*w,0,Math.sin(b)*w),V(0,h/2,0),flat,tint);
 }
 await pause();
 const ferns=still(new THREE.Mesh(tufts.geometry(),new THREE.MeshStandardMaterial({...blades(renderer),alphaTest:.4,vertexColors:true,roughness:1})));
 ferns.receiveShadow=true;ferns.userData.aoSkip=true;site.add(ferns);

 // Slide the falls and let the stream's surface drift.
 const flow=dt=>{for(const [map,fall,drift] of flowing){map.offset.y=(map.offset.y-fall*dt)%1;map.offset.x=(map.offset.x+drift*dt)%1;}};
 return {land,ground,site,flow};
}
