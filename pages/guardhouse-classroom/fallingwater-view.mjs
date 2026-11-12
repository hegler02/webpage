// The Fallingwater scene: concrete trays held out over a waterfall from a stone core, built from data and walked from the pool below to the roof terrace.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createModelGroup,disposeModelResources as disposeTree} from './src/scene.mjs';
import {fallingwaterModel,colors,F1,C1,C2,C3} from './src/fallingwater-model.mjs';
import {project,rooms,panel,equipment,fireDevices,stations} from './src/fallingwater-project.mjs';
import {sunPosition,sunVector,dayOfYear} from './src/energy-engine.mjs';
import {SurfaceLibrary,worldUV} from './surface-materials.mjs';
import {SceneLook,qualityTier} from './scene-quality.mjs';
import {observeScene,presentScene,timeSlices} from './render-loop.mjs';
import {roomLight,graphicsIdle} from './program-warmup.mjs';
import {keyboardOrbit,lightenOnSlowFrames,createRenderer,holdCanvas,seatCanvas} from './scene-access.mjs';
import {createLampHalos} from './masters-power-view.mjs';
import {point,deviceMesh,pipe,mergeContext,zones,levelAt,indoorAt,walkableAt} from './fallingwater-scene-parts.mjs';
import {sandstone,ochre,flagstone,ledge} from './fallingwater-textures.mjs';
import {furnish} from './fallingwater-furniture.mjs';
import {buildLand} from './fallingwater-land.mjs';

export const prepareFallingwaterMaterials=()=>SurfaceLibrary.prepare();
// The model's south is the side of the falls, which really faces south-south-east: compass directions are turned 30 degrees into the model. A sun set from outside already comes in the model's directions.
const turned=v=>[.866*v[0]+.5*v[1],-.5*v[0]+.866*v[1],v[2]];
// A summer morning at Mill Run: the sun comes down the stream and lights the long trays from the front.
export const summerSun=()=>sunVector(sunPosition(dayOfYear(6,21),11,project.site));
const REACH=150;
// Everything the study views have to keep in frame: the trays, the tower and chimney, and the bridge.
const solid=(z0,z1)=>[[[-6.6,-6.6,z0],[16.8,7.8,z1]],[[18.4,-8,Math.max(z0,0)],[22.4,1.4,3.3]]];
const HOUSE=solid(0,12.2),PLAN=solid(2.6,8);
const homes={
 outside:{pos:[-12.5,-29.5,-2.6],tall:[-9,-33,-1],at:[4.6,-1.5,4.4],fov:42},
 site:{pos:[-17,-34,31],tall:[-12,-27,34],at:[5,0,3],fov:34,box:HOUSE},
 upper:{pos:[25,-31,30],tall:[18,-25,34],at:[5,0,6],fov:34,box:HOUSE},
 section:{pos:[-34,-1,6.5],at:[5.6,-1,5.2],fov:30,box:[[[5.6,-7,-1],[5.7,8,12.2]]]},
 materials:{pos:[-9,-17,7.4],at:[5,-1.6,5.3],fov:36},
 frame:{pos:[-13,-25,-3.5],tall:[-9,-27,-5],at:[5,-1,3.4],fov:34,box:HOUSE},
 joint:{pos:[-11,-8.5,1.6],at:[5.6,-1.6,2.6],fov:30},
 power:{pos:[4,-25,31],tall:[-4,-16,33],at:[5,0,3.6],fov:36,box:PLAN},
 fire:{pos:[4,-25,31],tall:[-4,-16,33],at:[5,0,3.6],fov:36,box:PLAN}
};
homes.circuit=homes.power;
// Plan views are cut just under one ceiling; which one follows the floor of whatever is selected.
const plans=new Set(['power','circuit','fire']),cuts=[C1-.02,C2-.02,C3-.02];
const sliced={section:[[1,0,0],-5.6],joint:[[1,0,0],-5.6]};
const bones=new Set(['frame','joint']),carrying=new Set(['column','beam','floor','parapet','wall','roof']),structural=d=>carrying.has(d.kind);
const tone=new Map(Object.entries(colors).map(([name,hex])=>[new THREE.Color(hex).getHex(),name]));

