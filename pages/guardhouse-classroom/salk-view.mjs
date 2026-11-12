// The Salk scene: one block built from data, the evening sun at the end of the court, and a walk from a lab up into the pipe space.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createModelGroup,disposeModelResources as disposeTree} from './src/scene.mjs';
import {salkModel,colors,L,W,CLEAR,AXIS} from './src/salk-model.mjs';
import {project,rooms,panel,equipment,fireDevices,stations,moduleBay} from './src/salk-project.mjs';
import {sunPosition,sunVector,dayOfYear} from './src/energy-engine.mjs';
import {SurfaceLibrary,worldUV} from './surface-materials.mjs';
import {SceneLook} from './scene-quality.mjs';
import {observeScene,presentScene} from './render-loop.mjs';
import {keyboardOrbit,lightenOnSlowFrames,createRenderer} from './scene-access.mjs';
import {point,deviceMesh,pipe,mergeContext,buildLand,zones,walkableAt} from './salk-scene-parts.mjs';

export const prepareSalkMaterials=()=>SurfaceLibrary.prepare();
// Spring equinox, a little before sunset at La Jolla: the sun stands over the end of the water channel.
export const eveningSun=()=>sunVector(sunPosition(dayOfYear(3,20),17.6,project.site));
const MID=moduleBay.mid,X0=moduleBay.x0,REACH=150;
const homes={
 outside:{pos:[104,AXIS+.5,8.5],at:[10,AXIS,2.5],fov:42},
 site:{pos:[L+78,-128,92],at:[L/2,-16,0],fov:34},
 section:{pos:[MID-92,-16,11],at:[MID,-16,2.5],fov:34},
 materials:{pos:[21,-36,8],at:[37.5,-7,6.8],fov:36},
 truss:{pos:[X0-36,6,9],at:[X0,9.9,3.6],fov:34},
 pipe:{pos:[MID-17,-9,19],at:[MID,9.9,3.6],fov:36},
 power:{pos:[MID-10,32,15],at:[MID,9.9,1.4],fov:36},
 fire:{pos:[L/2,66,54],at:[L/2,9.9,0],fov:36},
 // Above the east end of the court, looking to the sea: the towers' shadows cross the paving and show the hour.
 sun:{pos:[118,AXIS-3,17.5],at:[22,AXIS,3],fov:42}
};
homes.circuit=homes.power;
const withContext=new Set(['site','section']);
const clipFor={section:[[1,0,0],-MID],truss:[[1,0,0],-(X0-.16)],pipe:[[0,-1,0],5.85],power:[[0,-1,0],CLEAR-.005],circuit:[[0,-1,0],CLEAR-.005],fire:[[0,-1,0],CLEAR-.005]};

