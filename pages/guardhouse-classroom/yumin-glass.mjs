// Art Nouveau glass for the Yumin rooms, made here in the manner of Gallé and Daum rather than copied from any piece of the collection:
// cameo vases whose carved motifs stand out of mottled glass, mushroom lamps that glow through their pattern, and clear hoods over the plinths.
// Every piece hangs under the furniture mesh it stands on, so it is cut, hidden and picked with it.
import * as THREE from 'three';

function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const W=512,H=256;
// A motif drawn three times across the seam with the same dice, so it closes around the vessel.
const around=(c,r,draw)=>{const s=r()*4294967296|0;for(const dx of [-W,0,W]){c.save();c.translate(dx,0);draw(rng(s));c.restore();}};
function branch(c,r,x,y,a,len,w,depth,leaf){
 const x2=x+Math.sin(a)*len,y2=y-Math.cos(a)*len;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo((x+x2)/2+(r()-.5)*len*.3,(y+y2)/2,x2,y2);c.stroke();
 if(depth<=0){if(leaf)for(let i=0;i<5;i++){c.beginPath();c.ellipse(x2+(r()-.5)*16,y2+(r()-.5)*12,6+r()*7,4+r()*4,r()*3,0,7);c.fill();}return;}
 const n=2+(r()<.35);for(let i=0;i<n;i++)branch(c,r,x2,y2,a+(i-(n-1)/2)*(.35+r()*.35)+(r()-.5)*.2,len*(.62+r()*.16),w*.66,depth-1,leaf);
}
const petals=(c,x,y,s,n=5)=>{for(let i=0;i<n;i++){const a=i/n*Math.PI*2;c.beginPath();c.ellipse(x+Math.cos(a)*s*.55,y+Math.sin(a)*s*.55,s*.55,s*.3,a,0,7);c.fill();}};
// Each motif paints with two inks: the carved overlay and its accent. The relief map calls it again with white for both.
const motifs={
 forest(c,r,ink){c.fillStyle=c.strokeStyle=ink[0];c.lineCap='round';
  c.globalAlpha=.55;c.beginPath();c.moveTo(-10,H);for(let x=-10;x<=W+10;x+=16)c.lineTo(x,H*.74+Math.sin(x*.021)*9+Math.sin(x*.057)*5);c.lineTo(W+10,H);c.fill();c.globalAlpha=1;
  c.fillRect(-10,H*.9,W+20,H*.1);
  for(let i=0;i<7;i++){const x=i*W/7+r()*30;around(c,r,q=>branch(c,q,x,H*.92,(q()-.5)*.15,H*(.16+q()*.08),5+q()*3,4,true));}},
 clematis(c,r,ink){c.lineCap='round';
  for(let i=0;i<6;i++){const x0=i*W/6+r()*30,top=H*(.15+r()*.3),sway=(r()-.5)*60,bloom=13+r()*5,at=(y)=>x0+Math.sin((H-y)*.03+i)*sway*.5;
   around(c,r,()=>{c.strokeStyle=c.fillStyle=ink[0];c.lineWidth=2.5;c.beginPath();c.moveTo(x0,H);for(let y=H;y>top;y-=8)c.lineTo(at(y),y);c.stroke();
    for(let y=H-20;y>top+10;y-=22){const s=y%44?1:-1;c.beginPath();c.ellipse(at(y)+s*9,y,9,4,s*.6,0,7);c.fill();}
    c.fillStyle=ink[1];petals(c,at(top),top,bloom,6);petals(c,at((H+top)/2)+14,(H+top)/2,9);c.fillStyle=ink[0];c.beginPath();c.arc(at(top),top,3,0,7);c.fill();});}},
 dragonfly(c,r,ink){c.lineCap='round';c.strokeStyle=c.fillStyle=ink[0];
  for(let i=0;i<16;i++){const x=i*W/16+r()*20,top=H*(.3+r()*.35),lean=(r()-.5)*40,w=2+r()*2;around(c,r,()=>{c.lineWidth=w;c.beginPath();c.moveTo(x,H);c.quadraticCurveTo(x,top+40,x+lean,top);c.stroke();});}
  for(let i=0;i<3;i++){const x=i*W/3+r()*80,y=H*(.12+r()*.2),a=(r()-.5)*.8;around(c,r,()=>{c.save();c.translate(x,y);c.rotate(a);c.strokeStyle=ink[0];c.lineWidth=3;c.beginPath();c.moveTo(-22,0);c.lineTo(20,0);c.stroke();
   c.fillStyle=ink[1];for(const [wx,wy] of [[4,-1],[4,1],[-2,-1],[-2,1]]){c.beginPath();c.ellipse(wx,wy*9,4,14,wy*.25,0,7);c.fill();}c.restore();});}},
 winter(c,r,ink){c.fillStyle=c.strokeStyle=ink[0];c.lineCap='round';c.fillRect(-10,H*.88,W+20,H*.12);
  for(let i=0;i<9;i++){const x=i*W/9+r()*20;around(c,r,q=>branch(c,q,x,H*.9,(q()-.5)*.1,H*(.14+q()*.1),4+q()*2,5,false));}
  c.fillStyle=ink[1];for(let i=0;i<40;i++){const x=r()*W,y=H*(.05+r()*.3),s=1.5+r()*1.5;around(c,r,()=>{c.beginPath();c.arc(x,y,s,0,7);c.fill();});}},
 vine(c,r,ink){c.lineCap='round';
  for(let i=0;i<5;i++){const x=i*W/5+r()*40,low=H*(.45+r()*.3);around(c,r,q=>{c.strokeStyle=c.fillStyle=ink[0];c.lineWidth=3;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+30,low*.3,x-30,low*.7,x+8,low);c.stroke();
   for(let k=1;k<6;k++){const t=k/6,y=low*t,lx=x+Math.sin(t*5)*18;c.save();c.translate(lx,y);c.rotate((k%2?.8:-.8)+(q()-.5)*.3);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(14,-6,22,8,0,24);c.bezierCurveTo(-22,8,-14,-6,0,0);c.fill();c.restore();}
   c.fillStyle=ink[1];for(let k=0;k<5;k++){c.beginPath();c.arc(x+8+(q()-.5)*14,low+6+k*5,3.5,0,7);c.fill();}});}},
 blossom(c,r,ink){c.lineCap='round';const bough=x=>H*.5+Math.sin(x*.018)*22;
  around(c,r,q=>{c.strokeStyle=c.fillStyle=ink[0];c.lineWidth=7;c.beginPath();c.moveTo(-20,bough(-20));for(let x=0;x<=W+20;x+=20)c.lineTo(x,bough(x));c.stroke();
   for(let i=0;i<10;i++){const x=i*W/10+18;branch(c,q,x,bough(x),(i%2?1:-1)*(.6+q()*.5),22+q()*14,3,1,false);}});
  c.fillStyle=ink[1];for(let i=0;i<34;i++){const x=r()*W,y=H*(.28+r()*.4),s=7+r()*4;around(c,r,()=>petals(c,x,y,s));}}
};
// The glass itself: a gradient from foot to lip with clouds of colour, as the powders melted into the gather leave it.
function ground(c,r,stops,glow=0){
 const g=c.createLinearGradient(0,H,0,0);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));c.fillStyle=g;c.fillRect(0,0,W,H);
 for(let i=0;i<26;i++){const x=r()*W,y=r()*H,s=20+r()*60,rad=c.createRadialGradient(x,y,0,x,y,s);rad.addColorStop(0,`rgba(${glow?'255,240,200':'255,255,255'},${.05+r()*.1})`);rad.addColorStop(1,'rgba(255,255,255,0)');around(c,r,()=>{c.fillStyle=rad;c.fillRect(x-s,y-s,s*2,s*2);});}
}
const canvas=()=>{const e=document.createElement('canvas');e.width=W;e.height=H;return e;};
const texture=(e,colour)=>{const t=new THREE.CanvasTexture(e);t.wrapS=THREE.RepeatWrapping;if(colour)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;};
function skin(motif,stops,ink,seed){
 const a=canvas(),c=a.getContext('2d');ground(c,rng(seed),stops);motifs[motif](c,rng(seed+7),ink);
 const b=canvas(),d=b.getContext('2d');d.fillStyle='#000';d.fillRect(0,0,W,H);motifs[motif](d,rng(seed+7),['#fff','#fff']);
 return {map:texture(a,true),bumpMap:texture(b,false)};
}
// What a lit shade shows: a bright gather, brightest under the crown, with the motif standing dark against it.
function lampSkin(motif,stops,seed){
 const a=canvas(),c=a.getContext('2d');ground(c,rng(seed),stops,1);motifs[motif](c,rng(seed+7),['#24140a','#3a1e0c']);return texture(a,true);
}

