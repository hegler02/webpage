// Energy lesson for the conveyor sample: weather does not change what the motor draws, it changes how hot the control cabinet gets.
import {monthOfDay} from './src/energy-engine.mjs';
import {byId} from './src/conveyor-project.mjs';
import {defaults,calculations} from './src/conveyor-engine.mjs';
import {createEnergyPanel,used,factList,checkList,monthlySpec,topShare,weatherSections,n} from './energy-panel.mjs';

export const freshEnergy=()=>({hours:8,load:70,warm:5,cooling:'none'});
const SERIES=[['motor','모터','slot3'],['control','제어 회로','slot4'],['cooling','제어반 냉각','slot1']];
const VOLT=380,START=8,WORKDAYS=5,FLOOR=10,LIMIT=40,SHEET=5.5,AIR=.34,LAMP=2;
export const coolers={none:{name:'없음'},fan:{name:'환기 팬',flow:100,watts:20},cooler:{name:'냉방기',set:35,cop:2}};
// Heat given off inside the cabinet in watts. Coil loads are the VA of the transformer calculation, taken whole as heat.
const HEAT=[['제어용 변압기 손실','정격 100 VA의 10 %',10],['접촉기 코일','유지 12 VA',12],['운전 허가 릴레이','코일 4 VA',4],['PLC 입력 모듈','수업 가정',10],['차단기·퓨즈·단자 접속','수업 가정',5]];

export function machine(state){
 const d=defaults(),size=byId.get('CAB1').size,[w,h,depth]=size,area=2*h*(w+depth)+w*depth,heat=HEAT.reduce((a,x)=>a+x[2],0),cool=coolers[state.cooling];
 const input=d.motorKW*1000*state.load/100/d.efficiency;
 return {...d,size,area,heat,cool,input,load:state.load,hours:state.hours,warm:state.warm,current:input/(Math.sqrt(3)*VOLT*d.pf),rated:calculations(d).find(c=>c.id==='current').value,
  breaker:Number(byId.get('-02Q1').spec.match(/(\d+) A/)[1]),loss:SHEET*area+(cool.flow?AIR*cool.flow:0),control:heat+LAMP};
}

// One year of running: five days a week from eight o'clock, the main breaker off for the rest.
export function year(weather,state){
 const b=machine(state),months=Array.from({length:12},()=>({motor:0,control:0,cooling:0})),temps=[];let peak=0,coolPeak=0;
 for(let i=0;i<weather.t.length;i++){
  const clock=i%24,day=Math.floor(i/24)-(clock<START?1:0);
  if((clock-START+24)%24>=b.hours||((day%7)+7)%7>=WORKDAYS)continue;
  const around=Math.max(FLOOR,weather.t[i]/10+b.warm),free=around+b.heat/b.loss,held=b.cool.set!=null&&free>b.cool.set;
  const cooling=held?Math.max(0,b.heat-SHEET*b.area*(b.cool.set-around))/b.cool.cop:b.cool.watts??0,m=months[monthOfDay(Math.floor(i/24)+1)];
  m.motor+=b.input/1000;m.control+=b.control/1000;m.cooling+=cooling/1000;
  temps.push(held?b.cool.set:free);peak=Math.max(peak,b.input+b.control+cooling);coolPeak=Math.max(coolPeak,cooling);
 }
 return {b,r:{months,year:Object.fromEntries(SERIES.map(([k])=>[k,months.reduce((a,m)=>a+m[k],0)])),peak,coolPeak,temps,top:Math.max(...temps),hot:temps.filter(v=>v>LIMIT).length,rise:b.heat/b.loss}};
}

