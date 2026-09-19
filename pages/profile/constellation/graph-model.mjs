// Public data and navigation only. No DOM, transport or rendering authority.
export const PAGE_SIZE = 7;
export const KINDS = {work:'작품',concept:'창작의 관점',essay:'마음의 기록',judgment:'제작의 판단',paper:'논문',topic:'연구 주제',creator:'창작자'};
export function model(graph) {
  const byId = new Map(graph.nodes.map(n => [n.id, n]));
  const neighbors = id => graph.edges.filter(e => e.source===id || e.target===id)
    .map(edge => ({edge,node:byId.get(edge.source===id?edge.target:edge.source)}))
    .sort((a,b) => (a.node.kind==='creator')-(b.node.kind==='creator'));
  function pool(state) {
    if(state.query) return graph.nodes.filter(n => [n.title,n.summary,...(n.tags||[])].join(' ').toLocaleLowerCase().includes(state.query.toLocaleLowerCase()) && (state.scope!=='papers'||['paper','topic'].includes(n.kind)));
    if(state.scope==='all') return graph.nodes;
    if(state.scope==='papers') return graph.nodes.filter(n=>['paper','topic'].includes(n.kind));
    if(state.overview) return graph.featured.map(id=>byId.get(id)).filter(Boolean);
    return [...new Set([state.selected,...neighbors(state.selected).map(x=>x.node.id)])].map(id=>byId.get(id)).filter(Boolean);
  }
  function window(state,limit=PAGE_SIZE) {
    let all=pool(state);
    // A compact opening must retain a visible relationship, not only four
    // disconnected image cards. Remaining records stay on the following page.
    if(limit<7&&state.overview&&state.scope==='context'&&!state.query&&all.length){
      const near=new Set(neighbors(all[0].id).map(x=>x.node.id));
      all=[all[0],...all.slice(1).filter(n=>near.has(n.id)),...all.slice(1).filter(n=>!near.has(n.id))];
    }
    const pages=Math.max(1,Math.ceil(all.length/limit));
    const page=Math.min(Math.max(0,state.page),pages-1);
    return {all,pages,page,visible:all.slice(page*limit,(page+1)*limit)};
  }
  function fromURL(url) {
    const p=new URL(url).searchParams, requested=p.get('node');
    return {selected:byId.has(requested)?requested:graph.defaultNode,overview:!requested,
      missing:!!requested&&!byId.has(requested),scope:['all','papers'].includes(p.get('scope'))?p.get('scope'):'context',
      view:p.get('view')==='list'?'list':'map',query:p.get('q')||'',page:Math.max(0,Number(p.get('page'))||0)};
  }
  function toURL(state,url) {
    const u=new URL(url);u.search='';
    if(!state.overview)u.searchParams.set('node',state.selected);
    if(state.scope!=='context')u.searchParams.set('scope',state.scope);
    if(state.view==='list')u.searchParams.set('view','list');
    if(state.query)u.searchParams.set('q',state.query);
    if(state.page)u.searchParams.set('page',state.page);
    return u;
  }
  return {byId,neighbors,pool,window,fromURL,toURL};
}
