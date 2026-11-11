// Energy lesson for the Salk sample: one lab floor is set in Seoul weather and run through the same hourly heat balance as the guardhouse.
// Controls are drawn once; only the result blocks and charts are redrawn, so a slider keeps its focus while it moves.
import {simulate,designLoads,uValue} from './src/energy-engine.mjs';
import {L,W} from './src/salk-model.mjs';
import {moduleBay,freshSalk,salkElectrical,blockLoad} from './src/salk-project.mjs';
import {render as chart} from '/pages/profile/site/charts/mirinae-charts.js';

const n=(v,d=0)=>Number(v).toLocaleString('ko-KR',{minimumFractionDigits:d,maximumFractionDigits:d});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export const glazings={single:{name:'홑유리 6 mm · 1965년 그대로',u:5.7,g:.82},double:{name:'로이 복층유리',u:1.8,g:.45},triple:{name:'로이 삼중유리',u:1,g:.35}};
export const freshEnergy=()=>({glass:'single',ach:6,recovery:0,pv:0});
// Electricity by use, each with its fixed chart slot; solar is drawn as a line in slot 7.
const SERIES=[['heatElec','난방','slot2'],['coolElec','냉방','slot1'],['light','조명','slot4'],['equip','실험 기기와 팬','slot3']];
const UNIT={ach:v=>v+'회',recovery:v=>v+' %',pv:v=>v+' kW'};
const GLASS_H=3.2,SOCKET_USE=.4,PEOPLE=2,ROOF_SHARE=1/moduleBay.floors;

// One lab floor between two service floors: heat leaves through the two glass walls, the two end walls and the ventilation air.
export function labFloor(state){
 const glass=glazings[state.glass],area=L*W,volume=area*moduleBay.ceiling,wall=uValue([{name:'노출 콘크리트',thickness:300,lambda:2.3}],{rsi:.13,rse:.04});
 const electric=salkElectrical(freshSalk()),watts=Object.fromEntries(electric.circuits.map(c=>[c.id,c.watts])),bays=moduleBay.count,ach=state.ach*(1-state.recovery/100);
 const surfaces=[{name:'남쪽 유리벽',area:L*GLASS_H,u:glass.u,g:glass.g,facing:'S'},{name:'북쪽 유리벽',area:L*GLASS_H,u:glass.u,g:glass.g,facing:'N'},{name:'끝벽 두 면',area:W*moduleBay.ceiling*2,u:wall.u}];
 return {surfaces,area,volume,ach,heatSet:20,coolSet:26,glassShare:.7,lightBelow:250,lightWatts:watts.L1*bays,equipWatts:(watts.P1*SOCKET_USE+watts.F1+watts.M1)*bays,peopleWatts:PEOPLE*75*bays,
  heatCop:3.2,coolCop:3.5,pv:{kwp:state.pv,tilt:30,ratio:.8},maxPv:Math.floor(area*ROOF_SHARE/6/5)*5,connected:blockLoad(electric).floor};
}

