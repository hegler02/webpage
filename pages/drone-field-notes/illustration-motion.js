"use strict";
window.DRONE_ILLUSTRATION_MOTION=(()=>{
 const {token,num}=window.DRONE_UTILS;
 function apply({root,s,p,visual,show,q,all,frame}){
  const duration=num('motion-spatial');
  if(['mapping','spatial'].includes(s.layout)){
   const volume=s.layout==='spatial'&&p===2,tiles=s.layout==='mapping'&&p===0;
   visual(q('.spatial-world'),{transform:volume?token('harbor-camera-volume'):token('harbor-camera-plan')},duration);
   const perspective=s.layout==='spatial'&&p===0;
   show(q('.perspective-photo'),perspective,duration);
   visual(q('.spatial-photo'),{opacity:tiles||perspective?'0':'1'},duration);
   show(q('.map-annotations'),!tiles&&!perspective&&!volume,duration);
   all('.match-point text').forEach(el=>show(el,tiles,duration));
   all('.match-point').forEach(el=>visual(el,{opacity:tiles?'1':'0'},duration));
   all('.photo-piece').forEach(el=>{
    visual(el,{transform:tiles?`translate(${el.dataset.dx}px,${el.dataset.dy}px) rotate(${el.dataset.angle}deg) scale(${token('photo-piece-scatter-scale')})`:'translate(0px,0px) rotate(0deg) scale(1)',opacity:tiles?'1':'0'},duration);
    visual(el.querySelector('.photo-piece-label'),{opacity:tiles?'1':'0'},duration);
    visual(el,{borderColor:tiles?token('color-accent'):token('color-clear'),boxShadow:tiles?token('photo-piece-shadow'):'none'},duration);
   });
   all('.building-roof').forEach(el=>visual(el,{transform:volume?'translateZ('+token('harbor-building-height')+')':'translateZ(0px)'},duration));
   all('.building-wall').forEach(el=>visual(el,{opacity:volume?'1':'0'},duration));
   visual(q('.harbor-volumes'),{opacity:volume?'1':'0'},duration);
   show(q('.map-result'),!volume,duration);show(q('.volume-result'),volume,duration);
  }
  if(s.id==='closing'){show(q('.mosaic'),p===0);show(q('.future-mosaic'),p>0,duration);}
  if(s.layout==='survey'){
   visual(q('#surveyPhoto'),{transform:p?'translate(0px,0px)':token('survey-offset')},duration);
   show(q('.check-point'),p===2);visual(q('.control-key'),{color:p?token('color-accent'):token('color-muted')});
  }
  if(s.id==='cinema'){
   show(q('.official-poster'),p>=1);visual(q('.hero-photo'),{opacity:p>=1?'0':'1'});
  }
  if(s.id==='system'){
   all('.equipment-grid figure').forEach((el,i)=>visual(el,{opacity:p===0&&i>0?token('state-past'):'1',transform:p===1?'translateY('+token('equipment-rise')+')':'translateY(0px)'},duration));
   show(q('.equipment-grid'),p<2);show(q('.inspection-workflow'),p===2,duration);all('.workflow-step').forEach((el,i)=>visual(el,{transform:p===2?'translateY(0px)':'translateY('+token('motion-rise')+')'},duration,i*num('motion-stagger')));
  }
  if(s.layout==='inspection'){
   show(q('.inspection-detail'),p>0,undefined,true);
   visual(q('.inspection-target'),{opacity:p?'1':'0'},num('motion-focus'));
  }
  if(s.layout==='dual'){
   show(q('.agriculture-observe'),p===0);show(q('.agriculture-spray'),p>0);
  }
  if(s.id==='fishing'){
   show(q('.fishing-release'),p>0);visual(q('.released-bait'),{transform:p?token('bait-fall'):'translateY(0px)'},duration);
   visual(q('.release-line'),{d:p?token('fishing-line-released'):token('fishing-line-carried')},duration);visual(q('.fishing-release .release-clip'),{transform:p?token('fishing-clip-open'):'rotate(0deg)'},duration);
  }
  if(s.layout==='airtaxi'){show(q('.official-poster'),p===0);show(q('.certification-visual'),p>0);}
  if(s.id==='reliability'){
   all('.reliability-grid article').forEach(el=>visual(el,{borderColor:p?token('color-accent'):token('color-line')},num('motion-focus')));all('.reliability-status').forEach(el=>visual(el,{color:p?token('color-accent'):token('color-muted')},num('motion-focus')));
  }
  if(s.layout==='dock')visual(q('.dock-route'),{strokeDashoffset:p?'0':'1'},num('motion-route'));
  if(s.layout==='ecology'){
   show(q('.growth-stage'),p>0);all('.falling-seed').forEach((el,i)=>visual(el,{transform:p?token('seed-fall'):'translateY(0px)'},duration,i*num('motion-stagger')));
  }
  if(s.layout==='medical'){
   show(q('.medical-observed'),p===0);show(q('.medical-routes'),p>0);
   visual(q('.route-out'),{opacity:p===1?'1':'0'},num('motion-condition-lead'));
   visual(q('.route-out-label'),{opacity:p===1?'1':'0'},num('motion-condition-lead'));
  }
 }
 return {apply};
})();
