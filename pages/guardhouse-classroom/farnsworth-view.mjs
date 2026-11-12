// The Farnsworth scene: a steel and glass room lifted over a river meadow, built from data and walked from the grass to the bed.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createModelGroup,disposeModelResources as disposeTree} from './src/scene.mjs';
import {farnsworthModel,colors,FLOOR,CEIL,PORCH,G,MOD,CORE,TERR} from './src/farnsworth-model.mjs';
import {project,rooms,panel,equipment,fireDevices,stations} from './src/farnsworth-project.mjs';
import {sunPosition,sunVector,dayOfYear} from './src/energy-engine.mjs';
import {SurfaceLibrary,worldUV} from './surface-materials.mjs';
import {SceneLook,qualityTier} from './scene-quality.mjs';
import {observeScene,presentScene,timeSlices} from './render-loop.mjs';
import {roomLight,graphicsIdle} from './program-warmup.mjs';
import {keyboardOrbit,lightenOnSlowFrames,createRenderer,holdCanvas,seatCanvas} from './scene-access.mjs';
import {createLampHalos} from './masters-power-view.mjs';
import {point,deviceMesh,pipe,mergeContext,zones,indoorAt,walkableAt} from './farnsworth-scene-parts.mjs';
import {travertine,veneer} from './farnsworth-textures.mjs';
import {furnish} from './farnsworth-furniture.mjs';
import {buildLand} from './farnsworth-land.mjs';

export const prepareFarnsworthMaterials=()=>SurfaceLibrary.prepare();
// Midsummer afternoon at Plano: the sun stands in the south-west and the maple lays its shadow over the terrace.
export const summerSun=()=>sunVector(sunPosition(dayOfYear(6,21),15.5,project.site));
const REACH=150,OPEN=1.42,HINGES=[[PORCH,3.59],[PORCH,5.67]];
// Everything the study views have to keep in frame: both slabs, the stair, the piers, and for the fire view the escape path down to the grass.
const solid=(z0,z1,low,path=-8.7)=>[[[-.2,-.3,z0],[23.7,8.95,z1]],[[-6.9,-7.1,z0],[10.25,0,low]],[[2.8,path,z0],[6.4,-7,low]]];
const HOUSE=solid(0,5,1),PLAN=solid(.6,4.5,1.1),ESCAPE=solid(0,4.5,1.1,-11.7);
const homes={
 outside:{pos:[-13.5,-17.5,2.3],at:[8.6,1.6,2.9],fov:40},
 site:{pos:[-13,-29,21],tall:[-11,-21.5,19],at:[9,-1.5,.8],fov:34,box:HOUSE},
 section:{pos:[-17,0,3],at:[4.6,0,2.2],fov:30,box:HOUSE},
 materials:{pos:[.4,-7.2,3.9],at:[8.4,1.6,2.7],fov:36},
 frame:{pos:[-12,-20,13],tall:[-10,-18,15],at:[10,2,2],fov:34,box:HOUSE},
 joint:{pos:[4.9,-5.8,2.5],at:[8.38,.2,4.05],fov:32},
 power:{pos:[8.4,-17,20],tall:[-3.6,-11.8,22],at:[8.4,.2,1.6],fov:36,box:PLAN},
 fire:{pos:[8.4,-18,23],tall:[-3.6,-11,22],at:[8.4,1,1.2],fov:36,box:ESCAPE}
};
homes.circuit=homes.power;
const clipFor={section:[[1,0,0],-4.6],power:[[0,-1,0],CEIL-.02],circuit:[[0,-1,0],CEIL-.02],fire:[[0,-1,0],CEIL-.02]};
const bones=new Set(['frame','joint']),structural=d=>/^(col|foot|girder|floor-fascia|roof-fascia|terrace-fascia|service-stack|stair-\w+-stringer)/.test(d.id??'');
const tone=new Map(Object.entries(colors).map(([name,hex])=>[new THREE.Color(hex).getHex(),name]));

