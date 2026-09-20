/** Visual effects only. The controller commits the destination before calling this module. */
export function createMotion(stage, curtain) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 700px) and (orientation: portrait)');
  const timing = Object.freeze({chapter:1000,scene:650,exit:340,stagger:65,ease:'cubic-bezier(.22,1,.36,1)'});
  let animations = [];
  let manualReduce = false;
  let generation = 0;
  const clean = () => {
    generation++; stage.setAttribute("aria-busy","false");
    animations.forEach(a => a.cancel()); animations = [];
    stage.querySelectorAll('.departing').forEach(s => s.classList.remove('departing'));
    curtain.classList.remove('is-moving');
  };
  const run = (node, frames, options) => {
    const animation = node.animate(frames, {easing:timing.ease,fill:'backwards',...options});
    animations.push(animation); return animation;
  };
  const play = (previous, next, direction, chapter) => {
    clean();
    if(reduce.matches || manualReduce) return;
    const turn = generation; stage.setAttribute("aria-busy","true");
    const duration = chapter ? timing.chapter : timing.scene;
    const sign = direction < 0 ? -1 : 1;
    if(previous && !compact.matches) {
      previous.classList.add('departing');
      const outgoing = run(previous,[{opacity:1},{opacity:0,transform:`translateX(${-sign*45}px)`}],{duration:timing.exit});
      outgoing.onfinish = () => previous.classList.remove('departing');
    }
    if(chapter && !compact.matches) {
      curtain.classList.add('is-moving');
      const wipe=run(curtain,[{transform:`translateX(${-sign*105}%)`,offset:0},{transform:'translateX(0)',offset:.32},{transform:`translateX(${sign*105}%)`,offset:1}],{duration});
      wipe.onfinish=()=>curtain.classList.remove('is-moving');
      run(next,[{clipPath:`inset(0 ${direction<0?'0 0 100%':'100% 0 0'})`,opacity:.6},{clipPath:'inset(0 0 0 0)',opacity:1}],{duration,delay:80});
    } else {
      run(next,[{opacity:0,transform:`translateY(${compact.matches?16:28}px)`},{opacity:1,transform:'translateY(0)'}],{duration});
    }
    next.querySelectorAll('.reveal').forEach((node,i)=>{
      run(node,[{opacity:0,transform:`translateY(${compact.matches?18:55}px)`},{opacity:1,transform:'translateY(0)'}],{duration,delay:(chapter&&!compact.matches?230:40)+i*timing.stagger});
    });
    Promise.allSettled(animations.map(a=>a.finished)).then(()=>{if(turn===generation)stage.setAttribute("aria-busy","false");});
  };
  reduce.addEventListener('change',clean);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clean();});
  return {play,clean,setReduced(value){manualReduce=value;clean();}};
}
