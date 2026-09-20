import {createMotion} from './motion.js';
const stage=document.getElementById('stage');
const slides=[...stage.querySelectorAll('.slide')];
const viewport=document.getElementById('stage-viewport');
const settings=JSON.parse(document.getElementById('deck-settings').textContent);
let language=new URL(location.href).searchParams.get('lang')==='en'?'en':'ko';
let parts=settings.parts[language];
const controls={previous:document.getElementById('previous'),next:document.getElementById('next'),counter:document.getElementById('position'),part:document.getElementById('current-part'),outline:document.getElementById('outline'),menu:document.getElementById('menu'),fullscreen:document.getElementById('fullscreen'),share:document.getElementById('share'),shareDialog:document.getElementById('share-dialog'),status:document.getElementById('status')};
const motion=createMotion(stage,document.getElementById('curtain'));
const notice=document.getElementById('notice');let noticeTimer;
function notify(message){clearTimeout(noticeTimer);notice.textContent=message;noticeTimer=setTimeout(()=>notice.textContent='',4000);}
const reduceControl=document.getElementById('reduce-motion');reduceControl.checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
reduceControl.addEventListener('change',()=>motion.setReduced(reduceControl.checked));
const rootStyle=getComputedStyle(document.documentElement);
const geometry={width:parseFloat(rootStyle.getPropertyValue('--stage-width')),height:parseFloat(rootStyle.getPropertyValue('--stage-height'))};
const pad=n=>String(n).padStart(2,'0');
const headingText=slide=>{const h=slide.querySelector('h1,h2');return [...h.childNodes].map(n=>n.nodeName==='BR'?' ':n.textContent).join('').replace(/\s+/g,' ').trim();};
let current=-1;
const hashIndex=()=>{const index=slides.findIndex(s=>'#'+s.id===location.hash);return index<0?0:index;};
const items=[...controls.outline.querySelectorAll('.outline-link')];
const segments=slides.map((s,i)=>{
 const b=document.createElement('button');b.className='segment';b.type='button';b.setAttribute('aria-label',`${i+1}장: ${headingText(s)}`);b.addEventListener('click',()=>go(i));document.getElementById('segments').append(b);return b;
});
function fit(){const {width,height}=viewport.getBoundingClientRect();document.documentElement.style.setProperty('--scale',Math.min(width/geometry.width,height/geometry.height));}
function closeOutline(){controls.outline.close();controls.menu.setAttribute('aria-expanded','false');}
function go(index,{history=true,animate=true}={}){
 const target=Math.max(0,Math.min(slides.length-1,index));if(target===current)return;
 const previous=slides[current];const next=slides[target];const direction=target-current;
 const transferFocus=previous?.contains(document.activeElement);
 motion.clean();
 slides.forEach((slide,i)=>{const active=i===target;slide.classList.toggle('active',active);slide.inert=!active;slide.setAttribute('aria-hidden',String(!active));});
 current=target;
 controls.previous.disabled=current===0;controls.next.disabled=current===slides.length-1;
 controls.counter.innerHTML=`<strong>${pad(current+1)}</strong> / ${pad(slides.length)}`;
 controls.part.textContent=`PART ${pad(Number(next.dataset.part))} — ${parts[Number(next.dataset.part)-1]}`;
 segments.forEach((b,i)=>{b.setAttribute('aria-current',String(i===current));b.toggleAttribute('data-past',i<current);});
 items.forEach(a=>a.setAttribute('aria-current',String(a.hash==='#'+next.id)));
 if(history&&/^https?:$/.test(location.protocol))window.history.pushState(null,'','#'+next.id);
 if(transferFocus)next.focus({preventScroll:true});
 viewport.scrollTop=0;
 controls.status.textContent=`${current+1} / ${slides.length}. ${headingText(next)}`;
 if(animate)motion.play(previous,next,direction,previous?.dataset.part!==next.dataset.part||next.dataset.chapter==='true');
}
controls.previous.addEventListener('click',()=>go(current-1));controls.next.addEventListener('click',()=>go(current+1));
controls.menu.addEventListener('click',()=>{controls.menu.setAttribute('aria-expanded','true');controls.outline.showModal();});
controls.outline.addEventListener('close',()=>controls.menu.setAttribute('aria-expanded','false'));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
items.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const target=slides.findIndex(s=>'#'+s.id===a.hash);closeOutline();go(target);slides[current].focus({preventScroll:true});}));
controls.fullscreen.hidden=!document.fullscreenEnabled;
controls.fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notify(language==='ko'?'현재 브라우저에서 전체화면을 사용할 수 없습니다.':'Fullscreen is not available in this browser.');}});
document.addEventListener('fullscreenchange',()=>{const full=!!document.fullscreenElement;controls.fullscreen.setAttribute('aria-pressed',String(full));controls.fullscreen.setAttribute('aria-label',full?'전체화면 종료':'전체화면');fit();});
controls.share.addEventListener('click',async()=>{
 const url=new URL(document.querySelector('link[rel=canonical]').href);url.hash=slides[current].id;if(language==='en')url.searchParams.set('lang','en');
 try{await navigator.clipboard.writeText(url.href);notify(language==='ko'?'현재 슬라이드 주소를 복사했습니다.':'Slide link copied.');controls.share.dataset.copied='true';controls.share.title='주소 복사 완료';}
 catch{document.getElementById('share-url').value=url.href;controls.shareDialog.showModal();}
});
document.addEventListener('keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||document.querySelector('dialog[open]'))return;
 if(e.target.closest('input,textarea,select,[contenteditable=true]'))return;
 if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(current+1);}
 else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(current-1);}
 else if(e.key==='Home'){e.preventDefault();go(0);}
 else if(e.key==='End'){e.preventDefault();go(slides.length-1);}
 else if(e.key===' '&&!e.target.closest('a,button')){e.preventDefault();go(current+(e.shiftKey?-1:1));}
});
let gesture=null;
viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'&&!e.target.closest('a,button,input'))gesture={x:e.clientX,y:e.clientY,id:e.pointerId};});
viewport.addEventListener('pointercancel',()=>gesture=null);
viewport.addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.8)go(current+(dx<0?1:-1));});
window.addEventListener('hashchange',()=>go(hashIndex(),{history:false}));
window.addEventListener('popstate',()=>{setLanguage(new URL(location.href).searchParams.get('lang')==='en'?'en':'ko',false);go(hashIndex(),{history:false});});
function setLanguage(lang,writeURL=true){
 language=lang;parts=settings.parts[lang];motion.clean();document.documentElement.lang=lang;
 const pack=settings.i18n[lang];
 document.querySelectorAll('[data-i18n]').forEach(el=>{if(pack[el.dataset.i18n])el.innerHTML=pack[el.dataset.i18n];});
 const plain=value=>{const template=document.createElement('template');template.innerHTML=value.replaceAll('<br>',' ');return template.content.textContent;};
 document.querySelectorAll('[data-outline-key]').forEach(el=>el.textContent=plain(pack[el.dataset.outlineKey]));
 document.querySelectorAll('[data-part-title]').forEach(el=>el.textContent=parts[Number(el.dataset.partTitle)-1]);
 document.getElementById('lang-ko').setAttribute('aria-pressed',String(lang==='ko'));document.getElementById('lang-en').setAttribute('aria-pressed',String(lang==='en'));
 const labels=lang==='ko'?['이전 슬라이드','다음 슬라이드','목차 열기','현재 슬라이드 링크 복사','전체화면','닫기']:['Previous slide','Next slide','Open outline','Copy current slide link','Fullscreen','Close'];
 [controls.previous,controls.next,controls.menu,controls.share,controls.fullscreen].forEach((b,i)=>b.setAttribute('aria-label',labels[i]));
 document.querySelectorAll('[data-close]').forEach(b=>b.setAttribute('aria-label',labels[5]));
 segments.forEach((b,i)=>b.setAttribute('aria-label',`${i+1}: ${headingText(slides[i])}`));
 if(current>=0){controls.part.textContent=`PART ${pad(Number(slides[current].dataset.part))} — ${parts[Number(slides[current].dataset.part)-1]}`;controls.status.textContent=`${current+1} / ${slides.length}. ${headingText(slides[current])}`;}
 if(writeURL){const url=new URL(location.href);if(lang==='en')url.searchParams.set('lang','en');else url.searchParams.delete('lang');history.replaceState(null,'',url);}
}
['ko','en'].forEach(lang=>document.getElementById('lang-'+lang).addEventListener('click',()=>setLanguage(lang)));
setLanguage(language,false);
document.documentElement.classList.add('enhanced');new ResizeObserver(fit).observe(viewport);fit();go(hashIndex(),{history:false});
