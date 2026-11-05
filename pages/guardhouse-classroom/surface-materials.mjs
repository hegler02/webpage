import * as THREE from 'three';
import {surfaceAtlasCache} from './surface-cache.mjs';
import {drawSurface,surfaceKinds,surfaceSize} from './surface-recipe.mjs';

// Reuse the versioned atlas; procedural maps remain a recoverable offline fallback.
export class SurfaceLibrary {
 static prepare(){return surfaceAtlasCache.prepare();}
 constructor(renderer){this.renderer=renderer;this.cache=new Map();this.cachedMaps=0;this.generatedMaps=0;}
 maps(kind){
  if(this.cache.has(kind))return this.cache.get(kind);
  let pair;
  const atlas=surfaceAtlasCache.image,index=surfaceKinds.indexOf(kind);
  if(atlas&&index>=0){
   pair=[0,1].map(row=>{const c=document.createElement('canvas');c.width=c.height=surfaceSize;c.getContext('2d').drawImage(atlas,index*surfaceSize,row*surfaceSize,surfaceSize,surfaceSize,0,0,surfaceSize,surfaceSize);return c;});
   this.cachedMaps++;
  }else{pair=drawSurface(kind);this.generatedMaps++;}
  const [canvas,height]=pair;
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
