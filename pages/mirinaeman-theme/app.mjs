import {VIDEO_URL,CREDITS} from './config.js';
import {parseVideoId,createPlayer} from './youtube.mjs';
import {FilmStage} from './film-stage.mjs';

const $=id=>document.getElementById(id);
const clock=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const el=(tag,props={},...kids)=>{const n=Object.assign(document.createElement(tag),props);n.append(...kids);return n;};
// Scroll stays with a painting, then the last part of its length is the transition.
const HOLD=.58,DAMP=.11;

// ?v= previews any address without editing config.js.
const videoId=parseVideoId(new URLSearchParams(location.search).get('v')??VIDEO_URL);
if(VIDEO_URL&&!parseVideoId(VIDEO_URL))console.warn('config.js의 VIDEO_URL을 유튜브 주소로 읽지 못했습니다:',VIDEO_URL);

const film=await fetch('data/film.json').then(r=>r.json());
const chapters=film.chapters;
const scenes=[film.hero,...chapters];
let sections=[];
const ticks=[];

function buildScenes(){
 const host=$('scenes');
 chapters.forEach((c,n)=>{
  const copy=el('div',{className:'scene-copy'},
   el('p',{className:'label scene-time',textContent:`${clock(c.start)} · ${c.music}`}),
   el('h2',{className:'scene-title',textContent:c.title}));
  if(c.lines.length){
   const lyrics=el('ol',{className:'lyrics'});
   c.lines.forEach((l,i)=>{const b=el('button',{type:'button',className:'lyric',disabled:!videoId,textContent:l.text});b.addEventListener('click',e=>openTheatre(l.t,e));const li=el('li',{},b);li.style.setProperty('--n',i);lyrics.append(li);});
   copy.append(lyrics);
  }
  if(videoId){const b=el('button',{type:'button',className:'action scene-play',textContent:'여기부터 재생 →'});b.addEventListener('click',e=>openTheatre(c.start,e));copy.append(b);}
  const section=el('section',{className:'scene',id:`s${n+1}`},el('img',{className:'still',src:c.image,alt:'',loading:'lazy',decoding:'async',width:1280,height:720}),copy);
  section.setAttribute('aria-label',c.title);host.append(section);
  const tick=el('a',{className:'tick',href:`#s${n+1}`},el('span',{textContent:`${clock(c.start)} ${c.title}`}),el('i'));tick.setAttribute('aria-label',`${c.title}로 이동`);
  tick.addEventListener('click',e=>{e.preventDefault();section.scrollIntoView({behavior:reduced?'auto':'smooth'});});
  ticks.push(tick);$('rail').append(tick);
 });
 sections=[$('hero'),...host.children];
 for(const [k,v] of CREDITS)$('credits').append(el('div',{},el('dt',{className:'label',textContent:k}),el('dd',{textContent:v})));
 if(videoId){
  const play=$('play');play.hidden=false;play.addEventListener('click',e=>openTheatre(0,e));
  const link=$('watch');link.hidden=false;link.href=`https://www.youtube.com/watch?v=${videoId}`;
 }else $('status').hidden=false;
}

// Reading position: which scene, and how far into it, from the real layout.
function reading(){
 const y=scrollY+innerHeight*.5;let n=0;
 for(let k=0;k<sections.length;k++)if(sections[k].offsetTop<=y)n=k;
 const s=sections[n],into=clamp((y-s.offsetTop)/s.offsetHeight);
 return {n,into};
}

