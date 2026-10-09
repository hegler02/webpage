/* Host-owned, seekable motion adapter. No scroll, DOM navigation, clocks or globals. */
function createMotionAdapter({duration,seek,fallback=()=>{},dispose=()=>{},reduced=false,holdForProgress=p=>p}) {
  if (!(duration>0) || typeof seek!=='function') throw new TypeError('duration and seek required');
  let pending=0,paused=false,dead=false,failed=false;
  const clamp=p=>Math.max(0,Math.min(1,p));
  function paint(){
    if(dead||paused||failed)return;
    try{seek((reduced?clamp(holdForProgress(pending)):pending)*duration);}
    catch(error){failed=true;fallback(error);}
  }
  return {
    setProgress(progress){if(dead)return;if(!Number.isFinite(progress))throw new TypeError('finite progress required');pending=clamp(progress);paint();},
    pause(){paused=true;},
    resume(){if(dead)return;paused=false;paint();},
    setReduced(value){reduced=Boolean(value);paint();},
    fallback(error){if(dead||failed)return;failed=true;fallback(error);},
    destroy(){if(dead)return;dead=true;dispose();},
    getState(){return{progress:pending,paused,destroyed:dead,failed};}
  };
}
if(typeof module!=='undefined')module.exports={createMotionAdapter};
