// The capsule sorter room in 3D: lights, camera, cables and picking around the equipment drawn in capsule-equipment.mjs.
// The page owns the state; this file asks for it once per frame and shows it.
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {observeScene,timeSlices} from './render-loop.mjs';
import {keyboardOrbit,lightenOnSlowFrames,holdCanvas} from './scene-access.mjs';
import {ProgramGate,roomLight,graphicsIdle} from './program-warmup.mjs';
import {byId,wires} from './src/capsule-project.mjs';
import {routeOn} from './src/capsule-investigation.mjs';
import {buildEquipment} from './capsule-equipment.mjs';

const ROLE={power:'#c57727',control:'#397eaa',signal:'#8158a3'};
// Named views: where to look, and either where to stand or which way to stand back.
const VIEW={
 whole:{target:[-.45,.95,-.3],dir:[.5,.42,1],text:'끌어서 돌리고 휠로 확대합니다.'},
 cabinet:{target:[-2.6,1.12,-1.9],from:[-2.3,1.3,.85],span:2.5,text:'제어반 문을 열고 본 장착판입니다.'},
 operator:{target:[1.95,1.42,.71],from:[2.25,1.56,2.2],span:1.4,text:'조작반 앞에 선 눈높이입니다.'},
 sensor:{target:[.2,1.1,.46],from:[.6,1.2,.66],span:.26,text:'검사 위치의 광전 센서 16개입니다.'},
 dial:{target:[.2,1.05,.05],from:[.75,2.0,1.55],span:1.5,text:'인덱스 다이얼의 여덟 자리입니다.'},
 coil:{target:[.1,20.05,0],from:[.1,20.2,2.2],span:2,text:'릴레이 K1을 잘라 크게 본 모습입니다.'},
 contacts:{target:[.69,20.26,0],from:[.73,20.34,1.2],span:1,text:'가동 접점이 NC에서 NO로 옮겨 갑니다.'}
};
const KEY={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
// Where a person cannot walk: [x min, x max, z min, z max].
const BLOCK=[[-1.15,1.55,-.95,.95],[-3.4,-1.8,-9,-1.25],[1.35,2.55,.35,.85],[-4.4,-3.4,.4,2.8]];

export async function createCapsuleScene(host,{select,onFrame,getState,onContext}={}){
 const pause=timeSlices(),scene=new T.Scene();
 scene.background=new T.Color('#12171c');scene.fog=new T.Fog('#12171c',15,45);
 const camera=new T.PerspectiveCamera(40,1,.025,80);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;
 holdCanvas(host,renderer);
 const canvas=renderer.domElement,badge=document.createElement('div');badge.className='cv-scene-badge';
 await pause();
 const env=await roomLight(renderer,.04);scene.environment=env.texture;scene.environmentIntensity=.65;
 const sun=new T.DirectionalLight('#fff4e4',2.7);sun.position.set(-3,8,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
 Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:1,far:22});sun.shadow.bias=-.0003;sun.shadow.normalBias=.018;
 const fill=new T.DirectionalLight('#d6eaff',1.1);fill.position.set(-5,4,-3);
 const ambient=new T.HemisphereLight('#e9f5ff','#4a5358',.75);
 scene.add(sun,fill,ambient);
 const controls=new OrbitControls(camera,canvas);keyboardOrbit(controls,host);lightenOnSlowFrames(renderer);
 controls.enableDamping=true;controls.dampingFactor=.09;controls.maxPolarAngle=Math.PI*.485;controls.minDistance=.4;controls.maxDistance=21;

 const equipment=await buildEquipment(scene,pause),{groups,pickables}=equipment;
 await pause();

 // Cables: every drawn run as a thin dark cable, and the same runs again in colour for the route lessons.
 const cables=new T.Group(),routes=new T.Group(),routeParts=new Map(),sheath=new T.MeshStandardMaterial({color:'#2a3033',roughness:.7});
 routes.visible=false;scene.add(cables,routes);
 for(const w of wires){
  const path=new T.CurvePath(),pts=w.points.map(p=>new T.Vector3(...p));
  for(let i=1;i<pts.length;i++)if(pts[i].distanceToSquared(pts[i-1])>1e-8)path.add(new T.LineCurve3(pts[i-1],pts[i]));
  if(!path.curves.length)continue;
  const n=Math.max(8,pts.length*6),thin=new T.Mesh(new T.TubeGeometry(path,n,.007,6),sheath);
  thin.userData.deviceId=w.from;thin.castShadow=true;cables.add(thin);pickables.push(thin);
  // Runs that share a duct are set a little apart so each colour stays readable.
  const colour=new T.Color(ROLE[w.role]??ROLE.control),m=new T.MeshStandardMaterial({color:colour,emissive:colour,emissiveIntensity:0,roughness:.5,transparent:true}),i=routes.children.length;
  const tube=new T.Mesh(new T.TubeGeometry(path,n,.009,8),m);tube.position.set((i%3-1)*.026,(Math.floor(i/3)%3-1)*.026,0);
  routes.add(tube);routeParts.set(w.id,m);
 }
 await pause();

 const keys=new Set(),target=new T.Vector3(),offset=new T.Vector3(),size=new T.Vector3(),box=new T.Box3(),ray=new T.Raycaster(),pointer=new T.Vector2();
 let selection,highlight,walk=false,night=false,yaw=0,pitch=0,drag=null,disposed=false,routeVisible=false,activeWanted=true,contextLost=false,teaching=null,traced=null,view='whole',moved=false;

 function highlightDevice(id){
  selection=id;
  if(highlight){scene.remove(highlight);highlight.geometry.dispose();highlight.material.dispose();highlight=null;}
  const g=groups.get(id);if(g){highlight=new T.BoxHelper(g,'#d48a26');scene.add(highlight);}
 }
 const below=d=>d?.id.startsWith('+M-')&&d.pos[1]<.8&&Math.abs(d.pos[2])<.68;
 // Which side to stand on so the device is not hidden behind the panel it is mounted on.
 function side(d){
  if(!d)return [.25,.16,1];
  if(d.kind==='port'||d.kind==='outlet')return [1,.16,.3];
  if(below(d))return [.4,.03,1];
  if(d.id.startsWith('+M-')&&d.pos[2]<-.7)return [-.25,.16,-1];
  return [.25,.16,1];
 }
 function frame(id='whole',reveal=true){
  let v=VIEW[id];const g=v?null:groups.get(id);
  if(!v&&!g){id='whole';v=VIEW.whole;}
  view=id;host.dataset.view=id;moved=false;
  if(walk){walk=false;controls.enabled=true;keys.clear();}
  equipment.showDetail(id==='coil'||id==='contacts',id==='contacts');if(reveal)equipment.reveal(id);
  if(v){
   target.set(...v.target);
   if(v.from){offset.set(...v.from).sub(target);offset.setLength(Math.max(offset.length(),v.span/2/Math.tan(T.MathUtils.degToRad(camera.fov/2))/camera.aspect));}
   else offset.set(...v.dir).normalize().multiplyScalar(Math.max(6.2,7.6/camera.aspect));
   badge.textContent=v.text;
  }else{
   box.setFromObject(g);box.getCenter(target);box.getSize(size);
   const d=byId.get(id),dir=side(d),fit=Math.max(size.y,size.x/camera.aspect);
   let distance=Math.max(.8,fit*(fit>1?.72:1.5)/Math.tan(T.MathUtils.degToRad(camera.fov/2))+size.z*.5);
   if(below(d))distance=Math.max(distance,Math.abs(Math.sign(dir[2])*.69-target.z)+.9);
   offset.set(...dir).normalize().multiplyScalar(distance);
   badge.textContent=below(d)?`${d.name}, 아래 외판을 떼고 본 모습`:`${d?.name??id} 가까이 보기`;
  }
  controls.target.copy(target);camera.position.copy(target).add(offset);controls.update();
 }
 const aim=()=>camera.rotation.set(pitch,yaw,0,'YXZ');
 function enter(){
  walk=true;controls.enabled=false;view='walk';host.dataset.view='walk';equipment.showDetail(false);
  camera.position.set(.2,1.6,2.9);yaw=0;pitch=-.06;aim();badge.textContent='끌어서 둘러보고 화살표로 걷습니다.';
 }
 const free=(x,z)=>x>-3.9&&x<3.2&&z>-2&&z<3.2&&!BLOCK.some(b=>x>b[0]&&x<b[1]&&z>b[2]&&z<b[3]);
 function move(direction,amount=.35){
  moved=true;
  if(walk){
   if(direction==='left'||direction==='right'){yaw+=(direction==='left'?1:-1)*amount*1.1;aim();return;}
   const s=direction==='forward'?1:-1,dx=-Math.sin(yaw)*amount*s,dz=-Math.cos(yaw)*amount*s,p=camera.position;
   if(free(p.x+dx,p.z+dz)){p.x+=dx;p.z+=dz;}else if(free(p.x+dx,p.z))p.x+=dx;else if(free(p.x,p.z+dz))p.z+=dz;
   return;
  }
  // Outside walking mode the same buttons slide the camera over the floor.
  offset.copy(controls.target).sub(camera.position).setY(0).normalize();
  if(direction==='left'||direction==='right')offset.set(offset.z,0,-offset.x).multiplyScalar(direction==='left'?1:-1);
  else if(direction==='back')offset.negate();
  offset.multiplyScalar(amount);camera.position.add(offset);controls.target.add(offset);
 }
 function update(state,status){
  for(const [id,m] of routeParts){const on=routeOn(id,state,status),focus=!traced||traced.has(id);m.opacity=focus?1:.12;m.depthWrite=focus;m.emissiveIntensity=on?(focus?.8:.08):0;}
 }
 function draw(force){
  if(!walk)controls.update();
  if(!force&&!gate.check(scene,camera))return false;
  renderer.render(scene,camera);return true;
 }
 function resize(){
  const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  // A pane that only changed size keeps the door as the learner left it.
  if(!moved&&!walk)frame(view,false);
  draw();
 }

 const down=e=>{drag={x:e.clientX,y:e.clientY,px:e.clientX,py:e.clientY,far:false};};
 const slide=e=>{
  if(!drag)return;
  if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5)drag.far=true;
  if(walk){yaw-=(e.clientX-drag.px)*.005;pitch=Math.max(-1.2,Math.min(1.2,pitch-(e.clientY-drag.py)*.005));aim();}
  drag.px=e.clientX;drag.py=e.clientY;
 };
 const up=e=>{
  const d=drag;drag=null;if(!d||d.far||e.target!==canvas)return;
  const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);
  for(const hit of ray.intersectObjects(pickables,false)){
   let shown=true;for(let p=hit.object;p;p=p.parent)if(!p.visible){shown=false;break;}
   if(shown){select?.(hit.object.userData.deviceId);break;}
  }
 };
 const wheel=e=>{if(!walk)return;e.preventDefault();move(e.deltaY<0?'forward':'back',.3);};
 const keydown=e=>{if(!walk||document.activeElement!==host||!KEY[e.code])return;e.preventDefault();keys.add(KEY[e.code]);};
 const keyup=e=>{keys.delete(KEY[e.code]);};
 const blur=()=>keys.clear();
 const steered=()=>{moved=true;};
 const loss=e=>{e.preventDefault();contextLost=true;loop.setActive(false);host.dataset.context='lost';onContext?.(false);badge.textContent='3D 연결이 중단되었습니다. ';const retry=document.createElement('button');retry.dataset.action='retry';retry.textContent='3D 다시 불러오기';badge.append(retry);};
 const recovered=()=>{contextLost=false;host.dataset.context='ready';onContext?.(true);badge.textContent='3D 연결을 복구했습니다.';loop.setActive(activeWanted);draw();};
 host.dataset.context='ready';
 canvas.addEventListener('webglcontextlost',loss);canvas.addEventListener('webglcontextrestored',recovered);
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('wheel',wheel,{passive:false});controls.addEventListener('start',steered);
 addEventListener('pointermove',slide);addEventListener('pointerup',up);addEventListener('keydown',keydown);addEventListener('keyup',keyup);addEventListener('blur',blur);

 await graphicsIdle(renderer);
 canvas.style.display='';host.replaceChildren(canvas,badge);
 const gate=new ProgramGate(renderer,{host});
 const observer=new ResizeObserver(resize);observer.observe(host);
 const loop=observeScene(host,dt=>{
  const {state,status}=onFrame(dt);update(state,status);equipment.animate(state,status,dt);
  const travel=equipment.travel().toFixed(2);if(host.dataset.contactTravel!==travel)host.dataset.contactTravel=travel;
  for(const direction of keys)move(direction,dt*1.4);
  draw();
 },host.closest('#cv-app')??host);
 frame();resize();
 const initial=getState();update(initial.state,initial.status);equipment.animate(initial.state,initial.status,0);draw();

 return {frame,enter,move,draw,select:highlightDevice,update,
  teaching(id){teaching=id;},
  setActive:v=>{activeWanted=v;keys.clear();loop.setActive(v&&!contextLost);if(v&&!contextLost)resize();},
  traceRoutes(ids){traced=ids?new Set(ids):null;},
  routes(v){routeVisible=v;routes.visible=v;},
  setDoor(v){equipment.setDoor(v);},isDoorOpen:equipment.isDoorOpen,
  night(v){night=v;sun.intensity=v?.18:2.7;fill.intensity=v?.4:1.1;ambient.intensity=v?.2:.75;scene.environmentIntensity=v?.22:.65;scene.background.set(v?'#0b1114':'#12171c');scene.fog.color.copy(scene.background);},
  capture(){draw(true);return canvas.toDataURL('image/png');},
  isWalking:()=>walk,
  state:()=>({view,selection,teaching,night,routeVisible}),
  dispose(){
   if(disposed)return;disposed=true;gate.dispose();loop.dispose();observer.disconnect();controls.dispose();
   removeEventListener('pointermove',slide);removeEventListener('pointerup',up);removeEventListener('keydown',keydown);removeEventListener('keyup',keyup);removeEventListener('blur',blur);
   canvas.removeEventListener('webglcontextlost',loss);canvas.removeEventListener('webglcontextrestored',recovered);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('wheel',wheel);
   env.dispose?.();renderer.dispose();
  }};
}
