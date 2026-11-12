// Energy lesson for the Salk sample: one lab floor is set in Seoul weather and run through the same hourly heat balance as the guardhouse.
import {uValue} from './src/energy-engine.mjs';
import {L,W} from './src/salk-model.mjs';
import {moduleBay,freshSalk,salkElectrical,blockLoad} from './src/salk-project.mjs';
import {createEnergyPanel,yearOf,used,factList,checkList,envelopeTable,uFormulas,monthlySpec,topShare,durationSpec,pvOverlay,pvFacts,heaterControl,heaterOf,clockSection,weatherSections,whenText,n} from './energy-panel.mjs';

export const glazings={single:{name:'홑유리 6 mm · 1965년 그대로',u:5.7,g:.82},double:{name:'로이 복층유리',u:1.8,g:.45},triple:{name:'로이 삼중유리',u:1,g:.35}};
export const freshEnergy=()=>({glass:'single',ach:6,recovery:0,heater:'heatpump',pv:0});
// Electricity by use, each with its fixed chart slot; solar is drawn as a line in slot 7.
const SERIES=[['heatElec','난방','slot2'],['coolElec','냉방','slot1'],['light','조명','slot4'],['equip','실험 기기와 팬','slot3']];
const HEAT_COP=3.2,COOL_COP=3.5,GLASS_H=3.2,SUNLIT=.7,SOCKET_USE=.4,PEOPLE=2,WALL=300,ROOF_SHARE=1/moduleBay.floors;
// This floor's third of the roof; one kW takes about 6 m².
const MAX_PV=Math.floor(L*W*ROOF_SHARE/6/5)*5;

// One lab floor between two service floors: heat leaves through the two glass walls, the two end walls and the ventilation air.
export function labFloor(state){
 const glass=glazings[state.glass],area=L*W,volume=area*moduleBay.ceiling,wall=uValue([{name:'노출 콘크리트',thickness:WALL,lambda:2.3}],{rsi:.13,rse:.04});
 const electric=salkElectrical(freshSalk()),watts=Object.fromEntries(electric.circuits.map(c=>[c.id,c.watts])),bays=moduleBay.count,recovery=state.recovery/100,heater=heaterOf(state,HEAT_COP);
 const surfaces=[{name:'남쪽 유리벽',area:L*GLASS_H,u:glass.u,g:glass.g,facing:'S'},{name:'북쪽 유리벽',area:L*GLASS_H,u:glass.u,g:glass.g,facing:'N'},{name:'끝벽 두 면',area:W*moduleBay.ceiling*2,u:wall.u}];
 return {surfaces,area,volume,ach:state.ach*(1-recovery),fresh:state.ach,recovery,heatSet:20,coolSet:26,glassShare:SUNLIT,lightBelow:250,lightWatts:watts.L1*bays,equipWatts:(watts.P1*SOCKET_USE+watts.F1+watts.M1)*bays,peopleWatts:PEOPLE*75*bays,
  heatCop:heater.cop,coolCop:COOL_COP,pv:{kwp:state.pv,tilt:30,ratio:.8},heater,wall,connected:blockLoad(electric).floor};
}