let weather=null;
async function loadWeather(){
 if(weather)return weather;
 const r=await fetch('/pages/guardhouse-classroom/runtime/weather-seoul.json',{signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw new Error('날씨 자료를 읽지 못했습니다.');
 return weather=await r.json();
}
const slider=(k,label,min,max,step)=>`<label class="energy-range">${label} <output></output><input data-energy-input="${k}" type="range" min="${min}" max="${max}" step="${step}"></label>`;

export function createSalkEnergy({read,write}){
 const state={...freshEnergy(),...read()};if(!glazings[state.glass])state.glass='single';
 let root=null,charts=null,cache=null;
 const year=()=>{if(cache)return cache;const b=labFloor(state),r=simulate(weather,b);return cache={b,r,d:designLoads(weather,b,r)};};
 const used=r=>SERIES.reduce((a,[k])=>a+r.year[k],0);

 const facts=()=>{const {b,r}=year(),total=used(r);
  return `<dl class="energy-facts"><div><dt>1년 전기</dt><dd>${n(total/1000,1)} MWh</dd></div><div><dt>바닥 1 m²마다</dt><dd>${n(total/b.area)} kWh</dd></div><div><dt>가장 큰 전력</dt><dd>${n(r.peak.elec/1000,1)} kW</dd></div><div><dt>태양광이 채우는 몫</dt><dd>${n(r.year.pv/total*100,1)} %</dd></div></dl>`;};
 const envelope=()=>{const {b,r}=year(),rows=[...b.surfaces.map(s=>[s.name,n(s.area,1)+' m²',n(s.u,2),s.area*s.u]),['환기','1시간에 '+n(b.ach,1)+'회','',r.Hv]];
  return `<div class="table-scroll"><table class="energy-table"><thead><tr><th>부위</th><th>넓이</th><th>U (W/m²K)</th><th>W/K</th></tr></thead><tbody>${rows.map(([name,size,u,h])=>`<tr><th scope="row">${name}</th><td>${size}</td><td>${u}</td><td><span class="energy-share"><i style="width:${n(h/r.Htot*100)}%"></i></span>${n(h)}</td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">합계</th><td></td><td></td><td>${n(r.Htot)}</td></tr></tfoot></table></div>
  <p class="energy-formula">환기로 나가는 열 = 0.34 × 환기 횟수 × 부피 = 0.34 × ${n(b.ach,1)} × ${n(b.volume)} m³ = ${n(r.Hv)} W/K. 전체의 ${n(r.Hv/r.Htot*100)} %입니다.</p>`;};
 const electric=()=>{const {b,r,d}=year(),heat=d.heat/b.heatCop,cool=r.peak.cool/b.coolCop;
  return `<ul class="energy-checks"><li><strong>난방 설계</strong>바깥 ${n(d.heatOut,1)} °C에서 ${n(d.heat/1000,1)} kW의 열이 필요하고, 히트펌프는 전기 ${n(heat/1000,1)} kW를 씁니다.</li>
  <li><strong>냉방 설계</strong>가장 더운 시간에 ${n(r.peak.cool/1000,1)} kW의 열을 빼야 하고, 냉동기는 전기 ${n(cool/1000,1)} kW를 씁니다.</li>
  <li class="${r.peak.elec<=b.connected?'is-ok':'is-short'}"><strong>회로표와 견주기</strong>분기 회로표의 한 층 부하는 ${n(b.connected/1000,1)} kW입니다. 냉난방을 더한 가장 큰 전력은 ${n(r.peak.elec/1000,1)} kW로 ${r.peak.elec<=b.connected?'그 안에 들어갑니다':'그보다 큽니다. 냉난방 전원은 따로 받아야 합니다'}.</li></ul>
  <div class="button-row"><button type="button" data-go="electrical">분기 회로표 보기</button><button type="button" data-term="ventilation-load">환기 부하</button><button type="button" data-term="u-value">열관류율</button></div>`;};
 const monthlySpec=()=>{const {r}=year(),total=used(r),top=SERIES.reduce((a,c)=>r.year[c[0]]>r.year[a[0]]?c:a);
  return {type:'bar',unit:'kWh',data:r.months.map((o,i)=>({month:`${i+1}월`,...Object.fromEntries(SERIES.map(([k])=>[k,Math.round(o[k])])),pv:Math.round(o.pv)})),encoding:{x:'month',y:SERIES.map(([k])=>k)},labels:Object.fromEntries(SERIES.map(([k,t])=>[k,t])),
   takeaway:`${top[1]}에 1년 전기의 ${n(r.year[top[0]]/total*100)} %를 씁니다.`,options:{stack:true,labels:'none',colors:Object.fromEntries(SERIES.map(([k,,c])=>[k,c])),...(r.year.pv>0?{overlay:{y:'pv',label:'태양광 발전',color:'var(--mc-s7)'}}:{})}};};
 const durationSpec=()=>{const {b,r}=year(),kw=Array.from(r.hourly,v=>v/1000),sorted=[...kw].sort((x,y)=>y-x);
  return {type:'loadduration',unit:'kW',labels:{value:'전력'},takeaway:`가장 큰 전력은 ${n(sorted[0],1)} kW이고, 1년의 절반은 ${n(sorted[Math.floor(sorted.length/2)],1)} kW보다 적게 씁니다.`,options:{values:kw,refs:[{value:b.connected/1000,label:'회로표의 한 층 부하'}]}};};

 const sync=()=>{for(const el of root.querySelectorAll('[data-energy-input]')){const k=el.dataset.energyInput;el.value=state[k];if(UNIT[k])el.previousElementSibling.textContent=UNIT[k](state[k]);}};
 const update=()=>{cache=null;for(const [k,f] of [['facts',facts],['envelope',envelope],['electric',electric]])root.querySelector(`[data-energy-part="${k}"]`).innerHTML=f();charts.monthly.update(monthlySpec());charts.duration.update(durationSpec());sync();};
 const basis=()=>{const b=labFloor(state);
  return `<details class="bay-card energy-basis"><summary>계산 가정과 자료</summary><p>시간마다 열이 드나드는 양만 따지는 학습용 추정이며, 재구성한 모델의 값입니다.</p><dl>
  <div><dt>범위</dt><dd>실험실 한 층 ${n(L,2)} × ${n(W,2)} m, 바닥 ${n(b.area)} m², 천장 높이 ${n(moduleBay.ceiling,2)} m. 위아래는 설비층이라 열이 드나들지 않는다고 봅니다.</dd></div>
  <div><dt>유리와 벽</dt><dd>유리 높이 ${GLASS_H} m, 창틀과 처마 그늘을 빼고 70 %가 햇빛을 받습니다. 끝벽은 노출 콘크리트 300 mm입니다.</dd></div>
  <div><dt>실내</dt><dd>난방 20 °C, 냉방 26 °C. 조명은 바깥이 어두울 때 켜고, 콘센트는 동시에 ${SOCKET_USE*100} %를 쓰며, 팬은 계속 돕니다. 한 칸에 ${PEOPLE}명이 있습니다.</dd></div>
  <div><dt>설비</dt><dd>난방 히트펌프 효율 3.2, 냉동기 효율 3.5. 열회수는 나가는 공기의 열을 그 비율만큼 되찾습니다. 태양광은 지붕의 3분의 1을 이 층 몫으로 잡아 최대 ${b.maxPv} kW입니다.</dd></div>
  <div><dt>날씨</dt><dd>${esc(weather.source.note)} 관측소 ${esc(weather.station)}, 설계 외기 겨울 ${weather.design.heating996} °C · 여름 ${weather.design.cooling04} °C. <a href="${esc(weather.source.url)}" target="_blank" rel="noopener">${esc(weather.source.name)}</a></dd></div></dl></details>`;};

 async function render(host){
  await loadWeather();root=host;cache=null;const max=labFloor(state).maxPv;state.pv=Math.min(state.pv,max);
  host.innerHTML=`<article class="bay-card"><h2>실험실 한 층을 서울에 놓으면</h2><p>라호이아의 유리벽 실험실을 서울의 8,760시간 날씨에 놓고 한 해의 전기를 계산합니다.</p>
  <div class="energy-controls"><label>유리<select data-energy-input="glass">${Object.entries(glazings).map(([k,g])=>`<option value="${k}">${g.name}</option>`).join('')}</select></label>${slider('ach','1시간 환기 횟수',2,12,1)}${slider('recovery','환기 열회수',0,80,10)}${slider('pv','지붕 태양광',0,max,5)}</div><div data-energy-part="facts"></div></article>
  <article class="bay-card"><h2>열은 어디로 빠져나가나</h2><p>안팎 온도가 1 °C 다를 때 빠지는 열(W/K)입니다.</p><div data-energy-part="envelope"></div></article>
  <article class="bay-card"><h2>1년 전기 사용</h2><div data-energy-chart="monthly"></div></article>
  <article class="bay-card"><h2>부하 지속 곡선</h2><p>1년 8,760시간의 전력을 큰 것부터 늘어놓았습니다.</p><div data-energy-chart="duration"></div></article>
  <article class="bay-card"><h2>전기설계로 이어 보기</h2><div data-energy-part="electric"></div></article>${basis()}`;
  charts={monthly:chart(host.querySelector('[data-energy-chart="monthly"]'),monthlySpec(),{bare:true}),duration:chart(host.querySelector('[data-energy-chart="duration"]'),durationSpec(),{bare:true})};
  update();
  host.oninput=e=>{const k=e.target.dataset?.energyInput;if(!k||!root?.isConnected)return;state[k]=k==='glass'?e.target.value:Number(e.target.value);write(state);update();};
 }
 return {render};
}
