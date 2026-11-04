import {apartment,apartmentSlab} from './apartment-project.mjs';
import {electricalLesson,structuralLesson} from './calculation-lessons.mjs';
import {slabCalculation} from './learning-engine.mjs';

export function apartmentLesson(electric,state){
 if(state.mode==='electrical')return electricalLesson(electric,state.circuit,apartment);
 const base=apartmentSlab(),trial=state.mode==='trial'?slabCalculation({...base,live:state.live}):null;
 const lesson=structuralLesson({floor:base,conditions:{steelDesign:400/1.15}},'floor',trial);
 return {...lesson,id:'apartment-floor',title:'세대 바닥판 · 1 m 폭'+(trial?' · 하중 비교 실험':''),
  target:{element:'apartment-floor',sheet:'S-201',drawing:'A-202'},
  where:'침실의 짧은 방향 2.6 m를 대표 경간으로 정한 바닥판입니다. 세대 전체 바닥에서 폭 1 m 띠를 떼어 양 끝 지지 보처럼 계산하고, 같은 바닥판의 배근도와 3D를 확인합니다.'};
}
export function restoreApartmentReader(raw){return {
 mode:['electrical','structure','trial'].includes(raw?.mode)?raw.mode:'electrical',
 circuit:apartment.circuits.some(c=>c.id===raw?.circuit)?raw.circuit:'AL',
 step:typeof raw?.step==='string'?raw.step:'power-sum',
 live:Number.isFinite(raw?.live)&&raw.live>=0&&raw.live<=20?raw.live:2,
 view:raw?.view==='all'?'all':'one'
};}
