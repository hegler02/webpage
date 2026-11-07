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
function webglAvailable(){try{return Boolean(document.createElement('canvas').getContext('webgl2'));}catch{return false;}}
// Without a GPU the scene still runs as data, so drawings, selection and calculations keep working.
function silentRenderer(){
 const fixed={noGPU:true,domElement:document.createElement('canvas'),shadowMap:{},capabilities:{getMaxAnisotropy:()=>1},getPixelRatio:()=>1,compileAsync:()=>Promise.resolve()};
 return new Proxy(fixed,{get:(target,key)=>key in target?target[key]:()=>{}});
}
export function createRenderer(THREE,host,options){
 if(webglAvailable())return new THREE.WebGLRenderer(options);
 const note=document.createElement('div');note.className='wb-lost';note.setAttribute('role','status');
 note.innerHTML='<p>이 컴퓨터에서는 3D를 표시할 수 없습니다. 도면과 계산은 그대로 쓸 수 있습니다.</p>';host.append(note);
 return silentRenderer();
}
