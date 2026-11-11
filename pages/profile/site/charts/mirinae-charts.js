// mirinae-charts: one data spec drawn as a precise chart card. Pure SVG and canvas, no dependencies.
// Colours come only from --mc-* CSS variables, which each project maps to its own design tokens (see mirinae-charts.css).
// Card ideas (one accent, a bold one-line takeaway) follow ztd-charts by Junhan2, MIT; the code here is our own.
export const VERSION='0.1.0';
const NS='http://www.w3.org/2000/svg';
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// ---------- numbers ----------
function formatter(locale){
 const plain=new Map(),compact=new Intl.NumberFormat(locale,{notation:'compact',maximumFractionDigits:1});
 const f=(v,d)=>{if(v==null||Number.isNaN(v))return '—';const k=d??(Math.abs(v)>=100?0:Math.abs(v)>=10?1:2);if(!plain.has(k))plain.set(k,new Intl.NumberFormat(locale,{maximumFractionDigits:k,minimumFractionDigits:0}));return plain.get(k).format(v);};
 f.axis=v=>Math.abs(v)>=10000?compact.format(v):f(v);
 return f;
}
function niceTicks(min,max,count=5){
 if(min===max){max=min+1;}
 const span=max-min,raw=span/count,p=10**Math.floor(Math.log10(raw)),s=[1,2,2.5,5,10].find(m=>m*p>=raw)*p;
 const lo=Math.floor(min/s)*s,hi=Math.ceil(max/s)*s,ticks=[];for(let v=lo;v<=hi+s/2;v+=s)ticks.push(+v.toFixed(10));
 return {lo,hi,ticks,step:s};
}

// ---------- text measuring, so labels can be thinned before they collide ----------
let measureCtx=null;
function measure(text,size=12,weight=400,family='sans-serif'){measureCtx??=document.createElement('canvas').getContext('2d');measureCtx.font=`${weight} ${size}px ${family}`;return measureCtx.measureText(String(text)).width;}

// ---------- colour helpers (OKLab mixing for heatmaps) ----------
const hexRgb=h=>{h=h.trim().replace('#','');if(h.length===3)h=[...h].map(c=>c+c).join('');const n=parseInt(h.slice(0,6),16);return [(n>>16)&255,(n>>8)&255,n&255];};
const lin=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;},unlin=c=>{c=c<=.0031308?12.92*c:1.055*c**(1/2.4)-.055;return clamp(Math.round(c*255),0,255);};
function toLab(hex){const [r,g,b]=hexRgb(hex).map(lin),l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];}
function fromLab([L,A,B]){const l=(L+.3963377774*A+.2158037573*B)**3,m=(L-.1055613458*A-.0638541728*B)**3,s=(L-.0894841775*A-1.291485548*B)**3;return [4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s].map(unlin);}
function ramp(stops){const labs=stops.map(toLab);return t=>{t=clamp(t,0,1)*(labs.length-1);const i=Math.min(labs.length-2,Math.floor(t)),u=t-i,a=labs[i],b=labs[i+1];return fromLab(a.map((v,k)=>v+(b[k]-v)*u));};}

// ---------- the card ----------
export function render(host,spec,options={}){return new Card(host,spec,options);}

