"use strict";
/* Updates the committed words and chart values; animation timing is owned by scene-motion. */
window.DRONE_SCENE_CONTENT=(()=>{
 const {num}=window.DRONE_UTILS;
 function commit(root,s,p){
  const q=selector=>root.querySelector(selector);
  const beat=s.caseData?window.DRONE_CASE_CONTENT.project(s).beats[p]:s.beats[p];
  for(const [id,key]of [['beatHead','headline'],['beatText','text'],['beatNote','note']]){
   const el=q('#'+id);if(el)el.textContent=beat[key]||'';
  }
  if(s.layout==='mapping'||s.layout==='spatial'){
   q('#spatialLabel').textContent=s.diagramLabels[p];
   q('.map-result').textContent=s.diagramResultLabels[p];
   q('.volume-result').textContent=s.diagramResultLabels[p];
  }
  if(s.layout==='survey'){q('#surveyState').textContent=s.diagramLabels[p];q('#surveyCaption').textContent=s.diagramCaptions[p];q('.survey-diagram').setAttribute('aria-label',s.diagramCaptions[p]);}
  if(['mapping','spatial'].includes(s.layout))q('.spatial-viewport').setAttribute('aria-label',s.diagramResultLabels[p]);
  if(s.id==='reliability'){const descriptions=p?['배터리·충전 성능 개선','통신 가능한 거리 개선','센서 성능·장비 안정성 개선']:['다음 비행에 필요한 전력','현장과 비행 담당자의 통신','이상을 판단할 수 있는 자료'];root.querySelectorAll('.reliability-grid article').forEach((el,i)=>{el.querySelector('p').textContent=descriptions[i];el.querySelector('.reliability-status').textContent=p?'PG&E 보고서 · 개선 권고':'반복 점검에 필요한 조건';});}
  if(s.layout!=='medical')return {};
  const model=s.caseData,view=window.DRONE_CASE_CONTENT.medical(model),scenario=view.scenarios[p===2?1:0];
  const axisMax=Math.max(num('medical-axis-max'),model.drone,...model.scenarios.map(x=>x.road));
  q('#axisMax').textContent=axisMax+model.unit;
  q('#routeTitle').textContent=scenario.oneWay?'혈액원 차량이 곧바로 출발':'병원 차량이 혈액원까지 왕복';
  q('#roadMeta').textContent=scenario.label;q('#roadValue').textContent=scenario.roadText;
  q('#comparisonTitle').textContent=scenario.title;q('#comparisonCaption').textContent=scenario.caption;
  q('.comparison-delta').replaceChildren(document.createTextNode(scenario.differenceLabel+' '),Object.assign(document.createElement('strong'),{textContent:scenario.deltaText}),document.createTextNode(scenario.reference));
  return {medical:{dronePercent:model.drone/axisMax*100,roadPercent:scenario.road/axisMax*100}};
 }
 return {commit};
})();