export function mountSalk(host,select){
 const renderer=createRenderer(THREE,host,{antialias:true,preserveDrawingBuffer:true}),canvas=renderer.domElement;
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.localClippingEnabled=true;
 canvas.setAttribute('aria-label','솔크 연구소 3D 모델');canvas.tabIndex=0;host.append(canvas);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x12171c);
 const camera=new THREE.PerspectiveCamera(36,1,.15,40000);
 const ambient=new THREE.HemisphereLight(0xe9f2f4,0x7d7566,1.5),sun=new THREE.DirectionalLight(0xfff0d9,2.2);
 sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.normalBias=.05;sun.target.position.copy(point([project.center[0],project.center[1],0]));
 Object.assign(sun.shadow.camera,{left:-95,right:95,top:95,bottom:-95,near:1,far:420});scene.add(ambient,sun,sun.target);
 const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=generator.fromScene(room,.04);generator.dispose();room.dispose();
 scene.environment=env.texture;

 const base=createModelGroup(salkModel()),context=mergeContext(base),building=new THREE.Group(),{land,ground}=buildLand();
 building.add(base,context);scene.add(building,land,ground);
 const view={scene,renderer,host,camera,active:camera,sun,ambient,ground,site:new THREE.Group(),base:building,environment:env.texture,project,realistic:true,studio:true,night:false,fpv:false,mode:'orbit',setNight};
 view.site.visible=false;
 const look=renderer.noGPU?null:new SceneLook(view),surfaces=new SurfaceLibrary(renderer),clip=[];
 const dress=(mesh)=>{const d=mesh.userData,m=mesh.material;m.clippingPlanes=clip;m.clipShadows=true;
  if(d.kind==='window-glass'){m.envMapIntensity=1.2;m.depthWrite=false;mesh.castShadow=false;look?.glass(m);return;}
  if(d.kind==='water'){m.roughness=.05;mesh.castShadow=false;return;}
  if(d.kind==='frame'){m.roughness=.35;m.metalness=.7;return;}
  worldUV(mesh.geometry);const color=m.color.getHex();
  if(d.kind==='context'){if(color!==colors.steel)surfaces.apply(m,color===colors.teak?'wood':color===colors.travertine?'marble':'concrete',color);return;}
  if(d.kind==='paving'&&d.group==='court'){surfaces.apply(m,'marble',color);m.roughness=.58;}else if(d.kind==='finish')surfaces.apply(m,'wood',color);else if(d.kind!=='furniture')surfaces.apply(m,'concrete',color);
 };
 for(const mesh of [...base.children,...context.children])if(mesh.isMesh)dress(mesh);

 const devices=new THREE.Group(),deviceMeshes=new Map(),electricIds=new Set([panel.id,...equipment.map(d=>d.id)]);
 for(const d of [panel,...equipment,...fireDevices]){const g=deviceMesh(d);g.userData.kind=d.kind;
  // Every second row carries the light that falls on the room, so the scene stays light on weak graphics.
  if(d.kind==='light'&&Number(d.id.slice(2))%2===0){g.remove(g.userData.glow);g.userData.glow=null;}
  deviceMeshes.set(d.id,g);devices.add(g);}
 const workLight=new THREE.PointLight(0xffe2b8,0,16,1.5);workLight.position.copy(point([MID,9.9,moduleBay.pipeFloor+2.3]));
 const routes=new THREE.Group(),highlight=new THREE.BoxHelper(new THREE.Object3D(),0xe0903a);highlight.material.depthTest=false;highlight.renderOrder=10;highlight.visible=false;
 const marker=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xe8b572,transparent:true,opacity:.4,depthWrite:false,side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.visible=false;
 scene.add(devices,workLight,routes,highlight,marker);

 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.12;controls.minDistance=3;controls.maxDistance=420;controls.maxPolarAngle=Math.PI*.495;
 const stopKeys=keyboardOrbit(controls,canvas),stopLighten=lightenOnSlowFrames(renderer);
 let dirty=true,until=0,disposed=false,state={view:null,studio:true,id:null,show:'electrical',routeKey:''},walkState=null,sunVectorNow=null,spinning=false;
 const wake=(ms=900)=>{dirty=true;until=performance.now()+ms;};
 const draw=()=>{if(look)look.render();else renderer.render(scene,camera);dirty=false;};
 const size=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};

 function placeSun(){
  const t=sun.target.position,v=view.studio?[-.42,-.5,.76]:sunVectorNow??eveningSun();
  sun.position.set(t.x+v[0]*REACH,t.y+Math.max(v[2],.02)*REACH,t.z-v[1]*REACH);renderer.shadowMap.needsUpdate=true;look?.invalidate();wake();
 }
 function setNight(on){
  view.night=!!on;const s=view.studio;scene.background.set(s?0x12171c:on?0x172638:0xb9ccd4);
  ambient.intensity=s?1.5:on?.16:.75;sun.intensity=s?2.2:on?.1:3.2;sun.color.set(on&&!s?0xaac9ff:0xfff0d9);
  scene.environmentIntensity=s?.6:on?.1:.55;renderer.toneMappingExposure=on&&!s?1.05:1;host.dataset.night=String(view.night);look?.invalidate();wake();
 }
 function aim(id){
  const h=homes[id]??homes.site,narrow=host.clientWidth<host.clientHeight,to=point(h.at),from=point(h.pos);
  if(narrow)from.sub(to).multiplyScalar(1.7).add(to);
  camera.near=.15;camera.fov=h.fov;camera.position.copy(from);controls.target.copy(to);camera.updateProjectionMatrix();controls.update();wake();
 }
 const home=()=>{if(walkState)station(walkState.zone);else aim(state.studio?state.view:'outside');};

 // Walking: the eye follows a point that stays inside the zone's rectangles.
 function eye(){
  const w=walkState,z=zones[w.zone];camera.near=.06;camera.position.copy(point([w.x,w.y,z.z+z.eye]));camera.rotation.set(w.pitch,w.yaw,0,'YXZ');camera.updateProjectionMatrix();
  host.dataset.walk=[w.zone,w.x.toFixed(2),w.y.toFixed(2)].join(' ');wake();
 }
 function station(id){
  const s=stations.find(s=>s.id===id)??stations[0];walkState={zone:s.id,x:s.pos[0],y:s.pos[1],yaw:Math.atan2(-s.look[0],s.look[1]),pitch:0};
  controls.enabled=false;camera.fov=s.id==='pipe'?72:64;view.fpv=zones[s.id].indoor;view.mode=s.id;host.dataset.walking='true';host.dataset.zone=s.id;look?.invalidate();eye();
 }
 function leave(){walkState=null;controls.enabled=true;view.fpv=false;view.mode='orbit';host.dataset.walking='false';delete host.dataset.zone;delete host.dataset.walk;look?.invalidate();aim(state.studio?state.view:'outside');}
 function walk(action){
  if(action==='outside')return leave();
  if(zones[action])return station(action);
  if(!walkState)return;const w=walkState,step=zones[w.zone].indoor?.45:1.1;
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
 const resize=new ResizeObserver(()=>{size();wake();});resize.observe(host);

 function mark(id){
  const mesh=id&&(deviceMeshes.get(id)??base.children.find(o=>o.userData.id===id)),space=id&&rooms.find(r=>r.id===id);
  highlight.visible=!!mesh;if(mesh){highlight.setFromObject(mesh);highlight.update();}
  marker.visible=!!space;if(space){const [x0,y0,x1,y1]=space.bounds;marker.scale.set(x1-x0,y1-y0,1);marker.position.copy(point([(x0+x1)/2,(y0+y1)/2,space.level+.04]));}
  host.dataset.selection=id??'';
 }
 function update({view:name='site',studio=true,id=null,show='electrical',devices:live=[],paths=[],night=view.night}={}){
  const changed=name!==state.view||studio!==state.studio;state={...state,view:name,studio,id,show};
  if(changed){
   view.studio=studio;clip.length=0;const c=studio&&clipFor[name];if(c)clip.push(new THREE.Plane(new THREE.Vector3(...c[0]),c[1]));
   context.visible=!studio||withContext.has(name);land.visible=ground.visible=!studio;
   if(studio&&walkState){walkState=null;controls.enabled=true;view.fpv=false;view.mode='orbit';host.dataset.walking='false';}
   placeSun();if(!walkState)aim(studio?name:'outside');
  }
  if(changed||night!==view.night)setNight(night);
  const on=new Map(live.map(d=>[d.id,d]));spinning=false;
  for(const [key,g] of deviceMeshes){
   const electric=electricIds.has(key),d=on.get(key),lit=!!d?.on;g.visible=show==='all'||(show==='fire')!==electric;
   const dot=g.userData.indicator?.material;
   if(dot){const lamp=g.userData.kind==='light';dot.emissive.set(lit?(lamp?0xfff0d0:g.userData.kind==='exit'?0x35d08a:0xff5a3c):0x000000);dot.emissiveIntensity=lit?(lamp?2.4:1.1):0;}
   if(g.userData.glow)g.userData.glow.intensity=lit&&!studio?34:0;
   if(g.userData.rotor){g.userData.spin=lit;spinning||=lit&&!studio;}
  }
  workLight.intensity=studio?0:5;
  const keyNow=JSON.stringify(paths);
  if(keyNow!==state.routeKey){state.routeKey=keyNow;for(const o of [...routes.children]){routes.remove(o);o.traverse(m=>{m.geometry?.dispose();});o.userData.material?.dispose();}
   for(const p of paths){const material=new THREE.MeshBasicMaterial({color:p.color,depthTest:!p.through});const line=pipe(p.points,material,p.radius??.045);line.userData.material=material;line.renderOrder=p.through?9:0;routes.add(line);}}
  mark(id);host.dataset.view=name;host.dataset.studio=String(studio);host.dataset.pathPoints=String(paths.reduce((n,p)=>n+p.points.length,0));wake();
 }

 const loop=observeScene(host,dt=>{
  if(!walkState&&controls.update())dirty=true;
  if(spinning){for(const g of deviceMeshes.values())if(g.userData.spin)g.userData.rotor.rotation.z+=dt*9;dirty=true;}
  if(dirty||performance.now()<until)draw();
 },host.parentElement);
 size();update();host.dataset.elements=String(base.children.length);host.dataset.devices=String(deviceMeshes.size);

 return {
  view,walk,home,update,station,
  whole:()=>walk('outside'),
  // Both wings and the court from above, where the shadows of the hour can be read.
  overview:()=>{if(walkState)leave();aim('sun');},
  setNight:on=>setNight(on),
  setSun:v=>{sunVectorNow=v;placeSun();},
  walking:()=>walkState?.zone??null,
  present:current=>presentScene(host,()=>{size();draw();},{current}),
  image:()=>{draw();return canvas.toDataURL('image/png');},
  setActive:on=>loop.setActive(on),
  dispose(){
   if(disposed)return;disposed=true;loop.dispose();resize.disconnect();controls.dispose();stopKeys?.();stopLighten?.();look?.dispose();env.dispose();disposeTree(scene);surfaces.dispose();renderer.dispose();canvas.remove();
  }
 };
}
