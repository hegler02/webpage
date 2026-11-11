// Weather and energy lesson: one Seoul year moves the sun in 3D and runs the guardhouse heat balance.
// Controls are drawn once; only the result blocks are redrawn, so a slider keeps its focus while it moves.
import {simulate,designLoads,hourAt,sunVector,dayOfYear,monthStart} from './src/energy-engine.mjs';
import {guardhouseBuilding,glazings,heaters,freshEnergy,assumptions,site,wallLayers} from './src/guardhouse-energy.mjs';
import {render as chart,sunAt} from '/pages/profile/site/charts/mirinae-charts.js';

const KEY='guardhouse-energy',esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const n=(v,d=0)=>Number(v).toLocaleString('ko-KR',{minimumFractionDigits:d,maximumFractionDigits:d});
const DAYS=[31,28,31,30,31,30,31,31,30,31,30,31],FACE={S:'남',E:'동',W:'서',N:'북'};
// Electricity by use, each with its fixed chart slot; solar is drawn as a line in slot 7.
const SERIES=[['heatElec','난방','slot2'],['coolElec','냉방','slot1'],['light','조명','slot4'],['equip','업무 기기','slot3']];
const MOMENTS=[['동지 정오',12,21,12.5],['춘분 해질녘',3,20,18.5],['하지 정오',6,21,12.5],['한여름 오후',8,5,15]];
// 이/가 after a Korean word, by whether its last syllable closes with a consonant.
const iGa=w=>{const c=w.charCodeAt(w.length-1)-0xac00;return w+(c>=0&&c<11172&&c%28?'이':'가');};
const clockText=h=>`${String(Math.floor(h)).padStart(2,'0')}:${h%1?'30':'00'}`;
const WIND=['북','북북동','북동','동북동','동','동남동','남동','남남동','남','남남서','남서','서남서','서','서북서','북서','북북서'];
const UNIT={hour:clockText,insulation:v=>v+' mm',pv:v=>n(v,1)+' kW'};

let weather=null,pending=null;
export async function loadWeather(){if(weather)return weather;if(!pending)pending=fetch('/pages/guardhouse-classroom/runtime/weather-seoul.json',{signal:AbortSignal.timeout(20000)}).then(r=>{if(!r.ok)throw new Error('날씨 자료를 읽지 못했습니다.');return r.json();}).then(w=>weather=w).catch(e=>{pending=null;throw e;});return pending;}

