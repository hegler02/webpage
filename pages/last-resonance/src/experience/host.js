/* Lifecycle host derived from McLuhan experience-host: one visibility owner. */
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),records=new Map(),loads=new Map();
const abort=new AbortController(),signal=abort.signal,events=[];
function emit(name,reason){events.push({name,reason,time:performance.now()});if(events.length>60)events.shift();}
function script(src){if(!loads.has(src))loads.set(src,new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('script-load'));document.head.append(s)}));return loads.get(src)}
function run(record){const active=record.intent&&record.visible&&!document.hidden&&!reduced.matches;record.controller?.[active?'resume':'pause'](active?'visible':'inactive');}
function fallback(record,reason){record.controller?.destroy(reason);record.controller=null;record.root.dataset.experience='fallback';emit(record.name,reason);if(record.name==='wgsl'){document.querySelector('#experience-status').textContent=reason==='reduced-motion'?'모션 감소 설정으로 정지 화면을 표시합니다.':'이 환경에서는 정지 화면으로 감상할 수 있습니다.';}}
async function mount(record){if(record.pending||record.controller||reduced.matches||!record.intent)return;if(record.failed)return;record.pending=true;const start=performance.now();try{const factory=await record.factory();const controller=await factory(record.root,{config:RESONANCE.experience,script,emit});record.controller=controller;if(!record.intent||reduced.matches){controller.destroy('cancelled');record.controller=null;}else{record.root.dataset.experience='mounted';run(record);emit(record.name,{initMs:performance.now()-start});}}catch(e){record.failed=true;fallback(record,e.message);}finally{record.pending=false;}}
function register(name,root,factory,intent){const record={name,root,factory,intent,visible:false,pending:false,controller:null,failed:false};records.set(name,record);const observer=new IntersectionObserver(([entry])=>{record.visible=entry.isIntersecting;if(record.visible)mount(record);run(record)});observer.observe(root);record.observer=observer;return record;}
const captions=register('gsap',document.querySelector('#webtoon'),async()=>{await script('src/experience/chapter-motion.js');return window.mountChapterMotion},true);
const field=register('wgsl',document.querySelector('#resonance-field'),async()=>{await script('src/experience/resonance-field.js');return window.mountResonanceField},false);
const toggle=document.querySelector('#resonance-toggle');
toggle.addEventListener('click',()=>{field.intent=!field.intent;toggle.setAttribute('aria-pressed',String(field.intent));toggle.textContent=field.intent?'공명 끄기':'공명 켜기';if(!field.intent){field.controller?.destroy('user-off');field.controller=null;field.root.dataset.experience='off';document.querySelector('#experience-status').textContent='';}else if(reduced.matches){fallback(field,'reduced-motion');}else{field.failed=false;mount(field);}});
document.addEventListener('visibilitychange',()=>records.forEach(run),{signal});
reduced.addEventListener('change',()=>{records.forEach(record=>{if(reduced.matches)fallback(record,'reduced-motion');else if(record.intent&&record.visible){record.failed=false;mount(record);}})},{signal});
window.addEventListener('pagehide',()=>{records.forEach(record=>{record.intent=false;record.observer.disconnect();record.controller?.destroy('pagehide');record.controller=null});abort.abort();},{signal});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
window.resonanceExperienceEvidence={events,records};
})();
