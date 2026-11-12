import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {handBack} from './render-loop.mjs';

// The first picture after the lights, the cut planes or the drawing target change needs a new shader for every material.
// Drawn straight away, the driver builds them one after another and the whole page stands still for seconds.
// The gate asks for those shaders ahead of the picture, lets the driver build them beside the page, and says when the picture can be drawn without a stall.
const LIGHTS=['isDirectionalLight','isPointLight','isSpotLight','isHemisphereLight','isRectAreaLight','isLightProbe'];
const MAPS=['map','normalMap','roughnessMap','metalnessMap','emissiveMap','alphaMap','aoMap','bumpMap','lightMap','envMap'];
const drawn=o=>o.isMesh||o.isLine||o.isPoints||o.isSprite;
// Milliseconds of shader work done in one go before the thread goes back to the page.
const SLICE=8;
// How many shaders may be in the making at once. The graphics process builds them on every core it finds. Measured with no limit, about one first picture in eight stopped the page for a quarter of a second, in a memory clean-up that ran while all cores were taken; held to half the cores, none did.
const ATONCE=Math.max(2,Math.floor((navigator.hardwareConcurrency||4)/2));

// A call that asks the graphics process a question holds the page until that process has worked through everything it was sent, the textures of a long build among them. This waits for it with the page left free.
export async function graphicsIdle(renderer,limit=1500){
 const gl=renderer.noGPU?null:renderer.getContext?.();if(!gl?.fenceSync)return;
 const mark=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0),until=performance.now()+limit;gl.flush();
 while(!gl.isContextLost()&&gl.getSyncParameter(mark,gl.SYNC_STATUS)!==gl.SIGNALED&&performance.now()<until)await(document.hidden?handBack():new Promise(done=>setTimeout(done,8)));
 gl.deleteSync(mark);
}
// The room that surfaces reflect is drawn once into a small cube. Its shaders are asked for first and built beside the page, so drawing it does not stop the page either.
// It comes in two steps for a view that must have the cube the moment it is asked: `ready` tells when the shaders are built, `make` draws the cube, and `drop` lets go of one that was never drawn.
export function roomAhead(renderer,blur=.04){
 const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),spare=[];let ready=Promise.resolve();
 if(!renderer.noGPU&&renderer.extensions?.has('KHR_parallel_shader_compile')){
  // The cube is drawn into a buffer without tone mapping, and a shader is built for exactly that.
  const target=new THREE.WebGLRenderTarget(1,1),back=[renderer.getRenderTarget(),renderer.getActiveCubeFace(),renderer.getActiveMipmapLevel()],tone=renderer.toneMapping;
  // The generator has two shaders of its own, the backdrop of the cube and the blur. They are asked for with the room's; three keeps the blur to itself, so it is reached only where this build still holds it there.
  const own=new THREE.Group(),backdrop=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false}));
  own.add(backdrop);spare.push(backdrop.geometry,backdrop.material);
  try{generator._setSize(256);spare.push(generator._allocateTargets());if(generator._blurMaterial&&generator._lodPlanes?.[0])own.add(new THREE.Mesh(generator._lodPlanes[0],generator._blurMaterial));}catch{}
  let built=null;
  try{renderer.toneMapping=THREE.NoToneMapping;renderer.setRenderTarget(target);const camera=new THREE.PerspectiveCamera(90,1,.1,100);built=Promise.all([renderer.compileAsync(room,camera),renderer.compileAsync(own,camera)]);}
  catch(error){console.warn('shader warm-up skipped',error);}
  finally{renderer.setRenderTarget(...back);renderer.toneMapping=tone;}
  ready=Promise.resolve(built).catch(()=>{}).then(()=>target.dispose());
 }
 // Three keeps asking the materials whether their shaders are built, so they are let go only after it has its answer.
 const drop=()=>ready.then(()=>{generator.dispose();room.dispose();for(const item of spare)item.dispose();});
 return {ready,drop,make(){const env=generator.fromScene(room,blur);drop();return env;}};
}
export async function roomLight(renderer,blur=.04){const ahead=roomAhead(renderer,blur);await ahead.ready;return ahead.make();}

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
  const r=this.renderer,local=r.localClippingEnabled,work=[],started=performance.now();
  for(const [o,m] of missing){
   const planes=local&&m.clippingPlanes?m.clippingPlanes.length:0;
   work.push([planes*2+(planes&&m.clipIntersection?1:0),Array.isArray(o.material)?Object.create(o,{material:{value:m}}):o]);
  }
  work.sort((a,b)=>a[0]-b[0]);
  let at=0;
  // Writing out the text of a shader is work of this thread, so they are asked for a few at a time. The drawing target is put back after every go, because the page may draw in between.
  const ask=()=>{
   const until=performance.now()+SLICE,back=[r.getRenderTarget(),r.getActiveCubeFace(),r.getActiveMipmapLevel()];
   try{
    for(let primed=-1;at<work.length&&performance.now()<until;){
     const k=work[at][0],list=[];while(at<work.length&&work[at][0]===k&&list.length<2)list.push(work[at++][1]);
     if(k!==primed){this.prime(k>>1,k&1,camera);r.setRenderTarget(buffered?this.primer.target:null);primed=k;}
     r.compile({traverse(f){for(const o of list)f(o);},traverseVisible(){}},camera,scene);
    }
   }catch(error){console.warn('shader warm-up skipped',error);at=work.length;}
   finally{r.setRenderTarget(...back);}
  };
  const built=()=>this.built();
  this.runs++;
  this.pending=(async()=>{
   try{
    await handBack();
    while(at<work.length&&!this.disposed){
     for(const from=performance.now();this.making()>ATONCE&&!this.disposed&&performance.now()-from<this.limit;)await new Promise(next=>setTimeout(next,8));
     ask();await handBack();
    }
    while(!this.disposed&&!built()&&performance.now()-started<this.limit)await new Promise(next=>setTimeout(next,16));
    // Textures go once the shaders are built, when the graphics process has nothing else to do.
    await this.send(missing);
    await this.open();
   }catch(error){console.warn('shader warm-up skipped',error);}
   this.mark(seen,missing);this.pending=null;this.waited+=performance.now()-started;this.flag(false);
  })();
  this.flag(true);
 }
 // A texture goes to the graphics card when it is first drawn, and a new picture brings many at once. They are sent here instead, one at a time with the page free in between.
 async send(missing){
  const r=this.renderer,sent=this.sent??=new WeakSet();if(typeof r.initTexture!=='function')return;
  for(const [,m] of missing)for(const k of MAPS){
   const t=m[k],i=t?.image;if(!t?.isTexture||!i||sent.has(t)||!t.version||t.isRenderTargetTexture||t.isCubeTexture||i.complete===false)continue;
   sent.add(t);r.initTexture(t);await handBack();if(this.disposed)return;
  }
  // The first picture also measures every new shape to tell whether it is in view; that is done here too.
  let until=performance.now()+SLICE;
  for(const [o] of missing){
   const g=o.geometry;if(g?.attributes?.position&&!g.boundingSphere)g.computeBoundingSphere();
   if(performance.now()>until){await handBack();if(this.disposed)return;until=performance.now()+SLICE;}
  }
 }
 making(){let n=0;try{for(const p of this.renderer.info.programs)if(!p.isReady())n++;}catch{}return n;}
 built(){return !this.making();}
 // A built shader is opened the first time it is used: its inputs are read back from the driver, one slow question at a time. That is done here rather than inside the first picture.
 async open(){
  if(this.disposed||!this.built())return;
  let until=performance.now()+SLICE;
  for(const p of [...this.renderer.info.programs]){
   if(p.program&&p.isReady())p.getUniforms();
   if(performance.now()>until){await handBack();if(this.disposed)break;until=performance.now()+SLICE;}
  }
 }
 // Shaders that sit on no object of the scene: those of the passes laid over the picture, and one material drawn in place of all the others.
 // They are built for a buffer, with no cut planes, and waited for beside the page. `takes` says which objects the stand-in material is drawn on.
 async extras(scene,camera,flat=[],over=null,takes=()=>true){
  if(this.off||this.disposed)return;
  const r=this.renderer,started=performance.now(),quad=new THREE.PlaneGeometry(2,2),work=flat.filter(Boolean).map(m=>[null,new THREE.Mesh(quad,m)]);
  if(over){
   // One object stands for all that share what the shader text depends on.
   const kinds=new Set();
   scene.traverseVisible(o=>{
    if(!o.isMesh||!takes(o))return;
    const g=o.geometry,a=g?.attributes??{},k=[!!o.isInstancedMesh,!!o.instanceColor,!!o.isSkinnedMesh,!!a.uv1,!!a.uv2,!!a.uv3,!!g?.morphAttributes?.position].join();
    if(!kinds.has(k)){kinds.add(k);work.push([scene,Object.create(o,{material:{value:over}})]);}
   });
  }
  try{
   for(const [lit,o] of work){
    if(this.disposed)break;
    const back=[r.getRenderTarget(),r.getActiveCubeFace(),r.getActiveMipmapLevel()],one={traverse(f){f(o);},traverseVisible(){}};
    try{this.prime(0,0,camera);r.setRenderTarget(this.primer.target);r.compile(one,camera,lit??one);}
    finally{r.setRenderTarget(...back);}
    await handBack();
   }
   while(!this.disposed&&!this.built()&&performance.now()-started<this.limit)await new Promise(next=>setTimeout(next,16));
   await this.open();
  }catch(error){console.warn('shader warm-up skipped',error);}
  quad.dispose();
 }
 dispose(){this.disposed=true;const p=this.primer;if(p){p.target.dispose();p.mesh.geometry.dispose();p.mesh.material.dispose();this.primer=null;}if(this.host)delete this.host.dataset.busy;}
}
