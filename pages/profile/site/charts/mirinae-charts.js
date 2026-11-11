// mirinae-charts: one data spec drawn as a precise chart card. Pure SVG and canvas, no dependencies.
// Colours come only from --mc-* CSS variables, which each project maps to its own design tokens (see mirinae-charts.css).
// Card ideas (one accent, a bold one-line takeaway) follow ztd-charts by Junhan2, MIT; the code here is our own.
export const VERSION='0.4.0';
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
 destroy(){this.stop?.();this.ro.disconnect();this.host.replaceChildren();}
 css(name,fallback=''){return getComputedStyle(this.el).getPropertyValue(name).trim()||fallback;}
 draw(){
  const form=FORMS[this.spec.type];if(!form)throw new Error('mirinae-charts: unknown type '+this.spec.type);
  this.width=this.plot.clientWidth||600;const family=getComputedStyle(this.el).fontFamily;
  const ctx={spec:this.spec,o:this.spec.options??{},W:this.width,fmt:this.fmt,card:this,family,text:(t,s=12,w=400)=>measure(t,s,w,family)};
  this.stop?.();this.stop=null;const out=form(ctx);this.H=out.height;
  this.plot.querySelectorAll('svg,canvas').forEach(n=>n.remove());
  // Canvas cells go underneath; the SVG with lines, labels and hit areas sits on top.
  this.plot.insertAdjacentHTML('afterbegin',`<svg class="mc-svg" width="${this.width}" height="${out.height}" viewBox="0 0 ${this.width} ${out.height}" role="img" aria-label="${esc(this.spec.ariaLabel??this.spec.title??this.spec.type)}">${out.svg}</svg>`);
  if(out.canvas)this.plot.prepend(out.canvas);
  this.svg=this.plot.querySelector('svg');this.pick=out.pick;
  const legend=this.el.querySelector('.mc-legend');legend.innerHTML=(out.legend??[]).map(l=>`<span class="mc-key"><i class="mc-swatch${l.line?' is-line':''}${l.ramp?' is-ramp':''}" style="--c:${l.color}"></i>${esc(l.label)}</span>`).join('');legend.hidden=!out.legend?.length;
  this.el.querySelector('.mc-table-scroll').innerHTML=out.table??'';
  // Forms that move (the bar race) start after the drawing is in the page and hand back how to stop.
  this.stop=out.after?.(this.svg,this)??null;
  this.bindHits(out.noKeys);this.el.dataset.mcReady='true';
 }
 // Every mark that can be read carries data-tip; the same tip follows the pointer, focus and arrow keys.
 bindHits(noKeys){
  const svg=this.svg,hits=[...svg.querySelectorAll('[data-tip]')];
  const show=(html,x,y)=>{this.tip.innerHTML=html;this.tip.hidden=false;const w=this.tip.offsetWidth,h=this.tip.offsetHeight;this.tip.style.left=clamp(x-w/2,0,this.width-w)+'px';this.tip.style.top=(y-h-12<0?y+16:y-h-12)+'px';};
  const hide=()=>{this.tip.hidden=true;svg.querySelectorAll('.is-on').forEach(n=>n.classList.remove('is-on'));};
  const on=n=>{svg.querySelectorAll('.is-on').forEach(m=>m.classList.remove('is-on'));n.classList.add('is-on');const g=n.dataset.group;if(g)svg.querySelectorAll(`[data-mark="${g}"]`).forEach(m=>m.classList.add('is-on'));};
  svg.onpointermove=e=>{const r=svg.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,n=e.target.closest?.('[data-tip]');
   if(n){on(n);show(n.dataset.tip,x,y);return;}
   const p=this.pick?.(x,y);if(p){show(p,x,y);return;}hide();};
  svg.onpointerleave=hide;
  // Charts of hundreds of marks are read from the table by keyboard, not one stop per mark.
  if(noKeys)return;
  hits.forEach((n,i)=>{n.setAttribute('tabindex','0');n.setAttribute('role','img');n.setAttribute('aria-label',n.dataset.tip.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
   n.onfocus=()=>{const b=n.getBBox();on(n);show(n.dataset.tip,b.x+b.width/2,b.y);};n.onblur=hide;
   n.onkeydown=e=>{const d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(d){e.preventDefault();hits[clamp(i+d,0,hits.length-1)].focus();}};});
 }
}

// ---------- shared pieces ----------
function inkOn(card,fill){const m=/var\((--[\w-]+)\)/.exec(fill),hex=m?card.css(m[1]):fill;if(!/^#/.test(hex))return 'var(--mc-text)';const [r,g,b]=hexRgb(hex).map(lin),y=.2126*r+.7152*g+.0722*b;return y>.22?'#14171b':'#f4f6f8';}
function placeLabels(ctx,items,W,taken=[]){
 let out='';for(const it of items){const size=it.size??12,w=ctx.text(it.text,size,it.weight??400),h=size;
  for(const [x,y,anchor='start'] of it.cands){const x0=anchor==='start'?x:anchor==='end'?x-w:x-w/2,box=[x0-2,y-h*.85,x0+w+2,y+h*.3];if(box[0]<1||box[2]>W-1)continue;
   if(taken.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1]))continue;taken.push(box);
   out+=`<text class="${it.cls??'mc-label'}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" style="paint-order:stroke;stroke:var(--mc-surface);stroke-width:3px;pointer-events:none;${it.style??''}">${esc(it.text)}</text>`;break;}}
 return out;
}
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
const FORMS={bar,line,area:c=>line(c,true),waterfall,heatmap,donut,sankey,scatter,dumbbell,slope,bump,treemap,calendar,gauge,candlestick,sunpath,windrose,psychro,loadduration,histogram,box,bullet,gantt,lollipop,radar,funnel,pareto,
 beeswarm,ridgeline,violin,hexbin,waffle,stack100,marimekko,radialbar,pie:c=>donut({...c,o:{...c.o,inner:0}}),sunburst,tree,chord,network,stream,sparkline,timeline,choropleth,tilemap,symbolmap,flowmap,barrace};

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
 const center=(o.inner??.62)<=0?'':`<text class="mc-center" x="${cx}" y="${cy+2}" text-anchor="middle">${esc(ctx.fmt(total))}</text><text class="mc-tick" x="${cx}" y="${cy+20}" text-anchor="middle">${esc(o.centerLabel??(o.unit??spec.unit??'합계'))}</text>`;
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

// ---------- building climate set ----------
// Sun altitude and azimuth (degrees, azimuth clockwise from north) at a local clock time.
export function sunAt(day,clock,{lat,lon,tz}){
 const g=2*Math.PI/365*(day-1+(clock-12)/24),R=Math.PI/180;
 const eot=229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g));
 const dec=.006918-.399912*Math.cos(g)+.070257*Math.sin(g)-.006758*Math.cos(2*g)+.000907*Math.sin(2*g)-.002697*Math.cos(3*g)+.00148*Math.sin(3*g);
 const ha=((clock*60+eot+4*lon-60*tz)/4-180)*R,phi=lat*R,cz=clamp(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(ha),-1,1),zen=Math.acos(cz);
 let az=Math.acos(clamp((Math.sin(phi)*cz-Math.sin(dec))/(Math.cos(phi)*Math.sin(zen)||1e-9),-1,1))/R;az=ha>0?(az+180)%360:(540-az)%360;
 return {altitude:90-zen/R,azimuth:az};
}
// Humidity ratio in g/kg of dry air from dry-bulb °C and relative humidity %, at a pressure in kPa.
export function humidityRatio(t,rh,p=101.325){const ps=.61094*Math.exp(17.625*t/(t+243.04)),pw=ps*rh/100;return 622*pw/(p-pw);}
const DIRS=['북','북북동','북동','동북동','동','동남동','남동','남남동','남','남남서','남서','서남서','서','서북서','북서','북북서'];
const DOY=[0,31,59,90,120,151,181,212,243,273,304,334];

// Sun path, seen from above: rings are altitude, spokes are compass bearings, one path per month's 21st.
// options {lat, lon, tz, now:{day, hour}?, label?}
function sunpath(ctx){
 const {o,W}=ctx,site={lat:o.lat??37.57,lon:o.lon??126.97,tz:o.tz??9},H=o.height??clamp(Math.round(W*.86),300,520),pad=34,Rr=Math.min(W/2-pad-30,H/2-pad),cx=W/2,cy=H/2;
 const P=(alt,az)=>{const r=Rr*(90-alt)/90,z=az*Math.PI/180;return [cx+r*Math.sin(z),cy-r*Math.cos(z)];};
 let g='';
 const ringStep=Rr*15/90>16?15:30;for(const a of [0,15,30,45,60,75])g+=`<circle class="mc-grid${a===0?' is-zero':''}" cx="${cx}" cy="${cy}" r="${Rr*(90-a)/90}" fill="none"/>`+(a&&a%ringStep===0?`<text class="mc-tick" x="${cx+3}" y="${cy-Rr*(90-a)/90-3}">${a}°</text>`:'');
 for(let az=0;az<360;az+=30){const [x,y]=P(0,az);g+=`<line class="mc-grid" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`;}
 g+=[['북',0],['동',90],['남',180],['서',270]].map(([t,az])=>{const [x,y]=P(-12,az);return `<text class="mc-label is-strong" x="${x}" y="${y+4}" text-anchor="middle">${t}</text>`;}).join('');
 const days=[[355,'12월','동지'],[21,'1·11월'],[52,'2·10월'],[80,'3·9월','춘·추분'],[111,'4·8월'],[141,'5·7월'],[172,'6월','하지']];
 const paths=days.map(([d,label,name])=>{const pts=[];for(let m=0;m<=24*60;m+=6){const s=sunAt(d,m/60,site);if(s.altitude>=0)pts.push(P(s.altitude,s.azimuth));}
  const noon=sunAt(d,12+(135-site.lon)/15-0.05,site),[nx,ny]=P(noon.altitude,noon.azimuth),hi=o.highlight===label;
  return `<polyline class="mc-line${hi?'':' is-quiet'}" data-tip="${esc(`<strong>${label} 21일${name?' · '+name:''}</strong><span>남중 고도 ${ctx.fmt(noon.altitude,1)}°</span>`)}" points="${pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}" stroke="${hi?'var(--mc-accent)':'var(--mc-s4)'}" stroke-width="${hi?2.5:1.5}"/>${name?`<text class="mc-label" x="${nx+7}" y="${ny+4}">${name}</text>`:''}`;}).join('');
 // Hour lines join the same clock time across the year.
 let hours='';for(let h=5;h<=19;h++){const pts=[];for(let d=1;d<=365;d+=4){const s=sunAt(d,h,site);if(s.altitude>0)pts.push(P(s.altitude,s.azimuth));}if(pts.length<2)continue;
  const far=pts.reduce((a,p)=>Math.hypot(p[0]-cx,p[1]-cy)>Math.hypot(a[0]-cx,a[1]-cy)?p:a);
  hours+=`<polyline class="mc-join" points="${pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="none"/>`;
  const d=Math.hypot(far[0]-cx,far[1]-cy)||1;if(h%2===0&&d>Rr*.8)hours+=`<text class="mc-tick" x="${cx+(far[0]-cx)*(1+14/d)}" y="${cy+(far[1]-cy)*(1+14/d)+4}" text-anchor="middle">${h}시</text>`;}
 let now='';if(o.now){const s=sunAt(o.now.day,o.now.hour,site);if(s.altitude>0){const [x,y]=P(s.altitude,s.azimuth);now=`<circle class="mc-mark" data-tip="${esc(`<strong>${esc(o.now.label??'지금')}</strong><span>해 높이 ${ctx.fmt(s.altitude,1)}°</span><span>방위 ${ctx.fmt(s.azimuth,0)}°</span>`)}" cx="${x}" cy="${y}" r="8" fill="var(--mc-accent)" stroke="var(--mc-surface)" stroke-width="3"/>`;}}
 const tbl=days.map(([d,label])=>{const s=sunAt(d,12+(135-site.lon)/15,site);let rise=null,set=null;for(let m=0;m<=24*60;m+=2){const a=sunAt(d,m/60,site).altitude;if(a>0&&rise==null)rise=m;if(a>0)set=m;}const t=m=>m==null?'—':`${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}`;return [label,s.altitude,t(rise),t(set)];});
 return {height:H,svg:g+hours+paths+now,legend:[{label:'21일의 해 길',color:'var(--mc-s4)',line:true},{label:'같은 시각',color:'var(--mc-line-strong)',line:true},...(o.now?[{label:o.now.label??'지금',color:'var(--mc-accent)'}]:[])],
  table:table(['21일','남중 고도 °','해 뜸','해 짐'],tbl,ctx.fmt)};
}

