// Lesson panels for the Yumin museum sample. Each one reads the same project data the drawings and the model use.
import {rooms,steps,materials,interior,lighting,requiredFittings,museumLoad,fireStages,safetyChecks,fireRule,fireZones,sprinklerPlan,counts,stations,sheets} from './src/yumin-project.mjs';
import {B1,TOP,CEIL,LOW,STONE,SCREEN,ROUND,SPAN,BAY,DEPTH,RAIL} from './src/yumin-model.mjs';
import {lessonSummary} from './src/lesson-catalog.mjs';
import {btn,pressed,card,actions,wireLegend} from './salk-lessons.mjs';
import {powerControls} from './masters-power.mjs';
export {btn,pressed,card,actions};

const rows=list=>'<div class="salk-rows">'+list.map(([k,v])=>'<div><span>'+k+'</span><strong>'+v+'</strong></div>').join('')+'</div>';
const num=(v,d=1)=>v.toLocaleString('ko-KR',{maximumFractionDigits:d}),m=v=>v.toFixed(2)+' m';
export const rebuilt='안도 다다오의 유민미술관(2009, 제주 섭지코지)을 학습용으로 재구성한 모델입니다. 전기·소방·에너지는 원본 설계가 아니라 이 건물을 오늘 한국 기준으로 설계한다면 어떻게 되는지 새로 설계한 것입니다.';

export function home({state,electric}){
 const summary=lessonSummary({rooms,sheets,circuits:electric.circuits,steps},state.completed);
 const facts=[[summary.rooms+'곳','방과 바깥 길'],[summary.drawings+'장','도면'],[summary.circuits+'개','분기 회로'],[fireRule.people+'명','수용인원']].map(([n,t])=>'<div><strong>'+n+'</strong><span>'+t+'</span></div>').join('');
 const path=steps.map((s,i)=>'<article class="lesson-card"><span class="step-number">'+(i+1)+' / '+steps.length+'</span><h3>'+s.title+'</h3><p>'+s.text+'</p>'+btn('살펴보기','go',s.menu)+'<label class="complete"><input type="checkbox" data-complete="'+s.id+'"'+(state.completed.includes(s.id)?' checked':'')+'> 학습했어요</label></article>').join('');
 return '<section class="home-intro"><div><span class="tag">교육용 샘플 8 · 재구성</span><h2>현무암 벽 안으로 내려가는 콘크리트 네모</h2><p class="rebuilt-note">'+rebuilt+'</p>'+actions(btn('건물부터 보기','go','building','class="primary"')+btn('물의 통로에 서 보기','go','experience'))+'<p class="small">'+summary.steps+'단계 중 '+summary.completed+'단계 학습 표시</p></div><div class="home-facts">'+facts+'</div></section>'+
  '<section class="home-preview"><img src="/pages/guardhouse-classroom/yumin-preview.webp" alt="현무암 벽에 둘러싸인 유민미술관 모형과 바다 건너 성산일출봉" width="760" height="494" decoding="async"><div><strong>초여름 오후의 섭지코지</strong><p>건물의 축이 바다 건너 성산일출봉을 향합니다.</p>'+btn('돌의 문에서 걸어 보기','go','experience')+'</div></section><section class="lesson-path">'+path+'</section>';
}

export function building({selected}){
 const pick=f=>actions(rooms.filter(f).map(r=>btn(r.name,'pick',r.id,pressed(r.id===selected))).join(''));
 return card('지하 아홉 방, 1층 세 방, 바깥 길 셋',pick(r=>r.floor===-1&&r.heated)+pick(r=>r.floor===1&&r.heated)+pick(r=>!r.heated)+rows([['지하 바닥','땅 아래 '+m(-B1)],['낮은 천장','지하 바닥 위 '+m(LOW-B1)],['높은 전시실 천장','지하 바닥 위 '+m(CEIL-B1)],['지붕 꼭대기','땅 위 '+m(TOP)],['현무암 바깥 벽','땅 위 '+m(STONE)],['북쪽 가벽','땅 위 '+m(SCREEN)],['난방하는 실내',num(interior.area,0)+' m² · 지하 '+num(interior.b1,0)+' · 1층 '+num(interior.f1,0)]]))+
  card('자른 그림에서 높은 방 찾기','<p>학습 도면을 A-803으로 바꾸면 동쪽 두 전시실이 지하 바닥에서 지붕 밑까지 한 번에 트인 모습이 보입니다.</p>'+actions(btn('제1전시실 보기','pick','room-ne')+btn('야외 경사로 보기','pick','room-ramp')+btn('구조에서 이어 보기','go','structure')));
}

