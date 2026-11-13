// Scanned things on the Yumin furniture: three ceramics among the glass of 제1전시실 and cups on the lounge tables.
// They are Google Scanned Objects (CC BY 4.0), loaded after the building stands and shown at their scanned size.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {releaseProp} from './interior-props.mjs';

const BASE='/pages/guardhouse-classroom/education/props-yumin/';
// Where each one stands: the furniture it sits on, an offset across its top in metres, and a turn.
const SPOTS={
 'plinth-ne-1':[['deep-bowl',0,0,.4]],
 'plinth-ne-6':[['urn',0,0,1.1]],
 'plinth-ne-8':[['footed-bowl',0,0,2.3]],
 'table-1':[['mug-yellow',.14,.1,2.6],['bowl-small',-.16,-.08,0]],
 'table-2':[['mug-blue',-.12,.12,1.2],['mug-yellow',.16,-.06,4.1]],
 'table-3':[['mug-blue',.1,-.14,5.2]]
};
export const holdsProp=id=>!!SPOTS[id];

export function createPropShelf(cut,{renderer,onReady}){
 const spots=[],state={disposed:false,controller:new AbortController()},models=[];
 // Remembered while the furniture is dressed; filled once the files are in.
 function place(mesh,frame){const list=SPOTS[mesh.userData.id];if(list)for(const [slug,dx,dz,turn] of list)spots.push({mesh,frame,slug,dx,dz,turn});}
 async function load(){
  const slugs=[...new Set(spots.map(s=>s.slug))],loader=new GLTFLoader();
  loader.register(parser=>{parser.textureLoader=new THREE.TextureLoader(parser.options.manager);return {name:'DOMImageTextures'};});
  const timer=setTimeout(()=>state.controller.abort(),20000);
  const loaded=await Promise.allSettled(slugs.map(async slug=>{const r=await fetch(BASE+slug+'.glb',{signal:state.controller.signal});if(!r.ok)throw Error(slug+' '+r.status);return [slug,(await loader.parseAsync(await r.arrayBuffer(),BASE)).scene];}));
  clearTimeout(timer);
  const found=new Map(loaded.filter(r=>r.status==='fulfilled').map(r=>r.value));
  if(state.disposed){found.forEach(releaseProp);return;}
  const aniso=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  for(const g of found.values())g.traverse(m=>{if(m.isMesh){cut(m.material);m.material.envMapIntensity=.7;if(m.material.map)m.material.map.anisotropy=aniso;}});
  for(const s of spots){
   const source=found.get(s.slug);if(!source)continue;
   const g=source.clone(),b=new THREE.Box3().setFromObject(g),c=b.getCenter(new THREE.Vector3()),{turn,x,y,z,h}=s.frame;
   g.position.set(-c.x,-b.min.y,-c.z);const spin=new THREE.Group();spin.rotation.y=s.turn;spin.add(g);
   const at=new THREE.Group();at.rotation.y=turn;at.position.set(x,y,z);spin.position.set(s.dx,h+.012,s.dz);at.add(spin);
   at.traverse(o=>{o.userData=s.mesh.userData;if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});s.mesh.add(at);models.push(at);
  }
  models.push(...found.values());onReady?.(found.size,slugs.length);
 }
 return {place,load,dispose(){if(state.disposed)return;state.disposed=true;state.controller.abort();models.forEach(releaseProp);models.length=0;}};
}
