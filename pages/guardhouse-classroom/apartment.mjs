import {fireSimulationResult} from '/pages/guardhouse-classroom/src/fire-simulation.mjs';
import {apartmentGlossary,apartmentTermTarget} from '/pages/guardhouse-classroom/src/apartment-glossary.mjs';
import {tourControls} from './electrical-tour-ui.mjs';
import {apartmentFireLesson,fireDeviceLessons} from '/pages/guardhouse-classroom/src/apartment-fire-lesson.mjs';
import {apartment,apartmentArea,apartmentModel,apartmentElectrical,apartmentFire,apartmentRebar,apartmentSlab,apartmentWalk,freshApartment,restoreApartment,apartmentChecks} from '/pages/guardhouse-classroom/src/apartment-project.mjs';
import {boundsOf} from '/pages/guardhouse-classroom/src/classroom-project.mjs';
import {routeLength} from '/pages/guardhouse-classroom/src/learning-engine.mjs';
import {apartmentCalculationHTML} from './apartment-calculations.mjs';
import {apartmentPlan} from './apartment-plan.mjs';
import {apartmentAssemblies,apartmentPalettes,materialSources} from '/pages/guardhouse-classroom/src/apartment-materials.mjs';
import {apartmentLesson,restoreApartmentReader} from '/pages/guardhouse-classroom/src/apartment-lessons.mjs';
import {lessonHTML,formulaHTML} from './calculation-guide.mjs';
const $=id=>document.getElementById(id),key='space-electricity-apartment-02-v1',f=(n,d=2)=>Number(n).toFixed(d);
let saved;try{saved=JSON.parse(localStorage.getItem(key));}catch{}
let readerSaved;try{readerSaved=JSON.parse(localStorage.getItem(key+'-reader'));}catch{}
let calc=restoreApartmentReader(readerSaved),assembly='exterior',fireId='AD1',fireStep=0;
let planBox=[0,0,1000,820],planDrag=null;
function applyPlanBox(){const svg=$('apt-plan').querySelector('svg');if(svg)svg.setAttribute('viewBox',planBox.join(' '));$('apt-plan').dataset.zoom=(1000/planBox[2]).toFixed(2);}
function zoomPlan(factor){const w=Math.min(1600,Math.max(250,planBox[2]*factor)),h=w*.82;planBox=[planBox[0]+(planBox[2]-w)/2,planBox[1]+(planBox[3]-h)/2,w,h];applyPlanBox();}
let state=restoreApartment(saved),model=apartmentModel(),electric=apartmentElectrical(state),fire=apartmentFire(state),rebar=apartmentRebar(),view=null,pending=null,page='home',sheet='A-201',selected=null,room='living',circuit='AL',formula=0,tourStep=0,tourId='AL01',serial=0;
const names={home:'우리 집에서 전기의 길을 찾습니다.',building:'평면의 방이 입체 공간이 됩니다.',structure:'바닥판이 힘을 받고, 철근이 함께 버팁니다.',electrical:'전기는 용도에 따라 길을 나눕니다.',fire:'발견하고, 알리고, 밖으로 이동합니다.',safety:'배운 연결을 하나씩 확인합니다.',calculations:'이 아파트의 값으로 계산합니다.',glossary:'낯선 용어를 우리 집에서 찾습니다.',experience:'우리 집 안으로 들어갑니다.'};
const descriptions={home:'방 3개인 약 59㎡ 세대에서 건축·전기·소방을 함께 배웁니다.',building:'방과 문, 창문을 선택하고 2D와 3D의 같은 위치를 확인하세요.',structure:'대표 1 m 폭 바닥판의 수직하중과 휨을 배우는 모형입니다.',electrical:'조명·스위치·분전반의 연결과 용도별 회로를 살펴보세요.',fire:'세대 안의 감지·경보·예비전원·피난 경로를 배우는 수업입니다.',safety:'모델에서 확인한 내용을 이 브라우저에 기록합니다.',calculations:'전력과 길이가 전류·전압강하에 어떻게 연결되는지 살펴보세요.',glossary:'뜻을 읽은 뒤 같은 대상의 도면과 3D로 돌아갑니다.',experience:'낮과 밤을 비교하고, 방마다 스위치를 조작합니다.'};
names.materials='겉에 보이는 마감, 그 안쪽의 재료.';
descriptions.materials='외벽·내벽·욕실·바닥을 나누어 보고, 같은 집의 마감 분위기를 바꿔보세요.';
names.calculations='숫자가 설계를 설명합니다.';
descriptions.calculations='단위와 조건부터 살펴보고, 기구나 하중을 바꿔 결과를 비교하세요.';
names["fire"]="소방기구는 어디에 있을까요?";descriptions["fire"]="도면과 건물에서 감지기·경보 장치·소화기의 위치를 찾아보세요.";
names["fire-test"]="연기 발생부터 대피까지 체험합니다.";descriptions["fire-test"]="발생 공간을 고르고 연기를 발생시키세요. 감지와 경보가 이어지면 대피 또는 초기 소화 조작을 선택합니다.";
names["fire-signal"]="기구의 신호와 전원을 시험합니다.";descriptions["fire-signal"]="연기를 만들지 않고 감지 입력과 전원에 따른 장치의 반응만 비교합니다.";
const allTerms=apartmentGlossary;
function saveReader(){try{localStorage.setItem(key+'-reader',JSON.stringify(calc));}catch{}}
function save(){try{localStorage.setItem(key,JSON.stringify(page==='fire-test'?{...state,fireSignal:null}:state));}catch{$('apt-status').textContent='이 브라우저에서 저장할 수 없습니다. 현재 실습은 계속할 수 있습니다.';}}
function status(text){$('apt-status').textContent=text;}
const paint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
const loadTimings={};let retryRoute=null;
async function loadPhase(name,work){$('loading').hidden=$('apt-workspace').hidden;$('apt-loading-spinner').hidden=false;$('apt-loading-message').textContent=name;await paint();const started=performance.now();const result=await work();loadTimings[name]=Math.round(performance.now()-started);$('apartment-app').dataset.loadTimings=JSON.stringify(loadTimings);return result;}
async function ensureView(){
 if(view)return view;
 if(!pending)pending=(async()=>{
  let v;
  try{
   const [{ClassroomView},{ApartmentDetails},{ApartmentFireView},{FireSimulation}]=await loadPhase('3D 화면을 불러오고 있습니다.',()=>Promise.all([import('./classroom-view.mjs'),import('./apartment-details.mjs'),import('./apartment-fire-view.mjs'),import('./fire-simulation.mjs')]));
   await loadPhase('건물과 재료를 준비합니다.',()=>{v=new ClassroomView($('apt-three'),{projectData:apartment,walkCheck:apartmentWalk,onSelect:select,onSwitch:toggleSwitch,onMove:n=>status(n+' · 눈높이 1,600 mm')});v.preparing=true;v.load(model,rebar);});
   await loadPhase('문·창문·가구의 상세를 준비합니다.',()=>{v.apartmentDetails=new ApartmentDetails(v);v.apartmentDetails.setPalette(state.palette);v.fireGuide=new ApartmentFireView(v);});
   await loadPhase('전기·소방 기구를 연결합니다.',()=>{v.updateElectrical(electric);v.updateFire(fire);});
   await loadPhase('빛과 재질을 준비합니다.',()=>{v.setRealistic(true);v.site.visible=false;});
   v.renderer.domElement.setAttribute('aria-label','아파트 3D 학습 화면');view=v;v.simulation=new FireSimulation(v,{readFire:()=>({...fire,mains:state.power,battery:state.battery}),lesson:id=>apartmentFireLesson(fire,id),onSignal:id=>{state.fireSignal=id;refresh(false);},onPower:kind=>{if(kind==='power')state.power=!state.power;else state.battery=!state.battery;refresh();},before:()=>{stopGuides();layout('model');$('apt-view-title').textContent='소방 실감 시뮬레이션';},navigate:async(kind,id)=>{if(kind==='term')term(['extinguish','extinguished'].includes(v.simulation.state.phase)?'extinguisher':'detector');else if(kind==='safety')await go('safety');else{await go('fire','F-201');select(id);layout('split');}}});return v;
  }catch(error){v?.dispose();throw error;}
 })().catch(error=>{pending=null;throw error;});
 return pending;
}

