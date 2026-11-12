// Lesson panels for the Farnsworth sample. Each one reads the same project data the drawings and the model use.
import {rooms,steps,materials,interior,lighting,requiredFittings,houseLoad,fireStages,fireRule,requiredDetectors,stations,sheets} from './src/farnsworth-project.mjs';
import {L,W,FLOOR,CLEAR,TZ,BAY,CANT} from './src/farnsworth-model.mjs';
import {lessonSummary} from './src/lesson-catalog.mjs';
import {btn,pressed,card,actions,wireLegend} from './salk-lessons.mjs';
import {powerControls} from './masters-power.mjs';
export {btn,pressed,card,actions};

const rows=list=>'<div class="salk-rows">'+list.map(([k,v])=>'<div><span>'+k+'</span><strong>'+v+'</strong></div>').join('')+'</div>';
const num=(v,d=1)=>v.toLocaleString('ko-KR',{maximumFractionDigits:d}),m=v=>v.toFixed(2)+' m';
export const rebuilt='미스 반 데어 로에의 판스워스 주택(1951, 플레이노)을 학습용으로 재구성한 모델입니다. 전기·소방·에너지는 원본 설계가 아니라 이 집을 오늘 한국 기준으로 설계한다면 어떻게 되는지 새로 설계한 것입니다.';

export function home({state,electric}){
 const summary=lessonSummary({rooms,sheets,circuits:electric.circuits,steps},state.completed);
 const facts=[[summary.rooms+'개','자리'],[summary.drawings+'장','도면'],[summary.circuits+'개','분기 회로'],['8개','기둥']].map(([n,t])=>'<div><strong>'+n+'</strong><span>'+t+'</span></div>').join('');
 const path=steps.map((s,i)=>'<article class="lesson-card"><span class="step-number">'+(i+1)+' / '+steps.length+'</span><h3>'+s.title+'</h3><p>'+s.text+'</p>'+btn('살펴보기','go',s.menu)+'<label class="complete"><input type="checkbox" data-complete="'+s.id+'"'+(state.completed.includes(s.id)?' checked':'')+'> 학습했어요</label></article>').join('');
 return '<section class="home-intro"><div><span class="tag">교육용 샘플 6 · 재구성</span><h2>기둥 여덟 개가 붙잡은 유리 집</h2><p class="rebuilt-note">'+rebuilt+'</p>'+actions(btn('건물부터 보기','go','building','class="primary"')+btn('집 안에 서 보기','go','experience'))+'<p class="small">'+summary.steps+'단계 중 '+summary.completed+'단계 학습 표시</p></div><div class="home-facts">'+facts+'</div></section>'+
  '<section class="home-preview"><img src="/pages/guardhouse-classroom/farnsworth-preview.webp" alt="강가 풀밭 위에 떠 있는 판스워스 주택 모형" width="760" height="494" decoding="async"><div><strong>하지 오후의 강가</strong><p>풀밭 위 1.6 m에 집이 떠 있습니다.</p>'+btn('풀밭에서 집 보기','go','experience')+'</div></section><section class="lesson-path">'+path+'</section>';
}

export function building({selected}){
 const pick=rooms.map(r=>btn(r.name,'pick',r.id,pressed(r.id===selected))).join('');
 return card('벽 없는 한 방에 자리가 일곱 곳입니다',actions(pick)+rows([['지붕과 바닥 판',num(L,2)+' × '+num(W,2)+' m'],['유리로 둘러싼 실내',num(interior.x1-interior.x0,2)+' × '+num(interior.y1-interior.y0,2)+' m · '+num(interior.area,1)+' m²'],['집 바닥 높이','땅 위 '+m(FLOOR)],['천장 높이',m(CLEAR)],['아래 테라스 높이','땅 위 '+m(TZ)],['계단','테라스까지 4단 · 베란다까지 5단']]))+
  card('자른 그림에서 세 판 찾기','<p>학습 도면을 A-602로 바꾸면 테라스, 집 바닥, 지붕이 땅 위에 차례로 떠 있습니다.</p>'+actions(btn('집 바닥 보기','pick','floor-travertine')+btn('구조에서 이어 보기','go','structure')));
}

export function material({selected}){
 const list=materials.map(mat=>'<div><span>'+btn(mat.name,'pick',mat.target,pressed(mat.target===selected))+'</span><strong>'+mat.text+'</strong></div>').join('');
 return card('네 가지 재료로 지었습니다','<div class="salk-rows">'+list+'</div>');
}