export class EnergyLesson{
 constructor({model,project,viewer,finish,labels}){this.model=model;this.project=project;this.viewer=viewer;this.finish=finish;this.labels=labels;this.state=freshEnergy();try{Object.assign(this.state,JSON.parse(localStorage.getItem(KEY)??'{}'));}catch{}this.key='';}
 save(){try{localStorage.setItem(KEY,JSON.stringify(this.state));}catch{}}
 building(){return guardhouseBuilding(this.model,this.project,this.state,this.finish);}
 // The year only reruns when the building changes, not when the clock moves.
 year(){const b=this.building(),k=JSON.stringify([this.state.glass,this.state.insulation,this.state.heater,this.state.pv,this.finish]);if(k!==this.key){this.key=k;this.result=simulate(weather,b);this.loads=designLoads(weather,b,this.result);}return {b,r:this.result,d:this.loads};}
 date(){const s=this.state;return [s.month,Math.min(s.day,DAYS[s.month-1])];}
 moment(){const [m,d]=this.date();return hourAt(weather,this.building(),dayOfYear(m,d),this.state.hour);}
 sun(){const h=this.moment(),up=h.sun.altitude>0,[m,d]=this.date();this.viewer.setNight(!up);this.viewer.setSun(up?sunVector(h.sun):null);
  this.labels.view.textContent=`${site.label} · ${m}월 ${d}일 ${clockText(this.state.hour)}`;this.labels.scene.textContent=up?`해 높이 ${n(h.sun.altitude,1)}° · 방위 ${n(h.sun.azimuth)}°`:'해가 진 시간';this.labels.render.textContent='햇빛 계산';}
 render(root){this.root=root;const s=this.state,{b}=this.year();
  root.innerHTML=`<div class="content-grid energy-grid">
  <article class="card"><h2>${site.label}의 하루와 햇빛</h2><p>날짜와 시간을 바꾸면 3D의 해와 그림자가 실제 ${site.label}의 위치로 움직입니다.</p>
   <div class="energy-controls"><label>월<select data-energy-input="month">${DAYS.map((_,i)=>`<option value="${i+1}">${i+1}월</option>`).join('')}</select></label><label>일<input data-energy-input="day" type="number" min="1" max="31"></label>${slider('hour','시각',0,23.5,.5)}</div>
   <div class="button-row">${MOMENTS.map(([t,m,d,h])=>`<button data-energy-moment="${m}-${d}-${h}">${t}</button>`).join('')}</div><div data-energy-part="now"></div></article>
  <article class="card"><h2>열은 어디로 빠져나갈까요?</h2><p>안팎 온도가 1 °C 다를 때 빠지는 열(W/K)입니다. 면적 × 열관류율(U)로 구합니다.</p>
   <div class="energy-controls"><label>유리<select data-energy-input="glass">${Object.entries(glazings).map(([k,g])=>`<option value="${k}">${g.name} · U ${n(g.u,1)}</option>`).join('')}</select></label>${slider('insulation','외벽 단열재',0,200,10)}</div><div data-energy-part="envelope"></div></article>
  <article class="card energy-wide"><h2>${site.label}의 1년, 시간마다 기온</h2><p>가로는 날짜, 세로는 하루의 시각입니다. 1년 8,760시간을 한 장에 담았습니다.</p><div data-energy-chart="climate"></div></article>
  <article class="card"><h2>태양 궤적도</h2><p>위에서 내려다본 하늘입니다. 고리는 해의 높이, 선은 매달 21일 해가 지나는 길입니다. 노란 점이 고른 날짜와 시각의 해입니다.</p><div data-energy-chart="sunpath"></div></article>
  <article class="card"><h2>바람장미</h2><p>바람이 불어오는 방향별로 1년 중 몇 %의 시간이었는지 보여 줍니다. 창과 환기구를 어디에 낼지 정할 때 봅니다.</p><div data-energy-chart="windrose"></div></article>
  <article class="card energy-wide"><h2>습공기 선도</h2><p>1년 8,760시간의 온도와 습도를 한 장에 찍었습니다. 노란 틀 밖의 시간은 냉방·난방·제습이 필요한 시간입니다.</p><div data-energy-chart="psychro"></div></article>
  <article class="card energy-wide"><h2>1년 전기 사용과 지붕 태양광</h2><p>${site.label}의 8,760시간 날씨로 시간마다 난방·냉방에 필요한 열을 구하고 전기로 바꿨습니다.</p>
   <div class="energy-controls"><label>난방 방식<select data-energy-input="heater">${Object.entries(heaters).map(([k,h])=>`<option value="${k}">${h.name}</option>`).join('')}</select></label>${slider('pv','지붕 태양광',0,b.maxPv,.5)}</div><div data-energy-part="yearly"></div><div data-energy-chart="monthly"></div></article>
  <article class="card energy-wide"><h2>부하 지속 곡선</h2><p>1년 8,760시간의 전력을 큰 것부터 늘어놓았습니다. 왼쪽 끝이 차단기와 수전 용량을 정하고, 곡선 아래 넓이가 1년 전기량입니다.</p><div data-energy-chart="duration"></div></article>
  <article class="card"><h2>전기설계로 이어 보기</h2><p>건물이 잃고 얻는 열이 냉난방기의 크기와 회로를 정합니다.</p><div data-energy-part="electric"></div></article>
  </div>${this.basis()}`;
  if(s.pv>b.maxPv)s.pv=b.maxPv;
  // Charts come from the shared mirinae-charts engine and live inside these cards.
  this.charts={climate:chart(root.querySelector('[data-energy-chart="climate"]'),this.climateSpec(),{bare:true}),monthly:chart(root.querySelector('[data-energy-chart="monthly"]'),this.monthlySpec(),{bare:true}),sunpath:chart(root.querySelector('[data-energy-chart="sunpath"]'),this.sunpathSpec(),{bare:true}),windrose:chart(root.querySelector('[data-energy-chart="windrose"]'),this.windroseSpec(),{bare:true}),psychro:chart(root.querySelector('[data-energy-chart="psychro"]'),this.psychroSpec(),{bare:true}),duration:chart(root.querySelector('[data-energy-chart="duration"]'),this.durationSpec(),{bare:true})};
  this.sync();this.bind();this.update(true);}
 climateSpec(){const rows=Array.from({length:24},(_,h)=>`${h}시`),cols=Array.from({length:365},(_,d)=>{const m=monthStart.findLastIndex(x=>x<=d);return `${m+1}월 ${d-monthStart[m]+1}일`;}),values=rows.map((_,h)=>cols.map((_,d)=>weather.t[d*24+h]/10)),flat=weather.t.map(v=>v/10),lo=Math.min(...flat),hi=Math.max(...flat);
  return {type:'heatmap',unit:'°C',takeaway:`가장 추운 시간과 가장 더운 시간의 차이가 ${n(hi-lo,1)} °C입니다.`,source:`${site.label} 관측소 표준 기상년(TMYx ${(/TMYx\.(\d{4}-\d{4})/.exec(weather.source.name)??[])[1]?.replace('-','–')??''}) · climate.onebuilding.org`,options:{matrix:{rows,cols,values},mid:15,cellHeight:9,xTicks:monthStart.map((d,m)=>({at:d+14,label:`${m+1}월`})),tableNote:'8,760칸은 표 대신 차트에서 눌러 읽습니다.'}};}
 sunpathSpec(){const [m,d]=this.date(),site_={lat:weather.lat,lon:weather.lon,tz:weather.tz},noon=day=>sunAt(day,12+(135-weather.lon)/15,site_).altitude;
  return {type:'sunpath',takeaway:`하지 정오의 해는 ${n(noon(172))}°, 동지 정오의 해는 ${n(noon(355))}° 높이입니다.`,options:{...site_,now:{day:dayOfYear(m,d),hour:this.state.hour,label:`${m}월 ${d}일 ${clockText(this.state.hour)}`}}};}
 windroseSpec(){const speed=weather.wind.map(v=>v/10),bins=Array(16).fill(0);weather.wdir.forEach((d,i)=>{if(speed[i]>=.5)bins[Math.round(d/22.5)%16]++;});const order=bins.map((v,i)=>i).sort((a,b)=>bins[b]-bins[a]),name=i=>WIND[i];
  return {type:'windrose',takeaway:`${name(order[0])}풍이 가장 잦고, ${name(order[1])}풍이 그다음입니다.`,options:{dir:weather.wdir,speed}};}
 psychroSpec(){const t=weather.t.map(v=>v/10),c={tmin:20,tmax:26,rhmin:30,rhmax:60,label:'쾌적 범위(학습용 단순화)'},p=101.325*(1-2.25577e-5*weather.elevation)**5.25588,inside=t.filter((x,i)=>x>=c.tmin&&x<=c.tmax&&weather.rh[i]>=c.rhmin&&weather.rh[i]<=c.rhmax).length;
  return {type:'psychro',takeaway:`1년 중 쾌적 범위에 드는 시간은 ${n(inside/t.length*100)} %입니다.`,options:{t,rh:weather.rh,comfort:c,pressure:p}};}
 durationSpec(){const {b,r}=this.year(),kw=Array.from(r.hourly,v=>v/1000),sorted=[...kw].sort((a,b)=>b-a),brk=b.circuits.find(c=>c.id===b.ac.circuit)?.breaker??16;
  return {type:'loadduration',unit:'kW',labels:{value:'전력'},takeaway:`가장 큰 전력은 ${n(sorted[0],2)} kW이고, 1년의 절반은 ${n(sorted[Math.floor(sorted.length/2)],2)} kW보다 적게 씁니다.`,options:{values:kw,refs:[{value:brk*b.voltage/1000,label:`${brk} A 회로 하나`}]}};}
 monthlySpec(){const {r}=this.year(),use=Object.fromEntries(SERIES.map(([k])=>[k,r.year[k]])),top=SERIES.reduce((a,c)=>use[c[0]]>use[a[0]]?c:a),total=Object.values(use).reduce((a,v)=>a+v,0);
  return {type:'bar',unit:'kWh',data:r.months.map((o,i)=>({month:`${i+1}월`,...Object.fromEntries(SERIES.map(([k])=>[k,Math.round(o[k])])),pv:Math.round(o.pv)})),encoding:{x:'month',y:SERIES.map(([k])=>k)},labels:Object.fromEntries(SERIES.map(([k,t])=>[k,t])),
   takeaway:total?`${iGa(top[1])} 1년 전기의 ${n(use[top[0]]/total*100)} %를 씁니다.`:'',options:{stack:true,labels:'none',colors:Object.fromEntries(SERIES.map(([k,,c])=>[k,c])),...(r.year.pv>0?{overlay:{y:'pv',label:'태양광 발전',color:'var(--mc-s7)'}}:{})}};}
 sync(){const s=this.state,[m,d]=this.date();for(const el of this.root.querySelectorAll('[data-energy-input]')){const k=el.dataset.energyInput;el.value=k==='day'?d:k==='month'?m:s[k];if(k==='day')el.max=DAYS[m-1];if(UNIT[k])el.previousElementSibling.textContent=UNIT[k](s[k]);}
  for(const b of this.root.querySelectorAll('[data-energy-moment]')){const [mm,dd,hh]=b.dataset.energyMoment.split('-').map(Number);b.setAttribute('aria-pressed',String(mm===m&&dd===d&&hh===s.hour));}}
 update(all){const parts=all?['now','envelope','yearly','electric']:['now'];for(const p of parts){const el=this.root.querySelector(`[data-energy-part="${p}"]`);if(el)el.innerHTML=this[p]();}if(all){this.charts?.monthly.update(this.monthlySpec());this.charts?.duration.update(this.durationSpec());}this.charts?.sunpath.update(this.sunpathSpec());this.sun();}
 bind(){this.root.oninput=e=>{const el=e.target.closest('[data-energy-input]');if(!el)return;const k=el.dataset.energyInput,v=['glass','heater'].includes(k)?el.value:Number(el.value);if(typeof v==='number'&&(Number.isNaN(v)||k==='day'&&(v<1||v>31)))return;
   this.state[k]=v;this.save();this.sync();this.update(!['month','day','hour'].includes(k));};}
 jump(value){const [m,d,h]=value.split('-').map(Number);Object.assign(this.state,{month:m,day:d,hour:h});this.save();this.sync();this.update(false);}
 setFinish(finish){this.finish=finish;}

