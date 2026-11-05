import {glossary} from './classroom-project.mjs';
import {extraGlossary} from './lesson-expansion.mjs';
import {calculationGlossary} from './calculation-lessons.mjs';
import {apartment} from './apartment-project.mjs';
const targets={
 elevation:['A-204','south-0'],opening:['A-205','south-opening-1'],sleeve:['A-206','partition-bed-head-0'],
 plan:['A-201','floor-finish-living'],section:['A-202','ceiling-living'],partition:['A-201','partition-west-1'],
 slab:['S-201','apartment-floor'],rebar:['S-201','apartment-floor'],cover:['S-201','apartment-floor'],spacing:['S-201','apartment-floor'],
 ceiling:['A-202','ceiling-living'],ffl:['A-202','floor-finish-living'],sfl:['A-202','apartment-floor'],ch:['A-202','ceiling-living'],
 panel:['E-203','ADB'],breaker:['E-203','ADB'],circuit:['E-203','AL01'],ground:['E-203','ADB'],drop:['E-203','ADB'],
 conduit:['E-201','AL01'],load:['E-202','AA01'],bim:['E-201','AL01'],power:['E-201','AL01'],current:['E-203','ADB'],
 voltage:['E-203','ADB'],'power-factor':['E-202','AA01'],resistivity:['E-201','AL01'],ampacity:['E-203','ADB'],
 detector:['F-201','AD1'],'fire-alarm':['F-201','AB1'],extinguisher:['F-201','AX1'],emergency:['F-201','AE1'],
 'dead-load':['S-201','apartment-floor'],'live-load':['S-201','apartment-floor'],'line-load':['S-201','apartment-floor'],
 moment:['S-201','apartment-floor'],support:['S-201','apartment-floor'],'effective-depth':['S-201','apartment-floor'],
 'steel-area':['S-201','apartment-floor'],'design-strength':['S-201','apartment-floor'],deflection:['S-201','apartment-floor'],stiffness:['S-201','apartment-floor'],units:['S-201','apartment-floor']
};
const definitions={
 ffl:'신발이 닿는 마감 바닥입니다. 이 아파트의 마감 바닥은 구조바닥보다 '+apartment.finishLevel*1000+' mm 높습니다.',
 pit:'설비를 점검하기 위해 마련한 바닥 아래 공간입니다. 이 아파트 한 세대 모형에는 PIT가 포함되어 있지 않습니다.',
 wall:'내력벽은 수직하중이나 수평하중을 받는 구조 벽입니다. 이 한 세대 모형은 건물 전체의 내력벽 배치와 하중 전달을 해석하지 않습니다.',
 ceiling:'실내에서 보이는 천장 마감입니다. 이 아파트에서는 천장 위와 윗층 구조 바닥판 사이의 설비 공간을 함께 봅니다.',
 breaker:'과전류가 흐를 때 회로를 끊어 보호하는 장치입니다. 이 세대는 5개 회로의 부하와 차단기 정격을 비교합니다. 누전보호 동작은 별도 원리입니다.'
};
const context={
 'live-load':'아파트 바닥판의 활하중을 바꾸어 휨모멘트와 처짐 변화를 비교합니다.',
 support:'이 세대 바닥판의 대표 1 m 띠는 양 끝 단순지지 모형으로 계산합니다.'
};
const missing={pit:'이 세대에 없는 공간 · 뜻 알아보기',foundation:'건물 전체의 기초는 이 세대 모형에 포함하지 않습니다.',parapet:'옥상 가장자리의 파라펫은 이 세대 모형에 포함하지 않습니다.',wall:'건물 전체의 내력벽 해석은 포함하지 않습니다.',stress:'응력의 일반적인 뜻을 알아봅니다.',reaction:'반력과 축력의 일반적인 뜻을 알아봅니다.',bearing:'지반과 기초는 이 세대 모형에 포함하지 않습니다.'};
const rows=[{id:'opening',term:'창호',plain:'문과 창, 그 틀을 함께 부르는 말',definition:'창호표에서 폭·높이·창대 높이를 읽고 같은 문이나 창을 3D에서 찾습니다.'},{id:'sleeve',term:'설비 관통부',plain:'배관이 벽을 지나갈 수 있도록 계획한 구멍',definition:'이 세대 내벽의 문 위에 80 × 80 mm 관통부를 두었습니다. 중심 높이는 구조 바닥 기준 2,550 mm이며 실제 같은 벽의 3D 구멍과 연결됩니다.'},...glossary,...extraGlossary.filter(t=>['detector','fire-alarm','extinguisher','emergency'].includes(t.id)),...calculationGlossary.filter(t=>!glossary.some(g=>g.id===t.id))];
export const apartmentGlossary=rows.map(t=>({...t,definition:definitions[t.id]??t.definition,electrical:context[t.id]??(missing[t.id]?'':t.electrical),sheet:targets[t.id]?.[0]??null,element:targets[t.id]?.[1]??null,locationNote:missing[t.id]??'',locationLabel:t.id==='section'?'단면도에서 보기':'도면·3D에서 찾기'}));
export const apartmentTermTarget=id=>{const t=apartmentGlossary.find(t=>t.id===id);return t?.sheet&&t.element?{sheet:t.sheet,element:t.element}:null;};
