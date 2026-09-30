import {gsap} from 'gsap';
import {animate,hover} from 'motion';
import {directIntro,introSelector} from './intro.js';
const animatedSelector='[data-reveal],'+introSelector;
const slides=[...document.querySelectorAll('.slide')],stage=document.querySelector('.stage'),viewport=document.querySelector('.viewport');
const jump=document.querySelector('#jump'),position=document.querySelector('#position'),prev=document.querySelector('#prev'),next=document.querySelector('#next'),panel=document.querySelector('#notes-panel');
const reduce=matchMedia('(prefers-reduced-motion:reduce)');let current=0,timeline=null,progressAnimation=null;
const timings={scene:.48,item:.45,stagger:.1,control:.15};
function fit(){const b=viewport.getBoundingClientRect();document.documentElement.style.setProperty('--scale',String(Math.min(b.width/1920,b.height/1080)));}
function go(index,{focus=false,hash=true}={}){current=Math.max(0,Math.min(slides.length-1,index));timeline?.kill();gsap.killTweensOf(slides.flatMap(s=>[s,...s.querySelectorAll(animatedSelector)]));
 for(const [i,s] of slides.entries()){const visible=i===current||document.body.classList.contains('reading');s.classList.toggle('active',i===current);s.inert=!visible;s.setAttribute('aria-hidden',String(!visible));gsap.set([s,...s.querySelectorAll(animatedSelector)],{clearProps:'transform,opacity,visibility'});}
 const slide=slides[current];prev.disabled=current===0;next.disabled=current===slides.length-1;jump.value=String(current);position.textContent=`${current+1} / ${slides.length}`;panel.querySelector('p').textContent=slide.querySelector('.speaker-notes').textContent;
 progressAnimation?.stop();progressAnimation=animate('.progress span',{width:`${(current+1)/slides.length*100}%`},{duration:reduce.matches?0:.25});
 if(hash)history.replaceState(null,'',`#slide-${current+1}`);
 if(!reduce.matches&&!document.body.classList.contains('reading')){timeline=gsap.timeline();timeline.fromTo(slide,{opacity:0,x:60},{opacity:1,x:0,duration:timings.scene,ease:'power2.out'});if(slide.classList.contains('kind-intro'))directIntro(timeline,slide);else timeline.fromTo(slide.querySelectorAll(animatedSelector),{opacity:0,y:30},{opacity:1,y:0,duration:timings.item,stagger:slide.classList.contains('kind-flow')?.16:timings.stagger,ease:'power2.out'},.16);}
 if(focus)slide.querySelector('h2').focus({preventScroll:true});if(document.body.classList.contains('reading'))slide.scrollIntoView({block:'start'});
}
prev.addEventListener('click',()=>go(current-1));next.addEventListener('click',()=>go(current+1));jump.addEventListener('change',()=>go(Number(jump.value),{focus:true}));
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('button,a,input,select,textarea,[contenteditable]'))return;const map={ArrowRight:current+1,PageDown:current+1,ArrowLeft:current-1,PageUp:current-1,Home:0,End:slides.length-1};if(e.key in map){e.preventDefault();go(map[e.key],{focus:true});}});
document.querySelector('#reading').addEventListener('click',e=>{const on=document.body.classList.toggle('reading');e.currentTarget.setAttribute('aria-pressed',String(on));panel.hidden=true;document.querySelector('#notes-toggle').setAttribute('aria-expanded','false');go(current);fit();});
document.querySelector('#notes-toggle').addEventListener('click',e=>{panel.hidden=!panel.hidden;e.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));});
document.querySelector('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{document.querySelector('#share-status').textContent='이 환경에서 전체 화면을 사용할 수 없습니다.';}});
document.querySelector('#share').addEventListener('click',async()=>{const status=document.querySelector('#share-status');try{await navigator.clipboard.writeText(location.href);status.textContent='현재 강의 주소를 복사했습니다.';}catch{status.textContent='주소를 복사하지 못했습니다. 주소 표시줄의 주소를 복사해주세요.';}});
for(const button of document.querySelectorAll('[data-copy]'))button.addEventListener('click',async()=>{const text=button.parentElement.querySelector('.prompt-text').innerText,status=button.parentElement.querySelector('.copy-status');try{await navigator.clipboard.writeText(text);status.textContent='복사했습니다.';}catch{status.textContent='문장을 직접 선택해 복사해주세요.';}});
// Motion owns controls only; GSAP owns slide/scene transforms. No shared property owner.
hover('button,.intro-button',element=>{if(reduce.matches||element.disabled)return;const intro=element.classList.contains('intro-button');const a=animate(element,intro?{filter:'brightness(1.12)'}:{scale:1.035},{duration:timings.control});return()=>{a.stop();animate(element,intro?{filter:'brightness(1)'}:{scale:1},{duration:timings.control});};});
window.addEventListener('resize',fit);window.addEventListener('hashchange',()=>{const n=Number(location.hash.replace('#slide-',''));if(Number.isInteger(n)&&n>0)go(n-1,{hash:false});});reduce.addEventListener('change',()=>go(current));
document.body.classList.add('js');const initial=Number(location.hash.replace('#slide-',''));go(Number.isInteger(initial)&&initial>0?initial-1:0,{hash:false});fit();
