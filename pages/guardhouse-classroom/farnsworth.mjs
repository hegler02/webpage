import {createQuantities} from './quantities-ui.mjs';
import {mountWorkbench,standardPages} from './workbench.mjs';
import {clearLearningRecords} from './study-state.mjs';
import {mountExperienceTools,showScenePreview,selectionDimensions} from './workspace-ui.mjs';
import {mountSamples,mountGlossary} from './learning-shell.mjs';
import {bindActions} from './action-events.mjs';
import {createCalculations,farnsworthMember} from './masters-calculations.mjs';
import {provenance,FLOOR,TZ,W,CANT,FASCIA} from './src/farnsworth-model.mjs';
import {rooms,materials,sheets,steps,circuits,panel,equipment,fireDevices,fireStages,fireSource,soundPath,reachPath,escapePath,stations,safetyChecks,freshFarnsworth,farnsworthElectrical,farnsworthFire} from './src/farnsworth-project.mjs';
import {farnsworthTerms,termFor} from './src/farnsworth-glossary.mjs';
import {model} from './farnsworth-plan-parts.mjs';
import {farnsworthPlan} from './farnsworth-plan.mjs';
import * as lessons from './farnsworth-lessons.mjs';
import {powerStatus,routeLive} from './masters-power.mjs';

const {btn,actions,card}=lessons;
const $=id=>document.getElementById(id);
const key='space-electricity-farnsworth-06-v1',energyKey=key+':energy';
mountWorkbench({root:$('bay-app'),workspace:$('bay-workspace'),heading:$('page-heading'),canvases:$('bay-panes'),plan:$('bay-plan'),three:$('bay-canvas'),inspector:$('bay-inspector'),content:'#bay-lesson',status:$('bay-status'),extraMove:['#bay-return'],idleTitle:'하나를 눌러보세요.',zoomIn:document.querySelector('#drawing [data-zoom=in]'),zoomOut:document.querySelector('#drawing [data-zoom=out]'),pages:standardPages('#bay-lesson')});
let saved;
try{saved=JSON.parse(localStorage.getItem(key));}catch{}
const state=freshFarnsworth(saved);
const pages={
  home:['판스워스 주택','미스 반 데어 로에가 기둥 여덟 개와 유리로 지은 한 방짜리 집을 도면·3D·전기·소방·에너지로 읽습니다.'],
  building:['건물을 읽습니다.','테라스, 집 바닥, 지붕 세 판이 어떻게 놓였는지 평면과 단면에서 찾으세요.'],
  materials:['재료를 읽습니다.','강재·트래버틴·유리·프리마베라가 어디에 쓰였는지 누르세요.'],
  structure:['구조와 접합을 읽습니다.','기둥이 판을 뚫지 않고 테두리보 옆에 붙어 바닥과 지붕을 띄웁니다.'],
  electrical:['벽 없는 집의 전기를 설계합니다.','분전반에서 간접등·바닥 콘센트·인덕션·히트펌프까지 가는 길을 따라가세요.'],
  fire:['주택의 소방을 설계합니다.','감지기가 울리고 소화기를 들고 현관문으로 나가기까지 순서대로 확인하세요.'],
  safety:['판스워스 주택 학습 점검','직접 확인한 항목에 표시하세요. 이 브라우저에 학습 기록을 저장합니다.'],
  energy:['에너지를 계산합니다.','이 유리 집을 서울에 지으면 난방과 냉방이 얼마나 드는지 바꿔 보세요.'],
  glossary:['용어사전','도면과 수업에서 만나는 말을 찾아보세요.'],
  experience:['안에 서 봅니다.','강가 풀밭에서 테라스로, 베란다에서 거실로 걸어 들어가세요.'],
  calculations:['계산으로 확인합니다.','한 회로와 바닥 가로보 하나를 숫자로 따라가며, 식에 넣은 값이 도면 어디에서 왔는지 확인하세요.'],
  quantities:['설계를 재료와 수량으로 읽습니다.','같은 설계에서 기구와 강재·돌·유리 수량을 집계하고 산출 위치를 확인하세요.']
};
const menus={building:'room-living',materials:'col-s2',structure:'col-s2',electrical:panel.id,fire:fireSource};
// The few things worth picking first on each menu, shown above the drawing.
const quick={building:rooms.map(r=>[r.id,r.name]),materials:materials.map(m=>[m.target,m.name]),structure:[['col-s2','기둥'],['floor-fascia-s','바닥 테두리보'],['girder-f5','바닥 가로보'],['roof-fascia-s','지붕 테두리보']],
  electrical:[[panel.id,'분전반'],['LT1','간접등'],['FB3','바닥 콘센트'],['IH1','인덕션'],['HP1','히트펌프'],['SW1','스위치']],fire:[['SD1','연기 감지기'],['SD3','열 감지기'],['FE1','소화기']]};
