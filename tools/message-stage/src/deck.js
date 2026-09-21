/* Presenter commands -> state -> settled DOM -> optional motion. */
(() => {
  const config=JSON.parse(document.getElementById('stage-config').textContent);
  const scenes=[...document.querySelectorAll('.scene')];
  const $=id=>document.getElementById(id);
  const ui={stage:$('stage'),reader:$('reading'),previous:$('previous'),next:$('next'),select:$('scene-select'),beat:$('beat-status'),dots:$('beat-dots'),read:$('read-toggle'),motion:$('motion-toggle'),status:$('announcement')};
  let state=MessageState.parse(location.hash,config.scenes),reading=false,motion=true;
  const same=(a,b)=>a.scene===b.scene&&a.beat===b.beat;
  function paint(){
    scenes.forEach((scene,i)=>{
      const active=i===state.scene;
      scene.classList.toggle('is-active',active);scene.inert=!active;scene.setAttribute('aria-hidden',String(!active));
      if(!active)return;
      const beat=state.beat;scene.dataset.beat=beat;scene.dataset.settled='false';
      scene.querySelectorAll('[data-from],[data-until],[data-at]').forEach(node=>{
        const show=(!node.hasAttribute('data-from')||beat>=Number(node.dataset.from))&&(!node.hasAttribute('data-until')||beat<Number(node.dataset.until))&&(!node.hasAttribute('data-at')||beat===Number(node.dataset.at));
        node.classList.toggle('is-off',!show);node.setAttribute('aria-hidden',String(!show));
      });
      scene.querySelectorAll('[data-level]').forEach(node=>node.classList.toggle('is-focus',beat===Number(node.dataset.level)));
      scene.querySelectorAll('[data-index]').forEach(node=>node.classList.toggle('is-focus',beat===Number(node.dataset.index)));
      scene.querySelectorAll('.judgment-questions .item').forEach((node,n)=>node.classList.toggle('is-focus',n===beat-1));
    });
    ui.select.value=String(state.scene);
    const count=config.scenes[state.scene].beats;
    ui.beat.textContent=`${state.beat+1} / ${count}`;
    ui.dots.replaceChildren(...Array.from({length:count},(_,i)=>{const dot=document.createElement('i');dot.className=i===state.beat?'current':'';return dot;}));
    ui.previous.disabled=state.scene===0&&state.beat===0;
    ui.next.disabled=state.scene===scenes.length-1&&state.beat===count-1;
    ui.status.textContent=`${state.scene+1}장, ${state.beat+1}단계. ${config.scenes[state.scene].notes[state.beat]}`;
  }
  function go(next,{animate=true,history=true,direction=1}={}){
    if(same(next,state))return;
    const old=scenes.find(scene=>scene.classList.contains('is-active'));state=next;
    if(history)window.history.replaceState(null,'',MessageState.hash(state));
    if(animate&&!reading)MessageMotion.transition(old,scenes[state.scene],paint,config,direction);
    else{MessageMotion.settle();paint();}
  }
  function advance(direction){go(MessageState.move(state,direction,config.scenes),{direction});}
  function setReading(value){
    MessageMotion.settle();reading=value;
    document.body.classList.toggle('reading',reading);ui.read.setAttribute('aria-pressed',String(reading));ui.read.textContent=reading?'발표로 돌아가기':'원문 읽기';
    if(reading){ui.reader.inert=false;ui.reader.removeAttribute('aria-hidden');ui.stage.inert=true;ui.reader.focus();window.scrollTo(0,0);}
    else{ui.reader.inert=true;ui.reader.setAttribute('aria-hidden','true');ui.stage.inert=false;paint();window.scrollTo(0,0);ui.stage.focus();}
  }
  ui.previous.addEventListener('click',()=>advance(-1));ui.next.addEventListener('click',()=>advance(1));
  ui.select.addEventListener('change',()=>go({scene:Number(ui.select.value),beat:0}));
  ui.stage.addEventListener('click',event=>{if(!event.target.closest('button,a,input,select')&&!window.getSelection()?.toString())advance(1);});
  ui.read.addEventListener('click',()=>setReading(!reading));$('start').addEventListener('click',()=>setReading(false));
  document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();setReading(true);});
  ui.motion.addEventListener('click',()=>{motion=!motion;MessageMotion.setEnabled(motion);ui.motion.setAttribute('aria-pressed',String(motion));ui.motion.textContent=motion?'모션 켜짐':'모션 꺼짐';});
  document.addEventListener('keydown',event=>{
    if(event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||document.querySelector('dialog[open]'))return;
    if(event.target.closest('input,textarea,select,[contenteditable]'))return;
    if(event.key===' '&&event.target.closest('button,a'))return;
    if(event.key==='Escape'&&reading){setReading(false);return;}
    if(reading)return;
    const actions={ArrowRight:()=>advance(1),ArrowLeft:()=>advance(-1),PageDown:()=>advance(1),PageUp:()=>advance(-1),' ':()=>advance(1),Home:()=>go({scene:0,beat:0}),End:()=>go({scene:scenes.length-1,beat:config.scenes.at(-1).beats-1})};
    if(actions[event.key]){event.preventDefault();actions[event.key]();}
  });
  let touch=null;
  ui.stage.addEventListener('touchstart',event=>{if(event.touches.length===1)touch={x:event.touches[0].clientX,y:event.touches[0].clientY};},{passive:true});
  ui.stage.addEventListener('touchend',event=>{if(!touch)return;const end=event.changedTouches[0],dx=end.clientX-touch.x,dy=end.clientY-touch.y;touch=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){event.preventDefault();advance(dx<0?1:-1);}},{passive:false});
  addEventListener('hashchange',()=>go(MessageState.parse(location.hash,config.scenes),{history:false}));
  addEventListener('resize',()=>MessageMotion.settle());
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{ui.status.textContent='이 환경에서는 전체 화면을 사용할 수 없습니다.';}});
  document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'전체 화면 종료':'전체 화면';MessageMotion.settle();});
  $('share').addEventListener('click',async()=>{
    if(navigator.share){try{await navigator.share({title:config.title,url:config.canonical});return;}catch(error){if(error.name==='AbortError')return;}}
    try{await navigator.clipboard.writeText(config.canonical);ui.status.textContent='페이지 주소를 복사했습니다.';$('share').textContent='복사됨';}
    catch{$('share-url').value=config.canonical;$('share-dialog').showModal();$('share-url').select();}
  });
  $('close-share').addEventListener('click',()=>$('share-dialog').close());
  document.body.classList.add('enhanced');paint();ui.reader.inert=true;ui.reader.setAttribute('aria-hidden','true');
  window.history.replaceState(null,'',MessageState.hash(state));
  if(matchMedia('(max-width:900px) and (max-height:520px)').matches)setReading(true);
})();
