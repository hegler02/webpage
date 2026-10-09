import * as THREE from './assets/three.module.min.js';
import {createSoundPlayer} from './assets/sound-player.mjs';
import {initShare} from './assets/share.mjs';

const DURATION=76, COLS=240, ROWS=72, COUNT=COLS*ROWS;
const captions=['처음에는, 서로 다른 점이었다.','서로를 바라보자, 방향이 생겼다.','닿은 자리에, 관계가 자랐다.','함께 지난 시간이, 우리의 결이 되었다.','우리는 혼자보다, 사이에서 선명해진다.','서로 다른 채, 하나의 흐름 안에서.','둘 사이의 여백에도, 우주는 흐른다.','너와 나의 사이가, 우리 모두의 세계로.'];
const cuts=[0,9,18,28,38,48,58,70];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const stage=document.querySelector('#stage'), playButton=document.querySelector('#play'), scrub=document.querySelector('#scrub');
let renderer, scene, camera, sculpture, points, lines, uniforms, adapter, time=0, playing=false, anchor=0, raf=0, act=-1;
let sound,creationImage,creationPlane;
const arrays=[], colors=new Float32Array(COUNT*3), seeds=new Float32Array(COUNT),pathProgress=new Float32Array(COUNT),keepers=new Float32Array(COUNT);
const lerp=(a,b,t)=>a+(b-a)*t;
function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rnd=random(61729);
const colorA=new THREE.Color('#ff6248'),colorB=new THREE.Color('#65d5c1'),colorC=new THREE.Color('#ffffff');

function forms(){
  for(let s=0;s<7;s++)arrays.push(new Float32Array(COUNT*3));
  for(let i=0;i<COUNT;i++){
    const row=Math.floor(i/COLS),col=i%COLS,u=col/(COLS-1)*Math.PI*2,v=row/(ROWS-1)*2-1,half=row<ROWS/2?-1:1;
    const local=(row%(ROWS/2))/(ROWS/2-1)*2-1;
    seeds[i]=rnd();
    pathProgress[i]=col/(COLS-1);
    // Two counterposed ribbons retain point identities across all five movements.
    let r=1.05+local*.24;
    put(0,i,half*1.08+r*Math.cos(u)*.68,Math.sin(u)*r*.88,(local*.48+Math.sin(u*2)*.2)*half);
    const twist=u*2.5+half*.7;
    put(1,i,half*.88+Math.cos(u)*(r*.65),Math.sin(u)*r*.92,Math.sin(twist)*.38+local*Math.cos(twist)*.25);
    r=1.28+v*.34*Math.cos(u/2);
    put(2,i,r*Math.cos(u),r*Math.sin(u)*.65,v*.55*Math.sin(u/2));
    const a=u,b=v*.8;
    put(3,i,Math.sin(a)*1.43,Math.sin(a*2)*.6+b*Math.cos(a*2)*.35,Math.cos(a)*.5+b*Math.sin(a*2)*.45);
    const mix=half<0?colorA.clone().lerp(colorC,(local+1)*.30):colorB.clone().lerp(colorC,(local+1)*.28);
    colors.set([mix.r,mix.g,mix.b],i*3);
  }
  const off=document.createElement('canvas');off.width=1200;off.height=520;
  const ctx=off.getContext('2d',{willReadFrequently:true});ctx.fillStyle='white';ctx.font='700 390px Pretendard';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('사이',600,260);
  const pixels=ctx.getImageData(0,0,1200,520).data, targets=[];
  for(let y=0;y<520;y+=3)for(let x=0;x<1200;x+=3)if(pixels[(y*1200+x)*4+3]>128)targets.push([(x-600)/230,(260-y)/230]);
  for(let i=0;i<COUNT;i++){const p=targets[Math.floor(i/COUNT*targets.length)];put(4,i,p[0],p[1],(seeds[i]-.5)*.055);}
  peopleAndWorld();
}
function put(shape,i,x,y,z){arrays[shape].set([x,y,z],i*3);}