 now(){const h=this.moment(),{b}=this.year(),loss=(b.surfaces.reduce((a,x)=>a+x.area*x.u*(x.b??1),0)+.34*b.ach*b.volume)*(b.heatSet-h.tout),sunIn=b.surfaces.filter(x=>x.g).reduce((a,x)=>a+x.area*b.glassShare*x.g*h.faces[x.facing],0);
  return `<dl class="energy-facts"><div><dt>기온</dt><dd>${n(h.tout,1)} °C</dd></div><div><dt>습도</dt><dd>${h.rh} %</dd></div><div><dt>바람</dt><dd>${n(h.wind,1)} m/s</dd></div><div><dt>해 높이</dt><dd>${h.sun.altitude>0?n(h.sun.altitude,1)+'°':'해 없음'}</dd></div></dl>
  <div class="energy-faces" aria-label="면마다 받는 햇빛 W/m²">${['S','E','W','N'].map(f=>`<div><span>${FACE[f]}쪽 벽</span><strong>${n(h.faces[f])}</strong><small>W/m²</small></div>`).join('')}<div><span>지붕</span><strong>${n(h.roof)}</strong><small>W/m²</small></div></div>
  <p class="energy-balance">실내를 20 °C로 두면 지금 벽·창·바닥·틈새로 <strong>${n(Math.abs(loss))} W</strong>의 열이 ${loss<0?'들어오고':'빠져나가고'}, 창으로 햇빛 열 <strong>${n(sunIn)} W</strong>가 들어옵니다.</p>`;}

