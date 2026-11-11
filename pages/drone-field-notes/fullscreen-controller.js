"use strict";
window.DRONE_FULLSCREEN=(()=>{
 function bind({button,notice,onResize}){
  const label=button.querySelector('span'),icon=button.querySelector('path');
  const paths={enter:'M9 3H3v6 M15 3h6v6 M3 15v6h6 M21 15v6h-6',exit:'M3 9h6V3 M15 3v6h6 M3 15h6v6 M15 21v-6h6'};
  const render=()=>{
   const active=!!document.fullscreenElement,text=active?'전체 화면 종료':'전체 화면';
   label.textContent=text;button.setAttribute('aria-label',text);button.setAttribute('aria-pressed',String(active));
   icon.setAttribute('d',active?paths.exit:paths.enter);
   notice.hidden=!active;notice.textContent=active?'전체 화면으로 보는 중 · Esc 키로 종료':'';
   onResize();
  };
  button.addEventListener('click',async()=>{
   try{
    if(document.fullscreenElement)await document.exitFullscreen();
    else if(typeof document.documentElement.requestFullscreen==='function')await document.documentElement.requestFullscreen();
    else throw new Error('unsupported');
   }catch(error){
    notice.hidden=false;notice.textContent=error.message==='unsupported'?'이 브라우저에서는 메뉴의 전체 화면 기능을 이용해 주세요.':'브라우저가 전체 화면 요청을 차단했습니다. 이 버튼을 다시 누르거나 브라우저 메뉴에서 전체 화면을 선택하세요.';
   }
  });
  document.addEventListener('keydown',event=>{
   if(event.key==='Escape'&&document.fullscreenElement&&!document.querySelector('dialog[open]')){
    document.exitFullscreen().catch(()=>render());
   }
  });
  document.addEventListener('fullscreenchange',render);render();
 }
 return {bind};
})();
