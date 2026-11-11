// Shared look for realistic outdoor scenes: sky, sun colour, exposure, corner shade, glass and trees.
// Studio pages, drawing views and screens without WebGL keep the plain renderer path.
import * as THREE from 'three';
import {Sky} from 'three/addons/objects/Sky.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const LOOK={
 day:{sun:2.7,ambient:.12,ambientIndoor:.4,env:.62,envIndoor:.5,exposure:1,exposureIndoor:1.15,skyGain:.4,skyRich:1.35,envGain:.55,envRich:.6,turbidity:2,rayleigh:1,mie:.004,mieG:.8},
 shade:{radius:.45,distanceExponent:1.4,thickness:1.2,scale:1.15,samples:12,blend:.9},
 glass:{body:.5,boost:1,cap:60,capDayInside:.04,roughness:.05,tint:0x8fa6aa,outside:.55,inside:.92},
 grass:0x6f8a50,
 camera:[8.6,3.6,11.2],
 fade:[45,76]
};

// 'light' on phones and small or low-memory devices: sky, sun and glass stay, corner shade is left out.
export function qualityTier(){
 const coarse=matchMedia('(pointer:coarse)').matches,small=Math.min(screen.width,screen.height)<700;
 return coarse||small||(navigator.deviceMemory??8)<4?'light':'full';
}

const swap=(text,from,to)=>{if(!text.includes(from))console.warn('scene-quality: shader text not found:',from);return text.replace(from,to);};
const lerp=(a,b,t)=>a+(b-a)*Math.max(0,Math.min(1,t));
function daySky(){
 const sky=new Sky();sky.scale.setScalar(1000);sky.frustumCulled=false;sky.raycast=()=>{};const m=sky.material;
 m.uniforms.uGain={value:1};m.uniforms.uDisk={value:1};m.uniforms.uRich={value:1};
 let f=m.fragmentShader;
 f=swap(f,'uniform vec3 up;','uniform vec3 up;\n\t\tuniform float uGain;\n\t\tuniform float uDisk;\n\t\tuniform float uRich;');
 f=swap(f,'* sundisk;','* sundisk * uDisk;');
 f=swap(f,'gl_FragColor = vec4( retColor, 1.0 );','retColor = max( mix( vec3( dot( retColor, vec3( 0.2126, 0.7152, 0.0722 ) ) ), retColor, uRich ), 0.0 );\n\t\t\tgl_FragColor = vec4( min( retColor * uGain, vec3( 60.0 ) ), 1.0 );');
 m.fragmentShader=f;return sky;
}
function nightSky(){
 const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{uZenith:{value:new THREE.Color(0x0a1322)},uHorizon:{value:new THREE.Color(0x1d2c40)}},
  vertexShader:'varying vec3 vDir;void main(){vDir=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}',
  fragmentShader:`varying vec3 vDir;uniform vec3 uZenith;uniform vec3 uHorizon;
   float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
   void main(){vec3 d=normalize(vDir);vec3 c=mix(uHorizon,uZenith,pow(clamp(d.y,0.,1.),.55));
    vec3 g=d*90.,cell=floor(g);float r=hash(cell);
    float star=step(.986,r)*smoothstep(.16,0.,length(fract(g)-.5))*smoothstep(.04,.3,d.y);
    c+=vec3(.86,.92,1.)*star*(.35+.65*hash(cell+7.));
    gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`});
 const dome=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),m);dome.scale.setScalar(100);dome.frustumCulled=false;dome.raycast=()=>{};return dome;
}

