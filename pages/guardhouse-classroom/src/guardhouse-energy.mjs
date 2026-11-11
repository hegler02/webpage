// The guardhouse envelope for the weather and energy lesson, read from the same model as the drawings.
// Layer thicknesses come from the model; conductivities and the other numbers are teaching values stated on screen.
import {uValue} from './energy-engine.mjs';
import {materialLayers} from './lesson-expansion.mjs';

export const site={label:'서울',north:'도면 위쪽(+y)이 북쪽입니다. 출입구가 남쪽을 봅니다.'};
// ISO 6946 surface resistances (m²K/W) for heat flowing sideways, upward and downward.
const SURFACE={wall:{rsi:.13,rse:.04},roof:{rsi:.10,rse:.04},floor:{rsi:.17,rse:.17}};
const LAMBDA={'material-support':1.0,'material-insulation':.035,'material-concrete':2.3,'material-lining':.25};
const FINISH_LAMBDA={plaster:1.0,brick:.9,stone:2.8};
export const glazings={
 single:{name:'단판 유리 6 mm',u:5.8,g:.80,note:'모델의 유리 두께 그대로입니다.'},
 double:{name:'복층 유리',u:2.8,g:.70,note:'유리 두 장 사이에 공기층을 둔 창입니다.'},
 lowe:{name:'로이 복층 유리',u:1.5,g:.45,note:'얇은 금속막이 열을 되돌려 보내는 창입니다.'}
};
export const heaters={
 heatpump:{name:'히트펌프 냉난방기',cop:3,note:'전기 1 kW로 열 3 kW를 옮깁니다.'},
 resistance:{name:'전기 히터',cop:1,note:'전기 1 kW가 열 1 kW가 됩니다.'}
};
export const freshEnergy=()=>({month:1,day:21,hour:12,glass:'single',insulation:70,heater:'heatpump',pv:3});
export const assumptions=[
 ['실내 온도','난방 20 °C, 냉방 26 °C'],
 ['틈새바람·환기','한 시간에 실내 공기의 절반이 바뀝니다(0.5회/h).'],
 ['근무자','1명이 하루 종일 머물며 70 W의 열을 냅니다.'],
 ['업무 기기','컴퓨터·모니터·소형 가전이 평균 150 W를 씁니다. 콘센트 정격값이 아니라 평소 사용량입니다.'],
 ['조명','바깥 수평면 햇빛이 100 W/m²보다 약하면 모든 조명이 켜집니다.'],
 ['바닥','PIT 쪽 공기는 바깥보다 덜 추워 온도 차의 절반만 적용합니다. 모델에 바닥 단열층이 없습니다.'],
 ['열교·축열','벽이 열을 저장하는 효과와 모서리·창틀의 열교는 뺐습니다. 실제보다 순간 부하가 크게 나옵니다.'],
 ['태양광','지붕에 남향 30° 경사, 시스템 효율 80 %로 둡니다.'],
 ['냉방','냉방기는 전기 1 kW로 열 3 kW를 옮긴다고 봅니다. 습기를 빼는 부하는 계산하지 않습니다.']
];

const facingOf=id=>({south:'S',north:'N',east:'E',west:'W'})[id.split('-')[0]]??'S';
const width=e=>{const xs=e.footprint.map(p=>p[0]),ys=e.footprint.map(p=>p[1]);return Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));};

export function wallLayers(state,finish){
 return [...materialLayers].reverse().map(l=>({id:l.id,name:l.name,thickness:l.id==='material-insulation'?state.insulation:l.thickness,lambda:l.id==='material-finish'?FINISH_LAMBDA[finish]??1:LAMBDA[l.id]}))
  .filter(l=>l.thickness>0);
}
export function roofLayers(model){
 const t=model.design.thickness,v=model.design.levels;
 return [{name:'천장판',thickness:t.ceiling*1000,lambda:.25},{name:'천장 속 공기층',thickness:Math.round((v.insulation-v.ceilingDry)*1000),r:.16},{name:'지붕 하부 단열재',thickness:t.insulation*1000,lambda:.035},{name:'지붕 콘크리트',thickness:t.roofSlab*1000,lambda:2.3},{name:'방수·구배층',thickness:120,lambda:1.0}];
}
export function floorLayers(model){const t=model.design.thickness;return [{name:'바닥 마감',thickness:t.floorFinish*1000,lambda:1.0},{name:'바닥 콘크리트',thickness:t.floorSlab*1000,lambda:2.3}];}

export function guardhouseBuilding(model,project,state,finish='plaster'){
 const d=model.design,dim=model.dimensions,glass=glazings[state.glass],wallH=dim.wallTop;
 const wall=uValue(wallLayers(state,finish),SURFACE.wall),roof=uValue(roofLayers(model),SURFACE.roof),floor=uValue(floorLayers(model),SURFACE.floor);
 // Whole-window sizes come from the window schedule; the model's glass pane tells where each one sits.
 const windows=model.elements.filter(e=>e.kind==='window').map(e=>{const w=width(e),tag=d.windows.find(t=>t.width-w>=0&&t.width-w<.12);return {id:e.id,tag:tag.tag,facing:facingOf(e.id),area:tag.width*tag.height};});
 const door=d.doors.find(t=>t.tag==='D01'),transom=model.elements.find(e=>e.id==='door-transom');
 const surfaces=[];
 for(const w of windows)surfaces.push({id:w.id,kind:'window',name:`${w.tag} 창 (${{S:'남',N:'북',E:'동',W:'서'}[w.facing]})`,facing:w.facing,area:w.area,u:glass.u,g:glass.g});
 surfaces.push({id:'door-transom',kind:'window',name:'출입문 위 채광창 (남)',facing:'S',area:door.width*(door.height-2.1),u:glass.u,g:glass.g});
 surfaces.push({id:'south-opening-0',kind:'door',name:'출입문 (남)',facing:'S',area:door.width*2.1,u:3.0});
 for(const [f,len] of [['S',dim.outerWidth],['N',dim.outerWidth],['E',dim.outerDepth],['W',dim.outerDepth]]){
  const open=surfaces.filter(s=>s.facing===f).reduce((a,s)=>a+s.area,0);
  surfaces.push({id:'wall-'+f,kind:'wall',name:`외벽 (${{S:'남',N:'북',E:'동',W:'서'}[f]})`,facing:f,area:len*wallH-open,u:wall.u});
 }
 const area=dim.outerWidth*dim.outerDepth;
 surfaces.push({id:'roof',kind:'roof',name:'지붕',area,u:roof.u},{id:'floor',kind:'floor',name:'바닥 (PIT 쪽)',area,u:floor.u,b:.5});
 const volume=d.rooms.reduce((a,r)=>a+(r.bounds[2]-r.bounds[0])*(r.bounds[3]-r.bounds[1])*r.ch,0);
 const lights=project.devices.filter(x=>x.kind==='light');
 const roofFree=(d.roof.bounds[2]-d.roof.bounds[0]-1)*(d.roof.bounds[3]-d.roof.bounds[1]-1);
 return {surfaces,layers:{wall,roof,floor},glass,volume,ach:.5,heatSet:20,coolSet:26,glassShare:.8,lightBelow:100,lightWatts:lights.reduce((a,x)=>a+x.watts,0),lights,equipWatts:150,peopleWatts:70,
  heatCop:heaters[state.heater].cop,coolCop:3,pv:{kwp:state.pv,tilt:30,ratio:.8},roofFree,maxPv:Math.floor(roofFree/6*2)/2,
  ac:project.devices.find(x=>x.kind==='ac'),circuits:project.circuits,voltage:project.voltage};
}
