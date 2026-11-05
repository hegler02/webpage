import {bayLesson,restoreBayReading} from './src/cleanroom-lessons.mjs';
import {freshBay} from './src/cleanroom-project.mjs';
import {lessonHTML,formulaHTML} from './calculation-guide.mjs';
export const restoreBayReader=restoreBayReading;
export function lessonSteps(branch,live,mode){
  const state=freshBay({live,watts:Object.fromEntries(branch.loads.map(d=>[d.id,d.watts]))});
  return bayLesson(state,mode,branch.loads[0].id).steps.map(s=>Object.assign([s.title,s.why,s.equation,s.value,s.theory],{id:s.id}));
}
export function bayCalculationHTML(state,mode,device,index,view){
  const lesson=bayLesson(state,mode,device),step=lesson.steps[Math.max(0,Math.min(index,lesson.steps.length-1))];
  let html=lessonHTML(lesson,{step:step.id});
  if(view==='all')html=html.slice(0,html.indexOf('<div class="calc-reading">'))+lesson.steps.map(s=>formulaHTML(s)).join('')+'</section>';
  return {lesson,html:'<div class="calc-guide"><div class="report-actions"><button data-reading="'+(view==='all'?'one':'all')+'">'+(view==='all'?'한 공식씩 읽기':'전체 공식 보기')+'</button><button data-save-calculation>현재 계산 데이터 저장</button></div>'+html+'</div>'};
}
