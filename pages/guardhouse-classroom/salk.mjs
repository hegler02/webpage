import {createQuantities} from './quantities-ui.mjs';
import {mountWorkbench,standardPages} from './workbench.mjs';
import {clearLearningRecords} from './study-state.mjs';
import {mountExperienceTools,showScenePreview,selectionDimensions} from './workspace-ui.mjs';
import {mountSamples,mountGlossary} from './learning-shell.mjs';
import {bindActions} from './action-events.mjs';
import {createCalculations,salkMember} from './masters-calculations.mjs';
import {provenance,W,BAY,SLAB} from './src/salk-model.mjs';
import {rooms,materials,sheets,steps,circuits,panel,equipment,fireDevices,fireStages,fireSource,signalPath,alarmPath,escapePath,stations,freshSalk,salkElectrical,salkFire} from './src/salk-project.mjs';
import {salkTerms,termFor} from './src/salk-glossary.mjs';
import {model} from './salk-plan-parts.mjs';
import {salkPlan} from './salk-plan.mjs';
import * as lessons from './salk-lessons.mjs';
import {powerStatus,routeLive} from './masters-power.mjs';

const {btn,actions}=lessons;
const $=id=>document.getElementById(id);
const key='space-electricity-salk-05-v1',energyKey=key+':energy';
mountWorkbench({root:$('bay-app'),workspace:$('bay-workspace'),heading:$('page-heading'),canvases:$('bay-panes'),plan:$('bay-plan'),three:$('bay-canvas'),inspector:$('bay-inspector'),content:'#bay-lesson',status:$('bay-status'),extraMove:['#bay-return'],idleTitle:'하나를 눌러보세요.',zoomIn:document.querySelector('#drawing [data-zoom=in]'),zoomOut:document.querySelector('#drawing [data-zoom=out]'),pages:standardPages('#bay-lesson')});
let saved;
try{saved=JSON.parse(localStorage.getItem(key));}catch{}
const state=freshSalk(saved);
const pages={
  home:['솔크 연구소','루이스 칸이 실험실 위마다 설비층을 둔 연구소를 도면·3D·전기·소방·에너지로 읽습니다.'],
  building:['건물을 읽습니다.','두 동과 중정, 실험실과 설비층이 어떻게 놓였는지 평면과 단면에서 찾으세요.'],
  materials:['재료를 읽습니다.','콘크리트·티크·트래버틴·유리가 어디에 쓰였는지 누르세요.'],
  structure:['구조와 설비층을 읽습니다.','대각선 없는 트러스가 설비층을 만들고 실험실을 기둥 없이 비웁니다.'],
  electrical:['실험실 한 칸의 전기를 설계합니다.','분전반에서 조명·콘센트·배기 팬·공조기 팬까지 가는 길을 따라가세요.'],
  fire:['소방 신호와 피난을 따라갑니다.','감지기에서 수신기, 경종, 피난 경로까지 순서대로 확인하세요.'],
  energy:['에너지를 계산합니다.','이 실험실 한 층을 서울에 지으면 난방과 냉방이 얼마나 드는지 바꿔 보세요.'],
  glossary:['용어사전','도면과 수업에서 만나는 말을 찾아보세요.'],
  experience:['안에 서 봅니다.','해 지는 중정에서 실험실로, 실험실에서 설비층으로 걸어 올라가세요.'],
  calculations:['계산으로 확인합니다.','한 회로와 비렌딜 트러스 하나를 숫자로 따라가며, 식에 넣은 값이 도면 어디에서 왔는지 확인하세요.'],
  quantities:['설계를 재료와 수량으로 읽습니다.','같은 설계에서 기구와 콘크리트 수량을 집계하고 산출 위치를 확인하세요.']
};
const menus={building:'room-lab',materials:'end-w',structure:'truss2-6',electrical:panel.id,fire:fireSource};
// The few things worth picking first on each menu, shown above the drawing.
const quick={building:rooms.map(r=>[r.id,r.name]),materials:materials.map(m=>[m.target,m.name]),structure:[['truss2-6','비렌딜 트러스'],['pipe2-floor','설비층 바닥'],['lab2-floor','실험실 바닥'],['end-w','끝벽']],electrical:[[panel.id,'분전반'],['LR3','조명'],['S4','콘센트'],['EF1','배기 팬'],['AHU1','공조기 팬'],['SW1','스위치']],fire:[['FR1','수신기'],['SD5','연기감지기'],['SP1','스프링클러'],['HY2','옥내소화전'],['BL2','경종'],['EX3','유도등'],['FE3','소화기']]};
let tab='home',drawing='A-501',selected='room-lab',stage=-1,returnPage='',planZoom=1,layoutMode='split',night=false,wiring=false,focusOnOpen=null,termReturn='',glossaryTermOnOpen=null;
let scene=null,loading=null,epoch=0,reloadRequired=false,energy=null,energySun=null,energyNight=false,energyLabel=null,dictionary=null;
const idle=new Set(salkFire({}).devices.filter(d=>d.on).map(d=>d.id));
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{$('bay-status').textContent='이 브라우저에 학습 표시를 저장하지 못했습니다.';}}
const lookup=id=>[panel,...equipment,...fireDevices,...rooms,...model.elements].find(d=>d.id===id);
const sheet=()=>sheets.find(s=>s.id===drawing)??sheets[0];

