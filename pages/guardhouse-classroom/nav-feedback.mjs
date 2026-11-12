import {yieldForPaint} from './render-loop.mjs';

// A pressed menu answers at once. The mark moves to it and is painted before the page starts its work,
// a line under the header runs while the new screen is still being prepared, and a second press of the same menu is not sent again meanwhile.
const WAIT='[data-busy],[data-presentation="pending"],#bay-canvas>p[role=status],.loading-spinner,.apt-spinner';
const QUIET=120,LIMIT=10000;
let pressed=null,sent=null,passing=false,line=null,quiet=null,limit=null,since=0;

// A notice that carries a button is a failure waiting for the student, not a screen still on its way.
const seen=el=>el.getClientRects().length>0&&!el.querySelector('button');
const waiting=()=>[...document.querySelectorAll(WAIT)].some(seen);
const arrived=()=>!pressed||!pressed.isConnected||(!sent&&pressed.getAttribute('aria-current')==='page');

// The line is put on the page at once and the stylesheet holds it back for a blink, so it also comes up while the page itself is too busy to run a timer.
function showLine(on){
 if(!on){if(line)line.hidden=true;return;}
 if(!line){line=document.createElement('div');line.className='nav-progress';line.setAttribute('role','progressbar');line.setAttribute('aria-label','화면을 준비하고 있습니다');(document.querySelector('.site-top')??document.body).append(line);}
 line.hidden=false;
}
function finish(){
 clearTimeout(quiet);clearTimeout(limit);quiet=limit=null;since=0;
 if(pressed){pressed.removeAttribute('aria-busy');pressed.closest('nav')?.removeAttribute('data-pending');pressed=null;}
 sent=null;showLine(false);
}
function check(){
 const busy=waiting();
 if(!pressed&&!busy){if(since)finish();return;}
 if(!since){since=performance.now();limit=setTimeout(finish,LIMIT);}
 showLine(performance.now()-since<LIMIT);
 if(arrived()&&!busy){quiet??=setTimeout(()=>{quiet=null;if(arrived()&&!waiting())finish();else check();},QUIET);}
 else{clearTimeout(quiet);quiet=null;}
}
function mark(button){
 if(pressed&&pressed!==button)pressed.removeAttribute('aria-busy');
 clearTimeout(limit);clearTimeout(quiet);quiet=null;
 pressed=button;since=performance.now();limit=setTimeout(finish,LIMIT);
 button.setAttribute('aria-busy','true');button.closest('nav')?.setAttribute('data-pending','');
 showLine(true);
}

addEventListener('click',event=>{
 if(passing)return;
 const button=event.target.closest?.('#learning-nav button');if(!button||button.disabled)return;
 event.preventDefault();event.stopImmediatePropagation();
 if(button===pressed)return;
 mark(button);sent=button;
 yieldForPaint().then(()=>{
  if(sent!==button)return;
  sent=null;passing=true;try{button.click();}finally{passing=false;}
  check();
 });
},true);

new MutationObserver(check).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-current','data-busy','data-presentation','hidden']});
