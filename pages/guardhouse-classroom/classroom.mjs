import {createQuantities} from './quantities-ui.mjs';
import {createPowerExplanation} from './power-explanation.mjs';
import {createDomainExplanation} from './domain-explanation.mjs';
import {fireExplanation,structureExplanation,materialExplanation} from './src/domain-explanations.mjs';
import {electricalTagTerms} from './src/electrical-tags.mjs';
let powerExplanation,domainExplanation;
function updatePowerExplanation(){powerExplanation?.update({electric,page,selected});updateDomainExplanation();}
import {mountExperienceTools,showScenePreview,lightingSwitchButtons,lightingSummary} from './workspace-ui.mjs';
import {mountSamples,mountGlossary} from './learning-shell.mjs';
import {withStudyConcepts} from './src/study-content.mjs';
import {bindActions} from './action-events.mjs';
import {lessonSummary,electricalSheet} from '/pages/guardhouse-classroom/src/lesson-catalog.mjs';
import {workstationEditor} from './workstation-editor.mjs';
import {fireSimulationResult,FirePracticePower} from '/pages/guardhouse-classroom/src/fire-simulation.mjs';
const practicePower=new FirePracticePower();
import {guardhouseFireLesson} from '/pages/guardhouse-classroom/src/guardhouse-fire-lesson.mjs';
import {tourControls} from './electrical-tour-ui.mjs';
import {readerKey,calculationKey,readStored,writeStored,readerContext,readerHash} from './reader-state.mjs';
import {project as baseProject,glossary as baseGlossary,boundsOf,referencesFor as baseRefs,termFor as baseTerm,buildClassroomModel} from '/pages/guardhouse-classroom/src/classroom-project.mjs';
import {extraSheets,extraGlossary,freshExpansion,restoreExpansion,fireModel,materialLayers,finishes,inspectionItems,inspectionSummary,pitInfo} from '/pages/guardhouse-classroom/src/lesson-expansion.mjs';
import {fireContent,materialsContent,safetyContent} from './lesson-expansion-ui.mjs';
const project={...baseProject,sheets:[...baseProject.sheets,...extraSheets]},glossary=withStudyConcepts([...baseGlossary,...extraGlossary,...electricalTagTerms(baseProject)]);
const referencesFor=e=>e.system==='fire'?['F-101','F-102']:e.system==='materials'?['M-101']:baseRefs(e);
const termFor=e=>e.system==='fire'?({smoke:'detector',heat:'detector',alarm:'fire-alarm'})[e.kind]??e.kind:e.system==='materials'?e.id==='material-insulation'?'insulation':'finish':baseTerm(e);
import {mountWorkbench,standardPages} from './workbench.mjs';
import {clearLearningRecords} from './study-state.mjs';
import {freshExercise,restoreExercise,electricalModel,reinforcementFor,structuralCalculation,slabCalculation,validLightPosition,routeLength} from '/pages/guardhouse-classroom/src/learning-engine.mjs';

