import * as THREE from './assets/three.module.min.js';
import {createSoundPlayer} from './assets/sound-player.mjs';
import {initShare} from './assets/share.mjs';

const DURATION=48, COLS=240, ROWS=72, COUNT=COLS*ROWS;
const captions=['처음에는, 서로 다른 점이었다.','서로를 바라보자, 방향이 생겼다.','닿은 자리에, 관계가 자랐다.','함께 지난 시간이, 우리의 결이 되었다.','우리는 혼자보다, 사이에서 선명해진다.'];
const cuts=[0,9,18,28,38];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const stage=document.querySelector('#stage'), playButton=document.querySelector('#play'), scrub=document.querySelector('#scrub');
let renderer, scene, camera, sculpture, points, lines, uniforms, adapter, time=0, playing=false, anchor=0, raf=0, act=-1;
let sound;
const arrays=[], colors=new Float32Array(COUNT*3), seeds=new Float32Array(COUNT),pathProgress=new Float32Array(COUNT);
const lerp=(a,b,t)=>a+(b-a)*t;
function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rnd=random(61729);
const colorA=new THREE.Color('#ff6248'),colorB=new THREE.Color('#65d5c1'),colorC=new THREE.Color('#ffffff');

function forms(){
  for(let s=0;s<5;s++)arrays.push(new Float32Array(COUNT*3));
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
}
function put(shape,i,x,y,z){arrays[shape].set([x,y,z],i*3);}

const vertex=`
attribute vec3 target; attribute vec3 tint; attribute float seed; attribute float pathProgress;
uniform float blend; uniform float seconds; uniform float pointScale; uniform float weave;
varying vec3 vColor; varying float vFade; varying float vPath;
void main(){
  vec3 p=mix(position,target,blend);
  float arc=sin(blend*3.14159265);
  p.z+=arc*sin(seed*31.4)*.35;
  p.y+=arc*sin(seed*18.0)*.16;
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=clamp(pointScale*(1.0+seed*.45)/(-mv.z),1.0,4.0);
  vColor=mix(tint,vec3(1.0),weave*.45);
  vFade=.55+seed*.4;
  vPath=pathProgress;
}`;
const fragment=`varying vec3 vColor; varying float vFade; void main(){float d=length(gl_PointCoord-vec2(.5));if(d>.5)discard;gl_FragColor=vec4(vColor,vFade*smoothstep(.5,.25,d));}`;
const lineFragment=`varying vec3 vColor; varying float vFade;varying float vPath;uniform float lineOpacity;uniform float drawProgress;void main(){if(vPath>drawProgress)discard;gl_FragColor=vec4(vColor,lineOpacity);}`;

function init(){
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.setClearColor(0x000000);renderer.setPixelRatio(Math.min(devicePixelRatio,2));stage.appendChild(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,0,7.6);
  sculpture=new THREE.Group();scene.add(sculpture);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(arrays[0],3));geo.setAttribute('target',new THREE.BufferAttribute(arrays[1],3));geo.setAttribute('tint',new THREE.BufferAttribute(colors,3));geo.setAttribute('seed',new THREE.BufferAttribute(seeds,1));
  geo.setAttribute('pathProgress',new THREE.BufferAttribute(pathProgress,1));
  uniforms={blend:{value:0},seconds:{value:0},pointScale:{value:15},weave:{value:0},lineOpacity:{value:.12},drawProgress:{value:0}};
  const material=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,blending:THREE.NormalBlending});
  points=new THREE.Points(geo,material);sculpture.add(points);
  const wire=geo.clone(), indices=[];
  for(let row=0;row<ROWS;row+=3)for(let col=0;col<COLS-1;col++){indices.push(row*COLS+col,row*COLS+col+1);}
  wire.setIndex(indices);lines=new THREE.LineSegments(wire,new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:lineFragment,transparent:true,depthWrite:false}));sculpture.add(lines);
  resize();window.addEventListener('resize',resize);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();setPlaying(false);document.querySelector('#error').hidden=false;});
  adapter=createMotionAdapter({duration:DURATION,seek:render,fallback:fail,reduced:reduced.matches,holdForProgress:p=>{const t=p*DURATION;return(t<9?5:t<18?14:t<28?24:t<38?34:46)/DURATION;},dispose:()=>{renderer.dispose();points.geometry.dispose();points.material.dispose();lines.geometry.dispose();lines.material.dispose();}});
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
  const s=Math.min(3,Math.floor(state.morph)),fraction=state.morph-s;
  for(const geometry of [points.geometry,lines.geometry]){
    geometry.attributes.position.array=arrays[s];geometry.attributes.position.needsUpdate=true;
    geometry.attributes.target.array=arrays[s+1];geometry.attributes.target.needsUpdate=true;
  }
  uniforms.blend.value=state.morph===4?1:fraction;uniforms.weave.value=state.weave;uniforms.lineOpacity.value=state.line;
  uniforms.drawProgress.value=state.draw;
  sculpture.rotation.set(state.rx,state.ry,state.rz);sculpture.scale.setScalar(state.scale);
  if(renderer.domElement.width<1)return;renderer.render(scene,camera);
  const next=cuts.reduce((a,c,i)=>t>=c?i:a,0);
  if(next!==act){act=next;document.querySelector('#caption').textContent=captions[act];document.querySelector('#chapter-number').textContent=String(act+1).padStart(2,'0');document.querySelectorAll('[data-time]').forEach((b,i)=>{if(i===act)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});}
  const local=t-cuts[act];const caption=document.querySelector('#caption');
  caption.style.clipPath=reduced.matches?'none':`inset(${(1-Math.min(1,local/1.05))*100}% 0 0 0)`;
}
const state={morph:0,rx:.30,ry:-.48,rz:-.12,scale:1,weave:0,line:.14,draw:0};
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

function update(t){time=Math.min(DURATION,Math.max(0,t));adapter?.setProgress(time/DURATION);scrub.value=time;scrub.style.setProperty('--progress',`${time/DURATION*100}%`);document.querySelector('#time').textContent=`00:${String(Math.floor(time)).padStart(2,'0')}`;}
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
function seek(t){if(sound?.active)sound.seek(t);else if(playing)anchor=performance.now()-t*1000;update(t);}
function fail(error){console.error(error);const message=document.querySelector('#error');message.hidden=false;message.textContent='3D 장면을 열 수 없습니다. '+captions.join(' ');setPlaying(false);}
async function boot(){
  try{
    await document.fonts.load('700 390px Pretendard');await document.fonts.ready;forms();init();lucide.createIcons();
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
    document.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;if(e.code==='Space'){e.preventDefault();if(time>=DURATION)seek(0);setPlaying(!playing);}if(e.code==='ArrowRight')seek(Math.min(48,time+2));if(e.code==='ArrowLeft')seek(Math.max(0,time-2));});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false);});
    reduced.addEventListener('change',()=>{setPlaying(false);adapter.setReduced(reduced.matches);update(time);});
    window.__film={seek:t=>{setPlaying(false);seek(t);},state:()=>({time,playing,act,reduced:reduced.matches,points:COUNT,sound:sound.status,audioActive:sound.active,muted:sound.media.muted,audioTime:sound.media.currentTime,audioDuration:sound.media.duration}),destroy:()=>{setPlaying(false);sound.destroy();adapter.destroy();},render,ready:true};
    sound.enable(0,!reduced.matches);
  }catch(e){fail(e);}
}
boot();
