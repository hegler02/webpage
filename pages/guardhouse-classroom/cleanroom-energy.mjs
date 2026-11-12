// Energy lesson for the cleanroom sample: the bay stands alone in Seoul weather, with lights and fan filter units that never stop.
import {uValue} from './src/energy-engine.mjs';
import {bay,bayModel,bayElectrical,freshBay} from './src/cleanroom-project.mjs';
import {assemblies} from './src/cleanroom-construction.mjs';
import {createEnergyPanel,glazings,yearOf,used,factList,checkList,envelopeTable,monthlySpec,topShare,durationSpec,weatherSections,n} from './energy-panel.mjs';

export const freshEnergy=()=>({glass:'double',ach:3,recovery:0,pv:0});
const SERIES=[['heatElec','난방','slot2'],['coolElec','냉방','slot1'],['light','조명','slot4'],['equip','팬','slot3']];
const DOOR_U=2,PEOPLE=1,GROUND=.5,MAX_PV=5,HEAT_COP=3.2,COOL_COP=3.5;
// Conductivity of each layer in the materials screen, in the order the screen lists them.
const LAMBDA={wall:[50,.038,50],floor:[.25,.17,2.3]};
const layers=k=>assemblies[k].layers.map(([name,thickness],i)=>({name,thickness,lambda:LAMBDA[k][i]}));

export function room(state){
 const glass=glazings[state.glass],model=bayModel(freshBay()),area=bay.width*bay.depth,volume=area*bay.ceiling;
 const opening=id=>{const o=model.openings.find(x=>x.id===id),e=model.elements.find(x=>x.id===id);return (o.end-o.start)*e.height;};
 const door=opening('west-door'),window=opening('east-glass'),panel=uValue(layers('wall'),{rsi:.13,rse:.04}),floor=uValue(layers('floor'),{rsi:.17,rse:0});
 const circuits=bayElectrical(freshBay()).circuits,watts=Object.fromEntries(circuits.map(c=>[c.id,c.watts]));
 const surfaces=[{name:'벽 패널 네 면',area:(bay.width+bay.depth)*2*bay.ceiling-door-window,u:panel.u},{name:'동쪽 관찰창',area:window,u:glass.u,g:glass.g,facing:'E'},{name:'외부 출입문',area:door,u:DOOR_U},
  {name:'지붕 패널',area,u:panel.u},{name:'바닥',area,u:floor.u,b:GROUND}];
 return {surfaces,area,volume,ach:state.ach*(1-state.recovery/100),fresh:state.ach,recovery:state.recovery/100,heatSet:22,coolSet:24,glassShare:.8,lightBelow:Infinity,lightWatts:watts.CL,equipWatts:watts.CF,peopleWatts:PEOPLE*75,
  heatCop:HEAT_COP,coolCop:COOL_COP,pv:{kwp:state.pv,tilt:30,ratio:.8},connected:watts.CL+watts.CF};
}

export function createCleanroomEnergy({read,write}){
 const facts=({b,r})=>{const total=used(r.year,SERIES);
  return factList([['1년 전기',n(total)+' kWh'],['바닥 1 m²마다',n(total/b.area)+' kWh'],['가장 큰 전력',n(r.peak.elec/1000,2)+' kW'],['태양광이 채우는 몫',n(r.year.pv/total*100)+' %']]);};
 const electric=({b,r,d})=>{const heat=d.heat/b.heatCop,cool=r.peak.cool/b.coolCop,steady=r.year.light+r.year.equip;
  return checkList([['난방 설계',`바깥 ${n(d.heatOut,1)} °C에서 ${n(d.heat/1000,2)} kW의 열이 필요하고, 히트펌프는 전기 ${n(heat/1000,2)} kW를 씁니다.`],
   ['냉방 설계',`가장 더운 시간에 ${n(r.peak.cool/1000,2)} kW의 열을 빼야 하고, 냉방에 전기 ${n(cool/1000,2)} kW를 씁니다.`],
   ['쉬지 않는 부하',`조명 ${n(b.lightWatts)} W와 팬 ${n(b.equipWatts)} W는 1년 내내 켜져 있어 ${n(steady)} kWh를 씁니다.`],
   ['회로표와 견주기',`분전반의 CL·CF 회로는 조명과 팬 ${n(b.connected)} W만 맡습니다. 냉난방 전기 ${n(Math.max(heat,cool)/1000,2)} kW는 공조 전원을 따로 받아야 합니다.`]])+
   '<div class="button-row"><button type="button" data-go="electrical">분기 회로 보기</button><button type="button" data-go="materials">벽 패널 구성 보기</button></div>';};
 return createEnergyPanel({read,write,fresh:freshEnergy,card:'bay-card',compute:yearOf(room),
  controls:[{k:'glass',label:'관찰창 유리',options:Object.entries(glazings).map(([k,g])=>[k,g.name])},{k:'ach',label:'1시간 환기 횟수',min:1,max:10,step:1,unit:v=>v+'회'},{k:'recovery',label:'환기 열회수',min:0,max:80,step:10,unit:v=>v+' %'},{k:'pv',label:'지붕 태양광',min:0,max:MAX_PV,step:1,unit:v=>v+' kW'}],
  sections:[{title:'이 클린룸을 서울에 놓으면',lead:'클린룸 한 칸을 서울의 8,760시간 날씨에 놓고 한 해의 전기를 계산합니다.',controls:true,part:'facts'},
   {title:'열은 어디로 빠져나가나',lead:'안팎 온도가 1 °C 다를 때 빠지는 열(W/K)입니다.',part:'envelope'},
   ...weatherSections('서울',false),
   {title:'1년 전기 사용',chart:'monthly'},
   {title:'부하 지속 곡선',lead:'1년 8,760시간의 전력을 큰 것부터 늘어놓았습니다.',chart:'duration'},
   {title:'전기설계로 이어 보기',part:'electric'}],
  parts:{facts,envelope:envelopeTable,electric},
  charts:{monthly:({r})=>monthlySpec(r.months,SERIES,topShare(r.year,SERIES),r.year.pv>0?{y:'pv',label:'태양광 발전',color:'var(--mc-s7)'}:null),
   duration:({b,r})=>durationSpec(r.hourly,[{value:b.connected/1000,label:'회로표의 조명·팬 부하'}])},
  basis:{note:'시간마다 열이 드나드는 양만 따지는 학습용 추정입니다.',rows:({b})=>[
   ['범위',`클린룸 한 칸 ${bay.width} × ${bay.depth} m, 천장 높이 ${bay.ceiling} m가 바깥에 홀로 서 있다고 봅니다. 바닥은 땅에 닿아 열이 절반만 빠집니다.`],
   ['벽과 창',`벽과 지붕은 재료 화면의 패널 구성 그대로이고 단열 심재의 열전도율은 ${LAMBDA.wall[1]} W/mK입니다. 관찰창은 틀을 빼고 80 %가 햇빛을 받으며, 출입문은 U ${DOOR_U} W/m²K입니다.`],
   ['실내',`난방 22 °C, 냉방 24 °C. 조명과 팬 필터 유닛은 회로표의 전력으로 1년 내내 켜 두고, ${PEOPLE}명이 일합니다.`],
   ['설비',`난방 히트펌프 효율 ${HEAT_COP}, 냉방 효율 ${COOL_COP}. 열회수는 나가는 공기의 열을 그 비율만큼 되찾습니다. 태양광은 지붕 넓이에 맞춰 최대 ${MAX_PV} kW입니다.`]]}});
}
