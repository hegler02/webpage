"use strict";
(()=>{
 const data=window.DRONE_CONTENT,$=id=>document.getElementById(id),stage=$('stage');
 const {num}=window.DRONE_UTILS,reduced=matchMedia('(prefers-reduced-motion: reduce)'),offsets=[];
 const solo=window.DRONE_SOLO,lead=s=>solo.lead(s),steps=s=>lead(s)+s.beats.length+solo.tail(s);
 let count=0;
 function layout(){offsets.length=0;count=0;data.slides.forEach(s=>{offsets.push(count);count+=steps(s);});}
 layout();
 let index=0,mounted=-1,epoch=0,settled=true,animations=[];
 const events=[];
 function state(){const scene=offsets.findLastIndex(n=>n<=index),s=data.slides[scene],step=index-offsets[scene],l=lead(s);return {index,scene,step,beat:Math.max(0,Math.min(s.beats.length-1,step-l)),asking:step<l,checking:step>=l+s.beats.length,settled,runId:data.runId};}
 function record(type,detail={}){events.push({runId:data.runId,type,index,at:performance.now(),...detail});}
 function scaleStage(){stage.style.transform='scale('+($('stageViewport').clientWidth/num('stage-width'))+')';}
 new ResizeObserver(scaleStage).observe($('stageViewport'));window.addEventListener('resize',scaleStage);
 function controls(){
  const {scene,step}=state(),s=data.slides[scene],labels=[...(lead(s)?[data.solo.label]:[]),...s.beats.map(b=>b.label),...(solo.tail(s)?[data.solo.checkLabel]:[])],key=scene+':'+lead(s)+':'+solo.tail(s);
  if($('steps').dataset.scene!==key){
   $('steps').replaceChildren();$('steps').dataset.scene=key;
   labels.forEach((label,i)=>{const el=document.createElement('button');el.id='step'+i;el.type='button';el.textContent=(i+1)+'. '+label;el.addEventListener('click',()=>go(offsets[scene]+i));$('steps').append(el);});
  }
  labels.forEach((label,i)=>{const el=$('step'+i);el.setAttribute('aria-label',label+' 단계');if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  $('solo').setAttribute('aria-pressed',String(solo.isOn()));
  $('prev').disabled=index===0;$('next').disabled=index===count-1;
  $('nextLabel').textContent=index===count-1?'마지막 장':step===labels.length-1?'다음 장':'다음 단계';
  $('position').textContent=s.number+' / '+data.slides.length;$('sourceCount').textContent=String(s.sourceIds.length);
  $('activity').hidden=s.layout!=='workshop';$('video').hidden=!s.video;
  $('video').textContent=s.video?.buttonLabel||'실제 활용 영상';$('edition').textContent=data.sections[s.section];
  try{history.replaceState(null,'','#'+s.id+'/'+(step+1));}catch{}
 }
 async function go(target,{instant=false,focus=false}={}){
  target=Math.max(0,Math.min(count-1,Math.trunc(target)));if(!Number.isFinite(target))return;
  if(panels.isOpen())panels.close({restore:false});
  const previous=data.slides[mounted>=0?mounted:state().scene],direction=target>=index?1:-1,current=++epoch;
  window.DRONE_MOTION.interrupt(animations);animations=[];settled=false;index=target;
  const {scene,step,beat,asking,checking}=state(),s=data.slides[scene],fresh=mounted!==scene,hadFocus=stage.contains(document.activeElement);
  const shared=fresh&&mounted>=0&&window.DRONE_TRANSITIONS.shared(previous,s);
  const animate=!instant&&!reduced.matches;
  if(fresh&&animate&&mounted>=0&&!shared){
   controls();animations=window.DRONE_TRANSITIONS.exit(stage,{direction});
   await Promise.allSettled(animations.map(a=>a.finished));
   if(current!==epoch)return;
   animations=[];
  }
  if(fresh){window.DRONE_SCENES.mount(stage,s,{preserveSpatial:shared});mounted=scene;}
  animations=window.DRONE_MOTION.apply(stage,s,beat,animate&&(!fresh||shared));
  animations.push(...solo.apply(stage,s,{asking,checking,animate:animate&&!fresh}));
  if(fresh&&animate)animations.push(...window.DRONE_TRANSITIONS.enter(stage,s,{previous:shared?previous:null,direction}));
  controls();scaleStage();
  if(focus||hadFocus)stage.firstElementChild.focus({preventScroll:true});
  record('transition.requested',{scene,step,asking,checking,relation:window.DRONE_TRANSITIONS.relation(shared?previous:null,s),direction,reducedMotion:reduced.matches});
  await Promise.allSettled(animations.map(a=>a.finished));
  if(current!==epoch)return;
  animations=[];settled=true;
  $('status').textContent=s.number+'장. '+s.title+'. '+(asking?data.solo.label+'. '+s.question:checking?data.solo.checkLabel+'. '+data.sections[s.section]+'.':s.beats[beat].label+'.');
  record('transition.settled',{completion:'animation.finished/explicit-state'});
 }
 const goSlide=(scene,step=0,options={})=>{const n=Math.max(0,Math.min(data.slides.length-1,scene));return go(offsets[n]+Math.max(0,Math.min(steps(data.slides[n])-1,step)),options);};
 const panels=window.DRONE_PANELS.create({data,getState:state,navigate:goSlide,record});
 const showPanel=kind=>panels.show(kind);
 $('prev').addEventListener('click',()=>go(index-1));$('next').addEventListener('click',()=>go(index+1));
 $('replay').addEventListener('click',()=>goSlide(state().scene));
 $('solo').addEventListener('click',()=>{
  const {scene,beat,asking}=state();solo.setOn(!solo.isOn());layout();
  const l=lead(data.slides[scene]);go(offsets[scene]+(asking&&l?0:beat+l),{instant:true});
 });
 stage.addEventListener('click',e=>{
  const s=data.slides[state().scene],choice=e.target.closest('.solo-choice'),option=e.target.closest('.check-option'),review=e.target.closest('.solo-review'),term=e.target.closest('.term-hint');
  if(choice)solo.choose(stage,s,choice.dataset.stage);
  else if(option)solo.answer(stage,s,Number(option.dataset.item),Number(option.dataset.option));
  else if(review){const n=Number(review.dataset.scene);goSlide(n,lead(data.slides[n]),{focus:true});}
  else if(term)solo.explain(term);
 });
 ['evidence','reading','contents','legend','activity','video'].forEach(id=>$(id).addEventListener('click',()=>showPanel(id)));
 window.DRONE_FULLSCREEN.bind({button:$('fullscreen'),notice:$('fullscreenNotice'),onResize:scaleStage});
 document.addEventListener('keydown',e=>{
  if(panels.isOpen()||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable]'))return;
  if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();e.shiftKey?goSlide(state().scene+1):go(index+1);}
  else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();e.shiftKey?goSlide(state().scene-1):go(index-1);}
  else if(e.key==='Home'){e.preventDefault();go(0);}else if(e.key==='End'){e.preventDefault();go(count-1);}
  else if(e.key.toLowerCase()==='e')showPanel('evidence');else if(e.key.toLowerCase()==='m')showPanel('contents');
 });
 function fromHash(){const parts=location.hash.slice(1).split('/'),n=data.slides.findIndex(s=>s.id===parts[0]);if(n>=0)return offsets[n]+Math.max(0,Math.min(steps(data.slides[n])-1,(Number(parts[1])||1)-1));return 0;}
 window.addEventListener('hashchange',()=>go(fromHash(),{instant:true}));reduced.addEventListener('change',()=>go(index,{instant:true}));
 window.__A11Y_PRESENTATION__={contractVersion:'presentation-v1',getViewCount:()=>count,getCurrentIndex:()=>index,isSettled:()=>settled,navigateTo:i=>go(i,{focus:true}),recover:()=>{mounted=-1;return go(index,{instant:true,focus:true});}};
 window.DRONE_DECK={getState:state,go,goSlide,showPanel,events,offsets,getMotion:()=>animations.map(a=>({currentTime:a.currentTime,duration:a.effect.getTiming().duration,playState:a.playState})),refreshTokens:()=>{scaleStage();return go(index,{instant:true});}};
 go(fromHash(),{instant:true});document.fonts.ready.then(scaleStage);
})();