let tab='home',drawing='A-601',selected='room-living',stage=-1,returnPage='',planZoom=1,layoutMode='split',night=false,wiring=false,focusOnOpen=null,termReturn='',glossaryTermOnOpen=null;
let scene=null,loading=null,epoch=0,reloadRequired=false,energy=null,energySun=null,energyNight=false,energyLabel=null,dictionary=null;
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{$('bay-status').textContent='이 브라우저에 학습 표시를 저장하지 못했습니다.';}}
const lookup=id=>[panel,...equipment,...fireDevices,...rooms,...model.elements].find(d=>d.id===id);
const sheet=()=>sheets.find(s=>s.id===drawing)??sheets[0];

function frame(){
  const electric=farnsworthElectrical(state),fire=farnsworthFire({signal:tab==='fire'&&stage>=0?fireSource:null});
  const color=Object.fromEntries(electric.circuits.map(c=>[c.id,c.color]));
  const paths=tab==='fire'?[[1,soundPath,'#d19129'],[2,reachPath,'#c8452f'],[3,escapePath,'#08734d','6 4']].filter(p=>stage>=p[0]).map(([,points,c,dash])=>({points,color:c,dash,radius:.05,through:true}))
    :tab==='electrical'?electric.routes.map(r=>{const d=electric.devices.find(x=>x.id===r.target),pick=r.target===selected||d?.switch===selected;return {points:r.points,color:routeLive(electric,state,r)?color[r.circuit]:'#8a9296',radius:pick?.06:.028,through:true};}):[];
  // Every route at once, for the in-wall wiring overlay of the walk.
  const wires=electric.routes.map(r=>({points:r.points,color:color[r.circuit],radius:.035,through:true}));
  return {electric,fire,paths,wires};
}
// The entrance doors swing open once the fire walk-through reaches the way out.
// The energy page shows the whole building under the sun of the chosen hour, so it borrows the lived-in view without its tools.
const sceneFrame=f=>{const sunny=tab==='energy',live=tab==='experience'||sunny;return {view:live?'site':sheet().view,studio:!live,id:live?null:selected,show:tab==='fire'?'fire':live?'all':'electrical',devices:[...f.electric.devices,...f.fire.devices],paths:sunny?[]:live?(wiring?f.wires:[]):f.paths,night:sunny?energyNight:night,power:tab==='electrical',open:tab==='fire'&&stage>=3};};