export function createSalkEnergy({read,write,viewer}){
 const facts=({b,r})=>{const total=used(r.year,SERIES);return factList([['1년 전기',n(total/1000,1)+' MWh'],['바닥 1 m²마다',n(total/b.area)+' kWh'],['가장 큰 전력',n(r.peak.elec/1000,1)+' kW'],['태양광이 채우는 몫',n(r.year.pv/total*100,1)+' %']]);};
 const envelope=y=>envelopeTable(y)+uFormulas([['끝벽',y.b.wall,{rsi:.13,rse:.04}]],'표의 U에 넓이를 곱하면 W/K가 됩니다.');
 const yearly=({b,r})=>pvFacts(r,used(r.year,SERIES))+`<p class="small">${b.heater.note} 지붕 ${n(L*W)} m²의 3분의 1을 이 층 몫으로 잡고 1 kW당 약 6 m²로 최대 ${MAX_PV} kW까지 놓습니다.</p>`;
 const electric=({b,r,d})=>{const heat=d.heat/b.heatCop,cool=r.peak.cool/b.coolCop,fits=r.peak.elec<=b.connected;
  return checkList([['난방 설계',`바깥 ${n(d.heatOut,1)} °C에서 ${n(d.heat/1000,1)} kW의 열이 필요하고, ${b.heater.name}는 전기 ${n(heat/1000,1)} kW를 씁니다.`],
   ['냉방 설계',`가장 더운 시간(${whenText(r.peakAt.cool)})에 ${n(r.peak.cool/1000,1)} kW의 열을 빼야 하고, 냉동기는 전기 ${n(cool/1000,1)} kW를 씁니다.`],
   ['회로표와 견주기',`분기 회로표의 한 층 부하는 ${n(b.connected/1000,1)} kW입니다. 냉난방을 더한 가장 큰 전력은 ${n(r.peak.elec/1000,1)} kW로 ${fits?'그 안에 들어갑니다':'그보다 큽니다. 냉난방 전원은 따로 받아야 합니다'}.`,fits],
   ['최대 전력',`1년 중 전기를 가장 많이 쓰는 시간은 ${whenText(r.peakAt.elec)}, ${n(r.peak.elec/1000,1)} kW입니다.`]])+
   '<div class="button-row"><button type="button" data-go="electrical">분기 회로표 보기</button><button type="button" data-term="ventilation-load">환기 부하</button><button type="button" data-term="u-value">열관류율</button></div>';};
 return createEnergyPanel({read,write,viewer,fresh:freshEnergy,card:'bay-card',compute:yearOf(labFloor),
  clock:{label:'서울',north:'긴 유리벽이 남쪽과 북쪽을 봅니다. 도면 위쪽(+y)이 북쪽입니다.',materials:'표면 열저항은 ISO 6946, 열전도율은 ISO 10456 계열의 대표값입니다. 노출 콘크리트 2.3 W/mK. 유리의 U와 일사 투과율은 유리 종류별 대표값입니다.'},
  controls:[{k:'glass',label:'유리',options:Object.entries(glazings).map(([k,g])=>[k,g.name])},{k:'ach',label:'1시간 환기 횟수',min:2,max:12,step:1,unit:v=>v+'회'},{k:'recovery',label:'환기 열회수',min:0,max:80,step:10,unit:v=>v+' %'},
   heaterControl,{k:'pv',label:'지붕 태양광',min:0,max:MAX_PV,step:5,unit:v=>v+' kW'}],
  sections:[clockSection('서울'),
   {title:'실험실 한 층을 서울에 놓으면',lead:'라호이아의 유리벽 실험실을 서울의 8,760시간 날씨에 놓고 한 해의 전기를 계산합니다.',controls:['glass','ach','recovery'],part:'facts'},
   {title:'열은 어디로 빠져나가나',lead:'안팎 온도가 1 °C 다를 때 빠지는 열(W/K)입니다.',part:'envelope',wide:true},
   ...weatherSections('서울'),
   {title:'1년 전기 사용과 지붕 태양광',lead:'서울의 8,760시간 날씨로 시간마다 난방·냉방에 필요한 열을 구하고 전기로 바꿨습니다.',controls:['heater','pv'],part:'yearly',chart:'monthly',wide:true},
   {title:'부하 지속 곡선',lead:'1년 8,760시간의 전력을 큰 것부터 늘어놓았습니다.',chart:'duration',wide:true},
   {title:'전기설계로 이어 보기',part:'electric',wide:true}],
  parts:{facts,envelope,yearly,electric},
  charts:{monthly:({r})=>monthlySpec(r.months,SERIES,topShare(r.year,SERIES),pvOverlay(r.year)),
   duration:({b,r})=>durationSpec(r.hourly,[{value:b.connected/1000,label:'회로표의 한 층 부하'}])},
  basis:{note:'시간마다 열이 드나드는 양만 따지는 학습용 추정이며, 재구성한 모델의 값입니다.',rows:({b})=>[
   ['범위',`실험실 한 층 ${n(L,2)} × ${n(W,2)} m, 바닥 ${n(b.area)} m², 천장 높이 ${n(moduleBay.ceiling,2)} m. 위아래는 설비층이라 열이 드나들지 않는다고 봅니다.`],
   ['유리와 벽',`유리 높이 ${GLASS_H} m, 창틀과 처마 그늘을 빼고 ${SUNLIT*100} %가 햇빛을 받습니다. 끝벽은 노출 콘크리트 ${WALL} mm입니다.`],
   ['실내',`난방 20 °C, 냉방 26 °C. 조명은 바깥이 어두울 때 켜고, 콘센트는 동시에 ${SOCKET_USE*100} %를 쓰며, 팬은 계속 돕니다. 한 칸에 ${PEOPLE}명이 있습니다.`],
   ['설비',`난방 히트펌프 효율 ${HEAT_COP}, 냉동기 효율 ${COOL_COP}. 전기 히터를 고르면 난방 효율은 1입니다. 열회수는 나가는 공기의 열을 그 비율만큼 되찾습니다.`],
   ['태양광',`지붕에 남향 30° 경사, 시스템 효율 80 %로 둡니다. 지붕의 3분의 1을 이 층 몫으로 잡아 최대 ${MAX_PV} kW입니다.`]]}});
}
