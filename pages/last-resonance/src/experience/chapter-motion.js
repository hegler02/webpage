window.mountChapterMotion=async function(root,{config,script,emit}){
  await script(config.gsap);await script(config.scrollTrigger);
  const {gsap,ScrollTrigger}=window;gsap.registerPlugin(ScrollTrigger);
  const motion=config.motion,tweens=[];
  const context=gsap.context(()=>{
    root.querySelectorAll('[data-motion-caption]').forEach(caption=>{
      const tween=gsap.fromTo(caption,{y:motion.distance,opacity:.65},{y:0,opacity:1,duration:motion.long,ease:motion.ease,immediateRender:false,scrollTrigger:{trigger:caption,start:'top 88%',end:'bottom 25%',toggleActions:'play pause resume pause'}});tweens.push(tween);
    });
  },root);
  let paused=true;
  return {
    pause(reason){if(paused)return;paused=true;tweens.forEach(t=>{t.pause();t.scrollTrigger?.disable(false)});emit('gsap:pause',reason)},
    resume(reason){if(!paused)return;paused=false;tweens.forEach(t=>{t.scrollTrigger?.enable(false);const r=t.targets()[0].getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)t.resume()});emit('gsap:resume',reason)},
    destroy(reason){context.revert();emit('gsap:destroy',reason)}
  };
};
