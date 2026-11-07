// One pinned model that changes with the scroll: drawing, building, structure, circuit, fire, parts, inside.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {buildClassroomModel,project} from '/pages/guardhouse-classroom/src/classroom-project.mjs';
import {electricalModel,freshExercise,reinforcementFor,routeLength,structuralCalculation} from '/pages/guardhouse-classroom/src/learning-engine.mjs';
import {evacuationRoute,fireModel} from '/pages/guardhouse-classroom/src/lesson-expansion.mjs';
import {createModelGroup} from '/pages/guardhouse-classroom/src/scene.mjs';
import {SurfaceLibrary,worldUV} from './surface-materials.mjs';
import {lightenOnSlowFrames} from './scene-access.mjs';

const stage=document.getElementById('ld-stage'),dim=document.getElementById('ld-dim'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const beats=[...document.querySelectorAll('.ld-beat')];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),smooth=t=>t*t*(3-2*t),seg=(p,a,b)=>smooth(clamp((p-a)/(b-a)));
const mix=(a,b,t)=>a+(b-a)*t;
const fetchJSON=url=>fetch(url).then(r=>{if(!r.ok)throw new Error(url);return r.json();});
const V=([x,y,z=0])=>new THREE.Vector3(x,z,-y);
const INTRO_MS=1500,BAR_RADIUS=.011,TUBE_RADIUS=.022;
// Vertical gaps of the exploded view, in metres.
const LIFT={floor:0,room:1.1,shell:2.5,wiring:5.3,roof:6.4,ceiling:0,foundation:0};
// Camera keys over the 0-1 scroll: time, position, target. Near keys walk through the door at true scale.
const K=[
 [0,[4.1,13.5,-1.98],[4.1,0,-2]],[.075,[4.1,13.5,-1.98],[4.1,0,-2]],
 [.18,[13.2,7.4,10.4],[4.1,1.1,-2]],[.235,[13.2,7.4,10.4],[4.1,1.1,-2]],
 [.275,[12.6,3.4,11.4],[4.1,.5,-2]],[.355,[11.4,3.8,11.8],[4.1,.5,-2]],
 [.395,[10.6,9.4,7.4],[4.4,.9,-2]],[.5,[9.4,9,6.8],[4.4,.9,-2]],
 [.55,[9.2,8.4,6.2],[4,.6,-1.9]],[.645,[8.6,8.2,6.6],[4.3,.5,-1.6]],
 [.71,[20,10.6,19],[4.1,4,-2]],[.8,[19,10,19.6],[4.1,4,-2]],
 [.835,[5.05,1.6,3.6],[5.05,1.4,-1]],[.9,[5.2,1.56,-1],[7.2,1.25,-3]],[.955,[5.3,1.56,-1.1],[7.3,1.2,-3.2]],
 [1,[13,7.6,10.6],[4.3,1.2,-2]]
];

function layerOf(e){
 if(e.group==='foundation')return 'foundation';
 if(e.group==='ceiling')return 'ceiling';
 if(e.group==='roof')return 'roof';
 if(e.kind==='floor'||e.kind==='paving'||e.group==='floor')return 'floor';
 if(e.group==='fixtures')return 'room';
 if(e.kind==='pipe')return 'roof';
 return 'shell';
}
function surfaceFor(e){
 if(e.kind==='furniture'||e.kind==='door')return 'wood';
 if(e.group==='floor'||e.kind==='floor')return 'tile';
 if(['wall','partition','finish','ceiling'].includes(e.kind))return 'plaster';
 if(e.group==='foundation'||e.kind==='roof')return 'concrete';
 return null;
}
function tube(points,color,radius=TUBE_RADIUS,segments=72){
 const path=new THREE.CurvePath();for(let i=1;i<points.length;i++)path.add(new THREE.LineCurve3(V(points[i-1]),V(points[i])));
 const geometry=new THREE.TubeGeometry(path,segments,radius,6,false);geometry.setDrawRange(0,0);
 const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color,transparent:true}));mesh.userData.count=geometry.index.count;return mesh;
}
const grow=(mesh,t)=>mesh.geometry.setDrawRange(0,Math.floor(t*mesh.userData.count/3)*3);
function softDot(){
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);
 r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);
 return new THREE.CanvasTexture(c);
}