export function material({selected}){
 const list=materials.map(mat=>'<div><span>'+btn(mat.name,'pick',mat.target,pressed(mat.target===selected))+'</span><strong>'+mat.text+'</strong></div>').join('');
 return card('다섯 가지 재료로 지었습니다','<div class="salk-rows">'+list+'</div>');
}

export function structure(){
 return card('높은 전시실 지붕은 보 세 개가 받칩니다',rows([['지붕 보','전시실마다 3개 · '+m(BAY)+' 간격'],['건너는 길이',m(SPAN)+' · 벽에서 벽까지'],['보 깊이',m(DEPTH)+' · 지붕 판 0.25 m 포함'],['받치는 벽','두께 0.40 m 노출 콘크리트'],['둥근 방','지름 '+m(2*ROUND)+' · 둥근 벽이 1층 바닥 판을 받침'],['난간','높이 '+m(RAIL)]])+actions(btn('제1전시실 보 보기','pick','beam-ne-1')+btn('제3전시실 보 보기','pick','beam-se-2')+btn('받치는 벽 보기','pick','core-e')))+
  card('왜 보가 이만큼 깊은가','<p>기둥 없이 11.6 m를 건너면 가운데가 가장 크게 휩니다. 보 깊이를 건너는 길이의 10분의 1쯤으로 잡아 처짐을 줄였습니다.</p>'+actions(btn('보 단면 상세 보기','pick','beam-ne-2')+btn('보 계산해 보기','go','calculations')+btn('이 건물의 전기 보기','go','electrical')));
}

export function electrical({state,electric,selected}){
 const fit=requiredFittings(),placed=electric.devices.filter(d=>d.kind==='light'&&d.name.startsWith('제1전시실')).length;
 const body=electric.circuits.map(c=>'<tr><th scope="row">'+c.id+'</th><td>'+c.name+'</td><td>'+c.volts+' V '+(c.phase===3?'3상':'단상')+'</td><td>'+c.breaker+' A</td><td>'+c.area+' mm²</td><td>'+num(c.watts,0)+' W</td><td>'+num(c.current,2)+' A</td><td>'+c.percent.toFixed(2)+' %</td><td>'+(c.pass?'통과':'다시 검토')+'</td></tr>').join('');
 const target=electric.devices.find(d=>d.id===selected),route=electric.routes.find(r=>r.target===selected);
 return card('전기는 지하 전기실에서 세 갈래로 나갑니다',powerControls(electric,state)+(target&&route?'<p>'+target.name+'까지 분전반에서 '+num(electric.circuits.find(c=>c.id===target.circuit).length,1)+' m 회로입니다.</p>':''))+
  card('제1전시실 조명은 몇 개가 필요한가','<p class="equation">'+lighting.lux+' lx × '+num(lighting.area,1)+' m² ÷ ('+num(lighting.lumens,0)+' lm × '+lighting.use+' × '+lighting.keep+') = '+fit+'개</p>'+rows([['목표 조도','전시실 전반 '+lighting.lux+' lx · KS A 3011 분류 F의 낮은 값'],['조명 방식','보 사이 칸마다 세 개씩 지붕 판 밑에 붙인 선형 조명'],['제1전시실에 놓은 조명',placed+'개']]))+
  card('미술관 한 채의 부하',rows([['연결 부하 합계',num(museumLoad(electric),0)+' W'],['가장 큰 부하','공조기 · 380 V 3상'],['들어오는 길','남쪽 땅속에서 지하 바닥 밑으로 들어와 전기실 분전반으로'],['나가는 길','콘센트와 기계는 바닥 판 속, 낮은 천장 조명은 천장 속, 높은 전시실 조명은 벽 속으로 올라가 지붕 판 밑으로']]))+
  '<article class="bay-card"><h2>분기 회로표</h2><table><thead><tr><th>회로</th><th>이름</th><th>전원</th><th>차단기</th><th>전선</th><th>부하</th><th>전류</th><th>전압강하</th><th>판정</th></tr></thead><tbody>'+body+'</tbody></table></article>';
}

