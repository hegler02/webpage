export function initShare(){
  const button=document.querySelector('#share'),notice=document.querySelector('#share-status');
  const dialog=document.querySelector('#share-dialog'),link=document.querySelector('#share-link');
  const data={title:'사이 — 우리 모두 사이좋게 지내요',text:'서로 다른 두 존재가 만나 하나의 세계를 만드는 48초의 사이.',url:'https://mirinaeman.com/pages/sai/'};
  let busy=false,timer;
  for(const control of [button,document.querySelector('#home'),dialog])control.addEventListener('keydown',event=>{if(event.code==='Space'||event.code==='Enter')event.stopPropagation();});
  button.addEventListener('click',async()=>{
    if(busy)return;busy=true;button.disabled=true;clearTimeout(timer);notice.hidden=true;
    try{
      if(navigator.share){
        try{await navigator.share(data);return;}catch(error){if(error.name==='AbortError')return;}
      }
      try{
        if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(data.url);
        notice.textContent='공유 주소를 복사했습니다';notice.hidden=false;
        timer=setTimeout(()=>{notice.hidden=true;},3500);
      }catch{
        dialog.showModal();link.focus();link.select();
      }
    }finally{busy=false;button.disabled=false;}
  });
}
