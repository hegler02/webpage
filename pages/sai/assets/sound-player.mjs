import {createAudioClock} from './motion-audio-clock.mjs';

export const track=Object.freeze({playback:Object.freeze({src:'assets/sai-taeguk-slow-score.mp3',mime:'audio/mpeg'}),provenance:'Original procedural score with cosmic turns; evidence/slow-taeguk.mjs'});
export function mediaStatus(state,event,paused=true){
  if(event==='play-intent')return 'loading';
  if(event==='autoplay-blocked')return 'paused';
  if(event==='error')return 'error';
  if(state==='error')return state;
  if(event==='playing')return 'playing';
  if(event==='waiting'||event==='stalled')return state==='playing'||state==='loading'?'buffering':state;
  if(event==='pause')return state==='ended'?'ended':'paused';
  if(event==='ended')return 'ended';
  if(event==='canplay'||event==='loadedmetadata')return ['idle','paused'].includes(state)&&paused?'paused':state;
  return state;
}

export function createSoundPlayer({render,onStatus}){
  const media=new Audio();media.preload='none';
  let active=false,status='idle',initialSeek=null,wanted=false,attempt=0,ready=Promise.resolve();
  const notify=event=>{status=mediaStatus(status,event,media.paused);onStatus({status,muted:media.muted,active});};
  media.addEventListener('canplay',()=>{if(initialSeek!==null){media.currentTime=initialSeek;initialSeek=null;}});
  const clock=createAudioClock({media,render:t=>{if(active&&initialSeek===null)render(t);}});
  for(const event of ['playing','pause','ended','waiting','stalled','loadedmetadata','canplay','error'])media.addEventListener(event,()=>notify(event));
  async function play(){
    wanted=true;const token=++attempt;notify('play-intent');
    try{await ready;if(token!==attempt||!wanted)return;await clock.play();}catch(error){if(token===attempt&&wanted){media.pause();notify(error.name==='NotAllowedError'?'autoplay-blocked':'error');}}
  }
  return {
    get active(){return active;},
    get status(){return status;},
    get media(){return media;},
    enable(t,shouldPlay){
      active=true;media.muted=false;
      if(!media.getAttribute('src')||status==='error'){
        initialSeek=t;
        ready=new Promise((resolve,reject)=>{
          let timer;
          const cleanup=()=>{clearTimeout(timer);media.removeEventListener('canplay',loaded);media.removeEventListener('error',failed);};
          const loaded=()=>{cleanup();resolve();};
          const failed=()=>{cleanup();reject(new Error('Audio unavailable'));};
          media.addEventListener('canplay',loaded);media.addEventListener('error',failed);
          timer=setTimeout(failed,15000);
        });
        ready.catch(()=>{});
        media.src=track.playback.src;media.preload='auto';media.load();
      }else clock.seek(t);
      if(shouldPlay)void play();else notify('pause');
    },
    toggleMute(){media.muted=!media.muted;onStatus({status,muted:media.muted,active});},
    play,
    pause(){wanted=false;attempt++;clock.pause();notify('pause');},
    seek(t){if(initialSeek!==null)initialSeek=t;else clock.seek(t);},
    destroy(){wanted=false;attempt++;clock.destroy();media.pause();media.removeAttribute('src');media.load();}
  };
}
