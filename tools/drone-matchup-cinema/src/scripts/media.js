(() => {
  const data=JSON.parse(document.getElementById('site-data').textContent);
  const film=document.getElementById('film');
  const start=document.getElementById('film-start');
  const retry=document.getElementById('retry');
  const status=document.getElementById('media-status');
  let attached=false, state='idle', requestedTime=0;
  const labels={idle:'재생 버튼을 누르면 영상을 불러옵니다.',loading:'영상을 불러오는 중입니다.',ready:'재생 준비가 됐습니다.',playing:'재생 중',paused:'일시정지',ended:'감상이 끝났습니다.',error:'영상을 불러오지 못했습니다. 다시 불러오기를 눌러주세요.'};
  const set = next => {state=next;film.dataset.state=next;status.textContent=labels[next];retry.hidden=next!=='error';};
  function seek(){if(film.readyState>=1){film.currentTime=Math.min(requestedTime,film.duration-.1);requestedTime=0;}}
  async function activate(time=0){
    requestedTime=time;
    if(state==='error'){film.removeAttribute('src');attached=false;}
    set('loading');film.hidden=false;film.controls=true;start.hidden=true;
    if(!attached){film.src=data.film.src;attached=true;film.load();}
    seek();
    try{await film.play();}catch(err){if(err.name==='NotAllowedError'){set('ready');film.focus();}else if(err.name!=='AbortError')set('error');}
  }
  start.addEventListener('click',()=>activate());
  retry.addEventListener('click',()=>activate());
  film.addEventListener('loadedmetadata',seek);
  ['loadeddata','canplay','canplaythrough'].forEach(name=>film.addEventListener(name,()=>{
    if(state==='loading'&&film.paused) set('ready');
  }));
  film.addEventListener('playing',()=>set('playing'));
  film.addEventListener('waiting',()=>{if(!['ended','error'].includes(state))set('loading');});
  film.addEventListener('stalled',()=>{if(!film.paused&&!['ended','error'].includes(state))set('loading');});
  film.addEventListener('pause',()=>{if(!['ended','error'].includes(state)&&!film.ended)set('paused');});
  film.addEventListener('ended',()=>{
    const restoreFocus=document.activeElement===film;
    set('ended');film.hidden=true;film.controls=false;start.hidden=false;
    if(document.fullscreenElement===film)document.exitFullscreen().catch(()=>{});
    if(film.webkitDisplayingFullscreen&&typeof film.webkitExitFullscreen==='function')film.webkitExitFullscreen();
    if(restoreFocus)start.focus({preventScroll:true});
  });
  film.addEventListener('error',()=>set('error'));
  document.querySelectorAll('.scene-jump').forEach(button=>button.addEventListener('click',()=>{
    document.dispatchEvent(new CustomEvent('film:seek-requested'));activate(Number(button.dataset.time));
  }));
  addEventListener('pagehide',()=>{if(!film.paused)film.pause();});
})();
