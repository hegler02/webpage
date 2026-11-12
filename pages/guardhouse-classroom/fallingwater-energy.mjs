// Energy lesson for the Fallingwater sample: bare sandstone, single glass and uninsulated trays, set in Seoul weather.
import {uValue} from './src/energy-engine.mjs';
import {interior,fallingwaterElectrical,houseLoad} from './src/fallingwater-project.mjs';
import {fallingwaterModel,F1,C3,PAR,T} from './src/fallingwater-model.mjs';
import {createEnergyPanel,glazings,yearOf,used,factList,checkList,envelopeTable,uFormulas,monthlySpec,topShare,durationSpec,pvOverlay,pvFacts,heaterControl,heaterOf,clockSection,weatherSections,whenText,n} from './energy-panel.mjs';

export const freshEnergy=()=>({glass:'single',wall:0,wool:0,ach:.5,heat:20,heater:'heatpump',pv:0});
const SERIES=[['heatElec','난방','slot2'],['coolElec','냉방','slot1'],['light','조명','slot4'],['equip','가전','slot3']];
const HEAT_COP=3,COOL_COP=3.5,PEOPLE=4,LIGHT_USE=.4,SUNLIT=.5,STONE=450,LAMBDA={roofing:.2,wool:.04,concrete:2.3,stone:2.3};
// Share of each circuit's connected load that runs through the day.
const USE={P1:.1,P2:.1,K1:.05};
// Panels go on the roof slabs over the upper floors; the terraces stay clear. One kW takes about 6 m².
const ROOF=interior.floors[1],MAX_PV=Math.floor(ROOF/6);
// The model's south is the side of the falls; the real front faces a little east of south.
const GLASS=[['폭포 쪽 유리','S',['glass-s','glass-m','glass-g','glass-3','glass-tower']],['서쪽 유리','W',['glass-w1','glass-w2']],['동쪽 유리','E',['glass-e','glass-ge','glass-door']]];
// Stone walls with a heated room on one side and outside air on the other, and the glass set into them.
const OUTER=['tower-s','tower-w','tower-n','chimney-core','north-wall','east-wall','gallery-north','gallery-east','bath-south','bath-west'],IN_STONE=['glass-tower','glass-door'],SILL=['glass-s','glass-w1'];

const parts=Object.fromEntries(fallingwaterModel().elements.map(e=>[e.id,e]));
const run=e=>{const xs=e.footprint.map(p=>p[0]),ys=e.footprint.map(p=>p[1]);return Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));};
const face=id=>run(parts[id])*parts[id].height,sum=(ids,f)=>ids.reduce((a,id)=>a+f(id),0);
// Only the height between the first floor and the top ceiling has a room behind it.
const heated=id=>{const e=parts[id];return run(e)*(Math.min(e.base+e.height,C3)-Math.max(e.base,F1));};
const stoneArea=sum(OUTER,heated)-sum(IN_STONE,face),sillArea=sum(SILL,id=>run(parts[id]))*PAR,ground=interior.floors[0]-interior.living;

