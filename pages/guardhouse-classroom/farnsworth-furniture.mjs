// Furniture drawn in the round: tube and flat-bar frames, quilted leather, a glass table. Shapes follow photographs of the furnished house.
// Each piece is built facing +z around its own centre on the floor, then turned and moved to where the model puts it.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const LEATHER=0xb59f78,TEAK=0x94683f,LINEN=0xece7dc,WOOL=0x8f8b80,UP=new THREE.Vector3(0,1,0);
const flat=g=>{const n=g.index?g.toNonIndexed():g;if(n!==g)g.dispose();n.deleteAttribute('uv');return n;};
function paint(g,hex){
 const c=new THREE.Color(hex),n=g.attributes.position.count,a=new Float32Array(n*3);
 for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(a,3));return g;
}
const slab=(w,h,d,x,y,z,hex)=>paint(flat(new THREE.BoxGeometry(w,h,d).translate(x,y,z)),hex);
const pad=(w,h,d,x,y,z,hex,r=.03)=>paint(flat(new RoundedBoxGeometry(w,h,d,3,Math.min(r,h/2-.002)).translate(x,y,z)),hex);
// A bent tube: one cylinder per leg of the path and a ball at each bend.
function tube(points,r=.011){
 const parts=[],p=points.map(q=>new THREE.Vector3(...q));
 for(let i=1;i<p.length;i++){
  const axis=p[i].clone().sub(p[i-1]),len=axis.length(),g=new THREE.CylinderGeometry(r,r,len,10,1,true);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP,axis.normalize()));g.translate(...p[i-1].clone().lerp(p[i],.5).toArray());parts.push(flat(g));
  if(i<p.length-1)parts.push(flat(new THREE.SphereGeometry(r,10,8).translate(...p[i].toArray())));
 }
 return parts;
}
const curve=(a,c,b,n=9)=>Array.from({length:n+1},(_,i)=>{const t=i/n,u=1-t;return a.map((v,k)=>u*u*v+2*u*t*c[k]+t*t*b[k]);});
// Cushions quilted into squares, each square a small rounded pad.
function quilt(w,d,h,cols,rows,hex,place){
 const parts=[],pw=w/cols,pd=d/rows;
 for(let i=0;i<cols;i++)for(let j=0;j<rows;j++)parts.push(pad(pw-.006,h,pd-.006,-w/2+pw*(i+.5),0,-d/2+pd*(j+.5),hex,.035));
 return parts.map(place);
}

const pieces={
 // Cantilever chair of bent steel tube.
 'dining-chair':()=>{
  const chrome=[];
  for(const x of [-.235,.235])chrome.push(...tube([[x,.8,-.25],[x,.47,-.2],[x,.44,-.19],[x,.44,.2],[x,.4,.25],[x,.03,.25],[x,.012,.23],[x,.012,-.22]],.0125));
  chrome.push(...tube([[-.235,.012,-.22],[.235,.012,-.22]],.0125),...tube([[-.235,.8,-.25],[.235,.8,-.25]],.0125));
  return {solid:[pad(.45,.045,.42,0,.47,.01,LEATHER,.02),pad(.45,.26,.03,0,.65,-.235,LEATHER,.014).rotateX(-.06)],chrome};
 },
 // Lounge chair on two crossed bars with quilted leather cushions.
 'lounge-chair':()=>{
  const chrome=[],seat=g=>g.rotateX(-.14).translate(0,.4,.03),back=g=>g.rotateX(Math.PI/2-.42).translate(0,.6,-.31);
  for(const x of [-.365,.365]){
   chrome.push(...tube(curve([x,0,.33],[x,.3,-.02],[x,.75,-.4]),.012),...tube(curve([x,0,-.38],[x,.28,-.12],[x,.4,.37]),.012));
  }
  chrome.push(...tube([[-.365,.4,.37],[.365,.4,.37]],.01),...tube([[-.365,.75,-.4],[.365,.75,-.4]],.01),...tube([[-.365,.3,-.13],[.365,.3,-.13]],.01));
  return {solid:[...quilt(.72,.6,.1,4,3,LEATHER,seat),...quilt(.72,.5,.1,4,3,LEATHER,back)],chrome};
 },
 'desk-chair':()=>pieces['dining-chair'](),
 'coffee-table':({w,d})=>{
  const chrome=[],k=w/2-.06,q=d/2-.06;
  for(const s of [1,-1]){chrome.push(...tube([[-k,.01,-q*s],[-k*.92,.36,-q*s*.92],[k*.92,.36,q*s*.92],[k,.01,q*s]],.013));}
  return {solid:[],chrome,glass:[flat(new THREE.BoxGeometry(w,.019,d).translate(0,.385,0))]};
 },
 daybed:({w,d})=>{
  const chrome=[];for(const x of [-1,1])for(const z of [-1,1])chrome.push(...tube([[x*(w/2-.12),0,z*(d/2-.1)],[x*(w/2-.12),.19,z*(d/2-.1)]],.019));
  const top=quilt(w-.04,d-.04,.13,6,3,LEATHER,g=>g.translate(0,.33,0));
  const bolster=paint(flat(new THREE.CylinderGeometry(.095,.095,d-.08,20).rotateX(Math.PI/2).translate(w/2-.14,.49,0)),LEATHER);
  return {solid:[slab(w,.075,d,0,.225,0,TEAK),...top,bolster],chrome};
 },
 table:({w,d,h})=>{
  const chrome=[];for(const x of [-1,1])for(const z of [-1,1])chrome.push(...tube([[x*(w/2-.07),0,z*(d/2-.07)],[x*(w/2-.07),h-.04,z*(d/2-.07)]],.019));
  chrome.push(...tube([[-(w/2-.07),h-.06,0],[w/2-.07,h-.06,0]],.012));
  return {solid:[slab(w,.04,d,0,h-.02,0,TEAK)],chrome};
 },
 bed:({w,d})=>({solid:[slab(w-.06,.2,d-.06,0,.14,0,TEAK),pad(w,.2,d,0,.34,0,LINEN,.05),pad(.62,.035,d+.02,-w/2+.5,.452,0,WOOL,.015),
  ...[-1,1].map(s=>pad(.42,.11,.62,w/2-.3,.48,s*.36,LINEN,.05))],chrome:[]})
};
pieces['dining-table']=pieces.desk=pieces.table;

// Geometry for one furniture element, or null when the plain box of the model should stay.
export function furnish({id,face=-1},box){
 const make=pieces[id.replace(/\d+$/,'')];if(!make)return null;
 const size=box.getSize(new THREE.Vector3()),c=box.getCenter(new THREE.Vector3()),out=make({w:size.x,d:size.z,h:size.y}),turn=face===1?Math.PI:0;
 const merge=list=>{if(!list?.length)return null;const g=mergeGeometries(list);list.forEach(p=>p.dispose());g.rotateY(turn);g.translate(c.x,box.min.y,c.z);return g;};
 return {solid:merge(out.solid),chrome:merge(out.chrome),glass:merge(out.glass)};
}