// Wind rose: 16 bearings, wedges stacked by speed band, length is the share of all hours.
// data rows with encoding {dir, speed} (degrees from north, m/s), or options {dir:[], speed:[]}.
function windrose(ctx){
 const {spec,o,W,card}=ctx,dirs=o.dir??spec.data.map(r=>r[spec.encoding.dir]),speeds=o.speed??spec.data.map(r=>r[spec.encoding.speed]),bands=o.bands??[.5,2,4,6,Infinity],calmBelow=bands[0];
 const n=dirs.length,count=Array.from({length:16},()=>Array(bands.length-1).fill(0));let calm=0;
 dirs.forEach((d,i)=>{const s=speeds[i];if(s<calmBelow){calm++;return;}const k=Math.round(((d%360)+360)%360/22.5)%16,b=bands.findIndex((e,j)=>s>=e&&s<bands[j+1]);count[k][b]++;});
 const pct=count.map(r=>r.map(c=>c/n*100)),tot=pct.map(r=>r.reduce((a,v)=>a+v,0)),max=Math.max(...tot),sc=niceTicks(0,max,4);
 const H=o.height??clamp(Math.round(W*.86),300,500),cx=W/2,cy=H/2,Rr=Math.min(W/2-40,H/2-30),r0=Rr*.08,rad=v=>r0+(Rr-r0)*v/sc.hi;
 const f=ramp([card.css('--mc-seq-low','#1f2a33'),card.css('--mc-seq-high','#7fd3c0')]),cols=bands.slice(0,-1).map((_,j)=>`rgb(${f(.42+.58*j/Math.max(1,bands.length-2)).join(',')})`);
 const arc=(a0,a1,ri,ro)=>{const p=(a,r)=>[cx+r*Math.sin(a),cy-r*Math.cos(a)];const [x1,y1]=p(a0,ro),[x2,y2]=p(a1,ro),[x3,y3]=p(a1,ri),[x4,y4]=p(a0,ri);return `M${x1},${y1}A${ro},${ro} 0 0 1 ${x2},${y2}L${x3},${y3}A${ri},${ri} 0 0 0 ${x4},${y4}Z`;};
 const lb=168*Math.PI/180,every=rad(sc.step)-rad(0)<18?2:1;let g=sc.ticks.filter(v=>v>0).map((v,i)=>`<circle class="mc-grid" cx="${cx}" cy="${cy}" r="${rad(v)}" fill="none"/>${(i+1)%every?'':`<text class="mc-tick" x="${cx+rad(v)*Math.sin(lb)+3}" y="${cy-rad(v)*Math.cos(lb)+4}">${ctx.fmt(v)}%</text>`}`).join('');
 g+=[['북',0],['동',90],['남',180],['서',270]].map(([t,az])=>{const a=az*Math.PI/180;return `<text class="mc-label is-strong" x="${cx+(Rr+16)*Math.sin(a)}" y="${cy-(Rr+16)*Math.cos(a)+4}" text-anchor="middle">${t}</text>`;}).join('');
 let wedges='';pct.forEach((row,k)=>{const mid=k*22.5*Math.PI/180,half=9.8*Math.PI/180;let acc=0;row.forEach((v,j)=>{if(!v)return;
  wedges+=`<path class="mc-mark" data-tip="${esc(`<strong>${DIRS[k]}풍</strong><span>${bands[j]}–${bands[j+1]===Infinity?'':bands[j+1]} m/s ${ctx.fmt(v,1)}%</span><span>${DIRS[k]} 합계 ${ctx.fmt(tot[k],1)}%</span>`)}" d="${arc(mid-half,mid+half,rad(acc)+.5,rad(acc+v))}" fill="${cols[j]}"/>`;acc+=v;});});
 const center=`<circle cx="${cx}" cy="${cy}" r="${r0}" fill="var(--mc-surface)" stroke="var(--mc-line-strong)"/><text class="mc-tick" x="${cx}" y="${cy+4}" text-anchor="middle">${ctx.fmt(calm/n*100,0)}%</text>`;
 return {height:H,svg:g+wedges+center,legend:[...bands.slice(0,-1).map((b,j)=>({label:`${b}${bands[j+1]===Infinity?' m/s 이상':'–'+bands[j+1]+' m/s'}`,color:cols[j]})),{label:`가운데: 바람 없음(${calmBelow} m/s 미만)`,color:'var(--mc-surface)'}],
  table:table(['방위',...bands.slice(0,-1).map((b,j)=>`${b}${bands[j+1]===Infinity?'+':'–'+bands[j+1]}`),'합계 %'],pct.map((r,k)=>[DIRS[k],...r,tot[k]]),ctx.fmt)};
}

// Psychrometric chart: dry bulb across, humidity ratio up the right, curves of equal relative humidity.
// Hours are counted into 1 °C × 0.5 g/kg cells and shaded by how many fall there.
// data rows with encoding {t, rh}, or options {t:[], rh:[]}; options.comfort {tmin,tmax,rhmin,rhmax}, pressure kPa.
function psychro(ctx){
 const {spec,o,W,card}=ctx,ts=o.t??spec.data.map(r=>r[spec.encoding.t]),rhs=o.rh??spec.data.map(r=>r[spec.encoding.rh]),p=o.pressure??101.325;
 const tmin=o.tmin??-20,tmax=o.tmax??40,wmax=o.wmax??26,H=o.height??clamp(Math.round(W*.62),260,440),L=14,R=W-44,T=12,B=34,X=t=>L+(R-L)*(t-tmin)/(tmax-tmin),Y=w=>T+(H-T-B)*(1-w/wmax);
 const cells=new Map();ts.forEach((t,i)=>{const w=humidityRatio(t,rhs[i],p),k=`${Math.floor(t)}|${Math.floor(w*2)}`;cells.set(k,(cells.get(k)??0)+1);});
 const most=Math.max(...cells.values()),f=ramp([card.css('--mc-seq-low','#1f2a33'),card.css('--mc-seq-high','#7fd3c0')]);
 const dpr=Math.min(2,devicePixelRatio||1),cv=document.createElement('canvas');cv.className='mc-canvas';cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';
 const g2=cv.getContext('2d');g2.scale(dpr,dpr);
 for(const [k,c] of cells){const [t,w2]=k.split('|').map(Number);if(t<tmin||t>=tmax||w2/2>=wmax)continue;g2.fillStyle=`rgb(${f(.15+.85*Math.log(1+c)/Math.log(1+most)).join(',')})`;g2.fillRect(X(t),Y((w2+1)/2),Math.ceil(X(t+1)-X(t)),Math.ceil(Y(w2/2)-Y((w2+1)/2)));}
 let g='';for(let t=Math.ceil(tmin/10)*10;t<=tmax;t+=10)g+=`<line class="mc-grid" x1="${X(t)}" x2="${X(t)}" y1="${T}" y2="${H-B}"/><text class="mc-tick" x="${X(t)}" y="${H-B+16}" text-anchor="middle">${t}</text>`;
 for(let w=0;w<=wmax;w+=5)g+=`<line class="mc-grid" x1="${L}" x2="${R}" y1="${Y(w)}" y2="${Y(w)}"/><text class="mc-tick" x="${R+6}" y="${Y(w)+4}">${w}</text>`;
 g+=`<text class="mc-tick" x="${R}" y="${H-2}" text-anchor="end">건구 온도 °C →</text><text class="mc-tick" x="${R+6}" y="${T-2}" text-anchor="start">g/kg</text>`;
 const curve=rh=>{const pts=[];for(let t=tmin;t<=tmax;t+=.5){const w=humidityRatio(t,rh,p);if(w>wmax)break;pts.push([X(t),Y(w)]);}return pts;};
 let rhLines='';const placed=[];for(const rh of [100,20,60,40,80]){const pts=curve(rh),last=pts[pts.length-1],w=ctx.text(rh+'%',12)+4,box=[last[0]-4-w,last[1]-18,last[0]-4,last[1]-2],free=!placed.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1]);if(free)placed.push(box);
  rhLines+=`<polyline class="mc-line${rh===100?'':' is-quiet'}" points="${pts.map(q=>q.map(v=>v.toFixed(1)).join(',')).join(' ')}" stroke="${rh===100?'var(--mc-text)':'var(--mc-line-strong)'}" stroke-width="${rh===100?2:1}"/>${free?`<text class="mc-tick" x="${last[0]-4}" y="${last[1]-5}" text-anchor="end">${rh}%</text>`:''}`;}
 let zone='';const c=o.comfort;if(c){const lo=[],hi=[];for(let t=c.tmin;t<=c.tmax+1e-9;t+=.5){lo.push([X(t),Y(humidityRatio(t,c.rhmin,p))]);hi.push([X(t),Y(humidityRatio(t,c.rhmax,p))]);}
  const inside=ts.filter((t,i)=>t>=c.tmin&&t<=c.tmax&&rhs[i]>=c.rhmin&&rhs[i]<=c.rhmax).length;
  zone=`<path data-tip="${esc(`<strong>${esc(c.label??'쾌적 범위')}</strong><span>${c.tmin}–${c.tmax} °C, 상대습도 ${c.rhmin}–${c.rhmax}%</span><span>1년 중 ${ctx.fmt(inside)}시간 (${ctx.fmt(inside/ts.length*100,1)}%)</span>`)}" d="M${lo.map(q=>q.join(',')).join('L')}L${[...hi].reverse().map(q=>q.join(',')).join('L')}Z" fill="none" stroke="var(--mc-accent)" stroke-width="2"/>`;}
 const pick=(px,py)=>{const t=tmin+(px-L)/(R-L)*(tmax-tmin),w=(1-(py-T)/(H-T-B))*wmax;if(t<tmin||t>tmax||w<0||w>wmax)return null;const k=`${Math.floor(t)}|${Math.floor(w*2)}`,n=cells.get(k);return n?`<strong>${Math.floor(t)}–${Math.floor(t)+1} °C · ${Math.floor(w*2)/2}–${Math.floor(w*2)/2+.5} g/kg</strong><span>${ctx.fmt(n)}시간</span>`:null;};
 return {height:H,canvas:cv,svg:g+rhLines+zone,pick,legend:[{label:'시간이 많을수록 진하게',color:`rgb(${f(1).join(',')})`},{label:'상대습도 곡선',color:'var(--mc-line-strong)',line:true},...(c?[{label:c.label??'쾌적 범위',color:'var(--mc-accent)',line:true}]:[])],
  table:`<p class="mc-note">${ctx.fmt(ts.length)}시간을 1 °C × 0.5 g/kg 칸으로 셌습니다. 칸을 눌러 시간 수를 읽습니다.</p>`};
}

// Load duration curve: every hour's load, largest first. options.values or data with encoding.value; options.refs [{value,label}].
function loadduration(ctx){
 const {spec,o,W}=ctx,vals=[...(o.values??spec.data.map(r=>r[spec.encoding.value]))].sort((a,b)=>b-a),n=vals.length,refs=o.refs??[];
 const H=o.height??clamp(Math.round(W*.4),220,320),T=14,B=34,sc=niceTicks(0,Math.max(vals[0],...refs.map(r=>r.value)),4),L=leftPad(ctx,sc),R=W-8,X=i=>L+(R-L)*i/(n-1),Y=v=>T+(H-T-B)*(1-(v-sc.lo)/(sc.hi-sc.lo));
 const step=Math.max(1,Math.floor(n/Math.max(200,R-L))),pts=[];for(let i=0;i<n;i+=step)pts.push([X(i),Y(vals[i])]);pts.push([X(n-1),Y(vals[n-1])]);
 const line=pts.map(q=>q.map(v=>v.toFixed(1)).join(',')).join(' '),area=`<path class="mc-area" d="M${X(0)},${Y(0)}L${pts.map(q=>q.join(',')).join('L')}L${X(n-1)},${Y(0)}Z" fill="var(--mc-s1)" opacity=".35"/>`;
 let lastEnd=-Infinity;const ticks=[0,1000,2000,4000,6000,n].filter((v,i,a)=>v<=n&&a.indexOf(v)===i&&(v===n||n-v>600)).filter(v=>{const w=ctx.text(ctx.fmt(v),12),x=X(Math.min(v,n-1)),start=v===n?x-w:x-w/2;if(v!==n&&start<lastEnd+8)return false;lastEnd=start+w;return true;}).map(v=>`<text class="mc-tick" x="${X(Math.min(v,n-1))}" y="${H-B+16}" text-anchor="${v===n?'end':'middle'}">${ctx.fmt(v)}</text>`).join('');
 const refLines=refs.map(r=>{const above=vals.filter(v=>v>r.value).length;return `<line class="mc-join" x1="${L}" x2="${R}" y1="${Y(r.value)}" y2="${Y(r.value)}" style="stroke:var(--mc-accent)"/><text class="mc-label" x="${R}" y="${Y(r.value)-6}" text-anchor="end">${esc(r.label)} ${esc(ctx.fmt(r.value))}${esc(o.unit??spec.unit?' '+(o.unit??spec.unit):'')}${above?` · 넘는 시간 ${ctx.fmt(above)}`:''}</text>`;}).join('');
 const peak=`<circle class="mc-dot" cx="${X(0)}" cy="${Y(vals[0])}" r="4" fill="var(--mc-s1)"/><text class="mc-value" x="${X(0)+8}" y="${Y(vals[0])+4}">최대 ${esc(unit(ctx,vals[0]))}</text>`;
 const pick=(px,py)=>{if(px<L||px>R||py<T||py>H-B)return null;const i=clamp(Math.round((px-L)/(R-L)*(n-1)),0,n-1);return `<strong>${ctx.fmt(i+1)}번째로 큰 시간</strong><span>${unit(ctx,vals[i])}</span><span>이보다 큰 시간 ${ctx.fmt(i)}시간</span>`;};
 const q=[0,.01,.1,.5,.9].map(f=>Math.min(n-1,Math.floor(f*n)));
 return {height:H,svg:yAxis(ctx,sc,L,R,T,H-B)+area+`<polyline class="mc-line" points="${line}" stroke="var(--mc-s1)"/>`+refLines+peak+ticks+`<text class="mc-tick" x="${R}" y="${H-2}" text-anchor="end">큰 순서로 늘어놓은 시간 →</text>`,pick,
  table:table(['순위','시간 비율',spec.labels?.value??'값'],q.map(i=>[`${ctx.fmt(i+1)}번째`,`상위 ${ctx.fmt(i/n*100,1)}%`,vals[i]]),ctx.fmt)};
}

