import {FireSimulation} from './fire-simulation.mjs';
import {StructuralLoadView} from './structural-load-view.mjs';
import {bayFireLesson,extinguisher} from './src/cleanroom-fire.mjs';
import {createExtinguisher} from './fire-extinguisher.mjs';
import {SurfaceLibrary,worldUV} from './surface-materials.mjs';
import {observeScene,presentScene} from './render-loop.mjs';
import {keyboardOrbit,lightenOnSlowFrames} from './scene-access.mjs';
import {ProgramGate} from './program-warmup.mjs';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {layerModel,strip,stripBars,slabDesign,walkable} from './src/cleanroom-construction.mjs';
import {rebarSize} from './src/rebar-sizes.mjs';
import {createModelGroup,disposeModelResources as disposeTree} from './src/scene.mjs';
import {bayModel,panel,equipment,fireDevices,rooms,sheets} from './src/cleanroom-project.mjs';

const point=([x,y,z])=>new THREE.Vector3(x,z,-y);
function part(group,geometry,color,position,metalness=.25){
  const material=new THREE.MeshStandardMaterial({color,metalness,roughness:.40});
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(...position);group.add(mesh);return mesh;
}
function cuboid(g,size,color,p,metal){return part(g,new THREE.BoxGeometry(...size),color,p,metal);}
function deviceMesh(d){
  const g=new THREE.Group(),[w,depth,h]=d.size;
  const shell=cuboid(g,[w,h,depth],d.kind==='alarm'?0xa63a25:d.kind==='exit'?0x08734d:0xa8babf,[0,0,0],.55);
  if(d.kind==='ffu'){
    const rotor=new THREE.Group();rotor.position.y=h/2+.025;g.add(rotor);g.userData.rotor=rotor;
    const motor=part(g,new THREE.CylinderGeometry(.26,.26,.045,40),0x495f66,[0,h/2,0]);
    for(let i=0;i<7;i++){
      const blade=part(rotor,new THREE.SphereGeometry(1,14,7),0x93b0b1,[.12*Math.cos(i*2*Math.PI/7),.012,.12*Math.sin(i*2*Math.PI/7)],.52);
      blade.scale.set(.13,.016,.045);blade.rotation.y=-i*2*Math.PI/7-.42;
    }
    part(g,new THREE.CylinderGeometry(.055,.055,.035,20),0xbfc9c8,[0,rotor.position.y+.012,0]);
    for(const r of [.12,.19,.26]){
      const grill=part(g,new THREE.TorusGeometry(r,.004,5,48),0xc7d3d5,[0,motor.position.y+.07,0]);grill.rotation.x=Math.PI/2;
    }
    for(let i=0;i<16;i++)cuboid(g,[.009,.022,depth-.05],0x647d83,[-w*.46+i*.07,-h/2,0]);
  }else if(d.kind==='extinguisher'){
    shell.visible=false;const tool=createExtinguisher();tool.position.y=-h/2;g.add(tool);
  }else if(d.kind==='light'){
    g.userData.indicator=cuboid(g,[w-.04,.012,depth-.03],0xfff3db,[0,-h/2,0]);
    g.userData.strip=cuboid(g,[w-.04,.012,depth-.03],0xffefdb,[0,h/2+.002,0]);
    const glow=new THREE.PointLight(0xffedce,0,4,2);glow.position.y=-.11;g.userData.glow=glow;g.add(glow);
  }else if(d.kind==='panel'||d.kind==='receiver'){
    cuboid(g,[.012,h*.72,depth*.8],0xe0e8e7,[w/2+.004,0,0]);
    for(let i=0;i<(d.kind==='panel'?2:1);i++)cuboid(g,[.025,.063,.10],i===1?0x118392:0x28444c,[w/2+.02,.05,-.08+i*.15]);
     if(d.kind==='receiver')g.userData.indicator=cuboid(g,[.015,.035,.035],0x66b78c,[w/2+.03,h*.3,0]);
  }else if(d.kind==='smoke'){
    shell.visible=false;g.userData.indicator=part(g,new THREE.CylinderGeometry(.1,.076,.065,32),0xf4f1e8,[0,0,0]);
  }else g.userData.indicator=shell;
  g.position.copy(point(d.pos));g.traverse(o=>{o.userData.deviceId=d.id;});return g;
}
function pipe(points,material,radius){
  const path=new THREE.Group();
  for(let i=1;i<points.length;i++){
    const a=point(points[i-1]),b=point(points[i]),axis=b.clone().sub(a);
    if(axis.length()<.001)continue;
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,axis.length(),8),material);
    mesh.position.copy(a).lerp(b,.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axis.normalize());path.add(mesh);
  }return path;
}

