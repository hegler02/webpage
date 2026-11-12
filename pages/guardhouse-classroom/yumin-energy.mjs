// Energy lesson for the Yumin sample: a concrete box sunk into the ground with almost no windows, set in Seoul weather.
import {uValue} from './src/energy-engine.mjs';
import {interior,yuminElectrical,museumLoad} from './src/yumin-project.mjs';
import {yuminModel,IN,ARM,Q,CORE,TOP,B1} from './src/yumin-model.mjs';
import {createEnergyPanel,glazings,yearOf,used,factList,checkList,envelopeTable,uFormulas,monthlySpec,topShare,durationSpec,pvOverlay,pvFacts,heaterControl,heaterOf,clockSection,weatherSections,whenText,n} from './energy-panel.mjs';

export const freshEnergy=()=>({glass:'double',wall:50,wool:100,ach:.5,heat:20,heater:'heatpump',pv:0});
const SERIES=[['heatElec','난방','slot2'],['coolElec','냉방','slot1'],['light','조명','slot4'],['equip','콘센트','slot3']];
const HEAT_COP=3,COOL_COP=3.5,PEOPLE=12,OPEN=10,SUNLIT=.4,WALL=(CORE-IN)*1000,LAMBDA={roofing:.2,wool:.04,concrete:2.3};
// Share of each socket circuit's connected load that runs through the day.
const USE={P1:.1,P2:.1};
// The square the core walls enclose, one gallery roof and the roof of the west block.
const SIDE=2*CORE,GALLERY=IN-Q+.4,WEST=IN-ARM+.4;
// Panels go on the roof of the west block; the two gallery roofs stay clear. One kW takes about 6 m².
const ROOF=WEST*SIDE,MAX_PV=Math.floor(ROOF/6);
// The model's north is the building's axis; the real axis turns about 15 degrees east of north.
const GLASS=[['통로 쪽 홀 유리와 동쪽 띠 창','E',['glass-hall','glass-slit-n','glass-slit-s']],['라운지 북쪽 유리','N',['glass-lounge']],['램프의 방 남쪽 띠 창','S',['glass-lamp']]];

const parts=Object.fromEntries(yuminModel().elements.map(e=>[e.id,e]));
const run=e=>{const xs=e.footprint.map(p=>p[0]),ys=e.footprint.map(p=>p[1]);return Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));};
const face=id=>run(parts[id])*parts[id].height,sum=(ids,f)=>ids.reduce((a,id)=>a+f(id),0);
// Above the ground the walls meet air on the outside, along the water passage and in the slot between the two galleries.
const above=(2*SIDE+2*WEST+8*GALLERY)*TOP-sum(GLASS.flatMap(g=>g[2]),face);
// The ramp winds down around the basement, so half of its wall stands in the open trench and half against the earth.
const below=4*SIDE*-B1,deck=SIDE*SIDE-interior.roof;

// Two floors inside one concrete square: the basement sits on the earth and the water passage runs over its lobby.
export function house(state){
 const glass=glazings[state.glass],lining=state.wall?[{name:'벽 단열재',thickness:state.wall,lambda:LAMBDA.wool}]:[];
 const wall=uValue([...lining,{name:'노출 콘크리트 벽',thickness:WALL,lambda:LAMBDA.concrete}],{rsi:.13,rse:.04});
 const roof=uValue([{name:'방수층',thickness:40,lambda:LAMBDA.roofing},{name:'단열재',thickness:state.wool,lambda:LAMBDA.wool},{name:'콘크리트 판',thickness:250,lambda:LAMBDA.concrete}],{rsi:.1,rse:.04});
 const floor=uValue([{name:'단열재',thickness:state.wool,lambda:LAMBDA.wool},{name:'콘크리트 바닥 판',thickness:300,lambda:LAMBDA.concrete}],{rsi:.17,rse:.04});
 const circuits=yuminElectrical().circuits,watts=Object.fromEntries(circuits.map(c=>[c.id,c.watts])),heater=heaterOf(state,HEAT_COP);
 const surfaces=[...GLASS.map(([name,facing,ids])=>({name,area:sum(ids,face),u:glass.u,g:glass.g,facing})),
  {name:'바깥 공기와 만나는 콘크리트 벽',area:above+below/2,u:wall.u},{name:'흙에 닿는 지하 벽',area:below/2,u:wall.u,b:.5},
  {name:'지붕 판',area:interior.roof,u:roof.u},{name:'물의 통로 아래 판',area:deck,u:roof.u},{name:'흙에 닿는 지하 바닥',area:SIDE*SIDE,u:floor.u,b:.5}];
 // With almost no windows the lights burn through the opening hours whatever the sky does, so no hour counts as bright.
 return {surfaces,area:interior.area,volume:interior.volume,ach:state.ach,heatSet:state.heat,coolSet:26,glassShare:SUNLIT,lightBelow:2000,lightWatts:(watts.L1+watts.L2+watts.L3+watts.L4)*OPEN/24,equipWatts:Object.entries(USE).reduce((a,[id,share])=>a+watts[id]*share,0),peopleWatts:PEOPLE*75,
  heatCop:heater.cop,coolCop:COOL_COP,pv:{kwp:state.pv,tilt:30,ratio:.8},heater,wall,roof,floor,pump:circuits.find(c=>c.id==='H1'),connected:museumLoad({circuits})};
}

