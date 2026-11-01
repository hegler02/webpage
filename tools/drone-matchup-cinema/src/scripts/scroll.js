(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  const stop = () => { cancelAnimationFrame(frame); frame = 0; };
  ['wheel','touchstart'].forEach(name => addEventListener(name, stop, {passive:true}));
  addEventListener('keydown', e => { if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)) stop(); });
  function travel(target, focus = true) {
    stop();
    const start = scrollY;
    const margin = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 24;
    const end = Math.max(0, target.getBoundingClientRect().top + start - margin);
    const duration = reduced.matches ? 0 : Math.min(950, Math.max(300, Math.abs(end-start)*.2));
    const began = performance.now();
    const settle = () => {
      if(location.protocol !== 'file:') history.replaceState(null,'','#'+target.id);
      if(focus){target.tabIndex=-1;target.focus({preventScroll:true});}
    };
    const tick = now => {
      const p = duration ? Math.min(1,(now-began)/duration) : 1;
      const ease = p<.5 ? 4*p*p*p : 1-Math.pow(-2*p+2,3)/2;
      scrollTo(0,start+(end-start)*ease);
      if(p<1) frame=requestAnimationFrame(tick); else {frame=0;settle();}
    };
    frame=requestAnimationFrame(tick);
  }
  document.addEventListener('click', e => {
    const anchor=e.target.closest('a[href^="#"]');
    if(!anchor) return;
    const target=document.getElementById(anchor.getAttribute('href').slice(1));
    if(target){e.preventDefault();travel(target);}
  });
  document.addEventListener('film:seek-requested', () => travel(document.getElementById('screening'),false));
  const steps=[...document.querySelectorAll('.step')];
  const stills=[...document.querySelectorAll('.scene-stage img')];
  if('IntersectionObserver' in window){
    document.documentElement.classList.add('has-scenes');
    let pending=false;
    function update(){
      pending=false;
      const mid=innerHeight*.48;
      let index=steps.reduce((best,step,i)=>Math.abs(step.getBoundingClientRect().top+step.offsetHeight/2-mid)<Math.abs(steps[best].getBoundingClientRect().top+steps[best].offsetHeight/2-mid)?i:best,0);
      stills.forEach((im,i)=>im.classList.toggle('active',i===index));
      document.getElementById('scene-count').textContent=`0${index+1} / 04`;
      document.getElementById('scene-title').textContent=steps[index].querySelector('h3').textContent;
      document.getElementById('scene-progress').style.width=`${(index+1)*25}%`;
    }
    const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(update);}};
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
  }
})();