export const prepareBayMaterials=()=>SurfaceLibrary.prepare();

export function mountBay(host,select,fireAdapter){
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  const camera=new THREE.PerspectiveCamera(37,1,.04,60), scene=new THREE.Scene();
  const loadDiagram=new StructuralLoadView(scene,host);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.55));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.90;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene.background=new THREE.Color(0xe6eceb);
  const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=generator.fromScene(room,.03);
  scene.environment=env.texture;scene.environmentIntensity=.7;generator.dispose();room.dispose();
  const ambient=new THREE.HemisphereLight(0xe9f2f4,0x697d87,1.20);scene.add(ambient);
  const sun=new THREE.DirectionalLight(0xfff6e2,2.1);sun.position.set(1,9,3);sun.target.position.set(3,0,-2);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,far:20});sun.shadow.normalBias=.025;scene.add(sun,sun.target);
  const model=bayModel();const base=createModelGroup(model);scene.add(base);
  const surfaces=new SurfaceLibrary(renderer);
  for(const m of base.children){if(!m.material)continue;const d=m.userData;if(d.id==='slab'){worldUV(m.geometry);surfaces.apply(m.material,'concrete');}else if(d.id.startsWith('tile-')){worldUV(m.geometry);surfaces.apply(m.material,'tile',0xc6d8d8);}else if(d.kind==='wall'||d.kind==='ceiling'){m.material.roughness=.36;m.material.metalness=.25;}else if(d.name.includes('작업대')){m.material.roughness=.26;m.material.metalness=.76;}}
  const site=new THREE.Group();scene.add(site);const ground=cuboid(site,[13,.04,11],0xc8d0cc,[3.6,-.29,-2.4]);ground.receiveShadow=true;
  for(const x of [3.32,5.72])for(let i=0;i<6;i++){
    const wafer=part(base,new THREE.CylinderGeometry(.145,.145,.008,48),i%2?0x526878:0x706d85,[x+i*.037,1.15,-3.94],.78);wafer.rotation.z=Math.PI/2;
  }
  // Workbench instruments and wall return grilles remain part of the room background.
  for(const x of [2.76,5.16]){
    cuboid(base,[.35,.055,.22],0x364e58,[x+.05,1.0,-4.05]);
    cuboid(base,[.035,.19,.035],0x72868d,[x+.05,1.11,-4.12]);
    cuboid(base,[.48,.31,.035],0x303f48,[x+.05,1.28,-4.13]);
    cuboid(base,[.432,.257,.006],0x49747d,[x+.05,1.28,-4.107]);
    for(let i=0;i<3;i++)cuboid(base,[.21-i*.036,.009,.005],0x8fccbe,[x,1.34-i*.036,-4.102]);
    cuboid(base,[.30,.018,.105],0x637079,[x+.04,.971,-3.74]);
  }
  for(const x of [2.15,4.38,6.72])for(let i=0;i<9;i++)
    cuboid(base,[.29,.015,.018],0x536d76,[x,.17+i*.036,-4.78]);
  const enclosure=base.children.filter(m=>m.userData.kind==='ceiling'||m.userData.id==='south-wall');
  const construction=new THREE.Group();scene.add(construction);
  let walking=false;let drawingId='A-301',physicalMode='',constructionKey='',activeLayer=0,section,steel,concrete;
  function prepareConstruction(tab,assembly,layer,display){
    const next=tab==='materials'?'material-'+assembly:tab==='structure'?'slab':'';
    if(next!==constructionKey){
      for(const child of [...construction.children]){disposeTree(child);construction.remove(child);}
      constructionKey=next;section=null;
      if(tab==='materials'){section=createModelGroup(layerModel(assembly));construction.add(section);}
      if(tab==='structure'){
        const [x,y,r,b]=strip.bounds,depth=slabDesign.thickness/1000;
        concrete=cuboid(construction,[r-x,depth,b-y],0x8e9d9c,[(r+x)/2,strip.top-depth/2,-(b+y)/2]);
        steel=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color:0x904522,roughness:.6});
        for(const line of stripBars())steel.add(pipe(line,mat,rebarSize(slabDesign.diameter).nominal/2000));construction.add(steel);
      }
    }
    activeLayer=layer||0;
    if(section)for(const [i,m] of section.children.entries()){m.material.emissive.setHex(i===activeLayer?0x644021:0);m.material.emissiveIntensity=.35;}
    if(tab==='structure'){steel.visible=display!=='concrete';concrete.visible=display!=='bars';concrete.material.transparent=display==='both';concrete.material.opacity=display==='both'?.19:1;concrete.material.depthWrite=display!=='both';}
    construction.visible=Boolean(next);base.visible=!next;for(const m of enclosure)m.visible=tab==='experience';
  }
  const objects=new Map([panel,...equipment,...fireDevices,extinguisher].map(d=>[d.id,deviceMesh(d)]));
  for(const g of objects.values())scene.add(g);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.minDistance=2.2;controls.maxDistance=20;controls.maxPolarAngle=Math.PI*.48;
  keyboardOrbit(controls,renderer.domElement);lightenOnSlowFrames(renderer);
  let yaw=0,pitch=0,walkX=4.4,walkY=1.15,drag=null;
  const look=()=>{camera.position.copy(point([walkX,walkY,1.60]));camera.rotation.set(pitch,yaw,0,'YXZ');host.dataset.walk=[walkX.toFixed(2),walkY.toFixed(2)].join(',');};
  function walk(action){
    if(!walking)return;
    if(action==='entry'||action==='station'){walkX=action==='entry'?.84:4.4;walkY=1.1;yaw=action==='entry'?-Math.PI/2:0;pitch=.15;}
    else if(action==='left'||action==='right'){yaw+=(action==='left'?1:-1)*.25;}
    else{
      const forward=(action==='forward'?1:action==='back'?-1:0),side=(action==='strafe-right'?1:action==='strafe-left'?-1:0);
      const dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*.055,dy=(Math.cos(yaw)*forward+Math.sin(yaw)*side)*.055;
      for(let i=0;i<5;i++){if(walkable(model,walkX+dx,walkY))walkX+=dx;if(walkable(model,walkX,walkY+dy))walkY+=dy;}
    }
    look();redraw();
  }
  const focusObject=target=>{const box=new THREE.Box3().setFromObject(target),center=box.getCenter(new THREE.Vector3()),span=box.getSize(new THREE.Vector3()).length();controls.target.copy(center);camera.position.copy(center).addScaledVector(new THREE.Vector3(1,.55,1).normalize(),span*1.6/Math.min(1,camera.aspect));controls.update();};
  const home=()=>{
    camera.fov=walking?64:37;camera.updateProjectionMatrix();
    if(walking){look();return;}
    if(physicalMode==='building'&&drawingId==='A-305'){const target=base.children.find(m=>m.userData.id===host.dataset.selection);if(target){focusObject(target);return;}}
    if(physicalMode==='building'&&['A-302','A-304'].includes(drawingId)){
      controls.target.set(3.6,1.25,-2.4);camera.position.set(3.6,1.25,9/Math.min(1,camera.aspect));controls.update();return;
    }
    if(physicalMode==='building'&&drawingId==='A-303'){
      controls.target.set(3.6,2.8,-2.4);camera.position.set(3.6,15/Math.min(1,camera.aspect),-2.399);controls.update();return;
    }
    if(physicalMode==='materials'||physicalMode==='structure'){
      const target=physicalMode==='materials'?new THREE.Vector3(0,.40,constructionKey.endsWith('wall')?-.90:.0):point([3.6,1.2,-.17]);
      controls.target.copy(target);const direction=new THREE.Vector3(.7,.85,1.4).normalize();camera.position.copy(target).addScaledVector(direction,(physicalMode==='materials'?2.85:4.45)/Math.min(1,camera.aspect));controls.update();return;
    }
    const sphere=new THREE.Box3().setFromObject(base).getBoundingSphere(new THREE.Sphere());
    const vertical=THREE.MathUtils.degToRad(camera.fov)/2,horizontal=Math.atan(Math.tan(vertical)*camera.aspect);
    const distance=1.08*sphere.radius/Math.sin(Math.min(vertical,horizontal));
    controls.target.copy(sphere.center);controls.maxDistance=Math.max(20,distance*2);
    camera.position.copy(sphere.center).addScaledVector(new THREE.Vector3(.48,.80,1).normalize(),distance);controls.update();};
  host.replaceChildren(renderer.domElement);renderer.domElement.setAttribute('aria-label','반도체 클린룸 3D 모형');
  let highlight=new THREE.BoxHelper(new THREE.Object3D(),0x9e4f18);highlight.visible=false;scene.add(highlight);
  let routeGroup=new THREE.Group(),routeKey='',litFans=[],shown=[],dirty=true;
  const roomMarker=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xe8b572,transparent:true,opacity:.4,depthWrite:false,side:THREE.DoubleSide}));roomMarker.rotation.x=-Math.PI/2;roomMarker.visible=false;scene.add(roomMarker);
  scene.add(routeGroup);
  const redraw=()=>{dirty=true;};
  const resize=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();if(width>0&&height>0){camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);if(!simulation?.active)home();redraw();}});
  resize.observe(host);controls.addEventListener('change',redraw);
  let simulation;
  // While shaders for a new picture are still being built the old picture stays; the gate asks for the frame again when they are ready.
  const gate=new ProgramGate(renderer,{host,onChange:on=>{if(!on)dirty=true;}});
  const draw=force=>{if(!force&&!gate.check(scene,camera))return false;renderer.render(scene,camera);dirty=false;return true;};
  const loop=observeScene(host,dt=>{simulation?.update(dt);if(!dirty&&!litFans.length&&!simulation?.active)return;for(const g of litFans)g.rotation.y-=dt*3.4;draw();},host.parentElement);
  let start,disposed=false;
  const down=e=>{start=[e.clientX,e.clientY];if(walking){drag=start;renderer.domElement.setPointerCapture(e.pointerId);renderer.domElement.focus({preventScroll:true});}};
  const aim=e=>{if(!drag||!walking)return;yaw-=(e.clientX-drag[0])*.006;pitch=Math.max(-1.1,Math.min(1.25,pitch-(e.clientY-drag[1])*.006));drag=[e.clientX,e.clientY];look();redraw();};
  const up=e=>{drag=null;if(!start||Math.hypot(e.clientX-start[0],e.clientY-start[1])>5)return;
    const b=renderer.domElement.getBoundingClientRect(), ray=new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(2*(e.clientX-b.left)/b.width-1,1-2*(e.clientY-b.top)/b.height),camera);
    const hit=ray.intersectObjects(['building','experience'].includes(physicalMode)?[base,...shown]:shown,true).find(hit=>hit.object.visible&&(hit.object.userData.deviceId||hit.object.userData.id));
    const id=hit?.object.userData.deviceId??hit?.object.userData.id;
    if(id)select(id);else if(physicalMode==='materials'&&section){const hit=ray.intersectObjects(section.children)[0];const index=hit?section.children.indexOf(hit.object):-1;if(index>=0)select('layer-'+index);}
  };
  const canvas=renderer.domElement;canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);
  canvas.tabIndex=0;canvas.addEventListener('wheel',e=>{if(!walking)return;e.preventDefault();camera.fov=Math.max(35,Math.min(85,camera.fov+Math.sign(e.deltaY)*3));camera.updateProjectionMatrix();host.dataset.fov=String(camera.fov);redraw();},{passive:false});canvas.addEventListener('pointermove',aim);canvas.addEventListener('pointercancel',()=>{drag=null;});
  canvas.addEventListener('keydown',e=>{if(!walking)return;const action={w:'forward',s:'back',a:'strafe-left',d:'strafe-right',ArrowUp:'forward',ArrowDown:'back',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(action){e.preventDefault();walk(action);}});
  const fireMeshes=new Map([...objects].filter(([id])=>[...fireDevices,extinguisher].some(d=>d.id===id)));
  const view={host,scene,camera,controls,site,fireMeshes,project:{id:'cleanroom-03',finishLevel:0,rooms:rooms.map(r=>({...r,spawn:r.id==='room-work'?[4.55,2.45]:[.8,1.1]}))},clear:g=>{disposeTree(g);g.clear();},size:()=>{const {width,height}=host.getBoundingClientRect();if(width>0&&height>0){camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);}redraw();},exitWalk:()=>{controls.enabled=true;},setRealistic:()=>{renderer.toneMappingExposure=.9;},setNight:on=>{renderer.toneMappingExposure=on?.45:.9;},view:()=>{for(const m of enclosure)m.visible=false;controls.enabled=true;home();},highlight:id=>{const g=objects.get(id);if(g){highlight.visible=true;highlight.setFromObject(g);}redraw();}};
  if(fireAdapter)simulation=new FireSimulation(view,{...fireAdapter,lesson:bayFireLesson,before:()=>{controls.enabled=true;}});
  host.dataset.cachedSurfaces=String(surfaces.cachedMaps);host.dataset.generatedSurfaces=String(surfaces.generatedMaps);
  return {simulation,present:async current=>{view.size();for(let n=0;n<400&&!disposed&&current()&&!gate.check(scene,camera);n++)await gate.settle();return presentScene(host,()=>{view.size();draw();},{current});},image:()=>{draw(true);return canvas.toDataURL('image/png');},realistic:()=>{renderer.shadowMap.enabled=true;redraw();},home:()=>{home();redraw();},whole:()=>{for(const m of enclosure)m.visible=true;home();redraw();},walk,setActive:active=>loop.setActive(active),update({electric,fire,id,tab,path,color,assembly,layer,display,live=slabDesign.live,sheet='A-301',experienceView='outside',night=false}){
    const nextWalking=tab==='experience'&&experienceView==='inside';
    const changed=physicalMode!==tab||drawingId!==sheet||walking!==nextWalking||tab==='materials'&&constructionKey!=='material-'+assembly;
    walking=nextWalking;host.dataset.walking=String(walking);host.dataset.night=String(night);
    const studio=tab!=='experience';scene.background.set(night?0x172638:studio?0x12171c:0xe6eceb);ground.material.color.set(studio?0x12171c:0xc8d0cc);ambient.intensity=night?.12:1.2;sun.intensity=night?.08:2.1;scene.environmentIntensity=night?.10:.7;
    drawingId=sheet;
    prepareConstruction(tab,assembly,layer,display);
    const cut=tab==='building'&&sheets.find(s=>s.id===sheet)?.view==='section';
    renderer.localClippingEnabled=cut;
    const planes=cut?[new THREE.Plane(new THREE.Vector3(0,0,-1),-sheets.find(s=>s.id===sheet).cutY)]:[];
    for(const group of [base,...objects.values()])group.traverse(mesh=>{if(mesh.material)mesh.material.clippingPlanes=planes;});
    if(tab==='building'&&sheets.find(s=>s.id===sheet)?.view==='elevation'){const south=base.children.find(m=>m.userData.id==='south-wall');south.visible=true;}
    physicalMode=tab;controls.enabled=!walking;controls.minDistance=tab==='materials'?.5:1.2;
    if(changed){if(walking)walk('station');home();}

    const fireMode=['fire','test','fire-signal'].includes(tab),fireIds=[...fireDevices,extinguisher].map(d=>d.id);
    shown=[...objects.entries()].filter(([key])=>fireMode?fireIds.includes(key):!fireIds.includes(key)).map(([,g])=>g);
    if(constructionKey)shown=[];
    litFans=[];
    for(const [key,g] of objects){g.visible=!constructionKey&&shown.includes(g);const d=electric.devices.find(v=>v.id===key);
      if(g.userData.strip){g.userData.strip.material.color.setHex(d.on?0xffe5a0:0x536168);g.userData.strip.material.emissive.setHex(d.on?0xffcf77:0);g.userData.glow.intensity=d.on?d.watts*.18:0;}
      if(d?.on&&g.visible&&g.userData.rotor)litFans.push(g.userData.rotor);
      const fd=fire?.devices.find(d=>d.id===key);g.userData={...g.userData,...(fd??{})};
      const lens=g.userData.indicator;
      if(lens){const on=d?.on||fd?.on;lens.material.emissive.setHex(on?(key==='EX3'||key==='RP3'?0x22b168:key==='ALM3'?0xff421f:0xffe5bd):0);lens.material.emissiveIntensity=on?1.3:0;}
    }
    const room=rooms.find(r=>r.id===id);roomMarker.visible=tab==='building'&&!!room&&!cut;if(roomMarker.visible){const [x,y,r,b]=room.bounds;roomMarker.position.copy(point([(x+r)/2,(y+b)/2,.012]));roomMarker.scale.set(r-x,b-y,1);}
    const target=objects.get(id)??base.children.find(m=>m.userData.id===id);
    if(tab==='building'&&sheet==='A-303')for(const m of enclosure)if(m.userData.kind==='ceiling'&&m.userData.id!=='ceiling-deck')m.visible=true;
    if(tab==='building'&&sheet==='A-305'&&target&&(changed||host.dataset.selection!==id))focusObject(target);
    highlight.visible=Boolean(!constructionKey&&target?.visible);if(highlight.visible)highlight.setFromObject(target);
    const nextRoute=JSON.stringify([path,color]);if(nextRoute!==routeKey){scene.remove(routeGroup);disposeTree(routeGroup);routeGroup=path.length>1?pipe(path,new THREE.MeshBasicMaterial({color}),.024):new THREE.Group();scene.add(routeGroup);routeKey=nextRoute;}
    loadDiagram.update(tab==='structure'?concrete:null,live,slabDesign.live,slabDesign.span);
    host.dataset.fireAlarm=String(fire?.alarm===true);host.dataset.selection=id;host.dataset.pathPoints=String(path.length);host.dataset.fansRunning=String(litFans.length);
    redraw();
  },dispose(){
    if(disposed)return;disposed=true;gate.dispose();simulation?.dispose();loop.dispose();resize.disconnect();controls.dispose();env.dispose();disposeTree(scene);surfaces.dispose();renderer.dispose();canvas.remove();
  }};
}