export function createYuminEnergy({read,write,viewer}){
 const facts=({b,r})=>factList([['1년 전기',n(used(r.year,SERIES))+' kWh'],['1년 난방 열',n(r.year.heat)+' kWh'],['바닥 1 m²마다 난방',n(r.year.heat/b.area)+' kWh'],['환기로 빠지는 열',n(r.Hv/r.Htot*100)+' %']]);
 const electric=({b,r,d})=>{const heat=d.heat/b.heatCop,cool=r.peak.cool/b.coolCop,fits=Math.max(heat,cool)<=b.pump.watts;
  return checkList([['난방 설계',`바깥 ${n(d.heatOut,1)} °C에서 ${n(d.heat/1000,1)} kW의 열이 필요하고, ${b.heater.name}는 전기 ${n(heat/1000,1)} kW를 씁니다.`],
   ['냉방 설계',`가장 더운 시간(${whenText(r.peakAt.cool)})에 ${n(r.peak.cool/1000,1)} kW의 열을 빼야 하고, ${b.heater.cop===1?'에어컨은':'히트펌프는'} 전기 ${n(cool/1000,1)} kW를 씁니다.`],
   ['회로표와 견주기',`${b.pump.id} ${b.pump.name} 회로의 부하는 ${n(b.pump.watts)} W입니다. 계산한 전력 ${n(Math.max(heat,cool))} W는 ${fits?'그 안에 들어갑니다':'그보다 큽니다. 환기를 줄이고 벽과 지붕에 단열을 더해 그 안으로 줄여 보세요'}.`,fits],
   ['최대 전력',`1년 중 전기를 가장 많이 쓰는 시간은 ${whenText(r.peakAt.elec)}, ${n(r.peak.elec/1000,2)} kW입니다.`]])+
   '<div class="button-row"><button type="button" data-go="electrical">분기 회로표 보기</button><button type="button" data-term="envelope">외피</button><button type="button" data-term="u-value">열관류율</button><button type="button" data-term="ground-coupling">땅에 닿는 벽과 바닥</button></div>';};
 const envelope=y=>envelopeTable(y)+uFormulas([['노출 콘크리트 벽',y.b.wall,{rsi:.13,rse:.04}],['지붕 판',y.b.roof,{rsi:.1,rse:.04}],['지하 바닥',y.b.floor,{rsi:.17,rse:.04}]],'표의 U에 넓이를 곱하면 W/K가 됩니다. 흙에 닿는 면은 절반만 셉니다.');
 const yearly=({b,r})=>pvFacts(r,used(r.year,SERIES))+`<p class="small">${b.heater.note} 서쪽 지붕 판 ${n(ROOF,1)} m²에 1 kW당 약 6 m²로 최대 ${MAX_PV} kW까지 놓습니다.</p>`;
 return createEnergyPanel({read,write,viewer,fresh:freshEnergy,card:'bay-card',compute:yearOf(house),
  clock:{label:'서울',north:'건물의 축을 정북으로 놓았습니다. 실제 축은 성산일출봉 쪽으로 북에서 동으로 약 15° 돌아 있습니다.',materials:'표면 열저항은 ISO 6946, 열전도율은 ISO 10456 계열의 대표값입니다. 콘크리트 2.3, 단열재 0.04, 방수층 0.2 W/mK. 유리의 U와 일사 투과율은 유리 종류별 대표값입니다.'},
  controls:[{k:'glass',label:'유리',options:Object.entries(glazings).map(([k,g])=>[k,g.name])},{k:'wall',label:'벽 단열 두께',min:0,max:100,step:10,unit:v=>v+' mm'},{k:'wool',label:'지붕과 바닥 단열 두께',min:0,max:200,step:10,unit:v=>v+' mm'},{k:'ach',label:'1시간 환기 횟수',min:.3,max:2,step:.1,unit:v=>n(v,1)+'회'},{k:'heat',label:'난방 온도',min:16,max:24,step:1,unit:v=>v+' °C'},
   heaterControl,{k:'pv',label:'지붕 태양광',min:0,max:MAX_PV,step:1,unit:v=>v+' kW'}],
  sections:[clockSection('서울'),
   {title:'이 미술관을 서울에 놓으면',lead:'창이 거의 없고 땅에 반쯤 묻힌 콘크리트 미술관을 서울의 8,760시간 날씨에 놓고 한 해의 난방과 전기를 계산합니다.',controls:['glass','wall','wool','ach','heat'],part:'facts'},
   {title:'열은 어디로 빠져나가나',lead:'안팎 온도가 1 °C 다를 때 빠지는 열(W/K)입니다.',part:'envelope',wide:true},
   ...weatherSections('서울'),
   {title:'1년 전기 사용과 지붕 태양광',lead:'서울의 8,760시간 날씨로 시간마다 난방·냉방에 필요한 열을 구하고 전기로 바꿨습니다.',controls:['heater','pv'],part:'yearly',chart:'monthly',wide:true},
   {title:'부하 지속 곡선',lead:'1년 8,760시간의 전력을 큰 것부터 늘어놓았습니다.',chart:'duration',wide:true},
   {title:'전기설계로 이어 보기',part:'electric',wide:true}],
  parts:{facts,envelope,yearly,electric},
  charts:{monthly:({r})=>monthlySpec(r.months,SERIES,topShare(r.year,SERIES),pvOverlay(r.year)),
   duration:({b,r})=>durationSpec(r.hourly,[{value:b.connected/1000,label:'회로표의 미술관 부하'}])},
  basis:{note:'시간마다 열이 드나드는 양만 따지는 학습용 추정입니다. 실제 미술관의 기록이 아니라 재구성한 모델을 서울에 놓은 값입니다.',rows:({b})=>[
   ['범위',`난방하는 방 열두 곳 ${n(b.area,1)} m², 부피 ${n(b.volume,1)} m³.`],
   ['유리와 벽',`유리는 높은 벽과 통로 그늘 때문에 ${SUNLIT*100} %만 햇빛을 받습니다. 벽은 두께 ${n(WALL)} mm 노출 콘크리트로 보고 단열 두께만 바꿉니다. 처음 값 50 mm는 추정입니다.`],
   ['땅',`경사로가 지하층을 한 바퀴 돌며 내려가므로 지하 벽의 절반은 바깥 공기와, 절반은 흙과 만난다고 봅니다. 흙에 닿는 벽과 지하 바닥은 절반만 셉니다.`],
   ['판',`지붕은 방수층 40 mm와 콘크리트 판 250 mm, 지하 바닥은 콘크리트 판 300 mm로 보고 단열 두께만 바꿉니다. 물의 통로 아래 판은 지붕과 같게 봅니다.`],
   ['실내',`냉방 26 °C. 조명은 하루 ${OPEN}시간 켜는 양을 24시간에 고르게 나누고, 콘센트는 ${USE.P1*100} %를 계속 쓰며, 관람객과 직원은 평균 ${PEOPLE}명으로 봅니다. 벽천폭포 펌프는 건물 밖의 물을 돌리므로 세지 않습니다.`],
   ['설비',`공조기의 히트펌프가 난방과 냉방을 함께 맡고, 효율은 난방 ${HEAT_COP}, 냉방 ${COOL_COP}로 봅니다. 전기 히터를 고르면 난방 효율은 1입니다.`],
   ['태양광','서쪽 지붕 판에 남향 30° 경사, 시스템 효율 80 %로 둡니다.']]}});
}
