"use strict";
window.DRONE_PANELS={create({data,getState,navigate,record}){
  const panel=document.getElementById('panel'),body=document.getElementById('panelBody'),closeButton=document.getElementById('closePanel');
  let returnFocus=null,cleanup=null,afterClose=null;
  const dispose=()=>{cleanup?.();cleanup=null;};
  function close({destination=null,restore=true}={}){
    if(!panel.open){destination?.();return;}
    afterClose={restore:destination?false:restore};dispose();panel.close();destination?.();
  }
  function show(kind){
    const {scene}=getState(),s=data.slides[scene];if(kind==='video'&&!s.video)return;
    if(!panel.open)returnFocus=document.activeElement;
    dispose();
    const titles={evidence:'이 장의 내용은 어디에서 확인하나요?',reading:s.title,contents:`${data.slides.length}장으로 읽는 드론의 가능성`,legend:'어디까지 활용되고 있나요?',activity:'나의 드론 활용 아이디어',video:s.video?.panelTitle||'실제 활용 영상'};
    const kickers={evidence:'근거 보기',reading:'읽기 보기',contents:'목차',legend:'활용 단계',activity:'나의 아이디어',video:s.number+'장 / 공식 활용 영상'};
    document.getElementById('panelTitle').textContent=titles[kind];document.getElementById('panelKicker').textContent=kickers[kind];
    panel.classList.toggle('panel-wide',kind==='contents');panel.classList.toggle('panel-video',kind==='video');panel.dataset.kind=kind;
    if(window.DRONE_PANEL_VIEWS[kind])body.innerHTML=window.DRONE_PANEL_VIEWS[kind](s,data,scene);
    else if(kind==='activity')window.DRONE_WORKSHOP.mount(body,record);
    else if(kind==='video')cleanup=window.DRONE_VIDEO_PANEL.mount(body,s,{close:()=>close(),showEvidence:()=>show('evidence'),record});
    else throw new Error('Unknown panel '+kind);
    body.querySelector('#readingSources')?.addEventListener('click',()=>show('evidence'));
    body.querySelectorAll('[data-scene]').forEach(el=>el.addEventListener('click',()=>close({restore:false,destination:()=>navigate(Number(el.dataset.scene),0,{focus:true})})));
    if(!panel.open)panel.showModal();closeButton.focus();panel.scrollTop=0;record('panel.open',{kind});
  }
  closeButton.addEventListener('click',()=>close());
  panel.addEventListener('cancel',()=>{afterClose={restore:true};});
  panel.addEventListener('close',()=>{
    const action=afterClose||{restore:true};afterClose=null;if(panel.open)return;
    dispose();if(action.restore&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
    record('panel.closed');
  });
  panel.addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const els=[...panel.querySelectorAll('button:not([disabled]),a[href],iframe,input,textarea,select,[tabindex="0"]')].filter(el=>el.getClientRects().length);
    if(e.shiftKey&&document.activeElement===els[0]){e.preventDefault();els.at(-1)?.focus();}
    else if(!e.shiftKey&&document.activeElement===els.at(-1)){e.preventDefault();els[0]?.focus();}
  });
  return {show,close,isOpen:()=>panel.open,kind:()=>panel.dataset.kind};
}};