export class SceneLook {
 constructor(view){
  this.view=view;this.tier=qualityTier();this.epoch=0;this.key='';this.applied='off';this.glasses=new Set();this.shadeOff=this.tier!=='full';this.frames={sum:0,n:0,slow:0,last:0,from:0};
  this.sky=daySky();this.sky.visible=false;this.dome=nightSky();this.dome.visible=false;view.scene.add(this.sky,this.dome);
  this.glassUniforms={on:{value:0},body:{value:LOOK.glass.body},boost:{value:LOOK.glass.boost},cap:{value:LOOK.glass.cap},direct:{value:1},through:{value:1}};
  this.fade={value:new THREE.Vector4(0,0,LOOK.fade[0],0)};
  const s=view.sun.shadow;this.shadowBox={left:s.camera.left,right:s.camera.right,top:s.camera.top,bottom:s.camera.bottom,near:s.camera.near,far:s.camera.far};
  if(this.tier==='full')s.mapSize.set(4096,4096);
  // The ground fades out toward the horizon so its edge never shows against the sky.
  const g=view.ground.material;view.ground.userData.aoKeep=true;view.ground.renderOrder=-1;
  g.onBeforeCompile=sh=>{sh.uniforms.uFade=this.fade;
   sh.vertexShader=swap(swap(sh.vertexShader,'#include <common>','#include <common>\nvarying vec2 vGroundXZ;'),'#include <project_vertex>','#include <project_vertex>\nvGroundXZ=(modelMatrix*vec4(transformed,1.)).xz;');
   sh.fragmentShader=swap(swap(sh.fragmentShader,'#include <common>','#include <common>\nvarying vec2 vGroundXZ;uniform vec4 uFade;'),'#include <opaque_fragment>','#include <opaque_fragment>\nif(uFade.w>0.)gl_FragColor.a*=1.-smoothstep(uFade.z,uFade.w,distance(vGroundXZ,uFade.xy));');};
  g.customProgramCacheKey=()=>'ground-fade';
  view.host.dataset.quality=this.tier;view.host.dataset.ao='off';view.host.dataset.sky='off';
 }
 invalidate(){if(!this.applying)this.epoch++;}

 // Glass reflects more at a shallow angle and lets less through, least of all by day from outside; outside the outdoor look it draws as before.
 glass(material){
  if(this.glasses.has(material))return;this.glasses.add(material);const u=this.glassUniforms;
  material.userData.glass={color:material.color.getHex(),metalness:material.metalness,roughness:material.roughness,side:material.side};
  material.onBeforeCompile=sh=>{sh.uniforms.uGlassOn=u.on;sh.uniforms.uGlassBody=u.body;sh.uniforms.uGlassBoost=u.boost;sh.uniforms.uGlassCap=u.cap;sh.uniforms.uGlassDirect=u.direct;sh.uniforms.uGlassThrough=u.through;
   sh.fragmentShader=swap(swap(sh.fragmentShader,'#include <common>','#include <common>\nuniform float uGlassOn;uniform float uGlassBody;uniform float uGlassBoost;uniform float uGlassCap;uniform float uGlassDirect;uniform float uGlassThrough;'),'#include <opaque_fragment>',
    '#include <opaque_fragment>\nif(uGlassOn>.5){float gF=.04+.96*pow(1.-saturate(dot(geometryViewDir,normal)),5.);float gA=diffuseColor.a*uGlassBody;vec3 gC=min(totalSpecular*uGlassBoost,vec3(uGlassCap))+(outgoingLight-totalSpecular)*gA;if(uGlassDirect>.5)gC*=gC*.6;gl_FragColor=vec4(gC,1.-(1.-gA)*(1.-gF)*uGlassThrough);}');};
  material.customProgramCacheKey=()=>'glass-look-4';
  this.dressGlass(material,this.applied!=='off');
 }
 dressGlass(m,on){
  const o=m.userData.glass,side=on?THREE.FrontSide:o.side;if(m.side!==side){m.side=side;m.needsUpdate=true;}
  m.color.set(on?LOOK.glass.tint:o.color);m.metalness=on?0:o.metalness;m.roughness=on?LOOK.glass.roughness:o.roughness;
  // Colour already carries its own alpha in the outdoor look, so it is added as it is.
  m.blending=on?THREE.CustomBlending:THREE.NormalBlending;m.blendSrc=on?THREE.OneFactor:THREE.SrcAlphaFactor;m.blendDst=THREE.OneMinusSrcAlphaFactor;
 }

