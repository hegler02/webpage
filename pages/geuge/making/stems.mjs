// Four small multiples on one shared 0..1 scale and one time axis, from the separated stems.
const NS='http://www.w3.org/2000/svg';
const ROWS=[['drums','드럼'],['bass','베이스'],['guitar','기타'],['vocals','보컬']];
const clock=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const $=id=>document.getElementById(id);
const [data,film]=await Promise.all([fetch('stems.json').then(r=>r.json()),fetch('../data/film.json').then(r=>r.json())]);
const n=data.drums.length,W=1000,H=100;
const lines=[];

function area(values){
 let d=`M0 ${H}`;
 values.forEach((v,i)=>{d+=`L${(i/(n-1)*W).toFixed(1)} ${(H-v*H).toFixed(1)}`;});
 return `${d}L${W} ${H}Z`;
}
for(const [key,name] of ROWS){
 const row=document.createElement('div');row.className='stem-row';
 const label=document.createElement('span');label.textContent=name;
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('role','img');svg.setAttribute('aria-label',`${name} 세기, 곡 전체. 표로도 볼 수 있습니다.`);
 const path=document.createElementNS(NS,'path');path.setAttribute('d',area(data[key]));
 const line=document.createElementNS(NS,'line');line.setAttribute('y1',0);line.setAttribute('y2',H);line.style.visibility='hidden';lines.push(line);
 svg.append(path,line);row.append(label,svg);$('stem-rows').append(row);
}
const pct=t=>`${(t/film.duration*100).toFixed(2)}%`;
for(let t=0;t<=film.duration;t+=60){const s=document.createElement('span');s.textContent=clock(t);s.style.left=pct(t);$('axis').append(s);}

function show(t){
 const i=Math.max(0,Math.min(n-1,Math.round(t/data.step))),x=i/(n-1)*W,c=film.chapters.find(c=>t>=c.start&&t<c.end)??film.chapters.at(-1);
 for(const l of lines){l.setAttribute('x1',x);l.setAttribute('x2',x);l.style.visibility='visible';}
 $('readout').textContent=`${clock(t)} ${c.music} · `+ROWS.map(([k,name])=>`${name} ${Math.round(data[k][i]*100)}`).join(' · ');
}
const box=$('stem-rows');
box.addEventListener('pointermove',e=>{const svg=box.querySelector('svg').getBoundingClientRect();show(Math.max(0,Math.min(1,(e.clientX-svg.left)/svg.width))*film.duration);});

const table=$('stem-table');
table.innerHTML=`<thead><tr><th scope="col">구간</th>${ROWS.map(([,name])=>`<th scope="col">${name}</th>`).join('')}</tr></thead>`;
const body=document.createElement('tbody');
for(const c of film.chapters){
 const a=Math.round(c.start/data.step),b=Math.max(a+1,Math.round(c.end/data.step));
 const cells=ROWS.map(([k])=>{const part=data[k].slice(a,b);return `<td>${Math.round(part.reduce((s,v)=>s+v,0)/part.length*100)}</td>`;}).join('');
 const tr=document.createElement('tr');tr.innerHTML=`<th scope="row">${clock(c.start)} ${c.music}</th>${cells}`;body.append(tr);
}
table.append(body);
