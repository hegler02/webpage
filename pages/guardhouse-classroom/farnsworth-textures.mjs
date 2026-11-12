// Surfaces drawn for this house: travertine slabs on the 0.838 × 0.61 m module, ribbon-striped veneer and river ripples.
import * as THREE from 'three';

export function random(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export const sheet=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];};
export function texture(canvas,renderer,colour=true){
 const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 if(colour)t.colorSpace=THREE.SRGBColorSpace;return t;
}

// Four by four slabs on one tile so that no two neighbours look alike. One UV unit is one slab.
export function travertine(renderer){
 const N=4,sw=256,sh=186,[c,x]=sheet(sw*N,sh*N),[b,y]=sheet(sw*N,sh*N),rand=random(11);
 y.fillStyle='#808080';y.fillRect(0,0,b.width,b.height);
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){
  const ox=i*sw,oy=j*sh,t=Math.round(rand()*16-8);
  x.globalAlpha=1;x.fillStyle=`rgb(${224+t},${213+t},${191+t})`;x.fillRect(ox,oy,sw,sh);
  x.save();x.beginPath();x.rect(ox,oy,sw,sh);x.clip();y.save();y.beginPath();y.rect(ox,oy,sw,sh);y.clip();
  // The bedding of the stone runs along the long side of each slab.
  for(let k=0;k<80;k++){
   const py=oy+rand()*sh,px=ox+rand()*sw-70,len=50+rand()*230;
   x.strokeStyle=rand()<.5?'#f3ecdb':'#b3a07e';x.globalAlpha=.08+rand()*.17;x.lineWidth=.6+rand()*2.8;
   x.beginPath();x.moveTo(px,py);x.bezierCurveTo(px+len*.3,py+rand()*5-2.5,px+len*.7,py+rand()*5-2.5,px+len,py+rand()*4-2);x.stroke();
  }
  for(let k=0;k<44;k++){
   const px=ox+rand()*sw,py=oy+rand()*sh,rx=1+rand()*5,ry=.5+rand()*1.3;
   x.globalAlpha=.28+rand()*.3;x.fillStyle='#857252';x.beginPath();x.ellipse(px,py,rx,ry,0,0,6.2832);x.fill();
   y.fillStyle='#3a3a3a';y.beginPath();y.ellipse(px,py,rx,ry,0,0,6.2832);y.fill();
  }
  x.restore();y.restore();
 }
 x.globalAlpha=1;x.fillStyle='#8d836d';y.fillStyle='#1c1c1c';
 for(let i=0;i<=N;i++)for(const g of [x,y]){g.fillRect(i*sw-1,0,2,sh*N);g.fillRect(0,i*sh-1,sw*N,2);}
 const map=texture(c,renderer),bumpMap=texture(b,renderer,false);
 for(const t of [map,bumpMap])t.repeat.set(1/N,1/N);
 return {map,bumpMap,bumpScale:.0014,roughness:.52};
}

// Veneer with the grain standing upright and a joint every `panel` metres. UVs are metres; the tile starts at height `from`.
export function veneer(renderer,{base,dark,light,panel=1.2,from=0,seed=3}){
 const [c,x]=sheet(512,1024),rand=random(seed),H=2.4;
 x.fillStyle=base;x.fillRect(0,0,512,1024);
 for(let px=0;px<512;){const w=10+rand()*26;x.globalAlpha=.05+rand()*.1;x.fillStyle=rand()<.5?light:dark;x.fillRect(px,0,w,1024);px+=w;}
 for(let k=0;k<900;k++){
  const px=rand()*512,py=rand()*1024-200,len=80+rand()*420;
  x.globalAlpha=.05+rand()*.12;x.strokeStyle=rand()<.6?dark:light;x.lineWidth=.5+rand()*1.3;x.beginPath();x.moveTo(px,py);x.lineTo(px+rand()*3-1.5,py+len);x.stroke();
 }
 x.globalAlpha=.7;x.fillStyle='#3d2a18';x.fillRect(0,0,2,1024);x.fillRect(510,0,2,1024);
 const map=texture(c,renderer);map.repeat.set(1/panel,1/H);map.offset.set(0,-from/H);
 return {map,roughness:.5};
}

export function ripples(renderer,metres){
 const [c,x]=sheet(256,256),rand=random(29);x.fillStyle='#808080';x.fillRect(0,0,256,256);
 for(let k=0;k<420;k++){
  const px=rand()*256,py=rand()*256,rx=8+rand()*26,ry=1+rand()*2.4;x.globalAlpha=.1+rand()*.16;x.fillStyle=rand()<.5?'#b8b8b8':'#484848';
  for(const dx of [-256,0,256])for(const dy of [-256,0,256]){x.beginPath();x.ellipse(px+dx,py+dy,rx,ry,0,0,6.2832);x.fill();}
 }
 const map=texture(c,renderer,false);map.repeat.set(metres[0]/7,metres[1]/7);return map;
}

