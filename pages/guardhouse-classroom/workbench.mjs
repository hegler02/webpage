// Shared workbench shell: the viewer stays on screen and only the panel scrolls.
// A sample passes its own elements; lesson modules keep rendering into the same nodes.

// Standard menu tabs. Optional tabs appear only while they have something to show.
export function standardTabs(content,{inspector='.inspector'}={}){
 return {
  guide:label=>({id:'guide',label,optional:true,show:[`${content}>*:not(article:has(table),.content-grid:has(>article table))`,`${content}>.content-grid:has(>article table)>*:not(article:has(table))`]}),
  select:{id:'select',label:'선택',show:[inspector]},
  why:{id:'why',label:'이유',optional:true,show:['#power-explanation:not([hidden])','.domain-explanation:not([hidden])']},
  table:label=>({id:'table',label,optional:true,show:[`${content}>article:has(table)`,`${content}>.content-grid>article:has(table)`]})
 };
}
export function standardPages(content,options){
 const {guide,select,why,table}=standardTabs(content,options);
 const test={move:['.fire-sim',content],selectTab:null,tabs:[{id:'test',label:'시험',show:['.fire-sim']},guide('안내')]};
 return {
  building:{tabs:[guide('안내'),select,why]},
  materials:{tabs:[guide('재료'),select,why]},
  structure:{tabs:[guide('부재'),select,why,table('배근표')]},
  electrical:{tabs:[guide('조작'),select,why,table('회로표')]},
  fire:{tabs:[guide('기구'),select,why]},
  'fire-signal':{tabs:[guide('신호'),select,why]},
  'fire-test':test,
  test,
  experience:{tabs:[guide('체험'),select,why]}
 };
}