export function structure(){
 return card('기둥 여덟 개가 두 판을 옆에서 붙잡습니다',rows([['기둥','H형강 8개 · 한 줄에 4개'],['기둥 간격',m(BAY)],['양 끝 내민 길이',m(CANT)],['바닥 가로보','13개 · '+m(BAY/4)+' 간격'],['테두리보','ㄷ형강 · 춤 381 mm'],['아래 테라스','받침 6곳 · 가로보 9개']])+actions(btn('기둥 보기','pick','col-s2')+btn('테두리보 보기','pick','floor-fascia-s')+btn('가로보 보기','pick','girder-f5')))+
  card('왜 판이 떠 보이나','<p>기둥이 판을 뚫고 올라가지 않고 테두리보 바깥면에 용접으로 붙어서, 바닥과 지붕이 끊기지 않은 한 장으로 보입니다.</p>'+actions(btn('접합 상세 보기','pick','roof-fascia-s')+btn('이 집의 전기 보기','go','electrical')));
}

export function electrical({state,electric,selected}){
 const fit=requiredFittings(),placed=electric.devices.filter(d=>d.kind==='light').length;
 const body=electric.circuits.map(c=>'<tr><th scope="row">'+c.id+'</th><td>'+c.name+'</td><td>'+c.volts+' V '+(c.phase===3?'3상':'단상')+'</td><td>'+c.breaker+' A</td><td>'+c.area+' mm²</td><td>'+num(c.watts,0)+' W</td><td>'+num(c.current,2)+' A</td><td>'+c.percent.toFixed(2)+' %</td><td>'+(c.pass?'통과':'다시 검토')+'</td></tr>').join('');
 const target=electric.devices.find(d=>d.id===selected),route=electric.routes.find(r=>r.target===selected);
 return card('벽이 없어 전기는 바닥과 코어로 다닙니다',powerControls(electric,state)+(target&&route?'<p>'+target.name+'까지 분전반에서 '+num(electric.circuits.find(c=>c.id===target.circuit).length,1)+' m 회로입니다.</p>':''))+
  card('조명은 몇 개가 필요한가','<p class="equation">'+lighting.lux+' lx × '+num(lighting.area,1)+' m² ÷ ('+num(lighting.lumens,0)+' lm × '+lighting.use+' × '+lighting.keep+') = '+fit+'개</p>'+rows([['목표 조도','거실 전반 '+lighting.lux+' lx'],['조명 방식','코어와 옷장 위에서 천장을 비추는 간접 조명'],['놓은 조명',placed+'개']]))+
  card('집 한 채의 부하',rows([['연결 부하 합계',num(houseLoad(electric),0)+' W'],['가장 큰 부하','바닥 난방 히트펌프 · 380 V 3상'],['들어오는 길','설비 원통으로 올라와 코어 안 분전반으로']]))+
  '<article class="bay-card"><h2>분기 회로표</h2><table><thead><tr><th>회로</th><th>이름</th><th>전원</th><th>차단기</th><th>전선</th><th>부하</th><th>전류</th><th>전압강하</th><th>판정</th></tr></thead><tbody>'+body+'</tbody></table></article>';
}

export function fire({stage,fire}){
 const list=fireStages.map((s,i)=>'<li data-on="'+(i<=stage)+'"><strong>'+(i+1)+'. '+s.title+'</strong>'+(i<=stage?'<br>'+s.text:'')+'</li>').join('');
 const counts=k=>fire.devices.filter(d=>d.kind===k).length;
 return card('감지에서 피난까지 한 번 따라가기','<ol class="salk-stages">'+list+'</ol>'+actions(btn(stage<0?'시험 연기 넣기':stage<fireStages.length-1?'다음 단계':'처음부터 다시',stage<fireStages.length-1?'advance':'reset-test','','class="primary"')+(stage>=0&&stage<fireStages.length-1?btn('되돌리기','reset-test'):'')))+
  card('주택에는 소화기와 단독경보형 감지기를 둡니다',rows([['법이 요구하는 감지기',requiredDetectors()+'개 · 실내 '+num(interior.area,1)+' m²가 '+fireRule.room+' m² 이하'],['이 설계의 감지기','연기 '+counts('smoke')+'개 · 열 '+counts('heat')+'개'],['소화기',counts('extinguisher')+'개 · 현관과 부엌'],['경보음',fireRule.sound+' dB · 감지기 제 몸에서 울림'],['근거',fireRule.law],['감지기 기준',fireRule.detector]]));
}

export function experience({walking,wiring,electric}){
 const here=stations.find(s=>s.id===walking);
 return card(here?here.name+'에 서 있습니다':'강가 풀밭에서 보는 집',here?'<p>드래그로 둘러보고 W A S D로 걷습니다.</p>':'<p>하지 오후, 유리 너머로 반대편 풀밭이 비칩니다.</p>'+actions(stations.map(s=>btn(s.name+'에 서기','walk',s.id)).join('')))+(wiring?wireLegend(electric):'');
}
