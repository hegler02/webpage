import * as THREE from 'three';

// The first picture after the lights, the cut planes or the drawing target change needs a new shader for every material.
// Drawn straight away, the driver builds them one after another and the whole page stands still for seconds.
// The gate asks for those shaders ahead of the picture, lets the driver build them beside the page, and says when the picture can be drawn without a stall.
const LIGHTS=['isDirectionalLight','isPointLight','isSpotLight','isHemisphereLight','isRectAreaLight','isLightProbe'];
const MAPS=['map','normalMap','roughnessMap','metalnessMap','emissiveMap','alphaMap','aoMap','bumpMap','lightMap','envMap'];
const drawn=o=>o.isMesh||o.isLine||o.isPoints||o.isSprite;

export class ProgramGate {
 constructor(renderer,{host=null,onChange=null,limit=8000}={}){
  this.renderer=renderer;this.host=host;this.onChange=onChange;this.limit=limit;this.known=new Map();this.pending=null;this.since=0;this.runs=0;this.waited=0;
  // Without background building there is nothing to wait for: the picture is drawn as it always was.
  this.off=!!renderer.noGPU||typeof renderer.compile!=='function'||!renderer.info?.programs||!renderer.extensions?.has('KHR_parallel_shader_compile');
 }
 get busy(){return !!this.pending;}
 settle(){return this.pending??Promise.resolve();}

 // Everything outside the material that the shader text depends on; the things to be drawn are gathered on the same walk.
 surroundings(scene,camera,buffered,items){
  const r=this.renderer,n=[0,0,0,0,0,0,0,0,0];
  scene.traverseVisible(o=>{
   if(o.isLight){if(o.layers.test(camera.layers))for(let i=0;i<6;i++)if(o[LIGHTS[i]]){n[i]++;if(i<3&&o.castShadow)n[6+i]++;}}
   else if(o.material&&drawn(o)&&o.layers.test(camera.layers))items.push(o);
  });
  const e=scene.environment,f=scene.fog;
  return [buffered?'buffer':'screen'+r.toneMapping+r.outputColorSpace,n.join('.'),e?e.mapping+'/'+(e.image?.height??0):0,f?f.isFogExp2?2:1:0,r.shadowMap.enabled?r.shadowMap.type:-1,r.clippingPlanes.length,r.localClippingEnabled?1:0].join('|');
 }
 // What of the material and its object changes the shader. The material's version is left out on purpose: see-through two-sided materials raise it on every frame.
 code(o,m,local){
  const planes=local&&m.clippingPlanes?Math.min(m.clippingPlanes.length,15):0;
  let c=planes*2+(planes&&m.clipIntersection?1:0);
  c=c*2+(m.transparent?1:0);c=c*4+m.side;c=c*8+Math.min(m.blending,7);
  for(let i=0;i<MAPS.length;i++)c=c*2+(m[MAPS[i]]?1:0);
  c=c*2+(m.vertexColors?1:0);c=c*2+(m.flatShading?1:0);c=c*2+(m.alphaTest>0?1:0);c=c*2+(m.fog?1:0);c=c*2+(m.toneMapped?1:0);
  c=c*2+(m.transmission>0?1:0);c=c*2+(m.clearcoat>0?1:0);c=c*2+(o.isInstancedMesh?1:0);c=c*2+(o.instanceColor?1:0);c=c*2+(o.isSkinnedMesh?1:0);
  return c;
 }
 // True when every shader this picture needs is already built. Otherwise the missing ones are asked for and the caller keeps the picture it has.
 check(scene,camera,buffered=false){
  if(this.off)return true;if(this.pending)return false;
  const items=[],key=this.surroundings(scene,camera,buffered,items),local=this.renderer.localClippingEnabled;
  let seen=this.known.get(key);if(!seen)this.known.set(key,seen=new WeakMap());
  let missing=null,asked=null;
  const look=(o,m)=>{
   if(!m||m.visible===false)return;const c=this.code(o,m,local);if(seen.get(m)?.has(c))return;
   asked??=new Map();let a=asked.get(m);if(!a)asked.set(m,a=new Set());if(a.has(c))return;a.add(c);(missing??=[]).push([o,m,c]);
  };
  for(const o of items){const m=o.material;if(Array.isArray(m))for(const one of m)look(o,one);else look(o,m);}
  if(!missing){this.since=0;return true;}
  const now=performance.now();if(!this.since)this.since=now;
  // A scene that keeps changing under the gate is drawn the old way rather than left waiting.
  if(now-this.since>this.limit){this.mark(seen,missing);this.since=0;return true;}
  this.warm(scene,camera,buffered,seen,missing);return false;
 }
 mark(seen,missing){for(const [,m,c] of missing){let s=seen.get(m);if(!s)seen.set(m,s=new Set());s.add(c);}}
 flag(on){this.onChange?.(on);const h=this.host;if(!h)return;if(on)h.dataset.busy='shader';else delete h.dataset.busy;}

 // The cut-plane count a shader is built for is whatever the last drawn object left behind, so one empty triangle with the same planes is drawn first, into a buffer of one pixel.
 prime(count,intersect,camera){
  const r=this.renderer;let p=this.primer;
  if(!p){
   const mesh=new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(9),3)),new THREE.RawShaderMaterial({vertexShader:'void main(){gl_Position=vec4(0.);}',fragmentShader:'precision mediump float;void main(){gl_FragColor=vec4(0.);}'}));
   mesh.frustumCulled=false;const scene=new THREE.Scene();scene.add(mesh);p=this.primer={scene,mesh,target:new THREE.WebGLRenderTarget(1,1),planes:[]};
  }
  while(p.planes.length<count)p.planes.push(new THREE.Plane(new THREE.Vector3(0,1,0),1e9));
  p.mesh.material.clippingPlanes=count?p.planes.slice(0,count):null;p.mesh.material.clipIntersection=!!intersect;
  r.setRenderTarget(p.target);r.render(p.scene,camera);
 }
 warm(scene,camera,buffered,seen,missing){
  const r=this.renderer,local=r.localClippingEnabled,groups=new Map(),started=performance.now();
  for(const [o,m] of missing){
   const planes=local&&m.clippingPlanes?m.clippingPlanes.length:0,k=planes*2+(planes&&m.clipIntersection?1:0);
   let g=groups.get(k);if(!g)groups.set(k,g=[]);g.push(Array.isArray(o.material)?Object.create(o,{material:{value:m}}):o);
  }
  const back=[r.getRenderTarget(),r.getActiveCubeFace(),r.getActiveMipmapLevel()];
  try{
   for(const [k,list] of groups){
    this.prime(k>>1,k&1,camera);r.setRenderTarget(buffered?this.primer.target:null);
    r.compile({traverse(f){for(const o of list)f(o);},traverseVisible(){}},camera,scene);
   }
  }catch(error){console.warn('shader warm-up skipped',error);}
  finally{r.setRenderTarget(...back);}
  this.runs++;
  this.pending=new Promise(resolve=>{
   const poll=()=>{
    let ready=true;try{for(const p of r.info.programs)if(!p.isReady()){ready=false;break;}}catch{ready=true;}
    if(!ready&&!this.disposed&&performance.now()-started<this.limit){setTimeout(poll,16);return;}
    this.mark(seen,missing);this.pending=null;this.waited+=performance.now()-started;this.flag(false);resolve();
   };
   setTimeout(poll,0);
  });
  this.flag(true);
 }
 dispose(){this.disposed=true;const p=this.primer;if(p){p.target.dispose();p.mesh.geometry.dispose();p.mesh.material.dispose();this.primer=null;}if(this.host)delete this.host.dataset.busy;}
}
