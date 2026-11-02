export function initCatalogue(){
 const root=document.querySelector('.catalogue'),form=root.querySelector('.filters'),cards=[...root.querySelectorAll('.case-card')],size=Number(root.dataset.pageSize);
 const fields=['query','level','track','category'];let page=0,filtered=cards;
 try{const saved=JSON.parse(sessionStorage.getItem('drone-catalogue-v2')||'null');if(saved){for(const key of fields)form.elements[key].value=saved.values[key]||'';page=saved.page||0;}}catch{}
 function show(){
  const values=Object.fromEntries(fields.map(k=>[k,form.elements[k].value])),terms=values.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  filtered=cards.filter(c=>terms.every(t=>c.dataset.search.includes(t))&&(!values.level||c.dataset.level===values.level)&&(!values.track||c.dataset.track===values.track)&&(!values.category||c.dataset.category===values.category));
  const pages=Math.ceil(filtered.length/size);page=Math.max(0,Math.min(page,pages-1));cards.forEach(c=>c.hidden=true);filtered.slice(page*size,page*size+size).forEach(c=>c.hidden=false);
  root.querySelector('#result-count').textContent=`${filtered.length}개 사례 / 전체 ${cards.length}개`;
  root.querySelector('#page-count').textContent=pages?`${page+1} / ${pages}`:'0 / 0';
  root.querySelector('#page-prev').disabled=page===0;root.querySelector('#page-next').disabled=page>=pages-1;
  root.querySelector('.empty').hidden=!!filtered.length;root.querySelector('.case-grid').hidden=!filtered.length;
  try{sessionStorage.setItem('drone-catalogue-v2',JSON.stringify({values,page}));}catch{}
 }
 form.addEventListener('submit',event=>event.preventDefault());
 form.addEventListener('input',()=>{page=0;show();});form.addEventListener('change',()=>{page=0;show();});
 form.addEventListener('reset',event=>{event.preventDefault();for(const key of fields)form.elements[key].value='';page=0;show();});
 root.querySelector('#empty-reset').addEventListener('click',()=>{form.reset();form.elements.query.focus();});
 addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,select,textarea'))return;if(event.key==='ArrowRight'&&!root.querySelector('#page-next').disabled){page++;show();event.preventDefault();}else if(event.key==='ArrowLeft'&&!root.querySelector('#page-prev').disabled){page--;show();event.preventDefault();}});
 root.querySelector('#page-prev').addEventListener('click',()=>{page--;show();});root.querySelector('#page-next').addEventListener('click',()=>{page++;show();});show();
}
