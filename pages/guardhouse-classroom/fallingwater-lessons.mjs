// Lesson panels for the Fallingwater sample. Each one reads the same project data the drawings and the model use.
import {rooms,steps,materials,interior,lighting,requiredFittings,houseLoad,fireStages,fireRule,requiredDetectors,requiredExtinguishers,fireRooms,stations,sheets} from './src/fallingwater-project.mjs';
import {F1,F2,F3,ROOF,PAR,BAY,CANT,JOISTS} from './src/fallingwater-model.mjs';
import {lessonSummary} from './src/lesson-catalog.mjs';
import {btn,pressed,card,actions} from './salk-lessons.mjs';
export {btn,pressed,card,actions};

const rows=list=>'<div class="salk-rows">'+list.map(([k,v])=>'<div><span>'+k+'</span><strong>'+v+'</strong></div>').join('')+'</div>';
const num=(v,d=1)=>v.toLocaleString('ko-KR',{maximumFractionDigits:d}),m=v=>v.toFixed(2)+' m';
export const rebuilt='프랭크 로이드 라이트의 낙수장(1937, 밀 런)을 학습용으로 재구성한 모델입니다. 전기·소방·에너지는 원본 설계가 아니라 이 집을 오늘 한국 기준으로 설계한다면 어떻게 되는지 새로 설계한 것입니다.';

export function home({state,electric}){
 const summary=lessonSummary({rooms,sheets,circuits:electric.circuits,steps},state.completed);
 const facts=[[summary.rooms+'개','방과 테라스'],[summary.drawings+'장','도면'],[summary.circuits+'개','분기 회로'],[m(CANT),'내민 길이']].map(([n,t])=>'<div><strong>'+n+'</strong><span>'+t+'</span></div>').join('');
 const path=steps.map((s,i)=>'<article class="lesson-card"><span class="step-number">'+(i+1)+' / '+steps.length+'</span><h3>'+s.title+'</h3><p>'+s.text+'</p>'+btn('살펴보기','go',s.menu)+'<label class="complete"><input type="checkbox" data-complete="'+s.id+'"'+(state.completed.includes(s.id)?' checked':'')+'> 학습했어요</label></article>').join('');
 return '<section class="home-intro"><div><span class="tag">교육용 샘플 7 · 재구성</span><h2>폭포 위로 내민 세 겹의 판</h2><p class="rebuilt-note">'+rebuilt+'</p>'+actions(btn('건물부터 보기','go','building','class="primary"')+btn('폭포 아래에 서 보기','go','experience'))+'<p class="small">'+summary.steps+'단계 중 '+summary.completed+'단계 학습 표시</p></div><div class="home-facts">'+facts+'</div></section>'+
  '<section class="home-preview"><img src="/pages/guardhouse-classroom/fallingwater-preview.webp" alt="폭포 위로 판을 내민 낙수장 모형" width="760" height="494" decoding="async"><div><strong>초여름 낮의 베어 런</strong><p>물이 거실 바닥 아래를 지나 폭포로 떨어집니다.</p>'+btn('계곡에서 집 보기','go','experience')+'</div></section><section class="lesson-path">'+path+'</section>';
}

export function building({selected}){
 const pick=f=>actions(rooms.filter(r=>r.floor===f).map(r=>btn(r.name,'pick',r.id,pressed(r.id===selected))).join(''));
 return card('세 층의 방과 테라스가 열다섯 곳입니다',pick(1)+pick(2)+pick(3)+rows([['1층 바닥','물 위 '+m(F1)],['2층 바닥','물 위 '+m(F2)],['3층 바닥','물 위 '+m(F3)],['지붕 꼭대기','물 위 '+m(ROOF)],['난방하는 실내',num(interior.area,1)+' m² · 1층 '+num(interior.floors[0],1)+' · 2층 '+num(interior.floors[1],1)+' · 3층 '+num(interior.floors[2],1)],['난간벽 높이',m(PAR)]]))+
  card('자른 그림에서 어긋난 판 찾기','<p>학습 도면을 A-703으로 바꾸면 돌탑에서 물 쪽으로 세 판이 차례로 내민 모습이 보입니다.</p>'+actions(btn('안방 테라스 보기','pick','room-master-terrace')+btn('물로 내려가는 계단 보기','pick','hatch-landing')+btn('구조에서 이어 보기','go','structure')));
}

export function material({selected}){
 const list=materials.map(mat=>'<div><span>'+btn(mat.name,'pick',mat.target,pressed(mat.target===selected))+'</span><strong>'+mat.text+'</strong></div>').join('');
 return card('다섯 가지 재료로 지었습니다','<div class="salk-rows">'+list+'</div>');
}

export function structure(){
 return card('받침벽 네 개에서 보가 물 위로 나갑니다',rows([['받침벽','4개 · '+m(BAY)+' 간격'],['내민 주보','4개 · 내민 길이 '+m(CANT)],['뒤집힌 장선',JOISTS.length+'개 · 1.22 m 간격'],['바닥 판','두께 0.10 m · 장선 아래에 붙음'],['난간벽','높이 '+m(PAR)+' · 판 끝을 세워 보처럼 버팀']])+actions(btn('받침벽 보기','pick','bolster-1')+btn('내민 주보 보기','pick','beam-1')+btn('장선 보기','pick','joist-4')+btn('바닥 판 보기','pick','slab-1')))+
  card('왜 판이 처졌고 어떻게 고쳤나','<p>보에 넣은 철근이 내민 길이에 견주어 모자라 판 끝이 해마다 조금씩 내려앉았습니다. 2002년에 주보 옆으로 강연선을 넣고 뒤에서 당겨 처짐을 멈췄습니다.</p>'+actions(btn('보 단면 상세 보기','pick','beam-2')+btn('이 집의 전기 보기','go','electrical')));
}

