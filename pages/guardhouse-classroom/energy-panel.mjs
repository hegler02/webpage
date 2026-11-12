// Shared shell of the weather and energy lesson for every sample but the guardhouse.
// Controls are drawn once; only the result blocks and charts are redrawn, so a slider keeps its focus while it moves.
import {simulate,designLoads,hourAt,dayOfYear,monthStart,sunVector} from './src/energy-engine.mjs';
import {render as chart,sunAt} from '/pages/profile/site/charts/mirinae-charts.js';
import {handBack} from './render-loop.mjs';

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
// How each U value was built from its layers; rows are [name,uValue result,{rsi,rse}].
export const uFormulas=(rows,note='')=>`<details><summary>U값 계산 보기</summary>${rows.map(([name,r,{rsi,rse}])=>`<p class="energy-formula">${name} U = 1 ÷ (실내 표면 ${rsi} + ${r.parts.filter(l=>l.thickness).map(l=>`${l.name} ${l.thickness/1000}÷${l.lambda}`).join(' + ')} + 실외 표면 ${rse}) = 1 ÷ ${n(r.total,3)} = ${n(r.u,2)} W/m²K</p>`).join('')}<p class="small">두께는 m, 열전도율은 W/mK입니다. ${note}</p></details>`;

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

// Roof solar: the line over the monthly bars and the four numbers under them.
export const pvOverlay=year=>year.pv>0?{y:'pv',label:'태양광 발전',color:'var(--mc-s7)'}:null;
export const pvFacts=(r,use)=>factList([['1년 전기 사용',n(use)+' kWh'],['태양광 발전',n(r.year.pv)+' kWh'],['발전 ÷ 사용',n(use?r.year.pv/use*100:0)+' %'],['1 kW당 1년 발전',n(r.pvYield)+' kWh']]);
// Heating by heat pump or by plain electric heat; pump is the sample's own heat-pump efficiency.
export const heaterControl={k:'heater',label:'난방 방식',options:[['heatpump','히트펌프'],['resistance','전기 히터']]};
export const heaterOf=(state,pump)=>state.heater==='resistance'?{name:'전기 히터',cop:1,note:'전기 히터는 전기 1 kW가 열 1 kW가 됩니다.'}:{name:'히트펌프',cop:pump,note:`히트펌프는 전기 1 kW로 열 ${n(pump,1)} kW를 옮깁니다.`};

const DAYS=[31,28,31,30,31,30,31,31,30,31,30,31],FACE={S:'남',E:'동',W:'서',N:'북'};
const MOMENTS=[['동지 정오',12,21,12.5],['춘분 해질녘',3,20,18.5],['하지 정오',6,21,12.5],['한여름 오후',8,5,15]];
const WIND=['북','북북동','북동','동북동','동','동남동','남동','남남동','남','남남서','남서','서남서','서','서북서','북서','북북서'];
export const clockText=h=>`${String(Math.floor(h)).padStart(2,'0')}:${h%1?'30':'00'}`;
// The hour of the year (0 to 8,759) as a date and the hour it ends.
export const whenText=i=>{const day=Math.floor(i/24)+1,m=monthStart.findLastIndex(x=>x<day);return `${m+1}월 ${day-monthStart[m]}일 ${i%24+1}시`;};

// The day-and-sun card for a panel that was given a clock, and the four weather charts; without a clock the sun path has no dot to follow
// and the two round charts share a row.
export const clockSection=label=>({title:`${label}의 하루와 햇빛`,lead:`날짜와 시간을 바꾸면 3D의 해와 그림자가 실제 ${label}의 위치로 움직입니다.`,clock:true});
export const weatherSections=(label,dot=true)=>[
 {title:`${label}의 1년, 시간마다 기온`,lead:'가로는 날짜, 세로는 하루의 시각입니다. 1년 8,760시간을 한 장에 담았습니다.',chart:'climate',wide:true},
 {title:'태양 궤적도',lead:'위에서 내려다본 하늘입니다. 고리는 해의 높이, 선은 매달 21일 해가 지나는 길입니다.'+(dot?' 노란 점이 고른 날짜와 시각의 해입니다.':''),chart:'sunpath',half:!dot},
 {title:'바람장미',lead:'바람이 불어오는 방향별로 1년 중 몇 %의 시간이었는지 보여 줍니다. 창과 환기구를 어디에 낼지 정할 때 봅니다.',chart:'windrose',half:!dot},
 {title:'습공기 선도',lead:'1년 8,760시간의 온도와 습도를 한 장에 찍었습니다. 노란 틀 밖의 시간은 냉방·난방·제습이 필요한 시간입니다.',chart:'psychro',wide:true}].map(s=>({...s,place:label}));
