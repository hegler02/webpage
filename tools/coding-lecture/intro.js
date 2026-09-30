// Host owns navigation. This module adds one finite timeline to the active intro.
export const introSelector='[data-intro]';
const beat={word:.65,build:.7,part:.45,settle:.65};
export function directIntro(timeline,slide){
 const node=s=>slide.querySelector(s);
 timeline.fromTo(node('.intro-kicker'),{opacity:0,y:12},{opacity:1,y:0,duration:beat.word},.1)
 .fromTo(node('.intro-thought'),{opacity:0,y:24},{opacity:1,y:0,duration:beat.word},.3)
 .fromTo(node('.intro-impact'),{opacity:0,y:35,scale:.96},{opacity:1,y:0,scale:1,duration:beat.word,ease:'power3.out'},.8)
 .fromTo(node('.intro-idea'),{opacity:0,x:-35},{opacity:1,x:0,duration:beat.build},1.25)
 .fromTo(node('.intro-wire'),{opacity:0,scaleX:0},{opacity:1,scaleX:1,duration:1.4,ease:'power2.inOut'},1.55)
 .fromTo(node('.intro-app'),{opacity:0,y:50,scale:.91},{opacity:1,y:0,scale:1,duration:beat.build,ease:'power3.out'},1.9)
 .fromTo(slide.querySelectorAll('.intro-module'),{opacity:0,x:-20},{opacity:1,x:0,duration:beat.part,stagger:.24},2.4)
 .fromTo(node('.intro-button'),{opacity:0,y:14},{opacity:1,y:0,duration:beat.part},2.95)
 .fromTo(node('.intro-world'),{opacity:0,x:35},{opacity:1,x:0,duration:beat.build},3.3)
 .fromTo(node('.intro-final'),{opacity:0,y:12},{opacity:1,y:0,duration:beat.settle},3.85);
}
