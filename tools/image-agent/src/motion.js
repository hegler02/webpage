/* Finite presenter motion. Layout and scene facts remain owned by the renderer. */
window.ChainMotion=(()=>{
 let enabled=true,loading=null,animation=null,epoch=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const defaultView='0 0 640 420',focusView='330 75 295 260';
 function loadScript(src,timeout){return new Promise((resolve,reject)=>{const s=document.createElement('script');let done=false;const end=(ok)=>{if(done)return;done=true;clearTimeout(timer);ok?resolve():reject(Error('Motion unavailable'));};const timer=setTimeout(()=>end(false),timeout);s.src=src;s.onload=()=>end(true);s.onerror=()=>end(false);document.head.append(s);});}
 function load(c){if(!loading)loading=loadScript(c.runtime.gsap,c.motion.loadTimeout).then(()=>loadScript(c.runtime.flip,c.motion.loadTimeout)).then(()=>{gsap.registerPlugin(Flip);return true;}).catch(()=>{document.body.dataset.motion='fallback';return false;});return loading;}
 function settle(){epoch++;if(animation){animation.progress(1);animation.kill();animation=null;}document.querySelectorAll('[data-moving]').forEach(n=>{n.removeAttribute('data-moving');n.style.removeProperty('transform');n.style.removeProperty('opacity');});}
 function targetView(scene){return scene.dataset.kind==='glasses'&&Number(scene.dataset.beat)===3?focusView:defaultView;}
 function settleDrawing(scene){const svg=scene.querySelector('.drawing');if(svg)svg.setAttribute('viewBox',targetView(scene));scene.dataset.settled='true';}
 function captureDrawing(scene){return [...scene.querySelectorAll('.drawing g,.drawing rect,.drawing path')].map(n=>({n,opacity:getComputedStyle(n).opacity,fill:getComputedStyle(n).fill,stroke:getComputedStyle(n).stroke,rx:getComputedStyle(n).rx}));}
 async function transition(previous,next,paint,c,direction){
  settle();const token=epoch;
  if(!enabled||reduced.matches||document.hidden){paint();settleDrawing(next);return;}
  if(!window.gsap||!window.Flip){const ok=await load(c);if(token!==epoch)return;if(!ok||!enabled||reduced.matches){paint();settleDrawing(next);return;}}
  const same=previous===next,m=c.motion;
  const nodes=same?[...next.querySelectorAll('[data-flip-id]')]:[];
  const state=nodes.length?Flip.getState(nodes,{props:'color,opacity'}):null;
  const drawing=same?captureDrawing(next):[];
  const svg=next.querySelector('.drawing');const fromView=svg?.getAttribute('viewBox')||defaultView;
  paint();animation=gsap.timeline({onComplete:()=>{settleDrawing(next);next.querySelectorAll('[data-moving]').forEach(n=>n.removeAttribute('data-moving'));}});
  if(same){
   if(state)animation.add(Flip.from(state,{duration:m.duration,ease:m.ease,absoluteOnLeave:true,nested:true,prune:true}),0);
   drawing.forEach(({n,...before})=>{const after={};for(const k in before){const v=getComputedStyle(n)[k];if(v!==before[k])after[k]=v;}if(Object.keys(after).length)animation.fromTo(n,before,{...after,duration:m.duration,ease:m.ease,clearProps:Object.keys(before).join(',')},0);});
   if(svg)animation.fromTo(svg,{attr:{viewBox:fromView}},{attr:{viewBox:targetView(next)},duration:m.duration,ease:m.ease},0);
   const result=next.querySelector('.result-line.active');if(result){result.dataset.moving='true';animation.fromTo(result,{opacity:0,y:m.travel/2},{opacity:1,y:0,duration:m.enter,clearProps:'transform,opacity'},m.exit);}
  }else{
   settleDrawing(next);const body=next.querySelector('.composition');body.dataset.moving='true';animation.fromTo(body,{opacity:0,y:direction*m.travel},{opacity:1,y:0,duration:m.enter,ease:m.arrival,clearProps:'transform,opacity'},0);
  }
 }
 function setEnabled(v){enabled=v;settle();}
 function pause(){settle();}function resume(){}function destroy(){settle();}function fallback(){setEnabled(false);}
 return {transition,settle,setEnabled,pause,resume,destroy,fallback,settleDrawing,reduced};
})();