function renderInspector(f){
  const d=lookup(selected),host=$('bay-inspector');
  if(!d||tab==='experience'||tab==='energy'){host.innerHTML='<h2>하나를 눌러보세요.</h2><p>도면이나 건물의 기둥·유리·기구를 선택하면 설명과 치수가 나타납니다.</p>';return;}
  const actual=f.electric.devices.find(e=>e.id===d.id)??f.fire.devices.find(e=>e.id===d.id)??d,part=model.elements.includes(d)?provenance(d):null,term=termFor(d),definition=farnsworthTerms.get(term);
  const route=f.electric.routes.find(r=>r.target===d.id),length=route?route.points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(...p.map((v,j)=>v-route.points[i][j])),0):null;
  host.innerHTML='<h2>'+d.name+'</h2><div class="selection-id">'+d.id+'</div><p>'+(d.note??d.description??actual.stateLabel??definition?.plain??'')+'</p>'+
    (part?'<div class="basis"><b data-basis="'+part.label+'">'+part.label+'</b>'+(part.source?'<a href="'+part.source.url+'" target="_blank" rel="noopener">'+part.source.name+'</a>':'')+'</div>':'')+
    selectionDimensions(actual,{finishLevel:actual.pos?(actual.pos[2]<FLOOR?TZ:FLOOR):0,routeLength:length})+actions((definition?btn('쉬운 용어 설명','term',term):'')+(f.electric.circuits.some(c=>c.id===actual.circuit)?btn('이 회로 계산','open-calc',actual.circuit):'')+(d.id===calc.memberId?btn('이 부재 계산','open-calc','member'):''));
}

const directions={section:'동쪽을 보고 자른 모습 · 왼쪽이 북',joint:'동쪽을 보고 자른 모습 · 왼쪽이 북',circuit:'분전반에서 나가는 순서',materials:'재료 견본'};
function paint(){
  const f=frame(),workspace=!['home','safety','glossary','quantities','calculations'].includes(tab),live=tab==='experience',sunny=tab==='energy',walking=sunny?null:scene?.walking()??null;
  $('bay-app').dataset.page=tab;$('bay-walk').hidden=!live||!walking;
  if(live)$('bay-walk').innerHTML='<div><p>눈높이 1.6 m</p><p>휠: 시야 확대·축소 · W A S D: 이동</p></div><div class="move-buttons">'+stations.map(s=>btn(s.name,'walk',s.id)).join('')+btn('앞으로','walk','forward')+btn('뒤로','walk','back')+btn('왼쪽 이동','walk','strafe-left')+btn('오른쪽 이동','walk','strafe-right')+btn('왼쪽 보기','walk','left')+btn('오른쪽 보기','walk','right')+'</div>';
  $('bay-title').textContent=pages[tab][0];$('bay-intro').textContent=pages[tab][1];
  $('bay-workspace').hidden=!workspace;$('drawing').hidden=(live||sunny)&&layoutMode==='model';
  $('bay-model-title').textContent=sunny?energyLabel?.title??'판스워스 주택 모형':live?'판스워스 주택 · '+(stations.find(s=>s.id===walking)?.name??'강가에서 본 집'):'판스워스 주택 모형';
  $('drawing-title').textContent=sheet().id+' · '+sheet().title;$('drawing-direction').textContent=directions[sheet().view]??'위에서 본 모습';
  const menu=live||sunny?'building':tab;
  $('bay-sheet').innerHTML=sheets.filter(s=>s.menu===menu).map(s=>'<option value="'+s.id+'"'+(s.id===drawing?' selected':'')+'>'+s.id+' · '+s.title+'</option>').join('');
  if(workspace){$('bay-plan').innerHTML=farnsworthPlan({sheet:drawing,id:selected,electric:f.electric,fire:f.fire,state,paths:f.paths});planZoom=1;}
  if(live)mountExperienceTools($('bay-tools'),{night,wiring,route:()=>{wiring=!wiring;paint();$('bay-status').textContent=wiring?'벽과 바닥 속 전기 길을 회로 색으로 겹쳐 보입니다.':'전기 길을 숨겼습니다.';},render:()=>showScenePreview(scene?.image(),'판스워스 주택'),enter:()=>walk('living'),outside:()=>walk('outside'),setNight:on=>{night=on;paint();},preview:()=>showScenePreview(scene?.image(),'판스워스 주택')});
  else $('bay-tools').innerHTML=(quick[tab]??[]).map(([id,name])=>lessons.btn(name,'pick',id,lessons.pressed(id===selected))).join('');
  renderInspector(f);quantities.inspector($('bay-inspector'),selected);
  $('bay-render-label').textContent=sunny?energyLabel?.scene??'햇빛 계산':live?(night?'야간 조명':'하지 오후 · 플레이노'):'학습 보기';
  $('bay-view-help').textContent=live&&walking?'드래그로 둘러보기 · W A S D로 이동':sunny?'드래그로 회전 · 휠로 확대':'드래그로 회전 · 휠로 확대 · 대상을 눌러 정보 확인';
  const view={state,electric:f.electric,fire:f.fire,selected,stage,walking,wiring};
  if(tab==='glossary'){dictionary=mountGlossary($('bay-lesson'),[...farnsworthTerms.values()],{sample:6,action:'related-term',detailsAction:'term'});if(glossaryTermOnOpen){dictionary.input.value=farnsworthTerms.get(glossaryTermOnOpen)?.term??'';dictionary.update();glossaryTermOnOpen=null;}}
  else if(tab==='quantities')quantities.render();
  else if(tab==='energy')showEnergy();
  else if(tab==='calculations')$('bay-lesson').innerHTML=calc.html();
  else if(tab==='safety')$('bay-lesson').innerHTML=card('학습 기록 '+safetyChecks.filter(([id])=>state.checks[id]).length+' / '+safetyChecks.length,'<div class="checklist">'+safetyChecks.map(([id,label])=>'<div><label><input type="checkbox" data-check="'+id+'" '+(state.checks[id]?'checked':'')+'>'+label+'</label>'+btn('관련 수업','related',id)+'</div>').join('')+'</div>');
  else $('bay-lesson').innerHTML=({home:lessons.home,building:lessons.building,materials:lessons.material,structure:lessons.structure,electrical:lessons.electrical,fire:lessons.fire,experience:lessons.experience})[tab](view);
  for(const b of document.querySelectorAll('#learning-nav button[data-go]'))b.toggleAttribute('aria-current',false),b.dataset.go===tab&&b.setAttribute('aria-current','page');
  quantities.setPage(tab);$('bay-return').hidden=!returnPage||returnPage===tab;
  $('bay-panes').dataset.layout=layoutMode;for(const b of document.querySelectorAll('#bay-view-tools [data-layout]'))b.setAttribute('aria-pressed',String(b.dataset.layout===layoutMode));
  scene?.setActive(workspace);if(workspace)scene?.update(sceneFrame(f));
}