export function fire({stage}){
 const list=fireStages.map((s,i)=>'<li data-on="'+(i<=stage)+'"><strong>'+(i+1)+'. '+s.title+'</strong>'+(i<=stage?'<br>'+s.text:'')+'</li>').join('');
 return card('감지에서 피난까지 한 번 따라가기','<ol class="salk-stages">'+list+'</ol>'+actions(btn(stage<0?'시험 연기 넣기':stage<fireStages.length-1?'다음 단계':'처음부터 다시',stage<fireStages.length-1?'advance':'reset-test','','class="primary"')+(stage>=0&&stage<fireStages.length-1?btn('되돌리기','reset-test'):'')))+
  card('수용인원 '+fireRule.people+'명이 설비를 정합니다','<p class="equation">연면적 '+num(fireRule.area,0)+' m² ÷ '+fireRule.perPerson+' m² = '+fireRule.people+'명</p>'+rows([['용도',fireRule.use],...fireRule.basis,['근거','소방시설 설치 및 관리에 관한 법률 시행령 별표 4 · 수용인원은 별표 7']]))+
  card('이 설계에 놓은 소방 기구',rows([['연기감지기',counts('smoke')+'개 · 높은 전시실은 보 사이 칸마다 하나'],['경계구역',fireZones.length+'곳 · 지하 동쪽, 지하 서쪽, 1층'],['발신기·경종·시각경보기',counts('callpoint')+'조 · 경계구역마다 하나'],['스프링클러 헤드',sprinklerPlan.count+'개 · 수평거리 '+sprinklerPlan.radius+' m, 간격 '+sprinklerPlan.spacing.toFixed(2)+' m 이하'],['헤드를 두지 않는 곳',sprinklerPlan.dry],['옥내소화전',counts('hydrant')+'개'],['유도등',counts('exit')+'개 · 피난구 3, 통로 5'],['비상조명등',counts('emergency')+'개 · 지하층'],['소화기',counts('extinguisher')+'개 · 보행거리 20 m 이내'],['감지기 기준','NFTC 203 · 연기감지기는 부착 높이 4 m 미만 150 m², 4 m 이상 20 m 미만 75 m²마다 1개'],['헤드 기준','NFTC 103 · 내화구조 수평거리 2.3 m']]));
}

// 직접 확인한 항목만 표시한다. 관련 수업 버튼은 그 항목의 메뉴와 대상을 연다.
export function safety({state}){
 return card('학습 기록 '+safetyChecks.filter(([id])=>state.checks[id]).length+' / '+safetyChecks.length,'<div class="checklist">'+safetyChecks.map(([id,label])=>'<div><label><input type="checkbox" data-check="'+id+'" '+(state.checks[id]?'checked':'')+'>'+label+'</label>'+btn('관련 수업','related',id)+'</div>').join('')+'</div>');
}

export function experience({walking,wiring,electric}){
 const here=stations.find(s=>s.id===walking);
 return card(here?here.name+'에 서 있습니다':'섭지코지에서 보는 미술관',here?'<p>드래그로 둘러보고 W A S D로 걷습니다.</p>':'<p>초여름 오후, 돌의 문에서 물의 통로를 지나 경사로로 내려갑니다.</p>'+actions(stations.map(s=>btn(s.name+'에 서기','walk',s.id)).join('')))+(wiring?wireLegend(electric):'');
}
