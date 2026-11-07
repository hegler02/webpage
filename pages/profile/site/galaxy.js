/* The galaxy: every record a star, every approved link a thread. Lives on the home opening and on its own page. */
import * as THREE from '/site/vendor/three.module.min.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const t = (ko, en) => `<span data-ko>${esc(ko)}</span><span data-en lang="en">${esc(en)}</span>`;
const LABEL = { song: ['노래', 'Song'], slide: ['슬라이드', 'Slide'], screen: ['영상', 'Screen'], story: ['이야기', 'Story'], knowledge: ['배움', 'Learning'], paper: ['논문', 'Paper'], book: ['책', 'Book'], project: ['연구 과제', 'Project'], patent: ['특허', 'Patent'], film: ['뮤직비디오 연출', 'Music video'], collection: ['프로젝트', 'Project'], product: ['제품', 'Product'], concept: ['생각', 'Idea'], topic: ['연구 주제', 'Research topic'], judgment: ['제작 판단', 'Judgment'], essay: ['글', 'Essay'], constellation: ['별자리', 'Constellation'], creator: ['창작자', 'Creator'] };
const OPEN = { paper: ['서지 보기', 'View record'], book: ['책 보기', 'View book'], film: ['영상 보기', 'Watch'], collection: ['보러 가기', 'Open'], product: ['서비스 열기', 'Open service'], song: ['작품 보기', 'Open work'], slide: ['작품 보기', 'Open work'], screen: ['작품 보기', 'Open work'], story: ['작품 보기', 'Open work'], knowledge: ['작품 보기', 'Open work'] };
const RESEARCH = new Set(['paper', 'book', 'project', 'patent']);
const OUTSIDE = new Set(['film', 'collection', 'product']);
const THOUGHT = new Set(['concept', 'topic', 'judgment', 'essay', 'constellation']);
const isThought = (n) => THOUGHT.has(n.k);
const groupOf = (n) => (RESEARCH.has(n.k) ? 'research' : OUTSIDE.has(n.k) ? 'outside' : isThought(n) ? 'thought' : n.k);
const showProposals = true;
const hiddenEdge = () => false;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const stageHost = document.createElement('div');
stageHost.id = 'stage';
stageHost.dataset.theme = 'dark';
stageHost.innerHTML = '<canvas id="gl" tabindex="0" aria-label="미리내맨 은하수. 드래그로 회전, 휠로 확대, 방향키로 둘러볼 수 있습니다."></canvas><div id="labels"></div>';
const labelsHost = stageHost.querySelector('#labels');
const stageLive = () => stageHost.isConnected;
const reader = document.createElement('aside');
reader.id = 'reader';
reader.hidden = true;
reader.dataset.theme = 'dark';
reader.setAttribute('aria-label', '선택한 기록');
const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const colorOf = (k) => token(`--k-${k}`) || token('--k-creator');

let nodes = [], byId = new Map(), edges = [], near = new Map(), stars = [];
let selected = null, hover = null, kindFilter = null, matches = null, trail = [], mode = 'home', scene = null, loading = null;

const connections = (n) => near.get(n.id).filter((x) => !x.e.hub);
const nodeLink = (n) => n.page || '';
const openFromHome = (n) => window.Site.go('/galaxy/?node=' + encodeURIComponent(n.id));

function load() {
  loading ??= fetch('/galaxy/graph.json').then((r) => r.json()).then((graph) => {
    nodes = graph.nodes;
    byId = new Map(nodes.map((n, i) => { n.i = i; return [n.id, n]; }));
    edges = graph.edges.map((e) => ({ ...e, A: byId.get(e.a), B: byId.get(e.b) }));
    near = new Map(nodes.map((n) => [n.id, []]));
    edges.forEach((e) => { near.get(e.a).push({ e, o: e.B }); near.get(e.b).push({ e, o: e.A }); });
    stars = nodes.filter((n) => n.k === 'constellation');
  });
  return loading;
}