// One sentence at a time: each fades in as its section arrives and out before the next.
function fadeCopy(){
 const h=innerHeight;
 beats.forEach((beat,i)=>{
  const r=beat.getBoundingClientRect(),last=i===beats.length-1;
  const enter=i===0?1:clamp((h*.4-r.top)/(h*.2)),leave=last?1:clamp((r.bottom-h*.4)/(h*.2));
  const copy=beat.firstElementChild,o=Math.min(enter,leave);copy.style.opacity=o;copy.style.pointerEvents=o<.5?'none':'auto';
  // The last section holds the links, so keyboard users can still tab to it from the top.
  if(!last)copy.style.visibility=o<.01?'hidden':'visible';
 });
 dim.style.opacity=clamp((h*.9-beats.at(-1).getBoundingClientRect().top)/(h*.5))*.74;
}
addEventListener('scroll',fadeCopy,{passive:true});addEventListener('resize',fadeCopy);fadeCopy();

async function start(){
 const [raw,planLines]=await Promise.all([fetchJSON('/pages/guardhouse-classroom/runtime/model.json'),fetchJSON('/pages/guardhouse-classroom/runtime/projection-plan.json')]);
 const model=buildClassroomModel(raw),electric=electricalModel(freshExercise()),rebar=reinforcementFor(model),structure=structuralCalculation(model),fire=fireModel();
 const circuit=electric.circuits.find(c=>c.id==='L1'),solids=model.elements.filter(e=>!e.linePoints);
 const setData=(id,text)=>{document.getElementById(id).textContent=text;};
 setData('ld-structure',`지붕판 D${structure.roof.diameter} @${structure.roof.spacing} · M ${structure.roof.M.toFixed(2)} ≤ M_R ${structure.roof.resistance.toFixed(2)} kN·m`);
 setData('ld-circuit',`${circuit.id} ${circuit.name} · ${circuit.watts} W · ${circuit.current.toFixed(2)} A · ${circuit.area} mm²`);
 setData('ld-fire','HD01 열감지기 → FA01 수신기 → AL01 경보');
 setData('ld-parts',`부재 ${solids.length}개 · 철근 ${rebar.bars.length.toLocaleString('ko-KR')}개 · 전선관 ${electric.routes.reduce((n,r)=>n+routeLength(r.points),0).toFixed(1)} m`);

 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.prepend(renderer.domElement);lightenOnSlowFrames(renderer);
 const scene=new THREE.Scene();scene.background=new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--wb-bg').trim());
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;pmrem.dispose();room.dispose?.();
 const camera=new THREE.PerspectiveCamera(30,1,.05,200);
 const sky=new THREE.HemisphereLight(0xdfe8f0,0x20262d,1.1);scene.add(sky);
 const sun=new THREE.DirectionalLight(0xfff1dc,2.8);sun.position.set(13,16,8);sun.target.position.set(4.1,0,-2);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0006;Object.assign(sun.shadow.camera,{left:-11,right:11,top:11,bottom:-11,near:1,far:46});scene.add(sun,sun.target);

 const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.ShadowMaterial({opacity:.5}));ground.rotation.x=-Math.PI/2;ground.position.set(4,-.01,-2);ground.receiveShadow=true;scene.add(ground);
 // A faint metre grid, the model space of a CAD screen.
 const grid=new THREE.GridHelper(40,40,0x46525e,0x2f3842);grid.position.set(4,-.005,-2);grid.material.transparent=true;grid.material.opacity=.42;scene.add(grid);
 const segments=planLines.flatMap(l=>[l.a[0],.002,-l.a[1],l.b[0],.002,-l.b[1]]);
 const lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(segments,3));
 const lines=new THREE.LineSegments(lineGeometry,new THREE.LineBasicMaterial({color:0xcfd8df,transparent:true}));scene.add(lines);

 // The same model the classroom opens, split into layers the story can move.
 const group=createModelGroup({name:'guardhouse',elements:solids});scene.add(group);
 const parts=group.children.map(mesh=>{
  const e=mesh.userData,layer=layerOf(e),m=mesh.material;m.transparent=true;
  mesh.userData.layer=layer;mesh.userData.opacity=m.opacity;mesh.userData.delay=layer==='floor'?0:clamp((e.footprint?.[0]?.[0]??4)/8.2);
  return {mesh,layer,glass:['window','window-glass'].includes(e.kind),door:e.id==='south-opening-0'};
 });
 for(const {mesh}of parts){if(surfaceFor(mesh.userData))worldUV(mesh.geometry);if(mesh.userData.kind==='paving')mesh.material.color.multiplyScalar(.62);}
 for(const {mesh,glass}of parts)if(glass){mesh.material.emissive=new THREE.Color(0xffc98a);mesh.material.emissiveIntensity=0;}

 // Reinforcement grows from the footing up, each bar at its true position.
 const bars=[...rebar.bars].sort((a,b)=>Math.min(a.a[2],a.b[2])-Math.min(b.a[2],b.b[2]));
 const rods=new THREE.InstancedMesh(new THREE.CylinderGeometry(BAR_RADIUS,BAR_RADIUS,1,5),new THREE.MeshBasicMaterial({color:0xe07a45,transparent:true}),bars.length);
 const m4=new THREE.Matrix4(),up=new THREE.Vector3(0,1,0),q=new THREE.Quaternion(),one=new THREE.Vector3();
 bars.forEach((b,i)=>{const a=V(b.a),z=V(b.b),d=z.clone().sub(a),len=d.length();q.setFromUnitVectors(up,d.clone().normalize());one.set(1,len,1);m4.compose(a.clone().add(z).multiplyScalar(.5),q,one);rods.setMatrixAt(i,m4);});
 rods.count=0;rods.frustumCulled=false;scene.add(rods);

 // Wiring and lamps form one layer so they can lift together in the exploded view.
 const wiring=new THREE.Group();scene.add(wiring);
 const lit=electric.routes.filter(r=>r.circuit==='L1');
 const routes=lit.map((r,i)=>{const mesh=tube(r.points,circuit.color);wiring.add(mesh);return {mesh,target:r.target,from:i/lit.length*.55,to:i/lit.length*.55+.45};});
 const box=(d,color,emissive)=>{const [sx,sy,sz]=d.size;const mesh=new THREE.Mesh(new THREE.BoxGeometry(sx,sz,sy),new THREE.MeshStandardMaterial({color,emissive,emissiveIntensity:0}));mesh.position.copy(V(d.pos));return mesh;};
 const lamps=electric.devices.filter(d=>d.kind==='light').map(d=>{const mesh=box(d,0x3a3f45,0xffd9a0);wiring.add(mesh);return {id:d.id,mesh};});
 const panel=box(electric.devices.find(d=>d.id==='DB1'),0x56616c,new THREE.Color(circuit.color));wiring.add(panel);
 const roomLights=project.rooms.map(r=>{const [x,y,X,Y]=r.bounds,light=new THREE.PointLight(0xffd9a0,0,8,1.5);light.position.copy(V([(x+X)/2,(y+Y)/2,2.25]));scene.add(light);return light;});

 // Fire: smoke at the pantry, signal halos on the real devices, then the evacuation route on the floor.
 const dot=softDot(),fireById=new Map(fire.devices.map(d=>[d.id,d]));
 const halo=(id,color,size)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:dot,color,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthTest:false}));s.position.copy(V(fireById.get(id).pos));s.scale.setScalar(size);scene.add(s);return s;};
 const halos={HD01:halo('HD01',0xff5a48,.8),FA01:halo('FA01',0xff5a48,.7),AL01:halo('AL01',0xff5a48,.8),EX01:halo('EX01',0x5fd0a5,.6),EM01:halo('EM01',0x5fd0a5,.7)};
 const smoke=Array.from({length:16},(_,i)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:dot,color:0x9aa3ab,transparent:true,opacity:0,depthWrite:false}));const a=i*2.4,r=.18+i*.075;s.userData={x:3.3+Math.cos(a)*r,y:3.15+Math.sin(a)*r*.62,z:1.5+(i%5)*.2,size:.7+i*.05,at:i/16};s.position.copy(V([s.userData.x,s.userData.y,s.userData.z]));scene.add(s);return s;});
 const hazard=new THREE.PointLight(0xff6a48,0,7,1.5);hazard.position.copy(V([3.3,3.15,1.8]));scene.add(hazard);
 const evacuation=tube(evacuationRoute.map(([x,y])=>[x,y,.06]),0x5fd0a5,.05,96);scene.add(evacuation);

 // Real surfaces arrive after the first paint; the model is complete without them.
 SurfaceLibrary.prepare().then(()=>{
  const surfaces=new SurfaceLibrary(renderer);
  for(const {mesh}of parts){const kind=surfaceFor(mesh.userData);if(kind)surfaces.apply(mesh.material,kind,kind==='plaster'?0xe2d7c4:0xffffff);}
  redraw();
 }).catch(()=>{});

 let shown=0,frame=0,last=performance.now(),drawn=reduced?1:0,width=1,height=1;
 const position=new THREE.Vector3(),target=new THREE.Vector3();
 function placeCamera(p,near){
  let i=0;while(i<K.length-2&&p>K[i+1][0])i++;
  const [a,pa,ta]=K[i],[b,pb,tb]=K[i+1],t=smooth(clamp((p-a)/(b-a)));
  position.set(mix(pa[0],pb[0],t),mix(pa[1],pb[1],t),mix(pa[2],pb[2],t));target.set(mix(ta[0],tb[0],t),mix(ta[1],tb[1],t),mix(ta[2],tb[2],t));
  // Keep the whole building in frame on narrow screens; inside the room the view is true scale.
  const fit=mix(Math.max(1.34,1.36/camera.aspect),1,near);position.sub(target).multiplyScalar(fit).add(target);
  camera.position.copy(position);camera.lookAt(target);
  // Copy sits beside the model on wide screens and under it on phones.
  if(width>=760)camera.setViewOffset(width,height,-width*.17*(1-near),0,width,height);else camera.setViewOffset(width,height,0,height*.15*(1-near),width,height);
  camera.updateProjectionMatrix();
 }
 function apply(p){
  lineGeometry.setDrawRange(0,Math.floor(drawn*segments.length/3));
  // Each phase lines up with the sentence on screen: copy holds from a section's start to just before the next.
  const rise=clamp((p-.085)/.095),roofOn=seg(p,.16,.22);
  const ghost=seg(p,.23,.265)*(1-seg(p,.66,.7));
  const structure=seg(p,.245,.27)*(1-seg(p,.355,.385));
  const roofGone=seg(p,.36,.39)*(1-seg(p,.66,.7));
  const night=Math.max(seg(p,.37,.4)*(1-seg(p,.66,.7)),seg(p,.81,.84));
  const lift=seg(p,.68,.76)*(1-seg(p,.8,.83));
  const near=seg(p,.825,.845)*(1-seg(p,.955,.995));
  const routeT=clamp((p-.39)/.1),routeShow=seg(p,.38,.395)*(1-seg(p,.515,.54))+lift;
  const inside=seg(p,.825,.85);
  lines.material.opacity=mix(.92,.2,seg(p,.09,.2));lines.visible=near<.5;grid.visible=near<.9;

  for(const {mesh,layer,glass,door}of parts){
   const u=mesh.userData,m=mesh.material;
   if(layer==='foundation'){const o=mix(seg(p,.085,.12),.5,structure);m.opacity=o;mesh.visible=o>.01;m.depthWrite=o>.9;continue;}
   if(layer==='ceiling'){const o=seg(p,.83,.85);m.opacity=o;mesh.visible=o>.01;continue;}
   if(layer==='roof'){
    const o=mix(1,.1,ghost)*(1-roofGone)*roofOn;m.opacity=o;mesh.visible=o>.005;m.depthWrite=o>.9;
    mesh.position.y=(1-roofOn)*2.4+roofGone*2.2+LIFT.roof*lift;continue;
   }
   const t=smooth(clamp((rise-u.delay*.5)/.5));mesh.visible=t>.001&&!(door&&near>.2);mesh.scale.y=Math.max(t,.001);
   const faded=u.kind==='finish'?.03:layer==='shell'?.08:layer==='room'?mix(.55,.1,structure):u.opacity,o=mix(u.opacity,faded,ghost);
   m.opacity=o;m.depthWrite=o>.9;mesh.position.y=LIFT[layer]*lift;
   if(glass)m.emissiveIntensity=inside*.9*(1-near)*night;
  }
  const dark=night*(1-lift);
  sky.intensity=mix(.95,.22,dark);sun.intensity=mix(2.3,.22,dark);scene.environmentIntensity=mix(.34,.06,dark);
  renderer.shadowMap.autoUpdate=ghost<.5&&dark<.5;

  rods.count=Math.floor(seg(p,.25,.345)*bars.length);rods.material.opacity=structure;rods.visible=structure>.01;

  wiring.position.y=LIFT.wiring*lift;
  panel.visible=routeShow>.01;panel.material.emissiveIntensity=seg(routeT,0,.08)*1.6*Math.min(routeShow,1);
  let glowSum=0;
  for(const r of routes){
   const t=clamp((routeT-r.from)/(r.to-r.from));grow(r.mesh,t);r.mesh.visible=routeShow>.01;r.mesh.material.opacity=Math.min(routeShow,1);
   const lamp=lamps.find(l=>l.id===r.target);if(!lamp)continue;
   const glow=Math.max(smooth(clamp((t-.92)/.08))*Math.min(1,routeShow),inside);glowSum+=glow;
   lamp.mesh.visible=Math.max(routeShow,inside)>.01&&near<.5;lamp.mesh.material.emissiveIntensity=glow*2.4;
  }
  const glow=glowSum/Math.max(1,routes.length);
  for(const l of roomLights)l.intensity=glow*7*(1-lift);

  const fireOn=seg(p,.53,.555)*(1-seg(p,.645,.675));
  const pulse=(at,speed=60)=>seg(p,at,at+.012)*fireOn*(.62+.38*Math.sin(p*speed*6.28));
  halos.HD01.material.opacity=pulse(.54);halos.FA01.material.opacity=pulse(.56);halos.AL01.material.opacity=pulse(.58,90);
  halos.EX01.material.opacity=seg(p,.595,.61)*fireOn;halos.EM01.material.opacity=seg(p,.595,.61)*fireOn;
  hazard.intensity=fireOn*9;
  for(const s of smoke){const u=s.userData,t=clamp((p-.535-u.at*.05)/.07);s.material.opacity=smooth(t)*.26*fireOn;s.scale.setScalar(u.size*(.5+t*.8));s.position.y=mix(u.z,2.35,t);s.visible=s.material.opacity>.005;}
  grow(evacuation,seg(p,.595,.645));evacuation.visible=fireOn>.01;evacuation.material.opacity=fireOn;

  placeCamera(p,near);
 }
 function redraw(){apply(shown);renderer.render(scene,camera);}
 function resize(){width=stage.clientWidth||1;height=stage.clientHeight||1;renderer.setSize(width,height,false);camera.aspect=width/height;}
 const goalNow=()=>{const room=document.querySelector('.ld-story').offsetHeight-innerHeight;return room>0?clamp(scrollY/room):0;};
 function tick(now){
  frame=0;const goal=goalNow(),dt=Math.min(.1,(now-last)/1000);last=now;
  // Time-based easing: slow machines catch up in the same time as fast ones.
  shown=reduced?goal:shown+(goal-shown)*(1-Math.exp(-dt*10));if(Math.abs(goal-shown)<.0004)shown=goal;
  redraw();if(shown!==goal)wake();
 }
 function wake(){if(!frame){if(goalNow()!==shown&&performance.now()-last>120)last=performance.now();frame=requestAnimationFrame(tick);}}
 addEventListener('scroll',wake,{passive:true});
 new ResizeObserver(()=>{resize();redraw();}).observe(stage);
 shown=goalNow();resize();redraw();
 // The drawing draws itself on arrival, so the first screen is never empty.
 if(!reduced){const began=performance.now();const intro=now=>{drawn=smooth(clamp((now-began)/INTRO_MS));redraw();if(drawn<1)requestAnimationFrame(intro);};requestAnimationFrame(intro);}
}
start().catch(()=>{stage.dataset.static='true';});
