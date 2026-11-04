import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const $=id=>document.getElementById(id),base='/pages/guardhouse-classroom/education/props-study/',kb=n=>(n/1000).toFixed(1)+' kB',integer=n=>n.toLocaleString('ko-KR');
let manifest,slug='mug',level=1,serial=0,disposed=false,models=[],frame,metrics=null,controller=null,renderer,controls,environment,resize;
const scenes=[],camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,50),loader=new GLTFLoader();
// Use DOM images under the existing img-src blob policy (ImageBitmapLoader fetches blobs through connect-src).
loader.register(parser=>{parser.textureLoader=new THREE.TextureLoader(parser.options.manager);return {name:'DOMImageTextures'};});
function release(object){const geometries=new Set(),materials=new Set(),textures=new Set();object?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of o.material?Array.isArray(o.material)?o.material:[o.material]:[]){materials.add(m);for(const [key,value]of Object.entries(m))if(value?.isTexture&&key!=='envMap')textures.add(value);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>{t.dispose();t.source?.data?.close?.();});object?.removeFromParent();}
function draw(){if(!renderer||disposed||document.hidden)return;renderer.info.reset();renderer.setScissorTest(true);const w=$('canvas-host').clientWidth,h=$('canvas-host').clientHeight,half=Math.floor(w/2);for(let i=0;i<2;i++){renderer.setViewport(i*half,0,i?w-half:half,h);renderer.setScissor(i*half,0,i?w-half:half,h);renderer.render(scenes[i],camera);}if(metrics){metrics.geometries=renderer.info.memory.geometries;metrics.textures=renderer.info.memory.textures;metrics.drawCalls=renderer.info.render.calls;metrics.renderTriangles=renderer.info.render.triangles;$('comparison').dataset.metrics=JSON.stringify(metrics);}}
function size(){if(!renderer)return;const w=$('canvas-host').clientWidth,h=$('canvas-host').clientHeight,aspect=w/2/h,extent=Math.max(.84,.75/aspect);renderer.setSize(w,h);camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();draw();}
function cameraView(front=false){camera.position.set(front?0:1.2,front?.52:1.1,front?3:2.8);controls.target.set(0,.48,0);camera.zoom=1;camera.updateProjectionMatrix();controls.update();draw();}
function setup(){
 if(renderer)return;
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.info.autoReset=false;
 renderer.domElement.setAttribute('aria-label','왼쪽 원본 형상, 오른쪽 경량 형상. 드래그하면 두 모델이 같은 시점으로 회전합니다.');$('canvas-host').append(renderer.domElement);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();environment=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();
 for(let i=0;i<2;i++){const scene=new THREE.Scene();scene.background=new THREE.Color(0xe3e8e6);scene.environment=environment.texture;scene.environmentIntensity=.65;scene.add(new THREE.HemisphereLight(0xe6f1ff,0x8b8171,1.3));
  const sun=new THREE.DirectionalLight(0xffefd9,3);sun.position.set(2,4,3);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-2;sun.shadow.camera.right=2;sun.shadow.camera.top=2;sun.shadow.camera.bottom=-2;sun.shadow.bias=-.0005;scene.add(sun);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:0xe3e8e6,roughness:.86}));floor.rotation.x=-Math.PI/2;floor.position.y=-.008;floor.receiveShadow=true;scene.add(floor);scenes.push(scene);
 }
 controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=false;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=.3;controls.maxZoom=4;controls.minZoom=.5;controls.addEventListener('change',draw);
 resize=new ResizeObserver(size);resize.observe($('canvas-host'));cameraView();size();
}
async function asset(variant,signal){
 const response=await fetch(base+variant.file,{signal});if(!response.ok)throw Error('소품 파일 응답 '+response.status);
 const buffer=await response.arrayBuffer();const parsed=await loader.parseAsync(buffer,base);
 let missing=false;parsed.scene.traverse(o=>{if(o.isMesh&&!o.material?.map)missing=true;});if(missing){release(parsed.scene);throw Error('소품 텍스처를 불러오지 못했습니다.');}return {scene:parsed.scene,bytes:buffer.byteLength};
}
function summary(){
 $('totals').innerHTML=manifest.props.map(p=>'<tr><th>'+p.label+'</th>'+p.variants.map(v=>'<td>'+kb(v.bytes)+'</td>').join('')+'</tr>').join('');
 const sums=[0,1,2].map(n=>manifest.props.reduce((a,p)=>a+p.variants[n].bytes,0));
 $('totals').insertAdjacentHTML('beforeend','<tr><th>합계</th>'+sums.map(n=>'<td>'+kb(n)+'</td>').join('')+'</tr>');
 $('saving').textContent='이 비교실의 원본 형상 파일 대비: 1K 단계 '+(100*(1-sums[1]/sums[0])).toFixed(1)+'% 감소 · 512 단계 '+(100*(1-sums[2]/sums[0])).toFixed(1)+'% 감소.';
}
async function choose(){
 const request=++serial,started=performance.now();controller?.abort();controller=new AbortController();
 const timeout=setTimeout(()=>controller?.abort(),20000);
 $('comparison').dataset.ready='false';$('loading').hidden=false;$('retry').hidden=true;$('loading').querySelector('.spinner').hidden=false;$('load-text').textContent='선택한 소품과 경량 버전을 준비합니다.';
 document.querySelectorAll('[data-prop],[data-level]').forEach(b=>{b.disabled=true;b.setAttribute('aria-pressed',String(b.dataset.prop?b.dataset.prop===slug:Number(b.dataset.level)===level));});
 try{
  if(!manifest){const response=await fetch(base+'manifest.json',{signal:controller.signal});if(!response.ok)throw Error('비교 자료 응답 '+response.status);manifest=await response.json();summary();}
  setup();const prop=manifest.props.find(p=>p.slug===slug),a=prop.variants[0],b=prop.variants[level];
  const results=await Promise.allSettled([asset(a,controller.signal),asset(b,controller.signal)]);
  if(request!==serial||disposed){results.forEach(r=>{if(r.status==='fulfilled')release(r.value.scene);});return;}
  const failure=results.find(r=>r.status==='rejected');if(failure){results.forEach(r=>{if(r.status==='fulfilled')release(r.value.scene);});throw failure.reason;}
  models.forEach(release);models=results.map(r=>r.value.scene);
  const box=new THREE.Box3().setFromObject(models[0]),dimensions=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),scale=1/Math.max(dimensions.x,dimensions.y,dimensions.z);
  for(let i=0;i<2;i++){const obj=models[i];obj.position.set(-center.x,-box.min.y,-center.z).multiplyScalar(scale);obj.scale.setScalar(scale);obj.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;if(m.material.map)m.material.map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());}});scenes[i].add(obj);}
  cameraView();size();for(const scene of scenes)await renderer.compileAsync(scene,camera);
  if(request!==serial||disposed)return;
  metrics={prop:slug,level,originalBytes:a.bytes,optimizedBytes:b.bytes,requestedAssetBytes:results.reduce((s,r)=>s+r.value.bytes,0),readyMs:Math.round(performance.now()-started),originalTriangles:a.triangles,optimizedTriangles:b.triangles};
  draw();$('right-label').textContent=level===1?'절반 면수 · 1K':'약 1/5 면수 · 512';
  $('prop-title').textContent=prop.label;$('prop-note').textContent=prop.note+' 원본 크기 약 '+prop.sourceMetadata.size_metres.map(n=>Math.round(n*1000)).join(' × ')+' mm.';
  $('metrics').innerHTML=[a,b].map((v,i)=>'<div><span>'+(i?'경량 버전':'원본 형상')+'</span><strong>'+kb(v.bytes)+'</strong><span>삼각형 '+integer(v.triangles)+'개 · '+v.texturePixels+' × '+v.texturePixels+' 이미지</span></div>').join('');
  $('runtime').textContent='이번 준비 '+metrics.readyMs+' ms · 두 파일 합계 '+kb(metrics.requestedAssetBytes)+' · 선택·다운로드·해석·화면 준비를 포함한 이 브라우저의 관측값입니다. 캐시와 기기 성능에 따라 달라집니다.';
  $('comparison').dataset.ready='true';$('loading').hidden=true;delete $('comparison').dataset.error;
 }catch(error){if(request!==serial||disposed)return;$('comparison').dataset.ready='false';$('comparison').dataset.error=error.message;$('loading').querySelector('.spinner').hidden=true;$('load-text').textContent='소품을 준비하지 못했습니다. 다시 시도해 주세요.';$('retry').hidden=false;}
 finally{clearTimeout(timeout);if(request===serial)document.querySelectorAll('[data-prop],[data-level]').forEach(b=>b.disabled=false);}
}
document.querySelectorAll('[data-prop]').forEach(b=>b.onclick=()=>{slug=b.dataset.prop;choose();});
document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{level=Number(b.dataset.level);choose();});
$('front').onclick=()=>cameraView(true);$('angle').onclick=()=>cameraView(false);
$('zoom-in').onclick=()=>{if(!renderer)return;camera.zoom=Math.min(4,camera.zoom*1.25);camera.updateProjectionMatrix();draw();};
$('zoom-out').onclick=()=>{if(!renderer)return;camera.zoom=Math.max(.5,camera.zoom/1.25);camera.updateProjectionMatrix();draw();};
$('retry').onclick=choose;document.addEventListener('visibilitychange',draw);
addEventListener('pagehide',e=>{if(e.persisted)return;disposed=true;++serial;controller?.abort();cancelAnimationFrame(frame);resize?.disconnect();controls?.dispose();models.forEach(release);scenes.forEach(s=>{s.traverse(o=>o.shadow?.dispose());release(s);});environment?.dispose();renderer?.dispose();});
choose();
