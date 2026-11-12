// Energy lesson for the apartment sample: the unit is set in Seoul weather and run through the same hourly heat balance as the guardhouse.
import {uValue} from './src/energy-engine.mjs';
import {apartmentModel,apartmentElectrical,apartmentArea,freshApartment} from './src/apartment-project.mjs';
import {apartmentAssemblies} from './src/apartment-materials.mjs';
import {createEnergyPanel,glazings,yearOf,used,factList,checkList,envelopeTable,monthlySpec,topShare,durationSpec,weatherSections,n} from './energy-panel.mjs';

export const heaters={boiler:{name:'가스 보일러',cop:Infinity},heatpump:{name:'히트펌프',cop:3}};
export const freshEnergy=()=>({glass:'double',wool:100,ach:.5,heater:'boiler'});
const SERIES=[['heatElec','난방','slot2'],['coolElec','냉방','slot1'],['light','조명','slot4'],['equip','가전','slot3']];
const HEIGHT=2.7,WIDTH=8.4,DEPTH=7.3,DOOR_U=2,BOILER=.9,PEOPLE=2,LIGHT_USE=.4,LAMBDA={wallpaper:.2,rc:2.3,wool:.04,render:1};
// Share of each circuit's connected load that runs through the day.
const USE={AR:.05,AK:.05,AF:.35};
const FACES=[['south','남쪽','S'],['north','북쪽','N'],['east','동쪽','E']];

// A mid-floor unit: the floor and ceiling meet heated neighbours, so heat leaves through the four walls, the windows, the door and the ventilation air.
export function unit(state){
 const glass=glazings[state.glass],heater=heaters[state.heater],area=apartmentArea(),volume=area*HEIGHT;
 const wall=uValue(apartmentAssemblies[0].layers.map(l=>({name:l.name,thickness:l.id==='wool'?state.wool:l.mm,lambda:LAMBDA[l.id]})),{rsi:.13,rse:.04});
 const openings=apartmentModel(freshApartment()).openings.filter(o=>FACES.some(([id])=>o.id.startsWith(id))).map(o=>({...o,area:(o.end-o.start)*o.height}));
 const door=openings.filter(o=>o.sill===0),windows=openings.filter(o=>o.sill>0),sum=list=>list.reduce((a,o)=>a+o.area,0);
 const circuits=apartmentElectrical(freshApartment()).circuits,watts=Object.fromEntries(circuits.map(c=>[c.id,c.watts]));
 const surfaces=[{name:'외벽 네 면',area:(WIDTH+DEPTH)*2*HEIGHT-sum(openings),u:wall.u},
  ...FACES.map(([id,name,facing])=>({name:name+' 창',area:sum(windows.filter(o=>o.id.startsWith(id))),u:glass.u,g:glass.g,facing})),
  {name:'출입문',area:sum(door),u:DOOR_U}];
 return {surfaces,area,volume,ach:state.ach,heatSet:20,coolSet:26,glassShare:.7,lightBelow:120,lightWatts:watts.AL*LIGHT_USE,equipWatts:Object.entries(USE).reduce((a,[id,share])=>a+watts[id]*share,0),peopleWatts:PEOPLE*75,
  heatCop:heater.cop,coolCop:3.5,pv:{kwp:0,tilt:30,ratio:.8},wall,cooler:circuits.find(c=>c.id==='AA'),connected:circuits.reduce((a,c)=>a+c.watts,0)};
}

