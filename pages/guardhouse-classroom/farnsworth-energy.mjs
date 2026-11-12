// Energy lesson for the Farnsworth sample: a house walled in single glass, lifted off the ground, set in Seoul weather.
import {uValue} from './src/energy-engine.mjs';
import {interior,farnsworthElectrical,houseLoad} from './src/farnsworth-project.mjs';
import {CLEAR} from './src/farnsworth-model.mjs';
import {createEnergyPanel,glazings,yearOf,used,factList,checkList,envelopeTable,uFormulas,monthlySpec,topShare,durationSpec,pvOverlay,pvFacts,heaterControl,heaterOf,clockSection,weatherSections,whenText,n} from './energy-panel.mjs';

export const freshEnergy=()=>({glass:'single',wool:50,ach:.5,heat:20,heater:'heatpump',pv:0});
const SERIES=[['heatElec','난방','slot2'],['coolElec','냉방','slot1'],['light','조명','slot4'],['equip','가전','slot3']];
const HEAT_COP=3,COOL_COP=3.5,PEOPLE=2,LIGHT_USE=.5,SUNLIT=.85,LAMBDA={roofing:.2,wool:.04,concrete:2.3,stone:2.3};
// Share of each circuit's connected load that runs through the day.
const USE={P1:.1,K1:.05};
// Panels lie on the flat roof over the room; one kW takes about 6 m².
const MAX_PV=Math.floor(interior.area/6);
const FACES=[['남쪽','S','x'],['북쪽','N','x'],['동쪽','E','y'],['서쪽','W','y']];

// The whole glass box: four glass walls, a roof and a floor that both meet outside air because the house stands 1.6 m off the ground.
export function house(state){
 const glass=glazings[state.glass],span={x:interior.x1-interior.x0,y:interior.y1-interior.y0},area=interior.area,volume=area*CLEAR;
 const roof=uValue([{name:'방수층',thickness:40,lambda:LAMBDA.roofing},{name:'단열재',thickness:state.wool,lambda:LAMBDA.wool},{name:'콘크리트 지붕판',thickness:190,lambda:LAMBDA.concrete}],{rsi:.1,rse:.04});
 const floor=uValue([{name:'트래버틴',thickness:45,lambda:LAMBDA.stone},{name:'콘크리트 바닥판',thickness:255,lambda:LAMBDA.concrete},{name:'단열재',thickness:state.wool,lambda:LAMBDA.wool}],{rsi:.17,rse:.04});
 const circuits=farnsworthElectrical().circuits,watts=Object.fromEntries(circuits.map(c=>[c.id,c.watts])),heater=heaterOf(state,HEAT_COP);
 const surfaces=[...FACES.map(([name,facing,axis])=>({name:name+' 유리벽',area:span[axis]*CLEAR,u:glass.u,g:glass.g,facing})),
  {name:'지붕',area,u:roof.u},{name:'띄운 바닥',area,u:floor.u}];
 return {surfaces,area,volume,ach:state.ach,heatSet:state.heat,coolSet:26,glassShare:SUNLIT,lightBelow:120,lightWatts:watts.L1*LIGHT_USE,equipWatts:Object.entries(USE).reduce((a,[id,share])=>a+watts[id]*share,0),peopleWatts:PEOPLE*75,
  heatCop:heater.cop,coolCop:COOL_COP,pv:{kwp:state.pv,tilt:30,ratio:.8},heater,roof,floor,pump:circuits.find(c=>c.id==='H1'),connected:houseLoad({circuits})};
}

