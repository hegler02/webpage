// Shared shell of the weather and energy lesson for the apartment, cleanroom and conveyor samples.
// Controls are drawn once; only the result blocks and charts are redrawn, so a slider keeps its focus while it moves.
import {simulate,designLoads} from './src/energy-engine.mjs';
import {render as chart} from '/pages/profile/site/charts/mirinae-charts.js';

export const n=(v,d=0)=>Number(v).toLocaleString('ko-KR',{minimumFractionDigits:d,maximumFractionDigits:d});
export const glazings={single:{name:'단판 유리 6 mm',u:5.8,g:.8},double:{name:'복층 유리',u:2.8,g:.7},lowe:{name:'로이 복층 유리',u:1.5,g:.45}};
export const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');

let weather=null;
export async function loadWeather(){
 if(weather)return weather;
 const r=await fetch('/pages/guardhouse-classroom/runtime/weather-seoul.json',{signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw new Error('날씨 자료를 읽지 못했습니다.');
 return weather=await r.json();
}

// One year of a building: its envelope, the hourly balance and the design-day loads.
export const yearOf=build=>(weather,state)=>{const b=build(state),r=simulate(weather,b);return {b,r,d:designLoads(weather,b,r)};};
export const used=(year,series)=>series.reduce((a,[k])=>a+year[k],0);
export const factList=rows=>`<dl class="energy-facts">${rows.map(([t,v])=>`<div><dt>${t}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
export const checkList=rows=>`<ul class="energy-checks">${rows.map(([title,text,ok])=>`<li${ok==null?'':` class="${ok?'is-ok':'is-short'}"`}><strong>${title}</strong>${text}</li>`).join('')}</ul>`;

// A building may give fresh (the air changes before heat recovery) and recovery (0 to 1) beside the ach the balance uses.
export function envelopeTable({b,r}){
 const air=b.fresh??b.ach,rows=[...b.surfaces.map(s=>[s.name,n(s.area,1)+' m²',n(s.u,2)+((s.b??1)===1?'':' × '+n(s.b,1)),s.area*s.u*(s.b??1)]),['환기','1시간에 '+n(air,1)+'회','',r.Hv]];
 return `<div class="table-scroll"><table class="energy-table"><thead><tr><th>부위</th><th>넓이</th><th>U (W/m²K)</th><th>W/K</th></tr></thead><tbody>${rows.map(([name,size,u,h])=>`<tr><th scope="row">${name}</th><td>${size}</td><td>${u}</td><td><span class="energy-share"><i style="width:${n(h/r.Htot*100)}%"></i></span>${n(h,1)}</td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">합계</th><td></td><td></td><td>${n(r.Htot,1)}</td></tr></tfoot></table></div>
 <p class="energy-formula">환기로 나가는 열 = 0.34 × 환기 횟수 × 부피${b.recovery?' × (1 − 열회수율)':''} = 0.34 × ${n(air,1)} × ${n(b.volume,1)} m³${b.recovery?` × ${n(1-b.recovery,1)}`:''} = ${n(r.Hv,1)} W/K. 전체의 ${n(r.Hv/r.Htot*100)} %입니다.</p>`;
}

// Monthly electricity by use as stacked bars; series are [key,label,slot] and keep their slot whatever the state.
export function monthlySpec(months,series,takeaway,overlay=null){
 return {type:'bar',unit:'kWh',data:months.map((o,i)=>({month:`${i+1}월`,...Object.fromEntries(series.map(([k])=>[k,Math.round(o[k])])),...(overlay?{[overlay.y]:Math.round(o[overlay.y])}:{})})),encoding:{x:'month',y:series.map(([k])=>k)},labels:Object.fromEntries(series.map(([k,t])=>[k,t])),
  takeaway,options:{stack:true,labels:'none',colors:Object.fromEntries(series.map(([k,,c])=>[k,c])),...(overlay?{overlay}:{})}};
}
export const topShare=(year,series)=>{const total=used(year,series),top=series.reduce((a,c)=>year[c[0]]>year[a[0]]?c:a);return `${top[1]}에 1년 전기의 ${n(year[top[0]]/total*100)} %를 씁니다.`;};
export function durationSpec(hourly,refs){
 const kw=Array.from(hourly,v=>v/1000),sorted=[...kw].sort((x,y)=>y-x);
 return {type:'loadduration',unit:'kW',labels:{value:'전력'},takeaway:`가장 큰 전력은 ${n(sorted[0],2)} kW이고, 1년의 절반은 ${n(sorted[Math.floor(sorted.length/2)],2)} kW보다 적게 씁니다.`,options:{values:kw,refs}};
}

// controls: {k,label,options:[[value,name]]} draws a select, {k,label,min,max,step,unit} draws a slider.
// sections: {title,lead,controls,part,chart}; parts and charts are functions of what compute returns.
export function createEnergyPanel({read,write,fresh,card='card',controls,compute,sections,parts={},charts={},basis}){
 const clean=saved=>{const base=fresh(),o={...base,...saved};
  for(const c of controls){if(c.options){if(!c.options.some(([v])=>v===o[c.k]))o[c.k]=base[c.k];}else{const v=Number(o[c.k]);o[c.k]=Number.isFinite(v)?Math.min(c.max,Math.max(c.min,v)):base[c.k];}}
  return o;};
 const state=clean(read());
 let root=null,drawn=null;
 const control=c=>c.options?`<label>${c.label}<select data-energy-input="${c.k}">${c.options.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`
  :`<label class="energy-range">${c.label} <output></output><input data-energy-input="${c.k}" type="range" min="${c.min}" max="${c.max}" step="${c.step}"></label>`;
 const sync=()=>{for(const el of root.querySelectorAll('[data-energy-input]')){const c=controls.find(x=>x.k===el.dataset.energyInput);el.value=state[c.k];if(!c.options)el.previousElementSibling.textContent=c.unit(state[c.k]);}};
 const paint=y=>{for(const [k,f] of Object.entries(parts))root.querySelector(`[data-energy-part="${k}"]`).innerHTML=f(y);sync();};
 const update=()=>{const y=compute(weather,state);paint(y);for(const [k,f] of Object.entries(charts))drawn[k].update(f(y));};

 async function render(host){
  await loadWeather();root=host;const y=compute(weather,state);
  const rows=[...basis.rows(y),['날씨',`${esc(weather.source.note)} 관측소 ${esc(weather.station)}, 설계 외기 겨울 ${weather.design.heating996} °C · 여름 ${weather.design.cooling04} °C. <a href="${esc(weather.source.url)}" target="_blank" rel="noopener">${esc(weather.source.name)}</a>`]];
  host.innerHTML=sections.map(s=>`<article class="${card}"><h2>${s.title}</h2>${s.lead?`<p>${s.lead}</p>`:''}${s.controls?`<div class="energy-controls">${controls.map(control).join('')}</div>`:''}${s.part?`<div data-energy-part="${s.part}"></div>`:''}${s.chart?`<div data-energy-chart="${s.chart}"></div>`:''}</article>`).join('')+
   `<details class="${card} energy-basis"><summary>계산 가정과 자료</summary><p>${basis.note}</p><dl>${rows.map(([t,v])=>`<div><dt>${t}</dt><dd>${v}</dd></div>`).join('')}</dl></details>`;
  drawn=Object.fromEntries(Object.entries(charts).map(([k,f])=>[k,chart(host.querySelector(`[data-energy-chart="${k}"]`),f(y),{bare:true})]));
  paint(y);
  host.oninput=e=>{const c=controls.find(x=>x.k===e.target.dataset?.energyInput);if(!c||!root?.isConnected)return;state[c.k]=c.options?e.target.value:Number(e.target.value);write(state);update();};
 }
 return {render};
}