export function electrical({state,electric,selected}){
 const fit=requiredFittings(),placed=electric.devices.filter(d=>d.kind==='light'&&/^LT[1-6]$/.test(d.id)).length;
 const breakers=electric.circuits.map(c=>{const on=state.breakers[c.id]!==false;return btn(c.id+' '+c.name+' '+(on?'끄기':'켜기'),'breaker',c.id,pressed(on));}).join('');
 const switches=[['SW1','1층 조명 스위치'],['SW2','2·3층 조명 스위치']].map(([id,name])=>btn(name+' '+(state.switches[id]?'끄기':'켜기'),'switch',id,pressed(state.switches[id]))).join('');
 const body=electric.circuits.map(c=>'<tr><th scope="row">'+c.id+'</th><td>'+c.name+'</td><td>'+c.volts+' V '+(c.phase===3?'3상':'단상')+'</td><td>'+c.breaker+' A</td><td>'+c.area+' mm²</td><td>'+num(c.watts,0)+' W</td><td>'+num(c.current,2)+' A</td><td>'+c.percent.toFixed(2)+' %</td><td>'+(c.pass?'통과':'다시 검토')+'</td></tr>').join('');
 const target=electric.devices.find(d=>d.id===selected),route=electric.routes.find(r=>r.target===selected);
 return card('전기는 돌탑을 타고 세 층으로 오릅니다',actions(breakers)+actions(switches)+(target&&route?'<p>'+target.name+'까지 분전반에서 '+num(electric.circuits.find(c=>c.id===target.circuit).length,1)+' m 회로입니다.</p>':''))+
  card('거실 조명은 몇 개가 필요한가','<p class="equation">'+lighting.lux+' lx × '+num(lighting.area,1)+' m² ÷ ('+num(lighting.lumens,0)+' lm × '+lighting.use+' × '+lighting.keep+') = '+fit+'개</p>'+rows([['목표 조도','거실 전반 '+lighting.lux+' lx'],['조명 방식','천장 격자 안에 숨겨 천장을 비추는 간접 조명'],['거실에 놓은 조명',placed+'개']]))+
  card('집 한 채의 부하',rows([['연결 부하 합계',num(houseLoad(electric),0)+' W'],['가장 큰 부하','난방 히트펌프 · 380 V 3상'],['들어오는 길','진입로 쪽 땅속으로 들어와 부엌 분전반으로'],['오르는 길','굴뚝 뒤 돌탑 속 세로 배관으로 2층과 3층까지']]))+
  '<article class="bay-card"><h2>분기 회로표</h2><table><thead><tr><th>회로</th><th>이름</th><th>전원</th><th>차단기</th><th>전선</th><th>부하</th><th>전류</th><th>전압강하</th><th>판정</th></tr></thead><tbody>'+body+'</tbody></table></article>';
}

export function fire({stage,fire}){
 const list=fireStages.map((s,i)=>'<li data-on="'+(i<=stage)+'"><strong>'+(i+1)+'. '+s.title+'</strong>'+(i<=stage?'<br>'+s.text:'')+'</li>').join('');
 const counts=k=>fire.devices.filter(d=>d.kind===k).length;
 return card('감지에서 피난까지 한 번 따라가기','<ol class="salk-stages">'+list+'</ol>'+actions(btn(stage<0?'시험 연기 넣기':stage<fireStages.length-1?'다음 단계':'처음부터 다시',stage<fireStages.length-1?'advance':'reset-test','','class="primary"')+(stage>=0&&stage<fireStages.length-1?btn('되돌리기','reset-test'):'')))+
  card('주택에는 소화기와 단독경보형 감지기를 둡니다',rows([['법이 요구하는 감지기',requiredDetectors()+'개 · 방 '+fireRooms.length+'곳에 하나씩, 계단 꼭대기에 하나'],['이 설계의 감지기','연기 '+counts('smoke')+'개 · 열 '+counts('heat')+'개'],['소화기',counts('extinguisher')+'개 · 법이 요구하는 '+requiredExtinguishers()+'개는 층마다 하나, 부엌에 하나 더'],['경보음',fireRule.sound+' dB · 감지기 제 몸에서 울림'],['근거',fireRule.law],['감지기 기준',fireRule.detector]]));
}

export function experience({walking}){
 const here=stations.find(s=>s.id===walking);
 return card(here?here.name+'에 서 있습니다':'계곡 위에서 보는 집',here?'<p>드래그로 둘러보고 W A S D로 걷습니다.</p>':'<p>초여름 낮, 물이 집 아래를 지나 폭포로 떨어집니다.</p>'+actions(stations.map(s=>btn(s.name+'에 서기','walk',s.id)).join('')));
}
