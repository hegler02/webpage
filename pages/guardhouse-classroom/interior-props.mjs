import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {propPlacements} from '/pages/guardhouse-classroom/src/interior-props.mjs';
const V=p=>new THREE.Vector3(p[0],p[2],-p[1]);
export function releaseProp(object){const geo=new Set(),mat=new Set(),tex=new Set();object?.traverse(o=>{if(o.geometry)geo.add(o.geometry);for(const m of o.material?Array.isArray(o.material)?o.material:[o.material]:[]){mat.add(m);for(const [k,v]of Object.entries(m))if(v?.isTexture&&k!=='envMap')tex.add(v);}});geo.forEach(x=>x.dispose());mat.forEach(x=>x.dispose());tex.forEach(x=>{x.dispose();x.source?.data?.close?.();});object?.removeFromParent();}
export class InteriorProps{
 constructor(view){this.view=view;this.group=new THREE.Group();view.scene.add(this.group);this.items=propPlacements(view.project.id);this.models=new Map();this.state='idle';this.token=0;this.disposed=false;
  this.sync();this.load();
 }
 async load(){if(this.state==='loading'||this.disposed)return;this.state='loading';this.readout();const token=++this.token;this.controller=new AbortController();const timer=setTimeout(()=>this.controller.abort(),20000);const loader=new GLTFLoader();loader.register(parser=>{parser.textureLoader=new THREE.TextureLoader(parser.options.manager);return {name:'DOMImageTextures'};});
  const results=await Promise.allSettled(this.items.map(async p=>{const r=await fetch('/pages/guardhouse-classroom/education/props-study/'+p.id+'-0.glb',{signal:this.controller.signal});if(!r.ok)throw Error('소품 응답 '+r.status);const data=await r.arrayBuffer(),g=(await loader.parseAsync(data,'/pages/guardhouse-classroom/education/props-study/')).scene;let missing=false;g.traverse(m=>{if(m.isMesh&&!m.material?.map)missing=true;});if(missing){releaseProp(g);throw Error('소품 표면을 읽지 못했습니다.');}return {p,g};}));clearTimeout(timer);
  if(this.disposed||token!==this.token){results.forEach(r=>{if(r.status==='fulfilled')releaseProp(r.value.g);});return;}
  const failure=results.find(r=>r.status==='rejected');if(failure){results.forEach(r=>{if(r.status==='fulfilled')releaseProp(r.value.g);});this.state='error';this.readout();return;}
  this.models.forEach(releaseProp);this.models.clear();for(const r of results){const {p,g}=r.value,b=new THREE.Box3().setFromObject(g),size=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3()),s=p.height/size.y;g.scale.multiplyScalar(s);g.position.set(-center.x*s,-b.min.y*s,-center.z*s);const anchor=new THREE.Group();anchor.position.copy(V(p.pos));anchor.rotation.y=p.rotation;anchor.add(g);anchor.userData={id:'prop-'+p.id,kind:'prop',name:p.name};g.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;m.userData=anchor.userData;m.material.envMapIntensity=.6;if(m.material.map)m.material.map.anisotropy=Math.min(4,this.view.renderer.capabilities.getMaxAnisotropy());}});this.group.add(anchor);this.models.set(p.id,anchor);}
  this.state='ready';this.view.renderer.shadowMap.needsUpdate=true;this.sync();this.readout();
 }
 readout(){this.view.host.dataset.propsState=this.state;this.view.host.dataset.propsCount=String(this.models.size);}
 sync(){const v=this.view;const visible=v.realistic&&['experience','interior','exterior','fire'].includes(v.mode)&&v.filter==='all';if(this.group.visible!==visible&&v.renderer.shadowMap)v.renderer.shadowMap.needsUpdate=true;this.group.visible=visible;}
 dispose(){if(this.disposed)return;this.disposed=true;this.token++;this.controller?.abort();this.models.forEach(releaseProp);this.models.clear();this.group.removeFromParent();}
}