const planKeys=['element','circuit','object','device','originalRegion'];
const planTargets='[data-element],[data-circuit],[data-object],[data-device],[data-original-region]';
const coarsePointer=window.matchMedia('(pointer:coarse)');
// Adds transparent hit areas so thin walls and small symbols meet the target size. They are never focusable.
function enhancePlanTargets(plan){
 let timer=0,observer;
 function refresh(){
  timer=0;observer.disconnect();
  plan.querySelectorAll('.wb-hit').forEach(n=>n.remove());
  const svg=plan.querySelector('svg'),ctm=svg?.getScreenCTM?.();
  if(ctm&&ctm.a>0){
   const toRoot=svg.getCTM()?.inverse(),min=(coarsePointer.matches?32:24)/ctm.a,shapes=[],lines=new Map();
   for(const element of svg.querySelectorAll(planTargets)){
    let box;try{box=element.getBBox();}catch{continue;}
    const local=element.getCTM(),m=toRoot&&local?toRoot.multiply(local):null;if(!m)continue;
    const a=[m.a*box.x+m.c*box.y+m.e,m.b*box.x+m.d*box.y+m.f],b=[m.a*(box.x+box.width)+m.c*(box.y+box.height)+m.e,m.b*(box.x+box.width)+m.d*(box.y+box.height)+m.f];
    const part={element,x0:Math.min(a[0],b[0]),y0:Math.min(a[1],b[1]),x1:Math.max(a[0],b[0]),y1:Math.max(a[1],b[1])};
    if(element.tagName==='line'){
     const key=planKeys.map(k=>element.dataset[k]??'').join('|'),group=lines.get(key);
     if(group){group.x0=Math.min(group.x0,part.x0);group.y0=Math.min(group.y0,part.y0);group.x1=Math.max(group.x1,part.x1);group.y1=Math.max(group.y1,part.y1);}else lines.set(key,part);
    }else shapes.push(part);
   }
   // Symbols keep their own area. An object drawn only with lines gets one area around them.
   const drawn=new Set(shapes.map(p=>planKeys.map(k=>p.element.dataset[k]??'').join('|')));
   const parts=[...shapes,...[...lines].filter(([key])=>!drawn.has(key)).map(([,group])=>group)];
   // Compact symbols go on top, so a switch beside a long thin wall stays reachable.
   const items=parts.map(p=>{const w=p.x1-p.x0,h=p.y1-p.y0,grow=[Math.max(0,min-w)/2,Math.max(0,min-h)/2];return {...p,reach:Math.max(w,h),left:p.x0-grow[0],right:p.x1+grow[0],top:p.y0-grow[1],bottom:p.y1+grow[1],cx:(p.x0+p.x1)/2,cy:(p.y0+p.y1)/2,small:w<min||h<min};}).filter(p=>p.small).sort((p,q)=>q.reach-p.reach);
   // Neighbours split the space between them, so a tap picks the nearer symbol.
   const compact=items.filter(p=>p.reach<min*4);
   for(let i=0;i<compact.length;i++)for(let k=i+1;k<compact.length;k++){
    const p=compact[i],q=compact[k];
    if(p.right<=q.left||q.right<=p.left||p.bottom<=q.top||q.bottom<=p.top)continue;
    if(Math.abs(q.cx-p.cx)>=Math.abs(q.cy-p.cy)){
     const [a,b]=p.cx<=q.cx?[p,q]:[q,p],mid=(a.cx+b.cx)/2;a.right=Math.max(mid,a.x1);b.left=Math.min(mid,b.x0);
    }else{
     const [a,b]=p.cy<=q.cy?[p,q]:[q,p],mid=(a.cy+b.cy)/2;a.bottom=Math.max(mid,a.y1);b.top=Math.min(mid,b.y0);
    }
   }
   for(const {element,left,right,top,bottom}of items){
    const hit=document.createElementNS('http://www.w3.org/2000/svg','rect');
    hit.setAttribute('class','wb-hit');hit.setAttribute('x',left);hit.setAttribute('y',top);hit.setAttribute('width',right-left);hit.setAttribute('height',bottom-top);hit.setAttribute('fill','transparent');hit.setAttribute('aria-hidden','true');hit.setAttribute('pointer-events','all');
    for(const [key,value]of Object.entries(element.dataset))hit.dataset[key]=value;
    svg.append(hit);
   }
  }
  watch();
 }
 const queue=()=>{if(!timer)timer=setTimeout(refresh,60);};
 observer=new MutationObserver(queue);
 const watch=()=>observer.observe(plan,{childList:true,subtree:true,attributes:true,attributeFilter:['viewBox']});
 watch();new ResizeObserver(queue).observe(plan);queue();
}
// Two fingers press the sample's own zoom buttons, so each sample keeps its zoom limits.
function enablePinchZoom(plan,zoomIn,zoomOut){
 const points=new Map();let base=0,pinching=false;
 const spread=()=>{const [a,b]=[...points.values()];return Math.hypot(a.x-b.x,a.y-b.y);};
 const stop=e=>{if(pinching)e.stopImmediatePropagation();};
 plan.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch')return;
  points.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(points.size===2){pinching=true;base=spread();plan.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:e.pointerId}));e.stopImmediatePropagation();}
 },true);
 plan.addEventListener('pointermove',e=>{
  if(!points.has(e.pointerId))return;
  points.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinching&&points.size===2){const now=spread();if(now/base>1.15){zoomIn?.click();base=now;}else if(now/base<1/1.15){zoomOut?.click();base=now;}}
  stop(e);
 },true);
 const lift=e=>{points.delete(e.pointerId);stop(e);if(!points.size)pinching=false;};
 plan.addEventListener('pointerup',lift,true);plan.addEventListener('pointercancel',e=>{if(e.isTrusted)lift(e);},true);
}