async function showEnergy(){
  const host=$('bay-lesson');
  try{energy??=(await import('./farnsworth-energy.mjs')).createFarnsworthEnergy({read:()=>{try{return JSON.parse(localStorage.getItem(energyKey))??{};}catch{return {};}},write:v=>{try{localStorage.setItem(energyKey,JSON.stringify(v));}catch{}},
    viewer:{setSun:v=>{energySun=v;if(tab==='energy')scene?.setSun(v);},setNight:on=>{energyNight=on;if(tab==='energy')scene?.setNight(on);},label:l=>{energyLabel=l;if(tab==='energy'){$('bay-model-title').textContent=l.title;$('bay-render-label').textContent=l.scene;}}}});if(tab==='energy')await energy.render(host);}
  catch(error){if(tab==='energy')host.innerHTML='<article class="bay-card"><h2>에너지 계산을 열지 못했습니다.</h2><p>'+error.message+'</p></article>';}
}

function ensureScene(){
  if(scene)return Promise.resolve(scene);
  if($('bay-workspace').hidden)return null;
  if(loading)return loading;
  const turn=++epoch,host=$('bay-canvas');
  host.innerHTML='<p role="status">3D 모형을 준비하고 있습니다.</p>';
  loading=(async()=>{
    try{const {mountFarnsworth,prepareFarnsworthMaterials}=await import('./farnsworth-view.mjs').catch(error=>{error.requiresReload=true;throw error;});await prepareFarnsworthMaterials();if(turn!==epoch||$('bay-workspace').hidden)return;
      // The notice stays in the host while the model is built in slices; a page that was left meanwhile gives the model back.
      const made=await mountFarnsworth(host,pick);if(turn!==epoch){made.dispose();return;}
      scene=made;scene.update(sceneFrame(frame()));return scene;}
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
  const menu=['experience','energy'].includes(tab)?'building':tab;if(!sheets.some(s=>s.id===drawing&&s.menu===menu))drawing=sheets.find(s=>s.menu===menu)?.id??'A-601';
  if(tab==='experience')drawing='A-601';
  $('site-top').dataset.menuOpen='false';$('menu-toggle').setAttribute('aria-expanded','false');$('menu-toggle').setAttribute('aria-label','학습 메뉴 열기');
  $('bay-status').textContent='';paint();scene?.setSun(tab==='energy'?energySun:null);const prepared=ensureScene();
  requestAnimationFrame(()=>{if(focused&&!$('bay-workspace').hidden)$('bay-workspace').scrollIntoView({block:'start'});else window.scrollTo({top:0,behavior:'instant'});});
  const ready=await prepared;if(request!==navigationId)return;
  $('bay-app').dataset.navigationMs=(performance.now()-started).toFixed(1);
  if(ready&&!$('bay-workspace').hidden){if(tab==='experience')ready.walk('outside');else if(tab==='energy'){ready.whole();ready.setSun(energySun);ready.setNight(energyNight);}await ready.present(()=>request===navigationId);if(request!==navigationId)return;$('bay-app').dataset.frameMs=(performance.now()-started).toFixed(1);}
}
function go(target,id=null){if(!Object.hasOwn(pages,target))return;if(id)focusOnOpen={menu:target,id};if(tab===target){if(id){selected=id;focusOnOpen=null;}paint();return;}location.hash=target;}

function moveTerm(id){
  const t=farnsworthTerms.get(id);if(!t)return;
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
const calc=createCalculations({key:key+':calc',file:'판스워스-계산.json',terms:farnsworthTerms,electric:()=>farnsworthElectrical(state),sheets,panel,plan:'E-601',drawing:'E-602',member:farnsworthMember({span:W,width:CANT,depth:FASCIA-.084}),destination,go,saveFile,paint,status:t=>{$('bay-status').textContent=t;}});
const farnsworthActions={
  ...calc.actions,
  go:b=>go(b.dataset.go),pick:b=>pick(b.dataset.pick),device:b=>pick(b.dataset.device),
  walk:b=>walk(b.dataset.walk),
  saveDrawing:()=>saveFile(drawing+'.svg',$('bay-plan').querySelector('svg').outerHTML,'image/svg+xml'),
  layout:b=>{layoutMode=b.dataset.layout;paint();},
  zoom:b=>zoomDrawing(b.dataset.zoom),
  whole:()=>{if(tab==='experience'||tab==='energy')walk('outside');else{paint();scene?.home();}},
  breaker:b=>{const id=b.dataset.breaker;if(!circuits.some(c=>c.id===id))return;state.breakers[id]=!state.breakers[id];save();paint();$('bay-status').textContent=powerStatus(farnsworthElectrical(state),state,'breaker',id);},
  power:()=>{state.power=state.power===false;save();paint();$('bay-status').textContent=powerStatus(farnsworthElectrical(state),state,'power','main');},
  switch:b=>{const id=b.dataset.switch;if(!Object.hasOwn(state.switches,id))return;state.switches[id]=!state.switches[id];save();paint();$('bay-status').textContent=powerStatus(farnsworthElectrical(state),state,'switch',id);},
  advance:()=>{if(stage<fireStages.length-1){stage++;selected=fireStages[stage].id;paint();}},
  resetTest:()=>{stage=-1;selected=fireSource;paint();},
  // 관련 수업: 그 메뉴로 가서 점검할 대상을 미리 고른다.
  related:b=>{const row=safetyChecks.find(([id])=>id===b.dataset.related);if(row)go(row[2],row[3]);},
  term:b=>moveTerm(b.dataset.term),
  relatedTerm:b=>{const target=farnsworthTerms.get(b.dataset.relatedTerm)?.target;if($('bay-term').open)$('bay-term').close();destination(target);},
  glossaryTerm:b=>{glossaryTermOnOpen=b.dataset.glossaryTerm;termReturn=tab;$('bay-term').close();go('glossary');},
  backReading:()=>{const back=returnPage;returnPage='';go(back);},
  retry:()=>{if(reloadRequired)location.reload();else ensureScene();},
  '#reframe':()=>{if(tab==='experience'||tab==='energy')walk('outside');else scene?.home();},
  '#bay-reset':()=>$('bay-reset-dialog').showModal(),
  '#bay-reset-confirm':()=>{clearLearningRecords(6,'farnsworth-06');try{localStorage.removeItem(energyKey);}catch{}energy=null;energySun=null;energyNight=false;energyLabel=null;calc.reset();Object.assign(state,freshFarnsworth());save();$('bay-reset-dialog').close();go('home');},
  '#menu-toggle':b=>{const active=$('site-top').dataset.menuOpen!=='true';$('site-top').dataset.menuOpen=String(active);b.setAttribute('aria-expanded',String(active));b.setAttribute('aria-label',active?'학습 메뉴 닫기':'학습 메뉴 열기');}
};
bindActions([$('site-top'),$('bay-app'),$('bay-term'),$('bay-reset-dialog')],farnsworthActions,error=>{$('bay-status').textContent='작업을 마치지 못했습니다: '+error.message;});
document.addEventListener('keydown',e=>{if(e.target.matches?.('[data-device]')&&['Enter',' '].includes(e.key)){e.preventDefault();pick(e.target.dataset.device);}});
$('bay-app').addEventListener('submit',e=>calc.submit(e));
$('bay-app').addEventListener('change',e=>{if(calc.change(e))return;const check=e.target.dataset.check;if(check){state.checks[check]=e.target.checked;save();paint();document.querySelector('[data-check="'+check+'"]')?.focus();return;}const id=e.target.dataset.complete;if(!id)return;state.completed=steps.filter(s=>s.id===id?e.target.checked:state.completed.includes(s.id)).map(s=>s.id);save();paint();});
const quantities=createQuantities({host:$('bay-lesson'),nav:$('learning-nav'),workspace:$('bay-workspace'),go,read:()=>{const f=frame();return {sample:'farnsworth',model,electric:f.electric,fire:f.fire,panel,rebar:{bars:[]},resolveSheet:e=>['frame','column'].includes(e.kind)?'S-601':'A-601'};},locate:async m=>{drawing=m.sheet;returnPage='quantities';focusOnOpen={menu:m.menu,id:m.id};history.replaceState(null,'','#'+m.menu);await openPage();return !reloadRequired;}});
mountSamples(6,()=>go('home'),()=>go('glossary'));
window.addEventListener('hashchange',openPage);
$('bay-view-tools').addEventListener('change',event=>{if(event.target.id!=='bay-sheet')return;const s=sheets.find(s=>s.id===event.target.value);if(!s)return;drawing=s.id;paint();$('bay-status').textContent=s.title+'와 같은 방향으로 3D를 전환했습니다.';});
window.addEventListener('pagehide',e=>{scene?.setActive(false);if(!e.persisted){epoch++;scene?.dispose();}});
window.addEventListener('pageshow',e=>{if(e.persisted)scene?.setActive(!$('bay-workspace').hidden);});
openPage();
