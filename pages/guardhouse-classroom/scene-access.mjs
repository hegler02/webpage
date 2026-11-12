// Shared 3D courtesies: arrow-key viewing, and a lighter image on machines that struggle.
export function keyboardOrbit(controls,target){
 if(target.tabIndex<0)target.tabIndex=0;
 if(!target.getAttribute('aria-label')){target.setAttribute('role','img');target.setAttribute('aria-label','3D 모델. 화살표로 이동하고 Shift와 화살표로 회전합니다.');}
 controls.listenToKeyEvents(target);
}
export function lightenOnSlowFrames(renderer,{warmup=3000,sample=90,limitMs=45}={}){
 let start=0,frames=0,last=0;
 const measure=now=>{
  if(now-last>500){start=now;frames=0;}
  last=now;frames++;
  if(frames<sample){requestAnimationFrame(measure);return;}
  if((now-start)/frames>limitMs&&renderer.getPixelRatio()>1)renderer.setPixelRatio(1);
 };
 setTimeout(()=>requestAnimationFrame(measure),warmup);
}
// Without a GPU the scene still runs as data, so drawings, selection and calculations keep working.
function silentRenderer(){
 const fixed={noGPU:true,domElement:document.createElement('canvas'),shadowMap:{},capabilities:{getMaxAnisotropy:()=>1},getPixelRatio:()=>1,compileAsync:()=>Promise.resolve()};
 return new Proxy(fixed,{get:(target,key)=>key in target?target[key]:()=>{}});
}
// A scene that is built in slices keeps its canvas in the page but out of sight, and the notice in its place, until the scene is whole.
// The drawing buffer takes its size here: sized at the end, it waits on a graphics process that is busy with the textures.
export function holdCanvas(host,renderer){
 const canvas=renderer.domElement,w=host.clientWidth,h=host.clientHeight;
 canvas.style.display='none';host.append(canvas);if(w&&h)renderer.setSize(w,h,false);
}
export function seatCanvas(host,canvas){for(const note of host.querySelectorAll(':scope>p[role=status]'))note.remove();canvas.style.display='';if(canvas.parentNode!==host)host.append(canvas);}
// A large model is built a few elements at a time, so the page can draw between them.
export async function buildInSlices(build,model,pause,step=1){
 const group=build({...model,elements:[]});
 for(let i=0;i<model.elements.length;i+=step){await pause();group.add(...build({...model,elements:model.elements.slice(i,i+step)}).children);}
 return group;
}
export function createRenderer(THREE,host,options){
 // Making the renderer is the test: a context opened only to see whether one can be had costs as much as the real one.
 try{return new THREE.WebGLRenderer(options);}catch{}
 const note=document.createElement('div');note.className='wb-lost';note.setAttribute('role','status');
 note.innerHTML='<p>이 컴퓨터에서는 3D를 표시할 수 없습니다. 도면과 계산은 그대로 쓸 수 있습니다.</p>';host.append(note);
 return silentRenderer();
}
