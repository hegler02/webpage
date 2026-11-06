// Shared workbench shell: the viewer stays on screen and only the panel scrolls.
// A sample passes its own elements; lesson modules keep rendering into the same nodes.

// Standard menu tabs. Optional tabs appear only while they have something to show.
export function standardTabs(content,{inspector='.inspector'}={}){
 return {
  guide:label=>({id:'guide',label,optional:true,show:[`${content}>*:not(article:has(table))`]}),
  select:{id:'select',label:'선택',show:[inspector]},
  why:{id:'why',label:'이유',optional:true,show:['#power-explanation:not([hidden])','.domain-explanation:not([hidden])']},
  table:label=>({id:'table',label,optional:true,show:[`${content}>article:has(table)`]})
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

export function mountWorkbench({root,workspace,heading,canvases,plan,three,inspector,content,status=null,idleTitle,pages,extraMove=[],keepTabOn=''}){
 root.classList.add('wb-main');canvases.classList.add('wb-canvases');plan.classList.add('wb-plan');three.classList.add('wb-three');
 const panel=document.createElement('aside');panel.id='wb-panel';panel.className='wb-panel';
 panel.innerHTML='<div class="wb-panel-head"></div><div class="wb-tabs" role="tablist" aria-label="작업 패널"></div><div class="wb-body" role="tabpanel" tabindex="0"></div>';
 const head=panel.querySelector('.wb-panel-head'),tabBar=panel.querySelector('.wb-tabs'),body=panel.querySelector('.wb-body');
 const rules=document.createElement('style');document.head.append(rules);
 const defaults={move:['#study-return',...extraMove,'.inspector','#power-explanation','.domain-explanation',content],selectTab:'select',keepTabOn:['.switch-bank,#power-explanation,.domain-explanation,.wb-tabs',keepTabOn].filter(Boolean).join(',')};
 const chosen=new Map();let active=null,moved=[],keepTab=false,lastTitle='';
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
 function setTab(id,focus=false){
  const config=configFor(active);if(!config)return;
  const open=config.tabs.filter(available),tab=open.find(t=>t.id===id)??open[0];if(!tab)return;
  const changed=body.dataset.tab!==tab.id;body.dataset.tab=tab.id;
  // Writes only on change: the root observer below watches hidden and would otherwise never settle.
  for(const b of tabBar.children){const on=b.dataset.tab===tab.id,hide=!open.some(t=>t.id===b.dataset.tab);if(b.hidden!==hide)b.hidden=hide;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;if(on&&focus)b.focus();}
  if(changed)body.scrollTop=0;
 }
 function refresh(){if(active)setTab(chosen.get(active));}
 function labelTables(){
  for(const table of body.querySelectorAll('table:not([data-wb-labelled])')){
   const heads=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());
   for(const row of table.querySelectorAll('tbody tr'))[...row.cells].forEach((cell,i)=>{if(heads[i])cell.dataset.label=heads[i];});
   table.dataset.wbLabelled='true';
  }
 }
 function enter(page){
  const config=configFor(page);active=page;document.body.classList.add('wb-on');document.body.dataset.wbPage=page;
  park(heading,head);if(status)park(status,workspace);
  tabBar.innerHTML=config.tabs.map(t=>`<button type="button" role="tab" data-tab="${t.id}">${t.label}</button>`).join('');
  hideRules(config);root.append(panel);adopt();labelTables();lastTitle=title();refresh();
 }
 function leave(){if(!active)return;restore();rules.textContent='';active=null;delete body.dataset.tab;document.body.classList.remove('wb-on');delete document.body.dataset.wbPage;}
 function sync(){
  const page=root.dataset.page,next=pages[page]?page:null;
  if(next===active)return;leave();if(next)enter(next);
 }
 tabBar.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b){chosen.set(active,b.dataset.tab);setTab(b.dataset.tab);}});
 tabBar.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
  const items=[...tabBar.children].filter(b=>!b.hidden),at=items.findIndex(b=>b.dataset.tab===body.dataset.tab),step=e.key==='ArrowRight'?1:-1,next=items[(at+step+items.length)%items.length];
  e.preventDefault();chosen.set(active,next.dataset.tab);setTab(next.dataset.tab,true);
 });
 // Picking an object opens its details; pressing a control inside the panel keeps the student where they are.
 // Decided on press: re-rendering can detach the pressed control before the inspector changes.
 document.addEventListener('pointerdown',e=>{keepTab=Boolean(active&&e.target.closest?.(configFor(active).keepTabOn));},true);
 new MutationObserver(()=>{
  if(!active)return;
  const now=title(),changed=now!==lastTitle;lastTitle=now;
  const config=configFor(active);if(!changed||!config.selectTab||idleTitle===now)return;
  if(keepTab)return;
  chosen.set(active,config.selectTab);setTab(config.selectTab);
 }).observe(inspector,{childList:true,subtree:true,characterData:true});
 new MutationObserver(()=>{if(active){adopt();labelTables();refresh();}}).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-page']});
 sync();
 return {show(id){if(active){chosen.set(active,id);setTab(id);}}};
}