import {sheetSVG} from './classroom-plan.mjs';
const $=id=>document.getElementById(id),esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const mm=v=>Math.round(v*1000).toLocaleString('ko-KR'),f=(v,n=2)=>v.toLocaleString('ko-KR',{maximumFractionDigits:n,minimumFractionDigits:n});
const workbench=mountWorkbench({root:$('app'),workspace:$('workspace'),heading:$('page-heading'),canvases:$('canvas-row'),plan:$('plan-host'),three:$('three-host'),inspector:$('inspector'),content:'#page-content',idleTitle:'하나를 눌러보세요.',zoomIn:$('plan-zoom-in'),zoomOut:$('plan-zoom-out'),pages:standardPages('#page-content')});
const storageKey='guardhouse-classroom-v1';let exercise=freshExercise();try{exercise=restoreExercise(JSON.parse(localStorage.getItem(storageKey)));}catch{$('save-state').textContent='새 실습으로 시작합니다';}
const expansionKey='guardhouse-expansion-v1';let expansion=freshExpansion();try{expansion=restoreExpansion(JSON.parse(localStorage.getItem(expansionKey)));}catch{}expansion.signal=null;let fire=fireModel(expansion,exercise.power);
function saveExpansion(){try{localStorage.setItem(expansionKey,JSON.stringify({...expansion,battery:practicePower.baseline?.battery??expansion.battery,signal:null}));$('save-state').textContent='실습 저장됨';}catch{$('save-state').textContent='현재 화면에만 유지됩니다';}}
const load=async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error('교육 자료를 읽지 못했습니다: '+url);return r.json();};
let model,projections={},reinforcement,electric,structure,viewer,page='home',sheet=project.sheets[0],selected=null,layout='split',planView=[0,0,1000,710],currentRoom='guard';
const status=(text,error=false)=>{$('status').textContent=text;$('status').classList.toggle('error',error);};
const download=(name,data,type)=>{const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function save(){try{localStorage.setItem(storageKey,JSON.stringify({...exercise,power:practicePower.baseline?.power??exercise.power}));$('save-state').textContent='실습 저장됨';}catch{$('save-state').textContent='저장 공간을 사용할 수 없어 현재 화면에만 유지됩니다';}}
const navData={home:['LESSON 01 · GUARDHOUSE','작은 건물에서 전기를 배웁니다.','도면이 처음이어도 괜찮습니다. 건물을 살펴보고, 직접 불을 켜보세요.'],building:['01 · 공간 읽기','도면과 건물은 같은 공간입니다.','도면을 고르면 보는 방향이 바뀝니다. 벽이나 창문을 눌러 두 화면에서 확인하세요.'],structure:['02 · 구조 이해','콘크리트 속을 들여다봅니다.','무게는 지붕에서 벽으로, 벽에서 기초로 전달됩니다. 철근과 계산을 함께 확인하세요.'],electrical:['03 · 전기설계','기구에서 회로까지 연결합니다.','조명과 콘센트를 선택하고, 실제 경로와 회로도를 비교하세요.'],calculations:['04 · 계산과 확인','숫자가 설계를 설명합니다.','단위와 조건부터 살펴보고, 기구나 하중을 바꿔 결과를 비교하세요.'],glossary:['REFERENCE · 용어사전','처음 듣는 말, 공간에서 찾아보세요.','쉬운 뜻과 전기설계에서의 쓰임을 함께 정리했습니다.'],experience:['05 · 실감 체험','이제 경비실 안으로 들어갑니다.','눈높이로 걸어 보고 벽의 스위치를 눌러보세요. 밤에는 조명의 변화가 더 잘 보입니다.']};
Object.assign(navData,{fire:['FIRE · 소방설계','위험을 감지하고, 알리고, 빠져나옵니다.','감지기·수신기·경보·유도등을 같은 도면과 건물에서 연결합니다.'],safety:['CHECK · 안전점검','어디를 왜 살펴봐야 할까요?','소방·피난·전기·PIT·구조·재료를 차례로 살펴보고 관찰한 내용을 기록합니다.'],materials:['MATERIAL · 재료와 외관','벽의 겉과 속을 함께 봅니다.','외관을 바꾸고, 단열재와 콘크리트가 맡은 역할을 한 층씩 확인하세요.']});
navData.quantities=['QUANTITY · 재료·수량','설계를 재료와 수량으로 읽습니다.','같은 설계에서 기구·건축 구성체·철근을 집계하고 산출 위치를 확인하세요.'];
navData["fire"]=["FIRE · 소방설계","소방기구는 어디에 있을까요?","도면과 건물에서 감지기·경보 장치·소화기의 위치를 찾아보세요."];
navData["fire-test"]=["FIRE · 소방설계","연기 발생부터 대피까지 체험합니다.","발생 공간을 고르고 연기를 발생시키세요. 감지와 경보가 이어지면 대피 또는 초기 소화 조작을 선택합니다."];
navData["fire-signal"]=["FIRE · 소방설계","기구의 신호와 전원을 시험합니다.","연기를 만들지 않고 감지 입력과 전원에 따른 장치의 반응만 비교합니다."];
function setLayout(value){layout=value;$('canvas-row').dataset.layout=value;document.querySelectorAll('[data-layout]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.layout===value));});viewer?.size();}
let dataPending,viewerPending,navigationId=0,retryNavigation=null,reloadRequired=false;
let guide,guidePending,activeCalculation,calculationReturn=false;
const calcState={mode:'electrical',circuit:'L1',member:'roof',step:null,live:1};
const savedCalculation=readStored(()=>sessionStorage,calculationKey);
if(savedCalculation){
 if(['electrical','structure','trial'].includes(savedCalculation.mode))calcState.mode=savedCalculation.mode;
 if(project.circuits.some(c=>c.id===savedCalculation.circuit))calcState.circuit=savedCalculation.circuit;
 if(['roof','floor','pit','canopy','wall','foundation'].includes(savedCalculation.member))calcState.member=savedCalculation.member;
 if(typeof savedCalculation.step==='string'&&/^[a-z][a-z-]{0,60}$/.test(savedCalculation.step))calcState.step=savedCalculation.step;
 if(Number.isFinite(savedCalculation.live)&&savedCalculation.live>=0&&savedCalculation.live<=20)calcState.live=savedCalculation.live;
}
const bookReading=readerContext(location.search);
if(bookReading){document.body.classList.add('book-excursion');$('site-top').insertAdjacentHTML('beforeend',`<div class="reader-returnbar"><span>계산 해설서에서 살펴보는 중</span><a id="return-book" class="button" href="/pages/guardhouse-classroom/education/calculation-book.html${readerHash(bookReading)}">해설서 이어 읽기</a></div>`);}

navData.energy=['ENERGY · 날씨와 에너지','햇빛과 바깥 온도가 전기를 바꿉니다.','서울의 1년 날씨로 해의 길과 열의 흐름을 계산합니다. 유리와 단열을 바꿔 결과를 비교하세요.'];
// The weather lesson loads its year of Seoul weather only when it is opened.
let energyLesson=null,energyPending=null;
async function ensureEnergy(){if(energyLesson)return;if(!energyPending)energyPending=(async()=>{const m=await import('./energy-ui.mjs');await m.loadWeather();energyLesson=new m.EnergyLesson({model,project,viewer,finish:expansion.finish,labels:{view:$('view-name'),scene:$('scene-label'),render:$('render-label')}});})().catch(error=>{energyPending=null;throw error;});return energyPending;}
async function ensureGuide(){if(guide)return;if(!guidePending)guidePending=import('./calculation-guide.mjs').then(m=>{guide=m;glossary.push(...m.calculationGlossary);}).catch(error=>{guidePending=null;error.requiresReload=true;throw error;});return guidePending;}
function offerCalculationReturn(showContext=false){
 $('calculation-context-note')?.remove();
 if(!calculationReturn||page==='calculations')return;
 if(!$('return-calculation'))$('page-actions').insertAdjacentHTML('beforeend','<button id="return-calculation">읽던 공식으로 돌아가기</button>');
 if(showContext&&!$('workspace').hidden&&activeCalculation){const step=activeCalculation.steps.find(s=>s.id===calcState.step);$('workspace').insertAdjacentHTML('afterbegin',`<div id="calculation-context-note" class="calc-linked-note"><div><strong>${esc(activeCalculation.title)} 계산에서 살펴보는 위치</strong><span>${esc(step?.title??'계산 과정')} · 주황색으로 선택한 대상을 도면과 3D에서 확인하세요.</span></div><button data-return-calculation="true">공식으로 돌아가기</button></div>`);}
}
async function returnToCalculation(){if(!await go('calculations'))return;document.querySelector('.calc-formula')?.scrollIntoView({block:'start'});$('calc-step')?.focus({preventScroll:true});}
async function openCalculationTarget(sheetId,element,circuit){calculationReturn=true;if(!await followRef(sheetId,element))return;if(circuit)focusCircuit(circuit);offerCalculationReturn(true);$('workspace').scrollIntoView({block:'start'});}

import {yieldForPaint as yieldPaint,handBack} from './render-loop.mjs';
function loading(message){$('loading-state').hidden=false;$('loading-message').textContent=message;$('loading-recovery').hidden=true;$('loading-progress').hidden=false;}
async function ensureData(){if(model)return;if(!dataPending)dataPending=(async()=>{const source=await load('/pages/guardhouse-classroom/runtime/model.json');model=buildClassroomModel(source);reinforcement=reinforcementFor(model);structure=structuralCalculation(model);electric=electricalModel(exercise);$('app').dataset.dataReady='true';})().catch(error=>{dataPending=null;model=null;throw error;});return dataPending;}
async function ensureViewer(){if(viewer)return;if(!viewerPending)viewerPending=(async()=>{await ensureData();await yieldPaint();const [module,{ApartmentFireView},{FireSimulation}]=await Promise.all([import('./classroom-view.mjs').then(async module=>{await module.ClassroomView.prepare();return module;}),import('./apartment-fire-view.mjs'),import('./fire-simulation.mjs')]).catch(error=>{error.requiresReload=true;throw error;});await yieldPaint();const next=new module.ClassroomView($('three-host'),{onSelect:select,onSwitch:toggleSwitch,onMove:name=>status(name+' · 실내 이동 중')});
 // The view is made in steps with the page free in between, and draws nothing until it is whole.
 try{next.preparing=true;await handBack();next.load(model,reinforcement);await handBack();next.fireGuide=new ApartmentFireView(next);next.updateElectrical(electric);next.updateFire(fire);next.setFinish(expansion.finish);next.simulation=new FireSimulation(next,{readFire:()=>({...fire,powered:fire.supplied}),lesson:id=>guardhouseFireLesson(fire,id),onSignal:id=>{expansion.signal=id;refreshElectrical();},onPower:kind=>{if(kind==='power'){exercise.power=!exercise.power;save();}else{expansion.battery=!expansion.battery;saveExpansion();}refreshElectrical();},before:()=>{stopFireGuide();viewer.tour.stop();$('route-lesson').hidden=true;setLayout('model');$('view-name').textContent='소방 실감 시뮬레이션';},navigate:async(kind,id)=>{if(kind==='term')showTerm(['extinguish','extinguished'].includes(viewer.simulation.state.phase)?'extinguisher':'detector');else if(kind==='safety')await go('safety');else{await go('fire','F-101');select(id);setLayout('split');}}});await handBack();next.preparing=false;viewer=next;$('app').dataset.viewerReady='true';}catch(error){next.dispose();throw error;}})().catch(error=>{viewerPending=null;throw error;});return viewerPending;}
function closeMenu(restoreFocus=false){$('site-top').dataset.menuOpen='false';$('menu-toggle').setAttribute('aria-expanded','false');$('menu-toggle').setAttribute('aria-label','학습 메뉴 열기');if(restoreFocus)$('menu-toggle').focus();}
$('menu-toggle').onclick=()=>{const open=$('menu-toggle').getAttribute('aria-expanded')!=='true';$('site-top').dataset.menuOpen=String(open);$('menu-toggle').setAttribute('aria-expanded',String(open));$('menu-toggle').setAttribute('aria-label',open?'학습 메뉴 닫기':'학습 메뉴 열기');};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('site-top').dataset.menuOpen==='true'){closeMenu(true);}});
document.addEventListener('click',e=>{if(!$('site-top').contains(e.target))closeMenu();});
matchMedia('(max-width:1100px)').addEventListener('change',()=>closeMenu());
let fireGuideId='SD01',fireGuideStep=0;
function stopFireGuide(){viewer?.fireGuide?.stop();$('fire-lesson').hidden=true;$('fire-guide-dock').hidden=true;}
function fireModelView(){setLayout('model');$('model-panel').scrollIntoView({block:'start',behavior:'instant'});}
function locateFire(id){viewer.simulation?.leave();stopFireGuide();viewer.view('fire','iso');viewer.fireGuide.focus(id);select(id);$('view-name').textContent=fire.devices.find(d=>d.id===id).name;fireModelView();}
function openFireGuide(id,step){viewer.simulation?.leave();fireGuideId=id;fireGuideStep=step;viewer.fireGuide.show(guardhouseFireLesson(fire,id),step,{...fire,powered:fire.supplied});select(viewer.fireGuide.lesson.steps[step].target);renderFireGuide();$('view-name').textContent=viewer.fireGuide.lesson.steps[step].title;fireModelView();}
function renderFireGuide(){if(!viewer?.fireGuide.active)return;const lesson=guardhouseFireLesson(fire,fireGuideId),step=lesson.steps[fireGuideStep],playing=viewer.fireGuide.playing,disabled=fireGuideStep===0||fireGuideStep===1&&!fire.alarm;
 $('fire-lesson').hidden=false;$('fire-lesson').innerHTML='<div class="tour-heading"><h2>'+step.title+'</h2><button id="fire-guide-close">안내 닫기</button></div><div class="tour-steps">'+lesson.steps.map((s,i)=>'<button data-fire-guide-step="'+i+'" aria-pressed="'+(i===fireGuideStep)+'">'+s.title+'</button>').join('')+'</div><p class="tour-explanation">'+step.text+'</p><p role="status">'+(fire.alarm?'경보 작동':fire.supplied?'감시 중':'소방 전원 없음')+' · '+(fire.mains?'상용 전원':fire.battery?'예비전원':'모든 전원 꺼짐')+'</p><div class="button-row"><button data-fire-action="mains">일반 전원 '+(fire.mains?'켜짐':'꺼짐')+'</button><button data-fire-action="battery">예비전원 '+(fire.battery?'사용':'미사용')+'</button><button data-fire-action="reset">화재신호 복구</button><button data-ref="F-102">신호·전원 원리도</button><button data-term="fire-alarm">경보장치 뜻</button></div>';
 const dock=$('fire-guide-dock');dock.hidden=false;dock.innerHTML='<strong>'+step.title+'</strong><div class="button-row"><button id="fire-previous" '+(fireGuideStep===0?'disabled':'')+'>이전 단계</button><button id="fire-play" '+(disabled?'disabled':'')+'>'+(playing?'일시정지':'경로 재생')+'</button><button id="fire-next" '+(fireGuideStep===2?'disabled':'')+'>다음 단계</button><button id="fire-explanation">설명·전원 설정</button></div>';
 $('fire-previous').onclick=()=>openFireGuide(fireGuideId,fireGuideStep-1);$('fire-next').onclick=()=>openFireGuide(fireGuideId,fireGuideStep+1);$('fire-play').onclick=()=>{viewer.fireGuide.play();renderFireGuide();};$('fire-explanation').onclick=()=>$('fire-lesson').scrollIntoView({block:'start'});$('fire-guide-close').onclick=stopFireGuide;
}
$('three-host').addEventListener('fire-guide-ended',renderFireGuide);

