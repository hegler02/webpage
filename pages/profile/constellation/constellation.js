import {model} from './graph-model.mjs';
import {renderReader,renderLabels,renderList,renderTrail} from './graph-view.mjs';
const $=id=>document.getElementById(id);
$('menu').addEventListener('click',()=>{const open=$('menu').getAttribute('aria-expanded')!=='true';$('menu').setAttribute('aria-expanded',String(open));$('main-nav').classList.toggle('open',open);});
const root=$('interactive'),space=$('map'),labels=$('nodes'),explorer=root.querySelector('.explorer');
let graph,db,state,adapter=null,loading=false,failed=false,visible=false,dead=false,trail=[],latest,limit=7;
function fallback(reason){failed=true;adapter?.destroy();adapter=null;space.classList.add('flat');$('engine-status').textContent=reason||'평면 지도';$('map-help').textContent='작품을 눌러 연결 읽기';}
async function reconcile(){
  const active=state?.view==='map'&&visible&&!document.hidden&&!dead;
  if(!active){adapter?.pause();return;}
  if(adapter){adapter.resume();return;}
  if(loading||failed)return;
  loading=true;
  try{const {mount}=await import('./space-adapter.mjs');if(dead)return;
    adapter=await mount($('canvas-host'),labels,$('engine-status'),{onFailure:fallback});
    if(dead){adapter.destroy();adapter=null;return;}
    space.classList.remove('flat');adapter.update(latest);
    if(state.view!=='map'||!visible||document.hidden)adapter.pause();
  }catch(error){fallback('3D 사용 불가 · 평면 지도');}finally{loading=false;}
}
function setURL(replace=false){const url=db.toURL(state,location.href);history[replace?'replaceState':'pushState'](null,'',url);}
function render(){
  limit=explorer.clientWidth<600?4:7;
  const w=db.window(state,limit);state.page=w.page;latest={visible:w.visible,edges:graph.edges,selected:state.selected};
  $('scope').value=state.scope;$('search').value=state.query;
  $('map-view').setAttribute('aria-pressed',String(state.view==='map'));
  $('list-view').setAttribute('aria-pressed',String(state.view==='list'));
  space.hidden=state.view!=='map';$('record-list').hidden=state.view!=='list';
  $('result-count').textContent=`전체 ${graph.nodes.length}개 기록 · ${graph.edges.length}개 연결 / 현재 범위 ${w.all.length}개`;
  $('page-count').textContent=`${w.page+1} / ${w.pages}`;$('previous').disabled=w.page===0;$('next').disabled=w.page===w.pages-1;
  $('location').textContent=state.query?`“${state.query}” 검색`:state.overview?'작품과 마음이 이어지는 자리':db.byId.get(state.selected).title;
  renderLabels(labels,w.visible,state.selected);renderList($('record-list'),w.visible,state.selected);
  const n=db.byId.get(state.selected);renderReader($('reader-content'),n,db.neighbors(n.id));
  renderTrail($('history'),trail,db.byId);
  if(!w.visible.length){space.classList.add('empty-map');}else space.classList.remove('empty-map');
  adapter?.update(latest);reconcile();
}
function choose(id,{fromList=false}={}){
  if(!db.byId.has(id))return;
  state.selected=id;state.missing=false;state.overview=false;
  if(!fromList){state.overview=false;state.scope='context';state.query='';state.page=0;}
  if(trail.at(-1)!==id)trail=[...trail.slice(-4),id];
  setURL();render();
  $('reader').scrollTop=0;
  $('notice').textContent=`${db.byId.get(id).title} 기록을 열었습니다.`;
  // Replaced controls must not strand keyboard focus on the document body.
  $('reader-title').focus({preventScroll:true});
}
// Reading intent moves both the nested panel and keyboard focus. A bare hash
// cannot reveal a scrolled panel and would re-enter the popstate renderer.
$('read-selected').addEventListener('click',e=>{
  const title=$('reader-title');if(!title)return;
  e.preventDefault();
  const reader=$('reader');
  reader.scrollTo({top:0,behavior:'instant'});
  title.focus({preventScroll:true});
  reader.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
});
root.addEventListener('click',e=>{const button=e.target.closest('[data-node]');if(button)choose(button.dataset.node,{fromList:!!button.closest('#record-list')});});
for(const view of ['map','list'])$(view+'-view').addEventListener('click',()=>{state.view=view;setURL();render();});
$('scope').addEventListener('change',()=>{state.scope=$('scope').value;state.page=0;state.overview=true;setURL();render();});
$('search').addEventListener('input',()=>{state.query=$('search').value;state.page=0;setURL(true);render();});
$('reset').addEventListener('click',()=>{state={...state,scope:'context',query:'',overview:true,page:0};adapter?.reset();setURL();render();});
for(const [id,delta] of [['previous',-1],['next',1]])$(id).addEventListener('click',()=>{state.page+=delta;setURL();render();$(delta<0?'previous':'next').disabled&&$(delta<0?'next':'previous').focus();});
$('share').addEventListener('click',async()=>{
  const url=db.toURL(state,'https://mirinaeman.com/constellation/').href;
  try{if(navigator.share){await navigator.share({title:'미리내의 별자리',url});$('notice').textContent='공유 창을 닫았습니다.';return;}}
  catch(e){if(e.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(url);$('notice').textContent='연결 주소를 복사했습니다.';}
  catch{const input=$('share-url');input.hidden=false;input.value=url;input.focus();input.select();$('notice').textContent='이 주소를 선택해 복사해 주세요.';}
});
window.addEventListener('popstate',()=>{if(!db)return;state=db.fromURL(location.href);render();});
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;reconcile();},{threshold:.01});observer.observe(space);
const resizeObserver=new ResizeObserver(()=>{if(state&&limit!==(explorer.clientWidth<600?4:7)){state.page=0;render();}});resizeObserver.observe(explorer);
document.addEventListener('visibilitychange',reconcile);
window.addEventListener('pagehide',()=>{dead=true;adapter?.destroy();adapter=null;});
window.addEventListener('pageshow',e=>{if(e.persisted){dead=false;reconcile();}});
try{
  const response=await fetch('/pages/profile/constellation/graph.json');if(!response.ok)throw new Error('graph');
  graph=await response.json();db=model(graph);state=db.fromURL(location.href);trail=[state.selected];
  root.hidden=false;document.querySelector('.reading-index').open=false;space.classList.add('flat');
  render();
  if(state.missing)$('notice').textContent='요청한 기록을 찾을 수 없어 시작 지도를 열었습니다. 목록에서 확인해 주세요.';
}catch(error){$('notice').textContent='탐색 화면을 불러오지 못했습니다. 아래 전체 기록에서 읽을 수 있습니다.';document.querySelector('.reading-index').open=true;}
