// Lesson panels for the Salk sample. Each one reads the same project data the drawings and the model use.
import {rooms,steps,materials,moduleBay,lighting,requiredFittings,blockLoad,fireStages,fireZones,sprinklerPlan,stations,sheets,safetyChecks} from './src/salk-project.mjs';
import {lessonSummary} from './src/lesson-catalog.mjs';
import {powerControls} from './masters-power.mjs';

export const btn=(text,action,value='',attrs='')=>'<button type="button" data-'+action+'="'+value+'" '+attrs+'>'+text+'</button>';
export const pressed=v=>'aria-pressed="'+Boolean(v)+'"';
export const card=(title,body)=>'<article class="bay-card"><h2>'+title+'</h2>'+body+'</article>';
export const actions=content=>'<div class="button-row">'+content+'</div>';
const rows=list=>'<div class="salk-rows">'+list.map(([k,v])=>'<div><span>'+k+'</span><strong>'+v+'</strong></div>').join('')+'</div>';
const num=(v,d=1)=>v.toLocaleString('ko-KR',{maximumFractionDigits:d});
export const rebuilt='루이스 칸의 솔크 연구소(1965, 라호이아)를 학습용으로 재구성한 모델입니다. 전기·소방·자재는 원본 설계가 아니라 이 건물을 오늘 한국 기준으로 설계한다면 어떻게 되는지 새로 설계한 것입니다.';

export function home({state,electric}){
 const summary=lessonSummary({rooms,sheets,circuits:electric.circuits,steps},state.completed);
 const facts=[[summary.rooms+'개','공간'],[summary.drawings+'장','도면'],[summary.circuits+'개','분기 회로'],['13개','층마다 트러스']].map(([n,t])=>'<div><strong>'+n+'</strong><span>'+t+'</span></div>').join('');
 const path=steps.map((s,i)=>'<article class="lesson-card"><span class="step-number">'+(i+1)+' / '+steps.length+'</span><h3>'+s.title+'</h3><p>'+s.text+'</p>'+btn('살펴보기','go',s.menu)+'<label class="complete"><input type="checkbox" data-complete="'+s.id+'"'+(state.completed.includes(s.id)?' checked':'')+'> 학습했어요</label></article>').join('');
 return '<section class="home-intro"><div><span class="tag">교육용 샘플 5 · 재구성</span><h2>설비에 한 층을 내준 연구소</h2><p class="rebuilt-note">'+rebuilt+'</p>'+actions(btn('건물부터 보기','go','building','class="primary"')+btn('설비층 걸어 보기','go','experience'))+'<p class="small">'+summary.steps+'단계 중 '+summary.completed+'단계 학습 표시</p></div><div class="home-facts">'+facts+'</div></section>'+
  '<section class="home-preview"><img src="/pages/guardhouse-classroom/salk-preview.webp" alt="서쪽 바다로 해가 지는 솔크 연구소 중정 모형" width="760" height="494" decoding="async"><div><strong>춘분 저녁의 중정</strong><p>물길 끝으로 해가 집니다.</p>'+btn('해 지는 중정에 서기','go','experience')+'</div></section><section class="lesson-path">'+path+'</section>';
}

export function building({selected}){
 const pick=rooms.map(r=>btn(r.name,'pick',r.id,pressed(r.id===selected))).join('');
 return card('두 동이 중정을 사이에 두고 마주 봅니다',actions(pick)+rows([['한 동의 실험실 바닥','74.7 × 19.8 m'],['중정 폭','27.4 m'],['층 구성','실험실 3층 + 설비층 3층'],['층고','6.10 m · 실험실 3.35 m + 설비층 2.74 m'],['연구실 탑','한 동에 5개'],['모델로 만든 범위','북쪽 동 한 동']]))+
  card('자른 그림에서 설비층 찾기','<p>학습 도면을 A-502로 바꾸면 실험실 위마다 사람이 설 수 있는 설비층이 끼어 있습니다.</p>'+actions(btn('설비층 한 칸','pick','room-pipe')+btn('구조에서 이어 보기','go','structure')));
}

export function material({selected}){
 const list=materials.map(m=>'<div><span>'+btn(m.name,'pick',m.target,pressed(m.target===selected))+'</span><strong>'+m.text+'</strong></div>').join('');
 return card('네 가지 재료로 지었습니다','<div class="salk-rows">'+list+'</div>');
}

export function structure(){
 const b=moduleBay;
 return card('대각선이 없는 트러스가 19.8 m를 건넙니다',rows([['트러스 춤','2.74 m · 설비층 높이와 같음'],['트러스 간격','6.10 m · 한 층에 13개'],['경간','19.8 m · 가운데 기둥 없음'],['트러스 구멍','한 트러스에 여섯 칸 · 사람과 배관이 지남'],['천장 슬롯','폭 254 mm · 1.52 m 간격']])+actions(btn('트러스 6 보기','pick','truss2-6')+btn('설비층 바닥 보기','pick','pipe2-floor')))+
  card('왜 한 층을 설비에 내줬나','<p>실험은 몇 년마다 바뀌고 배관도 따라 바뀝니다. 설비층에서 고치면 아래 실험실은 멈추지 않습니다.</p>'+rows([['전기 설계를 한 칸','가로 '+num(b.x1-b.x0,2)+' m × 세로 '+num(b.y1-b.y0,2)+' m'],['한 칸 넓이',num(b.area,1)+' m²'],['같은 칸','한 층 '+b.count+'칸 × '+b.floors+'층']])+actions(btn('이 칸의 전기 보기','go','electrical')));
}