export function createFarnsworthEnergy({read,write,viewer}){
 const glassLoss=b=>b.surfaces.filter(s=>s.g).reduce((a,s)=>a+s.area*s.u,0);
 const facts=({b,r})=>factList([['1년 전기',n(used(r.year,SERIES))+' kWh'],['1년 난방 열',n(r.year.heat)+' kWh'],['바닥 1 m²마다 난방',n(r.year.heat/b.area)+' kWh'],['유리로 빠지는 열',n(glassLoss(b)/r.Htot*100)+' %']]);
 const electric=({b,r,d})=>{const heat=d.heat/b.heatCop,cool=r.peak.cool/b.coolCop,fits=Math.max(heat,cool)<=b.pump.watts;
  return checkList([['난방 설계',`바깥 ${n(d.heatOut,1)} °C에서 ${n(d.heat/1000,1)} kW의 열이 필요하고, ${b.heater.name}는 전기 ${n(heat/1000,1)} kW를 씁니다.`],
   ['냉방 설계',`가장 더운 시간(${whenText(r.peakAt.cool)})에 ${n(r.peak.cool/1000,1)} kW의 열을 빼야 하고, ${b.heater.cop===1?'에어컨은':'히트펌프는'} 전기 ${n(cool/1000,1)} kW를 씁니다.`],
   ['회로표와 견주기',`${b.pump.id} ${b.pump.name} 회로의 부하는 ${n(b.pump.watts)} W입니다. 계산한 전력 ${n(Math.max(heat,cool))} W는 ${fits?'그 안에 들어갑니다':'그보다 큽니다. 유리를 바꾸거나 히트펌프와 회로를 키워야 합니다'}.`,fits],
   ['최대 전력',`1년 중 전기를 가장 많이 쓰는 시간은 ${whenText(r.peakAt.elec)}, ${n(r.peak.elec/1000,2)} kW입니다.`]])+
   '<div class="button-row"><button type="button" data-go="electrical">분기 회로표 보기</button><button type="button" data-term="plate-glass">홑판유리</button><button type="button" data-term="u-value">열관류율</button></div>';};
 const envelope=y=>envelopeTable(y)+uFormulas([['지붕',y.b.roof,{rsi:.1,rse:.04}],['띄운 바닥',y.b.floor,{rsi:.17,rse:.04}]],'표의 U에 넓이를 곱하면 W/K가 됩니다.');
 const yearly=({b,r})=>pvFacts(r,used(r.year,SERIES))+`<p class="small">${b.heater.note} 지붕 ${n(b.area,1)} m²에 1 kW당 약 6 m²로 최대 ${MAX_PV} kW까지 놓습니다.</p>`;
 return createEnergyPanel({read,write,viewer,fresh:freshEnergy,card:'bay-card',compute:yearOf(house),
  clock:{label:'서울',north:'긴 유리벽이 남쪽 강과 북쪽 풀밭을 봅니다. 도면 위쪽(+y)이 북쪽입니다.',materials:'표면 열저항은 ISO 6946, 열전도율은 ISO 10456 계열의 대표값입니다. 콘크리트와 트래버틴 2.3, 단열재 0.04, 방수층 0.2 W/mK. 유리의 U와 일사 투과율은 유리 종류별 대표값입니다.'},
  controls:[{k:'glass',label:'유리',options:Object.entries(glazings).map(([k,g])=>[k,g.name])},{k:'wool',label:'지붕과 바닥 단열 두께',min:0,max:200,step:10,unit:v=>v+' mm'},{k:'ach',label:'1시간 환기 횟수',min:.3,max:2,step:.1,unit:v=>n(v,1)+'회'},{k:'heat',label:'난방 온도',min:16,max:24,step:1,unit:v=>v+' °C'},
   heaterControl,{k:'pv',label:'지붕 태양광',min:0,max:MAX_PV,step:1,unit:v=>v+' kW'}],
  sections:[clockSection('서울'),
   {title:'이 유리 집을 서울에 놓으면',lead:'네 면이 유리인 한 방을 서울의 8,760시간 날씨에 놓고 한 해의 난방과 전기를 계산합니다.',controls:['glass','wool','ach','heat'],part:'facts'},
   {title:'열은 어디로 빠져나가나',lead:'안팎 온도가 1 °C 다를 때 빠지는 열(W/K)입니다.',part:'envelope',wide:true},
   ...weatherSections('서울'),
   {title:'1년 전기 사용과 지붕 태양광',lead:'서울의 8,760시간 날씨로 시간마다 난방·냉방에 필요한 열을 구하고 전기로 바꿨습니다.',controls:['heater','pv'],part:'yearly',chart:'monthly',wide:true},
   {title:'부하 지속 곡선',lead:'1년 8,760시간의 전력을 큰 것부터 늘어놓았습니다.',chart:'duration',wide:true},
   {title:'전기설계로 이어 보기',part:'electric',wide:true}],
  parts:{facts,envelope,yearly,electric},
  charts:{monthly:({r})=>monthlySpec(r.months,SERIES,topShare(r.year,SERIES),pvOverlay(r.year)),
   duration:({b,r})=>durationSpec(r.hourly,[{value:b.connected/1000,label:'회로표의 집 부하'}])},
  basis:{note:'시간마다 열이 드나드는 양만 따지는 학습용 추정입니다. 원래 집의 기록이 아니라 재구성한 모델을 서울에 놓은 값입니다.',rows:({b})=>[
   ['범위',`유리로 둘러싼 실내 ${n(b.area,1)} m², 천장 높이 ${CLEAR} m. 집이 땅에서 떠 있어서 바닥도 바깥 공기와 만난다고 봅니다.`],
   ['유리와 판',`유리벽은 틀과 커튼을 빼고 ${SUNLIT*100} %가 햇빛을 받습니다. 지붕은 방수층 40 mm와 콘크리트 판 190 mm, 바닥은 트래버틴 45 mm와 콘크리트 판 255 mm로 보고 단열 두께만 바꿉니다.`],
   ['실내',`냉방 26 °C. 조명은 바깥이 어두울 때 ${LIGHT_USE*100} %를 켜고, 바닥 콘센트는 ${USE.P1*100} %, 인덕션은 ${USE.K1*100} %를 계속 쓰며, ${PEOPLE}명이 삽니다.`],
   ['설비',`히트펌프 한 대가 난방과 냉방을 함께 맡고, 효율은 난방 ${HEAT_COP}, 냉방 ${COOL_COP}로 봅니다. 전기 히터를 고르면 난방 효율은 1입니다.`],
   ['태양광','지붕에 남향 30° 경사, 시스템 효율 80 %로 둡니다.']]}});
}
