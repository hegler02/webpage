import {createCinemaRenderer} from './cinema-v2.mjs';
import {createAudioClock} from './motion-audio-clock.mjs';
const canvas=document.querySelector('#screen'),ctx=canvas.getContext('2d'),media=document.querySelector('#music'),play=document.querySelector('#play'),progress=document.querySelector('#progress'),cover=document.querySelector('#cover'),status=document.querySelector('#status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const images=await Promise.all([1,2,3,4,5].map(n=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=`media/portrait-${n}.jpg`;}))).catch(()=>{status.textContent='사진을 불러오지 못했습니다. 새로고침해 주세요.';return [];});
await document.fonts.ready;
const renderCinema=createCinemaRenderer(canvas,images,{reduced});
let last=0;
function draw(t){if(!images.length)return;last=t;renderCinema(t,{poster:!cover.hidden});}
const fmt=t=>`00:${String(Math.floor(t||0)).padStart(2,'0')}`;
const clock=createAudioClock({media,render:draw,onState:s=>{progress.value=s.time;document.querySelector('#time').textContent=`${fmt(s.time)} / 00:48`;play.textContent=s.paused?'▶':'Ⅱ';play.setAttribute('aria-label',s.paused?'재생':'일시정지');if(s.ended){play.setAttribute('aria-label','다시 재생');status.textContent='다시 재생하거나 아래에서 원본 사진을 감상할 수 있습니다.';}}});
async function toggle(){try{if(media.paused){cover.hidden=true;await clock.play();status.textContent='';}else clock.pause();}catch(e){status.textContent='재생하지 못했습니다. 재생 버튼을 다시 눌러 주세요.';}}
play.onclick=toggle;document.querySelector('#start').onclick=toggle;progress.oninput=()=>{cover.hidden=true;clock.seek(+progress.value);};document.querySelector('#sound').onclick=e=>{media.muted=!media.muted;e.currentTarget.textContent=media.muted?'소리 꺼짐':'소리 켜짐';e.currentTarget.setAttribute('aria-label',media.muted?'음소거 해제':'음소거');};document.querySelector('#full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.cinema').requestFullscreen();}catch{status.textContent='이 환경에서는 전체 화면을 지원하지 않습니다.';}};
media.addEventListener('error',()=>status.textContent='음원을 불러오지 못했습니다.');new ResizeObserver(()=>draw(last)).observe(canvas);if(images.length){play.disabled=false;document.querySelector('#start').disabled=false;draw(2.8);status.textContent='소리와 함께 감상해 주세요.';}window.addEventListener('pagehide',()=>{clock.pause();clock.destroy();});
