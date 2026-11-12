// Power controls shared by the masters samples: what is lit, why not, and what each control feeds.
// The lesson panel, the E-sheet and the status line all read the same verdict the 3D model shows.
const ids=list=>list.length>2?list[0].id+'–'+list.at(-1).id:list.map(d=>d.id).join(', ');
const why=(d,c)=>c.key==='main'?'분전반 전원 꺼짐':c.key==='breaker'?d.circuit+' 차단기 꺼짐':c.key==='switch'?'스위치 꺼짐':c.label+' 확인 필요';
const reasons=list=>[...new Set(list.flatMap(d=>d.power?.blockers.map(c=>why(d,c))??[]))];
const lamps=electric=>electric.devices.filter(d=>d.kind==='light');
const loads=(electric,id)=>electric.devices.filter(d=>d.circuit===id&&d.power);
const cell=(attr,id,lit,on,title,note)=>'<button type="button" data-'+attr+'="'+id+'" data-lit="'+Boolean(lit)+'" aria-pressed="'+Boolean(on)+'"><span>'+title+'</span><small>'+note+'</small></button>';

export function lightCount(electric){const all=lamps(electric);return {lit:all.filter(d=>d.on).length,total:all.length};}

function switchState(electric,state,d,unit){
 const linked=lamps(electric).filter(l=>l.switch===d.id),lit=linked.filter(l=>l.on).length,enabled=state.switches[d.id]!==false,blocked=reasons(linked);
 return {linked,lit,enabled,note:blocked.length?'조명 '+linked.length+unit+' 소등 · '+blocked.join(' · '):'조명 '+lit+unit+' 점등'};
}
function breakerState(electric,state,c){
 const fed=loads(electric,c.id),live=fed.filter(d=>d.on).length,closed=state.breakers[c.id]!==false;
 const note=!closed?'꺼짐 · 기구 '+fed.length+'개 정지':state.power===false?'분전반 전원 꺼짐 · 기구 '+fed.length+'개 정지':live===fed.length?'기구 '+fed.length+'개에 전기 공급':'기구 '+live+' / '+fed.length+'개 동작 · 스위치 꺼짐';
 return {fed,live,closed,note};
}

// The control bank of the electrical lesson: lit count, main power, lighting switches, then one card per breaker.
export function powerControls(electric,state,{unit='개'}={}){
 const {lit,total}=lightCount(electric),main=state.power!==false,circuits=electric.circuits;
 const hint=!main?'분전반 전원을 켜면 모든 회로에 전기가 갑니다.':lit===0?'조명 회로의 차단기와 스위치를 확인하세요.':lit<total?'꺼진 조명은 도면에서 회색, 모형에서 어둡게 보입니다.':'전원·차단기·스위치를 끄면 도면과 모형의 불이 함께 꺼집니다.';
 const switches=electric.devices.filter(d=>d.kind==='switch').map(d=>{const s=switchState(electric,state,d,unit);return cell('switch',d.id,s.lit,s.enabled,d.name+' '+(s.enabled?'켜짐':'꺼짐'),s.note);}).join('');
 const breakers=circuits.map(c=>{const b=breakerState(electric,state,c);return cell('breaker',c.id,b.closed&&main,b.closed,c.id+' '+c.name+' 차단기 '+(b.closed?'켜짐':'꺼짐'),b.note);}).join('');
 return '<p class="lighting-summary" role="status">조명 '+lit+' / '+total+unit+' 점등 · '+hint+'</p>'+
  '<div class="button-row switch-bank">'+cell('power','main',main,main,'분전반 '+electric.panel.id+' 전원 '+(main?'켜짐':'꺼짐'),main?'회로 '+circuits.length+'개에 전기 공급':'모든 회로 정지')+switches+'<h3>분기 차단기</h3>'+breakers+'</div>';
}

// One line for the status bar after a control is pressed: what changed and which fittings followed it.
export function powerStatus(electric,state,kind,id,{unit='개'}={}){
 const {lit,total}=lightCount(electric);
 if(kind==='power')return '분전반 전원 '+(state.power!==false?'켜짐':'꺼짐')+' · 조명 '+lit+' / '+total+unit+' 점등';
 if(kind==='breaker'){const b=breakerState(electric,state,electric.circuits.find(c=>c.id===id));return id+' 차단기 '+(b.closed?'켜짐':'꺼짐')+' · 연결 기구 '+ids(b.fed)+' '+(b.live===b.fed.length?'동작':b.live?b.live+'개 동작':'정지');}
 const d=electric.devices.find(x=>x.id===id),s=switchState(electric,state,d,unit),blocked=reasons(s.linked).filter(r=>r!=='스위치 꺼짐');
 return d.name+' '+(s.enabled?'켜짐':'꺼짐')+' · 연결 조명 '+ids(s.linked)+' '+(s.lit?'점등':'소등'+(s.enabled&&blocked.length?' ('+blocked.join(' · ')+')':''));
}

// Drawing helpers for the E-sheets. A lit lamp is amber inside a halo; a lamp without power is grey.
export const plan={lit:'#ffc64a',halo:'#ffb400',dead:'#aeb5b8',off:'#c9ced0',on:'#bfe9d3',mute:'#6f777b'};
export const halo=(cx,cy,r=12)=>'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+plan.halo+'" opacity=".32" pointer-events="none"/>';
export const lampFill=d=>d.on===false?plan.off:plan.lit;
// A wire carries current when its breaker is closed, the panel is fed and, for a switched lamp, the switch is closed.
export function routeLive(electric,state,route){
 const d=electric.devices.find(x=>x.id===route.target);
 return state?.power!==false&&state?.breakers?.[route.circuit]!==false&&(!d||d.kind==='switch'||d.on!==false);
}
export const circuitLive=(state,id)=>state?.power!==false&&state?.breakers?.[id]!==false;
// A lamp's fill always tells on from off; its outline tells whether it, or the switch that feeds it, is picked.
export const lampInk=(d,id,ink)=>{const pick=d.id===id||d.switch===id;return 'fill="'+lampFill(d)+'" stroke="'+(pick?ink.pickLine:ink.line)+'" stroke-width="'+(pick?2.5:1)+'"';};
// Every route of the sheet with its colour, width and dash: all stay drawn, dead ones grey, picked ones last and thick.
export function routeInk(electric,state,id,color,{thin=1.8,thick=4}={}){
 const pick=r=>{const d=electric.devices.find(x=>x.id===r.target);return r.target===id||d?.switch===id;};
 return [...electric.routes].sort((a,b)=>pick(a)-pick(b)).map(r=>{const live=routeLive(electric,state,r);return {route:r,color:live?color[r.circuit]:plan.dead,width:pick(r)?thick:thin,dash:live?'':'4 3'};});
}
// One legend line of a circuit: its colour while live, grey and marked 꺼짐 once the breaker or the panel is off.
export const legendInk=(state,c,ink)=>{const live=circuitLive(state,c.id);return {live,stroke:'stroke="'+(live?c.color:plan.dead)+'"'+(live?'':' stroke-dasharray="4 3"'),name:c.id+' · '+c.name+(live?'':' · 꺼짐'),fill:live?ink.text:plan.mute};};
export const lampNote=(electric,unit='개')=>{const {lit,total}=lightCount(electric);return '조명 '+lit+' / '+total+unit+' 점등 · 끊긴 길은 회색 점선';};
