"use strict";
window.DRONE_DIAGRAMS=(()=>{
  const {esc,img}=window.DRONE_UTILS;
  const geometry=()=>window.DRONE_CONTENT.geometry;
  const copy=()=>'<div class="scene-copy"><h2 class="beat-head" id="beatHead"></h2><p class="beat-text" id="beatText"></p><p class="beat-note" id="beatNote"></p></div>';
  function process(s,cls='process-visual'){
    return img(s.image,'process-photo')+`<div class="process-shade"></div><div class="${cls}">${s.nodes.map((n,i)=>`<div class="process-node" data-order="${i}"><span class="node-number">${String(i+1).padStart(2,'0')}</span><h2>${esc(n[0])}</h2><p>${esc(n[1])}</p></div>`).join('')}</div><div class="scene-band"><h2 class="beat-head" id="beatHead"></h2><p class="beat-text" id="beatText"></p><p class="beat-note" id="beatNote"></p></div>`;
  }
  function lightDots(){
    const c=geometry().lightshow;
    const paths=[c.bird,...c.feathers],points=paths.flatMap(path=>path.slice(0,-1).flatMap(([x,y],i)=>Array.from({length:c.samplesPerEdge},(_,j)=>[x+(path[i+1][0]-x)*j/c.samplesPerEdge,y+(path[i+1][1]-y)*j/c.samplesPerEdge])));
    return '<svg id="dotField" viewBox="0 0 850 500" role="img" aria-label="드론의 불빛이 자리를 바꾸며 공연 그림을 만드는 과정">'+points.map(([x,y],i)=>'<circle class="show-dot" cx="'+x+'" cy="'+y+'" data-scatter-x="'+((i*97)%800+25-x)+'" data-scatter-y="'+((i*61)%400+50-y)+'"/>').join('')+'</svg><p class="formation-caption">드론의 불빛이 자리를 바꾸며 그림을 만듭니다</p>';
  }
  const spatial=()=>window.DRONE_SPATIAL_DIAGRAMS.spatial(copy),survey=()=>window.DRONE_SPATIAL_DIAGRAMS.survey();
  return {spatial,process,lightDots,survey};
})();