const tourState={id:'L01',step:0,playing:false,follow:!matchMedia('(prefers-reduced-motion: reduce)').matches,ghost:true};
function renderTour(){const el=$('route-lesson');el.innerHTML=tourControls(electric,tourState);el.hidden=false;$('tour-target').onchange=e=>openTour(e.target.value,0);$('tour-close').onclick=()=>{viewer.tour.stop();viewer.applyVisibility();el.hidden=true;};$('tour-play').onclick=()=>{viewer.tour.play();tourState.playing=viewer.tour.playing;$('tour-play').textContent=tourState.playing?'따라가기 일시정지':'배관 따라가기';};$('tour-follow').onchange=e=>{tourState.follow=viewer.tour.follow=e.target.checked;};$('tour-ghost').onchange=e=>{tourState.ghost=viewer.tour.ghost=e.target.checked;viewer.applyVisibility();viewer.tour.readout();};$('tour-calculation').onclick=async()=>{await ensureGuide();calcState.mode='electrical';calcState.circuit='L1';calcState.step='route-length';await go('calculations');$('page-actions').innerHTML='<button data-tour-return="true">전기 길 이어보기</button>';};}
async function openTour(id=tourState.id,step=tourState.step){if(page!=='electrical'&&!await go('electrical','E-101'))return;viewer.view('electrical','iso');viewer.electricalSheet='E-101';viewer.setRealistic(true);Object.assign(tourState,{id,step,playing:false});viewer.tour.ghost=tourState.ghost;viewer.tour.follow=tourState.follow;viewer.tour.show(id,step);selected=viewer.tour.data.steps[step].element;renderSelection();renderPlan();renderTour();$('view-name').textContent='전기 길 · '+viewer.tour.data.light.name;$('scene-label').textContent=viewer.tour.data.steps[step].title;$('render-label').textContent='재질·조명 · 배관 안내';$('workspace').scrollIntoView({block:'start'});}
async function go(menu,sheetId=null){
 closeMenu();viewer?.simulation?.leave();const restored=practicePower.transition(menu,{power:exercise.power,battery:expansion.battery});if(restored){exercise.power=restored.power;expansion.battery=restored.battery;expansion.signal=null;fire=fireModel(expansion,exercise.power);electric=electricalModel(exercise);viewer?.updateElectrical(electric);viewer?.updateFire(fire);}stopFireGuide();if(viewer)viewer.tour.stop();$('route-lesson').hidden=true;
 delete $('app').dataset.frameMs;delete $('app').dataset.navigationMs;$('app').dataset.sceneCache=viewer?'reused':'initial';
 const request=++navigationId,start=performance.now(),target=navData[menu]?menu:'home';retryNavigation=[target,sheetId];$('loading-title').textContent='선택한 학습을 준비합니다.';
 try{
 const scenePage=['building','structure','electrical','experience','fire','fire-test','fire-signal','materials','energy'].includes(target);
 if(scenePage&&(!viewer||target==='experience'&&!viewer.environment)){
  loading(target==='experience'?'실감 체험의 재질·조명과 첫 화면을 준비하고 있습니다.':'도면과 3D 공간을 준비하고 있습니다. 다른 메뉴도 이용할 수 있습니다.');
  $('loading-state').scrollIntoView({block:'center',behavior:'instant'});await yieldPaint();if(request!==navigationId)return false;
 }
 if(scenePage)await ensureViewer();else if(target==='quantities')await ensureData();else if(target==='calculations'){if(!model)loading('건물의 치수와 회로 정보를 준비하고 있습니다.');await Promise.all([ensureData(),ensureGuide()]);}else if(target==='glossary')await ensureGuide();
  if(target==='structure')await ensureGuide();
  if(target==='energy'){if(!energyLesson)loading('서울의 1년 날씨를 준비하고 있습니다.');await ensureEnergy();}
  if(request!==navigationId)return false;reloadRequired=false;delete $('app').dataset.loadError;

 page=navData[menu]?menu:'home';$('app').dataset.page=page;updatePowerExplanation();
 document.querySelectorAll('.fire-pages button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nav===(page==='fire-signal'?'fire-test':page))));const [step,title,description]=navData[page];$('page-step').textContent=step;$('page-title').textContent=title;$('page-description').textContent=description;
 document.querySelectorAll('[data-menu]').forEach(b=>{if(b.dataset.menu===(page.startsWith('fire')?'fire':page))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 $('home-intro').hidden=page!=='home';$('lesson-path').hidden=page!=='home';$('workspace').hidden=['home','calculations','glossary','safety','quantities'].includes(page);$('home-preview').hidden=page!=='home';$('page-content').replaceChildren();$('page-actions').replaceChildren();
 viewer?.setActive(!$('workspace').hidden);viewer?.exitWalk(false);$('walk-tools').hidden=true;$('walk-crosshair').hidden=true;
 if(viewer&&['building','structure','electrical','experience','fire','fire-test','fire-signal','materials','energy'].includes(page)){
  const group=page.startsWith('fire')?'fire':['experience','energy'].includes(page)?'building':page;
  $('sheet-select').innerHTML=project.sheets.filter(s=>s.menu===group).map(s=>`<option value="${s.id}">${s.id} · ${s.title}</option>`).join('');
  const next=sheetId??({structure:'S-101',electrical:'E-101',fire:'F-101','fire-test':'F-101','fire-signal':'F-101',materials:'M-101',energy:'A-105'}[page]??'A-101');setSheet(next);
  setLayout(['experience','fire-test','fire-signal','energy'].includes(page)?'model':'split');
  viewer.setStudio(!['experience','energy'].includes(page));
  if(page!=='energy')viewer.setSun(null);
  if(page==='experience'){viewer.whole();viewer.setRealistic(true);viewer.setNight(true);$('view-name').textContent='경비실 · 전체 건물';$('scene-label').textContent='경비실 · 야간 외관';$('render-label').textContent='실감 렌더링';}
  else if(page==='energy'){viewer.whole();viewer.setRealistic(true);}
  else {viewer.setRealistic(false);viewer.setNight(false);$('render-label').textContent='학습 보기';}
  contextTools();
 }
 if(page==='fire')$('page-content').innerHTML='<article class="card"><h2>기구의 위치 찾기</h2><div class="button-row">'+fire.devices.map(d=>'<button data-select="'+d.id+'">'+esc(d.name)+'</button>').join('')+'</div></article>';if(page==='fire-signal')$('page-content').innerHTML=fireContent(fire,expansion);if(page==='fire-test')$('page-content').innerHTML='<button data-nav="fire-signal">기구 신호만 따로 시험하기</button>';if(page==='materials'){$('page-content').innerHTML=materialsContent(expansion);viewer.setRealistic(true);}if(page==='safety'){renderSafety();}
 quantities.setPage(page);if(page==='quantities')quantities.render();if(page==='structure')structureContent();if(page==='electrical')electricalContent();if(page==='calculations')calculationsContent();if(page==='glossary')glossaryContent();if(page==='experience')experienceContent();if(page==='energy'){
  // The 3D switch above and the lesson below are each a good piece of work, so the page gets the thread back between them.
  await handBack();if(request!==navigationId)return false;
  energyLesson.setFinish(expansion.finish);energyLesson.render($('page-content'));}if(page==='building')buildingContent();$('view-help').textContent='드래그로 회전 · 휠로 확대 · 대상을 눌러 정보 확인';
 viewer?.simulation?.setPage(page);if(page==='home')renderPath();offerCalculationReturn();history.replaceState(null,'','#'+page);viewer?.size();$('app').dataset.navigationMs=(performance.now()-start).toFixed(1);if(viewer&&!$('workspace').hidden){await viewer.present(()=>request===navigationId);if(request!==navigationId)return false;$('app').dataset.frameMs=(performance.now()-start).toFixed(1);}$('loading-state').hidden=true;$('app').dataset.ready='true';return true;
 }catch(error){if(request!==navigationId)return false;reloadRequired=Boolean(error.requiresReload);loading('선택한 학습을 준비하는 중 오류가 발생했습니다. 다시 시도하거나 다른 학습 메뉴를 이용해 주세요.');$('loading-title').textContent=reloadRequired?'3D 파일을 다시 받아야 합니다.':'학습을 불러오지 못했습니다.';$('loading-recovery').hidden=false;$('loading-progress').hidden=true;delete $('app').dataset.ready;$('app').dataset.loadError=error.message;return false;}
}
function setSheet(id){
 stopFireGuide();
 $('route-lesson').hidden=true;
 $('walk-tools').hidden=true;$('walk-crosshair').hidden=true;
 sheet=project.sheets.find(s=>s.id===id)??project.sheets[0];$('sheet-select').value=sheet.id;selected=null;viewer.highlight(null);viewer.circuitFocus=null;viewer.rebarFocus=null;
 const cameraView=sheet.view.startsWith('rebar')||['lighting','power','circuit','details','fire-plan','fire-signal','materials'].includes(sheet.view)?'iso':sheet.view;
 viewer.rebarSheet=sheet.mode==='rebar'?sheet.id:null;viewer.electricalSheet=sheet.mode==='electrical'?sheet.id:null;viewer.view(sheet.mode,cameraView);if(sheet.id==='S-101'){viewer.rebarFocus='roof';viewer.applyVisibility();}
 if(sheet.id==='A-108')viewer.pitView();if(sheet.id==='S-101')viewer.focusMember('roof');if(sheet.id==='M-101')viewer.materialView(false);
 $('sheet-name').textContent=sheet.id+' · '+sheet.title;$('view-name').textContent=sheet.plain;$('scene-label').textContent=sheet.id+' · '+sheet.plain;resetPlan();renderPlan();renderSelection();
 $('spatial-note').hidden=sheet.id!=='A-108';if(sheet.id==='A-108'){const p=pitInfo(model);$('spatial-note').innerHTML=`<strong>PIT는 화장실·탕비실 바닥 아래의 빈 공간입니다.</strong><span>기초는 건물을 받치는 콘크리트 구조이고, PIT는 그 벽과 바닥 사이의 공간입니다. 내부 ${mm(p.width)} × ${mm(p.depth)} mm, 바닥판 아래 여유 높이 ${mm(p.clearHeight)} mm. 점검구는 600 × 600 mm입니다. 반투명 판은 1층 바닥이며 점검구 덮개는 위치를 보여주기 위해 위로 들어 올렸습니다.</span>`;}
 status($('plan-host').dataset.loading?'선택한 도면을 준비하고 있습니다.':`${sheet.title}와 3D를 연결했습니다. 도면과 같은 방향으로 살펴보세요.`);$('selection-sync').textContent=$('plan-host').dataset.loading?'도면 준비 중':'도면·3D 연결됨';contextTools();
}
const projectionPending=new Map();
function projectionKey(){const view=sheet.view;return ['circuit','fire-signal','materials'].includes(view)?null:['lighting','power','rebar-slab','rebar-wall','details','fire-plan'].includes(view)?'plan':view;}
function renderPlan(){if(!model)return;const key=projectionKey();
 if(key&&!projections[key]){$('save-svg').disabled=true;$('plan-host').dataset.loading='true';$('plan-host').innerHTML='<div class="plan-loading" role="status">'+sheet.title+'를 준비하고 있습니다.</div>';
  if(!projectionPending.has(key)){const pending=load('/pages/guardhouse-classroom/runtime/projection-'+key+'.json').then(lines=>{projections[key]=lines;if(projectionKey()===key)renderPlan();}).catch(error=>{if(projectionKey()===key){$('plan-host').innerHTML='<div class="plan-loading" role="status">도면을 불러오지 못했습니다.<button data-retry-plan="true">도면 다시 불러오기</button></div>';$('selection-sync').textContent='도면 준비 실패';}}).finally(()=>projectionPending.delete(key));projectionPending.set(key,pending);}return;}
 const wasLoading=$('plan-host').dataset.loading==='true';delete $('plan-host').dataset.loading;$('save-svg').disabled=false;if(wasLoading&&!selected){$('selection-sync').textContent='도면·3D 연결됨';status(sheet.title+'와 3D를 연결했습니다.');}
$('plan-host').innerHTML=sheetSVG({sheet,model,projections,electric,rebar:reinforcement,selected,fire,finish:expansion.finish});$('learning-plan').setAttribute('viewBox',planView.join(' '));}
function resetPlan(){planView=[0,0,1000,710];$('learning-plan')?.setAttribute('viewBox',planView.join(' '));}
function selectedElement(){if(selected?.startsWith('room-'))return {kind:'room',...project.rooms.find(r=>'room-'+r.id===selected)};return fire.devices.find(d=>d.id===selected)??materialLayers.find(d=>d.id===selected)??electric.devices.find(d=>d.id===selected)??model.elements.find(e=>e.id===selected);}
function selectRoom(id){
 const room=project.rooms.find(r=>r.id===id);if(!room)return;currentRoom=id;setSheet('A-101');setLayout('split');selected='room-'+id;viewer.highlight(selected);renderPlan();renderSelection();
 document.querySelectorAll('[data-room-info]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.roomInfo===id)));
 $('room-description').textContent=room.name+'을 두 화면의 노란 영역으로 표시했습니다. '+room.description;
 $('room-next').hidden=false;$('room-next').innerHTML='<button data-room-electric="'+id+'">'+room.name+' 전기기구 보기</button><button data-room-enter="'+id+'">'+room.name+' 안으로 들어가기</button>';
 $('view-name').textContent=room.name+' · 방 위치';$('scene-label').textContent=room.name+' · 노란 영역';$('selection-sync').textContent=room.name+' · 2D·3D 같은 공간';status(room.name+' 위치를 표시했습니다. 전기기구 또는 실내 체험으로 이어가세요.');$('workspace').scrollIntoView({block:'start'});
}
function select(id,source='list'){
 const found=fire.devices.find(d=>d.id===id)??materialLayers.find(d=>d.id===id)??electric.devices.find(e=>e.id===id)??model.elements.find(e=>e.id===id);if(!found)return;
 if(found.system==='materials'&&!viewer.materialExpanded)viewer.materialView(true);
 if(page==='electrical'&&sheet.id!=='E-103'&&found.circuit){const target=electricalSheet(project,found);if(target&&sheet.id!==target)setSheet(target);}
 selected=id;viewer.highlight(id);renderPlan();renderSelection();$('selection-sync').textContent=`${id} · 2D·3D 같은 대상`;status(`${found.name} 선택 · 치수와 연결 도면을 확인하세요.`);
 if(page==='structure'&&reinforcement.members.some(m=>m.id===id)){const member=reinforcement.members.find(m=>m.id===id);viewer.rebarSheet=member.sheet;viewer.mode='rebar';viewer.focusMember(id);if($('member-select'))$('member-select').value=id;$('view-name').textContent=found.name+' · 철근 '+member.count+'개';status(`${found.name}을 확대했습니다. 콘크리트·철근·겹쳐 보기를 비교하세요.`);}
 if(source==='3d'&&!viewer.fpv&&!sheet.view.startsWith('rebar')&&!referencesFor(found).includes(sheet.id)){const ref=referencesFor(found).find(r=>project.sheets.some(s=>s.id===r));if(ref&&project.sheets.find(s=>s.id===ref).menu===page){sheet=project.sheets.find(s=>s.id===ref);$('sheet-select').value=ref;$('sheet-name').textContent=ref+' · '+sheet.title;renderPlan();}}
}
function renderSelection(){renderSelectionContent();quantities.inspector($('selection-body'),selected);updatePowerExplanation();}
function renderSelectionContent(){
 const e=selectedElement();if(!e){$('selection-body').innerHTML='<h2>하나를 눌러보세요.</h2><p>도면이나 건물의 벽·창문·기구를 선택하면 설명과 치수가 나타납니다.</p>';return;}
 if(e.kind==='task-light'){workstationEditor($('selection-body'),e,exercise,electric,{apply:()=>{save();refreshElectrical();status('작업등 위치와 회로 부하를 적용했습니다.');},toggle:toggleSwitch,calc:async id=>{await ensureGuide();calcState.mode='electrical';calcState.circuit=id;calcState.step='power-sum';await go('calculations');},term:()=>showTerm('circuit')});return;}
 if(e.kind==='room'){const devices=electric.devices.filter(d=>d.room===e.id&&d.watts);$('selection-body').innerHTML=`<h2>${e.name}</h2><p>노란 영역은 이 방의 바닥 범위입니다.</p><p>${e.description}</p><dl><dt>안쪽 가로</dt><dd>${mm(e.bounds[2]-e.bounds[0])} mm</dd><dt>안쪽 세로</dt><dd>${mm(e.bounds[3]-e.bounds[1])} mm</dd></dl><p>이 방의 전기기구: ${devices.map(d=>d.name).join(' · ')}</p><div class="button-row"><button data-room-electric="${e.id}">이 방의 전기기구 보기</button><button data-room-enter="${e.id}">이 방 안으로 들어가기</button></div>`;return;}
 if(e.system){$('selection-body').innerHTML=`<h2>${esc(e.name)}</h2><div class="selection-id">${e.id}</div><p>${esc(e.plain)}</p><dl>${e.system==='materials'?`<dt>재료층 두께</dt><dd>${e.thickness} mm</dd><dt>조각 높이</dt><dd>2,000 mm</dd>`:`<dt>중심 높이</dt><dd>${mm(e.pos[2]-project.finishLevel)} mm</dd><dt>기구 폭</dt><dd>${mm(Math.max(e.size[0],e.size[1]))} mm</dd><dt>작동 상태</dt><dd>${esc(e.stateLabel??(e.on?'작동·점등':'대기·소등'))}</dd>`}</dl><div class="button-row">${referencesFor(e).map(r=>`<button data-ref="${r}">${r} 도면</button>`).join('')}<button data-term="${termFor(e)}">쉬운 용어 설명</button></div>${page==='fire-signal'&&['smoke','heat','callpoint'].includes(e.kind)?`<div class="button-row"><button data-fire-trigger="${e.id}">이 기구 신호 시험</button><button data-fire-action="reset">복구</button></div>`:''}`;return;}
 const definition=glossary.find(t=>t.id===termFor(e)),term={...definition,plain:({'pit-base':'PIT의 아래를 받치는 콘크리트판입니다. 판의 크기는 안쪽 빈 공간보다 큽니다.','pit-access-cover':'바닥의 점검구를 닫는 덮개입니다. PIT 보기에서는 위치를 보여주기 위해 들어 올렸습니다.'})[e.id]??({light:'천장에 설치해 실내를 밝히는 조명',switch:'연결된 조명의 전기를 켜고 끄는 장치',socket:'전기기구의 플러그를 연결하는 곳',ac:'별도 전원 회로로 연결한 냉방기',window:'채광과 환기를 위한 창문',frame:'문이나 유리를 지지하는 틀',furniture:'실내에서 사용하는 가구',fixture:'공간에 설치된 기구와 부속품'})[e.kind]??definition?.plain},member=reinforcement.members.find(m=>m.id===e.id),opening=model.openings.find(o=>o.id===e.id||e.id===o.id+'-frame');
 const b=e.pos?[e.pos[0]-e.size[0]/2,e.pos[1]-e.size[1]/2,e.pos[0]+e.size[0]/2,e.pos[1]+e.size[1]/2]:boundsOf(e);
 const dims=opening?[["개구부 폭",mm(opening.end-opening.start)+' mm'],['개구부 높이',mm(opening.height)+' mm'],['창·문 하단',mm(opening.sill-project.finishLevel)+' mm']]:[['가로',mm(b[2]-b[0])+' mm'],['깊이',mm(b[3]-b[1])+' mm'],['높이',mm(e.size?.[2]??e.height)+' mm']];
 if(e.pos)dims.push(['설치 중심 높이',mm(e.pos[2]-project.finishLevel)+' mm']);else dims.push(['하단 기준 높이',mm(e.base)+' mm']);
 if(e.circuit){dims.push(['연결 회로',e.circuit]);const r=electric.routes.find(r=>r.target===e.id);if(r)dims.push(['전선관 경로 길이',f(routeLength(r.points))+' m']);if(e.switch)dims.push(['연결 스위치',e.switch]);}if(e.watts)dims.push(['소비전력',e.watts+' W'],['전원 상태',e.on?'켜짐':'꺼짐']);
 if(member)dims.push(['철근',`D${member.diameter} @${member.spacing}`],['피복 두께',member.cover+' mm'],['모델 철근',member.count+'개'],['모델 철근 길이',f(member.length)+' m']);
 $('selection-body').innerHTML=`<h2>${esc(e.name)}</h2><div class="selection-id">${esc(e.id)}</div><p>${esc(term?.plain??'건물을 이루는 요소')}</p><dl>${dims.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl><p class="small">${e.pos?'설치 높이는 마감 바닥부터 기구 중심까지입니다.':'하단 기준 높이는 구조바닥 SFL = 0 기준입니다.'}</p><div class="button-row">${referencesFor(e).map(r=>`<button data-ref="${r}">${r} 도면</button>`).join('')}</div><div class="button-row"><button data-term="${termFor(e)}">쉬운 용어 설명</button>${member?'<button id="member-calc">이 부재 계산</button>':''}</div>${e.kind==='switch'?`<div class="button-row"><button data-switch="${e.id}" class="primary">${exercise.switches[e.id]?'스위치 끄기':'스위치 켜기'}</button></div>`:''}${e.watts?`<form id="device-form"><label for="device-watts">소비전력 (W)<input id="device-watts" type="number" min="1" max="3000" step="1" required value="${e.watts}"></label>${e.kind==='light'?`<div class="form-row"><label for="device-x">가로 위치 (m)<input id="device-x" type="number" step="0.05" value="${e.pos[0]}"></label><label for="device-y">세로 위치 (m)<input id="device-y" type="number" step="0.05" value="${e.pos[1]}"></label></div>`:''}<div class="button-row"><button type="submit" class="primary">설계에 적용</button><button type="button" id="device-reset">이 기구 복원</button></div><p id="edit-feedback" role="status">기구 위치는 선택한 방 안에서 이동할 수 있습니다.</p></form>`:''}`;
 if($('member-calc'))$('member-calc').onclick=async()=>{await ensureGuide();calcState.mode='structure';calcState.member=guide.memberLesson(e.id);calcState.step=null;await returnToCalculation();};
 if($('device-form')){$('device-form').onsubmit=event=>{event.preventDefault();const w=Number($('device-watts').value),p=e.kind==='light'?[Number($('device-x').value),Number($('device-y').value)]:null;if(!Number.isFinite(w)||w<1||w>3000){$('edit-feedback').textContent='1~3,000 W 범위로 입력해 주세요.';return;}if(p&&!validLightPosition(e,p)){$('edit-feedback').textContent='조명이 벽과 겹치지 않도록 방 안쪽으로 이동해 주세요.';return;}exercise.watts[e.id]=w;if(p)exercise.positions[e.id]=p;save();refreshElectrical();status(`${e.name} 변경 · 2D·3D·배선 길이·회로 계산에 적용했습니다.`);};$('device-reset').onclick=()=>{delete exercise.watts[e.id];delete exercise.positions[e.id];save();refreshElectrical();status(e.name+'을 기본 예제로 복원했습니다.');};}
}
async function followRef(id,element=null){const s=project.sheets.find(s=>s.id===id);if(!s)return false;if(!await go(s.menu,id))return false;if(element)select(element);return true;}
function refreshElectrical(){const fireWasActive=viewer?.fireGuide?.active;electric=electricalModel(exercise);fire=fireModel(expansion,exercise.power);viewer?.updateElectrical(electric);viewer?.updateFire(fire);if(fireWasActive){viewer.fireGuide.show(guardhouseFireLesson(fire,fireGuideId),fireGuideStep,{...fire,powered:fire.supplied});renderFireGuide();}if(viewer){renderPlan();renderSelection();}if(page==='electrical'){electricalContent();if(viewer?.tour.active){tourState.playing=false;renderTour();}}if(page==='fire')$('page-content').innerHTML='<article class="card"><h2>기구의 위치 찾기</h2><div class="button-row">'+fire.devices.map(d=>'<button data-select="'+d.id+'">'+esc(d.name)+'</button>').join('')+'</div></article>';if(page==='fire-signal')$('page-content').innerHTML=fireContent(fire,expansion);if(page==='fire-test')$('page-content').innerHTML='<button data-nav="fire-signal">기구 신호만 따로 시험하기</button>';if(page==='experience'){experienceContent();walkTools();}if(page==='calculations')calculationsContent();}
function toggleSwitch(id){exercise.switches[id]=!exercise.switches[id];save();refreshElectrical();const targets=electric.devices.filter(d=>d.switch===id);status(`${project.devices.find(d=>d.id===id).name} ${exercise.switches[id]?'켜짐':'꺼짐'} · 연결 조명 ${targets.map(d=>d.id).join(', ')} ${targets.some(d=>d.on)?'점등':'소등'}`);}
function contextTools(){if(!viewer)return;const el=$('context-tools');
 if(page==='building'&&sheet.id==='A-108'){el.innerHTML='<span class="tool-label">바닥 아래 보기</span><button data-pit-view="open">기초·PIT 전체</button><button data-pit-view="section">PIT 단면</button><button data-select="pit-access-cover">점검구 찾기</button><button data-term="pit">PIT 뜻 알아보기</button>';return;}
 if(page==='fire'){el.innerHTML='<span class="tool-label">소방 학습</span><button data-ref="F-101">기구 배치</button><button data-ref="F-102">신호·전원</button><button data-nav="safety">안전점검 연결</button>';return;}
 if(page==='materials'){el.innerHTML='<span class="tool-label">외벽 보기</span><button data-material-view="exterior">건물 외관 보기</button><button data-material-view="layers">구성층 펼쳐보기</button>';return;}
 if(page==='experience'){mountExperienceTools(el,{night:viewer.night,
 render:()=>{viewer.setRealistic(true);$('render-label').textContent='실감 렌더링 · 재질·그림자';status('재질·반사·그림자와 실내 조명을 적용했습니다.');},
 enter:()=>{viewer.enterWalk(currentRoom);walkTools();$('view-name').textContent='눈높이 실내 체험';$('scene-label').textContent='실내 체험 · 눈높이 1,600 mm';$('view-help').textContent='휠: 시야 확대·축소 · 드래그: 시선 · W A S D: 이동';$('render-label').textContent='실감 렌더링';},
 outside:()=>$('whole-view').click(),
 setNight:on=>{viewer.setNight(on);if(!viewer.fpv)$('scene-label').textContent=on?'경비실 · 야간 외관':'경비실 · 낮 외관';status(on?'밤 장면으로 전환했습니다.':'낮 장면으로 전환했습니다.');},
 route:()=>openTour(),preview:()=>showScenePreview(viewer.image(),'현재 경비실 렌더링 장면')
 });return;}
 el.innerHTML=`<span class="tool-label">부분 보기</span><button data-part="walls">벽</button><button data-part="windows">창문</button><button data-part="furniture">가구</button>${page==='structure'?'<button data-part="rebar">철근만</button>':''}${page==='electrical'?'<button data-part="electrical">전기만</button><button data-tour-open="true" class="primary">전기 길 따라가기</button>':''}<button id="explode-view">분해해서 보기</button>${page==='structure'?`<label>구조 부재 <select id="member-select"><option value="">전체 철근</option>${reinforcement.members.filter(m=>['roof','floor','pit-base','footing-south','south-pier-0','entrance-canopy'].includes(m.id)).map(m=>`<option value="${m.id}">${m.name}</option>`).join('')}</select></label>`:''}${page==='electrical'?`<label>회로 <select id="circuit-select"><option value="">모든 회로</option>${project.circuits.map(c=>`<option value="${c.id}">${c.id} ${c.name}</option>`).join('')}</select></label>`:''}`;
 el.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>{viewer.part(b.dataset.part);$('view-name').textContent=b.textContent+' 부분 보기';status(`${b.textContent}만 표시합니다. ‘전체 건물로’ 버튼으로 돌아갈 수 있습니다.`);});
 $('explode-view').onclick=()=>{viewer.explode();$('view-name').textContent='분해 보기';status('지붕·천장·기초를 벌려 표시합니다. 설계 치수와 위치는 유지됩니다.');};
 if(page==='structure'){el.insertAdjacentHTML('beforeend','<div class="button-row" role="group" aria-label="구조 표현"><button data-rebar-display="concrete">콘크리트</button><button data-rebar-display="bars">철근</button><button data-rebar-display="both">겹쳐 보기</button></div>');el.querySelector(`[data-rebar-display="${viewer.rebarDisplay}"]`).setAttribute('aria-pressed','true');}
 if($('member-select')){const control=$('member-select');control.setAttribute('aria-label','구조 부재');for(const option of [...control.options])if(option.value&&reinforcement.members.find(m=>m.id===option.value).sheet!==sheet.id)option.remove();control.options[0].textContent='이 도면의 철근 전체';control.value=viewer.rebarFocus??'';control.onchange=e=>{viewer.view('rebar','iso');viewer.focusMember(e.target.value||null);if(e.target.value)select(e.target.value);};}
 if($('circuit-select')){const control=$('circuit-select');control.setAttribute('aria-label','회로');for(const option of [...control.options])if(option.value&&(sheet.id==='E-101'?option.value!=='L1':sheet.id==='E-102'?option.value==='L1':false))option.remove();control.options[0].textContent='이 도면의 모든 회로';control.onchange=e=>focusCircuit(e.target.value);}
}
function focusCircuit(id){viewer.circuitFocus=id||null;viewer.applyVisibility();if($('circuit-select'))$('circuit-select').value=id;status(id?`${id} 회로에 연결된 기구와 경로를 표시합니다.`:'모든 전기 회로를 표시합니다.');}
function renderSafety(){$('page-content').innerHTML=fireSimulationResult(project.id)+safetyContent(expansion);$('export-checks').onclick=()=>download('경비실-학습-안전점검.json',JSON.stringify({sample:project.id,recordedAt:new Date().toISOString(),scope:'모델 학습 기록 · 법정 점검 결과 아님',items:inspectionItems.map(i=>({...i,...(expansion.checks[i.id]??{state:'unreviewed',note:''})}))},null,2),'application/json');}
async function showPit(section=false){if(page!=='building'){if(!await go('building','A-108'))return;}else if(sheet.id!=='A-108')setSheet('A-108');$('spatial-note').hidden=false;viewer.pitView(section);selected='pit-base';viewer.highlight(selected);renderSelection();renderPlan();$('view-name').textContent=section?'PIT 단면 · 앞벽 제거':'기초·PIT 입체 보기';$('scene-label').textContent='지면·마감 숨김 · PIT와 점검구';status('PIT는 바닥 아래의 공간입니다. 위쪽 설명에서 기초와 점검구를 함께 확인하세요.');}
function renderPath(){const summary=lessonSummary(project,exercise.completed);$('home-facts').innerHTML=[[summary.rooms,'개','공간'],[summary.drawings,'장','연결 도면'],[summary.circuits,'개','전기 회로']].map(([n,u,label])=>'<div><strong>'+n+u+'</strong><span>'+label+'</span></div>').join('');$('lesson-path').innerHTML=project.steps.map((s,i)=>`<article class="lesson-card"><span class="step-number">${String(i+1).padStart(2,'0')} / ${String(summary.steps).padStart(2,'0')}</span><h3>${s.title}</h3><p>${s.text}</p><div class="button-row"><button data-step="${s.id}">${s.action}</button><label class="complete"><input type="checkbox" data-complete="${s.id}" ${exercise.completed.includes(s.id)?'checked':''}> 학습했어요</label></div></article>`).join('');$('progress-label').textContent=`${summary.steps}단계 중 ${summary.completed}단계 학습 표시 · 표시한 내용은 이 브라우저에 저장됩니다.`;}
function buildingContent(){$('page-content').innerHTML=`<div class="content-grid"><article class="card"><h2>이렇게 읽어보세요.</h2><p>평면도는 위에서, 입면도는 밖에서, 단면도는 잘라서 본 모습입니다. 도면을 바꾸고 같은 창문의 위치를 찾아보세요.</p><div class="button-row"><button data-ref="A-101">위에서 보기</button><button data-ref="A-105">앞에서 보기</button><button data-ref="A-102">잘라서 보기</button></div></article><article class="card"><h2>방을 찾고 전기설계로 이어가세요.</h2><p>방을 누르면 위쪽 평면도와 3D에 같은 공간을 노란색으로 표시합니다.</p><div class="button-row">${project.rooms.map(r=>`<button data-room-info="${r.id}" aria-pressed="false">${r.name}</button>`).join('')}</div><p id="room-description">먼저 방을 선택하세요. 그 방의 전기기구를 찾거나 눈높이로 들어가 볼 수 있습니다.</p><div id="room-next" class="button-row" hidden></div></article></div>`;}
function structureContent(){const rows=reinforcement.members.filter(m=>['roof','floor','pit-base','footing-south','south-pier-0','entrance-canopy'].includes(m.id));$('page-content').innerHTML=`<div class="content-grid"><article class="card"><h2>무게가 전달되는 순서</h2><p>지붕판이 받은 무게가 외벽을 거쳐 기초와 땅으로 전달됩니다. 철근은 콘크리트 안에서 인장 작용을 보완합니다.</p><div class="button-row"><button data-member="roof">지붕판</button><button data-member="south-pier-0">외벽</button><button data-member="footing-south">기초</button><button data-nav="calculations">계산서 열기</button></div><details><summary>배근 모델의 학습 범위</summary><p>실제 부재의 치수 안에 상·하부 또는 양면 철근을 배치했습니다. 개구부에서는 철근을 끊어 표시합니다. 이 교재의 배근 수량은 직선 철근 모델의 수량이며 정착·겹침·갈고리와 개구부 보강 상세를 포함한 가공 수량이 아닙니다.</p></details></article><article class="card"><h2>대표 부재 배근표</h2><div class="table-scroll"><table><thead><tr><th>부재</th><th>배근</th><th>피복</th><th>모델 길이</th></tr></thead><tbody>${rows.map(m=>`<tr><td><button data-member="${m.id}">${m.name}</button></td><td>D${m.diameter} @${m.spacing}</td><td>${m.cover} mm</td><td>${f(m.length)} m</td></tr>`).join('')}</tbody></table></div></article></div>`;}
function electricalContent(){$('page-content').innerHTML=`<div class="content-grid"><article class="card"><h2>조명을 직접 켜보세요.</h2><p>스위치를 켜도 분전반이나 해당 차단기가 꺼져 있으면 조명이 켜지지 않습니다.</p><div class="switch-bank">${switchButtons()}</div><div class="button-row"><button id="main-power" aria-pressed="${exercise.power}">분전반 전원 ${exercise.power?'켜짐':'꺼짐'}</button><button data-ref="E-103">회로도 보기</button><button data-nav="experience">실내에서 조작하기</button></div></article><article class="card"><h2>회로와 기구 찾기</h2><div class="button-row">${electric.devices.map(d=>`<button data-select="${d.id}">${d.id} ${d.kind==='panel'?'분전반':d.kind==='switch'?'스위치':d.kind==='light'?'조명':d.kind==='socket'?'콘센트':d.kind==='task-light'?'작업등':'냉방기'}</button>`).join('')}</div><p>기구를 선택하면 소비전력과 조명 위치를 수정할 수 있습니다.</p></article></div>${circuitTable()}`;if($('main-power'))$('main-power').onclick=()=>{exercise.power=!exercise.power;save();refreshElectrical();status('분전반 전원 '+(exercise.power?'켜짐':'꺼짐'));};}
function switchButtons(){return lightingSummary(electric,exercise)+lightingSwitchButtons(electric,exercise);}
function circuitTable(){return `<article class="card" style="margin-top:18px"><h2>분전반 회로표</h2><div class="table-scroll"><table><thead><tr><th>회로</th><th>연결 부하</th><th>계산 전류</th><th>차단기</th><th>전선</th><th>최장 경로</th><th>전압강하 계산값</th><th>수업 조건 확인</th></tr></thead><tbody>${electric.circuits.map(c=>`<tr><td><span class="circuit-color" style="background:${c.color}"></span>${c.id} ${c.name}</td><td class="number">${c.watts} W</td><td class="number">${f(c.current)} A</td><td><button data-breaker="${c.id}" aria-pressed="${exercise.breakers[c.id]}">${c.breaker} A · ${exercise.breakers[c.id]?'켜짐':'꺼짐'}</button></td><td>${c.area} mm²</td><td class="number">${f(c.length)} m</td><td class="number">${f(c.percent)} %</td><td class="${c.pass?'good':'needs-work'}">${c.pass?'조건 충족':!c.checks.current?'부하 과다 — 모의 차단':'설계 조건 확인'}</td></tr>`).join('')}</tbody></table></div><p>설계 부하 ${electric.watts} W · 현재 켜진 부하 ${electric.activeWatts} W. 전압강하는 전체 회로 전류가 최장 경로 끝까지 흐른다고 보고 20 °C 도체 저항으로 구한 수업 계산값입니다. 운전 온도와 리액턴스를 반영하면 달라지므로 상한으로 읽지 않습니다.</p></article>`;}
function calculationsContent(){
 const rendered=guide.renderGuide({electric,structure,state:calcState});activeCalculation=rendered.lesson;$('page-content').innerHTML=rendered.html;calcState.step=$('calc-step').value;writeStored(()=>sessionStorage,calculationKey,calcState);
 $('open-calculation-book').onclick=()=>{writeStored(()=>sessionStorage,calculationKey,calcState);};
 $('calc-step').onchange=e=>{calcState.step=e.target.value;calculationsContent();$('calc-step').focus({preventScroll:true});};
 if($('calc-context'))$('calc-context').onchange=e=>{calcState[calcState.mode==='electrical'?'circuit':'member']=e.target.value;calcState.step=null;calculationsContent();$('calc-context').focus({preventScroll:true});};
 if($('trial-calculate'))$('trial-calculate').onclick=()=>{const input=$('load-trial'),live=Number(input.value);if(input.value.trim()===''||!Number.isFinite(live)||live<0||live>20){$('trial-error').textContent='0~20 범위의 활하중을 입력해 주세요.';input.focus();return;}calcState.live=live;calculationsContent();$('trial-calculate').focus({preventScroll:true});};
  if($('trial-restore'))$('trial-restore').onclick=()=>{calcState.live=structure[activeCalculation.id].live;calculationsContent();$('trial-restore').focus({preventScroll:true});};
 $('save-report').onclick=()=>download('경비실-교육용-계산서.json',JSON.stringify({project:project.id,exercise,electrical:electric.circuits,structural:structure,reinforcement:reinforcement.members,reading:{...calcState},explanation:activeCalculation},null,2),'application/json');
}
function glossaryContent(){mountGlossary($('page-content'),glossary,{action:'term-location'});}
function showTerm(id){const t=glossary.find(t=>t.id===id);if(!t)return;if(page==='calculations')calculationReturn=true;$('term-dialog-content').innerHTML=`<p class="eyebrow">쉬운 용어 설명</p><h2>${t.term}</h2><h3>${t.plain}</h3><p>${t.definition??''}</p><p>${t.electrical??''}</p><div class="button-row">${t.sheet&&t.element?`<button data-term-location="${t.id}">${t.locationLabel??'모델에서 위치 보기'}</button>`:''}<button id="open-dictionary">용어사전에서 이어 보기</button></div>`;$('term-dialog').showModal();$('open-dictionary').onclick=async()=>{$('term-dialog').close();if(!await go('glossary'))return;$('term-search').value=t.term;$('term-search').dispatchEvent(new Event('input'));$('term-search').focus();};}

function experienceContent(){$('page-content').innerHTML=`<div class="content-grid"><article class="card"><h2>벽의 스위치로 불을 켭니다.</h2><p>실내에서는 마우스를 드래그해 고개를 돌립니다. 가까운 스위치를 직접 누르거나 아래 버튼으로 같은 회로를 조작할 수 있습니다.</p><div class="switch-bank">${switchButtons()}</div><div class="button-row"><button id="experience-power" aria-pressed="${exercise.power}">분전반 전원 ${exercise.power?'켜짐':'꺼짐'}</button></div><p>켜진 조명 ${electric.devices.filter(d=>d.kind==='light'&&d.on).length} / ${electric.devices.filter(d=>d.kind==='light').length}개 · 실제 점등 상태와 회로가 연결됩니다.</p></article><article class="card"><h2>조작 안내</h2><p>휠은 서 있는 위치를 유지하며 시야를 확대·축소합니다. 앞으로 다가가는 동작은 W·A·S·D 또는 방향키로 이동합니다. 마우스를 드래그하면 시선을 돌립니다. E 키는 화면 중앙의 가까운 스위치를 조작합니다. 화면 버튼으로도 이동할 수 있습니다.</p><p>눈높이 1,600 mm · 벽과 가구는 통과하지 않습니다. 이동 편의를 위해 출입문은 열린 상태로 표시합니다.</p><div class="button-row">${project.rooms.map(r=>`<button data-walk-room="${r.id}">${r.name} 이동</button>`).join('')}</div></article></div>`;$('experience-power').onclick=()=>{exercise.power=!exercise.power;save();refreshElectrical();};}
function walkTools(){$('walk-tools').hidden=!viewer.fpv;$('walk-crosshair').hidden=!viewer.fpv;if(!viewer.fpv)return;$('walk-tools').innerHTML=`<div><p>${project.rooms.find(r=>r.id===currentRoom).name} · 눈높이 1.6 m · <span id="walk-fov">시야 ${Math.round(viewer.camera.fov)}°</span></p><p>휠: 시야 확대·축소 · W A S D: 이동 · E: 스위치 · Esc: 밖으로</p></div><div class="move-buttons"><button id="reset-fov">기본 시야</button><button id="visit-switch">스위치 앞으로</button><button data-move="forward">앞으로</button><button data-move="back">뒤로</button><button data-move="left">왼쪽 이동</button><button data-move="right">오른쪽 이동</button><button data-turn="left">왼쪽 보기</button><button data-turn="right">오른쪽 보기</button></div>`;}

const lessonActions={
  "retryPlan": async (b) => { renderPlan(); },
  "#return-calculation": async (b) => { await returnToCalculation();return; },
  "calcMode": async (b) => { calcState.mode=b.dataset.calcMode;calcState.step=null;calculationsContent();document.querySelector('[data-calc-mode="'+calcState.mode+'"]').focus({preventScroll:true});return; },
  "calcIndex": async (b) => { const step=activeCalculation.steps[Number(b.dataset.calcIndex)];if(step){calcState.step=step.id;calculationsContent();document.querySelector('.calc-formula').scrollIntoView({block:'start'});$('calc-step').focus({preventScroll:true});}return; },
  "calcTarget": async (b) => { const l=activeCalculation;await openCalculationTarget(b.dataset.calcTarget==='drawing'?l.target.drawing:l.target.sheet,l.target.element,l.circuit);return; },
  "calcDevice": async (b) => { const l=activeCalculation;await openCalculationTarget(l.target.sheet,b.dataset.calcDevice,l.circuit);return; },
  "pitView": async (b) => { showPit(b.dataset.pitView==='section'); },
  "rebarDisplay": async (b) => { viewer.rebarDisplay=b.dataset.rebarDisplay;viewer.mode='rebar';viewer.filter='all';viewer.applyVisibility();document.querySelectorAll('[data-rebar-display]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('view-name').textContent=(selectedElement()?.name??'현재 부재')+' · '+b.textContent;status(b.textContent+'로 전환했습니다. 같은 부재의 모습을 비교하세요.'); },
  "tourOpen": async (b) => { await openTour(); },
  "tourStep": async (b) => { await openTour(tourState.id,Number(b.dataset.tourStep)); },
  "fireTrigger": async (b) => { viewer.simulation?.leave();expansion.signal=b.dataset.fireTrigger;saveExpansion();refreshElectrical();openFireGuide(b.dataset.fireTrigger,0);viewer.simulation?.signalSound();status(fire.alarm?'시험 화재신호가 수신기에 전달되어 경보가 작동했습니다.':'입력 신호가 있지만 소방 전원이 없어 경보가 작동하지 않습니다.'); },
  "energyMoment": async (b) => { energyLesson.jump(b.dataset.energyMoment); },
  "fireGuide": async (b) => { openFireGuide(fire.signal??fireGuideId,0); },
  "fireGuideStep": async (b) => { openFireGuide(fireGuideId,Number(b.dataset.fireGuideStep)); },
  "fireAction": async (b) => { if(b.dataset.fireAction==='reset')expansion.signal=null;if(b.dataset.fireAction==='battery')expansion.battery=!expansion.battery;if(b.dataset.fireAction==='mains'){exercise.power=!exercise.power;save();}saveExpansion();refreshElectrical();status('소방 시험 상태를 갱신했습니다. 신호·전원 원리도에서 결과를 확인하세요.'); },
  "finish": async (b) => { expansion.finish=b.dataset.finish;saveExpansion();viewer.setFinish(expansion.finish);viewer.materialView(false);viewer.setRealistic(true);renderPlan();$('page-content').innerHTML=materialsContent(expansion);$('view-name').textContent=finishes.find(f=>f.id===expansion.finish).name+' · 건물 외관';status('선택한 마감을 외벽에 적용했습니다.'); },
  "materialView": async (b) => { viewer.materialView(b.dataset.materialView==='layers');viewer.setRealistic(true);$('view-name').textContent=b.dataset.materialView==='layers'?'외벽 구성층 · 펼친 모습':'선택한 외장 · 전체 건물';$('scene-label').textContent=b.dataset.materialView==='layers'?materialLayers.map(l=>l.thickness).join(' + ')+' = '+materialLayers.reduce((n,l)=>n+l.thickness,0)+' mm':'경비실 외장 마감';status('같은 외벽의 표면과 구성층을 비교하세요.'); },
  "materialLayer": async (b) => { viewer.materialView(true);select(b.dataset.materialLayer);$('view-name').textContent='외벽 구성층 · '+selectedElement().name; },
  "inspectTarget": async (b) => { const item=inspectionItems.find(i=>i.id===b.dataset.inspectTarget);if(!await followRef(item.sheet,item.target))return;if(item.sheet==='A-108')await showPit(true);if(item.sheet==='M-101'){viewer.materialView(true);select(item.target);}if(item.sheet==='S-102')viewer.focusMember(item.target);$('page-actions').innerHTML='<button data-nav="safety">안전점검 기록으로 돌아가기</button>'; },
  "#reset-fov": async (b) => { viewer.resetFov(); },
  "menu": async (b) => { if(await go(b.dataset.menu)){$('page-title').setAttribute('tabindex','-1');$('page-title').focus({preventScroll:true});$('page-heading').scrollIntoView({block:'start'});} },
  "nav": async (b) => { await go(b.dataset.nav); },
  "layout": async (b) => { setLayout(b.dataset.layout); },
  "ref": async (b) => { const keep=selected;await followRef(b.dataset.ref,keep); },
  "select": async (b) => { const d=electric?.devices.find(d=>d.id===b.dataset.select);if(d?.socket&&page==='electrical'&&sheet.id!=='E-102'){await followRef('E-102',d.id);}else select(b.dataset.select);if(page.startsWith('fire')&&fire.devices.some(d=>d.id===b.dataset.select))locateFire(b.dataset.select); },
  "selectCalc": async (b) => { if(!await go('electrical'))return;select(b.dataset.selectCalc); },
  "switch": async (b) => { toggleSwitch(b.dataset.switch); },
  "breaker": async (b) => { exercise.breakers[b.dataset.breaker]=!exercise.breakers[b.dataset.breaker];save();refreshElectrical(); },
  "term": async (b) => { showTerm(b.dataset.term); },
  "termLocation": async (b) => { const t=glossary.find(t=>t.id===b.dataset.termLocation);$('term-dialog').close();await followRef(t.sheet,t.element); },
  "step": async (b) => { const s=project.steps.find(s=>s.id===b.dataset.step);await go(s.menu,s.sheet); },
  "member": async (b) => { const member=reinforcement.members.find(m=>m.id===b.dataset.member);if(member.sheet!==sheet.id)setSheet(member.sheet);viewer.view('rebar','iso');viewer.focusMember(b.dataset.member);select(b.dataset.member);if($('member-select'))$('member-select').value=b.dataset.member; },
  "roomInfo": async (b) => { selectRoom(b.dataset.roomInfo); },
  "roomElectric": async (b) => { const id=b.dataset.roomElectric;currentRoom=id;const device=electric.devices.find(d=>d.room===id&&d.kind==='light');if(!await go('electrical','E-101'))return;select(device.id);$('workspace').scrollIntoView({block:'start'}); },
  "roomEnter": async (b) => { currentRoom=b.dataset.roomEnter;if(!await go('experience'))return;$('walk-enter').click();$('workspace').scrollIntoView({block:'start'}); },
  "walkRoom": async (b) => { currentRoom=b.dataset.walkRoom;viewer.enterWalk(currentRoom);walkTools();$('view-name').textContent=project.rooms.find(r=>r.id===currentRoom).name+' · 실내 체험';$('scene-label').textContent='실내 체험 · 눈높이 1,600 mm';$('view-help').textContent='휠: 시야 확대·축소 · 드래그: 시선 · W A S D: 이동';$('render-label').textContent='실감 렌더링'; },
  "move": async (b) => { const m={forward:[1,0],back:[-1,0],left:[0,-1],right:[0,1]}[b.dataset.move];viewer.move(...m); },
  "turn": async (b) => { viewer.turn(b.dataset.turn==='left'?.3:-.3); },
  "#visit-switch": async (b) => { viewer.visitSwitch({guard:'SW1',storage:'SW2',pantry:'SW3',toilet:'SW4'}[currentRoom]);status('벽의 스위치를 직접 눌러보세요.'); },
};
lessonActions["returnCalculation"]=lessonActions["#return-calculation"];
lessonActions["tourReturn"]=lessonActions["tourOpen"];
bindActions([$('app'),$('site-top'),$('term-dialog')],lessonActions,error=>{console.error(error);status('요청한 동작을 마치지 못했습니다. 해당 메뉴를 다시 열어 주세요.');});
document.addEventListener('change',e=>{if(e.target.dataset.complete){const id=e.target.dataset.complete;exercise.completed=exercise.completed.filter(x=>x!==id);if(e.target.checked)exercise.completed.push(id);save();renderPath();}});
document.addEventListener('change',e=>{const id=e.target.dataset.check??e.target.dataset.checkNote;if(!id)return;const record=expansion.checks[id]??{state:'unreviewed',note:''};if(e.target.dataset.check)record.state=e.target.value;else record.note=e.target.value.slice(0,500);expansion.checks[id]=record;saveExpansion();const c=inspectionSummary(expansion);if($('check-summary'))$('check-summary').textContent=`미확인 ${c.unreviewed} · 살펴봄 ${c.observed} · 개선 메모 ${c.action} · 해당 없음 ${c.na}`;});
document.addEventListener('input',e=>{const id=e.target.dataset.checkNote;if(!id)return;expansion.checks[id]={state:expansion.checks[id]?.state??'unreviewed',note:e.target.value.slice(0,500)};saveExpansion();});
$('three-host').addEventListener('tour-ended',()=>{tourState.playing=false;if($('tour-play'))$('tour-play').textContent='배관 따라가기';});
$('three-host').addEventListener('walk-zoom',e=>{if($('walk-fov'))$('walk-fov').textContent='시야 '+Math.round(e.detail)+'°';});
$('pit-view').onclick=()=>showPit();
const quantities=createQuantities({host:$('page-content'),nav:$('learning-nav'),workspace:$('workspace'),go,read:()=>({sample:'guardhouse',model,electric,fire,rebar:reinforcement,resolveSheet:e=>referencesFor(e)[0]}),locate:async m=>{if(!await followRef(m.sheet,m.id))return false;if(m.menu==='structure')viewer.focusMember(m.id);return true;}});
$('sheet-select').onchange=e=>setSheet(e.target.value);$('start-lesson').onclick=async()=>{if(await go('building','A-101'))window.scrollTo({top:0,behavior:'instant'});};mountSamples(1,()=>go('home'),()=>go('glossary'));$('quick-experience').onclick=()=>go('experience');document.querySelector('.brand').onclick=async e=>{e.preventDefault();if(await go('home'))window.scrollTo({top:0,behavior:'instant'});};
$('whole-view').onclick=()=>{stopFireGuide();$('route-lesson').hidden=true;selected=null;viewer.whole();renderSelection();renderPlan();$('view-name').textContent='전체 건물';$('scene-label').textContent='경비실 · 전체 건물';$('selection-sync').textContent='전체 보기';$('walk-tools').hidden=true;$('walk-crosshair').hidden=true;$('spatial-note').hidden=true;status('부분 보기와 분해를 해제하고 전체 건물로 돌아왔습니다. 기초·PIT 보기에서 바닥 아래를 다시 볼 수 있습니다.');};
$('orbit-view').onclick=()=>{stopFireGuide();if(sheet.id==='A-108'){showPit();return;}viewer.view(sheet.mode,'iso');$('walk-tools').hidden=true;$('walk-crosshair').hidden=true;$('view-name').textContent=sheet.plain+' · 입체 보기';$('scene-label').textContent=sheet.id+' · '+sheet.plain;$('view-help').textContent='드래그로 회전 · 휠로 확대 · 대상을 눌러 정보 확인';};$('plan-fit').onclick=resetPlan;
$('save-svg').onclick=()=>download(`${sheet.id}-${sheet.title}.svg`,sheetSVG({sheet,model,projections,electric,rebar:reinforcement,selected:null,fire,finish:expansion.finish}),'image/svg+xml');
$('reset-exercise').onclick=()=>$('reset-dialog').showModal();$('confirm-reset').onclick=()=>{clearLearningRecords(1,baseProject.id);practicePower.baseline=null;exercise=freshExercise();expansion=freshExpansion();save();saveExpansion();viewer?.setFinish(expansion.finish);refreshElectrical();$('reset-dialog').close();go('home');status('기본 예제로 초기화했습니다.');};

let drag=null;
$('plan-host').addEventListener('pointerdown',e=>{if(!$('learning-plan'))return;drag={x:e.clientX,y:e.clientY,view:[...planView],target:e.target.closest('[data-element],[data-circuit]')};$('plan-host').setPointerCapture(e.pointerId);});
$('plan-host').addEventListener('pointermove',e=>{if(!$('learning-plan')||!drag||Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<4)return;const r=$('plan-host').getBoundingClientRect(),scale=Math.min(r.width/drag.view[2],r.height/drag.view[3]);planView=[drag.view[0]-(e.clientX-drag.x)/scale,drag.view[1]-(e.clientY-drag.y)/scale,...drag.view.slice(2)];$('learning-plan').setAttribute('viewBox',planView.join(' '));});
$('plan-host').addEventListener('pointerup',e=>{if(drag&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<5){const t=drag.target;if(t?.dataset.element)select(t.dataset.element,'2d');if(t?.dataset.circuit)focusCircuit(t.dataset.circuit);}drag=null;});$('plan-host').addEventListener('pointercancel',()=>drag=null);
$('plan-host').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){const t=e.target.closest('[data-element],[data-circuit]');if(t){e.preventDefault();if(t.dataset.element)select(t.dataset.element,'2d');else focusCircuit(t.dataset.circuit);}}});
function zoomPlan(factor){if(!$('learning-plan'))return;const w=Math.max(150,Math.min(2500,planView[2]*factor)),h=w*.71;planView=[planView[0]+(planView[2]-w)/2,planView[1]+(planView[3]-h)/2,w,h];$('learning-plan').setAttribute('viewBox',planView.join(' '));}
$('plan-host').addEventListener('wheel',e=>{if(!$('learning-plan'))return;e.preventDefault();zoomPlan(Math.exp(Math.max(-.3,Math.min(.3,e.deltaY*.001))));},{passive:false});
$('plan-zoom-in').onclick=()=>zoomPlan(.8);$('plan-zoom-out').onclick=()=>zoomPlan(1.25);
document.addEventListener('keyup',e=>{if(e.key==='Escape'&&!viewer?.fpv){$('walk-tools').hidden=true;$('walk-crosshair').hidden=true;}});
$('retry-loading').onclick=()=>{if(reloadRequired){history.replaceState(null,'','#'+(retryNavigation?.[0]??'home'));location.reload();return;}if(retryNavigation)go(...retryNavigation);};
const entryParams=new URLSearchParams(location.search);
const entrySheet=project.sheets.find(s=>s.id===entryParams.get('sheet'));
const entryPage=entrySheet?.menu??(location.hash.slice(1)||'home');
window.addEventListener('hashchange',()=>{const target=location.hash.slice(1)||'home';if(Object.hasOwn(navData,target)&&target!==page)void go(target);});
window.addEventListener('pagehide',event=>{navigationId++;viewer?.simulation?.leave();viewer?.setActive(false);if(!event.persisted){viewer?.dispose();viewer=null;viewerPending=null;}});
window.addEventListener('pageshow',event=>{if(event.persisted)viewer?.setActive(!$('workspace').hidden);});
 powerExplanation=createPowerExplanation({before:$('page-content'),
 change:(kind,id,on)=>{if(kind==='main')exercise.power=!on;else if(kind==='breaker')exercise.breakers[id]=!on;else exercise.switches[id]=!on;save();refreshElectrical();},
 navigate:async(kind,d,origin,termId)=>{
  if(kind==='tag'){showTerm(termId);return;}
  if(kind==='term'){showTerm('circuit');return;}
  if(kind==='calculation'){await ensureGuide();calcState.mode='electrical';calcState.circuit=d.circuit;calcState.step='current';await go('calculations');return;}
  if(kind==='quantities'){await quantities.showTarget(d.id);return;}
  if(await go(kind==='return'?origin:'electrical',kind==='return'&&origin==='experience'?null:electricalSheet(project,d))){select(d.id);if(kind==='drawing')$('workspace').scrollIntoView({block:'start'});}
 },onError:error=>status('이유 연결을 열지 못했습니다: '+error.message,true)});
function updateDomainExplanation(){
 let data=null;
 if(page==='fire-signal')data=fireExplanation(fire,selected??fireGuideId);
 if(page==='structure'&&guide&&structure){
  const targets=guide.calculationTargets,key=Object.keys(targets).find(k=>targets[k].element===selected)??Object.keys(targets).find(k=>targets[k].element===viewer?.rebarFocus)??(sheet.id==='S-102'?'pit':'roof');
  if(calcState.member!==key){calcState.member=key;calcState.live=structure[key]?.live??1;}
  const base=structure[key],bending=Number.isFinite(base?.M),current=bending?slabCalculation({...base,live:calcState.live,cantilever:key==='canopy'}):base;
  data=structureExplanation(guide.structuralLesson(structure,key,bending?current:null),base,current);
  data.options=Object.values(targets).map(t=>({id:t.element,name:t.name}));
  viewer?.showStructuralLoad(bending?targets[key].element:null,current?.live,base?.live,base?.span);
 }else viewer?.showStructuralLoad(null);
 if(page==='materials')data=materialExplanation({id:'exterior',name:'경비실 외벽',target:'south-pier-0',layers:materialLayers.map(l=>({...l,mm:l.thickness}))},Math.max(0,materialLayers.findIndex(l=>l.id===selected)));
 domainExplanation?.update(data?{data,page,sheet:sheet.id,member:calcState.member,live:calcState.live,power:{power:exercise.power,battery:expansion.battery,signal:expansion.signal}}:null);
}
domainExplanation=createDomainExplanation({before:$('page-content'),
 change:async(kind,value,c)=>{
  if(c.data.domain==='fire'){if(kind==='choose'){select(value);return;}if(kind==='signal'){viewer?.simulation?.leave();expansion.signal=value;fireGuideId=value;selected=value;}if(kind==='reset')expansion.signal=null;if(kind==='mains')exercise.power=!exercise.power;if(kind==='battery')expansion.battery=!expansion.battery;refreshElectrical();}
  if(c.data.domain==='structure'){
   if(kind==='choose'){const key=guide.memberLesson(value),target=guide.calculationTargets[key];if(sheet.id!==target.sheet)setSheet(target.sheet);viewer.focusMember(value);select(value);}
   else {calcState.live=kind==='restore'?structure[c.member].live:value;updateDomainExplanation();}
  }
  if(c.data.domain==='materials'){viewer.materialView(true);select(value);}
 },navigate:async(kind,value,c)=>{
  if(kind==='term'){await ensureGuide();showTerm(value);return;}
  if(kind==='quantities'){await quantities.showTarget(c.data.quantityTarget??c.data.target);return;}
  if(kind==='calculation'){calcState.member=c.member;calcState.live=c.live;calcState.mode=c.data.live?'trial':'structure';calcState.step=c.data.live?'design-load':null;await go('calculations');return;}
  if(kind==='safety'){await go('safety');return;}
   if(kind==='return'){const live=calcState.member===c.member?calcState.live:c.live;await go(c.page,c.sheet);calcState.member=c.member;if(c.data.domain==='fire'){exercise.power=c.power.power;expansion.battery=c.power.battery;expansion.signal=c.power.signal;refreshElectrical();}select(c.data.target);calcState.member=c.member;calcState.live=live;updateDomainExplanation();return;}
  if(c.data.domain==='fire'){await followRef('F-101',c.data.target);setLayout('split');}
  else if(c.data.domain==='structure'){const t=guide.calculationTargets[c.member];if(sheet.id!==t.sheet)setSheet(t.sheet);select(t.element);setLayout('split');}
  else if(kind==='location'){await followRef('A-105',c.data.quantityTarget);}
  else {viewer.materialView(true);select(c.data.target);setLayout('split');}
  $('workspace').scrollIntoView({block:'start'});
 },onError:error=>status('이유 연결을 열지 못했습니다: '+error.message,true)});
await go(entryPage,entrySheet?.id);
if(bookReading){
 if(entryPage==='glossary'){const term=glossary.find(t=>t.id===entryParams.get('term'));if(term){$('term-search').value=term.term;$('term-search').dispatchEvent(new Event('input'));}}
 else if(entrySheet){const element=entryParams.get('element');if(element)select(element);const circuit=entryParams.get('circuit');if(electric?.circuits.some(c=>c.id===circuit))focusCircuit(circuit);$('workspace').scrollIntoView({block:'start'});}
}
