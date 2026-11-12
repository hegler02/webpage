// The land round the Yumin museum: a windy cape of grass above basalt cliffs, the sea to the north and east,
// and 성산일출봉 across the water on the axis of the building.
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {fading,sheaf} from './farnsworth-land.mjs';
import {ripples,blades} from './farnsworth-textures.mjs';
import {cascade} from './fallingwater-textures.mjs';
import {basalt,meadow} from './yumin-textures.mjs';
import {random,V,UP,quiet,still,ease,SEA,HOLE,FAR,PEAK,coast,shore,sheetOf,seaward,cliff,hill,crater,clear} from './yumin-coast.mjs';

// Low field walls of piled basalt, the 돌담 of Jeju: three loose courses of stones along a line.
function fieldWalls(lines,rand){
 const stones=[];
 for(const line of lines)for(let s=1;s<line.length;s++){
  const [x0,y0]=line[s-1],[x1,y1]=line[s],len=Math.hypot(x1-x0,y1-y0),turn=Math.atan2(y1-y0,x1-x0),n=Math.ceil(len/.56);
  for(let i=0;i<n;i++)for(let c=0;c<3;c++){
   if(c===2&&rand()<.3)continue;
   const t=(i+(c%2)*.5+rand()*.2)/n,w=.42+rand()*.2,h=.26+rand()*.1,d=.4+rand()*.16-c*.05,tone=.19+rand()*.13;
   const g=new THREE.BoxGeometry(w,h,d);g.rotateY(turn+(rand()-.5)*.5);g.translate(x0+(x1-x0)*t+(rand()-.5)*.08,.13+c*.29+(rand()-.5)*.03,-(y0+(y1-y0)*t+(rand()-.5)*.08));
   g.setAttribute('color',new THREE.Float32BufferAttribute(Array.from({length:72},(_,k)=>tone*(k%3===2?1.04:1)),3));stones.push(g);
  }
 }
 const g=mergeGeometries(stones);stones.forEach(s=>s.dispose());return g;
}

