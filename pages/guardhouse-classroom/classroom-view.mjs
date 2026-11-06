import {observeScene,presentScene} from './render-loop.mjs';
import {addLuminaireDetails,syncLuminaire} from './lighting-fixture.mjs';
import {buildDeskLamp,setLampPower} from '/pages/guardhouse-classroom/src/equipment-mesh.mjs';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createModelGroup,disposeModelResources} from '/pages/guardhouse-classroom/src/scene.mjs';
import {project,boundsOf} from '/pages/guardhouse-classroom/src/classroom-project.mjs';
import {visibleElement,canWalk} from '/pages/guardhouse-classroom/src/learning-engine.mjs';
import {finishes,materialLayers,indoorFov} from '/pages/guardhouse-classroom/src/lesson-expansion.mjs';
import {SurfaceLibrary,worldUV} from './surface-materials.mjs';
import {createExtinguisher} from './fire-extinguisher.mjs';
import {ElectricalTour} from './electrical-tour.mjs';
import {StructuralLoadView} from './structural-load-view.mjs';
const V=p=>new THREE.Vector3(p[0],p[2],-p[1]);
const colors={light:0xfff5da,switch:0xece8df,socket:0xf4f0e6,panel:0x89969d,ac:0xf0eee9};

export class ClassroomView {
 showStructuralLoad(id,live,base,span){if(!this.loadDiagram&&!id)return;this.loadDiagram??=new StructuralLoadView(this.scene,this.host);this.loadDiagram.update(this.base?.children.find(m=>m.userData.id===id),live,base,span);}
 static prepare(){return SurfaceLibrary.prepare();}
 present(current){return presentScene(this.host,()=>{this.size();this.renderer.render(this.scene,this.active);},{current});}
 constructor(host,{onSelect,onSwitch,onMove,projectData=project,walkCheck=canWalk}){
  this.project=projectData;this.walkCheck=walkCheck;this.host=host;this.onSelect=onSelect;this.onSwitch=onSwitch;this.onMove=onMove;this.mode='exterior';this.filter='all';this.realistic=false;this.night=false;this.fpv=false;this.selected=null;this.keys=new Set();this.yaw=0;this.pitch=0;this.exploded=false;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#dee7e8');
  this.camera=new THREE.PerspectiveCamera(43,1,.025,150);this.ortho=new THREE.OrthographicCamera(-6,6,4,-4,.01,150);this.active=this.camera;
  this.renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;host.append(this.renderer.domElement);this.renderer.domElement.tabIndex=0;this.renderer.domElement.setAttribute('aria-label',this.project.title+' 3D 작업 화면');
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.maxPolarAngle=Math.PI*.49;this.controls.minDistance=1;this.controls.maxDistance=35;

  this.ambient=new THREE.HemisphereLight(0xdbefff,0x94836c,1.8);this.scene.add(this.ambient);
  this.sun=new THREE.DirectionalLight(0xffe4bc,3);this.sun.position.set(-3,8,5);this.sun.target.position.set(4,0,-2);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-11,right:11,top:9,bottom:-9,near:.1,far:40});this.sun.shadow.normalBias=.015;this.sun.shadow.bias=-.0001;this.scene.add(this.sun,this.sun.target);
  this.ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0xd4d8cc,roughness:1}));this.ground.rotation.x=-Math.PI/2;this.ground.position.y=-.205;this.ground.receiveShadow=true;this.scene.add(this.ground);
  this.site=new THREE.Group();this.scene.add(this.site);this.grid=new THREE.GridHelper(32,32,0xa0b6b9,0xc8d5d5);this.grid.position.set(4,-.19,-2);this.scene.add(this.grid);
  this.electrical=new THREE.Group();this.bars=new THREE.Group();this.scene.add(this.electrical,this.bars);this.lightObjects=new Map();this.deviceMeshes=new Map();
  this.fireGroup=new THREE.Group();this.materialGroup=new THREE.Group();this.scene.add(this.fireGroup,this.materialGroup);this.fireMeshes=new Map();this.finish='plaster';this.rebarDisplay='both';
  this.selectionOutline=new THREE.Box3Helper(new THREE.Box3(),0xf18b20);this.selectionOutline.material.depthTest=false;this.selectionOutline.renderOrder=100;this.selectionOutline.visible=false;this.scene.add(this.selectionOutline);
  this.roomMarker=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xe9b44b,transparent:true,opacity:.45,depthWrite:false,side:THREE.DoubleSide}));this.roomMarker.rotation.x=-Math.PI/2;this.roomMarker.visible=false;this.scene.add(this.roomMarker);
  this.surfaces=new SurfaceLibrary(this.renderer);this.tour=new ElectricalTour(this);
  this.resize=new ResizeObserver(()=>this.size());this.resize.observe(host);
  let start=null,last=null;
  this.renderer.domElement.addEventListener('pointerdown',e=>{if(this.tour.playing){this.tour.playing=false;this.tour.readout();this.host.dispatchEvent(new CustomEvent('tour-ended'));}start=[e.clientX,e.clientY];last=[...start];if(this.fpv)this.renderer.domElement.setPointerCapture(e.pointerId);this.renderer.domElement.focus({preventScroll:true});});
  this.renderer.domElement.addEventListener('pointermove',e=>{if(this.fpv&&e.buttons&&last){this.yaw-=(e.clientX-last[0])*.004;this.pitch=Math.max(-1.2,Math.min(1.2,this.pitch-(e.clientY-last[1])*.004));last=[e.clientX,e.clientY];this.look();}});
  this.renderer.domElement.addEventListener('pointerup',e=>{if(start&&Math.hypot(e.clientX-start[0],e.clientY-start[1])<5)this.pick(e.clientX,e.clientY);start=null;last=null;});
  this.renderer.domElement.addEventListener('wheel',e=>{if(!this.fpv)return;e.preventDefault();this.camera.fov=indoorFov(this.camera.fov,e.deltaY);this.camera.updateProjectionMatrix();this.updateReadout();this.host.dispatchEvent(new CustomEvent('walk-zoom',{detail:this.camera.fov}));},{passive:false});
  this.renderer.domElement.addEventListener('keydown',e=>{if(!this.fpv)return;if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','e','Escape'].includes(e.key)){e.preventDefault();if(e.key==='Escape')this.exitWalk();else if(e.key==='e')this.pick(null,null);else this.keys.add(e.key);}});
  this.renderer.domElement.addEventListener('keyup',e=>this.keys.delete(e.key));this.renderer.domElement.addEventListener('blur',()=>this.keys.clear());
  this.loop=observeScene(host,(dt,elapsed)=>{if(this.preparing)return;this.renderer.shadowMap.autoUpdate=Boolean(this.simulation?.active);this.tour.update(dt);this.simulation?.update(elapsed);if(this.fpv)this.walkKeys(dt);else this.controls.update();this.renderer.render(this.scene,this.active);},host.parentElement);
 }
 setActive(active){this.loop.setActive(active);if(!active)this.keys.clear();}
 dispose(){if(this.disposed)return;this.disposed=true;this.loop?.dispose();this.simulation?.dispose();this.props?.dispose();this.fireGuide?.stop();this.tour?.stop();this.resize?.disconnect();this.controls.dispose();this.clear(this.scene);this.environmentTarget?.dispose();this.surfaces.dispose();this.renderer.dispose();this.renderer.domElement.remove();this.deviceMeshes.clear();this.fireMeshes.clear();this.lightObjects.clear();}
 size(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;if(this.viewportWidth!==w||this.viewportHeight!==h){this.renderer.setSize(w,h);this.viewportWidth=w;this.viewportHeight=h;}this.camera.aspect=w/h;this.camera.updateProjectionMatrix();const height=Math.max(this.orthoHeight??7.4,(['right','left'].includes(this.viewName)?5.4:9.2)/(w/h));this.ortho.left=-height*w/h/2;this.ortho.right=-this.ortho.left;this.ortho.top=height/2;this.ortho.bottom=-this.ortho.top;this.ortho.updateProjectionMatrix();}
 createSite(){
  const pbr=(color)=>new THREE.MeshStandardMaterial({color,roughness:.96});
  const lawn=new THREE.Mesh(new THREE.BoxGeometry(22,.12,15),pbr(0x77876b));lawn.position.set(4,-.29,-2);lawn.receiveShadow=true;this.site.add(lawn);
  const walk=new THREE.Mesh(new THREE.BoxGeometry(3,.03,11),pbr(0xb5b0a3));walk.position.set(5.05,-.175,6.3);walk.receiveShadow=true;this.site.add(walk);
  const road=new THREE.Mesh(new THREE.PlaneGeometry(60,7),pbr(0x555e63));road.rotation.x=-Math.PI/2;road.position.set(4,-.18,11);road.receiveShadow=true;this.site.add(road);
  for(const [x,y,s]of [[-3,-1,1],[11,-1,1.1],[-3,-6,1.2],[11,-7,.9]]){
   const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.11,.16,2.4,8),pbr(0x71563c));trunk.position.set(x,1,-y);trunk.castShadow=true;this.site.add(trunk);
   for(let j=0;j<3;j++){const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry((1-j*.13)*s,2),pbr(j%2?0x62764f:0x80925e));leaf.position.set(x+(j-1)*.33,2.3+j*.4,-y);leaf.castShadow=true;this.site.add(leaf);}
  }
  for(let i=0;i<9;i++){const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.36,1),pbr(0x6c805a));b.scale.set(1,1.1,1);b.position.set(8.85,.17,-.1-i*.47);b.castShadow=true;this.site.add(b);}
 }
 texture(type){
  const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=type==='wood'?'#a8815a':type==='tile'?'#d4d2c9':'#d8d2c3';g.fillRect(0,0,256,256);
  let seed=42;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  if(type==='wood'){for(let i=0;i<90;i++){g.strokeStyle=`rgba(55,27,5,${rand()*.12})`;g.beginPath();const y=rand()*256;g.moveTo(0,y);g.bezierCurveTo(70,y+rand()*10,190,y-rand()*10,256,y);g.stroke();}}
  else if(type==='brick'){g.fillStyle='#c4b8a5';g.fillRect(0,0,256,256);for(let row=0;row<8;row++)for(let col=-1;col<4;col++){g.fillStyle=['#a86048','#b96b50','#96533e'][Math.floor(rand()*3)];g.fillRect(col*85+(row%2)*42+2,row*32+2,81,28);}}
  else if(type==='marble'){g.fillStyle='#e7e5df';g.fillRect(0,0,256,256);for(let i=0;i<16;i++){g.strokeStyle=`rgba(104,110,112,${.06+rand()*.12})`;g.lineWidth=.5+rand()*2;g.beginPath();const y=rand()*256;g.moveTo(0,y);g.bezierCurveTo(80,y-60,180,y+60,256,y-35);g.stroke();}g.strokeStyle='#b5b6b1';g.strokeRect(0,0,256,256);}
  else {for(let i=0;i<3500;i++){g.fillStyle=`rgba(50,50,40,${rand()*.06})`;g.fillRect(rand()*256,rand()*256,1.5,1.5);}if(type==='tile'){g.strokeStyle='#aaa99f';g.lineWidth=2;g.strokeRect(0,0,256,256);}}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(type==='tile'?2:1,type==='tile'?2:1);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
 }
 load(model,rebar){
  this.model=model;this.rebar=rebar;this.base=createModelGroup({...model,elements:model.elements.filter(e=>!e.linePoints)});this.scene.add(this.base);

  for(const mesh of this.base.children){const d=mesh.userData;mesh.userData.originalColor=mesh.material.color.getHex();mesh.material.envMapIntensity=.35;mesh.material.roughness=.82;
    worldUV(mesh.geometry);
    if(d.kind==='furniture'||d.kind==='door')this.surfaces.apply(mesh.material,'wood');
    else if(d.id.startsWith('floor-finish')||d.kind==='floor')this.surfaces.apply(mesh.material,this.project.id==='apartment-02'&&d.id.startsWith('floor-finish')&&!/bath|entry/.test(d.id)?'wood':'tile');
    else if(['wall','partition','finish','ceiling'].includes(d.kind))this.surfaces.apply(mesh.material,'plaster');
    else if(d.group==='foundation'||d.kind==='roof')this.surfaces.apply(mesh.material,'concrete');
    if(['frame','pipe'].includes(d.kind)){mesh.material.metalness=.72;mesh.material.roughness=.24;mesh.material.color.set(0xbfc7c6);}
    if(['window','window-glass'].includes(d.kind)){mesh.material.color.set(0xc3d8da);mesh.material.opacity=.22;mesh.material.roughness=.09;mesh.material.metalness=.25;mesh.material.envMapIntensity=1.2;mesh.material.depthWrite=false;mesh.castShadow=false;}
   mesh.userData.defaultOpacity=mesh.material.opacity;
   const edges=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,36),new THREE.LineBasicMaterial({color:0x49616b,transparent:true,opacity:.21}));edges.userData.edge=true;mesh.add(edges);
  }
  const detailPoints=[];for(const e of model.elements.filter(e=>e.linePoints&&e.kind==='ornament'))for(let i=1;i<e.linePoints.length;i++)detailPoints.push(...V(e.linePoints[i-1]).toArray(),...V(e.linePoints[i]).toArray());
  const detailGeometry=new THREE.BufferGeometry();detailGeometry.setAttribute('position',new THREE.Float32BufferAttribute(detailPoints,3));this.facadeDetails=new THREE.LineSegments(detailGeometry,new THREE.LineBasicMaterial({color:0x807b6d,transparent:true,opacity:.26}));this.scene.add(this.facadeDetails);
  this.view('exterior','iso');
 }
 ensureBars(){if(this.bars.children.length)return;
  // Rebars share instanced cylinders; each member remains selectable as one object.
  for(const member of this.rebar.members){const rows=this.rebar.bars.filter(b=>b.parent===member.id),geo=new THREE.CylinderGeometry(1,1,1,8),mat=new THREE.MeshStandardMaterial({color:0xa3563a,metalness:.65,roughness:.42});const inst=new THREE.InstancedMesh(geo,mat,rows.length);inst.userData={id:member.id,kind:'rebar',member};rows.forEach((bar,i)=>{const a=V(bar.a),b=V(bar.b),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()),m=new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(.5),q,new THREE.Vector3(bar.nominal/2000,a.distanceTo(b),bar.nominal/2000));inst.setMatrixAt(i,m);});inst.computeBoundingSphere();this.bars.add(inst);}
