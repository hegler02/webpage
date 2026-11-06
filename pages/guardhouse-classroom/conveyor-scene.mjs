import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {devices,byId,wires} from './src/conveyor-project.mjs';
import {observeScene} from './render-loop.mjs';
import {createEquipment} from './conveyor-equipment.mjs';
import {routeOn} from './src/conveyor-investigation.mjs';

export function createConveyorScene(host,{select,onFrame,getState,onContext}){
 const scene=new T.Scene();scene.background=new T.Color('#12171c');scene.fog=new T.Fog('#12171c',15,45);
 const camera=new T.PerspectiveCamera(40,1,.025,80);const renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;host.replaceChildren(renderer.domElement);
 const badge=document.createElement('div');badge.className='cv-scene-badge';badge.textContent='모터 → 감속기 → 벨트 · 기기를 눌러 연결 확인';host.append(badge);
 const pmrem=new T.PMREMGenerator(renderer),envScene=new RoomEnvironment(),env=pmrem.fromScene(envScene,.04);scene.environment=env.texture;pmrem.dispose();envScene.dispose();
 const sun=new T.DirectionalLight('#fff4e4',2.7);sun.position.set(-3,8,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:1,far:22});sun.shadow.bias=-.0003;sun.shadow.normalBias=.018;const ambient=new T.HemisphereLight('#e9f5ff','#4a5358',.75);scene.add(sun,ambient);scene.environmentIntensity=.65;
 const fill=new T.DirectionalLight('#d6eaff',1.1);fill.position.set(-5,4,-3);scene.add(fill);
 const mat=(color,metalness=0,roughness=.65)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const m={steel:mat('#a8b5ba',.8,.3),dark:mat('#263c43',.35,.48),belt:mat('#253b39',.05,.88),cream:mat('#e2e5df',.15,.4),blue:mat('#25576f',.45,.42),black:mat('#222829',.1,.6),copper:mat('#b66b36',.8,.25),wood:mat('#bd955b',0,.85),yellow:mat('#e8b630',.1,.45),red:mat('#b52d24',.1,.38),green:mat('#167e5e',.15,.4),glass:new T.MeshPhysicalMaterial({color:'#c9e7ef',transparent:true,opacity:.22,roughness:.14,metalness:.05,depthWrite:false})};
 const groups=new Map(),pickables=[],rotors=[],beltSeams=[],lights=new Map();let selection,highlight,walk=false,inside=false,night=false,yaw=0,pitch=0,drag=null,disposed=false,routeVisible=false,activeWanted=true,contextLost=false,teaching=null;
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.09;controls.maxPolarAngle=Math.PI*.485;controls.minDistance=.4;controls.maxDistance=21;
 function mesh(geometry,material,parent,pos=[0,0,0]){const o=new T.Mesh(geometry,material);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const box=(p,size,pos,material)=>mesh(new T.BoxGeometry(...size),material,p,pos);
 const cyl=(p,r,h,pos,material,axis='y',segments=24)=>{const o=mesh(new T.CylinderGeometry(r,r,h,segments),material,p,pos);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o;};
 function tube(p,points,r,material){const curve=new T.CurvePath();points.slice(1).forEach((v,i)=>curve.add(new T.LineCurve3(new T.Vector3(...points[i]),new T.Vector3(...v))));return mesh(new T.TubeGeometry(curve,Math.max(8,points.length*8),r,6,false),material,p);}
 function label(p,text,pos,w=.3,h=.07){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#f4f5ed';c.fillRect(0,0,512,128);c.fillStyle='#263c43';c.font='bold 56px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,64,490);const tx=new T.CanvasTexture(canvas);tx.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tx}),p,pos);o.castShadow=false;return o;}
 function screw(p,x,y,z){cyl(p,.012,.008,[x,y,z],m.steel,'z',8);box(p,[.014,.002,.002],[x,y,z+.006],m.dark);}
 function terminal(p,x,y,z,color=m.cream){box(p,[.065,.1,.09],[x,y,z],color);cyl(p,.014,.006,[x,y+.025,z+.048],m.steel,'z',12);cyl(p,.012,.006,[x,y-.025,z+.048],m.steel,'z',12);}
 const equipment=createEquipment({materials:m,label});
 const ground=new T.Group();scene.add(ground);
 box(ground,[24,.08,20],[0,-.07,0],mat('#1d242b',.08,.86));
 for(const z of [-1.38,1.38])box(ground,[6,.004,.045],[0,-.021,z],m.yellow);
 for(const x of [-3,3])box(ground,[.045,.004,2.8],[x,-.021,0],m.yellow);
 // The grouped mesh is the physical device; all subparts retain its one ID.
 for(const d of devices){const g=new T.Group();g.position.set(...d.pos);g.userData.deviceId=d.id;groups.set(d.id,g);scene.add(g);
  if(equipment.build(d,g)){
  }else if(d.kind==='conveyor'){
   box(g,[4.88,.11,1.02],[0,0,0],m.belt);for(const x of [-2.44,2.44])cyl(g,.1,1.04,[x,-.015,0],m.dark,'z');
   for(const z of [-.6,.6]){box(g,[5.15,.22,.09],[0,-.015,z],m.steel);box(g,[5.12,.035,.025],[0,.15,z],m.blue);for(const x of [-2.2,-.7,.7,2.2]){box(g,[.07,.68,.07],[x,-.45,z],m.steel);box(g,[.28,.025,.22],[x,-.795,z],m.dark);cyl(g,.025,.09,[x,-.74,z],m.steel);screw(g,x,.035,z+.05);}}
   for(const x of [-2.2,0,2.2])box(g,[.08,.08,1.14],[x,-.55,0],m.steel);
   for(let i=0;i<24;i++){const o=box(g,[.013,.003,.99],[-2.4+i*.2,.057,0],m.dark);beltSeams.push(o);}
   for(let i=0;i<16;i++)cyl(g,.045,1.07,[-2.25+i*.3,-.1,0],m.steel,'z',12);
   label(g,'CV1 · CONVEYOR',[0,.025,.652],.7,.105);
  }else if(d.kind==='operator'){
   box(g,d.size,[0,0,0],m.cream);box(g,[.85,.3,.015],[0,0,.158],m.steel);box(g,[.07,1.1,.07],[0,-.72,0],m.steel);box(g,[.55,.06,.5],[0,-1.25,0],m.dark);label(g,'OP1 · OPERATOR',[0,.23,.16],.65,.08);
  }else if(['selector','reset','estop','lamp'].includes(d.kind)){
   cyl(g,d.size[0]*.58,.025,[0,0,0],m.steel,'z');const surface=mat(d.kind==='estop'?'#bc3027':d.kind==='reset'?'#247baf':d.kind==='lamp'?'#12513a':'#252d2c',.1,.35);const o=cyl(g,d.size[0]*.45,.045,[0,0,.029],surface,'z');lights.set(d.id,o);
   if(d.kind==='selector')box(g,[.017,.075,.035],[0,0,.06],m.black);if(d.kind==='estop'){cyl(g,.072,.008,[0,0,-.02],m.yellow,'z');cyl(g,.06,.035,[0,0,.055],m.red,'z');}label(g,d.id,[0,-.075,.035],.17,.035);
  }else if(d.kind==='contactor'){
   const casing=box(g,d.size,[0,0,0],m.black);casing.name='contactor-case';box(g,[.23,.2,.035],[0,0,.11],m.cream);for(const y of [-.145,.145])for(const x of [-.09,0,.09]){terminal(g,x,y,.11);}
   const press=box(g,[.09,.065,.02],[0,.015,.14],m.blue.clone());lights.set(d.id,press);label(g,'-07K1',[0,-.07,.133],.2,.04);
  }else if(d.kind==='relay'){
   box(g,d.size,[0,0,0],m.dark);box(g,[.105,.15,.08],[0,.01,.08],m.glass);box(g,[.07,.06,.045],[0,0,.075],m.copper);const o=box(g,[.035,.025,.012],[0,.07,.125],mat('#194b31'));lights.set(d.id,o);label(g,'K1',[0,-.08,.085],.08,.03);
  }else if(d.kind==='transformer'){
   box(g,[.32,.3,.16],[0,0,0],m.dark);for(let i=0;i<12;i++)box(g,[.325,.009,.165],[0,-.14+i*.025,0],m.steel);box(g,[.15,.2,.16],[0,0,.08],m.copper);label(g,'380 / 120 V',[0,0,.166],.24,.05);for(const x of [-.1,.1])terminal(g,x,-.15,.08);
  }else if(d.kind==='plc'){
   box(g,d.size,[0,0,0],m.dark);for(let i=0;i<5;i++){box(g,[.125,.31,.025],[-.3+i*.15,0,.102],m.cream);for(let j=0;j<7;j++)box(g,[.06,.008,.008],[-.3+i*.15,-.1+j*.02,.119],m.dark);}
   label(g,'PLC1 · INPUT',[-.14,.135,.12],.42,.055);
   for(let i=0;i<3;i++){const led=cyl(g,.014,.012,[.24,.07-i*.07,.13],mat('#17452d'),'z',12);lights.set('input'+i,led);label(g,['00','01','07'][i],[.3,.07-i*.07,.14],.05,.025);}
  }else if(d.kind==='terminal'){
   for(let i=0;i<d.quantity;i++)terminal(g,(i-(d.quantity-1)/2)*.078,0,0,i===3?m.green:m.cream);label(g,d.id,[0,-.095,.05],.25,.045);
  }else if(d.kind==='sensor'){
   cyl(g,.034,.15,[0,0,0],m.steel,'z',16);cyl(g,.03,.006,[0,0,.08],m.black,'z');box(g,[.05,.16,.045],[0,-.06,-.04],m.dark);const led=cyl(g,.012,.008,[0,.019,-.08],mat('#66441b'),'z',12);lights.set(d.id,led);label(g,d.id,[0,.09,.08],.22,.045);const rearTag=label(g,d.id,[0,.09,-.085],.22,.045);rearTag.rotation.y=Math.PI;
  }else if(d.kind==='connector'){
   box(g,d.size,[0,0,0],m.steel);box(g,[.13,.11,.045],[0,0,.1],m.dark);for(const x of [-.03,.03])for(const y of [-.025,.025])cyl(g,.009,.012,[x,y,.13],m.copper,'z',10);label(g,'U V W PE',[0,-.1,.11],.27,.04);
  }else if(d.kind==='isolator'){
   box(g,d.size,[0,0,0],m.yellow);cyl(g,.06,.03,[0,0,.11],m.red,'z');box(g,[.025,.1,.04],[0,0,.14],m.dark);label(g,'-02Q2',[0,-.085,.1],.15,.035);
  }else{
   box(g,d.size,[0,0,0],m.cream);for(let i=0;i<3;i++){box(g,[.055,.13,.025],[(i-1)*.07,0,d.size[2]/2+.01],m.dark);screw(g,(i-1)*.07,.1,d.size[2]/2+.015);screw(g,(i-1)*.07,-.1,d.size[2]/2+.015);}label(g,d.id,[0,-.065,d.size[2]/2+.03],d.size[0]*.9,.035);
  }
  equipment.detail(d,g);
  for(const o of lights.values())o.userData.articulated=true;
  equipment.finish(g,d.id);
  g.traverse(o=>{if(o.isMesh){o.userData.deviceId=d.id;pickables.push(o);}});
 }
 // A separate enlarged cross-section uses the same K1 state, never a second device.
 const detail=new T.Group();detail.position.set(-.4,1.3,-2);detail.visible=false;scene.add(detail);box(detail,[.8,.12,.5],[0,-.35,0],m.dark);
 const core=box(detail,[.12,.44,.2],[0,-.08,0],m.steel.clone());for(let i=0;i<19;i++){const ring=mesh(new T.TorusGeometry(.16,.018,8,24),m.copper,detail,[0,-.25+i*.018,0]);ring.rotation.x=Math.PI/2;}
 const magnetic=new T.Group();detail.add(magnetic);const fieldMaterial=new T.MeshBasicMaterial({color:'#217fb3',transparent:true,opacity:.65});
 for(const z of [-.13,0,.13]){const pts=Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*2;return [.29*Math.cos(a),.015+.3*Math.sin(a),z];});tube(magnetic,pts,.004,fieldMaterial);}
 magnetic.visible=false;
 const armature=new T.Group();detail.add(armature);box(armature,[.66,.08,.24],[0,.27,0],m.steel);for(const x of [-.26,0,.26]){box(detail,[.08,.045,.15],[x,.49,.18],m.copper);box(detail,[.04,.04,.2],[x,.49,.03],m.dark);box(armature,[.035,.3,.035],[x,.445,.26],m.dark);box(armature,[.08,.04,.15],[x,.62,.18],m.copper);}label(detail,'K1 · A1 / A2',[0,-.5,.27],.85,.11);
 const pallet=new T.Group();scene.add(pallet);for(const z of [-.36,0,.36])box(pallet,[.75,.06,.12],[0,0,z],m.wood);for(const x of [-.28,0,.28])box(pallet,[.12,.08,.82],[x,.07,0],m.wood);box(pallet,[.65,.28,.61],[0,.25,0],m.cream);box(pallet,[.5,.02,.08],[0,-.035,-.49],m.steel);label(pallet,'METAL TARGET',[0,.2,.31],.48,.08);
 const cables=new T.Group();scene.add(cables);
 for(const w of wires){const o=tube(cables,w.points,.007,m.cable);o.userData.deviceId=w.from;o.userData.wire=w;pickables.push(o);}
 const routes=new T.Group();routes.visible=false;scene.add(routes);const routesMap=new Map();let tracedRoutes=null;
 for(const w of wires){const material=mat(w.role==='power'?'#c57727':w.role==='control'?'#397eaa':'#8158a3',.2,.5);const o=tube(routes,w.points,.012,material);o.userData.deviceId=w.from;pickables.push(o);routesMap.set(w.id,o);}
 function highlightDevice(id){selection=id;if(highlight){scene.remove(highlight);highlight.geometry.dispose();highlight.material.dispose();highlight=null;}const g=groups.get(id);if(g){highlight=new T.BoxHelper(g,'#d48a26');scene.add(highlight);}}
 function frame(id='whole'){
  id=({CV1:'whole',CAB1:'cabinet',OP1:'operator'})[id]??id;
  const cutaway=['coil','contacts'].includes(id);walk=false;controls.enabled=true;detail.visible=cutaway;inside=cutaway;
  if(id==='cabinet'||(byId.get(id)?.pos[2]<-1.5&&id!=='CAB1'))equipment.setDoor(true);
  const cabinetOnly=id==='cabinet'||(byId.get(id)?.pos[2]<-1.5&&id!=='CAB1');
  const sensorOnly=id==='sensor';
  for(const [key,g]of groups)g.visible=!cutaway&&(!cabinetOnly||byId.get(key).pos[2]<-1.5)&&(!sensorOnly||key==='CV1'||key==='-09B1');
  pallet.visible=!cutaway&&!cabinetOnly&&getState().state.loaded;ground.visible=!cabinetOnly&&!cutaway;
  for(const o of cables.children)o.visible=!cutaway&&(!cabinetOnly||byId.get(o.userData.wire.to).pos[2]<-1.5&&byId.get(o.userData.wire.from).pos[2]<-1.5)&&(!sensorOnly||o.userData.wire.from==='-09B1');
  for(const [key,o]of routesMap){const w=wires.find(w=>w.id===key);o.visible=!cutaway&&(!cabinetOnly||byId.get(w.to).pos[2]<-1.5&&byId.get(w.from).pos[2]<-1.5);}
  camera.fov=id==='cabinet'?46:40;camera.updateProjectionMatrix();
  let pos,target;if(id==='whole'){pos=[7,5.7,8];target=[-.1,.9,0];}else if(id==='cabinet'){pos=[-2.4,2.9,.2];target=[-2,1.15,-2];}else if(id==='operator'){pos=[.8,2,3.75];target=[0,1.32,1.9];}else if(cutaway){pos=[.6,1.8,-.5];target=[-.4,1.35,-2];}else if(id==='sensor'){target=[1.7,.98,-.49];pos=[2.4,1.3,-1.8];}else{const d=byId.get(id);if(!d)return;target=d.pos;pos=[d.pos[0]+.8,d.pos[1]+.45,d.pos[2]+1.6];}
  if(id==='whole'){const direction=new T.Vector3(1,.62,1.1).normalize(),distance=Math.max(6.8,10.5/camera.aspect);pos=direction.multiplyScalar(distance).add(new T.Vector3(...target)).toArray();}
  const focused=cutaway?detail:groups.get(({cabinet:'CAB1',operator:'OP1'})[id]??id);
  if(focused){const bounds=equipment.framingBounds(focused),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());const distance=Math.max(.45,Math.max(size.y,size.x/camera.aspect)*.7/Math.tan(T.MathUtils.degToRad(camera.fov/2))+size.z*.5);target=center.toArray();pos=new T.Vector3(.25,.16,1).normalize().multiplyScalar(distance).add(center).toArray();}
  if(id==='contacts'){target=[-.4,1.84,-1.82];const distance=Math.max(1.3,1.25/camera.aspect);pos=[target[0]+.3,target[1]+.12,target[2]+distance];}
  if(id==='sensor'&&camera.aspect<1){pos=new T.Vector3(...pos).sub(new T.Vector3(...target)).multiplyScalar(1/camera.aspect).add(new T.Vector3(...target)).toArray();}
  camera.position.set(...pos);controls.target.set(...target);camera.lookAt(controls.target);controls.update();host.dataset.view=id;badge.textContent=cutaway?'접촉기 내부 · 코일과 접점':id==='sensor'?'원통형 감지기 · 팔레트 아래 금속 표적':id==='whole'?'컨베이어 · 제어반 · 조작반':'같은 기기의 형상과 연결을 확인하세요.';
 }
 function enter(place='whole'){
  frame('whole');
  detail.visible=false;inside=false;walk=true;controls.enabled=false;const p=place==='cabinet'?[-2,1.6,-.5]:place==='operator'?[0,1.6,3]:[.4,1.6,2.8];camera.position.set(...p);yaw=0;pitch=-.1;orient();badge.textContent='눈높이 1.6 m · 드래그로 둘러보기 · W A S D 이동';
 }
 function orient(){camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);}
 function move(direction,amount=.22){if(!walk)return;const f=new T.Vector3(0,0,-1).applyQuaternion(camera.quaternion);f.y=0;f.normalize();const r=new T.Vector3(1,0,0).applyQuaternion(camera.quaternion);r.y=0;r.normalize();const v=direction==='forward'?f:direction==='back'?f.negate():direction==='left'?r.negate():r;const n=camera.position.clone().addScaledVector(v,amount);n.x=T.MathUtils.clamp(n.x,-4.4,4.4);n.z=T.MathUtils.clamp(n.z,-3.7,4.5);const inBelt=Math.abs(n.x)<2.65&&Math.abs(n.z)<.78,inCab=n.x> -2.95&&n.x< -1.05&&n.z> -2.5&&n.z< -1.6;if(!inBelt&&!inCab)camera.position.copy(n);}
 const keys=new Set();const keydown=e=>{if(document.activeElement!==host||!walk)return;const map={w:'forward',s:'back',a:'left',d:'right',ArrowUp:'forward',ArrowDown:'back',ArrowLeft:'left',ArrowRight:'right'};if(map[e.key]){keys.add(map[e.key]);e.preventDefault();}},keyup=()=>keys.clear();window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',keyup);
 const down=e=>{host.focus({preventScroll:true});drag={x:e.clientX,y:e.clientY,moved:false};};
 const pointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;if(walk){yaw-=dx*.004;pitch=T.MathUtils.clamp(pitch-dy*.004,-1.2,1.2);orient();}drag.x=e.clientX;drag.y=e.clientY;};
 const up=e=>{if(drag&&!drag.moved){const rect=renderer.domElement.getBoundingClientRect(),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObjects(pickables,false).find(h=>{for(let p=h.object;p;p=p.parent)if(!p.visible)return false;return true;});if(hit)select(hit.object.userData.deviceId);}drag=null;};
 const wheel=e=>{if(walk){e.preventDefault();move(e.deltaY<0?'forward':'back',.26);}};
 renderer.domElement.addEventListener('pointerdown',down);window.addEventListener('pointermove',pointermove);window.addEventListener('pointerup',up);renderer.domElement.addEventListener('wheel',wheel,{passive:false});
 function update(state,status){
  equipment.animate(state,status,0);
  pallet.visible=groups.get('CV1').visible&&state.loaded;pallet.position.set(state.pallet,.94,0);
  if(detail.visible)badge.textContent=status.coil?'코일 ON · 철심이 가동부를 끌어당김 → 접점 닫힘':'코일 OFF · 가동부 복귀 → 접점 열림';
  magnetic.visible=detail.visible&&status.coil&&teaching!=='contacts';core.material.emissive.set(status.coil?'#16415a':'#000000');core.material.emissiveIntensity=status.coil?.5:0;
  for(const [id,o] of lights){const on=id.startsWith('input')?Object.values(status.inputs)[Number(id.slice(5))]:status.active[id];o.material.emissive.set(on?(id==='-06S2'?'#ec3926':'#5bee87'):'#000000');o.material.emissiveIntensity=on?1.25:0;if(id==='-07K1')o.position.z=on?.125:.14;}
  for(const [id,o] of routesMap){const on=routeOn(id,state,status),focused=!tracedRoutes||tracedRoutes.has(id);o.material.transparent=!focused;o.material.opacity=focused?1:.12;o.material.depthWrite=focused;o.material.emissive.copy(o.material.color).multiplyScalar(on?(focused?.8:.08):0);}
  host.dataset.motor=String(status.motor);host.dataset.coil=String(status.coil);host.dataset.pallet=state.pallet.toFixed(3);host.dataset.input00=String(status.inputs['I:001/00']);host.dataset.input01=String(status.inputs['I:001/01']);
 }
 function draw(){controls.update();renderer.render(scene,camera);}
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw();};const observer=new ResizeObserver(resize);observer.observe(host);
 const loop=observeScene(host,dt=>{const {state,status}=onFrame(dt);update(state,status);equipment.animate(state,status,dt);armature.position.y=T.MathUtils.damp(armature.position.y,status.coil?-.09:0,teaching?3:18,dt);host.dataset.contactTravel=String(-armature.position.y/.09);host.dataset.magnetic=String(magnetic.visible);if(highlight){highlight.visible=groups.get(selection)?.visible??false;highlight.update();}host.dataset.doorOpen=String(equipment.isDoorOpen());if(status.motor&&!state.paused){rotors.forEach(o=>o.rotation.x+=dt*8);beltSeams.forEach(o=>{o.position.x-=dt*state.speed;if(o.position.x< -2.4)o.position.x+=4.8;});}for(const dir of keys)move(dir,dt*1.1);draw();},host.closest('#cv-app')??host);
 const loss=e=>{e.preventDefault();contextLost=true;loop.setActive(false);host.dataset.context='lost';onContext?.(false);badge.textContent='3D 연결이 중단되었습니다. ';const retry=document.createElement('button');retry.dataset.action='retry';retry.textContent='3D 다시 불러오기';badge.append(retry);};const recovered=()=>{contextLost=false;host.dataset.context='ready';onContext?.(true);badge.textContent='3D 연결을 복구했습니다.';loop.setActive(activeWanted);draw();};host.dataset.context='ready';renderer.domElement.addEventListener('webglcontextlost',loss);renderer.domElement.addEventListener('webglcontextrestored',recovered);
 frame();resize();const initial=getState();update(initial.state,initial.status);draw();
 return {frame,enter,move,draw,select:highlightDevice,update,teaching(id){teaching=id;},setActive:v=>{activeWanted=v;keys.clear();loop.setActive(v&&!contextLost);if(v&&!contextLost)resize();},traceRoutes(ids){tracedRoutes=ids?new Set(ids):null;},routes(v){routeVisible=v;routes.visible=v;},setDoor(v){equipment.setDoor(v);},isDoorOpen:equipment.isDoorOpen,night(v){night=v;sun.intensity=v?.18:2.7;fill.intensity=v?.4:1.1;ambient.intensity=v?.2:.75;scene.background.set(v?'#26383d':'#12171c');},capture(){draw();return renderer.domElement.toDataURL('image/png');},isWalking:()=>walk,
 dispose(){if(disposed)return;disposed=true;loop.dispose();observer.disconnect();controls.dispose();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',keyup);window.removeEventListener('pointermove',pointermove);window.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('wheel',wheel);renderer.domElement.removeEventListener('webglcontextlost',loss);renderer.domElement.removeEventListener('webglcontextrestored',recovered);const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());equipment.dispose();env.dispose();renderer.dispose();host.replaceChildren();}};
}