class Card{
 constructor(host,spec,options){
  this.host=host;this.options=options;this.el=document.createElement('figure');this.el.className='mc-card';host.replaceChildren(this.el);
  this.ro=new ResizeObserver(()=>{if(this.plot&&this.plot.clientWidth!==this.width)this.draw();});
  this.update(spec);
 }
 update(spec){
  this.spec=spec;const o=spec.options??{},bare=this.options.bare??o.bare;
  this.fmt=formatter(o.locale??'ko-KR');this.el.dataset.mcType=spec.type;this.el.classList.toggle('mc-bare',!!bare);
  const head=bare?'':`<figcaption class="mc-head"><div class="mc-titles">${spec.title?`<strong class="mc-title">${esc(spec.title)}</strong>`:''}${spec.subtitle?`<span class="mc-sub">${esc(spec.subtitle)}</span>`:''}</div><div class="mc-legend"></div></figcaption>`;
  this.el.innerHTML=`${head}${bare?'<div class="mc-legend mc-legend-bare"></div>':''}<div class="mc-plot"><div class="mc-tip" role="status" hidden></div></div>${spec.takeaway?`<p class="mc-takeaway">${esc(spec.takeaway)}</p>`:''}<details class="mc-table"><summary>${esc(o.tableLabel??'숫자로 보기')}</summary><div class="mc-table-scroll"></div></details>${spec.source?`<p class="mc-source">${esc(spec.source)}</p>`:''}`;
  this.plot=this.el.querySelector('.mc-plot');this.tip=this.el.querySelector('.mc-tip');
  this.ro.disconnect();this.ro.observe(this.plot);this.draw();return this;
 }
 destroy(){this.ro.disconnect();this.host.replaceChildren();}
 css(name,fallback=''){return getComputedStyle(this.el).getPropertyValue(name).trim()||fallback;}
 draw(){
  const form=FORMS[this.spec.type];if(!form)throw new Error('mirinae-charts: unknown type '+this.spec.type);
  this.width=this.plot.clientWidth||600;const family=getComputedStyle(this.el).fontFamily;
  const ctx={spec:this.spec,o:this.spec.options??{},W:this.width,fmt:this.fmt,card:this,family,text:(t,s=12,w=400)=>measure(t,s,w,family)};
  const out=form(ctx);this.H=out.height;
  this.plot.querySelectorAll('svg,canvas').forEach(n=>n.remove());
  if(out.canvas)this.plot.prepend(out.canvas);
  this.plot.insertAdjacentHTML('afterbegin',`<svg class="mc-svg" width="${this.width}" height="${out.height}" viewBox="0 0 ${this.width} ${out.height}" role="img" aria-label="${esc(this.spec.ariaLabel??this.spec.title??this.spec.type)}">${out.svg}</svg>`);
  this.svg=this.plot.querySelector('svg');this.pick=out.pick;
  const legend=this.el.querySelector('.mc-legend');legend.innerHTML=(out.legend??[]).map(l=>`<span class="mc-key"><i class="mc-swatch${l.line?' is-line':''}${l.ramp?' is-ramp':''}" style="--c:${l.color}"></i>${esc(l.label)}</span>`).join('');legend.hidden=!out.legend?.length;
  this.el.querySelector('.mc-table-scroll').innerHTML=out.table??'';
  this.bindHits();this.el.dataset.mcReady='true';
 }
 // Every mark that can be read carries data-tip; the same tip follows the pointer, focus and arrow keys.
 bindHits(){
  const svg=this.svg,hits=[...svg.querySelectorAll('[data-tip]')];
  const show=(html,x,y)=>{this.tip.innerHTML=html;this.tip.hidden=false;const w=this.tip.offsetWidth,h=this.tip.offsetHeight;this.tip.style.left=clamp(x-w/2,0,this.width-w)+'px';this.tip.style.top=(y-h-12<0?y+16:y-h-12)+'px';};
  const hide=()=>{this.tip.hidden=true;svg.querySelectorAll('.is-on').forEach(n=>n.classList.remove('is-on'));};
  const on=n=>{svg.querySelectorAll('.is-on').forEach(m=>m.classList.remove('is-on'));n.classList.add('is-on');const g=n.dataset.group;if(g)svg.querySelectorAll(`[data-mark="${g}"]`).forEach(m=>m.classList.add('is-on'));};
  svg.onpointermove=e=>{const r=svg.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,n=e.target.closest?.('[data-tip]');
   if(n){on(n);show(n.dataset.tip,x,y);return;}
   const p=this.pick?.(x,y);if(p){show(p,x,y);return;}hide();};
  svg.onpointerleave=hide;
  hits.forEach((n,i)=>{n.setAttribute('tabindex','0');n.setAttribute('role','img');n.setAttribute('aria-label',n.dataset.tip.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
   n.onfocus=()=>{const b=n.getBBox();on(n);show(n.dataset.tip,b.x+b.width/2,b.y);};n.onblur=hide;
   n.onkeydown=e=>{const d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(d){e.preventDefault();hits[clamp(i+d,0,hits.length-1)].focus();}};});
 }
}

// ---------- shared pieces ----------
function inkOn(card,fill){const m=/var\((--[\w-]+)\)/.exec(fill),hex=m?card.css(m[1]):fill;if(!/^#/.test(hex))return 'var(--mc-text)';const [r,g,b]=hexRgb(hex).map(lin),y=.2126*r+.7152*g+.0722*b;return y>.22?'#14171b':'#f4f6f8';}
const keysOf=v=>Array.isArray(v)?v:v==null?[]:[v];
// One accent for the highlighted key; the rest stay neutral. Without a highlight, the categorical slots in fixed order.
function colorFor(o,keys){
 const named=o.colors??{},neutral=['var(--mc-neutral)','var(--mc-neutral-2)','var(--mc-neutral-3)'];let n=0;
 return Object.fromEntries(keys.map((k,i)=>{const c=named[k];if(c)return [k,/^slot(\d)$/.test(c)?`var(--mc-s${c.slice(4)})`:c];if(o.highlight!=null)return [k,k===o.highlight?'var(--mc-accent)':neutral[n++%3]];return [k,`var(--mc-s${i%8+1})`];}));
}
function table(head,rows,fmt){return `<table><thead><tr>${head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>i?`<td>${typeof c==='number'?fmt(c):esc(c)}</td>`:`<th>${esc(c)}</th>`).join('')}</tr>`).join('')}</tbody></table>`;}
function yAxis(ctx,sc,L,R,top,bottom){
 return sc.ticks.map(v=>{const y=top+(bottom-top)*(1-(v-sc.lo)/(sc.hi-sc.lo));return `<line class="mc-grid${v===0?' is-zero':''}" x1="${L}" x2="${R}" y1="${y}" y2="${y}"/><text class="mc-tick" x="${L-8}" y="${y+4}" text-anchor="end">${esc(ctx.fmt.axis(v))}</text>`;}).join('');
}
// Category labels along the bottom: every k-th one when they would touch.
function xLabels(ctx,labels,xAt,y,band){
 const widest=Math.max(...labels.map(l=>ctx.text(l,12)))+10,k=Math.max(1,Math.ceil(widest/Math.max(band,1)));
 return labels.map((l,i)=>i%k?'':`<text class="mc-tick" x="${xAt(i)}" y="${y}" text-anchor="middle">${esc(l)}</text>`).join('');
}
const leftPad=(ctx,sc)=>Math.ceil(Math.max(...sc.ticks.map(v=>ctx.text(ctx.fmt.axis(v),12))))+14;
const unit=(ctx,v)=>`${ctx.fmt(v)}${ctx.o.unit??ctx.spec.unit?' '+(ctx.o.unit??ctx.spec.unit):''}`;

// ---------- forms ----------
const FORMS={bar,line,area:c=>line(c,true),waterfall,heatmap,donut,sankey,scatter,dumbbell,slope,bump,treemap,calendar,gauge,candlestick};

function bar(ctx){
 const {spec,o,W}=ctx,x=spec.encoding.x,ys=keysOf(spec.encoding.y),rows=spec.data,stack=!!o.stack&&ys.length>1,colors=colorFor(o,o.highlight!=null&&ys.length===1?rows.map(r=>r[x]):ys);
 if(o.horizontal)return hbar(ctx,x,ys[0],colors);
 const ov=o.overlay,H=o.height??clamp(Math.round(W*.42),200,340),T=14,B=30;
 const tops=rows.map(r=>stack?ys.reduce((a,k)=>a+Math.max(0,r[k]??0),0):Math.max(...ys.map(k=>r[k]??0)));
 const lows=rows.map(r=>stack?ys.reduce((a,k)=>a+Math.min(0,r[k]??0),0):Math.min(...ys.map(k=>r[k]??0)));
 const sc=niceTicks(Math.min(0,...lows),Math.max(...tops,...(ov?rows.map(r=>r[ov.y]??0):[])),o.ticks??4),L=leftPad(ctx,sc),R=W-6,band=(R-L)/rows.length,y=v=>T+(H-T-B)*(1-(v-sc.lo)/(sc.hi-sc.lo));
 const gap=2,inner=band*(o.barWidth??.64),labels=o.labels??(ys.length===1&&rows.length<=12?'all':'none');
 let marks='';
 rows.forEach((r,i)=>{
  const x0=L+i*band+(band-inner)/2,tip=`<strong>${esc(r[x])}</strong>`+ys.map(k=>`<span><i style="--c:${colors[ys.length===1&&o.highlight!=null?r[x]:k]}"></i>${esc(spec.labels?.[k]??k)} ${unit(ctx,r[k]??0)}</span>`).join('')+(ov?`<span><i class="is-line" style="--c:${ov.color??'var(--mc-s7)'}"></i>${esc(ov.label??ov.y)} ${unit(ctx,r[ov.y]??0)}</span>`:'');
  let up=0,down=0,parts='';
  ys.forEach((k,j)=>{const v=r[k]??0;if(!v)return;const c=colors[ys.length===1&&o.highlight!=null?r[x]:k];let a,b,bx=x0,bw=inner;
   if(stack){if(v>=0){a=y(up);b=y(up+v);up+=v;}else{a=y(down+v);b=y(down);down+=v;}}else{bw=(inner-gap*(ys.length-1))/ys.length;bx=x0+j*(bw+gap);a=y(0);b=y(v);if(v<0)[a,b]=[b,a];}
   const h=Math.max(0,Math.abs(a-b)-(stack?gap:0)),top=Math.min(a,b)+(stack&&v>=0?gap:0);
   parts+=`<rect class="mc-mark" data-mark="${i}" x="${bx}" y="${top}" width="${bw}" height="${h}" rx="${Math.min(4,bw/4)}" fill="${c}"/>`;
   if(labels==='all'&&!stack)parts+=`<text class="mc-value" x="${bx+bw/2}" y="${(v>=0?b:a)+(v>=0?-6:14)}" text-anchor="middle">${esc(ctx.fmt(v))}</text>`;});
  if(stack&&labels!=='none')parts+=`<text class="mc-value" x="${x0+inner/2}" y="${y(up)-6}" text-anchor="middle">${esc(ctx.fmt(up))}</text>`;
  marks+=`<g><rect class="mc-hit" data-tip="${esc(tip)}" data-group="${i}" x="${L+i*band}" y="${T}" width="${band}" height="${H-T-B}"/>${parts}</g>`;
 });
 let line='';if(ov){const c=ov.color??'var(--mc-s7)',pts=rows.map((r,i)=>[L+i*band+band/2,y(r[ov.y]??0)]);line=`<polyline class="mc-line" points="${pts.map(p=>p.join(',')).join(' ')}" stroke="${c}"/>`+pts.map(([a,b])=>`<circle class="mc-dot" cx="${a}" cy="${b}" r="4" fill="${c}"/>`).join('');}
 const legend=ys.length>1||ov?[...(ys.length>1?ys.map(k=>({label:spec.labels?.[k]??k,color:colors[k]})):[]),...(ov?[{label:ov.label??ov.y,color:ov.color??'var(--mc-s7)',line:true}]:[])]:[];
 return {height:H,svg:yAxis(ctx,sc,L,R,T,H-B)+marks+line+`<line class="mc-axis" x1="${L}" x2="${R}" y1="${y(0)}" y2="${y(0)}"/>`+xLabels(ctx,rows.map(r=>String(r[x])),i=>L+i*band+band/2,H-10,band),legend,
  table:table([x,...ys.map(k=>spec.labels?.[k]??k),...(ov?[ov.label??ov.y]:[])],rows.map(r=>[r[x],...ys.map(k=>r[k]??0),...(ov?[r[ov.y]??0]:[])]),ctx.fmt)};
}
function hbar(ctx,x,k,colors){
 const {spec,o,W}=ctx,rows=o.sort===false?spec.data:[...spec.data].sort((a,b)=>(b[k]??0)-(a[k]??0)),row=o.rowHeight??30,T=6,H=T+rows.length*row+6;
 const labelW=Math.min(W*.38,Math.max(...rows.map(r=>ctx.text(r[x],13)))+12),valW=Math.max(...rows.map(r=>ctx.text(ctx.fmt(r[k]??0),12,600)))+10,max=Math.max(...rows.map(r=>r[k]??0),0)||1,L=labelW,R=W-valW;
 const marks=rows.map((r,i)=>{const v=r[k]??0,w=(R-L)*Math.max(0,v)/max,yy=T+i*row,c=o.highlight!=null?colors[r[x]]:colors[k];
  return `<g><rect class="mc-hit" data-tip="${esc(`<strong>${esc(r[x])}</strong><span>${unit(ctx,v)}</span>`)}" x="0" y="${yy}" width="${W}" height="${row}"/><text class="mc-label" x="${L-10}" y="${yy+row/2+4}" text-anchor="end">${esc(r[x])}</text><rect class="mc-mark" x="${L}" y="${yy+row*.18}" width="${Math.max(0,w)}" height="${row*.64}" rx="4" fill="${c}"/><text class="mc-value" x="${L+w+6}" y="${yy+row/2+4}">${esc(ctx.fmt(v))}</text></g>`;}).join('');
 return {height:H,svg:marks,table:table([x,spec.labels?.[k]??k],rows.map(r=>[r[x],r[k]??0]),ctx.fmt)};
}

function line(ctx,isArea=false){
 const {spec,o,W}=ctx,x=spec.encoding.x,ys=keysOf(spec.encoding.y),rows=spec.data,stack=isArea&&o.stack!==false&&ys.length>1,colors=colorFor(o,ys);
 const H=o.height??clamp(Math.round(W*.4),200,320),T=14,B=30,acc=rows.map(()=>0);
 const series=ys.map(k=>rows.map((r,i)=>{const v=r[k]??0,base=stack?acc[i]:0;if(stack)acc[i]+=v;return [base,base+v,v];}));
 const all=series.flat(),sc=niceTicks(Math.min(o.zero===false?Infinity:0,...all.map(p=>p[1])),Math.max(...all.map(p=>p[1])),o.ticks??4);
 const endW=ys.length>1&&ys.length<=4?Math.max(...ys.map(k=>ctx.text(spec.labels?.[k]??k,12,600)))+12:8,L=leftPad(ctx,sc),R=W-endW,step=rows.length>1?(R-L)/(rows.length-1):0,X=i=>L+i*step,y=v=>T+(H-T-B)*(1-(v-sc.lo)/(sc.hi-sc.lo));
 let marks='',ends=[];
 // Draw the highlighted series last so it sits on top.
 const order=ys.map((k,j)=>j).sort((a,b)=>(ys[a]===o.highlight)-(ys[b]===o.highlight));
 for(const j of order){const k=ys[j],c=colors[k],pts=series[j].map((p,i)=>[X(i),y(p[1])]),base=series[j].map((p,i)=>[X(i),y(p[0])]);
  if(isArea)marks+=`<path class="mc-area" d="M${pts.map(p=>p.join(',')).join('L')}L${[...base].reverse().map(p=>p.join(',')).join('L')}Z" fill="${c}"/>`;
  marks+=`<polyline class="mc-line${o.highlight!=null&&k!==o.highlight?' is-quiet':''}" points="${pts.map(p=>p.join(',')).join(' ')}" stroke="${c}"/>`;
  const last=pts[pts.length-1];marks+=`<circle class="mc-dot" cx="${last[0]}" cy="${last[1]}" r="4" fill="${c}"/>`;ends.push({k,y:last[1],c});}
 // End labels for up to four series, pushed apart so they never overlap.
 let labels='';if(endW>8){ends.sort((a,b)=>a.y-b.y);for(let i=1;i<ends.length;i++)ends[i].y=Math.max(ends[i].y,ends[i-1].y+15);
  // Keep them above the row of x labels: shift the whole stack up if the lowest one runs into it.
  const over=ends.length?ends[ends.length-1].y-(H-B-8):0;if(over>0)ends.forEach(e=>e.y-=over);labels=ends.map(e=>`<text class="mc-end" x="${R+8}" y="${e.y+4}" fill="${e.c}">${esc(spec.labels?.[e.k]??e.k)}</text>`).join('');}
 const hits=rows.map((r,i)=>{const tip=`<strong>${esc(r[x])}</strong>`+ys.map(k=>`<span><i style="--c:${colors[k]}"></i>${esc(spec.labels?.[k]??k)} ${unit(ctx,r[k]??0)}</span>`).join('');
  return `<g><line class="mc-cross" data-mark="${i}" x1="${X(i)}" x2="${X(i)}" y1="${T}" y2="${H-B}"/><rect class="mc-hit" data-tip="${esc(tip)}" data-group="${i}" x="${X(i)-Math.max(step,8)/2}" y="${T}" width="${Math.max(step,8)}" height="${H-T-B}"/></g>`;}).join('');
 return {height:H,svg:yAxis(ctx,sc,L,R,T,H-B)+marks+labels+xLabels(ctx,rows.map(r=>String(r[x])),X,H-10,step||R-L)+hits,legend:ys.length>1&&endW<=8?ys.map(k=>({label:spec.labels?.[k]??k,color:colors[k]})):[],
  table:table([x,...ys.map(k=>spec.labels?.[k]??k)],rows.map(r=>[r[x],...ys.map(k=>r[k]??0)]),ctx.fmt)};
}

// Rows of {label, value}; rows with total:true are drawn from zero and reset the running sum.
function waterfall(ctx){
 const {spec,o,W}=ctx,lk=spec.encoding?.label??'label',vk=spec.encoding?.value??'value',rows=spec.data,H=o.height??clamp(Math.round(W*.42),220,340),T=22,B=30;
 let run=0;const bars=rows.map(r=>{const v=r[vk]??0;if(r.total){const b={r,a:0,b:v,kind:'total'};run=v;return b;}const b={r,a:run,b:run+v,kind:v>=0?'up':'down'};run+=v;return b;});
 if(o.total){bars.push({r:{[lk]:o.total===true?'합계':o.total,[vk]:run},a:0,b:run,kind:'total'});}
 const sc=niceTicks(Math.min(0,...bars.map(b=>Math.min(b.a,b.b))),Math.max(...bars.map(b=>Math.max(b.a,b.b))),o.ticks??4),L=leftPad(ctx,sc),R=W-6,band=(R-L)/bars.length,y=v=>T+(H-T-B)*(1-(v-sc.lo)/(sc.hi-sc.lo)),inner=band*.62;
 const fill={up:'var(--mc-up)',down:'var(--mc-down)',total:'var(--mc-total)'};
 const marks=bars.map((b,i)=>{const x0=L+i*band+(band-inner)/2,top=y(Math.max(b.a,b.b)),h=Math.max(1,Math.abs(y(b.a)-y(b.b))),v=b.kind==='total'?b.b:b.b-b.a,label=(b.kind==='total'?'':v>=0?'+':'')+ctx.fmt(v);
  const hi=o.highlight!=null&&b.r[lk]===o.highlight,c=hi?'var(--mc-accent)':fill[b.kind];
  const join=i<bars.length-1?`<line class="mc-join" x1="${x0+inner}" x2="${x0+band}" y1="${y(b.b)}" y2="${y(b.b)}"/>`:'';
  return `<g><rect class="mc-hit" data-tip="${esc(`<strong>${esc(b.r[lk])}</strong><span>${b.kind==='total'?'':(v>=0?'+':'')}${unit(ctx,v)}</span>`)}" data-group="${i}" x="${L+i*band}" y="${T}" width="${band}" height="${H-T-B}"/><rect class="mc-mark" data-mark="${i}" x="${x0}" y="${top}" width="${inner}" height="${h}" rx="3" fill="${c}"/>${join}<text class="mc-value${b.kind==='total'||hi?' is-strong':''}" x="${x0+inner/2}" y="${top-7}" text-anchor="middle">${esc(label)}</text></g>`;}).join('');
 return {height:H,svg:yAxis(ctx,sc,L,R,T,H-B)+marks+`<line class="mc-axis" x1="${L}" x2="${R}" y1="${y(0)}" y2="${y(0)}"/>`+xLabels(ctx,bars.map(b=>String(b.r[lk])),i=>L+i*band+band/2,H-10,band),
  legend:o.legend===false?[]:[{label:o.upLabel??'늘어남',color:'var(--mc-up)'},{label:o.downLabel??'줄어듦',color:'var(--mc-down)'},{label:o.totalLabel??'합계',color:'var(--mc-total)'}].filter(l=>bars.some(b=>fill[b.kind]===l.color)),
  table:table([lk,vk],bars.map(b=>[b.r[lk],b.kind==='total'?b.b:b.b-b.a]),ctx.fmt)};
}

// options.matrix {rows, cols, values[row][col]} or long rows with encoding {x, y, value}. Cells are painted on canvas.
function heatmap(ctx){
 const {spec,o,W,card}=ctx;let m=o.matrix;
 if(!m){const x=spec.encoding.x,yk=spec.encoding.y,v=spec.encoding.value,cols=[...new Set(spec.data.map(r=>r[x]))],rows=[...new Set(spec.data.map(r=>r[yk]))],values=rows.map(()=>cols.map(()=>null));spec.data.forEach(r=>{values[rows.indexOf(r[yk])][cols.indexOf(r[x])]=r[v];});m={rows,cols,values};}
 const flat=m.values.flat().filter(v=>v!=null),min=o.min??Math.min(...flat),max=o.max??Math.max(...flat),mid=o.mid;
 const L=Math.ceil(Math.max(...m.rows.map(r=>ctx.text(r,12))))+12,T=6,B=28,R=W-4,cw=(R-L)/m.cols.length,ch=o.cellHeight??clamp(Math.round(cw),8,28),H=T+m.rows.length*ch+B+34;
 const stops=mid!=null?[card.css('--mc-cold','#3987e5'),card.css('--mc-mid','#2a2f36'),card.css('--mc-warm','#d95926')]:[card.css('--mc-seq-low','#1d2a33'),card.css('--mc-seq-high','#7fd3c0')];
 const f=ramp(stops),t=v=>mid!=null?(v<mid?(v-min)/(mid-min)/2:.5+(v-mid)/(max-mid)/2):(v-min)/(max-min||1);
 const dpr=Math.min(2,devicePixelRatio||1),cv=document.createElement('canvas');cv.className='mc-canvas';cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';
 const g=cv.getContext('2d');g.scale(dpr,dpr);
 m.values.forEach((row,i)=>row.forEach((v,j)=>{if(v==null)return;g.fillStyle=`rgb(${f(t(v)).join(',')})`;g.fillRect(L+j*cw,T+i*ch,Math.ceil(cw)-(cw>=4?1:0),ch-(cw>=4&&ch>6?1:0));}));
 const ylab=m.rows.map((r,i)=>i%Math.max(1,Math.ceil(14/ch))?'':`<text class="mc-tick" x="${L-8}" y="${T+i*ch+ch/2+4}" text-anchor="end">${esc(r)}</text>`).join('');
 const ticks=o.xTicks??m.cols.map((c,i)=>({at:i,label:c})),xt=xLabels(ctx,ticks.map(t=>String(t.label)),i=>L+ticks[i].at*cw+cw/2,T+m.rows.length*ch+18,(R-L)/ticks.length);
 // Colour key: a strip with its ends and middle written out.
 const ky=H-14,kw=Math.min(240,W-L-8),kid='mc-k'+Math.random().toString(36).slice(2,7),kx=L;
 const grad=`<defs><linearGradient id="${kid}">${Array.from({length:9},(_,i)=>`<stop offset="${i/8}" stop-color="rgb(${f(i/8).join(',')})"/>`).join('')}</linearGradient></defs><rect x="${kx}" y="${ky-6}" width="${kw}" height="8" rx="2" fill="url(#${kid})"/><text class="mc-tick" x="${kx}" y="${ky-10}">${esc(ctx.fmt(min))}</text>${mid!=null?`<text class="mc-tick" x="${kx+kw/2}" y="${ky-10}" text-anchor="middle">${esc(ctx.fmt(mid))}</text>`:''}<text class="mc-tick" x="${kx+kw}" y="${ky-10}" text-anchor="end">${esc(ctx.fmt(max))}${esc(o.unit??spec.unit?' '+(o.unit??spec.unit):'')}</text>`;
 const pick=(px,py)=>{const j=Math.floor((px-L)/cw),i=Math.floor((py-T)/ch);if(i<0||j<0||i>=m.rows.length||j>=m.cols.length)return null;const v=m.values[i][j];return v==null?null:`<strong>${esc(m.cols[j])} · ${esc(m.rows[i])}</strong><span>${unit(ctx,v)}</span>`;};
 const big=m.rows.length*m.cols.length>400;
 return {height:H,canvas:cv,svg:ylab+xt+grad,pick,legend:[],table:big?`<p class="mc-note">${esc(o.tableNote??`칸 ${ctx.fmt(m.rows.length*m.cols.length)}개는 표 대신 차트에서 눌러 읽습니다.`)}</p>`:table(['',...m.cols],m.rows.map((r,i)=>[r,...m.values[i]]),ctx.fmt)};
}

function donut(ctx){
 const {spec,o,W}=ctx,lk=spec.encoding?.label??'label',vk=spec.encoding?.value??'value',rows=o.sort===false?spec.data:[...spec.data].sort((a,b)=>(b[vk]??0)-(a[vk]??0)),total=rows.reduce((a,r)=>a+(r[vk]??0),0)||1;
 const colors=colorFor(o,rows.map(r=>r[lk])),H=o.height??clamp(Math.round(W*.5),220,320),r0=Math.min(H/2-14,W/4.2),cx=W/2,cy=H/2,ri=r0*(o.inner??.62);
 let a=-Math.PI/2,marks='',labels=[];
 rows.forEach((r,i)=>{const v=r[vk]??0,da=v/total*Math.PI*2,a1=a+da,large=da>Math.PI?1:0,p=(ang,rad)=>[cx+Math.cos(ang)*rad,cy+Math.sin(ang)*rad],gap=Math.min(.012,da/4);
  const [x1,y1]=p(a+gap,r0),[x2,y2]=p(a1-gap,r0),[x3,y3]=p(a1-gap,ri),[x4,y4]=p(a+gap,ri);
  marks+=`<path class="mc-mark" data-tip="${esc(`<strong>${esc(r[lk])}</strong><span>${unit(ctx,v)} · ${ctx.fmt(v/total*100,1)} %</span>`)}" d="M${x1},${y1}A${r0},${r0} 0 ${large} 1 ${x2},${y2}L${x3},${y3}A${ri},${ri} 0 ${large} 0 ${x4},${y4}Z" fill="${colors[r[lk]]}"/>`;
  if(v/total>=(o.labelMin??.05)){const mid=a+da/2,[lx,ly]=p(mid,r0+14),right=Math.cos(mid)>=0;labels.push({x:lx,y:ly,right,text:`${r[lk]} ${ctx.fmt(v/total*100,0)}%`,strong:r[lk]===o.highlight});}
  a=a1;});
 // Side labels pushed apart vertically.
 for(const side of [true,false]){const ls=labels.filter(l=>l.right===side).sort((p,q)=>p.y-q.y);for(let i=1;i<ls.length;i++)ls[i].y=Math.max(ls[i].y,ls[i-1].y+15);}
 const lab=labels.map(l=>`<text class="mc-label${l.strong?' is-strong':''}" x="${l.x+(l.right?4:-4)}" y="${l.y+4}" text-anchor="${l.right?'start':'end'}">${esc(l.text)}</text>`).join('');
 const center=`<text class="mc-center" x="${cx}" y="${cy+2}" text-anchor="middle">${esc(ctx.fmt(total))}</text><text class="mc-tick" x="${cx}" y="${cy+20}" text-anchor="middle">${esc(o.centerLabel??(o.unit??spec.unit??'합계'))}</text>`;
 return {height:H,svg:marks+lab+center,legend:rows.map(r=>({label:r[lk],color:colors[r[lk]]})),table:table([lk,vk,'%'],rows.map(r=>[r[lk],r[vk]??0,(r[vk]??0)/total*100]),ctx.fmt)};
}

// Links {source, target, value}; columns follow the longest path, bands are cubic curves.
function sankey(ctx){
 const {spec,o,W}=ctx,links=spec.data.map(l=>({...l,value:l[spec.encoding?.value??'value']??l.value})),names=[...new Set(links.flatMap(l=>[l.source,l.target]))];
 const depth=Object.fromEntries(names.map(n=>[n,0]));for(let k=0;k<names.length;k++)for(const l of links)depth[l.target]=Math.max(depth[l.target],depth[l.source]+1);
 const cols=Math.max(...Object.values(depth))+1,val=n=>Math.max(links.filter(l=>l.source===n).reduce((a,l)=>a+l.value,0),links.filter(l=>l.target===n).reduce((a,l)=>a+l.value,0));
 const colors=colorFor(o,names),H=o.height??clamp(Math.round(W*.45),240,380),T=Math.max(8,cols>2?24:8),B=8,pad=o.nodePadding??14,nw=o.nodeWidth??12;
 const L=4,R=W-4;
 const byCol=Array.from({length:cols},(_,c)=>names.filter(n=>depth[n]===c)),k=Math.min(...byCol.map(ns=>(H-T-B-pad*(ns.length-1))/ns.reduce((a,n)=>a+val(n),0)));
 const colX=c=>cols===1?L:L+(R-L-nw)*c/(cols-1),node={};
 byCol.forEach((ns,c)=>{let y=T;const used=ns.reduce((a,n)=>a+val(n)*k,0)+pad*(ns.length-1);y+=(H-T-B-used)/2;ns.forEach(n=>{const h=val(n)*k;node[n]={x:colX(c),y,h,out:y,in:y};y+=h+pad;});});
 let bands='';
 for(const l of [...links].sort((a,b)=>node[a.source].y-node[b.source].y||node[a.target].y-node[b.target].y)){
  const s=node[l.source],t=node[l.target],h=l.value*k,x0=s.x+nw,x1=t.x,y0=s.out+h/2,y1=t.in+h/2,mx=(x0+x1)/2;s.out+=h;t.in+=h;
  bands+=`<path class="mc-band" data-tip="${esc(`<strong>${esc(l.source)} → ${esc(l.target)}</strong><span>${unit(ctx,l.value)}</span>`)}" d="M${x0},${y0}C${mx},${y0} ${mx},${y1} ${x1},${y1}" stroke="${colors[o.colorBy==='target'?l.target:l.source]}" stroke-width="${Math.max(1,h)}"/>`;}
 const nodes=names.map(n=>{const d=node[n],last=depth[n]===cols-1,middle=depth[n]>0&&!last;return `<rect class="mc-node" data-tip="${esc(`<strong>${esc(n)}</strong><span>${unit(ctx,val(n))}</span>`)}" x="${d.x}" y="${d.y}" width="${nw}" height="${Math.max(1,d.h)}" rx="2" fill="${colors[n]}"/><text class="mc-label" x="${middle?d.x+nw/2:last?d.x-6:d.x+nw+6}" y="${middle?d.y-8:d.y+d.h/2+4}" text-anchor="${middle?'middle':last?'end':'start'}"><tspan class="is-strong">${esc(n)}</tspan> ${esc(ctx.fmt(val(n)))}</text>`;}).join('');
 return {height:H,svg:bands+nodes,table:table([o.sourceLabel??'출발',o.targetLabel??'도착',spec.labels?.value??'값'],links.map(l=>[l.source,l.target,l.value]),ctx.fmt)};
}

// ---------- second set ----------
// Two numbers per point; an optional size and a highlighted label.
function scatter(ctx){
 const {spec,o,W}=ctx,{x,y,size,label}=spec.encoding,rows=spec.data,H=o.height??clamp(Math.round(W*.5),220,360),T=14,B=34;
 const sy=niceTicks(Math.min(...rows.map(r=>r[y])),Math.max(...rows.map(r=>r[y])),4),sx=niceTicks(Math.min(...rows.map(r=>r[x])),Math.max(...rows.map(r=>r[x])),5),L=leftPad(ctx,sy),R=W-10;
 const X=v=>L+(R-L)*(v-sx.lo)/(sx.hi-sx.lo),Y=v=>T+(H-T-B)*(1-(v-sy.lo)/(sy.hi-sy.lo)),smax=size?Math.max(...rows.map(r=>r[size])):1,name=k=>spec.labels?.[k]??k;
 const xt=sx.ticks.map(v=>`<text class="mc-tick" x="${X(v)}" y="${H-16}" text-anchor="middle">${esc(ctx.fmt.axis(v))}</text>`).join('');
 const dots=[...rows].sort((a,b)=>(a[label]===o.highlight)-(b[label]===o.highlight)).map(r=>{
  const hi=o.highlight!=null&&r[label]===o.highlight,rad=size?4+14*Math.sqrt(r[size]/smax):5,c=o.highlight!=null?(hi?'var(--mc-accent)':'var(--mc-neutral)'):'var(--mc-s1)';
  const tip=`<strong>${esc(r[label]??'')}</strong><span>${esc(name(x))} ${ctx.fmt(r[x])}</span><span>${esc(name(y))} ${ctx.fmt(r[y])}</span>`+(size?`<span>${esc(name(size))} ${ctx.fmt(r[size])}</span>`:'');
  const tag=hi?`<text class="mc-label is-strong" x="${X(r[x])+rad+5}" y="${Y(r[y])+4}">${esc(r[label])}</text>`:'';
  return `<circle class="mc-mark mc-dot" data-tip="${esc(tip)}" cx="${X(r[x])}" cy="${Y(r[y])}" r="${rad}" fill="${c}" fill-opacity="${hi||o.highlight==null?.9:.55}"/>${tag}`;}).join('');
 const names=`<text class="mc-tick" x="${R}" y="${H-1}" text-anchor="end">${esc(name(x))} →</text><text class="mc-tick" x="${L}" y="${T-4}">↑ ${esc(name(y))}</text>`;
 return {height:H,svg:yAxis(ctx,sy,L,R,T,H-B)+xt+names+dots,table:table([label??'',name(x),name(y),...(size?[name(size)]:[])],rows.map(r=>[r[label]??'',r[x],r[y],...(size?[r[size]]:[])]),ctx.fmt)};
}
// Rows with a before and an after; the gap between them is the story.
function dumbbell(ctx){
 const {spec,o,W}=ctx,{label,from,to}=spec.encoding,rows=spec.data,row=o.rowHeight??32,T=24,H=T+rows.length*row+26,all=rows.flatMap(r=>[r[from],r[to]]),sc=niceTicks(Math.min(o.zero===false?Infinity:0,...all),Math.max(...all),4),name=k=>spec.labels?.[k]??k;
 const L=Math.min(W*.34,Math.max(...rows.map(r=>ctx.text(r[label],13)))+14),R=W-12,X=v=>L+(R-L)*(v-sc.lo)/(sc.hi-sc.lo);
 const head=`<circle cx="${L+5}" cy="9" r="4" fill="var(--mc-neutral-3)"/><text class="mc-tick" x="${L+14}" y="13">${esc(name(from))}</text><circle cx="${L+30+ctx.text(name(from),12)}" cy="9" r="5" fill="var(--mc-accent)"/><text class="mc-tick" x="${L+40+ctx.text(name(from),12)}" y="13">${esc(name(to))}</text>`;
 const grid=sc.ticks.map(v=>`<line class="mc-grid" x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${H-24}"/><text class="mc-tick" x="${X(v)}" y="${H-8}" text-anchor="middle">${esc(ctx.fmt.axis(v))}</text>`).join('');
 const marks=rows.map((r,i)=>{const yy=T+i*row+row/2,a=X(r[from]),b=X(r[to]),d=r[to]-r[from];
  const tip=`<strong>${esc(r[label])}</strong><span>${esc(name(from))} ${unit(ctx,r[from])}</span><span>${esc(name(to))} ${unit(ctx,r[to])}</span><span>차이 ${d>=0?'+':''}${ctx.fmt(d)}</span>`;
  return `<g><rect class="mc-hit" data-tip="${esc(tip)}" x="0" y="${yy-row/2}" width="${W}" height="${row}"/><text class="mc-label" x="${L-10}" y="${yy+4}" text-anchor="end">${esc(r[label])}</text><line class="mc-axis" x1="${a}" x2="${b}" y1="${yy}" y2="${yy}" stroke-width="3"/><circle cx="${a}" cy="${yy}" r="5" fill="var(--mc-neutral-3)"/><circle cx="${b}" cy="${yy}" r="6" fill="var(--mc-accent)"/></g>`;}).join('');
 return {height:H,svg:grid+head+marks,table:table([label,name(from),name(to)],rows.map(r=>[r[label],r[from],r[to]]),ctx.fmt)};
}
// Two periods, one line per item; labels on both ends are spread so they never touch.
function slope(ctx){
 const {spec,o,W}=ctx,{label,from,to}=spec.encoding,rows=spec.data,H=o.height??clamp(rows.length*34+40,200,380),T=26,B=12,all=rows.flatMap(r=>[r[from],r[to]]),lo=Math.min(...all),hi=Math.max(...all),name=k=>spec.labels?.[k]??k;
 const lw=Math.max(...rows.map(r=>ctx.text(`${r[label]} ${ctx.fmt(r[from])}`,12,600)))+12,rw=Math.max(...rows.map(r=>ctx.text(`${ctx.fmt(r[to])} ${r[label]}`,12,600)))+12,L=lw,R=W-rw,Y=v=>T+(H-T-B)*(1-(v-lo)/((hi-lo)||1));
 const spread=side=>{const ls=rows.map((r,i)=>({i,y:Y(r[side])})).sort((a,b)=>a.y-b.y);for(let k=1;k<ls.length;k++)ls[k].y=Math.max(ls[k].y,ls[k-1].y+15);const over=ls.length?ls[ls.length-1].y-(H-B):0;if(over>0)ls.forEach(l=>l.y-=over);return Object.fromEntries(ls.map(l=>[l.i,l.y]));};
 const ly=spread(from),ry=spread(to),colors=colorFor(o,rows.map(r=>r[label]));
 const order=rows.map((r,i)=>i).sort((a,b)=>(rows[a][label]===o.highlight)-(rows[b][label]===o.highlight));
 const marks=order.map(i=>{const r=rows[i],c=colors[r[label]],on=r[label]===o.highlight,cls=`mc-label${on?' is-strong':''}`;
  const tip=`<strong>${esc(r[label])}</strong><span>${esc(name(from))} ${unit(ctx,r[from])}</span><span>${esc(name(to))} ${unit(ctx,r[to])}</span>`;
  return `<g><line class="mc-line${o.highlight!=null&&!on?' is-quiet':''}" data-tip="${esc(tip)}" x1="${L}" y1="${Y(r[from])}" x2="${R}" y2="${Y(r[to])}" stroke="${c}" stroke-width="${on?3:2}"/><circle class="mc-dot" cx="${L}" cy="${Y(r[from])}" r="4" fill="${c}"/><circle class="mc-dot" cx="${R}" cy="${Y(r[to])}" r="4" fill="${c}"/><text class="${cls}" x="${L-8}" y="${ly[i]+4}" text-anchor="end">${esc(r[label])} ${esc(ctx.fmt(r[from]))}</text><text class="${cls}" x="${R+8}" y="${ry[i]+4}">${esc(ctx.fmt(r[to]))} ${esc(r[label])}</text></g>`;}).join('');
 const heads=`<text class="mc-tick" x="${L}" y="12" text-anchor="middle">${esc(name(from))}</text><text class="mc-tick" x="${R}" y="12" text-anchor="middle">${esc(name(to))}</text>`;
 return {height:H,svg:heads+marks,table:table([label,name(from),name(to)],rows.map(r=>[r[label],r[from],r[to]]),ctx.fmt)};
}
// Ranks over periods: rows {period, item, rank}. Rank 1 sits on top.
function bump(ctx){
 const {spec,o,W}=ctx,{x,series,rank}=spec.encoding,periods=[...new Set(spec.data.map(r=>r[x]))],items=[...new Set(spec.data.map(r=>r[series]))],n=Math.max(...spec.data.map(r=>r[rank]));
 const H=o.height??clamp(n*36+50,200,400),T=12,B=30,lw=Math.max(...items.map(i=>ctx.text(i,12,600)))+14,L=lw,R=W-lw,X=i=>L+(R-L)*i/Math.max(1,periods.length-1),Y=k=>T+(H-T-B)*(k-1)/Math.max(1,n-1),colors=colorFor(o,items);
 const at=(p,it)=>spec.data.find(d=>d[x]===p&&d[series]===it);
 const order=[...items].sort((a,b)=>(a===o.highlight)-(b===o.highlight));
 const marks=order.map(it=>{const pts=periods.map((p,i)=>{const r=at(p,it);return r?[X(i),Y(r[rank]),r[rank],p]:null;}).filter(Boolean),c=colors[it],on=it===o.highlight,cls=`mc-label${on?' is-strong':''}`;if(!pts.length)return '';
  const dots=pts.map(p=>`<circle class="mc-dot" data-tip="${esc(`<strong>${esc(it)}</strong><span>${esc(p[3])} · ${p[2]}위</span>`)}" cx="${p[0]}" cy="${p[1]}" r="${on?6:5}" fill="${c}"/>`).join('');
  const first=pts[0],last=pts[pts.length-1];
  return `<g><polyline class="mc-line${o.highlight!=null&&!on?' is-quiet':''}" points="${pts.map(p=>p[0]+','+p[1]).join(' ')}" stroke="${c}" stroke-width="${on?3.5:2.5}"/>${dots}<text class="${cls}" x="${first[0]-10}" y="${first[1]+4}" text-anchor="end">${esc(it)}</text><text class="${cls}" x="${last[0]+10}" y="${last[1]+4}">${esc(it)}</text></g>`;}).join('');
 return {height:H,svg:marks+xLabels(ctx,periods.map(String),X,H-8,(R-L)/Math.max(1,periods.length-1)),table:table([series,...periods],items.map(it=>[it,...periods.map(p=>at(p,it)?.[rank]??'—')]),ctx.fmt)};
}
// Squarified treemap of {label, value}.
function treemap(ctx){
 const {spec,o,W}=ctx,lk=spec.encoding?.label??'label',vk=spec.encoding?.value??'value',rows=[...spec.data].filter(r=>r[vk]>0).sort((a,b)=>b[vk]-a[vk]),H=o.height??clamp(Math.round(W*.55),220,380),total=rows.reduce((a,r)=>a+r[vk],0),colors=colorFor(o,rows.map(r=>r[lk]));
 const boxes=[];let rect={x:0,y:0,w:W,h:H},items=rows.map(r=>({r,a:r[vk]/total*W*H}));
 const worst=(row,side)=>{const s=row.reduce((a,i)=>a+i.a,0),mx=Math.max(...row.map(i=>i.a)),mn=Math.min(...row.map(i=>i.a));return Math.max(side*side*mx/(s*s),s*s/(side*side*mn));};
 while(items.length){const side=Math.min(rect.w,rect.h);let row=[items[0]],k=1;while(k<items.length&&worst([...row,items[k]],side)<=worst(row,side)){row.push(items[k]);k++;}items=items.slice(k);const s=row.reduce((a,i)=>a+i.a,0);
  if(rect.w>=rect.h){const w=s/rect.h;let y=rect.y;for(const i of row){const h=i.a/w;boxes.push({r:i.r,x:rect.x,y,w,h});y+=h;}rect={x:rect.x+w,y:rect.y,w:rect.w-w,h:rect.h};}
  else{const h=s/rect.w;let x=rect.x;for(const i of row){const w=i.a/h;boxes.push({r:i.r,x,y:rect.y,w,h});x+=w;}rect={x:rect.x,y:rect.y+h,w:rect.w,h:rect.h-h};}}
 const marks=boxes.map(b=>{const label=String(b.r[lk]),pct=ctx.fmt(b.r[vk]/total*100,1)+'%',fits=b.w>ctx.text(label,13,600)+14&&b.h>40,on=b.r[lk]===o.highlight,ink=inkOn(ctx.card,colors[b.r[lk]]);
  const words=fits?`<text class="mc-on-mark${on?' is-strong':''}" x="${b.x+8}" y="${b.y+20}" style="fill:${ink}">${esc(label)}</text><text class="mc-on-mark is-soft" x="${b.x+8}" y="${b.y+36}" style="fill:${ink}">${esc(pct)}</text>`:'';
  return `<g><rect class="mc-mark" data-tip="${esc(`<strong>${esc(label)}</strong><span>${unit(ctx,b.r[vk])} · ${pct}</span>`)}" x="${b.x+1}" y="${b.y+1}" width="${Math.max(0,b.w-2)}" height="${Math.max(0,b.h-2)}" rx="4" fill="${colors[b.r[lk]]}"/>${words}</g>`;}).join('');
 return {height:H,svg:marks,table:table([lk,vk,'%'],rows.map(r=>[r[lk],r[vk],r[vk]/total*100]),ctx.fmt)};
}
// One square per day, weeks across, weekdays down. Rows {date:'YYYY-MM-DD', value}.
function calendar(ctx){
 const {spec,o}=ctx,dk=spec.encoding?.date??'date',vk=spec.encoding?.value??'value',rows=[...spec.data].sort((a,b)=>a[dk]<b[dk]?-1:1),start=new Date(rows[0][dk]+'T00:00');start.setDate(start.getDate()-start.getDay());
 const wk=d=>Math.floor((new Date(d+'T00:00')-start)/864e5/7),weeks=wk(rows[rows.length-1][dk])+1,days=['일','월','화','수','목','금','토'];
 const values=days.map(()=>Array(weeks).fill(null));for(const r of rows)values[new Date(r[dk]+'T00:00').getDay()][wk(r[dk])]=r[vk];
 const ticks=[];let last=-1;for(const r of rows){const m=+r[dk].slice(5,7);if(m!==last){ticks.push({at:wk(r[dk]),label:`${m}월`});last=m;}}
 const cols=Array.from({length:weeks},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i*7);return `${d.getMonth()+1}월 ${d.getDate()}일 주`;});
 return heatmap({...ctx,o:{...o,matrix:{rows:days,cols,values},xTicks:ticks,cellHeight:o.cellHeight??clamp(Math.round((ctx.W-30)/weeks),10,18)}});
}
// One value against its range, with an optional target mark.
function gauge(ctx){
 const {spec,o,W}=ctx,v=spec.data?.[0]?.[spec.encoding?.value??'value']??spec.value,min=o.min??0,max=o.max??100,H=o.height??clamp(Math.round(W*.42),170,240),cx=W/2,r=Math.min(W/2-20,H-46),cy=r+18,th=o.thickness??Math.max(12,r*.18);
 const ang=t=>Math.PI*(1-clamp(t,0,1)),pt=(t,rad)=>[cx+Math.cos(ang(t))*rad,cy-Math.sin(ang(t))*rad];
 const arc=(t0,t1,c,cls='')=>{const [a,b]=pt(t0,r),[e,f]=pt(t1,r);return `<path class="${cls}" d="M${a},${b}A${r},${r} 0 0 1 ${e},${f}" stroke="${c}" stroke-width="${th}" fill="none"/>`;};
 const t=(v-min)/(max-min),target=o.target!=null?(o.target-min)/(max-min):null;
 let mark='';if(target!=null){const [x1,y1]=pt(target,r+th/2+6),[x2,y2]=pt(target,r-th/2-6);mark=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--mc-text)" stroke-width="2"/>`;}
 const tip=`<strong>${esc(spec.title??'')}</strong><span>${unit(ctx,v)}</span>`+(o.target!=null?`<span>목표 ${unit(ctx,o.target)}</span>`:'');
 const svg=arc(0,1,'var(--mc-line)')+`<g data-tip="${esc(tip)}">${arc(0,t,o.color??'var(--mc-accent)','mc-mark')}</g>`+mark+`<text class="mc-center" x="${cx}" y="${cy-6}" text-anchor="middle">${esc(ctx.fmt(v))}</text><text class="mc-tick" x="${cx}" y="${cy+12}" text-anchor="middle">${esc(o.unit??spec.unit??'')}</text><text class="mc-tick" x="${cx-r}" y="${cy+18}" text-anchor="middle">${esc(ctx.fmt(min))}</text><text class="mc-tick" x="${cx+r}" y="${cy+18}" text-anchor="middle">${esc(ctx.fmt(max))}</text>`;
 return {height:H,svg,table:table(['',spec.labels?.value??'값',...(o.target!=null?['목표']:[])],[[spec.title??'',v,...(o.target!=null?[o.target]:[])]],ctx.fmt)};
}
// Price bars: rows {x, open, high, low, close}. Korean convention by default: a rise is red, a fall is blue.
function candlestick(ctx){
 const {spec,o,W}=ctx,e=spec.encoding??{},[xk,ok,hk,lk,ck]=[e.x??'x',e.open??'open',e.high??'high',e.low??'low',e.close??'close'],rows=spec.data,H=o.height??clamp(Math.round(W*.45),220,360),T=12,B=30;
 const sc=niceTicks(Math.min(...rows.map(r=>r[lk])),Math.max(...rows.map(r=>r[hk])),4),L=leftPad(ctx,sc),R=W-6,band=(R-L)/rows.length,Y=v=>T+(H-T-B)*(1-(v-sc.lo)/(sc.hi-sc.lo)),bw=Math.max(1,Math.min(14,band*.62));
 const marks=rows.map((r,i)=>{const cx=L+i*band+band/2,rise=r[ck]>=r[ok],c=rise?'var(--mc-rise)':'var(--mc-fall)',top=Y(Math.max(r[ok],r[ck])),h=Math.max(1,Math.abs(Y(r[ok])-Y(r[ck])));
  const tip=`<strong>${esc(r[xk])}</strong><span>시가 ${ctx.fmt(r[ok])}</span><span>고가 ${ctx.fmt(r[hk])}</span><span>저가 ${ctx.fmt(r[lk])}</span><span>종가 ${ctx.fmt(r[ck])} (${rise?'+':''}${ctx.fmt((r[ck]-r[ok])/r[ok]*100,1)}%)</span>`;
  return `<g><rect class="mc-hit" data-tip="${esc(tip)}" data-group="${i}" x="${L+i*band}" y="${T}" width="${band}" height="${H-T-B}"/><line x1="${cx}" x2="${cx}" y1="${Y(r[hk])}" y2="${Y(r[lk])}" stroke="${c}" stroke-width="1.2"/><rect class="mc-mark" data-mark="${i}" x="${cx-bw/2}" y="${top}" width="${bw}" height="${h}" fill="${c}"/></g>`;}).join('');
 return {height:H,svg:yAxis(ctx,sc,L,R,T,H-B)+marks+xLabels(ctx,rows.map(r=>String(r[xk])),i=>L+i*band+band/2,H-10,band),legend:[{label:o.riseLabel??'상승',color:'var(--mc-rise)'},{label:o.fallLabel??'하락',color:'var(--mc-fall)'}],
  table:table([xk,'시가','고가','저가','종가'],rows.map(r=>[r[xk],r[ok],r[hk],r[lk],r[ck]]),ctx.fmt)};
}