 envelope(){const s=this.state,{b}=this.year(),groups=[['window','창·채광창'],['door','출입문'],['wall','외벽'],['roof','지붕'],['floor','바닥']];
  const rows=groups.map(([k,name])=>{const xs=b.surfaces.filter(x=>x.kind===k),A=xs.reduce((a,x)=>a+x.area,0),H=xs.reduce((a,x)=>a+x.area*x.u*(x.b??1),0);return {name,A,U:H/A/(xs[0].b??1),H,b:xs[0].b};});
  rows.push({name:'틈새바람·환기',H:.34*b.ach*b.volume});const total=rows.reduce((a,r)=>a+r.H,0),max=Math.max(...rows.map(r=>r.H)),wl=wallLayers(s,this.finish);
  return `<div class="table-scroll"><table class="energy-table"><thead><tr><th>부위</th><th>면적 m²</th><th>U W/m²K</th><th>W/K</th><th>비율</th></tr></thead><tbody>${rows.map(r=>`<tr><th>${r.name}</th><td>${r.A?n(r.A,1):'—'}</td><td>${r.U?n(r.U,2)+(r.b?' × '+r.b:''):'—'}</td><td>${n(r.H,1)}</td><td><span class="energy-share"><i style="width:${r.H/max*100}%"></i></span>${n(r.H/total*100)} %</td></tr>`).join('')}</tbody><tfoot><tr><th>합계</th><td></td><td></td><td>${n(total,1)}</td><td></td></tr></tfoot></table></div>
  <details><summary>외벽 U = ${n(b.layers.wall.u,3)} W/m²K 계산 보기</summary><p class="energy-formula">U = 1 ÷ (실내 표면 0.13 + ${wl.map(l=>`${l.name} ${l.thickness / 1000}÷${l.lambda}`).join(' + ')} + 실외 표면 0.04) = 1 ÷ ${n(b.layers.wall.total,3)}</p><p class="small">두께는 m, 열전도율은 W/mK입니다. 지붕 U ${n(b.layers.roof.u,3)}, 바닥 U ${n(b.layers.floor.u,3)}. ${glazings[s.glass].note}</p></details>`;}

