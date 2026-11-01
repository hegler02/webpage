(() => {
  const header=document.querySelector('.masthead');
  const toggle=document.getElementById('menu-toggle');
  const nav=document.getElementById('main-navigation');
  const mobile=matchMedia('(max-width:700px)');
  let open=false;
  function setOpen(next,restoreFocus=false){
    open=mobile.matches&&next;
    header.dataset.menuOpen=String(open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
    nav.inert=mobile.matches&&!open;
    if(restoreFocus)toggle.focus({preventScroll:true});
  }
  document.documentElement.classList.add('has-navigation');toggle.hidden=false;setOpen(false);
  toggle.addEventListener('click',()=>setOpen(!open));
  nav.addEventListener('click',e=>{if(e.target.closest('a,button'))setOpen(false,nav.contains(document.activeElement));});
  document.addEventListener('click',e=>{if(open&&!header.contains(e.target))setOpen(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open){e.preventDefault();setOpen(false,true);}});
  mobile.addEventListener('change',()=>setOpen(false));
})();