// The six glasses of the rooms: what is carved into each and the colours it runs through from foot to lip.
const SKINS=[
 ['forest',['#8a4a1c','#c9822e','#efc77a','#f6e3b0'],['#3a2212','#5a3216']],
 ['clematis',['#7d5a86','#c9a7c4','#eddde4','#f5ecee'],['#3f5a2b','#5b2a6a']],
 ['dragonfly',['#24465e','#3f7a86','#9ec7b8','#d8e6d6'],['#1b2e22','#2a4a5c']],
 ['winter',['#b8441e','#e07a3a','#e9cbb0','#eee8e0'],['#1c1714','#3a2a22']],
 ['vine',['#4d5a26','#8a8a3a','#d9c27a','#efe2b4'],['#2c3a18','#6a2a1a']],
 ['blossom',['#4a2440','#6a3d5c','#b5768e','#e6c6cf'],['#2a1620','#f2dce2']]
];
const LAMPS=[
 ['forest',['#a8380e','#d9621e','#f0952e','#f7c060']],
 ['winter',['#9a2e10','#cf521c','#ec8a34','#f6b860']],
 ['clematis',['#a3401a','#d66a26','#efa040','#f8cc78']]
];
// Vessel outlines as [radius, height] in parts of the vessel's width and height, foot to lip.
const SHAPES=[
 [[0,0],[.3,0],[.44,.22],[.38,.5],[.15,.72],[.11,.94],[.17,1]],
 [[0,0],[.26,0],[.5,.3],[.56,.62],[.42,.86],[.46,1]],
 [[0,0],[.3,0],[.46,.2],[.3,.46],[.37,.62],[.19,.86],[.24,1]],
 [[0,0],[.24,0],[.21,.5],[.29,.88],[.4,1]],
 [[0,0],[.34,0],[.5,.38],[.3,.7],[.2,.8],[.32,1]],
 [[0,0],[.28,0],[.42,.12],[.4,.3],[.18,.48],[.08,.7],[.07,.92],[.12,1]],
 [[0,0],[.22,0],[.46,.25],[.5,.5],[.38,.78],[.16,.92],[.18,1]],
 [[0,0],[.3,0],[.3,.04],[.12,.12],[.1,.5],[.2,.8],[.42,1]]
];
// A smooth outline at even spacing, so the carving is not stretched where the points crowd; the lip turns in to show the wall's thickness.
function outline(points,h,s){
 const curve=new THREE.SplineCurve(points.map(([r,t])=>new THREE.Vector2(r*s,t*h))),list=curve.getSpacedPoints(28),lip=list[list.length-1];
 list[0].x=0;list.push(new THREE.Vector2(Math.max(lip.x-.008,.002),lip.y-.012));return list;
}
const SHADE=[[.94,0],[1,.05],[.96,.18],[.84,.34],[.62,.5],[.34,.6],[0,.63]],FOOT=[[0,0],[.5,0],[.52,.03],[.3,.08],[.16,.2],[.13,.55],[.2,.75],[.12,.92],[.1,1]];