export function mountWorkbench({root,workspace,heading,canvases,plan,three,inspector,content,status=null,idleTitle,pages,extraMove=[],keepTabOn='',zoomIn=null,zoomOut=null}){
 root.classList.add('wb-main');canvases.classList.add('wb-canvases');plan.classList.add('wb-plan');three.classList.add('wb-three');
 enhancePlanTargets(plan);enablePinchZoom(plan,zoomIn,zoomOut);
 const panel=document.createElement('aside');panel.id='wb-panel';panel.className='wb-panel';
 panel.innerHTML='<div class="wb-panel-head"></div><div class="wb-tabs" role="tablist" aria-label="작업 패널"></div><div class="wb-body" role="tabpanel" tabindex="0"></div>';
 const head=panel.querySelector('.wb-panel-head'),tabBar=panel.querySelector('.wb-tabs'),body=panel.querySelector('.wb-body');
 const rules=document.createElement('style');document.head.append(rules);
 const defaults={move:['#page-actions','#study-return',...extraMove,'.inspector','#power-explanation','.domain-explanation',content],selectTab:'select',keepTabOn:['.switch-bank,#power-explanation,.domain-explanation,.wb-tabs,[data-advance],[data-reset-test]',keepTabOn].filter(Boolean).join(',')};
 const chosen=new Map(),scrolls=new Map();let active=null,moved=[],keepTab=false,lastTitle='';
 const configFor=page=>pages[page]&&{...defaults,...pages[page]};
 const title=()=>inspector.querySelector('h2')?.textContent??'';

 function park(node,target){const mark=document.createComment('wb');node.before(mark);moved.push([node,mark]);target.append(node);}
 function restore(){for(const [node,mark]of moved)mark.replaceWith(node);moved=[];panel.remove();}
 // Some panels are created after the page opens, for example once the 3D scene is ready.
 function adopt(){
  if(!active)return;
  for(const selector of configFor(active).move){
   const node=root.querySelector(selector);
   if(node&&!body.contains(node))park(node,body);
  }
 }
 function hideRules(config){
  const lines=[];
  for(const tab of config.tabs)for(const other of config.tabs)if(other!==tab)lines.push(`.wb-body[data-tab="${tab.id}"] :is(${other.show.join(',')}){display:none!important}`);
  rules.textContent=lines.join('\n');
 }
 const available=tab=>!tab.optional||tab.show.some(selector=>body.querySelector(selector));
 const scrollKey=()=>`${active}/${body.dataset.tab}`;
 function setTab(id,focus=false,resume=false){
  const config=configFor(active);if(!config)return;
  const open=config.tabs.filter(available),tab=open.find(t=>t.id===id)??open[0];if(!tab)return;
  const changed=body.dataset.tab!==tab.id;if(changed&&body.dataset.tab)scrolls.set(scrollKey(),body.scrollTop);body.dataset.tab=tab.id;
  // Writes only on change: the root observer below watches hidden and would otherwise never settle.
  for(const b of tabBar.children){const on=b.dataset.tab===tab.id,hide=!open.some(t=>t.id===b.dataset.tab);if(b.hidden!==hide)b.hidden=hide;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;if(on&&focus)b.focus();}
  if(changed)body.scrollTop=resume?scrolls.get(scrollKey())??0:0;
 }
 function refresh(){if(active)setTab(chosen.get(active));}
 // Fades the edge a tool strip can still scroll toward, so a clipped button reads as "more this way".
 const stripSelector='.workspace-toolbar,.context-tools,.fire-pages,.cv-intro-nav';
 function markStrip(strip){
  const room=strip.scrollWidth-strip.clientWidth,left=strip.scrollLeft>1,right=room-strip.scrollLeft>1;
  const more=left&&right?'both':left?'left':right?'right':'';
  if((strip.dataset.more??'')!==more)strip.dataset.more=more;
 }
 const markStrips=()=>workspace.querySelectorAll(stripSelector).forEach(markStrip);
 workspace.addEventListener('scroll',e=>{if(e.target.matches?.(stripSelector))markStrip(e.target);},{capture:true,passive:true});
 new ResizeObserver(markStrips).observe(workspace);
 function labelTables(){
  for(const table of root.querySelectorAll('table:not([data-wb-labelled])')){
   if(!table.caption&&!table.hasAttribute('aria-label')){const name=table.closest('article,section,details')?.querySelector('h2,h3,summary')?.textContent.trim();if(name)table.setAttribute('aria-label',name);}
   const heads=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());
   for(const row of table.querySelectorAll('tbody tr'))[...row.cells].forEach((cell,i)=>{if(heads[i])cell.dataset.label=heads[i];});
   table.dataset.wbLabelled='true';
  }
 }
 function enter(page){
  const config=configFor(page);active=page;document.body.classList.add('wb-on');document.body.dataset.wbPage=page;
  park(heading,head);if(status)park(status,workspace);
  tabBar.innerHTML=config.tabs.map(t=>`<button type="button" role="tab" data-tab="${t.id}">${t.label}</button>`).join('');
  hideRules(config);root.append(panel);adopt();labelTables();lastTitle=title();refresh();markStrips();
 }
 function leave(){if(!active)return;scrolls.set(scrollKey(),body.scrollTop);restore();rules.textContent='';active=null;delete body.dataset.tab;document.body.classList.remove('wb-on');delete document.body.dataset.wbPage;}
 function sync(){
  const page=root.dataset.page,next=pages[page]?page:null;
  if(next===active)return;leave();if(next)enter(next);
 }
 tabBar.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b){chosen.set(active,b.dataset.tab);setTab(b.dataset.tab,false,true);}});
 tabBar.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
  const items=[...tabBar.children].filter(b=>!b.hidden),at=items.findIndex(b=>b.dataset.tab===body.dataset.tab),step=e.key==='ArrowRight'?1:-1,next=items[(at+step+items.length)%items.length];
  e.preventDefault();chosen.set(active,next.dataset.tab);setTab(next.dataset.tab,true,true);
 });
 // Picking an object opens its details; pressing a control inside the panel keeps the student where they are.
 // Decided on press: re-rendering can detach the pressed control before the inspector changes.
 const decideKeep=e=>{keepTab=Boolean(active&&e.target.closest?.(configFor(active).keepTabOn));};
 document.addEventListener('pointerdown',decideKeep,true);
 document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key))decideKeep(e);},true);
 // A re-render removes the control just pressed; a keyboard user carries on from its replacement.
 function uniqueSelector(control){
  if(control.id)return `#${CSS.escape(control.id)}`;
  for(const [key,value]of Object.entries(control.dataset)){
   const attr=`${control.localName}[data-${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}="${CSS.escape(value)}"]`;
   if([...document.querySelectorAll(`${attr}:not(.wb-hit)`)].filter(n=>n.getClientRects().length).length===1)return attr;
  }
  return null;
 }
 document.addEventListener('click',e=>{
  if(!active||e.detail!==0)return;
  const control=e.target.closest?.('button,a,[role=button]');if(!control||control.closest('.wb-tabs'))return;
  const selector=uniqueSelector(control);
  const settle=tries=>{
   if(!active||document.activeElement&&document.activeElement!==document.body)return;
   const next=selector&&[...document.querySelectorAll(selector)].find(n=>n.getClientRects().length);
   if(next)next.focus({preventScroll:true});
   else if(tries)setTimeout(settle,150,tries-1);
   else body.focus({preventScroll:true});
  };
  setTimeout(settle,60,3);
 },true);
 new MutationObserver(()=>{
  if(!active)return;
  const now=title(),changed=now!==lastTitle;lastTitle=now;
  const config=configFor(active);if(!changed||!config.selectTab||idleTitle===now)return;
  if(keepTab)return;
  chosen.set(active,config.selectTab);setTab(config.selectTab);
 }).observe(inspector,{childList:true,subtree:true,characterData:true});
 new MutationObserver(()=>{labelTables();if(active){adopt();refresh();markStrips();}}).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
 // A lost GPU context otherwise leaves a blank white pane with no explanation.
 three.addEventListener('webglcontextlost',()=>setTimeout(()=>{
  if(three.dataset.context==='lost'||three.querySelector('.wb-lost'))return;
  const note=document.createElement('div');note.className='wb-lost';note.setAttribute('role','alert');
  note.innerHTML='<p>3D 연결이 끊겼습니다.</p><button type="button">다시 불러오기</button>';
  note.querySelector('button').onclick=()=>location.reload();three.append(note);
 }),true);
 three.addEventListener('webglcontextrestored',()=>three.querySelector('.wb-lost')?.remove(),true);
 const baseTitle=document.title;
 const retitle=()=>{const h=heading.querySelector('h1')?.textContent.trim();document.title=h?`${h} · ${baseTitle}`:baseTitle;};
 new MutationObserver(retitle).observe(heading,{childList:true,subtree:true,characterData:true});retitle();
 const skip=document.createElement('a');skip.className='wb-skip';skip.href='#';skip.textContent='학습 내용으로 건너뛰기';
 skip.addEventListener('click',e=>{e.preventDefault();const target=active?body:root;if(!active)root.tabIndex=-1;target.focus();});
 document.body.prepend(skip);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-page']});
 sync();
 return {show(id){if(active){chosen.set(active,id);setTab(id);}},resume(){if(active)body.scrollTop=scrolls.get(scrollKey())??0;}};
}