export function buildLand(renderer,tier='full'){
 const land=new THREE.Group(),site=new THREE.Group(),rand=random(811),flowing=[];land.name='land';site.name='site';
 // Walking ground: the shared look lays its grass on this and fades it out toward the horizon.
 const ground=new THREE.Mesh(sheetOf(coast(460),460,160),new THREE.MeshStandardMaterial({color:0x7f8c56,roughness:1}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.03;ground.receiveShadow=true;ground.raycast=()=>{};
 // The same land carried out to the horizon, just under the walking ground, with the bay cut into it.
 const line=shore(),plain=still(new THREE.Mesh(sheetOf(line,FAR),new THREE.MeshStandardMaterial({color:0x66744c,roughness:1})));
 plain.rotation.x=-Math.PI/2;plain.position.y=-.6;land.add(plain);
 const swell=ripples(renderer,[24000,24000]);flowing.push([swell,.012,.03]);
 const sea=quiet(new THREE.Mesh(new THREE.PlaneGeometry(24000,24000),new THREE.MeshStandardMaterial({color:0x23596b,roughness:.16,metalness:0,bumpMap:swell,bumpScale:.7,envMapIntensity:.75})));
 sea.rotation.x=-Math.PI/2;sea.position.y=SEA;land.add(sea);
 const rock=basalt(renderer,5);
 land.add(still(new THREE.Mesh(cliff(line,rand),new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,bumpMap:rock.bumpMap,bumpScale:rock.bumpScale*2,roughness:.95,side:THREE.DoubleSide}))));
 // Surf along the foot of the cliff.
 const out=seaward(line),edge=d=>line.map(([x,y],i)=>[x+out[i][0]*d,y+out[i][1]*d]);
 land.add(still(new THREE.Mesh(fading(edge(5),edge(19),SEA+.08,.75),new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,transparent:true,depthWrite:false,roughness:.7}))));
 // 성산일출봉 rises from the sea straight ahead; lower oreum stand on the land behind the bay and an island lies low to the north-east.
 const hills=[hill(PEAK,560,182,{profile:crater,base:SEA,seed:7,haze:.2}),
  ...[[-2600,4300,620,150],[-4300,3900,700,120],[-1700,4750,460,95],[-3100,1500,520,110],[-4600,500,650,140],[-2300,-2700,430,90],[-900,-3800,520,105]].map(([x,y,r,h],i)=>hill([x,y],r,h,{seed:20+i,haze:.3})),
  hill([5200,6400],1700,110,{base:SEA,seed:40,haze:.48,squash:.6})];
 land.add(still(new THREE.Mesh(mergeGeometries(hills),new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}))));hills.forEach(g=>g.dispose());

 // Wind-combed grass close to the building, fading into the shared grass further out.
 const pos=[],col=[],uv=[],C=6,R0=60,R1=102,alpha=(x,y)=>1-ease((Math.hypot(x,y)-R0)/(R1-R0-C));
 for(let x=-R1;x<R1;x+=C)for(let y=-R1;y<R1;y+=C){
  if(Math.abs(x+C/2)<HOLE&&Math.abs(y+C/2)<HOLE)continue;
  for(const [a,b] of [[0,0],[C,0],[C,C],[0,0],[C,C],[0,C]]){pos.push(x+a,-.016,-(y+b));uv.push(x+a,y+b);col.push(1,1,1,alpha(x+a,y+b));}
 }
 const turf=new THREE.BufferGeometry();turf.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));turf.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 turf.setAttribute('color',new THREE.Float32BufferAttribute(col,4));turf.setAttribute('normal',new THREE.Float32BufferAttribute(pos.map((_,i)=>i%3===1?1:0),3));
 const lawn=still(new THREE.Mesh(turf,new THREE.MeshStandardMaterial({...meadow(renderer),vertexColors:true,transparent:true,depthWrite:false})));
 lawn.receiveShadow=true;lawn.renderOrder=-.5;site.add(lawn);

 // Tufts of long grass leaning with the wind; about one in five is a taller, paler clump of 억새.
 const tufts=sheaf(),count=tier==='full'?5600:1800,flat=()=>UP;
 for(let k=0,tries=0;k<count&&tries<count*8;tries++){
  const a=rand()*6.2832,r=20+115*Math.pow(rand(),.75),x=r*Math.cos(a),y=r*Math.sin(a);if(!clear(x,y))continue;
  const silver=rand()<.14,h=silver?.9+rand()*.7:.28+rand()*.42,w=silver?.45+rand()*.3:.4+rand()*.4,t=rand()*3.14,lean=h*(.2+rand()*.25),g=rand();
  const tone=silver?[.6+g*.16,.54+g*.13,.34+g*.1]:[.17+g*.13,.25+g*.13,.1+g*.08];
  for(const b of [t,t+1.57])tufts.add(V(x+lean/2,h/2-.04,-y),V(Math.cos(b)*w,0,Math.sin(b)*w),V(lean/2,h/2,0),flat,()=>tone);k++;
 }
 const grass=still(new THREE.Mesh(tufts.geometry(),new THREE.MeshStandardMaterial({...blades(renderer),alphaTest:.4,vertexColors:true,roughness:1})));
 grass.receiveShadow=true;grass.userData.aoSkip=true;site.add(grass);

 const walls=still(new THREE.Mesh(fieldWalls([[[-70,62],[-30,70],[8,64],[44,74],[84,60]],[[60,40],[66,5],[58,-30],[70,-62]],[[-52,34],[-58,-6],[-48,-30]],[[22,-48],[52,-56],[88,-44]]],rand),
  new THREE.MeshStandardMaterial({vertexColors:true,roughness:1})));
 walls.castShadow=walls.receiveShadow=true;site.add(walls);

 // Water of the building itself: the sheet running down the basalt walls of the passage, and the still channels and pool.
 const white=cascade(renderer),pond=ripples(renderer,[1,1]);
 for(const map of [white.map,white.alphaMap]){map.repeat.set(1/1.6,1/3.2);flowing.push([map,-.42,0]);}
 flowing.push([pond,0,.03]);
 const water={
  fall:new THREE.MeshStandardMaterial({color:0xffffff,map:white.map,alphaMap:white.alphaMap,transparent:true,opacity:.84,depthWrite:false,side:THREE.DoubleSide,roughness:.3,emissive:0xcfdcdf,emissiveIntensity:.12}),
  still:new THREE.MeshStandardMaterial({color:0x3c6a76,roughness:.08,metalness:0,bumpMap:pond,bumpScale:.3,envMapIntensity:.9,transparent:true,opacity:.92})
 };
 const flow=dt=>{for(const [map,fall,drift] of flowing){map.offset.y=(map.offset.y-fall*dt)%1;map.offset.x=(map.offset.x+drift*dt)%1;}};
 return {land,ground,site,flow,water};
}
