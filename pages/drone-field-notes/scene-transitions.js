"use strict";
/* Three scene relations: the same place stays, a comparison opens, a new topic travels in the reading direction.
   Exit and entry enhance the host's committed scene; they never advance it. */
window.DRONE_TRANSITIONS=(()=>{
  const {token,num}=window.DRONE_UTILS;
  const shared=(a,b)=>!!a&&a.id!==b.id&&a.motion?.relation&&a.motion.relation===b.motion?.relation;
  const relation=(previous,s)=>shared(previous,s)?'shared-anchor':s.motion.entry==='compare'?'compare':'topic';
  const shift=direction=>`translateX(calc(${token('motion-distance')} * ${direction}))`;
  const track=(a,list)=>{a.droneEntry=true;a.finished.catch(()=>{});list.push(a);};
  function exit(root,{direction=1}={}){
    const animations=[],frame=root.firstElementChild,duration=num('motion-exit');
    if(frame&&duration)track(frame.animate([{opacity:1,transform:'none'},{opacity:0,transform:shift(-direction)}],{duration,easing:token('motion-ease'),fill:'forwards'}),animations);
    return animations;
  }
  function enter(root,s,{previous,direction=1}={}){
    const animations=[],duration=num('motion-scene'),frame=root.firstElementChild,kind=relation(previous,s);
    frame.dataset.transition=kind;if(!duration)return animations;
    const run=(element,frames,delay=0,time=duration)=>{
      if(!element||element.closest('[aria-hidden="true"]'))return;
      track(element.animate(frames,{duration:time,delay,easing:token('motion-ease'),fill:'backwards'}),animations);
    };
    const copy=root.querySelector('.scene-copy,.hero-copy,.scene-band,.medical-bottom');
    const rise=[{opacity:0,transform:`translateY(${token('motion-distance')})`},{opacity:1,transform:'none'}];
    if(kind==='shared-anchor'){run(copy,rise);return animations;}
    if(kind==='compare'){
      run(frame,[{opacity:0},{opacity:1}]);
      run(root.querySelector('.compare-frame'),[{clipPath:token('clip-closed')},{clipPath:token('clip-open')}],0,num('motion-split'));
    }else run(frame,[{opacity:0,transform:shift(direction)},{opacity:1,transform:'none'}]);
    run(copy,rise,num('motion-feedback'));
    return animations;
  }
  return {shared,relation,exit,enter};
})();