this.host.dataset.barsBuilt='true';}
 setFinish(id){const f=finishes.find(f=>f.id===id)??finishes[0];this.finish=f.id;this.finishTextures??=new Map();if(!this.finishTextures.has(id))this.finishTextures.set(id,this.surfaces.maps(f.texture==='stone'?'plaster':f.texture).map);const map=this.finishTextures.get(id);for(const m of this.base.children)if(m.userData.id.startsWith('finish-')){this.surfaces.apply(m.material,f.texture==='stone'?'plaster':f.texture);}for(const m of this.materialGroup.children)if(m.userData.id==='material-finish'){m.material.map=map;m.material.color.set(f.color);}this.host.dataset.finish=f.id;}
 materialView(expanded=true){this.view('materials','iso');this.materialExpanded=expanded;this.clear(this.materialGroup);if(expanded){for(const d of materialLayers){const mesh=new THREE.Mesh(new THREE.BoxGeometry(d.size[0],d.size[2],d.size[1]),new THREE.MeshStandardMaterial({color:d.color,roughness:.7}));mesh.position.copy(V(d.pos));mesh.userData=d;mesh.castShadow=true;this.materialGroup.add(mesh);}this.camera.position.set(7.6,3.8,2.5);this.controls.target.set(3.9,1,-2);this.controls.update();}this.setFinish(this.finish);this.applyVisibility();}
 updateFire(fire){this.fire=fire;const topology=JSON.stringify(fire.devices.map(d=>[d.id,d.kind,d.pos,d.size]));if(this.fireTopology===topology){this.syncFire();return;}this.fireTopology=topology;this.fireBuilds=(this.fireBuilds??0)+1;this.clear(this.fireGroup);this.fireMeshes.clear();for(const d of fire.devices){const g=new THREE.Group();g.userData=d;g.position.copy(V(d.pos));const round=['smoke','heat','extinguisher'].includes(d.kind),green=['exit-light','emergency'].includes(d.kind),color=green?0x257b59:round&&d.kind!=='extinguisher'?0xe4e4dd:0xc7503d;const geo=round?new THREE.CylinderGeometry(d.size[0]/2,d.size[0]/2,d.size[2],24):new THREE.BoxGeometry(d.size[0],d.size[2],d.size[1]);const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,emissive:d.on?green?0x8bd5a0:0xff4920:0,emissiveIntensity:d.on?.9:0,roughness:.4}));mesh.userData=d;g.add(mesh);if(d.kind==='extinguisher'){mesh.visible=false;const detailed=createExtinguisher();detailed.position.y=-d.size[2]/2;detailed.traverse(o=>{o.userData={...o.userData,...d};});g.add(detailed);}if(green){const light=new THREE.PointLight(0xc4f4d4,d.on?3:0,3,2);light.position.y=-.1;g.add(light);}const c=document.createElement('canvas');c.width=256;c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#ffffffec';ctx.fillRect(0,0,256,64);ctx.fillStyle=green?'#176944':'#9c3e2b';ctx.font='bold 28px Malgun Gothic';ctx.textAlign='center';ctx.fillText(d.kind==='exit-light'?'출구 · '+d.id:d.id,128,43);const t=new THREE.CanvasTexture(c);const label=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));label.scale.set(.48,.12,1);label.position.y=d.size[2]/2+.11;label.userData.fireLabel=true;g.add(label);this.fireGroup.add(g);this.fireMeshes.set(d.id,g);}this.applyVisibility();this.highlight(this.selected);}
 syncFire(){for(const d of this.fire.devices){const g=this.fireMeshes.get(d.id);if(!g)continue;g.userData=d;const green=['exit-light','emergency'].includes(d.kind),mesh=g.children[0];mesh.material.emissive.set(d.on?(green?0x8bd5a0:0xff4920):0);mesh.material.emissiveIntensity=d.on?.9:0;g.traverse(o=>{if(o.userData?.id===d.id)o.userData={...o.userData,...d};if(o.isLight)o.intensity=d.on?3:0;});}this.applyVisibility();this.highlight(this.selected);}
 pitView(section=false){this.view(section?'pit-section':'pit','iso');this.camera.position.set(10,6,8);this.controls.target.set(3.5,-.25,-2.5);this.controls.update();this.applyVisibility();}
 resetFov(){this.camera.fov=68;this.camera.updateProjectionMatrix();this.updateReadout();this.host.dispatchEvent(new CustomEvent('walk-zoom',{detail:68}));}
 clear(group){disposeModelResources(group);group.clear();}
 updateElectrical(electric){
  this.electric=electric;
  const topology=JSON.stringify([electric.devices.map(d=>[d.id,d.kind,d.pos,d.size]),electric.routes.map(r=>[r.id,r.circuit,r.points,r.diameter]),this.project.circuits.map(c=>c.id)]);
  if(this.electricalTopology===topology){this.syncElectrical();return;}
  this.electricalTopology=topology;this.electricalBuilds=(this.electricalBuilds??0)+1;this.clear(this.electrical);this.deviceMeshes.clear();this.lightObjects.clear();
  for(const d of electric.devices){const g=new THREE.Group();g.userData=d;g.name=d.id;g.position.copy(V(d.pos));
   if(d.kind==='task-light'){
    buildDeskLamp(g,d);this.electrical.add(g);this.deviceMeshes.set(d.id,g);continue;
   }
   const mesh=new THREE.Mesh(new THREE.BoxGeometry(d.size[0],d.size[2],d.size[1]),new THREE.MeshStandardMaterial({color:colors[d.kind],roughness:.4,metalness:d.kind==='panel'?.45:.05}));mesh.userData=d;mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);
   if(d.kind==='light')this.lightObjects.set(d.id,addLuminaireDetails(g,d));
   if(d.kind==='switch'){const rocker=new THREE.Mesh(new THREE.BoxGeometry(d.size[0]*.63,d.size[2]*.62,d.size[1]*1.2),new THREE.MeshStandardMaterial({color:d.on?0xc6e3cb:0xd4d4d0,roughness:.42}));rocker.position.z=d.size[1]*.32;rocker.rotation.x=d.on?-.12:.12;rocker.userData=d;g.add(rocker);}
   if(d.kind==='socket'){for(const z of [-.025,.025]){const hole=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,.009,12),new THREE.MeshBasicMaterial({color:0x3b4750}));hole.rotation.z=Math.PI/2;hole.position.set(-.022,0,z);hole.userData=d;g.add(hole);}}
   if(d.kind==='panel'){for(let i=0;i<this.project.circuits.length;i++){const breaker=new THREE.Mesh(new THREE.BoxGeometry(.05,.08,.025),new THREE.MeshStandardMaterial({color:0x254957}));breaker.position.set((i-(this.project.circuits.length-1)/2)*Math.min(.08,d.size[0]/(this.project.circuits.length+1)),0,.075);breaker.userData={...d,breakerCircuit:this.project.circuits[i].id};g.add(breaker);}}
   this.electrical.add(g);this.deviceMeshes.set(d.id,g);
  }
  for(const r of electric.routes){const g=new THREE.Group();g.userData=r;const color=this.project.circuits.find(c=>c.id===r.circuit).color;for(let i=1;i<r.points.length;i++){const a=V(r.points[i-1]),b=V(r.points[i]),len=a.distanceTo(b);if(len<.0001)continue;const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r.diameter/2,r.diameter/2,len,8),new THREE.MeshStandardMaterial({color,roughness:.45,metalness:.3}));mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());mesh.userData=r;g.add(mesh);}this.electrical.add(g);}
  if(this.tour.active)this.tour.show(this.tour.id,this.tour.step,false);this.applyVisibility();this.highlight(this.selected);
 }
 syncElectrical(){
  for(const d of this.electric.devices){const g=this.deviceMeshes.get(d.id);if(!g)continue;g.userData=d;g.traverse(o=>{if(o.userData?.id===d.id)o.userData={...d,...(o.userData.breakerCircuit?{breakerCircuit:o.userData.breakerCircuit}:{})};});
   if(d.kind==='light')syncLuminaire(g,d);
   if(d.kind==='task-light')setLampPower(g,d);
   if(d.kind==='switch'){const rocker=g.children[1];rocker.rotation.x=d.on?-.12:.12;rocker.material.color.set(d.on?0xc6e3cb:0xd4d4d0);}
  }
  for(const g of this.electrical.children){const route=this.electric.routes.find(r=>r.id===g.userData.id);if(route){g.userData=route;g.traverse(o=>{if(o.userData?.kind==='conduit')o.userData=route;});}}
  if(this.tour.active)this.tour.show(this.tour.id,this.tour.step,false);
  this.applyVisibility();this.highlight(this.selected);
 }
 view(mode='exterior',view='iso'){
  this.tour.stop();if(mode==='rebar')this.ensureBars();this.exitWalk(false);this.mode=mode;this.filter='all';this.exploded=false;this.materialExpanded=false;this.viewName=view;this.applyVisibility();
  if(['front','back','right','left','section','plan','roof','foundation','ceiling'].includes(view)){
   this.active=this.ortho;this.controls.object=this.ortho;this.orthoHeight=['right','left'].includes(view)?6:7.4;
   const center=new THREE.Vector3(this.project.center?.[0]??4.1,view==='foundation'?-.65:1.5,-(this.project.center?.[1]??2));
   const offset={front:[0,0,18],section:[0,0,18],back:[0,0,-18],right:[18,0,0],left:[-18,0,0],plan:[0,18,.001],roof:[0,18,.001],foundation:[0,18,.001],ceiling:[0,-18,.001]}[view];
   if(view==='section')center.z=-3;
   this.ortho.up.set(0,1,0);if(view==='ceiling')this.ortho.up.set(0,0,-1);
   this.ortho.position.copy(center).add(new THREE.Vector3(...offset));this.controls.target.copy(center);this.ortho.lookAt(center);this.controls.enableRotate=false;this.controls.minPolarAngle=0;this.controls.maxPolarAngle=Math.PI;this.ortho.zoom=1;
  }else {this.active=this.camera;this.controls.object=this.camera;this.controls.enableRotate=true;this.controls.maxPolarAngle=Math.PI*.49;this.controls.target.set(this.project.center?.[0]??4.1,mode==='foundation'?-.7:1.1,-(this.project.center?.[1]??2));this.camera.position.set(...(this.project.camera??[11,8,9]));}
  this.size();this.controls.update();this.updateReadout();
 }
 applyVisibility(){
  if(this.renderer.shadowMap)this.renderer.shadowMap.needsUpdate=true;
  if(!this.base)return;
  this.renderer.clippingPlanes=this.mode==='section'?[new THREE.Plane(new THREE.Vector3(0,0,-1),-(this.project.sectionY??3))]:[];
  for(const mesh of this.base.children){const e=mesh.userData;mesh.visible=visibleElement(e,this.mode,this.filter);mesh.position.y=this.exploded?(e.group==='roof'?3.8:e.group==='ceiling'?2:e.kind==='floor'?0:e.group==='foundation'?-1.3:0):0;
   if(this.mode.startsWith('pit')){mesh.visible=e.group==='foundation'||e.id==='pit-access-cover'||e.id==='floor';if(this.mode==='pit-section'&&e.id==='pit-south')mesh.visible=false;if(e.id==='pit-access-cover')mesh.position.y=.7;}
   if(this.mode==='fire')mesh.visible=visibleElement(e,'interior',this.filter);
   if(this.mode==='materials')mesh.visible=!this.materialExpanded&&visibleElement(e,'exterior');
   if(this.mode==='rebar'&&this.rebarFocus)mesh.visible=e.id===this.rebarFocus;
   if(this.mode==='rebar'&&this.rebarDisplay==='bars'&&['all','rebar'].includes(this.filter))mesh.visible=false;
   const ghost=(this.tour.active?this.tour.ghost&&(['wall','partition','finish','ceiling','floor'].includes(e.kind)||e.group==='finish'):false)||this.mode.startsWith('pit')&&e.id==='floor'||((!this.tour.active&&['rebar','electrical','fire'].includes(this.mode))&&!(this.mode==='rebar'&&this.rebarDisplay==='concrete')&&(['wall','partition','floor','roof'].includes(e.kind)||e.group==='foundation'||e.group==='finish'));mesh.material.transparent=ghost||mesh.userData.defaultOpacity<1;mesh.material.opacity=e.detailReplacement?0:ghost?.12:mesh.userData.defaultOpacity;mesh.material.depthWrite=!ghost&&mesh.userData.defaultOpacity===1;
   if(this.fpv&&e.kind==='door')mesh.visible=false;
   if(this.tour.active&&['roof','ceiling'].includes(e.group))mesh.visible=false;
    for(const child of mesh.children){if(child.userData.edge)child.visible=!this.realistic;if(child.userData.detail&&child.material){child.userData.normalOpacity??=child.material.opacity;child.material.opacity=ghost?.12:child.userData.normalOpacity;child.material.transparent=ghost||child.userData.normalOpacity<1;child.material.depthWrite=!ghost&&child.userData.normalOpacity===1;}}
  }
  for(const m of this.bars.children){m.visible=(this.mode==='rebar'&&this.filter==='all'||this.filter==='rebar')&&this.rebarDisplay!=='concrete'&&(!this.rebarSheet||m.userData.member.sheet===this.rebarSheet)&&(this.rebarFocus?m.userData.id===this.rebarFocus:true);m.position.y=0;}
  for(const g of this.electrical.children){const d=g.userData;for(const light of g.children.filter(c=>c.isLight)){light.visible=true;light.castShadow=light.isSpotLight;}g.visible=this.filter==='all'?d.kind==='conduit'?this.mode==='electrical'&&!this.fpv:['electrical','interior','experience','exterior'].includes(this.mode):this.filter==='electrical';if(this.mode==='electrical'&&d.circuit){if(this.electricalSheet===(this.project.lightingSheet??'E-101')&&d.circuit!==(this.project.lightingCircuit??'L1')||this.electricalSheet===(this.project.powerSheet??'E-102')&&d.circuit===(this.project.lightingCircuit??'L1'))g.visible=false;if(this.circuitFocus&&d.circuit!==this.circuitFocus)g.visible=false;}}
  if(this.tour.active)for(const g of this.electrical.children){const d=g.userData;g.visible=d.kind!=='conduit'&&([this.tour.id,this.tour.data.device.id,this.tour.data.panel.id].includes(d.id));}
   this.materialGroup.visible=this.mode==='materials'&&!!this.materialExpanded;
  for(const g of this.fireGroup.children){g.visible=['fire','experience','interior','exterior'].includes(this.mode)&&this.filter==='all';for(const label of g.children.filter(c=>c.userData.fireLabel))label.visible=this.mode==='fire'||g.userData.kind==='exit-light';}
  this.ground.visible=!['foundation','rebar','section','section-exploded','pit','pit-section'].includes(this.mode)&&!this.materialExpanded&&this.filter==='all';this.grid.visible=this.ground.visible&&!this.realistic;this.site.visible=this.realistic&&this.ground.visible&&this.project.siteContext!==false;
  if(this.facadeDetails)this.facadeDetails.visible=['exterior','experience'].includes(this.mode)&&this.filter==='all'&&!this.exploded;
  this.props?.sync();if(this.surfaces){this.host.dataset.cachedSurfaces=String(this.surfaces.cachedMaps);this.host.dataset.generatedSurfaces=String(this.surfaces.generatedMaps);}this.updateReadout();
 }
 updateReadout(){this.host.dataset.litLights=[...this.lightObjects].filter(([,light])=>{if(light.intensity<=0)return false;for(let o=light;o;o=o.parent)if(!o.visible)return false;return true;}).map(([id])=>id).join(',');this.host.dataset.electricalBuilds=String(this.electricalBuilds??0);this.host.dataset.fireBuilds=String(this.fireBuilds??0);this.host.dataset.electricalVisible=this.electrical.children.filter(g=>g.visible).map(g=>g.userData.id).join(',');this.host.dataset.breakerCount=String([...this.deviceMeshes.values()].flatMap(g=>g.children).filter(m=>m.userData.breakerCircuit).length);this.host.dataset.mode=this.mode;this.host.dataset.view=this.fpv?'fpv':this.viewName??'iso';this.host.dataset.filter=this.filter;this.host.dataset.visible=String(this.base?.children.filter(x=>x.visible).length??0);this.host.dataset.selected=this.selected??'';this.host.dataset.fov=String(this.camera.fov);this.host.dataset.rebarDisplay=this.rebarDisplay;this.host.dataset.rebarMembers=this.bars.children.filter(x=>x.visible).map(x=>x.userData.id).join(',');this.host.dataset.fireAlarm=String(this.fire?.alarm??false);this.host.dataset.foundationVisible=String(this.base?.children.filter(x=>x.visible&&x.userData.group==='foundation').length??0);const object=this.fireMeshes.get(this.selected)??this.materialGroup.children.find(x=>x.userData.id===this.selected)??this.deviceMeshes.get(this.selected)??this.base?.children.find(x=>x.userData.id===this.selected);this.selectionOutline.visible=!!object?.visible&&!this.fpv;if(this.selectionOutline.visible)this.selectionOutline.box.setFromObject(object).expandByScalar(.025);}
 part(filter){if(filter==='rebar')this.ensureBars();this.filter=filter;this.rebarFocus=null;this.rebarDisplay=filter==='rebar'?'bars':'both';this.applyVisibility();}
 whole(){this.circuitFocus=null;this.rebarFocus=null;this.selected=null;this.highlight(null);this.view('exterior','iso');}
 explode(){this.view('exterior','iso');this.exploded=true;this.mode='section-exploded';this.applyVisibility();for(const g of this.base.children)if(g.userData.group==='foundation')g.visible=true;this.camera.position.set(17,15,16);this.controls.target.set(4.1,2.5,-2);this.controls.update();}
 setRealistic(on){if(on&&!this.environment){const pmrem=new THREE.PMREMGenerator(this.renderer),room=new RoomEnvironment();this.environmentTarget=pmrem.fromScene(room,.04);this.environment=this.environmentTarget.texture;this.scene.environment=this.environment;pmrem.dispose();room.dispose();this.createSite();this.host.dataset.realisticBuilt='true';}this.renderer.shadowMap.enabled=on;this.realistic=on;if(on&&!this.props&&!this.propsPending){this.propsPending=import('./interior-props.mjs').then(({InteriorProps})=>{if(!this.disposed){this.props=new InteriorProps(this);this.props.sync();}}).catch(()=>{this.propsPending=null;this.host.dataset.propsState='error';});}if(on&&this.props?.state==='error')this.props.load();this.setNight(this.night);this.applyVisibility();}
 setNight(on){this.night=on;this.scene.background.set(on?0x172638:this.realistic?0xb9ccd4:0xdfe8e9);this.ambient.intensity=on?.16:this.realistic?.75:1.8;this.sun.intensity=on?.10:this.realistic?(this.project.daylight??3.2):2.5;this.sun.color.set(on?0xaac9ff:0xfff0d9);this.scene.environmentIntensity=on?.10:this.realistic?.55:.6;this.renderer.toneMappingExposure=on?1.1:1.05;this.ground.material.color.set(this.realistic?0x919986:0xd5dfdd);if(this.project.id==='apartment-02')this.applyVisibility();}
 highlight(id){this.selected=id;const room=this.project.rooms.find(r=>'room-'+r.id===id);this.roomMarker.visible=!!room;if(room){const [x,y,X,Y]=room.bounds;this.roomMarker.scale.set(X-x,Y-y,1);this.roomMarker.position.set((x+X)/2,this.project.finishLevel+.012,-(y+Y)/2);this.roomMarker.userData={id};}for(const m of this.base?.children??[]){m.material.emissive.set(m.userData.id===id?0x73501e:0);m.material.emissiveIntensity=.5;}for(const m of this.bars.children)m.material.color.set(m.userData.id===id?0xa84421:0x6e3f2c);for(const g of this.deviceMeshes.values()){const d=g.userData;if(d.kind==='light')syncLuminaire(g,d);else{const m=g.children[0];m.material.emissive.set(d.id===id?0x73501e:0);m.material.emissiveIntensity=d.id===id?.5:0;}if(d.kind==='task-light')setLampPower(g,d);}this.updateReadout();}
 focusObject(id){const m=this.base.children.find(x=>x.userData.id===id);if(m){this.active=this.camera;this.controls.object=this.camera;this.controls.enableRotate=true;const box=new THREE.Box3().setFromObject(m),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),span=Math.max(size.x,size.y,size.z),distance=span/(2*Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2)))*1.35;this.controls.target.copy(center);this.camera.position.copy(center).add(new THREE.Vector3(.65,.7,1).normalize().multiplyScalar(distance/Math.min(1,this.camera.aspect)));this.controls.update();}this.highlight(id);}
 focusMember(id){this.rebarFocus=id;this.applyVisibility();this.focusObject(id);}
 pick(x,y){const r=this.renderer.domElement.getBoundingClientRect(),mouse=x===null?new THREE.Vector2(0,0):new THREE.Vector2((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(mouse,this.active);const candidates=[];
  for(const g of [...this.base.children,...this.bars.children,...this.electrical.children,...this.fireGroup.children,...(this.materialGroup.visible?this.materialGroup.children:[])])if(g.visible){if(g.isMesh&&!g.userData.detailReplacement)candidates.push(g);if(g.userData.kind==='extinguisher')g.traverseVisible(c=>{if(c.isMesh)candidates.push(c);});else for(const c of g.children)if(c.isMesh&&c.visible&&!c.userData.edge)candidates.push(c);}
  const hits=ray.intersectObjects(candidates,false).filter(h=>![...this.renderer.clippingPlanes,...(h.object.material?.clippingPlanes??[])].some(p=>p.distanceToPoint(h.point)<0));let hit=hits[0];
  if(this.mode==='fire')hit=hits.find(h=>h.object.userData.system==='fire')??hit;
  if(['electrical','experience','interior'].includes(this.mode)){const dev=hits.find(h=>h.object.userData.circuit||h.object.userData.kind==='panel');if(dev&&(!this.fpv||dev.distance<2.5)&&(!hit||dev.distance<hit.distance+.15||this.mode==='electrical'))hit=dev;}
  if(!hit)return;let d=hit.object.userData;if(d.kind==='conduit')d=this.electric.devices.find(x=>x.id===d.target);
  if(this.fpv&&(d.kind==='switch'||d.kind==='task-light')&&hit.distance<2.5)this.onSwitch(d.id);this.onSelect(d.id,'3d');
 }
 enterWalk(room='guard'){
  this.fpv=true;this.mode='experience';this.viewName='fpv';this.filter='all';this.exploded=false;this.realistic=true;this.active=this.camera;this.controls.enabled=false;this.camera.fov=68;this.camera.updateProjectionMatrix();this.teleport(room);this.applyVisibility();this.setRealistic(true);this.renderer.domElement.focus();
 }
 teleport(room){const r=this.project.rooms.find(r=>r.id===room)??this.project.rooms[0];this.camera.position.copy(V([...r.spawn,this.project.finishLevel+this.project.eyeHeight]));this.yaw=r.yaw;this.pitch=0;this.look();this.onMove?.(r.name);}
 visitSwitch(id){const d=this.electric.devices.find(d=>d.id===id);if(!d)return;const points={SW1:[5.67,1.15],SW2:[3.7,1.3],SW3:[3.7,2.6],SW4:[3.3,2.85]};this.camera.position.copy(V([...points[id],this.project.finishLevel+this.project.eyeHeight]));const v=V(d.pos).sub(this.camera.position);this.yaw=Math.atan2(-v.x,-v.z);this.pitch=Math.atan2(v.y,Math.hypot(v.x,v.z));this.look();}
 look(){this.camera.rotation.set(this.pitch,this.yaw,0,'YXZ');this.host.dataset.position=`${this.camera.position.x.toFixed(2)},${(-this.camera.position.z).toFixed(2)}`;this.updateReadout();}
 exitWalk(reset=true){const was=this.fpv;this.fpv=false;this.keys.clear();this.controls.enabled=true;this.camera.fov=43;this.camera.updateProjectionMatrix();if(was&&reset)this.view('exterior','iso');}
 move(forward,side,dt=.22){const p=this.camera.position,dx=(-Math.sin(this.yaw)*forward+Math.cos(this.yaw)*side)*dt,dy=(Math.cos(this.yaw)*forward+Math.sin(this.yaw)*side)*dt;const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.04));for(let i=0;i<steps;i++){if(this.walkCheck(p.x+dx/steps,-p.z,this.model))p.x+=dx/steps;if(this.walkCheck(p.x,-p.z+dy/steps,this.model))p.z-=dy/steps;}this.host.dataset.position=`${p.x.toFixed(2)},${(-p.z).toFixed(2)}`;}
 walkKeys(dt){const f=(this.keys.has('w')||this.keys.has('ArrowUp')?1:0)-(this.keys.has('s')||this.keys.has('ArrowDown')?1:0),s=(this.keys.has('d')||this.keys.has('ArrowRight')?1:0)-(this.keys.has('a')||this.keys.has('ArrowLeft')?1:0);if(f||s)this.move(f/Math.max(1,Math.hypot(f,s)),s/Math.max(1,Math.hypot(f,s)),dt*1.5);}
 turn(delta){this.yaw+=delta;this.look();}
 image(){this.renderer.render(this.scene,this.active);return this.renderer.domElement.toDataURL('image/png');}
}