// Three stacked floors behind glass and stone; the living-room floor hangs over the stream, so it meets outside air like the roof does.
export function house(state){
 const glass=glazings[state.glass],lining=state.wall?[{name:'안쪽 단열재',thickness:state.wall,lambda:LAMBDA.wool}]:[];
 const wall=uValue([...lining,{name:'사암 벽',thickness:STONE,lambda:LAMBDA.stone}],{rsi:.13,rse:.04});
 const sill=uValue([...lining,{name:'콘크리트 난간벽',thickness:T*1000,lambda:LAMBDA.concrete}],{rsi:.13,rse:.04});
 const roof=uValue([{name:'방수층',thickness:40,lambda:LAMBDA.roofing},{name:'단열재',thickness:state.wool,lambda:LAMBDA.wool},{name:'콘크리트 판',thickness:200,lambda:LAMBDA.concrete}],{rsi:.1,rse:.04});
 const floor=uValue([{name:'사암 판석',thickness:50,lambda:LAMBDA.stone},{name:'단열재',thickness:state.wool,lambda:LAMBDA.wool},{name:'콘크리트 판',thickness:100,lambda:LAMBDA.concrete}],{rsi:.17,rse:.04});
 const circuits=fallingwaterElectrical().circuits,watts=Object.fromEntries(circuits.map(c=>[c.id,c.watts])),heater=heaterOf(state,HEAT_COP);
 const surfaces=[...GLASS.map(([name,facing,ids])=>({name,area:sum(ids,face),u:glass.u,g:glass.g,facing})),
  {name:'사암 벽',area:stoneArea,u:wall.u,stone:true},{name:'창 아래 난간벽',area:sillArea,u:sill.u},
  {name:'지붕과 테라스 판',area:interior.floors[0],u:roof.u},{name:'물 위로 내민 거실 바닥',area:interior.living,u:floor.u},{name:'바위에 앉은 부엌 바닥',area:ground,u:floor.u,b:.5}];
 return {surfaces,area:interior.area,volume:interior.volume,ach:state.ach,heatSet:state.heat,coolSet:26,glassShare:SUNLIT,lightBelow:120,lightWatts:(watts.L1+watts.L2)*LIGHT_USE,equipWatts:Object.entries(USE).reduce((a,[id,share])=>a+watts[id]*share,0),peopleWatts:PEOPLE*75,
  heatCop:heater.cop,coolCop:COOL_COP,pv:{kwp:state.pv,tilt:30,ratio:.8},heater,wall,roof,floor,pump:circuits.find(c=>c.id==='H1'),connected:houseLoad({circuits})};
}

