"use strict";
window.DRONE_MOTION=(()=>{
 const {token,num}=window.DRONE_UTILS;
 function interrupt(animations){
  const snapshots=animations.flatMap(a=>{
   const el=a.effect?.target;if(a.droneEntry||!el?.isConnected)return [];
   const keys=new Set(a.effect.getKeyframes().flatMap(f=>Object.keys(f)).filter(k=>!['offset','computedOffset','easing','composite'].includes(k)));
   const cs=getComputedStyle(el);return [{el,values:Object.fromEntries([...keys].map(k=>[k,cs[k]]))}];
  });
  animations.forEach(a=>a.cancel());
  snapshots.forEach(({el,values})=>Object.assign(el.style,values));
 }
 function apply(root,s,p,animate){
  const animations=[],q=sel=>root.querySelector(sel),all=sel=>[...root.querySelectorAll(sel)],frame=root.firstElementChild;
  function visual(el,props,duration=num('motion-reveal'),delay=0){
   if(!el)return;const cs=getComputedStyle(el),from={};
   for(const [k,v]of Object.entries(props)){
    from[k]=cs[k];
    if(k==='transform'&&/^scaleX\(/.test(v))from[k]='scaleX('+new DOMMatrixReadOnly(cs.transform).a+')';
    el.style[k]=v;
   }
   if(animate&&duration){const a=el.animate([from,props],{duration,delay,easing:token('motion-ease'),fill:'backwards'});a.finished.catch(()=>{});animations.push(a);}
  }
  function show(el,yes,duration,shift=false,delay=0){
   if(!el)return;el.setAttribute('aria-hidden',String(!yes));
   visual(el,{opacity:yes?'1':'0',transform:shift?'translateY('+(yes?'0px':token('motion-rise'))+')':'none'},duration,delay);
  }
  const content=window.DRONE_SCENE_CONTENT.commit(root,s,p);
  if(s.layout==='inspection'){
   visual(q('.hero-photo'),{transform:'scale('+(p?token('hero-photo-scale',frame):'1')+')'},num('motion-spatial'));
  }
  if(['cinema','metric-hero'].includes(s.layout))show(q('.hero-stat'),s.layout==='metric-hero'||p===1,undefined,true);
  if(s.layout==='inspection')visual(q('.inspection-callout'),{clipPath:p?token('clip-open'):token('clip-closed')},num('motion-spatial'));
  if(s.layout==='airtaxi')show(q('.airtaxi-axes'),p>0,undefined,true);
  if(['mosaic','quadrants','workshop'].includes(s.layout)){
   all('.mosaic-tile,.quad,.workshop-grid figure').forEach((el,i)=>{
    visual(el.querySelector('figcaption,.quad>div'),{opacity:p?'1':token('state-past')});
   });
  }
  if(s.layout==='system'){
   all('.system-node').forEach((el,i)=>visual(el,{borderColor:i===(p===2?3:p)?token('color-accent'):token('color-line'),opacity:p===2||i<=p?'1':token('state-past')},num('motion-focus')));
  }
  if(['process','dock','ecology'].includes(s.layout)){
   all('.process-node').forEach((el,i)=>show(el,p>0||i===0,undefined,true,i*num('motion-stagger')));
  }
  if(s.layout==='compare'){
   visual(q('.compare-after'),{clipPath:p?'inset(0% 0% 0% '+token('compare-split')+')':'inset(0% 0% 0% 100%)'},num('motion-split'));
   visual(q('.compare-divider'),{left:p?token('compare-split'):token('compare-divider-origin'),opacity:p?'1':'0'},num('motion-split'));
   show(q('.after-tag'),p>0);
   visual(q('.compare-focus'),{opacity:p?'1':'0'},num('motion-focus'),p?num('motion-split'):0);
  }
  if(s.layout==='dual')all('.dual-panel').forEach((el,i)=>show(el,i===0||p>0,undefined,true));
  if(s.layout==='dots'){
   all('.show-dot').forEach(el=>visual(el,{transform:p?'translate(0px,0px)':'translate('+el.dataset.scatterX+'px,'+el.dataset.scatterY+'px)'},num('motion-dots')));
   visual(q('.lightshow-photo'),{opacity:p?token('show-photo-opacity'):token('state-muted')},num('motion-dots'));
  }
  if(s.layout==='metrics')all('.large-metrics>div').forEach((el,i)=>show(el,i===0||p>0,undefined,true));
  if(s.layout==='medical'){
   q('#droneBar').style.width=content.medical.dronePercent+'%';
   show(q('#medicalComparison'),p>=1);visual(q('#droneBar'),{transform:p?'scaleX(1)':'scaleX(0)'},num('motion-grid'));
   visual(q('#comparisonCaption'),{color:p>=1?token('color-accent'):token('color-muted')},num('motion-condition-lead'));
   visual(q('#roadBar'),{width:content.medical.roadPercent+'%',transform:p?'scaleX(1)':'scaleX(0)'},num('motion-grid'),num('motion-condition-lead'));
   q('.comparison-delta').setAttribute('aria-hidden',String(p<1));
   visual(q('.comparison-delta'),{opacity:p>=1?'1':'0'},num('motion-focus'),p>=1?num('motion-condition-lead')+num('motion-grid'):0);
  }
  if(s.layout==='documents'){
   show(q('#docAfter'),p>=1,undefined,true,p>=1?num('motion-condition-lead'):0);
   visual(q('.document-timeline i'),{transform:p?'scaleX(1)':'scaleX(0)'},num('motion-grid'));
   visual(q('#docBefore'),{borderTopColor:p>=2?token('color-secondary'):token('color-accent')},num('motion-focus'));
   visual(q('#docAfter'),{borderTopColor:p>=2?token('color-accent'):token('color-line')},num('motion-focus'),num('motion-condition-lead'));
   visual(q('#quoteMark'),{backgroundColor:p>=2?token('color-accent'):token('color-clear'),color:p>=2?token('color-paper-ink'):token('color-ink')});
  }
  if(s.layout==='matrix')all('.status-column ul').forEach((el,i)=>show(el,i===0||p>0,undefined,true,i*num('motion-stagger')));
  if(s.layout==='questions')all('.question-row').forEach((el,i)=>{
   show(el,i<=p,undefined,true);if(i<p)visual(el,{opacity:token('state-past')});
  });
  window.DRONE_ILLUSTRATION_MOTION.apply({root,s,p,visual,show,q,all,frame});
  if(animate&&num('motion-feedback'))['#beatHead','#beatText','#beatNote'].forEach((sel,i)=>{
   const el=q(sel);if(!el?.textContent)return;
   const a=el.animate([{opacity:0,transform:'translateY('+token('motion-text-rise')+')'},{opacity:1,transform:'none'}],{duration:num('motion-feedback'),delay:i*num('motion-stagger'),easing:token('motion-ease'),fill:'backwards'});
   a.droneEntry=true;a.finished.catch(()=>{});animations.push(a);
  });
  return animations;
 }
 return {apply,interrupt};
})();
