(function (global) {
  'use strict';
  function transition(state,event,media) {
    if(event==='intent') return 'loading';
    if(event==='error') return 'error';
    if(state==='error') return state;
    if(event==='ended') return 'ended';
    if(event==='playing') return 'playing';
    if(event==='pause') return media.ended?'ended':'paused';
    if(event==='waiting'||event==='stalled') return media.paused?state:'loading';
    if(['canplay','loadedmetadata','loadeddata'].includes(event)) {
      if(state==='ended') return state;
      return media.paused && state==='loading'?'ready':state;
    }
    return state;
  }
  global.resonancePlaybackTransition=transition;
  if(typeof document==='undefined')return;
  const audio=document.querySelector('#audio'), dock=document.querySelector('#player-dock');
  const status=document.querySelector('#playback-status'),error=document.querySelector('#playback-error');
  const invite=document.querySelector('#listen-button'),close=document.querySelector('#close-player');
  const labels={idle:'준비',loading:'불러오는 중',ready:'재생 준비',playing:'재생 중',paused:'일시정지',ended:'재생 완료',error:'재생 오류'};
  let state='idle'; const trace=[];
  function update(event){state=transition(state,event,audio);status.textContent=labels[state];error.hidden=state!=='error';trace.push({event,state,paused:audio.paused,ended:audio.ended,time:audio.currentTime});if(trace.length>50)trace.shift();audio.dataset.state=state;}
  async function play(){dock.hidden=false;document.body.dataset.playerOpen='true';invite.hidden=true;update('intent');if(!audio.getAttribute('src'))audio.src=global.RESONANCE.track.src;if(audio.error)audio.load();try{await audio.play()}catch(e){update('error');}}
  ['playing','pause','waiting','stalled','ended','error','canplay','loadedmetadata','loadeddata'].forEach(event=>audio.addEventListener(event,()=>update(event)));
  invite.addEventListener('click',play);document.querySelector('#retry-play').addEventListener('click',play);
  close.addEventListener('click',()=>{audio.pause();dock.hidden=true;invite.hidden=false;delete document.body.dataset.playerOpen;invite.focus({preventScroll:true});});
  global.resonancePlaybackTrace=trace;
})(globalThis);
