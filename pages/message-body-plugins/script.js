'use strict';
const tools = [
  {name:'소리',en:'SOUND',headline:'소리로 시작하기',verb:'듣게 하다',file:'sound-design-lab-v2',purpose:'전하고 싶은 감정과 생각을 노래와 소리로 풀어냅니다.',path:'M6 38v20m12-32v44m12-58v72m12-64v56m12-68v80m12-64v48m12-38v28m12-18v8'},
  {name:'이미지',en:'IMAGE',headline:'생각을 보이게 하기',verb:'보게 하다',file:'image-harness',purpose:'메시지를 한 장의 장면으로 구성합니다.',path:'M8 14h80v68H8z M8 68l25-25 20 16 13-12 22 23 M67 30a7 7 0 1 0 .1 0'},
  {name:'웹툰',en:'TOON',headline:'장면 사이를 읽게 하기',verb:'이어 읽다',file:'toon-agent-harness',purpose:'그림과 그림 사이에 이야기의 흐름을 만듭니다.',path:'M8 10h80v76H8z M8 49h80 M48 10v39 M36 49v37 M20 22h16v14H20z M59 22h17v14H59z'},
  {name:'영상',en:'VIDEO',headline:'시간 속에서 움직이기',verb:'움직이다',file:'video-agent-harness',purpose:'장면에 시간과 움직임을 더해 메시지를 전합니다.',path:'M8 18h80v60H8z M8 29h80 M8 67h80 M21 18v11m18-11v11m18-11v11m18-11v11 M21 67v11m18-11v11m18-11v11m18-11v11 M41 38l18 10-18 10z'},
  {name:'슬라이드',en:'SLIDE',headline:'이해의 순서 만들기',verb:'이해하다',file:'gestalt-slide-builder',purpose:'내용과 장면의 순서를 설계해 이해를 돕습니다.',path:'M8 14h80v55H8z M48 69v17 M32 86h32 M20 28h38 M20 40h24 M62 38h14v18H62z'},
  {name:'웹페이지',en:'WEB',headline:'메시지를 탐색하게 하기',verb:'연결하다',file:'webpage-builder',purpose:'독자가 직접 들어오고 탐색하는 메시지의 공간을 만듭니다.',path:'M8 12h80v72H8z M8 28h80 M18 20h4m6 0h4m6 0h4 M20 40h56v19H20z M20 70h24m8 0h24'},
  {name:'코딩',en:'CODE',headline:'메시지를 작동하게 하기',verb:'작동하다',file:'mirinaemans-coding-is-the-body-of-the-message--1.3.0',purpose:'하고 싶은 일을 컴퓨터가 이해하고 실행할 수 있게 만듭니다.',path:'m30 27-22 21 22 21 M66 27l22 21-22 21 M56 15 40 81'}
];
const state={scene:0,tool:0,platform:'OpenAI',step:0};
const scenes=[...document.querySelectorAll('.scene')];
document.querySelector('.media-flow').innerHTML=tools.map((t,i)=>`<button class="medium" data-tool="${i}" aria-label="${t.name} 도구 보기"><span class="number">0${i+1}</span><svg viewBox="0 0 96 96" aria-hidden="true"><path d="${t.path}"/></svg><strong>${t.name}</strong><small>${t.verb}</small></button>`).join('');
document.querySelector('.tool-list').innerHTML=tools.map((t,i)=>`<button class="tool-row" data-select="${i}" aria-pressed="${i===0}"><span>0${i+1}</span><span class="tool-name">${t.name}</span><small>${t.en}</small></button>`).join('');
document.querySelector('.closing-order').innerHTML=tools.map((t,i)=>`<button data-tool="${i}"><span>0${i+1}</span><strong>${t.name}</strong></button>`).join('');
function updatePackage(){
  const t=tools[state.tool],f=GuideData.files[state.tool];
  document.querySelector('#package-number').textContent=`0${state.tool+1} / ${t.en}`;
  document.querySelector('#package-title').textContent=t.headline;
  document.querySelector('#package-purpose').textContent=t.purpose;
  document.querySelector('#package-file').textContent=t.file+'.zip';
  document.querySelector('#package-meta').textContent=`${f.kind==='skill'?'스킬 ZIP':'플러그인 ZIP'} · ${(f.bytes/1e6).toFixed(2)} MB`;
  document.querySelector('#package-download').href=`https://drive.google.com/uc?export=download&id=${f.id}`;
  document.querySelector('#package-preview').href=`https://drive.google.com/file/d/${f.id}/view`;
  document.querySelector('#package-note').textContent=f.kind==='skill'?'이 파일은 스킬 묶음입니다. 다음 설치 화면에서 스킬 업로드 안내를 확인하세요.':'다운로드가 바로 시작되지 않으면 Drive에서 파일을 열고 다운로드를 선택하세요.';
  document.querySelectorAll('[data-select]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.select)===state.tool));
  document.querySelector('#practice-tool').textContent=`선택한 도구 · ${t.name}`;
  document.querySelector('#practice-prompt').textContent=GuideData.prompts[state.tool];
  document.querySelector('#copy-status').textContent='';
}
function updateStep(){
  let x=GuideData.install[state.platform][state.step];
  let source=GuideData.sources[state.platform];
  if(GuideData.files[state.tool].kind==='skill' && state.step===1){
    x=state.platform==='Claude'
      ? ['슬라이드 빌더는 스킬로 올립니다.','Skills의 사용자 스킬 업로드에서 ZIP 파일을 선택합니다. 통합 Plugins 메뉴가 적용된 계정에서는 스킬 관리 항목을 찾으세요.','선택한 파일','gestalt-slide-builder.zip · SKILL.md를 포함한 스킬 묶음']
      : ['슬라이드 빌더는 스킬 파일입니다.','이 ZIP에는 플러그인 선언 파일이 없습니다. ChatGPT의 Upload plugin에 그대로 넣는 경로는 확인되지 않았습니다.','이번 파일의 사용 경로','Claude의 스킬 업로드 경로를 이용하거나, 강사에게 사용 중인 OpenAI 환경에 맞는 설치 방법을 확인하세요.'];
    source=GuideData.sources.skill;
  }
  document.querySelector('#platform-name').textContent=state.platform;
  ['step-title','step-body','example-label','example-content'].forEach((id,i)=>document.getElementById(id).textContent=x[i]);
  document.querySelector('#platform-source').href=source;
  document.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.step)===state.step));
  document.querySelectorAll('[data-platform]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.platform===state.platform));
}
function show(index, selected = null, initial = false) {
  const next = Math.max(0, Math.min(scenes.length-1, index));
  if (!initial && next === state.scene) return;
  const previous = initial ? -1 : state.scene;
  const snapshot = GuideMotion.capture(initial ? null : scenes[previous], selected);
  state.scene = next;
  scenes.forEach((scene, i) => {
    scene.hidden = i !== next;
    scene.inert = i !== next;
  });
  document.querySelectorAll('[data-scene]').forEach(button => {
    if (Number(button.dataset.scene) === next) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  document.querySelector('#position').textContent = `0${next + 1} / 0${scenes.length}`;
  document.querySelector('#previous').disabled = next === 0;
  document.querySelector('#next').disabled = next === scenes.length-1;
  history.replaceState(null, '', `#scene-${next + 1}`);
  GuideMotion.enter(scenes[next], next, previous, snapshot);
}
function resize() {
  const viewport = document.querySelector('.viewport');
  const chrome = ['.review-bar', '.controls', '.review-note']
    .reduce((sum, selector) => sum + document.querySelector(selector).offsetHeight, 0);
  const availableHeight = Math.max(320, innerHeight - chrome - 24);
  const scale = Math.min(Math.min(innerWidth - 64, 1440) / 1920, availableHeight / 1080);
  document.documentElement.style.setProperty('--scale', scale);
  viewport.style.width = `${1920 * scale}px`;
  viewport.style.height = `${1080 * scale}px`;
}
document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.scene))));
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>{state.tool=Number(b.dataset.tool);updatePackage();updateStep();show(3,{index:state.tool});}));
document.querySelectorAll('[data-select]').forEach(b=>b.addEventListener('click',()=>{state.tool=Number(b.dataset.select);updatePackage();updateStep();GuideMotion.details(document.querySelector('.package'));}));
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{state.step=Number(b.dataset.step);updateStep();GuideMotion.details(document.querySelector('.step-detail'));}));
document.querySelectorAll('[data-platform]').forEach(b=>b.addEventListener('click',()=>{state.platform=b.dataset.platform;updateStep();GuideMotion.details(document.querySelector('.step-detail'));}));
document.querySelector('#previous').addEventListener('click',()=>show(state.scene-1));
document.querySelector('#next').addEventListener('click',()=>show(state.scene+1));
document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select') || e.altKey || e.ctrlKey || e.metaKey)return;if(e.key==='ArrowRight'){e.preventDefault();show(state.scene+1);}if(e.key==='ArrowLeft'){e.preventDefault();show(state.scene-1);}});
document.querySelector('#copy-prompt').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(GuideData.prompts[state.tool]);document.querySelector('#copy-status').textContent='복사했습니다. 설치한 도구를 선택한 대화에 붙여넣으세요.';}catch{document.querySelector('#copy-status').textContent='자동 복사를 사용할 수 없습니다. 위 문장을 직접 선택해 복사하세요.';}});
window.addEventListener('resize',resize);
document.body.classList.add('ready');updatePackage();updateStep();resize();const initial=Number(location.hash.replace('#scene-',''))-1;show(Number.isInteger(initial)&&initial>=0?initial:0,null,true);
