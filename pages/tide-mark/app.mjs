import {parseVideoId,createPlayer} from './youtube.mjs';
import {YOUTUBE} from './config.js';
// Tide Mark page. The first screen is a steamed pane you wipe with a finger; the steam slowly comes back.
// Below it, scrolling is the ebb: each paragraph clears as the water leaves it, and a salt line stays under it.
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();

function steam(){
 const cv=document.getElementById('steam'),img=document.querySelector('.hero img'),x=cv.getContext('2d'),ghost=document.createElement('canvas');
 let w=0,h=0,dpr=1,last=null,cleared=false;
 // the room seen through steam: the painting blurred, under a pale veil
 const fog=c=>{const s=Math.max(w/img.naturalWidth,h/img.naturalHeight),iw=img.naturalWidth*s,ih=img.naturalHeight*s;
  c.save();c.filter='blur(14px)';c.drawImage(img,(w-iw)*.3,(h-ih)/2,iw,ih);c.filter='none';c.globalAlpha=.42;c.fillStyle=css('--fog');c.fillRect(0,0,w,h);c.restore();};
 const size=()=>{dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=ghost.width=w*dpr;cv.height=ghost.height=h*dpr;
  for(const c of [x,ghost.getContext('2d')])c.setTransform(dpr,0,0,dpr,0,0);fog(x);fog(ghost.getContext('2d'));};
 const drips=[];
 // a finger leaves a soft-edged clear stroke; now and then water gathers and runs down from it
 const wipe=(a,b)=>{const lw=Math.max(34,w*.035);x.save();x.globalCompositeOperation='destination-out';x.lineCap='round';x.lineWidth=lw;x.shadowColor='#000';x.shadowBlur=lw*.45;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke();x.restore();
  if(Math.random()<.08&&drips.length<40)drips.push({x:b[0]+(Math.random()-.5)*lw*.6,y:b[1]+lw*.45,left:60+Math.random()*160,v:.4+Math.random()*.9,r:1.6+Math.random()*1.8});};
 const run=()=>{x.save();x.globalCompositeOperation='destination-out';for(const d of drips){if(d.left<=0)continue;const s=Math.min(d.v,d.left);x.lineWidth=d.r*2;x.lineCap='round';x.beginPath();x.moveTo(d.x,d.y);d.y+=s;d.left-=s;x.lineTo(d.x+Math.sin(d.y*.05)*.4,d.y);x.stroke();}x.restore();};
 const at=e=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
 cv.addEventListener('pointermove',e=>{const p=at(e);if(last)wipe(last,p);last=p;});
 for(const n of ['pointerleave','pointerup','pointercancel'])cv.addEventListener(n,()=>last=null);
 const back=()=>{if(cleared)return;run();x.save();x.setTransform(1,0,0,1,0,0);x.globalAlpha=.012;x.drawImage(ghost,0,0);x.restore();requestAnimationFrame(back);};
 document.getElementById('clear').addEventListener('click',()=>{cleared=true;cv.animate([{opacity:1},{opacity:0}],{duration:1400,easing:'ease-out',fill:'forwards'});});
 const go=()=>{size();addEventListener('resize',size);requestAnimationFrame(back);};
 img.complete&&img.naturalWidth?go():img.addEventListener('load',go,{once:true});
}

function ebb(){
 const ps=[...document.querySelectorAll('.story > p, .stanza')],NS='http://www.w3.org/2000/svg';
 ps.forEach((p,n)=>{p.classList.add('unit');const s=document.createElementNS(NS,'svg'),path=document.createElementNS(NS,'path');s.setAttribute('viewBox','0 0 400 12');s.setAttribute('preserveAspectRatio','none');s.setAttribute('aria-hidden','true');
  let d='M0 6';for(let k=1;k<=40;k++)d+=` L${k*10} ${(6+Math.sin(k*.7+n)*2.4+Math.sin(k*2.3)).toFixed(2)}`;path.setAttribute('d',d);s.append(path);p.append(s);});
 if(reduce){ps.forEach(p=>p.classList.add('clear'));return;}
 // a paragraph clears once the water line (60% down the screen) has passed it, and stays clear
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('clear');io.unobserve(e.target);}}),{rootMargin:'0px 0px -40% 0px'});
 ps.forEach(p=>io.observe(p));
}

// The film opens only when pressed; until the upload exists the screen says it is coming.
function film(){
 const id=parseVideoId(YOUTUBE);if(!id)return;
 const play=document.getElementById('play'),screen=document.getElementById('screen');document.getElementById('soon').hidden=true;play.hidden=false;
 play.addEventListener('click',async()=>{play.hidden=true;const host=document.createElement('div');screen.append(host);try{await createPlayer(host,id);}catch{play.hidden=false;}});
}

if(!reduce)steam();
ebb();
film();
