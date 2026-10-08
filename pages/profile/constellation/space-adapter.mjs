import {createRenderer} from './spatial-renderer.mjs';
import {GALAXY as G,SECTORS,layout} from './galaxy-layout.mjs';
export async function mount(host,labels,status,{onFailure,onSelect=()=>{}}){
 const T=await import('./vendor/three.module.min.js');
 const {renderer,mode}=createRenderer(T),canvas=renderer.domElement,webgl=mode==='WebGL';
 canvas.tabIndex=0;canvas.setAttribute('role','group');canvas.setAttribute('aria-label','미리내맨 은하수. 드래그 또는 방향키로 회전, 휠 또는 더하기 빼기로 확대. Home 키로 은하 전체 보기. 별 선택은 Tab 키를 사용하세요.');host.append(canvas);
 const scene=new T.Scene(),world=new T.Group();scene.add(world);
 const camera=new T.PerspectiveCamera(48,1,G.near,G.far),events=new AbortController(),opts={signal:events.signal};
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),objects=[],pickables=[],byId=new Map(),pulses=[];
 let width=1,height=1,dead=false,paused=false,raf=0,last=0,elapsed=0,current={},hover=null,drag=null,positions=new Map();
 let yaw=0,pitch=.57,radius=42,targetYaw=0,targetPitch=.57,targetRadius=34;
 const focus=new T.Vector3(),targetFocus=new T.Vector3(),ray=new T.Raycaster(),pointer=new T.Vector2(),projected=new T.Vector3();
 let seed=1909;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 const colors=SECTORS.map(s=>new T.Color(s.color));
 const vertex=`attribute float aSize; varying vec3 vColor; uniform float uPixel; void main(){vColor=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(aSize*uPixel*90./max(1.,-p.z),1.,64.);}`;
 const fragment=`varying vec3 vColor; void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float glow=exp(-d*d*5.);float core=exp(-d*d*38.);gl_FragColor=vec4(vColor*(.7+core*.8),glow*.65);}`;
 function points(pos,col,sizes,opacity=1){
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('color',new T.Float32BufferAttribute(col,3));geo.setAttribute('aSize',new T.Float32BufferAttribute(sizes,1));
  const mat=webgl?new T.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{uPixel:{value:Math.min(globalThis.devicePixelRatio||1,1.7)}}}):new T.PointsMaterial({color:'#96b8ee',size:.035,transparent:true,opacity});
  const obj=new T.Points(geo,mat);world.add(obj);objects.push(obj);return obj;
 }
 const dust=[],dustColors=[],dustSizes=[],count=webgl?(host.clientWidth<600?G.mobileParticles:G.desktopParticles):G.fallbackParticles;
 for(let i=0;i<count;i++){
  const arm=i%G.arms,t=random(),r=.2+Math.pow(t,.65)*G.radius,angle=arm*Math.PI*2/G.arms+t*G.turns*Math.PI+(random()-.5)*(.25+1.2*(1-t));
  const spread=(random()-.5)*(1.1+t*1.7);dust.push(Math.cos(angle)*r+spread,(random()-.5)*(.35+(1-t)*1.8),Math.sin(angle)*r+spread);
  const color=colors[arm].clone().lerp(new T.Color('#ffe9d4'),Math.pow(1-t,4));dustColors.push(color.r,color.g,color.b);dustSizes.push(.4+random()*1.5);
 }
 const galaxy=points(dust,dustColors,dustSizes,.38);
 const core=[],coreColors=[],coreSizes=[];
 for(let i=0;i<(webgl?1400:90);i++){const r=Math.pow(random(),1.8)*G.coreRadius,a=random()*Math.PI*2;core.push(Math.cos(a)*r,(random()-.5)*r*.45,Math.sin(a)*r);coreColors.push(1,.8+random()*.2,.65+random()*.3);coreSizes.push(1+random()*2);}
 points(core,coreColors,coreSizes,.65);
 if(webgl){const p=[],c=[],s=[];for(let i=0;i<G.backgroundParticles;i++){p.push((random()-.5)*95,(random()-.5)*70,-20-random()*50);c.push(.45,.55,.8);s.push(.25+random()*.6);}const sky=points(p,c,s);world.remove(sky);scene.add(sky);}
 function dispose(obj){obj.geometry?.dispose();obj.material?.dispose();obj.parent?.remove(obj);}
 let dynamic=[];
 function update(data){
  current=data;dynamic.forEach(dispose);dynamic=[];pickables.length=0;pulses.length=0;byId.clear();
  positions=layout(data.universe||data.visible);
  const enabled=new Set(data.visible.map(n=>n.id));
  (data.universe||data.visible).forEach(n=>{
   const entry=positions.get(n.id),color=entry.sector<0?new T.Color('#fff0c9'):colors[entry.sector];
   const obj=new T.Mesh(new T.SphereGeometry(n.kind==='creator'?.22:.115,10,8),new T.MeshBasicMaterial({color,transparent:true,opacity:enabled.has(n.id)?1:.17}));obj.position.fromArray(entry.position);obj.userData.node=n.id;world.add(obj);dynamic.push(obj);if(enabled.has(n.id))pickables.push(obj);byId.set(n.id,obj);
  });
  const selected=byId.get(data.selected),selectedId=data.selected;
  const pulsePos=[],pulseCol=[],pulseSize=[];
  for(const e of data.edges){const a=byId.get(e.source),b=byId.get(e.target);if(!a||!b)continue;
   const active=e.source===selectedId||e.target===selectedId;
   // Creator overview uses sparse spokes, keeping the galaxy legible.
   if(!active)continue;
   const middle=a.position.clone().lerp(b.position,.5);middle.y+=Math.min(2,a.position.distanceTo(b.position)*.12);
   const curve=new T.QuadraticBezierCurve3(a.position,middle,b.position),line=new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(36)),new T.LineBasicMaterial({color:'#a9cfff',transparent:true,opacity:data.overview?.09:.28,depthWrite:false}));world.add(line);dynamic.push(line);
   if(webgl){pulses.push({curve,offset:random()});pulsePos.push(0,0,0);pulseCol.push(.7,.86,1);pulseSize.push(2);}
  }
  if(pulses.length){const obj=points(pulsePos,pulseCol,pulseSize);objects.pop();dynamic.push(obj);pulses.mesh=obj;}
  if(selected&&!data.overview&&data.selected!=='creator:joonho'){targetFocus.copy(selected.position);targetRadius=width<600?18:14;}
  else{targetFocus.set(0,0,0);targetRadius=width<600?46:34;}
  draw();
 }
 function projectLabels(){
  const occupied=[];
  const nodes=current.visible||[],ordered=nodes.map((n,i)=>({n,button:labels.children[i]})).filter(x=>x.button).sort((a,b)=>(b.n.id===current.selected)-(a.n.id===current.selected));
  for(const {n,button} of ordered){
   const obj=byId.get(n.id);if(!obj)continue;obj.getWorldPosition(projected);projected.project(camera);
   const x=(projected.x*.5+.5)*width,y=(-projected.y*.5+.5)*height;
   const inView=projected.z<1&&projected.z>-1&&x>18&&x<width-18&&y>75&&y<height-55;
   button.style.visibility=inView?'visible':'hidden';button.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
   button.style.zIndex=String(n.id===current.selected?20:10);
   const important=n.id===current.selected||n.id===hover;
   const rect={x:x-85,y:y+14,w:170,h:55},overlap=occupied.some(r=>Math.abs(r.x-rect.x)<170&&Math.abs(r.y-rect.y)<62);
   const reveal=important||(!overlap&&occupied.length<(width<600?4:9));
   button.setAttribute('data-caption',reveal?'true':'false');button.setAttribute('data-sector',String(positions.get(n.id).sector));
   if(reveal&&inView)occupied.push(rect);
  }
 }
 function render(now=performance.now()){
  raf=0;if(dead||paused)return;
  const dt=last?Math.min(.05,Math.max(.001,(now-last)/1000)):1/60;last=now;elapsed+=dt;
  const ease=motion.matches?1:1-Math.exp(-G.flightEase*dt);
  yaw+=(targetYaw-yaw)*ease;pitch+=(targetPitch-pitch)*ease;radius+=(targetRadius-radius)*ease;focus.lerp(targetFocus,ease);
  camera.position.set(focus.x+Math.sin(yaw)*Math.cos(pitch)*radius,focus.y+Math.sin(pitch)*radius,focus.z+Math.cos(yaw)*Math.cos(pitch)*radius);camera.lookAt(focus);camera.updateMatrixWorld();
  if(webgl&&!motion.matches){galaxy.rotation.y=Math.sin(elapsed*.035)*.018;
   if(pulses.mesh){const attr=pulses.mesh.geometry.attributes.position;pulses.forEach((p,i)=>{const v=p.curve.getPoint((elapsed*.12+p.offset)%1);attr.setXYZ(i,v.x,v.y,v.z);});attr.needsUpdate=true;}}
  projectLabels();renderer.render(scene,camera);
  const moving=Math.abs(targetYaw-yaw)+Math.abs(targetPitch-pitch)+Math.abs(targetRadius-radius)+focus.distanceTo(targetFocus)>.002;
  if(!motion.matches&&(webgl||moving))raf=requestAnimationFrame(render);
 }
 function draw(){if(dead||paused)return;if(motion.matches){if(raf)cancelAnimationFrame(raf);raf=0;render();}else if(!raf)raf=requestAnimationFrame(render);}
 function resize(){width=Math.max(1,host.clientWidth);height=Math.max(1,host.clientHeight);renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.7,Math.sqrt(2000000/(width*height))));renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();draw();}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function reset(){targetYaw=0;targetPitch=.57;targetFocus.set(0,0,0);targetRadius=width<600?46:34;draw();}
 const pointers=new Map();let pinch=0;
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};if(pointers.size===2){const [a,b]=[...pointers.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);}},opts);
 canvas.addEventListener('pointermove',e=>{
  if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(drag&&!motion.matches){if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);targetRadius=Math.max(G.zoomMin,Math.min(G.zoomMax,targetRadius*pinch/Math.max(1,d)));pinch=d;drag.moved=true;}
   else{targetYaw-=(e.clientX-drag.x)/width*Math.PI*2;targetPitch=Math.max(.12,Math.min(1.35,targetPitch+(e.clientY-drag.y)/height*1.8));drag.moved ||=Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6;}drag.x=e.clientX;drag.y=e.clientY;draw();}
  else if(webgl){const box=canvas.getBoundingClientRect();pointer.set((e.clientX-box.left)/width*2-1,-(e.clientY-box.top)/height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(pickables)[0];const next=hit?.object.userData.node||null;if(next!==hover){hover=next;canvas.style.cursor=hover?'pointer':'grab';draw();}}
 },opts);
 canvas.addEventListener('pointerup',e=>{if(drag&&!drag.moved&&webgl){const box=canvas.getBoundingClientRect();pointer.set((e.clientX-box.left)/width*2-1,-(e.clientY-box.top)/height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(pickables)[0];if(hit)onSelect(hit.object.userData.node);}pointers.delete(e.pointerId);drag=null;draw();},opts);
 for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{pointers.clear();drag=null;},opts);
 canvas.addEventListener('wheel',e=>{e.preventDefault();targetRadius=Math.max(G.zoomMin,Math.min(G.zoomMax,targetRadius*Math.exp(e.deltaY*.001)));draw();},{...opts,passive:false});
 canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','+','=','-'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){reset();return;}if(e.key==='ArrowLeft')targetYaw-=.18;if(e.key==='ArrowRight')targetYaw+=.18;if(e.key==='ArrowUp')targetPitch=Math.min(1.35,targetPitch+.12);if(e.key==='ArrowDown')targetPitch=Math.max(.12,targetPitch-.12);if(['+','='].includes(e.key))targetRadius=Math.max(G.zoomMin,targetRadius*.85);if(e.key==='-')targetRadius=Math.min(G.zoomMax,targetRadius/ .85);draw();},opts);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();onFailure('입체 연결이 끊겼습니다. 전체 목록으로 계속 탐색할 수 있습니다.');},opts);
 motion.addEventListener('change',()=>{draw();},opts);status.textContent=webgl?'은하 탐색':'은하 탐색 · 호환 모드';
 return {update,reset,pause(){paused=true;drag=null;pointers.clear();if(raf)cancelAnimationFrame(raf);raf=0;last=0;},resume(){paused=false;draw();},destroy(){if(dead)return;dead=true;if(raf)cancelAnimationFrame(raf);observer.disconnect();events.abort();dynamic.forEach(dispose);objects.forEach(dispose);renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