// Cut-outs keep colour and outline on two sheets, so the edge of a leaf never blends toward black.
export function cutout(colour,alpha,renderer){
 const map=texture(colour,renderer),alphaMap=texture(alpha,renderer,false);
 for(const t of [map,alphaMap])t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
 return {map,alphaMap};
}
const hsl=(h,s,l)=>`hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;

// A spray of three-lobed leaves, thick in the middle and ragged at the rim. The shaded leaves are painted first.
export function foliage(renderer){
 const S=512,[c,x]=sheet(S,S),[a,y]=sheet(S,S),rand=random(47),N=210;
 x.fillStyle='#5d7a3c';x.fillRect(0,0,S,S);y.fillStyle='#000';y.fillRect(0,0,S,S);y.fillStyle='#fff';
 for(let i=0;i<N;i++){
  const r=206*Math.pow(rand(),.62),t=rand()*6.2832,len=30+rand()*18,turn=rand()*6.2832,deep=i<N*.4;
  x.fillStyle=hsl(76+rand()*30,30+rand()*18,deep?27+rand()*11:38+rand()*20);
  for(const g of [x,y]){
   g.save();g.translate(S/2+r*Math.cos(t),S/2+r*Math.sin(t));g.rotate(turn);
   for(const [lean,k] of [[-.72,.78],[0,1],[.72,.78]]){
    const l=len*k,w=l*.3;g.save();g.rotate(lean);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(w,-l*.45,0,-l);g.quadraticCurveTo(-w,-l*.45,0,0);g.fill();g.restore();
   }
   g.restore();
  }
 }
 return cutout(c,a,renderer);
}

// Blades of grass fanning out of the foot of the card.
export function blades(renderer){
 const S=256,[c,x]=sheet(S,S),[a,y]=sheet(S,S),rand=random(53);
 x.fillStyle='#75853f';x.fillRect(0,0,S,S);y.fillStyle='#000';y.fillRect(0,0,S,S);y.strokeStyle='#fff';
 for(let i=0;i<64;i++){
  const from=S*(.18+rand()*.64),lean=(rand()-.5)*120,top=S*(.04+rand()*.5);
  x.strokeStyle=hsl(62+rand()*30,28+rand()*20,34+rand()*24);
  for(const g of [x,y]){g.lineWidth=2.4+rand()*2.6;g.lineCap='round';g.beginPath();g.moveTo(from,S-3);g.quadraticCurveTo(from+lean*.2,S*.5,from+lean,top);g.stroke();}
 }
 return cutout(c,a,renderer);
}

// Furrowed bark. One UV unit is about a metre round the limb and along it.
export function bark(renderer){
 const [c,x]=sheet(256,256),[b,y]=sheet(256,256),rand=random(61);
 x.fillStyle='#74675a';x.fillRect(0,0,256,256);y.fillStyle='#808080';y.fillRect(0,0,256,256);
 for(let k=0;k<260;k++){
  const px=rand()*256,py=rand()*256,len=30+rand()*90,w=1+rand()*3.4,dark=rand()<.6;
  x.globalAlpha=.25+rand()*.35;x.strokeStyle=dark?'#4a4037':'#978a78';y.globalAlpha=.5;y.strokeStyle=dark?'#303030':'#b0b0b0';
  for(const g of [x,y])for(const dy of [-256,0,256]){g.lineWidth=w;g.beginPath();g.moveTo(px,py+dy);g.bezierCurveTo(px+rand()*6-3,py+dy+len*.3,px+rand()*6-3,py+dy+len*.7,px+rand()*8-4,py+dy+len);g.stroke();}
 }
 return {map:texture(c,renderer),bumpMap:texture(b,renderer,false),bumpScale:.02,roughness:1};
}

// Patches laid over the turf: the mown lawn round the house, and longer, drier or damper grass further out. It thins to nothing at its rim.
export function meadow(renderer,{size,lawn}){
 const S=1024,[c,x]=sheet(S,S),[a,y]=sheet(S,S),rand=random(67),m=S/size;
 x.fillStyle='#75854c';x.fillRect(0,0,S,S);
 // A thin wash over everything takes the turf from playing-field green toward meadow.
 y.fillStyle='#5c5c5c';y.fillRect(0,0,S,S);
 const blot=(px,py,r,colour,alpha,squash=1)=>{
  for(const [g,inner] of [[x,colour],[y,'#fff']]){
   const fill=g.createRadialGradient(0,0,0,0,0,r);fill.addColorStop(0,inner);fill.addColorStop(g===x?1:.45,inner);if(g===y)fill.addColorStop(1,'rgba(255,255,255,0)');
   g.save();g.globalAlpha=g===x?1:alpha;g.translate(px,py);g.rotate(rand()*3.14);g.scale(1,squash);g.fillStyle=fill;g.beginPath();g.arc(0,0,r,0,6.2832);g.fill();g.restore();
  }
 };
 const tones=['#55703a','#4b6636','#93a257','#a8a468','#6a8443','#8a9a4c'];
 for(let k=0;k<150;k++)blot(rand()*S,rand()*S,(7+rand()*24)*m,tones[k%tones.length],.2+rand()*.3,.45+rand()*.55);
 blot(lawn[0]*m,lawn[1]*m,lawn[2]*m,'#7c984a',.36,lawn[3]);
 for(let k=0;k<90;k++)blot(rand()*S,rand()*S,(2+rand()*5)*m,tones[(k+2)%tones.length],.16+rand()*.2,.5+rand()*.5);
 const rim=y.createRadialGradient(S/2,S/2,S*.3,S/2,S/2,S*.5);rim.addColorStop(0,'rgba(0,0,0,0)');rim.addColorStop(1,'#000');y.globalAlpha=1;y.fillStyle=rim;y.fillRect(0,0,S,S);
 return cutout(c,a,renderer);
}

// The soft shade under a tree that is too far away to cast a real shadow.
export function shade(renderer){
 const [a,y]=sheet(128,128),fill=y.createRadialGradient(64,64,0,64,64,64);
 y.fillStyle='#000';y.fillRect(0,0,128,128);fill.addColorStop(0,'#fff');fill.addColorStop(.45,'rgba(255,255,255,.75)');fill.addColorStop(1,'rgba(255,255,255,0)');y.fillStyle=fill;y.fillRect(0,0,128,128);
 const alphaMap=texture(a,renderer,false);alphaMap.wrapS=alphaMap.wrapT=THREE.ClampToEdgeWrapping;return alphaMap;
}