let stage=null,pos=0,target=0,last=0,px=0,py=0,mx=0,my=0,frameId=0;
function start(){
 try{stage=new FilmStage($('film'),scenes);}catch{$('film').hidden=true;return;}
 document.body.classList.add('has-film');
 addEventListener('resize',()=>stage.resize());stage.resize();
 if(!reduced)addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;},{passive:true});
 frameId=requestAnimationFrame(loop);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frameId);else frameId=requestAnimationFrame(loop);});
}
function loop(now){
 const {n,into}=reading();target=n+into;
 const speed=reduced?1:1-Math.pow(1-DAMP,Math.min(4,(now-last)/16.7||1));last=now;
 pos+=(target-pos)*speed;px+=(mx-px)*.05;py+=(my-py)*.05;
 const index=Math.min(scenes.length-1,Math.floor(pos)),f=pos-index,mix=index<scenes.length-1?smooth((f-HOLD)/(1-HOLD)):0;
 stage.want(index);
 stage.draw({index,mix,zoomA:1.03+f*.09,zoomB:1.03+Math.max(0,f-HOLD)*.05,par:[px*.012+(f-.5)*.008,py*.008],time:now/1000,veil:smooth((scrollY+innerHeight-document.documentElement.scrollHeight+innerHeight*.5)/(innerHeight*.5))*.6});
 frameId=requestAnimationFrame(loop);
 paintCopy();
}
// Words arrive after the transition settles and leave before the next begins.
function paintCopy(){
 const {n,into}=reading();
 sections.forEach((s,k)=>{
  const copy=s.querySelector('.hero-copy,.scene-copy');if(!copy)return;
  const show=k===n?smooth(k===0?1:into/.12)*(1-smooth((into-HOLD+.1)/.14)):0;
  copy.style.setProperty('--show',reduced?1:show.toFixed(3));
  copy.style.visibility=show<=.001&&!reduced?'hidden':'visible';
  if(k>0)s.classList.toggle('on',k===n&&into>.04&&into<HOLD);
 });
 ticks.forEach((t,k)=>t.setAttribute('aria-current',String(k===n-1)));
}

// Theatre
let player=null,poll=0,starting=false;
const bands=[];
function buildTheatre(){
 for(const c of chapters){
  const b=el('button',{type:'button',className:'time-band'});b.style.setProperty('--span',c.end-c.start);b.setAttribute('aria-label',`${c.title} ${clock(c.start)}`);
  b.addEventListener('click',()=>{player?.seekTo(c.start,true);player?.playVideo();});bands.push(b);$('time-rail').append(b);
 }
 $('close').addEventListener('click',closeTheatre);
 $('theatre').addEventListener('cancel',e=>{e.preventDefault();closeTheatre();});
}
async function openTheatre(time,event){
 if(!videoId||starting)return;
 const box=$('theatre'),x=event?.clientX??innerWidth/2,y=event?.clientY??innerHeight/2;
 box.style.setProperty('--ox',`${x}px`);box.style.setProperty('--oy',`${y}px`);
 if(!box.open){box.showModal();requestAnimationFrame(()=>requestAnimationFrame(()=>box.classList.add('open')));}
 if(player){player.seekTo(time,true);player.playVideo();return;}
 starting=true;
 const host=el('div',{id:'yt-film'});$('frame').replaceChildren(host);
 const fail=()=>{$('theatre-note').hidden=false;$('theatre-note').textContent='이 화면에서 재생할 수 없습니다. 유튜브에서 직접 봐 주세요.';};
 try{player=await createPlayer(host,videoId,{start:time,onState:track,onError:fail});}catch{fail();}
 starting=false;
}
function closeTheatre(){
 const box=$('theatre');player?.pauseVideo?.();clearInterval(poll);box.classList.remove('open');
 const done=()=>{box.close();box.removeEventListener('transitionend',done);};
 if(reduced)done();else{box.addEventListener('transitionend',done);setTimeout(()=>{if(box.open)done();},1000);}
}
// Keeps running through buffering, so the label follows a seek straight away.
function track(){clearInterval(poll);poll=setInterval(paintTheatre,200);paintTheatre();}
function paintTheatre(){
 const t=player?.getCurrentTime?.()??0;
 chapters.forEach((c,n)=>{bands[n].style.setProperty('--done',clamp((t-c.start)/(c.end-c.start)));if(t>=c.start&&t<c.end)$('theatre-chapter').textContent=`${clock(t)} · ${c.title}`;});
}

buildScenes();buildTheatre();start();paintCopy();
if(!stage)addEventListener('scroll',paintCopy,{passive:true});
document.documentElement.dataset.ready=videoId?'video':'waiting';