function frame(){
  const electric=salkElectrical(state),raw=salkFire({signal:tab==='fire'&&stage>=0?fireSource:null});
  const shown=d=>d.id===fireSource||(stage>=1&&d.kind==='receiver')||stage>=2;
  const fire={...raw,devices:raw.devices.map(d=>({...d,alarm:d.alarm&&shown(d),on:idle.has(d.id)||(d.on&&shown(d))}))};
  const color=Object.fromEntries(electric.circuits.map(c=>[c.id,c.color]));
  const paths=tab==='fire'?[[1,signalPath,'#d19129'],[2,alarmPath,'#c8452f'],[3,escapePath,'#08734d','6 4']].filter(p=>stage>=p[0]).map(([,points,c,dash])=>({points,color:c,dash,radius:.06,through:true}))
    :tab==='electrical'?electric.routes.map(r=>{const d=electric.devices.find(x=>x.id===r.target),pick=r.target===selected||d?.switch===selected;return {points:r.points,color:routeLive(electric,state,r)?color[r.circuit]:'#8a9296',radius:pick?.06:.028,through:true};}):[];
  // Every route at once, for the in-wall wiring overlay of the walk.
  const wires=electric.routes.map(r=>({points:r.points,color:color[r.circuit],radius:.04,through:true}));
  return {electric,fire,paths,wires};
}
// The energy page shows the whole building under the sun of the chosen hour, so it borrows the lived-in view without its tools.
const sceneFrame=f=>{const sunny=tab==='energy',live=tab==='experience'||sunny;return {view:live?'site':sheet().view,studio:!live,id:live?null:selected,show:tab==='fire'?'fire':live?'all':'electrical',devices:[...f.electric.devices,...f.fire.devices],paths:sunny?[]:live?(wiring?f.wires:[]):f.paths,night:sunny?energyNight:night,power:tab==='electrical'};};