 sunDirection(){const s=this.view.sun;return new THREE.Vector3().subVectors(s.position,s.target.position).normalize();}
 state(){
  const v=this.view,on=v.realistic&&!v.studio&&v.ground.visible&&v.active.isPerspectiveCamera;
  if(!on)return 'off';const d=this.sunDirection();
  return [v.night?'night':'day',v.fpv,v.site.visible,v.mode,d.x.toFixed(3),d.y.toFixed(3),d.z.toFixed(3),this.epoch].join('|');
 }
 sync(){
  const key=this.state();if(key===this.key)return;this.key=key;const v=this.view,want=key==='off'?'off':v.night?'night':'day';
  const g=v.ground.material,grass=want!=='off'&&v.site.visible,turf=grass!==!!g.map;
  if(this.applied==='day'&&(want!=='day'||turf))this.restore();
  if(want==='off'&&this.applied!=='off'){Object.assign(v.sun.shadow.camera,this.shadowBox);v.sun.shadow.camera.updateProjectionMatrix();v.renderer.shadowMap.needsUpdate=true;}
  const was=this.applied;this.applied=want;
  this.sky.visible=want==='day';this.dome.visible=want==='night';v.host.dataset.sky=want;
  if((was==='off')!==(want==='off')){
   for(const m of this.glasses)this.dressGlass(m,want!=='off');this.glassUniforms.on.value=want==='off'?0:1;
   g.transparent=want!=='off';g.needsUpdate=true;
  }
  if(turf){g.map=grass?this.grass??=grassTexture(v.renderer):null;g.needsUpdate=true;this.envSun=null;}
  // A project whose whole point is its glass may let more through from outside and reflect less.
  const pane={...LOOK.glass,...v.project.glass};this.glassUniforms.boost.value=pane.boost;
  this.glassUniforms.through.value=want==='day'&&!v.fpv?pane.outside:pane.inside;this.glassUniforms.cap.value=want==='day'&&v.fpv?LOOK.glass.capDayInside:LOOK.glass.cap;
  const fade=v.project.fade??LOOK.fade;this.fade.value.set(v.project.center?.[0]??4.1,-(v.project.center?.[1]??2),fade[0],want==='off'?0:fade[1]);
  if(want==='off')return;
  if(want==='day')this.day();else v.scene.environment=v.environment;
  this.fitShadow();
 }
 // Put back the numbers the view itself sets for this mode.
 restore(){const v=this.view;this.applying=true;v.scene.environment=v.environment;v.setNight(v.night);this.applying=false;}
 day(){
  const v=this.view,p={...LOOK.day,...v.project.day},d=this.sunDirection(),e=THREE.MathUtils.radToDeg(Math.asin(Math.max(-1,Math.min(1,d.y))));
  const warm=e<15?[1,lerp(.62,.86,(e-4)/11),lerp(.38,.68,(e-4)/11)]:[1,lerp(.86,.96,(e-15)/25),lerp(.68,.9,(e-15)/25)];
  const power=Math.max(.15,Math.min(1,Math.sin(THREE.MathUtils.degToRad(Math.max(e,0)))*2.4));
  v.sun.color.setRGB(...warm);v.sun.intensity=p.sun*power;v.ambient.intensity=v.fpv?p.ambientIndoor:p.ambient;if(v.ground.material.map)v.ground.material.color.set(0xffffff);
  v.scene.environmentIntensity=v.fpv?p.envIndoor:p.env;v.renderer.toneMappingExposure=v.fpv?p.exposureIndoor:p.exposure;
  const u=this.sky.material.uniforms;u.turbidity.value=p.turbidity;u.rayleigh.value=p.rayleigh;u.mieCoefficient.value=p.mie;u.mieDirectionalG.value=p.mieG;u.sunPosition.value.copy(d);u.uGain.value=p.skyGain;u.uRich.value=p.skyRich;
  const sun=d.clone();if(!this.envSun||this.envSun.distanceTo(sun)>.002){if(this.envTarget)this.envDue=performance.now()+150;else this.buildEnvironment();this.envSun=sun;}
  // Indoors the room's own surroundings light the surfaces, so the ceiling does not pick up the colour of the grass.
  v.scene.environment=v.fpv||!this.envTarget?v.environment:this.envTarget.texture;
 }
 // Sky light for the whole scene, taken from the same sky without the sun disc; the sun itself is the directional light.
 buildEnvironment(){
  const v=this.view,p=LOOK.day,d=this.sunDirection();this.envDue=0;
  if(!this.envScene){this.pmrem=new THREE.PMREMGenerator(v.renderer);this.envSky=daySky();this.envSky.material.uniforms.uDisk.value=0;
   this.envGround=new THREE.Mesh(new THREE.CircleGeometry(1000,48),new THREE.MeshBasicMaterial());this.envGround.rotation.x=-Math.PI/2;this.envGround.position.y=-1.6;
   this.envScene=new THREE.Scene();this.envScene.add(this.envSky,this.envGround);}
  const u=this.envSky.material.uniforms,s=this.sky.material.uniforms;for(const k of ['turbidity','rayleigh','mieCoefficient','mieDirectionalG'])u[k].value=s[k].value;u.sunPosition.value.copy(d);u.uGain.value=p.envGain;u.uRich.value=p.envRich;
  // Light the ground throws back up: its colour times the sun and sky it receives.
  const lit=v.sun.intensity*Math.max(d.y,0)/Math.PI+.3;const g=v.ground.material;this.envGround.material.color.set(g.map?LOOK.grass:g.color).multiplyScalar(lit);
  // A project may calm the green the grass throws on white soffits: `bounce` is [strength, how much of the colour stays].
  const b=v.project?.day?.bounce;if(b){const c=this.envGround.material.color,grey=(c.r+c.g+c.b)/3;c.setRGB(grey+(c.r-grey)*b[1],grey+(c.g-grey)*b[1],grey+(c.b-grey)*b[1]).multiplyScalar(b[0]);}
  const old=this.envTarget;this.envTarget=this.pmrem.fromScene(this.envScene,0,.1,2000);old?.dispose();
  if(this.applied==='day'&&!v.fpv)v.scene.environment=this.envTarget.texture;v.renderer.shadowMap.needsUpdate=true;
 }
 // Shadow area just large enough for everything that casts a shadow, so the map is spent on the building.
 fitShadow(){
  const v=this.view,cam=v.sun.shadow.camera,box=new THREE.Box3();if(v.base)box.expandByObject(v.base);
  if(v.site.visible)for(const o of v.site.children)if(o.castShadow)box.expandByObject(o);
  if(box.isEmpty())return;box.min.y=Math.max(box.min.y,v.project.shadowFloor??-1);
  const d=this.sunDirection(),pts=[];
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new THREE.Vector3(x,y,z);pts.push(p);
   if(y===box.max.y&&d.y>.01)pts.push(p.clone().addScaledVector(d,-Math.min((y+.3)/d.y,v.project.shadowReach??20)));}
  v.sun.updateMatrixWorld();v.sun.target.updateMatrixWorld();cam.position.setFromMatrixPosition(v.sun.matrixWorld);cam.lookAt(new THREE.Vector3().setFromMatrixPosition(v.sun.target.matrixWorld));cam.updateMatrixWorld();
  const inv=cam.matrixWorld.clone().invert(),b=new THREE.Box3();for(const p of pts)b.expandByPoint(p.applyMatrix4(inv));
  Object.assign(cam,{left:b.min.x-.6,right:b.max.x+.6,bottom:b.min.y-.6,top:b.max.y+.6,near:-b.max.z-1,far:-b.min.z+1});cam.updateProjectionMatrix();v.renderer.shadowMap.needsUpdate=true;
 }

 // Things that must stay out of the shade buffer: lines, labels, glass, faded walls and the skies.
 skips(o){
  if(o.isPoints||o.isLine||o.isLine2||o.isSprite||o===this.sky||o===this.dome)return true;
  if(!o.isMesh||o.userData.aoKeep)return false;if(o.userData.detailReplacement||o.userData.aoSkip)return true;
  for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.transparent||m.depthWrite===false||m.visible===false)return true;
  return false;
 }
 async loadShade(){
  this.shadePending=true;const j='three/addons/postprocessing/';
  const [{EffectComposer},{RenderPass},{GTAOPass},{OutputPass}]=await Promise.all([import(j+'EffectComposer.js'),import(j+'RenderPass.js'),import(j+'GTAOPass.js'),import(j+'OutputPass.js')]);
  if(this.disposed||this.shadeOff)return;const look=this,v=this.view,r=v.renderer;
  class ShadePass extends GTAOPass {
   // Shade is worked out at CSS-pixel size and laid over the full-size picture.
   setSize(w,h){const k=look.pixelRatio||1;super.setSize(Math.max(1,Math.round(w/k)),Math.max(1,Math.round(h/k)));}
   // Layers hide one object without hiding its children.
   _overrideVisibility(){const hidden=look.hidden=[];this.scene.traverse(o=>{if(look.skips(o)){hidden.push(o,o.layers.mask);o.layers.mask=0;}});}
   _restoreVisibility(){const hidden=look.hidden;for(let i=0;i<hidden.length;i+=2)hidden[i].layers.mask=hidden[i+1];hidden.length=0;}
   render(renderer,...rest){const s=renderer.shadowMap,auto=s.autoUpdate,need=s.needsUpdate;s.autoUpdate=false;s.needsUpdate=false;super.render(renderer,...rest);s.autoUpdate=auto;s.needsUpdate=need;}
  }
  const size=r.getSize(new THREE.Vector2());this.pixelRatio=r.getPixelRatio();
  const composer=new EffectComposer(r,new THREE.WebGLRenderTarget(size.x,size.y,{type:THREE.HalfFloatType,samples:4}));composer.setPixelRatio(this.pixelRatio);composer.setSize(size.x,size.y);
  const shade=new ShadePass(v.scene,v.camera,size.x,size.y),output=new OutputPass(),p=LOOK.shade;
  shade.updateGtaoMaterial({radius:p.radius,distanceExponent:p.distanceExponent,thickness:p.thickness,scale:p.scale,samples:p.samples});shade.blendIntensity=p.blend;
  composer.addPass(new RenderPass(v.scene,v.camera));composer.addPass(shade);composer.addPass(output);
  this.composer=composer;this.shade=shade;this.passes=[shade,output];this.size=[size.x,size.y];this.frames.from=performance.now()+2000;
 }
 dropShade(){this.shadeOff=true;this.passes?.forEach(p=>p.dispose());this.composer?.renderTarget1.dispose();this.composer?.renderTarget2.dispose();this.composer?.dispose();this.composer=this.shade=this.passes=null;}
 // Two slow stretches in a row turn corner shade off for the rest of the visit.
 measure(){
  const f=this.frames,now=performance.now(),dt=now-f.last;f.last=now;if(now<f.from||dt>250)return;f.sum+=dt;f.n++;
  if(f.n<60)return;const slow=f.sum/f.n>32;f.sum=0;f.n=0;f.slow=slow?f.slow+1:0;if(f.slow>=2)this.dropShade();
 }
 render(){
  const v=this.view,r=v.renderer;this.sync();
  if(this.applied!=='off'){(this.applied==='day'?this.sky:this.dome).position.copy(v.active.position);if(this.envDue&&performance.now()>this.envDue&&this.applied==='day')this.buildEnvironment();}
  const shade=this.applied!=='off'&&!this.shadeOff&&!r.clippingPlanes.length&&!v.apartmentDetails?.cutaway;
  if(shade&&!this.composer&&!this.shadePending)this.loadShade().catch(()=>{this.shadeOff=true;});
  if(shade&&this.composer){
   const w=v.host.clientWidth,h=v.host.clientHeight,k=r.getPixelRatio();
   if(w&&h&&(w!==this.size[0]||h!==this.size[1]||k!==this.pixelRatio)){this.pixelRatio=k;this.size=[w,h];this.composer.setPixelRatio(k);this.composer.setSize(w,h);}
   this.glassUniforms.direct.value=0;this.composer.render();this.measure();v.host.dataset.ao='on';
  // Drawn straight to the screen, glass is mixed after the tone curve, where a faint reflection would come out far too bright.
  }else{this.glassUniforms.direct.value=1;r.render(v.scene,v.active);v.host.dataset.ao='off';}
 }
 dispose(){this.disposed=true;this.dropShade();this.pmrem?.dispose();this.envTarget?.dispose();this.envSky?.material.dispose();this.envSky?.geometry.dispose();this.envGround?.material.dispose();this.envGround?.geometry.dispose();this.grass?.dispose();}
}

