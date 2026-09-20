/** Temporary visuals only; the controller owns current scene and language. */
export function createMotion(stage,curtain){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const timing=Object.freeze({chapter:980,scene:640,exit:280,stagger:90,ease:'cubic-bezier(.22,1,.36,1)'});
 let jobs=[],generation=0,manual=false;
 function clean(){generation++;jobs.forEach(a=>a.cancel());jobs=[];stage.querySelectorAll('.departing').forEach(s=>s.classList.remove('departing'));curtain.classList.remove('is-moving');stage.setAttribute('aria-busy','false');}
 function run(el,frames,options){const job=el.animate(frames,{fill:'backwards',easing:timing.ease,...options});jobs.push(job);return job;}
 function play(previous,next,direction,chapter){
  clean();if(reduce.matches||manual)return;const turn=generation,sign=direction<0?-1:1,kind=next.dataset.motion;
  const isChapter=chapter||kind==='chapter',duration=isChapter?timing.chapter:timing.scene;
  stage.setAttribute('aria-busy','true');
  if(previous){previous.classList.add('departing');run(previous,[{opacity:1},{opacity:0,transform:`translateX(${-sign*40}px)`}],{duration:timing.exit}).onfinish=()=>previous.classList.remove('departing');}
  if(isChapter){curtain.classList.add('is-moving');run(curtain,[{transform:`translateX(${-sign*105}%)`,offset:0},{transform:'translateX(0)',offset:.3},{transform:`translateX(${sign*105}%)`,offset:1}],{duration}).onfinish=()=>curtain.classList.remove('is-moving');run(next,[{clipPath:'inset(0 100% 0 0)',opacity:.7},{clipPath:'inset(0 0 0 0)',opacity:1}],{duration,delay:80});}
  else run(next,[{opacity:0},{opacity:1}],{duration});
  next.querySelectorAll('.reveal').forEach((el,i)=>{
   const compare=kind==='compare',delay=(isChapter?240:30)+(compare?0:i*timing.stagger);
   const frames=kind==='statement'?[{opacity:0,transform:'translateY(45px)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'translateY(0)',clipPath:'inset(0 0 0 0)'}]:[{opacity:0,transform:`translate${kind==='sequence'?'X':'Y'}(${sign*42}px)`},{opacity:1,transform:'translate(0,0)'}];
   run(el,frames,{duration,delay});
  });
  Promise.allSettled(jobs.map(a=>a.finished)).then(()=>{if(turn===generation)stage.setAttribute('aria-busy','false');});
 }
 reduce.addEventListener('change',clean);document.addEventListener('visibilitychange',()=>{if(document.hidden)clean();});
 return{play,clean,setReduced(value){manual=value;clean();}};
}