 yearly(){const s=this.state,{b,r}=this.year(),use=r.year.heatElec+r.year.coolElec+r.year.light+r.year.equip;
  return `<dl class="energy-facts"><div><dt>1년 전기 사용</dt><dd>${n(use)} kWh</dd></div><div><dt>태양광 발전</dt><dd>${n(r.year.pv)} kWh</dd></div><div><dt>발전 ÷ 사용</dt><dd>${n(use?r.year.pv/use*100:0)} %</dd></div><div><dt>1 kW당 1년 발전</dt><dd>${n(r.pvYield)} kWh</dd></div></dl>
  <p class="small">${heaters[s.heater].note} 지붕 빈 면적 ${n(b.roofFree,1)} m²에 1 kW당 약 6 m²(경사 패널과 그늘 간격 포함)로 최대 ${n(b.maxPv,1)} kW까지 놓습니다.</p>`;}

 electric(){const {b,r,d}=this.year(),ac=b.ac,acCap=ac.watts*b.coolCop,heatW=d.heat/b.heatCop,amps=heatW/b.voltage,brk=b.circuits.find(c=>c.id===ac.circuit)?.breaker??16;
  const at=i=>{const day=Math.floor(i/24)+1,m=monthStart.findLastIndex(x=>x<day);return `${m+1}월 ${day-monthStart[m]}일 ${i%24+1}시`;};
  return `<ul class="energy-checks"><li class="${r.peak.cool<=acCap?'is-ok':'is-short'}"><strong>냉방 ${r.peak.cool<=acCap?'충분':'부족'}</strong>가장 더운 시간(${at(r.peakAt.cool)})에 ${n(r.peak.cool/1000,2)} kW의 열을 빼야 합니다. ${esc(ac.name)}(${ac.watts} W)는 약 ${n(acCap/1000,1)} kW를 옮깁니다.</li>
  <li class="${amps<=brk?'is-ok':'is-short'}"><strong>난방 ${amps<=brk?'회로 하나로 가능':'전용 회로 필요'}</strong>바깥 ${n(d.heatOut,1)} °C에서 ${n(d.heat/1000,2)} kW의 열이 필요합니다. ${heaters[this.state.heater].name}는 전기 ${n(heatW/1000,2)} kW, ${b.voltage} V에서 ${n(amps,1)} A로 ${brk} A 차단기 ${amps<=brk?'안에 들어갑니다':'를 넘습니다'}. 지금 회로표에는 난방 회로가 없습니다.</li>
  <li><strong>최대 전력</strong>1년 중 전기를 가장 많이 쓰는 시간은 ${at(r.peakAt.elec)}, ${n(r.peak.elec/1000,2)} kW입니다.</li></ul>
  <div class="button-row"><button data-ref="E-103">분전반 회로도</button><button data-select-calc="${ac.id}">${esc(ac.name)} 찾기</button></div>`;}

 basis(){return `<details class="card energy-basis"><summary>계산 가정과 자료</summary><p>시간마다 열이 드나드는 양만 따지는 학습용 추정입니다. 에너지효율등급 인증이나 에너지절약계획서에 쓰는 계산이 아닙니다.</p><dl>${assumptions.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}<div><dt>방위</dt><dd>${site.north}</dd></div><div><dt>날씨</dt><dd>${esc(weather.source.note)} 관측소 ${esc(weather.station)}(북위 ${weather.lat}°, 동경 ${weather.lon}°), 설계 외기 겨울 ${weather.design.heating996} °C · 여름 ${weather.design.cooling04} °C. <a href="${esc(weather.source.url)}" target="_blank" rel="noopener">${esc(weather.source.name)}</a></dd></div><div><dt>재료 값</dt><dd>표면 열저항은 ISO 6946, 열전도율은 ISO 10456 계열의 대표값입니다. 콘크리트 2.3, 미네랄울 0.035, 석고보드 0.25 W/mK. 창의 U와 일사 투과율은 유리 종류별 대표값입니다.</dd></div><div><dt>해의 위치</dt><dd>날짜·경도·표준시로 태양 고도와 방위를 계산합니다. 면이 받는 햇빛은 직달·하늘·지면 반사로 나눠 더합니다.</dd></div></dl></details>`;}
}

const slider=(k,label,min,max,step)=>`<label class="energy-range">${label} <output></output><input data-energy-input="${k}" type="range" min="${min}" max="${max}" step="${step}"></label>`;