// Slab joints start at the element's own corner: one UV unit is one slab.
function slabUV(geometry,x0,y0){
 const p=geometry.attributes.position,n=geometry.attributes.normal,uv=new Float32Array(p.count*2);
 for(let i=0;i<p.count;i++){
  const x=p.getX(i)-x0,y=-p.getZ(i)-y0,z=p.getY(i),flat=Math.abs(n.getY(i))>.5,side=Math.abs(n.getX(i))>.5;
  uv[i*2]=side?y/MOD[1]:x/MOD[0];uv[i*2+1]=flat?y/MOD[1]:z/MOD[1];
 }
 geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
}

// The model is put together in slices, so the page keeps answering while it is built. The canvas is shown once the scene is whole.
export async function mountFarnsworth(host,select){
 const pause=timeSlices(),renderer=createRenderer(THREE,host,{antialias:true,preserveDrawingBuffer:true}),canvas=renderer.domElement;
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.localClippingEnabled=true;
 canvas.setAttribute('aria-label','판스워스 주택 3D 모델');canvas.tabIndex=0;holdCanvas(host,renderer);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x12171c);
 const camera=new THREE.PerspectiveCamera(36,1,.15,40000);
 const ambient=new THREE.HemisphereLight(0xe9f2f4,0x7d7566,1.5),sun=new THREE.DirectionalLight(0xfff0d9,2.2);
 sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.normalBias=.03;sun.target.position.copy(point([project.center[0],project.center[1],0]));
 Object.assign(sun.shadow.camera,{left:-34,right:34,top:34,bottom:-34,near:1,far:420});scene.add(ambient,sun,sun.target);
 await pause();
 const env=await roomLight(renderer);
 scene.environment=env.texture;

 await pause();
 const base=createModelGroup(farnsworthModel());await pause();
 const context=mergeContext(base),building=new THREE.Group();
 building.add(base,context);
 const view={scene,renderer,host,camera,active:camera,sun,ambient,ground:null,site:null,base:building,environment:env.texture,project,realistic:true,studio:true,night:false,fpv:false,mode:'orbit',setNight};
 await pause();
 const {land,ground,site}=await buildLand(renderer,qualityTier(),pause);view.ground=ground;view.site=site;scene.add(building,land,ground,site);
 const look=renderer.noGPU?null:new SceneLook(view),surfaces=new SurfaceLibrary(renderer),clip=[];
 await pause();
 const stone=travertine(renderer);await pause();
 const woods={
  primavera:veneer(renderer,{base:'#c9995a',dark:'#8b5e2e',light:'#e6c088',panel:1.2,from:FLOOR,seed:3}),
  teak:veneer(renderer,{base:'#96693f',dark:'#5e3d20',light:'#b98a58',panel:.6,from:FLOOR,seed:8})};
 const cut=m=>{m.clippingPlanes=clip;m.clipShadows=true;return m;};let soffit=null;
 const leather=cut(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.62})),chrome=cut(new THREE.MeshStandardMaterial({color:0xdfe2e3,metalness:1,roughness:.16}));
 const tableGlass=cut(new THREE.MeshStandardMaterial({color:0xa9c0c2,transparent:true,opacity:.32,roughness:.04,depthWrite:false}));
 function dress(mesh){
  const d=mesh.userData,m=cut(mesh.material),name=tone.get(m.color.getHex());
  if(d.kind==='window-glass'){m.envMapIntensity=.55;m.depthWrite=false;mesh.castShadow=false;look?.glass(m);m.roughness=.17;return;}
  const made=d.kind==='furniture'&&furnish(d,new THREE.Box3().setFromBufferAttribute(mesh.geometry.attributes.position));
  if(made){
   mesh.geometry.dispose();m.dispose();mesh.geometry=made.solid??made.chrome;mesh.material=made.solid?leather:chrome;
   const add=(geometry,material,shadow=true)=>{const part=new THREE.Mesh(geometry,material);part.userData={id:d.id};part.castShadow=shadow;part.receiveShadow=true;mesh.add(part);};
   if(made.solid&&made.chrome)add(made.chrome,chrome);if(made.glass)add(made.glass,tableGlass,false);return;
  }
  if(name==='steel'){m.roughness=.36;m.metalness=0;return;}
  if(name==='stainless'){m.roughness=.26;m.metalness=.92;return;}
  if(name==='travertine'){
   const box=new THREE.Box3().setFromBufferAttribute(mesh.geometry.attributes.position),own=d.id!=='floor-travertine';
   slabUV(mesh.geometry,own?box.min.x:0,own?-box.max.z:G);m.color.set(0xffffff);Object.assign(m,stone);m.needsUpdate=true;return;
  }
  if(woods[name]){worldUV(mesh.geometry);m.color.set(0xffffff);Object.assign(m,woods[name]);m.needsUpdate=true;return;}
  if(name==='concrete'){worldUV(mesh.geometry);surfaces.apply(m,'concrete',m.color.getHex());return;}
  m.roughness=name==='plaster'?.92:name==='dark'?.55:1;if(d.id==='ceiling')soffit=m;
 }
 await pause();
 for(const mesh of [...base.children,...context.children])if(mesh.isMesh){await pause();dress(mesh);}
 await pause();
 for(const mesh of context.children)cut(mesh.material);

 // The two door leaves swing out onto the veranda about their hinges.
 const leaves=[1,2].map(i=>base.children.filter(o=>o.userData.leaf===i));let doorNow=0,doorGoal=0;
 function swing(a){
  doorNow=a;leaves.forEach((list,i)=>{
   const t=i?-a:a,p=point([...HINGES[i],0]),c=Math.cos(t),s=Math.sin(t);
   for(const mesh of list){mesh.rotation.y=t;mesh.position.set(p.x-(p.x*c+p.z*s),0,p.z-(-p.x*s+p.z*c));mesh.updateMatrixWorld(true);}
  });
  renderer.shadowMap.needsUpdate=true;
 }

 const devices=new THREE.Group(),deviceMeshes=new Map(),electricIds=new Set([panel.id,...equipment.map(d=>d.id)]);
 for(const d of [panel,...equipment,...fireDevices]){const g=deviceMesh(d);g.userData.kind=d.kind;
  // Every second uplight carries a real light, so the scene stays light on weak graphics.
  if(d.kind==='light'&&Number(d.id.slice(2))%2===0){g.remove(g.userData.glow);g.userData.glow=null;}
  deviceMeshes.set(d.id,g);devices.add(g);}
 // What the white ceiling gives back to the room, one soft light on each side of the core.
 const bounce=new THREE.Group(),mid=[(CORE.x0+CORE.x1)/2,(CORE.y0+CORE.y1)/2];
 for(const [x,y] of [[CORE.x0-1.6,mid[1]],[CORE.x1+1.5,mid[1]],[mid[0],CORE.y0-1.5],[mid[0]-2.4,CORE.y1+.7]]){const l=new THREE.PointLight(0xffe2bd,0,13,1.6);l.position.copy(point([x,y,CEIL-1.3]));bounce.add(l);}
 const routes=new THREE.Group(),highlight=new THREE.BoxHelper(new THREE.Object3D(),0xe0903a);highlight.material.depthTest=false;highlight.renderOrder=10;highlight.visible=false;
 const marker=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xe8b572,transparent:true,opacity:.4,depthWrite:false,side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.visible=false;
 scene.add(devices,bounce,routes,highlight,marker);
 const halos=createLampHalos(deviceMeshes);scene.add(halos.group);

 const controls=new OrbitControls(camera,canvas);view.controls=controls;controls.enableDamping=true;controls.dampingFactor=.12;controls.minDistance=1.5;controls.maxDistance=160;controls.maxPolarAngle=Math.PI*.495;
 const stopKeys=keyboardOrbit(controls,canvas),stopLighten=lightenOnSlowFrames(renderer);
 let dirty=true,until=0,disposed=false,state={view:null,studio:true,id:null,show:'electrical',open:false,routeKey:''},walkState=null,sunVectorNow=null,spinning=false,aimed=null,moved=false;
 const wake=(ms=900)=>{dirty=true;until=performance.now()+ms;};
 // While shaders for a new picture are still being built the old picture stays, and the frame is asked for again when they are ready.
 const draw=force=>{if(look){if(!look.render(force))return false;}else renderer.render(scene,camera);dirty=false;return true;};
 if(look)look.onReady=()=>wake();
 const size=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
 const doors=()=>{doorGoal=state.open||(walkState&&walkState.zone!=='yard'&&walkState.zone!=='terrace')?OPEN:0;wake();};

 function placeSun(){
  const t=sun.target.position,v=view.studio?[-.42,-.5,.76]:sunVectorNow??summerSun();
  sun.position.set(t.x+v[0]*REACH,t.y+Math.max(v[2],.02)*REACH,t.z-v[1]*REACH);renderer.shadowMap.needsUpdate=true;look?.invalidate();wake();
 }
 function setNight(on){
  view.night=!!on;const s=view.studio,k=s&&view.power?.36+.64*(view.share??1):1;scene.background.set(s?0x12171c:on?0x172638:0xb9ccd4);
  ambient.intensity=(s?.3:on?.16:.75)*k;sun.intensity=(s?1.35:on?.1:3.2)*k;sun.color.set(on&&!s?0xaac9ff:0xfff0d9);
  // By day the plaster overhead is lit from below by the sunlit stone and grass; no lamp in the scene does that, so the ceiling carries it itself.
  if(soffit){soffit.emissive.set(0xf0ede5);soffit.emissiveIntensity=s||on?0:.3;}
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
  const far=h.box?frame(h,to,back,shape):shape<1?reach*1.7:reach;
  from.copy(to).addScaledVector(back,far);aimed=id;moved=false;
  camera.near=.15;camera.fov=h.fov;camera.position.copy(from);controls.target.copy(to);camera.updateProjectionMatrix();controls.update();wake();
 }
 const home=()=>{if(walkState)station(walkState.zone);else aim(state.studio?state.view:'outside');};

 // Walking: the eye follows a point that stays inside the zone's rectangles. Veranda and room are one floor, so the light changes at the door.
 function eye(){
  const w=walkState,z=zones[w.zone],inside=indoorAt(w.zone,w.x,w.y);if(inside!==view.fpv){view.fpv=inside;look?.invalidate();}
  camera.near=.06;camera.position.copy(point([w.x,w.y,z.z+z.eye]));camera.rotation.set(w.pitch,w.yaw,0,'YXZ');camera.updateProjectionMatrix();
  host.dataset.walk=[w.zone,w.x.toFixed(2),w.y.toFixed(2)].join(' ');host.dataset.indoor=String(inside);wake();
 }
 function station(id){
  const s=stations.find(s=>s.id===id)??stations[0];walkState={zone:s.id,x:s.pos[0],y:s.pos[1],yaw:Math.atan2(-s.look[0],s.look[1]),pitch:0};
  controls.enabled=false;camera.fov=64;view.mode=s.id;host.dataset.walking='true';host.dataset.zone=s.id;look?.invalidate();doors();eye();
 }
 function leave(){walkState=null;controls.enabled=true;view.fpv=false;view.mode='orbit';host.dataset.walking='false';delete host.dataset.zone;delete host.dataset.walk;delete host.dataset.indoor;look?.invalidate();doors();aim(state.studio?state.view:'outside');}
 function walk(action){
  if(action==='outside')return leave();
  if(zones[action])return station(action);
  if(!walkState)return;const w=walkState,step=w.zone==='yard'?1.1:.45;
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
 function update({view:name='site',studio=true,id=null,show='electrical',devices:live=[],paths=[],night=view.night,open=false,power=false}={}){
  const changed=name!==state.view||studio!==state.studio;state={...state,view:name,studio,id,show,open};
  if(changed){
   view.studio=studio;clip.length=0;const c=studio&&clipFor[name];if(c)clip.push(new THREE.Plane(new THREE.Vector3(...c[0]),c[1]));
   const skeleton=studio&&bones.has(name);for(const mesh of base.children)mesh.visible=!skeleton||structural(mesh.userData);
   context.visible=!skeleton;land.visible=ground.visible=site.visible=!studio;
   if(studio&&walkState){walkState=null;controls.enabled=true;view.fpv=false;view.mode='orbit';host.dataset.walking='false';delete host.dataset.zone;}
   placeSun();if(!walkState)aim(studio?name:'outside');
  }
  // In the power lesson the room dims with every lamp that loses power.
  const lights=live.filter(d=>d.kind==='light'),share=lights.length?lights.filter(d=>d.on).length/lights.length:1,dimmed=power!==view.power||share!==view.share;view.power=power;view.share=share;
  if(changed||dimmed||night!==view.night)setNight(night);
  const on=new Map(live.map(d=>[d.id,d])),skeleton=studio&&bones.has(name);spinning=false;let lamps=0;
  for(const [key,g] of deviceMeshes){
   const electric=electricIds.has(key),d=on.get(key),lit=!!d?.on;g.visible=!skeleton&&(show==='all'||(show==='fire')!==electric);
   const dot=g.userData.indicator?.material,lamp=g.userData.kind==='light';
   if(dot){dot.emissive.set(lit?(lamp?0xfff0d0:0xff5a3c):0x000000);dot.emissiveIntensity=lit?(lamp?2.6:1.1):0;}
   if(lamp&&lit)lamps++;
   if(g.userData.glow)g.userData.glow.intensity=lit&&(power||!studio)?(power?2.8:view.night?2.4:1):0;
   halos.show(key,g,{lit,power,visible:g.visible});
   if(g.userData.rotor){g.userData.spin=lit;spinning||=lit&&(power||!studio);}
  }
  for(const l of bounce.children)l.intensity=studio?0:lamps*(view.night?2.6:.5);
  const keyNow=JSON.stringify(paths);
  if(keyNow!==state.routeKey){state.routeKey=keyNow;for(const o of [...routes.children]){routes.remove(o);o.traverse(m=>{m.geometry?.dispose();});o.userData.material?.dispose();}
   for(const p of paths){const material=new THREE.MeshBasicMaterial({color:p.color,depthTest:!p.through});const line=pipe(p.points,material,p.radius??.03);line.userData.material=material;line.renderOrder=p.through?9:0;routes.add(line);}}
  doors();mark(id);host.dataset.view=name;host.dataset.studio=String(studio);host.dataset.pathPoints=String(paths.reduce((n,p)=>n+p.points.length,0));wake();
 }

 // The loop draws from its first frame, so the graphics process is given time to catch up before it starts.
 await graphicsIdle(renderer);
 const loop=observeScene(host,dt=>{
  if(!walkState&&controls.update())dirty=true;
  if(doorNow!==doorGoal){const d=doorGoal-doorNow,stepNow=Math.min(Math.abs(d),dt*2.4);swing(doorNow+Math.sign(d)*stepNow);if(state.id)mark(state.id);look?.invalidate();dirty=true;host.dataset.doors=doorNow.toFixed(2);}
  if(spinning){for(const g of deviceMeshes.values())if(g.userData.spin)g.userData.rotor.rotation.z+=dt*9;dirty=true;}
  if(dirty||performance.now()<until)draw();
 },host.parentElement);
 seatCanvas(host,canvas);size();update();host.dataset.elements=String(base.children.length);host.dataset.devices=String(deviceMeshes.size);host.dataset.doors='0.00';

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
   for(const t of [stone.map,stone.bumpMap,woods.primavera.map,woods.teak.map])t.dispose();
   disposeTree(scene);surfaces.dispose();renderer.dispose();canvas.remove();
  }
 };
}
