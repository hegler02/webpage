import {mountExperienceTools,showScenePreview,selectionDimensions} from './workspace-ui.mjs';
import {mountSamples,mountGlossary} from './learning-shell.mjs';
import {bay,rooms,sheets,steps,circuits,bayModel,termTargets,panel,equipment,fireDevices,fireStages,glossary,safetyChecks,escapePath,signalPath,alarmPath,freshBay,bayElectrical} from './src/cleanroom-project.mjs';
import {assemblies,slabDesign,stripBars} from './src/cleanroom-construction.mjs';
import {lessonSummary} from './src/lesson-catalog.mjs';
import {readStored,writeStored} from './reader-state.mjs';
import {bindActions} from './action-events.mjs';
import {bayLesson} from './src/cleanroom-lessons.mjs';
import {bayTerms} from './src/cleanroom-glossary.mjs';
import {bayFire,extinguisher} from './src/cleanroom-fire.mjs';
import {bayCalculationHTML,lessonSteps,restoreBayReader} from './cleanroom-calculations.mjs';
import {bayPlan} from './cleanroom-plan.mjs';
import {AlarmOutput} from './alarm-output.mjs';
import {fireSimulationResult} from './src/fire-simulation.mjs';

const $=id=>document.getElementById(id);
const key='space-electricity-cleanroom-03-v1';
const homePreview=new URL('./cleanroom-preview.png',import.meta.url).href;
let saved;
try{saved=JSON.parse(localStorage.getItem(key));}catch{}
const state=freshBay(saved),audio=new AlarmOutput();
let simPower={mains:true,battery:true,signal:null},returnPage='',readingView='one',planZoom=1,layoutMode='split',experienceView='outside',night=false;
audio.enabled=false;
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{$('bay-status').textContent='이 브라우저에서 학습 기록을 저장할 수 없습니다.';}};
const pages={
  home:['반도체 클린룸의 전기설비','작업대 위에서 조명과 팬을 찾고 두 설비에 전기가 어떻게 공급되는지 살펴보세요.'],
  building:['두 개의 문을 지나 작업구역으로','전실의 분전반과 작업대 위 팬을 찾아보세요. 기구를 고르면 평면도와 3D에서 같은 위치가 표시됩니다.'],
  materials:['클린룸의 벽과 바닥 단면','벽 패널과 바닥을 골라 마감재 안쪽에 어떤 층이 있는지 살펴보세요.'],
  structure:['작업구역 바닥판 속 철근','평면도의 표시 구간을 3D로 꺼내 콘크리트와 하부 철근을 비교하세요.'],
  calculations:['회로와 바닥판 계산','기구의 입력전력이나 바닥 사용하중을 바꾸면 같은 조건이 계산에 반영됩니다.'],
  experience:['클린룸 안으로 들어가 보세요','눈높이 1.6 m에서 작업대를 보고, 시선을 올려 조명과 팬의 위치를 확인하세요.'],
  electrical:['조명을 꺼도 팬은 돌아갈까요?','각 차단기를 조작해 보고, 입력전력을 바꾸면 어느 회로의 설계 전류가 달라지는지 확인하세요.'],
  fire:['감지기에서 출구까지','먼저 기구의 위치를 확인하세요. 작동 시험을 열면 신호가 전달되는 순서를 볼 수 있습니다.'],
  'fire-signal':['화재 신호 작동 시험','단계마다 다음 장치를 확인한 뒤 진행하세요. 신호선과 사람이 걷는 피난 경로를 색으로 구분했습니다.'],
  test:['연기 발생부터 대피까지','연기를 발생시키고 감지·경보를 확인한 뒤 피난 또는 초기 소화 조작을 체험하세요.'],
  safety:['클린룸 학습 점검','직접 확인한 항목에 표시하세요. 이 브라우저에 학습 기록을 저장합니다.'],
  glossary:['클린룸 용어사전','기구 이름과 전기 계산에 쓰이는 말을 찾아보세요.']
};
let tab='',selected='FFU1',electricalId='FFU1',fireId='SD3',step=0,stage=-1,scene=null,loading=null,epoch=0,reloadRequired=false;
const reader=restoreBayReader(readStored(()=>localStorage,key+'-reader'));
electricalId=reader.device;readingView=reader.view;
let assembly='wall',layer=0,display='both',calcMode=reader.mode,formula=reader.index,termReturn='',buildingId='room-work',drawing='A-301',focusOnOpen=null;
const building=bayModel();
const persistReader=()=>writeStored(()=>localStorage,key+'-reader',{mode:calcMode,device:electricalId,step:bayLesson(state,calcMode,electricalId).steps[formula]?.id,view:readingView});
const firePage=()=>['fire','test','fire-signal'].includes(tab);
const btn=(text,action,value='',attrs='')=>'<button type="button" data-'+action+'="'+value+'" '+attrs+'>'+text+'</button>';
const pressed=value=>'aria-pressed="'+value+'"';
const card=(title,body)=>'<article class="bay-card"><h2>'+title+'</h2>'+body+'</article>';
const actions=content=>'<div class="button-row">'+content+'</div>';
const lookup=id=>[panel,...equipment,...fireDevices,extinguisher,...rooms,...building.elements].find(d=>d.id===id);
function frame(){
  const electric=bayElectrical(state),route=electric.routes.find(r=>r.target===electricalId);
  let path=[],color='#177e88';
  if(tab==='electrical'&&step>0){path=step===1?route.points.slice(0,2):step===2?route.points.slice(0,-1):route.points;color=electric.circuits.find(c=>c.id===route.circuit).color;}
  if(tab==='fire'&&selected==='EX3'||tab==='fire-signal'&&stage===3){path=escapePath;color='#198366';}
  else if(tab==='fire-signal'&&stage===1||tab==='fire'&&selected==='RP3'){path=signalPath;color='#ba623c';}
  else if(tab==='fire-signal'&&stage===2||tab==='fire'&&selected==='ALM3'){path=alarmPath;color='#ba623c';}
  return {electric,fire:bayFire(simPower),tab:tab==='experience'&&experienceView==='sheet'?'building':tab,experienceView,night,sheet:drawing,id:tab==='building'&&materialLocation?assemblies[materialLocation].target:selected,path,color,assembly,layer,display,alarm:tab==='fire-signal'&&stage>=2};
}
function deviceButtons(list){return list.map(d=>btn((d.bounds?'':d.id+' · ')+d.name,'pick',d.id,pressed(selected===d.id))).join('');}
const termLink=id=>btn((bayTerms.get(id)?.term??id)+' 뜻','term',id);
function renderLesson(f){
  const data=lookup(selected),c=f.electric.circuits.find(c=>c.id===lookup(electricalId).circuit);
  const load=f.electric.devices.find(d=>d.id===electricalId);
  if(tab==='home'){const summary=lessonSummary({rooms,sheets,circuits,steps},state.completed);return '<section class="home-intro"><div><span class="tag">건축에서 전기·소방·안전점검까지, 하나의 공간으로 배우다.</span><h2>이 클린룸이 세 번째 교재입니다.</h2><p>전실과 작업구역을 연결하고 조명·팬 전원과 소방 신호를 살펴봅니다.</p>'+actions(btn('레슨 03 시작','go','building','class="primary"')+btn('실내 둘러보기','go','experience'))+'<p class="small">'+summary.steps+'단계 중 '+summary.completed+'단계 학습 표시 · 표시한 내용은 이 브라우저에 저장됩니다.</p></div><div class="home-facts">'+[[summary.rooms,'개','공간'],[summary.drawings,'장','연결 도면'],[summary.circuits,'개','전기 회로']].map(([n,u,t])=>'<div><strong>'+n+u+'</strong><span>'+t+'</span></div>').join('')+'</div></section><section class="home-preview"><img src="'+homePreview+'" alt="전실과 작업대·팬 필터 유닛을 갖춘 클린룸 3D 모형" width="760" height="494" decoding="async"><div><strong>어디부터 살펴볼까요?</strong><p>전실에서 작업구역까지, 같은 공간의 도면과 입체 모습을 연결해 보세요.</p>'+actions(btn('도면과 3D 열기','go','building','class="primary"'))+'</div></section><section class="lesson-path">'+steps.map((s,i)=>'<article class="lesson-card"><span class="step-number">'+(i+1)+' / '+summary.steps+'</span><h3>'+s.title+'</h3><p>'+s.text+'</p>'+actions(btn('살펴보기','go',s.menu)+'<label class="complete"><input type="checkbox" data-complete="'+s.id+'" '+(state.completed.includes(s.id)?'checked':'')+'> 학습했어요</label>')+'</article>').join('')+'</section>';}
  if(tab==='materials'){
    const item=assemblies[assembly], [name,mm,,desc]=item.layers[layer];
    return card(name+' · '+mm+' mm','<p>'+desc+'</p><p>'+item.name+'의 전체 두께는 '+Number(item.layers.reduce((a,v)=>a+v[1],0).toFixed(2))+' mm입니다. 단면 사이의 빈 간격은 겹쳐진 면을 구분하기 위한 표시입니다.</p>'+actions(item.layers.map(([n],i)=>btn(n,'layer',i,pressed(layer===i))).join('')+btn('건물에서 위치 확인','locate-material',assembly)));
  }
  if(tab==='structure'){
    const d=slabDesign;
    return card('작업구역 대표 바닥판','<p>바닥의 폭 1 m, 길이 '+d.span+' m를 잘라 본 예제입니다. 두께 '+d.thickness+' mm 바닥판 아랫부분에 지름 '+d.diameter+' mm 철근을 '+d.spacing+' mm 간격으로 놓았습니다. 긴 방향 '+stripBars().filter(([a,b])=>a[0]===b[0]).length+'개가 이 띠의 휨 계산에 쓰입니다.</p>'+actions(btn('바닥판 계산 열기','open-calc','slab')+termLink('rebar')));
  }
  if(tab==='calculations'){
    const result=bayCalculationHTML(state,calcMode,electricalId,formula,readingView),slab=calcMode==='slab';
    formula=Math.max(0,Math.min(result.lesson.steps.length-1,formula));persistReader();
    return card('계산할 조건',actions(btn('전기 회로','calc-mode','electric',pressed(!slab))+btn('구조 바닥판','calc-mode','slab',pressed(slab)))+(slab?'<form id="bay-live"><label>사용하중 (kN/m²) <input type="number" name="live" required min="0" max="10" step=".1" value="'+state.live+'"></label><button>조건 적용</button></form>':actions(f.electric.circuits.map(b=>btn(b.id+' · '+b.name,'calc-circuit',b.id,pressed(b.id===c.id))).join('')))) + result.html;
  }
  if(tab==='experience')return card('눈높이로 설비 찾기','<p>3D 아래의 이동 버튼 또는 W·A·S·D 키로 이동합니다. 드래그해 시선을 돌리고 전실과 작업대를 비교해 보세요.</p>'+actions(f.electric.circuits.map(b=>btn(b.id+' '+b.name+' 차단기 '+(state.breakers[b.id]?'켜짐':'꺼짐'),'breaker',b.id,pressed(state.breakers[b.id]))).join('')));
  if(tab==='building'&&materialLocation)return card(assemblies[materialLocation].name,'<p>모형의 테두리가 단면을 채취한 위치입니다.</p>'+actions(btn('재료 단면으로 돌아가기','go','materials')));
  if(tab==='building'){const d=data??rooms[1];const dimensions=d.bounds?'내부 '+(d.bounds[2]-d.bounds[0]).toFixed(2)+' × '+(d.bounds[3]-d.bounds[1]).toFixed(2)+' m':d.footprint?'하단 '+Math.round(d.base*1000)+' mm · 높이 '+Math.round(d.height*1000)+' mm':'';return card(d.name,'<p>'+ (d.description??'같은 부재를 도면과 3D에 표시했습니다.')+'</p><p>'+dimensions+'</p>'+actions(btn('전기 경로 따라가기','go','electrical')+termLink(d.id==='room-vestibule'?'vestibule':d.kind==='ceiling'?'ceiling':d.kind==='door'||d.kind==='window-glass'?'opening':d.kind==='floor'?'slab':d.kind==='wall'?'wall-panel':'plan')+(d.id==='slab'?btn('같은 바닥판 계산','open-calc','slab'):'')));}
  if(tab==='electrical'){
    const power=f.electric.circuits.map(branch=>btn(branch.id+' '+branch.name+' 차단기 '+(state.breakers[branch.id]?'켜짐':'꺼짐'),'breaker',branch.id,pressed(state.breakers[branch.id]))).join('');
    const phases=['경로 보기','분전반에서 상승','천장 배관','기구에 도착'];
    return (selected===panel.id?card(panel.name,'<p>이 분전반에서 '+f.electric.circuits.map(b=>b.id+' '+b.name).join(' · ')+' 회로가 나뉩니다. 도면과 모형의 같은 분전반을 표시했습니다.</p>'):'')+'<div class="bay-two">'+card(load.id+' · '+load.name,'<p>'+panel.id+' 분전반 → '+c.id+' 회로 → '+load.id+' · 현재 '+(load.on?(load.kind==='ffu'?'팬 운전 중':'점등'):(load.kind==='ffu'?'팬 정지':'소등'))+'</p>'+actions(power)+'<h3 class="route-title">배관 경로</h3>'+actions(phases.slice(1).map((s,i)=>btn((i+1)+'. '+s,'step',i+1,pressed(step===i+1))).join('')))+
    card(c.id+' 회로 계산','<p>단상 220 V에서 기구의 입력전력을 합해 설계 전류를 구합니다. 차단기를 끄면 운전 상태가 바뀌고, 기구의 정격을 편집하면 설계값이 바뀝니다.</p><div class="equation">'+c.loads.map(d=>d.watts).join(' + ')+' = '+c.watts+' W<br>I = P / (V × pf) = '+c.watts+' / (220 × '+c.pf+') = '+c.current.toFixed(2)+' A</div><form id="bay-watts"><label>'+load.id+' 입력전력 (W) <input name="watts" type="number" required min="1" max="1000" step="1" value="'+load.watts+'"></label><button>설계에 적용</button></form><details><summary>공식과 기호 읽기</summary><p>전류 I의 단위는 A, 전력 P의 단위는 W, 전압 V의 단위는 V입니다. 단상 교류의 유효전력 P = V × I × pf를 전류에 대해 풀었습니다. 이 예제는 같은 분기의 기구에 같은 역률을 적용합니다.</p></details>'+actions(btn('이 회로 계산 순서','open-calc','electric')+termLink('power-factor')))+'</div>';
  }
  if(tab==='fire')return card(data.id+' · '+data.name,'<p>'+({smoke:'작업구역에서 연기를 감지해 수신기로 신호를 보내는 위치입니다.',receiver:'주황색 선을 따라 감지기와 전실 수신기의 연결을 확인하세요.',alarm:'수신기에서 경보장치까지 이어지는 주황색 신호선을 확인하세요.',exit:'초록색은 작업대 앞에서 전실을 거쳐 바깥으로 나가는 동선입니다.',extinguisher:'전실 통로에서 접근하는 소화기입니다. 작동 체험에서 안전핀·조준·분사 순서를 연습합니다.'}[data.kind])+'</p>'+actions(btn('작동 시험 열기','go','test','class="primary"')+termLink('receiver')));
  if(tab==='test')return '';
  if(tab==='fire-signal'){
    const info=fireStages[stage];
    return card(info?(stage+1)+'. '+info.title:'감지기 시험 준비','<p role="status">'+(info?info.text:'시험을 시작하면 작업구역 감지기에 모의 신호를 넣습니다. 도면과 모형에서 같은 장치를 찾아보세요.')+'</p>'+actions((stage<3?btn(stage===-1?'감지기 시험 시작':'다음 · '+fireStages[stage+1].title,'advance','','class="primary"'):btn('안전점검 기록','go','safety','class="primary"'))+(stage>=0?btn('시험 초기화','reset-test'):'')+btn(audio.enabled?'경보음 끄기':'경보음 켜기','sound','',pressed(audio.enabled)))+'<p class="small">기구 간 신호 전달과 피난 경로를 배우는 교육용 시험입니다. 청정도, 연기 확산 속도, 대피 가능 시간은 계산 범위에서 제외했습니다.</p>');
  }
  if(tab==='safety')return fireSimulationResult('cleanroom-03')+card('학습 기록 '+safetyChecks.filter(([id])=>state.checks[id]).length+' / '+safetyChecks.length,'<div class="checklist">'+safetyChecks.map(([id,label,target])=>'<div><label><input type="checkbox" data-check="'+id+'" '+(state.checks[id]?'checked':'')+'>'+label+'</label>'+btn('관련 수업','related',id)+'</div>').join('')+'</div>');
  return '';
}
function renderInspector(f){
 const d=lookup(selected),host=$('bay-inspector');
 if(!d){host.innerHTML='<h2>하나를 눌러보세요.</h2><p>도면이나 건물의 벽·창문·기구를 선택하면 설명과 치수가 나타납니다.</p>';return;}
 const actual=f.electric.devices.find(e=>e.id===d.id)??f.fire.devices.find(e=>e.id===d.id)??d;
 const term=d.circuit?(d.kind==='ffu'?'ffu':'branch'):d.id==='slab'?'slab':d.kind==='door'||d.kind==='window-glass'?'opening':d.kind==='wall'?'wall-panel':d.kind==='ceiling'?'ceiling':d.id==='room-vestibule'?'vestibule':d.id==='FE3'?'extinguisher':d.kind==='smoke'?'detector':d.kind==='receiver'?'receiver':d.kind==='alarm'?'fire-alarm':'plan';
 const definition=bayTerms.get(term),route=f.electric.routes.find(r=>r.target===d.id);
 const length=route?route.points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(...p.map((v,j)=>v-route.points[i][j])),0):null;
 host.innerHTML='<h2>'+d.name+'</h2><div class="selection-id">'+d.id+'</div><p>'+(definition?.plain??d.description??'도면과 3D에서 같은 대상을 확인하세요.')+'</p>'+selectionDimensions(actual,{routeLength:length})+actions(btn('도면에서 같은 대상 보기','inspect-drawing')+(definition?btn('쉬운 용어 설명','term',term):'')+(d.circuit?btn('이 회로 계산','open-calc','electric'):d.id==='slab'?btn('이 부재 계산','open-calc','slab'):''));
}
function paint(){
  const f=frame(),workspace=!['home','safety','glossary','calculations'].includes(tab),home=tab==='home';
  $('bay-app').dataset.page=tab;$('bay-walk').hidden=tab!=='experience'||experienceView!=='inside';if(tab==='experience')$('bay-walk').innerHTML='<div><p>눈높이 1.6 m</p><p>휠: 시야 확대·축소 · W A S D: 이동</p></div><div class="move-buttons">'+btn('전실로','walk','entry')+btn('작업대로','walk','station')+btn('앞으로','walk','forward')+btn('뒤로','walk','back')+btn('왼쪽 이동','walk','strafe-left')+btn('오른쪽 이동','walk','strafe-right')+btn('왼쪽 보기','walk','left')+btn('오른쪽 보기','walk','right')+'</div>';
  $('bay-title').textContent=pages[tab][0];$('bay-intro').textContent=pages[tab][1];
  $('bay-workspace').hidden=!workspace;$('drawing').hidden=home;
  $('bay-model-title').textContent=({experience:experienceView==='inside'?'눈높이 실내 체험':'클린룸 · 전체 건물',materials:'재료층 분해 모형',structure:'대표 바닥판과 하부 철근'})[tab]??'클린룸 절개 모형';
  const currentSheet=sheets.find(s=>s.id===drawing);$('drawing-title').textContent=currentSheet?currentSheet.id+' · '+currentSheet.title:'학습 도면';
  $('drawing-direction').textContent=({section:'A-A 선에서 자른 모습',circuit:'분전반에서 기구까지',openings:'문·창 실제 치수',elevation:'전면 패널 입면',ceiling:'아래에서 올려다본 천장'})[currentSheet?.view]??'위에서 본 모습';
  if(tab==='building'||tab==='experience'&&experienceView==='sheet')$('bay-model-title').textContent=currentSheet.title+' · 같은 위치의 3D';
  const fireNav=btn('도면·3D 보기','go','fire',pressed(tab==='fire'))+btn('연기·피난 체험','go','test',pressed(tab==='test'))+btn('신호만 시험','go','fire-signal',pressed(tab==='fire-signal'));
  $('bay-tools').innerHTML=home||!workspace?'':(firePage()?fireNav:'')+(['test','fire-signal'].includes(tab)?'':deviceButtons(firePage()?[...fireDevices,extinguisher]:tab==='building'?rooms:equipment));
  if(tab==='materials')$('bay-tools').innerHTML=Object.entries(assemblies).map(([k,v])=>btn(v.name,'assembly',k,pressed(assembly===k))).join('');
  if(tab==='structure')$('bay-tools').innerHTML=[['both','함께 보기'],['bars','철근만 보기'],['concrete','콘크리트만 보기']].map(([k,v])=>btn(v,'display',k,pressed(display===k))).join('');
  if(workspace){const menu=firePage()?'fire':tab==='experience'?'building':tab;const choices=sheets.filter(s=>s.menu===menu);$('bay-sheet').innerHTML=choices.map(s=>'<option value="'+s.id+'" '+(s.id===drawing?'selected':'')+'>'+s.id+' · '+s.title+'</option>').join('');$('bay-plan').innerHTML=bayPlan({...f,tab:tab==='experience'?'building':tab});}
  if(tab==='experience')mountExperienceTools($('bay-tools'),{night,render:()=>{scene?.realistic();$('bay-render-label').textContent='실감 렌더링 · 재질·그림자';},enter:()=>{experienceView='inside';layoutMode='model';paint();},outside:()=>{experienceView='outside';paint();},setNight:on=>{night=on;paint();$('bay-status').textContent=on?'밤 장면으로 전환했습니다.':'낮 장면으로 전환했습니다.';},route:()=>{returnPage='experience';go('electrical',electricalId);},preview:()=>showScenePreview(scene.image(),'현재 클린룸 렌더링 장면')});
  renderInspector(f);
  $('bay-render-label').textContent='실감 렌더링';$('bay-view-help').textContent=tab==='experience'&&experienceView==='inside'?'휠: 시야 확대·축소 · 드래그: 시선 · W A S D: 이동':'드래그로 회전 · 휠로 확대 · 대상을 눌러 정보 확인';
  $('bay-lesson').innerHTML=['glossary','building','fire'].includes(tab)?'':renderLesson(f);if(tab==='glossary')mountGlossary($('bay-lesson'),[...bayTerms.values()],{action:'related-term',detailsAction:'term'});
  document.querySelectorAll('#learning-nav button').forEach(b=>{if(b.dataset.go===(firePage()?'fire':tab))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  $('bay-return').hidden=!returnPage||returnPage===tab;$('bay-panes').dataset.layout=tab==='test'?'model':layoutMode;document.querySelectorAll('#bay-view-tools [data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===layoutMode)));
  scene?.setActive(workspace);scene?.update(f);scene?.simulation?.setPage(tab==='test'?'fire-test':tab);
  audio.play(f.alarm&&!document.hidden);
}
async function ensureScene(){
  if(scene||loading||$('bay-workspace').hidden)return;
  const turn=++epoch,host=$('bay-canvas');
  host.innerHTML='<p role="status">3D 모형을 준비하고 있습니다.</p>';
  loading=import('./cleanroom-scene.mjs').catch(error=>{error.requiresReload=true;throw error;});
  try{const {mountBay}=await loading;if(turn!==epoch||$('bay-workspace').hidden)return;scene=mountBay(host,pick,{readFire:()=>bayFire(simPower),onSignal:id=>{simPower.signal=id;scene?.update(frame());},onPower:kind=>{const k=kind==='power'?'mains':'battery';simPower[k]=!simPower[k];scene?.update(frame());},navigate:(kind,id)=>{if(kind==='term')moveTerm(scene.simulation.state.phase.startsWith('extinguish')?'extinguisher':'detector');else if(kind==='safety')go('safety');else{fireId=id;drawing='F-301';go('fire',id);}}});scene.update(frame());scene.simulation.setPage(tab==='test'?'fire-test':tab);}
  catch(error){reloadRequired=Boolean(error.requiresReload);if(turn===epoch)host.innerHTML='<p role="status">3D를 준비하지 못했습니다. 도면과 회로 계산은 계속 사용할 수 있습니다. '+btn('3D 다시 열기','retry')+'</p>';}
  finally{if(turn===epoch)loading=null;}
}
let materialLocation=null;
function pick(id){
  if(tab==='materials'&&id.startsWith('layer-')){layer=Number(id.slice(6));paint();return;}
  materialLocation=null;
  const d=lookup(id);if(!d||['test','fire-signal'].includes(tab))return;
   if(tab==='building')buildingId=id;
  if(fireDevices.includes(d)||d.id==='FE3'){fireId=id;}
  else if(d.circuit){electricalId=id;step=0;}
  if(tab==='home'){go('building');}
  selected=id;paint();
}
function openPage(){
  scene?.simulation?.leave();simPower={mains:true,battery:true,signal:null};
  tab=location.hash.slice(1);if(!Object.hasOwn(pages,tab))tab='home';experienceView='outside';layoutMode=tab==='experience'||tab==='test'?'model':'split';
  const focused=focusOnOpen?.menu===tab?focusOnOpen.id:null;selected=focused??(tab==='test'?'SD3':firePage()?fireId:tab==='structure'?'slab':tab==='materials'?assemblies[assembly].target:tab==='building'?buildingId:electricalId);focusOnOpen=null;stage=-1;step=focused&&tab==='electrical'&&['calculations','experience'].includes(returnPage)?3:0;
  const menu=firePage()?'fire':tab==='experience'?'building':tab;if(!sheets.some(s=>s.id===drawing&&s.menu===menu))drawing=sheets.find(s=>s.menu===menu)?.id??'A-301';
  if(tab!=='building')materialLocation=null;
  $('site-top').dataset.menuOpen='false';$('menu-toggle').setAttribute('aria-expanded','false');
  $('bay-status').textContent='';paint();ensureScene();$('menu-toggle').setAttribute('aria-label','학습 메뉴 열기');
  requestAnimationFrame(()=>{if(focused&&!$('bay-workspace').hidden)$('bay-workspace').scrollIntoView({block:'start'});else window.scrollTo({top:0,behavior:'instant'});});
}
function go(target,id=null){if(!Object.hasOwn(pages,target))return;if(id)focusOnOpen={menu:target,id};if(tab===target){if(id){selected=id;focusOnOpen=null;}paint();return;}location.hash=target;}
function moveTerm(id){
  const t=bayTerms.get(id);if(!t)return;
  $('bay-term-title').textContent=t.term;$('bay-term-body').textContent=[t.plain,t.definition,t.electrical].filter(Boolean).join(' ');
  $('bay-term-actions').innerHTML=btn('도면·3D에서 찾기','related-term',id)+btn('용어사전에서 이어보기','glossary-term',id);
  if(!$('bay-term').open)$('bay-term').showModal();
}
function destination(target){
  if(!target)return;
  returnPage=tab==='glossary'?termReturn||'glossary':tab;
  const s=sheets.find(s=>s.id===target.sheet);if(s)drawing=s.id;
  if(target.menu==='building'){buildingId=target.id;}
  if(target.menu==='materials'){assembly=s?.view??'floor';layer=0;}
  if(target.menu==='fire')fireId=target.id;
  if(equipment.some(d=>d.id===target.id))electricalId=target.id;
  if(target.menu===tab&&tab==='electrical'&&returnPage==='calculations')step=3;
  go(target.menu,target.id);
}
function saveFile(name,text,type){
  const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function zoomDrawing(action){
  planZoom=action==='fit'?1:Math.min(4,Math.max(.7,planZoom*(action==='in'?1.25:.8)));
  const svg=$('bay-plan').querySelector('svg');if(!svg)return;
  const full=svg.dataset.fullView?.split(' ').map(Number)??svg.getAttribute('viewBox').split(' ').map(Number);svg.dataset.fullView=full.join(' ');
  const [x,y,w,h]=full;svg.setAttribute('viewBox',[x+w*(1-1/planZoom)/2,y+h*(1-1/planZoom)/2,w/planZoom,h/planZoom].join(' '));
}
const bayActions={
  go:b=>go(b.dataset.go),pick:b=>pick(b.dataset.pick),device:b=>pick(b.dataset.device),
  layer:b=>{const n=Number(b.dataset.layer);if(!assemblies[assembly].layers[n])return;layer=n;paint();},
  walk:b=>scene?.walk(b.dataset.walk),
  assembly:b=>{if(!assemblies[b.dataset.assembly])return;assembly=b.dataset.assembly;drawing=assemblies[assembly].sheet;layer=0;paint();},
  display:b=>{if(!['both','bars','concrete'].includes(b.dataset.display))return;display=b.dataset.display;paint();},
  locateMaterial:()=>{materialLocation=assembly;buildingId=assemblies[assembly].target;drawing='A-301';go('building');},
  openCalc:b=>{calcMode=b.dataset.openCalc;formula=0;go('calculations');},
  calcMode:b=>{calcMode=b.dataset.calcMode;formula=0;paint();},
  calcCircuit:b=>{const d=equipment.find(d=>d.circuit===b.dataset.calcCircuit);if(d){electricalId=d.id;paint();}},
  calcIndex:b=>{formula=Number(b.dataset.calcIndex);paint();},
  reading:b=>{readingView=b.dataset.reading;paint();},
  calcTarget:b=>{const t=bayLesson(state,calcMode,electricalId).target;const s=b.dataset.calcTarget==='drawing'?t.drawing:t.sheet;destination({menu:sheets.find(d=>d.id===s).menu,id:t.element,sheet:s});},
  calcDevice:b=>destination({menu:'electrical',id:b.dataset.calcDevice,sheet:'E-301'}),
  backReading:()=>{const target=returnPage||'calculations';returnPage='';go(target);},
  saveCalculation:()=>saveFile('클린룸-계산.json',JSON.stringify(bayLesson(state,calcMode,electricalId),null,2),'application/json'),
  saveDrawing:()=>saveFile(drawing+'.svg',$('bay-plan').querySelector('svg').outerHTML,'image/svg+xml'),
  layout:b=>{layoutMode=b.dataset.layout;paint();},
  inspectDrawing:()=>{const d=lookup(selected),menu=d.pos?(fireDevices.includes(d)||d.id==='FE3'?'fire':'electrical'):'building';const target={menu,id:d.id,sheet:menu==='building'?['door','window'].includes(d.kind)?'A-305':'A-301':menu==='fire'?'F-301':'E-301'};layoutMode='split';destination(target);},
  zoom:b=>zoomDrawing(b.dataset.zoom),
  whole:()=>{experienceView='outside';paint();scene?.whole();$('bay-model-title').textContent='클린룸 · 전체 건물';},
  breaker:b=>{const id=b.dataset.breaker;if(!circuits.some(c=>c.id===id))return;state.breakers[id]=!state.breakers[id];save();paint();$('bay-status').textContent=id+' 차단기를 '+(state.breakers[id]?'켰습니다.':'껐습니다.');},
  step:b=>{step=Number(b.dataset.step);selected=step===1?panel.id:electricalId;paint();},
  advance:()=>{if(stage<3){stage++;selected=fireStages[stage].id;paint();}},
  resetTest:()=>{stage=-1;selected='SD3';paint();},
  sound:()=>{if(audio.enabled)audio.mute();else{audio.enabled=true;audio.unlock();audio.ctx?.resume().then(()=>audio.play(tab==='fire-signal'&&stage>=2&&!document.hidden)).catch(()=>{});}paint();},
  term:b=>moveTerm(b.dataset.term),
  relatedTerm:b=>{const target=bayTerms.get(b.dataset.relatedTerm)?.target;$('bay-term').close();destination(target);},
  glossaryTerm:b=>{const id=b.dataset.glossaryTerm;termReturn=tab;$('bay-term').close();go('glossary');requestAnimationFrame(()=>$('term-'+id)?.scrollIntoView({block:'center'}));},
  related:b=>{const row=safetyChecks.find(([id])=>id===b.dataset.related);if(!row)return;if(row[0]==='escape')fireId='EX3';if(row[0]==='path')electricalId='FFU1';go(row[2]);},
  retry:()=>{if(reloadRequired)location.reload();else ensureScene();},
  '#reframe':()=>{experienceView='outside';paint();scene?.whole();},
  '#bay-reset':()=>$('bay-reset-dialog').showModal(),
  '#bay-reset-confirm':()=>{Object.assign(state,freshBay());simPower={mains:true,battery:true,signal:null};save();$('bay-reset-dialog').close();go('home');},
  '#menu-toggle':b=>{const active=$('site-top').dataset.menuOpen!=='true';$('site-top').dataset.menuOpen=String(active);b.setAttribute('aria-expanded',String(active));b.setAttribute('aria-label',active?'학습 메뉴 닫기':'학습 메뉴 열기');}
};
bindActions([$('site-top'),$('bay-app'),$('bay-term'),$('bay-reset-dialog')],bayActions,error=>{$('bay-status').textContent='작업을 마치지 못했습니다: '+error.message;});
document.addEventListener('keydown',e=>{if(e.target.matches('[data-layer]')&&['Enter',' '].includes(e.key)){e.preventDefault();layer=Number(e.target.dataset.layer);paint();return;}if(e.target.matches('[data-device]')&&['Enter',' '].includes(e.key)){e.preventDefault();pick(e.target.dataset.device);}});
$('bay-app').addEventListener('change',e=>{if(e.target.id==='calc-step'){formula=bayLesson(state,calcMode,electricalId).steps.findIndex(s=>s.id===e.target.value);paint();return;}if(e.target.dataset.complete){state.completed=steps.filter(s=>s.id===e.target.dataset.complete?e.target.checked:state.completed.includes(s.id)).map(s=>s.id);save();return;}const id=e.target.dataset.check;if(id){state.checks[id]=e.target.checked;save();paint();document.querySelector('[data-check="'+id+'"]')?.focus();}});

$('bay-app').addEventListener('submit',e=>{if(e.target.id==='bay-live'){e.preventDefault();if(e.target.reportValidity()){state.live=e.target.elements.live.valueAsNumber;save();paint();}return;}if(e.target.id!=='bay-watts')return;e.preventDefault();const w=e.target.elements.watts.valueAsNumber;
  if(!e.target.reportValidity()||!Number.isInteger(w))return;
  state.watts[electricalId]=w;save();paint();$('bay-status').textContent=electricalId+'의 입력전력을 '+w+' W로 적용했습니다.';
});
document.addEventListener('visibilitychange',()=>audio.play(!document.hidden&&tab==='fire-signal'&&stage>=2));
mountSamples(3,()=>go('home'));
window.addEventListener('hashchange',openPage);
$('bay-view-tools').addEventListener('change',event=>{if(event.target.id!=='bay-sheet')return;const s=sheets.find(s=>s.id===event.target.value);if(!s)return;drawing=s.id;experienceView='sheet';selected=s.view==='openings'?building.openings[0].id:s.view==='ceiling'?building.elements.find(e=>e.kind==='ceiling'&&e.id!=='ceiling-deck').id:s.view==='elevation'?'south-wall':s.view==='section'?'slab':buildingId;if(s.menu==='materials'){assembly=s.view;layer=0;selected=assemblies[assembly].target;}paint();$('bay-status').textContent=s.title+'와 같은 방향으로 3D를 전환했습니다.';});
window.addEventListener('pagehide',e=>{audio.play(false);scene?.setActive(false);if(!e.persisted){epoch++;scene?.dispose();audio.dispose();}});
window.addEventListener('pageshow',e=>{if(e.persisted)scene?.setActive(!$('bay-workspace').hidden);});
openPage();