// ---------- third set ----------
const valuesOf=(spec,o)=>o.values??spec.data.map(r=>r[spec.encoding?.value??'value']);
// Histogram: how values spread. options.binWidth or options.bins (about how many), options.mark {value,label}.
function histogram(ctx){
 const {spec,o,W}=ctx,vals=valuesOf(spec,o).filter(v=>v!=null&&!Number.isNaN(v)),lo0=Math.min(...vals),hi0=Math.max(...vals);
 const bw=o.binWidth??niceTicks(lo0,hi0,o.bins??12).step,lo=Math.floor(lo0/bw)*bw,nb=Math.max(1,Math.ceil((hi0-lo)/bw+1e-9)),counts=Array(nb).fill(0);
 vals.forEach(v=>{counts[Math.min(nb-1,Math.floor((v-lo)/bw))]++;});
 const H=o.height??clamp(Math.round(W*.42),200,320),T=16,B=34,sc=niceTicks(0,Math.max(...counts),4),L=leftPad(ctx,sc),R=W-8,X=v=>L+(R-L)*(v-lo)/(nb*bw),Y=c=>T+(H-T-B)*(1-c/sc.hi),u=o.unit??spec.unit??'';
 const marks=counts.map((c,i)=>{const a=lo+i*bw,b=a+bw,x0=X(a)+1,x1=X(b)-1,hi=o.mark&&o.mark.value>=a&&o.mark.value<b;
  return `<g><rect class="mc-hit" data-tip="${esc(`<strong>${ctx.fmt(a)}–${ctx.fmt(b)}${u?' '+u:''}</strong><span>${ctx.fmt(c)}개 · ${ctx.fmt(c/vals.length*100,1)}%</span>`)}" x="${X(a)}" y="${T}" width="${X(b)-X(a)}" height="${H-T-B}"/><rect class="mc-mark" x="${x0}" y="${Y(c)}" width="${Math.max(0,x1-x0)}" height="${Math.max(0,Y(0)-Y(c))}" rx="2" fill="${hi?'var(--mc-accent)':'var(--mc-s1)'}"/></g>`;}).join('');
 let lastEnd=-Infinity;const edges=Array.from({length:nb+1},(_,i)=>lo+i*bw).filter(v=>{const w=ctx.text(ctx.fmt(v),12),s=X(v)-w/2;if(s<lastEnd+6)return false;lastEnd=s+w;return true;});
 const xt=edges.map(v=>`<text class="mc-tick" x="${X(v)}" y="${H-B+16}" text-anchor="middle">${esc(ctx.fmt(v))}</text>`).join('')+`<text class="mc-tick" x="${R}" y="${H-2}" text-anchor="end">${esc(spec.labels?.value??'값')}${u?' ('+esc(u)+')':''} →</text>`;
 const mark=o.mark?`<line class="mc-join" x1="${X(o.mark.value)}" x2="${X(o.mark.value)}" y1="${T-4}" y2="${H-B}" style="stroke:var(--mc-accent)"/><text class="mc-label" x="${X(o.mark.value)+5}" y="${T+6}">${esc(o.mark.label??'')} ${esc(ctx.fmt(o.mark.value))}</text>`:'';
 return {height:H,svg:yAxis(ctx,sc,L,R,T,H-B)+marks+mark+`<line class="mc-axis" x1="${L}" x2="${R}" y1="${Y(0)}" y2="${Y(0)}"/>`+xt,table:table(['구간','개수','%'],counts.map((c,i)=>[`${ctx.fmt(lo+i*bw)}–${ctx.fmt(lo+(i+1)*bw)}`,c,c/vals.length*100]),ctx.fmt)};
}
// Box plot, one row per group: the middle half as a box, the median as a line, whiskers to 1.5 × IQR, dots beyond.
// data rows {group, value} with encoding {group, value}, or options.groups {name: [values]}.
function box(ctx){
 const {spec,o,W}=ctx,groups=o.groups??spec.data.reduce((a,r)=>{(a[r[spec.encoding.group]]??=[]).push(r[spec.encoding.value]);return a;},{}),names=Object.keys(groups);
 const q=(s,p)=>{const i=(s.length-1)*p,a=Math.floor(i);return s[a]+(s[Math.min(s.length-1,a+1)]-s[a])*(i-a);};
 const st=names.map(n=>{const s=[...groups[n]].filter(v=>v!=null).sort((a,b)=>a-b),q1=q(s,.25),q3=q(s,.75),iqr=q3-q1,lw=s.find(v=>v>=q1-1.5*iqr),hw=[...s].reverse().find(v=>v<=q3+1.5*iqr);return {n,s,q1,med:q(s,.5),q3,lw,hw,out:s.filter(v=>v<lw||v>hw)};});
 const row=o.rowHeight??40,T=8,B=34,H=T+names.length*row+B,all=st.flatMap(x=>x.s),sc=niceTicks(Math.min(...all),Math.max(...all),5),L=Math.min(W*.3,Math.max(...names.map(n=>ctx.text(n,13)))+14),R=W-12,X=v=>L+(R-L)*(v-sc.lo)/(sc.hi-sc.lo),u=o.unit??spec.unit??'';
 const grid=sc.ticks.map(v=>`<line class="mc-grid" x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${H-B}"/><text class="mc-tick" x="${X(v)}" y="${H-B+16}" text-anchor="middle">${esc(ctx.fmt.axis(v))}</text>`).join('');
 const marks=st.map((x,i)=>{const cy=T+i*row+row/2,h=row*.46,on=o.highlight===x.n,c=o.highlight!=null?(on?'var(--mc-accent)':'var(--mc-neutral)'):'var(--mc-s1)';
  const tip=`<strong>${esc(x.n)}</strong><span>중앙값 ${ctx.fmt(x.med)}${u?' '+u:''}</span><span>가운데 절반 ${ctx.fmt(x.q1)}–${ctx.fmt(x.q3)}</span><span>범위 ${ctx.fmt(x.s[0])}–${ctx.fmt(x.s[x.s.length-1])} · ${x.s.length}개</span>`;
  return `<g><rect class="mc-hit" data-tip="${esc(tip)}" x="0" y="${cy-row/2}" width="${W}" height="${row}"/><text class="mc-label${on?' is-strong':''}" x="${L-10}" y="${cy+4}" text-anchor="end">${esc(x.n)}</text><line class="mc-axis" x1="${X(x.lw)}" x2="${X(x.hw)}" y1="${cy}" y2="${cy}"/><line class="mc-axis" x1="${X(x.lw)}" x2="${X(x.lw)}" y1="${cy-h/3}" y2="${cy+h/3}"/><line class="mc-axis" x1="${X(x.hw)}" x2="${X(x.hw)}" y1="${cy-h/3}" y2="${cy+h/3}"/><rect class="mc-mark" x="${X(x.q1)}" y="${cy-h/2}" width="${Math.max(1,X(x.q3)-X(x.q1))}" height="${h}" rx="3" fill="${c}" fill-opacity=".85"/><line x1="${X(x.med)}" x2="${X(x.med)}" y1="${cy-h/2}" y2="${cy+h/2}" stroke="var(--mc-text)" stroke-width="2.5"/>${x.out.map(v=>`<circle cx="${X(v)}" cy="${cy}" r="3" fill="none" stroke="${c}" stroke-width="1.5"/>`).join('')}</g>`;}).join('');
 return {height:H,svg:grid+marks,table:table(['','최소','1사분위','중앙값','3사분위','최대','개수'],st.map(x=>[x.n,x.s[0],x.q1,x.med,x.q3,x.s[x.s.length-1],x.s.length]),ctx.fmt)};
}
// Bullet: a measure against its target, over bands of poor/fair/good. rows {label, value, target, ranges:[a,b,c]}.
function bullet(ctx){
 const {spec,o,W}=ctx,rows=spec.data,row=o.rowHeight??46,T=6,H=T+rows.length*row+4,L=Math.min(W*.34,Math.max(...rows.map(r=>ctx.text(r.label,13,600)))+16),R=W-12,u=o.unit??spec.unit??'';
 const marks=rows.map((r,i)=>{const top=Math.max(r.value,r.target??0,...(r.ranges??[])),sc=niceTicks(0,top*1.05,4),X=v=>L+(R-L)*v/sc.hi,cy=T+i*row+row/2-4,bh=row*.5,good=r.target==null?null:(o.lowerIsBetter??r.lowerIsBetter?r.value<=r.target:r.value>=r.target);
  const bands=(r.ranges??[]).map((v,k,a)=>`<rect x="${X(k?a[k-1]:0)}" y="${cy-bh/2}" width="${X(v)-X(k?a[k-1]:0)}" height="${bh}" fill="var(--mc-${['line','neutral-2','neutral'][Math.min(2,k)]})" opacity="${.55+.15*k}"/>`).join('');
  const tip=`<strong>${esc(r.label)}</strong><span>값 ${ctx.fmt(r.value)}${u?' '+u:''}</span>${r.target!=null?`<span>기준 ${ctx.fmt(r.target)}${u?' '+u:''} · ${good?'충족':'미달'}</span>`:''}`;
  return `<g><rect class="mc-hit" data-tip="${esc(tip)}" x="0" y="${T+i*row}" width="${W}" height="${row}"/><text class="mc-label is-strong" x="${L-12}" y="${cy+4}" text-anchor="end">${esc(r.label)}</text>${bands}<rect class="mc-mark" x="${L}" y="${cy-bh/5}" width="${Math.max(0,X(r.value)-L)}" height="${bh*.4}" fill="${good===false?'var(--mc-s2)':'var(--mc-accent)'}"/>${r.target!=null?`<line x1="${X(r.target)}" x2="${X(r.target)}" y1="${cy-bh/2-3}" y2="${cy+bh/2+3}" stroke="var(--mc-text)" stroke-width="2.5"/>`:''}<text class="mc-tick" x="${L}" y="${cy+bh/2+14}">0</text><text class="mc-tick" x="${R}" y="${cy+bh/2+14}" text-anchor="end">${esc(ctx.fmt(sc.hi))}${u?' '+esc(u):''}</text></g>`;}).join('');
 return {height:H,svg:marks,legend:[{label:o.valueLabel??'값',color:'var(--mc-accent)'},{label:o.targetLabel??'기준',color:'var(--mc-text)',line:true},...(rows.some(r=>r.ranges)?[{label:'구간',color:'var(--mc-neutral)'}]:[])],
  table:table(['',o.valueLabel??'값',o.targetLabel??'기준'],rows.map(r=>[r.label,r.value,r.target??'—']),ctx.fmt)};
}
// Gantt: rows {task, start, end, group?, done? (0..1)}; dates as 'YYYY-MM-DD' or numbers. start = end is a milestone. options.now.
function gantt(ctx){
 const {spec,o,W}=ctx,rows=spec.data,isDate=typeof rows[0].start==='string',t=v=>isDate?Date.parse(v+'T00:00:00Z'):v,DAY=864e5;
 const t0=Math.min(...rows.map(r=>t(r.start))),t1=Math.max(...rows.map(r=>t(r.end)),o.now!=null?t(o.now):-Infinity),groups=[...new Set(rows.map(r=>r.group).filter(Boolean))],colors=colorFor(o,groups.length?groups:['_']);
 const row=o.rowHeight??30,T=26,H=T+rows.length*row+8,L=Math.min(W*.36,Math.max(...rows.map(r=>ctx.text(r.task,13)))+16),R=W-10,span=(t1-t0)||1,X=v=>L+(R-L)*(t(v)-t0)/span,XT=ms=>L+(R-L)*(ms-t0)/span;
 let ticks=[];if(isDate){const d0=new Date(t0),days=span/DAY;if(days>120){for(let d=Date.UTC(d0.getUTCFullYear(),d0.getUTCMonth(),1);d<=t1;d=Date.UTC(new Date(d).getUTCFullYear(),new Date(d).getUTCMonth()+1,1))if(d>=t0)ticks.push([d,`${new Date(d).getUTCMonth()+1}월`]);}
  else{const step=days>35?7:days>10?2:1;for(let d=t0;d<=t1;d+=step*DAY){const x=new Date(d);ticks.push([d,`${x.getUTCMonth()+1}/${x.getUTCDate()}`]);}}}
 else ticks=niceTicks(t0,t1,6).ticks.filter(v=>v>=t0&&v<=t1).map(v=>[v,ctx.fmt(v)]);
 let lastEnd=-Infinity;ticks=ticks.filter(([v,l])=>{const w=ctx.text(l,12),s=XT(v)-w/2;if(s<lastEnd+6)return false;lastEnd=s+w;return true;});
 const grid=ticks.map(([v,l])=>`<line class="mc-grid" x1="${XT(v)}" x2="${XT(v)}" y1="${T-4}" y2="${H-8}"/><text class="mc-tick" x="${XT(v)}" y="${T-10}" text-anchor="middle">${esc(l)}</text>`).join('');
 const fmtT=v=>isDate?v.slice(5).replace('-','/'):ctx.fmt(v);
 const marks=rows.map((r,i)=>{const y=T+i*row,c=colors[r.group??'_'],x0=X(r.start),x1=X(r.end),bh=row*.56,cy=y+row/2,mile=t(r.start)===t(r.end);
  const tip=`<strong>${esc(r.task)}</strong><span>${fmtT(r.start)}${mile?'':' – '+fmtT(r.end)}</span>${r.group?`<span>${esc(r.group)}</span>`:''}${r.done!=null?`<span>진행 ${ctx.fmt(r.done*100)}%</span>`:''}`;
  const bar=mile?`<path class="mc-mark" d="M${x0},${cy-7}L${x0+7},${cy}L${x0},${cy+7}L${x0-7},${cy}Z" fill="${c}"/>`:`<rect class="mc-mark" x="${x0}" y="${cy-bh/2}" width="${Math.max(2,x1-x0)}" height="${bh}" rx="4" fill="${c}" fill-opacity="${r.done!=null?.35:.9}"/>${r.done!=null?`<rect x="${x0}" y="${cy-bh/2}" width="${Math.max(0,(x1-x0)*clamp(r.done,0,1))}" height="${bh}" rx="4" fill="${c}"/>`:''}`;
  return `<g><rect class="mc-hit" data-tip="${esc(tip)}" x="0" y="${y}" width="${W}" height="${row}"/><text class="mc-label" x="${L-10}" y="${cy+4}" text-anchor="end">${esc(r.task)}</text>${bar}</g>`;}).join('');
 const now=o.now!=null?`<line x1="${X(o.now)}" x2="${X(o.now)}" y1="${T-4}" y2="${H-8}" stroke="var(--mc-accent)" stroke-width="2"/><text class="mc-label is-strong" x="${X(o.now)+5}" y="${H-12}">${esc(o.nowLabel??'오늘')}</text>`:'';
 return {height:H,svg:grid+marks+now,legend:groups.map(g=>({label:g,color:colors[g]})),table:table(['일','시작','끝',...(groups.length?['구분']:[]),...(rows.some(r=>r.done!=null)?['진행 %']:[])],rows.map(r=>[r.task,String(r.start),String(r.end),...(groups.length?[r.group??'']:[]),...(rows.some(x=>x.done!=null)?[r.done!=null?r.done*100:'—']:[])]),ctx.fmt)};
}
// Lollipop: a ranked list drawn light, a stick and a dot per item.
function lollipop(ctx){
 const {spec,o,W}=ctx,x=spec.encoding.x,k=keysOf(spec.encoding.y)[0],rows=o.sort===false?spec.data:[...spec.data].sort((a,b)=>(b[k]??0)-(a[k]??0)),row=o.rowHeight??28,T=6,H=T+rows.length*row+22;
 const L=Math.min(W*.36,Math.max(...rows.map(r=>ctx.text(r[x],13)))+14),sc=niceTicks(Math.min(0,...rows.map(r=>r[k])),Math.max(...rows.map(r=>r[k])),4),R=W-ctx.text(ctx.fmt(sc.hi),12,600)-14,X=v=>L+(R-L)*(v-sc.lo)/(sc.hi-sc.lo),u=o.unit??spec.unit??'';
 const grid=sc.ticks.map(v=>`<line class="mc-grid" x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${H-22}"/><text class="mc-tick" x="${X(v)}" y="${H-6}" text-anchor="middle">${esc(ctx.fmt.axis(v))}</text>`).join('');
 const marks=rows.map((r,i)=>{const cy=T+i*row+row/2,v=r[k]??0,on=r[x]===o.highlight,c=o.highlight!=null?(on?'var(--mc-accent)':'var(--mc-neutral-3)'):'var(--mc-s1)';
  return `<g><rect class="mc-hit" data-tip="${esc(`<strong>${esc(r[x])}</strong><span>${ctx.fmt(v)}${u?' '+u:''}</span>`)}" x="0" y="${cy-row/2}" width="${W}" height="${row}"/><text class="mc-label${on?' is-strong':''}" x="${L-10}" y="${cy+4}" text-anchor="end">${esc(r[x])}</text><line x1="${X(0)}" x2="${X(v)}" y1="${cy}" y2="${cy}" stroke="${c}" stroke-width="2"/><circle cx="${X(v)}" cy="${cy}" r="${on?7:5.5}" fill="${c}"/><text class="mc-value" x="${X(v)+(v>=0?11:-11)}" y="${cy+4}" text-anchor="${v>=0?'start':'end'}">${esc(ctx.fmt(v))}</text></g>`;}).join('');
 return {height:H,svg:grid+marks,table:table([x,spec.labels?.[k]??k],rows.map(r=>[r[x],r[k]??0]),ctx.fmt)};
}
// Radar: a few series over the same measures. rows are series {name, measure1, ...}; encoding {series, axes:[...]}; options.max.
function radar(ctx){
 const {spec,o,W}=ctx,axes=spec.encoding.axes,sk=spec.encoding.series??'name',rows=spec.data,names=rows.map(r=>r[sk]),colors=colorFor(o,names);
 const H=o.height??clamp(Math.round(W*.8),280,460),lw=Math.max(...axes.map(a=>ctx.text(spec.labels?.[a]??a,12,600))),cx=W/2,cy=H/2+4,Rr=Math.min(W/2-lw-18,H/2-30),max=o.max??niceTicks(0,Math.max(...rows.flatMap(r=>axes.map(a=>r[a]??0))),4).hi;
 const ang=i=>-Math.PI/2+i*2*Math.PI/axes.length,P=(i,v)=>[cx+Math.cos(ang(i))*Rr*v/max,cy+Math.sin(ang(i))*Rr*v/max];
 let g='';for(const f of [.25,.5,.75,1])g+=`<polygon class="mc-grid" points="${axes.map((_,i)=>P(i,max*f).join(',')).join(' ')}" fill="none"/>`;
 g+=axes.map((a,i)=>{const [x,y]=P(i,max),[lx,ly]=P(i,max*1.1),c=Math.cos(ang(i));return `<line class="mc-grid" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/><text class="mc-label" x="${lx}" y="${ly+4}" text-anchor="${Math.abs(c)<.2?'middle':c>0?'start':'end'}">${esc(spec.labels?.[a]??a)}</text>`;}).join('')+`<text class="mc-tick" x="${cx+10}" y="${cy-Rr+16}">${esc(ctx.fmt(max))}</text>`;
 const order=[...rows].sort((a,b)=>(a[sk]===o.highlight)-(b[sk]===o.highlight));
 const shapes=order.map(r=>{const c=colors[r[sk]],on=r[sk]===o.highlight,pts=axes.map((a,i)=>P(i,clamp(r[a]??0,0,max)));
  return `<polygon class="mc-mark" data-tip="${esc(`<strong>${esc(r[sk])}</strong>`+axes.map(a=>`<span>${esc(spec.labels?.[a]??a)} ${ctx.fmt(r[a]??0)}</span>`).join(''))}" points="${pts.map(p=>p.join(',')).join(' ')}" fill="${c}" fill-opacity="${o.highlight==null||on?.22:.08}" stroke="${c}" stroke-width="${on?2.5:1.5}"/>${pts.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="${c}"/>`).join('')}`;}).join('');
 return {height:H,svg:g+shapes,legend:rows.length>1?names.map(n=>({label:n,color:colors[n]})):[],table:table([sk==='name'?'':sk,...axes.map(a=>spec.labels?.[a]??a)],rows.map(r=>[r[sk],...axes.map(a=>r[a]??0)]),ctx.fmt)};
}
// Funnel: stages that narrow; each step shows what share went on from the one before, and from the start.
function funnel(ctx){
 const {spec,o,W}=ctx,lk=spec.encoding?.label??'label',vk=spec.encoding?.value??'value',rows=spec.data,row=o.rowHeight??44,T=4,H=T+rows.length*row+4,first=rows[0][vk]||1,max=Math.max(...rows.map(r=>r[vk]));
 const lab=Math.min(W*.32,Math.max(...rows.map(r=>ctx.text(r[lk],13,600)))+16),rate=Math.max(...rows.map((r,i)=>ctx.text(i?`다음 ${ctx.fmt(r[vk]/rows[i-1][vk]*100)}%`:'',12)))+12,cx=lab+(W-lab-rate)/2,wmax=W-lab-rate-8,u=o.unit??spec.unit??'';
 const marks=rows.map((r,i)=>{const w=Math.max(4,wmax*r[vk]/max),y=T+i*row,on=r[lk]===o.highlight,c=o.highlight!=null?(on?'var(--mc-accent)':'var(--mc-neutral)'):'var(--mc-s1)',step=i?r[vk]/rows[i-1][vk]*100:null;
  const tip=`<strong>${esc(r[lk])}</strong><span>${ctx.fmt(r[vk])}${u?' '+u:''}</span><span>처음의 ${ctx.fmt(r[vk]/first*100,1)}%</span>${step!=null?`<span>앞 단계의 ${ctx.fmt(step,1)}%</span>`:''}`;
  return `<g><rect class="mc-hit" data-tip="${esc(tip)}" x="0" y="${y}" width="${W}" height="${row}"/><text class="mc-label is-strong" x="${lab-12}" y="${y+row/2+4}" text-anchor="end">${esc(r[lk])}</text><rect class="mc-mark" x="${cx-w/2}" y="${y+4}" width="${w}" height="${row-8}" rx="4" fill="${c}"/><text class="mc-on-mark" x="${cx}" y="${y+row/2+5}" text-anchor="middle" style="fill:${inkOn(ctx.card,c)}">${w>ctx.text(ctx.fmt(r[vk]),13,600)+12?esc(ctx.fmt(r[vk])):''}</text>${step!=null?`<text class="mc-tick" x="${W-4}" y="${y+row/2+4}" text-anchor="end">다음 ${esc(ctx.fmt(step))}%</text>`:''}</g>`;}).join('');
 return {height:H,svg:marks,table:table([lk,vk,'처음 대비 %','앞 단계 대비 %'],rows.map((r,i)=>[r[lk],r[vk],r[vk]/first*100,i?r[vk]/rows[i-1][vk]*100:'—']),ctx.fmt)};
}
// Pareto: causes largest first as shares, with the running total on the same 0-100 % axis (never a second axis).
function pareto(ctx){
 const {spec,o,W}=ctx,lk=spec.encoding?.label??'label',vk=spec.encoding?.value??'value',rows=[...spec.data].sort((a,b)=>b[vk]-a[vk]),total=rows.reduce((a,r)=>a+r[vk],0)||1;
 let run=0;const items=rows.map(r=>{const share=r[vk]/total*100;run+=share;return {r,share,cum:run};});
 const H=o.height??clamp(Math.round(W*.42),220,340),T=14,B=30,sc={lo:0,hi:100,ticks:[0,25,50,75,100]},L=leftPad({...ctx,fmt:Object.assign(v=>ctx.fmt(v)+'%',{axis:v=>v+'%'})},sc),R=W-8,band=(R-L)/items.length,Y=v=>T+(H-T-B)*(1-v/100),cut=o.cut??80,u=o.unit??spec.unit??'';
 const axis=sc.ticks.map(v=>`<line class="mc-grid${v===0?' is-zero':''}" x1="${L}" x2="${R}" y1="${Y(v)}" y2="${Y(v)}"/><text class="mc-tick" x="${L-8}" y="${Y(v)+4}" text-anchor="end">${v}%</text>`).join('');
 const firstOver=items.findIndex(x=>x.cum>=cut);
 const bars=items.map((x,i)=>{const x0=L+i*band+band*.18,w=band*.64,vital=i<=firstOver;return `<g><rect class="mc-hit" data-tip="${esc(`<strong>${esc(x.r[lk])}</strong><span>${ctx.fmt(x.r[vk])}${u?' '+u:''} · ${ctx.fmt(x.share,1)}%</span><span>누적 ${ctx.fmt(x.cum,1)}%</span>`)}" x="${L+i*band}" y="${T}" width="${band}" height="${H-T-B}"/><rect class="mc-mark" x="${x0}" y="${Y(x.share)}" width="${w}" height="${Y(0)-Y(x.share)}" rx="3" fill="${vital?'var(--mc-accent)':'var(--mc-neutral)'}"/></g>`;}).join('');
 const pts=items.map((x,i)=>[L+i*band+band/2,Y(x.cum)]);
 const line=`<polyline class="mc-line" points="${pts.map(p=>p.join(',')).join(' ')}" stroke="var(--mc-text)"/>${pts.map(([a,b])=>`<circle class="mc-dot" cx="${a}" cy="${b}" r="3.5" fill="var(--mc-text)"/>`).join('')}<line class="mc-join" x1="${L}" x2="${R}" y1="${Y(cut)}" y2="${Y(cut)}"/><text class="mc-tick" x="${R}" y="${Y(cut)-5}" text-anchor="end">누적 ${cut}%</text>`;
 return {height:H,svg:axis+bars+line+xLabels(ctx,items.map(x=>String(x.r[lk])),i=>L+i*band+band/2,H-10,band),legend:[{label:`누적 ${cut}%까지 (${firstOver+1}개)`,color:'var(--mc-accent)'},{label:'나머지',color:'var(--mc-neutral)'},{label:'누적 비율',color:'var(--mc-text)',line:true}],
  table:table([lk,vk,'%','누적 %'],items.map(x=>[x.r[lk],x.r[vk],x.share,x.cum]),ctx.fmt)};
}

// ---------- fourth set: distributions and parts of a whole ----------
// Smoothed density of a set of numbers (Gaussian kernel, Silverman bandwidth), sampled at xs.
function density(vals,xs){
 const n=vals.length,mean=vals.reduce((a,v)=>a+v,0)/n,sd=Math.sqrt(vals.reduce((a,v)=>a+(v-mean)**2,0)/n)||1,s=[...vals].sort((a,b)=>a-b),iqr=(s[Math.floor(n*.75)]-s[Math.floor(n*.25)])||sd,h=.9*Math.min(sd,iqr/1.34)*n**-.2||1;
 return xs.map(x=>{let a=0;for(const v of vals){const u=(x-v)/h;if(u>-4&&u<4)a+=Math.exp(-.5*u*u);}return a/(n*h*Math.sqrt(2*Math.PI));});
}
const groupsOf=(spec,o)=>o.groups??spec.data.reduce((a,r)=>{(a[r[spec.encoding.group]]??=[]).push(r[spec.encoding.value]);return a;},{});
function numAxis(ctx,sc,X,y,L,R){let lastEnd=-Infinity;return sc.ticks.filter(v=>{const w=ctx.text(ctx.fmt.axis(v),12),s=X(v)-w/2;if(s<lastEnd+6||X(v)<L-1||X(v)>R+1)return false;lastEnd=s+w;return true;}).map(v=>`<text class="mc-tick" x="${X(v)}" y="${y}" text-anchor="middle">${esc(ctx.fmt.axis(v))}</text>`).join('');}

// Beeswarm: one dot per value, nudged apart so none overlap. Up to a few hundred values per group.
function beeswarm(ctx){
 const {spec,o,W}=ctx,groups=spec.encoding?.group||o.groups?groupsOf(spec,o):{'':valuesOf(spec,o)},names=Object.keys(groups),all=names.flatMap(n=>groups[n]),r=o.radius??(all.length>300?2.6:4);
 const sc=niceTicks(Math.min(...all),Math.max(...all),5),L=names.length>1||names[0]?Math.min(W*.28,Math.max(...names.map(n=>ctx.text(n,13)))+14):10,R=W-10,X=v=>L+(R-L)*(v-sc.lo)/(sc.hi-sc.lo),u=o.unit??spec.unit??'';
 const lanes=names.map(n=>{const placed=[];let span=0;for(const v of [...groups[n]].sort((a,b)=>a-b)){const x=X(v);let y=0;for(let k=0;k<400;k++){const cand=k===0?0:Math.ceil(k/2)*(k%2?1:-1)*r*1.05;if(!placed.some(p=>Math.abs(p.x-x)<2*r&&Math.hypot(p.x-x,p.y-cand)<2*r)){y=cand;break;}}placed.push({x,y,v});span=Math.max(span,Math.abs(y));}return {n,placed,span:span+r+6};});
 let top=8;const marks=lanes.map((ln,i)=>{const cy=top+ln.span;top+=ln.span*2;const on=o.highlight===ln.n,c=o.highlight!=null?(on?'var(--mc-accent)':'var(--mc-neutral-3)'):`var(--mc-s${i%8+1})`;
  return `${ln.n?`<text class="mc-label${on?' is-strong':''}" x="${L-10}" y="${cy+4}" text-anchor="end">${esc(ln.n)}</text>`:''}${ln.placed.map(p=>`<circle class="mc-mark" data-tip="${esc(`<strong>${esc(ln.n||spec.title||'')}</strong><span>${ctx.fmt(p.v)}${u?' '+u:''}</span>`)}" cx="${p.x.toFixed(1)}" cy="${(cy+p.y).toFixed(1)}" r="${r}" fill="${c}" fill-opacity=".85"/>`).join('')}`;}).join('');
 const H=top+26,grid=sc.ticks.map(v=>`<line class="mc-grid" x1="${X(v)}" x2="${X(v)}" y1="4" y2="${H-24}"/>`).join('');
 // Every dot is one value; keyboard reading would mean hundreds of stops, so dots answer the pointer and the table answers the keyboard.
 return {height:H,svg:grid+marks+numAxis(ctx,sc,X,H-8,L,R),noKeys:true,table:table(['','개수','최소','중앙값','최대'],lanes.map(ln=>{const s=ln.placed.map(p=>p.v);return [ln.n||'전체',s.length,s[0],s[Math.floor(s.length/2)],s[s.length-1]];}),ctx.fmt)};
}
// Ridgeline: one smoothed shape per group, stacked and overlapping, like hills seen from the side.
function ridgeline(ctx){
 const {spec,o,W}=ctx,groups=groupsOf(spec,o),names=Object.keys(groups),all=names.flatMap(n=>groups[n]),sc=niceTicks(Math.min(...all),Math.max(...all),5);
 const row=o.rowHeight??26,overlap=o.overlap??2.4,T=row*overlap,H=T+names.length*row+30,L=Math.min(W*.22,Math.max(...names.map(n=>ctx.text(n,12)))+12),R=W-10,X=v=>L+(R-L)*(v-sc.lo)/(sc.hi-sc.lo);
 const xs=Array.from({length:80},(_,i)=>sc.lo+(sc.hi-sc.lo)*i/79),dens=names.map(n=>density(groups[n],xs)),peak=Math.max(...dens.flat()),f=ramp([ctx.card.css('--mc-cold','#3987e5'),ctx.card.css('--mc-warm','#d95926')]);
 const means=names.map(n=>groups[n].reduce((a,v)=>a+v,0)/groups[n].length),mlo=Math.min(...means),mhi=Math.max(...means),u=o.unit??spec.unit??'';
 const marks=names.map((n,i)=>{const base=T+i*row+row,pts=xs.map((x,k)=>[X(x),base-dens[i][k]/peak*row*overlap]),c=o.highlight!=null?(n===o.highlight?'var(--mc-accent)':'var(--mc-neutral)'):`rgb(${f((means[i]-mlo)/((mhi-mlo)||1)).join(',')})`;
  return `<g data-tip="${esc(`<strong>${esc(n)}</strong><span>평균 ${ctx.fmt(means[i],1)}${u?' '+u:''}</span><span>${groups[n].length}개</span>`)}"><path class="mc-mark" d="M${X(sc.lo)},${base}L${pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join('L')}L${X(sc.hi)},${base}Z" fill="${c}" fill-opacity=".8" stroke="var(--mc-surface)" stroke-width="1.5"/><text class="mc-tick" x="${L-8}" y="${base-2}" text-anchor="end">${esc(n)}</text></g>`;}).join('');
 return {height:H,svg:sc.ticks.map(v=>`<line class="mc-grid" x1="${X(v)}" x2="${X(v)}" y1="${T*.4}" y2="${H-24}"/>`).join('')+marks+numAxis(ctx,sc,X,H-8,L,R),
  table:table(['','평균','최소','최대','개수'],names.map((n,i)=>[n,means[i],Math.min(...groups[n]),Math.max(...groups[n]),groups[n].length]),ctx.fmt)};
}
// Violin: each group's density mirrored around its row, with the median and the middle half marked.
function violin(ctx){
 const {spec,o,W}=ctx,groups=groupsOf(spec,o),names=Object.keys(groups),all=names.flatMap(n=>groups[n]),sc=niceTicks(Math.min(...all),Math.max(...all),5),u=o.unit??spec.unit??'';
 const row=o.rowHeight??64,T=6,H=T+names.length*row+30,L=Math.min(W*.3,Math.max(...names.map(n=>ctx.text(n,13)))+14),R=W-10,X=v=>L+(R-L)*(v-sc.lo)/(sc.hi-sc.lo);
 const xs=Array.from({length:80},(_,i)=>sc.lo+(sc.hi-sc.lo)*i/79),dens=names.map(n=>density(groups[n],xs)),peak=Math.max(...dens.flat());
 const q=(s,p)=>s[Math.min(s.length-1,Math.floor((s.length-1)*p))];
 const marks=names.map((n,i)=>{const cy=T+i*row+row/2,h=row*.46,s=[...groups[n]].sort((a,b)=>a-b),on=o.highlight===n,c=o.highlight!=null?(on?'var(--mc-accent)':'var(--mc-neutral)'):`var(--mc-s${i%8+1})`;
  const top=xs.map((x,k)=>[X(x),cy-dens[i][k]/peak*h]),bot=[...xs].reverse().map((x,k)=>[X(x),cy+dens[i][xs.length-1-k]/peak*h]);
  return `<g><rect class="mc-hit" data-tip="${esc(`<strong>${esc(n)}</strong><span>중앙값 ${ctx.fmt(q(s,.5))}${u?' '+u:''}</span><span>가운데 절반 ${ctx.fmt(q(s,.25))}–${ctx.fmt(q(s,.75))}</span><span>${s.length}개</span>`)}" x="0" y="${cy-row/2}" width="${W}" height="${row}"/><text class="mc-label${on?' is-strong':''}" x="${L-10}" y="${cy+4}" text-anchor="end">${esc(n)}</text><path class="mc-mark" d="M${top.map(p=>p.map(v=>v.toFixed(1)).join(',')).join('L')}L${bot.map(p=>p.map(v=>v.toFixed(1)).join(',')).join('L')}Z" fill="${c}" fill-opacity=".75"/><line x1="${X(q(s,.25))}" x2="${X(q(s,.75))}" y1="${cy}" y2="${cy}" stroke="var(--mc-text)" stroke-width="4" stroke-linecap="round"/><circle cx="${X(q(s,.5))}" cy="${cy}" r="4" fill="var(--mc-surface)" stroke="var(--mc-text)" stroke-width="2"/></g>`;}).join('');
 return {height:H,svg:sc.ticks.map(v=>`<line class="mc-grid" x1="${X(v)}" x2="${X(v)}" y1="${T}" y2="${H-24}"/>`).join('')+marks+numAxis(ctx,sc,X,H-8,L,R),
  table:table(['','최소','1사분위','중앙값','3사분위','최대'],names.map(n=>{const s=[...groups[n]].sort((a,b)=>a-b);return [n,s[0],q(s,.25),q(s,.5),q(s,.75),s[s.length-1]];}),ctx.fmt)};
}
// Hexbin: many points counted into hexagons, shaded by how many fall in each. encoding {x, y} or options {x:[], y:[]}.
function hexbin(ctx){
 const {spec,o,W,card}=ctx,xs=o.x??spec.data.map(r=>r[spec.encoding.x]),ys=o.y??spec.data.map(r=>r[spec.encoding.y]),H=o.height??clamp(Math.round(W*.55),240,400),T=14,B=34;
 const sy=niceTicks(Math.min(...ys),Math.max(...ys),4),sx=niceTicks(Math.min(...xs),Math.max(...xs),5),L=leftPad(ctx,sy),R=W-10,X=v=>L+(R-L)*(v-sx.lo)/(sx.hi-sx.lo),Y=v=>T+(H-T-B)*(1-(v-sy.lo)/(sy.hi-sy.lo));
 const rad=o.hexRadius??clamp(Math.round(W/70),5,12),dx=rad*Math.sqrt(3),dy=rad*1.5,bins=new Map();
 xs.forEach((x,i)=>{const px=X(x),py=Y(ys[i]);let row=Math.round((py-T)/dy),col=Math.round((px-L-(row&1?dx/2:0))/dx);const k=row+'|'+col;const b=bins.get(k)??{row,col,n:0,sx:0,sy:0};b.n++;b.sx+=x;b.sy+=ys[i];bins.set(k,b);});
 const most=Math.max(...[...bins.values()].map(b=>b.n)),f=ramp([card.css('--mc-seq-low','#1f2a33'),card.css('--mc-seq-high','#7fd3c0')]),hex=(cx,cy)=>Array.from({length:6},(_,k)=>{const a=Math.PI/3*k+Math.PI/6;return `${(cx+rad*Math.cos(a)).toFixed(1)},${(cy+rad*Math.sin(a)).toFixed(1)}`;}).join(' ');
 const name=k=>spec.labels?.[k]??k,ux=o.xUnit??'',uy=o.yUnit??'';
 const cells=[...bins.values()].map(b=>{const cx=L+b.col*dx+(b.row&1?dx/2:0),cy=T+b.row*dy;if(cx<L-rad||cx>R+rad||cy<T-rad||cy>H-B+rad)return '';
  return `<polygon class="mc-mark" data-tip="${esc(`<strong>${ctx.fmt(b.n)}개</strong><span>${esc(name(spec.encoding?.x??'x'))} 평균 ${ctx.fmt(b.sx/b.n,1)}${ux}</span><span>${esc(name(spec.encoding?.y??'y'))} 평균 ${ctx.fmt(b.sy/b.n,1)}${uy}</span>`)}" points="${hex(cx,cy)}" fill="rgb(${f(.12+.88*Math.log(1+b.n)/Math.log(1+most)).join(',')})"/>`;}).join('');
 const xt=numAxis(ctx,sx,X,H-B+16,L,R)+`<text class="mc-tick" x="${R}" y="${H-1}" text-anchor="end">${esc(name(spec.encoding?.x??o.xLabel??'x'))} →</text><text class="mc-tick" x="${L}" y="${T-3}">↑ ${esc(name(spec.encoding?.y??o.yLabel??'y'))}</text>`;
 return {height:H,svg:yAxis(ctx,sy,L,R,T,H-B)+cells+xt,noKeys:true,legend:[{label:'점이 많을수록 진하게',color:`rgb(${f(1).join(',')})`}],table:`<p class="mc-note">점 ${ctx.fmt(xs.length)}개를 육각형 ${ctx.fmt(bins.size)}칸으로 셌습니다. 칸을 눌러 읽습니다.</p>`};
}
// Waffle: a hundred squares, each one percent. Parts by the largest-remainder rule so they add to exactly 100.
function waffle(ctx){
 const {spec,o,W}=ctx,lk=spec.encoding?.label??'label',vk=spec.encoding?.value??'value',rows=spec.data,total=rows.reduce((a,r)=>a+r[vk],0)||1,colors=colorFor(o,rows.map(r=>r[lk]));
 const raw=rows.map(r=>r[vk]/total*100),cells=raw.map(Math.floor);let left=100-cells.reduce((a,v)=>a+v,0);raw.map((v,i)=>[v-Math.floor(v),i]).sort((a,b)=>b[0]-a[0]).forEach(([,i])=>{if(left>0){cells[i]++;left--;}});
 const size=Math.min(o.cell??26,(Math.min(W,420)-9*3)/10),gap=3,side=size*10+gap*9,H=side+8,x0=(W-side)/2;let k=0,sq='';
 cells.forEach((n,i)=>{const r=rows[i];for(let j=0;j<n;j++,k++){const cx=x0+(k%10)*(size+gap),cy=4+Math.floor(k/10)*(size+gap);sq+=`<rect class="mc-mark" data-tip="${esc(`<strong>${esc(r[lk])}</strong><span>${ctx.fmt(r[vk])}${o.unit??spec.unit?' '+(o.unit??spec.unit):''} · ${ctx.fmt(raw[i],1)}%</span>`)}" x="${cx}" y="${cy}" width="${size}" height="${size}" rx="${size/6}" fill="${colors[r[lk]]}"/>`;}});
 return {height:H,svg:sq,noKeys:true,legend:rows.map((r,i)=>({label:`${r[lk]} ${cells[i]}%`,color:colors[r[lk]]})),table:table([lk,vk,'%'],rows.map((r,i)=>[r[lk],r[vk],raw[i]]),ctx.fmt)};
}
// 100 % bars: each row split into its parts' shares. rows {label, part1, part2, ...}; encoding {x, y:[parts]}.
function stack100(ctx){
 const {spec,o,W}=ctx,x=spec.encoding.x,ys=keysOf(spec.encoding.y),rows=spec.data,colors=colorFor(o,ys),row=o.rowHeight??34,T=4,H=T+rows.length*row+24,L=Math.min(W*.3,Math.max(...rows.map(r=>ctx.text(r[x],13)))+14),R=W-8,X=p=>L+(R-L)*p/100;
 const marks=rows.map((r,i)=>{const tot=ys.reduce((a,k)=>a+(r[k]??0),0)||1,y=T+i*row;let acc=0;
  return `<text class="mc-label" x="${L-10}" y="${y+row/2+4}" text-anchor="end">${esc(r[x])}</text>`+ys.map(k=>{const p=(r[k]??0)/tot*100,x0=X(acc),w=X(acc+p)-x0;acc+=p;if(w<=0)return '';const ink=inkOn(ctx.card,colors[k]);
   return `<rect class="mc-mark" data-tip="${esc(`<strong>${esc(r[x])} · ${esc(spec.labels?.[k]??k)}</strong><span>${ctx.fmt(r[k]??0)}${o.unit??spec.unit?' '+(o.unit??spec.unit):''} · ${ctx.fmt(p,1)}%</span>`)}" x="${x0+.5}" y="${y+4}" width="${Math.max(0,w-1)}" height="${row-8}" fill="${colors[k]}"/>${w>ctx.text(ctx.fmt(p,0)+'%',12,600)+8?`<text class="mc-on-mark" x="${x0+w/2}" y="${y+row/2+4}" text-anchor="middle" style="fill:${ink};font-size:12px">${ctx.fmt(p,0)}%</text>`:''}`;}).join('');}).join('');
 const axis=[0,25,50,75,100].map(p=>`<text class="mc-tick" x="${X(p)}" y="${H-6}" text-anchor="${p===0?'start':p===100?'end':'middle'}">${p}%</text>`).join('');
 return {height:H,svg:marks+axis,legend:ys.map(k=>({label:spec.labels?.[k]??k,color:colors[k]})),table:table([x,...ys.map(k=>spec.labels?.[k]??k)],rows.map(r=>[r[x],...ys.map(k=>r[k]??0)]),ctx.fmt)};
}
// Marimekko: columns as wide as their totals, each split into its parts' shares.
function marimekko(ctx){
 const {spec,o,W}=ctx,x=spec.encoding.x,ys=keysOf(spec.encoding.y),rows=spec.data,colors=colorFor(o,ys),H=o.height??clamp(Math.round(W*.5),240,380),T=8,B=34,L=40,R=W-8,Y=p=>T+(H-T-B)*(1-p/100);
 const tots=rows.map(r=>ys.reduce((a,k)=>a+(r[k]??0),0)),grand=tots.reduce((a,v)=>a+v,0)||1;let cx=L;
 const marks=rows.map((r,i)=>{const w=(R-L)*tots[i]/grand,x0=cx;cx+=w;let acc=0;
  const cells=ys.map(k=>{const p=(r[k]??0)/(tots[i]||1)*100,y1=Y(acc+p),y0=Y(acc);acc+=p;const h=y0-y1,ink=inkOn(ctx.card,colors[k]);
   return `<rect class="mc-mark" data-tip="${esc(`<strong>${esc(r[x])} · ${esc(spec.labels?.[k]??k)}</strong><span>${ctx.fmt(r[k]??0)} · 열 안 ${ctx.fmt(p,1)}% · 전체의 ${ctx.fmt((r[k]??0)/grand*100,1)}%</span>`)}" x="${x0+1}" y="${y1+1}" width="${Math.max(0,w-2)}" height="${Math.max(0,h-2)}" fill="${colors[k]}"/>${w>40&&h>18?`<text class="mc-on-mark" x="${x0+6}" y="${y1+15}" style="fill:${ink};font-size:12px">${ctx.fmt(p,0)}%</text>`:''}`;}).join('');
  return cells+`<text class="mc-tick" x="${x0+w/2}" y="${H-B+16}" text-anchor="middle">${w>ctx.text(r[x],12)+4?esc(r[x]):''}</text><text class="mc-tick" x="${x0+w/2}" y="${H-B+30}" text-anchor="middle">${w>34?ctx.fmt(tots[i]/grand*100,0)+'%':''}</text>`;}).join('');
 const axis=[0,50,100].map(p=>`<text class="mc-tick" x="${L-6}" y="${Y(p)+4}" text-anchor="end">${p}%</text>`).join('');
 return {height:H+6,svg:axis+marks,legend:ys.map(k=>({label:spec.labels?.[k]??k,color:colors[k]})),table:table([x,...ys.map(k=>spec.labels?.[k]??k),'합계'],rows.map((r,i)=>[r[x],...ys.map(k=>r[k]??0),tots[i]]),ctx.fmt)};
}
// Radial bars: one ring per item, its arc as long as its share of the largest (or of options.max).
function radialbar(ctx){
 const {spec,o,W}=ctx,lk=spec.encoding?.label??'label',vk=spec.encoding?.value??'value',rows=spec.data,max=o.max??Math.max(...rows.map(r=>r[vk])),colors=colorFor(o,rows.map(r=>r[lk]));
 const H=o.height??clamp(Math.round(W*.6),240,380),cx=W/2,cy=H/2,R0=Math.min(W/2-10,H/2-10),ring=Math.min(26,R0*.75/rows.length),gap=ring*.25;
 const marks=rows.map((r,i)=>{const rad=R0-i*ring-ring/2,t=clamp(r[vk]/max,0,.9999),a0=-Math.PI/2,a1=a0+t*2*Math.PI,lg=t>.5?1:0,p=a=>[cx+rad*Math.cos(a),cy+rad*Math.sin(a)],[x0,y0]=p(a0),[x1,y1]=p(a1),sw=ring-gap;
  return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="var(--mc-line)" stroke-width="${sw}"/><path class="mc-mark" data-tip="${esc(`<strong>${esc(r[lk])}</strong><span>${ctx.fmt(r[vk])}${o.unit??spec.unit?' '+(o.unit??spec.unit):''} · ${ctx.fmt(r[vk]/max*100,0)}%</span>`)}" d="M${x0},${y0}A${rad},${rad} 0 ${lg} 1 ${x1},${y1}" fill="none" stroke="${colors[r[lk]]}" stroke-width="${sw}" stroke-linecap="round"/><text class="mc-label" x="${cx-8}" y="${cy-rad+4}" text-anchor="end">${esc(r[lk])} <tspan class="is-strong">${esc(ctx.fmt(r[vk]))}</tspan></text>`;}).join('');
 return {height:H,svg:marks,table:table([lk,vk,'%'],rows.map(r=>[r[lk],r[vk],r[vk]/max*100]),ctx.fmt)};
}