export function createConveyorEnergy({read,write}){
 const facts=({r})=>factList([['1년 전기',n(used(r.year,SERIES))+' kWh'],['가장 큰 전력',n(r.peak/1000,2)+' kW'],['제어반 안 최고 온도',n(r.top,1)+' °C'],[LIMIT+' °C를 넘는 시간',n(r.hot)+'시간']]);
 const heat=({b,r})=>`<div class="table-scroll"><table class="energy-table"><thead><tr><th>기기</th><th class="is-text">근거</th><th>열 (W)</th></tr></thead><tbody>${HEAT.map(([name,why,w])=>`<tr><th scope="row">${name}</th><td class="is-text">${why}</td><td>${n(w)}</td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">합계</th><td></td><td>${n(b.heat)}</td></tr></tfoot></table></div>
 <p class="energy-formula">안팎 온도차 = 열 ÷ (${SHEET} × 겉넓이${b.cool.flow?` + ${AIR} × 팬 풍량`:''}) = ${n(b.heat)} W ÷ (${SHEET} × ${n(b.area,1)} m²${b.cool.flow?` + ${AIR} × ${b.cool.flow} m³/h`:''}) = ${n(r.rise,1)} °C. 제어반 안은 공장 공기보다 이만큼 덥습니다.</p>`;
 const electric=({b,r})=>checkList([
  ['모터 전류',`부하 ${b.load} %에서 전기 입력은 ${n(b.input/1000,2)} kW이고, 전류는 ${n(b.input)} ÷ (√3 × ${VOLT} × ${b.pf}) = ${n(b.current,2)} A입니다. 정격 ${n(b.rated,2)} A와 주 차단기 ${b.breaker} A 안에 듭니다.`,b.current<=b.rated+1e-9],
  ['날씨와 전기',`모터 전기는 날씨가 아니라 운전 시간과 부하가 정합니다. 1년에 ${n(r.temps.length)}시간을 돌려 ${n(r.year.motor)} kWh를 씁니다.`],
  ['제어반 온도',r.hot?`1년에 ${n(r.hot)}시간은 제어반 안이 ${LIMIT} °C를 넘고, 가장 더울 때 ${n(r.top,1)} °C입니다. 공장 공기가 뜨거운 탓이라 환기 팬으로는 낮출 수 없고 냉방기를 달아야 합니다.`
   :`운전하는 동안 제어반 안은 가장 더울 때 ${n(r.top,1)} °C로, 기기 기준 ${LIMIT} °C 안에 듭니다.${r.coolPeak&&b.cool.set?` 냉방기는 가장 더운 시간에 전기 ${n(r.coolPeak)} W를 씁니다.`:''}`,!r.hot]])+
  '<div class="button-row"><button type="button" data-go="electrical">전기설계 보기</button><button type="button" data-go="calculations">계산과 확인 보기</button></div>';
 return createEnergyPanel({read,write,fresh:freshEnergy,compute:year,
  controls:[{k:'hours',label:'하루 운전 시간',min:4,max:24,step:2,unit:v=>v+'시간'},{k:'load',label:'모터 부하',min:30,max:100,step:10,unit:v=>v+' %'},{k:'warm',label:'공장 안팎 온도차',min:0,max:15,step:1,unit:v=>v+' °C'},{k:'cooling',label:'제어반 냉각',options:Object.entries(coolers).map(([k,c])=>[k,c.name])}],
  sections:[{title:'이 컨베이어를 서울 공장에 놓으면',lead:'컨베이어 한 대를 서울의 8,760시간 날씨에 놓고 한 해의 전기와 제어반 온도를 계산합니다.',controls:true,part:'facts'},
   {title:'제어반 안에서 나는 열',lead:'기기가 내는 열은 제어반 강판으로 빠져나가고, 그만큼 안이 공장 공기보다 더워집니다.',part:'heat'},
   // Only the outdoor temperature reaches a machine indoors, so the sun and the wind are left out.
   ...weatherSections('서울',false).filter(s=>s.chart==='climate'),
   {title:'1년 전기 사용',chart:'monthly'},
   {title:'제어반 온도 지속 곡선',lead:'운전하는 시간의 제어반 안 온도를 높은 것부터 늘어놓았습니다.',chart:'temperature'},
   {title:'전기설계로 이어 보기',part:'electric'}],
  parts:{facts,heat,electric},
  charts:{monthly:({r})=>monthlySpec(r.months,SERIES,topShare(r.year,SERIES)+' 달마다 다른 것은 일하는 날 수뿐입니다.'),
   temperature:({r})=>({type:'loadduration',unit:'°C',labels:{value:'제어반 안 온도'},takeaway:r.hot?`운전하는 ${n(r.temps.length)}시간 가운데 ${n(r.hot)}시간은 제어반 안이 ${LIMIT} °C를 넘습니다.`:`운전하는 ${n(r.temps.length)}시간 내내 제어반 안은 ${LIMIT} °C를 넘지 않습니다.`,options:{values:r.temps,refs:[{value:LIMIT,label:'기기 기준'}]}})},
  basis:{note:'시간마다 전기와 열이 드나드는 양만 따지는 학습용 추정입니다.',rows:({b})=>[
   ['범위',`컨베이어 한 대와 제어반 하나. 주 ${WORKDAYS}일, 아침 ${START}시부터 정한 시간만큼 돌리고 쉬는 동안에는 주 차단기를 내린다고 봅니다.`],
   ['모터',`축 출력 ${b.motorKW} kW, 효율 ${b.efficiency}, 역률 ${b.pf}, ${VOLT} V. 부하가 줄어도 효율과 역률은 그대로라고 봅니다.`],
   ['공장 온도',`공장 안은 바깥보다 정한 만큼 덥고, 겨울에도 ${FLOOR} °C 아래로 내려가지 않는다고 봅니다.`],
   ['제어반',`도장 강판 ${b.size.join(' × ')} m, 바닥을 뺀 겉넓이 ${n(b.area,1)} m²에서 1 m²·1 °C마다 ${SHEET} W가 빠집니다. 환기 팬은 1시간에 ${coolers.fan.flow} m³를 바꾸며 ${coolers.fan.watts} W를 쓰고, 냉방기는 안을 ${coolers.cooler.set} °C에 묶으며 효율은 ${coolers.cooler.cop}입니다.`],
   ['기준',`기기 기준 ${LIMIT} °C는 KS C IEC 60947-1이 표준 사용 조건으로 두는 주위 공기 온도의 상한입니다.`]]}});
}
