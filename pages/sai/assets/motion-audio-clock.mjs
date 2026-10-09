// The media is the clock. Animation frames only repaint its current position.
export function createAudioClock({media, render, onState=()=>{}, raf=requestAnimationFrame, caf=cancelAnimationFrame}) {
  let frame=null, disposed=false;
  const paint=()=>{ if(!disposed) { render(media.currentTime); onState({paused:media.paused,ended:media.ended,time:media.currentTime}); } };
  const stop=()=>{if(frame!==null)caf(frame);frame=null;};
  const tick=()=>{frame=null;paint();if(!disposed&&!media.paused&&!media.ended)frame=raf(tick);};
  const sync=event=>{if(disposed)return;if(event?.type==='timeupdate'&&frame!==null&&!media.paused&&!media.ended)return;paint();if(media.paused||media.ended)stop();else if(frame===null)frame=raf(tick);};
  const events=['play','pause','ended','seeked','loadedmetadata','timeupdate'];
  events.forEach(name=>media.addEventListener(name,sync));
  return {
    async play(){if(disposed)throw Error('Audio clock disposed');if(media.ended)media.currentTime=0;await media.play();sync();},
    pause(){if(disposed)return;media.pause();sync();},
    seek(seconds){if(disposed)return;if(!Number.isFinite(seconds))throw Error('Finite time required');media.currentTime=Math.max(0,Math.min(seconds,Number.isFinite(media.duration)?media.duration:seconds));sync();},
    destroy(){disposed=true;stop();events.forEach(name=>media.removeEventListener(name,sync));}
  };
}