// ---------- fourth set: structures, networks and time ----------
// A nested tree {name, value?, children?}; a node's value is its own or the sum of its children.
function sumTree(n,depth=0,parent=null){n.depth=depth;n.parent=parent;if(n.children?.length){n.children.forEach(c=>sumTree(c,depth+1,n));n.total=n.children.reduce((a,c)=>a+c.total,0);}else n.total=n.value??1;return n;}
const walk=(n,f)=>{f(n);n.children?.forEach(c=>walk(c,f));};
const pathOf=n=>{const p=[];for(let x=n;x;x=x.parent)p.unshift(x.name);return p;};
// Sunburst: the root in the middle, each ring one level deeper, arcs as wide as their share.
function sunburst(ctx){
 const {spec,o,W,card}=ctx,root=sumTree(structuredClone(o.tree??spec.data)),H=o.height??clamp(Math.round(W*.8),280,480),cx=W/2,cy=H/2;let deep=0;walk(root,n=>{deep=Math.max(deep,n.depth);});
 const R0=Math.min(W,H)/2-8,ring=R0/(deep+.6),tops=root.children??[],colors=colorFor(o,tops.map(c=>c.name)),u=o.unit??spec.unit??'',surface=card.css('--mc-surface','#171c21');
 let arcs='';const lay=(n,a0,a1,base)=>{if(n.depth>0){const r0=ring*(n.depth-.4),r1=ring*(n.depth+.6)-2,c=base,shade=n.depth>1?mixHex(card,c,surface,.22*(n.depth-1)):c,p=(a,r)=>[cx+r*Math.sin(a),cy-r*Math.cos(a)],[x1,y1]=p(a0,r1),[x2,y2]=p(a1,r1),[x3,y3]=p(a1,r0),[x4,y4]=p(a0,r0),lg=a1-a0>Math.PI?1:0;
   const mid=(a0+a1)/2,rm=(r0+r1)/2,[tx,ty]=p(mid,rm),fits=(a1-a0)*rm>ctx.text(n.name,12,600)+10&&r1-r0>16;
   arcs+=`<path class="mc-mark" data-tip="${esc(`<strong>${esc(pathOf(n).slice(1).join(' › '))}</strong><span>${ctx.fmt(n.total)}${u?' '+u:''} · 전체의 ${ctx.fmt(n.total/root.total*100,1)}%</span>`)}" d="M${x1},${y1}A${r1},${r1} 0 ${lg} 1 ${x2},${y2}L${x3},${y3}A${r0},${r0} 0 ${lg} 0 ${x4},${y4}Z" fill="${shade}" stroke="var(--mc-surface)" stroke-width="1.5"/>${fits?`<text class="mc-on-mark" x="${tx}" y="${ty+4}" text-anchor="middle" style="fill:${inkOn(card,shade)};font-size:12px">${esc(n.name)}</text>`:''}`;}
  let a=a0;n.children?.forEach(c=>{const b=a+(a1-a0)*c.total/n.total;lay(c,a,b,n.depth===0?colors[c.name]:base);a=b;});};
 lay(root,0,2*Math.PI,null);
 const center=`<text class="mc-center" x="${cx}" y="${cy+4}" text-anchor="middle" style="font-size:18px">${esc(ctx.fmt(root.total))}</text><text class="mc-tick" x="${cx}" y="${cy+20}" text-anchor="middle">${esc(root.name??'')}</text>`;
 const rows=[];walk(root,n=>{if(n.depth)rows.push([pathOf(n).slice(1).join(' › '),n.total,n.total/root.total*100]);});
 return {height:H,svg:arcs+center,legend:tops.map(c=>({label:c.name,color:colors[c.name]})),table:table(['항목',spec.labels?.value??'값','%'],rows,ctx.fmt)};
}
function mixHex(card,a,b,t){const res=c=>{const m=/var\((--[\w-]+)\)/.exec(c);return m?card.css(m[1]):c;},A=hexRgb(res(a)),B=hexRgb(res(b));return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`;}
// Tree: root on the left, children to the right, leaves spaced evenly down the page.
function tree(ctx){
 const {spec,o,W}=ctx,root=sumTree(structuredClone(o.tree??spec.data)),leaves=[];let deep=0;walk(root,n=>{deep=Math.max(deep,n.depth);if(!n.children?.length)leaves.push(n);});
 const row=o.rowHeight??24,T=10,H=T+leaves.length*row+6,lastW=Math.max(...leaves.map(n=>ctx.text(n.name+(o.showValues===false?'':' '+ctx.fmt(n.total)),12)))+16,L=8,R=W-lastW,X=d=>L+(R-L)*d/Math.max(1,deep),u=o.unit??spec.unit??'';
 leaves.forEach((n,i)=>{n.y=T+i*row+row/2;});const place=n=>{if(n.children?.length){n.children.forEach(place);n.y=(n.children[0].y+n.children[n.children.length-1].y)/2;}};place(root);
 const tops=root.children??[],colors=colorFor(o,tops.map(c=>c.name)),branch=n=>{let x=n;while(x.parent&&x.parent.parent)x=x.parent;return x.depth?colors[x.name]:'var(--mc-text)';};
 let links='',nodes='';const labels=[];walk(root,n=>{const x=X(n.depth);n.children?.forEach(c=>{const x2=X(c.depth),mx=(x+x2)/2;links+=`<path d="M${x},${n.y}C${mx},${n.y} ${mx},${c.y} ${x2},${c.y}" fill="none" stroke="${branch(c)}" stroke-opacity=".55" stroke-width="${1+3*c.total/root.total}"/>`;});
  const leaf=!n.children?.length,lab=n.name+(o.showValues===false?'':' '+ctx.fmt(n.total));
  nodes+=`<circle class="mc-mark" data-tip="${esc(`<strong>${esc(pathOf(n).join(' › '))}</strong><span>${ctx.fmt(n.total)}${u?' '+u:''}</span>`)}" cx="${x}" cy="${n.y}" r="${leaf?3.5:5}" fill="${branch(n)}"/>`;
  labels.push({text:lab,weight:leaf?400:600,cls:`mc-label${leaf?'':' is-strong'}`,cands:leaf?[[x+8,n.y+4]]:[[x+8,n.y-7],[x+8,n.y+15],[x-8,n.y-7,'end'],[x+8,n.y+4]]});});
 const rows=[];walk(root,n=>rows.push([pathOf(n).join(' › '),n.total]));
 return {height:H,svg:links+nodes+placeLabels(ctx,labels.sort((a,b)=>(b.weight??400)-(a.weight??400)),W),table:table(['경로',spec.labels?.value??'값'],rows,ctx.fmt)};
}
// Chord: flows between groups around a circle. options {names:[...], matrix:[[from i to j]]}.
function chord(ctx){
 const {spec,o,W}=ctx,names=o.names,M=o.matrix,n=names.length,colors=colorFor(o,names),H=o.height??clamp(Math.round(W*.8),300,480),cx=W/2,cy=H/2,lw=Math.max(...names.map(s=>ctx.text(s,12,600))),R1=Math.min(W/2-lw-24,H/2-24),R0=R1-12,u=o.unit??spec.unit??'';
 const out=M.map(r=>r.reduce((a,v)=>a+v,0)),inn=names.map((_,j)=>M.reduce((a,r)=>a+r[j],0)),tot=names.map((_,i)=>out[i]+inn[i]),grand=tot.reduce((a,v)=>a+v,0)||1,pad=.03,span=2*Math.PI-pad*n;
 let a=0;const arcs=names.map((_,i)=>{const a0=a,a1=a+span*tot[i]/grand;a=a1+pad;return {a0,a1,cur:a0};}),P=(t,r)=>[cx+r*Math.sin(t),cy-r*Math.cos(t)];
 const seg=(i,v)=>{const g=arcs[i],w=span*v/grand,s=[g.cur,g.cur+w];g.cur+=w;return s;};
 let ribbons='';for(let i=0;i<n;i++)for(let j=0;j<n;j++){const v=M[i][j];if(!v)continue;const [s0,s1]=seg(i,v),[t0,t1]=seg(j,v),[ax,ay]=P(s0,R0),[bx,by]=P(s1,R0),[cx1,cy1]=P(t0,R0),[dx,dy]=P(t1,R0);
  ribbons+=`<path class="mc-band" data-tip="${esc(`<strong>${esc(names[i])} → ${esc(names[j])}</strong><span>${ctx.fmt(v)}${u?' '+u:''}</span>`)}" d="M${ax},${ay}A${R0},${R0} 0 0 1 ${bx},${by}Q${cx},${cy} ${cx1},${cy1}A${R0},${R0} 0 0 1 ${dx},${dy}Q${cx},${cy} ${ax},${ay}Z" style="fill:${colors[names[i]]};stroke:none;opacity:.42"/>`;}
 const ring=arcs.map((g,i)=>{const [x1,y1]=P(g.a0,R1),[x2,y2]=P(g.a1,R1),[x3,y3]=P(g.a1,R0),[x4,y4]=P(g.a0,R0),lg=g.a1-g.a0>Math.PI?1:0,mid=(g.a0+g.a1)/2,[lx,ly]=P(mid,R1+10);
  return `<path class="mc-node" data-tip="${esc(`<strong>${esc(names[i])}</strong><span>보냄 ${ctx.fmt(out[i])} · 받음 ${ctx.fmt(inn[i])}</span>`)}" d="M${x1},${y1}A${R1},${R1} 0 ${lg} 1 ${x2},${y2}L${x3},${y3}A${R0},${R0} 0 ${lg} 0 ${x4},${y4}Z" fill="${colors[names[i]]}"/><text class="mc-label is-strong" x="${lx}" y="${ly+4}" text-anchor="${Math.sin(mid)>.15?'start':Math.sin(mid)<-.15?'end':'middle'}">${esc(names[i])}</text>`;}).join('');
 return {height:H,svg:ribbons+ring,table:table(['보냄 \\ 받음',...names],names.map((s,i)=>[s,...M[i]]),ctx.fmt)};
}
// Network: nodes pulled together by their links and pushed apart from each other; the same input always lands the same way.
// options {nodes:[{id, label?, group?}], links:[{source, target, value?}]}
function network(ctx){
 const {o,W}=ctx,nodes=o.nodes.map(n=>({...n})),links=o.links,H=o.height??clamp(Math.max(Math.round(W*.7),o.nodes.length*24),300,520),by=Object.fromEntries(nodes.map(n=>[n.id,n])),groups=[...new Set(nodes.map(n=>n.group??''))],colors=colorFor(o,groups);
 const deg=Object.fromEntries(nodes.map(n=>[n.id,0]));links.forEach(l=>{deg[l.source]++;deg[l.target]++;});
 nodes.forEach((n,i)=>{const a=i/nodes.length*2*Math.PI;n.x=W/2+Math.cos(a)*W*.3;n.y=H/2+Math.sin(a)*H*.3;});
 const k=Math.sqrt(W*H/nodes.length)*.55;
 for(let it=0;it<320;it++){const t=Math.max(.6,12*(1-it/320));
  for(const a of nodes){a.dx=0;a.dy=0;for(const b of nodes){if(a===b)continue;const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy)||.01,f=k*k/d;a.dx+=dx/d*f;a.dy+=dy/d*f;}}
  for(const l of links){const a=by[l.source],b=by[l.target],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy)||.01,f=d*d/k;a.dx-=dx/d*f;a.dy-=dy/d*f;b.dx+=dx/d*f;b.dy+=dy/d*f;}
  for(const a of nodes){const d=Math.hypot(a.dx,a.dy)||1;a.x=clamp(a.x+a.dx/d*Math.min(d,t),40,W-40);a.y=clamp(a.y+a.dy/d*Math.min(d,t),24,H-24);}}
 const vmax=Math.max(1,...links.map(l=>l.value??1)),r=n=>4+Math.sqrt(deg[n.id])*2.6;
 const edges=links.map(l=>{const a=by[l.source],b=by[l.target];return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="var(--mc-line-strong)" stroke-width="${1+2.5*(l.value??1)/vmax}"/>`;}).join('');
 const dots=nodes.map(n=>{const on=o.highlight===n.id,c=on?'var(--mc-accent)':colors[n.group??''];return `<circle class="mc-mark" data-tip="${esc(`<strong>${esc(n.label??n.id)}</strong><span>연결 ${deg[n.id]}개</span>${n.group?`<span>${esc(n.group)}</span>`:''}`)}" cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${r(n)}" fill="${c}" stroke="var(--mc-surface)" stroke-width="2"/>`;}).join('');
 const taken=nodes.map(n=>[n.x-r(n),n.y-r(n),n.x+r(n),n.y+r(n)]),names=placeLabels(ctx,[...nodes].sort((a,b)=>deg[b.id]-deg[a.id]).map(n=>({text:n.label??n.id,weight:o.highlight===n.id?700:400,cls:`mc-label${o.highlight===n.id?' is-strong':''}`,cands:[[n.x+r(n)+4,n.y+4],[n.x-r(n)-4,n.y+4,'end'],[n.x,n.y-r(n)-5,'middle'],[n.x,n.y+r(n)+13,'middle']]})),W,taken);
 return {height:H,svg:edges+dots+names,legend:o.highlight!=null?[]:groups.filter(Boolean).map(g=>({label:g,color:colors[g]})),table:table(['출발','도착','값'],links.map(l=>[by[l.source].label??l.source,by[l.target].label??l.target,l.value??1]),ctx.fmt)};
}
// Stream: stacked layers around a centre line, so the whole shape breathes with the total.
function stream(ctx){
 const {spec,o,W}=ctx,x=spec.encoding.x,ys=keysOf(spec.encoding.y),rows=spec.data,colors=colorFor(o,ys),H=o.height??clamp(Math.round(W*.4),220,320),T=10,B=30,L=10,R=W-10;
 const totals=rows.map(r=>ys.reduce((a,k)=>a+(r[k]??0),0)),max=Math.max(...totals)||1,X=i=>L+(R-L)*i/Math.max(1,rows.length-1),mid=T+(H-T-B)/2,s=(H-T-B)/max;
 const smooth=pts=>pts.map((p,i)=>{if(!i)return `M${p[0]},${p[1]}`;const a=pts[i-1],m=(a[0]+p[0])/2;return `C${m},${a[1]} ${m},${p[1]} ${p[0]},${p[1]}`;}).join('');
 const base=rows.map((_,i)=>mid-totals[i]*s/2),acc=[...base];
 const layers=ys.map(k=>{const top=rows.map((r,i)=>[X(i),acc[i]]),bot=rows.map((r,i)=>[X(i),acc[i]+(r[k]??0)*s]);rows.forEach((r,i)=>{acc[i]+=(r[k]??0)*s;});
  const back=[...bot].reverse();return `<path class="mc-mark" d="${smooth(top)}L${back[0][0]},${back[0][1]}${smooth(back).replace(/^M[^C]*/,'')}Z" fill="${colors[k]}" fill-opacity=".9" stroke="var(--mc-surface)" stroke-width=".8"/>`;}).join('');
 const hits=rows.map((r,i)=>`<rect class="mc-hit" data-tip="${esc(`<strong>${esc(r[x])}</strong>`+ys.map(k=>`<span><i style="--c:${colors[k]}"></i>${esc(spec.labels?.[k]??k)} ${ctx.fmt(r[k]??0)}</span>`).join(''))}" data-group="${i}" x="${X(i)-(R-L)/Math.max(1,rows.length-1)/2}" y="${T}" width="${(R-L)/Math.max(1,rows.length-1)}" height="${H-T-B}"/><line class="mc-cross" data-mark="${i}" x1="${X(i)}" x2="${X(i)}" y1="${T}" y2="${H-B}"/>`).join('');
 return {height:H,svg:layers+xLabels(ctx,rows.map(r=>String(r[x])),X,H-10,(R-L)/Math.max(1,rows.length-1))+hits,legend:ys.map(k=>({label:spec.labels?.[k]??k,color:colors[k]})),table:table([x,...ys.map(k=>spec.labels?.[k]??k)],rows.map(r=>[r[x],...ys.map(k=>r[k]??0)]),ctx.fmt)};
}
// Sparklines: one small line per measure with its latest value and the change from the first.
// data rows {label, values:[...], unit?}
function sparkline(ctx){
 const {spec,o,W}=ctx,rows=spec.data,row=o.rowHeight??46,H=rows.length*row,lab=Math.min(W*.32,Math.max(...rows.map(r=>ctx.text(r.label,13)))+12),valW=Math.max(...rows.map(r=>ctx.text(ctx.fmt(r.values[r.values.length-1])+(r.unit?' '+r.unit:''),15,700)))+8,chW=Math.max(64,...rows.map(r=>{const a=r.values[0],b=r.values[r.values.length-1];return ctx.text((b>=a?'▲ ':'▼ ')+ctx.fmt(Math.abs(b-a)),12);}))+10,L=lab,R=W-valW-chW-10;
 const marks=rows.map((r,i)=>{const v=r.values,y0=i*row+6,h=row-14,lo=Math.min(...v),hi=Math.max(...v),X=k=>L+(R-L)*k/Math.max(1,v.length-1),Y=x=>y0+h*(1-(x-lo)/((hi-lo)||1)),last=v[v.length-1],d=last-v[0],up=d>=0,good=(r.higherIsBetter??true)===up;
  const imin=v.indexOf(lo),imax=v.indexOf(hi);
  return `<g><rect class="mc-hit" data-tip="${esc(`<strong>${esc(r.label)}</strong><span>마지막 ${ctx.fmt(last)}${r.unit?' '+r.unit:''}</span><span>최저 ${ctx.fmt(lo)} · 최고 ${ctx.fmt(hi)}</span><span>처음보다 ${up?'+':''}${ctx.fmt(d)}</span>`)}" x="0" y="${i*row}" width="${W}" height="${row}"/><text class="mc-label" x="0" y="${y0+h/2+4}">${esc(r.label)}</text><polyline class="mc-line" points="${v.map((x,k)=>`${X(k).toFixed(1)},${Y(x).toFixed(1)}`).join(' ')}" stroke="var(--mc-s1)" stroke-width="1.6"/><circle cx="${X(imin)}" cy="${Y(lo)}" r="2.5" fill="var(--mc-neutral-3)"/><circle cx="${X(imax)}" cy="${Y(hi)}" r="2.5" fill="var(--mc-neutral-3)"/><circle cx="${X(v.length-1)}" cy="${Y(last)}" r="3.5" fill="var(--mc-accent)"/><text class="mc-value" x="${R+10}" y="${y0+h/2+5}" style="font-size:15px;font-weight:700">${esc(ctx.fmt(last))}${r.unit?`<tspan class="mc-tick" style="font-size:12px"> ${esc(r.unit)}</tspan>`:''}</text><text class="mc-tick" x="${W}" y="${y0+h/2+4}" text-anchor="end" style="fill:${good?'var(--mc-up-text,var(--mc-text))':'var(--mc-s2)'}">${up?'▲':'▼'} ${esc(ctx.fmt(Math.abs(d)))}</text></g>`;}).join('');
 return {height:H,svg:marks,table:table(['','처음','마지막','최저','최고'],rows.map(r=>[r.label,r.values[0],r.values[r.values.length-1],Math.min(...r.values),Math.max(...r.values)]),ctx.fmt)};
}
// Timeline: dated events on one line, labels above and below, pushed apart so they never touch.
// rows {date:'YYYY-MM-DD' or number, label, detail?, group?}
function timeline(ctx){
 const {spec,o,W}=ctx,rows=[...spec.data].sort((a,b)=>String(a.date)<String(b.date)?-1:1),isDate=typeof rows[0].date==='string',t=v=>isDate?Date.parse(v+'T00:00:00Z'):v,t0=t(rows[0].date),t1=t(rows[rows.length-1].date),span=(t1-t0)||1,L=16,R=W-16,X=v=>L+(R-L)*(t(v)-t0)/span;
 const groups=[...new Set(rows.map(r=>r.group).filter(Boolean))],colors=colorFor(o,groups.length?groups:['_']),lines=[[],[]],lv=[0,0],lanes=[[],[]];
 const items=rows.map((r,i)=>{const w=ctx.text(r.label,12,600)+8,side=i%2,x=clamp(X(r.date),L+w/2,R-w/2);let lane=0;while(lanes[side][lane]!=null&&lanes[side][lane]>x-w/2-6)lane++;lanes[side][lane]=x+w/2;return {r,x:X(r.date),lx:x,side,lane,w};});
 const depth=[0,1].map(s=>Math.max(1,...items.filter(it=>it.side===s).map(it=>it.lane+1))),gap=34,axisY=44+(depth[0]-1)*gap,H=axisY+24+(depth[1]-1)*gap+20;
 const fmtD=v=>isDate?`${v.slice(0,4)}.${+v.slice(5,7)}.${+v.slice(8,10)}`:ctx.fmt(v);
 const marks=items.map(it=>{const c=colors[it.r.group??'_'],ly=it.side?axisY+24+it.lane*gap:axisY-30-it.lane*gap;
  return `<g data-tip="${esc(`<strong>${esc(it.r.label)}</strong><span>${fmtD(it.r.date)}</span>${it.r.detail?`<span>${esc(it.r.detail)}</span>`:''}`)}"><line x1="${it.x}" x2="${it.lx}" y1="${axisY}" y2="${it.side?ly-13:ly+18}" stroke="var(--mc-line-strong)"/><circle class="mc-mark" cx="${it.x}" cy="${axisY}" r="5" fill="${c}" stroke="var(--mc-surface)" stroke-width="2"/><text class="mc-label is-strong" x="${it.lx}" y="${ly}" text-anchor="middle">${esc(it.r.label)}</text><text class="mc-tick" x="${it.lx}" y="${ly+14}" text-anchor="middle">${esc(fmtD(it.r.date))}</text></g>`;}).join('');
 return {height:H,svg:`<line class="mc-axis" x1="${L}" x2="${R}" y1="${axisY}" y2="${axisY}" stroke-width="2"/>`+marks,legend:groups.map(g=>({label:g,color:colors[g]})),table:table(['날짜','일',...(rows.some(r=>r.detail)?['내용']:[])],rows.map(r=>[fmtD(r.date),r.label,...(rows.some(x=>x.detail)?[r.detail??'']:[])]),ctx.fmt)};
}