function wireGalaxy() {
  $('galaxy-page').append(reader);
  const legend = $('legend');
  legend.addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]');
    if (!b) return;
    kindFilter = kindFilter === b.dataset.k ? null : b.dataset.k;
    legend.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.k === kindFilter)));
  });
  const q = $('q'), box = $('results');
  q.addEventListener('input', () => {
    const text = q.value.trim().toLowerCase();
    if (!text) { matches = null; box.hidden = true; return; }
    const hit = nodes.filter((n) => (n.t + ' ' + n.s + ' ' + n.tags.join(' ')).toLowerCase().includes(text));
    matches = new Set(hit.map((n) => n.id));
    box.hidden = false;
    box.innerHTML = hit.length ? hit.slice(0, 8).map((n) => `<button type="button" data-pick="${esc(n.id)}">${esc(n.t)}</button>`).join('') : `<p>${t('찾는 기록이 없습니다.', 'No matching records.')}</p>`;
    box.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => { q.value = ''; matches = null; box.hidden = true; select(byId.get(b.dataset.pick)); }));
  });
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') box.querySelector('[data-pick]')?.click();
    if (e.key === 'Escape') { q.value = ''; matches = null; box.hidden = true; }
  });
  $('all').addEventListener('click', wholeView);
  $('stars').addEventListener('click', showStars);
  renderTrail();
}

/* Everything back: selection, filter, search, rotation and zoom */
function clearLenses() {
  kindFilter = null;
  matches = null;
  $('legend')?.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
  if ($('q')) $('q').value = '';
  if ($('results')) $('results').hidden = true;
}
function wholeView() { clearLenses(); select(null); scene?.reset(); }
function showStars() {
  clearLenses();
  selected = null;
  remember(null);
  matches = new Set(stars.map((s) => s.id));
  document.body.dataset.open = '';
  reader.style.setProperty('--c', colorOf('constellation'));
  reader.innerHTML = `<div class="reader-top"><b>${t(`별자리 ${stars.length}개`, `${stars.length} constellations`)}</b><button type="button" id="close" aria-label="닫기">×</button></div><div class="reader-body"><ul>${stars.map((s) => `<li><button class="row" type="button" data-pick="${esc(s.id)}"><span class="to">${esc(s.t)}</span><span class="note">${esc(s.s)} · ${t(`기록 ${near.get(s.id).length}개`, `${near.get(s.id).length} records`)}</span></button></li>`).join('')}</ul></div>`;
  reader.hidden = false;
  reader.querySelector('#close').addEventListener('click', wholeView);
  reader.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => { matches = null; select(byId.get(b.dataset.pick)); }));
  scene?.reset();
}
function renderTrail() {
  const box = $('trail');
  if (!box) return;
  box.hidden = !trail.length;
  box.innerHTML = trail.length ? `<span>${t('지나온 별', 'Trail')}</span>` + trail.map((n) => `<button type="button" data-pick="${esc(n.id)}">${esc(n.t)}</button>`).join('') : '';
  box.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => select(byId.get(b.dataset.pick))));
}
function openReader(n) {
  document.body.dataset.open = '';
  const rel = connections(n);
  const kin = rel.length ? [] : n.kin.map((id) => byId.get(id)).filter(Boolean);
  const name = LABEL[n.k] || ['', ''];
  const action = n.page
    ? `<a class="btn main" href="${esc(n.page)}">${t('기록 페이지 열기', 'Open record page')}</a>`
    : n.u && n.k !== 'constellation' ? `<a class="btn main" href="${esc(n.u)}">${t('원문 보기', 'Read source')}</a>` : '';
  const outward = n.page && n.u && OPEN[n.k] && !/mirinaeman\.com\/(work|research)\/$/.test(n.u) ? `<a class="btn" href="${esc(n.u)}" target="_blank" rel="noopener noreferrer">${t(...OPEN[n.k])} ↗</a>` : '';
  const sections = (n.sec || []).map((s) => `<h3>${esc(s.title)}</h3><p class="sum">${esc(s.text)}</p>`).join('');
  const rows = rel.length
    ? rel.slice(0, 24).map((x) => `<li><button class="row" type="button" data-pick="${esc(x.o.id)}"><span class="why">${esc(x.e.l)}</span><span class="to">${esc(x.o.t)}</span><span class="note">${esc(x.e.r)}</span></button></li>`).join('')
    : kin.map((o) => `<li><button class="row" type="button" data-pick="${esc(o.id)}"><span class="to">${esc(o.t)}</span></button></li>`).join('');
  reader.style.setProperty('--c', colorOf(n.k));
  reader.innerHTML = `<div class="reader-top"><b>${t(...name)}${n.y ? ' · ' + esc(n.y) : ''}</b><button type="button" id="close" aria-label="닫기">×</button></div><div class="reader-body"><h2 id="reader-title" tabindex="-1">${esc(n.t)}</h2>${n.img ? `<img src="${esc(n.img)}" alt="${esc(n.alt)}">` : ''}<p class="sum">${esc(n.s)}</p>${sections}${action}${outward}${rows ? `<section><h3>${rel.length ? t(`이어지는 맥락 ${rel.length}개`, `${rel.length} connections`) : t('같은 갈래의 기록', 'Similar records')}</h3><ul>${rows}</ul></section>` : ''}</div>`;
  reader.hidden = false;
  reader.querySelector('#close').addEventListener('click', () => select(null));
  reader.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => select(byId.get(b.dataset.pick))));
}
function remember(n) {
  if (mode !== 'galaxy') return;
  const url = new URL(location.href);
  if (n) url.searchParams.set('node', n.id);
  else url.searchParams.delete('node');
  history.replaceState(history.state, '', url);
}
function select(n, { fly = true } = {}) {
  selected = n;
  remember(n);
  if (n) {
    if (trail.at(-1) !== n) trail = [...trail.filter((x) => x !== n).slice(-4), n];
    openReader(n);
    renderTrail();
  } else {
    reader.hidden = true;
    delete document.body.dataset.open;
  }
  scene?.onSelect(fly);
}