function peopleAndWorld(){
  const canvas=document.createElement('canvas');canvas.width=creationImage.naturalWidth;canvas.height=creationImage.naturalHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  // Sample the approved artwork, replacing the rejected hand-drawn silhouettes.
  canvas.width=creationImage.naturalWidth;canvas.height=creationImage.naturalHeight;
  ctx.drawImage(creationImage,0,0);
  const imagePixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  const pools=[[],[]];
  for(let y=0;y<canvas.height;y+=2)for(let x=0;x<canvas.width;x+=2){
    const k=(y*canvas.width+x)*4;
    if(Math.max(imagePixels[k],imagePixels[k+1],imagePixels[k+2])>70)pools[x<canvas.width/2?0:1].push([x,y]);
  }
  const sample=random(51839);
  for(let i=0;i<COUNT;i++){
    const pool=pools[i<COUNT/2?0:1],p=pool[Math.floor(sample()*pool.length)];
    put(5,i,(p[0]/canvas.width-.5)*5.8,(.5-p[1]/canvas.height)*5.8*canvas.height/canvas.width,(sample()-.5)*.1);
  }
  const star=random(20261009);
  for(let i=0;i<COUNT;i++){
    const arm=i<COUNT/2?0:1,rad=Math.pow(star(),i%5===0?2.3:.72)*8.4;
    const angle=arm*Math.PI+rad*.64+(star()-.5)*(.45+.065*rad);
    const thickness=(star()+star()+star()-1.5)*(.06+.025*rad);
    if(i%7===0){
      put(6,i,(star()-.5)*21,(star()-.5)*8,(star()-.5)*18);
    }else put(6,i,Math.cos(angle)*rad,thickness,Math.sin(angle)*rad);
  }
}

const vertex=`
attribute vec3 target; attribute vec3 tint; attribute float seed; attribute float pathProgress; attribute float keeper;
uniform float blend; uniform float seconds; uniform float pointScale; uniform float weave; uniform float world; uniform float contact;
varying vec3 vColor; varying float vFade; varying float vPath;
void main(){
  vec3 p=mix(position,target,blend);
  float arc=sin(blend*3.14159265);
  p.z+=arc*sin(seed*31.4)*.35;
  p.y+=arc*sin(seed*18.0)*.16;
  float radius=length(p.xz);
  float orbit=max(0.0,seconds-66.0)*.018*mix(2.0,1.0,clamp(radius/8.4,0.0,1.0))*world*(1.0-keeper);
  p.xz=mat2(cos(orbit),-sin(orbit),sin(orbit),cos(orbit))*p.xz;
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_Position=projectionMatrix*mv;
  float sharedLight=contact*exp(-length(p.xy-vec2(-.04,.88))*5.0);
  gl_PointSize=clamp(pointScale*(1.0+seed*.45+world*step(.98,seed)*2.5+sharedLight*1.8)/(-mv.z),1.0,mix(4.0,9.0,max(world,contact)));
  vColor=mix(tint,vec3(1.0),min(1.0,weave*.45+world*.62*(1.0-keeper)+sharedLight));
  vFade=(.55+seed*.4)*(1.0-world*.22+world*.22*sin(seconds*.65+seed*60.0));
  vPath=pathProgress;
}`;
const fragment=`varying vec3 vColor; varying float vFade; uniform float world; void main(){float d=length(gl_PointCoord-vec2(.5));if(d>.5)discard;gl_FragColor=vec4(vColor,vFade*smoothstep(.5,mix(.25,.12,world),d));}`;
const lineFragment=`varying vec3 vColor; varying float vFade;varying float vPath;uniform float lineOpacity;uniform float drawProgress;void main(){if(vPath>drawProgress)discard;gl_FragColor=vec4(vColor,lineOpacity);}`;

