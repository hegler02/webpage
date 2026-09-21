/* One authority for scene/beat state. No DOM or animation ownership. */
window.MessageState = (() => {
  const clamp = (value,max) => Math.min(Math.max(0,value),max);
  function parse(hash, scenes) {
    const match = /^#(?:scene-)?(\d+)(?:\.(\d+))?$/.exec(hash);
    const scene = clamp(match ? Number(match[1])-1 : 0, scenes.length-1);
    return {scene, beat:clamp(match?.[2] ? Number(match[2])-1 : 0, scenes[scene].beats-1)};
  }
  function move(state,direction,scenes) {
    const {scene,beat}=state;
    if(direction>0){
      if(beat<scenes[scene].beats-1)return {scene,beat:beat+1};
      if(scene<scenes.length-1)return {scene:scene+1,beat:0};
    }else{
      if(beat>0)return {scene,beat:beat-1};
      if(scene>0)return {scene:scene-1,beat:scenes[scene-1].beats-1};
    }
    return {...state};
  }
  const hash = state => `#scene-${state.scene+1}.${state.beat+1}`;
  return {parse,move,hash};
})();
