/** Temporary sleeve, spread, track and session-sheet motion. Navigation owns state. */
export function createMotion(stage,curtain){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const timing=Object.freeze({sleeve:1050,leaf:700,exit:240,stagger:105,foldDelay:120,ease:'cubic-bezier(.22,1,.36,1)'});
 const distance=Object.freeze({leaf:36,spread:90,shelf:100,notes:20,tilt:9,shelfTilt:3});
 let jobs=[],generation=0,manual=false;
 function clean(){generation++;jobs.forEach(a=>a.cancel());jobs=[];stage.querySelectorAll('.departing').forEach(s=>s.classList.remove('departing'));curtain.classList.remove('is-moving');stage.setAttribute('aria-busy','false');}
 function run(el,frames,options={}){if(!el)return;const job=el.animate(frames,{fill:'backwards',easing:timing.ease,duration:timing.leaf,...options});jobs.push(job);return job;}
 function play(previous,next,direction,chapter){
  clean();if(reduce.matches||manual)return;
  const turn=generation,sign=direction<0?-1:1,kind=next.dataset.motion,opening=chapter||kind==='sleeve';
  stage.setAttribute('aria-busy','true');
  if(previous){previous.classList.add('departing');run(previous,[{opacity:1},{opacity:0}],{duration:timing.exit}).onfinish=()=>previous.classList.remove('departing');}
  run(next,[{opacity:0},{opacity:1}],{duration:timing.exit});
  if(opening){
   run(next,[{clipPath:sign>0?'inset(0 100% 0 0)':'inset(0 0 0 100%)'},{clipPath:'inset(0 0 0 0)'}],{duration:timing.sleeve});
   run(next.querySelector('.record-art,.chapter-copy,.final-title,.content'),[{opacity:0,transform:`perspective(2400px) rotateY(${sign*distance.tilt}deg) translateX(${sign*distance.spread}px)`},{opacity:1,transform:'perspective(2400px) rotateY(0deg) translateX(0px)'}],{duration:timing.sleeve,delay:timing.foldDelay});
  }else if(kind==='spread'){
   const panels=[...next.querySelectorAll('.panel')];
   panels.forEach((el,i)=>run(el,[{opacity:0,transform:`translateX(${(i<(panels.length/2)?-1:1)*distance.spread}px)`},{opacity:1,transform:'translateX(0px)'}]));
  }else if(kind==='track'){
   next.querySelectorAll('.track-clip').forEach((el,i)=>run(el,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{delay:i*timing.stagger,duration:timing.sleeve}));
  }else if(kind==='notes'){
   next.querySelectorAll('.brief-list li,.workflow-list li,.practice-sheet').forEach((el,i)=>run(el,[{opacity:0,clipPath:'inset(0 100% 0 0)',transform:`translateY(${distance.notes}px)`},{opacity:1,clipPath:'inset(0 0 0 0)',transform:'translateY(0px)'}],{delay:i*timing.stagger}));
  }else if(kind==='shelf'){
   next.querySelectorAll('.album').forEach((el,i)=>run(el,[{opacity:0,transform:`translateY(${distance.shelf}px) rotate(${-distance.shelfTilt}deg)`},{opacity:1,transform:'translateY(0px) rotate(0deg)'}],{duration:timing.sleeve,delay:i*timing.stagger}));
  }else if(kind==='statement'){
   run(next.querySelector('.manifesto-title'),[{opacity:0,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}],{duration:timing.sleeve});
   run(next.querySelector('.statement-copy'),[{opacity:0},{opacity:1}],{delay:timing.stagger});
  }else{
   run(next.querySelector('.content'),[{opacity:0,transform:`translateX(${sign*distance.leaf}px)`},{opacity:1,transform:'translateX(0px)'}]);
  }
  Promise.allSettled(jobs.map(a=>a.finished)).then(()=>{if(turn===generation)stage.setAttribute('aria-busy','false');});
 }
 reduce.addEventListener('change',clean);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clean();});
 return{play,clean,setReduced(value){manual=value;clean();}};
}