export function createFallingwaterEnergy({read,write,viewer}){
 const stoneLoss=b=>b.surfaces.filter(s=>s.stone).reduce((a,s)=>a+s.area*s.u,0);
 const facts=({b,r})=>factList([['1년 전기',n(used(r.year,SERIES))+' kWh'],['1년 난방 열',n(r.year.heat)+' kWh'],['바닥 1 m²마다 난방',n(r.year.heat/b.area)+' kWh'],['돌벽으로 빠지는 열',n(stoneLoss(b)/r.Htot*100)+' %']]);
 const electric=({b,r,d})=>{const heat=d.heat/b.heatCop,cool=r.peak.cool/b.coolCop,fits=Math.max(heat,cool)<=b.pump.watts;
  return checkList([['난방 설계',`바깥 ${n(d.heatOut,1)} °C에서 ${n(d.heat/1000,1)} kW의 열이 필요하고, ${b.heater.name}는 전기 ${n(heat/1000,1)} kW를 씁니다.`],
   ['냉방 설계',`가장 더운 시간(${whenText(r.peakAt.cool)})에 ${n(r.peak.cool/1000,1)} kW의 열을 빼야 하고, ${b.heater.cop===1?'에어컨은':'히트펌프는'} 전기 ${n(cool/1000,1)} kW를 씁니다.`],
   ['회로표와 견주기',`${b.pump.id} ${b.pump.name} 회로의 부하는 ${n(b.pump.watts)} W입니다. 계산한 전력 ${n(Math.max(heat,cool))} W는 ${fits?'그 안에 들어갑니다':'그보다 큽니다. 유리를 바꾸고 돌벽과 판에 단열을 넣어 그 안으로 줄여 보세요'}.`,fits],
   ['최대 전력',`1년 중 전기를 가장 많이 쓰는 시간은 ${whenText(r.peakAt.elec)}, ${n(r.peak.elec/1000,2)} kW입니다.`]])+
   '<div class="button-row"><button type="button" data-go="electrical">분기 회로표 보기</button><button type="button" data-term="steel-sash">강철 창틀과 판유리</button><button type="button" data-term="u-value">열관류율</button><button type="button" data-term="thermal-bridge">열교</button></div>';};
 const envelope=y=>envelopeTable(y)+uFormulas([['사암 벽',y.b.wall,{rsi:.13,rse:.04}],['지붕과 테라스 판',y.b.roof,{rsi:.1,rse:.04}],['거실 바닥',y.b.floor,{rsi:.17,rse:.04}]],'표의 U에 넓이를 곱하면 W/K가 됩니다.');
 const yearly=({b,r})=>pvFacts(r,used(r.year,SERIES))+`<p class="small">${b.heater.note} 테라스를 뺀 지붕 판 ${n(ROOF,1)} m²에 1 kW당 약 6 m²로 최대 ${MAX_PV} kW까지 놓습니다.</p>`;
 return createEnergyPanel({read,write,viewer,fresh:freshEnergy,card:'bay-card',compute:yearOf(house),
  clock:{label:'서울',north:'폭포 쪽을 정남으로 놓았습니다. 실제 집은 남남동을 봅니다.',materials:'표면 열저항은 ISO 6946, 열전도율은 ISO 10456 계열의 대표값입니다. 사암과 콘크리트 2.3, 단열재 0.04, 방수층 0.2 W/mK. 유리의 U와 일사 투과율은 유리 종류별 대표값입니다.'},
  controls:[{k:'glass',label:'유리',options:Object.entries(glazings).map(([k,g])=>[k,g.name])},{k:'wall',label:'돌벽 안쪽 단열 두께',min:0,max:100,step:10,unit:v=>v+' mm'},{k:'wool',label:'지붕과 바닥 단열 두께',min:0,max:200,step:10,unit:v=>v+' mm'},{k:'ach',label:'1시간 환기 횟수',min:.3,max:2,step:.1,unit:v=>n(v,1)+'회'},{k:'heat',label:'난방 온도',min:16,max:24,step:1,unit:v=>v+' °C'},
   heaterControl,{k:'pv',label:'지붕 태양광',min:0,max:MAX_PV,step:1,unit:v=>v+' kW'}],
  sections:[clockSection('서울'),
   {title:'이 돌집을 서울에 놓으면',lead:'맨 돌벽과 한 겹 유리로 지은 세 층을 서울의 8,760시간 날씨에 놓고 한 해의 난방과 전기를 계산합니다.',controls:['glass','wall','wool','ach','heat'],part:'facts'},
   {title:'열은 어디로 빠져나가나',lead:'안팎 온도가 1 °C 다를 때 빠지는 열(W/K)입니다.',part:'envelope',wide:true},
   ...weatherSections('서울'),
   {title:'1년 전기 사용과 지붕 태양광',lead:'서울의 8,760시간 날씨로 시간마다 난방·냉방에 필요한 열을 구하고 전기로 바꿨습니다.',controls:['heater','pv'],part:'yearly',chart:'monthly',wide:true},
   {title:'부하 지속 곡선',lead:'1년 8,760시간의 전력을 큰 것부터 늘어놓았습니다.',chart:'duration',wide:true},
   {title:'전기설계로 이어 보기',part:'electric',wide:true}],
  parts:{facts,envelope,yearly,electric},
  charts:{monthly:({r})=>monthlySpec(r.months,SERIES,topShare(r.year,SERIES),pvOverlay(r.year)),
   duration:({b,r})=>durationSpec(r.hourly,[{value:b.connected/1000,label:'회로표의 집 부하'}])},
  basis:{note:'시간마다 열이 드나드는 양만 따지는 학습용 추정입니다. 원래 집의 기록이 아니라 재구성한 모델을 서울에 놓은 값입니다.',rows:({b})=>[
   ['범위',`난방하는 방 아홉 곳 ${n(b.area,1)} m², 부피 ${n(b.volume,1)} m³.`],
   ['유리와 벽',`유리는 내민 판과 숲 그늘 때문에 ${SUNLIT*100} %만 햇빛을 받습니다. 바깥과 만나는 돌벽은 두께 ${STONE} mm 사암으로 보고 안쪽 단열 두께만 바꿉니다.`],
   ['판',`지붕과 테라스는 방수층 40 mm와 콘크리트 판 200 mm, 거실 바닥은 판석 50 mm와 콘크리트 판 100 mm로 보고 단열 두께만 바꿉니다. 거실 바닥은 물 위에 떠서 바깥 공기와 만나고, 부엌 바닥은 바위에 닿아 절반만 셉니다.`],
   ['실내',`냉방 26 °C. 조명은 바깥이 어두울 때 ${LIGHT_USE*100} %를 켜고, 콘센트는 ${USE.P1*100} %, 인덕션은 ${USE.K1*100} %를 계속 쓰며, ${PEOPLE}명이 삽니다.`],
   ['설비',`히트펌프 한 대가 난방과 냉방을 함께 맡고, 효율은 난방 ${HEAT_COP}, 냉방 ${COOL_COP}로 봅니다. 전기 히터를 고르면 난방 효율은 1입니다.`],
   ['태양광','지붕 판에 남향 30° 경사, 시스템 효율 80 %로 둡니다. 숲 그늘은 세지 않습니다.']]}});
}
