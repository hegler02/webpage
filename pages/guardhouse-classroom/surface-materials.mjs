import * as THREE from 'three';

// Small, deterministic, locally generated PBR maps; no texture downloads on entry.
export class SurfaceLibrary {
 constructor(renderer){this.renderer=renderer;this.cache=new Map();}
 maps(kind){
  if(this.cache.has(kind))return this.cache.get(kind);
  const size=512,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  const g=canvas.getContext('2d'),height=document.createElement('canvas');height.width=height.height=size;const h=height.getContext('2d');
  let seed=903;const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
  const bases={plaster:'#ece8df',concrete:'#b8b7ae',wood:'#bea07a',tile:'#dedbd4',brick:'#b48068',marble:'#deddd7'};
  g.fillStyle=bases[kind]??bases.plaster;g.fillRect(0,0,size,size);h.fillStyle='#b4b4b4';h.fillRect(0,0,size,size);
  for(let i=0;i<22000;i++){const x=rand()*size,y=rand()*size,v=rand();g.fillStyle=`rgba(${v>.5?'255,255,250':'70,65,55'},${.015+rand()*.035})`;g.fillRect(x,y,1+rand()*2,1+rand()*2);h.fillStyle=`rgb(${130+v*100},${130+v*100},${130+v*100})`;h.fillRect(x,y,1,1);}
  if(kind==='wood'){
   for(let row=0;row<4;row++){g.fillStyle=`rgba(75,46,23,${rand()*.09})`;g.fillRect(0,row*128,512,128);g.strokeStyle='#978166';g.lineWidth=1;g.beginPath();g.moveTo(0,row*128);g.lineTo(512,row*128);g.stroke();}
   for(let i=0;i<650;i++){const y=rand()*512;g.strokeStyle=`rgba(65,40,18,${.015+rand()*.07})`;g.lineWidth=.5;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(130,y+Math.sin(y)*5,370,y+Math.cos(y)*4,512,y);g.stroke();}
  }
  if(kind==='tile'||kind==='marble'){
   if(kind==='marble')for(let i=0;i<25;i++){g.strokeStyle=`rgba(105,108,100,${rand()*.12})`;g.lineWidth=rand()*2;g.beginPath();const y=rand()*512;g.moveTo(0,y);g.bezierCurveTo(120,y+100,300,y-120,512,y+35);g.stroke();}
   g.strokeStyle='#b1afa6';g.lineWidth=3;g.strokeRect(0,0,512,512);h.strokeStyle='#303030';h.lineWidth=4;h.strokeRect(0,0,512,512);
  }
  if(kind==='brick'){
   g.fillStyle='#cbc4b7';g.fillRect(0,0,512,512);h.fillStyle='#333';h.fillRect(0,0,512,512);
   for(let r=0;r<8;r++)for(let c=-1;c<4;c++){const x=c*170+(r%2)*85,y=r*64;g.fillStyle=`hsl(${17+rand()*7} 26% ${48+rand()*12}%)`;g.fillRect(x+3,y+3,164,58);h.fillStyle='#c7c7c7';h.fillRect(x+3,y+3,164,58);}
  }
  const map=new THREE.CanvasTexture(canvas),bump=new THREE.CanvasTexture(height);
  for(const t of [map,bump]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());const repeat=kind==='tile'?1/.6:kind==='wood'?1:kind==='brick'?1.5:1;t.repeat.set(repeat,repeat);}
  map.colorSpace=THREE.SRGBColorSpace;
  const maps={map,bumpMap:bump,bumpScale:kind==='brick'?.004:kind==='tile'?.0015:.0007,roughness:kind==='wood'?.55:kind==='marble'?.36:kind==='tile'?.56:.88};this.cache.set(kind,maps);return maps;
 }
 apply(material,kind,color=0xffffff){Object.assign(material,this.maps(kind));material.color.set(color);material.needsUpdate=true;}
 dispose(){for(const m of this.cache.values()){m.map.dispose();m.bumpMap.dispose();}this.cache.clear();}
}

export function worldUV(geometry){
 const p=geometry.attributes.position,n=geometry.attributes.normal,uv=[];
 for(let i=0;i<p.count;i++){const x=Math.abs(n.getX(i)),y=Math.abs(n.getY(i)),z=Math.abs(n.getZ(i));uv.push(y>=x&&y>=z?p.getX(i):x>z?-p.getZ(i):p.getX(i),y>=x&&y>=z?-p.getZ(i):p.getY(i));}
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
}