const place=()=>({lat:weather.lat,lon:weather.lon,tz:weather.tz});
const weatherCharts={
 climate(label){const rows=Array.from({length:24},(_,h)=>`${h}시`),cols=Array.from({length:365},(_,d)=>{const m=monthStart.findLastIndex(x=>x<=d);return `${m+1}월 ${d-monthStart[m]+1}일`;}),values=rows.map((_,h)=>cols.map((_,d)=>weather.t[d*24+h]/10)),flat=weather.t.map(v=>v/10),lo=Math.min(...flat),hi=Math.max(...flat);
  return {type:'heatmap',unit:'°C',takeaway:`가장 추운 시간과 가장 더운 시간의 차이가 ${n(hi-lo,1)} °C입니다.`,source:`${label} 관측소 표준 기상년(TMYx ${(/TMYx\.(\d{4}-\d{4})/.exec(weather.source.name)??[])[1]?.replace('-','–')??''}) · climate.onebuilding.org`,options:{matrix:{rows,cols,values},mid:15,cellHeight:9,xTicks:monthStart.map((d,m)=>({at:d+14,label:`${m+1}월`})),tableNote:'8,760칸은 표 대신 차트에서 눌러 읽습니다.'}};},
 sunpath(label,date,hour){const noon=day=>sunAt(day,12+(135-weather.lon)/15,place()).altitude;
  return {type:'sunpath',takeaway:`하지 정오의 해는 ${n(noon(172))}°, 동지 정오의 해는 ${n(noon(355))}° 높이입니다.`,options:{...place(),...(date?{now:{day:dayOfYear(...date),hour,label:`${date[0]}월 ${date[1]}일 ${clockText(hour)}`}}:{})}};},
 windrose(){const speed=weather.wind.map(v=>v/10),bins=Array(16).fill(0);weather.wdir.forEach((d,i)=>{if(speed[i]>=.5)bins[Math.round(d/22.5)%16]++;});const order=bins.map((v,i)=>i).sort((a,b)=>bins[b]-bins[a]);
  return {type:'windrose',takeaway:`${WIND[order[0]]}풍이 가장 잦고, ${WIND[order[1]]}풍이 그다음입니다.`,options:{dir:weather.wdir,speed}};},
 psychro(){const t=weather.t.map(v=>v/10),c={tmin:20,tmax:26,rhmin:30,rhmax:60,label:'쾌적 범위(학습용 단순화)'},p=101.325*(1-2.25577e-5*weather.elevation)**5.25588,inside=t.filter((x,i)=>x>=c.tmin&&x<=c.tmax&&weather.rh[i]>=c.rhmin&&weather.rh[i]<=c.rhmax).length;
  return {type:'psychro',takeaway:`1년 중 쾌적 범위에 드는 시간은 ${n(inside/t.length*100)} %입니다.`,options:{t,rh:weather.rh,comfort:c,pressure:p}};}};