function init(){
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.setClearColor(0x000000);renderer.setPixelRatio(Math.min(devicePixelRatio,2));stage.appendChild(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,0,7.6);
  sculpture=new THREE.Group();scene.add(sculpture);
  const texture=new THREE.Texture(creationImage);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;
  creationPlane=new THREE.Mesh(new THREE.PlaneGeometry(5.8,5.8*creationImage.naturalHeight/creationImage.naturalWidth),new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  creationPlane.material.userData.dissolve={value:0};
  creationPlane.material.onBeforeCompile=shader=>{
    shader.uniforms.figureDissolve=creationPlane.material.userData.dissolve;
    shader.fragmentShader='uniform float figureDissolve;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float grain=fract(sin(dot(floor(vMapUv*vec2(768.0,512.0)),vec2(12.9898,78.233)))*43758.5453);
      float remaining=figureDissolve<=0.0?1.0:figureDissolve>=1.0?0.0:smoothstep(figureDissolve-.08,figureDissolve+.08,grain);
      diffuseColor.a*=remaining;`);
  };
  scene.add(creationPlane);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(arrays[0],3));geo.setAttribute('target',new THREE.BufferAttribute(arrays[1],3));geo.setAttribute('tint',new THREE.BufferAttribute(colors,3));geo.setAttribute('seed',new THREE.BufferAttribute(seeds,1));
  geo.setAttribute('pathProgress',new THREE.BufferAttribute(pathProgress,1));
  geo.setAttribute('keeper',new THREE.BufferAttribute(keepers,1));
  uniforms={blend:{value:0},seconds:{value:0},pointScale:{value:15},world:{value:0},contact:{value:0},weave:{value:0},lineOpacity:{value:.12},drawProgress:{value:0}};
  const material=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,blending:THREE.NormalBlending});
  points=new THREE.Points(geo,material);sculpture.add(points);
  const wire=geo.clone(), indices=[];
  for(let row=0;row<ROWS;row+=3)for(let col=0;col<COLS-1;col++){indices.push(row*COLS+col,row*COLS+col+1);}
  wire.setIndex(indices);lines=new THREE.LineSegments(wire,new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:lineFragment,transparent:true,depthWrite:false}));sculpture.add(lines);
  resize();window.addEventListener('resize',resize);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();setPlaying(false);document.querySelector('#error').hidden=false;});
  adapter=createMotionAdapter({duration:DURATION,seek:render,fallback:fail,reduced:reduced.matches,holdForProgress:p=>{const t=p*DURATION;return(t<9?5:t<18?14:t<28?24:t<38?34:t<48?46:t<58?56:t<70?68:76)/DURATION;},dispose:()=>{creationPlane.material.map.dispose();creationPlane.material.dispose();creationPlane.geometry.dispose();renderer.dispose();points.geometry.dispose();points.material.dispose();lines.geometry.dispose();lines.material.dispose();}});
  adapter.setProgress(0);
}
function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
  camera.position.z=w<700?12.8:7.6;
  sculpture.position.y=w<700?-.13:.35;
  render(time);
}
function render(t){
  // One paused GSAP timeline defines every morph and camera pose; seeking is reversible.
  timeline.seek(t,false);
  const s=Math.min(5,Math.floor(state.morph)),fraction=state.morph-s;
  for(const geometry of [points.geometry,lines.geometry]){
    geometry.attributes.position.array=arrays[s];geometry.attributes.position.needsUpdate=true;
    geometry.attributes.target.array=arrays[s+1];geometry.attributes.target.needsUpdate=true;
  }
  uniforms.blend.value=fraction;uniforms.weave.value=state.weave;uniforms.lineOpacity.value=state.line;
  uniforms.seconds.value=t;uniforms.world.value=state.world;uniforms.pointScale.value=state.pointSize;
  uniforms.contact.value=state.contact;
  points.material.blending=state.world>0||state.contact>0?THREE.AdditiveBlending:THREE.NormalBlending;
  uniforms.drawProgress.value=state.draw;
  sculpture.rotation.set(state.rx,state.ry,state.rz);sculpture.scale.setScalar(state.scale);
  camera.position.z=(stage.clientWidth<700?12.8:7.6)*state.dolly;
  const revealProgress=Math.min(1,Math.max(0,(t-49)/9));
  const reveal=revealProgress*revealProgress*(3-2*revealProgress);
  const fit=Math.min(1,(2*Math.tan(THREE.MathUtils.degToRad(17))*(stage.clientWidth<700?12.8:7.6)*camera.aspect*.92)/5.8);
  creationPlane.position.set(0,sculpture.position.y,.08);
  creationPlane.scale.setScalar(fit*state.scale*(1+(state.dolly-1)*.45));
  sculpture.scale.setScalar(state.scale*lerp(1,fit,Math.min(1,Math.max(0,(t-48)/5))));
  const scatterProgress=Math.min(1,Math.max(0,(t-58)/11));
  const scatter=scatterProgress*scatterProgress*(3-2*scatterProgress);
  creationPlane.material.userData.dissolve.value=scatter;
  creationPlane.material.opacity=reveal*(1-scatter);
  uniforms.pointScale.value=state.pointSize*(1-reveal*(1-scatter)*.45);
  document.querySelector('.identity').style.opacity=String(state.identity);
  if(renderer.domElement.width<1)return;renderer.render(scene,camera);
  const next=cuts.reduce((a,c,i)=>t>=c?i:a,0);
  if(next!==act){act=next;document.querySelector('#caption').textContent=captions[act];document.querySelector('#chapter-number').textContent=act>=5?'CODA':String(act+1).padStart(2,'0');document.querySelectorAll('[data-time]').forEach((b,i)=>{if((i===5&&act>=5)||i===act)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});}
  const local=t-cuts[act];const caption=document.querySelector('#caption');
  caption.style.clipPath=reduced.matches?'none':`inset(${(1-Math.min(1,local/1.05))*100}% 0 0 0)`;
}
const state={morph:0,rx:.30,ry:-.48,rz:-.12,scale:1,weave:0,line:.14,draw:0,dolly:1,world:0,contact:0,pointSize:15,identity:1};
const timeline=gsap.timeline({paused:true});
timeline.to(state,{ry:.38,rx:-.15,rz:.1,duration:7.5,ease:'sine.inOut'},0);
timeline.to(state,{morph:1,duration:2.3,ease:'power3.inOut'},8);
timeline.to(state,{ry:-.45,rx:.2,rz:-.2,duration:6.5,ease:'sine.inOut'},10.3);
timeline.to(state,{draw:1,duration:1.85,ease:'none'},11);
timeline.to(state,{morph:2,duration:3,ease:'power3.inOut'},16.5);
timeline.to(state,{ry:1.0,rx:.55,rz:.14,weave:1,line:.3,duration:7.5,ease:'sine.inOut'},19.5);
timeline.to(state,{morph:3,rx:-.25,ry:-.55,rz:0,duration:3,ease:'power3.inOut'},27);
timeline.to(state,{ry:.5,rx:.2,line:.18,weave:.2,duration:6.5,ease:'sine.inOut'},30);
timeline.to(state,{morph:4,rx:0,ry:0,rz:0,scale:.92,line:0,weave:.45,duration:3.8,ease:'power3.inOut'},37);
timeline.to(state,{line:0,duration:.4,ease:'power1.out'},37);
timeline.to(state,{scale:1.01,duration:3.4,ease:'sine.inOut'},40.8);
timeline.to(state,{scale:1.01,duration:3.8},44.2);
timeline.to(state,{morph:5,scale:.95,identity:.2,weave:0,pointSize:18,duration:8,ease:'sine.inOut'},48);
timeline.to(state,{morph:6,world:1,rx:1.04,ry:0,rz:-.24,scale:1,pointSize:27,identity:0,duration:12,ease:'sine.inOut'},56);
timeline.to(state,{dolly:1.9,duration:20,ease:'sine.inOut'},52);
timeline.to(state,{dolly:1.9,duration:4},72);

function update(t){
  time=Math.min(DURATION,Math.max(0,t));adapter?.setProgress(time/DURATION);scrub.value=time;scrub.style.setProperty('--progress',`${time/DURATION*100}%`);
  document.querySelector('#time').textContent=`${String(Math.floor(time/60)).padStart(2,'0')}:${String(Math.floor(time%60)).padStart(2,'0')}`;
  const portal=document.querySelector('#world-link');portal.hidden=time<71;
  document.querySelector('#film').classList.toggle('ending',time>=70);
  portal.style.opacity=String(Math.min(1,Math.max(0,(time-71)/2)));portal.inert=time<72;
}
function icon(name){playButton.innerHTML=`<i data-lucide="${name}"></i>`;lucide.createIcons();}
function showPlaying(value){
  playing=value;cancelAnimationFrame(raf);icon(playing?'pause':time>=DURATION?'rotate-ccw':'play');playButton.setAttribute('aria-label',playing?'일시정지':time>=DURATION?'다시 재생':'재생');playButton.title=playButton.getAttribute('aria-label');
}
function setPlaying(value){
  if(sound?.active){if(value)void sound.play();else sound.pause();return;}
  showPlaying(value);
  if(playing){anchor=performance.now()-time*1000;raf=requestAnimationFrame(tick);}
}
function tick(now){update((now-anchor)/1000);if(time>=DURATION){setPlaying(false);return;}raf=requestAnimationFrame(tick);}
function seek(t){if(sound?.active)sound.seek(t);else if(playing)anchor=performance.now()-t*1000;update(t);if(!playing)showPlaying(false);}
function fail(error){console.error(error);const message=document.querySelector('#error');message.hidden=false;message.textContent='3D 장면을 열 수 없습니다. '+captions.join(' ');setPlaying(false);}
async function boot(){
  try{
    await document.fonts.load('700 390px Pretendard');await document.fonts.ready;
    creationImage=new Image();creationImage.src='assets/creation-harmony-v1.png';await creationImage.decode();
    forms();init();lucide.createIcons();
    initShare();
    const soundButton=document.querySelector('#sound'),soundNotice=document.querySelector('#sound-status');
    sound=createSoundPlayer({render:update,onStatus:({status,muted,active})=>{
      showPlaying(status==='playing');
      const label=status==='error'?'소리 다시 시도':!active||muted?'소리 켜기':'소리 끄기';
      soundButton.title=label;soundButton.setAttribute('aria-label',label);soundButton.setAttribute('aria-pressed',String(active&&!muted));
      soundButton.dataset.status=status;soundButton.innerHTML=`<i data-lucide="${status==='error'?'volume-x':active&&!muted?'volume-2':'volume-x'}"></i>`;lucide.createIcons();
      soundNotice.hidden=!['error','loading','buffering'].includes(status);
      soundNotice.textContent=status==='error'?'소리를 불러오지 못했습니다. 스피커 버튼으로 다시 시도할 수 있습니다.':status==='buffering'?'소리 버퍼링 중':'소리 준비 중';
    }});
    soundButton.onclick=()=>{if(!sound.active||sound.status==='error'){const resume=playing||sound.status==='error';cancelAnimationFrame(raf);sound.enable(time,resume);}else sound.toggleMute();};
    playButton.onclick=()=>{if(time>=DURATION)seek(0);setPlaying(!playing);};
    document.querySelector('#restart').onclick=()=>{seek(0);setPlaying(true);};
    document.querySelector('.wordmark').onclick=e=>{e.preventDefault();seek(0);setPlaying(false);};
    scrub.addEventListener('input',()=>seek(Number(scrub.value)));
    document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>seek(Number(b.dataset.time)));
    document.querySelector('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('#film').requestFullscreen();}catch(e){document.querySelector('#fullscreen').title='전체 화면을 사용할 수 없습니다';}};
    document.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;if(e.code==='Space'){e.preventDefault();if(time>=DURATION)seek(0);setPlaying(!playing);}if(e.code==='ArrowRight')seek(Math.min(DURATION,time+2));if(e.code==='ArrowLeft')seek(Math.max(0,time-2));});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false);});
    reduced.addEventListener('change',()=>{setPlaying(false);adapter.setReduced(reduced.matches);update(time);});
    window.__film={seek:t=>{setPlaying(false);seek(t);},state:()=>({time,playing,act,reduced:reduced.matches,points:COUNT,pose:Object.fromEntries(Object.entries(state).filter(([,v])=>typeof v==='number')),sound:sound.status,audioActive:sound.active,muted:sound.media.muted,audioTime:sound.media.currentTime,audioDuration:sound.media.duration}),destroy:()=>{setPlaying(false);sound.destroy();adapter.destroy();},render,ready:true};
    sound.enable(0,!reduced.matches);
  }catch(e){fail(e);}
}
boot();