function renderInspector(f){
  const d=lookup(selected),host=$('bay-inspector');
  if(!d||tab==='experience'||tab==='energy'){host.innerHTML='<h2>하나를 눌러보세요.</h2><p>도면이나 건물의 벽·트러스·기구를 선택하면 설명과 치수가 나타납니다.</p>';return;}
  const actual=f.electric.devices.find(e=>e.id===d.id)??f.fire.devices.find(e=>e.id===d.id)??d,part=model.elements.includes(d)?provenance(d):null,term=termFor(d),definition=salkTerms.get(term);
  const route=f.electric.routes.find(r=>r.target===d.id),length=route?route.points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(...p.map((v,j)=>v-route.points[i][j])),0):null;
  host.innerHTML='<h2>'+d.name+'</h2><div class="selection-id">'+d.id+'</div><p>'+(d.note??d.description??actual.stateLabel??definition?.plain??'')+'</p>'+
    (part?'<div class="basis"><b data-basis="'+part.label+'">'+part.label+'</b>'+(part.source?'<a href="'+part.source.url+'" target="_blank" rel="noopener">'+part.source.name+'</a>':'')+'</div>':'')+
    selectionDimensions(actual,{routeLength:length})+actions((definition?btn('쉬운 용어 설명','term',term):'')+(f.electric.circuits.some(c=>c.id===actual.circuit)?btn('이 회로 계산','open-calc',actual.circuit):'')+(d.id===calc.memberId?btn('이 부재 계산','open-calc','member'):''));
}

