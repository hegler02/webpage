(()=>{'use strict';
const menu=document.querySelector('#mobile-menu'),toggle=document.querySelector('.menu-toggle');
const links=[...document.querySelectorAll('a[href^="#"]')];
function close(returnFocus=false){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='메뉴';if(returnFocus)toggle.focus();}
toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'닫기':'메뉴';if(open){if(!matchMedia('(prefers-reduced-motion: reduce)').matches)menu.animate([{opacity:.7},{opacity:1}],{duration:RESONANCE.experience.motion.short*1000});menu.querySelector('a').focus();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)close(true)});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))close()});
links.forEach(link=>link.addEventListener('click',()=>{close();const target=document.querySelector(link.hash);if(target){target.setAttribute('tabindex','-1');requestAnimationFrame(()=>target.focus({preventScroll:true}));}}));
matchMedia(`(min-width:${RESONANCE.breakpoints.compact+1}px)`).addEventListener('change',()=>close());
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){document.querySelectorAll('.site-header nav a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-10% 0px -65% 0px'});
RESONANCE && document.querySelectorAll('main>section').forEach(s=>observer.observe(s));
})();