// ---------- fourth set: maps and the bar race ----------
// Maps take options.map, a shape file such as geo/kr-sido.json, passed in by the page. Regions are matched by id
// (KR-11), full name (서울특별시) or short name (서울). The projection keeps east-west distances true at the map's middle latitude.
function mapFrame(map,W,H,pad=10){
 // Dokdo counts toward the frame, so the easternmost point is drawn inside the card.
 const pts=[...map.regions.flatMap(r=>r.polys.flat()),...(map.dokdo?[map.dokdo.lonlat]:[])],lon0=Math.min(...pts.map(p=>p[0])),lon1=Math.max(...pts.map(p=>p[0])),lat0=Math.min(...pts.map(p=>p[1])),lat1=Math.max(...pts.map(p=>p[1]));
 const k=Math.cos((lat0+lat1)/2*Math.PI/180),sw=(lon1-lon0)*k,sh=lat1-lat0,s=Math.min((W-2*pad)/sw,(H-2*pad)/sh),ox=(W-sw*s)/2,oy=(H-sh*s)/2;
 return {P:([lon,lat])=>[ox+(lon-lon0)*k*s,oy+(lat1-lat)*s],aspect:sh/sw};
}
const regionKey=(map,v)=>map.regions.find(r=>r.id===v||r.name===v||r.short===v);
const ringPath=(poly,P)=>'M'+poly.map(p=>P(p).map(v=>v.toFixed(1)).join(',')).join('L')+'Z';
// Where a region's name sits: the middle of its largest piece.
function labelSpot(r,P){const big=r.polys.reduce((a,p)=>p.length>a.length?p:a,r.polys[0]);let ax=0,ay=0,A=0;for(let i=0;i<big.length;i++){const [x0,y0]=P(big[i]),[x1,y1]=P(big[(i+1)%big.length]),c=x0*y1-x1*y0;A+=c;ax+=(x0+x1)*c;ay+=(y0+y1)*c;}return A?[ax/(3*A),ay/(3*A)]:P(big[0]);}
function mapValues(ctx){const {spec,o}=ctx,rk=spec.encoding?.region??'region',vk=spec.encoding?.value??'value',vals={};for(const r of spec.data??[]){const g=regionKey(o.map,r[rk]);if(g)vals[g.id]=r[vk];}return vals;}
function mapRamp(ctx,vals){const v=Object.values(vals),min=ctx.o.min??Math.min(...v),max=ctx.o.max??Math.max(...v),f=ramp(ctx.o.mid!=null?[ctx.card.css('--mc-cold','#3987e5'),ctx.card.css('--mc-mid','#2a3038'),ctx.card.css('--mc-warm','#d95926')]:[ctx.card.css('--mc-seq-low','#1f2a33'),ctx.card.css('--mc-seq-high','#7fd3c0')]);
 const t=x=>ctx.o.mid!=null?(x<ctx.o.mid?(x-min)/(ctx.o.mid-min)/2:.5+(x-ctx.o.mid)/(max-ctx.o.mid)/2):(x-min)/((max-min)||1);return {min,max,color:x=>`rgb(${f(clamp(t(x),0,1)).join(',')})`,f};}