function paint(){
  const f=frame(),workspace=!['home','glossary','quantities','calculations'].includes(tab),live=tab==='experience',sunny=tab==='energy',walking=sunny?null:scene?.walking()??null;
  $('bay-app').dataset.page=tab;$('bay-walk').hidden=!live||!walking;
  if(live)$('bay-walk').innerHTML='<div><p>눈높이 1.6 m</p><p>휠: 시야 확대·축소 · W A S D: 이동</p></div><div class="move-buttons">'+stations.map(s=>btn(s.name,'walk',s.id)).join('')+btn('앞으로','walk','forward')+btn('뒤로','walk','back')+btn('왼쪽 이동','walk','strafe-left')+btn('오른쪽 이동','walk','strafe-right')+btn('왼쪽 보기','walk','left')+btn('오른쪽 보기','walk','right')+'</div>';
  $('bay-title').textContent=pages[tab][0];$('bay-intro').textContent=pages[tab][1];
  $('bay-workspace').hidden=!workspace;$('drawing').hidden=(live||sunny)&&layoutMode==='model';
  $('bay-model-title').textContent=sunny?energyLabel?.title??'솔크 연구소 모형':live?'솔크 연구소 · '+(stations.find(s=>s.id===walking)?.name??'해 지는 중정'):'솔크 연구소 모형';
  $('drawing-title').textContent=sheet().id+' · '+sheet().title;$('drawing-direction').textContent=['section','truss'].includes(sheet().view)?'서쪽을 보고 자른 모습':sheet().view==='circuit'?'분전반에서 나가는 순서':'위에서 본 모습';
  const menu=live||sunny?'building':tab;
  $('bay-sheet').innerHTML=sheets.filter(s=>s.menu===menu).map(s=>'<option value="'+s.id+'"'+(s.id===drawing?' selected':'')+'>'+s.id+' · '+s.title+'</option>').join('');
  if(workspace){$('bay-plan').innerHTML=salkPlan({sheet:drawing,id:selected,electric:f.electric,fire:f.fire,state,paths:f.paths});planZoom=1;}
  if(live)mountExperienceTools($('bay-tools'),{night,wiring,route:()=>{wiring=!wiring;paint();$('bay-status').textContent=wiring?'벽과 바닥 속 전기 길을 회로 색으로 겹쳐 보입니다.':'전기 길을 숨겼습니다.';},render:()=>showScenePreview(scene?.image(),'솔크 연구소'),enter:()=>walk('lab'),outside:()=>walk('outside'),setNight:on=>{night=on;paint();},preview:()=>showScenePreview(scene?.image(),'솔크 연구소')});
  else $('bay-tools').innerHTML=(quick[tab]??[]).map(([id,name])=>lessons.btn(name,'pick',id,lessons.pressed(id===selected))).join('');
  renderInspector(f);quantities.inspector($('bay-inspector'),selected);
  $('bay-render-label').textContent=sunny?energyLabel?.scene??'햇빛 계산':live?(night?'야간 조명':'춘분 저녁 · 라호이아'):'학습 보기';
  $('bay-view-help').textContent=walking?'드래그로 둘러보기 · W A S D로 이동':sunny?'드래그로 회전 · 휠로 확대':'드래그로 회전 · 휠로 확대 · 대상을 눌러 정보 확인';
  const view={state,electric:f.electric,fire:f.fire,selected,stage,walking,wiring};
  if(tab==='glossary'){dictionary=mountGlossary($('bay-lesson'),[...salkTerms.values()],{sample:5,action:'related-term',detailsAction:'term'});if(glossaryTermOnOpen){dictionary.input.value=salkTerms.get(glossaryTermOnOpen)?.term??'';dictionary.update();glossaryTermOnOpen=null;}}
  else if(tab==='quantities')quantities.render();
  else if(tab==='energy')showEnergy();
  else if(tab==='calculations')$('bay-lesson').innerHTML=calc.html();
  else $('bay-lesson').innerHTML=({home:lessons.home,building:lessons.building,materials:lessons.material,structure:lessons.structure,electrical:lessons.electrical,fire:lessons.fire,experience:lessons.experience})[tab](view);
  for(const b of document.querySelectorAll('#learning-nav button[data-go]'))b.toggleAttribute('aria-current',false),b.dataset.go===tab&&b.setAttribute('aria-current','page');
  quantities.setPage(tab);$('bay-return').hidden=!returnPage||returnPage===tab;
  $('bay-panes').dataset.layout=layoutMode;for(const b of document.querySelectorAll('#bay-view-tools [data-layout]'))b.setAttribute('aria-pressed',String(b.dataset.layout===layoutMode));
  scene?.setActive(workspace);if(workspace)scene?.update(sceneFrame(f));
}
async function showEnergy(){
  const host=$('bay-lesson');
  try{energy??=(await import('./salk-energy.mjs')).createSalkEnergy({read:()=>{try{return JSON.parse(localStorage.getItem(energyKey))??{};}catch{return {};}},write:v=>{try{localStorage.setItem(energyKey,JSON.stringify(v));}catch{}},
    viewer:{setSun:v=>{energySun=v;if(tab==='energy')scene?.setSun(v);},setNight:on=>{energyNight=on;if(tab==='energy')scene?.setNight(on);},label:l=>{energyLabel=l;if(tab==='energy'){$('bay-model-title').textContent=l.title;$('bay-render-label').textContent=l.scene;}}}});if(tab==='energy')await energy.render(host);}
  catch(error){if(tab==='energy')host.innerHTML='<article class="bay-card"><h2>에너지 계산을 열지 못했습니다.</h2><p>'+error.message+'</p></article>';}
}
function ensureScene(){
  if(scene)return Promise.resolve(scene);
  if(loading)return loading;
  if($('bay-workspace').hidden)return null;
  const turn=++epoch,host=$('bay-canvas');
  host.innerHTML='<p role="status">3D 모형을 준비하고 있습니다.</p>';
  loading=(async()=>{
  try{const {mountSalk,prepareSalkMaterials}=await import('./salk-view.mjs').catch(error=>{error.requiresReload=true;throw error;});await prepareSalkMaterials();if(turn!==epoch||$('bay-workspace').hidden)return;host.innerHTML='';scene=mountSalk(host,pick);scene.update(sceneFrame(frame()));return scene;}
  catch(error){reloadRequired=Boolean(error.requiresReload);if(turn===epoch)host.innerHTML='<p role="status">3D를 준비하지 못했습니다. 도면과 회로 계산은 계속 사용할 수 있습니다. '+btn('3D 다시 열기','retry')+'</p>';}
  finally{if(turn===epoch)loading=null;}
  })();
  return loading;
}
function pick(id){
  const d=id&&lookup(id);if(!d||tab==='experience'||tab==='energy')return;
  if(Object.hasOwn(menus,tab))menus[tab]=id;
  selected=id;paint();
}
function walk(action){scene?.walk(action);paint();}
let navigationId=0;
async function openPage(){
  const started=performance.now(),request=++navigationId;delete $('bay-app').dataset.frameMs;delete $('bay-app').dataset.navigationMs;
  tab=location.hash.slice(1);if(!Object.hasOwn(pages,tab))tab='home';layoutMode=['experience','energy'].includes(tab)?'model':'split';stage=-1;if(tab!=='experience')wiring=false;
  const focused=focusOnOpen?.menu===tab?focusOnOpen.id:null;if(focused&&Object.hasOwn(menus,tab))menus[tab]=focused;selected=menus[tab]??selected;focusOnOpen=null;
  const menu=['experience','energy'].includes(tab)?'building':tab;if(!sheets.some(s=>s.id===drawing&&s.menu===menu))drawing=sheets.find(s=>s.menu===menu)?.id??'A-501';
  if(tab==='experience')drawing='A-501';
  $('site-top').dataset.menuOpen='false';$('menu-toggle').setAttribute('aria-expanded','false');$('menu-toggle').setAttribute('aria-label','학습 메뉴 열기');
  $('bay-status').textContent='';paint();scene?.setSun(tab==='energy'?energySun:null);const prepared=ensureScene();
  requestAnimationFrame(()=>{if(focused&&!$('bay-workspace').hidden)$('bay-workspace').scrollIntoView({block:'start'});else window.scrollTo({top:0,behavior:'instant'});});
  const ready=await prepared;if(request!==navigationId)return;
  $('bay-app').dataset.navigationMs=(performance.now()-started).toFixed(1);
  if(ready&&!$('bay-workspace').hidden){if(tab==='experience')ready.walk('outside');else if(tab==='energy'){ready.overview();ready.setSun(energySun);ready.setNight(energyNight);}await ready.present(()=>request===navigationId);if(request!==navigationId)return;$('bay-app').dataset.frameMs=(performance.now()-started).toFixed(1);}
}
function go(target,id=null){if(!Object.hasOwn(pages,target))return;if(id)focusOnOpen={menu:target,id};if(tab===target){if(id){selected=id;focusOnOpen=null;}paint();return;}location.hash=target;}
function moveTerm(id){
  const t=salkTerms.get(id);if(!t)return;
  $('bay-term-title').textContent=t.term;$('bay-term-body').textContent=[t.plain,t.definition,t.electrical].filter(Boolean).join(' ');
  $('bay-term-actions').innerHTML=(t.target?.id?btn('도면·3D에서 찾기','related-term',id):'')+btn('용어사전에서 이어보기','glossary-term',id);
  if(!$('bay-term').open)$('bay-term').showModal();
}
function destination(target){
  if(!target)return;
  returnPage=tab==='glossary'?termReturn||'glossary':tab;
  if(sheets.some(s=>s.id===target.sheet))drawing=target.sheet;
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
// The calculation page reads the same circuit table the panel schedule shows.
const calc=createCalculations({key:key+':calc',file:'솔크-계산.json',terms:salkTerms,electric:()=>salkElectrical(state),sheets,panel,plan:'E-501',drawing:'E-502',member:salkMember({span:W,width:BAY,slab:SLAB,depth:2.74}),destination,go,saveFile,paint,status:t=>{$('bay-status').textContent=t;}});
const salkActions={
  ...calc.actions,
  go:b=>go(b.dataset.go),pick:b=>pick(b.dataset.pick),device:b=>pick(b.dataset.device),
  walk:b=>walk(b.dataset.walk),
  saveDrawing:()=>saveFile(drawing+'.svg',$('bay-plan').querySelector('svg').outerHTML,'image/svg+xml'),
  layout:b=>{layoutMode=b.dataset.layout;paint();},
  zoom:b=>zoomDrawing(b.dataset.zoom),
  whole:()=>{if(tab==='energy')scene?.overview();else if(tab==='experience')walk('outside');else{paint();scene?.home();}},
  breaker:b=>{const id=b.dataset.breaker;if(!circuits.some(c=>c.id===id))return;state.breakers[id]=!state.breakers[id];save();paint();$('bay-status').textContent=powerStatus(salkElectrical(state),state,'breaker',id,{unit:'열'});},
  power:()=>{state.power=state.power===false;save();paint();$('bay-status').textContent=powerStatus(salkElectrical(state),state,'power','main',{unit:'열'});},
  switch:b=>{const id=b.dataset.switch;if(!Object.hasOwn(state.switches,id))return;state.switches[id]=!state.switches[id];save();paint();$('bay-status').textContent=powerStatus(salkElectrical(state),state,'switch',id,{unit:'열'});},
  advance:()=>{if(stage<fireStages.length-1){stage++;selected=fireStages[stage].id;paint();}},
  resetTest:()=>{stage=-1;selected=fireSource;paint();},
  term:b=>moveTerm(b.dataset.term),
  relatedTerm:b=>{const target=salkTerms.get(b.dataset.relatedTerm)?.target;if($('bay-term').open)$('bay-term').close();destination(target);},
  glossaryTerm:b=>{glossaryTermOnOpen=b.dataset.glossaryTerm;termReturn=tab;$('bay-term').close();go('glossary');},
  backReading:()=>{const back=returnPage;returnPage='';go(back);},
  retry:()=>{if(reloadRequired)location.reload();else ensureScene();},
  '#reframe':()=>{if(tab==='energy')scene?.overview();else if(tab==='experience')walk('outside');else scene?.home();},
  '#bay-reset':()=>$('bay-reset-dialog').showModal(),
  '#bay-reset-confirm':()=>{clearLearningRecords(5,'salk-05');try{localStorage.removeItem(energyKey);}catch{}energy=null;energySun=null;energyNight=false;energyLabel=null;calc.reset();Object.assign(state,freshSalk());save();$('bay-reset-dialog').close();go('home');},
  '#menu-toggle':b=>{const active=$('site-top').dataset.menuOpen!=='true';$('site-top').dataset.menuOpen=String(active);b.setAttribute('aria-expanded',String(active));b.setAttribute('aria-label',active?'학습 메뉴 닫기':'학습 메뉴 열기');}
};
bindActions([$('site-top'),$('bay-app'),$('bay-term'),$('bay-reset-dialog')],salkActions,error=>{$('bay-status').textContent='작업을 마치지 못했습니다: '+error.message;});
document.addEventListener('keydown',e=>{if(e.target.matches?.('[data-device]')&&['Enter',' '].includes(e.key)){e.preventDefault();pick(e.target.dataset.device);}});
$('bay-app').addEventListener('submit',e=>calc.submit(e));
$('bay-app').addEventListener('change',e=>{if(calc.change(e))return;const id=e.target.dataset.complete;if(!id)return;state.completed=steps.filter(s=>s.id===id?e.target.checked:state.completed.includes(s.id)).map(s=>s.id);save();paint();});
const quantities=createQuantities({host:$('bay-lesson'),nav:$('learning-nav'),workspace:$('bay-workspace'),go,read:()=>{const f=frame();return {sample:'salk',model,electric:f.electric,fire:f.fire,panel,rebar:{bars:[]},resolveSheet:e=>e.kind==='truss'?'S-501':e.group==='pipe'?'S-502':'A-501'};},locate:async m=>{drawing=m.sheet;returnPage='quantities';focusOnOpen={menu:m.menu,id:m.id};history.replaceState(null,'','#'+m.menu);await openPage();return !reloadRequired;}});
mountSamples(5,()=>go('home'),()=>go('glossary'));
window.addEventListener('hashchange',openPage);
$('bay-view-tools').addEventListener('change',event=>{if(event.target.id!=='bay-sheet')return;const s=sheets.find(s=>s.id===event.target.value);if(!s)return;drawing=s.id;paint();$('bay-status').textContent=s.title+'와 같은 방향으로 3D를 전환했습니다.';});
window.addEventListener('pagehide',e=>{scene?.setActive(false);if(!e.persisted){epoch++;scene?.dispose();}});
window.addEventListener('pageshow',e=>{if(e.persisted)scene?.setActive(!$('bay-workspace').hidden);});
openPage();