function refresh(persist=true){const guiding=view?.fireGuide.active;electric=apartmentElectrical(state);fire=apartmentFire(state);view?.updateElectrical(electric);view?.updateFire(fire);if(guiding)view.fireGuide.show(apartmentFireLesson(fire,fireId),fireStep,fire);plan();inspector();content();tools();if(persist)save();}
function plan(){if(!$('apt-workspace').hidden){$('apt-plan').innerHTML=apartmentPlan({model,electric,rebar,fire,sheet,selected});$('apt-plan-title').textContent=sheet+' · '+apartment.sheets.find(s=>s.id===sheet).title;applyPlanBox();}}
function closeMenu(){$('site-top').dataset.menuOpen='false';$('menu-toggle').setAttribute('aria-expanded','false');$('menu-toggle').setAttribute('aria-label','학습 메뉴 열기');}
async function go(next,sheetId=null){
 const started=performance.now(),request=++serial;closeMenu();view?.simulation?.leave();view?.fireGuide?.stop();$('apt-route-lesson').hidden=true;$('apt-fire-lesson').hidden=true;
 page=names[next]?next:'home';$('title').textContent=names[page];$('description').textContent=descriptions[page];view?.tour.stop();view?.exitWalk(false);
 const needsView=['building','materials','structure','electrical','fire','fire-test','fire-signal','experience'].includes(page);
 $('apt-workspace').hidden=!needsView;$('apt-workspace').inert=needsView;$('apt-content').replaceChildren();$('apartment-app').dataset.page=page;$('apartment-app').dataset.ready='false';$('apt-retry-actions').hidden=true;delete $('apartment-app').dataset.error;
 history.replaceState(null,'','#'+page);
 document.querySelectorAll('[data-page]').forEach(b=>{if(b.dataset.page===(b.closest('.fire-pages')&&page==='fire-signal'?'fire-test':!b.closest('.fire-pages')&&page.startsWith('fire')?'fire':page))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 if(needsView){
  $('loading').hidden=false;retryRoute=[page,sheetId];
  try{
   const ready=await ensureView();if(request!==serial)return false;
   const group=page.startsWith('fire')?'fire':page==='experience'?'building':page;
   $('apt-sheet').innerHTML=apartment.sheets.filter(s=>s.menu===group).map(s=>'<option value="'+s.id+'">'+s.id+' · '+s.title+'</option>').join('');
   setSheet(sheetId??({electrical:'E-201',structure:'S-201',fire:'F-201','fire-test':'F-201','fire-signal':'F-201',materials:'M-201'}[page]??'A-201'));
   if(page==='experience'){ready.enterWalk(room);ready.setNight(false);layout('model');}else layout(['fire-test','fire-signal'].includes(page)?'model':'split');
   ready.preparing=true;
   await loadPhase('화면을 그리는 중입니다.',async()=>{await ready.renderer.compileAsync(ready.scene,ready.active);if(request===serial)ready.renderer.render(ready.scene,ready.active);});
   if(request!==serial)return false;ready.preparing=false;
  }catch(error){
   if(request!==serial)return false;
   view?.dispose();view=null;pending=null;$('apt-workspace').hidden=true;
   $('apt-loading-message').textContent='3D 공간 준비 중 문제가 생겼습니다. 실습 값은 유지됩니다. 다시 시도하거나 다른 메뉴를 이용하세요.';
   $('apt-loading-spinner').hidden=true;$('apt-retry-actions').hidden=false;$('loading').hidden=false;$('apartment-app').dataset.error=error.message;
   return false;
  }
 }
 $('loading').hidden=true;$('apt-workspace').inert=false;selected=null;view?.highlight(null);inspector();tools();content();
 view?.simulation?.setPage(page);$('apartment-app').dataset.ready='true';$('apartment-app').dataset.navigationMs=String(Math.round(performance.now()-started));window.scrollTo({top:0,behavior:'instant'});return true;
}

function layout(value){document.querySelector('.apt-canvases').dataset.layout=value;view?.size();}
function setSheet(id){view.fireGuide.stop();$('apt-route-lesson').hidden=true;$('apt-fire-lesson').hidden=true;planBox=[0,0,1000,820];view.apartmentDetails.setCutaway(false);$('apt-cutaway').setAttribute('aria-pressed','false');sheet=id;$('apt-sheet').value=id;view.tour.stop();view.rebarSheet=null;view.rebarFocus=null;view.electricalSheet=id.startsWith('E-')?id:null;view.circuitFocus=null;view.rebarDisplay='both';
 if(id.startsWith('M-')){assembly=id==='M-201'?'exterior':id==='M-203'?'floor':assembly==='wet'?'wet':'interior';view.apartmentDetails.showAssembly(assembly);}
 else if(id==='S-201'){view.view('rebar','iso');view.focusMember('apartment-floor');}
 else if(id==='A-202'){view.view('section','front');}
 else view.view(id.startsWith('E')?'electrical':id.startsWith('F')?'fire':'interior','iso');
 view.setRealistic(true);view.setNight(false);view.site.visible=false;view.orthoHeight=9.4;view.size();plan();tools();$('apt-view-title').textContent=apartment.sheets.find(s=>s.id===sheet).plain;}
function select(id){if(id?.startsWith('assembly-')){const a=apartmentAssemblies.find(a=>a.layers.some(l=>'assembly-'+a.id+'-'+l.id===id));if(a){assembly=a.id;view.apartmentDetails.showAssembly(assembly);tools();}}selected=id;view?.highlight(id);plan();inspector();status((getObject(id)?.name??id)+' · 도면과 3D에서 같은 대상');}
function getObject(id){if(id?.startsWith('assembly-'))return view?.materialGroup.children.find(m=>m.userData.id===id)?.userData; if(id?.startsWith('room-'))return apartment.rooms.find(r=>'room-'+r.id===id);return electric.devices.find(d=>d.id===id)??fire.devices.find(d=>d.id===id)??model.elements.find(d=>d.id===id);}
function inspector(){const d=getObject(selected);if(!d){$('apt-inspector').innerHTML='<h2>방이나 기구를 선택하세요.</h2><p>같은 대상의 이름과 치수, 연결 회로가 나타납니다.</p>';return;}
 if(d.layer){$('apt-inspector').innerHTML=`<h2>${d.layer.name}</h2><p>${d.layer.mm} mm · ${d.assembly.name}</p><p>${d.layer.role}</p><div class="button-row"><button data-select="${d.assembly.target}" data-material-location="${d.assembly.id}">건물에서 위치 보기</button><button data-term="${d.assembly.id==='floor'?'slab':'partition'}">관련 용어</button></div>`;return;}
 let note=d.bounds?`내부 ${f(d.bounds[2]-d.bounds[0])} × ${f(d.bounds[3]-d.bounds[1])} m · ${f((d.bounds[2]-d.bounds[0])*(d.bounds[3]-d.bounds[1]))} ㎡`:d.pos?`설치 중심 ${Math.round((d.pos[2]-apartment.finishLevel)*1000)} mm · ${d.circuit?'회로 '+d.circuit:''}`:`하단 ${Math.round(d.base*1000)} mm · 높이 ${Math.round(d.height*1000)} mm`;
 const r=electric.routes.find(r=>r.target===d.id);if(r)note+=' · 배관 '+f(routeLength(r.points))+' m';if(d.system==='fire')note+=' · '+(d.kind==='extinguisher'?'현관 근처 보관':d.on?'작동 중':'대기');
 $('apt-inspector').innerHTML=`<h2>${d.name}</h2><p>${note}</p>${d.system==='fire'?'<p>'+fireDeviceLessons[d.kind].text+'</p>':''}<div class="button-row">${d.bounds?`<button data-room="${d.id}">이 방에 들어가기</button>`:''}${d.kind==='light'?`<button data-switch="${d.switch}">${d.on?'불 끄기':'불 켜기'}</button><button data-tour="${d.id}">분전반부터 경로 보기</button>`:''}${d.kind==='switch'?`<button data-switch="${d.id}">스위치 ${d.on?'끄기':'켜기'}</button>`:''}${d.circuit?`<button data-calc="${d.circuit}">이 회로 계산</button><button data-sheet="E-203">회로도</button>`:''}${d.system==='fire'?`<button data-fire="${d.id}">이 기구 살펴보기</button>`:''}<button data-term="${d.kind==='panel'?'panel':d.circuit?'circuit':d.id==='apartment-floor'?'slab':d.system==='fire'?({smoke:'detector',heat:'detector',bell:'fire-alarm',emergency:'emergency',extinguisher:'extinguisher'}[d.kind]??'fire-alarm'):'plan'}">쉬운 용어</button></div>${d.watts?`<form id="apt-watts-form"><label>기구 입력전력 <input id="apt-watts" aria-label="기구 입력전력 W" type="number" min="1" max="5000" required value="${d.watts}"> W</label> <button>설계에 적용</button></form>`:''}`;
 if($('apt-watts-form'))$('apt-watts-form').onsubmit=e=>{e.preventDefault();const w=Number($('apt-watts').value);if(!Number.isFinite(w)||w<1||w>5000)return;state.watts[d.id]=w;refresh();status(d.name+' 전력을 3D·회로·계산에 적용했습니다.');};
}
function tools(){if(!view)return;renderGuideDock();const el=$('apt-tools');
 if(page==='materials'){el.innerHTML=apartmentAssemblies.map(a=>'<button data-assembly="'+a.id+'" aria-pressed="'+(assembly===a.id)+'">'+a.name+'</button>').join('')+'<button id="apt-material-house">집의 마감 보기</button>';$('apt-material-house').onclick=()=>{view.view('interior','iso');view.site.visible=false;layout('model');};return;}
 if(page==='structure'){el.innerHTML='<button data-bars="both">콘크리트와 철근</button><button data-bars="bars">철근만 보기</button><button data-bars="concrete">콘크리트만 보기</button><button data-struct-calc="true">이 바닥판 계산</button>';return;}
 if(page==='experience'){el.innerHTML=`<label>이동할 방 <select id="apt-room">${apartment.rooms.map(r=>`<option value="${r.id}" ${r.id===room?'selected':''}>${r.name}</option>`).join('')}</select></label><label><input id="apt-night" type="checkbox" ${view.night?'checked':''}> 야간 조명</label><button data-move="forward">앞으로</button><button data-move="back">뒤로</button><button data-turn="left">왼쪽 보기</button><button data-turn="right">오른쪽 보기</button><button id="apt-exit">밖에서 보기</button>`;$('apt-room').onchange=e=>{room=e.target.value;view.enterWalk(room);tools();};$('apt-night').onchange=e=>view.setNight(e.target.checked);$('apt-exit').onclick=()=>{view.exitWalk();view.view('interior','iso');view.site.visible=false;};return;}
 if(page==='electrical'){el.innerHTML='<button data-tour="'+tourId+'" class="primary">전기 길 따라가기</button><button data-sheet="E-201">조명 도면</button><button data-sheet="E-202">콘센트 도면</button><button data-sheet="E-203">회로도</button>';renderElectricGuide();return;}
 if(page==='fire'){el.innerHTML='<button data-select="AX1">소화기 위치</button><button data-select="AB1">경보 장치 위치</button><button data-page="safety">안전점검 연결</button>';return;}if(page==='fire-signal'){renderFireGuide();}
 el.innerHTML=page==='fire-signal'?'<button data-fire-test="AD1">침실 감지 시험</button><button data-fire-reset="true">경보 복구</button><button data-page="safety">안전점검 연결</button>':'<span>도면과 같은 공간을 돌려보세요.</span><button data-sheet="A-201">평면도</button><button data-sheet="A-202">단면도</button>';
}
function homeContent(){
 const lessons=[['building','건물과 친해지기','먼저 집을 돌려보세요. 전체 모습과 방의 위치를 알아봅니다.','집 둘러보기'],['section','평면도와 단면도 읽기','도면에서 고른 대상이 3D에서도 선택됩니다. 단면도에서는 바닥과 천장 사이 높이를 읽습니다.','단면도 열기'],['structure','콘크리트 속 철근 보기','바닥판의 콘크리트와 철근을 비교하고, 피복과 간격이 계산에 어떻게 쓰이는지 확인합니다.','철근 살펴보기'],['electrical','전기기구와 회로 연결하기','분전반에서 벽 속 배관과 스위치를 거쳐 조명까지 전기의 길을 따라갑니다.','전기설계 열기'],['calculations','조건을 바꿔 계산하기','기구 전력과 하중을 바꾸고 같은 공식으로 결과를 비교합니다.','계산 과정 보기'],['experience','내가 설계한 집에 들어가기','눈높이로 방에 들어가 불을 켜고, 소방과 안전점검 메뉴에서 배운 연결을 확인합니다.','실내 체험 시작']];
 $('apt-content').innerHTML=`<section class="home-intro"><div><span class="tag">건축에서 전기·소방·안전점검까지, 하나의 공간으로 배우다.</span><h2>이 아파트가 두 번째 교재입니다.</h2><p>방의 위치를 찾고, 벽 속을 보고, 조명에 전기를 연결합니다. 경비실에서 배운 흐름을 우리 집으로 이어보세요.</p><div class="button-row"><button data-page="building" class="primary">레슨 02 시작</button><button data-page="experience">먼저 집 안에 들어가기</button></div><p class="small">6단계 중 ${state.completed.length}단계 학습 표시 · 표시한 내용은 이 브라우저에 저장됩니다.</p></div><div class="home-facts"><div><strong>3개</strong><span>침실</span></div><div><strong>${apartment.sheets.length}장</strong><span>연결 도면</span></div><div><strong>5개</strong><span>전기 회로</span></div></div></section>
 <section class="home-preview"><img src="/pages/guardhouse-classroom/apartment-preview.webp" width="1280" height="620" alt="실제 아파트 학습 모델의 벽과 천장을 열고 바라본 거실·주방과 세 침실"><div><strong>어디부터 살펴볼까요?</strong><p>방 3개와 거실·주방, 욕실, 현관을 가진 한 세대입니다. 방별 내부면적 합계 ${f(apartmentArea(),1)}㎡의 자체 제작 평면에서 시작합니다.</p><button data-page="building" class="primary">도면과 3D 열기</button><p class="small">발코니·공용 복도를 제외한 수업용 한 세대입니다.</p></div></section>
 <section class="lesson-path" aria-label="학습 순서">${lessons.map(([id,title,text,label],i)=>`<article class="lesson-card"><span class="step-number">${String(i+1).padStart(2,'0')} / 06</span><h3>${title}</h3><p>${text}</p><div class="button-row"><button ${id==='section'?'data-sheet="A-202"':'data-page="'+id+'"'}>${label}</button><label class="complete"><input type="checkbox" data-complete="${id}" ${state.completed.includes(id)?'checked':''}> 학습했어요</label></div></article>`).join('')}</section>`;
}
function materialsContent(){
 $('apt-content').innerHTML=`<div class="content-grid"><article class="card"><h2>마감 분위기를 바꿔보세요.</h2><p>같은 도면의 벽지·마루·수납장·패브릭 색을 바꿉니다. 외벽의 단열 구성과 방의 크기는 유지됩니다.</p><div class="button-row">${apartmentPalettes.map(p=>`<button data-palette="${p.id}" aria-pressed="${state.palette===p.id}">${p.name}</button>`).join('')}</div></article><article class="card"><h2>외벽과 내벽은 역할이 다릅니다.</h2><p>외벽은 바깥 날씨와 실내를 나누고, 내벽은 실내의 방을 나눕니다. 욕실에는 물을 막는 층이 필요하고, 마루 아래에는 난방·단열·완충층이 있습니다.</p><p class="small">아래 두께는 이 교육 모델의 채택값입니다. 다른 벽체 방식과 재료도 있을 수 있습니다.</p></article></div><div class="content-grid apt-assemblies">${apartmentAssemblies.map(a=>`<article class="card"><h2>${a.name}</h2><p>${a.plain}</p><ol>${a.layers.map(l=>`<li><strong>${l.name} · ${l.mm} mm</strong><p>${l.role}</p></li>`).join('')}</ol><div class="button-row"><button data-assembly="${a.id}">재료층 분해해서 보기</button><button data-material-location="${a.id}">건물에서 위치 보기</button></div></article>`).join('')}</div><article class="card"><h2>같은 재료라도 구성 전체를 봅니다.</h2><p>외장재·단열재·바탕·이음부가 함께 벽을 만듭니다. 마감 색만 바꾸어 화재나 단열 성능이 바뀌었다고 판단하지 않습니다.</p><div class="button-row"><button data-page="fire">소방설계 연결</button><button data-page="safety">안전점검 연결</button>${materialSources.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener">${label}</a>`).join('')}</div></article>`;
}
function content(){const el=$('apt-content');
 if(page==='home'){homeContent();return;}
 if(page==='materials'){materialsContent();return;}
 if(page==='building'){el.innerHTML='<article class="card"><h2>같은 집을 여러 방법으로 읽습니다.</h2><p>평면도는 위에서 본 방의 배치입니다. 단면도는 높이를 읽습니다. 천장 열기는 천장과 윗층 바닥판을 숨겨 실내를 보여줍니다.</p><div class="apt-room-list">'+apartment.rooms.map(r=>`<button data-select="room-${r.id}">${r.name}</button>`).join('')+'</div></article>';return;}
 if(page==='structure'){el.innerHTML='<article class="card"><h2>세대의 바닥은 아래층의 천장 위에 있습니다.</h2><p>두께 180 mm 바닥판, 피복 25 mm, D10 @150의 상·하부 배근을 비교합니다. 계산은 침실의 2.6 m 대표 경간을 1 m 폭의 양 끝 지지 띠로 읽습니다.</p><details><summary>배근 모형의 범위</summary><p>수직하중과 휨을 이해하는 직선 철근 배치입니다. 건물 전체의 내진·풍하중 해석이나 개구부 보강·정착·이음 상세를 포함한 구조설계서는 아닙니다.</p></details><div class="button-row"><button data-struct-calc="true">계산의 이유와 값 보기</button><button data-term="cover">피복 뜻</button><button data-term="rebar">배근 뜻</button></div></article>';return;}
 if(page==='electrical'||page==='experience'){el.innerHTML=`<div class="content-grid"><article class="card"><h2>어느 방에 불이 켜질까요?</h2><p>주전원·차단기·스위치가 모두 연결되어야 조명이 켜집니다.</p><div class="switch-bank">${electric.devices.filter(d=>d.kind==='switch').map(d=>`<button data-switch="${d.id}" aria-pressed="${d.on}">${d.name} ${d.on?'켜짐':'꺼짐'}</button>`).join('')}</div><div class="button-row"><button data-power="true">주전원 ${state.power?'켜짐':'꺼짐'}</button></div></article><article class="card"><h2>${page==='experience'?'눈높이에서 둘러보기':'내가 선택할 전기기구'}</h2><p>${page==='experience'?'드래그로 시선, W·A·S·D로 이동합니다. 휠은 서 있는 위치에서 시야를 확대합니다. 가까운 스위치를 누르면 같은 방의 불을 조작합니다.':'기구를 고르면 입력전력을 바꾸고 계산으로 이동할 수 있습니다.'}</p><div class="button-row">${electric.devices.filter(d=>d.watts).map(d=>`<button data-select="${d.id}">${d.name}</button>`).join('')}</div></article></div>${page==='electrical'?`<article class="card"><h2>용도별로 회로를 나눕니다.</h2><div class="table-scroll"><table><thead><tr><th>회로</th><th>입력전력</th><th>전류</th><th>차단기</th><th>연결</th></tr></thead><tbody>${electric.circuits.map(c=>`<tr><td>${c.id} · ${c.name}</td><td>${c.watts} W</td><td>${f(c.current)} A</td><td><button data-breaker="${c.id}">${c.breaker} A · ${state.breakers[c.id]===false?'꺼짐':'켜짐'}</button></td><td><button data-calc="${c.id}">계산</button></td></tr>`).join('')}</tbody></table></div></article>`:''}`;return;}
 if(page==='fire'){el.replaceChildren();return;}if(page==='fire-test'){el.innerHTML='<button data-page="fire-signal">기구 신호만 따로 시험하기</button>';return;}if(page==='fire-signal'){el.innerHTML=`<div class="content-grid"><article class="card"><h2>${fire.alarm?'시험 신호로 경보가 작동했습니다.':'화재 신호의 연결을 살펴봅니다.'}</h2><p>연기·열 감지기의 시험 신호가 세대 경보 장치로 전달됩니다. 주전원이 끊기면 예비전원 상태를 확인합니다.</p><div class="button-row">${fire.devices.filter(d=>['smoke','heat'].includes(d.kind)).map(d=>`<button data-fire-test="${d.id}">${d.name} 시험</button>`).join('')}<button data-fire-reset="true">경보 복구</button></div><p role="status">소방 전원 ${fire.powered?'사용 가능':'없음'} · 경보 ${fire.alarm?'작동':'대기'} · 입력 ${state.fireSignal??'없음'}</p><div class="button-row"><button data-power="true">주전원 ${state.power?'켜짐':'꺼짐'}</button><button data-battery="true">예비전원 ${state.battery?'켜짐':'꺼짐'}</button></div></article><article class="card"><h2>알림을 받으면, 출입구의 위치를 찾습니다.</h2><p>초록선은 현관까지 이어지는 피난 경로입니다. 감지기 시험 후 3단계 안내에서 해당 위치의 3D 경로도 볼 수 있습니다. 각 침실 문과 현관까지의 통로를 함께 확인하세요. 소화기는 현관 쪽에 배치했습니다.</p><div class="button-row"><button data-select="AX1">소화기 찾기</button><button data-select="AE1">비상조명 찾기</button><button data-page="safety">안전점검 기록</button></div><details><summary>이 소방 수업에서 다루는 범위</summary><p>세대 기구의 역할·신호·전원·피난 동선을 배우는 모형입니다. 아파트 동 전체의 수신기, 공용 피난시설, 소화용수·스프링클러 수리계산과 법정 설치 판정은 포함하지 않습니다.</p></details></article></div>`;return;}
 if(page==='safety'){el.innerHTML=fireSimulationResult(apartment.id)+`<p class="apt-conditions">${Object.values(state.checks).filter(Boolean).length} / ${apartmentChecks.length} 항목을 살펴봤습니다. 이 표시는 학습 기록이며 현장 점검 합격을 뜻하지 않습니다.</p><div class="apt-lesson-grid">${apartmentChecks.map(c=>`<article class="card"><h3>${c.name}</h3><p>${c.detail}</p><div class="button-row"><button data-check-target="${c.id}">해당 위치 보기</button><label><input type="checkbox" data-check="${c.id}" ${state.checks[c.id]?'checked':''}> 살펴봤어요</label></div></article>`).join('')}</div><div class="button-row"><button id="export-checks">학습 기록 저장</button></div>`;$('export-checks').onclick=()=>download('아파트-안전학습.json',JSON.stringify({sample:apartment.id,checks:state.checks,recordedAt:new Date().toISOString()},null,2),'application/json');return;}
  if(page==='glossary'){el.innerHTML='<div class="glossary-grid">'+allTerms.map(t=>`<article class="card"><h2>${t.term}</h2><p>${t.plain}</p><p>${t.definition}</p><div class="button-row"><button data-term="${t.id}">뜻 자세히</button>${t.element?`<button data-term-target="${t.id}">${t.locationLabel}</button>`:`<span class="small">${t.locationNote}</span>`}</div></article>`).join('')+'</div>';return;}
 if(page==='calculations')calculationContent();
}
function calculationContent(){
 $('apt-content').innerHTML=apartmentCalculationHTML(electric,calc);saveReader();
 if($('apt-calc-circuit'))$('apt-calc-circuit').onchange=e=>{calc.circuit=e.target.value;calculationContent();};
 if($('calc-step'))$('calc-step').onchange=e=>{calc.step=e.target.value;calculationContent();};
 if($('apt-formula-jump'))$('apt-formula-jump').onchange=e=>{calc.step=e.target.value;saveReader();$('formula-'+calc.step).scrollIntoView({block:'start'});};
 if($('apt-trial-calculate')){$('apt-trial-calculate').onclick=()=>{const value=Number($('apt-live').value);if(!Number.isFinite(value)||value<0||value>20){$('apt-trial-error').textContent='0부터 20 사이 값을 입력하세요.';return;}calc.live=value;calculationContent();};$('apt-trial-restore').onclick=()=>{calc.live=2;calculationContent();};}
 $('apt-save-calculation').onclick=()=>download('아파트-현재-계산.json',JSON.stringify({sample:apartment.id,lesson:apartmentLesson(electric,calc),state:calc},null,2),'application/json');
}
function term(id){const t=allTerms.find(t=>t.id===id);$('apt-term-title').textContent=t?.term??'소방설비';$('apt-term-body').textContent=t?t.plain+'. '+t.definition:'화재의 발생을 알아채고 알리거나 피난과 초기 대응을 돕는 설비입니다. 이 예제에서는 감지기·경보 장치·예비전원·소화기·비상조명을 연결해 봅니다.';$('apt-term-location').innerHTML=t?.element?'<button data-term-target="'+t.id+'">'+t.locationLabel+'</button>':(t?.locationNote??'');$('apt-term').showModal();}
function toggleSwitch(id){state.switches[id]=state.switches[id]===false;refresh();status('스위치와 연결 조명 상태를 갱신했습니다.');}
function startTour(id){tourId=id;view.view('electrical','iso');view.electricalSheet=null;view.tour.show(id,tourStep);view.site.visible=false;select(view.tour.data.steps[tourStep].element);tools();$('apt-view-title').textContent='전기 길 · '+view.tour.data.light.name;renderGuideDock();showGuideModel();}
function renderElectricGuide(){renderGuideDock();const el=$('apt-route-lesson');el.hidden=!view.tour.active;if(el.hidden)return;
 el.innerHTML=tourControls(electric,{id:tourId,step:tourStep,playing:view.tour.playing,follow:view.tour.follow,ghost:view.tour.ghost},{drawing:'E-203'});
 $('tour-target').onchange=e=>{tourStep=0;startTour(e.target.value);};
 $('tour-play').onclick=()=>{view.tour.play();renderElectricGuide();showGuideModel();};
 $('tour-follow').onchange=e=>{view.tour.follow=e.target.checked;};
 $('tour-ghost').onchange=e=>{view.tour.ghost=e.target.checked;view.applyVisibility();view.tour.readout();};
 $('tour-close').onclick=()=>{view.tour.stop();view.applyVisibility();el.hidden=true;renderGuideDock();};
 $('tour-calculation').onclick=async()=>{calc.mode='electrical';calc.circuit=view.tour.data.light.circuit;calc.step='route-length';await go('calculations');if(page==='calculations')$('apt-content').querySelector('.report-actions')?.insertAdjacentHTML('beforeend','<button data-tour="'+tourId+'">전기 길 이어보기</button>');};
}
function stopGuides(){view.fireGuide.stop();view.tour.stop();$('apt-fire-lesson').hidden=true;$('apt-route-lesson').hidden=true;renderGuideDock();}
function showGuideModel(){layout('model');$('apt-guide-dock').parentElement.scrollIntoView({block:'start'});}
function renderGuideDock(){const el=$('apt-guide-dock'),isFire=!!view?.fireGuide.active,isElectric=!!view?.tour.active;el.hidden=!isFire&&!isElectric;if(el.hidden)return;const steps=isFire?apartmentFireLesson(fire,fireId).steps:view.tour.data.steps,index=isFire?fireStep:tourStep,playing=isFire?view.fireGuide.playing:view.tour.playing,disabled=isFire&&(fireStep===0||fireStep===1&&!fire.alarm);
 el.innerHTML='<strong>'+steps[index].title+'</strong><div class="button-row"><button data-guide-prev="true" '+(index===0?'disabled':'')+'>이전 단계</button><button data-guide-play="true" '+(disabled?'disabled':'')+'>'+(playing?'일시정지':'경로 재생')+'</button><button data-guide-next="true" '+(index===steps.length-1?'disabled':'')+'>다음 단계</button><button data-guide-detail="true">설명·전원 설정</button></div>';
 el.querySelector('[data-guide-prev]').onclick=()=>{if(isFire){fireStep--;startFireGuide();}else{tourStep--;startTour(tourId);}};
 el.querySelector('[data-guide-next]').onclick=()=>{if(isFire){fireStep++;startFireGuide();}else{tourStep++;startTour(tourId);}};
 el.querySelector('[data-guide-play]').onclick=()=>{if(isFire){view.fireGuide.play();renderFireGuide();}else{view.tour.play();renderElectricGuide();}};
 el.querySelector('[data-guide-detail]').onclick=()=>$(isFire?'apt-fire-lesson':'apt-route-lesson').scrollIntoView({block:'start'});
}
function startFireGuide(){view.simulation?.leave();view.fireGuide.show(apartmentFireLesson(fire,fireId),fireStep,fire);select(view.fireGuide.lesson.steps[fireStep].target);renderFireGuide();$('apt-view-title').textContent=view.fireGuide.lesson.steps[fireStep].title;renderGuideDock();showGuideModel();}
function renderFireGuide(){renderGuideDock();const el=$('apt-fire-lesson');el.hidden=!view?.fireGuide.active||page!=='fire-signal';if(el.hidden)return;const lesson=apartmentFireLesson(fire,fireId);
 el.innerHTML=`<div class="tour-heading"><div><span class="eyebrow">감지 · 알림 · 피난</span><h2>${lesson.steps[fireStep].title}</h2></div><label>발생 위치 <select id="fire-target">${fire.devices.filter(d=>['smoke','heat'].includes(d.kind)).map(d=>`<option value="${d.id}" ${d.id===fireId?'selected':''}>${d.name}</option>`).join('')}</select></label><button id="fire-guide-close">안내 닫기</button></div>
 <div class="tour-steps">${lesson.steps.map((s,i)=>`<button data-fire-step="${i}" aria-pressed="${i===fireStep}">${s.title}</button>`).join('')}</div><p class="tour-explanation">${lesson.steps[fireStep].text}</p>
 <div class="fire-state ${fire.alarm?'is-alarm':''}" role="status"><strong>${fire.alarm?'경보 작동':!fire.powered?'전원 없음 · 경보 작동 불가':'경보 대기'}</strong><p>시험 입력: ${state.fireSignal?fire.devices.find(d=>d.id===state.fireSignal)?.name:'없음'} · 주전원 ${state.power?'켜짐':'꺼짐'} · 예비전원 ${state.battery?'켜짐':'꺼짐'}</p></div>
 <div class="tour-controls"><button id="fire-guide-play" class="primary" ${fireStep===0||fireStep===1&&!fire.alarm?'disabled':''}>${view.fireGuide.playing?'안내 일시정지':fireStep===2?'피난 경로 따라가기':'경보 신호 따라가기'}</button><button data-fire-test="${fireId}">이 감지기 시험</button><button data-fire-reset="true">경보 복구</button><button data-power="true">주전원 ${state.power?'켜짐':'꺼짐'}</button><button data-battery="true">예비전원 ${state.battery?'켜짐':'꺼짐'}</button></div>
 <div class="tour-links"><button data-select="AB1">경보 장치 찾기</button><button data-select="AX1">소화기 찾기</button><button data-select="AE1">비상조명 찾기</button><button data-page="safety">안전점검 연결</button><span>신호선은 이 세대의 교육용 계획 경로입니다. 이동하는 표식은 전달 순서를 보여주며 실제 신호 속도나 화재 확산을 재현하지 않습니다.</span></div>`;
 $('fire-target').onchange=e=>{fireId=e.target.value;select(fireId);startFireGuide();};
 $('fire-guide-play').onclick=()=>{view.fireGuide.play();renderFireGuide();showGuideModel();};
 $('fire-guide-close').onclick=()=>{view.fireGuide.stop();el.hidden=true;view.apartmentDetails.setCutaway(false);renderGuideDock();};
}
function locateFire(id){view.simulation?.leave();view.fireGuide.stop();$('apt-fire-lesson').hidden=true;view.view('fire','iso');view.apartmentDetails.setCutaway(false);view.site.visible=false;view.fireGuide.focus(id);select(id);renderGuideDock();showGuideModel();$('apt-view-title').textContent=fire.devices.find(d=>d.id===id).name;}
async function destination(id,sheetId=null){const isFire=fire.devices.some(d=>d.id===id),isBuilding=model.elements.some(d=>d.id===id);const next=sheetId?apartment.sheets.find(s=>s.id===sheetId).menu:isFire?'fire':id==='apartment-floor'?'structure':id.startsWith('room-')||isBuilding?'building':'electrical';if(!await go(next,sheetId))return false;select(id);$('apt-inspector').insertAdjacentHTML('beforeend','<div class="button-row"><button data-page="safety">안전점검 기록</button><button data-page="calculations">계산 이어보기</button><button data-page="glossary">용어사전으로</button></div>');$('apt-workspace').scrollIntoView({block:'start'});return true;}
function download(name,data,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('click',async e=>{const b=e.target.closest('button,[data-object]');if(!b)return;
 if(b.dataset.page)await go(b.dataset.page);if(b.dataset.object){if(page==='home'&&!await go('building'))return;select(b.dataset.object);}if(b.dataset.select){select(b.dataset.select);if(page.startsWith('fire')&&fire.devices.some(d=>d.id===b.dataset.select))locateFire(b.dataset.select);}
 if(b.dataset.sheet){const s=apartment.sheets.find(s=>s.id===b.dataset.sheet);if(page!==s.menu||!view)await go(s.menu,s.id);else setSheet(s.id);}
 if(b.dataset.room){room=b.dataset.room;await go('experience');}
 if(b.dataset.switch)toggleSwitch(b.dataset.switch);
 if(b.dataset.power){state.power=!state.power;refresh();}if(b.dataset.breaker){state.breakers[b.dataset.breaker]=state.breakers[b.dataset.breaker]===false;refresh();}
 if(b.dataset.calc){calc.circuit=b.dataset.calc;calc.mode='electrical';await go('calculations');}
 if(b.dataset.calcTarget){const target=apartmentLesson(electric,calc).target;if(!await go(apartment.sheets.find(s=>s.id===(b.dataset.calcTarget==='drawing'?target.drawing:target.sheet)).menu,b.dataset.calcTarget==='drawing'?target.drawing:target.sheet))return;select(target.element);if(calc.mode==='electrical'){view.circuitFocus=calc.circuit;view.applyVisibility();}$('apt-inspector').insertAdjacentHTML('beforeend','<div class="button-row"><button data-page="calculations">읽던 계산 이어보기</button></div>');}
 if(b.dataset.calcDevice)await destination(b.dataset.calcDevice);
 if(b.dataset.calcMode){calc.mode=b.dataset.calcMode;calc.step=calc.mode==='electrical'?'power-sum':'dead';calculationContent();}
 if(b.dataset.calcIndex!==undefined){calc.step=apartmentLesson(electric,calc).steps[Number(b.dataset.calcIndex)].id;calculationContent();document.querySelector('.calc-reading').scrollIntoView({block:'start'});}
 if(b.dataset.reading){calc.view=b.dataset.reading;calculationContent();}
 if(b.dataset.palette){state.palette=b.dataset.palette;view.apartmentDetails.setPalette(state.palette);view.view('interior','iso');view.site.visible=false;layout('model');save();materialsContent();tools();}
 if(b.dataset.assembly){assembly=b.dataset.assembly;setSheet(apartmentAssemblies.find(a=>a.id===assembly).sheet);view.apartmentDetails.showAssembly(assembly);tools();}
 if(b.dataset.materialLocation){const a=apartmentAssemblies.find(a=>a.id===b.dataset.materialLocation);view.view('interior','iso');view.site.visible=false;select(a.target);$('apt-inspector').insertAdjacentHTML('beforeend','<div class="button-row"><button data-assembly="'+a.id+'">재료층 다시 보기</button></div>');}
 if(b.dataset.term)term(b.dataset.term);
 if(b.dataset.termTarget){const target=apartmentTermTarget(b.dataset.termTarget);if(target){$('apt-term').close();await destination(target.element,target.sheet);}}
 if(b.dataset.tour){const resume=page==='calculations';if(page!=='electrical'&&!await go('electrical'))return;if(!resume)tourStep=0;startTour(b.dataset.tour);}
 if(b.dataset.tourStep!==undefined){tourStep=Number(b.dataset.tourStep);startTour(tourId);}if(b.dataset.ref){setSheet(b.dataset.ref);}
 if(b.dataset.bars){view.rebarDisplay=b.dataset.bars;view.applyVisibility();}
 if(b.dataset.structCalc){calc.mode='structure';calc.step='dead';await go('calculations');}
 if(b.dataset.fireTest){view.simulation?.leave();state.fireSignal=b.dataset.fireTest;fireId=b.dataset.fireTest;fireStep=0;refresh();startFireGuide();view.simulation?.signalSound();}if(b.dataset.fireReset){state.fireSignal=null;refresh();}if(b.dataset.battery){state.battery=!state.battery;refresh();}
 if(b.dataset.fire){const d=fire.devices.find(d=>d.id===b.dataset.fire),lesson=fireDeviceLessons[d.kind];$('apt-term-title').textContent=d.name;$('apt-term-body').textContent=lesson.text;$('apt-term-location').replaceChildren();$('apt-term').showModal();}if(b.dataset.fireStep!==undefined){fireStep=Number(b.dataset.fireStep);startFireGuide();}
 if(b.dataset.checkTarget)await destination(apartmentChecks.find(c=>c.id===b.dataset.checkTarget).target);
 if(b.dataset.move)view.move(b.dataset.move==='forward'?1:-1,0);if(b.dataset.turn)view.turn(b.dataset.turn==='left'?.3:-.3);
});
$('apt-plan').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.closest('[data-object]')){e.preventDefault();select(e.target.closest('[data-object]').dataset.object);}});
document.addEventListener('change',e=>{if(e.target.dataset.complete){const id=e.target.dataset.complete;state.completed=state.completed.filter(v=>v!==id);if(e.target.checked)state.completed.push(id);save();homeContent();}if(e.target.dataset.check){state.checks[e.target.dataset.check]=e.target.checked;save();content();}});
$('apt-sheet').onchange=e=>setSheet(e.target.value);$('apt-whole').onclick=()=>{stopGuides();view.apartmentDetails.setCutaway(false);$('apt-cutaway').setAttribute('aria-pressed','false');view.whole();view.site.visible=false;tools();$('apt-view-title').textContent='윗층 바닥판까지 전체 보기';};$('apt-open').onclick=()=>{stopGuides();view.view('interior','iso');view.site.visible=false;tools();$('apt-view-title').textContent='천장을 연 아파트';};$('apt-cutaway').onclick=()=>{stopGuides();const on=!view.apartmentDetails.cutaway;view.view('interior','iso');view.apartmentDetails.setCutaway(on);view.site.visible=false;$('apt-cutaway').setAttribute('aria-pressed',String(on));$('apt-view-title').textContent=on?'벽과 천장을 열어 공간 읽기':'천장을 연 아파트';};$('apt-plan-only').onclick=()=>layout('plan');$('apt-model-only').onclick=()=>layout('model');$('apt-split').onclick=()=>layout('split');$('apt-save').onclick=()=>download(sheet+'.svg',apartmentPlan({model,electric,rebar,fire,sheet,selected:null}),'image/svg+xml');
$('menu-toggle').onclick=()=>{const open=$('menu-toggle').getAttribute('aria-expanded')!=='true';$('site-top').dataset.menuOpen=String(open);$('menu-toggle').setAttribute('aria-expanded',String(open));$('menu-toggle').setAttribute('aria-label',open?'학습 메뉴 닫기':'학습 메뉴 열기');};
$('reset').onclick=()=>$('apt-reset').showModal();$('apt-reset-confirm').onclick=()=>{state=freshApartment();refresh();$('apt-reset').close();go('home');};$('apt-three').addEventListener('tour-ended',()=>{if(page==='electrical')renderElectricGuide();});$('apt-three').addEventListener('fire-guide-ended',renderFireGuide);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
$('apt-retry').onclick=()=>{if(retryRoute)go(...retryRoute);};
go(location.hash.slice(1)||'home');

$('apt-zoom-in').onclick=()=>zoomPlan(.8);$('apt-zoom-out').onclick=()=>zoomPlan(1.25);$('apt-fit').onclick=()=>{planBox=[0,0,1000,820];applyPlanBox();};
$('apt-plan').addEventListener('wheel',e=>{e.preventDefault();zoomPlan(e.deltaY<0?.9:1.1);},{passive:false});
$('apt-plan').addEventListener('pointerdown',e=>{if(e.target.closest('[data-object]'))return;planDrag={x:e.clientX,y:e.clientY,box:[...planBox]};$('apt-plan').setPointerCapture(e.pointerId);});
$('apt-plan').addEventListener('pointermove',e=>{if(!planDrag)return;const rect=$('apt-plan').getBoundingClientRect(),scale=Math.min(rect.width/planBox[2],rect.height/planBox[3]);planBox=[planDrag.box[0]-(e.clientX-planDrag.x)/scale,planDrag.box[1]-(e.clientY-planDrag.y)/scale,planBox[2],planBox[3]];applyPlanBox();});
$('apt-plan').addEventListener('pointerup',()=>planDrag=null);$('apt-plan').addEventListener('pointercancel',()=>planDrag=null);