export function electrical({state,electric,selected}){
 const fit=requiredFittings(),load=blockLoad(electric),placed=electric.devices.filter(d=>d.kind==='light').length*5;
 const body=electric.circuits.map(c=>'<tr><th scope="row">'+c.id+'</th><td>'+c.name+'</td><td>'+c.volts+' V '+(c.phase===3?'3상':'단상')+'</td><td>'+c.breaker+' A</td><td>'+c.area+' mm²</td><td>'+num(c.watts,0)+' W</td><td>'+num(c.current,2)+' A</td><td>'+c.percent.toFixed(2)+' %</td><td>'+(c.pass?'통과':'다시 검토')+'</td></tr>').join('');
 const target=electric.devices.find(d=>d.id===selected),route=electric.routes.find(r=>r.target===selected);
 return card('한 칸에 분기 회로 네 개',powerControls(electric,state,{unit:'열'})+(target&&route?'<p>'+target.name+'까지 분전반에서 '+num(electric.circuits.find(c=>c.id===target.circuit).length,1)+' m 회로입니다.</p>':''))+
  card('조명은 몇 개가 필요한가','<p class="equation">'+lighting.lux+' lx × '+num(lighting.area,1)+' m² ÷ ('+num(lighting.lumens,0)+' lm × '+lighting.use+' × '+lighting.keep+') = '+fit+'개</p>'+rows([['놓은 조명','6열 × 5개 = '+placed+'개'],['필요한 조명',fit+'개 이상']]))+
  card('한 칸에서 한 동으로',rows([['한 칸',num(load.bay,0)+' W'],['한 층 12칸',num(load.floor/1000,1)+' kW'],['세 층',num(load.block/1000,1)+' kW']]))+
  '<article class="bay-card"><h2>분기 회로표</h2><table><thead><tr><th>회로</th><th>이름</th><th>전원</th><th>차단기</th><th>전선</th><th>부하</th><th>전류</th><th>전압강하</th><th>판정</th></tr></thead><tbody>'+body+'</tbody></table></article>';
}

export function safety({state}){
 return card('학습 기록 '+safetyChecks.filter(([id])=>state.checks[id]).length+' / '+safetyChecks.length,'<div class="checklist">'+safetyChecks.map(([id,label])=>'<div><label><input type="checkbox" data-check="'+id+'" '+(state.checks[id]?'checked':'')+'>'+label+'</label>'+btn('관련 수업','related',id)+'</div>').join('')+'</div>');
}

export function fire({stage,fire}){
 const list=fireStages.map((s,i)=>'<li data-on="'+(i<=stage)+'"><strong>'+(i+1)+'. '+s.title+'</strong>'+(i<=stage?'<br>'+s.text:'')+'</li>').join('');
 const counts=k=>fire.devices.filter(d=>d.kind===k).length;
 return card('감지에서 피난까지 한 번 따라가기','<ol class="salk-stages">'+list+'</ol>'+actions(btn(stage<0?'시험 신호 넣기':stage<fireStages.length-1?'다음 단계':'처음부터 다시',stage<fireStages.length-1?'advance':'reset-test','','class="primary"')+(stage>=0&&stage<fireStages.length-1?btn('되돌리기','reset-test'):'')))+
  card('한 층을 경계구역 셋으로',rows([...fireZones.map(z=>[z.name,num(z.area,1)+' m²']),['연기감지기',counts('smoke')+'개'],['스프링클러 헤드','한 칸 '+sprinklerPlan.perBay+'개 · 한 층 '+sprinklerPlan.floor+'개'],['헤드 간격',num(sprinklerPlan.spacing,2)+' m']]));
}

// One stroke per circuit, in the colour the model draws its routes.
export const wireLegend=electric=>card('벽 속 전기 길','<p>분전반에서 기구까지 가는 길을 회로 색으로 겹쳐 보입니다.</p><div class="salk-rows">'+electric.circuits.map(c=>'<div><span><svg width="28" height="8" viewBox="0 0 28 8" aria-hidden="true"><line x1="2" y1="4" x2="26" y2="4" stroke="'+c.color+'" stroke-width="4" stroke-linecap="round"/></svg> '+c.id+' · '+c.name+'</span><strong>가장 먼 기구까지 '+num(c.length)+' m</strong></div>').join('')+'</div>');
export function experience({walking,wiring,electric}){
 const here=stations.find(s=>s.id===walking);
 return card(here?here.name+'에 서 있습니다':'해 지는 중정',here?'<p>드래그로 둘러보고 W A S D로 걷습니다.</p>':'<p>춘분 저녁, 해가 물길 끝 바다로 집니다.</p>'+actions(stations.map(s=>btn(s.name+'에 서기','walk',s.id)).join('')))+(wiring?wireLegend(electric):'');
}
