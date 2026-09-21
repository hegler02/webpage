/* GSAP owns transient style only; settled layout belongs to CSS. */
window.MessageMotion = (() => {
  let loading=null,enabled=true,context=null,animation=null,epoch=0;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const loadScript=src=>new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>{script.remove();reject(new Error('Animation runtime unavailable'));};document.head.append(script);
  });
  function load(config){
    if(!loading)loading=loadScript(config.runtime.gsap).then(()=>loadScript(config.runtime.flip)).then(()=>{gsap.registerPlugin(Flip);return true;}).catch(error=>{document.body.dataset.motion='fallback';console.warn(error.message);return false;});
    return loading;
  }
  function settle(){epoch++;if(animation){animation.progress(1);animation.kill();animation=null;}if(context){context.revert();context=null;}}
  const visible=node=>node.getClientRects().length>0 && getComputedStyle(node).visibility!=='hidden';
  async function transition(previous,next,mutate,config,direction=1){
    settle();const token=epoch;
    const allowed=enabled&&!media.matches&&!document.hidden;
    if(!allowed){mutate();return;}
    // Apply a user command immediately even during the first runtime request.
    if(!window.gsap||!window.Flip){mutate();const ready=await load(config);if(ready&&token===epoch&&enabled&&!media.matches)enter(next,config,direction);return;}
    const same=previous===next;
    const targets=same?[...next.querySelectorAll('[data-flip-id]')]:[];
    const before=new Set([...next.querySelectorAll('[data-at],[data-from],.item')].filter(visible));
    const flipState=targets.length?Flip.getState(targets,{props:'color,opacity'}):null;
    mutate();
    const m=config.motion;
    context=gsap.context(()=>{
      if(!same){
        animation=gsap.timeline();
        animation.fromTo(next.querySelector('.composition'),{opacity:0,y:direction*m.travel,scale:.965},{opacity:1,y:0,scale:1,duration:m.enter,ease:m.arrival,clearProps:'transform,opacity'});
      }else{
        animation=gsap.timeline();
        if(flipState)animation.add(Flip.from(flipState,{duration:m.duration,ease:m.ease,scale:true,absoluteOnLeave:true,nested:true,prune:true,onEnter:els=>gsap.fromTo(els,{opacity:0,scale:.78},{opacity:1,scale:1,duration:m.enter,clearProps:'transform,opacity'}),onLeave:els=>gsap.to(els,{opacity:0,scale:.8,duration:m.exit})}),0);
        const incoming=[...next.querySelectorAll('[data-at],[data-from],.item')].filter(n=>visible(n)&&!before.has(n)&&!n.hasAttribute('data-flip-id'));
        if(incoming.length)animation.fromTo(incoming,{opacity:0,y:direction*m.travel*.5},{opacity:1,y:0,duration:m.enter,stagger:m.stagger,ease:m.arrival,clearProps:'transform,opacity'},m.exit);
        if(next.classList.contains('scene-sequence')&&next.dataset.beat!=='0')animation.fromTo(next.querySelector('.curve path'),{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:m.duration,ease:'power2.inOut',clearProps:'strokeDasharray,strokeDashoffset'},0);
      }
    },next);
    animation?.eventCallback('onComplete',()=>{next.dataset.settled='true';});
  }
  function enter(next,config,direction){
    context=gsap.context(()=>{animation=gsap.fromTo(next.querySelector('.composition'),{opacity:.3,y:direction*config.motion.travel*.5},{opacity:1,y:0,duration:config.motion.enter,ease:config.motion.arrival,clearProps:'transform,opacity'});},next);
  }
  function setEnabled(value){enabled=value;settle();}
  function pause(){settle();}
  function resume(){} // Finite, presenter-controlled motion does not auto-replay.
  function destroy(){settle();}
  function fallback(){setEnabled(false);}
  media.addEventListener('change',()=>{settle();document.body.dataset.reducedMotion=String(media.matches);});
  document.addEventListener('visibilitychange',()=>document.hidden?pause():resume());
  return {transition,settle,setEnabled,pause,resume,destroy,fallback};
})();
