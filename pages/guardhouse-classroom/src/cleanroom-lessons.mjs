import {bayElectrical,panel,equipment,freshBay} from './cleanroom-project.mjs';
import {baySlab} from './cleanroom-construction.mjs';
import {electricalLesson,structuralLesson,calculationGlossary} from './calculation-lessons.mjs';

export function bayLesson(state,mode='electric',device='FFU1'){
  if(mode==='slab'){
    const lesson=structuralLesson({floor:baySlab(state.live),conditions:{steelDesign:400/1.15}},'floor');
    return {...lesson,id:'cleanroom-slab',title:'작업구역 바닥판 · 대표 1 m 띠',target:{element:'slab',sheet:'S-301',drawing:'A-302'},where:'작업구역의 폭 1 m, 길이 2.4 m인 바닥 띠입니다. 배근도에 표시한 구간과 3D 하부 철근이 같은 계산 대상입니다. 하중을 바꾸면 아래 모든 공식이 함께 바뀝니다.'};
  }
  const source=bayElectrical(state),c=source.circuits.find(c=>c.id===equipment.find(d=>d.id===device)?.circuit)??source.circuits[0];
  const electric={...source,devices:[panel,...source.devices],circuits:source.circuits.map(c=>({...c,loads:c.loads.map(d=>d.id)}))};
  const lesson=electricalLesson(electric,c.id,{voltage:220,frequency:60,lightingCircuit:'CL',lightingSheet:'E-301',powerSheet:'E-301',circuitSheet:'E-302'});
  lesson.where=lesson.where.replace('회로 전체의 경로를 함께 표시합니다.','선택한 기구까지의 배관 경로를 함께 표시합니다.');
  lesson.steps=lesson.steps.map(s=>s.id==='current'?{...s,unitNote:'W / V = A. 팬 필터 유닛의 W는 전기 입력전력이며 풍량이나 냉방 능력이 아닙니다.'}:s);
  return lesson;
}
export const bayCalculationTerms=calculationGlossary.filter(t=>!['bearing','reaction'].includes(t.id)).map(t=>{
  const structural=['dead-load','live-load','line-load','moment','support','effective-depth','steel-area','design-strength','stress','deflection','stiffness','units'].includes(t.id);
  return {...t,definition:t.id==='steel-area'?t.definition.replace('D10','D13').replace('10 mm','13 mm'):t.definition,electrical:structural?'이 작업구역의 대표 바닥 띠와 같은 하중·철근 값을 연결합니다.':'DB3 분전반의 조명 CL과 팬 CF 회로에 연결합니다.',target:{menu:structural?'structure':'electrical',id:structural?'slab':t.id==='power-factor'?'FFU1':'DB3',sheet:structural?'S-301':'E-302'}};
});
export function restoreBayReading(raw){
  const mode=raw?.mode==='slab'?'slab':'electric',device=equipment.find(d=>d.id===raw?.device)?.id??'FFU1';
  const migrated={power:'power-sum','line-load':'design-load',steel:'provided-steel'}[raw?.step]??raw?.step;
  const steps=bayLesson(freshBay(),mode,device).steps;
  return {mode,device,index:Math.max(0,steps.findIndex(s=>s.id===migrated)),view:raw?.view==='all'?'all':'one'};
}