// On light graphics the vases drop the clear coat and only the pieces on plinths cast shadows.
export function createGlassWorks(cut,look,tier='full'){
 const owned=[],keep=x=>{owned.push(x);return x;};
 const vases=SKINS.map(([m,stops,ink],i)=>{const t=skin(m,stops,ink,11+i*13);keep(t.map);keep(t.bumpMap);
  const o={map:t.map,bumpMap:t.bumpMap,bumpScale:2.2,emissive:0xffffff,emissiveMap:t.map,emissiveIntensity:.14,roughness:.2,side:THREE.DoubleSide};
  return keep(cut(tier==='full'?new THREE.MeshPhysicalMaterial({...o,clearcoat:1,clearcoatRoughness:.06}):new THREE.MeshStandardMaterial({...o,roughness:.14})));});
 const lamps=LAMPS.map(([m,stops],i)=>{const t=keep(lampSkin(m,stops,101+i*17));
  const o={color:0x4a3426,map:t,emissive:0xffffff,emissiveMap:t,roughness:.3,side:THREE.DoubleSide};
  // The shade carries the bulb; the foot only catches what falls from it.
  return [keep(cut(new THREE.MeshStandardMaterial({...o,emissiveIntensity:1.2}))),keep(cut(new THREE.MeshStandardMaterial({...o,emissiveIntensity:.3})))];});
 // Hoods catch the room on their faces as the windows do.
 const hood=keep(cut(new THREE.MeshStandardMaterial({color:0xeef3f2,transparent:true,opacity:.1,roughness:.05,metalness:0,envMapIntensity:1.1,depthWrite:false})));look?.glass(hood);
 const edge=keep(cut(new THREE.LineBasicMaterial({color:0xd8dedc,transparent:true,opacity:.55})));
 const pool=(()=>{const e=document.createElement('canvas');e.width=e.height=128;const c=e.getContext('2d'),g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.45,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,128,128);
  return keep(cut(new THREE.MeshBasicMaterial({map:keep(new THREE.CanvasTexture(e)),color:0xff9a48,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})));})();
 const geometry=g=>keep(g);
 const vase=(n,h,s,x,y,z,shadow=true)=>{const m=new THREE.Mesh(geometry(new THREE.LatheGeometry(outline(SHAPES[n%SHAPES.length],h,s),48)),vases[(n*5+1)%vases.length]);m.position.set(x,y,z);m.rotation.y=n*1.7;m.castShadow=shadow&&tier==='full';m.receiveShadow=true;return m;};
 function cover(w,d,h,y){
  const g=new THREE.Group(),box=geometry(new THREE.BoxGeometry(w,h,d).translate(0,y+h/2,0)),face=new THREE.Mesh(box,hood);face.renderOrder=2;
  g.add(face,new THREE.LineSegments(geometry(new THREE.EdgesGeometry(box)),edge));return g;
 }
 function lamp(n,y){
  const g=new THREE.Group(),r=.17+(n%3)*.02,tall=.34+(n%4)*.04,[mat,foot]=lamps[n%lamps.length];
  const stand=new THREE.Mesh(geometry(new THREE.LatheGeometry(FOOT.map(([a,b])=>new THREE.Vector2(a*r*.9,b*tall)),40)),foot);stand.position.y=y;
  const shade=new THREE.Mesh(geometry(new THREE.LatheGeometry(SHADE.map(([a,b])=>new THREE.Vector2(a*r,b*r)),48)),mat);shade.position.y=y+tall-.02;shade.rotation.y=n;
  const light=new THREE.Mesh(geometry(new THREE.CircleGeometry(.3,24)),pool);light.rotation.x=-Math.PI/2;light.position.y=y+.003;
  stand.castShadow=shade.castShadow=tier==='full';g.add(stand,shade,light);return g;
 }
 // Builds what stands on one piece of furniture, in the frame the furniture was built in, and hangs it under the mesh.
 function dress(mesh,{kind,n,w,d,h,turn,x,y,z},{vase:withVase=true}={}){
  const g=new THREE.Group();
  if(kind==='plinth'){if(withVase)g.add(vase(n,.28+(n*7%5)*.04,.36,0,h+.012,0));g.add(cover(Math.min(w,d)-.06,Math.min(w,d)-.06,.62,h+.012));}
  else if(kind==='showpiece'){g.add(vase(1,h-.1,.7,0,.54,0),vase(3,.34,.3,-.3,.54,.3),cover(w-.24,d-.24,h+.2,.54));}
  else if(kind==='lampstand')g.add(lamp(n,h));
  else if(kind==='case'){const l=Math.max(w,d),s=Math.min(w,d),inner=new THREE.Group();
   for(let i=0;i<5;i++){const px=-l/2+l*(i+.5)/5;inner.add(vase(i+2,.2+(i%3)*.05,.26,px,.75,.02,false),vase(i+5,.16+(i%2)*.05,.2,px+.12,1.335,-.04,false));}
   const front=new THREE.Mesh(geometry(new THREE.PlaneGeometry(l-.1,h-.85)),hood);front.position.set(0,.75+(h-.85)/2,s/2-.01);front.renderOrder=2;inner.add(front);
   if(d>w)inner.rotation.y=Math.PI/2;g.add(inner);}
  else return null;
  g.rotation.y=turn;g.position.set(x,y,z);g.traverse(o=>{o.userData=mesh.userData;});mesh.add(g);return g;
 }
 // The lamps burn brighter when the room around them goes dark.
 return {dress,night(on){for(const [shade,foot] of lamps){shade.emissiveIntensity=on?1.8:1.2;foot.emissiveIntensity=on?.5:.3;}},dispose(){for(const x of owned)x.dispose();owned.length=0;}};
}
