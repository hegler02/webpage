// Optional renderer: owns only the canvas and projected node positions.
// The lifecycle host owns visibility, state and navigation.
import {createRenderer} from './spatial-renderer.mjs';
export async function mount(host, labels, status, {onFailure}) {
  const THREE=await import('./vendor/three.module.min.js');
  const {renderer,mode}=createRenderer(THREE);
  const canvas=renderer.domElement;
  canvas.tabIndex=0;canvas.setAttribute('role','group');
  canvas.setAttribute('aria-label','입체 공간 회전. 방향키로 둘러보고 Home 키로 처음 위치로 돌아갑니다. 작품 선택은 Tab 키를 사용하세요.');
  host.append(canvas);
  const style=getComputedStyle(host), token=name=>style.getPropertyValue(name).trim();
  const workColor=new THREE.Color(token('--work')),thoughtColor=new THREE.Color(token('--thought'));
  const scene=new THREE.Scene(),world=new THREE.Group(),camera=new THREE.PerspectiveCamera(43,1,.1,100);
  scene.add(world);
  let nodes=[],links=[],objects=[],width=1,height=1,raf=0,paused=false,dead=false;
  let angle=0,pitch=0,targetAngle=0,targetPitch=0;
  const shift=new THREE.Vector3(),targetShift=new THREE.Vector3();
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const ease=Number(token('--space-ease'))||.11;
  const background=[];let seed=49;
  function random(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
  for(let i=0;i<240;i++)background.push((random()-.5)*24,(random()-.5)*17,-3-random()*12);
  const stars=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(background,3)),new THREE.PointsMaterial({color:workColor,size:.022,transparent:true,opacity:.28}));scene.add(stars);
  function dispose(object){object.geometry?.dispose();if(Array.isArray(object.material))object.material.forEach(m=>m.dispose());else object.material?.dispose();}
  function clear(){objects.forEach(o=>{world.remove(o);dispose(o);});objects=[];nodes=[];links=[];}
  function positions(count){
    if(width<600)return Array.from({length:count},(_,i)=>[(i%2?1:-1)*1.3,1.25-Math.floor(i/2)*2.5,(i%3-1)*.45]);
    return [[-2.35,1.1,1],[1.95,1.75,-.65],[-2.5,-1.6,-.6],[2.4,-1.45,1],[-.15,.9,-.5],[.2,-.35,-1.45],[2.4,.22,-2.05]].slice(0,count);
  }
  let current={visible:[],edges:[],selected:null};
  function update(data){
    current=data;clear();const pos=positions(data.visible.length);
    nodes=data.visible.map((n,i)=>{
      const color=n.kind==='work'?workColor:thoughtColor;
      const point=new THREE.Mesh(n.kind==='work'?new THREE.SphereGeometry(.035,8,8):new THREE.OctahedronGeometry(.065),new THREE.MeshBasicMaterial({color}));
      point.position.fromArray(pos[i]);world.add(point);objects.push(point);
      const halo=new THREE.Mesh(new THREE.RingGeometry(.12,.132,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:n.id===data.selected?.8:.18,side:THREE.DoubleSide}));halo.position.copy(point.position);world.add(halo);objects.push(halo);
      return {...n,point,halo,button:labels.children[i]};
    });
    const byId=new Map(nodes.map(n=>[n.id,n]));
    links=data.edges.filter(e=>byId.has(e.source)&&byId.has(e.target)).map(edge=>{
      const a=byId.get(edge.source).point.position,b=byId.get(edge.target).point.position,m=a.clone().lerp(b,.5);m.z-=.38;
      const active=edge.source===data.selected||edge.target===data.selected;
      const curve=new THREE.QuadraticBezierCurve3(a,m,b),line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(32)),new THREE.LineBasicMaterial({color:workColor,transparent:true,opacity:active?.6:.14}));
      world.add(line);objects.push(line);return line;
    });
    const selected=byId.get(data.selected);
    if(selected){targetShift.set(-selected.point.position.x*.10,-selected.point.position.y*.08,0);}else targetShift.set(0,0,0);
    draw();
  }
  const vector=new THREE.Vector3();
  function render(){
    raf=0;if(paused||dead)return;
    const speed=motion.matches?1:ease;
    angle+=(targetAngle-angle)*speed;pitch+=(targetPitch-pitch)*speed;shift.lerp(targetShift,speed);
    world.rotation.set(pitch,angle,0);world.position.copy(shift);world.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    for(const n of nodes){
      n.point.getWorldPosition(vector);const depth=vector.z;vector.project(camera);
      const x=(vector.x*.5+.5)*width,y=(-vector.y*.5+.5)*height,scale=Math.max(.78,Math.min(1.08,1+depth*.035));
      n.button.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%) scale(${scale})`;
      n.button.style.zIndex=String(Math.round(10+depth));n.halo.lookAt(camera.position);
    }
    renderer.render(scene,camera);
    if(Math.abs(targetAngle-angle)+Math.abs(targetPitch-pitch)+shift.distanceTo(targetShift)>.001)draw();
  }
  function draw(){if(!raf&&!paused&&!dead)raf=requestAnimationFrame(render);}
  function resize(){
    const oldCompact=width<600;width=host.clientWidth;height=host.clientHeight;
    if(!width||!height)return;
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5,Math.sqrt(1200000/(width*height))));
    renderer.setSize(width,height);camera.aspect=width/height;
    camera.position.set(0,0,width<600?Math.max(8,6.5/camera.aspect):Math.max(8.5,8/camera.aspect));
    camera.lookAt(0,0,0);camera.updateProjectionMatrix();
    if(oldCompact!==(width<600))update(current);draw();
  }
  const observer=new ResizeObserver(resize);observer.observe(host);
  const events=new AbortController(),opts={signal:events.signal};let drag=null;
  canvas.addEventListener('pointerdown',e=>{if(motion.matches)return;drag={x:e.clientX,y:e.clientY,a:targetAngle,p:targetPitch};canvas.setPointerCapture(e.pointerId);},opts);
  canvas.addEventListener('pointermove',e=>{if(!drag)return;targetAngle=Math.max(-.35,Math.min(.35,drag.a+(e.clientX-drag.x)*.002));targetPitch=Math.max(-.18,Math.min(.18,drag.p+(e.clientY-drag.y)*.001));draw();},opts);
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>{drag=null;},opts);
  function reset(){targetAngle=targetPitch=0;targetShift.set(0,0,0);draw();}
  canvas.addEventListener('keydown',e=>{
    if(e.key==='Home'){e.preventDefault();reset();return;}
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();if(motion.matches)return;
    if(e.key==='ArrowLeft')targetAngle-=.08;if(e.key==='ArrowRight')targetAngle+=.08;
    if(e.key==='ArrowUp')targetPitch-=.05;if(e.key==='ArrowDown')targetPitch+=.05;
    targetAngle=Math.max(-.35,Math.min(.35,targetAngle));targetPitch=Math.max(-.18,Math.min(.18,targetPitch));draw();
  },opts);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();onFailure('3D 연결이 끊겨 평면 지도로 전환했습니다.');},opts);
  function modeLabel(){return motion.matches?'정지된 입체 지도':mode==='WebGL'?'3D 탐색':'입체 탐색 · 호환 모드';}
  function motionChange(){reset();status.textContent=modeLabel();}
  motion.addEventListener('change',motionChange,opts);
  status.textContent=modeLabel();resize();
  return {update,reset,pause(){paused=true;if(raf)cancelAnimationFrame(raf);raf=0;},resume(){paused=false;draw();},destroy(){if(dead)return;dead=true;if(raf)cancelAnimationFrame(raf);observer.disconnect();events.abort();clear();dispose(stars);renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
