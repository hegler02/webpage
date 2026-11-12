// The page turns like a name card: halfway through the turn the label changes, then it turns back.
import {parseVideoId} from './youtube.mjs';

const root=document.documentElement,sheet=document.getElementById('sheet'),flip=document.getElementById('flip');
const still=matchMedia('(prefers-reduced-motion:reduce)');
const half=()=>parseFloat(getComputedStyle(root).getPropertyValue('--flip-time'))*1000;
const ID=parseVideoId('https://youtu.be/dzRe7F4zb3o');

function swap(){
 const next=root.dataset.label==='gancheop'?'spy':'gancheop';
 if(still.matches){root.dataset.label=next;return;}
 // Turn around the middle of the screen, not the middle of the whole page.
 sheet.style.transformOrigin=`50% ${scrollY+innerHeight/2}px`;
 sheet.classList.add('turning');
 setTimeout(()=>{root.dataset.label=next;sheet.classList.remove('turning');},half());
}
flip.addEventListener('click',swap);
// A link can open either label: #spy or #gancheop.
if(location.hash==='#spy')root.dataset.label='spy';

// The film opens in the page: as evidence footage in the file, as the feature in the poster.
const screen=document.getElementById('screen'),frame=document.getElementById('frame');
function play(t){
 frame.replaceChildren();
 const f=document.createElement('iframe');
 f.src=`https://www.youtube-nocookie.com/embed/${ID}?autoplay=1&start=${Math.floor(t)}&rel=0`;
 f.title='그게 그거야 뮤직비디오';f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;
 frame.append(f);screen.showModal();
}
document.querySelectorAll('[data-t]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();play(Number(el.dataset.t));}));
document.getElementById('close').addEventListener('click',()=>screen.close());
screen.addEventListener('close',()=>frame.replaceChildren());
