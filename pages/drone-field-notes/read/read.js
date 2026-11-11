"use strict";
/* The header ruler follows the case being read; the page reads fully without it. */
(()=>{
  const cells=[...document.querySelectorAll('.now .ruler li')],cases=[...document.querySelectorAll('.case')];
  if(!cells.length||!cases.length||!('IntersectionObserver' in window))return;
  const keys=cells.map(c=>[...c.classList].find(n=>n.startsWith('stage-')).slice(6));
  const light=stages=>cells.forEach((c,i)=>c.classList.toggle('is-on',stages.includes(keys[i])));
  const visible=new Set();
  const observer=new IntersectionObserver(entries=>{
    for(const e of entries)e.isIntersecting?visible.add(e.target):visible.delete(e.target);
    const current=cases.find(c=>visible.has(c));
    light(current?current.dataset.stages.split(' ').filter(Boolean):[]);
  },{rootMargin:'-30% 0px -60% 0px'});
  cases.forEach(c=>observer.observe(c));
})();