// controls: {k,label,options:[[value,name]]} draws a select, {k,label,min,max,step,unit} draws a slider.
// sections: {title,lead,controls,part,chart,wide,half,clock,place}; neighbours marked half stand two to a row; a chart the sample does not draw is one of the weather charts of that place. controls is true for all of them or a list of keys. parts and charts are functions of what compute returns.
// clock: {label,north,materials} adds the date and hour, the dot on the sun path and the sun of the 3D view;
// viewer: {setSun,setNight,label} is that view. Without a clock the panel is the plain year of the apartment, cleanroom and conveyor.
export function createEnergyPanel({read,write,fresh,card='card',controls,compute,sections,parts={},charts={},basis,clock=null,viewer=null}){
 const clean=saved=>{const base={...(clock?{month:1,day:21,hour:12}:{}),...fresh()},o={...base,...saved};
  for(const c of controls){if(c.options){if(!c.options.some(([v])=>v===o[c.k]))o[c.k]=base[c.k];}else{const v=Number(o[c.k]);o[c.k]=Number.isFinite(v)?Math.min(c.max,Math.max(c.min,v)):base[c.k];}}
  if(clock){const m=Math.round(Number(o.month)),d=Math.round(Number(o.day)),h=Math.round(Number(o.hour)*2)/2;o.month=m>=1&&m<=12?m:base.month;o.day=d>=1&&d<=31?d:base.day;o.hour=h>=0&&h<=23.5?h:base.hour;}
  return o;};
 const state=clean(read());
 let root=null,first=null,drawn=null,sky=null,last=null,turns=0;
 const date=()=>[state.month,Math.min(state.day,DAYS[state.month-1])];
 const moment=()=>{const [m,d]=date();return hourAt(weather,last.b,dayOfYear(m,d),state.hour);};
 const control=c=>c.options?`<label>${c.label}<select data-energy-input="${c.k}">${c.options.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`
  :`<label class="energy-range">${c.label} <output></output><input data-energy-input="${c.k}" type="range" min="${c.min}" max="${c.max}" step="${c.step}"></label>`;
 const clockControls=()=>`<div class="energy-controls"><label>월<select data-energy-input="month">${DAYS.map((_,i)=>`<option value="${i+1}">${i+1}월</option>`).join('')}</select></label><label>일<input data-energy-input="day" type="number" min="1" max="31"></label><label class="energy-range">시각 <output></output><input data-energy-input="hour" type="range" min="0" max="23.5" step="0.5"></label></div>
  <div class="button-row">${MOMENTS.map(([t,m,d,h])=>`<button type="button" data-energy-moment="${m}-${d}-${h}">${t}</button>`).join('')}</div><div data-energy-part="now"></div>`;
 const section=s=>`<article class="${card}${s.wide?' energy-wide':''}"><h2>${s.title}</h2>${s.lead?`<p>${s.lead}</p>`:''}${s.clock?clockControls():''}${s.controls?`<div class="energy-controls">${(s.controls===true?controls:controls.filter(c=>s.controls.includes(c.k))).map(control).join('')}</div>`:''}${s.part?`<div data-energy-part="${s.part}"></div>`:''}${s.chart?`<div data-energy-chart="${s.chart}"></div>`:''}</article>`;
 // What the chosen hour does to this building: the weather, the sun on each face and the heat crossing the envelope.
 const now=()=>{const h=moment(),b=last.b,loss=(b.surfaces.reduce((a,x)=>a+x.area*x.u*(x.b??1),0)+.34*b.ach*b.volume)*(b.heatSet-h.tout),sunIn=b.surfaces.filter(x=>x.g).reduce((a,x)=>a+x.area*b.glassShare*x.g*h.faces[x.facing],0);
  return `<dl class="energy-facts"><div><dt>기온</dt><dd>${n(h.tout,1)} °C</dd></div><div><dt>습도</dt><dd>${h.rh} %</dd></div><div><dt>바람</dt><dd>${n(h.wind,1)} m/s</dd></div><div><dt>해 높이</dt><dd>${h.sun.altitude>0?n(h.sun.altitude,1)+'°':'해 없음'}</dd></div></dl>
  <div class="energy-faces" aria-label="면마다 받는 햇빛 W/m²">${['S','E','W','N'].map(f=>`<div><span>${FACE[f]}쪽 벽</span><strong>${n(h.faces[f])}</strong><small>W/m²</small></div>`).join('')}<div><span>지붕</span><strong>${n(h.roof)}</strong><small>W/m²</small></div></div>
  <p class="energy-balance">실내를 ${n(b.heatSet)} °C로 두면 지금 벽·유리·환기로 <strong>${n(Math.abs(loss))} W</strong>의 열이 ${loss<0?'들어오고':'빠져나가고'}, 유리로 햇빛 열 <strong>${n(sunIn)} W</strong>가 들어옵니다.</p>`;};
 const sync=()=>{const [m,d]=date();
  for(const el of root.querySelectorAll('[data-energy-input]')){const k=el.dataset.energyInput,c=controls.find(x=>x.k===k);
   if(c){el.value=state[k];if(!c.options)el.previousElementSibling.textContent=c.unit(state[k]);}
   else if(k==='month')el.value=m;else if(k==='day'){el.max=DAYS[m-1];el.value=d;}else if(k==='hour'){el.value=state.hour;el.previousElementSibling.textContent=clockText(state.hour);}}
  for(const b of root.querySelectorAll('[data-energy-moment]')){const [mm,dd,hh]=b.dataset.energyMoment.split('-').map(Number);b.setAttribute('aria-pressed',String(mm===m&&dd===d&&hh===state.hour));}};
 const paintNow=()=>{const host=root.querySelector('[data-energy-part="now"]');if(host)host.innerHTML=now();};
 // A part that is redrawn keeps the fold-outs the reader had opened.
 const paint=y=>{for(const [k,f] of Object.entries(parts)){const host=root.querySelector(`[data-energy-part="${k}"]`),open=[...host.querySelectorAll('details')].map(d=>d.open);host.innerHTML=f(y);host.querySelectorAll('details').forEach((d,i)=>{d.open=!!open[i];});}if(clock)paintNow();sync();};
 const update=()=>{const y=last=compute(weather,state);paint(y);for(const [k,f] of Object.entries(charts))drawn[k]?.update(f(y));};
 // Moves the sun of the 3D view to the chosen hour; the sample calls it again once its view is ready.
 function sun(){
  if(!clock||!viewer||!last)return;
  const h=moment(),up=h.sun.altitude>0,[m,d]=date();
  viewer.setNight(!up);viewer.setSun(up?sunVector(h.sun):null);
  viewer.label({title:`${clock.label} · ${m}월 ${d}일 ${clockText(state.hour)}`,scene:up?`해 높이 ${n(h.sun.altitude,1)}° · 방위 ${n(h.sun.azimuth)}°`:'해가 진 시간'});
 }
 // The date or hour moved: the year stays as it is, only the hour's numbers, the dot on the sun path and the 3D sun follow.
 const tick=()=>{write(state);paintNow();sync();sky?.update(weatherCharts.sunpath(clock.label,date(),state.hour));sun();};

 async function render(host){
  await loadWeather();
  if(clock&&first?.isConnected&&first.parentNode===host){sun();return;}
  // The year is worked out, then the page gets the thread back before the lesson is written into it.
  const turn=++turns,y=last=compute(weather,state);
  await handBack();if(turn!==turns)return;
  root=host;
  const station=clock?`관측소 ${esc(weather.station)}(북위 ${weather.lat}°, 동경 ${weather.lon}°)`:`관측소 ${esc(weather.station)}`;
  const rows=[...basis.rows(y),...(clock?[['방위',clock.north]]:[]),['날씨',`${esc(weather.source.note)} ${station}, 설계 외기 겨울 ${weather.design.heating996} °C · 여름 ${weather.design.cooling04} °C. <a href="${esc(weather.source.url)}" target="_blank" rel="noopener">${esc(weather.source.name)}</a>`],
   ...(clock?[...(clock.materials?[['재료 값',clock.materials]]:[]),['해의 위치','날짜·경도·표준시로 태양 고도와 방위를 계산합니다. 면이 받는 햇빛은 직달·하늘·지면 반사로 나눠 더합니다.']]:[])];
  host.innerHTML=sections.map((s,i)=>(s.half&&!sections[i-1]?.half?'<div class="energy-pair">':'')+section(s)+(s.half&&!sections[i+1]?.half?'</div>':'')).join('')+
   `<details class="${card} energy-basis${clock?' energy-wide':''}"><summary>계산 가정과 자료</summary><p>${basis.note}</p><dl>${rows.map(([t,v])=>`<div><dt>${t}</dt><dd>${v}</dd></div>`).join('')}</dl></details>`;
  first=host.firstElementChild;drawn={};sky=null;
  paint(y);
  host.oninput=e=>{const k=e.target.dataset?.energyInput;if(!k||!root?.isConnected)return;const c=controls.find(x=>x.k===k);
   if(c){state[k]=c.options?e.target.value:Number(e.target.value);write(state);update();return;}
   if(!clock||!['month','day','hour'].includes(k))return;
   const v=Number(e.target.value);if(Number.isNaN(v)||k==='day'&&(v<1||v>31))return;
   state[k]=v;tick();};
  if(clock)host.onclick=e=>{const b=e.target.closest?.('[data-energy-moment]');if(!b||!root?.isConnected)return;const [m,d,h]=b.dataset.energyMoment.split('-').map(Number);Object.assign(state,{month:m,day:d,hour:h});tick();};
  sun();
  // The charts are drawn one at a time with the page free in between. A control moved meanwhile redraws the ones already there, and the rest are drawn from the numbers of that moment.
  const mine=first,still=async()=>{await handBack();return turn===turns&&mine.isConnected;};
  const draw=(k,spec)=>chart(host.querySelector(`[data-energy-chart="${k}"]`),spec,{bare:true});
  for(const [k,f] of Object.entries(charts)){if(!await still())return;drawn[k]=draw(k,f(last));}
  for(const {chart:k,place:label} of sections)if(k&&!charts[k]&&weatherCharts[k]){if(!await still())return;const made=draw(k,weatherCharts[k](label,clock?date():null,state.hour));if(k==='sunpath'&&clock)sky=made;}
 }
 return {render,sun};
}