addEventListener('keydown', (e) => { if (mode === 'galaxy' && stageLive() && e.key === 'Escape' && !e.target.closest('input')) wholeView(); });

export async function mount(page) {
  mode = page === 'home' ? 'home' : 'galaxy';
  await load();
  const slot = $('stage-slot');
  if (!slot || document.body.dataset.page !== page) return;
  slot.prepend(stageHost);
  selected = null;
  hover = null;
  clearLenses();
  reader.hidden = true;
  delete document.body.dataset.open;
  if (page === 'galaxy') wireGalaxy();
  try {
    if (!scene) start();
    else { scene.wake(); scene.resize(); scene.refit(); }
  } catch (err) {
    document.documentElement.classList.add('gl-off');
    return;
  }
  if (page === 'galaxy') {
    const wanted = byId.get(new URLSearchParams(location.search).get('node'));
    if (wanted) select(wanted, { fly: false });
    else scene.onSelect(false);
  }
}

export function unmount() {
  stageHost.remove();
  reader.remove();
  delete document.body.dataset.open;
}

/* Scene */
function start(){
 const T=THREE;const canvas=$('gl');let wake=()=>{};const readerWidth=parseFloat(token('--reader'))||372;
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 const world=new T.Scene(),camera=new T.PerspectiveCamera(46,1,.1,240);
 const vs=`attribute float aSize;attribute float aGlow;varying vec3 vC;varying float vG;uniform float uScale;uniform float uMax;uniform float uNear;void main(){vC=color;vec4 p=modelViewMatrix*vec4(position,1.);vG=aGlow*smoothstep(uNear*.3,uNear,-p.z);gl_PointSize=min(aSize*uScale*(1.+.6*max(aGlow-1.,0.))/-p.z,uMax);gl_Position=projectionMatrix*p;}`;
 const fs=`varying vec3 vC;varying float vG;uniform float uAlpha;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float a=exp(-d*d*5.5)*.55+exp(-d*d*48.)*.8;a*=min(vG,1.5)*uAlpha;gl_FragColor=vec4(vC*a,a);}`;
 const mat=(alpha,max=48,near=.1)=>new T.ShaderMaterial({vertexShader:vs,fragmentShader:fs,uniforms:{uScale:{value:300},uAlpha:{value:alpha},uMax:{value:max},uNear:{value:near}},vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending});
 let seed=1909;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
 const gauss=()=>Math.sqrt(-2*Math.log(rnd()+1e-9))*Math.cos(6.2832*rnd());
 const color=c=>new T.Color(c);

 /* The nebula grows where the records and their links are. */
 const dp=[],dc=[],ds=[],dg=[];
 const dust=(x,y,z,c,s)=>{dp.push(x,y,z);dc.push(c.r,c.g,c.b);ds.push(s);dg.push(1);};
 const small=innerWidth<820?.55:1;
 nodes.forEach(n=>{const c=color(colorOf(n.k)),count=Math.round((10+Math.min(n.d,10)*7)*small),spread=.34+Math.min(n.d,10)*.07;
  for(let i=0;i<count;i++)dust(n.p[0]+gauss()*spread,n.p[1]+gauss()*spread*.4,n.p[2]+gauss()*spread,c,.25+rnd()*.8);});
 const curves=new Map();
 const curve=e=>{const a=new T.Vector3(...e.A.p),b=new T.Vector3(...e.B.p),m=a.clone().add(b).multiplyScalar(.5),len=a.distanceTo(b);m.y+=len*.16;m.add(new T.Vector3(-(b.z-a.z),0,b.x-a.x).normalize().multiplyScalar(len*.1));return new T.QuadraticBezierCurve3(a,m,b);};
 edges.forEach(e=>{const cv=curve(e);curves.set(e,cv);if(e.hub||e.prop)return;const c=color(colorOf(e.A.k)).lerp(color(colorOf(e.B.k)),.5);
  for(let i=0;i<Math.round(42*small);i++){const p=cv.getPoint(rnd());dust(p.x+gauss()*.16,p.y+gauss()*.07,p.z+gauss()*.16,c,.2+rnd()*.4);}});
 for(let i=0;i<Math.round(7000*small);i++){const arm=i%3,r=Math.pow(rnd(),.9)*18,a=arm*2.0944+r*.3+gauss()*(.34+.5/(1+r*.4));const c=color(token('--dust-far')).lerp(color(token('--dust-core')),Math.pow(1-r/17,5));dust(Math.cos(a)*r,gauss()*(.2+(18-r)*.03),Math.sin(a)*r,c,.16+rnd()*.42);}
 for(let i=0;i<Math.round(520*small);i++){const r=Math.pow(rnd(),1.5)*2.2,a=rnd()*6.2832;dust(Math.cos(a)*r,gauss()*r*.25,Math.sin(a)*r,color(token('--dust-core')),.5+rnd()*1.1);}
 const dustGeo=new T.BufferGeometry();
 dustGeo.setAttribute('position',new T.Float32BufferAttribute(dp,3));dustGeo.setAttribute('color',new T.Float32BufferAttribute(dc,3));dustGeo.setAttribute('aSize',new T.Float32BufferAttribute(ds,1));dustGeo.setAttribute('aGlow',new T.Float32BufferAttribute(dg,1));
 const dustMat=mat(.8,8,7);world.add(new T.Points(dustGeo,dustMat));

 /* Stars */
 const sp=new Float32Array(nodes.length*3),sc=new Float32Array(nodes.length*3),ss=new Float32Array(nodes.length),sg=new Float32Array(nodes.length).fill(1);
 const sizeOf=n=>n.key?9:n.k==='creator'?9:n.k==='constellation'?4.2:isThought(n)?6+Math.min(n.d,14)*.3:n.d?4+Math.min(n.d,8)*.42:2.8;
 nodes.forEach((n,i)=>{sp.set(n.p,i*3);const c=color(colorOf(n.k));sc.set([c.r,c.g,c.b],i*3);ss[i]=sizeOf(n);n.v=new T.Vector3(...n.p);});
 const starGeo=new T.BufferGeometry();starGeo.setAttribute('position',new T.BufferAttribute(sp,3));starGeo.setAttribute('color',new T.BufferAttribute(sc,3));starGeo.setAttribute('aSize',new T.BufferAttribute(ss,1));starGeo.setAttribute('aGlow',new T.BufferAttribute(sg,1));
 const starMat=mat(1);world.add(new T.Points(starGeo,starMat));

 /* Threads */
 const threads=edges.map(e=>{const pts=curves.get(e).getPoints(28),c=color(colorOf(e.A.k)).lerp(color(colorOf(e.B.k)),.5);const m=e.prop?new T.LineDashedMaterial({color:color(token('--k-constellation')),dashSize:.22,gapSize:.16,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}):new T.LineBasicMaterial({color:c,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});const l=new T.Line(new T.BufferGeometry().setFromPoints(pts),m);if(e.prop)l.computeLineDistances();world.add(l);return {e,m,now:0};});

 /* Light travelling along the selected star's links */
 const PULSES=48,pp=new Float32Array(PULSES*3),pc=new Float32Array(PULSES*3).fill(1),ps=new Float32Array(PULSES),pg=new Float32Array(PULSES).fill(1);
 const pulseGeo=new T.BufferGeometry();pulseGeo.setAttribute('position',new T.BufferAttribute(pp,3));pulseGeo.setAttribute('color',new T.BufferAttribute(pc,3));pulseGeo.setAttribute('aSize',new T.BufferAttribute(ps,1));pulseGeo.setAttribute('aGlow',new T.BufferAttribute(pg,1));
 const pulses=new T.Points(pulseGeo,mat(1));pulses.frustumCulled=false;world.add(pulses);

 /* Labels */
 const pool=new Map();
 nodes.forEach(n=>{const b=document.createElement('button');b.type='button';b.className='lb'+(isThought(n)&&n.k!=='topic'&&n.k!=='constellation'?' thought':n.k==='topic'?' topic':n.k==='constellation'?' constellation':n.k==='creator'?' core':'');b.innerHTML=`<span>${esc(n.t)}</span>`;b.setAttribute('aria-label',n.t);b.tabIndex=-1;b.addEventListener('click',()=>{if(mode==='home'){openFromHome(n);return;}select(n);});b.addEventListener('pointerenter',()=>{hover=n;});b.addEventListener('pointerleave',()=>{if(hover===n)hover=null;});labelsHost.append(b);pool.set(n,b);});
 const edgeLabels=Array.from({length:8},()=>{const d=document.createElement('div');d.className='edge';labelsHost.append(d);return d;});

 /* Camera */
 let width=1,height=1,yaw=-.5,pitch=.86,radius=60,focus=new T.Vector3(),tYaw=yaw,tPitch=pitch,tRadius=30,tFocus=new T.Vector3();
 const overview=()=>{const aspect=width/height;return mode==='home'&&width>820?35:aspect>1?31:31+(1-aspect)*34;};
 function resize(){const r=canvas.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);renderer.setSize(width,height,false);camera.aspect=width/height;applyOffset();const u=height*.62;dustMat.uniforms.uScale.value=u;starMat.uniforms.uScale.value=u;pulses.material.uniforms.uScale.value=u;}
 function applyOffset(){
  const open=!reader.hidden;
  if(mode==='home'&&width<=820){camera.clearViewOffset();camera.updateProjectionMatrix();return;}
  if(mode==='home'&&width>820){camera.setViewOffset(width,height,-width*.2,0,width,height);camera.updateProjectionMatrix();return;}
  if(open&&width>820)camera.setViewOffset(width,height,(Math.min(readerWidth,width-32)+16)/2,0,width,height);
  else if(open)camera.setViewOffset(width,height,0,height*.25,width,height);
  else camera.clearViewOffset();
  camera.updateProjectionMatrix();
 }
 new ResizeObserver(resize).observe(canvas);resize();
 tRadius=overview();

 function onSelect(fly){
  applyOffset();
  if(selected){
   const con=[...litBy(selected)].filter(id=>id!==selected.id).map(id=>byId.get(id).v.distanceTo(selected.v));
   tFocus.copy(selected.v);tRadius=Math.max(11,Math.min(24,(con.length?Math.max(...con):6)*2.3));
  }else{tFocus.set(0,0,0);tRadius=overview();}
  if(!fly||reduce){focus.copy(tFocus);radius=tRadius;}
 }

 /* Pointer */
 const pts=new Map();let moved=0,pinch=0,screen=nodes.map(()=>[-9e3,-9e3,1]);
 const nearest=(x,y,reach)=>{let best=null,bd=reach*reach;nodes.forEach((n,i)=>{const s=screen[i];if(s[2]<=0)return;const d=(s[0]-x)**2+(s[1]-y)**2;if(d<bd){bd=d;best=n;}});return best;};
 const local=e=>{const r=canvas.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;pinch=0;canvas.classList.add('drag');});
 canvas.addEventListener('pointermove',e=>{
  const [x,y]=local(e);
  if(!pts.size){hover=nearest(x,y,16);canvas.classList.toggle('point',!!hover);return;}
  const prev=pts.get(e.pointerId);if(!prev)return;
  const dx=e.clientX-prev[0],dy=e.clientY-prev[1];pts.set(e.pointerId,[e.clientX,e.clientY]);moved+=Math.abs(dx)+Math.abs(dy);
  if(pts.size===1){tYaw+=dx*.005;tPitch=Math.max(.12,Math.min(1.42,tPitch+dy*.004));}
  else if(pts.size===2){const [a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)tRadius=Math.max(5,Math.min(70,tRadius*pinch/d));pinch=d;}
 });
 const end=e=>{const was=pts.size===1&&moved<8;const pos=local(e);pts.delete(e.pointerId);canvas.classList.remove('drag');if(was){const n=nearest(pos[0],pos[1],e.pointerType==='touch'?28:16);if(n){if(mode==='home')openFromHome(n);else select(n);}}};
 canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);canvas.classList.remove('drag');});
 canvas.addEventListener('pointerleave',()=>{if(!pts.size)hover=null;});
 canvas.addEventListener('wheel',e=>{e.preventDefault();tRadius=Math.max(5,Math.min(70,tRadius*Math.exp(e.deltaY*.0011)));},{passive:false});
 canvas.addEventListener('keydown',e=>{const k=e.key;if(k==='ArrowLeft')tYaw-=.12;else if(k==='ArrowRight')tYaw+=.12;else if(k==='ArrowUp')tPitch=Math.max(.12,tPitch-.08);else if(k==='ArrowDown')tPitch=Math.min(1.42,tPitch+.08);else if(k==='+'||k==='=')tRadius=Math.max(5,tRadius*.88);else if(k==='-')tRadius=Math.min(70,tRadius*1.14);else return;e.preventDefault();});

 /* Who is lit */
 const litBy=n=>{const s=new Set([n.id]);const rel=near.get(n.id).filter(x=>(!x.e.hub||n.k==='creator')&&!hiddenEdge(x.e));rel.forEach(x=>s.add(x.o.id));if(!rel.length)n.kin.forEach(id=>s.add(id));return s;};
 const passes=n=>{
  if(matches)return matches.has(n.id);
  if(kindFilter)return groupOf(n)===kindFilter;
  return true;
 };
 const v=new T.Vector3(),boxes=[];
 const free=(x,y,w,h)=>{for(const b of boxes)if(x<b[0]+b[2]+6&&x+w+6>b[0]&&y<b[1]+b[3]+3&&y+h+3>b[1])return false;boxes.push([x,y,w,h]);return true;};
 const widths=new Map();
 let last=performance.now(),time=0,frame=0,drawing=false;
 function draw(now){
  if(!stageLive()){drawing=false;return;}
  const dt=Math.min(.05,(now-last)/1000);last=now;time+=dt;frame++;
  const ease=reduce?1:1-Math.exp(-dt*(pts.size?14:3.2));
  yaw+=(tYaw-yaw)*ease;pitch+=(tPitch-pitch)*ease;radius+=(tRadius-radius)*ease;focus.lerp(tFocus,ease);
  camera.position.set(focus.x+Math.cos(yaw)*Math.cos(pitch)*radius,focus.y+Math.sin(pitch)*radius,focus.z+Math.sin(yaw)*Math.cos(pitch)*radius);
  camera.lookAt(focus);camera.updateMatrixWorld();

  const anchor=hover||selected,lit=anchor?litBy(anchor):null,sel=selected?litBy(selected):null,filtered=!!(matches||kindFilter);
  const glow=starGeo.attributes.aGlow;
  nodes.forEach((n,i)=>{let g=1;
   if(filtered)g=passes(n)?1.6:.14;
   if(n.k==='constellation'&&!showProposals){sg[i]=0;return;}
   if(lit)g=n===anchor?2:lit.has(n.id)?1.5:(sel&&sel.has(n.id)?1:.22);
   sg[i]+=(g-sg[i])*Math.min(1,dt*7);});
  glow.needsUpdate=true;
  dustMat.uniforms.uAlpha.value+=((anchor||filtered?.34:.8)-dustMat.uniforms.uAlpha.value)*Math.min(1,dt*4);

  threads.forEach(t=>{const {e}=t;const on=selected&&(e.a===selected.id||e.b===selected.id)&&(!e.hub||selected.k==='creator');const onH=hover&&(e.a===hover.id||e.b===hover.id)&&(!e.hub||hover.k==='creator');
   const target=hiddenEdge(e)?0:on?(e.hub?.3:1):onH?(e.hub?.25:.95):e.hub?0:(anchor||filtered)?.08:e.prop?.34:.6;
   t.now+=(target-t.now)*Math.min(1,dt*6);t.m.opacity=t.now;t.m.visible=t.now>.005;});

  /* Travelling light */
  let pi=0;if(selected&&!reduce){for(const x of near.get(selected.id)){if((x.e.hub&&selected.k!=='creator')||hiddenEdge(x.e))continue;if(pi>=PULSES)break;const cv=curves.get(x.e),dir=x.e.a===selected.id?1:-1;const u=(time*.28+pi*.137)%1,p=cv.getPoint(dir>0?u:1-u);pp[pi*3]=p.x;pp[pi*3+1]=p.y;pp[pi*3+2]=p.z;const c=color(colorOf(x.o.k));pc[pi*3]=c.r;pc[pi*3+1]=c.g;pc[pi*3+2]=c.b;ps[pi]=3.2;pi++;}}
  for(let i=pi;i<PULSES;i++)ps[i]=0;
  pulseGeo.attributes.position.needsUpdate=true;pulseGeo.attributes.color.needsUpdate=true;pulseGeo.attributes.aSize.needsUpdate=true;

  renderer.render(world,camera);

  /* Project every star for picking and labels */
  nodes.forEach((n,i)=>{v.copy(n.v).project(camera);const s=screen[i];s[0]=(v.x+1)*.5*width;s[1]=(1-v.y)*.5*height;s[2]=v.z<1?1:0;});

  /* Labels by priority: the selected star, its links, then named ideas, then the most linked records. */
  boxes.length=0;if(mode!=='home'){const c=canvas.getBoundingClientRect();document.querySelectorAll('.gx-head,.gx-foot').forEach(e=>{const r=e.getBoundingClientRect();if(r.width)boxes.push([r.left-c.left,r.top-c.top,r.width,r.height]);});}
  const open=!reader.hidden,rightLimit=open&&width>820?width-Math.min(readerWidth,width-32)-24:width;
  const bottomLimit=open&&width<=820?height*.48:height;const topLimit=4;
  const rank=n=>n===selected?0:n===hover?1:(sel&&sel.has(n.id))?(n.key?1.5:2):(lit&&lit.has(n.id))?3:(passes(n)&&filtered)?3.5:n.k==='creator'?4:n.k==='concept'?5:n.k==='topic'?6:n.k==='constellation'?6.5:(n.k==='judgment'||n.k==='essay')?8:7+(10-Math.min(n.d,10))*.1;
  const order=[...nodes].sort((a,b)=>rank(a)-rank(b));
  const budget=mode==='home'?(width<820?5:11):selected?26:width<820?12:hover?20:28;let shown=0;
  order.forEach(n=>{
   const el=pool.get(n),s=screen[n.i];
   const eligible=mode==='home'?(n.k==='constellation'||n===hover):(rank(n)<4||(!anchor&&!filtered&&(n.key||n.k==='creator'||isThought(n)&&n.k!=='essay'||n.d>=4)));
   const mini=mode!=='home'&&!selected&&!filtered&&!hover&&!!n.img&&(n.d>=5||n.key)&&width>1100;const asCard=(!!(selected&&n.img&&n!==selected&&sel.has(n.id))||mini)&&width>820;el.classList.toggle('mini',mini);
   if(el.classList.contains('card')!==asCard){el.classList.toggle('card',asCard);
    if(asCard&&!el.querySelector('img')){const img=new Image();img.src=n.img;img.alt='';el.prepend(img);}
    if(!asCard)el.querySelector('img')?.remove();
    widths.delete(n);}
   if(el.dataset.mini!==String(mini)){el.dataset.mini=String(mini);widths.delete(n);}
   el.classList.toggle('sel',n===selected);
   if(!eligible||s[2]<=0||shown>=budget){el.classList.remove('on');return;}
   let size=widths.get(n);if(!size){size=[el.offsetWidth||120,el.offsetHeight||18];widths.set(n,size);}
   const centered=isThought(n)||n.k==='creator';
   let x=asCard?s[0]-size[0]/2:centered?s[0]-size[0]/2:s[0]+9,y=asCard?s[1]-size[1]-10:centered?s[1]+9:s[1]-size[1]/2;
   if(x<4||y<topLimit||x+size[0]>rightLimit-4||y+size[1]>bottomLimit-4||!free(x,y,size[0],size[1])){el.classList.remove('on');return;}
   el.classList.add('on');el.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px)`;shown++;
  });
  /* Why two stars are linked, written on the thread */
  let li=0;const said=new Set();
  if(selected){for(const x of near.get(selected.id)){if(x.e.hub||x.e.prop||li>=edgeLabels.length||said.has(x.e.l))continue;said.add(x.e.l);const p=curves.get(x.e).getPoint(.5);v.copy(p).project(camera);const sx=(v.x+1)*.5*width,sy=(1-v.y)*.5*height,d=edgeLabels[li];
    d.textContent=x.e.l;const w=d.offsetWidth||80;
    if(v.z<1&&sx-w/2>4&&sx+w/2<rightLimit&&sy>4&&sy<bottomLimit-16&&free(sx-w/2,sy-9,w,18)){d.classList.add('on');d.style.transform=`translate(${Math.round(sx-w/2)}px,${Math.round(sy-9)}px)`;li++;}}}
  for(let i=li;i<edgeLabels.length;i++)edgeLabels[i].classList.remove('on');

  requestAnimationFrame(draw);
 }
 scene={wake:()=>wake(),onSelect,refit:()=>{tFocus.set(0,0,0);tRadius=overview();applyOffset();},resize,reset:()=>{const home=-.5,turn=Math.PI*2;tYaw=home+Math.round((yaw-home)/turn)*turn;tPitch=.86;tFocus.set(0,0,0);tRadius=overview();hover=null;if(!reduce&&Math.abs(radius-tRadius)<1)radius=tRadius*1.08;applyOffset();}};
 wake=()=>{if(!drawing){drawing=true;last=performance.now();requestAnimationFrame(draw);}};wake();
 window.__site={state:()=>({mode,selected:selected?.id,frame,shown:labelsHost.querySelectorAll('.lb.on').length,cam:{yaw:tYaw,pitch:tPitch,radius:tRadius,now:radius,focus:focus.length()},over:overview(),kindFilter,matches:matches?matches.size:0}),select:id=>select(byId.get(id))};
}