export function createApartmentEnergy({read,write}){
 const boiler=b=>b.heatCop===Infinity;
 const facts=({b,r})=>factList([['1년 전기',n(used(r.year,SERIES))+' kWh'],[boiler(b)?'1년 난방 가스':'1년 난방 열',n(boiler(b)?r.year.heat/BOILER:r.year.heat)+' kWh'],['바닥 1 m²마다 난방',n(r.year.heat/b.area)+' kWh'],['가장 큰 전력',n(r.peak.elec/1000,2)+' kW']]);
 const electric=({b,r,d})=>{const cool=r.peak.cool/b.coolCop,fits=cool<=b.cooler.watts,heat=d.heat/b.heatCop;
  return checkList([['난방 설계',`바깥 ${n(d.heatOut,1)} °C에서 ${n(d.heat/1000,2)} kW의 열이 필요합니다. ${boiler(b)?'가스 보일러가 맡아서 전기 회로에는 걸리지 않습니다.':`히트펌프는 전기 ${n(heat/1000,2)} kW를 쓰므로 전용 회로를 따로 둡니다.`}`],
   ['냉방 설계',`가장 더운 시간에 ${n(r.peak.cool/1000,2)} kW의 열을 빼야 하고, 냉방기는 전기 ${n(cool/1000,2)} kW를 씁니다.`],
   ['회로표와 견주기',`${b.cooler.id} ${b.cooler.name} 회로의 부하는 ${n(b.cooler.watts)} W입니다. 계산한 냉방 전력 ${n(cool)} W는 ${fits?'그 안에 들어갑니다':'그보다 큽니다. 냉방기를 나누거나 회로를 다시 잡아야 합니다'}.`,fits]])+
   '<div class="button-row"><button type="button" data-page="electrical">분기 회로 보기</button><button type="button" data-page="materials">외벽 구성 보기</button></div>';};
 return createEnergyPanel({read,write,fresh:freshEnergy,compute:yearOf(unit),
  controls:[{k:'glass',label:'유리',options:Object.entries(glazings).map(([k,g])=>[k,g.name])},{k:'wool',label:'외벽 단열 두께',min:0,max:200,step:10,unit:v=>v+' mm'},{k:'ach',label:'1시간 환기 횟수',min:.3,max:2,step:.1,unit:v=>n(v,1)+'회'},{k:'heater',label:'난방',options:Object.entries(heaters).map(([k,h])=>[k,h.name])}],
  sections:[{title:'이 집을 서울에 놓으면',lead:'가운데 층 한 세대를 서울의 8,760시간 날씨에 놓고 한 해의 난방과 전기를 계산합니다.',controls:true,part:'facts'},
   {title:'열은 어디로 빠져나가나',lead:'안팎 온도가 1 °C 다를 때 빠지는 열(W/K)입니다.',part:'envelope'},
   ...weatherSections('서울',false),
   {title:'1년 전기 사용',chart:'monthly'},
   {title:'부하 지속 곡선',lead:'1년 8,760시간의 전력을 큰 것부터 늘어놓았습니다.',chart:'duration'},
   {title:'전기설계로 이어 보기',part:'electric'}],
  parts:{facts,envelope:envelopeTable,electric},
  charts:{monthly:({b,r})=>monthlySpec(r.months,SERIES,topShare(r.year,SERIES)+(boiler(b)?' 난방은 가스로 해서 이 그래프에 없습니다.':'')),
   duration:({b,r})=>durationSpec(r.hourly,[{value:b.connected/1000,label:'회로표의 세대 부하'}])},
  basis:{note:'시간마다 열이 드나드는 양만 따지는 학습용 추정입니다.',rows:({b})=>[
   ['범위',`가운데 층 한 세대, 바닥 ${n(b.area,1)} m², 천장 높이 ${HEIGHT} m. 위아래 세대도 난방을 해서 바닥과 천장으로는 열이 드나들지 않는다고 봅니다.`],
   ['벽과 창',`외벽은 재료 화면의 구성 그대로이고 단열 두께만 바꿉니다. 창은 틀과 그늘을 빼고 70 %가 햇빛을 받으며, 출입문은 U ${DOOR_U} W/m²K입니다.`],
   ['실내',`난방 20 °C, 냉방 26 °C. 조명은 바깥이 어두울 때 ${LIGHT_USE*100} %를 켜고, 콘센트와 주방은 ${USE.AR*100} %, 냉장고는 ${USE.AF*100} %를 계속 쓰며, ${PEOPLE}명이 삽니다.`],
   ['설비',`가스 보일러 효율 ${BOILER}, 히트펌프 효율 ${heaters.heatpump.cop}, 냉방기 효율 3.5.`]]}});
}