// Grass for open ground: broad patches and fine dabs of green on one repeating tile.
function grassTexture(renderer){
 const c=document.createElement('canvas'),n=c.width=c.height=512,x=c.getContext('2d'),rand=random(5);
 x.fillStyle='#6f8a50';x.fillRect(0,0,n,n);
 const dab=(tones,count,r0,r1,a0,a1)=>{for(let i=0;i<count;i++){const px=rand()*n,py=rand()*n,r=r0+rand()*(r1-r0);x.fillStyle=tones[Math.floor(rand()*tones.length)];x.globalAlpha=a0+rand()*(a1-a0);
  for(const dx of [-n,0,n])for(const dy of [-n,0,n]){x.beginPath();x.arc(px+dx,py+dy,r,0,6.2832);x.fill();}}};
 dab(['#5c7a42','#86a062','#66854a','#93a266'],70,40,110,.05,.1);dab(['#5c7a42','#789652','#66854a','#88a262','#557340'],2600,1.5,5,.1,.24);
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.setScalar(160/12);map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return map;
}

// Trees and hedges: lumpy crowns from a few rounded masses, darker underneath, one mesh each.
function random(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function mass(rand,detail,[cx,cy,cz],[sx,sy,sz],low,high,tones){
 const g=new THREE.IcosahedronGeometry(1,detail),p=g.attributes.position,n=g.attributes.normal,color=new Float32Array(p.count*3);g.deleteAttribute('uv');
 const a=rand()*6.28,b=rand()*6.28,c=rand()*6.28,tone=tones[Math.floor(rand()*tones.length)],v=new THREE.Vector3();
 for(let i=0;i<p.count;i++){
  v.fromBufferAttribute(p,i).normalize();const {x,y,z}=v;
  const k=1+.15*Math.sin(x*3.1+a)*Math.sin(y*2.7+b)+.1*Math.sin(z*4.3+c)*Math.sin(x*5.2+b)+.06*Math.sin(y*7.1+a+z*6.3);
  const py=cy+y*k*sy;p.setXYZ(i,cx+x*k*sx,py,cz+z*k*sz);
  v.set(x/sx,y/sy,z/sz).normalize();n.setXYZ(i,v.x,v.y,v.z);
  const light=lerp(.64,1.1,(py-low)/(high-low))*(.92+.16*Math.sin(x*9+a)*Math.sin(z*8+c));color[i*3]=tone.r*light;color[i*3+1]=tone.g*light;color[i*3+2]=tone.b*light;
 }
 g.setAttribute('color',new THREE.BufferAttribute(color,3));return g;
}
const leafTones=[0x5f7a48,0x6f8a52,0x587046,0x7c9459].map(h=>new THREE.Color(h));
export function leafMaterial(){return new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});}
export function treeCrown(x,z,scale,seed,detail=3){
 const rand=random(seed),parts=[],low=1.5,high=2.6+1.9*scale;
 parts.push(mass(rand,detail,[x,2.75+.25*scale,z],[1.02*scale,.92*scale,1.02*scale],low,high,leafTones));
 const count=5+Math.floor(rand()*2);
 for(let i=0;i<count;i++){const t=i/count*6.283+rand()*.7,r=(.5+rand()*.22)*scale,s=(.56+rand()*.22)*scale;
  parts.push(mass(rand,detail,[x+Math.cos(t)*r,2.3+rand()*1.15*scale,z+Math.sin(t)*r],[s,s*(.8+rand()*.2),s],low,high,leafTones));}
 const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());return g;
}
export function hedge(points,radius,seed,detail=2){
 const rand=random(seed),parts=points.map(([x,y,z])=>{const s=radius*(.92+rand()*.2);return mass(rand,detail,[x,y,z],[s,s*1.12,s],y-radius,y+radius*1.2,leafTones);});
 const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());return g;
}
