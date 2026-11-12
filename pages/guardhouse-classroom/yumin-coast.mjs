// Shapes of the cape the Yumin museum stands on: its shoreline, the cliff under it, far hills and where long grass may grow.
// Model x runs east and y runs along the axis of the building; the scene puts that at (x, height, -y).
import * as THREE from 'three';

function random(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const V=(x,y,z)=>new THREE.Vector3(x,y,z),UP=V(0,1,0),ease=t=>Math.min(1,Math.max(0,t));
const quiet=mesh=>{mesh.raycast=()=>{};mesh.userData.aoKeep=true;return mesh;};
const still=mesh=>{mesh.raycast=()=>{};return mesh;};
// Sea level below the walking ground, half the side of the hole left for the sunken court, and where the far peak stands.
const SEA=-16,HOLE=18,FAR=5260,PEAK=[0,3900];
const wave=(t,a,b)=>a*Math.sin(t/70)+b*Math.sin(t/23+1);
const northShore=x=>215+wave(x,26,10)*ease((140-x)/120),eastShore=y=>195+wave(y+300,22,9)*ease((160-y)/120);
const corner=()=>Array.from({length:9},(_,i)=>{const a=Math.PI/2*(1-(i+1)/10);return [140+55*Math.cos(a),160+55*Math.sin(a)+(i%2?2:-1)];});
// The near coast: the north shore runs west to east, turns a rounded corner and runs south.
function coast(far){
 const out=[];for(let x=-far;x<=140;x+=12)out.push([x,northShore(x)]);
 out.push(...corner());for(let y=160;y>-far;y-=12)out.push([eastShore(y),y]);return out;
}
// The whole shore the sea touches, from the far side of the bay round to the south: coarse far away, fine near the museum.
function shore(){
 const out=[[-350,FAR],[-350,3420]];
 for(let x=-500;x>=-1000;x-=125)out.push([x,3350+50*Math.sin(x/260)]);
 for(let y=3150;y>=450;y-=150)out.push([-1100+90*Math.sin(y/420),y]);
 for(let x=-1000;x<=140;x+=x<-460?90:12)out.push([x,northShore(x)]);
 out.push(...corner());for(let y=160;y>-FAR;y-=y<-460?400:12)out.push([eastShore(y),y]);return out;
}
// A flat sheet of land inside a shoreline, with the court cut out of it.
function sheetOf(points,far,scale=1){
 const shape=new THREE.Shape([...points,[points.at(-1)[0],-far],[-far,-far],[-far,points[0][1]]].map(([x,y])=>new THREE.Vector2(x,y)));
 shape.holes.push(new THREE.Path([[-HOLE,-HOLE],[HOLE,-HOLE],[HOLE,HOLE],[-HOLE,HOLE]].map(([x,y])=>new THREE.Vector2(x,y))));
 const g=new THREE.ShapeGeometry(shape),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/scale,uv.getY(i)/scale);return g;
}
// Seaward side of a shoreline that runs with the land on its right.
function seaward(points){
 return points.map((p,i)=>{const a=points[Math.max(i-1,0)],b=points[Math.min(i+1,points.length-1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [-dy/l,dx/l];});
}
// Basalt cliff from the grass down into the water: a steep face, a ledge and a foot below the surface.
function cliff(points,rand){
 const out=seaward(points),pos=[],uv=[],col=[],index=[],rows=[[0,-.03],[1.6,-3.4],[4.4,-10.5],[9,SEA-1]];let run=0;
 points.forEach(([x,y],i)=>{
  if(i)run+=Math.hypot(x-points[i-1][0],y-points[i-1][1]);
  rows.forEach(([off,h],k)=>{const o=off*(k?.7+rand()*.6:1),t=k===0?.5:.26+rand()*.16;pos.push(x+out[i][0]*o,h+(k===1||k===2?rand()*1.6-.8:0),-(y+out[i][1]*o));uv.push(run,h);col.push(t*(k?1:.9),t*(k?1:1.05),t*(k?1.02:.7));});
  if(i)for(let k=0;k<rows.length-1;k++){const a=(i-1)*rows.length+k,b=a+rows.length;index.push(a,b,a+1,a+1,b,b+1);}
 });
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(index);g.computeVertexNormals();return g;
}
// A hill turned from a profile of [radius, height] parts, roughened round its rim and tinted toward the haze of the distance.
const cone=[[1,0],[.82,.16],[.58,.5],[.34,.82],[.14,.97],[0,1]],crater=[[1,0],[.92,.2],[.8,.62],[.68,.92],[.6,1],[.52,.84],[.3,.62],[0,.56]];
function hill([cx,cy],R,H,{profile=cone,base=-.6,seed=1,haze=.45,squash=1}={}){
 const rand=random(seed),N=56,pos=[],col=[],index=[],sky=[.5,.6,.68],rock=[.115,.105,.085],grass=[.07,.115,.05],jag=Array.from({length:N},()=>.84+rand()*.26);
 profile.forEach(([rp,hp],j)=>{
  const steep=j>0&&j<profile.length-1&&Math.abs(hp-profile[j-1][1])/Math.max(profile[j-1][0]-rp,.02)>1.6;
  for(let i=0;i<N;i++){
   const a=i/N*6.2832,r=R*rp*(1+.1*Math.sin(a*3+seed)+.05*Math.sin(a*7+seed*2)),top=hp>=.9?jag[i]:1,tone=(steep?rock:grass).map(c=>c*(.86+rand()*.26));
   pos.push(cx+r*Math.cos(a),base+H*hp*top,-(cy+r*squash*Math.sin(a)));col.push(...tone.map((c,k)=>c+(sky[k]-c)*haze));
  }
  if(j)for(let i=0;i<N;i++){const a=(j-1)*N+i,b=(j-1)*N+(i+1)%N,c=j*N+i,d=j*N+(i+1)%N;index.push(a,b,c,b,d,c);}
 });
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(index);g.computeVertexNormals();return g;
}
// Where long grass may not grow: the court and its pavilions, the paths, the car park, the walled gardens.
const inside=(x,y,x0,y0,x1,y1)=>x>x0&&x<x1&&y>y0&&y<y1;
function clear(x,y){
 if(Math.abs(x)<19.6&&Math.abs(y)<19.6)return false;
 for(const [cx,cy] of [[20.8,20.8],[20.8,-20.8],[-20.8,-20.8]])if(Math.abs(x-cx)<3.4&&Math.abs(y-cy)<3.4)return false;
 if(inside(x,y,-2.4,-36,2.4,-18)||inside(x,y,-16,-34,16,-21))return false;
 const t=ease(((x+10.5)*.5+(y+52.17)*.866)/21),px=-10.5+10.5*t,py=-52.17+18.17*t;if(Math.hypot(x-px,y-py)<2.6)return false;
 const u=(x+27.5)*.866-(y+63)*.5,w=(x+27.5)*.5+(y+63)*.866;if(Math.abs(u)<36&&w>-11&&w<5)return false;
 return Math.hypot(x+13,y+56.5)>8;
}
export {random,V,UP,quiet,still,ease,SEA,HOLE,FAR,PEAK,coast,shore,sheetOf,seaward,cliff,hill,crater,clear};