function rampKey(ctx,rk,x,y,w){const id='mc-k'+Math.random().toString(36).slice(2,7),u=ctx.o.unit??ctx.spec.unit??'';return `<defs><linearGradient id="${id}">${Array.from({length:9},(_,i)=>`<stop offset="${i/8}" stop-color="rgb(${rk.f(i/8).join(',')})"/>`).join('')}</linearGradient></defs><rect x="${x}" y="${y}" width="${w}" height="8" rx="2" fill="url(#${id})"/><text class="mc-tick" x="${x}" y="${y-4}">${esc(ctx.fmt(rk.min))}</text><text class="mc-tick" x="${x+w}" y="${y-4}" text-anchor="end">${esc(ctx.fmt(rk.max))}${u?' '+esc(u):''}</text>`;}
const dokdo=(map,P)=>map.dokdo?(()=>{const [x,y]=P(map.dokdo.lonlat);return `<circle cx="${x}" cy="${y}" r="1.8" fill="var(--mc-text)"><title>${esc(map.dokdo.name)}</title></circle>`;})():'';

// Choropleth: each region shaded by its value.
function choropleth(ctx){
 const {o,W,spec}=ctx,map=o.map,H=o.height??clamp(Math.round(W*1.05),320,560),{P}=mapFrame(map,W,H-30),vals=mapValues(ctx),rk=mapRamp(ctx,vals),u=o.unit??spec.unit??'';
 const shapes=map.regions.map(r=>{const v=vals[r.id],has=v!=null,on=o.highlight&&regionKey(map,o.highlight)===r;return `<path class="mc-mark" data-tip="${esc(`<strong>${esc(r.name)}</strong><span>${has?ctx.fmt(v)+(u?' '+u:''):'자료 없음'}</span>`)}" d="${r.polys.map(p=>ringPath(p,P)).join('')}" fill="${has?rk.color(v):'var(--mc-raised)'}" stroke="${on?'var(--mc-accent)':'var(--mc-surface)'}" stroke-width="${on?2.5:1}"/>`;}).join('');
 const names=o.labels===false?'':placeLabels(ctx,map.regions.map(r=>{const [x,y]=labelSpot(r,P);return {text:r.short,cls:'mc-tick',style:'fill:var(--mc-text)',cands:[[x,y+4,'middle'],[x,y+18,'middle'],[x,y-10,'middle']]};}),W);
 return {height:H,svg:shapes+names+dokdo(map,P)+rampKey(ctx,rk,10,H-14,Math.min(220,W-20)),noKeys:map.regions.length>30,table:table(['지역',spec.labels?.value??'값'],map.regions.filter(r=>vals[r.id]!=null).sort((a,b)=>vals[b.id]-vals[a.id]).map(r=>[r.name,vals[r.id]]),ctx.fmt)};
}
// Tile map: every region the same size, so small cities weigh as much as large provinces.
function tilemap(ctx){
 const {o,W,spec}=ctx,map=o.map,vals=mapValues(ctx),rk=mapRamp(ctx,vals),cols=Math.max(...map.regions.map(r=>r.tile[0]))+1,rows=Math.max(...map.regions.map(r=>r.tile[1]))+1,s=Math.min(84,(W-20)/cols),gap=4,x0=(W-cols*s)/2,H=rows*s+36,u=o.unit??spec.unit??'';
 const tiles=map.regions.map(r=>{const [cx,cy]=r.tile,v=vals[r.id],fill=v!=null?rk.color(v):'var(--mc-raised)',ink=v!=null?inkOn(ctx.card,fill.startsWith('rgb')?'#'+fill.match(/\d+/g).map(n=>(+n).toString(16).padStart(2,'0')).join(''):fill):'var(--mc-muted)',x=x0+cx*s,y=4+cy*s,on=o.highlight&&regionKey(map,o.highlight)===r;
  return `<g><rect class="mc-mark" data-tip="${esc(`<strong>${esc(r.name)}</strong><span>${v!=null?ctx.fmt(v)+(u?' '+u:''):'자료 없음'}</span>`)}" x="${x+gap/2}" y="${y+gap/2}" width="${s-gap}" height="${s-gap}" rx="6" fill="${fill}" stroke="${on?'var(--mc-accent)':'none'}" stroke-width="3"/><text class="mc-on-mark" x="${x+s/2}" y="${y+s/2-2}" text-anchor="middle" style="fill:${ink};font-size:${s>60?14:12}px;pointer-events:none">${esc(r.short)}</text><text class="mc-on-mark is-soft" x="${x+s/2}" y="${y+s/2+14}" text-anchor="middle" style="fill:${ink};font-size:11px;pointer-events:none">${v!=null?esc(ctx.fmt(v)):''}</text></g>`;}).join('');
 return {height:H,svg:tiles+rampKey(ctx,rk,x0,H-14,Math.min(220,cols*s)),table:table(['지역',spec.labels?.value??'값'],map.regions.filter(r=>vals[r.id]!=null).sort((a,b)=>vals[b.id]-vals[a.id]).map(r=>[r.name,vals[r.id]]),ctx.fmt)};
}
// Symbol map: circles at places, their area proportional to the value, over a quiet base map.
// data rows {name, lon, lat, value}
function symbolmap(ctx){
 const {o,W,spec}=ctx,map=o.map,H=o.height??clamp(Math.round(W*1.05),320,560),{P}=mapFrame(map,W,H),vk=spec.encoding?.value??'value',rows=[...spec.data].sort((a,b)=>b[vk]-a[vk]),max=Math.max(...rows.map(r=>r[vk])),rmax=o.maxRadius??clamp(W/16,14,34),u=o.unit??spec.unit??'',colors=colorFor(o,rows.map(r=>r.name));
 const base=map.regions.map(r=>`<path d="${r.polys.map(p=>ringPath(p,P)).join('')}" fill="var(--mc-raised)" stroke="var(--mc-line-strong)" stroke-width=".8"/>`).join('');
 const dots=rows.map((r,i)=>{const [x,y]=P([r.lon,r.lat]),rad=rmax*Math.sqrt(r[vk]/max),on=r.name===o.highlight,c=o.highlight!=null?(on?'var(--mc-accent)':'var(--mc-s1)'):'var(--mc-s1)';
  return `<circle class="mc-mark" data-tip="${esc(`<strong>${esc(r.name)}</strong><span>${ctx.fmt(r[vk])}${u?' '+u:''}</span>`)}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${Math.max(2.5,rad).toFixed(1)}" fill="${c}" fill-opacity=".55" stroke="${c}" stroke-width="1.5"/>`;}).join('');
 const names=placeLabels(ctx,rows.slice(0,o.labelTop??5).map(r=>{const [x,y]=P([r.lon,r.lat]),rad=Math.max(2.5,rmax*Math.sqrt(r[vk]/max));return {text:r.name,cands:[[x+rad+4,y+4],[x-rad-4,y+4,'end'],[x,y-rad-4,'middle'],[x,y+rad+13,'middle']]};}),W);
 return {height:H,svg:base+dokdo(map,P)+dots+names,table:table(['곳',spec.labels?.value??'값'],rows.map(r=>[r.name,r[vk]]),ctx.fmt)};
}
// Flow map: curved arrows between places, as thick as the flow. data rows {from, to, value}; options.places {name:[lon,lat]}.
function flowmap(ctx){
 const {o,W,spec}=ctx,map=o.map,H=o.height??clamp(Math.round(W*1.05),320,560),{P}=mapFrame(map,W,H),places=o.places,vk=spec.encoding?.value??'value',rows=[...spec.data].sort((a,b)=>a[vk]-b[vk]),max=Math.max(...rows.map(r=>r[vk])),u=o.unit??spec.unit??'',id='mc-a'+Math.random().toString(36).slice(2,7);
 const base=map.regions.map(r=>`<path d="${r.polys.map(p=>ringPath(p,P)).join('')}" fill="var(--mc-raised)" stroke="var(--mc-line-strong)" stroke-width=".8"/>`).join('');
 const arrows=rows.map(r=>{const [x1,y1]=P(places[r.from]),[x2,y2]=P(places[r.to]),mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,bend=.22,cx=mx-dy*bend,cy=my+dx*bend,w=1.5+7*r[vk]/max,on=o.highlight&&(r.from===o.highlight||r.to===o.highlight),c=o.highlight!=null?(on?'var(--mc-accent)':'var(--mc-neutral-3)'):'var(--mc-s1)';
  return `<path class="mc-band" data-tip="${esc(`<strong>${esc(r.from)} → ${esc(r.to)}</strong><span>${ctx.fmt(r[vk])}${u?' '+u:''}</span>`)}" d="M${x1.toFixed(1)},${y1.toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" stroke="${c}" stroke-width="${w.toFixed(1)}" fill="none" stroke-linecap="round" marker-end="url(#${id})" style="opacity:${o.highlight!=null&&!on?.35:.8}"/>`;}).join('');
 const pins=Object.entries(places).map(([n,ll])=>{const [x,y]=P(ll);return `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--mc-text)"/><text class="mc-label" x="${x+6}" y="${y-5}" style="paint-order:stroke;stroke:var(--mc-surface);stroke-width:3px">${esc(n)}</text>`;}).join('');
 const marker=`<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0L10,5L0,10Z" fill="var(--mc-text)"/></marker></defs>`;
 return {height:H,svg:marker+base+dokdo(map,P)+arrows+pins,table:table(['출발','도착',spec.labels?.value??'값'],[...rows].reverse().map(r=>[r.from,r.to,r[vk]]),ctx.fmt)};
}
// Bar race: the ranking at each period, played one period after another. rows {period, item, value}; options.top, options.step (ms).
function barrace(ctx){
 const {spec,o,W}=ctx,e=spec.encoding??{},pk=e.period??'period',ik=e.item??'item',vk=e.value??'value',periods=[...new Set(spec.data.map(r=>r[pk]))],items=[...new Set(spec.data.map(r=>r[ik]))],top=Math.min(o.top??8,items.length),colors=colorFor(o,items);
 const val=(p,it)=>spec.data.find(r=>r[pk]===p&&r[ik]===it)?.[vk]??0,row=o.rowHeight??30,T=8,H=T+top*row+40,L=Math.min(W*.3,Math.max(...items.map(s=>ctx.text(s,13)))+14),R=W-70,u=o.unit??spec.unit??'',max=Math.max(...spec.data.map(r=>r[vk]));
 const frame=(p)=>{const ranked=items.map(it=>({it,v:val(p,it)})).sort((a,b)=>b.v-a.v);return Object.fromEntries(ranked.map((x,i)=>[x.it,{v:x.v,rank:i}]));};
 const bars=items.map(it=>`<g data-item="${esc(it)}" style="transition:transform .7s ease"><text class="mc-label" x="${L-10}" y="${row/2+4}" text-anchor="end">${esc(it)}</text><rect class="mc-mark" x="${L}" y="${row*.15}" width="1" height="${row*.7}" rx="4" fill="${colors[it]}" style="transition:width .7s ease"/><text class="mc-value" x="0" y="${row/2+4}" style="transition:transform .7s ease"></text></g>`).join('');
 const label=`<text class="mc-race-period" x="${W-8}" y="${H-10}" text-anchor="end" style="font-size:28px;font-weight:700;fill:var(--mc-muted)"></text>`;
 const button=`<g class="mc-race-play" role="button" tabindex="0" aria-label="재생" style="cursor:pointer"><rect x="0" y="${H-30}" width="64" height="26" rx="13" fill="var(--mc-raised)" stroke="var(--mc-line-strong)"/><text x="32" y="${H-13}" text-anchor="middle" class="mc-label">▶ 재생</text></g>`;
 // Each period re-ranks the bars; the browser animates the moves. Reduced motion jumps without sliding.
 const after=(svg)=>{let i=periods.length-1,timer=null;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const show=k=>{const f=frame(periods[k]),scale=v=>(R-L)*v/max;svg.querySelectorAll('[data-item]').forEach(g=>{const it=g.dataset.item,s=f[it],vis=s.rank<top;g.style.transform=`translateY(${T+(vis?s.rank:top)*row}px)`;g.style.display=vis?'':'none';if(reduce)g.querySelectorAll('*').forEach(n=>n.style.transition='none'),g.style.transition='none';const bar=g.querySelector('rect'),w=Math.max(1,scale(s.v));bar.style.width=w+'px';const t=g.querySelector('.mc-value');t.style.transform=`translateX(${L+w+6}px)`;t.textContent=ctx.fmt(s.v)+(u?' '+u:'');g.setAttribute('data-tip',`<strong>${esc(it)}</strong><span>${esc(periods[k])} · ${s.rank+1}위 · ${ctx.fmt(s.v)}${u?' '+u:''}</span>`);});svg.querySelector('.mc-race-period').textContent=periods[k];};
  const btn=svg.querySelector('.mc-race-play'),txt=btn.querySelector('text'),stop=()=>{clearInterval(timer);timer=null;txt.textContent='▶ 재생';},play=()=>{if(timer){stop();return;}if(i>=periods.length-1)i=-1;txt.textContent='❚❚ 멈춤';timer=setInterval(()=>{i++;show(i);if(i>=periods.length-1)stop();},o.step??1100);};
  btn.onclick=play;btn.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();play();}};show(i);return stop;};
 return {height:H,svg:bars+label+button,after,noKeys:true,table:table(['',...periods],items.map(it=>[it,...periods.map(p=>val(p,it))]),ctx.fmt)};
}
