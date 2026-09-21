/* Commands own state. This renderer is the sole owner of settled classes and ARIA. */
(()=>{
 const config=JSON.parse(document.getElementById('stage-config').textContent),scenes=[...document.querySelectorAll('.scene')];
 const $=id=>document.getElementById(id),ui={stage:$('stage'),reader:$('reading'),prev:$('previous'),next:$('next'),select:$('scene-select'),beat:$('beat-status'),read:$('read-toggle'),motion:$('motion-toggle'),status:$('announcement')};
 let state=MessageState.parse(location.hash,config.scenes),reading=false,motion=true;
 const same=(a,b)=>a.scene===b.scene&&a.beat===b.beat;
 function paint(){
  scenes.forEach((s,i)=>{
   const active=i===state.scene;s.classList.toggle('is-active',active);s.inert=!active;s.setAttribute('aria-hidden',String(!active));if(!active)return;
   s.dataset.beat=state.beat;s.dataset.settled='false';
   s.querySelectorAll('[data-step]').forEach(n=>{const k=Number(n.dataset.step);n.classList.toggle('active',k===state.beat);n.classList.toggle('past',k<state.beat);n.classList.toggle('future',k>state.beat);n.setAttribute('aria-current',k===state.beat?'step':'false');if(n.classList.contains('chain-node'))n.setAttribute('aria-hidden',String(k>state.beat));});
   s.querySelectorAll('[data-at]').forEach(n=>{const active=Number(n.dataset.at)===state.beat;n.classList.toggle('active',active);n.hidden=!active;});
  });
  ui.select.value=state.scene;const data=config.scenes[state.scene];ui.beat.textContent=`${state.beat+1} / ${data.beats} 단계`;
  ui.prev.disabled=state.scene===0&&state.beat===0;ui.next.disabled=state.scene===scenes.length-1&&state.beat===data.beats-1;
  const before=config.scenes.slice(0,state.scene).reduce((a,s)=>a+s.beats,0),total=config.scenes.reduce((a,s)=>a+s.beats,0);document.documentElement.style.setProperty('--progress',`${(before+state.beat+1)/total*100}%`);
  ui.status.textContent=`${state.scene+1}장. ${data.steps[state.beat].sentence} ${data.steps[state.beat].relation}. ${data.steps[state.beat].result}`;
 }
 function go(next,{animate=true,history=true,direction=1}={}){if(same(next,state))return;const previous=scenes.find(s=>s.classList.contains('is-active'));state=next;if(history&&location.protocol!=='file:')window.history.replaceState(null,'',MessageState.hash(state));if(animate&&!reading)ChainMotion.transition(previous,scenes[state.scene],paint,config,direction);else{ChainMotion.settle();paint();ChainMotion.settleDrawing(scenes[state.scene]);}}
 const advance=d=>go(MessageState.move(state,d,config.scenes),{direction:d});
 function read(v){ChainMotion.settle();reading=v;paint();ChainMotion.settleDrawing(scenes[state.scene]);document.body.classList.toggle('reading',v);ui.read.textContent=v?'발표로 돌아가기':'원문 읽기';ui.read.setAttribute('aria-pressed',String(v));ui.reader.inert=!v;ui.reader.setAttribute('aria-hidden',String(!v));ui.stage.inert=v;window.scrollTo(0,0);(v?ui.reader:ui.stage).focus();}
 ui.prev.addEventListener('click',()=>advance(-1));ui.next.addEventListener('click',()=>advance(1));ui.select.addEventListener('change',()=>go({scene:Number(ui.select.value),beat:0}));
 ui.stage.addEventListener('click',e=>{if(!e.target.closest('button,a,input,select')&&!getSelection()?.toString())advance(1);});
 ui.read.addEventListener('click',()=>read(!reading));$('start').addEventListener('click',()=>read(false));document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();read(true);});
 ui.motion.addEventListener('click',()=>{motion=!motion;ChainMotion.setEnabled(motion);paint();ChainMotion.settleDrawing(scenes[state.scene]);ui.motion.textContent=motion?'모션 켜짐':'모션 꺼짐';ui.motion.setAttribute('aria-pressed',String(motion));});
 document.addEventListener('keydown',e=>{if(e.defaultPrevented||e.repeat||e.altKey||e.ctrlKey||e.metaKey||document.querySelector('dialog[open]')||e.target.closest('input,textarea,select,[contenteditable]'))return;if(e.key===' '&&e.target.closest('button,a'))return;if(e.key==='Escape'&&reading){read(false);return;}if(reading)return;const a={ArrowRight:()=>advance(1),ArrowLeft:()=>advance(-1),PageDown:()=>advance(1),PageUp:()=>advance(-1),' ':()=>advance(1),Home:()=>go({scene:0,beat:0}),End:()=>go({scene:scenes.length-1,beat:config.scenes.at(-1).beats-1})};if(a[e.key]){e.preventDefault();a[e.key]();}});
 let touch=null;ui.stage.addEventListener('touchstart',e=>{if(e.touches.length===1&&!e.target.closest('a,button,select'))touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});ui.stage.addEventListener('touchend',e=>{if(!touch)return;const q=e.changedTouches[0],x=q.clientX-touch.x,y=q.clientY-touch.y;touch=null;if(Math.abs(x)>config.motion.swipeDistance&&Math.abs(x)>Math.abs(y)*config.motion.swipeRatio){e.preventDefault();advance(x<0?1:-1);}},{passive:false});
 function recover(){ChainMotion.settle();paint();ChainMotion.settleDrawing(scenes[state.scene]);}
 addEventListener('hashchange',()=>go(MessageState.parse(location.hash,config.scenes),{history:false}));addEventListener('resize',recover);ChainMotion.reduced.addEventListener('change',recover);document.addEventListener('visibilitychange',()=>{if(document.hidden)ChainMotion.pause();else recover();});
 $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{ui.status.textContent='이 환경에서는 전체 화면을 사용할 수 없습니다.';}});document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'전체 화면 종료':'전체 화면';recover();});
 $('share').addEventListener('click',async()=>{if(navigator.share){try{await navigator.share({title:config.title,url:config.canonical});return;}catch(e){if(e.name==='AbortError')return;}}try{await navigator.clipboard.writeText(config.canonical);ui.status.textContent='페이지 주소를 복사했습니다.';$('share').textContent='복사됨';}catch{$('share-url').value=config.canonical;$('share-dialog').showModal();$('share-url').select();}});$('close-share').addEventListener('click',()=>$('share-dialog').close());
 document.body.classList.add('enhanced');paint();ChainMotion.settleDrawing(scenes[state.scene]);ui.reader.inert=true;ui.reader.setAttribute('aria-hidden','true');if(location.protocol!=='file:')window.history.replaceState(null,'',MessageState.hash(state));if(matchMedia('(max-height:520px)').matches)read(true);
})();