// The model is put together in slices, so the page keeps answering while it is built. The canvas takes its place in the host once the scene is whole.
export async function mountFallingwater(host,select){
 const pause=timeSlices(),renderer=createRenderer(THREE,host,{antialias:true,preserveDrawingBuffer:true}),canvas=renderer.domElement;
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.localClippingEnabled=true;
 canvas.setAttribute('aria-label','낙수장 3D 모델');canvas.tabIndex=0;holdCanvas(host,renderer);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x12171c);
 const camera=new THREE.PerspectiveCamera(36,1,.15,40000);
 const ambient=new THREE.HemisphereLight(0xe9f2f4,0x6f7458,1.5),sun=new THREE.DirectionalLight(0xfff0d9,2.2);
 sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.normalBias=.03;sun.target.position.copy(point([project.center[0],project.center[1],0]));
 Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:1,far:420});scene.add(ambient,sun,sun.target);
 await pause();
 const env=await roomLight(renderer);
 scene.environment=env.texture;

 await pause();
 const base=createModelGroup(fallingwaterModel());await pause();
 const context=mergeContext(base),building=new THREE.Group();
 building.add(base,context);
 const view={scene,renderer,host,camera,active:camera,sun,ambient,ground:null,site:null,base:building,environment:env.texture,project,realistic:true,studio:true,night:false,fpv:false,mode:'orbit',setNight};
 await pause();
 const {land,ground,site,flow}=await buildLand(renderer,qualityTier(),pause);view.ground=ground;view.site=site;scene.add(building,land,ground,site);
 const look=renderer.noGPU?null:new SceneLook(view),surfaces=new SurfaceLibrary(renderer),clip=[];
 const skins={};
 for(const [name,make] of [['sandstone',sandstone],['ochre',ochre],['flagstone',r=>flagstone(r,3.2,pause)],['rock',r=>ledge(r,3)]]){await pause();skins[name]=await make(renderer);}
 const cut=m=>{m.clippingPlanes=clip;m.clipShadows=true;return m;};
 const wood=cut(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6}));
 function dress(mesh){
  const d=mesh.userData,m=cut(mesh.material),name=tone.get(m.color.getHex());
  if(d.kind==='window-glass'){m.envMapIntensity=.55;m.depthWrite=false;mesh.castShadow=false;look?.glass(m);m.roughness=.17;return;}
  const made=d.kind==='furniture'&&furnish(d,new THREE.Box3().setFromBufferAttribute(mesh.geometry.attributes.position));
  if(made){mesh.geometry.dispose();m.dispose();mesh.geometry=made;mesh.material=wood;return;}
  if(skins[name]){worldUV(mesh.geometry);m.color.set(0xffffff);Object.assign(m,skins[name]);m.needsUpdate=true;return;}
  m.roughness=name==='red'?.48:name==='walnut'?.55:.9;
 }
 for(const mesh of [...base.children,...context.children])if(mesh.isMesh){await pause();dress(mesh);}
 await pause();

 const devices=new THREE.Group(),deviceMeshes=new Map(),electricIds=new Set([panel.id,...equipment.map(d=>d.id)]),height=new Map();
 for(const d of [panel,...equipment,...fireDevices]){const g=deviceMesh(d);g.userData.kind=d.kind;height.set(d.id,d.pos[2]);
  // Every second lamp carries a real light, so the scene stays light on weak graphics.
  if(d.kind==='light'&&Number(d.id.slice(2))%2===0){g.remove(g.userData.glow);g.userData.glow=null;}
  deviceMeshes.set(d.id,g);devices.add(g);}
 // What the pale ceilings and the waxed floor give back to the rooms.
 const bounce=new THREE.Group();
 for(const [x,y,z] of [[3.4,-.8,C1-1.3],[8.2,.6,C1-1.3],[5.6,3,C2-1.2],[-1.9,4.8,C1-1]]){const l=new THREE.PointLight(0xffdcb0,0,12,1.6);l.position.copy(point([x,y,z]));bounce.add(l);}
 const routes=new THREE.Group(),highlight=new THREE.BoxHelper(new THREE.Object3D(),0xe0903a);highlight.material.depthTest=false;highlight.renderOrder=10;highlight.visible=false;
 const marker=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xe8b572,transparent:true,opacity:.4,depthWrite:false,side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.visible=false;
 scene.add(devices,bounce,routes,highlight,marker);
 const halos=createLampHalos(deviceMeshes);scene.add(halos.group);

 // The house is best known from below the falls, so the camera may drop under the level it looks at.
 const controls=new OrbitControls(camera,canvas);view.controls=controls;controls.enableDamping=true;controls.dampingFactor=.12;controls.minDistance=1.5;controls.maxDistance=110;controls.maxPolarAngle=Math.PI*.6;
 const stopKeys=keyboardOrbit(controls,canvas),stopLighten=lightenOnSlowFrames(renderer);
 let dirty=true,until=0,disposed=false,state={view:null,studio:true,id:null,show:'electrical',cut:null,routeKey:''},walkState=null,sunVectorNow=null,spinning=false,aimed=null,moved=false;
 const wake=(ms=900)=>{dirty=true;until=performance.now()+ms;};
 // While shaders for a new picture are still being built the old picture stays, and the frame is asked for again when they are ready.
 const draw=force=>{if(look){if(!look.render(force))return false;}else renderer.render(scene,camera);dirty=false;return true;};
 if(look)look.onReady=()=>wake();
 const size=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};

 function placeSun(){
  const t=sun.target.position,v=view.studio?[-.36,-.6,.72]:sunVectorNow??turned(summerSun());
  sun.position.set(t.x+v[0]*REACH,t.y+Math.max(v[2],.02)*REACH,t.z-v[1]*REACH);renderer.shadowMap.needsUpdate=true;look?.invalidate();wake();
 }
 function setNight(on){
  view.night=!!on;const s=view.studio,k=s&&view.power?.36+.64*(view.share??1):1;scene.background.set(s?0x12171c:on?0x141f2c:0xb9ccd4);
  ambient.intensity=(s?.3:on?.14:.75)*k;sun.intensity=(s?1.35:on?.1:3.2)*k;sun.color.set(on&&!s?0xaac9ff:0xfff0d9);
  scene.environmentIntensity=(s?.45:on?.1:.55)*k;renderer.toneMappingExposure=on&&!s?1.05:1;host.dataset.night=String(view.night);look?.invalidate();wake();
 }
 // A view that names a box steps back along its own line of sight until every corner sits inside the pane, and centres on what it shows; the others only step back in an upright pane.
 function frame(h,to,back,shape){
  const tv=Math.tan(h.fov*Math.PI/360)*.95,th=tv*shape,right=new THREE.Vector3(0,1,0).cross(back).normalize(),up=back.clone().cross(right);
  const corners=h.box.flatMap(b=>[0,1].flatMap(i=>[0,1].flatMap(j=>[0,1].map(k=>point([b[i][0],b[j][1],b[k][2]]))))),seen=()=>corners.map(c=>{const v=c.clone().sub(to);return [v.dot(right),v.dot(up),v.dot(back)];});
  const reach=()=>Math.max(...seen().map(([x,y,b])=>b+Math.max(Math.abs(x)/th,Math.abs(y)/tv)));
  for(let pass=0;pass<3;pass++){const d=reach(),xs=[],ys=[];for(const [x,y,b] of seen()){xs.push(x/(d-b));ys.push(y/(d-b));}
   to.addScaledVector(right,(Math.min(...xs)+Math.max(...xs))/2*d).addScaledVector(up,(Math.min(...ys)+Math.max(...ys))/2*d);}
  return reach();
 }
 function aim(id){
  const h=homes[id]??homes.site,shape=host.clientWidth/host.clientHeight||1,to=point(h.at),from=point(shape<1&&h.tall||h.pos),back=from.clone().sub(to),reach=back.length();back.normalize();
  const far=h.box?frame(h,to,back,shape):shape<1&&!h.tall?reach*1.7:reach;
  from.copy(to).addScaledVector(back,far);aimed=id;moved=false;
  camera.near=.15;camera.fov=h.fov;camera.position.copy(from);controls.target.copy(to);camera.updateProjectionMatrix();controls.update();wake();
 }
 const home=()=>{if(walkState)station(walkState.zone);else aim(state.studio?state.view:'outside');};

 // Walking: the eye follows a point that stays inside its zone. On the rocks it rides the land; in the house it keeps to one floor and the light changes at the glass.
 function eye(){
  const w=walkState,z=zones[w.zone],inside=indoorAt(w.zone,w.x,w.y);if(inside!==view.fpv){view.fpv=inside;look?.invalidate();}
  camera.near=.06;camera.position.copy(point([w.x,w.y,levelAt(w.zone,w.x,w.y)+z.eye]));camera.rotation.set(w.pitch,w.yaw,0,'YXZ');camera.updateProjectionMatrix();
  host.dataset.walk=[w.zone,w.x.toFixed(2),w.y.toFixed(2)].join(' ');host.dataset.indoor=String(inside);wake();
 }
 function station(id){
  const s=stations.find(s=>s.id===id)??stations[0];walkState={zone:s.id,x:s.pos[0],y:s.pos[1],yaw:Math.atan2(-s.look[0],s.look[1]),pitch:s.pitch??0};
  controls.enabled=false;camera.fov=64;view.mode=s.id;host.dataset.walking='true';host.dataset.zone=s.id;look?.invalidate();eye();
 }
 function leave(){walkState=null;controls.enabled=true;view.fpv=false;view.mode='orbit';host.dataset.walking='false';delete host.dataset.zone;delete host.dataset.walk;delete host.dataset.indoor;look?.invalidate();aim(state.studio?state.view:'outside');}
 function walk(action){
  if(action==='outside')return leave();
  if(zones[action])return station(action);
  if(!walkState)return;const w=walkState,step=zones[w.zone].indoor===false&&w.zone!=='stream'?.9:.45;
  if(action==='left'||action==='right'){w.yaw+=(action==='left'?1:-1)*.2;return eye();}
  const f=action==='forward'?1:action==='back'?-1:0,s=action==='strafe-right'?1:action==='strafe-left'?-1:0;
  const dx=(-Math.sin(w.yaw)*f+Math.cos(w.yaw)*s)*step,dy=(Math.cos(w.yaw)*f+Math.sin(w.yaw)*s)*step;
  if(walkableAt(w.zone,w.x+dx,w.y+dy)){w.x+=dx;w.y+=dy;}else if(walkableAt(w.zone,w.x+dx,w.y))w.x+=dx;else if(walkableAt(w.zone,w.x,w.y+dy))w.y+=dy;
  eye();
 }

 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let drag=null;
 const kept=p=>clip.every(plane=>plane.distanceToPoint(p)>=0);
 function pick(event){
  const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);
  const shown=[...devices.children.filter(o=>o.visible),...base.children.filter(o=>o.visible)];
  for(const hit of ray.intersectObjects(shown,true)){const d=hit.object.userData;if(d.deviceId)return d.deviceId;if(d.id&&kept(hit.point))return d.id;}
  return null;
 }
 const down=e=>{drag={x:e.clientX,y:e.clientY,moved:false};canvas.setPointerCapture?.(e.pointerId);};
 const move=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;
  if(walkState&&drag.moved){walkState.yaw-=dx*.004;walkState.pitch=Math.max(-1.2,Math.min(1.2,walkState.pitch-dy*.004));drag.x=e.clientX;drag.y=e.clientY;eye();}};
 const up=e=>{const was=drag;drag=null;if(was&&!was.moved)select(pick(e));};
 const wheel=e=>{if(!walkState)return;e.preventDefault();camera.fov=Math.max(35,Math.min(85,camera.fov+Math.sign(e.deltaY)*3));camera.updateProjectionMatrix();wake();};
 const keys={w:'forward',arrowup:'forward',s:'back',arrowdown:'back',a:'strafe-left',d:'strafe-right',arrowleft:'left',arrowright:'right'};
 const key=e=>{const action=walkState&&keys[e.key.toLowerCase()];if(action){e.preventDefault();walk(action);}};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('keydown',key);
 controls.addEventListener('change',()=>wake(300));
 controls.addEventListener('start',()=>{moved=true;});
 const resize=new ResizeObserver(()=>{size();if(aimed&&!moved&&!walkState)aim(aimed);wake();});resize.observe(host);

 function mark(id){
  const mesh=id&&(deviceMeshes.get(id)??base.children.find(o=>o.userData.id===id)),space=id&&rooms.find(r=>r.id===id);
  highlight.visible=!!mesh;if(mesh){highlight.setFromObject(mesh);highlight.update();}
  marker.visible=!!space;if(space){const [x0,y0,x1,y1]=space.bounds;marker.scale.set(x1-x0,y1-y0,1);marker.position.copy(point([(x0+x1)/2,(y0+y1)/2,space.level+.04]));}
  host.dataset.selection=id??'';
 }
 // The floor a plan view is cut at: the one the selected room, device or element stands on, the first floor when nothing is chosen.
 function storey(id){
  const space=rooms.find(r=>r.id===id),z=space?space.level+1:height.get(id)??base.children.find(o=>o.userData.id===id)?.userData.base??F1+1;
  return z<C1+.5?0:z<C2+.4?1:2;
 }
 function update({view:name='site',studio=true,id=null,show='electrical',devices:live=[],paths=[],night=view.night,power=false}={}){
  const changed=name!==state.view||studio!==state.studio,level=studio&&plans.has(name)?storey(id):null,recut=changed||level!==state.cut;
  state={...state,view:name,studio,id,show,cut:level};
  if(recut){
   clip.length=0;const c=studio&&(level===null?sliced[name]:[[0,-1,0],cuts[level]]);if(c)clip.push(new THREE.Plane(new THREE.Vector3(...c[0]),c[1]));
   host.dataset.storey=level===null?'':String(level+1);renderer.shadowMap.needsUpdate=true;look?.invalidate();
  }
  if(changed){
   view.studio=studio;const skeleton=studio&&bones.has(name);for(const mesh of base.children)mesh.visible=!skeleton||structural(mesh.userData);
   context.visible=!skeleton;land.visible=ground.visible=site.visible=!studio;
   if(studio&&walkState){walkState=null;controls.enabled=true;view.fpv=false;view.mode='orbit';host.dataset.walking='false';delete host.dataset.zone;}
   placeSun();if(!walkState)aim(studio?name:'outside');
  }
  // In the power lesson the room dims with every lamp that loses power.
  const lights=live.filter(d=>d.kind==='light'),share=lights.length?lights.filter(d=>d.on).length/lights.length:1,dimmed=power!==view.power||share!==view.share;view.power=power;view.share=share;
  if(changed||dimmed||night!==view.night)setNight(night);
  const on=new Map(live.map(d=>[d.id,d])),skeleton=studio&&bones.has(name);spinning=false;let lamps=0;
  for(const [key,g] of deviceMeshes){
   const electric=electricIds.has(key),d=on.get(key),lit=!!d?.on;g.visible=!skeleton&&(show==='all'||(show==='fire')!==electric)&&(level===null||height.get(key)<cuts[level]+.5);
   const dot=g.userData.indicator?.material,lamp=g.userData.kind==='light';
   if(dot){dot.emissive.set(lit?(lamp?0xfff0d0:0xff5a3c):0x000000);dot.emissiveIntensity=lit?(lamp?2.6:1.1):0;}
   if(lamp&&lit)lamps++;
   if(g.userData.glow)g.userData.glow.intensity=lit&&(power||!studio)?(power?2.6:view.night?2.2:.9):0;
   halos.show(key,g,{lit,power,visible:g.visible});
   if(g.userData.rotor){g.userData.spin=lit;spinning||=lit&&(power||!studio);}
  }
  for(const l of bounce.children)l.intensity=studio?0:Math.min(lamps,6)*(view.night?2.4:.45);
  const keyNow=JSON.stringify(paths);
  if(keyNow!==state.routeKey){state.routeKey=keyNow;for(const o of [...routes.children]){routes.remove(o);o.traverse(m=>{m.geometry?.dispose();});o.userData.material?.dispose();}
   for(const p of paths){const material=new THREE.MeshBasicMaterial({color:p.color,depthTest:!p.through});const line=pipe(p.points,material,p.radius??.03);line.userData.material=material;line.renderOrder=p.through?9:0;routes.add(line);}}
  mark(id);host.dataset.view=name;host.dataset.studio=String(studio);host.dataset.pathPoints=String(paths.reduce((n,p)=>n+p.points.length,0));wake();
 }

 // The loop draws from its first frame, so the graphics process is given time to catch up before it starts.
 await graphicsIdle(renderer);
 const loop=observeScene(host,dt=>{
  if(!walkState&&controls.update())dirty=true;
  // The water never stands still: while the land is shown the falls keep sliding.
  if(!view.studio){flow(dt);dirty=true;}
  if(spinning){for(const g of deviceMeshes.values())if(g.userData.spin)g.userData.rotor.rotation.z+=dt*9;dirty=true;}
  if(dirty||performance.now()<until)draw();
 },host.parentElement);
 seatCanvas(host,canvas);size();update();host.dataset.elements=String(base.children.length);host.dataset.devices=String(deviceMeshes.size);

 return {
  view,walk,home,update,station,
  whole:()=>walk('outside'),
  setNight:on=>setNight(on),
  setSun:v=>{sunVectorNow=v;placeSun();},
  walking:()=>walkState?.zone??null,
  present:async current=>{size();if(look)for(let n=0;n<400&&!disposed&&current()&&!look.prepare();n++)await look.settle();return presentScene(host,()=>{size();draw();},{current});},
  image:()=>{draw(true);return canvas.toDataURL('image/png');},
  setActive:on=>loop.setActive(on),
  dispose(){
   if(disposed)return;disposed=true;loop.dispose();resize.disconnect();controls.dispose();stopKeys?.();stopLighten?.();look?.dispose();env.dispose();
   for(const skin of Object.values(skins))for(const t of [skin.map,skin.bumpMap])t?.dispose();
   disposeTree(scene);surfaces.dispose();renderer.dispose();canvas.remove();
  }
 };
}
