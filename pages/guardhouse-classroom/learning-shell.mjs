import {mountStudyReturn} from './glossary-study.mjs';
export {mountGlossary} from './glossary-study.mjs';
export const samples=Object.freeze([
 {id:1,name:'경비실',path:'index.html'},
 {id:2,name:'아파트',path:'apartment.html'},
 {id:3,name:'클린룸',path:'cleanroom.html'},
 {id:4,name:'컨베이어',path:'conveyor.html'},
 {id:5,name:'솔크 연구소',path:'salk.html'},
 {id:6,name:'판스워스 주택',path:'farnsworth.html'},
 {id:7,name:'낙수장',path:'fallingwater.html'},
 {id:8,name:'유민미술관',path:'yumin.html'}
]);
export function mountSamples(current,onCurrent,onStudyReturn){
 if(onStudyReturn)mountStudyReturn(current,onStudyReturn);
 const host=document.querySelector('[data-sample-navigation]');if(!host)return;
 host.setAttribute('aria-label','교육용 샘플 선택');
 host.innerHTML='<div class="sample-links">'+samples.map(s=>'<a href="'+new URL(s.path+'#home',import.meta.url).href+'" data-sample="'+s.id+'" '+(s.id===current?'aria-current="page"':'')+'>샘플 '+s.id+' · '+s.name+'</a>').join('')+'</div><label class="sample-select"><select aria-label="교육용 샘플">'+samples.map(s=>'<option value="'+s.id+'" '+(s.id===current?'selected':'')+'>샘플 '+s.id+' · '+s.name+'</option>').join('')+'</select></label>';
 const navigate=id=>{if(id===current)return onCurrent();const sample=samples.find(s=>s.id===id);if(sample)location.assign(new URL(sample.path+'#home',import.meta.url));};
 host.onclick=e=>{const a=e.target.closest('[data-sample]');if(a&&Number(a.dataset.sample)===current){e.preventDefault();onCurrent();}};
 host.querySelector('select').onchange=e=>navigate(Number(e.target.value));
}
