import './nav-feedback.mjs';
import {mountStudyReturn} from './glossary-study.mjs';
import {surfaceAtlasURL} from './surface-atlas.mjs';
export {mountGlossary} from './glossary-study.mjs';
export const samples=Object.freeze([
 {id:1,name:'경비실',path:'index.html',view:'classroom-view.mjs',atlas:true},
 {id:2,name:'아파트',path:'apartment.html',view:'classroom-view.mjs',atlas:true},
 {id:3,name:'클린룸',path:'cleanroom.html',view:'cleanroom-scene.mjs',atlas:true},
 {id:4,name:'컨베이어',path:'conveyor.html',view:'conveyor-scene.mjs'},
 {id:5,name:'솔크 연구소',path:'salk.html',view:'salk-view.mjs',atlas:true},
 {id:6,name:'판스워스 주택',path:'farnsworth.html',view:'farnsworth-view.mjs',atlas:true},
 {id:7,name:'낙수장',path:'fallingwater.html',view:'fallingwater-view.mjs',atlas:true},
 {id:8,name:'유민미술관',path:'yumin.html',view:'yumin-view.mjs',atlas:true}
]);
// The 3D part of a sample is asked for while the student reads the first screen, so the first 3D press does not begin with a download.
const AHEAD_DELAY=1500;let ahead=null;
function fetchAhead(sample){
 const line=navigator.connection;if(!sample?.view||line?.saveData||/2g/.test(line?.effectiveType??''))return;
 const idle=window.requestIdleCallback??(run=>setTimeout(run,1));
 setTimeout(()=>idle(()=>{
  import(new URL(sample.view,import.meta.url).href).catch(()=>{});
  if(sample.atlas){ahead=new Image();ahead.fetchPriority='low';ahead.src=surfaceAtlasURL;}
 }),AHEAD_DELAY);
}
export function mountSamples(current,onCurrent,onStudyReturn){
 fetchAhead(samples.find(s=>s.id===current));
 if(onStudyReturn)mountStudyReturn(current,onStudyReturn);
 const host=document.querySelector('[data-sample-navigation]');if(!host)return;
 host.setAttribute('aria-label','교육용 샘플 선택');
 host.innerHTML='<div class="sample-links">'+samples.map(s=>'<a href="'+new URL(s.path+'#home',import.meta.url).href+'" data-sample="'+s.id+'" '+(s.id===current?'aria-current="page"':'')+'>샘플 '+s.id+' · '+s.name+'</a>').join('')+'</div><label class="sample-select"><select aria-label="교육용 샘플">'+samples.map(s=>'<option value="'+s.id+'" '+(s.id===current?'selected':'')+'>샘플 '+s.id+' · '+s.name+'</option>').join('')+'</select></label>';
 const navigate=id=>{if(id===current)return onCurrent();const sample=samples.find(s=>s.id===id);if(sample)location.assign(new URL(sample.path+'#home',import.meta.url));};
 host.onclick=e=>{const a=e.target.closest('[data-sample]');if(a&&Number(a.dataset.sample)===current){e.preventDefault();onCurrent();}};
 host.querySelector('select').onchange=e=>navigate(Number(e.target.value));
}
